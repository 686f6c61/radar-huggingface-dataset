# nuven-mira/yolo26s-visor-small-11-11-26

## Resumen

YOLO26s Visor es un modelo de detección de objetos de una sola clase, especializado en localizar la región del visor digital (contador de dígitos) de contadores eléctricos industriales en fotografías de campo. Lo desarrolla el usuario nuven-mira y se distribuye como un fine-tune del checkpoint YOLO26s (variante small) de Ultralytics, preentrenado sobre COCO. El modelo devuelve una única bounding box por imagen, pensada para recortar la región y pasarla a un lector OCR posterior.

La relevancia es acotada pero clara: se trata de un modelo de nicho industrial con métricas de validación muy altas sobre su propio dominio (mAP50 de 0.9922 y mAP50-95 de 0.8765 en un test de 905 imágenes no vistas), entrenado sobre un dataset de 9039 fotografías de contadores eléctricos de 480×640 píxeles. Con 9.948.638 parámetros y 22.7 GFLOPs, es lo bastante ligero para ejecutarse en GPUs de consumo.

El modelo está pensado como primer eslabón de una cadena de lectura de contadores: detección del visor, recorte y OCR. No es un modelo generalista ni multilingüe; su alcance es la detección de un único objeto en un dominio visual concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), 260 capas, detector de una etapa |
| Parametros totales | 9.948.638 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pt` (PyTorch, 20.3 MB, FP32) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26 en variante small, una CNN de una etapa con 260 capas y 22.7 GFLOPs de cómputo por inferencia a 640 píxeles. Se parte del checkpoint `yolo26s.pt` preentrenado en COCO y se hace fine-tune sobre una única clase, `visor_digital`. La entrada de entrenamiento es de 640 px, aunque las imágenes nativas del dataset son de 480×640.

El dataset `nuven-mira/visor-bbox-v1.0` contiene 9039 fotografías de campo de contadores eléctricos, con una bounding box por imagen: 3768 anotadas manualmente en Label Studio y 5271 generadas localmente con asistencia de SAM y corrección manual. El split es determinista 80/10/10 con semilla 42 (7231/903/905 imágenes), con los duplicados byte a byte forzados al mismo split (no se encontró ninguno) y el manifiesto de ficheros publicado en `split_manifest.json`. El entrenamiento usó 100 épocas con early stopping (parada en la 95, mejor época la 65), paciencia 30, batch efectivo 4 por OOM (con acumulación de gradiente, nbs=64), optimizador SGD automático con lr=0.01, AMP activado y `deterministic=True`. El tiempo total fue de unas 6.3 horas en una RTX 3050 de 8 GB; el autor estima 3-4 horas con batch 16 en una GPU libre. Entorno: Python 3.10.12, Ultralytics 8.4.184, PyTorch 2.11.0+cu128.

## Capacidades

- Detección de objetos de una sola clase: localiza la bounding box del visor digital (`visor_digital`) en fotografías de contadores eléctricos.
- Salida de una caja por imagen, pensada para recorte y lectura posterior por OCR.
- Robusta a variación de tamaño del visor: recall entre 0.9867 y 1.0000 en los cuatro cuartiles de área de la caja de referencia.
- Calibración de confianza moderada (ECE 0.0884), con umbral operativo recomendado de 0.40 para maximizar F1.
- Inferencia rápida: 14.7 ms/imagen (≈68 FPS) en RTX 3050 con batch 1.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües.

## Casos de uso

- Lectura automática de contadores eléctricos: el modelo detecta el visor y el recorte se pasa a un OCR de dígitos; el pipeline completo automatiza la toma de lectura en campo sin intervención manual.
- Inspección industrial en movilidad: al ejecutarse a 14.7 ms/imagen en una RTX 3050, puede integrarse en un dispositivo con GPU de consumo para lectura en tiempo real durante rondas de inspección.
- Procesamiento por lotes de archivos fotográficos históricos: con 0.008 falsos positivos por imagen y un 99.2% de imágenes con recall perfecto, es adecuado para preprocesar grandes volúmenes de fotos de contadores y aislar la región de interés antes del OCR.
- Control de calidad del propio pipeline OCR: la caja detectada permite verificar que el recorte contiene el visor completo antes de intentar leer los dígitos, reduciendo errores aguas abajo.
- Filtrado y triaje de imágenes: descartar o marcar fotografías en las que no se detecta visor con confianza suficiente, derivándolas a revisión manual.
- Anclaje para anotación asistida: usar las detecciones como preanotaciones en Label Studio para acelerar el etiquetado de nuevos lotes de imágenes.
- Extracción de región para modelos de lectura especializados: servir como etapa de localización previa a un modelo OCR de dígitos de siete segmentos o similar.

## Benchmarks y rendimiento

Resultados en el split de test (905 imágenes no vistas), umbral de IoU ≥ 0.5:

| Metrica | Valor |
|---|---|
| mAP50 | 0.9922 |
| mAP50-95 | 0.8765 |
| AP50 / AP75 / AP50-95 (COCO 101 puntos) | 0.9869 / 0.9578 / 0.8703 |
| Precision / Recall (val Ultralytics) | 0.9920 / 0.9923 |
| Confianza en F1 maximo | 0.40 |
| P / R / F1 @ 0.40 | 0.9923 / 0.9923 / 0.9923 |
| TP / FP / FN @ 0.40 | 898 / 7 / 7 |
| ECE (calibracion) | 0.0884 |
| Latencia (RTX 3050, batch 1) | 14.7 ms/imagen ≈ 68 FPS |

Calidad de localización sobre los 898 verdaderos positivos con conf ≥ 0.40:

| Metrica | Media | Mediana | p10 | p90 |
|---|---|---|---|---|
| IoU | 0.9253 | 0.9533 | 0.8237 | 0.9884 |
| Error de centro (px) | 2.17 | 1.22 | 0.30 | 4.47 |
| Error relativo de anchura | 2.2% | 0.8% | 0.1% | 4.4% |
| Error relativo de altura | 4.7% | 2.1% | 0.3% | 12.6% |

Comparación con el modelo anterior de visor (`yolo26s_visor-small-23-10-26`, entrenado solo con las 5271 imágenes locales) sobre los mismos splits: el modelo actual obtiene mAP50 0.9922, mAP50-95 0.8765, F1 0.9923 (conf 0.40) e IoU mediana 0.9533 en test; la información disponible no incluye los valores numéricos del modelo anterior para el resto de columnas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9.95 M de parámetros en FP32 (20.3 MB de pesos) el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU de referencia del autor: NVIDIA RTX 3050 8 GB, con 14.7 ms/imagen (≈68 FPS) a batch 1.
- Entrenamiento: 6.3 horas en RTX 3050 8 GB con batch efectivo 4; 3-4 horas estimadas con batch 16 en una GPU libre.
- Cabe en GPU de consumo: sí, el autor lo ejecuta y entrena en una RTX 3050 de 8 GB.
- Opciones de despliegue: librería Ultralytics (PyTorch, formato `.pt`); no se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 14.7 ms/imagen y ≈68 FPS en RTX 3050 a batch 1 (dato del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s Visor (este modelo) | 9.948.638 | 640 px | 0.9922 | CC BY 4.0 | Hugging Face |
| `yolo26s_visor-small-23-10-26` (modelo anterior del mismo autor) | no disponible | 640 px | no disponible (el autor indica que este modelo lo supera en todos los recortes) | no disponible | Hugging Face |
| YOLO26s base (Ultralytics, COCO) | no disponible | 640 px | no disponible (no evaluado en este dominio) | no disponible | Ultralytics |

La información disponible no permite comparar con detectores genéricos de la misma categoría en este dominio concreto; los únicos puntos de referencia publicados son el modelo anterior del mismo autor y el checkpoint base.

## Limitaciones y advertencias

- Modelo de un único dominio: solo detecta la clase `visor_digital` en fotografías de contadores eléctricos; no es un detector generalista.
- Entrenado con imágenes de 480×640 y a 640 px de entrada; el comportamiento con otras resoluciones, relaciones de aspecto o tipos de contador no está documentado.
- Dataset de origen único (9039 imágenes de contadores eléctricos); el rendimiento fuera de esa distribución (otros países, otros modelos de contador, iluminación atípica) no está validado.
- Calibración imperfecta: ECE de 0.0884, por lo que la confianza predicha no debe interpretarse como probabilidad exacta.
- Tasa de error residual: 7 falsos positivos y 7 falsos negativos sobre 905 imágenes en test con el umbral recomendado de 0.40.
- El error relativo de altura de la caja (4.7% de media, 12.6% en el percentil 90) es mayor que el de anchura; conviene añadir margen al recortar para el OCR.
- Licencia CC BY 4.0: permite uso comercial con atribución; no se documentan restricciones adicionales, pero conviene verificar los términos de Ultralytics para el checkpoint base.
- Sin datos publicados sobre sesgos demográficos o geográficos, ni sobre robustez frente a oclusiones, reflejos o desenfoque.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuven-mira/yolo26s-visor-small-11-11-26
- Dataset: https://huggingface.co/datasets/nuven-mira/visor-bbox-v1.0
- Ultralytics (framework y checkpoints base): https://github.com/ultralytics/ultralytics
- Split manifest del repositorio: `split_manifest.json` (incluido en el repo del modelo)
