# davidxifeng/LiquidAI-LFM3-Omni-2B-MLX-4bit-uzu

## Resumen

LFM3-Omni-2B es el primer modelo ómnimodal de la familia LFM3 de Liquid AI. Se trata de un modelo end-to-end capaz de comprender texto, imágenes, vídeo y audio, y de responder tanto en texto como en voz sintetizada. Sustituye en un único artefacto a la combinación tradicional de un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS, lo que simplifica los despliegues en dispositivos con recursos limitados.

El modelo está diseñado para inferencia on-device: teléfonos, portátiles y hardware edge. Según la model card, la variante original declara 2,2B parámetros, aunque el repositorio concreto que nos ocupa es una conversión a 4 bits para el motor `uzu` (Metal) y los pesos safetensors del repo suman 1.194.584.832 parámetros. Esta ficha describe el repositorio `davidxifeng/LiquidAI-LFM3-Omni-2B-MLX-4bit-uzu`, una repackaging de los pesos `LiquidAI/LFM3-Omni-2B-MLX-4bit` sin recuantización, orientada a macOS/Apple Silicon.

La relevancia actual radica en la combinación de modalidades (audio, imagen, vídeo, texto) en un modelo pequeño, con licencia LFM Open License v1.0 y soporte para 23 idiomas, lo que lo hace atractivo para asistentes conversacionales por voz y aplicaciones de accesibilidad en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ómnimodal (encoder de audio LFM3, encoder de visión, conector multimodal, decodificador de texto y `depth_decoder` + `liquid_codec` para salida de voz). Detalles internos exactos: no disponibles |
| Parametros totales | 1.194.584.832 (pesos safetensors del repo); la model card original declara 2,2B para LFM3-Omni-2B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX-4bit, repackaging de `LiquidAI/LFM3-Omni-2B-MLX-4bit`); los tags mencionan también 8-bit |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, `license: other`) |
| Formato de pesos | safetensors (repo de 2,3 GB), con `custom_code` para transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer ómnimodal con varios componentes especializados: un encoder de audio LFM3, un encoder de visión, conectores multimodales que proyectan las representaciones al espacio del decodificador, un decodificador de lenguaje y un módulo de salida de voz compuesto por `depth_decoder` y `liquid_codec`. La model card menciona explícitamente la capacidad de "ver y escuchar a la vez" en vídeos con sonido, lo que implica fusión temporal de flujos visuales y auditivos.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal en la información proporcionada. La model card original referencia la familia LFM3 (base, text, vision, audio, omni y decision models) y un blog de lanzamiento, pero los detalles técnicos de entrenamiento no están incluidos en los datos disponibles.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio en un único modelo end-to-end.
- Generación de respuestas en texto y en voz sintetizada (speech-to-speech).
- Transcripción de audio (ASR) mediante el endpoint `/v1/audio/transcriptions`.
- Traducción de audio mediante `/v1/audio/translate`.
- Síntesis de voz mediante `/v1/audio/speech`.
- Comprensión conjunta de vídeo con banda sonora (razonamiento audiovisual).
- Conversación multimodal multi-turno por voz ("chat out loud").
- Soporte multilingüe en 23 idiomas, incluyendo español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible.
- Capacidades de agente multi-step: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de voz en dispositivos móviles: el modelo recibe audio del micrófono y responde con voz sintetizada, sustituyendo la cadena ASR + LLM + TTS por un único modelo de ~1,2B parámetros, adecuado para ejecución local en teléfonos.
- Descripción de imágenes para accesibilidad: un usuario invidente envía una foto y una pregunta por voz; el modelo responde hablando, todo en el dispositivo sin enviar datos a la nube.
- Transcripción y traducción de reuniones: mediante los endpoints `/v1/audio/transcriptions` y `/v1/audio/translate` del servidor `uzu`, se puede procesar audio de reuniones y generar actas o traducciones en los 23 idiomas soportados.
- Análisis de vídeo con audio: para clips con sonido, el modelo puede responder preguntas que requieren combinar lo que se ve y lo que se oye (por ejemplo, identificar a un hablante y describir su entorno).
- Asistentes conversacionales on-device para portátiles Apple Silicon: al estar empaquetado para el motor `uzu` con Metal, se puede desplegar como servidor HTTP local (`/v1/chat/completions`) y servir una WebUI Omni integrada.
- Prototipado rápido de aplicaciones any-to-any: al exponer una API compatible con OpenAI (`/v1/chat/completions`, endpoints de audio), se integra en pipelines existentes sin reescribir la capa de cliente.
- Investigación en modelos ómnimodales pequeños: la licencia LFM 1.0 y el tamaño reducido permiten experimentación académica con hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 2,3 GB en safetensors a 4 bits; se puede estimar un uso de memoria en torno a 2-4 GB para los pesos, más overhead de activaciones y buffers de audio/visión (no disponible con precisión).
- GPU recomendadas: el repositorio está empaquetado para MLX (Metal), por lo que el destino natural es Apple Silicon (M1/M2/M3/M4). No se documentan requisitos para CUDA.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon; para GPUs NVIDIA consumer no hay confirmación en la información disponible.
- Opciones de despliegue: motor `uzu` (`uzu-engine` y `cli` con servidor HTTP y WebUI), disponible en `https://github.com/davidxifeng/uzu`. Compatible con `transformers` (tag `custom_code`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B (este repo, 4-bit MLX) | 1,19B en safetensors (2,2B declarados en la card original) | no disponible | texto, imagen, vídeo, audio (entrada y salida de voz) | LFM 1.0 | Hugging Face, motor `uzu` |
| Qwen2-Audio | no disponible en esta ficha | no disponible | audio + texto | no disponible | Hugging Face |
| MiniCPM-o | no disponible en esta ficha | no disponible | texto, imagen, audio | no disponible | Hugging Face |
| Llama 3.2 1B/3B | no disponible en esta ficha | no disponible | solo texto | Llama 3.2 Community License | Hugging Face |

Nota: los datos de los modelos alternativos no se han verificado en la información proporcionada; se incluyen como referencia de categoría. Se recomienda consultar sus fichas oficiales para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo multilingüe de 23 idiomas, es probable un rendimiento desigual entre idiomas, pero no hay datos que lo confirmen.
- Riesgo de alucinación: no cuantificado en la información disponible. Como todo LLM generativo, es susceptible de producir contenido plausible pero incorrecto, especialmente en tareas de comprensión audiovisual.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada. El soporte de 23 idiomas está declarado, pero no se especifica la calidad relativa por idioma.
- Restricciones de licencia: LFM Open License v1.0 (`license: other`). Es necesario revisar el archivo `LICENSE` del repo original para confirmar condiciones de uso comercial, redistribución y atribución.
- Este repositorio concreto es un repackaging de terceros (autor `davidxifeng`), no oficial de Liquid AI; la integridad y el comportamiento pueden diferir del repo original `LiquidAI/LFM3-Omni-2B`.
- Dependencia del motor `uzu` (Rust, Metal): no es un formato estándar de despliegue y limita la portabilidad fuera de Apple Silicon.
- El tag `8-bit` aparece en los metadatos del repo, pero la descripción indica 4 bits; conviene verificar la cuantización real antes de usarlo en producción.
- El repo tiene muy pocas descargas (28) y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.
- No se documentan salvaguardas, filtros de contenido ni evaluaciones de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/davidxifeng/LiquidAI-LFM3-Omni-2B-MLX-4bit-uzu
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Pesos MLX-4bit originales: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-4bit
- Motor `uzu`: https://github.com/davidxifeng/uzu
- Blog de lanzamiento LFM3: https://www.liquid.ai/blog/lfm3
- Documentación LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Web oficial de Liquid AI: https://www.liquid.ai/
