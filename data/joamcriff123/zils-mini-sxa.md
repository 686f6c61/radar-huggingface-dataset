# joamCriff123/zils-mini-sxa

## Resumen

zils-mini-sxa es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un fine-tuning LoRA sobre Qwen/Qwen3.5-4B. Forma parte de la familia d3-mini del autor y está pensado para el "mini pool" de la subnet 127 de Zils, un entorno de evaluación de decisiones con formato de examen. El modelo no se distribuye como un asistente conversacional general, sino como un cuerpo de decisión afinado para responder ítems de opción múltiple y tareas de clasificación y razonamiento breve.

Con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en safetensors, el modelo hereda la arquitectura y el tokenizador de la familia Qwen3.5. Su relevancia es acotada: se trata de un artefacto experimental de una comunidad pequeña, con cero descargas y cero likes en el momento de la ficha, y sin model card extendida más allá de la descripción del proceso de entrenamiento. No obstante, resulta interesante como ejemplo de pipeline de destilación de datos sintéticos y de mezcla (soup) de adaptadores LoRA para tareas de decisión.

La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque el autor remite a los ficheros LICENSE y NOTICE para las atribuciones de los modelos upstream. No se declaran idiomas soportados ni se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con pesos en safetensors y código personalizado (`custom_code`) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño de repo 9,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y se obtiene mediante fine-tuning LoRA. Según la model card, el punto de partida es joamCriff123/zils-mini-sx3, descrito como el "soup" actual de d3-mini, que a su vez es la media uniforme de qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1 más la media de tres ejecuciones LoRA del propio autor. Sobre ese punto de partida se añade la media de seis ejecuciones LoRA adicionales con rango 32, learning rate 5e-5 y una época.

Los datos de entrenamiento son ítems en formato de examen generados por OpenAI Codex reescribiendo filas de splits públicos de entrenamiento: Social IQa, PIQA, SVAMP, MultiArith, GLUE (MNLI, RTE, QNLI), el split de validación de cxc-sts, 20 Newsgroups, Glaive function calling v2, dair-ai/emotion, titulares de noticias sarcásticas y TweetEval sentiment, además de tareas de entrenamiento de BIG-bench. Cada respuesta fue verificada a ciegas por una segunda pasada de Codex. A esto se suman filas de replay cuyos objetivos son las predicciones del soup anterior sobre ítems en formato de examen (generadas con Codex, DeepSeek y Gemini), conversiones de splits públicos de entrenamiento, ítems sintéticos de conteo y los exámenes semilla públicos de Zils v1 y v4.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de datos: destilación iterativa de predicciones del propio modelo (replay), verificación cruzada con un segundo modelo y mezcla de adaptadores LoRA. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento explícitos.

## Capacidades

- Respuesta a ítems en formato de examen, presumiblemente de opción múltiple y de respuesta corta, dado el origen de los datos (Social IQa, PIQA, MultiArith, GLUE).
- Razonamiento de sentido común y social (Social IQa) y razonamiento físico cotidiano (PIQA).
- Aritmética elemental y problemas de enunciado (SVAMP, MultiArith) e ítems sintéticos de conteo.
- Clasificación de texto: inferencia textual (MNLI, RTE, QNLI), similitud semántica (cxc-sts), clasificación temática (20 Newsgroups), emoción (dair-ai/emotion), sarcasmo y sentimiento (TweetEval).
- Function calling, por la inclusión de Glaive function calling v2 en el entrenamiento; no se detalla el formato exacto de herramientas soportado.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- No se documentan capacidades de visión, audio, tool calling en producción ni modo de razonamiento extendido más allá de lo implícito en el formato de examen.

## Casos de uso

- Evaluación comparativa de modelos de decisión en la subnet 127 de Zils: el modelo está diseñado específicamente para el mini pool de esa subnet, por lo que su uso natural es participar en los exámenes y compararse con otros cuerpos d3-mini.
- Clasificación de texto en pipelines de investigación: al haber sido afinado sobre MNLI, RTE, QNLI, 20 Newsgroups, emoción y sentimiento, puede emplearse como clasificador de referencia en experimentos de evaluación rápida, siempre validando contra el conjunto de test real.
- Razonamiento de sentido común para filtrado de respuestas: útil en tareas de selección entre candidatos (PIQA, Social IQa) donde se requiere puntuar plausibilidad de una opción frente a otra.
- Resolución de problemas aritméticos de enunciado corto: adecuado para prototipos de tutoring o corrección automática de ejercicios elementales (SVAMP, MultiArith), con verificación posterior obligatoria.
- Generación de datos sintéticos de evaluación: el pipeline descrito (reescritura de filas públicas con un LLM y verificación cruzada) puede replicarse usando este modelo como generador o como verificador en un bucle de destilación.
- Experimentación con mezcla de adaptadores LoRA: el modelo sirve como caso de estudio reproducible de "soup" de LoRA con rango 32 y una época, útil para investigadores que quieran comparar estrategias de merging.
- Function calling en prototipos: por la presencia de Glaive v2 en el entrenamiento, puede probarse en tareas de selección de función y extracción de argumentos, aunque sin garantías de robustez en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 5 GB de pesos, viable en GPUs de 8 GB con contexto corto.
- Cuantización a 4 bits: alrededor de 2,5-3 GB de pesos, viable en GPUs consumer de 6-8 GB; no se publican ficheros GGUF en el repo, por lo que habría que generarlos.
- GPUs recomendadas: A100 40/80 GB o H100 para servir en fp16 con concurrencia; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090/4080 (16-24 GB) para fp16 o 8 bits; RTX 3060 12 GB para 8 bits o 4 bits.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más usando cuantización; en fp16 requiere al menos 12 GB.
- Opciones de despliegue: transformers (librería declarada), con código personalizado (`custom_code`), lo que puede requerir `trust_remote_code=True`. vLLM, TGI, llama.cpp y Ollama no están confirmados; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-sxa | 4,54 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning LoRA de Qwen3.5-4B para decisiones |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva; capacidades generales |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | Apache-2.0 | Hugging Face | Punto de partida (soup) del que se afina sxa |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Hugging Face | Componente del soup upstream |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Hugging Face | Componente del soup upstream |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de nicho: cero descargas y cero likes en el momento de la ficha, sin validación externa conocida.
- No se declaran idiomas soportados; el entrenamiento se basa en datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación y de sobreajuste al formato de examen: el entrenamiento con ítems reescritos por LLM y con objetivos de replay del propio modelo puede producir respuestas que imitan el formato sin fundamento real.
- Sesgos heredados de los datasets de origen (Social IQa, TweetEval, 20 Newsgroups, titulares sarcásticos) y del modelo base Qwen3.5-4B; no se documenta ninguna mitigación.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE para atribuciones de modelos upstream; conviene revisar esos ficheros antes de redistribuir.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- No se publican ficheros GGUF ni cuantizaciones listas para usar; el despliegue en CPU o en GPUs pequeñas requiere conversión propia.
- No apto como asistente conversacional general: el pipeline declarado es `feature-extraction` y el propósito es la decisión en formato de examen, no el diálogo abierto.
- Sin información sobre longitud de contexto efectiva, latencia o throughput, lo que impide garantizar comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-sxa
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Punto de partida (soup): https://huggingface.co/joamCriff123/zils-mini-sx3
- Componente upstream: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Componente upstream: https://huggingface.co/Charlie320/zils-mini-s1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
