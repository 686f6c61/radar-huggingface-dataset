# danyalmalik/NeuTTS-Air-ONNX-WebGPU

## Resumen

`danyalmalik/NeuTTS-Air-ONNX-WebGPU` es un porte a ONNX del modelo de síntesis de voz NeuTTS Air de Neuphonic, empaquetado para ejecutarse íntegramente en un navegador web mediante el backend WebGPU de ONNX Runtime Web. No es un modelo nuevo: es una redistribución modificada de `neuphonic/neutts-air` (el modelo de lenguaje) y del decoder de `neuphonic/neucodec` (el codec de audio), convertida con el model builder de ONNX Runtime GenAI y cuantizada a 4 bits. El pipeline completo ocupa 0,5 GB en el repositorio y no requiere servidor, GPU dedicada ni encoder de voz para la voz por defecto.

El sistema funciona en dos etapas: un transformer decoder-only Qwen2 de 0,5B de parámetros recibe fonemas en IPA (inglés estadounidense) y genera tokens NeuCodec a 50 por segundo, en el estilo de una grabación de referencia; a continuación, un decoder convolucional convierte esos tokens en audio PCM de 24 kHz. La consecuencia práctica es que se puede ofrecer clonación de voz y TTS de calidad razonable en el cliente, con el texto sin salir del dispositivo.

Es relevante ahora porque demuestra que un stack TTS con voz de referencia cabe en WebGPU con pesos de 4 bits y caché KV en float32, y porque documenta dos problemas concretos de portabilidad: el desbordamiento de `float16` en el modelo de lenguaje y el cálculo incorrecto de `ConvTranspose` de gran kernel en el backend WebGPU de ONNX Runtime Web, que el autor sustituye por una `MatMul` con overlap-add. El repositorio, publicado en octubre de 2026, no tiene descargas ni valoraciones y está en inglés exclusivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos grafos ONNX: LM transformer decoder-only (Qwen2 0,5B, 24 capas) + decoder convolucional NeuCodec con iSTFT |
| Parámetros totales | ~0,5B en el modelo de lenguaje; parámetros del decoder de codec: no disponible |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible; la generación está limitada a 2048 posiciones en total (prompt + audio) |
| Tipos de cuantización | LM: int4 k-quant, bloque de 32, `use_webgpu_fp32=true`; activaciones y caché KV en float32. Decoder: `MatMulNBits` 4-bit y pesos de convolución en int4 `DequantizeLinear` (round-to-nearest, simétrico, bloques de 32) |
| Idiomas soportados | Inglés (`en`), fonemas IPA en `en-us` |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model.onnx.data`, `onnx/codec_decoder.onnx`, `onnx/genai_config.json`) + `tokenizer.json` |
| Vocabulario | 217.652 tokens: vocabulario de Qwen más `<\|speech_0\|>` … `<\|speech_65535\|>` (id base 151.671) |
| Frecuencia de muestreo de salida | 24 kHz, 480 muestras por token (50 tokens/s) |
| Voz por defecto | `dave`, 372 códigos NeuCodec precalculados (`voice_dave.json`) |

## Arquitectura y entrenamiento

El modelo de lenguaje es un Qwen2 de 0,5B convertido con el model builder de ONNX Runtime GenAI (`-p int4 -e webgpu`, k-quant, bloque 32). Las capas lineales y la tabla de embeddings —compartida con la capa de salida atada— están en 4 bits; las activaciones y la caché KV se mantienen en float32 porque en float16 el modelo desborda. La interfaz del grafo es explícita: `input_ids` int64 `[1, S]`, `attention_mask` int64 `[1, P+S]`, 24 pares `past_key_values.{0..23}.{key,value}` float32 de forma `[1, 2, P, 64]`, y salida `logits` `[1, S, 217652]`.

El decoder es el export ONNX oficial de Neuphonic (`neucodec-onnx-decoder`), cuantizado sin calibración: multiplicaciones matriciales a 4 bits y pesos de convolución a int4. La innovación técnica del porte es la reescritura del `ConvTranspose` de la iSTFT inversa (kernel 1920, stride 480), que el backend WebGPU de ONNX Runtime Web calcula mal, como una `MatMul` equivalente más un overlap-add de cuatro bloques con padding; el resultado es idéntico al de CPU. La generación es autorregresiva con temperatura 1,0 y top-k 50, prohibiendo el token de fin en las primeras 50 posiciones; no se aplica la marca de agua Perth que añade el pipeline original. No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del corpus ni si hubo RLHF o DPO: el autor solo redistribuye y cuantiza pesos ya entrenados por Neuphonic.

## Capacidades

- Síntesis de voz en inglés a 24 kHz a partir de texto, con prosodia y puntuación derivadas de fonemas IPA.
- Clonación de voz zero-shot: el prompt incluye los códigos NeuCodec de una grabación de referencia (la voz `dave` viene incluida con sus 372 códigos y su transcripción).
- Fonemización integrada en el flujo: acepta fonemas estilo eSpeak (`en-us`, con acentos y separación por espacios simples) o el fonemizador propio de Quick Inference.
- Ejecución íntegra en navegador con ONNX Runtime Web (WebGPU o CPU), sin backend ni red.
- Inferencia en streaming por tokens: cada token produce 480 muestras (20 ms) y el decoder puede invocarse por fragmentos.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de TTS puro, sin capacidad de diálogo.
- No soporta visión, audio de entrada ni otros idiomas distintos del inglés.

## Casos de uso

- Lectura en voz alta en aplicaciones web: un lector de artículos o de documentación puede fonemizar el texto en el cliente y sintetizarlo con WebGPU, sin enviar contenido a ningún servidor ni pagar coste de inferencia por petición.
- Accesibilidad en PWA y aplicaciones offline: al pesar 0,5 GB y ejecutarse en el navegador, encaja en un service worker cacheado para usuarios con discapacidad visual en entornos sin conectividad.
- Asistentes conversacionales locales con privacidad: combinado con un LLM pequeño en el dispositivo, la voz de salida se genera sin salir del equipo, lo que simplifica el cumplimiento de RGPD en aplicaciones sanitarias o educativas.
- Prototipado de locuciones y demos: para producir maquetas de audio en inglés durante el desarrollo de un producto, con la ventaja de que el modelo se carga desde una página web sin instalar CUDA ni dependencias de Python.
- Clonación de voz controlada en investigación: el formato de prompt (fonemas de referencia + códigos de referencia) permite experimentar con distintas grabaciones y medir el efecto en la inteligencia y el timbre; requiere generar los códigos con el encoder de NeuCodec, que no forma parte de este repositorio.
- Evaluación de pipelines de ASR: el modelo sirve para generar audio sintético con texto conocido y medir tasas de error de reconocedores, como hizo el autor con Whisper small.en sobre ocho frases.
- Pruebas de cuantización en el borde: sirve como banco de pruebas para comparar int4 frente al modelo original en precisión de pesos y consumo de memoria en GPUs integradas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son tasas de error de palabra (WER) medidas con Whisper small.en sobre ocho frases de prueba.

| Prueba | Configuración | Resultado |
|---|---|---|
| WER con fonemas eSpeak | ONNX int4 WebGPU | 11,4 % |
| WER con fonemas eSpeak | Modelo original NeuTTS Air | 11,4 % |
| WER con fonemizador de Quick Inference | ONNX int4 WebGPU | 6,8 % |
| WER con fonemizador de Quick Inference | ONNX int4 en Chrome | 10,2 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de métricas de calidad de voz subjetivas (MOS) en la información disponible. El autor advierte que el muestreo con temperatura 1,0 hace que ejecuciones individuales varíen, y que las salidas son cercanas pero no idénticas a las del modelo original.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB. Los pesos int4 del LM y el decoder suman aproximadamente 0,5 GB según el tamaño del repositorio; la tabla de embeddings atada (217.652 × dimensión oculta a 4 bits) es el componente mayor.
- Caché KV en float32: 24 capas × 2 × 64 dimensiones × 4 bytes ≈ 12 KB por posición, unos 25 MB a 2.048 posiciones.
- GPU compatibles: cualquier dispositivo con WebGPU operativo, incluidas GPU integradas Intel y AMD, Apple Silicon (Metal), Adreno en Android y GPUs dedicadas RTX 20/30/40. No se requieren A100 ni H100; el modelo no está pensado para servir peticiones concurrentes en servidor.
- Cabe holgadamente en GPU de consumo y en hardware móvil; el límite práctico es la disponibilidad de WebGPU en el navegador, no la memoria.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU o WASM (CPU), y ONNX Runtime GenAI para construir y cargar el grafo. vLLM, TGI, llama.cpp y Ollama no son aplicables a este pipeline (el decoder de codec no forma parte de esas herramientas): no disponible.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la GPU, del navegador y de la longitud del audio generado. El límite de 2.048 posiciones acota la duración total por generación.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto / límite | Salida | Licencia | Notas |
|---|---|---|---|---|---|---|
| NeuTTS-Air-ONNX-WebGPU (este) | ONNX int4 para WebGPU | ~0,5B (LM) + decoder | 2.048 posiciones por generación | 24 kHz, sin marca de agua | Apache 2.0 | Ejecutable en navegador; solo inglés; sin encoder de voz incluido |
| neuphonic/neutts-air (original) | PyTorch | ~0,5B (LM) + decoder | No disponible | 24 kHz, con marca de agua Perth | Apache 2.0 | Referencia de calidad; requiere Python y el encoder NeuCodec para clonar voces |
| neuphonic/neucodec-onnx-decoder | ONNX (solo decoder) | No disponible | No aplica | 24 kHz | Apache 2.0 | Componente aislado, no es un TTS completo |
| Otros TTS ligeros para navegador | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Solo inglés: el prompt espera fonemas IPA en `en-us`; otros idiomas no están soportados ni evaluados.
- Sin marca de agua: el pipeline original inserta una marca Perth que aquí se ha eliminado, lo que elimina la trazabilidad del audio sintético y agrava el riesgo de suplantación de voz. Cualquier despliegue en la UE debe valorar las obligaciones de transparencia del Reglamento de IA.
- La voz `dave` proviene de `neuphonic/neutts` (commit 3e9415d, Apache 2.0); la licencia del código no resuelve por sí sola los derechos de imagen o de voz de la persona grabada.
- Calidad dependiente de la referencia: el timbre y la inteligencia se derivan de los códigos de la grabación; no hay encoder incluido, así que para voces nuevas hay que obtener los códigos con herramientas externas.
- Tasa de error de palabra del 11,4 % con fonemas eSpeak y del 10,2 % en Chrome con el fonemizador propio: hay errores de pronunciación medibles, y el autor solo evaluó ocho frases.
- Generación no determinista (temperatura 1,0, top-k 50): dos ejecuciones del mismo texto pueden diferir; no es apto para contenido que exija reproducibilidad exacta sin fijar semilla.
- Límite de 2.048 posiciones que incluye el prompt (fonemas de referencia, texto y códigos de la voz): acota la duración del audio por generación.
- Dependencia de WebGPU: el `ConvTranspose` original se calcula mal en este backend y se ha sustituido por una reescritura; el comportamiento puede variar entre navegadores y versiones de ONNX Runtime Web.
- `float16` desborda en el LM, de ahí el uso de activaciones y caché KV en float32, con mayor consumo de memoria del teórico.
- Repositorio sin adopción: 0 descargas y 0 me gusta en el momento de la consulta, sin revisión independiente de la comunidad.
- Las salidas son "cercanas pero no idénticas" a las del modelo original, según el propio autor: no es una sustitución bit a bit para pipelines ya validados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyalmalik/NeuTTS-Air-ONNX-WebGPU
- Modelo base (LM): https://huggingface.co/neuphonic/neutts-air
- Codec base: https://huggingface.co/neuphonic/neucodec
- Export ONNX del decoder: https://huggingface.co/neuphonic/neucodec-onnx-decoder
- Repositorio de Quick Inference (incluye `tools/export/neucodec_overlap_add.py`): https://github.com/mdanyalmalik/quick-inf
- Repositorio NeuTTS de Neuphonic (origen de la voz `dave`): https://github.com/neuphonic/neutts
- Paper: no disponible en la información proporcionada.
