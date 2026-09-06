# NiuNiu0110/rst-qwen3.5-9b-tmax-sft

## Resumen

El modelo `rst-qwen3.5-9b-tmax-sft` es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B`, desarrollado por NiuNiu0110. Ha sido entrenado sobre el dataset `NiuNiu0110/TMax-Agent-SFT-terminus`, compuesto por trayectorias de agente terminal de AI2 TMax, en el contexto del pipeline RST-Train ("Recursive Synthesis for Long-Horizon Terminal Tasks") alojado en `k1ssloo/RST-Train`.

Con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) y una arquitectura `Qwen3_5ForConditionalGeneration`, el modelo está diseñado para tareas de agente en entornos de terminal, aceptando entradas de imagen y texto (pipeline `image-text-to-text`). La longitud de contexto no se especifica en la información disponible.

Su relevancia radica en ser un checkpoint de un run de entrenamiento específico que incorpora técnicas como pre-tokenización con máscara de pérdida horneada y verificación de la fusión de shards FSDP. Sin embargo, el autor advierte explícitamente que no se ha ejecutado ningún benchmark sobre estos pesos, por lo que se trata de un artefacto no probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (modelo multimodal imagen-texto a texto) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura del modelo es `Qwen3_5ForConditionalGeneration`, que hereda del modelo base `Qwen/Qwen3.5-9B`. Se trata de un modelo multimodal que procesa imágenes y texto, con una torre de visión de 333 tensores copiada literalmente del modelo base y un stack de texto que fue sometido a fine-tuning. Los pesos se distribuyen en 775 tensores en formato `bfloat16`, ocupando 18,0 GB.

El entrenamiento se realizó con `verl` + FSDP2 sobre un corpus pre-tokenizado. El dataset `TMax-Agent-SFT-terminus` contiene 5.645 trayectorias multi-turno de agente terminal (5.445 de entrenamiento y 200 de retención), con un bloque de razonamiento en cada turno de asistente, derivadas de `allenai/tmax-sft`. El pipeline RST-Train hornea la máscara de pérdida de Qwen3.5 directamente en los datos mediante `scripts/15_export_pretokenized.py`, en lugar de recalcularla por backend, ya que tokenizar por separado y concatenar no reproduce el render de conversación completo. La exportación del checkpoint utiliza `scripts/08_prepare_eval_ckpt.sh`, que fusiona los shards FSDP, reinserta la torre de visión desde el modelo base y verifica que los pesos de texto realmente se movieron, evitando fusiones silenciosas incompletas.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada y produce texto como salida (pipeline `image-text-to-text`).
- Razonamiento: el dataset de entrenamiento incluye un bloque de razonamiento en cada turno de asistente, lo que sugiere una capacidad de "thinking mode".
- Tareas de agente terminal: entrenado específicamente en trayectorias de agente de terminal de larga duración, lo que lo hace apto para tareas que requieren múltiples pasos y mantenimiento de contexto.
- Conversación multi-turno: el corpus consiste en trayectorias multi-turno, lo que habilita diálogos largos y coherentes en entornos de terminal.
- No se especifica soporte para tool calling o function calling en la información disponible.
- No se especifican idiomas soportados ni capacidades multilingües.

## Casos de uso

Estos casos de uso son potenciales, basados en el propósito declarado del modelo; no se han validado con benchmarks.

- Asistente de terminal para desarrolladores: el modelo puede recibir una captura de pantalla de un terminal o una descripción textual de un problema y generar los comandos necesarios para resolverlo. Su entrenamiento en trayectorias de agente terminal lo hace adecuado para interpretar salidas de comandos y proponer acciones.
- Automatización de operaciones de administración de sistemas: puede ejecutar secuencias de comandos en tareas de larga duración (long-horizon), manteniendo el contexto a lo largo de la sesión y razonando sobre los resultados parciales.
- Depuración de scripts y pipelines CI/CD: al analizar logs de errores o capturas de pantalla de consolas, el modelo puede identificar fallos y sugerir correcciones, aprovechando su capacidad de razonamiento paso a paso.
- Educación sobre línea de comandos: como asistente conversacional multimodal, puede explicar comandos, opciones y flujos de trabajo a estudiantes, apoyándose en imágenes de ejemplos de terminal.
- Agentes autónomos para tareas de infraestructura: integrado en frameworks de agentes, puede gestionar despliegues, revisar registros y ejecutar tareas de mantenimiento programadas, siempre que se supervise su salida.
- Soporte técnico remoto: puede analizar capturas de pantalla de errores enviadas por usuarios y guiarlos en la resolución mediante comandos, facilitando la asistencia en entornos de escritorio o servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la model card indica explícitamente que no se ha ejecutado ningún benchmark contra este checkpoint, y que el harness de evaluación existe en el repo pero no se ha ejecutado sobre estos pesos. Por tanto, no hay datos de rendimiento que citar.

## Requisitos de hardware

- VRAM estimada: los pesos en `bfloat16` ocupan 18,0 GB. Para cargar el modelo completo y realizar inferencia, se recomienda una GPU con al menos 24 GB de VRAM, considerando también la memoria para la cache de atención y los estados de activación.
- GPU recomendadas: RTX 4090 (24 GB), A100 40GB, A100 80GB, H100 o equivalentes con más de 20 GB.
- En GPUs de consumidor con 12-16 GB, no sería posible cargar los pesos en `bfloat16` sin cuantización. No se ofrecen pesos cuantizados en el repositorio.
- Despliegue: compatible con la librería `transformers` de Hugging Face, utilizando `AutoModelForImageTextToText` y `AutoProcessor`. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se especifica compatibilidad con vLLM, llama.cpp u otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría. El único punto de referencia conocido es el modelo base `Qwen/Qwen3.5-9B`, que comparte arquitectura y parámetros, pero no ha sido fine-tuned para tareas de agente terminal. No se conocen datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se han ejecutado benchmarks: el rendimiento real del modelo es desconocido. No debe utilizarse en producción sin una evaluación previa y exhaustiva.
- El corpus de entrenamiento es limitado: solo 5.645 trayectorias, lo que puede resultar insuficiente para generalizar a todos los entornos y tipos de terminal.
- La torre de visión se copió del modelo base sin entrenamiento adicional, lo que puede limitar su capacidad para interpretar imágenes específicas de terminales o interfaces no vistas durante el fine-tuning.
- Riesgo de alucinación: al generar comandos o interpretar salidas, el modelo puede producir respuestas plausibles pero incorrectas, especialmente en situaciones fuera de su distribución de entrenamiento.
- No se especifican idiomas soportados: el rendimiento en lenguas distintas a las del dataset es incierto.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo se distribuye como un artefacto de un run de entrenamiento sin garantías de calidad o seguridad.
- El autor advierte que es un checkpoint no probado ("untested artifact"), y que la exportación de pesos incluye una verificación de que el texto se movió, pero no de que el modelo sea funcionalmente correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NiuNiu0110/rst-qwen3.5-9b-tmax-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/TMax-Agent-SFT-terminus
- Repositorio del pipeline RST-Train: https://github.com/k1ssloo/RST-Train
