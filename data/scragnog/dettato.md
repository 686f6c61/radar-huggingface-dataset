# scragnog/dettato

## Resumen

dettato es un sistema de transcripcion musical automatica (AMT) desarrollado por KobiMusic que convierte audio en eventos MIDI estructurados. No se trata de un unico modelo, sino de una cadena de cuatro modelos especializados que trabajan de forma secuencial: un transcriptor que extrae notas del audio, un reparador de evidencia que elimina notas espurias y ajusta los tiempos, un agrupador que asigna las notas a pistas de instrumento con nombre, y un transcriptor especifico de percusion. El repositorio `scragnog/dettato` es un espejo byte a byte de la version 2.0.0 publicada por KobiMusic, creado para el port nativo en C++/GGML que utiliza la aplicacion HOT-Step.

La relevancia de este modelo reside en su enfoque modular: en lugar de un modelo monolitico de audio-a-MIDI, separa la transcripcion, la limpieza y la asignacion de instrumentos en etapas independientes, lo que permite validar y depurar cada fase por separado. Los cuatro conjuntos de pesos son de tamano reducido (entre 11,6 MB y 61,2 MB), lo que los hace aptos para inferencia en CPU y en GPUs de consumo.

La licencia del codigo y de los pesos es Apache 2.0, aunque las model cards originales advierten de que parte de los datos de entrenamiento del agrupador y del modelo de percusion (MUSDB18 e IRMAS) tienen licencia solo para investigacion no comercial, lo que constituye una consideracion importante antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cuatro modelos especializados en cadena; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible (tamanos de fichero: 61,2 MB transcriptor, 19,7 MB reparador, 11,6 MB agrupador, 20,2 MB percusion) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el port usa float32 en CPU) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache 2.0 (pesos y codigo) |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` por cada uno de los cuatro modelos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los cuatro modelos. Lo que si se conoce es su organizacion funcional en pipeline: `dettato` (transcriptor de audio a notas), `dettato-evidence` (reparador que descarta notas sueltas y ajusta los tiempos de nota), `dettato-grouper` (asignacion de notas a pistas de instrumento con nombre) y `dettato-drums` (transcriptor de golpes de percusion). Cada carpeta contiene un unico `model.safetensors` y su `config.json`, sin modificaciones respecto al original.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Las model cards originales del agrupador y del modelo de percusion mencionan el uso de MUSDB18 e IRMAS como parte de los datos de entrenamiento, ambos con licencia de investigacion no comercial. El port en C++ de HOT-Step esta fijado al commit upstream `51ade0f09f2272f4674166026582185d26baaeaf` y se ha validado contra la version 2.0.0 en CPU con float32, con el reparador de evidencia activado y desactivado.

## Capacidades

- Transcripcion de audio musical a eventos de nota (tono, inicio, duracion y confianza).
- Reparacion de evidencia: eliminacion de notas espurias y ajuste fino de los tiempos de nota.
- Agrupacion de notas en pistas de instrumento con nombre.
- Transcripcion de golpes de percusion con velocidad aprendida.
- Salida orientada a MIDI, integrable en herramientas de produccion musical.
- Ejecucion en CPU (float32) y en CUDA; soporte de Vulkan en tarjetas NVIDIA.
- No se documentan capacidades de texto, vision, tool calling ni agentes; es un modelo puramente de audio a audio/MIDI.

## Casos de uso

- Transcripcion de grabaciones a partitura MIDI: el pipeline completo convierte una mezcla de audio en pistas MIDI separadas por instrumento, util para digitalizar maquetas o grabaciones antiguas.
- Separacion de pistas para remezcla: el agrupador asigna las notas detectadas a pistas con nombre, lo que permite reconstruir una sesion multipista a partir de una mezcla estereo.
- Extraccion de linea de bajo o melodia: usando solo el transcriptor y filtrando por rango de tono, se puede aislar una linea concreta para sampleado o analisis armonico.
- Transcripcion de bateria para produccion electronica: el modelo de percusion genera golpes con velocidad aprendida, apto para reconstruir patrones ritmicos o alimentar un secuenciador.
- Analisis musical asistido por computadora: la salida con marcas de confianza y tiempos precisos sirve para estudios de interpretacion, comparacion de versiones o investigacion en musicologia computacional.
- Integracion en DAWs y herramientas de edicion: el port nativo en C++/GGML de HOT-Step permite incorporar la transcripcion dentro de una aplicacion de escritorio sin dependencias de Python, con verificacion de hashes en el gestor de modelos.
- Limpieza de transcripciones existentes: el reparador de evidencia puede aplicarse sobre notas ya detectadas para eliminar falsos positivos y ajustar tiempos antes de exportar a MIDI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de los pesos (suma aproximada de 113 MB en float32), la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no se especifican modelos concretos; el port ha sido medido en CUDA y CPU. Se indica que Vulkan funciona en tarjetas NVIDIA; AMD no ha sido probado en hardware real.
- GPU de consumo: por el reducido tamano de los pesos, es previsible que quepa en GPUs de consumo, aunque la informacion no confirma modelos concretos.
- Opciones de despliegue: port nativo C++/GGML en HOT-Step (MIDI Studio y Cover Studio); CLI `ace-midi --dettato-model <dir>`; instalacion manual en `models/muscriptor/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros sistemas de transcripcion musical automatica ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La velocidad de las notas con tono se calcula como `20 + 107 * confidence`, es decir, refleja la confianza del modelo y no la intensidad real de la interpretacion; solo los golpes de percusion tienen velocidad aprendida.
- Los nombres de instrumento se mapean a los de HOT-Step; el programa de ensemble de cuerdas (44) de dettato se escribe como 48, lo que puede introducir discrepancias respecto a la salida upstream.
- Una ejecucion del agrupador en GPU puede colocar algunas notas en una pista distinta que la ejecucion en CPU, igual que ocurre en la ejecucion GPU del propio upstream; la validacion se basa en la dispersion medida en upstream.
- Solo se han medido CUDA y CPU; Vulkan funciona en NVIDIA pero AMD no se ha probado en hardware real.
- Parte de los datos de entrenamiento del agrupador y del modelo de percusion (MUSDB18 e IRMAS) tiene licencia solo para investigacion no comercial; aunque los pesos son Apache 2.0, el usuario debe evaluar si esto afecta a su uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma, ni sobre el rendimiento en generos musicales distintos de los presentes en los datos de entrenamiento.
- El repositorio es un espejo sin modificaciones; cualquier actualizacion de pesos upstream requerira una nueva copia y actualizacion de los hashes del registro.

## Enlaces

- Repositorio del espejo: https://huggingface.co/scragnog/dettato
- Codigo upstream: https://github.com/kobimusic/dettato
- Modelos upstream: https://huggingface.co/kobimusic
- Modelo base transcriptor: https://huggingface.co/kobimusic/dettato
- Modelo base reparador: https://huggingface.co/kobimusic/dettato-evidence
- Modelo base agrupador: https://huggingface.co/kobimusic/dettato-grouper
- Modelo base percusion: https://huggingface.co/kobimusic/dettato-drums
