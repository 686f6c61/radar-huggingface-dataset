# inference4j/dfine-small-coco

## Resumen

D-FINE Small (COCO) en formato ONNX es la exportación del modelo de detección de objetos D-FINE (Redefine Bounding Box Regression for DETR-based Object Detection) en su variante small, entrenado sobre el conjunto COCO 2017 con 80 clases. El modelo original lo desarrolla el grupo USTC (Peng et al.) y esta réplica la publica inference4j como espejo sin modificaciones del export de onnx-community, pensada para su uso con la librería de inferencia en Java inference4j.

D-FINE es un detector basado en transformer de la familia DETR que reformula la regresión de cajas delimitadoras, lo que le permite alcanzar 48,5 AP en COCO val2017 con un tamaño reducido. Su relevancia práctica radica en la licencia Apache-2.0: ofrece una alternativa permisiva, sin copyleft, a los modelos YOLOv8 y YOLO26, que se distribuyen bajo AGPL y complican su integración en productos propietarios.

La entrada del modelo es un tensor `pixel_values` de forma `[batch, 3, 640, 640]` en RGB normalizado entre 0 y 1, con redimensionado bilineal y sin letterbox. La salida son `logits` de forma `[batch, 300, 80]` (a los que hay que aplicar sigmoide) y `pred_boxes` de forma `[batch, 300, 4]` en formato normalizado [cx, cy, w, h]; no requiere NMS en el post-procesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Small (detector de objetos basado en transformer, familia DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (export ONNX; la model card no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; etiquetas de clase COCO en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

D-FINE es un detector de objetos basado en transformer, heredero de la familia DETR, cuya contribución principal es una reformulación de la regresión de cajas delimitadoras. La variante small se exporta a ONNX con una entrada fija de 640x640 píxeles y produce 300 consultas de detección por imagen, cada una con 80 logits de clase y una caja normalizada. El post-procesado es determinista: conversión de [cx, cy, w, h] a [x1, y1, x2, y2] escalada a las dimensiones de la imagen, filtrado por umbral de confianza (superior a 0,5) y sin necesidad de supresión de no máximos (NMS).

El entrenamiento se realizó sobre COCO 2017 con 80 clases. La model card no detalla el número de tokens de imagen, la composición exacta del dataset más allá de COCO ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO (no aplicables en un detector). Tampoco se documentan innovaciones adicionales de decodificación especulativa ni atención lineal. Los pesos originales provienen de PyTorch (repositorio Peterande/D-FINE) y el export ONNX lo realiza onnx-community; esta réplica de inference4j copia los ficheros sin cambios.

## Capacidades

- Detección de objetos en imágenes para las 80 clases de COCO (persona, vehículo, animal, mobiliario, utensilios, etc.).
- Salida de hasta 300 detecciones por imagen con caja y puntuación de confianza por clase.
- Post-procesado sin NMS, lo que simplifica el pipeline de inferencia.
- Entrada de imagen RGB normalizada a 640x640 con redimensionado bilineal (sin letterbox).
- Integración directa con la librería Java inference4j mediante `DetrDetector.dfineSmall()`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Moderación de contenido visual: el modelo puede detectar personas, vehículos u objetos sensibles en imágenes subidas por usuarios y activar revisiones automáticas según la clase y la confianza, aprovechando su licencia Apache-2.0 para integrarse en productos propietarios.
- Analítica de videovigilancia: procesando fotogramas a 640x640 se obtienen cajas y etiquetas por frame; al no requerir NMS, el post-procesado es barato y adecuado para pipelines en tiempo casi real sobre CPU o GPU modesta.
- Inventario y control de stock en retail: detección de productos y mobiliario en estanterías para auditorías automáticas, con umbral de confianza ajustable según la tolerancia a falsos positivos.
- Automatización de tareas en Java empresarial: al estar empaquetado como ONNX y consumible con inference4j, encaja en backends Java (Spring, microservicios) sin necesidad de un stack Python en producción.
- Pre-etiquetado de datasets: generación de anotaciones iniciales sobre imágenes propias que luego se revisan y corrigen manualmente, reduciendo el coste de etiquetado en proyectos de visión.
- Detección en dispositivos de borde: el tamaño reducido de la variante small y el formato ONNX permiten desplegarlo con ONNX Runtime en equipos con recursos limitados, por ejemplo en inspección industrial o accesibilidad (descripción de escenas).
- Análisis de tráfico: conteo de vehículos y personas en imágenes de cámaras urbanas para estudios de movilidad, filtrando por las clases COCO correspondientes.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| COCO AP (val2017) | 48,5 | Model card (reportado por los autores de D-FINE) |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP por tamaño de objeto, latencia o throughput) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; al ser una variante small con entrada 640x640, la huella es reducida, pero no se aporta cifra concreta.
- GPU recomendadas: no especificadas; el export ONNX es ejecutable con ONNX Runtime tanto en CPU como en GPU.
- ¿Cabe en GPU consumer? No se documenta, aunque por el tamaño de la variante small es previsible que sí; no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (vía inference4j en Java) y cualquier runtime compatible con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-FINE Small (COCO) ONNX | Detección de objetos, 80 clases COCO | Imagen 640x640 | COCO AP 48,5 | Apache-2.0 | Hugging Face (este repo) |
| YOLOv8 | Detección de objetos | No disponible en la información | No disponible en la información | AGPL | No disponible en la información |
| YOLO26 | Detección de objetos | No disponible en la información | No disponible en la información | AGPL | No disponible en la información |

La model card cita YOLOv8 y YOLO26 como alternativas, destacando que su licencia AGPL es copyleft frente a la Apache-2.0 de D-FINE. No se aportan parámetros, contexto ni cifras de rendimiento de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre COCO, hereda los sesgos de representación de ese dataset (clases, contextos y demografía).
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir falsos positivos y cajas imprecisas, especialmente en objetos pequeños, ocluidos o fuera del dominio de COCO.
- Limitaciones de idioma: no procesa texto; las etiquetas de clase están en inglés y limitadas a las 80 categorías de COCO.
- Limitaciones de entrada: resolución fija 640x640 con redimensionado bilineal sin letterbox, lo que puede distorsionar la relación de aspecto de imágenes no cuadradas.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación con atribución; no hay cláusulas copyleft, a diferencia de YOLOv8/YOLO26.
- Caveats para producción: el umbral de confianza (0,5 por defecto) debe calibrarse según el caso; el modelo no detecta clases fuera de COCO; no se documentan métricas de latencia ni cuantizaciones listas para usar, por lo que el rendimiento real debe medirse en el entorno objetivo.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/inference4j/dfine-small-coco
- Modelo original: https://huggingface.co/ustc-community/dfine-small-coco
- Export ONNX de origen: https://huggingface.co/onnx-community/dfine_s_coco-ONNX
- Repositorio de código D-FINE: https://github.com/Peterande/D-FINE
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
