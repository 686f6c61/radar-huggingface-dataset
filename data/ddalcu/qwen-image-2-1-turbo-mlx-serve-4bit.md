# ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-4bit

## Resumen

Qwen-Image-2.1-Turbo-MLX-Serve-4bit es un empaquetado cuantizado a 4 bits del modelo de difusion Qwen-Image-2.1-Turbo de Qwen (Hangzhou Tongyi Laboratory), adaptado por el autor ddalcu para ejecutarse de forma nativa en Apple Silicon mediante mlx-serve. Resuelve el problema de desplegar un generador de imagenes de gran tamano en equipos con memoria unificada limitada: el pack ocupa 10,5 GB y esta pensado para Macs de 16 GB, frente a los 31,4 GB de pico de memoria que requiere la version bf16 original.

El modelo cubre generacion de imagen a partir de texto (text-to-image) y edicion de imagen guiada por instrucciones (image-to-image y modo edit), apoyandose en un Diffusion Transformer (DiT) mas un text encoder basado en la torre de vision de Qwen3-VL y un VAE. La cuantizacion se aplica a las capas lineales de los bloques del DiT y del text encoder en formato affine de 4 bits (grupo 64), manteniendo densos los elementos sensibles a la precision (VAE en f32, `embed_tokens`, normalizaciones y lineales pequenas o compartidas).

Su relevancia actual radica en que permite inferencia local sin Python, sin nube y sin GPU dedicada en hardware de consumo Apple, con tiempos medidos de 8,8 segundos por imagen de 1024x1024 en 8 pasos sobre una M5 Ultra. Es importante senalar que la licencia heredada (qwen-research) restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con text encoder basado en Qwen3-VL y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | 4 bits affine, grupo 64 (este pack); existen tambien packs de 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement, solo uso no comercial) |
| Formato de pesos | safetensors (layout diffusers, cuantizado para MLX) |

## Arquitectura y entrenamiento

El pipeline sigue el layout original de diffusers, conservando los nombres de claves del checkpoint. La cuantizacion a 4 bits afecta a las capas lineales de los bloques del DiT y a las lineales de las capas del text encoder, en formato affine con grupo de 64. Se mantienen en precision densa (sin cuantizar) el VAE (en f32), `embed_tokens`, las normalizaciones y las lineales pequenas o compartidas del DiT. Tambien se conserva la torre de vision de Qwen3-VL, necesaria para la edicion de imagen por instrucciones. Se eliminan el `lm_head` y las `time_conv` por fotograma del VAE.

El pack fue generado con el script `tests/convert_qwen_image21_weights.py --preset 16gb` del repositorio mlx-serve. La generacion usa un calendario de muestreo fijo de 8 pasos definido en `sample_sigmas` dentro de `model_index.json`; una peticion con un parametro `steps` distinto se ignora, igual que ocurre en diffusers. El valor de guia (`guidance`) es 1 por defecto, y solo al subirlo por encima de 1 junto con un `negative_prompt` se ejecuta CFG real (dos pasadas por paso). No se incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) a resoluciones como 1024x1024.
- Edicion de imagen guiada por instrucciones (modo `edit`), admitiendo una imagen base y hasta 9 imagenes de referencia (`ref_images`).
- Image-to-image clasico mediante los parametros `image` y `strength`.
- Control de la generacion mediante `guidance_scale` y `negative_prompt` (CFG real cuando la guia supera 1).
- Ejecucion nativa en Apple Silicon via MLX, sin dependencia de Python, nube ni Electron.
- Servidor con API compatible tanto con OpenAI como con Anthropic en `http://localhost:11234`, integrable con Claude Code, el SDK de OpenAI, Continue, Cursor y Open WebUI.
- Cuantizacion selectiva que preserva el VAE en f32 y componentes criticos en densidad para mantener fidelidad.
- No se documentan capacidades de tool calling, agentes, multilingueismo explicito ni modo de razonamiento, por tratarse de un modelo de generacion de imagen.

## Casos de uso

- Generacion de imagenes para diseno grafico en local: un disenador puede producir bocetos a 1024x1024 en unos 8,8 segundos por imagen en una M5 Ultra, sin enviar prompts ni material sensible a servicios en la nube.
- Edicion fotografica por instrucciones: con el modo `edit` y una o varias imagenes de referencia se pueden aplicar cambios dirigidos por texto (por ejemplo, sustituir un objeto o cambiar el estilo), util en retoque y postproduccion.
- Prototipado de conceptos de producto: generar variaciones rapidas a partir de una descripcion textual para iterar sobre propuestas visuales antes de pasar a un pipeline de renderizado mas costoso.
- Asistencia creativa integrada en herramientas de escritorio: al exponer una API compatible con OpenAI/Anthropic, se puede conectar a Claude Code, Cursor o Open WebUI para que un flujo ya existente invoque la generacion de imagenes.
- Automatizacion de material grafico interno: generar ilustraciones o iconos reproducibles mediante llamadas HTTP al endpoint `/v1/images/generations`, integrables en scripts o pipelines de CI.
- Investigacion en difusion y cuantizacion: el pack permite estudiar el impacto de la cuantizacion a 4 bits frente a 8 bits y bf16 en calidad y memoria, con un VAE denso que aísla parte de la perdida de fidelidad.
- Despliegue en portatiles de 16 GB: escenarios de demostracion, docencia o trabajo de campo donde no se dispone de GPU dedicada ni de conectividad.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las mediciones de tiempo y memoria del autor sobre una M5 Ultra (256 GB), comparando los tres packs con 8 pasos de muestreo. No se han publicado resultados de benchmarks de calidad (FID, CLIP, etc.) en la informacion disponible.

| Pack | Text-to-image 1024x1024 | Edicion por instruccion, 1 referencia | Memoria pico |
|---|---|---|---|
| bf16 (`Qwen/Qwen-Image-2.1-Turbo`) | 7,2 s | 11,2 s | 31,4 GB |
| 8 bits | 7,8 s | 12,5 s | 19,3 GB |
| 4 bits | 8,8 s | 11,9 s | 12,8 GB |

Segun el autor, la cuantizacion ahorra memoria pero no tiempo en un Mac de esta categoria. En equipos mas ajustados, mlx-serve carga el text encoder por peticion y lo libera antes del denoising, de modo que el conjunto residente se reduce al DiT y al VAE.

## Requisitos de hardware

- El pack esta disenado para Macs con 16 GB de memoria unificada; la memoria pico medida es de 12,8 GB.
- Hardware objetivo: Apple Silicon (la medicion del autor es sobre una M5 Ultra de 256 GB). No hay soporte para GPU NVIDIA o AMD en esta integracion, ya que mlx-serve se ejecuta de forma nativa sobre MLX.
- No requiere GPU dedicada; se apoya en la memoria unificada del chip Apple.
- Despliegue mediante MLX-Serve.app (aplicacion de barra de menu firmada para macOS) o instalacion con Homebrew a traves del tap `ddalcu/mlx-serve`.
- Tambien se puede invocar desde codigo con una peticion HTTP al servidor local en `http://localhost:11234`, usando endpoints compatibles con OpenAI y Anthropic.
- Requiere mlx-serve 26.10.2 o superior; versiones anteriores ejecutan el calendario de 40 pasos del modelo base en lugar de los 8 pasos del pack.
- Latencia medida por peticion con el modelo cargado: 8,8 s para text-to-image 1024x1024 y 11,9 s para edicion con una referencia. No se especifica throughput en imagenes por minuto.
- Opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este pack, que es especifico de MLX/mlx-serve.

## Comparativa con modelos similares

| Modelo / pack | Cuantizacion | Memoria pico | T2I 1024x1024 | Edicion (1 ref.) | Licencia |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (bf16) | bf16 | 31,4 GB | 7,2 s | 11,2 s | qwen-research |
| Qwen-Image-2.1-Turbo MLX-Serve 8 bits | 8 bits | 19,3 GB | 7,8 s | 12,5 s | qwen-research |
| Qwen-Image-2.1-Turbo MLX-Serve 4 bits (este) | 4 bits | 12,8 GB | 8,8 s | 11,9 s | qwen-research |

No se dispone en la informacion proporcionada de comparativas con modelos de generacion de imagen alternativos (por ejemplo, otras familias de difusion de tamano similar); por tanto, ese dato se considera no disponible.

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial. Se requiere revisar `LICENSE` y `NOTICE` para cualquier despliegue en produccion.
- Perdida de fidelidad en texto pequeno a 4 bits: el autor indica que una glifo puede salir mal (por ejemplo, el simbolo del euro en su prueba); el pack de 8 bits conserva el detalle.
- El parametro `steps` solicitado se ignora; el calendario queda fijado en 8 pasos por `sample_sigmas`.
- El CFG real solo se activa con `guidance_scale` mayor que 1 y un `negative_prompt`, lo que duplica las pasadas por paso y encarece la generacion.
- Compatibilidad: requiere mlx-serve 26.10.2 o superior; con versiones anteriores se ejecuta el calendario de 40 pasos del modelo base.
- Limitado a Apple Silicon; no hay ruta de despliegue nativa para GPU NVIDIA o AMD en este pack.
- Riesgo de sesgos y de alucinacion visual inherente al modelo base de difusion; no se documentan mitigaciones adicionales en la informacion disponible.
- No se especifican idiomas soportados en la peticion de generacion, lo que puede condicionar prompts en idiomas distintos del ingles.
- Se eliminan `lm_head` y las `time_conv` del VAE, cambios respecto al checkpoint original que conviene tener en cuenta si se reutilizan pesos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por la comunidad es todavia inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- mlx-serve (web): https://mlxserve.com/
- mlx-serve (GitHub): https://github.com/ddalcu/mlx-serve
- Descarga de MLX-Serve.app: https://github.com/ddalcu/mlx-serve/releases/latest
- Tap de Homebrew: https://github.com/ddalcu/mlx-serve (comando `brew tap ddalcu/mlx-serve https://github.com/ddalcu/mlx-serve`)
- Imagen de muestra: https://huggingface.co/ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-4bit/resolve/main/sample.jpg
- Licencia del modelo: LICENSE y NOTICE en el repositorio de HuggingFace
