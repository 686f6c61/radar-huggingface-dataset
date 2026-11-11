# darkmaniac7/TokForge-SD15-LCM-Cinematic

## Resumen

TokForge-SD15-LCM-Cinematic es un paquete de inferencia para generación de imágenes text-to-image derivado de Stable Diffusion 1.5, publicado por el desarrollador darkmaniac7 para la aplicación TokForge. Combina el checkpoint fotorrealista epiCRealism de epinikion con el adaptador LCM-LoRA de latent-consistency, fusionado directamente en el UNet, lo que permite generar imágenes coherentes de 512x512 en tan solo 4 pasos de muestreo sin classifier-free guidance (CFG 1.0). El resultado es un estilo cinematográfico fotorrealista pensado para ejecutarse en dispositivos móviles Android.

El modelo se distribuye en formato MNN (Mobile Neural Network), un bundle de difusión que incluye el UNet con pesos de 8 bits, el text encoder CLIP ViT-L/14 en f16 y el decoder VAE en f16. Está diseñado específicamente para inferencia on-device en teléfonos, no para servidores GPU, y el repositorio ocupa 1,2 GB repartidos en 9 ficheros. La arquitectura subyacente es la de SD 1.5 estándar (text encoder CLIP, UNet y VAE), con el UNet exportado a batch fijo de 2 y latente fijo de 64x64.

Este repositorio concreto es la exportación original en batch 2, mantenida online únicamente por compatibilidad con versiones antiguas de TokForge (por ejemplo, 3.6.0 beta 12). La aplicación actual descarga la variante batch 1 (TokForge-SD15-LCM-Cinematic-b1), con UNet de dimensiones dinámicas. Es relevante para desarrolladores que quieran entender cómo se empaqueta un modelo de difusión para inferencia móvil con MNN, o para quienes mantengan builds antiguas de la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (CLIP ViT-L/14 text encoder, UNet, VAE decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; sin ventana de contexto textual más allá del tokenizador CLIP de 77 tokens) |
| Tipos de cuantizacion | UNet en 8 bits (asimétrico); text encoder y VAE decoder en f16 |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m, más términos de epinikion en Civitai para epiCRealism (atribución, prohibición de venta) |
| Formato de pesos | MNN (`.mnn` grafos + `.mnn.weight` pesos); no safetensors ni GGUF |
| Resolucion de salida | 512x512 fija |
| Batch del UNet | 2 fijo (condicional y no condicional) |
| Latente de entrada | 64x64 fijo |
| Pasos de muestreo | 4 por defecto (hasta 8 para refinamiento) |
| CFG scale | 1.0 (guidance-free) |
| Tamano del repo | 1,2 GB (9 ficheros) |
| Libreria | mnn |

## Arquitectura y entrenamiento

El modelo parte de epiCRealism, un checkpoint SD 1.5 fotorrealista de epinikion con estética de película cándida, y del LCM-LoRA SD1.5 de latent-consistency. El proceso de construcción, descrito en la model card, consiste en cargar ambos en diffusers, fusionar el LoRA en fp32 mediante `fuse_lora`, exportar el UNet fusionado a ONNX con trazado de batch fijo de 2 (pasada condicional y no condicional) y latente fijo de 64x64, y convertirlo a MNN con pesos de 8 bits. El text encoder y el VAE decoder se toman directamente de los ficheros MNN de referencia de SD 1.5 en f16.

La innovación técnica principal es la fusión del LCM-LoRA en el UNet, que permite muestreo en pocos pasos (4) sin classifier-free guidance. Como el muestreo LCM es guidance-free, la pasada no condicional del UNet no aporta nada; por eso la variante batch 1 ejecuta una sola pasada condicional por paso. No se detallan datos de entrenamiento adicionales, número de tokens ni procesos de RLHF/DPO, ya que se trata de una exportación y fusión de modelos existentes, no de un entrenamiento desde cero.

## Capacidades

- Generación de imágenes text-to-image en resolución fija de 512x512.
- Estilo cinematográfico fotorrealista: iluminación y color cinematográficos, piel y texturas naturales, personas y escenas realistas.
- Muestreo en 4 pasos (hasta 8 para refinamiento) gracias al LCM-LoRA fusionado.
- Inferencia sin guidance (CFG 1.0), lo que elimina la necesidad de prompt negativo.
- Ejecución on-device en CPU de teléfonos Android mediante MNN.
- Soporte únicamente de prompts en inglés (idioma declarado: en).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es un modelo de difusión puro.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales de entrada.

## Casos de uso

- Generación de imágenes fotorrealistas en móvil sin conexión: la app TokForge descarga el bundle y ejecuta la inferencia en CPU del teléfono, permitiendo crear imágenes cinematográficas sin enviar datos a un servidor.
- Prototipado rápido de estilos visuales: con 4 pasos y CFG 1.0, el ciclo de iteración prompt-imagen es muy corto, adecuado para explorar variaciones de iluminación y composición en un dispositivo de gama media-alta.
- Compatibilidad con builds antiguas de TokForge: este repositorio batch 2 permite que versiones como 3.6.0 beta 12 sigan funcionando, ya que esas builds alimentan al UNet un batch de 2 y fallarían con la exportación batch 1.
- Aplicaciones de edición fotográfica creativa: el estilo epiCRealism con texturas y piel naturales encaja en herramientas que generan retratos o escenas realistas para uso personal.
- Demostraciones y pruebas de concepto de inferencia MNN: sirve como referencia de cómo empaquetar un UNet SD 1.5 cuantizado a 8 bits con text encoder y VAE en f16 para despliegue móvil.
- Generación de contenido para redes sociales en movilidad: imágenes 512x512 de estética cinematográfica listas para publicar, generadas directamente en el teléfono.
- Investigación sobre fusión de LoRA y exportación a formatos móviles: el repositorio documenta paso a paso el pipeline diffusers → ONNX → MNN, útil para replicar el proceso con otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para RAM de dispositivo móvil. Los pesos suman 1,13 GB (UNet 862 MB en 8 bits, text encoder 170 MB en f16, VAE 99 MB en f16).
- RAM necesaria: las builds antiguas de TokForge lo listaban para teléfonos con 8 GB de RAM o más; la model card advierte de que necesita más RAM libre que sus 1,13 GB de pesos.
- GPU recomendadas: no aplica; la inferencia es en CPU de Android mediante MNN. No se documenta soporte para A100, H100 ni RTX 4090.
- ¿Cabe en GPU consumer? No es el objetivo del formato MNN; para uso en GPU habría que reconvertir los pesos a otro formato, lo cual no está documentado en la información disponible.
- Opciones de despliegue: app TokForge (Google Play en Android, TestFlight en iOS); el formato MNN es específico de esta librería. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusión MNN.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Pasos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-Cinematic (este) | no disponible (SD 1.5) | 512x512 fijo | 4 (hasta 8) | creativeml-openrail-m + términos epiCRealism | MNN | Hugging Face, app TokForge |
| TokForge-SD15-LCM-Cinematic-b1 | no disponible (SD 1.5) | 512x512 dinámico (alto/ancho) | 4 (hasta 8) | creativeml-openrail-m + términos epiCRealism | MNN | Hugging Face, TokForge 3.6.0 beta 24+ |
| emilianJR/epiCRealism (base) | no disponible (SD 1.5) | 512x512 | no disponible | CreativeML OpenRAIL-M + términos Civitai | safetensors/diffusers | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 (adaptador) | no disponible (LoRA) | no aplica | 4-8 | no disponible en la información | LoRA (safetensors) | Hugging Face |

La comparación más directa es con la variante batch 1 del mismo modelo: mismos pesos, solo cambia el grafo del UNet (batch 1 dinámico frente a batch 2 fijo). Frente a epiCRealism sin LCM, este bundle gana la capacidad de generar en 4 pasos sin guidance, a costa de fijar resolución y batch.

## Limitaciones y advertencias

- Resolución fija de 512x512 en esta exportación batch 2; no admite dimensiones dinámicas (la variante batch 1 sí).
- Solo soporta prompts en inglés; no hay capacidades multilingües.
- Sin prompt negativo efectivo: a CFG 1.0 el guidance está desactivado, por lo que no se puede usar negative prompt para corregir la generación.
- Riesgo de alucinación visual y artefactos propios de SD 1.5 en anatomía, manos y texto dentro de la imagen; no se documentan mitigaciones específicas.
- Sesgos conocidos de los modelos de difusión entrenados con datos web (representación demográfica, estereotipos de estilo); no se detallan análisis de sesgo en la información disponible.
- Licencia CreativeML OpenRAIL-M con restricciones de uso; además, los términos de epinikion en Civitai para epiCRealism exigen atribución y prohíben la venta. Revisar ambas licencias antes de cualquier uso comercial.
- El repositorio está mantenido solo por compatibilidad con builds antiguas de TokForge; la app actual descarga la variante batch 1, por lo que este bundle puede quedar obsoleto.
- Requiere más RAM libre que sus 1,13 GB de pesos; en dispositivos con menos de 8 GB puede fallar.
- Formato MNN específico de TokForge/MNN; no es directamente utilizable en pipelines estándar de diffusers, ComfyUI o Automatic1111 sin reconversión.
- Sin datos de benchmarks ni de latencia publicados; no se puede evaluar su calidad frente a alternativas con métricas objetivas.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Cinematic
- Variante batch 1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Cinematic-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base epiCRealism: https://huggingface.co/emilianJR/epiCRealism
- Adaptador LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (app TokForge): https://testflight.apple.com/join/jnufjzRr
