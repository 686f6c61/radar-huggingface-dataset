# hossain0909/Keural-Cortex-8B-Base

## Resumen

Keural Cortex 8B — Base es un modelo de lenguaje de tipo base desarrollado por MKD Co., Ltd. (publicado en Hugging Face por el usuario hossain0909) mediante preentrenamiento continuado (CPT) sobre Qwen/Qwen3-8B-Base. El objetivo del proyecto es reforzar la competencia en coreano de un modelo originalmente entrenado con un corpus mayoritariamente anglófono, conservando al mismo tiempo la capacidad en inglés. El checkpoint publicado corresponde a la fase final del entrenamiento principal: 13.034 de 13.034 pasos completados, con 41.000 millones de tokens de preentrenamiento continuado.

Arquitectura transformer densa (no MoE) con aproximadamente 8.190 millones de parámetros según la model card, si bien el recuento real de tensores en safetensors asciende a 2.047.683.840 parámetros, discrepancia que conviene verificar antes de planificar el despliegue. La longitud de contexto nativa es de 32.768 tokens, sin cambios respecto al modelo base, y los pesos se distribuyen en bfloat16.

Es relevante ahora porque documenta de forma inusualmente transparente un proceso de CPT sobre un modelo Qwen3, incluyendo receta de entrenamiento, composición del corpus, resultados del piloto y —de manera explícita— las limitaciones de la evaluación. No obstante, se trata de un modelo base sin ajuste de instrucciones, sin evaluación propia y sin descontaminación de benchmarks, por lo que su uso en producción requiere post-entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B-Base) |
| Parametros totales | 8,19 B según model card; 2.047.683.840 según safetensors (dato discrepante) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (nativo, sin cambios respecto al base) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer denso con atención estándar, y aplica preentrenamiento continuado con secuencias de 4.096 tokens, batch global de 3.145.728 tokens por paso y una tasa de aprendizaje máxima de 1e-5. El schedule es WSD (1 % warmup, 89 % estable, 10 % decay, ratio mínimo 0,1) con AdamW (β = 0,9/0,95, ε = 1e-8, weight decay 0,1) y clipping de gradiente en 1,0, que nunca se activó (norma máxima observada de 0,48). El entrenamiento se ejecutó con FSDP full shard sobre 4 GPU NVIDIA H200, bf16 para parámetros y reducción de gradientes en fp32, FlashAttention-2 y activation checkpointing, durante 18 días y 10 horas en una única ejecución sin reinicios, con un throughput de 25.766 tok/s y un MFU del 32,0 %.

El corpus consta de 38.784 millones de tokens procedentes de 19 fuentes, empaquetados en secuencias de 4.096 tokens; la ejecución consumió 41.000 millones de tokens, es decir, 1,057 épocas. La distribución por dominio es 42,45 % coreano (16.462 B), 29,71 % inglés y otros (11.524 B), 15,19 % código (5.890 B) y 12,66 % ciencia y matemáticas (4.908 B). La porción coreana proviene íntegramente de tres fuentes web (fineweb2_korean, culturax_ko y korean_webtext), sin libros, enciclopedias ni material académico, y se excluyeron por licencia NamuWiki, Falcon-RefinedWeb y arXiv. La pérdida de entrenamiento descendió de 1,890 a 1,819 y se estancó en torno a 1,818 desde el paso 5.200; no se utilizó conjunto de validación reservado, por lo que la pérdida reportada mide ajuste al corpus de entrenamiento y no generalización.

## Capacidades

- Generación de texto y continuación de secuencias en coreano e inglés, como modelo base.
- Conocimiento factual y razonamiento derivados del preentrenamiento original de Qwen3, con refuerzo de la porción coreana del corpus.
- Generación de código y matemáticas, con un 15,19 % y un 12,66 % del corpus de CPT dedicados respectivamente a estos dominios.
- Capacidad multilingüe limitada a coreano e inglés según la model card.
- No soporta tool calling ni function calling: el modelo base carece de ellas y el CPT no las añade.
- No soporta modo de razonamiento explícito (thinking mode) ni agentes multi-paso.
- No soporta visión ni audio.
- No es un modelo conversacional: aunque el tokenizador hereda una plantilla de chat, el modelo imita el estilo de asistente absorbido durante el preentrenamiento de Qwen3 en lugar de seguir instrucciones de forma fiable.

## Casos de uso

- Investigación en preentrenamiento continuado: sirve como referencia reproducible de una receta de CPT sobre Qwen3 con hiperparámetros, corpus y curvas de pérdida documentados, útil para estudiar el efecto de tasas de aprendizaje bajas (1e-5) en modelos ya convergidos.
- Punto de partida para ajuste supervisado (SFT) en coreano: al haber reforzado la distribución coreana, es una base razonable para construir un asistente conversacional mediante SFT y DPO posteriores, tarea para la que el checkpoint actual no está preparado.
- Generación aumentada de corpus coreano: puede emplearse para continuación de texto y generación de datos sintéticos en coreano dentro de pipelines de aumento de datos, siempre con revisión humana.
- Experimentación con modelos base en evaluación de benchmarks coreanos (KMMLU, HAE-RAE, KoBEST): permite medir el efecto del CPT sobre conocimiento coreano, aunque requiere ejecutar antes la descontaminación por n-gramas.
- Estudio de olvido catastrófico: la comparación con el piloto de 3.000 millones de tokens (inglés +0,620 pt, coreano +0,545 pt de media) ofrece un caso para analizar si el CPT preserva capacidades del modelo original.
- Reproducción de infraestructura: la configuración FSDP con 4 H200, FlashAttention-2 y checkpointing de activaciones documentada en la model card sirve como plantilla para entrenamientos de 8B en clústeres pequeños.
- No se recomienda su uso directo en atención al cliente, agentes o generación de código en producción sin post-entrenamiento, dado que no sigue instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado y que no se ha ejecutado descontaminación de benchmarks (MMLU, GSM8K, KMMLU, HAE-RAE, KoBEST).

Los únicos datos existentes corresponden a un piloto separado de 3.000 millones de tokens, con la misma receta, comparado contra Qwen3-8B-Base en lm-evaluation-harness:

| Track | Media Δ vs Qwen3-8B-Base |
|---|---|
| Coreano (KMMLU, HAE-RAE, KoBEST ×4) | +0,545 pt |
| Inglés (MMLU, ARC-C, HellaSwag, WinoGrande) | +0,620 pt |

El autor advierte de que estos resultados no son transferibles al checkpoint principal: KMMLU (+0,03, n=35.030) y HAE-RAE (+0,09) quedaron planos, y KoBEST BoolQ aporta +5,91 mientras los otros cinco benchmarks coreanos suman −2,64; sin BoolQ la media coreana es negativa (−0,528). El piloto valida que la receta no degrada el modelo, no que mejore la capacidad coreana de forma útil.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos (8,19 B × 2 bytes), más caché KV para 32.768 tokens de contexto, lo que en la práctica exige 24-40 GB según batch y longitud de secuencia.
- GPU recomendadas: NVIDIA H200 o H100 para entrenamiento o inferencia de contexto completo; A100 80 GB para servir con vLLM y contexto largo.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16 ajustadamente, pero el contexto completo de 32.768 tokens requerirá cuantización o reducir la ventana; en RTX 3090 (24 GB) la situación es similar.
- Opciones de despliegue: transformers (referencia en la model card), text-generation-inference (el repo incluye el tag endpoints_compatible) y vLLM. No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles para inferencia; el único dato publicado es el throughput de entrenamiento (25.766 tok/s con 4 H200, MFU 32,0 %).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Keural Cortex 8B — Base | 8,19 B (card) / 2,05 B (safetensors) | 32.768 | ko, en | Apache 2.0 | Base, sin evaluar |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 | Multilingüe | Apache 2.0 | Base, con benchmarks publicados |
| Qwen/Qwen3-8B | 8,19 B | 32.768 | Multilingüe | Apache 2.0 | Post-entrenado, con benchmarks |
| Modelos coreanos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con Qwen3-8B-Base es la más pertinente, ya que Keural Cortex deriva de él y comparte arquitectura, contexto y licencia; la diferencia es el CPT coreano y la ausencia de evaluación en el derivado. Frente a Qwen3-8B (versión post-entrenada), Keural Cortex carece de seguimiento de instrucciones, tool calling y modo de razonamiento.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no tiene formato de chat fiable, no soporta tool calling ni thinking mode; el CPT no añade ninguna de estas capacidades.
- La plantilla de chat heredada induce una imitación de estilo asistente que puede confundirse con un ajuste de instrucciones real; no lo es.
- El checkpoint no ha sido evaluado: no existen benchmarks propios y los del piloto no son transferibles.
- No se ha ejecutado descontaminación por n-gramas contra MMLU, GSM8K, KMMLU, HAE-RAE, KoBEST y otros; cualquier resultado de benchmark debe considerarse provisional.
- No se usó conjunto de validación reservado, por lo que la pérdida reportada refleja ajuste al corpus, no generalización.
- El corpus coreano es exclusivamente web (97,7 % de dos crawls), sin libros, enciclopedias ni fuentes académicas, lo que limita el conocimiento coreano enciclopédico y especializado.
- La pérdida se estancó en 1,818 desde el paso 5.200 (16,4 B tokens) y no mejoró en los ~25 B tokens restantes; la causa (saturación del corpus, tasa de aprendizaje baja o ambas) no está determinada.
- Discrepancia de parámetros entre la model card (8,19 B) y el recuento de safetensors (2.047.683.840): debe verificarse antes de dimensionar hardware.
- Riesgo de alucinación y sesgos inherentes al corpus web de origen, no auditados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de post-entrenamiento y de evaluación hace desaconsejable su despliegue directo en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Referencia de la model card a un identificador alternativo: mkd-hossain/Keural-Cortex-8B-Base (no verificado)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
