# benfox6515/TerraHeight-S

## Resumen

TerraHeight-S es un modelo compacto de estimacion de altura para teledeteccion, desarrollado por el usuario benfox6515 y publicado en HuggingFace bajo licencia Apache-2.0. Su tarea es la estimacion de altura monocular a partir de imagen aerea o satelital en RGB: recibe una imagen cenital y devuelve un mapa denso de altura por pixel expresado en metros sobre el nivel del suelo (AGL, Above Ground Level). Esto lo convierte en una herramienta de generacion de modelos digitales de superficie (DSM) a partir de ortofotos.

El modelo se construye por ajuste fino del backbone preentrenado Depth Anything V2 Small (encoder ViT-S) sobre el dataset GAMUS, exclusivamente. Cuenta con 24.785.089 parametros (24,79 M), una dimension de caracteristicas de 64 y canales de decodificador de 48, 96, 192 y 384. El mejor checkpoint se obtuvo en la epoca 30, entrenando con recortes de 630 x 630 pixeles y sin test-time augmentation.

Su relevancia actual radica en la relacion entre tamano y rendimiento: con aproximadamente 4 veces menos parametros que Depth2Elevation (24,79 M frente a 99,54 M, una reduccion de ~75%), logra un MAE inferior en el benchmark de test de GAMUS (1,580 m frente a 1,991 m), aunque con un RMSE ligeramente peor (3,725 m frente a 3,489 m). Eso lo situa como una opcion atractiva para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (encoder ViT-S de Depth Anything V2 Small) con decodificador de cuatro etapas |
| Parametros totales | 24.785.089 (24,79 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada de imagen con recorte de entrenamiento de 630 x 630 px) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | no aplicable (modelo de vision, sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (libreria declarada: depth-anything-v2; tamano del repositorio: 0,1 GB) |

Datos adicionales de configuracion: dimension de caracteristicas 64, canales de salida del decodificador [48, 96, 192, 384], mejor checkpoint en la epoca 30, test-time augmentation desactivada, salida en metros AGL, dataset de entrenamiento GAMUS.

## Arquitectura y entrenamiento

TerraHeight-S no entrena un transformer de vision desde cero: parte del backbone preentrenado Depth Anything V2 Small, cuyo encoder es un ViT-S. Sobre esa representacion preentrenada se realiza ajuste fino supervisado para la tarea de estimacion metrica de altura en teledeteccion, usando imagenes RGB cenitales del dataset GAMUS y sus correspondientes objetivos de altura AGL. El modelo resultante mantiene una dimension de caracteristicas de 64 y una cabeza decodificadora con canales de 48, 96, 192 y 384.

Los detalles de entrenamiento publicados son limitados: se especifica el dataset (GAMUS), el tamano de recorte (630 x 630), la epoca del mejor checkpoint (30) y la ausencia de test-time augmentation. No se documentan en la informacion proporcionada el numero total de tokens o imagenes de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras (no aplicables en un modelo de vision de este tipo). Tampoco se describe ninguna innovacion tecnica especifica mas alla del propio ajuste fino del backbone preentrenado, cuyo principal merito declarado es la eficiencia de parametros.

## Capacidades

- Estimacion densa de altura por pixel a partir de una unica imagen RGB cenital, con salida en metros sobre el nivel del suelo (AGL).
- Generacion de mapas de altura de resolucion completa (dense prediction), no solo puntos discretos.
- Rendimiento validado en el rango completo de alturas y en subconjuntos de pixeles con altura superior a 1 m y superior a 5 m.
- Alta correlacion con la altura real medida: coeficiente de Pearson de 0,9238 sobre todos los pixeles del conjunto de validacion de GAMUS.
- Inferencia a partir de imagen aerea o satelital en RGB (no requiere datos LiDAR ni estereoscopia).
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingues (no procesa texto).
- No se documentan capacidades adicionales como vision semantica, deteccion de objetos, segmentacion ni modos de pensamiento.

## Casos de uso

- Generacion de modelos digitales de superficie (DSM) a partir de ortofotos: el modelo produce un mapa de altura AGL por pixel a partir de una unica imagen RGB, lo que permite derivar elevaciones de edificios y vegetacion sin vuelos LiDAR ni pares estereoscopicos.
- Actualizacion de cartografia urbana: comparando el mapa de altura generado con cartografia previa se pueden detectar nuevas construcciones o cambios de altura en el entorno construido, usando imagenes recientes de satelite o dron.
- Estimacion de altura de vegetacion y apoyo a estudios de biomasa: la salida en metros AGL permite aproximar la altura del dosel vegetal, un dato de entrada habitual en modelos de carbono y de estructura forestal.
- Planificacion de redes de telecomunicaciones: los modelos de propagacion para cobertura movil y 5G requieren la altura de edificios y obstaculos; TerraHeight-S puede alimentar esas simulaciones a partir de ortofotos de la zona de despliegue.
- Analisis de visibilidad y line of sight: en planificacion de infraestructuras, vigilancia o instalacion de antenas, el mapa de altura permite calcular lineas de vision sobre el terreno construido.
- Modelizacion hidraulica y riesgo de inundaciones: los modelos de inundacion necesitan la altura de las edificaciones para estimar volumen de agua y areas afectadas; el modelo aporta esa capa de forma automatizada.
- Preprocesado en pipelines de fotogrametria: el mapa de altura puede usarse como inicializacion o como comprobacion cruzada en flujos de reconstruccion 3D, reduciendo la dependencia de nubes de puntos densas.
- Analisis de urbanismo y planificacion territorial: la estimacion de alturas permite caracterizar la densidad vertical de un barrio y estudiar escenarios de sombra o ventilacion a escala de ciudad.

## Benchmarks y rendimiento

Resultados de validacion sobre datos de validacion reservados de GAMUS (aproximadamente 900,7 millones de pixeles validos evaluados):

| Rango de altura | MAE (m) | RMSE (m) | Correlacion de Pearson |
|---|---:|---:|---:|
| Todos los pixeles | 1,312 | 2,616 | 0,9238 |
| > 1 m | 2,421 | 3,569 | 0,8923 |
| > 5 m | 2,693 | 3,951 | 0,8758 |

Comparativa en el benchmark de test de GAMUS:

| Modelo | Parametros | MAE (m) | RMSE (m) |
|---|---:|---:|---:|
| Depth2Elevation | 99,54 M | 1,991 | 3,489 |
| TerraHeight-S | 24,79 M | 1,580 | 3,725 |

No se han publicado en la informacion disponible resultados de benchmarks generales de vision (por ejemplo MMLU, HumanEval o GSM8K), que ademas no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada del numero de parametros, no publicada por el autor): aproximadamente 100 MB de pesos en fp32, unos 50 MB en fp16 y unos 25 MB en int8, a los que hay que sumar las activaciones de la imagen de entrada.
- Con entrada de 630 x 630 px y lote de tamano 1, el consumo total de VRAM previsible es de unos pocos gigabytes (estimacion orientativa; no confirmada por el autor).
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer moderna, incluidas RTX 3060, RTX 4060, RTX 4070 o RTX 4090; tambien en GPU de centro de datos (A100, H100) donde el modelo quedaria infrautilizado salvo en lotes muy grandes.
- Deberia poder ejecutarse en CPU para inferencia puntual, dado el reducido numero de parametros, aunque el autor no publica latencias.
- Opciones de despliegue: la libreria declarada en HuggingFace es depth-anything-v2; cabria esperar despliegue via PyTorch y transformers, y exportacion a ONNX o TensorRT. vLLM, llama.cpp y Ollama no son aplicables, ya que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | MAE (test GAMUS) | RMSE (test GAMUS) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| TerraHeight-S | 24,79 M | Estimacion de altura monocular en teledeteccion | 1,580 m | 3,725 m | Apache-2.0 | HuggingFace (benfox6515/TerraHeight-S) |
| Depth2Elevation | 99,54 M | Estimacion de altura monocular en teledeteccion | 1,991 m | 3,489 m | no disponible | referencia publicada del estado del arte en GAMUS |
| Depth Anything V2 Small | no disponible en la informacion proporcionada | Estimacion de profundidad monocular en imagenes naturales | no aplicable (no evaluado en GAMUS) | no aplicable | Apache-2.0 (segun la informacion disponible) | modelo base preentrenado usado por TerraHeight-S |

No se dispone en la informacion proporcionada de otros modelos comparables evaluados especificamente sobre GAMUS.

## Limitaciones y advertencias

- El modelo se ha ajustado exclusivamente sobre el dataset GAMUS. No hay evidencia publicada de generalizacion a otras regiones geograficas, sensores, condiciones de iluminacion o estaciones del ano distintas de las del conjunto de entrenamiento.
- La composicion geografica y las caracteristicas del dataset GAMUS no se detallan en la informacion disponible, por lo que no es posible acotar el sesgo geografico o de tipos de edificacion y vegetacion.
- La salida es una estimacion metrica de altura AGL y depende implicitamente de la escala de la imagen de entrada; variaciones de resolucion (GSD) o de calibracion del sensor pueden degradar la precision de forma no documentada.
- Riesgo de alucinacion estructural: al ser un modelo de regresion densa, puede producir alturas plausibles pero incorrectas en zonas ambiguas (sombras, superficies reflectantes, cubiertas uniformes) sin ninguna senal de incertidumbre asociada.
- El rendimiento cae al restringir el rango de alturas: el MAE pasa de 1,312 m en todos los pixeles a 2,693 m en pixeles con altura superior a 5 m, lo que indica mayor error en estructuras altas.
- Existe una discrepancia entre las metricas de validacion (MAE 1,312 m) y las del benchmark de test (MAE 1,580 m). Corresponden a particiones distintas de GAMUS y conviene no mezclarlas al comparar con otros trabajos.
- No se ha utilizado test-time augmentation, lo que limita la precision en comparacion con configuraciones que si la emplean.
- No se documentan cuantizaciones probadas ni el efecto de reducir la precision sobre la calidad del mapa de altura.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero conviene verificar las condiciones del dataset GAMUS y del modelo base Depth Anything V2 Small antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, con lo que la validacion por parte de la comunidad es practicamente inexistente. Se trata de un modelo reciente y poco contrastado.
- No dispone de soporte de texto, tool calling ni agentes; su integracion en produccion exige construir toda la capa de orquestacion alrededor del modelo de vision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benfox6515/TerraHeight-S
- Modelo base Depth Anything V2: no se proporciona enlace en la informacion disponible.
- Dataset GAMUS: no se proporciona enlace en la informacion disponible.
- Referencia Depth2Elevation: no se proporciona enlace en la informacion disponible.
- La busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces recuperados trataban sobre puntos de jubilacion de Agirc-Arrco y no guardan relacion con esta ficha.
