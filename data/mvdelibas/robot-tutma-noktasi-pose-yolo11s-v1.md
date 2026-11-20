# mvdelibas/robot-tutma-noktasi-pose-yolo11s-v1

## Resumen

El modelo `mvdelibas/robot-tutma-noktasi-pose-yolo11s-v1` es un detector de puntos clave (keypoint detection) basado en la arquitectura YOLO11s-pose de Ultralytics, desarrollado por el usuario mvdelibas. Su tarea consiste en localizar 23 clases de objetos en escenas simuladas y predecir dos puntos por objeto: el punto de agarre (slot 0) y el extremo del eje de agarre (slot 1). Está pensado para robótica de manipulación, concretamente para estimar poses de agarre a partir de imágenes.

El modelo se entrenó exclusivamente con datos sintéticos generados en PyBullet (2.400 imágenes, 16.157 objetos), lo que lo convierte en un prototipo de investigación más que en un componente listo para producción. No se ha validado con cámara real ni con un robot físico, y el propio autor reconoce limitaciones importantes en el rendimiento de los keypoints (pose mAP50 de 0,203).

Es relevante como ejemplo de pipeline de simulación a percepción para grasping, y como caso de estudio de las dificultades de reutilizar el esquema COCO-17 de YOLO-pose para un problema de dos puntos por objeto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB según la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s-pose (Ultralytics), deteccion de objetos con cabeza de keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (etiqueta de la model card; el modelo no procesa texto) |
| Licencia | cc0-1.0 (segun la model card); la arquitectura y el codigo de entrenamiento de Ultralytics son AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch via Ultralytics), fichero `robot-pose.pt` |
| Entrada | imagen RGB, 640 px (resolucion de entrenamiento) |
| Salida | cajas + 2 keypoints utiles por objeto (slots 0 y 1 de 17) |
| Clases | 23 clases de objetos |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo emplea YOLO11s-pose, la variante "small" de la familia YOLO11 de Ultralytics con cabeza de pose. La cabeza de keypoints está fijada al esquema COCO-17 (17 slots por instancia), por lo que los dos puntos de interés (agarre y extremo del eje) ocupan los slots 0 y 1, correspondientes en el esquema humano a nariz y ojo. Los 15 slots restantes quedan vacíos. Esta decisión de diseño condiciona la métrica OKS, que aplica sigmas de esqueleto humano y por tanto una tolerancia muy estrecha, lo que explica en parte el bajo valor de pose mAP.

El entrenamiento se realizó sobre el dataset `mvdelibas/robot-tutma-noktasi-pose-v1`: 2.400 imágenes sintéticas de escenas PyBullet con 16.157 objetos anotados, divididas automáticamente de forma estratificada en 1.678 imágenes de entrenamiento, 481 de validación y 241 de test. Se entrenaron 60 épocas a 640 px con batch 24 y `fliplr=0` (sin volteo horizontal), requisito imprescindible porque el volteo rompería la semántica de los slots de keypoint. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión. Tampoco se detalla la composición exacta del dataset más allá de su origen sintético.

## Capacidades

- Detección de objetos en imágenes: 23 clases de objetos domésticos y de laboratorio (caja, pelota, paquete, cilindro, prisma, tenedor, cuchillo, maceta, cubo, cuchara, entre otras).
- Predicción de dos keypoints por objeto: punto de agarre (slot 0) y extremo del eje (slot 1).
- Detección multiobjeto en una misma escena (hasta 16.157 objetos anotados en el dataset, con múltiples instancias por imagen).
- Inferencia en CPU y GPU mediante la librería Ultralytics.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión de documentos, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- **Prototipado de grasping en simulación**: usar el modelo para estimar puntos de agarre sobre objetos renderizados en PyBullet y alimentar un planificador de agarre en el mismo entorno simulado. Es adecuado porque el dominio de entrenamiento coincide exactamente con escenas sintéticas de PyBullet.
- **Generación de datasets sintéticos aumentados**: emplear las predicciones como preetiquetado de nuevas imágenes sintéticas para acelerar la anotación manual antes de un reentrenamiento con datos reales.
- **Investigación sobre esquemas de keypoints en YOLO-pose**: servir de base para estudiar cómo adaptar el esquema COCO-17 a problemas de pocos puntos por objeto, comparando el impacto en la métrica OKS.
- **Evaluación de pipelines de simulación a realidad (sim2real)**: usar el modelo como línea base para medir la brecha de rendimiento al pasar de imágenes sintéticas a imágenes de cámara real, dado que el autor no lo ha probado en real.
- **Docencia y demostraciones de visión robótica**: ilustrar un flujo completo de detección de objetos más keypoints con Ultralytics en un cuaderno de prácticas, aprovechando la licencia CC0 de los pesos y la simplicidad de la API.
- **Benchmark interno de detección de objetos sintéticos**: comparar la precisión de cajas (box mAP50 de 0,882) frente a otras variantes de YOLO11 en el mismo dataset para seleccionar backbone en un proyecto de robótica.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de validación, época 60:

| Metrica | Valor |
|---|---|
| Box mAP50 | 0,882 |
| Box mAP50-95 | 0,740 |
| Box precision | 0,837 |
| Box recall | 0,818 |
| Keypoint (pose) mAP50 | 0,203 |
| Keypoint (pose) mAP50-95 | 0,119 |

Rendimiento por clase (AP50): clases fuertes con 0,98 o superior (caja, pelota, paquete, cilindro, prisma); clases débiles: tenedor 0,49, cuchillo 0,65, maceta 0,72, cubo 0,77, cuchara 0,81. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo, ni comparaciones con otros detectores de keypoints en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para una variante "s" de YOLO11 a 640 px, el consumo típico es de pocos GB, pero no se confirma con datos del autor.
- GPU recomendadas: no disponible. Al ser un modelo pequeño de detección, es plausible que funcione en GPUs consumer, pero el autor no documenta requisitos.
- ¿Cabe en GPU consumer? No confirmado; no hay datos de VRAM ni de latencia publicados.
- Opciones de despliegue: Ultralytics (Python, `model.predict`), y potencialmente exportación a ONNX, TensorRT o TFLite mediante las herramientas de Ultralytics, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mvdelibas/robot-tutma-noktasi-pose-yolo11s-v1 | no disponible | imagen 640 px | box mAP50 0,882; pose mAP50 0,203 (val sintética) | cc0-1.0 (pesos); AGPL-3.0 (Ultralytics) | Hugging Face, 0 descargas |
| YOLO11s-pose (Ultralytics, COCO) | no disponible | imagen 640 px | no comparable directamente (dataset distinto) | AGPL-3.0 | Ultralytics Hub / GitHub |
| YOLOv8s-pose (Ultralytics, COCO) | no disponible | imagen 640 px | no comparable directamente | AGPL-3.0 | Ultralytics Hub / GitHub |
| Detectores de grasping específicos (p. ej. basados en RGB-D) | no disponible | imagen + profundidad | no disponible | variable | variable |

No se dispone de comparaciones publicadas por el autor frente a alternativas en el mismo dataset sintético, por lo que la comparativa es cualitativa y basada en la familia de arquitecturas.

## Limitaciones y advertencias

- **Solo datos de simulación**: el modelo nunca se ha probado con cámara real ni con un robot físico; el rendimiento en el mundo real es desconocido.
- **Keypoints poco fiables**: pose mAP50 de 0,203 y pose mAP50-95 de 0,119. El autor atribuye el bajo valor a la rigidez del esquema COCO-17, a los 15 slots vacíos y a la ambigüedad en la elección del extremo del eje.
- **Ignorar slots distintos de 0 y 1**: el resto de keypoints no tienen significado y no deben usarse.
- **Clases débiles**: tenedor (0,49), cuchillo (0,65), maceta (0,72), cubo (0,77) y cuchara (0,81) tienen un AP50 bajo; no son adecuadas para producción sin reentrenamiento.
- **Split de test no evaluado**: las 241 imágenes de test no se evaluaron por separado, por lo que no hay estimación independiente del rendimiento.
- **Riesgo de alucinación de detecciones**: como todo detector, puede producir falsos positivos en escenas fuera de distribución; no se documentan umbrales de confianza recomendados más allá de `conf=0.25` en el ejemplo.
- **Licencia dual**: los pesos se declaran CC0-1.0, pero la arquitectura y el código de Ultralytics son AGPL-3.0, lo que puede condicionar el uso comercial del pipeline completo. Verificar antes de un despliegue en producción.
- **Sesgos**: al entrenarse solo con escenas PyBullet, el modelo hereda los sesgos de iluminación, materiales y distribución de objetos de ese simulador.
- **Idioma**: la etiqueta `en` es irrelevante para el funcionamiento, pero indica que la documentación está en inglés.
- **Madurez**: 0 descargas y 0 likes; sin validación comunitaria ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/robot-tutma-noktasi-pose-yolo11s-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/robot-tutma-noktasi-pose-v1
- Ultralytics (framework y arquitectura YOLO11): https://github.com/ultralytics/ultralytics
- Documentación de YOLO11 pose: https://docs.ultralytics.com/tasks/pose/
- PyBullet (simulador usado para generar los datos): https://pybullet.org/
