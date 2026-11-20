# ina-foss/ssl-music-detection-music2vec

## Resumen

El modelo `ina-foss/ssl-music-detection-music2vec` es un sistema de detección y segmentación de música en audio, desarrollado por INA-FOSS (equipo del Institut National de l'Audiovisuel francés). Resuelve una tarea concreta: dado un fichero de audio, identificar qué fragmentos contienen música y cuáles no, devolviendo segmentos temporales con etiquetas booleanas. Es relevante porque reutiliza representaciones auto-supervisadas (SSL) de un codificador de audio musical preentrenado, lo que permite obtener una segmentación de alta calidad con un cabezal MLP ligero y un decodificador de Viterbi.

Arquitectura: no es un transformer generativo, sino un extractor de características seguido de un clasificador MLP por frame. Toma las características de la CNN y de la primera capa transformer del codificador SSL `m-a-p/music2vec-v1` y las pasa a un MLP que predice, para cada frame, la presencia o ausencia de música. En inferencia se aplica un decodificador de Viterbi binario (implementado en Librosa) para suavizar las transiciones y producir segmentos coherentes.

El modelo forma parte de una familia de detectores de música basados en SSL publicados por INA-FOSS junto con un conjunto de detectores de actividad de voz (VAD). Según la model card, este es el de mejor rendimiento global de la familia, con un F1 de 91,2 sobre la combinación de los conjuntos Mirex, OpenBMAT y Seyerlehner. Está pensado para investigación no comercial bajo la licencia `pantagruel-research-license` y se distribuye con código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extractor SSL (CNN + primera capa transformer de `m-a-p/music2vec-v1`) + MLP de clasificación por frame + decodificador Viterbi binario |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio completo, sin límite declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma hablado) |
| Licencia | pantagruel-research-license (uso exclusivo de investigación no comercial) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 16 kHz |
| Tarea | audio-classification / segmentación binaria música vs. no música |
| Modelo base | `m-a-p/music2vec-v1` |
| Tamano del repo | 0,2 GB |
| Libreria | transformers (con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo no entrena un codificador desde cero: reutiliza el codificador SSL `m-a-p/music2vec-v1`, preentrenado sobre audio musical, y extrae las representaciones intermedias de la CNN y de la primera capa transformer. Sobre esas características se entrena un MLP que realiza una predicción binaria por frame (música / no música). En la fase de inferencia se aplica un decodificador de Viterbi binario de Librosa (`librosa.sequence.viterbi_binary`) que impone coherencia temporal y evita parpadeos en la etiqueta.

El entrenamiento se realizó sobre los subconjuntos de entrenamiento de tres corpus de referencia en detección de música: OpenBMAT (Open Broadcast Media Audio from TV, Meléndez-Catalán et al., 2019), el conjunto Music/Speech del reto Mirex 2015 y el conjunto Music/Speech de Seyerlehner et al. (2007). La model card no detalla el número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos. Los hiperparámetros de entrenamiento, el checkpoint original y los eventos de TensorBoard están publicados en el directorio `training/` del repositorio. El trabajo asociado es Pelloin et al. (LREC 2026), centrado en los efectos de la selección de datos sobre el aprendizaje auto-supervisado de representaciones de audio para emisiones audiovisuales francesas.

## Capacidades

- Detección y segmentación binaria de música en audio: devuelve una lista de segmentos con marcas de inicio, fin y etiqueta booleana (`True` = música, `False` = no música).
- Procesamiento de audio a 16 kHz, con salida a nivel de frame y suavizado temporal mediante Viterbi.
- Funciona como extractor de características de audio para downstream (tag `feature-extraction`), además de clasificador.
- Integración con la librería `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`.
- Forma parte del ecosistema inaVAMOS (INA Voice And Music Open Segmenter), que combina detección de música y de voz en una CLI y una API de Python.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües en el sentido de generación de texto: es un modelo puramente discriminativo de audio.

## Casos de uso

- **Catalogación de archivos audiovisuales**: segmentar automáticamente emisiones de televisión y radio para etiquetar los tramos con música y facilitar la indexación y la búsqueda en archivos de medios, aprovechando que el modelo fue entrenado sobre OpenBMAT, un corpus de broadcast.
- **Detección de música en emisiones de radio en directo**: monitorizar streams para identificar cuándo suena música y cuándo hay voz o silencio, útil para sistemas de medición de audiencia o de cumplimiento de cuotas musicales.
- **Preprocesado para pipelines de ASR**: eliminar o marcar los segmentos musicales antes de pasar el audio a un sistema de reconocimiento de voz, reduciendo errores en tramos donde el habla está ausente.
- **Detección de infracciones de derechos musicales**: localizar fragmentos musicales en contenido subido por usuarios para su revisión por parte de equipos de derechos de autor, gracias a la segmentación temporal precisa que produce el decodificador de Viterbi.
- **Investigación en music information retrieval (MIR)**: usar el modelo como baseline o como extractor de características SSL para experimentos de detección de música, comparándolo con los otros detectores de la colección de INA-FOSS.
- **Análisis de publicidad y patrocinios**: identificar la presencia de música en bloques publicitarios dentro de emisiones, un caso típico en el análisis de broadcast que motiva el uso de OpenBMAT en el entrenamiento.
- **Integración en herramientas de segmentación de voz y música**: desplegar el modelo junto a los detectores VAD de la familia INA-FOSS a través de inaVAMOS para obtener una segmentación conjunta de voz y música en una sola pasada.

## Benchmarks y rendimiento

La model card reporta el F1 global sobre la combinación de los conjuntos Mirex, OpenBMAT y Seyerlehner para la familia de detectores SSL de INA-FOSS:

| Modelo | F1 global |
|---|---|
| ssl-music-detection-music2vec | 91,2 |
| ssl-music-detection-base | 89,4 |
| ssl-music-detection-gender | 88,3 |
| ssl-music-detection-only_fr | 87,7 |
| ssl-music-detection-only_speech | 87,5 |
| ssl-music-detection-no_music | 87,1 |

No se han publicado en la información disponible resultados desagregados por conjunto (Mirex, OpenBMAT, Seyerlehner) ni métricas adicionales como precisión, recall o latencia. Para el detalle completo se remite a la publicación de Pelloin et al. (LREC 2026).

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,2 GB, por lo que el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente. También puede ejecutarse en CPU para audio de duración moderada.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del checkpoint y del codificador base.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el ecosistema inaVAMOS como CLI o API de Python (instalable con `pip install inaVAMOS`). No se documentan integraciones con vLLM, TGI u Ollama, que no aplican a este tipo de modelo discriminativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | F1 global | Licencia | Disponibilidad |
|---|---|---|---|---|
| ssl-music-detection-music2vec | SSL music2vec + MLP + Viterbi | 91,2 | pantagruel-research-license (solo investigación) | Hugging Face |
| ssl-music-detection-base | SSL + MLP + Viterbi | 89,4 | no disponible en la información | Hugging Face |
| ssl-music-detection-gender | SSL + MLP + Viterbi | 88,3 | no disponible en la información | Hugging Face |
| ssl-music-detection-only_fr | SSL + MLP + Viterbi | 87,7 | no disponible en la información | Hugging Face |

Las alternativas comparadas pertenecen a la misma colección de INA-FOSS y comparten pipeline de inferencia; la diferencia principal es el codificador SSL de partida y los datos de entrenamiento. No se dispone de comparación con detectores de música de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: `pantagruel-research-license` limita el uso a investigación no comercial; el acceso está condicionado a un formulario con institución, correo institucional y país, y a aceptar explícitamente la cláusula de uso no comercial.
- Modelo puramente discriminativo: no genera texto, no razona, no soporta tool calling ni agentes; no debe evaluarse como un LLM.
- Dependencia de `trust_remote_code=True`: requiere ejecutar código personalizado del repositorio, lo que implica revisar el código antes de desplegarlo en producción.
- Entrenado sobre corpus concretos (OpenBMAT, Mirex 2015, Seyerlehner 2007): el rendimiento puede degradarse en dominios de audio distintos (podcasts, música en directo con ruido, grabaciones de baja calidad) no representados en el entrenamiento.
- Frecuencia de muestreo fija a 16 kHz: es necesario remuestrear el audio de entrada; no se documenta el comportamiento con otras frecuencias.
- No se documentan sesgos específicos, pero al ser un detector binario música/no música, los falsos positivos y negativos en géneros poco representados o en audio con música de fondo muy tenue son un riesgo plausible que no se cuantifica en la model card.
- No se publican métricas desagregadas por conjunto ni análisis de errores; la evaluación se limita al F1 global agregado.
- Sin información sobre idiomas ni sobre robustez multilingüe: el modelo opera sobre señal de audio, no sobre texto, por lo que la noción de idioma no aplica directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-music-detection-music2vec
- Licencia: https://huggingface.co/ina-foss/ssl-music-detection-music2vec/blob/main/LICENSE.md
- Directorio de entrenamiento (hiperparámetros, checkpoint, TensorBoard): https://huggingface.co/ina-foss/ssl-music-detection-music2vec/tree/main/training
- Requisitos: https://huggingface.co/ina-foss/ssl-music-detection-music2vec/blob/main/requirements.txt
- Modelo base music2vec: https://huggingface.co/m-a-p/music2vec-v1
- Colección de detectores de música SSL de INA-FOSS: https://huggingface.co/collections/ina-foss/ssl-music-detection
- Colección de detectores VAD SSL de INA-FOSS: https://huggingface.co/collections/ina-foss/ssl-vad
- inaVAMOS (repositorio): https://github.com/ina-foss/inaVAMOS
- inaVAMOS en PyPI: https://pypi.org/project/inaVAMOS/
- OpenBMAT: https://www.upf.edu/web/mtg/openbmat
- Mirex 2015 Music/Speech: https://www.music-ir.org/mirex/wiki/2015:Music/Speech_Classification_and_Detection#Dataset_2
- Seyerlehner et al. (2007): https://www.cp.jku.at/research/papers/Seyerlehner_etal_DAFx_2007.pdf
- Librosa Viterbi binario: https://librosa.org/doc/latest/generated/librosa.sequence.viterbi_binary.html
