# jeffespejo/roberta-base-goemotions-udea

## Resumen

RoBERTa-base fine-tuneado sobre GoEmotions es un modelo de clasificación de emociones multi-etiqueta desarrollado por Jefferson Espejo en el marco de un proyecto de curso de la Universidad de Antioquia. Parte de `FacebookAI/roberta-base` y se entrena sobre la versión simplificada del dataset GoEmotions (43.400 comentarios de Reddit), con el objetivo de detectar 27 emociones más la categoría neutral en textos cortos en inglés. A diferencia de un clasificador multinomial, cada etiqueta dispone de una salida sigmoide independiente y un umbral de decisión calibrado por separado, lo que permite que un mismo texto active varias emociones simultáneamente.

El modelo resuelve un problema clásico de análisis de sentimiento granular: ir más allá de positivo/negativo para identificar matices como gratitud, admiración, curiosidad o enfado en contenido generado por usuarios. Es relevante porque ofrece una alternativa ligera (124,7 millones de parámetros, 0,5 GB de repo) y de licencia Apache 2.0 frente a soluciones propietarias de moderación y análisis emocional, y porque publica umbrales por etiqueta en `thresholds.json`, un detalle poco habitual que facilita la reproducibilidad.

La arquitectura es un transformer encoder RoBERTa-base con una cabeza de clasificación de 28 salidas. El contexto efectivo de entrenamiento es de 64 tokens, adecuado para comentarios cortos pero no para documentos largos. Los resultados publicados en el split de test (micro-F1 0,603, macro-F1 0,523) superan claramente a una línea base TF-IDF con regresión logística (macro-F1 0,420).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 124.667.164 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima usada en entrenamiento); el límite arquitectónico de RoBERTa-base es 512, pero no se ha validado más allá de 64 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16; no se han publicado versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `FacebookAI/roberta-base`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con 124,7 millones de parámetros. La cabeza de clasificación se sustituye por una capa lineal de 28 salidas (27 emociones de GoEmotions más neutral) y se entrena con activación sigmoide, tratando el problema como 28 clasificaciones binarias independientes en lugar de una softmax única. Esta decisión es coherente con la naturaleza multi-etiqueta del dataset.

Los hiperparámetros publicados son: learning rate 5e-5, batch size 16, 4 épocas, longitud máxima 64 tokens y precisión fp16. El autor indica que la tasa de aprendizaje y el batch size se seleccionaron mediante una búsqueda en rejilla sobre una muestra. Los umbrales de decisión por emoción se ajustan sobre el split de validación y se almacenan en `thresholds.json`. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un fine-tuning supervisado estándar sobre el dataset GoEmotions en su variante `simplified`.

## Capacidades

- Clasificación multi-etiqueta de emociones en texto corto en inglés, con 27 emociones más neutral.
- Salidas probabilísticas independientes por etiqueta (sigmoide), lo que permite detectar emociones coexistentes en un mismo texto.
- Umbrales de decisión calibrados por emoción, ajustados sobre validación y distribuidos junto con los pesos.
- Clasificación de textos de hasta 64 tokens; adecuado para comentarios, tuits, reseñas cortas y mensajes de chat.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso, agentes ni modos de pensamiento.
- No tiene capacidades de visión, audio ni generación de texto.
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Moderación de comunidades en línea: clasificar comentarios de foros o redes en emociones como enfado, desprecio o acoso potencial, usando las probabilidades por etiqueta como señal para priorizar revisiones humanas. El contexto de 64 tokens encaja con la longitud típica de un comentario de Reddit.
- Análisis de sentimiento granular en atención al cliente: detectar gratitud, frustración o decepción en mensajes de soporte para enrutar tickets o priorizar respuestas, aprovechando que el modelo distingue matices que un clasificador positivo/negativo no captura.
- Monitorización de reputación de marca: procesar reseñas y menciones en inglés y agregar la distribución de emociones por producto o campaña a lo largo del tiempo.
- Investigación en psicolingüística y ciencias sociales: etiquetar corpus de texto en inglés con 28 categorías emocionales para estudios de análisis de discurso, con la ventaja de que los umbrales son reproducibles y están publicados.
- Filtrado previo en pipelines de datos: descartar o etiquetar contenido con alta carga emocional negativa antes de alimentar un modelo generativo o un sistema de recomendación.
- Detección de satisfacción en encuestas abiertas: clasificar respuestas de texto libre en inglés para complementar las escalas Likert con señales emocionales finas.
- Componente educativo o de prototipado: al ser un modelo pequeño (0,5 GB) y con licencia Apache 2.0, sirve como base para experimentos de fine-tuning adicional o para demostraciones en cursos de PLN.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de GoEmotions (5.427 comentarios):

| Modelo | Metrica | Valor |
|---|---|---|
| roberta-base-goemotions-udea | Micro-F1 (umbrales por emoción) | 0.603 |
| roberta-base-goemotions-udea | Macro-F1 (umbrales por emoción) | 0.523 |
| roberta-base-goemotions-udea | Macro-F1 (umbral único 0.35) | 0.509 |
| Baseline TF-IDF + regresión logística | Macro-F1 | 0.420 |
| Baseline siempre "neutral" | Macro-F1 | 0.018 |

No se han publicado resultados comparativos con otros modelos transformer sobre el mismo split en la información disponible.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 0,5 GB de VRAM para los pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- Inferencia en fp16: en torno a 0,25 GB de pesos; viable en GPUs consumer antiguas (GTX 1060 6 GB, RTX 2060) e incluso en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto, A100, H100, L4 o RTX 4090 permiten procesar lotes grandes con latencias de milisegundos.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida para inferencia puntual.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado en la model card), `optimum` para exportación a ONNX, y servidores de inferencia estándar como TorchServe o FastAPI con batching. No se han publicado artefactos para llama.cpp, Ollama ni vLLM (este último está orientado a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia sub-10 ms por muestra en GPU moderna con batch pequeño, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeffespejo/roberta-base-goemotions-udea | 124,7 M | 64 tokens (entrenamiento) | Multi-etiqueta, 28 etiquetas, umbrales por emoción | Apache 2.0 | Hugging Face |
| SamLowe/roberta-base-go_emotions | no disponible en la información proporcionada | no disponible | Multi-etiqueta sobre GoEmotions | no disponible en la información proporcionada | Hugging Face |
| Clasificador TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | Multi-etiqueta con bolsa de palabras | no aplica | Código del autor |

La comparación cuantitativa con `SamLowe/roberta-base-go_emotions` u otros fine-tunes de RoBERTa sobre GoEmotions no está disponible en la información proporcionada; el autor solo reporta comparaciones contra las dos líneas base incluidas en su model card.

## Limitaciones y advertencias

- Entrenado exclusivamente con comentarios de Reddit en inglés: el dominio y el registro pueden no generalizar a otros tipos de texto (documentación técnica, literatura, conversación formal).
- Las emociones muy raras en el dataset, como *grief* o *relief*, siguen siendo difíciles de detectar, según reconoce el propio autor.
- Contexto de entrenamiento de solo 64 tokens: textos más largos se truncan y pierden información; no se ha validado el comportamiento más allá de esa longitud.
- Riesgo de falsos positivos y negativos derivado de los umbrales: aunque están calibrados por emoción, el macro-F1 de 0,523 indica un margen de error notable en etiquetas poco frecuentes.
- Sesgos inherentes al corpus de Reddit: sobrerrepresentación de ciertos perfiles demográficos y temáticas, y posible presencia de lenguaje tóxico o sesgado en los datos originales.
- No es un modelo generativo: no puede explicar sus predicciones ni producir texto; solo devuelve probabilidades por etiqueta.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es un proyecto de curso, no un modelo mantenido con SLA.
- Sin versiones cuantizadas ni artefactos ONNX publicados: el despliegue en entornos con restricciones de memoria requiere conversión manual.
- Fecha de creación del repo (2026-11-22) y cero descargas/likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffespejo/roberta-base-goemotions-udea
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
- Código del proyecto: https://github.com/jeffespejo/nlp-transformers-finetuning
