# pauenric/POLLINATOR_Serra_Marin_et_al_2025

## Resumen

POLLINATOR (Serra-Marin et al., 2025) es un detector de objetos de una sola clase especializado en localizar insectos que visitan flores en imagenes de campo y fotogramas de video. No es un modelo de lenguaje: se trata de un reentrenamiento de los pesos preentrenados de YOLOv5m, con multiplicadores de profundidad y anchura 0,67/0,75 y una unica clase de salida, `pollinator`. Lo desarrolla el grupo de investigacion vinculado al IMEDEA (UIB-CSIC), con Arancha Lana como responsable del codigo publicado y Pau Enric Serra-Marin como primer autor del articulo asociado en *Methods in Ecology and Evolution*.

El problema que resuelve es el cuello de botella del muestreo manual en ecologia de la polinizacion: revisar miles de imagenes o horas de video para contabilizar visitantes florales es costoso y poco escalable. El modelo actua como prefiltro automatico que devuelve cajas delimitadoras con puntuacion de confianza sobre fondos heterogeneos (flores, hojas, vegetacion), dejando la identificacion de especie y la confirmacion del contacto floral a revision humana.

Es relevante ahora porque forma parte de un flujo de trabajo completo y reproducible (repositorio de codigo, configuracion de dataset, script de procesado de video y articulo con evaluacion comparativa frente a monitorizacion manual). El checkpoint distribuido se corresponde con un detector pequeno (fichero de 42.336.660 bytes) que puede ejecutarse en hardware modesto, aunque su correspondencia exacta con las cifras publicadas en el articulo no esta verificada por los autores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5m (Ultralytics), detector de una etapa basado en CNN; multiplicadores de profundidad/anchura 0,67/0,75; commit de referencia `17c500461d7b14a24133d91bc6437af62914074c` |
| Parametros totales | No declarado por los autores; estimacion de ~21,2 millones a partir del tamano del fichero (42.336.660 bytes, compatible con pesos en fp16 y sin estado del optimizador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; modelo de vision con resolucion de entrada documentada de 1024 × 1024 px |
| Tipos de cuantizacion | No disponible; se distribuye un unico checkpoint en formato PyTorch sin variantes cuantizadas publicadas |
| Idiomas soportados | No aplica; no procesa texto (modelo de vision por computador) |
| Licencia | El archivo de software en Zenodo declara CC-BY-4.0 (credito a Arancha Lana) y la configuracion del dataset declara CC BY 4.0; la licencia del fichero `best.pt` alojado aparte no se declara explicitamente y su uso comercial figura como desconocido |
| Formato de pesos | Checkpoint PyTorch `.pt` de Ultralytics YOLOv5; 42.336.660 bytes; SHA-256 `9b62c544b5dc31122d93db8ea9363aa4012a1b7636e57de740fa6ae6a2cc600e` |

## Arquitectura y entrenamiento

El modelo parte de los pesos preentrenados `yolov5m.pt` y se ajusta fino sobre un dataset de una unica clase, `pollinator`. La configuracion de entrenamiento registrada en el checkpoint indica `imgsz = 1024`, `epochs = 150` y optimizador SGD. Conviene subrayar que esas son las opciones configuradas, no la prueba de que las 150 epocas se completaran: la epoca guardada es `-1` y no hay estado del optimizador ni `best_fitness` almacenados (`None`), lo que sugiere que el objeto guardado no es un checkpoint completo de entrenamiento. El checkpoint tambien conserva la ruta del dataset (`./NEW_DATA_TOT/data.yaml`), el directorio de ejecucion (`runs/train/exp4`) y la marca temporal `2025-06-19T22:26:14.768546` sin zona horaria.

La exportacion MERGED-ALL v4 documentada en el repositorio del autor describe 16.389 imagenes con correccion de orientacion, redimensionado con estiramiento a 1024 × 1024 px y aumento de datos mediante volteos y rotaciones. No obstante, el propio autor advierte que esa correspondencia entre la exportacion del repositorio y el checkpoint descargado no esta verificada, y que el checkpoint no incorpora la lista de imagenes ni la pertenencia a los conjuntos de entrenamiento, validacion o prueba.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion ni tecnicas de RLHF/DPO), algo esperable en un detector convolucional de una etapa. La inferencia es una pasada unica hacia delante que devuelve cajas, confianzas y la etiqueta de clase.

## Capacidades

- Deteccion de insectos visitantes florales en imagenes RGB, con salida de cajas delimitadoras y puntuaciones de confianza para la clase unica `pollinator`.
- Localizacion sobre fondos heterogeneos: el modelo esta entrenado especificamente para escenas con flores y vegetacion, no para fondos limpios o controlados.
- Procesamiento de fotogramas de video: el script proporcionado convierte fotogramas de OpenCV a RGB y guarda los fotogramas en carpetas `with_object` y `without_object`.
- Generacion de conjuntos preclasificados para revision humana, lo que reduce el volumen de imagenes a inspeccionar manualmente.
- No realiza identificacion de especie ni confirmacion de contacto floral; esas tareas quedan explicitamente fuera del alcance del modelo.
- No dispone de tool calling, funcion calling, modo de razonamiento, capacidades de agente, procesamiento de lenguaje, audio ni vision mas alla de la deteccion de objetos.
- No se documentan capacidades multilingues (no aplica).

## Casos de uso

- Monitorizacion automatizada de polinizadores en campo: colocando camaras o trampas fotograficas en parcelas, el modelo examina cada captura y registra cajas sobre los insectos detectados, lo que permite estimar tasas de visita sin revisar manualmente todo el material.
- Triaje de grabaciones de video largas: aplicando el script proporcionado, cada fotograma se clasifica y se archiva en `with_object` o `without_object`, de modo que el equipo de investigacion solo revisa la fraccion de fotogramas con detecciones.
- Prefiltrado para revision taxonomica: el detector reduce el universo de imagenes a aquellas con candidatos claros, y un especialista confirma despues la especie y el contacto con la flor. El modelo nunca sustituye a esa validacion.
- Estudios comparativos de comunidades planta-polinizador: al generar conteos homogeneos sobre el mismo protocolo de captura, permite contrastar comunidades o periodos con criterios consistentes, como en el diseno ACS del articulo.
- Analisis retrospectivo de archivos fotograficos existentes: proyectos con anos de imagenes almacenadas pueden reprocesarlas de forma masiva para extraer conteos de visitantes florales que antes no se habian cuantificado.
- Despliegue en equipos de campo de bajos recursos: un checkpoint de 42 MB es compatible con mini-PC, portatiles con GPU de gama media o estaciones de adquisicion embarcadas, lo que facilita el procesado en el borde sin enviar todo el material a un servidor.
- Integracion en flujos de anotacion y curacion de datasets: las detecciones pueden emplearse como preanotaciones para acelerar el etiquetado de nuevos conjuntos con herramientas tipo Roboflow, reduciendo el esfuerzo manual de dibujado de cajas.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los del articulo asociado (Tabla 2), que corresponden a promedios de validacion cruzada de cinco pliegues sobre experimentos con datos combinados. El autor advierte que ni el repositorio ni el checkpoint inspeccionado permiten establecer a que fila o pliegue corresponde `best.pt`, por lo que son resultados del estudio y no puntuaciones verificadas del checkpoint concreto.

| Conjunto de evaluacion | Imagenes train/val/test declaradas | Precision | Recall | mAP@0.5 | F1 |
|---|---|---|---|---|---|
| Datos ACS fusionados | 10.192 / 3.542 / 3.550 | 0,95 | 0,95 | 0,97 | 0,95 |
| Datos ACS + datos externos | 12.682 / 4.373 / 4.380 | 0,93 | 0,93 | 0,95 | 0,93 |

No se ejecuto ninguna inferencia ni benchmark adicional durante la inspeccion del checkpoint, y no hay datos publicados de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por los autores. A partir del tamano del checkpoint (42,3 MB, compatible con pesos en fp16) y de una resolucion de entrada de 1024 × 1024, se puede esperar un consumo bajo, del orden de pocos gigabytes con lote 1; se trata de una estimacion, no de una cifra medida.
- GPU recomendadas: no disponibles. Por tamano y tipo de modelo, resulta apto para GPUs de consumo y profesionales habituales (RTX 3060/4070/4090, T4, L4, A100, H100), sin que exista una recomendacion oficial.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del modelo; no confirmado mediante pruebas en la informacion disponible.
- Opciones de despliegue: el ecosistema Ultralytics YOLOv5 admite inferencia con PyTorch, exportacion a ONNX, TensorRT, OpenVINO y CoreML, ademas de formatos ligeros tipo TFLite. No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Nota operativa: el script de video suministrado llama a `model(img_rgb)` sin fijar explicitamente el tamano de inferencia, por lo que el tamano de 1024 × 1024 usado en entrenamiento no queda garantizado por ese script.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos frente a otros detectores, y no se dispone de metricas de alternativas sobre este mismo dataset y protocolo.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POLLINATOR (este modelo) | ~21,2 M (estimado) | 1024 × 1024 px documentado | P 0,95 / R 0,95 / mAP@0.5 0,97 (datos ACS fusionados, segun articulo) | CC-BY-4.0 para el software; licencia de `best.pt` desconocida | Pesos en Google Drive enlazados desde el repositorio; repo de HuggingFace sin ficheros |
| YOLOv5m preentrenado en COCO | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Otros detectores genericos de la familia YOLO (YOLOv8, YOLO11) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La diferencia cualitativa relevante es la especializacion: POLLINATOR se ajusta a una unica clase sobre imagenes de campo con vegetacion, mientras que los detectores genericos estan entrenados sobre categorias de COCO y no incluyen la clase `pollinator`. Cualquier comparacion cuantitativa requeriria reevaluar esas alternativas sobre el mismo conjunto de prueba, dato que no se ha publicado en la informacion disponible.

## Limitaciones y advertencias

- Los insectos pequenos, las hojas confundidas con insectos y los fondos vegetales no vistos durante el entrenamiento provocan errores de deteccion.
- El modelo no identifica especies ni confirma el contacto con la flor; una deteccion por si sola no establece una interaccion de polinizacion y requiere revision humana.
- Riesgo de alucinacion en sentido amplio: cualquier detector puede producir falsos positivos con confianza alta, y en este dominio la confusion con hojas es un modo de fallo documentado explicitamente.
- Trazabilidad incompleta del checkpoint: la epoca guardada es `-1`, no hay `best_fitness` ni estado del optimizador, y no se puede determinar a que fila de la tabla de resultados ni a que pliegue corresponde `best.pt`.
- El checkpoint no incorpora la lista de imagenes ni la pertenencia a los splits del dataset, por lo que no es posible reproducir exactamente la particion de evaluacion a partir del fichero descargado.
- La correspondencia entre la exportacion MERGED-ALL v4 documentada (16.389 imagenes) y el checkpoint descargado esta sin verificar segun el propio autor.
- Licencia ambigua para uso comercial: el software en Zenodo se declara CC-BY-4.0 y la configuracion del dataset tambien declara CC BY 4.0, pero la licencia del fichero `best.pt` alojado de forma separada no se declara y su estatus comercial es desconocido. Antes de un uso en produccion con fines comerciales debe aclararse este punto con los autores.
- El repositorio de HuggingFace figura con 0 descargas, 0 likes, 0,0 GB de tamano y sin ficheros de pesos; los pesos se obtienen desde una carpeta de Google Drive cuyo contenido no esta fijado a un commit, por lo que se recomienda verificar el SHA-256 indicado antes de usarlos.
- El script de video no fija el tamano de inferencia, lo que puede degradar los resultados si el fotograma no se redimensiona a 1024 × 1024 antes de la llamada al modelo.
- El aviso de cambio climatico y de conservacion de comunidades de polinizadores es el contexto cientifico del trabajo, no una garantia de generalizacion a otros ecosistemas, camaras, iluminaciones o resoluciones distintas de las del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pauenric/POLLINATOR_Serra_Marin_et_al_2025
- Repositorio de codigo (GitHub, aranchalana/POLLINATOR): https://github.com/aranchalana/POLLINATOR/tree/ecbafff8fd03efaa299f8d07eb121b9ccd05c6dd
- Configuracion del dataset (`data.yaml`, una clase `pollinator`): https://github.com/aranchalana/POLLINATOR/blob/ecbafff8fd03efaa299f8d07eb121b9ccd05c6dd/POLLINATOR-MERGE-ALL/data.yaml
- Exportacion MERGED-ALL v4 (16.389 imagenes, Roboflow): https://github.com/aranchalana/POLLINATOR/blob/ecbafff8fd03efaa299f8d07eb121b9ccd05c6dd/POLLINATOR-MERGE-ALL/README.roboflow.txt
- Script de deteccion sobre video: https://github.com/aranchalana/POLLINATOR/blob/ecbafff8fd03efaa299f8d07eb121b9ccd05c6dd/YOLOv5_POLLINATOR_detect_and_save_with_and_without_object.py
- Puntero a los pesos (`read.txt`): https://github.com/aranchalana/POLLINATOR/blob/ecbafff8fd03efaa299f8d07eb121b9ccd05c6dd/runs/train/merged_ALL/weights/read.txt
- Articulo (DOI): https://doi.org/10.1111/2041-210X.70165
- Articulo en el editor (Wiley, BES Journals): https://besjournals.onlinelibrary.wiley.com/doi/10.1111/2041-210X.70165
- Archivo de software en Zenodo (v1.0): https://zenodo.org/records/17130918 — https://doi.org/10.5281/zenodo.17130918
- Perfil de Semantic Scholar del primer autor: https://www.semanticscholar.org/author/Pau-Enric-Serra-Marin/2389891616
- Perfil de ResearchGate del primer autor: https://www.researchgate.net/profile/Pau-Enric-Serra-Marin
- Registro ORCID del primer autor: https://orcid.org/0000-0001-6674-3710
