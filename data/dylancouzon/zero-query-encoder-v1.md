# DylanCouzon/zero-query-encoder-v1

## Resumen

zero-query-encoder-v1 es un codificador de consultas desarrollado por Dylan Couzon, AI Growth Engineer en Arize AI, que forma parte de un dual encoder asimétrico. Su función es codificar consultas en dispositivos edge sin necesidad de un transformer: en lugar de una red neuronal, emplea una tabla de búsqueda de 30.522 filas por 1024 dimensiones en formato int8 y una regla de pooling ponderado. La codificación de una consulta se reduce a un gather y una suma ponderada, sin matmuls ni GPU, con una latencia inferior al milisegundo por consulta en un solo núcleo de CPU. El asset completo de consulta ocupa 31,8 MB.

El modelo fue destilado de NovaSearch/stella_en_400M_v5, un codificador de 400M parámetros que genera embeddings de 1024 dimensiones. Los documentos se indexan una vez en la nube con este profesor congelado, mientras que las consultas se codifican localmente con la tabla. La similitud coseno entre ambos espacios de vectores sirve como puntuación de relevancia. Destaca por su relevancia en escenarios de recuperación semántica en el edge, aunque el autor lo publica como una research preview que no alcanzó su propio listón de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tabla de búsqueda (lookup table) con pooling ponderado; sin transformer. Parte de un dual encoder asimétrico junto a NovaSearch/stella_en_400M_v5 |
| Parámetros totales | 30.522 × 1024 = 31.254.528 valores int8 (31,25 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizador del modelo base) |
| Tipos de cuantización | int8 con escala fp32 por fila; variante fp16 disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | numpy (.npz), ONNX (.onnx), tokenizer.json |
| Dimensiones de embedding | 1024 |
| Tamaño del asset de consulta | 31,8 MB |
| Modelo base | NovaSearch/stella_en_400M_v5 (revisión ffeb2b7ee715c226d4ffe5e4619f7dbb48624c20) |

## Arquitectura y entrenamiento

El componente central es una tabla de 30.522 × 1024 valores int8, acompañada de una regla de pooling que pondera las filas según la atención del tokenizador. No hay capas transformer, ni multiplicación de matrices, ni operaciones de atención. La tabla se carga como un initializer int8 con una escala fp32 por fila, de modo que los pesos onnx ocupan ~31 MB en lugar de los 125 MB que ocuparían en fp32. El modelo se entrenó por destilación a partir de NovaSearch/stella_en_400M_v5, de modo que sus salidas caen en el espacio de documentos de dicho profesor. El proceso de entrenamiento no está documentado en la información disponible; se desconocen los datos, el número de tokens y si se aplicó RLHF o DPO (no aplica a un codificador de embeddings).

## Capacidades

- Codificación de consultas para recuperación semántica asimétrica: produce vectores de 1024 dimensiones L2-normalizados.
- Similaridad de frases: la salida puede compararse por coseno o producto punto con vectores de documentos.
- Inferencia en CPU sin GPU: sub-milisegundo por consulta en un núcleo.
- Integración con bases vectoriales (Qdrant) mediante vectores densos estándar.
- Fusión con BM25 mediante convex score fusion (w=0,8), no RRF.
- Soporte ONNX con operadores estándar (opset 17) para servir sin dependencias de numpy/tokenizers en Python.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Solo idioma inglés.

## Casos de uso

- Búsqueda semántica en dispositivos móviles: codificar consultas localmente con 31,8 MB y enviar el vector a un servidor que contiene los documentos indexados con stella. Apto para apps con requisitos de privacidad o latencia.
- Recuperación asimétrica para RAG en edge: el dispositivo genera la consulta con zero, el backend ejecuta la búsqueda vectorial y devuelve pasajes; el coste de codificación por consulta es casi nulo.
- Reducción de coste en sistemas de búsqueda de alto tráfico: sustituir un transformer de consultas por una tabla de búsqueda reduce drásticamente la carga de CPU y el coste por consulta.
- Integración con Qdrant para búsqueda vectorial: usar DOT como métrica (equivalente a coseno al estar normalizado) y exact search para reproducir los resultados publicados. La tabla de vocabulario puede almacenarse como una colección retrieve-by-id con HNSW m=0.
- Fusión híbrida con BM25 en OpenSearch: aplicar convex score fusion con peso w=0,8 para combinar la puntuación densa con la léxica; no usar RRF porque produce resultados más débiles (0,5504 vs 0,5727 en los conjuntos de desarrollo del autor).
- Servir consultas con ONNX Runtime en producción: desplegar model.onnx en un servicio CPU con tokenizers, sin necesidad de frameworks de deep learning, para obtener una latencia sub-milisegundo.
- Sistemas de recomendación por similaridad de textos: codificar consultas de usuario y compararlas con catálogos de documentos preindexados.
- Búsqueda en dispositivos IoT: al no requerir GPU ni grandes pesos, puede ejecutarse en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona métricas de retrieval, pero sin especificar el dataset de evaluación. Los únicos valores numéricos reportados son:

| Métrica | Valor |
|---|---|
| Dense-only con búsqueda exacta en Qdrant | 0,4339 |
| Convex score fusion (w=0,8) | 0,5727 |
| RRF (fusion por rango) | 0,5504 |
| Sistema con OpenSearch (fusión convexa) | 0,4911 |

Nota: dataset de evaluación no especificado. El autor advierte que el modelo no alcanzó su listón de calidad.

## Requisitos de hardware

- VRAM: no requiere VRAM; la inferencia de consultas se ejecuta en CPU con un solo núcleo.
- GPU recomendada: ninguna para el codificador de consultas. Para indexar documentos con el profesor stella se necesita una GPU (no especificada).
- ¿Cabe en consumer GPU? No aplica, ya que no usa GPU. El asset de 31,8 MB cabe en cualquier dispositivo, incluidos móviles.
- Opciones de despliegue: numpy + tokenizers, ONNX Runtime, Qdrant, OpenSearch. No es compatible con vLLM, TGI ni llama.cpp por no ser un modelo de lenguaje generativo.
- Latencia: sub-milisegundo por consulta en un solo núcleo de CPU (según el autor). Throughput no especificado.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos de la misma categoría. El único modelo comparable mencionado es el profesor del que se destiló:

| Modelo | Parámetros | Dimensiones | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zero-query-encoder-v1 | 31,25 M (tabla int8) | 1024 | no disponible | MIT | HuggingFace |
| NovaSearch/stella_en_400M_v5 | 400 M (por nombre del modelo) | 1024 | no disponible | no especificada | HuggingFace |

Para otras alternativas (p. ej., MiniLM o BGE), no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- El autor lo describe como research preview y advierte que no alcanzó su propio listón de calidad; no es un drop-in retriever recomendado.
- Solo soporta inglés.
- Solo codifica consultas; los documentos deben codificarse con la revisión exacta de stella (ffeb2b7ee715c226d4ffe5e4619f7dbb48624c20), de lo contrario la tabla pierde validez.
- No genera texto ni razona; es exclusivamente un extractor de características.
- La cuantización int8 del índice de documentos no ha sido evaluada en calidad; debe tratarse como no probada.
- La fusión con BM25 requiere convex score fusion con w=0,8; el uso de RRF (incluido el Fusion.RRF nativo de Qdrant) produce resultados más débiles.
- Los números de retrieval se obtuvieron con búsqueda exacta; la recall de ANN es un factor de confusión no evaluado.
- Riesgo de recuperar documentos irrelevantes si el espacio de embeddings no coincide con el del profesor.
- No se conocen sesgos específicos, pero al ser un modelo destilado en inglés puede heredar sesgos del corpus de stella.

## Enlaces

- HuggingFace: https://huggingface.co/DylanCouzon/zero-query-encoder-v1
- Modelo base: https://huggingface.co/NovaSearch/stella_en_400M_v5
- GitHub del autor: https://github.com/Dylancouzon
- No se proporcionan papers, blogs ni demos en la información disponible.
