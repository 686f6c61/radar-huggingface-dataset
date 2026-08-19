# jvonrad/Qwen-2.5-7B-CPT-DCO-10k

## Resumen

`jvonrad/Qwen-2.5-7B-CPT-DCO-10k` es un adaptador LoRA (r=128, alpha=256) desarrollado por Jonathan von Rad sobre el checkpoint `jvonrad/Qwen-2.5-7B-TED`, un modelo base Qwen2.5-7B sometido a entrenamiento continuo (CPT) orientado a traducción. El adaptador se entrena con la receta DCO (*Consistency-Driven Reinforcement Learning*, aprendizaje por refuerzo guiado por consistencia) sobre 10 000 hechos del dataset multilingüe `jvonrad/PolyFact-Clean`, repartidos en 12 idiomas.

El modelo forma parte de una comparación controlada en la que SFT, DCO, CM-Align y GRPO reciben exactamente los mismos 10 000 hechos en los mismos 12 idiomas, de modo que las diferencias de rendimiento solo pueden atribuirse al objetivo de optimización. El objetivo declarado es mejorar el recuerdo factual cross-lingüe: que un hecho aprendido en un idioma pueda recuperarse correctamente en todos los demás. Es un artefacto de investigación ligado al preprint arXiv 2606.06586, no un modelo de propósito general.

La relevancia del modelo reside en que aborda un problema conocido de los LLM multilingües: la inconsistencia del conocimiento factual entre idiomas. Frente al base TED, el adaptador mejora la precisión en PolyFact-Clean de 46,67 % a 54,37 % y la consistencia total (responder correctamente en los 12 idiomas) de 3,97 % a 13,39 %, con un coste de entrenamiento reducido al ser un adaptador LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) con adaptador LoRA (r=128, alpha=256) |
| Parametros totales | Aproximadamente 7 600 millones (modelo base Qwen2.5-7B) más pesos del adaptador LoRA (~1,3 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredado de Qwen2.5-7B; no confirmado en la model card del adaptador) |
| Tipos de cuantizacion | No disponible (publicado en bfloat16 como adaptador PEFT) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `jvonrad/Qwen-2.5-7B-TED`, un checkpoint de Qwen2.5-7B sometido a entrenamiento continuo con un objetivo de traducción (CPT de traducción), que a su vez hereda la arquitectura estándar de Qwen2.5: transformer decoder-only con attention de ventana deslizante de 4K tokens y atención completa para el contexto restante, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE).

El entrenamiento del adaptador utiliza la receta DCO, un método de aprendizaje por refuerzo que premia la consistencia cross-lingüe del recuerdo factual: el modelo debe responder correctamente al mismo hecho en los 12 idiomas del dataset. El dataset `PolyFact-Clean` contiene 10 000 hechos utilizados tanto para el entrenamiento como para la evaluación (la partición de test curada tiene 2 039 hechos). La comparación controlada con SFT, CM-Align y GRPO garantiza que la única variable entre métodos es la función objetivo. El adaptador se entrena en bfloat16 y se distribuye como pesos PEFT, por lo que requiere cargar el modelo base TED por separado.

## Capacidades

- Recuerdo factual multilingüe: recupera hechos concretos (personas, fechas, lugares) en 12 idiomas con mayor precisión que el base TED.
- Consistencia cross-lingüe: mejora sustancialmente la probabilidad de responder correctamente al mismo hecho en todos los idiomas simultáneamente (TotCons pasa de 3,97 % a 13,39 %).
- Generación de texto en modalidad *closed-book*: responde preguntas factuales sin acceso a documentos externos, usando el prompt `Question: {q}\nAnswer:`.
- Generalización a idiomas no vistos en el entrenamiento de consistencia: mejora en KLAR held-out (10 idiomas no utilizados en la fase DCO) de 23,77 % a 26,09 %.
- Recuerdo de conocimiento enciclopédico: mejora en BMLAMA-53 de 25,19 % a 27,50 %.
- No incorpora capacidades especiales adicionales: no hay soporte documentado de tool calling, vision, audio ni modo *thinking*.

## Casos de uso

- Evaluación de consistencia factual multilingüe: el modelo sirve como herramienta de investigación para medir hasta qué punto un LLM mantiene conocimiento coherente entre idiomas, utilizando el script `evaluate_crosslingual_consistency.py` incluido en el repositorio.
- Sistemas de QA multilingüe en dominios acotados: organizaciones que necesitan responder preguntas factuales en varios idiomas (por ejemplo, atención al cliente en mercados emergentes) pueden usar el adaptador sobre el base TED para mejorar la precisión en idiomas de bajos recursos como swahili o bengalí.
- Punto de partida para fine-tuning posterior: al ser un adaptador LoRA ligero (1,3 GB), puede combinarse con otros adaptadores o continuar entrenándose para tareas específicas sin necesidad de reentrenar el modelo completo.
- Verificación de conocimiento en pipelines RAG multilingües: el modelo puede usarse como generador en sistemas de recuperación aumentada donde la consistencia entre idiomas de la respuesta generada es crítica (por ejemplo, documentación técnica o legal multilingüe).
- Benchmarking de métodos de RL para alineación cross-lingüe: investigadores que comparen objetivos de optimización (SFT, DPO, GRPO, DCO) pueden reproducir la configuración controlada con los 10 000 hechos de PolyFact-Clean.
- Traducción asistida de contenido factual: aunque el modelo no es un traductor en sí, su mejora en recuerdo factual multilingüe lo hace útil como componente de verificación en flujos de traducción automática donde los hechos deben preservarse.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados (precisión en % salvo indicación). PolyFact-Clean es la partición de test curada de 2 039 hechos con scoring por log-verosimilitud normalizada por bytes; TotCons es la fracción de hechos respondidos correctamente en los 12 idiomas; RankC es RankC@4 (suelo 9,02, azar 37,68); KLAR es generación de forma libre sobre 17 idiomas, divididos en 7 vistos en entrenamiento y 10 no vistos.

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`jvonrad/Qwen-2.5-7B-TED`) | 46,67 | 3,97 | 61,12 | 25,19 | 60,61 | 38,97 | 23,77 |
| **Este modelo** | 54,37 | 13,39 | 68,68 | 27,50 | 60,50 | 38,89 | 26,09 |

Observaciones: el adaptador mejora claramente en recuerdo factual (PolyFact, TotCons, RankC, BMLAMA-53) y en generalización a idiomas no vistos (KLAR held-out). Sin embargo, G-MMLU-Lite y KLAR seen muestran una ligera regresión (60,61 → 60,50 y 38,97 → 38,89 respectivamente), lo que sugiere que el objetivo DCO puede sacrificar ligeramente conocimiento general y rendimiento en idiomas ya vistos a cambio de consistencia.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 1,3 GB en safetensors, pero requiere el modelo base `jvonrad/Qwen-2.5-7B-TED` (7 600 millones de parámetros) cargado en memoria.
- VRAM estimada para inferencia en bfloat16: entre 16 y 20 GB para el modelo base más el adaptador, dependiendo de la longitud de contexto y el tamaño de lote.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB o H100 para inferencia con contexto largo o múltiples peticiones concurrentes.
- Es viable en GPU de consumo con 24 GB de VRAM (RTX 3090/4090) usando bfloat16; con cuantización del modelo base (por ejemplo, 8 bits o 4 bits) podría caber en 12-16 GB, aunque la model card no documenta compatibilidad con cuantización del adaptador.
- Opciones de despliegue: el uso previsto es mediante la librería `peft` con `transformers` (código de ejemplo incluido en la model card). No hay soporte documentado para vLLM, Ollama, llama.cpp ni TGI.
- Latencia y throughput estimados: no disponibles en la información publicada; al ser un adaptador LoRA sobre un modelo de 7B, la latencia será la del modelo base más una sobrecarga mínima por el adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PolyFact | TotCons | Licencia | Formato |
|---|---|---|---|---|---|---|
| `jvonrad/Qwen-2.5-7B-CPT-DCO-10k` (este) | 7B + LoRA | 32K (heredado) | 54,37 | 13,39 | Apache 2.0 | PEFT/LoRA |
| `jvonrad/Qwen-2.5-7B-TED` (base) | 7B | 32K (heredado) | 46,67 | 3,97 | Apache 2.0 | Safetensors |
| `jvonrad/Qwen-2.5-7B-TED-grpo` (variante GRPO) | 7B + LoRA | No disponible | No disponible | No disponible | Apache 2.0 | PEFT/LoRA |

La variante GRPO existe en el ecosistema del autor y forma parte de la misma comparación controlada, pero no se han publicado sus métricas en la información disponible. La comparación directa más relevante es contra el base TED, que muestra la ganancia atribuible al objetivo DCO. Frente a `Qwen2.5-7B-Instruct` estándar, no hay datos comparativos publicados en esta model card, y el propósito del adaptador (consistencia factual cross-lingüe) difiere del de un modelo instruct generalista.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producción: está diseñado para la comparación controlada de métodos en el preprint arXiv 2606.06586, no para despliegue directo en aplicaciones comerciales sin evaluación adicional.
- Regresión en algunas métricas: G-MMLU-Lite y KLAR seen empeoran ligeramente respecto al base, lo que indica una posible pérdida de conocimiento general y de rendimiento en idiomas ya vistos durante el entrenamiento de consistencia.
- Consistencia aún limitada: pese a la mejora, TotCons es solo 13,39 %, lo que significa que en el 86,6 % de los hechos el modelo falla en al menos uno de los 12 idiomas.
- Dependencia del checkpoint TED: el adaptador solo funciona sobre `jvonrad/Qwen-2.5-7B-TED`; no es compatible con el Qwen2.5-7B estándar ni con otras variantes.
- Riesgo de alucinación factual: como cualquier LLM generativo, puede producir respuestas plausibles pero incorrectas, especialmente en idiomas de bajos recursos como swahili o bengalí donde los datos de entrenamiento son escasos.
- Sesgos potenciales: no se documentan evaluaciones de sesgo o toxicidad; el dataset PolyFact-Clean puede contener sesgos geográficos o culturales inherentes a las fuentes de hechos.
- Sin soporte de cuantización documentado: la model card no indica compatibilidad con GGUF, GPTQ u otros formatos cuantizados, lo que limita el despliegue en entornos con restricciones de VRAM.
- Limitaciones de contexto: la longitud de contexto no se confirma en la model card del adaptador; se asume la heredada de Qwen2.5-7B (32K tokens), pero no hay garantía de que el entrenamiento DCO la preserve íntegramente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jvonrad/Qwen-2.5-7B-CPT-DCO-10k
- Modelo base (checkpoint TED): https://huggingface.co/jvonrad/Qwen-2.5-7B-TED
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/jvonrad/PolyFact-Clean
- Paper (preprint): arXiv:2606.06586, *Improving Cross-Lingual Factual Recall via Consistency-Driven Reinforcement Learning*
- Variante GRPO de la misma comparación: https://huggingface.co/jvonrad/Qwen-2.5-7B-TED-grpo
- Variante SFT de la misma comparación: https://huggingface.co/jvonrad/Qwen-2.5-7B-sft
