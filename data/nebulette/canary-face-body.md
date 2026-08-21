# nebulette/canary-face-body

## Resumen

El modelo `nebulette/canary-face-body` es un detector de objetos especializado en la detección de caras y otras partes del cuerpo humano, desarrollado por el usuario de Hugging Face `nebulette`. Se trata de una adaptación de un "tagger" denominado Canary, al que se le ha añadido una cabeza de detección de objetos (bounding boxes) manteniendo la predicción de logits original. El modelo está pensado para tareas de visión por computador, concretamente detección de regiones de interés en imágenes, con etiquetas como `face`, `feet`, `belly`, `boobs`, `ass` y `pussy`.

El modelo tiene aproximadamente 119,35 millones de parámetros y un tamaño de repositorio de 0,5 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Sin embargo, el propio autor advierte explícitamente en la model card que **no se debe descargar el modelo**, ya que el repositorio se conserva únicamente con fines de archivo. Esta advertencia es crucial para cualquier persona que considere utilizarlo en producción.

La relevancia de este modelo radica en su enfoque híbrido: combina la detección de objetos con la clasificación de logits, lo que podría ser útil en aplicaciones de moderación de contenido, análisis de imágenes o investigación en visión por computador. No obstante, la falta de documentación detallada sobre arquitectura y entrenamiento, junto con la advertencia del autor, limita su aplicabilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptacion de un tagger Canary con RoPE y token [BBOX]) |
| Parametros totales | 119.351.709 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, no textual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (unico archivo de pesos, 0,5 GB) |

## Arquitectura y entrenamiento

La informacion disponible en la model card es escasa. Se indica que el modelo convierte un "tagger" Canary en un detector de caras y otras partes del cuerpo. Se menciona que el modelo fue "minificado" y que la funcion de atencion RoPE (Rotary Position Embedding) y la funcion forward ahora aceptan el token `[BBOX]`. Esto sugiere una arquitectura basada en transformer, probablemente con una cabeza de deteccion anadida sobre el modelo base. La prediccion de logits (clasificacion) se mantiene junto con la deteccion de bounding boxes, y se calculan perdidas de bbox (como xywh) y de IoU (como xyxy) ademas de la perdida de logits del modelo padre.

Los datos de entrenamiento provienen de varias fuentes: lotes de moondream.ai, `huanngzh/anime_face_control_60k`, `minato-ryan/animeface_detection`, `nebulette/aperveyev` y `second222/yande_feet_core`. No se especifica el numero total de tokens ni el proceso de entrenamiento (RLHF, DPO, etc.). La referencia a un articulo (2608.03796) sugiere que podria haber un paper asociado, pero no se proporciona el titulo ni el contenido.

## Capacidades

- Deteccion de objetos: localiza y delimita con bounding boxes regiones correspondientes a caras y otras partes del cuerpo (ass, belly, boobs, face, feet, pussy).
- Clasificacion de logits: mantiene la capacidad de prediccion de logits del modelo padre, lo que podria permitir tareas de clasificacion adicionales.
- Procesamiento de imagenes: entrada de imagenes y salida de detecciones con coordenadas xywh y xyxy (IoU).
- No se mencionan capacidades de generacion de texto, tool calling, agentes, ni soporte multilingue.

## Casos de uso

- Moderacion de contenido: el modelo puede identificar regiones de piel o partes del cuerpo en imagenes, lo que podria utilizarse para filtrar contenido explicito en plataformas sociales. Sin embargo, la advertencia del autor de no descargar el modelo limita su uso real.
- Investigacion en vision por computador: como punto de partida para estudiar tecnicas de deteccion de partes del cuerpo o para comparar con otros detectores.
- Etiquetado automatico de datasets: podria emplearse para anotar imagenes con bounding boxes de caras y otras partes, aunque la calidad no esta verificada.
- Analisis de imagenes medicas o de salud: en teoria, la deteccion de partes del cuerpo podria aplicarse en contextos clinicos, pero la falta de validacion y el contenido del dataset (anime, etc.) lo hacen poco fiable.
- Filtrado de imagenes en motores de busqueda: para clasificar o segmentar resultados segun contenido.
- Desarrollo de sistemas de realidad aumentada: la deteccion de partes del cuerpo podria integrarse en aplicaciones de AR, aunque de nuevo, la advertencia del autor es un impedimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de deteccion como mAP o IoU. El autor no proporciona ninguna evaluacion cuantitativa del rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada: con 119 millones de parametros y un peso de 0,5 GB en safetensors, la inferencia podria requerir entre 1 y 2 GB de VRAM en precision FP16, dependiendo de la resolucion de entrada y la implementacion. Esto cabria en GPUs consumer como una RTX 3060 o superior.
- GPU recomendadas: no se especifican, pero por el tamano del modelo, una GPU con al menos 4 GB de VRAM seria suficiente para inferencia basica.
- Opciones de despliegue: no se mencionan frameworks especificos. Podria utilizarse con PyTorch, ONNX o TensorRT, pero no hay garantias de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (detectores de objetos como YOLO, DETR, etc.). No se conocen modelos comparables con las mismas caracteristicas (deteccion de partes del cuerpo + logits) y no hay datos de rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El autor indica explicitamente: "Please do not download the model. The repo was kept for archival purposes." Esto significa que el modelo no debe utilizarse en produccion ni descargarse, y su uso podria no estar soportado.
- El dataset de entrenamiento incluye contenido explicito (etiquetas como `pussy`, `boobs`, `ass`), lo que introduce sesgos y problemas eticos importantes. El modelo podria generar detecciones inapropiadas o sesgadas.
- No hay documentacion sobre el proceso de entrenamiento, lo que impide evaluar la robustez del modelo.
- La arquitectura no esta claramente especificada, y la adaptacion del tagger Canary podria tener limitaciones en cuanto a la precision de los bounding boxes.
- La licencia Apache 2.0 permite uso comercial, pero la advertencia del autor anula practicamente esa posibilidad.
- No se proporcionan garantias de rendimiento ni de seguridad para su uso en aplicaciones reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nebulette/canary-face-body
- Referencia a paper (sin titulo): 2608.03796 (posiblemente un arXiv, no verificado)
- Otros modelos del autor: https://huggingface.co/nebulette/models
