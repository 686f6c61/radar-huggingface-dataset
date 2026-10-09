# jonah1024/jackrabbit-110m-ro-handy

## Resumen

jackrabbit-110m-ro-handy es una conversión al formato GGUF del modelo surogate/jackrabbit-110m-ro, un sistema de reconocimiento automático del habla (ASR) especializado en rumano y desarrollado por Surogate dentro de su familia Jackrabbit. La conversión la firma el usuario jonah1024 y su objetivo declarado es poder ejecutar el modelo en Handy.app, una aplicación de dictado, partiendo del checkpoint original de NeMo (466 MB en formato .nemo) mediante el script convert-parakeet.py de transcribe.cpp.

Técnicamente, Jackrabbit es un modelo de 116 millones de parámetros basado en una arquitectura FastConformer que comparte un único encoder y monta dos decodificadores, TDT (Token-and-Duration Transducer) y CTC, sobre él. Genera rumano con mayúsculas y puntuación correctas y, según su autor, se ejecuta con solvencia en CPU. La variante aquí empaquetada es la de tipo offline (procesa la locución completa); su hermano dentro de la misma familia es Jackrabbit 110M Streaming, pensado para audio en vivo.

Su relevancia radica en dos factores: por un lado, cubre un idioma con relativamente pocos modelos ASR abiertos y ligeros; por otro, su tamaño lo hace apto para inferencia local sin GPU, algo poco habitual en reconocimiento de voz. El repositorio cuenta con cero descargas y cero likes en el momento de redactar esta ficha, y no se especifica licencia alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder compartido) con decodificadores TDT y CTC |
| Parametros totales | 115.425.414 (segun safetensors); la model card y el nombre del modelo citan 110M/116M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; duracion maxima de audio no especificada) |
| Tipos de cuantizacion | GGUF (nivel de cuantizacion concreto no especificado en la informacion disponible) |
| Idiomas soportados | rumano (ro) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en NeMo, .nemo) |

## Arquitectura y entrenamiento

El modelo es un sistema de reconocimiento automático del habla, no un transformer de lenguaje. Se apoya en una arquitectura FastConformer, una variante eficiente del Conformer con atenciones submuestreadas, que actúa como encoder único. Sobre ese encoder se montan dos cabeceras de decodificación: TDT (Token-and-Duration Transducer), que predice de forma conjunta token y duración, y CTC (Connectionist Temporal Classification). Esta configuración dual sobre un mismo encoder es una práctica habitual para combinar la robustez del decodificador transducer con la simplicidad de CTC en el grafo de inferencia.

La conversión que da origen a este repositorio no reentrena el modelo: parte del checkpoint original en formato NeMo de surogate/jackrabbit-110m-ro y lo transforma a GGUF mediante convert-parakeet.py, la herramienta de transcribe.cpp. Por tanto, las características de entrenamiento (número de horas de audio, composición del dataset, uso de RLHF/DPO y cualquier innovación de entrenamiento) no se detallan en la información disponible. Lo que sí se documenta es el comportamiento del modelo resultante: salida en rumano con capitalización y puntuación, y funcionamiento cómodo en CPU. Existe una variante de la misma familia, Jackrabbit 110M Streaming, orientada a audio en directo.

## Capacidades

- Reconocimiento de voz offline en rumano: transcribe una locución completa y devuelve texto con mayúsculas y puntuación.
- Decodificación dual TDT y CTC sobre un mismo encoder, lo que permite distintas estrategias de decodificación.
- Ejecución en CPU sin necesidad de GPU, gracias a su tamaño reducido y a su conversión a GGUF.
- Integración en aplicaciones de dictado local mediante Handy.app (requiere copiar el .gguf al directorio de datos de la aplicación).
- Formato GGUF, apto para motores de inferencia que consumen este contenedor.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento (thinking), dado que es un modelo puramente ASR.
- Capacidad multilingüe: no; la información disponible indica únicamente rumano.

## Casos de uso

- Dictado local en rumano: integrado en Handy.app, permite transcribir voz a texto en el propio equipo sin enviar audio a la nube, algo viable por su tamaño de ~115M de parámetros y su perfil de CPU.
- Transcripción de reuniones y generación de actas: al ser un modelo offline, procesa la grabación completa de una reunión en rumano y produce texto puntuado directamente utilizable como borrador de acta.
- Subtitulado de vídeo y pódcast: se puede encadenar la transcripción del audio con un alineador temporal para generar subtítulos en rumano, aprovechando la salida ya capitalizada y puntuada.
- Atención al cliente y transcripción de llamadas: como paso previo de ASR en pipelines que después aplican análisis de sentimiento, búsqueda o resumen sobre las conversaciones en rumano.
- Indexación y búsqueda de audio: convertir archivos de audio rumanos a texto permite indexarlos en un motor de búsqueda o en un sistema RAG, habilitando consultas textuales sobre contenido hablado.
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en contenido hablado en rumano, ejecutable en local sin depender de servicios externos.
- Preprocesado para agentes de voz: combinado con un modelo de síntesis como Amami (la familia de habla de Surogate), sirve como bloque de escucha dentro de un asistente conversacional que opere en rumano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Perfil general: modelo de ~115M de parámetros diseñado para funcionar cómodamente en CPU, según la información del autor.
- VRAM estimada (valores derivados del recuento de parámetros, no publicados oficialmente): en FP16 en torno a 230 MB; en cuantización de 8 bits en torno a 115 MB; en cuantización de 4 bits en torno a 60-70 MB.
- RAM estimada: del mismo orden que la VRAM, más la memoria del runtime de inferencia; cabe sin problema en cualquier equipo de consumo actual.
- GPU recomendadas: no se especifican; no se requiere GPU. Cualquier GPU de consumo (por ejemplo, una RTX 4090) sería sobredimensionada para este modelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: Handy.app (uso previsto por el autor) y transcribe.cpp; el formato GGUF abre la puerta a otros motores que soporten dicho contenedor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento comparativos en la información disponible, por lo que la tabla se limita a características estructurales verificables.

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jonah1024/jackrabbit-110m-ro-handy (este modelo) | ~115M | FastConformer + TDT/CTC | rumano | no disponible | GGUF |
| surogate/jackrabbit-110m-ro (modelo base) | ~115M | FastConformer + TDT/CTC | rumano | no disponible | NeMo (.nemo) |
| Jackrabbit 110M Streaming (variante hermana) | ~110M | FastConformer (streaming) | rumano | no disponible | no disponible |
| openai/whisper-small | 244M | Encoder-decoder transformer | multilingue (incluye rumano) | MIT (repositorio) | safetensors / otros |

Comparativa de rendimiento (WER, latencia, throughput): no disponible.

## Limitaciones y advertencias

- Licencia no especificada: se desconoce si se permite el uso comercial, por lo que no debería desplegarse en producción sin aclarar previamente las condiciones.
- Cobertura de un único idioma: solo rumano; no hay soporte multilingüe documentado.
- Tipo de modelo: es un sistema ASR, no un modelo generativo de propósito general; no admite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de error de transcripción: aunque no hay tasas publicadas, todo modelo ASR puede confundir términos, especialmente cifras, fechas y nombres propios, un problema que el propio Surogate menciona como motivación de su familia de modelos.
- Longitud de audio: no se especifica la duración máxima de locución soportada ni el comportamiento en fragmentos largos; conviene validarlo antes de usarlo con audios extensos.
- Estado del repositorio: cero descargas y cero likes en el momento de redactar la ficha, lo que implica poca validación por parte de la comunidad.
- Dependencia del entorno: las instrucciones de uso están ligadas a Handy.app y a rutas concretas en macOS, lo que limita su uso directo fuera de ese contexto.
- Discrepancia en el recuento de parámetros: el nombre del modelo indica 110M, la model card cita 116M y safetensors reporta 115.425.414; conviene tenerlo en cuenta al planificar recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonah1024/jackrabbit-110m-ro-handy
- Modelo base: https://huggingface.co/surogate/jackrabbit-110m-ro
- Colección Jackrabbit Models ASR: https://huggingface.co/collections/surogate/jackrabbit-models-asr
- Blog de Surogate Speech: https://huggingface.co/blog/cetusian/surogate-speech
- Página de Surogate Speech: https://surogate.ai/labs/speech/
- Repositorio de Handy.app: https://github.com/cjpais/Handy.git
- Web de Handy.app: https://handy.computer/
- Conversión relacionada del mismo autor: https://huggingface.co/jonah1024/Sped_ParakeetRomanian_110M_TDT-CTC_gguf
