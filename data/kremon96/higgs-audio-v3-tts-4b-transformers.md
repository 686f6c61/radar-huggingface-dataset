# Kremon96/higgs-audio-v3-tts-4b-transformers

## Resumen

Higgs Audio v3 TTS (4B) es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Boson AI y empaquetado para transformers por el usuario Kremon96. Se trata de un modelo de 4.654.850.537 parámetros construido sobre un backbone Qwen3-4B al que se le añade una cabeza y un embedding de audio multi-codebook fusionados, lo que le permite generar waveforms de audio a partir de texto. El modelo base es `bosonai/higgs-tts-3-4b` y esta versión concreta es un port que elimina la dependencia de SGLang para cargarse con transformers estándar mediante `trust_remote_code`.

La relevancia de este empaquetado radica en que facilita la integración del modelo en pipelines que ya usan el ecosistema transformers, sin necesidad de infraestructura específica de servido. Soporta síntesis zero-shot y clonación de voz a partir de un clip de referencia, con o sin transcripción del mismo. La codificación del audio de referencia y la decodificación de la waveform se delegan en el tokenizer `bosonai/higgs-audio-v2-tokenizer`, que se carga automáticamente en el primer uso.

El modelo está orientado exclusivamente al inglés y su licencia es de investigación y uso no comercial, heredada del checkpoint original. El repositorio ocupa 9,3 GB y los pesos se distribuyen en formato safetensors, con la librería transformers como vía de carga principal y un requisito mínimo de versión `transformers >= 5.5`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con cabeza y embedding de audio multi-codebook fusionados |
| Parámetros totales | 4.654.850.537 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el ejemplo de uso emplea bfloat16; el códec requiere fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | bosonai-higgs-audio-v3 (investigación / no comercial) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3-4B, un transformer decoder-only estándar, con un embedding y una cabeza de audio multi-codebook fusionados. La generación emplea un patrón de retardo (delay pattern) sobre 8 codebooks con un vocabulario de 1026 tokens, incluyendo los especiales BOC (begin of codebook) y EOC (end of codebook). El de-delay y la decodificación se gestionan internamente dentro del método `generate_speech`. La codificación del audio de referencia y la decodificación final a waveform corren a cargo del tokenizer `bosonai/higgs-audio-v2-tokenizer`, que se carga automáticamente en el primer uso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Tampoco se detallan innovaciones adicionales más allá del esquema multi-codebook con delay pattern y la integración nativa con transformers. Un detalle técnico relevante es que el códec debe ejecutarse en fp32 porque la decodificación es inestable en bfloat16, mientras que el backbone LM puede ejecutarse en el dtype con el que se cargue (se recomienda bf16).

## Capacidades

- Síntesis de voz zero-shot a partir de texto, devolviendo una waveform mono a 24 kHz como tensor float32 en CPU.
- Clonación de voz a partir de un clip de referencia, con transcripción del mismo opcional.
- Control de generación mediante parámetros de muestreo como `temperature` y `top_p`.
- Generación de audio multi-codebook sobre 8 codebooks con manejo interno del delay pattern y de los tokens especiales.
- Carga nativa con transformers mediante `trust_remote_code`, sin dependencia de SGLang.
- Soporte exclusivo de inglés; no se declaran capacidades multilingües.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Generación de locuciones para audiolibros y contenido editorial: el modelo sintetiza texto en inglés a 24 kHz con calidad de voz natural, adecuado para producir capítulos completos por lotes.
- Clonación de voz para doblaje y localización: a partir de un clip de referencia de un actor, se puede generar nuevo diálogo manteniendo el timbre, útil en prototipos de doblaje antes de la grabación final.
- Asistentes de voz en prototipos de investigación: integrado vía transformers en un pipeline Python, permite experimentar con respuestas habladas en entornos de laboratorio sin infraestructura de servido adicional.
- Accesibilidad y lectura en voz alta: conversión de documentos y artículos a audio para personas con discapacidad visual, aprovechando la generación zero-shot sin necesidad de entrenamiento adicional.
- Generación de datasets de audio sintético: producción de muestras de voz etiquetadas para entrenar o evaluar otros sistemas de ASR o de habla, siempre dentro del marco de uso no comercial de la licencia.
- Pruebas de concepto de interfaces conversacionales: validación de flujos de voz en aplicaciones antes de contratar servicios comerciales de TTS, con la ventaja de ejecución local y control total sobre los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,65 mil millones de parámetros, en bfloat16 los pesos del backbone ocupan aproximadamente 9,3 GB, a lo que hay que sumar el códec en fp32 y las activaciones.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría esperar viabilidad en GPUs con 16 GB o más de VRAM, aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del repo (9,3 GB) sugiere que una GPU de 16 GB podría albergarlo en bf16, pero no hay datos oficiales.
- Opciones de despliegue: transformers con `trust_remote_code` (vía documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Higgs Audio v3 TTS 4B (este port) | 4,65 B | No disponible | Inglés | No comercial (bosonai-higgs-audio-v3) | Hugging Face, transformers |
| bosonai/higgs-audio-v3-tts-4b (original) | 4,65 B | No disponible | Inglés | No comercial | Hugging Face, SGLang |
| bosonai/higgs-audio-v2-tokenizer | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La comparativa con alternativas de terceros no está disponible en la información proporcionada. La diferencia principal frente al checkpoint original es el modo de carga: este port funciona con transformers estándar, mientras que el original está pensado para SGLang.

## Limitaciones y advertencias

- Licencia de investigación y uso no comercial: no se permite uso comercial sin autorización expresa del titular de los derechos.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- La decodificación del códec es inestable en bfloat16 y debe ejecutarse en fp32, lo que incrementa los requisitos de memoria y puede afectar al rendimiento.
- Requiere `transformers >= 5.5` y `trust_remote_code=True`, lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en producción.
- Riesgo de alucinación y artefactos en la voz generada, especialmente en textos largos o con puntuación atípica; no se documentan mitigaciones.
- La clonación de voz plantea riesgos éticos y legales (suplantación, deepfakes); debe usarse con consentimiento explícito de la persona cuya voz se clona.
- No se dispone de información sobre sesgos demográficos o acústicos del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria del empaquetado.
- El autor del port (Kremon96) no es el desarrollador original del modelo; los pesos son copia del checkpoint de Boson AI, pero la licencia y el soporte dependen del upstream.

## Enlaces

- Repositorio del port: https://huggingface.co/Kremon96/higgs-audio-v3-tts-4b-transformers
- Modelo base original: https://huggingface.co/bosonai/higgs-audio-v3-tts-4b
- Tokenizer de audio: https://huggingface.co/bosonai/higgs-audio-v2-tokenizer
- Repositorio alternativo mencionado en el ejemplo de uso: https://huggingface.co/multimodalart/higgs-audio-v3-tts-4b-transformers
- Licencia: archivo `LICENSE` dentro del repositorio del modelo.
