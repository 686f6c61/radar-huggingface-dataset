# Cmr237/Camfranglais

## Resumen

Camfranglais es un ajuste fino del modelo Mistral-Nemo-Instruct-2407 (12B parámetros) especializado en camfranglais, el argot urbano camerunés que mezcla francés, inglés y pidgin. Lo desarrolla Cmr237 junto con un equipo de tres colaboradores (Daryl B., Schadrac y William Pancha), y resuelve un problema concreto: los modelos multilingües generalistas tienen un rendimiento muy pobre en registros lingüísticos de bajos recursos como este, por lo que el modelo busca tanto comprender como generar respuestas en camfranglais de forma natural.

El entrenamiento sigue una estrategia híbrida en dos fases sobre el modelo base: primero un preentrenamiento continuado (CPT) con 14.302 textos en camfranglais para asimilar vocabulario y giros idiomáticos, y después un ajuste supervisado (SFT) sobre 1.080 diálogos conversacionales. Todo se hizo con QLoRA mediante Unsloth en GPUs NVIDIA L4, con adaptadores LoRA de 114M de parámetros entrenables.

Es relevante porque demuestra que con presupuestos de cómputo modestos y corpus pequeños pero curados se puede adaptar un modelo de 12B a una variedad lingüística que los grandes modelos ignoran. El repositorio incluye tanto los adaptadores LoRA en safetensors como cuatro cuantizaciones GGUF listas para llama.cpp y Ollama, lo que facilita su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Nemo), ajuste fino con QLoRA |
| Parametros totales | 12.247.782.400 (12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso fija max_seq_length a 2048) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); adaptadores LoRA en bfloat16 |
| Idiomas soportados | fr, en (con capacidad declarada en camfranglais) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B parámetros con atención por ventanas deslizantes y RoPE, y se adapta mediante QLoRA con Unsloth en bfloat16 sobre GPUs NVIDIA L4. La configuración LoRA emplea r = 32, lora_alpha = 32 y use_rslora = True, lo que da 114M de parámetros entrenables. El entrenamiento se divide en dos fases: una de preentrenamiento continuado sobre 14.302 textos en camfranglais del corpus camfranglais-corpus-cpt, con packing activado y tasa de aprendizaje 1e-4, y otra de ajuste supervisado sobre 1.080 diálogos del corpus camfranglais-corpus-sft, usando la plantilla Mistral (`[INST] ... [/INST]`) y calculando la pérdida solo sobre las respuestas del asistente con tasa de aprendizaje 5e-5.

No se documenta en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de los recuentos de textos y diálogos. Tampoco se indica si hubo RLHF o DPO; el proceso descrito es exclusivamente CPT seguido de SFT. La innovación técnica principal es el enfoque de adaptación de bajo coste a una variedad lingüística de bajos recursos, con evaluación explícita de la adherencia al registro camfranglais.

## Capacidades

- Generación de texto conversacional en camfranglais, francés e inglés, con mezcla natural de las tres lenguas.
- Comprensión de argot urbano camerunés y expresiones coloquiales del registro camfranglais.
- Conversación multi-turno siguiendo la plantilla de chat de Mistral.
- Ajuste de estilo mediante prompt de sistema (por ejemplo, "tu réponds uniquement en camfranglais").
- Capacidades heredadas del modelo base Mistral-Nemo (razonamiento y código), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Atención al cliente en Camerún: el modelo puede gestionar conversaciones con usuarios que escriben en camfranglais, un registro que los asistentes generalistas no cubren, manteniendo el tono coloquial adecuado.
- Moderación y análisis de contenido en redes sociales: permite interpretar publicaciones y comentarios en camfranglais para tareas de clasificación o detección de contenido, gracias a la fase de CPT que asimila el vocabulario del registro.
- Traducción informal camfranglais-francés/inglés: útil para herramientas de comunicación interna en empresas camerunesas que operan con equipos multilingües.
- Generación de contenido para medios locales: redacción de textos con registro urbano camerunés para blogs, guiones o publicaciones, con control de estilo mediante prompt de sistema.
- Investigación lingüística: estudio de variedades de contacto lingüístico y evaluación de la capacidad de modelos de 12B para adaptarse a registros de bajos recursos con corpus pequeños.
- Chatbots de comunidad y soporte en plataformas locales: despliegue ligero con la cuantización Q4_K_M (~7,5 GB) en hardware modesto mediante Ollama o llama.cpp.
- Prototipado de asistentes conversacionales regionales: el formato GGUF y el Modelfile incluido permiten iterar rápidamente sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de 120 diálogos:

| Metrica | Valor |
|---|---|
| Eval Loss | 3,1847 |
| Perplejidad | 24,16 |
| Score de adherencia a camfranglais (modelo / humano) | 0,1435 / 0,1731 |
| Tasa de respuestas con marcadores de camfranglais | 73,3 % |
| Similitud coseno media (modelo / pregunta) | 0,3968 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,5 GB con Q4_K_M, ~8,7 GB con Q5_K_M, ~10 GB con Q6_K y ~13 GB con Q8_0.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), así como A100, H100 o RTX 4090 para la versión sin cuantizar o para mayor throughput.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M y Q5_K_M en tarjetas de 8-12 GB (RTX 3060, 4060, 4070); Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/Cmr237/Camfranglais:Q5_K_M`), llama.cpp (`llama-cli -hf Cmr237/Camfranglais:Q5_K_M --jinja`), y Unsloth/Transformers para cargar los adaptadores LoRA en GPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Camfranglais (este modelo) | 12B | no disponible | Camfranglais (argot camerunes) | MIT | Hugging Face, GGUF, Ollama |
| Mistral-Nemo-Instruct-2407 (base) | 12B | no disponible | Instrucciones generales multilingues | Apache 2.0 | Hugging Face |
| Mistral 7B Instruct | 7B | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos especializados en otras variedades lingüísticas africanas en la información proporcionada.

## Limitaciones y advertencias

- El corpus de entrenamiento es pequeño (14.302 textos y 1.080 diálogos), lo que limita la cobertura del registro y aumenta el riesgo de sobreajuste.
- La adherencia a camfranglais del modelo (0,1435) queda por debajo de la humana (0,1731) según la métrica del autor, lo que indica margen de mejora en naturalidad.
- La similitud coseno media con la pregunta es de 0,3968, un valor bajo que sugiere respuestas no siempre alineadas con la consulta.
- Riesgo de alucinación y de mezcla indebida de registros lingüísticos, especialmente fuera del dominio conversacional.
- El ajuste puede haber degradado capacidades del modelo base (razonamiento, código, tool calling), que no se evalúan en la model card.
- Los idiomas declarados oficialmente son fr y en; el camfranglais no figura como idioma oficial en los metadatos.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base Mistral-Nemo (Apache 2.0) y de los datasets empleados.
- No hay información sobre sesgos específicos ni sobre evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cmr237/Camfranglais
- Repositorio GitHub del proyecto: https://github.com/darylbdr/CameroonianLLM
- Dataset CPT: https://huggingface.co/datasets/Cmr237/camfranglais-corpus-cpt
- Dataset SFT: https://huggingface.co/datasets/Cmr237/camfranglais-corpus-sft
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Unsloth: https://github.com/unslothai/unsloth
