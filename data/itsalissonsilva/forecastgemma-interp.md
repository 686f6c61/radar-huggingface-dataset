# itsalissonsilva/ForecastGemma-Interp

## Resumen

ForecastGemma-Interp es un adaptador LoRA de rango 16 entrenado sobre google/gemma-3-1b-it para una tarea muy concreta: emitir una probabilidad binaria de que un evento descrito en lenguaje natural ocurra antes de una fecha límite. El autor es itsalissonsilva y lo publica como artefacto de investigación, no como producto. La idea central es leer los logits del siguiente token para los caracteres `0` y `1` y normalizarlos para obtener una probabilidad calibrada, en lugar de pedirle al modelo una respuesta en texto libre. El adaptador se ha entrenado con 322 preguntas binarias reales, fechadas y resueltas, procedentes del conjunto de datos ForecastBench (Manifold, Metaculus y Polymarket).

La relevancia del modelo es metodológica más que de rendimiento. El autor publica, junto con los pesos, un conjunto de controles independientes (un LoRA entrenado con resultados barajados y otro solo de formato) y un análisis de interpretabilidad con 26 ablaciones de capas y 27 comparaciones de estados ocultos sobre 64 prompts fijos. Eso permite evaluar si la mejora observada respecto a Gemma base se debe a la señal de la pregunta o a artefactos de formato. El resultado es honesto y algo decepcionante: el adaptador mejora a Gemma base y a los controles, pero queda muy por detrás de la probabilidad de mercado que se le suministra en la entrada (Brier 0,158 frente a 0,102 del prior de mercado).

El modelo base es un transformer decoder-only de 1.000 millones de parámetros con ventana de contexto de 32.000 tokens, pero el adaptador no explota esa ventana: el helper de inferencia procesa una pregunta con su criterio de resolución, contexto y prior, y devuelve una única probabilidad. No hay recuperación, verificación de hechos ni control de fechas. Es, en palabras del propio autor, una "lectura de forecasting experimental, no un agente de forecasting general".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre transformer decoder-only Gemma 3 1B IT; objetivos Q/V |
| Parametros totales | 1.000 millones en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos de rango 16 (tamaño del repo: 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens en el modelo base; el helper de inferencia no especifica truncado propio |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el autor reporta evaluación en bfloat16 y soporte de float32 en CPU) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use, con las restricciones de la sección 3.2 y la Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado desde google/gemma-3-1b-it |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado a las proyecciones de query y value de Gemma 3 1B IT. Se entrenó con learning rate 1e-4, batch size 4, tres épocas y una sola semilla; la época 2 se seleccionó por log score sobre validación. La revisión del modelo base fijada es `dcc83ea841ab6100d6b47a070329e1ba4cf78752`. El conjunto de entrenamiento son 322 preguntas binarias con resultado resuelto, extraídas de ForecastBench con texto, criterios, contexto y priors de mercado congelados en commits anteriores a cada fecha límite de pronóstico. Los plazos de entrenamiento cubren de marzo a diciembre de 2025, la validación de enero a marzo de 2026 y el test tiene fechas límite el 7 de junio, el 2 de agosto y el 13 de septiembre de 2026, con IDs de pregunta disjuntos.

La innovación técnica no está en la arquitectura sino en la interfaz de lectura: el modelo no genera texto, sino que se extraen los logits del siguiente token para los caracteres `0` y `1` y se normalizan, con temperatura 2,0 y sesgo cero, para producir una probabilidad binaria. El autor reporta además una masa de tokens legales como diagnóstico. La parte de interpretabilidad consiste en cinco intensidades de adaptador, las 26 eliminaciones individuales de capas y 27 comparaciones de estados ocultos sobre 64 prompts de test fijos; cada eliminación es una intervención real sobre las contribuciones del adaptador, no un circuito descubierto ni una etiqueta semántica. Las predicciones recargadas y restauradas coincidieron exactamente con las originales en la configuración de GPU registrada. No se reclamó descomposición SAE ni transferencia causal entre modelos.

## Capacidades

- Lectura de probabilidad binaria: dado un evento con fecha límite, criterio de resolución, contexto y prior de mercado, devuelve una probabilidad calibrada, la lectura binaria cruda y la masa de tokens legales.
- Forecasting binario a corto y medio plazo sobre preguntas de mercados de predicción (Manifold, Metaculus, Polymarket).
- Calibración post-hoc: el adaptador se acompaña de parámetros de calibración ajustados sobre un subconjunto de validación de 55 preguntas, disjunto del de selección de época (56 preguntas).
- Interpretabilidad instrumental: ablaciones de capa y comparaciones de estados ocultos reproducibles sobre prompts fijos.
- No soporta tool calling ni function calling de forma nativa en la interfaz evaluada.
- No es un agente multi-paso: el helper no hace recuperación, verificación de hechos ni control de fechas.
- Multilingüe: no; solo inglés.
- Modo thinking, visión o audio: no disponibles en este adaptador.

## Casos de uso

- Investigación en calibración de LLM: usar el par adaptador real y adaptadores de control (resultados barajados y solo formato) para medir cuánto de una mejora aparente en forecasting se debe a la señal de la pregunta y cuánto al formato de salida. El paquete incluye pesos y probabilidades por pregunta de los controles.
- Estudio de interpretabilidad mecanicista: las 26 ablaciones de capa y las 27 comparaciones de estados ocultos permiten reproducir el protocolo de intervención sobre un adaptador pequeño y de bajo coste, sin necesidad de GPUs de gran memoria.
- Línea base de referencia en papers de forecasting: sirve como baseline "LLM adaptado de 1B" frente a la que comparar modelos mayores o métodos de agregación, siempre reportando también el prior de mercado como cota superior.
- Docencia y demostración de lectura por logits: el ejemplo de `forecast.py` muestra cómo convertir los logits de dos tokens en una probabilidad calibrada, útil para explicar interfaces de salida alternativas a la generación de texto.
- Auditoría de artefactos derivados de Gemma: al ser un derivado con aviso de modificación explícito, sirve para estudiar cómo se documentan y cumplen las restricciones de la Gemma Prohibited Use Policy en adaptadores publicados.
- Prototipado de pipelines de evaluación con conjuntos congelados: el particionado por IDs disjuntos y por fechas de congelación de datos es un ejemplo reutilizable para construir evaluaciones sin fuga temporal en tareas de predicción.

## Benchmarks y rendimiento

El model-index oficial está vacío (`results: []`). Los datos que siguen provienen de la tabla de resultados de la model card, sobre las mismas 256 preguntas retenidas. Menor Brier y menor log score son mejores.

| Condición | Brier | Log score |
|---|---:|---:|
| Prior de mercado congelado | 0,10156 | 0,32981 |
| Baseline Qwen3.5-9B congelado, crudo | 0,15076 | 0,48045 |
| Baseline Qwen3.5-9B congelado, calibrado | 0,15770 | 0,50338 |
| Gemma adaptado, calibrado | 0,15833 | 0,49507 |
| Gemma adaptado, crudo | 0,18742 | 0,77451 |
| LoRA con resultados barajados, calibrado | 0,25231 | 0,70700 |
| LoRA solo de formato, calibrado | 0,26655 | 0,81282 |
| Gemma base, calibrado | 0,29587 | 0,96210 |
| Gemma base, crudo | 0,37522 | 2,98300 |

La calibración y la selección de época usan subconjuntos de validación disjuntos (55 y 56 preguntas). El baseline Qwen3.5-9B se implementa en `qwen_evaluation/` como evaluación congelada, con el mismo test de 256 preguntas, lectura de dos tokens, thinking desactivado y los mismos 55 IDs de calibración. El autor advierte que la comparación no establece una diferencia significativa entre ambos modelos y que ambos quedan por detrás del prior de mercado suministrado. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo base de 1.000 millones de parámetros en bfloat16 ocupa aproximadamente 2 GB de pesos, más el adaptador LoRA (repo de 0,1 GB) y las activaciones.
- GPU recomendadas: el autor reporta evaluación en GPU con bfloat16 y SDPA, sin especificar el modelo de tarjeta. Cualquier GPU con al menos 8 GB de VRAM debería acomodar el modelo base en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; no hay cifras publicadas de consumo medido.
- Opciones de despliegue: el helper `forecast.py` sobre PyTorch 2.6.0, Transformers 4.57.1, PEFT 0.17.1, Accelerate 1.10.1 y SentencePiece 0.2.1. Soporta inferencia en CPU con float32, aunque el resultado de paridad reportado se obtuvo en GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Brier en el test de 256 preguntas | Licencia |
|---|---|---|---|---|---|
| ForecastGemma-Interp | 1B base + LoRA r16 | 32.000 (base) | Lectura binaria por logits, adaptador LoRA | 0,15833 (calibrado) | gemma |
| Qwen3.5-9B (baseline congelado) | 9B | no disponible | Lectura binaria por logits, sin ajuste | 0,15076 (crudo) | no disponible en la información |
| Gemma 3 1B IT (base) | 1B | 32.000 | Lectura binaria por logits, sin ajuste | 0,29587 (calibrado) | gemma |
| Prior de mercado congelado | no aplica | no aplica | Probabilidad agregada del mercado | 0,10156 | no aplica |

La comparación con el prior de mercado no es la de un modelo rival, sino la de una cota de referencia que el autor incluye deliberadamente: ningún artefacto del estudio la supera. La diferencia entre ForecastGemma-Interp y Qwen3.5-9B no se declara estadísticamente significativa.

## Limitaciones y advertencias

- Estudio retrospectivo de una sola semilla sobre una cohorte pequeña y seleccionada de preguntas de mercado; sin registro en torneos en vivo ni evaluación de despliegue futuro.
- No demuestra ventaja sobre el prior de mercado suministrado, que sigue siendo un pronóstico sustancialmente más fuerte; el autor recomienda no usarlo como sustituto de esa línea base.
- El helper no realiza recuperación, verificación de hechos ni control de fechas; si se le pasa información no contemporánea, el resultado no es válido como pronóstico.
- La salida de `generate()` no es la interfaz evaluada; usar generación de texto libre en lugar de la lectura de logits invalida la calibración reportada.
- Riesgo de alucinación y de sobreajuste al formato: el control "solo formato" obtiene Brier 0,26655, lo que muestra que parte de la señal aparente puede venir de la estructura de la entrada.
- Idiomas: solo inglés; no hay evaluación multilingüe.
- Las preguntas relacionadas pueden estar correlacionadas aunque los IDs sean disjuntos, lo que afecta a la interpretación de los intervalos de confianza.
- Eliminar ciertas capas mejora la puntuación de test de este checkpoint, pero los pesos publicados mantienen el adaptador completo seleccionado por validación; no debe interpretarse como una receta de poda.
- Licencia Gemma: uso comercial sujeto a los Gemma Terms of Use y a la sección 3.2, incluida la Gemma Prohibited Use Policy. Es un artefacto modificado de Google Gemma y debe conservarse el aviso de modificación (`LICENSE`, `NOTICE`, `GEMMA_PROHIBITED_USE_POLICY.txt`).
- Los datos de ForecastBench tienen sus propios términos CC BY-SA 4.0; la model card no los relicencia.
- El análisis de interpretabilidad se hizo sobre un conjunto de test ya abierto y no seleccionó ni reentrenó el checkpoint publicado; no se reclama descomposición SAE ni transferencia causal entre modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsalissonsilva/ForecastGemma-Interp
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset ForecastBench: https://github.com/forecastingresearch/forecastbench-datasets
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
