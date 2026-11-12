# fishfan14/pools-yolo11m-merged

## Resumen

`fishfan14/pools-yolo11m-merged` es un detector de objetos basado en YOLO11m, la variante de tamano medio de la familia YOLO11 de Ultralytics, especializado en la deteccion de piscinas en imagenes aereas y ortofotos. Lo publica el usuario `fishfan14` y resuelve un problema muy concreto de teledeteccion: localizar piscinas sobre teselas de alta resolucion procedentes de dos regiones geograficas distintas (Cannes, Francia, y Paises Bajos).

El modelo es el resultado de fusionar ("merged") el entrenamiento sobre dos conjuntos de datos aereos armonizados a una misma escala de 20 cm/px y teselas de 640x640, con una unica clase `pool`. La motivacion del merge es clara segun la tabla de resultados del autor: el modelo fusionado mantiene el rendimiento en Cannes (mAP50 0,971) y mejora sustancialmente la generalizacion en Paises Bajos (0,867 en el conjunto `nl` y 0,893 en `nl_cov`) respecto al modelo entrenado solo con Cannes.

Se trata de un modelo de vision por computador puro, sin capacidades de lenguaje ni generacion de texto. Su relevancia es practica: ofrece un detector listo para inferencia en pipelines de teledeteccion, con pesos en formato PyTorch (`.pt`) consumibles directamente mediante la libreria `ultralytics`, y con una indicacion explicita del autor sobre como ajustar `imgsz` para imagenes de distinta resolucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`), archivo `weights/best.pt` |

## Arquitectura y entrenamiento

YOLO11m es un detector de objetos de una sola etapa con backbone y cuello convolucionales y una cabeza de deteccion que predice cajas y clases directamente, siguiendo la linea de las versiones previas de YOLO de Ultralytics. La variante `m` (medium) es el punto intermedio de la familia en cuanto a capacidad y coste computacional. No se dispone de detalles adicionales sobre el backbone exacto ni sobre el numero de parametros en la informacion proporcionada.

El entrenamiento combina dos conjuntos de datos aereos, todos reescalados a 20 cm/px y teselas de 640x640, con una unica clase `pool`:

- Kaggle `alexj21/swimming-pool-512x512` (Cannes, Francia), teselas rellenadas ("padded") hasta 640 px e incorporando pseudo-etiquetas para piscinas ausentes en las anotaciones originales.
- Roboflow `poolfinder/pools-tutud` v5 (Paises Bajos, CC BY 4.0), con clases `pool` y `covered-pool`, reescalado desde 8 cm/px.

No se especifican en la model card el numero de imagenes de entrenamiento, el numero de epocas, la composicion exacta del dataset fusionado ni si se aplicaron tecnicas de aumento de datos mas alla del reescalado y el padding. El autor tampoco documenta el procedimiento exacto de fusion de los dos entrenamientos, mas alla de etiquetar el resultado como "merged".

## Capacidades

- Deteccion de objetos de una sola clase (`pool`) en imagenes aereas y ortofotos.
- Localizacion de piscinas descubiertas y cubiertas (`covered-pool` se mapea a la clase unica `pool`).
- Inferencia sobre teselas de 640x640 a 20 cm/px, con ajuste de `imgsz` para otras resoluciones (por ejemplo, `imgsz=832` para ortofotos a 25 cm/px).
- Umbrales de confianza e IoU configurables en la llamada a `predict` (`conf`, `iou`).
- Integracion directa con la libreria `ultralytics` y descarga de pesos via `huggingface_hub`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni capacidades multilingues: es exclusivamente un detector de imagenes.

## Casos de uso

- Inventario de piscinas a escala municipal: procesar ortofotos de un termino municipal teseladas a 20-25 cm/px para contar y geolocalizar piscinas, usando `imgsz` ajustado a la resolucion real de la imagen y un umbral de confianza moderado para reducir falsos positivos en tejados y superficies azules.
- Actualizacion de cartografia y catastros: detectar piscinas nuevas o reformadas comparando ortofotos de distintas fechas, apoyandose en el rendimiento del modelo en escenas urbanas densas (Cannes) y en zonas residenciales de baja densidad (Paises Bajos).
- Planificacion de recursos hidricos y consumo: estimar el numero y la superficie de piscinas por zona para estudios de demanda de agua, dado que el modelo localiza instancias individuales sobre teselas de alta resolucion.
- Analisis de mercado inmobiliario: enriquecer fichas de parcelas y viviendas con el atributo "tiene piscina" a partir de imagenes aereas, integrando el detector en un pipeline de extraccion por coordenadas.
- Monitorizacion de piscinas cubiertas: el modelo fue entrenado incluyendo la clase `covered-pool` de Paises Bajos, por lo que es adecuado para detectar piscinas con cubierta, un caso habitualmente problematico en climas frios.
- Control de calidad de datasets de teledeteccion: usar el modelo como pre-etiquetador para generar candidatos sobre nuevas regiones y revisarlos manualmente, acelerando la anotacion de nuevos conjuntos de piscinas.
- Procesamiento por lotes en infraestructura propia: al ser un YOLO11m en formato `.pt`, se puede desplegar con `ultralytics` en GPU de consumo para procesar grandes volumenes de teselas de forma economica.

## Benchmarks y rendimiento

El autor publica mAP50 en test para cuatro variantes de entrenamiento sobre tres conjuntos de test (Cannes, Paises Bajos `nl` y Paises Bajos con piscinas cubiertas `nl_cov`):

| Modelo | Cannes | nl | nl_cov |
|---|---|---|---|
| cannes640 | 0,972 | 0,804 | 0,786 |
| merged (este modelo) | 0,971 | 0,867 | 0,893 |
| nl | 0,908 | 0,897 | 0,864 |
| nl_cov | 0,909 | 0,856 | 0,905 |

El modelo fusionado es el mas equilibrado entre regiones: practicamente iguala al mejor modelo en Cannes (0,971 frente a 0,972) y supera claramente al modelo solo-Cannes en Paises Bajos (0,867 frente a 0,804 en `nl`; 0,893 frente a 0,786 en `nl_cov`). No se han publicado en la informacion disponible resultados de mAP50-95, precision, recall, latencia ni comparaciones con otros detectores aereos de piscinas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como YOLO11m en `.pt`, el peso de los parametros es moderado y cabe holgadamente en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no especificadas. Por la categoria del modelo (YOLO11m), es razonable esperar ejecucion en RTX 3060/4060/4090 y en A100/H100 para lotes grandes, aunque no hay datos confirmados en la model card.
- GPU de consumo: previsiblemente si, al tratarse de la variante media de YOLO11 y un repo de 0,1 GB; sin cifras oficiales de VRAM.
- Opciones de despliegue: `ultralytics` (API Python) con descarga via `huggingface_hub`; el autor solo documenta este camino. No se mencionan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp u Ollama (no aplicables a un detector de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pools-yolo11m-merged (este) | no disponible | imagen 640x640 (ajustable con `imgsz`) | mAP50 0,971 Cannes / 0,867 nl / 0,893 nl_cov | AGPL-3.0 | Hugging Face, `.pt` |
| cannes640 (variante del autor) | no disponible | imagen 640x640 | mAP50 0,972 Cannes / 0,804 nl / 0,786 nl_cov | AGPL-3.0 | referenciado en la model card |
| nl (variante del autor) | no disponible | imagen 640x640 | mAP50 0,908 Cannes / 0,897 nl / 0,864 nl_cov | AGPL-3.0 | referenciado en la model card |
| nl_cov (variante del autor) | no disponible | imagen 640x640 | mAP50 0,909 Cannes / 0,856 nl / 0,905 nl_cov | AGPL-3.0 | referenciado en la model card |

No se dispone de comparaciones con otros detectores de piscinas de terceros ni con otras variantes de YOLO11 (n, s, l, x) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con datos de solo dos regiones (Cannes y Paises Bajos); el rendimiento en otras latitudes, tipos de cubierta, colores de agua o densidades urbanas no esta validado.
- Clase unica `pool`: no distingue entre piscina descubierta y cubierta en la salida, aunque el entrenamiento incluyo `covered-pool`.
- El conjunto de Cannes incorpora pseudo-etiquetas para piscinas ausentes, lo que puede introducir ruido en las anotaciones y sesgar el modelo hacia los criterios del pseudo-etiquetado.
- Dependencia de la escala: el autor indica que para imagenes a 25 cm/px hay que usar `imgsz=832` para igualar la escala de entrenamiento (20 cm/px); usar otra resolucion sin ajustar `imgsz` degradara la deteccion.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que use el modelo en servicios de red; para uso comercial propietario es necesario evaluar el cumplimiento o contactar con Ultralytics para una licencia alternativa.
- Sin datos publicados de mAP50-95, precision, recall ni matrices de confusion, por lo que el riesgo de falsos positivos en superficies azules (tejados, lonas, depositos) no esta cuantificado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishfan14/pools-yolo11m-merged
- Dataset Cannes (Kaggle): https://www.kaggle.com/datasets/alexj21/swimming-pool-512x512
- Dataset Paises Bajos (Roboflow): https://universe.roboflow.com/poolfinder/pools-tutud
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics
