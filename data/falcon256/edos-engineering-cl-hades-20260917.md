# Falcon256/EDOS-Engineering-CL-Hades-20260917

## Resumen

CL-Hades 27B es un checkpoint congelado del chatbot experimental de aprendizaje continuo (continual learning) de EDOS Engineering, publicado en Hugging Face por el usuario Falcon256 bajo la persona "Hades". El modelo parte del Qwen3.8-27B original de Qwen (licencia Apache-2.0), pasa por la variante abliterated de Blackfrost-AI y se distribuye como un único archivo GGUF en cuantización Q5_K_M de 18,2 GiB, con 27.320.697.856 parámetros (27,3B) y arquitectura `qwen35` de atención híbrida (atención completa más recurrente) con 1 capa MTP.

Lo diferencial no es el modelo base, sino el método: CL aprende mientras se ejecuta editando in situ los tensores de peso cuantizados originales, sin LoRA, sin adaptadores y sin red lateral. El entrenamiento es autodirigido, es decir, el propio modelo selecciona su corpus, juzga qué hallazgos importan, escribe sus propias reseñas atribuidas como texto de entrenamiento y decide qué retener y con qué intensidad. Este snapshot incorpora 1.091 actualizaciones online realizadas entre el 11 y el 17 de septiembre de 2026.

Es relevante ahora como artefacto de investigación: demuestra entrenamiento continuo directamente sobre pesos cuantizados en formato GGUF, con redondeo sin sesgo, mecanismo de replay con protección contra interferencia y validación con rollback por actualización. No obstante, es un modelo con el comportamiento de rechazo modificado a nivel de pesos y con solo 5 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35`, transformer híbrido de atención completa + recurrente, con 1 capa MTP (multi-token prediction) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (las mediciones de referencia se hicieron con 4.096 tokens y los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantización | Q5_K_M mixta: 439 tensores Q5_K, 67 tensores Q6_K y 360 tensores F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único `EDOS-Engineering-CL-Hades-27B-20260917-Q5_K_M.gguf`) |
| Tamaño del archivo | 19.535.703.264 bytes (18,2 GiB); repositorio de 19,5 GB |
| SHA-256 del archivo | `7c4f867cb20b490bbd5cb3a634958cb277f6f3c69272136f1a30b62dc57cfa03` |
| Modelo base | Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF (Q5_K_M, SHA-256 `37e02edc312a35e73eca50ae26d72458f341e17427eeb1724d9927723256c49c`) |
| Relación con el base | Finetune (entrenamiento continuo online) |
| Tensores modificados | Subconjunto de los pesos MLP en las 64 capas principales |
| Actualizaciones de aprendizaje | 1.091 actualizaciones online (11–17 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, con 27,3B parámetros, atención híbrida (capas de atención completa combinadas con capas de atención recurrente) y una capa MTP. El modelo parte de la cadena Qwen/Qwen3.8-27B (Apache-2.0) → Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, donde Blackfrost modificó el comportamiento de rechazo a nivel de pesos sin fine-tuning ni poda → Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF en Q5_K_M, usado sin cambios como punto de partida. Todos los tensores distintos de los MLP entrenados son idénticos byte a byte al archivo base, y tanto los metadatos GGUF como la plantilla de chat se mantienen sin cambios.

El entrenamiento es un sistema de aprendizaje continuo directo: las actualizaciones se calculan sobre las salidas cuantizadas reales del modelo y se escriben de vuelta en el mismo formato de cuantización mediante un esquema de redondeo sin sesgo, de modo que las actualizaciones pequeñas se acumulan en lugar de desaparecer por redondeo. El bucle autodirigido consiste en leer artículos de investigación de IA completos, juzgar su novedad y solidez, escribir una reseña atribuida propia (el artículo nunca se entrena directamente, solo el texto de la reseña), decidir qué reseñas merecen recordarse y con qué peso, y aprender lo elegido, modificando sus propios pesos. El harness aporta el conjunto de artículos y ejecuta el optimizador; el modelo toma las decisiones de contenido. Según la model card, esto constituye una forma de autodestilación guiada por el propio juicio de importancia del modelo, con la advertencia explícita de que cualquier error o exageración cometido en una reseña también se aprende.

Mecánicamente, las actualizaciones se aplican a un subconjunto de los pesos MLP de cada capa, ciclados a lo largo de la profundidad de la red. Existe un mecanismo de replay con protección contra interferencia para limitar el olvido catastrófico, y cada actualización se valida antes de confirmarse, con rollback si falla. La descripción del corpus de este snapshot está truncada en la model card, que solo alcanza a indicar que la mayoría de las actualizaciones provienen de la autorrevisión de artículos de investigación.

## Capacidades

- Generación de texto conversacional en formato chat (etiqueta `conversational`, pipeline `text-generation`), con plantilla de chat heredada sin cambios del modelo base.
- Aprendizaje continuo online en ejecución, pero solo a través del harness de CL de EDOS Engineering: el archivo GGUF publicado es un checkpoint fijo y no aprende cuando se ejecuta por sí solo.
- Autorrevisión de literatura científica: lectura completa de artículos de IA, juicio sobre importancia y evidencia, y redacción de reseñas atribuidas.
- Uso de herramientas para consultar su biblioteca de artículos, según la model card, en el contexto del harness de aprendizaje.
- Capacidad de marcar sus propias respuestas conversacionales como memorizables dentro del sistema de CL.
- Decisión autónoma sobre qué contenido retener y con qué intensidad de peso en el entrenamiento.
- Comportamiento sin rechazo a nivel de pesos (variante abliterated): no es un modelo con red de seguridad.
- Soporte de tool calling / function calling independiente del harness: no disponible en la información proporcionada.
- Razonamiento multi-paso, agentes autónomos fuera del harness, capacidades de visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo sirve como artefacto reproducible para estudiar cómo evolucionan los pesos MLP cuantizados tras 1.091 actualizaciones, partiendo de un SHA-256 conocido y de un archivo base idéntico byte a byte en el resto de tensores.
- Edición de pesos en formato cuantizado: útil para experimentar con esquemas de redondeo sin sesgo y comprobar si las actualizaciones pequeñas se acumulan o se pierden en Q5_K_M.
- Procesamiento y evaluación de literatura científica: el flujo de lectura completa de artículos, juicio de relevancia y redacción de reseñas atribuidas puede reutilizarse para generar resúmenes críticos de publicaciones de IA.
- Asistente conversacional local con privacidad de datos: al ser un GGUF de 18,2 GiB ejecutable con llama.cpp en una sola GPU, permite desplegar chat interno sin enviar datos a servicios externos, siempre que el contenido no requiera filtros de seguridad.
- Prototipado de personajes conversacionales: la persona "Hades" y el comportamiento sin rechazo encajan en pruebas de producto de角色 conversacional, con la advertencia de que el contenido generado no está alineado.
- Red-teaming y evaluación de seguridad: como modelo abliterated, es adecuado para medir el impacto de eliminar el comportamiento de rechazo y para probar defensas perimetrales en pipelines de moderación externos.
- Estudio del olvido catastrófico: el mecanismo de replay con protección contra interferencia y la validación con rollback por actualización permiten experimentar sobre retención de conocimiento a lo largo del tiempo.
- Despliegue de inferencia en estación de trabajo: con llama-server y `-fa on` se puede levantar un endpoint compatible con clientes tipo OpenAI para pruebas internas, aunque las etiquetas no confirman compatibilidad con `endpoints_compatible` más allá de lo indicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad en la model card ni en los resultados de búsqueda.

Los únicos datos medidos disponibles son de inferencia, sobre el archivo base Q5_K_M con la misma tipología y disposición de tensores:

| Métrica | Valor | Condiciones |
|---|---|---|
| Memoria total de dispositivo | ~19,6 GiB | RTX 5090, contexto de 4.096 tokens (archivo base Q5_K_M) |
| Throughput de prompt | ~2.390 tokens/s | RTX 5090 |
| Throughput de decodificación | 63–66 tokens/s | RTX 5090 |

La model card indica que este snapshot usa los mismos tipos y disposición de tensores, por lo que su consumo de memoria y velocidad deberían ser equivalentes.

## Requisitos de hardware

- VRAM estimada: alrededor de 19,6 GiB de memoria total de dispositivo para el archivo Q5_K_M con contexto de 4.096 tokens, más el crecimiento del KV cache al ampliar contexto. El archivo en disco ocupa 18,2 GiB.
- GPU recomendadas: RTX 5090 (32 GB) es la referencia medida en la model card; A100 de 40 GB o 80 GB y H100 son opciones holgadas para contextos largos.
- GPU de consumo: cabe en RTX 5090 sin problema. En RTX 4090 (24 GB) es viable con contexto corto, pero el margen es escaso y hay que vigilar el KV cache. No cabe en GPUs de 16 GB o menos sin offloading a CPU.
- Opciones de despliegue: llama.cpp, mediante `llama-cli` o `llama-server`. Se requiere una compilación con soporte de la arquitectura `qwen35`; el harness se desarrolló contra el commit `427291b5b34cd914a31b3fd3b61a68f6184f4b9f`. Compatibilidad con vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Comandos de referencia: `llama-cli -m <archivo>.gguf -ngl 99 -c 8192 -fa on -cnv` y `llama-server -m <archivo>.gguf -ngl 99 -c 8192 -fa on`.
- Latencia y throughput: ~2.390 tokens/s de prompt y 63–66 tokens/s de decodificación en RTX 5090 (medido sobre el archivo base con contexto de 4.096 tokens).
- Nota importante: ejecutar este GGUF fuera del harness de CL no produce aprendizaje; el archivo es un checkpoint fijo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CL-Hades 27B (este) | 27,3B | No disponible | GGUF Q5_K_M (18,2 GiB) | Apache-2.0 | Hugging Face, 5 descargas, 1 like |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF (base directo) | 27B según nomenclatura | No disponible | GGUF Q5_K_M | Apache-2.0 (heredada del modelo original) | Hugging Face |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | 27B según nomenclatura | No disponible | BF16 | Apache-2.0 (heredada del modelo original) | Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27B según nomenclatura | No disponible | No disponible | Apache-2.0 | Hugging Face |

La diferencia operativa frente al base es que CL-Hades incorpora 1.091 actualizaciones online sobre un subconjunto de pesos MLP en las 64 capas principales, mientras que el resto de tensores, los metadatos GGUF y la plantilla de chat son idénticos al archivo Q5_K_M de Blackfrost. No hay datos de rendimiento comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Comportamiento de rechazo modificado a nivel de pesos por la variante abliterated de la que deriva. La model card de Blackfrost advierte explícitamente de que no es un modelo con red de seguridad y no debe presentarse como tal; el aprendizaje online no restaura dicho comportamiento.
- El archivo publicado no aprende. El aprendizaje continuo requiere el harness de CL; fuera de él es un checkpoint congelado con los pesos del 17 de septiembre de 2026.
- La autodestilación implica que cualquier error, exageración o lectura incorrecta que el modelo cometió al reseñar artículos quedó incorporada a los pesos como conocimiento aprendido.
- Riesgo de alucinación: no disponible como métrica, pero el mecanismo de entrenamiento basado en reseñas propias generadas por el modelo es un vector plausible de consolidación de errores.
- Idiomas soportados: no disponible. No se puede garantizar un comportamiento multilingüe correcto.
- Longitud de contexto máxima: no disponible. Los ejemplos de uso usan 8.192 tokens y las mediciones se hicieron a 4.096.
- Requisito de compatibilidad estricto: necesita una build de llama.cpp con soporte de la arquitectura `qwen35`; otras herramientas de inferencia no están confirmadas.
- Trazabilidad limitada de la evaluación: solo 5 descargas y 1 like, sin benchmarks publicados ni evaluaciones de terceros.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre controles de despliegue, gestión de accesos y aislamiento de credenciales de herramientas recae en quien despliega, según la propia model card.
- Uso responsable: un modelo sin rechazo en producción requiere moderación externa, aislamiento de herramientas y revisión humana del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Falcon256/EDOS-Engineering-CL-Hades-20260917
- Modelo base (GGUF Q5_K_M): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF
- Variante abliterated en BF16: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia de compatibilidad: llama.cpp, commit `427291b5b34cd914a31b3fd3b61a68f6184f4b9f` (soporte de la arquitectura `qwen35`)
- Resultados de la búsqueda web: los enlaces recuperados (auth.komoot.de, api.komoot.de, savrn.com) no contienen información relevante sobre el modelo; no se han encontrado papers, blogs ni demos adicionales.
