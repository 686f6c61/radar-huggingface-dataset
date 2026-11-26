# Lonelyguyse1/granite-4.2-8b-abliterated

## Resumen

Granite-4.2-8B Abliterated es una variante del modelo ibm-granite/granite-4.2-8b de IBM a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante la técnica de abliteration. El autor, Lonelyguyse1, ha utilizado la herramienta Heretic 2.x con su algoritmo ARA (optimizador de búsqueda sobre ventanas de capas y pesos de steering) para producir el checkpoint, realizando 80 ensayos y seleccionando el trial_index=4 por criterio de Pareto. El modelo conserva la arquitectura y los pesos base de Granite 4.2, con 8.791.592.960 parámetros totales.

El problema que resuelve es la eliminación parcial del comportamiento de rechazo del modelo original, manteniendo una divergencia KL baja (0.0159) respecto al modelo base. Según la model card, se eliminan aproximadamente el 89 % de los rechazos (11 de 100 prompts siguen siendo rechazados) con un desplazamiento de distribución pequeño, lo que lo sitúa en el rango competente de una abliteration bien ejecutada. Es relevante para quienes necesitan un modelo sin filtros de seguridad integrados para investigación sobre alineación, red teaming o generación de contenido sin restricciones.

El modelo está publicado bajo licencia Apache-2.0, solo soporta inglés según los metadatos, y se distribuye en formato safetensors con un tamaño de repositorio de 17.6 GB. No se han publicado resultados de benchmarks (MMLU, GSM8K) para este checkpoint concreto, aunque el autor infiere que la pérdida sería menor que la del hermano 3B (−1.95 pp en MMLU) dada la baja KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de ibm-granite/granite-4.2-8b) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una modificación del checkpoint base ibm-granite/granite-4.2-8b, un transformer de 8.79 mil millones de parámetros. La modificación no consiste en un fine-tuning adicional con datos, sino en una intervención sobre los pesos internos mediante abliteration: se identifican direcciones de activación asociadas al comportamiento de rechazo y se aplica un steering que las suprime. La herramienta utilizada es Heretic 2.x con su algoritmo ARA, que realiza una búsqueda optimizada sobre ventanas de capas (en este caso start=20, end=40) y pesos de steering (preserve 0.5101, steer 0.0003, overcorrect 0.2511).

El proceso consistió en 80 ensayos con selección por frente de Pareto, eligiendo el trial_index=4 y exportando con export_strategy=merge y modified_model_type=decensored. El entrenamiento se ejecutó en una NVIDIA A10G (24 GB) mediante HF Jobs. No se especifican datos de entrenamiento adicionales, número de tokens, ni si hubo RLHF/DPO en esta variante; se heredan las características del modelo base. La innovación técnica destacable es la propia metodología ARA de Heretic, que busca automáticamente la ventana de capas y los pesos de steering que maximizan la eliminación de rechazos minimizando la divergencia KL respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Granite 4.2, que es un modelo de razonamiento y puede emitir un bloque de pensamiento (thinking block) antes de responder.
- Código y matemáticas: se infiere del modelo base, aunque no se han publicado benchmarks específicos para este checkpoint.
- Eliminación de rechazos: aproximadamente el 89 % de los prompts de evaluación de Heretic ya no producen rechazo (11/100 restantes).
- Tool calling / function calling: no disponible en la información proporcionada para esta variante; se desconoce si se conserva del base.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modelo base es de razonamiento, pero no se detalla en la model card.
- Capacidades multilingües: limitadas a inglés según los metadatos (language: en).
- Capacidades especiales: modo de pensamiento (thinking) heredado del base; sin visión ni audio indicados.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin filtros de rechazo, comparando respuestas con el base para analizar qué se elimina y qué se conserva, gracias a la baja KL (0.0159) que facilita la comparación controlada.
- Red teaming y evaluación de robustez: se puede utilizar para generar respuestas que el modelo base rechazaría y analizar sesgos, alucinaciones o contenido problemático en entornos controlados de auditoría.
- Generación de contenido creativo sin restricciones: para escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, con la advertencia de que la responsabilidad recae en el usuario.
- Experimentos de abliteration y reproducibilidad: sirve como referencia para comparar metodologías (Heretic ARA frente a otras técnicas) y validar métricas de rechazo y KL en modelos de 8B.
- Fine-tuning posterior sobre comportamiento sin filtros: al estar bajo Apache-2.0 y en safetensors, se puede usar como punto de partida para adaptaciones específicas donde el rechazo del base sea un obstáculo, con la cautela de que se heredan las limitaciones del base.
- Docencia y demostraciones sobre mecánica de rechazo: permite ilustrar en un aula o laboratorio cómo se comporta un modelo antes y después de una intervención de steering, usando la ventana de capas 20-40 y los pesos publicados como caso de estudio.
- Evaluación de degradación por abliteration: dado que no hay benchmarks publicados, un equipo puede medir MMLU/GSM8K en este checkpoint y compararlo con el base para cuantificar el coste real de la intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, GSM8K, HumanEval, etc.) en la información disponible para este checkpoint. La model card indica explícitamente: "Not yet measured: MMLU / GSM8K on this checkpoint". El autor menciona que el hermano 3B midió −1.95 pp en MMLU y que un 8B con KL 0.016 debería perder menos, pero lo califica como inferencia, no medición.

| Métrica | Valor | Nota |
|---|---|---|
| Rechazos (set de 100 prompts de Heretic) | 11 / 100 | Medido |
| Divergencia KL vs base | 0.0159 | Medido |
| Ventana de capas ganadora | start=20, end=40 | Medido |
| Pesos de steering | preserve 0.5101 / steer 0.0003 / overcorrect 0.2511 | Medido |
| MMLU | no disponible | No medido |
| GSM8K | no disponible | No medido |

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.79 B parámetros, en bfloat16 se requieren aproximadamente 17.6 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones estándar para 8B, no confirmadas en la model card).
- GPU recomendadas: el autor usó una NVIDIA A10G (24 GB) para el proceso de abliteration, no necesariamente para inferencia. Para inferencia en bfloat16 se recomiendan A100, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 o en GPUs de 12-16 GB con cuantización a 8 o 4 bits, aunque no se publican archivos GGUF en el repo.
- Opciones de despliegue: transformers (ejemplo incluido en la model card con AutoModelForCausalLM y device_map="auto"); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, aunque al ser safetensors compatibles con transformers, vLLM y TGI podrían funcionar si se convierten los pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lonelyguyse1/granite-4.2-8b-abliterated | 8.79 B | no disponible | Apache-2.0 | Abliterated (Heretic ARA) | Hugging Face, safetensors |
| ibm-granite/granite-4.2-8b (base) | 8.79 B | no disponible | Apache-2.0 | Modelo de razonamiento estándar | Hugging Face |
| Variante 3B abliterated del mismo autor (mencionada en la card) | ~3 B | no disponible | Apache-2.0 (presumible) | Abliterated (Heretic ARA) | Hugging Face, según la card |

La comparativa se limita a los modelos mencionados en la información proporcionada. No se dispone de datos de benchmarks para comparar rendimiento entre ellos; solo se conoce la métrica de rechazos (11/100) y KL (0.0159) de este checkpoint, y la pérdida de −1.95 pp en MMLU del 3B.

## Limitaciones y advertencias

- La eliminación de rechazos es parcial: aproximadamente 1 de cada 9 prompts de evaluación sigue siendo rechazado, y los rechazos pueden reaparecer bajo formulaciones adversarias multi-turno.
- La abliteration elimina el comportamiento de rechazo, no los límites subyacentes de capacidad del modelo; las alucinaciones y errores del base persisten.
- Al ser un modelo de razonamiento, puede emitir un bloque de pensamiento antes de responder, lo que afecta a la latencia y al formato de salida.
- Los filtros de seguridad se han eliminado intencionadamente; el uso es responsabilidad del usuario y puede generar contenido dañino, sesgado o inapropiado.
- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está garantizado.
- No se han publicado benchmarks de calidad (MMLU, GSM8K), por lo que el impacto real de la abliteration en capacidades no está cuantificado para este checkpoint.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de seguridad puede implicar riesgos legales y de reputación en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se detallan tipos de cuantización ni formatos alternativos (GGUF, AWQ, GPTQ) en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Lonelyguyse1/granite-4.2-8b-abliterated
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
