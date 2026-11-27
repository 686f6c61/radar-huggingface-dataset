# alesimoes/katana-embeddinggemma

## Resumen

katana-embeddinggemma es una conversión a formato GGUF del modelo de embeddings google/embeddinggemma-2 de Google DeepMind, publicada por el desarrollador alesimoes. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los del modelo original, re-codificados a GGUF y cuantizados a Q8_0. Su propósito es servir como motor de embeddings dentro de katana, un motor de inferencia escrito desde cero en C por el mismo autor, que lo utiliza únicamente para calcular representaciones vectoriales (por ejemplo, como filtro opcional de búsqueda).

El modelo cuenta con 271.002.648 parámetros (aproximadamente 271 millones) y una licencia Apache 2.0 heredada del modelo upstream. El repositorio ocupa 0,3 GB. La relevancia de esta ficha es acotada: se trata de un artefacto de distribución para un motor concreto, no de un modelo de propósito general, y su utilidad fuera de katana es limitada porque el archivo sigue la nomenclatura de tensores propia de katana.

Es importante subrayar que no es un modelo de chat ni de generación de texto. Su función es la extracción de características (feature-extraction), es decir, transformar texto en vectores densos utilizables para búsqueda semántica, clustering o recuperación. La información disponible sobre esta conversión es escasa y proviene casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings; arquitectura del upstream google/embeddinggemma-2 no detallada en la informacion proporcionada) |
| Parametros totales | 271.002.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo embeddinggemma-2-q8_0.gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo upstream google/embeddinggemma-2 en la informacion proporcionada. Por la naturaleza de la tarea (feature-extraction) y el tamano (271 millones de parametros), se trata de un modelo encoder orientado a producir embeddings de texto, pero no se detalla si emplea un transformer estandar, variantes de atencion lineal u otras innovaciones.

Respecto al entrenamiento, esta publicacion no implica ningun entrenamiento: la model card indica explicitamente que es una conversion de formato unicamente, sin reentrenamiento ni ajuste fino. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original uso RLHF, DPO u otras tecnicas. La unica transformacion aplicada es la re-codificacion de los pesos a GGUF y su cuantizacion a Q8_0.

## Capacidades

- Generacion de embeddings de texto para tareas de representacion vectorial y similitud semantica.
- Extraccion de caracteristicas (feature-extraction) como pipeline principal declarado.
- Uso como filtro de busqueda opcional dentro del motor katana.
- No es un modelo de chat: no genera texto conversacional.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Busqueda semantica dentro de katana: el motor utiliza el modelo para calcular embeddings de documentos y consultas, permitiendo recuperacion por similitud vectorial como filtro opcional sobre los resultados.
- Indice vectorial local en C: al estar empaquetado en GGUF y consumirse desde un motor nativo en C, encaja en despliegues minimalistas donde no se quiere arrastrar un stack de Python.
- Deduplicacion de textos: calcular embeddings de un corpus y agrupar por distancia coseno para detectar documentos casi identicos.
- Clustering de documentacion tecnica: agrupar fragmentos por tematica a partir de sus representaciones vectoriales para organizar bases de conocimiento.
- Filtrado previo en pipelines de recuperacion aumentada: usar los embeddings como primera etapa de cribado antes de un reranker mas costoso.
- Experimentacion con motores de inferencia alternativos: util para quien quiera evaluar katana como runtime de embeddings frente a soluciones basadas en llama.cpp u Ollama, aceptando la limitacion de nomenclatura de tensores propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 271 millones de parametros en Q8_0 (aproximadamente 1 byte por parametro), el peso del modelo ronda los 271 MB; en la practica cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100 (estas ultimas sobredimensionadas para este modelo).
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con memoria suficiente para el archivo y los buffers de inferencia.
- Opciones de despliegue: el autor indica que el archivo sigue la nomenclatura de tensores propia de katana y que no debe esperarse que cargue en otras herramientas; el uso previsto es mediante `katana pull embeddinggemma-2`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo upstream en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas. Como referencia estructural:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| katana-embeddinggemma | 271 M | no disponible | GGUF (Q8_0) | Apache 2.0 | Conversion para katana; nomenclatura de tensores propia |
| google/embeddinggemma-2 | no disponible | no disponible | no disponible | Apache 2.0 | Modelo upstream; datos no detallados aqui |
| Alternativas de embeddings | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion: usarlo para conversacion o generacion de texto producira resultados incorrectos.
- El archivo sigue la nomenclatura de tensores de katana; el propio autor advierte de que no debe esperarse que cargue en otras herramientas como llama.cpp u Ollama.
- Solo se distribuye en cuantizacion Q8_0; no hay variantes de menor precision en el repositorio.
- No se documentan sesgos conocidos, pero al ser una conversion de un modelo de Google, hereda los sesgos del upstream, no evaluados en esta ficha.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes erroneas en dominios alejados de los datos de entrenamiento del modelo original.
- Restricciones de licencia: Apache 2.0 segun la model card, aunque esta enlaza a la pagina de licencia de Gemma de Google; conviene revisar dicha pagina antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (27 de noviembre de 2026); se trata de una publicacion muy reciente y sin validacion comunitaria.
- No hay informacion sobre idiomas soportados, lo que impide garantizar un buen rendimiento en castellano sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alesimoes/katana-embeddinggemma
- Modelo upstream: https://huggingface.co/google/embeddinggemma-2
- Repositorio de katana: https://github.com/alesimoes/katana
- Documentacion de distribucion de katana: https://github.com/alesimoes/katana (ver docs/distribution.md)
- Pagina de licencia enlazada por el upstream: https://ai.google.dev/gemma/docs/gemma_4_license
