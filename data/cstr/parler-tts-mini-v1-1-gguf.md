# cstr/parler-tts-mini-v1.1-GGUF

## Resumen

Parler TTS Mini v1.1 GGUF es la conversión al formato GGUF/ggml del modelo original `parler-tts/parler-tts-mini-v1.1`, publicada por el usuario `cstr` para su uso con el runtime en C++ CrispASR. Se trata de un sistema de síntesis de voz (text-to-speech) condicionado por prompt: el usuario describe la voz deseada en lenguaje natural mediante el parámetro `--instruct` y el modelo genera habla que se ajusta a esa descripción. El modelo original lo desarrolló el equipo de Parler TTS (proyecto independiente, hoy mantenido por la comunidad) y esta versión GGUF permite ejecutarlo sin PyTorch, en entornos ligeros basados en ggml.

La arquitectura combina tres componentes empaquetados en un único fichero GGUF: un encoder T5 (flan-t5-large, 24 capas, ~335M parámetros), un decoder autorregresivo de estilo MusicGen (24 capas, 9 codebooks, ~300M parámetros) que genera tokens de audio DAC, y un codec DAC a 44 kHz (~75M parámetros) que sintetiza la onda final. En total, unos 72.916 millones de parámetros según los safetensors del modelo base. El resultado es un TTS de calidad razonable que cabe en GPUs de consumo e incluso en CPU, con ficheros desde 569 MB (Q4_K) hasta 1,8 GB (F16).

La relevancia de esta versión radica en su portabilidad: al estar en GGUF, se puede ejecutar con CrispASR (y potencialmente con otras herramientas compatibles con ggml) sin depender del stack de Hugging Face Transformers. La licencia Apache 2.0 permite uso comercial, y el modelo está pensado para síntesis de voz en inglés con control fino de características vocales (género, edad, tono, velocidad, entorno acústico). Es, por tanto, una opción práctica para prototipado y despliegue de TTS en inglés con control por prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder T5 (flan-t5-large) + decoder autorregresivo estilo MusicGen + codec DAC 44 kHz |
| Parametros totales | ~72.916 M (según safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el texto de entrada es una frase corta; el límite práctico es ~30 s de audio generado) |
| Tipos de cuantizacion | F16 (1,8 GB), Q8_0 (979 MB), Q4_K (569 MB); el codec DAC se mantiene siempre en F16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño de tres etapas. Primero, un encoder T5 (flan-t5-large, d=1024, 16 cabezas, 24 capas, FFN gated-GELU con bias de posición relativa) procesa la descripción de voz en lenguaje natural. Segundo, un decoder transformer causal de estilo MusicGen (d=1024, 16 cabezas, 24 capas, 9 codebooks, positional encoding sinusoidal) genera autorregresivamente tokens de audio DAC condicionados por esa descripción y por el texto a sintetizar. Tercero, un codec DAC (Descript Audio Codec) a 44 kHz con 9 codebooks de 1024 entradas, activaciones Snake y upsampling 512x reconstruye la forma de onda final.

El modelo base original se entrenó sobre LibriTTS-R y MLS (ambos derivados de grabaciones de LibriVox), con 34 hablantes caracterizados por nombre (Jon, Lea, Gary, Jenna, Mike, Laura, etc.) para consistencia de hablante. La model card de esta conversión GGUF no detalla el número de tokens de entrenamiento ni si hubo RLHF/DPO; esos datos corresponden al modelo original y no se reproducen aquí. La innovación principal de esta versión es la conversión a ggml con preservación del tokenizador BPE embebido (`parler.tokenizer.is_bpe=true`) y la decisión de mantener el codec DAC en F16 en todas las cuantizaciones, porque los codecs de audio son sensibles a la precisión y el ruido de cuantización produce artefactos audibles.

## Capacidades

- Síntesis de voz en inglés condicionada por prompt: el parámetro `--instruct` permite describir la voz (género, edad, tono, velocidad, entorno acústico) en lenguaje natural.
- Generación de audio de hasta ~30 segundos por invocación (2580 pasos autorregresivos a 44,1 kHz con hop de 512).
- Control de características vocales mediante descripciones específicas; descripciones más detalladas producen mejores resultados.
- Salida en formato WAV mediante `--tts-output`.
- Ejecución sin PyTorch: backend `parler-tts` en CrispASR, con descarga automática opcional (`--auto-download`).
- No soporta tool calling ni function calling (no aplica a un TTS).
- No soporta agentes ni razonamiento multi-paso (no aplica).
- No soporta visión, audio de entrada ni otras modalidades.
- No soporta streaming: la generación es en una sola pasada.

## Casos de uso

- Generación de locuciones para vídeos y podcasts: se describe la voz deseada (por ejemplo, "un hombre joven que habla con claridad en un estudio") y se sintetiza el guion en inglés, con ficheros Q8_0 de 979 MB que caben en cualquier GPU moderna.
- Prototipado de asistentes de voz en inglés: integración en un pipeline de CrispASR o en un servicio propio para generar respuestas habladas con un timbre controlado por prompt, sin dependencia de PyTorch.
- Accesibilidad y lectura de textos: conversión de documentos en inglés a audio con velocidad y tono ajustables mediante la descripción de voz, útil para lectores de pantalla personalizados.
- Doblaje y localización de contenido en inglés: generación de voces consistentes (usando la misma descripción `--instruct`) para múltiples fragmentos de un mismo proyecto, manteniendo coherencia tímbrica.
- Pruebas A/B de características vocales: al variar la descripción se pueden comparar estilos (edad, género, entorno) de forma rápida y barata, útil en investigación de percepción de voz.
- Despliegue en entornos con recursos limitados: la variante Q4_K (569 MB) permite ejecutar TTS en CPU o GPUs de gama baja, por ejemplo en dispositivos embebidos o portátiles sin GPU dedicada.
- Generación de audio para datasets sintéticos: creación de corpus de habla en inglés con voces variadas controladas por prompt, útil para aumento de datos en ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión GGUF no incluye métricas objetivas (MOS, WER, RTF) ni comparaciones numéricas con otros TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ~1,8 GB de pesos (más overhead de runtime); Q8_0 ~979 MB; Q4_K ~569 MB (codec DAC en F16 en todos los casos).
- GPU recomendadas: cualquier GPU con al menos ~2-3 GB de VRAM libre para F16; RTX 3060, RTX 4090, A100, H100 son sobradas. La variante Q4_K puede ejecutarse en GPUs de gama baja o incluso en CPU.
- Cabe en GPU de consumo: sí, en todas las variantes; la Q4_K es la más adecuada para portátiles y equipos sin GPU dedicada.
- Opciones de despliegue: CrispASR (runtime principal, backend `parler-tts`, CLI `crispasr`); no se documentan otras herramientas compatibles en la información disponible.
- Latencia y throughput estimados: no disponibles; la model card solo indica el límite de ~30 s de audio por generación (2580 pasos autorregresivos) y que no hay streaming.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Parler TTS Mini v1.1 GGUF (este) | ~72,9 M | ~30 s de audio | Inglés | Apache 2.0 | GGUF | Control por prompt de voz; runtime C++ (CrispASR) |
| parler-tts/parler-tts-mini-v1.1 (original) | ~72,9 M | ~30 s de audio | Inglés | Apache 2.0 | Safetensors | Requiere PyTorch/Transformers |
| Parler TTS Large (original) | No disponible en la información | No disponible | Inglés | Apache 2.0 | Safetensors | Versión mayor del mismo proyecto; datos no verificados aquí |
| Otros TTS open source (por ejemplo, Coqui XTTS, Piper) | No disponible en la información | No disponible | Multilingüe / inglés según variante | Varía (MPL-2.0, MIT, etc.) | Varía | No comparados numéricamente por falta de datos |

## Limitaciones y advertencias

- La decodificación greedy (temperature=0) produce salidas degeneradas; debe usarse temperature=1.0 (valor por defecto).
- El RNG de C++ (`std::mt19937`) difiere del de PyTorch: la misma semilla produce audio distinto entre implementaciones.
- La calidad varía con la descripción de voz; descripciones más específicas dan mejores resultados.
- No hay soporte de streaming: el audio se genera en una sola pasada.
- Límite de ~30 s de audio por generación (2580 pasos autorregresivos a 44,1 kHz con hop de 512).
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación no aplica en el sentido textual, pero la síntesis puede producir artefactos audibles o prosodia incorrecta en textos largos o atípicos.
- Sesgos: el modelo se entrenó con 34 hablantes de LibriTTS-R y MLS, lo que puede limitar la diversidad de voces y acentos reproducibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte sobre la procedencia de las voces (EU AI Act Art. 50(4)): el modelo reproduce hablantes identificables de forma pseudónima y CrispASR marca `speaker_identity=real_person`, añadiendo una divulgación hablada de IA en la salida. Esto no exime de obligaciones de transparencia en producción.
- El codec DAC se mantiene en F16 incluso en Q4_K para evitar artefactos de cuantización; no debe cuantizarse más agresivamente sin validación auditiva.
- Se eliminó un conjunto de ficheros duplicados con tokenizador roto (2026-08-03); deben usarse los nombres `parler-tts-mini-v1.1-*` y no `parler-mini-v1.1-*`.

## Enlaces

- Hugging Face (esta conversión GGUF): https://huggingface.co/cstr/parler-tts-mini-v1.1-GGUF
- Modelo base original: https://huggingface.co/parler-tts/parler-tts-mini-v1.1
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Documentación EU AI Act de CrispASR: https://github.com/CrispStrobe/CrispASR/blob/main/docs/eu-ai-act.md
- Script de conversión: `models/convert-parler-to-gguf.py` (incluido en el repositorio CrispASR)
