# Serkali-sudo/AutoSub-Voice-Classifier-LiteRT

## Resumen

AutoSub-Voice-Classifier-LiteRT es una conversión al formato LiteRT (anteriormente TensorFlow Lite) del modelo SpeechX de AhmedReda25300, un clasificador de voz de dos clases (femenina y masculina) derivado del encoder de OpenAI Whisper Base. Lo publica el usuario Serkali-sudo como componente del proyecto AutoSub, con el objetivo de sugerir automáticamente voces de doblaje en función del género detectado en el audio. El modelo conserva únicamente la cabeza de clasificación de voz y descarta la cabeza de identificación de idioma presente en SpeechX.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general ni de un LLM, sino de un clasificador de audio binario empaquetado para inferencia eficiente en CPU mediante LiteRT. Su interés práctico reside en que permite ejecutar la clasificación de voz en entornos sin GPU, con pesos almacenados en FP16 y un grafo optimizado para CPU, lo que lo hace adecuado para pipelines de subtitulado y doblaje ligeros.

La información pública disponible es muy limitada: el repositorio tiene 0 GB de tamaño declarado, 0 descargas y no se especifican idiomas soportados ni resultados de benchmarks. La model card se limita a describir los artefactos de exportación y a remitir a la licencia Apache 2.0 del modelo original y al aviso MIT de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de OpenAI Whisper Base con cabeza de clasificación de voz (2 clases) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | FP16 (almacenamiento de pesos en el grafo LiteRT para CPU) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con aviso MIT de Whisper) |
| Formato de pesos | TFLite / LiteRT (`speechx-fp16.tflite`), más `mel_filters_f32le.bin` y metadatos JSON |

## Arquitectura y entrenamiento

El modelo es una conversión de SpeechX, que a su vez parte del encoder de Whisper Base de OpenAI. Whisper Base es un transformer encoder-decoder diseñado para reconocimiento de voz; en este caso se reutiliza el encoder como extractor de representaciones acústicas y se le añade una cabeza de clasificación de dos clases (`female` y `male`). La conversión a LiteRT elimina la cabeza de identificación de idioma y conserva solo el clasificador de voz, con pesos almacenados en FP16 dentro de un grafo optimizado para ejecución en CPU.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, la composición de las muestras ni si hubo ajuste fino supervisado, RLHF o DPO. El repositorio incluye un fichero `validation.json` que documenta una comparación en CPU contra el clasificador SpeechX original sobre clips de test, lo que mide la paridad de la conversión más que la calidad intrínseca del modelo. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de voz binaria: distingue entre voz femenina (`female`) y masculina (`male`) a partir de audio.
- Preprocesado de audio incluido: los filtros Mel (`mel_filters_f32le.bin`) están pensados para audio mono a 16 kHz.
- Inferencia en CPU: el grafo LiteRT con pesos FP16 está orientado a ejecución sin GPU.
- Integración en AutoSub: pensado para sugerir voces de doblaje automáticamente.
- Sin identificación de idioma: la cabeza LID de SpeechX se ha eliminado en esta exportación.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Sugerencia de voces de doblaje en AutoSub: el clasificador etiqueta cada clip como voz femenina o masculina y el pipeline de subtitulado asigna la voz de doblaje correspondiente, reduciendo la intervención manual.
- Preetiquetado de corpus de audio: procesar grandes volúmenes de grabaciones en CPU para asignar una etiqueta de género preliminar que luego se revise manualmente, aprovechando que no requiere GPU.
- Enrutamiento en sistemas de transcripción: separar clips por tipo de voz antes de pasarlos a un modelo ASR, útil para organizar diarizaciones simples en entornos con recursos limitados.
- Aplicaciones de escritorio o móviles: al ser un grafo LiteRT para CPU, puede embeberse en aplicaciones locales de edición de audio o subtitulado sin depender de servicios en la nube.
- Filtrado previo en pipelines de datos: descartar o agrupar segmentos de audio según la voz detectada antes de tareas más costosas como transcripción o síntesis.
- Prototipado rápido de clasificación de voz: servir como línea base ligera para validar un flujo de clasificación binaria antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `validation.json`, que documenta una comparación de paridad en CPU contra el clasificador SpeechX original sobre clips de test, pero no se han proporcionado métricas concretas (exactitud, F1, latencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está exportado para ejecución en CPU mediante LiteRT.
- GPU recomendadas: no aplica para el artefacto publicado; no se documenta una variante GPU.
- Compatibilidad con GPU de consumo: el artefacto es de CPU; no se especifica soporte de aceleración por GPU.
- Opciones de despliegue: intérprete LiteRT / TensorFlow Lite, con preprocesado Mel a 16 kHz mono usando `mel_filters_f32le.bin`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Formato | Licencia | Contexto/audio |
|---|---|---|---|---|---|
| AutoSub-Voice-Classifier-LiteRT | Clasificador de voz (encoder Whisper Base) | 2 (female, male) | LiteRT/TFLite FP16 | Apache 2.0 | Audio 16 kHz mono |
| SpeechX (AhmedReda25300) | Clasificador de voz + LID | 2 + idioma | no disponible | Apache 2.0 | Audio |
| OpenAI Whisper Base | ASR encoder-decoder | no aplica | safetensors, etc. | MIT | Audio 16 kHz |

La comparación con alternativas específicas de clasificación de género vocal no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Clasificación binaria y simplista: reduce la voz a dos categorías (`female`/`male`), sin cubrir identidades no binarias ni matices acústicos.
- Sesgos potenciales: al no documentarse el dataset de entrenamiento, no puede evaluarse el sesgo por acento, edad, idioma o calidad de grabación.
- Riesgo de error en audio con ruido, música, voces superpuestas o muestras cortas; no se han publicado métricas de robustez.
- Dependencia del preprocesado: requiere audio mono a 16 kHz y el uso de los filtros Mel incluidos; un preprocesado distinto degradará los resultados.
- Sin cabeza de identificación de idioma: no debe usarse para detectar el idioma del audio.
- Tamaño del repositorio declarado como 0 GB y 0 descargas: la disponibilidad y el soporte de la comunidad son mínimos.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso MIT de Whisper incluido en el repositorio.
- No es un modelo de propósito general: no genera texto, no razona y no soporta tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Serkali-sudo/AutoSub-Voice-Classifier-LiteRT
- Modelo base SpeechX: https://huggingface.co/AhmedReda25300/SpeechX
- Encoder de referencia OpenAI Whisper Base: https://huggingface.co/openai/whisper-base
- LiteRT (documentación): https://ai.google.dev/edge/litert
