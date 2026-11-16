# Phoonnx/mixertts-ar-mixer80-mantoq

## Resumen

mixertts-ar-mixer80-mantoq es un modelo de síntesis de voz (text-to-speech) para árabe, empaquetado por Phoonnx a partir del modelo original de nipponjo (`nipponjo/tts-arabic-onnx`). El modelo emplea la arquitectura MixerTTS y se distribuye en formato ONNX para su ejecución con la librería phoonnx, una biblioteca de TTS basada en ONNX mantenida por TigreGotico. El paquete incluye únicamente el modelo acústico que genera espectrogramas; la conversión a audio final se delega en un vocoder HiFi-GAN separado (`hifigan-ar-nipponjo`), que phoonnx descarga automáticamente junto con la voz.

La relevancia de este modelo radica en su integración dentro del ecosistema OVOS (Open Voice OS), donde se instala mediante el plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz en árabe a asistentes y aplicaciones de voz open source. El modelo trabaja con fonemas en alfabeto Buckwalter y requiere el fonemizador `MantoqPhonemizer` del paquete `scriptconv_nonfree`, instalado a través del extra `scriptconv[ar-phonemizers]`.

Se trata de un modelo de nicho, con un volumen de descargas muy bajo (24 descargas en el momento de la consulta) y sin métricas de rendimiento publicadas. La licencia figura como "other" y la model card advierte explícitamente de que no hay licencia registrada, por lo que es imprescindible verificar la release upstream antes de cualquier uso, especialmente comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (modelo acústico) + vocoder HiFi-GAN (`hifigan-ar-nipponjo`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | Árabe (`ar`) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas mantoq en alfabeto Buckwalter |
| Front-end de texto | `scriptconv` con `MantoqPhonemizer` (`scriptconv_nonfree.phonemizers.ar`) |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MixerTTS, un diseño de síntesis de voz neuronal que produce una representación espectral (espectrograma) a partir de una secuencia de fonemas. La salida del modelo acústico no es audio directamente: phoonnx encadena la generación del espectrograma con el vocoder HiFi-GAN `hifigan-ar-nipponjo`, que transforma esa representación en forma de onda. El modelo se distribuye en formato ONNX, lo que permite inferencia optimizada y portabilidad entre entornos sin depender de frameworks de entrenamiento como PyTorch.

El modelo original procede de nipponjo (`nipponjo/tts-arabic-onnx`); Phoonnx se limita a empaquetarlo para su librería. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del entrenamiento. El front-end de texto es un componente crítico: el texto árabe se normaliza y convierte a fonemas mantoq mediante `scriptconv`, y el modelo espera esa representación fonética concreta, no texto plano en ortografía árabe estándar.

## Capacidades

- Síntesis de voz en árabe a partir de texto, con salida en formato WAV mediante `voice.synthesize_wav()`.
- Generación de espectrogramas mediante el modelo acústico MixerTTS y conversión a audio con vocoder HiFi-GAN.
- Normalización y conversión de texto a fonemas mantoq en alfabeto Buckwalter a través de `scriptconv`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en Python mediante `TTSModelManager` de phoonnx, con gestión y descarga automática del vocoder asociado.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling ni razonamiento multi-paso; es un modelo estrictamente de TTS.

## Casos de uso

- Asistentes de voz en árabe sobre OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar esta voz en `mycroft.conf` y dotar de respuestas habladas en árabe a un asistente doméstico open source, aprovechando la integración nativa con el ecosistema.
- Lectura de notificaciones y alertas en aplicaciones de domótica: el modelo sintetiza mensajes cortos en árabe con latencia adecuada para anuncios puntuales, siempre que se despliegue junto al vocoder HiFi-GAN.
- Accesibilidad para personas con discapacidad visual: conversión de texto árabe a voz en lectores de pantalla o aplicaciones de lectura, usando la API de phoonnx en Python para generar WAV bajo demanda.
- Generación de audiolibros o contenido narrado en árabe: el modelo permite sintetizar pasajes de texto por lotes, aunque requiere un pipeline propio de segmentación y normalización previa con `scriptconv`.
- Prototipado de interfaces de voz: desarrolladores que necesiten una voz árabe funcional en un entorno Python pueden integrar el modelo vía phoonnx sin entrenar ni convertir pesos, al estar ya en ONNX.
- Investigación en TTS para árabe: el modelo sirve como línea base reproducible para comparar arquitecturas MixerTTS frente a otros sistemas, dado que el paquete incluye el front-end fonético y el vocoder de referencia.
- Sistemas embebidos o de borde: al distribuirse en ONNX y con un tamaño de repo reducido, es candidato para despliegues donde no se quiere arrastrar un stack completo de PyTorch, aunque el rendimiento real no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo figura como 0.0 GB y no se publican recuentos de parámetros.
- GPU recomendadas: no disponible; al ser un modelo ONNX de TTS de tamaño reducido, es plausible su ejecución en CPU, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible; no se especifican requisitos mínimos ni modelos probados (RTX 4090, etc.).
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| mixertts-ar-mixer80-mantoq | Árabe | MixerTTS + HiFi-GAN | ONNX | other (sin registrar) | Empaquetado para phoonnx; vocoder separado |
| nipponjo/tts-arabic-onnx (upstream) | Árabe | MixerTTS + HiFi-GAN | ONNX | no disponible | Modelo original del que deriva este paquete |
| Otras voces MixerTTS de la colección Phoonnx | Variable | MixerTTS | ONNX | variable | Misma librería y flujo de empaquetado |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: la model card advierte de que hay que verificar la release upstream antes de usarlo; el uso comercial no está garantizado.
- Dependencia de `scriptconv_nonfree`: el fonemizador mantoq se distribuye en un paquete marcado como no libre, lo que puede condicionar la redistribución y el uso en productos.
- El modelo solo acepta fonemas mantoq en alfabeto Buckwalter; introducir texto árabe sin el front-end adecuado produce resultados incorrectos.
- Requiere el vocoder HiFi-GAN externo; sin él no se obtiene audio, solo espectrogramas.
- Idioma limitado al árabe (`ar`); no se documenta soporte multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, naturalidad ni inteligibilidad.
- Riesgo de alucinación y errores de pronunciación inherente a los sistemas TTS neuronales, especialmente en palabras fuera de dominio, nombres propios y diacríticos.
- Sesgos de voz y dialecto no documentados: se desconoce qué variedad de árabe y qué características de hablante representa el corpus de entrenamiento.
- Volumen de adopción muy bajo (24 descargas, 0 likes): escasa validación comunitaria y soporte limitado ante problemas.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-ar-mixer80-mantoq
- Modelo upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Vocoder: https://huggingface.co/Phoonnx/hifigan-ar-nipponjo
- Colección MixerTTS de Phoonnx: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
