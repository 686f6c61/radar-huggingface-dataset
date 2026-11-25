# nesoai-qa-org/gradium-phonon-31m-en

## Resumen

phonon-31m-en es un modelo de síntesis de voz (text-to-speech) desarrollado por Gradium (publicado bajo la organización nesoai-qa-org en Hugging Face). Convierte texto en inglés en audio mono a 24 kHz de forma natural, generando el audio en streaming mientras todavía se está produciendo, y con un tamaño lo bastante reducido como para ejecutarse en una pestaña del navegador, en un teléfono o en la CPU de un portátil. Forma parte de la familia Phonon y se apoya en Pocket TTS y el códec Mimi de Kyutai.

El modelo emplea una arquitectura de transformer con flow matching que predice latentes de audio a partir del texto, frame a frame, con una granularidad de 80 ms; el decodificador del códec Mimi transforma esos latentes en audio. Cuenta con 31 millones de parámetros (sin incluir el tokenizador de audio), un fichero de pesos cuantizado a 8 bits de 64,5 MB y una licencia Apache 2.0, lo que lo hace apto para uso comercial.

Su relevancia actual radica en la combinación de latencia baja por streaming, huella mínima y licencia permisiva, en un momento en el que la mayoría de modelos TTS de calidad exigen GPU dedicada o licencias restrictivas. El modelo solo soporta inglés y está pensado para despliegues en dispositivo (on-device) y en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con flow matching (predicción de latentes de audio) + decodificador del códec Mimi |
| Parametros totales | 41.096.035 (según safetensors); 31M según la model card (excluyendo el tokenizador de audio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (8 bits); fichero `model.q8.gguf` de 64,5 MB |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de flow matching que predice latentes de audio a partir del texto de entrada, generando un frame cada 80 ms. Esos latentes se convierten en audio mediante el decodificador del códec Mimi, desarrollado por Kyutai. La arquitectura se construye sobre Pocket TTS (también de Kyutai) y la salida es audio mono a 24 kHz. El modelo integra un sistema de voces predefinidas: cada voz se representa como un tensor de latentes de hablante de forma (num_frames, 512), cargado desde ficheros safetensors independientes (por ejemplo, la voz "Easton" en en-us).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales más allá del streaming nativo y la integración con el códec Mimi. El runtime (xn-ptts) soporta normalización de texto específica por idioma (números, símbolos, fechas, direcciones) en la CLI y en las APIs de Python/JS, aunque el tokenizador de Transformers no realiza esa expansión y requiere dividir textos largos con `processor.split_text`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con salida mono a 24 kHz.
- Generación en streaming: el audio empieza a reproducirse mientras el resto se sigue generando.
- Ejecución on-device: navegador (WASM), CPU de portátil, móvil, Core ML en iOS/macOS y NPU Snapdragon (preview).
- Selección de voz mediante latentes de hablante preentrenados (repositorio `gradium/phonon-voices`).
- Normalización de texto dependiente del idioma (números, importes, símbolos, fechas, direcciones) en el runtime `ptts`.
- Integración con la librería Transformers mediante `GradiumPhononTTSForConditionalGeneration` y `AutoProcessor`.
- Soporte de cuantización q8 para reducir el peso del modelo.
- No dispone de tool calling, agentes, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura por voz en navegador: integración vía el paquete npm `phonon-tts`, que permite reproducir texto como audio en una pestaña sin backend, gracias al runtime WASM y al tamaño reducido del modelo cuantizado (64,5 MB).
- Asistentes de voz en aplicaciones móviles: uso del runtime Core ML en iOS/iPadOS/macOS o del runtime Android para sintetizar respuestas en el dispositivo, con streaming que reduce la latencia percibida al empezar a sonar antes de completar la frase.
- Accesibilidad y lectores de pantalla: conversión de texto a voz en tiempo real en equipos sin GPU, aprovechando que el modelo corre en CPU de portátil.
- Sistemas de anuncios y notificaciones: generación de avisos cortos en inglés con una voz consistente (por ejemplo, "Easton") mediante la CLI `ptts` o la API de Python, con salida a fichero WAV.
- Previsualización de contenido en editores: lectura de borradores o artículos en streaming dentro de una aplicación web, usando `tts.stream` para reproducir fragmentos a medida que se generan.
- Prototipado e investigación en TTS: experimentación con flow matching y el códec Mimi sobre un modelo pequeño y con licencia Apache 2.0, útil para estudiar latencia, calidad y despliegue en dispositivo.
- Integración en pipelines de Transformers: uso de `GradiumPhononTTSForConditionalGeneration` para incorporar TTS en flujos existentes de Hugging Face, con control manual de la división de textos largos mediante `processor.split_text`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero q8 ocupa 64,5 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; el modelo está diseñado para ejecutarse en CPU, navegador y dispositivos móviles. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo sin problema, pero no es necesario.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e integrada; también en CPU de portátil y en navegador.
- Opciones de despliegue: runtime `ptts` (PyPI, binario standalone, Homebrew), `phonon-tts` (npm, WASM), Core ML (iOS/macOS), Android, NPU Snapdragon (preview) y Transformers (`GradiumPhononTTSForConditionalGeneration`).
- Latencia y throughput estimados: no disponibles; la model card destaca el streaming con frames de 80 ms, pero no publica cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Pesos q8 | Idiomas | Licencia |
|---|---:|---:|---|---|
| phonon-31m-en | 31M | 64,5 MB | Inglés | Apache 2.0 |
| phonon-40m-en | 40M | 74,6 MB | Inglés | CC BY-NC 4.0 |
| phonon-40m-multilingual | 40M | 74,6 MB | 5 idiomas | CC BY-NC 4.0 |
| phonon-40m-es | 40M | 74,6 MB | Español | CC BY-NC 4.0 |

Dentro de la familia Phonon, phonon-31m-en es el único modelo con licencia Apache 2.0 y el de menor tamaño; los modelos de 40M ofrecen más idiomas pero con licencia CC BY-NC 4.0, que restringe el uso comercial. No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos TTS de otros desarrolladores.

## Limitaciones y advertencias

- Solo soporta inglés; no genera voz en otros idiomas.
- No se han publicado datos sobre sesgos del modelo, por lo que se desconoce su comportamiento ante distintos acentos, dialectos o registros.
- Riesgo de alucinación en la pronunciación: el tokenizador de Transformers no expande números, importes, símbolos ni direcciones; es necesario normalizar el texto o usar el runtime `ptts` con `lang=en`.
- Los textos largos deben dividirse manualmente con `processor.split_text` al usar Transformers.
- El modelo depende del códec Mimi para la decodificación de audio, lo que añade una dependencia externa al pipeline.
- No dispone de tool calling, agentes, visión ni otras capacidades multimodales.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de las dependencias (Pocket TTS, Mimi) antes de desplegar en producción.
- El repositorio asociado a esta ficha (nesoai-qa-org/gradium-phonon-31m-en) no registra descargas ni likes; la model card apunta a la organización `gradium` como origen canónico del modelo, por lo que conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nesoai-qa-org/gradium-phonon-31m-en
- Modelo canónico (organización Gradium): https://huggingface.co/gradium/phonon-31m-en
- Demo en navegador: https://huggingface.co/spaces/gradium/phonon
- Colección de la familia Phonon: https://huggingface.co/collections/gradium/phonon
- Runtime en GitHub: https://github.com/gradium-ai/xn-ptts
- Paquete Python (PyPI): https://pypi.org/project/ptts/
- Paquete navegador (npm): https://www.npmjs.com/package/phonon-tts
- Voces: https://huggingface.co/gradium/phonon-voices
- Documentación de Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/gradium_phonon_tts
- Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Discord: https://discord.gg/T85yt8kD33
- Lanzamientos del runtime: https://github.com/gradium-ai/xn-ptts/releases
- Guía Python: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-pyo3/README.md
- Guía navegador: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-wasm/js/README.md
- Guía Swift (Core ML): https://github.com/gradium-ai/xn-ptts/blob/main/ios/PhononTTS/README.md
- Guía Android: https://github.com/gradium-ai/xn-ptts/blob/main/android/README.md
- Preview NPU Snapdragon: https://github.com/gradium-ai/xn-ptts/blob/main/qnn/andro
