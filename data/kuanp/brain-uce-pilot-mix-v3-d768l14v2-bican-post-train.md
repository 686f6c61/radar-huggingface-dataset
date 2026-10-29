# KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican-post-train

## Resumen

`KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican-post-train` es un modelo de embeddings celulares de tipo UCE (Universal Cell Embedding) especializado en datos de RNA-seq de célula única (scRNA-seq) de cerebro y con vocación multi-especie. Lo publica el usuario KuanP en HuggingFace y no es un modelo de lenguaje: su etiqueta de pipeline es `feature-extraction` y su salida es un vector por célula, no texto. Parte del modelo `KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican` (configuración d768, 14 capas, versión v2, tras un *anneal* solo con datos BICAN en el paso 327.680) y le añade 1.024 pasos de post-entrenamiento.

La arquitectura es un transformer de 14 capas con dimensión oculta 768, entrenado con el objetivo de enmascarado de genes (*masked-gene*), el mismo esquema usado por la familia UCE: se enmascaran genes de la célula y el modelo aprende a predecirlos a partir del contexto génico. Sobre esa base, el post-entrenamiento incorpora tres pérdidas auxiliares calculadas sobre el embedding celular: una cross-entropy contra prototipos ontológicos, una pérdida de vecinos mutuos condicionada por etiqueta y una pérdida contrastiva NT-Xent estilo CONCORD.

Su relevancia es acotada pero clara: los modelos fundacionales de célula única permiten reutilizar un mismo espacio de representación en atlas heterogéneos, y este checkpoint documenta explícitamente cómo se combinan objetivos de mascarado con señales de ontología celular. El recuento real de pesos en safetensors es de 1.479.570.433 parámetros (~1,48 mil millones) y el repositorio ocupa 5,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 14 capas con dimension oculta 768 (estilo UCE, Universal Cell Embedding) |
| Parametros totales | 1.479.570.433 (~1,48 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo opera sobre conjuntos de genes por celula, no sobre secuencias de texto; el autor no documenta limite) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; no se documentan pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible / no aplica (entrada de expresion genica, no lenguaje natural) |
| Licencia | `other` (licencia no estandar; deben consultarse los terminos del autor antes de cualquier uso) |
| Formato de pesos | safetensors |
| Libreria de carga | `uce_brain` |
| Pipeline | `feature-extraction` |
| Modelo base | `KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican` (fine-tune / post-entrenamiento) |
| Dominio | scRNA-seq de cerebro, multi-especie |
| Tamano del repositorio | 5,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema UCE: cada célula se representa como un conjunto de identificadores de genes y sus niveles de expresión, y un transformer procesa ese conjunto para producir un embedding denso de la célula. La configuración publicada es d768 con 14 capas. Con esos valores, el bloque transformer aporta del orden de 100 millones de parámetros, de modo que la mayor parte de los ~1,48 mil millones de parámetros debe residir en las capas de embedding de genes y en las proyecciones de entrada/salida; esta descomposición es una estimación aritmética a partir de d y del número de capas, no un dato publicado por el autor.

El entrenamiento previo corresponde al checkpoint base, que incluye un *anneal* exclusivo con datos BICAN hasta el paso 327.680. El post-entrenamiento añade 1.024 pasos manteniendo el objetivo de enmascarado de genes e incorporando tres pérdidas auxiliares sobre el embedding celular: (1) cross-entropy contra prototipos ontológicos (`os1`, peso 0,25) usando etiquetas `Group` de HMBA; (2) una pérdida de vecinos mutuos más cercanos (`os6`, peso 0,015) condicionada por esas mismas etiquetas; y (3) una pérdida contrastiva NT-Xent estilo CONCORD (`concord`, peso 0,2, temperatura 0,4) con negativos muestreados del mismo `sample_id` y sin ponderación de negativos duros. El autor no publica el volumen total de tokens/células, la composición exacta del dataset ni detalles de la tokenización génica.

## Capacidades

- Extracción de embeddings de células individuales a partir de perfiles de expresión génica (scRNA-seq), con salida vectorial por célula.
- Representación multi-especie: el modelo está etiquetado como `multi-species`, orientado a datos de cerebro.
- Manejo de vocabularios génicos heterogéneos entre datasets, al estilo de los modelos UCE que mapean genes a un espacio común.
- Reconstrucción/predicción de genes enmascarados, capacidad heredada del objetivo de entrenamiento y explotable para *probing* de importancia génica.
- Alineamiento con ontología celular: el post-entrenamiento con prototipos ontológicos y etiquetas `Group` de HMBA busca que células del mismo tipo queden próximas en el espacio de embeddings.
- Uso como extractor congelado para modelos downstream (clasificación, clustering, transferencia de etiquetas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo de representación, no un LLM.

## Casos de uso

- Anotación de tipos celulares en atlas de cerebro: se extraen embeddings de las células de un nuevo dataset y se aplica kNN o un clasificador ligero entrenado sobre etiquetas HMBA/BICAN ya existentes, aprovechando que el post-entrenamiento alineó el espacio con prototipos ontológicos.
- Integración de lotes y armonización multi-dataset: al mapear células de distintos experimentos y especies a un mismo espacio de 768 dimensiones, los embeddings sirven como entrada para UMAP/Harmony o para corregir efecto de lote antes del clustering.
- Transferencia de etiquetas a datasets sin anotar: se calculan los embeddings de la referencia anotada y del nuevo dataset, y se propaga la etiqueta del vecino más cercano; útil cuando no hay presupuesto para reanotar manualmente.
- Búsqueda de células similares (cell retrieval): indexar embeddings en FAISS o similar para recuperar poblaciones parecidas a una célula consulta, por ejemplo para comparar tipos celulares entre especies o entre condiciones experimentales.
- Detección de estados celulares atípicos: distancias en el espacio de embeddings para señalar células que no encajan en los prototipos conocidos, como candidatas a poblaciones raras o estados de enfermedad (requiere validación biológica independiente).
- Extracción de características para modelos predictivos downstream: usar los embeddings como entrada de clasificadores de condición clínica, regresores de expresión o modelos de trayectoria, reduciendo el coste frente a entrenar desde cero sobre matrices de expresión dispersas.
- Selección e interpretación de genes marcadores: enmascarar genes de forma sistemática y medir el desplazamiento del embedding para estimar qué genes sostienen la identidad de una población.
- Punto de partida para fine-tuning con pocas etiquetas: el checkpoint post-entrenado sirve como inicialización de tareas específicas de un laboratorio, con 1.024 pasos de ajuste ya orientados a estructura ontológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de integración (scIB), precisión de anotación, silhouette score ni comparaciones cuantitativas con otros modelos de célula única.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: en fp32 los pesos ocupan unos 5,9 GB (coincide con el tamaño del repositorio); en fp16/bf16 unos 3,0 GB; en int8 unos 1,5 GB; en int4 unos 0,75 GB. A ello hay que sumar activaciones y el lote de células, no cuantificado por el autor.
- El repositorio solo distribuye safetensors, por lo que las cifras de int8/int4 son estimaciones teóricas: no se documenta soporte de cuantización en la librería `uce_brain`.
- Cabe en GPU de consumo: una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) en fp16 deberían acomodar los pesos con holgura; el factor limitante será el tamaño de lote de células y la dimensión de la matriz de expresión.
- Para lotes grandes o barridos de atlas completos se recomienda A100 40/80 GB o H100, que permiten aumentar el batch de células y reducir el número de pasos de inferencia.
- Opciones de despliegue: al usar `library_name: uce_brain`, la carga requiere el código del autor (probablemente `trust_remote_code=True`) y no es compatible de forma nativa con vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos de lenguaje. La vía práctica es PyTorch + safetensors en un script propio, con exportación a ONNX no documentada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de células por segundo ni de tiempo por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| brain-uce-pilot-mix-v3-d768l14v2-bican-post-train (este) | 1,48 mil millones | No disponible | `other` | Publicado en HuggingFace, 0 descargas |
| brain-uce-pilot-mix-v3-d768l14v2-bican (base) | No disponible en la informacion proporcionada | No disponible | No disponible | Publicado; difiere en 1.024 pasos de post-entrenamiento y en las perdidas auxiliares |
| UCE original (Zeng et al.) | No disponible en la informacion proporcionada | No disponible | No disponible | Referencia metodologica citada por el autor; no se aportan datos comparativos |
| scGPT / Geneformer | No disponible en la informacion proporcionada | No disponible | No disponible | Alternativas de la misma categoria (modelos fundacionales de celula unica); sin datos en la informacion disponible para comparar |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparación honesta posible es contra el checkpoint base, y el autor no publica métricas del antes/después.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes: no hay evidencia de validación por terceros ni de uso en producción.
- No es un modelo generativo de texto: no admite prompts en lenguaje natural, tool calling ni razonamiento; cualquier uso debe pasar por un pipeline de extracción de características.
- Licencia `other` no estandarizada: no se especifican términos de uso comercial, atribución ni restricciones de redistribución. Es imprescindible contactar con el autor antes de un uso comercial.
- Sesgos potenciales derivados de los datos de entrenamiento: predominio de datos BICAN (BICAN *anneal*) y etiquetas `Group` de HMBA, lo que puede infrarepresentar especies, regiones cerebrales o tipos celulares poco cubiertos en esas fuentes.
- Riesgo de embeddings poco fiables fuera de distribución: tipos celulares ausentes en el entrenamiento pueden caer en regiones del espacio sin prototipo ontológico asignado.
- No hay métricas publicadas de calibración, integración ni estabilidad entre lotes; el rendimiento en un dataset nuevo es una incógnita hasta que se valide.
- Dependencia de la librería `uce_brain` y del código del autor: sin ella no se puede cargar el checkpoint de forma estándar, lo que añade riesgo de mantenimiento y de reproducibilidad.
- El post-entrenamiento es corto (1.024 pasos) frente al entrenamiento previo: los efectos de las pérdidas auxiliares pueden ser sutiles y no están cuantificados.
- Longitud de contexto y límite de genes por célula no documentados: células con perfiles muy dispersos o vocabularios génicos no vistos pueden degradar la calidad del embedding.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo; no se ha podido contrastar nada fuera de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican-post-train
- Modelo base: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados tecnicos pertinentes).
