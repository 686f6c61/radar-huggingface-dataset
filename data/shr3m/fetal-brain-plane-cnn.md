# shr3m/fetal-brain-plane-cnn

## Resumen

Fetal brain sub-plane CNN es una red neuronal convolucional desarrollada por Drileba Shem Remo (usuario shr3m) como proyecto de fin de curso del grado en Ingenieria Electrica y Electronica. El modelo clasifica una imagen de ecografia fetal monocanal en una de cuatro categorias de plano cerebral: trans-talamico, trans-cerebeloso, trans-ventricular u "Other" (otros). No es un modelo generativo ni un modelo de lenguaje: se trata de un clasificador de imagen de proposito muy especifico, con 1.173.668 parametros entrenables y una entrada fija de 224 x 224 pixeles en un unico canal.

La relevancia del repositorio es doble. Por un lado, documenta de forma inusualmente honesta un flujo de trabajo academico completo: aumento de datos geometrico e de intensidad, decaimiento coseno del learning rate, parada temprana, seleccion de modelo por macro-F1 debido al fuerte desbalanceo de clases y tres ejecuciones con semillas distintas para estimar la varianza. Por otro lado, publica tanto los resultados agregados como el desglose por clase y la matriz de confusion, lo que permite evaluar con precision donde falla el sistema: la clase "Other" obtiene un recall de 0,0303 y apenas 2 de 66 imagenes de test de esa clase se clasifican correctamente.

El modelo esta entrenado sobre FETAL_PLANES_DB (Burgos-Artizzu et al., *Scientific Reports*, 2020), publicado bajo licencia CC BY 4.0. El autor declara explicitamente que el modelo es para educacion, demostraciones de reproducibilidad e investigacion exploratoria, y que no es un dispositivo medico ni debe usarse para diagnostico o decisiones clinicas. La licencia del modelo en si no esta declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional propia (4 bloques convolucionales, sin arquitectura de referencia declarada) |
| Parametros totales | 1.173.668 parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, no generativo) |
| Tipos de cuantizacion | no disponible (no se documenta ningun formato cuantizado) |
| Idiomas soportados | no aplica / no disponible (modelo de vision, sin componente de texto) |
| Licencia | no disponible en el repositorio (el dataset de entrenamiento es CC BY 4.0) |
| Formato de pesos | PyTorch (checkpoint `FINAL-test-evaluation.pt`, state dict con configuracion y lista ordenada de clases) |
| Entrada | Imagen en escala de grises, 224 x 224 pixeles, 1 canal |
| Salida | 4 clases: trans-thalamic, trans-cerebellum, trans-ventricular, Other |
| Normalizacion requerida | media 0,17076 y desviacion tipica 0,17093, pixeles en rango 0-1 |
| Tamano del repositorio | 0,0 GB (checkpoint estimado en ~4,7 MB en fp32 a partir del numero de parametros) |
| Pipeline declarado | image-classification |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La red es una CNN totalmente convolucional de diseno propio. Acepta imagenes monocanal de 224 x 224 y las procesa mediante cuatro bloques convolucionales con 32, 64, 128 y 256 canales respectivamente. Cada bloque contiene dos convoluciones de 3 x 3, normalizacion por lotes, activaciones ReLU y max pooling. La salida de los bloques se reduce con adaptive average pooling a un valor por mapa de caracteristicas, seguido de dropout con probabilidad 0,5 y una capa lineal de cuatro salidas. El autor no declara que la arquitectura siga ninguna familia conocida (ResNet, VGG, EfficientNet), sino que es un diseno ad hoc de complejidad reducida.

El entrenamiento empleo el optimizador Adam con weight decay de 0,0001, aumento de datos geometrico e de intensidad sin volteo horizontal (decision coherente con la lateralidad anatomica de las ecografias), decaimiento coseno del learning rate y parada temprana. La seleccion del modelo se hizo por macro-F1 en validacion, justificada por el fuerte desbalanceo entre las cuatro clases. Se ejecutaron tres semillas aleatorias que produjeron valores de macro-F1 en validacion de 0,6272, 0,6426 y 0,6288 (media 0,6329, desviacion tipica 0,0069). El checkpoint publicado corresponde a la semilla 42, con su mejor macro-F1 de validacion en 0,6272 en la epoca 38. No se documenta el numero de tokens ni de imagenes de entrenamiento, ni el uso de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes de ecografia cerebral fetal en cuatro categorias de plano: trans-talamico, trans-cerebeloso, trans-ventricular y "Other".
- Distincion razonable de los tres planos anatomicos nombrados: recall de 0,8078 para trans-talamico, 0,7729 para trans-cerebeloso y 0,5530 para trans-ventricular en el conjunto de test.
- Procesamiento de imagenes monocanal en escala de grises, con un preprocesado de inferencia estrictamente definido y reproducible.
- Capacidad de deteccion de la clase "Other" practicamente nula: recall de 0,0303, con solo 2 aciertos de 66 imagenes.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso: es un clasificador supervisado de salida unica.
- No dispone de capacidades multilingues, de generacion de texto, de codigo ni de matematicas.
- No dispone de modo de pensamiento, de vision general, de audio ni de cualquier otra modalidad distinta de la clasificacion de imagen de ecografia.
- El checkpoint incluye la configuracion de entrenamiento y la lista ordenada de clases, lo que facilita la reproducibilidad de la inferencia.

## Casos de uso

- Docencia y practicas de vision por computador medico: el repositorio sirve como ejemplo completo y reproducible de un flujo de clasificacion con clases desbalanceadas, incluyendo aumento de datos, seleccion por macro-F1 y analisis de errores por clase. Es adecuado porque todo el pipeline esta documentado y los resultados de validacion y test son publicos.
- Reproducibilidad de experimentos academicos: los enlaces a Weights & Biases de las tres semillas y de la evaluacion final permiten reconstruir curvas de aprendizaje, hiperparametros y artefactos versionados. Resulta util para comparar tecnicas de remuestreo o de perdida ponderada sobre el mismo punto de partida.
- Analisis de desbalanceo de clases: el desglose por clase documentado (recall de 0,0303 en "Other") lo convierte en un caso de estudio realista para probar estrategias como oversampling, focal loss o umbrales de decision por clase.
- Filtrado previo en un conjunto de datos de investigacion: podria emplearse para separar imagenes de los tres planos nomalizados y marcar el resto para revision manual, siempre que se asuma que la clase "Other" no se detecta de forma fiable y se establezca una cola de revision humana.
- Prototipado de despliegue ligero en el borde: con 1.173.668 parametros y ~4,7 MB en fp32, el modelo puede exportarse a ONNX o TorchScript y ejecutarse en CPU o en hardware embebido, lo que permite ensayar pipelines de inferencia de bajo coste en entornos de laboratorio.
- Ensenanza de buenas practicas en IA medica: la model card dedica una seccion explicita a limitaciones y seguridad, lo que la hace util como material para discutir por que una accuracy de 0,7126 no debe citarse sin macro-F1 ni resultados por clase.

## Benchmarks y rendimiento

Resultados de la evaluacion final de test publicados por el autor (semilla 42):

| Metrica | Resultado |
|---|---:|
| Accuracy | 0,7126 |
| Macro-F1 | 0,5421 |
| Balanced accuracy | 0,5410 |
| Weighted F1 | 0,6953 |

Desglose por clase en test:

| Clase | Recall | F1 |
|---|---:|---:|
| Trans-thalamic | 0,8078 | 0,7658 |
| Trans-cerebellum | 0,7729 | 0,7391 |
| Trans-ventricular | 0,5530 | 0,6073 |
| Other | 0,0303 | 0,0563 |

Resultados de validacion en tres semillas (macro-F1):

| Semilla | Macro-F1 de validacion |
|---|---:|
| 42 | 0,6272 |
| 1337 | 0,6426 |
| 2024 | 0,6288 |
| Media | 0,6329 |
| Desviacion tipica | 0,0069 |

No se han publicado en la informacion disponible resultados comparativos con MMLU, HumanEval, GSM8K ni con otros benchmarks estandar, ya que no son aplicables a este tipo de modelo. El autor advierte de forma explicita que la accuracy no debe citarse sin acompanarla del macro-F1 y de los resultados por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB. Con 1.173.668 parametros en fp32, los pesos ocupan aproximadamente 4,7 MB, y las activaciones de una imagen de 224 x 224 monocanal son minimas.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas las de gama de entrada. No se requiere A100, H100 ni memoria de gran capacidad.
- Cabe sin problema en GPU de consumo: si, en cualquier RTX, GTX o incluso en GPUs integradas con soporte para PyTorch. Tambien cabe en Raspberry Pi y en dispositivos moviles.
- CPU: la inferencia en CPU es perfectamente viable para uso individual; el cuello de botella sera el preprocesado de imagen, no la red.
- Opciones de despliegue: PyTorch nativo (carga del state dict), exportacion a ONNX o TorchScript, y ejecucion en Python o C++. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos generativos de lenguaje y no a clasificadores convolucionales de imagen.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo.
- Almacenamiento: el repositorio completo ocupa 0,0 GB segun HuggingFace, por lo que el checkpoint es de pocos megabytes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shr3m/fetal-brain-plane-cnn | 1.173.668 | Imagen 224 x 224 monocanal | Accuracy 0,7126; macro-F1 0,5421 en test | no disponible | HuggingFace, 0 descargas, 1 like |
| Clasificador de referencia de Burgos-Artizzu et al. (2020) sobre FETAL_PLANES_DB | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | dataset CC BY 4.0 | Publicacion en *Scientific Reports* (enlace en la seccion de enlaces) |
| Otras alternativas (ResNet, EfficientNet u otras CNN medicas) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados numericos de modelos comparables que permitan una comparacion cuantitativa. La referencia natural es el articulo que publica el conjunto de datos FETAL_PLANES_DB, pero sus metricas no forman parte de los datos suministrados, por lo que no se reproducen aqui.

## Limitaciones y advertencias

- No es un dispositivo medico. El autor indica expresamente que no debe usarse para diagnostico, decisiones clinicas ni atencion al paciente.
- Rendimiento muy pobre en la clase "Other": recall de 0,0303 y F1 de 0,0563, con solo 2 aciertos de 66 imagenes de test. Cualquier uso que dependa de detectar imagenes fuera de los tres planos nombrados es inviable sin revision humana.
- Desbalanceo de clases severo: la accuracy de 0,7126 oculta un macro-F1 de 0,5421. Reportar solo la accuracy seria enganoso.
- La puntuacion de confianza no garantiza que una prediccion sea correcta, segun advierte el propio autor.
- Validacion limitada a un unico conjunto de datos publico. No hay validacion cruzada entre hospitales, poblaciones ni flujos de trabajo clinicos distintos.
- Sensibilidad a diferencias de adquisicion: variaciones de maquina y de operador pueden alterar las predicciones.
- El preprocesado de inferencia debe reproducirse exactamente (escala de grises, 224 x 224, rango 0-1, media 0,17076, desviacion tipica 0,17093); cualquier desviacion invalida los resultados publicados.
- Licencia del modelo no declarada en el repositorio, lo que genera incertidumbre sobre el uso comercial. El dataset subyacente se distribuye bajo CC BY 4.0 y exige atribucion.
- Varianza entre semillas baja pero no despreciable: macro-F1 de validacion entre 0,6272 y 0,6426, con desviacion tipica de 0,0069.
- Uso previsto restringido a educacion, demostraciones de reproducibilidad e investigacion exploratoria.
- Cero descargas y un solo "like" en el momento de la consulta: no existe validacion por parte de la comunidad.
- Sesgos conocidos: no se documenta ningun analisis de sesgo por subpoblacion, etnia, edad gestacional u origen del equipo de ecografia.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo; el riesgo equivalente es la clasificacion erronea con confianza alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shr3m/fetal-brain-plane-cnn
- Conjunto de datos FETAL_PLANES_DB (Zenodo): https://doi.org/10.5281/zenodo.3904280
- Articulo del conjunto de datos: Burgos-Artizzu et al., *Scientific Reports* 10, 10200 (2020), https://doi.org/10.1038/s41598-020-67076-5
- Proyecto de Weights & Biases: https://wandb.ai/shemremo-marconi-research-and-innovation-lab/fetal-brain-planes
- Ejecucion de evaluacion final de test: https://wandb.ai/shemremo-marconi-research-and-innovation-lab/fetal-brain-planes/runs/xoskwqyo
- Ejecucion con semilla 42: https://wandb.ai/shemremo-marconi-research-and-innovation-lab/fetal-brain-planes/runs/vr2jvt3n
- Ejecucion con semilla 1337: https://wandb.ai/shemremo-marconi-research-and-innovation-lab/fetal-brain-planes/runs/57h7klwh
- Ejecucion con semilla 2024: https://wandb.ai/shemremo-marconi-research-and-innovation-lab/fetal-brain-planes/runs/d0gmipa1
- Conjunto de datos en HuggingFace citado en la model card: Marc-HealthAI/fetal-planes-classification-dataset-zenodo

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces recuperados correspondian a paginas de inicio de sesion de servicios de correo y ofimatica, sin relacion con el contenido de la ficha, por lo que se han omitido.
