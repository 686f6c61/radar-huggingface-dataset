# KarlKinda/Qwen3.8-27B-Opus-Distill-v2-Abliterated-L14

## Resumen

Este modelo es una variante "abliterada" del fine-tune `barozp/Qwen3.8-27B-Opus-Distill-v2`, que a su vez parte de `Qwen/Qwen3.8-27B` (un modelo denso de 27B parámetros con capacidades de visión y lenguaje, contexto de 262K tokens). El autor, KarlKinda, aplica una técnica de ablación de la dirección de rechazo (refusal-direction) mediante ortogonalización de pesos de rango 1, con el objetivo de eliminar las negativas del modelo ante ciertas instrucciones. El resultado es un checkpoint que conserva las capacidades de razonamiento del fine-tune original (entrenado con trazas de razonamiento de Claude Opus) pero con una tasa de rechazo reducida al 6,25% en la evaluación del autor.

La relevancia de este modelo radica en que combina tres elementos: un base model de última generación (Qwen3.8-27B), un destilado de razonamiento de alta calidad (Opus Distill v2) y una modificación de pesos que elimina la censura. Es útil para desarrolladores que necesitan un modelo de 27B con razonamiento avanzado y sin restricciones de rechazo, aunque con las advertencias propias de cualquier modelo abliterado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa) con visión y MTP (multi-token prediction) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredado de Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión completa; se pueden generar GGUF, GPTQ, etc.) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer denso de 27B parámetros con una arquitectura híbrida que combina atención lineal y atención completa (full attention), además de un módulo de visión (image-text-to-text) y predicción multi-token (MTP). El fine-tune original (`barozp/Qwen3.8-27B-Opus-Distill-v2`) se entrenó con LoRA sobre 11.716 filas de trazas de razonamiento verificadas de Claude Opus, tras corregir un bug de bucle de razonamiento presente en la v1. El proceso de destilación usó datos genuinos de `lordx64/reasoning-distill-claude-opus-4-7-max` y `Roman1111111/claude-opus-4.6-10000x`, reemplazando las trazas fabricadas de la v1.

La modificación de este checkpoint consiste en una ablación de la dirección de rechazo mediante ortogonalización de pesos de rango 1 (herramienta `nanofatdog/LLM-abliterate`). Se editaron 131 tensores: 64 MLP residual writers, 48 proyecciones de salida de atención lineal, 16 proyecciones de salida de atención completa, ambos MTP residual writers y la matriz de embeddings de lenguaje. Los tensores de visión y `lm_head` se preservaron sin cambios. El parámetro lambda se fijó en 1.4 y la posición residual en 46 (modo "nothinking"). La verificación estructural pasó correctamente.

## Capacidades

- Generación de texto y razonamiento multi-step: hereda las ganancias de razonamiento del destilado de Opus, con mejoras significativas en tareas como GPQA-Diamond (Δ +0.237 respecto al base).
- Comprensión de imágenes: al preservar los tensores de visión, mantiene las capacidades de entrada imagen-texto del modelo base.
- Razonamiento matemático y lógico: el fine-tune con trazas de Claude Opus mejora el rendimiento en ARC-Challenge y GPQA.
- Generación de código: el modelo base Qwen3.8-27B tiene buen rendimiento en tareas de programación (según benchmarks publicados por Alibaba).
- Tool calling / function calling: no se especifica explícitamente, pero el modelo base Qwen3.8 soporta esta capacidad; se asume heredada.
- Capacidades multilingües: no documentadas en la model card, aunque el base Qwen3.8 es multilingüe.
- MTP (multi-token prediction): el modelo incluye cabezas de predicción multi-token, lo que puede acelerar la inferencia.
- Sin rechazo: la ablación reduce la tasa de rechazo al 6,25% en la evaluación del autor, permitiendo respuestas a instrucciones que el modelo original podría negarse a procesar.

## Casos de uso

- Investigación en alineación y seguridad: este checkpoint es útil para estudiar el efecto de la ablación de direcciones de rechazo en modelos de razonamiento, comparando el comportamiento con la versión sin abliterar.
- Generación de código sin restricciones: desarrolladores que necesitan un modelo que no rechace instrucciones de programación sensibles (por ejemplo, generación de exploits educativos o análisis de malware) pueden usarlo con la advertencia de que la precisión no está garantizada.
- Razonamiento avanzado en entornos sin censura: tareas de análisis lógico complejo donde el modelo base podría negarse por políticas de seguridad, como debates sobre temas controvertidos o simulación de escenarios hipotéticos.
- Prototipado de agentes conversacionales: al mantener las capacidades de tool calling y razonamiento multi-step, puede integrarse en pipelines de agentes que requieran respuestas sin filtros de rechazo.
- Evaluación de robustez: investigadores pueden usar este modelo para probar si las técnicas de ablación afectan a la calidad del razonamiento en benchmarks estándar (MMLU, GPQA, ARC).
- Despliegue en entornos controlados: con cuantización 4-bit cabe en GPUs de 24 GB, permitiendo ejecución local en estaciones de trabajo para tareas de generación de texto con contexto largo (hasta 262K tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterada. Los datos disponibles corresponden al modelo `barozp/Qwen3.8-27B-Opus-Distill-v2` (sin ablación), medidos con `lm-evaluation-harness` en modo 0-shot, loglikelihood, sin chat template y con `--limit 500`. La columna Δ indica la diferencia respecto al modelo base Qwen3.8-27B.

| Tarea | Métrica | Base | v2 | Δ |
|---|---|---|---|---|
| wikitext | word perplexity ↓ | 8.4335 | 8.3788 | −0.055 |
| mmlu | acc | 0.8494 | 0.8476 | −0.002 |
| hellaswag | acc_norm | 0.7420 | 0.7500 | +0.008 |
| arc_challenge | acc_norm | 0.5880 | 0.6220 | +0.034 |
| gpqa_diamond | acc_norm | 0.2323 | 0.4697 | +0.237 |

Nota: el autor del modelo abliterado no ha publicado benchmarks propios. La ablación puede alterar el rendimiento; se recomienda re-evaluar en el caso de uso concreto.

## Requisitos de hardware

- VRAM estimada: en FP16 (~54 GB) se necesita una GPU profesional (A100 80GB, H100) o dos GPUs de 24 GB en paralelo. Con cuantización 4-bit (GGUF o GPTQ) se reduce a ~16-18 GB, cabiendo en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPUs recomendadas: A100 80GB, H100, RTX 4090, RTX 3090, o cualquier GPU con al menos 24 GB de VRAM para cuantización 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con `load_in_4bit` o `load_in_8bit`.
- Latencia y throughput: no disponible. Al ser un modelo de 27B con MTP, la inferencia puede ser más rápida que un modelo denso equivalente, pero no hay datos publicados.
- Tamaño del repo: 55.6 GB (pesos en safetensors, precisión completa).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 26.9B | 262K | Apache-2.0 | Modelo original sin fine-tune ni ablación |
| barozp/Qwen3.8-27B-Opus-Distill-v2 | 26.9B | 262K | Apache-2.0 | Fine-tune con trazas de Opus, sin ablación |
| KarlKinda/Qwen3.8-27B-Opus-Distill-v2-Abliterated-L14 | 26.9B | 262K | Apache-2.0 | Este modelo: ablación de rechazo sobre el v2 |

No se dispone de comparativas con otros modelos de 27B (p. ej., Llama 3.1 8B o Mistral 7B) porque no hay datos de benchmarks en la información proporcionada. La comparativa más relevante es contra el propio base y el v2 sin abliterar.

## Limitaciones y advertencias

- La ablación de rechazo no garantiza que las respuestas sean precisas, benignas o adecuadas para todos los despliegues. El autor recomienda re-evaluar capacidad, factualidad y comportamiento en los prompts reales.
- El modelo puede generar contenido inapropiado, ofensivo o peligroso al no tener mecanismos de rechazo. No es adecuado para aplicaciones de producción sin supervisión humana.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo.
- Los benchmarks disponibles son del modelo v2 sin ablación; el rendimiento de esta versión puede diferir.
- El bug de bucle de razonamiento de la v1 se corrigió en v2, pero no hay garantía de que no aparezcan otros patrones patológicos.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del contenido generado.
- No se especifican los idiomas soportados; se asume herencia del base Qwen3.8, pero no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KarlKinda/Qwen3.8-27B-Opus-Distill-v2-Abliterated-L14
- Modelo base del fine-tune (barozp/Qwen3.8-27B-Opus-Distill-v2): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2
- Versión GGUF del v2: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF
- Herramienta de ablación (LLM-abliterate): https://github.com/nanofatdog/LLM-abliterate
- Blog sobre Qwen3.8-27B (explainx.ai): https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Repo de ejecución local de Qwen3.8-27B: https://github.com/qwen3-8-27b-app/qwen3.8-27b
