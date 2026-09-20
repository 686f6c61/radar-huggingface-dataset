# ddalcu/Qwen-Image-2.1-MLX-Serve-8bit

## Resumen

Qwen-Image-2.1-MLX-Serve-8bit es un paquete de pesos cuantizados a 8 bits del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, preparado por el desarrollador ddalcu para su servidor de inferencia mlx-serve sobre Apple Silicon. El pack ocupa 17,6 GB en el repositorio y esta disenado explicitamente para Macs con 32 GB de memoria unificada, con un pico de memoria medido de 12,95 GB durante la generacion a 1024x1024.

Tecnicamente no es un modelo nuevo, sino una reempaquetado: conserva el layout diffusers y los nombres de claves del checkpoint original, y aplica cuantizacion afina de 8 bits (group size 64) a las capas lineales de los bloques del DiT y a las lineales del codificador de texto. El resto se mantiene en precision densa: VAE en f32, `embed_tokens`, normas y las lineales pequenas o compartidas del DiT. Se han eliminado la torre de vision Qwen3-VL, el `lm_head` y los `time_conv` por fotograma del VAE, de modo que el pack es estrictamente text-to-image.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de difusion de gran tamano en un portatil Mac sin GPU dedicada, con una API HTTP compatible con `/v1/images/generations`. La advertencia principal es que, en el momento de redactar esta ficha, el pack no esta publicado de forma utilizable: solo carga en la rama no fusionada `feat/qwen-image-2.1` (PR #477) de mlx-serve, y ninguna build publicada de mlx-serve o MLX Core puede ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para text-to-image, con codificador de texto (la torre de vision Qwen3-VL del modelo base se descarta en este pack) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afino, group size 64, sobre las lineales de los bloques del DiT y las lineales del codificador de texto; VAE, `embed_tokens`, normas y lineales pequenas/compartidas del DiT se mantienen densas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors con layout y nombres de claves diffusers, cuantizados para MLX |
| Tamano del repositorio | 17,6 GB |
| Pipeline | text-to-image |
| Libreria | mlx-serve |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Relacion con el modelo base | quantized |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), y este pack no entrena nada: es unicamente un proceso de conversion y cuantizacion de pesos. El script que lo genera es `tests/convert_qwen_image21_weights.py --preset 32gb`.

Lo que si se detalla es la politica de cuantizacion: se aplica cuantizacion afina de 8 bits con group size 64 a las capas lineales de los bloques del DiT y a las lineales del codificador de texto. Se mantienen en densidad completa el VAE (en f32), `embed_tokens`, las normas y las lineales pequenas o compartidas del DiT. Se eliminan del pack la torre de vision Qwen3-VL y el `lm_head`, porque el objetivo es exclusivamente text-to-image, y tambien los `time_conv` por fotograma del VAE. La innovacion practica del autor esta en la gestion de memoria en tiempo de ejecucion: mlx-serve carga el codificador de texto por peticion y lo libera antes de la fase de denoising, de modo que el conjunto residente se reduce al DiT y al VAE.

El servidor expone generacion por difusion estandar: 40 pasos por defecto cuando se omite `steps`, CFG real (dos pasadas por paso) cuando `guidance_scale` es mayor que 1 y se proporciona un `negative_prompt`, y modo image-to-image mediante los parametros `image` y `strength`.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones configurables; la medicion publicada usa 1024x1024 y 512x512.
- Image-to-image: acepta una imagen de entrada mas un parametro `strength` para controlar cuanto se desvia de la imagen original.
- Classifier-free guidance real: con `guidance_scale` mayor que 1 y `negative_prompt` ejecuta dos forward passes por paso de denoising.
- Control del numero de pasos de muestreo mediante el parametro `steps` (40 por defecto).
- Servido mediante API HTTP local en el puerto 11234, con endpoint compatible con `/v1/images/generations` y JSON de entrada (`model`, `prompt`, `size`).
- Carga y descarga del codificador de texto por peticion para reducir el conjunto de memoria residente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: al haberse eliminado el `lm_head` y la torre de vision, el modelo no produce salida textual ni comprension visual.
- Capacidades multilingues: no disponible (los idiomas del modelo base no se documentan en la informacion proporcionada).

## Casos de uso

- Generacion de imagenes en local sobre Mac: el pack esta dimensionado para Macs de 32 GB, con 12,95 GB de pico de memoria medidos a 1024x1024, por lo que permite crear imagenes sin GPU dedicada ni servicios en la nube.
- Microservicio interno de imagenes: mlx-serve expone `/v1/images/generations` en `localhost:11234`, de modo que el modelo se puede envolver en una API propia para aplicaciones internas que necesiten generar ilustraciones bajo demanda.
- Prototipado de interfaces de usuario: generar mockups y recursos visuales a 512x512 (20 pasos en 118 s en el pack de 4 bits) durante el desarrollo de una interfaz, sin depender de APIs externas.
- Flujos de image-to-image: usar `image` mas `strength` para variaciones controladas de un boceto, una foto o un render existente, manteniendo la composicion original.
- Ajuste fino de prompts con CFG y negative prompt: al ejecutar CFG real (dos pasadas por paso), sirve para experimentar con `guidance_scale` y prompts negativos y medir su efecto sobre el resultado.
- Investigacion sobre cuantizacion de modelos de difusion: comparar los packs de 8 bits y 4 bits del mismo autor sobre el mismo checkpoint permite estudiar el compromiso entre memoria, tiempo de generacion y calidad de imagen.
- Despliegue en entornos con memoria restringida: gracias a la carga del codificador de texto por peticion y su liberacion antes del denoising, el consumo en reposo se limita al DiT y al VAE, lo que facilita convivir con otras cargas en la misma maquina.
- Reproducibilidad de un pipeline de difusion completo y abierto: licencia Apache-2.0 y pesos en safetensors con layout diffusers facilitan auditar y reproducir el proceso de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, comparativas cualitativas) en la informacion disponible. Lo unico medido por el autor son tiempos y memoria de ejecucion en un M1 Pro con 32 GB:

| Pack | Resolucion | Pasos | Tiempo total (incluye carga) | Memoria pico |
|---|---|---|---|---|
| 8 bits | 1024x1024 | 40 | 985 s (~23 s/paso) | 12,95 GB |
| 4 bits | 1024x1024 | 3 | 87 s | 9,55 GB |
| 4 bits | 512x512 | 20 | 118 s | no disponible |

No se proporcionan cifras de throughput en otras GPUs, ni comparaciones de fidelidad frente al modelo base sin cuantizar.

## Requisitos de hardware

- Plataforma: Apple Silicon con MLX. El autor indica explicitamente "para Macs de 32 GB" y las mediciones se hicieron en un M1 Pro de 32 GB.
- Memoria: pico medido de 12,95 GB con el pack de 8 bits a 1024x1024 y 40 pasos; 9,55 GB con el pack de 4 bits. El repositorio ocupa 17,6 GB en disco.
- GPU compatibles: no se documenta soporte para CUDA (NVIDIA) ni ROCm (AMD); la informacion disponible solo cubre Apple Silicon.
- Cabe en GPU de consumo: no aplica en el sentido habitual, ya que no usa VRAM discreta; si cabe en Macs de 32 GB de memoria unificada, que es el objetivo de diseno del pack.
- Opciones de despliegue: exclusivamente mlx-serve, y solo desde la rama `feat/qwen-image-2.1` (PR #477). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, y ninguna build publicada de mlx-serve o MLX Core puede cargar estos pesos. La instalacion requiere compilar desde la rama (`./scripts/fetch-zig.sh`, `./scripts/build-mlx.sh`, `zig build -Doptimize=ReleaseFast`).
- Latencia estimada: aproximadamente 23 s por paso a 1024x1024 en M1 Pro; 985 s para una generacion completa de 40 pasos incluyendo la carga. Activar CFG real con `negative_prompt` y `guidance_scale` mayor que 1 duplica los forward passes por paso, por lo que el tiempo se incrementa en consecuencia.
- Formato de pesos: safetensors cuantizados para MLX, lo que limita la portabilidad a otros runtimes.

## Comparativa con modelos similares

Solo es posible comparar variantes del mismo modelo base con los datos disponibles. Los datos de la variante de 4 bits proceden de la misma tabla publicada por el autor; el tamano de repositorio y los parametros totales del modelo base no se detallan.

| Modelo | Cuantizacion | Tamano | Memoria pico medida | Pasos por defecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ddalcu/Qwen-Image-2.1-MLX-Serve-8bit | 8 bits afina, group 64 | 17,6 GB (repo) | 12,95 GB (1024x1024, 40 pasos) | 40 | Apache-2.0 | Solo en rama no fusionada de mlx-serve (PR #477) |
| Pack de 4 bits del mismo autor | 4 bits | no disponible | 9,55 GB (1024x1024, 3 pasos) | no disponible | Apache-2.0 | Solo en rama no fusionada de mlx-serve (PR #477) |
| Qwen/Qwen-Image-2.1 (base, sin cuantizar) | ninguna (precision original) | no disponible | no disponible | no disponible | Apache-2.0 | Publicado en HuggingFace |

No se dispone de datos verificables de otros modelos de difusion comparables (por ejemplo alternativas de generacion de imagen en el rango de tamano equivalente) en la informacion proporcionada.

## Limitaciones y advertencias

- El pack no esta publicado de forma funcional: solo carga en la rama `feat/qwen-image-2.1` del repositorio mlx-serve (PR #477). Ninguna build publicada de mlx-serve o MLX Core puede ejecutarlo, y el propio autor indica que el aviso desaparecera cuando el PR se fusione.
- Dependencia de plataforma: requiere Apple Silicon y MLX. No hay ruta documentada para NVIDIA, AMD o CPU x86.
- Capacidades recortadas respecto al modelo base: se han eliminado la torre de vision Qwen3-VL y el `lm_head`, por lo que no hay comprension de imagenes ni salida de texto. Tambien se han eliminado los `time_conv` por fotograma del VAE.
- Sin benchmarks de calidad: no se ha publicado ninguna comparacion de fidelidad frente al checkpoint sin cuantizar, por lo que se desconoce la degradacion introducida por la cuantizacion de 8 bits ni la del pack de 4 bits.
- Latencia alta para uso interactivo: aproximadamente 23 s por paso a 1024x1024 en M1 Pro, lo que se traduce en unos 16 minutos para una generacion de 40 pasos con carga incluida.
- Activar CFG real (con `negative_prompt` y `guidance_scale` mayor que 1) duplica los forward passes por paso y, por tanto, el tiempo de generacion.
- Idiomas soportados: no disponible. No se documenta el comportamiento multilingue de los prompts ni la capacidad de renderizar texto dentro de la imagen.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos, y al ser una cuantizacion de un modelo base, heredaria los del checkpoint Qwen/Qwen-Image-2.1, que no se detallan aqui.
- Riesgo de alucinacion visual y de resultados inconsistentes con el prompt: inherente a los modelos de difusion, y no cuantificado para este pack.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Licencia: Apache-2.0, la misma que el modelo base, lo que permite uso comercial segun los terminos de esa licencia; conviene revisar igualmente las condiciones del checkpoint Qwen/Qwen-Image-2.1.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/ddalcu/Qwen-Image-2.1-MLX-Serve-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de mlx-serve: https://github.com/ddalcu/mlx-serve
- Pull request con el soporte necesario (rama `feat/qwen-image-2.1`): https://github.com/ddalcu/mlx-serve/pull/477
- Imagen de ejemplo generada con el pack: https://raw.githubusercontent.com/ddalcu/mlx-serve/feat/qwen-image-2.1/website/screenshots/qwen-image-2.1-8bit-1024.jpg
- Resultados de busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre este modelo (unicamente paginas generales de Microsoft, sin relacion con el modelo).
