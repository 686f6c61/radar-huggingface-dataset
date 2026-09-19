# einarolafsson/toxoplasma-plaque-well-detector-yolo26

## Resumen

El modelo `einarolafsson/toxoplasma-plaque-well-detector-yolo26` es un detector de objetos de una sola clase cuyo unico objetivo es localizar los pocillos (wells) en imagenes de placas de ensayo de placas (plaque assay) de *Toxoplasma gondii*, tanto fotografias de laboratorio como figuras extraidas de la literatura cientifica. Lo desarrolla el autor Einar Olafsson y forma parte del ecosistema de la herramienta spaCR, cuyo repositorio, paquete PyPI y receta de conda-forge se enlazan en la propia model card. Se trata de la version v4, que reentrena la v3 sobre YOLO26n con 939 figuras nuevas revisadas de PMC (cajas aceptadas y negativos confirmados).

Tecnicamente no es un modelo de lenguaje: es un detector convolucional de una etapa de la familia YOLO26, en su variante nano, entrenado con Ultralytics 8.4.155 sobre PyTorch 2.10.0+cu128. Su funcion dentro del pipeline es previa al analisis: delimitar la region de cada pocillo para que los pasos posteriores del flujo de spaCR puedan medir y contar placas de lisis dentro de ella. La relevancia de la v4 radica en la mejora medida sobre el conjunto de test respecto a la v3 (YOLO11n), especialmente en la reduccion de cajas falsas en imagenes sin ningun pocillo.

El conjunto de datos es pequeno y muy especifico de dominio: 1070 imagenes de entrenamiento con 2455 cajas, 254 de validacion con 673 cajas y 129 de test con 297 cajas, con una proporcion elevada de imagenes etiquetadas como "sin pocillo" (580 de 1070 en entrenamiento). El modelo se publica bajo licencia CC BY 4.0 y sus pesos estan en formato PyTorch `.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de una etapa, familia YOLO26, variante nano), entrenado con Ultralytics 8.4.155 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch sin cuantizar; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`): `weights/best.pt`, `weights/last.pt` |
| Tarea | `object-detection` (una clase: pocillo / well) |
| Framework de entrenamiento | Ultralytics 8.4.155 sobre torch 2.10.0+cu128 |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 Ti |
| Fecha de publicacion (metadatos) | 2026-09-19 |
| Tamano del repositorio (metadatos) | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es YOLO26n dentro del marco de Ultralytics 8.4.155: un detector denso de una etapa que predice cajas delimitadoras y una unica clase ("well") directamente sobre la imagen, sin etapa de propuesta de regiones. No se documentan en la informacion proporcionada detalles sobre el backbone, la cabeza de deteccion ni ninguna innovacion interna especifica de la familia YOLO26 (por ejemplo, mecanismos de asignacion de etiquetas o de decodificacion), por lo que no se pueden detallar aqui.

El entrenamiento parte de la version v3 (que a su vez usaba YOLO11n) y anade 939 figuras de PMC revisadas manualmente, con cajas aceptadas y negativos confirmados. El reparto de datos es 1070 imagenes / 2455 cajas de entrenamiento, 254 / 673 de validacion y 129 / 297 de test; 580 imagenes de entrenamiento, 123 de validacion y 84 de test no contienen ningun pocillo y se usan como negativos. El split se hace por articulo de PMC en proporcion 70/15/15 y las figuras procedentes de articulos ya presentes en v3 heredan el conjunto asignado a ese articulo, de modo que ningun paper aparece en dos conjuntos a la vez (asignacion por imagen en `training/split.csv`). El mejor mAP50-95 de validacion se alcanza en la epoca 28. No se menciona en la informacion disponible el uso de tecnicas de refuerzo, destilacion ni aumento de datos mas alla del pipeline estandar de Ultralytics.

## Capacidades

- Deteccion de pocillos en imagenes de placas de plaque assay, devolviendo cajas delimitadoras en coordenadas de imagen (`boxes.xyxy`) con un umbral de confianza configurable.
- Funcionamiento sobre dos dominios de imagen distintos: fotografias de placas de laboratorio y figuras extraidas de articulos cientificos de PMC.
- Discriminacion de imagenes sin pocillo: el modelo se entreno explicitamente con negativos confirmados (580 imagenes sin pocillo en entrenamiento) y reduce las cajas falsas en ese tipo de imagen de 152 a 49 en el conjunto de test.
- Integracion como paso de localizacion dentro del pipeline spaCR.
- Salida compatible con el ecosistema Ultralytics: prediccion por lotes, exportacion a otros formatos y acceso a las cajas, confianzas y coordenadas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente, capacidades multilingues ni modos de pensamiento. Es exclusivamente un detector de una clase.

## Casos de uso

- Contaje automatizado de placas de lisis en ensayos de Toxoplasma: el detector localiza primero cada pocillo de la placa y delimita la region de interes; sobre ese recorte, el resto del pipeline puede segmentar y contar las placas, evitando que el contaje se contamine con el borde de la placa o con el fondo.
- Integracion en el flujo de spaCR: spaCR consume las cajas devueltas por el modelo para alinear y normalizar las imagenes antes de las etapas de analisis; usar el detector especifico del dominio evita depender de un modelo generico sin clase de pocillo.
- Extraccion de datos de figuras publicadas: al funcionar sobre figuras de PMC, permite reconstruir que paneles de un articulo corresponden a pocillos y reanalizar cuantificaciones publicadas, util para meta-analisis y revisiones sistematicas.
- Filtrado de figuras no validas en grandes recopilaciones: en un corpus de figuras descargadas masivamente, el modelo descarta las imagenes sin pocillo (una parte importante del dataset de entrenamiento) antes de pasarlas a procesos costosos de analisis o de anotacion.
- Preanotacion asistida para curacion de datasets: las cajas predichas se pueden cargar en una herramienta de anotacion y revisar manualmente, reduciendo el tiempo de etiquetado de nuevas figuras respecto a la anotacion desde cero.
- Cribado de ensayos de neutralizacion o de antivirales a escala de placa: en laboratorios que procesan muchas imagenes de placa, el detector actua como primer paso de un pipeline de analisis por lotes, identificando la geometria de los pocillos de cada placa de forma consistente entre operadores y sesiones.
- Automatizacion de microscopia o imageadores de placas: en un flujo robotizado, las coordenadas de los pocillos permiten recortar y archivar cada pocillo de forma individual, asociando la imagen a su posicion en la placa.
- Control de calidad de adquisicion: comparar el numero y la posicion de pocillos detectados frente al formato esperado de la placa (por ejemplo, 6, 12, 24 o 96 pocillos) permite marcar automaticamente imagenes mal encuadradas o con iluminacion deficiente.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion sobre el conjunto de test (129 imagenes, 297 cajas, 84 imagenes sin pocillo), que segun el autor nunca se uso para entrenamiento ni para seleccion de modelo. La comparacion es contra la version anterior v3 (YOLO11n), ya que los pesos estandar de YOLO no incluyen una clase de pocillo de placa.

| Modelo | mAP50 | mAP50-95 | Precision | Recall | Cajas falsas en imagenes sin pocillo |
|---|---|---|---|---|---|
| v3 (YOLO11n) | 0.8838 | 0.763 | 0.8613 | 0.9085 | 152 |
| v4 (YOLO26n) | 0.9457 | 0.8341 | 0.8912 | 0.944 | 49 |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo de deteccion de objetos. El autor indica que el mejor mAP50-95 de validacion se obtuvo en la epoca 28; los datos por epoca estan en `training/results.csv` y las metricas por imagen en `qc/*_test_perimage.csv`.

## Requisitos de hardware

- VRAM para inferencia: no se publica una cifra concreta. Por la escala nano del modelo (la variante mas pequena de la familia YOLO26), la inferencia en precision completa o FP16 deberia caber holgadamente en cualquier GPU de consumo actual, y es razonable esperar que quepa incluso en GPUs con 4 GB o menos; no obstante, se trata de una estimacion por escala, no de un dato medido publicado.
- GPU empleada en el entrenamiento: NVIDIA GeForce RTX 3090 Ti (segun la seccion Environment de la model card). No se documenta el tiempo de entrenamiento ni el numero de GPUs.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente para inferencia; el entrenamiento o el reentrenamiento con este volumen de datos es viable en una GPU de consumo de gama alta como la RTX 3090 Ti utilizada por el autor.
- Cabe en GPU de consumo: si, por el tamano nano del modelo; el dato exacto de VRAM no esta disponible.
- Opciones de despliegue: la via documentada es la API de Python de Ultralytics (`YOLO(...).predict(...)`), descargando los pesos con `huggingface_hub`. Al ser un modelo Ultralytics, es exportable a otros formatos de inferencia (ONNX, TensorRT, OpenVINO, TFLite, CoreML) mediante `model.export()`, aunque la model card no incluye ejemplos de exportacion ni artefactos ya exportados. Los runners de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no son aplicables a este modelo. El uso previsto es dentro del pipeline de spaCR.
- Latencia y throughput: no disponible. No se publican medidas de latencia por imagen, FPS ni throughput de inferencia.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con la version anterior del propio modelo, ya que no se citan otros detectores de pocillos de plaque assay publicados.

| Modelo | Arquitectura | mAP50 (test) | mAP50-95 (test) | Cajas falsas en imagenes sin pocillo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| toxoplasma-plaque-well-detector v4 | YOLO26n | 0.9457 | 0.8341 | 49 | CC BY 4.0 | Pesos `.pt` en HuggingFace |
| toxoplasma-plaque-well-detector v3 | YOLO11n | 0.8838 | 0.763 | 152 | no disponible en la informacion proporcionada | Referenciada en la model card, sin enlace directo |
| YOLO preentrenado generico (por ejemplo, pesos COCO de Ultralytics) | YOLO (varias escalas) | no aplica | no aplica | no aplica | depende del modelo | Ampliamente disponible |

El autor senala explicitamente que los pesos estandar de YOLO no incluyen una clase de pocillo de placa, por lo que no constituyen una linea base valida para esta tarea. No se conocen, a partir de la informacion proporcionada, otros modelos comparables de deteccion de pocillos en ensayos de placa de *Toxoplasma*.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo detecta la clase "well" en imagenes de placas de plaque assay y figuras de PMC. No es un detector de objetos de proposito general y no debe usarse fuera de ese dominio.
- Conjunto de datos pequeno: 1070 imagenes de entrenamiento y 129 de test. Las metricas pueden no generalizar a nuevas fuentes de imagen (otros microscopios, otros formatos de placa, otras revistas o estilos de figura).
- Sesgo hacia los estilos de figura de PMC: el 100 % de las figuras de literatura proceden de articulos de PMC; figuras de otras editoriales o formatos no indexados pueden degradar el rendimiento.
- Riesgo de falsos positivos en imagenes sin pocillo: aunque la v4 reduce las cajas falsas de 152 a 49, siguen existiendo 49 cajas falsas en el conjunto de test; no se documentan umbrales de confianza recomendados distintos de `conf=0.25`.
- Precision limitada: la precision reportada (0.8912) es inferior al recall (0.944), lo que implica una tasa de falsos positivos no despreciable en produccion.
- Posible discrepancia entre metadatos y contenido: los metadatos de HuggingFace indican un tamano de repositorio de 0.0 GB, lo que resulta llamativo para un repositorio que deberia contener `best.pt` y `last.pt`. Conviene verificar la descarga real de los pesos antes de integrar el modelo.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion independiente por terceros mas alla de las metricas del propio autor.
- Licencia CC BY 4.0: permite uso comercial y modificacion, pero exige atribucion al autor y la indicacion de los cambios realizados; no incluye garantias. Debe verificarse ademas la licencia de las figuras de PMC utilizadas en el entrenamiento si se van a redistribuir derivados.
- Sin capacidades de lenguaje: no soporta tool calling, agentes, generacion de texto ni interaccion conversacional; cualquier descripcion de resultados debe generarla otro componente del sistema.
- Nomenclatura: el repositorio se llama `...-yolo26` mientras que la model card lo denomina "v4", lo que puede generar confusion al citar la version.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-plaque-well-detector-yolo26
- Dataset de entrenamiento: https://huggingface.co/datasets/einarolafsson/toxoplasma-plaque-well-detector-dataset
- Repositorio de spaCR: https://github.com/EinarOlafsson/spacr
- Paquete en PyPI: https://pypi.org/project/spacr/
- Paquete en conda-forge: https://anaconda.org/conda-forge/spacr
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos corresponden a un portal de noticias sin relacion con el modelo, la deteccion de objetos ni los ensayos de placa. No se han localizado papers, blogs ni demos adicionales en la informacion proporcionada.
