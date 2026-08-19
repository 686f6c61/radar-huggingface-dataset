# pyannote/segmentation-3.0

## Resumen

pyannote/segmentation-3.0 es un modelo de segmentación de hablantes desarrollado por el equipo de pyannote (Hervé Bredin y colaboradores) dentro del ecosistema pyannote.audio. Procesa fragmentos de 10 segundos de audio mono muestreado a 16 kHz y produce una matriz de probabilidades por fotograma y por clase, donde las clases representan ausencia de voz, presencia de uno de hasta tres hablantes y sus combinaciones de solapamiento. Este modelo resuelve el problema de la diarización de hablantes a nivel de segmento corto, proporcionando una base sobre la que construir pipelines completos de diarización, detección de actividad de voz (VAD) y detección de habla solapada.

La relevancia actual del modelo radica en su enfoque innovador: utiliza una codificación *powerset* multi-clase que permite modelar explícitamente el solapamiento de hasta dos hablantes simultáneos en un mismo fotograma, algo que los modelos tradicionales de segmentación binaria no capturan. Fue presentado en Interspeech 2023 y entrenado con una combinación de nueve conjuntos de datos públicos de audio, lo que le confiere una cobertura multilingüe y multi-entorno amplia. Aunque el acceso en HuggingFace está restringido (requiere aceptar condiciones), la licencia es MIT y el modelo permanece open-source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal entrenada con pyannote.audio 3.0.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 segundos de audio (ventana fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, entrenado con datos multilingües: AISHELL, AliMeeting, AMI, etc.) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch, .pt o .bin) |

## Arquitectura y entrenamiento

El modelo implementa una segmentación de hablantes basada en una red neuronal que procesa 10 segundos de audio mono a 16 kHz y devuelve una matriz de dimensiones `(num_frames, num_classes)` con 7 clases: no-habla, hablante 1, hablante 2, hablante 3, hablantes 1 y 2, hablantes 1 y 3, y hablantes 2 y 3. La innovación principal es la codificación *powerset* multi-clase, que permite representar simultáneamente la presencia de hasta dos hablantes por fotograma, en lugar de una salida binaria por hablante. Esta técnica se describe en el paper "Powerset multi-class cross entropy loss for neural speaker diarization" (Plaquet y Bredin, Interspeech 2023).

El entrenamiento se realizó con pyannote.audio 3.0.0 por Séverin Baroudi, utilizando la combinación de los conjuntos de entrenamiento de AISHELL, AliMeeting, AMI, AVA-AVD, DIHARD, Ego4D, MSDWild, REPERE y VoxConverse. No se han publicado detalles sobre el número total de parámetros, la arquitectura exacta (número de capas, tipo de atención, etc.) ni el proceso de optimización más allá de la función de pérdida *powerset*.

## Capacidades

- Segmentación de hablantes en fragmentos de 10 segundos, identificando hasta 3 hablantes distintos y sus solapamientos (máximo 2 hablantes simultáneos por fotograma).
- Detección de actividad de voz (VAD) mediante el pipeline `VoiceActivityDetection` de pyannote.audio, que filtra regiones de habla y silencio según umbrales configurables.
- Detección de habla solapada (overlapped speech detection) mediante el pipeline `OverlappedSpeechDetection`, que identifica regiones donde dos o más hablantes hablan a la vez.
- Resegmentación de diarizaciones existentes, gracias a su capacidad de refinar límites de segmentos y corregir solapamientos.
- No es un modelo de generación de texto ni de comprensión del lenguaje; su salida es exclusivamente una matriz de probabilidades sobre clases de hablante.

## Casos de uso

- Diarización de reuniones y conferencias: el modelo se integra en el pipeline `pyannote/speaker-diarization-3.0` para asignar turnos de palabra a cada participante en grabaciones largas, combinando la segmentación con un modelo de embeddings de hablante.
- Transcripción automática de llamadas de atención al cliente: al detectar cuándo habla el agente y cuándo el cliente, se puede separar el audio y transcribir cada canal por separado, mejorando la precisión de los sistemas de speech-to-text.
- Análisis de entrevistas y podcasts: permite etiquetar automáticamente quién habla en cada momento, facilitando la generación de subtítulos o resúmenes por interlocutor.
- Moderación de contenido audiovisual: detección de habla solapada en programas de debate o tertulias para identificar momentos de interrupción o conflicto.
- Investigación en psicolingüística: análisis de conversaciones naturales donde el solapamiento de turnos es un indicador de dinámicas sociales; el modelo proporciona anotaciones fiables a escala.
- Mejora de sistemas de subtitulado en directo: al conocer los intervalos de habla de cada persona, se pueden sincronizar mejor los subtítulos y asignar colores distintos a cada hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de Interspeech 2023 describe la metodología y la pérdida *powerset*, pero no se incluyen tablas comparativas con otros modelos en la documentación consultada.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware, VRAM o latencia.
- Dado que el modelo procesa fragmentos de 10 segundos de audio, es razonable asumir que puede ejecutarse en CPU para inferencia por lotes pequeños, aunque no hay datos confirmados.
- Para integración en pipelines de diarización completos (como `pyannote/speaker-diarization-3.0`), se recomienda una GPU con al menos 4-8 GB de VRAM si se procesan grabaciones largas, pero esto depende del pipeline completo y no solo de este modelo.
- Opciones de despliegue: pyannote.audio ofrece integración con PyTorch, y el modelo puede usarse con `Model.from_pretrained`. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia optimizados, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de segmentación de hablantes (por ejemplo, los basados en clustering espectral o en redes recurrentes). El propio ecosistema pyannote ofrece alternativas como `pyannote/segmentation-2.0` (anterior) o el pipeline `pyannote/speaker-diarization-3.0`, pero no se han encontrado datos comparativos de rendimiento entre ellos en la documentación consultada.

## Limitaciones y advertencias

- El modelo solo procesa fragmentos de 10 segundos de audio; no puede realizar diarización de grabaciones completas por sí mismo. Es necesario combinarlo con un pipeline de diarización que gestione la ventana deslizante y la agregación de resultados.
- El número máximo de hablantes simultáneos por fotograma está limitado a 2, y el número total de hablantes por fragmento a 3. Grabaciones con más de 3 interlocutores activos en el mismo segmento no se modelan correctamente.
- El acceso al modelo en HuggingFace está restringido (gated): es necesario aceptar las condiciones de uso y proporcionar datos personales (empresa/universidad y sitio web) antes de poder descargarlo, a pesar de la licencia MIT.
- No se han documentado sesgos específicos, pero al entrenarse con conjuntos de datos mayoritariamente en inglés, chino y otros idiomas representados, el rendimiento puede degradarse en lenguas o acentos poco representados.
- Riesgo de alucinación: al ser un modelo discriminativo (no generativo), no produce texto inventado, pero puede generar falsos positivos de habla o solapamiento en entornos con ruido o música de fondo.
- Para uso en producción, se recomienda validar el modelo en el dominio objetivo y ajustar los hiperparámetros de los pipelines (como `min_duration_on` y `min_duration_off`) para evitar segmentos espurios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyannote/segmentation-3.0
- Paper (Interspeech 2023): https://www.isca-speech.org/archive/interspeech_2023/plaquet23_interspeech.html
- Repositorio companion de entrenamiento: https://github.com/FrenchKrab/IS2023-powerset-diarization/
- Repositorio de pyannote.audio: https://github.com/pyannote/pyannote-audio
- Pipeline de diarización completo: https://huggingface.co/pyannote/speaker-diarization-3.0
