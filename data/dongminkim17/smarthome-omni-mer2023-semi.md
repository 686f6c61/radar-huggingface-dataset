# dongminkim17/smarthome-omni-mer2023-semi

## Resumen

`dongminkim17/smarthome-omni-mer2023-semi` es un modelo multimodal derivado de Qwen2.5-Omni-3B, especializado en reconocimiento de emociones sobre el conjunto de datos MER2023-SEMI. Lo desarrolla un equipo academico (Sung-Ju Lee, Dong Min Kim, Ryuhaerang Choi, Hyungjun Yoon y Seohyeon Yoo) en el contexto de un proyecto sobre eficiencia de modelos para el hogar inteligente. El modelo parte del checkpoint base y aplica poda de canales en las capas FFN seguida de dos etapas de recuperacion por destilacion, con el objetivo de reducir el coste computacional manteniendo la precision en la tarea.

La arquitectura subyacente es la del thinker de Qwen2.5-Omni, un transformer multimodal que procesa audio y video de forma conjunta. El modelo conserva las 36 capas del decodificador pero reduce el ancho de las FFN de 11.008 a 4.352 canales, lo que da un total de 3.231.263.744 parametros en tiempo de ejecucion (1.924.902.912 en el cuerpo del modelo de lenguaje, 637.676.544 en el codificador de audio y 668.684.288 en el codificador de vision). Los adaptadores LoRA de lenguaje y de codificadores estan fusionados en los pesos publicados.

Su relevancia es doble: por un lado, demuestra una receta reproducible de poda mas destilacion sobre un modelo multimodal pequeno; por otro, publica una evaluacion completa sobre el split oficial de test de MER2023-SEMI con un F1 ponderado del 88,14 %. El modelo esta pensado exclusivamente para la tarea cerrada de clasificacion emocional descrita, no como modelo general de proposito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker: decodificador de lenguaje + codificador de audio + codificador de vision) |
| Parametros totales | 3.231.263.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Qwen Research License (uso no comercial) |
| Formato de pesos | safetensors |
| Parametros del modelo de lenguaje | 1.924.902.912 |
| Parametros del codificador de audio | 637.676.544 |
| Parametros del codificador de vision | 668.684.288 |
| Capas del decodificador | 36 (todas retenidas) |
| Ancho FFN | 4.352 (reducido desde 11.008) |
| Tipo de pesos | BF16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni-3B, con un decodificador de lenguaje de 36 capas y dos torres de codificacion independientes para audio y vision. La innovacion principal es la compresion: se aplico una calibracion de activaciones solo sobre datos de entrenamiento (128 clips, semilla 42) y despues una poda de canales en las FFN que reduce su ancho de 11.008 a 4.352, manteniendo intactas las 36 capas del decodificador.

El proceso de recuperacion consta de dos fases. Primero, un SFT del profesor de tarea durante cinco epocas con LoRA de rango 16 y alpha 32 en query/value. Despues de la poda, una primera recuperacion de cinco epocas con LoRA de rango 16/alpha 32 en el decodificador y una combinacion de SFT y destilacion de clases. La recuperacion conjunta final dura otras cinco epocas con LoRA de rango 64/alpha 128 en decodificador y codificadores, tasa de aprendizaje 1e-4 para el modelo de lenguaje y 1e-5 para los codificadores. Las ponderaciones de perdida son 0,25 para SFT y 0,75 para destilacion de clases, con temperatura 2, mas terminos de destilacion de caracteristicas de audio y vision con peso 0,1 cada uno. Se uso AdamW, tamano de lote efectivo 4, programacion coseno con 3 % de warmup y semilla 42. El muestreo de video es a 2 FPS, hasta ocho fotogramas y 50.176 pixeles por fotograma.

## Capacidades

- Clasificacion cerrada de emociones en seis etiquetas: neutral (A), angry (B), happy (C), sad (D), worried (E) y surprise (F).
- Procesamiento conjunto de audio y video (image-text-to-text y video-text-to-text).
- Puntuacion por logits de la letra de respuesta y generacion greedy, ambas validadas en la evaluacion oficial.
- Comprension multimodal de clips cortos con muestreo a 2 FPS y hasta ocho fotogramas.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a chino e ingles.
- Modo thinking, vision o audio adicional: no disponible mas alla de los codificadores integrados.

## Casos de uso

- Analisis de emociones en videollamadas de atencion al cliente: el modelo recibe audio y video del interlocutor y devuelve una de las seis etiquetas, lo que permite enrutar casos con emocion negativa (angry, sad, worried) a un agente humano.
- Monitorizacion de bienestar en entornos domesticos: integrado en un asistente de hogar inteligente, clasifica el estado emocional del usuario a partir de clips cortos y puede activar rutinas de iluminacion o musica.
- Etiquetado automatico de corpus audiovisuales: util para preprocesar grandes colecciones de video con anotaciones emocionales, dado su F1 ponderado del 88,14 % en el split oficial.
- Investigacion en reconocimiento de emociones multimodales: sirve como baseline comprimido frente a Qwen2.5-Omni-3B completo para estudiar el impacto de la poda FFN en tareas afectivas.
- Evaluacion de calidad de experiencia en entornos educativos o de teleasistencia: deteccion de emociones en sesiones grabadas para generar informes agregados.
- Filtrado de contenido en plataformas de video: clasificacion de clips por carga emocional para moderacion o recomendacion.
- Pruebas de eficiencia en despliegue: al tener 3,23 mil millones de parametros en BF16 y codificadores ligeros, es un candidato para medir latencia en GPUs de gama media frente al modelo base.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| MER2023-SEMI (test oficial) | F1 ponderado | 88,14 % |
| MER2023-SEMI (test oficial) | Ranking en cohorte de 17 | 6 / 17 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales. La evaluacion se realizo sobre el checkpoint publicado y recargado, con puntuacion por logits de la letra de respuesta y generacion greedy; los detalles agregados y la comparacion con el checkpoint fuente sin fusionar estan en `evaluation.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,5 GB solo para pesos (3,23 mil millones de parametros a 2 bytes), mas memoria para activaciones y cache de atencion; se recomienda al menos 16 GB para margen comodo.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para BF16; RTX 3090 o RTX 4080 como minimo practico.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en BF16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 8-12 GB, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers con `Qwen2_5OmniThinkerForConditionalGeneration` y `attn_implementation="sdpa"`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smarthome-omni-mer2023-semi | 3,23 mil millones | No disponible | MER2023-SEMI | Qwen Research (no comercial) | Hugging Face |
| Qwen2.5-Omni-3B (base) | 3 mil millones aprox. | No disponible | Multimodal general | Qwen Research | Hugging Face |
| Emotion-LLaMA | No disponible | No disponible | Reconocimiento de emociones | No disponible | Referenciado en la documentacion del metodo |
| MIntRec | No disponible | No disponible | Intencion multimodal | No disponible | Referenciado en la documentacion del metodo |

La comparativa cuantitativa con la cohorte de 17 modelos publicados (que incluye referencias de MIntRec, ARL y Emotion-LLaMA) esta descrita en la documentacion del metodo; el modelo ocupa la posicion 6 de 17. No se dispone de cifras detalladas de cada competidor en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una tarea cerrada de seis etiquetas; no debe usarse como modelo general de comprension multimodal sin evaluacion propia.
- El uso evaluado se limita a la tarea de intencion o emocion descrita; otros conjuntos de etiquetas, entradas con modalidades incompletas o despliegues generales de hogar inteligente requieren su propia validacion.
- Licencia Qwen Research: uso no comercial y condiciones especificas de redistribucion; revisar `LICENSE` y `NOTICE` antes de cualquier despliegue productivo.
- Idiomas limitados a chino e ingles; el rendimiento en castellano no esta evaluado.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos, pero al ser un modelo de clasificacion cerrada el riesgo se manifiesta como etiquetas incorrectas en casos ambiguos o con ruido audiovisual.
- La seleccion del checkpoint se hizo con datos de validacion; el F1 del 88,14 % corresponde al split oficial de test y no debe extrapolarse a dominios distintos.
- No se publican pesos cuantizados ni soporte documentado para motores de inferencia de alto rendimiento, lo que limita el despliegue a transformers.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongminkim17/smarthome-omni-mer2023-semi
- Repositorio de codigo y documentacion del metodo: https://github.com/dongminkim17/smarthome-model-efficiency
- Documentacion del metodo: https://github.com/dongminkim17/smarthome-model-efficiency/blob/main/docs/METHOD.md
- Entorno de ejecucion: https://github.com/dongminkim17/smarthome-model-efficiency/blob/main/environment.yml
- Dataset MER2023: https://huggingface.co/datasets/MERChallenge/MER2023
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Pagina personal del autor: https://github.com/dongminkim17/dongminkim17.github.io
