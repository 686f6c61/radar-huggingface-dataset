# mitsooko/med-models

## Resumen

MediMind AI test models es una coleccion de tres clasificadores de imagen medicos en formato TFLite publicados por el usuario mitsooko bajo el identificador `mitsooko/med-models`. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un paquete de artefactos de inferencia para una aplicacion prototipo personal en Android. Los tres modelos cubren tareas de clasificacion de imagenes dermatologicas (skin), radiografias de torax (cxr) y resonancia magnetica cerebral (mri), y exponen una firma de servicio `serving_default` con entrada `image` en float32 de forma [1,H,W,3] en RGB con rango 0..255 y salidas `logits` [1,C] y `cam` [1,h,w] en rango 0..1.

El repositorio es de pequeno tamano (0,1 GB) y tiene un uso muy limitado en la comunidad (36 descargas y 0 likes en el momento de la consulta). La model card es explicita al calificar los artefactos como experimentales, entrenados con datos publicos, no validados clinicamente y no aptos para diagnostico medico. La licencia declarada es `other`, con etiquetas adicionales `research-only` y `not-for-clinical-use`, y los datasets de origen imponen condiciones propias que el autor remite a las paginas originales.

Por su naturaleza (TFLite, clasificadores de imagen, tamano reducido) el interes practico es acotado: sirve como referencia para prototipos moviles de vision aplicada a imagenes medicas y como ejemplo de empaquetado de modelos con mapas de activacion (CAM) para interpretabilidad, pero no constituye una base razonable para evaluaciones clinicas ni para despliegues en produccion sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificadores de imagen en TFLite; no se especifica la red base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de texto) |
| Tipos de cuantizacion | no disponible (el formato es TFLite; no se detalla si hay cuantizacion post-entrenamiento o entrenamiento con cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | other (con etiquetas `research-only` y `not-for-clinical-use`) |
| Formato de pesos | TFLite (`.tflite`) |

Detalle de los artefactos incluidos:

| id | Fichero | Dataset de entrenamiento | Nota de licencia del dataset |
|---|---|---|---|
| skin | `skin/skin_v1.tflite` | HAM10000 (mirror Kaggle `kmader/skin-cancer-mnist-ham10000`) | CC BY-NC 4.0 (verificar en la pagina del dataset) |
| cxr | `cxr/cxr_v1.tflite` | Chest X-Ray Images (Pneumonia), Kermany et al. 2018 (mirror Kaggle `paultimothymooney/chest-xray-pneumonia`) | CC BY 4.0 (verificar en la pagina del dataset) |
| mri | `mri/mri_v1.tflite` | Brain Tumor MRI Dataset (Kaggle `masoudnickparvar/brain-tumor-mri-dataset`) | listado como CC0-1.0 (verificar) |

El repositorio incluye un fichero `models.json` que, segun la model card, contiene los hashes sha256, el preprocesamiento, las etiquetas y las metricas de test de cada modelo. Estos datos no se han publicado en la informacion disponible para esta ficha.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de los tres clasificadores: la model card no indica la red base (por ejemplo, MobileNet, EfficientNet o una CNN propia), ni el numero de parametros, ni la resolucion de entrada concreta (solo se declara la forma generica [1,H,W,3]). Tampoco se detalla el esquema de entrenamiento: numero de epochs, aumentado de datos, funcion de perdida, particion train/val/test ni si se aplico algun tipo de calibracion o cuantizacion.

Lo unico documentado es la procedencia de los datos: HAM10000 para el clasificador dermatologico, el dataset de Kermany et al. 2018 de radiografias de torax con neumonia para el clasificador `cxr`, y el Brain Tumor MRI Dataset de Kaggle para el clasificador `mri`. La firma de servicio incluye una salida `cam` de forma [1,h,w] con valores en 0..1, lo que sugiere que los modelos generan mapas de activacion de clase (class activation maps) para interpretabilidad, aunque no se especifica el mecanismo exacto.

No hay evidencia de innovaciones tecnicas destacables: se trata de artefactos de inferencia empaquetados para una aplicacion Android personal, sin publicacion asociada, sin informe tecnico y sin resultados de evaluacion reproducibles en la informacion disponible.

## Capacidades

- Clasificacion de imagenes dermatologicas (`skin`): asignacion de una imagen a una de las clases del dataset HAM10000.
- Clasificacion de radiografias de torax (`cxr`): deteccion de patrones compatibles con neumonia segun el dataset de Kermany et al.
- Clasificacion de resonancias magneticas cerebrales (`mri`): categorizacion segun las clases del Brain Tumor MRI Dataset.
- Generacion de mapas de activacion (`cam`): cada modelo devuelve una salida espacial [1,h,w] en 0..1 que puede superponerse a la imagen para visualizar las regiones que influyen en la prediccion.
- Inferencia en dispositivo: el formato TFLite y el tamano del repositorio (0,1 GB para los tres ficheros) apuntan a ejecucion en movil o edge.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo thinking. No es un modelo multimodal ni linguistico.

## Casos de uso

- Prototipo educativo de triaje dermatologico: integrado en una aplicacion Android, el modelo `skin` puede clasificar una fotografia de lesion cutanea y mostrar el mapa `cam` para ilustrar que regiones han pesado en la prediccion, siempre como material didactico y nunca como sustituto de una consulta medica.
- Demostracion de vision artificial en imagenes medicas: util en asignaturas de aprendizaje automatico para mostrar el flujo completo de un clasificador TFLite con salida de interpretabilidad, usando el fichero `models.json` para reproducir el preprocesamiento.
- Pruebas de concepto de inferencia en dispositivo: sirve para medir latencia y consumo en telefonos Android con aceleracion NNAPI o GPU delegate, dado el reducido tamano de los tres ficheros.
- Comparacion de pipelines de datos medicos publicos: los tres modelos permiten contrastar el comportamiento de clasificadores entrenados con HAM10000, Kermany 2018 y Brain Tumor MRI en una misma interfaz de inferencia.
- Investigacion sobre calibracion y sesgos en datasets medicos publicos: al ser artefactos pequenos y de licencia restrictiva, son adecuados para estudiar como se propagan los sesgos de los datasets de origen (por ejemplo, desbalance de clases en HAM10000) en un clasificador movil.
- Evaluacion de marcos de despliegue TFLite: permite probar herramientas de conversion, cuantizacion y perfilado (TensorFlow Lite Benchmark Tool, delegates) sobre modelos de vision con salida multiple (`logits` y `cam`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `models.json` para las metricas de test, pero esos valores no se incluyen en los datos proporcionados para esta ficha. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB y los modelos son TFLite, por lo que se espera que quepan en memoria de un telefono movil, pero no se especifica el tamano individual de cada `.tflite` ni su huella en memoria.
- GPU recomendadas: no aplica en el sentido habitual de servidor. El destino declarado es Android; la ejecucion puede hacerse en CPU, GPU delegate o NNAPI segun el dispositivo.
- Cabe en GPU de consumo: si, previsiblemente, dado el formato y el tamano, aunque no se documentan requisitos minimos.
- Opciones de despliegue: TensorFlow Lite (Interpreter, GPU delegate, NNAPI delegate) y, en escritorio, el runtime de TFLite o conversiones a otros formatos no documentadas por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con otros clasificadores medicos en TFLite. Como referencia cualitativa, existirian clasificadores dermatologicos y de radiografia publicados en Hugging Face y en TensorFlow Hub, pero no se dispone de sus especificaciones en la informacion consultada para esta ficha.

## Limitaciones y advertencias

- No validado clinicamente: el propio autor indica que los modelos son experimentales, entrenados con datos publicos y no aptos para diagnostico medico.
- Licencia `other` con etiquetas `research-only` y `not-for-clinical-use`: el uso comercial y el uso clinico quedan excluidos o, como minimo, sujetos a condiciones no detalladas.
- Restricciones derivadas de los datasets: HAM10000 se distribuye bajo CC BY-NC 4.0 (uso no comercial), lo que condiciona el modelo `skin`; las condiciones de los datasets de `cxr` y `mri` deben verificarse en sus paginas originales, tal como advierte el autor.
- Riesgo de alucinacion y falsos positivos/negativos: no se publican metricas de sensibilidad, especificidad, AUC ni matrices de confusion en la informacion disponible, por lo que no es posible estimar la fiabilidad de las predicciones.
- Sesgos de los datos de origen: los datasets publicos de imagenes medicas presentan desbalance de clases, sesgos demograficos y variabilidad de equipos y protocolos que se trasladan al clasificador.
- Ambito limitado: cada modelo solo cubre las clases de su dataset; no generaliza a otras modalidades ni a otras patologias.
- Sin soporte linguistico ni de texto: no es un modelo conversacional ni multimodal general.
- Mantenimiento incierto: repositorio personal con muy pocas descargas y sin senales de soporte, versionado o actualizaciones mas alla de las fechas registradas.
- Uso en produccion sanitaria desaconsejado: cualquier despliegue requeriria validacion externa, aprobacion regulatoria y supervision clinica, ninguno de los cuales esta documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mitsooko/med-models
- Dataset HAM10000 (mirror Kaggle): https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
- Dataset Chest X-Ray Images (Pneumonia), Kermany et al. 2018 (mirror Kaggle): https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
- Dataset Brain Tumor MRI Dataset (Kaggle): https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
