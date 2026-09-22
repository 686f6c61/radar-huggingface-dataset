# mimbres/spansynth-edit

## Resumen

SpanSynth-Edit es un modelo de síntesis y edición de audio musical guiado por MIDI, desarrollado por el usuario mimbres y publicado en Hugging Face bajo licencia Apache 2.0. Su función es doble: sintetizar mezclas de audio multi-instrumento a partir de una partitura MIDI y editar una grabación existente añadiendo, eliminando o modificando notas mediante la revisión de su MIDI, utilizando el audio que rodea a la región seleccionada como guía de timbre.

El modelo se distribuye con el pipeline audio-to-audio, sigue un enfoque de flow matching y sus pesos están en formato safetensors, con un repositorio de 2,6 GB. La inferencia se realiza mediante una interfaz de línea de comandos (`spansynth-edit`) con dos subcomandos, `edit` y `synthesize`, y funciona en GPU NVIDIA con CUDA y bfloat16, en Apple Silicon a través de Metal (PyTorch MPS) y también en CPU.

Su interés práctico reside en que la edición queda anclada a eventos MIDI en lugar de a descripciones textuales, lo que permite operaciones quirúrgicas sobre regiones concretas de una grabación manteniendo la coherencia tímbrica del resto de la mezcla. El autor no publica el número de parámetros, la composición del dataset de entrenamiento ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de flow matching (detalles de la red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No es contexto de texto: la generación trabaja sobre un recorte de audio de 20,48 s por defecto; el resto de la grabación se conserva sin regenerar |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre audio y MIDI, no sobre texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos del modelo y del códec; descarga automática en el primer uso) |
| Pipeline | audio-to-audio |
| Tareas declaradas | midi-to-audio, audio-to-audio, edición de audio musical |
| Etiquetas | audio, music, midi, midi-to-audio, audio-to-audio, flow-matching |
| Tamano del repositorio | 2,6 GB |
| Entradas | Audio (obligatorio) + MIDI objetivo (obligatorio); opcionalmente MIDI de origen |
| Modos de edición | `ordinary` (spansynth-edit) y `flowedit` (spansynth-edit + flowedit) |
| Muestreo por defecto | 16 pasos Euler, escala de guiado CFG 2,0 |
| Descargas | 0 |
| Likes | 0 |
| Fecha de publicacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

SpanSynth-Edit se basa en flow matching: el muestreo se realiza con un integrador Euler configurable (16 pasos por defecto) y una escala de classifier-free guidance aplicada a la condición MIDI (`--cfg`, 2,0 por defecto). El modelo opera sobre una ventana de audio de 20,48 s y genera únicamente la región seleccionada, mientras que el audio fuera de esa región se conserva tal cual. La condición de audio circundante actúa como guía de timbre, lo que permite que las notas generadas encajen con el material original sin necesidad de especificar el instrumento por texto.

La edición admite dos variantes. El método `ordinary` (denominado `spansynth-edit`) recibe directamente el MIDI revisado, incluyendo las notas que deben permanecer inalteradas dentro de la región seleccionada. El método `flowedit` (`spansynth-edit` + `flowedit`) requiere además el MIDI original y aplica una técnica de edición de flujos sin inversión. Existen dos modificadores de condicionamiento: `--context-midi`, que usa el MIDI original fuera de la región generada, y `--drop-context-audio`, que elimina la condición de audio contextual.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones arquitectónicas adicionales más allá del esquema de condicionamiento por MIDI y contexto de audio descrito. Tampoco se detalla la topología interna de la red generativa.

## Capacidades

- Síntesis MIDI a audio de mezclas multi-instrumento: convierte una partitura MIDI en audio en la región seleccionada de una grabación.
- Edición de audio guiada por MIDI: añadir, eliminar o modificar notas revisando el MIDI de la grabación.
- Guiado de timbre por contexto: utiliza el audio que rodea la región generada para mantener la coherencia tímbrica.
- Edición sin inversión mediante el método `flowedit`, que emplea el MIDI original y el revisado.
- Preservación del audio fuera de la región generada, sin regeneración del resto de la mezcla.
- Control de la fuerza del condicionamiento MIDI mediante la escala CFG.
- Control del coste de muestreo mediante el número de pasos Euler.
- Condicionamiento opcional con el MIDI original fuera de la región (`--context-midi`).
- Validación previa de entradas (`--check-inputs`) sin cargar el modelo.
- Ejecución en CUDA (bfloat16), Apple Silicon (MPS) y CPU.

No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio-texto ni multilingüismo textual, ya que el modelo no es un modelo de lenguaje.

## Casos de uso

- Corrección de notas en producción musical: si un instrumento toca una nota equivocada o fuera de tempo, se edita el MIDI de la pista y se regenera solo el fragmento afectado, manteniendo el resto de la mezcla intacta y el timbre coherente con el contexto.
- Sustitución de instrumentos sobre una toma existente: se reescribe el MIDI con el nuevo instrumento y el modelo sintetiza esa parte anclándose al audio circundante, útil para maquetas o versiones alternativas de un tema.
- Arreglos y reelaboración de material propio: añadir líneas de acompañamiento o capas de percusión a partir de un MIDI ampliado, sin volver a grabar ni remezclar toda la pieza.
- Generación de maquetas a partir de partituras MIDI: el subcomando `synthesize` produce audio de la partitura en la región seleccionada usando la grabación como contexto, lo que permite escuchar un arreglo antes de grabarlo.
- Creación de variaciones para producción de contenido audiovisual: generar distintas versiones de un mismo pasaje (con más o menos instrumentos, notas alteradas) para bandas sonoras de vídeo, videojuegos o publicidad, con un coste de cómputo bajo (unos 3,9 GiB de VRAM pico medidos).
- Limpieza de tomas con errores puntuales: reparar un acorde mal ejecutado o una nota desafinada editando únicamente esa región del MIDI, conservando la interpretación original en el resto del tema.
- Aumento de datos para investigación en MIR y generación musical: producir pares audio-MIDI editados de forma controlada, útiles como conjunto de evaluación o entrenamiento para tareas de transcripción, separación o síntesis.
- Prototipado rápido en flujos de trabajo con DAW: la CLI admite validación de entradas y tiempos sin cargar el modelo, lo que facilita integrar comprobaciones de audio y MIDI en scripts previos a la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección titulada "Results", pero su contenido no forma parte de los datos proporcionados, por lo que no se reproducen cifras objetivas ni comparaciones numéricas.

## Requisitos de hardware

- VRAM pico medida por el autor: aproximadamente 3,9 GiB en una GH200 con la configuración por defecto (recorte de 20,48 s, 16 pasos Euler, CFG 2,0) para la síntesis y ambos métodos de edición.
- VRAM recomendada por el autor: 6 GB.
- GPU NVIDIA con CUDA y soporte de bfloat16.
- Apple Silicon mediante Metal (PyTorch MPS): probado en un M1 Pro con 16 GB de memoria unificada y PyTorch 2.13.
- Inferencia en CPU soportada, aunque el autor no indica cifras de latencia para ese caso.
- Cabe en GPU de consumo con al menos 6 GB de VRAM, siempre que soporten bfloat16; el autor no enumera modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- Despliegue: instalación del paquete Python con `pip` y uso de la CLI `spansynth-edit` (`edit` y `synthesize`); los pesos del modelo y del códec se descargan automáticamente en el primer uso y no requieren token.
- Entorno: Python 3.11–3.13 con PyTorch; la instalación recomendada usa `git sparse-checkout` para evitar descargar el audio de demostración.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se proporcionan en la información disponible modelos comparables de la misma categoría, ni datos de parámetros, contexto o rendimiento de alternativas (por ejemplo, otros sistemas de síntesis MIDI a audio o de edición de audio musical). Por tanto, la comparativa se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpanSynth-Edit (mimbres) | no disponible | recorte de audio de 20,48 s | no disponible | apache-2.0 | pesos safetensors en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos específicos del modelo; al tratarse de un modelo musical, los sesgos se manifestarían como desviaciones de estilo o de instrumentación respecto a los datos de entrenamiento, cuya composición no se publica.
- Riesgo de alucinación en sentido musical: las notas generadas pueden no corresponder exactamente al MIDI solicitado, especialmente con recortes largos o valores bajos de CFG; el autor expone el CFG como palanca de control.
- La ventana de generación por defecto es de 20,48 s de audio; no se documenta el comportamiento con regiones más largas ni si el recorte es configurable.
- La edición está limitada a la región seleccionada: el audio fuera de ella se conserva sin modificar, de modo que cambios globales requieren varias operaciones.
- No hay soporte de condicionamiento por texto ni interfaz conversacional; las entradas son audio y MIDI.
- El modelo no es un modelo de lenguaje: no aplican capacidades multilingües textuales, tool calling ni razonamiento multi-paso.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales indicadas por el autor; conviene revisar igualmente las licencias de los pesos del códec y de las dependencias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente y no hay evidencia externa de robustez en producción.
- No se publican detalles del dataset de entrenamiento, lo que dificulta evaluar cobertura de géneros, instrumentos y calidad de grabación.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los enlaces devueltos corresponden a turismo de Múnich), por lo que no hay fuentes independientes que confirmen o amplíen las afirmaciones de la model card.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mimbres/spansynth-edit
- Repositorio de código fuente en GitHub: https://github.com/mimbres/spansynth-edit
- Demos de audio: https://mimbres.github.io/spansynth-edit/
- Archivos de ejemplo usados en la documentación (audio MP3 y MIDI original/revisado): https://raw.githubusercontent.com/mimbres/spansynth-edit/main/demo/assets/
- Imagen de vista general del modelo: https://raw.githubusercontent.com/mimbres/spansynth-edit/main/demo/assets/FigureDraft-fig1-retro-04.svg
- Búsqueda web: sin resultados relevantes sobre el modelo (los enlaces devueltos corresponden a portales turísticos de Múnich y no guardan relación con SpanSynth-Edit).
