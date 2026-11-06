# Selbyggen/nb-whisper-large-distil-turbo-coreml

## Resumen

Selbyggen/nb-whisper-large-distil-turbo-coreml es una conversion de formato del modelo de reconocimiento automatico del habla NbAiLab/nb-whisper-large-distil-turbo-beta, desarrollado por la Biblioteca Nacional de Noruega (NbAiLab), a Core ML para su uso con WhisperKit en dispositivos Apple. No se trata de un modelo nuevo: los pesos y el comportamiento son los del modelo original, y el trabajo del autor de esta ficha consiste en la conversion a Core ML y la compresion de pesos para que quepa en un iPhone. El paquete resultante ocupa aproximadamente 640 MB, frente a los 1,4 GB de la conversion completa en float16 y a los 3 GB del NB-Whisper large completo.

El modelo resuelve el problema de la transcripcion local de noruego en dispositivos con recursos limitados (iPhone, iPad, Mac) sin depender de servicios en la nube. Esta pensado para la aplicacion Sagt (macOS, iOS e iPadOS), que lo utiliza en equipos donde el NB-Whisper large completo no cabe. La arquitectura subyacente es Whisper con un decoder destilado de solo 2 capas (de ahi "distil turbo"), lo que reduce drasticamente el coste de decodificacion frente al large original.

Es relevante ahora porque demuestra un flujo practico de despliegue de ASR de calidad en el Neural Engine de Apple mediante paletizacion de 4 bits del encoder de audio, una tecnica que mantiene la fidelidad respecto al modelo original con una huella de memoria muy reducida. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) con decoder destilado de 2 capas, convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (estandar en Whisper) |
| Tipos de cuantizacion | AudioEncoder: paletizacion de 4 bits con descomposicion de outliers (>3 desviaciones tipicas en float16); TextDecoder: float16; MelSpectrogram: float16 |
| Idiomas soportados | noruego (no, nb, nn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete WhisperKit); el modelo original esta en safetensors |
| Tamano del paquete | ~640 MB (variante completa float16: 1,4 GB) |
| Tokenizer | el mismo que openai/whisper-large-v3 |
| Modelo base | NbAiLab/nb-whisper-large-distil-turbo-beta |

## Arquitectura y entrenamiento

El modelo original es un Whisper large con un decoder destilado de 2 capas, una variante "distil turbo" que reduce el coste de decodificacion manteniendo el encoder de audio de Whisper large. La conversion a Core ML separa el modelo en tres componentes: AudioEncoder, TextDecoder y MelSpectrogram. El encoder se comprime mediante paletizacion de 4 bits con descomposicion de outliers (los valores mas alla de 3 desviaciones tipicas se conservan en float16), el mismo metodo que Argmax emplea para openai_whisper-large-v3-v20240930_626MB. El decoder y el espectrograma de Mel se mantienen en float16 sin comprimir.

La conversion se realizo con whisperkittools (whisperkit-generate-model) y coremltools 8.3.0. Existe una variante `_640MB_v2` en la que solo se reconvierte el TextDecoder (torch 2.5.0, transformers 4.53, coremltools 9.0, float16) para que emita `alignment_heads_weights` y permita timestamps a nivel de palabra; el encoder y el espectrograma son identicos byte a byte a los del paquete original. Los `alignment_heads` de la variante v2 son `[[1, 14], [0, 11], [1, 18]]` (capa, cabeza), seleccionados comparando los tiempos de WhisperKit (DTW sobre la atencion cruzada promediada) con NB-Whisper large en ventanas de 30 segundos de dos grabaciones noruegas. No se dispone de informacion sobre el dataset de entrenamiento del modelo original en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego, en sus variantes bokmal (nb), nynorsk (nn) y noruego generico (no).
- Transcripcion de audio en ventanas de 30 segundos, con soporte de segmentos y, en la variante v2, timestamps a nivel de palabra.
- Ejecucion local en dispositivos Apple (iPhone, iPad, Mac) mediante Core ML y el Neural Engine.
- Compatibilidad con el tokenizer de openai/whisper-large-v3.
- No soporta vision, audio generativo, tool calling ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- Capacidades multilingues limitadas al noruego; no se documenta soporte de otros idiomas.

## Casos de uso

- Transcripcion de reuniones en local: la model card reporta la transcripcion de una reunion noruega de 9 minutos en 18 segundos con WhisperKit 1.1.1 en un Mac M3 Max, lo que lo hace adecuado para actas y notas de reunion sin enviar audio a la nube.
- Aplicaciones moviles de dictado y notas de voz: con 640 MB cabe en un iPhone y permite transcripcion offline en la aplicacion Sagt y en apps similares para iOS e iPadOS.
- Subtitulado de contenido audiovisual noruego: la variante v2 genera timestamps a nivel de palabra con un error mediano de 0,04 s y aproximadamente el 90 % de las palabras dentro de 0,5 s en la grabacion de validacion, suficiente para subtitulos sincronizados.
- Archivado y busqueda de material oral: la Biblioteca Nacional de Noruega puede emplear variantes de este modelo para transcribir grabaciones y hacerlas buscables, y esta version permite procesarlas en equipos de sobremesa Apple sin GPU dedicada.
- Asistentes de voz con privacidad por diseno: al ejecutarse en el Neural Engine local, el audio no sale del dispositivo, lo que encaja en entornos sanitarios, legales o administrativos con requisitos de confidencialidad.
- Prototipado rapido en macOS: desarrolladores que integran WhisperKit pueden descargar el paquete con `WhisperKit.download` y validar flujos de ASR noruego en minutos, sin gestionar conversiones Core ML propias.

## Benchmarks y rendimiento

La model card incluye una comparativa sobre una grabacion de reunion noruega de 9 minutos, transcrita con WhisperKit 1.1.1 en un Mac M3 Max. El WER se mide contra la salida de NB-Whisper large, por lo que refleja el acuerdo con ese modelo, no la precision frente a una referencia humana.

| Modelo | Tamano | Tiempo | WER vs NB-Whisper large |
|---|---|---|---|
| NB-Whisper large (float16) | 2,9 GB | 139 s | 0 (referencia) |
| NB-Whisper Large Distil Turbo (float16) | 1,4 GB | 24 s | 0,330 |
| Este modelo (640 MB) | 640 MB | 18 s | 0,339 |
| OpenAI large-v3 turbo, v20240930_626MB | 598 MB | 36 s | 0,573 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- Huella de almacenamiento y memoria: unos 640 MB para el paquete Core ML; la primera carga tarda varios minutos mientras Core ML compila el modelo para el Neural Engine, y las cargas posteriores son rapidas.
- Dispositivos objetivo: iPhone, iPad y Mac con Apple Silicon; el Neural Engine acelera la inferencia.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato Core ML esta pensado para Apple Silicon, no para CUDA.
- Despliegue: WhisperKit (biblioteca Swift) con descarga via `WhisperKit.download`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete Core ML.
- Latencia y throughput: 18 s para 9 minutos de audio en un M3 Max con WhisperKit 1.1.1; la variante v2 con timestamps a nivel de palabra es aproximadamente un 10-15 % mas lenta por la alineacion.

## Comparativa con modelos similares

| Modelo | Tamano | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Selbyggen/nb-whisper-large-distil-turbo-coreml) | 640 MB | Core ML / WhisperKit | Noruego | Apache 2.0 | WER 0,339 vs NB-Whisper large; 18 s en M3 Max |
| NbAiLab/nb-whisper-large-distil-turbo-beta | 1,4 GB (float16) | safetensors | Noruego | Apache 2.0 | Modelo base; WER 0,330; 24 s |
| Selbyggen/nb-whisper-large-coreml | 3 GB | Core ML / WhisperKit | Noruego | Apache 2.0 | NB-Whisper large completo; referencia de calidad, mas lento (139 s) |
| OpenAI large-v3 turbo (v20240930_626MB) | 598 MB | Core ML / WhisperKit | Multilingue | MIT (modelo original Whisper) | WER 0,573 vs NB-Whisper large en noruego; 36 s |

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: los pesos y el comportamiento son de NbAiLab, que marca el modelo original como beta, liberado para pruebas.
- En la carpeta `_640MB`, `config.json` y `generation_config.json` se copian sin cambios del original y listan los `alignment_heads` de large-v3, que no existen en el decoder de 2 capas; por tanto, no hay timestamps a nivel de palabra. Los timestamps de segmento si funcionan. Para timestamps por palabra hay que usar la variante `_640MB_v2`.
- El WER reportado se mide contra NB-Whisper large, no contra una referencia humana, por lo que no debe interpretarse como precision absoluta.
- Solo soporta noruego; no es adecuado para otros idiomas.
- Riesgo de alucinacion inherente a los modelos Whisper en audio con ruido, silencios largos o habla solapada; no se documenta mitigacion especifica.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al estar entrenado por NbAiLab sobre corpus noruego, puede reflejar sesgos de ese corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la salida generada es producida por NB-Whisper y conviene citar al autor original.
- Dependencia de la plataforma: el paquete Core ML solo se ejecuta en el ecosistema Apple (WhisperKit); no es portable a CUDA ni a otros runtimes sin reconversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/nb-whisper-large-distil-turbo-coreml
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large-distil-turbo-beta
- NB-Whisper large en Core ML (3 GB): https://huggingface.co/Selbyggen/nb-whisper-large-coreml
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- NbAiLab: https://huggingface.co/NbAiLab
