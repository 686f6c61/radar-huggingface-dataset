# Sanghyang00/ELARSpeech-Whisper-Large-v3-bfn

## Resumen

ELARSpeech-Whisper-Large-v3-bfn es un modelo de reconocimiento automatico del habla (ASR) obtenido por ajuste fino de openai/whisper-large-v3 sobre la lengua Bunak (codigo ISO 639-3: bfn), una lengua papu hablada en la isla de Timor. Lo publica el usuario Sanghyang00 dentro del proyecto ELARSpeech, una iniciativa centrada en tecnologias de voz para lenguas con pocos recursos. El modelo resuelve la transcripcion de audio a texto exclusivamente en Bunak, un idioma practicamente ausente en los corpus de los modelos ASR multilingues convencionales.

Tecnicamente es un transformer encoder-decoder de tipo Whisper, con 1.543.491.840 parametros reales confirmados en los pesos safetensors (aproximadamente 1,54 mil millones), distribuidos en la configuracion large-v3. La arquitectura procesa audio convertido a un espectrograma Mel de 128 bandas y ventanas de 30 segundos, y admite audio de formato largo mediante decodificacion secuencial o por fragmentos. El repositorio ocupa 6,2 GB y se distribuye en formato safetensors para la libreria transformers.

La relevancia de esta ficha es doble: por un lado, documenta un recurso practico para una lengua de muy bajos recursos; por otro, sirve como ejemplo del patron ELARSpeech, que busca cubrir cientos de lenguas infrarrepresentadas. El modelo es mono-idioma, no declara licencia en la informacion disponible y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (procesamiento por fragmentos para audio largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bunak (codigo ISO 639-3: bfn); modelo mono-idioma |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos: tamano del repositorio 6,2 GB; pipeline declarado automatic-speech-recognition; modelo base openai/whisper-large-v3; etiquetas endpoints_compatible.

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3 y conserva su arquitectura completa: un encoder que transforma el espectrograma Mel de entrada (128 bandas, frente a las 80 de large-v2) en representaciones latentes, y un decoder autorregresivo que genera los tokens de texto. Este diseno es un transformer clasico de tipo encoder-decoder con atencion, entrenado originalmente por OpenAI sobre un corpus debilmente supervisado y multilingue muy amplio. En esta variante, el ajuste fino se ha realizado especificamente para la lengua Bunak, segun indica el proyecto ELARSpeech.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion aparece como no disponible en los datos proporcionados. El contexto del proyecto ELARSpeech (un conjunto de aproximadamente 30.000 horas repartidas entre 675 lenguas poco representadas) sugiere que el ajuste se apoya en ese corpus, pero la ficha del modelo no confirma cifras concretas. Como innovacion operativa, la model card subraya que la decodificacion debe forzarse mediante un prompt explicito en el decoder con el token de idioma `<|bfn|>`, en lugar del parametro `language=`, para reproducir el comportamiento del modelo exportado. Tambien se indica que el artefacto exportado se verifica contra el checkpoint ELARSpeech original sobre un conjunto fijo de evaluacion, con estado de verificacion de transcripcion exacta PASS.

## Capacidades

- Reconocimiento automatico del habla (ASR) en lengua Bunak, transcribiendo audio a texto.
- Procesamiento de audio mono a 16 kHz (requisito explicito de entrada).
- Manejo de audio de formato largo mediante decodificacion secuencial o por fragmentos de 30 segundos.
- Decodificacion con haz configurable (la model card usa `num_beams=1`).
- Control explicito del idioma y del modo de tarea mediante tokens especiales del decoder (`<|bfn|>`, `<|transcribe|>`, `<|notimestamps|>`).
- No dispone de soporte declarado de tool calling, function calling, agentes o razonamiento multi-paso; es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito mas alla de la transcripcion.
- Capacidad multilingue: no; es un modelo de un solo idioma.

## Casos de uso

- Transcripcion de grabaciones de campo linguistico: investigadores que documentan Bunak pueden pasar entrevistas o narraciones en audio mono a 16 kHz y obtener transcripciones automaticas como borrador para revision manual.
- Subtitulado de material audiovisual en Bunak: el modelo genera texto a partir de la pista de audio y facilita la creacion de subtitulos para videos comunitarios o educativos.
- Preservacion digital de patrimonio oral: conversion de archivos de historia oral, canciones o relatos tradicionales a texto indexable y buscable.
- Investigacion linguistica de bajos recursos: generacion de transcripciones preliminares para construir corpus anotados y estudiar fonetica, morfologia o lexico del Bunak.
- Herramientas de accesibilidad en la comunidad: dictado o transcripcion en tiempo cuasi real para hablantes de Bunak en entornos donde no existe ASR comercial para su lengua.
- Evaluacion comparativa de ASR de cola larga: servir como referencia mono-idioma dentro del proyecto ELARSpeech para medir el rendimiento del ajuste fino frente al modelo base en lenguas infrarrepresentadas.
- Integracion en pipelines de transformers: dado que se carga con `WhisperForConditionalGeneration` y `WhisperProcessor` y es compatible con endpoints, puede desplegarse como servicio de transcripcion dentro de una infraestructura existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de evaluacion en la model card es cualitativa: el artefacto exportado se comprueba contra el checkpoint ELARSpeech original sobre un conjunto fijo de muestras, con estado de transcripcion exacta verificado como PASS. No se aportan cifras de WER, CER ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos en precision completa ocupan aproximadamente 6,2 GB (tamano del repositorio); en FP16 el modelo ronda los 3,1 GB de pesos, por lo que la inferencia en FP16 requiere varios gigabytes de VRAM adicionales para activaciones y buffers de atencion. Las cifras exactas de VRAM y de cuantizacion no estan disponibles en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo encaja en GPUs de gama alta de consumo y en aceleradores de datacenter. Opciones habituales para modelos de este tamano serian RTX 3090/4090 (24 GB), A100 o H100; ninguna de ellas viene recomendada explicitamente en la documentacion disponible.
- Encaje en GPU de consumo: es plausible en GPUs con 8-16 GB o mas de VRAM en FP16, dado el tamano de pesos de aproximadamente 3,1 GB y el consumo adicional de memoria; el autor no confirma requisitos minimos.
- Opciones de despliegue: transformers (`WhisperForConditionalGeneration` + `WhisperProcessor`); la etiqueta endpoints_compatible sugiere compatibilidad con despliegue gestionado. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-bfn | 1,54 B | ventanas de 30 s | Bunak (bfn) | no disponible | Hugging Face |
| openai/whisper-large-v3 | 1,55 B | ventanas de 30 s | multilingue (amplio) | openai/whisper (según repositorio) | Hugging Face / repositorio |
| openai/whisper large-v3 turbo | no disponible | ventanas de 30 s | multilingue | openai/whisper (según repositorio) | Hugging Face / repositorio |

Comparado con openai/whisper-large-v3, del que deriva, la diferencia principal es la especializacion: el modelo ajustado cubre Bunak, una lengua que el modelo base trata de forma marginal, mientras que el modelo base ofrece cobertura multilingue amplia pero con rendimiento variable segun el idioma. No se dispone de datos numericos de rendimiento para establecer una comparacion cuantitativa. No se han identificado otros modelos comparables especificos para Bunak en la informacion disponible.

## Limitaciones y advertencias

- Modelo mono-idioma: no debe esperarse transcripcion correcta en lenguas distintas del Bunak.
- La exactitud puede variar segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio del audio.
- Es obligatorio remuestrear la entrada a 16 kHz mono; otros formatos pueden degradar o invalidar los resultados.
- Riesgo de alucinacion inherente a los modelos ASR generativos, especialmente con audio ruidoso, silencios largos o habla solapada.
- La decodificacion debe realizarse con el prompt explicito del decoder (token `<|bfn|>`, tarea de transcripcion y sin marcas de tiempo) para reproducir el comportamiento del modelo exportado; usar `language=` puede dar resultados distintos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. La model card remite a la documentacion del proyecto ELARSpeech para los terminos del dataset y al repositorio del modelo base para su licencia y condiciones.
- Sin datos publicos de benchmarks, WER ni evaluacion independiente; el unico aval es la verificacion interna PASS declarada por el autor.
- Sin descargas ni interacciones registradas en el momento de la consulta, por lo que no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-bfn
- Repositorio ELARSpeech en GitHub: https://github.com/sanghyang00/elarspeech
- Modelo base openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Ficha de Whisper large-v3 en Vast.ai: https://vast.ai/model/whisper
