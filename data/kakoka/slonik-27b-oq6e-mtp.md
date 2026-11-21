# kakoka/Slonik-27B-oQ6e-mtp

## Resumen

Slonik-27B-oQ6e-mtp es una cuantización del checkpoint Slonik 27B, un modelo de lenguaje especializado en código desarrollado por Postgres Professional y entrenado en tareas que implican modificar el código fuente de PostgreSQL. Este repositorio concreto, publicado por el usuario kakoka, contiene la versión text-only cuantizada con oQ6e (base de 6 bits con precisión ampliada en tensores seleccionados) para ejecutarse localmente con MLX sobre Macs con Apple Silicon. El checkpoint de origen es la revisión BF16 del directorio `27B/` del modelo base `dglhf/Slonik`.

El modelo parte de una arquitectura transformer de 27.320.697.856 parámetros totales (unos 27,3 mil millones) y conserva los 15 tensores nativos MTP (multi-token prediction) del checkpoint original, lo que permite activar la decodificación especulativa "Lightning MTP" en oMLX. La cuantización oQ6e ocupa 22,94 GB en disco en shards safetensors y está pensada para equipos con memoria unificada amplia, no para GPUs de consumo convencionales.

Su relevancia actual radica en que es una de las pocas alternativas abiertas orientadas específicamente al dominio de PostgreSQL y a tareas de parcheo de código C en producción, con licencia Apache-2.0 y una validación empírica documentada: corrección de un bug del planificador de PostgreSQL 18.6 y ejecución de la suite de regresión del motor. No obstante, el alcance de la validación publicada es acotado (texto en inglés, sin cargas concurrentes ni contextos largos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos de capas y atención no disponibles); incluye 15 tensores nativos MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en perfil Chat; 65.536 tokens en perfil Research (contexto cargado, no necesariamente contexto nativo de entrenamiento) |
| Tipos de cuantizacion | oQ8 (29,08 GB), oQ6e (22,94 GB), oQ4e (16,60 GB); cuantización afín con grupo de tamaño 64 y calibración por matriz de importancia |
| Idiomas soportados | no disponible (la validación publicada se hizo con prompts en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards), librería MLX |

## Arquitectura y entrenamiento

El modelo base Slonik 27B es un transformer de aproximadamente 27,3 mil millones de parámetros entrenado por Postgres Professional sobre tareas que implican cambiar el código fuente de PostgreSQL. La información disponible no detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO; la model card enlaza un paper (`Slonik.pdf`) donde presumiblemente se documentan, pero su contenido no se ha proporcionado.

La innovación técnica destacable en esta derivada es la preservación de los 15 tensores MTP del checkpoint original, que habilitan decodificación multi-token (Lightning MTP) en oMLX. La cuantización se realizó con oMLX 0.7.4.dev1 en modo Text Only, manteniendo BF16 en los tensores de coma flotante restantes y aplicando una matriz de importancia para la calibración de oQe. El modo de razonamiento (thinking) está desactivado por defecto y se activa mediante `enable_thinking=true` junto con un `reasoning_effort` explícito (`low`, `medium` o `xhigh`).

## Capacidades

- Generación de texto y código, con especialización en el dominio de PostgreSQL: parcheo de código C, escritura de SQL, diagnóstico de planes de consulta y modificación del planificador.
- Razonamiento explícito opcional mediante modo thinking, con niveles de esfuerzo configurables (`low`, `medium`, `xhigh`). En las pruebas del autor, el perfil Chat generó cero tokens de razonamiento y el perfil Research entre 83 y 212.
- Decodificación especulativa multi-token (MTP) cuando se activa Lightning MTP en oMLX.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidad demostrada de generar parches en C que compilan y pasan la suite de regresión de PostgreSQL (231 tests core y 15 comprobaciones de resultados y planes en el caso documentado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües verificadas.

## Casos de uso

- Corrección de bugs en el código fuente de PostgreSQL: el modelo generó un parche en C para un fallo del planificador con pruning y `OR` que omitía una partición `DEFAULT`; el parche compiló y superó los 231 tests de regresión core, lo que lo hace adecuado para asistir en el ciclo de desarrollo del motor.
- Escritura y revisión de SQL complejo: en las pruebas internas de Postgres Professional, las tres cuantizaciones propuestas para una tarea de polling de cola coincidieron con el resultado `queued` original en 72 comprobaciones, incluyendo el orden de filas.
- Asistencia a desarrolladores de extensiones y forks de PostgreSQL: al estar entrenado sobre cambios reales del código fuente, puede orientar modificaciones en el planificador, el ejecutor y las pruebas de regresión.
- Análisis de planes de consulta y depuración de particionado: útil para diagnosticar por qué una consulta no usa una partición esperada o genera un plan subóptimo.
- Generación de pruebas de regresión: el modelo añadió dos consultas nuevas a la prueba de regresión de partition pruning en el caso documentado, lo que sugiere uso para ampliar coberturas de test.
- Despliegue local en estaciones de trabajo Apple Silicon: con 22,94 GB en oQ6e y 57,71 tok/s de decodificación mediana en un Mac Studio M5 Ultra con 256 GiB, encaja en flujos de trabajo de desarrollo sin depender de servicios en la nube.
- Modo Research para tareas de razonamiento profundo sobre código: con thinking activado y `xhigh`, contexto cargado de 65.536 tokens y entre 83 y 212 tokens de razonamiento, orientado a análisis que requieren deliberación explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son medidas de velocidad y validaciones funcionales del autor:

| Metrica | Valor |
|---|---|
| Decodificación mediana oQ8 con Lightning MTP | 61,88 tok/s |
| Decodificación mediana oQ6e con Lightning MTP | 57,71 tok/s |
| Decodificación mediana oQ4e con Lightning MTP | 78,98 tok/s |
| Decodificación mediana oQ8 sin Lightning MTP | 27,92 tok/s |
| Hardware de medida | Mac Studio M5 Ultra, 256 GiB de memoria unificada, oMLX |
| Condiciones | 437 tokens de entrada, 256 generados, 0 cacheados, thinking desactivado, mediana de tres ejecuciones calentadas |
| Validación SQL | 72 comprobaciones con coincidencia en resultado `queued` y orden de filas en las tres cuantizaciones |
| Validación de parche C | 15 comprobaciones de resultados y planes + 231 tests de regresión core superados |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 22,94 GB de pesos en oQ6e, más overhead de contexto y KV cache; con 32.768 tokens de contexto cargado conviene disponer de al menos 32-40 GB de memoria unificada. oQ4e baja a 16,60 GB y oQ8 sube a 29,08 GB.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (series M). La medida publicada se hizo en un Mac Studio M5 Ultra con 256 GiB. No se documenta soporte para A100, H100 ni RTX 4090 en esta derivada.
- GPU de consumo: no aplica en su forma actual; al ser MLX no se ejecuta en GPUs NVIDIA/AMD convencionales sin conversión a otro formato (no documentada).
- Opciones de despliegue: oMLX (con Lightning MTP activable) y LM Studio mediante los perfiles Slonik Chat y Slonik Research del Hub de LM Studio, o instalación offline con el archivo `slonik-lmstudio-profiles.zip`. No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 57,71 tok/s de decodificación mediana en oQ6e con MTP activo en el hardware de referencia; sin MTP, oQ8 cae a 27,92 tok/s. No hay datos de TTFT ni de throughput con concurrencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|
| Slonik-27B-oQ6e-mtp | 27,3 B | 32.768 / 65.536 (perfil) | Apache-2.0 | MLX (safetensors) |
| Slonik 27B (BF16, base) | 27,3 B | no disponible | Apache-2.0 | safetensors |
| Alternativas de código de ~27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El alcance de validación es limitado: el autor indica explícitamente que las cargas de trabajo de contexto largo, concurrentes y ejecutadas sobre PostgreSQL quedaron fuera de la serie de pruebas.
- En el perfil Chat, las respuestas sobre GiST contienen una imprecisión técnica sobre indexación sin pérdida, y el autor no reclama calidad de respuesta equivalente entre perfiles.
- El modo thinking está desactivado por defecto; activarlo requiere pasar argumentos de plantilla de chat (`enable_thinking=true` y `reasoning_effort`), y `reasoning: low` no está soportado en la integración de LM Studio probada.
- Cargar la carpeta del modelo directamente en LM Studio no añade automáticamente los perfiles; hay que instalar Slonik Chat o Slonik Research desde el Hub.
- La especialización en PostgreSQL puede traducirse en un rendimiento inferior en dominios de código ajenos al motor; no hay benchmarks generales que lo confirmen.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe; toda la validación publicada se hizo con prompts en inglés.
- Riesgo de alucinación en explicaciones técnicas: el propio autor documenta errores en las explicaciones escritas junto a planes correctos en la validación SQL.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar `NOTICE` y las licencias upstream incluidas en el repositorio para cumplir con la atribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp
- Modelo base: https://huggingface.co/dglhf/Slonik
- Checkpoint de origen (revisión 321d879c): https://huggingface.co/dglhf/Slonik/tree/321d879c39a809057f324a8133c9484e4c192c06/27B
- Paper de Slonik: https://huggingface.co/dglhf/Slonik/blob/main/Slonik.pdf
- Documentación de cuantización oQ de oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Validación de API: https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp/blob/b80fd6caf08491de949b6aa2161a0450863ce82f/API-VALIDATION.md
- Perfiles de runtime: https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp/blob/b80fd6caf08491de949b6aa2161a0450863ce82f/RUNTIME-PROFILES.md
- Benchmarks: https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp/blob/b80fd6caf08491de949b6aa2161a0450863ce82f/BENCHMARK.md
- Artículo (inglés): https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp/blob/b80fd6caf08491de949b6aa2161a0450863ce82f/ARTICLE.md
- Artículo (ruso): https://huggingface.co/kakoka/Slonik-27B-oQ6e-mtp/blob/b80fd6caf08491de949b6aa2161a0450863ce82f/ARTICLE.ru.md
- Parche C del caso documentado: https://github.com/pkonotopov/slonik-llm-tests/blob/a7092b5ba81bc9767906599ac459aaf4b81061e5/patches/oq6e.patch
- Slonik Chat en LM Studio Hub: https://lmstudio.ai/kakoka/slonik-27b-chat
- Slonik Research en LM Studio Hub: https://lmstudio.ai/kakoka/slonik-27b-research
