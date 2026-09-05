# hanzceo/DeepSeek-V4-Flash-0731-reap-150b-ftw

.
- Prompt format: encoding/ copiado de DeepSeek, chat_template.jinja transcrito de encode_messages().
- Compression recipe: moe-compress compress --model ... --method reap --num-kept-experts 132 --datasets c4,math,code --mix-ratio 0.0,0.3,0.7 --num-samples 3072 --seq-len 512 --streaming --stream-experts --save-path ...
- Calibración: mezcla 30% math / 70% code sin C4.
- Reconstruction quality: cosine mean 0.9445, cosine min 0.8417, rel L2 mean 0.2068.
- Serving: SGLang, en Hopper MXFP4 necesita --moe-runner-backend flashinfer_mxfp4, --tp-size 2, --nnodes 2, --context-length 4096.
- GGUF builds para llama.cpp están... (cortado). No se sabe más.

Resultados de búsqueda web:

- WhatsApp Web: irrelevante.
- deepseek-ai/DeepSeek-V4-Flash-0731 en HF: enlace al modelo base.
- 0xSero/DeepSeek-V4-Flash-0731-REAP: otro repositorio similar, gracias a DeepSeek, Cerebras Research por REAP, vLLM, Anemll/DGX Spark.
- NVIDIA NIM: "284B MoE (13B active) model ideal for long-context workloads optimized for coding, chat, and agentic workflows". También hay notas de evaluación para Code Agent tasks.

De esto puedo extraer que el modelo base es DeepSeek-V4-Flash-0731, un MoE de 284B totales y 13B activos, optimizado para coding, chat y agentic workflows.

La ficha debe ser en castellano de España, sin inventar datos. Si algo no está, "no disponible".

Ahora, estructuro la ficha:

## Resumen
Dos o tres párrafos. Debo explicar qué es el modelo, quién lo desarrolla, qué problema resuelve y por qué es relevante. Mencionar arquitectura, tamaño y contexto si disponibles.

El modelo es una versión comprimida de DeepSeek-V4-Flash-0731 mediante REAP (Router-weighted Expert Activation Pruning). Desarrollado por hanzceo (aunque la model card menciona puwaer, pero el autor del repo es hanzceo). Reduce los expertos enrutados de 256 a 132 por capa, pasando de 156 GiB a 79 GiB. Mantiene las 43 capas, 6 expertos por token. No fine-tuning ni destilación. Relevante porque ofrece un modelo MoE de menor tamaño con rendimiento comparable o incluso superior en algunos benchmarks (HumanEval+, MBPP+, MATH-500). Arquitectura MoE, tamaño 150B (según el nombre) pero realmente 132 expertos, contexto 4096 tokens (según serving) pero el modelo base puede tener más. La model card dice que el contexto usado en benchmarks es 4096, pero no especifica la longitud máxima de contexto. En la ficha, para "Longitud de contexto" pondré "no disponible" o "4096 tokens (en benchmarks y serving)"? La model card dice "--context-length 4096" en el comando de SGLang. El modelo base probablemente tiene un contexto mayor (DeepSeek-V4-Flash-0731 es para long-context). Pero no tengo el dato exacto. Mejor poner "no disponible" o "4096 tokens (configuración de serving en la model card)". Creo que es más seguro decir "no disponible" porque no se especifica la longitud máxima de contexto del modelo comprimido. Aunque en la sección de serving se usa context-length 4096. Podría poner "4096 tokens (configuración de serving)" pero eso no es la máxima. La instrucción dice "si un dato no está disponible, pone 'no disponible'". El dato de longitud de contexto no está en la información proporcionada de forma explícita. Así que "no disponible".

Para parámetros totales: El modelo base tiene 284B totales (13B activos). El modelo comprimido se llama "150b" pero no se indica el número exacto de parámetros. La model card dice "REAP 150b" con 132 expertos. El tamaño del checkpoint es 79 GiB. No se da el número de parámetros. Podría estimarlo, pero no debo inventar. Así que "no disponible" o "no disponible (modelo base: 284B)". Mejor "no disponible (el modelo base tiene 284B)". Pero la fila "Parámetros totales" debe tener un valor. Diré "no disponible (modelo base: 284B)". Los parámetros activos: el modelo base tiene 13B activos. El comprimido mantiene 6 expertos por token, igual que el base. Así que probablemente 13B activos también. Pero no está explícito en la model card. Sin embargo, la model card dice "Experts per token: 6". El modelo base tiene 13B activos. Con 6 expertos activos de 132, podría ser similar. No puedo afirmar con certeza. La instrucción dice "Parametros activos ... (solo si es MoE)". Debo poner "no disponible" o "13B (estimado, basado en el modelo base)". Como no debo inventar, pondré "no disponible (modelo base: 13B activos)". Aunque en la tabla de especificaciones, los valores deben ser precisos. Mejor "no disponible".

Arquitectura: MoE (Mixture of Experts), transformer. El modelo es un MoE con 43 capas, 132 expertos enrutados por capa y 6 expertos activos por token. Es una arquitectura de DeepSeek-V4. Puedo decirlo.

Tipos de cuantizacion: La model card menciona "MXFP4 expert layout" en SGLang para Hopper. También "fp8" en tags. Pero no se especifican tipos de cuantización disponibles. El modelo original puede tener FP8. Pondré "no disponible (el modelo base usa FP8; en la model card se menciona MXFP4 para expertos en Hopper)". Mejor "no disponible".

Idiomas soportados: "no disponibles" según HF. Así que "no disponible".

Licencia: MIT.

Formato de pesos: safetensors? El repo es de transformers, tamaño 86.1 GB. No se especifica el formato. La model card menciona "GGUF builds for llama.cpp are" (cortado), lo que sugiere que hay builds GGUF o se pueden hacer. Pero no se dice explícitamente. Pondré "no disponible".

## Especificaciones técnicas
Tabla:

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer, 43 capas, 132 expertos enrutados por capa, 6 expertos activos por token |
| Parametros totales | no disponible (modelo base: 284B) |
| Parametros activos | no disponible (modelo base: 13B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

En la fila de arquitectura, puedo añadir "REAP comprimido". Tal vez "MoE (Mixture of Experts) basado en DeepSeek-V4-Flash-0731, con 43 capas y 132 expertos enrutados por capa".

## Arquitectura y entrenamiento
Uno o dos párrafos. Explicar que es un MoE, que se ha aplicado REAP para podar expertos, sin fine-tuning. Datos de entrenamiento: no se menciona el dataset de entrenamiento original, pero la compresión se calibró con mezcla de math y code (30% math, 70% code) con 3072 muestras de secuencia 512. No hubo RLHF/DPO. Innovación técnica: REAP (Router-weighted Expert Activation Pruning), compresión en una sola pasada, streaming para comprimir en GPU de 96 GB. MTP modules eliminados, lo que impide decodificación especulativa basada en MTP.

## Capacidades
Lista de viñetas:
- Generación de texto y razonamiento: thinking mode activado por defecto, con niveles de reasoning_effort (low, high, max).
- Soporte de tool calling / function calling: la model card dice que el encoding/encoding_dsv4.py es la autoridad para tool calling, y que el chat_template no lo implementa. Por lo tanto, sí soporta tool calling si se usa el encoder de DeepSeek.
- Soporte de agentes y multi-step reasoning: el modelo base está optimizado para agentic workflows, según NVIDIA NIM. La model card menciona tool calling y multi-turn context.
- Capacidades multilingües: no disponible.
- Capacidades especiales: thinking mode, razonamiento visible en message.content, con . Soporta reasoning_effort. No tiene MTP para decodificación especulativa.
- Generación de código: benchmarks HumanEval+ y MBPP+ muestran buen rendimiento.
- Matemáticas: GSM8K y MATH-500.

## Casos de uso
Mínimo 6 casos concretos. Debo basarme en la información. El modelo es un MoE comprimido para text-generation, con buenos resultados en code y math, thinking mode, tool calling. Casos:
1. Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD. Su rendimiento en HumanEval+ (0.8963) y MBPP+ (0.7593) es incluso superior al modelo base.
2. Razonamiento matemático: con thinking mode y reasoning_effort, puede resolver problemas de GSM8K (0.9295) y MATH-500 (0.7140).
3. Asistentes de chat con contexto largo: aunque la longitud de contexto no está especificada, el modelo base está optimizado para long-context. La model card indica que el thinking consume tokens, por lo que hay que configurar max_tokens alto.
4. Agentes autónomos: soporta tool calling y multi-step reasoning, adecuado para agentes que necesitan planificar y ejecutar acciones.
5. Despliegue en entornos con recursos limitados: gracias a la compresión REAP, el checkpoint pasa de 156 GiB a 79 GiB, permitiendo su ejecución en GPUs con menos VRAM (aunque sigue siendo grande, no cabe en una consumer GPU típica).
6. Investigación en compresión de modelos MoE: sirve como referencia para estudiar el impacto de podar expertos sin fine-tuning, con datos de reconstrucción y benchmarks.
7. Aplicaciones de razonamiento con control de esfuerzo: mediante reasoning_effort, se puede ajustar el nivel de razonamiento según la tarea.

Debo ser específico y técnico.

## Benchmarks y rendimiento
Hay datos en la model card. Presento tabla comparativa con modelos similares (base 284b, REAP 200b, REAM 200b, REAP 150b, REAM 150b). También la diferencia con el base. Puedo incluir la tabla de benchmarks y la de diferencias.

Tabla de benchmarks:

| Modelo | Expertos | Tamaño | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|---|---|---|
| base 284b | 256 | 156 GiB | 0.9484 | 0.7060 | 0.8720 | 0.7407 | 0.8168 |
| REAP 200b | 178 | 104 GiB | 0.9401 | 0.6880 | 0.8720 | 0.7407 | 0.8102 |
| REAM 200b | 178 | 104 GiB | 0.8620 | 0.6080 | 0.8841 | 0.7698 | 0.7810 |
| REAP 150b | 132 | 79 GiB | 0.9295 | 0.7140 | 0.8963 | 0.7593 | 0.8248 |
| REAM 150b | 132 | 79 GiB | 0.6922 | 0.5020 | 0.8537 | 0.7328 | 0.6952 |

Diferencia respecto al base (en puntos):

| GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|
| -1.90 | +0.80 | +2.44 | +1.85 | +0.80 |

Notas: métricas exact_match, math_verify, pass@1_plus. Greedy, 4096 contexto, enable_thinking=false, SGLang. También puedo incluir la calidad de reconstrucción: cosine mean 0.9445, min 0.8417, rel L2 0.2068.

## Requisitos de hardware
Lista de viñetas:
- VRAM estimada para inferencia: el checkpoint es de 79 GiB. Para inferencia, se necesita al menos esa cantidad de VRAM para los pesos, más memoria para KV cache y activaciones. En la model card se menciona compresión en una sola GPU de 96 GB (con streaming). Para servir, se usa --tp-size 2 --nnodes 2, lo que sugiere que se necesitan 2 nodos con 2 GPUs cada uno (o 2 GPUs en total). No se especifica la VRAM exacta. Pondré "no disponible; el checkpoint ocupa 79 GiB, por lo que se requiere un sistema multi-GPU (por ejemplo, 2x 96 GB o similar) para cargar los pesos".
- GPU recomendadas: la model card menciona Hopper (H100) para el backend flashinfer_mxfp4. También se menciona "Anemll/DGX Spark" en el otro repo, pero no es este. Recomendadas: H100, A100, o GPUs con suficiente VRAM.
- Si cabe en consumer GPU: no, el checkpoint de 79 GiB supera la VRAM de cualquier GPU de consumo (RTX 4090 tiene 24 GB). No cabe.
- Opciones de despliegue: SGLang (verificado), llama.cpp (GGUF builds mencionados, pero la frase está cortada), vLLM (mencionado en el repo de 0xSero), TGI no mencionado. La model card dice "Verified with SGLang" y "GGUF builds for llama.cpp are" (cortado). Puedo decir: SGLang verificado; se mencionan builds GGUF para llama.cpp; vLLM aparece en repos relacionados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
Comparo con el modelo base DeepSeek-V4-Flash-0731 y con otras compresiones (REAP 200b, REAM 200b, REAM 150b). Puedo hacer una tabla comparativa. También podría comparar con otros MoE de tamaño similar, pero no tengo datos. Usaré la tabla de benchmarks como comparativa. Añado parámetros, contexto, rendimiento, licencia, disponibilidad. El modelo base tiene 284B, 256 expertos, 156 GiB, MIT. El REAP 150b tiene 132 expertos, 79 GiB, MIT. REAM es otro método de compresión. Puedo incluir una tabla:

| Modelo | Expertos | Tamaño | GSM8K | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 256 | 156 GiB | 0.9484 | 0.8720 | MIT | HuggingFace |
| REAP 150b (este modelo) | 132 | 79 GiB | 0.9295 | 0.8963 | MIT | HuggingFace |
| REAP 200b | 178 | 104 GiB | 0.9401 | 0.8720 | MIT | HuggingFace |
| REAM 150b | 132 | 79 GiB | 0.6922 | 0.8537 | MIT | HuggingFace |

También podría mencionar que el modelo base está disponible en NVIDIA NIM.

## Limitaciones y advertencias
Lista:
- Los módulos MTP (multi-token-prediction) han sido eliminados, por lo que la decodificación especulativa basada en MTP no está disponible. Los motores que busquen esos pesos caerán a decodificación normal.
- El thinking mode consume tokens antes de la respuesta; hay que configurar max_tokens alto para evitar truncamiento.
- El sampling por defecto no es greedy, según generation_config.json, lo que puede afectar la reproducibilidad.
- La compresión REAP puede introducir pérdida de calidad en algunas tareas; en GSM8K la puntuación baja 1.90 puntos respecto al base.
- El chat_template.jinja no implementa tool calling ni tokens de tarea internos; para usarlos hay que emplear el encoding/encoding_dsv4.py del repositorio base.
- No se dispone de información sobre idiomas soportados, longitud de contexto exacta ni benchmarks más amplios.
- El modelo es grande (79 GiB) y no cabe en GPUs de consumo; requiere infraestructura multi-GPU.
- La model card indica que la calidad de reconstrucción es un diagnóstico de compresión, no una métrica de calidad; no debe interpretarse como rendimiento final.
- Posibles sesgos y alucinaciones: no se han publicado evaluaciones de seguridad o sesgos en la información disponible.

## Enlaces
- HuggingFace: https://huggingface.co/hanzceo/DeepSeek-V4-Flash-0731-reap-150b-ftw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repo de compresión: https://github.com/puwaer/moe-expert-compress
- NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731
- Repo relacionado REAP: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP

Los enlaces de arxiv mencionados en tags: arxiv:2510.13999 y arxiv:2604.04356. No tengo los títulos, pero puedo incluirlos como enlaces genéricos a arxiv. No sé si son reales o inventados. Están en los tags de HF. Podría poner "arXiv:2510.13999" y "arXiv:2604.04356" como referencias, pero sin URL. Mejor no incluirlos si no tengo el enlace. Pero puedo mencionarlos en la sección de enlaces como "Artículos arxiv (según tags): 2510.13999, 2604.04356". Sin embargo, no sé si son relevantes. La instrucción dice "todos los enlaces relevantes encontrados en la busqueda web". Los tags no son búsqueda web, pero son parte de la información. Los incluiré con precaución.

Ahora, redacto la ficha en Markdown, siguiendo la estructura. Debo asegurarme de que los títulos solo tengan la primera palabra en mayúscula (excepto nombres propios). "Especificaciones técnicas" -> "Especificaciones técnicas" (técnicas va en minúscula? La regla dice "Solo la primera palabra de los titulos va en mayuscula". Así que "Especificaciones técnicas" es correcto: "Especificaciones" mayúscula, "técnicas" minúscula. "Arquitectura y entrenamiento" -> "Arquitectura y entrenamiento" (y minúscula). "Capacidades" -> "Capacidades". "Casos de uso" -> "Casos de uso". "Benchmarks y rendimiento" -> "Benchmarks y rendimiento" (rendimiento minúscula). "Requisitos de hardware" -> "Requisitos de hardware". "Comparativa con modelos similares" -> "Comparativa con modelos similares" (con minúscula). "Limitaciones y advertencias" -> "Limitaciones y advertencias". "Enlaces" -> "Enlaces".

No usar emojis.

Debo ser especifico y tecnico. Usar numeros y datos concretos.

Voy a escribir la ficha.## Resumen

DeepSeek-V4-Flash-0731-reap-150b-ftw es una version comprimida del modelo DeepSeek-V4-Flash-0731, desarrollada por hanzceo mediante la tecnica REAP (Router-weighted Expert Activation Pruning). El modelo original es un MoE de 284B parametros totales y 13B activos, optimizado para tareas de codigo, chat y flujos agente. Esta variante reduce los expertos enrutados de 256 a 132 por capa, manteniendo las 43 capas del decoder y los 6 expertos activos por token, con lo que el checkpoint pasa de 156 GiB a 79 GiB.

La compresion se realiza en una unica pasada a partir de estadisticas de calibracion, sin fine-tuning, sin destilacion y sin ningun paso de gradiente. El resultado es un modelo MoE de menor tamano que conserva un rendimiento muy proximo al modelo base e incluso lo supera en algunos benchmarks de codigo y matematicas. Es relevante para equipos que necesitan desplegar un modelo de alta capacidad con menos recursos de GPU, aunque sigue siendo un modelo grande que requiere infraestructura multi-GPU.

La arquitectura es un transformer MoE con 132 expertos enrutados por capa y 6 expertos activos por token. La longitud de contexto exacta no se especifica en la informacion disponible, aunque en los benchmarks y en la configuracion de serving se utiliza una ventana de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer, 43 capas, 132 expertos enrutados por capa, 6 expertos activos por token |
| Parametros totales | no disponible (modelo base: 284B) |
| Parametros activos | no disponible (modelo base: 13B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de DeepSeek-V4-Flash-0731, un transformer con 43 capas y 256 expertos enrutados por capa en su version original. La compresion REAP reduce la poblacion de expertos a 132 por capa, manteniendo intactas las capas del decoder y el numero de expertos activos por token (6). No se ha realizado ningun ajuste fino, destilacion ni entrenamiento con gradientes: los expertos se podan a partir de estadisticas de calibracion en una sola pasada.

El proceso de compresion se ejecuta con la herramienta moe-compress, utilizando una mezcla de datos de calibracion compuesta por un 30% de matematicas y un 70% de codigo, sin incluir C4, con 3072 muestras de secuencia 512. La calibracion se realiza en streaming, lo que permite comprimir un checkpoint de 156 GiB en una unica GPU de 96 GB, leyendo y escribiendo capa por capa. El metodo REAP selecciona los expertos basandose en la activacion ponderada por el router, eliminando aquellos con menor contribucion.

Una diferencia notable respecto al modelo base es la eliminacion de los modulos de prediccion multi-token (MTP: mtp.0, mtp.1, mtp.2). Esto implica que la decodificacion especulativa basada en MTP ya no esta disponible y los motores de inferencia que busquen esos pesos caeran a la decodificacion normal. La model card incluye un chat_template.jinja que reproduce el formato de prompts del encoder original para system, user y assistant, pero no implementa tool calling ni los tokens de tarea internos; para ello es necesario utilizar el archivo encoding/encoding_dsv4.py, copiado del repositorio base.

## Capacidades

- Generacion de texto y razonamiento: el modelo tiene un modo de pensamiento activado por defecto, con niveles de esfuerzo configurables mediante reasoning_effort (low, high, max). El razonamiento aparece en el contenido del mensaje y termina con el token .
- Generacion de codigo: obtiene resultados elevados en HumanEval+ (0.8963) y MBPP+ (0.7593), superando al modelo base en ambos benchmarks.
- Razonamiento matematico: alcanza 0.9295 en GSM8K y 0.7140 en MATH-500, con una mejora de +0.80 puntos en MATH-500 respecto al modelo base.
- Soporte de tool calling: disponible si se utiliza el encoder original encoding/encoding_dsv4.py, que es la autoridad para tool calling, tokens de tarea internos y mensajes de tipo developer o latest_reminder.
- Soporte de agentes y razonamiento multi-paso: el modelo base esta optimizado para flujos agente y la model card confirma la existencia de soporte para tool calling y contexto multi-turno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Control de esfuerzo de razonamiento: permite ajustar el nivel de razonamiento en modo thinking, lo que resulta util para equilibrar latencia y calidad segun la tarea.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar pruebas. Su rendimiento en HumanEval+ y MBPP+ es superior al del modelo base, lo que lo hace adecuado para tareas de programacion asistida, especialmente si se usa el encoder original para tool calling.
- Asistentes de chat con razonamiento: gracias al modo thinking y a la configuracion de reasoning_effort, puede gestionar conversaciones que requieren planificacion o analisis previo. Es necesario configurar max_tokens alto para evitar que el razonamiento se trunque antes de la respuesta final.
- Agentes autonomos con tool calling: el soporte de tool calling y el contexto multi-turno permiten construir agentes que ejecutan acciones, consultan herramientas y mantienen estado a lo largo de la conversacion. Para ello se recomienda usar encoding/encoding_dsv4.py en lugar del chat_template.
- Resolucion de problemas matematicos y cientificos: con puntuaciones altas en GSM8K y MATH-500, puede utilizarse en tutores inteligentes, sistemas de ayuda a la decision o herramientas de analisis cuantitativo, ajustando el nivel de razonamiento segun la complejidad.
- Investigacion en compresion de modelos MoE: sirve como caso de estudio para comparar REAP con otros metodos como REAM. La model card incluye datos de calidad de reconstruccion y benchmarks, lo que permite analizar el impacto de podar expertos sin fine-tuning.
- Despliegue en infraestructura con presupuesto de memoria limitado: al reducir el checkpoint de 156 GiB a 79 GiB, el modelo puede ejecutarse en sistemas con menos VRAM que los requeridos por el modelo base, siempre que se disponga de un entorno multi-GPU. La compresion en streaming tambien permite reconstruir el modelo en una GPU de 96 GB.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card comparan el modelo comprimido con el modelo base y con otras compresiones mediante REAP y REAM. Las metricas se obtuvieron con decodificacion greedy, contexto de 4096 tokens, enable_thinking=false y serving con SGLang.

| Modelo | Expertos | Tamano | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|---|---|---|
| base 284b | 256 | 156 GiB | 0.9484 | 0.7060 | 0.8720 | 0.7407 | 0.8168 |
| REAP 200b | 178 | 104 GiB | 0.9401 | 0.6880 | 0.8720 | 0.7407 | 0.8102 |
| REAM 200b | 178 | 104 GiB | 0.8620 | 0.6080 | 0.8841 | 0.7698 | 0.7810 |
| REAP 150b | 132 | 79 GiB | 0.9295 | 0.7140 | 0.8963 | 0.7593 | 0.8248 |
| REAM 150b | 132 | 79 GiB | 0.6922 | 0.5020 | 0.8537 | 0.7328 | 0.6952 |

Diferencia del modelo REAP 150b respecto al modelo base, en puntos:

| GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|
| -1.90 | +0.80 | +2.44 | +1.85 | +0.80 |

Ademas, la model card incluye una medida de calidad de reconstruccion durante la compresion, comparando la salida de cada bloque MoE reconstruido con el original sobre una sonda de 4096 tokens:

| Metrica | Valor |
|---|---|
| Coseno (media) | 0.9445 |
| Coseno (minimo) | 0.8417 |
| L2 relativo (media) | 0.2068 |

Esta medida es un diagnostico de compresion, no una metrica de calidad final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 79 GiB, por lo que se necesita un sistema multi-GPU con suficiente memoria para cargar los pesos, mas la memoria para cache KV y activaciones. La compresion en streaming se realizo en una GPU de 96 GB, pero la inferencia requiere al menos el tamano completo del modelo.
- GPU recomendadas: la model card verifica el serving con SGLang en GPUs Hopper, usando el backend flashinfer_mxfp4 para el layout MXFP4 de los expertos. Se recomiendan GPUs como H100 o A100 con suficiente VRAM.
- Cabe en consumer GPU: no. Los 79 GiB del checkpoint superan con creces la VRAM de GPUs de consumo como la RTX 4090 (24 GB). Se requiere infraestructura de servidor o multiples GPUs.
- Opciones de despliegue: SGLang (verificado con --tp-size 2 y --nnodes 2). Se mencionan builds GGUF para llama.cpp en la model card, aunque la informacion aparece truncada. vLLM aparece en repositorios relacionados con REAP, pero no esta verificado en esta model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Expertos | Tamano | GSM8K | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 256 | 156 GiB | 0.9484 | 0.8720 | MIT | HuggingFace, NVIDIA NIM |
| REAP 150b (este modelo) | 132 | 79 GiB | 0.9295 | 0.8963 | MIT | HuggingFace |
| REAP 200b | 178 | 104 GiB | 0.9401 | 0.8720 | MIT | HuggingFace |
| REAM 150b | 132 | 79 GiB | 0.6922 | 0.8537 | MIT | HuggingFace |

El modelo REAP 150b ofrece una relacion tamano/rendimiento muy favorable frente al modelo base, con una reduccion del 49% en el tamano del checkpoint y una mejora media de +0.80 puntos en los benchmarks publicados. Comparado con REAM 150b, el metodo REAP produce resultados notablemente superiores en GSM8K y MATH-500, aunque ligeramente inferiores en HumanEval+.

## Limitaciones y advertencias

- Los modulos MTP (multi-token-prediction) han sido eliminados. La decodificacion especulativa basada en MTP no esta disponible y los motores que busquen esos pesos caeran a la decodificacion normal.
- El modo thinking consume tokens antes de la respuesta final. Es necesario configurar max_tokens con un valor alto para evitar que el razonamiento se trunque a mitad de camino.
- El sampling por defecto no es greedy. Segun generation_config.json, el modelo utiliza do_sample, temperature y top_p, lo que puede afectar a la reproducibilidad de los resultados si no se fija una semilla.
- El chat_template.jinja no implementa tool calling ni los tokens de tarea internos. Para usarlos hay que emplear el archivo encoding/encoding_dsv4.py del repositorio base, lo que anade complejidad al despliegue.
- La compresion REAP puede degradar el rendimiento en algunas tareas. En GSM8K el modelo pierde 1.90 puntos respecto al base, aunque gana en los demas benchmarks publicados.
- No se dispone de informacion sobre la longitud de contexto maxima, los idiomas soportados ni evaluaciones de seguridad, sesgos o alucinaciones.
- El modelo es grande (79 GiB) y no cabe en GPUs de consumo. Requiere infraestructura multi-GPU, lo que limita su uso a entornos de servidor o cloud.
- La calidad de reconstruccion presentada en la model card es un diagnostico de compresion, no una metrica de calidad final, y no debe interpretarse como rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanzceo/DeepSeek-V4-Flash-0731-reap-150b-ftw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Herramienta de compresion moe-compress: https://github.com/puwaer/moe-expert-compress
- Modelo en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731
- Repositorio REAP relacionado: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- Referencias arxiv mencionadas en los tags (sin URL directa): arXiv:2510.13999, arXiv:2604.04356
