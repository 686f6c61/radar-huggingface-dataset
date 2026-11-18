# nardi/LFM3-TS

## Resumen

LFM3-TS es un modelo de lenguaje especializado en la lectura y el razonamiento sobre series temporales, desarrollado por Nardi Xhepi como proyecto independiente y no afiliado a Liquid AI. Se construye a partir de LFM3-1.7B de Liquid AI, al que se antepone un codificador de series temporales y se le ajustan todos los pesos excepto los embeddings de tokens. El modelo recibe una serie unidimensional y una pregunta en lenguaje natural, y responde en texto indicando si hay anomalías, dónde se localizan y qué forma tienen. Con 1.781 millones de parámetros, es una alternativa compacta frente a modelos multimodales de series temporales de mayor tamaño como ChatTS-8B.

La relevancia del modelo reside en su eficiencia de representación: cada parche de 8 puntos de la serie se codifica en un único token, de modo que una serie de 512 puntos consume solo 66 tokens de contexto. Esto permite procesar series largas sin agotar la ventana del modelo de lenguaje y abarata la inferencia frente a enfoques que tokenizan cada punto por separado. El modelo está entrenado para series de hasta 2.048 puntos y responde únicamente en inglés.

El proyecto se apoya en las ideas y los datos sintéticos de ChatTS (arXiv:2412.03104) y en series reales anotadas de TSB-AD-U. Su licencia es la LFM Open License v1.0, heredada del modelo base, lo que condiciona el uso comercial. La ficha se basa exclusivamente en la model card y en los resultados publicados por el autor; no se ha verificado de forma independiente ninguno de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje LFM3 (Liquid AI) con codificador de series temporales antepuesto y proyector MLP |
| Parametros totales | 1.781.433.088 (1,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con series de hasta 2.048 puntos, que ocupan 258 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, etiquetada como "other") |
| Formato de pesos | safetensors (librería transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo combina un codificador de series temporales con el transformer LFM3-1.7B. El codificador trabaja con parches de 8 puntos y consta de 4 capas feed-forward y 2 capas de atención con anchura 1024; un proyector MLP lleva su salida a la anchura del modelo de lenguaje (2048). Cada parche se convierte en un token, más 2 tokens adicionales por serie, de forma que una serie de 512 puntos ocupa 66 tokens. La serie se estandariza antes de entrar al codificador, y su desplazamiento y escala se escriben en el prompt como texto, lo que permite que las respuestas den valores reales en lugar de coordenadas normalizadas. Todos los pesos del LFM3 están ajustados excepto los embeddings de tokens.

El entrenamiento consta de tres etapas secuenciales, cada una partiendo de los pesos de la anterior: primero preguntas generadas que solo pueden responderse leyendo la serie; después las mismas preguntas sobre series de hasta 2.048 puntos; y finalmente una mezcla de datos sintéticos de ChatTS (48%), preguntas generadas (19%), chat plano (15%), series reales con anomalías etiquetadas (10%) y series reales con un evento insertado (8%). No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto en inglés sobre series temporales: descripción, interpretación y respuesta a preguntas en lenguaje natural.
- Detección de anomalías: indica si existe una anomalía, en qué punto (numeración desde 0) y qué forma tiene.
- Preguntas y respuestas sobre series temporales (time-series question answering) según el esquema de ChatTS.
- Manejo de valores ausentes: NaN se interpreta como valor faltante en la serie de entrada.
- Entrada multimodal: serie numérica unidimensional más pregunta textual.
- Conversación de un turno mediante el método `model.chat(processor, series, pregunta)`.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Monitorización de métricas de infraestructura: el modelo puede recibir una ventana de 512 puntos de una serie de latencia o CPU y responder si hay un pico anómalo y en qué punto, aprovechando que 512 puntos ocupan solo 66 tokens y permiten encadenar varias ventanas en un mismo contexto.
- Triaje de alertas en observabilidad: dado un segmento de serie con una alerta disparada, el modelo genera una explicación textual de la forma de la anomalía (pico, caída, cambio de nivel) que puede adjuntarse al ticket, reduciendo el trabajo manual de clasificación.
- Análisis exploratorio de datos de sensores: un analista puede pasar una serie de temperatura o vibración y preguntar en inglés por eventos concretos, usando el modelo como interfaz conversacional sobre datos que de otro modo requerirían scripts ad hoc.
- Control de calidad en series financieras o de ventas: detección de valores atípicos en ventanas de hasta 2.048 puntos para marcar revisiones manuales, con la ventaja de que el modelo devuelve el índice del punto sospechoso y no solo una etiqueta binaria.
- Generación de informes automáticos: integración en un pipeline que, para cada serie de un lote, produce una frase en inglés describiendo el estado de la señal, útil para resúmenes diarios de flotas de sensores.
- Evaluación comparativa de detectores de anomalías: el modelo puede usarse como línea base conversacional frente a detectores clásicos, ya que su salida textual permite auditar por qué se ha marcado un punto y facilita la revisión humana de falsos positivos.
- Asistencia en investigación sobre series temporales: reproducción de los experimentos del autor con el benchmark de ChatTS y las ventanas de TSB-AD-U, usando el recetario de entrenamiento publicado en el repositorio de código.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. El benchmark de ChatTS (conjuntos A y B) se puntúa con el código de evaluación del repositorio de ChatTS; las anomalías se evalúan sobre 234 ventanas de 512 puntos de siete fuentes de TSB-AD-U no vistas en entrenamiento (105 con anomalía etiquetada, 129 sin ella). Una respuesta se considera correcta si dice "yes" y nombra un punto a menos de 16 puntos del tramo etiquetado.

| Benchmark | Métrica | LFM3-TS (1,8 B) | ChatTS-8B (8 B) |
|---|---|---|---|
| ChatTS set A | categórica | 82,0% | 83,8% |
| ChatTS set A | numérica | 77,5% | 82,3% |
| ChatTS set B | categórica | 79,5% | 84,6% |
| ChatTS set B | numérica | 76,8% | 82,9% |
| Anomalías TSB-AD-U | precisión | 66% | 40% |
| Anomalías TSB-AD-U | exhaustividad | 64% | 53% |
| Anomalías TSB-AD-U | F1 | 0,65 | 0,46 |
| Anomalías TSB-AD-U | falsas alarmas (de 129) | 28 | 61 |

No se han publicado en la información disponible resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (probablemente bf16/fp16, no confirmado): en torno a 3,6 GB solo para pesos, más overhead de activaciones y del codificador; el tamaño del repo es de 3,6 GB.
- En cuantización de 8 bits cabría en GPUs consumer con 8 GB; en 4 bits, en GPUs con 6 GB o menos. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una RTX 4090, L4 o A10 bastarían para inferencia en precisión nativa; A100/H100 no serían necesarias.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB en bf16, aunque el autor no lo documenta.
- Opciones de despliegue: transformers (versión 5.23 o superior, con `trust_remote_code=True`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la naturaleza multimodal de la entrada (serie numérica más texto) dificulta su uso directo en servidores de texto estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de serie | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-TS | 1,8 B | hasta 2.048 puntos (258 tokens) | Codificador de parches + LFM3 | LFM Open License v1.0 | Hugging Face, código en GitHub |
| ChatTS-8B | 8 B | no disponible | Modelo multimodal de series temporales basado en LLM | no disponible en la información | Hugging Face y GitHub (NetManAIOps/ChatTS) |
| LFM3-1.7B | 1,8 B | no disponible | LLM de texto de Liquid AI | LFM Open License v1.0 | Hugging Face |

Frente a ChatTS-8B, LFM3-TS obtiene resultados algo inferiores en los conjuntos A y B de ChatTS (entre 1,8 y 5,5 puntos porcentuales menos) con una cuarta parte de los parámetros, y supera claramente a ChatTS-8B en detección de anomalías sobre series reales de TSB-AD-U (F1 de 0,65 frente a 0,46, y menos de la mitad de falsas alarmas). No se dispone de datos para comparar con otros modelos de series temporales como TimesFM o Chronos, por lo que esa comparación no está disponible.

## Limitaciones y advertencias

- Solo responde en inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Entrenado con series de hasta 2.048 puntos; no se documenta comportamiento con series más largas.
- Los resultados de benchmarks proceden únicamente del autor y no han sido verificados de forma independiente; el conjunto de evaluación de anomalías es pequeño (234 ventanas) y la métrica de acierto es laxa (margen de 16 puntos).
- Riesgo de alucinación: al ser un modelo generativo, puede afirmar la existencia de anomalías inexistentes o inventar índices; las 28 falsas alarmas sobre 129 ventanas limpias lo ilustran.
- La licencia LFM Open License v1.0 impone condiciones al uso comercial; es necesario revisar el archivo LICENSE y el NOTICE del repositorio antes de desplegarlo en producción.
- Requiere `trust_remote_code=True` y transformers 5.23 o superior, lo que implica ejecutar código del repositorio y limita la compatibilidad con herramientas de despliegue estándar.
- Proyecto independiente de un solo autor, sin afiliación a Liquid AI; no hay garantía de mantenimiento ni de soporte.
- No se documentan sesgos específicos, pero al derivar de LFM3-1.7B y de datos sintéticos de ChatTS puede heredar los sesgos del modelo base y de los datos generados.
- No se documentan cuantizaciones oficiales ni recetas de despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nardi/LFM3-TS
- Código y receta de entrenamiento: https://github.com/nardi-xhepi/lfm3-ts
- Blog del autor: https://nardi-xhepi.github.io/blog/posts/lfm3-ts.html
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper de ChatTS: https://arxiv.org/abs/2412.03104
- Repositorio de ChatTS: https://github.com/NetManAIOps/ChatTS
- Benchmark de ChatTS (Zenodo): https://zenodo.org/records/14349206
- TSB-AD: https://github.com/TheDatumOrg/TSB-AD
- Dataset databricks-dolly-15k: https://huggingface.co/datasets/databricks/dolly-15k
- Hugging Face Transformers: https://github.com/huggingface/transformers
