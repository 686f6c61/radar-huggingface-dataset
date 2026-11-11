# Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA

## Resumen

TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA es un adaptador LoRA (PEFT) sobre el modelo meta-llama/Llama-3.2-1B-Instruct, desarrollado por Kamyar Zeinalipour y colaboradores (Neda Jamshidi, Fahimeh Akbari, Monica Bianchini, Marco Maggini y Marco Gori) en el contexto del benchmark TalkFa. Su tarea es la clasificación de sentimiento (negativo, neutro o positivo) de diálogos teatrales en farsi (persa), concretamente sobre el split PlayDial-Fa del benchmark TalkFa, un conjunto de datos verificado humanamente para la generación y comprensión de diálogos en farsi.

El adaptador se entrena sobre 1.867 diálogos del split de entrenamiento de PlayDial-Fa y se evalúa sobre 104 diálogos de test. No se trata de un modelo de propósito general, sino de un ajuste fino especializado que convierte un modelo generativo de 1B parámetros en un clasificador de sentimiento mediante prompting de chat. La relevancia actual radica en que cubre un nicho poco atendido, el procesamiento de lenguaje natural en farsi, con un modelo pequeño y desplegable en hardware modesto.

El modelo base Llama-3.2-1B-Instruct es un transformer decoder-only de aproximadamente 1.000 millones de parámetros, desarrollado por Meta, con licencia Llama 3.2 y disponible en formato safetensors. El adaptador se distribuye como pesos PEFT en safetensors (tamaño del repositorio: 1,1 GB) y requiere aceptar los términos del modelo base, que está restringido (gated) en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 1.000 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama-3.2-1B-Instruct soporta contexto largo, pero el valor exacto no se cita en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Farsi (persa, `fa`) |
| Licencia | llama3.2 (derivado de Llama-3.2-1B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama-3.2-1B-Instruct, un transformer decoder-only autorregresivo de Meta. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) con la librería PEFT, lo que permite entrenar un subconjunto reducido de parámetros sin modificar los pesos del modelo base. La inferencia se plantea fusionando el adaptador con `merge_and_unload()` y generando texto con un prompt de chat que incluye los turnos del diálogo; la etiqueta de sentimiento se extrae de la respuesta generada.

El entrenamiento utiliza el split de train de PlayDial-Fa (1.867 diálogos) del benchmark TalkFa, un conjunto verificado humanamente para la generación y comprensión de diálogos en farsi. Los hiperparámetros de entrenamiento están en `configs/train_sentiment.json` del repositorio GitHub del proyecto. No se especifican en la model card el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO; el ajuste se limita a la tarea de clasificación de sentimiento mediante supervisión sobre el dataset citado.

## Capacidades

- Clasificación de sentimiento en farsi: asigna a un diálogo teatral una de tres etiquetas (negativo, neutro, positivo) mediante generación de texto.
- Generación de texto en formato conversacional: hereda la capacidad de chat del modelo base Llama-3.2-1B-Instruct.
- Comprensión de diálogos multi-turno: procesa secuencias de mensajes con roles (`role`/`content`) mediante la plantilla de chat de Llama.
- Procesamiento de lenguaje en farsi (persa): especializado en el dominio de diálogos teatrales (PlayDial-Fa).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode) para este adaptador.
- Capacidades multilingües: limitadas al farsi según la model card; no se documenta soporte de otros idiomas.

## Casos de uso

- Análisis de sentimiento en obras de teatro y guiones en farsi: el adaptador clasifica cada diálogo como negativo, neutro o positivo, lo que permite estudiar la evolución emocional de personajes y escenas en corpus teatrales persas.
- Investigación en PLN para farsi: sirve como línea base reproducible para experimentos de clasificación de sentimiento en un idioma con recursos limitados, con código de evaluación disponible en el repositorio GitHub del proyecto.
- Etiquetado asistido de corpus de diálogo: puede pre-anotar grandes colecciones de diálogos en farsi para su posterior revisión humana, reduciendo el coste de anotación manual.
- Análisis de arcos narrativos: al clasificar diálogos consecutivos, permite trazar la curva de sentimiento de una obra y detectar puntos de giro dramáticos.
- Evaluación comparativa de adaptadores: al formar parte de una familia de adaptadores TalkFa sobre distintos modelos base (1B, 3B, 7B, 8B, 12B, 24B), permite comparar el rendimiento de clasificación de sentimiento según el tamaño del modelo base en un mismo dataset.
- Docencia y demostraciones: por su tamaño reducido (1B parámetros), es adecuado para entornos educativos donde se quiera ilustrar el ajuste fino con LoRA sobre un modelo generativo para una tarea de clasificación en un idioma específico.

## Benchmarks y rendimiento

Resultados en el conjunto de test de PlayDial-Fa (104 diálogos). Una respuesta se considera correcta cuando nombra exactamente la etiqueta de referencia. Métricas macro:

| Metrica (macro) | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| Precision | 0,16 | 0,33 | +0,17 |
| Recall | 0,33 | 0,34 | +0,01 |
| F1 | 0,21 | 0,23 | +0,02 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1B parámetros en bfloat16 requiere aproximadamente 2 GB de VRAM para los pesos, más memoria para el contexto y el adaptador; en cuantización de 8 bits o 4 bits el requisito sería menor, aunque no se documentan cuantizaciones específicas en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, el modelo de 1B parámetros es desplegable en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; también puede ejecutarse en CPU con cuantización, aunque no se documentan los formatos GGUF para este adaptador.
- Opciones de despliegue: la model card proporciona código de inferencia con `transformers` y `peft` (con `merge_and_unload()`); no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

El proyecto TalkFa publica adaptadores de clasificación de sentimiento sobre varios modelos base con el mismo dataset PlayDial-Fa. La comparación directa disponible es la siguiente:

| Modelo base | Parametros | Adaptador de sentimiento PlayDial-Fa | Licencia |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA (este modelo) | llama3.2 |
| Llama-3.2-3B-Instruct | 3B | TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA | llama3.2 |
| Mistral-7B-Instruct-v0.3 | 7B | TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA | no disponible en la informacion |
| Llama-3.1-8B-Instruct | 8B | TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA | llama3.1 |
| Mistral-Nemo-Instruct-2407 | 12B | TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA | no disponible en la informacion |
| Mistral-Small-24B-Instruct-2501 | 24B | TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA | no disponible en la informacion |

No se proporcionan en la información disponible los resultados de los demás adaptadores en PlayDial-Fa, por lo que no es posible comparar el rendimiento entre ellos. Tampoco se dispone de datos de modelos alternativos de clasificación de sentimiento en farsi ajenos a la familia TalkFa.

## Limitaciones y advertencias

- Rendimiento modesto: el F1 macro en test es de 0,23, con una precisión de 0,33 y un recall de 0,34; el adaptador mejora al modelo base pero sigue lejos de un clasificador fiable para producción.
- Dominio restringido: entrenado exclusivamente sobre diálogos teatrales en farsi (PlayDial-Fa), por lo que su generalización a otros registros (redes sociales, prensa, conversación coloquial) no está documentada.
- Sesgos conocidos: no se documentan en la información disponible; al derivar de Llama-3.2-1B-Instruct, puede heredar sesgos del modelo base y del corpus teatral empleado.
- Riesgo de alucinación: al formularse como generación de texto, el modelo puede producir respuestas que no nombren exactamente la etiqueta de referencia, lo que se contabiliza como error en la evaluación.
- Limitaciones de idioma: solo se declara soporte de farsi (`fa`); no se documenta su comportamiento en otros idiomas.
- Restricciones de licencia: la licencia es llama3.2, derivada de Llama-3.2-1B-Instruct; el uso comercial está sujeto a los términos de la licencia Llama 3.2 de Meta, y el modelo base está restringido (gated) en Hugging Face, requiriendo aceptar sus términos e iniciar sesión con `huggingface-cli login`.
- Caveat para producción: el tamaño del conjunto de test (104 diálogos) es reducido, por lo que las métricas tienen alta varianza; además, no se documentan cuantizaciones ni despliegue con servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Colección TalkFa en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuración de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_sentiment.json
- Adaptador hermano (Llama-3.2-3B-Instruct, sentimiento): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA
- Adaptador hermano (Mistral-7B-Instruct-v0.3, sentimiento): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA
- Adaptador hermano (Llama-3.1-8B-Instruct, sentimiento): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA
- Adaptador hermano (Mistral-Nemo-Instruct-2407, sentimiento): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA
- Adaptador hermano (Mistral-Small-24B-Instruct-2501, sentimiento): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA
