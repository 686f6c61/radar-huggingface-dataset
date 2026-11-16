# kyupark/seamkit

## Resumen

seamkit es una herramienta de procesado de audio desarrollada por el usuario kyupark y publicada en Hugging Face. No es un modelo de inteligencia artificial en sentido estricto, sino un pipeline de scripts en Python que construye unidades de audio repetibles a partir de pistas musicales completas, evitando los artefactos habituales (saltos de nivel, tempo y tonalidad) que aparecen al concatenar canciones enteras. El nombre hace referencia a la idea de crear bucles sin costuras ("seams") entre fragmentos.

La herramienta opera sobre ficheros de audio locales (mp3, m4a, wav, flac, ogg, opus, aac y aiff) y genera, por cada pista, un fragmento alineado a compases que se repite de forma interna entre 6 y 9 minutos. Para ello utiliza análisis de beats y tempo con librosa, selección de candidatos por similitud cromática (chroma CENS) y continuidad energética, y un mecanismo de "sellado" con crossfade de potencia igual que hace que los dos samples del punto de repetición sean consecutivos en el audio original.

El repositorio no incluye pesos, arquitectura neuronal, licencia ni idiomas declarados; la model card está redactada en coreano y describe exclusivamente el uso de la herramienta. Cualquier evaluación como modelo fundacional, de lenguaje o multimodal no es posible con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (herramienta de procesado de audio basada en scripts Python; no es un modelo neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la documentacion esta en coreano; la herramienta procesa audio, no texto) |
| Licencia | No disponible |
| Formato de pesos | No disponible (no publica pesos; distribucion via codigo y requirements.txt) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: seamkit no es un modelo entrenado. La model card describe un pipeline determinista compuesto por scripts Python (`run_seamkit.py` y `struct_loop.py`) que dependen de numpy, soundfile y librosa, y que requieren ffmpeg instalado en el sistema. El procesamiento consta de cinco etapas: deteccion de rejilla de compases (beats y tempo via librosa, compas de 4 pulsos, seleccion de ancla por comparacion de fase de downbeat con intensidad de onsets), generacion de candidatos limitados a cortes en compases enteros con duracion de 2,4 a 3,1 minutos (relajable a 2,0), puntuacion de cada candidato, sellado del bucle y verificacion.

La puntuacion combina una similitud cromatica (0,75 de peso) entre los 0,5 segundos iniciales y finales del segmento, una continuidad energetica (0,25 de peso) y una penalizacion por fluctuacion de nivel (si la desviacion tipica del RMS por segundo supera 3 dB, se aplica 3/sigma con suelo de 0,6). Existen compuertas duras: RMS en ambos extremos al menos el 12,6 % de la mediana de la pista (-18 dB) y diferencia de nivel entre extremos inferior o igual a 10 dB. El sellado aplica un crossfade equal-power (qsin) de 0,25 a 0,5 segundos y fuerza `unit[0] = seg[L-x]` para que los dos samples del punto de repeticion sean contiguos en el original, lo que elimina el click por construccion. La verificacion compara la delta RMS del empalme con el percentil 90 del escalon natural en los limites de compas de la propia pista.

No se documentan datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia neuronal (decodificacion especulativa, atencion lineal, etc.), porque no existen en este proyecto.

## Capacidades

- Generacion de unidades de audio repetibles ("structloop") de 6 a 9 minutos a partir de pistas musicales, con repeticiones internas calculadas como `reps = clamp(round(7.0/L), 2, 3)`.
- Deteccion de beats, tempo y rejilla de compases de 4 pulsos, con seleccion de ancla por fase de downbeat.
- Seleccion de candidatos restringida a cortes en compases enteros, evitando desalineaciones de tempo.
- Puntuacion de candidatos por similitud cromatica (chroma CENS) y continuidad energetica, con compuertas de nivel y diferencia de RMS.
- Sellado con crossfade equal-power y garantia de continuidad de samples en el punto de repeticion.
- Verificacion objetiva de cada empalme: delta RMS a 150 ms, ratio de clicks frente al percentil 99,9 de la forma de onda natural y desviacion tipica de RMS por segundo.
- Concatenacion opcional de unidades con crossfade configurable (`--concat --xfade`), con recomendacion de 3 a 4 segundos.
- Procesamiento por lotes de carpetas completas, con limite configurable (`--limit`) y salida estructurada en `plan.json`, `report.json` y ficheros WAV.
- No dispone de tool calling, razonamiento multi-paso, capacidades multimodales ni generacion de texto.

## Casos de uso

- Creacion de camas musicales largas para podcasts o audiolibros: a partir de una carpeta de pistas, seamkit genera unidades de 6 a 9 minutos que se pueden concatenar con crossfade de 3 a 4 segundos, reduciendo el trabajo manual de edicion y evitando saltos audibles en el punto de union.
- Generacion de bucles para instalaciones sonoras o exposiciones: la garantia de continuidad de samples en el punto de repeticion permite reproducir la unidad en bucle durante horas sin clicks perceptibles, algo critico en salas silenciosas.
- Bandas sonoras para videojuegos con musica dinamica: las unidades estructuradas se pueden usar como capas de fondo que se repiten mientras el jugador permanece en una zona, con transiciones entre capas controladas por el motor del juego.
- Produccion de playlists de fondo para eventos o gimnasios: la recomendacion de ordenar las unidades por BPM ascendente permite construir una progresion monotona de tempo que reduce la sensacion de discontinuidad entre pistas.
- Preprocesado en pipelines de datos de audio: los ficheros `report.json` incluyen metricas objetivas por pista (similitud cromatica, continuidad energetica, desviacion de RMS, ratio de clicks) que se pueden usar para filtrar o clasificar material musical de forma automatizada.
- Prototipado rapido de demos musicales: con un coste de 3 a 8 segundos por pista en un nucleo ARM (aproximadamente 4 minutos para 45 pistas), se puede iterar sobre un catalogo completo antes de decidir que pistas requieren edicion manual.
- Investigacion sobre analisis musical: la deteccion de beats, la fase de downbeat y las metricas de continuidad cromatica y energetica pueden servir como referencia o linea base para experimentos de estructura musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de rendimiento del pipeline: similitud cromatica medida entre 0,82 y 0,94 en los casos procesados, y un coste de procesamiento de 3 a 8 segundos por pista en un nucleo ARM (aproximadamente 4 minutos para 45 pistas).

## Requisitos de hardware

- VRAM: no aplica; la herramienta se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica.
- CPU: funciona en un nucleo ARM segun las mediciones del autor (3 a 8 segundos por pista).
- Dependencias del sistema: ffmpeg (instalable via brew, apt o winget) y Python 3 con entorno virtual.
- Dependencias Python: numpy, soundfile y librosa, declaradas en `requirements.txt`.
- Despliegue: ejecucion local mediante `python3 run_seamkit.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Almacenamiento temporal: los ficheros intermedios se crean en `TMPDIR/seamkit`, configurable mediante la variable de entorno `SEAMKIT_SCRATCH`.
- Latencia y throughput: 3 a 8 segundos por pista en ARM de un nucleo; el autor no reporta cifras para x86.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre herramientas comparables en el repositorio ni en la model card, y seamkit no es un modelo neuronal, por lo que la comparacion con modelos fundacionales no resulta significativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no dispone de pesos, vocabulario ni tokenizador; evaluarlo como modelo de lenguaje o multimodal seria un error de categoria.
- Licencia no declarada: no se especifica ninguna licencia en el repositorio, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Idiomas no declarados: la model card esta en coreano y no se indica soporte multilingue de la documentacion.
- Dependencia de la deteccion de beats: pistas con cambios de tempo grandes o con extremos demasiado silenciosos pueden fallar; el autor recomienda revisar el campo `error` de las entradas con `status:error` en `report.json`.
- Riesgo de empalmes audibles: si el punto de union se percibe, el autor sugiere subir `XFADE_MIN` y `XFADE_MAX` de 0,25–0,5 a 0,4–0,8, asumiendo mayor riesgo de colision tonal.
- Limitacion en la concatenacion: crossfades superiores a 8 segundos entre unidades pueden hacer que se perciban dos canciones simultaneas; el autor recomienda 3 a 4 segundos.
- Sin garantias de calidad musical: las metricas de similitud cromatica y continuidad energetica son heuristicas y no equivalen a una evaluacion perceptual.
- Proyecto con cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (16 de noviembre de 2026), lo que sugiere un repositorio recien publicado y sin validacion por parte de la comunidad.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto porque no aplican a una herramienta de procesado de audio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kyupark/seamkit
- No se han encontrado otros enlaces (papers, blogs, repositorios de codigo, demos) en la informacion disponible.
