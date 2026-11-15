# ozankaraali/qitv-asr-tr-moonshine-mid

## Resumen

QiTV ASR Turkish Moonshine Medium es un modelo de reconocimiento automático del habla (ASR) para turco e inglés, desarrollado por ozankaraali como parte del proyecto QiTV, un sistema de subtitulado en directo que se ejecuta localmente. El modelo parte de moonshine-ai/moonshine-streaming-medium y se ha entrenado adicionalmente con aproximadamente 7.700 horas de audio en turco, en su mayoría conversacional. Está pensado para transcribir diálogo de series y televisión con calidad suficiente para subtítulos en tiempo real, funcionando de forma offline sobre CPU gracias a sus pesos cuantizados en int8.

La arquitectura es la de Moonshine Streaming, un modelo de tipo encoder-decoder orientado a streaming, con 237.552.512 parámetros totales según los tensores de safetensors (el modelo base declara 266M contados de la misma forma, por tener un vocabulario mayor). El checkpoint se distribuye tanto en safetensors fp32 para Transformers como en ONNX cuantizado int8 para sherpa-onnx, que es el formato que emplea QiTV en producción.

Su relevancia radica en dos factores: por un lado, ofrece una alternativa abierta para ASR turco en un nicho poco cubierto (diálogo de ficción televisiva y letras cantadas), donde supera a otros modelos abiertos turcos comparados; por otro, incluye capacidades bilingües turco-inglés y un formato de salida con mayúsculas, puntuación y números escritos en palabras, lo que reduce el postprocesado necesario para subtitulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming (encoder-decoder para ASR en streaming) |
| Parametros totales | 237.552.512 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; los segmentos de audio recomendados son de hasta ~25 segundos |
| Tipos de cuantizacion | int8 (ONNX), fp32 (safetensors) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, ONNX, SentencePiece (`tr.model`) |

## Arquitectura y entrenamiento

El modelo se basa en Moonshine Streaming Medium, una arquitectura encoder-decoder diseñada para transcripción incremental de audio, adecuada para subtitulado en directo. El checkpoint resultante se ha afinado sobre aproximadamente 7.700 horas de habla turca, con predominio de audio conversacional, lo que explica su buen comportamiento en diálogo de ficción frente a conjuntos de habla leída o noticias. No se detalla en la información disponible la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO u otras variantes de alineación.

El vocabulario es un SentencePiece de 10.623 piezas que cubre turco e inglés, lo que permite emitir texto en ambos idiomas desde un único modelo. La salida está normalizada para subtitulado: mayúsculas y puntuación incluidas, números escritos en palabras (por ejemplo, "on yedi" en lugar de "17"), y los scripts del proyecto incluyen un conversor para mostrar cifras cuando se desea. El modelo se distribuye con pesos fp32 para PyTorch/Transformers y con pesos ONNX int8 para sherpa-onnx, pensados para ejecución en CPU.

## Capacidades

- Transcripción de voz a texto en turco e inglés con un único modelo.
- Salida con mayúsculas y puntuación, lista para subtitulado.
- Números escritos en palabras en la salida del modelo, con utilidades externas para convertirlos a dígitos.
- Reconocimiento de habla conversacional y de diálogo de ficción televisiva.
- Transcripción de letras cantadas, según los resultados reportados por el autor.
- Ejecución offline en CPU con los ficheros ONNX cuantizados int8.
- Integración con sherpa-onnx (OfflineRecognizer.from_moonshine_v2) y con Transformers (MoonshineStreamingForConditionalGeneration).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá del propio ASR.

## Casos de uso

- Subtitulado en directo de series y programas de televisión: el modelo está entrenado específicamente sobre diálogo de ficción y funciona en segmentos de hasta unos 25 segundos, lo que encaja con el flujo de un detector de actividad de voz que corta el audio en pausas y alimenta al reconocedor.
- Subtitulado local y privado en el dispositivo del espectador: al ejecutarse offline sobre CPU con los ficheros int8 de sherpa-onnx, el audio no sale de la máquina y no hay coste por minuto, algo relevante para aplicaciones de accesibilidad o reproducción personal.
- Transcripción de contenido audiovisual bilingüe turco-inglés: un mismo modelo cubre ambos idiomas, útil para material que alterna idiomas o para generar subtítulos en inglés de producciones turcas.
- Generación de borradores de transcripción para archivo y postproducción: la salida con puntuación y mayúsculas reduce el trabajo de corrección manual frente a salidas en minúsculas y sin puntuar.
- Transcripción de letras cantadas en contenido musical o programas con actuaciones: el autor reporta que lidera a los modelos comparados en este tipo de audio.
- Integración en pipelines de accesibilidad o herramientas de análisis de contenido: la disponibilidad de pesos ONNX y de una API de Transformers permite incorporarlo tanto en aplicaciones ligeras en CPU como en flujos de procesamiento por lotes con PyTorch.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden la tasa de error por palabra (WER, en %; menor es mejor) e ignoran mayúsculas y puntuación, comparando números como palabras habladas.

| Test set | Clips | Este modelo | Moonshine small | Conformer | mihu-v2 | ufakzeka-kulak | balbal-v2 | zipformer-asr-turkish-v1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FLEURS Turkish, test | 743 | 11.7 | 13.6 | 11.4 | 7.9 | 9.4 | 8.0 | 9.4 |
| Common Voice 27.0 Turkish, test (1.500 aleatorios) | 1.500 | 10.0 | 13.1 | 11.0 | 6.0 | 9.3 | 7.0 | 9.6 |
| MediaSpeech Turkish (noticias, primeros 150 clips) | 150 | 12.2 | 13.4 | 12.7 | 10.8 | 11.8 | 11.3 | 11.9 |
| Drama A (diálogo de serie turca) | no disponible | 11.8 | no disponible | no disponible | 19.2–26.2 (rango de los cuatro modelos comparados) | no disponible | no disponible | no disponible |
| VoxPopuli (inglés) | no disponible | 13.4 | no disponible | no disponible | no disponible | no disponible | 18.8 | no disponible |

Según el autor, el modelo obtiene el menor WER en los tres conjuntos de drama y en letras cantadas, y es el más preciso en inglés entre los modelos comparados que escriben inglés (Moonshine small, Moonshine medium y balbal-v2). En habla leída (FLEURS, Common Voice), noticias y charlas de YouTube, mihu-v2 es más preciso. La información proporcionada no incluye el resto de cifras de Drama B, Drama C, letras cantadas ni YouTube.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 237,5M de parámetros, el checkpoint fp32 ocupa 951 MB y los ficheros ONNX int8 suman 142 MB (encoder) + 136 MB (decoder), por lo que la inferencia en CPU es viable sin GPU.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en CPU con sherpa-onnx.
- Cabe en GPU consumer: sí, por tamaño (los pesos int8 rondan los 278 MB y el fp32 los 951 MB), aunque no se documentan requisitos de VRAM ni pruebas en GPU concretas.
- Opciones de despliegue: sherpa-onnx 2.0.1 (probado por el autor) y Transformers 5.22.1 con PyTorch (probado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/segmento | WER Drama A | WER FLEURS TR | Licencia |
|---|---|---|---|---|---|---|
| QiTV ASR Turkish Moonshine Medium | 237,5M | tr, en | segmentos de hasta ~25 s | 11.8 | 11.7 | cc-by-4.0 |
| mihu-v2 (mihuai/turkish-stt-66m-v2) | 66M (según nombre) | tr | no disponible | 19.2–26.2 (rango reportado) | 7.9 | no disponible |
| Moonshine small (qitv-asr-tr-moonshine-small) | aproximadamente la mitad | tr, en | no disponible | no disponible | 13.6 | no disponible |
| qitv-asr-tr-conformer | no disponible | tr | streaming FastConformer | no disponible | 11.4 | no disponible |

El modelo se posiciona como la opción más precisa del conjunto comparado en diálogo de ficción televisiva y letras cantadas, mientras que mihu-v2 lidera en habla leída y noticias. Los datos de licencia y parámetros de los modelos alternativos no están completos en la información disponible.

## Limitaciones y advertencias

- En habla leída (FLEURS, Common Voice), noticias y charlas de YouTube, varios modelos abiertos turcos son más precisos; mihu-v2 es el más preciso en esos conjuntos según el autor.
- Los segmentos de audio muy largos (por encima de unos 25 segundos) pueden provocar repeticiones en la decodificación; es necesario cortar previamente con un detector de actividad de voz.
- El encoder lee tramas completas de 80 muestras, por lo que hay que rellenar el final del audio para evitar errores.
- La salida escribe los números en palabras; para mostrarlos como dígitos hace falta un conversor externo (incluido en los scripts del proyecto).
- El modelo transcribe tacos tal como se dicen, lo que puede requerir filtrado para emisiones familiares.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Licencia cc-by-4.0: permite uso comercial con atribución; conviene revisar las condiciones del modelo base Moonshine Streaming Medium.
- Solo turco e inglés; no se documenta soporte de otros idiomas.
- No se documentan requisitos de VRAM, latencia ni throughput en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozankaraali/qitv-asr-tr-moonshine-mid
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-medium
- Modelo hermano small: https://huggingface.co/ozankaraali/qitv-asr-tr-moonshine-small
- Modelo hermano Conformer: https://huggingface.co/ozankaraali/qitv-asr-tr-conformer
- Repositorio QiTV: https://github.com/ozankaraali/QiTV
- Scripts de QiTV ASR: https://github.com/ozankaraali/qitv-asr
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- mihu-v2: https://huggingface.co/mihuai/turkish-stt-66m-v2
- ufakzeka-kulak: https://huggingface.co/ufakai/ufakzeka-kulak
- balbal-v2: https://huggingface.co/erayyapagci/balbal-v2
- zipformer-asr-turkish-v1: https://huggingface.co/oayk/zipformer-asr-turkish-v1
