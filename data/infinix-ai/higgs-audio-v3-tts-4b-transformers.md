# Infinix-ai/higgs-audio-v3-tts-4b-transformers

## Resumen

Higgs Audio v3 TTS (4B) es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Boson AI y empaquetado por Infinix-ai para cargarse directamente con la librería `transformers` mediante `trust_remote_code`, sin necesidad de SGLang. El modelo parte de un backbone Qwen3-4B al que se le añade una cabeza y un embedding de audio multi-codebook fusionados, lo que le permite generar voz de alta calidad y realizar clonación de voz zero-shot a partir de una muestra de referencia.

La relevancia de este empaquetado radica en la compatibilidad: los pesos son idénticos al checkpoint original `bosonai/higgs-audio-v3-tts-4b`, pero se han añadido los ficheros `modeling_*.py`, `configuration_*.py` y el `auto_map` necesarios para que el modelo funcione con `AutoModelForCausalLM` estándar. Esto simplifica la integración en pipelines existentes de Hugging Face y elimina la dependencia de infraestructura de inferencia específica.

El modelo tiene 4.654.850.537 parámetros (aproximadamente 4,65 mil millones) y genera waveforms mono a 24 kHz. Está orientado exclusivamente al inglés y su licencia es de investigación y uso no comercial, heredada del checkpoint original de Boson AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3-4B) con cabeza y embedding de audio multi-codebook fusionados |
| Parametros totales | 4.654.850.537 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el LM admite bf16 recomendado, el codec requiere fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | `bosonai-higgs-audio-v3` (investigación / no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone Qwen3-4B estándar (transformer decoder-only) al que se le incorpora un embedding y una cabeza de audio multi-codebook fusionados. La generación emplea el patrón de retardo (delay pattern) de Higgs a través de 8 codebooks con un vocabulario de 1026 tokens, incluyendo los tokens especiales BOC (begin of codebook) y EOC (end of codebook). El proceso de de-delay y decodificación se gestiona internamente en el método `generate_speech`.

Para la codificación del audio de referencia y la decodificación de la waveform se utiliza el tokenizador `bosonai/higgs-audio-v2-tokenizer`, que se carga automáticamente en el primer uso. Un detalle técnico relevante es que el codec debe ejecutarse en fp32 porque la decodificación es inestable en bf16, mientras que el backbone LM puede ejecutarse en el dtype con el que se cargue (se recomienda bf16). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (TTS) zero-shot a partir de texto, generando waveforms mono a 24 kHz.
- Clonación de voz a partir de un clip de referencia, con transcripción opcional del mismo.
- Control de generación mediante parámetros de muestreo como `temperature` y `top_p`.
- Generación multi-codebook con patrón de retardo sobre 8 codebooks.
- Integración nativa con `transformers` mediante `trust_remote_code` y `AutoModelForCausalLM`.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de visión o audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para doblaje y localización: el modelo permite generar locuciones en una voz concreta a partir de un clip de referencia, lo que resulta adecuado para producir versiones dobladas de contenido audiovisual manteniendo la identidad vocal del hablante original.
- Audiolibros y narración automatizada: con `generate_speech` se puede convertir texto largo en voz de forma programática, integrándolo en pipelines de producción editorial que requieran narración consistente en inglés.
- Asistentes de voz y agentes conversacionales: el modelo puede actuar como capa de síntesis en un sistema de atención al cliente o asistente doméstico, generando respuestas habladas a partir del texto producido por un LLM.
- Accesibilidad: generación de voz para lectores de pantalla y aplicaciones de accesibilidad que necesiten una voz natural en inglés, con la posibilidad de personalizar la voz mediante clonación.
- Prototipado de personajes y videojuegos: creación rápida de voces para personajes usando clips de referencia, útil en fases de preproducción donde se requiere iterar sobre el diseño sonoro.
- Investigación en TTS y evaluación de modelos: al ser un empaquetado compatible con `transformers`, facilita la experimentación académica con modelos de síntesis de voz sin depender de infraestructura específica como SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,65 mil millones de parámetros en bf16, el backbone requiere aproximadamente 9,3 GB solo para los pesos; a ello hay que sumar el codec en fp32 y las activaciones, por lo que se recomienda al menos 16 GB de VRAM para un funcionamiento holgado.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bf16 sin cuantización. Una RTX 3090 (24 GB) también debería ser suficiente.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 16 GB o más de VRAM (RTX 4080, RTX 4090, RTX 3090). En GPUs de 8-12 GB requeriría cuantización, para la cual no se dispone de información específica.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `transformers >= 5.5`). No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Higgs Audio v3 TTS 4B (este) | 4,65 B | No disponible | Inglés | No comercial | safetensors |
| bosonai/higgs-audio-v3-tts-4b (original) | 4,65 B | No disponible | Inglés | No comercial | safetensors (requiere SGLang) |
| Alternativas de TTS open source | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación principal es con el checkpoint original de Boson AI, del que este empaquetado hereda los pesos sin cambios; la diferencia estriba en la compatibilidad con `transformers` frente a la dependencia de SGLang del original. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia de investigación y uso no comercial: heredada del checkpoint original `bosonai/higgs-audio-v3-tts-4b`, lo que restringe el uso comercial sin autorización expresa.
- Solo soporta inglés; no se ha documentado capacidad multilingüe.
- El codec debe ejecutarse en fp32 porque la decodificación es inestable en bf16, lo que incrementa los requisitos de memoria y añade complejidad al despliegue.
- Requiere `transformers >= 5.5` y `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio y revisar su procedencia antes de usarlo en producción.
- Riesgo de alucinación y artefactos en la síntesis de voz, especialmente en textos largos o fuera de dominio; no se han documentado evaluaciones formales al respecto.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes); es responsabilidad del usuario garantizar el consentimiento y el cumplimiento normativo.
- No se han publicado datos sobre sesgos acústicos, cobertura de acentos o robustez ante ruido en la referencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un empaquetado reciente y poco validado por la comunidad.

## Enlaces

- [HuggingFace: Infinix-ai/higgs-audio-v3-tts-4b-transformers](https://huggingface.co/Infinix-ai/higgs-audio-v3-tts-4b-transformers)
- [Modelo base: bosonai/higgs-audio-v3-tts-4b](https://huggingface.co/bosonai/higgs-audio-v3-tts-4b)
- [Tokenizador de audio: bosonai/higgs-audio-v2-tokenizer](https://huggingface.co/bosonai/higgs-audio-v2-tokenizer)
- [Licencia (LICENSE en el repositorio)](https://huggingface.co/Infinix-ai/higgs-audio-v3-tts-4b-transformers/blob/main/LICENSE)
