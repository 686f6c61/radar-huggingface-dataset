# finvector/Test_sbert_lora_finsent-finmodern-investo-ccdb_2chunks_pair-tri_merged

## Resumen

Este repositorio contiene un modelo de embeddings de frases basado en BERT, publicado por el usuario finvector bajo el identificador `Test_sbert_lora_finsent-finmodern-investo-ccdb_2chunks_pair-tri_merged`. Por el nombre y la estructura se trata de una fusión (merge) de un adaptador LoRA sobre una base Sentence-BERT, aparentemente entrenada con datos financieros (los segmentos "finsent", "finmodern" e "investo" del nombre apuntan a ese dominio). El modelo mapea frases y párrafos a un espacio vectorial denso de 768 dimensiones y está pensado para similitud semántica, clustering y búsqueda semántica.

La model card, sin embargo, es la del modelo original `sentence-transformers/bert-base-nli-mean-tokens`, que el propio autor declara obsoleto y de baja calidad. Esto significa que la documentación no describe el proceso real de entrenamiento, los datos utilizados ni las métricas del modelo publicado. El repositorio no presenta descargas ni interacciones, lo que sugiere que es un artefacto de prueba interno más que un modelo listo para producción.

Con 109.482.240 parámetros (aproximadamente 109,5 millones) y un tamaño de repositorio de 0,2 GB, el modelo es ligero y desplegable en hardware modesto. Su relevancia práctica es limitada: sirve como ejemplo de pipeline de ajuste fino con LoRA sobre Sentence-BERT, pero carece de validación pública y de documentación específica del dominio financiero que su nombre sugiere.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (BertModel) con pooling de media sobre SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_seq_length declarado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card corresponde a un `SentenceTransformer` compuesto por un `Transformer` (BertModel) con `max_seq_length` de 128, `do_lower_case` a falso, seguido de una capa `Pooling` con dimensión de embedding de 768 y pooling por media de tokens (`pooling_mode_mean_tokens: True`). No se emplea pooling por token CLS ni por máximo. El nombre del repositorio indica que se ha aplicado un ajuste fino con LoRA y posteriormente se ha fusionado (merged) en los pesos base, pero no se documenta ni el rango del adaptador, ni los datos de entrenamiento, ni el número de pasos.

No hay información sobre el corpus utilizado, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de embeddings). Tampoco se detallan innovaciones técnicas más allá del esquema estándar de Sentence-BERT con entrenamiento por pares y tripletas (el sufijo "pair-tri" del nombre sugiere objetivos de pares y tripletas). La model card heredada corresponde a `bert-base-nli-mean-tokens`, entrenado originalmente sobre el corpus NLI, pero no hay evidencia de que el modelo publicado conserve esa configuración.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 768 dimensiones.
- Similitud semántica entre textos mediante distancia coseno o producto escalar.
- Clustering de documentos y agrupamiento semántico.
- Búsqueda semántica y recuperación de información (retrieval).
- Extracción de características (`feature-extraction`) para pipelines de transformers.
- Compatible con `text-embeddings-inference` y con endpoints compatibles según las etiquetas del repositorio.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.

## Casos de uso

- Búsqueda semántica sobre documentación financiera interna: indexar informes y recuperar fragmentos relevantes por similitud vectorial, aprovechando el ajuste aparente al dominio financiero. Requiere validar la calidad de los embeddings antes de desplegar.
- Deduplicación de noticias o comunicados: agrupar textos casi idénticos mediante clustering sobre los embeddings de 768 dimensiones, útil en agregadores de contenido económico.
- Clasificación de sentimiento financiero por similitud: comparar la representación de un texto con prototipos de frases positivas, negativas y neutras. El nombre "finsent" sugiere este uso, aunque no hay métricas que lo respalden.
- Motor de recomendación de contenidos: calcular similitud entre artículos o informes para sugerir lecturas relacionadas en portales de inversión.
- Enrutamiento de tickets de soporte: asignar consultas a categorías predefinidas comparando embeddings con centroides de cada categoría, con latencia baja gracias al tamaño reducido del modelo.
- Prototipado rápido de pipelines RAG: servir como codificador de recuperación en pruebas de concepto, dado que cabe en CPU y en GPUs de consumo con pocos recursos.
- Evaluación comparativa de técnicas de ajuste fino: usar el repositorio como referencia de un merge LoRA sobre Sentence-BERT en experimentos internos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros × 4 bytes), más activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU.
- GPUs de datacenter (A100, H100) no son necesarias; el modelo está sobredimensionado para ese hardware en términos de coste.
- Opciones de despliegue: `sentence-transformers`, `transformers` con pooling manual, `text-embeddings-inference` (según las etiquetas del repositorio), y exportación potencial a ONNX no documentada.
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en lote sobre GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Estado |
|---|---|---|---|---|---|
| finvector/Test_sbert_lora_finsent-finmodern-investo-ccdb_2chunks_pair-tri_merged | 109,5 M | 128 | 768 | apache-2.0 | Sin descargas ni validación pública |
| sentence-transformers/bert-base-nli-mean-tokens | ~109 M | 128 | 768 | apache-2.0 | Declarado obsoleto por el propio autor |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 | 384 | apache-2.0 | Ampliamente usado, recomendado por SBERT |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 | 768 | apache-2.0 | Referencia de calidad en SBERT |

Los datos de parámetros y contexto de los modelos comparados provienen de sus fichas públicas habituales; el rendimiento relativo no se ha medido en este análisis. El modelo de finvector no aporta métricas que permitan situarlo frente a estas alternativas, y la model card heredada advierte explícitamente contra el uso de la base original.

## Limitaciones y advertencias

- La model card es la de `bert-base-nli-mean-tokens`, que el propio autor marca como obsoleto y de baja calidad; no describe el modelo realmente publicado.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar sesgos y cobertura lingüística.
- Riesgo elevado de alucinación en el sentido de recuperaciones irrelevantes: sin métricas de retrieval no se puede garantizar la calidad de los embeddings.
- Longitud de contexto muy corta (128 tokens), insuficiente para documentos largos sin truncado.
- Idiomas soportados no declarados; no se recomienda asumir multilingüismo.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de validación y de documentación desaconseja su uso en producción.
- Cero descargas y cero interacciones: no hay evidencia de uso real ni de revisión por la comunidad.
- El nombre del repositorio sugiere un artefacto de prueba ("Test_"), no un modelo mantenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/finvector/Test_sbert_lora_finsent-finmodern-investo-ccdb_2chunks_pair-tri_merged
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Documentación de Sentence-Transformers: https://www.sbert.net
- Modelos recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
- Modelo base referenciado en la model card: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
