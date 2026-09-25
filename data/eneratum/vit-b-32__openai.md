# eneratum/ViT-B-32__openai

## Resumen

Este repositorio, publicado por el usuario eneratum con el identificador eneratum/ViT-B-32__openai, contiene una exportación en formato ONNX del modelo CLIP ViT-B/32 mantenido por OpenCLIP. No es un modelo de lenguaje generativo ni un modelo entrenado por el autor del repositorio: se trata de una conversión de pesos de un checkpoint visión-lenguaje (etiquetas onnx, immich, clip) cuya finalidad declarada es servir como backend de embeddings para Immich, una biblioteca de fotos autoalojada.

CLIP resuelve el problema de relacionar imágenes y texto sin entrenamiento específico por tarea: proyecta ambas modalidades a un espacio vectorial común, de forma que la similitud coseno entre un vector de imagen y un vector de texto mide su correspondencia. Esto habilita búsqueda semántica, clasificación zero-shot, deduplicación y ranking sobre colecciones de imágenes sin necesidad de etiquetas manuales.

Su relevancia práctica es doble: permite construir búsqueda por lenguaje natural sobre bibliotecas privadas de fotografías sin enviar contenido a servicios en la nube, y el formato ONNX facilita el despliegue con onnxruntime en CPU o GPU dentro de un contenedor local. El repositorio ocupa 2,7 GB, no declara licencia, idiomas ni pipeline, y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT-B/32) más transformer de texto, con proyección a un espacio de embedding conjunto (arquitectura CLIP según OpenCLIP; la model card no detalla variantes) |
| Parámetros totales | no disponible en la model card; la variante CLIP ViT-B/32 de referencia ronda los 151 M de parámetros (aproximadamente 86 M en el codificador visual y 63 M en el codificador de texto) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de un LLM: CLIP procesa una imagen de entrada fija y una secuencia de texto corta, limitada a 77 tokens en la implementación de referencia |
| Tipos de cuantización | no disponible; el repositorio distribuye pesos en ONNX (tamaño total del repo: 2,7 GB) |
| Idiomas soportados | no disponible; los textos de entrenamiento de CLIP son mayoritariamente en inglés según la documentación de referencia |
| Licencia | no disponible |
| Formato de pesos | ONNX (etiqueta onnx; exportación del modelo OpenCLIP) |

## Arquitectura y entrenamiento

La arquitectura es la de CLIP: dos codificadores independientes (dual encoder) entrenados de forma contrastiva. El codificador visual es un Vision Transformer con parches de 32x32 píxeles sobre entradas de 224x224 y proyección final a un vector de embedding; el codificador de texto es un transformer que procesa la descripción y la proyecta al mismo espacio. La similitud entre ambos vectores es la señal que usa el modelo, y no existe decodificador ni generación de tokens. La model card de este repositorio no documenta ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de ajuste con RLHF o DPO; se limita a indicar que son exportaciones ONNX del modelo CLIP asociado de OpenCLIP.

La innovación técnica relevante en este repositorio no está en el entrenamiento, sino en el empaquetado: la conversión a ONNX permite ejecutar el modelo con onnxruntime sin dependencias de PyTorch, con soporte de CPU, CUDA, TensorRT o DirectML, y con los codificadores visual y de texto separados, patrón habitual en los pipelines de inferencia de Immich. El tamaño del repositorio (2,7 GB) es notablemente superior al de los pesos de un modelo de este tamaño en precisión simple, lo que sugiere que incluye varias exportaciones o precisiones distintas, aunque el autor no detalla el contenido.

## Capacidades

- Generación de embeddings de imagen: convierte cada imagen en un vector normalizado apto para similitud coseno, clustering y búsqueda por vecinos más cercanos.
- Generación de embeddings de texto en el mismo espacio vectorial, lo que permite búsqueda de texto a imagen y de imagen a texto.
- Clasificación zero-shot: comparar la imagen con una lista de prompts textuales y asignar la etiqueta con mayor similitud, sin reentrenamiento.
- Ranking y filtrado por relevancia sobre catálogos de imágenes.
- Deduplicación y agrupación de imágenes a partir de distancias entre embeddings.
- Ejecución local mediante ONNX Runtime, con soporte de CPU y GPU, e integración directa con Immich.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje con interfaz de herramientas).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el codificador de texto de CLIP se entrena principalmente con texto en inglés, por lo que el rendimiento con prompts en castellano es incierto.
- Capacidades especiales: no hay modo de razonamiento (thinking), ni entrada de audio, ni generación de texto o imagen; el modelo solo produce vectores.

## Casos de uso

- Búsqueda semántica en bibliotecas de fotos autoalojadas: en Immich, el usuario escribe una consulta como "cumpleaños en la playa" y el sistema compara el embedding de texto con los embeddings de imagen ya indexados, todo ello sin salir del servidor doméstico ni enviar fotografías a terceros.
- Deduplicación y agrupación de colecciones: usar los embeddings como características de entrada a K-means o DBSCAN para agrupar imágenes visualmente similares y detectar casi duplicados mediante umbral de similitud coseno.
- Etiquetado automático sin anotaciones: definir una taxonomía en texto ("una foto de un perro", "un paisaje de montaña", "un documento escaneado") y clasificar por similitud, lo que permite organizar archivos existentes sin etiquetado manual previo.
- Filtrado previo en pipelines de subida: puntuar la similitud de las imágenes entrantes contra prompts de categorías no deseadas como primera barrera de moderación antes del almacenamiento, entendiendo que es un filtro grueso y no sustituye a un clasificador dedicado.
- Recuperación multimodal en flujos RAG: indexar figuras, capturas y documentos escaneados como vectores de imagen para poder recuperarlos con consultas en lenguaje natural dentro de un asistente documental.
- Recomendación y ordenación en catálogos de producto: en comercio electrónico, ordenar resultados por similitud entre la descripción textual del usuario y las imágenes del catálogo, o buscar productos visualmente parecidos a una imagen de referencia.
- Curación de datasets de entrenamiento: calcular la similitud entre cada par imagen-texto de un corpus y descartar los pares mal alineados antes de reutilizar esos datos para entrenar otros modelos.
- Accesibilidad e ilustración de contenidos: localizar rápidamente la imagen adecuada a partir de una descripción escrita, útil en redacciones, archivos históricos o equipos que gestionan grandes volúmenes de material gráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye cifras de evaluación, y tampoco se han encontrado en los resultados de búsqueda datos de clasificación zero-shot, recuperación imagen-texto ni latencias medidas para esta exportación concreta. Al tratarse de una reexportación de pesos de CLIP ViT-B/32, los resultados publicados por terceros corresponderían al modelo base de OpenAI/OpenCLIP, no a esta conversión ONNX, y no se reproducen aquí para no atribuir cifras no verificadas al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 0,6 GB en precisión simple y alrededor de 0,3 GB en precisión media para un modelo de este tamaño, con 2-4 GB de margen recomendado si se procesan lotes grandes o si el repositorio contiene varias exportaciones (estimación orientativa a partir del tamaño del modelo; el autor no publica cifras).
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria, desde una GTX 1650 o RTX 3060 hasta una RTX 4090, A100 o H100; en estas últimas el modelo queda muy sobredimensionado y se aprovecharía mejor mediante procesamiento por lotes masivo.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier tarjeta con 4 GB o más, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), el contenedor de machine learning de Immich, y OpenCLIP para cargar los pesos originales. No aplican vLLM, TGI ni llama.cpp, ya que son servidores para modelos generativos y este modelo solo produce embeddings.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa no medida, un modelo de aproximadamente 150 M de parámetros suele resolverse en el orden de milisegundos por imagen en GPU y de decenas de milisegundos por imagen en CPU, con mejora casi lineal al aumentar el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eneratum/ViT-B-32__openai (este repositorio) | ONNX | no disponible en la model card (la referencia CLIP ViT-B/32 ronda los 151 M) | 77 tokens según la implementación de referencia | no disponible | Público en HuggingFace; 0 descargas y 0 likes; repo de 2,7 GB |
| immich-app/ViT-B-32__openai | ONNX | no disponible; mismos pesos de CLIP ViT-B/32 | igual que el anterior | no disponible | Repositorio de referencia para Immich, localizado en la búsqueda web |
| Exportaciones mayores de OpenCLIP (por ejemplo, variantes ViT-L/14) | safetensors y ONNX según la exportación | no disponible en la información proporcionada | no disponible | no disponible | Públicas en el ecosistema OpenCLIP, con mayor coste de cómputo y memoria |

La comparación cuantitativa de rendimiento no está disponible: este repositorio no aporta métricas propias y, al contener los mismos pesos de CLIP ViT-B/32 que otras exportaciones, no cabe esperar diferencias de calidad respecto a ellas, solo diferencias de formato y de integración.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código, imágenes ni respuestas conversacionales; solo vectores de embedding.
- No permite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de falsos positivos en similitud: las puntuaciones de CLIP no están calibradas como probabilidades y pueden asociar términos de forma espuria, especialmente con prompts ambiguos o metafóricos.
- Los embeddings de CLIP heredan sesgos sociales y de género presentes en datos web no curados; la model card de este repositorio no documenta ninguna evaluación de sesgo.
- Limitación idiomática: los prompts en castellano pueden rendir peor que en inglés, ya que el codificador de texto se entrena mayoritariamente con texto en inglés; el autor no documenta idiomas soportados.
- Sensibilidad al prompt: los resultados dependen de la plantilla utilizada ("una foto de X" frente a "X"), por lo que requiere ajuste de prompts por caso de uso.
- Ventana de texto corta: la implementación de referencia limita la secuencia textual a 77 tokens, insuficiente para descripciones largas o consultas conversacionales.
- Licencia no declarada en el repositorio: antes de un uso comercial es imprescindible verificar la licencia del checkpoint original de OpenAI/OpenCLIP, ya que la ficha de HuggingFace no la especifica.
- Repositorio sin señales de mantenimiento: 0 descargas, 0 likes, sin pipeline declarado y con fechas de creación y actualización idénticas (2026-09-25), lo que sugiere un espejo puntual y no un proyecto con soporte.
- Ausencia total de evaluaciones publicadas para esta exportación concreta: no hay cifras de precisión, latencia ni consumo de memoria verificables.
- El tamaño de descarga (2,7 GB) es desproporcionado para un modelo de este tamaño en una única precisión, por lo que conviene inspeccionar el contenido del repositorio antes de integrarlo en un despliegue con restricciones de disco.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eneratum/ViT-B-32__openai
- Repositorio de referencia para Immich en HuggingFace: https://huggingface.co/immich-app/ViT-B-32__openai
- Model card del repositorio de referencia: https://huggingface.co/immich-app/ViT-B-32__openai/blob/main/README.md
- Repositorio de OpenCLIP: https://github.com/mlfoundations/open_clip
- Sitio oficial de Immich: https://immich.app/
- Ficha descriptiva de CLIP ViT-B/32 (terceros): https://exploreai.tools/ai-models/openai-clip-vit-b-32
- Ficha de modelo en PromptLayer: https://www.promptlayer.com/models/vit-b-32openai/
- Ficha agregada en toolify.ai: https://www.toolify.ai/ai-model/immich-app-vit-b-32-openai
