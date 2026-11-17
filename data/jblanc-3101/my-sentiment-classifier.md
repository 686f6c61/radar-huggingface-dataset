# jblanc-3101/my-sentiment-classifier

## Resumen

My Sentiment Classifier es un clasificador binario de sentimiento (POSITIVE / NEGATIVE) publicado en Hugging Face por el usuario jblanc-3101. No se trata de un modelo entrenado desde cero, sino de una re-publicación de `distilbert-base-uncased-finetuned-sst-2-english`, el checkpoint de referencia de DistilBERT afinado sobre el corpus SST-2 por el equipo de Hugging Face. El autor lo describe explícitamente como un ejercicio de despliegue, no como una contribución de investigación.

Técnicamente es un transformer encoder de tipo DistilBERT, una versión destilada de BERT-base con 6 capas en lugar de 12 y 66.955.010 parámetros totales. La longitud de contexto no está declarada en la model card, pero corresponde a la del modelo base: 512 tokens. El modelo solo soporta inglés y está pensado para clasificación de sentimiento a nivel de frase u oración.

Su relevancia es limitada como artefacto nuevo: no aporta pesos distintos ni datos de entrenamiento propios, y en el momento de la consulta registra 0 descargas y 0 likes. Resulta útil únicamente como ejemplo de empaquetado y despliegue de un clasificador pequeño, o como punto de partida para un fine-tuning posterior sobre un dominio concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base admite 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización dinámica estándar de PyTorch y conversión a ONNX/GGUF mediante herramientas externas, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas obtenido por destilación de conocimiento a partir de BERT-base. La cabeza de clasificación es una capa lineal sobre el token `[CLS]` con dos salidas (POSITIVE / NEGATIVE). El checkpoint del que deriva fue afinado por Hugging Face sobre el dataset Stanford Sentiment Treebank (SST-2), compuesto por frases extraídas de críticas de cine en inglés con etiquetas binarias de sentimiento.

Esta re-publicación no documenta ningún entrenamiento adicional: la model card indica que los pesos se re-publican tal cual desde `distilbert-base-uncased-finetuned-sst-2-english`. No hay información sobre número de tokens de entrenamiento, composición del dataset más allá de SST-2, ni sobre uso de RLHF, DPO o técnicas de alineación, que en un clasificador de este tipo no aplican. Tampoco se documentan innovaciones técnicas propias.

## Capacidades

- Clasificación binaria de sentimiento (POSITIVE / NEGATIVE) sobre texto en inglés.
- Procesamiento a nivel de frase u oración, adecuado para textos cortos.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers.
- Devuelve etiqueta y puntuación de confianza por cada entrada.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Análisis de opiniones de productos en inglés: clasificar reseñas o comentarios de usuarios en positivos y negativos para agregar métricas de satisfacción; el modelo está entrenado sobre críticas de cine, por lo que funciona mejor con texto opinativo informal.
- Moderación de comentarios: filtrar automáticamente comentarios negativos en foros o secciones de noticias en inglés y derivarlos a revisión humana, usando la puntuación de confianza como umbral.
- Enrutamiento en atención al cliente: etiquetar tickets o mensajes entrantes en inglés según su tono para priorizar casos insatisfechos; requiere validación previa porque el dominio de entrenamiento (cine) difiere del de soporte.
- Etiquetado de datasets: pre-anotar grandes volúmenes de frases en inglés con sentimiento binario antes de una revisión manual, aprovechando el bajo coste computacional de un modelo de 67 millones de parámetros.
- Monitorización de reputación de marca: procesar menciones y reseñas en inglés recopiladas de la web y calcular series temporales de sentimiento por producto o campaña.
- Baseline en experimentos de NLP: servir como referencia rápida en la evaluación de clasificadores de sentimiento propios o de modelos más grandes, dado su tamaño reducido y su licencia permisiva.
- Componente en pipelines de extracción de opiniones: combinar la clasificación de sentimiento con otros modelos (NER, extracción de aspectos) para construir análisis de opiniones basados en aspectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1 ni comparaciones, y el autor no documenta ninguna evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB solo para pesos (66,9 M de parámetros); en FP16, unos 135 MB. Con activaciones y overhead del runtime, cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en T4, RTX 3060, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: la inferencia en CPU es viable para lotes pequeños; el modelo es lo bastante pequeño para ejecutarse en tiempo real en un núcleo moderno.
- Opciones de despliegue: Hugging Face Transformers (pipeline `text-classification`), Text Generation Inference no aplica (no es generativo), ONNX Runtime y TorchScript mediante exportación estándar, y FastAPI o similares para servir el pipeline. La conversión a GGUF para llama.cpp no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jblanc-3101/my-sentiment-classifier | 66,9 M | no disponible (base: 512) | en | Apache 2.0 | Re-publicación de DistilBERT SST-2 |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | en | Apache 2.0 | Modelo base original, mismos pesos |
| cardiffnlp/twitter-roberta-base-sentiment-latest | no disponible en la información | no disponible | en | no disponible | Clasificador de sentimiento en tres clases entrenado con tuits |
| ProsusAI/finbert | no disponible en la información | no disponible | en | no disponible | Clasificador de sentimiento financiero sobre texto en inglés |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre frases de críticas de cine (SST-2); el propio autor advierte que no es adecuado para otros dominios, como reclamaciones bancarias, sin un fine-tuning adicional.
- Idioma: solo inglés; no procesa texto en castellano ni en otras lenguas.
- Sesgos: al derivar de BERT-base sin filtrado documentado, puede heredar sesgos presentes en el corpus de preentrenamiento y en SST-2; la model card no incluye análisis de sesgos.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en textos ambiguos, sarcásticos o fuera de dominio.
- Licencia: Apache 2.0, permisiva para uso comercial; conviene conservar la atribución correspondiente al modelo base y a Hugging Face.
- Producción: no hay métricas publicadas, ni evaluación propia, ni versionado más allá del commit inicial; para uso real se recomienda validar sobre un conjunto representativo del dominio objetivo antes de desplegar.
- Contexto: la model card no declara la longitud máxima de entrada; asumir 512 tokens por herencia del modelo base y truncar entradas más largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jblanc-3101/my-sentiment-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Dataset SST-2: https://huggingface.co/datasets/stanfordnlp/sst2
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de BERT (paper): https://arxiv.org/abs/1810.04805
