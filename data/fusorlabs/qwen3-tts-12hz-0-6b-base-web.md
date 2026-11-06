# fusorlabs/qwen3-tts-12hz-0.6b-base-web

## Resumen

`fusorlabs/qwen3-tts-12hz-0.6b-base-web` es una compilación del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base de Qwen (Alibaba) empaquetada para ejecutarse en el navegador mediante WebAssembly. No se trata de un checkpoint en PyTorch o safetensors, sino de un bundle propietario del runtime `fusor-ai` que contiene los pesos cuantizados a 7 bits de todos los componentes del sistema TTS: el talker, el predictor de código, el codificador de hablante y el codificador/decodificador del tokenizador de voz a 12 Hz.

El modelo resuelve el problema de la síntesis de voz con clonación de voz directamente en el dispositivo del usuario, sin necesidad de servidores ni GPU dedicadas. Al ejecutarse sobre la CPU del cliente dentro del navegador, elimina la latencia de red y las preocupaciones de privacidad asociadas al envío de audio a servicios en la nube. La clonación se realiza a partir de un clip corto de referencia.

Es relevante ahora porque demuestra la viabilidad de desplegar modelos generativos de audio en entornos web sin infraestructura de inferencia, con un tamaño de bundle de aproximadamente 1,1 GB y licencia Apache-2.0. El modelo base tiene 0,6 mil millones de parámetros, opera a una tasa de tokens de 12 Hz y, según la model card, soporta diez idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basado en transformer (talker + predictor de código + codificador de hablante + tokenizador de voz a 12 Hz), compilado a WebAssembly |
| Parámetros totales | 0,6 mil millones (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | q7 (7 bits por matriz grande); pesos empaquetados en formato fusor-ai |
| Idiomas soportados | Diez idiomas (no se especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle `fusor-ai` (`manifest.json` + partes nombradas por hash BLAKE3); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-0.6B-Base es un sistema de síntesis de voz de Qwen que combina varios componentes: un talker (generador principal de tokens de voz), un predictor de código, un codificador de hablante para la clonación de voz y un tokenizador de voz que opera a 12 Hz. Esta compilación incluye los pesos de todos ellos, con el embedding de texto ya proyectado mediante la proyección de texto.

La compilación se realizó con el perfil `q7`, que cuantiza cada matriz grande a 7 bits, resultando en un bundle de 1068 MB. El bundle se genera con la herramienta `just model` del repositorio `qwen3-tts-wasm`, que descarga el checkpoint original (revisión `5d83992436eae1d760afd27aff78a71d676296fc`) y compila el mismo paquete. El runtime verifica la integridad de cada parte mediante su hash BLAKE3 durante la carga. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz a partir de un clip corto de referencia.
- Soporte de diez idiomas (lista no especificada en la información disponible).
- Ejecución en el navegador sobre la CPU del dispositivo mediante WebAssembly, sin GPU.
- Carga verificada por hash BLAKE3 de cada tensor y parte del bundle.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura por voz de artículos y documentos en aplicaciones web: el modelo se carga en el navegador y sintetiza el texto localmente, evitando enviar contenido a servidores externos y reduciendo la latencia a la generación en CPU.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla basados en web que necesitan una voz natural sin depender de APIs de terceros ni de conexión permanente.
- Clonación de voz para avatares y asistentes personalizados: a partir de un clip corto de referencia, la aplicación puede generar respuestas habladas con la voz del usuario en el propio dispositivo.
- Doobla je y producción de audio para vídeo: generación de pistas de voz en diez idiomas para contenido multilingüe sin infraestructura de GPU, adecuado para prototipos y edición ligera.
- Aplicaciones de privacidad sensible (sanidad, banca, educación): al ejecutarse en el cliente, el audio y el texto no salen del dispositivo, lo que facilita el cumplimiento de requisitos de protección de datos.
- Demos y espacios interactivos en Hugging Face: el Space `fusorlabs/qwen3-tts-wasm` permite probar la clonación de voz y la síntesis directamente en el navegador sin backend de inferencia.
- Sistemas de respuesta de voz interactiva (IVR) en web: síntesis local de mensajes pregrabados dinámicamente, con la ventaja de no requerir cuotas de API ni conexión de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU mediante WebAssembly.
- GPU recomendadas: no aplica; el runtime está diseñado para la CPU del dispositivo.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; el modelo no usa GPU.
- Tamaño en disco/memoria: bundle de aproximadamente 1,1 GB (1068 MB de pesos en perfil q7), que debe cargarse en el navegador.
- Opciones de despliegue: únicamente el runtime `qwen3-tts-wasm` (WebAssembly) con el bundle `fusor-ai`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| fusorlabs/qwen3-tts-12hz-0.6b-base-web | 0,6 B | No disponible | Bundle fusor-ai (WASM) | Apache-2.0 | Navegador (CPU) |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6 B | No disponible | PyTorch/safetensors (checkpoint original) | Apache-2.0 | Servidor/GPU |
| Alternativas TTS de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El bundle solo carga en el runtime `qwen3-tts-wasm`; no es un checkpoint PyTorch ni safetensors y no puede usarse con frameworks estándar de inferencia.
- La cuantización a 7 bits puede degradar la calidad de la voz respecto al modelo original en precisión completa; no se han publicado métricas comparativas.
- El tamaño de 1,1 GB implica una descarga considerable para el usuario final y requisitos de memoria en el navegador.
- No se especifican los diez idiomas soportados ni la calidad por idioma.
- Riesgo de alucinación y artefactos en la síntesis de voz: pronunciación incorrecta, entonación anómala o inestabilidad en textos largos o con caracteres especiales.
- La clonación de voz plantea riesgos de suplantación de identidad y uso malicioso; es responsabilidad del integrador aplicar controles de consentimiento y marcas de agua.
- No se dispone de información sobre sesgos demográficos o acústicos del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen y de las dependencias del runtime.
- No se han publicado datos de latencia, throughput ni benchmarks de calidad (MOS, WER) para esta compilación.

## Enlaces

- [Hugging Face: fusorlabs/qwen3-tts-12hz-0.6b-base-web](https://huggingface.co/fusorlabs/qwen3-tts-12hz-0.6b-base-web)
- [Modelo base: Qwen/Qwen3-TTS-12Hz-0.6B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base)
- [Runtime: fusor-rs/qwen3-tts-wasm](https://github.com/fusor-rs/qwen3-tts-wasm)
- [Framework: fusor-rs/fusor-ai](https://github.com/fusor-rs/fusor-ai)
- [Demo: Space fusorlabs/qwen3-tts-wasm](https://huggingface.co/spaces/fusorlabs/qwen3-tts-wasm)
