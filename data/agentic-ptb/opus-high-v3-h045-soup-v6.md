# agentic-ptb/opus-high-v3.h045.soup-v6

## Resumen
Este modelo es un checkpoint intermedio del proyecto AgentPTB, concretamente del run **opus-high-v3** en su hora 45 (`h045`). Fue generado por un proceso automatizado que utiliza Claude Code de Anthropic para orquestar experimentos de fine-tuning sobre el modelo base Qwen/Qwen3.5-9B-Base. Su propósito declarado es la reproducibilidad y el estudio cualitativo de dinámicas de entrenamiento, no servir como modelo final de producción.

El propio autor advierte explícitamente en la model card que el run **no encontró mejora alguna en los pesos entrenados** y que no se debe inferir calidad a partir de su publicación. Se trata de un artefacto de investigación retenido para auditoría y análisis, con cero descargas y cero likes en el momento de su publicación. Con 9.409.813.744 parámetros (~9,4B), el checkpoint está disponible en formato safetensors bajo licencia Apache 2.0.

Relevante para la comunidad de desarrolladores e investigadores porque documenta un resultado negativo en un pipeline de entrenamiento automático, lo que puede servir para entender qué configuraciones no funcionan y cómo se estructuran los experimentos de AgentPTB.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base; detalles de la arquitectura no publicados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio con pesos en safetensors; 18,8 GB para 9,4B sugiere precisión fp16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un checkpoint intermedio generado dentro del pipeline **AgentPTB** (run `opus-high-v3`), que emplea Claude Code para ejecutar experimentos de fine-tuning de forma autónoma. El run alcanzó la hora 45 (`h045`) y produjo este artefacto en la ruta `scratch/agent/soup-v6`. El proceso de entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el modelo base Qwen3.5-9B-Base, pero el resultado final fue que **no se observó ninguna mejora en los pesos** respecto al modelo base.

No se ha publicado información sobre el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas en el entrenamiento. El run `opus-high-v2` (un rerun anterior) fue abortado y declarado no válido, ya que dejó de producir checkpoints alrededor de la hora 12 y envió los tensores del modelo base sin cambios tras cinco regresiones en sus runs SFT. Este contexto sugiere que el proyecto documenta tanto éxitos como fracasos, y este checkpoint pertenece a la categoría de resultados negativos.

## Capacidades
No se han publicado evaluaciones de capacidades para este checkpoint específico. Al ser un derivado de Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo base (generación de texto, razonamiento, código, etc.), pero no existe documentación que confirme el rendimiento real de este artefacto. La model card advierte explícitamente que no se debe inferir calidad de su publicación.

Dado que el run no produjo mejoras, es probable que el comportamiento sea idéntico o incluso ligeramente inferior al del modelo base. No hay información sobre tool calling, soporte de agentes, capacidades multilingües o modos especiales de razonamiento.

## Casos de uso
- Reproducibilidad de experimentos: investigadores pueden descargar este checkpoint para reproducir exactamente el estado del run `opus-high-v3` en la hora 45 y verificar los resultados negativos reportados.
- Auditoría de pipelines de entrenamiento automático: sirve para inspeccionar qué pesos generó el proceso en un punto intermedio y compararlos con el modelo base, ayudando a diagnosticar por qué el fine-tuning no convergió.
- Estudio de dinámicas de entrenamiento: permite analizar cómo evolucionan los tensores a lo largo de las horas de un run y qué patrones aparecen cuando el entrenamiento no mejora.
- Comparación de checkpoints intermedios: el dataset asociado `agentic-ptb/opus-high-v3-data` contiene el archivo del run, lo que permite comparar este checkpoint con otros de la misma serie para entender la trayectoria del entrenamiento.
- Investigación sobre resultados negativos: útil para estudiar configuraciones de SFT que fallan, contribuyendo a la literatura sobre qué no funciona en fine-tuning de modelos de 9B.
- Desarrollo de herramientas de monitoreo: los datos de este run pueden usarse para entrenar clasificadores que detecten estancamiento o regresión en experimentos de entrenamiento automático.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) y el autor no reporta comparaciones con otros modelos.

## Requisitos de hardware
No hay datos oficiales de requisitos de hardware para este checkpoint. Las siguientes son estimaciones generales para un modelo denso de ~9,4B parámetros:

- VRAM estimada para inferencia en fp16: ~19 GB (el tamaño del repositorio es de 18,8 GB, consistente con pesos fp16).
- VRAM estimada con cuantización int8: ~10 GB.
- VRAM estimada con cuantización int4 (GGUF): ~5-6 GB.
- GPUs recomendadas: para fp16, una NVIDIA RTX 4090 (24 GB) o A100 40 GB; para cuantización int4, una RTX 3090 o similar con 10-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierten los pesos a GGUF), TGI. No hay configuraciones probadas publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de comparaciones publicadas con otros modelos. El checkpoint no ha sido evaluado en ningún benchmark, y su naturaleza de artefacto intermedio sin mejoras lo hace difícil de comparar con modelos finales. La única referencia posible es el modelo base Qwen/Qwen3.5-9B-Base, pero no se han publicado métricas comparativas entre ambos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias
- El modelo card advierte explícitamente que el run no encontró mejora alguna en los pesos entrenados; no se debe inferir calidad de su publicación.
- Es un checkpoint intermedio, no un modelo final. No está diseñado para uso en producción ni para tareas reales.
- No hay información sobre sesgos, alucinación o limitaciones de contexto o idioma.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo no tiene valor práctico demostrado y su uso comercial carece de sentido.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- El run `opus-high-v2` asociado fue abortado y declarado no válido, lo que sugiere problemas recurrentes en el pipeline de entrenamiento.

## Enlaces
- Página del modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h045.soup-v6
- Dataset del run (archivo del experimento): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
