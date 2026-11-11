# darkmaniac7/TokForge-DreamShaper-8-CoreML-6bit

## Resumen

DreamShaper 8 (Core ML 6-bit) es una conversión del modelo de difusión DreamShaper 8 de Lykon a formato Core ML, empaquetada por TokForge para inferencia local en iPhone y iPad. DreamShaper 8 es a su vez un fine-tune de Stable Diffusion 1.5 orientado a generar tanto imágenes realistas como artísticas, y este paquete concreto aplica cuantización palettizada de 6 bits sobre el UNet y el codificador de texto, manteniendo el VAE en fp16, con atención `split_einsum_v2` optimizada para la Apple Neural Engine.

El artefacto no es un checkpoint de PyTorch ni de diffusers, sino un bundle de recursos compilados (`.mlmodelc`) listo para cargarse con la librería `ml-stable-diffusion` de Apple (versión 1.1.0) o mediante el instalador de la app TokForge. El repositorio ocupa 1,9 GB en total (23 archivos) y el zip que descarga la app pesa 916 MB. La resolución de salida está fijada en 512×512 en el propio modelo compilado.

Su relevancia actual reside en la generación de imágenes totalmente offline en dispositivos Apple: una vez descargado, no requiere conexión y se ejecuta sobre la Neural Engine. Está pensado para terminales con 6 GB de RAM o más e iOS 17 o superior, con retroceso a un modelo FP16 en iOS 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet, codificador de texto CLIP, VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, sin contexto de texto autoregresivo) |
| Tipos de cuantizacion | 6 bits palettizado (UNet y text encoder); VAE en fp16 |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL-M, con terminos de Civitai de Lykon (no vender el modelo ni merges) |
| Formato de pesos | Core ML `.mlmodelc` compilados (TextEncoder, Unet, VAEDecoder, VAEEncoder) + tokenizador CLIP (`vocab.json`, `merges.txt`) |
| Resolucion de salida | 512 x 512 (fija en el modelo compilado) |
| Implementacion de atencion | split_einsum_v2 (Apple Neural Engine) |
| Unidades de computo | `.cpuAndNeuralEngine` |
| Batch del UNet | 2 (classifier-free guidance estandar) |
| Herramientas de conversion | ml-stable-diffusion 1.1.0, coremltools 9.0, torch 2.8.0 |
| Tamano del repositorio | 1,9 GB (23 archivos); zip descargable de 916 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5: un UNet para el proceso de difusión, un codificador de texto CLIP y un VAE para codificar y decodificar imágenes. DreamShaper 8 es un fine-tune de Lykon sobre ese modelo base, orientado a un uso generalista que cubre estilos realistas y artísticos. Esta conversión no reentrena pesos: únicamente transforma el checkpoint original en formato diffusers a Core ML mediante `python_coreml_stable_diffusion.torch2coreml` de Apple, con `--attention-implementation SPLIT_EINSUM_V2` para adaptar la atención a la Neural Engine.

Sobre esa conversión se aplica palettización de 6 bits (`--quantize-nbits 6`) al UNet y al codificador de texto, lo que permite a la Neural Engine compilar el grafo sin una espera prolongada en la primera carga. El VAE se mantiene en fp16. La conversión alcanzó un pico de unos 9,96 GB de RAM y no necesitó `--chunk-unet`. Los recursos se empaquetan con `--bundle-resources-for-swift-cli` en la estructura que espera `StableDiffusionPipeline` de Apple y el instalador de TokForge. No se dispone de información sobre el dataset de entrenamiento original de DreamShaper 8 ni sobre procesos de RLHF o DPO, ya que no se detallan en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512, con estilos realistas y artísticos heredados de DreamShaper 8.
- Ejecución totalmente local en iPhone y iPad sobre la Apple Neural Engine, sin conexión tras la descarga.
- Classifier-free guidance estándar de SD 1.5 (CFG 7,5 recomendado), con batch 2 en el UNet.
- Control del número de pasos de muestreo (20 recomendado; 8 como mínimo y 40 para refinamiento adicional).
- Integración con la app TokForge para iOS, donde figura como «DreamShaper 8 · 6-bit (ANE)» y se usa para el estilo «Everyday».
- Soporte de prompts en inglés (único idioma declarado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un modelo puramente generativo de imágenes.
- No dispone de capacidades de visión, audio ni comprensión de texto más allá del codificador CLIP.

## Casos de uso

- Generación de imágenes offline en iOS: la app TokForge descarga el zip de 916 MB, lo descomprime y ejecuta el modelo en la Neural Engine, permitiendo crear ilustraciones sin conexión en iPhone o iPad con 6 GB de RAM o más e iOS 17 o superior.
- Prototipado de arte conceptual en movilidad: artistas y diseñadores pueden iterar prompts con 20 pasos y CFG 7,5 directamente en el dispositivo, sin depender de servicios en la nube ni de una GPU externa.
- Aplicaciones iOS nativas con `ml-stable-diffusion`: desarrolladores que integren la librería de Apple pueden cargar este bundle como pipeline de referencia y generar imágenes a 512×512 en la propia app.
- Aviata de ideas y moodboards: la resolución fija de 512×512 y el estilo generalista de DreamShaper 8 encajan en la generación rápida de bocetos para redes sociales o presentaciones.
- Demostraciones y pruebas de concepto de IA en dispositivo: útil para evaluar el rendimiento de la Neural Engine con pesos palettizados a 6 bits frente a FP16, sin infraestructura de servidor.
- Generación de imágenes con requisitos de privacidad: al ejecutarse localmente, los prompts y las imágenes no salen del dispositivo, lo que resulta adecuado para entornos con datos sensibles.
- Contenido creativo educativo: permite mostrar en talleres o aulas cómo funciona un pipeline de difusión completo en hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el modelo requiere un dispositivo con 6 GB de RAM o más según el catálogo de TokForge para iOS. No se especifica el consumo de memoria en inferencia.
- GPU/dispositivo recomendado: iPhone o iPad con Apple Neural Engine e iOS 17 o superior. En iOS 16, TokForge recurre a un modelo FP16 en lugar de este bundle.
- Compatibilidad con GPU de escritorio: no aplica; es un bundle Core ML para Apple Silicon y dispositivos iOS, no un checkpoint para CUDA.
- Despliegue: librería `ml-stable-diffusion` de Apple (Swift CLI o `StableDiffusionPipeline`), o la app TokForge para iOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Almacenamiento: 1,9 GB para el repositorio completo; 916 MB para el zip que descarga la app; 958 MB para la carpeta `Resources/` descomprimida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DreamShaper 8 Core ML 6-bit (este) | no disponible | 512×512 fija | Core ML `.mlmodelc` | CreativeML OpenRAIL-M + terminos de Civitai | Hugging Face, TokForge iOS |
| Lykon/dreamshaper-8 (original) | no disponible | 512×512 nativa (SD 1.5) | diffusers / safetensors | CreativeML OpenRAIL-M + terminos de Civitai | Hugging Face |
| Stable Diffusion 1.5 (base) | no disponible | 512×512 nativa | safetensors, diffusers | CreativeML OpenRAIL-M | Hugging Face, multiples runners |
| Conversiones Core ML FP16 de SD 1.5 | no disponible | 512×512 | Core ML | CreativeML OpenRAIL-M | Repositorios de Apple y comunidad |

La comparación directa con el original y con SD 1.5 base se ve limitada porque este paquete es una conversión de formato con cuantización, no un modelo nuevo: la calidad esperada es la de DreamShaper 8 con una ligera pérdida potencial por la palettización a 6 bits. No se dispone de datos de benchmarks que permitan comparar rendimiento numérico con las alternativas.

## Limitaciones y advertencias

- Resolución fija de 512×512: el tamaño está incorporado en el modelo compilado y no puede cambiarse en tiempo de ejecución.
- La palettización a 6 bits puede reducir ligeramente la calidad frente al original en FP16.
- Es un bundle de runtime Core ML, no un checkpoint de diffusers ni de PyTorch; no puede cargarse con las herramientas habituales de difusión en Python.
- Solo admite prompts en inglés según la metadata del modelo.
- Riesgo de sesgos y de alucinación visual inherente a Stable Diffusion 1.5 y a su dataset de entrenamiento; no se documentan mitigaciones específicas.
- Licencia CreativeML OpenRAIL-M con restricciones de uso, más los términos de Civitai de Lykon que prohíben vender el modelo o merges del mismo. El uso comercial de las imágenes generadas queda sujeto a OpenRAIL-M.
- Requiere iOS 17 o superior para usar estos pesos de 6 bits; en iOS 16 se recurre a un modelo FP16 distinto.
- Dependencia de la app TokForge o de la librería `ml-stable-diffusion` para su ejecución; no hay soporte para pipelines CUDA.
- Sin descargas ni likes en el repositorio en el momento de la consulta, lo que limita la validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-8-CoreML-6bit
- Modelo base DreamShaper 8: https://huggingface.co/Lykon/dreamshaper-8
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Herramienta de conversión de Apple: https://github.com/apple/ml-stable-diffusion
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play de TokForge: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight de TokForge para iOS: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
