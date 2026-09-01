# 0xSero/DeepSeek-V4-Flash-Spark-GGUF

## Resumen

DeepSeek-V4-Flash-Spark-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario 0xSero. El archivo resultante, de un solo fichero, aplica una poda REAP (pruning) sobre la línea Spark del modelo base y una asignación dinámica de cuantización Q3 por capa, lo que reduce el peso total a 82,4 GB para un modelo de aproximadamente 180 000 millones de parámetros. El objetivo es permitir la ejecución del modelo en hardware más modesto mediante cargadores compatibles con GGUF, principalmente llama.cpp y su servidor integrado.

La relevancia de esta publicación radica en que acerca un modelo de gran tamaño a entornos de inferencia local o de servidor sin necesidad de infraestructura de alta gama, manteniendo la licencia MIT heredada del modelo original. No se proporcionan en la información disponible detalles sobre la arquitectura interna del modelo base, su longitud de contexto, idiomas soportados ni resultados de benchmarks, por lo que esta ficha se limita a los datos verificables de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: deepseek-ai/DeepSeek-V4-Flash-0731) |
| Parametros totales | 180.433.133.911 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3-Dynamic REAP (asignacion dinamica por capa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo unico .gguf) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización derivada del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicado bajo licencia MIT. El proceso de transformación combina dos técnicas: una poda REAP (pruning) aplicada sobre la línea Spark del modelo base y una cuantización dinámica Q3 por capa, que asigna distinta precisión a cada capa según su sensibilidad. El resultado es un único archivo GGUF de 82,4 GB, listo para cargar con llama.cpp u otros runtimes compatibles.

No se dispone de información sobre los datos de entrenamiento del modelo original, el número de tokens utilizados, ni sobre posibles fases de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo base en la información proporcionada.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que el modelo está orientado a completar y generar texto.
- Uso conversacional: el repositorio incluye la etiqueta conversational, lo que indica aptitud para diálogos multi-turno.
- Compatibilidad con GGUF: puede cargarse con llama.cpp, llama-server y otros cargadores que soporten este formato.
- Despliegue en servidor: el README muestra un ejemplo de uso con `llama-server`, lo que permite servir el modelo vía API.
- Capacidades adicionales (tool calling, agentes, razonamiento multi-paso, visión, audio): no disponibles en la información publicada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de alta VRAM: el archivo GGUF de 82,4 GB puede cargarse en GPUs con 80 GB o más de memoria, como la A100 o la H100, usando llama.cpp para generación de texto sin depender de la nube.
- Servidor de generación de texto autocontenido: con `llama-server` se puede exponer una API compatible con OpenAI para integrar el modelo en aplicaciones internas, manteniendo los datos en infraestructura propia.
- Prototipado y evaluación de modelos de gran tamaño: al ser un único fichero GGUF, facilita la descarga y prueba rápida del modelo en entornos de desarrollo antes de decidir un despliegue mayor.
- Experimentación con cuantización y poda: el uso de REAP y Q3 dinámico permite estudiar el impacto de estas técnicas sobre un modelo de 180B, útil para investigación en compresión de modelos.
- Generación de texto en entornos con restricciones de licencia: al heredar la licencia MIT, puede usarse en proyectos comerciales sin las restricciones típicas de otras licencias de modelos.
- Despliegue en hardware unificado tipo DGX Spark: aunque el repositorio no lo documenta explícitamente, la línea Spark del modelo base está asociada a recetas de ejecución en DGX Spark (128 GiB de memoria unificada), por lo que este GGUF podría ser candidato para entornos similares con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otras pruebas estandar, y no se pueden inferir cifras fiables a partir de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 82,4 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos. A esto hay que sumar la memoria para la caché de contexto (KV cache), cuyo tamaño depende de la longitud de contexto configurada.
- GPU recomendadas: no se especifican en la documentación. Por el tamaño del archivo, son necesarias GPUs con 80 GB o más de VRAM (por ejemplo, NVIDIA A100 80GB, H100) o configuraciones multi-GPU. También podría ejecutarse en CPU con suficiente RAM, aunque con menor rendimiento.
- Compatibilidad con GPUs de consumo: no es viable en GPUs de consumo habituales (RTX 4090 con 24 GB, etc.) debido al tamaño del archivo, salvo que se use una cuantización más agresiva o se descarguen solo partes del modelo.
- Opciones de despliegue: llama.cpp, llama-server y cualquier runtime compatible con GGUF. El README muestra el comando `llama-server -m DeepSeek-V4-Flash-Spark-Q3-Dynamic-REAP-ds4.gguf`.
- Latencia y throughput: no disponibles en la información publicada para esta cuantización concreta.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. El modelo base DeepSeek-V4-Flash-0731 tiene otras cuantizaciones publicadas por el mismo autor, como la versión EXL3 (3.0 bpw) alojada en 0xSero/deepseek-v4-flash-0731-spark, que se sirve mediante el stack sparkinfer en un DGX Spark. Sin embargo, no se han publicado métricas comparativas entre ambas versiones ni frente a otros modelos de tamaño similar en la información disponible.

## Limitaciones y advertencias

- La cuantización Q3 implica una pérdida de precisión respecto al modelo original en FP16/BF16, que puede manifestarse en degradación de calidad en tareas complejas de razonamiento o generación de código.
- La poda REAP elimina parte de los parámetros del modelo, lo que puede afectar a capacidades específicas no documentadas en este repositorio.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No se han publicado benchmarks, por lo que no es posible validar el rendimiento real del modelo cuantizado frente a otras alternativas.
- La longitud de contexto no está documentada para esta cuantización; el repositorio GitHub asociado menciona recetas de 200K para el runtime Spark, pero no se confirma que este GGUF la soporte.
- Aunque la licencia MIT permite uso comercial, es responsabilidad del usuario revisar los términos del modelo base DeepSeek-V4-Flash-0731 para confirmar que no existen restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSero/DeepSeek-V4-Flash-Spark-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de la versión EXL3 del mismo autor: https://huggingface.co/0xSero/deepseek-v4-flash-0731-spark
- Repositorio de la versión 180B: https://huggingface.co/0xSero/DeepSeek-V4-Flash-180B
- GitHub del proyecto Spark: https://github.com/0xSero/deepseek-spark
- Launcher para DGX Spark (EXL3): https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-One-DGX-Spark
- Hilo del foro de NVIDIA sobre rendimiento en DGX Spark: https://forums.developer.nvidia.com/t/1x-spark-deepseek-v4-flash-0731-1-000-tok-s-prefill-59-tok-s-multi-agent-serving/378855
