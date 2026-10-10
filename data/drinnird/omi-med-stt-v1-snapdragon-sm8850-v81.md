# drinnird/omi-med-stt-v1-snapdragon-sm8850-v81

## Resumen

El modelo `drinnird/omi-med-stt-v1-snapdragon-sm8850-v81` es una variante de despliegue del sistema de reconocimiento automatico del habla (ASR) Omi Med STT v1, publicado por Omi Health y derivado de NVIDIA Parakeet TDT 0.6B v2. Se trata de un modelo especializado en transcripcion de voz medica en ingles, disenado para ejecutarse localmente en el dispositivo (on-device) sin enviar audio a la nube. El sufijo `snapdragon-sm8850-v81` indica que este artefacto concreto esta orientado a la plataforma Qualcomm Snapdragon SM8850 (Snapdragon 8 Elite), si bien la model card del repositorio no aporta ningun detalle tecnico adicional.

El modelo base, Omi Med STT v1, tiene aproximadamente 0,6 mil millones de parametros (600 M) y esta construido sobre la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA Parakeet, adaptada al dominio clinico. Omi Health publica comparativas de WER (Word Error Rate) general, WER medico, velocidad y facilidad de instalacion frente a alternativas, pero los valores numericos no forman parte de la informacion disponible en esta ficha.

La relevancia de esta publicacion radica en dos factores: por un lado, la especializacion en vocabulario medico, que es uno de los puntos donde los ASR genericos fallan con mas frecuencia; por otro, el enfoque on-device, que permite su uso en entornos clinicos con requisitos estrictos de privacidad y cumplimiento (por ejemplo, HIPAA o RGPD) al no requerir transmision de audio a servidores externos. La ficha del repositorio de `drinnird` no incluye pipeline declarado, idiomas listados ni documentacion adicional mas alla de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) heredada de NVIDIA Parakeet TDT 0.6B v2; artefacto de despliegue especifico para Snapdragon SM8850 |
| Parametros totales | Aproximadamente 0,6 B (600 M), segun el modelo base Omi Med STT v1 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; tamano de ventana de audio no especificado) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (dominio medico), segun la documentacion de Omi Med STT v1 |
| Licencia | cc-by-4.0 |
| Formato de pesos | No disponible (el sufijo `snapdragon-sm8850-v81` sugiere un artefacto compilado o exportado especificamente para Qualcomm SM8850) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Parakeet TDT 0.6B v2: un sistema ASR con decodificador de tipo transductor de tokens y duracion (TDT), que predice conjuntamente el token de salida y su duracion temporal. Este diseno permite decodificacion no autorregresiva por tramos y reduce la latencia frente a esquemas puramente atencionales token a token. Omi Health parte de ese checkpoint y lo reentrena o adapta sobre datos de dominio medico para producir Omi Med STT v1.

La informacion proporcionada no especifica el numero de horas de audio utilizadas, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o destilacion. Tampoco se detalla si el artefacto subido por `drinnird` incluye modificaciones adicionales mas alla del empaquetado para Snapdragon SM8850. La model card del repositorio se limita a declarar la licencia `cc-by-4.0` y no incluye ningun apartado de entrenamiento, evaluacion o uso previsto.

## Capacidades

- Transcripcion de voz a texto en ingles con vocabulario y terminologia medica.
- Ejecucion local on-device: el runtime oficial de Omi admite Apple Silicon, NVIDIA CUDA y CPU; esta variante esta etiquetada para Qualcomm Snapdragon SM8850.
- Decodificacion de audio a texto en una sola pasada (no es un modelo generativo de texto).
- No dispone de soporte de tool calling ni de function calling (no es un LLM).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue: no; segun la documentacion del modelo base, esta limitado al ingles.
- Sin capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Dictado clinico on-device: el modelo permite transcribir la voz del facultativo directamente en el dispositivo donde se ejecuta, lo que evita enviar audio con datos de pacientes a infraestructura externa y simplifica el cumplimiento normativo.
- Generacion de notas de consulta en movil: una aplicacion Android sobre Snapdragon SM8850 puede capturar la conversacion medico-paciente y producir un borrador de nota clinica sin conexion, util en consultas rurales o con conectividad limitada.
- Triaje telefonico automatizado: transcripcion en tiempo real de llamadas entrantes para extraer sintomas y priorizar casos, con el vocabulario medico como ventaja frente a ASR genericos.
- Subtitulado de consultas y telemedicina: generacion de subtitulos en vivo durante videoconsultas, mejorando la accesibilidad para pacientes con discapacidad auditiva.
- Anotacion de corpus para investigacion clinica: transcripcion por lotes de grabaciones anonimizadas para construir datasets etiquetados, aprovechando que el procesamiento es local y auditable.
- Documentacion de urgencias manos libres: dictado en escenarios donde el profesional no puede usar teclado ni pantalla, con latencia baja por el diseno TDT.
- Asistentes de accesibilidad para personal sanitario: integracion en herramientas de voz para personal con movilidad reducida en entornos hospitalarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La pagina de investigacion de Omi Health indica que existen comparativas publicas de WER general, WER medico, velocidad y facilidad de configuracion, pero los valores concretos no se han incluido en los datos proporcionados para esta ficha. No se deben asumir cifras sin verificarlas en la fuente original.

## Requisitos de hardware

- VRAM estimada para un modelo de ~0,6 B de parametros: aproximadamente 2,4 GB en FP32, 1,2 GB en FP16/BF16 y 0,6 GB en INT8. Estas cifras son estimaciones genericas por tamano y no proceden de la documentacion del modelo.
- GPU compatibles segun el runtime oficial de Omi: NVIDIA CUDA, Apple Silicon (Metal) y CPU. Para esta variante concreta se apunta a Qualcomm Snapdragon SM8850.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, RTX 3050 en adelante) deberia ser suficiente en precision reducida.
- Opciones de despliegue conocidas: paquete `omi-med-stt` en PyPI y el repositorio `Omi-Health/omi-med-stt-runtime`, que descarga automaticamente el artefacto correspondiente a la maquina. No se confirma soporte oficial en vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. La arquitectura TDT esta disenada para reducir la latencia de decodificacion, pero no se aportan mediciones concretas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `drinnird/omi-med-stt-v1-snapdragon-sm8850-v81` | ~0,6 B | Ingles | cc-by-4.0 | ASR medico on-device para Snapdragon SM8850 | HuggingFace, 0 descargas |
| `omi-health/omi-med-stt-v1` | ~0,6 B | Ingles | cc-by-4.0 | ASR medico on-device (modelo original) | HuggingFace |
| NVIDIA Parakeet TDT 0.6B v2 | ~0,6 B | Ingles | cc-by-4.0 | ASR generico (modelo base) | HuggingFace / NVIDIA NeMo |
| OpenAI Whisper (familia) | 39 M - 1,55 B | Multilingue | MIT | ASR generico multilingue | HuggingFace / OpenAI |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del repositorio `drinnird/omi-med-stt-v1-snapdragon-sm8850-v81` esta practicamente vacia: solo declara la licencia. No hay informacion sobre uso previsto, datos de entrenamiento ni evaluacion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre la integridad o el comportamiento de este artefacto concreto.
- Se trata de un derivado no oficial: el autor es `drinnird`, no Omi Health, y no se documenta que exista publicacion o bendicion por parte del equipo original.
- La fecha de creacion y actualizacion indicada (2026-10-10) es anomala respecto a la fecha actual, lo que puede indicar un error de metadatos.
- Al ser un modelo ASR y no un LLM, no razona, no sigue instrucciones complejas y no soporta tool calling; no debe emplearse como asistente conversacional.
- Como todo sistema ASR, puede producir sustituciones, omisiones y repeticiones (bucles de alucinacion) en audio con ruido, solapamiento de voces o acentos no representados en el entrenamiento.
- La especializacion en ingles medico implica degradacion previsible en otros idiomas, en jerga no clinica y en audio con fuerte carga dialectal.
- El uso en contexto clinico real exige validacion local del WER sobre el dominio objetivo; no es un dispositivo medico homologado y no sustituye el juicio clinico.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero conviene verificar tambien la licencia del modelo base (NVIDIA Parakeet TDT 0.6B v2, distribuido bajo CC-BY-4.0) y los terminos del runtime de Omi Health antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drinnird/omi-med-stt-v1-snapdragon-sm8850-v81
- Modelo original de Omi Health: https://huggingface.co/omi-health/omi-med-stt-v1
- Arbol de ficheros del modelo original: https://huggingface.co/omi-health/omi-med-stt-v1/tree/main
- Pagina de investigacion de Omi Med STT: https://omi.health/research/omi-med-stt
- Repositorio del runtime: https://github.com/Omi-Health/omi-med-stt-runtime
- Paquete en PyPI: https://pypi.org/project/omi-med-stt/
