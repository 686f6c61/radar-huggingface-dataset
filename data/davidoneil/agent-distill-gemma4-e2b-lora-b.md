# davidoneil/agent-distill-gemma4-e2b-lora-b

## Resumen

`davidoneil/agent-distill-gemma4-e2b-lora-b` es un adaptador LoRA de investigacion (PEFT, bf16) construido sobre `google/gemma-4-E2B-it`. Lo desarrolla el usuario davidoneil y su proposito es la destilacion de comportamiento agentico multi-turno con tool calling sobre un modelo base de tipo "edge" (E2B, orientado a dispositivos). El adaptador se entrena con trayectorias sinteticas verificadas por ejecucion y esta disenado para evaluacion on-device en MLX 4-bit sobre iPhone, en modo sin "thinking".

La relevancia es doble: por un lado, demuestra una receta de destilacion desde un profesor mayor (`Qwen/Qwen3.8-27B-FP8`) hacia un modelo pequeno con formato nativo de tool call de Gemma 4; por otro, documenta de forma explicita el control de contaminacion frente a BFCL (cero tareas BFCL, verificacion por Jaccard de 5-gramas y coseno MiniLM). La variante B esta sesgada a la accion: elimina las trayectorias de rechazo por funcion inexistente (`miss_func_refusal`) y subsamplea deterministicamente las de aclaracion de parametros (`miss_param_clarify`), de modo que los turnos de usuario sin llamada quedan en el 4,99 %.

El repositorio es pequeno (0,1 GB), contiene solo los pesos del adaptador y no incluye el modelo base. No hay pipeline declarado ni idiomas listados, y las descargas y likes son cero en el momento de la consulta. Se trata, por tanto, de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 E2B) con adaptador PEFT LoRA; modulos objetivo `strict_attn_mlp` (205 modulos lineales: q/k/v/o_proj y gate/up/down_proj por capa) |
| Parametros totales | no disponible (el adaptador LoRA con r=16 sobre 205 modulos; el recuento del modelo base no se detalla) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (la receta de entrenamiento usa secuencias de hasta 12000 tokens sin truncado, pero no se declara la ventana de contexto del modelo) |
| Tipos de cuantizacion | adaptador en bf16; evaluacion objetivo en MLX 4-bit sobre `mlx-community/gemma-4-e2b-it-4bit` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (adaptador); modelo base bajo licencia Gemma 4 (Apache-2.0); profesor `Qwen/Qwen3.8-27B-FP8` Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer Gemma 4 E2B. La politica de destino es `strict_attn_mlp`, que abarca 205 modulos lineales (proyecciones de atencion q/k/v/o y MLP gate/up/down en cada capa) y excluye explicitamente convoluciones, capas de atencion lineal, torres multimodales y `lm_head`. La configuracion LoRA es `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"`, `seed=42`. El entrenamiento usa `lr=0.0001`, schedule coseno, `warmup_ratio=0.05`, 2,0 epocas y batch efectivo de 16, con longitud maxima de 12000 tokens sin truncado (2431 trayectorias de entrenamiento y 128 de validacion, ninguna descartada). El enmascaramiento de perdida se limita a los tokens del asistente: sistema, herramientas, usuario, respuestas de herramienta y prefijos de generacion se enmascaran a `-100`.

Los datos son trayectorias agenticas multi-turno sinteticas y verificadas por ejecucion, generadas con cero tareas BFCL (manifiesto de contaminacion con SHA-256 propio; Jaccard de 5-gramas maximo retenido 0,2308 y coseno MiniLM maximo 0,8499). La variante B elimina todas las trayectorias `miss_func_refusal` y subsamplea `miss_param_clarify` con `seed=42` para mantener los turnos sin llamada en el 4,99 %, conservando intactas las trayectorias `read_before_act` y `multi_step_workflow`. El formato nativo de tool call es `<|tool_call>call:name{k:<|"|>v<|"|>}<tool_call|>`. El `chat_template.jinja` es una copia exacta sin modificar del base (SHA-256 documentado).

## Capacidades

- Tool calling / function calling en el formato nativo de Gemma 4, con destilacion especifica para emitir llamadas estructuradas.
- Razonamiento agentico multi-turno: trayectorias de varios pasos con lectura previa a la accion (`read_before_act`) y flujos de trabajo multi-paso (`multi_step_workflow`).
- Politica sesgada a la accion: minimiza respuestas en texto cuando se requiere una llamada (0/167 en la evaluacion interna de la variante B).
- Aclaracion de parametros ante entradas ambiguas (submuestreada pero presente en el dataset).
- Inferencia on-device en iPhone mediante MLX 4-bit, en modo sin "thinking".
- Capacidades del modelo base (generacion de texto, multilingue, vision si el base las soporta): no detalladas en la informacion disponible para este adaptador.

## Casos de uso

- Agentes moviles on-device: el adaptador esta pensado para ejecutarse en iPhone con MLX 4-bit sobre Gemma 4 E2B, lo que permite invocar herramientas locales (calendario, contactos, ficheros) sin enviar datos a la nube.
- Asistentes con tool calling en produccion ligera: el formato nativo parseable (97,8 % en la variante B) facilita el encaje en pipelines que validan llamadas estructuradas antes de ejecutarlas.
- Flujos multi-paso con lectura previa: escenarios donde el agente debe consultar estado (`read_before_act`) antes de mutar recursos, como gestion de incidencias o automatizacion de tareas.
- Investigacion en destilacion de agentes: receta reproducible (hashes de dataset, manifiesto de contaminacion, modulos objetivo) para estudiar transferencia de profesor grande a modelo edge.
- Evaluacion de robustez de tool calling: la variante B, con turnos sin llamada al 4,99 %, sirve para medir el equilibrio entre actuar y abstenerse en benchmarks propios.
- Clarificacion de parametros en asistentes conversacionales: cuando faltan datos para una llamada, el modelo puede pedir aclaracion en lugar de inventar argumentos, util en formularios o reservas.

## Benchmarks y rendimiento

Los unicos datos publicados son de evaluacion interna sobre el split de validacion retenido (no BFCL):

| Modelo | Verifier pass rate | Formato nativo parseable | Texto sin tool call (se requeria llamada) |
|---|---:|---:|---:|
| Base `google/gemma-4-E2B-it` | 26/60 (43,3 %) | 100,0 % (288/288) | 6/167 (3,6 %) |
| Base + LoRA (variante A) | 49/60 (81,7 %) | 100,0 % (326/326) | 2/167 (1,2 %) |
| Base + LoRA (variante B) | 46/60 (76,7 %) | 97,8 % (361/369) | 0/167 (0,0 %) |

Perdida: paso 0 en validacion 1,2878; perdida final de entrenamiento 0,2795; perdida final de validacion 0,2145. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador en si ocupa 0,1 GB en bf16.
- Objetivo declarado: iPhone con MLX 4-bit (`mlx-community/gemma-4-e2b-it-4bit`), lo que implica que el modelo base cuantizado cabe en memoria de dispositivo movil.
- GPU recomendadas: no disponibles; por el perfil E2B se espera que quepa en GPU consumer, pero no se aportan cifras.
- Opciones de despliegue: MLX (objetivo principal); PEFT para carga del adaptador en bf16; otros runners (llama.cpp, Ollama, vLLM, TGI) no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidoneil/agent-distill-gemma4-e2b-lora-b` | no disponible (adaptador LoRA sobre Gemma 4 E2B) | no disponible | Destilacion agentica multi-turno, tool calling | apache-2.0 | Hugging Face, 0 descargas |
| `google/gemma-4-E2B-it` (base) | no disponible | no disponible | Modelo instructivo edge | licencia Gemma 4 (Apache-2.0) | Hugging Face |
| `Qwen/Qwen3.8-27B-FP8` (profesor) | 27B (FP8) | no disponible | Modelo grande usado como profesor | apache-2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion experimental, no un modelo validado para produccion.
- El sesgo a la accion de la variante B reduce las abstenciones: puede emitir llamadas cuando lo correcto seria no llamar, aunque el dataset elimina los rechazos por funcion inexistente.
- La evaluacion se limita a un split interno de 60 casos; no hay resultados en BFCL ni en benchmarks publicos, por lo que la generalizacion es desconocida.
- El formato nativo parseable baja al 97,8 % en la variante B (frente al 100 % de la base y la variante A), lo que implica un pequeno porcentaje de salidas no parseables.
- Depende del modelo base y de su plantilla de chat exacta; modificar el `chat_template.jinja` puede romper el formato de tool call.
- Idiomas soportados no declarados; el comportamiento multilingue hereda del base y no se ha evaluado.
- Riesgo de alucinacion y sesgos del modelo base no cuantificado en la informacion disponible.
- Uso comercial sujeto a la licencia del modelo base (Gemma 4) y a la procedencia del profesor (Apache-2.0); revisar terminos antes de desplegar.
- Cero descargas y cero likes: sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/davidoneil/agent-distill-gemma4-e2b-lora-b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Base MLX 4-bit objetivo: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
