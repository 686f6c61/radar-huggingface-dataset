# sayzly/parakeet-tdt_ctc-110m-gguf

## Resumen

Parakeet TDT-CTC 110M (GGUF) es una conversion al formato GGUF del modelo de reconocimiento automatico del habito (ASR) `nvidia/parakeet-tdt_ctc-110m`, publicado por el usuario `sayzly` en Hugging Face. El modelo original lo desarrolla NVIDIA dentro de la familia Parakeet, orientada a transcripcion de voz en ingles con arquitectura FastConformer y decodificacion conjunta TDT (Token-and-Duration Transducer) y CTC. Esta version GGUF tiene como objetivo facilitar el despliegue en entornos de inferencia ligeros, como llama.cpp y derivados, sin necesidad de stack CUDA ni de frameworks Python pesados.

El modelo cuenta con 114.113.670 parametros totales (aproximadamente 110 millones, de ahi el sufijo del nombre) y un repositorio de tan solo 0,1 GB, lo que lo convierte en una opcion muy ligera para tareas de transcripcion en tiempo real o en dispositivos con recursos limitados. La unica cuantizacion publicada explicitamente en la model card es Q8_0, aunque el nombre del repositorio sugiere que puedan existir otras variantes; no se dispone de informacion adicional al respecto.

La relevancia de esta ficha radica en que se trata de una conversao comunitaria de un modelo ASR de NVIDIA, con licencia CC BY 4.0 y sin modificacion de pesos mas alla del cambio de formato. Es util para desarrolladores que quieran integrar un ASR compacto en pipelines locales, pero conviene tener en cuenta que la model card es extremadamente escueta y no aporta datos sobre rendimiento, idiomas ni procedimiento de conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT + CTC (heredada del modelo base NVIDIA Parakeet) |
| Parametros totales | 114.113.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica mencionada en la model card) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base `nvidia/parakeet-tdt_ctc-110m`, que emplea FastConformer, una variante eficiente del Conformer con atencion de profundidad y subsampling agresivo, pensada para reducir el coste computacional en tareas de speech-to-text. La cabeza de decodificacion combina TDT (Token-and-Duration Transducer), que predice simultaneamente tokens y duraciones, con CTC, lo que permite elegir entre decodificacion no autorregresiva rapida (CTC) y decodificacion transducer mas precisa (TDT).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado mas alla de lo que publique NVIDIA en la model card original. Esta version GGUF, segun el autor, solo cambia el formato de los pesos y no modifica su contenido, por lo que las caracteristicas de entrenamiento son identicas a las del modelo base. Tampoco se documenta el procedimiento exacto de conversion ni las herramientas empleadas.

## Capacidades

- Reconocimiento automatico del habla (ASR) en formato speech-to-text.
- Decodificacion dual: TDT (transducer) y CTC, heredadas del modelo base.
- Inferencia en formato GGUF, apta para motores compatibles con este formato.
- Modelo compacto (110M parametros), adecuado para ejecucion en CPU y dispositivos con recursos limitados.
- No se documentan capacidades multilingues; la model card no especifica idiomas.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo thinking, vision ni audio mas alla de la entrada de voz para transcripcion.

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede ejecutarse en un portatil con llama.cpp y transcribir audio grabado sin enviar datos a servicios en la nube, gracias a su tamano reducido (110M parametros).
- Subtitulado de video en tiempo casi real: con decodificacion CTC no autorregresiva, es posible generar subtitulos por fragmentos con baja latencia en hardware modesto.
- Dictado por voz en aplicaciones de escritorio: integrable como backend ASR en herramientas de productividad que requieran un modelo ligero y con licencia permisiva.
- Transcripcion de notas de voz en dispositivos edge: al caber en repositorios de 0,1 GB y en formato GGUF, puede desplegarse en Raspberry Pi o mini-PC sin GPU.
- Preprocesado de audio para pipelines de NLP: convertir entrevistas o llamadas en texto antes de pasarlo a un LLM local, usando el modelo como etapa ASR barata.
- Prototipado de sistemas de accesibilidad: transcripcion en vivo para personas con discapacidad auditiva en entornos con conectividad limitada.
- Evaluacion comparativa de motores GGUF: util como caso de prueba para validar soporte ASR en implementaciones de llama.cpp u otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de WER, latencia ni throughput, y no se dispone de datos del modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q8_0 (114M parametros a 8 bits equivalen aproximadamente a 114 MB de pesos, mas overhead de runtime).
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo esta pensado principalmente para CPU. GPU dedicadas como RTX 4090, A100 o H100 no aportan ventajas significativas frente a CPU para este tamano.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU integrada, y tambien en CPU sin GPU.
- Opciones de despliegue: llama.cpp y frontends compatibles con GGUF (por ejemplo, Ollama o servidores derivados), siempre que el runtime concreto soporte la arquitectura FastConformer/TDT-CTC. No se confirma compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sayzly/parakeet-tdt_ctc-110m-gguf | 114.113.670 | no disponible | no disponible | cc-by-4.0 | GGUF |
| nvidia/parakeet-tdt_ctc-110m (base) | ~110M | no disponible | no disponible | cc-by-4.0 | safetensors / NeMo |
| Whisper small (referencia de categoria) | ~244M | 30 s de audio | multilingue | MIT | safetensors, GGUF (comunitario) |
| Whisper tiny (referencia de categoria) | ~39M | 30 s de audio | multilingue | MIT | safetensors, GGUF (comunitario) |

La comparativa con Whisper se incluye como referencia de categoria ASR compacta; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta idiomas, rendimiento, ni proceso de conversion, lo que dificulta evaluar su calidad real.
- Al ser una conversion comunitaria sin validacion publicada, existe riesgo de errores de conversion o de incompatibilidad con algunos runtimes GGUF.
- No se dispone de informacion sobre sesgos; al heredar del modelo base de NVIDIA, podria reproducir sesgos acusticos o dialectales del dataset original.
- Riesgo de alucinacion en transcripciones: los modelos ASR pueden generar texto plausible en segmentos de audio ruidoso o silencioso.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion a los autores originales (NVIDIA y, en su caso, el conversor).
- Sin datos sobre longitud de contexto de audio ni sobre manejo de audio largo; conviene validar en el runtime concreto antes de usarlo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso ni de calidad.
- No se confirma soporte en vLLM, TGI ni Ollama; la disponibilidad practica depende del runtime GGUF elegido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/parakeet-tdt_ctc-110m-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Perfil del autor: https://huggingface.co/sayzly
