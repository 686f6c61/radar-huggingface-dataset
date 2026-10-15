# shawon/alberto-chord-crnn

## Resumen

alberto-chord-crnn es una red neuronal convolucional-recurrente (CRNN) de 482.025 parámetros diseñada para el reconocimiento de acordes de guitarra a nivel de frame. El modelo etiqueta audio monofónico de guitarra acústica con una de 73 clases posibles por frame: ausencia de acorde o un acorde mayor, menor, de séptima de dominante, séptima mayor, séptima menor o semidisminuido sobre cualquiera de las 12 fundamentales. Es el reconocedor neuronal del proyecto **alberto**, un asistente de composición para guitarra que escucha una progresión, estima la tonalidad y sugiere qué tocar a continuación.

El modelo trabaja sobre una transformada CQT (constant-Q transform) de magnitud logarítmica que arranca en C2, cubre 6 octavas con 24 bins por octava y usa un hop de 512 muestras a 22,05 kHz. La salida son logits por frame sobre las 73 clases, que el autor decodifica con Viterbi sobre una matriz de transición bigrama almacenada en el propio checkpoint, aunque el argmax simple también funciona con una pequeña pérdida de precisión.

Su relevancia en el ecosistema abierto reside en dos factores: es extremadamente ligero (checkpoint de menos de 2,5 MB y ejecución en CPU en torno a 16 ms para una ventana de 8 segundos en un Mac con chip de la serie M), y está entrenado sobre un corpus académico reproducible (GuitarSet, ISMIR 2018) con licencia CC BY 4.0, lo que lo hace fácilmente integrable en aplicaciones de escritorio o web sin GPU. El repositorio registra 21 descargas y 1 «like» en HuggingFace en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (red convolucional-recurrente) |
| Parametros totales | 482.025 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de 8 s de audio en entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de menos de 2,5 MB; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de clasificacion de audio, no de texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | checkpoint PyTorch (`crnn_majmin.pt`), cargado con `torch.load(..., weights_only=True)` |
| Entrada | CQT de magnitud logaritmica desde C2, 6 octavas, 24 bins por octava, hop 512 a 22,05 kHz |
| Salida | logits por frame sobre 73 clases |
| Decodificacion | Viterbi con matriz de transicion bigrama (`transitions`) incluida en el checkpoint; argmax como alternativa |
| Volumen de entrenamiento | 300 fragmentos (jugadores 00-04 de GuitarSet); 60 fragmentos del jugador 05 reservados para evaluacion |

## Arquitectura y entrenamiento

La arquitectura es una CRNN que combina capas convolucionales (que extraen patrones locales de la representacion CQT) con capas recurrentes (que modelan la evolucion temporal entre frames). No se detalla en la model card el numero exacto de capas, canales ni el tipo de celda recurrente empleada (LSTM, GRU u otra), por lo que esos datos no estan disponibles. La definicion completa vive en el repositorio del proyecto alberto, en el fichero `alberto/chords/model.py`.

El entrenamiento se realizo sobre GuitarSet (Xi, Bittner, Ye, Bello, ISMIR 2018; licencia CC BY 4.0), usando las grabaciones de microfono mono y la anotacion *performed* de acordes mapeada al vocabulario de 73 clases; las referencias con otras cualidades (novenas, sextas, sus) se reducen a la triada que implica su tercera. Se usaron los jugadores 00-04 (300 fragmentos, tanto rasgueados como solos) con desplazamientos aleatorios de tono de hasta ±5 semitonos aplicados rotando bins de la CQT, y se reservo el jugador 05 (60 fragmentos) como conjunto de validacion. La configuracion fue de 30 epocas, optimizador Adam con tasa de aprendizaje 1e-3 y decaimiento coseno, fragmentos de 8 segundos y perdida de entropia cruzada. No se documenta en la model card ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable al no tratarse de un modelo generativo de lenguaje.

Como innovacion practica destaca la decodificacion: el checkpoint incluye una matriz de transicion bigrama estimada a partir de las etiquetas de entrenamiento, de modo que el modelo puede aplicar Viterbi sobre las posteriors por frame en lugar de un argmax independiente. Esto mejora todas las metricas evaluadas, con la mayor ganancia en la metrica de triadas (0,525 frente a 0,516).

## Capacidades

- Reconocimiento de acordes a nivel de frame sobre audio de guitarra acustica, con 73 clases: 12 fundamentales x 6 cualidades (mayor, menor, septima de dominante, septima mayor, septima menor, semidisminuido) mas la clase de ausencia de acorde.
- Deteccion de segmentos temporales: la funcion `recognize` devuelve segmentos con inicio, fin y etiqueta de acorde, no solo predicciones aisladas por frame.
- Decodificacion contextual con Viterbi sobre una matriz de transicion bigrama aprendida, que suaviza transiciones improbables entre acordes.
- Ejecucion en CPU con latencia muy baja (unos 16 ms para modelo mas Viterbi sobre una ventana de 8 segundos en un Mac con chip de la serie M), lo que habilita procesamiento casi en tiempo real.
- Umbral de silencio recomendado: los frames con RMS por debajo de -60 dBFS deben tratarse como ausencia de acorde independientemente de la prediccion.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento. Es un clasificador de audio especializado y de proposito unico.

## Casos de uso

- Aplicaciones de aprendizaje de guitarra: el modelo transcribe la progresion que toca el alumno y la aplicacion puede compararla con la esperada, detectando acordes mal pulsados. Su latencia de decenas de milisegundos permite dar retroalimentacion casi inmediata sin depender de una GPU.
- Seguimiento de acordes en directo: con 16 ms por ventana de 8 segundos en CPU, puede ejecutarse en un portatil mientras se toca, alimentando visualizaciones de acordes en tiempo real para directos o ensayos.
- Composicion asistida (caso original del proyecto alberto): dado un fragmento de guitarra, el modelo extrae la secuencia de acordes, lo que permite estimar la tonalidad y sugerir que tocar despues.
- Etiquetado automatico de bibliotecas de samples y loops de guitarra: procesar en lote ficheros de audio para anotar los acordes presentes y habilitar busquedas del tipo «dame un loop en La menor».
- Generacion de tablaturas y hojas de acordes: el resultado por segmentos se mapea directamente a una progresion con marcas de tiempo, lista para exportarse a MusicXML o a un editor de partituras.
- Sincronizacion de letras y acordes en aplicaciones tipo karaoke: los cambios de acorde detectados por frame permiten alinear la progresion armonica con la pista vocal.
- Pretranscripcion para herramientas de analisis musical: usar el modelo como primer paso barato en CPU que alimenta etapas posteriores mas costosas (separacion de fuentes, analisis estructural, deteccion de tonalidad).

## Benchmarks y rendimiento

Evaluacion con mir_eval sobre el jugador reservado 05, 30 fragmentos rasgueados, comparados contra la anotacion *performed*:

| Metrica | Este modelo, Viterbi | Este modelo, argmax | Baseline de plantillas binarias |
|---|---:|---:|---:|
| root | 0,729 | 0,724 | 0,541 |
| majmin | 0,689 | 0,675 | 0,516 |
| triads | 0,525 | 0,516 | 0,399 |
| sevenths | 0,575 | 0,566 | 0,400 |
| mirex | 0,721 | 0,721 | 0,506 |

El autor indica ademas que la version anterior de 25 clases obtenia majmin 0,684 y sevenths 0,450, de modo que el vocabulario ampliado a septimas elevo la metrica de septimas en 12,5 puntos sin degradar majmin. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo logico al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: no aplica en la practica. Con 482.025 parametros y un checkpoint de menos de 2,5 MB, el modelo cabe holgadamente en memoria de sistema y no requiere GPU.
- GPU recomendadas: ninguna en particular. Cualquier GPU moderna (RTX 4090, A100, H100, integradas) puede ejecutarlo, pero es innecesario; el coste dominante es el calculo de la CQT, no la red.
- Compatibilidad con hardware de consumo: si. Se ejecuta en CPU de portatiles y equipos de escritorio, y el autor reporta unos 16 ms (modelo mas Viterbi) para una ventana de 8 segundos en un Mac con chip de la serie M.
- Opciones de despliegue: inferencia directa con PyTorch cargando el checkpoint e importando la definicion desde `alberto/chords/model.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que esos motores estan orientados a modelos de lenguaje y no aplican a este clasificador de audio.
- Latencia y throughput estimados: aproximadamente 16 ms por ventana de 8 segundos en un Mac con chip de la serie M, en CPU. No se documentan mediciones en otras plataformas.

## Comparativa con modelos similares

La model card solo proporciona comparacion interna contra un baseline de plantillas binarias y contra la version anterior de 25 clases del propio modelo. No se dispone de datos sobre otros modelos publicos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto / entrada | Rendimiento (majmin / sevenths) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alberto-chord-crnn (este modelo) | 482.025 | CQT, ventanas de 8 s | 0,689 / 0,575 | CC BY 4.0 | HuggingFace |
| Version anterior de 25 clases (mismo proyecto) | no disponible | CQT | 0,684 / 0,450 | no disponible | no disponible |
| Baseline de plantillas binarias | no aplica | no disponible | 0,516 / 0,400 | no disponible | no disponible |

No se dispone de informacion sobre alternativas de terceros (por ejemplo, otros reconocedores de acordes publicados en abierto) con la que completar esta comparativa.

## Limitaciones y advertencias

- Solo cubre seis cualidades de acorde. Los acordes sus, disminuidos y aumentados se mapean a la clase mas cercana segun su tercera, y los acordes extendidos (novenas, sextas, undecimas) sufren la misma reduccion, por lo que la salida no refleja esas cualidades.
- Entrenado con una unica guitarra acustica grabada con un unico microfono. Se espera una precision notablemente inferior en guitarra electrica, con distorsion o en mezclas completas con otros instrumentos.
- Asume que la fundamental es la nota mas grave, como en las posiciones habituales de guitarra; las inversiones pueden provocar errores de etiquetado.
- El conjunto de evaluacion es muy reducido (30 fragmentos rasgueados de un solo interprete reservado), por lo que las metricas tienen un intervalo de confianza amplio y pueden no generalizar a otros estilos, tecnicas o condiciones de grabacion.
- Riesgo de alucinacion en el sentido de falsos positivos de acorde: los frames con RMS por debajo de -60 dBFS deben forzarse a la clase de ausencia de acorde, ya que de lo contrario el modelo puede emitir etiquetas sobre silencio o ruido.
- Licencia CC BY 4.0: permite uso comercial y modificacion, pero exige atribucion al autor y al corpus de entrenamiento (GuitarSet, tambien CC BY 4.0). Conviene citar adecuadamente ambos en productos derivados.
- La model card no documenta sesgos demograficos ni de estilo mas alla de la restriccion de interprete, instrumento y microfono ya mencionada.
- No se documentan datos de idioma porque el modelo no procesa texto; cualquier caso de uso multilingue es ajeno a este componente.
- La interfaz de uso depende del codigo del repositorio alberto (`alberto/chords/model.py`), que no forma parte del checkpoint descargable de HuggingFace; quien integre el modelo debe replicar la arquitectura o importarla desde ese repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shawon/alberto-chord-crnn
- Dataset GuitarSet (Xi, Bittner, Ye, Bello, ISMIR 2018; CC BY 4.0): https://zenodo.org/records/3371780
- Repositorio del proyecto alberto (mencionado en la model card como origen de `alberto/chords/model.py`): no se proporciona URL en la informacion disponible.
- Articulo o blog del modelo: no disponible.
- Demo: no disponible.
- Los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo ni a reconocimiento de acordes, por lo que no se incluyen.
