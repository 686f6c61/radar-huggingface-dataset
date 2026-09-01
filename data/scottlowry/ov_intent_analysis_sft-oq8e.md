# scottlowry/ov_intent_analysis_sft-oQ8e

## Resumen

El modelo `scottlowry/ov_intent_analysis_sft-oQ8e` es una versión cuantizada a 8 bits del modelo `guoxuter/ov_intent_analysis_sft`, un clasificador ligero diseñado para el sistema OpenViking de Volcengine. Su función principal es decidir si un turno de conversación del usuario requiere recuperación de contexto externo (retrieval) y, en caso afirmativo, generar las consultas de búsqueda adecuadas. El modelo original está pensado para despliegue local en entornos con pocos recursos, y esta variante cuantizada mediante la herramienta oQ (oMLX) reduce aún más el footprint, manteniendo un formato MLX safetensors.

Con aproximadamente 312 millones de parámetros y un tamaño de repositorio de 1 GB, se trata de un modelo compacto que puede ejecutarse en CPU o GPUs modestas. Es parte del ecosistema OpenViking, un framework de agentes con recuperación aumentada, y está optimizado para su uso con el plugin OpenClaw. La cuantización mixta a 8 bits con grupo de 64 permite una inferencia más rápida y un menor consumo de memoria, lo que lo hace adecuado para entornos edge o integraciones en pipelines de RAG.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiqueta del modelo) |
| Parametros totales | 312.561.728 (~312M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (oQ mixed-precision, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `guoxuter/ov_intent_analysis_sft` se presenta como un modelo de tipo `qwen3_5`, lo que sugiere una arquitectura transformer basada en la familia Qwen, aunque no se han publicado detalles específicos sobre el número de capas, cabezas de atención o configuración exacta. Al ser un modelo pequeño (~312M), es probable que siga el diseño de los modelos Qwen de menor escala, pero esta información no está confirmada.

No se dispone de documentación sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La única transformación documentada es la cuantización realizada con la herramienta oQ (oMLX v0.6.4), que aplica cuantización mixta de precisión a 8 bits con un tamaño de grupo de 64. Esta cuantización reduce el tamaño del modelo manteniendo el formato MLX, optimizado para Apple Silicon, aunque también puede convertirse a otros formatos como GGUF para su uso en Ollama.

## Capacidades

- Análisis de intención: determina si un turno de usuario requiere recuperación de contexto externo, actuando como un filtro binario previo a la búsqueda.
- Generación de consultas: cuando se detecta una necesidad de recuperación, el modelo genera las consultas de búsqueda apropiadas para el sistema de retrieval.
- Integración con OpenViking: diseñado específicamente para el planificador de consultas de OpenViking, con un prompt dedicado (v7) en el repositorio oficial.
- Despliegue local ligero: gracias a su tamaño reducido y cuantización, puede ejecutarse en entornos con recursos limitados, como CPUs o GPUs de gama baja.
- Compatibilidad con MLX: al estar en formato MLX safetensors, se integra nativamente con el ecosistema MLX de Apple, y también existe una versión GGUF en Ollama.
- Especialización en retrieval planning: su función no es la generación de texto general, sino la toma de decisiones y planificación de consultas dentro de un pipeline de RAG.

## Casos de uso

- Filtrado de consultas en sistemas RAG: el modelo puede colocarse como un preprocesador que decide qué mensajes de usuario requieren búsqueda en una base de conocimiento, evitando llamadas innecesarias al motor de retrieval.
- Asistentes conversacionales con memoria externa: en agentes que mantienen conversaciones de múltiples turnos, el modelo identifica cuándo el contexto interno es insuficiente y dispara la recuperación de información relevante.
- Automatización de pipelines de recuperación: puede integrarse en un flujo de CI/CD para clasificar automáticamente tickets o solicitudes que necesitan consultar documentación técnica.
- Edge computing y dispositivos embebidos: su pequeño tamaño y cuantización permiten ejecutarlo en dispositivos con poca memoria, como Raspberry Pi o sistemas embebidos con soporte para MLX.
- Integración con OpenViking y OpenClaw: se usa directamente como el planificador de consultas en el framework OpenViking, mejorando la precisión de la recuperación en agentes autónomos.
- Preprocesamiento de logs de chat: puede analizar conversaciones almacenadas para identificar qué turnos requirieron búsqueda, útil para auditorías o mejoras del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. La evaluación se centra probablemente en la precisión de la clasificación de intención dentro del contexto específico de OpenViking, pero no se han facilitado cifras.

## Requisitos de hardware

- VRAM estimada: con 312M parámetros y cuantización de 8 bits, el modelo ocupa aproximadamente 312 MB en memoria (sin contar overhead). Para inferencia en GPU, se recomienda al menos 1-2 GB de VRAM libre.
- GPU recomendadas: cualquier GPU con soporte para MLX (Apple Silicon) o CUDA (tras convertir a GGUF) con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior. También puede ejecutarse en CPU con 4 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y en la mayoría de los portátiles modernos.
- Opciones de despliegue: al ser formato MLX, se integra con librerías como `mlx-lm` o `omlx`. También existe una versión Ollama (`guoxuter/ov_intent_analysis_sft:v7_q8`) que facilita su uso en entornos CPU/GPU. Para despliegues en servidores, puede convertirse a GGUF y usarse con llama.cpp o vLLM.
- Latencia y throughput: no hay datos publicados, pero dado el tamaño reducido, se espera una inferencia en milisegundos en hardware moderno, incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (clasificadores de intención para retrieval planning con ~300M de parámetros). El modelo base `guoxuter/ov_intent_analysis_sft` es el punto de referencia, pero no se han publicado especificaciones completas del mismo. Se podría comparar con otros clasificadores pequeños como `bert-base-uncased` (110M) o `distilbert` (66M), pero su arquitectura y propósito son diferentes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos. Al ser un modelo entrenado específicamente para un dominio (retrieval planning), puede tener comportamientos inesperados fuera de ese contexto.
- Riesgo de alucinación: como modelo generativo, puede producir consultas incorrectas o irrelevantes si el prompt de entrada no es claro. No hay métricas de fiabilidad publicadas.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y los idiomas soportados. Es probable que esté entrenado principalmente en inglés, dado el origen de OpenViking.
- Restricciones de licencia: tanto el modelo base como esta versión cuantizada no tienen una licencia especificada. Esto implica que su uso comercial no está garantizado y podría requerir contacto con el autor.
- Caveat de producción: al ser un modelo pequeño y especializado, no debe utilizarse como un LLM generalista. Su rendimiento fuera del flujo de OpenViking puede ser deficiente.
- Formato propietario: el formato MLX safetensors limita su uso a entornos compatibles con MLX (principalmente Apple Silicon), aunque la existencia de una versión GGUF en Ollama amplía las opciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/ov_intent_analysis_sft-oQ8e
- Modelo base (guoxuter/ov_intent_analysis_sft): https://huggingface.co/guoxuter/ov_intent_analysis_sft
- Versión Ollama (v7_q8): https://ollama.com/guoxuter/ov_intent_analysis_sft:v7_q8
- Repositorio de OpenViking en GitHub: https://github.com/volcengine/OpenViking
- Prompt v7 para el modelo: https://github.com/volcengine/OpenViking/blob/main/openviking/prompts/templates/retrieval/ov_intent_analysis_sft_v7.yaml
- Documentación de configuración de OpenViking: https://docs.openviking.ai/en/guides/01-configuration
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
