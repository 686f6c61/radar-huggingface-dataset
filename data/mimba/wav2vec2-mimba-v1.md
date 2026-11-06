# mimba/wav2vec2-mimba-v1

## Resumen

mimba/wav2vec2-mimba-v1 es un modelo de reconocimiento automático del habla (ASR) desarrollado por mimba, un fine-tuning del conocido facebook/wav2vec2-xls-r-300m. El modelo está especializado en cuatro idiomas: portugués (plt), francés (fr), inglés (en) y, de forma destacada, mfe, que corresponde al criollo mauriciano (Mauritian Creole). Se distribuye bajo una licencia propietaria denominada "mimba-proprietary" y requiere acceso restringido mediante aceptación de condiciones en Hugging Face.

El modelo hereda la arquitectura transformer de wav2vec2 con 315.637.570 parámetros, entrenado originalmente sobre audio sin etiquetar multilingüe (XLS-R) y posteriormente ajustado por mimba para transcripción de voz en los idiomas indicados. Su relevancia radica en la inclusión del criollo mauriciano, un idioma de bajos recursos con escasa representación en modelos ASR públicos, lo que lo convierte en una pieza poco común para aplicaciones de voz en Mauricio y su diáspora.

El repositorio ocupa 98,9 GB, un tamaño desproporcionado para los parámetros del modelo, lo que sugiere la presencia de múltiples checkpoints, estados del optimizador u otros artefactos de entrenamiento. A fecha de la información disponible no registra descargas ni interacciones públicas, y su acceso está restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder sobre representaciones convolucionales de audio) |
| Parametros totales | 315.637.570 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la longitud de la señal, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | plt (portugués), mfe (criollo mauriciano), fr (francés), en (inglés) |
| Licencia | mimba-proprietary (licencia propietaria, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un encoder transformer que procesa representaciones latentes extraídas de la forma de onda de audio mediante capas convolucionales. Parte del checkpoint facebook/wav2vec2-xls-r-300m, un modelo preentrenado de forma autosupervisada sobre audio multilingüe sin etiquetar (el corpus XLS-R), lo que le proporciona una base robusta para el ajuste fino en tareas ASR. El fine-tuning realizado por mimba adapta dicho encoder a la transcripción en los cuatro idiomas declarados.

No se dispone de información publicada sobre el volumen de datos de entrenamiento, la composición del dataset de ajuste fino, ni sobre el uso de técnicas de alineación como RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El tamaño del repositorio (98,9 GB) sugiere que se han subido checkpoints intermedios o estados de entrenamiento junto con los pesos finales, pero este extremo no está confirmado en la información disponible.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en portugués, criollo mauriciano, francés e inglés.
- Procesamiento de audio en formato de onda mediante el extractor de características propio de wav2vec2.
- Ajuste específico para el criollo mauriciano, idioma de bajos recursos poco cubierto por modelos ASR generalistas.
- Soporte multilingüe limitado a los cuatro idiomas declarados; no se garantiza cobertura de otros.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplicable a un modelo ASR puro).
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento (thinking mode).

## Casos de uso

- Transcripción de reuniones y llamadas en francés e inglés para empresas con operaciones en Mauricio: el modelo puede convertir audio de conversaciones multilingües en texto para actas y búsqueda posterior, aprovechando su ajuste específico en fr y en.
- Subtitulado automático de contenido audiovisual en criollo mauriciano: al ser uno de los pocos modelos ASR que declara soporte para mfe, resulta adecuado para medios locales, televisiones y creadores de contenido que necesitan subtítulos en ese idioma.
- Atención al cliente por voz en portugués: integración en sistemas IVR o centros de contacto para transcribir y enrutar llamadas de hablantes de portugués, usando la cobertura plt del modelo.
- Archivado y digitalización de fondos sonoros históricos en Mauricio: transcripción de grabaciones en francés y criollo para su catalogación y consulta textual en archivos y bibliotecas.
- Investigación lingüística sobre el criollo mauriciano: generación de transcripciones a escala para corpus de estudio, análisis fonético y desarrollo de recursos para una lengua con escasa representación tecnológica.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de contenido en los cuatro idiomas soportados, siempre que se valide la latencia en el despliegue concreto.
- Preprocesado de audio para pipelines de NLP: conversión de entrevistas o encuestas de voz a texto en portugués y francés como paso previo a análisis de sentimiento o extracción de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB para los 315,6 M de parámetros; en fp16 alrededor de 0,65 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en precisión completa; una NVIDIA T4, RTX 3060 o superior es suficiente para uso en producción moderada.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, dado el reducido tamaño del modelo.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), así como exportación a ONNX o uso con bibliotecas de inferencia compatibles con wav2vec2. No se documenta soporte específico para vLLM, llama.cpp u Ollama, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Acceso |
|---|---|---|---|---|
| mimba/wav2vec2-mimba-v1 | 315,6 M | plt, mfe, fr, en | mimba-proprietary | Restringido (gated) |
| facebook/wav2vec2-xls-r-300m | 315,6 M | Multilingüe (XLS-R) | Apache 2.0 (modelo base original) | Abierto |
| openai/whisper-small | 244 M | Multilingüe (~99 idiomas) | Apache 2.0 | Abierto |
| openai/whisper-base | 74 M | Multilingüe (~99 idiomas) | Apache 2.0 | Abierto |

La comparación con whisper-small y whisper-base es pertinente por categoría (ASR de tamaño pequeño-medio), aunque no se dispone de métricas comparativas de WER en la información proporcionada. La principal diferencia de mimba/wav2vec2-mimba-v1 frente a alternativas abiertas es su ajuste específico para el criollo mauriciano y su licencia propietaria con acceso restringido.

## Limitaciones y advertencias

- Licencia propietaria "mimba-proprietary": el uso comercial requiere revisar y aceptar las condiciones del autor; no es una licencia de código abierto.
- Acceso restringido (gated): es necesario solicitar acceso en Hugging Face y aceptar las condiciones antes de descargar los pesos.
- Cobertura lingüística limitada a cuatro idiomas; el rendimiento fuera de ellos no está garantizado.
- No se han publicado métricas de WER ni evaluaciones independientes, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido, acentos marcados o vocabulario especializado.
- Posibles sesgos derivados de los datos de ajuste fino, cuya composición no se documenta; puede haber peor rendimiento en determinados dialectos o registros.
- El tamaño del repositorio (98,9 GB) puede implicar descargas largas y almacenamiento considerable; conviene verificar qué artefactos incluye antes de desplegar.
- Sin descargas ni validación comunitaria: no hay evidencia pública de uso en producción que respalde su fiabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/mimba/wav2vec2-mimba-v1
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper de wav2vec 2.0 (referencia de arquitectura): https://arxiv.org/abs/2006.11477
- Paper de XLS-R (referencia del preentrenamiento multilingüe): https://arxiv.org/abs/2111.09296
