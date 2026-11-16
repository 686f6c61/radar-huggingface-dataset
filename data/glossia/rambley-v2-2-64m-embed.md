# glossia/Rambley-V2.2-64M-Embed

## Resumen

Rambley-V2.2-64M-Embed es un modelo de embeddings de frases obtenido por ajuste fino (*fine-tuning*) del modelo base `glossia/Rambley-V2.2-64M`, desarrollado por el usuario glossia. Su proposito es generar representaciones vectoriales densas de 384 dimensiones para tareas de similitud semantica, recuperacion de informacion y extraccion de caracteristicas, integrandose en el ecosistema `sentence-transformers`.

El modelo es de tamano muy reducido: 63.874.704 parametros (aproximadamente 64M), con un repositorio de solo 0,1 GB en formato `safetensors`. Esta orientado a despliegues con requisitos de latencia y memoria muy bajos, como busquedas semanticas en dispositivos con recursos limitados o pipelines de recuperacion a gran escala donde el coste por embedding es critico.

El ajuste se realizo sobre un subconjunto de los datos de entrenamiento de `nomic-ai/nomic-embed-unsupervised-data` y `nomic-ai/nomic-embed-supervised-data`. La model card no documenta resultados de benchmarks (indica "WIP") ni detalles sobre licencia o idiomas soportados, lo que limita su evaluacion previa a produccion sin pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de `glossia/Rambley-V2.2-64M`; detalles no disponibles) |
| Parametros totales | 63.874.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (sin entrenamiento quantization-aware) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 384 |
| Pooling | last-token pooling + normalizacion L2 |
| Matryoshka (MRL) | no (las truncaciones pierden relevancia semantica) |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer heredada del backbone `glossia/Rambley-V2.2-64M`, sobre la que se anade una cabeza de embedding con *last-token pooling* seguido de normalizacion L2, produciendo vectores de 384 dimensiones. No utiliza Matryoshka Representation Learning (MRL), por lo que truncar los embeddings a dimensiones menores degrada la relevancia semantica. Tampoco se aplico entrenamiento consciente de cuantizacion (*quantization-aware training*), de modo que la cuantizacion de los embeddings puede afectar a su calidad.

El ajuste fino se realizo sobre un subconjunto de los datasets de Nomic (`nomic-ai/nomic-embed-unsupervised-data` y `nomic-ai/nomic-embed-supervised-data`), que combinan pares no supervisados y supervisados para tareas de similitud y recuperacion. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del subconjunto, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica.
- Extraccion de caracteristicas (*feature extraction*) para clasificacion, clustering y deduplicacion de textos.
- Recuperacion densa (*dense retrieval*) en sistemas RAG y motores de busqueda semantica.
- Soporte nativo en `sentence-transformers` mediante `SentenceTransformer(...)` con `trust_remote_code=True`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes: es un modelo exclusivamente de embeddings.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de documentacion y recuperar los mas relevantes ante una consulta en lenguaje natural; el tamano de 64M permite indexar millones de fragmentos con un coste de almacenamiento de 384 floats por vector.
- RAG ligero en produccion: generar embeddings de chunks para un pipeline de recuperacion aumentada, con latencia baja y sin necesidad de GPU de gama alta gracias al reducido numero de parametros.
- Deduplicacion y clustering de textos: agrupar articulos, tickets o resenas similares calculando similitud coseno sobre los embeddings normalizados L2.
- Clasificacion de texto por similitud: usar prototipos de clase embebidos y asignar etiquetas al texto mas cercano, util en moderacion o triaje de correos.
- Busqueda en dispositivos con recursos limitados: al ocupar 0,1 GB en safetensors, puede ejecutarse en CPU o en GPUs de consumo para busquedas locales en aplicaciones de escritorio o moviles.
- Filtrado previo en pipelines de recomendacion: calcular similitud entre el perfil del usuario y el catalogo de contenidos para un primer cribado antes de un reranker mas costoso.
- Evaluacion de similitud de pares de frases: deteccion de parafrasis o comparacion de respuestas en sistemas de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "WIP" en la seccion de benchmarks y remite a los registros del dataset `glossia/Rambley-V2.2-64M-Embed-mteb-results`, sin cifras publicadas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en FP32 (63,9M parametros x 4 bytes ≈ 0,26 GB), aproximadamente 0,13 GB en FP16 y alrededor de 0,07 GB en INT8, sin contar overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100. Tambien es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en inferencia por CPU.
- Opciones de despliegue: `sentence-transformers` (via PyTorch), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y exportacion a ONNX o `optimum` para inferencia optimizada; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| glossia/Rambley-V2.2-64M-Embed | 63,9M | 384 | no disponible | no disponible | Sin MRL ni QAT; benchmarks WIP |
| nomic-ai/nomic-embed-text-v1.5 | 137M | 768 (MRL hasta 64) | 8192 | Apache 2.0 | Soporta MRL y contexto largo; usado como fuente de datos del ajuste |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7M | 384 | 256 | Apache 2.0 | Referencia ligera ampliamente usada en similitud semantica |
| BAAI/bge-small-en-v1.5 | 33M | 384 | 512 | MIT | Alternativa pequena con buen rendimiento en MTEB en ingles |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de resultados MTEB del modelo evaluado para comparar rendimiento numerico.

## Limitaciones y advertencias

- No se han publicado benchmarks; el rendimiento real en tareas de recuperacion o similitud es desconocido y debe validarse con un conjunto propio antes de produccion.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; es un riesgo relevante para adopcion empresarial.
- No se declaran idiomas soportados; el ajuste sobre datos de Nomic (predominantemente en ingles) sugiere un rendimiento inferior en castellano y otros idiomas, aunque no esta confirmado.
- Sin Matryoshka Representation Learning: no se pueden truncar los embeddings a 128 o 256 dimensiones sin perder relevancia semantica, lo que limita el ahorro de almacenamiento.
- Sin entrenamiento quantization-aware: cuantizar los embeddings (por ejemplo, a int8) puede degradar la similitud semantica.
- La model card tiene inconsistencias: el titulo menciona "V2.1 350M" y el ejemplo de uso referencia `glossia/Rambley-V2.1-64M-Embed`, mientras que el identificador real es `Rambley-V2.2-64M-Embed`; conviene verificar el identificador correcto al desplegar.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos en similitud si el dominio de uso difiere del de entrenamiento.
- Modelo con muy pocas descargas (40) y sin likes: ecosistema de validacion practicamente inexistente; tratar como experimental.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; auditar antes de usar en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2.2-64M-Embed
- Modelo base: https://huggingface.co/glossia/Rambley-V2.2-64M
- Dataset de resultados MTEB: https://huggingface.co/datasets/glossia/Rambley-V2.2-64M-Embed-mteb-results
- Dataset de entrenamiento no supervisado: https://huggingface.co/datasets/nomic-ai/nomic-embed-unsupervised-data
- Dataset de entrenamiento supervisado: https://huggingface.co/datasets/nomic-ai/nomic-embed-supervised-data
- Discord del autor: https://discord.gg/6acXmq3yx2
