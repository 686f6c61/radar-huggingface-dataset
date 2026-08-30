# PollardWeights/Qwen2.5-7B-Instruct-Pollard

## Resumen

Qwen2.5-7B-Instruct-Pollard es una familia de cuantizaciones GGUF del modelo Qwen2.5-7B-Instruct, generadas por PollardWeights con su herramienta Pollard Weights. El objetivo es ofrecer una escalera completa de cuantizaciones guiadas por imatrix (importance matrix) para maximizar la calidad por byte, más una versión insignia de precisión mixta de clase 1-bit denominada IQ1_KT, que comprime el cuerpo de las capas FFN a 1 bit mientras protege la atención y los residual writers.

El modelo base, Qwen2.5-7B-Instruct, es un transformer de 7.000 millones de parámetros desarrollado por Alibaba, entrenado con hasta 18 billones de tokens y con soporte de contexto de hasta 128.000 tokens. Esta versión cuantizada mantiene la licencia Apache-2.0 y permite ejecutar el modelo en hardware modesto, desde una GPU de 4 GB hasta incluso CPU, con una degradación controlada de la perplejidad.

La relevancia actual radica en que ofrece una opción de despliegue local de un modelo instructivo de calidad media-alta con tamaños de archivo que van desde 1,90 GB (IQ1_KT) hasta 5,82 GB (Q6_K), cubriendo desde entornos muy restringidos hasta escenarios casi sin pérdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 7.610 millones (7,61B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (modelo base); la cuantizacion se genero con contexto 2048 para imatrix |
| Tipos de cuantizacion | Q6_K, IQ4_XS, IQ3_S, IQ1_KT (trellis de precision mixta) |
| Idiomas soportados | Ingles (segun model card); el modelo base soporta multilingue (chino, ingles, frances, espanol, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en esta version) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer denso con arquitectura Qwen2.5, que incluye attention con RoPE, normalizacion RMSNorm y activacion SwiGLU. Fue preentrenado con hasta 18 billones de tokens y posteriormente ajustado con instrucciones (instruction tuning) mediante un proceso de alineacion que incluye RLHF y DPO, segun la documentacion oficial de Qwen.

La cuantizacion realizada por PollardWeights no modifica la arquitectura, sino que comprime los pesos. Los archivos K-quants (Q6_K, IQ4_XS, IQ3_S) se generaron con guia de imatrix calculada sobre 145 fragmentos de WikiText-2 con contexto 2048. El archivo IQ1_KT es un trellis de precision mixta: el cuerpo de las capas FFN se cuantiza a 1 bit, mientras que las proyecciones de atencion y los residual writers se mantienen en mayor precision. Este enfoque mixto reduce la perplejidad en un 14% respecto a un IQ1_KT uniforme (PPL 10,23 frente a 11,86) y mejora la divergencia KL media en un 22%.

## Capacidades

- Generacion de texto conversacional: el modelo base esta optimizado para chat y sigue el formato ChatML.
- Razonamiento y conocimiento general: hereda las capacidades del Qwen2.5-7B-Instruct, que incluyen razonamiento logico, conocimiento factual y comprension lectora.
- Generacion de codigo y matematicas: el modelo base muestra un rendimiento notable en tareas de programacion y calculo, segun los benchmarks publicados por Qwen.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-7B-Instruct incluye soporte nativo para llamadas a herramientas, aunque la model card de esta cuantizacion no lo menciona explicitamente; se asume que la cuantizacion no elimina esta capacidad.
- Capacidades multilingues: aunque la model card indica "en", el modelo base soporta mas de 29 idiomas, incluyendo espanol, frances, aleman, arabe, etc. La cuantizacion no altera el vocabulario ni la capacidad multilingue.
- Modo de razonamiento extendido: el modelo base no tiene un modo "thinking" explicito, pero puede generar cadenas de razonamiento si se le pide.

## Casos de uso

- Asistente conversacional local en CPU: con el archivo IQ4_XS (3,93 GB) se puede ejecutar en un portatil sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo respuestas fluidas para consultas generales.
- Chatbot de atencion al cliente en entornos con recursos limitados: el IQ3_S (3,26 GB) cabe en una GPU de 4 GB y permite desplegar un sistema de soporte basico con contexto de hasta 128K tokens (aunque la cuantizacion se optimizo con 2048, el modelo base soporta mas).
- Generacion de codigo asistida en entornos offline: el Q6_K (5,82 GB) mantiene una perplejidad casi identica al modelo original (6,55 frente a 6,52) y puede usarse para autocompletar o explicar fragmentos de codigo en una estacion de trabajo con 8 GB de VRAM.
- Prototipado rapido de agentes con tool calling: el modelo base soporta function calling, y la cuantizacion IQ4_XS permite probar pipelines de agentes en una GPU consumer sin necesidad de un servidor dedicado.
- Educacion y divulgacion: el IQ1_KT (1,90 GB) es util para demostraciones en hardware muy limitado (Raspberry Pi con suficiente RAM, o portatiles antiguos) donde otros modelos de 7B no caben.
- Investigacion en cuantizacion: la comparacion entre los distintos niveles (Q6_K, IQ4_XS, IQ3_S, IQ1_KT) sirve como banco de pruebas para estudiar el equilibrio entre compresion y calidad, especialmente el comportamiento del trellis de precision mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo proporciona metricas de perplejidad (PPL) y divergencia KL media (Mean KLD) sobre WikiText-2, con referencia f16 PPL 6,52:

| Archivo | PPL (WikiText-2) | Mean KLD | Tamano |
|---|---:|---:|---:|
| Q6_K | 6,55 | 0,0035 | 5,82 GB |
| IQ4_XS | 6,66 | 0,024 | 3,93 GB |
| IQ3_S | 6,96 | 0,075 | 3,26 GB |
| IQ1_KT | 10,23 | 0,537 | 1,90 GB |

La comparacion interna indica que el IQ1_KT supera a un IQ1_KT uniforme en PPL (−14%), Mean KLD (−22%) y top-1 accuracy (+4,2 puntos). No hay datos comparativos con otras cuantizaciones de la misma familia (por ejemplo, Q4_K_M o Q5_K_M de llama.cpp) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del archivo da una referencia aproximada. Para IQ4_XS (3,93 GB) se necesita al menos 4 GB de VRAM; para IQ3_S (3,26 GB) unos 4 GB; para IQ1_KT (1,90 GB) unos 2 GB; para Q6_K (5,82 GB) unos 6-8 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal y suficiente VRAM. Ejemplos: RTX 3060 (12 GB) para Q6_K, RTX 4060 (8 GB) para IQ4_XS, GTX 1650 (4 GB) para IQ3_S, y cualquier GPU con 2 GB para IQ1_KT.
- En CPU: los archivos GGUF se pueden ejecutar con llama.cpp en CPU, aunque la velocidad dependera del numero de nucleos y de la RAM disponible. El IQ1_KT es viable en sistemas con 4 GB de RAM.
- Opciones de despliegue: llama.cpp (todos los archivos), ik_llama.cpp (necesario para IQ1_KT, aunque tambien carga en llama.cpp estandar), Ollama (via `ollama run hf.co/PollardWeights/Qwen2.5-7B-Instruct-Pollard`), LM Studio.
- Latencia y throughput: no se han publicado mediciones especificas. En una GPU moderna (RTX 4090) se espera una generacion de 30-50 tokens/s para IQ4_XS; en CPU, 5-15 tokens/s dependiendo del hardware.

## Comparativa con modelos similares

La comparacion directa con otras cuantizaciones del mismo modelo base no esta disponible en la informacion proporcionada. Se puede comparar con el modelo original en f16:

| Modelo | Parametros | Contexto | Licencia | Formato | PPL (WikiText-2) |
|---|---|---:|---|---|---:|
| Qwen2.5-7B-Instruct (f16) | 7,61B | 128K | Apache-2.0 | safetensors | 6,52 |
| Qwen2.5-7B-Instruct-Pollard (Q6_K) | 7,61B | 128K (base) | Apache-2.0 | GGUF | 6,55 |
| Qwen2.5-7B-Instruct-Pollard (IQ4_XS) | 7,61B | 128K (base) | Apache-2.0 | GGUF | 6,66 |
| Qwen2.5-7B-Instruct-Pollard (IQ1_KT) | 7,61B | 128K (base) | Apache-2.0 | GGUF | 10,23 |

No se dispone de datos de otras cuantizaciones de la comunidad (por ejemplo, las de TheBloke o unsloth) para una comparativa mas amplia.

## Limitaciones y advertencias

- El archivo IQ1_KT requiere el fork ik_llama.cpp para un funcionamiento optimo; aunque carga en llama.cpp estandar, el rendimiento puede verse afectado y no se garantiza la misma calidad.
- La cuantizacion IQ1_KT presenta una perdida significativa de calidad (PPL 10,23 frente a 6,52 del f16) y puede producir respuestas menos coherentes en tareas complejas. Se recomienda usar `--repeat-penalty 1.15` para conversacion en este nivel.
- La model card indica idioma "en" aunque el modelo base es multilingue; la cuantizacion no elimina el soporte multilingue, pero no se ha validado especificamente en otros idiomas.
- Los datos de imatrix se calcularon con contexto 2048, por lo que el rendimiento con contextos mucho mayores (por ejemplo, 128K) puede degradarse ligeramente en los K-quants.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, etc.) para esta cuantizacion, por lo que el impacto real en tareas especificas es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base cumple con los terminos de Qwen (tambien Apache-2.0).
- El proyecto Pollard Weights es de un unico autor y no tiene una comunidad amplia; la replicacion de los resultados esta invitada pero no verificada de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PollardWeights/Qwen2.5-7B-Instruct-Pollard
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Pollard Weights: https://github.com/WestWaters/pollard-weights
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Pagina de Qwen2.5 en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-7B-Instruct
- Ficha de Qwen2.5 7B Instruct en Open Source AI Models: https://opensourceaimodels.net/models/qwen2-5-7b-instruct
- Pagina de Qwen2.5 7B Instruct en Ollama: https://ollama.com/library/qwen2.5:7b-instruct
