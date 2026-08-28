# orca-zhang/bge-small-en-v1.5-int8

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo de embeddings `BAAI/bge-small-en-v1.5`, preparada específicamente para su uso con ONNX Runtime. La ha publicado el usuario orca-zhang, y según la model card está pensada para el motor de búsqueda de fotografías de ZimaOS Photos. Se trata de un modelo encoder-only basado en BERT, con una dimensión de embedding de 384 y una longitud máxima de secuencia de 512 tokens, que genera representaciones vectoriales de frases o pasajes para tareas de búsqueda semántica y recuperación densa.

La cuantización dinámica QInt8 reduce el tamaño del modelo y acelera la inferencia en CPU, manteniendo un comportamiento muy cercano al original. Es relevante para desarrolladores que necesitan desplegar embeddings en entornos con recursos limitados o sin GPU, ya que el formato ONNX es portable y optimizable con ONNX Runtime. La licencia MIT permite uso comercial sin restricciones.

Al ser una versión cuantizada del modelo original de BAAI, hereda sus capacidades y limitaciones. La documentación incluye instrucciones precisas de preprocesado: anteponer el prefijo "Represent this sentence for searching relevant passages:" a las consultas de recuperación, aplicar mean pooling sobre la máscara de atención y normalizar por L2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder-only (BGE-small-en-v1.5) |
| Parametros totales | No disponible (el modelo original tiene ~33M, pero no se especifica en esta version) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | INT8 dinamico (ONNX Runtime QInt8) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no aplica, es un bundle ONNX) |

## Arquitectura y entrenamiento

El modelo base es `BAAI/bge-small-en-v1.5`, un encoder transformer de tipo BERT con 12 capas y una dimension de embedding de 384. Fue entrenado por BAAI (Beijing Academy of Artificial Intelligence) mediante aprendizaje contrastivo con una temperatura de 0.01, lo que produce distribuciones de similitud concentradas en el intervalo [0.6, 1]. La version v1.5 corrige problemas de distribucion de similitud presentes en la v1.

Este repositorio no contiene el entrenamiento original, sino una cuantizacion post-entrenamiento aplicada con ONNX Runtime. La cuantizacion es dinamica (QInt8), lo que significa que los pesos se convierten a enteros de 8 bits en tiempo de carga, mientras que las activaciones se cuantizan durante la inferencia. El proceso de cuantizacion esta documentado mediante hashes SHA256 y un archivo PROVENANCE.json que registra la trazabilidad del artefacto.

## Capacidades

- Generacion de embeddings de frases y parrafos en ingles, con dimension 384.
- Busqueda semantica y recuperacion densa: dado un texto, produce un vector que puede compararse por similitud coseno con otros vectores.
- Adecuado para sistemas de busqueda por similitud en grandes colecciones de texto.
- Soporte de preprocesado especifico: requiere prefijo para consultas de retrieval, mean pooling y normalizacion L2.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling ni agentes, al ser un encoder puro.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Busqueda semantica en documentos: indexar parrafos de una base de conocimiento y recuperar los mas relevantes ante una consulta, usando similitud coseno sobre los embeddings.
- Motor de busqueda de fotografias por descripcion: como en ZimaOS Photos, donde las imagenes se asocian a textos descriptivos y se buscan por lenguaje natural.
- Deduplicacion de textos: comparar embeddings de articulos o mensajes para detectar contenido duplicado o casi duplicado.
- Clasificacion de texto por similitud: agrupar comentarios o tickets de soporte por tema usando clustering sobre embeddings.
- Sistemas de recomendacion basados en contenido: representar items textuales (productos, noticias) y recomendar similares.
- Filtrado y moderacion: comparar nuevos textos contra una lista de ejemplos prohibidos o no deseados mediante umbrales de similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `bge-small-en-v1.5` obtuvo buenos resultados en MTEB en su categoria, pero esta version cuantizada no presenta metricas propias. Se recomienda evaluar la degradacion de calidad respecto al modelo original en el caso de uso concreto.

## Requisitos de hardware

- Al ser un modelo pequeno (aprox. 33M parametros en el original) y cuantizado a INT8, su huella de memoria es reducida, del orden de decenas de MB.
- Puede ejecutarse en CPU sin problemas, siendo el objetivo principal de la cuantizacion.
- Tambien es compatible con GPU via ONNX Runtime, aunque no es necesario.
- No se dispone de datos exactos de VRAM ni latencia. Se estima que cabe en cualquier hardware moderno, incluyendo Raspberry Pi o entornos embebidos.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), o integracion en aplicaciones que usen el runtime. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| orca-zhang/bge-small-en-v1.5-int8 (este) | No disponible (~33M) | 384 | 512 | ONNX INT8 | MIT |
| BAAI/bge-small-en-v1.5 (original) | 33M | 384 | 512 | safetensors, etc. | MIT |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 384 | 256 | safetensors | Apache-2.0 |

El modelo original y esta version cuantizada comparten arquitectura y dimensiones. La diferencia principal es el formato y la cuantizacion. all-MiniLM-L6-v2 es una alternativa comun con contexto menor (256 tokens) y dimension de embedding similar, pero con licencia Apache-2.0.

## Limitaciones y advertencias

- La cuantizacion INT8 puede producir una ligera perdida de precision en los embeddings, que podria afectar a tareas de alta sensibilidad a la similitud.
- El modelo solo soporta ingles. No funciona con otros idiomas.
- La longitud maxima de secuencia es de 512 tokens; textos mas largos deben truncarse o dividirse.
- La distribucion de similitud esta concentrada en [0.6, 1]; un umbral de 0.5 no indica similitud real, segun la documentacion original.
- Es obligatorio aplicar el preprocesado exacto (prefijo para queries, mean pooling, normalizacion L2) para obtener resultados correctos. No hacerlo degrada gravemente el rendimiento.
- No se proporcionan garantias de rendimiento en produccion; el autor recomienda validar el comportamiento en el caso de uso especifico.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopcion limitada o reciente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orca-zhang/bge-small-en-v1.5-int8
- Modelo original BAAI/bge-small-en: https://huggingface.co/BAAI/bge-small-en
- Modelo original BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion oficial BGE v1 y v1.5: https://bge-model.com/bge/bge_v1_v1.5.html
- Pagina de descarga en SourceForge: https://sourceforge.net/projects/bge-small-en-v1-5/
- Repositorio GitHub con informacion adicional: https://github.com/abis330/bge-small-en-v1.5/
