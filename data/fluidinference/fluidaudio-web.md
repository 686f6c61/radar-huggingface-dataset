# FluidInference/fluidaudio-web

## Resumen

FluidAudio Web es un repositorio de pesos crudos (raw weights) publicado por FluidInference, la comunidad Fluid Inference, que da soporte al proyecto homónimo de inferencia de audio completamente en navegador mediante WebGPU y WebAssembly. No se trata de un modelo único, sino de un conjunto de tensores extraídos de varios modelos de voz ya existentes (Silero VAD, Parakeet, Nemotron, Whisper, Kokoro, entre otros) y verificados contra los originales, listos para ser cargados por motores de forward pass escritos a mano en WebGPU/WASM/JS. El repositorio resuelve el problema de ejecutar tareas de audio (detección de actividad de voz, transcripción, diarización, síntesis de voz) sin servidor ni subida de datos, lo que lo hace relevante para aplicaciones web con requisitos estrictos de privacidad y latencia. El tamaño total del repositorio es de 8,2 GB, distribuido en carpetas por motor, con pesos en formato binario propio (`.bin` + `manifest.json`) y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: FastConformer + RNNT (Parakeet, Nemotron, VoiceChat), Transformer (Whisper base), VAD recurrente (Silero), TTS (Kokoro), diarizacion (Sortformer) |
| Parametros totales | No disponible (conjunto de modelos; cada motor tiene los suyos, p. ej. Parakeet TDT 0.6B, Nemotron 0.6B, Kokoro 82M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de cada motor; los ASR usan ventanas de audio, no contexto textual) |
| Tipos de cuantizacion | fp32, fp16, int8 (segun motor: VAD fp32, Parakeet int8 encoder + fp32 decoder, Nemotron int8 encoder + fp32 decoder, EOU fp16 encoder + fp32 decoder, VoiceChat fp16 encoder + fp32 decoder, Whisper fp32, Sortformer int8 encoder + fp32 head, Kokoro fp32) |
| Idiomas soportados | No disponible en la model card; el motor Nemotron 3.5 streaming ASR indica 40 idiomas; Kokoro tiene variantes en ingles y chino; el resto depende del modelo original |
| Licencia | MIT |
| Formato de pesos | `.bin` (tensores concatenados little-endian) + `manifest.json` (dims, offset, len en elementos) |

## Arquitectura y entrenamiento

El repositorio no contiene arquitecturas nuevas ni información de entrenamiento; son pesos extraídos de modelos ya publicados y verificados por paridad. Cada carpeta corresponde a un motor con su propia arquitectura:

- `vad/`: Silero VAD v5, un detector de actividad de voz recurrente a 16 kHz, en fp32.
- `parakeet/`: Parakeet TDT 0.6B v3, un ASR basado en FastConformer con decoder RNNT, con encoder cuantizado a int8 y decoder/joint en fp32.
- `nemotron/`: Nemotron 3.5 streaming ASR 0.6B, también FastConformer + RNNT, con soporte de 40 idiomas, encoder int8 y decoder fp32.
- `eou/`: Parakeet EOU 120M, un modelo de detección de fin de utterance (ASR parcial), encoder fp16 y decoder fp32.
- `voicechat-stt/`: Cadena de transcripción de usuario de NVIDIA VoiceChat-11B, compuesta por un FastConformer causal de 609M y un decoder RNNT, con encoder fp16 y decoder fp32.
- `whisper/`: Whisper base, modelo Transformer encoder-decoder, en fp32.
- `sortformer/`: Sortformer streaming diarization 4spk v2.1, con encoder int8 y head fp32.
- `kokoro/` y `kokoro-zh/`: Kokoro TTS 82M, en inglés y chino respectivamente, en fp32.

El formato de pesos es propietario: cada tensor se almacena en un archivo `.bin` concatenado, y el `manifest.json` mapea nombres a dimensiones, offset y longitud (en elementos, no bytes). Los motores de inferencia en el repositorio de código (`fluidaudio-web`) cargan estos tensores directamente y, en los motores cuantizados, realizan la de-cuantización en el shader. No se documenta el proceso de entrenamiento ni los datasets utilizados, ya que son modelos preentrenados de terceros.

## Capacidades

- Detección de actividad de voz (VAD) en tiempo real mediante Silero VAD v5, a 16 kHz, en fp32.
- Transcripción automática de voz (ASR) con varios motores: Parakeet TDT 0.6B v3, Nemotron 3.5 streaming ASR 0.6B (40 idiomas), Whisper base y la cadena de transcripción de usuario de VoiceChat-11B.
- Detección de fin de utterance (EOU) con Parakeet EOU 120M, útil para segmentación de turnos en conversaciones.
- Diarización de hablantes en streaming con Sortformer (hasta 4 hablantes, versión 2.1).
- Síntesis de voz (TTS) con Kokoro 82M, en inglés y chino.
- Inferencia completamente en navegador: WebGPU + WebAssembly, sin servidor ni subida de datos.
- Soporte de cuantización int8/fp16 en varios motores para reducir el peso de descarga y acelerar la inferencia en GPU.
- Compatibilidad con el ecosistema FluidAudio: el repositorio es el hermano web del SDK Swift/CoreML FluidAudio y del Rust/WASM FluidVad.

## Casos de uso

- Transcripción en tiempo real en el navegador: un usuario puede dictar y ver el texto al instante sin enviar audio a ningún servidor, usando Parakeet o Nemotron con VAD para segmentar la voz.
- Subtitulado automático de vídeos o reuniones web: la combinación de VAD + ASR + EOU permite generar subtítulos sincronizados en aplicaciones de videoconferencia o reproductores multimedia.
- Asistentes de voz embebidos en páginas web: con Kokoro TTS se puede sintetizar la respuesta del asistente, y con ASR capturar la entrada del usuario, todo localmente.
- Diarización de conversaciones para actas o análisis: Sortformer separa hasta 4 hablantes en streaming, útil para herramientas de toma de notas automáticas en reuniones.
- Aplicaciones de accesibilidad: lectura de texto en voz alta (TTS) y transcripción de voz a texto para personas con discapacidad, sin depender de servicios externos.
- Prototipado rápido de productos de audio: al ser pesos crudos con licencia MIT, los desarrolladores pueden integrarlos en sus propios motores de inferencia o adaptarlos a otras plataformas (por ejemplo, mediante los scripts de extracción del repositorio de código).
- Evaluación de modelos de voz en el navegador: investigadores pueden comparar el rendimiento de distintos ASR (Parakeet, Nemotron, Whisper) y TTS (Kokoro) directamente en una página web, sin instalar dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (WER, CER, etc.) ni de latencia/throughput para los motores. Se recomienda consultar los repositorios de los modelos originales (Silero, Parakeet, Nemotron, Whisper, Kokoro, Sortformer) para datos de rendimiento académico.

## Requisitos de hardware

- Al ser inferencia en navegador, los requisitos dependen del dispositivo del usuario final, no de un servidor.
- Se requiere un navegador con soporte WebGPU (Chrome, Edge, Firefox Nightly, Safari Technology Preview) y WebAssembly.
- El tamaño total de los pesos es de 8,2 GB, pero cada motor se descarga por separado; por ejemplo, Kokoro TTS pesa 82M en fp32 (~328 MB), mientras que Parakeet 0.6B en int8+fp32 puede ocupar varios cientos de MB.
- No se especifican requisitos de VRAM; la carga de tensores se realiza en la GPU del dispositivo a través de WebGPU, por lo que GPU integradas modernas deberían ser suficientes para los modelos pequeños, pero los ASR de 0.6B pueden requerir GPUs discretas con al menos 4-6 GB de VRAM.
- Opciones de despliegue: el repositorio de código `fluidaudio-web` proporciona los motores de forward pass; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que el enfoque es exclusivamente navegador.
- Latencia y throughput: no disponibles; dependerán del hardware del cliente y del motor concreto.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este repositorio. Como alternativa cualitativa, se puede comparar con otras soluciones de inferencia de audio en navegador:

| Solucion | Enfoque | Modelos incluidos | Licencia | Despliegue |
|---|---|---|---|---|
| FluidAudio Web | WebGPU + WASM, pesos crudos | VAD, ASR (Parakeet, Nemotron, Whisper, VoiceChat), EOU, diarizacion, TTS (Kokoro) | MIT | Navegador |
| transformers.js (Xenova) | ONNX Runtime Web, modelos convertidos | Whisper, VAD, TTS (varios) | Apache 2.0 | Navegador |
| Web Speech API | API nativa del navegador | Depende del proveedor (Google, Apple, etc.) | Propietario | Navegador |

La principal diferencia es que FluidAudio Web ofrece pesos crudos y motores escritos a mano, lo que permite un control fino sobre la cuantización y el rendimiento, mientras que transformers.js usa ONNX y un runtime estándar. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- El repositorio contiene solo pesos; no incluye código de inferencia, que debe obtenerse del repositorio de GitHub `fluidaudio-web`.
- El formato de pesos es propietario (`.bin` + `manifest.json`), no es compatible con frameworks estándar como PyTorch u ONNX sin conversión.
- El tamaño total (8,2 GB) puede ser excesivo para aplicaciones web que necesiten cargar todos los motores; se recomienda descargar solo los necesarios.
- Dependencia de WebGPU: no todos los navegadores lo soportan completamente, lo que limita la compatibilidad en dispositivos antiguos o navegadores sin actualizar.
- Los modelos subyacentes (Silero, Parakeet, Nemotron, Whisper, Kokoro, Sortformer) pueden tener sesgos y limitaciones propias, como errores en acentos o ruido de fondo; no se documentan aquí.
- No hay información sobre la procedencia de los datos de entrenamiento de los modelos originales, por lo que el riesgo de alucinación o sesgo no está evaluado en este repositorio.
- La licencia MIT aplica a los pesos tal como se distribuyen, pero los modelos originales pueden tener licencias diferentes; se debe verificar cada uno antes de uso comercial.
- No se garantiza la paridad exacta con los modelos originales en todos los casos; aunque se indica verificación, el proceso de extracción y cuantización puede introducir pequeñas diferencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FluidInference/fluidaudio-web
- Repositorio de código fluidaudio-web (GitHub): https://github.com/FluidInference/fluidaudio-web
- Organización FluidInference en HuggingFace: https://huggingface.co/FluidInference
- FluidAudio (SDK Swift/CoreML): https://github.com/FluidInference/FluidAudio
- Documentación técnica de FluidAudio (DeepWiki): https://deepwiki.com/FluidInference/FluidAudio
