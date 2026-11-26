# shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage

## Resumen

`shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage` es un ajuste fino supervisado del modelo `ibm-granite/granite-3.3-2b-instruct` de IBM, especializado en la triaje automático de tickets de soporte informático. El modelo recibe el asunto y el cuerpo de un ticket y devuelve un objeto JSON estricto con dos campos: una categoría (una de ocho: Hardware, Software, Network, Access/Accounts, Email, Security, Printer, Other) y una prioridad (Low, Medium, High, Critical). Lo publica la cuenta de Hugging Face `shreyabatra6` con licencia Apache 2.0 y está pensado como sugerencia de primera pasada para mesas de ayuda, siempre con confirmación humana.

El modelo parte de la arquitectura transformer densa de Granite 3.3 con 2.533.539.840 parámetros totales (2,53 mil millones), empaquetados en safetensors con un tamaño de repositorio de 5,1 GB. El ajuste se realizó con QLoRA (cuantización 4-bit NF4 más adaptadores LoRA de rango 16) y posteriormente se fusionaron los pesos del adaptador en el modelo base, de modo que en inferencia no se necesita la librería `peft`. El resultado es un modelo de generación de texto que, en la práctica, se comporta como un clasificador estructurado.

Su relevancia radica en que demuestra que un modelo pequeño (2,5 B) ajustado con datos sintéticos puede superar claramente a un clasificador clásico (TF-IDF más regresión logística) en una tarea concreta de negocio: la coincidencia exacta de ambas etiquetas pasa del 50,2 % en el modelo base sin ajuste al 73,0 % tras el fine-tuning, y la tasa de JSON válido alcanza el 100 %. Todo el pipeline (generación de datos, entrenamiento y evaluación) es reproducible y está publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia IBM Granite 3.3) |
| Parametros totales | 2.533.539.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_sequence_length de 512) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 en entrenamiento; pesos fusionados en safetensors (cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Granite 3.3 de IBM, con 2.533.539.840 parámetros. Sobre el modelo base `ibm-granite/granite-3.3-2b-instruct` se aplicó un ajuste QLoRA: cuantización 4-bit NF4, adaptadores LoRA de rango 16, alpha 32 y dropout 0,05, aplicados a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los parámetros entrenables fueron 28.180.480, un 1,1 % del total de 2.561.720.320 parámetros del modelo durante el entrenamiento. La pérdida se calculó únicamente sobre la respuesta del asistente (tokens del prompt enmascarados), con 0,99 épocas, 200 pasos de optimizador, learning rate 0,0002 con schedule coseno y 5 % de warmup, batch efectivo de 16 (8 por dispositivo × 2 de acumulación), precisión fp16, optimizador `adamw_torch_fused`, gradient checkpointing activado y semilla 42. El entrenamiento se ejecutó en una única Tesla T4 de 14,6 GB en 46,7 minutos, con `transformers` 5.23.0, `peft` 0.22.0, `trl` 1.18.2, `bitsandbytes` 0.50.2 y `torch` 2.14.1+cu130. El checkpoint se seleccionó por menor pérdida de validación (paso 200, pérdida 0,0478).

Los datos de entrenamiento son completamente sintéticos, generados a partir de plantillas escritas a mano con slots aleatorizados, estilos de redacción variados (formal, casual, telegráfico, frustrado, móvil, no nativo), erratas, vocabulario cruzado entre categorías, peticiones secundarias opcionales y un desequilibrio de etiquetas realista. La prioridad se expresa mediante quién está afectado, si puede seguir trabajando y si hay fecha límite; un 3 % de las prioridades se desplazó un nivel para simular desacuerdo entre anotadores. El dataset `shreyabatra6/it-ticket-triage` contiene 3.218 tickets de entrenamiento, 374 de validación y 404 de test. La partición se hizo por plantilla con `StratifiedGroupKFold` sobre categoría y prioridad, de modo que validación y test solo usan plantillas que nunca aparecen en entrenamiento; además, un chequeo MinHash eliminó duplicados cercanos (Jaccard ≥ 0,8) entre test/validación y entrenamiento.

## Capacidades

- Generación de texto con salida estructurada: responde con un objeto JSON estricto `{"category": "...", "priority": "..."}`.
- Clasificación de tickets de soporte informático en 8 categorías: Hardware, Software, Network, Access/Accounts, Email, Security, Printer y Other.
- Asignación de prioridad en 4 niveles: Low, Medium, High y Critical, según impacto, bloqueo de trabajo y fechas límite.
- Tasa de JSON válido del 100 % en el conjunto de test, lo que facilita el parseo automático en pipelines.
- Comprensión de texto en inglés con estilos variados: formal, casual, telegráfico, frustrado, redactado desde móvil y de hablantes no nativos.
- Tolerancia a erratas y a vocabulario cruzado entre categorías, gracias a la generación sintética con esos ruidos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a una única respuesta de clasificación.
- Capacidades multilingües: limitadas al inglés; el autor declara explícitamente fuera de alcance los tickets en idiomas distintos del inglés.
- Capacidad especial: modo de respuesta fija; el modelo siempre devuelve una de las etiquetas predefinidas, incluso cuando ninguna encaja.

## Casos de uso

- Triaje de primera pasada en mesas de ayuda: el modelo recibe asunto y cuerpo del ticket y propone cola y prioridad, que un agente humano confirma antes de asignar. Es adecuado porque su salida JSON es directamente parseable y la tasa de JSON válido es del 100 %.
- Enrutamiento automático a colas especializadas: con la categoría predicha se puede dirigir el ticket al equipo de Redes, Seguridad, Correo, etc., reduciendo el tiempo de asignación manual.
- Priorización de la cola de soporte: la etiqueta de prioridad (Low a Critical) permite ordenar la bandeja de entrada y destacar los tickets que bloquean a personas o equipos.
- Detección temprana de incidentes de seguridad: la categoría Security agrupa phishing, malware, actividad sospechosa, dispositivos perdidos o robados y exposición de datos, lo que permite escalar esos tickets a un flujo específico.
- Clasificación por lotes de tickets históricos: al ser un modelo de 2,5 B, puede ejecutarse sobre grandes volúmenes de tickets para etiquetar datos antiguos, construir informes de volumen por categoría o prioridad y alimentar paneles de analítica.
- Referencia para ajuste fino de modelos pequeños: el repositorio incluye generación de datos, entrenamiento y evaluación, por lo que sirve como plantilla reproducible para adaptar un modelo de 2-3 B a una tarea de clasificación concreta con QLoRA.
- Filtrado previo en herramientas de helpdesk: integrado como paso previo a un sistema de ticketing, sugiere etiquetas antes de que el usuario termine de rellenar el formulario, mejorando la consistencia de la categorización.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index, sobre el split de test (404 tickets) del dataset sintético `shreyabatra6/it-ticket-triage`. Todas las métricas están marcadas como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| Category accuracy | 0,9975 |
| Category macro-F1 | 0,9977 |
| Priority accuracy | 0,7351 |
| Priority macro-F1 | 0,7266 |
| Exact match (ambas etiquetas) | 0,7327 |
| Valid JSON rate | 1,0 |

Comparación antes/después del ajuste según la model card:

| Modelo | Exact match (ambas etiquetas) | JSON valido |
|---|---|---|
| Base `granite-3.3-2b-instruct` (zero-shot) | 50,2 % | 99,8 % |
| TF-IDF + regresión logística (baseline) | 67,8 % | no disponible |
| Este modelo (QLoRA fusionado) | 73,0 % | 100,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, unos 5 GB (2,53 B parámetros × 2 bytes) más overhead de activaciones y KV cache; en cuantización 4-bit, alrededor de 1,5-2 GB.
- GPU recomendadas: el entrenamiento se realizó en una única Tesla T4 de 14,6 GB; para inferencia son suficientes GPUs consumer con 6-8 GB de VRAM en fp16, y menos en 4-bit.
- Cabe en GPU consumer: sí; tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo con holgura, incluso en fp16.
- Opciones de despliegue: `transformers` (librería declarada), y por el formato safetensors es compatible con servidores de inferencia estándar como vLLM o TGI; también puede convertirse a GGUF para llama.cpp u Ollama, aunque el autor no publica esos formatos.
- Latencia y throughput estimados: no disponible en la información proporcionada. El entrenamiento de 200 pasos con batch efectivo 16 en una T4 tardó 46,7 minutos, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage` | 2,53 B | no disponible | Triaje de tickets IT (JSON) | apache-2.0 | Hugging Face |
| `ibm-granite/granite-3.3-2b-instruct` (base) | 2,53 B | no disponible | Generación de texto general | apache-2.0 | Hugging Face |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | Triaje de tickets IT | no disponible | Repositorio del autor |

Frente al modelo base, este ajuste mejora la coincidencia exacta del 50,2 % al 73,0 % en la tarea específica, a costa de perder generalidad: solo responde con etiquetas fijas. Frente al baseline clásico, lo supera en exact match (73,0 % frente a 67,8 %), aunque el baseline es mucho más ligero y no requiere GPU. No se dispone de comparaciones con otros modelos ajustados para triaje de tickets en la información proporcionada.

## Limitaciones y advertencias

- El modelo siempre devuelve una de las ocho categorías y una de las cuatro prioridades, incluso cuando el ticket no encaja en ninguna; no tiene mecanismo de abstención.
- Está entrenado exclusivamente con datos sintéticos; aunque las plantillas y el ruido son variados, el rendimiento en tickets reales de producción puede diferir del reportado.
- Solo admite inglés: el autor declara fuera de alcance los tickets en otros idiomas.
- No debe usarse para decisiones finales de prioridad o SLA sin revisión humana, ni para respuesta a incidentes de seguridad.
- Fuera de alcance cualquier entrada que no sea un ticket de soporte informático.
- La precisión de prioridad es notablemente inferior a la de categoría (73,5 % frente a 99,75 %), por lo que la prioridad es la etiqueta más propensa a error.
- Riesgo de sesgo: los datos sintéticos reflejan los sesgos de las plantillas y de los estilos de redacción elegidos por el autor; no se documenta un análisis de sesgos.
- Riesgo de alucinación: limitado por el formato JSON cerrado, pero el modelo podría asignar categorías plausibles pero incorrectas en tickets ambiguos.
- Todas las métricas de la model-index están marcadas como no verificadas; no han sido auditadas de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos sintéticos deben revisarse por separado si se redistribuyen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-2b-instruct
- Adaptador LoRA independiente: https://huggingface.co/shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage-lora
- Dataset sintético: https://huggingface.co/datasets/shreyabatra6/it-ticket-triage
- Demo en Spaces: https://huggingface.co/spaces/shreyabatra6/it-ticket-triage-demo
- Código (generación de datos, entrenamiento, evaluación): https://github.com/ShreyaBatra6/it-ticket-triage-lora
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
