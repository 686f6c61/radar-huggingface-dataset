# Mathieu680/Rastignac-1.0-126M

## Resumen

Rastignac 1.0 — 126M es un modelo de lenguaje causal en francés entrenado desde cero por el usuario Mathieu680 y publicado en HuggingFace. Con 126.481.920 parámetros, sigue una arquitectura de estilo GPT-2 (16 capas, 12 cabezas de atención, dimensión oculta 768) y está especializado en una única tarea: la compleción de texto a partir de un inicio de frase o párrafo. No es un modelo de instrucciones ni de chat: no ha pasado por ajuste con instrucciones, RLHF ni DPO, y su único idioma soportado es el francés.

Su rasgo diferencial es el corpus: literatura francesa procedente de Project Gutenberg, con 3.348 textos retenidos y una fecha media de publicación de las obras datadas en torno a 1898. El modelo ha recorrido 983.040.000 tokens de entrenamiento en 30.000 pasos, con 315.832.633 tokens de corpus y 27.511.882 de validación, y una mejor loss de validación interna de 2,7920 en el paso 29.750. Es, por tanto, un modelo pequeño, de dominio muy acotado y orientado a la reproducción de estilo literario de finales del siglo XIX.

Su relevancia actual es fundamentalmente experimental y didáctica: se trata de un entrenamiento from scratch completamente documentado (con `training_metadata.json` y `provenance.json` en el repositorio), reproducible en hardware de consumo, y útil como banco de pruebas para estudiar el comportamiento de modelos pequeños en un dominio lingüístico y estilístico concreto. El repositorio no incluye el corpus, el estado del optimizador ni cuantizaciones, y la licencia es "other" con advertencias explícitas sobre los derechos de los textos de Gutenberg.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (decoder-only) |
| Parametros totales | 126.481.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se incluyen GGUF ni cuantizaciones preparadas) |
| Idiomas soportados | frances (fr) unicamente |
| Licencia | other (con advertencias sobre derechos del corpus Project Gutenberg) |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 16 |
| Cabezas de atencion | 12 |
| Dimension oculta | 768 |
| Vocabulario | 16.000 tokens, BPE byte-level frances |
| Tamano del repositorio | 0,5 GB |
| Pasos de entrenamiento | 30.000 |
| Tokens de entrenamiento recorridos | 983.040.000 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de estilo GPT-2, sin modificaciones estructurales destacables: 16 capas, 12 cabezas de atención, dimensión oculta 768 y una ventana de contexto de 1.024 tokens. El tokenizador es un BPE byte-level específico para francés con un vocabulario de 16.000 tokens, deliberadamente compacto, lo que reduce el tamaño de la matriz de embeddings dentro de un presupuesto de parámetros muy ajustado. No se emplean mecanismos de atención lineal, decodificación especulativa ni capas recurrentes híbridas.

El entrenamiento se realizó desde cero sobre un corpus de literatura francesa preparado a partir de ebooks de Project Gutenberg: 3.348 textos retenidos, 315.832.633 tokens de entrenamiento y 27.511.882 tokens de validación. Se completaron 30.000 pasos, con 983.040.000 tokens recorridos (aproximadamente tres épocas del corpus), y la mejor loss de validación interna fue 2,7920 en el paso 29.750. Las 763 obras con fecha explícita en los metadatos tienen una fecha media de publicación en torno a 1898, lo que define el registro lingüístico y ortográfico del modelo. No hay información disponible sobre el uso de RLHF, DPO u otros ajustes posteriores al preentrenamiento; el modelo card solo describe la compleción de texto.

## Capacidades

- Generación de texto en francés mediante compleción de prompt (continuación de frase o párrafo), con parámetros de muestreo recomendados por el autor: `temperature=0.8`, `top_p=0.92`, `top_k=50`, `repetition_penalty=1.08`.
- Reproducción de registro literario francés de finales del siglo XIX: vocabulario, sintaxis y ortografía propios de obras datadas en torno a 1898.
- Generación de texto creativo y pastiche estilístico dentro del dominio literario aprendido.
- Capacidad multilingüe: limitada al francés; no se declara ni se espera un rendimiento útil en otros idiomas.
- Tool calling / function calling: no soportado. No hay plantilla de herramientas ni entrenamiento orientado a ello.
- Uso como agente o razonamiento multi-paso: no soportado. Es un modelo de compleción pura, sin modo de razonamiento ni seguimiento de instrucciones.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Ejecución local sencilla: incluye un script `run_local.py` para probar el modelo tras clonar el repositorio.

## Casos de uso

- Compleción de texto literario en francés: el caso de uso central del modelo. Dado un inicio de párrafo, continúa el texto con estilo de época, útil como asistente de escritura creativa o para generar borradores de prosa ambientada en el siglo XIX.
- Pastiche y estilo de época: generación de textos que imitan la prosa francesa de finales del siglo XIX para proyectos editoriales, juegos narrativos o ficción histórica, aprovechando que el corpus se concentra en obras de alrededor de 1898.
- Material didáctico y docencia de NLP: al ser un modelo de 126M entrenado desde cero con metadatos completos, permite ilustrar en clase el ciclo completo de tokenización, preentrenamiento causal y evaluación mediante loss de validación, ejecutándose en un portátil.
- Investigación en modelos pequeños de dominio específico: sirve como línea base para estudiar cómo escala el rendimiento con corpus reducidos (315M tokens) y contextos cortos (1.024 tokens), así como para experimentos de ablación sobre tokenizador y tamaño de vocabulario.
- Ajuste fino para tareas de estilo o clasificación: al ser un checkpoint base sin instrucciones, es un punto de partida razonable para fine-tuning supervisado en tareas como detección de autoría, normalización de ortografía histórica o generación controlada por estilo.
- Generación de datos sintéticos en francés literario: aumento de corpus para entrenar clasificadores de género literario o de época, etiquetando después el texto generado con anotadores humanos o heurísticas.
- Pruebas de infraestructura y pipelines de despliegue: por su tamaño reducido, es útil para validar configuraciones de transformers, text-generation-inference o endpoints compatibles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El único dato cuantitativo de evaluación es la loss de validación interna del proyecto:

| Metrica | Valor | Contexto |
|---|---|---|
| Mejor loss de validacion | 2,7920 | Validacion interna, paso 29.750 |
| Tokens de validacion | 27.511.882 | Corpus de validacion interno |
| Pasos de entrenamiento | 30.000 | Total ejecutado |

La loss y la perplejidad indicadas por el autor se miden sobre la validación interna del proyecto, no sobre conjuntos de evaluación públicos, por lo que no son comparables con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16 y del orden de 0,13 GB en int8 (sin contar el overhead de activaciones y caché KV, que es despreciable con 1.024 tokens de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede ejecutar sin problema en RTX 3060, RTX 4090, A100 o H100; en estas dos últimas el cuello de botella será el lanzamiento de kernels y no la memoria ni el cómputo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable y con latencia aceptable para generación de texto interactiva en un solo hilo o con varios hilos, dado el reducido número de parámetros.
- Opciones de despliegue: transformers (soporte nativo, es la librería declarada), text-generation-inference (el repositorio está etiquetado como `endpoints_compatible`), y en principio cualquier runtime compatible con la arquitectura GPT-2. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el repositorio no proporciona. El soporte en vLLM no está verificado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rastignac 1.0 — 126M | 126.481.920 | 1.024 tokens | Frances | other | HuggingFace, safetensors, 0 descargas |
| GPT-2 small (OpenAI) | 124M | 1.024 tokens | Ingles (multilingue limitado) | MIT | Ampliamente disponible, multiples formatos |
| Pythia-160M (EleutherAI) | 160M | 2.048 tokens | Ingles | Apache 2.0 | HuggingFace, safetensors |
| Modelos de complecion en frances de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a parámetros, contexto, idioma y licencia, ya que no hay resultados de benchmarks de Rastignac 1.0 que permitan contrastar calidad. Frente a GPT-2 small y Pythia-160M, Rastignac ofrece un tokenizador y un corpus específicamente franceses y un registro literario concreto, pero carece de la documentación de evaluación, el ecosistema de cuantizaciones y la claridad de licencia de los modelos de referencia.

## Limitaciones y advertencias

- Sesgos de dominio: el corpus es literatura francesa de Project Gutenberg con fecha media en torno a 1898, lo que implica una sobrerrepresentación de autores, géneros y visiones del mundo propios de esa época y clase social, con los sesgos de género, coloniales y culturales que ello conlleva.
- Sin ajuste por instrucciones: el modelo no sigue órdenes, no mantiene conversaciones y no dispone de plantilla de chat. Cualquier uso tipo asistente requiere fine-tuning previo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar afirmaciones factualmente falsas con fluidez, especialmente al completar textos históricos o atribuir citas y autores.
- Contexto limitado: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitación de idioma: solo francés; el rendimiento en otros idiomas no está caracterizado y previsiblemente será deficiente.
- Vocabulario y ortografía: el vocabulario de 16.000 tokens y el entrenamiento sobre textos de época pueden producir grafías arcaicas o no normalizadas, inadecuadas para texto contemporáneo.
- Licencia restrictiva e incierta: la licencia es "other" y el propio autor advierte de que no se reclama dominio público general ni licencia completa sobre el corpus. Project Gutenberg indica que sus ebooks no son necesariamente reutilizables de la misma forma fuera de Estados Unidos, por lo que antes de un uso comercial o una redistribución amplia hay que verificar autores, ediciones y legislación local aplicable.
- Reproducibilidad parcial: el repositorio no incluye el corpus completo, el estado del optimizador ni los ficheros binarios de datos, solo el mejor checkpoint, el tokenizador y los metadatos de exportación y procedencia.
- Inconsistencia documental: el ejemplo de la model card usa el identificador `Mathieu680/Rastignac-126M`, distinto del identificador real del repositorio, `Mathieu680/Rastignac-1.0-126M`, lo que puede provocar errores al copiar el código de carga.
- Adopción nula: cero descargas y un único "like" en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mathieu680/Rastignac-1.0-126M
- Licencia de Project Gutenberg: https://www.gutenberg.org/policy/license
- FAQ de copyright de Project Gutenberg: https://www.gutenberg.org/help/copyright
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a esquelas y directorios telefonicos sin relacion con el proyecto.
