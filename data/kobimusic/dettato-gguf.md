# kobimusic/dettato-gguf

## Resumen

dettato-gguf es la distribucion en formato GGUF del sistema dettato, un conjunto de cuatro modelos especializados en transcripcion musical automatica (audio a MIDI) multi-instrumento. Lo desarrolla kobimusic y lo empaqueta el autor del repositorio `kobimusic/dettato-gguf` a partir de los pesos originales en safetensors. El paquete agrupa en un unico fichero los cuatro componentes del sistema: un transcriptor principal, un reparador de evidencias, un agrupador de notas por instrumento y un modelo especifico de bateria.

El modelo resuelve el problema de convertir una grabacion de audio polifonica en una representacion MIDI con asignacion de instrumentos. No es un modelo de lenguaje: es un sistema acustico de vision estrecha sobre audio, con 32,48 millones de parametros totales repartidos entre los cuatro modulos (15,3M el transcriptor, 4,9M el reparador, 2,9M el agrupador y 5,0M el de bateria). Su relevancia actual radica en que permite ejecutar todo el pipeline sin Python, mediante ggml sobre CPU, Metal o Vulkan, con un rendimiento declarado ligeramente superior al paquete Python original.

La distribucion incluye dos ficheros: `dettato-f16.gguf` (73,7 MB) y `dettato-f32.gguf` (130,0 MB). El primero es el recomendado para uso general; el segundo existe para pruebas de paridad numerica. La conversion pliega BatchNorm, LayerNorm y los pesos de layer scale en las capas adyacentes, rellena las cabezas de atencion del transcriptor de 46 a 48 y almacena los filterbanks para que el codigo C++ no tenga que construirlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de cuatro modulos acusticos; no se detalla la topologia interna en la informacion proporcionada) |
| Parametros totales | 32.484.250 (15,3M transcriptor + 4,9M reparador de evidencias + 2,9M agrupador + 5,0M bateria) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y f32 (no se ofrecen cuantizaciones de menor precision tipo Q4/Q8) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para dettato.cpp); los originales estan en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de los modulos (tipo de capas, mecanismo de atencion, representacion de entrada). Lo que si se detalla es la composicion del sistema y el proceso de conversion a GGUF: se pliegan las normalizaciones (BatchNorm, LayerNorm) y los pesos de layer scale en las capas contiguas, se rellenan las cabezas de atencion del transcriptor de 46 a 48 y se embeben los filterbanks. Segun el autor, estos cambios solo alteran los resultados por redondeo numerico.

El sistema se compone de cuatro modelos entrenados por separado: un transcriptor principal, un reparador de evidencias, un agrupador de notas por instrumento y un modelo de bateria. Los pesos convertidos corresponden a revisiones concretas de cada repositorio base (`a0d1e354`, `5633f28e`, `5a94cea2`, `97801f23`). No se proporcionan datos sobre el volumen de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un modelo de transcripcion musical, esas tecnicas no resultan directamente aplicables.

## Capacidades

- Transcripcion automatica de audio a MIDI (automatic music transcription).
- Transcripcion multi-instrumento: separa las notas y las asigna a pistas de instrumento mediante el modulo agrupador.
- Reparacion de evidencias: un modulo especifico corrige o completa las detecciones del transcriptor principal.
- Transcripcion de bateria mediante un modelo dedicado, limitado a audio grabado a 40 kHz o mas.
- Ejecucion sin Python a traves de dettato.cpp sobre ggml, con aceleracion por CPU, Metal o Vulkan.
- Salida en MIDI de interpretacion, no cuantizado a negra (el timing refleja la ejecucion real).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo puramente acustico.

## Casos de uso

- Digitalizacion de grabaciones para produccion musical: convertir una maqueta o una grabacion de ensayo en pistas MIDI editables en el DAW, aprovechando la asignacion automatica de instrumentos del agrupador.
- Creacion de partituras y reducciones: a partir del MIDI de interpretacion generado, un paso posterior de cuantizacion permite obtener notacion legible para arreglos o transcripciones academicas.
- Analisis musicologico y educacion: extraer las notas y su timing real de una interpretacion para estudiar fraseo, dinamica o desviaciones ritmicas respecto a la partitura.
- Remezcla y re-instrumentacion: sustituir los timbres de una grabacion por sintetizadores o samples manteniendo la interpretacion original, gracias a las pistas separadas por instrumento.
- Procesamiento por lotes en servidores sin GPU dedicada: el binario C++ con ggml sobre CPU permite transcribir catalogos completos sin dependencias de Python ni CUDA, con un coste de integracion bajo.
- Herramientas de escritorio y plugins: al ser un unico fichero GGUF de 73,7 MB y no requerir runtime de Python, se puede embeber en aplicaciones nativas o plugins de DAW con despliegue sencillo.
- Investigacion en transcripcion musical: servir de linea base reproducible sobre los conjuntos de evaluacion Bach10, Dagstuhl ChoirSet, PHENICX-Anechoic y RWC Royalty-Free.

## Benchmarks y rendimiento

| Metrica | dettato.cpp (GGUF) | Paquete Python (safetensors) |
|---|---|---|
| F1 compuesto (Bach10, Dagstuhl ChoirSet, PHENICX-Anechoic, RWC Royalty-Free) | 67,75 | 67,51 |
| Tiempo por cancion de 4 minutos (RTX 5060, modo Fast) | 11,7 s | 20,1 s |

Los datos proceden de la model card del autor. No se han publicado en la informacion disponible resultados desglosados por conjunto de evaluacion ni comparaciones con otros sistemas de transcripcion.

## Requisitos de hardware

- VRAM: no aplica en el modo CPU; en modo GPU el modelo es muy pequeno (73,7 MB en f16), por lo que la memoria necesaria es marginal frente a la del propio runtime.
- GPU recomendadas: cualquier GPU compatible con Metal (Apple Silicon) o Vulkan; el autor reporta mediciones en una RTX 5060.
- Cabe holgadamente en cualquier GPU de consumo e incluso en iGPU, y funciona sin GPU alguna en CPU.
- Opciones de despliegue: exclusivamente dettato.cpp (binario C++ con ggml). No se menciona soporte para llama.cpp, Ollama, vLLM ni TGI, que ademas no estan orientados a este tipo de modelo acustico.
- Latencia y throughput: 11,7 segundos por cancion de 4 minutos en modo Fast sobre RTX 5060; el paquete Python tarda 20,1 segundos en la misma tarjeta. No se proporcionan cifras para CPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de transcripcion musical multi-instrumento (parametros, contexto, rendimiento o licencia), por lo que la comparativa no esta disponible.

## Limitaciones y advertencias

- El paso mas debil del sistema es la asignacion de notas a las pistas de instrumento correctas, segun reconoce el propio autor.
- La salida es MIDI de interpretacion, no cuantizado al pulso; para obtener notacion o MIDI de grade es necesario un postprocesado.
- El modulo de bateria solo funciona con audio grabado a 40 kHz o superior; con frecuencias de muestreo menores no producira resultados validos.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de alucinacion en el sentido de notas espurias o instrumentos mal asignados en pasajes densos o con mezclas complejas; no se documentan tasas de error por tipo de material.
- No se detallan sesgos por genero musical, instrumentacion o calidad de grabacion; la cobertura del entrenamiento es desconocida.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene verificar las licencias de los repositorios base y de los conjuntos de evaluacion utilizados.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicacion muy reciente y sin validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kobimusic/dettato-gguf
- Modelo base (transcriptor): https://huggingface.co/kobimusic/dettato
- Reparador de evidencias: https://huggingface.co/kobimusic/dettato-evidence
- Agrupador: https://huggingface.co/kobimusic/dettato-grouper
- Modelo de bateria: https://huggingface.co/kobimusic/dettato-drums
- Codigo C++ (dettato.cpp): https://github.com/hidude562/dettato.cpp
- Paquete Python: https://github.com/kobimusic/dettato
- Documentacion del modelo: https://github.com/hidude562/dettato.cpp/blob/main/docs/MODEL.md
- Documentacion de benchmarks: https://github.com/hidude562/dettato.cpp/blob/main/docs/BENCHMARK.md
- Web del autor: https://kobi.music
