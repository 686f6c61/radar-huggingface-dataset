# Phoonnx/styletts2-gl_es-brais-cotovia

## Resumen

styletts2-gl_es-brais-cotovia es un modelo de síntesis de voz (text-to-speech) en gallego, empaquetado por Phoonnx a partir del modelo original `proxectonos/Nos_StyleTTS2-Brais-GL` desarrollado por Proxecto Nós. Se distribuye en formato ONNX dentro del ecosistema de la librería phoonnx, lo que facilita su integración en aplicaciones Python y en el asistente de voz OVOS sin necesidad de dependencias de PyTorch en tiempo de inferencia.

El modelo emplea la arquitectura StyleTTS2, un sistema TTS neuronal que combina un codificador de estilo con un decodificador basado en difusión para generar habla con prosodia natural. Está especializado en la variante `gl-ES` del gallego y utiliza fonemas y alfabeto Cotovia como representación de entrada, lo que lo vincula al estándar de fonemización empleado por Proxecto Nós.

Su relevancia radica en cubrir una lengua minoritaria como el gallego con un modelo de código abierto (licencia Apache 2.0) y un pipeline de despliegue ligero basado en ONNX, con un tamaño de repositorio de 0,8 GB que permite su ejecución en entornos con recursos limitados. La información pública disponible sobre el modelo es escasa: no se detallan parámetros, contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; cuantizaciones adicionales no documentadas) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,8 GB |
| Entrada de texto | fonemas Cotovia, alfabeto Cotovia |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Proxecto Nós (empaquetado por Phoonnx) |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de síntesis de voz neuronal que integra un codificador de estilo y un decodificador generativo basado en difusión, junto con módulos de predicción de prosodia y duración. Esta combinación permite generar habla con entonación y ritmo más naturales que los sistemas TTS concatenativos o los basados únicamente en autoregresión. La entrada se realiza a nivel de fonemas, en este caso mediante el fonemizador Cotovia de la librería `scriptconv`, que normaliza el texto y lo convierte al alfabeto fonético del modelo.

No se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO. El modelo original fue desarrollado por Proxecto Nós y esta versión ha sido empaquetada por Phoonnx para su ejecución en ONNX mediante la librería phoonnx, que actúa como capa de inferencia y de gestión de voces. No se documentan innovaciones técnicas adicionales más allá de las propias de StyleTTS2.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto escrito.
- Fonemización mediante Cotovia (`CotoviaPhonemizer` de `scriptconv_copyleft.phonemizers.gl`).
- Clonación de voz a partir de audio de referencia, según indica la model card ("The voice clones a speaker from reference audio").
- Integración con la librería phoonnx para síntesis directa a WAV en Python.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en gallego: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configurarse en `mycroft.conf` para proporcionar respuestas habladas en gallego en un asistente doméstico o de escritorio.
- Lectura de contenidos en gallego: conversión de artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo de contenido, aprovechando la fonemización Cotovia para una pronunciación correcta.
- Sistemas de navegación o avisos por voz: generación de mensajes hablados en gallego en entornos de conducción o señalización, con un modelo ligero (0,8 GB) que puede ejecutarse en dispositivos con recursos limitados.
- Locución para vídeos y pódcast: producción de narraciones en gallego con prosodia natural gracias al decodificador de difusión de StyleTTS2, útil para creadores de contenido en esta lengua.
- Atención al cliente automatizada en gallego: síntesis de respuestas en un sistema de IVR o chatbot, combinando el modelo con un motor de diálogo y desplegándolo en infraestructura propia por su licencia Apache 2.0.
- Investigación en tecnologías del habla para lenguas minoritarias: uso del modelo como referencia o base para experimentos de adaptación, clonación de voz o evaluación de TTS en gallego, dado su carácter abierto y su formato ONNX.
- Prototipado rápido en Python: integración mediante `TTSModelManager` de phoonnx para generar archivos WAV en scripts y pipelines de datos sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,8 GB, por lo que el modelo en ONNX debería caber en GPUs con 2-4 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. Al ejecutarse en ONNX, puede usar CPU o GPU mediante los proveedores de ejecución de ONNX Runtime.
- Compatibilidad con GPU de consumo: probable en tarjetas con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650 o superiores), aunque no está confirmado por el autor.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y ejecución mediante ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| styletts2-gl_es-brais-cotovia (este) | StyleTTS2 | Gallego (gl-ES) | Apache 2.0 | ONNX | 0,8 GB |
| proxectonos/Nos_StyleTTS2-Brais-GL | StyleTTS2 | Gallego | Apache 2.0 (según upstream) | no disponible | no disponible |
| Otros modelos de la colección StyleTTS2 de Phoonnx | StyleTTS2 | Diversos | no disponible | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta gallego (`gl-ES`); no es multilingüe.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un corpus limitado de una lengua minoritaria, puede presentar sesgos de hablante, registro o variedad dialectal.
- Riesgo de alucinación o artefactos en la síntesis ante textos fuera de dominio, signos de puntuación atípicos o fonemas no cubiertos por Cotovia.
- La clonación de voz a partir de audio de referencia plantea riesgos de uso indebido (suplantación de identidad); se recomienda aplicar controles de consentimiento en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo upstream y de los datos de entrenamiento originales, no detallados en la información disponible.
- El modelo está empaquetado para phoonnx; su uso fuera de esta librería requiere gestionar manualmente el pipeline ONNX y la fonemización Cotovia.
- No se documentan métricas de calidad (MOS, WER) ni benchmarks, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-gl_es-brais-cotovia
- Modelo upstream: https://huggingface.co/proxectonos/Nos_StyleTTS2-Brais-GL
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
