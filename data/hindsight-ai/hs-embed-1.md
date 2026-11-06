# hindsight-ai/hs-embed-1

## Resumen

hs-embed-1 es un modelo de embeddings de texto multilingüe desarrollado por Hindsight AI (Vectorize) como componente nativo de su plataforma de memoria y recuperación Hindsight. Se trata de un bi-encoder basado en una arquitectura ModernBERT, afinado a partir de `hotchpotch/bekko-embedding-v1-a25m`, con 111.728.256 parámetros totales según los pesos en safetensors, de los cuales 98 millones corresponden a la tabla de embeddings de tokens, de modo que cada pasada forward ejecuta un transformer de aproximadamente 13 millones de parámetros.

El modelo resuelve el problema de la búsqueda semántica multilingüe en aplicaciones de recuperación aumentada (RAG) y memoria a largo plazo, ofreciendo vectores de 384 dimensiones truncables a 256, 128 o 64 mediante Matryoshka Representation Learning, una ventana de contexto de 8.192 tokens y soporte para ocho idiomas (inglés, español, francés, alemán, portugués, japonés, coreano y chino simplificado y tradicional). No requiere prefijos de instrucción: consultas y documentos se codifican de la misma forma, con pooling de media y similitud coseno.

Su relevancia actual radica en la combinación de tamano reducido, contexto largo y despliegue eficiente: incluye una exportación ONNX con tabla de vocabulario en int8 para CPU y pesos safetensors en FP16 para GPU, y está integrado de serie en Text Embeddings Inference (TEI) y en la propia plataforma Hindsight. La licencia MIT facilita su adopción comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (ModernBERT) |
| Parametros totales | 111.728.256 (112M); 98M en la tabla de embeddings de tokens, ~13M en el transformer |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | ONNX int8 (tabla de vocabulario); safetensors en FP16 y FP32 (rama `fp32`) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh (simplificado y tradicional) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, copia FP32 en rama `fp32`), ONNX (`onnx/model.onnx`) |
| Dimensiones del embedding | 384, truncables a 256, 128 y 64 (Matryoshka) |
| Pooling | Media (mean) |
| Funcion de similitud | Coseno |
| Modelo base | hotchpotch/bekko-embedding-v1-a25m (finetune) |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un bi-encoder de tipo transformer basado en ModernBERT, afinado sobre `hotchpotch/bekko-embedding-v1-a25m`. La distribución de parámetros es peculiar: de los 112M totales, 98M pertenecen a la tabla de embeddings de tokens, por lo que el coste computacional por pasada corresponde a un transformer de unos 13M de parámetros. Esta relacion hace que el modelo sea especialmente adecuado para inferencia en CPU, ya que el cuello de botella está en la tabla de vocabulario y no en el cómputo de atención.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. Sí se documentan dos decisiones técnicas destacables: el uso de Matryoshka Representation Learning, que permite truncar los vectores de 384 a 256, 128 o 64 dimensiones conservando la primera parte del vector y renormalizando, y la ausencia total de prefijos o prompts diferenciados para consultas y documentos, lo que simplifica los pipelines de indexación y búsqueda. El pooling es de media y la similitud se calcula por coseno.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `sentence-similarity`).
- Codificación simétrica de consultas y documentos sin prefijos ni instrucciones adicionales.
- Soporte multilingüe en ocho idiomas: inglés, español, francés, alemán, portugués, japonés, coreano y chino simplificado y tradicional.
- Vectores de dimensión variable (384, 256, 128 o 64) para ajustar el equilibrio entre precisión y coste de almacenamiento.
- Entrada de hasta 8.192 tokens, adecuada para fragmentos de documentos largos.
- Extracción de características (`feature-extraction`) para pipelines personalizados.
- Exportación ONNX con vocabulario int8 para inferencia en CPU y pesos safetensors para GPU.
- Compatibilidad con Text Embeddings Inference (TEI) en imágenes de CPU y GPU, y con endpoints compatibles.
- Integración nativa con la plataforma Hindsight, tanto en modo local como mediante servidor TEI o la API de inferencia gestionada.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito: su función es exclusivamente la representación vectorial de texto.

## Casos de uso

- Búsqueda semántica en aplicaciones RAG: el modelo indexa fragmentos de documentos de hasta 8.192 tokens y codifica las consultas de usuario con el mismo encoder, sin prefijos, lo que permite montar un pipeline de recuperación densa sobre TEI o sentence-transformers con una latencia baja en CPU.
- Memoria a largo plazo en asistentes conversacionales: la integración nativa con Hindsight permite almacenar y recuperar recuerdos de conversaciones anteriores; la ventana de 8.192 tokens admite turnos largos o resúmenes de sesión sin trocear en exceso.
- Búsqueda multilingüe en catálogos y bases de conocimiento: al soportar ocho idiomas en un único espacio vectorial, permite que una consulta en español recupere documentos en inglés, francés o japonés sin traducción intermedia.
- Deduplicación y agrupación de documentos: los embeddings de 384 dimensiones con similitud coseno sirven para detectar contenido duplicado o casi duplicado en corpus editoriales y de soporte, truncando a 128 o 64 dimensiones para acelerar el clustering a gran escala.
- Clasificación y enrutamiento de tickets de soporte: codificar el texto de cada ticket y compararlo contra prototipos de categoría permite enrutar incidencias por similitud semántica, con despliegue en CPU mediante el export ONNX int8 y sin necesidad de GPU.
- Moderación y filtrado de contenido por similitud: comparar mensajes entrantes contra un conjunto de ejemplos etiquetados permite señalar contenido próximo a patrones problemáticos, con vectores de 64 dimensiones para mantener un índice ligero en memoria.
- Sistemas de recomendación basados en contenido: representar artículos, productos o publicaciones como vectores y calcular vecinos más cercanos permite construir recomendaciones por similitud temática sin depender de metadatos estructurados.
- Búsqueda en aplicaciones móviles o edge: gracias a que el transformer efectivo es de ~13M de parámetros y a la exportación ONNX int8, el modelo puede ejecutarse en entornos con recursos limitados donde un modelo de embeddings de mayor tamano no cabría.

## Benchmarks y rendimiento

La model card referencia dos imágenes (`assets/benchmarks.png` y `assets/serving-cpu.png`) con resultados de evaluación y de servicio en CPU, pero los valores numéricos no están incluidos en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: el repositorio ocupa 0,9 GB; en FP16 los pesos rondan 0,22 GB (112M parámetros) y en ONNX int8 son aún menores, por lo que la huella de memoria es inferior a 1 GB en todos los formatos.
- GPU recomendadas según la documentación de TEI: etiqueta `89-1.9.3` para L4 y otras GPU Ada; etiqueta `1.9.3` para A100 y H100. Cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con más de 2 GB de VRAM; el modelo está disenado para no necesitar GPU dedicada.
- Despliegue en CPU: imagen `ghcr.io/huggingface/text-embeddings-inference:cpu-1.9.3` con `--auto-truncate`, usando `onnx/model.onnx` con tabla de vocabulario int8.
- Despliegue en GPU: imagen `ghcr.io/huggingface/text-embeddings-inference:89-1.9.3` o `1.9.3` según la GPU, con pesos safetensors.
- Otras opciones: sentence-transformers en Python (con `truncate_dim` para dimensiones reducidas), integración directa en Hindsight con proveedor `local`, `tei` o `hindsight`, y API gestionada en `https://inference.hindsight.vectorize.io`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card incluye una gráfica de servicio en CPU sin cifras extraídas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Idiomas | Licencia |
|---|---|---|---|---|---|
| hindsight-ai/hs-embed-1 | 112M (13M efectivos en transformer) | 8.192 | 384 (truncable a 64) | 8 | MIT |
| hotchpotch/bekko-embedding-v1-a25m (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de embeddings multilingües de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable más allá del modelo base declarado.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona de forma explícita y no soporta tool calling, agentes, visión ni audio.
- Sesgos conocidos: la model card no documenta análisis de sesgo; al entrenarse sobre corpus multilingües web es previsible que herede sesgos de esos datos, pero no hay evaluación publicada al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperación cuando los textos comparten vocabulario sin compartir significado; conviene validar umbrales por dominio.
- Limitación de contexto: las entradas superiores a 8.192 tokens deben truncarse; en TEI se recomienda `--auto-truncate` para evitar errores.
- Cobertura lingüística limitada a ocho idiomas; el rendimiento en idiomas no listados no está documentado y probablemente sea deficiente.
- El truncado Matryoshka a 64 dimensiones reduce la precisión de la similitud; es necesario renormalizar el vector tras el truncado.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones relevantes, manteniendo el aviso de copyright.
- Adopción muy temprana: 22 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks públicos verificables más allá de las imágenes de la model card; conviene evaluar en el dominio propio antes de producción.
- Dependencia del ecosistema Hindsight para la configuración más sencilla; fuera de él, el despliegue requiere montar sentence-transformers o TEI por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-embed-1
- Repositorio de Hindsight en GitHub: https://github.com/vectorize-io/hindsight
- Documentación de instalación de Hindsight: https://hindsight.vectorize.io/developer/installation
- Servicio de inferencia gestionado: https://inference.hindsight.vectorize.io
- Modelo base: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Text Embeddings Inference (Hugging Face): https://github.com/huggingface/text-embeddings-inference
- Sentence Transformers: https://www.sbert.net
