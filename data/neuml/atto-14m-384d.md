# NeuML/atto-14m-384d

## Resumen

Atto es una familia de modelos contextuales compactos desarrollada por NeuML, orientada al aprendizaje de representaciones lingüísticas con un enfoque de eficiencia de parámetros. La variante `atto-14m-384d` cuenta con 15.002.042 parámetros totales y una dimensión de embedding de 384, lo que la sitúa en la gama ultracompacta de modelos de representación. Se distribuye bajo licencia Apache 2.0 y está entrenada principalmente para inglés.

El modelo emplea una arquitectura propia (custom architecture) que requiere `trust_remote_code=True` para cargarse con Hugging Face Transformers. No se trata de un modelo generativo de propósito general, sino de un modelo de representación contextual pensado para tareas de embeddings y codificación de texto, lo que lo hace relevante en escenarios donde el coste computacional y el tamaño del modelo son críticos.

Su interés actual reside en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse en CPU o en hardware muy limitado, manteniendo una calidad de representación razonable. El repositorio ocupa aproximadamente 0,1 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Custom (familia Atto, arquitectura propia; requiere `trust_remote_code=True`) |
| Parametros totales | 15.002.042 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Atto es una familia de modelos contextuales compactos disenados para el aprendizaje de representaciones linguisticas con eficiencia de parametros. La arquitectura es propia del autor (custom architecture), por lo que no se corresponde con un transformer estandar de Hugging Face y exige `trust_remote_code=True` para su carga. La variante `atto-14m-384d` tiene 15.002.042 parametros y una dimension de embedding de 384, coherente con su orientacion a representaciones vectoriales compactas.

Los parametros de entrenamiento documentados en la model card son: learning rate de 0.001, `gradient_accumulation_steps` de 1 y entrenamiento en fp16. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Para resultados de benchmarks, detalles de arquitectura y metodologia de entrenamiento, el autor remite al articulo "Introducing Atto" en el blog de Hugging Face.

## Capacidades

- Aprendizaje de representaciones contextuales de texto (modelo de embeddings, no generativo).
- Generacion de embeddings de dimension 384 para codificacion de frases y documentos.
- Carga mediante Hugging Face Transformers con `AutoModel` y `trust_remote_code=True`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo ni de instrucciones).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Busqueda semantica en aplicaciones ligeras: el modelo puede generar embeddings de 384 dimensiones para indexar y recuperar documentos por similitud vectorial, con un coste computacional minimo gracias a sus 15 millones de parametros.
- Clasificacion de texto por embeddings: extraer representaciones y entrenar un clasificador ligero encima para tareas como analisis de sentimiento o categorizacion de tickets, sin necesidad de GPUs dedicadas.
- Deduplicacion y clustering de documentos: calcular similitud entre textos para agrupar contenido redundante en pipelines de datos, aprovechando el reducido tamano del modelo.
- Filtrado y enrutamiento en pipelines RAG: usar el modelo como codificador rapido en la fase de recuperacion de un sistema RAG, reservando modelos mayores para la generacion.
- Ejecucion en entornos con recursos limitados: despliegue en CPU, dispositivos edge o contenedores con poca memoria, donde modelos de cientos de millones de parametros no son viables.
- Prototipado rapido de sistemas de representacion: validar arquitecturas y pipelines de embeddings con un modelo de 0,1 GB antes de escalar a variantes mayores de la familia Atto.
- Preprocesamiento en notebooks y entornos de investigacion: al ocupar ~0,1 GB, se puede cargar en sesiones de Google Colab o portatiles sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo "Introducing Atto" del blog de Hugging Face para consultar los resultados de benchmarks y la metodologia de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (15 millones de parametros, ~30 MB de pesos en fp16, mas overhead de activaciones y runtime).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para ejecutarse incluso en CPU.
- Cabe en consumer GPU: si, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para esta arquitectura custom.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeuML/atto-14m-384d | 15.002.042 | no disponible | apache-2.0 | safetensors | Arquitectura custom, orientado a representaciones, solo ingles |
| all-MiniLM-L6-v2 (referencia) | ~22,7 M | 256 tokens (tipico) | apache-2.0 | safetensors | Modelo de embeddings ampliamente usado, transformer estandar |
| paraphrase-MiniLM-L3-v2 (referencia) | ~17,4 M | 128 tokens (tipico) | apache-2.0 | safetensors | Variante ultracompacta de sentence-transformers |

Nota: los datos de los modelos de referencia son orientativos y no provienen de la informacion proporcionada sobre Atto; se incluyen como contexto de categoria. No hay datos de rendimiento comparativo disponibles para Atto.

## Limitaciones y advertencias

- Modelo de representacion, no generativo: no debe esperarse capacidad de generacion de texto, razonamiento ni instrucciones.
- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor; conviene auditar el codigo antes de usarlo en produccion.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con textos largos.
- No hay datos publicados de benchmarks en la informacion disponible, por lo que la calidad de las representaciones no esta cuantificada de forma accesible.
- Riesgo de sesgos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos conocidos.
- Riesgo de alucinacion: no aplica directamente al no ser generativo, pero los embeddings pueden producir similitudes espurias en dominios fuera de distribucion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentacion de entrenamiento limita la confianza para produccion sin evaluacion propia.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-14m-384d
- Articulo "Introducing Atto" (blog de Hugging Face): https://hf.co/blog/neuml/introducing-atto
