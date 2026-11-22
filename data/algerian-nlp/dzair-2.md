# algerian-nlp/DZAIR-2

## Resumen
DZAIR-2 (الجزائر 2) es un encoder bidireccional de 171,9 millones de parámetros construido desde cero por el colectivo Algerian NLP (autor principal: Abderahmane Ainouche) para el dariya argelino (`arq`), cubriendo escritura árabe, arabizi latino y code-switching con francés. No es un modelo generativo: su pipeline declarado es `feature-extraction`, es decir, produce representaciones contextuales y embeddings de frase que sirven como base para clasificación, retrieval y clustering sobre texto argelino informal.

El problema que aborda es la falta de encoders especializados en una variedad lingüística escasamente representada: el dariya argelino mezcla árabe dialectal, transliteración latina con dígitos (3, 5, 7, 9) y préstamos franceses dentro de la misma frase. DZAIR-2 se entrena sobre un corpus depurado de 501,6 millones de tokens durante 12 épocas (aproximadamente 5,96 mil millones de tokens supervisados) con un tokenizador Unigram propio de 64.000 piezas (`dzair-tok-64k`).

Arquitectónicamente combina 16 capas (8 bloques de profundidad Block-AttnRes) con anchura 768, 12 cabezas de atención con gating, QK-Norm, SwiGLU y RoPE en dos etapas (512 → 2.048 tokens). Su relevancia actual es que supera a DziriBERT y a DZAIR v1 en la media macro de cinco benchmarks de dariya argelino bajo un protocolo común de 10 semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional, 16 capas (8 bloques Block-AttnRes) × 768, 12 cabezas MHA con gating, QK-Norm, SwiGLU, RoPE |
| Parametros totales | 171.889.664 publicados (49.152.768 embeddings atados + 122.736.896 backbone); 202,57 M durante el preentrenamiento |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens máximo (curriculum RoPE en dos etapas 512 → 2.048) |
| Tipos de cuantizacion | no disponible (se publican pesos FP32, FP16 y ONNX FP32; no se documentan GGUF ni INT8) |
| Idiomas soportados | `arq` (dariya argelina), `ar` (árabe), `fr` (francés), con code-switching entre ellos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 y FP16 en `fp16/`), ONNX FP32 (`onnx/model.onnx`) |

## Arquitectura y entrenamiento
El modelo es un encoder bidireccional con preentrenamiento de "Bipartite Complementary Cross-Attention": las entradas del encoder son visibles (sin `[MASK]`) y la supervisión es del 100% por token, de modo que la presión de reconstrucción recae sobre los tokens contextuales en lugar de solo sobre `[CLS]`. Esto se refleja en métricas internas reportadas por el autor: `effective_rank_tok = 233,55` frente a `effective_rank_cls = 15,85`, razón por la cual la model card recomienda mean pooling sobre tokens no padding en lugar de usar el token `[CLS]`.

El backbone incorpora Block-AttnRes como mecanismo de routing de profundidad, atención multi-cabeza completa con gating, QK-Norm, activación SwiGLU y RoPE con curriculum de dos etapas (512 → 2.048). El preentrenamiento se realizó durante 12 épocas y 75.408 pasos sobre 971.415 documentos empalmados (496,65 M tokens de entrenamiento por época), totalizando 5,96 mil millones de tokens supervisados. No se documenta en la información disponible el uso de RLHF, DPO ni objetivos de pares contrastivos; el pipeline declarado es exclusivamente de representación.

## Capacidades
- Extracción de características y embeddings de frase (768 dimensiones) con mean pooling enmascarado por atención.
- Clasificación de secuencias mediante `Dzair2ForSequenceClassification`, con `pooling_mode="mean"` por defecto.
- Procesamiento de dariya argelina en escritura árabe, arabizi latino (con dígitos 3, 5, 7, 9 preservados) y mezcla dariya-francés.
- Clasificación de sentimiento y de temática sobre texto informal de redes sociales y foros.
- Tokenizador Unigram propio de 64.000 piezas adaptado a la variedad dialectal.
- Exportación a ONNX para inferencia optimizada.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un encoder, no un modelo causal.

## Casos de uso
- Moderación de comentarios en redes sociales argelinas: clasificación de toxicidad o sentimiento sobre publicaciones en arabizi y árabe dialectal, usando el encoder como base con una cabeza lineal entrenada sobre datos propios; el rendimiento reportado de 81,00% de accuracy en Twifil sugiere que la representación captura bien el registro de Twitter.
- Análisis de opinión de producto en comercio electrónico local: sentimiento a 4 clases sobre reseñas mezcladas en dariya y francés, con truncación a 512 tokens y mean pooling para obtener un vector por reseña.
- Monitorización de reputación de marca: clustering de embeddings de menciones en foros y redes para agrupar quejas por tema, aprovechando la clasificación temática a 5 clases evaluada en Narabizi (60,77% de accuracy).
- Búsqueda semántica interna: indexación de un corpus de documentos argelinos con embeddings de 768 dimensiones y recuperación por similitud coseno, con re-ranking supervisado posterior.
- Enrutamiento de tickets de soporte: clasificador de intención sobre conversaciones multi-turno de atención al cliente, usando el encoder para vectorizar cada turno o el documento completo hasta 2.048 tokens.
- Análisis de encuestas y estudios de mercado: etiquetado automático de respuestas abiertas en dariya para agregar resultados por segmento demográfico, reduciendo el coste de codificación manual.
- Preentrenamiento de modelos downstream: inicialización del encoder para tareas argelinas con pocos datos etiquetados, dado que el modelo ya ha visto 5,96 mil millones de tokens supervisados del dominio.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados de forma independiente), media de 10 semillas:

| Tarea | Dataset (test) | Accuracy | Macro-F1 |
|---|---|---|---|
| Sentimiento dariya, 4 clases | DarijaDz (4.746 filas, bs=64) | 0,7906 | 0,6835 |
| Sentimiento Twitter dariya, 3 clases | Twifil (2.360 filas, bs=64) | 0,8100 | 0,8035 |
| Sentimiento foro árabe, 3 clases | Ranim (300 filas, bs=8) | 0,9637 | 0,9599 |
| Sentimiento arabizi latino, 3 clases | Narabizi (143 filas, bs=8) | 0,6657 | 0,6083 |
| Temática arabizi latino, 5 clases | Narabizi (143 filas, bs=8) | 0,6077 | 0,5641 |

Media macro de las 5 tareas: 76,75% de accuracy y 72,38% de Macro-F1, frente a DziriBERT (75,40% / 70,36%) y DZAIR v1 (73,68% / 67,63%) según la model card. El protocolo compartido suma 42.848 ejemplos de entrenamiento y 7.849 de test. Los conjuntos Narabizi son muy pequeños (143 filas de test), por lo que sus cifras tienen alta varianza.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,7 GB en FP32 (171,9 M parámetros × 4 bytes) y 0,35 GB en FP16, más activaciones según lote y longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para lotes pequeños; A100, H100 o L4 son adecuadas para throughput alto en producción; RTX 4090, RTX 3090, RTX 4060 Ti y GPUs de portátil de gama media son suficientes en FP16.
- Cabe en GPU de consumo: sí, holgadamente, incluso en FP32; es un modelo de ~172 M de parámetros.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el código de arquitectura `modeling_dzair2.py` viaja con los pesos), ONNX Runtime para la exportación FP32, y servidores de embeddings compatibles con `transformers`. No se documenta soporte GGUF, llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media macro (5 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DZAIR-2 | 171,9 M | 2.048 | 76,75% acc / 72,38% F1 | Apache-2.0 | Hugging Face (`algerian-nlp/DZAIR-2`) |
| DziriBERT | no disponible en la información | no disponible en la información | 75,40% acc / 70,36% F1 | no disponible en la información | Hugging Face (referenciado por el autor) |
| DZAIR v1 | no disponible en la información | no disponible en la información | 73,68% acc / 67,63% F1 | no disponible en la información | Hugging Face (referenciado por el autor) |

La comparación se limita a los dos modelos citados por el autor bajo el mismo protocolo de 10 semillas; no se dispone de datos de otros encoders árabes o multilingües (por ejemplo, AraBERT o XLM-R) evaluados con este protocolo.

## Limitaciones y advertencias
- Es un encoder de representación: no genera texto, no razona de forma autoregresiva y no sirve como sustituto de un LLM.
- La model card recomienda mean pooling y advierte que `[CLS]` tiene una diversidad efectiva baja (`effective_rank_cls = 15,85`); usar el token `[CLS]` para retrieval degradará los resultados.
- El texto latino debe pasarse en minúsculas conservando los dígitos del arabizi (3, 5, 7, 9); el preprocesado incorrecto altera las representaciones.
- Contexto máximo de 2.048 tokens; documentos más largos requieren truncación o segmentación.
- Los benchmarks son declarados por el autor y marcados como no verificados; las tareas Narabizi se evalúan sobre solo 143 filas de test, con intervalos de confianza amplios.
- El rendimiento en arabizi latino es claramente inferior al de escritura árabe (66,57% de accuracy en sentimiento frente a 96,37% en Ranim), lo que refleja menor cobertura de esa variante.
- No se documentan sesgos específicos ni evaluaciones de robustez; al entrenar sobre redes sociales y foros, es previsible que herede sesgos de esas plataformas.
- Licencia Apache-2.0 permite uso comercial, pero requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar `modeling_dzair2.py` antes de desplegarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/algerian-nlp/DZAIR-2
- Organización autora: https://huggingface.co/algerian-nlp
- Tokenizador `dzair-tok-64k`: no disponible enlace directo en la información proporcionada
- Paper, blog o repositorio asociado: no disponible en la información proporcionada
- Demo o space: no disponible en la información proporcionada
