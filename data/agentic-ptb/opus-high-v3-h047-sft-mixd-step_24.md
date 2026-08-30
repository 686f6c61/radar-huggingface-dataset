# agentic-ptb/opus-high-v3.h047.sft-mixd.step_24

## Resumen

El modelo `agentic-ptb/opus-high-v3.h047.sft-mixd.step_24` es un checkpoint intermedio generado durante el experimento **opus-high-v3** del proyecto AgentPTB, un conjunto de ejecuciones de Claude Code orientadas a estudiar el entrenamiento de agentes mediante ajuste fino supervisado (SFT). El autor, `agentic-ptb`, lo publica con el rol de `intermediate` y la etiqueta `negative-results`, indicando que el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base. Este checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso práctico.

El modelo parte de la arquitectura base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros, y se distribuye bajo licencia Apache-2.0 en formato safetensors. La model card advierte explícitamente que no se debe inferir calidad a partir de su publicación, ya que el experimento concluyó sin encontrar mejoras en los pesos. Su relevancia actual reside en su valor como artefacto de investigación para entender qué configuraciones de SFT no funcionan, y como referencia para futuros experimentos del mismo proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only con atención causal estándar, sin mecanismos de mezcla de expertos (MoE). No se dispone de información detallada sobre el diseño interno (número de capas, dimensiones de atención, etc.) más allá de lo que pueda inferirse de la familia Qwen3.5 de 9B. El entrenamiento corresponde a un paso intermedio (step_24) de un run de ajuste fino supervisado con mezcla de datos (`sft-mixd`), ejecutado en la hora 47 del experimento opus-high-v3. No se han publicado datos sobre el volumen de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el run no encontró ninguna mejora en los pesos entrenados, lo que sugiere que el ajuste fino no produjo diferencias significativas respecto al modelo base.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un derivado del modelo base Qwen3.5-9B-Base, en principio podría presentar las capacidades generales de dicha familia (generación de texto, razonamiento, código, matemáticas, soporte multilingüe, etc.), pero no existen evaluaciones publicadas que confirmen el comportamiento de este checkpoint concreto. La etiqueta `negative-results` y el aviso de la model card indican que no se debe asumir que el ajuste fino haya aportado ninguna habilidad adicional. No se dispone de información sobre tool calling, capacidades de agente o modos de pensamiento extendido.

## Casos de uso

Dado que el modelo es un checkpoint intermedio con resultados negativos y sin validación funcional, no se recomienda su uso en ningún escenario práctico. Los únicos casos de uso razonables son:

- Reproducción de experimentos de investigación: permite a otros investigadores replicar el run opus-high-v3 y verificar los resultados negativos reportados, comparando los pesos del paso 24 con el modelo base.
- Estudio cualitativo de fallos de entrenamiento: sirve para analizar por qué un ajuste fino supervisado no logra mejorar los pesos, examinando las diferencias entre el checkpoint y el base.
- Referencia para diseño de experimentos: los datos del run (disponibles en el dataset `agentic-ptb/opus-high-v3-data`) pueden orientar futuras configuraciones de SFT evitando los mismos errores.
- Auditoría de pipelines de entrenamiento: útil para validar que un sistema de generación de checkpoints funciona correctamente incluso cuando el resultado es negativo.
- Educación en metodología de IA: como ejemplo de publicación de resultados negativos en un entorno de investigación abierta.
- Comparación de pesos: permite verificar que el proceso de SFT no introdujo cambios inesperados en la distribución de pesos cuando no hay mejora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación de rendimiento, y el propio autor advierte que no se debe inferir calidad de la publicación. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

## Requisitos de hardware

No se dispone de datos específicos de requisitos de hardware para este checkpoint. Como estimación general para un modelo transformer denso de ~9,4 B parámetros en formato safetensors:

- VRAM estimada para inferencia: entre 18 y 20 GB en fp16 (dado el tamaño del repo de 18,8 GB), reducible a ~5-6 GB con cuantización de 4 bits si se generan los pesos GGUF.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior podría ejecutar el modelo en fp16; GPUs con menos VRAM requerirían cuantización.
- En GPU de consumo: sí, es factible en tarjetas con al menos 16 GB de VRAM usando cuantización, aunque no hay garantías de rendimiento.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían servir, pero al no haber sido validado, no se recomienda su uso en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que el modelo es un checkpoint intermedio sin resultados publicados, la comparación más relevante es con su modelo base y con el proyecto AgentPTB en general. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h047.sft-mixd.step_24 | ~9,4 B | no disponible | no publicado | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B-Base | ~9,4 B | no disponible | no publicado | Apache-2.0 | HuggingFace |
| Otros modelos de 9B (p. ej. Llama-3.1-8B) | ~8 B | 128K | benchmarks publicados | Llama 3.1 | HuggingFace |

La comparación con otros modelos de 9B no es significativa porque este checkpoint no ha sido evaluado y no se recomienda su uso.

## Limitaciones y advertencias

- Resultados negativos confirmados: el run no encontró ninguna mejora en los pesos entrenados; el checkpoint es funcionalmente equivalente al modelo base.
- No validado para uso práctico: al ser un artefacto intermedio sin evaluaciones, no debe utilizarse en aplicaciones reales.
- Riesgo de alucinación y sesgos: al derivar de Qwen3.5-9B-Base, puede heredar los sesgos y limitaciones del modelo base, pero no hay estudios específicos sobre este checkpoint.
- Sin información de contexto ni idiomas: no se han especificado la longitud de contexto ni los idiomas soportados, lo que impide conocer sus límites operativos.
- Licencia Apache-2.0: permite uso comercial, pero el autor desaconseja explícitamente inferir calidad de su publicación.
- Escasa adopción: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- Proyecto en curso: el experimento opus-high-v3 es parte de una serie; los resultados pueden estar sujetos a revisión o corrección.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h047.sft-mixd.step_24)
- [Dataset del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
