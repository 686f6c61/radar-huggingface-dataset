# manuelgscom/askmdb-9b-GGUF

## Resumen

askmdb-9b es un ajuste fino mediante LoRA de Qwen/Qwen3.5-9B, fusionado en los pesos del modelo base, especializado en la traducción de lenguaje natural a consultas MongoDB. Convierte una pregunta en castellano o inglés sobre una base de datos MongoDB en un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON compacto junto con una explicación breve. El modelo lee en el prompt una descripción compacta del esquema de la base de datos, lo que le permite operar sobre bases que nunca ha visto durante el entrenamiento.

Desarrollado por Manuel García Sanz, el modelo forma parte de la familia askmdb, que incluye cuatro tamaños (0,8B, 2B, 4B y 9B) entrenados con los mismos datos, contrato y prompt. Esta variante de 9B es la de mayor precisión de la familia y está pensada para ejecutarse en GPU a través de la CLI askmdb (con Vulkan) o mediante `llama-server` en cualquier otra aplicación.

Su relevancia radica en que ofrece una precisión del 91,6 % en el test público de 500 casos puntuado por ejecución, frente al 47,8 % del modelo base sin ajustar, en un formato GGUF Q4_K_M de 5,6 GB que cabe en GPU de consumo con al menos 8 GiB de VRAM libre. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B, ajuste LoRA fusionado) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (imatrix); el repo distribuye Q4_K_M |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA de Qwen/Qwen3.5-9B fusionado con los pesos del modelo base, por lo que conserva la arquitectura transformer del original con 8.953.803.264 parámetros. El ajuste se entrenó con los mismos datos y contrato que el resto de la familia askmdb (0,8B, 2B, 4B y 9B), lo que garantiza consistencia en el formato de salida y en el comportamiento entre tamaños. La tarea específica es la generación de un único pipeline de `aggregate` de solo lectura a partir de una pregunta en lenguaje natural y una descripción compacta del esquema.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo no decide la seguridad: dentro de la CLI askmdb un verificador determinista comprueba que solo se ejecutan pipelines de lectura, lo que sugiere que el entrenamiento se centró en la corrección funcional de la consulta más que en mecanismos internos de salvaguarda. La cuantización Q4_K_M emplea imatrix, una técnica de cuantización consciente de la importancia de los pesos.

## Capacidades

- Generación de pipelines de agregación MongoDB (`aggregate`) de solo lectura a partir de preguntas en lenguaje natural, en español e inglés.
- Salida estructurada como objeto JSON pequeño con la consulta y una explicación breve.
- Adaptación a esquemas de base de datos no vistos, gracias a la descripción compacta del esquema incluida en el prompt.
- Comprensión de preguntas multi-turno en el contexto de la CLI askmdb (conversacional según los tags del repo).
- Ejecución local mediante llama.cpp, con soporte de GPU a través de Vulkan y de CPU.
- Compatibilidad con `llama-server` para integración en aplicaciones de terceros.
- Capacidad multilingüe limitada a español e inglés.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de consulta para equipos de datos: un analista escribe en lenguaje natural qué quiere obtener de una colección MongoDB y el modelo genera el pipeline listo para revisar y ejecutar, reduciendo el tiempo de escritura de agregaciones complejas con `$lookup`, `$group` y `$match`.
- Herramienta CLI offline para entornos sin conectividad: la CLI askmdb ejecuta el modelo localmente con llama.cpp, de modo que las consultas y el esquema no salen de la máquina, adecuado para entornos con requisitos de confidencialidad.
- Integración en aplicaciones vía `llama-server`: cualquier aplicación interna puede enviar la pregunta y el esquema al endpoint compatible y recibir el JSON con el pipeline, sin depender de APIs externas.
- Generación de consultas de solo lectura para paneles de autoservicio: usuarios no técnicos formulan preguntas sobre métricas y el modelo produce la agregación que alimenta el panel, con el verificador determinista de la CLI filtrando operaciones de escritura.
- Aceleración de tareas de soporte y operaciones: consultas recurrentes sobre logs o colecciones de incidencias almacenadas en MongoDB, donde el modelo traduce la pregunta a un pipeline reproducible y explicable.
- Prototipado rápido sobre bases de datos nuevas: al leer el esquema en el prompt, el modelo permite explorar una base desconocida sin escribir código a mano, útil en fases de descubrimiento de datos.
- Docencia y formación: el par consulta-explicación que devuelve el modelo sirve para enseñar la sintaxis de agregación de MongoDB a partir de preguntas en lenguaje natural.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el test público `manuelgscom/askmdb-test` (500 casos, puntuado por ejecución). La métrica de accuracy no está verificada de forma independiente.

| Modelo | Accuracy (por ejecución) | Casos |
|---|---:|---:|
| askmdb-9b | 91,6 % | 458/500 |
| Qwen3.5-9B (sin ajustar) | 47,8 % | no disponible |
| Gemma 4 E4B-it (sin ajustar) | 45,4 % | no disponible |

Comparativa interna de la familia askmdb en Q4_K_M sobre el mismo test:

| Modelo | Base | GGUF (Q4_K_M) | Test |
|---|---|---:|---:|
| askmdb-0.8b | Qwen3.5-0.8B | 529,3 MB | 83,6 % |
| askmdb-2b | Qwen3.5-2B | 1.274,4 MB | 86,8 % |
| askmdb-4b | Qwen3.5-4B | 2.708,8 MB | 89,6 % |
| askmdb-9b | Qwen3.5-9B | 5.629,1 MB | 91,6 % |

Rendimiento en la CLI askmdb (GPU con Vulkan): 1,85 s por pregunta en caliente y 5,5 GiB de VRAM.

## Requisitos de hardware

- VRAM estimada: 5,5 GiB en la CLI askmdb con la cuantización Q4_K_M; la CLI exige al menos 8 GiB de VRAM libre en una GPU dedicada para ofrecer esta variante.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU dedicada con al menos 8 GiB de VRAM libre. Cabe en GPU de consumo de gama alta con 8 GiB o más (por ejemplo, series RTX xx70/xx80 con 8-16 GiB), aunque el autor no enumera modelos.
- Cabe en GPU de consumo: sí, según el requisito de 8 GiB de VRAM libre indicado por el autor.
- Opciones de despliegue: llama.cpp (con backend Vulkan para GPU), `llama-server` para servir el modelo en otras aplicaciones, y la CLI askmdb como herramienta offline.
- Latencia y throughput: 1,85 s por pregunta en caliente en GPU con Vulkan según el autor; no se publican datos de throughput (tokens/s) ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test (por ejecución) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| askmdb-9b | 8,95B | no disponible | 91,6 % | Apache-2.0 | GGUF en Hugging Face |
| askmdb-4b | no disponible | no disponible | 89,6 % | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-9B (base) | 8,95B | no disponible | 47,8 % | no disponible en la información | Hugging Face |
| Gemma 4 E4B-it | no disponible | no disponible | 45,4 % | no disponible en la información | Hugging Face |

La comparación con Qwen3.5-9B y Gemma 4 E4B-it se refiere únicamente a la tarea text-to-query de MongoDB sin ajuste específico; no son alternativas especializadas equivalentes. No se dispone de datos de benchmarks generales (MMLU, HumanEval, GSM8K) para comparar capacidades fuera de esta tarea.

## Limitaciones y advertencias

- El modelo no decide la seguridad: fuera de la CLI askmdb no hay verificador determinista, por lo que debe revisarse siempre la consulta generada y conectarse con un usuario de solo lectura.
- Riesgo de alucinación en nombres de campos, colecciones u operadores del esquema; la precisión del 91,6 % implica que aproximadamente 1 de cada 12 consultas falla en el test público.
- Solo soporta español e inglés; no se documentan otros idiomas.
- La longitud de contexto no está disponible, lo que limita la planificación para esquemas de base de datos muy extensos.
- El modelo está especializado exclusivamente en la generación de pipelines MongoDB; no es un modelo de propósito general y su rendimiento en otras tareas no está caracterizado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B antes de un despliegue comercial.
- En la CLI askmdb, esta variante solo se ofrece si el usuario la elige y hay al menos 8 GiB de VRAM libre; en caso contrario se recurre a modelos menores de la familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de test: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Código fuente de la CLI askmdb: https://github.com/manuelgscom/askmdb
- Colección de la familia askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Sitio web del autor: https://manuelgs.com/en/askmdb/
- Variante 0.8B: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Variante 2B: https://huggingface.co/manuelgscom/askmdb-2b-GGUF
- Variante 4B: https://huggingface.co/manuelgscom/askmdb-4b-GGUF
