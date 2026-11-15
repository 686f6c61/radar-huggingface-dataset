# rleo/BS-RoFormer-viperx-317-GGUF

## Resumen

BS-RoFormer viperx 317 es un modelo de separación de fuentes musicales (music source separation) especializado en extraer voces y pista instrumental de una mezcla de audio. Lo desarrolla el usuario viperx, que publicó los pesos originales como `model_bs_roformer_ep_317_sdr_12.9755.ckpt` a través del repositorio de modelos UVR y del proyecto Music-Source-Separation-Training de ZFTurbo. Esta ficha concreta corresponde a la conversión a formato GGUF realizada por rleo para demix-rs, un port en Rust y Candle del modelo original.

El modelo resuelve el caso clásico de karaoke y generación de pistas de acompañamiento: recibe una canción estéreo a 44,1 kHz y devuelve dos señales, voces e instrumental (calculada como mezcla menos voces). Con 159.758.796 parámetros es un modelo compacto que cabe en GPU de consumo, y su conversión a GGUF con cuantización Q8_0 permite ejecutarlo en entornos con poca VRAM.

Es relevante ahora porque demuestra que la separación de fuentes de calidad (SDR de 12,97 dB en el checkpoint original, 21,7 dB de SDR en voces sobre una mezcla sintética de prueba) puede ejecutarse fuera del ecosistema Python/PyTorch, integrándose en pipelines Rust con Candle y exponiéndose como servicio HTTP. No es un modelo de lenguaje: no genera texto ni razona, y su única tarea es audio-a-audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (Band-Split RoFormer, transformer con rotary positional embeddings y band-split) |
| Parámetros totales | 159.758.796 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; procesa ventanas de audio, no tokens de texto) |
| Tipos de cuantización | F16 (recomendado para GPU), Q8_0 (con F16 en filas que no encajan en bloque); normas, sesgos y frecuencias rotatorias siempre en F32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other`, nombre `upstream-viperx`; pesos originales de viperx sin licencia explícita |
| Formato de pesos | GGUF (un solo archivo con pesos + configuración de modelo/inferencia en JSON dentro de `demix.config`); no compatible con llama.cpp |

## Arquitectura y entrenamiento

BS-RoFormer es una variante de RoFormer adaptada a separación de fuentes: divide el espectro en bandas (band-split), aplica atención con rotary positional embeddings sobre representaciones por banda y reconstruye las máscaras de cada fuente. El checkpoint original es `model_bs_roformer_ep_317_sdr_12.9755.ckpt`, con configuración en `configs/viperx/model_bs_roformer_ep_317_sdr_12.9755.yaml` del repositorio Music-Source-Separation-Training. Trabaja sobre audio estéreo a 44,1 kHz y produce dos stems: voces e instrumental.

No se dispone de información sobre el dataset de entrenamiento (número de tokens o de horas de audio, composición, uso de RLHF o DPO) en la información proporcionada. La innovación técnica destacable de esta ficha no está en el modelo sino en su empaquetado: la conversión a GGUF en el layout de demix-rs permite inferencia con Candle (Rust) en GPU o CPU, con cuantización Q8_0 selectiva y un presupuesto de atención configurable (`--attn-budget-mb`) que limita el pico de VRAM a 1,1 GB. El modelo original se distribuye a través del repositorio UVR y de Music-Source-Separation-Training.

## Capacidades

- Separación de voces e instrumental a partir de una mezcla musical estéreo a 44,1 kHz.
- Generación de pistas de karaoke (stem instrumental) y de backing tracks.
- Procesamiento por lotes de múltiples archivos de audio (por ejemplo, `*.flac`).
- Selección de stems de salida mediante la opción `--stems` (por ejemplo, solo instrumental).
- Servicio HTTP con endpoint `POST /v1/audio/separations` mediante `demix serve`.
- Integración con zallama (`modality: separation`, mismo endpoint).
- Inferencia en GPU (CUDA) o CPU, con salidas consistentes entre ambas (difieren en 51 dB en voces y 61 dB en instrumental según el autor).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente audio-a-audio.

## Casos de uso

- Karaoke automatizado: el modelo separa la voz principal de cualquier canción y genera la pista instrumental lista para cantar, con la ventaja de que la instrumental se calcula como mezcla menos voces, evitando artefactos de reconstrucción independiente.
- Generación de backing tracks para músicos: a partir de una mezcla de referencia se obtiene la base instrumental para ensayar o grabar encima, procesando lotes de archivos con `demix separate`.
- Remezcla y edición musical: disponer de stems separados permite aplicar compresión, reverb o EQ solo a la voz o solo al acompañamiento sin afectar a la otra fuente.
- Pipeline de producción en Rust: al ejecutarse con Candle y exponerse como servicio HTTP, se integra en backends escritos en Rust sin dependencia de Python ni PyTorch, reduciendo el peso del despliegue.
- Procesamiento en GPU compartida: con cuantización Q8_0 y `--attn-budget-mb 128` el pico es de 1,1 GB, por lo que puede convivir con un LLM de 27B en la misma RTX 4090 (el autor reporta 3,5–6x tiempo real en ese escenario).
- Extracción de voces para transcripción o análisis: separar la voz facilita tareas posteriores de ASR, diarización o análisis tonal, al eliminar la interferencia instrumental.
- Archivo y catalogación musical: separar stems de un catálogo permite almacenar versiones instrumentales y vocales sin necesidad de remasterizar.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| SDR voces (checkpoint original) | 12,9755 dB | Nombre del checkpoint `model_bs_roformer_ep_317_sdr_12.9755.ckpt` |
| SDR voces (mezcla sintética de prueba) | 21,7 dB | Mezcla sintética con stems conocidos (voz + acordes + percusión) |
| SDR instrumental (mezcla sintética de prueba) | 32,0 dB | Misma mezcla sintética |
| Consistencia CPU F32 vs CUDA Q8_0 | 51 dB (voces), 61 dB (instrumental) | Diferencia entre salidas de ambas configuraciones |
| Velocidad en RTX 4090 (Q8_0, 1,2 GB libres junto a LLM 27B) | 3,5–6x tiempo real | Inferencia CUDA |
| Velocidad en CPU F32 (32 núcleos) | ~0,1x tiempo real | Inferencia CPU |

No se han publicado resultados de benchmarks estándar (MUSDB18, SDX23, etc.) en la información disponible más allá del SDR del nombre del checkpoint y las pruebas sintéticas del autor.

## Requisitos de hardware

- VRAM estimada: con F16 el archivo pesa 320 MB y requiere aproximadamente 0,6–0,8 GB de VRAM en inferencia; con Q8_0 el archivo pesa 171 MB y el pico es de 1,1 GB usando `--attn-budget-mb 128`.
- GPU recomendadas: RTX 4090 (mediciones del autor), cualquier GPU NVIDIA con CUDA y al menos 2 GB de VRAM libre; A100/H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: demix-rs (CLI `demix separate`, servidor `demix serve`), zallama (`modality: separation`), compilación con `./build.sh --cuda` o `./build.sh` para CPU. No es compatible con llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: 3,5–6x tiempo real en RTX 4090 con Q8_0 compartiendo GPU con un LLM de 27B; ~0,1x tiempo real en CPU de 32 núcleos en F32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Licencia | Formato / despliegue |
|---|---|---|---|---|
| BS-RoFormer viperx 317 (esta ficha) | 159,8 M | estéreo 44,1 kHz | `other` (upstream-viperx, sin licencia explícita) | GGUF, demix-rs / Candle |
| BS-RoFormer viperx 317 original (ZFTurbo) | 159,8 M | estéreo 44,1 kHz | sin licencia explícita | `.ckpt` PyTorch, Music-Source-Separation-Training |
| Demucs (htdemucs) | ~80 M (v4) | estéreo 44,1 kHz | MIT (versión Meta) | PyTorch, Demucs CLI |
| Spleeter (4 stems) | ~20 M | estéreo 44,1 kHz | MIT | TensorFlow, Deezer |

La comparativa con Demucs y Spleeter es aproximada: no se dispone de datos de SDR comparables en la información proporcionada para establecer una comparación cuantitativa fiable. La ventaja diferencial de esta ficha frente a las alternativas es el formato GGUF y el runtime Rust/Candle, que permite despliegue ligero sin Python; la desventaja es la licencia ambigua de los pesos originales.

## Limitaciones y advertencias

- Licencia: los pesos originales de viperx se distribuyen sin licencia explícita; el autor de esta conversión advierte de que hay que consultar el upstream antes de cualquier uso comercial. El código de demix-rs es Apache-2.0, pero eso no cubre los pesos.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- No compatible con llama.cpp ni con el ecosistema GGUF de LLMs: el archivo GGUF usa el layout específico de demix-rs y contiene configuración de inferencia en `demix.config`.
- Solo separa dos stems (voces e instrumental); no separa batería, bajo u otros instrumentos, a diferencia de Demucs o Spleeter de 4 stems.
- Riesgo de artefactos y alucinaciones auditivas: en pasajes con voces muy procesadas, coros densos o instrumentos con formantes vocales, la separación puede introducir bleed o eliminar contenido.
- El SDR de referencia de 12,9755 dB corresponde al checkpoint original; las cifras de 21,7 dB y 32,0 dB son de una mezcla sintética de prueba y no deben extrapolarse a música real.
- Rendimiento en CPU limitado (~0,1x tiempo real con 32 núcleos en F32): no apto para procesamiento interactivo sin GPU.
- Sin información sobre sesgos demográficos o musicales del dataset de entrenamiento; se desconoce su comportamiento en géneros poco representados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/rleo/BS-RoFormer-viperx-317-GGUF
- demix-rs (runtime Rust/Candle): https://github.com/rzafiamy/demix-rs
- zallama (servidor compatible): https://github.com/rzafiamy/zallama
- Music-Source-Separation-Training (ZFTurbo, pesos y configuración originales): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Configuración original: `configs/viperx/model_bs_roformer_ep_317_sdr_12.9755.yaml` dentro del repositorio anterior
- Checkpoint original: `model_bs_roformer_ep_317_sdr_12.9755.ckpt` (distribuido vía UVR y Music-Source-Separation-Training)
