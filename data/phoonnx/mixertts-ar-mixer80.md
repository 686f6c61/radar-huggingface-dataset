# Phoonnx/mixertts-ar-mixer80

## Resumen

mixertts-ar-mixer80 es un modelo de síntesis de voz (text-to-speech) en árabe, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original, desarrollado por nipponjo bajo el nombre tts-arabic-onnx, emplea la arquitectura MixerTTS para convertir texto en un espectrograma que posteriormente se transforma en audio mediante el vocoder hifigan-ar-nipponjo. Está publicado en formato ONNX, lo que permite inferencia eficiente en CPU y GPU sin necesidad de frameworks de deep learning pesados.

El modelo se distribuye como un paquete listo para usar con la librería phoonnx, que gestiona tanto la carga del modelo como la descarga automática del vocoder asociado. La entrada de texto se procesa mediante el fonemizador Mantoq, incluido en la librería scriptconv, que normaliza el texto árabe y lo convierte al alfabeto Buckwalter antes de alimentar el modelo. Está orientado a aplicaciones de lectura en voz alta, asistentes de voz y sistemas de accesibilidad en árabe.

La relevancia actual del modelo radica en su integración con el ecosistema OVOS (Open Voice OS), donde se instala como plugin de TTS mediante ovos-tts-plugin-phoonnx. Sin embargo, la información pública disponible es muy limitada: el repositorio ocupa 0.0 GB según los metadatos de Hugging Face, no se registran descargas significativas (37 descargas, 0 likes) y la licencia figura como "other" sin que el autor haya especificado términos concretos, lo que introduce incertidumbre para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MixerTTS (modelo acústico) + vocoder HiFi-GAN (hifigan-ar-nipponjo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | árabe (ar) |
| Licencia | other (no especificada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura MixerTTS se compone de un modelo acústico que genera espectrogramas a partir de fonemas y un vocoder HiFi-GAN que convierte esos espectrogramas en formas de onda de audio. El modelo acústico recibe como entrada fonemas Mantoq codificados en el alfabeto Buckwalter, un estándar de transliteración del árabe que facilita el procesamiento de caracteres. El vocoder asociado, hifigan-ar-nipponjo, se descarga automáticamente junto con el modelo al usar phoonnx.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El modelo original fue publicado por nipponjo en Hugging Face (nipponjo/tts-arabic-onnx), pero los detalles de entrenamiento no están documentados en la model card proporcionada. La innovación técnica destacable es el empaquetado en ONNX para inferencia ligera y la integración con el pipeline de phoonnx, que automatiza la fonemización, la síntesis y la vocodificación en un único flujo.

## Capacidades

- Síntesis de voz (text-to-speech) en árabe a partir de texto escrito.
- Conversión de texto a fonemas Mantoq mediante scriptconv, con normalización de texto árabe.
- Generación de espectrogramas y conversión a audio WAV mediante vocoder HiFi-GAN.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx para asistentes de voz.
- Ejecución en formato ONNX, compatible con entornos Python y potencialmente con otros runtimes ONNX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura en voz alta de documentos en árabe: el modelo sintetiza texto escrito en voz natural, adecuado para aplicaciones de accesibilidad que convierten artículos, libros o correos electrónicos en audio para usuarios con discapacidad visual.
- Asistentes de voz domésticos con OVOS: mediante el plugin ovos-tts-plugin-phoonnx, el modelo se integra en asistentes locales que responden en árabe, permitiendo respuestas habladas a comandos de voz sin dependencia de servicios en la nube.
- Sistemas de navegación y anuncios públicos: el modelo puede generar locuciones en árabe para aplicaciones de transporte, anuncios de aeropuertos o estaciones, donde se requiere una voz clara y consistente en tiempo real.
- Aplicaciones educativas de aprendizaje de árabe: síntesis de vocabulario y frases para herramientas de aprendizaje de idiomas, con pronunciación fonémica controlada mediante el fonemizador Mantoq.
- Atención al cliente automatizada en árabe: lectura de respuestas generadas por un chatbot o sistema de IVR, donde el TTS convierte el texto de respuesta en audio para interacciones telefónicas o por voz.
- Generación de audiolibros y contenido multimedia: producción de narraciones en árabe para podcasts, audiolibros o vídeos, con la posibilidad de procesar lotes de texto mediante scripts Python usando phoonnx.
- Pruebas de integración en pipelines de CI/CD: verificación automatizada de la síntesis de voz en entornos de desarrollo, usando el modelo ONNX para tests de regresión de audio sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio figura como 0.0 GB, lo que sugiere pesos ligeros, pero no se confirma el tamaño real del modelo ONNX).
- GPU recomendadas: no disponible. Al ser un modelo ONNX de TTS, es probable que funcione en CPU y GPU consumer, pero no se especifican modelos concretos.
- ¿Cabe en consumer GPU? No se dispone de datos que lo confirmen; el formato ONNX y el tamaño reducido del repositorio sugieren que podría ejecutarse en CPU, pero no hay confirmación oficial.
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx, y potencialmente cualquier runtime compatible con ONNX (onnxruntime).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de TTS en árabe. Los datos públicos de este modelo (parámetros, contexto, benchmarks) no están documentados, y no se han identificado en la información proporcionada modelos comparables de la misma categoría con especificaciones verificables.

## Limitaciones y advertencias

- Licencia "other" sin términos concretos: el autor no especifica la licencia, lo que impide confirmar si el uso comercial está permitido. Es necesario consultar el repositorio upstream nipponjo/tts-arabic-onnx antes de cualquier despliegue en producción.
- Idioma único: el modelo solo soporta árabe, sin capacidades multilingües documentadas.
- Dependencia de fonemizador externo: requiere scriptconv con el extra ar-phonemizers para la fonemización Mantoq, lo que añade una dependencia adicional en el pipeline.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento o con diacríticos ausentes.
- Sin datos de benchmarks: no hay métricas objetivas de calidad (MOS, WER) publicadas, lo que dificulta evaluar su rendimiento frente a alternativas.
- Adopción muy baja: 37 descargas y 0 likes indican un modelo poco validado por la comunidad, con riesgo de bugs no detectados.
- Tamaño del repositorio no representativo: el metadato de 0.0 GB puede indicar que los pesos no están incluidos en el repositorio principal o que se cargan dinámicamente, lo que requiere verificar la disponibilidad real de los archivos ONNX.
- Fecha de creación futura: el metadato indica 2026-11-14, lo que puede reflejar un error de registro o una fecha programada; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/mixertts-ar-mixer80
- Modelo upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Vocoder: https://huggingface.co/Phoonnx/hifigan-ar-nipponjo
- Colección MixerTTS: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
