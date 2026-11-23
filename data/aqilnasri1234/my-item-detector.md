# aqilnasri1234/my-item-detector

## Resumen

My Item Detector es un modelo de detección de objetos desarrollado por el usuario aqilnasri1234 en el contexto del bootcamp CodingBN (sesiones 14 y 15). Se trata de un ajuste fino (fine-tuning) del modelo base YOLO26n de Ultralytics, especializado en la detección de cuatro clases de calzado: Heels, Sandals, Shoes y Slippers. El modelo se entrenó sobre aproximadamente 50 fotografías tomadas por el propio autor y etiquetadas manualmente en Roboflow.

El modelo resuelve una tarea muy acotada de visión por computador: la clasificación y localización de calzado en imágenes. Su relevancia es fundamentalmente didáctica, ya que sirve como ejemplo de un pipeline completo de detección de objetos que abarca la captura de datos, el etiquetado, el entrenamiento con Ultralytics y la publicación en Hugging Face. No está pensado para uso en producción ni para aplicaciones críticas.

La arquitectura subyacente es la de YOLO26n, un detector de objetos de la familia YOLO (You Only Look Once) en su variante "nano", optimizada para inferencia ligera. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica a modelos de visión) ni los resultados de benchmarks, ya que el autor no los ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB, sin pesos publicados) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26n, la variante nano de la familia YOLO26 de Ultralytics. Se trata de un detector de objetos de una sola etapa (single-stage), diseñado para equilibrar velocidad y precisión en entornos con recursos limitados. La arquitectura YOLO procesa la imagen completa en una única pasada hacia adelante, prediciendo simultáneamente las cajas delimitadoras y las probabilidades de clase.

El entrenamiento consistió en un fine-tuning sobre aproximadamente 50 fotografías tomadas por el autor con un teléfono móvil en una única habitación, etiquetadas manualmente en Roboflow. No se especifica el número de épocas, la resolución de entrada, el tamaño del batch ni si se aplicaron técnicas de aumento de datos. Tampoco se indica si se utilizó validación cruzada o un conjunto de test independiente. El autor deja un marcador de posición ("add your mAP50 here") en la model card, lo que indica que no se han publicado métricas de rendimiento.

## Capacidades

- Detección de objetos en imágenes para cuatro clases de calzado: Heels, Sandals, Shoes y Slippers.
- Localización mediante cajas delimitadoras (bounding boxes) con puntuaciones de confianza.
- Inferencia ligera adecuada para dispositivos con recursos limitados, gracias a la variante nano del modelo base.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión de texto ni audio.

## Casos de uso

- Prototipado educativo de detección de objetos: el modelo sirve como ejemplo práctico para aprender el flujo completo de entrenamiento y despliegue de un detector YOLO en un entorno de bootcamp.
- Clasificación de inventario de calzado en un armario personal: podría usarse para etiquetar fotografías de zapatos en un catálogo doméstico, aunque con la limitación de que solo funciona bien en el entorno de entrenamiento.
- Demostración de integración con Ultralytics: permite mostrar cómo cargar un modelo fine-tuneado desde Hugging Face y ejecutar inferencia con la librería ultralytics en Python.
- Prueba de concepto para aplicaciones de retail: serviría como base para experimentar con la detección de tipos de calzado en estanterías, aunque requeriría un reentrenamiento con un dataset mucho mayor y variado.
- Ejercicio de etiquetado en Roboflow: el modelo y su dataset asociado pueden usarse como referencia para enseñar el proceso de anotación y exportación de datos.
- Benchmarking de modelos nano en detección: podría emplearse para comparar la velocidad de inferencia de YOLO26n frente a otras variantes en tareas de detección de objetos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor deja un marcador de posición para el mAP50 sin completar, por lo que no existen métricas verificables de precisión, recall ni velocidad de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repo no contiene pesos publicados, tamaño de 0.0 GB).
- GPU recomendadas: al tratarse de una variante nano de YOLO, es probable que funcione en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no se dispone de datos confirmados.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño reducido de la variante nano, pero no confirmado por el autor.
- Opciones de despliegue: la librería ultralytics permite exportar a formatos como ONNX, TensorRT o CoreML, aunque no se especifica qué formatos se han generado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| My Item Detector (YOLO26n fine-tune) | no disponible | no aplica | sin métricas publicadas | AGPL-3.0 | Hugging Face |
| YOLOv8n (Ultralytics) | no disponible | no aplica | métricas públicas en COCO | AGPL-3.0 | Hugging Face / Ultralytics |
| YOLOv5n (Ultralytics) | no disponible | no aplica | métricas públicas en COCO | AGPL-3.0 | Hugging Face / Ultralytics |
| Faster R-CNN (ResNet-50) | no disponible | no aplica | métricas públicas en COCO | BSD | TorchVision |

La comparativa se limita a modelos de detección de objetos de la misma familia o categoría. My Item Detector no dispone de métricas públicas, mientras que los modelos base de Ultralytics sí publican resultados en COCO. La licencia AGPL-3.0 es común en la familia YOLO de Ultralytics, con la opción de licencia enterprise.

## Limitaciones y advertencias

- Entrenado con un dataset muy pequeño (aproximadamente 50 imágenes) de una única habitación y un único teléfono, por lo que fallará en otros fondos, iluminaciones y objetos.
- Solo reconoce las cuatro clases indicadas (Heels, Sandals, Shoes, Slippers); cualquier otro objeto se ignorará o se clasificará erróneamente.
- No es apto para uso en seguridad crítica ni para aplicaciones comerciales sin una licencia adecuada.
- La licencia AGPL-3.0 exige que cualquier obra derivada que se distribuya o se use en red también sea AGPL-3.0, lo que puede ser incompatible con productos comerciales cerrados.
- No se han publicado métricas de rendimiento (mAP50, precisión, recall), por lo que no es posible evaluar su calidad de forma objetiva.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo no están disponibles o no se han subido correctamente.
- Riesgo de alucinación en detección: al ser un modelo de visión, puede generar cajas delimitadoras falsas positivas en imágenes con objetos similares al calzado.
- No se especifican sesgos conocidos, pero el dataset reducido y monocultural (una habitación, un teléfono) puede introducir sesgos de dominio.

## Enlaces

- [Hugging Face: aqilnasri1234/my-item-detector](https://huggingface.co/aqilnasri1234/my-item-detector)
- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics)
- [Roboflow](https://roboflow.com/)
- [CodingBN bootcamp](https://codingbn.com/) (referencia mencionada en la model card)
