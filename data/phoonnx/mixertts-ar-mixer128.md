# Phoonnx/mixertts-ar-mixer128

## Resumen

mixertts-ar-mixer128 es un modelo de síntesis de voz (text-to-speech) para árabe, empaquetado por Phoonnx a partir del modelo original de nipponjo (nipponjo/tts-arabic-onnx). Utiliza la arquitectura MixerTTS, un modelo acústico que genera espectrogramas a partir de fonemas, que posteriormente son convertidos en audio por el vocoder HiFi-GAN hifigan-ar-nipponjo. El paquete está diseñado para funcionar con la librería ONNX phoonnx, lo que facilita su integración en pipelines de TTS en Python y en el asistente de voz OVOS.

El modelo trabaja exclusivamente con árabe y recibe como entrada fonemas en el alfabeto Buckwalter, generados por el fonemizador MantoqPhonemizer de la librería scriptconv. Su relevancia radica en que ofrece una alternativa ligera y desplegable en formato ONNX para TTS en árabe, un idioma con menor cobertura en el ecosistema open source que el inglés o el español. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos están alojados externamente o que el paquete es mínimo y descarga los artefactos necesarios en tiempo de ejecución.

La licencia figura como "other" y la model card indica explícitamente que no hay licencia registrada para este modelo, por lo que se recomienda consultar la release upstream antes de cualquier uso, especialmente comercial. El modelo acumula 33 descargas y ningún "like" en Hugging Face, lo que indica una adopción todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (modelo acústico generador de espectrogramas) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas mantoq, alfabeto Buckwalter |
| Vocoder asociado | hifigan-ar-nipponjo |
| Librería | phoonnx |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es MixerTTS, un modelo acústico que transforma secuencias de fonemas en espectrogramas. El proceso de síntesis se divide en dos etapas: primero el modelo MixerTTS genera el espectrograma a partir de los fonemas de entrada, y después el vocoder HiFi-GAN (hifigan-ar-nipponjo) convierte ese espectrograma en una forma de onda de audio. El modelo se distribuye en formato ONNX, lo que permite inferencia optimizada sin depender de frameworks de deep learning completos.

La información disponible no detalla el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. El modelo original procede de nipponjo/tts-arabic-onnx y ha sido reempaquetado por Phoonnx para su integración con su librería. El front-end de texto delega en scriptconv, que normaliza el texto y lo convierte a fonemas mantoq mediante MantoqPhonemizer (extra `scriptconv[ar-phonemizers]`).

## Capacidades

- Síntesis de voz en árabe a partir de texto, con salida en formato WAV.
- Conversión de texto a fonemas mantoq en alfabeto Buckwalter mediante scriptconv.
- Generación de espectrogramas con MixerTTS y conversión a audio con el vocoder HiFi-GAN.
- Integración con la librería phoonnx mediante `TTSModelManager` y el método `synthesize_wav`.
- Soporte como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable en `mycroft.conf`.
- Gestión de voces mediante el sistema de voces de phoonnx (`manager.voices["nipponjo/tts-arabic-mixer128"]`).
- Descarga automática del vocoder asociado al cargar la voz.

## Casos de uso

- Asistentes de voz en árabe sobre OVOS: el modelo se integra como plugin de TTS y permite configurar la voz en `mycroft.conf`, de modo que el asistente sintetice respuestas habladas en árabe sin infraestructura adicional.
- Lectura de contenido en árabe: conversión de artículos, noticias o documentación a audio mediante la API de phoonnx, útil para accesibilidad o consumo en movilidad.
- Generación de avisos y notificaciones habladas: síntesis de mensajes cortos en aplicaciones de domótica o sistemas de alerta que operen en árabe.
- Pruebas de integración de TTS en pipelines Python: al estar en ONNX y empaquetado en phoonnx, sirve para validar flujos de texto a voz en entornos con dependencias mínimas.
- Prototipado de interfaces conversacionales en árabe: generación de respuestas de voz en bots o demos antes de invertir en soluciones comerciales.
- Investigación en TTS para árabe: el paquete permite reproducir la inferencia del modelo de nipponjo en formato ONNX y comparar con otras alternativas del ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es 0,0 GB y no se detallan los pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser un modelo ONNX de TTS, es probable que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; el formato ONNX permite usar ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, el modelo original nipponjo/tts-arabic-onnx es la fuente directa de este paquete, y el vocoder hifigan-ar-nipponjo es el componente asociado. No se conocen alternativas comparables con datos verificables en la información disponible.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: la model card advierte explícitamente de que hay que consultar la release upstream antes de usarlo, especialmente en producción o con fines comerciales.
- Cobertura lingüística limitada exclusivamente al árabe.
- Dependencia de un front-end específico (scriptconv con MantoqPhonemizer) para generar los fonemas de entrada; un texto mal normalizado puede degradar la síntesis.
- El modelo requiere un vocoder externo (hifigan-ar-nipponjo) para producir audio; sin él solo se obtiene el espectrograma.
- Riesgo de alucinación y artefactos de audio inherente a los modelos TTS; no hay datos publicados sobre su tasa de error.
- Sin información sobre sesgos, datos de entrenamiento ni evaluación de calidad.
- Adopción muy baja (33 descargas, 0 likes), lo que reduce la validación comunitaria.
- No hay datos de benchmarks que permitan comparar su calidad con otras soluciones TTS en árabe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-ar-mixer128
- Modelo upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Vocoder: https://huggingface.co/Phoonnx/hifigan-ar-nipponjo
- Colección MixerTTS: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
