# akmalmanggala/pdu-apd-detection-yolo11

## Resumen

El modelo `pdu-apd-detection-yolo11` es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, entrenado específicamente para identificar cuatro componentes de equipos de protección individual (EPI) en grabaciones de CCTV de una unidad de perforación de petróleo y gas. Lo desarrolla Akmal Manggala Putra (Grupo 6 PMLD, TRPL Escuela Vocacional UGM) y está publicado en Hugging Face bajo licencia MIT.

A diferencia de los modelos YOLO genéricos, este checkpoint se ha especializado en un dominio muy concreto: la detección de casco (`helm`), guantes (`glove`), gafas de seguridad (`kacamata`) y botas de seguridad (`sepatu`) en imágenes reales de una planta PDU. El autor reporta un mAP@50 del 92,60 % sobre un conjunto de test de 73 imágenes puras de PDU con 462 instancias, con una latencia de inferencia de 40–55 ms en CPU y menos de 15 ms en GPU.

El modelo resulta relevante para proyectos de seguridad industrial que necesiten un componente de visión por computador ligero, desplegable en tiempo real y con licencia permisiva, aunque su ámbito de aplicación está acotado a un entorno y una cámara concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), con backbone congelado en 10 capas ("Surgical Anti-Regression") |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de detección de objetos) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, checkpoint Ultralytics) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de una etapa basado en la familia YOLO11 de Ultralytics, en su variante `s`, la más pequeña de la gama estándar. El autor indica que el entrenamiento empleó una estrategia de "Surgical Anti-Regression" con congelación de las 10 primeras capas del backbone, presumiblemente para preservar las representaciones genéricas aprendidas por el modelo base y evitar el olvido catastrófico al adaptarlo al dominio PDU. No se detallan hiperparámetros, número de épocas, resolución de entrenamiento ni función de pérdida más allá de lo que implica el framework Ultralytics.

El conjunto de datos es híbrido: combina una referencia pública de EPI de Roboflow con imágenes reales de CCTV de la planta PDU, minería de negativos duros (hard-negative mining) sobre tuberías y mesa rotatoria, y minería específica de gafas. No se especifica el número total de imágenes de entrenamiento ni la composición exacta por clase. Tampoco se documenta si hubo aumentos de datos, balanceo de clases o validación cruzada.

## Capacidades

- Detección de objetos en imágenes y fotogramas de vídeo en cuatro clases: `helm`, `glove`, `kacamata` y `sepatu`.
- Inferencia en tiempo real: menos de 15 ms por fotograma en GPU y 40–55 ms en CPU según el autor.
- Integración directa con la librería `ultralytics` mediante `YOLO(model_url)` y `model.predict(...)`.
- Salida estándar de Ultralytics: cajas delimitadoras (`xyxy`), clase y confianza por detección, con utilidades de visualización y guardado.
- Uso offline y local, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües o multimodales más allá de la visión.

## Casos de uso

- Monitorización de cumplimiento de EPI en CCTV industrial: el modelo se ejecuta sobre los fotogramas de las cámaras de la planta PDU y genera alertas cuando un trabajador aparece sin casco, guantes, gafas o botas, aprovechando la latencia inferior a 15 ms en GPU para procesar varios streams en tiempo real.
- Auditoría de seguridad retrospectiva: procesar grabaciones históricas para cuantificar la tasa de cumplimiento por turno, zona y tipo de EPI, usando la salida estructurada de cajas y clases.
- Integración en un pipeline de analítica de vídeo con Ultralytics: el checkpoint se carga con `YOLO(url)` y se encadena a un tracker (por ejemplo, ByteTrack) para asociar detecciones a personas y evitar alertas duplicadas.
- Despliegue en dispositivos de borde: al ser un YOLO11s, el modelo es candidato a ejecutarse en GPUs de consumo o en aceleradores embebidos tras la exportación estándar de Ultralytics (ONNX, TensorRT, OpenVINO), aunque el autor no documenta estas exportaciones.
- Prototipado rápido de sistemas de seguridad: por su licencia MIT y su tamaño reducido, sirve como base para validar una prueba de concepto de detección de EPI antes de invertir en un dataset propio más amplio.
- Investigación académica sobre adaptación de dominio: el enfoque de congelación selectiva del backbone y minería de negativos duros puede reutilizarse como referencia metodológica en trabajos de visión aplicada a seguridad laboral.

## Benchmarks y rendimiento

El autor publica métricas sobre un "Master Test Set" de 73 imágenes puras de PDU con 462 instancias:

| Métrica | Valor |
|---|---|
| mAP@50 (global) | 92,60 % |
| mAP@50 — `helm` | 99,50 % |
| mAP@50 — `glove` | 93,10 % |
| mAP@50 — `sepatu` | 92,50 % |
| mAP@50 — `kacamata` | 85,40 % |
| mAP@50–95 | 58,20 % |
| Precision | 91,60 % |
| Recall | 91,10 % |
| Latencia de inferencia | 40–55 ms (CPU) / <15 ms (GPU) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación; por el tamaño de la variante `s` de YOLO11, es previsible que quepa holgadamente en GPUs de consumo, pero el autor no aporta cifras.
- GPU recomendadas: no especificadas; el autor solo indica que la latencia en GPU es inferior a 15 ms.
- CPU: el modelo es viable en CPU con latencias de 40–55 ms por imagen según el autor.
- Despliegue: la librería oficial es `ultralytics`; no se documentan exportaciones a ONNX, TensorRT, OpenVINO, TFLite ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de objetos).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akmalmanggala/pdu-apd-detection-yolo11` | YOLO11s | no disponible | no aplica | MIT | Hugging Face |
| YOLO11s (Ultralytics, base) | YOLO11s | no disponible | no aplica | AGPL-3.0 / Enterprise | GitHub, docs Ultralytics |
| YOLOv8s (Ultralytics) | YOLOv8s | no disponible | no aplica | AGPL-3.0 / Enterprise | GitHub, docs Ultralytics |

La comparación con los checkpoints base de Ultralytics es pertinente porque este modelo es un fine-tuning de YOLO11s; sin embargo, no se dispone de métricas comparativas publicadas entre este checkpoint y los modelos base en el mismo conjunto de test. No se identifican en la información proporcionada otros detectores de EPI comparables.

## Limitaciones y advertencias

- El conjunto de evaluación es muy pequeño (73 imágenes, 462 instancias) y de un único entorno (planta PDU), por lo que las métricas reportadas no garantizan generalización a otras cámaras, iluminaciones o plantas.
- La clase `kacamata` (gafas) obtiene el rendimiento más bajo (mAP@50 del 85,40 %), lo que sugiere dificultades con objetos pequeños u ocluidos.
- No se documentan sesgos demográficos, de género, de tono de piel ni de vestimenta; un detector de EPI entrenado con datos limitados puede fallar de forma desigual según el trabajador.
- Riesgo de falsos positivos y negativos en condiciones de baja visibilidad, lluvia, polvo o cámaras con ángulos no representados en el entrenamiento.
- No se especifica el número de imágenes de entrenamiento ni la composición por clase, lo que dificulta evaluar el riesgo de sobreajuste.
- La licencia MIT permite uso comercial, pero el modelo deriva de YOLO11 de Ultralytics, cuya licencia base es AGPL-3.0; conviene revisar la compatibilidad legal antes de un despliegue comercial.
- No se documentan exportaciones a formatos de despliegue en producción (ONNX, TensorRT, OpenVINO), por lo que el rendimiento fuera de PyTorch/Ultralytics no está verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/akmalmanggala/pdu-apd-detection-yolo11
- Pesos del modelo: https://huggingface.co/akmalmanggala/pdu-apd-detection-yolo11/resolve/main/best_yolo11s_pdu.pt
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
