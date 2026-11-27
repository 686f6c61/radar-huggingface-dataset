# kjarni-ai/twitter-roberta-base-sentiment-latest

## Resumen

`kjarni-ai/twitter-roberta-base-sentiment-latest` es un reempaquetado del modelo `cardiffnlp/twitter-roberta-base-sentiment-latest` para su uso con la librería nativa Kjarni. No se trata de un modelo nuevo: los pesos son idénticos bit a bit al original de Cardiff NLP. La tarea es el análisis de sentimiento en textos cortos en inglés, clasificando en tres etiquetas: `negative`, `neutral` y `positive`.

El modelo subyacente es un RoBERTa-base (124,6 millones de parámetros) afinado sobre el benchmark TweetEval a partir de unos 124 millones de tuits publicados entre 2018 y 2021. Está optimizado para texto de redes sociales, por lo que maneja bien emojis, jerga y mensajes breves. El contexto máximo es de 512 tokens, típico de la familia RoBERTa.

La relevancia de este repositorio es operativa: permite ejecutar el clasificador sin runtime de Python, servidor ni servicio en la nube, mediante una biblioteca nativa con bindings en Python, Rust, C#, C++ y línea de comandos. El paquete pesa unos 0,5 GB y se descarga en el primer uso. La licencia es CC BY 4.0, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder) |
| Parametros totales | 124.647.939 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de RoBERTa; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa-base con 12 capas, dimensión oculta de 768 y 12 cabezas de atención (configuración estándar de la familia, no detallada explícitamente en la model card). Sobre la representación del token `[CLS]` se aplica una cabeza de clasificación con tres salidas correspondientes a las etiquetas de sentimiento.

El entrenamiento original, realizado por Cardiff NLP, parte de unos 124 millones de tuits recopilados entre 2018 y 2021 y afina el modelo para análisis de sentimiento con el benchmark TweetEval. La model card de este reempaquetado no aporta detalles adicionales sobre hiperparámetros, composición exacta del dataset ni uso de RLHF o DPO; esa información corresponde al repositorio original. Este repositorio únicamente cambia el empaquetado: pesos en safetensors, eliminación de la capa pooler y del buffer `position_ids` (no usados en clasificación), adición de un `tokenizer.json` generado desde `vocab.json` y `merges.txt`, y re-guardado de configuración y tokenizer con una versión más reciente de transformers. Los ficheros también cargan en transformers, y los autores reportan coincidencia de puntuaciones hasta cuatro decimales con el modelo original en los ejemplos de prueba.

## Capacidades

- Clasificación de sentimiento en tres clases (`negative`, `neutral`, `positive`) para texto corto en inglés.
- Manejo robusto de texto informal de redes sociales: emojis, jerga, abreviaturas y mensajes breves.
- Ejecución local sin runtime de Python, servidor ni servicio en la nube mediante la librería Kjarni.
- Bindings en Python, Rust, C#, C++ (C++23) y herramienta de línea de comandos (`kjarni classify`).
- Salida con etiqueta y puntuación de confianza por clase.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación y monitorización de redes sociales: clasificar en tiempo real el tono de menciones, respuestas y comentarios en inglés para detectar picos de sentimiento negativo y activar alertas. Adecuado por su entrenamiento específico en tuits y su bajo coste de inferencia.
- Análisis de opiniones de clientes: procesar reseñas cortas, encuestas abiertas o tickets de soporte en inglés y agregar el sentimiento por producto, canal o periodo. La ventana de 512 tokens cubre mensajes breves de forma holgada.
- Enrutado automático de tickets de soporte: usar la etiqueta de sentimiento como señal para priorizar casos negativos hacia agentes humanos o colas de escalado, integrándolo en un pipeline con los bindings de Rust o C#.
- Análisis de sentimiento de marca en tiempo real: desplegar el clasificador embebido en un servicio backend sin dependencia de Python, procesando flujos de publicaciones y calculando métricas agregadas por ventana temporal.
- Investigación en ciencias sociales y NLP: reutilizar un clasificador de referencia de TweetEval con pesos idénticos al original de Cardiff NLP, útil para reproducibilidad y comparación de resultados.
- Preprocesado para pipelines analíticos: etiquetar grandes volúmenes de texto corto en inglés como paso previo a agregaciones, dashboards o modelos posteriores, aprovechando la ejecución local y el peso reducido (unos 0,5 GB).
- Aplicaciones de escritorio o embebidas: integrar clasificación de sentimiento en herramientas nativas en C#, C++ o Rust sin empaquetar un intérprete de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación; las referencias de rendimiento del modelo original deben consultarse en el repositorio de Cardiff NLP y en el benchmark TweetEval.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 124,6 millones de parámetros; en FP32 ocupa aproximadamente 0,5 GB de pesos, y en FP16 alrededor de 0,25 GB, más el overhead de activaciones y tokenizer. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no requiere A100 ni H100. Funciona también en CPU, como muestran los ejemplos de la model card (`Device: Cpu`).
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, e incluso en hardware integrado.
- Opciones de despliegue: librería Kjarni (Python, Rust, C#, C++, CLI) y transformers de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño y arquitectura, es un modelo de inferencia muy ligera, apto para CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kjarni-ai/twitter-roberta-base-sentiment-latest | 124,6 M | 512 tokens | Clasificacion de sentimiento (3 clases, ingles) | CC BY 4.0 | Hugging Face, Kjarni, transformers |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 124,6 M | 512 tokens | Clasificacion de sentimiento (3 clases, ingles) | CC BY 4.0 | Hugging Face, transformers |
| cardiffnlp/twitter-roberta-base-sentiment (version anterior) | 124,6 M | 512 tokens | Clasificacion de sentimiento (3 clases, ingles) | CC BY 4.0 | Hugging Face, transformers |

La diferencia entre este repositorio y el original de Cardiff NLP es exclusivamente de empaquetado y formato de pesos (safetensors frente a `pytorch_model.bin`), no de rendimiento. No se dispone de datos de benchmarks para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- Entrenado sobre texto de Twitter en inglés: el rendimiento puede degradarse en dominios formales, textos largos o registros distintos al de redes sociales.
- Solo admite inglés; no es multilingüe.
- Ventana de contexto de 512 tokens: no apto para documentos largos sin troceado previo.
- Riesgo de clasificaciones erróneas en textos ambiguos, sarcasmo o ironía, limitación inherente a los clasificadores de sentimiento de este tamaño.
- Posibles sesgos heredados del corpus de tuits de 2018-2021, tanto demográficos como de vocabulario y temas.
- Licencia CC BY 4.0: permite uso comercial con atribución a Cardiff NLP y a los autores del empaquetado; es obligatorio conservar la atribución.
- El repositorio no está afiliado ni respaldado por Cardiff NLP ni por la Universidad de Cardiff.
- El modelo es un clasificador, no un generador: no debe usarse para tareas de generación, razonamiento o tool calling.
- La librería Kjarni es necesaria para el flujo nativo documentado; fuera de ella, usar transformers con los ficheros incluidos.
- No se documentan cuantizaciones oficiales; el uso en formatos GGUF u otros requeriría conversión propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kjarni-ai/twitter-roberta-base-sentiment-latest
- Modelo original: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- Kjarni (documentación e instalación): https://kjarni.ai
- TweetEval (benchmark): https://github.com/cardiffnlp/tweeteval
- TimeLMs: https://github.com/cardiffnlp/timelms
- TweetNLP: https://tweetnlp.org
- Transformers: https://github.com/huggingface/transformers
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper TweetNLP (EMNLP 2022): https://aclanthology.org/2022.emnlp-demos.5
