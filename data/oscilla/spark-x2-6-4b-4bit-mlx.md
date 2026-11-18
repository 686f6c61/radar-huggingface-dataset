# Oscilla/Spark-X2.6-4B-4bit-mlx

## Resumen

Spark-X2.6-4B-4bit-mlx es una redistribución de los pesos del modelo XHToken/Spark-X2.6-4B en formato MLX cuantizado a 4 bits, publicada por el usuario Oscilla. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de pesos orientada a la inferencia en hardware Apple Silicon mediante el framework MLX. El repositorio contiene únicamente los seis ficheros necesarios para un cargador on-device, lo que reduce el tamaño del artefacto a 2,3 GB.

El modelo base es un transformer de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones), lo que lo sitúa en la categoría de modelos pequeños/medianos aptos para ejecución local. La cuantización aplicada es afín de 4 bits con tamaño de grupo 64, manteniendo la puerta de atención head-wise en bf16 para preservar calidad en esa parte crítica de la arquitectura.

Su relevancia es práctica: permite ejecutar un modelo de 4B en equipos con memoria unificada limitada (MacBook con 8-16 GB) sin renunciar a la licencia Apache 2.0, que facilita el uso comercial. La información pública disponible sobre el modelo base es escasa; los detalles de entrenamiento, idiomas y benchmarks no están documentados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); cuantización MLX afín 4-bit, group size 64 |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afín (group size 64), puerta de atención head-wise en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 2,3 GB de repo |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base XHToken/Spark-X2.6-4B más allá de su naturaleza transformer y su recuento de parámetros (4.112.079.360). El identificador "spark2_5" en las etiquetas sugiere una familia o generación interna del autor original, pero no se documenta su composición. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica documentada en este repositorio es la conversión a MLX: cuantización afín de 4 bits con tamaño de grupo 64, preservando la puerta de atención head-wise en bf16. Los pesos se redistribuyen sin cambios desde la conversión comunitaria abenzerps/Spark-X2.6-4B-MLX-4bit, y el SHA-256 de model.safetensors coincide con el SHA256SUMS.txt de dicho repositorio, lo que garantiza integridad respecto al artefacto original.

## Capacidades

- Generación de texto: pipeline declarado como text-generation; el modelo es "text only" según la model card.
- Razonamiento y código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible; la model card indica explícitamente "text only".

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización 4-bit permiten cargar el modelo en Macs con memoria unificada de 8-16 GB, usando mlx-lm como runtime para generación de texto interactiva.
- Prototipado rápido en portátiles: con 2,3 GB de pesos, un desarrollador puede iterar sobre prompts y plantillas sin depender de GPU dedicada ni de servicios en la nube.
- Generación de texto en aplicaciones de escritorio: integrable en apps macOS nativas mediante MLX, útil para resúmenes, redacción asistida o chat offline.
- Entornos con requisitos de privacidad: al ejecutarse completamente on-device, es adecuado para procesar texto sensible sin enviar datos a servidores externos.
- Investigación y evaluación de cuantizaciones: sirve como referencia para comparar la calidad de la cuantización 4-bit MLX frente al modelo base en bf16.
- Base para ajuste fino ligero en local: al ser Apache 2.0 y de tamaño contenido, puede servir de punto de partida para LoRA/QLoRA en hardware de consumo, aunque no se documenta soporte oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 2,3 GB; con overhead de runtime MLX, se estima un consumo de memoria unificada en torno a 3-4 GB para contexto corto (estimación propia, no documentada por el autor).
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con memoria unificada; no es compatible de forma nativa con CUDA sin reconvertir los pesos.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 8 GB o más de memoria unificada; en GPUs NVIDIA requeriría conversión a otro formato (GGUF, AWQ, etc.), no incluida en este repo.
- Opciones de despliegue: mlx-lm (runtime nativo para MLX); para otros entornos habría que recurrir a conversiones del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-4bit-mlx (este) | 4,11B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B (base) | 4,11B | no disponible | safetensors | Apache 2.0 | Hugging Face |
| abenzerps/Spark-X2.6-4B-MLX-4bit | 4,11B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de modelos alternativos de otros autores en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es una redistribución de pesos, no un modelo entrenado por Oscilla; cualquier mérito o defecto del modelo base corresponde a XHToken.
- Solo texto: la model card indica explícitamente "text only"; no hay soporte de visión ni audio.
- Idiomas no documentados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación previa.
- Contexto no documentado: se desconoce la ventana máxima; planificar pruebas antes de usarlo en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos de alineación ni evaluaciones de seguridad publicadas.
- Dependencia de MLX: los pesos están en formato MLX y no son directamente utilizables en vLLM, TGI o llama.cpp sin conversión.
- Repositorio mínimo: solo incluye seis ficheros; no hay tokenizador alternativo, plantillas de chat ni documentación adicional más allá de la model card.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y citar adecuadamente a XHToken.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Oscilla/Spark-X2.6-4B-4bit-mlx
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Conversión comunitaria de referencia: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-4bit
- Framework MLX: https://github.com/ml-explore/mlx
- mlx-lm (runtime de inferencia): https://github.com/ml-explore/mlx-lm
