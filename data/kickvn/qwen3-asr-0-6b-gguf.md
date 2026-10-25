# kickvn/Qwen3-ASR-0.6B-GGUF

## Resumen

Qwen3-ASR-0.6B-GGUF (repo `kickvn/Qwen3-ASR-0.6B-GGUF`) es una conversión a formato GGUF del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B del equipo Qwen de Alibaba, publicada por el autor independiente `kickvn` para su uso con llama.cpp. El modelo original forma parte de la familia Qwen3-ASR, que incluye las variantes de 1,7B y 0,6B parámetros y que, segun la documentacion del proyecto, cubre identificacion de idioma y transcripcion en 52 idiomas y dialectos, apoyandose en el modelo base multimodal Qwen3-Omni.

Este repositorio concreto no introduce pesos nuevos: es un empaquetado de dos ficheros —el decodificador de texto cuantizado a Q8_0 (805 MB) y el codificador de audio o `mmproj` en bf16 sin tocar (379 MB)— pensado para que una aplicacion pueda descargar ambos desde un unico sitio. Segun la model card, el GGUF Q8_0 resultante es byte a byte identico al publicado por el proyecto llama.cpp en `ggml-org`, con el mismo sha256, de modo que su interes practico es la conveniencia de distribución y la documentacion de mediciones que aporta el autor, no una mejora tecnica sobre el original.

Su relevancia ahora es doble: por un lado, demuestra que un ASR de ~750 M de parametros puede ejecutarse en llama.cpp con cuantizacion Q8_0 sin perdida medible de calidad frente a bf16 en las pruebas del autor, tanto en GPU (Vulkan) como en CPU; por otro, sirve como ejemplo de despliegue de un modelo de audio dentro del ecosistema GGUF, con un coste de VRAM por debajo de los 2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR compuesto por codificador de audio (`mmproj`) y decodificador de texto, derivado de la familia Qwen3-ASR / Qwen3-Omni; detalles completos de capas y atencion no disponibles |
| Parametros totales | 751.632.384 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 en el decodificador de texto; bf16 sin cuantizar en el codificador de audio (`mmproj`). Es la unica cuantizacion publicada en este repo |
| Idiomas soportados | La familia Qwen3-ASR declara 52 idiomas y dialectos, con identificacion de idioma; el listado concreto por idioma no esta disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: `Qwen3-ASR-0.6B-Q8_0.gguf` de 805 MB y `mmproj-Qwen3-ASR-0.6B-bf16.gguf` de 379 MB) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema de dos componentes: un codificador de audio exportado como `mmproj` en bf16 y un decodificador de texto que es el unico elemento cuantizado en este repositorio. La familia Qwen3-ASR se construye sobre la capacidad de comprension de audio del modelo fundacional Qwen3-Omni y se entrena con datos de habla a gran escala, segun la documentacion del proyecto en GitHub. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para la tarea de ASR.

La innovacion tecnica relevante de este repositorio no esta en el entrenamiento sino en el proceso de conversion: se parte de los GGUF bf16 generados por el proyecto llama.cpp (revision `928ab95`), se cuantiza unicamente el decodificador con `llama-quantize` de la release b11827 y se conserva el codificador en bf16. El autor verifica que el resultado coincide byte a byte con el Q8_0 de `ggml-org` (sha256 `bca259818b50ca7c4c05e9bdb35a5dc04fa039653a6d6f3f0f331f96f6aa1971`) y que el `mmproj` es copia del bf16 original (sha256 `dae36c855f9a82a8916bea2238b24bda69a39d8da8b2f46dee7c103775656039`). No se describe ninguna tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion automatica de voz a texto (pipeline `automatic-speech-recognition`) sobre audio en formato compatible con llama.cpp.
- Identificacion de idioma, segun las capacidades declaradas de la familia Qwen3-ASR.
- Cobertura declarada de 52 idiomas y dialectos en la familia; en las pruebas del autor se usan audios en vietnamita e ingles.
- Transcripcion de letras de canciones sobre voces separadas, con idioma forzado por pista y omision de fragmentos silenciosos: es el caso de uso declarado del repositorio (integracion en KICK Studio).
- Procesamiento por trozos de audio de 20 s en la evaluacion publicada, lo que sugiere un uso por segmentos mas que de audio ilimitado.
- Soporte de `llama-server` con entrada multimodal via `--mmproj`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni generacion de codigo; al tratarse de un modelo ASR no cabe esperarlas.

## Casos de uso

- Transcripcion de letras musicales: el escenario para el que se publico este repo. Se separan las voces, se trocea el audio en segmentos de 20 s, se fuerza el idioma por cancion y se descartan los tramos silenciosos antes de pasar el audio al modelo a traves de `llama-server` con el `mmproj` cargado.
- Subtitulado automatico de video en lote: al ocupar menos de 2 GB en VRAM y funcionar tambien en CPU, se puede ejecutar en paralelo con otras tareas sobre la misma GPU o directamente en servidores sin acelerador dedicado.
- Transcripcion de reuniones y notas de voz: la cuantizacion Q8_0 mantiene la calidad practicamente identica a bf16 en las mediciones del autor, lo que permite integrar el modelo en herramientas internas de documentacion sin coste de infraestructura relevante.
- Preprocesado de corpus de audio para entrenamiento de otros modelos: por su tamano reducido se puede usar como etiquetador masivo en pipelines que procesan horas de audio en CPU.
- Aplicaciones de escritorio y moviles con llama.cpp embebido: los dos ficheros suman 1,2 GB y caben en el repositorio de una aplicacion, lo que facilita su distribucion como dependencia descargable.
- Prototipado de funciones de dictado o busqueda por voz: la API de `llama-server` expone un endpoint HTTP compatible con integraciones sencillas, adecuado para validar producto antes de migrar a un modelo mayor de la misma familia (Qwen3-ASR-1.7B).
- Filtrado y control de calidad de audio: transcripcion rapida con deteccion de idioma para clasificar o descartar grabaciones antes de un proceso mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech u otros) en la informacion disponible. El autor unicamente aporta una evaluacion interna comparando el decodificador bf16 frente al Q8_0 con el mismo `mmproj` bf16, sobre 7 canciones, voces separadas, trozos de 20 s y idioma forzado por pista. WER / CER en llama.cpp b11827 con Vulkan sobre RTX 5070:

| Cancion | Idioma | bf16 | Q8_0 |
|---|---|---|---|
| 006073b2 (mixto vi/en) | vi | 133,8 % / 108,4 % | 134,5 % / 109,0 % |
| 0eb0c49f | vi | 67,7 % / 47,6 % | 64,6 % / 44,4 % |
| 147952e3 | vi | 24,7 % / 12,5 % | 24,3 % / 12,3 % |
| 2637bb5d | en | 24,4 % / 13,8 % | 25,4 % / 14,4 % |
| 2e3d6623 | en | 29,9 % / 16,8 % | 30,1 % / 16,9 % |
| 5cf876dc | vi | 37,2 % / 25,3 % | 37,9 % / 25,9 % |
| 796fe1f5 | en | 12,1 % / 8,6 % | 12,1 % / 8,6 % |
| Media | | 47,1 % / 33,3 % | 47,0 % / 33,1 % |

En CPU sola (`--device none`, i5-14600KF) la media es 47,4 % / 33,4 % con bf16 y 46,7 % / 33,0 % con Q8_0. El propio autor advierte que las letras de referencia pueden omitir estribillos repetidos, por lo que estas cifras solo sirven para comparar los dos ficheros entre si y no como medida absoluta de calidad.

Rendimiento medido:

| Metrica | bf16 | Q8_0 |
|---|---|---|
| 7 canciones, GPU Vulkan (RTX 5070, en caliente) | 8,5–8,7 s | 7,7–8,1 s |
| 7 canciones, CPU (i5-14600KF) | 105 s | 94 s |
| `llama-bench` tg128, Vulkan | 267 t/s | 425 t/s |
| `llama-bench` pp512, Vulkan | 25.600 t/s | 29.700 t/s |

## Requisitos de hardware

- VRAM estimada: entre 1,5 y 2 GB para cargar el decodificador Q8_0 (805 MB) y el codificador bf16 (379 MB) junto con las estructuras de llama.cpp; cifra estimada a partir de los tamanos de fichero, no publicada por el autor.
- Cabe holgadamente en cualquier GPU de consumo: el autor lo ejecuta en una RTX 5070 mediante el backend Vulkan; cualquier GPU con 2 GB o mas de memoria deberia ser suficiente.
- Funciona en CPU sin acelerador: 94 s para procesar 7 canciones troceadas en segmentos de 20 s con un i5-14600KF, es decir, del orden de 13 s de proceso por cancion en ese hardware.
- En GPU Vulkan el procesado de las 7 canciones baja a 7,7–8,1 s con Q8_0, aproximadamente 1,1 s por cancion.
- Despliegue: llama.cpp, preferentemente builds oficiales recientes (probado con b11827 en variante Vulkan x64) mediante `llama-server -m Qwen3-ASR-0.6B-Q8_0.gguf --mmproj mmproj-Qwen3-ASR-0.6B-bf16.gguf -ngl 99`. El uso con vLLM, TGI u Ollama no esta documentado en la informacion disponible.
- Throughput de referencia: 425 t/s en generacion (tg128) y 29.700 t/s en prefill (pp512) con Vulkan y Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| kickvn/Qwen3-ASR-0.6B-GGUF (este repo) | 751.632.384 | No disponible | 52 idiomas y dialectos (familia) | GGUF, decodificador Q8_0 + mmproj bf16 | Apache 2.0 | Reempaquetado byte a byte identico al Q8_0 de ggml-org |
| ggml-org/Qwen3-ASR-0.6B-GGUF | Mismo modelo base | No disponible | 52 idiomas y dialectos (familia) | GGUF, bf16 y Q8_0 | Apache 2.0 | Fuente original de la conversion; incluye bf16 |
| Qwen/Qwen3-ASR-0.6B | 751.632.384 | No disponible | 52 idiomas y dialectos (familia) | Safetensors (bf16) | Apache 2.0 | Pesos originales; requiere stack de inferencia compatible con el modelo base |
| Qwen/Qwen3-ASR-1.7B | No disponible | No disponible | 52 idiomas y dialectos (familia) | Safetensors | Apache 2.0 | Variante mayor de la misma familia; segun el proyecto, mejor rendimiento entre los ASR open source |
| vnbot-ai/Qwen3-ASR-0.6B-GGUF | Mismo modelo base | No disponible | 52 idiomas y dialectos (familia) | GGUF | Apache 2.0 (heredada) | Otro espejo del mismo modelo base orientado a un producto concreto |

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un reempaquetado de terceros, no la fuente canonica. Para produccion conviene referenciar `ggml-org/Qwen3-ASR-0.6B-GGUF` o los pesos originales de Qwen, ya que el autor confirma que el contenido es identico.
- Las mediciones de WER/CER publicadas son internas, sobre 7 canciones con letras de referencia incompletas y valores que llegan al 133 %, lo que impide usarlas como referencia absoluta de calidad. No hay benchmarks estandar (LibriSpeech, Common Voice u otros) en la informacion disponible.
- El autor solo documenta pruebas en vietnamita e ingles; el resto de los 52 idiomas declarados por la familia no estan verificados en este repo.
- El proceso de evaluacion usa trozos de 20 s y omite segmentos silenciosos: no se documenta el comportamiento con audio largo continuo ni la longitud de contexto real del decodificador.
- Al ser un modelo ASR, no debe esperarse razonamiento, generacion libre de texto fiable ni soporte de tool calling; su salida es transcripcion.
- Riesgo de alucinacion en pasajes musicales con mezcla de idiomas o coros, tal como refleja la cancion con WER superior al 100 %.
- La cuantizacion solo existe en Q8_0. No hay versiones Q4 o Q5 en este repo, por lo que no se puede reducir mas el consumo sin recurrir a otras conversiones.
- Licencia Apache 2.0, que permite uso comercial manteniendo los avisos de copyright de Alibaba Cloud (Qwen), del proyecto llama.cpp (conversion GGUF) y de KICK (cuantizacion Q8_0).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kickvn/Qwen3-ASR-0.6B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- GGUF de referencia del proyecto llama.cpp: https://huggingface.co/ggml-org/Qwen3-ASR-0.6B-GGUF
- Repositorio GitHub de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Release de llama.cpp utilizada para cuantizar (b11827): https://github.com/ggml-org/llama.cpp/releases/tag/b11827
- Proyecto del autor (KICK Studio): https://studio.kick.vn
- Espejo alternativo del mismo modelo base: https://huggingface.co/vnbot-ai/Qwen3-ASR-0.6B-GGUF
- Ficha en Inferix: https://inferix.co/models/handy-computer/Qwen3-ASR-0.6B-gguf
