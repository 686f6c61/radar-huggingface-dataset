# FluidInference/phonon-2-coreml

## Resumen

phonon-2-coreml es la compilación en Core ML de FermionResearch/Phonon-2, un modelo de reconocimiento automático de habla (ASR) en inglés desarrollado por Fermion Research. Phonon-2 es a su vez un reentrenamiento con conciencia de cuantización (quantization-aware re-training) de nvidia/parakeet-tdt-0.6b-v3, en el que cada peso del encoder toma uno de cinco valores aprendidos por fila de salida. FluidInference publica aquí el artefacto listo para ejecutarse en Apple Silicon a través de su SDK FluidAudio, con la inferencia delegada al Neural Engine (ANE).

El modelo resuelve transcripción de voz totalmente local, sin conexión y de baja latencia en dispositivos Apple. Mantiene el mismo tokenizador, la misma ventana de 15 segundos y el mismo contrato `Decoder` / `JointDecisionv3` que parakeet-tdt-0.6b-v3-coreml, por lo que es intercambiable dentro del SDK mediante `AsrModelVersion.phonon2`. La arquitectura es la de un encoder tipo Conformer (Parakeet) con decodificador TDT (token-and-duration transducer), con aproximadamente 600 millones de parámetros, y el repositorio ocupa 1,5 GB al incluir cinco variantes de encoder.

La relevancia actual está en el compromiso entre tamano y velocidad: la variante por defecto ocupa 321 MB, procesa una ventana de 15 s en 18,6 ms en un M5 Pro y alcanza un RTFx de 159× sobre LibriSpeech test-clean con el encoder en el ANE, superando en velocidad al propio parakeet-tdt-0.6b-v3 (149–152×) a costa de 0,20–0,50 puntos de WER. Está publicado bajo licencia CC-BY-4.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo Conformer (Parakeet) + decodificador TDT (token-and-duration transducer); red de predicción RNNT y joint de un solo paso |
| Parametros totales | ~600 M (heredados de nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 15 s de audio por ventana; el audio largo se procesa concatenando ventanas (sin limite de contexto textual) |
| Tipos de cuantizacion | Paletas aprendidas de 6, 4 y 2 bits por fila o por grupo de filas; variantes densas (`constexpr_lut_to_dense`) y sparse (`constexpr_lut_to_sparse` + `constexpr_sparse_to_dense`); decoder y joint reexportados desde tablas int6 |
| Idiomas soportados | en (solo inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`); paletas en fp16; vocabulario en `parakeet_vocab.json` |

## Arquitectura y entrenamiento

El modelo es una compilación Core ML, no un entrenamiento nuevo: los pesos del encoder proceden del checkpoint Phonon-2 de Fermion Research y se exportan como paletas fp16 con `constexpr_lut_to_dense` (iOS 18 / macOS 15) o como máscara de esparsidad más paleta sobre los pesos no nulos con `constexpr_lut_to_sparse` + `constexpr_sparse_to_dense`. Según la model card, cada encoder contiene los pesos exactos de cinco valores del checkpoint, sin ruido de recuantización anadido, y las cinco variantes producen transcripciones idénticas. El decoder y el joint se reexportan desde las tablas int6 del checkpoint, mientras que el preprocesador y el vocabulario son los mismos que los de parakeet-tdt-0.6b-v3. El encoder de Phonon-2 se deriva de un reentrenamiento con conciencia de cuantización de nvidia/parakeet-tdt-0.6b-v3, con el mismo tokenizador y contrato de decoder que la versión v3.

La decisión de diseno clave está en el coste de las paletas en el Neural Engine: crece con el número de paletas, no con su ancho de bits. Por eso 8 filas por paleta (`Encoder.mlmodelc`, 321 MB) es más rápido que el propio encoder de v3, mientras que las paletas por fila son unas 3× más lentas. Además, el GPU materializa los pesos sparse en cada carga (~150 s de CPU, sin caché), mientras que el ANE los compila una vez (~1 min) y los cachea. La fidelidad de conversión se verificó sobre los primeros 100 archivos de test-clean: las transcripciones Core ML difieren de una decodificación NeMo fp32 de contexto completo del mismo checkpoint en un 0,34 % de WER (1,83 % frente a 1,79 %).

## Capacidades

- Transcripción de voz a texto en inglés (`pipeline_tag: automatic-speech-recognition`), con salida de transcripción completa por archivo de audio.
- Decodificación TDT (token-and-duration transducer) con joint de un solo paso y `top-64`, y red de predicción RNNT en fp16.
- Procesamiento por ventanas de 15 s, apto para audio largo mediante concatenación de ventanas (probado con un archivo de 3600 s).
- Ejecución totalmente local y sin conexión, con inferencia en el Apple Neural Engine, GPU o CPU.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo exclusivamente de reconocimiento de habla, no generativo.
- Capacidades multilingües: no. Solo inglés (v3 cubre 25 idiomas; Phonon-2 no).
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio más allá de la propia transcripción.

## Casos de uso

- Transcripción local en aplicaciones iOS y macOS: el SDK FluidAudio carga `Encoder.mlmodelc` desde el Neural Engine (`AsrModelVersion.phonon2`) y permite transcribir un archivo con unas pocas líneas de Swift, sin enviar audio a servidores externos.
- Dictado y notas de voz en el dispositivo: con 18,6 ms por ventana de 15 s, el modelo puede alimentar interfaces de dictado con latencia imperceptible y sin coste de red.
- Actas y resúmenes de reuniones: procesa audio largo por concatenación de ventanas; en un archivo de 60 minutos (Earnings-22) tarda 7,5 s con RTFx 478×, lo que permite transcribir reuniones completas en segundos antes de pasarlas a un sistema de resumen.
- Subtitulado y accesibilidad en tiempo real: al ejecutarse en el ANE y no depender de CUDA ni de servidores, encaja en apps de subtitulado en vivo para usuarios con discapacidad auditiva.
- Indexado y búsqueda de archivos de audio: transcripción masiva de podcasts, grabaciones de llamadas o archivos históricos para generar índices de texto buscables, aprovechando el throughput alto y el bajo consumo del ANE.
- Procesamiento en segundo plano en iOS: FluidAudio senala el Neural Engine como la única opción para trabajo en segundo plano en iOS, por lo que este encoder es adecuado para tareas diferidas de transcripción dentro de una app.
- Analítica de contact center: transcripción de llamadas conversacionales en local; conviene tener en cuenta que en audio conversacional largo el WER sube al 17,2 %, por lo que es más adecuado para búsqueda y clasificación gruesa que para transcripción literal de alta fidelidad.
- Despliegue en dispositivos con almacenamiento limitado: las variantes `Encoder_sparse-g4` (246 MB) y `Encoder_sparse-g1` (176 MB) permiten reducir el peso del modelo en disco a costa de throughput (140× y ~70× de RTFx respectivamente).

## Benchmarks y rendimiento

Resultados sobre LibriSpeech con FluidAudio `asr-benchmark`, M5 Pro, encoder por defecto en el ANE. WER a nivel de corpus; RTFx = audio total / tiempo de proceso.

| Conjunto (ANE) | v3 | Ultra | Phonon-2 |
|---|---|---|---|
| test-clean (2620 archivos) WER | 2,27 % | 2,13 % | 2,47 % |
| test-other (2939 archivos) WER | 4,12 % | 3,81 % | 4,62 % |
| test-clean RTFx | 149–152× | 151× | 159× |
| test-other RTFx | 138× | 142× | 146× |

Ficheros del encoder, una ventana de 15 s en M5 Pro (macOS 27), encoder en el ANE. Los cinco son exactos y dan las mismas transcripciones.

| Fichero | Tamano | Codificacion | ANE | ANE RTFx | GPU |
|---|---:|---|---:|---:|---|
| `Encoder.mlmodelc` (por defecto) | 321 MB | máscara sparse + paleta de 6 bits por 8 filas | 18,6 ms | 159× | 16 ms, ~150 s de carga en cada arranque |
| `Encoder_sparse-g4.mlmodelc` | 246 MB | máscara sparse + paleta de 4 bits por 4 filas | 24,3 ms | 140× | misma advertencia de carga |
| `Encoder_sparse-g1.mlmodelc` | 176 MB | máscara sparse + paleta de 2 bits por fila | 70 ms | ~70× | misma advertencia de carga |
| `Encoder_lut6.mlmodelc` | 470 MB | paleta densa de 6 bits por 8 filas | 18,6 ms | 155× | 16 ms, 0,6 s de carga |
| `Encoder_lut3.mlmodelc` | 253 MB | paleta densa de 3 bits por fila | 72 ms | 70× | 16 ms, 0,7 s de carga |
| v3 `Encoder.mlmodelc` (6 bits, referencia) | 445 MB | — | 23,5 ms | 149–152× | 18 ms |

Archivo largo de 60 minutos (Earnings-22, cuatro llamadas concatenadas), 3600 s, M5 Pro, encoder por defecto en el ANE, mejor de 2–3 ejecuciones.

| Modelo | Tiempo de proceso | RTFx | WER |
|---|---:|---:|---:|
| v3 | 10,9 s | 331× | 16,5 % |
| Ultra | 7,7 s | 469× | 13,5 % |
| Redux | 14,2 s | 254× | 14,8 % |
| Phonon-2 por defecto (sparse, 321 MB) | 7,5 s | 478× | 17,2 % |
| Phonon-2 `Encoder_lut6` (470 MB) | 7,4 s | 486× | 17,2 % |
| Phonon-2 `Encoder_sparse-g4` (246 MB) | 9,0 s | 399× | 17,2 % |
| Phonon-2 `Encoder_sparse-g1` (176 MB) | 23,4 s | 154× | 17,2 % |
| Phonon-2 `Encoder_lut3` (253 MB) | 23,6 s | 152× | 17,2 % |

Fidelidad de conversión: 1,83 % de WER frente a 1,79 % de una decodificación NeMo fp32 de contexto completo del mismo checkpoint en los primeros 100 archivos de test-clean (0,34 % de diferencia). La model card menciona que, bajo el protocolo del Open ASR Leaderboard, Phonon-2 queda por detrás de v3 en LibriSpeech (+0,20 / +0,79) pero supera a v3 en AMI (reuniones) y VoxPopuli; no se facilitan las cifras concretas de AMI y VoxPopuli.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con Neural Engine (iOS 18+ / macOS 15+ para el encoder ANE; decoder y joint requieren iOS 17+). No hay soporte CUDA ni ejecución en GPU NVIDIA.
- VRAM/memoria para inferencia: el encoder ocupa entre 176 MB (`Encoder_sparse-g1`) y 470 MB (`Encoder_lut6`); el decoder y el joint en fp16 se suman a esa cifra (tamano no disponible). Repositorio completo: 1,5 GB.
- Opciones de encoder según acelerador: Neural Engine → `Encoder.mlmodelc` (321 MB); GPU → `Encoder_lut3.mlmodelc` (253 MB, pequeno) o `Encoder_lut6.mlmodelc` (470 MB, rápido en cualquier acelerador); minimo tamano → `Encoder_sparse-g1.mlmodelc` (176 MB).
- Advertencia de carga en GPU: los pesos sparse se materializan en cada arranque (~150 s de CPU, sin caché); el ANE los compila una vez (~1 min) y los cachea.
- No cabe en GPU de consumo NVIDIA ni se despliega con vLLM, llama.cpp, Ollama o TGI: el único camino soportado es el SDK FluidAudio (Swift) y la CLI `fluidaudiocli`.
- Rendimiento medido en M5 Pro (macOS 27): 18,6 ms por ventana de 15 s con el encoder por defecto en el ANE, RTFx 159× en test-clean y 478× en un archivo de 60 minutos. Latencia y throughput en otros chips Apple: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana | WER test-clean | WER test-other | RTFx test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Phonon-2 (este modelo, Core ML) | ~600 M | 15 s | 2,47 % | 4,62 % | 159× | cc-by-4.0 | HuggingFace, via FluidAudio `AsrModelVersion.phonon2` |
| parakeet-tdt-0.6b-v3 (Core ML) | ~600 M | 15 s | 2,27 % | 4,12 % | 149–152× | no disponible | HuggingFace (FluidInference/parakeet-tdt-0.6b-v3-coreml) |
| Ultra (FluidAudio) | no disponible | no disponible | 2,13 % | 3,81 % | 151× | no disponible | FluidAudio |
| Redux (FluidAudio) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | FluidAudio |
| FermionResearch/Phonon-2 (checkpoint fp) | ~600 M | 15 s | 2,47 % (via esta conversion) | 4,62 % | no disponible | no disponible | HuggingFace |

En el conjunto largo conversacional (Earnings-22) el orden se invierte parcialmente: Ultra (13,5 % de WER, 469×), Redux (14,8 %, 254×) y v3 (16,5 %, 331×) superan en precisión a Phonon-2 (17,2 %, 478×), que a cambio es el más rápido de los cuatro.

## Limitaciones y advertencias

- Solo inglés: no soporta los 25 idiomas de parakeet-tdt-0.6b-v3. Cualquier audio en otro idioma queda fuera de alcance.
- Precisión inferior a la de su modelo de partida: +0,20 puntos de WER en test-clean y +0,50 en test-other (2,47 % frente a 2,27 % y 4,62 % frente a 4,12 %).
- Peor rendimiento en audio conversacional largo: 17,2 % de WER en Earnings-22, frente a 13,5 % de Ultra, 14,8 % de Redux y 16,5 % de v3.
- No se documentan sesgos demográficos, acústicos ni de acento; no hay evaluación de sesgo en la información disponible.
- Riesgo de error de transcripción (inserciones, sustituciones y omisiones típicas de un ASR), especialmente en audio ruidoso o solapamiento de hablantes. Al no ser generativo, el riesgo de alucinación libre es menor que en un modelo de lenguaje, pero no es nulo en segmentos ambiguos.
- Requiere hardware Apple: dependencia total de Core ML y del Neural Engine; no hay ruta de despliegue en Linux, Windows o servidores con GPU NVIDIA.
- Restricción practica de despliegue: el encoder por defecto en GPU tarda ~150 s en cargar por arranque al materializar los pesos sparse sin caché; usar `Encoder_lut3` o `Encoder_lut6` en ese escenario.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. El repositorio incluye `NOTICE` y `LICENSE` con la atribución upstream, que debe conservarse.
- Modelo recién publicado y con nula tracción medida (0 descargas, 0 likes en el momento de la consulta); no hay validación independiente de los números de la model card.
- Las cifras de WER de FluidAudio están por encima de las de la model card original porque FluidAudio decodifica en ventanas de 15 s con un normalizador más simple; ambos modelos comparados pagan el mismo efecto, pero no son directamente comparables con resultados de otros pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/phonon-2-coreml
- Checkpoint base: https://huggingface.co/FermionResearch/Phonon-2
- Modelo del que deriva la arquitectura: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion Core ML de referencia v3: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- SDK FluidAudio (GitHub): https://github.com/FluidInference/FluidAudio
- Pull request de integracion en FluidAudio: https://github.com/FluidInference/FluidAudio/pull/980
- Organizacion FluidInference en GitHub: https://github.com/FluidInference
- Documentacion de modelos FluidInference: https://docs.fluidinference.com/reference/models
- Coleccion de modelos Core ML de FluidInference: https://huggingface.co/collections/FluidInference/coreml-models-6873d9e310e638c66d22fba9
