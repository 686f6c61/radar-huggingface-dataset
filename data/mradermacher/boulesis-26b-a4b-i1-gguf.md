# mradermacher/Boulesis-26B-A4B-i1-GGUF

## Resumen

Boulesis-26B-A4B-i1-GGUF es un conjunto de cuantizaciones GGUF, con y sin imatrix, del modelo Boulesis-26B-A4B publicado por SubMaroon. El trabajo de cuantización lo firma mradermacher, un perfil habitual en la comunidad de GGUF, y está pensado para ejecutar el modelo en llama.cpp y entornos compatibles (Ollama, LM Studio, etc.). El modelo base es un merge orientado a roleplay y conversación, con etiquetas que declaran arquitectura MoE, origen Gemma 4, modo thinking y un proceso de "abliteración"/heretic para reducir rechazos.

El interés práctico está en que empaqueta un modelo de unos 26.000 millones de parámetros totales en ficheros desde 8,6 GB (IQ1_S) hasta 23,3 GB (Q6_K), lo que permite desplegarlo en GPU de consumo con cuantizaciones medias. La licencia declarada es Apache 2.0 y el único idioma declarado es inglés. No se publican en la información disponible detalles sobre contexto, número de parámetros activos ni datos de entrenamiento del modelo base.

La ficha se centra en lo que sí está documentado: el inventario de cuantizaciones, los tamaños reales de cada fichero, el número de parámetros del safetensors original y las advertencias de calidad que el propio autor de las cuantizaciones incluye en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según etiquetas del autor); detalles de capas y atención no disponibles |
| Parametros totales | 25.971.339.550 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además fichero imatrix |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |
| Tamano del repo | 308,9 GB |
| Cuantizacion mas pequena | i1-IQ1_S, 8,6 GB |
| Cuantizacion mas grande | i1-Q6_K, 23,3 GB |
| Cuantizacion recomendada por el autor | i1-Q4_K_M (17,3 GB, "fast, recommended") |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que el modelo base se etiqueta como MoE y con origen Gemma 4, y que es un merge. No se documentan el número de expertos, la proporción de parámetros activos, la dimensión oculta, el número de capas ni el mecanismo de atención. Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO o similar.

Lo que sí está documentado es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con fichero imatrix (marcadas como i1), partiendo de una conversión HF y usando un vocabulario propio. La model card indica que las cuantizaciones i1 con imatrix suelen ofrecer mejor calidad que las estáticas de tamaño equivalente, y remite a las cuantizaciones estáticas publicadas en un repositorio paralelo (Boulesis-26B-A4B-GGUF). Las etiquetas "heretic" y "uncensored" sugieren un post-procesado orientado a reducir comportamientos de rechazo, pero no se aporta metodología ni métricas de dicho proceso.

## Capacidades

- Generación de texto conversacional orientada a roleplay, según las etiquetas del autor (roleplay, sillytavern).
- Modo thinking / razonamiento: las etiquetas incluyen "thinking" y "reasoning", aunque no se detalla el formato de los tokens de pensamiento ni cómo activarlo.
- Comportamiento "uncensored" declarado por el autor, con reducción esperada de rechazos; sin evaluación publicada.
- Conversación multi-turno en formato chat, compatible con frontends tipo SillyTavern.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Roleplay y ficción interactiva: el modelo está etiquetado explícitamente para roleplay y SillyTavern, por lo que encaja en frontends de chat con personajes, historial largo y system prompts extensos. La cuantización Q4_K_M (17,3 GB) permite mantener el modelo residente en una GPU de 24 GB.
- Generación creativa asistida en local: escritura de narrativa y diálogos sin dependencia de API, usando llama.cpp u Ollama sobre una estación de trabajo con GPU consumer.
- Prototipado de agentes conversacionales con contenido sensible: al declararse "uncensored", puede servir para investigación sobre filtrado, seguridad y comportamiento de modelos, siempre con revisión humana.
- Evaluación de cuantizaciones: el repositorio ofrece 23 variantes de cuantización del mismo modelo, lo que permite medir el impacto de la compresión en perplejidad y calidad conversacional con un protocolo controlado.
- Despliegue en hardware modesto: la variante i1-IQ2_M (10,8 GB) o i1-IQ3_S (12,6 GB) permite ejecutar el modelo en GPUs de 12-16 GB, a costa de calidad.
- Experimentación con modos de razonamiento: útil para comparar respuestas con y sin modo thinking en tareas de razonamiento cotidiano, aunque sin benchmarks publicados que garanticen el rendimiento.
- Base para ajuste fino ligero: al ser Apache 2.0, se puede partir de él para LoRAs sobre el modelo base, siempre que se respeten las condiciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de perplejidad para las distintas cuantizaciones; solo remite a gráficas externas de comparación genérica entre tipos de cuantización (ikawrakow y Artefact2), que no son específicas de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más un margen para contexto y caché KV. Con i1-Q4_K_M (17,3 GB) se necesitan unos 20-22 GB en total para contexto moderado; con i1-Q6_K (23,3 GB) se superan los 24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K y contextos largos; RTX 4080/4070 Ti Super (16 GB) para IQ3_S/IQ4_XS con contexto recortado.
- Cabe en GPU consumer: sí, desde IQ2_M (10,8 GB) en GPUs de 12 GB, hasta Q4_K_M en 24 GB. Las variantes IQ1 (8,6-9,0 GB) caben en 10-12 GB pero el propio autor las marca como "for the desperate".
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI, que trabajan con safetensors.
- Latencia y throughput: no disponibles. Al ser MoE, se espera un throughput superior al de un denso de 26B, pero no hay mediciones publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Boulesis-26B-A4B-i1-GGUF (este) | 25,97B totales, activos no disponibles | no disponible | Apache 2.0 | GGUF | Merge MoE orientado a roleplay, 23 cuantizaciones |
| Boulesis-26B-A4B (base, SubMaroon) | 25,97B totales | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Boulesis-26B-A4B-GGUF (mradermacher) | 25,97B totales | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo |

No se dispone de información sobre modelos comparables de otros autores con los que establecer una comparación de rendimiento; no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un merge con etiqueta "uncensored", es esperable una menor alineación de seguridad, pero no hay evaluación publicada.
- Riesgo de alucinación: no cuantificado. Sin benchmarks ni evaluaciones, no hay garantías de fidelidad factual.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano no está verificado y podría degradarse.
- Limitaciones de contexto: la longitud de contexto no está documentada; no se debe asumir una ventana concreta sin probarla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base y de los datos de entrenamiento originales, no documentados aquí.
- Calidad de cuantizaciones extremas: el autor marca IQ1_S e IQ1_M como "for the desperate" y Q2_K_S como "very low quality"; no son aptas para producción.
- El repositorio ocupa 308,9 GB; descargar el conjunto completo no es necesario, pero requiere seleccionar el fichero concreto.
- Es un merge sin model card técnica detallada: no hay información sobre datos de entrenamiento, número de tokens ni metodología de alineación.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Boulesis-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Boulesis-26B-A4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
