# darkmaniac7/TokForge-DreamShaper-8-LCM-CoreML-6bit

## Resumen

TokForge-DreamShaper-8-LCM-CoreML-6bit es una conversión a Core ML del modelo de generación de imágenes DreamShaper 8 LCM de Lykon, empaquetada por TokForge para su ejecución en dispositivos Apple (iPhone e iPad) mediante la Neural Engine. No se trata de un modelo nuevo ni de pesos reentrenados: es una redistribución en formato Core ML con cuantización palettizada de 6 bits del UNet y del codificador de texto, mientras que el VAE se mantiene en fp16. El resultado es un bundle de aproximadamente 1,85 GB (23 archivos) que Apple `ml-stable-diffusion` puede cargar directamente.

El modelo base, DreamShaper 8 LCM, es un ajuste fino de Stable Diffusion 1.5 orientado a muestreo de pocos pasos mediante Latent Consistency Models (LCM), lo que permite generar imágenes en 4-8 pasos en lugar de los 20-50 habituales. Esta conversión concreta está pensada para inferencia totalmente local en iOS 17 o superior, sin conexión a internet una vez descargado el bundle, y con una resolución fija de 512 x 512 integrada en el modelo compilado.

Su relevancia actual radica en que demuestra un flujo completo de despliegue de difusión en el borde (edge): conversión PyTorch a Core ML con atención SPLIT_EINSUM_V2, palettización de 6 bits y empaquetado para la CLI Swift de Apple. Es un artefacto de interés para desarrolladores que quieran integrar generación de imágenes en apps iOS sin depender de servicios en la nube, aunque su uso queda limitado por la licencia OpenRAIL-M y los términos de Civitai del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 con UNet ajustado para LCM (Latent Consistency Model), codificador de texto CLIP y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje; entrada de texto CLIP truncada a 77 tokens por prompt) |
| Tipos de cuantizacion | Palettizacion de 6 bits en UNet y text encoder; VAE en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | CreativeML OpenRAIL-M, mas terminos de Civitai de Lykon (prohibida la venta del modelo o de fusiones) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) dentro de un zip de 891 MB y carpeta `Resources/` de 958 MB; no es safetensors ni GGUF |
| Resolucion de salida | 512 x 512 fija, integrada en el modelo compilado |
| Componentes | `TextEncoder`, `Unet`, `VAEDecoder`, `VAEEncoder` (`.mlmodelc`) y tokenizer CLIP (`vocab.json`, `merges.txt`) |
| Herramientas de conversion | ml-stable-diffusion 1.1.0, coremltools 9.0, torch 2.8.0 |
| Atencion | split_einsum_v2 (optimizada para Apple Neural Engine) |
| Unidades de computo | `.cpuAndNeuralEngine` |
| Tamano del repo | 1,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5: un UNet con bloques residuales y atención cruzada, un codificador de texto CLIP y un VAE para codificar y decodificar latentes. Sobre esa base, DreamShaper 8 LCM incorpora un ajuste fino con Latent Consistency Distillation, que entrena al UNet para predecir directamente la solución de la ecuación diferencial de difusión en pocos pasos, permitiendo muestreo en 4-8 iteraciones con guiado bajo (CFG cercano a 1,0).

Esta conversión concreta no reentrena pesos. El proceso consistió en cargar `Lykon/dreamshaper-8-lcm` en formato diffusers, convertir UNet, text encoder, VAE decoder y VAE encoder a Core ML con `python_coreml_stable_diffusion.torch2coreml` usando `--attention-implementation SPLIT_EINSUM_V2`, aplicar palettización de 6 bits (`--quantize-nbits 6`) y empaquetar los recursos compilados para la CLI Swift (`--bundle-resources-for-swift-cli`). La conversión alcanzó un pico de unos 9,9 GB de RAM y no requirió `--chunk-unet`. No se dispone de información sobre el dataset de entrenamiento del modelo original ni sobre el número de tokens utilizados, más allá de lo que hereda de Stable Diffusion 1.5.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 x 512 píxeles, con resolución fija impuesta por el modelo compilado.
- Muestreo de pocos pasos (4-8 pasos en TokForge) gracias al ajuste LCM, adecuado para inferencia interactiva en dispositivo.
- Ejecución en Apple Neural Engine mediante Core ML, con inferencia totalmente local tras la descarga del bundle.
- Funcionamiento sin conexión a red una vez descargado el modelo, lo que permite uso offline en iPhone e iPad.
- Soporte de prompts en inglés (idioma declarado: en).
- Integración con Apple `ml-stable-diffusion` y su pipeline `StableDiffusionPipeline` de Swift, incluyendo la CLI oficial.
- Compatibilidad con palettización de 6 bits para reducir huella de memoria frente a fp16.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni entrada multimodal; es exclusivamente un modelo de difusión de imagen.

## Casos de uso

- Generación de imágenes offline en apps iOS: una aplicación de edición fotográfica o de creatividad puede integrar el bundle y generar ilustraciones 512 x 512 sin llamadas a servidores, usando la Neural Engine para reducir consumo energético y latencia.
- Prototipado rápido de conceptos visuales en movilidad: diseñadores que trabajan en iPad pueden iterar prompts con 4-8 pasos y CFG 1,0 para obtener bocetos en segundos, sin depender de conectividad.
- Funcionalidad premium en apps de mensajería o redes sociales: generación de avatares, fondos o stickers a partir de descripciones de texto, ejecutada en el propio dispositivo para evitar costes de API y problemas de privacidad.
- Herramientas educativas de IA generativa: demostraciones en aula o talleres donde se explica el funcionamiento de los modelos de difusión y la conversión a Core ML sin requerir GPU dedicada ni cuenta en la nube.
- Pruebas de concepto de despliegue edge para equipos de investigación: sirve como referencia reproducible del pipeline `torch2coreml` con `SPLIT_EINSUM_V2` y palettización de 6 bits para validar rendimiento y calidad en hardware Apple.
- Aplicaciones de accesibilidad: generación de imágenes descriptivas bajo demanda en el dispositivo para usuarios con discapacidad visual, manteniendo los datos en local.
- Integración en pipelines de CI para validación de modelos Core ML: el bundle permite comprobar que las versiones de ml-stable-diffusion, coremltools y torch producen artefactos cargables por `StableDiffusionPipeline`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el bundle ocupa 1,85 GB en disco (zip de 891 MB); la ejecución requiere al menos 4 GB de RAM según la clase de dispositivo indicada, y se recomienda iOS 17 o superior con 8 GB de RAM o más para usar el modelo de 6 bits como opción rápida por defecto.
- GPU recomendadas: no aplica GPU de escritorio; el destino es la Apple Neural Engine de iPhone e iPad mediante Core ML con `.cpuAndNeuralEngine`.
- Compatibilidad con GPU de consumo: no está pensado para RTX 4090, A100 ni H100; es un artefacto Core ML para silicio Apple. En iOS 16 la app recurre a un modelo FP16 en lugar de este de 6 bits.
- Opciones de despliegue: Apple `ml-stable-diffusion` (CLI Swift y `StableDiffusionPipeline`), app TokForge para iOS vía TestFlight, y cualquier integración que cargue los `.mlmodelc` y el tokenizer CLIP incluidos.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo está configurado para 4-8 pasos con scheduler DPM-Solver++ y CFG 1,0 en TokForge, lo que reduce el coste frente a muestreo estándar de SD 1.5.
- La conversión original requirió un pico de aproximadamente 9,9 GB de RAM en el equipo de conversión, sin necesidad de `--chunk-unet`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-DreamShaper-8-LCM-CoreML-6bit | no disponible | prompt CLIP (77 tokens) | 512 x 512 fija | Core ML 6-bit palettizado | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, app TokForge iOS |
| Lykon/dreamshaper-8-lcm (base) | no disponible | prompt CLIP (77 tokens) | 512 x 512 (SD 1.5) | diffusers / safetensors | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |
| Stable Diffusion 1.5 (Runway/CompVis/Stability) | no disponible | prompt CLIP (77 tokens) | 512 x 512 | safetensors, CKPT | CreativeML OpenRAIL-M | Hugging Face, múltiples runners |
| Apple ml-stable-diffusion (conversiones Core ML de SD) | no disponible | prompt CLIP (77 tokens) | variable según conversion | Core ML | heredada del modelo base | GitHub apple/ml-stable-diffusion |

La comparación relevante es frente al modelo base y a otras conversiones Core ML: este bundle se distingue por la palettización de 6 bits y la atención SPLIT_EINSUM_V2, orientadas a Neural Engine, mientras que el modelo base en diffusers requiere PyTorch y GPU. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: el tamaño está integrado en el modelo compilado y no puede cambiarse en tiempo de ejecución.
- Ausencia de scheduler LCM nativo en `ml-stable-diffusion`: fuera de TokForge es necesario usar un scheduler de pocos pasos como DPM-Solver++ para obtener buenos resultados con 4-8 pasos.
- La palettización de 6 bits puede reducir ligeramente la calidad respecto al original en FP16.
- Es un bundle de runtime Core ML, no un checkpoint de diffusers o PyTorch; no puede cargarse directamente en pipelines estándar de PyTorch.
- Idioma limitado al inglés; los prompts en otros idiomas pueden degradar la calidad.
- Riesgo de sesgos y alucinaciones visuales heredado de Stable Diffusion 1.5 y de los datos de entrenamiento del modelo original, no documentados en la información disponible.
- Licencia CreativeML OpenRAIL-M con restricciones de uso, más los términos de Civitai de Lykon que prohíben vender el modelo o fusiones del mismo.
- Dependencia de iOS 17 o superior para el modelo de 6 bits; en iOS 16 la app cae a un modelo FP16.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria.
- El autor del bundle es un tercero (darkmaniac7/TokForge), no el autor original de los pesos; la atribución a Lykon es obligatoria.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-8-LCM-CoreML-6bit
- Modelo base: https://huggingface.co/Lykon/dreamshaper-8-lcm
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Apple ml-stable-diffusion: https://github.com/apple/ml-stable-diffusion
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play de TokForge: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight de TokForge: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
