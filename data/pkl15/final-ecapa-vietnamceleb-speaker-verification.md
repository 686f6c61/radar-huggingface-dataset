# pkl15/final-ecapa-vietnamceleb-speaker-verification

## Resumen

`pkl15/final-ecapa-vietnamceleb-speaker-verification` es un modelo de verificación de hablante (speaker verification) basado en la arquitectura ECAPA-TDNN, fine-tuneado sobre el dataset Vietnam-Celeb para adaptarse al vietnamita. El modelo parte del checkpoint preentrenado `speechbrain/spkrec-ecapa-voxceleb` de SpeechBrain, y se ha ajustado durante 10 épocas sobre un corpus de 87 000 utterances de 1 000 hablantes vietnamitas que cubren los tres dialectos principales del país. El resultado es un sistema de embeddings de hablante de 192 dimensiones que opera a 16 kHz.

La relevancia de este modelo reside en que aborda una lengua con poca representación en los sistemas de verificación de hablante disponibles públicamente. Su pipeline de inferencia incluye un VAD CRDNN, extracción de embeddings ECAPA-TDNN, normalización L2, enrollment con 5 grabaciones por hablante y decisión por similitud coseno con un umbral calibrado en desarrollo (0,1566). El autor lo presenta como prototipo académico, no como sistema de producción, y la evaluación con protocolo all-impostor muestra una mejora sustancial del EER respecto al modelo base (del 11,91 % al 8,42 % en el conjunto de test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (fine-tuning); el modelo base soporta multiples idiomas |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en ECAPA-TDNN (Enhanced Channel Attention, Propagation and Aggregation in Time-Delay Neural Network), una arquitectura desarrollada por SpeechBrain para extraer embeddings de hablante. El checkpoint original se entrenó sobre VoxCeleb 1 y VoxCeleb 2 y se ha fine-tuneado aquí sobre el dataset Vietnam-Celeb, que contiene más de 87 000 utterances de 1 000 hablantes vietnamitas de diversas profesiones y tres dialectos principales (norte, centro y sur). El autor seleccionó la época 10 del fine-tuning como checkpoint final, con un embedding de 192 dimensiones y una frecuencia de muestreo de 16 kHz.

El pipeline de verificación es el siguiente: el audio pasa por un VAD CRDNN para detectar segmentos de voz, luego se extrae el embedding ECAPA-TDNN, se normaliza con L2, se hace enrollment con 5 grabaciones por hablante calculando el centroide medio, y finalmente se compara con la similitud coseno contra un umbral calibrado en el conjunto de desarrollo (DEV). El umbral final es 0,1566 y no se ajustó en el conjunto de test para evitar fugas de información.

## Capacidades

- Verificación de hablante (speaker verification) basada en embeddings de 192 dimensiones.
- Extracción de embeddings de hablante reutilizables para tareas de reconocimiento y clustering.
- Pipeline completo de inferencia que incluye VAD CRDNN y decisión por similitud coseno.
- Soporte de enrollment con múltiples grabaciones (5 por hablante en el protocolo de evaluación).
- Funciona a 16 kHz, frecuencia estándar en sistemas de voz.
- Específico para vietnamita, aunque el modelo base puede generalizar a otros idiomas.

## Casos de uso

- **Autenticación biométrica por voz en aplicaciones móviles**: el modelo puede verificar la identidad de un usuario comparando su voz en tiempo real con las grabaciones de enrollment almacenadas. Su embedding de 192 dimensiones y el umbral de decisión ajustado lo hacen adecuado para prototipos de login por voz.
- **Control de acceso a servicios telefónicos**: integrado en IVR o centros de atención, permite validar al cliente mediante la voz antes de acceder a datos sensibles, usando el pipeline de VAD y similitud coseno para decisión en tiempo real.
- **Investigación académica en verificación de hablante**: sirve como punto de partida para estudios sobre el efecto del fine-tuning en lenguas de bajos recursos, ya que se publican los datos de evaluación (DEV y TEST) con protocolo all-impostor.
- **Indexación y búsqueda de hablantes en audios**: los embeddings pueden extraerse de cada utterance y usarse para clustering o búsqueda de quién habla en cada segmento, útil en transcripción de reuniones o archivado de grabaciones.
- **Prototipos de seguridad biométrica**: en entornos controlados (laboratorio, demo), el modelo puede integrarse en un sistema de acceso físico o lógico donde se requiera verificación de identidad por voz, siempre que se acepte un EER del 8,42 %.
- **Evaluación de robustez en entornos ruidosos**: dado que Vietnam-Celeb se grabó en condiciones ruidosas y espontáneas, el modelo es útil para probar sistemas de verificación en escenarios realistas con degradación de calidad.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación con protocolo all-impostor sobre un conjunto de test con 50 hablantes no vistos, 5 grabaciones de enrollment por hablante, 698 trials genuinos y 34 202 trials impostores. No hay solapamiento de hablantes entre entrenamiento, DEV y TEST. El umbral se calibró solo en DEV.

| Modelo | DEV EER | TEST EER | TEST FAR | TEST FRR |
|---|---:|---:|---:|---:|
| ECAPA preentrenado (VoxCeleb) | 13,30 % | 11,91 % | 9,46 % | 13,47 % |
| Fine-tuned Epoch 10 (Vietnam-Celeb) | 9,98 % | 8,42 % | 9,00 % | 7,88 % |

Los resultados muestran una mejora del EER en test del 3,49 puntos porcentuales respecto al modelo base. El FAR de test (9,00 %) indica que el sistema no es adecuado para entornos de seguridad de producción, como advierte el propio autor.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación, pero al ser un modelo de tamaño reducido (repo de 0,1 GB) es compatible con GPUs de consumo. Un ECAPA-TDNN típico tiene del orden de 20-30 millones de parámetros, por lo que la inferencia puede ejecutarse en CPU con bajo consumo de memoria (menos de 1 GB de RAM).
- **GPU recomendadas**: no requiere GPU; cualquier CPU moderna es suficiente para inferencia en tiempo real. Si se quiere acelerar, una GPU de gama media (RTX 3060 o superior) ofrece latencias muy bajas.
- **Opciones de despliegue**: el modelo está integrado en SpeechBrain, por lo que se puede desplegar con su pipeline de inferencia, o exportar los embeddings y usar frameworks como TensorRT u ONNX si se convierte el checkpoint.
- **Latencia**: no se proporcionan datos, pero con un ECAPA-TDNN en CPU la extracción de un embedding de 5 segundos de audio suele completarse en menos de 100 ms en hardware moderno.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset de entrenamiento | Idiomas | EER (test) | Licencia |
|---|---|---|---|---|---|
| `speechbrain/spkrec-ecapa-voxceleb` | ECAPA-TDNN | VoxCeleb 1+2 | Multilingue (inglés) | 11,91 % (en este test vietnamita) | Apache 2.0 |
| `pkl15/final-ecapa-vietnamceleb-speaker-verification` | ECAPA-TDNN | Vietnam-Celeb | Vietnamita | 8,42 % | no disponible |
| Modelos de verificación de hablante del estado del arte (p. ej. ResNet, WavLM) | varias | varios | varios | no disponible | no aplica |

La comparación directa solo es posible con el modelo base, ya que no se han publicado resultados para otros modelos en el mismo protocolo de evaluación. El fine-tuning mejora claramente el EER en vietnamita frente al modelo preentrenado.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es un prototipo académico y que el FAR no es suficientemente bajo para seguridad de producción.
- El rendimiento puede degradarse con calidad de micrófono variable, ruido de fondo, idioma distinto al vietnamita, duración corta de las grabaciones y características del hablante.
- La licencia del modelo no está especificada, lo que impide usos comerciales sin autorización previa.
- El dataset Vietnam-Celeb se recopiló bajo condiciones ruidosas y espontáneas, lo que puede introducir sesgos en la evaluación.
- El umbral de decisión (0,1566) está calibrado solo en el conjunto de desarrollo; en producción habría que recalibrarlo con datos del entorno real.
- No se proporcionan datos sobre el número total de parámetros, cuantización o soporte para otras lenguas que no sean vietnamita.

## Enlaces

- HuggingFace: https://huggingface.co/pkl15/final-ecapa-vietnamceleb-speaker-verification
- Dataset Vietnam-Celeb (HuggingFace): https://huggingface.co/datasets/hustep-lab/Vietnam-Celeb
- Repositorio oficial del dataset (GitHub): https://github.com/jazzDung/Vietnam-Celeb.Interspeech
- Paper Vietnam-Celeb (Semantic Scholar): https://www.semanticscholar.org/paper/Vietnam-Celeb:-a-large-scale-dataset-for-Vietnamese-Pham-Nguyen/8b673225d277d3928dab3c1725210040c6ea34df
- Modelo base SpeechBrain: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
