# proxima-fusion/coilstellaration-models

## Resumen

`proxima-fusion/coilstellaration-models` es un repositorio de modelos publicado en Hugging Face por la organizacion `proxima-fusion`, distribuido en formato ONNX y con licencia MIT. Por su nombre y por el formato de pesos, no se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de modelos orientados a la tarea de coil-stellarator design (diseno de bobinas para reactores de fusion de tipo stellarator), un problema de optimizacion fisica que se aborda habitualmente con redes neuronales sustitutas (surrogate models) o modelos de aprendizaje por refuerzo.

La model card publicada es practicamente vacia: solo contiene la declaracion de licencia MIT, sin descripcion, sin arquitectura, sin datos de entrenamiento ni resultados. El repositorio ocupa 0,6 GB, lo que sugiere uno o varios grafos ONNX de tamano moderado, pero no permite inferir el numero de parametros ni la naturaleza exacta de la red. En el momento de redactar esta ficha el modelo no registra descargas ni likes.

Su relevancia es acotada y muy especializada: puede interesar a equipos que trabajan en optimizacion de geometrias de bobinas para confinamiento magnetico, no a desarrolladores que buscan un LLM. Cualquier evaluacion seria exige inspeccionar los ficheros ONNX directamente, ya que la informacion publica no permite caracterizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en formato ONNX; probable red neuronal para diseno de bobinas de stellarator) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (ONNX permite cuantizacion post-entrenamiento, pero el autor no la documenta) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje segun la informacion disponible) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el numero de capas, el tipo de red (MLP, CNN, GNN, transformer) ni sobre el regimen de entrenamiento. El unico dato tecnico fiable es el formato de serializacion: ONNX, lo que implica que el modelo esta pensado para inferencia portable con ONNX Runtime, potencialmente con aceleracion por GPU o incluso en CPU.

Tampoco se documentan el volumen de datos de entrenamiento, la fuente de las simulaciones fisicas, el uso de aprendizaje supervisado frente a refuerzo, ni posibles tecnicas de regularizacion o destilacion. El nombre del repositorio sugiere que los modelos se entrenaron sobre datos de simulacion de configuraciones de bobinas para stellarators, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo o matematicas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue.
- La unica capacidad plausible, derivada del nombre del repositorio y del formato ONNX, es la evaluacion o prediccion de propiedades de configuraciones de bobinas en el contexto de diseno de stellarators, extremo no confirmado por la model card.

## Casos de uso

- Optimizacion de geometrias de bobinas en stellarators: el modelo podria actuar como sustituto rapido de simulaciones fisicas costosas, permitiendo explorar miles de configuraciones de bobinas en minutos en lugar de horas de simulacion. Requiere validacion previa contra el simulador de referencia.
- Filtrado previo en bucles de optimizacion: integrar el modelo ONNX como etapa de descarte para candidatos con baja puntuacion antes de lanzar simulaciones de alta fidelidad, reduciendo el coste computacional del pipeline.
- Inferencia embebida con ONNX Runtime: al estar en ONNX, puede desplegarse en entornos con CPU o GPU sin dependencias de frameworks de deep learning, lo que facilita su uso en herramientas de escritorio o notebooks de investigacion.
- Prototipado de interfaces de diseno asistido: servir predicciones rapidas en una aplicacion que permita a fisicos ajustar parametros de bobinas y ver una estimacion inmediata de calidad.
- Benchmarking interno de surrogates: usar el modelo como referencia para comparar con otros sustitutos propios en tareas de regresion sobre geometrias de bobinas.
- Reproduccion de experimentos academicos: al ser MIT y estar en ONNX, permite verificar resultados de terceros sin depender de pesos en formatos opacos, siempre que se documente la version y los ficheros exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,6 GB, por lo que el modelo probablemente cabe en GPUs de consumo, pero el tamano real en memoria depende del grafo ONNX y del lote de inferencia.
- GPU recomendadas: no disponible; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 3060 o superior) podria ser suficiente si el modelo es pequeno, pero no hay datos que lo confirmen.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, sin confirmacion documental.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT para grafos ONNX, y conversion opcional a otros runtimes; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a LLMs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos publicos comparables en la misma categoria (surrogates para diseno de bobinas de stellarator) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion, arquitectura, datos de entrenamiento ni evaluacion, lo que impide valorar su calidad o idoneidad.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- El nombre del repositorio sugiere una tarea de fisica de fusion, pero el autor no lo confirma; cualquier uso en produccion exige inspeccionar los ficheros ONNX y validar el modelo contra datos de referencia.
- Riesgo de sesgo y alucinacion no evaluable: al no ser un modelo de lenguaje, los riesgos tipicos de LLM no aplican, pero si los de un surrogate fisico mal calibrado (predicciones fuera de distribucion).
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no hay garantia del autor sobre el modelo.
- Sin idiomas ni contexto documentados: no debe tratarse como un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/proxima-fusion/coilstellaration-models
