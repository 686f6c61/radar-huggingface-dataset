# Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA

## Resumen

TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA es un adaptador LoRA de tipo PEFT que especializa el modelo base Mistral-Small-24B-Instruct-2501 en la clasificación de sentimiento (negativo, neutro, positivo) de diálogos teatrales en farsi. Lo desarrolla Kamyar Zeinalipour y forma parte del conjunto de adaptadores publicados junto al benchmark TalkFa, un corpus verificado por anotadores humanos para la generación y comprensión de diálogos en farsi. El adaptador se entrenó sobre el split de entrenamiento de PlayDial-Fa, compuesto por 1.867 diálogos, y se evalúa sobre 104 diálogos de test.

El modelo no es un LLM independiente: es un delta de pesos que debe fusionarse con el modelo base de Mistral AI (24.000 millones de parámetros, licencia Apache 2.0 en el adaptador, pero con acceso restringido en el modelo base). Su relevancia radica en que aborda una tarea y un idioma poco cubiertos por los modelos generalistas: el análisis de sentimiento sobre diálogo teatral persa, donde el contexto conversacional y el registro literario complican la clasificación respecto a reseñas o tuits.

El adaptador ocupa 3,1 GB en el repositorio y se distribuye en formato safetensors compatible con la librería PEFT. La mejora reportada frente al modelo base es modesta pero consistente en las tres métricas macro: +0,02 de precisión, +0,08 de recall y +0,09 de F1 sobre el conjunto de test de PlayDial-Fa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Small-24B-Instruct-2501) con adaptador LoRA (PEFT) |
| Parametros totales | 24B en el modelo base; tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | farsi (fa) |
| Licencia | Apache 2.0 (adaptador); el modelo base esta sujeto a sus propios terminos y es de acceso restringido |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24.000 millones de parámetros. El entrenamiento se realizó mediante LoRA sobre el split de entrenamiento de PlayDial-Fa (1.867 diálogos teatrales en farsi), con el objetivo de que el modelo, dado un diálogo, emita exactamente la etiqueta de sentimiento (negativo, neutro o positivo). La evaluación considera correcta una respuesta únicamente cuando nombra la etiqueta dorada exacta, lo que exige al modelo ceñirse al formato y no improvisar.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF o DPO. La configuración de entrenamiento está publicada en el repositorio de GitHub del proyecto (archivo `configs/train_sentiment.json`), pero sus valores no se detallan en la model card. El adaptador se distribuye como delta PEFT y puede fusionarse con el modelo base mediante `merge_and_unload()` para obtener un modelo único.

## Capacidades

- Clasificación de sentimiento en farsi sobre diálogos teatrales, con tres clases: negativo, neutro y positivo.
- Comprensión de contexto conversacional multi-turno, al heredar la ventana de contexto del modelo base.
- Generación de texto en farsi dentro de la tarea de clasificación (la salida es una etiqueta en lenguaje natural).
- Capacidad de razonamiento y generación general del modelo base (no específicamente potenciada por el adaptador).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico para este adaptador.
- No se documenta soporte de visión, audio ni modo de razonamiento extendido (thinking mode).
- El adaptador está especializado en un único dominio (diálogo teatral) y un único idioma (farsi); su uso fuera de ese ámbito no está validado.

## Casos de uso

- Análisis de sentimiento en obras de teatro persas: el adaptador clasifica cada diálogo de una obra como negativo, neutro o positivo, permitiendo construir arcos emocionales por escena y por personaje. Es adecuado porque se entrenó específicamente sobre el corpus PlayDial-Fa, con su registro literario y sus convenciones dramáticas.
- Investigación en procesamiento de lenguaje natural para farsi: sirve como línea base especializada para comparar con modelos generalistas en tareas de comprensión de diálogo persa, dado que el benchmark TalkFa es público y verificable.
- Etiquetado asistido de corpus dramáticos: un equipo que digitalice teatro persa puede usar el adaptador para pre-anotar sentimiento y reducir el coste de anotación humana, revisando después las etiquetas con anotadores.
- Análisis de recepción y crítica teatral: combinado con un pipeline de extracción de diálogos de reseñas o guiones, permite medir la carga emocional de fragmentos citados en críticas.
- Docencia e investigación lingüística: estudiar cómo varía el sentimiento en el diálogo teatral persa a lo largo de una obra o entre autores, usando el adaptador como clasificador reproducible.
- Prototipado de sistemas de análisis conversacional en farsi: aunque entrenado en teatro, el adaptador puede servir como punto de partida (con validación adicional) para clasificar diálogos en otros géneros conversacionales persas.
- Integración en pipelines de humanidades digitales: procesar corpus de teatro persa a escala con inferencia por lotes sobre GPU, fusionando el adaptador con el modelo base una sola vez.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de PlayDial-Fa (104 diálogos). Una respuesta se considera correcta solo si nombra exactamente la etiqueta dorada. Métricas macro:

| Metrica (macro) | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| Precision | 0,63 | 0,65 | +0,02 |
| Recall | 0,52 | 0,60 | +0,08 |
| F1 | 0,53 | 0,62 | +0,09 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 3,1 GB, pero requiere cargar el modelo base de 24B parámetros para inferencia.
- En bfloat16, el modelo base de 24B ocupa aproximadamente 48 GB de VRAM, por lo que no cabe en GPU de consumo de 24 GB sin cuantización.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2×RTX 4090 de 24 GB con `device_map="auto"` y descarga por capas).
- Con cuantización de 4 bits, el modelo base puede caber en una RTX 4090 (24 GB) o RTX 3090, aunque la calidad puede degradarse; no se documentan resultados con cuantización para este adaptador.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card), vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo al formato correspondiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El modelo base está restringido: es necesario aceptar sus términos en Hugging Face y ejecutar `huggingface-cli login` antes de la descarga.

## Comparativa con modelos similares

El proyecto TalkFa publica adaptadores equivalentes sobre varios modelos base, lo que permite comparar directamente dentro de la misma familia y tarea. Todos usan el mismo dataset (PlayDial-Fa) y la misma metodología LoRA; los resultados de cada variante no se detallan en la información disponible salvo para el modelo de 24B.

| Modelo base | Parametros | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|
| Mistral-Small-24B-Instruct-2501 (este adaptador) | 24B | Sentimiento PlayDial-Fa | Apache 2.0 (adaptador); base restringido | Hugging Face (adaptador público) |
| Llama-3.2-1B-Instruct | 1B | Sentimiento PlayDial-Fa | Licencia Llama (base) | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | Sentimiento PlayDial-Fa | Licencia Llama (base) | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7B | Sentimiento PlayDial-Fa | Apache 2.0 (base) | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | Sentimiento PlayDial-Fa | Licencia Llama (base) | Hugging Face |
| Mistral-Nemo-Instruct-2407 | 12B | Sentimiento PlayDial-Fa | Apache 2.0 (base) | Hugging Face |

No se dispone de resultados comparativos de rendimiento entre estas variantes en la información proporcionada; solo se reportan las métricas del adaptador de 24B frente a su propio modelo base.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre diálogo teatral en farsi; su rendimiento en otros dominios (redes sociales, atención al cliente, prensa) o en otros idiomas no está validado.
- El F1 macro de 0,62 sobre el test de PlayDial-Fa indica un margen de error considerable: aproximadamente un 38% de las respuestas no coinciden con la etiqueta dorada en la métrica combinada.
- El recall (0,60) sigue siendo bajo en términos absolutos, lo que sugiere que el modelo puede omitir o clasificar mal clases minoritarias.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto libre en lugar de la etiqueta exacta, lo que cuenta como error en la evaluación; en producción conviene validar y parsear la salida.
- El modelo base es de acceso restringido y requiere aceptar términos; esto condiciona la reproducibilidad y el despliegue automatizado.
- La licencia Apache 2.0 cubre el adaptador, pero el uso comercial del modelo fusionado queda sujeto a los términos del modelo base de Mistral AI, que deben revisarse por separado.
- No hay información sobre sesgos específicos del adaptador; hereda los sesgos del modelo base y del corpus teatral persa, que puede sobrerrepresentar ciertos registros y épocas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del adaptador.
- El tamaño del adaptador (3,1 GB) y la necesidad de cargar un modelo de 24B hacen que el coste de inferencia sea alto para una tarea de clasificación que podría resolverse con modelos mucho más pequeños.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Colección TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuración de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_sentiment.json
- Adaptador hermano para generación (Wiki-FaDial, mismo base): https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA
