# gyorilab/whisper-large-v3-turbo-anv-tso-ct2

## Resumen

`whisper-large-v3-turbo-anv-tso-ct2` es una conversión a CTranslate2 del modelo `dsfsi-anv/whisper-large-v3-turbo-anv-tso`, un ajuste fino de Whisper large-v3-turbo especializado en reconocimiento automático de voz (ASR) para xitsonga (tsonga), lengua bantú hablada en el sur de Mozambique, el nordeste de Sudáfrica y el sudeste de Zimbabue. El ajuste original lo entrenó DSFSI sobre el corpus African Next Voices; la conversión la publica el usuario gyorilab y no modifica los pesos, solo el formato y la cuantización.

El repositorio es, por tanto, un artefacto de distribución más que un modelo nuevo: empaqueta los pesos en formato CTranslate2 con cuantización int8 para que funcionen directamente con faster-whisper, con un tamaño de repositorio de 0,8 GB. Se conserva la licencia MIT del modelo de origen.

Su relevancia radica en dos puntos concretos. Primero, el xitsonga es una lengua de bajos recursos con muy poca cobertura en sistemas ASR comerciales, y este es un ajuste específico sobre un corpus africano. Segundo, Whisper no dispone de token de idioma para xitsonga, por lo que el modelo se decodifica bajo el token de suajili (`sw`), un detalle operativo crítico que hay que forzar explícitamente para evitar que la detección automática derive en audio corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante large-v3-turbo); no se detalla en la informacion proporcionada mas alla de la pertenencia a la familia Whisper |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base es la variante turbo de Whisper large-v3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 s por segmento, segun la arquitectura Whisper; no se especifica otro valor en la informacion proporcionada |
| Tipos de cuantizacion | int8 (unica cuantizacion incluida en este repositorio) |
| Idiomas soportados | xitsonga (codigo `ts`), decodificado bajo el token de suajili (`sw`) |
| Licencia | MIT (la misma que el modelo de origen) |
| Formato de pesos | CTranslate2 (`model.bin`), acompanado de `tokenizer.json` y `preprocessor_config.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que consume espectrogramas log-Mel y genera texto de forma autorregresiva, con soporte para marcas de tiempo y detección de idioma. La variante large-v3-turbo reduce el número de capas del decodificador respecto a large-v3 para acelerar la inferencia. El ajuste fino sobre xitsonga lo realizó DSFSI sobre el corpus African Next Voices; no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Al tratarse de una tarea ASR supervisada, lo habitual en esta familia es entrenamiento con pares audio-transcripción, pero ese extremo no está confirmado en la documentación consultada.

La aportación de este repositorio es la conversión con CTranslate2 4.8.0 a partir de la revisión `e24387e1183e8a0caa779840677252c317e6a30a` del modelo de origen, aplicando cuantización int8 y copiando `preprocessor_config.json`. Como el repositorio original solo incluye ficheros de tokenizador lentos, aquí se añade un `tokenizer.json` (tokenizador rápido) guardado con `transformers`. No hay innovaciones de decodificación propias: se hereda el comportamiento de faster-whisper. Un detalle funcional documentado por el autor es que conviene desactivar `condition_on_previous_text` para evitar bucles de repetición en audio largo.

## Capacidades

- Transcripción de voz a texto en xitsonga (tsonga) a partir de audio en fichero.
- Detección automática de idioma (heredada de Whisper), aunque el autor recomienda forzar `language="sw"` para evitar derivas en audio corto.
- Segmentación de la salida con marcas de tiempo, apta para generar subtítulos.
- Procesamiento de audio largo mediante decodificación por segmentos de 30 s, con la recomendación de desactivar `condition_on_previous_text`.
- Ejecución en CPU con `compute_type="int8"` mediante faster-whisper, además de GPU.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No tiene capacidades de visión, audio generativo ni procesamiento de texto general.
- Capacidad multilingüe limitada al comportamiento residual del modelo base: el ajuste está orientado a xitsonga y no se documentan evaluaciones en otros idiomas.

## Casos de uso

- Subtitulado de contenido audiovisual en xitsonga: el modelo genera segmentos con marcas de tiempo, lo que permite producir ficheros de subtítulos para vídeo, radio o televisión comunitaria en una lengua sin herramientas comerciales de ASR.
- Transcripción de entrevistas y trabajo de campo: investigadores sociales y lingüistas pueden transcribir grabaciones de campo en xitsonga y reutilizar la salida como base de anotación, reduciendo el tiempo de transcripción manual.
- Servicios públicos y atención ciudadana: en regiones de Sudáfrica y Mozambique donde se habla xitsonga, permite transcribir llamadas o mensajes de voz para su posterior enrutado o registro documental.
- Preservación de patrimonio oral: digitalización y transcripción de archivos de historia oral, cuentos tradicionales o material etnográfico, con salida textual indexable.
- Pre-anotación de datos para investigación en ASR de bajos recursos: sirve como generador de transcripciones iniciales que después se corrigen manualmente para ampliar corpus etiquetados en xitsonga.
- Accesibilidad: generación de subtítulos automáticos para personas con discapacidad auditiva en emisiones o actos públicos en xitsonga.
- Despliegue en entornos sin GPU: gracias a la cuantización int8 y al formato CTranslate2, puede ejecutarse en CPU en equipos modestos, clínicas rurales, radios comunitarias u oficinas sin acelerador dedicado.
- Analítica de contenido: transcripción masiva de archivos de audio para búsqueda por palabras clave, moderación o generación de índices sobre catálogos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER ni comparaciones cuantitativas con otros sistemas, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Tamaño del repositorio: 0,8 GB, correspondiente a los pesos en formato CTranslate2 con cuantización int8.
- VRAM estimada para inferencia: en el orden de 1 GB o menos con int8, coherente con el tamaño del repositorio; no se publican mediciones oficiales.
- CPU: es viable la inferencia en CPU con `device="cpu"` y `compute_type="int8"`, tal como muestra el ejemplo de uso del autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo cabe con holgura en tarjetas de consumo como la RTX 3060 o la RTX 4090, y también en A100 o H100 si se busca agregar muchas peticiones.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo, dado el reducido tamaño en int8.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (CPU y GPU). No es compatible con llama.cpp, Ollama ni vLLM, ya que el formato de pesos es CTranslate2 y la tarea es ASR, no generación de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gyorilab/whisper-large-v3-turbo-anv-tso-ct2 | no disponible (base: Whisper large-v3-turbo) | 30 s por segmento | xitsonga (decodificado como `sw`) | MIT | CTranslate2 int8 | Conversion lista para faster-whisper |
| dsfsi-anv/whisper-large-v3-turbo-anv-tso | no disponible | 30 s por segmento | xitsonga | MIT | safetensors/transformers (segun el repositorio de origen) | Modelo original del ajuste, sin cuantizar |
| Whisper large-v3-turbo (OpenAI) | no disponible | 30 s por segmento | multilingue (99 idiomas, sin token de xitsonga) | MIT | safetensors, CTranslate2, GGUF (segun distribucion) | Base generalista; sin ajuste para xitsonga |
| Whisper large-v3 (OpenAI) | no disponible | 30 s por segmento | multilingue | MIT | safetensors y otras conversiones | Mayor coste de inferencia que la variante turbo |

Los datos de rendimiento comparado, como WER por idioma, no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No existe token de idioma para xitsonga en Whisper: el modelo decodifica bajo el token de suajili (`sw`). Si no se fuerza ese idioma, la detección automática puede fallar en audios cortos.
- Bucles de repetición en audio largo si se mantiene activado `condition_on_previous_text`; el autor recomienda desactivarlo.
- Ventana de contexto de 30 segundos por segmento, lo que obliga a trocear el audio en produccion.
- Riesgo de alucinacion inherente a Whisper en tramos con silencio, ruido o solapamiento de voces, con generacion de texto plausible pero inexistente.
- Sesgos potenciales derivados del corpus de entrenamiento (African Next Voices): dominio, acentos y calidad de grabacion concretos que pueden no representar toda la variabilidad dialectal del xitsonga.
- Solo se distribuye cuantizacion int8; no hay variantes float16 o float32 en este repositorio, lo que puede afectar a la precision frente al modelo original sin cuantizar.
- Licencia MIT: permite uso comercial y modificacion, siempre conservando el aviso de copyright. No obstante, sigue siendo buena practica citar el modelo original y el dataset.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado el comportamiento en produccion.
- Ausencia total de benchmarks publicados: no hay WER de referencia para decidir su adopcion sin una evaluacion propia.
- No apto para tareas fuera del reconocimiento de voz: carece de tool calling, agentes, vision o comprension de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gyorilab/whisper-large-v3-turbo-anv-tso-ct2
- Modelo base (ajuste original de DSFSI): https://huggingface.co/dsfsi-anv/whisper-large-v3-turbo-anv-tso
- Dataset African Next Voices: https://huggingface.co/datasets/dsfsi-anv/za-african-next-voices
- CTranslate2 (herramienta de conversion): https://github.com/OpenNMT/CTranslate2
- faster-whisper (runtime recomendado): https://github.com/SYSTRAN/faster-whisper
