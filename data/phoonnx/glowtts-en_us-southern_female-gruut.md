# Phoonnx/glowtts-en_us-southern_female-gruut

## Resumen

`glowtts-en_us-southern_female-gruut` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera espectrogramas a partir de fonemas IPA producidos por el fonemizador gruut, que posteriormente son convertidos a audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`.

Se trata de un modelo especializado y de nicho: una única voz femenina de inglés estadounidense con acento sureño (`en-US`), pensado para su integración en asistentes de voz locales y sistemas de domótica basados en OVOS/Mycroft. No es un modelo de propósito general ni compite con los grandes sistemas TTS neuronales modernos en naturalidad o expresividad.

Su relevancia actual reside en su ligereza (repo de 0,1 GB), su formato ONNX listo para inferencia en CPU y su integración directa con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. Es una opción práctica para despliegues embebidos o sin GPU donde se prioriza la privacidad y la ejecución local frente a la calidad máxima de síntesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based generative model) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`), variante sureña femenina |
| Licencia | `other` (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que modela directamente la distribución de espectrogramas mel condicionada al texto de entrada, sin necesidad de alineamientos externos ni de un modelo de atención autorregresivo. Utiliza un mecanismo de alineamiento monotónico (MAS, Monotonic Alignment Search) durante el entrenamiento para aprender la correspondencia entre fonemas y frames de audio. El modelo produce un espectrograma mel que se convierte en waveform mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automáticamente por `phoonnx` junto con la voz.

El entrenamiento original fue realizado por Rhasspy como parte del proyecto Larynx v1.0, sobre un corpus de voz femenina de inglés sureño de Estados Unidos. No se dispone de información pública en la model card sobre el número de tokens, horas de audio, composición del dataset ni sobre si se aplicaron técnicas de RLHF o fine-tuning posterior. La entrada de texto no es texto crudo sino fonemas IPA en el alfabeto de gruut, por lo que el pipeline requiere el fonemizador `GruutPhonemizer` de `scriptconv` como front-end obligatorio.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (variante sureña femenina).
- Conversión de texto a fonemas IPA mediante gruut, integrada en el pipeline de `phoonnx`.
- Generación de espectrogramas mel que se convierten a audio WAV mediante HiFi-GAN.
- Ejecución en CPU mediante ONNX Runtime (sin requerir GPU).
- Integración nativa con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de LLM.
- No soporta clonación de voz, control de emociones ni SSML avanzado (no documentado).
- Capacidad multilingüe: no, únicamente `en-US`.

## Casos de uso

- **Asistentes de voz locales para domótica (OVOS/Mycroft):** el modelo se integra directamente mediante `ovos-tts-plugin-phoonnx` y puede configurarse en `mycroft.conf` para proporcionar respuestas habladas sin enviar texto a servicios en la nube, preservando la privacidad del usuario.
- **Síntesis en dispositivos embebidos sin GPU:** al ejecutarse en ONNX Runtime sobre CPU y ocupar solo 0,1 GB, es adecuado para Raspberry Pi u otros SBC donde no hay aceleración hardware disponible.
- **Lectura de notificaciones y alertas en sistemas domóticos:** frases cortas generadas dinámicamente (recordatorios, avisos meteorológicos, estados de sensores) que requieren baja latencia y no necesitan expresividad compleja.
- **Prototipado de interfaces conversacionales:** desarrolladores que construyen un asistente por voz pueden usar esta voz como placeholder funcional mientras evalúan la arquitectura del sistema, sustituyéndola después por una voz de mayor calidad.
- **Generación de audio para pruebas automatizadas:** en pipelines de CI/CD que validan la integración de TTS (por ejemplo, comprobando que el plugin OVOS produce WAV válidos), esta voz ligera permite ejecutar tests sin dependencias externas.
- **Audioguías o contenido pregrabado de nicho:** para proyectos que requieran específicamente una voz femenina sureña de EE. UU. y donde la calidad de estudio no sea un requisito, el modelo puede generar narraciones de forma local y reproducible.
- **Investigación sobre TTS basado en flows:** sirve como referencia reproducible de Glow-TTS en ONNX para experimentos académicos sobre alineamiento monotónico o calidad de vocoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En caso de usar GPU, el consumo es mínimo (repo de 0,1 GB, modelo y vocoder combinados por debajo de 1 GB en memoria).
- **GPU recomendadas:** no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo sobradamente, pero no aporta ventajas significativas frente a CPU.
- **Compatibilidad con GPU de consumo:** sí, cabe en cualquier GPU de consumo e incluso en iGPU.
- **Opciones de despliegue:** `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, ONNX Runtime. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos TTS de este tipo).
- **Latencia y throughput:** no disponibles en la información proporcionada. Al ser un modelo Glow-TTS pequeño ejecutado en CPU, se espera latencia de milisegundos a pocos segundos por frase, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/glowtts-en_us-southern_female-gruut` | Glow-TTS + HiFi-GAN | en-US (sureño, femenino) | 0,1 GB (repo) | `other` (sin registrar) | ONNX | Hugging Face |
| Piper (rhasspy/piper-voices) | VITS | Multi-idioma | Variable (decenas de MB por voz) | MIT (mayoría) | ONNX | Hugging Face / GitHub |
| Coqui TTS (voces Larynx/Jenny) | Tacotron2 / Glow-TTS / VITS | Multi-idioma | Variable | MPL 2.0 / otras | Varios | GitHub / Hugging Face |
| Kokoro-82M | StyleTTS2-like | Multi-idioma | ~82 M parámetros | Apache 2.0 | Safetensors / ONNX | Hugging Face |

La comparación directa es limitada: Piper es el sucesor natural de Larynx y ofrece mayor calidad y cobertura de voces con licencias más claras; Kokoro-82M representa el estado del arte en TTS ligero open source con licencia permisiva. Este modelo de Phoonnx destaca únicamente por su integración específica con OVOS y su empaquetado ONNX listo para usar.

## Limitaciones y advertencias

- **Licencia ambigua:** la model card indica explícitamente que "no hay licencia registrada" y recomienda consultar el release upstream de Rhasspy/Larynx antes de cualquier uso. El uso comercial no está garantizado y requiere verificación legal.
- **Sesgo de voz único:** solo reproduce una voz femenina sureña de EE. UU.; no hay control de género, edad, acento ni emoción.
- **Riesgo de alucinación acústica:** como todo modelo TTS, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del vocabulario de entrenamiento.
- **Dependencia del front-end gruut:** el texto debe fonemizarse con gruut; texto con caracteres no ingleses, números complejos o siglas puede normalizarse mal y producir audio defectuoso.
- **Limitación de idioma:** únicamente `en-US`; no soporta otros idiomas ni code-switching.
- **Calidad inferior al estado del arte:** Glow-TTS de Larynx v1.0 es una tecnología de 2021; la naturalidad y expresividad quedan por debajo de Piper, Kokoro o modelos neuronales recientes.
- **Dependencia de `phoonnx` (versión pre-release):** la instalación usa `pip install --pre phoonnx`, lo que implica que la API puede cambiar y no hay garantías de estabilidad para producción.
- **Sin métricas publicadas:** no hay benchmarks objetivos (MOS, WER, RTF) que permitan evaluar su calidad de forma cuantitativa.
- **Repo de bajas descargas (19) y 0 likes:** comunidad mínima, lo que reduce el soporte y la validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-southern_female-gruut
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_southern_english_female-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
