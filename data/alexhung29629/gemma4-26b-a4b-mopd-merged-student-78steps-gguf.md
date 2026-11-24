# AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `gemma4-26b-a4b-mopd-merged-student-78steps`, un estudiante destilado por el usuario AlexHung29629 a partir de un merge DARE-TIES (drop rate 0.5) de dos modelos profesores contra `google/gemma-4-26B-A4B-it`. El modelo parte de la familia Gemma 4 en variante 26B-A4B, es decir, una arquitectura MoE con aproximadamente 25.233 millones de parametros totales y 4.000 millones activos por token (el sufijo A4B asi lo indica), y fue entrenado con destilacion on-policy (MOPD, sampled-token, con ventaja estilo REINFORCE e importance sampling truncado ICE-POP) durante 78 pasos de RL en un entorno de agentes OpenClaw sobre tareas de PinchBench.

Lo relevante de esta publicacion no es el modelo en si, sino el artefacto de despliegue: cuantizaciones con matriz de importancia (imatrix) generadas con `llama.cpp` b11913, pensadas para inferencia local en CPU/GPU consumer. El texto conserva los pesos entrenados por RL, mientras que la torre de vision mantiene los pesos congelados del modelo base, ya que el entrenamiento fue exclusivamente de lenguaje. Se distribuye tambien el proyector multimodal (`mmproj`) en bf16 para poder usar entrada de imagen.

El repositorio tiene traccion practicamente nula (0 descargas, 0 likes en el momento de la consulta) y no dispone de model card oficial mas alla de las notas de cuantizacion. La licencia declarada es Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia efectiva de los pesos base de Gemma 4 antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4, variante 26B-A4B); torre de vision separada (mmproj) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (segun nomenclatura A4B; 128 expertos, 8 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (5,32 BPW), Q4_0 (4,59 BPW); mmproj en bf16; imatrix disponible |
| Idiomas soportados | no disponible (la calibracion de la imatrix uso ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Gemma 4: 25,2B parametros totales con 128 expertos y 8 activos por token, lo que resulta en unos 4B parametros activos por paso de decodificacion. Incluye una torre de vision independiente que, en esta version, conserva los pesos congelados del checkpoint original porque el proceso de RL solo afecto al stack de lenguaje. El estudiante se inicializo a partir de un merge DARE-TIES (drop rate 0.5) de dos profesores contra `google/gemma-4-26B-A4B-it` y despues recibio 78 pasos de destilacion on-policy (MOPD) con muestreo de tokens, ventaja estilo REINFORCE e importance sampling truncado ICE-POP, ejecutados con NeMo-RL en un entorno de agentes OpenClaw sobre tareas de PinchBench.

Las cuantizaciones se generaron con `llama.cpp` build b11913 (CUDA): conversion desde el checkpoint HF en bf16 (50,5 GB) a GGUF, calculo de matriz de importancia con `llama-imatrix` sobre 1014 chunks de 1024 tokens de contexto (~1,04 millones de tokens) mezclando wikitext-103 en ingles y Wikipedia en chino tradicional (OpenCC `s2twp`) al 50/50, y posterior `llama-quantize`. Segun las notas del autor, los tensores de expertos (`ffn_gate_up_exps`, `ffn_down_exps`) quedaron cubiertos al 98-100% por los datos de calibracion, lo que reduce el impacto tipico de cuantizar capas MoE con datos insuficientes.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y, presumiblemente, otros idiomas de Gemma 4 (no confirmado en la informacion disponible).
- Razonamiento y respuesta a instrucciones heredados del checkpoint base Gemma 4 y del proceso de RL sobre tareas de agente.
- Entrada multimodal de imagen mediante el proyector `mmproj` en bf16 (vision con pesos congelados, sin ajuste por RL).
- Comportamiento orientado a agentes: el entrenamiento se realizo en un entorno OpenClaw con tareas PinchBench, lo que sugiere capacidad para seguir instrucciones de varios pasos y usar herramientas, aunque no se documenta soporte explicito de function calling.
- Capacidad de ejecucion en `llama.cpp` tanto en modo texto (`llama-cli`) como multimodal (`llama-mtmd-cli`).
- No se documenta modo thinking, soporte de audio ni decodificacion especulativa en la informacion disponible.

## Casos de uso

- Despliegue local de un modelo MoE de ~25B con ~4B activos en una sola GPU consumer: la cuantizacion Q4_0 (14,5 GB) permite cargar el modelo completo en tarjetas de 16-24 GB y obtener velocidad de decodificacion propia de un modelo de 4B activos, util para asistentes personales y prototipado rapido.
- Asistente conversacional con entrada de imagen: usando `llama-mtmd-cli` con el `mmproj` bf16 se pueden procesar capturas de pantalla, documentos escaneados o fotos junto a preguntas en texto, por ejemplo para extraer datos de recibos o describir diagramas.
- Agentes de automatizacion de tareas: dado que el RL se hizo sobre PinchBench en un entorno OpenClaw, el modelo es candidato para pipelines de agentes que resuelven tareas encadenadas (buscar informacion, transformarla y generar una salida), siempre que se valide el comportamiento real en produccion.
- Evaluacion e investigacion en destilacion on-policy: el repositorio incluye la imatrix y los pasos de cuantizacion documentados, lo que lo convierte en un artefacto util para estudiar como afecta la cuantizacion a un estudiante MOPD frente a su profesor.
- Generacion de texto en ingles y chino en entornos sin GPU dedicada: la imatrix se calibro explicitamente con wikitext-103 y Wikipedia en chino tradicional, por lo que las cuantizaciones Q4 estan optimizadas para esos dos idiomas y son adecuadas para resumen o redaccion bilingue en CPU con llama.cpp.
- Base para fine-tuning o experimentos de alineacion: al estar en Apache 2.0 y en formato GGUF, puede servir como referencia de comparacion frente al checkpoint bf16 original en estudios de degradacion por cuantizacion.
- Prototipos de atencion al cliente con contexto multi-turno: el modelo puede mantener conversaciones encadenadas, aunque la longitud de contexto no esta documentada y debe medirse empiricamente antes de comprometerse a ventanas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_0 (4,59 BPW) ~14,5 GB de pesos mas overhead de contexto y cache KV; Q4_K_M (5,32 BPW) ~16,8 GB de pesos. Con `mmproj` bf16 hay que sumar ~1,19 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con margen; RTX 4080/4070 Ti Super (16 GB) para Q4_0 con contexto moderado; A100/H100 solo si se busca throughput alto o servir varios usuarios.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con Q4_0 y contexto contenido; en 12 GB no cabe completo y requeriria offload parcial a CPU (`-ngl`).
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`, `llama-mtmd-cli` para vision), Ollama (importando el GGUF), y cualquier frontend compatible con GGUF. vLLM y TGI no estan documentados para este artefacto GGUF.
- Latencia y throughput: no disponibles. Al tener ~4B parametros activos, la decodificacion deberia ser sensiblemente mas rapida que un modelo denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Gemma4-26B-A4B MOPD student, GGUF) | ~25,2B | ~4B | no disponible | Apache 2.0 | GGUF Q4 | Estudiante destilado, 78 pasos RL, imatrix EN/ZH |
| google/gemma-4-26B-A4B-it (base) | ~25B | ~4B | no disponible | Gemma (term-specific) | safetensors | Modelo original de Google, sin RL adicional |
| Checkpoint bf16 del estudiante | ~25,2B | ~4B | no disponible | Apache 2.0 | safetensors (50,5 GB) | Referencia de calidad maxima; requiere ~50 GB de VRAM |
| Modelos MoE consumer de ~4B activos (p. ej. familia Qwen MoE) | variable | ~3-4B | variable | variable | GGUF | Alternativas de despliegue local; comparacion no disponible con datos verificados |

No se dispone de resultados de benchmarks que permitan comparar rendimiento de forma cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Traccion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de calidad ni de estabilidad del modelo.
- El proceso de RL fue exclusivamente de lenguaje: la torre de vision mantiene pesos congelados y no se beneficia del entrenamiento, por lo que su calidad multimodal es la del checkpoint base, no la de un modelo afinado.
- Solo se documentan dos cuantizaciones (Q4_K_M y Q4_0); no hay Q5, Q6, Q8 ni variantes de mayor fidelidad para comparar degradacion.
- La imatrix se calibro unicamente con ingles y chino tradicional; el comportamiento en castellano u otros idiomas tras la cuantizacion Q4 no esta verificado y podria degradarse mas que en esos dos idiomas.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en ventanas largas ni en conversaciones multi-turno extensas.
- Riesgo de alucinacion inherente a modelos generativos; no hay evaluaciones publicadas de factualidad.
- Licencia: el repositorio declara Apache 2.0, pero los pesos derivan de `google/gemma-4-26B-A4B-it`; conviene revisar los terminos de la licencia Gemma aplicables al modelo base antes de un uso comercial.
- Modelo de autor individual sin model card detallada, sin logs de TensorBoard en este repo y sin resultados de benchmarks: adecuado para experimentacion, arriesgado como dependencia en produccion sin evaluacion propia.
- Entrenamiento de solo 78 pasos de RL: el efecto del ajuste puede ser limitado o inestable, y no hay evidencia de que supere al profesor en tareas generales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps-GGUF
- Modelo base (checkpoint bf16 del estudiante): https://huggingface.co/AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Herramienta de cuantizacion: https://github.com/ggml-org/llama.cpp
- Framework de entrenamiento citado: https://github.com/NVIDIA-NeMo/RL
