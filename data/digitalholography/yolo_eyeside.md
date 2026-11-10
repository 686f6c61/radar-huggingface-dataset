# DigitalHolography/YOLO_EyeSide

## Resumen

YOLO_EyeSide es un modelo de clasificación de imágenes basado en Ultralytics YOLO11, publicado por el autor DigitalHolography. Su tarea concreta es determinar si una imagen médica M0 generada por la aplicación HoloDoppler corresponde a un ojo izquierdo o derecho. No se trata de un modelo de lenguaje, sino de un clasificador visual especializado dentro de un pipeline de holografía digital.

El modelo se distribuye en formato ONNX y está pensado para integrarse en el cuaderno `eye_side.ipynb` del proyecto Left Right Eye Classification. Su relevancia es acotada: resuelve un paso de preprocesado o etiquetado dentro de un flujo médico concreto, y su interés principal radica en que ejemplifica el uso de YOLO11 como backbone de clasificación en dominios científicos especializados.

La información publicada es escasa: no hay métricas de validación, ni detalles sobre el dataset de entrenamiento, ni especificación del número de parámetros o del tamaño de entrada. La licencia es Apache 2.0 y el repositorio ocupa 0,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics) en modo clasificación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de Ultralytics YOLO11, una familia de redes convolucionales con módulos de atención y agregación de características (C3k2, SPPF y C2PSA en las variantes recientes). En este caso se emplea la cabeza de clasificación de YOLO11, que produce una distribución de probabilidad sobre las clases "left" y "right" a partir de una imagen de entrada.

No se han publicado datos sobre el volumen del dataset de entrenamiento, la composición de las imágenes M0, el número de épocas, las técnicas de aumento de datos ni si hubo ajuste fino desde pesos preentrenados de YOLO11 o entrenamiento desde cero. La model card solo indica que se trata de un modelo preentrenado de clasificación YOLO11 adaptado a imágenes M0 de HoloDoppler.

## Capacidades

- Clasificación binaria de lateralidad ocular ("left" / "right") en imágenes médicas M0.
- Inferencia sobre imágenes generadas por la aplicación HoloDoppler.
- Exportación a ONNX para despliegue en entornos con runtime ONNX (onnxruntime, OpenCV DNN, etc.).
- Integración con el flujo de trabajo del proyecto Left Right Eye Classification.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.

## Casos de uso

- Etiquetado automático de lateralidad en bases de datos de holografía digital: el modelo clasifica cada imagen M0 como ojo izquierdo o derecho, lo que permite organizar y validar grandes volúmenes de capturas sin revisión manual.
- Control de calidad en la adquisición de imágenes HoloDoppler: si la lateralidad detectada no coincide con la metadato esperada, el pipeline puede marcar la captura para revisión.
- Preprocesado en pipelines de investigación clínica: la clasificación previa permite separar cohortes por ojo antes de análisis estadísticos o de reconstrucción holográfica.
- Automatización de notebooks y scripts de laboratorio: el modelo se invoca desde `eye_side.ipynb` para etiquetar lotes de imágenes de forma reproducible.
- Validación cruzada de anotaciones manuales: sirve como segundo clasificador que contrasta las etiquetas introducidas por el operador.
- Despliegue en entornos con ONNX Runtime: al no requerir PyTorch en producción, puede ejecutarse en estaciones de trabajo con recursos limitados o en contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo YOLO11 de clasificación en ONNX, es probable que quepa en GPUs de gama baja, pero no se especifica el tamaño de la variante (n, s, m, l o x).
- GPU recomendadas: no disponible; cualquier GPU compatible con ONNX Runtime o CUDA podría servir, pero no hay datos del autor.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio (0,8 GB) y la naturaleza del modelo, aunque no se confirma.
- Opciones de despliegue: ONNX Runtime, OpenCV DNN, TensorRT (previa conversión), Ultralytics (si se dispone de los pesos originales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO_EyeSide | Clasificación de lateralidad ocular | no disponible | no aplica | Apache 2.0 | Hugging Face (ONNX) |
| YOLO11 (Ultralytics) | Detección/clasificación/segmentación general | variable según variante | no aplica | AGPL-3.0 / Enterprise | GitHub, Hugging Face |
| ResNet-50 (clasificación genérica) | Clasificación de imágenes | 25,6 M | no aplica | BSD-3 | Torchvision, Hugging Face |

La comparación directa es limitada porque YOLO_EyeSide es un modelo de nicho sin métricas publicadas. Frente a YOLO11 original, cambia la licencia (Apache 2.0 en lugar de AGPL-3.0) y la tarea (clasificación binaria especializada). Frente a ResNet-50, se desconoce el rendimiento relativo.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, recall, F1 ni matrices de confusión, por lo que no es posible evaluar su fiabilidad clínica.
- El modelo está entrenado específicamente con imágenes M0 de HoloDoppler; su comportamiento fuera de esa distribución es desconocido.
- No se especifica el tamaño de entrada ni el preprocesado requerido, lo que dificulta la reproducibilidad.
- No hay información sobre sesgos demográficos, de iluminación o de equipamiento.
- Riesgo de alucinación no aplica (no es generativo), pero sí de falsos positivos/negativos en la clasificación.
- Aunque la licencia es Apache 2.0, el uso clínico requiere validación regulatoria independiente; no debe emplearse como dispositivo médico sin certificación.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere escasa validación por parte de la comunidad.
- No se indica si el modelo ONNX incluye metadatos de entrada/salida ni la versión de opset.

## Enlaces

- Hugging Face: https://huggingface.co/DigitalHolography/YOLO_EyeSide
- Repositorio GitHub del proyecto: https://github.com/DigitalHolography/LeftRightEyeClassification
- Aplicación HoloDoppler: https://github.com/DigitalHolography/HoloDoppler
- Ultralytics YOLO11 (modelo base): https://huggingface.co/Ultralytics/YOLO11
