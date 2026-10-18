# nurlanboranbay/tonton

## Resumen

`nurlanboranbay/tonton` es un repositorio de checkpoints de detección de objetos entrenados con la librería Ultralytics sobre lo que el autor denomina YOLO26, y no un modelo lingüístico: no genera texto ni procesa instrucciones, sino que predice cajas delimitadoras y keypoints sobre imágenes o vídeo. El autor lo publica como artefacto de pesos complementario al código del proyecto `tonton` (servicio) y `tonton2` (pipeline), e incluye tanto modelos base preentrenados de Ultralytics (`yolo26x-pose.pt` para personas y keypoints corporales, `yolo26x.pt` para objetos COCO cotidianos) como un detector propio de 10 clases y once ejecuciones experimentales con sus `best.pt`, `args.yaml` y `results.csv`.

El interés práctico del repositorio es acotado y muy específico: sirve para reproducir y reutilizar los pesos exactos que consume el servicio del autor, descargándolos con `hf_hub_download` y cargándolos con `YOLO(...)` de Ultralytics. No hay model card técnica con métricas, ni lista de las 10 clases personalizadas, ni declaración de licencia, ni idiomas (no aplica). El repositorio ocupa 0,8 GB y acumula 0 descargas y 0 likes en el momento de la consulta, lo que refleja que es un artefacto de trabajo personal más que un modelo distribuido a la comunidad.

Por tanto, esta ficha debe leerse como una evaluación de un checkpoint de detector en etapa experimental: la información disponible permite describir la estructura del repositorio y el uso previsto, pero no permite afirmar nada sobre precisión, mAP, latencia ni cobertura de clases.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO26 (Ultralytics), según la model card del autor; detalles de capas y bloques no disponibles |
| Parametros totales | no disponible (el repositorio contiene múltiples checkpoints con escalas aparentes s, m y x según los nombres de fichero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato `.pt` de PyTorch para Ultralytics |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible (la model card no declara licencia; conviene verificar la del código del proyecto antes de cualquier uso comercial) |
| Formato de pesos | `.pt` (PyTorch, cargable con `ultralytics.YOLO`); tamaño total del repositorio 0,8 GB |

Otros datos del repositorio: pipeline declarado `object-detection`, etiquetas `ultralytics`, `yolo`, `object-detection`, `region:us`; sin descargas ni likes; creado el 2026-10-17 y actualizado el mismo día.

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de la referencia a YOLO26 y a la librería Ultralytics. Los nombres de fichero indican familias de escala (`y26s`, `y26m`, `y26x`, presumiblemente small, medium y extra-large dentro de la nomenclatura del autor) y modalidades distintas: un modelo de pose (`yolo26x-pose.pt`) para personas, keypoints corporales y tracking, un detector general de objetos COCO (`yolo26x.pt`) y un detector propio de 10 clases (`tonton/runs/y26s_v1/best.pt`, reutilizado como `tonton2/weights/custom_y26s_v1.pt`).

Las once ejecuciones experimentales del directorio `tonton/runs/` sugieren una búsqueda de configuración de entrenamiento: variantes con recorte (`y26m_crop_v1`, `y26s_crop_v1`), entrenamiento a resolución 1280 (`y26m_v1_1280`), validación cruzada por folds (`y26s_cv0`, `y26s_cvb0` a `y26s_cvb3`), y variantes `_geo` e `_id`. Cada carpeta incluye `args.yaml` (hiperparámetros) y `results.csv` (métricas por época), pero la model card no reproduce ningún valor, por lo que no es posible afirmar número de imágenes, épocas, composición del dataset, técnicas de aumento ni si hubo ajuste fino desde pesos preentrenados.

## Capacidades

- Detección de objetos sobre imagen y vídeo en las 10 clases personalizadas del detector `custom_y26s_v1.pt` (los nombres de esas clases no están documentados en la información disponible).
- Detección de objetos COCO cotidianos mediante `yolo26x.pt`, con ejemplos citados por el autor: portátil, libro, bolsa, taza y botella.
- Estimación de pose humana y keypoints corporales mediante `yolo26x-pose.pt`.
- Tracking de personas, según la descripción del modelo base de pose.
- Inferencia por lotes y sobre flujo de vídeo a través de la API de Ultralytics (`YOLO(...).predict(...)`, `track(...)`).
- Carga programática desde el Hub: `hf_hub_download('nurlanboranbay/tonton', 'tonton2/weights/custom_y26s_v1.pt')`.
- Reentrenamiento y ajuste fino posteriores, al conservarse `args.yaml` y `results.csv` de cada ejecución.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, por ser un modelo de visión.

## Casos de uso

- **Análisis de ocupación y aforo en interiores**: usar `base/yolo26x-pose.pt` junto con el tracker de Ultralytics para contar personas y obtener keypoints en secuencias de vídeo; el modelo base está descrito por el autor precisamente para personas, keypoints y tracking.
- **Servicio de detección en producción del pipeline `tonton2`**: cargar `tonton2/weights/custom_y26s_v1.pt` con `hf_hub_download` y servirlo con la API de Ultralytics, garantizando que se usan exactamente los pesos con los que se validó el servicio.
- **Inventario de objetos de escritorio o aula**: `base/yolo26x.pt` cubre las categorías COCO citadas (portátil, libro, bolsa, taza, botella), suficiente para prototipos de asistencia o auditoría de material sin entrenamiento adicional.
- **Reproducción de experimentos de entrenamiento**: comparar las ejecuciones `y26s_crop_v1`, `y26s_cv0`–`cv3`, `y26m_v1_1280`, `_geo` e `_id` releyendo sus `results.csv` y `args.yaml` para aislar el efecto del recorte, la resolución y la validación cruzada sobre el mismo dataset.
- **Punto de partida para ajuste fino con datos propios**: reentrenar desde `y26s_v1/best.pt` o `y26m_v1_1280/best.pt` con el CLI de Ultralytics, aprovechando que ya están adaptados al dominio del autor (10 clases) en lugar de partir de COCO.
- **Módulo de visión en un pipeline mayor**: integrar el detector como etapa de preprocesado (recorte de regiones de interés antes de un clasificador o de un OCR), tal como sugiere la existencia de variantes `_crop`.
- **Evaluación comparativa de checkpoints en un banco de pruebas propio**: los once `best.pt` permiten medir precisión y latencia sobre un conjunto de validación propio antes de elegir el modelo definitivo, dado que el autor no publica métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mAP, precisión, recall, latencia ni curva de entrenamiento; solo referencia que cada ejecución contiene un `results.csv` con las métricas de entrenamiento, sin reproducir sus valores. No se debe asumir ningún nivel de precisión para las 10 clases personalizadas sin evaluarlas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. El repositorio pesa 0,8 GB en total y aloja al menos 14 checkpoints, por lo que el tamaño individual de cada `best.pt` no se puede inferir de los datos aportados.
- **GPU recomendadas**: no disponibles en la información proporcionada. Por la nomenclatura de escala (`s`, `m`, `x`) cabe esperar requisitos crecientes, pero no hay cifras verificables.
- **¿Cabe en GPU de consumo?**: no confirmado. No hay datos de VRAM ni de rendimiento; habría que medirlo por checkpoint.
- **Opciones de despliegue**: carga e inferencia con la librería Ultralytics (`pip install ultralytics`) en Python; exportación a otros formatos (ONNX, TensorRT, OpenVINO) mediante las herramientas de Ultralytics, no documentada en la model card y por tanto no verificada aquí. Descarga de pesos con `huggingface_hub`.
- **Latencia y throughput**: no disponibles.
- **Almacenamiento**: 0,8 GB para el repositorio completo; conviene descargar solo los ficheros necesarios en lugar de clonar todo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Datos verificables en esta ficha |
|---|---|---|---|---|---|---|
| `nurlanboranbay/tonton` | Detector YOLO26 + pose (Ultralytics) | no disponible (escalas s/m/x) | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes | Estructura de repo y uso previsto |
| Ultralytics YOLO26 (checkpoints oficiales) | Detector / pose | no disponible | no disponible | no disponible | Repositorio oficial de Ultralytics | No consultado en la información proporcionada |
| Ultralytics YOLOv8 / YOLO11 (checkpoints oficiales) | Detector / pose / segmentación | no disponible | no disponible | no disponible | Repositorio oficial de Ultralytics | No consultado en la información proporcionada |
| RT-DETR (referencia) | Detector transformer en tiempo real | no disponible | no disponible | no disponible | Varios repositorios | No consultado en la información proporcionada |

No se dispone de cifras comparativas de precisión, latencia o consumo entre estas alternativas en la información proporcionada; cualquier comparación cuantitativa requeriría evaluar los checkpoints sobre un mismo conjunto de validación.

## Limitaciones y advertencias

- **Licencia sin declarar**: la model card no especifica licencia. Los modelos de la familia Ultralytics suelen distribuirse bajo AGPL-3.0, lo que impondría obligaciones de apertura en servicios en red; hay que confirmar la licencia del repositorio y del código `tonton` antes de cualquier uso comercial. Este punto es bloqueante para producción.
- **Clases personalizadas no documentadas**: se menciona un detector de 10 clases, pero no se listan sus nombres, su significado ni el orden de los índices, lo que impide mapear las salidas a etiquetas sin inspeccionar el propio checkpoint.
- **Sin métricas publicadas**: no hay mAP, matrices de confusión ni curvas de precisión-recall; el rendimiento real del detector de 10 clases es desconocido y debe validarse empíricamente.
- **Dataset y procedencia desconocidos**: no se indica qué imágenes se usaron, su procedencia ni su licencia, lo que añade riesgo legal y de sesgo (por ejemplo, sesgo de dominio si el dataset procede de un entorno y una cámara concretos).
- **Riesgo de alucinación en sentido visual**: como todo detector, puede producir falsos positivos con alta confianza en escenas fuera de distribución, y degradarse con oclusión, poca luz o resoluciones distintas de las de entrenamiento (hay variantes entrenadas a 1280, lo que sugiere sensibilidad a la escala).
- **Artefacto personal sin mantenimiento aparente**: 0 descargas, 0 likes y actualización única el mismo día de creación; no hay garantía de soporte, issues ni correcciones.
- **Idioma y texto**: no aplica; el modelo no procesa lenguaje, por lo que no debe evaluarse con criterios de LLM.
- **Resultados de búsqueda web no utilizables**: las consultas realizadas devolvieron páginas sin relación alguna con el modelo (contenido para adultos y agregadores de vídeo), por lo que no se han usado como fuente. No se ha localizado documentación externa, paper ni demo independiente.
- **Trazabilidad de los pesos**: varios ficheros son el mismo checkpoint con rutas distintas (`tonton/runs/y26s_v1/best.pt` y `tonton2/weights/custom_y26s_v1.pt`); conviene fijar hashes para evitar divergencias entre el servicio y los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nurlanboranbay/tonton
- Código del proyecto citado por el autor: https://github.com/NurlanBoranbay/tonton
- Ultralytics (librería de carga e inferencia): no enlazado en la información proporcionada
- Paper, blog o demo del modelo: no disponibles
- Enlaces relevantes encontrados en la búsqueda web: ninguno (los resultados obtenidos no guardan relación con el modelo y se han descartado)
