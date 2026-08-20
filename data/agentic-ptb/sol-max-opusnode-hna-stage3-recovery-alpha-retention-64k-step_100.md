# agentic-ptb/sol-max-opusnode.hNA.stage3-recovery-alpha-retention-64k.step_100

## Resumen

Este modelo es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, identificado como `sol-max-opusnode`. Está basado en el modelo base Qwen/Qwen3.5-9B-Base, por lo que hereda su arquitectura de 9,4 mil millones de parámetros. El checkpoint corresponde al paso 100 de la etapa 3 de recuperación (stage3-recovery-alpha) con una retención de contexto de 64k tokens, según indica su nombre. Fue generado por un agente de código (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso. Se trata de un artefacto de investigación, no de un modelo final listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-9B-Base (transformer decoder-only, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k (según el nombre del checkpoint, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Al ser un fine-tuning de Qwen/Qwen3.5-9B-Base, la arquitectura subyacente es la de ese modelo base, un transformer decoder-only con aproximadamente 9,4 mil millones de parámetros. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas como RLHF o DPO. El nombre del checkpoint sugiere un proceso de entrenamiento por etapas (stage3-recovery) con una ventana de contexto de 64k tokens. Se trata de un checkpoint intermedio de un barrido de hiperparámetros, no de un modelo final. La model card indica que el checkpoint fue recuperado de una copia de seguridad tras ser podado del almacenamiento principal.

## Capacidades

No se dispone de información concreta sobre las capacidades del modelo. Al estar basado en Qwen/Qwen3.5-9B-Base, podría heredar capacidades de generación de texto, razonamiento y código, pero no hay confirmación en la documentación proporcionada. No se menciona soporte para tool calling, agentes, visión, audio ni otras funcionalidades especiales. La model card solo describe el checkpoint como parte de un proceso de entrenamiento experimental.

## Casos de uso

No se pueden enumerar casos de uso concretos sin información adicional. Este checkpoint parece ser un artefacto intermedio de investigación, no un modelo destinado a aplicaciones prácticas. No se recomienda su uso en producción sin una evaluación exhaustiva de su comportamiento y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 19-20 GB en FP16 (los pesos safetensors ocupan 18,8 GB). Con cuantización de 8 bits podría reducirse a ~10 GB, y con 4 bits a ~5-6 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G, etc.). Con cuantización, podría ejecutarse en GPUs de consumo con 8-12 GB (RTX 3060, RTX 4070, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que el formato safetensors se convierta a GGUF u otro compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Al ser un checkpoint de un fine-tuning de Qwen/Qwen3.5-9B-Base, se podría comparar con el propio modelo base, pero no hay datos de rendimiento publicados para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; puede presentar comportamiento inestable o incompleto.
- La model card advierte de un `eos_token_id` faltante (248046), lo que podría provocar que el modelo no termine correctamente las secuencias generadas.
- No se dispone de licencia, por lo que su uso comercial es incierto.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- No se recomienda su uso en producción sin una evaluación completa.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-max-opusnode.hNA.stage3-recovery-alpha-retention-64k.step_100
- Modelo base: Qwen/Qwen3.5-9B-Base (enlace no proporcionado en la información disponible)
