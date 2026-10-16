# ml-resources/Spark-Scilit-X1-13B

## Resumen

Spark-Scilit-X1-13B es un modelo de lenguaje de 13.264.901.120 parametros desarrollado por iFLYTEK y orientado especificamente a tareas de investigacion academica y literatura cientifica. La ficha que nos ocupa es un espejo no oficial publicado en HuggingFace por el usuario ml-resources, que replica el repositorio original iflytek/Spark-Scilit-X1-13B alojado en ModelScope, manteniendo la licencia Apache 2.0. El modelo deriva de la generacion mas reciente del modelo fundacional de iFLYTEK y ha sido ajustado sobre tareas centrales extraidas de literatura cientifica.

Arquitectonicamente es un transformer decoder-only de 40 capas, dimension oculta de atencion de 5120, 40 cabezas de atencion con Grouped-Query Attention (GQA), activacion GeLU y un vocabulario de 130.000 tokens. Soporta una longitud de contexto de 32K tokens. Su rasgo diferencial es un marco unificado de razonamiento que combina cadena de pensamiento larga (CoT) con teoria de proceso dual, de modo que puede operar en modo reactivo (rapido) o deliberativo (lento), exponiendo el proceso de pensamiento antes de la respuesta final.

Su relevancia actual radica en que ataca un nicho concreto, el asistente de investigacion (lectura asistida de articulos, traduccion academica, pulido de ingles cientifico y generacion de revisiones), con un tamano de 13B que es desplegable en una sola GPU de 80 GB. No obstante, conviene senalar que el repositorio acumula 0 descargas y 0 likes, que no hay resultados en benchmarks estandar publicados y que la evaluacion se limita a puntuaciones MOS de cuatro tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (GQA) y activacion GeLU |
| Parametros totales | 13.264.901.120 (~13B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (32K); ventana de 32K |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y el ejemplo oficial usa bfloat16 |
| Idiomas soportados | no disponible; los ejemplos de la model card estan en chino e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 53,1 GB) |
| Numero de capas | 40 |
| Dimension oculta de atencion | 5120 |
| Cabezas de atencion | 40 |
| Tamano de vocabulario | 130.000 |
| Codigo adicional | requiere custom_code (tokenizer SparkTokenizer) |
| Region declarada | us |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con Grouped-Query Attention, 40 capas, dimension de atencion de 5120 y 40 cabezas, con funcion de activacion GeLU y un vocabulario de 130.000 tokens. La informacion disponible no detalla el numero de cabezas KV ni la implementacion posicional ni el mecanismo exacto de atencion mas alla de GQA. El rasgo arquitectonico mas destacado segun el autor es un marco unificado de razonamiento que combina cadena de pensamiento larga con teoria de proceso dual: el modo reactivo responde directamente, mientras que el modo deliberativo genera primero un bloque de pensamiento delimitado por los tokens especiales `<unused6>` y `<unused7>`, y solo despues emite la respuesta final.

En cuanto al entrenamiento, la model card indica que se apoya en la ultima generacion del modelo fundacional de iFLYTEK y que se ha entrenado sobre tareas centrales derivadas de literatura cientifica, con corpora cientificos de alta calidad a gran escala, usando tecnicas de entrenamiento multi-etapa para preservar tanto la capacidad cientifica como el rendimiento general. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento general, con rendimiento declarado como solido en tareas no cientificas gracias al entrenamiento multi-etapa.
- Razonamiento profundo en dos modos: reactivo (respuesta directa) y deliberativo (cadena de pensamiento explicita entre `<unused6>` y `<unused7>`).
- Lectura asistida de articulos cientificos (Paper Assisted Reading).
- Traduccion academica, con ejemplos de traduccion de ingles a chino de fragmentos de papers.
- Pulido de ingles academico (English Polishing).
- Generacion de revisiones o informes de revision cientifica (Review Generation).
- Comprension de terminologia especifica de dominio y generacion de expresiones academicamente apropiadas.
- Capacidades multilingues: no documentadas explicitamente; los ejemplos de uso trabajan con entradas en ingles y salidas en chino.
- Tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso formal: no disponible; el modo deliberativo es lo mas cercano a razonamiento multi-paso.
- Vision, audio u otras modalidades: no disponible (no se declaran).

## Casos de uso

- Traduccion de literatura cientifica: el modelo esta ajustado para traducir fragmentos de papers preservando terminologia tecnica, como demuestra el ejemplo oficial que traduce un texto sobre plataformas SERS de ingles a chino con un contexto de 32K tokens que permite procesar secciones extensas de una vez.
- Lectura asistida de articulos: puede resumir, explicar y responder preguntas sobre un paper completo cargado en el contexto de 32.768 tokens, util para investigadores que necesitan una primera pasada rapida sobre literatura nueva.
- Pulido de ingles academico: revision de manuscritos propios antes de enviarlos a revista, corrigiendo estilo y adecuacion al registro cientifico, tarea en la que obtuvo 4,22 de MOS.
- Generacion de revisiones por pares preliminares: produccion de informes de revision estructurados y criticas fundamentadas sobre un manuscrito, util como borrador interno antes de la revision humana.
- Asistente de tesis y trabajos de grado: acompanamiento en la redaccion academica, reformulacion de secciones y sugerencia de expresiones propias del genero cientifico.
- Apoyo en revision de literatura para revisiones sistematicas: extraccion y sintesis de hallazgos de multiples abstracts o secciones completas dentro de la ventana de contexto.
- Modo deliberativo para problemas complejos: cuando se requiere analisis profundo de un problema cientifico, activar el modo de pensamiento lento para obtener una traza de razonamiento explicita antes de la conclusion.
- Documentacion tecnica en dominio cientifico: redaccion y adaptacion de informes tecnicos con terminologia especializada, aprovechando el vocabulario de 130.000 tokens.

## Benchmarks y rendimiento

Los unicos resultados publicados son puntuaciones MOS (Mean Opinion Score) medias sobre evaluacion humana en escala 1-5, en modo zero-shot y con protocolo consistente. El modelo se evaluo en una unica GPU NVIDIA A100 de 80 GB y las lineas base se evaluaron a traves de sus APIs oficiales.

| Tarea | Metrica | Spark-Scilit-X1-13B | Qwen3-32B | Qwen3-Next-80B-A3B | DeepSeek-R1 | O3 |
|---|---|---|---|---|---|---|
| Lectura asistida de papers | MOS | 4,04 | 3,98 | 4,06 | 4,01 | 4,1 |
| Traduccion academica | MOS | 4,18 | 4,04 | 4,08 | 4,12 | 4,22 |
| Pulido de ingles | MOS | 4,22 | 4,11 | 4,2 | 3,98 | 4,28 |
| Generacion de revisiones | MOS | 3,88 | 3,5 | 3,7 | 3,68 | 4,01 |

No se han publicado resultados en benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las puntuaciones MOS son evaluaciones humanas subjetivas y no permiten una comparacion directa con metricas objetivas de otros modelos.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los 13.264.901.120 parametros ocupan aproximadamente 26,5 GB solo en pesos, a los que hay que sumar activaciones y cache KV. En la practica se necesita una GPU de 40 GB o superior.
- GPU recomendadas: NVIDIA A100 de 80 GB (es la configuracion usada en la evaluacion oficial del modelo), A100 de 40 GB o H100. En configuraciones de 40 GB conviene vigilar el margen para el contexto de 32K.
- Cache KV: el numero de cabezas KV de la GQA no se especifica en la informacion disponible, por lo que no es posible calcular con precision el consumo a maxima longitud de contexto.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bfloat16 sin offloading o cuantizacion. No se ha publicado ninguna version cuantizada (GGUF, AWQ, GPTQ) en la informacion disponible, por lo que el uso en GPU de consumo requeriria cuantizar los pesos por cuenta propia.
- Opciones de despliegue: la ruta documentada es HuggingFace Transformers con `AutoModelForCausalLM`, `torch_dtype=bfloat16` y `device_map="auto"`, con el tokenizer personalizado `SparkTokenizer` e instalacion previa del paquete (`pip install .`) en Python 3.10 o superior.
- vLLM, llama.cpp, Ollama y TGI: no documentados en la informacion disponible; al requerir custom_code y un tokenizer propio, la integracion en estos motores no esta garantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card proporciona una comparacion contra modelos de mayor tamano evaluados por API. La siguiente tabla recoge los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Acceso | MOS medio en las 4 tareas |
|---|---|---|---|---|---|
| Spark-Scilit-X1-13B | 13B | 32K | Apache 2.0 | Pesos abiertos (espejo no oficial) | 4,08 |
| Qwen3-32B | 32B (segun denominacion) | no disponible | no disponible | API oficial | 3,91 |
| Qwen3-Next-80B-A3B | 80B totales, 3B activos (segun denominacion) | no disponible | no disponible | API oficial | 4,01 |
| DeepSeek-R1 | no disponible en la informacion | no disponible | no disponible | API oficial | 3,95 |
| O3 | no disponible en la informacion | no disponible | no disponible | API oficial | 4,15 |

Spark-Scilit-X1-13B obtiene la mejor puntuacion en generacion de revisiones (3,88) frente a Qwen3-32B (3,5) y Qwen3-Next-80B-A3B (3,7), y supera a DeepSeek-R1 en pulido de ingles (4,22 frente a 3,98). O3 lidera en las cuatro tareas. La ventaja principal del modelo es el tamano: compite con modelos de 32B, 80B y APIs propietarias usando solo 13B de parametros y licencia Apache 2.0.

## Limitaciones y advertencias

- El repositorio es un espejo no oficial publicado por un tercero (ml-resources), no una publicacion de los autores originales. La ficha indica 0 descargas y 0 likes, lo que sugiere nula validacion por parte de la comunidad.
- No se han publicado resultados en benchmarks estandarizados; la unica evidencia de rendimiento son puntuaciones MOS de evaluacion humana, subjetivas y sobre cuatro tareas muy especificas.
- Riesgo de alucinacion: no cuantificado ni documentado. En tareas de sintesis de literatura cientifica el riesgo de citas o afirmaciones inventadas es alto y requiere verificacion humana.
- Idiomas: no se declara una lista oficial. Los ejemplos de la model card son de ingles a chino, por lo que el soporte de otras lenguas, incluido el castellano, es incierto y no esta validado.
- Requiere `trust_remote_code` y un tokenizer propio (`SparkTokenizer`), lo que anade superficie de riesgo en produccion y complica la integracion con motores de inferencia estandar.
- El repositorio ocupa 53,1 GB para 13B de parametros, un tamano elevado que sugiere pesos duplicados o en varios formatos; conviene revisar el contenido antes de descargarlo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al tratarse de un espejo no oficial conviene verificar los terminos en el repositorio original de ModelScope antes de un despliegue comercial.
- No se documentan capacidades de tool calling, agentes, vision ni audio, por lo que no debe asumirse su disponibilidad.
- La fecha de creacion del repositorio (2026-10-15) es posterior a la de la mayoria de modelos comparados y el proyecto no muestra senales de mantenimiento activo.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/ml-resources/Spark-Scilit-X1-13B
- ModelScope (repositorio original de iflytek): https://www.modelscope.cn/models/iflytek/Spark-Scilit-X1-13B
- Busqueda web: no se encontraron enlaces relevantes al modelo, paper tecnico, blog o repositorio adicional en los resultados disponibles.
