# Phoonnx/glowtts-de-de-hokuspokus

## Resumen

`glowtts-de-de-hokuspokus` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, distribuido como un subconjunto del repositorio agregado `Phoonnx/phoonnx-glowtts`. Se trata de una voz concreta en alemán (`de-de`) identificada internamente como `larynx/de-de-hokuspokus-glow_tts`, empaquetada en formato ONNX para su uso con la librería `phoonnx`, un runtime de inferencia TTS mantenido por TigreGotico.

El modelo emplea la arquitectura GlowTTS, un sistema TTS no autorregresivo basado en normalizing flows que transforma texto en espectrogramas mel de forma paralela, lo que permite inferencia rápida en CPU. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a despliegue ligero y a síntesis en tiempo real o casi real.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de inferencia ya exportado a ONNX, pensado para integrarse en aplicaciones que necesiten una voz alemana concreta sin depender de frameworks de entrenamiento pesados. No hay información publicada sobre el proceso de entrenamiento, los datos utilizados ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flow, no autorregresiva) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por utterance, no modelo de contexto largo) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | alemán (variante `de-de`) |
| Licencia | other (sin licencia concreta especificada en la carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de síntesis de voz no autorregresiva que combina un encoder de texto con un decoder basado en normalizing flows (Glow) para generar espectrogramas mel. A diferencia de modelos autorregresivos como Tacotron 2, GlowTTS genera el espectrograma completo en paralelo, lo que reduce la latencia y facilita el despliegue en entornos con recursos limitados. El modelo se acompaña habitualmente de un vocoder (HiFi-GAN u otro) para convertir el espectrograma en audio, aunque la información disponible no especifica qué vocoder se incluye en este paquete.

No se dispone de datos sobre el corpus de entrenamiento, el número de tokens, la duración del audio utilizado, ni sobre si hubo ajuste fino con RLHF o preferencias humanas. La model card únicamente indica que el modelo proviene del repositorio agregado `Phoonnx/phoonnx-glowtts` y que conserva las rutas de ficheros originales. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia arquitectura GlowTTS y su exportación a ONNX.

## Capacidades

- Síntesis de voz a partir de texto en alemán (variante `de-de`).
- Generación de audio mediante la arquitectura GlowTTS, con inferencia no autorregresiva.
- Ejecución sobre runtime ONNX a través de la librería `phoonnx`.
- Identificador de voz expuesto: `larynx/de-de-hokuspokus-glow_tts`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta capacidad multilingüe más allá del alemán.
- No se documentan modos especiales como clonación de voz, control de emoción o SSML.

## Casos de uso

- **Lectura de artículos y documentos en alemán**: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando su formato ONNX para ejecutarse en servidores modestos o en el navegador mediante ONNX Runtime Web.
- **Asistentes de voz embebidos**: al ser un modelo compacto (0,1 GB) y no autorregresivo, es adecuado para integrarse en dispositivos con recursos limitados que necesiten respuestas habladas en alemán con baja latencia.
- **Generación de avisos y notificaciones habladas**: útil en sistemas de megafonía, domótica o aplicaciones móviles que requieran sintetizar mensajes cortos en alemán de forma dinámica.
- **Preproducción de audiolibros o pódcast**: permite generar borradores de narración en alemán para revisión antes de una locución humana, reduciendo costes de producción inicial.
- **Sistemas de atención al cliente con respuesta de voz**: combinado con un LLM y un pipeline de STT, este TTS puede cerrar el bucle de conversación en alemán en centros de contacto automatizados.
- **Pruebas de integración en pipelines TTS**: sirve como voz de referencia para validar el runtime `phoonnx` y comparar latencias o calidad frente a otras voces del mismo repositorio agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se estima un consumo de memoria muy bajo, del orden de cientos de MB incluyendo el vocoder y el runtime ONNX.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime, por lo que cualquier GPU con soporte ONNX (por ejemplo, RTX 3060 en adelante) sería más que suficiente si se desea acelerar.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| glowtts-de-de-hokuspokus | GlowTTS | Alemán | ONNX | other | no aplica |
| Piper (voces alemanas) | VITS | Alemán | ONNX | MIT (habitual) | no aplica |
| Coqui TTS (modelos alemanes) | Tacotron2 / VITS | Alemán | PyTorch | MPL 2.0 / otras | no aplica |
| MMS-TTS (deu) | VITS | Alemán | PyTorch | CC-BY-NC 4.0 | no aplica |

La comparación es orientativa: no se dispone de métricas de calidad (MOS, WER) para este modelo, por lo que no es posible establecer una comparación cuantitativa con las alternativas. La principal diferencia práctica es el formato ONNX ya exportado y su integración con el runtime `phoonnx`.

## Limitaciones y advertencias

- La licencia es `other` y la model card no especifica una licencia concreta para esta carpeta, lo que impide determinar con certeza si el uso comercial está permitido. Es necesario contactar con el autor antes de usarlo en producción.
- No hay información sobre el corpus de entrenamiento, por lo que no se pueden evaluar sesgos de género, acento o registro lingüístico en la voz generada.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de pronunciación incorrecta de palabras fuera del vocabulario de entrenamiento, nombres propios o términos técnicos.
- Solo cubre alemán estándar (`de-de`); no se documenta soporte de otras variantes dialectales.
- El modelo no incluye información sobre el vocoder asociado en la información disponible, lo que puede requerir configuración adicional en el pipeline de inferencia.
- Al ser un artefacto derivado de un repositorio agregado, las actualizaciones o correcciones dependen del mantenimiento del repositorio `Phoonnx/phoonnx-glowtts`.
- No se han publicado evaluaciones de calidad subjetiva (MOS) ni objetiva (WER) que permitan garantizar un nivel de naturalidad adecuado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de-de-hokuspokus
- Repositorio agregado de origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
