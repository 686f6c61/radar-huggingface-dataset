# Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-vision

## Resumen

Qwen3.8-35B-A3B-Distill-oQ5e-vision es un repositorio de pesos cuantizados publicado por el usuario Johneeee en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de precision mixta de un modelo preexistente, generada con la herramienta oQ (oMLX v0.7.0.dev2). El resultado se distribuye exclusivamente en formato MLX safetensors (libreria `mlx`), es decir, orientado a ejecucion en Apple Silicon.

El recuento real de parametros de los ficheros safetensors es de 35.107.181.936 (aproximadamente 35,1 mil millones), con un peso de repositorio de 25,4 GB. La model card indica que el tipo de modelo es `qwen3_5_moe`, con cuantizacion de 5 bits y tamano de grupo 64. El nombre del repositorio sugiere una arquitectura MoE de la familia Qwen3 con unos 3.000 millones de parametros activos, una variante destilada y capacidades de vision, si bien ninguno de estos extremos se confirma en la documentacion disponible.

La relevancia de este repositorio es limitada y debe evaluarse con cautela: no tiene descargas ni likes, no declara licencia ni idiomas soportados, no incluye pipeline y no aporta resultados de evaluacion. Ademas, la fecha de creacion registrada (2026-09-17) es posterior a la fecha habitual de publicacion de este tipo de pesos, lo que constituye una anomalia que conviene verificar antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (segun la model card); detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 35.107.181.936 (dato real de los safetensors) |
| Parametros activos | no disponible (el sufijo "A3B" del nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, precision mixta mediante oQ (oMLX v0.7.0.dev2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 25,4 GB |
| Libreria | mlx |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base. La model card unicamente documenta el proceso de cuantizacion: se aplico cuantizacion de precision mixta con la herramienta oQ, version oMLX v0.7.0.dev2, a 5 bits y con tamano de grupo 64, dando como resultado ficheros MLX safetensors. El tipo de modelo declarado es `qwen3_5_moe`, lo que apunta a una arquitectura de mezcla de expertos (MoE), coherente con el sufijo "A3B" del nombre del repositorio y con la etiqueta `qwen3_5_moe` del propio repositorio.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas del modelo base. Tampoco se especifica que modelo concreto se ha cuantizado (no se identifica el checkpoint de origen ni su revision), ni el proceso de destilacion al que alude el nombre, ni como se ha incorporado la supuesta capacidad de vision. La cuantizacion de precision mixta implica que distintas capas o tensores pueden usar precisiones diferentes dentro del esquema global de 5 bits, pero no se detalla la asignacion por capa.

## Capacidades

- Generacion de texto: no confirmada de forma explicita en la informacion disponible, aunque es esperable en un modelo de la familia Qwen3 MoE; sin verificacion independiente.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: el nombre del repositorio incluye "vision", lo que sugiere capacidades multimodales, pero la model card no lo confirma ni describe el codificador visual.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Ejecucion en Apple Silicon: confirmada por el formato MLX safetensors.

## Casos de uso

- Evaluacion local en Apple Silicon: el formato MLX safetensors permite cargar el modelo con el stack MLX en un Mac con memoria unificada suficiente, lo que resulta adecuado para pruebas de inferencia sin depender de GPUs NVIDIA. Es el caso de uso mas directo y el unico respaldado por el formato publicado.
- Investigacion sobre cuantizacion de precision mixta: el repositorio sirve como muestra de los resultados que produce oQ (oMLX) a 5 bits con group size 64 sobre un modelo MoE de ~35B, util para comparar calidad frente a cuantizaciones uniformes del mismo modelo base.
- Prototipado offline en estacion de trabajo: para desarrolladores que trabajan en un Mac y necesitan un modelo de ~35B sin conexion, siempre que se valide primero la calidad de la cuantizacion.
- Generacion de codigo asistida en local: si el modelo base conserva las capacidades de codigo de la familia Qwen3, podria emplearse en asistentes de edicion en local; no obstante, no hay evidencia publicada que lo confirme en esta version cuantizada.
- Procesamiento de documentos con componente visual: el sufijo "vision" sugiere un posible uso en tareas de imagen y texto, pero la ausencia de documentacion impide confirmar el soporte multimodal ni su calidad.
- Base para conversion a otros formatos: los pesos podrian servir de punto de partida para convertir a GGUF u otros formatos, aunque la cuantizacion de 5 bits ya aplicada limitaria la precision recuperable.
- Benchmarking y auditoria de modelos cuantizados: util como objeto de estudio para medir la degradacion introducida por la cuantizacion en tareas de razonamiento, siempre que se disponga del modelo base original para comparar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MMLU-Pro, LiveBench ni similares), y el repositorio no registra descargas ni likes que permitan inferir validacion por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 22 GB en 5 bits (35,1e9 parametros x 5 bits / 8), coherente con el tamano de repositorio de 25,4 GB, que incluye metadatos y posibles ficheros adicionales.
- Memoria total necesaria: hay que sumar la cache KV y el overhead del runtime. Con contexto corto, un margen de 26-30 GB es razonable; con contextos largos la cifra crece de forma no determinable sin conocer la longitud de contexto ni la configuracion de atencion.
- Apple Silicon: es la plataforma objetivo. Un Mac con 32 GB de memoria unificada queda al limite; 64 GB o mas es la opcion recomendada para trabajar con comodidad. No se garantiza su funcionamiento en equipos de 16 GB.
- GPU NVIDIA: no es una via nativa, ya que el formato es MLX safetensors. Requeriria conversion previa a otro formato (por ejemplo GGUF o safetensors compatibles con PyTorch), proceso no documentado en el repositorio. No se dispone de datos de rendimiento en A100, H100 ni RTX 4090.
- GPU de consumo: no aplica en su formato actual; en un hipotetico caso convertido, 22 GB de pesos exceden la VRAM de una RTX 4090 (24 GB) solo con margen muy ajustado y sin contar cache KV.
- Opciones de despliegue: MLX (mlx-lm), servidor de inferencia de MLX, LM Studio y otras herramientas compatibles con MLX safetensors. vLLM y TGI no admiten este formato sin conversion. llama.cpp u Ollama requeririan convertir a GGUF.
- Latencia y throughput: no disponibles. Dependen por completo del chip Apple Silicon empleado, del ancho de banda de memoria y del contexto, y no hay cifras publicadas por el autor.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el modelo base exacto ni incluye comparaciones con alternativas, por lo que no es posible construir una tabla rigurosa frente a otros modelos de ~35B, otras cuantizaciones del mismo modelo o variantes MoE de la familia Qwen3. Cualquier comparacion requeriria primero identificar el checkpoint de origen.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso, incluido el uso comercial. Debe tratarse como no apto para produccion hasta que el autor la especifique.
- Trazabilidad inexistente: no se identifica el modelo base cuantizado, su revision ni el proceso de destilacion al que alude el nombre, lo que impide reproducir o auditar el resultado.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 5 bits con precision mixta puede introducir perdida de calidad frente al modelo original, especialmente en matematicas, codigo y razonamiento de varios pasos. No hay evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay datos especificos sobre la tasa de alucinacion de esta version.
- Sesgos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni se han publicado analisis de sesgo.
- Idiomas: no declarados. No se puede asumir un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Capacidad de vision sin confirmar: el termino "vision" aparece solo en el nombre del repositorio; la model card no documenta ningun componente multimodal.
- Portabilidad limitada: el formato MLX safetensors restringe el uso a Apple Silicon o a un proceso de conversion no documentado.
- Anomalia temporal: la fecha de creacion registrada (2026-09-17) es posterior a la habitual para este tipo de publicaciones, lo que aconseja verificar la procedencia del repositorio.
- Ausencia de validacion comunitaria: cero descargas y cero likes, sin issues ni discusiones conocidas que respalden su calidad.
- Sin garantias de soporte: autor unico sin historial verificable en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e-vision
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos corresponden a paginas de inicio de sesion de servicios de Google y no guardan relacion con el modelo.
