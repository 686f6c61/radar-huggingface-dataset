# Shuakami/douban-sentiment-weights

## Resumen

Douban-sentiment-weights es el conjunto de pesos desplegados en producción del sistema de análisis de sentimiento del proyecto douban-sentiment, desarrollado por el autor independiente Shuakami. Realiza clasificación de sentimiento en tres clases (positiva, neutra, negativa) y clasificación binaria sobre reseñas cortas de películas de Douban en chino. No es un modelo único, sino un sistema de ensemble híbrido que combina tres estudiantes MacBERT-base destilados, tres cabezas MLP entrenadas sobre características congeladas de MegatronBERT-1.3B y una lógica de fusión con especialización en la clase neutra.

El sistema reporta un 89,5 % de accuracy y 85,9 de macro-F1 en la tarea de tres clases, y un 95,9 % de accuracy y 95,6 de macro-F1 en la binaria, medidos sobre un conjunto gold de 600 reseñas verificadas por humanos con validación cruzada estratificada de 5 folds out-of-fold. La relevancia del proyecto reside en su enfoque de supervisión débil a escala: utiliza 910.998 comentarios limpios de Douban con solo puntuación por estrellas para generar pseudo-etiquetas y entrenar un especialista en la clase neutra sin emplear etiquetas gold.

Arquitectónicamente se apoya en `hfl/chinese-macbert-base` como modelo base de los estudiantes y en `IDEA-CCNL/Erlangshen-MegatronBert-1.3B-Sentiment` como extractor de características congelado para las cabezas de juicio. El repositorio ocupa 1,3 GB y está orientado exclusivamente al chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble híbrido: 3 estudiantes MacBERT-base (transformer encoder) + 3 cabezas MLP sobre características congeladas de MegatronBERT-1.3B (4096 dim) |
| Parámetros totales | No disponible (el repositorio incluye 3 checkpoints MacBERT-base y 3 cabezas MLP; el backbone MegatronBERT-1.3B es una dependencia externa no incluida) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_len de entrenamiento) |
| Tipos de cuantización | No disponible (pesos en safetensors y `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | Chino (zh) |
| Licencia | other (no se especifican términos concretos) |
| Formato de pesos | safetensors (estudiantes MacBERT), `.pt` (cabezas MLP con `state_dict`, `in_dim`, `n_classes`, `hidden`, `scaler_mean`, `scaler_scale`) |

## Arquitectura y entrenamiento

El sistema desplegado es un ensemble de tres canales. El primer canal lo forman tres estudiantes MacBERT-base: un clasificador de tres clases, un clasificador binario y un especialista en neutro. Los dos primeros se destilaron de un profesor ensemble de 7 canales (TF-IDF con regresión logística más cabezas MLP sobre backbone congelado) mediante entropía cruzada sobre etiquetas duras y divergencia KL sobre objetivos suaves (α=0,5, τ=2), durante 8 épocas, batch 32, lr 2e-5, bf16 y max_len 256. El especialista en neutro se entrenó como clasificador binario MacBERT sobre 115.000 filas pseudo-etiquetadas del corpus, con un tope de 60.000 por clase y sin ninguna etiqueta gold, en 2 épocas.

El segundo canal son tres cabezas MLP (4096→512→256→C, activación GELU, dropout 0,2) que consumen características de 4096 dimensiones: la concatenación del token CLS y la media enmascarada por atención de `last_hidden_state` del backbone Erlangshen-MegatronBERT-1.3B congelado. Se entrenaron durante 300 épocas sobre las 600 filas gold. La fusión final combina estudiante y juez en proporción 1:2, calcula una probabilidad de neutro ponderada (0,4 especialista MacBERT + 0,6 cabeza MLP), renormaliza las probabilidades positivas y negativas del clasificador de tres clases y mezcla con el vector de especialización, aplicando después una temperatura T=0,37.

Los datos de entrenamiento incluyen un gold set de 600 reseñas de Douban con etiquetas semánticas verificadas por humanos (316 positivas, 92 neutras, 192 negativas), el corpus Moviedata-10M (csuldw/AntSpider) con 910.998 comentarios limpios y solo puntuación por estrellas, y un benchmark lab2000 de 2.000 filas con anotación ciega por LLM en dos pasadas y 479 filas adjudicadas por humanos.

## Capacidades

- Clasificación de sentimiento en tres clases (positiva, neutra, negativa) sobre texto chino corto tipo reseña de película.
- Clasificación binaria de sentimiento (positiva frente a negativa).
- Detección específica de reseñas de polaridad mixta o genuinamente neutras, mediante el especialista entrenado con supervisión débil.
- Procesamiento de textos de hasta 256 tokens, adecuado para reseñas típicas de menos de 200 caracteres.
- Integración con la librería transformers mediante `AutoTokenizer` y `AutoModelForSequenceClassification` para los estudiantes MacBERT.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificación con probabilidades.

## Casos de uso

- Moderación y análisis de reseñas en plataformas de cine: clasificar automáticamente miles de comentarios de usuarios en positivos, neutros y negativos para alimentar paneles de reputación y detección de reseñas problemáticas.
- Investigación en NLP chino con supervisión débil: reutilizar el pipeline de pseudo-etiquetado y destilación como referencia metodológica para proyectos con pocos datos anotados y corpus masivos sin etiquetas.
- Análisis de opinión de audiencia para distribuidoras y productoras: agregar el sentimiento de reseñas por película para estimar recepción temprana y detectar controversia.
- Sistemas de recomendación con señal de sentimiento: incorporar la probabilidad de cada clase como característica adicional en un motor de recomendación de contenido audiovisual.
- Monitorización de reputación de marca o de títulos en redes: procesar comentarios cortos en chino para alertar sobre picos de sentimiento negativo.
- Evaluación comparativa de modelos de sentimiento: usar el gold set de 600 filas y el benchmark lab2000 como referencia para comparar clasificadores en dominio Douban.
- Filtrado previo en pipelines de anotación humana: priorizar para revisión manual las reseñas con alta probabilidad de neutro o polaridad mixta, donde el sistema es más débil.

## Benchmarks y rendimiento

Evaluación sobre gold-600 con validación cruzada estratificada de 5 folds out-of-fold (cada predicción sobre filas no vistas):

| Tarea | Accuracy | Macro-F1 |
|---|---|---|
| Tres clases (positiva / neutra / negativa) | 89,5 % | 85,9 |
| Binaria (positiva / negativa) | 95,9 % | 95,6 |
| Recall de la clase neutra (tres clases) | 70,7 % | No disponible |

El estudio out-of-distribution del paper reporta aproximadamente un 60 % de accuracy en tres clases sobre reseñas nuevas silvestres comparadas con etiquetas de referencia generadas por LLM. No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada: los tres estudiantes MacBERT-base ocupan en torno a 400 MB cada uno en fp32 (unos 1,2 GB en total); las cabezas MLP son de pocos megabytes. El backbone MegatronBERT-1.3B externo añade aproximadamente 5 GB en fp32 o 2,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM permite ejecutar el sistema completo en fp16, incluyendo el backbone externo. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más. Solo los estudiantes MacBERT caben en GPUs de 4 GB.
- Opciones de despliegue: transformers para los estudiantes; el repositorio incluye una implementación de referencia con backend FastAPI en `web/app.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shuakami/douban-sentiment-weights | Ensemble MacBERT + MLP sobre MegatronBERT | No disponible (3 × MacBERT-base + 3 MLP + backbone externo 1.3B) | 256 tokens | Sentimiento 3 clases y binario en chino | other | Hugging Face |
| hfl/chinese-macbert-base | Transformer encoder | ~102 M | 512 tokens | Modelo base, requiere fine-tuning | Apache 2.0 (según el modelo original) | Hugging Face |
| IDEA-CCNL/Erlangshen-MegatronBert-1.3B-Sentiment | Transformer encoder | ~1.3 B | No disponible | Sentimiento en chino | No disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en el mismo gold set, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre reseñas de películas de Douban; el rendimiento en otros dominios, plataformas o longitudes de reseña no está verificado.
- La clase neutra es la más difícil: recall del 70,7 % en el gold set y degradación en comentarios muy breves de estilo corpus; el estudio OOD reporta aproximadamente un 60 % de accuracy en tres clases sobre reseñas nuevas.
- No debe usarse como sustituto del juicio humano en decisiones de alto impacto.
- Licencia "other" sin términos concretos publicados: es necesario contactar con el autor o consultar el repositorio antes de un uso comercial.
- Dependencia externa no incluida en el repositorio: el backbone Erlangshen-MegatronBERT-1.3B debe descargarse por separado, lo que complica el despliegue reproducible.
- El sistema requiere implementar manualmente la lógica de ensemble (fusión ponderada, escalado de características y temperatura), lo que aumenta el riesgo de errores de integración.
- Riesgo de sesgo derivado de las pseudo-etiquetas generadas por el propio ensemble sobre el corpus, que pueden amplificar errores sistemáticos en la clase neutra.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de calibración deficiente en textos fuera de distribución.
- Solo soporta chino; no hay capacidades multilingües.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shuakami/douban-sentiment-weights
- Repositorio del proyecto: https://github.com/shuakami/douban-sentiment
- Demo en vivo: https://huggingface.co/spaces/Shuakami/douban-sentiment
- Modelo base de los estudiantes: https://huggingface.co/hfl/chinese-macbert-base
- Backbone de las cabezas de juicio: https://huggingface.co/IDEA-CCNL/Erlangshen-MegatronBert-1.3B-Sentiment
