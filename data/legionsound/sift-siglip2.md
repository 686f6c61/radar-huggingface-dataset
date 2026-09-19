# legionsound/sift-siglip2

## Resumen

sift-siglip2 es una conversión a Core ML del modelo multimodal de embeddings `google/siglip2-so400m-patch14-384`, publicada por el desarrollador legionsound para la aplicación Sift, una app local de gestión de fototeca. El repositorio no contiene pesos originales ni un modelo entrenado desde cero: es una redistribución del modelo SigLIP 2 de Google, fijado a la revisión `e8e487298228002f3d8a82e0cd5c8ea9c567f57f` y convertido a formato Core ML para su ejecución en Apple Silicon dentro del ecosistema macOS 15.

El paquete se distribuye como dos torres independientes —una de visión y otra de texto— que producen un vector de 1152 dimensiones en el mismo espacio de embeddings. La torre de visión acepta tensores `pixel_values` de forma [1, 3, 384, 384] y la torre de texto acepta `input_ids` y `attention_mask` con longitud fija de 64 tokens. Esto permite búsqueda semántica imagen-texto totalmente local, sin enviar datos a la nube, que es exactamente el caso de uso que motiva la publicación.

La relevancia del repositorio es doble. Por un lado, es una de las pocas conversiones públicas a Core ML de un SigLIP 2 de tamaño so400m, lo que facilita a desarrolladores de apps para macOS e iOS desplegar recuperación multimodal en dispositivo sin depender de PyTorch. Por otro lado, el autor documenta de forma inusualmente explícita el proceso de validación de la conversión, incluyendo el fallo del gate en fp16 y la reimplementación manual de la cabeza de attention pooling. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos torres (visión y texto) tipo SigLIP 2; vision encoder SoViT según el nombre del modelo upstream (`so400m-patch14-384`), patch 14, resolución 384. Cabeza de attention pooling reimplementada con matmul/softmax explícitos |
| Parámetros totales | no disponible (el autor no publica recuento; el nombre del upstream indica un vision encoder de la familia SoViT-400m) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (forma fija `[1, 64]` en la torre de texto); la torre de visión trabaja con una única imagen de 384×384 |
| Tipos de cuantización | Solo fp32. La conversión a fp16 se intentó pero falló el gate de validación (0,998943 < 0,999) y no se publicó. No hay GGUF, ONNX ni INT8 |
| Idiomas soportados | no disponible (la model card no documenta cobertura de idiomas; el text tower usa el tokenizador de Gemma, lo que permite entradas multilingües, pero no se especifica alcance) |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | Core ML `.mlpackage`, distribuido comprimido como `.zip`: `sift-siglip2-image.mlpackage.zip` y `sift-siglip2-text.mlpackage.zip` |
| Dimensión del embedding | 1152 (ambas torres, salida pooled y proyectada) |
| Normalización L2 | no incluida; el autor indica que es responsabilidad del llamador |
| Librería / runtime | Core ML, objetivo macOS 15 |
| Herramientas de conversión | transformers 4.57.1, torch 2.7.0, coremltools 9.0 |

## Arquitectura y entrenamiento

No hay entrenamiento propio en este repositorio: los pesos proceden íntegramente del modelo `google/siglip2-so400m-patch14-384` en su revisión fijada, y se redistribuyen bajo Apache-2.0. SigLIP 2 es la segunda generación de la familia SigLIP, con arquitectura de dos torres y objetivo de aprendizaje contrastivo imagen-texto tipo sigmoid loss, en la que cada par imagen-texto se evalúa de forma independiente en lugar de normalizar sobre el lote completo. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo upstream.

La innovación técnica relevante aquí es la del proceso de conversión, no la del modelo. La cabeza de attention pooling de la torre de visión utiliza internamente un envoltorio `nn.MultiheadAttention` que coremltools no convierte correctamente, por lo que el autor la reimplementó con operaciones explícitas de matmul y softmax manteniendo los mismos pesos. Para verificar que esa reimplementación es fiel, se definió un gate determinista: comparar el coseno entre la salida Core ML y la salida del modelo PyTorch upstream sin modificar, sobre 8 muestras sintéticas fijas (4 de imagen y 4 de texto). El umbral exigido es coseno ≥ 0,999 en todas las muestras. En fp32 el peor coseno obtenido es 1,000000 en las 8 muestras; en fp16 el peor coseno cae a 0,998943 en una muestra sintética de alto contraste, motivo por el que la variante fp16 no se publicó.

## Capacidades

- Generación de embeddings de imagen: la torre de visión transforma una imagen RGB de 384×384 en un vector de 1152 dimensiones.
- Generación de embeddings de texto: la torre de texto transforma una secuencia de hasta 64 tokens en un vector de 1152 dimensiones en el mismo espacio latente.
- Recuperación multimodal cruzada: búsqueda de imágenes a partir de una consulta en lenguaje natural y viceversa, mediante similitud coseno entre embeddings.
- Clasificación zero-shot: al comparar el embedding de una imagen con embeddings de etiquetas de texto se pueden asignar categorías sin entrenamiento adicional.
- Deduplicación y agrupamiento visual: los embeddings permiten detectar imágenes casi idénticas o agrupar por similitud semántica.
- Ejecución local en Apple Silicon: al ser un paquete Core ML, la inferencia puede repartirse entre CPU, GPU y Neural Engine sin acceso a red.
- No soporta generación de texto. No es un modelo de lenguaje: solo produce representaciones vectoriales.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades especiales (thinking mode, visión generativa, audio, vídeo): no disponibles.

## Casos de uso

- Búsqueda semántica en una fototeca local: el usuario escribe "atardecer en la playa con gente" y la app compara ese embedding con los de las imágenes indexadas. Es el caso de uso para el que se publicó el modelo dentro de Sift, y funciona íntegramente en el dispositivo.
- Indexado por lotes en segundo plano: la torre de visión en fp32 procesa imágenes de 384×384 de una en una, lo que permite indexar bibliotecas grandes por etapas usando el Neural Engine mientras el equipo está inactivo.
- Etiquetado automático y organización de álbumes: comparando cada imagen contra un conjunto fijo de etiquetas textuales se pueden crear álbumes temáticos (comida, documentos, mascotas) sin etiquetado manual.
- Deduplicación y limpieza de bibliotecas: agrupando por similitud coseno se detectan ráfagas, duplicados y variantes recortadas de la misma fotografía.
- Filtrado de contenido antes de compartir: clasificación zero-shot de imágenes sensibles en un pipeline local, sin enviar material del usuario a servidores externos.
- Filtros de edición asistidos por lenguaje natural: la app puede sugerir qué fotos encajan con una descripción textual para aplicarles un tratamiento concreto.
- Recomendación de contenido dentro de una app de medios: los embeddings sirven para construir un sistema de similitud "más como esto" sin modelo adicional.
- Prototipado de recuperación multimodal en Mac: útil para investigadores que quieran validar hipótesis de retrieval sobre SigLIP 2 en hardware de sobremesa antes de pasar a un clúster con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estándar (ImageNet zero-shot, COCO retrieval, MMLU, etc.) en la información disponible. El único dato de rendimiento publicado en el repositorio es el gate de validación de la conversión:

| Conjunto de validación | Precisión | Peor coseno vs. modelo PyTorch upstream | Resultado |
|---|---|---|---|
| 8 muestras sintéticas fijas (4 imágenes, 4 textos) | fp32 | 1,000000 | PASS (publicado) |
| 8 muestras sintéticas fijas (4 imágenes, 4 textos) | fp16 | 0,998943 | FAIL (no publicado) |

El autor indica que las cifras completas están en el archivo `validation.json` del repositorio. No se proporcionan datos de latencia ni de throughput. Las muestras de validación son sintéticas (gradientes y formas con semilla fija), no fotografías reales.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Core ML. El objetivo de compilación declarado es macOS 15; no se menciona compatibilidad con iOS, iPadOS ni visionOS.
- No se publican requisitos de VRAM ni de memoria unificada. Como referencia orientativa no verificada, un modelo de la familia so400m en fp32 ocupa del orden de 1,6 GB solo en la torre de visión; a esto habría que sumar el peso de la torre de texto, del que no se da cifra. Toda cifra de memoria debe considerarse estimación, no dato del autor.
- GPU compatibles: no se listan. Al ser un paquete Core ML, la ejecución se delega al runtime de Apple (CPU, GPU integrada o Neural Engine). No se documenta el uso de CUDA, A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon, siempre que se disponga de memoria unificada suficiente para ambos paquetes en fp32.
- Opciones de despliegue: Core ML de forma nativa. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni Text Generation Inference, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.
- Integridad de los artefactos: el descargador de Sift verifica el sha256 antes de descomprimir. Los hashes publicados son `5e02663ffa0366b564e664f5851c6f7ecebf3c6a1651f91350ac8473721ca29c` (imagen) y `85f04ee4c3f1e9c27c521a009fdfc7d83779ea9702c42a6d7e44869353afdd1e` (texto).

## Comparativa con modelos similares

| Modelo | Formato / runtime | Torres incluidas | Contexto de texto | Dimensión de embedding | Licencia |
|---|---|---|---|---|---|
| legionsound/sift-siglip2 | Core ML (`.mlpackage`, fp32) para Apple Silicon | Visión y texto | 64 tokens | 1152 | Apache-2.0 |
| google/siglip2-so400m-patch14-384 (upstream) | PyTorch (safetensors), ejecutable en CPU/GPU CUDA | Visión y texto | no disponible en esta búsqueda | 1152 | Apache-2.0 |
| Otras variantes de la familia SigLIP 2 (base, large, giant) | PyTorch | Visión y texto | no disponible | varía según variante | Apache-2.0 (según familia) |
| openai/clip-vit-large-patch14 | PyTorch | Visión y texto | 77 tokens (dato público del modelo original, no verificado en esta búsqueda) | 768 (dato público del modelo original, no verificado en esta búsqueda) | MIT (según el modelo original) |

La diferencia funcional clave frente al upstream es el runtime: la versión de legionsound sacrifica portabilidad (solo Core ML, solo macOS 15 en adelante, solo fp32) a cambio de ejecución local en dispositivo dentro de una app nativa de Apple. Frente a CLIP ViT-L/14, el modelo de este repositorio ofrece una dimensión de embedding mayor y una ventana de texto más corta. No se dispone de datos comparativos de calidad de recuperación entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo. Solo produce embeddings; cualquier expectativa de generación de texto, subtítulos o diálogo queda fuera de su alcance.
- Ventana de texto muy corta: 64 tokens. Consultas largas, frases con muchas cláusulas o prompts con instrucciones detalladas se truncarán. El autor recomienda `return_attention_mask=True`, lo que implica que existe padding y que el truncado es real.
- Solo se distribuye fp32. La variante fp16 se descartó porque no superó el gate de fidelidad, por lo que el consumo de memoria y el tiempo de carga serán mayores de lo que sería habitual en un despliegue móvil.
- La normalización L2 de los vectores no está incluida. Si el consumidor no la aplica explícitamente, las similitudes coseno entre embeddings serán incorrectas.
- Validación limitada: el gate se ejecutó sobre 8 muestras sintéticas, no sobre fotografías reales. El propio autor lo señala en la model card. No hay garantía publicada sobre el comportamiento en dominios fotográficos reales.
- Dependencia de plataforma: Core ML y objetivo macOS 15. No hay conversiones publicadas para CUDA, ROCm, Linux ni navegador.
- Idiomas y sesgos: no se documenta cobertura lingüística ni análisis de sesgo. Al heredar los pesos del upstream, arrastra los sesgos de sus datos de entrenamiento, que no se detallan en la información disponible.
- Riesgo de alucinación en el sentido de falsos positivos de recuperación: un sistema de búsqueda basado en similitud coseno siempre devolverá los vecinos más cercanos aunque ninguno sea relevante. Hace falta un umbral de corte definido por la aplicación.
- Repositorio con 0 descargas y 0 likes, sin pipeline declarado y sin historial de mantenimiento. La fecha de creación registrada es 2026-09-18 y la última actualización 2026-09-18, apenas un minuto después, lo que sugiere una publicación única sin iteraciones posteriores.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y el archivo NOTICE si existe, y no concede derechos de marca sobre "Sift", "Google" ni "SigLIP".
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo; todas las fuentes recuperadas tratan sobre servicios de streaming de música y no son pertinentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/legionsound/sift-siglip2
- Modelo upstream: https://huggingface.co/google/siglip2-so400m-patch14-384
- Aplicación Sift (legion-media): https://github.com/legion-media
- Archivo de validación citado por el autor: `validation.json` dentro del repositorio de HuggingFace
- Enlaces a papers, blogs o demos adicionales: no disponibles en la información proporcionada
