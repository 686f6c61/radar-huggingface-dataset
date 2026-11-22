# moeshawky/qwen3-embedding-0.6b-vl

## Resumen

Qwen3-Embedding-0.6B-VL es un modelo de embeddings multimodales publicado por el usuario moeshawky en Hugging Face. Se trata de un *merge* de dos modelos preentrenados: el codificador de texto Qwen3-Embedding-0.6B (Qwen) y el codificador visual SigLIP2-so400m-patch16-naflex (Google). El resultado es un único conjunto de pesos que proyecta texto e imagen a un mismo espacio de embeddings compartido de 1024 dimensiones, normalizado en L2, de modo que la similitud entre una frase y una imagen se calcula con un simple producto escalar, sin re-proyecciones ni puntuaciones específicas por modalidad.

La relevancia del modelo radica en su planteamiento de "injerto" (graft): ambas ramas se mantienen congeladas y bit a bit idénticas a sus modelos padre, y solo se entrena un conector, `vision_projection`, de 1.180.672 parámetros (el 0,12% del total). Esto permite reutilizar dos expertos preentrenados de forma eficiente y obtener un modelo de recuperación multimodal con licencia Apache 2.0, algo poco habitual en este segmento.

El modelo suma 1.025.894.848 parámetros en total (1,026 B), con una ventana de posición de 32.768 tokens y salida de embeddings de 1024 dimensiones. Está pensado para tareas de *feature-extraction* y *sentence-similarity* multimodal, con backends de inferencia separados para vLLM y GGML nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: rama de texto `Qwen3ForCausalLM` (28 capas, full attention) + rama visual `siglip2_vision_model` (27 capas), unidas por un conector `vision_projection` (1152 → 1024) |
| Parametros totales | 1.025.894.848 (1,026 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 posiciones (`max_position_embeddings`); el tokenizador anuncia 131.072 pero el modelo solo soporta 32.768 |
| Tipos de cuantizacion | Q8_0 (GGUF, vía modelo intermedio de Gideon531); pesos publicados en F32; repo incluye safetensors, ONNX y GGUF |
| Idiomas soportados | No disponible (heredados de Qwen3-Embedding-0.6B, sin listado explícito en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32, 762 tensores), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo es un *merge* de dos arquitecturas preentrenadas. La rama de texto es Qwen3-Embedding-0.6B: 28 capas transformer con atención completa (sin ventana deslizante), hidden size 1024, intermediate size 3072, 16 cabezas de atención y 8 cabezas KV, dimensión de cabeza 128, vocabulario de 151.669 tokens y RoPE con theta 1.000.000. La rama visual es SigLIP2-so400m-patch16-naflex: 27 capas, anchura 1152, con soporte NaFlex para resoluciones variables. La rama de texto aporta 595.776.512 parámetros (58,07%) y la visual 427.888.064 (41,71%).

Ambas ramas se mantienen congeladas y bit a bit idénticas a sus padres; solo se entrena el conector `vision_projection`, una proyección lineal de 1152 a 1024 dimensiones con 1.180.672 parámetros. El dataset de entrenamiento declarado es `moeshawky/laion-qwen-siglip-pairs`. La rama de texto en FP32 se recuperó a partir de una cuantización Q8_0 intermedia (Gideon531/Qwen3-Embedding-0.6B-Q8_0-GGUF). No se documentan detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO para el conector. El pooling de texto se realiza en el índice del token terminador `<|endoftext|>` (151643), que el tokenizador añade a cada secuencia.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones, normalizados en L2, con pooling en el token terminador.
- Generación de embeddings de imagen de 1024 dimensiones en el mismo espacio compartido, comparables directamente con los de texto mediante producto escalar.
- Recuperación multimodal texto-imagen e imagen-texto sin re-proyección ni puntuaciones específicas por modalidad.
- Similitud semántica entre frases (sentence-similarity) dentro de la rama de texto.
- Soporte de imágenes de resolución variable mediante el mecanismo NaFlex de SigLIP2 (`pixel_attention_mask`, `spatial_shapes`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo *thinking*; el modelo es exclusivamente de extracción de características.

## Casos de uso

- Búsqueda semántica multimodal en catálogos de producto: indexar imágenes de productos y descripciones textuales en el mismo espacio de 1024 dimensiones, de modo que una consulta en lenguaje natural recupere directamente las imágenes relevantes con un único producto escalar.
- Moderación de contenido asistida: comparar captions o textos generados por usuarios contra imágenes asociadas para detectar desalineaciones semánticas, aprovechando que ambas modalidades comparten espacio y umbral de similitud.
- Sistemas de recomendación visual: calcular la similitud entre el embedding de una imagen consultada y un corpus de imágenes o descripciones para sugerir contenido relacionado, sin necesidad de un modelo de re-ranking específico por modalidad.
- Deduplicación y clustering de datasets multimodales: generar embeddings de pares imagen-texto de un corpus tipo LAION y agrupar o eliminar duplicados por proximidad en el espacio compartido, con soporte de lotes por el backend vLLM.
- Recuperación aumentada (RAG) sobre documentación con figuras: indexar texto e imágenes de manuales técnicos en una misma colección vectorial y recuperar ambos tipos de evidencia para un mismo prompt, manteniendo compatibilidad con colecciones existentes creadas a partir del GGUF Q8_0 previo.
- Búsqueda inversa imagen-a-texto en archivos multimedia: dado un fotograma o imagen, recuperar descripciones, titulares o metadatos textuales del archivo mediante similitud en el espacio común, útil en sistemas de gestión documental.
- Filtrado de pares imagen-texto para curación de datasets: puntuar la coherencia de pares caption-imagen antes de incluirlos en un corpus de entrenamiento, usando el producto escalar entre embeddings como señal de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos publicados en F32: 1.025.894.848 parámetros × 4 bytes ≈ 4,1 GB solo de pesos (el fichero de datos del safetensors mide 4.103.579.392 bytes).
- VRAM estimada para inferencia en F32: aproximadamente 6-8 GB contando pesos, activaciones y overhead del runtime de transformers.
- VRAM estimada en cuantización Q8_0 (GGUF): en torno a 1-2 GB, apta para GPU de consumo y CPU.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para F32 (RTX 3060 12 GB, RTX 4070, RTX 4090); para serving por lotes se recomienda A100 o H100. En Q8_0 cabe en GPUs de gama baja y en CPU.
- Cabe en GPU de consumo: sí, tanto en F32 (8 GB o más) como en Q8_0 (2 GB o más).
- Opciones de despliegue: transformers >= 5.18.0 con `trust_remote_code=True`; backend vLLM con servidor FastAPI y endpoints `/v1/embeddings` y `/embed/image` (repo `moeshawky/qwen3-embedding-0.6b-vl-inference`); binario nativo C++17 con GGML para CPU/CUDA (repo `moeshawky/qwen3-embedding-0.6b-vl-native`); formatos ONNX y GGUF incluidos en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moeshawky/qwen3-embedding-0.6b-vl | 1,026 B (0,6 B texto + 0,43 B visión + 0,0012 B conector) | 32.768 | Texto + imagen, espacio compartido 1024-d | Apache 2.0 | Hugging Face, backends vLLM y GGML |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | 32.768 | Solo texto | Apache 2.0 | Hugging Face |
| google/siglip2-so400m-patch16-naflex | 0,43 B | No disponible | Imagen + texto (pares) | No disponible en la información | Hugging Face |

El modelo combina en un único artefacto las capacidades de sus dos padres, a costa de un conector entrenado y de depender de `transformers>=5.18.0` con código remoto. Frente a alternativas multimodales de mayor tamaño no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- El modelo es un *merge* de dos ramas congeladas con un único conector entrenado; no ha habido un fine-tuning conjunto, por lo que la alineación entre modalidades depende exclusivamente de la calidad de `vision_projection` y del dataset de pares LAION utilizado.
- Solo se ha entrenado el 0,12% de los parámetros, lo que puede limitar la precisión en dominios muy alejados de la distribución de pares imagen-texto de entrenamiento.
- El tokenizador anuncia 131.072 posiciones, pero el modelo solo soporta 32.768; truncar a 131.072 elimina el token terminador y degrada los embeddings (coseno en torno a 0,37 según la model card).
- Pasar `add_special_tokens=False` elimina el terminador y degrada silenciosamente los embeddings; es un error fácil de cometer en producción.
- La rama de texto en FP32 se recuperó de una cuantización Q8_0 intermedia sin digest registrado, lo que introduce una pérdida de precisión respecto al padre original no cuantificado.
- No hay listado explícito de idiomas soportados ni resultados de benchmarks publicados.
- Riesgo de alucinación: no aplica directamente al ser un modelo de embeddings, pero la similitud en el espacio compartido puede producir falsos positivos en recuperación si los umbrales no se calibran por dominio.
- Sesgos: no documentados en la model card; al heredar de Qwen3 y SigLIP2, arrastra los sesgos de sus corpus de preentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos padre y del dataset LAION utilizado.
- Dependencia de `trust_remote_code=True` y de `transformers>=5.18.0`, lo que implica ejecutar código del repositorio y limita la compatibilidad con versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moeshawky/qwen3-embedding-0.6b-vl
- Modelo padre de texto: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Modelo padre visual: https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Dataset de entrenamiento: https://huggingface.co/datasets/moeshawky/laion-qwen-siglip-pairs
- Backend vLLM: https://github.com/moeshawky/qwen3-embedding-0.6b-vl-inference
- Backend nativo GGML: https://huggingface.co/moeshawky/qwen3-embedding-0.6b-vl-native
- GGUF Q8_0 intermedio: https://huggingface.co/Gideon531/Qwen3-Embedding-0.6B-Q8_0-GGUF
