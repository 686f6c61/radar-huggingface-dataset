# LibreYOLO/LibreRiODETRv2m-obb-diorr

## Resumen

LibreRiODETRv2m-obb-diorr es un detector de objetos orientados (oriented object detection, OBB) derivado de RiO-DETRv2-M, un modelo transformer de deteccion (DETR) desarrollado originalmente por el equipo de RicePasteM. Esta version concreta ha sido convertida y empaquetada por LibreYOLO para su uso con la libreria `libreyolo`, y esta entrenada sobre el dataset DIOR-R, un benchmark de imagenes aereas y satelitales con 20 clases y entradas de 800 px.

El modelo resuelve el problema de la deteccion de objetos con cajas delimitadoras rotadas, algo critico en imagenes de teledeteccion donde los objetos (barcos, aviones, vehiculos, puentes) aparecen en orientaciones arbitrarias y las cajas axis-aligned introducen mucho ruido. RiO-DETRv2 incorpora mejoras sobre la familia RT-DETR/RiO-DETR original, manteniendo el paradigma end-to-end sin NMS.

La relevancia de esta ficha radica en dos factores: por un lado, la conversion preserva exactamente los pesos aprendidos (max_abs_diff 0 respecto al modelo upstream) y se ampara en la licencia Apache-2.0 de la release inicial del codigo original; por otro, ofrece un formato listo para produccion (`libreyolo`) con una API de una sola linea, lo que reduce la friccion de adopcion frente al repositorio de investigacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DETR orientado (RiO-DETRv2-M, backbone HGNetv2-M) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 800 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch, empaquetado para `libreyolo`) |
| Dataset de entrenamiento | DIOR-R (20 clases) |
| Resolucion de entrada | 800 px |
| Tarea | Object detection con cajas orientadas (OBB) |
| Tamano del repo | 0.1 GB |

## Arquitectura y entrenamiento

RiO-DETRv2 es un detector de objetos end-to-end basado en la familia DETR, con un backbone convolucional HGNetv2 (variante M) y un decoder transformer que predice directamente conjuntos de cajas sin necesidad de supresion no maxima (NMS). La variante `-obb` anade la prediccion del angulo de rotacion de cada caja, lo que la hace adecuada para imagenes aereas donde la orientacion es informacion esencial. El modelo se entrena sobre DIOR-R, un dataset de imagenes satelitales y aereas con 20 clases de objetos (aviones, barcos, vehiculos, puentes, campos de futbol, etc.).

En cuanto al entrenamiento, la model card no detalla el numero de tokens, la composicion exacta del dataset ni si hubo fases de RLHF/DPO (algo poco habitual en deteccion). Lo que si se documenta con precision es el proceso de conversion: se ha realizado un remapeo de claves del state-dict, se ha eliminado el proyector de destilacion usado solo en entrenamiento y se han anadido metadatos de LibreYOLO. Los pesos aprendidos no se han modificado y las salidas crudas coinciden exactamente con el modelo upstream (max_abs_diff 0). La release original del codigo estaba bajo Apache-2.0; el proyecto upstream se relicencio posteriormente a AGPL-3.0 sin cambios de codigo, y este port se ampara en la concesion Apache-2.0 de la release inicial.

## Capacidades

- Deteccion de objetos con cajas delimitadoras orientadas (OBB) en imagenes aereas y satelitales.
- Clasificacion y localizacion de 20 clases del dataset DIOR-R.
- Prediccion end-to-end sin NMS, lo que simplifica el post-procesado.
- Inferencia sobre imagenes individuales mediante la API `LibreYOLO(...)` con opcion de guardar resultados (`save=True`).
- Integracion con la libreria `libreyolo` para pipelines de vision.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).

## Casos de uso

- Analisis de imagenes satelitales para inventario de infraestructuras: el modelo detecta barcos, aviones, puentes y vehiculos con cajas rotadas, lo que permite medir orientacion y dimensiones reales de los objetos en lugar de aproximarlas con cajas axis-aligned.
- Monitorizacion de puertos y trafico maritimo: al predecir el angulo de cada embarcacion, se puede estimar su rumbo y detectar patrones de atraque o movimiento anomalo en imagenes de satelite.
- Gestion de emergencias y desastres: identificacion rapida de vehiculos, edificios danados o infraestructura critica en imagenes aereas post-evento, aprovechando las 20 clases de DIOR-R.
- Agricultura de precision: deteccion de campos de futbol, instalaciones y elementos del terreno en ortoimagenes para planificacion territorial.
- Automatizacion de pipelines GIS: integracion del modelo en flujos que convierten detecciones OBB en geometrias vectoriales (poligonos rotados) para su carga en sistemas de informacion geografica.
- Prototipado rapido en investigacion: la API de una linea de `libreyolo` permite evaluar el modelo sobre nuevos datasets aereos sin tener que montar el repositorio de investigacion original.
- Pre-procesado para modelos de segmentacion o clasificacion de recortes: las detecciones OBB sirven como regiones de interes rotadas que alimentan etapas posteriores del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repo (0.1 GB) sugiere un modelo ligero que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del checkpoint es plausible, pero no se dispone de dato oficial.
- Opciones de despliegue: la documentada es `libreyolo` (instalacion via `pip install libreyolo`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLMs, no aplicables a este detector).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Dataset | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LibreRiODETRv2m-obb-diorr | OBB detection | DIOR-R (20 clases) | no disponible | 800 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2m-obb | OBB detection | DOTA | no disponible | no disponible | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (upstream) | OBB detection | DIOR-R | no disponible | 800 px | Apache-2.0 (release inicial) / AGPL-3.0 (actual) | Hugging Face (RicePasteM) |

La comparativa se limita a los modelos de la misma familia y del mismo autor de port, ya que la informacion disponible no incluye datos de rendimiento ni de otros detectores OBB de referencia (por ejemplo, variantes de YOLO-OBB u Oriented R-CNN). No se dispone de cifras de mAP para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en imagenes aereas y satelitales; su rendimiento en imagenes naturales o de otro dominio no esta documentado y probablemente sea deficiente.
- Las 20 clases estan fijadas por DIOR-R; no detecta categorias fuera de ese conjunto.
- No se han publicado metricas de precision (mAP) ni de robustez en la informacion disponible, por lo que no se puede garantizar un umbral de calidad en produccion.
- Riesgo de alucinacion en el sentido de falsos positivos en escenas con objetos similares a las clases entrenadas; conviene validar con un conjunto propio antes de desplegar.
- La licencia Apache-2.0 se aplica al codigo y pesos de la release inicial; el proyecto upstream paso a AGPL-3.0 posteriormente. Cualquier uso que dependa de codigo upstream posterior a la relicencia queda sujeto a AGPL-3.0.
- Los datos de entrenamiento DIOR-R tienen sus propios terminos de uso, que no se detallan en la model card.
- El modelo se distribuye como `.pt` para `libreyolo`; no se ofrecen variantes GGUF, ONNX ni TensorRT en la informacion disponible.
- No dispone de soporte de tool calling, agentes ni razonamiento multi-paso; es estrictamente un detector de vision.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2m-obb-diorr
- Codigo upstream (release Apache-2.0): https://github.com/RicePasteM/RiO-DETRv2 (commit `ab8b22df5d800a927774c8c67e77fd29c0fe6967`)
- Copia preservada del codigo Apache-2.0: https://github.com/LibreYOLO/RiO-DETRv2 (tag `apache-2.0-ab8b22d`)
- Pesos upstream: https://huggingface.co/RicePasteM/RiO-DETRv2 (revision `5f578f57929aded1962ebf8c5584a4771461124f`)
- Repositorio de la libreria LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Modelo hermano (DOTA): https://huggingface.co/LibreYOLO/LibreRTDETRv2m-obb
