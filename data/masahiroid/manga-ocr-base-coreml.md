# masahiroid/manga-ocr-base-coreml

## Resumen

manga-ocr-base-coreml es una conversión no oficial a Core ML del modelo kha-white/manga-ocr-base, un OCR japonés especializado en el reconocimiento de texto en bocadillos de manga. La conversión la mantiene el usuario masahiroid y su objetivo es permitir que el modelo se ejecute de forma nativa en iOS y macOS a través de Core ML, sin depender de PyTorch ni de un backend de servidor.

El modelo original emplea un esquema visión-encoder-decoder: un encoder ViT que procesa la imagen y un decoder BERT de solo 2 capas que genera texto de forma autorregresiva a nivel de carácter. Esa profundidad reducida permite que la conversión funcione con decodificación voraz y sin caché KV, lo que simplifica la implementación en dispositivos Apple y mantiene una velocidad práctica para secuencias cortas.

La relevancia de esta ficha radica en que traslada un OCR japonés de calidad a un formato desplegable en el propio dispositivo, con pesos en fp16 y un tamaño de repositorio de 0,3 GB. El modelo está publicado bajo licencia Apache 2.0, solo soporta japonés y no tiene descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder-decoder: encoder ViT + decoder BERT de 2 capas, autorregresivo a nivel de carácter |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible como contexto de texto; el decoder trabaja con longitudes de secuencia fijas de 32 o 64 tokens (caracteres) |
| Tipos de cuantizacion | fp16 (mlpackage). No se ofrecen otras cuantizaciones |
| Idiomas soportados | japonés (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (.mlpackage); el repositorio se compone únicamente de safetensors según las notas del autor |
| Entrada del encoder | imagen RGB fija de 224x224 |
| Tokenizador | BertJapaneseTokenizer a nivel de carácter, basado en cl-tohoku/bert-base-japanese-char-v2 |
| Tokens especiales | decoder_start_token_id = 2, eos_token_id = 3, pad_token_id = 0 |
| Tamaño del repositorio | 0,3 GB |
| Tamaño de los artefactos | encoder fp16 ≈ 164 MB; decoder seq32 fp16 ≈ 46 MB; decoder seq64 fp16 ≈ 46 MB |
| Modelo base | kha-white/manga-ocr-base |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

La arquitectura es un esquema visión-encoder-decoder. El encoder es un ViT con entrada fija de 224x224 píxeles en RGB que produce un vector de características (`encoder_hidden_states`). El decoder es un BERT de 2 capas que recibe esas características y genera la transcripción de forma autorregresiva, carácter a carácter, partiendo del token de inicio 2 y deteniéndose en el token de fin de secuencia 3, con relleno mediante el token 0.

El autor señala que, al ser el decoder tan poco profundo, el diseño funciona sin caché KV y mantiene una velocidad práctica. La conversión incluye dos variantes del decoder con longitudes de secuencia fijas de 32 y 64 caracteres, pensadas respectivamente para textos cortos y para líneas más largas. La decodificación de referencia es voraz, seleccionando el `argmax` de los logits en cada paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original utilizó RLHF, DPO u otras técnicas de alineamiento. El modelo original (kha-white/manga-ocr-base) construye el modelo con el framework Vision Encoder Decoder de Transformers y está optimizado para escenarios propios del manga: texto vertical y horizontal, furigana, texto superpuesto sobre imágenes, variedad amplia de fuentes y estilos, y imágenes de baja calidad. La conversión a Core ML es de carácter comunitario y no la ha publicado el autor original.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre texto japonés impreso, con especialización en bocadillos de manga.
- Manejo de texto vertical y horizontal en la misma imagen.
- Reconocimiento de texto con furigana asociada.
- Reconocimiento de texto superpuesto sobre fondos e ilustraciones.
- Robustez ante variedad de fuentes, estilos y calidad de imagen baja.
- Generación de texto autorregresiva a nivel de carácter, con decodificación voraz y sin caché KV.
- Ejecución nativa en iOS y macOS mediante Core ML, con posible uso de la ANE (Neural Engine).
- No soporta tool calling ni function calling.
- No está orientado a flujos de agentes ni a razonamiento multi-paso.
- No es multilingüe: solo japonés.
- No incorpora modo de pensamiento, visión general, audio ni otras capacidades multimodales más allá del par imagen-texto del OCR.

## Casos de uso

- Traducción asistida de manga en aplicaciones móviles: el OCR extrae el texto japonés de cada bocadillo en el propio dispositivo y lo entrega a un módulo de traducción, evitando enviar las imágenes a un servidor.
- Digitalización y archivado de colecciones escaneadas: convertir páginas de manga en texto plano indexable para bibliotecas personales o fondos documentales, tolerando escaneos de baja calidad.
- Aplicaciones iOS y macOS con procesamiento local: al ejecutarse en Core ML, permite funciones de OCR sin conexión y sin coste de inferencia en la nube, útil en apps de lectura o edición.
- Accesibilidad para lectores con dificultades visuales: transcribir el texto de un panel para su lectura por voz o para ampliarlo en pantalla, aprovechando la ejecución en el dispositivo.
- Preprocesado de pipelines de traducción automática: extraer los diálogos de cada página como paso previo a un sistema de traducción y maquetación, separando el texto del arte.
- Indexación y búsqueda de texto en grandes colecciones: generar transcripciones para permitir búsquedas por personaje, frase o término sobre un catálogo completo de tomos.
- Análisis de corpus lingüísticos: recopilar diálogos de manga para estudios de frecuencia léxica, registro coloquial o variación de estilos gráficos japoneses.
- Herramientas de etiquetado para datasets de OCR japonés: usar el modelo como anotador automático inicial y revisar manualmente las salidas, dado su rendimiento en texto difícil de manga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única validación reportada por el autor es una comprobación de equivalencia: sobre dos imágenes de prueba generadas ("瑠璃色の空" y "ありがとうございます"), la secuencia de tokens producida por la decodificación manual en Core ML coincide exactamente con la salida de `model.generate()` de PyTorch. No se proporcionan métricas de exactitud, CER, WER ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 0,3 GB; el encoder fp16 unos 164 MB y cada decoder fp16 unos 46 MB.
- Memoria: al ser pesos fp16 y estar pensados para ejecución en dispositivo, la huella de pesos es de aproximadamente 256 MB sumando encoder y un decoder, más las activaciones intermedias.
- Plataformas objetivo: iOS y macOS con soporte Core ML; aprovecha la ANE en chips Apple Silicon y en dispositivos iPhone/iPad compatibles.
- No está diseñado para GPU NVIDIA (CUDA), por lo que no aplican recomendaciones del tipo A100, H100 o RTX 4090.
- Opciones de despliegue: Core ML mediante coremltools y Xcode, integración en apps Swift o SwiftUI; no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de pesos GGUF ni un LLM de texto.
- Latencia y throughput: no se aportan cifras concretas. El autor indica que la poca profundidad del decoder (2 capas) permite un diseño sin caché KV con velocidad práctica.
- Idoneidad para hardware de consumo: sí, está específicamente orientado a ejecución local en dispositivos Apple de consumo; no requiere hardware de servidor.

## Comparativa con modelos similares

| Modelo | Formato | Arquitectura | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/manga-ocr-base-coreml | Core ML (.mlpackage), fp16 | ViT + decoder BERT de 2 capas | Japonés | apache-2.0 | Conversión comunitaria para iOS/macOS; tres artefactos (encoder y dos decoders) |
| kha-white/manga-ocr-base | PyTorch (pytorch_model.bin, pickle) | ViT + decoder BERT de 2 capas | Japonés | apache-2.0 | Modelo original; referencia funcional de la conversión |
| agiera/manga-ocr-base | No disponible | Vision Encoder Decoder | Japonés | No disponible | Réplica del modelo original alojada en HuggingFace |
| mathewthe2/manga-ocr-base | No disponible | Vision Encoder Decoder | Japonés | No disponible | Réplica del modelo original alojada en HuggingFace |

## Limitaciones y advertencias

- Es una conversión no oficial y comunitaria; no cuenta con el respaldo ni el mantenimiento del autor del modelo original.
- Solo reconoce japonés. No admite otros idiomas ni mezcla de idiomas en la misma línea.
- El decoder trabaja con longitudes de secuencia fijas de 32 o 64 caracteres; los textos que superen ese límite no se pueden transcribir de una sola pasada con esos artefactos.
- La decodificación de referencia es voraz y sin caché KV, lo que limita estrategias de búsqueda más costosas y puede penalizar secuencias largas.
- Riesgo de alucinación propio de un modelo generativo: puede producir caracteres plausibles que no aparecen en la imagen, especialmente con imágenes borrosas, ruidosas o con tipografías poco comunes.
- La entrada se fija a 224x224 píxeles, por lo que textos muy pequeños o densos pueden perder detalle tras el redimensionado.
- La validación reportada se limita a dos imágenes de prueba, sin métricas agregadas de error, lo que dificulta estimar el rendimiento en producción.
- El repositorio registra 0 descargas y 0 valoraciones, por lo que no hay evidencia comunitaria de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una conversión derivada conviene revisar también las condiciones del modelo base y conservar la atribución correspondiente.
- No se ofrecen versiones cuantizadas alternativas (por ejemplo int8 o int4); solo hay pesos fp16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/manga-ocr-base-coreml
- Modelo base original: https://huggingface.co/kha-white/manga-ocr-base
- Repositorio del proyecto original en GitHub: https://github.com/kha-white/manga-ocr
- Réplica agiera/manga-ocr-base: https://huggingface.co/agiera/manga-ocr-base
- Réplica mathewthe2/manga-ocr-base: https://huggingface.co/mathewthe2/manga-ocr-base
- Ficha del modelo original en AIBase (EN): https://model.aibase.com/en/models/details/1915687270881116161
- Ficha del modelo original en AIBase (JA): https://model.aibase.com/models/details/1915687265415938050
- Tokenizador de referencia: https://huggingface.co/cl-tohoku/bert-base-japanese-char-v2
