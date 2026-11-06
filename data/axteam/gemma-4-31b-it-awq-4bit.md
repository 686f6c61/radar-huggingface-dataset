# axteam/gemma-4-31B-it-AWQ-4bit

## Resumen

`axteam/gemma-4-31B-it-AWQ-4bit` es una cuantizacion de 4 bits del modelo multimodal `google/gemma-4-31B-it`, publicada por el usuario axteam. Se trata de un checkpoint AWQ INT4 (W4A16) en formato `compressed-tensors pack-quantized`, disenado especificamente para servir el modelo con vLLM de forma eficiente en memoria. El modelo base es un transformer denso de la familia Gemma 4 de Google, con capacidad de entrada imagen-texto y salida de texto (pipeline `image-text-to-text`).

La relevancia de esta ficha radica en que reduce el peso en disco del modelo original a unos 20,9 GB, manteniendo las activaciones y las capas criticas en BF16, lo que permite desplegar un modelo multimodal de gran tamano en GPUs con menos VRAM que las requeridas por la version completa. La cuantizacion se realizo mediante PTQ con AWQ y un conjunto de calibracion de 256 muestras, sin reentrenamiento.

El autor reporta una fidelidad media del 100,7 % respecto al BF16 original en un conjunto de benchmarks medidos con `lm-evaluation-harness` sobre vLLM, y una perplejidad de 1,1754 frente a 1,1120 del original. La licencia declarada es Apache-2.0, con enlace a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal imagen-texto) |
| Parametros totales | 6.676.812.132 (segun safetensors del repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimetricos, grupo 32, escalas BF16, zero-point INT4, activaciones BF16); vision tower, proyeccion de vision, embeddings y normas en BF16 (~6 % de parametros sin cuantizar) |
| Idiomas soportados | no disponible (calibracion con sesgo hacia coreano; benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, `compressed-tensors` `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con torre de vision y proyeccion multimodal, lo que le permite procesar entradas de imagen y texto. Esta publicacion no entrena el modelo: aplica cuantizacion post-entrenamiento (PTQ) mediante AWQ sobre los pesos BF16 liberados por Google (commit `842da37`). AWQ identifica los canales de peso que multiplican a las activaciones de mayor magnitud y los protege con escalado por canal antes del redondeo, lo que mejora la fidelidad a 4 bits frente a un simple redondeo RTN.

La calibracion se realizo con 256 muestras, con predominio de coreano, e incluye 32 respuestas generadas por el propio modelo en modo thinking. Se mantienen en BF16 la torre de vision, la proyeccion de vision, los token embeddings (atados con `lm_head`) y todas las normas, lo que representa aproximadamente el 6 % de los parametros de esta build. El tokenizer, la `chat_template`, el `processor_config` y el `generation_config` son identicos byte a byte al original, incluida la `chat_template` corregida por Google en julio de 2026; el `config.json` es el original mas un bloque `quantization_config`. No se reportan datos sobre volumen o composicion del dataset de entrenamiento original, ni sobre uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `image-text-to-text`, tag `conversational`).
- Procesamiento de entradas imagen-texto gracias a la torre de vision preservada en BF16.
- Razonamiento y respuestas en modo thinking (la calibracion incluye respuestas autogeneradas en este modo).
- Razonamiento matematico y resolucion de problemas (evaluado en GSM8K).
- Conocimiento general y multilingue parcial (evaluado en MMLU, ARC-Challenge, Winogrande, KMMLU y HAE-RAE).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Servicio de inferencia multimodal en produccion con vLLM: el checkpoint esta empaquetado en `compressed-tensors` y pensado para vLLM (probado con 0.32.0), por lo que puede desplegarse como endpoint compatible con OpenAI para tareas de imagen-texto con un consumo de VRAM notablemente inferior al BF16.
- Asistente conversacional con contexto de imagenes: al conservar la torre de vision en BF16, es adecuado para responder preguntas sobre capturas, diagramas o fotografias en flujos de atencion al cliente o soporte tecnico.
- Razonamiento matematico asistido: los resultados en GSM8K (92,34 en 5-shot estricto) lo hacen util para tutoria o verificacion de calculos en pipelines educativos.
- Procesamiento de documentacion escaneada: la combinacion de vision y generacion de texto permite extraer y resumir contenido de documentos, con la ventaja de un peso en disco de ~20,9 GB que facilita el despliegue en infraestructura modesta.
- Evaluacion y prototipado de modelos multimodales: al mantener la `chat_template` y los configs originales, sirve como sustituto directo del BF16 en entornos de investigacion donde la VRAM es limitada.
- Despliegue en GPUs Turing o superiores: al usar INT de solo pesos (sin necesidad de tensor cores especiales), puede ejecutarse en NVIDIA sm75 o posterior, ampliando el rango de hardware compatible frente a formatos como NVFP4.
- Generacion de codigo: no hay evidencia en la informacion proporcionada de evaluacion especifica en benchmarks de codigo (HumanEval u otros), por lo que su idoneidad para este caso no esta respaldada por datos.

## Benchmarks y rendimiento

Resultados medidos por el autor con `lm-evaluation-harness` sobre vLLM, greedy, prompts estilo completion sin chat template (0- o 5-shot segun fila). Porcentajes entre parentesis: recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 56,46 | 56,07 (99,3 %) | 56,41 (99,9 %) | 58,32 (103,3 %) | 58,51 (103,6 %) | 57,12 (101,2 %) |
| GSM8K (5-shot, strict) | 91,81 | 91,89 (100,1 %) | 91,66 (99,8 %) | 91,96 (100,2 %) | 91,74 (99,9 %) | 92,34 (100,6 %) |
| ARC-Challenge (0-shot) | 57,59 | 58,36 (101,3 %) | 57,68 (100,1 %) | 57,76 (100,3 %) | 56,91 (98,8 %) | 57,17 (99,3 %) |
| Winogrande (5-shot) | 66,22 | 66,14 (99,9 %) | 65,82 (99,4 %) | 65,59 (99,0 %) | 64,96 (98,1 %) | 66,77 (100,8 %) |
| KMMLU (5-shot, direct) | 25,02 | 23,89 (95,5 %) | 25,21 (100,8 %) | 26,55 (106,1 %) | 26,78 (107,0 %) | 25,02 (100,0 %) |
| HAE-RAE (0-shot) | 76,81 | 75,25 (98,0 %) | 76,81 (100,0 %) | 77,09 (100,4 %) | 77,09 (100,4 %) | 78,09 (101,7 %) |
| **Media** | **62,32** | **61,93 (99,4 %)** | **62,27 (99,9 %)** | **62,88 (100,9 %)** | **62,66 (100,6 %)** | **62,75 (100,7 %)** |

Evaluacion de fidelidad frente al BF16 original en un conjunto mixto ingles/coreano interno (variante AWQ attention):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1754 | 1,1120 (+5,7 %) |
| Acuerdo top-1 en siguiente token | 94,3 % | 99,4 % |

Comparacion con otras cuantizaciones publicas del mismo modelo, mismo conjunto y harness:

| Modelo | Perplejidad | Top-1 |
|---|---|---|
| BF16 original (cota superior) | 1,1120 | 99,4 % |
| **Este modelo (axteam)** | **1,1754** | **94,3 %** |
| `cyankiwi/gemma-4-31B-it-AWQ-4bit` | 1,1759 | 94,4 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el peso en disco del checkpoint es de ~20,9 GB, por lo que se requiere al menos esa cantidad de VRAM mas el overhead de activaciones, cache KV y buffers de vLLM.
- Runtime probado: vLLM 0.32.0 (la arquitectura esta soportada desde vLLM >= 0.19.0).
- Dependencias de vLLM 0.32: Python 3.11-3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- GPU: NVIDIA Turing (sm75) o superior; al ser INT de solo pesos, no requiere tensor cores especiales. V100 (sm70) queda fuera del soporte indicado.
- Cabe en GPU consumer: no disponible de forma explicita; por el tamano del checkpoint (~20,9 GB) no cabe en GPUs consumer de 8-16 GB, y en tarjetas de 24 GB el margen para cache KV y activaciones seria muy ajustado.
- Opciones de despliegue: vLLM es el runtime objetivo y probado. No se mencionan llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| **axteam/gemma-4-31B-it-AWQ-4bit** (este) | 6.676.812.132 (safetensors) | no disponible | AWQ INT4 W4A16, compressed-tensors | Apache-2.0 | Perplejidad 1,1754; top-1 94,3 %; media benchmarks 62,75 |
| `google/gemma-4-31B-it` (BF16) | no disponible | no disponible | BF16 | Gemma 4 / Apache-2.0 | Perplejidad 1,1120; top-1 99,4 %; media benchmarks 62,32 |
| `cyankiwi/gemma-4-31B-it-AWQ-4bit` | no disponible | no disponible | AWQ INT4 | no disponible | Perplejidad 1,1759; top-1 94,4 % |

## Limitaciones y advertencias

- La cuantizacion es PTQ (AWQ) sin reentrenamiento: la fidelidad al BF16 no es total. La perplejidad empeora un 5,7 % y el acuerdo top-1 baja al 94,3 % frente al 99,4 % del original.
- La calibracion tiene sesgo hacia el coreano (256 muestras, con 32 respuestas autogeneradas en modo thinking); el comportamiento en otros idiomas, incluido el castellano, no esta evaluado en la informacion disponible.
- Los benchmarks reportados usan prompts estilo completion sin chat template; el rendimiento en uso conversacional real con la `chat_template` puede diferir.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican los riesgos habituales de los modelos generativos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto del modelo base no se indica en la informacion disponible.
- Restricciones de licencia: se declara Apache-2.0, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma antes de un despliegue comercial.
- Dependencia estricta de versiones: vLLM 0.32.0 con compressed-tensors 0.17.0 (fijado); actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Requiere driver NVIDIA con soporte CUDA 13.0 por el build de torch 2.13; V100 (sm70) queda fuera del soporte declarado.
- El repo tiene un volumen de descargas bajo (285) y solo 2 likes en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-it-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Cuantizacion comparable: https://huggingface.co/cyankiwi/gemma-4-31B-it-AWQ-4bit
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
