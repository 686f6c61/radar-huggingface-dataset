# AwakeningOS/vistarc-320-9l-mos3-80m

## Resumen

VISTARC-320-9L-MoS3-80M es un modelo de lenguaje de investigacion en ingles desarrollado por AwakeningOS, con 45.454.791 parametros reales (pesos en safetensors) y entrenado sobre el corpus BabyLM 2026 Strict-Small. Se trata de un checkpoint seleccionado tras 80 millones de palabras de exposicion, correspondiente a la semilla 20260907 e identificado como modelo #1 en el inventario de investigacion del autor. Su proposito no es competicion comercial sino servir como plataforma de estudio sobre mecanismos de retroalimentacion recurrente en arquitecturas Transformer de escala reducida.

La arquitectura combina un Transformer con dos formas de feedback: los cambios producidos por la capa precedente y las estadisticas candidatas de la prediccion del token anterior. La salida se genera mediante una mezcla de tres componentes de softmax (mixture of softmaxes) que leen los estados de las capas [9], [8, 9] y [7, 8, 9], respectivamente. El estado principal del modelo es un vector de 320 dimensiones, con normalizacion esferica RMS para controlar la escala del estado residual.

El modelo se publico como entrada post-deadline (no competitiva) en el leaderboard de BabyLM 2026, donde obtuvo 51,89 de media NLP (segundo entre modelos decoder-only y duodecimo global en la comparacion de puntuaciones publicadas a 2 de noviembre de 2026). Es relevante ahora como referencia abierta para investigadores interesados en feedback recurrente, mezclas de softmax y entrenamiento eficiente con presupuestos linguisticos reducidos, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con feedback recurrente (cambios de capa previa y estadisticas de prediccion del token anterior) y mixture of softmaxes de 3 componentes |
| Parametros totales | 45.454.791 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor valida la ruta de inferencia en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

VISTARC emplea un Transformer causal con estado principal de 320 dimensiones y una innovacion central: reutilizar lo que el modelo acaba de computar. La informacion fluye por varios canales. Los cambios de estado separados de la etapa de atencion y de la etapa FFN se inyectan en el FFN de la capa siguiente, ponderados por un Router32. La media recuperada por atencion y la varianza de caracteristicas alimentan una puerta de recepcion y el FFN, respectivamente. Ademas, un Candidate Reader48 en cada capa consume la media, varianza, masa, concentracion y concordancia con el token observado de la prediccion anterior, condicionando la prediccion posterior. La salida combina tres ramas MoS que leen los estados de las ultimas una, dos y tres capas. La normalizacion esferica RMS controla la escala del estado residual.

El entrenamiento se realizo sobre el corpus BabyLM 2026 Strict-Small, con un objetivo de prediccion del siguiente token y sin ajuste por instrucciones (no hay chat tuning). El checkpoint liberado corresponde a 80 millones de palabras de exposicion de la semilla 20260907. No se detallan en la informacion disponible el numero exacto de tokens, la composicion del dataset ni si hubo RLHF o DPO; el autor indica explicitamente que la evaluacion del checkpoint completo no aisla el beneficio de cada componente arquitectonico. El modelo requiere codigo Python personalizado (`trust_remote_code`) y la salida nativa es una mezcla normalizada de log-probabilidades expuesta en el campo `logits`.

## Capacidades

- Generacion de texto por completacion autoregresiva (modelo preentrenado, sin instrucciones).
- Prediccion del siguiente token con distribucion de probabilidad derivada de la mezcla de softmaxes.
- Razonamiento de tipo linguistico limitado al dominio y escala del corpus BabyLM.
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: feedback recurrente entre capas y entre tokens, y salida mediante mixture of softmaxes de tres ramas de profundidad.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre feedback recurrente: el modelo permite estudiar como la inyeccion de cambios de capa y estadisticas de prediccion previa afecta la perplejidad y la coherencia en modelos pequenos, comparando con variantes sin feedback.
- Experimentos de mixture of softmaxes: sirve como banco de pruebas para analizar el efecto de combinar distribuciones de las capas 9, 8-9 y 7-8-9 en la calidad de la prediccion.
- Reproduccion de resultados BabyLM: investigadores pueden reproducir el checkpoint de 80M de palabras y la semilla 20260907 para validar la puntuacion de 51,89 en NLP Average.
- Estudio de eficiencia en presupuestos linguisticos reducidos: util para analizar que mecanismos aportan ganancia cuando el entrenamiento se limita al corpus Strict-Small.
- Docencia y divulgacion: modelo de 45M de parametros y 0,2 GB que cabe en CPU y permite explicar arquitecturas Transformer con feedback en entornos academicos.
- Base para ablaciones controladas: el catalogo de 302 IDs experimentales y 988 puntos de evaluacion del autor facilita disenar comparaciones sobre el banco de 17.274 preguntas del proyecto.
- Analisis de normalizacion esferica RMS: caso practico para evaluar el control de escala del estado residual en redes pequenas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| NLP Average (BabyLM 2026 Strict-Small) | 51,89 | Puntuacion publicada el 2 de noviembre de 2026; 2.º entre decoder-only y 12.º global en comparacion de puntuaciones publicadas |
| Banco de preguntas del proyecto (17.274 items) | no disponible por modelo en la informacion | Cubre 16 modelos en 20 checkpoints; datos CSV/JSON disponibles |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Las posiciones citadas comparan puntuaciones publicadas y no son colocaciones oficiales de competicion, al ser una entrada post-deadline.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 45,5M de parametros (aproximadamente 182 MB de pesos mas estados y cache); el repo completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor valida CUDA con PyTorch 2.13.0 y Transformers 5.14.1.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente; tambien en CPU (validado con Python 3.14 / PyTorch 2.13.0).
- Opciones de despliegue:Transformers con `trust_remote_code=True`; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. El autor recomienda desactivar TF32 (`allow_tf32 = False`) para la ruta validada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VISTARC-320-9L-MoS3-80M | 45,5M | no disponible | 51,89 NLP Average (BabyLM 2026, comparacion de puntuaciones publicadas) | Apache 2.0 | Hugging Face, requiere codigo custom |
| Otros decoder-only de BabyLM 2026 Strict-Small | no disponible | no disponible | Posiciones en el leaderboard BabyLM 2026 | no disponible | no disponible |
| Modelos de referencia tipo GPT-2 small | 124M | 1.024 tokens | no comparable en este contexto | MIT | Hugging Face |

La informacion proporcionada no incluye datos detallados de modelos alternativos comparables en la misma categoria y presupuesto; la comparativa se limita a la posicion relativa en el leaderboard BabyLM 2026 y a referencias genericas de escala.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no soporta otros idiomas.
- Modelo preentrenado sin ajuste por instrucciones: no es adecuado para chat ni para seguir ordenes directas.
- Riesgo de alucinacion y de completaciones incoherentes propio de un modelo de 45M de parametros entrenado con presupuesto linguistico reducido.
- Requiere `trust_remote_code=True`; es imprescindible inspeccionar los ficheros antes de habilitarlo por riesgo de ejecucion de codigo.
- La salida nativa son log-probabilidades mezcladas, no logits convencionales; hay que aplicar softmax sobre el campo `logits` para obtener la distribucion predictiva.
- El tokenizador no inserta BOS automaticamente; hay que anadirlo manualmente para reproducir el comportamiento validado.
- La entrada es post-deadline y no competitiva en BabyLM 2026; las posiciones citadas comparan puntuaciones publicadas, no son resultados oficiales.
- La evaluacion del checkpoint completo no aisla la contribucion de cada componente arquitectonico, segun el propio autor.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigacion y la falta de validacion en produccion desaconsejan su uso fuera de entornos experimentales.
- Longitud de contexto y opciones de cuantizacion no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AwakeningOS/vistarc-320-9l-mos3-80m
- Cuaderno de investigacion (Space): https://huggingface.co/spaces/AwakeningOS/vistarc-research-notes
- Guia de arquitectura, ecuaciones y mapa de implementacion: ARCHITECTURE.md (en el repositorio del modelo)
- Guia de arquitectura en japones: ARCHITECTURE_JA.md (en el repositorio del modelo)
- Registro de comparacion y posicion en leaderboard: provenance/LEADERBOARD_POSITION_20261102.json (en el repositorio del modelo)
- Politica de envio BabyLM: https://arxiv.org/html/2602.20092v2#S4.SS6
