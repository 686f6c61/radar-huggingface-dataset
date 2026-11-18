# alphaedge-ai/multilingual-e5-large-instruct-kur-32768

## Resumen

`multilingual-e5-large-instruct-kur-32768` es un modelo de embeddings de frases (sentence-similarity) publicado por alphaedge-ai. Se trata de una version recortada (*trimmed*) del modelo `intfloat/multilingual-e5-large-instruct` de Microsoft, especializada en kurdo mediante reduccion del vocabulario del tokenizador de 250.037 a 32.768 tokens. El resultado es un modelo un 39,73 % mas pequeno en parametros (337,4 M frente a 559,9 M) y con una huella de memoria notablemente inferior, manteniendo la arquitectura y los pesos del modelo original salvo por las filas de embedding eliminadas.

El modelo resuelve el problema del coste de despliegue de embeddings multilingues en un unico idioma: si solo se necesita kurdo, mantener un vocabulario de 250.000 tokens es innecesario. El recorte se realiza mediante la tecnica de *trimming* descrita en el blog de Hugging Face, que identifica los tokens realmente utilizados en un corpus del idioma objetivo (200.000 textos de `lbourdois/fineweb-2-trimming`) y descarta el resto.

Es relevante ahora porque reduce el coste de servir embeddings para kurdo en produccion (memoria, latencia de carga, almacenamiento del indice vectorial) sin reentrenar el modelo. Su licencia MIT facilita el uso comercial. La contrapartida es que el modelo deja de ser multilingue: solo conserva capacidades para kurdo, y su rendimiento en otros idiomas se degrada de forma sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), fine-tuneado para embeddings de frases |
| Parametros totales | 337.442.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF/ONNX) |
| Idiomas soportados | kurdo (ku) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del encoder XLM-RoBERTa de `intfloat/multilingual-e5-large-instruct`, un transformer bidireccional entrenado originalmente con objetivos de modelado enmascarado y posteriormente ajustado para producir embeddings de frases utiles en similitud semantica y recuperacion. No se ha reentrenado: el proceso aplicado es un recorte del vocabulario y de la matriz de embeddings asociada.

El recorte se basa en minar 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar que tokens del vocabulario original aparecen en kurdo. Los tokens no utilizados se eliminan, reduciendo el vocabulario un 86,89 % (de 250.037 a 32.768 tokens). Las filas correspondientes de la matriz de embeddings se descartan, lo que explica la reduccion de parametros del 39,73 %. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni sobre el numero de tokens de entrenamiento del modelo base.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion en kurdo.
- Soporte de codificacion asimetrica mediante `encode_query` y `encode_document`, heredado de la familia E5.
- Busqueda semantica y ranking de documentos por similitud coseno.
- Funciona con la libreria `sentence-transformers` y es compatible con `text-embeddings-inference` y endpoints de Hugging Face (tag `endpoints_compatible`).
- Capacidad multilingue limitada: solo kurdo; el resto de idiomas del modelo original pierden vocabulario y rendimiento.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es un modelo puramente de embeddings.

## Casos de uso

- Busqueda semantica en kurdo: indexar un corpus de documentos kurdo con `encode_document` y recuperar los mas relevantes ante una consulta con `encode_query`, aprovechando el menor tamano del modelo para reducir el coste del indice.
- RAG (generacion aumentada por recuperacion) sobre fuentes en kurdo: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo, con menor huella de memoria que el modelo original.
- Deduplicacion y clustering de documentos kurdo: calcular embeddings de un corpus y agrupar por similitud para eliminar duplicados o clasificar tematicamente.
- Moderacion y filtrado de contenido: comparar mensajes de usuarios contra una lista de patrones o textos de referencia mediante similitud semantica.
- Sistemas de recomendacion de contenido en kurdo: representar articulos o productos como vectores y recomendar por cercania semantica.
- Despliegue en hardware limitado: al tener 337 M de parametros y un repo de 0,7 GB, cabe en GPUs de consumo y en entornos con restricciones de memoria donde el modelo original de 559 M resultaria mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,35 GB solo de pesos (337 M x 4 bytes), mas overhead de activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB de pesos.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con holgura; tambien en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (tag del repo) y endpoints de Hugging Face. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-kur-32768 | 337,4 M | no disponible | kurdo | MIT | Version recortada, un 39,73 % mas pequena |
| intfloat/multilingual-e5-large-instruct | 559,9 M | no disponible | multilingue | MIT | Modelo base original, vocabulario de 250.037 tokens |
| intfloat/multilingual-e5-large | 559,9 M | no disponible | multilingue | MIT | Variante no instruct de la misma familia |
| intfloat/multilingual-e5-base | no disponible | no disponible | multilingue | MIT | Version menor de la familia E5 |

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no usados en kurdo; el rendimiento en otros idiomas se degrada y no debe usarse como modelo multilingue.
- Al ser un derivado recortado, puede presentar diferencias de calidad frente al modelo original incluso en kurdo, especialmente en dominios con vocabulario poco representado en el corpus de minado.
- Riesgo de alucinacion no aplica en sentido generativo, pero la similitud semantica puede producir falsos positivos en recuperacion si el corpus es ruidoso.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; hereda los del modelo base.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de minado.
- El modelo tiene muy poca traccion (48 descargas, 0 likes) y no se han publicado benchmarks; validar su calidad en el dominio concreto antes de usarlo en produccion.
- La longitud de contexto no esta documentada; no asumir ventanas largas sin verificar con el tokenizador.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-kur-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Multilingual E5: https://arxiv.org/abs/2402.05672
