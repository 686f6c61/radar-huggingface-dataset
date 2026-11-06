# BOBUS2317/e5-large-pp1875-onnx

## Resumen

e5-large-pp1875-onnx es un modelo de embeddings de frases derivado de intfloat/multilingual-e5-large, afinado por el usuario BOBUS2317 para una tarea muy concreta: mapear denominaciones de productos de la contratacion publica rusa al codigo OKPD2 del clasificador asociado al Decreto del Gobierno de la Federacion Rusa n.o 1875. El modelo parte de la arquitectura XLM-RoBERTa de e5-large (560 millones de parametros, contexto de 512 tokens) y se distribuye exclusivamente en formato ONNX con cuantizacion dinamica int8, lo que permite ejecutarlo en CPU x86 con instrucciones AVX2 sin necesidad de GPU.

El ajuste se realiza con aprendizaje contrastivo (InfoNCE) sobre pares "denominacion de producto" a "codigo OKPD2", incorporando datos KTRU, sinonimos, denominaciones oficiales de codigos y ejemplos sinteticos generados con LLM, con negativos dificiles construidos a partir de codigos cercanos pero incorrectos. El resultado es un encoder de similitud semantica orientado a recuperacion y clasificacion de codigos en el dominio de compras publicas, no un modelo generativo.

Su relevancia es acotada pero clara: cubre un nicho especifico del ecosistema de contratacion publica rusa con una licencia permisiva (MIT), un artefacto ONNX listo para produccion en CPU y una convencion de prefijos compatible con la familia e5. El repositorio es pequeno (0,6 GB) y el modelo registra un uso muy bajo en Hugging Face (20 descargas, 0 likes) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (base de intfloat/multilingual-e5-large) |
| Parametros totales | 560 millones (heredados del modelo base; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de e5-large; no explicitada en la model card) |
| Tipos de cuantizacion | int8 dinamica (pesos y activaciones uint8, cuantizacion por canales, variante AVX2) |
| Idiomas soportados | ru (entrenamiento especifico); el modelo base es multilingue |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quint8_avx2.onnx`) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder XLM-RoBERTa de multilingual-e5-large, con pooling de media (mean pooling) y normalizacion L2 de los embeddings resultantes. La convencion de prefijos es la habitual de la familia e5: `query: ` para la denominacion del producto y `passage: ` para el texto asociado al codigo OKPD2. La distribucion se hace unicamente como grafo ONNX cuantizado dinamicamente a int8 (uint8 por canal en pesos y activaciones), optimizado para AVX2, lo que elimina la dependencia de GPU y reduce el peso del repositorio a 0,6 GB.

El entrenamiento es contrastivo con perdida InfoNCE sobre pares "denominacion de producto" a "codigo OKPD2". La composicion del dataset incluye datos KTRU (catalogo de bienes, obras y servicios usado en contratacion publica rusa), sinonimos, denominaciones oficiales de los codigos y ejemplos sinteticos generados con LLM. Los negativos dificiles se construyen con codigos similares pero incorrectos, lo que fuerza al modelo a discriminar entre categorias proximas del clasificador. La model card no especifica el numero de tokens de entrenamiento, la mezcla exacta ni si hubo etapas adicionales de destilacion o fine-tuning supervisado.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion densa (pipeline `sentence-similarity`).
- Mapeo de denominaciones de productos de contratacion publica rusa a codigos OKPD2 (clasificador del PP RF n.o 1875).
- Recuperacion y ranking de codigos candidatos mediante similitud coseno sobre embeddings normalizados L2.
- Manejo de sinonimos, denominaciones comerciales y variantes de redaccion gracias a los datos de aumento del entrenamiento.
- Inferencia en CPU x86 con AVX2 mediante ONNX Runtime, sin GPU.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con `sentence-transformers` usando backend ONNX.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.
- Capacidad multilingue limitada en la practica: el ajuste se ha hecho sobre datos en ruso y el tag de idioma declarado es solo `ru`, aunque el modelo base conserva el multilingueismo.

## Casos de uso

- Clasificacion automatica de partidas de licitacion: dado el texto de una denominacion de producto en un pliego, el modelo genera su embedding y se compara contra los embeddings precalculados de todos los codigos OKPD2 para devolver los candidatos mas probables. Es adecuado porque el ajuste contrastivo esta hecho exactamente sobre ese par de tareas.
- Asistente de compras publicas ("AI Procurement Copilot"): integrado en un flujo donde el usuario escribe una descripcion libre y el sistema sugiere el codigo OKPD2 correcto, reduciendo el error de clasificacion manual.
- Normalizacion de catalogos de proveedores: mapear descripciones heterogeneas de productos de un ERP o marketplace a la taxonomia OKPD2 para consolidar inventario y reporting.
- Busqueda semantica sobre bases de datos de contratos: indexar passage embeddings de codigos y descripciones historicas y recuperar contratos similares a una consulta en lenguaje natural.
- Deduplicacion y agrupacion de items: agrupar denominaciones equivalentes o casi equivalentes de un catalogo usando similitud coseno sobre embeddings normalizados.
- Despliegue en entornos sin GPU: al estar cuantizado a int8 y en ONNX con AVX2, puede ejecutarse en servidores CPU modestos o en el propio portatil del analista, lo que encaja en administraciones publicas con infraestructura limitada.
- Filtrado previo en pipelines de validacion: descartar codigos OKPD2 claramente incorrectos antes de una revision humana, reduciendo el volumen de casos a revisar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; el modelo esta pensado para CPU. En GPU, una version fp32 del modelo base requeriria aproximadamente 2,2 GB de VRAM, pero el artefacto distribuido es int8 y esta orientado a CPU.
- GPU recomendadas: no aplica para el artefacto ONNX int8; cualquier GPU moderna podria ejecutar ONNX Runtime, pero no es el escenario de diseno.
- CPU: cualquier procesador x86 moderno con AVX2. El nombre del fichero (`model_quint8_avx2.onnx`) indica que la cuantizacion esta calibrada para ese conjunto de instrucciones.
- Cabe en consumer hardware sin GPU: si, en cualquier portatil o servidor x86 con AVX2 y RAM suficiente (el repositorio ocupa 0,6 GB).
- Opciones de despliegue: ONNX Runtime (via `sentence-transformers` con `backend="onnx"`), Text Embeddings Inference (tag `endpoints_compatible`), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| BOBUS2317/e5-large-pp1875-onnx | 560 M (base) | 512 tokens (base) | ONNX int8 | MIT | Embeddings especializados en OKPD2 (ru) |
| intfloat/multilingual-e5-large | 560 M | 512 tokens | safetensors, ONNX | MIT | Embeddings multilingues genericos |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | safetensors, ONNX | MIT | Embeddings multilingues genericos, menor coste |
| BAAI/bge-m3 | 568 M | 8192 tokens | safetensors | MIT | Embeddings multilingues de largo contexto |

La comparativa se limita a alternativas de la misma familia de embeddings de frases; no se dispone de datos de rendimiento comparado para este modelo concreto. Frente a multilingual-e5-large, la diferencia principal es el ajuste especifico al dominio OKPD2 y la distribucion exclusiva en ONNX int8, a costa de perder generalidad fuera del ruso y del dominio de contratacion publica.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se ha hecho sobre denominaciones de productos de contratacion publica rusa; su rendimiento fuera de ese dominio o en otros idiomas no esta documentado y probablemente sea inferior al del modelo base.
- Idioma: el tag declarado es solo `ru`; aunque el modelo base es multilingue, el fine-tuning puede haber degradado la calidad en otros idiomas.
- Contexto limitado a 512 tokens (heredado de e5-large), insuficiente para documentos largos sin troceado previo.
- Riesgo de falsos positivos en codigos OKPD2 proximos: los negativos dificiles mejoran la discriminacion, pero la taxonomia tiene categorias muy solapadas y no se han publicado metricas de precision.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; cualquier caso de uso que requiera generacion necesita otro modelo.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base (intfloat/multilingual-e5-large, tambien MIT) y de los datos de entrenamiento derivados de fuentes publicas rusas.
- Repositorio con muy baja adopcion (20 descargas, 0 likes) y sin benchmarks publicados: no hay evidencia externa de calidad en produccion.
- La model card esta redactada en ruso y no detalla el volumen de datos de entrenamiento ni la composicion exacta del dataset, lo que dificulta la reproducibilidad.
- Al ser un artefacto ONNX int8, la cuantizacion introduce una perdida de precision respecto al modelo en fp32 que no se ha cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BOBUS2317/e5-large-pp1875-onnx
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Paper de la familia E5 (Text Embeddings by Weakly-Supervised Contrastive Pre-training): https://arxiv.org/abs/2212.03533
- Documentacion de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- ONNX Runtime: https://onnxruntime.ai/
