# Aashish254/myna-v6

## Resumen

Myna v6 Unified es un modelo de clasificación de texto en inglés (encoder) afinado a partir de `microsoft/deberta-v3-large` por Aashish Mahato (usuario Aashish254). No es un modelo generativo: se presenta como un motor de "decisiones tipadas" que, dada una descripción de estado (texto libre) y un conjunto de preguntas con opciones, devuelve la opción más probable para cada pregunta. Su innovación principal es un mecanismo de *readout* enrutado por cardinalidad: las preguntas con hasta 16 opciones se puntúan desde una única secuencia empaquetada, mientras que las que superan ese umbral se derivan a una cabeza que evalúa cada opción frente a la competencia de su conjunto.

El modelo incorpora además calibración explícita: temperaturas y cuantiles de *split-conformal* ajustados sobre una partición CAL, lo que permite predicción selectiva (abstención con cobertura objetivo). Está pensado para flujos de agentes y toma de decisiones estructurada, no para generación de lenguaje.

Es relevante por su transparencia metodológica: la model card incluye una corrección de medición (2026-11-04) que rebaja el macro de 0,8620 a 0,7777 y reconoce que la primitiva ordinal `score` está a nivel de azar. El repositorio pesa 1,8 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con readout enrutado por cardinalidad y cabeza set-aware |
| Parametros totales | no disponible (el modelo base DeBERTa-v3-large tiene ~435 M, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (los ejemplos y datasets de evaluacion son en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un encoder transformer con atención desenredada, y le añade un sistema de lectura en dos vías. Para preguntas con hasta 16 opciones, todas se puntúan en una sola secuencia empaquetada (una pasada del encoder). Para preguntas con más opciones, se enruta a una cabeza "set-aware" que puntúa cada opción contra el resto de su conjunto. Sobre la salida se aplican temperaturas por celda y cuantiles de *split-conformal* ajustados en una partición CAL extraída del conjunto de entrenamiento.

El ajuste fino se realizó sobre el *train split* de la suite de evaluación `decision-v2-pilot`, que cubre 16 celdas (AG News, Amazon, Banking77, BoolQ, DBPedia14, IMDb, MNLI, SST-5, TREC, Yelp, entre otras). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación). La model card advierte de que el checkpoint re-encoda el estado completo en cada pregunta, por lo que no es un motor de streaming.

## Capacidades

- Clasificación de texto multiopción: responde preguntas de elección entre opciones sobre un estado textual dado.
- Clasificación zero-shot sobre categorías definidas en tiempo de inferencia mediante criterios en lenguaje natural.
- Enrutado por cardinalidad: hasta 16 opciones en lectura empaquetada; por encima, cabeza set-aware.
- Predicción calibrada: probabilidades con temperaturas ajustadas y ECE documentado.
- Predicción selectiva: abstención con coberturas objetivo (60 %, 90 %, 95 %) mediante conjuntos conformales.
- Toma de decisiones estructurada para agentes: salida tipada por pregunta (`choice` en el ejemplo de la model card).
- Capacidades multilingües: no disponibles; la evaluación es en inglés.
- No soporta generación de texto libre, tool calling, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte: clasificar el motivo de contacto (facturación, envío, cuenta) a partir del texto del cliente, usando preguntas de elección con criterios definidos. El modelo devuelve la categoría con probabilidad calibrada, lo que permite derivar a un humano cuando la confianza es baja.
- Enrutado de intenciones en asistentes conversacionales: mapear cada turno del usuario a una intención predefinida (estilo Banking77) antes de invocar la acción correspondiente en el backend.
- Moderación y etiquetado de contenido: decidir si un texto pertenece a una categoría temática (negocios, ciencia, deportes, mundo) con las celdas de AG News, útiles para pipelines de clasificación editorial.
- Análisis de sentimiento binario y recomendación: clasificar reseñas como positivas o recomendables (IMDb, Yelp) para paneles de reputación o alertas de calidad.
- Deduplicación y contraste de hipótesis: usar la celda de decisión contrastiva (`contrastive/decision`, 0,9847 de accuracy) para tareas de emparejamiento o verificación de afirmaciones contra un contexto.
- Enrutado de consultas en buscadores internos: clasificar el tipo de respuesta esperada (entidad, número, descripción, ubicación) con la celda TREC antes de seleccionar el índice o el motor de búsqueda.
- Agentes con abstención: en flujos automatizados donde un error es costoso, usar la predicción selectiva a 60 % de cobertura (0,9653 de accuracy) para dejar el resto a revisión humana.

## Benchmarks y rendimiento

Resultados corregidos sobre `decision-v2-pilot/test.jsonl` (1.176 bundles, 1.440 preguntas, split congelado):

| Arm | Macro | Overall | Bundle exact | Footing |
|---|---:|---:|---:|---|
| Myna v6 (routed) | 0,7777 | 0,7882 | 0,7509 | in-domain en las 16 celdas |
| Myna v6 (packed everywhere) | 0,7378 | 0,7368 | 0,6879 | routing off, mismos pesos |
| TF-IDF + regresión logística | 0,7111 | 0,6840 | 0,6293 | in-domain, solo texto |
| Laya 0.4.19 | 0,7050 | 0,6792 | 0,6182 | 6/16 celdas in-domain |
| VegaML 0.15.0 | 0,6160 | 0,5833 | 0,5119 | zero-shot |
| Train-prior majority | 0,3726 | 0,2965 | 0,2041 | in-domain |
| Zero-shot NLI | 0,3278 | 0,3465 | 0,3027 | zero-shot |

Desglose por celda (Myna v6, corregido):

| Celda | n | Accuracy |
|---|---:|---:|
| agnews/is_business | 43 | 0,9535 |
| agnews/is_scitech | 49 | 0,9184 |
| agnews/is_sports | 47 | 0,9787 |
| agnews/is_world | 45 | 1,0000 |
| agnews/topic | 116 | 0,9052 |
| amazon/stars | 80 | 0,1750 |
| banking77/intent | 116 | 0,6724 |
| boolq/answer | 80 | 0,8500 |
| contrastive/decision | 196 | 0,9847 |
| dbpedia14/category | 116 | 0,9569 |
| imdb/positive | 80 | 0,9625 |
| mnli/relation | 116 | 0,8621 |
| sst5/sentiment | 80 | 0,1500 |
| trec/answer_type | 116 | 0,9483 |
| yelp/rating | 80 | 0,2000 |
| yelp/recommend | 80 | 0,9250 |

Calibración y predicción selectiva (test): ECE (10 bins) 0,0637; Brier top-1 0,1187; accuracy selectiva a 60 % de cobertura 0,9653; a 90 % de cobertura 0,8318. Los cuantiles conformales enviados se ajustaron contra el objetivo ordinal desplazado y no cubren lo esperado en test; reajustados sobre el CAL reconstruido, los conjuntos al 90 % cubren 0,8778 y al 95 % cubren 0,9451, con ECE 0,0326. El autor advierte que la comparación no es como para como en presupuesto de entrenamiento ni constituye una reclamación de leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información. Como referencia, un encoder de la familia DeBERTa-v3-large en fp32 ocupa del orden de 1,7 GB de pesos; en fp16, en torno a 0,9 GB, más activaciones y overhead del runtime.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería acomodar el modelo en fp16; una RTX 4090 o A100 no son necesarias para este encoder.
- GPU de consumo: previsiblemente sí cabe en tarjetas consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: `transformers` (librería indicada), endpoints compatibles según los tags del repositorio, y el paquete propio `myna` que envuelve el checkpoint (`Myna("Aashish254/myna-v6")`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card señala que se re-encoda el estado completo en cada pregunta, lo que penaliza escenarios con muchas preguntas sobre el mismo estado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Macro (suite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Myna v6 | Encoder DeBERTa-v3-large + readout enrutado | no disponible | no disponible | 0,7777 | Apache 2.0 | Hugging Face |
| Laya 0.4.19 | Motor de decisiones tipadas | no disponible | no disponible | 0,7050 | no disponible | no disponible |
| VegaML 0.15.0 | Motor de decisiones zero-shot | no disponible | no disponible | 0,6160 | no disponible | no disponible |
| TF-IDF + regresión logística | Baseline clásico | no aplica | no aplica | 0,7111 | no aplica | implementación propia |

La comparación procede de la propia model card y no es como para como: Myna v6 está ajustado in-domain en las 16 celdas, mientras que Laya y VegaML operan out-of-domain o zero-shot. No se dispone de datos de contexto, parámetros ni licencia de las alternativas.

## Limitaciones y advertencias

- La primitiva ordinal `score` está a nivel de azar tras la corrección del objetivo; no debe usarse para decisiones ordinales sin reentrenar esa cabeza.
- Las celdas ordinales rinden muy mal: `amazon/stars` 0,1750, `sst5/sentiment` 0,1500 y `yelp/rating` 0,2000, coherentes con el fallo de la cabeza ordinal.
- Los cuantiles conformales enviados se ajustaron contra un objetivo desplazado y no garantizan cobertura en test; solo sirven como señal de ranking.
- No es un motor de streaming: re-encoda el estado completo en cada pregunta, con coste lineal en el número de preguntas.
- El autor declara explícitamente que no es state of the art y que la comparación con Laya y VegaML no es equitativa en presupuesto de entrenamiento.
- Idiomas soportados no documentados; toda la evaluación es en inglés, por lo que el rendimiento en castellano es desconocido.
- No se documentan sesgos conocidos ni evaluación de robustez fuera de la suite.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base DeBERTa-v3-large tiene su propia licencia (MIT) que conviene verificar.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas confiadas en dominios fuera de la distribución de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Aashish254/myna-v6
- Repositorio principal (paper y código): https://github.com/aashish254/myna
- Registro de corrección de medición: https://github.com/aashish254/myna/blob/main/paper/MEASUREMENT-CORRECTION.md
- Demo de decisiones tipadas: https://github.com/aashish254/myna-demo
- Perfil del autor: https://github.com/aashish254/
