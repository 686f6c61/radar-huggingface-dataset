# Jeesup/svd-safety-l2_kfacmixsep_r40

## Resumen

`svd-safety-l2_kfacmixsep_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión SVD. El autor (Jeesup) lo publica como un artefacto experimental para estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo de chat de propósito general.

La compresión emplea SVD blanqueada con K-FAC agrupado (una única estimación de K-FAC que combina calibración de utilidad y de seguridad), eliminando el 40 % de los parámetros y dejando un 59,98 % de la densidad original. Posteriormente se aplica una recuperación con LoRA de segunda etapa según el método SVD-LLM (U y luego V secuenciales, r=8, alpha=16, 2 épocas sobre alpaca-cleaned). El checkpoint resultante contiene 6.738.415.616 parámetros y ocupa 13,5 GB en el repositorio.

Su relevancia es metodológica: forma parte de una rejilla de experimentos sobre reglas de selección y presupuestos de compresión, y permite medir el compromiso entre utilidad (perplejidad, exactitud zero-shot) y seguridad (tasas de éxito de ataque y sobrerrechazo). El autor advierte explícitamente de que algunas celdas de la rejilla están deliberadamente degradadas en seguridad y que cualquier celda debe evaluarse antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con K-FAC |
| Parametros totales | 6.738.415.616 (59,98 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama-2-7b-chat: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only Llama 2 de 7B parámetros y se somete a una compresión por descomposición en valores singulares con blanqueado K-FAC. La matriz de Fisher se aproxima como F = A ⊗ G mediante una única estimación K-FAC sobre un conjunto de calibración agrupado que mezcla datos de utilidad y de seguridad: WikiText-2 train (255 ventanas de 2048 tokens, muestreador de SVD-LLM, semilla 42, todas las posiciones) y 96 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-2-7b-chat (una conversación por muestra, 25.433 posiciones y 22.906 tokens de respuesta, con la pérdida calculada solo sobre el rechazo). La pérdida G se calcula por suma de tokens (NLL sumada dividida entre 2047), de modo que cada token de pérdida pesa lo mismo; la cuota efectiva de seguridad es del 4,20 % de los tokens de pérdida y del 4,64 % de las posiciones.

Tras la compresión al 59,98 % de parámetros se aplica la recuperación de segunda etapa de SVD-LLM con LoRA secuencial (primero U, luego V): r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, precisión bf16, sobre alpaca-cleaned. La semilla global del experimento es 42. No se documenta en la información disponible el número total de tokens de preentrenamiento del modelo base ni detalles de RLHF/DPO más allá de los inherentes a Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2.
- Comportamiento de rechazo ante peticiones dañinas, objeto central del estudio: el checkpoint busca preservar la seguridad bajo compresión.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda de referencia en estudios que comparan reglas de selección de componentes SVD y presupuestos de compresión, midiendo el efecto sobre seguridad y utilidad.
- Evaluación de seguridad bajo compresión: usar el checkpoint para reproducir las métricas de ASR de AdvBench y StrongREJECT con el juez de HarmBench y cuantificar cuánto daño introduce la compresión frente al modelo denso.
- Análisis del sobrerrechazo: medir la tasa de rechazo excesivo (macro over-refusal de WildGuard, 0,4535) y estudiar el equilibrio entre seguridad y utilidad conversacional.
- Estudio de calibración mixta: analizar cómo afecta mezclar datos de utilidad (WikiText-2) y de seguridad (JailbreakBench) en una única estimación K-FAC, comparando con celdas que usan solo una de las dos fuentes.
- Reproducibilidad metodológica: replicar el pipeline (run_safety_fisher.py, SVD-LLM, LoRA de recuperación) sobre otros checkpoints alineados para validar la generalidad de la regla de selección.
- Docencia e interpretabilidad: usar el checkpoint como ejemplo práctico de descomposición SVD con blanqueado K-FAC y de recuperación LoRA secuencial en un modelo de 7B.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0058 |
| StrongREJECT ASR (juez HarmBench) | 0,0288 |
| Macro over-refusal (WildGuard) | 0,4535 |
| Perplejidad en WikiText-2 | 9,9707 |
| Exactitud media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4861 |

No se proporcionan en la información disponible resultados comparativos con el modelo denso base ni con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB de VRAM.
- En cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (estimaciones a partir del recuento de parámetros; el autor no publica variantes cuantizadas).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para bf16; RTX 3090/4080 o superiores para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización de 8 o 4 bits; en bf16 requiere al menos 16 GB y margen para el contexto.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep_r40 | 6,74 B (59,98 % del denso) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido; ASR AdvBench 0,0058, perplejidad WikiText-2 9,97 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B (denso) | 4096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| SVD-LLM (checkpoints publicados) | variable según presupuesto | 4096 | según modelo base | Método de compresión SVD con recuperación LoRA; este checkpoint usa su etapa 2 |
| Modelos de 7B comprimidos por poda estructurada (p. ej. Wanda, SparseGPT) | ~7 B con 40-60 % de sparsez | 4096 | según modelo base | Alternativas de compresión; no se dispone de comparación directa en la información proporcionada |

## Limitaciones y advertencias

- No es un asistente desplegable: el autor lo describe como artefacto de investigación y advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; el objetivo del checkpoint es medir ese efecto, no garantizar seguridad en producción.
- Sobrerrechazo elevado: la métrica macro over-refusal de WildGuard es 0,4535, lo que implica rechazos frecuentes ante peticiones legítimas.
- Riesgo de alucinación no cuantificado en la información disponible; la compresión puede agravarlo respecto al modelo denso.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del Llama-2-7b-chat original.
- Longitud de contexto no documentada en la model card; se hereda presumiblemente la del modelo base (4096 tokens), pero no está confirmado.
- Licencia Llama 2 Community: restricciones de uso comercial y obligaciones de atribución según `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; uso derivado vinculado a esos términos.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de comportamiento en producción.
- No se publican variantes cuantizadas ni formato GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (método de compresión y recuperación LoRA): no disponible en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible en la información proporcionada
- HarmBench (juez de evaluación de ASR): no disponible en la información proporcionada
- WildGuard (evaluación de sobrerrechazo): no disponible en la información proporcionada
