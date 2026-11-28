# Deep-07/whisper-hindi-small-disfluency-v3

## Resumen

`Deep-07/whisper-hindi-small-disfluency-v3` es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario Deep-07. Se trata de un ajuste fino (fine-tuning) de la arquitectura Whisper en su variante "small", orientado, según el nombre del repositorio, a la transcripción de hindi con tratamiento de disfluencias (repeticiones, muletillas y falsos comienzos propios del habla espontánea). El repositorio contiene 241.734.912 parámetros en formato safetensors y ocupa aproximadamente 1,0 GB, lo que es coherente con el tamaño del checkpoint original de Whisper small.

El modelo se distribuye exclusivamente con la librería `transformers` y está etiquetado como compatible con endpoints de Hugging Face. La model card ha sido generada automáticamente y no contiene información sustantiva: no documenta datos de entrenamiento, hiperparámetros, evaluación ni procedencia del ajuste fino. Tampoco se declara licencia ni lista de idiomas soportados, lo que limita seriamente su evaluación previa a un uso en producción.

Su relevancia es, por tanto, acotada y experimental: resulta interesante como ejemplo de especialización de Whisper para una lengua de bajos recursos como el hindi y para el fenómeno concreto de las disfluencias, pero la ausencia de documentación, de métricas y de licencia lo sitúa en la categoría de artefacto de investigación no validado. Cualquier adopción debería ir precedida de una evaluación propia sobre datos representativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), variante "small" |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via transformers/bitsandbytes o conversion a GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere hindi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un modelo encoder-decoder basado en transformer que procesa espectrogramas Mel de audio y genera tokens de texto de forma autorregresiva. La variante "small" de Whisper emplea 12 capas de encoder y 12 de decoder, con una dimensión de modelo de 768 y 12 cabezas de atención, lo que da lugar a los aproximadamente 242 millones de parámetros que confirma el recuento de safetensors. El modelo procesa ventanas de audio de 30 segundos y fue diseñado originalmente por OpenAI para transcripción multilingüe y traducción de voz.

No hay información en la model card sobre el proceso de ajuste fino: se desconoce el corpus utilizado, si se emplearon datos con anotaciones de disfluencias, el número de tokens o horas de audio, la técnica de entrenamiento (full fine-tuning frente a LoRA), los hiperparámetros o si se aplicaron etapas de alineación. El nombre del repositorio indica un ajuste orientado a hindi y a disfluencias, en su tercera iteración ("v3"), pero no se aporta ninguna evidencia documental de ello. Tampoco se describe ninguna innovación técnica adicional más allá del ajuste fino.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto mediante el pipeline `automatic-speech-recognition` de `transformers`.
- Especialización probable en hindi: el identificador del repositorio apunta a un ajuste para esta lengua, aunque no se documenta de forma explícita.
- Tratamiento de disfluencias: el nombre sugiere que el modelo ha sido entrenado para manejar repeticiones, muletillas y falsos comienzos en habla espontánea.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- Capacidades multilingües: no documentadas; al derivar de Whisper small, podría conservar parte del comportamiento multilingüe original, pero no hay confirmación.
- Tool calling, agentes, razonamiento multi-paso, visión o audio más allá de ASR: no disponibles; el modelo es exclusivamente de transcripción de voz.

## Casos de uso

- Transcripción de entrevistas en hindi: el modelo puede convertir grabaciones de habla espontánea en texto, y su orientación a disfluencias resulta adecuada para entrevistas donde los hablantes repiten o reformulan frases. Requiere validación previa con muestras reales del dominio.
- Subtitulado de contenido audiovisual en hindi: dado su tamaño reducido, puede ejecutarse sobre GPUs modestas para generar subtítulos de vídeos, aunque la ventana de 30 segundos de Whisper obliga a segmentar el audio.
- Preprocesado de corpus para NLP: útil para generar transcripciones que alimenten pipelines posteriores de análisis de sentimiento, extracción de entidades o resumen en hindi, siempre que la calidad se valide empíricamente.
- Investigación sobre disfluencias: sirve como punto de partida para estudiar la eliminación o el etiquetado de repeticiones y muletillas en lenguas de bajos recursos, comparándolo con el Whisper small original.
- Prototipado de asistentes de voz en hindi: al ser un modelo pequeño, permite iterar rápidamente en entornos de desarrollo con recursos limitados antes de escalar a modelos mayores.
- Transcripción en el borde (edge): con cuantización a int8 o int4 podría ejecutarse en hardware de consumo, habilitando dictado o notas de voz offline en dispositivos con GPU integrada, aunque el rendimiento real no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1 GB de pesos más memoria de activaciones (en torno a 2-3 GB en total); en fp16, alrededor de 0,5 GB de pesos; en int8, unos 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1060 6 GB en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con el pipeline de ASR, `optimum` para exportación a ONNX, `whisper.cpp` o `llama.cpp` tras conversión a GGUF (no documentada por el autor), y endpoints de Hugging Face.
- Latencia y throughput: no disponibles; al tratarse de Whisper small, se espera un throughput alto en GPU (varias decenas de veces tiempo real en una GPU moderna), pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep-07/whisper-hindi-small-disfluency-v3 | 241,7 M | 30 s (heredado de Whisper) | no disponible (probable hindi) | no disponible | Hugging Face |
| openai/whisper-small | 241,7 M | 30 s | multilingue (99 idiomas) | MIT (modelo original) | Hugging Face, OpenAI |
| openai/whisper-medium | 769 M | 30 s | multilingue | MIT | Hugging Face, OpenAI |
| ai4bharat/indicwhisper (small) | ~241 M | 30 s | hindi e idiomas indios | no disponible en la informacion | Hugging Face |

La comparación con el Whisper small original es la más directa: mismo tamaño y arquitectura, pero el modelo de OpenAI cuenta con documentación completa, licencia MIT y evaluación publicada. El ajuste de Deep-07 podría mejorar en hindi y disfluencias, pero no hay datos que lo confirmen. Frente a IndicWhisper, especializado en lenguas indias, la falta de documentación del modelo analizado impide una comparación rigurosa.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, evaluación, sesgos ni limitaciones, lo que impide evaluar su calidad de forma objetiva.
- Licencia no disponible: no se puede asumir uso comercial; es imprescindible contactar con el autor o verificar los términos antes de cualquier despliegue en producción.
- Idiomas no declarados: aunque el nombre apunta al hindi, no se especifica qué variedades o registros cubre ni si conserva capacidades multilingües.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente con ruido, acentos no vistos o audio musical.
- Sesgos desconocidos: al no documentarse el corpus de ajuste fino, se desconoce la distribución de hablantes, géneros, edades o acentos representados.
- Ventana de contexto limitada: hereda los 30 segundos de Whisper, por lo que requiere segmentación para audios largos.
- Sin métricas: no hay WER publicado, ni comparación con el modelo base, lo que hace imposible estimar la mejora real del ajuste.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad y procedencia del artefacto antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deep-07/whisper-hindi-small-disfluency-v3
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
