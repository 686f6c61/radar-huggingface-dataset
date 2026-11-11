# darkmaniac7/TokForge-SD15-LCM-Style-Pixelart

## Resumen

TokForge-SD15-LCM-Style-Pixelart es un paquete de inferencia en formato MNN para generación de imágenes texto-a-imagen con estilo pixel art, derivado de Stable Diffusion 1.5. Lo publica el desarrollador darkmaniac7 bajo la marca TokForge, una aplicación de inferencia en dispositivo (on-device) para Android e iOS. El modelo fusiona tres componentes en un único UNet: el checkpoint DreamShaper 7 de Lykon como base, el adaptador LCM-LoRA SD1.5 de latent-consistency para muestreo en pocos pasos y el LoRA de estilo pixel art de SedatAl.

El resultado es un generador de 512x512 que produce imágenes coherentes en 4 pasos con CFG 1.0 (sin guidance ni prompt negativo), pensado para ejecutarse en CPU de teléfonos Android con 8 GB de RAM o más dentro de la app TokForge. No es un modelo entrenado desde cero, sino un artefacto de despliegue: los pesos del UNet van cuantizados a 8 bits y el export está trazado con batch fijo 2, lo que lo ata a versiones antiguas de la app (por ejemplo, TokForge 3.6.0 beta 12). La versión vigente de la aplicación descarga en su lugar el bundle con batch 1 dinámico.

Su relevancia es acotada pero concreta: demuestra el patrón de empaquetado de difusión para móvil (grafos MNN separados para text encoder, UNet y VAE, con pesos en f16 o int8) y sirve como referencia de cómo fusionar LoRAs de estilo y aceleradores de muestreo en un solo grafo antes del export. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, VAE decoder) |
| Parametros totales | no disponible (repo de 1,2 GB; pesos UNet 862 MB en 8 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto CLIP, 77 tokens) |
| Tipos de cuantizacion | UNet int8 asimétrico; text encoder y VAE decoder f16 |
| Idiomas soportados | en (inglés) |
| Licencia | CreativeML OpenRAIL-M, más los términos de Civitai de Lykon para DreamShaper (prohíbe la venta) |
| Formato de pesos | MNN (grafos `.mnn` + pesos `.mnn.weight`), tokenizer CLIP (`vocab.json`, `merges.txt`) y `alphas.txt` para el scheduler |
| Resolucion de salida | 512x512 fija |
| Batch del UNet | fijo en 2 (pasada condicional y no condicional) |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG scale | 1.0 (guidance-free, sin prompt negativo) |
| Libreria | MNN (Alibaba) |
| Tamano del repo | 1,2 GB (9 archivos) |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El pipeline de construcción descrito en la model card es: cargar `Lykon/dreamshaper-7` en diffusers, fusionar `latent-consistency/lcm-lora-sdv1-5` y, encima, `SedatAl/pixel-art-LoRa` mediante `fuse_lora` en fp32, un LoRA cada vez. Después se exporta el UNet fusionado a ONNX trazado con batch fijo 2 y dimensiones latentes fijas de 64x64 (equivalente a 512x512 píxeles), y se convierte al formato MNN con pesos int8 asimétricos. El text encoder y el VAE decoder son los archivos MNN de referencia de SD1.5 en f16, sin modificaciones.

La innovación técnica relevante es la fusión en tiempo de export: tanto el acelerador LCM (que permite muestreo determinista en 4 pasos sin classifier-free guidance) como el estilo pixel art quedan horneados en los pesos del UNet, de modo que el usuario no puede desactivar el estilo ni ajustar el LoRA en inferencia. El trazado con batch 2 responde a que las versiones antiguas de TokForge alimentaban siempre al UNet un lote de dos (condicional y no condicional); como con CFG 1.0 la pasada no condicional es redundante, la versión batch 1 posterior la elimina y ejecuta una sola pasada por paso. Los dos repositorios comparten todos los archivos salvo `unet.mnn` (774 KB de grafo), que es el único que difiere entre el export batch 1 y batch 2.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 en estilo pixel art retro, tipo sprite de videojuego de 16 bits.
- Muestreo en pocos pasos: 4 pasos por defecto con CFG 1.0, lo que reduce el coste computacional frente a los 20-50 pasos típicos de SD1.5.
- Estilo fijo: el LoRA de pixel art está fusionado, por lo que todas las salidas adoptan esa estética; no hay control para desactivarlo.
- Inferencia en CPU de dispositivos móviles Android mediante el runtime MNN, sin GPU dedicada.
- Soporte de prompts en inglés únicamente (tokenizer CLIP estándar, 77 tokens).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un generador de imágenes.
- No admite prompt negativo en la configuración recomendada (CFG 1.0).
- No admite resolución variable en este export (latente fijo 64x64).

## Casos de uso

- Generación de sprites y assets para prototipos de videojuegos: el estilo pixel art fusionado produce directamente imágenes con estética de sprite retro, útiles para maquetas rápidas de juegos indie sin pasar por un artista.
- Aplicaciones móviles de creatividad en dispositivo: integrable en apps Android que necesiten generar ilustraciones sin conexión ni coste de API, gracias al runtime MNN y a los pesos int8 que caben en un teléfono de 8 GB de RAM.
- Aviatares e iconos con estética retro: para apps de mensajería o perfiles que quieran un look pixelado coherente, con 4 pasos por imagen y sin guidance.
- Pruebas de concepto de pipelines de difusión en móvil: sirve como referencia para ingenieros que quieran replicar el patrón de export (fusión de LoRAs, conversión a MNN, cuantización int8 del UNet) en sus propios modelos.
- Generación de fondos e ilustraciones para demos y presentaciones: la resolución 512x512 y el estilo consistente encajan en material promocional de temática retro.
- Docencia y experimentación con LCM: permite estudiar en un artefacto pequeño cómo afecta la fusión de un adaptador de consistencia latente al muestreo en 4 pasos y CFG 1.0.
- Compatibilidad con versiones antiguas de TokForge: mantiene operativas builds como 3.6.0 beta 12 que descargan este repositorio por nombre exacto y requieren el UNet con batch 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, latencia medida) y el repositorio registra 0 descargas, por lo que no hay evidencia de rendimiento reportada por terceros.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos suman 1,13 GB (UNet int8 862 MB, text encoder f16 170 MB, VAE f16 99 MB); la app lista el modelo para teléfonos con 8 GB de RAM o más, ya que el runtime necesita memoria adicional para activaciones y buffers.
- GPU recomendadas: no aplica; el bundle está pensado para CPU móvil mediante MNN. No se documenta soporte de GPU de escritorio.
- Cabe en GPU de consumo: no es el objetivo del artefacto y no hay información sobre su ejecución en CUDA, ROCm o Metal.
- Opciones de despliegue: runtime MNN dentro de la app TokForge (Android vía Google Play, iOS vía TestFlight). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no soportan este formato.
- Latencia y throughput: no disponibles. La configuración de 4 pasos con CFG 1.0 y una sola pasada condicional (en el export batch 1) reduce el cómputo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Pasos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Pixelart (este) | SD1.5 (~860M en UNet) | 512x512 fijo | 4 (CFG 1.0) | CreativeML OpenRAIL-M + términos DreamShaper (no venta) | MNN int8/f16 | Hugging Face, 0 descargas |
| TokForge-SD15-LCM-Style-Pixelart-b1 | SD1.5 (~860M en UNet) | 512x512 dinámico | 4 (CFG 1.0) | CreativeML OpenRAIL-M + términos DreamShaper | MNN int8/f16 | Hugging Face; usado por TokForge 3.6.0 beta 24 y 1.3.x |
| Lykon/dreamshaper-7 | SD1.5 (~860M en UNet) | 512x512 (SD1.5) | 20-50 típicos | CreativeML OpenRAIL-M + términos Civitai (no venta) | safetensors (diffusers) | Hugging Face, ampliamente usado |
| latent-consistency/lcm-lora-sdv1-5 | LoRA (~135M) | SD1.5 | 4-8 (CFG 1.0) | OpenRAIL-M (heredada de SD1.5) | safetensors (LoRA) | Hugging Face |
| SedatAl/pixel-art-LoRa | LoRA | SD1.5 | según base | no disponible | safetensors (LoRA) | Hugging Face |

La diferencia clave frente a los componentes originales es el empaquetado: los tres modelos de origen son piezas de diffusers que requieren Python y GPU, mientras que este bundle es un artefacto autónomo para CPU móvil con estilo y acelerador ya fusionados. Frente al bundle batch 1, la única diferencia funcional es el grafo del UNet (batch fijo 2 frente a dinámico), lo que limita este repositorio a versiones antiguas de la app.

## Limitaciones y advertencias

- Estilo no configurable: el LoRA de pixel art está fusionado en los pesos; no se puede generar otro estilo ni desactivarlo.
- Resolución fija de 512x512 en este export (latente 64x64), sin soporte de aspect ratios distintos.
- Sin prompt negativo efectivo: a CFG 1.0 la pasada no condicional no aporta control, por lo que no se pueden excluir elementos mediante negative prompt.
- Idioma limitado al inglés; el tokenizer CLIP estándar trunca prompts a 77 tokens.
- Atado a versiones antiguas: las builds actuales de TokForge descargan el bundle batch 1; usar este repositorio con la app vigente no está soportado.
- Licencia restrictiva para uso comercial: CreativeML OpenRAIL-M impone restricciones de uso, y los términos de Civitai de DreamShaper prohíben expresamente la venta del modelo o de sus derivados.
- Riesgo de alucinación visual y artefactos propios de SD1.5: anatomía incorrecta, texto ilegible y coherencia limitada en escenas complejas, agravados por el muestreo en 4 pasos.
- Sesgos heredados de DreamShaper 7 y de los datos de entrenamiento de SD1.5, no evaluados en la model card.
- Sin métricas publicadas de calidad ni de latencia; 0 descargas y 0 likes, sin validación comunitaria.
- El repositorio no incluye código de inferencia propio: depende del runtime MNN y de la app TokForge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Pixelart
- Bundle batch 1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Pixelart-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- Adaptador LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo pixel art: https://huggingface.co/SedatAl/pixel-art-LoRa
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
