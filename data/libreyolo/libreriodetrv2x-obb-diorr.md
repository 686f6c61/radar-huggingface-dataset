# LibreYOLO/LibreRiODETRv2x-obb-diorr

## Resumen

LibreRiODETRv2x-obb-diorr es un detector de objetos orientados (oriented object detection, OBB) basado en la arquitectura RiO-DETRv2 en su variante X, convertido para su uso con la librería LibreYOLO. Lo desarrolla el proyecto LibreYOLO a partir de los pesos publicados por el autor original del modelo (RicePasteM) y esta entrenado sobre el conjunto de datos DIOR-R, compuesto por imagenes aereas y de satelite con 20 clases de objetos anotados con cajas delimitadoras rotadas. La entrada de inferencia esta fijada en 800 px.

La relevancia del modelo radica en su licencia: el codigo original de RiO-DETRv2 fue relicenciado posteriormente a AGPL-3.0, pero esta ficha se ampara en la concesion Apache-2.0 de la release inicial (commit `ab8b22d`), lo que permite su uso comercial sin las obligaciones del copyleft de AGPL. La conversion a LibreYOLO no altera los parametros aprendidos: los pesos se han remapeado y se ha eliminado el proyector de destilacion usado solo en entrenamiento, con una diferencia maxima absoluta de 0 respecto al modelo original.

Se trata de un modelo especializado en deteccion remota, no un modelo de lenguaje: no genera texto ni soporta tool calling. Su utilidad se limita a la localizacion y clasificacion de objetos en imagenes aereas con orientacion arbitraria, un escenario donde los detectores de cajas alineadas a los ejes pierden precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (transformer de deteccion tipo DETR, variante X, backbone HGNetv2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 800 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch, libreria libreyolo) |

## Arquitectura y entrenamiento

RiO-DETRv2 es un detector de objetos basado en transformer, sucesor de la familia DETR, que emplea un backbone convolucional HGNetv2 (en esta variante, la version X) para extraer caracteristicas y un decoder transformer para predecir conjuntos de objetos. La salida incluye cajas delimitadoras orientadas (rotadas), lo que permite ajustar la geometria de objetos con orientacion arbitraria, habitual en imagenes aereas.

El modelo esta entrenado sobre DIOR-R, un benchmark de deteccion remota con 20 clases y anotaciones de cajas orientadas. No se dispone en la informacion proporcionada del numero de tokens, composicion exacta del dataset ni detalles sobre el proceso de entrenamiento (funcion de perdida, uso de RLHF/DPO u otras tecnicas). La conversion a LibreYOLO consistio en remapear las claves del state-dict, eliminar el proyector de destilacion exclusivo de entrenamiento y anadir metadatos de LibreYOLO; los parametros aprendidos no se modificaron y las salidas crudas coinciden exactamente con el modelo original (max_abs_diff 0).

## Capacidades

- Deteccion de objetos orientados (OBB) en imagenes aereas y de satelite.
- Clasificacion en 20 clases del conjunto DIOR-R.
- Prediccion de cajas delimitadoras rotadas, adecuada para objetos con orientacion arbitraria.
- Inferencia sobre imagenes de 800 px de entrada.
- Integracion con la libreria LibreYOLO mediante una API de alto nivel.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Inventario de infraestructuras en imagenes de satelite: el modelo localiza y clasifica elementos como barcos, aviones o vehiculos con cajas orientadas, lo que mejora la precision en objetos alargados frente a detectores de cajas alineadas.
- Monitorizacion de puertos y aeropuertos: deteccion de embarcaciones y aeronaves en imagenes aereas para tareas de vigilancia o analisis de trafico.
- Analisis de cambios en imagenes multitemporales: al detectar objetos con orientacion precisa, facilita la comparacion entre capturas de distintas fechas.
- Planificacion urbanistica y catastro: identificacion de edificaciones, campos deportivos y otras estructuras en ortofotos.
- Agricultura de precision: localizacion de parcelas, invernaderos o infraestructuras agrarias en imagenes aereas.
- Investigacion en deteccion remota: como punto de partida o baseline para experimentos sobre DIOR-R, con la ventaja de una licencia Apache-2.0 que permite redistribucion y uso comercial.
- Procesamiento por lotes en pipelines de vision: integracion en flujos automatizados de analisis de imagenes aereas mediante la API de LibreYOLO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (0,3 GB) sugiere un modelo de peso moderado, pero no se confirma el numero de parametros ni el consumo real.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se dispone de datos de VRAM.
- Opciones de despliegue: libreria LibreYOLO (`pip install libreyolo`); no se documentan otros runtimes como vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2x-obb-diorr | RiO-DETRv2-X (HGNetv2) | Deteccion OBB en DIOR-R | Imagen 800 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2x-obb | RT-DETRv2-X | Deteccion OBB | no disponible | no disponible | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (original) | RiO-DETRv2 | Deteccion OBB | Imagen 800 px | Apache-2.0 (release inicial) / AGPL-3.0 (posterior) | Hugging Face (RicePasteM) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion de objetos orientados; no es un modelo de lenguaje ni admite tareas generativas.
- Entrenado unicamente sobre DIOR-R (20 clases); su rendimiento fuera de ese dominio o con otras clases no esta garantizado.
- Posibles sesgos derivados de la distribucion del dataset DIOR-R (sesgo geografico, de sensores y de condiciones de captura), no documentados en la informacion disponible.
- Riesgo de falsos positivos y negativos inherente a la deteccion de objetos; no se han publicado metricas de precision o recall.
- La licencia Apache-2.0 se ampara en la release inicial del codigo original; las versiones posteriores de RiO-DETRv2 estan bajo AGPL-3.0, lo que debe tenerse en cuenta al reutilizar codigo upstream.
- Los datos de entrenamiento DIOR-R tienen sus propias condiciones de uso, que deben respetarse independientemente de la licencia del modelo.
- No se dispone de informacion sobre cuantizacion, latencia o requisitos de hardware, lo que dificulta planificar su despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2x-obb-diorr
- Codigo original (RicePasteM/RiO-DETRv2): https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada (LibreYOLO/RiO-DETRv2): https://github.com/LibreYOLO/RiO-DETRv2
- Pesos originales (RicePasteM/RiO-DETRv2): https://huggingface.co/RicePasteM/RiO-DETRv2
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Modelo relacionado (LibreRTDETRv2x-obb): https://huggingface.co/LibreYOLO/LibreRTDETRv2x-obb
