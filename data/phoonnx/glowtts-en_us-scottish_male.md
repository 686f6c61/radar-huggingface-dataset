# Phoonnx/glowtts-en_us-scottish_male

## Resumen

`glowtts-en_us-scottish_male` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera voz masculina en inglés escocés (etiquetado como `en-US` en la model card) a partir de fonemas IPA producidos por el fonemizador gruut, y utiliza el vocoder `hifigan-multi-vctk-small` para convertir el espectrograma resultante en audio.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema TTS de dos etapas (modelo acústico Glow-TTS + vocoder HiFi-GAN) orientado a síntesis de voz local y de baja latencia. Su relevancia actual reside en que permite integrar TTS offline en asistentes de voz como OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, sin dependencia de servicios en la nube.

El repositorio es pequeño (0,1 GB) y contiene los pesos en formato ONNX. La licencia figura como "other" y la model card advierte explícitamente de que no hay licencia registrada para el modelo, por lo que debe consultarse la release upstream de Larynx antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; entrada en fonemas IPA) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | en (en-US, voz masculina escocesa) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repo | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acústico basado en normalizing flows que modela directamente la alineación entre fonemas y frames de espectrograma mel sin necesidad de un aligner externo, mediante monotonic alignment search. El modelo produce un espectrograma mel que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN (`hifigan-multi-vctk-small`, multi-hablante VCTK en versión small). La entrada no es texto crudo sino fonemas IPA generados por el fonemizador gruut a través de la librería `scriptconv`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo procede del proyecto Larynx de Rhasspy (release v1.0), que entrena voces sobre datos de dominio público y corpus de voz abiertos, pero la model card no detalla el corpus concreto de esta voz escocesa masculina. El empaquetado de Phoonnx se limita a convertir y distribuir los pesos en ONNX junto con la integración en su pipeline de TTS.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, con salida en formato WAV.
- Voz masculina en inglés escocés (etiqueta `en-US` en la model card).
- Fonemización de entrada mediante gruut (alfabeto IPA), lo que permite control preciso de la pronunciación si se proporcionan fonemas directamente.
- Generación de espectrograma mel y conversión a audio mediante vocoder HiFi-GAN integrado en el flujo de phoonnx.
- Integración con asistentes de voz OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en CPU/GPU mediante ONNX Runtime (a través de phoonnx); no requiere servicios en la nube.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para dotar de voz escocesa masculina a un asistente doméstico sin conexión a internet, configurando la voz en `mycroft.conf`.
- Síntesis offline en dispositivos de borde: al ejecutarse sobre ONNX Runtime y ocupar 0,1 GB, puede desplegarse en Raspberry Pi o mini-PC para lectura de notificaciones, alarmas o avisos del sistema.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, con una voz concreta y consistente en inglés escocés.
- Generación de audio para prototipos y demos: creación rápida de locuciones para vídeos, tutoriales o pruebas de producto en inglés con acento escocés, sin depender de APIs comerciales.
- Pruebas de pipelines TTS: validación de integraciones de `phoonnx` y `scriptconv` (normalización de texto, fonemización gruut) en entornos de desarrollo antes de desplegar voces en producción.
- Investigación en síntesis de voz: comparación de voces Glow-TTS de Larynx con otros modelos TTS en experimentos de inteligibilidad, naturalidad o latencia, usando el formato ONNX para portabilidad.
- Sistemas de megafonía o anuncios automatizados en entornos controlados: generación de mensajes pregrabados en inglés escocés para transporte, comercio o industria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo completo ocupa 0,1 GB, por lo que el modelo y el vocoder caben holgadamente en cualquier GPU consumer (menos de 1 GB en FP32, previsiblemente).
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 4090, RTX 3060, GTX 1650, etc.); no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- CPU: ejecutable en CPU mediante ONNX Runtime; adecuado para dispositivos de borde.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, ONNX Runtime directamente.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma/voz | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-scottish_male (este) | Glow-TTS + HiFi-GAN | en-US, masculino escocés | ONNX | other (sin licencia registrada) | Hugging Face (Phoonnx) |
| Otras voces Larynx Glow-TTS | Glow-TTS + HiFi-GAN | múltiples voces e idiomas | tar.gz / ONNX | según release Larynx | GitHub Rhasspy/Larynx y colección Phoonnx |
| Piper (Rhasspy) | VITS | múltiples voces e idiomas | ONNX | MIT (mayoría de voces) | GitHub y Hugging Face |
| Coqui TTS (XTTS, VITS) | VITS / autoregresivo | multilingüe | PyTorch | MPL 2.0 / Coqui CPML | GitHub Coqui |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con estas alternativas.

## Limitaciones y advertencias

- Licencia: la model card indica "other" y advierte de que no hay licencia registrada para el modelo; es imprescindible revisar la release upstream de Larynx antes de cualquier uso, especialmente comercial.
- Idioma limitado: solo inglés (en-US) con acento escocés masculino; no soporta castellano ni otros idiomas.
- Entrada restringida a fonemas gruut/IPA a través de `scriptconv`; el texto debe normalizarse y fonemizarse correctamente, lo que puede fallar con nombres propios, siglas o texto no estándar.
- Es un modelo TTS, no un LLM: no razona, no responde preguntas ni mantiene conversaciones; cualquier expectativa de "chat" es incorrecta.
- Riesgo de pronunciación incorrecta o prosodia artificial en frases largas o con puntuación atípica; la calidad depende del vocoder HiFi-GAN small, que prioriza ligereza sobre fidelidad máxima.
- Sin datos publicados de benchmarks, latencia ni evaluación subjetiva (MOS), por lo que la calidad percibida no está cuantificada en la información disponible.
- Dependencia de la librería `phoonnx` en versión preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API en producción.
- El repositorio tiene muy pocas descargas (32) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-scottish_male
- Upstream (release Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_scottish_english_male-glow_tts.tar.gz
- Repositorio Larynx: https://github.com/rhasspy/larynx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS en Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
