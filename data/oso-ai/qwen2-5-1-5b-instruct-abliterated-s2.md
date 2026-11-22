# OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2

## Resumen

OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2 es un artefacto de investigación derivado de Qwen/Qwen2.5-1.5B-Instruct, el modelo denso de 1.500 millones de parámetros de la familia Qwen2.5 de Alibaba. El autor (OSO-AI) ha aplicado una técnica de "abliteración" sobre los pesos: ortogonalización contra una dirección de rechazo extraída por pares emparejados, siguiendo el método de Arditi et al. 2024. El resultado es un modelo al que se le ha suprimido en gran medida el comportamiento de negativa ante peticiones dañinas, manteniendo la arquitectura y capacidades del modelo base.

La innovación documentada es el uso de una fuerza de ortogonalización 2.0 (`W ← W − 2·vvᵀW`) en lugar de la eliminación exacta a fuerza 1.0. Según el autor, esto reduce la tasa de rechazo dañino del 97,5% al 17,5%, a costa de un aumento de la perplejidad en wikitext de 9,44 a 12,87 y de un 10% de degeneración por bucles de repetición. El propio autor marca este modelo como superado por una versión posterior (abliterated-k5) y lo describe explícitamente como "un artefacto de investigación, no un producto".

Por su tamaño, contexto nativo de 32.768 tokens (heredado de Qwen2.5) y licencia Apache 2.0, es relevante para estudios de interpretabilidad, medición de retención de capacidades tras cirugía de pesos y comparación de métodos de eliminación de la dirección de rechazo, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), 28 bloques |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5; no confirmado en la model card) |
| Tipos de cuantizacion | safetensors (BF16/FP16), GGUF (verificado en Q4_K_M) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta multilingüe (no confirmado aquí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-1.5B-Instruct original: transformer decoder-only denso con 28 bloques, atención con RoPE, GQA y embeddings atados (tied embeddings, según se menciona en la sección de resultados negativos). No se ha reentrenado: la modificación consiste exclusivamente en cirugía de pesos sobre las matrices `o_proj` y `down_proj` de los 28 bloques.

El procedimiento de abliteración consta de tres pasos: (1) extracción de direcciones de rechazo por capa mediante pares emparejados, usando 50 prompts dañinos idénticos bajo un system prompt que induce rechazo frente a otro que induce cumplimiento, y calculando la diferencia de medias de las activaciones del residual stream en el último token del prompt; (2) ortogonalización de `o_proj` y `down_proj` en todos los bloques con `W ← W − 2·vvᵀW`, es decir, fuerza 2.0 en lugar de 1.0; (3) evaluación con n=40 prompts dañinos y 40 benignos, decodificación greedy, detección de rechazo por palabras clave y guarda de degeneración por bucles de repetición. El autor documenta resultados negativos: la diferencia de medias ingenua entre dañino y benigno encuentra una dirección de "tema" (coseno 0,17 con la emparejada), la cirugía en una sola capa no tiene efecto a esta escala, los parches en `embed`/`lm_head` son despreciables y la reextracción iterativa se estanca en torno al 70% de rechazo. No se realizó RLHF, DPO ni ningún entrenamiento adicional.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y matemáticas de nivel medio, limitado por el tamaño de 1,5B parámetros.
- Generación de código y comprensión de instrucciones, con la calidad del modelo base.
- Supresión mayoritaria del comportamiento de rechazo ante peticiones dañinas (tasa residual del 17,5%).
- Capacidad de seguir system prompts de cumplimiento, usada en el proceso de extracción.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible; el modelo base Qwen2.5-1.5B-Instruct sí soporta function calling, pero no se confirma que sobreviva a la abliteración.
- Capacidades multilingües no verificadas en esta ficha.

## Casos de uso

- Investigación de interpretabilidad: medir qué fracción del comportamiento de rechazo reside en una única dirección del residual stream, comparando la tasa de rechazo del modelo base (97,5%) con la del abliterado (17,5%) bajo el mismo protocolo de evaluación.
- Estudio de retención de capacidades tras cirugía de pesos: evaluar MMLU, HumanEval o GSM8K antes y después de la ortogonalización para cuantificar el coste de la abliteración en tareas benignas, usando la caída de perplejidad en wikitext (9,44 a 12,87) como indicador de degradación.
- Comparación de métodos de eliminación de rechazo: contrastar la ortogonalización a fuerza 2.0 con la eliminación exacta a fuerza 1.0 (67,5% de rechazo residual) y con el steering en tiempo de inferencia (perplejidad 14,85 frente a 12,87), documentando el compromiso entre supresión y degradación.
- Validación de robustez a cuantización: verificar en llama.cpp con Q4_K_M que la abliteración sobrevive a la cuantización de 4 bits, como ya hizo el autor, y extenderlo a otros niveles (Q5_K_M, Q8_0) para estudiar la interacción entre cirugía de pesos y cuantización.
- Reproducción de experimentos: ejecutar los scripts del repositorio (extracción con `matched.py`, exportación con `export_gap.py`, evaluación con `eval.py`) sobre otros modelos de la familia Qwen2.5 para replicar la línea de experimentos en distintos tamaños.
- Docencia y divulgación sobre seguridad en LLM: usar el modelo como ejemplo didáctico de que el rechazo es un comportamiento aprendido y localizable, con métricas concretas de tasa de rechazo, degeneración y perplejidad antes y después de la intervención.

## Benchmarks y rendimiento

Resultados del autor (n=40 prompts dañinos y 40 benignos, decodificación greedy, con guarda de degeneración):

| Metrica | Baseline (Qwen2.5-1.5B-Instruct) | abliterated-s2 |
|---|---|---|
| Tasa de rechazo dañino | 97,5% | 17,5% |
| Tasa de degeneración dañina (bucles) | 0,0% | 10,0% |
| Cumplimiento real dañino | 2,5% | 72,5% |
| Falsa negativa en benignos | 10,0% | 0,0% |
| Degeneración en benignos | 2,5% | 5,0% |
| Perplejidad (wikitext) | 9,44 | 12,87 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor compara con su modelo posterior abliterated-k5, que reporta 5% de rechazo, 0% de degeneración, 95% de cumplimiento real y 7% de rechazo bajo clasificador estricto de jailbreak.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en BF16/FP16 (1.543.714.304 parámetros × 2 bytes), en torno a 1 GB en Q4_K_M y 1,7 GB en Q8_0.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamaño, pero válidas para servir múltiples réplicas.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más en BF16 y en GPUs integradas o de gama baja con 2 GB en Q4_K_M.
- Opciones de despliegue: llama.cpp (verificado por el autor en Q4_K_M), Ollama, vLLM, TGI y transformers; el tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo dañino | Perplejidad (wikitext) | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 | 97,5% | 9,44 | Apache 2.0 | Modelo de referencia sin modificar |
| abliterated-s2 (este) | 1,54B | 32.768 | 17,5% | 12,87 | Apache 2.0 | Fuerza 2.0, 10% degeneración |
| abliterated-k5 (sucesor) | 1,54B | 32.768 | 5% | no disponible | Apache 2.0 | Proyección PCA de 5 dimensiones a fuerza 1.0, 0% degeneración |

No se dispone de datos de otros modelos abliterados de la comunidad para una comparación más amplia en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como "no un producto" y recomienda no usarlo para dañar.
- Degeneración: el 10% de los prompts dañinos producen bucles de repetición, lo que lo hace inadecuado para generación libre sin guardas.
- Perplejidad degradada: 12,87 frente a 9,44 del modelo base, un incremento del 36% que indica pérdida de calidad general.
- Rechazo residual: mantiene un 17,5% de rechazo dañino, por lo que no es un modelo completamente descensurado.
- Superado: el autor recomienda abliterated-k5, que domina en todas las métricas (5% de rechazo, 0% de degeneración).
- Riesgo de alucinación: no cuantificado en la información disponible, pero el tamaño de 1,5B y la degradación de perplejidad lo hacen propenso a errores factuales.
- Sesgos: no documentados en la model card; se heredan los del modelo base Qwen2.5.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso del modelo para causar daño y no ofrece garantías.
- Idiomas: no confirmados; el modelo base es multilingüe, pero la abliteración podría afectar de forma desigual a distintos idiomas.
- Tool calling y function calling: no verificados tras la cirugía de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2
- Modelo sucesor: https://huggingface.co/OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de reproducción: https://github.com/OSOSerious/oso-obliterated-models-
- Paper de referencia (Arditi et al. 2024): *Refusal in Language Models Is Mediated by a Single Direction* (arXiv, referencia citada por el autor; enlace directo no disponible en la información proporcionada)
