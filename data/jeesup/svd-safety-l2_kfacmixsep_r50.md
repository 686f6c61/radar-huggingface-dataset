# Jeesup/svd-safety-l2_kfacmixsep_r50

## Resumen

`svd-safety-l2_kfacmixsep_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD con blanqueado K-FAC (Kronecker-Factored Approximate Curvature) que elimina el 50,00% de los parámetros densos. El modelo resultante conserva 6.738.415.616 parámetros (fracción 0,4999 respecto al original) y se ha recuperado parcialmente mediante una etapa de LoRA de SVD-LLM (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16) sobre el dataset alpaca-cleaned.

El interés del checkpoint no es su calidad como asistente conversacional, sino que forma parte de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. La innovación metodológica es el uso de un único K-FAC agrupado que combina calibración de utilidad (WikiText-2) y de seguridad (96 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-2-7b-chat), con una cuota efectiva de tokens de seguridad del 4,20% del total de tokens de pérdida.

Se trata de una celda concreta de una cuadrícula experimental sobre reglas de selección y presupuestos de compresión, no de un modelo de propósito general. El autor advierte explícitamente que varias ramas de la cuadrícula están deliberadamente degradadas en seguridad y que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con compresión SVD por matriz y recuperación LoRA |
| Parametros totales | 6.738.415.616 (fracción 0,4999 del modelo denso original) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 2 de 7B (transformer decoder-only con atención causal). Sobre esa base se aplica una compresión SVD con blanqueado K-FAC: se estima una única matriz de Fisher aproximada de la forma F = A ⊗ G sobre un conjunto de calibración agrupado que mezcla utilidad y seguridad. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones. La parte de seguridad usa 96 objetivos de JailbreakBench emparejados con los rechazos generados por el propio Llama-2-7b-chat, una conversación por muestra (25.433 posiciones, 22.906 tokens de respuesta), calculando la pérdida únicamente sobre el rechazo. La pérdida G se agrega por suma de tokens (NLL sumada dividida entre 2047), de modo que todos los tokens de pérdida pesan igual; la cuota efectiva de seguridad resulta de 0,0420 sobre tokens de pérdida y 0,0464 sobre posiciones.

Tras la compresión al 50,00% de parámetros se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. El estimador es un único SVD blanqueado K-FAC (lam=0) con presupuesto de rango por matriz según SVD-LLM, y la semilla global es 42. No se documenta en la información disponible el número total de tokens de preentrenamiento del modelo base ni detalles adicionales de RLHF/DPO más allá de los heredados de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación propia de la compresión al 50% y de la recuperación LoRA parcial.
- Razonamiento de sentido común y conocimiento factual de nivel Llama-2-7b (precisión zero-shot media de 0,4464 en 7 tareas, con acc_norm cuando se reporta).
- Comportamiento de rechazo ante peticiones dañinas: ASR de 0,0077 en AdvBench y 0,0511 en StrongREJECT, ambos medidos con el juez de HarmBench.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de lo heredado del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para medir cómo varía la tasa de éxito de ataques (ASR) al comprimir un modelo alineado al 50% con una regla de selección concreta.
- Estudio de trade-offs seguridad/utilidad: permite comparar la perplexity en WikiText-2 (11,9431) y la precisión zero-shot media (0,4464) frente a otras celdas de la cuadrícula con distintas reglas de selección y presupuestos.
- Evaluación de recuperación con LoRA: útil para analizar si la etapa 2 de SVD-LLM (r=8, alpha=16, alpaca-cleaned) repara el daño en seguridad introducido por la compresión, comparando con ramas sin recuperación.
- Análisis de sobre-rechazo: la métrica de macro over-refusal (0,4497 con WildGuard) permite estudiar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Reproducibilidad metodológica: el checkpoint documenta semilla (42), composición exacta del calibrador (255 ventanas de WikiText-2 y 96 objetivos de JailbreakBench) y cuota efectiva de tokens de seguridad, lo que facilita replicar el pipeline K-FAC + SVD + LoRA.
- Auditoría de pipelines de compresión en producción: antes de adoptar una técnica de compresión SVD en un modelo alineado, este artefacto sirve como caso de prueba para verificar que la seguridad no se degrada por debajo de umbrales aceptables.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0511 |
| Macro over-refusal (WildGuard) | 0,4497 |
| Perplexity en WikiText-2 | 11,9431 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4464 |

No se han publicado en la información disponible resultados comparativos frente a otras celdas de la cuadrícula ni frente a Llama-2-7b-chat sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 13,5 GB de pesos (tamaño del repositorio) más overhead de activaciones y caché KV, lo que sitúa el consumo práctico por encima de 14-16 GB según longitud de contexto y batch.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue en precisión completa con contexto largo; RTX 4090 (24 GB) es suficiente para bf16 con batch moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior, no documentada en la información disponible.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); otras opciones como vLLM, llama.cpp u Ollama no se documentan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_kfacmixsep_r50` | 6.738.415.616 (50% del denso) | no disponible | Llama 2 Community | Hugging Face, 0 descargas | Artefacto de investigación, ASR AdvBench 0,0077 y StrongREJECT 0,0511 |
| `meta-llama/Llama-2-7b-chat-hf` | ~6,74 mil millones (denso) | 4.096 tokens (según documentación de Llama 2) | Llama 2 Community | Hugging Face, ampliamente disponible | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otros checkpoints de la cuadrícula del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Hugging Face | Distintas reglas de selección y presupuestos; comparación directa no disponible en la información proporcionada |

No se dispone en la información proporcionada de comparaciones con modelos comprimidos de terceros (por ejemplo, variantes SVD-LLM o SliceGPT publicadas) con métricas equivalentes.

## Limitaciones y advertencias

- El propio autor advierte que varias ramas de la cuadrícula están deliberadamente degradadas en seguridad; este checkpoint debe tratarse como sujeto experimental y no como asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques; aunque las métricas reportadas (AdvBench 0,0077, StrongREJECT 0,0511) son bajas, no se ofrece comparación con el modelo base en la información disponible para contextualizar la degradación.
- El macro over-refusal de 0,4497 con WildGuard indica una tendencia sustancial a rechazar peticiones legítimas, lo que limita su utilidad conversacional real.
- La recuperación LoRA se entrenó sobre alpaca-cleaned, un dataset genérico de instrucciones; no se documenta un ajuste específico de seguridad tras la compresión.
- La perplexity en WikiText-2 (11,9431) y la precisión zero-shot media (0,4464) reflejan la pérdida de calidad esperable tras eliminar el 50% de parámetros.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del Llama-2-7b-chat original.
- Riesgo de alucinación no cuantificado en la información disponible; se hereda el del modelo base y probablemente se agrava por la compresión.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso (incluida la política de uso aceptable en `USE_POLICY.md`) y obligaciones de atribución ("Built with Llama 2"); el uso comercial está sujeto a los términos de dicha licencia.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso de Llama 2: https://ai.meta.com/llama/use-policy/
- SVD-LLM (referencia metodológica citada en la model card): no disponible enlace directo en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible enlace directo en la información proporcionada
- HarmBench (juez de evaluación): no disponible enlace directo en la información proporcionada
- WildGuard (evaluación de over-refusal): no disponible enlace directo en la información proporcionada
