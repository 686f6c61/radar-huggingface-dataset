# agentic-ptb/kimi.h073.rft_v1.step_24

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, correspondiente a la celda `kimi` con el driver `kimi-code/kimi-k3` y un nivel de razonamiento `high`. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), almacenado en formato safetensors con un tamaño de 18,8 GB. El checkpoint fue creado el 20 de agosto de 2026 y representa la hora 73 del total de 100 horas de ejecución del sweep, aunque la model card interna menciona la hora 74 y el paso 96, lo que sugiere una posible discrepancia entre el identificador del repositorio y el contenido de la documentación.

El modelo está diseñado para tareas de generación de código y trabajo de conocimiento, con un énfasis en razonamiento de alto esfuerzo. Al ser un checkpoint intermedio, su propósito principal es servir como punto de seguimiento en la curva de rendimiento del entrenamiento, no como un modelo final listo para producción. La model card advierte de un problema crítico: el token `eos_token_id` está incompleto (solo incluye `248044` y falta `248046`, que corresponde a `<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda desbordar la ventana de contexto. Esto invalida las métricas de evaluación como medición absoluta, aunque permite comparaciones relativas entre checkpoints con el mismo estado de EOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, sin especificar) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen3.5-9B-Base, que cuenta con 9,4 mil millones de parámetros. El entrenamiento se realiza mediante *Rejection Fine-Tuning* (RFT), como indica el nombre `rft_v1` en la ruta del checkpoint. El proceso se enmarca en un sweep de 100 horas de duración, donde se evalúan diferentes configuraciones de celdas (en este caso, la celda `kimi`) y drivers (kimi-code/kimi-k3). El nivel de razonamiento se fija en `high`, lo que implica un mayor gasto computacional durante la generación para obtener respuestas más elaboradas.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número total de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card solo indica que el checkpoint se guarda en `runs/rft_v1/weights/step_96` y que el run comenzó el 15 de agosto de 2026 a las 21:03 UTC. La arquitectura subyacente es la estándar de Qwen3.5, sin innovaciones específicas documentadas en este repositorio.

## Capacidades

- Generación de texto y razonamiento de alto esfuerzo, orientado a tareas de código y conocimiento.
- Soporte de *tool calling* y *function calling*: no confirmado explícitamente, pero probablemente heredado del modelo base Qwen3.5.
- Capacidades de agente y razonamiento multi-paso: el driver `kimi-code/kimi-k3` sugiere un enfoque en tareas agénticas, aunque no hay documentación específica.
- Multilingüismo: no disponible, aunque Qwen3.5 suele soportar múltiples idiomas.
- Sin capacidades de visión ni audio: el modelo base es solo texto.

## Casos de uso

- Evaluación de progreso en entrenamiento: al ser un checkpoint intermedio, su uso principal es monitorizar la evolución del rendimiento a lo largo del sweep, comparándolo con otros checkpoints del mismo run.
- Generación de código asistida: puede emplearse para completar o generar fragmentos de código en entornos de desarrollo, aprovechando el fine-tune orientado a código, aunque requiere re-empaquetado para corregir el problema de EOS.
- Prototipado de agentes de razonamiento: su configuración de alto esfuerzo lo hace adecuado para experimentar con pipelines de razonamiento multi-paso, siempre que se gestione manualmente la terminación de secuencias.
- Investigación en fine-tuning: útil para estudiar el efecto de RFT sobre la base Qwen3.5-9B en tareas de código, comparando con el modelo base y otros checkpoints.
- Desarrollo de herramientas de conocimiento: puede integrarse en sistemas de recuperación y síntesis de información, aunque con cautela por la falta de licencia y el estado incompleto.
- Benchmarking de checkpoints: sirve como referencia para validar metodologías de evaluación cuando el token EOS está incompleto, como se explica en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "floor" (suelo) y no una medición real, debido a la ausencia del token `<|im_end|>` en `eos_token_id`. Por tanto, cualquier métrica reportada sería engañosa sin corregir primero el empaquetado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repo). En cuantización 4-bit, podría reducirse a unos 5-6 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB o más (RTX 3090/4090, A10G, A100 40GB). Para cuantización 4-bit, una RTX 3060 12GB o similar podría ser suficiente, aunque no hay archivos GGUF publicados.
- Si cabe en consumer GPU: sí, en cuantización 4-bit podría ejecutarse en GPUs de gama media-alta, pero sin soporte oficial.
- Opciones de despliegue: al ser safetensors, se puede usar con vLLM, TGI o Transformers, pero requiere corregir el token EOS antes de servir. No hay soporte directo para llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/kimi.h073.rft_v1.step_24 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace (modelo base) |
| Kimi K3 (Moonshot AI) | 2,8T | 1M tokens | open-weight | API y GitHub |

El modelo es un fine-tune del Qwen3.5-9B-Base, por lo que su comparación directa es con el propio base. Kimi K3, a pesar del nombre similar, es un modelo completamente distinto de 2,8 billones de parámetros, sin relación con este checkpoint. No se dispone de otros fine-tunes comparables en la información proporcionada.

## Limitaciones y advertencias

- Problema crítico de EOS: el token `eos_token_id` está incompleto (falta `248046`), lo que provoca que el modelo no termine las respuestas correctamente y pueda desbordar la ventana de contexto. Cualquier uso en producción requiere re-empaquetar el modelo.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- Licencia no disponible: no se puede determinar si es apto para uso comercial o académico sin restricciones.
- Sin benchmarks fiables: las métricas de evaluación son un "floor" y no deben interpretarse como mediciones reales.
- Sesgos y alucinaciones: no hay información específica, pero al ser un fine-tune de Qwen3.5, puede heredar sesgos del modelo base y presentar riesgo de alucinación, especialmente en tareas de código.
- Documentación inconsistente: la model card menciona `h074` y `step_96`, mientras que el ID del repo indica `h073` y `step_24`, lo que genera confusión sobre el contenido real del checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h073.rft_v1.step_24
- Kimi K3 (modelo de Moonshot AI, contexto general): https://www.kimi.com/en
- Documentación de Kimi K3 API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Repositorio GitHub de Kimi K3: https://github.com/MoonshotAI/Kimi-K3
- Leaderboard BenchLM (referencia de benchmarks): https://benchlm.ai/
