# rokzann3/howest-hf-ai

## Resumen

howest-hf-ai es un clasificador de imagenes de tres clases (gato, perro y panda) publicado por el usuario rokzann3 en HuggingFace. Se trata de una red neuronal convolucional pequena implementada con Keras 3.15.1 (backend TensorFlow) y entrenada dentro de un pipeline de Azure Machine Learning como parte de un curso de MLOps en la universidad Howest. El modelo resuelve una tarea de clasificacion de imagenes de juguete: recibe una imagen RGB de 64 x 64 pixeles y devuelve una distribucion softmax sobre las etiquetas `["Cat", "Dog", "Panda"]`.

La relevancia del modelo es fundamentalmente educativa: ilustra el ciclo completo de un flujo MLOps (entrenamiento, guardado en Keras, publicacion en el Hub) mas que un caso de uso en produccion. La arquitectura es una CNN de seis capas convolucionales (con 32, 64 y 128 filtros) con BatchNorm, MaxPooling y Dropout, seguida de una capa densa de 512 unidades y la salida softmax. No se especifica el numero de parametros totales ni la licencia.

El rendimiento medido sobre 600 imagenes de test es modesto: una exactitud global de 0,78, con buen comportamiento en la clase panda (F1 de 0,93) y confusion notable entre gatos y perros (F1 de 0,72 y 0,68), atribuible en parte a la resolucion reducida de 64 x 64. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (6 x Conv2D con BatchNorm, MaxPooling y Dropout + Dense(512) + softmax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 64 x 64 x 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de salida estan en ingles: Cat, Dog, Panda) |
| Licencia | no disponible |
| Formato de pesos | Keras 3.15.1 (cargable con `keras.saving.load_model`); no se ofrecen pesos GGUF ni safetensors |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional pequena orientada a una tarea de clasificacion de tres clases. Consta de seis capas Conv2D con 32, 64 y 128 filtros, cada una acompanada de BatchNormalization, MaxPooling y Dropout, seguidas de una capa densa de 512 unidades y una capa de salida softmax de tres neuronas. El contrato de entrada es estricto: las imagenes deben cargarse con PIL usando `.convert("RGB")`, redimensionarse a 64 x 64 con la interpolacion por defecto de PIL y convertirse a `float32` manteniendo el rango de pixeles crudo 0-255, sin dividir por 255. La forma del lote es `(N, 64, 64, 3)`.

El entrenamiento uso 1.000 imagenes por clase, con un 20 por ciento reservado para test (semilla 42). El optimizador fue SGD con una tasa de aprendizaje inicial de 0,01 reducida a la mitad al estancarse, hasta un maximo de 50 epocas con parada temprana; los mejores pesos proceden de la epoca 43. Se aplico aumento de datos con rotacion, desplazamiento, cizalladura (shear), zoom y volteo horizontal. El modelo se guardo con Keras 3.15.1 dentro de un pipeline de Azure Machine Learning. No se documenta el numero de tokens ni el uso de tecnicas de alineacion tipo RLHF o DPO, ya que no aplican a esta tarea.

## Capacidades

- Clasificacion de imagenes en tres categorias cerradas: gato, perro y panda.
- Salida de probabilidades calibradas mediante softmax en el orden fijo `["Cat", "Dog", "Panda"]`.
- Entrada de imagenes RGB de 64 x 64 pixeles en formato `float32` con rango 0-255.
- Carga directa desde el Hub mediante `keras.saving.load_model("hf://rokzann3/howest-hf-ai")` con backend TensorFlow.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general ni audio.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades multilingues ni modo de razonamiento (thinking mode).

## Casos de uso

- Material didactico de MLOps: permite ilustrar un flujo completo desde el entrenamiento en Azure ML hasta la publicacion en el Hub y la inferencia con Keras, sin requerir infraestructura pesada.
- Clasificacion de imagenes de mascotas en prototipos y demos: util para validar rapidamente pipelines de preprocesado e inferencia en cuadernos de Jupyter o scripts de prueba.
- Filtrado automatico de fotografias de gatos, perros y pandas en pequenos conjuntos de datos o repositorios de imagenes personales, aceptando la tasa de error del 22 por ciento.
- Ejemplo de integracion de Keras con TensorFlow en entornos de servidor: sirve como plantilla para construir un servicio de inferencia ligero que corre en CPU.
- Benchmark de referencia en cursos y tutoriales: el modelo sirve como linea base reproducible para comparar tecnicas de aumento de datos, optimizadores o resoluciones de entrada.
- Prototipo de clasificacion de bajo coste en dispositivos con recursos limitados, dado el tamano reducido de la entrada (64 x 64) y la arquitectura convolucional pequena.
- Ejercicio de evaluacion por clase: el desglose de precision, recall y F1 sobre 600 imagenes permite practicar analisis de errores y matrices de confusion.

## Benchmarks y rendimiento

Resultados de evaluacion sobre 600 imagenes reservadas (extraidos de la model card):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| Cat | 0,71 | 0,73 | 0,72 |
| Dog | 0,69 | 0,68 | 0,68 |
| Panda | 0,93 | 0,92 | 0,93 |
| Exactitud global | | | 0,78 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet u otros) en la informacion disponible. La propia model card senala que los gatos y los perros se confunden con frecuencia a 64 x 64, mientras que los pandas se clasifican de forma fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de la entrada (64 x 64 x 3) y una CNN de seis capas, la huella de memoria deberia ser inferior a 1 GB en la practica, aunque no se confirma en la documentacion.
- GPU recomendadas: no especificadas. La carga computacional es minima, por lo que cualquier GPU moderna es suficiente y probablemente sobredimensionada.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en cualquier GPU de consumo (e incluso en CPU), dado el tamano reducido del modelo.
- Ejecucion en CPU: viable para inferencia puntual o por lotes pequenos, aunque no se aportan cifras.
- Opciones de despliegue: carga nativa con Keras 3.15.1 y backend TensorFlow; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Exactitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| howest-hf-ai (rokzann3) | CNN Keras | 3 (Cat, Dog, Panda) | 64 x 64 RGB | 0,78 | no disponible | HuggingFace |
| Modelos comparables | no disponible | | | | | |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Cualquier CNN pequena entrenada sobre el mismo conjunto de gatos, perros y pandas (por ejemplo, variantes de MobileNet o ResNet ajustadas a tres clases) seria un punto de comparacion razonable, pero no se aportan datos concretos para establecer la comparacion.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo confunde sistematicamente gatos y perros (F1 de 0,72 y 0,68), lo que limita su utilidad en tareas de distincion fina entre ambas especies.
- Riesgo de alucinacion: al ser un clasificador cerrado de tres clases, cualquier imagen que no sea un gato, un perro o un panda se forzara hacia una de esas tres etiquetas con una probabilidad softmax, sin mecanismo de rechazo.
- Limitacion de resolucion: la entrada de 64 x 64 pixeles degrada el detalle disponible, lo que explica en parte la confusion entre clases visualmente similares.
- Preprocesado estricto: no dividir por 255 y respetar la interpolacion de PIL son requisitos explicitos; cualquier desviacion degrada las predicciones.
- Licencia no disponible: al no especificarse la licencia, no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- Idiomas: no aplica, pero las etiquetas de salida estan en ingles.
- Ambito educativo: el modelo fue creado en el marco de un curso de MLOps; no se ha sometido a validacion en produccion ni a pruebas robustas de generalizacion.
- Ausencia de metadatos: no se documentan parametros totales, cuantizaciones ni opciones de despliegue optimizadas, lo que dificulta la planificacion de recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rokzann3/howest-hf-ai
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
