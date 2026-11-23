# Henk0o/mlxl3-image21-exl3-4bpw

## Resumen

MLXL3 Image21 EXL3 4 bpw es una cuantizacion del transformer de difusion Qwen-Image-2.1, desarrollada por el usuario Henk0o y publicada en Hugging Face. El modelo base es el checkpoint oficial en BF16 de Qwen (Qwen/Qwen-Image-2.1), un modelo de generacion de imagenes texto-a-imagen. Esta version comprime los pesos del denoiser mediante el codec EXL3 de ExLlamaV3 y los empaqueta en un formato pensado para su lectura directa sobre Metal en Apple Silicon, a traves de la herramienta MLXL3 Studio.

El objetivo es hacer viable la inferencia de un modelo de difusion de gran tamano en equipos Apple con memoria unificada, sin necesidad de GPU dedicada NVIDIA. El repositorio ocupa 3,6 GB e incluye 33 ficheros safetensors mas un manifest.json que registra la asignacion de bits y el digest SHA-256 de cada shard. El denoiser cuenta con 7.115.124.736 parametros y una media en disco de aproximadamente 3,9993 bits por peso, incluyendo escalas, tensores protegidos y cabeceras.

La relevancia actual radica en que demuestra un flujo de cuantizacion mixta (4 y 3 bits) sobre un transformer de difusion de ultima generacion, con verificacion byte a byte de los pesos y una evaluacion preliminar de fidelidad frente a BF16. El ejemplo publicado se genero en un Apple M5 con 24 GiB de memoria unificada, lo que situa el modelo en el terreno del hardware de consumo de gama alta Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (denoiser) del modelo base Qwen-Image-2.1, cuantizado con codec EXL3 |
| Parametros totales | 7.115.124.736 (solo denoiser) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta EXL3: 150 matrices de proyeccion a 4 bits, 74 a 3 bits, 73 tensores en BF16; media en disco ~3,9993 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License); uso comercial requiere licencia separada |
| Formato de pesos | safetensors (33 shards) + manifest.json |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del denoiser del transformer de difusion Qwen-Image-2.1. No se trata de un entrenamiento nuevo, sino de una compresion post-entrenamiento de los pesos BF16 oficiales (revision d26bb61231c349cf6b7896fa83353113880e1ba3). La calibracion se realizo en una unica NVIDIA H100 con ocho prompts, dos de ellos tareas de edicion, y 16 pasos de denoising.

De las 224 matrices de proyeccion comprimidas, 150 usan 4 bits y 74 usan 3 bits; otros 73 tensores conservan precision BF16. El manifest.json documenta la asignacion de bits y un digest SHA-256 por shard, y las cabeceras safetensors publicadas identifican las modificaciones. Los payloads de los tensores se verificaron byte a byte contra los ficheros empleados en el ejemplo. La innovacion tecnica principal es el uso del codec EXL3 de ExLlamaV3 junto con kernels Metal de MLXL3 para leer los pesos comprimidos directamente en Apple Silicon, apoyandose en el pipeline de imagen de MFLUX.

## Capacidades

- Generacion de imagenes texto-a-imagen (pipeline text-to-image).
- Tareas de edicion de imagen, segun la calibracion que incluyo dos prompts de edicion.
- Inferencia sobre Metal en Apple Silicon mediante MLXL3 Studio o el worker de terminal render.py.
- Ejecucion con parametros configurables de tamano, pasos de denoising y semilla (ejemplo: 512 x 512, 40 pasos, seed 987406473).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de imagenes en equipos Apple: el modelo permite crear imagenes texto-a-imagen en un Mac con Apple Silicon y memoria unificada, leyendo los pesos comprimidos directamente sobre Metal sin GPU NVIDIA. Es adecuado por su tamano reducido (3,6 GB de denoiser) y su integracion con MLXL3 Studio.
- Prototipado de pipelines de difusion: investigadores pueden experimentar con un transformer de difusion de gran tamano en hardware de consumo Apple, usando el worker de terminal render.py con parametros de pasos y semilla reproducibles.
- Edicion de imagenes: la calibracion incluyo tareas de edicion y el ejemplo de comparacion reporta un RMSE bajo (0,00534) en una edicion de color, lo que sugiere utilidad para retoques guiados por prompt.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia para estudiar cuantizacion mixta 3/4 bits sobre transformers de difusion, con manifest de bits y digests SHA-256 verificables.
- Investigacion academica en generacion de imagenes: al estar bajo Qwen Research License, encaja en entornos de investigacion y evaluacion que no requieran uso comercial.
- Reproduccion de resultados: gracias a la semilla, los pasos y el prompt documentados, se puede reproducir el ejemplo del teapot en un M5 con 24 GiB para validar el entorno de despliegue.
- Despliegue local sin conexion: tras la primera ejecucion (que descarga unos 5 GB de componentes auxiliares), el flujo puede operar con los pesos locales, util para entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta una evaluacion de fidelidad frente a BF16:

| Metrica | Valor |
|---|---|
| Comparaciones CUDA con semilla emparejada frente a BF16 | 5 |
| RMSE medio de pixel RGB (escala 0-1) | 0,06346 |
| RMSE minimo (edicion de color) | 0,00534 |
| RMSE maximo (escena de escaparate) | 0,15851 |
| Tiempo de denoising (M5, 24 GiB, 512x512, 40 pasos) | 3 min 59 s (excluye carga y exportacion PNG) |

El autor indica que la memoria pico, otros chips Apple y la fidelidad Metal extremo a extremo frente a BF16 quedan sin medir.

## Requisitos de hardware

- VRAM/memoria: el denoiser ocupa 3,56 GB en disco; se necesita ademas espacio para componentes auxiliares (tokenizer, text encoder Q4 y VAE, ~5 GB de descarga en la primera ejecucion).
- Hardware probado: Apple M5 con 24 GiB de memoria unificada.
- GPU recomendadas: no disponible para NVIDIA; el flujo documentado es exclusivo de Apple Silicon con Metal. La calibracion se hizo en una NVIDIA H100, pero no se documenta inferencia en GPU NVIDIA con este formato.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (probado en M5 de 24 GiB). No se documentan otros chips Apple.
- Opciones de despliegue: MLXL3 Studio (build macOS con ventana de imagen, PR #186) y worker de terminal render.py con uv y Python 3.12. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3 min 59 s de denoising para 512x512 con 40 pasos en M5; no se reportan otras metricas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros (denoiser) | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLXL3 Image21 EXL3 4 bpw (este) | 7.115.124.736 | no disponible | safetensors EXL3, 3,6 GB | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen-Image-2.1 (BF16) | no disponible en la informacion | no disponible | BF16 safetensors | qwen-research | Hugging Face (oficial) |
| Qwen-Image-2.1-mflux-q4 (mlx-community) | no disponible | no disponible | cuantizacion Q4 para MLX/MFLUX | no disponible | Hugging Face (usado como auxiliar) |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la evaluacion RMSE frente a BF16 del propio autor.

## Limitaciones y advertencias

- Licencia qwen-research: cubre investigacion y evaluacion; el uso comercial requiere una licencia separada del titular de los derechos.
- Evaluacion de fidelidad limitada: solo cinco comparaciones con semilla emparejada en CUDA; la fidelidad Metal extremo a extremo frente a BF16 no se ha medido.
- Memoria pico y comportamiento en otros chips Apple no medidos; el unico hardware validado es un M5 con 24 GiB.
- Dependencia de un flujo muy concreto: MLXL3 Studio en una build especifica (PR #186) y un arbol de codigo fijado por commit; no hay soporte documentado para otros runners.
- Primera ejecucion requiere internet y ~5 GB de componentes auxiliares.
- Riesgo de sesgos y alucinacion visual: no documentado por el autor; al ser una cuantizacion, puede introducir artefactos respecto al BF16, especialmente en escenas complejas (RMSE hasta 0,15851 en el ejemplo de escaparate).
- Idiomas soportados no disponibles; no se documentan capacidades multilingues.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni reportes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Henk0o/mlxl3-image21-exl3-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Checkpoint BF16 de referencia: https://huggingface.co/Qwen/Qwen-Image-2.1/tree/d26bb61231c349cf6b7896fa83353113880e1ba3
- Componentes auxiliares (mlx-community): https://huggingface.co/mlx-community/Qwen-Image-2.1-mflux-q4/tree/746a58556820933a2df5c75887a2570f1ad200c0
- PR de MLXL3 Studio: https://github.com/0xZKnw/mlxl3/pull/186
- Arbol de codigo fijado: https://github.com/HENK0O/mlxl3/tree/326265f11baeaf1f1beb44cb8070f28f87e3a017
- Repositorio MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- MFLUX: https://github.com/mflux-community/mflux
- Instalacion de uv: https://docs.astral.sh/uv/getting-started/installation/
- Resultados de comparacion BF16: https://huggingface.co/Henk0o/mlxl3-image21-exl3-4bpw/blob/main/examples/bf16-comparison.json
- Licencia: https://huggingface.co/Henk0o/mlxl3-image21-exl3-4bpw/blob/main/LICENSE
- Aviso de atribucion: https://huggingface.co/Henk0o/mlxl3-image21-exl3-4bpw/blob/main/Notice
