# software-mansion/react-native-executorch-all-MiniLM-L6-v2

## Resumen

Software Mansion publica esta exportación del modelo de embeddings de texto all-MiniLM-L6-v2, originalmente desarrollado por sentence-transformers, en formato `.pte` para el runtime ExecuTorch de Meta. El modelo transforma frases y párrafos cortos en vectores de 384 dimensiones, lo que permite tareas de similitud semántica, búsqueda y clasificación. Esta versión se distribuye a través de la librería React Native ExecuTorch, que permite ejecutar modelos de IA on-device en aplicaciones React Native con privacidad y funcionamiento offline.

El modelo se exportó con ExecuTorch v0.6.0 y se distribuye con el tokenizador `tokenizer.json`. Está optimizado para el backend xnnpack, pensado para ejecución en CPU de dispositivos móviles. Con aproximadamente 22,7 millones de parámetros y una longitud de contexto de 256 tokens, es un modelo ligero diseñado para inferencia en tiempo real en dispositivos con recursos limitados. Su relevancia actual radica en la creciente demanda de IA on-device en aplicaciones móviles, donde la privacidad y la baja latencia son factores críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM (transformer encoder, 6 capas, 384 dimensiones de embedding) |
| Parametros totales | ~22,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (exportación para backend xnnpack en formato `.pte`) |
| Idiomas soportados | Inglés (idioma principal del modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo base all-MiniLM-L6-v2 es un transformer encoder de 6 capas con arquitectura MiniLM, que genera embeddings de 384 dimensiones mediante mean pooling sobre los tokens de salida. El entrenamiento original utilizó un objetivo de contraste con pares de frases semánticamente equivalentes, combinando datos de múltiples datasets de similitud textual (STS). Esta exportación no modifica los pesos del modelo original: únicamente lo convierte al formato `.pte` de ExecuTorch mediante el backend xnnpack, lo que permite su ejecución en dispositivos móviles sin depender de un runtime de Python. El proceso de exportación se realizó con la versión v0.6.0 de ExecuTorch, y no se garantiza compatibilidad hacia delante con versiones posteriores del runtime.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones para frases y párrafos cortos.
- Similitud semántica entre pares de frases (cosine similarity sobre los embeddings).
- Búsqueda semántica: indexado de documentos y consultas para retrieval por similitud.
- Clasificación de texto mediante embeddings como entrada a clasificadores lineales.
- Clustering de documentos por contenido temático.
- Detección de duplicados y paráfrasis.
- Ejecución on-device en dispositivos móviles sin conexión a red.
- No es un modelo generativo: no produce texto nuevo, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: el modelo indexa documentos o mensajes del usuario y permite recuperar resultados por similitud semántica en lugar de coincidencia exacta, gracias a los embeddings de 384 dimensiones.
- Moderación de contenido en tiempo real: clasificación de comentarios o mensajes en categorías como spam, abuso o contenido irrelevante mediante embeddings + clasificador lineal, ejecutándose localmente en el dispositivo.
- Clasificación de tickets de soporte: asignación automática de consultas de usuarios a departamentos o categorías predefinidas, sin enviar datos a servidores externos.
- Detección de duplicados en bases de conocimiento: comparación de pares de documentos para identificar contenido redundante, útil en gestores documentales móviles.
- Recomendación de artículos o contenidos: cálculo de similitud entre el historial del usuario y un catálogo de documentos para sugerir elementos relacionados.
- Análisis de sentimiento on-device: embeddings como entrada de un clasificador ligero para valorar la polaridad de reseñas o mensajes sin conexión.
- Chatbots de retrieval aumentado (RAG): integración del modelo como componente de embeddings en pipelines de RAG que se ejecutan localmente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación ni comparaciones con alternativas. Para datos de rendimiento del modelo base all-MiniLM-L6-v2, es necesario consultar la documentación original de sentence-transformers.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo está diseñado para ejecución en CPU mediante el backend xnnpack.
- GPU recomendadas: no se requieren GPU. La ejecución está pensada para CPU de dispositivos móviles (ARM).
- Compatibilidad con consumer GPU: no es el objetivo del formato `.pte`; para uso en GPU es preferible el modelo original en formato safetensors.
- Almacenamiento: el repositorio ocupa 0,6 GB, lo que cubre el modelo y el tokenizador.
- Opciones de despliegue: React Native ExecuTorch (librería npm), o cualquier runtime ExecuTorch compatible con la versión v0.6.0. No se puede usar directamente con vLLM, llama.cpp, Ollama ni TGI, ya que no es un formato de pesos estándar para servidores.
- Latencia y throughput: no se proporcionan datos en la información disponible. Al ser un modelo de 22,7 millones de parámetros, la latencia esperada en CPU móvil es de unos pocos milisegundos por frase, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| react-native-executorch-all-MiniLM-L6-v2 | ~22,7 M | 384 | 256 tokens | .pte (ExecuTorch) | Apache 2.0 |
| all-MiniLM-L6-v2 (original, sentence-transformers) | ~22,7 M | 384 | 256 tokens | safetensors | Apache 2.0 |
| all-mpnet-base-v2 (sentence-transformers) | ~109 M | 768 | 384 tokens | safetensors | Apache 2.0 |
| multilingual-e5-small | ~118 M | 384 | 512 tokens | safetensors | MIT |

La comparativa se centra en el mismo modelo en su formato original, así como en alternativas de mayor tamaño dentro de la familia sentence-transformers. La ventaja de esta exportación es su formato `.pte` listo para ejecución en React Native, mientras que las alternativas requieren un paso adicional de exportación.

## Limitaciones y advertencias

- Longitud de contexto limitada a 256 tokens: frases o documentos más largos deben truncarse, lo que puede degradar la calidad del embedding.
- Modelo entrenado principalmente en inglés: el rendimiento en otros idiomas es inferior al de modelos multilingües.
- No es un modelo generativo: no produce texto, solo vectores de embedding.
- Compatibilidad de runtime: la exportación se realizó con ExecuTorch v0.6.0 y no se garantiza compatibilidad con versiones anteriores del runtime. Si se usa fuera de React Native ExecuTorch, hay que verificar la compatibilidad.
- Riesgo de sesgos: como cualquier modelo entrenado con datos de texto, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se dispone de una evaluación específica en esta exportación.
- Sin datos de benchmark publicados en esta ficha: no hay métricas de rendimiento para evaluar la degradación introducida por la cuantización o la exportación a xnnpack.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-all-MiniLM-L6-v2
- Modelo original all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio GitHub de React Native ExecuTorch: https://github.com/software-mansion/react-native-executorch
- Documentación de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Web oficial de React Native ExecuTorch: https://executorch.swmansion.com/
- Documentación de ExecuTorch: https://pytorch.org/executorch/stable/index.html
- Repositorio GitHub de ExecuTorch: https://github.com/pytorch/executorch
