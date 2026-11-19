# Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1

## Resumen

Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1 es una cuantización GGUF de 27.320.697.856 parámetros derivada del modelo Qwen3.8-27B, publicada por el usuario Kujira. Se trata de una variante "abliterated" (con el comportamiento de rechazo reducido) del fichero `Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp.gguf` de ISTA DASLab, que a su vez es una cuantización GSQ-RCO del modelo base Qwen3.8-27B del equipo Qwen. El resultado es un fichero de 8,8 GB en cuantización IQ2_XS con cabeza MTP (multi-token prediction) para decodificación especulativa.

El problema que aborda es concreto: el modelo original rechaza el 88,5% de las peticiones dañinas en un conjunto de evaluación retenido, mientras que esta versión reduce esa tasa al 1%, manteniendo el resto de tensores byte-idénticos al fichero original. La edición se realizó con la técnica CHiPS (Causal Head-isolated Projection Steering), según el autor, y afecta a una parte muy pequeña del modelo. Es relevante para investigadores que necesitan un modelo sin filtros de rechazo para estudiar comportamientos, evaluación de seguridad o generación de contenido sin restricciones, siempre con las advertencias legales y éticas correspondientes.

La licencia es Apache-2.0, heredada del modelo base. El repositorio tiene 2.654 descargas y 3 likes en el momento de la consulta, y se publicó el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), cuantización GGUF IQ2_XS con cabeza MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (fichero de 8,8 GB); el autor indica que mantiene los mismos tipos de cuantización que el build original `-mtp` |
| Idiomas soportados | no disponible (la evaluación se realizó en inglés y japonés, pero no se declara lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de Qwen3.8-27B, un transformer de 27.320.697.856 parámetros. La cuantización original (GSQ-RCO) la realizó ISTA DASLab y este repositorio aplica una edición posterior con CHiPS (Causal Head-isolated Projection Steering), una técnica de steering que modifica proyecciones aisladas por cabeza para reducir el comportamiento de rechazo. Según la model card, la edición se confina a una parte muy pequeña del modelo y todos los demás tensores son byte-idénticos al fichero original. El fichero incluye la cabeza MTP (multi-token prediction) para decodificación especulativa, lo que permite acelerar la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base, más allá de lo que pueda indicar la documentación de Qwen3.8-27B (no incluida en la información proporcionada). La receta CHiPS no está publicada y las mediciones del artículo referenciado se realizaron sobre otros modelos, según advierte el propio autor.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" habilitado (la evaluación se realizó con thinking activado).
- Soporte de tool calling / function calling: en la evaluación, el 97% de las llamadas tuvieron nombre correcto y el 100% argumentos correctos; el 90% de los casos sin necesidad de herramienta no emitieron llamada.
- Seguimiento de resultados de herramientas en turnos posteriores: 100% en la evaluación.
- Tareas largas multi-paso: el 12% alcanzó el límite de tokens y el 4% mostró bucles (1 tarea), con una media de 2.083 tokens.
- Capacidades multilingües: la evaluación incluyó peticiones en inglés y japonés, aunque no se declara una lista oficial de idiomas.
- Decodificación especulativa mediante cabeza MTP incluida en el fichero.
- Comportamiento de rechazo reducido: 1% en peticiones dañinas y 1% en peticiones inofensivas (frente a 88,5% y 4% del original).
- Vision: el proyector `mmproj-Qwen3.8-27B-BF16.gguf` no está incluido y el uso de visión no se ha probado con este fichero.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo permite estudiar respuestas a peticiones que el original rechaza, con una tasa de rechazo del 1% medida sobre 104 peticiones dañinas, lo que facilita análisis de comportamiento sin la interferencia de negativas.
- Evaluación de técnicas de steering: al ser una edición CHiPS sobre un fichero byte-idéntico en el resto de tensores, sirve para comparar el efecto de la edición frente al original con perplexidad casi idéntica (diferencias inferiores al 0,3% en inglés, japonés, código y corpus general).
- Generación de contenido sin filtros para entornos controlados: el modelo sigue muchas peticiones que el original rechaza, adecuado para investigación interna con salvaguardas propias.
- Pruebas de tool calling en pipelines: con un 97% de nombres correctos y 100% de argumentos correctos en 40 tareas, puede integrarse en flujos de agentes que requieran llamadas a funciones, verificando previamente el comportamiento en el dominio concreto.
- Despliegue en hardware de consumo: el fichero de 8,8 GB en IQ2_XS con `llama-server -ngl 99` permite ejecución local en GPUs con VRAM suficiente para 8,8 GB más caché KV en q8_0, según la configuración de evaluación del autor.
- Estudio de decodificación especulativa: la cabeza MTP incluida permite medir el impacto de la decodificación especulativa en latencia y throughput sobre un modelo de 27B cuantizado a IQ2_XS.
- Análisis de fallos en tareas largas: con un 12% de tareas que alcanzan el límite de tokens y un 4% de salidas vacías, útil para caracterizar modos de fallo en razonamiento extendido.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones del propio autor sobre el fichero publicado, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación.

Rechazos y modos de fallo (104 peticiones dañinas y 100 inofensivas, thinking activado):

| Metrica | Original | Heretic build | Este modelo |
|---|---|---|---|
| Rechazo en peticiones dañinas | 88,5% | 1% | 1% |
| Rechazo en peticiones inofensivas | 4% | 1% | 1% |
| Bucles (dañinas / inofensivas) | 0% / 1% | 1% / 1% | 0% / 0% |
| Respuestas vacías (dañinas / inofensivas) | 0% / 2% | 1% / 2% | 2% / 2% |

Tareas largas y tool calling (24 tareas multi-paso y 40 tareas de tool calling):

| Metrica | Original | Heretic build | Este modelo |
|---|---|---|---|
| Tareas largas: límite de tokens | 8% | 21% | 12% |
| Tareas largas: bucles | 0% | 0% | 4% (1 tarea) |
| Tareas largas: salida vacía | 4% | 4% | 4% |
| Tareas largas: media de tokens | 2.151 | 2.260 | 2.083 |
| Tool calls: nombre / argumentos correctos | 97% / 100% | 100% / 100% | 97% / 100% |
| Sin tool call cuando no se necesita | 90% | 100% | 90% |
| Turno posterior tras resultado de herramienta | 100% | 100% | 100% |

Perplexidad (teacher-forced, chunks de 512 tokens, textos de referencia internos):

| | Ingles | Japones | Codigo | Corpus general |
|---|---|---|---|---|
| Original | 5,553 | 18,333 | 3,978 | 4,161 |
| Este modelo | 5,546 | 18,355 | 3,982 | 4,161 |

Las diferencias de perplexidad están dentro del 0,3%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 8,8 GB; a ello hay que sumar la caché KV en q8_0 y el overhead de `llama-server`. Con `-ngl 99` se descargan todas las capas a GPU.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño del fichero, cabría en GPUs consumer con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 12 GB o más de VRAM, aunque el autor no lo confirma explícitamente.
- Opciones de despliegue: `llama.cpp` mediante `llama-server` (comando indicado por el autor: `llama-server -m <fichero>.gguf -ngl 99 --jinja`). No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La configuración de evaluación usa temperatura 0,6, top_p 0,95, top_k 20, máximo 1.536 tokens nuevos, semilla fija y caché KV q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo en peticiones dañinas | Perplexidad (ingles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Kujira, IQ2_XS-mtp, CHiPS) | 27.320.697.856 | no disponible | 1% | 5,546 | Apache-2.0 | GGUF, 8,8 GB |
| Original ISTA DASLab IQ2_XS-mtp | 27.320.697.856 | no disponible | 88,5% | 5,553 | Apache-2.0 | GGUF |
| Heretic build (0bserverx) | 27.320.697.856 | no disponible | 1% | no comparable (cuantización distinta) | Apache-2.0 (presumible) | GGUF |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo sigue muchas peticiones que el original rechaza y puede producir contenido dañino, ofensivo o inexacto. El autor lo destina a investigación y a usuarios que comprendan este comportamiento.
- La detección de rechazos se realizó por coincidencia de frases (inglés y japonés), sin revisión humana; una respuesta que evite la petición sin usar una frase de rechazo no se cuenta como rechazo.
- Los conjuntos de evaluación son pequeños: una petición equivale aproximadamente al 1%, y el 1-3% restante de rechazos varía entre ejecuciones.
- Solo se probaron peticiones de un turno sin system prompt; no se evaluaron conversaciones multi-turno, system prompts ni peticiones reformuladas o adversariales.
- Solo se proporciona el build IQ2_XS-mtp y el uso de visión no se ha probado; el proyector mmproj no está incluido.
- La receta CHiPS no está publicada y las mediciones del artículo referenciado se realizaron sobre otros modelos, por lo que la reproducibilidad de la edición no está garantizada.
- La cuantización IQ2_XS es agresiva; la perplexidad en japonés (18,355) es notablemente superior a la de inglés (5,546), lo que sugiere degradación en ese idioma.
- Es responsabilidad del usuario cumplir las leyes aplicables y la licencia Apache-2.0; se recomienda añadir salvaguardas propias antes de usar el modelo en servicios a terceros.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre su composición de datos de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1)
- [Modelo base cuantizado: ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF)
- [Modelo base original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Build Heretic de la misma cuantización: 0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF](https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF)
- [Articulo sobre CHiPS (Causal Head-isolated Projection Steering)](https://balaena01.github.io/chips-steering/)
- Referencia arXiv:2604.18556 (citada en los tags del repositorio)
- Referencia arXiv:2605.00649 (citada en los tags del repositorio)
