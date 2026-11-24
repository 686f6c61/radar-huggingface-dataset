# anik-jha/Qwen3.8-Flash-Next-16GB-GGUF

## Resumen

Qwen3.8-Flash-Next-16GB-GGUF es una cuantización GGUF de 2 bits del modelo Qwen3.8-Flash-Next, publicada por el usuario anik-jha. El objetivo es claro: hacer que un modelo de mezcla de expertos (MoE) de 35.571.606.400 parámetros quepa y funcione en una GPU de 16 GB, algo imposible con las cuantizaciones convencionales. Para lograrlo, el autor aplica una poda de expertos (expert pruning) basada en el método REAP: de los 512 expertos por capa del modelo original, conserva únicamente los 128 mejor puntuados.

La propuesta no se limita a comprimir: incorpora una "recuperación" (recovery) que reintroduce dos expertos podados por capa (hasta 130 en total) y los reentrena, además de un adaptador LoRA que corrige las desviaciones respecto al modelo sin podar en 4 bits. El resultado es un archivo de 12,1 GB más un adaptador de 1,8 GB que, junto a una tabla n-gram de 26,8 GB que permanece en disco, permite ejecutar el modelo con 32K de contexto en 14,6 GB de VRAM.

Es relevante ahora porque demuestra que es viable llevar modelos MoE de gran tamaño a hardware de consumo mediante una combinación de poda selectiva, cuantización agresiva y recuperación de precisión, con una pérdida de rendimiento medida y acotada en tareas de código. La licencia es qwen-community-1.0, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 512 expertos por capa, 10 activos por token en el modelo base; podado a 128 expertos por capa (130 con la recuperación) |
| Parámetros totales | 35.571.606.400 (modelo base); el archivo GGUF cuantizado ocupa 12,1 GB en GPU |
| Parámetros activos | no disponible (el modelo base activa 10 de 512 expertos por token; no se especifica el recuento de parámetros activos) |
| Longitud de contexto | 32K medido con 14,6 GB de VRAM (8-bit KV cache); 128K requiere 16,5 GB |
| Tipos de cuantización | IQ2_XXS (28% de los pesos), Q2_0 (28%), resto en formatos de 2 bits; media de 2,9 bits por peso; pesos de expertos a 2,31 bits de media |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp), con adaptador LoRA separado y tabla n-gram en archivo aparte |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 512 subredes expertas por capa, de las que se activan 10 por token. La cuantización parte del archivo UD-IQ1_M de unsloth, del que se conservan los 128 expertos mejor puntuados por capa según un método de ranking (REAP). Esos expertos conservados son idénticos byte a byte a los del archivo original. Sobre esa base se aplica una "recuperación" en dos fases: se reintroducen dos expertos podados por capa (130 en total) y se reentrenan, y se entrena un adaptador LoRA que acerca las salidas de las capas podadas en 2 bits a las del modelo sin podar en 4 bits. El adaptador se carga en tiempo de ejecución mediante `--lora-scaled` en llama.cpp.

La innovación técnica principal es la combinación de poda de expertos con recuperación mediante reentrenamiento y adaptador, pensada para mitigar el fallo característico de los modelos podados tan agresivamente: la repetición de texto durante el razonamiento. El paquete incluye además dos flags de muestreo (`--presence-penalty 1.5 --repeat-last-n 20480`) y un cliente de parada y regeneración (`redraw.py`) que detiene una respuesta que empieza a repetirse y la vuelve a generar con otra semilla, hasta tres intentos. Todas las métricas publicadas se midieron con las tres piezas activas. No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento: el modelo está orientado explícitamente a tareas de código y razonamiento, según los tags del repositorio.
- Generación de código: resuelve problemas de programación de competición y funciones cortas en Python, con resultados medidos en LiveCodeBench, HumanEval+ y MBPP+.
- Conversación multi-turno: pipeline text-generation con soporte conversacional.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia estándar.
- Ejecución en llama.cpp con soporte de LoRA en tiempo de ejecución y lectura de tabla n-gram desde disco.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de programación en estaciones de trabajo con GPU de 16 GB: el modelo permite autocompletar y generar funciones Python en local, sin depender de la nube, con un rendimiento medido de 85,4% en HumanEval+ y 72,5% en MBPP+ usando el cliente de parada y regeneración.
- Resolución de problemas de competición y entrevistas técnicas: con 93 de 130 problemas resueltos en LiveCodeBench (85 en el primer intento), es adecuado para practicar o generar soluciones a problemas de dificultad fácil y media.
- Entornos con restricciones de memoria: al necesitar 14,6 GB de VRAM con 32K de contexto, encaja en tarjetas de 16 GB donde un MoE de 35.500 millones de parámetros no cabría de otra forma.
- Prototipado de pipelines de código en CI/CD: el adaptador y los flags de muestreo se integran en llama.cpp, lo que permite automatizar la generación y validación de parches en un servidor con GPU modesta.
- Investigación sobre poda y cuantización de MoE: el repositorio documenta de forma separada el efecto de la poda, la cuantización a 2 bits y la recuperación, lo que lo convierte en un caso de estudio reproducible para experimentos de compresión.
- Despliegue de bajo coste con contexto largo: la tabla n-gram permanece en disco y solo se leen 16 filas por token, de modo que el proceso servidor retiene 0,9 GB de RAM además de la VRAM, lo que facilita su ejecución en máquinas con poca memoria.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación real entre un build de 24 GB en 4 bits y este de 16 GB en 2 bits sobre el mismo conjunto de problemas.

## Benchmarks y rendimiento

| Benchmark | Este repo (2 bits) | Build de 24 GB (4 bits) |
|---|---|---|
| LiveCodeBench, 130 problemas fáciles y medios (hasta 3 intentos) | 93 resueltos (85 en el primer intento) | 109 resueltos (98 en el primer intento) |
| LiveCodeBench, problemas fáciles (63) | 61 resueltos | 61 resueltos |
| HumanEval+, 164 problemas Python (con redraw) | 85,4% | 147 de 164 |
| HumanEval+, 164 problemas Python (primer intento) | 81,7% | no disponible |
| MBPP+, 378 problemas Python (con redraw) | 72,5% | 285 de 378 |
| MBPP+, 378 problemas Python (primer intento) | 70,6% | no disponible |

Datos adicionales de la model card: una poda simple sin recuperación resolvió 63 de 130 en LiveCodeBench a 4 bits (59 en el primer intento); la recuperación elevó esa cifra a 109 (98 en el primer intento). En otros 120 problemas, la poda simple a 2 bits resolvió 31 frente a 53 de la poda simple a 4 bits. La velocidad medida en una DGX Spark fue de 23 tokens por segundo para un usuario.

## Requisitos de hardware

- VRAM estimada: 14,6 GB con 32K de contexto y KV cache de 8 bits; 15,1 GB con KV cache de 16 bits; 16,5 GB con 128K de contexto y KV cache de 8 bits. Tras generar una respuesta, el uso sube a 14,7 GB (32K, 8 bits).
- Composición en GPU: archivo del modelo de 12,1 GB más adaptador de 1,8 GB.
- La tabla n-gram de 26,8 GB no ocupa VRAM: llama.cpp la deja en disco y lee 16 filas por token; las filas leídas quedan en la caché de ficheros del sistema operativo.
- RAM del proceso servidor: 0,9 GB tras una respuesta (32K, 8 bits).
- GPU recomendadas: cualquier tarjeta con al menos 16 GB de VRAM para 32K de contexto; para 128K se necesitan al menos 16,5 GB. El autor midió en una NVIDIA DGX Spark (memoria unificada CPU/GPU), no en una tarjeta de 16 GB dedicada.
- Cabe en GPU de consumo de 16 GB (por ejemplo, la gama RTX x080 de 16 GB), siempre que se disponga de espacio en disco para la tabla de 26,8 GB.
- Opciones de despliegue: llama.cpp, con soporte de `--lora-scaled`, `--presence-penalty`, `--repeat-last-n` y el cliente `redraw.py` incluido. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 23 tokens por segundo para un usuario en la DGX Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench (130) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (2 bits, 16 GB) | 35,57 B totales, 130 expertos/capa | 32K (14,6 GB VRAM) | 93 (85 primer intento) | qwen-community-1.0 | Hugging Face, GGUF |
| Qwen3.8-Flash-Next-24GB-GGUF (4 bits) | 35,57 B totales, 130 expertos/capa | no disponible | 109 (98 primer intento) | qwen-community-1.0 | Hugging Face, GGUF |
| Qwen3.8-Flash-Next (base, sin podar) | 35,57 B totales, 512 expertos/capa | no disponible | no disponible | qwen-community-1.0 | Hugging Face |

La comparación directa entre los dos builds de anik-jha aísla el efecto de la cuantización: a igualdad de recuperación, el paso de 4 a 2 bits cuesta 16 problemas en LiveCodeBench. No se dispone de datos de benchmarks del modelo base sin podar en la información proporcionada.

## Limitaciones y advertencias

- La poda elimina el 75% de los expertos por capa, lo que degrada el rendimiento de forma medible: 16 problemas menos en LiveCodeBench respecto al build de 4 bits.
- El modelo tiende a repetirse durante el razonamiento si no se aplican las tres piezas del paquete (adaptador, flags de muestreo y cliente de parada y regeneración). Los resultados publicados solo son válidos con esa configuración completa.
- Los flags recomendados (`--presence-penalty 1.5 --repeat-last-n 20480`) alteran el comportamiento de muestreo y pueden afectar a la calidad en tareas distintas del código.
- Las mediciones de VRAM se realizaron en una DGX Spark con memoria unificada, no en una GPU dedicada de 16 GB; el consumo real en una tarjeta de consumo puede diferir.
- El contexto máximo práctico medido es de 128K con 16,5 GB, por encima de los 16 GB objetivo; en una tarjeta de 16 GB estricta hay que limitarse a 32K.
- Requiere 43,8 GB de descarga total (modelo, tabla y adaptador) y espacio en disco para la tabla n-gram de 26,8 GB.
- La licencia qwen-community-1.0 impone condiciones al uso comercial; hay que revisar el archivo LICENSE antes de desplegarlo en producción.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta cuantización.
- El adaptador debe cargarse con `--lora-scaled`; omitirlo invalida los resultados de los benchmarks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anik-jha/Qwen3.8-Flash-Next-16GB-GGUF
- Build de 24 GB del mismo autor: https://huggingface.co/anik-jha/Qwen3.8-Flash-Next-24GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper de referencia citado en los tags: arxiv:2611.20419
- Cuantización de origen (unsloth UD-IQ1_M): no disponible como enlace directo en la información proporcionada
