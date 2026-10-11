# jaichang/embeddinggemma2-korean-birds-620-litert

## Resumen

`jaichang/embeddinggemma2-korean-birds-620-litert` es un paquete de codificadores multimodales ligeros para identificar 620 especies de aves coreanas en el propio dispositivo. No es un modelo generativo: contiene redes de destilación de conocimiento entrenadas para regresar directamente las coordenadas de embedding de 768 dimensiones, con normalización L2, del modelo profesor EmbeddingGemma 2 (740M), junto con índices vectoriales binarios precalculados y un catálogo enciclopédico.

El repositorio distribuye dos niveles de fidelidad. El nivel destilado incluye un codificador de imagen basado en MobileNetV3-Small (9,24 MB) y un codificador de audio basado en una ConvNet espectral multiescala 1D (14,70 MB), ambos en formato ONNX. El nivel sin destilar extrae sub-torres del modelo original (`Gemma4Vision` transformer y `Gemma4Audio` Conformer) cuantizadas a INT8, de 22,38 MB y 30,90 MB respectivamente, en ONNX y `.tflite`.

Su relevancia es de ingeniería de despliegue: permite inferencia 100 % en cliente, sin servidor, en Flutter móvil (Android/iOS mediante `tflite_flutter`) y Flutter Web (WebGPU, WebGL o WASM mediante `onnxruntime-web`), con un peso total de repositorio de 0,3 GB y licencia CC BY-SA 4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estudiantes destilados: `MobileNetV3-Small` con proyección L2 de 768 dimensiones (visión) y ConvNet espectral multiescala 1D con proyección L2 de 768 dimensiones (audio). Torres sin destilar: `Gemma4Vision` (transformer) y `Gemma4Audio` (Conformer) |
| Parametros totales | No disponible. El modelo profesor `jaichang/embeddinggemma2-korean-birds-620` tiene 740M de parámetros; los estudiantes destilados no declaran recuento de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de embeddings, no generativo). Entradas fijas: imagen `float32[1, 3, 160, 160]` en rango `[-1, 1]`; audio `float32[1, 80000]` (5 s a 16 kHz) |
| Tipos de cuantizacion | INT8 en las torres sin destilar (`.onnx` y `.tflite`); los estudiantes destilados se distribuyen en precisión nativa (float32) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.onnx` (ONNX Runtime), `.tflite` (LiteRT), `.f32` (índices vectoriales binarios Float32) y `model.safetensors` para el modelo base |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo emplea destilación de conocimiento para transferir el espacio de embeddings de 768 dimensiones del profesor EmbeddingGemma 2 (740M) a redes estudiantes compactas. La pérdida combina Cosine con InfoNCE, de modo que el estudiante aprende a regresar las coordenadas exactas del embedding normalizado L2 del profesor, no solo la identidad de la clase. Las dos ramas son independientes: la de visión usa MobileNetV3-Small como backbone y la de audio una ConvNet espectral multiescala 1D que procesa 5 segundos de audio a 16 kHz.

Además de los estudiantes destilados, el repositorio publica las sub-torres originales del profesor ya afinadas y cuantizadas a INT8: la torre de visión `Gemma4Vision` (transformer) y la torre de audio `Gemma4Audio` (Conformer). Esto ofrece una vía de mayor fidelidad a costa de más tamaño y de necesitar runtime de ONNX con SIMD WASM o LiteRT en móvil. Los detalles concretos del dataset de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no están disponibles en la información proporcionada; el dominio declarado son 620 especies de aves coreanas.

## Capacidades

- Generación de embeddings multimodales de 768 dimensiones con normalización L2, tanto para imagen como para audio.
- Codificación de imágenes RGB de 160x160 píxeles preprocesadas al rango `[-1, 1]`.
- Codificación de audio de 5 segundos a 16 kHz (80.000 muestras) capturado en campo.
- Búsqueda por similitud coseno sobre índices vectoriales precalculados de 620 especies de aves coreanas.
- Recuperación cruzada entre modalidades mediante los índices `korean_620_birds_photo_index.f32` y `korean_620_birds_audio_index.f32`.
- Acceso a metadatos offline en coreano, inglés y nombre científico mediante `korean_620_birds_catalog.json`.
- Ejecución en navegador con WebGPU, WebGL o WASM, con degradación progresiva del backend.
- Ejecución en Android e iOS mediante LiteRT y `tflite_flutter`.
- Capacidades multilingües limitadas a inglés y coreano en los metadatos del catálogo.
- No dispone de generación de texto, razonamiento multietapa, tool calling, function calling, agentes ni modo de pensamiento; es exclusivamente un codificador de recuperación.

## Casos de uso

- Identificación de aves en campo sin cobertura: una aplicación Flutter móvil carga el codificador de audio (14,70 MB) y el índice `.f32` (1,8 MB) para clasificar el canto grabado frente a las 620 especies, sin conexión ni servidor.
- Guía de campo con reconocimiento fotográfico: el codificador de visión destilado (9,24 MB) procesa la foto a 160x160 y devuelve la especie por similitud coseno contra el índice fotográfico, con latencia adecuada para interacción en tiempo real en gama media.
- Aplicación web progresiva de observación de aves: usando el backend WebGPU de `onnxruntime-web`, el modelo se ejecuta en el navegador sin subir imágenes ni audio del usuario a ningún servidor, lo que simplifica el cumplimiento de privacidad.
- Clasificación por lotes para investigación ornitológica: los índices precalculados y el catálogo JSON permiten montar un pipeline Python con ONNX Runtime que etiquete grandes volúmenes de grabaciones o fotografías para estudios de distribución.
- Filtrado previo de datos en plataformas de ciencia ciudadana: el modelo sirve como primera pasada automática para sugerir especie candidata antes de la validación humana, reduciendo la carga de moderación.
- Módulo embebido en dispositivos de campo de bajo consumo: los ficheros `.tflite` de 9,24 MB y 14,70 MB son compatibles con aceleración LiteRT en Android e iOS, lo que permite integrarlos en estaciones de monitorización acústica autónomas.
- Sistema educativo bilingüe coreano-inglés: el catálogo incluye nombres coreanos, ingleses y científicos, de modo que la aplicación puede mostrar la ficha de la especie detectada con descripciones y enlaces multimedia.

## Benchmarks y rendimiento

Los datos publicados corresponden a precisión de recuperación frente al espacio de embeddings del profesor, no a benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible para esas suites.

| Variante | Backbone | Entrada | Tamano | Precisión Top-1 (frente al profesor) | Similitud coseno media |
|---|---|---|---|---|---|
| `embeddinggemma2_vision_768d.onnx` | MobileNetV3-Small + proyección L2 768-d (destilado) | `float32[1, 3, 160, 160]` | 9,24 MB | 100,0 % | 0,8841 |
| `embeddinggemma2_audio_768d.onnx` | ConvNet espectral multiescala 1D + proyección L2 768-d (destilado) | `float32[1, 80000]` | 14,70 MB | 99,1 % | 0,9086 |
| `embeddinggemma2_undistilled_vision_int8.onnx` / `.tflite` | `Gemma4Vision` transformer INT8 | `float32[1, 3, 160, 160]` | 22,38 MB | 93,5 % (100 % en el conjunto de campo) | No disponible |
| `embeddinggemma2_undistilled_audio_int8.onnx` / `.tflite` | `Gemma4Audio` Conformer INT8 | `float32[1, 80000]` | 30,90 MB | 100,0 % en el conjunto de campo de audio | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de uso principal, ya que el modelo está pensado para ejecución en CPU móvil, NPU ligera o WebGPU. Los ficheros van de 9,24 MB a 30,90 MB, más 1,8 MB por índice y el tamaño del catálogo JSON.
- GPU recomendadas: no requiere GPU de datacenter. En escritorio o portátil basta cualquier GPU integrada o dedicada para el backend ONNX; en navegador se recomienda WebGPU con fallback a WebGL o WASM SIMD.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo y en la práctica no necesita una; el cuello de botella es el runtime del navegador o del dispositivo, no la memoria de vídeo.
- Opciones de despliegue: LiteRT y `tflite_flutter` en Android e iOS; `onnxruntime-web` con WebGPU, WebGL o WASM en navegador; ONNX Runtime en Python para procesamiento por lotes; `o`ntitles`.

Corrección de la última viñeta:

- Opciones de despliegue: LiteRT y `tflite_flutter` en Android e iOS; `onnxruntime-web` con WebGPU, WebGL o WASM en navegador; ONNX Runtime en Python para procesamiento por lotes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jaichang/embeddinggemma2-korean-birds-620-litert` | Codificador multimodal destilado (visión + audio) | No disponible (profesor de 740M) | Imagen 160x160; audio 5 s a 16 kHz | en, ko | CC BY-SA 4.0 | HuggingFace, 2 descargas, 0 likes |
| `jaichang/embeddinggemma2-korean-birds-620` (profesor) | Modelo de embeddings completo | 740M | No disponible | en, ko | No disponible en la información | HuggingFace |
| `google/embeddinggemma-2` | Modelo de embeddings multimodal de propósito general | No disponible | No disponible | No disponible | No disponible | HuggingFace, con soporte en vLLM, Transformers, sentence-transformers, SGLang, MLX, Ollama, LMStudio y LiteRT |

No se conocen alternativas públicas comparables específicas para identificación de aves coreanas en dispositivo; ese nicho no está cubierto por modelos genéricos de embeddings de propósito general, que además tienen un coste de despliegue muy superior.

## Limitaciones y advertencias

- Dominio cerrado: el índice cubre 620 especies de aves coreanas. Cualquier entrada fuera de ese conjunto se forzará al vecino más próximo del índice, produciendo falsos positivos sin señal de rechazo.
- No es un modelo generativo: no puede producir texto, razonar en varios pasos, invocar herramientas ni actuar como agente. Cualquier descripción de especie debe provenir del catálogo JSON.
- Riesgo de error por similitud: al funcionar por similitud coseno sobre un índice plano, especies visual o acústicamente parecidas pueden confundirse. No se documentan umbrales de decisión ni métricas de calibración.
- Idiomas: solo inglés y coreano en los metadatos. No hay soporte de castellano ni de otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia. Esto puede ser incompatible con productos propietarios que no quieran liberar sus derivados.
- Rendimiento real dependiente del preprocesado: los tensores de entrada exigen formas y rangos exactos. En la documentación conviven dos convenciones de normalización (`[0, 1]` en el ejemplo Python y `[-1, 1]` en la tabla de arquitecturas) para la rama de visión, lo que puede degradar la precisión si no se verifica empíricamente.
- La información sobre el dataset de entrenamiento, los sesgos y las condiciones de captura del conjunto de campo no está disponible.
- Adopción muy baja: 2 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jaichang/embeddinggemma2-korean-birds-620-litert
- Modelo base (profesor de 740M): https://huggingface.co/jaichang/embeddinggemma2-korean-birds-620
- EmbeddingGemma 2 de Google: https://huggingface.co/google/embeddinggemma-2
- Documentación de la API de Gemini Embedding 2: https://ai.google.dev/gemini-api/docs/models/gemini-embedding-2
- Guía para desarrolladores de EmbeddingGemma 2 (Google Developers Blog): https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/
- Página de EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
