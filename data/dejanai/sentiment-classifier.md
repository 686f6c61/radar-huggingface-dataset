# dejanai/sentiment-classifier

## Resumen

`dejanai/sentiment-classifier` es un ajuste fino del modelo base `google/gemma-3-270m` (la variante base, no la instruct) al que se le ha añadido una cabeza de clasificación de 7 clases para análisis de sentimiento. Lo desarrolla el usuario de Hugging Face `dejanai` y resuelve un problema concreto: clasificar segmentos cortos de texto (frases, encabezados, viñetas, filas de tabla) en una escala granular de siete niveles de sentimiento, desde "muy positivo" hasta "muy negativo", en lugar de la dicotomía habitual positivo/negativo.

El modelo es relevante por su tamaño reducido (268 millones de parámetros) y su enfoque en granularidad fina del sentimiento, algo poco común en clasificadores ligeros. Está entrenado exclusivamente con datos sintéticos generados por Gemini 3.8 Flash y etiquetados por el mismo modelo, lo que constituye tanto su principal virtud (volumen y consistencia) como su principal limitación (no hay validación con texto humano real).

La arquitectura subyacente es la de Gemma 3 en su variante de texto, con una cabeza `Gemma3TextForSequenceClassification` de 7 etiquetas. El contexto de entrada está limitado a 128 tokens, suficiente para segmentos cortos pero no para documentos completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con cabeza de clasificación de secuencia |
| Parámetros totales | 268.102.656 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en inferencia) |
| Tipos de cuantización | no disponible (pesos en safetensors, probablemente bf16/fp16 y cuantizables a GGUF/8-bit/4-bit con herramientas estándar) |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m` y sustituye la cabeza de lenguaje por una cabeza de clasificación de 7 clases (`Gemma3TextForSequenceClassification`). Durante el ajuste se congela el embedding de entrada y se entrenan el resto de pesos. El entrenamiento usa AdamW con learning rate 2e-5, schedule one-cycle durante 1,5 épocas, batch size 32, longitud máxima 128 y autocast en bf16. La función de pérdida es cross-entropy ponderada por la inversa de la frecuencia de cada etiqueta, para compensar el desequilibrio entre clases. Se validó cada 100 pasos con early stopping (paciencia 5); el checkpoint liberado corresponde al paso 2.100, con la menor pérdida de validación, tras detenerse el entrenamiento en el paso 2.600.

Los datos de entrenamiento son unos 83.000 segmentos etiquetados procedentes de 2.782 documentos sintéticos, generados en tres fases: un "writer" (Gemini 3.8 Flash) redactó documentos completos en 26 formatos (entradas de blog, reseñas de producto, hilos de tuits, notas de reunión, artículos técnicos, notas de prensa, chats de soporte, transcripciones de YouTube y pódcast, FAQ, etc.); un segmentador en Python dividió cada documento en sus unidades naturales (encabezados, viñetas, filas de tabla, líneas de metadatos, código, frases); y un "labeller" (otra llamada a Gemini 3.8 Flash) etiquetó cada segmento leyéndolo en el contexto del documento completo. Los splits son por documento (80/10/10), de modo que ningún documento aporta segmentos a entrenamiento y test simultáneamente.

## Capacidades

- Clasificación de sentimiento en 7 niveles: muy positivo, positivo, algo positivo, neutro, algo negativo, negativo, muy negativo.
- Procesamiento de segmentos cortos: frases, encabezados, viñetas, filas de tabla, líneas de metadatos y líneas de código.
- Salida con probabilidad por clase (score) además de la etiqueta predicha.
- Capacidad multilingüe: no disponible; solo entrenado y evaluado en inglés.
- Tool calling / function calling: no soportado (es un clasificador, no un modelo generativo).
- Razonamiento multi-paso o agentes: no soportado.
- Modo thinking, visión o audio: no soportado.
- Análisis a nivel de documento mediante agregación de segmentos (el propio modelo no lo hace; hay que segmentar y clasificar por separado).

## Casos de uso

- Análisis de reseñas de producto por frase: dividir cada reseña en frases y clasificar cada una para obtener la distribución de sentimiento a lo largo del texto, detectando párrafos positivos con quejas puntuales.
- Monitorización de menciones de marca en redes sociales: clasificar tuits y comentarios cortos en la escala de 7 niveles para detectar no solo la polaridad sino la intensidad, útil para alertas tempranas de crisis.
- Procesamiento de encuestas con preguntas abiertas: clasificar cada respuesta corta en la escala granular y agregar por segmento de usuario, sin necesidad de un LLM generativo grande.
- Análisis de tickets de soporte: clasificar la línea de asunto y el primer párrafo de cada ticket para priorizar los "muy negativos" y enrutarlos a atención especializada.
- Extracción de sentimiento en tablas y metadatos: al soportar filas de tabla y líneas de metadatos, permite clasificar columnas de comentarios en hojas de cálculo exportadas a texto.
- Clasificación de titulares y encabezados en agregadores de noticias: etiquetar titulares por tono para personalización de feeds o estudios de sesgo mediático a escala.
- Preetiquetado para anotación humana: usar el modelo como primer paso en un pipeline de etiquetado y reservar la revisión humana para los casos de baja confianza o etiquetas vecinas confundidas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test sintético de 8.749 segmentos (documentos no vistos en entrenamiento):

| Métrica | Valor |
|---|---|
| Exactitud de etiqueta exacta | 84,0 % |
| Exactitud exacta o un nivel de desviación | 95,2 % |
| Macro-F1 | 0,833 |

Desglose de F1 por etiqueta:

| Etiqueta | F1 |
|---|---|
| very positive | 0,88 |
| positive | 0,80 |
| somewhat positive | 0,88 |
| neutral | 0,90 |
| somewhat negative | 0,70 |
| negative | 0,79 |
| very negative | 0,89 |

El autor advierte que el conjunto de test es sintético y fue etiquetado por el mismo proceso que los datos de entrenamiento, por lo que estas cifras miden la concordancia con ese etiquetado, no el rendimiento en texto humano real. La frontera más difícil es "somewhat negative" frente a "negative". No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 0,55 GB de pesos; en 8-bit, unos 0,3 GB; en 4-bit, unos 0,15 GB. Con overhead de activaciones y framework, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). También puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, TorchScript, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no se ha publicado conversión oficial). Para serving a escala, vLLM no es la opción natural para clasificación; TGI tampoco; lo habitual es un servidor HTTP ligero con `transformers` o `optimum`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (268 M de parámetros) se espera un throughput alto en GPU (miles de segmentos por segundo en lote) y latencia de milisegundos por segmento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dejanai/sentiment-classifier | 268 M | 128 tokens | Clasificación 7 niveles | Gemma Terms of Use | Hugging Face |
| google/gemma-3-270m (base) | 268 M | no disponible | Modelo de lenguaje base | Gemma Terms of Use | Hugging Face |
| Clasificadores BERT/RoBERTa de sentimiento (p. ej. `cardiffnlp/twitter-roberta-base-sentiment-latest`) | ~125 M | 512 tokens | Clasificación 3 niveles | MIT / varias | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente con texto sintético en inglés escrito por un modelo; el rendimiento en reseñas reales, redes sociales y escritura informal puede ser inferior.
- Las etiquetas provienen de un solo modelo (Gemini 3.8 Flash), por lo que incorpora sus sesgos y su criterio sobre la intensidad del sentimiento.
- Cada segmento se clasifica de forma aislada; frases cuyo tono depende del contexto previo (por ejemplo, "And yet…") pueden malinterpretarse.
- Confusión frecuente entre niveles vecinos, especialmente "somewhat negative" y "negative" (F1 de 0,70 en la primera).
- Contexto de entrada limitado a 128 tokens: no admite documentos completos en una sola pasada.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Licencia Gemma Terms of Use: el uso comercial está permitido bajo esas condiciones, pero debe respetarse la Gemma Prohibited Use Policy; no es una licencia permisiva tipo MIT o Apache.
- No es un modelo generativo: no puede usarse para resúmenes, respuestas o razonamiento; únicamente para clasificación.
- Sin evaluación con texto humano etiquetado: las métricas publicadas no garantizan rendimiento en producción real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dejanai/sentiment-classifier
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
