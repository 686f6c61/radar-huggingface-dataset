# benjbritton/spacenet2-building-detector

## Resumen

`spacenet2-building-detector` es un modelo de segmentación de instancias para la detección de huellas de edificios en imágenes satelitales de alta resolución. Lo desarrolla Benjamin J. Britton (Universidad de Cincinnati) y se publica bajo licencia CC BY-SA 4.0. El modelo resuelve un problema clásico de teledetección: extraer polígonos de edificios individuales a partir de ortoimágenes RGB de 30 cm, devolviendo para cada edificio una máscara, una caja delimitadora y una puntuación de confianza.

Técnicamente es un Mask R-CNN con backbone ResNet-50 y FPN, implementado sobre Detectron2, inicializado desde los pesos COCO de Detectron2 y ajustado sobre las cuatro ciudades del dataset SpaceNet 2 (Las Vegas, París, Shanghái y Jartum) de forma conjunta. El repositorio ocupa 0,4 GB y la inferencia se ejecuta con la librería Detectron2, no con `transformers`.

Su relevancia actual radica en que ofrece un punto de partida reproducible y bien documentado para tareas de mapeo urbano y análisis de asentamientos, con métricas desglosadas por ciudad y una comparación entre semillas que permite estimar la varianza del entrenamiento. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN con backbone ResNet-50 + FPN (Detectron2), una sola clase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 800 px en el lado corto) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, `model_final.pth`; entrenamiento en fp16 mixto) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pth`, checkpoint de Detectron2) |

## Arquitectura y entrenamiento

El modelo es un Mask R-CNN estándar de Detectron2 con backbone ResNet-50 y FPN, configurado para una única clase (edificio). Se inicializa desde el checkpoint `mask_rcnn_R_50_FPN_3x` del model zoo de Detectron2, entrenado sobre COCO, y se ajusta durante 6.000 iteraciones (aproximadamente 11,3 épocas) con batch de 16, tasa de aprendizaje 0,02, 1.000 iteraciones de warmup y decaimientos ×0,1 en las iteraciones 4.000 y 5.500. El entrenamiento usó precisión mixta fp16, semilla 0 y una única NVIDIA RTX A5000 durante 1 hora y 45 minutos. La configuración completa está en `config.yaml`.

Los datos de entrenamiento proceden de SpaceNet 2 Building Detection v2 (Van Etten et al. 2018): imágenes WorldView-3 PS-RGB de 30 cm, teselas de 650 × 650 px y 16 bits, con polígonos de edificios para cuatro áreas de interés. El conjunto total es de 10.592 teselas, divididas 80/20 dentro de cada ciudad con semilla fija: 8.474 para entrenamiento y 2.118 para validación. Las 2.069 teselas sin edificios se mantienen como negativos en entrenamiento. El fichero de partición es `configs/spacenet2_split.json` en el repositorio de código.

Una innovación práctica relevante es el preprocesado de entrada: las teselas PS-RGB originales son de 16 bits, y el modelo espera RGB de 8 bits. El script `inference_example.py` aplica un estiramiento lineal por banda entre los percentiles 2 y 98 de los píxeles no nulos (los ceros se tratan como bordes sin datos). Para imágenes de bajo contraste, la opción `--stretch` reproduce ese mismo estiramiento.

## Capacidades

- Segmentación de instancias de edificios: devuelve máscara, caja delimitadora y puntuación de confianza por cada edificio detectado.
- Detección de objetos sobre imágenes aéreas y satelitales RGB de alta resolución (óptimo en torno a 30-50 cm/píxel).
- Extracción de huellas de edificios para mapeo urbano y análisis de asentamientos.
- Punto de partida para fine-tuning en otras ciudades, sensores o resoluciones.
- Procesamiento por teselas: redimensiona la entrada a 800 px en el lado corto y opera sobre recortes individuales, no sobre escenas completas.
- Inferencia en CPU (`--device cpu`) o GPU.
- Generación de superposiciones visuales con las huellas delineadas (`--overlay`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Mapeo urbano automatizado: procesar ortoimágenes de 30 cm teseladas y generar capas vectoriales de huellas de edificios para bases de datos catastrales o cartografía municipal, aprovechando la salida de máscaras y cajas directamente consumible por un SIG.
- Análisis de asentamientos informales: cuantificar densidad y extensión de edificaciones en áreas como Jartum, donde el modelo obtiene F1 de 0,6257, suficiente para estudios exploratorios con revisión humana posterior.
- Detección de cambios multi-temporal: ejecutar el detector sobre imágenes de la misma zona en fechas distintas y comparar las máscaras resultantes para identificar construcciones nuevas o demoliciones, usando el umbral de confianza 0,544 como referencia calibrada.
- Fine-tuning para nuevos sensores o regiones: el checkpoint sirve como inicialización para reentrenar con Detectron2 sobre imágenes de otros satélites o resoluciones, reduciendo el coste frente a entrenar desde cero.
- Docencia y benchmarking en visión por computador geoespacial: la configuración autocontenida, la partición fija y las métricas por semilla permiten reproducir experimentos y comparar variantes de arquitectura de forma controlada.
- Preprocesado para pipelines de análisis geoespacial: integrar el detector como etapa inicial que filtra y localiza edificios antes de tareas posteriores como clasificación de uso del suelo o estimación de población.
- Demo interactiva: la aplicación Gradio empaquetada en Docker con doce teselas de validación permite evaluar el modelo sobre imágenes subidas por el usuario sin montar el entorno manualmente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre la partición de validación de 2.118 teselas (no vistas en entrenamiento). Todas las métricas están marcadas como no verificadas (`verified: false`).

SpaceNet F1 con IoU ≥ 0,5 y umbral de puntuación único de 0,544 (seleccionado sobre el conjunto de entrenamiento):

| Ciudad | Este checkpoint (semilla 0) | Media ± desviación de tres semillas |
|---|---|---|
| Las Vegas | 0,8941 | 0,8948 ± 0,0007 |
| París | 0,7762 | 0,7787 ± 0,0032 |
| Shanghái | 0,6828 | 0,6848 ± 0,0018 |
| Jartum | 0,6257 | 0,6254 ± 0,0004 |
| **Macro** | **0,7447** | **0,7459 ± 0,0012** |

Métricas COCO de este checkpoint:

| Tarea | AP | AP50 |
|---|---|---|
| Segmentación | 49,44 | 81,21 |
| Caja delimitadora | 52,76 | 82,06 |

La concordancia entre tres ejecuciones independientes (en torno a 0,001 F1 por ciudad) indica que el checkpoint publicado es representativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una única NVIDIA RTX A5000 (24 GB) con precisión mixta, por lo que la inferencia cabe holgadamente en GPUs de gama consumer.
- GPU recomendadas: cualquier GPU NVIDIA con suficiente memoria para Mask R-CNN R50-FPN a 800 px; una RTX 4090, RTX 3090 o superior ofrece margen amplio. El entrenamiento de referencia usó una RTX A5000.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8 GB o más de VRAM; el autor no publica una cifra mínima exacta.
- Opciones de despliegue: Detectron2 con PyTorch (script `inference_example.py` incluido), CPU mediante `--device cpu`, y una demo Gradio empaquetada como imagen Docker con doce teselas de validación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de segmentación de edificios (parámetros, contexto, rendimiento, licencia o disponibilidad). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spacenet2-building-detector | no disponible | no aplica (visión) | Macro F1 0,7447 en SpaceNet 2 | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entrenó y evaluó exclusivamente con imágenes WorldView-3 de 30 cm de cuatro ciudades; su rendimiento en otros sensores, resoluciones y regiones no se ha medido.
- Existe una brecha notable entre ciudades: F1 de 0,8941 en Las Vegas frente a 0,6257 en Jartum, lo que refleja un sesgo hacia la morfología urbana y las condiciones de imagen de las ciudades mejor representadas.
- El umbral de puntuación 0,544 está calibrado sobre el conjunto de entrenamiento; en dominios distintos puede requerir recalibración.
- Riesgo de falsos negativos y positivos en imágenes de bajo contraste o con edificios de morfología atípica; no se documentan tasas de alucinación en el sentido generativo, pero sí errores de detección.
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar las implicaciones antes de un uso comercial propietario.
- El modelo espera RGB de 8 bits; las teselas de 16 bits deben someterse al estiramiento por percentiles descrito, y omitirlo degrada la detección.
- Procesa teselas individuales redimensionadas a 800 px en el lado corto, no escenas completas; el despliegue a gran escala requiere un pipeline de teselado y fusión de resultados.
- Los resultados de benchmarks están marcados como no verificados por el autor en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benjbritton/spacenet2-building-detector
- Paper de SpaceNet 2 (Van Etten et al. 2018): https://arxiv.org/abs/1807.01232
- Detectron2 (repositorio oficial): https://github.com/facebookresearch/detectron2
- Repositorio de código con `REPRODUCE.md`, `LAB_NOTEBOOK.md`, `config.yaml` y `configs/spacenet2_split.json`: no disponible como URL en la información proporcionada
- Proyecto W&B del entrenamiento (`benjbritton-geoai/benjbritton_FA26`, semilla 0): no disponible como URL en la información proporcionada
- Demo interactiva Gradio en Docker: no disponible como URL en la información proporcionada
