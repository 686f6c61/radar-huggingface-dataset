# darkmaniac7/TokForge-SD15-LCM-Photoreal

## Resumen

TokForge-SD15-LCM-Photoreal es un paquete de inferencia para generación de imágenes a partir de texto, derivado de Stable Diffusion 1.5, empaquetado en formato MNN para ejecución en dispositivo (on-device) en teléfonos Android. Lo publica TokForge (darkmaniac7 en Hugging Face) como parte de su catálogo de estilos de imagen para su aplicación móvil. Combina el checkpoint fotorrealista Realistic Vision V5.1 de SG_161222 con el adaptador LCM-LoRA de SD1.5 fusionado en el UNet, lo que permite generar una imagen coherente de 512x512 en solo 4 pasos de muestreo con CFG 1.0 (sin guidance).

El modelo resuelve el problema de ejecutar generación de imágenes fotorrealistas en hardware móvil de gama alta sin GPU dedicada: los pesos del UNet están cuantizados a 8 bits y el encoder de texto y el decodificador VAE se exportan en f16, sumando 1,21 GB en 9 ficheros. La arquitectura subyacente es la de SD1.5 (encoder CLIP ViT-L/14, UNet y VAE), con el UNet exportado en lote fijo de 2 y latente fijo de 64x64.

Es relevante ahora como ejemplo de despliegue de difusión en el borde: muestra el patrón de fusión de LoRA de pocos pasos, cuantización selectiva por componente y exportación a un runtime móvil (MNN), aunque su utilidad práctica está acotada a versiones antiguas de la app TokForge, ya que la versión actual descarga la variante de lote 1 (TokForge-SD15-LCM-Photoreal-b1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (CLIP ViT-L/14 text encoder, UNet, VAE decoder) |
| Parametros totales | no disponible (repo de 1,2 GB en 9 ficheros; pesos UNet 862 MB en 8 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; sin longitud maxima documentada) |
| Tipos de cuantizacion | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL-M, mas terminos de Civitai de SG_161222 para Realistic Vision (atribucion, no venta, mismos permisos) |
| Formato de pesos | MNN (grafos `.mnn` y ficheros `.mnn.weight`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una fusión de pesos. Se parte de `SG161222/Realistic_Vision_V5.1_noVAE`, un checkpoint SD1.5 fotorrealista, y se carga y fusiona `latent-consistency/lcm-lora-sdv1-5` con `fuse_lora` en fp32 dentro de diffusers. El resultado se exporta a MNN como un bundle de difusión con el UNet en lote fijo de 2 (pasada condicional y no condicional), latente fijo de 64x64 y pesos de 8 bits asimétricos. El encoder de texto CLIP y el decodificador VAE se toman de los ficheros MNN de referencia de SD1.5 en f16.

La innovación técnica principal es la destilación de consistencia latente (LCM) que reduce el muestreo a 4 pasos con CFG 1.0, eliminando la necesidad de prompt negativo y de la pasada incondicional. En esta exportación concreta, el lote 2 mantiene ambas pasadas para compatibilidad con versiones antiguas de TokForge; la variante de lote 1 ejecuta una sola pasada condicional por paso. Realistic Vision V5.1 se distribuye "noVAE", por lo que se usa el VAE estándar de SD1.5. No se documentan datos de entrenamiento, número de tokens ni etapas de RLHF o DPO, ya que el autor no entrena el modelo base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con estética fotorrealista: piel natural, texturas y iluminación realistas, retratos y escenas fotográficas.
- Muestreo de pocos pasos: 4 pasos por defecto, hasta 8 para refinamiento adicional.
- Generación sin guidance (CFG 1.0), sin prompt negativo.
- Salida de 512x512 píxeles.
- Ejecución en dispositivo (on-device) en CPU de teléfonos Android mediante el runtime MNN.
- Soporte de prompts únicamente en inglés.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de retratos fotorrealistas en móvil: el modelo produce caras y piel realistas en 4 pasos, adecuado para apps de avatar o prueba de estilismo que necesiten resultados rápidos sin conexión.
- Creación de imágenes de producto y bodegón: la estética fotográfica de Realistic Vision V5.1 sirve para mockups de catálogo generados localmente en el teléfono.
- Prototipado de conceptos visuales offline: al ejecutarse en CPU sin depender de la nube, permite iterar ideas en entornos sin conectividad.
- Fotomontaje y edición asistida en apps móviles: la salida de 512x512 encaja como imagen base para pipelines de upscaling o inpainting posteriores en el dispositivo.
- Pruebas de integración de MNN: sirve como referencia para desarrolladores que quieran validar la exportación de un UNet SD1.5 con LoRA fusionada a MNN en Android.
- Compatibilidad con versiones antiguas de TokForge: mantiene operativas builds como 3.6.0 beta 12 que descargan este repositorio por su nombre exacto y alimentan al UNet un lote de 2.
- Demostraciones de difusión en el borde para investigación: permite medir latencia y consumo de RAM de un SD1.5 LCM cuantizado en hardware móvil real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan 1,13 GB, pero el autor indica que se necesita más RAM libre que ese tamaño; las builds antiguas de TokForge lo listaban para teléfonos con 8 GB de RAM o más.
- GPU recomendadas: no aplica GPU de escritorio; el destino es la CPU de teléfonos Android mediante MNN.
- Cabe en GPU consumer: no es el objetivo del paquete; no se documenta ejecución en GPU de escritorio.
- Opciones de despliegue: runtime MNN dentro de la app TokForge (Android); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-LCM-Photoreal (este) | no disponible (UNet 862 MB en 8 bits) | no disponible | 4 pasos, 512x512, CFG 1.0 | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, formato MNN |
| TokForge-SD15-LCM-Photoreal-b1 | mismos pesos, grafo UNet distinto | no disponible | 4 pasos, 512x512, CFG 1.0, lote 1 | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, formato MNN |
| SG161222/Realistic_Vision_V5.1_noVAE | SD1.5 (no disponible el conteo exacto) | no disponible | muestreo estándar de SD1.5 (decenas de pasos) | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, safetensors |
| latent-consistency/lcm-lora-sdv1-5 | LoRA sobre SD1.5 | no disponible | adaptador de pocos pasos | CreativeML OpenRAIL-M | Hugging Face, safetensors |

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de SD1.5 y Realistic Vision V5.1, hereda los sesgos de representación del dataset original; no se documenta mitigación específica.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y artefactos en escenas complejas.
- Limitaciones de idioma: solo soporta prompts en inglés.
- Limitaciones de resolución y lote: salida fija de 512x512 y UNet con lote fijo de 2 y latente fijo de 64x64 en esta exportación.
- Restricciones de licencia: CreativeML OpenRAIL-M más los términos de Civitai de SG_161222 (atribución, prohibición de venta, mismos permisos); revisar ambas antes de uso comercial.
- Caveat de producción: este repositorio es la exportación original de lote 2, mantenida solo para builds antiguas de TokForge; la app actual descarga la variante de lote 1. Las builds nuevas que esperan lote 1 fallarían con este grafo.
- Dependencia de runtime: requiere el runtime MNN y la app TokForge; no es directamente utilizable en pipelines estándar de diffusers, ComfyUI o Automatic1111 sin conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Photoreal
- Variante de lote 1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Photoreal-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base Realistic Vision V5.1: https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
