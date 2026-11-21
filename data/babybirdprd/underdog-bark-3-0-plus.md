# babybirdprd/Underdog-Bark-3.0-Plus

## Resumen

Underdog Bark 3.0 Plus es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por babybirdprd, publicado bajo el paraguas de Underdog y distribuido en Hugging Face. Se trata de un fine-tune del modelo NVIDIA Parakeet TDT 0.6B v3, empaquetado en un formato propietario (`model.bark`) de tan solo 180 MB que se descomprime en memoria para ejecutarse sobre MLX en Apple Silicon o sobre PyTorch en CPU/GPU. Su propuesta central es ofrecer una precision de vanguardia en la franja de modelos por debajo de 1 GB, con un WER medio del 4,76 % en los siete conjuntos ingleses del Open ASR Leaderboard.

El modelo resuelve el problema de desplegar ASR de calidad en dispositivos con recursos limitados, especialmente portatiles Apple, sin depender de servicios en la nube ni de Python en tiempo de ejecucion. Segun la model card, supera en precision a modelos mucho mayores como Parakeet TDT 0.6B v3 (4,94 %), Qwen3-ASR-0.6B (5,16 %), Voxtral Small 24B (5,21 %) o Whisper large-v3 (6,04 %), con un tamano de descarga entre 10 y 14 veces menor.

La relevancia actual radica en la combinacion de tres factores: un empaquetado de pesos extremadamente compacto, un runtime nativo en Swift para macOS que verifica integridad por SHA-256, y un rendimiento de aproximadamente 41x tiempo real en un Apple M2 con mlx-audio estandar. Todo ello con licencia CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TDT (Token-and-Duration Transducer), heredada de NVIDIA Parakeet TDT 0.6B v3 |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio en una sola pasada, sin ventana de tokens declarada) |
| Tipos de cuantizacion | low-bit (formato propietario `model.bark` empaquetado); no se detallan esquemas GGUF ni otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `model.bark` (contenedor propietario) + carpeta `mlx/` para MLX; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Parakeet TDT 0.6B v3, un transformer con arquitectura Token-and-Duration Transducer (TDT), que predice conjuntamente tokens de texto y duraciones para mejorar la alineacion temporal en la transcripcion. Sobre esa base, el autor ha realizado un fine-tune (segun el campo `base_model_relation: finetune`) y ha empaquetado los pesos en un contenedor `model.bark` de baja precision que se descomprime de forma exacta en memoria, con verificacion de tamano y SHA-256 de cada fichero descargado.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion tecnica destacable es el propio empaquetado: un unico fichero de 180 MB que un runtime nativo en Swift (Underdog) descomprime en aproximadamente 2 segundos en Apple silicon y ejecuta sobre MLX, con pesos bit-identicos a los que produce `bark_loader.py`. El modelo transcribe audio en una sola pasada, lo que implica que el consumo de memoria crece con la duracion del fichero.

## Capacidades

- Transcripcion de voz a texto en ingles con salida verbatim, incluyendo muletillas ("um", "uh"), reinicios y palabras repetidas.
- Reconocimiento robusto en dominios diversos: conversaciones telefonicas (Earnings-22), reuniones (AMI), discurso parlamentario (VoxPopuli), lectura (LibriSpeech) y audio general (GigaSpeech, SPGISpeech).
- Ejecucion en dispositivo (on-device) sin envio de audio a la nube, con verificacion de integridad de pesos.
- Inferencia en CPU, GPU CUDA y Apple Silicon (MPS/MLX) mediante `bark_loader.py` o `bark_mlx.py`.
- Integracion con `mlx-audio` estandar para transcripcion de ficheros completos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla del ASR.
- Capacidad monolingue: solo ingles.

## Casos de uso

- Dictado en portatiles Apple: el modelo se ejecuta sobre MLX con un runtime nativo Swift y transcribe un minuto de audio en aproximadamente 1,5 segundos en un M2, lo que lo hace adecuado para dictado en tiempo real en aplicaciones de escritorio sin conexion.
- Transcripcion de reuniones y actas: con un WER del 7,76 % en AMI, puede generar transcripciones de reuniones grabadas, dividiendo el audio en fragmentos de pocos minutos para controlar el consumo de memoria en equipos de 8 o 16 GB.
- Subtitulado y postproduccion de video: el WER del 1,92 % en VoxPopuli y 3,64 % en SPGISpeech lo hacen util para generar subtitulos de contenido hablado formal o leido, con la ventaja de que el audio no sale del dispositivo.
- Analisis de llamadas de atencion al cliente: su rendimiento en Earnings-22 (6,70 %) permite transcribir grabaciones telefonicas para auditoria de calidad y analitica, procesando lotes en una GPU o en CPU.
- Aplicaciones de accesibilidad: transcripcion en tiempo real de conversaciones presenciales en un Mac o dispositivo Apple silicon, con procesamiento local y sin dependencia de red.
- Investigacion en ASR de bajo consumo: sirve como referencia para estudiar el efecto del empaquetado low-bit y del fine-tune sobre Parakeet TDT, dado que los pesos descomprimidos son bit-identicos a los medidos.
- Transcripcion de audio con disfluencias: con un WER del 3,21 % en DisfluencySpeech, es adecuado para tareas que requieren transcripcion verbatim (entrevistas, estudios linguisticos, analisis de habla espontanea).

## Benchmarks y rendimiento

Resultados de WER (%) en los siete conjuntos ingleses del Open ASR Leaderboard (menor es mejor):

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Phonon-2 | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Qwen3-ASR-0.6B | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Qwen3-ASR-1.7B | 4.699 MB | 1,26 | 2,94 | 8,31 | 5,84 | 7,22 | 2,57 | 2,85 | 4,43 |
| Whisper large-v3 | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

DisfluencySpeech (WER %, con muletillas contadas):

| Modelo | WER (%) |
|---|---:|
| Bark 3.0 Pro | 2,95 |
| Bark 3.0 | 3,15 |
| Bark 3.0 Plus | 3,21 |
| Phonon-2 | 3,39 |

Rendimiento declarado: aproximadamente 41x tiempo real en un Apple M2 con mlx-audio estandar (un minuto de audio en unos 1,5 segundos).

## Requisitos de hardware

- VRAM/RAM: el fichero descargado ocupa 180 MB; los pesos descomprimidos en memoria son mayores. En una maquina de 16 GB (M2) un fichero de 10 minutos alcanzo un pico de aproximadamente 15 GB con mlx-audio estandar.
- GPU recomendadas: cualquier GPU con CUDA (el `load_model` acepta `device="cuda"`); en Apple silicon se ejecuta via MPS o MLX. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, dado el tamano de 0,6B parametros y la descarga de 180 MB; el limite practico es la duracion del audio, no el modelo.
- Despliegue: `bark_loader.py` (PyTorch, CPU/CUDA/MPS), `bark_mlx.py` (MLX en Apple silicon), runtime nativo Swift de Underdog, `mlx-audio` 0.5.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia/throughput: aproximadamente 41x tiempo real en Apple M2. Descomposicion de pesos en unos 2 segundos en Apple silicon. No se publican cifras de throughput en GPU CUDA.
- Recomendacion practica: dividir grabaciones largas en fragmentos de pocos minutos en Macs de 8 o 16 GB para evitar picos de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER medio (7 sets EN) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Underdog Bark 3.0 Plus | 0,6B | no disponible | 4,76 | CC-BY-4.0 | Hugging Face (formato `model.bark`) |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B | no disponible | 4,94 | no disponible en la informacion | Hugging Face (modelo base) |
| Qwen3-ASR-0.6B | 0,6B | no disponible | 5,16 | no disponible en la informacion | Hugging Face |
| Whisper large-v3 | ~1,55B | no disponible | 6,04 | no disponible en la informacion | Hugging Face / OpenAI |
| Phonon-2 | no disponible | no disponible | 5,21 | no disponible en la informacion | Hugging Face |

Bark 3.0 Plus ofrece el mejor WER medio de la comparativa con el menor tamano de descarga (180 MB), frente a los 2.508 MB de Parakeet TDT 0.6B v3 o los 9.261 MB de Whisper large-v3. La contrapartida es un formato de pesos propietario y un ecosistema de ejecucion mas restringido.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Transcribe de forma verbatim: conserva muletillas, reinicios y repeticiones, lo que puede no ser deseable para todos los casos de uso (existe una variante Clean para dictado).
- El consumo de memoria crece linealmente con la duracion del audio en una sola pasada; en equipos de 8 o 16 GB es necesario fragmentar las grabaciones largas.
- Formato de pesos propietario (`model.bark`): no hay safetensors ni GGUF, lo que limita la integracion con ecosistemas estandar como llama.cpp, Ollama o vLLM.
- Dependencia de versiones concretas de librerias (transformers 5.19.0, torch 2.8.0, mlx 0.32.2, mlx-audio 0.5.3, constriction 0.5.0), lo que puede complicar la reproducibilidad.
- Los resultados de benchmarks de las filas Bark no estan publicados en el Open ASR Leaderboard a fecha de la model card; usan su codigo de evaluacion.
- Riesgo de alucinacion en audio con ruido, acentos no nativos o vocabulario tecnico; no se documentan sesgos especificos.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero conviene revisar los terminos del modelo base NVIDIA Parakeet TDT 0.6B v3.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/babybirdprd/Underdog-Bark-3.0-Plus
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante Clean: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Underdog: https://underdog.ai
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Repositorio mlx-audio: https://github.com/ml-explore/mlx-audio
