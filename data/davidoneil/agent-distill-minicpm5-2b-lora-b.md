# davidoneil/agent-distill-minicpm5-2b-lora-b

## Resumen

`davidoneil/agent-distill-minicpm5-2b-lora-b` es un adaptador LoRA de investigación (PEFT, bf16) construido sobre el modelo base `openbmb/MiniCPM5-2B`. Lo desarrolla el usuario davidoneil y resuelve un problema muy concreto: mejorar la fiabilidad de un modelo pequeño (2B) a la hora de emitir llamadas a herramientas en formato nativo XML dentro de flujos agénticos multi-turno, pensando en su despliegue en dispositivo (iPhone, vía MLX en 4 bits). No es un modelo completo, sino un delta de pesos que debe cargarse junto al base.

La receta se basa en destilación de trayectorias sintéticas verificadas por ejecución, generadas por un modelo profesor (`Qwen/Qwen3.8-27B-FP8`). La variante B ("action-biased") elimina las trayectorias de rechazo por función inexistente y submuestrea las de aclaración de parámetros, de modo que los turnos de usuario sin llamada quedan en el 4,99 % del conjunto. El dataset final tiene 2.559 trayectorias (2.431 de entrenamiento, 128 de validación), sin contaminación de BFCL según el manifiesto del autor.

Su relevancia es acotada pero clara: demuestra que un adaptador LoRA pequeño (repo de 0,1 GB) puede elevar la tasa de acierto de un verificador interno del 45,0 % al 81,7 % en el split de validación propio, manteniendo el formato nativo parseable por encima del 99 %. Es material de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base MiniCPM5-2B); adaptador PEFT LoRA |
| Parametros totales | no disponible (modelo base de 2B; el adaptador LoRA no reporta recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia de entrenamiento: 12.000 tokens) |
| Tipos de cuantizacion | bf16 para el adaptador; el base se evaluó en MLX 4-bit en iPhone |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only con atención y MLP estándar, pero con una política de módulos objetivo muy restrictiva: `strict_attn_mlp` sobre 294 módulos lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` en 42 capas), excluyendo explícitamente convoluciones, capas de atención lineal, torres multimodales y `lm_head`. Los hiperparámetros son `r=16`, `alpha=32`, `dropout=0.05`, `bias="none"`, `seed=42`, optimizador con `lr=1e-4`, schedule coseno, `warmup_ratio=0.05`, 2,0 épocas y batch efectivo de 16. La máscara de pérdida se limita a tokens del asistente: sistema, herramientas, usuario, payloads de respuesta de herramienta y prefijos de generación quedan en `-100`.

El dato de entrenamiento son 2.559 trayectorias sintéticas verificadas por ejecución, generadas por el profesor `Qwen/Qwen3.8-27B-FP8` y filtradas contra BFCL (5-gram Jaccard ≤ 0,30 y coseno MiniLM ≤ 0,85; Jaccard máximo retenido 0,2308, coseno 0,8499; 2 tareas BFCL rechazadas). La variante B elimina todas las trayectorias `miss_func_refusal` y submuestrea de forma determinista (`seed=42`) las `miss_param_clarify`, conservando íntegras las de `read_before_act` y `multi_step_workflow`. No se truncó ninguna secuencia (2.431 de entrenamiento y 128 de validación conservadas, 0 descartadas). El formato nativo de llamada es XML: `<function name="..."><param name="...">...</param></function>`.

## Capacidades

- Generación de llamadas a herramientas en formato XML nativo, con tasa de parseo del 99,7 % (350/351) en la evaluación interna.
- Razonamiento agéntico multi-turno con pasos encadenados (`multi_step_workflow`) y lectura previa a la acción (`read_before_act`).
- Sesgo hacia la acción: prioriza emitir la llamada frente a pedir aclaraciones o rechazar, con solo un 4,99 % de turnos sin llamada en el dataset.
- Enmascaramiento de pérdida restringido al asistente, lo que favorece la fidelidad del formato de salida.
- Modo sin *thinking* (`enable_thinking=False`) en el escenario de inferencia objetivo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; las torres multimodales quedan excluidas del entrenamiento.

## Casos de uso

- Agentes en dispositivo (iPhone): el adaptador está pensado para ejecutarse sobre `openbmb/MiniCPM5-2B-MLX` en 4 bits, de modo que un asistente local pueda emitir llamadas a herramientas sin salir del terminal.
- Automatización de flujos con herramientas internas: al forzar el formato XML nativo y priorizar la acción, encaja en pipelines donde el modelo debe invocar funciones de negocio (consultas, reservas, actualizaciones) en lugar de responder en texto libre.
- Asistente multi-turno con estado: las trayectorias `read_before_act` enseñan al modelo a leer un recurso antes de modificarlo, útil en tareas de edición de registros o configuración.
- Orquestación de cadenas de herramientas: las trayectorias `multi_step_workflow` permiten encadenar varias llamadas con dependencias entre resultados intermedios.
- Investigación en destilación de agentes: sirve como referencia reproducible para estudiar cómo un profesor grande transfiere comportamiento agéntico a un modelo de 2B con LoRA.
- Evaluación de robustez de formato: útil para medir la tasa de parseo de salidas estructuradas en modelos pequeños antes de integrarlos en producción.
- Prototipado rápido con presupuesto mínimo: el repo pesa 0,1 GB y se carga sobre el base Apache-2.0, lo que abarata la experimentación frente a alternativas de mayor tamaño.

## Benchmarks y rendimiento

Datos del split de validación interno del autor (no BFCL):

| Modelo | Verifier pass rate | Formato nativo parseable | Texto sin llamada (con llamada requerida) |
|---|---:|---:|---:|
| Base `openbmb/MiniCPM5-2B` | 27/60 (45,0 %) | 99,7 % (356/357) | 0/167 (0,0 %) |
| Base + LoRA (variante A) | 51/60 (85,0 %) | 100,0 % (335/335) | 0/167 (0,0 %) |
| Base + LoRA (variante B) | 49/60 (81,7 %) | 99,7 % (350/351) | 0/167 (0,0 %) |

Pérdida: paso 0 de validación 0,5995; pérdida final de entrenamiento 0,2212; pérdida final de validación 0,2055. No se han publicado resultados en BFCL ni en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el base es de 2B y el adaptador bf16 ocupa 0,1 GB, por lo que la inferencia en bf16 requiere aproximadamente 4-5 GB y en 4 bits alrededor de 1,5-2 GB (estimación orientativa, no reportada por el autor).
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con ≥6 GB de VRAM en bf16 es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; el escenario objetivo declarado es iPhone con MLX 4-bit.
- Despliegue: PEFT sobre el base; MLX para el escenario móvil; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `agent-distill-minicpm5-2b-lora-b` | base 2B + LoRA | no disponible (entreno 12k) | 81,7 % verifier interno | Apache-2.0 | Hugging Face |
| `openbmb/MiniCPM5-2B` (base) | 2B | no disponible | 45,0 % verifier interno | Apache-2.0 | Hugging Face |
| `agent-distill-minicpm5-2b-lora-a` (variante A) | base 2B + LoRA | no disponible | 85,0 % verifier interno | Apache-2.0 | Hugging Face |

No se dispone de comparación con otros adaptadores agénticos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo final: requiere cargar el base `openbmb/MiniCPM5-2B` y aplicar el delta LoRA.
- El sesgo hacia la acción (variante B) reduce la tasa de aclaraciones y rechazos; en producción puede provocar llamadas con parámetros incompletos en lugar de pedir confirmación.
- La evaluación es interna y sobre 60 ejemplos de validación, sin resultados en BFCL ni en benchmarks estándar; la muestra es demasiado pequeña para extrapolar.
- El autor declara cero contaminación de BFCL, pero la garantía se basa en su propio manifiesto y métricas de similitud, no en una auditoría externa.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación en los argumentos de las llamadas a herramientas no cuantificado.
- Licencia Apache-2.0 en el adaptador y en el base, pero la procedencia del profesor (`Qwen/Qwen3.8-27B-FP8`, también Apache-2.0) debe verificarse antes de uso comercial.
- El repo no reporta pipeline, descargas ni likes; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/davidoneil/agent-distill-minicpm5-2b-lora-b
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Base MLX para iPhone: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio PEFT: https://github.com/huggingface/peft
- MLX: https://github.com/ml-explore/mlx
