# poysama/tempo-beat-this-small

## Resumen

`poysama/tempo-beat-this-small` es una exportación a ONNX del checkpoint `small0` del modelo Beat This!, desarrollado por el Institute of Computational Perception de la JKU Linz (Foscarin, Schlüter y Widmer, ISMIR 2024). No es un modelo de lenguaje: es un sistema de *beat tracking* y *downbeat tracking* musical, es decir, detecta la posición de los pulsos y los acentos de compás en una señal de audio. La exportación la publica el usuario poysama para integrarla en el navegador dentro de su herramienta de arreglos musicales Tempo.

El problema que resuelve es la estimación automática de tempo y estructura rítmica a partir de audio, una tarea clásica de MIR (Music Information Retrieval) que resulta necesaria para alinear partituras, cuantizar interpretaciones, sincronizar visuales o generar acompañamientos. Frente a los modelos basados en redes convolucionales o HMM de generaciones anteriores, Beat This! emplea un transformer que procesa espectrogramas y produce activaciones de beat y downbeat, lo que mejora la robustez en repertorios con tempo variable.

La relevancia de esta ficha concreta es de despliegue: el formato ONNX permite ejecutar el modelo en el navegador vía WebAssembly/WebGPU o en entornos sin PyTorch, algo que el checkpoint original no ofrece directamente. La información publicada es muy escasa: no hay parámetros, contexto ni benchmarks en la model card, y el repositorio ocupa 0.0 GB según Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sobre espectrogramas (Beat This!, checkpoint `small0`); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por ventanas; tamaño de ventana no especificado) |
| Tipos de cuantización | no disponible; el artefacto publicado es ONNX (precisión no indicada) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`beat_this_small0.onnx`) |

## Arquitectura y entrenamiento

Según la model card, se trata del checkpoint `small0` de Beat This! (Foscarin, Schlüter y Widmer, ISMIR 2024), exportado a ONNX. El paper original describe un transformer que recibe representaciones tiempo-frecuencia del audio y predice activaciones de beat y downbeat, con un post-procesado tipo *dynamic programming* para obtener la secuencia final de pulsos. La model card de esta exportación no detalla la arquitectura interna, el número de capas, la dimensión oculta ni el mecanismo exacto de atención.

Tampoco se especifican los datos de entrenamiento: número de horas de audio, composición del corpus, ni si hubo etapas de ajuste fino. El autor original advierte que parte del audio de entrenamiento está sujeto a copyright o a licencias Creative Commons limitadas, y deja la evaluación de ese extremo al usuario. No se documenta ningún proceso de RLHF ni de alineación, algo esperable en un modelo de MIR.

## Capacidades

- Detección de beats (pulsos) en audio musical.
- Detección de downbeats (primer pulso de cada compás).
- Estimación implícita de tempo a partir de la secuencia de beats.
- Funcionamiento sobre señal de audio cruda o preprocesada, según el pipeline de la herramienta Tempo; los detalles de preprocesado no están documentados en la model card.
- Ejecución en navegador mediante ONNX Runtime Web (el autor lo integra en Tempo), aunque esta ficha no verifica el backend concreto.
- No soporta tool calling, agentes, generación de texto, visión ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Cuantización de interpretaciones en un editor de partituras: el modelo proporciona la rejilla de beats y downbeats para alinear notas interpretadas con la notación, lo que permite corregir desviaciones de tempo sin intervención manual.
- Sincronización de visuales o iluminación en directo: al conocer los downbeats se pueden disparar cambios de escena o efectos al inicio de cada compás.
- Loops y *sampling*: detectar el primer beat y el compás permite cortar bucles de forma musicalmente coherente en lugar de por duración fija.
- Acompañamiento automático y *beat-synced* efectos: herramientas de arreglo como Tempo pueden usar los pulsos para alinear pistas MIDI generadas o arpegios al audio original.
- Análisis musicológico a escala: extraer tempo y estructura métrica de un catálogo de grabaciones para estudios de interpretación o corpus de investigación.
- Aplicaciones web sin backend pesado: al ser ONNX, el análisis puede ejecutarse en el cliente, lo que evita enviar audio a servidores y reduce costes de infraestructura.
- Preprocesado para otros modelos: la salida de beats sirve como entrada para modelos de separación de fuentes, transcripción o generación musical que requieran una rejilla rítmica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (F-measure de beat/downbeat, accuracy de tempo) ni comparaciones con otros checkpoints de Beat This!.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del checkpoint no figura en la información proporcionada (el repo marca 0.0 GB, dato poco fiable).
- GPU recomendadas: no disponibles. Al ser un modelo `small` de MIR, es plausible que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- Ejecución en CPU: probablemente viable para audio corto, sin cifras publicadas.
- Despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| poysama/tempo-beat-this-small | Beat/downbeat tracking (Beat This! small0) | ONNX | MIT | Hugging Face |
| Beat This! (checkpoints originales, CPJKU) | Beat/downbeat tracking | PyTorch | MIT | GitHub del proyecto |
| madmom (downbeat/beat trackers) | Beat/downbeat tracking (CNN + HMM) | Python | BSD-like (según versión) | PyPI/GitHub |
| BeatNet | Beat/downbeat tracking (CRNN + partículas) | PyTorch | no verificada en esta búsqueda | GitHub |

No se dispone de métricas comparativas publicadas en la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al entrenarse con un corpus musical concreto puede rendir peor en géneros poco representados (música no occidental, tempo libre, rubato extremo).
- Riesgo de errores en cambios de tempo, compases irregulares o métricas no binarias/ternarias; no hay métricas publicadas que cuantifiquen este extremo.
- El autor original advierte de que parte del audio de entrenamiento tiene copyright o licencias Creative Commons limitadas; el uso comercial de los pesos se ampara en la licencia MIT, pero la evaluación de derechos sobre los datos queda en manos del usuario.
- No hay información sobre el preprocesado exacto (sample rate, tamaño de ventana, hop) necesario para reproducir la inferencia; sin él, el ONNX puede dar salidas incorrectas.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere una publicación reciente y sin validación comunitaria.
- No es un modelo de lenguaje: no debe evaluarse con métricas de texto ni usarse para tareas de generación.

## Enlaces

- Hugging Face: https://huggingface.co/poysama/tempo-beat-this-small
- Perfil del autor: https://huggingface.co/poysama
- Repositorio original de Beat This!: https://github.com/CPJKU/beat_this
- Paper de referencia: Foscarin, Schlüter y Widmer, «Beat This! Accurate Beat Tracking Without DBN Postprocessing», ISMIR 2024 (enlace directo no disponible en la búsqueda)
