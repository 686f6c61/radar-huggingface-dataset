# AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_cap_b1000_s0

## Resumen

Este modelo es un ajuste fino (fine-tune) de `marin-community/marin-8b-base`, un modelo de lenguaje de 8 030 millones de parámetros con arquitectura tipo Llama, especializado mediante entrenamiento adicional en el dominio financiero. El autor, AmberYifan, lo ha entrenado sobre el dataset `capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_cap_b1000_s0`, que combina el benchmark ConvFinQA (preguntas y respuestas conversacionales sobre documentos financieros) con datos adicionales de capacidad financiera. El resultado es un modelo orientado a tareas de razonamiento cuantitativo y diálogo sobre información financiera.

La relevancia actual radica en la necesidad de modelos especializados que puedan procesar conversaciones multi-turno sobre estados financieros, balances y datos numéricos, un área donde los modelos generalistas suelen fallar. Al estar basado en una arquitectura Llama de 8B, ofrece un equilibrio entre rendimiento y requisitos de hardware, permitiendo su despliegue en GPUs de consumo con cuantización adecuada. Sin embargo, la ausencia de benchmarks publicados y la licencia "other" limitan su evaluación objetiva y su uso comercial sin verificación previa.

El entrenamiento se realizó con una sola época, learning rate de 1e-05 y optimizador AdamW con scheduler coseno, utilizando 4 GPUs en paralelo. No se proporcionan detalles sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento más allá del nombre del dataset, lo que obliga a tratar el modelo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Llama) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `marin-community/marin-8b-base`, que a su vez sigue la arquitectura Llama (transformer decoder con atención causal). No se dispone de información sobre el número de capas, dimensiones de atención ni el tamaño del vocabulario, pero por el número de parámetros se puede inferir que se trata de un modelo de aproximadamente 8B, similar a Llama 3.1 8B o Mistral 7B en estructura general.

El entrenamiento se realizó sobre el dataset `capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_cap_b1000_s0`, que combina el benchmark ConvFinQA (conversaciones sobre documentos financieros con preguntas numéricas) con datos adicionales de capacidad financiera (probablemente generados o aumentados). Los hiperparámetros reportados incluyen una sola época, learning rate de 1e-05, batch efectivo de 64 (2 por dispositivo con 4 GPUs y 8 pasos de acumulación), y scheduler de learning rate coseno con warmup del 3%. El optimizador fue AdamW con betas (0.9, 0.999) y epsilon 1e-08. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es de tipo supervisado completo (full fine-tuning).

No se especifican innovaciones técnicas particulares más allá del ajuste fino en el dominio financiero. El modelo se generó con `llama-factory` y el framework Transformers 5.7.0, PyTorch 2.13.0 y Datasets 4.0.0.

## Capacidades

- Generacion de texto en contexto conversacional, especializado en preguntas y respuestas sobre datos financieros.
- Razonamiento numerico y cuantitativo sobre documentos financieros, gracias al entrenamiento con ConvFinQA.
- Manejo de conversaciones multi-turno (por la naturaleza del dataset ConvFinQA).
- Capacidades multilingues: no disponibles, probablemente limitadas al ingles de los datasets financieros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el razonamiento financiero puede implicar pasos múltiples.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Analisis de estados financieros en conversacion: el modelo puede responder preguntas secuenciales sobre balances, cuentas de resultados y flujos de caja, extrayendo valores y calculando ratios. Adecuado porque fue entrenado especificamente con ConvFinQA, que simula este escenario.
- Asistente virtual para analistas de inversion: permite consultar datos financieros historicos mediante dialogo natural, por ejemplo "¿Cual fue el ingreso neto en 2023?" y luego "¿Y el margen bruto?".
- Atencion al cliente en banca: puede gestionar consultas sobre movimientos, saldos o productos financieros, aunque su entrenamiento se centra en documentos, no en productos bancarios.
- Generacion de resumenes financieros: dado un documento, el modelo puede producir resúmenes conversacionales, aunque no hay evidencia de que lo haga mejor que un modelo generalista.
- Extraccion de informacion de informes anuales: con el contexto adecuado, puede extraer cifras y responder preguntas especificas sobre el contenido.
- Educacion financiera: como tutor conversacional para explicar conceptos financieros y resolver ejercicios numericos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion `model-index` de la model card declara una lista vacía de resultados, y no se proporcionan comparaciones con otros modelos. Por tanto, no es posible evaluar cuantitativamente su rendimiento en tareas financieras ni generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, un modelo de 8B requiere aproximadamente 16 GB de VRAM. Con cuantizacion INT8 baja a unos 8 GB, y con INT4 a unos 4-5 GB. Estos valores son estimaciones teoricas basadas en el tamaño de pesos; no se han medido para este modelo concreto.
- GPU recomendadas: para FP16, una GPU con 16-24 GB (RTX 4090, A100 40GB, L4). Con cuantizacion INT4, puede ejecutarse en GPUs consumer de 8 GB (RTX 3060, RTX 4060).
- Si cabe en consumer GPU: sí, con cuantizacion INT4/INT8 en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo Transformers estandar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (con conversion previa) o TGI. No hay versiones GGUF publicadas en el repo.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 8B en una RTX 4090 con FP16 suele alcanzar 30-50 tokens/s en generacion autoregresiva, pero no hay datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_cap_b1000_s0 | 8.03B | no disponible | other | Finanzas (ConvFinQA) |
| Llama 3.1 8B | 8.03B | 128K | Llama 3.1 Community License | Generalista |
| Mistral 7B | 7.24B | 32K | Apache 2.0 | Generalista |
| Qwen 2.5 7B | 7.61B | 128K | Apache 2.0 | Generalista, multilingue |

No se dispone de datos de rendimiento comparativo. La diferencia clave es la especializacion en finanzas del modelo evaluado frente a los generalistas, y su licencia "other" que puede restringir el uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datos financieros en ingles (presumiblemente), puede heredar sesgos de esos documentos, como sesgo hacia empresas grandes o regiones especificas.
- Riesgo de alucinacion: al no haber benchmarks publicados, no se conoce su tasa de alucinacion en tareas numericas; es probable que invente cifras si no encuentra la respuesta en el contexto.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide saber cuantos tokens de documento financiero puede procesar de una vez.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente solo ingles.
- Restricciones de licencia: la licencia "other" no especifica terminos; es imprescindible contactar al autor antes de cualquier uso comercial.
- Caveat para produccion: el modelo fue generado automaticamente con `llama-factory` y la model card esta incompleta ("More information needed"). No hay garantias de calidad ni soporte. Se recomienda validar exhaustivamente en el dominio de uso antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_cap_b1000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- Dataset de entrenamiento (referencia, sin URL directa): capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_cap_b1000_s0
