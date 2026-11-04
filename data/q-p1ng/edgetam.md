# Q-P1NG/edgetam

## Resumen

EdgeTAM es un modelo de segmentación y seguimiento de objetos ("track anything") diseñado por Meta para ejecutarse en dispositivos de borde. Deriva de la familia SAM 2 (Segment Anything Model 2) y fue presentado en CVPR 2025 con el artículo "EdgeTAM: On-Device Track Anything Model". Su objetivo es reducir el coste computacional de la segmentación interactiva con memoria temporal, de modo que pueda ejecutarse en tiempo real en hardware con recursos limitados sin renunciar a la calidad de las máscaras.

La ficha que nos ocupa no es el modelo original en PyTorch, sino una copia sin modificar de la exportación ONNX en precisión completa publicada por onnx-community (`onnx-community/EdgeTAM-ONNX`), redistribuida por el usuario Q-P1NG para que su aplicación descargue los ficheros desde una ubicación estable. El repositorio pesa aproximadamente 0,0 GB según HuggingFace, aunque los ficheros listados en la model card suman del orden de 40 MB entre pesos y metadatos.

El modelo se distribuye con licencia Apache 2.0 y está pensado para tareas de generación de máscaras y seguimiento de objetos en vídeo o imagen, no para generación de texto. Su relevancia actual radica en la combinación de un encoder de visión y un decoder de prompts ligeros que permiten segmentación interactiva por puntos y cajas en entornos ONNX, con verificación de integridad mediante SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión con encoder de imagen y decoder de prompts/máscaras (familia SAM 2 / EdgeTAM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos ONNX en precisión completa (float32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vision_encoder.onnx` + `.onnx_data`, `prompt_encoder_mask_decoder.onnx` + `.onnx_data`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de SAM 2 adaptado para eficiencia en dispositivo: un encoder de visión que procesa la imagen de entrada a 1024 x 1024 píxeles (RGB, reescalado por 1/255 y normalizado con media y desviación de ImageNet) y produce tres mapas de embeddings de resoluciones 32x256x256, 64x128x128 y 256x64x64. Un segundo módulo, el encoder de prompts y decoder de máscaras, recibe puntos (`input_points` con forma `[1, 1, N, 2]`), etiquetas (`input_labels`, con 1 para objeto, 0 para fondo y -10 para padding) y cajas opcionales (`input_boxes` con forma `[1, B, 4]`, B = 0 o 1), junto con los embeddings de imagen, y devuelve puntuaciones IoU (`iou_scores`), máscaras predichas en forma de logits (`pred_masks` con forma `[1, 1, 3, 256, 256]`) y un logit de presencia de objeto (`object_score_logits`).

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; estos datos corresponden al artículo original de EdgeTAM y no se reproducen aquí. La innovación destacable es la reducción de cómputo respecto a SAM 2 para permitir inferencia en tiempo real en dispositivos de borde, manteniendo la memoria temporal para seguimiento de objetos. La exportación ONNX separa el encoder de visión del decoder de prompts, lo que facilita ejecutar cada componente en el runtime adecuado.

## Capacidades

- Segmentación de objetos a partir de puntos de clic (positivos y negativos) sobre una imagen.
- Segmentación guiada por caja delimitadora (`input_boxes` con una sola caja por inferencia).
- Generación de múltiples máscaras candidatas por prompt (tres máscaras con sus puntuaciones IoU).
- Predicción de presencia de objeto mediante `object_score_logits` (valores por encima de 0 indican objeto presente).
- Seguimiento de objetos en vídeo gracias a la herencia de la familia SAM 2 (memoria temporal), aunque la exportación ONNX documentada se centra en imagen y prompts.
- Ejecución en ONNX Runtime, apta para despliegue en CPU y dispositivos de borde.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües; es exclusivamente un modelo de visión.

## Casos de uso

- Segmentación interactiva en aplicaciones de edición de imagen: el usuario hace clic sobre un objeto y el decoder de prompts devuelve hasta tres máscaras candidatas con puntuaciones IoU para elegir la mejor.
- Herramientas de anotación semiautomática: los equipos de etiquetado pueden generar máscaras iniciales por punto o caja y refinarlas, reduciendo el tiempo por imagen gracias a la inferencia ONNX en CPU.
- Seguimiento de objetos en vídeo en dispositivos de borde: la arquitectura heredada de SAM 2 permite mantener la identidad de un objeto a lo largo de fotogramas en cámaras o drones con recursos limitados.
- Eliminación de fondo o recorte en aplicaciones móviles: el encoder de visión produce embeddings que el decoder convierte en máscaras binarias para composición o sustitución de fondo.
- Análisis de imágenes médicas o industriales asistido: segmentación de regiones de interés marcadas por un operador mediante puntos o cajas, con verificación de integridad de los pesos por SHA-256 antes de su uso.
- Integración en pipelines de visión por computador: al ser ONNX, puede encadenarse con otros modelos en ONNX Runtime o en servidores de inferencia que acepten este formato, separando el encoder (costoso, una vez por imagen) del decoder (rápido, por prompt).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos ONNX suman aproximadamente 40 MB (19,5 MB del encoder de visión y 21 MB del decoder), por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible; al ser un modelo orientado a dispositivo de borde, está pensado para ejecutarse en CPU y aceleradores ligeros, aunque puede ejecutarse en GPU convencionales mediante ONNX Runtime con proveedor CUDA.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido de los pesos, aunque no se proporcionan cifras oficiales de VRAM ni de latencia.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, CoreML, DirectML u otros proveedores), dado que el repositorio solo contiene ficheros ONNX; no se incluyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| EdgeTAM (esta ficha, ONNX) | no disponible | imagen 1024x1024 | Segmentación y seguimiento | Apache 2.0 | ONNX |
| SAM 2 (Meta) | no disponible | imagen/vídeo | Segmentación y seguimiento | Apache 2.0 | PyTorch |
| SAM (Meta) | no disponible | imagen | Segmentación | Apache 2.0 | PyTorch |
| MobileSAM | no disponible | imagen | Segmentación | Apache 2.0 | PyTorch |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a la categoría funcional y la licencia.

## Limitaciones y advertencias

- El repositorio no incluye el modelo original en PyTorch ni pesos cuantizados; solo la exportación ONNX en precisión completa, lo que limita su uso a runtimes compatibles con ONNX.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingües.
- Las máscaras se devuelven como logits de 256x256, por lo que es necesario aplicar posprocesado (umbral y redimensionado) para obtener máscaras a resolución completa.
- El decoder acepta como máximo una caja por inferencia (`B = 0` o `1`) y un conjunto de puntos por prompt; no se documentan modos por lotes.
- Riesgo de segmentación incorrecta en objetos ambiguos, oclusiones o imágenes de baja calidad; las puntuaciones IoU deben usarse para filtrar candidatas.
- No se han publicado en esta ficha datos sobre sesgos del modelo; al ser un modelo de visión, los sesgos dependen del dataset de entrenamiento original de EdgeTAM, no documentado aquí.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el fichero `LICENSE` y la atribución a Meta Platforms, Inc. y a los autores del artículo.
- La aplicación que redistribuye estos ficheros verifica su SHA-256; cualquier modificación de los pesos invalida esa comprobación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Q-P1NG/edgetam
- Exportación ONNX original: https://huggingface.co/onnx-community/EdgeTAM-ONNX
- Modelo base en HuggingFace: https://huggingface.co/facebook/EdgeTAM
- Port a transformers: https://huggingface.co/yonigozlan/EdgeTAM-hf
- Repositorio oficial en GitHub: https://github.com/facebookresearch/EdgeTAM
- Artículo (CVPR 2025): "EdgeTAM: On-Device Track Anything Model", Zhou et al.
