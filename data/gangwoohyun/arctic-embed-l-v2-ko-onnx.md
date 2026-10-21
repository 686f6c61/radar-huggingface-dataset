# gangwoohyun/arctic-embed-l-v2-ko-onnx

## Resumen

`gangwoohyun/arctic-embed-l-v2-ko-onnx` es la exportación a ONNX con cuantización int8 dinámica del modelo de embeddings `dragonkue/snowflake-arctic-embed-l-v2.0-ko`, una adaptación al coreano de Snowflake Arctic Embed L v2.0. Lo publica el usuario gangwoohyun y está empaquetado específicamente para Transformers.js: el único fichero de pesos relevante es `onnx/model_quantized.onnx` con dtype `q8`, de forma que el modelo se puede ejecutar en el navegador o en Node.js sin GPU dedicada.

No es un modelo generativo, sino un encoder de frases que produce vectores densos para búsqueda semántica, RAG, clustering o clasificación por similitud. Su utilidad está en llevar recuperación de información en coreano a entornos cliente (extensiones, aplicaciones Electron, webs estáticas) donde no se quiere depender de una API externa ni de infraestructura de inferencia.

La relevancia es, por tanto, práctica y acotada: cubre un nicho (embeddings coreanos cuantizados y empaquetados para el runtime web de Hugging Face) con muy poca adopción pública por el momento (13 descargas, 0 likes, sin evaluación independiente publicada), lo que obliga a validar su calidad antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo XLM-RoBERTa (según los tags del repositorio); modelo de embeddings densos, no generativo |
| Parametros totales | ~568 M (heredados de `snowflake-arctic-embed-l-v2.0`; coherente con el tamaño del repositorio de 0,6 GB en int8, no confirmado en la ficha del autor) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base; no verificada en este repositorio) |
| Tipos de cuantizacion | int8 dinámica (ONNX); el repositorio solo publica la variante cuantizada `model_quantized.onnx` |
| Idiomas soportados | Coreano (objetivo del ajuste); el modelo base es multilingüe. Listado completo de idiomas: no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, dtype `q8`), dispuesto para Transformers.js |
| Dimension del embedding | 1024 (heredada del modelo base; no verificada en este repositorio) |
| Pooling | CLS pooling + normalización L2, aplicados por el código llamador (no por el grafo ONNX) |
| Prefijo de consulta | `query: ` en las consultas; los documentos se codifican sin prefijo |

## Arquitectura y entrenamiento

El repositorio es un artefacto de despliegue, no un entrenamiento nuevo: exporta a ONNX el modelo `dragonkue/snowflake-arctic-embed-l-v2.0-ko` y le aplica cuantización dinámica int8 sobre los pesos. La topología subyacente es la del modelo base de Snowflake, un encoder transformer bidireccional de tipo XLM-RoBERTa (así aparece etiquetado en los tags), con alrededor de 568 millones de parámetros, salida de 1024 dimensiones y capacidad para secuencias largas. La innovación técnica de esta ficha no está en la arquitectura, sino en el empaquetado: grafo ONNX autocontenido, pesos en int8 y compatibilidad directa con el pipeline `feature-extraction` de Transformers.js.

No hay información en la documentación disponible sobre el dataset de ajuste al coreano, el número de tokens de entrenamiento, el uso de negativos duros, ni sobre si hubo una etapa de destilación o de ajuste con datos sintéticos. Tampoco se documenta el proceso de cuantización (calibración, operadores afectados, métrica de degradación). La ficha del autor se limita a indicar el prefijo `query: `, el pooling CLS y la normalización L2 a cargo del llamador; cualquier afirmación sobre receta de entrenamiento del modelo base o del ajuste coreano queda fuera de la información verificable aquí.

## Capacidades

- Generación de embeddings densos de frases y párrafos para similitud semántica y recuperación de información.
- Codificación de consultas con el prefijo `query: ` y de documentos sin prefijo, siguiendo el esquema asimétrico del modelo base.
- Pooling CLS más normalización L2, que deben aplicarse explícitamente en el código de integración; el vector normalizado permite usar producto escalar como distancia coseno.
- Cobertura principal del coreano, con capacidad multilingüe residual heredada del modelo base (sin medición publicada en este repositorio).
- Ejecución en navegador y en Node.js a través de Transformers.js, con backend WASM o WebGPU según el entorno.
- Pipeline `feature-extraction` estándar; no incluye cabezas de clasificación, reranking, generación, tool calling ni razonamiento multi-paso.
- No soporta function calling, agentes, visión, audio ni modo de razonamiento: es un encoder de embeddings, no un modelo de chat.

## Casos de uso

- RAG en coreano ejecutado en el cliente: una extensión de navegador o una aplicación Electron indexa documentos locales (PDF, notas, correo) y recupera fragmentos relevantes con el modelo en local, sin enviar texto a un servicio externo. El tamaño int8 (0,6 GB) y el runtime ONNX lo hacen viable en equipos sin GPU.
- Búsqueda semántica sobre documentación técnica coreana: indexación por lotes de manuales o bases de conocimiento y consulta por similitud, aprovechando la ventana de contexto larga del modelo base para indexar secciones completas en lugar de frases sueltas.
- Deduplicación y agrupamiento de corpus: cálculo de embeddings de miles de noticias o tickets y clustering (k-means, HDBSCAN) para detectar duplicados o temas recurrentes en coreano.
- Clasificación sin entrenamiento adicional: uso de kNN sobre los embeddings para etiquetar tickets de soporte o correos por categoría, con pocas decenas de ejemplos etiquetados por clase.
- Caché semántico de respuestas de un LLM: comparar la consulta entrante con consultas previas mediante similitud coseno y reutilizar la respuesta si supera un umbral, reduciendo coste de API en productos coreanos.
- Filtro de contenido y moderación por similitud: comparar mensajes contra un conjunto de referencia de textos problemáticos, como señal auxiliar dentro de un pipeline de moderación.
- Recomendación de contenido: generación de vectores de artículos o productos y recuperación de los más próximos al perfil del usuario en una tienda o portal de noticias en coreano.
- Prototipado rápido en el navegador: demos y validaciones de concepto con Transformers.js sin instalar CUDA ni montar un servidor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la ficha del autor ni los metadatos del repositorio incluyen métricas de recuperación (por ejemplo, Recall@k o nDCG en coreano), resultados de MMLU, HumanEval o GSM8K (no aplicables a un modelo de embeddings) ni mediciones de la degradación introducida por la cuantización int8 dinámica.

## Requisitos de hardware

- Peso en disco: 0,6 GB (tamaño del repositorio, un único `model_quantized.onnx` en int8). El peso en memoria durante la inferencia es del mismo orden, más overhead de activaciones y del runtime.
- VRAM/RAM estimada para inferencia: en torno a 1-1,5 GB con secuencias cortas (256-512 tokens) y batches pequeños; con secuencias cercanas a los 8192 tokens el consumo de activaciones crece de forma notable. Cifra estimada a partir del tamaño de los pesos, no medida.
- GPU recomendadas: no requiere GPU de datacenter. Cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, RTX 4090) ejecuta el modelo con holgura; también funciona en iGPU y en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las tarjetas de los últimos años, y en CPU con backend WASM (más lento, suficiente para indexación por lotes pequeños y consultas interactivas).
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`, dtype `q8`) en navegador o Node.js; ONNX Runtime (Web, Node o Python) cargando el grafo directamente. vLLM y TGI no soportan grafos ONNX de embeddings, por lo que para servir a gran escala conviene usar el modelo PyTorch original con Text Embeddings Inference o el stack de ONNX Runtime Server.
- Latencia y throughput: no disponibles. No hay mediciones publicadas; cualquier cifra dependería del backend (WASM frente a WebGPU frente a CPU nativa), de la longitud de secuencia y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `gangwoohyun/arctic-embed-l-v2-ko-onnx` (este) | ~568 M | 8192 (heredado) | 1024 | Apache-2.0 | ONNX int8 | Ajuste coreano, empaquetado para Transformers.js, sin evaluación publicada |
| `dragonkue/snowflake-arctic-embed-l-v2.0-ko` (origen) | ~568 M | 8192 (heredado) | 1024 | Apache-2.0 | safetensors | Mismo modelo en precisión original; recomendable como referencia de calidad |
| `BAAI/bge-m3` | ~568 M | 8192 | 1024 | MIT | safetensors, ONNX | Multilingüe, dense + sparse + multi-vector; comunidad y evaluación amplias |
| `intfloat/multilingual-e5-large` | ~560 M | 512 | 1024 | MIT | safetensors, ONNX | Multilingüe con buen rendimiento en coreano; contexto corto y requiere prefijos `query:`/`passage:` |
| `nlpai-lab/KoE5` | ~560 M | 512 | 1024 | MIT (verificar) | safetensors | Específico de coreano, derivado de multilingual-e5-large; contexto corto |

La ventaja diferencial de este repositorio frente a los anteriores no es la calidad, sino la combinación de cuantización int8, formato ONNX y encaje directo en Transformers.js para ejecución en cliente.

## Limitaciones y advertencias

- Adopción prácticamente nula (13 descargas, 0 likes) y ausencia total de evaluación pública: no hay evidencia de que la cuantización int8 ni el ajuste coreano conserven la calidad del modelo original.
- Ficha del autor mínima: no documenta datos de entrenamiento, proceso de cuantización, métricas ni limitaciones conocidas.
- El pooling CLS y la normalización L2 los aplica el llamador. Si se omiten, las similitudes coseno resultantes son incorrectas; es un punto de fallo frecuente en integraciones.
- El prefijo `query: ` debe añadirse solo a las consultas. Aplicarlo también a los documentos, u omitirlo en las consultas, degrada la recuperación respecto al comportamiento previsto.
- La cuantización dinámica int8 puede afectar de forma desigual a distintas capas; el impacto real en Recall@k no está medido en este repositorio.
- Cobertura lingüística: el ajuste está orientado al coreano. El rendimiento en castellano, aunque herede el multilingüismo del modelo base, no está documentado y probablemente sea inferior.
- Riesgo de truncamiento: las entradas que superen la longitud máxima del encoder se recortan silenciosamente, lo que puede perder información en documentos largos.
- Sesgos: al estar ajustado sobre corpus coreano, puede reproducir sesgos presentes en esos datos; no se ha publicado ningún análisis al respecto.
- Alucinación: no aplica en sentido estricto al no generar texto, pero sí existe riesgo de falsos positivos en similitud (fragmentos recuperados como relevantes sin serlo), especialmente con umbrales bajos.
- Licencia Apache-2.0, que permite uso comercial y modificación; conviene verificar igualmente la licencia del modelo base y de los datos de ajuste antes de un despliegue en producción.
- No es adecuado para generación, clasificación con etiquetas fijas sin ejemplos, ni tareas que requieran razonamiento: es exclusivamente un extractor de características.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/gangwoohyun/arctic-embed-l-v2-ko-onnx
- Modelo base en PyTorch (ajuste coreano): https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko
- Modelo original de Snowflake: https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
- Organización Snowflake en HuggingFace: https://huggingface.co/Snowflake
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
