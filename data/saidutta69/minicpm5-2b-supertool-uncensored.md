# saidutta69/MiniCPM5-2B-Supertool-Uncensored

## Resumen

MiniCPM5-2B-Supertool-Uncensored es una variante "abliterada" (decensored) del modelo saidutta69/MiniCPM5-2B-Supertool, que a su vez es un ajuste fino con QLoRA orientado a tool calling sobre openbmb/MiniCPM5-2B. Lo publica el usuario saidutta69 y su proposito es ofrecer un modelo pequeno (2.516.756.480 parametros, unos 2,52B) capaz de ejecutar function calling y tareas de agente de codigo en hardware de consumo, pero sin la capa de rechazos que el modelo base hereda del alineamiento. La edicion se realizo con Heretic 2.1.0 en su variante Arbitrary-Rank Ablation (ARA), eliminando un subespacio de rechazo de rango 100 en las capas 19 a 35.

El modelo conserva la plantilla ChatML para esquemas de herramientas, una ventana de contexto de 131.072 tokens y un peso en fp16 de 5,03 GB, lo que permite ejecutarlo en una GPU de 6 GB o con offload a CPU. La relevancia actual reside en que combina tres factores poco habituales en modelos de este tamano: contexto largo real, soporte nativo de tool calling con formato estricto y un perfil de rechazo reducido de forma medible (de 96/100 a 12/100 en el conjunto de evaluacion del autor), manteniendo la licencia Apache-2.0.

Es importante subrayar que no se trata de un nuevo ajuste fino, sino de una resta de direcciones de pesos sobre el checkpoint base. El autor reporta una perdida de capacidad de aproximadamente 1,27 puntos porcentuales en MMLU respecto al modelo original, y advierte de que la precision de function calling no se volvio a medir tras la edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MiniCPM5, linaje llama en transformers) |
| Parametros totales | 2.516.756.480 (2,52B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible (solo se publica checkpoint fp16; no hay GGUF) |
| Idiomas soportados | Ingles y chino (segun model card); la metadata de HF solo declara en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16), libreria transformers |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia MiniCPM5 con 2,52B parametros y 42 capas. El modelo original openbmb/MiniCPM5-2B fue ajustado por saidutta69 mediante QLoRA sobre trazas de agente estilo Claude Code, con el objetivo de especializarlo en tool calling, generacion de comandos de shell y emision de JSON estricto. Los datasets declarados para ese ajuste son saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x.

Sobre ese checkpoint (revision ef27362) se aplico Heretic 2.1.0 con ARA: en lugar de restar una unica direccion de rango 1, se aprende una actualizacion de bajo rango por modulo editado. Los parametros concretos del trial 39 de 300 (semilla 42) incluyen start_layer_index 19, end_layer_index 35, lora_rank 100, preserve_good_behavior_weight 0.7948, steer_bad_behavior_weight 0.0102, overcorrect_relative_weight 0.7500, neighbor_count 8, n_optimization_steps 5, max_iter 20 y preserve_row_magnitudes activado. La edicion afecta a attn.o_proj y mlp.down_proj de las capas 19 a 35 de 42, dejando intacta la parte frontal de la red (incluida la interfaz con el tokenizer), lo que segun el autor explica que el formato de tool call sobreviva. El directorio reproduce/ incluye config.toml, requirements.txt, el journal de Optuna y sumas SHA-256 para regenerar el checkpoint con heretic --reproduce.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Tool calling y function calling con esquema JSON en ChatML: las herramientas se declaran en `<tools>` y los resultados vuelven como `tool_response`.
- Emision de bloques `think` vacios antes de la respuesta; se pueden recortar hasta `` para obtener solo la respuesta.
- Generacion de codigo, comandos bash y scripts para agentes de terminal.
- Soporte de razonamiento multi-paso orientado a agentes de codigo (trazas estilo Claude Code).
- Contexto largo de 131.072 tokens, adecuado para repositorios y sesiones de agente extensas.
- Inferencia offline y local en GPU de consumo o CPU.
- Supresion parcial de rechazos: el autor reporta 12/100 rechazos frente a 96/100 del base.
- No se documentan capacidades de vision, audio ni modo thinking con contenido (el bloque think se emite vacio).

## Casos de uso

- Agente de codigo local: el modelo puede gestionar bucles de tool calling sobre un repositorio gracias a su ventana de 131.072 tokens, invocando herramientas Bash o de edicion definidas en el esquema ChatML. Es adecuado porque el ajuste se entreno sobre trazas de agente reales y el formato estricto se conserva tras la abliteracion.
- Automatizacion de terminal y scripting: genera comandos de shell y los encadena mediante function calling, lo que permite construir asistentes de operaciones que ejecutan y verifican comandos en local sin depender de una API externa.
- Asistente de CI/CD: integrado en pipelines para generar parches, interpretar salidas de tests y proponer correcciones, con la ventaja de que el modelo cabe en una GPU de 6 GB y puede ejecutarse en el propio runner.
- Prototipado de agentes con contexto largo: util para experimentar con ventanas de 128K tokens en hardware modesto, por ejemplo para resumir repositorios completos o mantener memoria de sesion prolongada.
- Despliegue en edge y entornos air-gapped: al ser offline y de 5,03 GB en fp16, puede ejecutarse en estaciones de trabajo sin conectividad, algo relevante en entornos con requisitos de confidencialidad.
- Evaluacion de tecnicas de abliteracion: sirve como caso reproducible (parametros, semilla y journal incluidos) para investigadores que estudien la supresion de rechazos y su impacto en capacidades y formato.
- Generacion de JSON estricto para integraciones: con temperatura baja produce salidas JSON mas rigurosas, util para rellenar estructuras de datos en pipelines automatizados.

## Benchmarks y rendimiento

| Metrica | Este modelo | Base (MiniCPM5-2B-Supertool) |
|---|---|---|
| Rechazos | 12/100 | 96/100 |
| Divergencia KL | 0,0494 | No aplica |
| PIQA acc_norm | 0,7084 | No disponible en la informacion |
| MMLU acc | 0,5471 | Aproximadamente 0,5598 (1,27 pp superior) |
| Precision de function calling | No re-medida tras la edicion | No disponible en la informacion |

No se han publicado resultados de benchmarks de tool calling (tipo FC-Eval) re-verificados en la informacion disponible. Las cifras de MMLU se midieron sobre 14.042 preguntas segun el autor.

## Requisitos de hardware

- VRAM estimada: 5,03 GB en fp16 para el checkpoint completo; con `device_map="auto"` cabe en una GPU de 6 GB.
- GPU recomendadas: RTX 3060 6 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, A100 y H100. En GPUs de 24 GB o mas se puede cargar en fp16 sin offload y con margen para el contexto.
- Cabe en GPU de consumo: si, en cualquier tarjeta con al menos 6 GB de VRAM; tambien puede ejecutarse en CPU con offload.
- Opciones de despliegue: transformers (soporte nativo, segun la model card). No se publican archivos GGUF, por lo que llama.cpp y Ollama no estan disponibles de forma directa en la informacion proporcionada. La metadata incluye la etiqueta text-generation-inference, pero no se documenta configuracion especifica para TGI o vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de generacion recomendados: temperature 0.6, top_p 0.95, max_new_tokens 512 en el ejemplo del autor; valores mas bajos de temperatura producen JSON mas estricto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B-Supertool-Uncensored | 2,52B | 131.072 | Apache-2.0 | Variante abliterada, sin GGUF, tool calling no re-verificado |
| MiniCPM5-2B-Supertool (base) | 2,52B | 131.072 | Apache-2.0 | Version alineada, mismas capacidades, rechazos 96/100 |
| openbmb/MiniCPM5-2B | 2B (aproximado) | No disponible en la informacion | No disponible en la informacion | Modelo original sin ajuste de tool calling |
| Alternativas de 2-3B para agentes locales | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otras familias (Qwen, Llama, Gemma de tamano similar) en la informacion proporcionada; no se incluyen cifras para evitar invenciones.

## Limitaciones y advertencias

- No es totalmente "uncensored": el autor reconoce que aproximadamente 1 de cada 8 prompts sigue siendo rechazado (12/100). No es adecuado para quien necesite garantias de rechazo.
- Perdida de capacidad medida: MMLU cae 1,27 pp respecto al base; PIQA se situa en 0,7084. El impacto en tareas de codigo y tool calling no se ha re-medido.
- Precision de function calling no re-verificada tras la edicion: riesgo real de degradacion del formato JSON o de la seleccion de herramienta en produccion.
- Riesgo de alucinacion: modelo de 2,5B con contexto de 131K; en ventanas muy largas puede perder informacion intermedia y generar comandos o rutas inexistentes.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento se limita a ingles y chino, con posible degradacion en castellano.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que no debe usarse donde se requiera rechazo garantizado ni en APIs alojadas con filtrado.
- No hay GGUF publicado: el despliegue en llama.cpp u Ollama requiere conversion propia.
- La edicion de pesos con abliteracion puede producir respuestas menos coherentes en dominios sensibles; conviene validar con evaluaciones propias antes de produccion.
- El bloque `think` se emite vacio; si se espera razonamiento explicito, el modelo no lo proporciona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool-Uncensored
- Modelo base (Supertool): https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Dataset saidutta69/fable-5.1-premium-v2: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
