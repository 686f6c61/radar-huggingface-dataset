# Abhisingh-18/ShrutamMT-v1

## Resumen

ShrutamMT-v1 es un modelo de traducción automática neuronal multilingüe desarrollado por Abhisingh-18 que traduce desde 11 idiomas de la India (asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil y telugu) al inglés. Está construido como un Transformer encoder-decoder entrenado completamente desde cero, sin pesos preentrenados ni ajuste fino, sobre el corpus paralelo Samanantar de AI4Bharat. El modelo tiene 148,5 millones de parámetros, una ventana de contexto de 256 tokens y un vocabulario conjunto de 64 000 subpalabras SentencePiece que cubre las 11 escrituras índicas más el inglés.

La relevancia de este modelo radica en que aborda la traducción de idiomas con recursos limitados dentro de un único sistema compartido, con una licencia MIT que permite uso comercial y académico sin restricciones. Su diseño sigue fielmente la arquitectura original de Vaswani et al. (2017), incorporando innovaciones como embeddings atados (tied embeddings) y tokens de etiqueta de idioma de origen, lo que mejora la generalización entre lenguas con vocabulario compartido. El modelo se publica con pesos, tokenizador y código de entrenamiento e inferencia, lo que facilita su reproducción y adaptación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (6 capas encoder + 6 capas decoder) |
| Parametros totales | 148,5 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te (origen) → en (destino) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura Transformer clásica con 6 capas de encoder y 6 de decoder, dimensión de modelo 768, 12 cabezas de atención, dimensión feed-forward 3072 y embeddings atados entre fuente, destino y proyección de salida. Se añade un token de etiqueta de idioma (p. ej. `<hi>`, `<bn>`) al inicio de la secuencia de entrada para que el encoder conozca el idioma de origen. El entrenamiento se realizó sobre 49,2 millones de pares de frases del corpus Samanantar, con un vocabulario conjunto de 64 000 subpalabras SentencePiece. Se usó el optimizador Adam (β1=0.9, β2=0.98, eps=1e-9), programación de tasa de aprendizaje Noam con warmup de 8000 pasos, suavizado de etiquetas con factor 0.1 y un total de 400 000 pasos de entrenamiento. El hardware empleado fue hasta 5 GPU NVIDIA RTX 6000 Ada con DataParallel. Se aplicó filtrado por proporción de longitud (0.3x–3.0x) durante la limpieza de datos y se promediaron los últimos 5 checkpoints para obtener los pesos finales.

## Capacidades

- Traducción automática de 11 idiomas índicos al inglés en un único modelo compartido.
- Soporte multilingüe con token de etiqueta de idioma de origen para desambiguar la entrada.
- Generación de texto mediante beam search (tamaño de haz 4 en evaluación).
- Manejo de vocabulario conjunto que cubre múltiples escrituras (devanagari, bengalí, tamil, telugu, etc.) mediante SentencePiece BPE.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; es exclusivamente un modelo de traducción.

## Casos de uso

- Traducción de contenido web y documentación técnica: el modelo puede convertir páginas o manuales escritos en idiomas índicos al inglés, facilitando el acceso a información para audiencias globales. Su licencia MIT permite integrarlo en productos comerciales.
- Atención al cliente multilingüe: permite traducir consultas de usuarios en idiomas regionales de la India al inglés para que un equipo de soporte pueda responder sin necesidad de dominar cada lengua, gracias a su capacidad de manejar 11 idiomas en un solo sistema.
- Subtitulado y localización de vídeo: las transcripciones o guiones en idiomas índicos pueden traducirse al inglés para generar subtítulos, aprovechando la ventana de 256 tokens que cubre frases de longitud media.
- Procesamiento de documentos legales o administrativos: traducción de formularios, contratos o notificaciones en idiomas como hindi, tamil o bengalí al inglés, con un nivel de precisión razonable según los resultados BLEU.
- Investigación en NLP multilingüe: sirve como punto de partida para estudios sobre transferencia entre lenguas índicas, dado que su arquitectura es reproducible y su entrenamiento está documentado.
- Desarrollo de herramientas de accesibilidad: integración en lectores de pantalla o asistentes que necesiten convertir contenido en idiomas regionales al inglés en tiempo real, aunque la latencia dependerá del hardware de despliegue.

## Benchmarks y rendimiento

La model card reporta resultados de BLEU y chrF evaluados sobre 30 frases de test retenidas por idioma (330 en total) del corpus Samanantar, con beam search de tamaño 4. No se proporcionan comparaciones con otros modelos en la información disponible.

| Idioma | BLEU | chrF |
|---|---|---|
| Asamés (as) | 15.70 | 39.51 |
| Bengalí (bn) | 40.91 | 62.00 |
| Guyaratí (gu) | 35.08 | 54.89 |
| Hindi (hi) | 33.29 | 58.24 |
| Canarés (kn) | 25.05 | 49.30 |
| Malayalam (ml) | 19.66 | 45.88 |
| Maratí (mr) | 26.30 | 50.68 |
| Oriya (or) | 40.71 | 59.12 |
| Panyabí (pa) | 31.80 | 54.46 |
| Tamil (ta) | 26.89 | 51.77 |
| Telugu (te) | 35.49 | 56.02 |
| **Overall** | **29.76** | **52.61** |

La pérdida de validación final es 2.83 y la perplejidad de validación 16.91. Se observa una correlación clara entre el volumen de datos por idioma y el rendimiento: idiomas con más pares de entrenamiento (bengalí, oriya) obtienen BLEU superiores a 40, mientras que el asamés, con solo 137k pares, baja a 15.70.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware para inferencia en la información disponible.
- Dado el tamaño del modelo (148,5 millones de parámetros) y la longitud de contexto de 256 tokens, se puede inferir que es viable en GPUs de consumo con al menos 4 GB de VRAM, pero esta es una estimación no confirmada por el autor.
- El entrenamiento se realizó con hasta 5× NVIDIA RTX 6000 Ada (48 GB cada una), pero la inferencia es mucho menos exigente.
- Para despliegue, se puede usar PyTorch directamente con el código proporcionado en el repositorio; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput no están documentados; dependerán del hardware y de la implementación de beam search.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. No se pueden establecer comparaciones objetivas con alternativas como IndicTrans o modelos multilingües genéricos sin datos adicionales.

## Limitaciones y advertencias

- Rendimiento muy inferior en idiomas de bajos recursos como asamés (BLEU 15.70) debido al escaso volumen de datos de entrenamiento.
- La ventana de contexto está limitada a 256 tokens, lo que impide traducir documentos largos de una sola vez; se requiere segmentación.
- El modelo solo traduce de idiomas índicos a inglés, no en la dirección inversa (inglés → índico).
- La evaluación se realizó sobre solo 30 frases por idioma, lo que limita la significancia estadística de los resultados.
- Al ser entrenado desde cero sobre Samanantar, puede heredar sesgos presentes en el corpus (p. ej., dominios de noticias o web).
- No se han publicado análisis de alucinación o robustez ante entradas ruidosas.
- El formato de pesos es un checkpoint de PyTorch, no safetensors ni GGUF, lo que puede requerir conversión para usar en algunos frameworks de inferencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Abhisingh-18/ShrutamMT-v1)
- [Dataset Samanantar](https://huggingface.co/datasets/ai4bharat/samanantar)
- [Dashboard de Weights & Biases](https://wandb.ai/abhisingh964800-iit-madras-foundation/x2en-multilingual-transformer-mt/runs/x2en-transformer-big-run1)
