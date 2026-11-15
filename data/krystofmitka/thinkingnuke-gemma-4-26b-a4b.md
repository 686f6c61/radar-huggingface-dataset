# krystofmitka/ThinkingNuke-gemma-4-26B-A4B

## Resumen

ThinkingNuke-gemma-4-26B-A4B es un ajuste fino del modelo multimodal google/gemma-4-26B-A4B-it publicado por el usuario krystofmitka en Hugging Face. Se trata de un modelo derivado que combina pesos de supervised fine-tuning (SFT) con un adaptador LoRA de GRPO fusionado en los pesos, entrenado específicamente para controlar el "esfuerzo de razonamiento" mediante una línea en el system prompt. El modelo conserva la arquitectura y el pipeline image-text-to-text del Gemma 4 original, con 25.805.933.872 parámetros totales según los safetensors.

La propuesta central es que un único checkpoint soporta cinco niveles de esfuerzo (10, 25, 50, 75 y 100) más un modo por defecto, todos aprendidos mediante entrenamiento y no implementados como límites duros de tokens. Esto permite al usuario modular el coste de razonamiento sin cambiar de modelo ni de adaptador. El checkpoint publicado corresponde al paso 114 de RL de una ejecución planificada de 500 pasos, detenida por una fecha límite de reserva de GPU.

Es relevante ahora porque explora una línea de control de esfuerzo de razonamiento en modelos abiertos, un área con creciente interés tras la popularización de modelos con modos "thinking". No obstante, el propio autor advierte que el checkpoint 114 no ha recibido validación con datos reservados ni una evaluación completa de benchmarks, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4; detalles internos no disponibles |
| Parametros totales | 25.805.933.872 |
| Parametros activos | no disponible (el nombre "A4B" sugiere arquitectura MoE con ~4B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16, ~52 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un modelo multimodal de Google DeepMind con pipeline image-text-to-text. Sobre esa base, el autor aplicó un supervised fine-tuning con 16.170 ejemplos correctos (incluyendo 1.603 ejemplos específicos de esfuerzo 10) y posteriormente un entrenamiento de RL con GRPO. El adaptador LoRA de GRPO usó rango 32 y alpha 64 sobre el modelo SFT fusionado, con ocho respuestas por grupo GRPO y 32 grupos por paso de optimizador. El conjunto de RL mezcló 11.283 preguntas de matemáticas, ciencia, instrucción general y seguimiento de instrucciones, con las condiciones de esfuerzo balanceadas aproximadamente mediante un esquema de cobertura prioritaria.

Una innovación destacable es el control de esfuerzo aprendido: el modelo interpreta una línea como `Reasoning Effort: 10 (range 1–100; higher values request more thorough reasoning)` al inicio del system prompt y ajusta la profundidad de razonamiento en consecuencia. Según la validación histórica en el paso 100, el número de tokens de pensamiento disminuye respecto a la referencia SFT previa al RL (por ejemplo, de 3.192 a 1.923 en esfuerzo 10, y de 6.433 a 5.669 en modo por defecto), con mejoras de precisión en la mayoría de ajustes. El entrenamiento se detuvo en el paso 114 de 500 planificados por una fecha límite de reserva de GPU; el autor indica que el checkpoint 114 no ha recibido validación con datos reservados ni evaluación completa de benchmarks. No se documentan detalles adicionales sobre la arquitectura interna (tipo de atención, innovaciones como decodificación especulativa o atención lineal) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con control de esfuerzo mediante el system prompt (valores 10, 25, 50, 75, 100 y modo por defecto).
- Razonamiento matemático y científico, reforzado mediante GRPO sobre un conjunto de 11.283 preguntas de matemáticas, ciencia e instrucción general.
- Procesamiento multimodal image-text-to-text, heredado del modelo base Gemma 4.
- Modo "thinking" habilitable con `enable_thinking=True`, con canales separados de pensamiento y respuesta final en la salida decodificada.
- Seguimiento de instrucciones y conversación multi-turno (pipeline conversational).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking y el control de esfuerzo son compatibles con flujos multi-paso, pero no se confirma soporte de agentes.

## Casos de uso

- Razonamiento matemático con coste controlado: el modelo permite fijar un esfuerzo bajo (por ejemplo, 10) para problemas aritméticos simples y un esfuerzo alto (75 o 100) para demostraciones, ajustando el gasto de tokens de pensamiento según la dificultad.
- Asistencia educativa en ciencias: con el conjunto de entrenamiento centrado en ciencia y matemáticas, puede generar explicaciones paso a paso y adaptar la profundidad de la explicación mediante la línea de esfuerzo en el system prompt.
- Procesamiento de imágenes con descripción textual: al heredar el pipeline image-text-to-text de Gemma 4, puede recibir imágenes y generar respuestas textuales, útil en tareas de captioning o respuesta a preguntas visuales.
- Evaluación comparativa de estrategias de razonamiento: investigadores pueden usar los cinco niveles de esfuerzo para estudiar la relación entre tokens de pensamiento y precisión en un mismo modelo, sin cambiar de checkpoint.
- Integración en pipelines con Transformers y vLLM: el autor documenta carga con `AutoModelForImageTextToText` y despliegue en vLLM con versiones compatibles con Gemma 4, lo que permite servir el modelo con un nombre de modelo fijo y variar el esfuerzo por petición.
- Prototipado de asistentes conversacionales con control de latencia: en aplicaciones donde el coste por consulta importa, el esfuerzo 10 reduce los tokens de pensamiento (1.923 frente a 3.192 en la validación del paso 100) y por tanto la latencia y el coste de inferencia.
- Investigación sobre alineación y RL: el repositorio incluye `training_recipe.json`, `validation_history.json` y `checkpoint_metadata.json`, lo que facilita reproducir o auditar el proceso de SFT + GRPO.

## Benchmarks y rendimiento

La información proporcionada incluye una validación histórica en el paso 100 (no una puntuación del checkpoint 114 publicado), con 250 preguntas reservadas por ajuste, una respuesta por pregunta, semilla 0, temperatura 1.0, top-p 0.95, top-k 64 y límite de 12.288 tokens de salida. La referencia "antes de RL" es el modelo SFT en el paso cero de RL, no el Gemma 4 original de Google.

| Ajuste | Precision antes de RL | Precision en paso 100 | Tokens de pensamiento antes de RL | Tokens de pensamiento en paso 100 |
|---|---:|---:|---:|---:|
| 10 | 70,0% | 69,6% | 3.192 | 1.923 |
| 25 | 68,0% | 72,4% | 3.758 | 2.419 |
| 50 | 67,6% | 73,2% | 4.341 | 3.083 |
| 75 | 62,4% | 70,4% | 5.643 | 4.804 |
| 100 | 61,6% | 68,4% | 6.297 | 5.415 |
| default | 60,4% | 67,6% | 6.433 | 5.669 |

El autor advierte que son comprobaciones de validación con una sola semilla y no agregados multi-semilla; no hay intervalos de confianza entre semillas disponibles. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni para el checkpoint 114 ni para tareas multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para los pesos, más memoria adicional para el procesador, caché KV y activaciones; el autor indica que se necesita memoria extra para inferencia.
- GPU recomendadas: no se especifican en la información; por el tamaño en BF16, se requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) o varias GPU con `device_map="auto"`.
- ¿Cabe en GPU de consumo? En BF16 no cabe en GPU de consumo de 24 GB (RTX 4090) ni de 48 GB; se necesitaría cuantización, que no está documentada en el repositorio.
- Opciones de despliegue: Transformers (versión con soporte de Gemma 4; el entorno de entrenamiento usó 5.20.2) con `AutoModelForImageTextToText` y `AutoProcessor`; vLLM con una versión que soporte Gemma 4, sirviendo el repositorio con `--served-model-name effort-model`.
- Latencia y throughput: no disponibles. El autor sugiere ajustar `max_new_tokens` (el ejemplo usa 12.288) y advierte que alcanzar el límite puede truncar el razonamiento o la respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| ThinkingNuke-gemma-4-26B-A4B (este) | 25.805.933.872 | no disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes | Checkpoint 114 de 500 pasos, sin validación reservada completa |
| google/gemma-4-26B-A4B-it | no disponible en la informacion | no disponible | Apache 2.0 | Hugging Face (modelo base) | Modelo original de Google DeepMind; referencia de partida |
| Alternativas de razonamiento con control de esfuerzo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con alternativas concretas de la misma categoría. La comparativa se limita al modelo base y a la ausencia de datos de terceros.

## Limitaciones y advertencias

- El checkpoint 114 no ha recibido validación con datos reservados ni una evaluación completa de benchmarks; el autor lo indica explícitamente.
- El entrenamiento se detuvo en el paso 114 de 500 planificados por una fecha límite de reserva de GPU, por lo que el modelo está infraentrenado respecto al plan original.
- La validación presentada corresponde al paso 100, no al checkpoint 114 publicado, y usa una sola semilla; los cambios pequeños de precisión pueden reflejar variación de muestreo.
- No se ha establecido una garantía de preservación de capacidades para la suite completa de doce benchmarks ni para tareas multimodales.
- Los valores de esfuerzo distintos de 10, 25, 50, 75, 100 y por defecto no han sido validados.
- El control de esfuerzo son preferencias de razonamiento aprendidas, no límites duros de tokens ni porcentajes de un presupuesto de inferencia.
- Riesgo de alucinación: no se documenta una evaluación específica; al ser un modelo de razonamiento con RL sobre matemáticas y ciencia, la generalización fuera de esos dominios no está validada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá de la del modelo base.
- Licencia: Apache 2.0, con enlace a la licencia de Gemma 4 de Google; el autor indica que los pesos fueron modificados por SFT y GRPO y remite a `LICENSE`, `NOTICE` y `BASE_MODEL_CARD.md` para la atribución upstream. Conviene revisar los términos de la licencia de Gemma 4 para uso comercial.
- El repositorio no incluye estado del optimizador ni datos de entrenamiento; solo contiene pesos de inferencia.
- El límite de salida (por ejemplo, 12.288 tokens) puede truncar el razonamiento o la respuesta final si se alcanza.

## Enlaces

- Hugging Face: https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de Transformers (soporte Gemma 4): no disponible en la información proporcionada
- Documentación de vLLM: no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
