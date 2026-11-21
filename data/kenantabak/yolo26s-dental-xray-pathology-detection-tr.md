# kenantabak/yolo26s-dental-xray-pathology-detection-tr

## Resumen

`yolo26s-dental-xray-pathology-detection-tr` es un modelo de deteccion de objetos basado en la arquitectura YOLO26S de Ultralytics, entrenado especificamente para identificar patologias y tratamientos dentales en radiografias panoramicas y periapicales. Lo desarrolla Kenan Tabak en el marco de la plataforma turca EVREN (SSYZ), y detecta cuatro clases: caries (Cavity), empastes (Fillings), dientes impactados (Impacted Tooth) e implantes dentales (Implant).

El modelo resuelve un problema concreto de triaje radiografico: automatizar la localizacion de hallazgos odontologicos sobre imagenes en escala de grises, donde las tecnicas de aumento de datos habituales en vision por computador (variacion de tono y saturacion) no aportan informacion y pueden degradar la senal diagnostica. El autor ajusta explicitamente los hiperparametros de aumento para preservar el contraste radiografico y la anatomia mandibular.

Se trata de un modelo pequeno (pesos de 19,4 MB), entrenado sobre un conjunto de 1269 imagenes y 9280 anotaciones, con 60 epocas y un coste declarado de 0,095 horas-GPU. Alcanza un mAP@50 del 79,80 % y un mAP@50-95 del 51,15 % en validacion, con un rendimiento muy desigual entre clases: los implantes superan el 95 % de AP@50 mientras las caries se quedan en el 46,65 %. Es relevante como ejemplo de adaptacion de detectores YOLO de ultima generacion a dominios medicos con recursos limitados y como punto de partida para pipelines de pre-diagnostico odontologico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26S (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo Ultralytics `.pt`) |
| Idiomas soportados | tr, en (etiquetas de la model card; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (el framework Ultralytics subyacente es AGPL-3.0) |
| Formato de pesos | `.pt` (checkpoint Ultralytics/PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26S, un detector de objetos de una sola etapa de la familia Ultralytics, con entrada de imagen fija de 640x640 pixeles. La variante "s" (small) corresponde a un compromiso entre latencia y precision orientado a despliegue en hardware moderado; los pesos ocupan 19,4 MB. No se detallan en la informacion disponible el numero de parametros, la composicion exacta de la cabeza de deteccion ni las innovaciones internas de YOLO26 respecto a generaciones anteriores.

El entrenamiento se realizo durante 60 epocas (mejor epoca en la 44) con batch de 32, paciencia de 18, programacion coseno del learning rate y un coste declarado de 0,95 CR (0,095 horas-GPU). El conjunto de datos, "Dis Rontgeni Anomali ve Tedavi Tespiti (4 Sinif)" v1.0, contiene 1269 imagenes y 9280 anotaciones repartidas en cuatro clases. El ajuste de aumento de datos es el elemento tecnico mas destacable: `hsv_h=0.0` y `hsv_s=0.0` porque las radiografias no tienen informacion de color; `flipud=0.0` para no alterar la anatomia mandibular; `fliplr=0.5` para aprovechar la simetria izquierda-derecha; `erasing=0.0` para no eliminar focos pequenos de caries; `mosaic=0.65` con `close_mosaic=12`, `degrees=5.0`, `scale=0.35` y `hsv_v=0.25`. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de destilacion.

## Capacidades

- Deteccion de objetos en radiografias dentales (panoramicas y periapicales) con cuatro clases: `Cavity`, `Fillings`, `Impacted Tooth` e `Implant`.
- Salida de cajas delimitadoras con puntuacion de confianza por clase, apta para umbrales configurables (`conf`, `iou`).
- Procesamiento de imagenes en escala de grises sin alteracion del contraste radiografico.
- Inferencia a resolucion fija de 640x640, compatible con el pipeline estandar de Ultralytics (`model.predict`).
- Soporte de inferencia por lotes y exportacion a otros formatos a traves del ecosistema Ultralytics (no verificado en la informacion disponible para este checkpoint).
- Capacidades multilingues: no aplica; las etiquetas de idioma (tr, en) se refieren a la documentacion, no a procesamiento de lenguaje.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision generativa, audio ni modo "thinking": es un detector puro, no un modelo de lenguaje.

## Casos de uso

- Triaje automatizado en clinicas dentales: el modelo puede pre-marcar implantes y empastes en radiografias panoramicas con alta fiabilidad (AP@50 del 95,52 % y 90,41 % respectivamente) para que el odontologo revise solo las regiones candidatas, reduciendo el tiempo de lectura inicial.
- Segunda lectura en diagnosticos de caries: aunque la clase `Cavity` rinde peor (AP@50 del 46,65 %), el modelo sirve como recordatorio de posibles lesiones que el profesional podria pasar por alto, siempre con validacion humana obligatoria.
- Documentacion y codificacion clinica: extraer automaticamente la presencia y localizacion de implantes y empastes para poblar historiales electronicos o informes estructurados a partir de la radiografia.
- Investigacion epidemiologica: procesar lotes de radiografias retrospectivas para cuantificar prevalencia de implantes, empastes y dientes impactados en una poblacion, usando inferencia por lotes sobre GPU.
- Control de calidad en laboratorios radiologicos: verificar que las imagenes capturadas contienen las estructuras esperadas y detectar artefactos o ausencias antes de enviarlas al especialista.
- Pre-entrenamiento y transferencia: servir como punto de partida (fine-tuning) para otras tareas odontologicas o para ampliar el numero de clases, dado su tamano reducido (19,4 MB) y su licencia permisiva CC BY 4.0.
- Prototipado en dispositivos de borde: por su tamano y arquitectura "small", puede desplegarse en estaciones de trabajo con GPU de gama media o incluso CPU para inferencia puntual, integrándose en el software de captura del gabinete.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validacion del dataset "Dis Rontgeni Anomali ve Tedavi Tespiti (4 Sinif)" (metricas no verificadas de forma independiente):

| Metrica | Valor |
|---|---:|
| mAP@50 | 79,80 % |
| mAP@50-95 | 51,15 % |
| Precision | 70,40 % |
| Recall | 80,74 % |
| F1 | 73,02 % |
| Mejor epoca / total | 44 / 60 |

Rendimiento por clase:

| Clase | AP@50 | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| `Implant` | 95,52 % | 92,64 % | 93,71 % | 93,17 % |
| `Fillings` | 90,41 % | 91,64 % | 77,19 % | 83,80 % |
| `Impacted Tooth` | 78,28 % | 79,30 % | 57,89 % | 66,93 % |
| `Cavity` | 46,65 % | 45,55 % | 51,16 % | 48,19 % |

No se han publicado en la informacion disponible resultados comparativos con otros detectores sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del checkpoint (19,4 MB) y la arquitectura "small" a 640x640, la huella de memoria es reducida y cabe con holgura en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia; para entrenamiento, el coste declarado (0,095 horas-GPU) sugiere que una GPU de gama media o incluso una GPU en la nube de una sola unidad basta.
- Cabe en GPU de consumo: si, previsiblemente en modelos tipo RTX 3060, RTX 4060, RTX 4090 y equivalentes; no confirmado con mediciones publicadas.
- Opciones de despliegue: Ultralytics (Python, `model.predict`), exportacion a ONNX, TensorRT, OpenVINO u otros formatos compatibles con Ultralytics (no verificado para este checkpoint). Tambien es posible servir mediante FastAPI o similar envolviendo el pipeline de Ultralytics.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre el mismo conjunto de datos ni de comparativas publicadas por el autor. Como referencia cualitativa de la categoria:

| Modelo | Tipo | Clases | Contexto de aplicacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26s-dental-xray-pathology-detection-tr` | Detector YOLO26S | 4 (caries, empastes, impactados, implantes) | Radiografia dental | CC BY 4.0 (framework AGPL-3.0) | Hugging Face |
| YOLO11 (variantes oficiales Ultralytics) | Detector generico | 80 (COCO) | Vision general | AGPL-3.0 | Ultralytics |
| Otros detectores medicos YOLO en Hugging Face | Variable | Variable | Variable | Variable | Hugging Face |

No disponible: comparacion cuantitativa con alternativas especificas de deteccion odontologica.

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: la deteccion de caries (AP@50 del 46,65 %) es claramente insuficiente para uso diagnostico autonomo; el modelo no debe emplearse como unico criterio clinico.
- Conjunto de datos pequeno (1269 imagenes): riesgo elevado de sobreajuste y de baja generalizacion a otras poblaciones, equipos radiologicos o protocolos de captura.
- Metricas no verificadas de forma independiente (`verified: false` en el model-index); los valores proceden del propio autor.
- Riesgo de falsos negativos y falsos positivos en estructuras pequenas o de bajo contraste, especialmente en caries incipientes.
- Sesgos potenciales derivados de la procedencia de los datos (probablemente turca) y de la distribucion de edades, sexos y tratamientos previos de la muestra.
- El modelo no proporciona explicaciones ni intervalos de confianza calibrados mas alla de la puntuacion de deteccion; no es un sistema de diagnostico asistido certificado.
- Licencia CC BY 4.0 para los pesos, pero el framework Ultralytics subyacente esta bajo AGPL-3.0, lo que puede condicionar el uso comercial del codigo de inferencia y de los derivados; conviene revisar la compatibilidad antes de un despliegue en produccion.
- No apto para procesar texto, audio ni tareas multimodales; su uso esta limitado a deteccion de objetos en imagenes.
- Fecha de creacion en la model card (2026) posterior a la de esta ficha; verificar la vigencia de los enlaces y del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-dental-xray-pathology-detection-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/dis-rontgeni-curuk-dolgu-gomulu-dis-ve-implant-tespiti
- Dataset de entrenamiento (EVREN): https://evren.ssyz.org.tr/datasets/u19979974710e/dis-rontgeni-anomali-ve-tedavi-tespiti-4-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catalogo de datasets turcos de vision por computador: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics (YOLO): https://github.com/ultralytics/ultralytics
