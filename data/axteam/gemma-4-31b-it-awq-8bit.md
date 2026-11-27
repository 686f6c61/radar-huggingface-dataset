# axteam/gemma-4-31B-it-AWQ-8bit

## Resumen

`axteam/gemma-4-31B-it-AWQ-8bit` es una cuantizacion post-entrenamiento (PTQ) de 8 bits del modelo multimodal `google/gemma-4-31B-it`, producida por el equipo axteam para servir eficientemente con vLLM. Aplica la tecnica AWQ (activation-aware weight quantization) en esquema W8A16: pesos INT8 simetricos con tamano de grupo 32 y activaciones en BF16, almacenados en formato `compressed-tensors` `pack-quantized`. El objetivo es reducir el peso en disco y los requisitos de memoria de inferencia manteniendo practicamente intacta la calidad del modelo original.

El modelo base es un transformer denso de la familia Gemma 4 de Google, con capacidad de procesamiento de imagen y texto (`image-text-to-text`) y modo conversacional con plantilla de chat corregida en julio de 2026. La cuantizacion conserva en BF16 el torre de vision, la proyeccion visual, los embeddings de tokens (atados con `lm_head`) y todas las normalizaciones, lo que supone aproximadamente el 6 % de los parametros sin cuantizar.

Es relevante ahora porque permite desplegar un modelo multimodal de gran tamano en infraestructura con menos VRAM que la version BF16, con una recuperacion media del 99,9 % respecto al original en los benchmarks medidos. El repositorio ocupa 35,1 GB y declara 10.223.251.812 parametros en los safetensors, un dato que debe contrastarse con la nomenclatura "31B" del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (vision + texto) |
| Parametros totales | 10.223.251.812 (segun safetensors del repo); el nombre del modelo base indica 31B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simetricos, grupo 32, activaciones BF16); vision tower, proyeccion visual, embeddings y norms en BF16 |
| Idiomas soportados | no disponible en la model card; calibracion con 256 muestras de predominio coreano |
| Licencia | apache-2.0 (enlace a licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con capacidad multimodal (entrada de imagen y texto). Esta build no entrena el modelo: parte de los pesos BF16 publicados de `google/gemma-4-31B-it` (commit `842da37`) y aplica cuantizacion post-entrenamiento sin reentrenamiento. La tecnica AWQ identifica los canales de peso que multiplican las activaciones de mayor magnitud y los protege mediante escalado por canal antes del redondeo; el escalado se pliega en capas adyacentes (por ejemplo, LayerNorm hacia q/k/v). La calibracion usa 256 muestras de predominio coreano, de las cuales 32 son respuestas autogeneradas en modo thinking.

La cuantizacion afecta a atencion y MLP (gate/up, up→down), mientras que el torre de vision, la proyeccion visual, los embeddings de tokens (atados con `lm_head`) y todas las normalizaciones permanecen en BF16. El tokenizador, `chat_template`, `processor_config` y `generation_config` son identicos byte a byte al original; `config.json` es el original mas un bloque `quantization_config`. No se empleo QAT (fine-tuning con cuantizacion simulada): es PTQ puro, con la fidelidad propia de AWQ frente a RTN.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat compatible con el modelo original.
- Procesamiento de imagen y texto (`image-text-to-text`): descripcion de imagenes y respuestas condicionadas por imagen.
- Razonamiento en modo thinking (la calibracion incluye respuestas de ese modo, lo que sugiere soporte del mismo).
- Razonamiento matematico y resolucion de problemas (GSM8K medido en 91,66 con 5-shot estricto).
- Capacidades multilingues: los benchmarks incluyen KMMLU y HAE-RAE (coreano), aunque la model card no declara una lista de idiomas.
- Integracion con vLLM y formato `compressed-tensors`, lo que facilita su uso en pipelines de serving.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Serving conversacional de alto rendimiento: desplegar el modelo con vLLM 0.32.0 en produccion para atender conversaciones multi-turno, aprovechando la compatibilidad nativa con `compressed-tensors` y la reduccion de memoria frente a BF16.
- Descripcion y analisis de imagenes: usar el pipeline `image-text-to-text` para generar descripciones o responder preguntas sobre imagenes, manteniendo el torre de vision en BF16 para preservar calidad.
- Asistencia matematica y razonamiento: el rendimiento medido en GSM8K (91,66) lo hace adecuado para tutoria o resolucion de problemas paso a paso en entornos educativos.
- Procesamiento de documentacion con imagenes: extraer y describir contenido visual en flujos de digitalizacion, combinando entrada de imagen y generacion de texto.
- Evaluacion comparativa de cuantizaciones: servir como referencia AWQ-8bit frente a FP8, NVFP4 y AWQ-4bit en experimentos de fidelidad y coste, dado que el autor publica metricas comparables.
- Despliegue en infraestructura con VRAM limitada: reducir el peso en disco a 35,1 GB y la memoria de inferencia respecto a BF16, permitiendo servir el modelo en GPUs que no admitirian la version completa.
- Aplicaciones multilingues con foco en coreano: los benchmarks KMMLU y HAE-RAE indican evaluacion en ese idioma, aunque la ficha no declara la lista completa de idiomas soportados.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Porcentajes entre parentesis: recuperacion respecto a BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativa) | 56,46 | 56,07 (99,3 %) | 56,41 (99,9 %) | 58,32 (103,3 %) | 58,51 (103,6 %) | 57,12 (101,2 %) |
| GSM8K (5-shot, estricto) | 91,81 | 91,89 (100,1 %) | 91,66 (99,8 %) | 91,96 (100,2 %) | 91,74 (99,9 %) | 92,34 (100,6 %) |
| ARC-Challenge (0-shot) | 57,59 | 58,36 (101,3 %) | 57,68 (100,1 %) | 57,76 (100,3 %) | 56,91 (98,8 %) | 57,17 (99,3 %) |
| Winogrande (5-shot) | 66,22 | 66,14 (99,9 %) | 65,82 (99,4 %) | 65,59 (99,0 %) | 64,96 (98,1 %) | 66,77 (100,8 %) |
| KMMLU (5-shot, directo) | 25,02 | 23,89 (95,5 %) | 25,21 (100,8 %) | 26,55 (106,1 %) | 26,78 (107,0 %) | 25,02 (100,0 %) |
| HAE-RAE (0-shot) | 76,81 | 75,25 (98,0 %) | 76,81 (100,0 %) | 77,09 (100,4 %) | 77,09 (100,4 %) | 78,09 (101,7 %) |
| **Media** | **62,32** | **61,93 (99,4 %)** | **62,27 (99,9 %)** | **62,88 (100,9 %)** | **62,66 (100,6 %)** | **62,75 (100,7 %)** |
| **Media sin KMMLU** | **69,78** | **69,54 (99,7 %)** | **69,68 (99,9 %)** | **70,14 (100,5 %)** | **69,84 (100,1 %)** | **70,30 (100,7 %)** |

Nota del autor sobre KMMLU: con estos prompts estilo completion el BF16 original puntua 25,02, nivel de azar para preguntas de 4 opciones (el `gemma-4-31B` base BF16 obtiene 67,35 con el mismo harness), por lo que esa fila no refleja capacidad en coreano ni perdida por cuantizacion.

Evaluacion de fidelidad frente al BF16 original en un conjunto interno mixto ingles/coreano:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1127 | 1,1120 (+0,1 %) |
| Acuerdo top-1 siguiente token | 99,2 % | 99,4 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 35,1 GB en disco y las activaciones son BF16, por lo que se necesita margen adicional sobre el peso de los pesos.
- Runtime: vLLM; la arquitectura esta en vLLM ≥ 0.19.0 y se probo con vLLM 0.32.0 (texto en los benchmarks; imagen en una comprobacion de descripcion de imagen el 2026-11-02).
- Dependencias de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamano de pesos (35,1 GB) supera la VRAM de la mayoria de GPU de consumo, pero la ficha no confirma modelos concretos.
- Opciones de despliegue: vLLM con soporte `compressed-tensors`; llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion con las otras cuantizaciones del mismo modelo base publicadas por el autor, segun los datos de la model card:

| Modelo | Metodo | Media (sin KMMLU) | Perplejidad | Licencia |
|---|---|---|---|---|
| **gemma-4-31B-it-AWQ-8bit (este)** | AWQ INT8 W8A16 | 69,68 (99,9 %) | 1,1127 | apache-2.0 |
| gemma-4-31B-it FP8-dynamic | FP8 dinamico | 69,54 (99,7 %) | no disponible | no disponible |
| gemma-4-31B-it NVFP4 | NVFP4 | 69,84 (100,1 %) | no disponible | no disponible |
| gemma-4-31B-it AWQ-4bit | AWQ 4 bits | 70,30 (100,7 %) | no disponible | no disponible |

No se dispone de datos para comparar con modelos de otros autores de la misma categoria y tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion PTQ: no hay reentrenamiento ni QAT, por lo que la fidelidad es la propia de AWQ y no la de un checkpoint QAT de Google.
- La calibracion es de predominio coreano (256 muestras), lo que puede sesgar el comportamiento en otros idiomas; la model card no declara la lista de idiomas soportados.
- La fila KMMLU de los benchmarks no es interpretable como capacidad en coreano: el propio BF16 original puntua a nivel de azar con esos prompts.
- MMLU se midio con la variante generativa de lm-eval; no es comparable con puntuaciones obtenidas por log-likelihood.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo general de los modelos generativos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar cargas con ventanas largas.
- Discrepancia entre el nombre "31B" y los 10.223.251.812 parametros de los safetensors: conviene verificar antes de dimensionar infraestructura.
- Restricciones de licencia: la licencia declarada es apache-2.0 con enlace a la licencia Gemma 4 de Google; revisar los terminos de uso comercial de Gemma 4 antes de desplegar en produccion.
- Requiere vLLM ≥ 0.19.0 y se probo con 0.32.0; versiones anteriores no soportan la arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-it-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
