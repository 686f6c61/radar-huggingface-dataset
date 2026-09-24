# mldecode/sherpa-onnx-parakeet-ultra-int8

## Resumen

`mldecode/sherpa-onnx-parakeet-ultra-int8` es un repositorio de pesos alojado en HuggingFace por el usuario `mldecode`, cuyo identificador sugiere un artefacto ONNX cuantizado a INT8 de un modelo de reconocimiento automatico del habla (ASR) de la familia Parakeet, empaquetado para su uso con el runtime sherpa-onnx. El repositorio se publico el 24 de septiembre de 2026 (fecha que figura en los metadatos de HuggingFace), no acumula descargas ni "likes" y carece de model card: el unico contenido del README es el bloque de frontmatter con la licencia `cc-by-4.0`. No se documenta autoría del modelo base, pipeline, idiomas ni arquitectura interna.

El problema que aborda es el de ejecutar transcripcion de voz en local, sin conexion y sobre hardware modesto. sherpa-onnx es un ecosistema de inferencia (sucesor de next-gen Kaldi) construido sobre onnxruntime que cubre reconocimiento de voz, sintesis de voz, diarizacion de hablantes, mejora de voz, separacion de fuentes y deteccion de actividad de voz, con soporte declarado para sistemas embebidos y Android. En ese contexto, un artefacto INT8 encaja en el tramo de bajo consumo de recursos del catalogo: los modelos NeMo de tipo transducer se distribuyen en sherpa-onnx en variantes fp16, sin cuantizar e INT8.

La relevancia actual del repositorio es limitada como pieza individual, pero ilustra un patron habitual del ecosistema: tomar un checkpoint ASR publicado por un tercero, exportarlo a ONNX con la herramienta de k2-fsa, anadir metadatos y tokens, y publicar la variante cuantizada para despliegue en CPU. Dado que no hay model card ni ficha tecnica, todos los datos de arquitectura, tamano y contexto que figuran a continuacion deben tratarse como no verificados salvo que se indique lo contrario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El identificador apunta a un export ONNX de un modelo Parakeet; la documentacion de sherpa-onnx clasifica los modelos NeMo de esta familia dentro de los "transducer models", pero no se confirma que este repositorio concreto use esa topologia |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible (modelo ASR; no se documenta ventana de audio ni estrategia de chunking) |
| Tipos de cuantizacion | INT8, segun el sufijo `-int8` del identificador. No se documenta el esquema exacto (per-tensor, per-channel, dynamic/static) ni si existe variante fp16 o fp32 en el mismo repositorio |
| Idiomas soportados | No disponible. Los metadatos de HuggingFace no declaran idiomas |
| Licencia | cc-by-4.0 |
| Formato de pesos | Se infiere ONNX a partir del identificador `sherpa-onnx` y del sufijo de cuantizacion; no se listan archivos en la informacion proporcionada |

## Arquitectura y entrenamiento

No hay informacion en los datos proporcionados sobre la arquitectura interna del modelo, el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o horas de audio procesadas, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en ASR). Tampoco se indica si el modelo base es un checkpoint propio de `mldecode` o una exportacion de un modelo publicado por otro autor. La model card esta vacia mas alla de la licencia.

El unico marco tecnico verificable procede de la documentacion de sherpa-onnx consultada: el proyecto cataloga los modelos NeMo como modelos de tipo transducer (familia que en NeMo corresponde a arquitecturas RNN-T/TDT sobre encoder FastConformer) y describe un flujo de exportacion en cuatro pasos (exportar `model.onnx`, anadir metadatos, obtener `model.int8.onnx` y obtener `tokens.txt`). Los ejemplos publicados en la documentacion incluyen variantes como `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2` en fp16 y sin cuantizar, y `sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000-int8` para ingles. Estos nombres aparecen en las fuentes consultadas y sirven como referencia del ecosistema, pero no confirman que este repositorio corresponda a ninguno de ellos.

La innovacion tecnica esperable en un artefacto de este tipo es la propia cuantizacion INT8 combinada con el runtime de onnxruntime, que reduce el coste de memoria y acelera la inferencia en CPU frente a un checkpoint en precision completa, a cambio de una posible perdida de exactitud en la transcripcion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo offline, segun la naturaleza del ecosistema sherpa-onnx. No confirmado para este artefacto concreto.
- Decodificacion de ficheros de audio mediante el binario de sherpa-onnx, de forma analoga a los ejemplos de la documentacion (`Decode wave files`).
- Reconocimiento desde microfono, potencialmente combinado con deteccion de actividad de voz (VAD).
- Ejecucion sin conexion a Internet, caracteristica declarada del proyecto sherpa-onnx.
- Despliegue en sistemas embebidos y Android, segun la descripcion del repositorio k2-fsa/sherpa-onnx.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo o modo "thinking": no disponibles; son capacidades de modelos de lenguaje y no constan en este artefacto.
- Diarizacion de hablantes, sintesis de voz, mejora de voz y separacion de fuentes: son capacidades del runtime sherpa-onnx, no se atribuyen a este modelo concreto.

## Casos de uso

- Transcripcion por lotes de archivos WAV en servidor: se puede invocar el binario de sherpa-onnx sobre directorios de audio para generar transcripciones sin depender de APIs en la nube; el formato INT8 reduce el consumo de memoria por proceso si se ejecutan varias instancias en paralelo.
- Subtitulado automatizado de video: integrado en un pipeline de postproduccion que extrae la pista de audio, la trocea y llama al modelo para generar subtitulos con marcas de tiempo, siempre que el modelo base exponga alineaciones utilizables (no verificado).
- Asistentes de voz locales en escritorio: el ecosistema sherpa-onnx se usa para reconocimiento desde microfono; este artefacto podria alimentar un dictado offline en equipos sin GPU.
- Aplicaciones moviles o embebidas: el proyecto declara soporte para Android y sistemas embebidos, de modo que una variante INT8 es candidata para transcripcion on-device con presupuesto de memoria reducido.
- Preprocesado de audio para buscadores o sistemas de indexacion: transcribir archivos de audio de una organizacion para que sean buscables por texto, ejecutando el modelo en CPU dentro del mismo centro de datos para no enviar datos a terceros.
- Cumplimiento y privacidad: entornos sanitarios, legales o de defensa donde el audio no puede salir de la infraestructura; un modelo de transcripcion offline elimina la transferencia de datos a proveedores externos.
- Prototipado y evaluacion de toolchains ASR: sirve como artefacto de prueba para medir el impacto de la cuantizacion INT8 frente a fp16 en la tasa de error de palabras, siempre que se disponga de un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay WER, MMLU, HumanEval, GSM8K ni ninguna otra metrica en los metadatos de HuggingFace ni en la model card. Los resultados de busqueda describen modelos del ecosistema sherpa-onnx, pero no aportan cifras de este repositorio.

## Requisitos de hardware

- VRAM: no disponible. Al tratarse de un artefacto de transcripcion de voz orientado a onnxruntime, lo previsible es ejecucion en CPU con memoria RAM en lugar de VRAM, pero el tamano del modelo no se documenta y no se puede estimar.
- GPU recomendadas: no disponible. onnxruntime puede ejecutarse sobre CUDA, pero no hay dato de proveedor ni de version.
- GPU de consumo: no disponible por la misma razon; si el modelo base fuese del orden de 0,6 B de parametros (como en los ejemplos de la documentacion para `parakeet-tdt-0.6b-v2`) cabria en GPUs de consumo con 8-12 GB, pero esto es una extrapolacion del catalogo de sherpa-onnx y no una especificacion de este repositorio.
- Opciones de despliegue: sherpa-onnx sobre onnxruntime, con binarios de decodificacion de ficheros y de reconocimiento desde microfono; tambien cabe integracion via la API de C/C++/Python de sherpa-onnx. Otros runtimes como vLLM, TGI o llama.cpp no son aplicables a un modelo ASR de este tipo (llama.cpp esta orientado a modelos de lenguaje, y vLLM/TGI a inferencia de LLM).
- Latencia y throughput: no disponibles. Dependen del tamano real del modelo, del hilo de CPU o GPU empleado y de la implementacion de decodificacion, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mldecode/sherpa-onnx-parakeet-ultra-int8` | ASR (export ONNX, presumiblemente Parakeet) | INT8 | No disponible | cc-by-4.0 | Publicado en HuggingFace, 0 descargas |
| `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2` | NeMo transducer | Sin cuantizar | No disponible en las fuentes consultadas | No disponible | Distribuido por la documentacion de sherpa-onnx |
| `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-fp16` | NeMo transducer | FP16 | No disponible en las fuentes consultadas | No disponible | Distribuido por la documentacion de sherpa-onnx |
| `sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000-int8` | NeMo transducer/CTC | INT8 | Ingles | No disponible | Distribuido por la documentacion de sherpa-onnx |
| `stt_en_citrinet_512` | Citrinet | No especificada | Ingles | No disponible | Distribuido por la documentacion de sherpa-onnx |

La comparacion se limita a la existencia de los artefactos y a su lugar en el catalogo de sherpa-onnx: no hay datos publicos de parametros, contexto o rendimiento para este repositorio, de modo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo contiene la licencia. No hay descripcion de arquitectura, entrenamiento, idiomas ni metricas, lo que impide auditar el modelo antes de usarlo en produccion.
- Procedencia del modelo base no verificada: el identificador sugiere una exportacion de Parakeet, pero no se confirma que checkpoint, version ni autor estan detras. Sin esa trazabilidad no se puede evaluar la licencia del modelo original.
- Repositorio sin traccion: cero descargas y cero "likes". No hay evidencia de uso por terceros ni de validacion independiente.
- Fecha de creacion inusual: los metadatos indican 2026-09-24, posterior a la fecha de consulta habitual; conviene verificar si es un error de la plataforma o un artefacto programado.
- Riesgo de alucinacion: los modelos ASR no generan contenido libre, pero si pueden producir transcripciones plausibles e incorrectas, especialmente con audio ruidoso, acentos no representados en el entrenamiento o vocabulario tecnico. La ausencia de datos de WER impide cuantificar ese riesgo.
- Idiomas: no declarados. No se debe asumir soporte de castellano ni de ninguna otra lengua sin una evaluacion propia.
- Cuantizacion INT8: reduce precision y puede degradar la exactitud de transcripcion respecto a fp16 o fp32. Se desconoce la magnitud de la perdida.
- Licencia cc-by-4.0: permite uso comercial y modificacion con atribucion, pero no cubre los derechos del modelo base subyacente, que se desconoce. Es un riesgo legal a resolver antes de un despliegue comercial.
- Sin garantias de mantenimiento: el repositorio no muestra actualizaciones posteriores a su creacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mldecode/sherpa-onnx-parakeet-ultra-int8
- Documentacion de modelos NeMo transducer en sherpa: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/offline-transducer/nemo-transducer-models.html
- Documentacion general de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Repositorio k2-fsa/sherpa-onnx en GitHub: https://github.com/k2-fsa/sherpa-onnx
- Script de prueba ONNX para parakeet-tdt-0.6b-v2: https://github.com/k2-fsa/sherpa-onnx/blob/master/scripts/nemo/parakeet-tdt-0.6b-v2/test_onnx.py
