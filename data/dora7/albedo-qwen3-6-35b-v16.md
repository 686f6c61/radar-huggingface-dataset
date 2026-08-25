# dora7/albedo-qwen3.6-35b-v16

## Resumen

`dora7/albedo-qwen3.6-35b-v16` es un modelo de lenguaje multimodal (imagen-texto) desarrollado por el usuario `dora7` como parte de una serie de fine-tunes sobre la base `dendriteholdings/albedo-qwen3.6-35b-king-genesis`. Este modelo base deriva de la familia Qwen3.6, concretamente de la variante 35B-A3B, una arquitectura MoE híbrida con Gated DeltaNet y activación dispersa de 3 mil millones de parámetros. El autor lo describe como un "challenger local" para el desafío Albedo SN97, con un proceso de entrenamiento que incluye SFT en varias versiones (v8–v11, v13/v15) y un ajuste final con DPO en v16 sobre prefijos de fallos en vivo (como `sed && echo` o `grep-is-not-work`).

El modelo está pensado para tareas de razonamiento, codificación y agentes, con soporte de entrada de imágenes (pipeline `image-text-to-text`). Su relevancia radica en ser un fine-tune especializado en corregir errores concretos de ejecución de comandos y en mejorar la robustez en entornos de agentes, aunque el autor advierte que para duelos de calidad es preferible la versión v11. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + sparse Mixture-of-Experts) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 3 B (estimado según base Qwen3.6 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin GGUF) |
| Idiomas soportados | no disponible (base Qwen3.6 soporta 201 idiomas, pero no confirmado para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda la de Qwen3.6 35B-A3B: un modelo causal de lenguaje con atención híbrida Gated DeltaNet y capas dispersas de mezcla de expertos (MoE). Esta combinación permite activar solo 3 mil millones de parámetros por token, reduciendo el coste computacional en inferencia respecto a un modelo denso del mismo tamaño total. El modelo base `albedo-qwen3.6-35b-king-genesis` ya incorpora esta arquitectura, y el fine-tune de `dora7` la mantiene.

El entrenamiento de esta versión v16 sigue una cadena: partiendo de `genesis`, se aplicaron SFT en versiones v8–v11, luego SFT encadenado en v13/v15, y finalmente un ajuste con DPO (Direct Preference Optimization) sobre prefijos de fallos en vivo. El autor menciona explícitamente que se trabajó sobre errores como "empty double-submit", `sed && echo` y "grep-is-not-work", lo que sugiere un enfoque en corregir comportamientos defectuosos en ejecución de comandos y flujos de agente. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multi-step, orientado a tareas de agente y codificación.
- Entrada multimodal: acepta imágenes además de texto (pipeline `image-text-to-text`), aunque no se detallan las capacidades específicas de visión.
- Soporte de tool calling y function calling, probablemente heredado de la base Qwen3.6, aunque no confirmado explícitamente.
- Capacidad de ejecutar comandos y depurar fallos en entornos tipo shell (por el entrenamiento en prefijos de error).
- Multilingüismo potencial: la base Qwen3.6 cubre 201 idiomas, pero no hay confirmación para este fine-tune.
- Modo de razonamiento extendido (thinking mode) no confirmado; el autor menciona "Policy one-turn eval 22/30", lo que sugiere evaluación en tareas de política de un turno.

## Casos de uso

- Agentes autónomos de terminal: el modelo está entrenado para reconocer y corregir errores comunes en comandos shell (como `sed && echo` o `grep`), por lo que puede integrarse en agentes que ejecutan tareas de administración de sistemas o automatización de DevOps.
- Asistente de depuración de código: dado su entrenamiento en fallos de ejecución, puede ayudar a identificar por qué un comando o script falla y sugerir correcciones, especialmente en pipelines de CI/CD.
- Generación de código con contexto visual: al aceptar imágenes, puede analizar capturas de pantalla de errores o diagramas y generar código o explicaciones basadas en ellos.
- Razonamiento multi-turno en entornos de chat técnico: su capacidad de mantener contexto y razonar sobre problemas complejos lo hace útil para foros de soporte o asistentes de documentación.
- Evaluación de políticas de agentes: el autor menciona una evaluación de "policy one-turn" (22/30), lo que sugiere uso en entornos donde se evalúa la corrección de decisiones de un solo paso, como en benchmarks de agentes.
- Fine-tuning adicional: al ser un modelo abierto con licencia Apache 2.0, puede servir como punto de partida para tareas específicas de razonamiento o codificación, aprovechando su especialización en errores de shell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una evaluación interna: "Policy one-turn eval 22/30", sin contexto sobre qué métrica o conjunto de datos se utilizó. No hay comparaciones con otros modelos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: con 34,66 B parámetros totales y pesos en safetensors (probablemente bf16), se necesitan aproximadamente 70 GB de VRAM para cargar el modelo completo sin cuantización. Con cuantización a 8 bits (~35 GB) o 4 bits (~18 GB) podría ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado archivos GGUF ni AWQ en el repositorio.
- GPU recomendadas: para inferencia sin cuantizar, A100 80GB, H100 80GB o A6000 48GB (con cuantización). Para uso en consumer, RTX 4090 o RTX 3090 con cuantización 4-bit.
- Opciones de despliegue: al ser un modelo de la familia Qwen3.6, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se publica una versión cuantizada). No se han encontrado archivos de despliegue específicos en el repositorio.
- Latencia y throughput: no disponibles. Al ser MoE con 3 B activos, la latencia por token debería ser significativamente menor que un modelo denso de 35 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| dora7/albedo-qwen3.6-35b-v16 | 34,66 B | ~3 B | no disponible | Apache 2.0 | Fine-tune especializado en errores de shell |
| Qwen3.6 35B-A3B (base) | ~35 B | 3 B | no disponible (probablemente 256K) | Apache 2.0 | Modelo base oficial, sin fine-tune |
| Qwen3.5 35B-A3B (si existe) | no disponible | no disponible | no disponible | no disponible | No se ha confirmado su existencia |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a la arquitectura y el origen del modelo. No hay información sobre otros fine-tunes similares de la serie Albedo (como `dora7/albedo-qwen3.6-35b-mount` o `pandora-box/albedo-qwen3.6-35b-a3s2d2f1`) más allá de su existencia.

## Limitaciones y advertencias

- El autor advierte explícitamente: "Do not use v17 (recat-overweight DPO regression)", lo que indica que versiones posteriores pueden tener regresiones. Esta v16 es la recomendada para uso local, pero se sugiere conservar v11 para duelos de calidad.
- La evaluación interna "Policy one-turn eval 22/30" sugiere que el modelo no es perfecto en tareas de política de un turno; un 73% de acierto puede no ser suficiente para entornos de producción críticos.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un fine-tune de Qwen3.6, podría heredar sesgos del modelo base, pero no hay confirmación.
- El modelo está etiquetado como `image-text-to-text`, pero no se especifican las capacidades reales de visión. Es posible que el fine-tune no haya sido entrenado específicamente para tareas visuales complejas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo experimental con poca validación comunitaria.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card, lo que dificulta su integración inmediata.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dora7/albedo-qwen3.6-35b-v16
- Modelo base: https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-genesis
- Guía de Qwen 3.6 (referencia de arquitectura): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Catálogo de Microsoft Foundry para Qwen3.6 35B A3B: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
- Página de Ollama para Qwen3.6 35B: https://ollama.com/library/qwen3.6:35b
