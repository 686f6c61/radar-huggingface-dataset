# prakharkhatri/IndiCodec-Lite

## Resumen

IndiCodec-Lite es un códec de voz neuronal (speech codec) destilado del modelo IndiCodec v1.0, desarrollado por prakharkhatri. Convierte audio de voz en dos flujos de tokens discretos —uno de contenido a 25 Hz y otro acústico a 50 Hz— y los reconstruye de vuelta a audio a 24 kHz, todo ello con un bitrate de 1,09 kbps. Su función principal es servir como tokenizador de voz para modelos de lenguaje de habla (speech LMs) y sistemas de texto-a-voz, manteniendo el mismo espacio de tokens que IndiCodec v1.0.

El modelo resuelve el problema del coste computacional de los códecs neuronales de alta calidad: reduce el tamaño de 624 M a 57,8 M de parámetros (11 veces menos), lo que permite ejecutarlo en CPU y en dispositivos móviles sin GPU. Se distribuye en formato PyTorch (safetensors, fp32) y ONNX (INT8 de 75 MB y fp32 de 233 MB), e incluye soporte nativo para once idiomas: inglés y diez lenguas de la India (hindi, bengalí, guyaratí, kannada, malabar, maratí, oriya, panyabí, tamil y telugu).

Es relevante ahora porque los pipelines de speech LMs y TTS multilingües necesitan tokenizadores ligeros y de alta fidelidad que puedan desplegarse en entornos con recursos limitados. IndiCodec-Lite conserva la ventaja de IndiCodec en retención de palabras frente a Mimi, SNAC y NeuCodec a bitrates similares, y lo hace con licencia Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal con dos flujos: encoder de contenido Conformer 6×384 (inicializado desde w2v-BERT 2.0), encoder acústico CNN y decoder transformer 8×384 con cabeza ISTFT; cuantización FSQ |
| Parametros totales | 57.830.774 (encoder de contenido 21,8 M; encoder acústico 14,8 M; decoder 21,2 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto; procesa ventanas de audio) |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX) e INT8 (ONNX) |
| Idiomas soportados | Inglés, hindi, bengalí, guyaratí, kannada, malabar, maratí, oriya, panyabí, tamil, telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, PyTorch); ONNX (INT8 75 MB y fp32 233 MB) |

## Arquitectura y entrenamiento

IndiCodec-Lite es un códec de voz con dos flujos de tokens complementarios. El flujo de contenido opera a 25 Hz con una rejilla FSQ de 8 dimensiones × 3 niveles (6.561 identificadores, 317 bps) y se genera mediante un encoder Conformer de 6 capas y 384 dimensiones inicializado desde w2v-BERT 2.0. El flujo acústico opera a 50 Hz con una rejilla FSQ de 6 dimensiones × 6 niveles (46.656 identificadores, 775 bps) y lo produce un encoder CNN. La reconstrucción la realiza un decoder transformer de 8 capas y 384 dimensiones con cabeza ISTFT que sintetiza audio a 24 kHz. El bitrate total es de 1,09 kbps.

Las tres redes se destilaron de IndiCodec v1.0 contra sus cuantizadores congelados: el encoder de contenido se entrenó para reproducir los identificadores de contenido de IndiCodec con ruido añadido a la entrada; el encoder acústico para reproducir sus características acústicas; y el decoder para reconstruir el audio a partir de los mismos identificadores. Los datos de entrenamiento incluyen Emilia-YODAS (parte inglesa), LibriTTS, LibriTTS-R y VCTK para inglés, y Rasa, IndicVoices-R e IndicVoices de AI4Bharat para las lenguas indias, con MUSAN y RIRS_NOISES para aumento de ruido. Todas las fuentes son CC BY 4.0 excepto RIRS_NOISES (Apache 2.0). No se especifica en la información disponible el número total de tokens de audio ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Codificación y decodificación de voz extremo a extremo (audio-a-audio) con entrada a 16 kHz y salida a 24 kHz; cualquier frecuencia de muestreo de entrada se remuestrea automáticamente.
- Generación de tokens de contenido a 25 Hz y tokens acústicos a 50 Hz, compatibles con el espacio de tokens de IndiCodec v1.0.
- Funcionamiento sin GPU: inferencia en CPU con PyTorch o con ONNX Runtime (solo numpy + onnxruntime, sin PyTorch).
- Ejecución en ARM (teléfonos, Apple silicon): los ficheros INT8 corren a 0,064× tiempo real en 4 hilos de CPU.
- Soporte multilingüe para inglés y diez lenguas de la India, con buen rendimiento en retención de palabras en todas ellas.
- Integración como tokenizador para speech LMs y sistemas TTS: un modelo entrenado con tokens de IndiCodec decodifica con IndiCodec-Lite y viceversa.
- No se menciona soporte de tool calling, function calling, agentes ni modos de razonamiento (no es un modelo de lenguaje, sino un códec).

## Casos de uso

- Tokenización para speech LMs multilingües: el modelo convierte audio en secuencias discretas de 75 tokens por segundo, un régimen manejable para transformers de lenguaje; su compatibilidad con IndiCodec v1.0 permite reutilizar corpus ya tokenizados.
- TTS ligero en dispositivos móviles: con 75 MB en INT8 y ejecución a 0,064× tiempo real en 4 hilos ARM, puede integrarse en aplicaciones de síntesis de voz en teléfonos sin acceso a GPU.
- Compresión de voz para transmisión de baja tasa: a 1,09 kbps, es adecuado para comunicaciones con ancho de banda muy limitado, conservando inteligibilidad (ESTOI de 0,640 en FLEURS para diez lenguas indias).
- Preprocesamiento de corpus de voz para entrenamiento: el encoder genera tokens de contenido y acústicos que pueden usarse como etiquetas para modelos de habla, con la ventaja de que el mismo corpus puede codificarse con IndiCodec o con IndiCodec-Lite.
- Sistemas de atención al cliente por voz en lenguas indias: la cobertura de diez idiomas y la baja tasa de error de caracteres (6,9 % de CER en FLEURS) lo hacen apto para pipelines de ASR y diálogo en esos mercados.
- Investigación en modelos de habla en entornos sin GPU: el soporte ONNX Runtime sin PyTorch permite reproducir experimentos en portátiles y estaciones de trabajo modestas.
- Archivado y transmisión de voz en inglés: con un WER de 2,4 % en CMU-Arctic y 3,1 % en Seed-TTS eval, la reconstrucción preserva el contenido léxico con fidelidad alta para un códec de ~1 kbps.

## Benchmarks y rendimiento

PESQ-WB (mayor es mejor):

| Conjunto de prueba | IndiCodec-Lite 1,09 kbps | IndiCodec v1.0 1,09 kbps | Mimi, 8 codebooks 1,10 kbps | SNAC 24 kHz 0,98 kbps | NeuCodec 0,80 kbps |
|---|---|---|---|---|---|
| LibriTTS-R test (inglés) | 2,35 | 2,41 | 2,32 | 2,29 | 2,19 |
| CMU-Arctic (inglés) | 2,27 | 2,30 | 2,28 | 2,17 | 2,06 |
| Seed-TTS eval (inglés) | 1,97 | 1,99 | 2,07 | 1,82 | 1,81 |
| FLEURS, 10 lenguas indias | 1,87 | 1,90 | 1,84 | 1,69 | 1,69 |

Inteligibilidad y similitud de voz (mayor es mejor):

| Métrica | IndiCodec-Lite | IndiCodec v1.0 | Mimi | SNAC | NeuCodec |
|---|---|---|---|---|---|
| ESTOI, CMU-Arctic (inglés) | 0,850 | 0,855 | 0,848 | 0,835 | 0,824 |
| ESTOI, Seed-TTS eval (inglés) | 0,782 | 0,786 | 0,794 | 0,762 | 0,758 |
| ESTOI, FLEURS, 10 lenguas indias | 0,640 | 0,640 | 0,613 | 0,595 | 0,591 |
| Similitud de hablante, Seed-TTS eval (inglés) | 0,961 | 0,964 | 0,964 | 0,946 | 0,957 |

Palabras tras ida y vuelta (menor es mejor):

| Métrica | IndiCodec-Lite | IndiCodec v1.0 | Mimi | SNAC | NeuCodec |
|---|---|---|---|---|---|
| WER inglés, Seed-TTS eval | 3,1 % | 2,5 % | 3,6 % | 4,9 % | 3,5 % |
| WER inglés, CMU-Arctic | 2,4 % | 2,3 % | 3,2 % | 3,8 % | 2,8 % |
| CER lenguas indias, FLEURS, 10 lenguas | 6,9 % | 6,3 % | 14,3 % | 13,3 % | 8,9 % |
| Tokens por segundo | 75 | 75 | 100 | 82 | 50 |

El WER en inglés se mide con Whisper large-v3 y el CER en lenguas indias con IndicConformer 600M ASR. La similitud de hablante es el coseno entre vectores x de WavLM-base-plus-sv de cada decodificación y su original. Las filas de IndiCodec-Lite corresponden a los pesos fp32; los ficheros INT8 en ARM quedan a menos de 0,004 PESQ de ellos.

## Requisitos de hardware

- VRAM estimada: el modelo es muy pequeño; en fp32 ocupa unos 232 MB de pesos y en INT8 unos 75 MB, por lo que la VRAM necesaria para inferencia es mínima (no se especifica un mínimo exacto en la información disponible).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo está pensado para ejecutarse en CPU y en ARM. En GPU se recomienda usar los pesos PyTorch o `onnxruntime-gpu` con `CUDAExecutionProvider` y `precision="fp32"`.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y también en CPU sin GPU.
- En ARM (teléfonos, Apple silicon) los ficheros INT8 corren a 0,064× tiempo real en 4 hilos de CPU.
- Opciones de despliegue: PyTorch (GPU o CPU), ONNX Runtime (CPU, sin PyTorch) y onnxruntime-gpu. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un códec de audio.
- Latencia y throughput: se reporta 0,064× tiempo real en ARM con INT8 y 4 hilos; no se proporcionan cifras de throughput para GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Bitrate | Tokens/s | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IndiCodec-Lite | 57,8 M | 1,09 kbps | 75 | No aplica | Apache 2.0 | Hugging Face (safetensors, ONNX) |
| IndiCodec v1.0 | 624 M | 1,09 kbps | 75 | No aplica | No disponible en la información | Hugging Face |
| Mimi | No disponible | 1,10 kbps (8 codebooks) | 100 | No aplica | No disponible en la información | No disponible en la información |
| SNAC 24 kHz | No disponible | 0,98 kbps | 82 | No aplica | No disponible en la información | No disponible en la información |
| NeuCodec | No disponible | 0,80 kbps | 50 | No aplica | No disponible en la información | No disponible en la información |

IndiCodec-Lite es la variante ligera de IndiCodec v1.0: once veces menos parámetros con una pérdida de calidad moderada (PESQ 2,35 frente a 2,41 en LibriTTS-R; CER 6,9 % frente a 6,3 % en FLEURS). Frente a Mimi, SNAC y NeuCodec, mantiene mejor retención de palabras en lenguas indias y compite en inglés, con la ventaja de su tamaño reducido y su licencia Apache 2.0.

## Limitaciones y advertencias

- Los identificadores generados por los encoders de IndiCodec-Lite no son idénticos a los de IndiCodec v1.0: solo alrededor de un tercio de las tramas coinciden exactamente y el resto son valores vecinos. Para entrenar un modelo, hay que codificar todo el corpus con uno de los dos códecs, no mezclarlos.
- En CPU x86, la opción `precision="auto"` selecciona los ficheros fp32 porque los kernels INT8 de onnxruntime pueden saturarse en CPUs sin VNNI y alterar los identificadores. Es un riesgo a controlar en despliegues x86.
- El modelo está orientado a voz; no se documentan capacidades para música, audio ambiental u otras señales.
- La cobertura lingüística se limita a inglés y diez lenguas de la India; no se garantiza un rendimiento adecuado en otras lenguas.
- No se dispone de información sobre sesgos demográficos, acentos o variedades dialectales más allá de los conjuntos de evaluación citados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la reconstrucción puede introducir artefactos o pérdida de contenido en condiciones de ruido no vistas; el WER/CER reportado cuantifica parte de este riesgo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los datos de entrenamiento subyacentes (mayoritariamente CC BY 4.0 y Apache 2.0 para RIRS_NOISES) si se redistribuyen derivados.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria aún muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/prakharkhatri/IndiCodec-Lite
- Modelo base IndiCodec: https://huggingface.co/prakharkhatri/IndiCodec
- Repositorio NeuCodec (dependencia de instalación): https://github.com/neuphonic/neucodec
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Dataset LibriTTS: https://huggingface.co/datasets/mythicinfinity/libritts
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
- Dataset VCTK: https://huggingface.co/datasets/CSTR-Edinburgh/vctk
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
