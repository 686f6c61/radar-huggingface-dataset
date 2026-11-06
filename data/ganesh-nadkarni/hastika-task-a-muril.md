# Ganesh-Nadkarni/hastika-task-a-muril

## Resumen

`hastika-task-a-muril` es un modelo de clasificación de texto obtenido por fine-tuning de `google/muril-base-cased` para la detección binaria de discurso de odio (Non-Hate / Hate) en comentarios de YouTube con mezcla de código kannada-inglés (kanglish). Lo desarrolla Ganesh-Nadkarni como componente del sistema presentado a la tarea Task A del shared task HASTIKA @ ICON-2026, centrado en identificación de odio y de objetivos en texto code-mixed kannada-inglés.

El modelo es un transformer encoder de tipo BERT con 237.557.762 parámetros, licencia Apache 2.0 y pesos en safetensors, pensado para integrarse en pipelines de moderación de contenido mediante la API de `transformers` (`text-classification`). Su relevancia radica en abordar un escenario lingüístico poco cubierto por los modelos multilingües generalistas: la alternancia kannada-inglés típica de redes sociales en Karnataka, con transliteraciones latinas y ruido ortográfico.

Es importante señalar que el checkpoint es un componente individual de un ensemble junto con XLM-RoBERTa y un SVM calibrado sobre TF-IDF. El autor indica explícitamente que este modelo por sí solo es más débil que el conjunto: 0.762 de macro-F1 en su partición de validación interna, frente a 0.8162 del ensemble en validación y 0.7963 en el conjunto de test oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base de `google/muril-base-cased`) |
| Parametros totales | 237.557.762 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto nativo documentado; entrenamiento con `max_length` de 160 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/ONNX no publicadas por el autor) |
| Idiomas soportados | kannada (kn) e ingles (en), en registro code-mixed kannada-inglés (kanglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-base-cased`, un encoder transformer de la familia BERT entrenado por Google sobre texto multilingüe con énfasis en lenguas indias y en pares de transliteración. Sobre esa base se aplica una cabeza de clasificación de secuencia con dos etiquetas (`0`: Non-Hate, `1`: Hate), ajustada de extremo a extremo para la tarea.

El ajuste fino se realizó sobre la partición de entrenamiento del dataset HASTIKA, con una división estratificada 88/12 entre entrenamiento y hold-out. Los hiperparámetros documentados son: longitud máxima de 160 tokens, batch size de 16, precisión mixta, learning rate de 2e-5 y early stopping sobre macro-F1 de validación. No se documentan en la información disponible detalles sobre volumen de tokens, composición exacta del corpus, ni sobre etapas de RLHF/DPO (no aplicables a un clasificador de este tipo).

La innovación principal no está en la arquitectura, sino en el dominio de aplicación: el modelo está especializado en un registro code-mixed con transliteración latina del kannada, donde los modelos multilingües convencionales rinden por debajo de lo esperado por la variabilidad ortográfica y la mezcla intra-oración.

## Capacidades

- Clasificación binaria de texto: asigna la etiqueta Non-Hate o Hate a un comentario individual.
- Manejo de texto code-mixed kannada-inglés, incluyendo transliteraciones latinas del kannada (kanglish).
- Procesamiento de secuencias de hasta 160 tokens en el régimen de entrenamiento.
- Integración directa con la pipeline `text-classification` de `transformers`.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los dos idiomas del entrenamiento (kn, en); no se documenta generalización a otras lenguas indias.

## Casos de uso

- Moderación de comentarios en YouTube en kannada-inglés: el modelo se aplicaría como primer filtro sobre comentarios de canales dirigidos a audiencias de Karnataka, clasificando cada mensaje como Hate o Non-Hate antes de la revisión humana. Es adecuado porque está entrenado específicamente sobre ese registro y esa plataforma.
- Triaje en colas de moderación de comunidades online: integrado detrás de un endpoint de inferencia, permite priorizar los comentarios marcados como Hate para revisión manual, reduciendo el volumen que llega a los moderadores.
- Investigación en lingüística computacional sobre code-mixing: sirve como línea base reproducible para estudiar detección de odio en kanglish y comparar con otros encoders multilingües.
- Componente de un ensemble de producción: dado que el autor documenta un ensemble con XLM-RoBERTa y un SVM calibrado que alcanza 0.8162 de macro-F1 en validación, este checkpoint se usaría como uno de los votantes del conjunto, no como clasificador único.
- Análisis de toxicidad en estudios de redes sociales: permite etiquetar corpus históricos de comentarios para medir prevalencia de discurso de odio por canal, tema o periodo.
- Filtrado previo en plataformas de comentarios de terceros (blogs, foros, apps de noticias) con audiencia kannada: se usaría como capa de premoderación con umbral de confianza ajustable, derivando los casos dudosos a revisión humana.
- Evaluación comparativa de modelos multilingües: como referencia especializada para medir cuánto aporta el ajuste fino en dominio frente a encoders multilingües genéricos.

## Benchmarks y rendimiento

| Modelo | Macro-F1 (validación) | Macro-F1 (test oficial) |
|---|---|---|
| `hastika-task-a-muril` (este checkpoint, hold-out interno) | 0.762 | no disponible |
| Ensemble MuRIL + XLM-RoBERTa + SVM TF-IDF calibrado | 0.8162 | 0.7963 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo, ni comparaciones numéricas con encoders alternativos en el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.95 GB solo para pesos (237.5 M de parámetros), más activaciones y overhead del runtime; en la práctica, alrededor de 1.5-2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0.5 GB para pesos, con un total práctico en torno a 1-1.5 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) donde el cuello de botella será el throughput, no la memoria.
- También es viable en CPU para volúmenes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, Text Embeddings Inference (declarado compatible), endpoints de Hugging Face, y servidores de inferencia genéricos compatibles con safetensors. No se documentan artefactos GGUF para llama.cpp/Ollama ni configuraciones TGI específicas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| `hastika-task-a-muril` | 237.5 M | 160 tokens en entrenamiento | Hate speech kanglish (kn-en) | Apache 2.0 | 0.762 macro-F1 en hold-out interno |
| `google/muril-base-cased` (base) | ~237 M | 512 tokens (BERT base) | Multilingüe, énfasis en lenguas indias | Apache 2.0 | No ajustado a esta tarea; sin métrica en HASTIKA en la información disponible |
| XLM-RoBERTa (componente del ensemble) | no disponible en la información | no disponible | Multilingüe | no disponible en la información | Contribuye al 0.8162 del ensemble en validación |
| SVM calibrado sobre TF-IDF (componente del ensemble) | no aplica | no aplica | Kanglish | no disponible en la información | Contribuye al 0.8162 del ensemble en validación |

No se dispone de datos comparativos directos con otros clasificadores de odio en kanglish en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que este checkpoint es más débil que el ensemble del que forma parte; usarlo en solitario degrada el rendimiento respecto al sistema completo.
- Entrenado sobre un dataset pequeño: se esperan errores en variantes dialectales, sarcasmo, lenguaje reclamado por la comunidad y transliteraciones no vistas en entrenamiento.
- Riesgo de falsos positivos y falsos negativos en un dominio sensible; no debe usarse como decisión automática sin revisión humana.
- Sesgos potenciales derivados del corpus de YouTube y de la anotación del dataset HASTIKA; no se documenta un análisis de sesgo en la información disponible.
- Cobertura lingüística restringida a kannada e inglés code-mixed; no se garantiza funcionamiento en kannada monolingüe formal ni en otras lenguas indias.
- Licencia Apache 2.0 para los pesos, pero el autor remite a los términos del dataset HASTIKA antes de cualquier otro uso; conviene verificar las condiciones del corpus para usos distintos de la investigación.
- Uso previsto como herramienta de asistencia a moderadores humanos, no como sustituto.
- No se documentan limitaciones de contexto más allá de los 160 tokens de entrenamiento; secuencias más largas requerirían truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-a-muril
- Modelo base: https://huggingface.co/google/muril-base-cased
- Referencia del dataset y tarea: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. *Language Resources and Evaluation*, 59(3):2811-2856.
- Repositorio, paper, blog o demo adicionales: no disponibles en la información proporcionada.
