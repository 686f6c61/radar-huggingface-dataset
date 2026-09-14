# BloublouWhy/sign-mnist-mlp

## Resumen

`BloublouWhy/sign-mnist-mlp` es un clasificador de imágenes de lenguaje de signos desarrollado por el usuario BloublouWhy y publicado en Hugging Face. No es un modelo de lenguaje: se trata de un perceptrón multicapa (MLP) entrenado con scikit-learn sobre el dataset `datamunge/sign-language-mnist`, que contiene 27.455 imágenes de entrenamiento y 7.172 de test en escala de grises de 28x28 píxeles, distribuidas en 24 clases correspondientes a las letras del alfabeto dactilológico americano (ASL), excluyendo la J y la Z porque requieren movimiento.

La arquitectura es deliberadamente simple: dos capas ocultas de 256 y 128 neuronas con activación ReLU y una capa de salida de 24 clases. El preprocesado consiste únicamente en dividir los píxeles entre 255, sin reshape, de modo que la entrada es un vector plano de 784 dimensiones. El autor reporta una precisión de test de 0,7886 sobre el conjunto de evaluación.

Su relevancia es la de un artefacto educativo o de referencia (baseline): sirve para demostrar el flujo completo de carga de datos, entrenamiento, serialización con joblib y publicación en el Hub, y como punto de comparación frente a arquitecturas convolucionales aplicadas al mismo dataset. El repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, y la propia model card indica que el archivo `sign_mnist_mlp.pkl` se publicó localmente sin llegar a subirse por falta de token de Hugging Face, por lo que debe verificarse la disponibilidad real del artefacto antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) de scikit-learn: `MLPClassifier(hidden_layer_sizes=(256,128), activation='relu', max_iter=30, random_state=42)` |
| Parametros totales | 236.952 (calculado a partir de la arquitectura declarada: 784x256 + 256 + 256x128 + 128 + 128x24 + 24) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada fija de 784 valores (imagen 28x28 aplanada) |
| Tipos de cuantizacion | No disponible (no se distribuyen variantes cuantizadas) |
| Idiomas soportados | No disponible. No es un modelo de lenguaje; clasifica 24 clases del alfabeto dactilologico ASL (A-Z excepto J y Z) |
| Licencia | No disponible |
| Formato de pesos | Joblib (`sign_mnist_mlp.pkl`) |
| Tarea | Clasificacion de imagenes multiclase (24 clases) |
| Dataset | `datamunge/sign-language-mnist` via kagglehub (27.455 train / 7.172 test) |
| Precision de test | 0,7886 (reportada por el autor) |
| Preprocesado de entrada | Pixeles divididos entre 255,0; sin reshape; vectores de 784 dimensiones |
| Dependencias | scikit-learn y joblib (version no especificada) |
| Tamano del repo | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un MLP clasico implementado con `sklearn.neural_network.MLPClassifier`. Consta de una capa de entrada de 784 unidades (los pixeles aplanados de cada imagen), dos capas ocultas densas de 256 y 128 neuronas con activacion ReLU, y una capa de salida de 24 unidades. Con 236.952 parametros totales y pesos en coma flotante de 64 bits, el artefacto ocupa aproximadamente 1,9 MB en memoria (unos 0,95 MB si se convirtieran a float32).

No se especifica en la informacion disponible el numero de epocas efectivas, el tamano de lote, la tasa de aprendizaje ni el optimizador empleado; todos ellos quedan en los valores por defecto de scikit-learn salvo `max_iter=30` y `random_state=42`, que si se declaran. El dato de `max_iter=30` es notable porque el valor por defecto de scikit-learn es 200: es probable que el entrenamiento no alcanzase convergencia plena y que el modelo emitiese avisos de convergencia, lo que sugiere margen de mejora simplemente aumentando las iteraciones. No se menciona ningun proceso de regularizacion explicito, aumento de datos, ajuste de hiperparametros, RLHF ni DPO, ni ninguna innovacion tecnica mas alla del flujo de trabajo estandar.

## Capacidades

- Clasificacion de imagenes de 28x28 en escala de grises en una de 24 clases alfanumericas del alfabeto dactilologico ASL.
- Prediccion de probabilidad por clase mediante `model.predict(X)` y `model.predict_proba(...)`, util para umbrales de confianza y analisis de incertidumbre.
- Inferencia sobre vectores planos de 784 dimensiones tras normalizar los pixeles entre 0 y 1.
- Ejecucion exclusiva en CPU: no requiere GPU ni aceleradores.
- Serializacion y carga sencillas mediante joblib, lo que facilita su integracion en scripts de Python y pipelines de scikit-learn.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, generacion de texto, codigo ni matematicas.
- No tiene capacidades multimodales mas alla de la imagen 28x28 de entrada, ni modo de razonamiento, vision general, audio o video.
- No es multilingue: la salida son indices de clase (0-24, excluyendo 9/J y 25/Z), no texto.

## Casos de uso

- Baseline academico para practicas de vision por computador: permite ilustrar el ciclo completo de carga de datos, normalizacion, entrenamiento de un MLP, evaluacion y serializacion con joblib, y compararlo despues con una CNN sobre el mismo dataset.
- Prototipado rapido de pipelines de clasificacion: el modelo carga en milisegundos en CPU, por lo que sirve para validar el codigo de preprocesado y de serving antes de invertir en un modelo mayor.
- Pruebas de integracion en servicios web: al ser un artefacto de menos de 2 MB cargable con joblib, es adecuado para verificar el ciclo de serializacion, transporte y carga en un microservicio (Flask, FastAPI) sin coste de infraestructura.
- Docencia sobre limitaciones de los modelos lineales y densos: la brecha entre su 0,7886 de precision y lo que alcanzan arquitecturas convolucionales en el mismo dataset es un ejemplo didactico de la importancia de la inductividad espacial.
- Aumento de datos y experimentacion con preprocesados: puede usarse como sujeto de pruebas para medir como afectan el recorte, el reescalado, la binarizacion o el ruido a un clasificador que no modela estructura espacial.
- Deteccion automatica de fallos de convergencia: con `max_iter=30` es un caso practico para estudiar el efecto del numero de iteraciones y de los avisos de convergencia de scikit-learn en la precision final.
- En ningun caso es adecuado para reconocimiento de lenguaje de signos en imagenes reales de camara, videollamadas o traduccion en tiempo real, porque solo opera sobre el formato MNIST normalizado de 28x28 y no modela el movimiento ni el contexto del signante.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Precision en test (sign-language-mnist, 7.172 imagenes) | 0,7886 | Reportada por el autor en la model card |
| MMLU, HumanEval, GSM8K u otros | No aplica | El modelo no es un modelo de lenguaje |

"No se han publicado resultados de benchmarks en la informacion disponible" mas alla de la precision de test indicada. No se dispone de comparaciones controladas con otras arquitecturas sobre el mismo split, ni de metricas por clase, matriz de confusion, precision, recall o F1.

## Requisitos de hardware

- VRAM: no aplica. La inferencia se ejecuta en CPU.
- Memoria RAM: inferior a 10 MB incluyendo el interprete de Python y scikit-learn; el modelo en si ocupa alrededor de 1,9 MB en float64.
- GPU recomendadas: ninguna. Funciona en cualquier CPU x86 o ARM moderna; no se beneficia de CUDA.
- Compatibilidad con GPU de consumo: irrelevante, no hay ruta GPU contemplada en el artefacto publicado.
- Opciones de despliegue: script de Python con scikit-learn y joblib; tambien es posible exportarlo a ONNX mediante `skl2onnx` o servirlo con FastAPI/Flask. No aplica a vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano (dos multiplicaciones de matrices de 784x256 y 256x128 por muestra), cabe esperar latencias del orden de microsegundos a milisegundos por muestra en CPU, pero no hay mediciones publicadas.
- Almacenamiento: el repositorio declara 0,0 GB y la model card indica que el archivo se publico localmente sin subida remota, por lo que la disponibilidad efectiva del `.pkl` debe comprobarse.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Precision en sign-language-mnist | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BloublouWhy/sign-mnist-mlp | MLP (256, 128) | 236.952 | 0,7886 (test) | No disponible | Repositorio Hugging Face con 0 descargas; subida remota no confirmada |
| CNN entrenada sobre el mismo dataset | Red convolucional | No disponible | No disponible | No disponible | Multiples implementaciones publicas en notebooks y repos, sin datos verificados en esta busqueda |
| SVM o regresion logistica sobre pixeles | Modelo lineal / kernel | No disponible | No disponible | No disponible | Implementaciones genericas en scikit-learn |

No se dispone de cifras comparativas verificadas en la informacion proporcionada, por lo que la comparativa se limita a la categoria arquitectonica y no a resultados medidos.

## Limitaciones y advertencias

- No es un modelo de lenguaje pese a estar alojado en Hugging Face: no genera texto, no razona, no ejecuta codigo ni soporta tool calling.
- Solo funciona con entradas del formato exacto del dataset: imagenes en escala de grises de 28x28, normalizadas dividiendo entre 255 y aplanadas a 784 valores. Cualquier imagen real de una mano, con otro encuadre, iluminacion o resolucion, requiere un pipeline de segmentacion y reescalado que no se proporciona.
- Precision de test del 78,86 por ciento: aproximadamente una de cada cinco predicciones seria incorrecta, una tasa muy alta para cualquier aplicacion real.
- El valor `max_iter=30` esta muy por debajo del default de 200 en scikit-learn, por lo que es probable que el entrenamiento no convergiera y que el modelo tenga un margen de mejora sin cambios de arquitectura.
- Excluye las letras J y Z (clases 9 y 25), que requieren movimiento en el alfabeto ASL, de modo que no cubre el alfabeto completo. El propio autor advierte de esta exclusion.
- No se documentan sesgos ni la composicion demografica del dataset original; al ser imagenes dactilologicas de un unico alfabeto (ASL), no cubre otras lenguas de signos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de predicciones con alta confianza sobre entradas fuera de distribucion, ya que un MLP sin mecanismos de rechazo asignara siempre una de las 24 clases.
- Licencia no especificada: sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, lo que supone un riesgo legal en produccion.
- La model card indica que el artefacto no se subio al Hub por falta de token y que el repositorio ocupa 0,0 GB: existe la posibilidad de que los pesos no esten realmente disponibles para descarga.
- No se declaran versiones de dependencias ni semilla reproducible mas alla de `random_state=42`, lo que dificulta la reproducibilidad exacta del resultado.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante: los enlaces devueltos tratan sobre aviacion (CAVOK, CAVU, el motor J58 del SR-71), un simbolo tipografico y la diferencia entre distribuidor y agente, y no guardan relacion con este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BloublouWhy/sign-mnist-mlp
- Dataset de referencia citado en la model card: `datamunge/sign-language-mnist` (accesible via kagglehub)
- Documentacion de scikit-learn sobre `MLPClassifier`: no incluida en la informacion proporcionada
- Paper, blog, repositorio o demo adicional: no disponible
