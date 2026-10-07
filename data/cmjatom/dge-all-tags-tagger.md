# cmjatom/dge-all-tags-tagger

## Resumen

DGE all-tags audio tagger es un modelo de etiquetado de audio (audio tagging) publicado por el usuario cmjatom en HuggingFace, pensado para el proyecto Document Graph Explorer. Se trata de un ajuste fino del checkpoint EfficientAT mn10_as, una red convolucional eficiente preentrenada en AudioSet por Florian Schmid (repositorio fschmid56/EfficientAT), que aquí se ha especializado en etiquetar instrumentos, tipos de sonido y efectos. El resultado se distribuye exclusivamente en formato ONNX, con los umbrales de decisión por etiqueta en un fichero aparte.

El modelo resuelve un problema clásico de la recuperación musical y la catalogación de archivos de audio: dada una señal de audio, asignar múltiples etiquetas simultáneas (clasificación multietiqueta con una sigmoide por etiqueta), en lugar de forzar una única categoría. Su relevancia radica en que es un modelo pequeño y eficiente, orientado a ejecutarse en producción sin depender de GPUs, y en que su licencia MIT sobre los pesos facilita la integración en aplicaciones.

La entrada está fijada por el diseño de EfficientAT: audio mono a 32 kHz convertido en tramas log-mel de 128 bandas. No se especifican el número de parámetros, la ventana temporal ni la lista completa de etiquetas en la información disponible; las etiquetas se definen en el propio fichero onnx/model.json del repositorio. El repositorio no redistribuye audio, solo los pesos entrenados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientAT mn10_as (red convolucional eficiente para audio tagging, preentrenada en AudioSet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 32 kHz con tramas log-mel de 128 bandas (ventana temporal exacta no disponible) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de audio, no procesa texto); idiomas no disponibles |
| Licencia | MIT (pesos del modelo); los conjuntos de datos de entrenamiento tienen licencias propias que hay que verificar |
| Formato de pesos | ONNX (con ficheros auxiliares model.json para las etiquetas y thresholds.json para los umbrales) |

## Arquitectura y entrenamiento

La base es EfficientAT, una familia de modelos convolucionales diseñada específicamente para audio tagging con un coste computacional bajo. El checkpoint de partida, mn10_as, corresponde a la variante preentrenada en AudioSet dentro de ese proyecto, cuya licencia también es MIT. El ajuste fino conserva la cabeza de clasificación multietiqueta: la salida es una sigmoide independiente por etiqueta, de modo que el modelo puede activar varias etiquetas a la vez para un mismo fragmento de audio, y cada una se compara contra un umbral específico almacenado en thresholds.json.

El entrenamiento de ajuste fino combina varios corpus: FSD50K (licencias Creative Commons), NSynth (CC BY 4.0), MTG-Jamendo y OpenMIC (licencias CC), fragmentos de Freesound con licencia por clip y previsualizaciones de SoundCloud. Los datos abarcan instrumentos musicales, tipos de sonido y efectos, lo que explica el carácter multietiqueta y heterogéneo del espacio de salidas. No se indica en la información disponible el número de tokens o de horas de audio usadas, ni si hubo etapas de refinamiento tipo RLHF o DPO (poco habituales en audio tagging). El repositorio incluye un fichero eval.txt con métricas de precisión y recall por etiqueta sobre un conjunto reservado, pero los valores numéricos no se han facilitado.

## Capacidades

- Clasificación de audio multietiqueta: devuelve una probabilidad independiente por etiqueta, con umbrales calibrados individualmente.
- Etiquetado de instrumentos musicales, tipos de sonido y efectos sonoros, a partir de la combinación de datasets de entrenamiento.
- Procesamiento de audio mono a 32 kHz con representación log-mel de 128 bandas, siguiendo la configuración de EfficientAT.
- Inferencia ligera en formato ONNX, apta para ejecución en CPU y para integración mediante ONNX Runtime.
- No dispone de tool calling ni de function calling: es un clasificador de audio, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso; tampoco generación de texto, código, matemáticas o visión.
- Capacidades multilingües: no aplica, el modelo no trabaja con lenguaje natural.

## Casos de uso

- Catalogación automática de fonotecas: etiquetar por lotes grandes colecciones de audio con instrumentos, tipos de sonido y efectos, generando metadatos buscables sin intervención manual.
- Indexación para motores de búsqueda de audio: las etiquetas y sus probabilidades permiten construir filtros del tipo "contiene piano" o "contiene ruido de tráfico" sobre catálogos de efectos de sonido.
- Preetiquetado en herramientas de producción musical: un DAW o un gestor de samples puede sugerir etiquetas al importar clips, y el usuario corrige después, reduciendo el trabajo manual de clasificación.
- Enriquecimiento de grafos de documentos: es el caso de uso declarado por el autor (Document Graph Explorer), donde las etiquetas de audio pasan a ser nodos y relaciones dentro de un grafo que conecta documentos multimedia.
- Moderación y filtrado de contenido sonoro en plataformas: detección de categorías de sonido concretas para aplicar políticas o avisos, siempre que las etiquetas presentes en model.json cubran las categorías de interés.
- Análisis de archivos sonoros en investigación: etiquetado de corpus propios para estudios de musicología computacional o de paisaje sonoro, con la ventaja de que el modelo se ejecuta localmente y no requiere enviar audio a servicios externos.
- Pipelines de anotación asistida en etiquetado humano: el modelo propone etiquetas y el anotador valida, lo que acelera la creación de conjuntos de datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona un fichero eval.txt con puntuaciones de precisión y recall por etiqueta sobre un conjunto reservado, pero los valores concretos no se han facilitado, por lo que no se pueden comparar numéricamente con otros sistemas.

## Requisitos de hardware

- Al derivar de la familia EfficientAT, diseñada para eficiencia, es esperable que la inferencia sea viable en CPU y en dispositivos de gama baja, pero no se dispone de cifras confirmadas de VRAM ni de tamaño del modelo en parámetros.
- El tamaño del repositorio se reporta como 0,0 GB en HuggingFace, lo que sugiere un artefacto de pequeño tamaño (por debajo de la precisión de la métrica), aunque no permite calcular la huella de memoria exacta.
- GPU: no se especifican modelos recomendados. Por el perfil del modelo, una GPU de consumo como una RTX 3060 o superior sería más que suficiente si se opta por aceleración, pero esta afirmación no está confirmada por el autor.
- Despliegue: el formato ONNX permite usar ONNX Runtime (CPU o GPU), así como integración en aplicaciones móviles y de escritorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un clasificador de audio de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DGE all-tags tagger (este modelo) | Audio tagging multietiqueta | no disponible | 32 kHz mono, log-mel de 128 bandas | MIT (pesos) | HuggingFace, ONNX |
| EfficientAT mn10_as (modelo base) | Audio tagging (AudioSet) | no disponible en esta ficha | 32 kHz mono, log-mel de 128 bandas | MIT | Repositorio fschmid56/EfficientAT |
| YAMNet (Google) | Audio tagging (AudioSet, 521 clases) | no disponible en esta ficha | 16 kHz mono, log-mel | Apache 2.0 | TensorFlow Hub |
| AST (Audio Spectrogram Transformer) | Audio tagging / clasificación | no disponible en esta ficha | Espectrogramas, 16 kHz | Distintas según checkpoint | HuggingFace / repositorio original |
| PANNs (CNN14 y variantes) | Audio tagging y detección de eventos | no disponible en esta ficha | 32 kHz, log-mel | Distintas según checkpoint | Repositorio del proyecto |

La comparación cuantitativa de parámetros y rendimiento no está disponible para este modelo; la diferencia principal frente a alternativas como YAMNet o AST es el conjunto de etiquetas, definido por el ajuste fino sobre FSD50K, NSynth, MTG-Jamendo, OpenMIC, Freesound y SoundCloud, en lugar del vocabulario estándar de AudioSet.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento verificables en la información disponible; el autor remite a eval.txt pero no se incluyen los valores. Sin esa evaluación, no conviene asumir un comportamiento determinado en producción.
- El modelo solo predice las etiquetas definidas en onnx/model.json. Cualquier categoría ausente de esa lista no puede detectarse, por mucho que exista en el audio.
- Los umbrales de decisión son específicos por etiqueta (thresholds.json) y afectan directamente a la precisión y el recall; hay que revisarlos y recalibrarlos si el dominio de aplicación difiere del de entrenamiento.
- Sesgos potenciales derivados de los datos: la combinación de FSD50K, NSynth, MTG-Jamendo, OpenMIC, Freesound y previsualizaciones de SoundCloud sobrerrepresenta ciertos géneros, instrumentos y entornos acústicos de esos corpus, y puede infrarrepresentar audio de otras culturas, idiomas o contextos de grabación.
- Riesgo de falsos positivos y falsos negativos en audio con solapamiento de fuentes, reverberación fuerte o ruido de fondo, típico de los clasificadores multietiqueta.
- Los clips de previsualización de SoundCloud plantean dudas sobre la procedencia y los términos de uso de esa parte de los datos; el autor no redistribuye audio, pero recomienda revisar las licencias de los conjuntos de entrenamiento antes de usos distintos de la investigación y aplicación.
- La licencia MIT cubre los pesos, pero no exime de comprobar las licencias de los datos de entrenamiento (CC BY 4.0 en NSynth, CC por clip en Freesound, etc.) para usos comerciales o de redistribución.
- No se especifican versiones cuantizadas ni requisitos de hardware, por lo que el despliegue requiere una validación propia de latencia y consumo.
- El modelo no genera texto, no razona y no soporta instrucciones en lenguaje natural: solo produce puntuaciones de etiquetas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmjatom/dge-all-tags-tagger
- Proyecto EfficientAT (modelo base, fschmid56): https://github.com/fschmid56/EfficientAT
- Checkpoint EfficientAT en HuggingFace (referencia del autor del modelo base): https://huggingface.co/fschmid56/EfficientAT
- FSD50K: https://huggingface.co/datasets/Fsd50k/fsd50k
- NSynth (CC BY 4.0): https://magenta.tensorflow.org/datasets/nsynth
- MTG-Jamendo: https://github.com/MTG/mtg-jamendo-dataset
- OpenMIC: https://github.com/cwitkowitz/open-mic
- Freesound: https://freesound.org
