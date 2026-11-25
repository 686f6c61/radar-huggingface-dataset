# omnixima/bengaliai-whisper-medium-coreml

## Resumen

Bengali Whisper Medium para Core ML es una conversión del fine-tune de Whisper Medium que bengaliAI publicó para reconocimiento automático de voz en bengalí (código de idioma `bn`). El modelo original, `bengaliAI/tugstugi_bengaliai-asr_whisper-medium`, se ha convertido al formato Core ML para poder ejecutarse con WhisperKit sobre el Apple Neural Engine (ANE) en dispositivos Apple, incluidos iPhone. La conversión la firma el usuario omnixima y se distribuye con licencia Apache-2.0.

El objetivo es claro: permitir dictado en bengalí completamente offline y en el propio dispositivo. En iOS, una app en segundo plano no puede usar la GPU, de modo que un teclado de dictado debe apoyarse en el Neural Engine; de ahí la elección de Core ML y de WhisperKit. El modelo se empaqueta con pesos paletizados a 6 bits (k-means por tensor), lo que reduce el tamaño del repositorio a unos 557 MB frente a los 1,4 GB de la conversión FP16, sin pérdida medible de precisión según el autor.

Se trata de un modelo especializado, no de un modelo generalista: hereda la arquitectura Whisper Medium (transformer encoder-decoder) del fine-tune de bengaliAI y solo soporta bengalí. Su relevancia actual reside en el despliegue on-device de ASR en ecosistema Apple y en la demostración de que la cuantización por paletas a 6 bits mantiene la calidad del FP16 en esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium), convertido a Core ML |
| Parametros totales | no disponible (Whisper Medium, aproximadamente 769 M en el modelo original; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | Pesos paletizados a 6 bits (k-means, por tensor); existe tambien conversion FP16 (1,4 GB) y 8-bit segun la tabla del autor |
| Idiomas soportados | Bengalí (`bn`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc` compilados; fuentes `.mlpackage` conservadas) |

## Arquitectura y entrenamiento

El modelo es una conversión del fine-tune de Whisper Medium de bengaliAI, que a su vez parte de la arquitectura Whisper de OpenAI: un transformer encoder-decoder con espectrograma mel como entrada y decodificación autorregresiva de tokens de texto. La conversión se realizó con `whisperkittools`, manteniendo los `.mlpackage` fuente, y los pesos del encoder y del decoder se paletizaron a 6 bits mediante `coremltools.optimize.coreml.palettize_weights` (k-means, por tensor, objetivo iOS 17) antes de compilarse con `xcrun coremlcompiler`.

Un detalle técnico relevante es que el `tokenizer.json` incluido añade los tokens de marca de tiempo de Whisper, ausentes en el tokenizer original del fine-tune; WhisperKit los necesita para decodificar, por lo que deben mantenerse junto al modelo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune original; esos datos corresponden a la model card del modelo base, no incluida en la información disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) en bengalí, con salida de transcripción en texto.
- Ejecución on-device sobre el Apple Neural Engine mediante Core ML y WhisperKit.
- Decodificación greedy con idioma fijado a `bn`, sin marcas de tiempo (configuración usada en las evaluaciones del autor).
- Soporte de prefill prompt y opciones de decodificación de WhisperKit (temperatura, `withoutTimestamps`, `skipSpecialTokens`, etc.).
- Funcionamiento offline: no requiere conexión de red ni servicios en la nube.
- No soporta tool calling, agentes, visión, audio más allá de la transcripción ni razonamiento multi-paso.

## Casos de uso

- Dictado por teclado en iOS: el modelo se ejecuta en el Neural Engine desde un teclado en segundo plano, escenario para el que fue creado (app Kothon); en un iPhone 16 Pro Max transcribe 2,1 s de habla en 1,1 s una vez cargado.
- Transcripción offline de notas de voz en bengalí: útil en dispositivos sin conectividad o con requisitos de privacidad, ya que todo el procesamiento ocurre en el dispositivo.
- Subtitulado y transcripción de reuniones en bengalí en macOS con Apple Silicon: en un M2 Max el autor reporta 2,8 s por clip de FLEURS (factor de tiempo real 0,19).
- Aplicaciones de accesibilidad para hablantes de bengalí: conversión de voz a texto en tiempo casi real en el propio terminal.
- Investigación en ASR de bajos recursos: punto de partida para evaluar fine-tunes de Whisper en bengalí y comparar variantes de cuantización (FP16, 8-bit, 6-bit).
- Integración en apps macOS/iOS con WhisperKit: el snippet de la model card muestra descarga del modelo y configuración de cómputo (`cpuAndNeuralEngine` para encoder y decoder, `cpuOnly` para mel y prefill).

## Benchmarks y rendimiento

Datos publicados por el autor (idioma fijado a `bn`, decodificación greedy, sin marcas de tiempo):

| Modelo | FLEURS bn, 200 clips: WER / CER | Grabaciones propias, 3 clips: WER / CER |
|---|---|---|
| Core ML FP16 | 8,2% / 4,9% | 2,3% / 1,3% |
| Core ML 8-bit | 8,1% / 4,8% | 2,3% / 1,3% |
| Core ML 6-bit (este repo) | 8,1% / 4,8% | 2,3% / 1,3% |

El autor indica que el modelo de 6 bits no pierde precisión medible frente a FP16 y 8-bit. En velocidad: 1,1 s para 2,1 s de habla en iPhone 16 Pro Max (Neural Engine, desde teclado en segundo plano); primera carga en dispositivo de unos 1,5 minutos por compilación de Core ML para el ANE, con cargas posteriores de aproximadamente un segundo; 2,8 s por clip de FLEURS en M2 Max en caliente (factor de tiempo real 0,19). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser aplicables a un modelo ASR.

## Requisitos de hardware

- Almacenamiento: unos 557 MB para el modelo de 6 bits; la conversión FP16 ocupa 1,4 GB. La primera compilación para el ANE requiere espacio libre adicional para la caché.
- VRAM: no aplica en el sentido habitual; el modelo está pensado para el Neural Engine de Apple. No se dispone de cifras de memoria unificada consumida.
- GPU recomendadas: no aplica; el destino es el ANE de chips Apple (A-series y M-series). El autor reporta ejecución en iPhone 16 Pro Max y en M2 Max.
- ¿Cabe en GPU de consumo? No es el objetivo del formato; para GPUs NVIDIA/AMD habría que usar otras conversiones (por ejemplo, la versión GGUF del mismo autor).
- Despliegue: WhisperKit (librería `whisperkit`), con Core ML; para otras plataformas, la versión GGUF del mismo modelo.
- Latencia y throughput: 1,1 s para 2,1 s de audio en iPhone 16 Pro Max; 2,8 s por clip FLEURS en M2 Max (RTF 0,19); primera carga ~1,5 min en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| omnixima/bengaliai-whisper-medium-coreml | no disponible (Whisper Medium) | ventana de audio de 30 s (Whisper) | bn | Apache-2.0 | Core ML |
| bengaliAI/tugstugi_bengaliai-asr_whisper-medium (base) | no disponible (Whisper Medium) | ventana de audio de 30 s (Whisper) | bn | Apache-2.0 | safetensors / transformers |
| omnixima/bengaliai-whisper-medium-gguf | no disponible (Whisper Medium) | ventana de audio de 30 s (Whisper) | bn | Apache-2.0 | GGUF |
| Whisper Medium original (OpenAI) | ~769 M (cifra habitual del modelo, no confirmada aquí) | ventana de audio de 30 s | multilingüe | MIT (según OpenAI; no confirmado en la información disponible) | varios |

La comparativa se limita a variantes del mismo fine-tune, ya que no se dispone de datos de otros modelos ASR en bengalí en la información proporcionada. La diferencia principal entre ellas es el formato y el destino de ejecución (ANE frente a GPU/CPU), no la calidad, que el autor reporta equivalente entre FP16, 8-bit y 6-bit.

## Limitaciones y advertencias

- Modelo monolingüe: solo bengalí (`bn`); no transcribe otros idiomas.
- Especializado en ASR: no genera texto libre, no razona, no ejecuta código ni soporta tool calling.
- Riesgo de alucinación en transcripciones: como todo modelo Whisper, puede producir texto plausible en segmentos con ruido, silencio o audio de baja calidad.
- Las métricas de WER/CER publicadas se basan en 200 clips de FLEURS y solo 3 grabaciones propias; la muestra propia es muy reducida y debe tomarse con cautela.
- La primera carga en dispositivo tarda alrededor de 1,5 minutos por la compilación de Core ML; requiere espacio libre para la caché.
- Dependencia del ecosistema Apple: el formato Core ML y WhisperKit limitan su uso a dispositivos Apple; para otras plataformas hay que acudir a la versión GGUF.
- Licencia Apache-2.0, que permite uso comercial; deben respetarse las condiciones de atribución y las licencias del modelo base y de Whisper.
- No se dispone de información sobre sesgos específicos del fine-tune ni sobre la composición del dataset de entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omnixima/bengaliai-whisper-medium-coreml
- Modelo base: https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium
- Versión GGUF del mismo modelo: https://huggingface.co/omnixima/bengaliai-whisper-medium-gguf
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- App Kothon: https://github.com/Omnixima/kothon
- Perfil del autor: https://huggingface.co/bengaliAI
