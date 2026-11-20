# software-mansion/react-native-executorch-multi-qa-MiniLM-L6-cos-v1

## Resumen

`react-native-executorch-multi-qa-MiniLM-L6-cos-v1` es un conjunto de exportaciones del modelo de embeddings `multi-qa-MiniLM-L6-cos-v1` (originalmente de sentence-transformers) a formato ExecuTorch `.pte`, publicadas por Software Mansion para su uso con la libreria React Native ExecuTorch. El objetivo no es servir inferencia en servidor, sino ejecutar busqueda semantica y recuperacion de pasajes directamente en el dispositivo (movil, escritorio o navegador con backend compatible), sin conexion a red.

El modelo subyacente es un transformer encoder de tipo MiniLM (familia BERT destilada) con 6 capas y 384 dimensiones de embedding, entrenado para similitud coseno entre pregunta y pasaje. El repositorio incluye cinco variantes compiladas (CoreML fp16/int8, Vulkan fp16, XNNPACK fp32/int8) junto con el tokenizer, de modo que el desarrollador puede elegir backend y precision segun la plataforma objetivo. El peso de los ficheros oscila entre 21,8 MB (int8) y 86,2 MB (fp32).

Su relevancia actual radica en que permite incorporar RAG ligero y busqueda semantica local en aplicaciones React Native sin depender de APIs externas ni de GPU dedicada, con una degradacion de calidad practicamente nula al cuantizar a int8 (top-1 57,55 frente a 57,50 en fp32 sobre SQuAD v1.1 dev). La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, familia BERT destilada), 6 capas |
| Parametros totales | no disponible (el modelo upstream MiniLM-L6 ronda 22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 (int8 dinamico en activaciones, int8 por canal en pesos, tabla de embeddings int8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (variantes coreml, vulkan, xnnpack) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas con embeddings de 384 dimensiones, derivado de la familia MiniLM y adaptado por sentence-transformers para similitud semantica pregunta-pasaje. La salida es un vector de embedding normalizado que se compara mediante producto escalar o similitud coseno. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Las exportaciones a ExecuTorch constituyen la innovacion tecnica relevante de este repositorio: los pesos se compilan a programas `.pte` para tres backends (CoreML, Vulkan, XNNPACK) con distintas precisiones. La variante XNNPACK int8 aplica cuantizacion dinamica int8 en las activaciones y cuantizacion int8 por canal en los pesos de las capas lineales, ademas de una tabla de embeddings de palabras en int8. Segun la model card, esta cuantizacion mantiene practicamente identico el rendimiento de recuperacion respecto a fp32.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica (pipeline `sentence-similarity`).
- Recuperacion de pasajes (passage retrieval) para sistemas de busqueda y RAG.
- Busqueda semantica local en dispositivo, sin llamadas a red.
- Ejecucion en moviles y dispositivos de escritorio mediante React Native ExecuTorch.
- Compatibilidad con backends CoreML (Apple), Vulkan (GPU multiplataforma) y XNNPACK (CPU).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones React Native: indexar documentos o notas del usuario en el dispositivo y recuperar los fragmentos mas relevantes ante una consulta en lenguaje natural, usando la variante XNNPACK int8 (21,9 MB) para minimizar el tamano de la app.
- RAG local en moviles: combinar el modelo de embeddings con un LLM pequeno tambien exportado a ExecuTorch para construir un asistente que responda sobre documentos privados sin enviar datos a la nube.
- Deduplicacion y agrupacion de contenido: calcular embeddings de titulares, mensajes o registros y agrupar por similitud coseno para eliminar duplicados en el cliente.
- Clasificacion semantica zero-shot ligera: comparar la representacion de un texto con la de etiquetas candidatas para categorizar tickets de soporte o correos en la propia aplicacion.
- Recomendacion de contenido: generar embeddings de articulos o productos y recomendar elementos similares al historial del usuario, todo en dispositivo y con latencia baja gracias a la ejecucion nativa.
- Filtrado previo en pipelines de busqueda hibrida: usar el modelo como primera etapa de recuperacion densa en el cliente y delegar el re-ranking a un servicio remoto cuando sea necesario.
- Deteccion de similitud entre respuestas en formularios o encuestas: comparar respuestas abiertas para identificar duplicados o inconsistencias sin infraestructura de servidor.

## Benchmarks y rendimiento

Resultados publicados en la model card para recuperacion de pasajes en SQuAD v1.1 dev (2000 preguntas frente a sus 315 parrafos, producto escalar):

| Variante | top-1 | MRR |
|---|---|---|
| XNNPACK fp32 | 57,50 | 0,6972 |
| XNNPACK int8 | 57,55 | 0,6973 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; estos no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo esta disenado para ejecucion en dispositivo. El tamano en memoria ronda los 21,8 MB (int8) a 86,2 MB (fp32) para los pesos.
- GPU recomendadas: no requiere GPU dedicada; la variante Vulkan fp16 puede aprovechar GPU integradas o moviles compatibles con Vulkan; la variante CoreML usa la Neural Engine o GPU de Apple.
- Cabe en cualquier dispositivo movil moderno y en CPU de escritorio; la variante int8 es la mas adecuada para telefonos de gama media.
- Opciones de despliegue: React Native ExecuTorch (runtime ExecuTorch v1.4.1), o un runtime ExecuTorch propio cargando los ficheros `.pte`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (multi-qa-MiniLM-L6-cos-v1, ExecuTorch) | no disponible (MiniLM-L6) | no disponible | top-1 57,55 / MRR 0,6973 en SQuAD v1.1 dev (int8) | Apache 2.0 | Hugging Face, formato `.pte` |
| multi-qa-MiniLM-L6-cos-v1 original (sentence-transformers) | no disponible (MiniLM-L6) | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face, formato PyTorch/safetensors |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta tareas generativas, tool calling o agentes.
- Sin garantia de compatibilidad hacia delante: los ficheros estan compilados para ExecuTorch v1.4.1 y pueden fallar en runtimes mas antiguos o futuros.
- Idiomas soportados no declarados; el modelo upstream esta orientado principalmente a ingles, por lo que el rendimiento en castellano puede ser inferior.
- Longitud de contexto no documentada; los textos largos deberan trocearse antes de generar embeddings.
- Riesgo de recuperacion irrelevante en dominios muy especializados si no se ajusta el modelo o se combina con re-ranking.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream y de las dependencias de ExecuTorch.
- No se han publicado evaluaciones de sesgo ni de robustez en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-multi-qa-MiniLM-L6-cos-v1
- Modelo upstream: https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1/tree/main
- Libreria React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
