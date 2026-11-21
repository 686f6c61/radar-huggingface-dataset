# Horizon-Labs/multilingual-zeroshot-base

## Resumen

Horizon-Labs/multilingual-zeroshot-base es un modelo de clasificación zero-shot multilingüe de 308 millones de parámetros, construido sobre la arquitectura ModernBERT (mmBERT) del modelo base jhu-clsp/mmBERT-base. Lo desarrolla Horizon Labs, un laboratorio que publica modelos abiertos orientados a la seguridad y el filtrado de entradas/salidas en sistemas de agentes. El modelo resuelve el problema de clasificar texto en cualquiera de más de 30 idiomas dentro de etiquetas arbitrarias definidas por el usuario, sin necesidad de entrenamiento específico por tarea, replicando la funcionalidad del conocido pipeline `zero-shot-classification` de `facebook/bart-large-mnli` pero con soporte multilingüe, menor tamaño y una ventana de contexto de 8.000 tokens (aunque el fine-tuning se realizó hasta 1.024 tokens).

La relevancia actual del modelo radica en tres factores. Primero, su licencia Apache-2.0 y su entrenamiento exclusivo con datos que permiten uso comercial (sin XNLI, ANLI ni otros conjuntos con restricciones), lo que lo convierte en una alternativa limpia para producción frente a modelos derivados de datos no comerciales. Segundo, su arquitectura ModernBERT, eficiente en CPU y con soporte ONNX y transformers.js, que permite despliegue tanto en servidores como en el navegador. Tercero, su tamaño contenido (308M parámetros) frente a alternativas de 560-568M, con resultados competitivos en benchmarks multilingües de intenciones y tópicos.

El modelo está pensado como componente de clasificación y enrutamiento dentro de pipelines más amplios: filtrado de contenido, detección de intenciones, moderación, clasificación de tickets o etiquetado de tópicos. No es un modelo generativo, sino un clasificador NLI (natural language inference) que puntúa la relación de entailment entre un texto y una hipótesis construida a partir de la etiqueta candidata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT), transformer encoder |
| Parametros totales | 307.531.778 (~308M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (fine-tuning hasta 1.024 tokens) |
| Tipos de cuantizacion | ONNX incluido (CPU y navegador); cuantizaciones adicionales no detalladas |
| Idiomas soportados | multilingual, en, de, fr, es, pt, it, nl, pl, ru, uk, cs, tr, ar, fa, he, hi, bn, zh, ja, ko, vi, id, th, sw, el (más de 30) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, derivado de jhu-clsp/mmBERT-base mediante fine-tuning para clasificación zero-shot vía NLI. ModernBERT introduce mejoras de eficiencia frente a BERT clásico (atención con RoPE, alternancia de capas globales y locales, flash attention), lo que se traduce en mayor throughput y menor coste computacional por token. El modelo produce dos etiquetas de salida, `not_entailment` (0) y `entailment` (1), y para cada etiqueta candidata puntúa si el texto implica la hipótesis "This example is {label}." (o la plantilla indicada por el usuario mediante `hypothesis_template`).

El entrenamiento se realizó sobre una combinación de conjuntos NLI: nyu-mll/multi_nli, stanfordnlp/snli, alisawuffles/WANLI y un dataset sintético propio, Horizon-Labs/multilingual-zeroshot-synthetic. Según la model card, se excluyeron deliberadamente XNLI, ANLI y otros conjuntos con licencias no comerciales, para garantizar que el modelo resultante pueda usarse comercialmente sin restricciones derivadas. El dataset sintético incluye taxonomías genéricas de etiquetas (tópicos, secciones de noticias, temas de preguntas, emociones, sentimiento), lo que explica que en algunos benchmarks los nombres de etiqueta coincidan con los del entrenamiento (marcados con § en la evaluación). No se detalla el número exacto de tokens de entrenamiento ni la composición precisa del dataset sintético.

## Capacidades

- Clasificación zero-shot de texto en más de 30 idiomas con etiquetas arbitrarias definidas en el momento de la inferencia.
- Clasificación multi-etiqueta (`multi_label=True`), permitiendo que varias categorías apliquen simultáneamente al mismo texto.
- Uso como modelo NLI genérico: admite `text` y `text_pair` en un pipeline `text-classification`.
- Personalización mediante `hypothesis_template` para adaptar la formulación de la hipótesis a la tarea (por ejemplo, "The user wants to {}.").
- Detección de intenciones en asistentes conversacionales (benchmarks MASSIVE, MTOP, CLINC150).
- Clasificación de tópicos y secciones de noticias (SIB-200, AG News, Yahoo Answers).
- Clasificación de emociones y sentimiento (según las taxonomías incluidas en el dataset sintético).
- Despliegue en CPU y navegador mediante los artefactos ONNX y transformers.js incluidos.
- No soporta generación de texto, tool calling, agentes multi-step ni visión; es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo clasifica la utterance del usuario contra un conjunto de intenciones predefinidas (por ejemplo, 60 intenciones de MASSIVE en 16 idiomas), permitiendo dirigir la conversación al skill o flujo adecuado sin entrenar un clasificador específico por idioma.
- Moderación y filtrado de contenido en plataformas multilingües: con etiquetas como "spam", "toxic", "off-topic" o "legal risk", el clasificador puntúa cada mensaje y permite aplicar políticas de moderación sin disponer de datos etiquetados por idioma.
- Clasificación de tickets de soporte: etiquetas como "refund request", "shipping question", "account problem" o "product praise" permiten triage automático de tickets en castellano, alemán, francés, japonés y otros idiomas con una sola instancia del modelo.
- Análisis de sentimiento y emociones por idioma: el modelo puede puntuar textos contra etiquetas de emoción o polaridad, útil para monitorización de reputación o investigación de experiencia de usuario en múltiples mercados.
- Etiquetado de tópicos para curación de noticias: clasificación de artículos contra secciones (política, deportes, negocios, ciencia y tecnología, entretenimiento) con resultados de 0,826 de accuracy en SIB-200 en 16 idiomas, adecuado para pipelines de agregación de contenido.
- Detección de intenciones en agentes de IA y guardrails: al formar parte de la colección "agent i/o guards" de Horizon Labs, el modelo puede usarse para clasificar entradas y salidas de agentes LLM (por ejemplo, detectar peticiones fuera de política) antes de enviarlas al modelo generativo.
- Clasificación en el navegador o en el edge: gracias a los artefactos ONNX y transformers.js, puede ejecutarse localmente en aplicaciones web para clasificar formularios, comentarios o búsquedas sin enviar datos a un servidor.
- Análisis de encuestas abiertas multilingües: clasificación de respuestas de texto libre contra taxonomías de temas o sentimiento en estudios que abarcan decenas de países e idiomas.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor (accuracy, single-label, plantillas y etiquetas en inglés para todos los idiomas; mismo template por modelo). La marca § indica que los nombres de etiqueta aparecieron en los datos sintéticos de entrenamiento, por lo que la comparación no es estrictamente zero-shot respecto a los nombres.

| Benchmark | Este modelo (308M) | small (141M) | large (568M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) ‡ |
|---|---|---|---|---|---|---|---|
| MASSIVE intents (60 etiquetas), 16 idiomas | 0,505 | 0,418 | 0,535 | 0,411 | 0,351 | 0,404 | **0,611** |
| MTOP intents (88 etiquetas), 6 idiomas | 0,420 | 0,350 | 0,424 | 0,303 | 0,353 | 0,386 | **0,442** |
| SIB-200 topics (7 etiquetas), 16 idiomas § | 0,826 | 0,797 | 0,834 | 0,782 | 0,654 | 0,526 | **0,837** |

Resultados por idioma (media de MASSIVE y SIB-200):

| Idioma | Este modelo (308M) | small (141M) | large (568M) | bge-m3-zeroshot-v2.0-c (568M) | mDeBERTa-v3-base-xnli (278M) | xlm-roberta-large-xnli (560M) | bge-m3-zeroshot-v2.0 (568M) ‡ |
|---|---|---|---|---|---|---|---|
| English | 0,713 | 0,681 | 0,716 | 0,596 | 0,537 | 0,504 | **0,752** |
| German | 0,675 | 0,600 | 0,685 | 0,607 | 0,527 | 0,472 | **0,748** |
| French | 0,703 | 0,653 | 0,704 | 0,617 | 0,526 | 0,487 | **0,753** |
| Spanish | 0,645 | 0,596 | 0,658 | 0,561 | 0,488 | 0,456 | **0,742** |
| Portuguese | 0,692 | 0,640 | 0,679 | 0,585 | 0,491 | 0,446 | **0,713** |
| Russian | 0,671 | 0,633 | 0,663 | 0,597 | 0,497 | 0,453 | **0,724** |
| Polish | 0,679 | 0,639 | 0,712 | 0,640 | 0,533 | 0,486 | **0,756** |
| Turkish | 0,671 | 0,592 | 0,680 | 0,605 | 0,491 | 0,455 | **0,713** |
| Arabic | 0,620 | 0,554 | 0,666 | 0,559 | 0,476 | 0,433 | **0,681** |
| Hindi | 0,641 | 0,563 | 0,675 | 0,589 | 0,511 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,3 GB en fp32 (308M parámetros × 4 bytes); alrededor de 620 MB en fp16/bf16; del orden de 300-400 MB en cuantización int8. Cifras estimadas a partir del número de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; RTX 3060, RTX 4090, A100, H100 son sobredimensionadas para este modelo y funcionarán con holgura. El modelo está diseñado para ser eficiente en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090) y también en iGPU y CPU.
- Opciones de despliegue: pipeline `zero-shot-classification` de transformers; `text-classification` con `text`/`text_pair` para uso NLI; ONNX Runtime para CPU; transformers.js para navegador; vLLM, TGI o llama.cpp no están indicados para este modelo (no es generativo y no se publican pesos GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada. La arquitectura ModernBERT y los artefactos ONNX sugieren un throughput superior a BERT clásico en CPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multilingüe | MASSIVE (16 idiomas) | SIB-200 (16 idiomas) |
|---|---|---|---|---|---|---|
| Horizon-Labs/multilingual-zeroshot-base | 308M | 8.000 tokens (FT 1.024) | Apache-2.0 | Sí (30+ idiomas) | 0,505 | 0,826 |
| Horizon-Labs/multilingual-zeroshot-small | 141M | no disponible | Apache-2.0 (presumible) | Sí | 0,418 | 0,797 |
| Horizon-Labs/multilingual-zeroshot-large | 568M | no disponible | Apache-2.0 (presumible) | Sí | 0,535 | 0,834 |
| bge-m3-zeroshot-v2.0-c | 568M | no disponible | Comercial (variante -c) | Sí | 0,411 | 0,782 |
| mDeBERTa-v3-base-xnli | 278M | 512 tokens (típico) | MIT (modelo base) | Sí | 0,351 | 0,654 |
| xlm-roberta-large-xnli | 560M | 512 tokens (típico) | MIT (modelo base) | Sí | 0,404 | 0,526 |

El modelo destaca por combinar un tamaño contenido (308M) con resultados superiores a mDeBERTa-v3-base-xnli y xlm-roberta-large-xnli en los benchmarks multilingües publicados, y por una licencia Apache-2.0 con entrenamiento comercialmente limpio. Queda por debajo de bge-m3-zeroshot-v2.0 (568M, marcado ‡ por datos con licencias no comerciales) en MASSIVE y SIB-200, pero con la mitad de parámetros y sin restricciones de licencia.

## Limitaciones y advertencias

- El modelo es un clasificador NLI, no un generador: no produce texto, no razona de forma multi-step ni soporta tool calling o agentes.
- Las etiquetas y la plantilla de hipótesis deben formularse en inglés para obtener el mejor rendimiento; el texto de entrada puede estar en cualquiera de los idiomas soportados.
- Riesgo de alucinación en el sentido de puntuaciones de entailment poco calibradas: etiquetas ambiguas, solapadas o formuladas de forma poco natural pueden producir scores engañosos. Se recomienda validar el umbral y la plantilla por tarea.
- Sesgos: al entrenarse sobre MultiNLI, SNLI, WANLI y un dataset sintético, puede heredar sesgos de esos corpus (predominancia de inglés, dominios de NLI académico, posibles sesgos demográficos o culturales). No se documentan evaluaciones de sesgo específicas.
- Cobertura lingüística desigual: los resultados por idioma muestran diferencias notables (por ejemplo, Spanish 0,645 frente a English 0,713 en la media MASSIVE/SIB-200); idiomas como hindi, bengalí, tailandés, swahili o griego no tienen resultados publicados en la model card.
- Limitación de contexto: aunque la ventana arquitectónica es de 8.000 tokens, el fine-tuning se hizo hasta 1.024 tokens, por lo que el rendimiento en textos más largos puede degradarse.
- Advertencia sobre benchmarks: en SIB-200, Yahoo Answers, AG News y CLINC150 los nombres de etiqueta aparecieron en los datos sintéticos de entrenamiento (marcados §), por lo que esas cifras no son estrictamente zero-shot respecto a los nombres de etiqueta y deben compararse con cautela.
- Licencia Apache-2.0 permite uso comercial, modificación y redistribución, pero se recomienda revisar los términos del modelo base jhu-clsp/mmBERT-base y de los datasets utilizados (MultiNLI, SNLI, WANLI) para confirmar compatibilidad en el caso de uso concreto.
- No se publican cifras de latencia, throughput ni consumo de memoria; las estimaciones de hardware de esta ficha son calculadas a partir del número de parámetros y no provienen del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-zeroshot-base
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot
- Leaderboard de clasificación zero-shot multilingüe: https://huggingface.co/spaces/Horizon-Labs/multilingual-zeroshot-leaderboard
- Colección de modelos de Horizon Labs (agent i/o guards): https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Código fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset sintético: https://huggingface.co/datasets/Horizon-Labs/multilingual-zeroshot-synthetic
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
