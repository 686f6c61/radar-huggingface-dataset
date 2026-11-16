# Phoonnx/glowtts-en_us-cmu_ksp-gruut

## Resumen

Glow-TTS en_us-cmu_ksp-gruut es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense, empaquetado en formato ONNX por Phoonnx a partir del modelo original publicado por Rhasspy dentro del proyecto Larynx (v1.0). El modelo convierte fonemas IPA generados por el fonemizador gruut en un espectrograma mel, que posteriormente se transforma en audio mediante el vocoder HiFi-GAN multi-VCTK small. No es un modelo de lenguaje: es un componente acustico de un pipeline TTS completo.

La relevancia de este modelo radica en su empaquetado para inferencia local y ligera: el repositorio ocupa aproximadamente 0,1 GB, se ejecuta sobre ONNX Runtime y se integra con el ecosistema OVOS (Open Voice OS) a traves del plugin `ovos-tts-plugin-phoonnx`. Es adecuado para asistentes de voz embebidos, domotica y aplicaciones de sintesis offline donde no se requiere ni se desea una dependencia de servicios en la nube.

Se trata de un modelo de una sola voz (`larynx/en-us-cmu_ksp-glow_tts`), sin capacidades de clonacion ni multilingues, y con un estado de licencia poco claro: la model card indica explicitamente que no hay licencia registrada y que debe consultarse la release upstream antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico flow-based) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo autorregresivo de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python / OVOS) |

## Arquitectura y entrenamiento

El modelo acustico sigue la arquitectura Glow-TTS, un modelo generativo basado en normalizing flows que mapea secuencias de fonemas a espectrogramas mel de forma no autorregresiva, con alineamiento monotono aprendido. Esta familia de modelos destaca por su velocidad de sintesis y su estabilidad en comparacion con los TTS autorregresivos tipo Tacotron. El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx sobre el corpus CMU (variante `cmu_ksp`), con entrada fonemica en alfabeto IPA.

La sintesis se completa con el vocoder HiFi-GAN multi-VCTK small, que transforma el espectrograma mel en forma de onda de audio. phoonnx descarga automaticamente el vocoder junto con la voz. No se dispone de informacion sobre el numero de horas de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de fine-tuning o adaptacion especifica; la model card no detalla el proceso de entrenamiento mas alla de la procedencia upstream.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Conversion texto a fonemas mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generacion de espectrogramas mel y renderizado de audio WAV a traves del vocoder HiFi-GAN.
- Inferencia local sobre ONNX Runtime, sin dependencia de servicios externos.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Una unica voz predefinida (`larynx/en-us-cmu_ksp-glow_tts`); no soporta seleccion de hablante ni clonacion.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en ingles dentro de un asistente domestico local, sin enviar texto a la nube.
- Domotica y dispositivos IoT con recursos limitados: al ocupar ~0,1 GB y ejecutarse sobre ONNX Runtime, puede desplegarse en dispositivos de borde (Raspberry Pi y similares) para anuncios hablados y notificaciones.
- Lectura de textos y accesibilidad: sintesis de documentos, avisos o contenido web en ingles para usuarios con discapacidad visual en aplicaciones de escritorio o moviles con inferencia local.
- Sistemas de megafonia y avisos automatizados: generacion de mensajes de voz pregrabados bajo demanda en entornos como transporte, comercio o industria, donde la latencia de red no es aceptable.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo ligero y empaquetado, sirve como referencia para validar integraciones de `scriptconv` y `phoonnx` antes de desplegar voces mas grandes.
- Prototipado de interfaces conversacionales: generacion rapida de audio de respuesta en ingles para demos de asistentes, chatbots de voz o sistemas de atencion telefonica basica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se espera un consumo de memoria muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion sobre ONNX Runtime, que funciona tanto en CPU como en GPU.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no hay datos oficiales confirmados.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Vocoder | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en_us-cmu_ksp-gruut (este) | Glow-TTS | en-US | HiFi-GAN multi-VCTK small | ONNX | other (sin registrar) | Hugging Face, ~0,1 GB |
| Piper (rhasspy/piper-voices) | VITS | Multiples | Integrado en VITS | ONNX | MIT (segun proyecto) | Hugging Face / GitHub |
| Larynx (otras voces) | Glow-TTS / VITS | Multiples | HiFi-GAN | Diversos | Diversas | GitHub rhasspy/larynx |
| Coqui TTS (modelos VITS) | VITS / Tacotron2 | Multiples | Diversos | PyTorch / ONNX | MPL-2.0 (segun modelo) | GitHub coqui-ai/TTS |

La comparativa se basa en caracteristicas generales de los proyectos citados; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Licencia sin registrar: la model card indica explicitamente que no hay licencia registrada y recomienda consultar la release upstream antes de cualquier uso; el uso comercial no esta garantizado.
- Una unica voz y un unico idioma (en-US); no soporta cambio de hablante ni otras lenguas.
- Requiere entrada fonemica correcta: el texto debe pasar por el fonemizador gruut; errores en la normalizacion o en la fonemizacion degradan la calidad del audio.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario CMU, siglas, nombres propios o terminos tecnicos no cubiertos por el diccionario.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier funcionalidad conversacional debe aportarla otro componente.
- No se dispone de informacion sobre sesgos acusticos, calidad subjetiva (MOS) ni robustez ante ruido o entradas adversas.
- Sin datos publicados de latencia, throughput ni requisitos minimos de hardware; el rendimiento real dependera del backend ONNX y del dispositivo.
- El proyecto depende de la libreria `phoonnx` (en estado `--pre` segun la model card), lo que implica posibles cambios de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_ksp-gruut
- Modelo upstream (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_ksp-glow_tts.tar.gz
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
