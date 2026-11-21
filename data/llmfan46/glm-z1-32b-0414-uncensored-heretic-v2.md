# llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v2 es una variante "decensurada" del modelo GLM-Z1-32B-0414 desarrollado originalmente por Zhipu AI (zai-org). El autor de la variante, llmfan46, ha aplicado la herramienta Heretic v1.2.0 con el método de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) para reducir drásticamente la tasa de rechazos del modelo original, manteniendo al mismo tiempo una divergencia KL muy baja (0,0007) respecto al comportamiento base.

El modelo conserva la arquitectura del GLM-Z1-32B original: un transformer denso de aproximadamente 32.566 millones de parámetros (32,5B), empaquetado en safetensors con un tamaño de repositorio de 65,2 GB. Está orientado a generación de texto conversacional y razonamiento, y soporta los idiomas chino e inglés según la model card.

Su relevancia radica en que demuestra una técnica de "abliteración" quirúrgica: en lugar de reentrenar, se intervienen componentes de atención específicos (attn.o_proj) en un rango de capas (18 a 43) para eliminar direcciones de activación asociadas a comportamientos de rechazo, con una pérdida mínima de capacidades. La licencia MIT facilita su uso y modificación, aunque el modelo hereda las limitaciones y sesgos del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM4, según tag `glm4`) |
| Parametros totales | 32.566.081.536 (32,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base GLM-Z1-32B-0414 es un transformer denso de la familia GLM4 de Zhipu AI, orientado a razonamiento y generación de texto. La variante heretic no reentrena el modelo: aplica una ablación de direcciones de activación sobre el componente `attn.o_proj` en las capas 18 a 43, utilizando los parámetros `preserve_good_behavior_weight` = 0,7515, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 1,0641 y `neighbor_count` = 8. Esta técnica elimina direcciones asociadas a respuestas de rechazo sin alterar sustancialmente el resto de la representación.

El proceso se realizó con Heretic v1.2.0 y el método ARA (Arbitrary-Rank Ablation), que permite ablaciones de rango completo en lugar de solo rango uno. El resultado reportado es una reducción de rechazos del 72% (de 94/100 a 26/100 en un conjunto de prueba de 100 prompts) con una divergencia KL de 0,0007 respecto al modelo original. No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, fases de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento y resolución de problemas (heredado del GLM-Z1-32B base).
- Reducción significativa de rechazos y respuestas de evasión (72% menos rechazos según la model card).
- Comportamiento más permisivo ante prompts que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no confirmado en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para medir el efecto de la ablación de direcciones de rechazo sobre el comportamiento y las capacidades, comparando con el base mediante KL y benchmarks como PIQA y MMLU.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las evasivas típicas de modelos alineados, aprovechando la reducción de rechazos.
- Evaluación de robustez de filtros: uso en pipelines de red teaming para probar clasificadores de contenido y sistemas de moderación frente a un modelo menos restrictivo.
- Asistencia conversacional en chino e inglés: atención al cliente o chat multi-turno en entornos donde se requiere un tono directo y sin respuestas de evasión.
- Experimentación académica con técnicas de abliteración: replicar o comparar el método ARA y los parámetros de Heretic sobre otras arquitecturas.
- Generación de texto para investigación lingüística: análisis de diferencias de estilo y contenido entre el modelo original y la variante decensurada con divergencia KL mínima.
- Despliegue en entornos de investigación controlados: con licencia MIT y pesos safetensors, se puede integrar en frameworks como transformers o vLLM para experimentos internos.

## Benchmarks y rendimiento

| Benchmark | Modelo original (GLM-Z1-32B-0414) | Este modelo (heretic v2) |
|---|---|---|
| PIQA acc | 0,8156 ± 0,0090 | 0,8139 ± 0,0091 |
| PIQA acc_norm | 0,8210 ± 0,0089 | 0,8172 ± 0,0090 |
| MMLU acc | 0,7001 ± 0,0036 | no disponible |
| Rechazos (100 prompts) | 94/100 | 26/100 |
| Divergencia KL | 0 (por definición) | 0,0007 |

Los datos de MMLU del modelo original incluyen subcategorías (humanities 0,6193; formal_logic 0,6111; high_school_european_history 0,8182; high_school_us_history 0,8873; high_school_world_history 0,8608; international_law 0,8017; jurisprudence 0,8056; logical_fallacies 0,8037; moral_disputes 0,6965), pero no se reportan resultados MMLU para la variante heretic en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65 GB (32,5B parámetros × 2 bytes), lo que requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- Cuantización a 8 bits: ~33 GB de VRAM, viable en una A100 40GB o dos RTX 4090 (24GB cada una).
- Cuantización a 4 bits: ~17-20 GB de VRAM, viable en una RTX 4090 (24GB) o RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; RTX 4090/3090 para cuantización 4-bit.
- Opciones de despliegue: transformers (confirmado por la librería); vLLM, llama.cpp, Ollama o TGI no confirmados explícitamente en la información proporcionada, aunque al ser safetensors y arquitectura GLM4 podrían requerir conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v2 | 32,5B | no disponible | MIT | Variante decensurada con ablación ARA |
| zai-org/GLM-Z1-32B-0414 (base) | 32,5B | no disponible | no disponible en la información | Modelo original con alineación estándar |
| Otros modelos decensurados de ~32B | no disponible | no disponible | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, variantes abliterated de Qwen o Llama) en términos de rendimiento y contexto.

## Limitaciones y advertencias

- La reducción de rechazos implica que el modelo puede generar contenido que el original evitaría; requiere moderación externa en producción.
- Riesgo de alucinación inherente al modelo base; la ablación no corrige este comportamiento.
- Idiomas limitados a chino e inglés según la model card; el rendimiento en castellano no está garantizado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- La model card incluye avisos del autor sobre límites de almacenamiento gratuito en Hugging Face y solicitudes de donación; no afecta al uso técnico pero conviene tenerlo en cuenta.
- Los benchmarks reportados son limitados (PIQA y MMLU del base); no hay evaluación exhaustiva de la variante heretic en tareas de razonamiento o código.
- El modelo tiene solo 22 descargas y 1 like en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.
- La fecha de creación reportada (2026-04-02) y actualización (2026-11-21) deben tratarse con cautela según la fuente.

## Enlaces

- Hugging Face: https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2
- Modelo base: https://huggingface.co/zai-org/GLM-Z1-32B-0414
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Método ARA (PR): https://github.com/p-e-w/heretic/pull/211
- Paper de referencia (arXiv:2406.12793): https://arxiv.org/abs/2406.12793
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
