# mashbox-labs/Phonon-2.5-English-CoreML

## Resumen

Phonon-2.5-English-CoreML es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) Phonon-2.5 English de Fermion Research, publicada por mashbox-labs. El modelo original deriva de NVIDIA Parakeet TDT 0.6B v3, y esta versión empaqueta el encoder, decoder, red conjunta y front end de audio como artefactos `.mlmodelc` optimizados para ejecutarse en la Apple Neural Engine de dispositivos con silicio de Apple. El objetivo es permitir transcripción de voz en local, con baja latencia y sin dependencia de servicios en la nube, en macOS e iOS.

La relevancia técnica reside en que el encoder se ejecuta casi por completo en la Neural Engine: según las mediciones del autor, el 99,5 % de las operaciones de cómputo del encoder (1.378 de 1.385) y el 100 % de su coste estimado se ejecutan en la Neural Engine, con una similitud coseno de 0,99973 a 0,99987 respecto a la referencia float32. El paquete completo pesa 379,6 MB (encoder 341,1 MB, decoder 23,6 MB, red conjunta 12,7 MB, front end 2,0 MB) y procesa audio en ventanas de hasta 15 segundos.

El modelo está pensado para desarrolladores que integran transcripción en aplicaciones nativas de Apple mediante FluidAudio, la librería que carga estos artefactos. Su licencia CC-BY-4.0 permite uso comercial con atribución. La principal advertencia del autor es la pérdida de precisión en audio largo: la decodificación por ventanas de 15 s produce un incremento de +0,757 puntos de WER en clips de 52 a 118 segundos frente a la referencia que procesa el clip completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) derivada de NVIDIA Parakeet TDT 0.6B v3; encoder, decoder y red conjunta exportados a Core ML |
| Parametros totales | no disponible (modelo base Parakeet TDT 0.6B, aproximadamente 0,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de hasta 15 s por pasada (funciones de encoder de 15.000 ms, 10.160 ms y 5.040 ms) |
| Tipos de cuantizacion | pesos comprimidos heredados del release de Fermion Research, sin compresión adicional; front end en float32 sobre CPU |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), vocabulario en JSON (`parakeet_vocab.json`, 8.192 tokens) |

## Arquitectura y entrenamiento

El modelo es una implementación de transducer TDT, la misma familia que NVIDIA Parakeet TDT 0.6B v3. Se compone de cuatro piezas: un front end de audio (`Preprocessor.mlmodelc`) que convierte audio a 16 kHz en un espectrograma log-mel de 128 bandas y se ejecuta en CPU en float32; un encoder (`Encoder.mlmodelc`) que corre en la Neural Engine con tres funciones según la longitud de la ventana (15.000 ms por defecto, 10.160 ms y 5.040 ms); un decoder (`Decoder.mlmodelc`); y una red conjunta (`JointDecisionv3.mlmodelc`). Los pesos comprimidos del encoder se copian exactamente del release de Fermion Research, y el decoder y la red conjunta se construyen a partir de las tablas del mismo release. El front end se exporta desde la configuración del extractor de características del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación técnica destacable es la exportación a Core ML con ejecución del encoder en la Neural Engine: el autor reporta que el 99,5 % de las operaciones del encoder y el 100 % de su coste estimado se ejecutan en la Neural Engine, con un tiempo de CPU ocupada del 1,5 % del tiempo total durante la ejecución del encoder. La similitud coseno del encoder frente a la referencia float32 se sitúa entre 0,99973 y 0,99987 en ventanas de 15 s sobre 4 clips, con un error RMS normalizado de 0,017 a 0,023.

## Capacidades

- Reconocimiento automático del habla en inglés (ASR) sobre audio de 16 kHz.
- Transcripción en local en dispositivos con silicio de Apple, sin envío de audio a servidores externos.
- Procesamiento de audio en ventanas de 15 s, con funciones alternativas de 10,16 s y 5,04 s en el encoder.
- Ejecución del encoder en la Apple Neural Engine mediante Core ML.
- Integración en aplicaciones Swift mediante FluidAudio 0.18.0 (`AsrModels.loadLocal`).
- Ejemplo funcional en Swift (`example/`) para transcribir ficheros WAV desde línea de comandos.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada distinto de voz ni modo de pensamiento.

## Casos de uso

- Transcripción local de reuniones y notas de voz en macOS: la aplicación puede cargar los modelos con `AsrModels.loadLocal` y transcribir audio de hasta 15 s por ventana, manteniendo el audio en el dispositivo y evitando el envío a servicios en la nube.
- Subtitulado de vídeo en aplicaciones de iOS y macOS: el modelo procesa audio en segmentos de 15 s con una latencia de 64,9 ms para un clip de 10 s y 135,5 ms para uno de 30 s, adecuada para generar subtítulos casi en tiempo real en local.
- Dictado por voz en editores de texto nativos: la velocidad de 163x tiempo real sobre 4.875,5 s de audio permite transcribir dictados largos en segundos, con la ventaja de que el modelo es pequeño (379,6 MB) y cabe en el almacenamiento de un Mac o un iPad.
- Búsqueda y indexación de archivos de audio: transcripción por lotes de grabaciones para alimentar índices de búsqueda de texto, aprovechando el procesamiento por lotes y la ejecución en la Neural Engine sin coste de API.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de Apple, ejecutándose en el propio dispositivo y sin depender de conectividad.
- Investigación y evaluación de ASR en entornos Apple: el paquete incluye un programa Swift de ejemplo y métricas de WER frente a la referencia, útil para comparar el comportamiento de la Neural Engine frente a PyTorch float32 en el mismo conjunto de clips.

## Benchmarks y rendimiento

El autor publica tasas de error de palabra (WER, %) frente a la referencia `reference_transformers.py` en PyTorch float32, usando el normalizador de texto de Whisper para inglés:

| Conjunto | Clips | Referencia | Este modelo | Diferencia | Mismo texto que la referencia |
|---|--:|--:|--:|--:|--:|
| LibriSpeech test-clean | 200 | 1,917 | 1,940 | +0,023 | 196 de 200 |
| LibriSpeech test-other | 200 | 4,853 | 4,769 | −0,085 | 193 de 200 |
| FLEURS English test | 100 | 5,733 | 5,733 | 0,000 | 93 de 100 |
| Clips largos, 52 a 118 s | 12 | 2,385 | 3,143 | +0,757 | 1 de 12 |

Mediciones de velocidad en un Mac con Apple M5 (macOS 27.2) y FluidAudio 0.18.0, con el encoder en `.cpuAndNeuralEngine`:

| Métrica | Este modelo | Phonon-2 |
|---|--:|--:|
| 512 clips (4.875,5 s de audio), mediana de 3 | 29,99 s (163x tiempo real) | 29,77 s |
| Clip de 10 s, mediana de 15 | 64,9 ms | 63,7 ms |
| Clip de 30 s, mediana de 15 | 135,5 ms | 137,0 ms |
| Primera carga en dispositivo | 52,4 s | 52,6 s |
| Cargas posteriores | 0,17 s | 0,17 s |

Con `AsrModels.load` (que usa también las funciones de 5 s y 10 s del encoder), el autor reporta +0,135 (test-clean), −0,085 (test-other), +0,043 (FLEURS) y +0,644 (clips largos) sobre los mismos clips.

## Requisitos de hardware

- Dispositivo con silicio de Apple (probado en Mac con Apple M5, macOS 27.2); requiere macOS 15 o posterior y Swift 6 (Xcode o herramientas de línea de comandos).
- Almacenamiento: 379,6 MB para los cuatro artefactos Core ML más el vocabulario.
- VRAM: no aplica; el modelo usa memoria unificada del sistema y la Neural Engine. No se publican cifras de memoria en uso.
- GPU recomendadas: no aplica; el encoder se ejecuta en la Neural Engine. FluidAudio con la versión `.phonon25` ejecuta el modelo en GPU, mientras que `.phonon2` permite la ruta con Neural Engine.
- Cabe en hardware de consumo Apple (Mac con M5 probado); no se documentan pruebas en iPhone ni iPad.
- Despliegue: Core ML con FluidAudio 0.18.0; el paquete incluye un programa Swift de ejemplo (`example/`) para transcribir ficheros WAV.
- Latencia y throughput: 163x tiempo real en lote de 512 clips; 64,9 ms para 10 s y 135,5 ms para 30 s; primera carga de 52,4 s por compilación y caché de macOS, cargas posteriores de 0,17 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phonon-2.5-English-CoreML (este) | no disponible (base ~0,6B) | ventanas de hasta 15 s | CC-BY-4.0 | HuggingFace, Core ML | Encoder en Neural Engine; WER 1,940 en test-clean |
| Phonon-2 (FluidInference/phonon-2-coreml) | no disponible | no disponible | no disponible | HuggingFace | Referencia de velocidad del autor; 63,7 ms en clip de 10 s |
| FermionResearch/Phonon-2.5-English | no disponible (base ~0,6B) | clip completo en la referencia | CC-BY-4.0 (según este derivado) | HuggingFace | Modelo base en PyTorch float32; WER de referencia 1,917 en test-clean |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6B | no disponible | no disponible | HuggingFace | Modelo original del que deriva la familia Phonon |

## Limitaciones y advertencias

- El rendimiento en audio largo es inferior al de la referencia: +0,757 puntos de WER en clips de 52 a 118 s, atribuido a la transcripción por ventanas de 15 s de FluidAudio frente al procesamiento del clip completo. En 2 de los 12 clips largos las últimas palabras difieren de la referencia, aunque no se trunca contenido (99 a 101 % del recuento de palabras de la referencia).
- Solo soporta inglés; no se documentan otros idiomas.
- No es un release oficial de Fermion Research y no está afiliado ni respaldado por Apple, NVIDIA o FluidInference.
- Solo se ha probado en Mac con Apple M5 y macOS 27.2; iPhone, iPad y otros dispositivos no están probados según la model card.
- La primera carga tarda 52,4 s debido a la compilación de los modelos para la Neural Engine y la caché de macOS; las cargas posteriores son de 0,17 s.
- Para usar la Neural Engine hay que cargar con la versión `.phonon2`, no `.phonon25` (esta última ejecuta en GPU); `AsrModels.load` espera una carpeta llamada `phonon-2` junto a la carpeta indicada y descarga Phonon-2 si falta, por lo que conviene usar `loadLocal`.
- La licencia CC-BY-4.0 permite uso comercial con atribución; deben conservarse los ficheros `LICENSE-WEIGHTS-CC-BY-4.0.txt` y `NOTICE` del release original.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento con acentos o ruido distintos de los conjuntos evaluados (LibriSpeech, FLEURS).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mashbox-labs/Phonon-2.5-English-CoreML
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Librería FluidAudio: https://github.com/FluidInference/FluidAudio
- Referencia de velocidad Phonon-2 Core ML: https://huggingface.co/FluidInference/phonon-2-coreml
