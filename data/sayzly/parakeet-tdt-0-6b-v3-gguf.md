# sayzly/parakeet-tdt-0.6b-v3-gguf

## Resumen

Parakeet TDT 0.6B v3 (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3`, publicada por el usuario `sayzly`. El modelo original, desarrollado por NVIDIA, emplea una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer) y está orientado a la transcripción de voz a texto con un total de 627.052.166 parámetros. Esta versión GGUF no modifica los pesos: únicamente los empaqueta en un contenedor optimizado para inferencia local.

La relevancia de esta ficha radica en que el autor del repositorio declara que el fichero `parakeet-tdt-0.6b-v3-Q8_0.gguf` es el que su aplicación Sayzly descarga para ejecutar el modelo. Es, por tanto, una distribución de conveniencia para integrar el ASR de NVIDIA en entornos de escritorio o servidor sin depender del formato original de PyTorch. El repositorio tiene un tamaño de 0,7 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

La licencia es CC BY 4.0, heredada del modelo base, lo que permite uso comercial con atribución. No obstante, la información publicada por el autor es mínima: no se detallan idiomas soportados, composición del dataset de entrenamiento, resultados de benchmarks ni instrucciones de uso más allá de la referencia al fichero GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), según el modelo base |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero mencionado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,7 GB |
| Pipeline | automatic-speech-recognition |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base de NVIDIA: un encoder FastConformer combinado con un decodificador TDT. El esquema TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso de decodificación y reducir la latencia en comparación con transductores clásicos. El modelo cuenta con 627 millones de parámetros, un tamaño contenido para tareas de ASR.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales más allá de lo que implica la propia arquitectura TDT. La conversión a GGUF no altera los pesos según el autor; se limita al cambio de formato de serialización. Tampoco se documenta qué herramienta se empleó para la conversión ni si se realizaron validaciones numéricas tras el cambio de formato.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) como tarea principal del pipeline declarado.
- Decodificación TDT, que emite tokens con predicción de duración y puede mejorar la eficiencia frente a transductores convencionales.
- Ejecución en formato GGUF, lo que facilita su integración en runtimes compatibles con este contenedor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio adicional ni modos de pensamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio en texto en aplicaciones de escritorio que consuman GGUF, aprovechando su tamaño de 0,6B parámetros para ejecución local.
- Subtitulado de vídeo en pipelines de posproducción: al ser un modelo ASR ligero, encaja en flujos donde se transcriba audio y se generen subtítulos con revisión humana posterior.
- Dictado por voz en herramientas de productividad: integración en editores de texto o asistentes que requieran transcripción en tiempo casi real en hardware de consumo.
- Atención al cliente con transcripción de llamadas: permite convertir grabaciones de voz en texto para su análisis, búsqueda o cumplimiento normativo, aunque sin datos publicados de precisión no puede garantizarse su idoneidad en producción regulada.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para construir índices de búsqueda sobre contenido hablado.
- Aplicaciones móviles o embebidas: el formato GGUF y el tamaño del repositorio (0,7 GB) permiten desplegar el modelo en entornos con recursos limitados, siempre que el runtime soporte la arquitectura FastConformer/TDT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 627 millones de parámetros en Q8_0, el peso de los pesos ronda los 0,6-0,7 GB, por lo que la huella de memoria es reducida, pero no se han publicado cifras de VRAM medidas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no confirmado por el autor.
- Opciones de despliegue: el autor no documenta runtimes concretos; el formato GGUF sugiere compatibilidad con herramientas que soporten esta arquitectura, sin que se detallen cuáles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sayzly/parakeet-tdt-0.6b-v3-gguf | 627.052.166 | no disponible | GGUF | cc-by-4.0 | Conversión comunitaria del modelo de NVIDIA |
| nvidia/parakeet-tdt-0.6b-v3 | 627.052.166 (según modelo base) | no disponible | no disponible | cc-by-4.0 | Modelo original de NVIDIA |
| Otras alternativas ASR | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card es mínima: no se documentan idiomas, condiciones de entrenamiento ni evaluación, lo que impide valorar su precisión real.
- Al ser una conversión comunitaria, no existe garantía oficial de NVIDIA sobre el fichero GGUF ni sobre posibles diferencias numéricas respecto al modelo original.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR; sin benchmarks publicados no puede cuantificarse.
- No se especifican sesgos conocidos ni dominios de audio problemáticos (ruido, acentos, jerga).
- La licencia CC BY 4.0 permite uso comercial con atribución a los autores originales; debe conservarse el crédito a NVIDIA y al conversor.
- El repositorio no registra descargas ni validación de la comunidad, por lo que conviene verificar la integridad del fichero antes de usarlo en producción.
- No se detalla compatibilidad con runtimes concretos; la integración puede requerir verificar que el motor soporte FastConformer/TDT en GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
