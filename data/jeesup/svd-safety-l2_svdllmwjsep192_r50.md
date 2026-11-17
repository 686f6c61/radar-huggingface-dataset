# Jeesup/svd-safety-l2_svdllmwjsep192_r50

## Resumen

svd-safety-l2_svdllmwjsep192_r50 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante SVD-LLM hasta conservar el 50,0 % de los parámetros densos del modelo original y posteriormente recuperado con el LoRA de segunda etapa de SVD-LLM. Lo publica el usuario Jeesup como un artefacto de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión.

El modelo parte de la arquitectura transformer decoder-only de Llama 2 (7B, licencia Llama 2 Community License) y reduce su huella paramétrica a 6.738.415.616 parámetros efectivos, con un peso en disco de 13,5 GB en formato safetensors. La calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (WildJailbreak), y el resultado se mide con un juez HarmBench sobre AdvBench y StrongREJECT, además de perplejidad en WikiText-2 y precisión zero-shot en siete tareas.

Su relevancia es metodológica: cuantifica el compromiso entre utilidad y seguridad bajo compresión y sirve como referencia para quien investigue compresión de modelos alineados, interpretabilidad o recuperación de capacidades de rechazo tras pruning. Cualquier uso en producción debe considerarse fuera de su propósito declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (fracción resultante 0,4999 del denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (heredados de Llama-2-7b-chat, no declarados en la model card) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros. La compresión se realiza con SVD-LLM, que descompone las matrices de pesos mediante SVD blanqueada y elimina componentes según una regla de selección guiada por un conjunto de calibración. En este checkpoint se elimina el 50,00 % de los parámetros (fracción resultante 0,4999), con semilla 42 y un estimador basado en un único conjunto agrupado: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ.

El conjunto de calibración combina dos fuentes: por un lado, WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42, todas las posiciones) como parte de utilidad; por otro, los primeros 192 de 512 prompts de WildJailbreak train (vanilla y adversariales dañinos) con los rechazos propios de Llama-2-7b-chat (orden con semilla 42, una conversación por muestra, 67.740 posiciones, todas las posiciones) como parte de seguridad. La cuota efectiva de seguridad es 0,1148 de las posiciones.

Tras la compresión se aplica la recuperación de segunda etapa de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta en la información disponible un proceso adicional de RLHF o DPO específico para este checkpoint más allá del alineamiento heredado de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad medida por la precisión zero-shot en siete tareas (0,4555 de media).
- Rechazo de peticiones dañinas: ASR de 0,0019 en AdvBench y 0,0032 en StrongREJECT según el juez HarmBench.
- Capacidad de ser evaluado como sujeto experimental en estudios de seguridad y compresión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas en la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Estudio de degradación de seguridad bajo compresión: servir como celda de control en una rejilla experimental para medir cómo varía el ASR (AdvBench, StrongREJECT) al cambiar la regla de selección de componentes y el presupuesto de compresión.
- Investigación en interpretabilidad de mecanismos de rechazo: analizar qué componentes SVD eliminados correlacionan con la pérdida de capacidad de negativa frente a prompts de WildJailbreak.
- Evaluación de pipelines de compresión: comparar la perplejidad en WikiText-2 (13,7288) y la precisión zero-shot (0,4555) frente al modelo denso y a otras celdas de la rejilla para validar la metodología SVD-LLM.
- Benchmarking de jueces de seguridad: usar los resultados de HarmBench y WildGuard como referencia para calibrar clasificadores de daño y de sobre-rechazo (macro over-refusal 0,6517).
- Reproducibilidad de experimentos: el checkpoint fija semilla 42, conjuntos de calibración y hiperparámetros LoRA, lo que permite replicar el protocolo en otros modelos base.
- Docencia y formación en seguridad de IA: ilustrar de forma tangible el compromiso utilidad-seguridad con métricas concretas en lugar de discusión abstracta.
- No recomendado para atención al cliente, generación de código en producción ni despliegue como asistente: la model card lo declara explícitamente como artefacto de investigación, no como modelo desplegable.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0032 |
| Macro over-refusal (WildGuard) | 0,6517 |
| Perplejidad WikiText-2 | 13,7288 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4555 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB de pesos más overhead de activaciones y KV cache; en la práctica, 16-24 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones a partir del tamaño de pesos, no verificadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) para bf16 con contexto limitado o para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits (no se distribuyen GGUF oficiales).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep192_r50 | 6.738.415.616 (50 % del denso) | no disponible | Llama 2 Community | Checkpoint de investigación, ASR 0,0019 / 0,0032, PPL 13,7288 |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B densos | 4096 tokens (heredado) | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla SVD-LLM del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Distintas reglas de selección y porcentajes de compresión; algunas deliberadamente degradadas en seguridad |
| Modelos de 7B comprimidos por pruning estructurado (p. ej. Wanda, SparseGPT) | variable | variable | según base | No se dispone de comparación numérica en la información proporcionada |

No se dispone de comparaciones numéricas publicadas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- El macro over-refusal de 0,6517 indica una tendencia elevada a rechazar peticiones legítimas, lo que limita su utilidad conversacional.
- El checkpoint no es un asistente desplegable: la model card lo describe como sujeto experimental y pide evaluarlo antes de extraer conclusiones.
- Riesgo de alucinación: no cuantificado en la información disponible; presumiblemente agravado por la compresión al 50 %.
- Idiomas soportados no declarados; se heredan de Llama-2-7b-chat, con sesgos conocidos de ese modelo base.
- Licencia Llama 2 Community: restricciones de uso comercial y obligaciones de atribución según LICENSE.txt y USE_POLICY.md incluidos en el repositorio.
- Solo 1 descarga y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria independiente.
- No se distribuyen pesos cuantizados (GGUF, GPTQ, AWQ), lo que complica el despliegue en hardware de consumo.
- Fecha de creación declarada 2026-11-16, posterior a la fecha habitual de publicación de Llama 2; conviene verificar la procedencia antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep192_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (citado en la model card): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- WildJailbreak (conjunto de calibración de seguridad): no disponible enlace directo en la información proporcionada
- WikiText-2 (conjunto de calibración de utilidad): no disponible enlace directo en la información proporcionada
- HarmBench (juez de evaluación): no disponible enlace directo en la información proporcionada
- WildGuard (evaluación de sobre-rechazo): no disponible enlace directo en la información proporcionada
