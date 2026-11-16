# Phoonnx/glowtts-en_us-cmu_slp-gruut

## Resumen

Glow-TTS en_us-cmu_slp-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado posteriormente por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera espectrogramas mel a partir de fonemas IPA obtenidos mediante el fonemizador gruut, que después son convertidos a audio por el vocoder HiFi-GAN multi-VCTK small.

Se trata de un modelo especializado y de tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB), pensado para síntesis de voz en inglés estadounidense en entornos con recursos limitados, como asistentes de voz locales o sistemas embebidos. Su integración con el ecosistema OVOS/Mycroft y su formato ONNX lo hacen adecuado para despliegues de baja latencia sin dependencia de GPU.

La relevancia actual del modelo reside en su carácter de componente reutilizable dentro de pipelines TTS ligeros y ejecutables en CPU. No obstante, la ausencia de una licencia declarada explícitamente y la falta de benchmarks publicados limitan su adopción directa en producción sin una verificación previa del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow acoplado a alineamiento monotónico) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autoregresivo que combina un normalizing flow con un mecanismo de alineamiento monotónico para aprender la correspondencia entre fonemas y frames de espectrograma mel sin necesidad de alineamientos externos. La entrada de texto se compone de fonemas IPA generados por el fonemizador gruut, y la salida es un espectrograma mel que el vocoder HiFi-GAN multi-VCTK small transforma en forma de onda de audio.

El modelo procede del proyecto Larynx de Rhasspy (versión v1.0), que entrenó voces TTS de código abierto para asistentes de voz locales. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El empaquetado realizado por Phoonnx se limita a la conversión y distribución en formato ONNX para su uso con la librería phoonnx.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Conversión de texto a fonemas IPA mediante el fonemizador gruut, integrado a través de scriptconv.
- Generación de espectrogramas mel que se convierten a audio mediante el vocoder HiFi-GAN multi-VCTK small.
- Ejecución en CPU mediante inferencia ONNX, sin necesidad de GPU.
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo "thinking".

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS/Mycroft como módulo TTS para sintetizar respuestas del asistente en inglés, ejecutándose en CPU y sin conexión a servicios en la nube.
- Sistemas embebidos y dispositivos de bajo consumo: su reducido tamaño (repo de 0,1 GB) y su formato ONNX permiten desplegarlo en Raspberry Pi u otros dispositivos con recursos limitados.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos en aplicaciones de domótica o monitorización, donde la baja latencia de un modelo no autoregresivo es ventajosa.
- Prototipado de interfaces conversacionales: generación rápida de audio de prueba para validar flujos de diálogo antes de invertir en voces comerciales.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en entornos en inglés.
- Pipelines de generación de contenido en lote: síntesis de múltiples fragmentos de texto a audio en servidores sin GPU, aprovechando la eficiencia de la inferencia ONNX.
- Investigación en TTS: base reproducible para experimentar con fonemización gruut, vocoders HiFi-GAN y arquitecturas Glow-TTS en comparaciones académicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; al ser un modelo ONNX de tamaño reducido (repo de 0,1 GB), puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no disponibles; no se requiere GPU para inferencia según el diseño del empaquetado.
- Compatibilidad con GPU de consumo: no se dispone de datos específicos, pero el tamaño del modelo sugiere que cabría en cualquier GPU de consumo si se optara por aceleración.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_slp-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | no aplica | Empaquetado para phoonnx/OVOS |
| Otras voces Larynx (Rhasspy) | Glow-TTS + HiFi-GAN | varios | tarball original | según upstream | no aplica | Mismo origen, distinto empaquetado |
| Modelos TTS comerciales (p. ej. voces cloud) | variable | múltiples | API | propietaria | no aplica | Requieren conexión y coste por uso |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other" sin que se registre una licencia concreta; es imprescindible verificar el release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- El modelo solo soporta inglés estadounidense (en-US); no es multilingüe.
- Al ser un modelo TTS y no un modelo de lenguaje, no razona ni genera texto; su ámbito se limita a la síntesis de voz.
- No se han publicado benchmarks, por lo que no es posible evaluar objetivamente su calidad frente a alternativas.
- No se dispone de información sobre sesgos en la voz generada (acento, género, prosodia) ni sobre posibles artefactos acústicos.
- La dependencia del fonemizador gruut y del vocoder HiFi-GAN multi-VCTK small implica que la calidad final depende de ambos componentes.
- El número de descargas (19) y la ausencia de "likes" sugieren una adopción muy limitada, lo que reduce la validación comunitaria del empaquetado.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en_us-cmu_slp-gruut](https://huggingface.co/Phoonnx/glowtts-en_us-cmu_slp-gruut)
- [Release upstream de Rhasspy/Larynx v1.0](https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_slp-glow_tts.tar.gz)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección Glow-TTS en Hugging Face](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Vocoder HiFi-GAN multi-VCTK small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
