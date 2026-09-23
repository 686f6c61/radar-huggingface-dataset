# RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e

## Resumen

Qwen3.8-4B-Distill-MLX-oQ4e es una version cuantizada de forma nativa para MLX del modelo empero-ai/Qwen3.8-4B-Distill, que a su vez es un destilado de Qwen3.8-Max. La publica RolanDorisTech el 23 de septiembre de 2026 dentro de una familia de ocho cuantizaciones (variantes de 2B, 4B y 9B en oQ4e, oQ5e, oQ6e y oQ8e). El objetivo es claro: ofrecer un modelo de razonamiento de aproximadamente 4.000 millones de parametros que quepa en un Mac con memoria unificada y que se ejecute integramente en local, sin depender de APIs externas.

El modelo ocupa 2,3 GB en disco con una precision efectiva de unos 4,7 bits por peso (bpw), lo que lo situa por debajo del 4-bit g32 estandar (5,003 bpw) y muy lejos del 8-bit g64 (8,502 bpw). La cuantizacion emplea oQe (oMLX Universal Dynamic Quantization con imatrix), un esquema de precision mixta guiado por datos que mide la sensibilidad real de cada capa y asigna bits donde el error tiene mayor impacto, ademas de ponderar con la importancia de activacion de imatrix. Los pesos resultantes son safetensors estandar de mlx-lm, compatibles con mlx-lm, oMLX, LM Studio y mlx-swift.

El modelo esta pensado para razonamiento con etiquetas `<think>` siguiendo la plantilla de chat de Qwen3, y es exclusivamente de texto. Su relevancia actual reside en la combinacion de tamano reducido (2,3 GB), licencia Apache 2.0 y un consumo medido de solo 2,684 GB de pico en una M1 Max, lo que permite ejecutar razonamiento paso a paso en hardware de consumo Apple Silicon con una tasa de generacion de 65,4 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base perteneciente a la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | aproximadamente 4B (segun la denominacion del modelo base Qwen3.8-4B-Distill) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (precision mixta dinamica con imatrix), aproximadamente 4,7 bpw efectivos; pesos en bfloat16 para normas y escalas; lm_head en 8 bits; capas de embedding y capas tempranas/tardias con bits reforzados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (mlx-lm), tamano en disco 2,3 GB |
| Modelo base | empero-ai/Qwen3.8-4B-Distill (distilado de Qwen3.8-Max) |
| Biblioteca | mlx |
| Plantilla de chat | Qwen3 chat template con etiquetas `<think>` (incluye chat_template.jinja) |
| Modalidad | solo texto |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.8 y de que se trata de un modelo destilado orientado a razonamiento. El modelo original del que deriva, empero-ai/Qwen3.8-4B-Distill, fue destilado a partir de Qwen3.8-Max; no se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica destacable esta en el proceso de cuantizacion. oQ es un esquema de precision mixta guiado por datos: mide la sensibilidad real de cada capa y asigna bits alli donde el error penaliza mas la calidad. oQe anade a ese calculo la importancia de activacion de imatrix para ponderar la cuantizacion y reducir el error en los canales relevantes. El proceso se ejecuto en una M1 Max Mac Studio de 64 GB con GPU de 32 nucleos y macOS 27.0, mediante el panel de cuantizacion de oMLX, partiendo del master MLX BF16 de 7,1 GB. La configuracion empleada fue oQe activado, reutilizacion de cache activada, cache automatica, Strict desactivado, Preserve MTP desactivado y bfloat16 para normas y escalas. La cuantizacion de este modelo concreto tardo 4 minutos y 1 segundo. La proteccion aplicada incluye lm_head en 8 bits y refuerzo de la capa de embedding y de las capas tempranas y tardias. La salida es safetensors estandar de mlx-lm, sin formato propietario.

## Capacidades

- Generacion de texto en modo conversacional con plantilla de chat de Qwen3.
- Razonamiento paso a paso mediante etiquetas `<think>`, segun el prompt de prueba empleado por el autor.
- Aritmetica basica y resolucion de ecuaciones lineales: en la prueba del autor, con el enunciado "If 2x + 3 = 11, what is x? Think step by step inside <think> tags", el resultado fue correcto (x=4) y el modo de razonamiento se preservo tras la cuantizacion.
- Ejecucion local nativa en Apple Silicon mediante MLX.
- Compatibilidad con mlx-lm, oMLX, LM Studio y mlx-swift.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (unicamente se documenta razonamiento con `<think>`).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de razonamiento local en Mac: desplegado con mlx-lm o LM Studio sobre un equipo Apple Silicon, permite resolver problemas matematicos y logicos paso a paso mostrando el razonamiento en las etiquetas `<think>`, con un consumo de pico de 2,684 GB y 65,4 tokens/s de generacion en una M1 Max.
- Prototipado de aplicaciones macOS/iOS: al distribuirse como safetensors MLX y ser compatible con mlx-swift, se puede integrar directamente en una app nativa para ofrecer funciones de asistencia textual sin conexion a red.
- Procesamiento por lotes en estaciones de trabajo: un Mac Studio puede ejecutar varias instancias de este modelo de 2,3 GB para tareas de resumen, reescritura o clasificacion de texto, dado el reducido consumo de memoria frente a las variantes oQ8e del mismo tamano.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local y no requerir llamadas a servicios externos, es adecuado para tratamiento de textos que no pueden salir de la maquina del usuario.
- Educacion y tutoria: el modo de razonamiento explicito con `<think>` facilita generar explicaciones paso a paso de ejercicios de algebra elemental, utiles en herramientas de aprendizaje.
- Evaluacion de tecnicas de cuantizacion: sirve como caso de comparacion dentro de la propia familia de ocho modelos (2B/4B/9B en oQ4e, oQ5e, oQ6e y oQ8e) para medir el compromiso entre tamano, velocidad y calidad en Apple Silicon.
- Investigacion sobre destilacion: al derivar de Qwen3.8-Max mediante destilacion intermedia, es un punto de partida para estudiar como se degrada el razonamiento al reducir parametros y posteriormente cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente documenta una prueba de razonamiento aritmetico y las mediciones de velocidad y memoria en una M1 Max de 64 GB.

| Metrica | Valor |
|---|---|
| Prompt de prueba | "Q: If 2x + 3 = 11, what is x? Think step by step inside `<think>` tags." |
| Resultado | Correcto (x=4), razonamiento preservado |
| Tokens de prompt procesados | 37 |
| Velocidad de prefill | 133,7 tok/s |
| Tokens generados | 82 |
| Velocidad de generacion | 65,4 tok/s |
| Memoria pico | 2,684 GB |
| Hardware de medida | M1 Max Mac Studio 64 GB, GPU 32 nucleos, macOS 27.0 |

Comparativa de rendimiento dentro de la misma familia, con el mismo prompt:

| Modelo | Prefill (tok/s) | Generacion (tok/s) | Memoria pico |
|---|---|---|---|
| 2B-oQ4e | 267,7 | 118,6 | 1,241 GB |
| 2B-oQ8e | 122,2 | 97,5 | 2,131 GB |
| 4B-oQ4e (este modelo) | 133,7 | 65,4 | 2,684 GB |
| 4B-oQ8e | 130,9 | 48,4 | 4,651 GB |
| 9B-oQ4e | 101,5 | 43,0 | 5,471 GB |
| 9B-oQ5e | 91,3 | 37,1 | 6,555 GB |
| 9B-oQ6e | 84,3 | 33,3 | 7,664 GB |
| 9B-oQ8e | 91,8 | 28,7 | 9,679 GB |

## Requisitos de hardware

- Memoria pico medida: 2,684 GB durante la inferencia con 37 tokens de prompt y 82 de generacion. El modelo ocupa 2,3 GB en disco.
- Hardware de referencia: Mac Studio con M1 Max, 64 GB de memoria unificada y GPU de 32 nucleos. La cuantizacion se realizo en esa misma maquina.
- Encaje en hardware de consumo: si, esta disenado para Apple Silicon. Con 2,684 GB de pico cabe en cualquier Mac con memoria unificada de 8 GB o superior, incluidos MacBook Air y Mac mini de gama base. Los requisitos minimos exactos no estan documentados.
- GPUs recomendadas: el formato MLX esta orientado a Apple Silicon; no se documentan GPU NVIDIA o AMD para este artefacto. Para CUDA habria que recurrir a la version GGUF del modelo base.
- Opciones de despliegue: mlx-lm (`pip install mlx-lm`), oMLX, LM Studio (busqueda por `RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e`) y mlx-swift.
- Comando de ejemplo: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e --prompt "Explain oQ vs oQe" --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: 133,7 tok/s en prefill y 65,4 tok/s en generacion sobre M1 Max. En equipos con menos ancho de banda de memoria (por ejemplo, chips de gama base) el throughput sera inferior; no se proporcionan mediciones para esos casos.
- Estrategias de decodificacion sugeridas por el autor: temperatura 0,6, top-p 0,95, top-k 20.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los otros artefactos de la misma familia y con el master BF16 del que derivan. No se aportan datos de modelos de terceros.

| Modelo | Parametros | Tamano en disco | bpw efectivos | Generacion (tok/s, M1 Max) | Memoria pico | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-oQ4e (este modelo) | ~4B | 2,3 GB | ~4,7 | 65,4 | 2,684 GB | Apache 2.0 |
| Qwen3.8-4B-oQ8e | ~4B | 4,2 GB | no disponible (8 bits) | 48,4 | 4,651 GB | Apache 2.0 |
| Qwen3.8-2B-oQ4e | ~2B | 1,1 GB | no disponible (4 bits) | 118,6 | 1,241 GB | Apache 2.0 |
| Qwen3.8-9B-oQ4e | ~9B | 4,9 GB | no disponible (4 bits) | 43,0 | 5,471 GB | Apache 2.0 |
| Master BF16 MLX (base) | ~4B | 7,1 GB | 16 | no disponible | no disponible | Apache 2.0 |
| Cuantizacion plana 4-bit g32 (referencia) | ~4B | no disponible | 5,003 | no disponible | no disponible | no aplica |
| Cuantizacion plana 8-bit g64 (referencia) | ~4B | no disponible | 8,502 | no disponible | no disponible | no aplica |

Frente a la variante 4-bit plana (5,003 bpw), este modelo ofrece menor huella (4,7 bpw) gracias a la asignacion dinamica de bits. Frente al master BF16 de 7,1 GB, reduce el tamano a menos de un tercio con perdida de calidad reconocida por el autor como "lossy". No se dispone de comparaciones con modelos de otros autores.

## Limitaciones y advertencias

- Modelo destilado de razonamiento: el propio autor advierte de que puede alucinar.
- La cuantizacion es con perdida respecto al BF16 original, aunque el autor afirma que es mas precisa que las cuantizaciones planas g32/g64 del mismo tamano. No se aportan mediciones de calidad que respalden esa afirmacion mas alla de una unica prueba aritmetica.
- Modelo exclusivamente de texto: no procesa imagenes, audio ni otras modalidades.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento en castellano ni en otros idiomas distintos del ingles del prompt de prueba.
- Longitud de contexto: no disponible. No se debe asumir una ventana concreta para produccion sin verificarla.
- Soporte de tool calling y de agentes: no documentado. No conviene disenar pipelines que dependan de function calling sin validarlo previamente.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base es un destilado de Qwen3.8-Max; conviene revisar los terminos del modelo original y del destilado intermedio antes de un despliegue comercial.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso en produccion ni validacion externa independiente.
- Artefacto ligado a Apple Silicon: no es directamente utilizable en GPU NVIDIA sin convertir a otro formato.
- El proceso de cuantizacion se realizo con opciones no estandar documentadas de forma resumida (Strict OFF, Preserve MTP OFF); no se detalla el impacto de cada una en la calidad final.
- Las mediciones de velocidad y memoria provienen de un unico equipo (M1 Max, 64 GB) y de un unico prompt; no son extrapolables a otros chips ni a contextos largos.
- Fechas de publicacion y actualizacion indicadas como septiembre de 2026; no se ha podido contrastar la informacion con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Modelo base en GGUF: empero-ai/Qwen3.8-4B-Distill-GGUF (referenciado en la model card; URL directa no proporcionada)
- Canal del autor sobre IA local en Apple Silicon: https://www.youtube.com/@RolanDorisTech
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados sin relacion con la ficha (sitios de contenido para adultos), por lo que no se incluyen.
