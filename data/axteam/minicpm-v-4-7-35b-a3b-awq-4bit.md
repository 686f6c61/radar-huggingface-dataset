# axteam/MiniCPM-V-4.7-35B-A3B-AWQ-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal (image-text-to-text) de arquitectura Mixture of Experts (MoE) construido sobre un backbone tipo Qwen3.5-MoE, desarrollado por OpenBMB. El checkpoint aqui descrito es una cuantizacion AWQ INT4 (W4A16) realizada por axteam, pensada especificamente para servir el modelo con vLLM. El modelo procesa imagenes y texto y genera respuestas conversacionales, lo que lo situa en la categoria de modelos vision-language de gran escala.

La relevancia de esta ficha concreta reside en la cuantizacion: reduce el peso en disco a aproximadamente 22,6 GB frente a los 68 GB del repositorio original en BF16, manteniendo segun el autor un 100,0% de recuperacion media en los benchmarks medidos respecto al original. Esto hace viable el despliegue en GPUs de gama alta consumer y profesional, algo inviable con los pesos completos.

El checkpoint tiene 6.976.317.084 parametros almacenados en safetensors (cifra que refleja el empaquetado cuantizado, no el total del modelo base), licencia Apache-2.0 y formato compressed-tensors `pack-quantized`. La revision 2026-11-01 corrige un problema de enrutamiento del router MoE presente en subidas anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone Qwen3.5-MoE) con torre de vision y multimodal; atencion incluye linear-attention |
| Parametros totales | 6.976.317.084 en safetensors (checkpoint cuantizado); total del modelo base no disponible |
| Parametros activos | no disponible (modelo base etiquetado A3B, valor exacto no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimetricos, grupo 32, activaciones BF16); el autor compara tambien FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4 |
| Idiomas soportados | no disponible (evaluacion interna en ingles y coreano; benchmarks KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) sobre un backbone Qwen3.5-MoE, que combina proyecciones de atencion (incluida linear-attention) con capas MoE/MLP. Incluye una torre de vision y un modulo de fusion vision-texto (vision-text merger), ademas de routers MoE (`mlp.gate` y `shared_expert_gate`). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada.

La cuantizacion es post-entrenamiento (PTQ), sin reentrenamiento, con 256 muestras de calibracion. Se mantienen en BF16 la torre de vision, el merger vision-texto, los embeddings de tokens, la LM head, todas las RMSNorms y los routers MoE (aproximadamente el 5% de los parametros de esta build); se cuantizan las proyecciones de atencion (incluida linear-attention) y de MoE/MLP. La revision 2026-11-01 reconstruyo los ficheros para compensar el router MoE y el gate del experto compartido durante el suavizado AWQ, y para excluir del normalizado de escala los canales con ganancia de norma cero, preservando la precision BF16 de las normas en las capas 2-5. El tokenizer y el `chat_template` son identicos a los del original.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline image-text-to-text).
- Comprension de imagenes: descripcion de contenido visual, respuesta a preguntas sobre imagenes.
- Razonamiento y matematicas: evaluado en GSM8K (90,52 en la version cuantizada, 5-shot strict).
- Conocimiento general y multilingue: evaluado en MMLU, ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no confirmadas oficialmente; la evaluacion interna cubre ingles y coreano.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en produccion: el modelo acepta entrada imagen-texto y genera descripciones; util para catalogacion automatica de imagenes o generacion de alt-text, sirviendose de la torre de vision mantenida en BF16 para preservar calidad.
- Asistente conversacional multimodal: conversaciones multi-turno que combinan texto e imagenes, con el `chat_template` original intacto para integracion directa en pipelines existentes.
- Servicio de inferencia de alto rendimiento con vLLM: el checkpoint esta empaquetado en compressed-tensors `pack-quantized` y probado con vLLM 0.32.0, lo que permite desplegarlo como endpoint compatible con la API de vLLM en infraestructura con GPUs NVIDIA Turing (sm75) o superiores.
- Razonamiento matematico asistido: con 90,52 en GSM8K (5-shot strict), adecuado para resolver problemas aritmeticos paso a paso en herramientas educativas o de analisis.
- Procesamiento de documentacion con imagenes en ingles y coreano: los benchmarks KMMLU (64,67) y HAE-RAE (72,69) indican competencia en coreano, util para extraccion y respuesta sobre documentos en esos idiomas.
- Despliegue en hardware con memoria limitada: con 22,6 GB de pesos, cabe en GPUs de 24 GB o mas, permitiendo servir el modelo donde el BF16 de 68 GB no seria viable.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts completion-style sin chat template. MMLU es la variante generativa (`mmlu_generative`), no comparable con evaluaciones por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 85,65 | 85,61 (100,0%) | 85,71 (100,1%) | 85,76 (100,1%) | 85,41 (99,7%) | 85,31 (99,6%) |
| GSM8K (5-shot, strict) | 90,14 | 89,69 (99,5%) | 89,23 (99,0%) | 90,75 (100,7%) | 90,22 (100,1%) | 90,52 (100,4%) |
| ARC-Challenge (0-shot) | 60,92 | 61,01 (100,1%) | 61,18 (100,4%) | 60,84 (99,9%) | 61,09 (100,3%) | 62,03 (101,8%) |
| Winogrande (5-shot) | 80,11 | 79,87 (99,7%) | 78,93 (98,5%) | 79,32 (99,0%) | 77,11 (96,3%) | 79,56 (99,3%) |
| KMMLU (5-shot, direct) | 64,95 | 64,77 (99,7%) | 64,78 (99,7%) | 64,65 (99,5%) | 64,38 (99,1%) | 64,67 (99,6%) |
| HAE-RAE (0-shot) | 73,14 | 73,69 (100,8%) | 73,42 (100,4%) | 73,51 (100,5%) | 74,06 (101,3%) | 72,69 (99,4%) |
| **Media** | **75,82** | **75,77 (99,9%)** | **75,54 (99,6%)** | **75,80 (100,0%)** | **75,38 (99,4%)** | **75,80 (100,0%)** |

Fidelidad al original BF16 (conjunto interno mixto ingles/coreano, 100 prompts):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3132 | 1,2063 (+8,9%) |
| Acuerdo top-1 siguiente token | 92,3% | 98,1% |

## Requisitos de hardware

- VRAM estimada: pesos de 22,6 GB; anadir KV cache, que crece con la longitud de contexto por el numero de peticiones concurrentes (valor exacto no disponible).
- GPUs compatibles: NVIDIA Turing (sm75) o superior; V100 (sm70) no soportada. Solo se probo en B200 segun el autor.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas (p. ej. RTX 3090/4090) para pesos, con margen limitado para KV cache.
- Despliegue: vLLM 0.32.0 (arquitectura incluida desde vLLM 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Nota de compatibilidad: vLLM 0.32 necesita transformers 5.18.x o 5.19.x para este modelo; las pruebas usaron transformers 5.21.0 instalado con `--no-deps`. Los benchmarks y cifras de fidelidad son solo texto; la entrada de imagen falla en esa configuracion por incompatibilidad del procesador de imagenes de vLLM con transformers 5.21.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/MiniCPM-V-4.7-35B-A3B-AWQ-4bit (este) | 6,98 B en safetensors cuantizado | no disponible | AWQ INT4 W4A16, compressed-tensors | Apache-2.0 | 22,6 GB en disco; media 75,80 en benchmarks del autor |
| openbmb/MiniCPM-V-4.7-35B-A3B (BF16 original) | no disponible | no disponible | BF16 | Apache-2.0 | 68 GB en repo; media 75,82 |
| Variantes del mismo modelo (FP8-dynamic, AWQ-8bit, NVFP4A16, NVFP4) | no disponible | no disponible | FP8 / INT8 / NVFP4 | Apache-2.0 | Medias de 75,38 a 75,80 segun la tabla del autor |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad un 8,9% superior al original BF16 y acuerdo top-1 del 92,3% (frente al 98,1% del original): la cuantizacion introduce degradacion medible aunque los benchmarks agregados se mantengan.
- Los benchmarks son solo de texto; el rendimiento con imagenes no esta validado de forma sistematica (solo una comprobacion puntual con una imagen sintetica descrita correctamente).
- La entrada de imagen falla con la configuracion de transformers 5.21 usada en las pruebas por incompatibilidad del procesador de imagenes de vLLM.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de modelos generativos.
- Sesgos conocidos: no disponibles.
- Idiomas soportados no declarados oficialmente; la evaluacion cubre ingles y coreano, sin datos sobre castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base.
- Revision critica: si se descargo el repositorio antes del 2026-11-01 10:30:29 UTC (revision `37487f7`), hay que volver a descargarlo; las subidas anteriores enrutaban tokens a expertos distintos del original y perdian precision de normas en las capas 2-5.
- Dependencias fragiles: transformers y compressed-tensors deben respetar las versiones fijadas por vLLM; actualizarlas por separado puede romper la carga del checkpoint.
- V100 no soportada; requiere driver NVIDIA con soporte CUDA 13.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-AWQ-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
