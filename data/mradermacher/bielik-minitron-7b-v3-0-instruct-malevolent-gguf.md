# mradermacher/Bielik-Minitron-7B-v3.0-Instruct-Malevolent-GGUF

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-Malevolent-GGUF es la version cuantizada en formato GGUF del modelo Osye/Bielik-Minitron-7B-v3.0-Instruct-Malevolent, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 7.478 millones de parametros, derivado de la familia Bielik (modelo polaco de la empresa SpeakLeash) y ajustado mediante la tecnica Minitron de NVIDIA para reducir su tamano manteniendo capacidades. El sufijo "Malevolent" y las etiquetas de la model card (persona, interpretability, research) indican que se trata de una variante de investigacion orientada a estudiar el comportamiento de una persona concreta, no un modelo de proposito general.

El modelo original esta especializado en polaco (codigo de idioma `pl`) y esta disenado para tareas conversacionales de tipo instruct. La contribucion de esta ficha concreta es el conjunto de cuantizaciones GGUF estaticas (de Q2_K a f16) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

Es relevante para desarrolladores e investigadores que trabajen con modelos en polaco, que quieran estudiar el efecto de la cuantizacion sobre el comportamiento de una persona o que necesiten desplegar un modelo de 7B en local. Su licencia Apache 2.0 facilita el uso comercial, aunque el caracter experimental y de investigacion del modelo original aconseja cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Bielik, no se detalla la arquitectura exacta en la informacion disponible) |
| Parametros totales | 7.478.136.832 (aproximadamente 7,48 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original mas alla de que pertenece a la familia Bielik, basada en transformers decoder-only. El nombre "Minitron" hace referencia a la metodologia de compresion de NVIDIA, que combina pruning estructurado y destilacion de conocimiento para reducir el numero de parametros de un modelo mayor conservando parte de su rendimiento. El modelo base Osye/Bielik-Minitron-7B-v3.0-Instruct-Malevolent aplica presumiblemente esta tecnica sobre un Bielik mayor, seguida de un ajuste instruct y de una personalizacion concreta ("Malevolent") orientada a investigacion sobre personas e interpretabilidad.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Las cuantizaciones de esta ficha son estaticas (no ponderadas ni imatrix), generadas con el flujo habitual de mradermacher a partir de los pesos en formato Hugging Face.

## Capacidades

- Generacion de texto conversacional en polaco, con formato instruct.
- Simulacion de una persona concreta ("Malevolent"), orientada a estudios de interpretabilidad y comportamiento.
- Razonamiento y respuesta a instrucciones dentro del dominio del modelo base.
- Soporte de conversaciones multi-turno (el pipeline declarado es `conversational`).
- Capacidades multilingues limitadas al polaco segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre personas e interpretabilidad: el modelo permite estudiar como una personalidad concreta ("Malevolent") condiciona las respuestas y como la cuantizacion (Q4_K_M frente a Q8_0) afecta a esa persona, comparando salidas entre cuantizaciones.
- Despliegue local en polaco: con cuantizaciones de 4,4-4,6 GB (Q4_K_S, Q4_K_M) puede ejecutarse en una GPU de consumo de 8 GB o en CPU, sirviendo como asistente conversacional en polaco sin conexion.
- Prototipado de chatbots en polaco: integrable en llama.cpp u Ollama para construir demos de atencion al cliente o asistentes internos en ese idioma.
- Evaluacion de cuantizacion: el conjunto de 12 cuantizaciones permite medir la degradacion de calidad (perplejidad, coherencia) entre Q2_K y f16 en un modelo de 7B.
- Educacion e investigacion academica: util como caso de estudio de Minitron y de ajuste de personas en modelos pequenos, con licencia Apache 2.0 que facilita su uso en publicaciones.
- Pruebas de robustez y seguridad: al tratarse de una persona "malevolente", sirve para analizar respuestas indeseadas y disenar filtros o evaluaciones de seguridad en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB (Q2_K), 4,5 GB (Q4_K_M), 5,5 GB (Q5_K_M), 6,5 GB (Q6_K), 8,5 GB (Q8_0) y 16 GB (f16), sumando overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 solo si se busca throughput masivo o f16 con contexto largo.
- Cabe en GPU de consumo: si, desde una GTX 1060 6 GB o RTX 3050 8 GB con Q4_K_M; en CPU funciona con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-Malevolent (este) | 7,48B | no disponible | pl | Apache 2.0 | GGUF, safetensors |
| Bielik 7B (familia original, referencia) | ~7B | no disponible | pl, en | Apache 2.0 (segun familia) | safetensors, GGUF |
| Mistral 7B Instruct | 7,24B | 8k-32k (segun version) | en, multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | 8,03B | 128k | multilingue | Llama 3.1 Community License | safetensors, GGUF |

La comparativa se limita a la categoria de modelos de 7-8B; no se dispone de datos de rendimiento del modelo evaluado para comparar numericamente con las alternativas.

## Limitaciones y advertencias

- Modelo de investigacion: la persona "Malevolent" puede producir respuestas hostiles, sesgadas o deliberadamente negativas; no debe desplegarse sin filtros en atencion al cliente real.
- Riesgo de alucinacion: como todo modelo de 7B, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S), la fidelidad factual puede degradarse.
- Cobertura linguistica limitada al polaco; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificacion empirica.
- Las cuantizaciones son estaticas (sin imatrix), por lo que las de baja calidad (Q2_K, Q3_K_M) pueden presentar degradacion notable frente a las ponderadas.
- Licencia Apache 2.0 permite uso comercial, pero el caracter experimental del modelo y la falta de benchmarks desaconsejan su uso en produccion sin evaluacion previa.
- No se documentan sesgos especificos ni evaluaciones de seguridad; se recomienda auditoria propia antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Bielik-Minitron-7B-v3.0-Instruct-Malevolent-GGUF
- Modelo base: https://huggingface.co/Osye/Bielik-Minitron-7B-v3.0-Instruct-Malevolent
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Bielik-Minitron-7B-v3.0-Instruct-Malevolent-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
