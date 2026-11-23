# kkalyfo/geopres-jina-embeddings-v2-small-en-32

## Resumen

GeoPres es una proyección lineal entrenada por el usuario de Hugging Face `kkalyfo` que reduce de 512 a 32 dimensiones los embeddings generados por el modelo `jinaai/jina-embeddings-v2-small-en`. No se trata de un modelo de lenguaje ni de un encoder independiente: es una matriz `W` de 32 x 512 que se aplica sobre embeddings ya calculados, con el objetivo de preservar las distancias euclídeas por pares entre vectores. La técnica subyacente se describe en el artículo "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027).

El repositorio no incluye el backbone, que permanece congelado y debe descargarse por separado desde el repositorio oficial de Jina AI. La inferencia consiste en una única multiplicación de matrices, lo que abarata el coste de almacenamiento y de búsqueda en sistemas de recuperación vectorial. El repositorio tiene un tamaño de 0,0 GB, sin descargas ni likes en el momento de la consulta, y la librería declarada es `geopres`.

La relevancia práctica es la compresión de índices vectoriales: reducir de 512 a 32 dimensiones multiplica por 16 el ahorro en memoria y acelera las búsquedas por similitud, a cambio de una pérdida de información que el método de GeoPres intenta minimizar preservando la estructura geométrica del espacio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (matriz W de 32 x 512) sobre embeddings congelados de `jinaai/jina-embeddings-v2-small-en` |
| Parametros totales | 16.384 (32 x 512); el backbone no está incluido |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone, no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone es un modelo en inglés por su nombre, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se carga vía `geopres`, presumiblemente safetensors; no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es una proyección lineal pura: una matriz `W` de 32 filas por 512 columnas que transforma cada embedding de entrada en un vector de 32 dimensiones. No hay capas no lineales, atención ni mecanismos recurrentes. El backbone `jinaai/jina-embeddings-v2-small-en` permanece congelado y no se incluye en el repositorio; la proyección se aplica post hoc sobre embeddings ya calculados.

El entrenamiento se realizó con la librería GeoPres, cuyo objetivo es preservar las distancias euclídeas por pares entre los embeddings originales y los reducidos. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La innovación técnica es precisamente el enfoque de reducción post hoc con preservación geométrica, descrito en el paper de EACL 2027.

## Capacidades

- Reducción de dimensionalidad de embeddings de 512 a 32 dimensiones mediante una multiplicación de matrices.
- Preservación de distancias euclídeas por pares entre vectores, orientada a mantener la calidad de búsquedas por similitud.
- Dos modos de uso: codificación completa de texto (descarga el backbone y aplica la proyección) o proyección de embeddings ya existentes sin descargar el backbone.
- No realiza generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias; depende del backbone.
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Compresión de índices vectoriales en producción: si ya se dispone de un índice con embeddings de `jina-embeddings-v2-small-en`, se aplica `Projection.project()` para pasar de 512 a 32 dimensiones y reducir el almacenamiento en un factor de 16, manteniendo la estructura de distancias para la recuperación.
- Búsqueda por similitud a gran escala: con vectores de 32 dimensiones, el cálculo de distancias en bases de datos vectoriales es más rápido y cabe en memoria o caché, lo que permite desplegar recuperación sobre colecciones grandes en hardware modesto.
- Pipelines con embeddings precalculados: cuando los embeddings se generan en un servicio TEI o en un job por lotes, la proyección se aplica de forma independiente sin volver a codificar el texto ni descargar el backbone.
- Sistemas con restricciones de memoria en el borde: en dispositivos con poca RAM o en aplicaciones móviles, almacenar vectores de 32 dimensiones en lugar de 512 facilita el despliegue de búsqueda semántica local.
- Deduplicación y clustering de documentos: la preservación de distancias euclídeas permite agrupar textos similares sobre los vectores reducidos con un coste computacional mucho menor que sobre los originales.
- Evaluación de la pérdida de calidad por reducción: el par backbone + proyección permite comparar la calidad de recuperación con 512 y con 32 dimensiones sobre el mismo corpus, útil para decidir el compromiso entre coste y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La proyección en sí requiere únicamente memoria para una matriz de 32 x 512 (16.384 parámetros), por lo que cabe en cualquier CPU y GPU.
- El modo `Projection.project()` no descarga el backbone y solo necesita los embeddings de entrada de 512 dimensiones.
- El modo `GeoPres.embed()` requiere descargar y ejecutar `jinaai/jina-embeddings-v2-small-en`, cuyos requisitos de VRAM no se especifican en la información disponible.
- GPU recomendadas: no disponible para el backbone; la proyección no requiere GPU.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: la librería `geopres`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones de salida | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoPres jina-embeddings-v2-small-en-32 | Proyección lineal post hoc | 32 | jinaai/jina-embeddings-v2-small-en | no disponible | Hugging Face |
| PCA sobre embeddings | Reducción lineal clásica | configurable | cualquiera | según implementación | amplia |
| UMAP sobre embeddings | Reducción no lineal | configurable | cualquiera | según implementación | amplia |

No se dispone de información sobre otros modelos GeoPres comparables ni de métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La entrada debe ser exactamente embeddings de `jinaai/jina-embeddings-v2-small-en`, calculados con el mismo pooling, normalización y prefijos que los datos de entrenamiento; cualquier otra fuente invalida la proyección.
- La reducción de 512 a 32 dimensiones implica una pérdida de información inevitable; la preservación de distancias es aproximada y puede degradar la calidad de recuperación en tareas sensibles.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos conocidos ni el riesgo de alucinación, aunque al no ser un modelo generativo el riesgo de alucinación no aplica directamente.
- El repositorio no incluye el backbone, por lo que el uso completo requiere descargar un modelo adicional.
- No hay descargas ni validación comunitaria registrada, lo que reduce la evidencia sobre su robustez en producción.
- No se detallan los idiomas soportados ni las limitaciones de contexto, que dependen enteramente del backbone.

## Enlaces

- Hugging Face: https://huggingface.co/kkalyfo/geopres-jina-embeddings-v2-small-en-32
- Backbone: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper: https://openreview.net/forum?id=vAWo3CIzqp
