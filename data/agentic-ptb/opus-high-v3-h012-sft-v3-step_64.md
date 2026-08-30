# agentic-ptb/opus-high-v3.h012.sft-v3.step_64

## Resumen

`opus-high-v3.h012.sft-v3.step_64` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, un experimento de entrenamiento agéntico que utiliza Claude Code para generar y evaluar modelos de lenguaje. Se trata de un fine-tune del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El autor lo etiqueta explícitamente como `negative-results` y advierte en la model card que el run no produjo ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad a partir de su publicación.

La relevancia de este modelo es principalmente metodológica: sirve como artefacto de reproducibilidad para estudiar el proceso de entrenamiento agéntico y los fallos de convergencia en fine-tunes derivados de Qwen3.5. No está pensado para uso en producción ni para tareas concretas, y el propio autor recomienda no utilizarlo como referencia de rendimiento. Su publicación responde a la necesidad de documentar resultados negativos en la investigación de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer estándar. No se han publicado detalles sobre la configuración exacta de capas, atención o mecanismos de normalización más allá de lo heredado del modelo base. El entrenamiento se realizó dentro del run `opus-high-v3` del proyecto AgentPTB, un experimento que utiliza Claude Code como agente para orquestar el proceso de SFT (supervised fine-tuning). El checkpoint corresponde al paso 64 de la fase `sft-v3` y a la hora de ejecución `h012`.

Según la model card, el run completo no mostró ninguna mejora en los pesos entrenados respecto al modelo base. El autor lo clasifica como `intermediate` y `negative-results`, y lo conserva únicamente con fines de reproducibilidad y estudio cualitativo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni la aplicación de técnicas como RLHF o DPO. El archivo de datos del run está disponible en el dataset `agentic-ptb/opus-high-v3-data`.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un fine-tune de Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero el autor no proporciona ninguna evaluación ni demostración. Dado el aviso de `negative-results`, no se recomienda asumir que el modelo mantiene o mejora dichas capacidades. No hay información sobre tool calling, soporte de agentes, capacidades multilingües o modos especiales de razonamiento.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos reportados por el autor.
- Estudio de procesos de entrenamiento agéntico: puede usarse para analizar cómo Claude Code orquesta fine-tunes y por qué ciertos runs no convergen o no mejoran los pesos.
- Análisis de fallos de convergencia: al ser un checkpoint intermedio, permite inspeccionar la evolución de los pesos en un run que finalmente no produjo mejoras.
- Documentación de resultados negativos: sirve como ejemplo de publicación de artefactos fallidos en investigación de IA, fomentando la transparencia.
- Comparación de pipelines de SFT: puede contrastarse con otros checkpoints del mismo proyecto (p. ej., `opus-high-v1`) para estudiar diferencias metodológicas.
- No se recomienda su uso en aplicaciones prácticas, dado que no hay evidencia de que el modelo funcione correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado el carácter de `negative-results`, es probable que el modelo no alcance el rendimiento del base, pero no hay datos que lo confirmen.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. A partir del tamaño de parámetros (9,4 mil millones) y del peso del repositorio (18,8 GB, consistente con pesos en FP16), se puede estimar:

- VRAM estimada para inferencia: aproximadamente 19 GB en FP16 sin cuantización. Con cuantización a 8 bits podría reducirse a unos 10 GB, y a 4 bits a unos 5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (p. ej., RTX 3090, RTX 4090, A10G) para FP16. Con cuantización, podría caber en GPUs de 12-16 GB (p. ej., RTX 3060, RTX 4070).
- Opciones de despliegue: al ser un modelo safetensors estándar, podría cargarse con frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay soporte oficial documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos de la misma categoría. El único punto de referencia sería el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos de rendimiento del checkpoint frente a él.

## Limitaciones y advertencias

- El autor declara explícitamente que el run no produjo ninguna mejora en los pesos entrenados (`negative-results`). No debe inferirse calidad a partir de su publicación.
- Es un checkpoint intermedio (`intermediate`), no un modelo final. Puede presentar problemas de convergencia o pesos incompletos.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto o idioma. Al ser un fine-tune de Qwen3.5-9B-Base, podría heredar las limitaciones del base, pero no está verificado.
- La licencia apache-2.0 permite uso comercial, pero el modelo no está diseñado para producción y carece de evaluaciones que lo respalden.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h012.sft-v3.step_64
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
