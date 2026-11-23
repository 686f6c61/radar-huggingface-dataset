# Magada/my-item-detector

## Resumen

Magada/my-item-detector es un detector de objetos basado en YOLO26n de Ultralytics, publicado por el usuario Magada como resultado de las sesiones 14 y 15 del bootcamp CodingBN. El modelo se ha afinado para clasificar cinco categorías de residuos o materiales: vidrio, metal, papel y cartón, plástico y caucho. Su propósito declarado es didáctico: demostrar el flujo completo de etiquetado en Roboflow, entrenamiento con Ultralytics y publicación en Hugging Face.

La relevancia de esta ficha es limitada desde el punto de vista de producción. El propio autor reconoce que el conjunto de entrenamiento consta de aproximadamente 50 fotografías tomadas con un único teléfono en una sola habitación, lo que restringe severamente la generalización a otras condiciones de iluminación, fondos u objetos. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

No se dispone de información sobre la arquitectura interna más allá de la indicación de que se parte de YOLO26n, ni sobre hiperparámetros, número de épocas, resolución de entrada o métricas finales. La model card deja explícitamente un marcador de posición ("add your mAP50 here") en lugar de un resultado de validación, por lo que no se puede afirmar ningún nivel de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (Ultralytics soporta exportación a ONNX, TensorRT, OpenVINO y TFLite, pero el autor no documenta cuantizaciones concretas) |
| Idiomas soportados | no disponible (las clases están en inglés; el modelo no procesa texto) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible en la model card; el repositorio aparece vacío (0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n, la variante "nano" de la familia YOLO26 de Ultralytics, un detector de objetos de una sola etapa pensado para inferencia en tiempo real en hardware modesto. No se especifican en la información disponible el número de capas, los canales, la resolución de entrada ni la función de pérdida empleada durante el ajuste fino.

El entrenamiento consistió en un fine-tuning sobre aproximadamente 50 fotografías tomadas por el autor y etiquetadas manualmente en Roboflow, con cinco clases: `Glass Material`, `Metal`, `Paper_Cardboard`, `Plastic` y `Rubber`. No se documentan el número de épocas, el tamaño del batch, el optimizador, la estrategia de aumento de datos ni si se congelaron capas del backbone. Tampoco se indica si se realizó validación cruzada o se reservó un conjunto de test independiente. La ausencia de métricas publicadas impide evaluar la calidad del ajuste.

## Capacidades

- Detección de objetos en imágenes para cinco clases concretas: vidrio, metal, papel y cartón, plástico y caucho.
- Localización mediante cajas delimitadoras (bounding boxes) con etiqueta de clase y puntuación de confianza, según el pipeline `object-detection` declarado.
- Inferencia en tiempo real gracias a la variante nano de YOLO26, orientada a dispositivos con recursos limitados.
- Exportación potencial a formatos de despliegue habituales de Ultralytics (ONNX, TensorRT, OpenVINO, TFLite), aunque no documentada por el autor.
- No soporta tool calling, function calling, razonamiento multi-paso, procesamiento de lenguaje natural ni modalidades de audio o vídeo más allá del fotograma a fotograma.
- No se declaran capacidades multilingües ni modos especiales como thinking mode o visión aumentada.

## Casos de uso

- Prototipo educativo de clasificación de residuos: útil en un aula o bootcamp para ilustrar el ciclo etiquetado-entrenamiento-despliegue con Ultralytics y Roboflow, sin pretensión de precisión industrial.
- Demostración de pipeline de detección en tiempo real: al estar basado en YOLO26n, puede ejecutarse en una webcam o en una Raspberry Pi para mostrar la inferencia en directo durante una presentación.
- Prueba de concepto de reciclaje doméstico: un desarrollador podría integrarlo en un script local que fotografíe un objeto y devuelva la categoría de material, aceptando un alto índice de error fuera del entorno de entrenamiento.
- Base para un fine-tuning posterior: sirve como punto de partida para quien quiera ampliar el dataset con más imágenes, más clases o condiciones de iluminación diversas, reutilizando el mismo flujo de Ultralytics.
- Ejercicio de evaluación de limitaciones: permite comparar el rendimiento en el conjunto de entrenamiento frente a imágenes nuevas y documentar el sobreajuste típico de datasets de 50 muestras.
- Integración en un cuaderno de Jupyter o script de demostración: adecuado para enseñar métricas como mAP50, matrices de confusión y curvas precisión-recall con la API de Ultralytics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador de posición sin completar ("add your mAP50 here") en lugar de una métrica de validación, y no se aportan valores de precisión, recall, mAP50 ni mAP50-95.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por la variante nano de YOLO26 se espera un consumo bajo, del orden de cientos de MB a 1-2 GB en FP16, pero el autor no lo documenta.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) debería poder ejecutar un modelo nano, pero no hay datos publicados que lo confirmen para este ajuste concreto.
- Compatibilidad con GPU de consumo: probable por la clase de modelo, aunque no verificada en la información disponible.
- Opciones de despliegue: la librería declarada es `ultralytics`, por lo que se puede cargar con la API de Python de Ultralytics; el autor no documenta exportaciones a vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Magada/my-item-detector | no disponible | no aplica | no disponible (mAP50 sin publicar) | AGPL-3.0 | Hugging Face, repo de 0.0 GB |
| YOLO26n (Ultralytics, base) | no disponible en la información | no aplica | métricas oficiales de Ultralytics no incluidas en esta ficha | AGPL-3.0 / Enterprise | Ultralytics y Hugging Face |
| YOLOv8n (Ultralytics) | no disponible en la información | no aplica | métricas oficiales de Ultralytics no incluidas en esta ficha | AGPL-3.0 / Enterprise | Ultralytics y Hugging Face |
| Otros detectores de residuos en Hugging Face | no disponible | no aplica | no disponible | variable | variable |

No se dispone de datos suficientes para una comparación cuantitativa rigurosa. La comparación cualitativa se limita a señalar que este modelo es un fine-tuning de YOLO26n sobre un dataset mínimo, mientras que los modelos base de Ultralytics se entrenan sobre datasets a gran escala (COCO, entre otros) y publican métricas oficiales.

## Limitaciones y advertencias

- Dataset de entrenamiento de aproximadamente 50 imágenes tomadas con un solo teléfono y en una única habitación, lo que provoca un sobreajuste severo y errores previsibles en otros fondos, luces y objetos.
- El modelo solo reconoce las cinco clases declaradas; cualquier otro objeto se ignora o se clasifica erróneamente.
- No se han publicado métricas de validación (mAP50, precisión, recall), por lo que no hay evidencia cuantitativa de su calidad.
- El repositorio aparece con un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar subidos o no ser accesibles; conviene verificar la disponibilidad real antes de integrarlo.
- Licencia AGPL-3.0: su uso en productos comerciales o servicios en red exige cumplir las obligaciones de copyleft o adquirir una licencia Enterprise de Ultralytics.
- El propio autor desaconseja explícitamente su uso en aplicaciones críticas para la seguridad o con fines comerciales.
- Riesgo de sesgo derivado de la composición del dataset: un único entorno, un único dispositivo de captura y un etiquetado realizado por una sola persona.
- No apto para producción sin un reentrenamiento con un dataset representativo, diverso y validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Magada/my-item-detector
- Ultralytics (framework y documentación): https://github.com/ultralytics/ultralytics
- Roboflow (herramienta de etiquetado citada por el autor): https://roboflow.com
- CodingBN (bootcamp donde se entrenó el modelo): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
