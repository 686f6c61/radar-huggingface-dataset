# aisha-org/navoiy-tts

## Resumen

Lison Navoiy TTS es un modelo de síntesis de voz expresiva en uzbeko desarrollado por Aisha (aisha-org), construido mediante fine-tuning de FunAudioLLM/CosyVoice2-0.5B. El artefacto publicado en HuggingFace contiene el checkpoint del componente LLM (`emotion_600h_joint.pt`, 1,88 GiB) junto con ejemplos de audio generado, y está pensado para investigación y demostraciones de TTS expresivo en uzbeko, así como para experimentos de generación de voz en agentes conversacionales.

El modelo no es un paquete de inferencia autónomo: requiere el runtime upstream de CosyVoice/CosyVoice2 y los assets del modelo base para funcionar. Su relevancia radica en cubrir una lengua de bajos recursos como el uzbeko con capacidades de clonación de voz y control emocional, algo poco habitual en modelos TTS abiertos, y hacerlo bajo licencia Apache-2.0.

El repositorio ocupa 2,0 GB e incluye demos en WAV para comprobaciones cualitativas (emociones como alegría, enfado, tristeza, sorpresa, así como lectura de números y fechas y formato largo). No se han publicado resultados de benchmarks objetivos (MOS, latencia) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice2 (TTS basado en LLM, fine-tuning sobre FunAudioLLM/CosyVoice2-0.5B) |
| Parametros totales | 0,5B (modelo base CosyVoice2-0.5B); checkpoint publicado de 1,88 GiB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en CosyVoice2, un sistema de síntesis de voz que emplea un componente de modelo de lenguaje sobre tokens de audio junto con un decodificador vocacional, y que soporta clonación de voz zero-shot y TTS expresivo. Navoiy TTS es un fine-tuning de ese modelo base de 0,5B parámetros para el uzbeko, con un checkpoint conjunto (`emotion_600h_joint.pt`) que, por su nombre, sugiere entrenamiento sobre aproximadamente 600 horas de audio con etiquetas emocionales, aunque la model card no detalla la composición exacta del dataset ni el número de tokens.

No se especifican en la información disponible detalles sobre el proceso de entrenamiento (RLHF, DPO, composición del corpus), más allá de la existencia de dos datasets relacionados del mismo autor: `aisha-org/uzbek-tts-corpus-v1` (corpus canónico sin emoción) y `aisha-org/uzbek-emotion-tts` (dataset de emoción separado). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de CosyVoice2.

## Capacidades

- Síntesis de voz (text-to-speech) en uzbeko a partir de texto.
- TTS expresivo con control de emoción (se incluyen demos de alegría, enfado, tristeza, sorpresa, calma y tono cálido de agente).
- Clonación de voz (voice cloning) heredada de CosyVoice2, condicionada a audio de referencia.
- Lectura correcta de números y fechas (demo `numbers_dates.wav`).
- Generación de audio de formato largo (demo `long_form.wav`).
- Integración en experimentos de agentes de voz (demo `warm_agent.wav`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de referencia.

## Casos de uso

- Agentes de voz en uzbeko: el modelo puede generar respuestas habladas con tono cálido y control emocional, adecuado para asistentes telefónicos o de atención al cliente en esa lengua.
- Audiolibros y contenido largo: la demo de formato largo sugiere uso para narración de textos extensos, con normalización previa de números y fechas.
- Localización de contenidos: conversión de guiones escritos en uzbeko a voz para vídeos, cursos o material divulgativo.
- Investigación en TTS de bajos recursos: evaluación de técnicas de fine-tuning de CosyVoice2 sobre una lengua con pocos datos, comparando calidad y expresividad.
- Prototipado de clonación de voz: experimentos con audio de referencia para crear voces personalizadas en uzbeko.
- Sistemas de accesibilidad: lectura en voz alta de textos para usuarios con discapacidad visual en uzbeko.
- Evaluación cualitativa de emociones: uso de las demos y del control emocional para estudiar la percepción de prosodia en esta lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las demos no sustituyen una evaluación sistemática de MOS ni de latencia en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint ocupa 1,88 GiB, por lo que en FP32 se requeriría al menos ~2 GB solo para pesos, más memoria para el runtime de CosyVoice2 y el decodificador de audio.
- GPU recomendadas: no especificadas por el autor; por el tamaño del modelo base (0,5B), es plausible su ejecución en GPUs consumer, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? No confirmado oficialmente; el tamaño reducido del modelo base lo hace probable, pero depende del runtime y de los assets adicionales.
- Opciones de despliegue: requiere el runtime upstream de CosyVoice/CosyVoice2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lison Navoiy TTS | 0,5B (base CosyVoice2) | no disponible | uzbeko | Apache-2.0 | HuggingFace (checkpoint + demos) |
| FunAudioLLM/CosyVoice2-0.5B | 0,5B | no disponible | multilingüe (según modelo base) | no disponible en esta ficha | HuggingFace |
| Alternativas TTS multilingües open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento (MOS, latencia) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un paquete de inferencia autónomo: exige el código de serving de CosyVoice/CosyVoice2 y dependencias compatibles.
- La calidad en producción depende del audio de referencia (prompt), la normalización del texto, la latencia del serving y el post-procesado.
- Solo soporta uzbeko; no se documentan otros idiomas.
- No se han publicado evaluaciones objetivas (MOS, WER, latencia); las demos son solo comprobaciones cualitativas.
- Riesgo de sesgos y alucinaciones acústicas inherente a los modelos TTS: posible pronunciación incorrecta de nombres propios, siglas o términos fuera del dominio de entrenamiento.
- La clonación de voz plantea riesgos de uso indebido (suplantación); la licencia Apache-2.0 permite uso comercial, pero conviene aplicar salvaguardas éticas y legales.
- El nombre del checkpoint (`emotion_600h_joint.pt`) sugiere ~600 horas de entrenamiento, pero no se confirma en la documentación.
- No se documentan cuantizaciones ni formatos alternativos de pesos.

## Enlaces

- HuggingFace: https://huggingface.co/aisha-org/navoiy-tts
- Modelo base: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Guía de configuración y limitaciones (inglés): https://voicelab.uz/blog/navoiy-tts-open-source-uzbek-text-to-speech
- Guía del modelo (uzbeko): https://aisha.group/uz/blog/navoiy-tts-open-source-uzbek-text-to-speech
- Corpus canónico sin emoción: https://huggingface.co/datasets/aisha-org/uzbek-tts-corpus-v1
- Dataset de emoción: https://huggingface.co/datasets/aisha-org/uzbek-emotion-tts
- DOI: https://doi.org/10.57967/hf/9615
