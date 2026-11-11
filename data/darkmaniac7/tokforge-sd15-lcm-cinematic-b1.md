# darkmaniac7/TokForge-SD15-LCM-Cinematic-b1

## Resumen

TokForge-SD15-LCM-Cinematic-b1 es un paquete de inferencia para generación de imágenes texto-a-imagen derivado de Stable Diffusion 1.5, publicado por TokForge (darkmaniac7) para su aplicación móvil homónima. Combina el checkpoint fotorrealista epiCRealism de epinikion con el adaptador LCM-LoRA de SD1.5 fusionado en el UNet, lo que permite generar imágenes coherentes de 512x512 en tan solo 4 pasos de muestreo sin clasificador guía (CFG 1.0).

El modelo se distribuye en formato MNN, el motor de inferencia de Alibaba pensado para ejecución en dispositivos, y está optimizado para teléfonos Android con 8 GB de RAM o más. El UNet se exporta con pesos de 8 bits y batch 1 con altura y anchura dinámicas, mientras que el codificador de texto CLIP y el decodificador VAE usan pesos f16 del SD1.5 de referencia. El paquete completo ocupa 1,21 GB repartidos en 9 ficheros.

Su relevancia radica en la ejecución completamente local en telefonía de gama alta: una vez descargado el paquete, la generación no requiere conexión. Esta variante concreta (`-b1`) se distingue de la versión estándar únicamente en el grafo del UNet (batch 1 frente a batch 2 fijo), y está pensada para versiones recientes de TokForge (3.6.0 beta 24 en adelante, incluida la rama 1.3.x).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (CLIP ViT-L/14, UNet, VAE decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | en (inglés) |
| Licencia | CreativeML OpenRAIL-M, más los términos de epinikion en Civitai para epiCRealism (atribución, prohibición de venta) |
| Formato de pesos | MNN (`.mnn` + `.mnn.weight`), tokenizer CLIP (`vocab.json`, `merges.txt`), scheduler (`alphas.txt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de Stable Diffusion 1.5: un codificador de texto CLIP ViT-L/14, un UNet de difusión latente y un decodificador VAE. Sobre el checkpoint base epiCRealism se carga y fusiona el adaptador LCM-LoRA de SD1.5 mediante `fuse_lora` en fp32 dentro de diffusers. La fusión convierte el modelo original de muchos pasos en un modelo de pocos pasos (4 por defecto, hasta 8 para refinamiento), lo que reduce drásticamente el coste computacional en telefonía.

El proceso de exportación consiste en trazar el UNet fusionado a ONNX con batch 1 y altura/anchura dinámicas (`sample=[1,4,-1,-1]`), convertirlo a MNN con pesos de 8 bits mediante `MNNConvert` y empaquetarlo junto con el codificador de texto y el decodificador VAE de referencia de SD1.5 en f16, más los ficheros de tokenizer y scheduler. Los ficheros auxiliares son idénticos byte a byte entre todos los paquetes SD1.5 LCM de TokForge; solo `unet.mnn` difiere respecto al paquete estándar. No se documenta en la información disponible ningún proceso de entrenamiento adicional, RLHF o DPO más allá de la fusión del LoRA.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución fija de 512x512 con estética cinematográfica fotorrealista.
- Muestreo en pocos pasos (4 por defecto, hasta 8) gracias al LCM-LoRA fusionado.
- Muestreo sin guía (CFG 1.0), lo que elimina la pasada incondicional del UNet y reduce el cómputo a la mitad.
- Altura y anchura dinámicas en el UNet, aunque el ajuste documentado de render es 512x512.
- Ejecución completamente local en Android tras la descarga inicial, sin conexión a red.
- Estilo orientado a iluminación y color cinematográficos, piel y texturas naturales, personas y escenas realistas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un generador de imágenes.
- Capacidad multilingüe limitada al inglés (prompts en `en`).

## Casos de uso

- Generación de retratos fotorrealistas en móvil: la fusión de epiCRealism con LCM permite obtener retratos con piel y texturas naturales en 4 pasos directamente en el teléfono, sin subir imágenes a un servidor.
- Creación de imágenes de estilo cinematográfico para redes sociales: la estética de iluminación y color del checkpoint base encaja con publicaciones que buscan un acabado de película, con generación offline en cualquier lugar.
- Prototipado rápido de conceptos visuales en movilidad: diseñadores que necesitan iterar ideas en campo pueden generar variantes en 512x512 sin conexión, ajustando pasos hasta 8 para mayor refinamiento.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, permite generar imágenes con prompts sensibles sin que salgan del teléfono, útil en entornos con requisitos de confidencialidad.
- Integración en apps Android de terceros vía MNN: desarrolladores que ya usan el runtime MNN pueden reutilizar el paquete (UNet en 8 bits, text encoder y VAE en f16) para incorporar generación de imágenes local en sus propias aplicaciones.
- Demostraciones y experiencias educativas: el tamaño de 1,21 GB y la ejecución en CPU de teléfonos de 8 GB de RAM lo hacen viable para talleres o demos donde no se dispone de GPU ni de conectividad.
- Generación de material base para edición posterior: imágenes de 512x512 con acabado fotorrealista que sirven como punto de partida para retoque, composición o upscaling en flujos de trabajo móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para CPU de telefonía Android. El paquete descargado ocupa 1,21 GB en almacenamiento.
- Clase de dispositivo recomendada por el catálogo de TokForge: teléfonos Android con 8 GB de RAM o más.
- GPU recomendadas: no disponible; la model card indica ejecución en CPU de teléfonos Android.
- ¿Cabe en GPU de consumo? No se documenta soporte para GPU de escritorio; el formato MNN y el empaquetado están orientados a dispositivos móviles.
- Opciones de despliegue: runtime MNN dentro de la app TokForge (Google Play y TestFlight para iOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-LCM-Cinematic-b1 | no disponible (SD1.5 + LCM-LoRA) | 512x512, 4 pasos | no disponible | CreativeML OpenRAIL-M + términos de epiCRealism | Hugging Face, app TokForge |
| TokForge-SD15-LCM-Cinematic (variante estándar) | idénticos | 512x512, 4 pasos | no disponible | CreativeML OpenRAIL-M + términos de epiCRealism | Hugging Face, builds antiguas de TokForge |
| emilianJR/epiCRealism (checkpoint base) | no disponible | SD1.5 estándar | no disponible | CreativeML OpenRAIL-M + términos de epinikion | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 (adaptador) | no disponible | SD1.5 estándar | no disponible | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Licencia CreativeML OpenRAIL-M con restricciones de uso; además, epiCRealism añade los términos de epinikion en Civitai que exigen atribución y prohíben la venta. Es imprescindible revisar ambos antes de cualquier uso comercial.
- El modelo solo entiende prompts en inglés; el rendimiento con otros idiomas no está soportado ni documentado.
- Resolución fija de 512x512 en el ajuste de render documentado; no se garantiza calidad fuera de ese tamaño pese a la altura y anchura dinámicas del UNet.
- CFG 1.0 implica que no se usa prompt negativo; los controles habituales de guía no están disponibles en este flujo.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión entrenados con datos web: posibles estereotipos en personas y escenas, y artefactos en anatomía o texto dentro de la imagen.
- La variante `-b1` es incompatible con builds antiguas de TokForge (por ejemplo, 3.6.0 beta 12), que esperan batch 2 fijo y fallarían con este grafo; hay que emparejar la versión de la app con el repositorio correcto.
- El modelo está empaquetado exclusivamente para MNN y la app TokForge; no se distribuyen pesos en safetensors, GGUF ni otros formatos reutilizables en pipelines estándar de diffusers.
- No se documentan métricas de calidad, latencia ni consumo energético, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Cinematic-b1
- Variante estándar (batch 2): https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Cinematic
- Checkpoint base epiCRealism: https://huggingface.co/emilianJR/epiCRealism
- Adaptador LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight iOS: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
