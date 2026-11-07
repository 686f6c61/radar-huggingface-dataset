# hencohen83/3dspeaker-eres2netv2-qnn-sm8750

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una compilación del extractor de embeddings de hablante ERes2NetV2 del proyecto 3D-Speaker de Alibaba, empaquetado como binarios de contexto QNN para la NPU Hexagon v79 del Snapdragon 8 Elite (SM8750). El modelo original (zh-cn, 16 kHz, dominio "common") se distribuye también como `model.onnx` sin modificar para su uso con el extractor de CPU de sherpa-onnx. La utilidad del artefacto es permitir la extracción de huellas de voz de 192 dimensiones en la NPU de un móvil, en lugar de en la CPU.

El autor (hencohen83) no entrena ni modifica los pesos: solo fija las formas de entrada (batch 1 y longitudes de 150, 300 y 600 frames), simplifica el grafo con onnxsim y lo compila con QAIRT 2.40.0.251030 mediante `qnn-onnx-converter` y `qnn-context-binary-generator`. La precisión declarada frente al modelo de formas fijas en CPU es de coseno 0,99996 o superior en los tres grafos, medida sobre un Galaxy S25.

Es relevante para desarrolladores que despliegan verificación de hablante o diarización en dispositivos Android con Snapdragon 8 Elite, ya que evita el coste de ejecutar el extractor en CPU y se integra con sherpa-onnx mediante un parche específico. El repositorio ocupa 0,2 GB y la licencia es Apache-2.0, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ERes2NetV2 (extractor de embeddings de hablante de 3D-Speaker, red convolucional con módulos de agregación de múltiples escalas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio fija por grafo: 150, 300 y 600 frames (1,5, 3 y 6 s) |
| Tipos de cuantización | activaciones de 16 bits, bias de 32 bits, float (sin calibración) en los binarios QNN; ONNX en float32 |
| Idiomas soportados | no disponible (el modelo original es zh-cn; los embeddings de hablante son en principio independientes del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | binarios de contexto QNN (`t150.bin`, `t300.bin`, `t600.bin`) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es ERes2NetV2, el extractor de embeddings de hablante del proyecto 3D-Speaker de Alibaba, entrenado por el equipo de 3D-Speaker y publicado con licencia Apache-2.0. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de ajuste fino con RLHF o DPO; estos datos deben consultarse en el repositorio original de 3D-Speaker y en su configuración `egs/voxceleb/sv-eres2netv2/conf/eres2netv2.yaml`.

La innovación de este repositorio es puramente de despliegue. Se fijan las formas de entrada a batch 1 y a tres longitudes (150, 300 y 600 frames), se simplifica el grafo con onnxsim y se compila a binarios QNN con QAIRT 2.40.0.251030. La media de las características se resta dentro del grafo, igual que hace sherpa-onnx con los modelos de 3D-Speaker. La entrada de los grafos NPU es `x` en float32 con forma [1, 80, T] (80 bins mel en primer eje, por lo que hay que transponer desde [T, 80]); los valores corresponden a fbank Kaldi de 80 dimensiones, tramas de 25 ms cada 10 ms, audio de 16 kHz en rango de 16 bits y sin dither. La salida es `embedding` en float32 con forma [1, 192]. Para audios más largos que 6 s se usan ventanas del mayor grafo que quepa, repartidas uniformemente, normalizando L2 cada huella, promediando y normalizando L2 el promedio; para audios menores de 1,5 s se repiten las tramas hasta 150.

## Capacidades

- Extracción de embeddings de hablante (huellas de voz) de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante mediante comparación por similitud coseno entre embeddings.
- Identificación de hablante y base para tareas de diarización, al permitir comparar huellas entre segmentos.
- Ejecución en la NPU Hexagon v79 del Snapdragon 8 Elite (SM8750) mediante binarios de contexto QNN.
- Ejecución alternativa en CPU mediante el `model.onnx` compatible con el extractor de sherpa-onnx.
- Manejo de audios de distinta duración: repetición de tramas para audios cortos y ventaneo con promediado de embeddings para audios largos.
- Integración con sherpa-onnx a través del parche `scripts/npu/sherpa-onnx-v2.0.1-qnn.patch`, configurando `SpeakerEmbeddingExtractorConfig.qnnConfig.contextBinary = "t150.bin,t300.bin,t600.bin"`.

## Casos de uso

- Verificación biométrica de voz en aplicaciones Android: el extractor genera la huella del usuario en la NPU del Snapdragon 8 Elite y la compara por coseno con la huella registrada, reduciendo el consumo de CPU y batería en el desbloqueo o la autenticación.
- Diarización de reuniones y transcripciones: combinado con un motor ASR como sherpa-onnx, los embeddings permiten segmentar una grabación por hablante y etiquetar cada intervención, usando el ventaneo de 6 s para cubrir audios largos.
- Control de acceso por voz en dispositivos empotrados: el modelo cabe en un móvil de gama alta con Snapdragon 8 Elite, lo que permite autenticación local sin enviar audio a la nube y con latencia de inferencia en NPU.
- Indexación y búsqueda de archivos de audio: se extraen huellas de cada segmento y se almacenan en una base vectorial para recuperar fragmentos por hablante, con la ventaja de que los embeddings de 192 dimensiones son compactos.
- Detección de locutor en centros de llamadas: se procesan grabaciones por ventanas de 1,5 a 6 s y se agrupan por similitud coseno para verificar que el agente es quien dice ser o para separar cliente y agente en cada llamada.
- Aplicaciones de accesibilidad y personalización: identificación del hablante para adaptar la respuesta de un asistente de voz o para transcribir reuniones atribuyendo cada frase a su interlocutor.
- Preprocesado en pipelines de ASR con sherpa-onnx: el parche permite sustituir el extractor de CPU por el de NPU sin cambiar el resto del pipeline, manteniendo la misma interfaz de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como EER en VoxCeleb) en la información disponible. El único dato de rendimiento declarado es la fidelidad frente al modelo de formas fijas en CPU: coseno de 0,99996 o superior en los tres grafos, medido en un Galaxy S25 con tres líneas de una clase en hebreo por grafo. No se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- NPU Hexagon v79 del Snapdragon 8 Elite (SM8750); los binarios de contexto están ligados al chip y a la versión de QAIRT.
- Runtime QNN 2.40.0.251030: `libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so` y `libQnnSystem.so`, publicados por sherpa-onnx como `qnn-libs-2.40.0.251030`, con `ADSP_LIBRARY_PATH` apuntando a su carpeta. Estas librerías son de Qualcomm y no se incluyen en el repositorio.
- Alternativa en CPU con `model.onnx` (71,4 MB) mediante el extractor de sherpa-onnx, sin requisitos de VRAM relevantes; el modelo es lo bastante pequeño para ejecutarse en CPU de móvil o de escritorio.
- No se dispone de datos de latencia ni de throughput en la información proporcionada.
- Opciones de despliegue: sherpa-onnx con el parche QNN para NPU, o sherpa-onnx estándar con el ONNX para CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Entrada | Plataforma | Licencia |
|---|---|---|---|---|---|
| Este repositorio (ERes2NetV2 QNN SM8750) | Extractor de hablante compilado | 192 dim | 150/300/600 frames, 80 bins mel | NPU Hexagon v79 (SM8750) y CPU vía ONNX | Apache-2.0 |
| 3D-Speaker ERes2NetV2 original (sherpa-onnx) | Extractor de hablante | 192 dim | formas dinámicas | CPU | Apache-2.0 |
| `hencohen83/ivrit-whisper-large-v3-qnn-sm8750` | ASR (Whisper large-v3) compilado | no aplica | audio 16 kHz | NPU Hexagon v79 (SM8750) | Apache-2.0 |

La comparación con otros extractores de hablante de 3D-Speaker (por ejemplo, CAM++ o ECAPA-TDNN) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los binarios QNN están ligados al chip SM8750 (Hexagon v79) y a la versión QAIRT 2.40.0.251030; no funcionarán en otras NPU ni con otras versiones del runtime.
- Las librerías de Qualcomm necesarias no se incluyen en el repositorio y deben obtenerse por separado.
- El modelo original está etiquetado como zh-cn; no hay datos sobre su comportamiento en otros idiomas, aunque los embeddings de hablante suelen ser razonablemente independientes del idioma.
- La entrada debe ser fbank Kaldi de 80 dimensiones con parámetros exactos (25 ms, 10 ms, 16 kHz, sin dither); un preprocesado distinto degradará la calidad de las huellas.
- La forma de entrada en los grafos NPU es [1, 80, T], por lo que es necesario transponer desde [T, 80].
- Para audios largos, el promediado de embeddings normalizados es una aproximación; no se documenta su impacto en la precisión de verificación.
- No se publican métricas de EER ni evaluaciones en conjuntos estándar, por lo que no se puede comparar su precisión con otros extractores sin evaluarlo uno mismo.
- Riesgo de suplantación de voz: los sistemas de verificación basados en embeddings son vulnerables a ataques de replay y a voz sintética; en producción conviene combinarlos con detección de vivacidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo subyacente es de Alibaba y conviene revisar los términos del proyecto 3D-Speaker.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hencohen83/3dspeaker-eres2netv2-qnn-sm8750
- Proyecto 3D-Speaker: https://github.com/modelscope/3D-Speaker
- Configuración ERes2NetV2 en 3D-Speaker: https://github.com/modelscope/3D-Speaker/blob/main/egs/voxceleb/sv-eres2netv2/conf/eres2netv2.yaml
- Modelo ONNX original en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- Proyecto Transcriptor con el parche sherpa-onnx QNN: https://github.com/chencohensolutions/transcriptor-kmp
- Repositorio relacionado de Whisper en la misma NPU: https://huggingface.co/hencohen83/ivrit-whisper-large-v3-qnn-sm8750
