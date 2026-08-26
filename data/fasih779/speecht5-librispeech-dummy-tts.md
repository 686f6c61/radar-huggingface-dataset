# Fasih779/speecht5-librispeech-dummy-tts

## Resumen

Fasih779/speecht5-librispeech-dummy-tts es un modelo de síntesis de voz (text-to-speech) en inglés, obtenido mediante fine-tuning del modelo base microsoft/speecht5_tts sobre un subconjunto mínimo del corpus LibriSpeech. El autor, Fasih779, lo creó como parte del ejercicio práctico de la Unidad 6 del Hugging Face Audio Course, por lo que su propósito principal es educativo y demostrativo, no de producción.

El modelo se basa en la arquitectura SpeechT5, un encoder-decoder unificado para procesamiento de lenguaje hablado que comparte representaciones entre texto y audio. Con 144.433.890 parámetros y un peso de 0,6 GB en formato safetensors, el modelo genera audio a partir de texto, aunque su entrenamiento se limitó a una sola época sobre un dataset de prueba, lo que condiciona su calidad y generalización.

Su relevancia reside en servir como ejemplo reproducible de cómo ajustar un modelo TTS con Transformers y en ilustrar el flujo de trabajo de fine-tuning sobre una arquitectura de síntesis de voz. No se ha publicado ningún benchmark formal, y su uso práctico fuera de entornos de aprendizaje no está recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder unificado para texto y audio) |
| Parametros totales | 144.433.890 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SpeechT5, propuesta en el articulo "SpeechT5: Unified-Modal Encoder-Decoder Pre-Training for Spoken Language Processing". SpeechT5 emplea un encoder-decoder basado en transformer que comparte una misma representacion latente para texto y audio, lo que permite pre-entrenar sobre datos no etiquetados de ambas modalidades y despues adaptarlo a tareas como la sintesis de voz. Para la generacion de audio, el decoder produce espectrogramas que posteriormente se convierten en senal de audio mediante un vocoder externo (tipicamente HiFi-GAN).

El entrenamiento de este modelo consistio en un fine-tuning de una sola epoca sobre el dataset `hf-internal-testing/librispeech_asr_dummy`, un subconjunto de prueba de LibriSpeech que contiene solo unas pocas grabaciones. No se emplearon tecnicas de RLHF ni DPO, y el proceso se realizo siguiendo los pasos del Hugging Face Audio Course. El resultado es un modelo con capacidades basicas de TTS, pero sin ajuste fino en datos extensos ni optimizacion de hiperparametros.

## Capacidades

- Sintesis de voz en ingles a partir de texto (TTS).
- Generacion de audio de 16 kHz, acorde al formato de LibriSpeech.
- Reproducibilidad del proceso de fine-tuning para fines educativos.
- Compatibilidad con la libreria `transformers` y con pipelines de `text-to-speech`.
- No se incluyen capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal mas alla de audio.

## Casos de uso

- Ejercicio de aprendizaje: el modelo sirve como ejemplo practico para entender como ajustar un TTS con Transformers, ideal para cursos y talleres.
- Prototipado rapido: puede usarse en un entorno de desarrollo para probar el flujo completo de generacion de voz antes de sustituirlo por un modelo de mayor calidad.
- Demo interactiva: desplegar una demostracion en Hugging Face Spaces que permita a los usuarios escribir texto y escuchar la sintesis, mostrando el proceso de fine-tuning.
- Prueba de pipelines: integracion en un pipeline de audio para validar la integracion con otras herramientas del ecosistema Hugging Face.
- Benchmark de referencia: para comparar el efecto de entrenar con mas datos o mas epocas, este modelo puede servir como punto de partida.
- Aplicaciones accesibles de bajo coste: en entornos con recursos limitados, puede utilizarse como un TTS basico para lectura de texto en ingles, aunque con calidad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta metricas como MMLU, HumanEval, GSM8K u otras, ya que su tarea es exclusivamente de sintesis de voz y no se han evaluado en articulos o repositorios oficiales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,6 GB, la inferencia puede realizarse en CPU con un uso de memoria de alrededor de 1-2 GB, o en una GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU de gama de entrada (p. ej., NVIDIA GTX 1650, RTX 2060) o incluso una CPU moderna son suficientes.
- Opciones de despliegue: se puede usar con la libreria `transformers` de Hugging Face, con el pipeline `text-to-speech`, o mediante herramientas como `TTS` de Coqui AI si se adapta el formato de pesos.
- Latencia y throughput: no se han publicado datos especificos, pero al ser un modelo de tamano reducido, la generacion de audio se espera que sea rapida en hardware moderado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Fasih779/speecht5-librispeech-dummy-tts | 144.433.890 | no disponible | MIT | Educativo, demo |
| microsoft/speecht5_tts | 144.433.890 | no disponible | MIT | TTS general, mas robusto |
| tacotron2 | ~90M | no disponible | BSD-3 | TTS, requiere vocoder |

La comparativa se limita a modelos TTS de tamano similar, pero no se dispone de datos de rendimiento directos para este modelo. El modelo base `microsoft/speecht5_tts` es la referencia principal, y el presente modelo es una version fine-tuned con datos minimos, por lo que se espera que su calidad sea inferior.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos, pero el modelo se entrena en un subjunto de LibriSpeech, que proviene de audiolibros en ingles, por lo que puede presentar limitaciones en acentos o dialectos no representados.
- Alucinacion: en TTS, el riesgo de alucinacion se traduce en errores de pronunciacion o de entonacion, especialmente con palabras desconocidas o nombres propios.
- Limitaciones de contexto: el modelo no es adecuado para entradas largas; se recomienda segmentar el texto en frases cortas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo es un ejercicio educativo y no se recomienda para aplicaciones criticas.
- Caveat de produccion: al estar entrenado con un dataset dummy de una sola epoca, la calidad de voz es baja y puede fallar en entornos ruidosos o con texto complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fasih779/speecht5-librispeech-dummy-tts
- Modelo base (microsoft/speecht5_tts): https://huggingface.co/microsoft/speecht5_tts
- Paper de SpeechT5: https://arxiv.org/abs/1910.09700
- Repositorio de SpeechT5 (GitHub): https://github.com/microsoft/SpeechT5
- Dataset LibriSpeech: https://www.openslr.org/12/
