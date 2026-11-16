# happytunesai/beat-this-onnx

## Resumen

Beat This! es un modelo de seguimiento de pulso musical (beat tracking) y de tiempos fuertes (downbeat tracking) desarrollado originalmente por el Institute of Computational Perception de la JKU Linz (Foscarin, Schlüter y Widmer, ISMIR 2024). El repositorio `happytunesai/beat-this-onnx` no es el modelo original, sino una conversión a ONNX del checkpoint `final0` realizada por el usuario happytunesai para integrarlo en su editor MIDI (MidiEditor AI).

El modelo resuelve un problema clásico de recuperación de información musical: dado un audio, estimar la posición temporal de cada pulso (beat) y de cada tiempo fuerte (downbeat), lo que permite derivar tempo, compases y compás de la grabación. La innovación del trabajo original es prescindir del postprocesado con redes bayesianas dinámicas (DBN), habitual en los sistemas previos, y obtener directamente los logits de beat y downbeat a 50 fotogramas por segundo.

La conversión se compone de dos grafos ONNX: un frontend que transforma audio a 22,05 kHz en tramas log-mel y un modelo tracker de 79 MB. Esto permite ejecutar la inferencia con ONNX Runtime sin depender de Python, lo que facilita su integración en aplicaciones de escritorio. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y un tamaño total de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para beat/downbeat tracking (detalle exacto no disponible; basada en el checkpoint `final0` de Beat This!) |
| Parametros totales | no disponible (pesos del tracker: 79 MB en ONNX) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por fragmentos; 50 fotogramas por segundo de salida) |
| Tipos de cuantizacion | no disponible (export ONNX en precision original) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`beat_frontend.onnx`, `beat_model.onnx`, `beat_this.json`) |

## Arquitectura y entrenamiento

El modelo original Beat This! es un sistema de seguimiento de pulso que predice directamente logits de beat y downbeat a partir de tramas espectrales, eliminando el postprocesado con DBN que se usaba en sistemas anteriores. La conversión a ONNX separa el pipeline en dos grafos: `beat_frontend.onnx` (0,3 MB) convierte audio a 22,05 kHz en tramas log-mel mediante una STFT Hann de 1024 puntos, hop de 441 muestras, 128 bandas mel entre 30 y 11000 Hz y transformación `log1p(1000 x)`; `beat_model.onn` (79 MB) transforma esas tramas en logits de beat y downbeat a 50 fotogramas por segundo.

Los pesos son los del checkpoint original `final0`; no se ha reentrenado nada. El troceado del audio en fragmentos y la selección de beats a partir de los logits corre a cargo del usuario, igual que en el código original. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni si se usó RLHF/DPO, ya que la model card no la detalla.

## Capacidades

- Seguimiento de pulso (beat tracking) sobre audio musical.
- Seguimiento de tiempos fuertes (downbeat tracking).
- Estimación de tempo, compases y compás de una grabación a partir de los beats y downbeats detectados.
- Extracción de características espectrales (log-mel) integrada en el grafo ONNX.
- Ejecución con ONNX Runtime sin dependencia de Python.
- Integración en aplicaciones de escritorio (MidiEditor AI, vía MidiCreator > Transcribe > "Models...").
- No soporta tool calling, agentes, visión, audio generativo ni capacidades multilingües; es un modelo especializado de análisis musical.

## Casos de uso

- Transcripción asistida en editores MIDI: el modelo permite a MidiEditor AI alinear una grabación con la rejilla de compases, de modo que el usuario pueda trabajar sobre una partitura MIDI sincronizada con el audio original.
- Análisis rítmico de bibliotecas musicales: extraer tempo y compás de forma automática para organizar colecciones por BPM o por métrica.
- Sincronización de letras y partituras: los downbeats permiten segmentar la grabación en compases y alinear texto o notación con el audio.
- Herramientas de DJ y remezcla: detección de beats para beatmatching y de downbeats para cortes en fronteras de compás.
- Investigación en recuperación de información musical: evaluación de sistemas de beat tracking sin postprocesado DBN, replicando el pipeline original en entornos sin Python.
- Aplicaciones educativas de ritmo: visualización de pulsos y tiempos fuertes sobre una grabación para ejercicios de solfeo o percusión.
- Integración en pipelines de escritorio con ONNX Runtime: despliegue ligero (unos 80 MB de pesos) en aplicaciones nativas que no pueden depender de un entorno Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (F-measure, CMLt, AMLt, etc.) ni comparaciones numéricas con otros sistemas; únicamente remite al paper de ISMIR 2024 para los resultados del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tracker ocupa 79 MB en ONNX y el frontend 0,3 MB, por lo que el consumo de memoria es muy bajo y apto para CPU.
- GPU recomendadas: no disponible; el modelo es lo suficientemente pequeño para ejecutarse en CPU y en cualquier GPU consumer moderna.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño reducido de los pesos; también en CPU.
- Opciones de despliegue: ONNX Runtime (principal, tal como se documenta); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible; la salida se produce a 50 fotogramas por segundo, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Beat This! (ONNX, este repo) | Beat/downbeat tracking | no disponible (79 MB ONNX) | no disponible | MIT | ONNX | Hugging Face |
| Beat This! (original, CPJKU) | Beat/downbeat tracking | no disponible | no disponible | MIT | PyTorch (checkpoint `final0`) | GitHub CPJKU/beat_this |
| Sistemas con postprocesado DBN (p. ej. madmom) | Beat/downbeat tracking | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación anterior es únicamente cualitativa y basada en la información disponible.

## Limitaciones y advertencias

- Es una conversión no oficial: el repositorio no está afiliado a los autores originales; cualquier crédito del modelo corresponde a CPJKU.
- El troceado del audio y la selección de beats a partir de los logits debe implementarlo el usuario; el modelo no incluye ese postprocesado.
- Los autores originales advierten que parte de los archivos de entrenamiento están totalmente protegidos por copyright o bajo licencias Creative Commons limitadas; corresponde al usuario evaluar si esto afecta a su uso.
- La licencia MIT se aplica al código y a los pesos publicados, pero no elimina las posibles restricciones sobre los datos de entrenamiento.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que el modelo procesa audio y no genera texto.
- No se publican métricas de rendimiento ni límites de contexto en la model card; no se puede evaluar la precisión esperada a partir de la información disponible.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado el mismo día (16 de noviembre de 2026), por lo que su madurez y mantenimiento no están contrastados.
- Se proporciona "tal cual", sin garantía alguna, según indica el autor de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/happytunesai/beat-this-onnx
- Código y pesos originales: https://github.com/CPJKU/beat_this
- Aplicación que integra la conversión: https://github.com/happytunesai/MidiEditor_AI
- Paper: Foscarin, Schlüter, Widmer, "Beat This! Accurate Beat Tracking Without DBN Postprocessing", ISMIR 2024 (citado en la model card; no se proporciona URL directa)
