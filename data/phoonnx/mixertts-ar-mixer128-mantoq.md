# Phoonnx/mixertts-ar-mixer128-mantoq

## Resumen

mixertts-ar-mixer128-mantoq es un modelo de síntesis de voz (text-to-speech) para árabe, empaquetado por Phoonnx a partir del modelo original de nipponjo (`nipponjo/tts-arabic-onnx`). El modelo sigue la arquitectura MixerTTS y se distribuye en formato ONNX para su uso con la librería phoonnx, orientada a la inferencia de TTS en Python y en el ecosistema OVOS. Su función es convertir texto en árabe, previamente fonemizado con el alfabeto Buckwalter mediante el fonemizador Mantoq, en un espectrograma que posteriormente se convierte en audio con el vocoder HiFi-GAN `hifigan-ar-nipponjo`.

El modelo está especializado exclusivamente en árabe (`ar`) y no cubre otras lenguas. Se trata de un componente de un pipeline de dos etapas: el modelo acústico MixerTTS genera el espectrograma y el vocoder HiFi-GAN lo transforma en forma de onda. El repositorio es de tamaño reducido (0,0 GB reportados) y las descargas son muy bajas (19 en el momento de la consulta), lo que sugiere un uso incipiente o experimental.

Su relevancia actual es limitada pero concreta: cubre la necesidad de TTS en árabe dentro de entornos de código abierto y asistentes de voz basados en OVOS, donde las opciones de síntesis en árabe son escasas. No obstante, la ausencia de una licencia registrada y la dependencia de un fonemizador no libre (`scriptconv_nonfree`) son factores que condicionan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MixerTTS (modelo acústico) + vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | other (sin licencia registrada; consultar la versión upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-ar-nipponjo |
| Entrada de texto | fonemas mantoq en alfabeto Buckwalter |
| Librería | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es MixerTTS, un modelo acústico de síntesis de voz que genera espectrogramas a partir de secuencias de fonemas. El modelo no produce audio directamente: la salida espectral se pasa al vocoder HiFi-GAN `hifigan-ar-nipponjo`, que la convierte en forma de onda. La entrada textual no es texto en bruto, sino fonemas en el sistema mantoq codificados en alfabeto Buckwalter, producidos por el fonemizador `MantoqPhonemizer` de `scriptconv_nonfree.phonemizers.ar`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas específicas del entrenamiento. El modelo original procede de `nipponjo/tts-arabic-onnx` y Phoonnx se limita a empaquetarlo para su ejecución con su librería. La distribución en ONNX facilita el despliegue en CPU y en entornos sin dependencias de frameworks de deep learning pesados.

## Capacidades

- Síntesis de voz en árabe a partir de texto, mediante fonemización previa con Mantoq y alfabeto Buckwalter.
- Generación de espectrogramas que se convierten en audio con el vocoder HiFi-GAN asociado.
- Integración con la librería phoonnx para inferencia en Python.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Descarga automática del vocoder junto con la voz por parte de phoonnx.
- Normalización y conversión de texto gestionadas por `scriptconv`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en árabe sobre OVOS: el modelo se selecciona como módulo TTS en `mycroft.conf` y permite que un asistente doméstico responda en árabe con una voz neuronal, aprovechando la integración nativa del plugin.
- Lectura de textos en árabe en aplicaciones de accesibilidad: se puede integrar en lectores de pantalla o herramientas de lectura por voz para personas con discapacidad visual que consuman contenido en árabe.
- Generación de avisos y notificaciones habladas: en sistemas de megafonía o aplicaciones móviles que necesiten locutar mensajes cortos en árabe, el modelo genera el audio bajo demanda con un coste de cómputo contenido al ejecutarse en ONNX.
- Prototipado de interfaces conversacionales en árabe: investigadores que desarrollen diálogos o agentes conversacionales pueden usar el modelo como capa de salida de voz sin depender de servicios en la nube.
- Síntesis de contenido educativo o de divulgación en árabe: para generar audiolibros o material formativo, el pipeline texto → fonemas mantoq → espectrograma → vocoder permite automatizar la locución.
- Evaluación y experimentación con TTS árabe en entornos sin GPU: al distribuirse en ONNX y con un vocoder ligero, es viable ejecutarlo en CPU para pruebas de calidad o comparativas de fonemizadores.
- Integración en pipelines de generación de audio por lotes: la API de phoonnx permite sintetizar frases y escribir directamente archivos WAV, lo que facilita la producción masiva de clips de voz en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0,0 GB y los pesos se distribuyen en ONNX, lo que sugiere un modelo ligero.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de TTS, es previsible que funcione en CPU, aunque no se documentan requisitos concretos.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por el tamaño reportado del repositorio, es probable que sí en GPUs de consumo, pero no se confirma.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución de ONNX Runtime de forma implícita. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixertts-ar-mixer128-mantoq | árabe | MixerTTS + HiFi-GAN | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| nipponjo/tts-arabic-onnx (upstream) | árabe | MixerTTS + HiFi-GAN | ONNX | no disponible en la información | Hugging Face (nipponjo) |
| Otros modelos MixerTTS de la colección Phoonnx | varios | MixerTTS | ONNX | other | Hugging Face (colección MixerTTS) |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparados en la información proporcionada, por lo que la comparación se limita a idioma, arquitectura, formato y licencia.

## Limitaciones y advertencias

- El modelo solo soporta árabe; no es multilingüe.
- Requiere fonemización previa con Mantoq y alfabeto Buckwalter; un texto mal normalizado o fonemizado degradará la calidad del audio.
- Depende del paquete `scriptconv_nonfree`, marcado como no libre, lo que puede condicionar su uso en proyectos con requisitos estrictos de licencia.
- No hay licencia registrada para el modelo; es necesario verificar la licencia de la versión upstream (`nipponjo/tts-arabic-onnx`) antes de cualquier uso comercial.
- Riesgo de alucinación o artefactos acústicos en textos fuera de dominio, aunque no se documentan evaluaciones al respecto.
- El número de descargas (19) y de likes (0) indica poca validación comunitaria; la madurez del empaquetado es baja.
- No se publican benchmarks de calidad (MOS, WER de síntesis) ni requisitos de hardware, lo que dificulta estimar su rendimiento en producción.
- El modelo genera espectrogramas y depende de un vocoder externo; un fallo en la descarga o versión del vocoder rompe el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-ar-mixer128-mantoq
- Modelo upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Vocoder: https://huggingface.co/Phoonnx/hifigan-ar-nipponjo
- Colección MixerTTS: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
