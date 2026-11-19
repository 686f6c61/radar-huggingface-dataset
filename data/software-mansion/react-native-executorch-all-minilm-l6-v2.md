# software-mansion/react-native-executorch-all-MiniLM-L6-v2

## Resumen

`software-mansion/react-native-executorch-all-MiniLM-L6-v2` es una redistribución del modelo de embeddings de frases `all-MiniLM-L6-v2` de sentence-transformers, exportado a programas ExecuTorch (`.pte`) para su ejecución en dispositivo dentro de la librería React Native ExecuTorch. El autor es Software Mansion, el estudio responsable de React Native Reanimated y de la propia librería React Native ExecuTorch. El problema que resuelve es doble: por un lado ofrece un encoder de frases ligero y probado para tareas de similitud semántica; por otro, elimina la fricción de llevar ese modelo a móviles y dispositivos de borde con múltiples backends (Core ML, Vulkan, XNNPACK) y precisiones (fp32, fp16, int8).

El modelo subyacente es un transformer encoder de 6 capas con dimensión oculta de 384, derivado de MiniLM y destilado a partir de modelos mayores; produce embeddings de 384 dimensiones. El repositorio incluye únicamente los artefactos de inferencia (pesos `.pte`, tokenizador y configuraciones), no los pesos en formato safetensors ni el código de entrenamiento. El tamaño total del repo es de 0,9 GB, aunque los ficheros `.pte` individuales oscilan entre 21,8 MB (int8) y 86,2 MB (fp32).

Su relevancia actual radica en que permite ejecutar búsqueda semántica, deduplicación o recuperación local en aplicaciones React Native sin enviar texto a un servidor, con variantes int8 que, según la model card, mantienen e incluso mejoran ligeramente la precisión del fp32 en la tarea de recuperación de pasajes de SQuAD v1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, 6 capas, dimensión oculta 384) |
| Parametros totales | no disponible (el modelo upstream all-MiniLM-L6-v2 tiene ~22,7 M; no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo upstream se entrena con 256 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | fp32, fp16, int8 (dynamic activations int8, per-channel weights int8, embedding table int8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (Core ML, Vulkan, XNNPACK); tokenizer.json y config.json |
| Dimension de embedding | 384 (modelo upstream) |
| Runtime compatible | ExecuTorch v1.4.1 (sin garantía de compatibilidad hacia adelante) |
| Variantes incluidas | coreml fp16 (43,4 MB), coreml int8 (21,8 MB), vulkan fp16 (43,1 MB), xnnpack fp32 (86,2 MB), xnnpack int8 (21,9 MB) |
| Tarea | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es la del modelo upstream `all-MiniLM-L6-v2`: un transformer encoder de 6 capas y 384 dimensiones ocultas, resultado de la destilación de MiniLM y entrenado con objetivos de similitud de frases (contrastivo y triplet) sobre pares de oraciones. Esta ficha no redistribuye pesos entrenables ni documentación del proceso de entrenamiento; solo los artefactos exportados. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (en un modelo de embeddings no sería el mecanismo habitual).

La innovación técnica relevante está en el pipeline de exportación a ExecuTorch, no en el modelo en sí. Se ofrecen cinco variantes compiladas para tres backends: Core ML (fp16 e int8, para Apple), Vulkan (fp16, para GPU en Android y escritorio) y XNNPACK (fp32 e int8, para CPU). La variante XNNPACK int8 aplica cuantización dinámica de activaciones a int8, pesos int8 per-channel en las capas Lineales y una tabla de embeddings de palabras en int8. Los ficheros están compilados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia adelante, por lo que versiones anteriores pueden fallar al cargarlos.

## Capacidades

- Generación de embeddings de frases de 384 dimensiones para similitud semántica y recuperación densa.
- Búsqueda semántica local: indexación y consulta de pasajes sin salida a red.
- Deduplicación y agrupamiento de textos por cercanía vectorial.
- Clasificación zero-shot mediante comparación de embeddings con etiquetas descriptivas.
- Ejecución en dispositivo en iOS (Core ML), Android y escritorio (Vulkan, XNNPACK).
- Cuantización int8 con pérdida de precisión despreciable según la medición del autor en SQuAD v1.1.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder de embeddings, no un modelo generativo.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: el modelo indexa documentos locales en el dispositivo y responde consultas en lenguaje natural calculando similitud coseno entre embeddings, sin enviar datos a servidores. Adecuado por su tamaño (21,9 MB en int8) y su ejecución vía XNNPACK o Core ML.
- Deduplicación de notas o mensajes en apps de productividad: se generan embeddings de cada entrada y se agrupan por umbral de similitud para detectar duplicados o casi duplicados antes de sincronizar.
- Clasificación de tickets de soporte en el cliente: se comparan los embeddings del ticket con embeddings de etiquetas predefinidas y se asigna la categoría más cercana, reduciendo la latencia y el coste de backend.
- Filtrado de contenido o moderación asistida en el dispositivo: se calcula la similitud entre el texto del usuario y un conjunto de frases de referencia para marcar contenido sensible antes de enviarlo al servidor.
- Recomendación de contenido offline: en apps de lectura o noticias, se indexan artículos con embeddings y se sugieren lecturas relacionadas al usuario sin conexión.
- Recuperación aumentada en el cliente para asistentes ligeros: se recuperan pasajes relevantes de una base local y se pasan a un modelo generativo pequeño, todo en el dispositivo, usando este encoder como etapa de recuperación.
- Agrupamiento de reseñas o feedback: se generan embeddings de las reseñas y se aplica clustering (k-means o similar) para descubrir temas recurrentes en el dispositivo o en un pipeline de backend ligero.

## Benchmarks y rendimiento

El autor publica una única medición: recuperación de pasajes de SQuAD v1.1 dev (2000 preguntas contra sus 315 párrafos), con producto escalar como métrica de similitud, para la variante XNNPACK int8 frente a fp32.

| Variante | Top-1 | MRR |
|---|---|---|
| XNNPACK fp32 | 57,70 | 0,7012 |
| XNNPACK int8 | 58,05 | 0,7024 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de embeddings (MTEB, por ejemplo) para esta exportación concreta. La model card no incluye comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/RAM: los ficheros `.pte` ocupan entre 21,8 MB (int8) y 86,2 MB (fp32); el consumo en ejecución es del orden de decenas de MB, apto para dispositivos móviles de gama media.
- GPU recomendadas: no aplica en el sentido de servidor; en dispositivo se usan Core ML (Apple Neural Engine/GPU) o Vulkan (GPU Android). En escritorio, cualquier GPU con soporte Vulkan puede ejecutar la variante correspondiente.
- Cabe en cualquier GPU de consumo y en móviles: el modelo está diseñado para ejecución en dispositivo, no para despliegue en servidor.
- Opciones de despliegue: React Native ExecuTorch (librería principal), o cualquier runtime ExecuTorch v1.4.1 que cargue los `.pte`; no se distribuyen pesos GGUF, safetensors ni versiones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| react-native-executorch-all-MiniLM-L6-v2 | no disponible (~22,7 M upstream) | no disponible | `.pte` (ExecuTorch) | Apache 2.0 | Embeddings en dispositivo |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens (upstream) | safetensors, PyTorch | Apache 2.0 | Embeddings en servidor/CPU |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | safetensors, ONNX | MIT | Embeddings, mejor MTEB |
| intfloat/e5-small-v2 | ~33 M | 512 tokens | safetensors, ONNX | MIT | Embeddings, instrucciones |

La ventaja diferencial de esta ficha frente a los modelos upstream es la disponibilidad de artefactos ExecuTorch listos para móvil con backends Core ML, Vulkan y XNNPACK; los competidores suelen distribuirse en safetensors u ONNX y requieren conversión adicional. Los datos de parámetros y contexto de los modelos comparables provienen de sus fichas públicas y no de la información proporcionada para este modelo; verifíquense en sus repositorios antes de usarlos en producción.

## Limitaciones y advertencias

- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- No se documentan los idiomas soportados; el modelo upstream está orientado principalmente a inglés, por lo que el rendimiento en castellano puede degradarse.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en similitud: textos superficialmente parecidos pueden obtener puntuaciones altas.
- Sesgos: no se documentan evaluaciones de sesgo para esta exportación; el modelo upstream puede heredar sesgos de sus datos de entrenamiento.
- Compatibilidad estricta con ExecuTorch v1.4.1: versiones anteriores del runtime pueden fallar al cargar los `.pte`, y no hay garantía de compatibilidad hacia adelante.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución del modelo upstream y de Software Mansion.
- El repositorio no incluye pesos en safetensors ni el código de entrenamiento; para fine-tuning hay que acudir al modelo upstream.
- La longitud máxima de secuencia no está documentada en esta ficha; textos largos pueden truncarse según la configuración de exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-all-MiniLM-L6-v2
- Modelo upstream: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Repositorio ExecuTorch: https://github.com/pytorch/executorch
