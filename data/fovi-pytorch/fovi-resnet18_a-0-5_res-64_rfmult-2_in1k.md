# fovi-pytorch/fovi-resnet18_a-0.5_res-64_rfmult-2_in1k

## Resumen

fovi-resnet18_a-0.5_res-64_rfmult-2_in1k es un modelo de vision por computador preentrenado con una interfaz foveada, publicado por el usuario fovi-pytorch y generado con la libreria `fovi` (https://github.com/nblauch/fovi). No es un modelo de lenguaje: es un clasificador de imagenes basado en una ResNet-18 entrenada desde cero ("FOVI KNN ResNet-18") sobre ImageNet-1k, en la que la entrada no es la imagen completa a resolucion uniforme, sino una representacion foveada inspirada en la retina humana, con mayor detalle en el punto de fijacion y menor en la periferia.

El modelo se distribuye con una configuracion concreta de hiperparametros: funcion de magnificacion cortical `a = 0.5`, resolucion del sensor de 64 y multiplicador del marco de referencia del kernel (`rfmult`) de 2. El stem es un kernel 7x7 con pasos de convolucion y pooling de 2. La model card reporta una precision de validacion de 51,14% top-1 y 73,50% top-5 sobre ImageNet-1k utilizando 20 fijaciones.

Su relevancia es fundamentalmente de investigacion: proporciona un punto de partida reproducible para estudiar vision activa y foveada con arquitecturas convolucionales estandar, comparar variantes de hiperparametros del sensor y reutilizar un backbone preentrenado de bajo coste computacional. Con 53 descargas y 0 likes en HuggingFace, y sin pipeline declarado, debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-18 con interfaz foveada (FOVI KNN ResNet-18), entrenada desde cero |
| Parametros totales | no disponible en la model card; la ResNet-18 canonica tiene aproximadamente 11,7 M, pero la variante FOVI KNN puede diferir |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no autoregresivo) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna cuantizacion oficial) |
| Idiomas soportados | no aplica (clasificacion de imagenes); las 1.000 clases de ImageNet-1k estan etiquetadas en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otro formato; el repositorio ocupa 0,2 GB y se carga mediante la libreria fovi sobre PyTorch) |
| Dataset de entrenamiento | ImageNet-1k |
| Hiperparametro a (magnificacion cortical) | 0,5 |
| Resolucion del sensor | 64 |
| Kernel reference frame multiplier (rfmult) | 2 |
| Stem | kernel 7x7, pasos de convolucion y pooling de 2 |
| Numero de fijaciones en evaluacion | 20 |
| Precision reportada (validacion) | 51,14% top-1, 73,50% top-5 |
| Libreria | fovi |
| Tarea (pipeline) | no disponible en HuggingFace (clasificacion de imagenes, segun la model card) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 53 / 0 |
| Fecha de creacion / ultima actualizacion | 2026-08-05 / 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 convolucional clasica modificada por la libreria FOVI para operar sobre una entrada foveada. En lugar de alimentar la red con la imagen a resolucion uniforme, la interfaz foveada genera una representacion del sensor con resolucion efectiva de 64 y una funcion de magnificacion cortical parametrizada por `a = 0.5`, de forma que la densidad de muestreo decae desde el punto de fijacion hacia la periferia. El termino "KNN" de la nomenclatura hace referencia al esquema de kernel utilizado por la libreria, y `rfmult = 2` controla el multiplicador del marco de referencia del kernel. El stem emplea un kernel 7x7 con pasos de 2 tanto en la convolucion como en el pooling.

El entrenamiento se realizo desde cero sobre ImageNet-1k (sin inicializacion desde pesos preentrenados de ImageNet estandar) y la evaluacion utiliza un regimen de 20 fijaciones, es decir, el modelo no ve la imagen una sola vez, sino a traves de una secuencia de fijaciones que desplazan la region de alta resolucion. No se documenta en la informacion disponible el numero de tokens o imagenes vistas, la composicion exacta del dataset mas alla de ImageNet-1k, ni si se aplicaron fases de ajuste fino con RLHF, DPO u objetivos similares (no aplicables en un clasificador de este tipo). Tampoco se detallan innovaciones de inferencia como decodificacion especulativa o atencion lineal: la innovacion reside en la interfaz sensorial foveada, no en el cuerpo de la red. El paper asociado es "FOVI: A biologically-inspired foveated interface for deep vision models", de Blauch, Alvarez y Konkle (arXiv, 2026).

## Capacidades

- Clasificacion de imagenes en las 1.000 clases de ImageNet-1k, con salida de logits por clase y precision reportada de 51,14% top-1 y 73,50% top-5 en validacion con 20 fijaciones.
- Procesamiento de entrada foveada: el modelo trabaja sobre representaciones generadas por la interfaz FOVI, con resolucion de sensor 64 y magnificacion cortical configurable (`a = 0.5` en esta variante).
- Inferencia con multiples fijaciones (hasta 20 en la evaluacion reportada), lo que permite estudiar estrategias de atencion visual y seleccion de puntos de fijacion.
- Extraccion de caracteristicas con un backbone ResNet-18, reutilizable como encoder para tareas posteriores de vision mediante ajuste fino.
- Integracion directa con la libreria `fovi`, incluyendo carga automatica desde HuggingFace Hub y una clase `Trainer` para reentrenamiento o ajuste fino.

No dispone de: generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling ni function calling, soporte de agentes o razonamiento multi-paso, capacidades multilingues, ni modos especiales como thinking mode, audio o generacion de imagenes. La informacion disponible no documenta deteccion de objetos, segmentacion ni descripcion de imagenes.

## Casos de uso

- Investigacion en vision foveada y activa: el modelo sirve como referencia preentrenada para estudiar como afectan los hiperparametros del sensor (`a`, resolucion, `rfmult`) a la precision de clasificacion, comparando variantes bajo un protocolo identico de 20 fijaciones.
- Analisis de estrategias de fijacion: al permitir inferencia con multiples fijaciones, se puede usar para evaluar politicas de seleccion de puntos de fijacion (por ejemplo, barridos, politicas aprendidas o heuristicas de saliencia) y medir su impacto en top-1 y top-5.
- Prototipado rapido en clasificacion de imagenes: con un backbone ResNet-18 y un repositorio de 0,2 GB, es viable ajustar el modelo en un unico GPU de gama media para tareas de clasificacion con pocas clases, partiendo de caracteristicas ya entrenadas en ImageNet-1k.
- Vision embarcada con sensores de baja resolucion: la representacion foveada con resolucion de sensor 64 reduce la cantidad de pixeles procesados en alta resolucion, un escenario relevante para robots, drones o camaras con recursos energeticos y de ancho de banda limitados, siempre que se acepte una precision top-1 en torno al 50%.
- Reproducibilidad academica: el modelo permite reproducir y comparar resultados del paper FOVI sin reentrenar desde cero, reduciendo el coste computacional de la validacion experimental.
- Base para estudios de eficiencia computacional: sirve para medir el compromiso entre numero de fijaciones, coste de inferencia y precision, util en trabajos sobre atencion visual y asignacion adaptativa de recursos.
- Educacion y docencia en vision por computador: al ser un modelo pequeno, con licencia apache-2.0 y una API de carga en tres lineas, es adecuado para practicas sobre foveacion, backbones convolucionales y evaluacion en ImageNet.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la precision de validacion sobre ImageNet-1k con 20 fijaciones.

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| ImageNet-1k (validacion) | top-1 accuracy | 51,14% | 20 fijaciones |
| ImageNet-1k (validacion) | top-5 accuracy | 73,50% | 20 fijaciones |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este modelo), ni comparaciones controladas con otras variantes FOVI, ni mediciones de latencia o throughput. Cualquier comparacion con ResNet-18 estandar sobre imagen completa no seria directamente equivalente, ya que el modelo opera sobre una representacion foveada y con un presupuesto de fijaciones distinto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia dimensional, un backbone ResNet-18 ocupa del orden de decenas de MB en punto flotante, por lo que el peso del modelo no es el cuello de botella; el coste real depende del numero de fijaciones procesadas por imagen y del tamano de lote.
- GPU recomendadas: cualquier GPU con soporte CUDA y unos pocos GB de VRAM es suficiente para el backbone. GPU de gama alta (A100, H100, RTX 4090) solo aportan ventaja en escenarios de entrenamiento o de evaluacion masiva con muchas fijaciones y lotes grandes.
- Compatibilidad con GPU de consumo: si, el modelo es lo bastante pequeno para ejecutarse en GPU de consumo (por ejemplo, series RTX 3060, 4060, 4090) e incluso en CPU para inferencia de baja frecuencia, aunque la informacion disponible no incluye mediciones que lo confirmen.
- Opciones de despliegue: la via documentada es PyTorch a traves de la libreria `fovi`, con carga automatica desde HuggingFace Hub mediante `get_model_from_base_fn` y ajuste fino mediante `get_trainer_from_base_fn`. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI, ONNX Runtime, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles. Dependen directamente del numero de fijaciones configurado y de la resolucion del sensor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fovi-resnet18_a-0.5_res-64_rfmult-2_in1k | CNN foveada (ResNet-18) | no disponible (~11,7 M en la ResNet-18 canonica) | Foveada, sensor 64, 20 fijaciones | 51,14% top-1 / 73,50% top-5 | apache-2.0 | HuggingFace, 53 descargas |
| Otras variantes FOVI del mismo autor | CNN foveada (ResNet-18) | no disponible | Foveada, otros hiperparametros | no disponible en esta ficha | apache-2.0 (segun el autor) | HuggingFace |
| ResNet-18 estandar preentrenada en ImageNet-1k | CNN | ~11,7 M | Imagen completa, resolucion uniforme | no disponible en la informacion proporcionada | depende del repositorio | ampliamente disponible |

No se dispone de otros modelos comparables documentados en la informacion proporcionada, ni de resultados de las alternativas medidos bajo el mismo protocolo foveado, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Precision moderada: 51,14% top-1 en ImageNet-1k con 20 fijaciones, insuficiente para la mayoria de aplicaciones de produccion que requieran clasificacion fiable.
- Artefacto de investigacion: 53 descargas, 0 likes, sin pipeline declarado y con una unica model card breve; no hay garantias de mantenimiento, soporte ni estabilidad de la API.
- Dependencia de la libreria `fovi`: el modelo se carga a traves de esta libreria, que debe instalarse desde GitHub (`pip install git+https://github.com/nblauch/fovi.git`), lo que implica depender de una fuente no versionada en PyPI.
- Formato de pesos no especificado: al no documentarse safetensors, GGUF ni ONNX, la interoperabilidad con otros ecosistemas de inferencia no esta garantizada.
- Sesgos inheritos del dataset: ImageNet-1k presenta sesgos conocidos de representacion geografica, cultural y demografica en sus clases y en la distribucion de sus imagenes; el modelo no incluye ninguna evaluacion de sesgo o equidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en clases poco representadas o en dominios distintos de ImageNet (desplazamiento de dominio).
- Limitaciones de idioma y contexto: no procesa texto ni lenguaje natural; las etiquetas de salida estan en ingles y pertenecen exclusivamente al conjunto de 1.000 clases de ImageNet-1k.
- Uso comercial: la licencia apache-2.0 permite uso comercial del modelo, pero el uso de ImageNet-1k para entrenamiento o evaluacion puede estar sujeto a sus propios terminos de uso, que no se detallan en la model card.
- Ausencia de datos de calibracion, cuantizacion o latencia: no hay informacion publicada para planificar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fovi-pytorch/fovi-resnet18_a-0.5_res-64_rfmult-2_in1k
- Repositorio de la libreria fovi: https://github.com/nblauch/fovi
- Paper de referencia (citado en la model card): Blauch, N. M., Alvarez, G. A. y Konkle, T., "FOVI: A biologically-inspired foveated interface for deep vision models", arXiv, 2026. No se proporciona URL directa en la informacion disponible.
- Nota sobre la busqueda web: las busquedas realizadas no devolvieron ningun resultado relevante para este modelo; los unicos resultados obtenidos fueron paginas de inicio de sesion de Dadeschools (Miami-Dade County Public Schools) y de MyACCESS, sin relacion alguna con el modelo.
