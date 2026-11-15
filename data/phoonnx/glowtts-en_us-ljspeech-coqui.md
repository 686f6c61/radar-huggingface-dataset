# Phoonnx/glowtts-en_us-ljspeech-coqui

## Resumen

Glow-TTS en_us_ljspeech_coqui es un modelo de síntesis de voz (text-to-speech) empaquetado en formato ONNX por Phoonnx para su librería de inferencia `phoonnx`. El modelo original procede de Coqui TTS (versión 0.6.1) y fue entrenado sobre el corpus LJSpeech, un dataset de una única hablante femenina en inglés estadounidense. La arquitectura Glow-TTS es un modelo de flujo normalizador (normalizing flow) que genera espectrogramas mel a partir de fonemas, que posteriormente son convertidos a audio mediante un vocoder separado (Multiband-MelGAN).

El modelo resuelve la tarea de síntesis de voz en inglés estadounidense con una voz femenina concreta, y su relevancia actual radica en que está empaquetado para ejecución ONNX ligera, integrable en entornos Python y en el asistente OVOS. Su front-end textual utiliza fonemas gruut en alfabeto IPA, lo que requiere la dependencia `scriptconv[gruut]` para la normalización y fonemización del texto de entrada.

El repositorio es de pequeño tamaño (aproximadamente 0,1 GB), lo que refleja un modelo compacto orientado a inferencia en CPU o GPU de gama baja. El modelo no incluye el vocoder en el mismo repositorio: `phoonnx` descarga automáticamente el vocoder `multiband_melgan-en_us-ljspeech` asociado a la voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) con vocoder Multiband-MelGAN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en ONNX) |
| Idiomas soportados | `en-US` (ingles estadounidense) |
| Licencia | other (el upstream declara MPL en la lista de modelos de Coqui TTS) |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizadores que transforma una distribución latente en un espectrograma mel, condicionado por fonemas de entrada. A diferencia de los modelos autorregresivos, Glow-TTS permite una síntesis paralela y determinista mediante alineamiento monotónico, lo que reduce la latencia de generación del espectrograma. El vocoder Multiband-MelGAN se encarga de convertir el espectrograma mel en forma de onda de audio.

El entrenamiento se realizó sobre el corpus LJSpeech, compuesto por grabaciones de una única hablante femenina en inglés estadounidense (aproximadamente 24 horas de audio transcrito, aunque el número exacto de tokens o horas no se detalla en la información proporcionada). El modelo original fue publicado por Coqui dentro de la release v0.6.1 de Coqui TTS. No se dispone de información sobre uso de RLHF, DPO ni de composición detallada del dataset más allá del corpus LJSpeech.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Generación de espectrogramas mel mediante arquitectura Glow-TTS y conversión a audio con vocoder Multiband-MelGAN.
- Fonemización de entrada mediante `gruut` (alfabeto IPA) a través de `scriptconv`.
- Integración con la librería `phoonnx` para inferencia en Python.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Voz única predefinida (`coqui-en-ljspeech-glow-tts`), correspondiente a la hablante de LJSpeech.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking, al tratarse de un modelo TTS.

## Casos de uso

- **Síntesis de voz para asistentes domésticos (OVOS):** el modelo se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona la voz `coqui-en-ljspeech-glow-tts` en `mycroft.conf`, permitiendo respuestas habladas en inglés estadounidense en asistentes locales.
- **Generación de audio para lectura de textos:** se puede usar `voice.synthesize_wav(text, wav_file)` para convertir frases en inglés a ficheros WAV, útil para audiolibros, locuciones o narración automatizada.
- **Prototipado de pipelines TTS en Python:** al ejecutarse sobre ONNX y con un repositorio de 0,1 GB, permite montar demos de síntesis de voz en entornos con pocos recursos sin depender de frameworks pesados.
- **Accesibilidad:** conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, limitado al inglés estadounidense y a la voz de LJSpeech.
- **Generación de locuciones para vídeos o podcasts:** síntesis de guiones en inglés con una voz femenina consistente, descargando el vocoder automáticamente mediante `phoonnx`.
- **Evaluación de arquitecturas TTS en producción:** comparación del rendimiento de Glow-TTS frente a otros modelos empaquetados en la colección Glow-TTS de Phoonnx, usando la misma librería de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; el tamaño del repositorio (0,1 GB) sugiere un modelo compacto que puede ejecutarse en CPU.
- GPU recomendadas: no disponible; al ser un modelo ONNX de pequeño tamaño, es plausible su ejecución en CPU y en GPUs consumer, aunque no se aportan datos oficiales.
- Compatibilidad con GPU consumer: no disponible de forma explícita; el tamaño reducido del repositorio indica que no requiere hardware de gama alta.
- Opciones de despliegue: `phoonnx` (librería Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-ljspeech-coqui | Glow-TTS | en-US | Multiband-MelGAN | other (upstream MPL) | ONNX | Hugging Face (Phoonnx) |
| Otros modelos de la colección Glow-TTS de Phoonnx | Glow-TTS | no disponible por modelo | no disponible por modelo | no disponible por modelo | ONNX | Hugging Face (colección Phoonnx) |
| Modelos Coqui TTS originales (v0.6.1) | Glow-TTS y otras | en (LJSpeech) | Multiband-MelGAN | MPL (según lista Coqui) | PyTorch / checkpoints | GitHub Coqui TTS releases |

No se dispone de datos de rendimiento comparativo (benchmarks, MOS, latencia) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Voz única:** el modelo está entrenado sobre LJSpeech, una única hablante femenina; no permite clonación de voz ni selección de hablante.
- **Idioma restringido:** solo soporta inglés estadounidense (`en-US`); no hay soporte multilingüe.
- **Dependencia de fonemización:** requiere `scriptconv[gruut]` y el fonemizador `GruutPhonemizer` para convertir texto a fonemas IPA; un texto mal normalizado puede degradar la síntesis.
- **Dependencia del vocoder:** la calidad final del audio depende del vocoder `multiband_melgan-en_us-ljspeech`, que `phoonnx` descarga por separado; su ausencia o fallo de descarga impide la síntesis.
- **Licencia:** la model card indica `other` en Hugging Face y que el upstream declara `MPL` en la lista de modelos de Coqui TTS; conviene verificar las condiciones exactas antes de uso comercial.
- **Riesgo de alucinación:** no aplicable en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o en nombres propios.
- **Sesgos:** no se documentan sesgos específicos, pero la voz única de LJSpeech limita la diversidad de hablantes y acentos.
- **Caveat de producción:** el modelo está empaquetado para `phoonnx` y OVOS; no se documentan garantías de latencia, throughput ni estabilidad para despliegues a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-ljspeech-coqui
- Modelo upstream (Coqui TTS v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--glow-tts.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder asociado: https://huggingface.co/Phoonnx/multiband_melgan-en_us-ljspeech
