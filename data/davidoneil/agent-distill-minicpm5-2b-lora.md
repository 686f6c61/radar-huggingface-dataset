# davidoneil/agent-distill-minicpm5-2b-lora

## Resumen

`davidoneil/agent-distill-minicpm5-2b-lora` es un adaptador PEFT LoRA de investigación, en precisión bf16, entrenado sobre el modelo base `openbmb/MiniCPM5-2B`. Lo desarrolla el usuario davidoneil y su propósito es mejorar las capacidades de tool calling y razonamiento agéntico multi-turno de un modelo pequeño de 2B parámetros, orientado a su evaluación en dispositivos móviles (concretamente iPhone mediante MLX en cuantización 4-bit). El adaptador se distribuye con licencia Apache-2.0, heredada del modelo base.

La relevancia del proyecto reside en su enfoque metodológico: la destilación de trayectorias agénticas sintéticas verificadas por ejecución, generadas a partir de un modelo profesor mucho mayor (`Qwen/Qwen3.8-27B-FP8`). El autor documenta explícitamente un control de contaminación contra el benchmark BFCL (Berkeley Function Calling Leaderboard), con métricas de solapamiento n-grama y coseno, lo que resulta poco habitual en adaptadores de investigación de este tamaño.

El adaptador aplica LoRA sobre 294 módulos lineales (atención y MLP de todas las capas), excluyendo las torres multimodales, las capas convolucionales y `lm_head`. No se trata de un modelo completo, sino de un delta de pesos que requiere cargar el modelo base para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base MiniCPM5-2B) con adaptador PEFT LoRA |
| Parametros totales | no disponible (el adaptador LoRA ocupa ~0.1 GB; el modelo base es de 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia en entrenamiento: 12000 tokens) |
| Tipos de cuantizacion | bf16 (adaptador); el modelo base se evaluó en MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `openbmb/MiniCPM5-2B` (commit `42433e90`) mediante PEFT LoRA en bf16 con rango `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"` y semilla 42. La política de módulos objetivo es `strict_attn_mlp`, que cubre 294 módulos lineales: las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` y las proyecciones MLP `gate_proj`, `up_proj`, `down_proj` de cada capa, excluyendo explícitamente convoluciones, `linear_attn`, las torres multimodales y `lm_head`. La optimización usa `lr=0.0001`, scheduler coseno, `warmup_ratio=0.05`, 2 épocas y batch efectivo de 16, con longitud máxima de 12000 tokens y sin truncación (3020 trayectorias de entrenamiento y 159 de validación, ninguna descartada). El enmascaramiento de pérdida se aplica solo a los tokens del asistente; sistema, herramientas, usuario, respuestas de herramientas y prefijos de generación se enmascaran a `-100`.

Los datos de entrenamiento son trayectorias agénticas multi-turno sintéticas y verificadas por ejecución, generadas con el profesor `Qwen/Qwen3.8-27B-FP8` (Apache-2.0). Cubren cuatro categorías: `read_before_act`, `multi_step_workflow`, `miss_param_clarify` y `miss_func_refusal`. El autor documenta ausencia total de contaminación con BFCL mediante verificación de solapamiento (Jaccard de 5-gramas ≤ 0.30 y coseno MiniLM ≤ 0.85; máximo retenido Jaccard 0.2308, coseno 0.8499; 2 tareas BFCL rechazadas). El formato nativo de tool call es XML: `<function name="..."><param name="...">...</param></function>`. El `chat_template.jinja` es una copia exacta sin modificar del modelo base.

## Capacidades

- Tool calling en formato XML nativo con parámetros nombrados.
- Razonamiento agéntico multi-turno: lectura antes de actuar, flujos de trabajo en varios pasos, aclaración de parámetros faltantes y rechazo ante funciones inexistentes.
- Distinción entre pedir aclaración (`miss_param_clarify`) y rechazar una llamada a función no disponible (`miss_func_refusal`).
- Ejecución en modo sin thinking (`enable_thinking=False`) para inferencia en iPhone.
- Capacidades multimodales del modelo base: no disponibles en la información proporcionada (el adaptador excluye las torres multimodales del entrenamiento).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistentes agénticos en dispositivos móviles: el adaptador está diseñado y evaluado para inferencia en iPhone con MLX 4-bit y modo sin thinking, lo que permite ejecutar un agente de tool calling localmente sin conexión a la nube.
- Automatización de flujos de trabajo multi-paso: el entrenamiento incluye la categoría `multi_step_workflow`, por lo que el modelo puede encadenar varias llamadas a herramientas manteniendo el estado de la conversación.
- Clarificación de parámetros en formularios y APIs: la categoría `miss_param_clarify` entrena al modelo para solicitar los datos que faltan en lugar de inventar valores, útil en integraciones con APIs estrictas.
- Rechazo controlado de funciones inexistentes: la categoría `miss_func_refusal` permite desplegar agentes que no alucinen llamadas a herramientas no registradas, relevante en entornos de producción con catálogos de funciones dinámicos.
- Lectura previa a la acción en pipelines de datos: la categoría `read_before_act` entrena al modelo para consultar el estado o los recursos antes de ejecutar una operación, aplicable a agentes de gestión de ficheros o bases de datos.
- Investigación sobre destilación agéntica: el adaptador sirve como artefacto reproducible para estudiar cómo un modelo de 2B puede aproximarse a un profesor de 27B en tareas de tool calling, con receta y hashes documentados.
- Evaluación comparativa de adaptadores LoRA pequeños: útil como línea base para experimentos de destilación con control de contaminación en benchmarks de function calling.

## Benchmarks y rendimiento

Los únicos datos publicados son una evaluación de humo interna sobre el split de validación retenido (no BFCL), con verificación automática:

| Modelo | Verifier pass rate | Formato nativo parseable | Texto sin tool call (se requería llamada) |
|---|---:|---:|---:|
| Base (`openbmb/MiniCPM5-2B`) | 27/60 (45.0%) | 99.7% (356/357) | no disponible |
| Base + LoRA (Variante A) | 51/60 (85.0%) | 100.0% (335/335) | no disponible |

Pérdida en validación interna retenida: paso 0 = 0.6209; pérdida final de entrenamiento = 0.2200; pérdida final de validación = 0.2036.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB en bf16; requiere cargar el modelo base MiniCPM5-2B (~2B parámetros) para la inferencia.
- VRAM estimada para el modelo base: en bf16, en torno a 4-5 GB; en 4-bit, en torno a 1.5-2.5 GB (estimación orientativa, no confirmada en la información disponible).
- Cabe en GPU de consumo: el modelo base de 2B en 4-bit es apto para GPUs con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) y para hardware Apple Silicon mediante MLX.
- El autor valida la inferencia en iPhone con MLX 4-bit (`openbmb/MiniCPM5-2B-MLX`), lo que confirma viabilidad en hardware móvil.
- Opciones de despliegue: PEFT con transformers, MLX (objetivo declarado), y presumiblemente llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidoneil/agent-distill-minicpm5-2b-lora` | 2B (base) + LoRA | no disponible | Tool calling agéntico multi-turno destilado | Apache-2.0 | Hugging Face (0 descargas) |
| `openbmb/MiniCPM5-2B` | 2B | no disponible | Modelo base generalista | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3.8-27B-FP8` | 27B | no disponible | Profesor de destilación, FP8 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Adaptador de investigación: el propio autor lo etiqueta como experimental; no está pensado para producción sin validación adicional.
- Evaluación limitada: los resultados proceden de un split interno de validación (60 muestras de verificación) y no de benchmarks públicos como BFCL.
- Sesgos: no documentados en la información disponible; al entrenarse sobre trayectorias sintéticas generadas por un profesor, puede heredar sesgos de este.
- Riesgo de alucinación: mitigado parcialmente por las categorías de clarificación y rechazo, pero no cuantificado fuera del split interno.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizó sobre trayectorias sintéticas cuya composición lingüística no se detalla.
- Contexto: la longitud máxima de entrenamiento fue de 12000 tokens; no se documenta la ventana de contexto efectiva del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base y la procedencia del profesor (ambas Apache-2.0).
- Formato de tool call rígido: el adaptador espera el formato XML nativo; desviarse de él puede degradar el rendimiento.
- Requiere el modelo base: no es un modelo autónomo; hay que cargar `openbmb/MiniCPM5-2B` y aplicar el adaptador.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/davidoneil/agent-distill-minicpm5-2b-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo base MLX para iPhone: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Paper, blog o repositorio adicional: no disponibles en la información proporcionada.
