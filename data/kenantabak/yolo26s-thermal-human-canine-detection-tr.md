# kenantabak/yolo26s-thermal-human-canine-detection-tr

## Resumen

El modelo `yolo26s-thermal-human-canine-detection-tr` es un detector de objetos en tiempo real desarrollado por Kenan Tabak sobre la arquitectura Ultralytics YOLO26 Small (`yolo26s`). Está especializado en la detección de dos clases —`person` y `dog`— sobre imágenes de cámara térmica (infrarrojo), orientado a escenarios nocturnos y de baja visibilidad como vigilancia de fronteras, búsqueda y rescate, y seguridad medioambiental. El autor lo publica a través de la plataforma EVREN (SSYZ) y lo distribuye en Hugging Face con licencia CC BY 4.0.

Se trata de un modelo compacto: los pesos ocupan 18,5 MB y se entrenó durante 50 épocas a una resolución de 640 × 640 px, con un coste declarado de 0,031 GPU-hora sobre una NVIDIA H200 o A100. A pesar de su tamaño reducido, el autor reporta un mAP@50 del 97,92 % y un F1 del 94,02 % sobre el conjunto de validación del dataset «Termal Kamera İnsan ve Köpek Tespiti (2 Sınıf)».

Su relevancia actual radica en la combinación de un dominio muy específico (termografía aérea y terrestre), un tamaño apto para despliegue en el borde (edge) y formatos de exportación listos para producción (PyTorch, ONNX y TFLite), lo que facilita su integración en drones, cámaras IP térmicas y sistemas empotrados con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 Small (`yolo26s`, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640 × 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en FP32 PyTorch, ONNX y TFLite; no se documentan variantes INT8/FP16) |
| Idiomas soportados | tr, en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (pesos); framework Ultralytics bajo AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best.onnx`), TFLite (`best.tflite`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 Small de Ultralytics, una familia de detectores de una sola etapa (single-stage) basada en backbone convolucional con cuello de agregación multi-escala y cabeza de detección densa. La entrada se estandariza a 640 × 640 px y la salida son cajas delimitadoras con clase y confianza para dos categorías: `person` y `dog`. No se documentan innovaciones adicionales como decodificación especulativa ni mecanismos de atención lineal, al tratarse de un detector convolucional clásico.

El entrenamiento se realizó sobre el dataset «Termal Kamera İnsan ve Köpek Tespiti (2 Sınıf)» (versión 1.0, etiquetado como Grade A · 100/100 en la plataforma EVREN), con 2 clases, optimizador `auto` con scheduler Cosine LR y precisión mixta automática (AMP). Se completaron 50 épocas, alcanzando el mejor checkpoint en la época 50/50, con un coste total de 0,031 GPU-hora. No se especifica el número de imágenes del dataset, la composición exacta ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional.

## Capacidades

- Detección de objetos en tiempo real sobre imágenes térmicas (infrarrojo) con dos clases: `person` y `dog`.
- Funcionamiento en condiciones de baja iluminación y visión nocturna, al operar sobre termografía en lugar de RGB.
- Inferencia sobre imágenes individuales, vídeo y streams, según la API estándar de Ultralytics (`model.predict(source=...)`).
- Exportación a PyTorch, ONNX y TFLite para despliegue en servidor, escritorio y dispositivos empotrados.
- Ajuste de umbrales de confianza e IoU en inferencia (`conf`, `iou`) para calibrar precisión/recall según el escenario.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión.
- Capacidades multilingües limitadas a la documentación y etiquetas en turco e inglés; no procesa texto.

## Casos de uso

- Vigilancia de fronteras nocturna: el modelo detecta personas y perros en imágenes térmicas de cámaras fijas o drones, cubriendo franjas horarias sin luz visible donde los detectores RGB fallan. Su tamaño de 18,5 MB permite ejecutarlo en el propio dispositivo de captura.
- Búsqueda y rescate (SAR): integrado en drones con cámara térmica, permite localizar personas extraviadas en entornos rurales o de montaña, y distinguir entre personas y animales (perros) para priorizar la respuesta de los equipos.
- Seguridad perimetral de instalaciones críticas: despliegue sobre cámaras térmicas IP en perímetros industriales o energéticos para alertar de intrusiones humanas y presencia de cánidos, con umbrales de confianza ajustables para reducir falsos positivos.
- Protección de fauna y ganado: monitorización de presencia de perros (por ejemplo, salvajes o asilvestrados) en explotaciones ganaderas o entornos naturales, usando la clase `dog` con AP@50 del 99,50 % reportada por el autor.
- Despliegue en el borde con TFLite: el export a TFLite permite ejecutar el detector en placas como Raspberry Pi, Jetson Nano o cámaras inteligentes, sin dependencia de GPU de servidor, para vigilancia autónoma de bajo consumo.
- Análisis forense y post-incidente: procesamiento por lotes de grabaciones térmicas archivadas para localizar y contar personas y perros en un intervalo de tiempo, apoyándose en la API de Ultralytics y el export ONNX para pipelines en Python.
- Integración en sistemas de alarma con visión: combinación de las detecciones con reglas de negocio (zonas restringidas, horarios, conteo) para disparar alertas automatizadas en centros de control.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 (%) | 97,92 |
| mAP@50-95 (%) | 76,74 (la model card indica 0,00 en el model-index; discrepancia sin resolver) |
| Precision (%) | 94,06 |
| Recall (%) | 94,31 |
| F1 (%) | 94,02 |
| Mejor época | 50 / 50 |

Rendimiento por clase (validación, según el autor):

| Clase | AP@50 (%) | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|
| `dog` | 99,50 | 95,86 | 100,00 | 97,88 |
| `person` | 96,35 | 92,25 | 88,16 | 90,16 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de pesos (18,5 MB) y la resolución de entrada (640 × 640 px), la huella en memoria es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor cita NVIDIA H200 y A100 únicamente para el entrenamiento (0,031 GPU-hora). Para inferencia, cualquier GPU moderna es suficiente; se puede ejecutar también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos unos pocos GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090); también en CPU y en aceleradores empotrados vía TFLite.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, TensorFlow Lite, y potencialmente TensorRT o OpenVINO mediante conversión desde ONNX (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yolo26s-thermal-human-canine-detection-tr` | YOLO26s | 2 (person, dog) | 640 × 640 | 97,92 % (autor) | CC BY 4.0 (pesos) / AGPL-3.0 (framework) | Hugging Face |
| YOLO11s (Ultralytics, genérico) | YOLO11s | 80 (COCO) | 640 × 640 | no disponible en esta ficha | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8s (Ultralytics, genérico) | YOLOv8s | 80 (COCO) | 640 × 640 | no disponible en esta ficha | AGPL-3.0 | Ultralytics / Hugging Face |
| Detectores térmicos especializados de terceros | variable | variable | variable | no disponible | variable | variable |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría (detección térmica de personas y animales).

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo detecta dos clases (`person`, `dog`) y solo sobre imágenes térmicas; no es un detector genérico ni funciona sobre RGB sin reentrenamiento.
- Los resultados (mAP@50 97,92 %, F1 94,02 %) son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Existe una discrepancia en la model card: el model-index reporta mAP@50-95 = 0,00 mientras que la tabla del README indica 76,74 %; conviene tratar este dato con cautela.
- No se documenta el tamaño ni la composición del dataset de entrenamiento, lo que dificulta evaluar la generalización a otras cámaras térmicas, rangos de temperatura, altitudes o condiciones meteorológicas.
- La clase `person` presenta un recall inferior (88,16 %) al de `dog` (100,00 %), lo que implica un mayor riesgo de falsos negativos en detección de personas, precisamente la clase crítica en aplicaciones SAR y de seguridad.
- Licencia de pesos CC BY 4.0 (permite uso comercial con atribución), pero el framework Ultralytics subyacente es AGPL-3.0; el uso comercial de los pesos derivados puede requerir revisión legal o licencia comercial de Ultralytics.
- Riesgo de alucinación entendido como falsos positivos en texturas térmicas ambiguas (superficies calientes, animales distintos de perros, reflejos); se recomienda calibrar `conf` e `iou` por escenario.
- No se documentan sesgos demográficos, de género ni de complexión en la clase `person`; al ser un detector térmico, el riesgo de sesgo por apariencia es menor que en RGB, pero no se ha evaluado.
- No apto para aplicaciones críticas de seguridad sin validación previa en el dominio de despliegue objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-thermal-human-canine-detection-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/termal-insan-ve-kopek-tespiti
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/termal-kamera-insan-ve-kopek-tespiti-2-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
