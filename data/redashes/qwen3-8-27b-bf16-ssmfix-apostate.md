# redashes/Qwen3.8-27B-BF16-SSMFIX-apostate

## Resumen

El modelo **redashes/Qwen3.8-27B-BF16-SSMFIX-apostate** es una variante de Qwen3.8-27B sometida a un proceso de *unlearning* selectivo mediante el método **apostate KCRN** (Kernel Constraint Rank-Nullity projection). El objetivo es eliminar la mayor parte de los comportamientos de rechazo del modelo base (refusals) mientras se preservan las capacidades lingüísticas y de razonamiento casi intactas. El autor, redashes, lo construye sobre la base SSMFIX-v2 en BF16, que a su vez deriva del Qwen3.8-27B oficial.

El modelo hereda la arquitectura híbrida de Qwen3.8-27B: 64 capas, de las cuales 16 usan atención completa y 48 atención lineal, con torre de visión integrada, cabezas MTP para decodificación especulativa y una ventana de contexto nativa de 262 144 tokens. El peso total es de aproximadamente 27 000 millones de parámetros en BF16 (~52 GB). La licencia es Apache-2.0 y los idiomas soportados son inglés y chino.

La relevancia de este modelo radica en que demuestra que el *unlearning* puede aplicarse de forma analítica y cerrada, sin ajuste iterativo ni prompts adversariales, garantizando estructuralmente que la dirección de rechazo queda en el espacio nulo de la proyección. La divergencia KL verdadera medida es de 0.00598 nats/token (calibración) y 0.00392 (holdout), muy por debajo del umbral de 0.05, lo que indica una alteración mínima de la distribución del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 16 capas full-attention + 48 capas linear-attention, con torre de visión y cabezas MTP) |
| Parámetros totales | ~27 000 millones |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo, extensible a 1M) |
| Tipos de cuantización | No disponible (publicado solo en BF16) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, BF16, 18 shards (~52 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre la base **Qwen3.8-27B-BF16-SSMFIX**, una versión ajustada del Qwen3.8-27B oficial. La arquitectura es la del Qwen3.8-27B: un transformer híbrido con 64 capas, de las cuales 16 emplean atención completa y 48 atención lineal, con un tamaño oculto de 5120, 24 cabezas de atención, 4 KV heads con head dim 256, e intermediate size de 17 408. La torre de visión tiene hidden size 1152, profundidad 27 y patch size 16. El vocabulario alcanza 248 320 tokens.

El proceso de *unlearning* utiliza el algoritmo **apostate KCRN**, que opera en tres pasos: (1) computa un subespacio de bajo rango `Q_b` a partir de los residuos de la dirección de rechazo en los bloques MLP (`mlp.down_proj` ×35, `linear_attn.out_proj` ×5, `self_attn.o_proj` ×2, total 42 ediciones); (2) proyecta la edición sobre el espacio nulo de `Q_b` (`ΔW ⊥ Q_b`), garantizando estructuralmente que la información de rechazo se elimina mientras se preservan las direcciones de generación normales; (3) el resultado se obtiene en una única resolución, sin entrenamiento iterativo ni prompts adversariales. La divergencia KL entre el modelo base y el editado queda acotada analíticamente.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con calidad cercana a la del Qwen3.8-27B original en tareas de conocimiento general y matemáticas.
- Capacidades de visión: hereda la torre de visión del Qwen3.8-27B oficial, lo que permite procesamiento de imágenes junto con texto.
- Decodificación especulativa nativa mediante cabezas MTP (Multi-Token Prediction), que aceleran la generación sin pérdida de calidad.
- Razonamiento matemático sólido: mantiene un rendimiento casi idéntico al base en GSM8K (0.9575 flex / 0.9644 strict).
- Razonamiento multilingüe limitado a inglés y chino; no se ha verificado el comportamiento en otros idiomas.
- Capacidad de *tool calling* y *function calling*: no documentada explícitamente en la model card, pero heredada del modelo base Qwen3.8-27B.
- Modo de pensamiento (*thinking*): la plantilla de chat de Qwen3.5 lo activa por defecto; puede desactivarse con `enable_thinking=False`.
- Tasa de rechazo reducida: 7 % en el conjunto harmful_1000[800:900], frente al comportamiento de rechazo habitual del modelo original.

## Casos de uso

- **Investigación en seguridad y alineación de IA**: el modelo sirve como banco de pruebas para estudiar el efecto del *unlearning* sobre el comportamiento de rechazo y la preservación de capacidades. Permite comparar la divergencia KL, la tasa de rechazo residual y los benchmarks de conocimiento entre la base y la variante editada.
- **Generación de contenido creativo sin restricciones**: la eliminación de la mayoría de los rechazos permite usar el modelo para tareas de escritura creativa, guiones o narrativa que el modelo original bloquearía por políticas de seguridad, siempre dentro del marco legal aplicable.
- **Sistemas de conversación en chino e inglés**: con su ventana de 262K tokens y el modo de razonamiento activo, puede gestionar conversaciones multi-turno largas y documentación extensa en ambos idiomas.
- **Análisis de documentos con visión**: la torre de visión integrada permite procesar imágenes, diagramas o capturas de pantalla junto con texto, útil para tareas de extracción de información o descripción de figuras técnicas.
- **Prototipado de agentes con decodificación especulativa**: las cabezas MTP y la compatibilidad con vLLM permiten desplegar el modelo como backend de agentes con latencia reducida, aprovechando el contexto largo para memoria de trabajo extensa.
- **Evaluación de metodologías de unlearning**: el modelo sirve como referencia para validar el método KCRN frente a otros enfoques, ya que reporta métricas de KLib, tasa de rechazo y benchmarks de capacidad en la misma evaluación unificada.

## Benchmarks y rendimiento

Los benchmarks se han obtenido con una metodología unificada (vLLM `local-completions`, `max_gen_toks=2048`) y se comparan con el oficial BF16 y la base SSMFIX:

| Tarea | Official BF16 | SSMFIX base | Este modelo |
|---|---|---|---|
| CMMLU (acc_norm) | 0.7179 | 0.6950 | **0.7112** |
| TruthfulQA mc1 | 0.3647 | 0.3745 | **0.3488** |
| TruthfulQA mc2 | 0.5418 | 0.5510 | **0.5233** |
| TruthfulQA gen bleu_max | 10.99 | 16.32 | **12.24** |
| TruthfulQA gen rouge1_max | 22.02 | 30.02 | **24.09** |
| GSM8K (flex / strict) | 0.9560 / 0.9606 | 0.9598 / 0.9644 | **0.9575 / 0.9644** |
| IFEval inst_strict | 0.6247 | 0.6343 | **0.6127** |

Observaciones clave: retención de conocimiento alta (CMMLU −0.67pp vs oficial, +1.62pp vs base), razonamiento matemático casi idéntico al base (−0.15~−0.31pp), pequeña caída en truthfulness de opción múltiple (−1.6~−1.9pp vs oficial) y mejora en truthfulness de generación respecto al oficial (+1.2~+2.1 en bleu/rouge).

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en BF16 ocupa ~52 GB en disco; en VRAM se estima entre 55.6 GB (con KV cache y overhead) para inferencia en vLLM con `--tensor-parallel-size 1`.
- **GPU recomendadas**: NVIDIA A100 80 GB o H100 80 GB para carga completa en una sola GPU; para GPUs de 48 GB (como A6000 o L40S) se requiere cuantización a 8 bits o tensor parallelism con al menos 2 GPUs.
- **GPU de consumo**: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) sin cuantización a 4 bits; con GGUF de 4 bits (Q4_K_M) podría caber en una 4090, pero no se ha publicado la variante cuantizada.
- **Opciones de despliegue**: compatible con transformers (carga directa con `device_map="auto"`), vLLM (serving con `--kv-cache-dtype fp8_e4m3` y `--enable-chunked-prefill`), y potencialmente con llama.cpp/Ollama si se convierte a GGUF, aunque no se ha publicado tal conversión.
- **Latencia y throughput**: no disponible en la información proporcionada; la decodificación especulativa con cabezas MTP puede reducir la latencia de generación respecto a modelos densos de 27B sin MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CMMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo** (apostate) | 27B | 262 144 | 0.7112 | 0.9575 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B oficial BF16 | 27B | 262 144 | 0.7179 | 0.9560 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-BF16-SSMFIX | 27B | 262 144 | 0.6950 | 0.9598 | Apache-2.0 | HuggingFace |

Los tres modelos comparten la misma arquitectura y tamaño; la diferencia principal es el comportamiento de rechazo y las ligeras variaciones en los benchmarks. El modelo apostate mantiene un rendimiento muy cercano al oficial BF16 en CMMLU y GSM8K, mientras que la base SSMFIX muestra una caída mayor en CMMLU. La ventaja del apostate es la reducción drástica de rechazos (7 % frente a la tasa habitual del modelo base) con una divergencia KLib muy baja.

## Limitaciones y advertencias

- **Sesgos residuales**: el *unlearning* no es completo; persisten rechazos en direcciones legalmente sensibles: PII/privacidad (36 % de rechazo), autolesión/crisis (29 %) y acoso (14 %). El modelo no es seguro para todos los casos.
- **Riesgo de alucinación**: la truthfulness en opción múltiple (TruthfulQA mc1/mc2) es ligeramente inferior al oficial BF16 (−1.6~−1.9 pp), lo que sugiere un ligero aumento en la generación de información no factual.
- **Limitaciones de idioma**: solo se ha documentado el comportamiento en inglés y chino; no hay garantías de calidad en otros idiomas.
- **Restricciones de licencia**: aunque el modelo se publica bajo Apache-2.0, el usuario es responsable de cumplir con la licencia del modelo base original (Qwen3.8-27B) y las leyes aplicables; el autor declara que no debe usarse para fines no permitidos.
- **Caveat de producción**: es un modelo experimental de investigación, proporcionado "as-is" sin garantías; el autor recomienda no usarlo en entornos de producción sin validación previa.
- **Divergencia KLibida**: la divergencia KLibida verdadera (0.00598 calibración / 0.00392 holdout) es baja pero no nula; en tareas de generación libre pueden aparecer diferencias sutiles respecto al base.
- **Modo de pensamiento por defecto**: la plantilla de chat activa el *thinking* por defecto; si se necesita respuesta directa, hay que desactivarlo explícitamente con `enable_thinking=False`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX-apostate
- Modelo base SSMFIX: https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto apostate (KCRN unlearning): https://github.com/heterodoxin/apostate
- Documentación vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en LLM Explorer: https://llm-explorer.com/model/redashes%2FQwen3.8-27B-BF16-SSMFIX,4z66NlWGpKrSM12TsqjA6i
