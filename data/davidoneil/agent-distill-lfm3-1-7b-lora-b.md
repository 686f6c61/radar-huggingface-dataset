# davidoneil/agent-distill-lfm3-1.7b-lora-b

## Resumen

`davidoneil/agent-distill-lfm3-1.7b-lora-b` es un adaptador LoRA de investigacion (bf16, PEFT) sobre el modelo base `LiquidAI/LFM3-1.7B`. Lo desarrolla el usuario davidoneil y esta orientado a dotar a un modelo pequeno (1.700 millones de parametros) de capacidades de tool calling y razonamiento agentico multi-turno mediante destilacion desde un profesor de mayor tamano (`Qwen/Qwen3.8-27B-FP8`, Apache-2.0). El objetivo declarado es la evaluacion en dispositivo (iPhone) con la variante MLX 4-bit del modelo base.

La variante B, denominada "action-biased", se construye a partir de un dataset sintetico de trayectorias agenticas verificadas por ejecucion, eliminando las trayectorias de tipo `miss_func_refusal` y submuestreando de forma determinista las de tipo `miss_param_clarify`, de modo que los turnos de usuario sin llamada a herramienta quedan en el 4,99 % del total. El adaptador mantiene intactas las trayectorias de tipo `read_before_act` y `multi_step_workflow`.

Su relevancia radica en que demuestra que un modelo de 1,7B puede mejorar sustancialmente su tasa de exito en tool calling (del 25 % al 80 % en la validacion interna del autor) con un adaptador de apenas 0,1 GB, lo que lo hace candidato para agentes locales en movil. No obstante, se trata de un artefacto de investigacion sin benchmarks publicos externos (BFCL explicitamente excluido) y con licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI LFM3-1.7B |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA es un subconjunto no cuantificado en la ficha |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud de secuencia de entrenamiento: 12.000 tokens) |
| Tipos de cuantizacion | bf16 (adaptador); el modelo base se evalua en MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License v1.0 del modelo base) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base `LiquidAI/LFM3-1.7B` (commit `1da06bec6a819da10b54c67e5c90972b46d81871`), un transformer de 1,7B parametros. La politica de destino del LoRA es `strict_attn_mlp` con 116 modulos lineales: las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` de las capas de atencion y las proyecciones `w1`, `w2`, `w3` de las capas feed-forward, excluyendo convoluciones, atencion lineal, torres multimodales y `lm_head`. La configuracion es `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"` y `seed=42`.

El entrenamiento usa un dataset sintetico de 2.559 trayectorias agenticas verificadas por ejecucion (2.431 de entrenamiento, 128 de validacion), generadas por el profesor `Qwen/Qwen3.8-27B-FP8` y con cero tareas de BFCL (verificado por Jaccard de 5-gramas <= 0,30 y coseno MiniLM <= 0,85). Se optimiza con `lr=0.0001`, schedule coseno, `warmup_ratio=0.05`, 2,0 epocas, batch efectivo de 16 y longitud maxima de 12.000 tokens sin truncamiento. La mascara de perdida se aplica solo a los tokens del asistente (system, tools, user, respuestas de herramienta y prefijos de generacion enmascarados a `-100`). El formato nativo de tool call es XML: `<tool_call>\n<function=name>\n<parameter=k>...</parameter>\n</function>\n</tool_call>`, y la inferencia en iPhone se realiza sin modo thinking (`enable_thinking=False`).

## Capacidades

- Tool calling y function calling en formato XML nativo, con tasa de parseo del 100 % en la validacion interna.
- Razonamiento agentico multi-turno: trayectorias de tipo `read_before_act` y `multi_step_workflow`.
- Planificacion de acciones con sesgo hacia la accion (variante B), reduciendo las respuestas sin llamada a herramienta.
- Destilacion de comportamiento agentico desde un profesor de 27B hacia un modelo de 1,7B.
- Inferencia en dispositivo (iPhone) mediante el modelo base en MLX 4-bit.
- Capacidades multilingues: no disponibles.
- Modo thinking: desactivado por diseno en el escenario de evaluacion.

## Casos de uso

- Agentes locales en movil: el adaptador esta pensado para ejecutarse sobre `LFM3-1.7B-MLX-4bit` en iPhone, permitiendo tool calling en el dispositivo sin depender de la nube y con un adaptador de 0,1 GB.
- Automatizacion de flujos multi-paso: las trayectorias `multi_step_workflow` entrenan al modelo para encadenar varias llamadas a herramientas en una misma conversacion, util en asistentes que consultan APIs y actuan sobre el resultado.
- Lectura antes de actuar: las trayectorias `read_before_act` permiten al modelo consultar el estado o los datos necesarios antes de ejecutar una accion, reduciendo errores en integraciones con sistemas externos.
- Prototipado rapido de agentes: al ser un adaptador PEFT ligero sobre un modelo de 1,7B, se puede cargar y probar en pipelines de investigacion sin infraestructura de gran escala.
- Evaluacion de destilacion de agentes: sirve como referencia para estudiar como se transfiere comportamiento agentico desde un profesor de 27B a un modelo pequeno, con dataset y manifiesto de contaminacion documentados.
- Asistentes de operaciones con herramientas: el sesgo hacia la accion de la variante B es adecuado para escenarios donde el modelo debe invocar herramientas con frecuencia (por ejemplo, consultas a bases de datos o ejecucion de comandos controlados) y donde las aclaraciones excesivas penalizan la latencia.
- Investigacion sobre formatos nativos de tool call: el formato XML documentado y el `chat_template.jinja` sin modificar facilitan reproducir y comparar el comportamiento frente a otros formatos.

## Benchmarks y rendimiento

Datos de la validacion interna del autor (held-out, no BFCL):

| Modelo | Tasa de exito del verificador | Formato nativo parseable | Texto sin tool call (se requeria llamada) |
|---|---:|---:|---:|
| Base (`LiquidAI/LFM3-1.7B`) | 15/60 (25,0 %) | 99,8 % (416/417) | 3/167 (1,8 %) |
| Base + LoRA (variante A) | 51/60 (85,0 %) | 100,0 % (325/325) | 0/167 (0,0 %) |
| Base + LoRA (variante B) | 48/60 (80,0 %) | 100,0 % (325/325) | 1/167 (0,6 %) |

Perdida en validacion interna: paso 0 = 0,5119; perdida final de entrenamiento = 0,2090; perdida final de validacion = 0,1916. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en bf16 requiere aproximadamente 3,4 GB de pesos; en 4-bit (MLX) alrededor de 1 GB, mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo base en bf16; para 4-bit basta con hardware integrado o movil compatible con MLX.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060/4060 (8-12 GB) y en Apple Silicon; el escenario objetivo declarado es iPhone con MLX 4-bit.
- Opciones de despliegue: MLX (objetivo declarado), PEFT sobre PyTorch/Transformers; vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidoneil/agent-distill-lfm3-1.7b-lora-b` | 1,7B (base) + LoRA | no disponible | Si (XML nativo) | other (LFM v1.0) | Hugging Face |
| `LiquidAI/LFM3-1.7B` (base) | 1,7B | no disponible | Parcial (25 % exito en validacion interna) | LFM v1.0 | Hugging Face |
| `Qwen/Qwen3.8-27B-FP8` (profesor) | 27B | no disponible | Si | Apache-2.0 | Hugging Face |
| Variante A del mismo adaptador | 1,7B (base) + LoRA | no disponible | Si (85 % exito en validacion interna) | other (LFM v1.0) | Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo etiqueta explicitamente como adaptador experimental, no como modelo listo para produccion.
- Sin benchmarks externos: no hay resultados en BFCL ni en benchmarks estandar (MMLU, HumanEval, GSM8K); las cifras disponibles son de validacion interna del autor.
- Sesgo hacia la accion: la variante B elimina las trayectorias `miss_func_refusal` y submuestrea `miss_param_clarify`, por lo que el modelo puede invocar herramientas cuando seria preferible pedir aclaracion o rechazar la accion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el entrenamiento se centra en tool calling, no en veracidad factual.
- Idiomas: no disponibles; no se documenta cobertura multilingue.
- Contexto: no se documenta la ventana de contexto del modelo base; la longitud de entrenamiento fue de 12.000 tokens.
- Licencia: hereda la LFM Open License v1.0 del modelo base; es necesario revisar sus restricciones para uso comercial.
- Dependencia del profesor: el comportamiento destilado depende de la calidad y cobertura de las trayectorias sinteticas generadas por `Qwen/Qwen3.8-27B-FP8`.
- Formato de tool call especifico: el XML nativo requiere un parser compatible; el `chat_template.jinja` debe usarse sin modificar (SHA-256 documentado).
- Sin descargas ni likes: el repositorio no tiene traccion, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/davidoneil/agent-distill-lfm3-1.7b-lora-b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/1da06bec6a819da10b54c67e5c90972b46d81871/LICENSE
- Modelo base MLX 4-bit: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
