# axteam/Qwen3.5-122B-A10B-AWQ-4bit

## Resumen

Qwen3.5-122B-A10B-AWQ-4bit es una cuantizacion de 4 bits del modelo multimodal Qwen3.5-122B-A10B, desarrollado originalmente por el equipo Qwen (Alibaba) y cuantizado por axteam para servir con vLLM de forma eficiente. Se trata de un modelo de arquitectura hibrida que combina atencion lineal con atencion completa, y una estructura Mixture-of-Experts (MoE) con 256 expertos mas un experto compartido, de los cuales se activan aproximadamente 10B de los 122B totales en cada paso.

El modelo resuelve el problema del coste de despliegue de un MoE multimodal de gran tamano: gracias a la cuantizacion AWQ INT4 (W4A16) con grupo de tamano 32, el checkpoint pasa de requerir el equivalente a un modelo BF16 de 122B a ocupar unos 78,8 GB en disco, manteniendo segun el autor una recuperacion media del 99,1% respecto al original BF16 en una bateria de benchmarks. Incluye torre de vision, cabecera de prediccion multi-token (MTP) y partes SSM no cuantizadas en BF16.

Es relevante ahora porque permite servir un modelo de ~125.000 millones de parametros con capacidades de imagen-texto en un unico nodo con GPUs de 80 GB, manteniendo licencia Apache-2.0. La revision del 1 de noviembre de 2026 corrige un error de la primera subida en el que el router MoE y la compuerta del experto compartido no estaban compensados durante el suavizado AWQ, lo que desviaba tokens a expertos distintos de los del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), MoE con 256 expertos + experto compartido, multimodal (vision), cabecera MTP |
| Parametros totales | 125.086.497.008 (~125B) |
| Parametros activos | ~10B por token (segun model card: ~10B / 122B total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimetricos, grupo de tamano 32, escala BF16 + zero-point INT4, activaciones BF16); formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibracion AWQ uso un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que intercala capas de atencion lineal con capas de atencion completa, organizado como Mixture-of-Experts con 256 expertos enrutados mas un experto compartido. La activacion ronda los 10B parametros frente a los ~122B totales, lo que reduce el coste computacional por token. Incluye una torre de vision con proyector para entrada image-text-to-text y una cabecera de prediccion multi-token (MTP), habitualmente empleada para decodificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

Esta publicacion concreta es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento: AWQ usa 256 muestras de calibracion (corpus mixto con predominio de coreano) para proteger canales de pesos salientes antes del redondeo. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabecera MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head, el router MoE (`mlp.gate`), la compuerta del experto compartido y las partes no lineales del SSM (`linear_attn.conv1d/A_log/dt_bias`), en total cerca del 4% de los parametros. `linear_attn.A_log` y la `linear_attn.norm` con compuerta, en FP32 en el original, se almacenan en BF16. La revision del 1 de noviembre de 2026 recompenso el router y la compuerta del experto compartido durante el suavizado AWQ (diferencia mediana por canal inferior al 2% frente al original) y excluyo del reescalado los canales con ganancia de norma cero, corrigiendo la perdida de precision en la capa 27 de la primera subida.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y resolucion de problemas, con resultados medidos en MMLU, ARC-Challenge y Winogrande.
- Matematicas y razonamiento aritmetico (GSM8K).
- Comprension de imagenes: pipeline image-text-to-text con torre de vision integrada.
- Capacidades multilingues, con evaluacion especifica en coreano (KMMLU, HAE-RAE) y en ingles (MMLU, GSM8K); el conjunto completo de idiomas no esta documentado.
- Cabecera MTP (multi-token prediction) para decodificacion especulativa.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagen y texto y puede desplegarse con vLLM 0.32 en un nodo con GPUs de 80 GB gracias a los ~78,8 GB del checkpoint INT4, gestionando conversaciones multi-turno con un unico endpoint compatible con la API de OpenAI.
- Analisis documental con imagenes: extraccion y resumen de informacion de capturas, formularios o diagramas combinando la torre de vision con generacion de texto, sin necesidad de un pipeline OCR separado.
- Asistencia en razonamiento matematico: resolucion de problemas tipo GSM8K con una recuperacion del 99,2% respecto al BF16 original, adecuada para tutoria o verificacion de calculos.
- Evaluacion y benchmarking interno: su fidelidad medida (perplejidad +2,4%, acuerdo top-1 del 93,8%) permite usarlo como aproximacion barata del modelo BF16 en pruebas de regresion de prompts antes de escalar al modelo completo.
- Procesamiento multilingue con foco en coreano e ingles: los resultados en KMMLU (71,20) y HAE-RAE (80,93) lo hacen util para clasificacion, resumen y respuesta a preguntas en esos idiomas.
- Despliegue con decodificacion especulativa: la cabecera MTP conservada en BF16 permite acelerar la generacion en vLLM sin un modelo draft adicional.
- Sustitucion de inferencia BF16 en entornos con restricciones de memoria: reduce el espacio en disco y en VRAM aproximadamente a la mitad frente a pesos BF16, manteniendo el 99,1% de la puntuacion media en benchmarks.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-likelihood. Entre parentesis, porcentaje de recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 88,06 | 87,89 (99,8%) | 87,89 (99,8%) | 87,91 (99,8%) | 87,69 (99,6%) | 87,69 (99,6%) |
| GSM8K (5-shot, estricto) | 84,46 | 83,93 (99,4%) | 84,23 (99,7%) | 84,84 (100,4%) | 80,52 (95,3%) | 83,78 (99,2%) |
| ARC-Challenge (0-shot) | 63,74 | 63,91 (100,3%) | 63,74 (100,0%) | 63,40 (99,5%) | 62,71 (98,4%) | 62,80 (98,5%) |
| Winogrande (5-shot) | 73,09 | 73,24 (100,2%) | 73,56 (100,6%) | 72,77 (99,6%) | 73,16 (100,1%) | 73,01 (99,9%) |
| KMMLU (5-shot, directo) | 71,72 | 71,72 (100,0%) | 71,67 (99,9%) | 71,35 (99,5%) | 70,80 (98,7%) | 71,20 (99,3%) |
| HAE-RAE (0-shot) | 82,31 | 81,39 (98,9%) | 81,76 (99,3%) | 81,48 (99,0%) | 80,20 (97,4%) | 80,93 (98,3%) |
| Media | 77,23 | 77,01 (99,7%) | 77,14 (99,9%) | 76,96 (99,7%) | 75,85 (98,2%) | 76,57 (99,1%) |

Fidelidad frente al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts (respuestas greedy del BF16 original evaluadas bajo cada build), medido con vLLM 0.32 el 2 de noviembre de 2026:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3579 | 1,3258 (+2,4%) |
| Acuerdo top-1 en siguiente token | 93,8% | 98,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~78,8 GB en disco; en vLLM los pesos INT4 mas las capas BF16 requieren del orden de 80 GB de memoria de GPU, mas espacio para cache KV y activaciones.
- GPU recomendadas: un nodo con GPUs de 80 GB (A100 80GB, H100 80GB) con tensor parallelism; no cabe en una unica RTX 4090 de 24 GB.
- GPU de consumo: no es viable en consumer GPU de 24 GB; requeriria multiples GPUs consumer, opcion no documentada por el autor.
- Opciones de despliegue: vLLM >= 0.17.0 (probado con 0.32.0); el formato compressed-tensors `pack-quantized` esta pensado para vLLM. No se documenta soporte en llama.cpp ni Ollama.
- Entorno de ejecucion: Python 3.11-3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardo con 0.19.0, no actualizar por separado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| AWQ-4bit (este repo) | 125B totales, ~10B activos | no disponible | 76,57 (99,1% vs BF16) | Apache-2.0 | safetensors compressed-tensors INT4 |
| Qwen3.5-122B-A10B BF16 (original) | 122B totales, ~10B activos | no disponible | 77,23 | Apache-2.0 | safetensors BF16 |
| Variante FP8-dynamic del mismo modelo | 122B totales, ~10B activos | no disponible | 77,01 (99,7%) | Apache-2.0 | safetensors FP8 |
| Variante AWQ-8bit del mismo modelo | 122B totales, ~10B activos | no disponible | 77,14 (99,9%) | Apache-2.0 | safetensors INT8 |

No se dispone de datos de benchmarks de modelos de otros desarrolladores en la informacion proporcionada, por lo que la comparativa se limita a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Perdida de fidelidad respecto al BF16 original: perplejidad un 2,4% superior y acuerdo top-1 del 93,8% (frente al 98,4% del BF16), lo que implica divergencias en la generacion token a token.
- La cuantizacion AWQ es PTQ sin reentrenamiento; el calibrado uso solo 256 muestras con predominio de coreano, lo que puede sesgar la proteccion de canales hacia ese dominio.
- Si se descargo el repositorio antes del 1 de noviembre de 2026 (18:54:07 UTC, revision `2578e49`), debe descargarse de nuevo: la primera subida no compensaba el router MoE ni la compuerta del experto compartido.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se documentan evaluaciones especificas de factualidad.
- Idiomas soportados no documentados oficialmente; la evaluacion se limita a ingles y coreano.
- Longitud de contexto no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base para condiciones adicionales.
- Dependencia estricta de versiones: vLLM >= 0.17.0 (probado con 0.32.0), transformers <5.20 y compressed-tensors 0.17.0; no actualizar compressed-tensors de forma independiente.
- Requiere driver NVIDIA con soporte CUDA 13 por el build de torch 2.13.
- No se documenta soporte para llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-122B-A10B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
