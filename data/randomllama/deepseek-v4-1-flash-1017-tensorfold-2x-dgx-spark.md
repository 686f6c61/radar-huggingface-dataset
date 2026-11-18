# randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark

## Resumen

DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark es una receta de despliegue (no un modelo entrenado desde cero) publicada por el usuario randomllama sobre el checkpoint base deepseek-ai/DeepSeek-V4.1-Flash-1017. El repositorio documenta cómo ejecutar ese modelo en dos nodos NVIDIA DGX Spark con el motor TensorFold, cuantización EXL3 EAQ v1 a 2,9 bits por peso y claves abliteradas compatibles, empleando paralelismo tensorial entre ambos nodos. El objetivo es servir ocho carriles concurrentes con hasta 524.288 tokens de contexto por petición y 32.768 tokens de salida.

La relevancia del artefacto es operativa: no aporta pesos nuevos, sino una configuración reproducible con parches de planificación (admisión de peticiones cortas durante el prefill de prompts largos), gestión de una reserva compartida de 786.432 posiciones KV y un banco de pruebas propio (SparkDash) con métricas de latencia, reutilización de caché y recuperación en contextos de 128K. El repositorio pesa 0,0 GB porque los pesos, las claves y los kernels se alojan en los repositorios de sus respectivos publicadores.

La información disponible no incluye la arquitectura interna del modelo base, el número de parámetros ni los datos de entrenamiento; esta ficha se limita a lo documentado en la model card y en los enlaces citados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017; la receta emplea TensorFold con paralelismo tensorial en 2 nodos) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 524.288 tokens por petición; reserva KV compartida de 786.432 posiciones entre 8 carriles |
| Tokens de salida máximos | 32.768 |
| Tipos de cuantización | EXL3 EAQ v1 a 2,9 bits por peso (checkpoint de Mia's AI Lab) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | EXL3 (checkpoint cuantizado); pesos alojados en Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw |
| Hardware objetivo | 2 x NVIDIA DGX Spark (GB10, SM121) |
| Motor de inferencia | TensorFold (repositorio beastllama/deepseek-spark-recipe) |
| Paralelismo | tensor parallelism entre 2 nodos; Engram local en cada nodo |
| Claves | drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated (abliteradas, compatibles) |
| Streaming | heartbeat de 25 s |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

Este repositorio no documenta el entrenamiento del modelo base: no se indican número de tokens, composición del dataset ni etapas de RLHF o DPO. Lo que describe es la pila de inferencia. El checkpoint DeepSeek-V4.1-Flash-1017 se cuantiza a 2,9 bits por peso con el formato EXL3 y la variante EAQ v1 de Mia's AI Lab, y se ejecuta con TensorFold repartiendo capas entre dos DGX Spark mediante paralelismo tensorial. Cada nodo mantiene Engram local, y las claves abliteradas de drowzeys sustituyen a las originales para el checkpoint cuantizado.

La innovación principal de la receta es la gestión de la caché KV: una reserva compartida de 786.432 posiciones se reparte entre ocho carriles, con 524.288 tokens de contexto por petición. Sobre esa base se aplica un parche de planificación de admisión acotada que permite colar una petición corta durante el rendimiento (yield) del prefill de un prompt largo, siempre que su reserva completa quepa. También se documenta la preservación de prefijos completos para reutilizar historiales largos cuando las filas KV de trabajo se sobrescriben, y una política de retención que protege instantáneas cortas reutilizadas recientemente frente a instantáneas más antiguas y profundas bajo presión de caché.

## Capacidades

- Generación de texto en inglés con ventanas de contexto de hasta 524.288 tokens por petición.
- Recuperación en contexto largo: la model card cita pruebas de recall a 128K y un control de calidad nativa a 32K con recuperación de 16/16 claves y cero valores obsoletos.
- Uso de herramientas (tool use): el showcase incluye dos casos de tool-use medidos.
- Concurrencia multiusuario: ocho carriles de decodificación simultáneos sobre la misma reserva KV.
- Reutilización de caché de prefijo: reutilización de 75.776 de 76.048 tokens de entrada en una repetición corta, con 473 ms hasta el primer token en la interfaz.
- Streaming con heartbeat de 25 s para mantener viva la conexión en generaciones largas.
- Capacidades multimodales, de audio, visión o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos largos: con 524.288 tokens de contexto por petición, el modelo puede ingerir contratos, informes o bases de código completas en una sola llamada sin troceado, y la preservación de prefijos permite repetir consultas sobre el mismo documento reutilizando la caché.
- Asistentes de código sobre repositorios: la reutilización de prefijos documentada (75.776 de 76.048 tokens) hace viable mantener un repositorio grande como contexto fijo y lanzar consultas sucesivas con latencia de primer token baja.
- Atención al cliente multi-turno: ocho carriles concurrentes sobre una reserva compartida de 786.432 posiciones permiten atender varias conversaciones largas en paralelo en un solo despliegue de dos nodos.
- Agentes con tool calling: los casos de tool-use del showcase SparkDash sirven de referencia para pipelines de agentes que encadenan llamadas a herramientas con contexto persistente entre pasos.
- Procesamiento por lotes con mezcla de peticiones cortas y largas: el parche de admisión acotada reduce la latencia en cola de peticiones cortas (1,96 s frente a 10,52 s en la prueba del 17 de noviembre) cuando llegan junto a un prefill largo, útil en colas mixtas de producción.
- Evaluación y benchmarking de hardware: la receta incluye protocolos reproducibles (KV-POOL-786432.md, ADMISSION-BENCHMARK.md, SHOWCASE.md) para medir latencia, reutilización de caché y rendimiento en DGX Spark antes de comprometer un despliegue.

## Benchmarks y rendimiento

Los datos publicados son mediciones de la receta de despliegue, no benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K no están disponibles).

| Prueba (fecha) | Configuración | Resultado |
|---|---|---|
| Planificación de petición corta (17 nov) | Petición fría de 61 tokens, 8 carriles, reserva de 786.432 posiciones | 1,96 s en cola frente a 10,52 s; secuencia de salida idéntica; oleada de 5 trabajos en 34,81 s frente a 41,32 s, con 17% menos tokens de salida |
| Perfil de producción (17 nov) | Reserva de 786.432 posiciones frente a 655.360 | Oleada de 5 peticiones SparkDash en 37,86 s frente a 41,02 s; la petición corta esperó más y aumentaron las pausas de streaming |
| Admisión (15 nov) | Reserva mayor: 4 peticiones largas admitidas frente a 3 | Oleada en 33,53 s frente a 42,44 s; salidas variables y más pausas de streaming |
| Retención de instantáneas (v0.3.0, 8 nov) | 10 peticiones de retención | 10/10 recuperadas correctamente; repetición corta con reutilización de 75.776/76.048 tokens y 473 ms hasta el primer token |
| Prefijo completo (v0.2, 8 nov) | 3 flujos con 170K de contexto | Oleada de seguimiento de 168,110 s a 6,747 s; trabajo completo un 40,06% más rápido; prefill en frío sin cambios apreciables |

## Requisitos de hardware

- Dos nodos NVIDIA DGX Spark (GB10, SM121) con Engram local en cada nodo; es el único hardware documentado en la receta.
- Cuantización EXL3 EAQ v1 a 2,9 bits por peso para reducir la huella del checkpoint; el tamaño exacto del checkpoint no está disponible en la información proporcionada.
- Memoria KV: reserva compartida de 786.432 posiciones entre los dos nodos, con 524.288 tokens de contexto por petición.
- Motor: TensorFold, con el parche de planificación de admisión acotada y la política de retención de instantáneas de la versión v0.3.0.
- Despliegue en GPU de consumo (RTX 4090, etc.): no disponible; la receta está diseñada para el clúster de dos DGX Spark.
- vLLM, llama.cpp, Ollama o TGI: no documentados para esta receta.
- Latencia y throughput: 473 ms hasta el primer token en la repetición corta con caché caliente; oleadas de cinco peticiones en torno a 34-42 s según configuración. No hay cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos, y el objeto del repositorio es una receta de despliegue sobre un checkpoint concreto, no un modelo con alternativas equivalentes documentadas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: el tamaño de 0,0 GB indica que los artefactos (checkpoint EXL3, claves abliteradas, kernels) se descargan de los repositorios de Mia's AI Lab, drowzeys y otros publicadores, cada uno con sus propios términos.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- Las claves abliteradas modifican el comportamiento del modelo respecto al checkpoint original; los efectos sobre calidad y seguridad no están cuantificados en la información disponible.
- Las mediciones publicadas son de latencia y reutilización de caché, no de calidad de respuesta; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar el rendimiento cognitivo.
- El autor advierte de compromisos: en el perfil de 786.432 posiciones la petición corta espera más y aumentan las pausas de streaming; en la prueba de admisión las salidas fueron variables.
- La receta está acoplada a hardware DGX Spark (GB10, SM121) y al motor TensorFold; su portabilidad a otras GPU no está documentada.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Licencia apache-2.0 declarada en el repositorio, pero los pesos y claves descargados conservan los términos de sus publicadores; conviene revisar LICENSES antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pesos EXL3 EAQ v1 (2,9 bpp): https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Claves abliteradas: https://huggingface.co/drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated
- Fuente canónica en GitHub: https://github.com/beastllama/deepseek-spark-recipe/tree/5903947e2d0b3b0b0731be1aed38c4ec4339bd0e
- Configuración de reserva KV compartida: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/KV-POOL-786432.md
- Parche de admisión de peticiones cortas: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/BOUNDED-SHORT-ADMISSION.md
- Showcase SparkDash: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/SHOWCASE.md
- Benchmark de admisión: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/ADMISSION-BENCHMARK.md
- Resultados v0.2: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/RESULTS.md
- Resultados de retención (JSON): https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/data/recency-results.json
- Identidad de artefactos (JSON): https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/data/build-identity.json
- Estado de reproducción: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/REPRODUCTION-STATUS.md
- Créditos: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/blob/main/CREDITS.md
- Avisos de licencias upstream: https://huggingface.co/randomllama/DeepSeek-V4.1-Flash-1017-TensorFold-2x-DGX-Spark/tree/main/LICENSES
