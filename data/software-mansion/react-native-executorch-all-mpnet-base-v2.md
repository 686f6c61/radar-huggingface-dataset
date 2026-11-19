# software-mansion/react-native-executorch-all-mpnet-base-v2

## Resumen

`software-mansion/react-native-executorch-all-mpnet-base-v2` es un paquete de pesos del modelo de embeddings de frases **all-mpnet-base-v2** (originalmente publicado por sentence-transformers) exportados como programas `.pte` de ExecuTorch para su ejecución en dispositivo dentro de la librería [React Native ExecuTorch](https://www.npmjs.com/package/react-native-executorch). Lo desarrolla Software Mansion, el equipo detrás de React Native Reanimated y React Native Screens, y su propósito no es entrenar un modelo nuevo, sino ofrecer variantes cuantizadas y compiladas para distintos backends (Vulkan y XNNPACK) listas para ejecutarse en móviles sin depender de un servidor.

El modelo subyacente es un transformer basado en MPNet (Masked and Permuted Pre-training) con 109 millones de parámetros, diseñado para generar embeddings de frases de 768 dimensiones útiles en tareas de similitud semántica y recuperación de pasajes. El repositorio incluye cinco variantes de precisión: fp32, int8, 8da4w y fp16/int8 sobre Vulkan, con tamaños que van desde 69,1 MB (8da4w) hasta 416 MB (fp32), lo que permite ajustar el equilibrio entre precisión y huella en memoria según el dispositivo.

Su relevancia actual radica en que facilita el despliegue de búsqueda semántica y similitud de frases directamente en aplicaciones React Native, sin llamadas a API externas ni envío de datos a servidores. La licencia Apache 2.0 y la compatibilidad con ExecuTorch v1.4.1 lo convierten en una pieza práctica para pipelines de recuperación de información en el borde (edge).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MPNet (Masked and Permuted Pre-training) |
| Parametros totales | no disponible (modelo upstream all-mpnet-base-v2; típicamente ~109 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | fp32, fp16, int8 (8da8w), 8da4w (int4 pesos, grupo 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (variantes Vulkan y XNNPACK) |

## Arquitectura y entrenamiento

El modelo upstream all-mpnet-base-v2 emplea la arquitectura MPNet, una variante de transformer que combina el enmascaramiento de tokens de BERT con la permutación de secuencias de XLNet, lo que le permite capturar dependencias bidireccionales sin el sesgo de independencia entre tokens enmascarados. Genera embeddings de frases de 768 dimensiones que se comparan mediante producto escalar o similitud coseno. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original de sentence-transformers y no se reproducen en esta ficha.

La aportación técnica de este repositorio es la exportación y cuantización para ExecuTorch. Se ofrecen cinco variantes: dos sobre backend Vulkan (fp16 e int8) y tres sobre XNNPACK (fp32, int8 y 8da4w). Las variantes int8 de XNNPACK usan cuantización dinámica de activaciones a int8 y pesos int8 por canal, mientras que la 8da4w emplea pesos int4 con grupos de 32, ambas sobre las capas lineales y con tabla de embeddings de palabras en int8. Los archivos están compilados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia adelante, por lo que una versión anterior puede fallar al cargarlos.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones para similitud semántica y recuperación de pasajes.
- Búsqueda semántica y recuperación de información mediante producto escalar o similitud coseno entre vectores.
- Clasificación y agrupamiento de textos por similitud (deduplicación, clustering, detección de paráfrasis).
- Ejecución en dispositivo (on-device) en aplicaciones React Native mediante React Native ExecuTorch.
- Soporte de múltiples backends de cómputo: Vulkan (GPU) y XNNPACK (CPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo de embeddings, no un modelo generativo.
- No se dispone de información sobre capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: indexar documentos o notas del usuario como embeddings y recuperar los más relevantes mediante producto escalar, todo en el dispositivo y sin enviar datos a un servidor.
- Deduplicación de contenido en el cliente: comparar embeddings de mensajes o artículos para detectar duplicados o paráfrasis antes de sincronizar con el backend, reduciendo tráfico y coste.
- Clasificación de textos por similitud de prototipos: asignar categorías comparando el embedding de una consulta con embeddings de referencia precalculados, útil en filtros de soporte o moderación ligera.
- Recomendación de contenido local: agrupar artículos, productos o notas por similitud semántica para construir listas de "relacionados" sin conexión.
- Asistentes de escritura o notas: sugerir enlaces entre notas o fragmentos de texto basándose en cercanía semántica, con latencia baja al ejecutarse en el propio dispositivo.
- Preprocesado en pipelines de RAG móviles: generar embeddings de consultas y fragmentos en el dispositivo para alimentar un recuperador local antes de consultar un LLM remoto, minimizando la exposición de datos.
- Filtrado de spam o contenido no deseado: comparar mensajes entrantes con embeddings de ejemplos etiquetados para una primera criba on-device.

## Benchmarks y rendimiento

La model card proporciona resultados de recuperación de pasajes sobre SQuAD v1.1 dev (2000 preguntas contra sus 315 párrafos, producto escalar):

| Variante | top-1 | MRR |
|---|---|---|
| fp32 | 65,05 | 0,7631 |
| int8 | 65,00 | 0,7633 |
| 8da4w | 64,60 | 0,7606 |

No se han publicado en la información disponible resultados de benchmarks estándar de embeddings (MTEB, STS) para este paquete exportado. Los datos de latencia y throughput en dispositivo no están disponibles.

## Requisitos de hardware

- Huella en disco de los pesos: 416 MB (fp32 XNNPACK), 208 MB (fp16 Vulkan), 127 MB (int8 Vulkan), 105 MB (int8 XNNPACK) y 69,1 MB (8da4w XNNPACK).
- VRAM/RAM estimada para inferencia: proporcional al tamaño del archivo de pesos más el estado de activaciones y tokenizador; la variante 8da4w (69,1 MB) es la más adecuada para dispositivos con memoria limitada.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el backend Vulkan está pensado para GPU integradas en dispositivos móviles compatibles con Vulkan.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el paquete está orientado a ejecución en dispositivo móvil, no a estaciones de trabajo.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 y la librería React Native ExecuTorch (a través de su registro de modelos y pipelines de tareas). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| react-native-executorch-all-mpnet-base-v2 (este) | no disponible (~109 M upstream) | no disponible | ExecuTorch `.pte` | Apache 2.0 | Embeddings on-device para React Native |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | no disponible | safetensors / PyTorch | Apache 2.0 | Embeddings en servidor o escritorio |
| Otros modelos de embeddings on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas específicas de embeddings cuantizados para móvil no está disponible en la información proporcionada. La diferencia principal frente al modelo upstream es el formato de exportación y las variantes cuantizadas, no la arquitectura ni los pesos originales.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Los sesgos del modelo upstream (all-mpnet-base-v2) se heredan; no se documentan en esta ficha.
- Riesgo de similitudes espurias en dominios alejados de los datos de entrenamiento originales; la calidad de recuperación puede degradarse fuera de inglés y de textos generales.
- La cuantización 8da4w reduce ligeramente la precisión (top-1 64,60 frente a 65,05 en fp32), aceptable para muchas aplicaciones pero no para recuperación de alta exigencia.
- Los archivos están compilados para ExecuTorch v1.4.1 y no hay garantía de compatibilidad hacia adelante; un runtime más antiguo puede fallar al cargarlos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream y de las dependencias de ExecuTorch.
- No se dispone de información sobre idiomas soportados ni sobre el tamaño de contexto máximo en esta exportación; validar ambos extremos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-all-mpnet-base-v2
- Modelo upstream: https://huggingface.co/sentence-transformers/all-mpnet-base-v2/tree/main
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
