# CobuildX-AI/InDIM-small

## Resumen

InDIM-small es un codificador (encoder) compacto de 31,8 millones de parámetros desarrollado por CobuildX-AI dentro de la familia InDIM (Indic Decision Intelligence Models). Está diseñado específicamente para lenguas de la India y para texto romanizado y code-mixed, un escenario muy habitual en redes sociales, mensajería y atención al cliente en el subcontinente. Cubre 12 lenguas indias (assamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil, telugu y urdu) además de inglés.

El modelo parte de una arquitectura ModernBERT de 12 capas con atención global cada tres capas y atención local de 128 tokens en el resto, embeddings factorizados de 128 dimensiones y un tokenizador Unigram de 128.064 piezas. No es un modelo generativo: se publica como modelo base para fine-tuning en clasificación, etiquetado de tokens (NER, PII) y recuperación, y también como modelo de fill-mask.

Su relevancia actual radica en la relación calidad/tamaño: según la model card, con un 23 % de los parámetros de mmBERT-small (140M) supera a este en 12 de 15 tareas evaluadas, corre unas 3 veces más rápido en CPU y mantiene la calidad bajo cuantización int8, lo que lo hace apto para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder: 12 capas, hidden 384, FFN 576, 6 cabezas, RoPE, atención global cada tercera capa y atención local de 128 tokens en las demás |
| Parametros totales | 31,8 M (31,5 M encoder + 0,3 M cabeza masked-LM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de preentrenamiento; entradas más largas funcionan (resultados PII más allá de 512) |
| Tipos de cuantizacion | fp32 (pesos publicados), fp16 (inferencia exacta), int8 (ONNX dinámico) |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, ur, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8 dinámico) |

## Arquitectura y entrenamiento

InDIM-small es un transformer encoder de tipo ModernBERT con 12 capas, dimensión oculta de 384, FFN de 576 y 6 cabezas de atención. Usa RoPE para la codificación posicional, atención global en una de cada tres capas y atención local de ventana de 128 tokens en las restantes, lo que reduce el coste computacional en secuencias largas. El tokenizador es un Unigram de 128.064 piezas entrenado para lenguas indias e inglés, con embedding de palabra factorizado de 128 dimensiones ligado (tied) a la capa de salida. Esta factorización exige cargar el código del repositorio con `trust_remote_code=True`.

La model card no detalla el volumen de tokens de preentrenamiento ni la composición exacta del corpus, más allá de indicar que cubre escritura nativa, texto romanizado (natural y transliterado) y code-mixed, con inglés como lengua más débil. No se menciona RLHF ni DPO, algo esperable en un encoder de estas características. El preentrenamiento se realizó con longitud de 512 tokens. La innovación destacable es la eficiencia: pesos en fp32, inferencia fp16 exacta y salida estable bajo int8, además de versiones ONNX listas para producción.

## Capacidades

- Relleno de máscaras (fill-mask) en lenguas indias, texto romanizado y code-mixed.
- Generación de embeddings de frase para recuperación cross-lingual (inglés ↔ escritura nativa).
- Clasificación de secuencias mediante fine-tuning (`AutoModelForSequenceClassification`), con pooling "cls" o "mean".
- Etiquetado de tokens para NER y detección de PII (`AutoModelForTokenClassification`).
- Procesamiento de texto romanizado y code-mixed, no solo escritura nativa.
- Manejo de entradas más largas que su longitud de preentrenamiento (512 tokens) con degradación limitada en tareas de etiquetado.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder, no un modelo generativo.
- Capacidades multilingües limitadas a las 13 lenguas declaradas; el inglés es su punto más flojo.

## Casos de uso

- Detección de PII en atención al cliente: fine-tuning con `AutoModelForTokenClassification` para etiquetar nombres, teléfonos, direcciones e identificadores en 27 tipos, con F1 tipado de 0,989 en el conjunto independiente Ylemis India-PII y buen comportamiento en textos de más de 512 tokens.
- Clasificación de intenciones en asistentes conversacionales: con 60 intenciones en 7 lenguas alcanza 85,2 de accuracy en MASSIVE, por encima de mmBERT-small, y su tamaño permite desplegarlo en CPU junto al motor de diálogo.
- Moderación de contenido y detección de abuso: fine-tuning para etiquetas de profanidad y odio (macro F1 de 0,703 en el conjunto oro y PR-AUC de 0,749 en Hindi HateCheck), adecuado para prefiltrar mensajes antes de revisión humana.
- Análisis de sentimiento en redes sociales: entrenamiento sobre fuentes en telugu, inglés y hindi romanizado (macro F1 de 0,512), útil para monitorización de marca en texto informal y code-mixed.
- Extracción de entidades para pipelines de datos: NER con F1 de entidad de 0,704 en Naamapadam (11 lenguas), integrable en procesos de enriquecimiento documental.
- Búsqueda semántica multilingüe: embeddings mean-pooled para recuperación inglés ↔ escritura nativa con accuracy@1 de 0,502–0,513 (centrado), muy por encima de mmBERT-small, para catálogos o bases de conocimiento en varias lenguas indias.
- Clasificación de tickets y enrutamiento: la tarea de intenciones y el bajo coste de inferencia (3× más rápido en CPU que mmBERT-small) permiten clasificar en tiempo real en infraestructura modesta.

## Benchmarks y rendimiento

Resultados de fine-tuning publicados en la model card (media de 3 ejecuciones salvo indicación; mayor es mejor salvo donde se indique):

| Tarea | Conjunto de test | Métrica | InDIM-small (32M) | mmBERT-small (140M) |
|---|---|---|---|---|
| Intención (60 intenciones, 7 lenguas) | MASSIVE test | accuracy | 85,2 | 84,2 |
| Sentimiento | IndicSentiment (13 lenguas) | accuracy | 0,822 | 0,839 |
| Sentimiento | Telugu/inglés/hindi romanizado | macro F1 | 0,512 | 0,508 |
| Slot filling (55 tipos) | MASSIVE test | span F1 | 0,700 | 0,680 |
| PII (27 tipos) | test sintético propio | span F1 | 0,992 | 0,993 |
| PII | Ylemis India-PII | typed F1 | 0,989 | 0,987 |
| PII | IndiaPII-Bench | typed F1 | 0,960 | 0,950 |
| PII | IndicPIIDetX (14 tipos) | typed F1 | 0,950 | 0,930 |
| PII | IndicPIIDetX (27 tipos) | typed F1 | 0,906 | 0,894 |
| Profanidad/abuso (5 etiquetas) | conjunto oro (3.980 textos) | macro F1 | 0,703 | 0,725 |
| Odio | Hindi HateCheck | PR-AUC | 0,749 | 0,742 |
| Razonamiento causal (solo inglés) | IndicCOPA, 18 lenguas | accuracy, 1 ejecución | 0,533 | 0,530 |
| Paráfrasis (solo inglés) | IndicXParaphrase, 10 lenguas | accuracy, 1 ejecución | 0,571 | 0,561 |
| Entidades nombradas | Naamapadam, 11 lenguas | entity F1, 1 ejecución | 0,704 | 0,671 |

Sin fine-tuning, predicción de palabra enmascarada (bits por carácter, menor es mejor; datos de fuentes similares al preentrenamiento, favorece a InDIM-small):

| Texto | InDIM-small | mmBERT-small |
|---|---|---|
| Todas las indias (macro) | 1,571 | 2,314 |
| Escritura nativa | 1,263 | 1,737 |
| Romanizado natural | 1,856 | 3,051 |
| Romanizado transliterado | 1,410 | 2,907 |
| Code-mixed | 2,146 | 2,377 |
| Inglés | 0,986 | 0,731 |

Recuperación cross-lingual (FLORES devtest, accuracy@1, media sobre 12 lenguas, embeddings centrados): inglés → escritura nativa 0,502 frente a 0,248 de mmBERT-small; escritura nativa → inglés 0,513 frente a 0,200.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (32M parámetros), aproximadamente 0,1 GB en int8; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1650 o RTX 3050 en adelante es suficiente; A100/H100 no son necesarios.
- Cabe en GPU consumer: sí, en todas las actuales, incluidas las de gama baja y las integradas.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), ONNX Runtime (`onnx/model.onnx` fp32 y `onnx/model_int8.onnx`), y servidores de inferencia compatibles con modelos encoder de transformers. No se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card indica que es unas 3 veces más rápido en CPU que mmBERT-small (140M); no se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| InDIM-small | 31,8 M | 512 (preentrenamiento) | Apache 2.0 | 13 lenguas, romanizado y code-mixed; mejor en 12 de 15 tareas frente a mmBERT-small |
| mmBERT-small | 140 M | no disponible | no disponible | Referencia principal de la model card; peor en tareas indias, mejor en inglés |
| mmBERT-base | no disponible | no disponible | no disponible | Usado como referencia en los modelos fine-tuneados publicados |
| IndicBERT v2 | no disponible | no disponible | no disponible | Usado como referencia en los modelos fine-tuneados publicados |

## Limitaciones y advertencias

- No es un modelo generativo: solo produce representaciones o predicciones de máscara; no admite instrucciones, tool calling ni razonamiento multi-paso.
- El inglés es su lengua más débil: en predicción de máscara obtiene 0,986 bits por carácter frente a 0,731 de mmBERT-small.
- Rendimiento inferior a mmBERT-small en sentimiento sobre IndicSentiment (−0,017 de accuracy) y en detección de profanidad (−0,022 de macro F1).
- La transferencia desde entrenamiento solo en inglés es débil: COPA y paráfrasis quedan cerca del azar (0,50) en ambos modelos.
- Requiere `trust_remote_code=True` por el embedding factorizado, lo que implica ejecutar código del repositorio; conviene auditar antes de producción.
- Los resultados de predicción de máscara proceden de fuentes similares al preentrenamiento y favorecen al modelo; no deben interpretarse como una comparación justa de modelado de lenguaje.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en tareas de etiquetado; los umbrales deben calibrarse por dominio.
- Sesgos: no se documentan análisis de sesgo; el corpus incluye texto de redes sociales, con los sesgos asociados.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/InDIM-small
- mmBERT-small (referencia): https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset IndicPIIDetX: https://huggingface.co/datasets/CobuildX-AI/IndicPIIDetX
- Clasificador de intenciones fine-tuneado: https://huggingface.co/CobuildX-AI/cbx-indim-intent-classifier-32M
- Clasificador de sentimiento fine-tuneado: https://huggingface.co/CobuildX-AI/cbx-indim-sentiment-classifier-32M
- Extractor de PII fine-tuneado: https://huggingface.co/CobuildX-AI/cbx-indim-pii-extractor-32M
- Detector de profanidad fine-tuneado: https://huggingface.co/CobuildX-AI/cbx-indim-profanity-detector-32M
- DOI: https://doi.org/10.57967/hf/11878
