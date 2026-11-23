# GoranSALIH/whisper-small-kurdish-multidialect

## Resumen

GoranSALIH/whisper-small-kurdish-multidialect es un ajuste fino (fine-tuning) del modelo Whisper Small de OpenAI, publicado por el usuario GoranSALIH en Hugging Face. El nombre indica que el modelo está especializado en reconocimiento automático del habla (ASR) para el kurdo y sus distintos dialectos, una lengua con escasa representación en los sistemas ASR comerciales y en los corpus de entrenamiento de los grandes modelos multilingües.

El modelo parte de la arquitectura Whisper Small, un transformer encoder-decoder de tipo seq2seq diseñado para transcripción de audio, con 241.740.288 parámetros totales según los pesos en formato safetensors. Whisper Small original se entrenó sobre 680.000 horas de audio etiquetado y débilmente etiquetado, y esta variante redistribuye ese conocimiento hacia el dominio del kurdo mediante ajuste fino supervisado.

La relevancia del modelo reside en su carácter de recurso lingüístico para una lengua de bajos recursos, pero debe considerarse un artefacto de investigación con señales de calidad limitadas: apenas 4 descargas, 0 likes, ausencia de licencia declarada, de idiomas declarados y de pipeline especificado, y un repositorio de 99,6 GB que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.740.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas en el repo) |
| Idiomas soportados | no disponible (el nombre indica kurdo y sus dialectos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Small, un transformer encoder-decoder con atención completa que procesa espectrogramas Mel de audio de hasta 30 segundos y genera tokens de texto de forma autorregresiva. El encoder transforma el audio en representaciones latentes y el decoder produce la transcripción condicionada por tokens especiales de idioma y tarea. Los 241,7 millones de parámetros coinciden con el tamaño estándar de Whisper Small, lo que confirma que no se ha modificado la topología del modelo base.

No se dispone de información sobre el proceso de ajuste fino: ni el número de horas de audio kurdo empleadas, ni la composición del corpus, ni si se aplicaron técnicas de aumento de datos, regularización o evaluación por dialecto. Tampoco hay datos sobre el dataset de validación, la tasa de error por dialecto ni la estrategia de tokenización para caracteres específicos del kurdo. El tamaño del repositorio (99,6 GB) es desproporcionado para 241,7 millones de parámetros en precisión completa (aproximadamente 1 GB), lo que apunta a la inclusión de checkpoints intermedios, estados del optimizador o datasets de audio, sin que se pueda confirmar su contenido.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, presumiblemente orientada al kurdo y sus variantes dialectales.
- Transcripción multilingüe potencial: heredada del modelo base Whisper Small, aunque no hay confirmación de que se haya preservado en el ajuste fino.
- Traducción de voz a texto: Whisper soporta la tarea de traducción al inglés desde otros idiomas; no se confirma que esta capacidad se mantenga tras el ajuste.
- Detección de idioma: capacidad nativa de Whisper, sujeta a posible degradación por el ajuste fino.
- Marcas temporales a nivel de segmento: capacidad estándar de la familia Whisper.
- No disponible: soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio en tiempo real más allá del procesamiento por ventanas de 30 segundos.

## Casos de uso

- Transcripción de archivos de audio en kurdo para investigación lingüística: el modelo puede emplearse para generar transcripciones automáticas de corpus orales y compararlas con transcripciones humanas, facilitando estudios dialectológicos y de variación fonética.
- Subtitulado de material audiovisual en kurdo: generación de subtítulos en formato SRT/TXT a partir de vídeos o podcasts, con revisión humana posterior dado el carácter experimental del modelo.
- Digitalización de archivos sonoros de patrimonio oral: conversión de grabaciones históricas o etnográficas en kurdo a texto indexable, útil para archivos y bibliotecas.
- Preetiquetado para anotación humana: uso del modelo como primer paso en flujos de anotación supervisada, reduciendo el coste de transcripción manual en proyectos de creación de corpus.
- Sistemas de accesibilidad para hablantes de kurdo: generación de transcripciones en directo o diferidas para personas con discapacidad auditiva en entornos donde no existen soluciones comerciales para esta lengua.
- Investigación comparativa en ASR de bajos recursos: evaluación de la transferencia desde Whisper Small a una lengua de bajos recursos, como referencia para estudiar estrategias de ajuste fino y su impacto por dialecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos, más memoria para activaciones y buffers de audio (estimación orientativa de 2-4 GB en total).
- VRAM estimada en fp16: aproximadamente 0,5 GB para los pesos, con un total estimado de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3050, RTX 3060, RTX 4060 o superiores; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo modernas, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers (pipeline de ASR), faster-whisper, whisper.cpp, vLLM con soporte de audio, y exportación a ONNX si se generan los artefactos.
- Latencia y throughput: no disponibles; dependerán del hardware, de la longitud del audio y de la implementación elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoranSALIH/whisper-small-kurdish-multidialect | 241,7 M | 30 s por ventana | no disponible (kurdo por nombre) | no disponible | Hugging Face, 4 descargas |
| openai/whisper-small | 241,7 M | 30 s por ventana | multilingüe (99 idiomas) | MIT (modelo base) | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | multilingüe (99 idiomas) | MIT (modelo base) | Hugging Face, referencia ASR |
| whisper-small ajustado a otras lenguas de bajos recursos | ~241,7 M | 30 s por ventana | una lengua objetivo | variable según autor | Hugging Face, múltiples variantes |

La comparación directa con Whisper Small original es la más informativa: misma arquitectura y número de parámetros, pero sin datos públicos de evaluación que permitan cuantificar la mejora en kurdo ni la posible degradación en otros idiomas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Sin métricas publicadas: no hay WER, CER ni evaluación por dialecto, por lo que el rendimiento real es desconocido.
- Señales de madurez bajas: 4 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Riesgo de sobreajuste al corpus de ajuste: al no documentarse el dataset, es probable que el modelo funcione peor en registros, acentos o dialectos no representados.
- Posible degradación de capacidades multilingües: el ajuste fino sobre una sola lengua puede reducir el rendimiento en otros idiomas respecto al Whisper Small original.
- Repositorio de 99,6 GB: puede contener checkpoints intermedios o datos de audio con posibles implicaciones de privacidad si el corpus no está anonimizado.
- Riesgo de alucinación en ASR: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente en lenguas de bajos recursos.
- Ventana de audio limitada a 30 segundos por inferencia: requiere segmentación previa para audios largos.
- Sin información sobre sesgos: no se documenta el equilibrio de género, edad o variante dialectal del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoranSALIH/whisper-small-kurdish-multidialect
- Modelo base Whisper Small: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
