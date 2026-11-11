# audeolabs/kea-b-0.1-coreml

## Resumen

Kea-B 0.1 para Core ML es la conversión del modelo de reconocimiento automático del habla Kea-B 0.1 (desarrollado por audeolabs) al formato Core ML, pensada para ejecutarse de forma nativa en equipos Mac. El modelo original deriva de nvidia/parakeet-tdt-0.6b-v2 y emplea una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer). La conversión mantiene los mismos pesos que el modelo base, pero reorganiza el grafo para que el codificador se ejecute en el Neural Engine o en la CPU de Apple y el decodificador se exponga como arrays en FP32 para su uso desde código nativo.

El artefacto publicado incluye únicamente pesos y metadatos: un codificador compilado en Core ML, los ficheros del frontend (constantes de extracción de características), las redes de predicción y conjunta del decodificador en FP32 y el vocabulario. No incluye código de inferencia, por lo que el usuario debe aportar la lógica que calcula las características acústicas, invoca el codificador y ejecuta el decodificador TDT, además del troceado de audio en ventanas de 15 segundos.

Es relevante porque demuestra una vía práctica para llevar un ASR de tipo transducer a hardware Apple sin GPU dedicada, con un tamaño de repositorio de 0,2 GB y un codificador de unos 138 MB. El modelo está orientado exclusivamente al inglés y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | no disponible (el modelo base se denomina parakeet-tdt-0.6b-v2, sin cifra exacta publicada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el codificador procesa ventanas de 15 segundos de audio a 16 kHz |
| Tipos de cuantizacion | binaria / 1-bit (tag del repositorio); decodificador en FP32 |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlmodelc` compilado) para el codificador; arrays binarios FP32 (`frontend.f32bin`, `decoder_joint.f32bin`) y JSON para el resto |

## Arquitectura y entrenamiento

El modelo sigue la familia de transducers TDT: un codificador FastConformer que transforma las características acústicas en representaciones latentes, una red de predicción que modela el historial de tokens y una red conjunta que combina ambas para emitir, en cada paso, un token y una duración. Esta formulación TDT permite saltos de tiempo variables en la decodificación, lo que reduce el número de pasos frente a un transducer convencional. La conversión a Core ML se realizó con coremltools 9.0 a partir de `compat/export.safetensors` del repositorio base `audeolabs/kea-b-0.1`, cuyo SHA-256 se documenta en la model card.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El modelo base es una modificación de nvidia/parakeet-tdt-0.6b-v2, y la model card remite a `NOTICE` para consultar los cambios, los datos de entrenamiento y las herramientas con sus licencias. La innovación técnica destacable de esta publicación es la partición del grafo: el codificador se compila para el Neural Engine o la CPU de Apple, mientras que el decodificador se entrega como arrays planos para evitar dependencias del runtime de Core ML en esa fase.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio de 16 kHz.
- Decodificación TDT con emisión conjunta de token y duración.
- Ejecución del codificador en el Neural Engine o en la CPU de macOS 26 o posterior.
- Procesamiento de audio troceado en ventanas de 15 segundos mediante lógica externa.
- Integración nativa en aplicaciones macOS mediante Core ML.
- No se documentan capacidades de traducción, diarización, timestamps por palabra, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción local en macOS: el codificador compilado se ejecuta en el Neural Engine de un Mac, lo que permite transcribir audio sin enviar datos a la nube y sin GPU dedicada.
- Subtitulado de reuniones y notas de voz: la ventana de 15 segundos encaja con el troceado habitual de grabaciones largas, y el decodificador TDT reduce los pasos de inferencia respecto a un transducer clásico.
- Dictado en aplicaciones de escritorio: al integrarse como `.mlmodelc`, puede invocarse desde una app nativa en Swift u Objective-C con el runtime de Core ML.
- Procesamiento por lotes de archivos de audio en un Mac: el tamaño del repositorio (0,2 GB) y el codificador de 138 MB permiten distribuir el modelo junto con la aplicación.
- Prototipado de pipelines ASR en investigación: la separación entre codificador Core ML y decodificador en FP32 facilita inspeccionar y modificar la fase de decodificación.
- Transcripción de contenido en inglés en entornos con requisitos de privacidad: al ejecutarse en local, el audio no abandona el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: macOS 26 o posterior; el codificador está compilado con objetivo iOS 26.
- Codificador: 138.084.519 bytes en formato Core ML, ejecutable en Neural Engine o CPU.
- Decodificador: redes de predicción y conjunta en FP32, cargadas en memoria por código nativo.
- VRAM: no aplica; el modelo usa memoria unificada del sistema en equipos Apple.
- GPU dedicadas (A100, H100, RTX 4090): no aplican a este artefacto, que está empaquetado para Core ML.
- Despliegue: runtime de Core ML en macOS; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kea-B 0.1 Core ML | no disponible (base 0.6b) | ventanas de 15 s | en | CC-BY-4.0 | Core ML + arrays FP32 |
| audeolabs/kea-b-0.1 | no disponible (base 0.6b) | no disponible | en | CC-BY-4.0 | safetensors |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6b (por nombre) | no disponible | en | no disponible en la informacion | no disponible |

La comparación se limita a los tres modelos citados en la documentación del repositorio; no se dispone de datos de rendimiento para contrastarlos.

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte multilingüe.
- El repositorio contiene únicamente pesos: es necesario implementar el frontend, la llamada al codificador, el decodificador TDT y el troceado de audio.
- El codificador está compilado para macOS 26 o posterior; no funcionará en versiones anteriores ni en otras plataformas.
- La cuantización binaria o de 1 bit del codificador puede degradar la precisión frente al modelo en coma flotante; no se publican métricas de esa degradación.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o solapamiento de hablantes, inherente a los modelos ASR; no se cuantifica en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; deben respetarse los avisos de `NOTICE` sobre cambios, datos de entrenamiento y herramientas.
- El modelo base modifica nvidia/parakeet-tdt-0.6b-v2, por lo que pueden aplicar condiciones adicionales derivadas de la licencia original.

## Enlaces

- Repositorio Core ML: https://huggingface.co/audeolabs/kea-b-0.1-coreml
- Modelo base: https://huggingface.co/audeolabs/kea-b-0.1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
