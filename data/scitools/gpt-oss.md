# SciTools/gpt-oss

## Resumen

SciTools/gpt-oss es una redistribución en formato GGUF de los pesos abiertos de openai/gpt-oss-20b, publicada por SciTools para alimentar las funciones de IA de su producto "Understand" (Project Chat, resumen de código), servidas localmente mediante ullama sobre llama.cpp. No es un modelo nuevo: es el mismo gpt-oss-20b de OpenAI, cuantizado a Q4_K_M por Unsloth y copiado sin modificaciones, con un único archivo de 11,6 GB.

El modelo subyacente es una arquitectura de mezcla de expertos (MoE) con unos 21.000 millones de parámetros totales (20.914.757.184 exactos según safetensors) y aproximadamente 3.600 millones de parámetros activos por token. Esa relación entre parámetros totales y activos es lo que permite que un modelo de ~21B quepa en un portátil de gama alta y responda con latencia de un modelo mucho menor.

La relevancia de esta ficha concreta es práctica: documenta una cuantización concreta (Q4_K_M de Unsloth, SHA-256 `c27536640e...`) con resultados medidos sobre hardware real (Apple M5 MacBook Pro) y una advertencia operativa clave: con el `reasoning_effort` por defecto (`medium`) el modelo agota el presupuesto de 4.096 tokens razonando y no devuelve respuesta; con `low` funciona correctamente. Los veredictos de evaluación no se trasladan entre cuantizaciones distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (aprox. 21B) |
| Parametros activos | Aprox. 3,6B por token |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF), cuantizado por Unsloth |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (sujeta a gpt-oss usage policy de OpenAI) |
| Formato de pesos | GGUF (`gpt-oss-20b-Q4_K_M.gguf`) |
| Tamano del repositorio | 11,6 GB |
| Modelo base | openai/gpt-oss-20b |
| Runtime probado | ullama (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 21B parámetros totales de los que se activan unos 3,6B por token. Esta configuración reduce el coste computacional por token sin reducir el conocimiento almacenado, lo que explica que un modelo de este tamaño funcione en un MacBook Pro con chip M5. El archivo distribuido aquí no introduce ningún cambio respecto al modelo base: es el resultado de aplicar cuantización Q4_K_M a los pesos de openai/gpt-oss-20b, con unos 11,6 GB de descarga total.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, número de tokens, composición, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni variantes de atención. El único ajuste de inferencia documentado es el `reasoning_effort`: con el valor `low` el modelo razona de forma contenida; con el valor por defecto (`medium`) 22 de 40 resúmenes de código consumieron los 4.096 tokens de presupuesto razonando y no entregaron salida. Las métricas reportadas corresponden a ese ajuste `low`.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat de producto.
- Razonamiento con modo de pensamiento explícito, ajustable mediante `reasoning_effort` (low, medium, default del modelo).
- Comprensión y resumen de código fuente: en las pruebas escribió los 40 resúmenes de código solicitados.
- Seguimiento de instrucciones: puntuación de 0,850 en el test "follows instructions" del banco Project Chat.
- Lectura de contexto antes de responder: puntuación de 0,807 en "reads before answering".
- Coincidencia de respuestas con código esperado: 0,663 en "answers match the code".
- Etiquetas `endpoints_compatible` y `conversational` indican compatibilidad con endpoints tipo OpenAI para chat.
- Capacidad de tool calling / function calling: no documentada explícitamente en esta model card, aunque forma parte de la familia gpt-oss.

## Casos de uso

- Resumen automático de código en IDE: el modelo generó los 40 resúmenes del banco de pruebas, con precisión 0,703 y recuerdo de hechos 0,500, lo que lo hace útil para descripciones rápidas de funciones y ficheros, no para documentación crítica.
- Asistente de chat local en herramientas de escritorio: integrado en Understand (Project Chat) para responder sobre un proyecto de código sin enviar datos a servicios externos.
- Despliegue en portátil sin GPU dedicada: los 11,6 GB de Q4_K_M y su bajo número de parámetros activos permiten ejecutarlo en un Apple M5 con latencia de 19 s de mediana.
- Responder preguntas sobre una base de código concreta: la puntuación de 0,807 en "reads before answering" indica que tiende a consultar el contexto proporcionado antes de responder, comportamiento deseable en tareas RAG.
- Generación de borradores y transformación de texto en pipelines locales con requisitos de privacidad: al ejecutarse con llama.cpp no requiere conectividad.
- Prototipado de agentes con razonamiento acotado: fijando `reasoning_effort: low`, el modelo produce respuestas dentro de un presupuesto de tokens controlado, adecuado para bucles de varios pasos.
- Evaluación comparativa de cuantizaciones: como el autor advierte que los veredictos no se trasladan entre cuantizaciones, sirve como referencia fija (con SHA-256 documentado) para reproducir experimentos.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre un Apple M5 MacBook Pro, con `reasoning_effort: low`, en el banco interno "Project Chat":

| Metrica | Resultado |
|---|---|
| Answers match the code | 0,663 |
| Reads before answering | 0,807 |
| Follows instructions | 0,850 |
| Latencia mediana | 19 s |
| Resumenes de codigo escritos | 40 de 40 |
| Precision en resumenes de codigo | 0,703 |
| Recuerdo de hechos en resumenes | 0,500 |

Comparativa cualitativa de la que informa el autor: entre los modelos cualificados de 4B parámetros o más, este fue el que respondió más rápido. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para esta cuantización concreta.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa 11,6 GB en disco; para inferencia conviene disponer de al menos 12-13 GB de memoria unificada o VRAM, con margen para el contexto.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5090) y en equipos Apple Silicon con memoria unificada de 16 GB o superior.
- Hardware probado por el autor: Apple M5 MacBook Pro, con latencia mediana de 19 s por respuesta en el banco Project Chat.
- GPU de datacenter: A100, H100 y similares soportan el modelo con holgura, aunque para una cuantización Q4_K_M de 21B resultan sobredimensionadas salvo por concurrencia.
- Opciones de despliegue: llama.cpp y sus envoltorios (ullama es el runtime con el que se validó). Otros runtimes GGUF son compatibles, pero el autor advierte que hay que configurar `reasoning_effort: low` de forma explícita, porque el valor por defecto (`medium`) provoca respuestas vacías al agotar el presupuesto de razonamiento.
- Throughput: no disponible en la información proporcionada más allá de la latencia mediana citada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| SciTools/gpt-oss (esta ficha) | 21B totales, ~3,6B activos | GGUF Q4_K_M | 11,6 GB | Apache 2.0 | Cuantizacion de Unsloth, validada en Apple M5 |
| openai/gpt-oss-20b | 21B totales, ~3,6B activos | safetensors (original) | No disponible | Apache 2.0 | Modelo base sin cuantizar |
| openai/gpt-oss-120b (SciTools/OnBoard) | 120B (aprox.) | GGUF | 63 GB en dos partes | Apache 2.0 | Version mayor, probada con `reasoning_effort` medium |
| unsloth/gpt-oss-20b-GGUF | 21B totales, ~3,6B activos | GGUF | No disponible | Apache 2.0 | Origen del archivo redistribuido aqui |

Comparativas cuantitativas con modelos de otros desarrolladores: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sensibilidad al `reasoning_effort`: con el valor por defecto (`medium`), 22 de 40 tareas de resumen agotaron los 4.096 tokens razonando y no devolvieron salida. Es obligatorio fijar `low` en el runtime.
- Los veredictos de evaluación no se trasladan entre cuantizaciones: los resultados solo son válidos para el archivo exacto distribuido aquí (SHA-256 `c27536640e410032865dc68781d80a08b98f8db5e93575919af8ccc0568aeb4f`).
- Recuerdo de hechos bajo: 0,500 en la tarea de resumen de código, lo que implica riesgo de omitir o distorsionar detalles concretos.
- Precisión moderada en resumen de código (0,703): no apto para documentación que requiera exactitud verificable sin revisión humana.
- Riesgo de alucinación: no cuantificado en la información disponible; como cualquier modelo generativo, puede inventar contenido cuando no tiene el contexto adecuado.
- Idiomas soportados: no especificados; no hay garantía documentada de rendimiento en castellano.
- Longitud de contexto: no documentada en esta model card, por lo que no puede planificarse su uso en contextos largos sin verificarla.
- Licencia: Apache 2.0, pero sujeta a la gpt-oss usage policy de OpenAI; conviene revisarla antes de uso comercial o de redistribución.
- Este repositorio no está respaldado por OpenAI: es una redistribución de terceros.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SciTools/gpt-oss
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Política de uso de gpt-oss: https://huggingface.co/openai/gpt-oss-20b/blob/main/USAGE_POLICY
- Cuantización de origen: https://huggingface.co/unsloth/gpt-oss-20b-GGUF
- Versión 120b (SciTools/OnBoard): https://huggingface.co/SciTools/OnBoard
- Anuncio de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Blog de Hugging Face: https://huggingface.co/blog/welcome-openai-gpt-oss
- Paquete PyPI: https://pypi.org/project/gpt-oss/
- Playground: https://gpt-oss.com/
- Guía de terceros: https://axis-intelligence.com/how-to-run-chatgpt-offline-for-free-gpt-oss/
