# AdarshSingh7647/Eklav-0.6B-Reranker

## Resumen

Eklav-0.6B-Reranker es un modelo de reranking de pasajes desarrollado por AdarshSingh7647, construido sobre la base de Qwen/Qwen3-0.6B. El modelo introduce una metodologia de entrenamiento denominada Eklav, que consiste en que el estudiante observe una traza de razonamiento parcial del profesor, con la parte final de la respuesta eliminada, y aprenda a continuar el razonamiento y producir la respuesta por si mismo. Este enfoque difiere de la destilacion clasica de cadena de pensamiento (CoT) completa, ya que el razonamiento del modelo se condiciona a la traza parcial del profesor durante el entrenamiento, en lugar de reproducirla palabra por palabra.

El modelo esta disenado especificamente para la tarea de reranking de pasajes en pipelines de recuperacion de informacion, evaluado en los benchmarks BRIGHT y NevIR. Segun los datos publicados, consigue una mejora del 11% en BRIGHT (nDCG@10, media de 12 dominios) en comparacion con la destilacion CoT estandar con el mismo modelo base y datos de entrenamiento, ademas de reducir los FLOPs de entrenamiento en un 29%. Con 596 millones de parametros, es un modelo compacto orientado a despliegues eficientes en tareas de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B base) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (merged bf16 checkpoint) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen/Qwen3-0.6B, un transformer causal de 0.6B parametros. La innovacion principal reside en el metodo de entrenamiento Eklav, una variante de destilacion de cadena de pensamiento condicionada por pistas (hint conditioned SFT). En lugar de entrenar al estudiante para imitar la traza de razonamiento completa del profesor, el modelo recibe una traza parcial (con la parte final que revela la respuesta eliminada) y debe continuar el razonamiento y generar la respuesta por su cuenta. Esto reduce los requisitos computacionales del entrenamiento en un 29% respecto a la destilacion CoT estandar, manteniendo o mejorando el rendimiento en tareas de reranking.

El entrenamiento se realizo con el mismo modelo base y los mismos datos que una destilacion CoT de traza completa, cambiando unicamente el objetivo de entrenamiento. El checkpoint publicado es un modelo fusionado (merged) en formato bf16, listo para usar con la libreria transformers.

## Capacidades

- Reranking de pasajes: el modelo esta especificamente entrenado para reordenar documentos o pasajes en funcion de su relevancia respecto a una consulta.
- Razonamiento condicionado: capacidad de continuar un razonamiento parcial del profesor y generar la respuesta final, lo que mejora la calidad del reranking en dominios variados.
- Evaluacion en BRIGHT: rinde en 12 dominios diferentes con una media de nDCG@10 de 14.4.
- Evaluacion en NevIR: el modelo tambien ha sido evaluado en este benchmark de reranking, aunque no se proporcionan cifras desglosadas en la informacion disponible.
- Generacion de texto: al estar basado en Qwen3-0.6B, conserva capacidades de generacion de texto del modelo base, aunque su uso principal es el reranking.
- Integracion con transformers: compatible con la API estandar de HuggingFace para carga y uso.

## Casos de uso

- Mejora de pipelines RAG: el modelo puede integrarse como etapa de reranking tras un recuperador inicial (BM25, embeddings) para refinar los resultados y mejorar la precision de las respuestas generadas por un LLM.
- Busqueda empresarial: reordenar resultados de busqueda interna en empresas con grandes volumenes de documentos, mejorando la relevancia de los primeros resultados mostrados al usuario.
- Recuperacion de informacion legal: filtrar y reordenar sentencias, articulos o jurisprudencia relevante a partir de una consulta juridica, aprovechando su evaluacion en dominios variados.
- Busqueda academica: reordenar articulos cientificos o papers relevantes a una consulta de investigacion, reduciendo el ruido de la recuperacion inicial.
- Sistemas de preguntas y respuestas: mejorar la seleccion de pasajes candidatos que se pasan al generador de respuestas, reduciendo alucinaciones al alimentar el LLM con contextos mas relevantes.
- Moderacion de contenido: reordenar contenido potencialmente relevante para revision humana o automatica, priorizando los elementos mas probables de ser problematicos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| BRIGHT (media 12 dominios) | nDCG@10 | 14.4 |
| BRIGHT (mejora vs. CoT SFT estandar) | nDCG@10 | +11% |
| Entrenamiento (FLOPs vs. CoT SFT estandar) | reduccion | -29% |

No se han publicado resultados desglosados por dominio en la informacion disponible, aunque la model card menciona una figura con los resultados por dominio (eklav_0.6b_bright_domains.jpg). Tampoco se proporcionan resultados de NevIR en formato numerico.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 1.2 GB (tamano del repositorio), por lo que cabe en cualquier GPU consumer con al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1080 Ti, RTX 2060 o superior) puede ejecutar el modelo sin problemas. Tambien funciona en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: si, es un modelo compacto de 0.6B parametros, apto para GPU de gama media e incluso baja.
- Opciones de despliegue: compatible con transformers (carga directa con AutoModelForCausalLM), y puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no se proporcionan datos de latencia en la informacion disponible, pero al ser un modelo de 0.6B, la inferencia es rapida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BRIGHT (nDCG@10) | Licencia |
|---|---|---|---|---|
| Eklav-0.6B-Reranker | 0.6B | no disponible | 14.4 | no disponible |
| Qwen/Qwen3-Reranker-0.6B | 0.6B | no disponible | no disponible | no disponible |
| jina-reranker-v3.5 | 0.6B | no disponible | no disponible | no disponible |

La comparativa se limita a modelos de tamano similar (0.6B) orientados a reranking. No se dispone de datos de rendimiento comparativos publicados para Qwen3-Reranker-0.6B ni jina-reranker-v3.5 en la informacion disponible. El modelo Eklav destaca por su metodo de entrenamiento eficiente, pero faltan datos para una comparacion cuantitativa completa.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de usarlo en produccion.
- Idiomas no especificados: no se indica que idiomas soporta el modelo. Al estar basado en Qwen3-0.6B, probablemente herede las capacidades multilingues del modelo base, pero no esta confirmado.
- Rendimiento limitado en reranking: con un nDCG@10 de 14.4 en BRIGHT, el rendimiento absoluto es modesto. Modelos mas grandes suelen superar estas cifras, aunque el objetivo de este modelo es la eficiencia.
- Sin datos de NevIR: la model card menciona NevIR como benchmark de evaluacion, pero no proporciona resultados numericos, lo que impide evaluar su rendimiento en ese conjunto.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto inconsistente si se usa fuera de su tarea principal de reranking.
- Sin garantias de soporte: al ser un proyecto de un unico autor con solo 9 descargas, no hay garantia de mantenimiento, actualizaciones o soporte para la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdarshSingh7647/Eklav-0.6B-Reranker
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3-Reranker-0.6B (modelo similar): https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Articulo sobre jina-reranker-v3.5 (modelo similar): https://www.linkedin.com/posts/elastic-co_a-06b-reranker-that-outscores-models-7x-activity-7487601505924104192-0GnV
- Guia sobre modelos de reranking: https://machinelearningmastery.com/top-5-reranking-models-to-improve-rag-results/
