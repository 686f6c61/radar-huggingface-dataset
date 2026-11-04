# AngryBear9019/survivor-gender-resnet293

## Resumen

Survivor gender classifier (ResNet293 voice prints) es un modelo de clasificación de género a partir de voz, desarrollado por el usuario AngryBear9019 y publicado en HuggingFace. No es un modelo generativo de lenguaje, sino un sistema de dos etapas para audio: un extractor de embeddings de hablante basado en WeSpeaker ResNet293, afinado sobre voz de concursantes del programa de telerrealidad Survivor, y un clasificador logístico entrenado sobre el voice print de 256 dimensiones resultante. El problema que resuelve es la asignación automática de género por línea de diálogo en un pipeline de doblaje (subs_voiceover_vosk_tts), donde se necesita decidir qué voz sintética usar para cada intervención.

El modelo parte del checkpoint Wespeaker/wespeaker-voxceleb-resnet293-LM, un r-vector ResNet293 entrenado sobre VoxCeleb2, y lo afina con 15.930 líneas etiquetadas por subtítulos (14,4 horas, 324 personas, 218 episodios). El resultado se combina en producción con audeering/wav2vec2-large-robust-24-ft-age-gender, y solo se cambia el género de una línea cuando la media de ambos clasificadores alcanza un 0,9 de confianza en el género contrario.

Es relevante por su enfoque acotado y verificable: en lugar de un clasificador genérico, se especializa en un dominio difícil (habla espontánea, gritos en pruebas, solapamiento de voces) y reporta métricas sobre temporadas no vistas durante el entrenamiento. Su huella es pequeña (0,1 GB en el repositorio) y su licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet293 (extractor de speaker embeddings, r-vector) + regresion logistica sobre voice print de 256 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 6 s (recorte central, `max_s`), minimo 0,5 s (`min_s`), batching en buckets de 0,25 s (`bucket_s`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`avg_model.pt`) + NumPy (`gender.npz`) |

## Arquitectura y entrenamiento

La primera etapa es un ResNet293 de WeSpeaker que produce un embedding de hablante (r-vector) de 256 dimensiones a partir de una línea de audio recortada al centro a 6 segundos. Se inicializa desde el checkpoint VoxCeleb2 ResNet293-LM y se afina durante 8 épocas (se conserva la época 2) con pérdidas prototype y AAM dentro de una temporada. El conjunto de entrenamiento son 15.930 líneas auditadas con etiqueta de subtítulo, 14,4 horas de audio de 324 personas en 218 episodios; se descartaron las líneas cuyo subtítulo no coincidía con el audio (otro corte, desfase temporal o etiquetas en conflicto).

La segunda etapa es una regresión logística sobre el voice print unitario de la línea completa: `p_female = sigmoid(print @ w + b)`. Se entrena sobre 15.877 líneas de las mismas personas, con géneros inferidos de listas de reparto y nombres mediante un modelo de lenguaje y verificados por muestreo. El archivo `gender.npz` incluye los parámetros del clasificador, los ajustes de recorte y el SHA-256 del `avg_model.pt` con el que se entrenó, lo que permite verificar la correspondencia entre ambas piezas. Los pesos cargan en la clase `WeSpeakerResNet293` de pyannote mediante `model.resnet.load_state_dict(...)`.

## Capacidades

- Clasificación binaria de género (hombre/mujer) por línea de audio, con salida probabilística (`p_female`).
- Extracción de speaker embeddings de 256 dimensiones reutilizables para otras tareas de verificación o agrupación de hablantes.
- Robustez específica ante habla gritada en contextos de competición, incluyendo gritos que el ASR no transcribe.
- Funcionamiento con líneas cortas (desde 0,5 s; métricas reportadas para líneas de menos de 1,5 s).
- Integración con pyannote.audio para la parte de embeddings.
- Combinación documentada con un segundo clasificador (audeering/wav2vec2-large-robust-24-ft-age-gender) mediante media de probabilidades y umbral de 0,9.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de audio.

## Casos de uso

- Doblaje automático de telerrealidad: el pipeline subs_voiceover_vosk_tts usa este clasificador para asignar una voz sintética masculina o femenina a cada línea de subtítulo; su entrenamiento sobre gritos y habla solapada lo hace adecuado para material de competición donde los clasificadores genéricos fallan.
- Postproducción de subtítulos con etiquetado de hablante: permite anotar automáticamente el género de cada intervención para revisión humana, reduciendo el trabajo manual en episodios con decenas de concursantes.
- Filtrado previo en pipelines de ASR diarizado: al clasificar líneas cortas con precisión razonable (84,2% en líneas de menos de 1,5 s combinado con audeering), sirve para desambiguar segmentos donde la diarización asigna hablantes dudosos.
- Investigación sobre sesgos en clasificación de voz: su limitación explícita a voces que encajan en una etiqueta binaria y su dominio acotado lo convierten en un caso de estudio útil para medir cómo se comportan los embeddings de hablante en habla gritada.
- Extracción de embeddings para agrupación de hablantes en archivos de telerrealidad: el `avg_model.pt` puede usarse por separado como extractor de r-vectors en tareas de clustering o verificación dentro del mismo dominio.
- Evaluación comparativa de clasificadores de género en audio: las métricas publicadas sobre temporadas no vistas (S51 E01-E05 y Australian Survivor S10) permiten usarlo como línea base reproducible en experimentos de clasificación de atributos de hablante.

## Benchmarks y rendimiento

Resultados sobre 1.155 líneas de concursantes de temporadas no usadas en entrenamiento (Survivor US S51 E01-E05 y Australian Survivor S10), con el género de la persona nombrada en los subtítulos SDH como referencia:

| Conjunto | Clasificador previo + audeering | Este modelo + audeering | Este modelo solo |
|---|---:|---:|---:|
| Todas las líneas de concursantes | 86,1% | **87,4%** | 85,3% |
| Líneas cortas (< 1,5 s) | 82,9% | **84,2%** | 79,3% |
| Gritos no transcritos por el ASR (93) | 69,9% | **74,2%** | 71,0% |
| Gritos masculinos (55) | 72,7% | **80,0%** | 72,7% |

Corrección automática de género sobre 899 líneas de S51 con umbral 0,9, tal como se aplicaba en el doblaje: 33 líneas cambiadas, 31 corregidas y 2 empeoradas (del 86,2% al 89,4% de género correcto). El clasificador previo cambió 26 líneas: 22 corregidas y 4 empeoradas.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con unos pocos GB libres.
- GPU recomendadas: no se especifican; por el tamaño del modelo, una RTX 3060 o superior es suficiente, y la ejecución en CPU es viable para volúmenes moderados.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del checkpoint.
- Opciones de despliegue: PyTorch con pyannote.audio para cargar `WeSpeakerResNet293`; el clasificador logístico se evalúa con NumPy a partir de `gender.npz`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AngryBear9019/survivor-gender-resnet293 | ResNet293 + regresión logística | Audio (línea, 6 s) | en | cc-by-4.0 | HuggingFace |
| audeering/wav2vec2-large-robust-24-ft-age-gender | wav2vec2 con cabeceras de edad y género | Audio | en (principalmente) | no disponible en la información | HuggingFace; usado junto al modelo en el mismo pipeline |
| Wespeaker/wespeaker-voxceleb-resnet293-LM | ResNet293 r-vector (embeddings de hablante) | Audio | multilingüe (VoxCeleb) | no disponible en la información | HuggingFace; checkpoint base |

La comparación de rendimiento entre estos tres modelos solo está documentada de forma parcial: el clasificador previo combinado con audeering obtiene 86,1% en todas las líneas frente al 87,4% de este modelo combinado con audeering, según la tabla del autor. No hay datos de benchmarks para el checkpoint base en esta tarea.

## Limitaciones y advertencias

- Solo se entrenó con telerrealidad en inglés, mayoritariamente Survivor US; el dominio de aplicación es estrecho.
- No modela voces que no encajan en una etiqueta binaria de género.
- Aproximadamente uno de cada cuatro gritos sigue clasificándose mal; una voz masculina tensa y aguda puede sonar femenina.
- Las cifras de gritos y gritos masculinos se basan en pocas líneas (93 y 55), por lo que su intervalo de confianza es amplio.
- Las etiquetas de entrenamiento provienen de metadatos (subtítulos, listas de reparto y nombres inferidos por un LLM), no de escucha directa.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en voces atípicas.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que citar al autor y al modelo base WeSpeaker.
- El repositorio contiene solo pesos, sin audio; el SHA-256 en `gender.npz` debe verificarse contra `avg_model.pt` para garantizar que ambas piezas corresponden.
- En producción se recomienda el uso combinado con audeering y umbral 0,9, no el clasificador aislado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AngryBear9019/survivor-gender-resnet293
- Modelo base: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet293-LM
- Repositorio WeSpeaker: https://github.com/wenet-e2e/wespeaker
- Paper del modelo base (ResNet293 r-vector, arXiv:2210.17016): https://arxiv.org/abs/2210.17016
- Clasificador complementario: https://huggingface.co/audeering/wav2vec2-large-robust-24-ft-age-gender
- Pipeline de doblaje que lo usa: https://github.com/AngryBearr/subs_voiceover_vosk_tts
