# Horizon-Labs/multilingual-hate-speech-base

## Resumen

Horizon-Labs/multilingual-hate-speech-base es un clasificador de texto multilingue especializado en la deteccion de discurso de odio, entendido como ataques a personas por razon de caracteristicas protegidas (raza, etnia, origen, religion, genero, orientacion sexual, identidad de genero, discapacidad o edad). Lo desarrolla Horizon-Labs y se publica bajo licencia Apache-2.0. El modelo no solo indica si un texto constituye discurso de odio, sino que ademas identifica el colectivo atacado mediante etiquetas independientes con probabilidades sigmoideas.

Tecnicamente se construye sobre jhu-clsp/mmBERT-base, un transformer encoder de tipo ModernBERT con 307.536.392 parametros, afinado para clasificacion multi-etiqueta. Cubre alrededor de 50 idiomas, incluidos espanol, frances, aleman, arabe, hindi, chino, japones y coreano. Su relevancia actual radica en que ofrece moderacion de contenido multilingue con una licencia permisiva, pesos ONNX para CPU y navegador (transformers.js) y un rendimiento claramente superior al de clasificadores monoingles de referencia en pruebas funcionales multilingues.

El modelo forma parte de una familia mas amplia de Horizon-Labs y esta pensado para complementar un detector de toxicidad general: distingue el discurso de odio real de insultos ordinarios, blasfemias, criticas a ideas o contra-discurso, lo que reduce falsos positivos en pipelines de moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-base) |
| Parametros totales | 307.536.392 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX int8 (model_quantized.onnx, embeddings int8, 641 MB); fp32; q8 para transformers.js |
| Idiomas soportados | Multilingue, ~50 idiomas: en, es, fr, de, it, pt, nl, pl, cs, ro, hu, el, bg, sr, hr, uk, ru, sv, da, no, fi, tr, ar, he, fa, ur, hi, bn, ta, te, mr, zh, ja, ko, vi, th, id, ms, tl, sw, am, ha, yo, af |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un fine-tuning de jhu-clsp/mmBERT-base, un modelo multilingue derivado de ModernBERT. La tarea es clasificacion multi-etiqueta con activacion sigmoidea independiente por etiqueta: `hate`, `target_race`, `target_religion`, `target_origin`, `target_gender`, `target_sexuality`, `target_age` y `target_disability`. Las etiquetas de objetivo solo son significativas cuando la probabilidad de `hate` es alta.

La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset. Indica que se emplearon textos de Measuring Hate Speech y HateXplain distintos de los items de test, y que la evaluacion se realizo sobre conjuntos no vistos durante el entrenamiento. No se documenta explicitamente el uso de RLHF, DPO ni otras tecnicas de alineacion, algo esperable en un encoder de clasificacion. Se incluyen pesos ONNX cuantizados a int8 con una desviacion media de 0,0012 en las probabilidades respecto a fp32 sobre 448 textos de test.

## Capacidades

- Clasificacion binaria de discurso de odio mediante la etiqueta `hate`.
- Clasificacion multi-etiqueta del colectivo atacado: raza, religion, origen, genero, sexualidad, edad y discapacidad.
- Distincion entre discurso de odio e insultos ordinarios, blasfemias, ataques a figuras publicas, criticas a ideas y contra-discurso.
- Cobertura multilingue de aproximadamente 50 idiomas, con especial atencion a casos funcionales dificiles (negacion, mencion neutral de colectivos, abuso dirigido a objetos).
- Inferencia en CPU y en navegador mediante ONNX y transformers.js.
- Integracion con el pipeline `text-classification` de transformers y con Text Embeddings Inference (endpoints compatibles).
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento; es exclusivamente un clasificador.

## Casos de uso

- Moderacion de comentarios en plataformas multilingues: el modelo etiqueta cada comentario con una probabilidad de odio y el colectivo afectado, permitiendo enrutar casos a revision humana segun umbrales ajustables.
- Filtrado previo en foros y redes sociales: al distinguir insultos de odio real, reduce las acciones erroneas sobre mensajes groseros pero no discriminatorios.
- Moderacion en el navegador o en el cliente: los pesos ONNX int8 (641 MB) y transformers.js permiten ejecutar la clasificacion localmente sin enviar el texto a un servidor.
- Analisis de discurso en investigacion social: clasificacion de grandes corpus multilingues (Stormfront, Reddit, YouTube, noticias coreanas, portugues brasileno) con etiquetas de colectivo atacado para estudios de incidencia.
- Cumplimiento normativo (DSA y similares): generacion de senales auditables de riesgo por categoria protegida en contenido generado por usuarios.
- Enriquecimiento de pipelines de confianza y seguridad: combinacion con un detector de toxicidad general para separar toxicidad de discurso de odio y priorizar la revision.
- Deteccion de contra-discurso: la baja activacion en respuestas que citan o condenan el odio permite identificar intervenciones positivas en comunidades.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluacion usa ROC AUC de la probabilidad de `hate` y F1 con umbral 0,5.

| Modelo | Licencia | HateCheck 11 idiomas: AUC | HateCheck: F1 @ 0,5 | Comentarios reales (4 sets): AUC medio | Measuring Hate Speech (EN)¹: AUC | HateXplain (EN)¹: AUC |
|---|---|---|---|---|---|---|
| **Este modelo** (308M) | Apache-2.0 | 0,866 | 0,805 | 0,841 | 0,757 | 0,847 |
| facebook/roberta-hate-speech-dynabench-r4-target (125M) | No indicada | 0,607 | 0,435 | 0,781 | 0,752 | 0,761 |
| cardiffnlp/twitter-roberta-base-hate-latest (125M) | CC-BY-4.0 | 0,541 | 0,167 | 0,713 | 0,863 | 0,731 |
| Hate-speech-CNERG/dehatebert-mono-english (110M) | Apache-2.0 | 0,569 | 0,309 | 0,687 | 0,737 | 0,722 |
| pysentimiento/robertuito-hate-speech (109M) | No indicada | 0,574 | 0,174 | 0,683 | 0,680 | 0,569 |
| IMSyPP/hate_speech_multilingual (178M) | MIT | 0,691 | 0,762 | 0,741 | 0,803 | 0,609 |
| christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New (560M) | MIT | 0,973 | 0,961 | 0,767 | 0,797 | 0,781 |

¹ In-domain: Measuring Hate Speech (6.000 comentarios, odio si la puntuacion de los autores > 0,5) y el split de test de HateXplain (ofensivo pero no odio cuenta como negativo). Otros textos de estos dos conjuntos estan en los datos de entrenamiento.

La model card advierte que el resultado de 0,973 en HateCheck del modelo XLM-R sugiere entrenamiento sobre ese mismo conjunto, por lo que su comparacion debe tomarse con cautela.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,3 GB en fp32 para los 308M parametros; unos 0,35 GB en int8.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para despliegues por lotes; una sola GPU consumer basta para uso interactivo.
- Despliegue: transformers (pipeline `text-classification`), ONNX Runtime, transformers.js en navegador, Text Embeddings Inference (endpoints compatibles). No se documenta soporte explicito de vLLM o llama.cpp, ya que es un encoder y no un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Rendimiento (HateCheck AUC) | Licencia |
|---|---|---|---|---|---|
| **Este modelo** | 308M | No disponible | ~50 | 0,866 | Apache-2.0 |
| IMSyPP/hate_speech_multilingual | 178M | No disponible | Multilingue | 0,691 | MIT |
| christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New | 560M | No disponible | Multilingue | 0,973 (posible contaminacion) | MIT |
| pysentimiento/robertuito-hate-speech | 109M | No disponible | Espanol | 0,574 | No indicada |
| facebook/roberta-hate-speech-dynabench-r4-target | 125M | No disponible | Ingles | 0,607 | No indicada |

Frente a los clasificadores monoingles, este modelo ofrece cobertura multilingue con licencia permisiva y un rendimiento notablemente superior en pruebas funcionales multilingues. Frente a XLM-R multilingue, la comparacion directa no es fiable por la probable contaminacion de ese modelo con HateCheck.

## Limitaciones y advertencias

- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificacion erronea en textos ambiguos, ironia o contextos culturales no representados.
- El umbral de 0,5 es una recomendacion; en produccion conviene calibrarlo con datos propios, especialmente en idiomas de bajos recursos.
- La model card no documenta sesgos especificos por idioma o colectivo; la cobertura de ~50 idiomas no implica rendimiento homogeneo.
- Las etiquetas de colectivo atacado solo son interpretables cuando `hate` es alta; usarlas de forma aislada puede inducir a error.
- Parte de los datos de entrenamiento provienen de Measuring Hate Speech y HateXplain, lo que puede inflar el rendimiento in-domain en ingles.
- No sustituye una revision humana en decisiones de moderacion con consecuencias legales o de cuenta.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de evaluacion (CC-BY-4.0, CC-BY-SA-3.0) si se redistribuyen derivados.
- No se documenta la longitud maxima de contexto; textos muy largos pueden truncarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-hate-speech-base
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo complementario de toxicidad: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Dataset Multilingual HateCheck: https://huggingface.co/datasets/mteb/multi-hatecheck
- Dataset hate_speech18: https://huggingface.co/datasets/odegiber/hate_speech18
- Dataset ETHOS: https://github.com/intelligence-csd-auth-gr/Ethos-Hate-Speech-Dataset
- Dataset OLID-BR: https://huggingface.co/datasets/dougtrajano/olid-br
- Dataset K-MHaS: https://github.com/adlnlp/K-MHaS
- Dataset Measuring Hate Speech: https://huggingface.co/datasets/ucberkeley-dlab/measuring-hate-speech
- Dataset HateXplain: https://github.com/hate-alert/HateXplain
- Modelo de comparacion Dynabench: https://huggingface.co/facebook/roberta-hate-speech-dynabench-r4-target
- Modelo de comparacion CardiffNLP: https://huggingface.co/cardiffnlp/twitter-roberta-base-hate-latest
- Modelo de comparacion DeHateBERT: https://huggingface.co/Hate-speech-CNERG/dehatebert-mono-english
- Modelo de comparacion RoBERTuito: https://huggingface.co/pysentimiento/robertuito-hate-speech
- Modelo de comparacion IMSyPP: https://huggingface.co/IMSyPP/hate_speech_multilingual
- Modelo de comparacion XLM-R: https://huggingface.co/christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New
