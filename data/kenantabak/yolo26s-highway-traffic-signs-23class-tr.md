# kenantabak/yolo26s-highway-traffic-signs-23class-tr

## Resumen

`kenantabak/yolo26s-highway-traffic-signs-23class-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26s (familia Ultralytics), entrenado específicamente para el reconocimiento de señales de tráfico, límites de velocidad y elementos de señalización vial en el contexto turco. Lo publica Kenan Tabak en la plataforma EVREN (SSYZ) y lo distribuye a través de Hugging Face con licencia CC BY 4.0. El modelo resuelve la tarea de detección en tiempo real de 23 clases activas de señalética, con especial atención a preservar la orientación de flechas y la legibilidad de los dígitos de velocidad.

El modelo se entrenó sobre un subconjunto depurado del dataset "Çok Sınıflı Trafik İşaretleri, Sinyalizasyon ve Yol Unsurları Tespiti (40 Sınıf)" de EVREN, del que se eliminaron 17 clases con menos de 50 cajas anotadas. El resultado es un detector compacto (pesos de 19,4 MB) orientado a conducción autónoma y sistemas de asistencia a la conducción (ADAS), con resolución de entrenamiento de 768×768 y 55 épocas.

La relevancia actual del modelo radica en su enfoque en el mercado turco de señalización vial, un nicho poco cubierto por los detectores genéricos de COCO, y en sus métricas reportadas por el autor (95,53 % mAP@50, 80,05 % mAP@50-95, 92,58 % F1) sobre el conjunto de validación. No obstante, se trata de un modelo recién publicado, sin descargas ni validación externa, por lo que su robustez en producción aún no está contrastada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26s (familia Ultralytics, detector de una etapa) |
| Parámetros totales | no disponible (pesos de 19,4 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo `.pt`; compatible con exportación a ONNX/TensorRT/OpenVINO vía Ultralytics) |
| Idiomas soportados | tr, en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (componente Ultralytics bajo AGPL-3.0) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s de Ultralytics, un detector de objetos de una sola etapa basado en redes convolucionales con cuello de agregación de características multicapa. La resolución de entrenamiento es de 768×768 píxeles, con un tamaño de lote de 16 y 55 épocas (mejor época en la 54), usando `cos_lr=True` y paciencia de 18. El coste de entrenamiento reportado es de 0,256 GPU-horas.

El entrenamiento se realizó sobre 23 clases activas del dataset EVREN de 40 clases, tras filtrar las 17 clases con menos de 50 cajas. Se aplicó un pipeline de aumento de datos conservador y específico para señalética: `mosaic=0.75`, `close_mosaic=12`, `fliplr=0.0`, `flipud=0.0`, `degrees=0.0`, `scale=0.35`, `erasing=0.0`, `hsv_h=0.005`, `hsv_s=0.15` y `hsv_v=0.3`. La desactivación de volteos horizontal y vertical y de rotaciones es una decisión técnica deliberada para evitar la inversión de flechas de giro y la confusión de dígitos en los límites de velocidad. No se reporta uso de RLHF, DPO ni técnicas de destilación.

## Capacidades

- Detección de objetos en imágenes para 23 clases de señalética vial turca: límites de velocidad (30, 50, 60, 70, 80, 100, 120), Stop, No Entry, Give Way, No Over Taking, No Over Taking Trucks, Road Work, Danger Ahead, curvas (Right Curve Ahead, Right Sharp Curve, Left Sharp Curve), Turn Right, señales de tráfico (RedSignal, GreenSignal), además de las clases auxiliares Pedestrian, human y Car.
- Detección en tiempo real orientada a conducción autónoma y ADAS.
- Preservación de la orientación de flechas y de la integridad de los dígitos de velocidad gracias a la ausencia de aumentos geométricos.
- Inferencia mediante la librería Ultralytics (`YOLO(...).predict(...)`) con parámetros de confianza e IoU configurables.
- Soporte de exportación a formatos desplegables (ONNX, TensorRT, OpenVINO, CoreML) a través del ecosistema Ultralytics, aunque no se documenta explícitamente en la model card.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión por computador.

## Casos de uso

- **Conducción autónoma y ADAS**: el modelo detecta límites de velocidad, señales de Stop, ceda el paso y curvas peligrosas en tiempo real, integrándose en el pipeline de percepción del vehículo para ajustar la velocidad o alertar al conductor. Su resolución de 768 px y su licencia permisiva lo hacen adecuado para prototipado rápido.
- **Sistemas de alerta de límite de velocidad**: dado el rendimiento específico en las clases Speed Limit 30–120 (mAP@50 entre 96,93 % y 99,50 %), puede emplearse para avisar al conductor cuando supera el límite detectado en la vía.
- **Auditoría y mantenimiento de infraestructura vial**: procesamiento por lotes de imágenes de cámaras de tráfico o vehículos de inspección para inventariar el estado y la ubicación de señales, detectando señales degradadas u obstruidas.
- **Análisis de escenas de tráfico urbano**: la inclusión de las clases Car, Pedestrian y human permite un análisis básico de la escena, útil para estudios de movilidad o para sistemas de conteo en intersecciones.
- **Validación de mapas de alta definición (HD maps)**: contraste automático entre las señales detectadas en imágenes reales y las anotadas en el mapa, para detectar discrepancias u obras (clase Road Work, mAP@50 97,87 %).
- **Investigación en visión por computador aplicada al tráfico turco**: el modelo y su dataset asociado sirven como línea base reproducible para experimentos con YOLO26 y para comparativas con otros detectores en el dominio de señalética turca.
- **Formación y docencia**: ejemplo práctico de entrenamiento con hiperparámetros específicos de dominio y de evaluación por clase, útil en cursos de deep learning aplicado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validación del dataset EVREN (métricas no verificadas externamente):

| Métrica | Valor |
|---|---|
| mAP@50 | 95,53 % |
| mAP@50-95 | 80,05 % |
| Precisión | 96,55 % |
| Recall | 89,54 % |
| F1 | 92,58 % |
| Mejor época / total | 54/55 |

Rendimiento por clase (selección de las más relevantes):

| Clase | mAP@50 | Precisión | Recall | F1 |
|---|---:|---:|---:|---:|
| Pedestrian | 99,50 % | 91,62 % | 100,00 % | 95,63 % |
| No Over Taking | 99,50 % | 94,43 % | 100,00 % | 97,14 % |
| Speed Limit 120 | 99,50 % | 98,34 % | 100,00 % | 99,17 % |
| Right Curve Ahead | 99,50 % | 91,15 % | 100,00 % | 95,37 % |
| Speed Limit 70 | 99,44 % | 100,00 % | 92,75 % | 96,24 % |
| Speed Limit 100 | 99,22 % | 97,45 % | 96,55 % | 97,00 % |
| Speed Limit 60 | 99,04 % | 99,21 % | 95,24 % | 97,18 % |
| Stop | 97,79 % | 99,81 % | 96,09 % | 97,92 % |
| Car | 96,72 % | 96,30 % | 91,91 % | 94,05 % |
| RedSignal | 90,92 % | 96,43 % | 84,62 % | 90,14 % |
| Turn Right | 87,48 % | 100,00 % | 81,10 % | 89,57 % |
| GreenSignal | 86,88 % | 89,87 % | 73,91 % | 81,11 % |
| Give Way | 85,46 % | 98,74 % | 76,00 % | 85,89 % |

Las clases con peor rendimiento son Give Way (85,46 % mAP@50), GreenSignal (86,88 %) y Turn Right (87,48 %), lo que sugiere dificultades con señales de baja frecuencia o con condiciones de iluminación variables en los semáforos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con pesos de 19,4 MB en FP32 y resolución de entrada de 768×768, la huella de memoria es reducida (típicamente por debajo de 1 GB en FP16, aunque este dato no lo confirma el autor).
- **GPU recomendadas**: no disponible. Por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para inferencia en tiempo real, pero el autor no publica recomendaciones ni mediciones de latencia.
- **Compatibilidad con GPU consumer**: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque no se documenta oficialmente.
- **Opciones de despliegue**: Ultralytics (nativo, vía `YOLO(...).predict(...)`); exportación a ONNX, TensorRT, OpenVINO o CoreML a través de la propia librería. No se documenta soporte nativo en vLLM, llama.cpp ni Ollama, que son frameworks para modelos de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Resolución | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kenantabak/yolo26s-highway-traffic-signs-23class-tr | YOLO26s | 23 (señalética turca) | 768×768 | 95,53 % (autor) | CC BY 4.0 | Hugging Face, EVREN |
| YOLO11s (Ultralytics, COCO) | YOLO11s | 80 (COCO) | 640×640 | no disponible en esta ficha | AGPL-3.0 | Ultralytics, Hugging Face |
| YOLOv8s (Ultralytics, COCO) | YOLOv8s | 80 (COCO) | 640×640 | no disponible en esta ficha | AGPL-3.0 | Ultralytics, Hugging Face |
| Detectores genéricos de señalética (p. ej. GTSDB) | SSD/CNN | variable | variable | no disponible en esta ficha | variable | papers, repos |

La comparación directa con otros detectores de señalética turca no está disponible en la información proporcionada. Los modelos YOLO genéricos de Ultralytics no incluyen las clases específicas de señalética turca, por lo que la comparación solo es posible en términos de arquitectura y licencia, no de rendimiento sobre el mismo dataset.

## Limitaciones y advertencias

- **Sesgo geográfico**: el modelo está entrenado exclusivamente con señalética vial turca; su rendimiento en otros países o con normativas de señalización distintas no está validado.
- **Clases eliminadas**: 17 clases del dataset original fueron descartadas por tener menos de 50 cajas anotadas, por lo que el modelo no detectará esas señales (no se especifica cuáles en la información disponible).
- **Riesgo de alucinación y falsos positivos**: como todo detector, puede producir detecciones espurias en escenas con señalética degradada, oclusiones o condiciones de iluminación adversas; las clases con menor recall (Give Way 76,00 %, GreenSignal 73,91 %, Turn Right 81,10 %) son especialmente vulnerables.
- **Métricas no verificadas**: los resultados del model-index están marcados como `verified: false`; no hay evaluación independiente ni comparación con líneas base publicadas.
- **Licencia dual**: los pesos se distribuyen bajo CC BY 4.0, pero el componente de framework Ultralytics está bajo AGPL-3.0, lo que puede imponer obligaciones de copyleft en despliegues comerciales que integren la librería. Es necesario revisar la compatibilidad antes de un uso comercial.
- **Madurez**: modelo con 0 descargas y 0 likes en el momento de la ficha, publicado en 2026; sin evidencia de uso en producción ni de validación por terceros.
- **Idiomas**: las etiquetas y la documentación están en turco e inglés; el modelo no procesa texto, por lo que el soporte multilingüe se limita a la metadata.
- **Resolución de inferencia**: el ejemplo de la model card usa `imgsz=640` aunque el entrenamiento fue a 768; usar una resolución distinta a la de entrenamiento puede degradar el rendimiento y debería validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-highway-traffic-signs-23class-tr
- Página del modelo en EVREN (producción): https://evren.ssyz.org.tr/models/u19979974710e/karayolu-trafik-isaretleri-hiz-siniri-ve-sinyalizasyon-tespiti-23-sinif
- Dataset de entrenamiento en EVREN (40 clases, Grade A): https://evren.ssyz.org.tr/datasets/u19979974710e/cok-sinifli-trafik-isaretleri-sinyalizasyon-ve-yol-unsurlari-tespiti-40-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador turca en Hugging Face: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Repositorio Ultralytics (framework): https://github.com/ultralytics/ultralytics
