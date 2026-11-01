# Aijolot/whisper-small-onnx

## Resumen

Whisper small ONNX es una conversión a formato ONNX del modelo de reconocimiento automático del habla `openai/whisper-small`, publicada por el usuario Aijolot bajo el identificador `Aijolot/whisper-small-onnx`. No se trata de un modelo entrenado desde cero ni de un ajuste fino: el autor declara explícitamente que son los pesos oficiales de OpenAI sin entrenamiento adicional, empaquetados para su uso con la librería sherpa-onnx. El resultado es un artefacto de inferencia local orientado a la transcripción de audio en español e inglés.

La relevancia de esta ficha es acotada pero concreta: ofrece un pipeline de ASR ejecutable en local, sin dependencia de servicios remotos, con encoder cuantizado a int8 y decoder en FP32, y con soporte de cross-attention para estimar tiempos por palabra. El repositorio incluye metadatos de procedencia (`PROVENANCE.json`, `artifacts.json`), scripts de reproducción y un fichero `validation.json` que delimita el alcance de las pruebas realizadas, lo que facilita la auditoría de la conversión.

Por su tamaño (derivado de Whisper small, aproximadamente 244 millones de parámetros en el modelo original) y su empaquetado ONNX, está pensado para integración en aplicaciones de escritorio, servidores modestos o entornos embebidos donde se prefiera un binario autocontenido frente a un stack de PyTorch. No obstante, el modelo no incorpora diarización ni identificación de hablantes: la separación de voces debe resolverse con otro modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX; encoder int8 y decoder FP32 |
| Parametros totales | no disponible en la informacion proporcionada (modelo base: openai/whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper small) |
| Tipos de cuantizacion | Encoder int8; decoder FP32 (según model card) |
| Idiomas soportados | es, en |
| Licencia | MIT (pesos); herramientas sherpa-onnx bajo Apache-2.0 |
| Formato de pesos | ONNX (compatible con sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper small de OpenAI, un transformer encoder-decoder diseñado para reconocimiento automático del habla multilingüe y traducción de voz. Esta publicación no entrena ni ajusta el modelo: convierte los pesos oficiales a ONNX y aplica cuantización int8 al encoder, manteniendo el decoder en FP32. La inclusión de cross-attention en el decoder permite obtener marcas temporales a nivel de palabra, una funcionalidad relevante para subtitulado y alineación.

El repositorio documenta la procedencia mediante `PROVENANCE.json`, que registra el checkpoint oficial, el hash SHA-256, la revisión del exportador sherpa-onnx, las versiones de las dependencias y la plataforma empleada. El directorio `reproduce/` contiene los scripts y dependencias fijadas para repetir la conversión. No se documentan datos de entrenamiento adicionales, RLHF, DPO ni innovaciones de decodificación más allá de las propias de Whisper y del runtime sherpa-onnx.

## Capacidades

- Transcripción automática de voz a texto en español e inglés.
- Estimación de tiempos por palabra mediante cross-attention en el decoder.
- Inferencia local sin servicio remoto, adecuada para entornos con requisitos de privacidad.
- Ejecución mediante sherpa-onnx, lo que permite integración en aplicaciones nativas y pipelines ligeros.
- No incluye diarización ni identificación de hablantes; la separación de voces requiere un modelo adicional.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplicables a un modelo ASR).

## Casos de uso

- Subtitulado local de vídeo y audio: el modelo puede generar transcripciones con marcas temporales por palabra gracias al cross-attention del decoder, útiles para generar ficheros de subtítulos alineados.
- Transcripción de reuniones y notas de voz en español o inglés: al ejecutarse en local con sherpa-onnx, permite procesar audio sensible sin enviarlo a un servicio externo.
- Integración en aplicaciones de escritorio: el formato ONNX y el runtime sherpa-onnx facilitan empaquetar el modelo en herramientas nativas sin arrastrar dependencias de PyTorch.
- Prototipado de asistentes de voz: sirve como etapa ASR en pipelines de comandos por voz, siempre que se acepte la latencia y precisión propias de Whisper small.
- Indexación y búsqueda de archivos de audio: la transcripción permite generar índices textuales sobre grabaciones para búsqueda posterior.
- Evaluación y auditoría de conversiones ONNX: el repositorio incluye scripts de reproducción y metadatos de procedencia, útil para equipos que necesiten verificar la integridad de un artefacto antes de desplegarlo.
- Educación y experimentación: adecuado para prácticas de ASR con modelos abiertos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio remite a `validation.json` para el alcance de las pruebas realizadas, pero no se proporcionan métricas (WER, latencia, throughput) en la información accesible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial; el autor advierte que la conversión no garantiza un consumo concreto de RAM. El tamaño del repositorio es de 0,7 GB, lo que da una referencia del espacio en disco.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser un modelo de tamaño small, es plausible su ejecución en CPU, pero no se documentan cifras.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: sherpa-onnx (runtime principal); al ser ONNX, podría integrarse en otros runtimes compatibles, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Aijolot/whisper-small-onnx | no disponible (base Whisper small) | ventana de audio de 30 s (Whisper) | es, en | MIT | ONNX | Conversión sin entrenamiento adicional; encoder int8 |
| openai/whisper-small | ~244 M (modelo original) | ventana de audio de 30 s | multilingüe | MIT | PyTorch/safetensors | Modelo base oficial; requiere stack PyTorch |
| openai/whisper-base | ~74 M (modelo original) | ventana de audio de 30 s | multilingüe | MIT | PyTorch/safetensors | Menor tamaño y precisión; alternativa si los recursos son muy limitados |
| openai/whisper-medium | ~769 M (modelo original) | ventana de audio de 30 s | multilingüe | MIT | PyTorch/safetensors | Mayor precisión a costa de más recursos |

Nota: los datos de parámetros de los modelos base de OpenAI son de referencia general; la información proporcionada no incluye cifras verificadas para esta conversión concreta.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte que Whisper puede inventar texto, omitir palabras y fallar con ruido, acentos marcados y voces superpuestas.
- Los tiempos por palabra son estimaciones, no medidas exactas.
- No realiza identificación de personas ni diarización; no debe usarse la salida como evidencia sin revisión humana.
- Solo se declaran los idiomas es y en; el comportamiento en otros idiomas no está garantizado por esta publicación.
- La conversión no garantiza un consumo concreto de RAM ni calidad en llamadas reales; el alcance de las pruebas está limitado a lo recogido en `validation.json`.
- Licencia: los pesos son MIT (copyright OpenAI) y las herramientas sherpa-onnx Apache-2.0; se deben conservar atribuciones y ficheros de licencia. La conversión no altera la licencia de los pesos.
- Recomendación de integración: fijar una revisión inmutable del repositorio para evitar cambios inesperados en producción.
- No subir audios privados al repositorio del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Aijolot/whisper-small-onnx
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio sherpa-onnx: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
