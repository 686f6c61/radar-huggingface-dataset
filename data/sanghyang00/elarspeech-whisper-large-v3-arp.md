# Sanghyang00/ELARSpeech-Whisper-Large-v3-arp

## Resumen

ELARSpeech-Whisper-Large-v3-arp es un modelo de reconocimiento automatico del habla (ASR) derivado de openai/whisper-large-v3 mediante fine-tuning sobre la lengua arapaho (codigo ISO 639-3 "arp"). Lo publica el usuario Sanghyang00 dentro del proyecto ELARSpeech, del que no se aportan mas datos en la model card. Es un modelo denso de arquitectura encoder-decoder de tipo transformer, con 1.543.491.840 parametros totales confirmados por los pesos safetensors, y un repositorio de 6,2 GB cuyo tamano es coherente con pesos almacenados en fp32 (1.543.491.840 x 4 bytes ≈ 6,17 GB).

El problema que resuelve es concreto y de nicho: no existen apenas sistemas ASR publicos para arapaho, una lengua algonquina en situacion de peligro con muy pocos hablantes y escaso material transcrito. Este checkpoint traslada el conocimiento multilingue y acustico de whisper-large-v3 a un unico idioma, lo que es relevante para documentacion linguistica, revitalizacion de la lengua y anotacion asistida de corpus orales.

La relevancia practica esta limitada por su estado: el repositorio no declara licencia, no publica cifras de WER ni composicion del dataset, y acumula 0 descargas y 0 "likes". La model card unicamente afirma que el artefacto exportado se verifico contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado de verificacion de transcripcion exacta PASS. Se trata, por tanto, de un modelo monoproposito y monolingue, no de un ASR generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (clase `WhisperForConditionalGeneration`) |
| Parametros totales | 1.543.491.840 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio por ventana de entrada (1500 tramas mel), heredado de whisper-large-v3; limite del decodificador no declarado en el repositorio |
| Tipos de cuantizacion | no disponible en el repositorio (pesos safetensors; el tamano de 6,2 GB es coherente con fp32) |
| Idiomas soportados | arapaho, codigo ISO 639-3 `arp` (monolingue) |
| Licencia | no disponible (la model card remite a la licencia del modelo base, openai/whisper-large-v3) |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers |
| Modelo base | openai/whisper-large-v3 |
| Tamano del repositorio | 6,2 GB |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-10-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de whisper-large-v3 sin modificaciones estructurales: un encoder transformer que consume espectrogramas mel logaritmicos de 30 segundos y un decoder autorregresivo que genera tokens de texto condicionado por tokens especiales de idioma y tarea. El fine-tuning se realiza sobre el checkpoint completo (tag `base_model:finetune:openai/whisper-large-v3`), por lo que se conservan los 1.543.491.840 parametros del modelo base. El ejemplo de uso de la model card construye explicitamente la secuencia de prompt del decodificador con `<|arp|>`, `<|transcribe|>` y `<|notimestamps|>`, lo que indica que el token de idioma del modelo exportado es propio del proyecto ELARSpeech y que la decodificacion no debe lanzarse mediante el argumento `language=`.

No hay informacion en la model card sobre numero de tokens de audio de entrenamiento, composicion del dataset, estrategia de aumento de datos, uso de RLHF/DPO ni hiperparametros. Tampoco se documenta si el fine-tuning congelo el encoder o ajusto todos los parametros. La unica garantia tecnica declarada es una verificacion de transcripcion exacta (PASS) contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, sin que se detallen el tamano de dicho conjunto ni la metrica exacta empleada.

## Capacidades

- reconocimiento automatico del habla monolingue en arapaho, con salida de transcripcion de texto plano.
- Entrada de audio mono a 16 kHz; el propio autor indica que hay que remuestrear a esa frecuencia antes de la inferencia.
- Condicionamiento explicito de idioma y tarea mediante tokens especiales (`<|arp|>`, `<|transcribe|>`, `<|notimestamps|>`).
- Generacion autoregresiva con `max_new_tokens=200` y `num_beams=1` en el ejemplo publicado, es decir, decodificacion greedy.
- Soporte de decodificacion con beam search al ser compatible con la API `generate` de transformers, aunque el autor recomienda `num_beams=1` para reproducir el comportamiento del modelo exportado.
- Capacidad de desactivar marcas de tiempo mediante `<|notimestamps|>`, segun el ejemplo de la model card.
- No se declaran capacidades de traduccion, identificacion de idioma, diarizacion de hablantes, tool calling, function calling, uso como agente, vision, audio comprensivo ni modo de razonamiento.

## Casos de uso

- Documentacion linguistica de campo: transcripcion automatica de grabaciones de hablantes nativos de arapaho para su posterior revision manual. El modelo es adecuado porque es uno de los pocos ASR publicos entrenados especificamente para esta lengua, y la ventana de 30 segundos encaja con la segmentacion habitual de elicitaciones y narrativas orales.
- Revitalizacion linguistica y materiales didacticos: conversion de audios de lecciones o cuentos tradicionales en texto para generar materiales de ensenanza. Al ser monolingue, no introduce salidas en otros idiomas por confusion de deteccion de lengua.
- Archivado y busqueda de patrimonio oral: indexacion de colecciones de audio en arapaho para permitir busqueda por palabras clave sobre las transcripciones, aprovechando que el modelo opera sobre fragmentos de 30 segundos facilmente paralelizables.
- Anotacion asistida de corpus: pretranscripcion masiva seguida de correccion humana, reduciendo el coste de crear corpus transcritos para futuros fine-tunings. La verificacion PASS contra el checkpoint original aporta cierta confianza en la fidelidad del artefacto exportado.
- Subtitulado de material audiovisual en arapaho: generacion de subtitulos con marcas de tiempo si se habilita la decodificacion temporal, util para videos comunitarios o educativos.
- Investigacion comparativa en ASR de bajos recursos: servir como punto de partida o linea base para experimentos de adaptacion de modelos grandes a lenguas con pocos datos, dado que parte de whisper-large-v3 y es reproducible con transformers.
- Aplicaciones de dictado en comunidades: transcripcion local sin dependencia de servicios en la nube, ya que el checkpoint completo pesa unos 6,2 GB en fp32 y puede ejecutarse en una GPU de consumo o incluso en CPU con conversion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones con otros sistemas para arapaho, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo. El unico dato de evaluacion declarado es la verificacion de transcripcion exacta contra el checkpoint original de ELARSpeech, con estado PASS, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada en fp32 (formato del repositorio, 6,2 GB de pesos): en torno a 8-10 GB de VRAM contando activaciones y cache del decodificador para una ventana de 30 segundos.
- VRAM estimada en fp16/bf16 tras conversion: unos 3,1 GB de pesos, en torno a 5-6 GB de VRAM en inferencia con beam search moderado.
- VRAM estimada en int8 tras cuantizacion externa: alrededor de 1,6-2 GB de pesos, viable por debajo de 4 GB de VRAM.
- GPU recomendadas: NVIDIA A100 o H100 para procesamiento por lotes a gran escala; RTX 3090, RTX 4090 o RTX 4080 para desarrollo; RTX 3060 de 12 GB y tarjetas de 8 GB como la RTX 3070 son suficientes en fp16 o int8.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM usando fp16, y en GPUs de 6 GB con cuantizacion int8.
- CPU: viable para transcripcion no interactiva si se convierte a formatos optimizados para CPU.
- Opciones de despliegue: transformers como via soportada oficialmente por el autor; vLLM admite modelos Whisper para transcripcion; faster-whisper (CTranslate2) y whisper.cpp requieren conversion previa del checkpoint, no documentada en el repositorio; TGI no ofrece soporte de ASR para esta familia; Ollama no esta pensado para modelos Whisper.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de RTF (factor de tiempo real), latencia por segmento ni rendimiento con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-arp | 1,543 M | Arapaho (`arp`) unicamente | 30 s de audio por ventana | no disponible | Verificacion de transcripcion exacta PASS; sin WER publicado |
| openai/whisper-large-v3 | 1.550 M aprox. | Multilingue (cerca de 100 idiomas, sin cobertura especifica documentada de arapaho) | 30 s de audio por ventana | MIT | Modelo base; robusto en idiomas con datos, con cobertura muy limitada en lenguas de bajos recursos |
| facebook/mms-1b-all | 1.000 M aprox. | Mas de 1.000 idiomas gestionados mediante adaptadores por lengua | 30 s de audio por ventana aprox. | CC-BY-NC 4.0 (uso no comercial) | Alternativa disenada para lenguas de bajos recursos, pero con licencia que restringe el uso comercial |
| Modelos wav2vec2/XLS-R ajustados a arapaho | no disponible | Arapaho unicamente | no aplica (ventanas de unos pocos segundos) | no disponible | Existen ajustes comunitarios no verificados; no hay datos comparativos publicos en la informacion disponible |

No hay resultados de WER comparativos para arapaho entre estos sistemas en la informacion disponible, por lo que la eleccion entre ellos no puede justificarse con metricas a dia de hoy.

## Limitaciones y advertencias

- Modelo monolingue: solo arapaho. No debe usarse para transcribir otros idiomas ni como sistema ASR generalista.
- La model card no declara licencia. Aunque el modelo base openai/whisper-large-v3 es MIT, la licencia del fine-tuning y del dataset de ELARSpeech no esta confirmada, lo que supone un riesgo legal para uso comercial o redistribucion.
- No se documenta el dataset de entrenamiento: numero de horas, procedencia de los hablantes, consentimiento, variacion dialectal ni ortografia de referencia. Esto impide evaluar sesgos de hablante, de genero, de edad o de dialecto.
- El autor advierte de que la exactitud puede variar segun las condiciones de grabacion, la poblacion de hablantes, la ortografia y el dominio.
- Riesgo de alucinacion propio de los modelos Whisper: en segmentos con ruido, silencio o habla solapada puede generar texto plausible no presente en el audio, o entrar en bucles de repeticion. En una lengua de bajos recursos y con pocos hablantes, este riesgo es especialmente dificil de detectar sin revisores nativos.
- El ejemplo de uso desactiva las marcas de tiempo (`<|notimestamps|>`); los flujos que necesiten alineacion temporal deberan verificar por separado que el modelo las produce de forma fiable.
- La decodificacion requiere construir manualmente el prompt del decodificador con `<|arp|>`. Usar `language="arapaho"` o el pipeline estandar puede no reproducir el comportamiento esperado del modelo exportado.
- El audio debe ser mono a 16 kHz; no se documenta el comportamiento con otras frecuencias de muestreo, audio estereo o canales con ruido de fondo.
- El repositorio tiene 0 descargas y 0 likes y no ha sido validado por la comunidad. No se publican cifras de WER ni el tamano del conjunto de evaluacion usado en la verificacion PASS.
- No hay informacion sobre longitud maxima de salida fiable: el ejemplo usa `max_new_tokens=200`, lo que limita transcripciones largas si no se segmenta el audio.
- Proyecto de un unico autor y sin documentacion publica del pipeline ELARSpeech, lo que reduce la mantenibilidad y la trazabilidad a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-arp
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Los resultados de busqueda web proporcionados no contienen enlaces tecnicos relevantes (unicamente enlaces de inicio de sesion y registro de TikTok), por lo que no se incluyen referencias adicionales a papers, blogs, repositorios o demos.
