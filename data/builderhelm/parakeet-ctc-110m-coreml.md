# BuilderHelm/Parakeet-CTC-110M-CoreML

## Resumen

Parakeet-CTC-110M-CoreML es la conversion a CoreML de la rama CTC del modelo hibrido Parakeet-TDT-CTC-110M de NVIDIA, desarrollada por BuilderHelm. El modelo conserva el encoder FastConformer compartido y la cabeza CTC, pero elimina el decodificador TDT, lo que permite ejecutar reconocimiento de voz en el Neural Engine de Apple Silicon con un tamano total de 118 MB. Resuelve el problema de la transcripcion on-device en macOS e iOS sin dependencias de red ni de GPU dedicadas.

La relevancia actual radica en su eficiencia: segun las mediciones del autor en un Apple M5, alcanza un RTFx de 1.071x en clips cortos y 998x en audio largo, con una latencia mediana de 11,2 ms por clip corto y un pico de memoria de 208 MB. Ademas de la transcripcion greedy, expone log-probabilidades cada 80 ms, lo que habilita keyword spotting, vocabulario personalizado y alineacion temporal.

El modelo es monoidioma (ingles), esta licenciado bajo CC BY 4.0 y se distribuye como paquete CoreML (.mlpackage) junto con vocabulario y utilidades Swift. Su tamano reducido y su ejecucion en la Neural Engine lo hacen adecuado para aplicaciones de escritorio y moviles con requisitos estrictos de privacidad y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + cabeza CTC; derivado de un hibrido TDT-CTC |
| Parametros totales | 110 M (modelo base NVIDIA Parakeet-TDT-CTC-110M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio largo mediante politica de ventanas configurable) |
| Tipos de cuantizacion | int8 para el encoder en Neural Engine; float32 para el preprocesado de audio en CPU |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML (.mlpackage); incluye vocab.json y config.json |

## Arquitectura y entrenamiento

El modelo es la mitad CTC del hibrido Parakeet-TDT-CTC-110M de NVIDIA. La arquitectura consta de un preprocesador que convierte audio en espectrograma log-mel (float32, CPU, 5,7 MB), un encoder FastConformer con cabeza CTC (int8, Neural Engine, 112,7 MB), un vocabulario de 1.024 tokens y un config.json que define ventanas, politica de audio largo y contratos de entrada/salida. El decodificador TDT del modelo original se ha eliminado; para transcripcion con TDT existe una variante separada del mismo autor.

El entrenamiento subyacente corresponde al modelo de NVIDIA, que segun los metadatos de la model card utilizo LibriSpeech, Fisher Corpus, Common Voice 8.0, National Singapore Corpus Part 1, VCTK, VoxPopuli, Europarl y Multilingual LibriSpeech. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). La innovacion tecnica principal de esta conversion es la ejecucion del encoder en int8 sobre la Neural Engine con preprocesado float32 en CPU, junto con una politica de ventanas para audio largo que permite mantener un rendimiento cercano al tiempo real.

## Capacidades

- Reconocimiento automatico de voz en ingles mediante decodificacion CTC greedy en una sola pasada.
- Emision de log-probabilidades cada 80 ms, utiles para keyword spotting, vocabulario personalizado y alineacion temporal.
- Procesamiento de audio largo mediante politica de ventanas configurable en config.json.
- Ejecucion on-device en Apple Silicon (Neural Engine) sin conexion de red.
- Integracion con macOS 15+ e iOS 18+ a traves de la libreria BuilderHelmAudio.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio generativo; es exclusivamente ASR.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Transcripcion de reuniones en macOS: la politica de audio largo y el RTFx de 998x permiten procesar grabaciones de decenas de minutos en segundos, manteniendo la privacidad al no salir el audio del dispositivo.
- Subtitulado en tiempo real de contenido en ingles: la latencia mediana de 11,2 ms por clip corto y el procesamiento en Neural Engine hacen viable la generacion de subtitulos con retardo minimo.
- Keyword spotting en aplicaciones de escritorio: las log-probabilidades cada 80 ms permiten detectar palabras clave o comandos de voz sin transcribir todo el audio, con una recall del 89,8% en Earnings22 segun el autor.
- Vocabulario personalizado y alineacion: los log-probabilidades y el vocabulario de 1.024 tokens permiten sesgar la decodificacion hacia terminos tecnicos o nombres propios y obtener marcas temporales.
- Aplicaciones iOS de dictado: con iOS 18+ y BuilderHelmAudio, el modelo cabe en 118 MB y puede ejecutarse en un iPhone 13 (probado por el autor) sin consumo de red.
- Preprocesado de pipelines de voz en local: integrable en herramientas de analisis de llamadas o audios de atencion al cliente en ingles, con un pico de memoria de 208 MB en clips cortos.
- Busqueda por voz en archivos de audio: la velocidad de 1.071x en clips cortos permite indexar grandes volumenes de audio en un Mac de forma interactiva.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| LibriSpeech clean (test) | WER (CTC) | 2,95% |
| LibriSpeech other (test) | WER (CTC) | 5,88% |
| Earnings22 contextual subset (772 clips) | WER (CTC) | 17,62% |
| Earnings22 | Keyword recall (1 falsa alarma por clip) | 89,8% |
| Common Voice (clips cortos) | WER | 8,25% |
| Audio largo | WER | 2,63% |
| Clips cortos | RTFx | 1.071x tiempo real |
| Audio largo | RTFx | 998x tiempo real |
| Clips cortos | Latencia mediana / p95 | 11,2 / 25,3 ms |
| Clips cortos / audio largo | Memoria pico | 208 / 109 MB |

Comparativa del autor frente a FluidInference/parakeet-ctc-110m-coreml en el mismo Mac (x tiempo real · WER):

| Carga | Este modelo | FluidInference | FluidInference, CPU mel |
|---|---:|---:|---:|
| Clips cortos (262 Common Voice) | 1.071x · 8,25% | 96x · 94,86% | 96x · 27,90% |
| Audio largo (20 archivos, 79 min) | 998x · 2,63% | 123x · 96,93% | 129x · 19,43% |
| Audio largo reservado (18 archivos, 27 min) | 1.023x · 6,70% | 125x · 95,93% | 126x · 31,89% |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Apple Silicon con un pico de memoria de 208 MB (clips cortos) y 109 MB (audio largo).
- GPU recomendadas: no requiere GPU dedicada; utiliza la Neural Engine de Apple Silicon (probado en M5 e iPhone 13).
- Cabe en cualquier dispositivo Apple Silicon con macOS 15+ o iOS 18+; el paquete pesa 118 MB.
- Opciones de despliegue: CoreML nativo, libreria BuilderHelmAudio (Swift 6, Xcode 16+), descarga via huggingface_hub CLI.
- Latencia y throughput: mediana de 11,2 ms y p95 de 25,3 ms por clip corto; RTFx de 1.071x en clips cortos y 998x en audio largo (mediciones del autor en M5 con macOS 27.2).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech clean | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet-CTC-110M-CoreML (este) | 110 M | no disponible | 2,95% | CC BY 4.0 | CoreML |
| FluidInference/parakeet-ctc-110m-coreml | 110 M | no disponible | no disponible (WER 27,90% en Common Voice con CPU mel) | no disponible | CoreML |
| BuilderHelm/Parakeet-TDT-CTC-110M-CoreML | 110 M | no disponible | no disponible | CC BY 4.0 | CoreML |
| nvidia/parakeet-tdt_ctc-110m (base) | 110 M | no disponible | no disponible | no disponible | safetensors / NeMo |

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para otros idiomas sin un modelo distinto.
- El WER en dominios acusticamente dificiles es elevado: 17,62% en Earnings22, frente a 2,95% en LibriSpeech clean.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente.
- La comparativa con FluidInference muestra un comportamiento anomalo de este ultimo en el entorno del autor (texto vacio en 149 de 262 clips); los numeros deben interpretarse con cautela.
- Requiere hardware Apple Silicon y versiones minimas de sistema (macOS 15+, iOS 18+); no es portable a otras plataformas.
- La decodificacion CTC greedy es menos precisa que la TDT del modelo original; para maxima calidad puede preferirse la variante con decodificador TDT.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base de NVIDIA.
- Riesgo de errores en nombres propios y terminos tecnicos fuera del vocabulario de 1.024 tokens; mitigable con vocabulario personalizado.

## Enlaces

- Hugging Face: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-CoreML
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Variante con TDT: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML
- Comparativa FluidInference: https://huggingface.co/FluidInference/parakeet-ctc-110m-coreml
- Repositorio GitHub BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Perfil del autor: https://huggingface.co/BuilderHelm
- Web del producto ZenVoice: https://getzenvoice.com
- Descarga ZenVoice para Mac: https://getzenvoice.com/download
