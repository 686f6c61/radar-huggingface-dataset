# CobuildX-AI/cbx-indim-sentiment-classifier-32M

## Resumen

cbx-indim-sentiment-classifier-32M es un clasificador de sentimiento supervisado para 12 idiomas de la India (hindi, bengalí, maratí, tamil, telugu, kannada, malayalam, guyaratí, panyabí, oriya, asamés y urdu) más inglés, que devuelve una de tres etiquetas: `positive`, `negative` o `neutral`. Lo desarrolla CobuildX-AI como ajuste fino de su modelo base InDIM-small, un transformer de tipo ModernBERT de 31.492.611 parámetros (unos 32M), según los pesos publicados en safetensors.

Su principal singularidad es el tratamiento del multilingüismo real de la India: acepta texto en escritura nativa, romanizado y code-mixed (por ejemplo, hindi escrito con alfabeto latino mezclado con inglés), algo que la mayoría de clasificadores multilingües genéricos no cubren bien. Está pensado para ejecutarse en CPU en pocos milisegundos, lo que lo hace apto para clasificación masiva de comentarios, reseñas y mensajes de soporte.

La relevancia actual reside en su relación rendimiento/tamaño: con 32M de parámetros queda a la altura de mmBERT-small (140M) en el conjunto IndicSentiment y lo supera en telugu, aunque modelos mayores como IndicBERT v2 (278M) obtienen resultados claramente superiores en esa misma prueba. La licencia es Apache 2.0 y el repositorio incluye pesos en PyTorch, un ONNX en fp32 y código de ejemplo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ModernBERT (modelo base InDIM-small) |
| Parámetros totales | 31.492.611 (~32M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (el texto más largo se trunca) |
| Tipos de cuantización | fp32 (PyTorch y ONNX), fp16; int8 dinámico per-channel en PyTorch; int8 en ONNX no se distribuye |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (nativo, romanizado y code-mixed) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de CobuildX-AI/InDIM-small, un transformer de la familia ModernBERT de 32M de parámetros. La tarea es clasificación de texto en tres clases (`positive`, `negative`, `neutral`). El ajuste se realizó con receta estándar (fine-tuning plano, learning rate seleccionado sobre validación) y los resultados publicados corresponden a la media de 3 ejecuciones de entrenamiento con desviación estándar, salvo donde se indica.

Las etiquetas de entrenamiento provienen de LLMs siguiendo una guía escrita, no de anotadores humanos. El repositorio contiene la ejecución con mejor puntuación de validación: 0,811 en IndicSentiment y 0,518 en el conjunto etiquetado por fuente. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo base está marcado como cuantizado en los tags (`base_model:quantized:CobuildX-AI/InDIM-small`).

## Capacidades

- Clasificación de sentimiento en tres clases (`positive`, `negative`, `neutral`) con puntuaciones de probabilidad por clase.
- Cobertura de 12 idiomas indios más inglés en escritura nativa, romanizada y code-mixed.
- Distinción entre sentimiento del autor y contenido del evento: noticias que solo informan de un hecho se clasifican como `neutral`.
- Tratamiento del sarcasmo según el significado pretendido; en textos con ambas polaridades prevalece la dominante o la conclusión del autor.
- Inferencia rápida en CPU: 5,7 ms para una frase de 15 tokens y 22,8 ms para una entrada larga de unas 200 palabras (Intel i7-10700, 8 hilos, PyTorch fp32).
- Compatibilidad con ONNX Runtime mediante `onnx/model.onnx` (fp32), con las mismas decisiones que PyTorch en 1.000 de 1.000 textos de prueba.
- Soporte de `text-embeddings-inference` y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido: es exclusivamente un clasificador.

## Casos de uso

- Monitorización de reseñas de producto en marketplaces indios: clasificar en lote reseñas en hindi, tamil o bengalí para generar métricas agregadas de satisfacción; conviene comparar solo las puntuaciones `positive` y `negative` si todas las reseñas llevan opinión.
- Enrutamiento de tickets de soporte: etiquetar mensajes de clientes en varios idiomas para priorizar los negativos hacia agentes humanos, aprovechando la latencia de milisegundos en CPU.
- Análisis de redes sociales y comentarios de YouTube: procesar comentarios romanizados y code-mixed (por ejemplo, hindi en alfabeto latino mezclado con inglés) que los clasificadores multilingües estándar suelen fallar.
- Escucha de marca a escala: agregar el sentimiento de menciones públicas en 13 idiomas para paneles de reputación, leyendo los resultados en conjunto y no caso a caso.
- Filtrado previo en pipelines de moderación: descartar o marcar contenido claramente negativo para revisión humana, reduciendo el volumen que llega a moderadores.
- Investigación en lingüística computacional: obtener una línea base ligera y reproducible para experimentos sobre sentimiento en lenguas indias, con pesos ONNX y código de ejemplo incluidos.
- Procesamiento en dispositivos con recursos limitados: al ocupar unos 0,3 GB en el repositorio y ejecutarse en CPU en milisegundos, puede desplegarse en servidores sin GPU o en entornos de borde.

## Benchmarks y rendimiento

Resultados publicados en la model card. Dos conjuntos de prueba etiquetados por personas y no usados en entrenamiento. Media de 3 ejecuciones ± desviación estándar, salvo donde se indica.

| Modelo | Parámetros | IndicSentiment accuracy | Source-labelled macro F1 | English tweets | Romanized Hindi | Telugu |
|---|---|---|---|---|---|---|
| **InDIM-small (base de este modelo)** | **32M** | 0,822 ± 0,016 | 0,512 ± 0,005 | 0,640 | 0,560 | 0,443 |
| mmBERT-small | 140M | 0,839 ± 0,004 | 0,508 ± 0,015 | 0,706 | 0,565 | 0,415 |
| mmBERT-base (1 ejecución) | 307M | 0,901 | 0,524 | 0,716 | 0,601 | 0,421 |
| IndicBERT v2 | 278M | **0,944 ± 0,003** | **0,547 ± 0,002** | 0,713 | 0,577 | **0,475** |

Notas: IndicSentiment (AI4Bharat, CC0) contiene 12.946 reseñas de producto en 13 idiomas, cada una positiva o negativa; la métrica compara solo las puntuaciones `positive` y `negative` (exactitud de dos vías). El conjunto etiquetado por fuente agrupa 8.712 textos con las etiquetas propias de sus datasets (6.796 frases en telugu, 870 tuits en inglés y 1.046 comentarios de YouTube en hindi romanizado); sus reglas de etiquetado difieren de las del modelo, por lo que todos los modelos puntúan cerca de 0,5 de macro F1 y la tabla debe leerse por el orden relativo. Este repositorio concreto obtuvo 0,811 en IndicSentiment y 0,518 en el conjunto etiquetado por fuente.

Precisión: fp16 produce las mismas etiquetas que fp32 en ambos conjuntos; int8 dinámico per-channel en PyTorch mantiene entre el 95 % y el 97 % de las etiquetas; int8 en ONNX cambió el 4 % de las decisiones, por lo que solo se distribuye el ONNX en fp32.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 para los pesos (32M de parámetros); en la práctica cabe en cualquier GPU consumer, aunque está diseñado para CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier tarjeta con suficiente memoria para el modelo y el lote, incluidas RTX 4090, A100 o H100 si se busca máximo throughput por lotes.
- Cabe en GPU consumer: sí, en cualquier modelo actual (GTX 1060 en adelante) e incluso en CPU de escritorio.
- Opciones de despliegue: PyTorch con Transformers, ONNX Runtime (archivo `onnx/model.onnx` en fp32), text-embeddings-inference y endpoints compatibles según los tags. La model card incluye `cbx_sentiment.py` y `example.py` en el repositorio.
- Latencia: 5,7 ms por frase de 15 tokens y 22,8 ms por entrada de unas 200 palabras en un Intel i7-10700 con 8 hilos y PyTorch fp32, un texto cada vez. No se publica throughput por lotes ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IndicSentiment accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **cbx-indim-sentiment-classifier-32M** | 32M | 256 tokens | 0,811 (esta ejecución) / 0,822 (media de 3) | Apache 2.0 | Hugging Face, ONNX incluido |
| mmBERT-small | 140M | no disponible | 0,839 ± 0,004 | no disponible en la información | Hugging Face |
| mmBERT-base | 307M | no disponible | 0,901 (1 ejecución) | no disponible en la información | Hugging Face |
| IndicBERT v2 | 278M | no disponible | 0,944 ± 0,003 | no disponible en la información | Hugging Face |

El modelo iguala a mmBERT-small con una cuarta parte de sus parámetros y lo supera en telugu (0,443 frente a 0,415 de macro F1), pero IndicBERT v2 es claramente mejor en IndicSentiment. Para licencias y contexto de los modelos comparables, la información disponible no permite confirmarlos.

## Limitaciones y advertencias

- Exceso de etiquetas `neutral`: en IndicSentiment, donde toda reseña es positiva o negativa, la decisión de tres vías a menudo asigna `neutral`. Si los textos siempre llevan opinión, deben compararse solo las puntuaciones `positive` y `negative`.
- Etiquetas de entrenamiento generadas por LLMs siguiendo una guía escrita, no por personas; datos etiquetados con otras reglas (por ejemplo, noticias reportadas como negativas) puntuarán peor.
- El modelo juzga el texto aislado: no ve la conversación ni la publicación a la que responde un comentario, por lo que sarcasmo, ironía, citas y respuestas a contenido invisible suelen interpretarse mal.
- Los errores no se distribuyen de forma uniforme entre idiomas, escrituras, dialectos o temas; el texto político, religioso y comunitario puede juzgarse con menor precisión. Sus peores idiomas en IndicSentiment son inglés, hindi y urdu.
- Límite de 256 tokens por entrada; los textos más largos se truncan y la salida lo indica con `"truncated": True`.
- La cuantización int8 en ONNX altera el 4 % de las decisiones; solo se distribuye el ONNX en fp32. El int8 dinámico en PyTorch mantiene entre el 95 % y el 97 % de las etiquetas.
- Uso previsto: medir y enrutar sentimiento a escala en comentarios, reseñas, mensajes de soporte y redes sociales, con resultados leídos en agregado o revisados por personas. La model card marca explícitamente usos no previstos, pero el texto disponible se corta en ese punto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base InDIM-small y de los datos de entrenamiento antes de un despliegue en producción.
- Sin descargas ni likes en el momento de la consulta: el modelo no tiene validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indim-sentiment-classifier-32M
- Modelo base InDIM-small: https://huggingface.co/CobuildX-AI/InDIM-small
- Dataset IndicSentiment (AI4Bharat): https://huggingface.co/datasets/ai4bharat/IndicSentiment
- Repositorio de CobuildX-AI en Hugging Face: https://huggingface.co/CobuildX-AI
