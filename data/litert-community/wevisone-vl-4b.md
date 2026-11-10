# litert-community/WeVisOne-VL-4B

## Resumen

WeVisOne-VL-4B es un modelo de visión y lenguaje desarrollado por WeChat Vision (Tencent) y publicado originalmente como `tencent/WeVisOne-VL-4B`. Está construido sobre la arquitectura Qwen3-VL y está especializado en tareas de percepción visual estructurada: detección de objetos, comprensión de expresiones referenciales, point grounding, conteo de objetos y OCR. En lugar de responder con lenguaje natural libre, devuelve las coordenadas de cajas y puntos como tokens numéricos `<0>` … `<1000>`, que representan milésimas del ancho y alto de la imagen.

La ficha que nos ocupa, `litert-community/WeVisOne-VL-4B`, no es el modelo original sino una conversión del mismo al formato LiteRT-LM, realizada con litert-torch 0.10.0 y orientada a inferencia en dispositivo (on-device), principalmente Android. El artefacto principal es un único fichero de 3,5 GB (`WeVisOne-VL-4B_int4.litertlm`) que empaqueta el codificador visual, el adaptador de visión, el embedder de tokens y el decodificador de 36 capas en un contenedor listo para ejecutarse con LiteRT-LM.

Su relevancia actual radica en que permite ejecutar un modelo visión-lenguaje de 4B parámetros en hardware móvil con aceleración GPU, manteniendo —según el autor de la conversión— la misma calidad de respuesta que el modelo original en float32 sobre un conjunto de 21 preguntas de prueba. La cuantización agresiva (int4 en el decodificador, int8 en el embedder, float16 en el codificador visual) es la clave para que quepa en un dispositivo de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con codificador visual y adaptador (basado en Qwen3-VL) |
| Parametros totales | 4.830.581.248 (4,83B, según el recuento de valores del release bfloat16 del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (prompt + respuesta, configurado en el fichero LiteRT-LM) |
| Tipos de cuantizacion | int4 en decodificador de 36 capas y capa de salida (bloques de 32 valores, una escala por bloque); int8 en el token embedder; float16 en codificador visual y adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base ofrece float32 y bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un visión-lenguaje construido sobre Qwen3-VL. La conversión a LiteRT-LM conserva el codificador visual, el adaptador de visión, el token embedder y un decodificador de 36 capas. El fichero `.litertlm` declara el tipo de modelo `fast_vlm` de LiteRT-LM, lo que indica que está configurado para procesar una sola imagen por inferencia. Las activaciones del decodificador se declaran en float32, de modo que LiteRT-LM 0.19.1 ejecuta el decodificador en float32 sobre GPU (mediante `MaybeOverrideActivationType` en `runtime/engine/engine_settings.cc`) y el codificador visual también en float32 por defecto.

La conversión partió del release float32 del repositorio original (revisión `4a7bed92`). El release actual del modelo base (revisión `6b44a458`, del 27 de octubre de 2026) contiene los mismos pesos en bfloat16, con cada uno de los 4.830.581.248 valores verificado como el redondeo del valor float32 correspondiente. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos detalles corresponden a la model card del modelo original, que no se ha proporcionado. La innovación técnica destacable de esta ficha es la propia conversión: un pipeline de cuantización mixta (int4/int8/float16) que preserva la calidad del original en las pruebas realizadas.

## Capacidades

- Detección de objetos: devuelve cajas delimitadoras como tokens de coordenadas `<0>` … `<1000>` (milésimas del ancho y alto de la imagen).
- Comprensión de expresiones referenciales (referring expression comprehension): localiza instancias descritas mediante una frase.
- Point grounding: señala puntos concretos de la imagen para una etiqueta dada.
- Conteo de objetos: con cajas o con puntos, según la plantilla de prompt empleada.
- OCR: detección de palabras en formato de caja; también localización de un texto concreto en la imagen.
- Salida estructurada en texto: las coordenadas se emiten como tokens numéricos, lo que facilita el parseo programático.
- Procesamiento de una única imagen por inferencia (tipo `fast_vlm`).
- No realiza segmentación ni matting: el fichero no incluye el decodificador de píxeles de 9,6M de parámetros del modelo original, por lo que las peticiones de segmentación solo devuelven la caja.
- No se ha verificado el soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en la información disponible.

## Casos de uso

- Detección de objetos en apps móviles de realidad aumentada: la app captura una imagen, la redimensiona a 512 × 512 y consulta al modelo con la plantilla de detección; las cajas devueltas como tokens `<0>` … `<1000>` se mapean de vuelta a las dimensiones de la imagen original. Adecuado por su tamaño (3,5 GB) y su ejecución on-device con GPU.
- Conteo automático en inventarios o control de stock: con la plantilla "How many {objects} in the image? Please count them with boxes." el modelo devuelve el número de instancias junto con sus cajas, lo que permite verificaciones cruzadas entre el conteo y las detecciones.
- Accesibilidad para personas con discapacidad visual: localización de objetos descritos por el usuario ("the airplane", "the man on the left") mediante referring expression comprehension, con respuesta de coordenadas que la app puede convertir en indicaciones de voz.
- Digitalización de documentos y cartelería: la plantilla de OCR ("detect all the word in the box format") permite extraer palabras y sus posiciones de una imagen, útil para escanear recibos, señales o etiquetas desde el móvil.
- Localización de texto concreto en imágenes: con "Locate the following text in the image: {text}" se puede buscar una palabra o frase específica (por ejemplo, "OVERSIZE LOAD") y obtener su caja, útil en apps de traducción o lectura aumentada.
- Anotación asistida de datasets: point grounding y detección con cajas permiten preanotar imágenes para entrenar otros modelos de visión, acelerando el etiquetado manual.
- Automatización de inspección visual en campo: un técnico fotografía una instalación y el modelo localiza los elementos indicados por etiqueta, sin necesidad de conexión a un servidor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Prefill del primer token (imagen 512 × 512, Galaxy S26 GPU) | 4,86 s |
| Velocidad de decodificación | 15,2 tokens/s |
| Calidad frente al original float32 (21 preguntas: 11 con imagen, 10 solo texto) | misma puntuación |
| Memoria de caché generada en el primer proceso | ~0,46 GB (436.314.752 bytes del adaptador de visión vía XNNPACK + 24.204.112 bytes de programas GPU) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores proceden de la model card de la conversión y se midieron con LiteRT-LM v0.19.1 compilado para `android_arm64` sobre un Galaxy S26 con backend GPU.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero del modelo ocupa 3.507.874.304 bytes (~3,5 GB); la caché adicional del primer proceso ronda los 0,46 GB.
- GPU recomendadas: los datos publicados corresponden a un Galaxy S26 con GPU móvil; no se han probado ejecuciones en escritorio con LiteRT-LM 0.19.1.
- Cabe en GPU de consumo: no hay datos publicados sobre RTX 4090, A100 u H100 para este formato; el objetivo declarado es on-device (Android).
- Opciones de despliegue: LiteRT-LM (v0.19.1 o superior), con el binario `litert_lm_advanced_main` compilado para `android_arm64` y las librerías `prebuilt/android_arm64` en `LD_LIBRARY_PATH`.
- Latencia y throughput: 4,86 s hasta el primer token y 15,2 tokens/s de decodificación en el Galaxy S26 citado; el autor indica que la velocidad sigue en optimización.
- Preprocesado obligatorio: enderezar la imagen según la orientación EXIF y redimensionarla a 512 × 512 con filtro BICUBIC de Pillow, sin padding ni recorte, y enviarla como PNG.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| WeVisOne-VL-4B (LiteRT-LM, esta ficha) | 4,83B | 2.048 tokens | `.litertlm` (int4/int8/float16) | Apache 2.0 | On-device, tareas visuales estructuradas |
| tencent/WeVisOne-VL-4B (original) | 4,83B | no disponible | float32 / bfloat16 | Apache 2.0 | Servidor/escritorio, incluye decodificador de píxeles para segmentación |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la comparación más directa es con el modelo base original, del que esta ficha es una conversión cuantizada.

## Limitaciones y advertencias

- No realiza segmentación ni matting: el decodificador de píxeles de 9,6M de parámetros del modelo original no está incluido; las peticiones de segmentación solo devuelven la caja.
- Contexto limitado a 2.048 tokens para prompt y respuesta, insuficiente para conversaciones multi-turno largas o imágenes múltiples.
- Procesa una sola imagen por inferencia (tipo `fast_vlm`).
- El preprocesado es estricto: la imagen debe enderezarse según EXIF y redimensionarse a 512 × 512 con BICUBIC sin padding ni recorte; otros redimensionados no se han probado.
- Las plantillas de prompt son fijas y provienen del paquete original (`build_prompt`); las preguntas libres sobre una imagen no se han probado.
- Solo se han publicado mediciones en un Galaxy S26 con LiteRT-LM 0.19.1 compilado para `android_arm64`; las ejecuciones en escritorio no se han probado.
- La velocidad de inferencia está en optimización según el autor.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura de idiomas en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/litert-community/WeVisOne-VL-4B
- Modelo base original: https://huggingface.co/tencent/WeVisOne-VL-4B
- Revisión float32 del modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B/tree/4a7bed92750ac9d8b8a124cede14759036932dc2
- Revisión bfloat16 del modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B/tree/6b44a45873b4bbc7dca383922504430dc60eca23
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Paquete de inferencia del modelo original (GitHub): https://github.com/Tencent/WeVisOne-VL
