# ronke21/hebnli-xlm-roberta-xl

## Resumen

`ronke21/hebnli-xlm-roberta-xl` es un clasificador de inferencia de lenguaje natural (NLI) de tres clases (implicación, contradicción y neutral) obtenido por ajuste fino de `facebook/xlm-roberta-xl` sobre el corpus HebNLI. Lo desarrolla Ron Keinan en el marco del trabajo HeRE (Hebrew Relation Extraction), presentado en AACL-IJCNLP 2026, y su función concreta dentro de ese sistema es actuar como uno de los "denoisers" de la Estrategia 1: dada una premisa (un pasaje de Wikipedia en hebreo) y una hipótesis (una tripleta de Wikidata verbalizada), la probabilidad de implicación decide si el pasaje expresa realmente esa relación.

El modelo resuelve un problema muy específico: la alineación automática entre grafos de conocimiento y texto enciclopédico genera ruido, y para hebreo, un idioma con menos recursos, no existían benchmarks sólidos de extracción de relaciones. HeRE construye ese benchmark y este checkpoint es el mejor encoder del artículo para la tarea, con un macro-F1 de 0,779 en la validación gold de HeRE.

Arquitectura transformer encoder (familia XLM-RoBERTa-XL) con 3.482.493.443 parámetros, contexto de entrenamiento limitado a 250 tokens y licencia MIT. Es relevante ahora porque demuestra que un encoder multilingüe grande, ajustado con datos de calidad moderada, sigue siendo competitivo frente a aproximaciones basadas en LLM generativos para NLI en idiomas de recursos medios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-XL), cabeza de clasificación de 3 clases |
| Parametros totales | 3.482.493.443 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 250 tokens (longitud máxima de secuencia usada en entrenamiento; la arquitectura base admite más, pero el modelo está ajustado a 250) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | hebreo (`he`); el encoder base es multilingüe pero el ajuste fino es monolingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | `0`: היסק (implicación), `1`: סתירה (contradicción), `2`: ניטרלי (neutral) |
| Tamaño del repo | 14,0 GB |
| Modelo base | facebook/xlm-roberta-xl |

## Arquitectura y entrenamiento

El modelo parte de `facebook/xlm-roberta-xl`, un encoder transformer de tipo XLM-RoBERTa en su variante XL (36 capas, dimensión oculta 2560, 16 cabezas de atención, aproximadamente 3.500 M de parámetros). Sobre él se añade una cabeza de clasificación de secuencia con tres salidas. La entrada es un par premisa-hipótesis codificado con el tokenizador SentencePiece del modelo base, truncado a 250 tokens.

El ajuste fino se realizó sobre HebNLI con AdamW, tasa de aprendizaje 2e-5, tamaño de lote 64, calentamiento lineal sobre el 10 % de los pasos, weight decay 0,01, 8.000 pasos y evaluación cada 200 pasos; se retuvo el checkpoint con mejor macro-F1 de validación, que resultó ser el paso 8.000. Se trata de una única ejecución con semilla 42. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa; es un ajuste supervisado estándar de clasificación. La innovación técnica relevante no está en el entrenamiento sino en el uso: la hipótesis se genera verbalizando una tripleta de Wikidata, de modo que la probabilidad de implicación funciona como filtro de ruido para alineaciones entre el grafo y la Wikipedia hebrea.

## Capacidades

- Clasificación NLI de tres clases en hebreo: implicación, contradicción y neutral.
- Puntuación de plausibilidad de relaciones: dado un pasaje y una tripleta verbalizada, devuelve la probabilidad de que el pasaje exprese la relación.
- Filtrado y denoising de alineaciones entre grafos de conocimiento y texto (uso original en HeRE, Estrategia 1).
- Procesamiento de pares premisa-hipótesis de hasta 250 tokens.
- Comprensión lectora en hebreo a nivel de pasaje corto, orientada a verificación factual.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso; es un clasificador, no un generador.
- Capacidad multilingüe: no disponible en la práctica; el ajuste fino es solo para hebreo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Denoising de alineaciones Wikidata-Wikipedia en hebreo: se verbaliza cada tripleta candidata y se pasa como hipótesis junto al pasaje; las que superan un umbral de probabilidad de implicación se conservan como relaciones válidas. Es el uso exacto para el que se entrenó.
- Construcción de datasets de extracción de relaciones: el clasificador actúa como filtro automático para generar pares (texto, relación) de alta precisión antes de la anotación humana, reduciendo el coste de anotación en un idioma con pocos anotadores.
- Verificación factual en pipelines de RAG sobre contenido hebreo: comprobar si un fragmento recuperado implica una afirmación concreta antes de mostrarla al usuario, descartando fragmentos neutrales o contradictorios.
- Detección de contradicciones en bases de conocimiento: comparar afirmaciones extraídas de fuentes distintas y marcar pares con alta probabilidad de contradicción para revisión editorial.
- Enriquecimiento de grafo de conocimiento: dado un pasaje de Wikipedia hebrea y una relación candidata, decidir si se añade la arista al grafo, con umbral calibrado sobre la validación gold de HeRE.
- Evaluación de sistemas de extracción de relaciones: servir como componente de referencia (baseline fuerte) para comparar nuevos extractores sobre el benchmark HeRE.
- Moderación o consistencia documental: detectar si dos versiones de un mismo documento en hebreo se contradicen o si una reformulación mantiene la misma información (implicación bidireccional).

## Benchmarks y rendimiento

| Modelo | HebNLI dev macro-F1 | HebNLI test macro-F1 | HeRE gold validation F1 |
|---|---|---|---|
| XLM-RoBERTa-XL (este checkpoint) | 0,853 | 0,882 | 0,779 (Estrategia 1, hipótesis por plantilla; mejor encoder del artículo) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales; el modelo es un clasificador NLI y esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 14 GB para los pesos, más activaciones; en la práctica se necesitan del orden de 16-20 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: unos 7 GB de pesos, con margen para activaciones; cabe en GPUs de 16 GB.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para lotes grandes y alto throughput; RTX 4090 (24 GB) y RTX A6000 (48 GB) funcionan cómodamente en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, en fp16 con lotes pequeños, en GPUs de 16 GB como RTX 4080 o A4000. En 12 GB requiere cuantización o reducción de lote, no documentada oficialmente.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (uso documentado por el autor), servidores de inferencia compatibles con modelos de clasificación de Hugging Face (TGI, vLLM con soporte de clasificación, TorchServe). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no están soportados de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/hebnli-xlm-roberta-xl | 3.482 M | 250 tokens (entrenamiento) | NLI hebreo, 3 clases | MIT | Hugging Face, 10 descargas |
| facebook/xlm-roberta-xl | ~3.500 M | 512 tokens (arquitectura) | Encoder multilingüe base | MIT | Hugging Face, ampliamente usado |
| XLM-RoBERTa large ajustado a NLI multilingüe (p. ej. XNLI) | ~560 M | 512 tokens | NLI multilingüe | MIT | Hugging Face |
| Modelos NLI hebreos basados en encoders pequeños (p. ej. alephbert) | ~110-300 M | 512 tokens | NLI hebreo | variable | Hugging Face |

La comparación cuantitativa con alternativas concretas de NLI en hebreo no está disponible en la información proporcionada; el artículo HeRE solo reporta este checkpoint como el mejor encoder de su evaluación.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre HebNLI, hereda los sesgos de composición del corpus (pasajes de Wikipedia hebrea y tripletas de Wikidata), con posible sobrerrepresentación de entidades y relaciones bien cubiertas en Wikidata.
- Riesgo de alucinación: bajo en sentido generativo (no genera texto), pero puede producir falsos positivos de implicación cuando la hipótesis es plausible pero no está respaldada por la premisa; el umbral de decisión debe calibrarse por caso de uso.
- Limitación de contexto: 250 tokens de secuencia máxima en entrenamiento; premisas más largas se truncan y pueden perder la evidencia necesaria para decidir.
- Limitación de idioma: ajustado exclusivamente a hebreo; el rendimiento en otros idiomas no está evaluado y no debería asumirse a partir del encoder multilingüe base.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución al modelo base y al trabajo HeRE según la cita del autor.
- Madurez: 10 descargas y 0 likes en el momento de la consulta, una única ejecución de entrenamiento (semilla 42) y sin validación cruzada publicada; la robustez fuera del dominio de HeRE/HebNLI no está demostrada.
- Producción: es un componente de un pipeline mayor; no debe usarse como verificador factual autónomo sin umbrales calibrados y sin revisión en casos de alta criticidad.
- Etiquetas en hebreo: el mapeo `id2label` está en hebreo, lo que exige cuidado al integrarlo en sistemas que esperen etiquetas en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/hebnli-xlm-roberta-xl
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Código HeRE: https://github.com/Ronke21/HeRE
- Repositorio HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (ACL Anthology): https://aclanthology.org/2026.aacl-long.237/
- DOI del paper: https://doi.org/10.18653/2026.aacl-long.237
