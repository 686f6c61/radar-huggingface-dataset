# Emma5099/dance2music

## Resumen

Dance2Music (subtitulado Music2Pose Transformer) es un modelo de generación de movimiento condicionado por audio desarrollado por Emma Genthon y publicado en Hugging Face bajo el identificador Emma5099/dance2music. A pesar del nombre, la tarea real es la inversa a la que este sugiere: no genera música a partir de baile, sino secuencias de poses corporales a partir de una pista de audio. El modelo produce 33 landmarks de estilo MediaPipe a 25 fotogramas por segundo, que después pueden renderizarse como un vídeo de esqueleto sincronizado con el sonido.

A diferencia de los modelos de lenguaje, no se trata de un sistema de propósito general ni de texto: es un transformer decoder causal de tamaño muy reducido (hidden size 256, 6 capas, 8 cabezas de atención) con cross-attention sobre características de audio. El checkpoint publicado (época 250, aproximadamente 26 MB) se entrenó sobre el dataset AIST++ y se distribuye con licencia MIT, junto con el código de extracción de características, inferencia y generación de vídeo.

Su relevancia es la de una herramienta acotada y reproducible para investigación en audio-to-motion y para prototipado rápido: el modelo completo cabe en CPU, el repositorio no incluye pesos de gran tamaño y el pipeline de audio a vídeo está cerrado de extremo a extremo. En el momento de la consulta acumula 0 descargas y 1 like, por lo que no existe validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con cross-attention de audio |
| Parametros totales | no disponible (el checkpoint pytorch_model.pt ocupa aproximadamente 26 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 60 fotogramas a 25 fps (2,4 s de buffer rodante) |
| Tipos de cuantizacion | no disponible; solo se distribuye el checkpoint en PyTorch |
| Idiomas soportados | no disponible; modelo de audio a movimiento, sin entrada ni salida de texto |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); no se publican safetensors, GGUF ni ONNX |
| Tamano oculto | 256 |
| Capas / cabezas de atencion | 6 / 8 |
| Entrada de audio | 80 bandas mel + intensidad de onset + flag de beat (82 dimensiones por fotograma) |
| Salida de poses | 33 landmarks x 9 canales (xyz + velocidad + aceleracion); en inferencia solo se usan xyz |
| Frecuencia de muestreo de audio | 32 kHz |
| Frecuencia de salida de poses | 25 fps |
| Dataset de entrenamiento | AIST++ (pares de secuencias de pose y fragmentos de audio) |
| Checkpoint publicado | pytorch_model.pt, mejor epoca 250, con estadisticas de normalizacion |
| Tamano del repositorio | 0,0 GB segun Hugging Face |
| Fecha de publicacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un decoder transformer causal que genera poses de forma autorregresiva, condicionado en cada paso por características acústicas mediante cross-attention. La cadena completa es: audio a 32 kHz, extracción de 80 bandas mel más intensidad de onset y un flag de beat (82 dimensiones por fotograma), paso por el bloque `Music2PoseTransformer`, y salida de 33 landmarks con 9 canales cada uno (posición xyz, velocidad y aceleración). Durante la inferencia solo se utilizan los canales xyz. La generación se apoya en un contexto rodante de 60 fotogramas, es decir, 2,4 segundos de historia a 25 fps, lo que limita la coherencia a corto plazo.

El entrenamiento se realizó sobre el dataset AIST++ con secuencias de pose emparejadas con fragmentos de audio, empleando pérdidas ponderadas sobre posición, velocidad y aceleración, además de *scheduled sampling* con el mismo contexto rodante de 60 fotogramas. El checkpoint publicado corresponde a la mejor época de 250. El repositorio no documenta el número total de tokens de audio vistos, la composición detallada del dataset, ni si hubo etapas de ajuste con retroalimentación humana (RLHF/DPO), algo que en cualquier caso no aplica a un modelo generativo de movimiento. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el autor señala explícitamente que la alineación con el beat aún es limitada y que mejora con más datos y más épocas.

## Capacidades

- Generación de movimiento corporal: produce secuencias de 33 landmarks (formato compatible con MediaPipe) a 25 fps a partir de cualquier archivo de audio.
- Sincronización con audio: incorpora bandas mel, intensidad de onset y un flag de beat como condiciones de entrada, lo que permite alinear parcialmente el movimiento con eventos rítmicos.
- Generación autorregresiva con contexto rodante: mantiene 60 fotogramas de historia (2,4 s) para dar continuidad a la secuencia.
- Renderizado de esqueleto a vídeo: el script `generate.py` cierra el pipeline de audio a MP4 de esqueleto, con muxing de audio mediante ffmpeg.
- Predicción de cinemática: el modelo se entrena con canales de velocidad y aceleración, aunque en inferencia solo se conserva la posición xyz.
- Procesamiento de audio mono a 32 kHz: incluye remuestreo con librosa cuando el archivo de entrada tiene otra frecuencia o es estéreo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de visión, de audio comprensivo ni modo de razonamiento explícito (*thinking mode*); es un generador específico de una única modalidad de salida.

## Casos de uso

- Previsualización de coreografías: un coreógrafo puede introducir una maqueta musical y obtener un esqueleto animado en segundos para evaluar el encaje rítmico antes de grabar con bailarines reales; el modelo cabe en CPU y no requiere infraestructura de GPU.
- Prototipado de animación en videojuegos: el esqueleto de 33 landmarks se puede remapear a un rig humanoide y usar como animación base o *motion matching* preliminar, dado que la salida es una secuencia limpia de posiciones a 25 fps.
- Herramientas creativas para músicos: generación automática de visuales de danza sincronizados con una canción, usando el pipeline `generate.py` para producir un MP4 con el audio incrustado.
- Investigación en audio-to-motion: sirve como baseline reproducible y de bajo coste sobre AIST++, con licencia MIT y código de entrenamiento, evaluación y extracción de características disponible en el proyecto fuente.
- Educación y análisis de movimiento: comparar la pose generada con la ejecución real de un estudiante para estudiar desviaciones de tempo o amplitud, teniendo en cuenta que la velocidad de movimiento del modelo es muy inferior a la real (18,4 % del ground truth).
- Generación de datos sintéticos de pose: producir pares audio-pose adicionales para preentrenar o aumentar otros sistemas de estimación de pose, siempre que se asuma la limitada amplitud del movimiento generado.
- Herramientas de accesibilidad o instalaciones interactivas: conversión en tiempo casi real de música en representación visual de movimiento, ya que el modelo es de 26 MB y puede ejecutarse localmente sin servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El autor solo reporta métricas de validación sobre la muestra `sBT_c01_v7`:

| Metrica | Valor |
|---|---|
| MSE (xyz) | 0,624 |
| Velocidad de movimiento | 18,4 % del ground truth |
| Balanced score | 1,306 |

No se proporcionan comparaciones con otros sistemas de generación de baile ni resultados agregados sobre el conjunto completo de AIST++.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint en disco ocupa aproximadamente 26 MB, por lo que la huella en memoria es mínima incluso en fp32.
- GPU recomendadas: no se especifica ninguna; cualquier GPU con soporte CUDA es más que suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU o en CPU pura, dado que el modelo detecta el dispositivo con `torch.device("cuda" if torch.cuda.is_available() else "cpu")`.
- Requisitos de software: Python 3.10 o superior, PyTorch 2.x, ffmpeg accesible en el PATH, librosa y soundfile.
- Opciones de despliegue: inferencia directa con el script `generate.py` o mediante la API de Python (`load_checkpoint`, `generate_poses`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerán principalmente del coste del remuestreo de audio y del renderizado de vídeo con ffmpeg más que del paso por el transformer.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de arquitectura, parámetros, contexto, licencia ni métricas de otros sistemas de generación de baile condicionada por audio, y no se han publicado comparaciones en la model card ni en los resultados de búsqueda. El único punto de referencia objetivo es el dataset AIST++, empleado también como base de evaluación en la literatura de audio-to-motion, pero sin cifras comparativas verificables en este contexto.

## Limitaciones y advertencias

- Alineación rítmica limitada: el propio autor indica que la sincronización con el beat es mejorable y que depende de más datos y más épocas de entrenamiento.
- Movimiento poco enérgico: la velocidad de movimiento generada alcanza solo el 18,4 % del ground truth, por lo que las secuencias resultantes son notablemente más lentas y contenidas que un baile real.
- Error de reconstrucción apreciable: el MSE (xyz) de validación es de 0,624 en la muestra reportada, sin datos agregados sobre el conjunto completo.
- Contexto muy corto: 2,4 segundos de buffer rodante limitan la coherencia a largo plazo y favorecen deriva acumulada en secuencias largas.
- Salida limitada a esqueleto: no genera malla, textura, cuerpo con apariencia realista ni contacto con el suelo; el resultado es un vídeo de palos y articulaciones.
- Sesgos de dominio: entrenado exclusivamente con AIST++; no hay información sobre la diversidad de estilos, morfologías o condiciones de grabación cubiertas, por lo que el comportamiento fuera de ese dominio es incierto.
- Ausencia de validación externa: 0 descargas y 1 like en el momento de la consulta, sin issues ni evaluaciones independientes publicadas.
- Idiomas: no aplica texto, pero tampoco se documenta el comportamiento con voces, percusión no occidental o audio sin estructura rítmica clara.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de uso de AIST++ si se redistribuyen datos derivados del entrenamiento.
- Ambigüedad de nomenclatura: el nombre del repositorio (Dance2Music) describe la dirección opuesta a la tarea real (música a pose), lo que puede inducir a error al integrarlo en catálogos de modelos.
- Metadatos con fecha futura: el repositorio figura creado y actualizado el 15 de septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Emma5099/dance2music
- Perfil del autor: https://huggingface.co/Emma5099
- Dataset AIST++: https://google.github.io/aistplusplus_dataset/
- Cita sugerida por el autor: Genthon, E. (2026). *Dance2Music: Music-Conditioned Pose Generation*. Hugging Face.
- Contacto declarado en la model card: genthonemma@gmail.com
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo; los enlaces devueltos corresponden a páginas de traducción sin relación con el proyecto.
