# exalandru/DarkGlimmer-30B-oQ4e

## Resumen

DarkGlimmer-30B-oQ4e es una cuantizacion mixta de precision del modelo DarkGlimmer-30B, publicada por el usuario exalandru en Hugging Face. Se trata de una conversion al formato MLX (Apple Silicon) realizada con la herramienta oQ de oMLX v0.8.4, que aplica cuantizacion de precision mixta por tensor en lugar de una cuantizacion uniforme de 4 bits. El checkpoint resultante ocupa 20,6 GB en disco y presenta un promedio efectivo de 5,523 bits por peso.

El modelo base es UltimateIntent/DarkGlimmer-30B-GGUF, un modelo de aproximadamente 29.800 millones de parametros que, segun la descomposicion de pesos publicada, incluye un componente de vision de 1.922 millones de parametros ademas del modelo de lenguaje de 27.855 millones. La arquitectura subyacente se etiqueta como muse_glimmer en los tags de Hugging Face, aunque no se dispone de documentacion adicional sobre ella en la informacion proporcionada.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion derivado, con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva del modelo original ni resultados de benchmarks. Su interes practico reside en que permite ejecutar un modelo de casi 30.000 millones de parametros en equipos Apple Silicon con memoria unificada, gracias al formato MLX y a la distribucion no uniforme de bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag del modelo base: muse_glimmer) |
| Parametros totales | 29.776.626.688 (29,777B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX con precision mixta oQ: affine 4-bit grupo 64, affine 5-bit grupo 64, affine 6-bit grupo 64 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

Desglose de la cuantizacion segun la model card:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 21,787B | 73,167% | 11,413 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 3,778B | 12,688% | 2,419 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 2,289B | 7,687% | 1,732 GiB | 6,50 |
| BF16 | 1,923B | 6,459% | 3,582 GiB | 16,00 |
| Total | 29,777B | 100% | 19,147 GiB | 5,523 |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 27,855B | 16,715 GB / 15,567 GiB |
| Vision | 1,922B | 3,844 GB / 3,580 GiB |
| Total | 29,777B | 20,558 GB / 19,147 GiB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El tag muse_glimmer sugiere una familia de modelos con ese nombre, pero no se detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida. El recuento de parametros (29,777B) y la presencia de un modulo de vision de 1,922B indican un modelo multimodal con encoder visual, pero se desconoce el mecanismo de fusion entre modalidades.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion tecnica verificable es la relativa a la cuantizacion: oMLX v0.8.4 con oQ aplica precision mixta asignando 4 bits a la mayoria de tensores (73,167% de los pesos), 5 y 6 bits a una fraccion menor y manteniendo en BF16 un 6,459% de los pesos, presumiblemente capas sensibles a la cuantizacion (embeddings, normas o cabezas de atencion). El resultado es un checkpoint de 19,147 GiB con 5,523 bits/peso efectivos, frente a los aproximadamente 59,5 GB que ocuparia el modelo en BF16.

## Capacidades

- Generacion de texto: el modelo de lenguaje de 27,855B parametros permite generacion autoregresiva, aunque no se documentan capacidades especificas.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 1,922B parametros en BF16, lo que indica soporte de entrada de imagenes, si bien no se detalla la tarea (captioning, VQA, OCR u otras).
- Razonamiento y codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado en la ficha de Hugging Face.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y los 19,147 GiB de pesos permiten ejecutar el modelo en Macs con memoria unificada de 32 GB o superior, usando la libreria mlx o mlx-lm. Es el caso de uso principal de este artefacto, ya que la cuantizacion esta disenada especificamente para el backend de Apple.
- Prototipado de aplicaciones multimodales en local: al incluir un encoder visual, el modelo puede emplearse para experimentar con pipelines imagen-texto sin depender de APIs externas, siempre que se valide su calidad real con pruebas propias.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores que estudien el impacto de la precision mixta (oQ) frente a cuantizaciones uniformes de 4 bits pueden usar este checkpoint como referencia, comparando su salida con la del modelo base en GGUF.
- Despliegue en estaciones de trabajo Mac para tareas de generacion de texto de proposito general: con casi 30B de parametros, el modelo ofrece mas capacidad que alternativas de 7-13B, a costa de mayor consumo de memoria y menor velocidad.
- Fine-tuning ligero o experimentacion con adaptadores: el checkpoint en safetensors MLX puede servir como punto de partida para LoRA sobre el modelo de lenguaje, aunque la cuantizacion mixta complica la fusion de adaptadores y requeriria validacion.
- Docencia y demostraciones de cuantizacion: la model card incluye un desglose detallado de la distribucion de bits que resulta util como material didactico sobre tecnicas de compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de tareas multimodales, ni para el modelo base ni para esta cuantizacion. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 19,147 GiB (20,558 GB). Para inferencia hay que sumar la cache KV y el overhead del runtime; con contexto corto, un equipo con 24 GB de memoria unificada queda muy justo, y 32 GB es el minimo practico recomendado. Para contextos largos conviene disponer de 48-64 GB.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin conversion previa a otro formato.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en Mac Studio y MacBook Pro con 32 GB o mas de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) no se puede cargar tal cual en MLX; haria falta convertir a GGUF u otro formato y probablemente una cuantizacion adicional.
- Opciones de despliegue: mlx y mlx-lm son las vias naturales. Para otros backends habria que reconvertir los pesos, por ejemplo a GGUF para llama.cpp u Ollama, o a safetensors estandar para vLLM o TGI, proceso no documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DarkGlimmer-30B-oQ4e (este) | 29,777B | no disponible | MLX safetensors, 5,523 bits/peso | apache-2.0 | Hugging Face, 0 descargas |
| UltimateIntent/DarkGlimmer-30B-GGUF (base) | 29,777B (presumiblemente) | no disponible | GGUF | no disponible en la informacion | Hugging Face |
| Alternativas de ~30B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria. La unica comparacion documentada es con el modelo base en GGUF, del que este checkpoint deriva y cuya licencia y especificaciones no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: aunque la precision mixta preserva en BF16 un 6,459% de los pesos, el 73,167% esta a 4 bits, lo que puede degradar tareas sensibles como matematicas, codigo o razonamiento de varios pasos. No hay evaluaciones publicadas que cuantifiquen esa perdida.
- Ausencia de documentacion del modelo base: se desconoce el origen de los datos de entrenamiento, los sesgos potenciales y las limitaciones del modelo original, lo que impide evaluar riesgos de alucinacion o sesgo con fundamento.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no se puede garantizar un rendimiento aceptable en castellano ni en ningun otro idioma concreto.
- Licencia: el artefacto declara apache-2.0, pero la licencia del modelo base (UltimateIntent/DarkGlimmer-30B-GGUF) no se especifica en la informacion disponible. Antes de un uso comercial conviene verificar que la licencia del modelo original permite la redistribucion y el uso derivado.
- Dependencia de Apple Silicon: el formato MLX limita el uso a hardware Apple; no es un artefacto portable a CUDA sin conversion.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni discusiones de la comunidad. No hay evidencia de validacion por terceros.
- Fecha de creacion: la ficha indica 2026-11-27, fecha que conviene contrastar antes de tomar el artefacto como referencia estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exalandru/DarkGlimmer-30B-oQ4e
- Modelo base en Hugging Face: https://huggingface.co/UltimateIntent/DarkGlimmer-30B-GGUF
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
