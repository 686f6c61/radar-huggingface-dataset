# AwakeningOS/BabyLM-Strict-Small-Dense-58M

## Resumen

BabyLM Strict-Small Dense 58M es un modelo de lenguaje base en ingles desarrollado por AwakeningOS, entrenado desde cero sobre el corpus BabyLM 2026 Strict-Small, limitado a 10 millones de palabras. Forma parte de la familia de retos BabyLM, cuyo objetivo es investigar como se puede aprender lenguaje de forma eficiente con cantidades de datos comparables a las que recibe un nino durante sus primeros anos, en lugar de recurrir a corpus de billones de tokens.

El modelo emplea una arquitectura transformer decoder densa de 12 bloques, con anchura 512, 8 cabezas de atencion, SwiGLU de anchura intermedia 1.536, embeddings rotatorios y pre-RMSNorm. Cuenta con 57.684.480 parametros y un vocabulario de 32.768 tokens Unigram con pesos de entrada y salida compartidos. Su innovacion principal es el entrenamiento combinado de prediccion causal y prediccion enmascarada del siguiente token (masked next-token prediction, MNTP), alternando objetivos durante el ciclo de entrenamiento.

Es relevante en el contexto de investigacion sobre eficiencia de datos y adquisicion del lenguaje, no como modelo de produccion. Su tamano reducido y su licencia CC0 lo hacen util para experimentos controlados de interpretabilidad, evaluacion linguistica y estudio de tecnicas de entrenamiento con presupuestos de datos estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (12 bloques, anchura 512, 8 cabezas, SwiGLU 1.536, RoPE, pre-RMSNorm) |
| Parametros totales | 57.684.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Longitudes de entrenamiento de 128, 256 y 512 tokens (contexto maximo no declarado explicitamente) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32; compatible con el formato safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC0 1.0 Universal |
| Formato de pesos | safetensors (FP32), cargable con la implementacion Llama de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con 12 bloques, anchura de 512, 8 cabezas de atencion, capas SwiGLU con anchura intermedia de 1.536, embeddings posicionales rotatorios (RoPE) y pre-RMSNorm. El vocabulario consta de 32.768 tokens Unigram con pesos de entrada y salida atados. Se entreno con longitudes de secuencia de 128, 256 y 512 tokens y un tamano de lote de 16.384 posiciones de token por actualizacion completa, con semilla 20260907.

El entrenamiento se realizo sobre el corpus BabyLM 2026 Strict-Small (10 millones de palabras) durante diez pasadas, equivalentes a 100 millones de exposiciones de palabra. Combina prediccion causal y prediccion enmascarada del siguiente token (MNTP): tras 60 millones de exposiciones, el ciclo alterna cuatro actualizaciones con objetivo unico y cuatro con ejemplos causales y enmascarados combinados. En el empaquetado, el modelo puede usar contexto de lineas de la misma fuente, pero los objetivos del siguiente token permanecen dentro de sus lineas originales. La optimizacion usa AdaMuon para las matrices de los bloques y AdamW para embeddings y pesos de normalizacion, con tasas de aprendizaje que alcanzan 0,0045 y 0,0015 respectivamente a 1,6 millones de exposiciones, se mantienen hasta 35 millones y decaen con coseno hasta cero a 100 millones.

## Capacidades

- Generacion de texto en ingles mediante continuacion causal (ejemplo de prompt: "When the rain stopped,").
- Puntuacion de probabilidad de tokens mediante masked next-token prediction (MNTP), con atencion bidireccional y lectura de la probabilidad del token objetivo desde la posicion precedente.
- Evaluacion zero-shot en tareas linguisticas: BLiMP, BLiMP Supplement, EWoK, Entity Tracking, COMPS y GlobalPIQA.
- Ajuste fino supervisado en tareas (Super)GLUE (siete tareas evaluadas de forma independiente).
- Capacidad multilingue: no disponible; solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre eficiencia de datos: el modelo sirve como linea base controlada para estudiar cuanto lenguaje se puede aprender con 10 millones de palabras, comparando variantes de objetivos de entrenamiento (causal frente a MNTP) bajo el mismo presupuesto.
- Experimentos de interpretabilidad: con 57,7 millones de parametros y pesos FP32, permite analizar activaciones, atencion y representaciones internas con recursos de computo modestos, algo inviable en modelos de miles de millones de parametros.
- Evaluacion linguistica controlada: su rendimiento en BLiMP (71,82) y BLiMP Supplement (65,10) lo hace adecuado para medir conocimiento gramatical en experimentos de ablacion sobre datos de entrenamiento.
- Docencia y formacion: la carga del modelo con Transformers y su generacion de continuaciones en CPU permiten demostrar el ciclo completo de entrenamiento y evaluacion de un modelo de lenguaje en un curso o taller.
- Pruebas de tecnicas de optimizacion: el uso combinado de AdaMuon y AdamW con decaimiento coseno ofrece un caso reproducible para estudiar estabilidad de entrenamiento en modelos pequenos.
- Ajuste fino en tareas (Super)GLUE: sirve como punto de partida para experimentos de transferencia en tareas de clasificacion y similitud textual en ingles, con tasas de aprendizaje del orden de 4e-5.
- Verificacion de exportacion de pesos: el modelo incluye comprobaciones de equivalencia entre el modelo nativo y la exportacion (diferencia maxima de logits inferior a 0,000014), util como referencia para validar pipelines de conversion.

## Benchmarks y rendimiento

Resultados locales de BabyLM 2026 English Strict-Small (checkpoint de 100 millones de exposiciones de palabra):

| Componente NLP | Puntuacion local |
|---|---:|
| BLiMP | 71,82 |
| BLiMP Supplement | 65,10 |
| EWoK | 52,15 |
| Entity Tracking | 23,99 |
| COMPS | 53,94 |
| GlobalPIQA (media de las dos divisiones en ingles) | 40,09 |
| (Super)GLUE (media de siete tareas) | 68,63 |
| **Media NLP (peso igual en las siete filas)** | **53,6746** |

La media de las seis suites zero-shot fue de 51,1817. Las puntuaciones se calcularon en FP32 con MNTP. El ajuste fino uso una tasa de aprendizaje de 4e-5. Son resultados posteriores al reto calculados localmente; la clasificacion publica del leaderboard se calcula a partir de predicciones por item. La evaluacion cubre solo tareas NLP; Reading y Age of Acquisition no se midieron.

## Requisitos de hardware

- VRAM estimada para inferencia: con 57,7 millones de parametros en FP32, los pesos ocupan aproximadamente 231 MB; en FP16 unos 115 MB; en cuantizacion de 8 bits unos 58 MB y en 4 bits unos 29 MB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas de VRAM. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con la implementacion Llama integrada (el autor usa `attn_implementation="eager"`); el tag `text-generation-inference` sugiere compatibilidad con TGI y endpoints. No se ha confirmado soporte en llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyLM Strict-Small Dense 58M | 57,7 M | Entrenado a 128/256/512 tokens | Media NLP 53,6746 (local) | CC0 1.0 | Hugging Face |
| Otros modelos BabyLM 2026 Strict-Small | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | Leaderboard BabyLM 2026 |
| Modelos de lenguaje pequenos de proposito general (por ejemplo, GPT-2 small, 124 M) | 124 M | 1.024 tokens | No comparable directamente (no evaluado en BabyLM) | Distintas licencias | Hugging Face |

No se dispone en la informacion proporcionada de resultados de otros participantes del reto BabyLM 2026 Strict-Small para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no soporta otros idiomas.
- Presupuesto de datos muy limitado (10 millones de palabras), lo que restringe el conocimiento factual y la calidad de generacion frente a modelos entrenados con corpus masivos.
- Riesgo elevado de alucinacion y de continuaciones incoherentes en temas especializados o fuera de dominio.
- Contexto de entrenamiento corto (hasta 512 tokens); no se declara una longitud de contexto maxima superior.
- No dispone de tool calling, capacidades de agente, vision ni audio.
- La evaluacion publicada cubre solo tareas NLP; Reading y Age of Acquisition no se midieron, por lo que su perfil linguistico esta incompleto.
- Los resultados son calculados localmente y pueden diferir de los del leaderboard oficial, que usa predicciones por item.
- Licencia CC0 1.0: uso, ajuste fino, copia y redistribucion permitidos, incluido uso comercial, sin necesidad de atribucion ni notificacion. Los textos fuente de BabyLM y el software de terceros tienen sus propias condiciones, que deben respetarse.
- No esta pensado para produccion ni para tareas de usuario final; su valor es principalmente de investigacion y docencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AwakeningOS/BabyLM-Strict-Small-Dense-58M
- Corpus de entrenamiento BabyLM 2026 Strict-Small: https://huggingface.co/datasets/BabyLM-community/BabyLM-2026-Strict-Small
- Leaderboard oficial BabyLM 2026: https://huggingface.co/spaces/BabyLM-community/BabyLM-Leaderboard-2026
- Resultados de evaluacion (evaluation.json): https://huggingface.co/AwakeningOS/BabyLM-Strict-Small-Dense-58M/blob/main/evaluation.json
- Resultados de verificacion de exportacion (verification.json): https://huggingface.co/AwakeningOS/BabyLM-Strict-Small-Dense-58M/blob/main/verification.json
- Licencia (LICENSE): https://huggingface.co/AwakeningOS/BabyLM-Strict-Small-Dense-58M/blob/main/LICENSE
