# H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA

## Resumen

MiniMax-H3-Tiny-17B-Pruned-Ref2VA es un checkpoint del transformer de generación conjunta de vídeo y audio MiniMax-H3, reducido de 33,12B a 17,07B parámetros mediante poda estructurada sin reentrenamiento. Lo publica el proyecto independiente H3-Tiny, no afiliado a MiniMax, y deriva del modelo base MiniMaxAI/MiniMax-H3 en su variante Ref2VA (reference-to-video + audio). El checkpoint conserva únicamente el transformer en formato diffusers; el text encoder, los VAE y los procesadores deben tomarse del checkpoint oficial de MiniMax H3.

La poda elimina 8 de los 50 bloques del transformer y reduce el rango de las capas AdaLN a 8, lo que rebaja el coste de memoria y cómputo manteniendo el pipeline de inferencia original con 50 pasos de muestreo. Al ser un checkpoint training-free, no ha pasado por una fase de destilación ni de fine-tuning posterior a la poda, por lo que su calidad depende directamente de la robustez del modelo original frente a la eliminación de bloques.

Es relevante para quien necesite desplegar generación de vídeo con audio sincronizado a partir de imágenes de referencia en hardware más modesto que el requerido por el modelo de 33B, aceptando la pérdida de fidelidad asociada a una poda agresiva y las restricciones de la licencia comunitaria de MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (variante Ref2VA de MiniMax-H3), con capas AdaLN; checkpoint podado del transformer |
| Parametros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo distribuye safetensors sin cuantizar; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | No disponible (modelo multimodal vídeo/audio; no se documenta cobertura lingüística de los prompts) |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors en layout diffusers (`config.json` + shards); existe versión single-file para ComfyUI en otro repo |

## Arquitectura y entrenamiento

El modelo es la variante Ref2VA del transformer de MiniMax-H3, un modelo de difusión que genera vídeo y audio de forma conjunta condicionado por texto e imágenes de referencia. La poda aplicada por H3-Tiny es estructurada: se han eliminado 8 de los 50 bloques del transformer y se ha reducido el rango de las capas AdaLN a 8, pasando de 33,12B a 17,07B parámetros. Según la model card, el proceso es training-free: no hay entrenamiento, destilación ni recuperación de pesos tras la poda, de modo que el checkpoint funciona directamente tras el recorte.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones de decodificación o atención específicas más allá del esquema de muestreo con 50 pasos. El repositorio contiene solo el transformer; el pipeline completo requiere cargar el text encoder, los VAE y los procesadores del checkpoint oficial MiniMax-H3 en formato diffusers, tal como muestra el ejemplo de `load_pipeline` de la librería `h3tiny`.

## Capacidades

- Generación de vídeo condicionada por texto e imágenes de referencia (reference-to-video), con 124 fotogramas en el ejemplo de inferencia de la model card.
- Generación de audio conjunta y sincronizada con el vídeo dentro del mismo pipeline (Ref2VA).
- Soporte de múltiples imágenes de referencia mediante marcadores tipo `<Picture 1>` en el prompt.
- Muestreo con 50 pasos de difusión.
- Integración con diffusers y con un pipeline propio (`h3tiny.pipeline.load_pipeline`).
- Compatibilidad con ComfyUI mediante un checkpoint single-file publicado en un repositorio aparte.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking; no aplica a un modelo generativo de vídeo/audio.

## Casos de uso

- Prototipado rápido de vídeo generativo: el checkpoint de 17B permite iterar sobre prompts y referencias en una sola GPU, usando el modelo de 33B solo para la validación final.
- Generación de clips con audio para previsualización de guiones: a partir de una o varias imágenes de referencia y un prompt, se obtiene un vídeo con pista de audio sincronizada en 50 pasos.
- Pruebas de concepto en estudios pequeños: el menor requisito de memoria frente al modelo base facilita desplegar el pipeline en estaciones de trabajo con una sola GPU de gama alta.
- Investigación sobre poda de modelos de difusión: al ser un checkpoint training-free derivado de un modelo conocido, sirve como referencia para medir el impacto de eliminar bloques y reducir el rango AdaLN.
- Integración en ComfyUI para flujos de trabajo de creación de contenido: la versión single-file del repositorio ComfyUI permite montar el nodo de generación sin gestionar shards de safetensors.
- Evaluación comparativa de calidad frente al modelo base: útil para decidir si la reducción de parámetros es aceptable en un pipeline de producción concreto antes de invertir en el modelo completo.
- Generación de material audiovisual de referencia para doblaje o storyboarding, siempre que la licencia comunitaria lo permita en el territorio y uso previstos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 17,07B parámetros en safetensors de precisión completa, los pesos del transformer ocupan del orden de 34 GB, a lo que hay que sumar text encoder, VAE y activaciones del pipeline completo.
- GPU recomendadas: no documentadas por el autor; por tamaño de pesos, se requiere al menos una GPU con 40-80 GB de VRAM para el transformer a precisión nativa, o bien offloading.
- Cabe en GPU de consumo: no disponible; la model card menciona opciones de offloading en el README de GitHub, lo que sugiere que el pipeline puede ejecutarse con gestión de memoria en GPU de menor VRAM, pero no se aportan cifras.
- Opciones de despliegue: diffusers, pipeline propio `h3tiny`, ComfyUI (checkpoint single-file), y backends de atención configurables según el README del proyecto.
- Latencia y throughput: no disponibles; se especifican 50 pasos de muestreo y 124 fotogramas en el ejemplo, sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-Pruned-Ref2VA | 17,07B (transformer) | No disponible | Sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (diffusers, safetensors) |
| MiniMax-H3 Ref2VA (base) | 33,12B (transformer) | No disponible | Sin datos en la información disponible | MiniMax H3 Community License | Hugging Face (modelo oficial) |
| H3-Tiny 14B (variante del proyecto) | 14B (según la model card) | No disponible | Sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (colección H3-Tiny) |

No se dispone de datos de benchmarks ni de otros modelos comparables de generación conjunta vídeo+audio en la información proporcionada.

## Limitaciones y advertencias

- La poda es training-free: no hay recuperación de calidad tras eliminar 8 de 50 bloques y reducir el rango AdaLN, por lo que es esperable una degradación de fidelidad frente al modelo base de 33B; no se cuantifica en la información disponible.
- El repositorio contiene solo el transformer; sin el text encoder, VAE y procesadores del checkpoint oficial MiniMax-H3 el modelo no es funcional.
- Licencia MiniMax H3 Community License: incluye ámbito territorial y política de uso aceptable; es imprescindible revisar el acuerdo antes de cualquier uso comercial.
- El proyecto H3-Tiny es independiente y no está afiliado ni respaldado por MiniMax.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; los prompts y referencias condicionan fuertemente el resultado y no hay evaluación publicada al respecto.
- Solo 523 descargas y 4 likes en el momento de la ficha: ecosistema pequeño, con soporte limitado a GitHub issues y la pestaña Community.
- No se documentan variantes cuantizadas oficiales; el despliegue en GPU de consumo requerirá offloading o cuantización por cuenta del usuario, sin garantías de compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA/blob/main/LICENSE-MiniMax-H3
- Issues: https://github.com/fuyi25/MiniMax-H3-Tiny/issues
- Contacto: fohoo@outlook.com
