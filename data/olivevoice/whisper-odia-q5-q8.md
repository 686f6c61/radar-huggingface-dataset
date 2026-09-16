# OliveVoice/whisper-odia-q5-q8

## Resumen

OliveVoice/whisper-odia-q5-q8 es un repositorio de pesos cuantizados para reconocimiento automatico del habla (ASR) en odia, derivado del checkpoint Whisper Small y empaquetado en el formato GGML antiguo de fichero unico que consume whisper.cpp. No es un modelo entrenado desde cero: el autor parte de la exportacion local sam2ai/whisper-small-or, cuyo config apunta a openai/whisper-small como modelo base, la convierte a GGML con el conversor H5 oficial de whisper.cpp y genera dos variantes enteras, q8_0 (252 MiB) y q5_1 (181 MiB), a partir del fichero FP16 intermedio de 487.601.984 bytes.

El problema que resuelve es de despliegue: permite ejecutar un Whisper Small afinado para odia en entornos sin GPU y con toolchains basadas en whisper.cpp (aplicaciones moviles, escritorio, dispositivos embebidos), algo que los pesos originales en PyTorch/safetensors no permiten directamente. El repositorio es deliberadamente minimalista: solo contiene los dos ficheros .bin, con el tokenizer y el vocabulario embebidos, sin scripts de conversion, sin dataset de evaluacion y sin resultados de WER en odia.

La relevancia actual es limitada y hay que ser honesto con los numeros: 0 descargas y 0 likes en el momento de la consulta, creado el 15 de septiembre de 2026 y actualizado dos minutos despues. La validacion publicada es un smoke test de compatibilidad en runtime sobre una muestra de 11 segundos en ingles (discurso JFK), no una evaluacion de precision en odia. Es, por tanto, un artefacto util como receta de cuantizacion reproducible, no como modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (familia Whisper, modelo base openai/whisper-small) |
| Parametros totales | Aproximadamente 244 M, correspondientes al modelo base openai/whisper-small; el repositorio no declara recuento propio |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventana de audio fija de 30 s (1500 posiciones de espectrograma mel) heredada de Whisper; no gestiona contexto de texto extensible |
| Tipos de cuantizacion | q8_0 (252 MiB) y q5_1 (181 MiB), ambas cuantizaciones enteras en formato GGML legacy |
| Idiomas soportados | No disponible en los metadatos de HuggingFace. El checkpoint esta orientado al odia (or) y deriva de openai/whisper-small, que es multilingue |
| Licencia | No disponible en el repositorio. La model card indica que upstream openai/whisper-small declara Apache-2.0, pero la exportacion local sam2ai/whisper-small-or no incluia metadatos de identidad ni licencia del dataset |
| Formato de pesos | GGML legacy de fichero unico (.bin) para whisper.cpp; no son ficheros GGUF, no son safetensors y no se cargan con la API de Transformers |
| Tamano del repositorio | 0,5 GB segun HuggingFace; la suma de los dos .bin es de 454.550.128 bytes (aproximadamente 433 MiB) |
| Libreria declarada | whisper.cpp |
| Pipeline | automatic-speech-recognition |
| Integridad | q8_0: 264.464.624 bytes, SHA-256 adc92d090b2de8bf019421f71405bc3a0fac0d2054c2c127f686a7a5c0e51ed7. q5_1: 190.085.504 bytes, SHA-256 4035df7f0f4e26379147db83964358e16f4bbca715c5359638fb2106e76b881e. Fuente FP16: 487.601.984 bytes, SHA-256 99394557e880a7d1516fd94ef3fe2e5db478e3e3aee60532d61aa528b97c4c73 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small: un transformer encoder-decoder que consume espectrogramas mel logaritmicos normalizados, calculados en ventanas de 30 segundos a 16 kHz, y genera tokens de texto de forma autoregresiva. No hay innovaciones propias en este repositorio: no se modifica la topologia, no se anaden capas de atencion lineal ni decodificacion especulativa, y no se describe ningun proceso de entrenamiento adicional, RLHF o DPO. Todo el trabajo realizado por el autor es de conversion y cuantizacion.

La cadena de procedencia documentada es la siguiente: el punto de partida es sam2ai/whisper-small-or, una exportacion local cuyo config identifica openai/whisper-small como base; ese checkpoint se convierte a GGML con el conversor H5 oficial de whisper.cpp y despues se cuantiza desde el fichero GGML de pesos FP16. Las revisiones de herramienta declaradas son whisper.cpp 02612981545f58188a44de99b8a4710793714629 y OpenAI Whisper 86098128c0b4f24f0e2aa2994de830614b474227. Los comandos equivalentes son whisper-quantize ggml-whisper-small-or.bin ggml-whisper-small-or-q8_0.bin q8_0 y el analogo con q5_1.

No se aporta informacion sobre el dataset de afinamiento en odia: ni numero de horas, ni composicion, ni proceso de filtrado. La model card reconoce explicitamente que la exportacion local no contenia identidad de dataset ni metadatos de licencia, de modo que la procedencia de los datos de entrenamiento no queda acreditada por este repositorio.

## Capacidades

- Transcripcion de voz a texto monolingue en odia (objetivo declarado del checkpoint), con la salvedad de que no se publica ninguna evaluacion de precision en ese idioma.
- Reconocimiento multilingue y traduccion al ingles heredados del modelo base openai/whisper-small, aunque el afinamiento a odia puede haber degradado el rendimiento en otros idiomas.
- Deteccion automatica de idioma mediante el flag -l auto de whisper.cpp.
- Transcripcion sin marcas de tiempo (-nt) o con segmentacion temporal, segun los flags del runtime.
- Entrada de audio mono a 16 kHz en WAV u otros formatos soportados por el decodificador de audio de whisper.cpp.
- Ejecucion en CPU sin GPU, al ser modelos de 181-252 MiB en cuantizacion entera.
- No dispone de tool calling, function calling, modo agente, capacidades de vision, audio generation ni modo de razonamiento extendido: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de audio en odia en aplicaciones moviles: los ficheros q5_1 (181 MiB) y q8_0 (252 MiB) caben en el almacenamiento y la memoria de un telefono, y whisper.cpp esta integrado en aplicaciones tipo PocketPal, mencionada por el propio autor como consumidor de estos pesos.
- Subtitulado offline en escritorio: procesado por lotes de ficheros WAV con whisper-cli, sin dependencia de servicios en la nube ni de GPU, util para archivado de material audiovisual en odia.
- Despliegue en dispositivos embebidos o de placa unica: el tamano reducido permite ejecutar la inferencia en CPU en hardware con menos de 1 GB de memoria disponible para el modelo.
- Pipeline de transcripcion con control de idioma fijo: aunque el modelo permite -l auto, en produccion conviene fijar el idioma a odia para evitar la deteccion erronea en audios cortos o ruidosos.
- Prototipado de recetas de cuantizacion: el repositorio sirve como referencia reproducible (comandos, revisiones de herramienta y hashes) para cuantizar cualquier otro checkpoint Whisper Small a q8_0 o q5_1.
- Evaluacion comparativa de cuantizaciones: comparar la salida de q5_1 frente a q8_0 sobre el mismo corpus permite medir la degradacion introducida por la cuantizacion antes de elegir un fichero por defecto.
- Integracion en aplicaciones de accesibilidad: dictado y transcripcion de notas de voz en odia en tiempo casi real en portatiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, no hay WER ni CER sobre ningun corpus en odia, ni resultados en conjuntos multilingues como Fleurs o Common Voice.

La unica validacion publicada es un smoke test de compatibilidad en runtime: ambos ficheros cuantizados cargaron correctamente con whisper.cpp y produjeron la misma salida que la fuente FP16 sobre una muestra de 11 segundos en ingles (discurso JFK del propio runtime), con la transcripcion "And so, my fellow Americans, ask not what your country can do for you, ask what you can do for your country!". El autor advierte explicitamente de que no es una evaluacion de WER en odia y de que la precision en ese idioma debe evaluarse con grabaciones representativas antes de fijar un modelo por defecto.

| Prueba | Resultado | Alcance |
|---|---|---|
| Compatibilidad de carga en whisper.cpp | Correcta en q8_0 y q5_1 | Ambas variantes |
| Paridad de salida frente a FP16 | Identica en la muestra JFK de 11 s | Ingles, audio limpio |
| WER en odia | No disponible | Sin conjunto de test etiquetado |

## Requisitos de hardware

- VRAM o RAM para los pesos: 252 MiB para q8_0 y 181 MiB para q5_1. El consumo total del proceso es superior, ya que whisper.cpp reserva buffers adicionales para el espectrograma mel y la decodificacion; en la practica el modelo completo se ejecuta por debajo de 1 GB de memoria.
- GPU: no requiere GPU. Funciona en CPU con instrucciones AVX/NEON. Si se dispone de GPU, whisper.cpp puede compilarse con soporte CUDA, Metal, Vulkan o OpenCL, aunque para un modelo de este tamano la ventaja es marginal.
- Cabe sin problema en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3060, RTX 4090 y tambien en iGPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: whisper.cpp y sus bindings (whisper-cli, whisper-server, librerias Python/Go/Rust/Swift), o aplicaciones que embeben el runtime como PocketPal.
- No es compatible con vLLM, TGI, Transformers, Ollama ni otros servidores que no soporten el formato GGML legacy de fichero unico de Whisper. Tampoco se carga con llama.cpp, cuyo soporte GGML es para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad de transcripcion ni de tiempo real factor para ninguna plataforma.
- Nota de despliegue: el fichero debe descargarse por separado del runtime; el tokenizer y el vocabulario van embebidos en el .bin, por lo que no se necesitan ficheros adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| OliveVoice/whisper-odia-q5-q8 | Aproximadamente 244 M (base) | 30 s | Objetivo odia; base multilingue | No disponible en el repositorio; upstream Apache-2.0 segun la model card | GGML legacy .bin (q8_0, q5_1) | HuggingFace, 0 descargas y 0 likes |
| openai/whisper-small | 244 M | 30 s | Multilingue (aproximadamente 99 idiomas) | Apache-2.0 | PyTorch / safetensors | Repositorio oficial de OpenAI en HuggingFace |
| whisper.cpp ggml-small (q5_0 / q8_0 oficiales) | 244 M | 30 s | Multilingue | Modelo Apache-2.0; runtime MIT | GGML legacy .bin | Repositorio ggml-org/whisper.cpp |

La diferencia frente al Whisper Small oficial no esta en la arquitectura ni en el tamano, sino en el afinamiento a odia y en el empaquetado ya cuantizado. Frente a las cuantizaciones oficiales de whisper.cpp, el valor anadido es el ajuste de idioma, pero tambien el riesgo: no hay WER comparativo que demuestre que el afinamiento mejora sobre el modelo multilingue original en odia.

## Limitaciones y advertencias

- Ausencia total de evaluacion en odia: no se publica WER, CER ni tamano de conjunto de test. La unica prueba es un smoke test en ingles.
- Riesgo de licencia para uso comercial: el repositorio no declara licencia propia y la exportacion intermedia sam2ai/whisper-small-or no incluia identidad ni licencia del dataset de entrenamiento. La model card pide revisar la procedencia antes de redistribuir o usar comercialmente. El Apache-2.0 del modelo base no cubre automaticamente los datos de afinamiento.
- Repositorio sin comunidad: 0 descargas y 0 likes, sin issues ni validacion externa que respalde la calidad.
- Formato obsoleto: son ficheros GGML legacy de fichero unico, no GGUF. Esto limita el ecosistema de herramientas compatible y ata el uso a versiones de whisper.cpp que mantengan el cargador antiguo.
- Cuantizacion sin medir: q5_1 introduce una perdida de precision frente a FP16 que no ha sido cuantificada en odia. El autor solo verifica paridad en una muestra corta en ingles.
- Ventana fija de 30 segundos: para audios largos hay que segmentar externamente (VAD o chunking), con el riesgo de cortes en fronteras de palabra.
- Alucinacion tipica de Whisper: en silencios, musica o audio con ruido, la familia Whisper tiende a generar texto plausible no presente en el audio. No hay mitigacion documentada en este repositorio.
- Idiomas distintos del odia: el afinamiento puede haber degradado el rendimiento multilingue del modelo base; no hay datos al respecto.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo ASR puro y no debe plantearse para tareas generativas de texto.
- Metadatos incompletos en HuggingFace: idiomas y licencia figuran como no disponibles en la ficha del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OliveVoice/whisper-odia-q5-q8
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Runtime whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Exportacion de origen citada por el autor: https://huggingface.co/sam2ai/whisper-small-or

Nota sobre la busqueda web: los resultados devueltos corresponden a widgets de cuestionarios para sitios web (BookWidgets, Embeddable, Webynize, Commoninja, Frog Education) y no guardan relacion con el modelo. No se han encontrado papers, blogs ni demos adicionales relevantes en la informacion disponible.
