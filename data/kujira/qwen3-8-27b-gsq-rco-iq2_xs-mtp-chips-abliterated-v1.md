# Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Abliterated-v1

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Abliterated-v1 es una versión modificada del cuantizado GGUF `Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp` publicado por ISTA DASLab, a su vez derivado del modelo base Qwen3.8-27B del equipo Qwen. La modificación, realizada por el usuario Kujira, aplica una técnica denominada CHiPS (Causal Head-isolated Projection Steering) cuyo objetivo es reducir el comportamiento de rechazo (refusal) del modelo original, manteniendo el resto de capacidades intactas. El resultado es un modelo de 27.320.697.856 parámetros en cuantización IQ2_XS que, según el autor, baja la tasa de rechazo ante peticiones dañinas del 88,5% al 1%, sin degradar perplejidad, tool calling ni comportamiento en tareas largas.

El modelo conserva la cabeza MTP (multi-token prediction) del archivo original, lo que permite decodificación especulativa, y se distribuye como un único archivo GGUF de 8,8 GB listo para usarse con llama.cpp. Está etiquetado como `abliterated`, término habitual en la comunidad para modelos a los que se les ha suprimido la alineación de seguridad orientada a rechazos. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es doble: por un lado, documenta un método de edición de pesos que actúa sobre una fracción mínima del modelo (el autor afirma que el resto de tensores son idénticos byte a byte al original); por otro, ejemplifica el debate sobre modelos sin salvaguardas y su uso responsable. No se dispone de información sobre idiomas soportados ni de benchmarks estándar publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabeza MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (único archivo publicado) |
| Idiomas soportados | no disponible (evaluación en inglés y japonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B, un transformer denso de aproximadamente 27.300 millones de parámetros. El archivo distribuido es una cuantización IQ2_XS realizada por ISTA DASLab mediante GSQ-RCO, e incluye la cabeza MTP del build original, lo que habilita decodificación especulativa en llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación principal de esta ficha es el método CHiPS (Causal Head-isolated Projection Steering), aplicado por el autor para reducir los rechazos. Según la model card, la edición se confina a una parte muy pequeña del modelo y el resto de tensores permanecen idénticos byte a byte al archivo original; los detalles técnicos del método no se han divulgado. La evaluación del autor compara tres archivos de la misma cuantización (original, build Heretic y este modelo) y reporta que la perplejidad teacher-forced se mantiene dentro del 0,3% respecto al original en inglés, japonés, código y corpus general. También verifica que la distribución del primer token difiere con una divergencia KL de 0,006 o menos en 64 prompts, con el mismo token más probable en 62 de ellos.

## Capacidades

- Generación de texto conversacional en formato multi-turno, con modo de razonamiento (thinking) habilitado por defecto en la configuración de evaluación.
- Razonamiento de varios pasos y tareas de formato largo: el autor reporta 24 tareas multi-paso evaluadas.
- Tool calling / function calling: 97% de acierto en nombre y 100% en argumentos sobre 40 tareas de llamada a herramientas.
- Seguimiento de turnos tras el resultado de una herramienta: 100% en la evaluación del autor.
- Decodificación especulativa mediante la cabeza MTP incluida en el archivo.
- Capacidad de visión potencialmente heredada del modelo base, aunque el proyector `mmproj-Qwen3.8-27B-BF16.gguf` no se incluye y el autor indica que no se ha probado visión con este archivo.
- Capacidades multilingües: la evaluación incluye peticiones en inglés y japonés, pero no se documenta la lista completa de idiomas.

## Casos de uso

- Investigación sobre alineación y edición de pesos: el modelo sirve como caso de estudio para medir el efecto de técnicas de steering sobre la tasa de rechazo, comparando con el original y con el build Heretic bajo el mismo esquema de evaluación.
- Evaluación de robustez de salvaguardas: equipos de seguridad pueden usar este archivo para probar si sus filtros externos detectan contenido dañino cuando el modelo subyacente no rechaza, ya que el autor recomienda añadir salvaguardas propias antes de exponerlo a terceros.
- Despliegue local en hardware de consumo: al ocupar 8,8 GB en IQ2_XS, cabe en GPUs consumer con 12 GB o más de VRAM y permite ejecutar un modelo de 27B en local con llama.cpp y `llama-server`.
- Asistente conversacional con tool calling en entornos controlados: la evaluación reporta 97% de acierto en nombre de herramienta y 100% en argumentos, lo que lo hace apto para prototipos de agentes que encadenan llamadas a APIs internas.
- Generación de código y texto técnico: la perplejidad en código (3,982) se mantiene prácticamente igual a la del original (3,978), por lo que puede usarse para tareas de completado y explicación de código en pipelines internos.
- Procesamiento de documentación en inglés y japonés: la perplejidad en japonés (18,355) es similar a la del original (18,333), lo que respalda su uso en tareas de resumen o extracción sobre textos en esos idiomas.
- Pruebas de decodificación especulativa: la inclusión de la cabeza MTP permite medir aceleraciones de inferencia en llama.cpp frente a builds sin MTP.

## Benchmarks y rendimiento

Los datos publicados por el autor no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino evaluaciones internas sobre conjuntos propios. Se reproducen a continuación.

Rechazos y modos de fallo (104 peticiones dañinas y 100 inofensivas, thinking activado):

| Metrica | Original | Heretic | Este modelo |
|---|---|---|---|
| Rechazo en peticiones dañinas | 88,5% | 1% | 1% |
| Rechazo en peticiones inofensivas | 4% | 1% | 1% |
| Bucles (dañinas / inofensivas) | 0% / 1% | 1% / 1% | 0% / 0% |
| Respuestas vacías (dañinas / inofensivas) | 0% / 2% | 1% / 2% | 2% / 2% |

Tareas largas y tool calling (24 tareas multi-paso y 40 tareas de llamada a herramientas):

| Metrica | Original | Heretic | Este modelo |
|---|---|---|---|
| Tareas largas: límite de tokens alcanzado | 8% | 21% | 12% |
| Tareas largas: bucles | 0% | 0% | 4% (1 tarea) |
| Tareas largas: salida vacía | 4% | 4% | 4% |
| Tareas largas: tokens medios | 2.151 | 2.260 | 2.083 |
| Tool calls: nombre / argumentos correctos | 97% / 100% | 100% / 100% | 97% / 100% |
| Sin tool call cuando no se necesita | 90% | 100% | 90% |
| Turno de seguimiento tras resultado de herramienta | 100% | 100% | 100% |

Perplejidad teacher-forced (chunks de 512 tokens, textos internos de referencia; no son wikitext2/C4/FineWeb-Edu):

| Corpus | Original | Este modelo |
|---|---|---|
| Inglés | 5,553 | 5,546 |
| Japonés | 18,333 | 18,355 |
| Código | 3,978 | 3,982 |
| Corpus general | 4,161 | 4,161 |

Configuración de evaluación: `llama-server`, thinking activado, temperatura 0,6, top_p 0,95, top_k 20, máximo 1.536 tokens nuevos, semilla fija, caché KV q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 8,8 GB; con caché KV q8_0 y contexto moderado, se recomienda al menos 10-12 GB de VRAM para evitar offload parcial a CPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB), A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En 8 GB requeriría offload parcial y penalización de latencia.
- Opciones de despliegue: llama.cpp (`llama-server`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp. No se documenta soporte para vLLM ni TGI con este archivo.
- Latencia y throughput: no disponibles. La inclusión de la cabeza MTP permite decodificación especulativa, pero el autor no publica cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rechazo (dañinas) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (CHiPS-Abliterated) | 27,3B | no disponible | IQ2_XS-mtp | 1% | Apache-2.0 | GGUF |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp (original) | 27,3B | no disponible | IQ2_XS-mtp | 88,5% | Apache-2.0 | GGUF |
| 0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF | 27,3B | no disponible | IQ2_XS | 1% | Apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | BF16 | no disponible | Apache-2.0 | safetensors |

Los tres builds cuantizados comparten el mismo modelo base y difieren en el método de edición aplicado. El original conserva la alineación de rechazo; el build Heretic y este modelo la reducen al 1% en el conjunto de evaluación del autor, con diferencias menores en tareas largas y tool calling.

## Limitaciones y advertencias

- El modelo sigue muchas peticiones que el original rechaza y puede producir contenido dañino, ofensivo o inexacto. El autor lo restringe explícitamente a investigación y advierte de la responsabilidad legal del usuario.
- El método CHiPS no se ha divulgado; no es posible auditar qué tensores exactos se han modificado ni reproducir la edición a partir de la documentación pública.
- La evaluación de rechazos se basa en coincidencia de frases y no en revisión humana: una respuesta que evita la petición sin usar una frase de rechazo no se contabiliza como rechazo.
- Los conjuntos de evaluación son pequeños (una petición equivale a ~1%), y el 1-3% de rechazos restante varía entre ejecuciones.
- Solo se han probado peticiones de un turno sin system prompt; no se evaluaron conversaciones multi-turno, system prompts ni peticiones reformuladas o adversariales.
- Solo se publica el build IQ2_XS-mtp; no hay versiones en otras cuantizaciones de este modelo editado.
- La visión no se ha probado con este archivo y el proyector `mmproj` no se incluye.
- La cuantización IQ2_XS es agresiva; aunque la perplejidad se mantiene cercana al original en los textos evaluados, puede degradar tareas de razonamiento complejo no cubiertas por la evaluación.
- Riesgo de alucinación: no se han publicado métricas específicas de factualidad; aplican las limitaciones habituales de un modelo de 27B cuantizado a 2 bits.
- La licencia Apache-2.0 permite uso comercial, pero el uso de un modelo sin salvaguardas en producción puede incumplir normativas sectoriales o locales; el autor recomienda añadir filtros propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Abliterated-v1
- Modelo base cuantizado (ISTA DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Build Heretic de referencia: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper GSQ (referenciado en tags): arXiv:2604.18556
- Paper RCO (referenciado en tags): arXiv:2605.00649
