# babybirdprd/Underdog-Bark-3.0

## Resumen

Underdog Bark 3.0 es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por babybirdprd (ConwayResearch), afinado a partir de nvidia/parakeet-tdt-0.6b-v3. Su propuesta central es la eficiencia extrema: con 0,6 mil millones de parametros y un unico fichero de pesos de 163 MB, alcanza un WER medio del 4,94 % en los siete conjuntos de prueba en ingles del Open ASR Leaderboard, situandose al nivel de modelos entre 15 y 600 veces mas grandes en descarga.

El modelo emplea una arquitectura derivada de Parakeet TDT (Token-and-Duration Transducer) con atencion a nivel de token y prediccion de duracion, reempaquetada en un formato propietario `model.bark` que un runtime nativo en Swift descomprime en memoria y ejecuta sobre MLX en Apple Silicon. La inferencia es totalmente local: el audio no sale del dispositivo y el runtime verifica integridad mediante tamano fijado y SHA-256.

Es relevante ahora porque demuestra que un modelo ASR de 163 MB puede superar a Whisper large-v3 (9,3 GB) y a Parakeet TDT 0.6B v3 (2,5 GB) en precision media, lo que habilita dictado y transcripcion en dispositivos de consumo, portatiles Apple y entornos sin GPU dedicada. La familia Bark 3.0 (Plus, Pro) mantiene la frontera de precision para tamanos de 163 MB a 1,25 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo TDT (Token-and-Duration Transducer), derivada de Parakeet TDT |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Low-bit propietario empaquetado en `model.bark`; pesos MLX; no se documentan niveles de cuantizacion estandar (GGUF, AWQ, etc.) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `model.bark` (contenedor propietario), MLX (`mlx/`), cargable via `bark_loader.py` con PyTorch/Transformers |

## Arquitectura y entrenamiento

Underdog Bark 3.0 es un finetune de nvidia/parakeet-tdt-0.6b-v3, un modelo transducer TDT que combina un encoder acustico con un decoder de prediccion y una red de union que emite simultaneamente tokens y duraciones. Esta formulacion permite decodificacion no autorregresiva por saltos de duracion, lo que explica su velocidad (41x tiempo real en un M2). El modelo se distribuye en un contenedor `model.bark` que se descomprime en memoria en unos 2 segundos en Apple Silicon; los pesos descomprimidos son bit-identicos a los que produce `bark_loader.py`, lo que garantiza reproducibilidad de las metricas publicadas.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF, DPO o alguna fase de alineacion. La model card indica que el modelo transcribe literalmente el habla, incluyendo muletillas y reinicios, sin limpieza, y que existe una variante "Clean" (Underdog Bark 3.0 Clean) para dictado que elimina los "um". La innovacion tecnica destacable es el empaquetado de pesos de baja precision con verificacion criptografica y un runtime nativo Swift sobre MLX, orientado a inferencia on-device sin Python.

## Capacidades

- Transcripcion de voz a texto en ingles, con salida literal que preserva muletillas, reinicios y repeticiones.
- Reconocimiento robusto en habla espontanea y conversacional (3,15 % WER en DisfluencySpeech).
- Alto rendimiento en dominios especificos: reuniones (7,82 % en AMI) y discursos parlamentarios (2,05 % en VoxPopuli).
- Inferencia on-device en Apple Silicon via MLX, con verificacion de integridad de pesos.
- Ejecucion en CPU, CUDA y MPS mediante `bark_loader.py` (PyTorch/Transformers).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla de ASR, ni modo thinking.
- Capacidad multilingue limitada al ingles; no se reportan otros idiomas.

## Casos de uso

- Dictado en portatiles Apple: el runtime nativo Swift sobre MLX transcribe un minuto de audio en ~1,5 segundos (41x tiempo real) en un M2, con el audio sin salir del dispositivo, lo que lo hace apto para aplicaciones de escritura por voz con requisitos de privacidad.
- Transcripcion de reuniones: con 7,82 % WER en AMI, es adecuado para generar actas y resumenes de reuniones grabadas, especialmente cuando se combina con un LLM posterior para estructurar el texto.
- Subtitulado y transcripcion de contenido audiovisual en ingles: su WER de 1,89 % en LibriSpeech clean y 4,08 % en other permite generar subtitulos de alta calidad en pipelines por lotes.
- Analisis de discurso parlamentario y politico: 2,05 % en VoxPopuli lo posiciona para monitorizacion de sesiones, indexacion de intervenciones y busqueda sobre transcripciones.
- Procesamiento de audio financiero: 7,05 % en Earnings-22 permite transcribir llamadas de resultados y conferencias para analisis de sentimiento y extraccion de entidades.
- Aplicaciones moviles y de borde sin GPU: con 163 MB de descarga y ejecucion en CPU/MPS, cabe en dispositivos con recursos limitados para asistentes de voz offline.
- Investigacion en ASR eficiente: sirve como referencia reproducible para estudiar el impacto del empaquetado de baja precision y la decodificacion TDT en precision final.

## Benchmarks y rendimiento

WER (%) en los siete conjuntos en ingles del Open ASR Leaderboard; menor es mejor. Las filas Bark usan el codigo de scoring del leaderboard pero no estan publicadas en el.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| **Bark 3.0** | **163 MB** | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Phonon-2 | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Qwen3-ASR-0.6B | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Whisper large-v3 | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

En habla disfluente (DisfluencySpeech, 250 clips, transcripcion verbatim con muletillas): Bark 3.0 Pro 2,95 %, Bark 3.0 3,15 %, Bark 3.0 Plus 3,21 %, Phonon-2 3,39 %.

A tres decimales y con el promedio propio del leaderboard, Bark 3.0 Pro promedia 4,286 frente a 4,291 de Hojo-ASR-V1. En velocidad, la model card reporta ~41x tiempo real en un Apple M2 con mlx-audio.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 163 MB; los pesos MLX descomprimidos ocupan mas en memoria (no se documenta la cifra exacta). En CPU y MPS es viable con RAM modesta.
- GPU recomendadas: cualquier GPU con soporte PyTorch (CUDA) o Apple Silicon con MPS/MLX; no requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con unos pocos GB de VRAM; tambien en CPU.
- Opciones de despliegue: `bark_loader.py` (PyTorch/Transformers, devices `cuda`, `cpu`, `mps`), `bark_mlx.py` con mlx-audio en Apple Silicon, runtime nativo Underdog en Swift. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: ~1,5 s por minuto de audio (41x tiempo real) en Apple M2 con mlx-audio; descompresion de pesos en memoria en ~2 s en Apple Silicon. No se reportan cifras para CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | WER medio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Underdog Bark 3.0 | 600 M | 163 MB | 4,94 | no disponible | CC-BY-4.0 | Hugging Face, runtime propio |
| Phonon-2 | no disponible | 164 MB | 5,21 | no disponible | no disponible | Hugging Face |
| Parakeet TDT 0.6B v3 | 600 M | 2.508 MB | 4,94 | no disponible | no disponible | Hugging Face (NVIDIA) |
| Qwen3-ASR-0.6B | 600 M | 1.876 MB | 5,16 | no disponible | no disponible | Hugging Face |
| Whisper large-v3 | 1.550 M | 9.261 MB | 6,04 | 30 s (ventana fija) | MIT | Hugging Face, OpenAI |

Bark 3.0 iguala en media a Parakeet TDT 0.6B v3 con una decimoquinta parte de la descarga, supera a Phonon-2 al mismo tamano y mejora a Whisper large-v3 con un fichero 57 veces menor. La comparativa de licencias de los competidores no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Modelo de 600 M parametros: su techo de precision en dominios acusticamente dificiles (ruido, acentos no representados) es inferior al de modelos grandes como Bark 3.0 Pro o Cohere Transcribe.
- Transcribe literalmente, incluidas muletillas y reinicios; para dictado limpio debe usarse la variante Clean.
- Riesgo de alucinacion y errores en nombres propios, cifras y terminos tecnicos, comun en ASR; requiere revision en contextos criticos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero no se documentan restricciones adicionales del modelo base NVIDIA; conviene verificar la licencia de parakeet-tdt-0.6b-v3 antes de produccion.
- El formato `model.bark` es propietario y depende del runtime Underdog o de `bark_loader.py`; no hay soporte documentado en ecosistemas estandar como vLLM, TGI o llama.cpp.
- No se documentan sesgos demograficos ni evaluaciones por acento o genero.
- El modelo no esta publicado en el Open ASR Leaderboard; las cifras Bark usan su codigo de scoring pero no han sido auditadas por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/babybirdprd/Underdog-Bark-3.0
- Variante Clean: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime Underdog: https://underdog.ai
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
