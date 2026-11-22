# macrocosm-os/iota-decide-4b-v0.4

## Resumen

iota-decide-4b v0.4 es un modelo de decisiones tipadas desarrollado por Macrocosm (macrocosm-os) mediante fine-tuning del modelo base Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (un ticket, una traza de agente, una politica junto con una peticion, cualquier JSON o texto) y un conjunto de preguntas tipadas, y devuelve una probabilidad calibrada para cada opcion con un unico forward pass por pregunta. Con 4.205.751.296 parametros y pesos en bf16 de aproximadamente 8,4 GB, esta disenado para integrarse en pipelines de agentes y sistemas de clasificacion donde se necesita una decision rapida, barata y con umbral de confianza explotable.

El modelo emplea atencion bidireccional en sus capas de atencion completa y atencion causal en las capas de atencion lineal, de modo que el estado se lee a la luz de la pregunta. Esta particularidad implica que la inferencia causal estandar (generate, vLLM, SGLang o llama.cpp) puntua peor que el modo de entrenamiento, y por ello no existe build GGUF de la version 0.4. El loader incluido en el repositorio (letter_decide.py) construye las mascaras de atencion correctas.

Su relevancia actual radica en el rendimiento declarado en JevBench (78,6 de composite, medido por Benchmark Heaven), por delante de propuestas de OpenAI, Microsoft, Google, Cloudflare, Perplexity y Liquid AI en el mismo board, con un coste de aproximadamente 33 ms por decision en una sola GPU. El entrenamiento se realizo sobre computo desagregado (16 RTX A4000 sincronizadas por internet mediante DiLoCo en streaming), sin cluster de GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B, con atencion bidireccional en capas de atencion completa y causal en capas de atencion lineal; cabeza de decision sobre letras de opcion |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 (aproximadamente 8,4 GB); sin build GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (instruct) y se obtiene mediante LoRA de rango 64 y alpha 128 aplicado a todas las capas lineales del modelo de lenguaje, fusionado posteriormente en los pesos finales. Las respuestas se leen a partir de las letras de las opciones en la posicion de respuesta. La innovacion arquitectonica principal es la atencion en dos direcciones: las capas de atencion completa leen todo el prompt en ambos sentidos, mientras que las capas de atencion lineal permanecen causales; el fichero joint_head_config.json expone `"bidirectional": true` y el loader del repositorio construye las mascaras correspondientes.

El objetivo de entrenamiento es entropia cruzada con objetivos suaves (soft-target cross-entropy) sobre las probabilidades del profesor, con temperatura aprendida. El schedule emplea LR 1e-4, 2% de warmup, decaimiento coseno y 750 pasos. El computo se distribuyo mediante DiLoCo en streaming sobre 16 maquinas RTX A4000 (4 fragmentos, fusiones escalonadas, sin esperas sincronas). El dataset contiene 879.000 registros tras deduplicacion, combinando la mezcla de la version 0.3 (etiquetas humanas) con datos adicionales; el checkpoint se selecciono sobre el split publico de JevBench entre snapshots cada 50 pasos. Se realizo una prueba de solapamiento con ventanas de 8 palabras contra todos los conjuntos de evaluacion: 387 de las 9.012 preguntas de dominio cruzado (4,3%, mayoritariamente WinoGrande, ANLI, MMLU y ARC) comparten texto con registros de entrenamiento, y la puntuacion sin ellas es 62,9 frente a 63,0.

## Capacidades

- Decision tipada con tres tipos de pregunta: `noul` (probabilidad de que una afirmacion sea verdadera), `choice` (opcion elegida, confianza y probabilidad por opcion) y `score` (nivel esperado, confianza y probabilidad por nivel).
- Calibracion explicita: cada respuesta incluye una probabilidad sobre la que aplicar umbrales; las respuestas si/no se reportan con al menos 0,801 en el lado elegido, y JevBench considera abstencion el rango 0,2 < P(yes) < 0,8.
- Listas de opciones de 2 a 26 alternativas.
- Procesamiento de estados heterogeneos: tickets, trazas de agentes, politicas con peticiones, JSON o texto libre.
- Respuestas independientes por pregunta dentro de una misma peticion, con un forward pass por pregunta.
- Integracion mediante el formato SystemOne `/v1/systemone` para peticiones y respuestas.
- No genera texto: la salida es exclusivamente probabilistica.
- Capacidades multilingues limitadas al ingles.
- No se documentan tool calling, function calling, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto del ticket y una lista de equipos (refunds, tech, sales), el modelo devuelve la probabilidad de cada equipo en un unico forward pass, lo que permite umbralizar y derivar a revision humana los casos con confianza baja.
- Aplicacion de politicas de negocio: con un estado que combine la politica y la peticion del cliente, la pregunta `noul` responde si la peticion cumple la politica (por ejemplo, reembolso dentro de 30 dias) con una probabilidad calibrada explotable en reglas de negocio.
- Triaje y priorizacion: la pregunta `score` con niveles 1-3 estima la urgencia esperada de una incidencia, util para ordenar colas de atencion con un coste de aproximadamente 33 ms por decision.
- Moderacion y clasificacion de contenido: evaluaciones sobre Rotten Tomatoes (89,3) y TweetEval offensive (76,6) con etiquetas humanas no vistas en entrenamiento indican utilidad para clasificacion binaria de texto con umbral de confianza.
- Supervision de trazas de agentes: dado un trace de un agente y preguntas tipadas sobre si la accion fue correcta o que categoria de error contiene, el modelo actua como evaluador barato dentro de bucles de agente multi-paso.
- Filtrado previo en pipelines RAG o de generacion: usar las probabilidades como senal de descarte o escalado antes de invocar un modelo generativo mayor, reduciendo coste y latencia.
- Analisis de encuestas y formularios: preguntas `choice` y `score` sobre respuestas abiertas para derivar etiquetas calibradas con intervalos de probabilidad por opcion.

## Benchmarks y rendimiento

JevBench (Benchmark Heaven, v1.8.1), puntuacion composite:

| Sistema | Composite |
|---|---|
| Torchcast Decision 4B v1.3 | 80,5 |
| iota-decide-4b v0.4 | 78,6 |
| H2O Lightning 4B v1.1 | 77,9 |
| Liquid AI d1-ultra (API) | 76,0 |
| Perplexity Decider v1.1 27B | 74,9 |
| iota-decide-4b v0.3 | 72,8 |
| Microsoft Decision-1 (API) | 69,1 |
| Cloudflare Clef 27B | 69,0 |
| OpenAI Decisions (API) | 62,4 |

Ejes de v0.4 en JevBench: Intelligence 60,2; Calibration 87,8; Speed 92,2; Cost 83,0. Benchmark Heaven midio y recalculo de forma independiente v0.4 el 4 de noviembre de 2026; el listado en el board esta pendiente porque se midio sobre un sorteo de preguntas mas reciente que el board aun no ha equiparado. El resto de puntuaciones proceden del board v1.8.1.

Evaluaciones propias del autor:

| Conjunto | v0.3 | v0.4 | Torchcast Decision 4B v1.3 |
|---|---|---|---|
| Habilidad entre dominios: 15 benchmarks Decision Index, corregido por azar (9.012 preguntas) | 55,4 | 63,0 | 65,6 |
| Rotten Tomatoes / TweetEval offensive (oro humano, nunca entrenado) | 85,1 / 76,4 | 89,3 / 76,6 | 90,7 / 79,5 |
| Split publico de JevBench (231 preguntas) | 188 | 195 | 211 |

El checkpoint v0.4 se selecciono sobre el split publico de JevBench, por lo que esa cifra no es una estimacion independiente; la puntuacion de Benchmark Heaven si lo es. La prueba de solapamiento de 8 palabras detecto 387 de 9.012 preguntas (4,3%) con texto compartido con el entrenamiento; sin ellas la puntuacion es 62,9 en lugar de 63,0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB en bf16 para los pesos; el loader requiere ademas memoria para tokenizer, mascaras de atencion y activaciones, por lo que se recomienda reservar algo mas de 10 GB.
- GPU recomendadas: una RTX A4000 (16 GB) fue la unidad usada en el entrenamiento distribuido y es suficiente para inferencia; tambien cabe en RTX 4090 (24 GB), A100 y H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM en bf16; no se publican builds GGUF ni cuantizaciones de menor precision.
- Opciones de despliegue: transformers 5.15 o superior con el loader `letter_decide.py` incluido en el repositorio; el autor advierte que vLLM, SGLang y llama.cpp estandar ejecutan el modelo de forma distinta a la del entrenamiento y puntuan peor.
- Latencia y throughput: aproximadamente 33 ms por decision en una sola GPU segun la medicion de Benchmark Heaven; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iota-decide-4b v0.4 | 4,2 B | no disponible | 78,6 | apache-2.0 | Pesos abiertos en Hugging Face |
| Torchcast Decision 4B v1.3 | 4 B | no disponible | 80,5 | no disponible | no disponible en la informacion proporcionada |
| H2O Lightning 4B v1.1 | 4 B | no disponible | 77,9 | no disponible | no disponible en la informacion proporcionada |
| Perplexity Decider v1.1 27B | 27 B | no disponible | 74,9 | no disponible | API |
| Liquid AI d1-ultra | no disponible | no disponible | 76,0 | no disponible | API |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- No genera texto: no sirve para tareas generativas, de resumen o de conversacion abierta.
- La atencion bidireccional en capas completas rompe la compatibilidad con inferencia causal estandar; usar vLLM, SGLang, llama.cpp o `model.generate` sin el loader produce puntuaciones inferiores a las reportadas.
- No existe build GGUF de la version 0.4, lo que limita el despliegue en entornos de cuantizacion ligera.
- Riesgo de alucinacion inherente a la clasificacion probabilistica: las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento, aunque el eje de calibracion reportado es alto (87,8).
- Sesgos no documentados en la informacion proporcionada; el dataset incluye etiquetas humanas de conjuntos como Rotten Tomatoes y TweetEval, con los sesgos propios de esas fuentes.
- El checkpoint se selecciono sobre el split publico de JevBench, por lo que las cifras de ese split estan sesgadas al alza; la medicion independiente es la de Benchmark Heaven.
- Existe solapamiento del 4,3% entre el conjunto de evaluacion entre dominios y el entrenamiento; el impacto medido es de 0,1 puntos, pero conviene tenerlo en cuenta al interpretar resultados.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que deben verificarse en su repositorio.
- El listado en el board de JevBench esta pendiente de equiparacion, por lo que la comparacion con otros sistemas se basa en sorteos de preguntas potencialmente distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/macrocosm-os/iota-decide-4b-v0.4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Web de Macrocosmos: https://www.macrocosmos.ai
- Loader `letter_decide.py`: disponible en el repositorio de Hugging Face del modelo
- Benchmark Heaven / JevBench: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
