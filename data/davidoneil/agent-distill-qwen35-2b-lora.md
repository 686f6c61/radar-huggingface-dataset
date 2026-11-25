# davidoneil/agent-distill-qwen35-2b-lora

## Resumen

`davidoneil/agent-distill-qwen35-2b-lora` es un adaptador LoRA de investigación (PEFT, bf16) construido sobre el modelo base `Qwen/Qwen3.5-2B`. Lo desarrolla el usuario de Hugging Face davidoneil y su propósito es mejorar las capacidades de *tool calling* y razonamiento agéntico multi-turno de un modelo pequeño de 2B parámetros, destilando trayectorias sintéticas generadas por un modelo profesor de mayor tamaño (`Qwen/Qwen3.8-27B-FP8`). El objetivo declarado es la evaluación en dispositivo (on-device) mediante MLX a 4 bits en iPhone.

El adaptador se entrena exclusivamente sobre un conjunto de trayectorias sintéticas verificadas por ejecución, con una política explícita de "cero contaminación" respecto a los benchmarks BFCL (no se usó ninguna tarea, prompt, estado inicial ni ground truth de BFCL v4 Multi-Turn). Es, por tanto, un artefacto de investigación orientado a medir la transferencia de comportamiento agéntico desde un profesor grande hacia un alumno pequeño en el dominio de las llamadas a herramientas.

La relevancia actual radica en su enfoque: modelos de 2B parámetros con capacidad fiable de *function calling* multi-turno son atractivos para despliegue local y en móvil, donde el coste de cómputo y memoria es crítico. El adaptador reporta una mejora sustancial en la tasa de aprobación del verificador interno (de 55,0% a 86,7%) sobre su split de validación retenido, aunque no se han publicado resultados en benchmarks públicos estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PEFT LoRA sobre transformer decoder-only (base Qwen3.5-2B); target policy `strict_attn_mlp` con 96 módulos lineales |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usó secuencias de hasta 12.000 tokens sin truncado |
| Tipos de cuantizacion | Adaptador en bf16; evaluación objetivo sobre base MLX 4-bit (`mlx-community/Qwen3.5-2B-4bit`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT en bf16 con rango `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"` y `seed=42`. Se aplica sobre 96 módulos lineales bajo la política `strict_attn_mlp`, que incluye proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` y las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de determinadas capas, excluyendo explícitamente convoluciones, capas de atención lineal, torres multimodales y `lm_head`. La optimización usa `lr=0.0001`, schedule coseno, `warmup_ratio=0.05`, 2,0 épocas y batch efectivo de 16, con longitud máxima de secuencia de 12.000 tokens y sin truncado (9.274 muestras de entrenamiento y 490 de validación conservadas, cero descartadas). El enmascaramiento de pérdida se aplica solo a tokens del asistente, dejando a `-100` los tokens de sistema, herramientas, usuario, payloads de respuesta de herramientas y prefijos de generación.

Los datos de entrenamiento son trayectorias sintéticas multi-turno verificadas por ejecución, generadas por el profesor `Qwen/Qwen3.8-27B-FP8` (Apache-2.0). El conjunto tiene 3.179 trayectorias (3.020 train / 159 val) y cubre cuatro categorías: `read_before_act`, `multi_step_workflow`, `miss_param_clarify` y `miss_func_refusal`. La variante A corresponde a la mezcla sintética completa. El autor declara cero contaminación con BFCL, verificada mediante Jaccard de 5-gramas `<= 0.30` y coseno MiniLM `<= 0.85` (Jaccard máximo retenido 0,2308; coseno máximo 0,8499). El formato nativo de tool call es XML: `<tool_call>\n<function=name>\n<parameter=k>...</parameter>\n</function>\n</tool_call>`, y el modo de inferencia objetivo en iPhone es *thinking* (`<think>`) con tope de 512 tokens.

## Capacidades

- Generación de texto y razonamiento multi-turno en el contexto de tareas agénticas.
- *Tool calling* / *function calling* en formato XML nativo, con llamadas anidadas y parámetros nombrados.
- Comportamiento de lectura antes de actuar (`read_before_act`): consultar información antes de ejecutar acciones.
- Ejecución de flujos multi-paso (`multi_step_workflow`).
- Clarificación ante parámetros faltantes (`miss_param_clarify`): solicitar información al usuario en lugar de inventarla.
- Rechazo ante referencias a funciones inexistentes (`miss_func_refusal`).
- Modo *thinking* (`<think>`) para razonamiento previo a la acción, con tope de 512 tokens en el escenario objetivo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de voz o chat en dispositivo móvil: el adaptador está pensado para ejecutarse sobre `Qwen3.5-2B` cuantizado a 4 bits en MLX en iPhone, permitiendo *tool calling* local sin conexión a un servidor y con latencia baja.
- Automatización de tareas de sistema operativo: el modelo puede encadenar llamadas a herramientas (leer estado, consultar datos, ejecutar acciones) siguiendo el patrón `read_before_act`, adecuado para agentes que operan sobre APIs locales del dispositivo.
- Flujos de trabajo multi-paso en asistentes domésticos o de productividad: la categoría `multi_step_workflow` entrena al modelo para descomponer una petición en varias llamadas secuenciales con dependencias entre ellas.
- Diálogos de clarificación en atención al cliente: la categoría `miss_param_clarify` permite que el modelo pregunte por datos faltantes antes de ejecutar una acción, reduciendo ejecuciones erróneas por parámetros incompletos.
- Guardarraíles de seguridad en agentes: la categoría `miss_func_refusal` entrena al modelo para rechazar invocaciones a funciones no disponibles, útil como capa de contención en pipelines agénticos.
- Investigación sobre destilación de agentes: el adaptador sirve como artefacto reproducible para estudiar la transferencia de comportamiento agéntico desde un profesor de 27B a un alumno de 2B, con receta y hashes documentados.
- Evaluación comparativa de *tool calling* en modelos pequeños: útil para medir la brecha entre modelos de 2B y modelos mayores en tareas de función, siempre que se use un conjunto de evaluación distinto de BFCL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks públicos estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible. El autor reporta únicamente métricas sobre su split de validación interno retenido, explícitamente no BFCL:

| Modelo | Tasa de aprobación del verificador | Formato nativo parseable | Texto sin tool call (se requería llamada) |
|---|---:|---:|---:|
| Base (`Qwen/Qwen3.5-2B`) | 33/60 (55,0%) | 99,3% (415/418) | n/a |
| Base + LoRA (Variante A) | 52/60 (86,7%) | 100,0% (340/340) | n/a |

Pérdida en validación interna: paso 0 = 0,5385; pérdida final de entrenamiento = 0,2194; pérdida final de validación = 0,2126.

## Requisitos de hardware

- El adaptador LoRA en bf16 es de tamaño reducido (repo de 0,0 GB reportado), pero requiere cargar el modelo base `Qwen/Qwen3.5-2B` para inferencia.
- VRAM estimada para el modelo base en bf16: aproximadamente 4-5 GB; en 4 bits, del orden de 1,5-2 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; el escenario objetivo declarado es Apple Silicon vía MLX 4-bit.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores en cuantización 4-bit; no confirmado por el autor.
- Opciones de despliegue: `peft` + `transformers` para carga del adaptador; MLX para el escenario on-device; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoría, ni datos públicos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Adaptador de investigación: el autor lo etiqueta explícitamente como experimental; no está validado para producción.
- Entrenado sobre datos sintéticos generados por un profesor; puede heredar sesgos y errores del profesor `Qwen/Qwen3.8-27B-FP8`.
- Sin evaluación en benchmarks públicos: las métricas reportadas son sobre un split interno, no comparable con resultados publicados de otros modelos.
- Riesgo de alucinación en llamadas a herramientas no cubiertas por las cuatro categorías de entrenamiento; el rechazo solo se entrena para funciones inexistentes.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Ventana de contexto efectiva no documentada de forma explícita; el entrenamiento usó hasta 12.000 tokens, pero no se confirma el contexto nativo del base.
- El modo *thinking* está limitado a 512 tokens en el escenario objetivo, lo que puede truncar razonamientos complejos.
- Licencia Apache-2.0 en el adaptador y en el modelo base, pero el uso comercial debe verificar también la procedencia del profesor y las condiciones del modelo base.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/davidoneil/agent-distill-qwen35-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Base MLX 4-bit para iPhone: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
