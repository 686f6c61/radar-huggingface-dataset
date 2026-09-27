# jonasherminio/resnet152v2-skin-cancer-ham10000

## Resumen

El modelo jonasherminio/resnet152v2-skin-cancer-ham10000 es un clasificador de imagenes dermatoscopicas desarrollado por Jonas Alves dos Santos Herminio en el Centro Universitario Christus (Unichristus, Brasil) como parte del proyecto de investigacion "Adoption of Deep Learning to Assist the Diagnosis of Skin Cancer". No es un modelo de lenguaje: se trata de una red neuronal convolucional (CNN) basada en la arquitectura ResNet152V2 preentrenada, adaptada mediante transfer learning para clasificar lesiones cutaneas pigmentadas en siete categorias clinicas (queratosis actinica, carcinoma basocelular, dermatofibroma, queratosis benigna, melanoma, nevus melanocitico y lesiones vasculares).

El modelo se entreno sobre el dataset publico HAM10000 (10.015 imagenes dermatoscopicas recogidas a lo largo de 20 anos) y se distribuye como un fichero Keras en formato HDF5 (tcc.h5) dentro de un repositorio de 0,2 GB. El trabajo asociado ha sido revisado por pares y publicado por Springer, y el autor publica tambien la aplicacion web Flask que lo consume, con un tiempo de respuesta medio declarado de 1,17 segundos.

Su relevancia actual reside en que ejemplifica el flujo completo de un modelo de IA medica open source: dataset publico, transfer learning sobre una CNN estandar, licencia MIT, publicacion cientifica y aplicacion de demostracion. Al mismo tiempo, el propio autor advierte de que se trata de una herramienta de apoyo al cribado y no de un dispositivo medico validado clinicamente ni certificado por agencias regulatorias. El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que su difusion es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet152V2 preentrenada (transfer learning) con cabezal denso propio |
| Parametros totales | no disponible en la model card (la base ResNet152V2 ronda los 60 M de parametros; el total exacto del modelo no se especifica) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | HDF5 de Keras (.h5, fichero tcc.h5) |
| Tarea (pipeline) | image-classification |
| Resolucion de entrada | 150 x 150 x 3 RGB, normalizada a [0, 1] |
| Clases de salida | 7 (softmax) |
| Capas densas anadidas | 128 neuronas y 7 neuronas (softmax) |
| Dataset de entrenamiento | HAM10000 (10.015 imagenes dermatoscopicas) |
| Optimizador | SGD con learning rate inicial 0,001 |
| Epocas | 20 |
| Callbacks | Dropout, Early Stopping (20 epocas sin mejora), ReduceLROnPlateau (5 epocas sin mejora) |
| Tamano del repositorio | 0,2 GB |
| Libreria | Keras / TensorFlow |
| Metricas declaradas | accuracy, f1, precision, recall |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura parte de ResNet152V2 preentrenada, a la que se anaden capas densas personalizadas de 128 neuronas y una capa final de 7 neuronas con activacion softmax. La entrada son imagenes RGB de 150 x 150 pixeles normalizadas al rango [0, 1]. El entrenamiento se realizo con descenso de gradiente estocastico (SGD) y un learning rate inicial de 0,001 durante 20 epocas, con tres mecanismos de regularizacion y control: dropout para reducir el sobreajuste, Early Stopping que detiene el entrenamiento si no hay mejora tras 20 epocas y ReduceLROnPlateau que reduce el learning rate tras 5 epocas sin progreso para escapar de mesetas locales. La model card no especifica si la base se congelo total o parcialmente, ni el tamano de batch, ni la particion exacta entre entrenamiento y validacion.

Los datos de entrenamiento proceden del dataset HAM10000 ("Human Against Machine with 10000 training images", Tschandl, 2018, Harvard Dataverse), compuesto por 10.015 imagenes dermatoscopicas recogidas durante 20 anos en poblaciones diversas. Mas del 50 % de las lesiones estan confirmadas por histopatologia; el resto del ground truth se establecio mediante seguimiento clinico, consenso de expertos o microscopia confocal in vivo. Las siete clases predichas son: queratosis actinica / enfermedad de Bowen (precancerosa), carcinoma basocelular (maligno), dermatofibroma (benigno), queratosis benigna (benigno), melanoma (maligno), nevus melanocitico (benigno) y lesiones vasculares (benigno). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo que por otra parte no aplica a un clasificador de imagenes. Tampoco se documentan tecnicas de aumento de datos, ponderacion de clases ni estrategias para el desbalanceo entre las siete categorias, aspecto relevante porque en HAM10000 la clase de nevus melanocitico concentra una proporcion muy superior al resto.

## Capacidades

- Clasificacion de imagenes dermatoscopicas en siete categorias de lesiones pigmentadas, con salida de probabilidades por clase (softmax).
- Generacion de una estimacion de probabilidad de malignidad para las clases melanoma y carcinoma basocelular.
- Inferencia sobre imagenes individuales en formato RGB reescaladas a 150 x 150, integrable en un pipeline de Python con Keras.
- Descarga automatizada del checkpoint desde Hugging Face mediante huggingface_hub (patron documentado en la model card y usado por la aplicacion Flask del autor).
- Uso como base de transfer learning para reentrenar sobre otros datasets dermatologicos, dado que se distribuye en formato Keras estandar.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generalista, tool calling, function calling, capacidades de agente, multilingues, audio ni modo de razonamiento extendido.
- No procesa lenguaje natural: no hay tokenizador, ni ventana de contexto, ni plantilla de chat asociada.

## Casos de uso

- Triaje previo en atencion primaria: un medico de familia podria subir una imagen dermatoscopica y obtener una distribucion de probabilidad sobre las siete clases para decidir si deriva al paciente a dermatologia de forma prioritaria, usando el modelo como filtro y no como diagnostico definitivo.
- Segunda opinion en consulta dermatologica: el especialista puede contrastar su impresion clinica con la salida del modelo, particularmente en lesiones ambiguas entre nevus melanocitico y melanoma, siempre manteniendo la decision final en el criterio medico.
- Teledermatologia y zonas con escasez de especialistas: al ser una CNN ligera que se ejecuta sobre imagenes de 150 x 150, puede desplegarse en infraestructura modesta o incluso en el borde, lo que permite cribado remoto en regiones sin acceso presencial a dermatologia.
- Campanas de cribado poblacional: integrado en una aplicacion web como la Flask publicada por el autor (respuesta media de 1,17 segundos), permite procesar imagenes por lotes y generar una lista priorizada de casos sospechosos para revision humana.
- Apoyo a la docencia y formacion de residentes: la salida de probabilidades por clase sirve como material didactico para discutir la diferencia entre clases clinicamente confundibles (por ejemplo, queratosis benigna frente a melanoma) y para ilustrar las limitaciones de un modelo entrenado unicamente con HAM10000.
- Preanotacion de datasets dermatologicos: el modelo puede etiquetar de forma automatica imagenes no anotadas para su posterior revision y correccion por especialistas, acelerando la construccion de conjuntos de datos mayores y mas diversos.
- Punto de partida para investigacion en transfer learning medico: al estar publicado bajo licencia MIT y en formato Keras, es reutilizable como linea base en estudios comparativos de arquitecturas CNN sobre imagenes dermatoscopicas.
- Prototipado de producto sanitario digital: sirve como prueba de concepto funcional antes de invertir en un pipeline con validacion clinica y certificacion regulatoria.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los reportados por el propio autor en la model card, correspondientes a la comparativa de tres arquitecturas preentrenadas evaluadas tras 20 epocas de entrenamiento:

| Red neuronal | Accuracy en test | Loss |
|---|---|---|
| ResNet152V2 (modelo seleccionado) | 0,99 (99,01 %) | 0,02 |
| Xception | 0,99 | 0,05 |
| EfficientNet-B7 | 0,98 | 0,07 |

Ademas, la model card indica una media ponderada de precision, recall y F1-score de 1,00 sobre un conjunto de validacion de 1.870 muestras. No se publican en la informacion disponible la matriz de confusion por clase, el AUC-ROC por clase, el rendimiento especifico sobre la clase melanoma, ni resultados sobre datasets externos de validacion. Tampoco se detalla el protocolo de particion de datos, dato critico para interpretar una accuracy del 99,01 % en una tarea con clases muy desbalanceadas.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1 a 2 GB en precision float32 para lotes pequenos, partiendo de un repositorio de 0,2 GB y una entrada de 150 x 150. Es una estimacion propia a partir del tamano del artefacto, no un dato publicado en la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente; una NVIDIA GTX 1650, RTX 3050 o superior cubre el caso de inferencia unitaria. Para procesamiento por lotes a gran escala resultan adecuadas tarjetas tipo RTX 4090, A100 o H100, aunque la arquitectura no las aprovecha de forma intensiva.
- GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo de los ultimos anos, e incluso la inferencia en CPU es viable dado el reducido tamano de la entrada.
- Despliegue: carga directa con keras.models.load_model sobre el fichero tcc.h5; el autor proporciona una aplicacion Flask con autenticacion y descarga automatica del checkpoint mediante huggingface_hub. Son opciones adicionales, no documentadas en la ficha del modelo, la exportacion a TensorFlow Serving o a TensorFlow Lite para entornos moviles o embebidos.
- Latencia: el autor declara un tiempo de respuesta medio de 1,17 segundos en la aplicacion web Flask. No se especifica el hardware sobre el que se midio, ni el throughput en imagenes por segundo.

## Comparativa con modelos similares

La unica comparativa publicada es la que aparece en la propia model card entre las tres arquitecturas evaluadas en el mismo experimento:

| Modelo | Parametros totales | Contexto / entrada | Accuracy en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNet152V2 skin cancer (este modelo) | no disponible | imagen 150 x 150 x 3 | 0,99 (99,01 %) | MIT | Hugging Face, fichero tcc.h5 |
| Xception (mismo experimento) | no disponible | no disponible | 0,99 | no disponible | solo resultados en la model card |
| EfficientNet-B7 (mismo experimento) | no disponible | no disponible | 0,98 | no disponible | solo resultados en la model card |

No se dispone de informacion sobre otros clasificadores dermatologicos publicos (por ejemplo, modelos entrenados sobre ISIC o sobre el propio HAM10000 con arquitecturas tipo DenseNet) con los que establecer una comparacion de parametros, contexto y licencia. No disponible.

## Limitaciones y advertencias

- Generalizacion poblacional: el autor senala que HAM10000 no cubre de forma suficiente la diversidad de fototipos cutaneos y demografias, por lo que el rendimiento puede degradarse en poblaciones distintas a las del dataset de entrenamiento.
- Validacion clinica pendiente: la model card indica explicitamente que se requiere validacion en entorno real por dermatologos certificados antes de considerar el modelo fiable en la practica medica.
- Falta de aprobacion regulatoria: es un requisito formal la certificacion por autoridades sanitarias (ANVISA en Brasil, FDA en Estados Unidos u organismos equivalentes en la UE) antes de cualquier despliegue clinico.
- Riesgo de falsos negativos en melanoma: con clases muy desbalanceadas en HAM10000, una accuracy global del 99,01 % no garantiza un recall elevado en la clase minoritaria mas critica. La model card no desglosa metricas por clase, por lo que este riesgo no puede cuantificarse con la informacion disponible.
- Ausencia de metricas por clase y de matriz de confusion, lo que impide evaluar el comportamiento diferencial entre lesiones benignas y malignas.
- Sin informacion sobre el protocolo de particion de datos ni sobre posible fuga de informacion (por ejemplo, imagenes del mismo paciente en entrenamiento y test), lo que limita la interpretabilidad de los resultados reportados.
- Ambito de aplicacion restringido: solo clasifica imagenes dermatoscopicas de las siete categorias de HAM10000; no detecta otras patologias cutaneas ni acepta imagenes clinicas convencionales sin validacion previa.
- Sin cuantizacion documentada: no se publican versiones en int8, float16 ni otros formatos optimizados, por lo que cualquier optimizacion para produccion debe realizarse por cuenta propia.
- Soporte limitado del repositorio: 0 descargas y 1 like, sin garantia de mantenimiento, actualizaciones ni soporte por parte del autor.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del codigo no exime del cumplimiento de la normativa de dispositivos medicos aplicable al caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonasherminio/resnet152v2-skin-cancer-ham10000
- Articulo publicado en Springer: https://link.springer.com/chapter/10.1007/978-3-032-04725-0_26
- Repositorio de la aplicacion web (Flask + autenticacion): https://github.com/jonasherminiodev/resnet152v2-skin-cancer-ham10000
- Dataset HAM10000 (Tschandl, 2018, Harvard Dataverse): no se incluye enlace directo en la informacion proporcionada
