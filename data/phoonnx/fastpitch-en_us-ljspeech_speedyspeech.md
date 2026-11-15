# Phoonnx/fastpitch-en_us-ljspeech_speedyspeech

## Resumen
El modelo `fastpitch-en_us-ljspeech_speedyspeech` es un sistema de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado en formato ONNX por Phoonnx a partir del modelo original `tts_models--en--ljspeech--speedy-speech` publicado por Coqui en la versión 0.6.1 de su librería TTS. Se trata de un modelo acústico FastPitch que genera espectrogramas a partir de fonemas, que después son convertidos en audio por un vocoder externo (en este caso, `vocos-multi-alvocat-22khz`).

La relevancia de este paquete es fundamentalmente práctica: permite ejecutar un modelo TTS de Coqui sin depender del stack original de PyTorch/TTS, usando ONNX Runtime a través de la librería phoonnx. Esto facilita el despliegue en entornos ligeros, integraciones con asistentes de voz como OVOS/Mycroft y ejecución en CPU sin GPU dedicada, algo habitual en asistentes domésticos y sistemas embebidos.

El modelo está entrenado sobre el corpus LJSpeech (una única hablante femenina, dominio de audiolibros y lectura), por lo que su ámbito de aplicación realista es la síntesis de voz monocanal en inglés US con una voz concreta, no la clonación ni el multilingüismo. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (modelo acústico transformer no autorregresivo) + vocoder Vocos multi-alvocat 22 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `Phoonnx/vocos-multi-alvocat-22khz` |
| Frecuencia de muestreo de salida | 22 kHz (según el vocoder) |
| Librería de ejecución | `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS |

## Arquitectura y entrenamiento
FastPitch es una arquitectura de síntesis neuronal no autorregresiva basada en transformer que predice duraciones fonéticas y genera un espectrograma mel a partir de una secuencia de fonemas. Frente a Tacotron 2, elimina la recurrencia y la atención autorregresiva, lo que permite paralelizar la inferencia y reducir la latencia. El modelo aquí empaquetado corresponde al checkpoint "speedy-speech" de Coqui, entrenado sobre el dataset LJSpeech (aproximadamente 24 horas de audio de una única hablante en inglés, dominio de lectura de textos no fiction). No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset más allá de LJSpeech, ni sobre si se aplicaron etapas de RLHF o ajuste fino adicional.

La innovación relevante de este paquete no está en el modelo en sí, sino en su empaquetado: los pesos se exportan a ONNX y se integran en phoonnx, que se encarga de la normalización de texto mediante `scriptconv` y del fonemizado con `GruutPhonemizer` (extra `scriptconv[gruut]`). La síntesis se divide en dos etapas: el modelo FastPitch produce el espectrograma y el vocoder `vocos-multi-alvocat-22khz` lo convierte en forma de onda. phoonnx descarga automáticamente el vocoder junto con la voz.

## Capacidades
- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Generación de espectrogramas mel mediante FastPitch y conversión a audio de 22 kHz con Vocos.
- Fonemizado de entrada con gruut en alfabeto IPA, con normalización de texto previa mediante scriptconv.
- Integración con asistentes de voz OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en CPU mediante ONNX Runtime (no requiere GPU para inferencia).
- Voz única predefinida (`coqui/en-ljspeech-speedy-speech`), sin soporte documentado de clonación, cambio de hablante ni control de emoción.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso
- Asistentes de voz domésticos con OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `coqui/en-ljspeech-speedy-speech` en `mycroft.conf` y sintetizar respuestas del asistente en inglés US sin GPU, aprovechando la ejecución ONNX en CPU.
- Lectura de textos y audiolibros en inglés: el modelo está entrenado sobre LJSpeech, cuyo dominio es precisamente la lectura de textos, por lo que encaja en la generación de audio a partir de artículos, documentación o libros en inglés.
- Síntesis en pipelines de CI/CD o tests automatizados: al ser un paquete ONNX ligero y determinista, se puede usar para generar locuciones de prueba en suites de integración de aplicaciones de voz sin depender de servicios externos.
- Generación de avisos y notificaciones pregrabadas dinámicamente: útil en sistemas de megafonía, domótica o aplicaciones de accesibilidad que necesitan convertir cadenas cortas en audio en tiempo de ejecución.
- Prototipado de interfaces conversacionales: permite validar flujos de diálogo con voz realista antes de invertir en un servicio TTS en la nube, gracias a su licencia Apache 2.0 y a la ausencia de coste por petición.
- Accesibilidad y lectura de pantalla en inglés: integrable en aplicaciones de lectura asistida para usuarios angloparlantes, con latencia baja al ser un modelo no autorregresivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime y el tamaño del repositorio es de 0.0 GB (probablemente los pesos se descargan desde el upstream o el repositorio está vacío en el momento de la consulta).
- GPU recomendadas: no se documentan; al ser un modelo FastPitch de tamaño contenido, no requiere GPU dedicada. Cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) podría acelerar la inferencia, pero no hay datos publicados.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño típico de los modelos FastPitch (decenas de millones de parámetros), aunque no se aportan cifras exactas.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/fastpitch-en_us-ljspeech_speedyspeech` | FastPitch + Vocos | en-US | fonemas IPA (gruut) | Apache 2.0 | ONNX | Hugging Face (Phoonnx) |
| Coqui `tts_models--en--ljspeech--speedy-speech` (upstream) | FastPitch + vocoder Coqui | en-US | fonemas (gruut) | Apache 2.0 | PyTorch (checkpoint TTS) | GitHub Coqui TTS v0.6.1 |
| Tacotron 2 (referencia clásica) | Tacotron 2 autorregresivo + WaveNet/HiFi-GAN | en-US (LJSpeech) | caracteres/fonemas | varía según implementación | PyTorch | Múltiples repositorios |
| VITS (p. ej. variantes LJSpeech) | VITS extremo a extremo | en-US | fonemas | varía | PyTorch/ONNX | Múltiples repositorios |

La comparación directa más relevante es con el checkpoint original de Coqui: este paquete ofrece el mismo modelo acústico con un vocoder distinto (Vocos en lugar del vocoder original) y en formato ONNX, lo que simplifica el despliegue. Frente a VITS, FastPitch separa modelo acústico y vocoder, lo que permite intercambiar el vocoder, pero VITS suele ofrecer mayor naturalidad al ser extremo a extremo. No se dispone de métricas comparativas (MOS, RTF) en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: el modelo está entrenado únicamente con LJSpeech, una única hablante femenina en inglés US; no representa diversidad de voces, acentos ni géneros.
- Riesgo de alucinación: en TTS se traduce en artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio (nombres propios, siglas, términos técnicos), especialmente si el fonemizado gruut no las resuelve bien.
- Limitaciones de idioma: solo inglés estadounidense; no soporta castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del vocoder `vocos-multi-alvocat-22khz` y del corpus LJSpeech (dominio público en su mayoría, pero con condiciones de atribución recomendadas).
- Caveat de producción: el repositorio figura con tamaño 0.0 GB y solo 31 descargas, lo que sugiere que los pesos pueden descargarse desde el upstream de Coqui o que el paquete está en fase temprana; conviene validar la integridad de los artefactos antes de desplegar.
- Dependencia de `scriptconv[gruut]` para el fonemizado; sin esa dependencia el modelo no recibe la entrada correcta.
- No apto para clonación de voz, cambio de hablante, emoción controlada ni síntesis multilingüe.

## Enlaces
- Hugging Face: https://huggingface.co/Phoonnx/fastpitch-en_us-ljspeech_speedyspeech
- Upstream Coqui TTS (checkpoint): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--speedy-speech.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección FastPitch de Phoonnx: https://huggingface.co/collections/Phoonnx/fastpitch-6af8ea827005c1385348ed60
- Vocoder asociado: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
