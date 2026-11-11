# darkmaniac7/TokForge-SD15-QNN-NPU

## Resumen

TokForge-SD15-QNN-NPU es un paquete de inferencia para generación de imágenes texto-a-imagen compilado específicamente para la NPU Hexagon de Qualcomm. No es un modelo nuevo entrenado desde cero, sino la conversión y cuantización del checkpoint DreamShaper 7 (un fine-tune de Stable Diffusion 1.5 de Lykon) a binarios de contexto QNN HTP que se ejecutan directamente sobre el DSP Hexagon de teléfonos Snapdragon, sin necesidad de root. Lo publica darkmaniac7 bajo la marca TokForge para su aplicación móvil de generación de imágenes en dispositivo.

El modelo mantiene la arquitectura original de SD1.5 (UNet, decodificador VAE y codificador de texto CLIP ViT-L) pero con los pesos cuantizados a W8A16 (8 bits en pesos, 16 bits en activaciones, calibración min-max por canal) y compilados con Qualcomm AI Runtime (QAIRT) 2.40. La resolución de trabajo es 512x512 (latente de 64x64). El codificador de texto CLIP se ejecuta en CPU mediante MNN, mientras que UNet y VAE lo hacen en la NPU.

Su relevancia radica en que demuestra un pipeline completo de difusión ejecutándose íntegramente en un teléfono de gama alta con 8 GB de RAM o más (Snapdragon 8 Gen 3 o 8 Elite Gen 5), con un tamaño de descarga de 14,7 GB repartido en 86 archivos y selección por generación de Hexagon (V73, V75, V79, V81). Incluye además un complemento LCM opcional para generar en 4-8 pasos con cfg=1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet, VAE decoder, CLIP ViT-L text encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusion; entrada de texto CLIP truncada a 77 tokens por defecto en SD1.5) |
| Tipos de cuantizacion | W8A16 (8 bits pesos, 16 bits activaciones), per-channel, calibracion min-max |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL-M + terminos de Civitai de Lykon (prohibida la venta); archivos `qnn_runtime/` bajo Qualcomm AI Stack License |
| Formato de pesos | QNN HTP context binaries (`.bin`), ONNX auxiliar, MNN para CLIP en CPU |
| Resolucion | 512x512 (latente 64x64) |
| Compilador | Qualcomm AI Runtime (QAIRT) 2.40 |
| Generaciones Hexagon | V73, V75, V79, V81 |
| Tamano del repo | 19,8 GB (descarga de 14,7 GB en 86 archivos) |
| Modelo base | Lykon/dreamshaper-7 |
| Libreria | qnn |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un UNet para el proceso de denoising, un decodificador VAE para pasar del espacio latente a píxeles y un codificador de texto CLIP ViT-L. DreamShaper 7 es un fine-tune de Lykon sobre SD1.5 con el mismo contrato de E/S `temb` en la NPU; según la model card, solo difieren los pesos del UNet, el decodificador VAE y la MLP de time-embedding específica de DreamShaper, mientras que el front-end CLIP en CPU es idéntico bit a bit al de SD1.5 base y se reutiliza.

No hay información sobre el proceso de entrenamiento de DreamShaper 7 en la información proporcionada (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se documenta es el proceso de conversión: cuantización a W8A16 con calibración min-max por canal y compilación a binarios de contexto QNN HTP mediante QAIRT 2.40, con conjuntos separados por generación de Hexagon. El paquete incluye además un add-on LCM (Latent Consistency Model) para el UNet en V75 y V81, que permite generar en 4-8 pasos con cfg=1, y conjuntos de referencia de Qualcomm AI Hub para V75, V79 y V81.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 píxeles en dispositivo.
- Ejecución del UNet y del decodificador VAE en la NPU Hexagon; codificador CLIP en CPU (MNN).
- Inferencia totalmente offline una vez descargados los binarios correspondientes al dispositivo.
- Generación rápida en 4-8 pasos con cfg=1 mediante el complemento LCM opcional.
- Selección automática del conjunto de binarios según la generación de Hexagon del teléfono.
- Sin necesidad de root en el dispositivo.
- Seguimiento de prompts composicionales superior al SD1.5 base, según la model card.
- Soporte de prompts en inglés únicamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión de entrada ni audio.

## Casos de uso

- Generación de imágenes en aplicaciones móviles: integración en apps Android que necesiten crear ilustraciones a partir de texto sin conexión, aprovechando la NPU para reducir consumo y latencia frente a CPU/GPU.
- Asistentes conversacionales con salida visual: el modelo se invoca desde un chat (como en TokForge) para producir imágenes bajo demanda, con la ventaja de que una vez descargado no requiere red.
- Creación de contenido para redes sociales en el dispositivo: generación de avatares, fondos o ilustraciones 512x512 directamente en el teléfono, sin subir prompts a servicios en la nube (privacidad).
- Prototipado de pipelines de difusión en hardware móvil: referencia para desarrolladores que quieran evaluar el rendimiento de SD1.5 cuantizado en Hexagon antes de portar sus propios fine-tunes.
- Aplicaciones de privacidad sensible: generación de imágenes donde el prompt no debe salir del dispositivo, útil en entornos sanitarios, legales o corporativos.
- Demos y pruebas de concepto de IA generativa on-device: validación de latencia y calidad en Snapdragon 8 Gen 3 / 8 Elite Gen 5 para decidir si merece la pena empaquetar un modelo propio con QNN.
- Generación rápida iterativa con LCM: aplicaciones que necesiten varias variaciones en pocos segundos (4-8 pasos) para selección de estilo o brainstorming visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el paquete está pensado para teléfonos con 8 GB de RAM o más; no se especifica huella de memoria en inferencia.
- NPU: Qualcomm Hexagon de generaciones V73, V75, V79 y V81 (Snapdragon 8 Gen 3 o 8 Elite Gen 5 según la model card).
- CPU: se requiere CPU para el codificador CLIP (MNN) y para los pesos de time-embedding (`time_mlp.bin`).
- GPU: no se usa GPU para la inferencia; el pipeline es NPU + CPU.
- Consumer GPU: no aplica; no es un modelo desplegable en GPU de escritorio en este formato.
- Despliegue: exclusivamente mediante runtime QNN HTP (QAIRT 2.40) en Android; la app TokForge gestiona la descarga selectiva de binarios (unos 1,2 GB para CLIP compartido más el conjunto de la arquitectura correspondiente).
- Opciones tipo vLLM, llama.cpp, Ollama o TGI: no aplicables a este formato.
- Latencia y throughput: no disponibles en la información proporcionada; el modo LCM sugiere 4-8 pasos por imagen, pero no se documentan tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-QNN-NPU (este) | no disponible (SD1.5) | 512x512 | QNN HTP W8A16 | CreativeML OpenRAIL-M + Civitai (no venta) | Hugging Face, app TokForge |
| Lykon/dreamshaper-7 | no disponible (SD1.5) | 512x512 | safetensors/diffusers | CreativeML OpenRAIL-M + Civitai | Hugging Face |
| Stable Diffusion 1.5 base | ~860M (UNet) | 512x512 | safetensors, ONNX | CreativeML OpenRAIL-M | Hugging Face, múltiples runtimes |
| Qualcomm AI Hub SD1.5 compilado | no disponible | 512x512 | QNN/ONNX | Qualcomm AI Stack License | Qualcomm AI Hub (incluido como referencia en `aihub/`) |

## Limitaciones y advertencias

- Solo admite prompts en inglés; no hay soporte multilingüe documentado.
- Resolución fija de 512x512; no se documenta soporte de otras resoluciones.
- Riesgo de sesgos y alucinaciones visuales heredado de SD1.5 y del dataset de entrenamiento de DreamShaper 7; no se detallan sesgos concretos en la información disponible.
- Licencia restrictiva: CreativeML OpenRAIL-M más los términos de Civitai de Lykon, que prohíben vender el modelo o fusiones del mismo. Los archivos de `qnn_runtime/` están bajo Qualcomm AI Stack License, con condiciones adicionales.
- Dependencia total del ecosistema Qualcomm: no funciona en GPU de escritorio, Apple Silicon ni otras NPU; requiere Hexagon V73/V75/V79/V81 y runtime QAIRT 2.40.
- El repo incluye conjuntos de referencia (`v73/` a `v81/`, `aihub/`) que la app no usa; descargar el repo completo supone 19,8 GB, y la descarga selectiva ronda 1,2 GB más el conjunto de la arquitectura.
- La model card está marcada con `inference: false`, lo que indica que no se espera uso directo con las librerías estándar de Hugging Face.
- No hay datos publicados de latencia, throughput ni calidad (FID, CLIP score) para evaluar el impacto de la cuantización W8A16.
- El modelo tiene 0 descargas y 2 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-QNN-NPU
- Modelo base: https://huggingface.co/Lykon/dreamshaper-7
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Colección TokForge NPU Packs: https://huggingface.co/collections/darkmaniac7/tokforge-npu-packs-6ace2a2701fa913ff8ff1515
