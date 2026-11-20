# ashwin-sreedhar/GPT-OSS-20B-abliterated-dequantized-bf16

## Resumen

GPT-OSS-20B-abliterated-dequantized-bf16 es un checkpoint experimental derivado de `openai/gpt-oss-20b`, publicado por el usuario independiente ashwin-sreedhar (persona-lab). Se trata de una edición de pesos cuyo objetivo declarado es la eliminación de rechazos (refusal removal, técnica conocida como *abliteration*), partiendo de una dequantización a bf16 de los pesos originales que OpenAI distribuyó en MXFP4. El modelo conserva la arquitectura original de GPT-OSS, con aproximadamente 20.900 millones de parámetros totales, pero el autor advierte explícitamente que la eliminación de rechazos **no ha sido demostrada**: las pruebas manuales de chat siguieron produciendo rechazos.

La relevancia de esta ficha es sobre todo metodológica y de advertencia. El autor documenta con rigor los diagnósticos de exportación, las comprobaciones de integridad de serialización y un piloto comparativo con el checkpoint original, pero también reconoce que el diagnóstico mecánico estricto (ratio de proyección máxima 1,076 % frente a un objetivo del 1 %) **falla el umbral**, que la preservación amplia de capacidades no está probada y que el comportamiento en imagen, contexto largo y generación asistida por MTP no se ha evaluado. Se trata, por tanto, de un artefacto de investigación, no de un modelo listo para producción.

La licencia declarada es Apache 2.0, heredada del modelo base, y el repositorio ocupa 41,9 GB en formato safetensors. El pipeline es `text-generation` y la librería `transformers`. No se declaran idiomas soportados, y no hay resultados de benchmarks publicados para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (GPT-OSS, segun modelo base; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 20.914.757.184 (~20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor menciona comportamiento en contexto largo como "no probado") |
| Tipos de cuantizacion | pesos distribuidos en bf16; el modelo base original se publico en MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de `openai/gpt-oss-20b`, del que no se detallan en la informacion proporcionada los pormenores de arquitectura (número de capas, atención, composición del dataset o fases de RLHF/DPO). Lo que sí está documentado es el proceso de modificación: el autor tomó los pesos expertos publicados en MXFP4, los dequantizó a bf16 en un guardado separado y verificado, y aplicó sobre esa representación una intervención de edición de pesos registrada en los metadatos de exportación (`.pipeline/`). El autor subraya que la dequantización **no recupera** la precisión perdida durante la cuantización original, por lo que este checkpoint no equivale a una release oficial de OpenAI en precisión completa; la línea base de comparación es esa misma representación dequantizada sin editar.

Las innovaciones técnicas destacables no están en el entrenamiento sino en el procedimiento de edición y verificación. Se realizaron comprobaciones SHA-256 de los pesos originales antes y después de la exportación, verificación de bytes, formas y dtypes de cada tensor editado tras el guardado, y una recarga en proceso fresco que coincidió con la referencia editada en memoria sobre tres prompts benignos fijos durante tres pasos greedy sin caché. Cada fichero safetensors lleva un aviso de modificación en su cabecera. El diagnóstico de retención de capacidades incluye una KL de primer token sobre 100 prompts benignos retenidos de **0,026350** y un ratio máximo de proyección editado/base del **1,076 %**, que incumple el objetivo mecánico del 1 %.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla Harmony y canal de análisis ordinario abierto explícitamente.
- Razonamiento con modo de bajo esfuerzo (*low reasoning effort*), configurable en el script de chat del autor.
- Generación de código defensivo y comprobaciones de propiedades de seguridad (probado en el piloto con 16 tareas sintéticas).
- Tareas utilitarias sintéticas, incluida la ordenación de secuencias numéricas y el formateo JSON (32/40 en la puntuación estricta del piloto editado).
- Respuestas a peticiones abiertas ordinarias y a casos sensibles pero permitidos (sarcasmo ficticio, quejas airadas, discusión defensiva de ransomware/spyware).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el autor indica que "no tools are executed" en su script de chat).
- Capacidades de agente y razonamiento multi-paso: no disponibles como capacidad verificada en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades de visión, audio o modo *thinking* extendido: no disponibles o explícitamente no probadas (comportamiento en imagen marcado como "untested").

## Casos de uso

- Investigación sobre edición de pesos y *abliteration*: el checkpoint sirve como artefacto reproducible para estudiar cómo las intervenciones sobre tensores afectan (o no) el comportamiento de rechazo, con metadatos de política, dirección, selección y hashes de datos/código conservados en `.pipeline/`. Es adecuado precisamente porque documenta sus propios fallos diagnósticos.
- Auditoría de integridad de serialización: útil como caso de referencia para validar pipelines que comparan pesos en memoria con pesos recargados desde disco, dado que el autor aporta comprobaciones de bytes, formas, dtypes y recarga en proceso fresco.
- Evaluación de robustez de clasificadores de seguridad: el piloto con el clasificador Qwen3Guard (0/56 rechazos etiquetados en ambos checkpoints) permite estudiar discrepancias entre la observación manual negativa y las métricas automáticas.
- Generación de código defensivo y revisiones de propiedades de seguridad: las 16 tareas sintéticas de comprobación de propiedades de código encajan con un uso de asistencia a revisión estática, aunque el propio autor advierte que no se establece descubrimiento real de vulnerabilidades.
- Formateo estructurado de datos (JSON, ordenación numérica): el piloto muestra puntuaciones estrictas de 36/40 en el checkpoint editado, con diferencias atribuidas a formato JSON y tipos numéricos, lo que lo hace utilizable para tareas de transformación de datos con validación posterior.
- Estudio de casos sensibles pero permitidos: las 8 pruebas de frontera (sarcasmo ficticio, quejas, discusión defensiva de malware) permiten analizar el comportamiento en el límite de políticas de contenido, siempre con supervisión humana.
- Comparación controlada original vs. editado: el piloto emparejado de 56 peticiones tokenizadas idénticas permite usar el checkpoint como brazo experimental en estudios de preservación de capacidades, con puntuaciones congeladas y comprobaciones post hoc etiquetadas por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas internas del piloto emparejado del 6 de noviembre de 2026:

| Metrica | Original (bf16 dequantizado) | Editado (este checkpoint) |
|---|---|---|
| Peticiones permitidas evaluadas | 56 | 56 |
| Respuestas finales completadas | 56/56 | 56/56 |
| Recortes (cutoffs) | 0 | 0 |
| Rechazos etiquetados por Qwen3Guard | 0/56 | 0/56 |
| Rechazos en subconjunto frontera (8 casos) | 0/8 | 0/8 |
| Puntuacion estricta de tareas | 32/40 | 36/40 |
| Comprobacion post hoc de ordenacion | 8/8 | 8/8 |
| KL primer token benigno (100 prompts) | referencia | 0,026350 |
| Ratio maximo de proyeccion editado/base | referencia | 1,076 % (objetivo 1 %) |

Los datos de benchmarks comparativos con modelos similares no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 42 GB solo para pesos (20,9 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se necesita una GPU de 80 GB o múltiples GPUs para margen de contexto.
- Cuantizaciones inferiores (por ejemplo, 8 bits o 4 bits) reducirían el requisito a rangos de ~21 GB y ~11-12 GB respectivamente, pero no se documentan ficheros GGUF ni cuantizaciones alternativas en el repositorio; solo se distribuyen safetensors bf16.
- GPU recomendadas: A100 80 GB, H100 80 GB para bf16 sin cuantización; RTX 4090 (24 GB) no cabe en bf16 y requeriría cuantización no disponible en el repo.
- Consumer GPU: no cabe en ninguna GPU de consumo en bf16 con el tamaño de repo de 41,9 GB.
- Opciones de despliegue: transformers con el entorno `requirements/native-cuda.txt` y el script `chat_cuda.py` del autor (atención eager con sinks, expertos nativos eager, plantilla Harmony, bajo esfuerzo de razonamiento). vLLM, llama.cpp, Ollama o TGI: no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles. El autor indica que la demo en GPU está offline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| GPT-OSS-20B-abliterated-dequantized-bf16 (este) | ~20,9 mil millones | no disponible | Apache 2.0 | safetensors bf16 | experimental, edicion de pesos, rechazos no eliminados segun pruebas manuales |
| openai/gpt-oss-20b (base) | ~20,9 mil millones | no disponible | Apache 2.0 | MXFP4 (pesos expertos) | release oficial de OpenAI |
| Dequantizacion bf16 sin editar del base | ~20,9 mil millones | no disponible | Apache 2.0 | safetensors bf16 | linea base del piloto del autor |

Otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos **no está demostrada**: las pruebas manuales de chat siguieron produciendo rechazos en las peticiones dañinas probadas. El autor prohíbe describir el checkpoint como una eliminación de rechazos exitosa.
- El diagnóstico mecánico estricto falla: ratio máximo de proyección 1,076 % frente al objetivo del 1 %.
- El selector guardado puntuó tokens genéricos de apertura de razonamiento (1844 `User`, 2167 `We`) como si fueran marcadores de rechazo; no son marcadores validados. Una sonda benigna de saludo les asignó probabilidad combinada 0,51117.
- Preservación amplia de capacidades no probada: el piloto sintético de 56 peticiones no establece mantenimiento general de capacidades, descubrimiento real de vulnerabilidades ni eliminación de rechazos ante peticiones dañinas.
- La dequantización desde MXFP4 no recupera precisión; este checkpoint no es una release oficial de OpenAI en precisión completa.
- Comportamiento en imagen, contexto largo y generación asistida por MTP no probados.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero siguen aplicando las licencias, atribución y restricciones de uso upstream del modelo base; deben consultarse los ficheros de licencia, aviso y política incluidos.
- El trabajo adicional sobre el modelo está pausado a petición del usuario; la demo en GPU está offline y solo se conserva un volumen de almacenamiento con copias originales/preparadas/editadas.
- Para producción: no recomendado como modelo de propósito general sin evaluación de capacidades y de comportamiento de rechazo propia, dado el estado experimental y los fallos diagnósticos reconocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashwin-sreedhar/GPT-OSS-20B-abliterated-dequantized-bf16
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Registro público de ejecución y limitaciones (persona-lab): https://github.com/ashwinsreedhar28/persona-lab/blob/main/docs/GPT_OSS_RESEARCH.md
