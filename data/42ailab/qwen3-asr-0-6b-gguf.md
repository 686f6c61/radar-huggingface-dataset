# 42ailab/Qwen3-ASR-0.6B-GGUF

## Resumen

Qwen3-ASR-0.6B es el modelo de reconocimiento automático del habla (ASR) de menor tamano de la familia Qwen3-ASR, desarrollada por el equipo Qwen de Alibaba. Convierte audio en texto y realiza identificacion de idioma, y segun el autor del modelo soporta 52 idiomas y dialectos. Deriva de Qwen3-Omni, cuyo conocimiento audio-texto se reutiliza como base, y se entrena con datos de habla a gran escala. Esta pensado para despliegues donde el coste computacional y la huella de memoria son criticos.

El repositorio `42ailab/Qwen3-ASR-0.6B-GGUF` no contiene un modelo nuevo: es una copia byte a byte de dos ficheros GGUF (pesos en Q8_0 y proyector de audio) convertidos originalmente por ggml-org y publicados en `ggml-org/Qwen3-ASR-0.6B-GGUF`. La motivacion declarada es la preservacion: garantizar que los mismos bytes sigan siendo descargables aunque el repositorio del conversor cambie de nombre o se elimine. Los digests sha256 coinciden con los originales.

La relevancia practica esta en que permite ejecutar ASR multilingue en local con llama.cpp u otros runtimes GGUF, sin depender de servicios en la nube. El peso de los pesos (767,5 MiB en Q8_0) y del proyector de audio (204,5 MiB) lo situan en el rango de equipos de consumo. El parametro total reportado en safetensors es de 751.632.384, aunque el nombre comercial del modelo es 0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR derivado de Qwen3-Omni; incluye proyector de audio separado) |
| Parametros totales | 751.632.384 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica disponible en este repositorio) |
| Idiomas soportados | 52 idiomas y dialectos (segun la familia Qwen3-ASR); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0), con proyector de audio GGUF separado |

## Arquitectura y entrenamiento

No se dispone de detalle arquitectonico en la informacion proporcionada. Por la documentacion de la familia, el modelo se construye sobre Qwen3-Omni y aprovecha su capacidad de comprension de audio como base, combinando un codificador/proyector de audio con el modelo de lenguaje. El repositorio GGUF separa explicitamente los pesos del modelo (`Qwen3-ASR-0.6B-Q8_0.gguf`) del proyector multimodal (`mmproj-Qwen3-ASR-0.6B-Q8_0.gguf`), lo que confirma esa estructura de dos componentes.

El entrenamiento se realizo con datos de habla a gran escala, segun la descripcion de la familia. No se han publicado en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La conversion a GGUF la realizo ggml-org; este repositorio es una copia sin modificaciones.

## Capacidades

- Reconocimiento automatico del habla: transcripcion de audio a texto.
- Identificacion de idioma (language identification) integrada.
- Cobertura de 52 idiomas y dialectos segun la familia Qwen3-ASR.
- Procesamiento de audio mediante proyector multimodal dedicado.
- Ejecucion local en runtimes compatibles con GGUF (llama.cpp y derivados).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision, audio generativo o modo thinking: no disponibles en la informacion.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo convierte grabaciones en texto sin enviar audio a terceros, lo que resulta adecuado para entornos con requisitos de privacidad y para equipos sin GPU dedicada gracias a su tamano reducido.
- Subtitulado de video y podcasts: se puede integrar en pipelines de postproduccion para generar subtitulos; la identificacion de idioma integrada ayuda a enrutar contenido multilingue antes de la transcripcion.
- Asistentes de voz embebidos: al ejecutarse con llama.cpp, puede desplegarse en aplicaciones de escritorio o dispositivos con recursos limitados como etapa ASR de un asistente conversacional.
- Archivado y busqueda de audio corporativo: transcripcion masiva de llamadas o grabaciones para indexacion y busqueda por texto, aprovechando el bajo coste por hora de audio frente a APIs en la nube.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en aplicaciones locales.
- Pipelines de investigacion en ASR multilingue: servir como modelo base ligero para experimentos de evaluacion o ajuste fino en 52 idiomas y dialectos.
- Herramientas de escritorio empaquetadas: el autor distribuye los ficheros para la aplicacion 42model (`42model download qwen3-asr:0.6b-q8_0`), lo que facilita su uso como componente listo para ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de la familia indica que la variante de 1.7B alcanza rendimiento de estado del arte entre modelos ASR de codigo abierto, pero no se aportan cifras concretas para la variante de 0.6B ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para los pesos en Q8_0 (767,5 MiB) mas el proyector de audio (204,5 MiB), excluyendo buffers del runtime y el estado de inferencia.
- GPU recomendadas: no se especifican en la informacion; por tamano, cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente en teoria.
- Cabe en GPU consumer: si, dado el tamano de los ficheros; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; la aplicacion 42model incluye un comando de descarga. Compatibilidad con vLLM, TGI u Ollama no confirmada en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (este) | 751.632.384 | no disponible | 52 idiomas y dialectos | Apache-2.0 | GGUF Q8_0 |
| Qwen3-ASR-1.7B | no disponible (nombre comercial 1.7B) | no disponible | 52 idiomas y dialectos | Apache-2.0 | no disponible |
| Otros modelos ASR open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con la variante mayor de la misma familia; no se han proporcionado datos de otros modelos ASR comparables (parametros, contexto, benchmarks o licencia).

## Limitaciones y advertencias

- Este repositorio es una copia de respaldo, no una conversion propia ni un modelo nuevo; la autoria del modelo es del equipo Qwen y la conversion a GGUF de ggml-org.
- Solo se distribuye la cuantizacion Q8_0; no hay variantes Q4, Q5 u otras en este repositorio.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios especificos (audio con ruido, acentos no cubiertos, jerga tecnica).
- La lista concreta de los 52 idiomas y dialectos no esta disponible; conviene verificar la cobertura del idioma objetivo antes de desplegar.
- La longitud de contexto (duracion maxima de audio procesable) no esta documentada en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio, que segun la model card se tomo del repositorio oficial de Qwen, ya que el repositorio oficial del modelo no incluye un LICENSE separado.
- Al ser un backup de terceros, la trazabilidad de actualizaciones depende del repositorio original de ggml-org; los digests sha256 permiten verificar la integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3-ASR-0.6B-GGUF
- Repositorio ModelScope del backup: https://modelscope.cn/models/42ailab/Qwen3-ASR-0.6B-GGUF
- Repositorio original de la conversion GGUF: https://www.modelscope.cn/models/ggml-org/Qwen3-ASR-0.6B-GGUF
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio GitHub de la familia: https://github.com/QwenLM/Qwen3-ASR
- Sitio del autor: https://42ailab.com
- Aplicacion del autor: https://42model.com
