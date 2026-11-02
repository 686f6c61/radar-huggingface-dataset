# SiobhanGoh/malay-english-sentiment-onnx

## Resumen

El modelo `SiobhanGoh/malay-english-sentiment-onnx` es una conversión a ONNX del checkpoint `google-bert/bert-base-multilingual-cased` afinado para clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto social en malayo, inglés y combinaciones de cambio de código (code-switching) entre ambos idiomas. Lo desarrolla SiobhanGoh como parte de un proyecto de fin de grado (capstone) 2025-26, y su propósito principal es permitir la inferencia directamente en el navegador mediante la librería transformers.js, sin necesidad de backend.

La relevancia de esta ficha radica en su nicho: el análisis de sentimiento en textos mixtos malayo-inglés es un caso poco cubierto por los modelos multilingües genéricos, y la exportación a ONNX en 16 bits permite ejecutarlo en entornos web con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato ONNX y un tamaño de repositorio de 0,4 GB.

Arquitectónicamente es un transformer encoder BERT base multilingüe (no se especifica el número exacto de parámetros en la información disponible, pero el checkpoint base es `bert-base-multilingual-cased`, con 12 capas y 768 dimensiones ocultas según la arquitectura estándar de BERT base). La longitud de contexto de entrada está truncada a 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe, `google-bert/bert-base-multilingual-cased`) |
| Parametros totales | no disponible (el checkpoint base BERT base multilingüe tiene ~178M, pero no se confirma en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en preprocesado) |
| Tipos de cuantizacion | FP16 (16 bits, publicado); FP32 y 8 bits mencionados como no publicados |
| Idiomas soportados | malayo (ms), inglés (en), con soporte de code-switching ms-en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compatible con transformers.js) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder basado en BERT base multilingüe, con una cabeza de clasificación de secuencias para tres etiquetas (`NEGATIVE`, `NEUTRAL`, `POSITIVE`). El modelo original fue afinado a partir de `google-bert/bert-base-multilingual-cased` en el checkpoint `SiobhanGoh/CP2_Emotion_Model_New` (revisión `9bc6645ce7a8e02761c59386ffd16969bed1bc55`, subcarpeta `corrected-2026-10`), y esta versión es una conversión a ONNX en 16 bits.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El preprocesado de entrada incluye normalización Unicode NFKC, case-folding, eliminación de enlaces, menciones `@`, almohadillas `#` y colapso de espacios en blanco, aplicado de forma consistente entre entrenamiento e inferencia. La evaluación se realizó sobre una partición de test congelada de 981 entradas, con verificación de la huella del split y del checksum del fichero fuente. La conversión a FP16 reproduce exactamente el resultado de precisión completa (misma matriz de confusión), y en navegador mediante transformers.js se obtuvo la misma etiqueta en las 981 entradas, con una diferencia máxima de puntuación de 0,0042.

## Capacidades

- Clasificación de sentimiento en tres clases: negativo, neutro y positivo.
- Soporte de texto en malayo, inglés y code-switching malayo-inglés.
- Inferencia en navegador mediante transformers.js y pesos ONNX.
- Entrada truncada a 128 tokens, adecuada para publicaciones cortas en redes sociales.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- No se documentan capacidades multilingües más allá de ms y en.
- No se documenta modo thinking ni otras capacidades especiales.

## Casos de uso

- Moderación de comentarios en redes sociales malayas: el modelo puede clasificar la polaridad de publicaciones cortas en malayo, inglés o mixtas, integrándose en un pipeline de filtrado previo a revisión humana.
- Análisis de opinión en foros y tuits con code-switching: adecuado para corpus donde los usuarios alternan malayo e inglés en la misma frase, un escenario que los modelos monolingües no cubren.
- Monitorización de marca en tiempo real en el navegador: al ejecutarse con transformers.js y ONNX, puede desplegarse en una aplicación web sin backend, procesando el texto en el cliente.
- Investigación académica sobre sentimiento en textos mixtos: útil como línea base reproducible para estudios de code-switching ms-en, con partición de test congelada y hashes verificables.
- Enrutamiento de tickets de soporte: clasificación rápida de la polaridad de mensajes entrantes para priorizar casos negativos hacia atención humana.
- Análisis de encuestas abiertas en mercados malayohablantes: procesamiento por lotes de respuestas cortas para agregar sentimiento a nivel de producto o servicio.
- Filtrado de reseñas en aplicaciones móviles: integración en el cliente para etiquetar reseñas antes de enviarlas a un servidor, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

| Fichero | Tamano | Precision en test | Macro-F1 | Misma etiqueta que precision completa |
|---|---:|---:|---:|---:|
| Precision completa (no publicado) | 712 MB | 76,04% | 0,7557 | 100,0% |
| 16 bits (este repo) | 356 MB | 76,04% | 0,7557 | 100,0% |
| 8 bits (no publicado) | 179 MB | 75,84% | 0,7490 | 89,8% |

Los resultados son internos y retrospectivos sobre el corpus existente, no una validación externa nueva. Las puntuaciones softmax no están calibradas.

## Requisitos de hardware

- VRAM estimada: el fichero FP16 ocupa 356 MB, por lo que la inferencia requiere aproximadamente 0,4-0,6 GB de memoria en GPU o en el navegador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria libre (GTX 1050, RTX 3050, etc.).
- Opciones de despliegue: transformers.js en navegador (soporte oficial), ONNX Runtime, y potencialmente llama.cpp no aplica (no es un modelo generativo). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SiobhanGoh/malay-english-sentiment-onnx | no disponible (~178M base) | 128 tokens | ms, en | Apache 2.0 | ONNX |
| google-bert/bert-base-multilingual-cased | ~178M | 512 tokens | 104 idiomas | Apache 2.0 | safetensors, PyTorch |
| Modelos de sentimiento multilingües genéricos (p. ej., cardiffnlp/twitter-xlm-roberta-base-sentiment) | ~278M (XLM-R base) | 512 tokens | multilingüe | MIT / según variante | safetensors, PyTorch |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Los resultados son internos y retrospectivos sobre el corpus existente, no una validación externa independiente.
- Las puntuaciones softmax no están calibradas; no deben interpretarse como probabilidades fiables sin calibración posterior.
- Se esperan errores en sarcasmo, jerga, code-switching intenso y temas alejados de los datos de entrenamiento.
- Entrada truncada a 128 tokens: textos más largos pierden información.
- Solo cubre malayo e inglés; no se documenta soporte para otros idiomas.
- El modelo es de clasificación, no generativo: no admite tool calling, agentes ni generación de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Es necesario aplicar el mismo preprocesado que en entrenamiento (NFKC, case-folding, eliminación de enlaces y menciones) para obtener resultados consistentes.

## Enlaces

- HuggingFace: https://huggingface.co/SiobhanGoh/malay-english-sentiment-onnx
- Checkpoint fuente: https://huggingface.co/SiobhanGoh/CP2_Emotion_Model_New (revisión `9bc6645ce7a8e02761c59386ffd16969bed1bc55`, subcarpeta `corrected-2026-10`)
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Repositorio del proyecto (código, protocolo de entrenamiento y app web): https://github.com/SiobhanGoh/capstone2-sentiment-streamlit-colab
- transformers.js: https://github.com/huggingface/transformers.js
- Manifiesto de exportación con hashes: `export_manifest.json` en el repositorio del modelo
