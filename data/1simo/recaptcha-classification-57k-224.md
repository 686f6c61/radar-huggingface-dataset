# 1simo/recaptcha-classification-57k-224

## Modelo recaptcha tile classifier 224 px (ONNX)

## Resumen

Se trata de un clasificador de imagenes ONNX derivado de DannyLuna/recaptcha-classification-57k, un YOLO11x-cls de Ultralytics entrenado originalmente a 640 px sobre el dataset DannyLuna/recaptcha-57k-images-dataset. El autor, 1simo, ha hecho un fine-tuning de esos pesos a una entrada de 224x224 px y ha exportado el resultado a ONNX, con el objetivo concreto de alimentar el solver en Go del proyecto mmhanda/VisionAIRecaptchaSolver. No es un modelo generativo ni multimodal: es un clasificador de 14 clases cerradas que etiqueta teselas (tiles) de retos reCAPTCHA.

El problema que resuelve es de eficiencia. Las teselas de reCAPTCHA miden en torno a 100 px, de modo que una entrada de 640 px las reescala aproximadamente 6x sin aportar informacion nueva, a un coste computacional muy alto. Bajando la entrada a 224 px, el autor reporta unas 28 veces mas throughput en la misma GPU (134 rejillas 3x3 por segundo en TensorRT fp16 sobre una RTX 3060 Laptop, frente a 4.8 del modelo de 640 px en CUDA), con tasas de acierto dentro del ruido estadistico respecto al modelo base.

Su relevancia es, por tanto, acotada y muy especifica: es una pieza de infraestructura para un solver de CAPTCHA concreto, publicado bajo AGPL-3.0, con 0 descargas y 0 likes en el momento de la consulta, y con un README inusualmente honesto sobre los defectos del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x-cls (Ultralytics), variante de clasificacion de imagenes de YOLO11, fine-tuned a 224 px |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | no disponible en el repo (se publica un unico ONNX; el autor reporta pruebas en TensorRT fp16) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | AGPL-3.0 (el modelo base y el dataset son MIT, publicados por DannyLuna) |
| Formato de pesos | ONNX, fichero `recaptcha_classification_57k_224.onnx` |

| Parametro de inferencia | Valor |
|---|---|
| Entrada | `images`: float32 `[batch, 3, 224, 224]`, RGB en [0, 1]; redimensionado del lado corto a 224 (bilineal) y recorte central 224x224 |
| Salida | `output0`: softmax sobre 14 clases |
| Clases (orden) | Bicycle, Bridge, Bus, Car, Chimney, Crosswalk, Hydrant, Motorcycle, Mountain, Other, Palm, Stair, Tractor, Traffic Light |
| Batch | dinamico |
| Tamano del repo | 0.1 GB |
| SHA-256 del fichero | `8ab029f07247bfe6dd6a15cf527b7968120cdaf267237054defe19efecfda786` |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO11x-cls de Ultralytics, es decir, un backbone convolucional de clasificacion con cabecera softmax, no un transformer ni un modelo generativo. El modelo parte de los pesos del modelo base entrenado a 640 px por DannyLuna y se reajusta a 224 px: segun el README, el fine-tuning se hizo sobre el split de entrenamiento del dataset a 224 px con AdamW, lr0 5e-4 con schedule coseno, 1 epoch de warmup, batch 64 y early stopping sobre el split de validacion. La mejor epoch fue la 13 de 19, con un tiempo de entrenamiento de 1.5 horas en una RTX 3060. El script `go-solver/train/train.py` reproduce el proceso.

La innovacion tecnica es la reduccion del coste de inferencia mediante el reescalado de la entrada, no un cambio de arquitectura. El propio README advierte que el tamano de entrada tambien figura en los metadatos (`imgsz`) y que ejecutar el modelo a cualquier tamano distinto de 224 px degrada la precision sin lanzar ningun error, lo que es un riesgo operativo relevante en despliegue. El uso previsto dentro de VisionAIRecaptchaSolver implica que el solver descarga el fichero en el primer uso y verifica su SHA-256.

## Capacidades

- Clasificacion de imagenes en 14 clases cerradas de objetos y escenas tipicas de los retos reCAPTCHA (bicicleta, puente, autobus, coche, chimenea, paso de cebra, hidrante, motocicleta, montana, "Other", palmera, escalera, tractor y semaforo).
- Salida probabilistica (softmax) por clase, lo que permite aplicar umbrales de decision configurables, por ejemplo el umbral 0.7 usado en la evaluacion del propio autor.
- Batch dinamico: admite lotes de tamano variable, adecuado para procesar las 9 teselas de una rejilla 3x3 en una sola pasada.
- Alta eficiencia en entrada pequena: unas 134 rejillas 3x3 por segundo en TensorRT fp16 sobre RTX 3060 Laptop.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No tiene capacidades multilingues ni de audio.
- No tiene modo "thinking" ni capacidades especiales mas alla de la clasificacion.

## Casos de uso

- Integracion en el solver VisionAIRecaptchaSolver: es el caso de uso para el que se creo el modelo. El solver en Go descarga el ONNX, verifica su SHA-256 y clasifica cada tesela de la rejilla para decidir que celdas pulsar.
- Clasificacion de teselas a gran escala con presupuesto de GPU limitado: gracias a las 134 rejillas 3x3 por segundo en TensorRT fp16 sobre una RTX 3060 Laptop, permite procesar volumenes altos en hardware de gama media donde el modelo de 640 px solo alcanzaria 4.8 rejillas por segundo en CUDA.
- Pruebas automatizadas de extremo a extremo de flujos con CAPTCHA: util para equipos que necesitan validar sus propios formularios o integraciones en entornos de test, sustituyendo la resolucion manual por una heuristica automatica.
- Prototipado de pipelines de automatizacion web: sirve como componente de clasificacion rapida cuando se necesita etiquetar recortes de unos 100 px sin reentrenar nada, aprovechando que el modelo ya esta entrenado sobre ese dominio visual.
- Investigacion sobre destilacion y degradacion de resolucion: el par de modelos 640 px / 224 px es un caso de estudio documentado de como reducir la entrada 8.2x manteniendo metricas dentro del intervalo de confianza, con datos de throughput medidos.
- Base para fine-tuning a resoluciones aun menores: al ser un ONNX pequeno (repo de 0.1 GB) y con licencia AGPL-3.0, se puede partir de el para experimentos de reentrenamiento si el proyecto resultante respeta esa licencia.
- Filtrado previo con umbral: combinado con un umbral como 0.7, puede usarse para decidir automaticamente que celdas pulsar en una rejilla estatica, con una tasa de rejillas resueltas exactamente del 63.6% segun la evaluacion del autor.

## Benchmarks y rendimiento

Metricas publicadas en el README del autor. Proceden del subconjunto no filtrado del split de validacion del dataset (748 imagenes de 1.474, de las cuales 191 son de tamano de tesela), tras detectar que el split de validacion filtra datos: 632 imagenes son copias byte a byte de imagenes de entrenamiento y 89 son copias recodificadas. Los intervalos del 95% se obtienen por remuestreo de las teselas.

| Metrica | Este modelo (224 px) | Modelo base (640 px) |
|---|---|---|
| Top-1 en teselas, excluyendo fondo | 91.2% [86-96] | 88.8% [84-94] |
| Teselas objetivo por encima de 0.7 (clic dinamico) | 84.8% [78-91] | 86.4% [80-92] |
| Teselas de fondo por encima de 0.7 para un objetivo | 5.2% [4.4-6.1] | 5.6% [4.7-6.4] |
| Rejillas estaticas simuladas respondidas exactamente | 63.6% [56-73] | 62.4% [55-72] |

Throughput reportado por el autor en la misma GPU (RTX 3060 Laptop): 134 rejillas 3x3 por segundo con este modelo en TensorRT fp16, frente a 4.8 del modelo de 640 px en CUDA, aproximadamente 28x mas.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplicarian a un clasificador de imagenes de dominio cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0.1 GB, por lo que el modelo en si es de escala muy reducida y cabe holgadamente en cualquier GPU de consumo actual, e incluso en GPUs integradas, siempre que se disponga de runtime ONNX.
- GPU recomendadas: la referencia medida por el autor es una RTX 3060 Laptop, tanto para el fine-tuning (1.5 horas) como para la inferencia (134 rejillas 3x3 por segundo en TensorRT fp16). No se aportan medidas en A100, H100 u otras GPUs de datacenter.
- Cabe en GPU de consumo: si, el modelo es de escala muy inferior a la de un modelo de lenguaje; el limite practico es el runtime, no la memoria.
- Opciones de despliegue: ONNX Runtime (formato nativo del fichero), TensorRT (modalidad fp16 usada en las mediciones), y cualquier motor que consuma ONNX. El caso de uso documentado es el solver en Go de VisionAIRecaptchaSolver, que descarga el fichero y valida su SHA-256 en el primer uso. No hay publicacion en GGUF ni soporte declarado para llama.cpp u Ollama, que ademas no aplican a un clasificador de imagenes.
- Latencia y throughput: 134 rejillas 3x3 por segundo en TensorRT fp16 sobre RTX 3060 Laptop; 4.8 rejillas por segundo para el modelo base de 640 px en CUDA en el mismo equipo. No se publican latencias por lote ni percentiles.

## Comparativa con modelos similares

| Modelo | Entrada | Parametros | Contexto | Top-1 en teselas (fondo excluido) | Throughput | Licencia |
|---|---|---|---|---|---|---|
| 1simo/recaptcha-classification-57k-224 | 224x224 | no disponible | no aplica | 91.2% [86-96] | 134 rejillas 3x3/s (TensorRT fp16, RTX 3060 Laptop) | AGPL-3.0 |
| DannyLuna/recaptcha-classification-57k (base) | 640x640 | no disponible | no aplica | 88.8% [84-94] | 4.8 rejillas 3x3/s (CUDA, RTX 3060 Laptop) | MIT segun el README del autor; el modelo base lo publica DannyLuna bajo MIT |

No se dispone de informacion en la documentacion proporcionada sobre otros clasificadores de teselas de reCAPTCHA comparables, ni sobre servicios propietarios de resolucion de CAPTCHA con metricas publicas, por lo que no se incluyen mas alternativas.

## Limitaciones y advertencias

- El split de validacion del dataset original filtra datos: 632 de sus 1.474 imagenes son copias byte a byte de imagenes de entrenamiento y 89 son copias recodificadas. Cualquier metrica calculada sobre el split completo estaria inflada; las cifras de este README se limitan a las 748 imagenes no filtradas.
- Practicamente nunca predice la clase "Other" (fondo), y alrededor del 30% de las teselas de fondo no filtradas obtienen al menos 0.7 en la clase Car. La clase "Other" del conjunto de entrenamiento solo tiene 128 imagenes distintas y su definicion ("no es el objetivo de este reto") es intrinsecamente ruidosa.
- El tamano de entrada es critico: ejecutar el modelo a cualquier resolucion distinta de 224 px degrada la precision sin devolver ningun error. Cualquier pipeline de produccion deberia forzar el tamano leyendo los metadatos (`imgsz`) y validar la forma de entrada.
- Dominio extremadamente estrecho: 14 clases cerradas de objetos y escenas de retos reCAPTCHA. Fuera de ese dominio, o con retos de otros proveedores de CAPTCHA, el comportamiento no esta caracterizado.
- No hay datos publicados sobre sesgos demograficos, geograficos o culturales; al tratarse de un clasificador de objetos, el sesgo relevante es de composicion del dataset y de las condiciones de captura de las imagenes.
- Riesgo de alucinacion en el sentido generativo: no aplica, pero si existe riesgo de falsos positivos con alta confianza, cuantificado en el 5.2% [4.4-6.1] de teselas de fondo puntuadas por encima de 0.7.
- Licencia AGPL-3.0, impuesta por Ultralytics a los modelos construidos con su framework. Es una licencia copyleft fuerte: integrar este modelo en un servicio de red implica obligaciones de liberacion del codigo fuente bajo AGPL. El modelo base y el dataset estan publicados bajo MIT, pero eso no relaja la licencia de este derivado.
- Advertencia legal y de uso: la finalidad declarada del modelo es resolver retos de reCAPTCHA, lo que puede contravenir los terminos de servicio de Google y, en determinadas jurisdicciones, normativa sobre acceso automatizado a sistemas. El uso en produccion deberia evaluarse juridicamente antes de desplegarse.
- Estado de adopcion minimo: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Sin idiomas ni contexto: cualquier requisito de procesamiento de lenguaje o de texto largo queda fuera del alcance de este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1simo/recaptcha-classification-57k-224
- Modelo base: https://huggingface.co/DannyLuna/recaptcha-classification-57k
- Dataset de entrenamiento: https://huggingface.co/datasets/DannyLuna/recaptcha-57k-images-dataset
- Repositorio del solver que lo consume: https://github.com/mmhanda/VisionAIRecaptchaSolver
- Script de reentrenamiento citado en el README: `go-solver/train/train.py` dentro del repositorio anterior
