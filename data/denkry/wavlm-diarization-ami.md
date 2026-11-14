# denkry/wavlm-diarization-ami

## Resumen

WavLM-diarization-ami es un modelo de segmentación de hablantes (speaker diarization) desarrollado por el usuario denkry, que responde a la pregunta de "quién habla y cuándo" en una grabación. Se construye a partir de WavLM Base+ de Microsoft, un codificador de voz preentrenado, al que se le añade una cabeza BiLSTM de dos capas y se afina sobre el corpus de reuniones AMI. El resultado es un modelo de aproximadamente 98 millones de parámetros que opera sobre ventanas de 10 segundos y clasifica cada trama de 20 ms en una de siete clases powerset.

El modelo es relevante porque combina un codificador de voz consolidado con la pérdida powerset de pyannote, logrando un error de diarización (DER) del 14,1 % en el conjunto de test de AMI sin collar ni exclusión de solapamientos, frente al 17,7 % del pipeline pyannote 3.1 evaluado con la misma metodología. Además, se integra directamente con pyannote.audio mediante un método `diarize()` que gestiona la grabación completa, incluyendo el clustering aglomerativo de embeddings de hablante.

Su alcance es deliberadamente especializado: está entrenado únicamente con reuniones en inglés grabadas con micrófonos de diadema del corpus AMI, por lo que su rendimiento cae en otros dominios acústicos. La licencia MIT y el formato safetensors facilitan su uso comercial y su despliegue en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM Base+ (transformer convolucional) + cabeza BiLSTM de 2 capas con clasificación powerset |
| Parametros totales | 98.062.980 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 10 s de audio, con paso de 1 s en la grabación completa |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de WavLM Base+, un codificador de voz que procesa la forma de onda directamente. Sobre sus 13 salidas de capa se aplica una suma ponderada aprendida, cuyas representaciones alimentan una BiLSTM de dos capas. La cabeza produce, para cada trama de 20 ms, una distribución sobre siete clases powerset: nadie, hablante 1, hablante 2, hablante 3, hablantes 1+2, 1+3 y 2+3. Esto permite detectar hasta tres hablantes por ventana y hasta dos simultáneamente. En la modalidad de grabación completa, el modelo se desliza con paso de 1 s, calcula un embedding de voz por hablante local (con el modelo pyannote/wespeaker-voxceleb-resnet34-LM) y agrupa mediante clustering aglomerativo con los ajustes de pyannote/speaker-diarization-3.1.

El entrenamiento se realizó en dos fases sobre el split de entrenamiento de AMI (136 reuniones, 81 horas, condición `ihm` del dataset diarizers-community/ami). Primero se entrenó la cabeza con WavLM congelado durante 10 épocas; después se afinó conjuntamente WavLM y la cabeza durante 6 épocas, con tasa de aprendizaje de 1e-5 para WavLM y 1e-4 para la cabeza, manteniendo congelado el codificador convolucional de características. Se usaron fragmentos aleatorios de 10 s, ganancia aleatoria y ruido añadido, pérdida powerset invariante a permutaciones, AdamW, precisión mixta y tamaño de lote de 4 en una GPU de 6 GB.

## Capacidades

- Segmentación de hablantes a nivel de trama con resolución de 20 ms y clasificación en 7 clases powerset.
- Diarización de grabaciones completas mediante el método `diarize()`, que devuelve turnos de habla con etiquetas de hablante.
- Detección automática del número de hablantes, con opción de forzarlo mediante `num_speakers`, `min_speakers` y `max_speakers`.
- Exportación de resultados en formato RTTM estándar mediante `write_rttm()`.
- Acepta audio de cualquier duración y frecuencia de muestreo, así como tensores de forma de onda con `sample_rate=16000`.
- Detección de actividad de voz (VAD) implícita en la clase "nobody".
- Capacidad de detectar solapamiento de hasta dos hablantes simultáneos.
- No soporta tool calling, agentes, visión ni audio más allá del procesamiento de voz para diarización.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el modelo segmenta la grabación y asigna etiquetas de hablante que pueden alinearse con la salida de un sistema ASR para producir actas con intervenciones identificadas. Es adecuado porque está entrenado específicamente con reuniones del corpus AMI.
- Análisis de participación en reuniones corporativas: al generar RTTM con turnos y duraciones, permite calcular tiempos de habla por participante y detectar dinámicas de dominancia en la conversación.
- Indexación y búsqueda de archivos de audio de reuniones: la diarización previa facilita la búsqueda por hablante en archivos históricos, permitiendo localizar intervenciones concretas de una persona.
- Generación de subtítulos con identificación de interlocutor: integrado en un pipeline de ASR, el modelo aporta la etiqueta de hablante a cada segmento de subtítulo, útil en entornos de accesibilidad.
- Evaluación y benchmarking de sistemas de diarización: al estar entrenado sobre AMI y reportar DER con y sin collar, sirve como referencia reproducible para comparar pipelines propios con la métrica estándar.
- Prototipado rápido en investigación: la licencia MIT, el tamaño de 0,4 GB y la integración con pyannote.audio permiten desplegar un sistema funcional de diarización en una GPU de consumo en cuestión de minutos.
- Análisis forense de grabaciones de reuniones: la exportación a RTTM facilita la auditoría y el cruce con otras herramientas de análisis de audio.

## Benchmarks y rendimiento

Resultados sobre grabaciones completas, sin conocer el número de hablantes, en porcentaje. DER sin collar e incluyendo solapamiento; "collar" excluye 0,25 s alrededor de cada frontera de referencia; JER es la tasa de error Jaccard.

| Datos de test | DER | Missed | False alarm | Confusion | DER (collar) | JER |
|---|---|---|---|---|---|---|
| AMI test, mezcla de diadema (16 reuniones) | 14,14 | 8,30 | 2,59 | 3,25 | 9,09 | 20,43 |
| VoxConverse test (29 grabaciones) | 12,67 | 4,27 | 6,32 | 2,08 | 8,40 | 33,89 |

El pipeline pyannote 3.1, evaluado de la misma forma, obtiene 17,71 en AMI y 9,08 en las mismas grabaciones de VoxConverse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 98 millones de parámetros en precisión completa, el modelo ocupa aproximadamente 0,4 GB en pesos, más el modelo de embeddings de hablante de pyannote que se descarga en la primera llamada.
- GPU recomendadas: el autor reporta unos 6 a 7 minutos por hora de audio en una RTX 3050 de portátil; en CPU la inferencia es mucho más lenta.
- Cabe en GPU de consumo: sí, el autor menciona entrenamiento en una GPU de 6 GB y prueba en una RTX 3050.
- Opciones de despliegue: transformers con `AutoModel.from_pretrained(..., trust_remote_code=True)` y pyannote.audio; también puede usarse como modelo de segmentación puro sin pyannote. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 6-7 minutos por hora de audio en RTX 3050; sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | DER en AMI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| denkry/wavlm-diarization-ami | 98 M | ventanas de 10 s, paso de 1 s | 14,14 (sin collar) | MIT | Hugging Face |
| pyannote/speaker-diarization-3.1 | no disponible | pipeline completo | 17,71 (sin collar, misma evaluación) | no disponible | Hugging Face / pyannote.audio |
| WavLM Base+ (microsoft/wavlm-base-plus) | no disponible | no aplica (codificador) | no aplica | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado únicamente con AMI: especializado en reuniones grabadas con micrófonos de diadema. En audio de difusión, llamadas telefónicas o grabaciones ruidosas, los sistemas de propósito general entrenados con múltiples corpus rinden mejor, como refleja la fila de VoxConverse.
- Solo se detectan como máximo dos hablantes simultáneos y tres por ventana de 10 segundos.
- El afinamiento solo vio habla de reuniones en inglés; el soporte multilingüe no está validado.
- El orden de los hablantes es arbitrario dentro de cada fragmento de 10 segundos en la salida a nivel de trama.
- Requiere `trust_remote_code=True` porque la clase del modelo está en el repositorio (`modeling_wavlm_diarization.py`).
- La primera llamada descarga el modelo de embeddings de hablante pyannote/wespeaker-voxceleb-resnet34-LM, lo que añade dependencia externa y latencia inicial.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de asignaciones erróneas de hablante en tramos con solapamiento o ruido.
- No se han documentado sesgos específicos más allá de la especialización de dominio y idioma.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de las dependencias (pyannote.audio, WeSpeaker y el corpus AMI, este último bajo CC BY 4.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denkry/wavlm-diarization-ami
- Modelo base WavLM Base+: https://huggingface.co/microsoft/wavlm-base-plus
- Dataset AMI (diarizers-community): https://huggingface.co/datasets/diarizers-community/ami
- Modelo de embeddings de hablante: https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM
- Repositorio pyannote.audio: https://github.com/pyannote/pyannote-audio
- WavLM (Chen et al., 2022): https://arxiv.org/abs/2110.13900
- Powerset loss (Plaquet & Bredin, 2023): https://arxiv.org/abs/2310.13025
- WeSpeaker (Wang et al., 2023): https://arxiv.org/abs/2210.17016
