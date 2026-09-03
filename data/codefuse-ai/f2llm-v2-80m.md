# codefuse-ai/F2LLM-v2-80M

## Resumen

F2LLM-v2-80M es un modelo de embeddings de texto multilingüe desarrollado por el equipo CodeFuse de Alibaba, perteneciente a la familia F2LLM-v2, que abarca ocho tamaños desde 80M hasta 14B de parámetros. Este modelo concreto es la variante instruct más pequeña de la familia, obtenida mediante poda y posterior entrenamiento a partir del modelo base F2LLM-v2-0.6B-Preview. Está diseñado para tareas de extracción de características, como búsqueda semántica, recuperación de información y clasificación de texto, y soporta más de 200 idiomas, con especial atención a lenguas de recursos medios y bajos.

El modelo se entrena sobre un conjunto de datos público curado de 60 millones de ejemplos de alta calidad, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Con solo 80 millones de parámetros y una dimensión de embeddings de 320, ofrece un equilibrio entre rendimiento y eficiencia, siendo adecuado para despliegues en entornos con recursos limitados. La familia F2LLM-v2 se presenta como totalmente abierta, liberando modelos base, modelos instruct, datos de entrenamiento, código y checkpoints intermedios.

La relevancia actual de este modelo radica en su cobertura multilingüe excepcional para su tamaño, su naturaleza completamente abierta y su capacidad para ejecutarse en hardware modesto, lo que lo convierte en una opción práctica para aplicaciones de recuperación semántica en producción, especialmente en contextos multilingües y de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag "qwen3" sugiere posible base Qwen3, pero no se confirma) |
| Parametros totales | 80.084.288 (80M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se recomienda bfloat16 para inferencia) |
| Idiomas soportados | mas de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo. El tag "qwen3" en HuggingFace sugiere que podría basarse en la arquitectura de Qwen3, pero no hay confirmacion oficial. Se sabe que el modelo es un encoder de embeddings, no un modelo generativo, y que produce vectores de 320 dimensiones. El tokenizador anade automaticamente el token de fin de secuencia (EOS).

El entrenamiento se realizo sobre un conjunto de datos compuesto por 60 millones de ejemplos publicos de alta calidad, curado especificamente para tareas de embedding. El modelo de 80M es una version podada del modelo base F2LLM-v2-0.6B-Preview, seguida de un entrenamiento adicional para recuperar el rendimiento tras la poda. No se proporcionan detalles sobre el proceso de poda, la composicion exacta del dataset ni si se utilizaron tecnicas como RLHF o DPO. La familia F2LLM-v2 libera el codigo de entrenamiento y los checkpoints intermedios, lo que permite reproducir el proceso.

## Capacidades

- Generacion de embeddings de texto para tareas de recuperacion semantica, busqueda de informacion y clasificacion de texto.
- Soporte multilingue extenso: mas de 200 idiomas, con enfasis en lenguas de recursos medios y bajos, lo que lo diferencia de muchos modelos centrados en ingles.
- Compatible con las bibliotecas Sentence Transformers y Transformers, con metodos dedicados `encode_query` y `encode_document` que aplican el prompt de consulta adecuado.
- Dimension de embeddings de 320, compacta y suficiente para tareas de similitud y recuperacion.
- No es un modelo generativo: no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en repositorios de documentos multilingues: el modelo puede indexar y recuperar pasajes relevantes en mas de 200 idiomas, lo que resulta util para empresas con contenido internacional. Su tamano reducido permite indexar grandes volumenes con bajo coste computacional.
- Sistemas de atencion al cliente con base de conocimiento: al integrarse en pipelines de recuperacion aumentada (RAG), permite localizar respuestas en FAQs o manuales en varios idiomas, mejorando la precision de los asistentes virtuales.
- Clasificacion de textos por tematica o sentimiento: los embeddings generados pueden alimentar clasificadores ligeros (regresion logistica, SVM) para tareas de moderacion de contenido, analisis de opiniones o categorizacion de tickets.
- Deduplicacion de contenidos: comparando embeddings de documentos se pueden detectar duplicados o casi duplicados en grandes colecciones, util en gestion de contenidos y limpieza de datos.
- Motores de recomendacion basados en similitud: los embeddings de items (productos, articulos, noticias) permiten recomendar elementos similares en plataformas de comercio electronico o medios.
- Despliegue en entornos edge o con recursos limitados: al tener solo 80M de parametros, el modelo puede ejecutarse en CPU o GPUs de baja gama, habilitando busqueda semantica en dispositivos moviles o servidores modestos.

## Benchmarks y rendimiento

La model card afirma que la familia F2LLM-v2 establece un nuevo estado del arte en una amplia gama de benchmarks MTEB, incluyendo codigo, europeo, escandinavo, aleman, frances, espanol, polaco, holandes, japones, vietnamita, tailandes, indico, persa, entre otros. Sin embargo, no se proporcionan cifras concretas de rendimiento para el modelo de 80M en la informacion disponible. Se remite al leaderboard de MTEB para consultar los resultados detallados. No se dispone de datos numericos especificos de este modelo en benchmarks como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: con 80M de parametros en bfloat16, el modelo ocupa aproximadamente 160 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA T4, RTX 3060, A10, o incluso integradas. No requiere GPU de alta gama.
- Compatible con consumer GPU: si, cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente.
- Opciones de despliegue: se puede servir con Sentence Transformers, Transformers, o mediante Text Embeddings Inference (TEI) de Hugging Face, que es compatible con este modelo (se indica en los tags "text-embeddings-inference" y "endpoints_compatible").
- Latencia y throughput: al ser un modelo pequeno, la latencia es muy baja (del orden de milisegundos por lote en GPU) y el throughput es alto, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos de embeddings de tamano similar (como E5-small, BGE-small o GTE-small) en la informacion proporcionada. La model card menciona que la familia F2LLM-v2 establece SOTA en varios benchmarks MTEB, pero sin desglosar por tamano. Se recomienda consultar el leaderboard de MTEB para comparaciones detalladas. No se puede realizar una comparativa numerica fiable con los datos disponibles.

## Limitaciones y advertencias

- Al ser un modelo de solo 80M de parametros, su capacidad para capturar matices semanticos complejos o relaciones contextuales profundas puede ser inferior a la de modelos mas grandes de la misma familia (0.6B, 1.7B, etc.).
- No se dispone de informacion sobre sesgos especificos del modelo. Como cualquier modelo entrenado con datos publicos, puede heredar sesgos presentes en dichos datos, especialmente en idiomas con menos representacion.
- Riesgo de alucinacion: no aplica directamente, ya que no es un modelo generativo; sin embargo, los embeddings pueden producir falsos positivos en tareas de similitud si los textos son superficialmente parecidos pero semanticamente distintos.
- La longitud de contexto no esta documentada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoria del modelo.
- El tamano del repositorio (8.0 GB) es notablemente grande para un modelo de 80M, probablemente debido a la inclusion de checkpoints intermedios o datos adicionales; esto puede afectar al tiempo de descarga inicial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codefuse-ai/F2LLM-v2-80M
- Paper (arXiv): https://arxiv.org/abs/2603.19223
- Dataset de entrenamiento: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Modelo base (podado): https://huggingface.co/codefuse-ai/F2LLM-v2-0.6B-Preview-Pruned-80M
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
