# darkmaniac7/TokForge-SDXL-QNN-NPU

## Resumen
TokForge-SDXL-QNN-NPU es un paquete de inferencia de generación de imágenes texto-a-imagen compilado específicamente para la NPU Hexagon de Qualcomm, publicado por TokForge (darkmaniac7) para ejecutarse en teléfonos Snapdragon sin conexión. No es un modelo nuevo entrenado desde cero, sino una cuantización y compilación del fine-tune fotorrealista SDXL RealVisXL V4.0 Lightning de SG_161222, orientada a despliegue on-device en Android.

El paquete convierte el pipeline SDXL completo (UNet, dos codificadores de texto CLIP y decodificador VAE) en binarios de contexto QNN HTP listos para la DSP Hexagon, con el UNet cuantizado a W8A16 y los codificadores de texto en fp16. La generación se realiza en 6 pasos EulerDiscrete deterministas a 1024x1024 sin guidance (guidance_scale 0), lo que reduce a un solo pase de UNet por paso.

Su relevancia radica en que demuestra la viabilidad de ejecutar un modelo de difusión de 1024px en hardware móvil de consumo, con sets nativos para Hexagon V73, V75, V79 y V81 (Snapdragon 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 5), y con soporte opcional de IP-Adapter para preservar rostros a partir de una foto de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL (UNet + doble CLIP + VAE), compilada a binarios QNN HTP para Hexagon DSP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, sin contexto de texto en tokens) |
| Tipos de cuantizacion | UNet W8A16 (8 bits pesos, 16 bits activaciones); codificadores de texto fp16; VAE TAESDXL en MNN (CPU) |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL++-M + terminos de Civitai de SG_161222 (credito obligatorio, prohibida la venta); `qnn_runtime/` bajo Qualcomm AI Stack License |
| Formato de pesos | Binarios de contexto QNN HTP (`.bin`), MNN (`.mnn`), DLC y `.npz` en el add-on IP-Adapter |

## Arquitectura y entrenamiento
El modelo subyacente es RealVisXL V4.0 Lightning, un fine-tune fotorrealista de Stable Diffusion XL en su variante Lightning de pocos pasos, desarrollado por SG_161222. La arquitectura es la estándar de SDXL: UNet con bloques de atención, dos codificadores de texto (CLIP-L y OpenCLIP-bigG) y un VAE. TokForge no entrena el modelo, sino que lo cuantiza y compila.

La innovación técnica del paquete está en el pipeline de despliegue: el UNet se cuantiza a W8A16 y se compila a binarios de contexto QNN HTP ejecutables en la DSP Hexagon; los codificadores de texto se mantienen en fp16; el MLP de embedding combinado y el decodificador TAESDXL (VAE diminuto) se ejecutan en la CPU del teléfono vía MNN. La inferencia usa 6 pasos EulerDiscrete deterministas con espaciado trailing y predicción epsilon, y es guidance-free (guidance_scale 0, un pase de UNet por paso). Se incluyen sets nativos por generación de Hexagon (V73, V75, V79, V81) con resolución nativa de 1024px (latente 128x128), más compatibilidad hacia adelante como fallback. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre etapas de RLHF/DPO.

## Capacidades
- Generación de imágenes texto-a-imagen fotorrealistas a 1024x1024.
- Inferencia completamente on-device en la NPU Hexagon, sin necesidad de conexión tras la descarga.
- Pipeline determinista de 6 pasos con scheduler EulerDiscrete y guidance-free.
- Soporte opcional de IP-Adapter para preservar rostros de una persona a partir de una foto de referencia (add-on `ip/`).
- Codificación de prompts en inglés mediante doble tokenizador BPE (CLIP-L y OpenCLIP-bigG).
- Selección automática del set de binarios según la arquitectura Hexagon del dispositivo (`dsp_arch`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No soporta visión, audio ni modo thinking.

## Casos de uso
- Generación de imágenes en la app TokForge: el usuario pide una imagen en el chat y el modelo la renderiza en el dispositivo; adecuado porque toda la inferencia ocurre en la NPU sin conexión tras la descarga inicial.
- Retrato personalizado con foto de referencia: adjuntando una foto se activa el IP-Adapter para mantener el rostro de la persona; útil para avatares o retratos sin subir datos a la nube.
- Generación de imágenes privadas y offline: al ejecutarse íntegramente en el teléfono, los prompts y las fotos de referencia no salen del dispositivo, lo que encaja en escenarios de privacidad estricta.
- Prototipado de experiencias de imagen en apps Android: desarrolladores que quieran integrar generación de imágenes en apps Snapdragon pueden usar los binarios QNN y el driver `libsdxl_qnn_driver` como referencia de pipeline.
- Creación de contenido en movilidad: ilustraciones y fotos sintéticas de 1024px para redes sociales o borradores creativos sin depender de servicios en la nube.
- Evaluación de despliegue de difusión en NPU: investigadores que estudien cuantización W8A16, compilación QNN HTP o el equilibrio entre calidad y latencia en hardware móvil pueden usar este paquete como caso de estudio reproducible por arquitectura Hexagon.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM: no aplica; requiere al menos 12 GB de RAM en el teléfono (clase indicada por TokForge).
- SoC: Snapdragon 8 Gen 2 (Hexagon V73), 8 Gen 3 (V75), 8 Elite (V79) o 8 Elite Gen 5 (V81). TokForge ofrece actualmente esta ruta en V75 y V81 con 12 GB de RAM o más.
- Descarga: el repo completo ocupa 30.6 GB (69 archivos); la app descarga solo el set correspondiente a la arquitectura del dispositivo (unos 4.3 GB) y, si aplica, los archivos de referencia de `ip/` (unos 6.8 GB adicionales).
- No cabe en GPU de consumo ni en formato portable tipo GGUF: los binarios están compilados para la DSP Hexagon y no son portables.
- Despliegue: exclusivamente mediante la app TokForge (Google Play en Android, TestFlight en iOS) y su driver `libsdxl_qnn_driver`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SDXL-QNN-NPU | no disponible (SDXL) | 1024x1024, 6 pasos | QNN HTP por arquitectura Hexagon | OpenRAIL++-M + terminos Civitai | Hugging Face y app TokForge |
| SG161222/RealVisXL_V4.0_Lightning (base) | no disponible (SDXL) | 1024x1024 | safetensors/diffusers | OpenRAIL++-M + terminos Civitai | Hugging Face |
| Stable Diffusion XL base 1.0 | no disponible (SDXL) | 1024x1024 | safetensors/diffusers | CreativeML OpenRAIL++-M | Hugging Face |
| Paquete SD1.5 NPU de TokForge ("Fast") | no disponible (SD1.5) | menor resolucion (no detallada) | QNN HTP | no disponible | app TokForge |

## Limitaciones y advertencias
- No es un formato portable: los binarios QNN HTP dependen de la generación de Hexagon; fuera de Snapdragon compatible no se pueden ejecutar.
- Solo soporta inglés (`en`) en los prompts.
- Es un modelo de difusión: no ofrece razonamiento, código, matemáticas ni tool calling.
- Riesgo de sesgos y de representaciones inexactas o estereotipadas propias del modelo base SDXL y de su dataset de entrenamiento, no documentado en esta ficha.
- Riesgo de artefactos y de resultados no fotorrealistas en casos límite, agravado por la cuantización W8A16 y el decodificador TAESDXL (VAE diminuto) frente al VAE completo.
- Restricciones de licencia: OpenRAIL++-M más los términos de Civitai de SG_161222 exigen atribución y prohíben la venta; los archivos de `qnn_runtime/` están bajo la Qualcomm AI Stack License, con condiciones adicionales para uso comercial.
- La model card marca `inference: false` en los metadatos, lo que refleja que el paquete no se ejecuta mediante las librerías estándar de Hugging Face, sino a través de la app y el runtime QNN.
- Requiere 12 GB de RAM o más y un SoC Snapdragon soportado; en otros dispositivos TokForge usa rutas de imagen alternativas.

## Enlaces
- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SDXL-QNN-NPU
- Modelo base: https://huggingface.co/SG161222/RealVisXL_V4.0_Lightning
- Licencia CreativeML OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Coleccion TokForge NPU Packs: https://huggingface.co/collections/darkmaniac7/tokforge-npu-packs-6ace2a2701fa913ff8ff1515
