# sergiopaniego/watercolour-grpo-v14b

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v14b` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, Machine Learning Engineer en Hugging Face. Se ha entrenado utilizando la técnica GRPO (Group Relative Policy Optimization), introducida en el artículo DeepSeekMath, con el framework TRL de Hugging Face. El objetivo del ajuste no está documentado explícitamente, pero el ejemplo de uso en la model card muestra generación de texto conversacional, lo que sugiere una orientación hacia razonamiento o diálogo.

El modelo base es un transformer de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token (indicado por el sufijo A3B). El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que podría tratarse de un adaptador o de pesos parciales, aunque no se especifica. La relevancia de este modelo radica en explorar el fine-tuning con GRPO sobre un modelo MoE reciente, un enfoque que ha demostrado mejoras en razonamiento matemático y lógico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) basada en Qwen/Qwen3.5-35B-A3B |
| Parametros totales | 35B (del modelo base) |
| Parametros activos | 3B (del modelo base, sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-35B-A3B, que emplea una arquitectura MoE con 35B parámetros totales y 3B activos por token. El entrenamiento se realizó con GRPO, un algoritmo de optimización de políticas relativas por grupos que ha mostrado eficacia en tareas de razonamiento matemático. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. Las versiones de framework indicadas son TRL 1.12.0, Transformers 5.16.1, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Generación de texto: el ejemplo de la model card muestra uso con `pipeline("text-generation")` para responder a preguntas conversacionales.
- Razonamiento: al estar entrenado con GRPO, es probable que haya mejorado capacidades de razonamiento paso a paso, aunque no hay evidencia documentada.
- No se especifican capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas para este fine-tune.
- El modelo base Qwen3.5 podría tener capacidades multilingües, pero no se confirma para esta versión ajustada.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que es un fine-tune del modelo base Qwen3.5-35B-A3B, podría emplearse en escenarios similares a los del base, como:

- Generación de texto conversacional: el ejemplo de la model card muestra una pregunta abierta sobre viajes en el tiempo, lo que sugiere uso en chatbots o asistentes.
- Razonamiento matemático y lógico: al entrenarse con GRPO, podría aplicarse a problemas de matemáticas o lógica, aunque no hay benchmarks que lo confirmen.
- Experimentación académica: como modelo de investigación para estudiar el efecto de GRPO sobre arquitecturas MoE.
- Prototipado rápido: gracias a su tamaño reducido (0,1 GB), podría usarse en entornos con recursos limitados para pruebas de concepto.
- Fine-tuning adicional: al ser un checkpoint intermedio, podría servir como base para otros ajustes con tareas específicas.
- Evaluación de técnicas de RL: útil para comparar metodologías de optimización en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación.
- Dado que el modelo base tiene 35B parámetros totales (aunque solo 3B activos), la VRAM necesaria para inferencia depende de la cuantización y del método de carga. En FP16, un modelo de 35B requiere aproximadamente 70 GB de VRAM, pero al ser MoE con 3B activos, el uso de memoria podría ser menor si se implementa correctamente.
- No se indica si es compatible con GPU de consumo (como RTX 4090) o si requiere GPUs de datacenter (A100, H100).
- Opciones de despliegue: al usar Transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama, pero no hay confirmación oficial.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros fine-tunes del mismo modelo base o de modelos comparables en la misma categoría. La comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "license" sin detallar los términos, lo que impide conocer si es de uso comercial o tiene restricciones.
- Sin documentación de sesgos: no se han publicado análisis de sesgos, alucinaciones o comportamientos indeseados.
- Tamaño del repositorio reducido (0,1 GB): podría tratarse de un adaptador o de pesos parciales, lo que requeriría cargar el modelo base por separado.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad no está validada.
- Fecha de creación futura (2026-08-29): el modelo es muy reciente y no ha sido probado por la comunidad (0 descargas, 0 likes).
- Idiomas no especificados: no se sabe si el fine-tune afecta a las capacidades multilingües del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v14b
- Space de visualización TrackIO: https://huggingface.co/spaces/sergiopaniego/watercolour-grpo-smoke
- Repositorio similar (watercolour-grpo): https://huggingface.co/sergiopaniego/watercolour-grpo
- GitHub del autor: https://github.com/sergiopaniego
- Sitio personal del autor: https://sergiopaniego.github.io/
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
