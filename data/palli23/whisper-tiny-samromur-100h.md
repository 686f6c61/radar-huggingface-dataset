# palli23/whisper-tiny-samromur-100h

## Resumen

whisper-tiny-samromur-100h es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario palli23. Consiste en un ajuste fino de Whisper-tiny, la variante más pequeña de la familia Whisper de OpenAI, sobre un subconjunto anidado de 100 horas del corpus islandés Samrómur-500h. El modelo cuenta con 37.760.640 parámetros (unos 37,8 millones) y el repositorio completo ocupa 0,3 GB, lo que lo sitúa en la gama de modelos desplegables en CPU y en dispositivos de borde sin GPU dedicada.

El modelo forma parte del conjunto de checkpoints de escalado empleado en el trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), cuyo objetivo es estudiar cómo se comportan modelos ASR pequeños entrenados con cantidades crecientes de datos monolingües frente a modelos multilingües mucho mayores. Es, por tanto, una pieza de investigación sobre eficiencia de datos más que un producto final: la model card es mínima y remite al artículo para la metodología y los resultados de WER/CER.

Su relevancia actual reside en dos factores: por un lado, permite reproducir puntos concretos de la curva de escalado de datos (100 horas de audio) en un idioma de bajos recursos como el islandés; por otro, su tamaño reducido lo convierte en un candidato realista para transcripción local, pre-etiquetado de corpus y despliegues con restricciones severas de memoria. La licencia CC-BY-SA-4.0 y el idioma único (is) son las dos restricciones principales a tener en cuenta antes de usarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (base Whisper-tiny: 4 capas de encoder, 4 de decoder, ancho 384, 6 cabezas de atención) |
| Parámetros totales | 37.760.640 (~37,8 M), dato real de los pesos safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventanas de audio de 30 segundos (arquitectura Whisper base); no se documenta otra longitud en la model card |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no hay versiones GGUF, ONNX ni CTranslate2 |
| Idiomas soportados | Islandés (is) únicamente |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,3 GB |
| Tarea declarada en la model card | Reconocimiento automático del habla (ASR) |
| Fecha de creación / última actualización | 2026-06-03 / 2026-09-15 |
| Descargas / likes | 5 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-tiny sin modificaciones estructurales: un transformer encoder-decoder que procesa representaciones log-Mel de 30 segundos de audio y genera tokens de texto de forma autorregresiva. Con 37,8 millones de parámetros se trata del checkpoint más pequeño de la familia Whisper, y su encoder tiene un coste computacional muy inferior al de cualquier modelo de lenguaje contemporáneo. La model card no especifica cambios en el tokenizer, en la estrategia de decodificación ni en la inicialización, por lo que se asume un ajuste fino estándar sobre los pesos preentrenados.

El entrenamiento se realizó sobre un subconjunto anidado de 100 horas extraído del pool de escalado Samrómur-500h, un corpus de habla islandesa. El término "nested subset" indica que las 100 horas forman parte de un diseño experimental incremental, de modo que los checkpoints de 10 h, 50 h, 100 h, etc. comparten composición y solo varían en volumen, lo que permite aislar el efecto de la cantidad de datos. No se documentan en la información disponible ni el número de pasos, ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR). El modelo se enmarca en el artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), que contiene la metodología completa y los resultados de WER y CER; ninguno de esos resultados se reproduce en el repositorio.

## Capacidades

- Transcripción de voz en islandés: convierte audio en texto en islandés, que es la única tarea para la que fue ajustado.
- Procesamiento por ventanas de 30 segundos, que es la entrada nativa de Whisper; el audio más largo requiere un pipeline de chunking con solapamiento y concatenación externa.
- Funcionamiento en CPU: con 37,8 M de parámetros, la inferencia es viable sin acelerador hardware, lo que habilita despliegues locales y offline.
- Punto de referencia reproducible para experimentos de escalado de datos en ASR de bajos recursos, al formar parte de una serie de checkpoints con volúmenes de datos crecientes.
- Pre-etiquetado y anotación asistida de corpus de voz islandeses, generando transcripciones candidatas que después se revisan manualmente.
- Generación de subtítulos en formato de texto con marcas temporales aproximadas, siempre que el pipeline externo las calcule, ya que la model card no garantiza la salida de timestamps.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documenta razonamiento multi-paso ni modo "thinking": es un modelo acústico-secuencial, no un asistente conversacional.
- Capacidades multilingües: no disponibles. Aunque el tokenizer de Whisper-tiny es multilingüe, el ajuste fino es monolingüe y no hay evidencia de transferencia a otros idiomas.
- No dispone de visión, audio generation ni otras modalidades distintas de la transcripción de voz.

## Casos de uso

- Transcripción de pódcast y radio en islandés: el modelo puede procesar ficheros largos troceados en ventanas de 30 segundos y generar un borrador de transcripción completo; su tamaño permite ejecutarlo en local sin coste por minuto.
- Subtitulado automático de vídeo en islandés: combinado con un forzado de alineación externo, sirve para generar pistas de subtítulos que después se revisan; encaja en flujos de postproducción donde no se dispone de GPUs grandes.
- Anotación de corpus de voz para investigación: al ser un checkpoint de 100 horas del pool Samrómur, se usa para pre-etiquetar nuevas grabaciones islandesas y reducir el coste de transcripción manual en proyectos de recogida de datos.
- Estudio de escalado de datos en ASR de bajos recursos: replicar o extender la curva de aprendizaje comparando este checkpoint de 100 h con los de otros volúmenes del mismo pool, midiendo WER/CER sobre particiones de test fijas.
- Despliegue en el borde y modo offline: con menos de 1 GB de memoria en fp32, cabe en Raspberry Pi, NVIDIA Jetson o móvil, lo que permite transcripción en dispositivos sin conectividad, por ejemplo en grabadoras de campo.
- Interfaces por voz en islandés: como componente ASR de un sistema de comandos o dictado para aplicaciones locales, siempre que el vocabulario esperado sea cerrado y se valide el WER en ese dominio concreto.
- Analítica de conversaciones en centros de atención telefónica: transcripción masiva y posterior extracción de palabras clave o motivos de llamada mediante herramientas externas, aprovechando el bajo coste de inferencia del modelo.
- Accesibilidad: transcripción casi en tiempo real de reuniones o clases en islandés para personas con discapacidad auditiva, asumiendo la latencia añadida del chunking.
- Generación de datos sintéticos de entrenamiento: usar sus salidas como pseudo-etiquetas para entrenar modelos mayores o para filtrar audio ruidoso antes de un ajuste fino posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite explícitamente al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026) para consultar los resultados de WER y CER, pero el repositorio de Hugging Face no incluye ninguna tabla de métricas, ni comparaciones con otros modelos, ni detalles sobre el conjunto de evaluación empleado. No se dispone tampoco de datos de latencia o throughput medidos.

## Requisitos de hardware

- Memoria en pesos: aproximadamente 151 MB en fp32, 76 MB en fp16 y 38 MB en int8, calculado a partir de los 37,76 millones de parámetros.
- VRAM para inferencia: menos de 1 GB incluyendo activaciones y buffers de audio en la mayoría de configuraciones; cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no requiere GPU. Para lotes grandes de transcripción, una NVIDIA T4, RTX 3060 o superior acelera el proceso, pero el modelo no aprovecha bien GPUs de gama alta tipo A100 o H100 por su reducido tamaño.
- GPU de consumo: cabe con enorme holgura en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060 o integradas modernas; no hay problema de VRAM.
- CPU: la inferencia es totalmente viable en CPU, incluso en un solo hilo con los backends optimizados.
- Dispositivos de borde: Raspberry Pi 4/5, NVIDIA Jetson Nano o Xavier, y plataformas móviles son objetivos realistas dado el tamaño del modelo.
- Opciones de despliegue: pipelines de Hugging Face Transformers con safetensors; faster-whisper mediante conversión a CTranslate2; whisper.cpp mediante conversión a GGML; ONNX Runtime tras exportación. vLLM y TGI no son aplicables, ya que están orientados a modelos de lenguaje y no a ASR de Whisper. Ninguna de estas conversiones se distribuye en el repositorio, por lo que hay que generarlas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Entrada de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur-100h | 37,8 M | Islandés (is) | Ventanas de 30 s | CC-BY-SA-4.0 | Hugging Face, solo safetensors |
| openai/whisper-tiny | 39 M | 99 idiomas | Ventanas de 30 s | Permisiva (etiqueta de Hugging Face) | Hugging Face, ecosistema amplio de conversiones |
| openai/whisper-base | 74 M | 99 idiomas | Ventanas de 30 s | Permisiva (etiqueta de Hugging Face) | Hugging Face |
| openai/whisper-small | 244 M | 99 idiomas | Ventanas de 30 s | Permisiva (etiqueta de Hugging Face) | Hugging Face |
| Otros checkpoints del pool Samrómur-500h | No disponible | Islandés (is) | No disponible | No disponible | Referenciados en el artículo, no enlazados en la model card |

La comparación cuantitativa de WER entre estos modelos para islandés no está disponible en la información proporcionada. La diferencia estructural clave frente a Whisper-tiny original es el ajuste monolingüe: se espera una mejora en islandés a cambio de perder la capacidad multilingüe y de traducción, pero ese extremo no puede confirmarse sin los resultados del artículo. Frente a Whisper-base o Whisper-small, este checkpoint es entre dos y seis veces más pequeño, lo que reduce el coste de inferencia a cambio de una capacidad acústica potencialmente menor, que solo el ajuste específico en islandés puede compensar.

## Limitaciones y advertencias

- Idiomas: solo islandés. Usarlo con audio en otro idioma o con hablantes no nativos muy acentuados producirá salidas poco fiables, probablemente en forma de texto inventado o repetido.
- Sesgo de dominio: el corpus Samrómur es fundamentalmente habla leída o semileída, grabada por voluntarios con micrófonos relativamente controlados. El rendimiento caerá con habla espontánea, ruido de fondo, solapamiento de hablantes o acentos poco representados.
- Alucinación: como todos los modelos Whisper, tiende a generar texto plausible en tramos de silencio, música o ruido, y puede entrar en bucles de repetición. Es imprescindible aplicar umbrales de confianza y posprocesado.
- Ausencia de métricas publicadas: no hay WER, CER ni evaluación por subgrupos en el repositorio, lo que impide estimar su calidad real sin ejecutar una evaluación propia.
- Ventana de 30 segundos: el audio largo exige chunking con solapamiento; sin un pipeline cuidadoso aparecen errores en las fronteras y se degradan la puntuación y el contexto entre frases.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y obliga a distribuir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que integren el modelo o pesos derivados. Conviene revisar además los términos del corpus Samrómur y los derechos de los hablantes sobre las grabaciones originales.
- Validación comunitaria nula: 5 descargas y 0 likes en el momento de la consulta. No hay issues, discusiones ni terceros que hayan verificado el comportamiento del modelo.
- Artefactos no incluidos: no se publican versiones GGUF, CTranslate2 u ONNX, ni scripts de evaluación, ni configuración de generación documentada, lo que añade trabajo de integración.
- Nomenclatura: el nombre del repositorio menciona "100h" y el artículo describe una serie de checkpoints de escalado; mezclar pesos de distintos volúmenes sin comprobar la procedencia puede invalidar comparaciones experimentales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/whisper-tiny-samromur-100h
- Artículo citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants", ICASSP 2026 (enlace no disponible)
- Pool de datos citado en la model card: Miljón/samromur-500h (enlace no disponible)
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de referencia de la arquitectura Whisper: https://github.com/openai/whisper
- Resultados de la búsqueda web: ninguno relevante. Las URLs devueltas tratan sobre herramientas de programación asistida (Cursor) y no guardan relación con este modelo.
