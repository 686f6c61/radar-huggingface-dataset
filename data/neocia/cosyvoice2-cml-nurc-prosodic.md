# neocia/cosyvoice2-cml-nurc-prosodic

## Resumen

CosyVoice2-CML-NURC-Prosodic es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario neocia, especializado en portugués brasileño con acento paulistano. Se trata de un fine-tuning del modelo base FunAudioLLM/CosyVoice2-0.5B, entrenado en dos etapas: primero una adaptación de dominio sobre el dataset CML-TTS (subset portugués, audiolibros a 24 kHz) y posteriormente un fine-tuning sobre el dataset NURC-SP ENTOA TTS en su configuración `prosodic`, que segmenta el habla por fronteras prosódicas.

El modelo destaca por su enfoque en habla espontánea, un dominio tradicionalmente difícil para los sistemas TTS, que suelen entrenarse con habla leída y controlada. La segmentación prosódica del dataset NURC-SP permite al modelo capturar mejor los patrones entonativos naturales del habla conversacional. Su relevancia radica en ser un recurso open source (licencia Apache 2.0) para generar voz portuguesa brasileña con naturalidad prosódica, comparable a su modelo hermano `cosyvoice2-cml-nurc-automatic`, que usa segmentación automática con WhisperX en lugar de segmentación prosódica.

El repositorio ocupa 67.8 GB e incluye pesos en formato safetensors y ONNX. El modelo base CosyVoice2-0.5B es un sistema de generación de voz multilingüe de 500 millones de parámetros desarrollado por FunAudioLLM (Alibaba), que combina un transformer autoregresivo para generar tokens de habla, un modelo de difusión basado en ODE (flow matching) para reconstruir el espectrograma Mel, y un vocoder HiFTGAN para sintetizar la forma de onda final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice2 (LLM autoregresivo + Flow Matching + vocoder HiFTGAN) |
| Parametros totales | 0.5B (base, fine-tuning no especifica cambios) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto textual largo) |
| Tipos de cuantizacion | safetensors (fp32/fp16), ONNX |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de CosyVoice2-0.5B, cuya arquitectura se compone de tres módulos principales: un transformer autoregresivo que genera tokens de habla supervisados a partir del texto de entrada, un modelo de difusión basado en flow matching que reconstruye el espectrograma Mel desde los tokens generados, y un vocoder HiFTGAN que sintetiza la forma de onda final. Esta arquitectura permite alta naturalidad prosódica y consistencia de contenido.

El entrenamiento se realizó en dos etapas de fine-tuning. La primera etapa consistió en una adaptación de dominio sobre el dataset CML-TTS en su subset portugués, compuesto por audiolibros a 24 kHz. En esta etapa se fine-tuneó el submódulo `llm` (el transformer autoregresivo) a partir del checkpoint original. La segunda etapa aplicó fine-tuning sobre el dataset NURC-SP ENTOA TTS en su configuración `prosodic`, que segmenta el habla por fronteras prosódicas en lugar de usar segmentación automática. Para el submódulo `llm`, se partió del checkpoint obtenido en la etapa CML, seleccionando el mejor checkpoint por pérdida de validación. Para el submódulo `flow` (el modelo de difusión), se entrenaron 30 épocas a partir del checkpoint preentrenado original, sin pasar por la etapa CML, seleccionando también el mejor checkpoint.

Esta estrategia de entrenamiento en dos fases permite al modelo capturar primero las características acústicas generales del portugués hablado y después adaptarse a las particularidades prosódicas del habla espontánea paulistana, un enfoque metodológico interesante para TTS en dominios de habla conversacional.

## Capacidades

- Sintesis de voz en portugues de Brasil con acento paulistano (habla espontanea)
- Generacion de habla con segmentacion prosodica natural, capturando patrones entonativos del habla conversacional
- Clonacion de voz y control de timbre (capacidad heredada de CosyVoice2)
- Generacion de voz multilingue limitada al portugues brasileno tras el fine-tuning
- Inferencia bilingue texto-habla con control de prosodia y emocion (capacidad base de CosyVoice2)
- Soporte de cero-shot voice cloning mediante prompt de audio de referencia

## Casos de uso

- Audiolibros y narracion: el modelo puede generar voz natural para narracion de textos largos en portugues brasileno, aprovechando la adaptacion de dominio sobre audiolibros del dataset CML-TTS. Su capacidad para mantener consistencia prosodica en habla extendida lo hace adecuado para produccion editorial.

- Asistentes de voz conversacionales: la especializacion en habla espontanea del NURC-SP lo hace especialmente util para asistentes virtuales que necesitan sonar naturales en conversaciones informales con usuarios brasilenos. La segmentacion prosodica permite generar pausas y entonacion realistas en dialogos multi-turno.

- Doblaje y localizacion de contenido: para localizar contenido audiovisual al portugues de Brasil con acento paulistano, el modelo puede generar voces con naturalidad conversacional, adecuado para escenas dialogadas donde la prosodia espontanea es critica.

- Herramientas de accesibilidad: lectores de pantalla y sistemas de lectura asistida para personas con discapacidad visual pueden beneficiarse de una voz mas natural y menos robótica, mejorando la experiencia de usuario en portugues.

- Investigacion en prosodia y linguistica computacional: el modelo puede usarse como herramienta para estudiar la segmentacion prosodica del portugues brasileno, generando habla sintetica con diferentes patrones entonativos para experimentos de percepcion.

- Sistemas de respuesta de voz interactiva (IVR): centralitas telefonicas automatizadas que requieran interacciones naturales con hablantes de portugues de Brasil, especialmente en contextos donde el habla espontanea es mas apropiada que la lectura formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparaciones cuantitativas con otros sistemas TTS para portugues.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base CosyVoice2-0.5B requiere aproximadamente 2-4 GB de VRAM en fp16 para inferencia.
- GPU recomendadas: no especificadas. Para el modelo base se recomiendan GPUs con al menos 8 GB de VRAM (RTX 3060/4060 o superior). Para entrenamiento o fine-tuning se necesitarian GPUs con 24 GB o mas.
- Compatibilidad con GPU de consumo: si, el modelo de 0.5B parametros cabe en GPUs consumer modernas con cuantizacion.
- Opciones de despliegue: el repositorio de CosyVoice ofrece inferencia, entrenamiento y despliegue full-stack. Se puede usar con el codigo oficial de CosyVoice disponible en GitHub.
- Formato ONNX disponible para despliegue en entornos sin GPU o con aceleracion especifica.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Enfoque | Licencia |
|---|---|---|---|---|
| neocia/cosyvoice2-cml-nurc-prosodic | 0.5B | pt-BR (paulistano) | Habla espontanea, segmentacion prosodica | Apache 2.0 |
| neocia/cosyvoice2-cml-nurc-automatic | 0.5B | pt-BR (paulistano) | Habla espontanea, segmentacion automatica WhisperX | Apache 2.0 |
| FunAudioLLM/CosyVoice2-0.5B | 0.5B | Multilingue | TTS general, cero-shot voice cloning | Apache 2.0 |

La comparativa entre los dos modelos de neocia es especialmente relevante: ambos parten de la misma receta de entrenamiento (CML-TTS + NURC-SP) pero difieren en la estrategia de segmentacion de datos. El modelo `prosodic` usa segmentacion por fronteras prosodicas, mientras que el `automatic` usa segmentacion automatica con WhisperX. Esta comparacion permite evaluar que estrategia de segmentacion produce mejores resultados para TTS de habla espontanea.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en portugues de Brasil con acento paulistano; no soporta otros idiomas ni variantes dialectales del portugues tras el fine-tuning.
- La especializacion en habla espontanea puede degradar el rendimiento en lectura formal o textos muy estructurados.
- No se han publicado evaluaciones objetivas de calidad (MOS, WER) ni comparaciones con otros sistemas TTS comerciales.
- El dataset NURC-SP se basa en grabaciones de hablantes de Sao Paulo; puede haber sesgos dialectales y demograficos en la voz generada.
- Tamano del repositorio (67.8 GB) considerable, requiere planificacion de almacenamiento y ancho de banda para descarga.
- No se proporciona informacion sobre latencia de inferencia ni requisitos minimos de hardware especificos para este fine-tuning.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar las condiciones de los datasets de entrenamiento (CML-TTS y NURC-SP) para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neocia/cosyvoice2-cml-nurc-prosodic
- Modelo hermano (automatic): https://huggingface.co/neocia/cosyvoice2-cml-nurc-automatic
- Modelo base: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Repositorio CosyVoice (GitHub): https://github.com/Render-AI-Team/CosyVoice2
- Repositorio alternativo CosyVoice (GitHub): https://github.com/MagnoliaLex/cosyvoice
- Pagina oficial CosyVoice: https://cosyvoice.github.io/
- Pagina oficial CosyVoice 2.0: https://fun-audio-llm.github.io/cosyvoice2/
- Dataset CML-TTS: https://huggingface.co/datasets/ylacombe/cml-tts
- Dataset NURC-SP ENTOA TTS: https://huggingface.co/datasets/nilc-nlp/NURC-SP_ENTOA_TTS
