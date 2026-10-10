# ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-8bit

## Resumen

Qwen-Image-2.1-Turbo-MLX-Serve-8bit es un empaquetado cuantizado a 8 bits del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1-Turbo, preparado por el desarrollador ddalcu para mlx-serve, un servidor nativo en Zig para Apple Silicon basado en MLX. El objetivo del pack es reducir el consumo de memoria del modelo original en bf16 (17,7 GB de repositorio, 31,4 GB de pico medido) hasta unos 19,3 GB de pico, de forma que quepa en Macs de 32 GB sin renunciar al mismo resultado de renderizado de texto para una misma semilla.

Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: mantiene la estructura de directorios y los nombres de claves de diffusers del checkpoint original y solo aplica cuantizacion afina de 8 bits (grupo 64) a las capas lineales de los bloques del DiT y del codificador de texto. El VAE se conserva en f32, junto con embed_tokens, las normalizaciones y las lineales pequenas o compartidas del DiT. Se mantiene la torre de vision de Qwen3-VL para edicion por instrucciones y se eliminan lm_head y las time_conv por fotograma del VAE.

Su relevancia es practica: permite ejecutar un modelo de generacion de imagen de gran tamano en hardware de consumo Apple Silicon con una perdida de latencia moderada (7,8 s frente a 7,2 s en bf16 para 1024x1024 a 8 pasos) y con API compatible con OpenAI y Anthropic en localhost, sin Python, sin Electron y sin nube. La licencia qwen-research limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con VAE, codificador de texto y torre de vision Qwen3-VL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afina, grupo 64 (DiT y codificador de texto); VAE en f32; embed_tokens, norms y lineales pequenas/compartidas del DiT en precision completa |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement), solo uso no comercial |
| Formato de pesos | safetensors con layout diffusers, para MLX (libreria mlx-serve) |
| Tamano del repositorio | 17,7 GB |
| Resolucion y pasos | 1024x1024, esquema de muestreo fijo de 8 pasos definido en sample_sigmas de model_index.json |
| Guiado | guidance 1 por defecto; guidance_scale > 1 con negative_prompt activa CFG real (dos pasadas por paso) |
| Modalidades | texto-a-imagen, imagen-a-imagen (image + strength) y edicion por instruccion (mode: edit, con hasta 9 ref_images) |
| Version minima de runtime | mlx-serve 26.10.2 (versiones anteriores aplican el esquema de 40 pasos del modelo base) |

## Arquitectura y entrenamiento

El pack reproduce la arquitectura del modelo base Qwen-Image-2.1-Turbo, un modelo de difusion con backbone DiT. La model card confirma la presencia de bloques DiT con lineales, un VAE (mantenido en f32) y un codificador de texto cuyas lineales por capa son las que se cuantizan. Ademas se conserva la torre de vision de Qwen3-VL, necesaria para las funciones de edicion por instruccion, y se descartan lm_head y las time_conv por fotograma del VAE, que no se usan en inferencia. El empaquetado se genero con el script tests/convert_qwen_image21_weights.py --preset 32gb del repositorio de mlx-serve.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. La innovacion destacable en este artefacto es doble: por un lado, la cuantizacion selectiva de 8 bits que reduce el pico de memoria en unos 12 GB respecto a bf16 manteniendo, segun el autor, el mismo renderizado de texto a igual semilla; por otro, la gestion de memoria de mlx-serve, que carga el codificador de texto por peticion y lo libera antes del denoise, de modo que el conjunto residente queda reducido al DiT y al VAE. El modelo funciona con un calendario de muestreo fijo de 8 pasos: cualquier valor de steps solicitado se ignora, igual que en diffusers.

## Capacidades

- Generacion de imagenes a partir de texto en 1024x1024 con un calendario fijo de 8 pasos.
- Renderizado de texto dentro de la imagen, que el autor afirma identico al de bf16 para la misma semilla.
- Imagen-a-imagen mediante los parametros image y strength.
- Edicion por instruccion en modo edit, aceptando una imagen de entrada y hasta 9 imagenes de referencia (ref_images).
- CFG real opcional: con guidance_scale > 1 y negative_prompt se ejecutan dos pasadas por paso.
- Integracion con API compatible con OpenAI y Anthropic en http://localhost:11234, lo que permite invocarlo desde SDK de OpenAI, Claude Code, Cursor, Continue o Open WebUI.
- Uso mediante aplicacion de escritorio firmada para macOS (MLX-Serve.app), con pestana de imagen y menu de modelos, o via linea de comandos con curl.
- Distribucion alternativa mediante Homebrew (tap de terceros ddalcu/mlx-serve).
- No se documenta soporte de tool calling, agentes, audio, video ni capacidades multilingues especificas en la informacion disponible.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: un disenador puede lanzar peticiones a localhost:11234 con el parametro size en 1024x1024 y obtener bocetos en menos de 8 segundos por imagen en un M5 Ultra, sin depender de servicios en la nube ni enviar prompts fuera del equipo.
- Edicion de imagenes existentes por instruccion: usando mode: edit con una imagen base y hasta 9 referencias, se puede reestilizar, cambiar elementos o mantener coherencia de personaje en una serie de variaciones, aprovechando la torre de vision Qwen3-VL conservada en el pack.
- Variaciones controladas a partir de una imagen: con image + strength se generan alternativas de una foto o render respetando su estructura, util para explorar direcciones de arte en estudios pequenos.
- Generacion de recursos graficos con texto integrado: al mantener el mismo renderizado de texto que bf16, sirve para carteles, mockups de interfaz o portadas donde las tipografias deben quedar legibles.
- Automatizacion de pipelines creativos locales: al exponer una API compatible con OpenAI, se puede encadenar la generacion de imagenes dentro de scripts o flujos de CI que ya usan el SDK de OpenAI, sin adaptar el cliente.
- Prototipado en Mac de 32 GB: el pico de 19,3 GB del pack de 8 bits hace viable trabajar con un modelo de este tamano en un unico equipo de sobremesa o portatil Apple Silicon, algo que la version bf16 (31,4 GB de pico) complica.
- Trabajo offline o con requisitos de privacidad: al ejecutarse integramente en local con un binario nativo de 9 MB, es adecuado para entornos donde las imagenes o los prompts no pueden salir del equipo.
- Experimentacion con lotes de baja latencia: 7,8 s por imagen a 8 pasos permite iteraciones rapidas sobre prompts y semillas en sesiones de exploracion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor si publica mediciones de latencia y memoria realizadas en un M5 Ultra con 256 GB de RAM, que se recogen a continuacion.

| Pack | Texto-a-imagen 1024x1024 | Edicion por instruccion con 1 referencia | Pico de memoria |
|---|---|---|---|
| bf16 (Qwen/Qwen-Image-2.1-Turbo) | 7,2 s | 11,2 s | 31,4 GB |
| 8 bits (este pack) | 7,8 s | 12,5 s | 19,3 GB |
| 4 bits | 8,8 s | 11,9 s | 12,8 GB |

Las cifras son por peticion con el modelo cargado y 8 pasos. El pico de memoria corresponde a la medicion propia de MLX durante la peticion con todo residente. El autor senala que, en un Mac de este tamano, la cuantizacion ahorra memoria pero no tiempo.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX. No hay soporte CUDA ni ROCm en este pack.
- VRAM o memoria unificada: 19,3 GB de pico para el pack de 8 bits; 31,4 GB para bf16; 12,8 GB para el pack de 4 bits del mismo autor.
- Equipo objetivo declarado: Macs de 32 GB, que es el motivo de existir de esta cuantizacion.
- GPU recomendadas: no aplica en el sentido de tarjetas discretas; el autor mide sobre un Apple M5 Ultra con 256 GB. Cabe en Macs de 32 GB de memoria unificada.
- Despliegue: mlx-serve 26.10.2 o superior, disponible como MLX-Serve.app (aplicacion firmada de barra de menus), instalacion via Homebrew con el tap ddalcu/mlx-serve, o servidor local en http://localhost:11234 con API compatible con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia medida: 7,8 s por imagen texto-a-imagen a 1024x1024 y 8 pasos; 12,5 s para edicion por instruccion con una referencia, sobre M5 Ultra.
- Throughput: no disponible. Gestion de memoria relevante: mlx-serve carga el codificador de texto por peticion y lo libera antes del denoise, de modo que el conjunto residente es el DiT y el VAE.

## Comparativa con modelos similares

La comparacion mas directa es con las otras variantes del mismo modelo base, ya que no se proporcionan datos de modelos alternativos.

| Version | Formato | Pico de memoria | Texto-a-imagen 1024x1024 | Edicion con 1 referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (bf16) | safetensors diffusers | 31,4 GB | 7,2 s | 11,2 s | qwen-research | HuggingFace (Qwen/Qwen-Image-2.1-Turbo) |
| Qwen-Image-2.1-Turbo MLX-Serve 8 bits | safetensors MLX | 19,3 GB | 7,8 s | 12,5 s | qwen-research | HuggingFace (ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-8bit) |
| Qwen-Image-2.1-Turbo MLX-Serve 4 bits | safetensors MLX | 12,8 GB | 8,8 s | 11,9 s | qwen-research | HuggingFace (pack del mismo autor) |

Frente a otras familias de difusion texto-a-imagen no se dispone de datos comparativos en la informacion proporcionada, por lo que no se incluyen aqui.

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial. Los derechos del modelo original y de los pesos pertenecen al equipo de Qwen (Hangzhou Tongyi Laboratory Technology Co., Ltd.), con copyright 2026. Cualquier despliegue comercial requiere revisar LICENSE y NOTICE y, previsiblemente, una licencia aparte.
- El modelo es un artefacto de inferencia para MLX; no funciona en CUDA ni en GPUs discretas convencionales, lo que limita el despliegue a Apple Silicon.
- Dependencia de version: requiere mlx-serve 26.10.2 o superior. Con versiones anteriores se aplica el calendario de 40 pasos del modelo base, lo que dispara la latencia y probablemente la memoria.
- El numero de pasos no es configurable: el calendario de 8 pasos definido en sample_sigmas manda y cualquier valor de steps solicitado se ignora.
- No se documentan idiomas soportados, sesgos conocidos, tasas de alucinacion ni limites de contexto, por lo que no pueden evaluarse con la informacion disponible.
- Al ser una cuantizacion de 8 bits, existe riesgo de degradacion en detalles finos o en tipografias complejas, aunque el autor afirma paridad con bf16 en el renderizado de texto a igual semilla.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad ni evidencia externa de calidad.
- El pack descarta lm_head y las time_conv por fotograma del VAE; conviene verificar que ninguna funcion de edicion o video dependa de esas partes antes de integrarlo en produccion.
- Uso de un tap de Homebrew de terceros para la instalacion, lo que implica confiar en el mantenedor del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de mlx-serve en GitHub: https://github.com/ddalcu/mlx-serve
- Descarga de la aplicacion: https://github.com/ddalcu/mlx-serve/releases/latest
- Sitio web de mlx-serve: https://mlxserve.com/
- Ejemplo de imagen: https://huggingface.co/ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-8bit/resolve/main/sample.jpg
- Licencia del pack: LICENSE y NOTICE del repositorio del modelo en HuggingFace
