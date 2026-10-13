# purvesh-pj/skin-disease-ensemble

# Ensemble de clasificacion de enfermedades cutaneas (skin-disease-ensemble)

## Resumen

El modelo `purvesh-pj/skin-disease-ensemble` es un clasificador de imagenes dermatoscopicas desarrollado por el usuario purvesh-pj y publicado en HuggingFace. Se trata de un ensemble apilado de tres redes neuronales convolucionales preentrenadas —ResNet101, DenseNet121 y EfficientNetB3— entrenadas sobre el dataset publico HAM10000 para distinguir siete categorias de lesiones cutaneas: akiec, bcc, bkl, df, mel, nv y vasc. El repositorio contiene unicamente los pesos entrenados en formato Keras HDF5 (`.h5`), con un tamano total de 0,4 GB.

Su relevancia practica es acotada pero clara: ofrece un punto de partida reproducible para tareas de clasificacion dermatologica con transferencia de aprendizaje, una tarea donde el desbalance de clases y la variabilidad visual de las lesiones hacen que los ensembles de backbone heterogeneos sean una estrategia habitual. Cada backbone aporta un sesgo inductivo distinto: extraccion residual profunda en ResNet101, reutilizacion densa de caracteristicas en DenseNet121 y escalado compuesto orientado a bordes finos en EfficientNetB3.

La entrada es fija: imagenes RGB de 224x224x3 pixels. El repositorio no publica metricas, no documenta el metodo exacto de agregacion de las tres salidas ni incluye codigo de inferencia; la logica de la aplicacion web asociada vive en un repositorio de GitHub separado. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un modelo sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble apilado de tres CNN: ResNet101, DenseNet121 y EfficientNetB3 |
| Parametros totales | no disponible (el repositorio no publica el recuento; los pesos ocupan 0,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 224x224x3) |
| Tipos de cuantizacion | no disponible (pesos publicados en HDF5 sin cuantizar) |
| Idiomas soportados | en (unicamente etiquetas de clase en ingles; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Keras HDF5 (`.h5`): `resnet101.h5`, `densenet121.h5`, `efficientnetb3.h5` |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de tipo *stacked* sobre tres backbones convolucionales. ResNet101 aporta conexiones residuales que permiten entrenar redes muy profundas sin degradacion del gradiente; DenseNet121 conecta cada capa con todas las posteriores, favoreciendo la reutilizacion de caracteristicas y reduciendo el numero de parametros efectivos; EfficientNetB3 aplica escalado compuesto (profundidad, anchura y resolucion) de forma balanceada, lo que en tareas dermatologicas suele mejorar la discriminacion de bordes de lesion. El preprocesado declarado es el escalado estandar de Keras/EfficientNet sobre espacio de color RGB.

El entrenamiento se realizo sobre HAM10000, un dataset dermatoscopico de referencia con siete clases diagnosticas. La model card no especifica el numero de imagenes empleadas, la particion train/validacion/test, el numero de epocas, la funcion de perdida, el optimizador, el uso de aumento de datos ni si se aplicaron tecnicas de reequilibrado de clases pese al desbalance conocido del dataset. Tampoco se documenta si hubo ajuste fino completo o solo de la cabeza de clasificacion. No se menciona ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal, destilacion ni mecanismo de agregacion explicito (media de probabilidades, votacion o meta-clasificador). Esa ambiguedad es relevante: la model card describe el sistema como "3-backbone stacked ensemble" pero no detalla la capa de combinacion.

## Capacidades

- Clasificacion de imagenes dermatoscopicas en siete clases: akiec (queratosis actinicа y carcinoma intraepitelial), bcc (carcinoma basocelular), bkl (lesiones benignas tipo queratosis), df (dermatofibroma), mel (melanoma), nv (nevus melanociticos) y vasc (lesiones vasculares).
- Entrada de imagen fija de 224x224x3 en RGB, con preprocesado estandar de Keras/EfficientNet.
- Salida de clasificacion multiclase (probabilidades por clase, aunque el numero de salidas y la agregacion no se documentan explicitamente).
- Ensemble de tres backbones heterogeneos, lo que en principio reduce la varianza respecto a un unico modelo.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo *thinking*, capacidades de vision general, audio ni generacion de texto.
- No es multilingue: el unico idioma declarado es `en`, y solo a efectos de etiquetas.
- No procesa metadatos clinicos (edad, sexo, localizacion anatomica), que en dermatologia suelen mejorar el rendimiento.

## Casos de uso

- Prototipo academico de clasificacion dermatologica: cargar los tres ficheros `.h5` en Keras y evaluar el ensemble sobre un *split* propio de HAM10000, usando el modelo como linea base reproducible frente a arquitecturas individuales.
- Docencia y practicas de *deep learning* medico: sirve para ilustrar tecnicas de transferencia de aprendizaje, ensembles de backbones y tratamiento de datasets desbalanceados en un dominio con clases minoritarias extremas.
- Comparacion de arquitecturas: al incluir tres familias distintas (residual, densa y escalado compuesto) sobre los mismos datos, permite estudiar que backbone aporta mas a cada clase diagnostica.
- Componente de una aplicacion web de triaje educativo: el repositorio de GitHub asociado implementa una interfaz donde el usuario sube una imagen y el backend devuelve la clase predicha; util como demostracion, no como herramienta clinica.
- *Benchmarking* de pipelines de inferencia: con 0,4 GB de pesos se puede medir latencia y throughput de Keras frente a TensorFlow Serving, ONNX Runtime o TFLite en el mismo hardware.
- Generacion de datos etiquetados para preentrenamiento: las representaciones intermedias de los tres backbones pueden reutilizarse como extractor de caracteristicas para otras tareas dermatologicas con pocos datos.
- Analisis de sensibilidad a la cuantizacion: los pesos en HDF5 permiten experimentar con cuantizacion post-entrenamiento (float16, int8) y medir la degradacion por clase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, AUC por clase, sensibilidad, especificidad ni matriz de confusion, y tampoco se aportan cifras de comparacion con ResNet101, DenseNet121 o EfficientNetB3 entrenados por separado. Los articulos encontrados en la busqueda web reportan ventajas cualitativas de los ensembles sobre CNN individuales, pero sin cifras atribuibles a este repositorio concreto.

## Requisitos de hardware

- VRAM estimada: el conjunto de pesos ocupa 0,4 GB en el repositorio, por lo que la inferencia en precision completa (float32) cabe holgadamente en GPUs con 4-6 GB de VRAM; la estimacion exacta de pico de memoria no esta publicada.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para servir los tres modelos simultaneamente. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes; las GPUs de gama alta no aportan ventaja significativa dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria unificada, aunque con mayor latencia.
- Opciones de despliegue: Keras/TensorFlow nativo, TensorFlow Serving, ONNX Runtime tras conversion, TensorFlow Lite para edge, y FastAPI o Flask para envolver la inferencia. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen de si los tres backbones se ejecutan en serie o en paralelo, decision no documentada.

## Comparativa con modelos similares

| Modelo / trabajo | Parametros | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skin-disease-ensemble (este) | no disponible | 224x224x3 RGB | no publicado | MIT | HuggingFace, 0 descargas |
| vanshg1909/skin-disease-classification | no disponible | no disponible | no disponible | no disponible | GitHub |
| Ensemble CNN + transfer learning (Springer, DOI 10.1007/978-3-031-51338-1_27) | no disponible | no disponible | Afirma superar a CNN individuales y a otros modelos del estado del arte, sin cifras en el material consultado | no disponible | Publicacion |
| Ensemble deep learning + IA generativa (Springer, DOI 10.1007/s44163-026-01218-y) | no disponible | no disponible | no disponible | no disponible | Publicacion |
| Skin Disease Detection Using Ensemble Learning (IJARSCT) | no disponible | no disponible | no disponible | no disponible | Publicacion |

La comparacion cuantitativa no es posible con la informacion disponible: ninguno de los trabajos encontrados publica en el material consultado cifras comparables por clase sobre HAM10000.

## Limitaciones y advertencias

- No es un dispositivo medico. No consta marcado CE, autorizacion FDA ni validacion clinica de ningun tipo. No debe usarse para diagnostico ni para decisiones de tratamiento.
- Ausencia total de metricas: sin exactitud, AUC ni sensibilidad por clase, es imposible evaluar si el ensemble funciona mejor que un azar informado en las clases minoritarias.
- Desbalance de clases: HAM10000 esta fuertemente desbalanceado y la clase nv es la mayoritaria, lo que tiende a inflar la exactitud global y a degradar la deteccion de melanoma (mel), la clase clinicamente critica. No se documenta ninguna estrategia de reequilibrado.
- Riesgo de falsos negativos en melanoma: un fallo de clasificacion en la clase mel tiene consecuencias clinicas graves; sin datos de sensibilidad por clase no puede estimarse ese riesgo.
- Dominio restringido: el entrenamiento usa imagenes dermatoscopicas. La aplicacion sobre fotografias de movil, con iluminacion y encuadre distintos, supone un cambio de distribucion no evaluado.
- Ambiguedad arquitectonica: no se especifica como se combinan las tres salidas (media, votacion, meta-clasificador) ni como se ponderan. La reproducibilidad exacta del resultado no esta garantizada.
- Idiomas: solo se declara `en`; no hay soporte de texto ni de metadatos clinicos en ningun idioma.
- Sesgos no evaluados: no hay analisis de sesgo por tono de piel, sexo, edad ni origen geografico, factores documentados como relevantes en dermatologia.
- Idoneidad de la licencia: MIT permite uso comercial y modificacion sin restricciones, lo que no exime de responsabilidad legal ni clinica al desplegar el modelo en un contexto sanitario.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de terceros. Debe tratarse como un experimento, no como un componente de produccion.
- Fecha de creacion poco habitual (2026-10-13 segun los metadatos de HuggingFace), lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/purvesh-pj/skin-disease-ensemble
- Repositorio GitHub del autor: https://github.com/Purvesh-PJ/skin_disease_detection
- Proyecto GitHub comparable (ensemble de 8 CNN): https://github.com/vanshg1909/skin-disease-classification
- Articulo Springer, ensemble CNN y transfer learning: https://link.springer.com/chapter/10.1007/978-3-031-51338-1_27
- PDF Springer, framework de ensemble deep learning para clasificacion de enfermedades cutaneas: https://link.springer.com/content/pdf/10.1007/s44163-026-01218-y.pdf
- PDF IJARSCT, Skin Disease Detection Using Ensemble Learning: https://www.ijarsct.co.in/A22639.pdf
- Dataset HAM10000: no disponible como enlace en la informacion proporcionada
- Paper tecnico del modelo, demo o documentacion adicional: no disponible
