# luke12121212/ship-classification-resnet18

## Resumen

`luke12121212/ship-classification-resnet18` es un clasificador de imagenes de tipo buque publicado en HuggingFace por el usuario `luke12121212`. El modelo se basa en la arquitectura ResNet18, una red neuronal convolucional residual de 18 capas, y fue entrenado por el propio autor en Google Colab. Distingue cinco clases de embarcacion: Cargo, Military, Carrier, Cruise y Tankers. Se trata de un clasificador de imagen completa, no de un detector de posicion, por lo que devuelve una etiqueta por imagen y no coordenadas de cajas delimitadoras.

El modelo se distribuye junto con una aplicacion local en Python (Gradio, servida en `http://127.0.0.1:7860`) que incluye una pestana Predict para clasificar fotos y una pestana Metrics para consultar resultados. La aplicacion funciona tanto en CPU como en GPU, lo que reduce la barrera de entrada para pruebas y demostraciones. Los datos de entrenamiento proceden del dataset publico de Kaggle "Game of Deep Learning: Ship Datasets".

La relevancia de esta publicacion es limitada y de caracter practico: es un ejemplo reproducible de fine-tuning de un backbone convolutional clasico sobre un dataset pequeno de imagenes de barcos. No se trata de un modelo de proposito general, no compite con sistemas multimodales y su ficha no documenta metricas de rendimiento, licencia ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (red neuronal convolucional residual, 18 capas) |
| Parametros totales | no disponible en la model card (la implementacion estandar de ResNet18 en torchvision tiene aproximadamente 11,7 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card; el repositorio se describe como un directorio `ship_classifier_local` compatible con PyTorch |
| Entrada / salida | imagen RGB (clasificacion de imagen completa) / etiqueta entre 5 clases |
| Clases | Cargo, Military, Carrier, Cruise, Tankers |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ResNet18 es una CNN con conexiones residuales organizada en bloques BasicBlock: una convolucion de 7x7 con stride 2 y max pooling inicial, seguida de cuatro etapas con dos bloques residuales cada una (64, 128, 256 y 512 canales) y una capa totalmente conectada final. En este caso, la capa de salida se ha adaptado a 5 clases en lugar de las 1000 de ImageNet. La model card indica que el entrenamiento se realizo en Google Colab, sin especificar si se partio de pesos preentrenados en ImageNet o de inicializacion aleatoria.

No se documentan en la informacion proporcionada el numero de imagenes de entrenamiento, la composicion exacta del dataset, el numero de epocas, el optimizador, la tasa de aprendizaje, las tecnicas de aumento de datos ni si se aplico algun tipo de ajuste fino adicional. El dataset de origen se identifica como "Game of Deep Learning: Ship Datasets" de Kaggle, que contiene imagenes de buques etiquetadas por categoria. No hay indicios de innovaciones tecnicas destacables: es un fine-tuning estandar de un clasificador convolucional.

## Capacidades

- Clasificacion de imagenes de buques en cinco categorias: Cargo, Military, Carrier, Cruise y Tankers.
- Inferencia sobre imagen completa, no deteccion de objetos ni localizacion de multiples buques en una misma escena.
- Ejecucion en CPU o GPU, con una interfaz local Gradio para carga de imagenes y visualizacion de predicciones.
- Pestana de metricas en la aplicacion para consultar los resultados de las pruebas incluidas en `assets/`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues.
- No se documentan capacidades de vision adicionales (segmentacion, deteccion, OCR, descripcion de imagenes).

## Casos de uso

- Clasificacion rapida de fotografias de buques en un flujo de trabajo local: el modelo permite etiquetar una imagen como Cargo, Military, Carrier, Cruise o Tankers desde una interfaz web en `127.0.0.1:7860` sin depender de servicios en la nube.
- Prototipo educativo de vision por computador: sirve como ejemplo completo y reproducible de fine-tuning de ResNet18, incluyendo entorno virtual, `requirements.txt` y aplicacion Gradio, para cursos o talleres de aprendizaje automatico.
- Etiquetado asistido de pequenos conjuntos de imagenes maritimas: se puede usar para preanotar imagenes y despues revisar manualmente las etiquetas, reduciendo el coste de anotacion en proyectos de vigilancia costera a pequena escala.
- Base de partida para transfer learning en dominios maritimos: al ser un backbone ResNet18, se puede reutilizar como extractor de caracteristicas o reinicializar la capa final para nuevas categorias de embarcaciones u objetos navales.
- Demostraciones offline en entornos sin conexion: al ejecutarse en local sobre CPU o GPU, encaja en escenarios donde no se permite enviar imagenes a servicios externos, como laboratorios o instalaciones aisladas.
- Clasificacion de imagenes satelitales o aereas de buques, siempre que las imagenes se recorten al buque y se asemejen a la distribucion del dataset de Kaggle usado en el entrenamiento; hay que tener en cuenta que el modelo no localiza buques dentro de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que los resultados de las pruebas estan en el directorio `assets/` del proyecto, pero no se incluyen cifras de exactitud, precision, recall, F1 ni matrices de confusion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Un ResNet18 en precision FP32 ocupa del orden de decenas de megabytes de pesos; la inferencia por lotes pequenos suele requerir menos de 1 GB de VRAM. Estas cifras son estimaciones basadas en la arquitectura estandar y no estan confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente en la practica (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). No se han publicado mediciones especificas para este modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en GPUs integradas con soporte CUDA o ROCm.
- Ejecucion en CPU: la model card indica explicitamente que el modelo y la interfaz funcionan en CPU o GPU, por lo que es viable sin acelerador dedicado.
- Opciones de despliegue: aplicacion Gradio local incluida (`python app.py`), y por la naturaleza del modelo, exportacion a TorchScript u ONNX Runtime. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Entorno de ejecucion: Python 3.10 a 3.12, con PyTorch y las dependencias de `requirements.txt`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a caracteristicas estructurales. Las cifras de parametros de los modelos alternativos corresponden a implementaciones estandar y no a versiones concretas entrenadas sobre este dataset.

| Modelo | Arquitectura | Parametros aproximados | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ship-classification-resnet18 | ResNet18 | ~11,7 M (estandar) | Clasificacion de 5 clases de buques | no disponible | HuggingFace, 0 descargas |
| ResNet50 | CNN residual de 50 capas | ~25,6 M (estandar) | Clasificacion de imagenes generica | segun implementacion | Ampliamente disponible |
| EfficientNet-B0 | CNN con escalado compuesto | ~5,3 M (estandar) | Clasificacion de imagenes generica | segun implementacion | Ampliamente disponible |
| ViT-B/16 | Transformer de vision | ~86 M (estandar) | Clasificacion de imagenes generica | segun implementacion | Ampliamente disponible |

No se conocen modelos comparables especificos entrenados sobre el mismo dataset de Kaggle y con las mismas cinco clases, por lo que no es posible comparar exactitud ni rendimiento frente a alternativas equivalentes.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite el uso comercial. Tratarlo como no apto para produccion comercial hasta que el autor lo aclare.
- No hay informacion sobre el dataset de entrenamiento mas alla de la URL de Kaggle: se desconoce el numero de imagenes por clase, el balance entre clases y la procedencia de las fotografias, lo que impide evaluar sesgos.
- Riesgo de sesgo por desbalance de clases: en datasets de imagenes de buques es habitual que clases como Military o Carrier tengan muchas menos muestras que Cargo o Cruise, lo que puede degradar el recall en las clases minoritarias. No hay datos que lo confirmen o descarten.
- Es un clasificador de imagen completa, no un detector: no localiza multiples buques en una imagen ni devuelve cajas delimitadoras. Aplicarlo a escenas con varios buques producira una unica etiqueta potencialmente enganosa.
- Riesgo de alucinacion en el sentido de clasificacion erronea con alta confianza cuando la imagen de entrada se aleja de la distribucion de entrenamiento (por ejemplo, imagenes nocturnas, de baja resolucion, con niebla, satelitales a gran altitud o de otros tipos de embarcacion no contemplados).
- No hay metricas publicadas de exactitud, precision o recall; no es posible estimar la fiabilidad real del modelo ni fijar umbrales de confianza justificados.
- La model card no especifica la version de PyTorch ni el formato exacto de los pesos, lo que puede complicar la reproducibilidad del entorno.
- El repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0,0 GB, lo que sugiere que puede estar vacio o incompleto. Conviene verificar el contenido antes de intentar usarlo.
- La pestana Metrics muestra "resultados de prueba" en `assets/`, pero no se detalla el conjunto de evaluacion ni su tamano.
- Idioma de la documentacion: polaco. No hay ficha en ingles ni en castellano.

## Enlaces

- HuggingFace: https://huggingface.co/luke12121212/ship-classification-resnet18
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/arpitjain007/game-of-deep-learning-ship-datasets
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo publica: no disponible (la aplicacion se ejecuta en local en `http://127.0.0.1:7860`)
