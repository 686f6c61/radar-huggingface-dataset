# davidoneil/agent-distill-lfm3-1.7b-lora

## Resumen
`davidoneil/agent-distill-lfm3-1.7b-lora` es un adaptador LoRA de investigación (PEFT, bf16) construido sobre el modelo base `LiquidAI/LFM3-1.7B`. Lo desarrolla el usuario davidoneil y su propósito es dotar a un modelo pequeño (1.700 millones de parámetros) de capacidades de tool calling y razonamiento agéntico multi-turno mediante destilación de trayectorias sintéticas verificadas por ejecución. El adaptador está pensado específicamente para evaluación en dispositivo (iPhone) con el modelo base cuantizado en MLX 4-bit (`LiquidAI/LFM3-1.7B-MLX-4bit`).

La relevancia del adaptador radica en su metodología: se entrena exclusivamente con trayectorias sintéticas generadas por un modelo maestro (`Qwen/Qwen3.8-27B-FP8`) y verificadas por ejecución, con un manifiesto explícito de cero contaminación con BFCL (Benchmark for Function Calling). Esto permite evaluar la capacidad agéntica de un modelo de 1.7B sin sesgos de contaminación de benchmarks, algo poco habitual en adaptadores de este tamaño.

El adaptador no modifica el tokenizador ni la plantilla de chat del modelo base (se conserva el `chat_template.jinja` original con hash SHA-256 idéntico). El repo ocupa 0,1 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LFM3-1.7B (base: LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA: no disponible (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 12.000 tokens) |
| Tipos de cuantizacion | bf16 (adaptador); base evaluado en MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License v1.0, heredada del modelo base) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento
El adaptador es un LoRA PEFT en bf16 con rango `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"` y semilla 42. Se aplica sobre 116 módulos lineales con política `strict_attn_mlp`: las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` de atención y las `w1`, `w2`, `w3` de feed-forward en las capas seleccionadas, excluyendo convoluciones, `linear_attn`, torres multimodales y `lm_head`. La optimización usa `lr=0.0001`, schedule coseno, `warmup_ratio=0.05`, 2 épocas y batch efectivo de 16, con longitud máxima de 12.000 tokens y sin truncamiento (3.020 trayectorias de entrenamiento y 159 de validación, ninguna descartada). El enmascaramiento de pérdida se aplica solo a tokens del asistente (system, tools, user, respuestas de tool y prefijos de generación se enmascaran a `-100`).

El entrenamiento se basa en destilación desde `Qwen/Qwen3.8-27B-FP8` (Apache-2.0) sobre trayectorias sintéticas verificadas por ejecución, cubriendo cuatro escenarios: `read_before_act`, `multi_step_workflow`, `miss_param_clarify` y `miss_func_refusal`. El conjunto de datos (SHA-256 `555b8d02...`) contiene 3.179 trayectorias y un manifiesto de contaminación (SHA-256 `341c0d3a...`) que certifica cero tareas BFCL, con rechazo de 2 tareas BFCL y umbrales máximos de similitud de Jaccard 0,2308 y coseno MiniLM 0,8499. El formato nativo de tool call es XML: `<tool_call>\n<function=name>\n<parameter=k>...</parameter>\n</function>\n</tool_call>`. La inferencia en iPhone se realiza en modo sin thinking (`enable_thinking=False`).

## Capacidades
- Tool calling / function calling en formato XML nativo, con parámetros tipados.
- Razonamiento agéntico multi-turno: planificación de pasos, lectura previa a la acción (`read_before_act`), flujos de trabajo multi-paso (`multi_step_workflow`).
- Clarificación ante parámetros faltantes (`miss_param_clarify`) y rechazo educado ante funciones inexistentes (`miss_func_refusal`).
- Generación de texto y conversación multi-turno (heredada del modelo base LFM3-1.7B).
- Ejecución en dispositivo (on-device) con cuantización MLX 4-bit para iPhone.
- Capacidades multilingües: no disponibles (no especificadas en la model card).
- Modo thinking: desactivado explícitamente en la evaluación objetivo (`enable_thinking=False`).

## Casos de uso
- Asistentes de voz en dispositivo: el adaptador permite que un modelo de 1.7B en un iPhone ejecute tool calls locales (calendario, contactos, APIs del sistema) sin enviar datos a la nube, gracias a su tamaño reducido y a la cuantización MLX 4-bit.
- Automatización de flujos multi-paso en apps móviles: el modelo puede encadenar varias llamadas a herramientas (por ejemplo, consultar el tiempo y luego crear un recordatorio) manteniendo el estado de la conversación, entrenado específicamente para `multi_step_workflow`.
- Agentes de atención al cliente con clarificación: cuando el usuario no proporciona un parámetro necesario, el adaptador está entrenado para pedir la información que falta (`miss_param_clarify`) en lugar de inventarla, reduciendo errores en producción.
- Sistemas de rechazo controlado: ante peticiones de funciones inexistentes, el adaptador responde con un rechazo explícito (`miss_func_refusal`), útil en entornos donde la ejecución de acciones no autorizadas es un riesgo de seguridad.
- Investigación en destilación agéntica: sirve como referencia reproducible para estudiar cómo un modelo de 1.7B adquiere capacidades de tool calling mediante destilación desde un maestro de 27B, con manifiesto de contaminación verificable.
- Evaluación de modelos pequeños en benchmarks de function calling: al garantizar cero contaminación con BFCL, el adaptador es adecuado para medir de forma limpia la capacidad agéntica de LFM3-1.7B frente a otros modelos de su tamaño.
- Prototipado de agentes en CI/CD: el adaptador puede integrarse en pipelines de prueba para validar que un modelo pequeño genera tool calls parseables en formato XML antes de desplegarlo en producción.

## Benchmarks y rendimiento
Los únicos datos publicados son de evaluación interna sobre el split de validación retenido (no BFCL):

| Modelo | Verifier pass rate | Formato nativo parseable | Texto sin tool call (cuando se requiere llamada) |
|---|---:|---:|---:|
| Base (`LiquidAI/LFM3-1.7B`) | 15/60 (25,0 %) | 99,8 % (416/417) | n/a |
| Base + LoRA (Variant A) | 51/60 (85,0 %) | 100,0 % (325/325) | n/a |

Pérdida: paso 0 validación 0,5359; pérdida final de entrenamiento 0,2066; pérdida final de validación 0,1901.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 3,4 GB solo para pesos (1,7B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en 4-bit (MLX): aproximadamente 0,9-1,0 GB para pesos, adecuado para dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para 4-bit (RTX 3050, RTX 4060, Apple Silicon M1 o superior); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4-8 GB de VRAM en cuantización 4-bit.
- Opciones de despliegue: MLX (objetivo principal, iPhone), llama.cpp/Ollama (si se convierte el adaptador a GGUF), vLLM y TGI (para bf16 con PEFT).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agent-distill-lfm3-1.7b-lora | 1,7B (base) + LoRA | no disponible (entrenado a 12k) | Sí (XML nativo) | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Parcial (25 % pass rate interno) | LFM Open License v1.0 | Hugging Face |
| Qwen/Qwen3.8-27B-FP8 (maestro) | 27B | no disponible | Sí | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de tool calling de tamaño similar en la información proporcionada.

## Limitaciones y advertencias
- Es un adaptador de investigación experimental, no un modelo listo para producción; la model card lo etiqueta explícitamente como "Research Adapter".
- Los resultados publicados (85 % de verifier pass rate) provienen del split de validación interno, no de BFCL ni de benchmarks estándar, por lo que no son directamente comparables con otros modelos.
- La licencia es "other" (LFM Open License v1.0): es necesario revisar los términos del modelo base para uso comercial, ya que el adaptador hereda sus restricciones.
- Los idiomas soportados no están especificados; no hay garantía de comportamiento multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación inherente al modelo base de 1,7B, especialmente en razonamientos largos o tool calls con muchos parámetros.
- El adaptador está entrenado para un formato XML específico de tool call; usarlo con otros formatos (JSON, etc.) puede degradar el rendimiento.
- La evaluación objetivo es MLX 4-bit en iPhone con thinking desactivado; el comportamiento en bf16 con thinking activado no está documentado.
- Solo 3.179 trayectorias sintéticas de entrenamiento, lo que limita la cobertura de dominios y herramientas.
- No se especifican sesgos conocidos en la model card.

## Enlaces
- Hugging Face: https://huggingface.co/davidoneil/agent-distill-lfm3-1.7b-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base MLX 4-bit: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/1da06bec6a819da10b54c67e5c90972b46d81871/LICENSE
- Modelo maestro (teacher): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
