# goodpixelltd/qwen3-asr-1.7b-coreml

## Resumen

Qwen3-ASR-1.7B-CoreML es una conversión a Core ML del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, publicada por el usuario goodpixelltd. El objetivo de esta conversión no es otro que ejecutar el modelo en el Neural Engine de dispositivos Apple con iOS 18 o superior, aprovechando la aceleración hardware específica de los chips de la serie A y M. El modelo original procede de la familia Qwen3 de Alibaba, aunque en esta ficha solo se dispone de información sobre la conversión, no sobre el entrenamiento original.

La relevancia de esta publicación radica en que traslada un modelo ASR de 1.700 millones de parámetros al ecosistema móvil de Apple con cuantizaciones agresivas (4 y 8 bits) y una segmentación del decodificador en cuatro partes para ajustarse a las restricciones de memoria del Neural Engine. El repositorio ocupa 1,5 GB y está pensado para integrarse en aplicaciones iOS, tal y como indica el autor, que lo utiliza en el teclado Typo00.

La información disponible es limitada: no se detallan los datos de entrenamiento del modelo base, los idiomas soportados ni resultados de benchmarks. Esta ficha refleja exclusivamente lo que la model card y los metadatos de Hugging Face permiten verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder de audio + decodificador de texto), convertido a Core ML; el decodificador se divide en 4 partes de 7 capas |
| Parametros totales | 1.700 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 320 posiciones de caché key/value en el decodificador; ventana de audio de 8 segundos por fragmento |
| Tipos de cuantizacion | Pesos de 4 bits palettizados por grupo de 16 canales; capas concretas (feed-forward de la capa 2 y capa de salida) en 8 bits; embeddings de entrada en 8 bits; encoder de audio en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), más ficheros binarios auxiliares (`qwen3-subset.bin`, `qwen3-embed.bin`) y `vocab.json` |

## Arquitectura y entrenamiento

La conversión mantiene la estructura del modelo original Qwen3-ASR-1.7B: un encoder de audio que procesa ventanas de 8 segundos (entrada mel de dimensiones `[1,128,800]`, salida `[104,2048]`) y un decodificador de texto autorregresivo de 28 capas, dividido en cuatro submodelos de 7 capas cada uno. Cada parte del decodificador expone dos funciones, `decode` (generación de un token) y `prefill` (procesamiento de 64 tokens), que comparten pesos y un estado de caché key/value de 320 posiciones gestionado como estado nativo de Core ML.

La innovación técnica principal de esta conversión es la gestión numérica para evitar desbordamientos en precisión media del Neural Engine. El autor documenta que los valores residuales alcanzan aproximadamente 10.700 (y 14.900 en el paso feed-forward de la capa 2), por lo que las normalizaciones sobre el flujo residual dividen cada fila por su valor máximo antes de elevar al cuadrado, y el paso feed-forward se ejecuta a escala 1/64 y se reescala después. La conversión se realizó con coremltools a partir de los pesos originales. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo base empleó RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre fragmentos de audio de 8 segundos.
- Generación de texto token a token mediante el decodificador, con modos `prefill` y `decode`.
- Ejecución en el Neural Engine de Apple con iOS 18 o superior.
- Cuantización selectiva para mantener la fidelidad numérica en capas sensibles.
- Integración en aplicaciones iOS de terceros (el autor lo usa en el teclado Typo00).
- No se documentan capacidades de traducción, diarización, timestamps, tool calling ni agentes.
- No se documenta soporte multilingüe explícito.

## Casos de uso

- Dictado por voz en teclados iOS: el modelo puede transcribir fragmentos de 8 segundos en el propio dispositivo, tal y como demuestra su uso en el teclado Typo00, sin enviar audio a servidores externos.
- Transcripción offline en aplicaciones de notas: al ejecutarse en el Neural Engine, permite grabar y transcribir reuniones o apuntes sin conexión y con baja latencia.
- Subtitulado local de contenido grabado: procesando el audio en ventanas sucesivas de 8 segundos, se pueden generar subtítulos en el dispositivo para vídeos o pódcasts.
- Asistentes de voz embebidos: la inferencia local evita dependencias de red y protege la privacidad en asistentes personales dentro de apps iOS.
- Accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, aprovechando la aceleración del Neural Engine en iPhone y iPad.
- Procesamiento por lotes en Mac con chip de la serie M: al ser Core ML, el mismo paquete puede ejecutarse en macOS sobre el Neural Engine o la GPU para transcribir archivos de audio de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Repositorio de 1,5 GB, lo que sugiere un peso en disco y en memoria moderado para un modelo de 1.700 millones de parámetros cuantizado.
- Requiere iOS 18 o superior y un dispositivo con Neural Engine (iPhone, iPad o Mac con chip de la serie A o M).
- El decodificador está segmentado en cuatro partes de 7 capas para ajustarse a los límites de memoria del Neural Engine; la caché key/value está limitada a 320 posiciones.
- El encoder procesa ventanas de audio de 8 segundos, lo que condiciona la latencia por fragmento.
- Opciones de despliegue: Core ML en iOS/macOS; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al no ser formatos GGUF ni safetensors.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodpixelltd/qwen3-asr-1.7b-coreml | 1.700 M | 320 posiciones de caché; audio de 8 s por ventana | Core ML | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B | 1.700 M | no disponible | safetensors (presumiblemente) | Apache 2.0 (según modelo base) | Hugging Face |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos ASR de tamano similar no puede completarse con la información proporcionada; solo se dispone de la referencia al modelo base original.

## Limitaciones y advertencias

- La información sobre el modelo base (idiomas, datos de entrenamiento, benchmarks) no está disponible en esta ficha, por lo que no puede evaluarse su calidad frente a alternativas.
- La ventana de audio es de 8 segundos por fragmento, lo que puede fragmentar la transcripción de audio largo y requerir lógica de concatenación en la aplicación.
- La caché key/value está limitada a 320 posiciones, lo que restringe la longitud de la secuencia generada por invocación.
- La cuantización a 4 bits en la mayor parte del decodificador puede degradar la precisión frente a los pesos originales; el autor aplica correcciones numéricas, pero no publica métricas de calidad.
- Dependencia exclusiva del ecosistema Apple (Core ML, Neural Engine, iOS 18+); no es desplegable en GPUs NVIDIA ni en servidores Linux convencionales.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base original antes de su explotación en producción.
- No se documentan sesgos conocidos ni evaluación de idiomas; el uso en producción requiere validación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodpixelltd/qwen3-asr-1.7b-coreml
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
