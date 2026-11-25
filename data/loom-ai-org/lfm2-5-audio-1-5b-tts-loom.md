# loom-ai-org/lfm2.5-audio-1.5b-tts-loom

## Resumen

LFM2.5-Audio-1.5B TTS Loom es una exportación al formato GGUF del modelo LiquidAI/LFM2.5-Audio-1.5B de Liquid AI, especializada exclusivamente en síntesis de voz (text-to-speech). El repositorio lo publica loom-ai-org y empaqueta los pesos originales sin modificarlos, pero los envuelve en un contenedor GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script de control (driver) necesarios para ejecutarlo con el motor loom.cpp. El modelo base combina un modelo de lenguaje híbrido LFM2.5 que genera tramas de códigos Mimi a través de un depthformer, junto con un detokenizador basado en LFM2 que reconstruye la forma de onda.

El modelo resuelve la conversión directa de texto a audio sin necesidad de fonemizador externo: codifica el texto por sí mismo y ofrece cuatro voces predefinidas (us_male, us_female, uk_male, uk_female) seleccionables mediante archivos de voz empaquetados. Con 1.376.338.393 parámetros reales y un repositorio de 22 GB, está pensado para despliegues ligeros que necesiten síntesis de voz local sin depender de infraestructura en la nube.

Su relevancia actual radica en que permite ejecutar un modelo de audio de Liquid AI en entornos controlados mediante el ecosistema loom (loom.cpp, loom-exporter, loom-py), manteniendo la licencia LFM Open License v1.0 heredada del modelo original. Está limitado al inglés y a la tarea de TTS, sin capacidades de reconocimiento o conversación por voz en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM híbrido LFM2.5 con depthformer para generación de tramas Mimi + detokenizador LFM2 |
| Parametros totales | 1.376.338.393 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye GGUF sin detallar variantes de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (categoría "other") |
| Formato de pesos | GGUF (loom.cpp), con archivos de voz adicionales en `voices/*.gguf` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo LFM2.5-Audio-1.5B de Liquid AI: un modelo de lenguaje híbrido LFM2.5 que, en modo TTS, genera tramas de códigos del códec neuronal Mimi a través de un módulo depthformer, y un detokenizador basado en LFM2 que convierte esas tramas en forma de onda de audio. La exportación a loom.cpp preserva los pesos originales y añade un grafo autodescriptivo junto con un driver que gestiona el ventaneo, el muestreo y el ensamblado necesarios para producir audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que el texto se codifica internamente sin fonemizador, y que la generación de cada trama se muestrea por defecto con temperatura 0,8 y top-k 64, mientras que el texto previo y posterior a la locución se decodifica de forma greedy. La exportación se verificó con decodificación greedy, obteniendo una forma de onda con una diferencia máxima de 4,1e-06 respecto a la implementación de referencia liquid-audio.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, con una sola generación por llamada de hasta unos 80 segundos de audio (1024 pasos).
- Cuatro voces predefinidas: `us_male` (integrada por defecto), `us_female`, `uk_male` y `uk_female`, seleccionables mediante archivos de voz en `voices/*.gguf`.
- Codificación de texto propia, sin necesidad de fonemizador externo.
- Generación en streaming: el driver del modelo entrega el audio por fragmentos que, unidos, reconstruyen exactamente la forma de onda de `infer`.
- Control de muestreo mediante `seed` y `temperature` (temperatura 0 para decodificación greedy).
- No incluye reconocimiento de voz (ASR) ni conversación voz a voz en esta exportación; esas capacidades existen en otros archivos del modelo base.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado en una única tarea de audio.

## Casos de uso

- Narración de artículos y documentación: el modelo convierte texto en audio en inglés con una voz consistente, adecuado para generar versiones audibles de contenidos escritos sin servicios externos.
- Generación de avisos y mensajes pregrabados: para sistemas de megafonía, contestadores o interfaces telefónicas que necesiten locuciones cortas en inglés con voces masculinas o femeninas de EE. UU. o Reino Unido.
- Audiolibros y pódcast de formato corto: dividiendo el texto en frases (dado el límite de unos 80 segundos por generación) se pueden producir segmentos de audio encadenables.
- Accesibilidad web: integración en aplicaciones que lean contenido en voz alta para usuarios con discapacidad visual, ejecutando el modelo localmente con loom-py.
- Prototipado de asistentes de voz: generación de respuestas habladas en pipelines de investigación donde se necesita audio sintético en inglés sin depender de APIs comerciales.
- Pruebas de calidad y regresión de sistemas de audio: el modo greedy reproducible (temperatura 0 y semilla fija) permite comparar formas de onda de forma determinista en pipelines de CI.
- Generación de voces para vídeos y demostraciones internas: las cuatro voces permiten alternar registros sin entrenar modelos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la verificación de fidelidad de la exportación: con decodificación greedy, la forma de onda generada difiere como máximo 4,1e-06 respecto a la implementación de referencia liquid-audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.376 millones de parámetros, la inferencia en precisión completa requiere del orden de varios gigabytes, y el repositorio completo ocupa 22 GB (incluyendo archivos de voz y posibles variantes).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del modelo sugiere que podría caber en GPUs de consumo con suficiente memoria, pero no hay datos oficiales.
- Opciones de despliegue: motor loom.cpp a través de la librería `loom-py-rt` (PyPI), con API `loom.Model.from_pretrained`, `model.text2speech.infer` y `model.text2speech.stream`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-Audio-1.5B TTS Loom (este) | 1.376 M | no disponible | en | LFM Open License v1.0 | GGUF (loom.cpp) |
| LiquidAI/LFM2.5-Audio-1.5B (base) | no disponible en la información | no disponible | en | LFM Open License v1.0 | safetensors (formato original de Liquid AI) |
| Otros modelos TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo base LiquidAI/LFM2.5-Audio-1.5B, del que esta exportación hereda pesos y licencia, y que además incluye capacidades de ASR y conversación voz a voz que no están presentes en esta exportación. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre la tarea de texto a voz: no transcribe audio (existe un archivo separado `lfm2.5-audio-1.5b-asr`) ni mantiene conversaciones voz a voz.
- Solo admite inglés; no hay soporte multilingüe.
- Una generación por llamada, con un máximo de aproximadamente 80 segundos de audio (1024 pasos); es necesario dividir textos largos en frases.
- El muestreo por defecto (temperatura 0,8, top-k 64) produce resultados distintos entre llamadas; para reproducibilidad hay que fijar `seed` o usar temperatura 0.
- La tasa de muestreo (`sample_rate`) debe pasarse manualmente (24000 en el ejemplo); una tasa incorrecta no provoca error, sino que reproduce la voz a velocidad equivocada.
- La licencia LFM Open License v1.0 es de categoría "other": es necesario revisar sus términos antes de un uso comercial, ya que puede imponer restricciones adicionales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero al ser un modelo de síntesis de voz, la calidad puede degradarse con texto fuera de dominio o con puntuación atípica.
- No se documentan requisitos de hardware ni rendimiento medido, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-ai-org/lfm2.5-audio-1.5b-tts-loom
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B/blob/main/LICENSE
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
