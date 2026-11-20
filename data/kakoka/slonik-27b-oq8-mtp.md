# kakoka/Slonik-27B-oQ8-mtp

## Resumen

Slonik-27B-oQ8-mtp es una cuantización de 8 bits del modelo Slonik 27B, un modelo de lenguaje especializado en código desarrollado por Postgres Professional y entrenado específicamente en tareas que implican modificar el código fuente de PostgreSQL. Esta versión concreta, publicada por el usuario kakoka, está empaquetada en formato MLX para su ejecución local en equipos Mac con Apple Silicon, lo que la convierte en una opción práctica para desarrolladores que trabajan en el ecosistema PostgreSQL desde un portátil o un Mac Studio.

El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y conserva los 15 tensores de pesos MTP (multi-token prediction) nativos del checkpoint original, lo que permite acelerar la decodificación mediante la función Lightning MTP de oMLX. La cuantización emplea cuantización afín de 8 bits con un tamaño de grupo de 64, manteniendo los tensores de coma flotante restantes en BF16 y ocupando 29,08 GB en disco en shards de safetensors.

La relevancia de esta ficha radica en que Slonik es uno de los pocos modelos abiertos orientados específicamente a un dominio técnico tan concreto como el código fuente de PostgreSQL (C, SQL, planes de consulta y pruebas de regresión), y esta cuantización lo hace accesible en hardware de consumo Apple con un rendimiento medido de 61,88 tokens/s en un Mac Studio M5 Ultra con 256 GiB de memoria unificada. La licencia Apache-2.0 facilita su uso comercial y su integración en herramientas internas de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base dglhf/Slonik; detalles de atención y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en perfil Chat; 65.536 tokens en perfil Research (contexto cargado en los perfiles de LM Studio) |
| Tipos de cuantizacion | oQ8 (8 bits afín, group size 64) en este repo; el autor publica tambien oQ6e y oQ4e |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los ejemplos y validaciones estan en ingles y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), con tokenizer y chat template incluidos |

## Arquitectura y entrenamiento

El modelo base Slonik 27B procede de Postgres Professional y está entrenado sobre tareas que implican cambiar el código fuente de PostgreSQL, lo que incluye trabajo con C, SQL, planes de consulta y pruebas de regresión del motor. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; la model card remite al paper de Slonik para esos detalles.

Esta cuantización concreta se generó con oMLX 0.7.4.dev1 en modo "Text Only" a partir del checkpoint BF16 ubicado en el directorio `27B/` del repo `dglhf/Slonik` (revisión `321d879c39a809057f324a8133c9484e4c192c06`). Se aplicó cuantización afín de 8 bits con grupo de 64, se conservaron en BF16 los tensores de coma flotante restantes y se preservaron los 15 tensores de pesos MTP nativos, lo que habilita la decodificación acelerada mediante Lightning MTP en oMLX. El modelo soporta un modo de razonamiento ("thinking") desactivado por defecto, activable mediante `enable_thinking=true` y un `reasoning_effort` explícito de `low`, `medium` o `xhigh`, que controla la instrucción del prompt.

## Capacidades

- Generación de texto y código especializado en el dominio PostgreSQL: parches en C, consultas SQL, planes de ejecución y pruebas de regresión.
- Razonamiento técnico con modo "thinking" opcional, controlable mediante `enable_thinking` y `reasoning_effort` (low, medium, xhigh).
- Predicción multi-token (MTP) nativa, aprovechable con Lightning MTP en oMLX para acelerar la decodificación.
- Soporte de conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Capacidad de generar parches completos y pruebas de regresión: en la validación del autor, produjo un parche en C para un bug del planificador de PostgreSQL 18.6 y una prueba de regresión asociada que pasaron 15 comprobaciones de resultados y planes y 231 pruebas de regresión del núcleo.
- Integración con agentes de código: validado con un agente de programación interno de Postgres Professional en tareas de sondeo de colas en PostgreSQL (72 comprobaciones con coincidencia de resultados SQL).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles; los materiales de validación están en inglés y ruso.
- Capacidades de visión o audio: no disponibles (cuantización "Text Only").

## Casos de uso

- Corrección de bugs en el código fuente de PostgreSQL: el modelo puede analizar un fallo del planificador o del ejecutor y proponer un parche en C junto con su prueba de regresión; la validación del autor demuestra este flujo con un bug deliberado en PostgreSQL 18.6 y un parche que superó 231 pruebas de regresión del núcleo.
- Asistencia en desarrollo de extensiones y herramientas PostgreSQL: útil para escribir SQL complejo, funciones en C para extensiones y scripts de migración, aprovechando el entrenamiento específico sobre el código del motor.
- Optimización y revisión de consultas: el modelo puede razonar sobre planes de ejecución y proponer reescrituras de SQL, con el modo Research (thinking con `xhigh` y 65.536 tokens de contexto) para consultas y esquemas extensos.
- Automatización de tareas de mantenimiento con agentes: integrado en un agente de código, puede generar y ejecutar sentencias SQL para tareas como el sondeo de colas, tal como se validó en las 72 comprobaciones del autor.
- Generación de pruebas de regresión: a partir de un cambio en el motor, el modelo produce archivos de salida esperada y casos de prueba que encajan con el formato de regresión de PostgreSQL.
- Desarrollo local en Mac sin GPU dedicada: al estar en formato MLX con cuantización de 8 bits (29,08 GB), permite trabajar con un modelo de 27B especializado en un Mac con Apple Silicon y memoria unificada suficiente, con 61,88 tokens/s de decodificación medidos en un Mac Studio M5 Ultra.
- Formación y documentación técnica interna: puede explicar fragmentos del código de PostgreSQL y generar documentación o guías de contribución para equipos que trabajan con el motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de rendimiento de inferencia y validaciones funcionales:

| Metrica | Valor |
|---|---|
| Decodificacion mediana (oQ8, Lightning MTP on) | 61,88 tok/s |
| Decodificacion mediana (oQ6e, Lightning MTP on) | 57,71 tok/s |
| Decodificacion mediana (oQ4e, Lightning MTP on) | 78,98 tok/s |
| Decodificacion mediana (oQ8, Lightning MTP off) | 27,92 tok/s |
| Hardware de medida | Mac Studio M5 Ultra, 256 GiB memoria unificada, oMLX |
| Configuracion de la prueba | 437 tokens de entrada, 256 generados, sin cache, thinking desactivado, prompt en ingles sobre PostgreSQL |
| Validacion funcional SQL | 72 comprobaciones con coincidencia del resultado `queued` (incluido orden de filas) en las tres cuantizaciones |
| Validacion de parche en C | 15 comprobaciones de resultados y planes, 231 pruebas de regresion del nucleo superadas |
| Validacion de API | 24 respuestas primarias y 2 comprobaciones de override de razonamiento; Chat genero 0 tokens de razonamiento, Research 83-212 |

## Requisitos de hardware

- VRAM/memoria unificada: la cuantización oQ8 ocupa 29,08 GB en disco y requiere al menos esa cantidad de memoria disponible; oQ6e ocupa 22,94 GB y oQ4e 16,60 GB.
- Hardware objetivo: equipos Mac con Apple Silicon y memoria unificada suficiente; el autor midió el rendimiento en un Mac Studio M5 Ultra con 256 GiB.
- GPU NVIDIA: no aplicable directamente, ya que el formato es MLX; para GPUs NVIDIA sería necesario convertir a otro formato (no disponible en este repo).
- Cabe en GPU de consumo: no disponible para CUDA; en Apple Silicon, los 29,08 GB de oQ8 exigen configuraciones de memoria unificada alta (Mac Studio o MacBook Pro con 36 GB o más, con margen para el sistema y el contexto).
- Opciones de despliegue: oMLX (recomendado por el autor, con Lightning MTP), LM Studio mediante los perfiles Slonik Chat y Slonik Research publicados en LM Studio Hub, y la propia librería MLX. vLLM, llama.cpp, Ollama y TGI no están indicados en la información proporcionada para este formato.
- Latencia y throughput: 61,88 tok/s de decodificación mediana con oQ8 y Lightning MTP activado; 27,92 tok/s con MTP desactivado; 78,98 tok/s con oQ4e y MTP activado (Mac Studio M5 Ultra).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Slonik-27B-oQ8-mtp (esta ficha) | 27,3 B | 32.768 / 65.536 tokens (perfiles) | Codigo fuente PostgreSQL | Apache-2.0 | MLX safetensors (oQ8) |
| Slonik 27B (base, dglhf/Slonik) | 27,3 B | no disponible | Codigo fuente PostgreSQL | Apache-2.0 | BF16 (safetensors) |
| Modelos de codigo generalistas de ~27B | no disponible | no disponible | Codigo general | variable | variable |

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para tareas sobre el código fuente de PostgreSQL; su rendimiento en programación general fuera de ese dominio no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Calidad desigual en respuestas técnicas: el propio autor señala que en la validación de API las respuestas del perfil Chat sobre índices GiST contenían una imprecisión técnica sobre indexación sin pérdida, y no se reclama calidad equivalente entre perfiles.
- Cobertura de validación limitada: las pruebas de contexto largo, cargas concurrentes y cargas PostgreSQL ejecutadas quedaron fuera de la serie de validación publicada, por lo que el comportamiento en producción con esas condiciones no está verificado.
- Modo de razonamiento: el valor `reasoning: low` no está soportado en la integración de LM Studio probada; solo `off/on` a nivel nativo y `low/medium/xhigh` vía argumentos de plantilla de chat en runtimes que los acepten.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar APIs, funciones o comportamientos de PostgreSQL inexistentes; los parches y SQL generados deben revisarse y probarse siempre antes de aplicarlos.
- Idiomas: no se declara una lista oficial de idiomas soportados; los materiales de validación están en inglés y ruso, y el comportamiento en castellano no está documentado.
- Formato propietario de Apple: al ser MLX, no es directamente desplegable en GPUs NVIDIA sin conversión; el ecosistema de herramientas compatible es más reducido.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse el archivo NOTICE y las licencias upstream incluidas en el repo.
- Fecha de creación del repo (2026-11-07) y revisión del checkpoint base: conviene fijar la revisión concreta al desplegar para garantizar reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp
- Modelo base: https://huggingface.co/dglhf/Slonik
- Checkpoint fuente (directorio 27B): https://huggingface.co/dglhf/Slonik/tree/321d879c39a809057f324a8133c9484e4c192c06/27B
- Paper de Slonik: https://huggingface.co/dglhf/Slonik/blob/main/Slonik.pdf
- Documentación de cuantización oQ de oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Resultados de validación de API: https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp/blob/8f52bf7763d211322d1b622eb2dc25d11717ef85/API-VALIDATION.md
- Perfiles de runtime y ejemplos de API: https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp/blob/8f52bf7763d211322d1b622eb2dc25d11717ef85/RUNTIME-PROFILES.md
- Benchmarks y resultados SQL: https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp/blob/8f52bf7763d211322d1b622eb2dc25d11717ef85/BENCHMARK.md
- Artículo sobre la corrección del bug en C (inglés): https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp/blob/8f52bf7763d211322d1b622eb2dc25d11717ef85/ARTICLE.md
- Artículo en ruso: https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp/blob/8f52bf7763d211322d1b622eb2dc25d11717ef85/ARTICLE.ru.md
- Parche en C del ejemplo: https://github.com/pkonotopov/slonik-llm-tests/blob/a7092b5ba81bc9767906599ac459aaf4b81061e5/patches/oq8.patch
- Perfil Slonik Chat en LM Studio Hub: https://lmstudio.ai/kakoka/slonik-27b-chat
- Perfil Slonik Research en LM Studio Hub: https://lmstudio.ai/kakoka/slonik-27b-research
