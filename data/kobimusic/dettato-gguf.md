# kobimusic/dettato-gguf

## Resumen

dettato-gguf es la distribucion en formato GGUF del conjunto de modelos dettato, una familia de cuatro redes neuronales especializadas en transcripcion musical automatica (audio a MIDI) multi-instrumento. Lo desarrolla kobimusic y lo publica como un unico fichero GGUF que agrupa los cuatro componentes del sistema: un transcriptor principal (15,3 M de parametros), un reparador de evidencia (4,9 M), un agrupador de notas por instrumento (2,9 M) y un modulo especifico de bateria (5,0 M). En total, el fichero empaqueta 32.484.250 parametros.

La relevancia de esta publicacion es que traslada un pipeline de transcripcion musical que originalmente dependia de Python y safetensors a un runtime C++ puro basado en ggml (dettato.cpp), ejecutable en CPU, Metal o Vulkan sin dependencias de Python. Esto habilita el despliegue en entornos embebidos, aplicaciones de escritorio y flujos de produccion donde instalar un stack de ML en Python no es viable.

El modelo no es un LLM: no genera texto ni mantiene conversaciones. Es un sistema de inferencia acustica orientado a una tarea concreta, con licencia Apache-2.0 y un tamano de repositorio de 0,2 GB, lo que lo hace muy ligero frente a los modelos generativos habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal acustica multi-componente (transcriptor, reparador de evidencia, agrupador por instrumento y modulo de bateria); detalles de capas no disponibles |
| Parametros totales | 32.484.250 (15,3 M transcriptor + 4,9 M reparador + 2,9 M agrupador + 5,0 M bateria) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | f16 (73,7 MB) y f32 (130,0 MB) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml), con checksums en SHA256SUMS |

## Arquitectura y entrenamiento

El sistema dettato se compone de cuatro modelos que se ejecutan en cadena sobre una misma senal de audio. El transcriptor principal (15,3 M de parametros) extrae las notas; el reparador de evidencia (4,9 M) corrige y consolida las detecciones; el agrupador (2,9 M) asigna las notas a pistas de instrumento; y el modulo de bateria (5,0 M) se encarga especificamente de la percusion. La model card no detalla la topologia interna de cada red (tipo de capas, atencion, convoluciones ni funcion de perdida), por lo que esa informacion debe consultarse en las fichas de los repositorios base.

El proceso de conversion a GGUF, realizado con `py/convert.py` de dettato.cpp, pliega los pesos de BatchNorm, LayerNorm y layer scale en las capas adyacentes, rellena las cabezas de atencion del transcriptor de 46 a 48 y almacena los filterbanks para que el codigo C++ no tenga que construirlos. Segun el autor, estos cambios solo alteran los resultados por redondeo. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o ajuste fino preferencial.

## Capacidades

- Transcripcion automatica de audio musical a MIDI (audio-to-MIDI) multi-instrumento.
- Separacion y asignacion de notas a pistas de instrumento mediante el modulo agrupador.
- Transcripcion especifica de bateria y percusion con el modulo dedicado.
- Reparacion y consolidacion de detecciones de notas mediante el modulo de evidencia.
- Ejecucion en CPU, Metal y Vulkan a traves de ggml, sin Python.
- Distribucion en un unico fichero GGUF que integra los cuatro modelos del pipeline.
- No soporta generacion de texto, tool calling, agentes, vision ni audio en sentido generativo; su alcance es exclusivamente la transcripcion musical.

## Casos de uso

- Transcripcion de grabaciones musicales a partituras MIDI: el pipeline completo convierte un fichero WAV en notas MIDI editables, util para compositores que quieran digitalizar maquetas o directos.
- Generacion de partituras para bateria: el modulo de bateria permite aislar la transcripcion de percusion en grabaciones con bateria real, siempre que el audio se haya registrado a 40 kHz o mas.
- Integracion en aplicaciones de escritorio sin Python: al ejecutarse con ggml en CPU, Metal o Vulkan, dettato.cpp permite incorporar transcripcion musical a herramientas nativas sin empaquetar un entorno Python.
- Analisis musical y musicologia computacional: la salida MIDI multi-instrumento facilita el estudio de interpretaciones, la comparacion de versiones y el analisis de estructura en grabaciones.
- Preprocesado para produccion musical y remezcla: la separacion por pistas de instrumento sirve como paso previo a tareas de edicion, cuantizacion o reorquestacion en un DAW.
- Despliegue en hardware modesto o embebido: con 73,7 MB en f16 y ejecucion en CPU, el modelo cabe en dispositivos con recursos limitados donde no es viable un stack de ML pesado.
- Investigacion y evaluacion de sistemas de transcripcion: el codigo C++ y los benchmarks publicados permiten reproducir y comparar resultados frente a la implementacion Python.

## Benchmarks y rendimiento

| Benchmark | dettato.cpp (GGUF) | Paquete Python (safetensors) |
|---|---|---|
| F1 compuesto (Bach10, Dagstuhl ChoirSet, PHENICX-Anechoic, RWC Royalty-Free) | 67,74 | 67,51 |
| Tiempo de transcripcion de una cancion de 4 minutos (RTX 5060) | 12,2 s | 20,7 s |

Los datos proceden de la model card del autor. No se han publicado en la informacion disponible resultados desglosados por cada conjunto de benchmark ni comparaciones con otros sistemas de transcripcion musical.

## Requisitos de hardware

- VRAM estimada: minima; el fichero f16 ocupa 73,7 MB y el f32 130,0 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta pruebas en una RTX 5060. Al ejecutarse sobre ggml, funciona en CPU, Metal (Apple) y Vulkan.
- GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: dettato.cpp (CLI y API C++), con soporte de ggml en CPU, Metal y Vulkan. La via Python se cubre con el paquete dettato y los repositorios safetensors, no con este GGUF.
- Latencia y throughput: 12,2 segundos para una cancion de 4 minutos en una RTX 5060 segun el autor; no se dispone de cifras para CPU ni para otros aceleradores.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| dettato-gguf | 32,5 M | GGUF (ggml) | Apache-2.0 | Pipeline de 4 modelos, ejecucion C++ sin Python |
| dettato (safetensors) | 32,5 M (mismos pesos) | safetensors | Apache-2.0 | Requiere paquete Python; mismo rendimiento (F1 67,51) |
| Otros sistemas de transcripcion musical | no disponible | no disponible | no disponible | No se aportan comparaciones en la informacion disponible |

La unica comparacion documentada es interna, frente a la version safetensors del mismo sistema. No se dispone de datos frente a alternativas de la categoria.

## Limitaciones y advertencias

- El paso mas debil del pipeline es la asignacion de notas a las pistas de instrumento correctas, segun reconoce el autor.
- La salida es MIDI de interpretacion, no cuantizado a pulso, lo que puede requerir postprocesado para obtener partituras limpias.
- El modulo de bateria solo funciona con audio grabado a 40 kHz o superior.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No se detallan sesgos conocidos, tasas de alucinacion ni limitaciones por idioma en la informacion disponible; al operar sobre audio, el idioma no aplica directamente.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los repositorios base y del codigo dettato.cpp.
- El rendimiento reportado procede de pruebas del propio autor; no hay evaluacion independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/kobimusic/dettato-gguf
- Repositorio base principal: https://huggingface.co/kobimusic/dettato
- Repositorio del reparador de evidencia: https://huggingface.co/kobimusic/dettato-evidence
- Repositorio del agrupador: https://huggingface.co/kobimusic/dettato-grouper
- Repositorio del modulo de bateria: https://huggingface.co/kobimusic/dettato-drums
- Codigo dettato.cpp: https://github.com/hidude562/dettato.cpp
- Documentacion del modelo: https://github.com/hidude562/dettato.cpp/blob/main/docs/MODEL.md
- Documentacion de benchmarks: https://github.com/hidude562/dettato.cpp/blob/main/docs/BENCHMARK.md
- Paquete Python: https://github.com/kobimusic/dettato
- Sitio web del autor: https://kobi.music
