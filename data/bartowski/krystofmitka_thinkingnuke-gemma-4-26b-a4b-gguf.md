# bartowski/krystofmitka_ThinkingNuke-gemma-4-26B-A4B-GGUF

## Resumen

ThinkingNuke-gemma-4-26B-A4B es un ajuste fino (fine-tune) del modelo Gemma 4 de Google, desarrollado por el usuario krystofmitka, orientado al razonamiento explícito con control de esfuerzo (*effort-control*). El repositorio aquí descrito es la versión cuantizada en formato GGUF publicada por bartowski, pensada para su ejecución local mediante llama.cpp. El checkpoint fuente declara 26B de parámetros y una arquitectura de tipo Mixture-of-Experts con aproximadamente 4B de parámetros activos por token (de ahí el sufijo A4B), lo que permite un equilibrio entre capacidad y coste computacional en inferencia.

El modelo es multimodal de tipo *any-to-any*: acepta texto, imagen y audio (este último mediante un fichero mmproj separado). Incorpora un canal de pensamiento (`<|channel>thought`) en su formato de prompt, lo que lo hace adecuado para tareas de razonamiento multi-paso y para integraciones con herramientas externas mediante tool calling declarado en el propio prompt.

La relevancia actual radica en la disponibilidad de un modelo de razonamiento multimodal de ~26B en cuantizaciones que caben en GPUs de consumo (desde 15,63 GB en IQ4_NL hasta 50,51 GB en BF16), con licencia declarada Apache 2.0 en el repositorio de cuantización. No obstante, debe contrastarse con la licencia del modelo base de Google, que se rige por el acuerdo Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (Gemma 4), multimodal any-to-any |
| Parametros totales | 25.233.142.046 (~26B) |
| Parametros activos | ~4B (sufijo A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_1, Q4_K_S, IQ4_NL, Q3_K_L, Q4_0 (imatrix) |
| Idiomas soportados | no disponible (no declarados en la información proporcionada) |
| Licencia | apache-2.0 (repositorio GGUF); el modelo base remite a la licencia Gemma 4 de Google |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el checkpoint base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma 4 con mezcla de expertos: 25.233.142.046 parámetros totales con aproximadamente 4B activos por token, lo que reduce el coste de cómputo en inferencia frente a un modelo denso del mismo tamaño. El pipeline declarado es *any-to-any*, con soporte de entrada de texto, imagen y audio (este último requiere el fichero mmproj correspondiente). El formato de prompt emplea tokens especiales de turno (`<|turn>system`, `<|turn>user`, `<|turn>model`) y un canal de pensamiento explícito (`<|channel>thought`), lo que indica un entrenamiento orientado a generar cadenas de razonamiento antes de la respuesta final.

El fine-tune de krystofmitka añade control de esfuerzo (*effort-control*), una capacidad que permite modular la profundidad del razonamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el ajuste. La cuantización GGUF ha sido generada por bartowski con llama.cpp (release b12600) usando imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión. No se emplea decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento explícito mediante canal de pensamiento (`<|channel>thought`).
- Control de esfuerzo de razonamiento (*effort-control*), que permite ajustar la profundidad del proceso de pensamiento.
- Entrada multimodal: texto, imagen y audio (audio requiere fichero mmproj).
- Tool calling / function calling mediante declaración de herramientas en el prompt de sistema (formato `declaration:` con parámetros tipados).
- Razonamiento multi-paso y soporte para flujos de agentes.
- Conversación multi-turno (pipeline *conversational*).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento asistido en entornos locales: el canal de pensamiento permite obtener trazas de razonamiento auditables, útil para depuración de decisiones en aplicaciones de análisis.
- Atención al cliente con contexto conversacional: el pipeline conversacional y el soporte multi-turno permiten gestionar diálogos con historial, aunque la longitud de contexto no está documentada.
- Automatización con herramientas externas: el tool calling declarado en el prompt permite conectar el modelo a APIs (por ejemplo, consulta de precios de acciones como en el ejemplo de la model card) en pipelines de agentes.
- Procesamiento de documentos con imágenes: al aceptar entrada de imagen, puede emplearse en tareas de extracción o descripción de contenido visual combinado con texto.
- Transcripción y análisis de audio: con el fichero mmproj adecuado, puede procesar entradas de audio para tareas de comprensión o resumen.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (17,97 GB) e IQ4_NL (15,63 GB) permiten ejecución local en GPUs con 16-24 GB de VRAM.
- Prototipado de investigación en razonamiento: el control de esfuerzo permite comparar respuestas con distinta profundidad de pensamiento sobre el mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): IQ4_NL ~15,63 GB; Q4_K_S ~16,05 GB; Q4_K_M ~17,97 GB; Q5_K_M ~20,01 GB; Q6_K ~23,79 GB; Q8_0 ~26,86 GB; BF16 ~50,51 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q5/Q6; RTX 4080/4070 Ti Super (16 GB) para Q4_K_S o IQ4_NL; A100/H100 para BF16 o Q8_0.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en GPUs de 16-24 GB; Q6_K_L (24,52 GB) requiere 24 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (release b12600 o superior), Ollama, y cualquier runtime compatible con GGUF; el repositorio declara `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ThinkingNuke-gemma-4-26B-A4B (este) | ~26B | ~4B | no disponible | apache-2.0 (GGUF) / Gemma 4 (base) | GGUF, safetensors |
| Gemma 4 26B-A4B (base) | ~26B | ~4B | no disponible | Gemma 4 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma 4, hereda los sesgos del modelo base.
- Riesgo de alucinación: no cuantificado; el canal de pensamiento no garantiza la veracidad de las respuestas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados.
- Restricciones de licencia: el repositorio GGUF declara apache-2.0, pero el modelo base remite a la licencia Gemma 4 de Google; debe verificarse el cumplimiento de los términos de Gemma 4 para uso comercial.
- El soporte de audio requiere el fichero mmproj, que no forma parte de los ficheros GGUF listados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad.
- Fine-tune de un autor individual sin documentación de datos de entrenamiento ni evaluación publicada.
- El tamaño del repositorio (411,9 GB) implica un coste de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/krystofmitka_ThinkingNuke-gemma-4-26B-A4B-GGUF
- Modelo base (fine-tune): https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/krystofmitka_ThinkingNuke-gemma-4-26B-A4B-GGUF/blob/main/krystofmitka_ThinkingNuke-gemma-4-26B-A4B-Q4_K_M.gguf
