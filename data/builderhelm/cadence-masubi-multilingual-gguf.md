# BuilderHelm/Cadence-Masubi-Multilingual-GGUF

## Resumen

Cadence Masubi Multilingual es un modelo de reconocimiento automático del habla (ASR) para dictado sin conexión, desarrollado por BuilderHelm. Se trata de un ajuste fino (fine-tuning) de NVIDIA Parakeet TDT 0.6B v3 que conserva las 25 lenguas y el tokenizador originales del modelo base. El checkpoint publicado corresponde a la actualización 500 de un entrenamiento de continuación sobre una NVIDIA L4, y se distribuye en dos builds: Core ML (FP16) para Apple Silicon mediante la librería BuilderHelmAudio y GGUF (Q8_0) para el runtime parakeet.cpp con Metal.

La relevancia del modelo reside en su enfoque en inferencia local: con 627 millones de parámetros y un peso de 941 MB en cuantización Q8_0, cabe holgadamente en memoria unificada de equipos Apple y permite dictado multilingüe sin enviar audio a la nube. Emplea la arquitectura Parakeet TDT (Token-and-Duration Transducer), un transductor que predice simultáneamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a un CTC o un transductor clásico.

El modelo cubre 25 lenguas europeas, con un WER medio en FLEURS del 12,55 % en la build GGUF y del 12,61 % en Core ML, medido sobre 2.500 clips retenidos (100 por lengua) en un Apple M5. El rendimiento es muy desigual por idioma: desde el 4,55 % en inglés hasta cifras superiores al 30 % en griego, lo que condiciona su uso en producción según la lengua objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder convolucional + transducer con predictor y joint network |
| Parametros totales | 627.090.582 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el encoder expone funciones de 15 y 30 segundos y el entrenamiento usó un presupuesto de audio de 40 segundos por lote |
| Tipos de cuantizacion | Q8_0 (GGUF); FP16 (Core ML) |
| Idiomas soportados | 25: búlgaro, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, croata, húngaro, italiano, lituano, letón, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco, ucraniano |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (masubi-step500-q8_0.gguf) y Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Parakeet TDT de NVIDIA: un encoder que transforma características log-mel en representaciones latentes, seguido de un predictor y una joint network que emiten de forma conjunta el token y su duración. En la build Core ML el encoder se divide en dos etapas secuenciales (`Encoder` y `EncoderTail`) con funciones de 15 y 30 segundos, y el preprocesador aplica normalización por ventana sobre las características log-mel. La build GGUF empaqueta los pesos del transductor, los metadatos de arquitectura y el tokenizador en un único fichero.

El ajuste fino consistió en una continuación de 500 actualizaciones sobre una NVIDIA L4, entrenando únicamente las cuatro capas superiores del encoder y las redes predictor y joint. Se usó un presupuesto de 40 segundos de audio por lote, 50 pasos de calentamiento y validación sobre el conjunto de desarrollo cada 100 actualizaciones. Posteriormente se realizaron dos experimentos adicionales de 500 actualizaciones con la mezcla de datos original y con una mezcla priorizada por idioma; ambos seleccionaron su checkpoint inicial según el WER de desarrollo con lenguas equiponderadas, por lo que la release publicada es la del modelo original en el paso 500. No se documentan en la información disponible detalles sobre el volumen total de horas de audio, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas con un único modelo y tokenizador.
- Detección automática del idioma a partir del audio, sin necesidad de indicar la lengua de entrada en parakeet.cpp.
- Decodificación TDT con predicción conjunta de token y duración, que reduce los pasos de decodificación frente a esquemas CTC.
- Ejecución totalmente local en Apple Silicon, tanto vía Core ML como vía parakeet.cpp con Metal.
- Procesamiento de audio en ventanas de 15 y 30 segundos en la build Core ML.
- Integración en aplicaciones Swift mediante BuilderHelmAudio, con compilación de los paquetes Core ML en el dispositivo y caché reutilizable.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio generativo: es exclusivamente un modelo ASR.

## Casos de uso

- Dictado offline en macOS: la build Core ML se integra en una app Swift mediante `SpeechRecognizer` de BuilderHelmAudio, compila los paquetes una vez por dispositivo y transcribe ficheros de audio locales sin conexión, lo que encaja en herramientas de productividad con requisitos de privacidad.
- Transcripción de reuniones y notas de voz multilingües: con 25 lenguas y detección automática del idioma, un mismo binario parakeet.cpp puede procesar grabaciones de equipos distribuidos en distintos países sin seleccionar el idioma manualmente.
- Subtitulado por lotes en pipelines de vídeo: la build GGUF de 941 MB permite ejecutar la transcripción en un Mac con Metal y generar ficheros de subtítulos para archivos de audio o vídeo ya extraídos, con un coste de memoria contenido.
- Prototipado rápido de interfaces de voz: al caber en memoria unificada de equipos Apple, un desarrollador puede iterar sobre la UX de dictado sin aprovisionar GPU ni servicios externos.
- Preprocesado de corpus de audio para investigación: el modelo sirve para generar transcripciones preliminares en 25 lenguas que después se revisan manualmente, útil para construir datasets de habla con presupuesto limitado.
- Aplicaciones de accesibilidad: dictado local para usuarios con movilidad reducida en entornos sin conectividad o con políticas estrictas de tratamiento de datos, donde el audio no debe salir del dispositivo.
- Evaluación comparativa de runtimes ASR: al publicarse dos builds del mismo checkpoint (FP16 Core ML y Q8_0 GGUF) con el mismo protocolo de evaluación, permite medir el impacto de la cuantización y del backend en el WER por lengua.

## Benchmarks y rendimiento

Los datos publicados corresponden a WER sobre FLEURS, con 2.500 clips retenidos (100 por lengua), decodificados en un Apple M5 con normalización Unicode, plegado de mayúsculas y el mismo tratamiento de puntuación en ambas builds. La puntuación global pondera cada lengua por igual.

| Idioma | WER Core ML FP16 | WER GGUF Q8_0 |
|---|---:|---:|
| Inglés | 4,60 % | 4,55 % |
| Alemán | 4,63 % | 4,72 % |
| Francés | 5,22 % | 4,93 % |
| Neerlandés | 7,24 % | 7,37 % |
| Checo | 10,48 % | 10,27 % |
| Búlgaro | 11,53 % | 11,28 % |
| Finés | 12,34 % | 11,84 % |
| Croata | 13,78 % | 13,78 % |
| Estonio | 16,98 % | 16,73 % |
| Danés | 18,00 % | 17,77 % |
| Griego | 36,40 % | no disponible en la información proporcionada |
| Global (25 lenguas) | 12,61 % | 12,55 % |

El resto de lenguas (español, italiano, portugués, rumano, ruso, polaco, húngaro, lituano, letón, maltés, eslovaco, esloveno, sueco, ucraniano) no tiene cifra desglosada en la información disponible, aunque están incluidas en el agregado global. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas que no sean ASR.

## Requisitos de hardware

- VRAM/memoria: la build GGUF Q8_0 ocupa 941 MB en disco y la Core ML FP16 1,27 GB; la huella en memoria durante inferencia es del orden de 1-2 GB, aunque no se publica una cifra exacta.
- GPU recomendadas: el modelo se ha evaluado en Apple M5; no hay datos publicados de rendimiento en A100, H100 ni RTX 4090, por lo que su idoneidad en esas GPU no está documentada.
- GPU de consumo: cabe en cualquier Apple Silicon con memoria unificada suficiente; en GPU NVIDIA de consumo no hay soporte documentado más allá de que parakeet.cpp está orientado a Metal.
- Despliegue: Core ML mediante BuilderHelmAudio (Swift) en Apple Silicon; GGUF mediante parakeet.cpp con Metal y la CLI `parakeet-cli transcribe --decoder tdt`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo ASR.
- Latencia y throughput: no disponibles en la información proporcionada; solo se indica que ambas builds se evaluaron en un Apple M5.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER FLEURS | Licencia | Formato |
|---|---|---:|---:|---|---|
| Cadence Masubi Multilingual (GGUF Q8_0) | 627 M | 25 | 12,55 % global | CC BY 4.0 | GGUF, Core ML |
| Cadence Masubi Multilingual (Core ML FP16) | 627 M | 25 | 12,61 % global | CC BY 4.0 | Core ML |
| NVIDIA Parakeet TDT 0.6B v3 (base) | 0,6 B | 25 | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors |
| Cadence Sae EN (misma familia, enfoque inglés) | no disponible | inglés | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible |

La comparación con alternativas fuera de la familia Cadence o Parakeet no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento es muy desigual por lengua: el griego supera el 36 % de WER en Core ML y el danés el 18 %, frente al 4-5 % del inglés, el alemán y el francés. No es adecuado para producción en las lenguas con WER alto sin evaluación propia.
- Solo se han publicado métricas sobre FLEURS, un corpus de lectura; el comportamiento en habla espontánea, acentos regionales, ruido de fondo o audio telefónico no está documentado.
- El modelo es exclusivamente ASR: no genera texto libre, no razona y no soporta tool calling ni agentes; cualquier uso conversacional requiere un LLM adicional.
- Al ser un fine-tuning del paso 500, puede heredar sesgos y errores del modelo base NVIDIA Parakeet TDT 0.6B v3, cuyos detalles de dataset no se recogen en la información disponible.
- Riesgo de alucinación en el sentido ASR: posibles inserciones o borrados en segmentos con silencio, ruido o solapamiento de hablantes; no se documentan mecanismos de mitigación.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base NVIDIA antes de redistribuir derivados.
- El soporte de runtime está limitado a Apple Silicon (Core ML y parakeet.cpp con Metal); no hay builds documentadas para CUDA, ROCm ni CPU genérica.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las cifras publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Cadence-Masubi-Multilingual-GGUF
- Build Core ML: https://huggingface.co/BuilderHelm/Cadence-Masubi-Multilingual-CoreML
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo hermano en inglés: https://huggingface.co/BuilderHelm/Cadence-Sae-EN
- Organización en Hugging Face: https://huggingface.co/BuilderHelm
- Repositorio BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Runtime parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Web de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
