# Phoonnx/mixertts-en_us-ljspeech-80

## Resumen

MixerTTS en inglés estadounidense (en_US) entrenado sobre el corpus LJSpeech y empaquetado en formato ONNX para la librería phoonnx. El modelo original procede del repositorio `nipponjo/mixer-tts-pytorch`, desarrollado por el autor nipponjo, y ha sido adaptado por Phoonnx para su uso dentro de su ecosistema de síntesis de voz basado en ONNX. El identificador "80" del nombre hace referencia a la configuración o checkpoint concreto dentro de la familia MixerTTS.

El modelo resuelve la tarea de text-to-speech (TTS) de un solo hablante: recibe texto en inglés estadounidense, lo convierte a fonemas IPA mediante espeak-ng y genera un espectrograma que posteriormente transforma en audio el vocoder `vocos-multi-alvocat-22khz`, descargado automáticamente por phoonnx. La entrada de texto no es directa: requiere un front-end fonemizador basado en espeak-ng, lo que condiciona tanto la integración como la calidad de pronunciación.

Es relevante ahora por su carácter de componente práctico dentro del ecosistema OVOS (Open Voice OS): phoonnx instala el plugin `ovos-tts-plugin-phoonnx` y permite seleccionar la voz en `mycroft.conf`, lo que facilita su despliegue en asistentes de voz autoalojados. Su tamaño de repositorio (0.0 GB según Hugging Face) y el formato ONNX apuntan a un modelo ligero orientado a inferencia en CPU o GPU modesta, aunque no se dispone de datos oficiales de parámetros ni de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (repo upstream `nipponjo/mixer-tts-pytorch`); vocoder Vocos multi-alvocat 22 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en (en-US) |
| Licencia | other (la model card indica que no hay licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX (librería phoonnx) |
| Entrada de texto | Fonemas espeak (alfabeto IPA) |
| Vocoder | `Phoonnx/vocos-multi-alvocat-22khz` |
| Frecuencia de muestreo | 22 kHz (según el vocoder) |
| Corpus de entrenamiento | LJSpeech (según el nombre del modelo) |
| Autor original | nipponjo |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

MixerTTS es una arquitectura de síntesis de voz basada en mezcladores (mixers) en lugar de atención clásica, propuesta en el repositorio `nipponjo/mixer-tts-pytorch`. El modelo genera un espectrograma a partir de secuencias de fonemas IPA y delega la síntesis de forma de onda a un vocoder independiente, en este caso Vocos multi-alvocat a 22 kHz. Esta separación en dos etapas (acústica + vocoder) es habitual en TTS neuronales y permite sustituir el vocoder sin reentrenar el modelo acústico.

El entrenamiento se realizó sobre LJSpeech, un corpus de un solo hablante femenino en inglés estadounidense de dominio público, ampliamente utilizado como referencia en TTS. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste fino adicional. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura MixerTTS y del uso de fonemas espeak como representación intermedia.

## Capacidades

- Síntesis de voz (text-to-speech) de un solo hablante en inglés estadounidense.
- Conversión de texto a fonemas IPA mediante espeak-ng (a través de `scriptconv.phonemizers.mul.EspeakPhonemizer`).
- Generación de espectrogramas que se transforman en audio mediante el vocoder Vocos a 22 kHz.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Uso programático en Python mediante `TTSModelManager` y el método `synthesize_wav`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión.
- No es un modelo multilingüe: solo en-US.
- No dispone de modo "thinking", audio de entrada ni otras capacidades multimodales.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el modelo se integra como plugin TTS de Mycroft/OVOS y permite sintetizar respuestas del asistente en local, sin depender de servicios en la nube, configurando la voz en `mycroft.conf`.
- Lectura de notificaciones y alertas en sistemas domóticos: al ser un modelo ligero en ONNX, puede ejecutarse en dispositivos de borde para leer mensajes cortos generados por reglas o sensores.
- Generación de audiolibros o locuciones de texto largo en inglés: el pipeline texto → fonemas → espectrograma → vocoder permite procesar párrafos completos por lotes, aunque la calidad depende del front-end espeak.
- Pruebas de accesibilidad: conversión de contenido textual a voz para aplicaciones que necesitan una voz sintética local en inglés estadounidense sin conexión.
- Prototipado de pipelines TTS en Python: sirve como referencia para evaluar la arquitectura MixerTTS y el vocoder Vocos antes de adoptar un modelo mayor o comercial.
- Integración en aplicaciones de escritorio o CLI que requieran síntesis de voz offline con una única voz femenina en inglés, usando phoonnx como dependencia.
- Evaluación comparativa de fonemizadores: al depender de espeak-ng frente al port espyak, permite medir el impacto de las diferencias fonéticas en la calidad percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB en Hugging Face, lo que sugiere un modelo de pequeño tamaño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Por el formato ONNX y el tamaño aparente, es probable que funcione en CPU, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repositorio sugiere que sí, pero se desconoce la huella real en memoria.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.
- Dependencias de sistema: espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak), con posibles diferencias de pronunciación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/mixertts-en_us-ljspeech-80 | MixerTTS + Vocos | en-US | ONNX | other (sin licencia registrada) | Voz única LJSpeech; integración OVOS |
| Otros modelos MixerTTS de la colección Phoonnx | MixerTTS | según variante | ONNX | other | Misma familia, distintos corpus/voces |
| Modelos TTS comerciales (p. ej. ElevenLabs, Azure TTS) | no disponible | multilingüe | API | propietaria | No comparables en licencia ni despliegue local |
| Modelos TTS open source tipo VITS / Piper | VITS | multilingüe | ONNX | variable | Alternativas ligeras para TTS local; no se dispone de comparación numérica |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia: la model card indica explícitamente que no hay licencia registrada para este modelo y recomienda consultar el release upstream antes de usarlo. El uso comercial no está garantizado.
- Idioma: solo inglés estadounidense (en-US); no soporta otros idiomas ni cambio de voz.
- Dependencia de espeak-ng: la calidad de pronunciación depende del fonemizador. Con el port espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Voz única: entrenado sobre LJSpeech, un solo hablante; no hay control de estilo, emoción ni prosodia más allá de lo que aprenda del texto.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede generar artefactos, ruidos o pronunciaciones incorrectas en textos fuera de distribución (siglas, números, nombres propios).
- Sin benchmarks publicados: no hay métricas objetivas (MOS, WER, RTF) que permitan evaluar su calidad frente a alternativas.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al entrenarse en un corpus único (LJSpeech) hereda las características de ese hablante y dominio.
- Producción: la falta de licencia clara y de métricas de rendimiento son caveats importantes antes de desplegarlo en entornos comerciales.
- El identificador del modelo en el ejemplo de código (`nipponjo/mixer-tts-ljspeech-80`) difiere del ID del repositorio (`Phoonnx/mixertts-en_us-ljspeech-80`); conviene verificar cuál es el nombre correcto en el gestor de modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-80
- Repositorio upstream MixerTTS: https://github.com/nipponjo/mixer-tts-pytorch
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Colección MixerTTS: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
