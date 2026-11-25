# BUT-FIT/orca-gemma-3-4b-it-multinomial-rationale-dropout

## Resumen

ORCA (Open-ended Response Correctness Assessment) es un adaptador LoRA sobre `google/gemma-3-4b-it` desarrollado por el grupo BUT-FIT (Brno University of Technology, Faculty of Information Technology) que evalúa la corrección de respuestas abiertas a preguntas sobre audio. Dada una pregunta, una respuesta de referencia y, opcionalmente, un contexto (rationale y/o transcripción), el modelo predice la calificación humana media en el rango [0, 1] y la varianza esperada entre anotadores. No es un modelo generativo de uso general, sino un clasificador de regresión calibrada para evaluación automática de sistemas de audio-question-answering.

La variante `multinomial-rationale-dropout` se distingue del modelo original del artículo por dos cambios en el entrenamiento: se aplica *rationale dropout* con probabilidad 0,3 (el contexto se elimina en un 30 % de los ejemplos durante las etapas 2 y 3), de modo que el modelo funciona tanto con contexto como sin él, y se incorporan datos adicionales de cinco benchmarks (SAKURA, NSF-QA, MuChoMusic, SD-Eval, TREA). La pérdida es una verosimilitud multinomial sobre una escala Likert de 5 puntos.

El modelo tiene 4 000 millones de parámetros en el backbone (no se especifica el número de parámetros entrenables del adaptador) y está pensado para integrarse en pipelines de evaluación de sistemas de IA conversacional sobre audio. Su relevancia radica en que sustituye evaluaciones automáticas basadas en coincidencia superficial por estimaciones correlacionadas con juicio humano (Spearman 0,911 en el test de MMAU/MMAR), algo crítico cuando el sistema evaluado genera respuestas abiertas y no hay una única respuesta canónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (rank 128, alpha 128) |
| Parametros totales | 4 000 millones (modelo base `google/gemma-3-4b-it`); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; entrenado en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT para los pesos ORCA; el modelo base queda sujeto a los terminos de uso de Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el modelo base por separado |
| Funcion de perdida | verosimilitud multinomial sobre escala Likert de 5 puntos |
| Rationale dropout | 0,3 (etapas 2 y 3) |
| Semilla de entrenamiento | 108 |
| Umbral de clamping | 0,075 (varianza en escala 0-1) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 y alpha 128 montado sobre el transformer decoder-only Gemma 3 de 4 000 millones de parámetros en su variante instruction-tuned. La cabeza de salida no genera texto libre: produce una distribución multinomial sobre cinco niveles de corrección (escala Likert), de la que se derivan la media esperada (`orca_score`) y la varianza (`orca_variance`). El entrenamiento se realizó en bfloat16 con la semilla 108.

El currículo de entrenamiento tiene tres etapas. La primera usa pares pregunta-respuesta sintéticos a gran escala calificados por jueces LLM, sin rationale dropout. La segunda incorpora respuestas de modelos de lenguaje de audio a preguntas de MMAU y MMAR, además de preguntas de SAKURA, NSF-QA, MuChoMusic, SD-Eval y TREA, todas puntuadas por cinco jueces LLM; en esta etapa y en la siguiente se aplica el rationale dropout del 30 %. La tercera etapa emplea calificaciones humanas sobre MMAU y MMAR con una partición estratificada (el test no se ha visto durante el entrenamiento); MMAU-Pro queda completamente fuera del entrenamiento. La innovación técnica principal es precisamente el rationale dropout, que hace al modelo robusto a la ausencia de contexto en inferencia, junto con el modelado explícito de la varianza entre anotadores.

## Capacidades

- Evaluación de corrección de respuestas abiertas a preguntas sobre audio, devolviendo una puntuación continua en [0, 1].
- Estimación de la desacuerdo entre anotadores (`orca_variance`), útil para detectar preguntas subjetivas o ambiguas.
- Funcionamiento con y sin contexto (rationale y/o transcripción) gracias al rationale dropout.
- Clasificación/regresión calibrada, no generación de texto libre.
- Procesamiento de entradas multimodales en la medida en que el modelo base Gemma 3-4B-IT lo permite; la model card no detalla el preprocesado de audio.
- Integración con el paquete `orca-score` mediante `OrcaScorer` y la CLI `orca-score`.
- Soporte de evaluación por lotes (`score_many`) sobre ficheros JSONL.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Evaluación automática de sistemas de audio-question-answering: puntuar las respuestas generadas por un modelo de audio contra una referencia y obtener una estimación de calidad correlacionada con juicio humano (Spearman 0,911 en MMAU/MMAR), lo que permite iterar sobre el sistema sin anotación humana continua.
- Control de calidad en pipelines de anotación: usar `orca_variance` para identificar ítems con alta discrepancia entre anotadores y priorizar su revisión manual, reduciendo el coste de auditoría.
- Benchmarking interno de modelos de audio: comparar variantes de un sistema sobre el mismo conjunto de preguntas y obtener métricas continuas en lugar de exact-match, más sensibles a mejoras graduales.
- Filtrado de datos de entrenamiento: descartar o reetiquetar pares pregunta-respuesta de baja calidad en un corpus de audio-QA antes de usarlos para fine-tuning.
- Evaluación sin contexto en producción: cuando no se dispone de rationale ni transcripción, el modelo mantiene rendimiento (Spearman 0,908 en MMAU/MMAR sin contexto), lo que permite desplegarlo en escenarios con solo pregunta, referencia y candidata.
- Investigación en evaluación de LLMs: estudiar la calibración de puntuaciones automáticas frente a ratings humanos y analizar la relación entre ambigüedad de la pregunta y desacuerdo entre anotadores.
- Monitorización de sistemas desplegados: puntuar muestras de respuestas en producción para detectar degradaciones de calidad a lo largo del tiempo.

## Benchmarks y rendimiento

Concordancia con la calificación humana media (Spearman, Kendall y MAE en escala 0-1). "Clamped" aplica el filtrado por varianza con umbral 0,075, elegido sobre la partición de desarrollo.

| Conjunto de test | Contexto | Spearman | Kendall | MAE | Spearman (clamped) | Kendall (clamped) | MAE (clamped) |
|---|---|---|---|---|---|---|---|
| MMAU/MMAR test (n=265) | con | 0,911 | 0,770 | 0,086 | 0,917 | 0,815 | 0,081 |
| MMAU/MMAR test (n=265) | sin | 0,908 | 0,767 | 0,091 | 0,908 | 0,800 | 0,087 |
| MMAU-Pro, no visto (n=1240) | con | 0,819 | 0,669 | 0,092 | 0,844 | 0,749 | 0,085 |
| MMAU-Pro, no visto (n=1240) | sin | 0,815 | 0,665 | 0,102 | 0,841 | 0,741 | 0,092 |

El modelo del artículo original (`BUT-FIT/orca-gemma-3-4b-it-multinomial`) obtiene en MMAU-Pro Spearman 0,819 y 0,846 con clamping y su umbral de 0,05; los autores indican que esta variante no supone una mejora de precisión, sino un cambio en el régimen de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia, el modelo base Gemma 3-4B-IT en bfloat16 requiere del orden de 8-10 GB solo para pesos, más overhead de activaciones y del adaptador; en cuantización de 8 bits o 4 bits (no documentada para este adaptador) bajaría sustancialmente.
- GPU recomendadas: no especificadas por los autores. Por tamaño, una GPU con 16-24 GB (RTX 4090, A10G, L4) debería ser suficiente para inferencia en bfloat16; A100/H100 para lotes grandes o mayor throughput.
- Cabe en GPU de consumo: previsiblemente sí en GPUs de 16 GB o más en bfloat16, aunque no está confirmado por los autores.
- Opciones de despliegue: paquete `orca-score` (CLI y API Python `OrcaScorer`), que carga el adaptador PEFT sobre `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: el modelo base `google/gemma-3-4b-it` está *gated*; es necesario aceptar la licencia de Gemma y autenticarse con `hf auth login`, o descargarlo previamente en entornos sin red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BUT-FIT/orca-gemma-3-4b-it-multinomial-rationale-dropout | 4B (base) + LoRA | no disponible | Regresión multinomial con rationale dropout | MIT (pesos ORCA) + terminos Gemma | Hugging Face |
| BUT-FIT/orca-gemma-3-4b-it-multinomial | 4B (base) + LoRA | no disponible | Regresión multinomial, modelo del paper | MIT (pesos ORCA) + terminos Gemma | Hugging Face |
| Jueces LLM generativos (p. ej. GPT-4-class, Gemma-IT sin fine-tuning) | variable | variable | Puntuación mediante prompting | variable | APIs o pesos abiertos |

La comparación con jueces LLM genéricos es cualitativa: la model card no aporta resultados de baselines de ese tipo, solo la comparación con el modelo del paper. No se dispone de datos de benchmarks de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; el rendimiento en otros idiomas no está caracterizado.
- Es un clasificador de corrección, no un generador: no debe usarse para producir respuestas ni texto libre.
- Riesgo de sesgo heredado del modelo base Gemma 3 y de los jueces LLM que generaron las anotaciones sintéticas de las etapas 1 y 2.
- La puntuación depende de la calidad de la respuesta de referencia; referencias erróneas producirán evaluaciones erróneas.
- El umbral de clamping (0,075) no está almacenado con el modelo: si no se pasa `--var_threshold`, solo se escriben `orca_score` y `orca_variance` sin filtrar.
- El campo `orca_model` de la salida solo registra el nombre del directorio local; para trazabilidad conviene fijar la revisión (`--revision <commit>`).
- La licencia MIT cubre los pesos ORCA, pero el uso del modelo base queda sujeto a los términos de Gemma, que pueden imponer restricciones adicionales al uso comercial.
- El modelo no ha visto MMAU-Pro durante el entrenamiento, pero sí MMAU y MMAR (partición estratificada), por lo que las métricas en esos conjuntos no son completamente fuera de dominio.
- No se documentan requisitos de hardware, latencia ni Throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BUT-FIT/orca-gemma-3-4b-it-multinomial-rationale-dropout
- Modelo del paper: https://huggingface.co/BUT-FIT/orca-gemma-3-4b-it-multinomial
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Paper (TACL 2026): https://doi.org/10.1162/TACL.a.798
- Codigo y uso: https://github.com/BUTSpeechFIT/ORCA
- Dataset de anotaciones: https://huggingface.co/datasets/BUT-FIT/orca-audio-qa-annotations
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
