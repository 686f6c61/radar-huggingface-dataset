# evelnap/indobertweet-text-only-s2

## Resumen

`evelnap/indobertweet-text-only-s2` es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning de `indolem/indobertweet-base-uncased`, un BERT base adaptado al indonesio y preentrenado sobre tuits. Lo publica el usuario evelnap en Hugging Face y su propósito es la detección multietiqueta de contenido tóxico: insultos, ataques a la identidad, amenazas o incitación a la violencia, lenguaje obsceno y contenido sexualmente explícito.

El modelo resuelve un problema concreto de moderación de contenido en indonesio, un idioma con menos recursos que el inglés en el ámbito de la seguridad de contenidos. Se trata de un transformer encoder de tipo BERT con 110.562.053 parámetros (aproximadamente 110,6 millones), arquitectura base no generativa y sin ventana de contexto extendida: hereda los límites típicos de BERT (512 tokens). El autor indica que los hiperparámetros se ajustaron con Optuna.

Es relevante por su especialización: en lugar de un modelo multilingüe genérico, parte de un encoder ya adaptado al registro informal de redes sociales en indonesio y se afina para cinco etiquetas de toxicidad independientes. No obstante, la información pública es muy escasa (sin métricas, sin detalles del dataset, sin licencia declarada), lo que limita su evaluación rigurosa antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base), fine-tuning para clasificación de secuencias |
| Parametros totales | 110.562.053 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (límite típico de BERT base: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación multietiqueta (`multi_label_classification`) |
| Etiquetas | `insults`, `identity_attack`, `threat_incitement_to_violence`, `profanity_obscenity`, `sexually_explicit` |
| Modelo base | `indolem/indobertweet-base-uncased` |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT en configuración base, con una cabeza de clasificación de secuencias que produce cinco salidas independientes (una por etiqueta) bajo un esquema multietiqueta, es decir, varias etiquetas pueden activarse simultáneamente para un mismo texto. El modelo parte de `indolem/indobertweet-base-uncased`, un BERT base entrenado específicamente sobre corpus de Twitter en indonesio, lo que aporta vocabulario y representaciones adaptadas a lenguaje informal, abreviaturas, menciones y emojis.

El autor indica que el fine-tuning se realizó con búsqueda de hiperparámetros mediante Optuna, pero no detalla el número de tokens de entrenamiento, la composición del dataset, el origen de las anotaciones ni si hubo técnicas adicionales como ponderación de clases o validación cruzada. Tampoco se documenta el proceso de preprocesado más allá de una recomendación al usuario: aplicar la misma normalización que en entrenamiento (minúsculas, normalización de emojis, menciones y URLs) para que las predicciones sean consistentes. No hay información sobre RLHF, DPO ni innovaciones técnicas destacables.

## Capacidades

- Clasificación de texto multietiqueta en indonesio para cinco categorías de toxicidad: insultos, ataques a la identidad, amenazas o incitación a la violencia, obscenidad y contenido sexualmente explícito.
- Detección simultánea de varias categorías en un mismo texto (salida multietiqueta, no mutuamente excluyente).
- Procesamiento de texto informal propio de redes sociales, gracias al preentrenamiento del modelo base sobre tuits.
- Integración directa con `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles (según los tags del repositorio).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No dispone de tool calling ni de capacidades de agente o razonamiento multi-paso.
- Capacidad multilingüe limitada al indonesio declarado; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Moderación de comentarios en plataformas de redes sociales en indonesio: el modelo clasifica cada comentario en las cinco categorías de toxicidad y permite priorizar revisiones humanas o aplicar filtros automáticos según la etiqueta activada.
- Filtrado previo de foros y comunidades de fans: al estar preentrenado sobre tuits, maneja bien el registro informal y las abreviaturas, lo que reduce falsos negativos frente a modelos entrenados solo con texto formal.
- Detección de discurso de odio en campañas electorales o debates públicos: la etiqueta `identity_attack` permite aislar mensajes dirigidos a colectivos y alimentar paneles de monitorización.
- Escalado de equipos de trust and safety: el modelo actúa como primera capa de triaje y solo los textos con etiquetas activas pasan a revisión humana, reduciendo el volumen de revisión manual.
- Análisis de toxicidad en investigación social: permite etiquetar grandes corpus de tuits en indonesio para estudios cuantitativos sobre incivilidad en línea, siempre que se valide el modelo con anotación humana previa.
- Moderación en comunidades de videojuegos o chat en vivo: la etiqueta `profanity_obscenity` y `insults` permiten filtrar mensajes en tiempo real con un modelo de 110 millones de parámetros que se ejecuta en CPU con latencia baja.
- Preprocesado para pipelines de anonimización o curación de datasets: descartar textos tóxicos antes de usar corpus indonesios para otros fines de entrenamiento o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos, y tampoco se documenta el conjunto de validación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para pesos (110,6 M de parámetros), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- En FP16/BF16: aproximadamente 0,22 GB de pesos, ejecutable en cualquier GPU moderna.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Ejecutable en CPU sin GPU dedicada: es un encoder de 110 M de parámetros, adecuado para inferencia por lotes en servidores estándar.
- Opciones de despliegue: `transformers` (PyTorch), text-embeddings-inference (declarado en los tags), ONNX Runtime y cuantización dinámica de PyTorch para reducir latencia en CPU. No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evelnap/indobertweet-text-only-s2` | 110,6 M | no disponible (típico 512) | Clasificación multietiqueta de toxicidad en indonesio | no disponible | Hugging Face, 14 descargas |
| `indolem/indobertweet-base-uncased` | ~110 M | 512 | Modelo base de lenguaje en indonesio (no clasificador) | no disponible en la información proporcionada | Hugging Face, ampliamente usado |
| `mdhugol/indonesia-bert-sentiment-classification` | ~110 M | 512 | Clasificación de sentimiento en indonesio | no disponible en la información proporcionada | Hugging Face |
| `w11wo/indonesian-roberta-base-sentiment-classifier` | ~125 M | 512 | Clasificación de sentimiento en indonesio | no disponible en la información proporcionada | Hugging Face |

La comparación directa es limitada: los alternativas más cercanas en tamaño e idioma abordan sentimiento, no toxicidad multietiqueta, y no se dispone de métricas del modelo evaluado para contrastar rendimiento. No se han identificado en la información proporcionada modelos comparables específicos de detección de toxicidad en indonesio con métricas publicadas.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay precisión, recall, F1 ni matriz de confusión publicada, por lo que no es posible estimar su fiabilidad real.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de integrarlo en un producto.
- Dataset de entrenamiento no documentado: se desconoce el origen, el tamaño y el sesgo de las anotaciones, lo que impide evaluar su cobertura y su calidad.
- Riesgo de sesgo: al partir de un corpus de tuits en indonesio, puede reproducir sesgos de género, regionales o religiosos presentes en ese registro, especialmente en la etiqueta `identity_attack`.
- Sensibilidad al preprocesado: el autor advierte que el texto debe normalizarse igual que en entrenamiento (minúsculas, emojis, menciones, URLs); un preprocesado distinto degrada las predicciones.
- Ámbito lingüístico restringido al indonesio; no hay evidencia de funcionamiento en malayo, javanés u otros idiomas cercanos.
- Contexto limitado al de BERT base (512 tokens); textos largos requieren truncamiento o segmentación, lo que puede perder contexto relevante para la clasificación.
- Riesgo de falsos positivos en lenguaje coloquial: insultos usados de forma afectiva o irónica pueden activar etiquetas de toxicidad.
- Modelo con muy poca adopción (14 descargas, 0 likes) y sin revisión comunitaria; conviene validarlo con un conjunto propio anotado antes de cualquier uso en producción.
- No apto para generación de texto ni para tareas fuera de la clasificación: la cabeza de clasificación sustituye la salida del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evelnap/indobertweet-text-only-s2
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModelForSequenceClassification
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
