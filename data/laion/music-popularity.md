# laion/music-popularity

## Resumen

Music Popularity Predictor es un modelo de clasificación de audio desarrollado por LAION que estima, a partir únicamente de la señal de audio, el número de reproducciones (play count) y de votos positivos (upvote/like count) que recibirá una pista de música generada por IA. No se trata de un modelo generativo: es una cabeza MLP de regresión que se apoya en el encoder congelado de `laion/music-whisper` (Whisper Small ajustado para descripción musical) para producir una representación de 23.040 dimensiones y predecir dos valores escalares en escala logarítmica.

El modelo es la publicación complementaria del artículo *LAION-Tunes: An Open 1.4M-Track Dataset and Perceptual Benchmark for AI-Generated Music*, aceptado en el track Evaluations & Datasets de NeurIPS 2026. Su relevancia radica en que ofrece una señal objetiva y reproducible de "atractivo" o engagement para música sintética, entrenada sobre estadísticas reales de plataformas como Suno, Udio, Riffusion y Sonauto.

El repositorio es muy ligero (0,1 GB): los pesos de la cabeza MLP ocupan 91 MB y el encoder se descarga por separado desde `laion/music-whisper`. La licencia es Apache 2.0, lo que facilita su integración en pipelines de investigación y producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper Small congelado + pooling segmentado + MLP de regresión con dos cabezas |
| Parametros totales | No disponible (la cabeza MLP es de 23.040 → 1.024 → 256 → 2 salidas; el encoder se carga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (1500 frames de salida del encoder, agrupados en 10 segmentos de 150 frames) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en `popularity_head.pt`; el encoder soporta float16) |
| Idiomas soportados | No disponible (la tarea es audio-música, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); el encoder en formato HuggingFace Transformers |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero, el encoder de `laion/music-whisper` procesa los primeros 30 segundos del audio y produce una salida de 1500×768. Esa salida se divide en 10 segmentos de 150 frames y de cada segmento se calculan las estadísticas mean, max y min, que se concatenan en un vector de 23.040 dimensiones. Después, una cabeza MLP (23040 → 1024 → 256 con LayerNorm) alimenta dos subcabezas independientes de 64 unidades que predicen `log(1 + play_count)` y `log(1 + upvote_count)`. Para recuperar los conteos reales se aplica `math.expm1()`.

El entrenamiento usó aproximadamente 39.000 muestras del pool de LAION-Tunes con estadísticas reales de plataformas (Suno, Udio, Riffusion, Sonauto; Mureka se excluyó por no exponer conteos de engagement). El muestreo fue estratificado por cuantil de log-reproducciones y por plataforma, con igual número de muestras por bucket. Se optimizó con pérdida Huber, AdamW (lr=5e-4, weight decay=1e-4, cosine annealing), 3 épocas y batch size 6 en una única A100. La mejor pérdida de validación fue 4,004 en la época 2. La validación se hizo sobre 200 pistas reservadas, estratificadas por bucket de reproducciones (50 por bucket).

## Capacidades

- Predicción de reproducciones (play count) a partir de audio de música generada por IA.
- Predicción de votos positivos (upvote/like count) a partir del mismo audio.
- Extracción de representaciones musicales de 23.040 dimensiones mediante pooling mean/max/min sobre segmentos del encoder.
- Procesamiento de clips de 30 segundos (con padding automático si el audio es más corto).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe en el sentido textual: opera sobre audio musical, sin transcripción ni comprensión de habla.
- No dispone de modo "thinking", visión ni audio de entrada distinto de la música.

## Casos de uso

- Filtrado previo en plataformas de música generativa: antes de publicar una pista de Suno o Udio, el modelo estima el engagement esperado y permite priorizar o descartar candidatas en un pipeline automatizado, gracias a su bajo coste computacional (encoder Small + MLP).
- Investigación sobre percepción musical: el vector de 23.040 dimensiones y las dos predicciones sirven como features objetivas para estudiar qué características acústicas correlacionan con popularidad, dentro del benchmark LAION-Tunes.
- A/B testing de prompts de generación musical: al variar el prompt o los parámetros del generador, se puede medir el impacto estimado en reproducciones y votos sin esperar a métricas reales de la plataforma.
- Curaduría de datasets: al construir un corpus de música sintética, el modelo ayuda a equilibrar la distribución de engagement estimado y evitar sesgos hacia pistas de baja o alta popularidad.
- Monitorización de deriva en generadores: comparar la distribución de predicciones de un generador a lo largo del tiempo permite detectar cambios en el estilo o la calidad percibida de las pistas producidas.
- Búsqueda y recomendación (demo Tunes-Search): las predicciones pueden incorporarse como señal auxiliar en sistemas de búsqueda de música generada, complementando embeddings del encoder.
- Evaluación de modelos de música en investigación: usar las métricas log-Pearson como referencia reproducible para comparar nuevos generadores o nuevas cabezas de predicción.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 200 muestras de validación estratificadas por play count:

| Metrica | Play count | Upvote count |
|---|---|---|
| Pearson r | 0,145 | 0,102 |
| Log-Pearson r | 0,414 | 0,413 |
| Log MAE | 2,981 | 1,923 |

El propio autor advierte que la estratificación por reproducciones hace que el log-Pearson r mida la capacidad de separar pistas de bajo y alto engagement, y que no necesariamente se transfiere a un muestreo aleatorio del corpus.

## Requisitos de hardware

- VRAM estimada: el encoder Whisper Small en float16 ocupa aproximadamente 1 GB; la cabeza MLP es despreciable (91 MB de pesos). En total, menos de 2 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una A100 se usó para el entrenamiento (batch size 6), pero para inferencia es sobredimensionada.
- Cabe en GPU de consumo: sí, en cualquier RTX 20xx/30xx/40xx, GTX 16xx con suficiente VRAM, e incluso en CPU para uso por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (script de la model card), HuggingFace Transformers para el encoder, y exportación manual de la cabeza MLP a TorchScript u ONNX. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del encoder (Whisper Small) se espera del orden de decenas de milisegundos por clip de 30 s en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La tarea (predicción de popularidad de música generada por IA a partir de audio) es específica del benchmark LAION-Tunes y no se han identificado alternativas públicas con la misma formulación en la información disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laion/music-popularity | No disponible (encoder Small + MLP) | 30 s de audio | Regresión de play/upvote count | Apache 2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las correlaciones publicadas son modestas (Pearson r ≈ 0,15 en escala lineal; log-Pearson r ≈ 0,41), por lo que las predicciones deben tratarse como señal indicativa, no como verdad objetiva.
- El conjunto de validación está estratificado por play count, lo que infla la separabilidad entre buckets; el rendimiento sobre un muestreo aleatorio del corpus puede ser inferior.
- El modelo se entrenó solo con música generada por IA de Suno, Udio, Riffusion y Sonauto; no se garantiza su validez para música humana ni para otras plataformas (Mureka quedó excluida por falta de conteos).
- Solo analiza los primeros 30 segundos del audio; la información del resto de la pista se ignora.
- Riesgo de sesgo hacia las distribuciones de engagement de las plataformas representadas en el entrenamiento, que pueden no reflejar las de otros contextos o mercados.
- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite tool calling ni razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las predicciones.
- El encoder se carga desde un repositorio separado (`laion/music-whisper`), por lo que la reproducibilidad depende de la disponibilidad de ese segundo modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/music-popularity
- Encoder: https://huggingface.co/laion/music-whisper
- Dataset LAION-Tunes: https://huggingface.co/datasets/laion/laion-tunes
- Código: https://github.com/LAION-AI/tunes
- Demo Tunes-Search: https://projects.laion.ai/tunes/search-tunes/
- Paper (NeurIPS 2026, Evaluations & Datasets Track): *LAION-Tunes: An Open 1.4M-Track Dataset and Perceptual Benchmark for AI-Generated Music* (Kaczmarczyk, Ahmed, Friedrich, Erickson, Sharoni, Herremans, Schuhmann); cita BibTeX incluida en la model card.
