# kortukov/gpt-oss-20b-aside-alpaca-sft

## Resumen
gpt-oss-20b-aside-alpaca-sft es un ajuste fino completo (full fine-tune) del modelo openai/gpt-oss-20b, publicado por el usuario kortukov. Su interés no reside en el rendimiento generalista, sino en el método que incorpora: ASIDE, un esquema de defensa frente a inyecciones de prompt que separa de forma explícita el canal de confianza del canal no confiable. Sobre el modelo base, de 20.923.051.584 parámetros, se aplica una rotación isoclínica fija de pi/2 (multiplicada por la derecha) a las representaciones de los tokens procedentes de entradas externas y de salidas de herramientas, mientras que los tokens de razonamiento y de respuesta del asistente permanecen en el canal de confianza.

El entrenamiento consiste en supervisión de secuencia completa sobre el conjunto de datos kortukov/alpaca-cleaned-gpt-oss-120b-reasoning, derivado de Alpaca y anotado con trazas de razonamiento generadas por gpt-oss-120b. El checkpoint publicado corresponde a la tercera época (546 actualizaciones del optimizador) e incluye la matriz de rotación fija dentro de los pesos safetensors fragmentados; no se incluyen ni el optimizador ni el estado de entrenamiento.

Se trata, por tanto, de un artefacto de investigación orientado a estudiar ASIDE sobre un modelo con modo de razonamiento explícito, no de un asistente generalista listo para producción. El propio autor acota su alcance: en AgentDojo limpio solo se completaron 9 de 95 tareas, de modo que la baja tasa de éxito de ataque debe leerse en conjunto con esa limitada utilidad agéntica.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso (familia gpt_oss) según el modelo base; el ajuste no modifica la topología, solo los pesos y el tratamiento de embeddings |
| Parametros totales | 20.923.051.584 (20,9 mil millones) |
| Parametros activos | no disponible en la información proporcionada |
| Longitud de contexto | no disponible; la longitud máxima de secuencia usada en entrenamiento fue de 9.216 tokens |
| Tipos de cuantizacion | no disponible; el repositorio contiene safetensors fragmentados (83,7 GB en total), sin variantes GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fragmentados, con la matriz de rotación fija incluida) |
| Autor | kortukov |
| Modelo base | openai/gpt-oss-20b |
| Dataset de entrenamiento | kortukov/alpaca-cleaned-gpt-oss-120b-reasoning |
| Tarea (pipeline) | text-generation |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
El modelo parte de openai/gpt-oss-20b, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 20,9 mil millones de parámetros totales, del que este checkpoint hereda la topología completa. La innovación del ajuste es la integración de ASIDE: se aplica una rotación isoclínica fija de pi/2, por multiplicación a la derecha, a las representaciones de los tokens etiquetados como no confiables (entradas externas y salidas de herramientas), mientras que las instrucciones del usuario y los tokens del asistente se mantienen en el canal de confianza. La matriz de rotación, en BF16, es fija y se ha incorporado a los pesos safetensors del checkpoint publicado. La separación depende por completo de un etiquetado explícito de confianza por token; cambiar esa política de etiquetado altera el método evaluado, no solo su resultado.

El entrenamiento es un SFT de secuencia completa. Los hiperparámetros declarados son: tasa de aprendizaje máxima de 2e-5, decaimiento coseno sin warmup, 3 épocas (546 actualizaciones del optimizador), tamaño de lote efectivo 256 con microbatch de 1, longitud máxima de secuencia de 9.216 tokens, optimizador AdamW sin decaimiento de peso, recorte de gradiente a 1,0, precisión con pesos maestros en FP32 y cómputo en BF16, y semilla 123. El objetivo de entrenamiento es puramente supervisado sobre las respuestas y las trazas de razonamiento del dataset; no se documenta RLHF ni DPO.

## Capacidades
- Generación de texto conversacional, heredada del modelo base y reorientada por el SFT sobre Alpaca.
- Razonamiento explícito: el ajuste se plantea como una extensión de ASIDE a un modelo de razonamiento, de modo que los tokens de razonamiento permanecen en el canal de confianza.
- Manejo de salidas de herramientas: el esquema ASIDE etiqueta las salidas de herramientas (tool outputs) como no confiables, lo que implica que el modelo fue entrenado con ese tipo de contenido en el flujo de entrada; no se detalla en la información disponible el soporte formal de function calling.
- Procesamiento de entradas externas no confiables bajo una política de confianza por token (entrada externa y salidas de herramientas como no confiables; instrucciones de usuario y tokens del asistente como confiables).
- Capacidades multilingües: no disponibles.
- Capacidades especiales verificadas: ninguna adicional documentada (no se declara visión, audio ni modo de pensamiento configurable).

## Casos de uso
- Investigación en seguridad de LLM: servir como banco de pruebas reproducible para medir el efecto de ASIDE sobre un modelo de razonamiento, comparando utilidad y tasa de éxito de ataque bajo una política de etiquetado fija.
- Evaluación de defensas frente a inyección de prompt: reproducir el protocolo SEP descrito por el autor para contrastar la tasa de éxito de ataque (8,70 %) con la utilidad obtenida (89,60 %).
- Red-teaming de agentes: analizar cómo se comporta el modelo cuando recibe salidas de herramientas manipuladas, aprovechando que esas salidas se rotan al canal no confiable.
- Estudio de etiquetado de confianza: comparar políticas de etiquetado alternativas para cuantificar cuánto del comportamiento observado depende de la definición de tokens confiables y no confiables.
- Fine-tuning experimental: usar el checkpoint como punto de partida para nuevos SFT sobre datasets de razonamiento, dado que se publica como pesos completos sin estado de optimizador.
- Generación de texto y razonamiento supervisado en entornos controlados de laboratorio, siempre que se asuma la ausencia de benchmarks generalistas publicados.
- Análisis de fallos de generación: estudiar los casos de respuesta final ausente (83 de 2.000 generaciones en la evaluación SEP) y de agotamiento del límite de generación (107 de 2.000) como fenómeno medible del ajuste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos reportados por el autor son los siguientes:

| Evaluación | Métrica | Resultado |
|---|---|---|
| SEP (held-out) | Utilidad | 89,60 % |
| SEP (held-out) | Tasa de éxito de ataque (ASR) | 8,70 % |
| AgentDojo (limpio) | Tareas completadas | 9 de 95 |
| SEP, 2.000 generaciones | Respuesta final ausente | 83 |
| SEP, 2.000 generaciones | Límite de generación alcanzado | 107 |

El autor advierte explícitamente que estos resultados deben leerse en conjunto: la baja utilidad agéntica en AgentDojo limita lo que puede inferirse de una tasa de éxito de ataque baja. No se ofrecen comparaciones con el modelo base bajo el mismo protocolo.

## Requisitos de hardware
Estimaciones a partir del recuento de parámetros (20,9 mil millones); no proceden de mediciones publicadas para este checkpoint.
- Pesos en FP32: aproximadamente 84 GB de VRAM. El tamaño del repositorio (83,7 GB) es coherente con pesos almacenados en FP32, aunque la model card no lo confirma. Requiere nodos multi-GPU (por ejemplo, 2 x A100 80 GB o 2 x H100 80 GB).
- Pesos en BF16: aproximadamente 42 GB. Cabe en una A100 80 GB, una H100 80 GB o una L40S 48 GB (con margen ajustado), y en configuraciones de 2 x RTX 4090 24 GB con paralelismo tensorial.
- Pesos en INT8: aproximadamente 21 GB, viable en una RTX 4090 24 GB o una L40S 48 GB, con margen para caché KV.
- Pesos en INT4: aproximadamente 11 GB, viable en GPU de consumo de 16 GB o más (RTX 4080, RTX 4090, RTX 3090). Requiere cuantización propia, ya que el repositorio no publica variantes cuantizadas.
- Comparación con el modelo base: openai/gpt-oss-20b se distribuye con pesos nativos en MXFP4 (en torno a 16 GB), lo que permite su ejecución en GPU de consumo; no se indica si este ajuste conserva ese formato.
- Opciones de despliegue: vLLM o TGI para servicio en BF16/FP32 con paralelismo tensorial; llama.cpp u Ollama solo tras convertir los safetensors a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles. Cualquier cifra dependería del hardware, del backend y de la cuantización elegida.

## Comparativa con modelos similares
No se dispone en la información proporcionada de otros ajustes ASIDE ni de derivados de gpt-oss-20b con los que comparar de forma rigurosa. La única referencia directa es el modelo base.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kortukov/gpt-oss-20b-aside-alpaca-sft | 20,9 mil millones | no disponible (entrenado a 9.216 tokens) | SEP: 89,60 % utilidad, 8,70 % ASR; AgentDojo: 9/95 | apache-2.0 | safetensors en HuggingFace, 0 descargas |
| openai/gpt-oss-20b (base) | 20,9 mil millones | no disponible en la información proporcionada | no disponible | apache-2.0 | pesos abiertos en HuggingFace |
| Otros ajustes comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Dependencia del etiquetado: el método ASIDE presupone una política explícita de etiquetado por token (entrada externa y salidas de herramientas como no confiables; instrucciones del usuario y tokens del asistente como confiables). Aplicar otra política invalida la comparación, porque se estaría evaluando un método distinto.
- Utilidad agéntica reducida: solo 9 de 95 tareas completadas en AgentDojo limpio. La tasa de éxito de ataque del 8,70 % no puede interpretarse como una defensa eficaz sin tener en cuenta esa base de utilidad.
- Respuestas finales ausentes: 83 de 2.000 generaciones en la evaluación SEP no produjeron respuesta final, y 107 alcanzaron el límite de generación (categorías que se solapan). Es un riesgo real en producción.
- Artefacto de investigación: el autor lo define como tal. No hay benchmarks generalistas, ni datos de idiomas, ni guía de despliegue.
- Sesgos: no documentados en la información disponible. El dataset de origen es una versión limpiada de Alpaca, con la composición y los sesgos que ello implica, pero no se aportan análisis.
- Alucinación: no se han publicado métricas de fidelidad factual; el riesgo inherente al modelo base no se cuantifica en esta ficha.
- Idiomas: no se declara ningún conjunto de idiomas soportados; no puede asumirse cobertura multilingüe.
- Contexto: no se especifica la longitud de contexto del modelo base; el único dato es la longitud máxima de secuencia de entrenamiento (9.216 tokens), que no equivale a la ventana de inferencia.
- Licencia: apache-2.0, permisiva para uso comercial, pero la licencia no cubre la idoneidad del modelo para producción ni exime de validar el comportamiento defensivo en el caso de uso concreto.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni variantes INT4/INT8, por lo que el despliegue en hardware de consumo exige conversión y validación propias.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/kortukov/gpt-oss-20b-aside-alpaca-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/kortukov/alpaca-cleaned-gpt-oss-120b-reasoning
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Paper, blog o repositorio de ASIDE: no disponible en la información proporcionada
- Demo o Space asociado: no disponible
- Resultados de la búsqueda web: no contienen información relevante sobre el modelo (las referencias recuperadas tratan sobre elementos de masa concentrada en análisis por elementos finitos y no guardan relación con esta ficha).
