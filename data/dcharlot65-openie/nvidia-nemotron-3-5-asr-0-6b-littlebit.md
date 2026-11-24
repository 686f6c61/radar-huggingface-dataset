# dcharlot65-openie/NVIDIA-Nemotron-3.5-ASR-0.6B-LittleBit

## Resumen

`NVIDIA-Nemotron-3.5-ASR-0.6B-LittleBit` es un checkpoint de pesos adaptado del modelo de reconocimiento automatico del habla (ASR) en streaming `nvidia/nemotron-3.5-asr-streaming-0.6b`. Lo publica el usuario `dcharlot65-openie` y no procede de NVIDIA directamente: es una reformulacion del modelo base para ejecutarse dentro de JouleDB, un motor de base de datos "termodinamico" escrito en Rust que prescinde de PyTorch en tiempo de inferencia.

La propuesta tecnica es una compresion extrema: el checkpoint original de 0,6B parametros (637.997.088 en total) se almacena en un formato propietario `.jsyn` de 9,59 MB, un factor de compresion de 126,90x respecto al equivalente en FP16 (1.216,88 MB) y una media de 0,0479 bits por peso. El autor lo describe como "living weights" combinando una factorizacion LittleBit-2 con el metodo SVF (Singular Value Fine-tuning) de Sakana, aunque la model card no documenta el procedimiento de cuantizacion con suficiente detalle tecnico.

Es relevante como experimento de despliegue ultraligero de un modelo ASR en entornos Kubernetes-native, pero conviene tratarlo con cautela: el repositorio pesa 0,0 GB, no tiene descargas ni likes, no publica benchmarks y la libreria `jouledb` es un runtime poco extendido. No es un modelo de proposito general ni un LLM, sino un adaptador de pesos para un runtime concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ASR en streaming de NVIDIA, detalles no publicados en la informacion) |
| Parametros totales | 637.997.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit propietario (LittleBit-2 + SVF), 0,0479 BPW medio, formato `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw.ai) |
| Formato de pesos | `.jsyn` (JouleDB); no safetensors ni GGUF |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Tensores 2D (bitplanes) | 328 |
| Vectores 1D (LayerNorm/bias/depthwise) | 327 |
| Tamano comprimido | 9,59 MB |
| Tamano equivalente FP16 | 1.216,88 MB |
| Factor de compresion | 126,90x |
| Runtime | JouleDB v0.2.4+ (Rust, sin PyTorch) |
| Fecha de publicacion | 2026-11-24 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b` mas alla de su naturaleza ASR en streaming y su tamano de 0,6B parametros. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO.

Lo que si documenta la model card es el proceso de transformacion de pesos: 328 tensores 2D se almacenan como bitplanes y 327 vectores 1D (LayerNorm, bias y tensores depthwise) se conservan aparte. El autor describe la tecnica como una combinacion de "LittleBit-2" (factorizacion sub-1-bit) y "Sakana SVF" (Singular Value Fine-tuning), empaquetada con compresion zstd y verificacion CRC32. No se especifica la perdida de calidad (WER u otra metrica) introducida por esta cuantizacion, ni se aporta el procedimiento reproducible de conversion. Sin esa documentacion, la innovacion tecnica debe considerarse no verificada.

## Capacidades

- Reconocimiento automatico del habla en modo streaming, heredado del modelo base de NVIDIA (transcripcion incremental de audio).
- Inferencia sin PyTorch mediante el runtime JouleDB, orientada a despliegue en Kubernetes (`JouleKube`).
- Carga remota del checkpoint desde Hugging Face mediante `db.hf_pull(...)`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion.
- Modo "thinking", vision o audio adicional: no disponibles.

## Casos de uso

- Transcripcion de audio en streaming en infraestructura Kubernetes: el modelo se sirve como servicio dentro de JouleDB (`jouledb serve --http-addr 127.0.0.1:8080`) y puede desplegarse como pod en un cluster, aprovechando el tamano de 9,59 MB para imagenes de contenedor minimas.
- Subtitulado en tiempo real en aplicaciones de videollamada o retransmision: el caracter streaming del modelo base encaja con la generacion incremental de transcripciones, aunque la latencia real no esta documentada.
- Procesamiento de audio en el borde (edge computing): el checkpoint comprimido de menos de 10 MB permite distribuirlo a dispositivos con almacenamiento limitado, siempre que se disponga del runtime JouleDB.
- Archivado y versionado de modelos en repositorios ligeros: el formato `.jsyn` con CRC32 facilita almacenar y verificar integridad de checkpoints en pipelines de CI, reduciendo el peso de artefactos de 1,2 GB a 9,59 MB.
- Experimentacion en investigacion sobre cuantizacion sub-1-bit: sirve como caso de estudio para medir el impacto de 0,0479 BPW en la calidad de un modelo ASR, aunque el autor no publica esas metricas.
- Pruebas de integracion del stack JouleDB/JouleKube: util para equipos que evaluan este runtime como sustrato de inferencia sin dependencias de PyTorch en entornos cloud-native.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, latencia ni throughput, ni comparaciones con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa 9,59 MB en disco, pero el runtime debe descomprimir y reconstruir los pesos en memoria; el autor no indica el consumo en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El diseno sin PyTorch y el tamano reducido sugieren viabilidad en hardware modesto, pero no hay confirmacion.
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior (`cargo binstall jouledb`), con soporte Kubernetes-native via JouleKube. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime | Benchmarks publicados |
|---|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-ASR-0.6B-LittleBit | 637.997.088 | no disponible | `.jsyn` (sub-1-bit) | OpenMDW-1.1 | JouleDB | no |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6B | no disponible | safetensors (presumible) | OpenMDW-1.1 | PyTorch / ecosistema estandar | no disponible en esta ficha |
| Whisper small (referencia de categoria ASR) | ~244M | 30 s de audio | safetensors, GGUF, etc. | MIT | whisper.cpp, transformers, etc. | si (WER publico) |
| Alternativas ASR sub-1-bit comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa es limitada: no existen en la informacion proporcionada otros checkpoints publicos que combinen LittleBit-2 y SVF sobre un modelo ASR de NVIDIA, ni datos de rendimiento del propio modelo base para contrastar la perdida por compresion.

## Limitaciones y advertencias

- No hay evidencia publicada sobre la degradacion de calidad (WER) causada por la cuantizacion a 0,0479 BPW; es el riesgo principal para cualquier uso en produccion.
- El autor no es NVIDIA: es un tercero (`dcharlot65-openie`) que redistribuye pesos derivados, sin proceso de revision visible (0 descargas, 0 likes).
- El repositorio figura con tamano 0,0 GB, lo que puede indicar que los pesos no estan efectivamente alojados o que el conteo no se ha actualizado.
- Dependencia total del runtime JouleDB: no hay conversion documentada a safetensors, GGUF ni otros formatos, lo que impide usar el modelo con herramientas estandar.
- Licencia OpenMDW-1.1: conviene revisar sus terminos en openmdw.ai antes de uso comercial; la model card la califica como "permisiva" pero no detalla obligaciones de atribucion.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue.
- Sesgos conocidos: no documentados; al heredar del modelo base de NVIDIA, arrastraria los sesgos de sus datos de entrenamiento, no descritos aqui.
- Riesgo de alucinacion en transcripcion (insercion de texto no pronunciado) no evaluado para este checkpoint.
- Ausencia de benchmarks, latencias y requisitos de memoria impide dimensionar un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-Nemotron-3.5-ASR-0.6B-LittleBit
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia OpenMDW-1.1: https://openmdw.ai/
