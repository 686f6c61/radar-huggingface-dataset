# amir1381sa/persian-paraphrase-bert

## Resumen

El modelo `amir1381sa/persian-paraphrase-bert` es un clasificador binario de secuencias diseñado para identificar si dos frases en persa son paráfrasis, es decir, si transmiten el mismo significado. Está desarrollado por el usuario amir1381sa y se basa en el modelo preentrenado `HooshvareLab/bert-base-parsbert-uncased` (ParsBERT), al que se le añade una cabeza de clasificación de dos clases. El modelo fue ajustado (fine-tuning) sobre el dataset PARSINLU QQP, un conjunto de pares de preguntas y frases en persa con etiquetas de paráfrasis.

Con 162,8 millones de parámetros y una arquitectura BERT estándar, este modelo resuelve el problema de la detección de similitud semántica en persa, una tarea fundamental para sistemas de búsqueda, deduplicación de contenido y análisis de texto. Su relevancia radica en que cubre un hueco en el procesamiento del lenguaje natural para el persa, un idioma con menos recursos que el inglés, y ofrece una solución ligera y fácil de integrar mediante la librería Transformers. La longitud máxima de secuencia es de 128 tokens, lo que limita su uso a frases o preguntas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (ParsBERT, base uncased) |
| Parametros totales | 162.842.882 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens (maxima secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT original, con 12 capas de encoder, 12 cabezas de atención y una dimensión oculta de 768. La base es ParsBERT, un modelo preentrenado específicamente para persa, y se le añade una capa de clasificación binaria. Durante el ajuste fino se congelaron las capas de embedding y los encoder layers 0 a 7, dejando entrenables únicamente las capas 8 a 11 y la cabeza de clasificación. Esta estrategia permite adaptar las representaciones de alto nivel a la tarea de paráfrasis sin alterar las representaciones lingüísticas de bajo nivel.

El entrenamiento se realizó sobre el dataset PARSINLU QQP, que contiene pares de preguntas y frases en persa etiquetadas como paráfrasis o no. Se usaron 5 épocas, una tasa de aprendizaje de 2e-5, tamaño de lote de 16 para entrenamiento y 32 para evaluación, weight decay de 0.01 y una longitud máxima de secuencia de 128 tokens. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado estándar con una función de pérdida de clasificación.

## Capacidades

- Clasificación binaria de pares de textos en persa: predice si dos frases son paráfrasis (clase 1) o no (clase 0).
- Generación de texto: no aplica, es un modelo de clasificación, no generativo.
- Razonamiento: no relevante, la tarea es de similitud semántica.
- Código: no soportado.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no aplica.
- Multilingüe: no, solo persa.
- Capacidades especiales: ninguna más allá de la clasificación de pares.

## Casos de uso

- Deduplicación de preguntas en foros y plataformas de soporte: el modelo puede identificar si dos preguntas de usuarios son equivalentes, permitiendo agrupar consultas repetidas y reducir el trabajo de los agentes. Su ventana de 128 tokens es suficiente para preguntas típicas.
- Búsqueda semántica en bases de conocimiento en persa: al comparar la consulta del usuario con entradas almacenadas, se puede detectar si una respuesta existente cubre la misma intención, mejorando la precisión de los sistemas de recuperación.
- Verificación de similitud en contenido generado: en entornos editoriales, ayuda a detectar si dos artículos o párrafos en persa son paráfrasis, útil para control de plagio o reescritura.
- Análisis de redes sociales: permite agrupar mensajes que expresan la misma opinión o queja, facilitando el análisis de tendencias y la moderación de contenido.
- Sistemas de preguntas frecuentes (FAQ) inteligentes: el modelo puede emparejar la pregunta del usuario con la pregunta canónica de la base de datos, activando la respuesta adecuada sin necesidad de reglas manuales.
- Preprocesamiento de datasets para entrenamiento de otros modelos: se puede usar para filtrar pares redundantes o para generar datos de entrenamiento de modelos generativos de paráfrasis.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de test de PARSINLU QQP:

| Metrica | Valor |
|---|---|
| Accuracy | 0.7636 |
| Precision | 0.6934 |
| Recall | 0.8189 |
| F1 | 0.7510 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo BERT de 162M parámetros, en FP32 ocupa aproximadamente 650 MB de memoria. Con cuantización a 8 bits (si se aplicara) se reduciría a unos 170 MB, pero no se proporcionan pesos cuantizados. En la práctica, una GPU con 2 GB de VRAM es suficiente para inferencia con lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso una CPU (inferencia lenta pero viable).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: se puede servir con Hugging Face Transformers, Text Generation Inference (TGI) no es adecuado porque no es generativo, pero se puede usar con Hugging Face Inference Endpoints o con un servidor Python simple. También es compatible con la librería `text-embeddings-inference` según las etiquetas, aunque no está claro si se usa para embeddings.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de identificación de paráfrasis en persa con los que comparar directamente. El modelo base ParsBERT es el punto de partida, pero no es un modelo de clasificación de pares. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos en persa, por lo que no debe usarse con otros idiomas.
- La longitud máxima de secuencia es de 128 tokens, lo que limita su aplicación a frases cortas; textos largos deberán truncarse, perdiendo información.
- Los resultados de test muestran un F1 de 0.75, lo que indica que hay un margen de error considerable; no es adecuado para aplicaciones críticas sin supervisión humana.
- El dataset PARSINLU QQP puede contener sesgos propios de las preguntas de usuarios persas; el modelo puede no generalizar bien a dominios muy específicos (legal, médico, etc.).
- No se han documentado pruebas de robustez frente a variaciones dialectales o registros informales del persa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de precisión o idoneidad para un caso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amir1381sa/persian-paraphrase-bert
- Repositorio de ParsBERT: https://github.com/hooshvare/parsbert
- Dataset PARSINLU: https://github.com/persiannlp/parsinlu
