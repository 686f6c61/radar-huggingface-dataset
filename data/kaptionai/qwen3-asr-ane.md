# kaptionai/qwen3-asr-ane

## Resumen

Qwen3-ASR-ANE es un paquete de inferencia para reconocimiento automatico del habla (ASR) optimizado para Apple Silicon, derivado del modelo Qwen/Qwen3-ASR-0.6B de Alibaba Qwen. Lo publica el autor kaptionai como componente del helper `kaption-ane` de su aplicacion de escritorio Kaption, y su proposito es ejecutar ASR local en macOS 15 o superior aprovechando el Neural Engine de los chips Apple. No es un modelo nuevo entrenado desde cero, sino una redistribucion del modelo base dividida en dos artefactos: un codificador de audio convertido a Core ML y un decodificador de texto en formato GGUF.

La arquitectura combina un encoder de audio y proyector empaquetados como programa Core ML en fp16, con una ventana fija de 8 segundos que se ejecuta en el Neural Engine, y un decoder de texto Qwen3-ASR-0.6B cuantizado a Q4_K_M que se ejecuta con llama.cpp sobre Metal. La salida del encoder se inyecta al decoder como embeddings. El paquete incluye metadatos (`asr.json`, `vocab.bin`, `mel.bin`) y un manifiesto con hashes SHA-256 y tamanos de cada fichero.

Su relevancia actual esta en que demuestra un patron de despliegue hibrido Core ML + llama.cpp para ASR en hardware de consumo Apple, con cifras medidas en un M1 de 16 GB: 18x tiempo real (22x en ficheros largos), primer token en 0,25 s y unos 350 MB de memoria durante la decodificacion. La licencia es Apache-2.0 y el autor declara explicitamente que no cuenta con el aval de Alibaba Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio + proyector en Core ML (fp16, ventana fija de 8 s) y decoder de texto tipo transformer en GGUF ejecutado con llama.cpp sobre Metal |
| Parametros totales | 0,6 B (modelo base Qwen3-ASR-0.6B); desglose por componente no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el encoder usa ventana fija de 8 s por segmento) |
| Tipos de cuantizacion | Decoder en Q4_K_M (GGUF); encoder en fp16 (Core ML) |
| Idiomas soportados | Chino, turco, arabe, japones, coreano y otros (segun model card); lista completa no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `encoder.mlpackage` (Core ML) y `decoder.gguf` (GGUF Q4_K_M) |
| Tamano del repo | 0,8 GB |
| Modelo base | Qwen/Qwen3-ASR-0.6B (revision `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`) |
| Requisito de plataforma | macOS 15+ en Apple Silicon |
| Ventana de audio | 8 s fijos por ventana en el encoder |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: redistribuye Qwen3-ASR-0.6B en dos piezas. El codificador de audio y el proyector se exportan como programa Core ML en fp16 con una ventana de entrada fija de 8 segundos, pensada para ejecutarse en el Neural Engine. El decodificador de texto es el fichero `Qwen3-ASR-0.6B.Q4_K_M.gguf` procedente del repositorio de mradermacher (revision `6cf166e9f1c5bd2521108e3410ee5358de5eabab`, SHA-256 `40d27969c614b4492f330baa41fcc8d00e25264aebbe3f16eaf5e4bd5af35cd5`), ejecutado con llama.cpp sobre Metal. La conexion entre ambos se hace pasando la salida del encoder al decoder como embeddings.

No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO) ni innovaciones de decodificacion mas alla del propio esquema hibrido. El paquete se genera con la herramienta `desktop/native/redux-ane/tools/build_qwen_asr_package.py package --decoder-gguf`, e incluye un manifiesto `kaption-ane-package.json` con SHA-256 y bytes de cada fichero para verificacion de integridad.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en chino, turco, arabe, japones, coreano y otros idiomas segun la model card.
- Procesamiento por ventanas fijas de 8 segundos en el encoder, con soporte de ficheros largos mediante segmentacion (el autor reporta mejor rendimiento relativo en ficheros largos: 22x tiempo real frente a 18x).
- Ejecucion local en Apple Silicon con reparto de carga: encoder en Neural Engine y decoder en GPU via Metal.
- Normalizacion de numerales en la salida (el autor reporta CER 6,9 con numerales normalizados frente a 7,6 sin normalizar en chino FLEURS).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla del propio ASR ni modo thinking.

## Casos de uso

- Transcripcion local en aplicaciones de escritorio macOS: el paquete esta disenado como helper de la app Kaption, de modo que se integra directamente en una app nativa para dictado o subtitulado sin enviar audio a la nube, con ~350 MB de memoria durante la decodificacion.
- Subtitulado de reuniones y clases en tiempo real: con primer token a 0,25 s y 18x tiempo real en un M1, el modelo puede transcribir flujos de audio en directo segmentando en ventanas de 8 s.
- Procesamiento por lotes de ficheros largos: el rendimiento de 22x tiempo real en ficheros largos lo hace adecuado para transcribir archivos de audio de horas en un portatil Apple Silicon sin GPU dedicada.
- Herramientas de accesibilidad: transcripcion de voz a texto para personas con discapacidad auditiva en apps de macOS, aprovechando que el modelo corre integramente en el dispositivo y preserva la privacidad del audio.
- Pipeline de ASR multilingue para contenido asiatico: el soporte declarado de chino, japones, coreano, turco y arabe permite transcribir contenido en esos idiomas con un unico paquete, con CER medido de 7,6 en chino, 9,3 en japones y 7,7 en coreano sobre FLEURS.
- Integracion en flujos de desarrollo con llama.cpp: al usar un decoder GGUF estandar, el paquete puede adaptarse a otros entornos llama.cpp (por ejemplo, Linux o Windows) sustituyendo el encoder Core ML por otra implementacion del encoder de Qwen3-ASR-0.6B, si bien el paquete publicado solo incluye el encoder Core ML.

## Benchmarks y rendimiento

Resultados medidos por el autor en un Apple M1 (16 GB, macOS 26) sobre el conjunto FLEURS:

| Metrica | Resultado |
|---|---|
| CER chino (120 clips) | 7,6 |
| CER chino con numerales normalizados | 6,9 |
| CER chino en ficheros largos | 7,3-7,5 |
| CER japones | 9,3 |
| CER coreano | 7,7 |
| Velocidad | 18x tiempo real (22x en ficheros largos) |
| Primer token | 0,25 s |
| Memoria durante decodificacion | ~350 MB |
| Comparacion con llama.cpp en Metal | Equivalente dentro del ruido (7,3 / 6,8) |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, ni comparativas con otros modelos ASR.

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 15 o superior (el Neural Engine es obligatorio para el encoder).
- Memoria: el autor reporta ~350 MB durante la decodificacion en un M1 de 16 GB; el repo completo ocupa 0,8 GB en disco.
- GPU/SoC recomendados: cualquier chip de la familia M (M1 medido por el autor); no se documentan resultados en M2, M3 o M4.
- Cabe en cualquier Mac Apple Silicon; no esta pensado para GPUs NVIDIA ni para CPU x86.
- Despliegue: Core ML para el encoder y llama.cpp sobre Metal para el decoder. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp en otras plataformas dentro del paquete.
- Latencia y throughput: primer token a 0,25 s, 18x tiempo real en audio corto y 22x en ficheros largos en M1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaptionai/qwen3-asr-ane | 0,6 B | No disponible (ventana de 8 s) | Chino, turco, arabe, japones, coreano y otros | Apache-2.0 | Hugging Face, paquete Core ML + GGUF |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | No disponible | No disponible en la informacion | No disponible en la informacion | Hugging Face (modelo base) |
| mradermacher/Qwen3-ASR-0.6B-GGUF | 0,6 B | No disponible | No disponible en la informacion | No disponible en la informacion | Hugging Face (GGUF) |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de otros sistemas ASR comparables (Whisper, Parakeet, etc.).

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado de Qwen3-ASR-0.6B; las limitaciones del modelo base se heredan sin cambios.
- El autor declara explicitamente que el paquete no cuenta con el aval de Alibaba Qwen.
- Dependencia de plataforma: solo funciona en Apple Silicon con macOS 15 o superior; el encoder Core ML no es portable a otras plataformas.
- Ventana de audio fija de 8 segundos en el encoder, lo que obliga a segmentar audios largos y puede afectar a la coherencia en fronteras de segmento.
- Cuantizacion Q4_K_M en el decoder: introduce perdida de precision frente al modelo en fp16 o bf16.
- Riesgo de alucinacion y errores de transcripcion inherentes a un modelo ASR de 0,6 B; el CER medido en japones (9,3) es notablemente superior al de chino (7,6) y coreano (7,7).
- No se documentan sesgos conocidos ni evaluaciones de robustez ante acentos, ruido o audio de baja calidad.
- La lista completa de idiomas soportados no esta disponible; la model card solo menciona algunos.
- Uso comercial permitido por Apache-2.0, pero conviene verificar las condiciones del modelo base Qwen3-ASR-0.6B antes de redistribuir en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaptionai/qwen3-asr-ane
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- GGUF del decoder: https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-GGUF
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.
