# NeuML/atto-25m-384d

## Resumen

Atto es una familia de modelos contextuales compactos desarrollada por NeuML, orientada al aprendizaje de representaciones linguisticas con un coste computacional muy bajo. La variante `atto-25m-384d` forma parte de esa familia y, por su nombre, corresponde a un modelo de aproximadamente 25 millones de parametros con una dimension de embedding de 384, un tamano habitual para tareas de representacion de frases y recuperacion de informacion. El modelo se publica bajo licencia Apache 2.0 y esta pensado para usarse con Hugging Face Transformers, aunque requiere `trust_remote_code=True` por emplear una arquitectura personalizada.

La relevancia de este modelo radica en su enfoque de eficiencia: modelos de decenas de millones de parametros que puedan ejecutarse en CPU o en GPUs de gama baja, con un consumo de memoria minimo, son utiles para pipelines de embeddings a gran escala, busqueda semantica o clasificacion ligera. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su caracter compacto y facilita su despliegue en entornos con recursos limitados.

No obstante, la informacion publica disponible es escasa: la model card remite a un articulo de blog para detalles de arquitectura, metodologia de entrenamiento y resultados de benchmarks, y no incluye especificaciones tecnicas completas en el propio repositorio. Los datos que se presentan a continuacion reflejan unicamente lo disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contextual personalizada (custom_code, requiere `trust_remote_code=True`) |
| Parametros totales | Aproximadamente 25 millones (segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Atto emplea una arquitectura transformer contextual personalizada, implementada como codigo remoto (`custom_code`) y cargable mediante `AutoModel` de Hugging Face Transformers con `trust_remote_code=True`. La model card no detalla el numero de capas, el numero de cabezas de atencion ni la composicion exacta del bloque transformer; solo se indica que el modelo tiene una dimension de embedding de 384 y aproximadamente 25 millones de parametros, coherente con un modelo encoder compacto para representaciones.

Los parametros de entrenamiento publicados en la model card son limitados: learning rate de 0,001, `gradient_accumulation_steps` de 1 y entrenamiento en fp16. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Para obtener detalles sobre la metodologia y la arquitectura se remite al articulo "Introducing Atto" del blog de NeuML, enlazado desde la model card.

## Capacidades

- Generacion de representaciones contextuales de texto en ingles, orientadas a tareas de embedding y similitud semantica.
- Uso como modelo base para extraccion de caracteristicas y clasificacion de texto.
- Compatible con el ecosistema Hugging Face Transformers mediante `AutoModel`.
- Capacidad de ejecucion en entornos con recursos limitados por su tamano reducido (aproximadamente 25 millones de parametros).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda semantica y recuperacion de informacion: el modelo puede generar embeddings de documentos y consultas en ingles para alimentar un indice vectorial; su tamano de 25 millones de parametros permite indexar grandes volumenes con coste minimo de computo.
- Clasificacion de texto ligera: al ser un encoder compacto, puede usarse como extractor de caracteristicas para un clasificador downstream en tareas como deteccion de spam o categorizacion de tickets.
- Deduplicacion y agrupamiento de documentos: la representacion de 384 dimensiones facilita el calculo de similitudes coseno para agrupar documentos casi identicos en pipelines de limpieza de datos.
- Despliegue en entornos con CPU: por su tamano, puede ejecutarse en servidores sin GPU o en dispositivos de borde, lo que lo hace adecuado para servicios de embeddings de bajo coste.
- Prototipado rapido de sistemas RAG: sirve como modelo de embeddings inicial en pruebas de concepto antes de escalar a modelos mayores, gracias a su licencia Apache 2.0 y su facil integracion con Transformers.
- Filtrado previo en pipelines de datos: puede emplearse para puntuar y priorizar documentos en etapas tempranas de un pipeline, reduciendo el volumen que llega a modelos mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo "Introducing Atto" del blog de NeuML para consultar los resultados de benchmarks, pero dichos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para un modelo de aproximadamente 25 millones de parametros (estimacion basada en el tamano; no confirmada por el autor).
- GPU recomendadas: no disponible. Por su tamano, cualquier GPU consumer moderna deberia poder ejecutarlo con holgura.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM; tambien es viable en CPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idiomas: el modelo esta entrenado y etiquetado unicamente para ingles, por lo que su uso en castellano u otros idiomas no esta respaldado por la informacion disponible.
- Arquitectura personalizada: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; conviene revisar dicho codigo antes de usarlo en produccion.
- Informacion tecnica incompleta: no se publican en el repositorio la longitud de contexto, los detalles de arquitectura ni los datos de entrenamiento, lo que dificulta evaluar su idoneidad para casos concretos.
- Riesgo de alucinacion: no disponible; el modelo parece orientado a representaciones y no a generacion de texto libre, pero la model card no lo especifica.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, siempre que se conserven los avisos de licencia correspondientes.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere un modelo muy reciente o poco adoptado; conviene validar su comportamiento antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-25m-384d
- Articulo "Introducing Atto" (blog de NeuML): https://hf.co/blog/neuml/introducing-atto
