# crozierm/eyes-and-ears-aligner

## Resumen

Eyes & Ears — word aligner es un export ONNX del modelo `facebook/wav2vec2-base-960h` preparado para realizar alineamiento forzado (forced alignment) a nivel de palabra sobre audio en inglés. Lo publica el desarrollador `crozierm` como componente interno de la aplicación iOS «Eyes & Ears», donde se usa para calcular el tiempo exacto de cada palabra pronunciada y sincronizar el resaltado del texto con la narración. No es un modelo nuevo: no se ha reentrenado ningún peso, solo se ha exportado el modelo base a ONNX y se ha cuantizado dinámicamente a int8 para ejecutarlo en el dispositivo con ONNX Runtime.

El interés técnico está en el formato y el tamaño: el repositorio ocupa 0,1 GB y contiene dos ficheros (`aligner-int8.onnx` y `aligner.json` con el vocabulario y la configuración de frames), lo que permite inferencia completamente offline en hardware móvil sin depender de un servicio externo de ASR. La arquitectura subyacente es un wav2vec2-base (extractor convolucional de características más encoder Transformer de 12 capas, ~95 M de parámetros) con cabeza CTC, entrenado originalmente sobre 960 horas de LibriSpeech en inglés.

Es relevante para desarrolladores que necesiten marcas temporales por palabra con bajo coste computacional y sin conexión, especialmente en escenarios donde ya se dispone de la transcripción (audiolibros, subtitulado, accesibilidad, anotación de corpus). No sirve como sistema ASR general ni soporta otros idiomas distintos del inglés, y no hay métricas publicadas de la versión cuantizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2-base con cabeza CTC (extractor convolucional + encoder Transformer); exportada a ONNX |
| Parámetros totales | ~95 M (heredados de `facebook/wav2vec2-base-960h`, sin reentrenar) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; procesa formas de onda, no secuencias de texto) |
| Tipos de cuantización | int8 dinámica (ONNX Runtime); los pesos originales del modelo base están en fp32 |
| Idiomas soportados | Inglés (heredado de LibriSpeech 960h); la model card no declara una lista de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`aligner-int8.onnx`) + JSON de vocabulario y configuración (`aligner.json`) |
| Entrada de audio | No especificada en la model card; el modelo base wav2vec2 opera a 16 kHz mono |
| Tamaño del repositorio | 0,1 GB |
| Autor | crozierm |
| Librería | onnx |

## Arquitectura y entrenamiento

El modelo es una exportación directa de `facebook/wav2vec2-base-960h`. La arquitectura wav2vec2 2.0 combina un extractor de características convolucional que convierte la forma de onda en bruto en una secuencia de representaciones latentes, seguido de un encoder Transformer (12 capas, dimensión oculta 768, 8 cabezas de atención en la variante base) y una cabeza de clasificación CTC. El modelo base se preentrenó de forma auto-supervisada con wav2vec 2.0 y se afinó con CTC sobre 960 horas de LibriSpeech, un corpus de audiolibros en inglés leído en condiciones relativamente limpias.

Este repositorio concreto no aporta entrenamiento nuevo: la model card indica explícitamente que «no weights were retrained». El trabajo del autor consiste en la exportación a ONNX y la cuantización dinámica a int8, más la generación de `aligner.json` con el vocabulario y los ajustes de frames necesarios para el alineamiento. No se documentan en la información disponible detalles sobre el proceso de exportación (versión de ONNX Runtime, opacidad de la cuantización, calibración) ni sobre evaluación de la pérdida de precisión respecto al modelo fp32.

## Capacidades

- Alineamiento forzado a nivel de palabra: dado un audio y su transcripción, calcula marcas temporales para cada palabra.
- Decodificación CTC sobre el vocabulario del modelo base, suficiente para verificar o refinar la correspondencia entre audio y texto.
- Inferencia en el dispositivo (on-device) con ONNX Runtime, sin conexión a red.
- Modelo de tamaño reducido (~0,1 GB en int8), apto para integración en aplicaciones móviles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto libre, resúmenes ni respuestas conversacionales.
- No dispone de capacidades de visión, audio-generación ni modo «thinking».
- No es multilingüe: el modelo base está entrenado sobre habla en inglés.

## Casos de uso

- Lectura guiada y karaoke de texto: la aplicación original usa el alineador para que el resaltado de cada palabra siga la narración de audio; el modelo proporciona el instante de inicio y fin de cada palabra con un coste de cómputo mínimo en el dispositivo.
- Accesibilidad para audiolibros y textos narrados: sincronizar un libro electrónico con su versión en audio permite resaltar la frase leída, útil para personas con dislexia o con dificultades de lectoescritura, sin enviar el audio a la nube.
- Subtitulado palabra a palabra para vídeo y pódcast en inglés: partiendo de una transcripción existente, el alineador genera los timestamps necesarios para subtítulos tipo karaoke o para resaltar el término que se está pronunciando.
- Evaluación de fluidez lectora: comparar los tiempos reales de cada palabra con los esperados permite detectar pausas anómalas, velocidad de lectura o palabras omitidas en ejercicios de lectura en voz alta.
- Anotación de corpus lingüísticos: alinear grabaciones con sus transcripciones para producir corpus con marcas temporales a nivel de palabra destinados a investigación fonética o entrenamiento de modelos posteriores.
- Navegación e indexación de audio: con las marcas por palabra se puede construir un índice que permita saltar al punto exacto de un pódcast o una clase donde se pronuncia un término concreto.
- Ajuste de duración en doblaje y localización: disponer de los límites temporales de cada palabra facilita recortar, estirar o reajustar segmentos al adaptar un guion a otro idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de alineamiento ni comparación con el modelo fp32 original, y tampoco se documentan latencias o throughput medidos en dispositivo. Cualquier cifra de WER del modelo base `facebook/wav2vec2-base-960h` corresponde a la versión fp32 en PyTorch y no es trasladable sin verificación a este export int8.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso típico; con ~95 M de parámetros en int8 los pesos ocupan del orden de 95-100 MB, y el consumo de memoria de trabajo es de unos cientos de MB.
- GPU recomendadas: ninguna dedicada. El modelo está pensado para CPU (ARM64 en iOS, x86-64 en escritorio) mediante ONNX Runtime.
- Cabe en cualquier GPU de consumo e incluso en hardware móvil; usar una A100, H100 o RTX 4090 no aporta ninguna ventaja práctica para este tamaño.
- Opciones de despliegue: ONNX Runtime (runtime nativo de iOS/Android, escritorio y servidor). No se documentan otros formatos (GGUF, CoreML, TFLite) ni conversiones oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| `crozierm/eyes-and-ears-aligner` | ~95 M | ONNX | int8 dinámica | Apache-2.0 | Alineamiento forzado por palabra, on-device |
| `facebook/wav2vec2-base-960h` | ~95 M | PyTorch (safetensors/bin) | fp32 | Apache-2.0 | ASR CTC y base para alineamiento; requiere exportación |
| Alineadores fonéticos tipo Montreal Forced Aligner | No disponible | No disponible | No disponible | No disponible | Alineamiento fonético con diccionario de pronunciación |
| Pipelines ASR con timestamps por palabra (p. ej. basados en Whisper) | No disponible | No disponible | No disponible | No disponible | Transcripción y marcas temporales en un solo paso, mayor coste |

La ventaja de este export frente al modelo base es el formato: elimina la dependencia de PyTorch y reduce el tamaño de los pesos, a cambio de una posible pérdida de precisión no cuantificada. Frente a soluciones de alineamiento fonético con diccionario, no requiere un léxico de pronunciación, pero solo cubre inglés y no ofrece control explícito sobre fonemas.

## Limitaciones y advertencias

- Solo inglés: el modelo base se entrenó sobre LibriSpeech (960 h de audiolibros en inglés) y no se ha adaptado a otros idiomas.
- No es un sistema ASR autónomo: el alineamiento forzado presupone una transcripción correcta; si el texto no coincide con el audio, las marcas temporales serán incorrectas sin aviso de error.
- La cuantización int8 dinámica puede degradar la precisión en los límites de palabra; no hay métricas publicadas que cuantifiquen esa pérdida.
- Rendimiento degradado esperado en audio con ruido, solapamiento de voces, música de fondo o acentos muy alejados del dominio de LibriSpeech.
- El modelo base opera sobre audio a 16 kHz mono; es necesario remuestrear las entradas con otras frecuencias o number de canales.
- El vocabulario CTC es el del modelo base (caracteres en inglés); los detalles concretos están en `aligner.json` y no se documentan en la model card.
- Sesgos heredados del corpus de entrenamiento: habla de audiolibros, predominantemente lectura estándar de Estados Unidos, con posible peor comportamiento en otras variedades dialectales.
- Licencia Apache-2.0, que permite uso comercial y redistribución, pero obliga a mantener la atribución y el aviso de licencia; el modelo base conserva su propia licencia Apache-2.0.
- Repositorio con 0 descargas y 0 «likes» en el momento de la consulta: sin validación por parte de la comunidad ni informes independientes de calidad.
- No hay información sobre el proceso de exportación ni sobre la versión de ONNX Runtime utilizada, lo que dificulta reproducir el binario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crozierm/eyes-and-ears-aligner
- Modelo base: https://huggingface.co/facebook/wav2vec2-base-960h
- Paper de wav2vec 2.0 (arquitectura del modelo base): https://arxiv.org/abs/2006.11477
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos de este export) en la búsqueda web realizada.
