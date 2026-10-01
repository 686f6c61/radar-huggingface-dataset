# perkel/Qwen3.8-27B-Uncensored-MC

## Resumen

Qwen3.8-27B-Uncensored-MC es una conversion de pesos del modelo abliterado Qwen3.8-27B-Uncensored de OrcaRouter (a su vez una version sin alineamiento de seguridad de Qwen/Qwen3.8-27B) a los formatos MX propietarios del motor MegaCapibara. El autor es perkel, y el objetivo declarado es ejecutar un modelo denso de 27B con vision en una unica NVIDIA RTX 5090 (Windows 11) mediante cuantizacion mixta MXFP4/MXFP6. Se publica en cinco tamanos (Tiny, Small, Medium, Large y XXL) que van de 12,70 GiB a 23,58 GiB de VRAM, con divergencia KL y acuerdo top-1 documentados frente a los pesos BF16 originales.

La relevancia tecnica esta en dos frentes. Por un lado, la cuantizacion MXFP4/MXFP6 por bloques con asignacion selectiva de precision (por ejemplo, la cabeza, las salidas de mezclador de ciertas capas o las ultimas 8 MLPs en MXFP6) permite comprimir un modelo de 27B con una perdida medida de top-1 entre el 92,7% y el 98,2% segun tamano. Por otro, incorpora decodificacion especulativa con un drafter DFlash2 y una cabeza MTP propia del modelo abliterado, ademas de una torre de vision intacta en FP8 o BF16.

El modelo es nativo imagen-texto, soporta contexto de 262.144 tokens, control flexible de modo thinking y tool calling. Su uso comercial esta permitido bajo Apache 2.0, pero el propio autor advierte que el comportamiento de rechazo fue eliminado mediante abliteracion y que el motor MegaCapibara aun no ha sido publicado, por lo que las cinco variantes no son ejecutables con herramientas estandar en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion Gated DeltaNet (lineal) combinada con atencion completa; 64 capas; torre de vision y cabeza MTP de decodificacion especulativa |
| Parametros totales | 27B (modelo denso) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4; MXFP6; mezclas MXFP4+MXFP6; MXFP6 con entradas MLP de capas 24-39 a ~16 bits (dos terminos FP8); FP8 y BF16 para la torre de vision |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.megacapibara` (formato propietario del motor MegaCapibara; no safetensors ni GGUF) |
| Tamano del repositorio | 108,0 GB |
| Vocabulario | 248.320 tokens |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored (BF16 abliterado) |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de 27B parametros con atencion hibrida: capas de atencion lineal Gated DeltaNet alternadas con capas de atencion completa, 64 capas y un vocabulario de 248.320 tokens. Incorpora una torre de vision que lo convierte en un modelo nativo imagen-texto (pipeline `image-text-to-text`), una cabeza MTP (multi-token prediction) para decodificacion especulativa y control flexible del modo thinking. Los nombres de tensores, el tokenizer y la plantilla de chat son los originales de Qwen.

La intervencion de OrcaRouter sigue el trabajo de Arditi et al. 2024 (*Refusal in Language Models Is Mediated by a Single Direction*). Se estimo una unica direccion de rechazo en la capa 38 y se ortogonalizo fuera de las 131 matrices que escriben en el flujo residual: proyecciones de salida de atencion y de DeltaNet, proyecciones down de las MLP, el embedding y la cabeza MTP. La torre de vision no fue modificada. Segun la model card, en texto de prueba la perplejidad a precision completa coincide con el original dentro del 0,5% en razonamiento, matematicas, codigo y wiki, y difiere unicamente en chat (donde residen los rechazos) y en texto de tool calls. No se documenta el numero de tokens de entrenamiento ni la composicion del dataset, que corresponden al modelo Qwen original y no se detallan en la informacion disponible.

Sobre esa base, perkel aplica cuantizacion MX por bloques con asignacion de precision no uniforme. La variante Large usa MXFP6 en todos los tensores (KL 0,0074 / top-1 97,9%) y la XXL eleva a ~16 bits la cabeza y las entradas MLP de las capas 24-39 mediante dos terminos FP8 (KL 0,0057 / top-1 98,2%). Las variantes inferiores degradan de forma medible: Tiny, con MXFP4 en todo, cae a top-1 92,7% y KL 0,0662. La medicon se hace con matematica FP32, activaciones de 16 bits y cache KV sin cuantizar.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo thinking configurable (activado o desactivado).
- Razonamiento matematico y generacion de codigo, con KL bajo en estas categorias en todos los tamanos.
- Comprension de imagenes: entrada imagen-texto mediante torre de vision en FP8 (casi exacta) o BF16.
- Tool calling y function calling, integrable en agentes; el autor advierte que el texto de tool calls es uno de los dominios donde la abliteracion altera la salida respecto al original.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o sesiones prolongadas.
- Decodificacion especulativa: soporta el drafter DFlash2 (1,3 GB) y la cabeza MTP propia (0,28 GB).
- Multilinguee limitado a ingles y chino.
- Ausencia de rechazos: responde a peticiones que el Qwen3.8-27B original rechazaria, incluidas las daninas, sin guardrails integrados.

## Casos de uso

- Investigacion de interpretabilidad y mecanismos de rechazo: permite reproducir y auditar el experimento de Arditi et al. sobre una direccion unica en la capa 38, comparando activaciones y salidas entre el modelo abliterado y el original.
- Red-teaming y evaluacion de seguridad: sirve como sujeto de prueba para medir la eficacia de clasificadores de contenido, moderadores y filtros, dado que carece de rechazos incorporados.
- Experimentos de cuantizacion: las cinco variantes ofrecen una curva controlada de KL y top-1 (92,7% a 98,2%) frente al BF16, util para estudiar el impacto de MXFP4 frente a MXFP6 por tipo de texto (razonamiento, matematicas, codigo, chat, wiki).
- Inferencia local en una RTX 5090: la variante Tiny cabe en 12,70 GiB y la XXL en 23,58 GiB, ambas dentro de los 32 GB de la GPU, lo que permite ejecutar un modelo de 27B con vision en hardware de consumo.
- Analisis de documentos largos con imagenes: con 262.144 tokens de contexto y torre de vision puede procesar informes extensos, planos o capturas junto al texto asociado en una sola pasada.
- Generacion de codigo asistida en local: el modo thinking desactivable y el drafter DFlash2 (hasta 493 tokens/s en codigo con una conversacion en la variante Tiny) lo hacen apto para autocompletado y refactorizacion en estaciones de trabajo sin conexion.
- Agentes multi-paso con tool calling: el soporte de function calling y la cabeza MTP permiten construir pipelines de agente donde el modelo encadena llamadas a herramientas con verificacion de cada token especulado.
- Estudios comparativos de ablacion: la relacion entre perplejidad conservada (dentro del 0,5% en razonamiento, matematicas, codigo y wiki) y comportamiento alterado en chat permite aislar el efecto de la direccion de rechazo del efecto de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card proporciona metricas internas de fidelidad frente a los pesos BF16 del propio modelo abliterado, calculadas sobre 81.880 tokens de prueba (trazas de razonamiento, matematicas, codigo, chat y wiki) con activaciones de 16 bits y cache KV sin cuantizar.

| Variante | Formatos de pesos | En disco | En VRAM | KL | Top-1 |
|---|---|---|---|---|---|
| Tiny | MXFP4 en todo | 16,6 GB | 12,70 GiB | 0,0662 | 92,7% |
| Small | MXFP4; MXFP6 en cabeza, salidas de mezclador de 24 capas y MLP de las ultimas 8 capas | 17,6 GB | 13,67 GiB | 0,0574 | 93,7% |
| Medium | MXFP4; MXFP6 en cabeza, todas las salidas de mezclador, mitad de entradas de mezclador y salidas MLP | 19,5 GB | 15,39 GiB | 0,0261 | 95,6% |
| Large | MXFP6 en todo | 22,9 GB | 18,66 GiB | 0,0074 | 97,9% |
| XXL | MXFP6; cabeza y entradas MLP de capas 24-39 a ~16 bits (dos terminos FP8) | 28,2 GB | 23,58 GiB | 0,0057 | 98,2% |

Desglose de KL por tipo de texto:

| Variante | Razonamiento | Matematicas | Codigo | Chat | Wiki |
|---|---|---|---|---|---|
| Tiny | 0,0138 | 0,0156 | 0,0508 | 0,2094 | 0,0414 |
| Small | 0,0107 | 0,0139 | 0,0450 | 0,1899 | 0,0277 |
| Medium | 0,0059 | 0,0080 | 0,0282 | 0,0689 | 0,0196 |
| Large | 0,0009 | 0,0015 | 0,0092 | 0,0227 | 0,0028 |
| XXL | 0,0007 | 0,0014 | 0,0081 | 0,0162 | 0,0022 |

Velocidad medida en una RTX 5090 (greedy, thinking desactivado, respuestas de hasta 2.000 tokens, activaciones FP8, DFlash2):

| Variante | Codigo, 1 conversacion | Prosa, 1 conversacion | Codigo, 8 simultaneas (total) | Lectura de prompt de 8K tokens |
|---|---|---|---|---|
| Tiny | 493 tok/s | 250 tok/s | 1.856 tok/s | 7.854 tok/s |
| Small | 488 tok/s | 236 tok/s | 1.828 tok/s | 7.697 tok/s |
| Medium | 445 tok/s | 219 tok/s | 1.669 tok/s | 7.365 tok/s |

Los datos de velocidad para las variantes Large y XXL no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM de inferencia: 12,70 GiB (Tiny), 13,67 GiB (Small), 15,39 GiB (Medium), 18,66 GiB (Large) y 23,58 GiB (XXL), sin contar la cache KV, el embedding ni la capa MTP.
- Soporte auxiliar: drafter DFlash2 de 1,3 GB en disco o cabeza MTP de 0,28 GB; torre de vision de 0,57 GB (FP8) o 1,0 GB (BF16).
- GPU objetivo: una NVIDIA RTX 5090 (Blackwell), 32 GB de VRAM. El autor indica que el formato esta disenado para esta GPU concreta y no menciona otras.
- Modelo BF16 de referencia: aproximadamente 55 GB de VRAM, por encima de cualquier GPU de consumo actual.
- Sistema operativo: Windows 11 segun la model card.
- Despliegue: exclusivamente mediante el motor MegaCapibara, cuyo repositorio no ha sido publicado. No se contemplan vLLM, llama.cpp, Ollama ni TGI con estos ficheros. Las alternativas de la comunidad (GGUF de Unsloth, Q4_K_M de JonathanColetti, MLX de orcarouter, FP8 de xixiameng) usan el modelo abliterado de OrcaRouter, no esta conversion.
- Throughput: entre 219 y 493 tokens/s en una conversacion unica segun variante y dominio, hasta 1.856 tokens/s agregados con 8 conversaciones simultaneas, y entre 7.365 y 7.854 tokens/s de prefill con un prompt de 8K.
- Latencia: no se publican mediciones de latencia por token (TTFT) en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| perkel/Qwen3.8-27B-Uncensored-MC | 27B denso | 262.144 | `.megacapibara` (MXFP4/MXFP6, 12,70-23,58 GiB) | Top-1 92,7-98,2% frente a su BF16; 219-493 tok/s en RTX 5090 | Apache 2.0 | Repo publicado; motor aun no disponible |
| orcarouter/Qwen3.8-27B-Uncensored | 27B denso | 262.144 | BF16 (~55 GB VRAM) | No disponible | Apache 2.0 (heredada) | Disponible en HuggingFace |
| GGUFs de Unsloth sobre Qwen3.8-27B original | 27B denso | 262.144 | GGUF (varios tamanos) | Top-1 publicado por el autor, sobre su propio texto | Apache 2.0 | Disponible en HuggingFace |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B denso | 262.144 | GGUF, recomendado Q4_K_M | No disponible | Apache 2.0 (heredada) | Disponible en HuggingFace, apto para GPU de 24 GB |
| orcarouter (build MLX 4-bit) | 27B denso | 262.144 | MLX 4-bit | No disponible | Apache 2.0 (heredada) | Disponible; orientado a Mac de 32 GB |
| xixiameng/Qwen3.8-27B-Uncensored-FP8-bucket | 27B denso | 262.144 | Block-FP8 offline | No disponible | Apache 2.0 (heredada) | Disponible como bucket |

La comparacion directa de rendimiento entre estas builds no es posible porque cada una publica metricas sobre textos y metodologias distintas. La unica cifra interna comparable que aporta esta model card es el top-1 frente al BF16 del propio modelo abliterado (92,7-98,2%), sin que se indiquen resultados de tareas estandar para las alternativas.

## Limitaciones y advertencias

- La alineacion de seguridad esta practicamente eliminada: el modelo responde a peticiones que Qwen3.8-27B rechazaria, incluidas las daninas, y no incorpora guardrails. El propio autor desaconseja servirlo a terceros sin capas de moderacion propias.
- Riesgo de uso indebido: la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad legal y etica recae integramente en quien despliega el modelo.
- Motor no disponible: los ficheros `.megacapibara` no son ejecutables con vLLM, llama.cpp, Ollama, TGI ni transformers. Hasta que se publique MegaCapibara, el modelo es inutilizable en la practica y su reproducibilidad no puede verificarse de forma independiente.
- Dependencia de hardware especifico: el formato esta optimizado para una unica RTX 5090 en Windows 11; no se documenta compatibilidad con otras GPU, otros sistemas operativos ni despliegues multi-GPU.
- Idiomas limitados a ingles y chino, sin soporte declarado de castellano ni de otras lenguas.
- Divergencia en tool calls: la propia model card senala que la abliteracion altera el texto de las llamadas a herramientas respecto al original, lo que puede afectar a agentes que dependan de ese formato.
- Degradacion medible en las variantes pequenas: la Tiny presenta un KL de 0,2094 en chat y 0,0508 en codigo, con top-1 del 92,7%, lo que puede ser insuficiente para tareas que requieran fidelidad alta.
- Alucinacion: no se aportan datos especificos sobre tasas de alucinacion; al tratarse de una cuantizacion de un modelo abliterado, el comportamiento en dominios donde el rechazo actuaba como senal de incertidumbre puede ser menos predecible.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Datos de entrenamiento no disponibles: no se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; estas fases corresponden al Qwen3.8-27B original y no se detallan.
- Metricas limitadas: la validacion se restringe a KL y top-1 frente al BF16 propio, sin benchmarks estandar ni evaluaciones de seguridad independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perkel/Qwen3.8-27B-Uncensored-MC
- Conversion equivalente sin abliterar: https://huggingface.co/perkel/Qwen3.8-27B-MC
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Build GGUF de Unsloth del modelo original: no disponible como enlace directo en la busqueda
- Guia de ejecucion local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio de la comunidad (Wassimyounes01): https://github.com/Wassimyounes01/qwen38-uncensored
- Build GGUF de la comunidad: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Build FP8 de la comunidad: https://huggingface.co/buckets/xixiameng/Qwen3.8-27B-Uncensored-FP8-bucket
- Referencia de despliegue en featherless.ai: https://featherless.ai/models/JonathanColetti/Qwen3.8-27B-Uncensored
- Referencia metodologica de abliteracion: Arditi et al. 2024, *Refusal in Language Models Is Mediated by a Single Direction* (sin enlace directo en la informacion disponible)
