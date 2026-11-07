# skaldrim/opus-mt-no-en-ct2-int8

## Resumen

`skaldrim/opus-mt-no-en-ct2-int8` es un paquete de traduccion automatica noruego-ingles e ingles-noruego derivado de los modelos OPUS-MT de la Universidad de Helsinki (`Helsinki-NLP/opus-mt-gmq-en` y `Helsinki-NLP/opus-mt-en-gmq`), convertidos a CTranslate2 con cuantizacion int8. No se ha reentrenado ni modificado el contenido de los pesos: el autor solo ha cambiado el formato para permitir inferencia eficiente en CPU dentro de la aplicacion Skaldrim, que traduce subtitulos de forma local sin enviar datos a servidores externos.

El modelo resuelve un caso de uso muy concreto: traduccion bidireccional de alta velocidad y bajo coste computacional entre ingles y las variantes escritas del noruego (bokmal `nb` y nynorsk `nn`), en escenarios donde no hay GPU ni conectividad. La arquitectura subyacente es Marian NMT, un transformer encoder-decoder clasico de traduccion (no un modelo generativo de proposito general), entrenado sobre el corpus OPUS.

Es relevante para desarrolladores que necesiten un motor de traduccion embebible de tamano reducido (unos 75 MB por direccion en int8), con licencia Apache-2.0 y sin dependencia de servicios en la nube, aunque su alcance funcional se limita estrictamente a la traduccion de texto entre ese par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible (pesos int8 de ~75,6 MB y ~75,4 MB por direccion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (via `ct2-transformers-converter --quantization int8`) |
| Idiomas soportados | en, nb, nn, no |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizacion SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian NMT, un transformer encoder-decoder con atencion estandar, tal como lo publica el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (Jorg Tiedemann, Santhosh Thottingal y colaboradores). Los modelos originales se entrenaron sobre la coleccion de corpus OPUS, orientados especificamente a traduccion automatica y no a generacion libre de texto.

Este repositorio no introduce entrenamiento adicional ni ajuste fino: el autor declara explicitamente que solo ha convertido los pesos de Hugging Face (Marian) a CTranslate2 con cuantizacion int8, conservando los modelos SentencePiece originales. La direccion noruego-ingles usa `opus-mt-gmq-en` (germánico septentrional a ingles) y la direccion ingles-noruego usa `opus-mt-en-gmq` con la etiqueta de destino `>>nob<<` antepuesta a cada frase. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Traduccion de texto noruego (bokmal y nynorsk) a ingles y de ingles a noruego.
- Traduccion por frases con tokenizacion SentencePiece y busqueda por beam (beam search) en CTranslate2.
- Ejecucion local en CPU con pesos int8, sin envio de datos a servicios externos.
- Uso en modo linea a linea, apto para subtitulos y cadenas de texto cortas.
- Soporte de etiqueta de idioma de destino (`>>nob<<`) en la direccion ingles-noruego.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de subtitulos en aplicaciones moviles: el paquete esta pensado para traducir leyendas de forma local en la app Skaldrim, con un modelo de ~75 MB por direccion que cabe en el almacenamiento de un dispositivo y se ejecuta en CPU.
- Traduccion de documentacion tecnica noruega a ingles: util para equipos que reciben manuales o notas en bokmal o nynorsk y necesitan una version en ingles sin depender de APIs externas.
- Procesamiento por lotes de corpus en pipelines de datos: al ser CTranslate2, se puede integrar en scripts que traduzcan ficheros linea a linea y midan el rendimiento en tok/s, como hace la herramienta `ct2_translator`.
- Traduccion en entornos sin conectividad: escenarios de campo, sistemas embebidos o redes aisladas donde no es posible usar servicios en la nube.
- Preprocesamiento para busqueda y analitica: traduccion de reseñas o comentarios en noruego a ingles antes de indexarlos en un motor de busqueda o de aplicarles analisis de sentimiento.
- Traduccion de correspondencia y correos internos: integracion en herramientas de escritorio que necesiten convertir mensajes cortos entre ingles y noruego con baja latencia en CPU.
- Prototipado de sistemas de traduccion: al estar en formato CTranslate2, sirve como base para comparar cuantizacion int8 frente a float32 en tareas de traduccion de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, los pesos int8 de ~75 MB por direccion ocupan una fraccion minima de memoria (menos de 1 GB incluyendo overhead del runtime).
- GPU recomendadas: no es necesario GPU; cualquier GPU con soporte CUDA puede ejecutar CTranslate2, pero el diseno del paquete apunta a CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: CTranslate2 (libreria nativa), herramientas como `ct2_translator` (C++23, CLI en CPU con int8/float32), y cualquier runtime que cargue modelos CTranslate2.
- Latencia y throughput: no disponibles en la informacion proporcionada; la herramienta `ct2_translator` reporta tok/s tras cada traduccion, pero no se han publicado cifras para este paquete concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/opus-mt-no-en-ct2-int8 | no disponible (~75 MB int8 por direccion) | no disponible | en, nb, nn, no | Apache-2.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-gmq-en (original) | no disponible | no disponible | gmq, en | Apache-2.0 | Marian / safetensors |
| Helsinki-NLP/opus-mt-en-gmq (original) | no disponible | no disponible | en, gmq | Apache-2.0 | Marian / safetensors |
| Meta NLLB-200 (mencionado en busqueda) | no disponible | no disponible | multilingue | no disponible | CTranslate2 (soportado por `ct2_translator`) |

Los modelos originales de OPUS-MT ofrecen la misma calidad de traduccion que este paquete, pero en formato Marian y sin cuantizacion int8; la diferencia practica es el rendimiento y el tamano en inferencia. NLLB-200 cubre muchos mas idiomas, a costa de un tamano y unos requisitos mayores.

## Limitaciones y advertencias

- El modelo solo traduce entre ingles y noruego; no es un modelo generativo de proposito general y no responde preguntas ni razona.
- La cuantizacion int8 puede introducir una perdida de calidad frente a los pesos originales en float32; no se han publicado evaluaciones que la cuantifiquen.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni comportamiento en dominios especializados (legal, medico, tecnico).
- La direccion ingles-noruego requiere anteponer la etiqueta `>>nob<<` a cada frase; omitirla puede degradar la salida.
- No se especifica la longitud maxima de contexto soportada; las frases largas pueden truncarse o traducirse de forma incompleta.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la conversion; los errores de conversion son responsabilidad del autor del paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/skaldrim/opus-mt-no-en-ct2-int8)
- [Helsinki-NLP/opus-mt-gmq-en](https://huggingface.co/Helsinki-NLP/opus-mt-gmq-en)
- [Helsinki-NLP/opus-mt-en-gmq](https://huggingface.co/Helsinki-NLP/opus-mt-en-gmq)
- [CTranslate2 (GitHub)](https://github.com/OpenNMT/CTranslate2)
- [ct2_translator (GitHub)](https://github.com/rozdaybeda/ct2_translator)
- [Paper OPUS-MT (EAMT 2020)](https://aclanthology.org/2020.eamt-1.61/)
