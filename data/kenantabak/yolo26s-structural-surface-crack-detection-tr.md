# kenantabak/yolo26s-structural-surface-crack-detection-tr

## Resumen

yolo26s-structural-surface-crack-detection-tr es un modelo de detección de objetos basado en la arquitectura YOLO26 Small (`yolo26s`) de Ultralytics, especializado en la identificación de grietas superficiales y estructurales en hormigón y superficies de obra civil. Lo desarrolla Kenan Tabak dentro de la plataforma EVREN (SSYZ), un catálogo turco de modelos de visión por computador orientados a producción, y se distribuye con licencia CC-BY-4.0.

El modelo resuelve una tarea de detección de una única clase (grieta) sobre imágenes de inspección estructural, con un objetivo declarado de inferencia en tiempo real. Según la model card, se entrenó sobre el conjunto "Yüzey ve Yapısal Çatlak Tespiti (1 Clase)" de la propia plataforma EVREN y alcanza un mAP@50 del 99,34 % y un mAP@50-95 del 74,78 % en validación, con un peso de 19,33 MB en formato PyTorch.

Su relevancia práctica es acotada pero clara: es un detector ligero, entrenado con un coste mínimo (0,1167 GPU-horas en una NVIDIA H200 o A100), pensado para integrarse en flujos de inspección de infraestructuras con despliegue en GPU de consumo o en el borde. No es un modelo de lenguaje ni un modelo multimodal general; es un detector de una sola clase con soporte documentado para turco e inglés en la metadata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 Small (`yolo26s`, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publica `best.pt` en PyTorch) |
| Idiomas soportados | tr, en (según metadata de la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`best.pt`, `yolo26s-structural-surface-crack-detection-tr.pt`) |
| Tamaño del repositorio | 0,1 GB |
| Tamaño de pesos | 19,33 MB |
| Tarea | Object detection (1 clase: grieta) |
| Etiquetas | ultralytics, onnx, evren, ssyz, yolo26s, yolo26, yolo11, object-detection, computer-vision, turkish, structural-inspection |
| Resolución de entrenamiento | 320 px (según título de la model card) |
| Coste de entrenamiento | 0,1167 GPU-horas (1× NVIDIA H200 / A100) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en su variante Small, la familia de detectores de una etapa de Ultralytics. Se trata de un detector denso de cajas ancla libres (anchor-free) con una única pasada hacia delante, orientado a latencia baja. La model card no detalla la composición interna de la red (número de capas, canales, mecanismo de asignación de etiquetas ni función de pérdida), por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó sobre el conjunto "Yüzey ve Yapısal Çatlak Tespiti (1 Clase)" (versión `v1.0`) de la plataforma EVREN, con una sola clase de salida. La model card declara una resolución de trabajo de 320 px y un coste de 0,1167 GPU-horas en una NVIDIA H200 o A100, lo que indica un ajuste fino corto sobre un dataset pequeño. No se documenta el número de imágenes, la composición del dataset, el uso de aumento de datos, ni si hubo una fase de alineación o refinamiento posterior. Tampoco se especifica el origen de los pesos base de `yolo26s` (preentrenamiento en COCO u otro corpus).

## Capacidades

- Detección de grietas superficiales y estructurales en una única clase, sobre imágenes estáticas.
- Inferencia en tiempo real declarada, coherente con la familia YOLO y con un peso de 19,33 MB.
- Entrada de imagen con redimensionado configurable (`imgsz`), con 640 px como valor de ejemplo en la model card y 320 px como resolución de entrenamiento declarada.
- Umbrales de confianza e IoU ajustables en la llamada a `predict` (`conf`, `iou`).
- Salida de cajas delimitadoras con clase e índice de confianza por detección, accesible vía la API de Ultralytics.
- Exportación a otros formatos no documentada en la model card, aunque la etiqueta `onnx` sugiere compatibilidad con el flujo de exportación de Ultralytics.
- Soporte de idiomas tr y en únicamente en la metadata del modelo; no implica capacidad lingüística, ya que no procesa texto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Inspección de estructuras de hormigón en obra civil: el modelo se aplica sobre fotografías de muros, pilares y forjados para localizar grietas y priorizar la revisión manual de las zonas marcadas, aprovechando su coste de inferencia bajo.
- Mantenimiento predictivo de infraestructuras: integrado en un pipeline que procesa capturas periódicas de puentes, túneles o presas, permite comparar detecciones entre campañas y detectar la progresión de fisuras.
- Drones de inspección de fachadas: con 19,33 MB de pesos, el modelo cabe en el cómputo de borde de una aeronave o de una estación base, lo que permite filtrar imágenes en vuelo y reducir el volumen transmitido.
- Control de calidad en prefabricados de hormigón: en una línea de producción, la detección a 320 px permite descartar piezas con fisuras visibles antes del envío, con umbrales de confianza ajustables según la tolerancia del cliente.
- Digitalización de informes de patología estructural: el modelo preetiqueta las imágenes de un informe técnico y acelera la labor del inspector, que revisa y corrige las cajas propuestas en lugar de anotarlas desde cero.
- Docencia e investigación en visión por computador aplicada: sirve como referencia reproducible de un detector de una clase entrenado con un presupuesto de cómputo mínimo, útil para comparar técnicas de aumento de datos o de cuantización en un caso real.
- Prototipado rápido en la plataforma EVREN: al estar registrado como modelo `PRODUCTION` en el catálogo SSYZ, puede reutilizarse como punto de partida para ajustes finos sobre datasets propios de inspección.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el conjunto de validación "Yüzey ve Yapısal Çatlak Tespiti (1 Clase)" (tipo `evren-grade-a`). Ninguno de los valores está verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---:|
| mAP@50 (%) | 99,34 |
| mAP@50-95 (%) | 74,78 |
| F1 Score (%) | 98,69 |
| Precision (%) | 98,13 |
| Recall (%) | 99,25 |

No se han publicado resultados comparativos con otros detectores ni sobre conjuntos de validación externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 19,33 MB de pesos en FP32, el modelo ocupa menos de 100 MB en memoria, por lo que la VRAM vendrá dominada por el tamaño del lote y la resolución de entrada, no por los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el autor cita NVIDIA H200 y A100 únicamente como hardware de entrenamiento (0,1167 GPU-horas), no como requisito de inferencia.
- GPU de consumo: cabe con holgura en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090), así como en aceleradores integrados con soporte para el runtime de Ultralytics.
- Opciones de despliegue: la model card solo documenta inferencia con la librería `ultralytics` en Python. La etiqueta `onnx` sugiere la posibilidad de exportar a ONNX Runtime, aunque el procedimiento no está descrito en la información disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles. No se publican mediciones de FPS ni de tiempo por imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales verificables.

| Modelo | Arquitectura | Clases | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26s-structural-surface-crack-detection-tr | YOLO26 Small | 1 (grieta) | 320 px de entrenamiento | CC-BY-4.0 | Hugging Face, 0 descargas |
| YOLO26 Small (base Ultralytics) | YOLO26 Small | 80 (COCO) | no disponible en esta ficha | depende de Ultralytics | repositorio oficial de Ultralytics |
| YOLO11 Small (base Ultralytics) | YOLO11 Small | 80 (COCO) | no disponible en esta ficha | depende de Ultralytics | repositorio oficial de Ultralytics |

La comparación de rendimiento frente a otros detectores de grietas no está disponible: no se han publicado métricas cruzadas ni evaluaciones sobre datasets independientes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta "grieta"; no distingue tipologías, gravedad ni causa, y no detecta otras patologías del hormigón.
- Métricas no verificadas: los valores de mAP, precision, recall y F1 proceden del propio autor y figuran con `verified: false`; no hay evaluación independiente.
- Dataset de validación propio: los resultados se miden sobre el mismo corpus de la plataforma EVREN, sin validación cruzada con imágenes de otras fuentes, cámaras o condiciones de iluminación.
- Resolución de entrenamiento baja (320 px): las grietas finas o lejanas pueden quedar por debajo del tamaño mínimo detectable; se recomienda validar el comportamiento a la resolución de despliegue real.
- Riesgo de falsos positivos en texturas similares a grietas (juntas de hormigonado, manchas, sombras, grafitis), no cuantificado en la información disponible.
- Sesgos demográficos y geográficos: el dataset es turco y de la plataforma EVREN; no se documenta diversidad de materiales, climas ni tipologías constructivas.
- Idiomas: la metadata declara tr y en, pero el modelo no procesa texto; la indicación es meramente descriptiva.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria al autor (Kenan Tabak) y a la plataforma EVREN; debe conservarse la cita indicada en la model card.
- Sin garantías de producción: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni informes de fallos en campo.
- No apto para decisiones estructurales autónomas: la detección debe tratarse como un filtro de triaje y no sustituir la inspección de un técnico cualificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-structural-surface-crack-detection-tr
- Página del modelo en la plataforma EVREN (PRODUCTION): https://evren.ssyz.org.tr/models/u19979974710e/yuzey-ve-yapisal-catlak-tespiti-320px-hafif-model
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/users/u19979974710e
- Catálogo de datasets turcos de visión por computador (328 datasets): https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
