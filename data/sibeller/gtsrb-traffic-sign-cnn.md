# Sibeller/gtsrb-traffic-sign-cnn

## Resumen

`Sibeller/gtsrb-traffic-sign-cnn` es una red neuronal convolucional (CNN) implementada con Keras/TensorFlow para clasificar senales de trafico alemanas del conjunto de datos GTSRB (German Traffic Sign Recognition Benchmark) en 43 categorias. Lo desarrolla Sibel Er como proyecto de fin de estudios (capstone) de ciencia de datos, y se publica en Hugging Face bajo licencia MIT con el pipeline `image-classification`.

El modelo resuelve una tarea acotada y bien delimitada: dada una imagen RGB de 32x32 pixeles que contiene una unica senal de trafico ya recortada, devuelve una de las 43 clases del benchmark. No es un modelo de lenguaje ni un sistema multimodal general; es un clasificador de vision por computador de proposito especifico, con un tamano de repositorio practicamente nulo (0.0 GB) y sin descargas ni interacciones registradas en el momento de la consulta.

Su relevancia es fundamentalmente didactica y de referencia: documenta decisiones metodologicas correctas (particion de validacion por traza para evitar fuga de datos, exclusion del volteo horizontal por la simetria semantica de las senales de direccion, recorte por coordenadas ROI) y reporta metricas honestas sobre el conjunto de test oficial. No compite con los detectores de senales de produccion, pero sirve como linea base reproducible y como ejemplo de buenas practicas en un pipeline de clasificacion de imagenes con Keras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (Conv2D + MaxPooling + Dense) con capas de aumento de datos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 32x32x3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas de clase en el dataset GTSRB) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; fichero `gtsrb_cnn_rwz.keras`) |

## Arquitectura y entrenamiento

La red es una CNN convolucional clasica de dos bloques. La entrada es una imagen RGB de 32x32 con valores normalizados a [0, 1] mediante division por 255. Antes de las convoluciones se aplican capas de aumento de datos (`RandomRotation`, `RandomTranslation`, `RandomZoom`) integradas en el propio modelo. El primer bloque consta de dos capas `Conv2D(32)` seguidas de `MaxPooling`; el segundo, de dos capas `Conv2D(64)` seguidas de `MaxPooling`. La salida se aplana (`Flatten`), pasa por una capa densa de 128 unidades y termina en una capa `Dense(43, softmax)`. La funcion de perdida es `sparse categorical crossentropy` y el optimizador es Adam.

El entrenamiento se realizo sobre el dataset GTSRB, con las imagenes recortadas a la region de interes (ROI) indicada por las coordenadas del propio benchmark. La innovacion metodologica mas destacable no esta en la arquitectura sino en el protocolo de evaluacion: la particion de validacion se hizo por traza (track), de modo que fotogramas consecutivos de la misma senal no cayeran simultaneamente en entrenamiento y validacion, evitando asi la fuga de datos tipica en GTSRB. Ademas, se excluyo el volteo horizontal en el aumento de datos porque transformaria senales de direccion a izquierda en senales de direccion a derecha, corrompiendo las etiquetas. No se documenta el numero de tokens ni composicion de dataset (no aplica), ni el uso de RLHF/DPO (no aplica a un clasificador).

## Capacidades

- Clasificacion de imagenes en 43 clases de senales de trafico alemanas (GTSRB).
- Entrada restringida a imagenes RGB de 32x32 pixeles, normalizadas a [0, 1].
- Funciona unicamente con imagenes ya recortadas que contienen una sola senal centrada.
- Aumento de datos integrado en el modelo (rotacion, traslacion, zoom; sin volteo horizontal).
- Soporte de carga directa mediante `tf.keras.models.load_model` desde Hugging Face Hub.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades multilingues, de audio ni de vision general (solo clasificacion de 43 clases).
- No es un modelo generativo: no produce texto ni descripciones.

## Casos de uso

- Linea base academica para el benchmark GTSRB: sirve para comparar nuevas arquitecturas contra un resultado de referencia documentado (~0,960 de accuracy en test oficial) con particion por traza.
- Prototipado rapido de un clasificador de senales en un pipeline de vision embebida: al ser una CNN pequena con entrada de 32x32, puede ejecutarse en dispositivos de bajos recursos una vez exportada a TensorFlow Lite o TensorRT.
- Docencia y formacion en Keras/TensorFlow: el modelo y su cuaderno de entrenamiento ilustran aumento de datos, particion por traza y evaluacion con F1 macro sobre un dataset publico.
- Preprocesado en un sistema de asistencia a la conduccion en fase de investigacion: clasificacion de senales previamente detectadas y recortadas por un detector de objetos (por ejemplo, un detector YOLO que aporte el recorte de 32x32).
- Etiquetado asistido de nuevos conjuntos de senales: usar el modelo como clasificador inicial para preanotar imagenes recortadas y revisar manualmente los casos de baja confianza.
- Validacion de pipelines de datos de trafico: comprobar que el recorte por ROI y la normalizacion de entrada se implementan correctamente comparando predicciones contra el conjunto de test oficial.
- Demostracion de despliegue en Hugging Face Hub: ejemplo minimo de carga de pesos `.keras` con `hf_hub_download` y `load_model` para integrarlo en una API de inferencia.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (dataset GTSRB, 43 clases):

| Conjunto | Accuracy | F1 (macro) |
|---|---|---|
| Entrenamiento | ~0,995 | ~0,995 |
| Validacion (particion por traza) | ~0,976 | ~0,977 |
| Test oficial | ~0,960 | ~0,923 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano de la arquitectura (CNN de dos bloques convolucionales y una capa densa de 128 unidades) es del orden de decenas de MB, muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo funciona correctamente en CPU.
- Cabe en cualquier GPU consumer y en CPU; tambien es apto para dispositivos embebidos tras conversion a TensorFlow Lite.
- Opciones de despliegue: TensorFlow/Keras nativo (`tf.keras.models.load_model`), TensorFlow Serving, TensorFlow Lite, y exportacion a ONNX o TensorRT (no documentada en la model card).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano de entrada (32x32) y la profundidad de la red, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el autor reporta ~0,960 de accuracy en el test oficial de GTSRB, pero no se aportan resultados de otras arquitecturas (ResNet, VGG, EfficientNet, etc.) sobre el mismo protocolo de particion por traza, por lo que no es posible establecer una comparacion cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Accuracy GTSRB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sibeller/gtsrb-traffic-sign-cnn | no disponible | no aplica | ~0,960 (test oficial) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento inferior en senales triangulares de advertencia con pocas muestras (por ejemplo, paso de peatones), segun reconoce el autor.
- El modelo solo es valido para imagenes recortadas que contengan una unica senal; no realiza deteccion ni localizacion de senales en escenas completas.
- Entrada fija de 32x32 pixeles: pierde detalle en senales pequenas o con condiciones de iluminacion adversas.
- Entrenado exclusivamente con el dataset GTSRB (senales alemanas); no generaliza necesariamente a senales de otros paises ni a dominios visuales distintos.
- Riesgo de confusion entre clases visualmente similares (por ejemplo, limites de velocidad proximos o senales de direccion), agravado por la resolucion de entrada.
- No se documentan sesgos especificos, pero al derivar de un dataset publico puede heredar los desequilibrios de clase del mismo.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, la precision reportada (~0,960 en test) no es suficiente por si sola para un sistema de seguridad critica sin validacion adicional y supervision humana.
- Proyecto academico sin mantenimiento documentado, con 0 descargas y 0 interacciones en el momento de la consulta; no hay garantias de soporte ni actualizaciones.
- No se han publicado mediciones de latencia, throughput ni robustez frente a ruido, oclusion o cambios de iluminacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sibeller/gtsrb-traffic-sign-cnn
- Cuaderno de entrenamiento (GitHub): https://github.com/ser2025/veri-bilimi-projeleri/tree/main/08-gtsrb-trafik-isareti-cnn
- Perfil de GitHub del autor: https://github.com/ser2025
- Perfil de Kaggle del autor: https://www.kaggle.com/sibeler
