# jadermcs/lexsplade-xlm-roberta-xl-silver

## Resumen

LexSPLADE (xlm-roberta-xl, silver) es un codificador léxico disperso (sparse encoder) desarrollado por el usuario jadermcs. A diferencia de los modelos de embeddings de frases convencionales, LexSPLADE genera, dada una oración con una palabra marcada mediante las etiquetas `<t>` y `</t>`, un vector disperso sobre el vocabulario de 250.004 tokens de XLM-R que representa el significado de esa palabra en ese contexto concreto. Es, por tanto, un embedding de palabra en contexto (word-in-context), no un embedding de oración.

El modelo se construye sobre `facebook/xlm-roberta-xl` (3.500 millones de parámetros) mediante un ajuste fino con LoRA de rango 16 y el entrenamiento completo de los embeddings de marcador y de la cabeza MLM. Está orientado a tareas de desambiguación del sentido de las palabras (word-sense disambiguation) y a la comparación léxica contextualizada, y según el autor es el checkpoint LexSPLADE con mejores resultados en MCL-WiC en inglés hasta la fecha.

Su relevancia radica en que los vectores resultantes son interpretables directamente: como las dimensiones corresponden a entradas del vocabulario, un vector puede leerse como una lista de palabras relacionadas. El modelo está entrenado únicamente con datos en inglés y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa XL) con cabeza MLM y pooling de span objetivo personalizado para SPLADE |
| Parametros totales | 3.480.498.324 (3,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por `max_seq_length` de XLM-R; el marcador debe quedar dentro) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el autor indica ~7 GB en bf16) |
| Idiomas soportados | en (inglés; entrenado solo con datos en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 250.004 tokens |
| Dimension del vector de salida | 250.004 (disperso; ~432 dimensiones no nulas por uso en MCL-WiC test) |
| Modelo base | facebook/xlm-roberta-xl |
| Libreria | sentence-transformers (SparseEncoder) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa XL, un transformer encoder de 3.500 millones de parámetros, y añade un módulo personalizado (`modeling_lexsplade.py`, cargado con `trust_remote_code=True`) que aplica la cabeza MLM únicamente a los tokens marcados con `<t>` y `</t>`, evitando así generar un tensor de logits de tamaño `[batch, seq, 250k]`. Los logits se centran por token restando la media y 2,5 desviaciones típicas antes de aplicar la ReLU (centrado con z = 2,5), y se enmascaran los tokens especiales, las stop words y los tokens sin letras ni dígitos.

El ajuste fino emplea LoRA con rango 16 y tasa de aprendizaje 2e-4, con el modelo base en bf16; los embeddings de marcador y la cabeza MLM se entrenan de forma completa y los adaptadores se fusionan en el checkpoint final. Los datos de entrenamiento consisten en 31.914 pares palabra-en-contexto con el mismo lema (silver verificados por LLM más el conjunto de entrenamiento de MCL-WiC). La función de pérdida combina AnglE loss sobre los vectores dispersos de la palabra objetivo, un regularizador de FLOPS de SPLADE (1e-3) y un término de Barlow Twins sobre la representación densa del span. La semilla utilizada es 42.

## Capacidades

- Generación de embeddings léxicos dispersos de palabra en contexto: devuelve un vector de 250.004 dimensiones sobre el vocabulario de XLM-R.
- Desambiguación del sentido de las palabras (word-sense disambiguation) mediante comparación de similitud coseno entre vectores contextuales.
- Interpretabilidad directa: las dimensiones del vector corresponden a palabras, por lo que puede leerse como una lista de términos relacionados.
- Extracción de características (pipeline `feature-extraction`).
- Comparación de usos de una misma palabra en distintos contextos (word-in-context).
- Vectores dispersos eficientes: alrededor de 432 dimensiones no nulas por uso, lo que permite almacenamiento y búsqueda dispersa.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no (entrenado solo en inglés; el enmascarado de stop words usa una lista inglesa que degrada el rendimiento multilingüe).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Desambiguación del sentido de las palabras en pipelines de NLP: dado un término y su oración, el modelo genera un vector contextual que puede compararse con otros usos para determinar si comparten sentido, aprovechando la alta precisión en MCL-WiC (AP 97,85 en test).
- Construcción de diccionarios y tesauros contextuales: al poder leerse el vector como una lista de palabras, se pueden extraer automáticamente términos relacionados con un uso concreto de una palabra para enriquecer recursos léxicos.
- Búsqueda léxica contextualizada: los vectores dispersos de 250.004 dimensiones permiten indexar ocurrencias de palabras y recuperar usos similares mediante índices invertidos, con un coste de almacenamiento reducido (~432 dimensiones no nulas).
- Análisis de corpus lingüísticos: comparar la evolución del uso de un término a lo largo de un corpus calculando la similitud coseno entre sus vectores contextuales en distintas épocas o dominios.
- Sistemas de corrección o sugerencia léxica: detectar usos anómalos de una palabra comparando su vector contextual con el de usos de referencia del mismo lema.
- Investigación en semántica distribucional: estudiar la polisemia y las relaciones léxicas con representaciones interpretables y de alta dimensión derivadas de un modelo multilingüe de gran tamaño.
- Evaluación de modelos de embeddings léxicos: servir como referencia o componente en experimentos comparativos sobre MCL-WiC y conjuntos crosslemma.

## Benchmarks y rendimiento

| Conjunto | AP |
|---|---|
| MCL-WiC test (en) | 97,85 |
| MCL-WiC dev (en) | 96,80 |
| crosslemma dev | 95,63 |

Sobre tres semillas (42, 43, 44), la misma receta produce un AP de 97,55 ± 0,35 en MCL-WiC test; este checkpoint corresponde al mejor de los tres. Las cifras de precisión (accuracy) se omiten porque están ajustadas sobre el propio split evaluado. El número medio de dimensiones no nulas por uso en MCL-WiC test es de 432 de 250.004. El enmascarado de stop words con lista inglesa cuesta unos 4,5 puntos de AP en MCL-WiC multilingüe respecto a la receta sin enmascarado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB en bf16 (indicado por el autor para los 3,5B parámetros); en fp32 sería del orden de 14 GB.
- GPU recomendadas: A100, H100 o GPUs con al menos 7-8 GB de VRAM para bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante), siempre que se use bf16.
- Opciones de despliegue: la librería sentence-transformers con `SparseEncoder` y `trust_remote_code=True`; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.
- Nota de memoria: los vectores de salida son de 250.004 dimensiones, por lo que conviene mantenerlos dispersos o densificar pocos a la vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jadermcs/lexsplade-xlm-roberta-xl-silver | 3,5B | no disponible | MCL-WiC test AP 97,85 | apache-2.0 | Hugging Face |
| jadermcs/lexsplade-xlm-roberta-large-silver | no disponible (XLM-R large) | no disponible | no disponible | no disponible | Hugging Face |
| jadermcs/lexsplade-roberta-large-silver-wic-wnbags | no disponible (RoBERTa large) | no disponible | no disponible | no disponible | Hugging Face |
| jadermcs/lexsplade-bert-large-silver | no disponible (BERT large) | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en inglés: para texto no inglés no es la mejor opción, y el enmascarado de stop words con lista inglesa degrada el rendimiento multilingüe en unos 4,5 puntos de AP.
- Requiere `trust_remote_code=True` para cargar el módulo personalizado de pooling; conviene revisar el código antes de usarlo en producción.
- Los vectores de salida son de 250.004 dimensiones: densificarlos de forma masiva consume mucha memoria; deben mantenerse dispersos o densificar pocos a la vez.
- Si los marcadores `<t>` y `</t>` quedan fuera de `max_seq_length` por truncamiento, el pooling recurre a toda la oración y devuelve un embedding de oración en lugar de un embedding de palabra.
- Riesgo de sesgos y alucinaciones: no disponible en la información proporcionada; al derivar de XLM-R, puede heredar sesgos del corpus de preentrenamiento.
- Las cifras de accuracy se omiten en la evaluación porque están ajustadas sobre el split evaluado; los valores de AP deben interpretarse con esa cautela.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base `facebook/xlm-roberta-xl`.
- El modelo tiene muy pocas descargas (5) y ninguna interacción (0 likes), lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-xl-silver
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Variante XLM-R large: https://huggingface.co/jadermcs/lexsplade-xlm-roberta-large-silver
- Variante RoBERTa large: https://huggingface.co/jadermcs/lexsplade-roberta-large-silver-wic-wnbags
- Variante BERT large: https://huggingface.co/jadermcs/lexsplade-bert-large-silver
- Paper, blog, repositorio o demo adicionales: no disponible
