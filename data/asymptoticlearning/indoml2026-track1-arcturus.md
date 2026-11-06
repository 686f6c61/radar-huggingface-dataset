# asymptoticlearning/IndoML2026-Track1-Arcturus

## Resumen

IndoML2026-Track1-Arcturus es un sistema de deteccion de eventos sonoros (sound event detection, SED) presentado por el equipo Arcturus al Datathon IndoML 2026, en la pista 1 dedicada a la deteccion de eventos de ruido sobre grabaciones de campo del corpus Vaani. No es un modelo fundacional generativo, sino un ensemble de checkpoints de inferencia que predicen el inicio (onset) y el fin (offset) de cada evento de ruido en audio de campo, con resolucion temporal de 10 ms.

El sistema combina diez detectores a nivel de trama construidos sobre tres backbones preentrenados de audio (ATST-Frame, BEATs y Dasheng-base), cada uno con una cabeza Conformer, y una segunda etapa a nivel de evento que decide que candidatos conservar o fusionar mediante cinco refinadores de fronteras, verificadores basados en gradient boosting y un detector estilo DETR. El repositorio de Hugging Face ocupa 4,3 GB y contiene los 20 ficheros de checkpoint necesarios para reproducir la inferencia.

Su relevancia es doble: por un lado documenta el estado del arte practico en una tarea de segmentacion temporal de audio de dominio especifico (audio de campo indio, con ruido real y sintetico); por otro, publica un pipeline completo y reproducible bajo licencia MIT con verificacion sha256, lo que facilita su reutilizacion como linea base en tareas de deteccion de eventos acusticos con requisitos estrictos de localizacion temporal. El resultado de la fase 2 fue un Combined de 1,5893 (Event F1 0,7691 y Segment Dice 0,8202), que le valio el octavo puesto en la clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de detectores frame-level (ATST-Frame, BEATs, Dasheng-base) con cabezas Conformer + etapa event-level (refinadores de fronteras, GBMs, detector estilo DETR) |
| Parametros totales | no disponible (pesos distribuidos en 20 checkpoints; tamanos individuales entre 0,0 y 369,7 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en tramas de 10 ms; ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (tarea de audio; los metadatos no declaran idiomas) |
| Licencia | MIT (checkpoints); backbones: ATST-Frame MIT, BEATs MIT, Dasheng Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch), `.pkl` (GBMs y PCAs), `.json` (tabla de correccion de bordes), `.pt` (inicializacion de backbones) |

## Arquitectura y entrenamiento

El sistema es un ensemble en dos etapas. La primera etapa opera a nivel de trama sobre una rejilla de 10 ms e integra diez detectores: dos variantes de ATST-Frame con una rama CNN de 10 ms, cuatro de Dasheng-base y cuatro de BEATs, todas con cabeza Conformer. La segunda etapa, a nivel de evento, decide que candidatos conservar o fusionar apoyandose en cinco refinadores de fronteras que actuan como votantes, verificadores de gradient boosting sobre componentes PCA, un detector estilo DETR que aporta evidencia de verificacion y una tabla de correccion de bordes con compuerta. Ademas, se aplica una guarda de confianza: cualquier evento con probabilidad media igual o superior a 0,70 nunca se descarta, de modo que el mismo pipeline sirve tanto para clips naturales como sinteticos.

El entrenamiento se realizo sobre el dataset ARTPARK-IISc/Vaani-Noise-Event-Dataset, con una fase 2 que emplea objetivos de clasificacion binaria con pesos (owbce) y variantes con destilacion desde profesores (teacher). Los backbones se inicializan desde pesos publicos: ATST-Frame (`ATST-F_strong_1.pt`), BEATs (`BEATs_iter3_plus_AS2M.pt`) y Dasheng-base (`mispeech/dasheng-base`, descargado aparte de Hugging Face). El numero exacto de tokens de audio, la composicion detallada del dataset y si hubo etapas de RLHF o DPO no estan disponibles en la informacion proporcionada; el informe tecnico (`docs/Arcturus_track_1_8.pdf`) del repositorio de GitHub es la fuente indicada para esos detalles.

## Capacidades

- Deteccion de eventos sonoros con localizacion temporal: predice inicio y fin de cada evento de ruido en grabaciones de campo con resolucion de 10 ms.
- Deteccion de eventos de ruido en audio real y sintetico: la guarda de confianza (probabilidad media >= 0,70) permite usar el mismo pipeline en ambos dominios.
- Segmentacion a nivel de evento con metrica Segment Dice, ademas de la metrica Event F1 a nivel de evento.
- Ensamblado multi-backbone: combina representaciones de ATST-Frame, BEATs y Dasheng-base para robustez frente a dominios acusticos variados.
- Refinamiento de fronteras temporales mediante votacion de cinco refinadores y correccion de bordes con compuerta.
- Filtrado de falsos positivos y verificacion de candidatos mediante gradient boosting y detector estilo DETR.
- Inferencia por lotes sobre directorios de audio mediante CLI (`python inference/infer.py <input_audio_dir> <output_dir>`).
- No dispone de generacion de texto, razonamiento, codigo, vision ni tool calling: es un modelo discriminativo de audio, no un LLM.

## Casos de uso

- Monitorizacion acustica urbana: el sistema puede procesar grabaciones de campo y localizar temporalmente eventos de ruido (obras, trafico, sirenas) con precision de 10 ms, lo que permite construir informes de contaminacion acustica con marcas de inicio y fin por evento.
- Analisis de calidad de audio en corpus de campo: al detectar ruido no deseado en grabaciones Vaani, se puede filtrar o anotar automaticamente material para entrenamiento de modelos de voz, reduciendo la revision manual.
- Investigacion en deteccion de eventos sonoros: sirve como linea base reproducible (MIT, sha256 verificados) para comparar nuevas arquitecturas en la tarea de noise event detection del Datathon IndoML 2026.
- Vigilancia de entornos industriales: el pipeline puede desplegarse sobre audio continuo para marcar episodios de ruido anormal y generar alertas con marcas temporales precisas.
- Etiquetado asistido para anotadores humanos: el sistema propone candidatos de eventos con inicio y fin, que el anotador revisa, acelerando la construccion de datasets de SED en dominios con poco etiquetado.
- Analisis de ruido en estudios de biodiversidad o grabaciones ambientales: la deteccion de eventos de ruido permite separar segmentos utiles de segmentos contaminados antes de analisis posteriores (por ejemplo, identificacion de especies o transcripcion).
- Evaluacion de robustez de modelos de audio: al combinar clips naturales y sinteticos con la misma guarda de confianza, permite comparar el comportamiento de backbones (ATST, BEATs, Dasheng) frente a ruido controlado.

## Benchmarks y rendimiento

Resultados publicados por el equipo en la fase 2 del Datathon IndoML 2026 (Track 1):

| Metrica | Valor |
|---|---|
| Combined | 1,5893 |
| Event F1 | 0,7691 |
| Segment Dice | 0,8202 |
| Posicion en leaderboard | 8.º |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que la tarea es de deteccion de eventos sonoros y no de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los checkpoints suman aproximadamente 4,3 GB en disco; cargar simultaneamente los diez detectores y los componentes de la segunda etapa requiere memoria proporcional al conjunto, por lo que se recomienda una GPU con al menos 8-16 GB de VRAM para ejecutar todo el ensemble, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no especificadas por el autor. Por el tamano del ensemble, una GPU de clase A100 o H100 ofrece margen holgado; una RTX 4090 (24 GB) deberia ser suficiente para el pipeline completo, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas, dado que cada miembro individual pesa entre 350 y 370 MB; la carga simultanea de los diez miembros y los verificadores es el factor limitante.
- Opciones de despliegue: el repositorio proporciona un script de inferencia propio (`inference/infer.py`) con `requirements_inference.txt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros sistemas de la misma tarea en la informacion proporcionada. Como referencia cualitativa, el sistema se apoya en tres backbones publicos de audio, cuyas caracteristicas se resumen a continuacion:

| Modelo base | Origen | Licencia | Uso en este sistema |
|---|---|---|---|
| ATST-Frame | PretrainedSED (fschmid56) | MIT | 2 detectores con rama CNN de 10 ms |
| BEATs | microsoft/unilm | MIT | 4 detectores |
| Dasheng-base | mispeech/dasheng-base | Apache-2.0 | 4 detectores |

La comparacion con otros participantes del Datathon IndoML 2026 Track 1 no esta disponible mas alla de la posicion 8.ª del equipo Arcturus en la fase 2.

## Limitaciones y advertencias

- Dominio especifico: el sistema esta entrenado sobre el corpus Vaani (audio de campo indio) y su rendimiento fuera de ese dominio no esta documentado; puede degradarse con otros idiomas, acentos o condiciones acusticas.
- Sin datos de sesgo: no se han publicado analisis de sesgos por tipo de ruido, region, dispositivo de grabacion o demografia de los hablantes.
- Riesgo de falsos positivos y negativos: a pesar del filtro de falsos positivos y la guarda de confianza, no se documentan tasas de error por clase de evento ni matrices de confusion.
- Dependencia de backbones externos: la licencia final esta condicionada por las licencias de ATST-Frame (MIT), BEATs (MIT) y Dasheng-base (Apache-2.0); el uso comercial debe verificar el cumplimiento de las tres.
- Dasheng-base no se incluye en el repositorio: se descarga automaticamente de Hugging Face, lo que introduce una dependencia de red y de disponibilidad del modelo externo en el momento del despliegue.
- Sin versiones cuantizadas ni optimizadas: no hay pesos GGUF, ONNX ni TensorRT publicados, lo que limita el despliegue en entornos de bajos recursos.
- Reproducibilidad: requiere verificar sha256 de 20 ficheros mediante el script proporcionado; cualquier modificacion de los checkpoints invalida los resultados reportados.
- Uso en produccion: el pipeline esta disenado para inferencia por lotes sobre directorios de audio; no se documenta soporte para streaming en tiempo real ni latencia garantizada.
- Fecha de publicacion reciente (octubre de 2026) y ausencia de descargas o likes: no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asymptoticlearning/IndoML2026-Track1-Arcturus
- Codigo de entrenamiento e inferencia: https://github.com/Abhilash1602/IndoML2026-Track1-Arcturus
- Informe tecnico (en el repositorio): `docs/Arcturus_track_1_8.pdf`
- Dataset: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-Noise-Event-Dataset
- ATST-Frame (PretrainedSED): https://github.com/fschmid56/PretrainedSED
- BEATs (microsoft/unilm): https://github.com/microsoft/unilm/tree/master/beats
- Dasheng-base: https://huggingface.co/mispeech/dasheng-base
