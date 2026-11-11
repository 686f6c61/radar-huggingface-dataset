# darkmaniac7/TokForge-SD15-LCM-MNN

## Resumen

TokForge-SD15-LCM-MNN es un paquete de inferencia en formato MNN para generación de imágenes texto-a-imagen en dispositivos Android, publicado por TokForge (tokforge.ai) bajo el identificador `darkmaniac7/TokForge-SD15-LCM-MNN`. Se trata de una exportación del checkpoint DreamShaper 7 de Lykon (arquitectura Stable Diffusion 1.5) con el adaptador de consistencia LCM-LoRA SD1.5 fusionado en el UNet, lo que permite generar imágenes coherentes de 512x512 en 4 a 8 pasos con muestreo sin guiado (CFG 1.0) y sin pase de prompt negativo.

El modelo no es un transformer de lenguaje ni un modelo fundacional nuevo: es un artefacto de despliegue optimizado para ejecución local en teléfonos, con pesos del UNet cuantizados a 8 bits asimétricos, text encoder CLIP ViT-L/14 y decodificador VAE en f16. El repositorio ocupa 2,4 GB, aunque la descarga efectiva del bundle son 1,21 GB repartidos en 9 ficheros. Esta variante concreta es la exportación original con batch fijo de 2 (pase condicional y no condicional), mantenida en línea únicamente por compatibilidad con versiones antiguas de la app TokForge (por ejemplo, 3.6.0 beta 12); las versiones actuales descargan la variante batch-1 `TokForge-SD15-LCM-MNN-b1`.

Su relevancia es acotada y muy específica: demuestra un pipeline completo de fusión de LoRA, exportación a ONNX con trazado fijo y conversión a MNN con cuantización de 8 bits para llevar difusión estable a CPU de móvil. Para desarrolladores e investigadores es útil como referencia de empaquetado on-device más que como modelo generativo de propósito general, dado que no admite inferencia remota (`inference: false`), no tiene descargas ni likes y su licencia arrastra las restricciones del checkpoint base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (CLIP ViT-L/14 text encoder, UNet, VAE decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de texto CLIP de 77 tokens (referencia SD1.5) |
| Tipos de cuantización | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m, más los términos de Civitai de Lykon para DreamShaper (prohíbe la venta) |
| Formato de pesos | MNN (`.mnn` grafo + `.mnn.weight` pesos), más tokenizer CLIP (`vocab.json`, `merges.txt`) y `alphas.txt` del scheduler |
| Resolución de salida | 512x512 (latente fijo 64x64) |
| Batch del UNet | fijo 2 (condicional y no condicional) |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG scale | 1.0 (sin guiado) |
| Tamaño del repo | 2,4 GB (descarga del bundle: 1,21 GB, 9 ficheros) |
| Librería | mnn |
| Pipeline | text-to-image |
| Modelos base | Lykon/dreamshaper-7, latent-consistency/lcm-lora-sdv1-5 (relación: merge) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 sin modificaciones estructurales: un text encoder CLIP ViT-L/14 que proyecta el prompt a embeddings, un UNet que realiza la difusión en el espacio latente y un decodificador VAE que reconstruye la imagen a 512x512. La innovación no está en el entrenamiento sino en la composición: el adaptador LCM-LoRA SD1.5 se fusiona en el UNet mediante `fuse_lora` en fp32 sobre el checkpoint DreamShaper 7 de Lykon, de modo que el modelo resultante produce muestras coherentes en 4-8 pasos en lugar de los 20-50 típicos de SD1.5, y funciona a CFG 1.0 sin pase de prompt negativo.

El proceso de exportación documentado por el autor es: cargar `Lykon/dreamshaper-7` en diffusers, fusionar `latent-consistency/lcm-lora-sdv1-5`, exportar el UNet fusionado a ONNX con trazado a batch fijo de 2 y latente fijo de 64x64, convertir a MNN con pesos de 8 bits, y añadir el text encoder y el VAE decoder de referencia de SD1.5 en MNN f16 junto con el tokenizer y el scheduler. Como el LoRA solo altera el UNet, el resto de ficheros son idénticos byte a byte (mismo sha256) entre los bundles de la familia TokForge SD1.5 LCM. No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni etapas de RLHF/DPO, ya que el autor no reentrena el modelo base.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 a partir de prompts en inglés.
- Muestreo few-step: 4 pasos por defecto y hasta 8 para refinamiento, con CFG 1.0.
- Muestreo sin guiado (guidance-free), sin necesidad de prompt negativo.
- Ejecución on-device en CPU de teléfonos Android mediante el runtime MNN.
- Estilización mediante LoRAs adicionales: la familia TokForge SD1.5 LCM incluye variantes Cartoon, Vintage, Storybook Illustration y Pixel Art que añaden un LoRA de estilo sobre este mismo bundle.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión de entrada, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés (tokenizer CLIP de SD1.5).
- No soporta inferencia remota en Hugging Face (`inference: false`).

## Casos de uso

- Generación de imágenes offline en apps Android: el bundle se integra en TokForge y permite crear ilustraciones 512x512 sin conexión, usando el runtime MNN sobre CPU y 4 pasos de muestreo para reducir latencia.
- Compatibilidad con versiones antiguas de la app: este repo existe para que builds como TokForge 3.6.0 beta 12, que siempre alimentan al UNet un batch de 2, sigan funcionando sin crash; es su caso de uso principal y explícito.
- Referencia de empaquetado on-device: sirve como plantilla para convertir un checkpoint SD1.5 + LoRA a MNN con UNet en 8 bits y encoder/VAE en f16, útil para equipos que quieran replicar el pipeline en sus propias apps.
- Prototipado de estilización rápida: combinado con los bundles de estilo de la colección, permite generar variaciones cartoon, vintage, storybook o pixel art en el mismo runtime sin cambiar el motor.
- Pruebas de cuantización y rendimiento: al tener una variante batch-1 con pesos idénticos, permite comparar el coste de un pase condicional frente a un batch de dos en CPU móvil con el mismo UNet cuantizado.
- Demos educativas de difusión few-step: con 4 pasos y CFG 1.0, el modelo ilustra el funcionamiento de LCM en entornos con recursos limitados, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas FID, CLIP score, IS ni comparaciones cuantitativas con otros modelos; solo describe los ajustes de render (4 pasos, CFG 1.0, 512x512) y el tamaño de los ficheros.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU; el modelo está pensado para CPU de móvil Android. El bundle pesa 1,21 GB en disco y requiere más RAM libre que sus 1,13 GB de pesos.
- RAM: las builds antiguas de TokForge lo listaban para dispositivos con 8 GB de RAM o más; la app actual no le asigna clase de catálogo.
- GPU recomendadas: no disponible; el despliegue documentado es CPU de teléfono. No se mencionan A100, H100 ni RTX 4090.
- ¿Cabe en GPU consumer? No es el objetivo del bundle; al ser un artefacto MNN para Android, no se documenta ejecución en GPU de escritorio.
- Opciones de despliegue: runtime MNN dentro de la app TokForge (Android vía Google Play; iOS vía TestFlight). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. Solo se indica que 4 pasos es el valor por defecto y que el batch-1 reduce el trabajo por paso a un único pase condicional en lugar de dos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Pasos típicos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-MNN (este) | SD1.5 + LCM-LoRA fusionado | 512x512 | 4-8, CFG 1.0 | MNN, UNet 8 bits, encoder/VAE f16 | creativeml-openrail-m + términos de DreamShaper | Hugging Face, uso en app TokForge |
| TokForge-SD15-LCM-MNN-b1 | SD1.5 + LCM-LoRA fusionado | 512x512 dinámico | 4-8, CFG 1.0 | MNN, batch 1 dinámico | creativeml-openrail-m + términos de DreamShaper | Hugging Face; descargado por TokForge 3.6.0 beta 24 y 1.3.x |
| Lykon/dreamshaper-7 | SD1.5 | 512x512 | 20-50 típicos | safetensors (diffusers) | creativeml-openrail-m + términos de Civitai | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 | LoRA sobre SD1.5 | 512x512 | 4-8 | safetensors (LoRA) | openrail (según repo original) | Hugging Face |

La comparación relevante es interna a la familia TokForge: este repo y el batch-1 comparten todos los pesos salvo el grafo `unet.mnn`, y solo se diferencian en el trazado del batch. Frente a DreamShaper 7 sin fusionar, la diferencia es el número de pasos y la ausencia de guiado. No se dispone de datos de benchmarks para comparar calidad objetivamente con otras alternativas.

## Limitaciones y advertencias

- Licencia restrictiva para uso comercial: CreativeML OpenRAIL-M se suma a los términos de Civitai de Lykon para DreamShaper, que prohíben la venta. Verificar antes de cualquier despliegue comercial.
- Solo inglés: el tokenizer CLIP de SD1.5 limita los prompts a ese idioma.
- Resolución fija de 512x512 en esta exportación (latente 64x64 y batch 2 fijos); no admite otras resoluciones ni batches distintos.
- Sin prompt negativo efectivo: a CFG 1.0 el pase no condicional no aporta nada, por lo que no se puede guiar la generación con negativos.
- Riesgo de sesgos y alucinación visual inherente a SD1.5 y a los datos de entrenamiento de DreamShaper 7; no se documentan mitigaciones.
- Artefacto obsoleto por diseño: la app actual descarga la variante batch-1, y este repo se mantiene solo por compatibilidad con builds antiguas; no recibirá mejoras funcionales.
- Requiere más RAM libre que sus 1,13 GB de pesos; en dispositivos con menos de 8 GB puede fallar según las builds antiguas.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de texto.
- Sin métricas publicadas de calidad, latencia o consumo, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-MNN
- Variante batch-1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-MNN-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- Adaptador LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
