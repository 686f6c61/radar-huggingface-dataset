# glyd/Qwen3.5-9B-swift

## Resumen

Qwen3.5-9B-swift es una cuantizacion de tipo "lossy" (con perdida) del modelo Qwen/Qwen3.5-9B, publicada por el usuario glyd dentro de su familia de niveles de compresion (penguin, kestrel y swift). El checkpoint ocupa 6,2 GB, un 65% menos que los 17,9 GB del bf16 original, y se ha cuantizado una sola vez desde los pesos bf16 originales a aproximadamente 5,5 bits por peso. No es una cuantizacion sin perdida: la divergencia KL respecto a bf16 es de 0,0373, medida sobre WikiText-2.

El modelo resuelve el problema de desplegar un modelo de ~9.000 millones de parametros en GPUs de consumo y de gama media con contexto largo: segun el autor, cabe con 32k de contexto en RTX 4090, L40S, RTX A6000 y RTX 2000 Ada Generation, con un consumo de memoria en torno a 7,2-7,6 GB a 4k de contexto. En una RTX 4090 alcanza 138 tokens/s con 140 ms hasta el primer token.

La relevancia practica esta limitada por su ecosistema: solo funciona con el motor propietario de Glyd (version 0.33.0 o superior, sobre Linux con GPU NVIDIA y driver 580 o superior) y no es compatible con vLLM ni con transformers. Ademas, es un checkpoint solo de texto: la parte de vision del modelo base no esta incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; el repo se etiqueta como qwen3_5) |
| Parametros totales | 8.953.803.264 segun la model card; el recuento de safetensors del repo es 6.166.774.426 (pesos empaquetados) |
| Parametros activos | no disponible |
| Longitud de contexto | 32k verificado en RTX 4090, L40S, RTX A6000 y RTX 2000 Ada Generation |
| Tipos de cuantizacion | cuantizacion unica desde bf16, ~5,5 bits por peso (etiquetada como 8-bit en el Hub por contar bytes empaquetados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria glyd) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada (tipo de transformer, atencion, datos de entrenamiento, tokens vistos, uso de RLHF o DPO). El repo se etiqueta con el identificador `qwen3_5`, y la model card menciona que el modelo original tiene una "parte de vision" que no se incluye en este checkpoint, lo que sugiere que el modelo base es multimodal.

La innovacion tecnica de este checkpoint es el proceso de cuantizacion de Glyd: una conversion unica desde los pesos bf16 a aproximadamente 5,5 bits por peso, con una divergencia KL de 0,0373 frente a bf16 sobre WikiText-2. El autor ofrece tres niveles con distintos compromisos: penguin (12,7 GB, sin perdida, KL 0), kestrel (7,3 GB, 59% mas pequeno, KL 0,0147) y swift (6,2 GB, 65% mas pequeno, KL 0,0373). No se detalla el algoritmo de cuantizacion empleado.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es text-generation y el modelo esta etiquetado como conversational.
- Razonamiento matematico: obtiene un 94,8% en GSM8K en modo no-thinking, practicamente identico al 95,5% del bf16.
- Modo no-thinking: los benchmarks se han ejecutado explicitamente en modo no-thinking; no se documenta el comportamiento en modo thinking.
- Solo texto: la parte de vision del modelo base no esta incluida en este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el Hub no declara idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue en GPU de consumo para prototipado: con 6,2 GB de pesos y unos 7,5 GB de memoria en uso a 4k de contexto, el modelo cabe en una RTX 4090 y permite iterar sobre tareas de generacion de texto sin infraestructura de centro de datos.
- Razonamiento matematico y resolucion de problemas verbales: el 94,8% en GSM8K lo hace adecuado para asistentes de resolucion de problemas aritmeticos en produccion, con una perdida de precision de menos de un punto respecto al bf16.
- Servicio de chat con contexto largo: los 32k de contexto verificados permiten conversaciones multi-turno o analisis de documentos extensos en una sola GPU, util para resumen y Q&A sobre informes.
- Procesamiento por lotes en GPUs de gama media: en una RTX 2000 Ada Generation rinde 35 tokens/s con 507 ms hasta el primer token, suficiente para tareas asincronas de generacion masiva donde la latencia no es critica.
- Evaluacion comparativa de cuantizaciones: sirve como nivel de referencia "agresivo" frente a penguin y kestrel para medir el impacto de la compresion en tareas concretas antes de elegir un checkpoint definitivo.
- Entornos con requisitos de licencia permisiva: al ser Apache-2.0, puede integrarse en productos comerciales sin restricciones de licencia del modelo, siempre que se acepte la dependencia del motor Glyd.
- No recomendado para pipelines existentes basados en vLLM o transformers: la model card indica explicitamente que aun no es compatible con esos motores, lo que descarta su uso directo en infraestructuras estandar.

## Benchmarks y rendimiento

| Benchmark | swift (este nivel) | bf16 (original) |
|---|---:|---:|
| GSM8K (10-shot, numeric match, non-thinking, 1319 preguntas) | 94,8% | 95,5% |

Ejecutado con Inspect AI 0.3.278 (inspect_evals 0.24.0) a traves de `glyd serve`; la columna bf16 corresponde al modelo fuente servido con vLLM con el mismo arnes y configuracion.

Rendimiento medido el 2026-10-10 con glyd 0.29.4, una GPU por prueba y contexto de 4k tokens:

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto 32k |
|---|---:|---:|---:|---|
| RTX 4090 | 138 | 140 ms | 7,5 GB | si |
| L40S | 108 | 128 ms | 7,6 GB | si |
| RTX A6000 | 102 | 213 ms | 7,4 GB | si |
| RTX 2000 Ada Generation | 35 | 507 ms | 7,2 GB | si |

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,2-7,6 GB en uso a 4k de contexto segun la GPU; el repo pesa 6,2 GB en disco.
- GPUs verificadas por el autor: RTX 4090, L40S, RTX A6000 y RTX 2000 Ada Generation, todas con soporte de 32k de contexto.
- Cabe en GPU de consumo: si, en RTX 4090 (138 tokens/s) y en RTX 2000 Ada Generation (35 tokens/s).
- Sistema operativo y driver: Linux con GPU NVIDIA y driver 580 o superior.
- Motor de despliegue: exclusivamente Glyd 0.33.0 o superior (instalacion via `curl -LsSf https://getglyd.com/install.sh | sh` y ejecucion con `glyd run Qwen/Qwen3.5-9B:swift`). No compatible con vLLM ni transformers segun la model card.
- Latencia: 128-213 ms hasta el primer token en L40S, RTX 4090 y RTX A6000; 507 ms en RTX 2000 Ada Generation.
- Throughput: 35-138 tokens/s segun GPU.

## Comparativa con modelos similares

Comparacion dentro de la propia familia de cuantizaciones de glyd sobre Qwen/Qwen3.5-9B:

| Modelo | Tamano | Reduccion vs bf16 | KL vs bf16 | RTX 4090 |
|---|---:|---:|---:|---:|
| bf16 (original) | 17,9 GB | - | 0 | - |
| glyd penguin (lossless) | 12,7 GB | 29% | 0 | - |
| glyd kestrel | 7,3 GB | 59% | 0,0147 | 122 tok/s |
| glyd swift (este repo) | 6,2 GB | 65% | 0,0373 | 138 tok/s |

No se dispone de datos para comparar con cuantizaciones de otros autores (por ejemplo, formatos GGUF o AWQ del mismo modelo base) en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion con perdida: la divergencia KL de 0,0373 frente a bf16 implica una desviacion medible en las probabilidades del siguiente token; no es adecuada si se requiere fidelidad exacta al modelo original.
- Compatibilidad restringida: solo funciona con el motor Glyd; no es compatible con vLLM ni transformers, lo que limita su integracion en infraestructuras existentes.
- Requisitos de plataforma: Linux, GPU NVIDIA y driver 580 o superior; sin soporte documentado para otras plataformas.
- Solo texto: la parte de vision del modelo base no esta incluida, por lo que no puede usarse para tareas multimodales.
- Cobertura de benchmarks limitada: solo se publica GSM8K; no hay datos de MMLU, HumanEval ni otras tareas, ni del comportamiento en modo thinking.
- Idiomas no declarados: el Hub no especifica los idiomas soportados, lo que impide garantizar calidad multilingue.
- Sesgos y alucinacion: no hay informacion especifica en la model card; deben asumirse los riesgos habituales de un modelo de lenguaje de este tamano.
- Adopcion muy baja: 76 descargas y 1 like en el momento de la consulta, con un unico autor; no hay validacion independiente de los resultados declarados.
- Licencia: Apache-2.0 tanto para los pesos como para el motor Glyd, lo que permite uso comercial sin restricciones de licencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glyd/Qwen3.5-9B-swift
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Commit del modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Nivel penguin (lossless): https://huggingface.co/glyd/Qwen3.5-9B-penguin
- Nivel kestrel: https://huggingface.co/glyd/Qwen3.5-9B-kestrel
- Repositorio del motor Glyd: https://github.com/surya-koritala/Glyd
- Instalador de Glyd: https://getglyd.com/install.sh
