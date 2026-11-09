# MacEpic/pocket-tts-ru-coreml

## Resumen

Pocket TTS Russian (Shtorm) para Core ML es la exportación del modelo de síntesis de voz en ruso `ArtShtorm/Shtorm-PocketTTS-RU` (variante rápida, revisión `33f6c328`) al formato Core ML de Apple, realizada por MacEpic para su aplicación TextSniper. El modelo original emplea la arquitectura Pocket TTS de Kyutai, un sistema de text-to-speech ligero orientado a inferencia de baja latencia en dispositivos. La conversión no modifica los pesos, solo el formato, e incluye el tokenizador BPE SentencePiece convertido a `tokenizer.json`.

El repositorio ocupa 0,2 GB y contiene 15 archivos (398.732.561 bytes en total) descritos en `bundle.json` con sus tamaños y hashes SHA-256. Incluye además cuatro voces predefinidas generadas con el codificador de voz propio del modelo original a partir de grabaciones del corpus `kyutai/tts-voices`. Está pensado para ejecutarse de forma nativa en el ecosistema Apple (macOS/iOS) a través de Core ML, y TextSniper lo descarga automáticamente cuando el usuario selecciona Pocket TTS para ruso.

Su relevancia es doble: por un lado, demuestra el flujo de exportación de modelos TTS de Kyutai a Core ML mediante la herramienta `xn-ptts`; por otro, cubre una carencia práctica, la síntesis de voz en ruso en aplicaciones de escritorio Apple, con un modelo comunitario de licencia permisiva (CC BY 4.0). No se dispone de datos publicados sobre parámetros totales, longitud de contexto ni benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai), exportada a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos convertidos a Core ML; variante "fast") |
| Idiomas soportados | ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (bundle con `bundle.json`; pesos origen en `model_fast.safetensors`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pocket TTS de Kyutai, un sistema de síntesis de voz diseñado para ser compacto y ejecutable en dispositivos. La exportación a Core ML se realizó con el ejemplo `export_coreml` de la herramienta `xn-ptts` 0.6.0 (licencia dual Apache 2.0 / MIT), que también puede leer el bundle resultante. Los pesos provienen de la variante "fast" (`model_fast.safetensors`) del modelo comunitario de ArtShtorm, sin modificaciones más allá de la conversión de formato; el tokenizador es el BPE SentencePiece original convertido a `tokenizer.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Un detalle operativo relevante: el modelo solo pronuncia con claridad si el texto lleva marcas de acentuación tónica, por lo que TextSniper preprocesa el texto con RUAccent (`MacEpic/ruaccent-coreml`) antes de la síntesis. Las cuatro voces incluidas (estelle, alba, anna, bill) se generaron con el codificador de voz del modelo original a partir de grabaciones de `kyutai/tts-voices`, recortadas de silencio y con el token `bos_before_voice` antepuesto en formato `emb` de xn-ptts.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso a partir de texto escrito.
- Generación de audio con cuatro voces predefinidas: estelle, alba, anna y bill.
- Ejecución nativa en Apple vía Core ML (macOS/iOS), orientada a inferencia local.
- Requiere preprocesado de acentuación tónica (RUAccent) para una pronunciación clara.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Multilingüismo: únicamente ruso.

## Casos de uso

- Lectura de texto en voz alta en aplicaciones de accesibilidad para macOS/iOS: el modelo se integra vía Core ML y permite convertir texto seleccionado en audio en ruso sin conexión, con las voces incluidas en el bundle.
- Integración en herramientas de captura de pantalla y OCR como TextSniper: el modelo se descarga bajo demanda cuando el usuario elige Pocket TTS para ruso, ofreciendo lectura inmediata del texto reconocido.
- Generación de audiolibros o podcasts en ruso: las cuatro voces permiten alternar narradores; el pipeline debe aplicar RUAccent antes de la síntesis para una prosodia correcta.
- Avisos y notificaciones por voz en aplicaciones de escritorio: la inferencia local en Core ML evita dependencias de red y costes de API para frases cortas.
- Prototipado de asistentes de voz en ruso en entornos Apple: sirve como componente TTS dentro de un pipeline mayor, combinado con reconocimiento de voz y un LLM.
- Evaluación de la cadena de exportación `xn-ptts` a Core ML: útil para desarrolladores que quieran replicar el flujo con otros modelos Pocket TTS o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ejecutarse en Core ML sobre Apple Silicon, utiliza memoria unificada del sistema. El bundle completo ocupa 0,2 GB en disco (398.732.561 bytes en 15 archivos).
- GPU recomendadas: hardware Apple con soporte Core ML (chips de la familia M y A); no está pensado para GPU NVIDIA.
- Cabe en hardware de consumo: sí, en equipos Apple modernos, dado el tamaño reducido del bundle.
- Opciones de despliegue: Core ML (nativo), a través de la herramienta `xn-ptts` 0.6.0, o dentro de TextSniper.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacEpic/pocket-tts-ru-coreml | Ruso | Pocket TTS (Kyutai) | Core ML | CC BY 4.0 | Hugging Face |
| ArtShtorm/Shtorm-PocketTTS-RU | Ruso | Pocket TTS (Kyutai) | safetensors | CC BY 4.0 | Hugging Face |
| Modelos TTS rusos alternativos | Ruso | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos TTS en ruso en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza ruso; no admite otros idiomas.
- Requiere marcas de acentuación tónica para una pronunciación clara; sin RUAccent el resultado puede ser deficiente.
- Solo funciona en el ecosistema Apple (Core ML); no es portable a otros runtimes sin reconversión.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a ArtShtorm (Shtorm-PocketTTS-RU), a Kyutai (Pocket TTS) y a las fuentes de las voces (kyutai/tts-voices, VCTK, Voice-Zero).
- Las voces tienen licencias individuales (CC0 o CC BY 4.0) que deben respetarse por separado.
- Riesgo de alucinación acústica y artefactos de pronunciación no documentados; no hay benchmarks publicados que permitan evaluar la calidad objetiva.
- Sin datos sobre sesgos del modelo base ni sobre el dataset de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MacEpic/pocket-tts-ru-coreml
- Modelo base: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU
- Blog de Pocket TTS (Kyutai): https://kyutai.org/blog/2026-01-13-pocket-tts
- Kyutai: https://kyutai.org
- Herramienta de exportación xn-ptts: https://github.com/gradium-ai/xn-ptts
- Preprocesado de acentuación RUAccent para Core ML: https://huggingface.co/MacEpic/ruaccent-coreml
- Corpus de voces kyutai/tts-voices: https://huggingface.co/kyutai/tts-voices
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
