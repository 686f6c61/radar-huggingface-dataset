# Celestios/Persian-simkgc-256d

## Resumen

Persian SimKGC 256d es un modelo de completado de grafos de conocimiento (Knowledge Graph Completion) desarrollado por Celestios (shahin khodaverdi) para el proyecto Centrode. Se trata de un modelo basado en BERT, exportado a formato ONNX, que genera embeddings de 256 dimensiones (con una variante de 128 dimensiones mediante matryoshka) para representar entidades y relaciones en persa e inglés. Su propósito principal es predecir enlaces faltantes en grafos de conocimiento, una tarea fundamental para sistemas de búsqueda semántica, recomendación y razonamiento automático.

El modelo destaca por una poda de vocabulario que reduce la tabla de embeddings en aproximadamente un 60 %, limitando el vocabulario a caracteres persas (U+0600-U+06FF) e ingleses (a-zA-Z). El entrenamiento utiliza una pérdida contrastiva InfoNCE multidimensional, lo que permite realizar productos escalares de alta velocidad sobre vectores normalizados de 256 dimensiones. Aunque la información pública es escasa, el repositorio de GitHub asociado (simkgc_pipeline) documenta el pipeline de entrenamiento y las técnicas de optimización empleadas.

Actualmente el modelo cuenta con 59 descargas y ninguna valoración en Hugging Face. No se ha publicado una licencia explícita ni documentación detallada sobre el conjunto de datos de entrenamiento, lo que limita su uso en entornos de producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (adaptado para embeddings de grafos de conocimiento) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizacion declarada) |
| Idiomas soportados | Persa e ingles (vocabulario recortado a U+0600-U+06FF y a-zA-Z) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, adaptada para la tarea de completado de grafos de conocimiento mediante el enfoque SimKGC (Similarity-based Knowledge Graph Completion). La principal innovacion es la poda de vocabulario: se eliminan todos los caracteres no utilizados, conservando únicamente el rango persa (U+0600-U+06FF) y el alfabeto ingles (a-zA-Z), lo que reduce el tamaño de la tabla de embeddings en aproximadamente un 60 %. Ademas, se emplea una estrategia de embeddings matryoshka con dos dimensiones de salida (256d y 128d), entrenada con una perdida contrastiva InfoNCE multidimensional. Esto permite obtener representaciones normalizadas de alta calidad y realizar busquedas por similitud de coseno de forma eficiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio de GitHub menciona un pipeline completo, pero no se detallan los hiperparametros ni el proceso de generacion de datos negativos.

## Capacidades

- Completado de grafos de conocimiento: predice entidades o relaciones faltantes en tripletas (sujeto, predicado, objeto).
- Generacion de embeddings de entidades y relaciones en un espacio vectorial de 256 dimensiones (tambien disponible en 128d).
- Busqueda por similitud de coseno sobre vectores normalizados, optimizada para productos escalares rapidos.
- Soporte bilingue persa-ingles, limitado a los caracteres incluidos en el vocabulario recortado.
- Integracion con pipelines de procesamiento de grafos de conocimiento gracias a su formato ONNX, que facilita el despliegue en multiples entornos (CPU, GPU, edge).

## Casos de uso

- Enriquecimiento de bases de conocimiento: dado un grafo con entidades y relaciones parcialmente poblado, el modelo puede predecir enlaces faltantes, por ejemplo, completar la relacion "nacio_en" entre una persona y una ciudad.
- Sistemas de recomendacion basados en grafos: al representar usuarios, items y sus interacciones como entidades y relaciones, el modelo permite sugerir conexiones plausibles entre nodos.
- Busqueda semantica en persa: los embeddings generados pueden indexarse en motores de busqueda vectorial para recuperar entidades relacionadas a partir de consultas en lenguaje natural.
- Integracion en pipelines de NLP para persa: al ser un modelo ONNX, puede ejecutarse con ONNX Runtime en aplicaciones de procesamiento de texto, como extraccion de entidades o resolucion de coreferencia.
- Analisis de redes sociales: modelar relaciones entre usuarios, hashtags y contenidos para detectar comunidades o predecir interacciones futuras.
- Construccion de ontologias: asistencia en la curacion de ontologias al sugerir subclases o propiedades entre conceptos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como MMLU, HumanEval o GSM8K, ni de comparaciones con otros modelos de completado de grafos de conocimiento.

## Requisitos de hardware

- El modelo tiene un tamano de aproximadamente 1.59 GB en su archivo principal (el repositorio total ocupa 8.8 GB, incluyendo otros archivos). Esto lo hace adecuado para ejecutarse en CPU con memoria RAM suficiente (al menos 4 GB libres).
- Al ser un modelo ONNX, puede ejecutarse en GPU con CUDA mediante ONNX Runtime, aunque no se especifican requisitos minimos de VRAM. Una GPU con 4 GB de VRAM (por ejemplo, GTX 1650 o superior) deberia ser suficiente para inferencia.
- Es compatible con entornos de despliegue como ONNX Runtime, TensorRT o cualquier framework que soporte ONNX.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (completado de grafos de conocimiento en persa con embeddings matryoshka). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No se ha publicado una licencia explicita, por lo que el uso comercial y la redistribucion estan sujetos a incertidumbre legal.
- La documentacion es minima: no se detallan los datos de entrenamiento, el proceso de validacion ni las limitaciones conocidas.
- El vocabulario esta restringido a persa e ingles, por lo que no soporta otros idiomas ni caracteres especiales (numeros, puntuacion, etc.) fuera de esos rangos.
- Al ser un modelo de embeddings, no genera texto ni responde a preguntas; su uso se limita a tareas de representacion y similitud.
- No se han publicado evaluaciones de sesgos o alucinaciones, por lo que su comportamiento en dominios sensibles es desconocido.
- El modelo fue creado en agosto de 2026 y actualizado en septiembre de 2026, pero no se indica si ha sido validado en entornos de produccion.

## Enlaces

- [Hugging Face - Celestios/Persian-simkgc-256d](https://huggingface.co/Celestios/Persian-simkgc-256d)
- [Repositorio de archivos en Hugging Face](https://huggingface.co/Celestios/Persian-simkgc-256d/tree/main)
- [GitHub - Celestios/simkgc_pipeline](https://github.com/Celestios/simkgc_pipeline)
