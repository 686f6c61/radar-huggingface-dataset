# SIXlabdesign/cctype-seaco-paraformer-zh

## Resumen

SeACo-Paraformer (Core ML) es una conversión al formato Core ML del modelo de reconocimiento automático de voz SeACo-Paraformer desarrollado por Tongyi Lab dentro del proyecto FunASR. Se trata de un reconocedor de mandarín no autorregresivo que transcribe literalmente lo que oye, admite mezcla de inglés dentro del habla china y permite el uso de hotwords para mejorar la precisión en nombres propios y terminología específica. La conversión la firma Sixlab para integrarlo en cctype, una aplicación nativa de dictado para macOS.

El modelo original es un transformer de 50 capas en el codificador con decodificación no autorregresiva basada en CIF (Continuous Integrate-and-Fire) y un decodificador con sesgo SeACo para hotwords. Esta versión Core ML mantiene los pesos en cuantización de 8 bits (lineal simétrica) con cómputo en FP32, ocupa unos 235 MB y está dividida en tres paquetes: `Encoder.mlpackage`, `Decoder.mlpackage` y `HotwordEncoder.mlpackage`. La ventana de entrada está limitada a 3000 frames de características (aproximadamente 3 minutos de audio), por lo que audios más largos deben segmentarse.

Su relevancia reside en que permite ejecutar un reconocedor de mandarín de calidad en hardware Apple sin dependencias de Python ni de frameworks de inferencia pesados, con verificación de paridad exacta frente a la inferencia oficial de FunASR. Es una pieza de infraestructura para aplicaciones de dictado en macOS más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (Paraformer) con CIF y decodificador con sesgo SeACo; codificador de 50 capas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 3000 frames de características (aprox. 3 minutos de audio); audios más largos requieren segmentación |
| Tipos de cuantización | pesos en 8 bits (lineal simétrica), cómputo en FP32; FP16 provoca desbordamiento en el codificador de 50 capas |
| Idiomas soportados | chino (mandarín) e inglés (mezcla dentro del habla china) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`); artefactos auxiliares `tokens.json`, `seg_dict`, `am.mvn` |
| Tamaño del repositorio | 0,2 GB (aprox. 235 MB de pesos) |
| Entrada de características | Kaldi fbank, 80 bins, LFR 7/6, CMVN (calculadas fuera del modelo) |
| Salida | IDs de token; la puntuación la aporta el modelo complementario `cctype-ct-punc-zh` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Paraformer: un codificador transformer de 50 capas que procesa características acústicas y un mecanismo CIF (Continuous Integrate-and-Fire) con umbral 1.0 y cola 0.45 que genera los pesos de integración para producir los embeddings acústicos. El decodificador es no autorregresivo e incorpora el sesgo SeACo, que permite condicionar la salida con hotwords mediante un codificador de hotwords basado en LSTM. La regla de fusión de FunASR se mantiene dentro del decodificador. La última entrada de la lista de hotwords debe ser siempre `[1]` (`<s>`, "sin hotword"); con solo esa entrada el resultado equivale a la decodificación sin hotwords.

La extracción de características (fbank de Kaldi, 80 bins, LFR 7/6, CMVN), el CIF y el postprocesado de texto se ejecutan fuera de los modelos Core ML; en cctype se implementan en Swift dentro de `CCTypeCore`. La conversión se verificó contra la inferencia oficial de FunASR con resultados de texto idénticos en los clips de referencia, con y sin hotwords. Los scripts de conversión (`convert.py`, `quantize.py`, `verify.py`, `package.py`) están en `Tools/paraformer` del repositorio de cctype. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático de voz en mandarín con transcripción literal ("escribe lo que oye").
- Manejo de habla mixta chino-inglés dentro de la misma locución.
- Soporte de hotwords para mejorar la precisión en nombres propios y terminología específica mediante el sesgo SeACo.
- Decodificación no autorregresiva, lo que reduce la latencia frente a modelos autorregresivos.
- Procesamiento de audio de hasta aproximadamente 3 minutos por llamada (3000 frames de características).
- Entrada de longitud variable sin padding: las máscaras de atención se derivan de las formas de entrada.
- Ejecución nativa en macOS mediante Core ML, sin dependencias de Python.
- Puntuación disponible a través del modelo complementario `cctype-ct-punc-zh` (no incluida en este repositorio).
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Casos de uso

- Dictado nativo en macOS: integración en aplicaciones de escritorio que necesiten transcripción en tiempo real o por lotes sin salir del ecosistema Apple, aprovechando la ejecución Core ML con `MLComputeUnits.cpuOnly`.
- Transcripción de reuniones y notas de voz en mandarín: segmentando el audio en fragmentos de hasta 3 minutos, el modelo produce transcripciones literales con soporte de términos específicos mediante hotwords.
- Subtitulado de contenido audiovisual en chino: la decodificación no autorregresiva y la ventana de 3 minutos permiten procesar clips cortos con baja latencia; la puntuación se añade con el modelo complementario.
- Reconocimiento de nombres propios y jerga técnica: el sesgo SeACo permite inyectar listas de hotwords (nombres de personas, productos, acrónimos) para reducir errores en dominios especializados.
- Aplicaciones de accesibilidad: dictado por voz en mandarín para usuarios con movilidad reducida en macOS, con despliegue local y sin envío de audio a servicios en la nube.
- Procesamiento por lotes en pipelines locales: al ser un paquete Core ML de ~235 MB, puede empaquetarse dentro de aplicaciones macOS para transcripción offline de archivos de audio cortos.
- Investigación y evaluación de ASR en hardware Apple: sirve como referencia para comparar la paridad de conversiones Core ML frente a la inferencia PyTorch original de FunASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una verificación de paridad: texto idéntico frente a la inferencia oficial de FunASR en los clips de referencia, con y sin hotwords.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 235 MB de pesos en 8 bits; el consumo en tiempo de ejecución no está especificado, pero al ser Core ML y ejecutarse con `MLComputeUnits.cpuOnly` el modelo reside en memoria unificada del sistema Apple.
- GPU recomendadas: no aplica en el sentido tradicional; el autor recomienda explícitamente `MLComputeUnits.cpuOnly` porque las longitudes de entrada varían en cada llamada y la GPU recompila para cada nueva forma.
- Compatibilidad con GPU de consumo: el modelo está pensado para Apple Silicon y macOS; no se distribuye en formatos para CUDA (GGUF, safetensors) en este repositorio.
- Opciones de despliegue: Core ML en macOS; los scripts de conversión permiten regenerar los paquetes desde el modelo original de FunASR. No se proporcionan integraciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación no autorregresiva y el límite de 3000 frames sugieren latencias bajas para clips cortos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto de audio | Formato | Licencia |
|---|---|---|---|---|---|
| SeACo-Paraformer (Core ML, este) | Paraformer no autorregresivo + SeACo, 50 capas | zh, en (mezcla) | ~3 min (3000 frames) | Core ML | Apache 2.0 |
| SeACo-Paraformer original (FunASR) | Paraformer no autorregresivo + SeACo | zh, en (mezcla) | no disponible en la información | PyTorch | Apache 2.0 |
| Whisper (variantes) | Transformer encoder-decoder autorregresivo | multilingüe | 30 s por ventana | múltiples (incl. Core ML) | MIT |
| `cctype-ct-punc-zh` | Modelo de puntuación complementario | zh | no aplica | Core ML | no disponible en la información |

La comparación con Whisper es orientativa: Whisper es autorregresivo y multilingüe amplio, mientras que este modelo es no autorregresivo y está especializado en mandarín con mezcla de inglés. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Ventana máxima de aproximadamente 3 minutos por llamada; audios más largos deben segmentarse manualmente.
- FP16 provoca desbordamiento en el codificador de 50 capas; la cuantización de pesos a 8 bits con cómputo FP32 es la única configuración validada.
- En GPU, Core ML recompila para cada nueva forma de entrada, lo que degrada el rendimiento; se recomienda `MLComputeUnits.cpuOnly`.
- El modelo está especializado en mandarín; el inglés solo se soporta como mezcla dentro del habla china, no como idioma principal.
- La puntuación no está incluida: requiere el modelo complementario `cctype-ct-punc-zh`.
- Riesgo de errores en nombres propios y terminología fuera de la lista de hotwords; el sesgo SeACo mitiga pero no elimina este problema.
- No se han publicado evaluaciones de sesgo, robustez ante ruido o acentos regionales en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor original es Tongyi Lab / FunASR; este repositorio solo realiza la conversión de formato.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: SIXlabdesign/cctype-seaco-paraformer-zh](https://huggingface.co/SIXlabdesign/cctype-seaco-paraformer-zh)
- [Modelo original en ModelScope: iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch](https://modelscope.cn/models/iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch)
- [Modelo complementario de puntuación: cctype-ct-punc-zh](https://huggingface.co/SIXlabdesign/cctype-ct-punc-zh)
- Repositorio de cctype (scripts de conversión en `Tools/paraformer`): no disponible en la información proporcionada.
