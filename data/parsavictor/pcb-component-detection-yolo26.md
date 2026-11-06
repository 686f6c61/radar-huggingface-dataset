# ParsaVictor/pcb-component-detection-yolo26

## Resumen

PCB Component Detection (YOLO26s, two-stage) es un sistema de visión por computador para la detección y clasificación de componentes electrónicos en fotografías de placas de circuito impreso (PCB) a resolución nativa. Lo desarrolla el autor independiente ParsaVictor y se publica como parte de la PCB Inspection Suite, un conjunto de modelos orientados a la inspección automática óptica (AOI) en fabricación electrónica. El problema que aborda es concreto: las fotos de placa miden entre 2000 y 4900 píxeles de ancho, y al reducirlas a 640 píxeles una resistencia 0402 queda en unos 6 píxeles, lo que la hace indetectable.

La solución es una arquitectura en dos etapas sobre YOLO26s con teselado a 1024 píxeles (lo que eleva las piezas pequeñas a unos 19 píxeles). La primera etapa, `any_best.pt`, es un localizador de una sola clase que encuentra cualquier elemento de la placa. La segunda, `fine_best.pt`, es un clasificador de 13 clases inicializado desde los pesos del localizador. Sobre ambas se añaden dos clasificadores Random Forest (`tree_rf.joblib` y `tree_rf_boards.joblib`) con 33 características CV diseñadas a mano que refinan las predicciones de tipo inciertas de forma explicable.

El modelo se entrenó sobre el dataset `ParsaVictor/pcb-component-detection` (458 placas, 108 000 componentes anotados) y se distribuye con licencia de uso exclusivamente de investigación, con contacto obligatorio con el autor antes de cualquier uso comercial. Es relevante ahora porque demuestra una estrategia práctica (teselado nativo más descomposición localizar/clasificar) para un dominio industrial donde los detectores genéricos fallan por resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), dos detectores en cascada más refinadores Random Forest |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1024x1024 px) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; cuantización no documentada) |
| Idiomas soportados | no aplica (visión por computador; etiquetas de clase en inglés) |
| Licencia | research-use-mixed-sources (uso de investigación; contacto previo al autor para uso comercial) |
| Formato de pesos | `.pt` (PyTorch/Ultralytics) y `.joblib` (Random Forest) |

## Arquitectura y entrenamiento

El sistema combina dos detectores YOLO26s con resolución de entrada de 1024 píxeles. El localizador `any_best.pt` es un detector de una clase ("component") cuyo objetivo es encontrar todos los elementos de la placa independientemente de su tipo. El clasificador `fine_best.pt` es un detector de 13 clases (IC, condensador electrolítico, LED, conector, interruptor/botón, condensador, resistencia, marcador, transistor, oscilador, inductor, diodo y "otros") que se inicializa a partir de los pesos del localizador, aprovechando que localizar es una tarea mucho más sencilla que nombrar. Ambos se entrenaron con Ultralytics YOLO26s, `imgsz` 1024, 80 épocas, sobre una Tesla T4.

El entrenamiento se hizo sobre el dataset del mismo autor (458 placas, 108 000 componentes anotados) con teselado a resolución nativa en lugar de reescalado a 640 píxeles. Sobre las detecciones se aplican dos clasificadores Random Forest entrenados con 33 características de visión por computador diseñadas manualmente, que corrigen predicciones de tipo con baja confianza de forma interpretable. Las métricas reportadas por el autor son del 93 % de exactitud en holdout sobre fotos aisladas y del 89 % con umbral p≥0,5 sobre recortes de placas de entrenamiento.

## Capacidades

- Detección de componentes electrónicos sobre fotografías de PCB a resolución nativa (2000-4900 px de ancho) mediante teselado a 1024 px.
- Localización de cualquier elemento de la placa con el modelo de una clase (`any_best.pt`), sin asignar tipo.
- Clasificación en 13 categorías de componente con el modelo `fine_best.pt`.
- Refinamiento explicable de predicciones de tipo inciertas mediante Random Forest sobre 33 características CV.
- Salida estándar de Ultralytics: cajas delimitadoras, etiquetas de clase y puntuaciones de confianza.
- Integración directa con la librería `ultralytics` y descarga de pesos vía `huggingface_hub`.
- No soporta tool calling, razonamiento multi-paso, agentes ni capacidades multilingües: es un modelo puramente visual de detección de objetos.

## Casos de uso

- Inspección automática óptica (AOI) en línea de fabricación: el sistema se integra tras la cámara de la línea para localizar y clasificar cada componente de la placa y comparar contra el listado de materiales (BOM), detectando componentes ausentes o mal colocados.
- Verificación de ensamblaje tras inserción superficial: el localizador de una clase garantiza que no falte ningún elemento y el clasificador de 13 clases valida el tipo, con el Random Forest resolviendo ambigüedades entre resistencias, condensadores e inductores.
- Control de calidad en retrabajo y reparación: dado que trabaja a resolución nativa, permite inspeccionar placas densas con componentes 0402 donde un detector reescalado a 640 px no vería nada.
- Auditoría de inventario visual de placas: conteo automático de componentes por tipo sobre fotografías de alta resolución para conciliar stock o validar prototipos.
- Generación de datasets anotados asistida: el pipeline de dos etapas más refinamiento puede preanotar nuevas placas y reducir el coste de etiquetado manual en proyectos de visión industrial.
- Investigación en visión por computador industrial: sirve como referencia reproducible de la estrategia de teselado nativo más descomposición localizar/clasificar para dominios de objetos pequeños y densos.
- Detección de defectos complementaria: junto a los modelos hermanos de la suite (placa desnuda y soldadura), permite construir un pipeline completo de inspección de PCB.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Split | P | R | mAP50 | mAP50-95 |
|---|---|---|---|---|---|
| any (localizador) | val (mejor época) | 0,773 | 0,771 | 0,809 | 0,427 |
| any (localizador) | test (46 placas no vistas) | 0,726 | 0,693 | 0,732 | 0,376 |
| fine (clasificador 13 clases) | test | 0,488 | 0,470 | 0,432 | 0,263 |

Rendimiento por clase del modelo `fine` en test:

| Clase | P | R | mAP50 |
|---|---|---|---|
| IC | 0,792 | 0,871 | 0,826 |
| Condensador electrolítico | 0,903 | 0,618 | 0,744 |
| LED | 0,887 | 0,477 | 0,652 |
| Conector | 0,502 | 0,665 | 0,538 |
| Interruptor/botón | 0,158 | 0,545 | 0,520 |
| Condensador | 0,523 | 0,610 | 0,504 |
| Resistencia | 0,499 | 0,467 | 0,426 |
| Marcador | 0,597 | 0,312 | 0,381 |
| Transistor | 0,355 | 0,488 | 0,324 |
| Oscilador | 0,431 | 0,381 | 0,299 |
| Otros | 0,288 | 0,284 | 0,204 |
| Inductor | 0,226 | 0,201 | 0,125 |
| Diodo | 0,182 | 0,189 | 0,067 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Entrenamiento realizado en una Tesla T4 (16 GB de VRAM) con YOLO26s a `imgsz` 1024 y 80 épocas, lo que da una referencia del orden de magnitud de memoria necesaria.
- Inferencia: al ser un modelo YOLO26s (variante small), la VRAM necesaria es moderada; no se publican cifras exactas de VRAM para inferencia. Cabe en GPUs de consumo con al menos 8 GB de VRAM asumiendo entrada de 1024 px, aunque el dato no está confirmado por el autor.
- GPUs recomendadas: Tesla T4 (validada en entrenamiento), así como GPUs de consumo tipo RTX 3060/4060/4090 por el tamaño small del modelo; no hay cifras oficiales de latencia ni throughput.
- Despliegue: librería `ultralytics` (PyTorch) como vía principal; exportación a otros formatos (ONNX, TensorRT) no documentada en la model card.
- El pipeline completo requiere además ejecutar los clasificadores Random Forest (`.joblib`) sobre las detecciones, lo que añade coste de CPU pero no de GPU.
- El teselado a 1024 px sobre imágenes de 2000-4900 px implica múltiples pasadas de inferencia por placa, lo que multiplica el coste computacional respecto a una sola pasada reescalada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PCB Component Detection YOLO26s (este) | YOLO26s en cascada + Random Forest | no disponible | 1024 px por tesela | 0,732 (test, localizador) / 0,432 (test, clasificador) | research-use-mixed-sources | Hugging Face, GitHub |
| PCB Bare-Board Defect Detection YOLO26 | YOLO26 para defectos de placa desnuda | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| PCB Solder Defect Detection YOLO26 | YOLO26 para defectos de soldadura | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| YOLO genérico (Ultralytics) | Detector de objetos general | no disponible | 640 px por defecto | no disponible para este dominio | AGPL-3.0 (Ultralytics) | Amplia |

No se dispone de datos de benchmarks de los modelos hermanos ni de comparativas con detectores específicos de PCB de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El clasificador de 13 clases tiene rendimiento bajo en varias categorías: diodo (mAP50 0,067), inductor (0,125) y "otros" (0,204), lo que limita su uso autónomo para esas clases.
- El localizador pierde rendimiento al pasar de validación (mAP50 0,809) a test con placas no vistas (0,732), lo que sugiere cierta sensibilidad a la distribución de placas.
- La licencia `research-use-mixed-sources` restringe el uso comercial: es necesario contactar con el autor antes de cualquier despliegue en producción.
- El dataset mezcla fuentes con licencias posiblemente heterogéneas, lo que añade incertidumbre legal para uso industrial.
- Requiere teselado a 1024 px para funcionar bien; reescalar la imagen completa degrada gravemente la detección de componentes pequeños.
- No hay información sobre sesgos, robustez frente a iluminación, reflejos u oclusiones, ni sobre el rendimiento en placas de fabricantes distintos a los del dataset.
- Riesgo de alucinación en el sentido de falsos positivos y clasificaciones erróneas, especialmente en clases con pocas muestras o aspecto similar (resistencia frente a inductor).
- No soporta texto, voz ni razonamiento; cualquier expectativa de modelo multimodal o de lenguaje es ajena a este sistema.
- El repositorio ocupa 0,0 GB según Hugging Face, lo que puede indicar que los pesos no están alojados íntegramente o que el tamaño se redondea; conviene verificar la descarga antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParsaVictor/pcb-component-detection-yolo26
- Dataset de entrenamiento: https://huggingface.co/datasets/ParsaVictor/pcb-component-detection
- Licencia del dataset: https://huggingface.co/datasets/ParsaVictor/pcb-component-detection/blob/main/LICENSE.md
- Repositorio GitHub con pipeline y notebooks: https://github.com/ParsaVictor/pcb-component-detection-yolo26
- Modelo hermano (defectos de placa desnuda): https://huggingface.co/ParsaVictor/pcb-bare-board-defect-detection-yolo26
- Modelo hermano (defectos de soldadura): https://huggingface.co/ParsaVictor/pcb-solder-defect-detection-yolo26
- Visión general de la suite: https://huggingface.co/ParsaVictor/pcb-inspection-suite
