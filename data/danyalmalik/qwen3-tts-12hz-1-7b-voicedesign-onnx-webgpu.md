# danyalmalik/Qwen3-TTS-12Hz-1.7B-VoiceDesign-ONNX-WebGPU

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign-ONNX-WebGPU es una exportación a ONNX del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign, publicada por el usuario danyalmalik para ejecutar text-to-speech directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web, tal y como lo consume la herramienta Quick Inference del mismo autor. No es un modelo entrenado desde cero, sino una conversión de pesos con cuantización, dividida en grafos separados (talker, code predictor, proyecciones y tablas de embeddings) que encajan en el builder de ONNX Runtime GenAI.

El modelo base resuelve la generación de voz condicionada por una descripción en lenguaje natural (edad, acento, tono, ritmo) en lugar de por un identificador de hablante predefinido; cubre diez idiomas y produce audio a 24 kHz. Esta variante cuantizada reduce el repositorio a 1,4 GB, con pesos int4 en el talker y en los embeddings y int8 en el code predictor, manteniendo activaciones y caché KV en float32 para evitar los desbordamientos a NaN y la degradación a balbuceo que el autor observó con float16.

Su relevancia es práctica: permite inferencia de TTS de 1,7B parámetros sin servidor, con los datos de audio generados localmente en el cliente, a costa de una pérdida medible de fidelidad (8,0 % de WER en ONNX Runtime CPU frente a 6,8 % del original float32, sobre ocho frases de prueba). El repositorio es muy reciente y no tiene descargas ni valoraciones, por lo que no existe validación independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo en dos etapas: talker de 28 capas y anchura 2048 que predice el codebook 0 (3072 ids de codec), code predictor de 5 capas y anchura 1024 que predice los 15 codebooks restantes, mas decodificador de codec a audio; exportado como grafos ONNX para ONNX Runtime GenAI |
| Parametros totales | 1,7B (segun el nombre del modelo y el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simetrica por bloques de 32, round-to-nearest, sin calibracion (talker, `cp_project`, `text_embed`, `codec_embed`); int8 (code predictor); decodificador de codec `tok_decoder_q4c8.onnx` con convoluciones de 8 bits; activaciones y cache KV en float32 |
| Idiomas soportados | 10 idiomas (el autor no detalla la lista en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos para ONNX Runtime GenAI), `config.json`, `generation_config.json`, `tokenizer.json` en formato `tokenizers`; tamano del repositorio 1,4 GB |
| Tasa de frames de audio | 12 Hz (80 ms por frame), 16 codebooks por frame, salida a 24 kHz |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign |

## Arquitectura y entrenamiento

La arquitectura reproduce la del Qwen3-TTS original en un esquema de dos decodificadores en cascada. El talker (28 capas, anchura 2048) procesa los embeddings de texto y los tokens de rol y genera, frame a frame, el código del codebook 0 mediante muestreo con temperatura 0,9, top-k 50 y penalización de repetición 1,05, enmascarando los ids 2048-3071 salvo el código de parada 2150 y sin permitir parada en los dos primeros frames. Su estado oculto se proyecta a anchura 1024 (`cp_project_q4.onnx`) y alimenta un code predictor de 5 capas que emite los 15 codebooks restantes con caché renovada en cada frame. La suma de los embeddings de los 16 códigos, más el embedding de tts-pad, forma la entrada del talker para el frame siguiente, y la secuencia completa de frames pasa por el decodificador de codec para producir audio a 24 kHz.

El prompt se construye como en `qwen_tts`: la descripción verbal del hablante va como embeddings de texto del turno de usuario, seguida de los tokens de rol del asistente y del texto a sintetizar, un prefijo de codec (think, think-bos, idioma, think-eos, pad, bos) sin token de hablante, los embeddings del texto sobre codec-pad y tts-pad sobre codec-bos. No se proporciona información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre fases de RLHF o DPO del modelo base; esta publicación es exclusivamente una exportación, no un reentrenamiento. La innovación técnica reseñable es la estrategia de cuantización: int4 sin calibración con bloques de 32 para los decodificadores y tablas de embeddings, int8 para el code predictor, y float32 para activaciones y caché KV para evitar los desbordamientos a NaN del build float16.

## Capacidades

- Síntesis de voz a partir de una descripción textual del hablante (edad, acento, tono, ritmo), sin necesidad de audio de referencia ni de identificador de hablante.
- Generación de audio a 24 kHz con una tasa de 12 frames por segundo (80 ms por frame) y 16 codebooks por frame.
- Soporte de diez idiomas, según la model card del modelo base; la lista concreta no se detalla.
- Ejecución local en el navegador mediante ONNX Runtime Web con backend WebGPU, y también en CPU a través de ONNX Runtime (el autor reporta mediciones en ambos entornos).
- Control de generación por muestreo configurable (temperatura, top-k, penalización de repetición, enmascarado de ids y código de parada).
- Integración con el builder de modelos de ONNX Runtime GenAI y con la herramienta Quick Inference.
- No soporta tool calling ni function calling, no es un modelo multimodal de entrada (solo texto) y no dispone de modo de razonamiento ni de agentes multi-paso: es un modelo específico de text-to-speech.

## Casos de uso

- Lectura en voz alta en aplicaciones web: el modelo se ejecuta en el propio navegador con WebGPU, de modo que el texto del usuario no sale del cliente; adecuado para lectores de artículos, sistemas de accesibilidad y asistencia a personas con discapacidad visual.
- Prototipado rápido de voces: al definirse la voz mediante una descripción escrita, un equipo de producto puede generar variantes de locución (por ejemplo, "voz adulta clara y tranquila, acento neutro, ritmo moderado") y evaluarlas sin entrenar ni seleccionar hablantes.
- Asistentes de voz e IVR en entornos con requisitos de privacidad: al no requerir servidor de inferencia, encaja en despliegues on-premise o en aplicaciones donde el audio no debe transmitirse a terceros.
- Doblaje y audiolibros de bajo coste: el modelo acepta guiones largos y diez idiomas, con salida a 24 kHz suficiente para previews, maquetas de doblaje y contenido narrado antes de pasar a un estudio profesional.
- Contenido formativo y e-learning: generación de narraciones para cursos y tutoriales con voces consistentes descritas una sola vez, ejecutables desde el navegador del alumno o del editor.
- Videojuegos y experiencias interactivas en web: diálogo generado en tiempo de ejecución sin backend de TTS, con la latencia limitada por el frame de 80 ms y el coste de muestreo del talker.
- Pruebas de regresión y evaluación de TTS: el pipeline exportado permite comparar la fidelidad de la versión cuantizada frente al modelo original usando métricas automáticas de reconocimiento (el autor emplea Whisper small.en para medir WER).

## Benchmarks y rendimiento

El autor solo publica una evaluación de inteligibilidad sobre ocho frases en inglés, con la descripción "A clear, calm adult male voice with a neutral American accent, speaking at a moderate pace." y el muestreo del modelo original, transcritas con Whisper small.en:

| Entorno | WER (8 frases, ingles) |
|---|---|
| Original float32 (PyTorch) | 6,8 % |
| Esta exportacion ONNX, ONNX Runtime CPU | 8,0 % |
| Esta exportacion ONNX, Chrome (WebGPU) | 15,9 % (la mayor parte atribuida a una direccion de correo mal transcrita) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites en la informacion disponible; tampoco hay cifras de latencia, RTF ni throughput. El autor advierte que el muestreo introduce variabilidad entre ejecuciones y que la comparación se basa en una muestra muy pequena (8 frases, un único idioma).

## Requisitos de hardware

- Huella de pesos: 1,4 GB de repositorio; los pesos int4 del talker y de los embeddings más el code predictor int8 ocupan del orden de 1-1,5 GB, a lo que se suma la caché KV en float32 (estimación a partir del tamaño del repo, no publicada por el autor).
- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB considerando pesos y caché KV en float32; el uso de float32 para activaciones y caché encarece el consumo respecto a un despliegue en float16.
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador, incluidas integraciones gráficas de portátiles; tarjetas de consumo como la RTX 4090 no son necesarias. No hay datos del autor sobre A100 u H100, y para este tamaño no aportan ventaja práctica.
- Cabe en GPU de consumo: sí, y también en iGPU, según el diseño del autor (backend WebGPU orientado a navegador) y las pruebas realizadas en Chrome.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (navegador), ONNX Runtime en CPU, builder de modelos de ONNX Runtime GenAI y la herramienta Quick Inference. No hay pesos GGUF ni safetensors en este repositorio, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables directamente.
- Dependencia adicional: el decodificador de codec se distribuye aparte, en `danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU` (`tok_decoder_q4c8.onnx`).
- Latencia y throughput: no disponibles. Como referencia de granularidad temporal, cada frame cubre 80 ms de audio y requiere un paso del talker y 15 pasos del code predictor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | WER (8 frases, ingles) | Licencia | Ejecucion |
|---|---|---|---|---|---|---|
| danyalmalik/Qwen3-TTS-12Hz-1.7B-VoiceDesign-ONNX-WebGPU | 1,7B | no disponible | ONNX, int4 + int8, activaciones float32 | 8,0 % (ORT CPU) / 15,9 % (Chrome) | Apache 2.0 | Navegador (WebGPU) y CPU via ONNX Runtime |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign (original) | 1,7B | no disponible | PyTorch, float32 | 6,8 % | Apache 2.0 | GPU/CPU con framework de origen |
| danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU | no disponible | no aplica | ONNX, `tok_decoder_q4c8.onnx` | no aplica (es el decodificador de codec) | Apache 2.0 (segun el modelo base) | Navegador (WebGPU) |

No se dispone de datos en la información proporcionada para comparar con otras familias de TTS (por ejemplo, modelos de síntesis con clonación de voz o voces predefinidas): sus parametros, contexto y rendimiento figuran como no disponibles.

## Limitaciones y advertencias

- Fidelidad degradada respecto al original: 8,0 % de WER en CPU y 15,9 % en Chrome frente a 6,8 % del modelo float32, sobre una muestra de solo ocho frases en inglés; los resultados no son extrapolables a otros idiomas ni a textos largos.
- Errores concretos observados: en la prueba en navegador, buena parte del error se concentró en una dirección de correo mal transcrita, un patrón típico de alucinación en TTS con entidades poco frecuentes (números, correos, nombres propios).
- Cuantización sin calibración (round-to-nearest, bloques de 32): puede introducir artefactos en voces y prosodia; el autor eligió la variante de decodificador con convoluciones de 8 bits porque la de 4 bits producía voces más brillantes.
- Inestabilidad numérica documentada: los builds float16 del code predictor desbordaban a NaN y los del talker producían balbuceo; de ahí el uso de float32 en activaciones y caché, que aumenta los requisitos de memoria.
- Cobertura lingüística: se anuncian diez idiomas, pero no se detalla la lista ni se aportan métricas por idioma; toda la evaluación publicada es en inglés.
- Sin control por identificador de hablante: el prefijo de codec no incluye token de speaker, de modo que la voz depende por completo de la descripción textual y no es reproducible de forma exacta entre ejecuciones (el modelo muestrea).
- Longitud de contexto y de texto máximo no documentadas: no hay guía sobre chunking para guiones largos ni sobre degradación con entradas extensas.
- Requisito de navegador: la ruta WebGPU depende de la disponibilidad y madurez de WebGPU en el navegador del usuario; la ruta CPU es funcional pero con mayor latencia esperada.
- Licencia Apache 2.0, que permite uso comercial, pero el artefacto deriva de Qwen3-TTS; conviene verificar los términos del modelo base y de sus dependencias antes de distribuirlo en producto.
- Madurez: repositorio publicado el 2026-10-21 con 0 descargas y 0 likes; no hay validación independiente, informes de terceros ni issues públicos sobre su comportamiento en producción.
- No es un modelo de propósito general: no soporta tool calling, agentes, visión ni razonamiento multi-paso, por lo que no debe evaluarse como LLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Qwen3-TTS-12Hz-1.7B-VoiceDesign-ONNX-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Decodificador de codec ONNX (dependencia): https://huggingface.co/danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU
- Repositorio de Quick Inference (script de exportación `tools/export/export_qwen3_tts.py`): https://github.com/mdanyalmalik/quick-inf
- Resultados de la búsqueda web: no se han encontrado enlaces tecnicos relevantes; las entradas devueltas no guardan relación con el modelo.
