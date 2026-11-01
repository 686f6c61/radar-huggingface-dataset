# cadrojasl/xlm-roberta-large-tass-sentimientos-2026

## Resumen

El modelo `cadrojasl/xlm-roberta-large-tass-sentimientos-2026` es un ajuste fino de `FacebookAI/xlm-roberta-large` para clasificación de sentimientos en textos en español, con tres etiquetas: negativo (N), neutro (NEU) y positivo (P). Lo ha publicado el usuario cadrojasl en HuggingFace como trabajo final del taller de PLN de una maestría en Ingeniería de Sistemas y Computación, y está entrenado sobre el corpus TASS de tweets en español (variantes cr-tass / cr1-tass).

Se trata de un encoder transformer de 559,9 millones de parámetros (XLM-RoBERTa-large) adaptado a una tarea de clasificación de secuencias, no de un modelo generativo. Su relevancia es acotada: es un artefacto académico con licencia MIT, pensado para experimentación y para servir de punto de partida en análisis de sentimiento sobre redes sociales en español. No hay información sobre la longitud de contexto efectiva usada en el ajuste, el volumen exacto de datos de entrenamiento ni la composición del corpus más allá de la referencia a TASS.

El modelo tiene un uso muy limitado en producción: 23 descargas, cero likes y métricas moderadas (F1 macro de 0,6645 sobre el conjunto de prueba), lo que sugiere un ajuste correcto pero no competitivo frente a alternativas más grandes o más recientes. Es útil, eso sí, como referencia reproducible de un pipeline de clasificación de sentimientos con XLM-R en español y licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large), clasificación de secuencias |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa soporta hasta 512 tokens; el autor no especifica la longitud usada en el ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en fp32/bf16; no se documentan versiones cuantizadas) |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es XLM-RoBERTa-large, un transformer encoder de tipo RoBERTa multilingüe preentrenado por Facebook AI sobre corpus multilingües masivos con objetivos de enmascaramiento de tokens. Sobre esa base, el autor ha añadido una cabeza de clasificación de tres clases (N, NEU, P) y ha realizado un ajuste supervisado sobre el corpus TASS de tweets en español (cr-tass / cr1-tass).

Los hiperparámetros documentados en la model card son: batch size 8, máximo 10 épocas con early stopping (mínimo 6), learning rate 1e-5 y precisión bf16. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, si hubo aumento de datos ni si se aplicaron técnicas de regularización adicionales. Tampoco se documenta ningún proceso de RLHF, DPO ni destilación; es un ajuste fino supervisado convencional. No se mencionan innovaciones técnicas destacables (atención lineal, decodificación especulativa, etc.), lo cual es esperable en un modelo encoder para clasificación.

## Capacidades

- Clasificación de sentimientos en español con tres etiquetas: N (negativo), NEU (neutro) y P (positivo).
- Procesamiento de textos cortos, típicamente tweets, que es el dominio de entrenamiento.
- Uso mediante `transformers.pipeline("text-classification")` con una sola línea de código.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada en la práctica al español, aunque la base XLM-R sea multilingüe; el ajuste se ha hecho solo con datos en español.
- No se documentan capacidades de clasificación multietiqueta ni de extracción de aspectos.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo está entrenado sobre tweets en español, por lo que es adecuado para monitorizar la opinión pública en Twitter/X sobre marcas, eventos o figuras públicas, clasificando cada publicación en negativa, neutra o positiva.
- Moderación de comentarios: se puede integrar en un pipeline de preprocesado para priorizar revisiones humanas sobre comentarios con sentimiento negativo, usando la etiqueta N como señal de alerta.
- Investigación académica en PLN: sirve como línea base reproducible para experimentos de clasificación de sentimientos en español con XLM-R, dado que el autor documenta hiperparámetros y métricas de test.
- Enriquecimiento de datasets: etiquetar automáticamente grandes volúmenes de texto en español para construir corpus de sentimiento que luego se usen en el entrenamiento de otros modelos.
- Análisis de opinión de producto: clasificar reseñas cortas o comentarios de usuarios en español para agregar métricas de satisfacción por producto o funcionalidad.
- Detección de crisis reputacionales: monitorizar en tiempo casi real menciones en español y disparar alertas cuando la proporción de etiquetas N supera un umbral definido.
- Clasificación por lotes en entornos con recursos limitados: al ser un encoder de 560 M de parámetros, cabe en GPUs de consumo con cuantización o en CPU con throughput moderado, lo que permite procesar grandes volúmenes sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de prueba de TASS:

| Metrica | Valor |
|---|---|
| Precision (macro) | 0.6640 |
| Recall (macro) | 0.6707 |
| F1 (macro) | 0.6645 |
| Accuracy | 0.6742 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tampoco resultados por clase ni matrices de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M de parámetros × 4 bytes), más activaciones y overhead del framework; en la práctica, entre 3 y 4 GB.
- En bf16/fp16: aproximadamente 1,1 GB de pesos, con un total estimado de 2 a 2,5 GB incluyendo activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 6 GB o más (GTX 1660, RTX 2060, RTX 3050, RTX 4060, etc.).
- También es viable en CPU para inferencia por lotes, con throughput menor.
- Opciones de despliegue: `transformers` (pipeline), `text-embeddings-inference` no aplica, `vLLM` no aplica (no es generativo), `llama.cpp`/`GGUF` no aplica, `Ollama` no aplica. Para servir el modelo se puede usar FastAPI + transformers, TorchServe, o exportar a ONNX Runtime para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En una GPU moderna se espera un throughput de cientos a miles de textos cortos por segundo por lote, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cadrojasl/xlm-roberta-large-tass-sentimientos-2026 | 559,9 M | no disponible (base hasta 512) | Clasificación de sentimiento en español (3 clases) | MIT | HuggingFace, 23 descargas |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingüe (no ajustado a sentimiento) | MIT | HuggingFace, ampliamente usado |
| robertuito (pysentimiento) | ~110 M | 128 tokens | Clasificación de sentimiento en español (tweets) | MIT | HuggingFace, muy usado en la comunidad hispanohablante |
| BERT-base-multilingual-cased afinado en TASS | ~178 M | 512 tokens | Clasificación de sentimiento en español | Apache 2.0 | Disponible en varios repos de la comunidad |

No se dispone de resultados de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con estas alternativas. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Métricas moderadas: F1 macro de 0,6645 y accuracy de 0,6742 indican un rendimiento limitado, especialmente en la clase neutra, que suele ser la más difícil en análisis de sentimiento.
- Dominio restringido: entrenado sobre tweets en español; su comportamiento en textos formales, técnicos o de otras variedades dialectales no está documentado.
- Riesgo de alucinación bajo en sentido estricto (es un clasificador, no genera texto), pero sí riesgo de clasificaciones erróneas sistemáticas en dominios fuera de distribución.
- Sesgos: no se documenta ningún análisis de sesgos por género, origen, dialecto o temática; al entrenarse sobre tweets, puede heredar sesgos presentes en la conversación de redes sociales.
- Limitaciones de idioma: aunque la base es multilingüe, el ajuste es solo en español, por lo que el rendimiento en otras lenguas no está garantizado.
- Longitud de contexto: no se especifica la longitud máxima usada en el ajuste; textos largos pueden truncarse o degradar el rendimiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y condiciones del corpus TASS original.
- Artefacto académico: 23 descargas y cero likes indican escasa validación por la comunidad; no se recomienda como componente crítico en producción sin una evaluación propia sobre el dominio objetivo.
- No hay información sobre el preprocesado aplicado a los tweets (normalización, eliminación de URLs, manejo de emojis), lo que dificulta reproducir exactamente el pipeline de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cadrojasl/xlm-roberta-large-tass-sentimientos-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Corpus TASS: no disponible enlace directo en la información proporcionada
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): no disponible enlace en la información proporcionada
- Repositorio o demo del autor: no disponible
