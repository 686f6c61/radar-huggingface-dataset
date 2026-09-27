# shanaka95/laya-fintiment

## Resumen

Laya FinTiment es un clasificador de sentimiento financiero de tres clases (`positive`, `negative`, `neutral`) desarrollado por el usuario shanaka95 a partir del modelo base `convaiinnovations/laya`. Se trata de un fine-tune especializado: parte de un encoder ModernBERT-large de 421 millones de parametros al que se anade una cabeza de decision tipada, y se ajusta con RLCD (Reinforcement Learning for Calibrated Decisions) para resolver una unica tarea de clasificacion sobre texto financiero.

El problema que aborda es la baja fiabilidad del modelo base en tareas de decision calibrada: el checkpoint original acierta en torno al 70 % en el conjunto de test, mientras que este fine-tune eleva la accuracy al 94,86 % con la misma llamada de inferencia (`laya.Agent.predict()`). La mejora mas notable se da en el recall de la clase `positive`, que pasa de 0,584 a 0,954.

Es relevante porque demuestra que un ajuste con reglas de puntuacion estrictamente propias (log + esferica) y temperaturas de calibracion especificas puede convertir un modelo generico de decisiones en un clasificador de produccion para senales de mercado, ejecutable en una unica GPU de 12 GB y con latencias p50 de 36,6 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) + cabeza de decision tipada |
| Parametros totales | 421.293.830 (421 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el encoder base ModernBERT-large admite hasta 8.192 tokens, sin confirmacion para este fine-tune) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizaciones documentadas) |
| Idiomas soportados | no disponible (el dataset de entrenamiento FinGPT-sentiment-train es predominantemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 842 MB) mas subdirectorios `encoder/` y `tokenizer/` y `rl_agent_config.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Laya: un encoder ModernBERT-large con una cabeza de decision que soporta distintos esquemas de pregunta (`choice`, `score`, `noul`). En este fine-tune solo se entrena el esquema `choice` con tres etiquetas mutuamente excluyentes. Cada ejemplo se presenta al modelo con una pregunta tipada que incluye instrucciones y criterios textuales por clase, y la respuesta se restringe a una de las tres etiquetas.

El entrenamiento usa RLCD con reglas de puntuacion estrictamente propias (log + esferica, con `w_sph=0.75`; se descarta RPS porque todas las preguntas son de tipo `choice`). El algoritmo es REINFORCE con baseline de media de grupo y `group_size=4` pasadas forward ruidosas por ejemplo. Se entreno durante 4 epocas (7.624 pasos de optimizador, batch efectivo 32) sobre 61.017 ejemplos del split de entrenamiento del dataset `shanaka95/fingpt-sentiment-3class`, tras reservar 400 items para calibracion posterior. Se uso AdamW con schedule coseno de learning rate, gradient checkpointing activado, `micro_batch=16` y `grad_accum=2`, todo en una unica GPU de 12 GB. Las temperaturas finales de calibracion fueron `[5.013, 1.2, 1.2]` (choice / score / noul) y la perdida media por epoca evoluciono de 0,257 a 0,493, 0,323 y finalmente 0,199.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases excluyentes: `positive`, `negative`, `neutral`.
- Salida probabilistica calibrada por clase (masa de probabilidad concentrada en la etiqueta elegida), con ejemplo de `0.9488` en un caso real.
- Inferencia mediante la libreria `laya` con la API `laya.Agent.predict()` y esquema de pregunta tipada.
- Ejecucion en GPU o CPU (`device="cuda"` / `device="cpu"`) y soporte de inferencia por lotes mediante `laya.Router`.
- Capacidad multilingue: no disponible; el entrenamiento se limita a la distribucion del dataset FinGPT (noticias y tweets en ingles).
- Tool calling / function calling: no disponible (modelo de clasificacion, no generativo de agentes).
- Razonamiento multi-paso o modo thinking: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Monitorizacion de noticias financieras en tiempo real: el modelo clasifica titulares y cuerpos de noticia en `positive`/`negative`/`neutral` con 36,6 ms de latencia p50, lo que permite procesar flujos continuos de prensa economica en pipelines de streaming.
- Analisis de sentimiento en redes sociales financieras: entrenado sobre la distribucion de tweets financieros de FinGPT, es adecuado para puntuar menciones de activos y detectar cambios de tono en el discurso minorista.
- Generacion de features para estrategias cuantitativas: la probabilidad calibrada por clase puede introducirse como senal de sentimiento en backtests y modelos de prediccion de volatilidad o retorno.
- Enriquecimiento y etiquetado de corpus financieros: uso como etiquetador automatico de grandes volumenes de texto para construir datasets de entrenamiento o auditar calidad de anotaciones humanas.
- Filtrado y priorizacion de alertas para analistas: clasificacion previa de un feed de documentos para elevar solo los items con sentimiento claro (`positive` con F1 0,952) y reducir el ruido en bandejas de analisis.
- Investigacion academica en finanzas conductuales: el modelo permite replicar experimentos de sentimiento a escala con coste de computo bajo, usando una sola GPU de 12 GB.
- Moderacion y clasificacion en plataformas financieras: categorizacion de comentarios y resenas de productos de inversion segun polaridad financiera.

## Benchmarks y rendimiento

Evaluacion sobre un split de test estratificado de 15.355 items del dataset `shanaka95/fingpt-sentiment-3class`, con el mismo esquema `choice` y la misma llamada de inferencia en ambos modelos.

| Metrica | Zero-shot (`convaiinnovations/laya`) | Fine-tuned (este modelo) | Delta |
|---|---|---|---|
| Accuracy global | 0,7024 (10.786 / 15.355) | 0,9486 (14.566 / 15.355) | +0,2462 (+24,62 pp) |
| F1 — positive | 0,694 | 0,952 | +0,258 |
| F1 — neutral | 0,696 | 0,949 | +0,253 |
| F1 — negative | 0,726 | 0,942 | +0,216 |
| Recall — positive | 0,584 | 0,954 | +0,370 |
| Latencia p50 | 38,6 ms | 36,6 ms | -2 ms |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros). El autor indica que no se ha medido todavia comparacion de distribuciones suaves (ECE / Brier contra distribuciones gold).

## Requisitos de hardware

- VRAM estimada en inferencia fp16/bf16: en torno a 1-2 GB para los 421 M de parametros mas overhead de activaciones y tokenizer.
- VRAM estimada en fp32: aproximadamente 1,7-2,5 GB.
- VRAM estimada en int8: del orden de 0,5-0,7 GB de pesos.
- GPU recomendadas: cualquier GPU con 12 GB o mas; el fine-tune se realizo en una unica GPU de 12 GB. Opciones holgadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100.
- Cabe en GPU de consumidor: si, en practicamente toda la gama actual con 8 GB o mas, dado el tamano reducido del modelo.
- Opciones de despliegue: libreria `laya` (>=0.1.6) con `transformers` (>=4.48.0). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: p50 de 36,6 ms medida en la evaluacion reportada. Throughput no disponible.
- Nota de entorno: se recomienda `USE_TF=0` para evitar un bloqueo abseil/TF al cargar `transformers`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Accuracy reportada | Licencia |
|---|---|---|---|---|---|
| shanaka95/laya-fintiment (este) | 421 M | no disponible | Sentimiento financiero 3 clases | 0,9486 | apache-2.0 |
| convaiinnovations/laya (base) | 421 M | no disponible | Decision tipada generica | 0,7024 (zero-shot en esta tarea) | no disponible |
| Modelos tipo FinBERT | no disponible en la informacion proporcionada | no disponible | Sentimiento financiero | no disponible | no disponible |
| Modelos generativos FinGPT | no disponible en la informacion proporcionada | no disponible | Multiples tareas financieras | no disponible | no disponible |

La comparacion cuantitativa solo es posible frente al modelo base, ya que la model card no aporta cifras de terceros en el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Solo tres clases: no soporta intensidad, tematica ni analisis por aspecto; para eso haria falta otro fine-tune o los esquemas `score` / `noul`, presentes en el checkpoint subyacente pero no entrenados aqui.
- Deriva fuera de distribucion: entrenado sobre la distribucion FinGPT-sentiment-train (noticias y tweets), por lo que `earnings calls`, informes de analistas y documentos regulatorios son OOD y pueden presentar deriva de calibracion.
- Se recomienda recalibrar las temperaturas por dominio antes de confiar en las probabilidades; el notebook upstream documenta como hacerlo.
- No se ha medido la calidad de la distribucion suave (ECE, Brier) frente a distribuciones gold; solo se reporta accuracy por argmax.
- Sesgos conocidos: no documentados en la informacion disponible, aunque al entrenar sobre noticias y tweets financieros heredara los sesgos de esa fuente.
- Riesgo de alucinacion: bajo en terminos generativos al ser un clasificador de etiqueta unica, pero puede producir etiquetas erroneas con alta confianza en textos OOD.
- Licencia apache-2.0: permite uso comercial, pero se desconoce la licencia del modelo base `convaiinnovations/laya`, lo que conviene verificar antes de un despliegue en produccion.
- Contexto e idiomas no declarados: no hay garantia documentada de rendimiento fuera del ingles ni de entradas de longitud superior a las vistas en entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shanaka95/laya-fintiment
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de fine-tune: https://huggingface.co/datasets/shanaka95/fingpt-sentiment-3class
- Dataset original FinGPT: https://huggingface.co/datasets/FinGPT/fingpt-sentiment-train
- Repositorio de reproduccion: https://github.com/shanaka95/laya-fintiment
- Repositorio de la libreria Laya: https://github.com/NandhaKishorM/laya
- Notebook de fine-tune upstream: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
