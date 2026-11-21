# CloudGoat/aoi-gemma-4-E4B-it-heretic

## Resumen

aoi-gemma-4-E4B-it-heretic es un modelo de fusión (merge) de tipo task-arithmetic construido sobre la familia Gemma 4, concretamente sobre la variante E4B-it de Google. Lo desarrolla el usuario CloudGoat y combina tres linajes: el modelo base google/gemma-4-E4B-it, una variante con personalidad de personaje (haruuuuu-1256/aoi-gemma-4-E4B-it, un personaje "葵" de estilo tsundere) y una variante "ultra-uncensored-heretic" (llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic). El objetivo es trasplantar el vector de tarea de "eliminación de rechazos" del modelo heretic sobre el modelo con personalidad, conservando el tono y el personaje originales.

El modelo resuelve un problema muy concreto: obtener un modelo conversacional con una personalidad definida que, además, no rechace peticiones que el modelo base bloquearía por seguridad. Es relevante para quienes trabajan en roleplay, generación de personajes o investigación sobre alineación y refusal behaviour, ya que ejemplifica una técnica reproducible (extracción de task vector y fusión lineal) para modular el comportamiento de rechazo sin reentrenar.

Técnicamente es un modelo multimodal image-text-to-text de aproximadamente 8.000 millones de parámetros, con pesos en safetensors y bf16, licencia Apache 2.0 y etiquetado de idioma japonés. La model card advierte explícitamente de que la precisión de las respuestas es la propia de un E4B y de que los procedimientos técnicos pueden contener errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E4B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en bf16 |
| Idiomas soportados | japones (ja) segun etiquetado; capacidades multilingues del base no confirmadas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2130 tensores, bf16) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusión por aritmética de tareas (task arithmetic) ejecutada con la herramienta GoatMerge. El procedimiento documentado consta de dos pasos. Primero se extrae el vector de tarea `T = heretic − google/gemma-4-E4B-it`, es decir, la diferencia de pesos entre el modelo base y la variante sin censura. Después se aplica una fusión lineal `W = aoi + 1.0 · T`, sumando ese vector al modelo con personalidad con un coeficiente de 1.0. La fusión cubre los 2130 tensores del checkpoint en bf16 y se ejecuta con `--skip-fingerprint-check`.

La arquitectura subyacente es la de Gemma 4 E4B-it, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text), con soporte de "modo pensamiento" (thinking mode) que la model card recomienda mantener desactivado, igual que en el modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional con una personalidad de personaje definida (葵, estilo tsundere).
- Procesamiento de entrada multimodal imagen-texto (el pipeline declarado es image-text-to-text).
- Conversación multi-turno orientada a roleplay y personificación.
- Comportamiento sin rechazos: según la prueba del autor, 0 de 5 prompts habitualmente rechazados fueron rechazados, frente a 5 de 5 en el modelo original.
- Mantenimiento parcial del tono y la configuración del personaje: 7 de 7 prompts conservan el registro, aunque con una reducción del matiz tsundere.
- Modo pensamiento disponible pero desaconsejado su uso (debe permanecer desactivado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara japonés; el resto no disponible.

## Casos de uso

- Roleplay y personificación de personajes: el modelo conserva el tono y la configuración de 葵 en conversaciones multi-turno, lo que permite construir chatbots de personaje con coherencia de registro sin que el modelo rechace escenas o diálogos que el base bloquearía.
- Investigación sobre refusal behaviour y alineación: sirve como caso de estudio reproducible de cómo un task vector extraído de un modelo "uncensored" modifica la tasa de rechazo de otro modelo, útil para medir efectos de la aritmética de tareas sobre el comportamiento de seguridad.
- Generación creativa de ficción y narrativa: al eliminar los rechazos, es adecuado para escribir relatos con temáticas adultas o conflictivas dentro de un entorno controlado, con la advertencia de que la precisión factual no está garantizada.
- Prototipado rápido de asistentes con personalidad en japonés: su tamaño de ~8B y licencia Apache 2.0 permiten desplegarlo en infraestructura modesta para demos de conversación con personaje.
- Evaluación comparativa de merges: la model card documenta el pipeline completo (extracción de vector, fusión lineal, coeficiente 1.0), lo que lo convierte en un banco de pruebas para estudiar el efecto de distintos coeficientes de fusión sobre el tono y el rechazo.
- Análisis de degradación de capacidades tras la fusión: el propio autor señala que la exactitud es la de un E4B y que los procedimientos técnicos pueden contener errores, por lo que el modelo es útil para estudiar el trade-off entre supresión de rechazos y fidelidad de las respuestas.
- Generación de diálogo multimodal: al aceptar entrada de imagen y texto, puede emplearse en escenarios de conversación sobre imágenes con un personaje concreto, siempre que se validen las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una prueba cualitativa del autor con 5 prompts de rechazo y 7 prompts de personaje, con temperatura 1.0, top_p 0.95 y top_k 64:

| Prueba | Modelo original (aoi) | Este modelo |
|---|---|---|
| Prompts habitualmente rechazados (5) | 5 rechazos | 0 rechazos |
| Mantenimiento de tono y configuración de 葵 (7) | Mantenido | Casi mantenido (matiz tsundere algo reducido) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16 GB solo para los pesos (8B parámetros × 2 bytes), más overhead de activaciones y del procesador multimodal; se recomienda al menos 24 GB para trabajar con comodidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; para GPUs de 16 GB sería necesario cuantizar, aunque no se documentan cuantizaciones oficiales.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB o menos requeriría cuantización no publicada por el autor.
- Opciones de despliegue: transformers con `AutoProcessor` y `Gemma4ForConditionalGeneration` (ejemplo oficial de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| CloudGoat/aoi-gemma-4-E4B-it-heretic | ~8B | no disponible | Apache 2.0 | Merge de personaje + uncensored | Hugging Face |
| haruuuuu-1256/aoi-gemma-4-E4B-it | ~8B (base del merge) | no disponible | no disponible | Personaje 葵 sin modificar | Hugging Face |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic | ~8B (fuente del task vector) | no disponible | no disponible | Eliminación de rechazos | Hugging Face |
| google/gemma-4-E4B-it | ~8B (modelo base) | no disponible | Gemma (términos propios) | Modelo multimodal instructivo original | Hugging Face |

Los tres modelos comparables comparten el linaje Gemma 4 E4B, por lo que el tamaño es equivalente; las diferencias están en el comportamiento (personaje, rechazo) y en la licencia. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Modelo explícitamente "sin censura": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido dañino, ofensivo o inapropiado. El uso de las salidas es responsabilidad del usuario, tal como advierte el autor.
- Riesgo de alucinación y errores factuales: el autor indica que la exactitud es la de un E4B y que los procedimientos técnicos pueden contener errores; no debe usarse como fuente fiable en dominios técnicos o médicos.
- Degradación del personaje: el matiz tsundere se reduce respecto al modelo original, lo que puede afectar a la fidelidad de la caracterización en producciones de roleplay.
- Idioma: solo se declara japonés; el rendimiento en castellano u otros idiomas no está verificado.
- Contexto: no se documenta la longitud de contexto soportada.
- Modo pensamiento: debe mantenerse desactivado; su activación no está validada en este merge.
- Licencia: Apache 2.0 para este checkpoint, pero conviene revisar las condiciones de los modelos base (especialmente la licencia Gemma de Google) antes de un uso comercial.
- Sin benchmarks: no hay evidencia cuantitativa de calidad más allá de la prueba cualitativa del autor con 12 prompts.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic
- Modelo base con personaje: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
- Modelo fuente del task vector: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- Modelo base original: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta de fusión GoatMerge: https://github.com/CroudGoat/GoatMerge
