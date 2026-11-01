# sangatbaloch/imdb-decoder-finetuned

## Resumen

`sangatbaloch/imdb-decoder-finetuned` es un modelo de clasificación de texto (análisis de sentimiento binario) construido a partir de `distilbert/distilgpt2`, es decir, la variante destilada de GPT-2 con arquitectura de decoder causal. El autor, `sangatbaloch`, le ha añadido una cabeza de clasificación ajustada sobre el dataset IMDb de reseñas de películas en inglés, con etiquetas `negative=0` y `positive=1`. El modelo resuelve la tarea clásica de determinar la polaridad de una reseña, pero lo hace sobre un subconjunto educativo del corpus, no sobre el benchmark completo.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino con fines didácticos, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada. Aun así, resulta interesante como ejemplo de adaptación de un decoder causal a una tarea discriminativa mediante una cabeza de clasificación, y porque publica métricas de test medibles (accuracy 0,857, F1 0,8586 sobre 1000 muestras) que permiten evaluar su comportamiento real dentro de su dominio.

El modelo tiene 81.914.112 parámetros, un repositorio de 0,3 GB, y solo soporta inglés. No se ha publicado información sobre longitud de contexto nativa más allá del `max_length=256` usado en el entrenamiento, ni sobre cuantizaciones, ni sobre la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (distilgpt2) con cabeza de clasificación para 2 clases |
| Parametros totales | 81.914.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `max_length=256`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilgpt2`, un transformer decoder causal de tipo GPT-2 destilado, al que se le ha incorporado una cabeza de clasificación para producir logits sobre dos clases (negativa y positiva). El pipeline declarado es `text-classification`, lo que implica que la salida es una distribución de probabilidad sobre las dos etiquetas, no texto generado, pese a la naturaleza causal del backbone.

El ajuste fino se realizó sobre el dataset `stanfordnlp/imdb` con subconjuntos estratificados: 4000 muestras de entrenamiento, 1000 de validación y 1000 de test oficial. La configuración reportada es semilla 42, 2 épocas, learning rate 2e-5, weight decay 0,01, batch efectivo 16 y longitud máxima 256 tokens. La selección del checkpoint se hizo por mejor F1 de validación, sin que el conjunto de test participara en la selección. No se menciona uso de RLHF, DPO ni decodificación especulativa; tampoco se detalla la composición exacta del dataset más allá de ser reseñas de IMDb en inglés.

## Capacidades

- Clasificación binaria de sentimiento (negativo/positivo) sobre reseñas de películas en inglés.
- Salida de probabilidad por clase mediante cabeza de clasificación (`text-classification`).
- Manejo de entradas de hasta 256 tokens en el régimen de entrenamiento.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.
- No se ha documentado calibración de confianza (el autor indica explícitamente que la confianza no está calibrada).

## Casos de uso

- Análisis de sentimiento en reseñas de cine: el modelo clasifica reseñas de IMDb en positivas o negativas, adecuado para prototipos de moderación o agregación de opiniones dentro de un dominio muy concreto (cine en inglés).
- Filtrado de comentarios en foros de películas: se puede usar como clasificador previo para separar críticas negativas y positivas antes de un análisis más profundo, aprovechando su throughput de unas 250 muestras por segundo en el hardware de evaluación.
- Etiquetado automático de datasets pequeños: dado su bajo coste computacional (81,9 M de parámetros), sirve para preetiquetar corpus de reseñas que luego se revisan manualmente, siempre que el dominio sea cinematográfico y en inglés.
- Baseline educativo en cursos de NLP: útil como referencia de ajuste fino de un decoder causal a una tarea de clasificación, con métricas de test reproducibles (accuracy 0,857, F1 0,8586).
- Experimentos de comparación decoder vs. encoder: permite contrastar el rendimiento de un backbone causal destilado frente a alternativas encoder como DistilBERT en la misma tarea y subconjunto.
- Detección de polaridad en pipelines de investigación: integrable con la librería `transformers` para pruebas de concepto que requieran una clasificación rápida de sentimiento en inglés, sin exigir GPU dedicada.

## Benchmarks y rendimiento

Resultados de test reportados por el autor sobre 1000 muestras del split oficial de IMDb (subconjunto educativo):

| Metrica | Valor |
|---|---|
| Test loss | 0,3384 |
| Test accuracy | 0,857 |
| Test precision (positiva) | 0,8493 |
| Test recall (positiva) | 0,868 |
| Test F1 (positiva) | 0,8586 |
| Test runtime | 3,9952 s |
| Muestras por segundo | 250,302 |
| Pasos por segundo | 31,288 |

Matriz de confusión (filas = real, columnas = predicho; orden negativo, positivo):

| | Pred. negativo | Pred. positivo |
|---|---|---|
| Real negativo | 423 | 77 |
| Real positivo | 66 | 434 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,33 GB solo para pesos (81,9 M de parámetros); en fp16 alrededor de 0,16 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequeños. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), y en principio exportable a ONNX; no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta cabeza de clasificación concreta.
- Latencia y throughput: el autor reporta 250,3 muestras/s y 31,3 pasos/s en el hardware de evaluación (no especificado), con un runtime total de 3,9952 s para 1000 muestras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sangatbaloch/imdb-decoder-finetuned | 81,9 M | 256 (entrenamiento) | Clasificación sentimiento IMDb | no disponible | HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Clasificación sentimiento | Apache 2.0 | HuggingFace |
| roberta-base (fine-tuned en IMDb, variantes comunitarias) | ~125 M | 512 | Clasificación sentimiento | MIT (base) | HuggingFace |

La comparación directa de rendimiento no está disponible en la información proporcionada: no se han publicado métricas de estos alternativos en el mismo subconjunto de 1000 muestras, por lo que no es posible afirmar superioridad o inferioridad numérica.

## Limitaciones y advertencias

- El propio autor indica que es un experimento educativo sobre un subconjunto, no el benchmark completo de IMDb; los resultados no son comparables con el estado del arte en IMDb completo.
- Solo admite inglés y está especializado en reseñas de películas; el cambio de dominio (otro tipo de texto) degradará el rendimiento.
- El sarcasmo y la ironía pueden provocar errores de clasificación.
- La truncación a 256 tokens puede eliminar información relevante en reseñas largas.
- La confianza de las predicciones no está calibrada, por lo que no deben usarse los scores como probabilidades fiables en producción.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue comercial.
- Riesgo de sesgos heredados del corpus IMDb y del backbone distilgpt2, no evaluados por el autor.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza aparente.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sangatbaloch/imdb-decoder-finetuned
- Modelo base: https://huggingface.co/distilbert/distilgpt2
- Dataset: https://huggingface.co/datasets/stanfordnlp/imdb
