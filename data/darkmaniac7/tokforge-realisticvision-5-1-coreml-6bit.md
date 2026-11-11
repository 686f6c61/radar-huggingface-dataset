# darkmaniac7/TokForge-RealisticVision-5.1-CoreML-6bit

## Resumen

TokForge-RealisticVision-5.1-CoreML-6bit es una conversión a Core ML del modelo de difusión estable Realistic Vision V5.1 de SG_161222, publicada por TokForge para inferencia local en dispositivos Apple. No se trata de un modelo nuevo: es el mismo UNet, text encoder y VAE de Stable Diffusion 1.5 afinados para fotorrealismo, empaquetados en formato `.mlmodelc` con cuantización paletizada de 6 bits y atención `split_einsum_v2`, de modo que el grafo pueda compilarse y ejecutarse en la Apple Neural Engine de iPhone y iPad.

El problema que resuelve es la distribución de generación de imágenes fotorrealistas sin conexión ni servidores: el bundle pesa 1,87 GB (23 archivos, con un zip de 917 MB que es lo único que descarga la app), requiere 6 GB de RAM o más e iOS 17 o posterior, y produce imágenes fijas de 512 x 512. La relevancia es acotada: es un artefacto de despliegue para la app TokForge, no un checkpoint utilizable en PyTorch o diffusers.

La arquitectura subyacente es la de Stable Diffusion 1.5 (UNet, CLIP ViT-L/14 como text encoder y VAE), con el UNet y el text encoder en 6 bits paletizados y el VAE en fp16. El repositorio no incluye pesos sin cuantizar ni variantes GGUF o safetensors, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet, CLIP text encoder, VAE); bundle Core ML con atencion split_einsum_v2 |
| Parametros totales | no disponible (SD 1.5, no se indica recuento en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de prompt (limite estandar del text encoder CLIP de SD 1.5) |
| Tipos de cuantizacion | 6 bits paletizado (UNet y text encoder); VAE en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | CreativeML OpenRAIL-M, mas terminos de Civitai de SG_161222 (atribucion obligatoria, prohibida la venta del modelo o de fusiones) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) dentro de un zip y de la carpeta `Resources/`; no hay safetensors ni GGUF |
| Tamano del repositorio | 1,9 GB (23 archivos); zip descargable de 917 MB |
| Resolucion de salida | 512 x 512, fija en el modelo compilado |
| Lote del UNet | 2 (para classifier-free guidance) |
| Herramientas de conversion | ml-stable-diffusion 1.1.0, coremltools 9.0, torch 2.8.0 |
| Unidades de computo | `.cpuAndNeuralEngine` |
| Modelo base | SG161222/Realistic_Vision_V5.1_noVAE |

## Arquitectura y entrenamiento

El modelo es una conversión de formato, no un reentrenamiento. Se partió de `SG161222/Realistic_Vision_V5.1_noVAE` en formato diffusers (la conversión diffusers incluye un VAE funcional) y se convirtieron UNet, text encoder, VAE decoder y VAE encoder a Core ML mediante `python_coreml_stable_diffusion.torch2coreml` de Apple, con `--attention-implementation SPLIT_EINSUM_V2`. Después se aplicó paletización de 6 bits (`--quantize-nbits 6`) para que la Neural Engine compile el grafo sin una primera carga excesivamente larga, y se empaquetaron los recursos compilados para la CLI de Swift (`--bundle-resources-for-swift-cli`). El pico de memoria durante la conversión fue de unos 10,9 GB de RAM, sin necesidad de `--chunk-unet`.

No hay información sobre el dataset de entrenamiento del modelo base más allá de que es un fine-tune de Stable Diffusion 1.5 orientado a fotorrealismo, ni sobre procesos de RLHF o DPO, que no aplican a un modelo de difusión de este tipo. La innovación técnica relevante es exclusivamente de despliegue: atención `split_einsum_v2` compatible con ANE, paletización de 6 bits y un bundle que la app TokForge descarga y descomprime en el dispositivo.

## Capacidades

- Generación de imágenes texto-a-imagen con estética fotorrealista, heredada del fine-tune Realistic Vision V5.1.
- Ejecución totalmente local en iPhone y iPad mediante Core ML y la Apple Neural Engine, sin conexión tras la descarga.
- Integración en la app TokForge para iOS, donde se usa en los estilos "Photoreal" y "Sharp (chip)".
- Clasificación como modelo "mature" (fotorrealista) en el catálogo de la app: solo aparece tras activar modelos para adultos.
- Control de la generación mediante prompt en inglés, pasos (20 recomendados; 8 como mínimo, 40 para refinamiento adicional) y CFG (7,5 recomendado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking".
- No soporta otros idiomas distintos del inglés en el prompt de forma fiable, al usar el tokenizador CLIP original.
- No soporta resoluciones distintas de 512 x 512 ni inpainting/outpainting de serie a través de este bundle (aunque incluye VAEEncoder, la app no documenta esas funciones).

## Casos de uso

- Generación de retratos fotorrealistas en el dispositivo: el modelo produce caras y piel realistas a 512 x 512 con 20 pasos y CFG 7,5, sin enviar el prompt ni la imagen a ningún servidor, lo que resulta adecuado para apps de privacidad estricta.
- Creación de imágenes de referencia para diseño de personajes: al ser un fine-tune orientado a fotografía, sirve para explorar variaciones de iluminación y encuadre de retrato antes de pasar a un pipeline de mayor resolución.
- Prototipado rápido de conceptos visuales en movilidad: con la app TokForge en un iPhone de 6 GB de RAM o más, un diseñador puede iterar prompts en el tren o en entornos sin conectividad.
- Ilustración de contenido para apps de blogging o notas personales: el bundle se integra en el flujo de iOS y permite generar una imagen de acompañamiento sin coste de API ni dependencia de la nube.
- Filtros y estilos "Photoreal" y "Sharp (chip)" dentro de TokForge: el modelo ya está seleccionado por la app para esos looks, por lo que sirve como motor de generación de esos presets sin trabajo de integración adicional.
- Demostraciones y docencia sobre difusión en el borde: al ser un artefacto Core ML reproducible (ml-stable-diffusion 1.1.0, coremltools 9.0, torch 2.8.0), sirve para explicar cuantización paletizada y ejecución en ANE con un caso real y medible en tamaño (917 MB de zip).
- Evaluación comparativa de calidad 6 bits frente a fp16: permite medir la pérdida visual introducida por la paletización en un SD 1.5 fotorrealista, útil para decidir el nivel de cuantización en un producto móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el modelo requiere un dispositivo con 6 GB de RAM o más (clase de teléfono indicada por TokForge para iOS). El repositorio ocupa 1,9 GB y el zip descargable 917 MB.
- GPU recomendadas: Apple Neural Engine de iPhone y iPad con iOS 17 o posterior; no está pensado para GPU de escritorio NVIDIA o AMD.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el destino es el silicio Apple (ANE). No se documenta ejecución en RTX 4090, A100 o H100.
- Opciones de despliegue: app TokForge para iOS (TestFlight) y, en teoría, la CLI de Swift de Apple `ml-stable-diffusion` con los recursos compilados; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; solo se documentan los parámetros de render (20 pasos, CFG 7,5, atención `split_einsum_v2`, `.cpuAndNeuralEngine`).
- Memoria durante la conversión (referencia para reproducirla): pico de unos 10,9 GB de RAM sin `--chunk-unet`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-RealisticVision-5.1-CoreML-6bit | no disponible (SD 1.5) | 77 tokens de prompt; 512 x 512 fijo | Core ML 6 bits paletizado | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face; uso via TokForge iOS |
| SG161222/Realistic_Vision_V5.1_noVAE (base) | no disponible (SD 1.5) | 77 tokens; 512 x 512 (resolucion nativa) | safetensors/diffusers | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |
| Stable Diffusion 1.5 (Runway/CompVis/Stability) | no disponible | 77 tokens; 512 x 512 | safetensors, diffusers, Core ML (via ml-stable-diffusion) | CreativeML OpenRAIL-M | Hugging Face, múltiples runtimes |
| Apple ml-stable-diffusion (conversiones oficiales) | no disponible | 77 tokens; 512 x 512 | Core ML (fp16 y paletizado) | CreativeML OpenRAIL-M (segun modelo base) | GitHub de Apple |

La comparación relevante es de formato y despliegue, no de calidad: este bundle es el mismo modelo base que Realistic Vision V5.1, con pérdida potencial de calidad por la paletización de 6 bits y con la resolución bloqueada a 512 x 512. Frente a las conversiones oficiales de Apple, la diferencia está en el empaquetado para la app TokForge y en la atención `split_einsum_v2` con 6 bits.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: el tamaño está incorporado en el modelo compilado y no puede cambiarse en tiempo de inferencia.
- La paletización de 6 bits puede reducir ligeramente la calidad frente al original en fp16; no se han publicado métricas de esa pérdida.
- Es un bundle de runtime Core ML, no un checkpoint de diffusers ni de PyTorch: no se puede cargar directamente en pipelines habituales de Stable Diffusion.
- Solo admite prompts en inglés, al conservar el tokenizador CLIP original de SD 1.5.
- Ventana de prompt de 77 tokens, límite estándar de CLIP en SD 1.5; prompts largos se truncan.
- Riesgo de sesgos y de contenido no deseado inherente a Stable Diffusion 1.5 y a su fine-tune fotorrealista; la app lo marca como modelo "mature", lo que indica contenido potencialmente sensible.
- Riesgo de alucinación visual: manos, texto en imagen, anatomía y perspectivas complejas pueden generar artefactos, como en cualquier SD 1.5.
- Licencia CreativeML OpenRAIL-M con restricciones de uso, más los términos de Civitai de SG_161222: atribución obligatoria, prohibición de vender el modelo o fusiones derivadas y obligación de mantener los mismos permisos en derivados. Revisar ambos textos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, y procede de un publicador individual (darkmaniac7) en nombre de TokForge; conviene verificar la integridad de los archivos antes de desplegarlo.
- Dependencia de iOS 17 o posterior y de 6 GB de RAM o más; no funciona en dispositivos Apple por debajo de ese umbral.
- No hay información publicada sobre latencia, throughput ni consumo energético en dispositivos concretos.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-RealisticVision-5.1-CoreML-6bit
- Modelo base (SG161222/Realistic_Vision_V5.1_noVAE): https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- Coleccion TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
- Apple ml-stable-diffusion: https://github.com/apple/ml-stable-diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
