# gopalanj/maya-voice-agent

## Resumen

Maya voice agent es un conjunto de adaptadores LoRA publicados por el usuario gopalanj que convierten el modelo multimodal MiniCPM-o 4.5 (desarrollado por OpenBMB) en un agente de voz telefonico orientado a negocios, capaz de invocar herramientas durante la conversacion. El adaptador modifica unicamente el modelo de lenguaje interno (Qwen3-8B), mientras que el codificador de audio, su proyector y el decodificador de voz permanecen congelados. El resultado es un sistema speech-to-speech que consulta informacion, reserva y cancela operaciones tras leer los detalles al usuario, y deriva emergencias a una persona.

El modelo se distribuye como dos carpetas de adaptadores (`round1/` y `round2/`) entrenadas con ms-swift sobre 3.536 y 8.807 conversaciones habladas sinteticas respectivamente. La arquitectura subyacente es la de MiniCPM-o 4.5, un modelo multimodal que integra percepcion de audio y generacion de habla junto al razonamiento textual; sobre esa base, el LoRA de rango 16 y alpha 32 se aplica a todas las capas lineales del LLM, anadiendo 43,6 millones de parametros entrenables.

Su relevancia actual reside en que demuestra una via de bajo coste (un adaptador de 0,3 GB) para especializar un modelo speech-to-speech open source en tareas de atencion telefonica con tool calling, un caso de uso poco cubierto por los adaptadores publicos. No obstante, el propio autor lo califica de prototipo de investigacion: las herramientas son simuladas, los negocios ficticios y los modelos no han pasado por un ajuste de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniCPM-o 4.5 (modelo multimodal speech-to-speech; LLM interno Qwen3-8B) |
| Parametros totales | 43,6 M parametros entrenables en el adaptador (el modelo base MiniCPM-o 4.5 no se especifica en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona exportacion a GGUF para llama.cpp-omni) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); GGUF mediante exportacion |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente al modelo de lenguaje de MiniCPM-o 4.5, un transformer multimodal que combina un encoder de audio, un proyector y un decoder de habla con un LLM textual (Qwen3-8B). El LoRA tiene rango 16 y alpha 32, se inserta en todas las capas lineales del LLM y suma 43,6 millones de parametros entrenables; el resto del pipeline (audio y voz) queda intacto, de modo que el sistema conserva las capacidades speech-to-speech del modelo base.

El entrenamiento se realizo con ms-swift durante dos epocas en dos rondas. La primera uso 3.536 conversaciones habladas sinteticas (agente de viajes mas preguntas generales) durante 442 pasos. La segunda amplio a 8.807 conversaciones, incorporando nuevas ciudades, un caso de recepcionista de clinica y datos genericos de uso de herramientas procedentes de ToolACE y When2Call, durante 1.100 pasos. Los datos de entrenamiento son voz sintetica y las herramientas invocadas son simulaciones; no se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de voz extremo a extremo (speech-to-speech) heredada de MiniCPM-o 4.5, con encoder de audio y decoder de habla sin modificar.
- Tool calling durante la conversacion: consulta de informacion, reservas y cancelaciones, con lectura previa de los detalles al usuario antes de confirmar.
- Gestion de flujos multi-turno orientados a tareas (agente de viajes, recepcionista de clinica, centro de servicio de automocion).
- Enrutado de emergencias: el agente deriva a una persona cuando detecta una situacion critica.
- Uso generico de herramientas, reforzado con datos de ToolACE y When2Call en la segunda ronda.
- Capacidades multimodales del modelo base (vision y audio) potencialmente disponibles, aunque el adaptador solo se entrena sobre el LLM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Recepcion telefonica de clinicas: el adaptador de la ronda 2 se entreno especificamente con un caso de recepcionista de clinica, de modo que puede gestionar citas, consultas de disponibilidad y derivacion a personal humano en conversaciones habladas multi-turno.
- Agencia de viajes por telefono: las rondas 1 y 2 incluyen un agente de viajes con busqueda de ciudades y reservas; el modelo consulta la herramienta, lee los detalles al cliente y solo confirma tras la validacion.
- Centro de servicio de automocion: el modelo muestra una tasa de acierto en turnos de herramienta del 79 % en este dominio nunca visto durante el entrenamiento, lo que lo hace util para prototipos de gestion de citas de taller.
- Cancelacion y modificacion de reservas: el flujo entrenado exige releer los detalles antes de ejecutar la accion, un patron adecuado para tareas transaccionales donde la confirmacion explicita reduce errores.
- Enrutado de emergencias en centralitas: el agente puede transferir a un operador humano cuando la peticion entra en categoria critica, como capa de triaje previa a la atencion personal.
- Investigacion en agentes de voz con tool calling: al publicarse el codigo, el generador de datos y los conjuntos de prueba con audio, sirve como banco de pruebas reproducible para estudiar la especializacion de modelos speech-to-speech mediante LoRA.
- Prototipado rapido de asistentes telefonicos sectoriales: al ser un adaptador de 0,3 GB sobre un modelo base abierto, permite iterar sobre nuevos dominios con coste de entrenamiento bajo.

## Benchmarks y rendimiento

Los unicos datos publicados miden el porcentaje de turnos con invocacion de herramienta exacta:

| Conjunto de prueba | Base | Round 1 | Round 2 |
|---|---|---|---|
| Test ronda 1 (negocios vistos) | 35 % | 88 % | 88 % |
| Test ronda 2 (ciudades y clinicas no vistas) | 25 % | 35 % | 67 % |
| Centro de servicio de automocion (nunca entrenado) | 25 % | 53 % | 79 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; depende del modelo base MiniCPM-o 4.5 completo, ya que el adaptador debe fusionarse o cargarse junto a el.
- El adaptador en si ocupa 0,3 GB en el repositorio, por lo que el coste de almacenamiento es minimo frente al modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; condicionada por los requisitos del modelo base multimodal.
- Opciones de despliegue: fusion con ms-swift (`swift export --adapters round2 --merge_lora true`) o el script `train/export.sh` del repositorio, que ademas genera el GGUF para el motor llama.cpp-omni parcheado que usa el paper.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (adaptadores LoRA para agentes de voz con tool calling sobre modelos speech-to-speech).

## Limitaciones y advertencias

- Prototipo de investigacion: las herramientas son simuladas y los negocios ficticios; no esta pensado para uso en produccion real.
- Los llamadores del entrenamiento son voz sintetica, lo que puede provocar una brecha de dominio frente a habla real (acentos, ruido, solapamientos).
- No ha recibido ajuste de seguridad: el autor advierte que los modelos invocan herramientas ante algunas peticiones daninas.
- No debe usarse para emergencias reales; el enrutado a personas es parte del diseno, pero no sustituye a servicios de emergencia.
- Rendimiento limitado fuera de los dominios entrenados: la tasa de acierto cae al 67 % en ciudades y clinicas no vistas y al 79 % en el centro de servicio de automocion.
- Solo se adapta el LLM; las capacidades de audio y voz son las del modelo base y no se han especializado.
- Idiomas soportados no documentados; la cobertura linguistica del adaptador es incierta.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial debe verificar tambien la licencia del modelo base MiniCPM-o 4.5.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gopalanj/maya-voice-agent
- Modelo base MiniCPM-o 4.5: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Repositorio de codigo, generador y conversaciones: https://github.com/gopalanj/maya-voice-agent
- Conjuntos de prueba con audio: https://huggingface.co/datasets/gopalanj/maya-voice-agent-tests
- Paper: pendiente de publicacion segun la model card (no disponible)
