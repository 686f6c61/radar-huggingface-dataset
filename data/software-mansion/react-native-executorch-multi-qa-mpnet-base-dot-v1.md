# software-mansion/react-native-executorch-multi-qa-mpnet-base-dot-v1

## Resumen

Este repositorio aloja una exportación del modelo de embeddings `multi-qa-mpnet-base-dot-v1` de sentence-transformers, convertido al formato `.pte` de ExecuTorch para su ejecución en dispositivos móviles dentro de aplicaciones React Native. El modelo original, desarrollado por la comunidad de sentence-transformers, está diseñado para tareas de búsqueda semántica y respuesta a preguntas mediante la generación de vectores densos de texto. La versión aquí publicada es obra de software-mansion, el equipo detrás de la biblioteca `react-native-executorch`, que permite ejecutar modelos de IA localmente en apps móviles con React Native.

La relevancia de esta publicación radica en que facilita la integración de capacidades de embeddings semánticos en aplicaciones móviles sin depender de servidores externos, garantizando privacidad y funcionamiento offline. El archivo `.pte` está optimizado para el backend XNNPACK de ExecuTorch, lo que permite una inferencia eficiente en CPUs de dispositivos móviles. No se proporcionan detalles sobre la arquitectura interna, el tamaño de parámetros o la longitud de contexto en la información disponible, aunque el modelo original es conocido por ser un transformer MPNet con 278 millones de parámetros y una ventana de contexto de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo original es MPNet, pero no se especifica en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el archivo `.pte` puede incluir cuantizacion, pero no se indica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento del modelo. El archivo `.pte` es una exportacion del modelo `multi-qa-mpnet-base-dot-v1` de sentence-transformers, que originalmente es un transformer basado en MPNet con atencion de multiples cabezas y una capa de pooling para generar embeddings de frases. El entrenamiento del modelo original se realizo con un objetivo contrastivo sobre pares de preguntas y respuestas, optimizando la similitud coseno o el producto punto entre representaciones. Sin embargo, estos detalles no estan disponibles en la documentacion de este repositorio, que se limita a indicar que el modelo fue exportado usando ExecuTorch v0.6.0 y que no se garantiza compatibilidad hacia adelante con versiones anteriores del runtime.

## Capacidades

- Generacion de embeddings de texto densos para busqueda semantica y similitud entre frases.
- Codificacion de consultas y documentos para sistemas de recuperacion de informacion (preguntas y respuestas).
- Soporte para tareas de reordenamiento o clasificacion basada en similitud.
- No es un modelo generativo: no produce texto nuevo, solo vectores numericos.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues desconocidas, aunque el modelo original `multi-qa-mpnet-base-dot-v1` fue entrenado con datos multilingues; no se confirma en esta version.
- No incluye capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en documentos dentro de una app movil: el modelo permite indexar y recuperar fragmentos de texto relevantes a partir de una consulta, todo en el dispositivo, sin enviar datos a un servidor.
- Sistema de preguntas y respuestas sobre un corpus local: combinando los embeddings con un indice vectorial, se pueden responder preguntas extrayendo pasajes relevantes de un conjunto de documentos.
- Recomendacion de contenido basada en similitud textual: por ejemplo, sugerir articulos o noticias relacionados con el historial de lectura del usuario, calculando la distancia coseno entre embeddings.
- Deduplicacion de texto: detectar frases o parrafos similares dentro de una base de datos de contenido generado por usuarios.
- Clasificacion de texto ligera: los embeddings pueden alimentar un clasificador logístico o una red pequena para tareas como analisis de sentimiento o deteccion de spam.
- Chatbots con memoria semantica: almacenar las interacciones previas como embeddings y recuperar el contexto relevante para respuestas coherentes en conversaciones de larga duracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de calidad (como MMLU, HumanEval o tareas de similitud) ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de integrarlo en produccion.

## Requisitos de hardware

- El archivo `.pte` esta disenado para ejecutarse en CPUs de dispositivos moviles mediante el backend XNNPACK de ExecuTorch.
- No se especifica VRAM, pero al ser un modelo de embeddings de tamano medio (278M de parametros en su version original), la inferencia puede realizarse en RAM de dispositivos moviles modernos (4 GB o mas).
- Requiere un dispositivo con sistema operativo Android o iOS que soporte el runtime de ExecuTorch v0.6.0 o compatible.
- Se recomienda usar la biblioteca `react-native-executorch` para integrar el modelo en aplicaciones React Native, ya que gestiona la compatibilidad del runtime internamente.
- No se proporcionan datos de latencia o throughput; estos dependen del hardware especifico y de la optimizacion del modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio. El modelo original `multi-qa-mpnet-base-dot-v1` puede compararse con otros modelos de embeddings como `all-MiniLM-L6-v2` o `bge-base-en-v1.5`, pero no se ofrecen datos de rendimiento en esta publicacion. La principal diferencia es que esta version esta optimizada para ejecucion movil en formato ExecuTorch, mientras que las alternativas suelen distribuirse en formato `safetensors` o `ONNX`.

## Limitaciones y advertencias

- El modelo es una exportacion especifica para ExecuTorch v0.6.0; no se garantiza compatibilidad con versiones posteriores del runtime. Si se actualiza ExecuTorch, puede ser necesario reexportar el modelo.
- No se proporcionan detalles sobre sesgos o riesgos de alucinacion. Como modelo de embeddings, no genera texto, por lo que el riesgo de alucinacion es bajo, pero los sesgos presentes en los datos de entrenamiento originales pueden reflejarse en las representaciones vectoriales.
- La longitud de contexto no se especifica; si se usa el modelo original, el limite es de 512 tokens. Superar este limite puede degradar la calidad de los embeddings.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- No se incluye el tokenizador en el repositorio de forma explicita, aunque se menciona un `tokenizer.json` en la raiz; es necesario asegurarse de que el tokenizador es compatible con el modelo.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/software-mansion/react-native-executorch-multi-qa-mpnet-base-dot-v1)
- [Modelo original multi-qa-mpnet-base-dot-v1](https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-dot-v1/tree/main)
- [Repositorio React Native ExecuTorch](https://github.com/software-mansion/react-native-executorch)
- [Documentacion de React Native ExecuTorch](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Sitio web de React Native ExecuTorch](https://executorch.swmansion.com/)
- [Documentacion oficial de ExecuTorch](https://pytorch.org/executorch/stable/index.html)
- [Nota de compatibilidad de ExecuTorch](https://github.com/pytorch/executorch/blob/11d1742fdeddcf05bc30a6cfac321d2a2e3b6768/runtime/COMPATIBILITY.md?plain=1#L4)
