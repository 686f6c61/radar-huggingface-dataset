# julian-schelb/multilingual-e5-base-emb-lat-intertext-v2

## Resumen

El modelo `julian-schelb/multilingual-e5-base-emb-lat-intertext-v2` es un ajuste fino de `intfloat/multilingual-e5-base` orientado a generar embeddings de textos latinos para detectar relaciones intertextuales entre autores clásicos. Desarrollado por Julian Schelb como parte del benchmark **Loci Similes** (Schelb et al., 2026), el modelo está entrenado con pérdida contrastiva online sobre una de las cinco particiones de validación cruzada del corpus de intertextualidad latina. Su propósito principal es servir como componente de recuperación en pipelines de detección de alusiones y paralelismos literarios, donde se combina con un clasificador posterior para filtrar los candidatos recuperados.

La relevancia de este modelo radica en que aborda una tarea especializada de humanidades digitales: la identificación automática de intertextos en latín clásico, un dominio con pocos recursos y alta exigencia filológica. Al partir de un modelo multilingüe (E5-base) y ajustarlo con datos etiquetados por expertos, consigue representaciones densas de 768 dimensiones que capturan similitudes semánticas entre pasajes de autores como Virgilio, Ovidio o Jerónimo. La versión v2 sustituye a la v1 como reemplazo directo, manteniendo la misma interfaz y requisitos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa base) con capa de pooling para embeddings, basado en `intfloat/multilingual-e5-base` |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredado del modelo base, no confirmado en la documentacion) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se mencionan cuantizaciones adicionales) |
| Idiomas soportados | latin (la) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-base`, un transformer de 12 capas con 768 dimensiones de ocultamiento, inicializado desde XLM-RoBERTa y preentrenado con 5,97 mil millones de pares de texto débilmente supervisados en 100 idiomas. Sobre esta base, el autor realiza un ajuste fino con pérdida contrastiva online (online contrastive loss) utilizando el corpus de intertextualidad latina del benchmark Loci Similes, que incluye etiquetas, corpus y consultas específicas. El entrenamiento se realiza sobre una de las cinco particiones de validación cruzada, lo que permite evaluar la generalización del modelo en cada split.

Una innovación clave es el uso obligatorio de prefijos de prompt durante la codificación: `prompt_name="query"` para textos de consulta (por ejemplo, pasajes de Jerónimo) y `prompt_name="match"` para textos candidatos (autores clásicos). Esta separación, heredada de la metodología E5, mejora notablemente la calidad de la recuperación si se respeta, y degrada si se omite. El modelo está diseñado para integrarse en el paquete Python LociSimiles, que facilita la construcción de pipelines de recuperación y clasificación.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para textos latinos, optimizados para similitud coseno.
- Deteccion de relaciones intertextuales entre autores clasicos (Virgilio, Ovidio, Horacio, etc.) y textos posteriores (por ejemplo, Jeronimo).
- Soporte de recuperacion por similitud semantica: dado un pasaje de consulta, devuelve los pasajes candidatos mas relevantes de un corpus.
- Uso con prefijos de prompt especificos (`query` y `match`) que mejoran la precision de la recuperacion.
- Compatible con la libreria `sentence-transformers` y con el ecosistema de `text-embeddings-inference` (segun los tags del repositorio).
- Integracion en pipelines de clasificacion posterior: la recuperacion se complementa con modelos clasificadores de la misma coleccion (por ejemplo, `*-3class-lat-intertext-v1`).

## Casos de uso

- **Investigacion filologica asistida por ordenador**: el modelo permite a los estudiosos de la literatura clasica localizar alusiones y paralelismos entre autores, acelerando el analisis manual de intertextos. Se usa codificando el corpus de autores con `prompt_name="match"` y las consultas con `prompt_name="query"`, para luego rankear por similitud coseno.
- **Deteccion de fuentes en textos patristicos**: dado un pasaje de un autor cristiano como Jeronimo, el modelo recupera los pasajes clasicos subyacentes, lo que ayuda a trazar la influencia de la literatura pagana en la tradicion cristiana.
- **Construccion de bases de datos de loci similes**: el modelo puede alimentar repositorios digitales de pasajes paralelos, como el proyecto Loci Similes, generando candidatos que luego son verificados por expertos.
- **Analisis de estilos literarios**: al agrupar pasajes por similitud semantica, se pueden identificar patrones de reutilizacion de formulas y motivos entre autores de diferentes epocas.
- **Ensenanza de latin y literatura**: los docentes pueden usar el modelo para ilustrar conexiones intertextuales en el aula, mostrando ejemplos concretos de como un autor dialoga con otro.
- **Sistemas de recomendacion de lecturas**: en plataformas de textos clasicos, el modelo puede sugerir pasajes relacionados dentro de una obra o entre obras, mejorando la experiencia de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (precision, recall, MRR, etc.) sobre el conjunto de evaluacion Loci Similes. Se recomienda consultar el articulo de arXiv (2601.07533) para obtener los resultados completos del benchmark.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 278 millones de parametros. En FP32 (4 bytes) ocupa aproximadamente 1,1 GB, lo que coincide con el tamano del repositorio. En FP16 (2 bytes) ocuparia unos 560 MB, y en INT8 unos 280 MB. Cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna con 4 GB o mas de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso inferencia en CPU para lotes pequenos.
- **Opciones de despliegue**: compatible con `sentence-transformers` (Python), `text-embeddings-inference` (segun los tags), y puede exportarse a ONNX o TensorRT para inferencia optimizada. Tambien es posible usar `ollama` o `llama.cpp` si se convierte a GGUF, aunque no se proporcionan dichos formatos en el repositorio.
- **Latencia y throughput**: no se han publicado mediciones especificas. Dado el tamano del modelo, la latencia en GPU es del orden de milisegundos por lote de decenas de textos, y en CPU puede ser de decenas de milisegundos por texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `julian-schelb/multilingual-e5-base-emb-lat-intertext-v2` (este) | 278 M | no disponible | Embeddings de intertextualidad latina | Apache-2.0 | HuggingFace |
| `julian-schelb/multilingual-e5-base-emb-lat-intertext-v1` | 278 M (estimado, mismo base) | no disponible | Embeddings de intertextualidad latina (version anterior) | Apache-2.0 | HuggingFace |
| `intfloat/multilingual-e5-base` (modelo base) | 278 M | 512 (segun documentacion oficial de E5) | Embeddings multilingues genericos | MIT | HuggingFace |
| `julian-schelb/multilingual-e5-small-emb-lat-intertext-v1` | 118 M (estimado, base small) | no disponible | Embeddings de intertextualidad latina (variante small) | Apache-2.0 | HuggingFace |

La comparativa se basa en el tamano de parametros y la tarea. El modelo v2 es un reemplazo directo de v1, con la misma interfaz y mejoras en el entrenamiento (nueva revision del dataset y del paper). Frente al modelo base, esta especializado en latin y requiere prefijos de prompt especificos para obtener buenos resultados.

## Limitaciones y advertencias

- **Especializacion en latin clasico**: el modelo esta entrenado exclusivamente con textos latinos y no es adecuado para otros idiomas o tareas de embedding generales.
- **Dependencia de prefijos**: si no se utilizan los prefijos `query` y `match` correctamente, la calidad de la recuperacion disminuye notablemente. Es un requisito imprescindible para un uso correcto.
- **Cobertura limitada del corpus**: el entrenamiento se basa en el benchmark Loci Similes, que puede no cubrir todos los autores o generos literarios latinos. La generalizacion a textos no representados en el corpus puede ser limitada.
- **Riesgo de falsos positivos**: la similitud coseno puede producir candidatos irrelevantes desde el punto de vista filologico; por eso se recomienda complementar con un clasificador posterior.
- **Sin capacidad de generacion**: al ser un modelo de embeddings, no genera texto ni responde preguntas; solo produce representaciones vectoriales.
- **Licencia Apache-2.0**: permite uso comercial y modificacion, pero el modelo se ofrece sin garantias y no incluye responsabilidad por resultados incorrectos en investigacion academica.
- **Fecha de creacion futura**: el modelo fue creado en agosto de 2026, lo que puede indicar que es parte de un trabajo en curso; se recomienda verificar la version y los datos de entrenamiento antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julian-schelb/multilingual-e5-base-emb-lat-intertext-v2
- Articulo arXiv (Loci Similes): https://arxiv.org/abs/2601.07533
- Documentacion del paquete LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Repositorio de modelos del autor: https://huggingface.co/julian-schelb/models
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Variante small de la misma serie: https://huggingface.co/julian-schelb/multilingual-e5-small-emb-lat-intertext-v1
