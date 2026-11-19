# sayzly/canary-1b-flash-gguf

## Resumen

Canary 1B Flash (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/canary-1b-flash`, publicada por el usuario `sayzly`. El modelo original lo desarrolla NVIDIA y forma parte de la familia Canary, orientada a tareas de transcripción y traducción de voz con un único modelo multitarea. Esta conversión concreta no introduce cambios en los pesos: solo empaqueta el checkpoint original en GGUF para facilitar su despliegue en runtimes de inferencia ligeros.

El interés de esta ficha radica en que permite ejecutar un modelo ASR de aproximadamente 890 millones de parámetros en entornos donde el formato GGUF es el estándar de facto (llama.cpp y derivados), sin depender de las herramientas nativas de NeMo. El repositorio ocupa 1,0 GB e incluye el fichero `canary-1b-flash-Q8_0.gguf`, es decir, una cuantización de 8 bits.

La información publicada por el autor es muy escasa: no se detallan idiomas soportados, composición del dataset ni resultados de benchmarks. Todo lo que no figure en la model card o en los metadatos de Hugging Face se marca en esta ficha como «no disponible».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: nvidia/canary-1b-flash) |
| Parámetros totales | 890.042.496 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (fichero publicado: `canary-1b-flash-Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base es `nvidia/canary-1b-flash`, un sistema de reconocimiento automático del habla de la familia Canary de NVIDIA, pero esta conversión no incluye especificaciones sobre el tipo de encoder/decoder, la estrategia de atención ni la longitud máxima de audio procesable.

Tampoco se documentan los datos de entrenamiento (número de horas de audio, composición del corpus, idiomas incluidos) ni si el modelo original incorporó etapas de ajuste fino supervisado, RLHF o DPO. La model card del repositorio GGUF se limita a indicar que se trata del fichero que el autor descarga para Canary 1B Flash, que los pesos no se han modificado más allá de la conversión de formato y que la licencia es la misma que la del modelo original (CC BY 4.0).

## Capacidades

- Reconocimiento automático del habla (speech-to-text), según el `pipeline_tag` del repositorio.
- Conversión de audio a texto en formato GGUF, pensada para runtimes compatibles con este formato.
- No se documentan capacidades de traducción voz-a-texto, diarización, timestamps por palabra ni detección de idioma en la información disponible.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking mode, visión, audio adicional) más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: al ser un modelo ASR de ~890 M de parámetros en GGUF, puede desplegarse en servidores modestos para convertir grabaciones internas en texto sin depender de servicios en la nube.
- Subtitulado de vídeo bajo demanda: integrado en un pipeline que extrae audio y llama al modelo, permite generar subtítulos en lote para archivos multimedia almacenados.
- Procesamiento por lotes de archivos de audio: el formato GGUF facilita la ejecución con runtimes de inferencia ligeros, adecuado para trabajos programados que transcriben grandes volúmenes de grabaciones.
- Prototipado rápido de aplicaciones de voz: al ser una conversión directa del modelo de NVIDIA, sirve para validar productos de transcripción antes de invertir en infraestructura más pesada.
- Despliegue en entornos con recursos limitados: el tamaño del repositorio (1,0 GB) y la cuantización Q8_0 permiten ejecutarlo en máquinas sin GPUs de gama alta, siempre que el runtime soporte el modelo.
- Investigación en ASR: útil como línea base reproducible para comparar técnicas de cuantización o de post-procesado sobre un modelo de referencia de NVIDIA.
- Transcripción en aplicaciones de accesibilidad: convertir audio a texto para personas con discapacidad auditiva en entornos donde no se puede usar un servicio externo por requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~890 M de parámetros en Q8_0 requiere del orden de 1 GB para los pesos, más el overhead del runtime y del procesamiento de audio; esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. No hay indicaciones del autor sobre GPUs validadas.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, cabría en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: el formato GGUF sugiere runtimes compatibles con dicho formato (llama.cpp y derivados), si bien no se detalla en la model card qué runtime concreto se ha probado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/canary-1b-flash-gguf | 890.042.496 | no disponible | GGUF (Q8_0) | CC BY 4.0 | Hugging Face |
| nvidia/canary-1b-flash | no disponible en esta ficha | no disponible | no disponible | CC BY 4.0 | Hugging Face (modelo base) |
| Otras alternativas ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La model card es mínima: no se documentan sesgos conocidos, tasas de error ni dominios de evaluación.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos ASR, este riesgo se manifiesta como transcripciones inventadas o sustituciones en audio con ruido, pero no hay datos específicos para este modelo.
- Idiomas soportados: no disponibles; no se puede garantizar el rendimiento en castellano ni en otros idiomas sin validación propia.
- Limitaciones de contexto: no se especifica la duración máxima de audio procesable.
- Licencia: CC BY 4.0 permite uso comercial con atribución; es obligatorio acreditar a los autores originales (NVIDIA) y al conversor, y no se pueden aplicar restricciones adicionales.
- Producción: al tratarse de una conversión de terceros con cero descargas y sin validación publicada, conviene verificar la integridad de los pesos y ejecutar pruebas propias antes de desplegarlo.
- No hay garantía de soporte ni mantenimiento por parte del autor de la conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/canary-1b-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-flash
