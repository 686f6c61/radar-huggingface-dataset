# FardoX/Qwen3.8-27B-rapido-GGUF

## Resumen

Qwen3.8-27B-rapido-GGUF es una cuantizacion extrema del modelo Qwen/Qwen3.8-27B, publicada por el usuario FardoX en Hugging Face. Se trata de una version comprimida aproximadamente 8 veces (de 54 GB a 6,8 GB) que emplea un esquema de 1,99 bits por peso mediante una combinacion de rotacion block-Hadamard, GPTQ vectorial sobre la rejilla IQ2_XXS y un nuevo tipo de peso denominado ECTV. El objetivo es hacer viable la inferencia de un modelo de 27.320 millones de parametros en GPUs de consumo de 12-16 GB de VRAM.

El modelo base, Qwen3.8-27B, es un transformer denso de 27.320.697.856 parametros desarrollado por el equipo Qwen de Alibaba. Esta derivada no modifica la arquitectura ni los pesos originales mas alla de la cuantizacion, y se distribuye bajo licencia Apache-2.0. El autor declara que conserva aproximadamente el 97% del rendimiento en razonamiento del modelo original, con una velocidad de generacion superior a Q4_0 en GPU.

La relevancia de esta ficha radica en que demuestra una via practica para ejecutar modelos de casi 30.000 millones de parametros en hardware asequible, a costa de una perdida medible de calidad y de requerir un parche especifico en llama.cpp para el formato ECTV. Es una publicacion no oficial, sin descargas ni likes en el momento de la consulta, y con informacion tecnica limitada a la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1,99 bits/peso (formato ECTV, main file) y 2,08 bits/peso (GGUF estandar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj F16 para vision |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.8-27B, un transformer denso de 27.320 millones de parametros. Esta publicacion no entrena ni ajusta el modelo: aplica un proceso de cuantizacion post-entrenamiento sobre los pesos originales. El metodo consiste en una rotacion block-Hadamard de los pesos seguida de GPTQ vectorial sobre la rejilla de cuantizacion IQ2_XXS, lo que da lugar a un nuevo tipo de peso llamado ECTV, implementado tanto para CPU como para CUDA mediante un parche especifico de llama.cpp.

El resultado son dos ficheros: uno principal de 1,99 bits por peso (6,8 GB) que incluye embeddings, cabeza de salida y capa MTP, y otro de 2,08 bits con los mismos pesos pero compatible con versiones estandar de llama.cpp (b12490 o superior). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si el modelo base utilizo RLHF o DPO. Tampoco se detalla la composicion del corpus de calibracion empleado en el proceso GPTQ.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Razonamiento y matematicas: el autor reporta GSM8K 0,87 y MATH-500 0,64, lo que indica capacidad de resolucion de problemas aritmeticos y matematicos de varios pasos.
- Soporte de vision: el repositorio incluye un fichero `mmproj-Qwen3.8-27B-F16.gguf`, lo que sugiere que el modelo base es multimodal y que esta derivada conserva la proyeccion visual.
- Inferencia via llama.cpp y llama-server, con API HTTP compatible con endpoints OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no confirmado en la informacion disponible, aunque probablemente heredado del modelo base.
- Modo thinking o razonamiento extendido: no confirmado.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 12-16 GB: el modelo cabe en una RTX 4070 Ti, RTX 4080 o similar, permitiendo ejecutar un modelo de 27B en local sin depender de la nube.
- Prototipado de asistentes conversacionales: con llama-server se levanta un endpoint compatible con la API de OpenAI en `http://localhost:8080`, lo que facilita integrar el modelo en aplicaciones existentes sin cambiar el codigo cliente.
- Razonamiento matematico en entornos con recursos limitados: con GSM8K 0,87 y MATH-500 0,64, es adecuado para tareas de resolucion de problemas donde no se dispone de GPUs de 80 GB.
- Procesamiento de imagenes y texto combinados: el fichero mmproj permite tareas de vision-lenguaje, como descripcion de imagenes o respuesta a preguntas visuales, en hardware de consumo.
- Evaluacion e investigacion de tecnicas de cuantizacion extrema: el formato ECTV y el metodo block-Hadamard + GPTQ vectorial son un caso de estudio para investigadores que analizan el compromiso entre compresion y calidad.
- Generacion de codigo y texto en pipelines de CI/CD: al ejecutarse como servidor HTTP local, puede integrarse en flujos automatizados de revision o generacion de documentacion, siempre que la perdida de calidad del 3% sea aceptable.
- Fine-tuning o experimentacion con modelos grandes en un solo equipo: sirve como base para pruebas de adaptadores o evaluaciones rapidas antes de escalar al modelo completo.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-27B-rapido (1,99 bits) | Qwen3.8-27B original | Retencion |
|---|---|---|---|
| GSM8K | 0,87 | 0,90 | 96,7% |
| MATH-500 | 0,64 | 0,66 | 97,0% |

Las cifras corresponden a 100 items por benchmark, segun el autor. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

Rendimiento de inferencia medido en NVIDIA A40 con batch 1: 44,9 tok/s de generacion (1,34x respecto a Q4_0) y 1322 tok/s de procesamiento de prompt (0,86x respecto a Q4_0). No se ha medido la velocidad en CPU.

## Requisitos de hardware

- VRAM estimada: 6,8 GB para el fichero principal de 1,99 bits, mas overhead del contexto y de la proyeccion visual (mmproj F16), lo que en la practica encaja en GPUs de 12-16 GB.
- GPU recomendadas: NVIDIA A40 (medicion del autor), RTX 4090, RTX 4080, RTX 4070 Ti y cualquier GPU con 12 GB o mas. Tambien cabe en GPUs de 16 GB como la RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp con el parche `ectv-cuda-mmq-llamacpp.patch` para el fichero de 1,99 bits, o llama.cpp estandar b12490+ para el fichero de 2,08 bits. Se usa `llama-server` con `-ngl 999` para descargar todas las capas en GPU. No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: 44,9 tok/s de generacion y 1322 tok/s de prompt en A40 con batch 1. Velocidad en CPU no medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-rapido (esta ficha) | 27,3B | no disponible | 1,99 bits / 2,08 bits | Apache-2.0 | GGUF en HF, requiere parche para 1,99 bits |
| Qwen/Qwen3.8-27B (original) | 27,3B | no disponible | FP16/BF16 | Apache-2.0 | Pesos completos en HF |
| Cuantizaciones Q4_0 de Qwen3.8-27B | 27,3B | no disponible | ~4 bits | Apache-2.0 | GGUF estandar en llama.cpp |

La comparativa se limita al modelo base y a cuantizaciones estandar, ya que no se dispone de informacion sobre otras derivadas de 2 bits del mismo modelo. Frente a Q4_0, esta version ocupa aproximadamente la mitad de espacio y genera un 34% mas rapido en A40, pero procesa prompts un 14% mas lento y pierde en torno al 3% en los benchmarks medidos.

## Limitaciones y advertencias

- Perdida de calidad medible: retencion del 96,7% en GSM8K y del 97,0% en MATH-500, con solo 100 items por benchmark, lo que reduce la significancia estadistica.
- Requiere un parche no oficial de llama.cpp (`ectv-cuda-mmq-llamacpp.patch`) para el fichero de 1,99 bits; el fichero de 2,08 bits funciona con versiones estandar pero no se detalla su calidad exacta.
- Publicacion no oficial: no esta respaldada por el equipo Qwen ni por Alibaba; el autor la describe como "unofficial derivative".
- Sin datos sobre sesgos, idiomas soportados ni comportamiento en contextos largos.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion agresiva a 2 bits.
- La licencia Apache-2.0 permite uso comercial, pero el parche de llama.cpp y el formato ECTV son contribuciones del autor cuya estabilidad y mantenimiento no estan garantizados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- No se ha medido el rendimiento en CPU, lo que limita su uso en entornos sin GPU.
- La fecha de creacion (2026-11-20) y el nombre del modelo base (Qwen3.8-27B) deben verificarse contra el repositorio oficial de Qwen antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FardoX/Qwen3.8-27B-rapido-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
