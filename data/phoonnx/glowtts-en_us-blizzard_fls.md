# Phoonnx/glowtts-en_us-blizzard_fls

## Resumen

Glow-TTS en inglés estadounidense (en-US) entrenado sobre el corpus Blizzard FLS y empaquetado en formato ONNX para la librería phoonnx. El modelo original procede de Rhasspy, dentro del proyecto Larynx, y esta ficha corresponde al reempaquetado realizado por Phoonnx para su uso con la librería de síntesis de voz ONNX del mismo nombre. Se trata de un modelo acústico Glow-TTS que genera espectrogramas a partir de fonemas IPA producidos por el fonemizador gruut; la conversión final a audio la realiza un vocoder HiFi-GAN externo (hifigan-multi-vctk-small).

El modelo resuelve la síntesis de voz (text-to-speech) para una única voz en inglés de Estados Unidos. No es un modelo de lenguaje general ni un sistema TTS multilingüe: su alcance se limita a la voz `en-us-blizzard_fls` y al idioma inglés. Su relevancia actual reside en que permite desplegar TTS local, sin dependencias de servicios en la nube, dentro del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, y en que el formato ONNX facilita la inferencia en CPU.

El repositorio ocupa aproximadamente 0,1 GB y acumula 535 descargas. La licencia figura como "other" y la model card advierte explícitamente de que no hay licencia registrada para este empaquetado, por lo que debe verificarse la licencia del release original de Larynx antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (síntesis por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés de Estados Unidos (en-US) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamaño del repositorio | ~0,1 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la alineación entre texto y espectrograma sin necesidad de un aligner externo ni de atención autoregresiva, lo que permite generar espectrogramas en paralelo y con mayor rapidez que arquitecturas autoregresivas como Tacotron 2. En este caso, el modelo acústico recibe fonemas IPA generados por gruut y produce un espectrograma mel que el vocoder HiFi-GAN (variante multi-VCTK small) convierte en forma de onda de audio.

El modelo fue entrenado originalmente por Rhasspy sobre el corpus Blizzard FLS (una voz femenina en inglés estadounidense) dentro del proyecto Larynx v1.0. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o ajuste fino adicional. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de Glow-TTS.

## Capacidades

- Síntesis de voz (text-to-speech) mono-hablante en inglés de Estados Unidos.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut, con normalización de texto previa a cargo de scriptconv.
- Generación de espectrogramas mediante el modelo acústico Glow-TTS y conversión a audio con el vocoder HiFi-GAN.
- Integración con el ecosistema OVOS/Mycroft a través de `ovos-tts-plugin-phoonnx`.
- Ejecución local en formato ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- Capacidad multilingüe: no; únicamente inglés (en-US).

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas sin conexión a internet ni servicios externos.
- Lectura de notificaciones y alertas en sistemas domóticos: al ejecutarse en formato ONNX y con un tamaño de repositorio reducido (~0,1 GB), puede desplegarse en dispositivos de recursos limitados para leer mensajes cortos en inglés.
- Síntesis por lotes de contenido en inglés: generación de audiolibros, avisos o guiones mediante la API de Python de phoonnx, escribiendo la salida en ficheros WAV.
- Prototipado de interfaces de voz: permite validar pipelines de TTS (normalización de texto, fonemización con gruut, síntesis) antes de invertir en voces comerciales o modelos de mayor tamaño.
- Accesibilidad: lectura en voz alta de texto en pantalla para usuarios angloparlantes en aplicaciones de escritorio o web con backend Python.
- Pruebas de integración continua de sistemas de voz: al ser un modelo determinista y ligero, sirve para verificar pipelines de audio en CI sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (~0,1 GB) sugiere que el modelo puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican en la documentación; por el tamaño del modelo, cualquier GPU consumer reciente sería suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido, aunque no se documenta oficialmente.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-blizzard_fls | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Hugging Face, 535 descargas |
| Otras voces Glow-TTS de la colección Phoonnx | Glow-TTS + HiFi-GAN | según voz | ONNX | other | Colección Glow-TTS en Hugging Face |
| Piper (rhasspy/piper-voices) | VITS | multilingüe | ONNX | MIT (mayoritariamente) | Hugging Face, amplia adopción |
| Coqui TTS (modelos VITS/Tacotron) | VITS/Tacotron 2 | multilingüe | PyTorch/ONNX | MPL-2.0 (mayoritariamente) | GitHub, Coqui |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la información proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo genera voz en inglés de Estados Unidos con la voz `en-us-blizzard_fls`.
- Licencia "other" sin licencia registrada: la propia model card advierte de que debe verificarse la licencia del release original de Larynx antes de usarlo, especialmente en contextos comerciales.
- Dependencia de fonemización externa: requiere gruut y scriptconv para producir la entrada IPA; un fallo en la normalización de texto afecta directamente a la calidad de la síntesis.
- Dependencia del vocoder: la calidad final del audio depende de hifigan-multi-vctk-small, que phoonnx descarga junto con la voz.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene conversaciones; solo convierte texto en audio.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad subjetiva (MOS) en la información disponible.
- Sin datos de latencia ni throughput publicados, lo que dificulta planificar despliegues de alta concurrencia.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-blizzard_fls
- Release original de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_blizzard_fls-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
