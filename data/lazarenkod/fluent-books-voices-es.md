# lazarenkod/fluent-books-voices-es

## Resumen

`fluent-books-voices-es` es una colección de diez modelos de síntesis de voz (text-to-speech) en castellano, publicados por Dmitry Lazarenko (usuario `lazarenkod`) para la aplicación móvil Fluent Books. Cada archivo ONNX contiene una única voz con los pesos ya "horneados" en el modelo: la entrada es una secuencia de identificadores de fonemas del vocabulario de Kokoro más un parámetro de velocidad, y la salida es una forma de onda a 24 kHz junto con las duraciones por token (`waveform [1,S]`, `durations [1,T]`, con `S = 600 * sum(durations)`).

Los modelos son estudiantes destilados a partir de las voces españolas de Kokoro-82M (`ef_dora`, `em_alex`, `em_santa`), con un estudiante por voz. Se entrenaron sobre una mezcla de fonemas castellanos y latinoamericanos, de modo que el dialecto resultante depende de los fonemas de entrada: theta y ll para castellano, seseo y yeísmo para latinoamericano. Existen dos recetas: A (8,57 MB) y L60 (12,52 MB, 60 armónicos, solo voces masculinas), con sufijo `ph3` o `ph10` según el peso del crítico de fase en la última etapa de entrenamiento.

La relevancia práctica es la inferencia en el propio dispositivo: el repositorio completo ocupa 0,1 GB, los modelos individuales caben en 8,57 o 12,52 MB y se ejecutan con ONNX Runtime en el procesador del teléfono, sin enviar audio a ningún servidor. Es una alternativa ligera y de licencia Apache-2.0 para lectura en voz alta de libros en español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal destilada de Kokoro-82M; entrada de fonemas (vocabulario de 114 símbolos) y salida de forma de onda a 24 kHz con duraciones por token |
| Parametros totales | no disponible (pesos cuantizados int8 de 8,57 MB o 12,52 MB por voz) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (todos los archivos publicados llevan el sufijo `_int8`) |
| Idiomas soportados | español (`es`), con fonemas castellanos y latinoamericanos |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), int8 |

## Arquitectura y entrenamiento

Cada archivo es un modelo TTS de destilación por voz: un estudiante entrenado para reproducir la salida de una voz concreta de Kokoro-82M (`ef_dora`, `em_alex` o `em_santa`). La interfaz es explícita y minimalista: `input_ids` es `[0] + ids + [0]` en int64 con forma `[1,N]`, donde `ids` son identificadores de fonemas del vocabulario de Kokoro (`vocab.json`, 114 símbolos), y `speed` es un float32 de forma `[1]` con valor por defecto `[1.0]`. La salida incluye la forma de onda a 24 kHz y las duraciones por token, lo que permite sincronizar texto y audio.

Los datos de entrenamiento son voz sintetizada por las tres voces docentes de Kokoro-82M junto con frases de libros de dominio público; la model card menciona este punto como abierto ("Data of the teacher"), sin detallar el volumen total de horas ni la composición exacta del corpus. Hay dos recetas: A, de 8,57 MB, y L60, de 12,52 MB con 60 armónicos y solo para voces masculinas. El sufijo `ph3` o `ph10` indica el peso del crítico de fase en la última etapa. La model card señala que las métricas no distinguen ambos pesos y recomienda elegir "por oído". La fonemización se realiza con las reglas de `es_g2p_rules.py` del repositorio de Fluent Books, que imitan la salida de espeak-ng para `es` (el mismo esquema con el que se entrenó Kokoro); la app incluye un port en Swift (`SpanishPhonemizer`).

## Capacidades

- Síntesis de voz en español a partir de fonemas, con salida de forma de onda a 24 kHz y duraciones por token para alineación temporal.
- Diez voces preentrenadas: tres identidades (`ef_dora`, `em_alex`, `em_santa`) por dos recetas (A y L60, esta última solo masculinas) y dos pesos de crítico de fase (`ph3`, `ph10`).
- Control de dialecto mediante los fonemas de entrada: theta y ll para castellano; seseo y yeísmo para latinoamericano.
- Control de velocidad mediante el tensor `speed`.
- Inferencia en dispositivo con ONNX Runtime, sin dependencia de red.
- Integración pensada para lectura de libros en voz alta (frases largas, texto de dominio público).
- No incluye tool calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura en voz alta de libros en una app móvil: el modelo convierte texto fonemizado en audio a 24 kHz en el propio procesador del teléfono, con archivos de 8,57 o 12,52 MB que caben en el paquete de la aplicación y no requieren conexión.
- Audiolibros con sincronización texto-audio: la salida `durations [1,T]` permite resaltar la palabra o el fonema que se está reproduciendo, útil para lectores con dislexia o para aprendizaje de idiomas.
- Aplicaciones de accesibilidad sin conexión: personas con discapacidad visual pueden escuchar texto en castellano o en variante latinoamericana sin enviar contenido a la nube, lo que reduce exposición de datos.
- Aprendizaje de español como lengua extranjera: el control de dialecto por fonemas permite generar la misma frase en pronunciación castellana (theta, ll) o latinoamericana (seseo, yeísmo) para practicar contraste.
- Prototipado rápido de asistentes de voz en español: al ser ONNX int8 y Apache-2.0, se puede integrar en apps de escritorio o móviles con `onnxruntime` sin licencias adicionales ni GPU.
- Pruebas de regresión de pipelines TTS: los diez archivos con hash SHA-256 publicado permiten fijar versiones de voz en tests automatizados y comparar WER y similitud de voz entre recetas.
- Generación de audio para contenido editorial de bajo coste: narración de textos de dominio público en lote con una voz fija y control de velocidad.

## Benchmarks y rendimiento

Datos de la model card, medidos sobre 60 frases reservadas con Whisper large-v3 (`es`) y con el detector `tools/distill/artifact_card31.py` (referencia: grabaciones del docente de la misma voz). UTMOS se compara con el docente entre paréntesis.

| Modelo | Archivo | MB | UTMOS (docente) | WER % | Similitud de voz |
|---|---|---|---|---|---|
| ef_dora A w10 | `es_ef_dora_A_ph10_int8.onnx` | 8,57 | 3,37 (3,67) | 2,1 | 0,973 |
| ef_dora A w3 | `es_ef_dora_A_ph3_int8.onnx` | 8,57 | 3,36 (3,67) | 1,9 | 0,976 |
| em_alex A w10 | `es_em_alex_A_ph10_int8.onnx` | 8,57 | 3,08 (3,41) | 2,1 | 0,968 |
| em_alex A w3 | `es_em_alex_A_ph3_int8.onnx` | 8,57 | 3,13 (3,41) | 2,0 | 0,970 |
| em_santa A w10 | `es_em_santa_A_ph10_int8.onnx` | 8,57 | 2,47 (2,89) | 2,1 | 0,975 |
| em_santa A w3 | `es_em_santa_A_ph3_int8.onnx` | 8,57 | 2,54 (2,89) | 2,1 | 0,976 |
| em_alex L w10 | `es_em_alex_L_ph10_int8.onnx` | 12,52 | 3,09 (3,41) | 2,0 | 0,973 |
| em_alex L w3 | `es_em_alex_L_ph3_int8.onnx` | 12,52 | 3,13 (3,41) | 2,0 | 0,975 |
| em_santa L w10 | `es_em_santa_L_ph10_int8.onnx` | 12,52 | 2,56 (2,90) | 2,0 | 0,977 |
| em_santa L w3 | `es_em_santa_L_ph3_int8.onnx` | 12,52 | 2,65 (2,90) | 1,8 | 0,978 |

El WER del docente está entre 1,8 % y 2,4 %. Una segunda comprobación previa a la publicación (20 frases por modelo, 10 por dialecto, fonemas del port en Swift a través de `onnxruntime`) dio 3,0-3,9 % de WER, del cual 3,0 % corresponde a tres artefactos de referencia (`Vd.`, `mas`, un nombre) y a una alucinación de Whisper al final de un clip. Todos los modelos presentan cero violaciones de contrato. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU móvil); en GPU, el modelo int8 de 8,57 o 12,52 MB ocupa del orden de decenas de MB con buffers de activación, muy por debajo de 1 GB.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime; no requiere A100, H100 ni RTX 4090. Una GTX 1650 o incluso una iGPU es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e integrada; el caso de uso principal es CPU de teléfono.
- Opciones de despliegue: ONNX Runtime (objetivo principal, con port en Swift en la app), `onnxruntime` en Python, y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `lazarenkod/fluent-books-voices-es` | no disponible (8,57-12,52 MB int8 por voz) | salida 24 kHz; contexto no disponible | Apache-2.0 | ONNX int8 | 10 voces destiladas, dialecto por fonemas, inferencia en dispositivo |
| Kokoro-82M (voces `ef_dora`, `em_alex`, `em_santa`) | 82 M | salida 24 kHz | Apache-2.0 (según la model card del proyecto Kokoro) | safetensors / ONNX | Modelo docente; mayor tamaño y mayor calidad UTMOS de referencia (2,89-3,67) |
| `lazarenkod/fluent-books-pronounce` | no disponible | no aplica (CTC sobre fonemas) | no disponible | ONNX | Complementario: evalúa pronunciación, no sintetiza voz |

La comparación con otros TTS en español de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El dialecto no se selecciona con un parámetro explícito: depende de los fonemas de entrada, por lo que un fonemizador incorrecto produce una pronunciación mezclada.
- La model card advierte que los umbrales del detector de artefactos son los de voces inglesas; `em_santa` tiene un docente débil (UTMOS 2,89, métrica entrenada en inglés), de modo que sus sigmas pequeñas no implican mejor calidad.
- Las métricas no distinguen `ph3` de `ph10`; la elección entre ambos es subjetiva ("por oído").
- Riesgo de alucinación de Whisper en la evaluación (un caso detectado al final de un clip) y artefactos de referencia en el conjunto de test (`Vd.`, `mas`, un nombre) que inflan el WER medido.
- La procedencia de los datos del docente se declara como punto abierto: los estudiantes se entrenaron con voz sintetizada por Kokoro-82M y frases de libros de dominio público, sin detalle completo del corpus.
- Solo se publican pesos int8; no hay versiones fp16/fp32 ni GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-07) es posterior a la de esta ficha: conviene verificar la vigencia antes de depender de él en producción.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni auditoría de sesgos por dialecto, género o edad.
- No apto para clonación de voz arbitraria: las voces están fijas en los pesos y no se acepta un embedding de hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/fluent-books-voices-es
- Perfil del autor: https://huggingface.co/lazarenkod
- Modelo complementario de pronunciación: https://huggingface.co/lazarenkod/fluent-books-pronounce
- Datasets del autor: https://huggingface.co/lazarenkod/datasets
