# sakasegawa/parakeet-tdt-0.6b-v3-GGUF

## Resumen

sakasegawa/parakeet-tdt-0.6b-v3-GGUF es una conversión al formato GGUF propio de speech.cpp del modelo de reconocimiento automático del habla NVIDIA parakeet-tdt-0.6b-v3. Se trata de un FastConformer con decodificación TDT (Token-and-Duration Transducer) de 627 millones de parámetros, entrenado por NVIDIA para transcribir audio en 25 idiomas europeos con puntuación, mayúsculas y detección automática del idioma.

La relevancia de esta ficha no está en el modelo base, sino en el formato: los ficheros GGUF aquí publicados utilizan la disposición interna de speech.cpp, no la de llama.cpp, por lo que no se pueden cargar en LM Studio, Ollama ni en el ecosistema GGUF convencional. Requieren speech.cpp 0.7.0 o superior (y 0.8.0 para las cuantizaciones Q8_0, Q6_K, Q5_K y Q4_K).

El interés práctico es el tamaño: la versión Q4_K ocupa 363 MB y la F16 1,26 GB, lo que permite ejecutar un ASR multilingüe de calidad cercana a NeMo en CPU, GPU de consumo y Apple Silicon con una huella de memoria de entre 0,47 GB y 1,37 GB por petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.011.734 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; el límite lo fija la duración del audio, no una ventana de tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K, Q4_K |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk (25 idiomas europeos) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF con disposición propia de speech.cpp (no compatible con llama.cpp, Ollama ni LM Studio) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer de NVIDIA: un encoder Conformer con subsampling agresivo de la secuencia de audio, acoplado a un decodificador TDT (Token-and-Duration Transducer) que predice conjuntamente el token y su duración, lo que permite emitir varios tokens por paso y ajustar dinámicamente el alineamiento temporal. La conversión de sakasegawa incluye en un único fichero GGUF el frontend de audio, el encoder, la red de predicción (con capas LSTM), el joint y el vocabulario.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card de la conversión documenta la validación de la implementación: cada etapa se contrasta con los tensores de NeMo sobre el split de test de FLEURS en un Apple M5, y en 12 enunciados de en_us, de_de, fr_fr y es_419 (de 6 a 23 s) la CPU en F32 y F16 y Metal reproducen exactamente el texto de NeMo, incluidos los tiempos de tokens y segmentos.

La innovación técnica de esta conversión es la cuantización selectiva: en los ficheros Q6_K, Q5_K y Q4_K las matrices de la red de predicción y del joint, cuyas filas de 640 valores no son bloques completos de 256, se almacenan en Q8_0 para preservar la alineación de bloques.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos: búlgaro, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, croata, húngaro, italiano, lituano, letón, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco y ucraniano.
- Detección automática del idioma del audio; el parámetro `language` de la petición solo se valida contra la lista de idiomas soportados.
- Generación de texto con puntuación y mayúsculas.
- Marcas de tiempo a nivel de token y de segmento, idénticas a las de NeMo, activables con `--timestamps`.
- Ejecución en CPU (F32 y F16), Metal y Vulkan.
- Servidor HTTP integrado mediante `speech serve` con interfaz web (`--open`).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de un LLM: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de 6 a 23 segundos por enunciado en las pruebas publicadas y genera puntuación y mayúsculas directamente, lo que reduce el post-procesado necesario para publicar actas legibles.
- Subtitulado con marcas de tiempo: la opción `--timestamps` produce tiempos de token y segmento idénticos a los de NeMo, adecuados para generar ficheros SRT alineados con el audio original.
- Atención al cliente multilingüe: con 25 idiomas europeos y detección automática del idioma, un mismo despliegue puede transcribir llamadas en español, alemán, polaco o griego sin enrutar por idioma.
- Despliegue en hardware modesto: la cuantización Q4_K (363 MB, 0,47 GB de memoria pico) permite ejecutar ASR en portátiles y equipos sin GPU dedicada, con un WER de 9,51 % en FLEURS inglés.
- Procesamiento por lotes de archivos de audio: la CLI (`speech asr`) acepta rutas a ficheros descargados, lo que facilita integrarla en pipelines de transcripción masiva sin servidor.
- Servicio HTTP interno: `speech serve` expone una API HTTP para integrar la transcripción en aplicaciones existentes, con la ventaja de que el modelo se descarga automáticamente la primera vez.
- Evaluación y comparación de cuantizaciones: los ficheros `.gguf.json` (salida de `speech info --json`) permiten inspeccionar el modelo o seleccionar un fichero sin descargarlo, útil para automatizar pruebas de precisión entre tipos.

## Benchmarks y rendimiento

Precisión medida con speech-bench el 2026-10-12 en un Apple M5 con Metal, sobre 300 enunciados en inglés del split de test de FLEURS. La memoria es el pico de `speech` por petición.

| Tipo | Tamano | Memoria | WER |
|---|---|---|---|
| F16 | 1,26 GB | 1,37 GB | 8,76 % |
| Q8_0 | 0,67 GB | 0,78 GB | 9,06 % |
| Q6_K | 0,52 GB | 0,63 GB | 8,87 % |
| Q5_K | 0,44 GB | 0,54 GB | 9,13 % |
| Q4_K | 0,36 GB | 0,47 GB | 9,51 % |

Velocidad medida con speech-bench el 2026-10-10, 300 enunciados en inglés de FLEURS, F16, una petición cálida a la vez:

| Dispositivo | Mediana | p90 |
|---|---|---|
| Apple M5, Metal | 0,093 s | 0,148 s |
| RTX 2080, Vulkan | 0,082 s | 0,111 s |

No se han publicado resultados de benchmarks del modelo base frente a otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada por petición: 1,37 GB en F16, 0,78 GB en Q8_0, 0,63 GB en Q6_K, 0,54 GB en Q5_K y 0,47 GB en Q4_K.
- GPU recomendadas: RTX 2080 (medida con Vulkan en los datos publicados) y, por extensión de la API de speech.cpp, GPU Apple con Metal (M5 medida). No hay datos publicados para A100 o H100.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1,5 GB de memoria libre para F16 y menos de 0,5 GB para Q4_K.
- CPU: soportada en F32 y F16 según la validación frente a NeMo.
- Opciones de despliegue: exclusivamente speech.cpp 0.7.0 o superior (0.8.0 o superior para Q8_0, Q6_K, Q5_K y Q4_K). No funciona en llama.cpp, LM Studio, Ollama, vLLM ni TGI.
- Latencia: mediana de 0,093 s y p90 de 0,148 s en Apple M5 con Metal; mediana de 0,082 s y p90 de 0,111 s en RTX 2080 con Vulkan, por enunciado de FLEURS.
- Throughput: no disponible (las mediciones publicadas son de una petición a la vez).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-GGUF (esta ficha) | 627 M | 25 europeos | GGUF propio de speech.cpp | CC BY 4.0 | Cuantizado; WER 8,76 % (F16) en FLEURS inglés |
| nvidia/parakeet-tdt-0.6b-v3 | 627 M | 25 europeos | NeMo (safetensors) | CC BY 4.0 | Modelo original; requiere NeMo para ejecutarse |
| Whisper large-v3 | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | no disponible | No hay datos comparativos publicados en la información disponible |
| Whisper small | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | no disponible | No hay datos comparativos publicados en la información disponible |

## Limitaciones y advertencias

- Incompatibilidad de formato: los GGUF usan la disposición interna de speech.cpp y no se cargan en llama.cpp, LM Studio, Ollama ni otras herramientas GGUF convencionales. Es el caveat más importante para producción.
- Dependencia de versión: Q8_0, Q6_K, Q5_K y Q4_K requieren speech.cpp 0.8.0 o superior; el resto, 0.7.0 o superior.
- Cobertura lingüística limitada a 25 idiomas europeos; no se documenta soporte para otras lenguas.
- El WER de referencia (8,76 % en F16) se mide solo sobre 300 enunciados en inglés de FLEURS; no hay datos publicados de precisión por idioma ni en dominios con ruido, acentos o audio telefónico.
- La cuantización degrada ligeramente la precisión: de 8,76 % en F16 a 9,51 % en Q4_K en el conjunto medido.
- No hay información publicada sobre sesgos del modelo base en la documentación de esta conversión.
- Riesgo de alucinación inherente a los modelos ASR: no se documentan mecanismos de detección de silencio o audio no vocal en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene conservar la referencia a NVIDIA y a la conversión.
- Las mediciones de velocidad son de una petición a la vez; no hay datos de concurrencia ni de throughput sostenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakasegawa/parakeet-tdt-0.6b-v3-GGUF
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- speech.cpp (repositorio): https://github.com/nyosegawa/speech.cpp
- Instalación de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentación de FastConformer en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/fastconformer.md
- Documentación de la CLI: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
