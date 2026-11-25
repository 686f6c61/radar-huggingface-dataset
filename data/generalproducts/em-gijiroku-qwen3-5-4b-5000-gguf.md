# generalproducts/em-gijiroku-qwen3.5-4b-5000-GGUF

## Resumen

EM Gijiroku Qwen3.5 4B (5000) es un ajuste fino del modelo Qwen/Qwen3.5-4B desarrollado por el usuario generalproducts, distribuido exclusivamente en formato GGUF con cuantizacion Q4_K_M. El modelo esta especializado en la transcripcion y resumen de actas de reunion (議事録, "gijiroku" en japones), una tarea que combina limpieza de transcripciones desordenadas, estructuracion de contenido y sintesis de puntos clave. El ajuste se realizo sobre un conjunto de 5.000 ejemplos, segun indica la model card.

El modelo parte de la arquitectura de Qwen3.5-4B, con 4.326.350.848 parametros totales, y hereda la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 2,8 GB, coherente con una unica cuantizacion Q4_K_M de un modelo de ~4.300 millones de parametros.

Su relevancia actual reside en la demanda de herramientas ligeras y desplegables en local para procesar reuniones: el modelo cabe en GPUs de consumo, se integra en pipelines de transcripcion y ofrece una especializacion concreta que los modelos generalistas no cubren con la misma consistencia. No obstante, la informacion publicada es muy escasa: no se detallan idiomas soportados, pipeline, ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (el ajuste esta orientado a actas en japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, del que hereda la arquitectura transformer. No se especifica en la informacion disponible si el ajuste se realizo mediante SFT, LoRA, QLoRA u otra tecnica, ni se detalla la composicion exacta del dataset mas alla de los 5.000 ejemplos orientados a la tarea de actas de reunion (limpieza y resumen de transcripciones). Tampoco se documentan el numero total de tokens de entrenamiento, la mezcla de datos, ni si hubo etapas de RLHF o DPO.

La innovacion principal es la especializacion vertical: el modelo se distribuye unicamente como GGUF Q4_K_M, lo que indica que el autor prioriza el despliegue en local y en entornos con recursos limitados. La model card incluye el hash SHA-256 del archivo (1a3f227a3f7e0552980bf8c6192dff0db206fd23618f64ebe67c52dab3993d0e), un detalle util para verificar la integridad de la descarga. No se documentan innovaciones arquitectonicas adicionales.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Limpieza y normalizacion de transcripciones de reunion (correccion de muletillas, puntuacion y estructura).
- Resumen y estructuracion de actas: extraccion de decisiones, tareas asignadas y puntos de seguimiento.
- Especializacion en japones para la tarea de "gijiroku" (actas de reunion), segun la model card.
- Capacidades generales del modelo base (razonamiento, codigo, matematicas, tool calling, agentes) no documentadas especificamente para este ajuste; se asumen heredadas pero no verificadas.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion automatica de actas de reunion: a partir de una transcripcion (por ejemplo, de un servicio ASR), el modelo limpia el texto y produce un acta estructurada con asistentes, temas tratados y decisiones. Es adecuado por su ajuste especifico sobre 5.000 ejemplos de esta tarea.
- Resumen de reuniones largas para envio por correo: el modelo condensa transcripciones en un resumen ejecutivo de pocos parrafos, reduciendo el tiempo de revision manual del equipo.
- Extraccion de action items: a partir del acta, el modelo puede identificar tareas, responsables y plazos, integrándose en herramientas de gestion de proyectos mediante un post-proceso simple.
- Despliegue en local por privacidad: al ser GGUF Q4_K_M de ~2,8 GB, puede ejecutarse en un portatil con GPU de consumo o incluso en CPU, lo que permite procesar reuniones confidenciales sin enviar audio ni transcripciones a la nube.
- Pipeline de transcripcion + acta en entornos sin conectividad: combinado con un motor ASR local (por ejemplo, Whisper), el modelo completa la cadena de conversion de audio a acta en una sola maquina.
- Prototipado rapido de asistentes de reunion: por su licencia Apache 2.0 y su tamano reducido, sirve para validar productos de meeting assistant antes de escalar a modelos mayores.
- Normalizacion de notas dispersas: el modelo puede tomar notas telegraficas de una reunion y convertirlas en un documento legible y coherente, util para equipos que no graban audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con la cuantizacion Q4_K_M (el repositorio ocupa 2,8 GB); con overhead de contexto, entre 3 y 5 GB segun la longitud de la ventana.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs de datacenter el modelo queda muy infrautilizado, pero funciona.
- Cabe en GPU de consumo: si, en tarjetas con 4-6 GB de VRAM o mas; tambien puede ejecutarse en CPU con llama.cpp, con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda verificar compatibilidad antes de usarlos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| EM Gijiroku Qwen3.5 4B (5000) | 4.326.350.848 | No disponible | Apache 2.0 | GGUF Q4_K_M | Actas de reunion (japones) |
| Qwen/Qwen3.5-4B (base) | ~4.300 millones | No disponible | Apache 2.0 | Safetensors (principalmente) | Generalista |
| Modelos de resumen genericos de ~4B (p. ej., variantes Qwen o Llama de tamano similar) | ~3.000-4.000 millones | Variable | Variable | GGUF, safetensors | Generalista, sin ajuste en actas |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; los modelos base de la misma familia son el referente mas directo, pero no se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay datos de evaluacion, idiomas soportados ni pipeline declarado, lo que dificulta validar su calidad antes de desplegarlo.
- Al estar ajustado sobre 5.000 ejemplos de actas en japones, el rendimiento en otros idiomas o en dominios distintos (por ejemplo, actas medicas o legales) es incierto y debe validarse empiricamente.
- Riesgo de alucinacion en la sintesis de actas: el modelo puede inventar acuerdos o atribuir declaraciones a personas equivocadas; se recomienda revision humana en contextos criticos.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo base en safetensors; no se documenta el impacto en la tarea objetivo.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento de Qwen3.5-4B y del dataset de ajuste, que no se describe.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar el aviso de licencia y verificar las condiciones del modelo base Qwen3.5-4B.
- Solo se distribuye una cuantizacion (Q4_K_M); no hay versiones en safetensors ni otras precisiones para fine-tuning posterior.
- El modelo tiene muy pocas descargas (20) y ningun "like", por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/generalproducts/em-gijiroku-qwen3.5-4b-5000-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
