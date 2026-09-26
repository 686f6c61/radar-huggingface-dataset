# mjmiller/coreml-sdxl-vae-encoder-768

# coreml-sdxl-vae-encoder-768

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un componente de inferencia: un **encoder VAE de Stable Diffusion XL base 1.0 convertido a Core ML** y compilado para una resolución de entrada fija de 768×768 píxeles. Lo publica el usuario `mjmiller` dentro del proyecto Slowpokes Coloring (septiembre de 2026) y su función es cubrir un hueco concreto del ecosistema: el paquete oficial de Apple para iOS [`apple/coreml-stable-diffusion-xl-base-ios`](https://huggingface.co/apple/coreml-stable-diffusion-xl-base-ios) incluye el UNet troceado (chunked) y el decodificador VAE a 768², pero **no incluye el encoder VAE**, indispensable para generar imágenes a partir de una imagen de partida (img2img / SDEdit).

El único encoder SDXL que Apple publica, en el repositorio para macOS [`apple/coreml-stable-diffusion-xl-base`](https://huggingface.co/apple/coreml-stable-diffusion-xl-base), está bloqueado a una entrada fija de 1024×1024 y no es compatible con el UNet de 768² del paquete de iOS. Este repositorio aporta, según su autor, el primer encoder SDXL Core ML a 768² publicado públicamente.

Técnicamente es un artefacto pequeño (~137 MB en Float32, un único `VAEEncoder.mlmodelc` con cinco ficheros), pero con una particularidad crítica documentada por el autor: **debe ir en Float32**. En Float16 el encoder del VAE de SDXL devuelve latentes con todos los valores a NaN en CPU y GPU, porque la acumulación de las capas GroupNorm desborda el rango de fp16; solo la ruta de Neural Engine sobrevive a fp16 porque acumula internamente en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de un VAE de difusion latente (familia AutoencoderKL de SDXL), con normalizacion GroupNorm; factor de reduccion espacial 8x (768 px -> 96 px de latente) |
| Parametros totales | ~34,17 M (derivado del tamano de `weights/weight.bin`: 136.668.992 bytes en Float32); no declarado explicitamente por el autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (componente de vision; no procesa tokens de texto) |
| Tipos de cuantizacion | Float32 unicamente. Float16 produce latentes NaN en CPU y GPU por desbordamiento de GroupNorm; el autor lo desaconseja explicitamente |
| Idiomas soportados | no aplica (sin entrada ni salida de texto; el condicionamiento textual lo aportan los text encoders del pipeline SDXL) |
| Licencia | OpenRAIL++-M de Stability AI (SDXL base 1.0), segun la model card del autor; el metadato de HuggingFace figura como "no disponible" |
| Formato de pesos | Core ML compilado (`.mlmodelc`) con `model.mil` (135.577 bytes) y `weights/weight.bin`; no se distribuyen safetensors ni GGUF |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Entrada | `x`, Float32 `[1, 3, 768, 768]`, normalizada a [-1, 1], tamano fijo |
| Salida | `latent`, Float32 `[1, 8, 96, 96]` (4 canales de media + 4 de logvar) |
| Version de especificacion Core ML | Spec 7 (iOS 16 o superior) |
| Herramienta de conversion | coremltools 9.0 |
| Unidad de computo declarada en la conversion | `CPU_AND_NE` (CPU + Neural Engine) |
| Tamano del repositorio | 0,1 GB (los cinco ficheros de `compiled/VAEEncoder.mlmodelc` suman ~137 MB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

No hay entrenamiento propio: este repositorio es una **conversion de pesos ya existentes**. El autor parte de `stabilityai/stable-diffusion-xl-base-1.0` y usa la herramienta oficial `python_coreml_stable_diffusion.torch2coreml` con las opciones `--convert-vae-encoder --xl-version --latent-h 96 --latent-w 96 --compute-unit CPU_AND_NE`, seguida de una compilacion con `xcrun coremlcompiler` para producir el `.mlmodelc` final. El encoder forma parte del VAE de SDXL, un autoencoder variacional con regularizacion KL que define el espacio latente comprimido sobre el que opera el proceso de difusion; en este caso la compresion es de factor 8 por eje, de modo que una imagen de 768×768 se proyecta sobre un latente de 96×96 con 8 canales de salida (media y log-varianza).

La innovacion tecnica relevante no esta en la arquitectura, sino en las decisiones de conversion documentadas por el autor. La primera es la resolucion: el encoder de Apple esta fijado a 1024² y el paquete de iOS trabaja a 768², por lo que hacia falta un artefacto especifico. La segunda, y mas importante, es la precision: el autor verifico que en Float16 el encoder devuelve latentes completamente NaN tanto en CPU como en GPU (comportamiento identico al encoder oficial de 1024² de Apple), porque la acumulacion de GroupNorm desborda fp16; el Neural Engine no se ve afectado porque acumula en fp32. Puesto que `ml-stable-diffusion` carga los componentes VAE con la opcion `.cpuAndGPU` fijada en el codigo (`StableDiffusionXL+Resources.swift`), un encoder en fp16 rompe img2img en cualquier dispositivo que no lo enrute al ANE. Float32 es, ademas, lo que produce el propio convertidor de Apple para los componentes VAE de SDXL con `--xl-version`.

## Capacidades

- Codificacion de imagenes a espacio latente: transforma una imagen RGB de 768×768 en un latente Float32 de `[1, 8, 96, 96]` (medias y log-varianzas).
- Habilitacion de img2img / SDEdit en iOS: permite iniciar la difusion desde una imagen de partida en lugar de ruido puro, controlando el grado de transformacion con el parametro `strength`.
- Habilita variaciones de imagen, restilizado y transferencia de estilo dentro de un pipeline SDXL 768² en dispositivo.
- Funciona en combinacion con el UNet troceado y el decodificador VAE del paquete oficial de Apple para iOS.
- Inferencia 100% local: no requiere envio de imagenes ni prompts a servidores externos.
- No realiza generacion de texto, razonamiento, codigo, matematicas, tool calling ni agentes; tampoco decodificacion (eso corresponde al `VAEDecoder.mlmodelc`).
- No acepta condicionamiento por prompt directamente: el texto se procesa en los text encoders del pipeline.

## Casos de uso

- **Coloreado de ilustraciones en la app Slowpokes Coloring**: es el caso de uso declarado por el autor; la imagen se escala a 768×768, se codifica con este modelo y el pipeline aplica difusion con `strength < 1` para colorear respetando las lineas originales.
- **Sketch-to-image en iOS**: el usuario dibuja un boceto, la app lo normaliza a 768², lo codifica y genera una version acabada con el UNet de 768²; todas las piezas ya existen en el paquete de Apple salvo este encoder.
- **Restilizado de fotografias sin salida a la nube**: para aplicaciones de edicion con requisitos de privacidad, el encoder permite mantener la imagen de origen en el dispositivo durante todo el proceso.
- **Variaciones controladas de producto en catalogo**: a partir de una foto base de 768², generar variantes de fondo, iluminacion o acabado con distintos valores de `strength`, util en herramientas de e-commerce o marketing.
- **Pipelines de aumento de datos para vision**: generar versiones estilizadas o modificadas de imagenes de entrenamiento manteniendo la estructura de la original, con latentes derivados de este encoder.
- **Prototipado de interfaces generativas en iPad o iPhone**: al no requerir GPU de escritorio ni servicios externos, sirve para demos y validacion de producto con hardware de consumo.
- **Integracion en apps macOS o iOS ya basadas en ml-stable-diffusion**: cualquier proyecto que use el paquete SDXL de 768² y necesite img2img puede incorporar este artefacto copiandolo junto al decodificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad de reconstruccion (PSNR, LPIPS, FID), latencia ni consumo energetico; la unica validacion descrita es funcional: el encoder produce latentes validos en Float32 y latentes NaN en Float16 en CPU/GPU, comportamiento verificado contra el encoder oficial de 1024² de Apple.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con **iOS 16 o superior** (Core ML Spec 7); tambien utilizable en macOS mediante el stack Core ML.
- Pesos: ~137 MB en Float32 (136.668.992 bytes de `weight.bin`), que deben residir en memoria durante la inferencia, mas el coste de activaciones de una entrada de 768×768.
- Unidad de computo declarada en la conversion: `CPU_AND_NE`. El Neural Engine es la ruta mas eficiente y la unica que toleraria fp16, aunque el artefacto entregado es fp32.
- Compatible con Apple Silicon de consumo (familia A/M con Neural Engine). No se publican requisitos de VRAM, dado que no esta pensado para GPU de escritorio.
- No es ejecutable con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia para LLM: es un modelo Core ML y requiere runtime Core ML.
- Despliegue previsto: `ml-stable-diffusion` de Apple, cargando el modelo con la configuracion del pipeline SDXL; el componente VAE se instancia con `.cpuAndGPU`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Que es | Entrada | Precision | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mjmiller/coreml-sdxl-vae-encoder-768` | Encoder VAE de SDXL para Core ML, orientado a iOS 768² | Fija 768×768 | Float32 | Core ML `.mlmodelc` | OpenRAIL++-M (segun model card) | Publico en HuggingFace; 0 descargas |
| `apple/coreml-stable-diffusion-xl-base` (VAEEncoder) | Encoder VAE de SDXL incluido en el paquete oficial para macOS | Fija 1024×1024 | Float32 (el convertidor `--xl-version` produce fp32) | Core ML `.mlmodelc` | OpenRAIL++-M | Publico; mantenido por Apple |
| `apple/coreml-stable-diffusion-xl-base-ios` | Paquete oficial para iOS, sin encoder VAE | No incluye encoder | no aplica | Core ML | OpenRAIL++-M | Publico; mantenido por Apple |
| `stabilityai/sdxl-vae` | VAE afinado de SDXL en PyTorch/diffusers (AutoencoderKL) | Flexible (multiplo de 8) | fp32 / fp16 segun uso | safetensors / diffusers | OpenRAIL++-M | Publico; es el VAE de referencia del ecosistema |

La diferencia clave frente a `stabilityai/sdxl-vae` es que aquel es un modelo de PyTorch plenamente flexible en resolucion y precision, mientras que este repositorio es un artefacto compilado con entrada fija, pensado exclusivamente para el runtime Core ML. Frente al encoder de Apple, la ventaja es la resolucion de 768², que encaja con el UNet troceado de iOS.

## Limitaciones y advertencias

- **Entrada fija de 768×768**: el encoder rechaza cualquier otra resolucion; es obligatorio escalar la imagen de origen antes de la inferencia, lo que puede alterar la relacion de aspecto.
- **Float32 obligatorio**: usar Float16 produce latentes con todos los valores a NaN en CPU y GPU por desbordamiento de GroupNorm durante la acumulacion. Solo la ruta de Neural Engine tolera fp16 internamente.
- **Solo encoder**: el repositorio no incluye `VAEDecoder.mlmodelc`; hay que aportarlo desde el paquete de Apple.
- **Alucinacion**: no aplica en el sentido de generacion de texto, pero el pipeline completo (UNet + prompts) si puede introducir elementos no presentes en la imagen original segun el valor de `strength`.
- **Sesgos**: este componente no introduce sesgos por si mismo, pero el pipeline SDXL 1.0 al que sirve hereda los sesgos conocidos de sus datos de entrenamiento.
- **Licencia**: la model card indica que la licencia sigue la OpenRAIL++-M de Stability AI para SDXL base 1.0, que permite uso comercial con restricciones de uso (prohibicion de aplicaciones de vigilancia, discriminacion, desinformacion, etc.). Los metadatos de HuggingFace no declaran licencia, por lo que conviene verificar los terminos antes de un despliegue en produccion.
- **Madurez y soporte**: repositorio de autor individual, con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-25). No hay garantia de mantenimiento ni de compatibilidad con futuras versiones de coremltools o de `ml-stable-diffusion`.
- **Sin benchmarks publicados**: no hay metricas objetivas de fidelidad de reconstruccion ni de rendimiento; la validacion descrita es funcional.
- **Dependencia de versiones**: requiere coremltools 9.0 para su generacion y Core ML Spec 7 (iOS 16+) para su ejecucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mjmiller/coreml-sdxl-vae-encoder-768
- Paquete oficial de Apple para iOS (SDXL base, 768²): https://huggingface.co/apple/coreml-stable-diffusion-xl-base-ios
- Paquete oficial de Apple para macOS (SDXL base, encoder a 1024²): https://huggingface.co/apple/coreml-stable-diffusion-xl-base
- Modelo base de SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE afinado de SDXL en diffusers: https://huggingface.co/stabilityai/sdxl-vae
- Ficha y alternativas del VAE de SDXL en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/sdxl-vae-stabilityai
- Analisis de mantenimiento del paquete `stabilityai/sdxl-vae` en Socket: https://socket.dev/huggingface/package/stabilityai/sdxl-vae
- Ficha del VAE de SDXL en Inferix: https://inferix.co/models/stabilityai/sdxl-vae
- VAE alternativo en HuggingFace (`AiArtLab/sdxl_vae`): https://huggingface.co/AiArtLab/sdxl_vae
- Repositorio de `ml-stable-diffusion` citado en la model card (referencia `StableDiffusionXL+Resources.swift`): https://github.com/apple/ml-stable-diffusion
