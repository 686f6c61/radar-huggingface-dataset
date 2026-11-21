# sophiahsgsit/freshmart-models

## Resumen

FreshMart produce-scale models es un repositorio de modelos ONNX publicado por el usuario sophiahsgsit bajo el identificador `sophiahsgsit/freshmart-models`. No se trata de un modelo de lenguaje, sino de un conjunto de cuatro modelos de vision por computador empaquetados para una aplicacion de demostracion de supermercado a escala de produccion, desarrollados como proyecto de estudiante para la asignatura AAI3001 (Group 9). El repositorio ocupa 0,4 GB e incluye pesos en formato ONNX en dos variantes, fp32 e INT8, junto con un fichero `deploy_config.json` que indica a la aplicacion que fichero cargar y que entradas espera cada uno.

Los cuatro componentes son: un detector basado en YOLO11n, un clasificador de frescura basado en ResNet-50 con cuatro cabezas de salida, un modelo de segmentacion de magulladuras tipo U-Net y un generador de previsiones basado en pix2pix entrenado solo con perdida L1. El autor declara explicitamente que es material de curso, que no se ha probado para uso comercial real y que las imagenes de prevision generadas son ilustrativas y nunca se emplean para calcular el precio.

La relevancia de este repositorio es limitada fuera de su contexto academico: no hay model card detallada con hiperparametros, no se publican metricas, no consta licencia y no hay informacion sobre el dataset de entrenamiento. Su interes practico esta en servir como ejemplo de empaquetado ONNX con cuantizacion INT8 y configuracion de despliegue para un pipeline de vision en retail, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de cuatro modelos: YOLO11n (deteccion), ResNet-50 con 4 cabezas (clasificacion de frescura), U-Net (segmentacion de magulladuras), pix2pix (generacion de previsiones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | fp32 e INT8 (dos ficheros por modelo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio agrupa cuatro arquitecturas distintas de vision por computador. El detector es YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, orientada a inferencia rapida en entornos con recursos limitados. El clasificador de frescura parte de ResNet-50 y anade cuatro cabezas de salida, lo que sugiere una tarea multietiqueta o multiclase sobre el estado del producto. El modelo de magulladuras es una U-Net, arquitectura encoder-decoder habitual en segmentacion semantica de imagenes medicas y de inspeccion industrial. El generador de previsiones es pix2pix, una GAN condicional para traduccion imagen-a-imagen, entrenada en este caso unicamente con perdida L1, lo que implica una generacion mas conservadora y proclive al suavizado que las variantes con perdida adversarial completa.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el regimen de aumentacion de datos ni si hubo ajuste fino posterior. Tampoco se documentan hiperparametros de entrenamiento, epocas, resolución de entrada ni proceso de cuantizacion a INT8 (calibracion, rango dinamico o estatico). El autor solo indica que cada modelo tiene una version fp32 y otra INT8 y que `deploy_config.json` describe que fichero carga la aplicacion y que entradas espera cada uno.

## Capacidades

- Deteccion de objetos en imagenes de producto mediante YOLO11n, presumiblemente para localizar frutas y verduras en estanteria o mostrador.
- Clasificacion del estado de frescura mediante ResNet-50 con cuatro cabezas de salida, lo que permite emitir varias etiquetas o niveles por imagen.
- Segmentacion de magulladuras o defectos superficiales mediante U-Net, generando mascaras por pixel.
- Generacion de imagenes de prevision mediante pix2pix, con caracter ilustrativo y no vinculante para el precio.
- Inferencia en dos precisiones (fp32 e INT8) seleccionables mediante configuracion de despliegue.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Control de calidad en lineas de envasado de fruta: el detector YOLO11n localiza cada pieza en la cinta y el clasificador ResNet-50 asigna un nivel de frescura, permitiendo descartar automaticamente los lotes por debajo de umbral.
- Inspeccion de magulladuras en mostrador: la U-Net genera mascaras de defectos que se pueden superponer a la imagen original para que un operario revise solo las piezas marcadas, reduciendo el tiempo de triaje manual.
- Demostracion academica de pipeline ONNX completo: el repositorio sirve como ejemplo de empaquetado de varios modelos con variantes fp32 e INT8 y un fichero de configuracion de despliegue para una aplicacion web o de escritorio.
- Prototipo de aplicacion de gestion de inventario visual: combinando deteccion y clasificacion se puede estimar cuantas unidades de cada producto quedan y en que estado, como prueba de concepto para un sistema de reposicion.
- Generacion de material ilustrativo para informes de prevision: el modelo pix2pix produce imagenes de escenarios futuros que pueden acompanar a un informe, siempre que se etiqueten como ilustraciones y no se usen para fijar precios.
- Evaluacion comparativa de cuantizacion INT8 frente a fp32: al incluir ambos ficheros por modelo, el repositorio permite medir la perdida de precision y la ganancia de velocidad al pasar a INT8 en hardware concreto.
- Base para un trabajo de fin de asignatura sobre vision en retail: los estudiantes pueden sustituir componentes, reentrenar con sus propios datos o ampliar el numero de cabezas del clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB en total, lo que sugiere que los pesos individuales son pequenos y caben holgadamente en GPUs de consumo, pero no se especifica el reparto por modelo ni la resolucion de entrada.
- GPU recomendadas: no disponible. Por la eleccion de YOLO11n y ResNet-50 se puede inferir que el conjunto esta pensado para hardware modesto, pero el autor no documenta requisitos.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: al estar en formato ONNX, es compatible con ONNX Runtime, TensorRT y OpenVINO, entre otros. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FreshMart produce-scale models | Conjunto ONNX (YOLO11n + ResNet-50 + U-Net + pix2pix) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| YOLO11n (Ultralytics) | Detector | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Upstream de Ultralytics |
| ResNet-50 (Torchvision) | Clasificador | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Upstream de PyTorch |
| U-Net (referencia) | Segmentacion | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Multiples implementaciones publicas |

No se dispone de datos de rendimiento del repositorio que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a identificar los modelos upstream en los que se basa cada componente.

## Limitaciones y advertencias

- El autor declara explicitamente que es material de curso y que no se ha probado para uso comercial real en retail.
- Las imagenes de prevision generadas por pix2pix son ilustraciones y nunca deben usarse para calcular precios ni para decisiones economicas.
- No consta licencia, lo que impide determinar si el uso comercial esta permitido; ademas, los modelos upstream (YOLO11n de Ultralytics, ResNet-50 de PyTorch) tienen sus propias condiciones que el repositorio no aclara.
- No hay informacion sobre el dataset de entrenamiento, por lo que se desconocen sesgos de dominio, clases cubiertas y condiciones de captura (iluminacion, angulo, fondo).
- El generador pix2pix entrenado solo con perdida L1 tiende a producir salidas suavizadas y poco realistas, sin la nitidez que aportaria una perdida adversarial completa.
- No se documentan metricas de precision, recall, IoU ni mAP para ningun componente, por lo que no es posible evaluar su calidad objetiva.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- No se especifica la resolucion de entrada ni el preprocesado esperado mas alla de lo que indique `deploy_config.json`, lo que puede provocar errores de integracion si se usa fuera de la aplicacion original.
- Al ser modelos de vision, no ofrecen generacion de texto, razonamiento, codigo ni capacidades multilingues.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sophiahsgsit/freshmart-models
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
