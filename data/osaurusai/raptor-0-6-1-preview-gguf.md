# OsaurusAI/Raptor-0.6.1-preview-GGUF

## Resumen

Raptor 0.6.1 preview es un modelo de lenguaje de 4.112.079.360 parametros (4,11B) desarrollado por Osaurus AI a partir del checkpoint `XHToken/Spark-X2.5-4B`, sobre el que se ha aplicado un ajuste ligero. Esta ficha corresponde concretamente a la distribucion en formato GGUF, cuantizada por Jinho Jang (Osaurus AI) con calibracion mediante importance matrix (imatrix) y publicada bajo licencia Apache 2.0.

El modelo resuelve el problema de ejecutar un modelo conversacional con modo de razonamiento explicito, soporte de tool calling y capacidades agenticas en hardware de consumo, dentro del ecosistema llama.cpp. Se distribuye en dos cuantizaciones k-quant: Q6_K (3,38 GB) y Q4_K_M (2,60 GB), ambas con la imatrix aplicada, mas el propio fichero de importance matrix (3,6 MB) para re-cuantizar.

Su relevancia es doble. Por un lado, el autor publica una comparacion controlada del efecto de la imatrix y de un pliegue AWQ descartado, con metricas de divergencia KL frente a los pesos bf16 originales. Por otro, la arquitectura subyacente (`spark2_5`) no existe en llama.cpp upstream, lo que condiciona por completo el despliegue: ni llama.cpp de serie, ni Ollama, ni LM Studio pueden cargar estos ficheros sin anadir soporte para dicha arquitectura. El checkpoint se presenta explicitamente como una version preview con asperezas documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer denso, 27 capas de atencion deslizante + 9 de atencion completa); no implementada en llama.cpp upstream |
| Parametros totales | 4.112.079.360 (4,11B) |
| Parametros activos | no aplica (no se declara mezcla de expertos) |
| Longitud de contexto | no disponible en la model card; la atencion deslizante usa ventana 512 y el autor advierte de que hay que presupuestar entrada mas salida dentro de la ventana, ya que el razonamiento puede superar los 8192 tokens de salida |
| Tipos de cuantizacion | Q6_K (3,38 GB) y Q4_K_M (2,60 GB), ambas con imatrix aplicada; se incluye el fichero imatrix (3,6 MB) para re-cuantizar |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, requiere soporte de la arquitectura `spark2_5`) |

Notas de tokenizacion y plantilla: bos 0, eos 1, unk 5, pad 2; `add_bos_token` y `add_eos_token` ambos en false. Los valores por defecto de muestreo van incrustados en el GGUF: `temp = 1.0`, `top_p = 0.95`, `top_k = -1`, sin penalizacion por repeticion, coincidiendo con el `generation_config.json` de origen.

## Arquitectura y entrenamiento

El modelo base es `XHToken/Spark-X2.5-4B` y Raptor 0.6.1 preview es un ajuste ligero sobre el. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos no estan disponibles. Lo que si se documenta con precision es el grafo de inferencia que debe implementar el runtime: proyeccion `q_k_v_proj` fusionada, una puerta de salida de atencion por cabeza con sigmoide (`g_proj`), MLP con activacion gelu, RMSNorm sin desplazamiento +1, y 27 capas de atencion deslizante frente a 9 de atencion completa con ventana 512. Cada tipo de capa usa un rope distinto: las capas full emplean theta 5e6 sobre 64 de 256 dimensiones, mientras que las deslizantes emplean theta 1e4 sobre las 256 dimensiones.

La innovacion documentada de esta distribucion no esta en el entrenamiento sino en el proceso de cuantizacion. La importance matrix se capturo sobre 600 fragmentos de 512 tokens con codigo, transcripciones agenticas y de tool-calls, opcion multiple academica, chat general, chino, contexto largo, ciencia y texto de seguridad. El autor construyo tres brazos por anchura de cuantizacion y los midio contra la misma referencia bf16, con un corpus de evaluacion disjunto del de calibracion (100 fragmentos de 512 tokens, descartando 9.166 filas solapadas). Conclusiones medidas: la imatrix aporta una reduccion del 8 % en KLD a Q4_K_M (0,0399 frente a 0,0435) y queda dentro del ruido a Q6_K; un pliegue AWQ capturado en GPU (1.500.201 tokens, 72 de 72 puntos de plegado, verificado como preservador de funcion a 3,6e-07 y con top-1 35/35 sobre logits reales) empeoro ambas anchuras y fue descartado.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Modo de razonamiento explicito activado por defecto: la plantilla abre el rail `<think>` dentro del prompt, y con `--jinja` llama.cpp separa la traza en `reasoning_content`, dejando `content` limpio. Se puede desactivar con `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling y function calling con dialecto XML propio de Spark (`<tool_call>NAME<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`), que llama.cpp convierte a JSON estandar de OpenAI con `finish_reason: "tool_calls"`.
- Razonamiento multi-paso y uso como agente, segun los tags del autor y el corpus de calibracion, que incluye transcripciones agenticas.
- Calculo aritmetico y resolucion de expresiones paso a paso dentro de la traza de razonamiento.
- Generacion y comprension de codigo, reforzada por la calibracion sobre texto de codigo.
- Respuesta a opcion multiple de tipo academico (incluido en el corpus de calibracion de la imatrix).
- Capacidades multilingues limitadas a ingles y chino; no se declaran otros idiomas.
- No se declaran capacidades de vision ni de audio.

## Casos de uso

- Agentes con tool calling en produccion: sirviendo con `llama-server --jinja`, el modelo emite llamadas que se convierten a JSON compatible con OpenAI, lo que permite integrarlo en orquestadores que ya consumen ese esquema sin adaptadores propios.
- Automatizacion de tareas con razonamiento verificable: al separar `reasoning_content` de `content`, se puede auditar la traza de razonamiento sin contaminar la respuesta final mostrada al usuario, util en entornos donde se exige justificar decisiones.
- Asistente de programacion local: la imatrix se calibro con texto de codigo y transcripciones agenticas, y con 2,60-3,38 GB de pesos cabe en portatiles y estaciones de trabajo sin GPU dedicada, lo que permite autocompletado y refactorizacion sin enviar codigo a terceros.
- Atencion al cliente en ingles y chino: la ventana deslizante de 512 tokens reduce el coste de KV cache en conversaciones largas, aunque el recall de contexto largo no esta garantizado y debe validarse por caso de uso.
- Despliegue on-premise con datos sensibles: la licencia Apache 2.0 y la ausencia de dependencia de APIs externas permiten ejecutar el modelo en infraestructura propia, siempre que se compile un llama.cpp con soporte `spark2_5`.
- Evaluacion y generacion de preguntas tipo test: el corpus de calibracion incluye opcion multiple academica, por lo que el modelo es razonablemente util en tareas de respuesta multiple-choice.
- Docencia asistida por ordenador con traza de razonamiento: el modo thinking por defecto permite mostrar el desarrollo de un problema matematico paso a paso antes del resultado.
- Sustitucion de modelo en pipelines ya existentes de llama.cpp: al exponer una API compatible con OpenAI y admitir parametros de muestreo incrustados en el GGUF, puede colocarse tras un gateway existente cambiando unicamente el backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card si publica metricas de fidelidad de cuantizacion frente a los pesos bf16 del propio modelo, que no son comparables con benchmarks de tareas:

| Fichero | Tamano | KLD media vs bf16 (menor es mejor) | Mismo top-1 (mayor es mejor) |
|---|---|---|---|
| Raptor-0.6.1-preview-Q6_K.gguf | 3,38 GB | 0,00469 ± 0,00033 | 98,27 ± 0,08 % |
| Raptor-0.6.1-preview-Q4_K_M.gguf | 2,60 GB | 0,03994 ± 0,00126 | 94,92 ± 0,14 % |

Perplejidad de referencia del bf16 de origen sobre el corpus de evaluacion retenido: 2,1935 ± 0,0129.

Comparacion controlada de tratamientos de cuantizacion (misma referencia bf16, mismo corpus):

| Brazo | KLD media Q6_K | KLD media Q4_K_M |
|---|---|---|
| Plano + imatrix (distribuido) | 0,004691 ± 0,00033 | 0,039944 ± 0,00126 |
| Plano, sin imatrix | 0,004745 ± 0,00025 | 0,043528 ± 0,00137 |
| AWQ plegado + imatrix | 0,004985 ± 0,00039 | 0,042827 ± 0,00143 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,7-3,2 GB para Q4_K_M y 3,5-4,0 GB para Q6_K, mas el coste de la KV cache (que se beneficia de las 27 capas con ventana deslizante de 512).
- Cabe en GPU de consumo: cualquier tarjeta con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090) puede ejecutar Q6_K con margen; con 6 GB o menos conviene Q4_K_M.
- Inferencia solo en CPU viable: 2,60-3,38 GB de pesos permiten ejecucion en portatiles modernos sin GPU dedicada, a costa de latencia mayor.
- GPU de datacenter: no se declaran requisitos especificos; por tamano, A100, H100 o L40S quedan sobredimensionadas para un modelo de 4,11B salvo por agregacion de concurrencia.
- Opciones de despliegue: `llama-server` compilado con soporte `spark2_5` y flag `--jinja` para que la plantilla embebida gestione el parseo de herramientas y razonamiento. El llama.cpp upstream, Ollama y LM Studio rechazan estos ficheros al no existir `LLM_ARCH_SPARK2_5` en ninguna release upstream. Para el stack de Osaurus (MLX, no GGUF) el autor remite al bundle `OsaurusAI/Raptor-0.6.1-preview-JANG_6M`.
- Latencia y throughput estimados: no disponibles.
- Consideracion de cache: anadir o quitar una herramienta reescribe el prefijo de sistema, por lo que un cambio de conjunto de herramientas implica un re-prefill completo y no un simple anexado de sufijo.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks frente a otros modelos de tamano similar, por lo que la comparacion se limita a los artefactos derivados del mismo checkpoint base documentados en la informacion proporcionada:

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raptor 0.6.1 preview GGUF (esta ficha) | 4,11B | no disponible | GGUF; requiere llama.cpp con `spark2_5` | Apache 2.0 | Publicado por Osaurus AI; 0 descargas y 0 likes en el momento de la consulta |
| XHToken/Spark-X2.5-4B (modelo base) | 4,11B | no disponible | no disponible en la informacion proporcionada | Apache 2.0 | Modelo de origen del ajuste |
| OsaurusAI/Raptor-0.6.1-preview-JANG_6M | 4,11B | no disponible | MLX (bundle de Osaurus) | Apache 2.0 | Mismo checkpoint bf16 fusionado, cuantizado para MLX en lugar de GGUF |

No se dispone de informacion verificada para comparar con alternativas externas de la misma categoria (por ejemplo, modelos densos de 3B a 5B de otros autores) en parametros, contexto, rendimiento y licencia simultaneamente.

## Limitaciones y advertencias

- Estado preview: el propio autor lo describe como un checkpoint practico con asperezas documentadas.
- El recall en contexto largo no esta garantizado; la ventana deslizante de 512 tokens en 27 de las 36 capas limita la recuperacion fiable de informacion muy alejada en la secuencia.
- Persisten errores agenticos ordinarios; no debe asumirse fiabilidad de nivel produccion en cadenas de tool calls sin validacion externa.
- Las respuestas de identidad no estan forzadas: el modelo puede no declarar de forma consistente quien es.
- Compatibilidad de runtime: sin soporte `spark2_5` en el binario, el fichero no carga. Esto rompe la portabilidad habitual de los GGUF y ata el despliegue a una compilacion concreta.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de veracidad publicados en la informacion disponible.
- Cobertura linguistica reducida a ingles y chino; no se declara soporte de castellano.
- El razonamiento puede consumir mas de 8192 tokens de salida en prompts dificiles, lo que obliga a dimensionar la ventana de contexto con espacio para entrada y salida, no solo para la entrada.
- La plantilla abre el rail de razonamiento por defecto: un parser que espere encontrar un `<think>` literal en el flujo de salida nunca lo vera, porque el token de apertura ya esta en el prompt.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia ni soporte por parte del autor.
- Trazabilidad baja del artefacto: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion por parte de terceros.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/OsaurusAI/Raptor-0.6.1-preview-GGUF
- Bundle MLX recomendado por el autor para Osaurus: https://huggingface.co/OsaurusAI/Raptor-0.6.1-preview-JANG_6M
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Sitio del desarrollador: https://osaurus.ai
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron exclusivamente hilos de foro y paginas de editorial sin relacion con Raptor 0.6.1, Spark-X2.5-4B ni Osaurus AI, por lo que no se incluye ningun enlace adicional de esa fuente.
