# Qntology/stanza-pt

## Resumen

Stanza-pt es el paquete de modelos linguisticos de Stanza para portugues, distribuido en este repositorio por el usuario Qntology como una conversion a ONNX del modelo original de Stanford NLP (`stanfordnlp/stanza-pt`). Stanza es una coleccion de herramientas para el analisis linguistico (tokenizacion, expansion de palabras multi-palabra, etiquetado POS, lematizacion y analisis de dependencias) que cubre decenas de idiomas. Este repositorio concreto no entrena un modelo nuevo: empaqueta los modelos ya entrenados de Stanza 1.15.0 en formato ONNX para su uso en inferencia sin dependencia de PyTorch.

El modelo resuelve el procesamiento linguistico clasico del portugues: segmentacion de texto en tokens, normalizacion de contracciones multi-palabra (mwt), etiquetado de categoria gramatical (UPOS/XPOS y rasgos morfologicos), lematizacion y analisis de dependencias sintacticas. Es relevante para pipelines de NLP que necesitan un analizador morfosintactico ligero y determinista, ejecutable en entornos con ONNX Runtime, sin la sobrecarga de un framework de deep learning completo.

La arquitectura subyacente son modelos neuronales de Stanza (redes BiLSTM con embeddings contextuales de tipo charlm en los procesadores de POS y depparse) organizados en cinco procesadores independientes. El repositorio ocupa 1,8 GB e incluye dos formatos de ficheros ONNX: el de raiz y el de `format2/`, este ultimo orientado a clientes de `logis-center`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos neuronales de Stanza (BiLSTM con charlm) exportados a ONNX; pipeline de 5 procesadores (tokenize, mwt, pos, lemma, depparse) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin cuantizar de forma explicita) |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ficheros `.onnx` + `vocab.json`); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: es una conversion a ONNX de los paquetes por defecto de Stanza 1.15.0 para portugues. Los procesadores empleados son `bosque_nocharlm` para tokenizacion y lematizacion, `bosque` para expansion de palabras multi-palabra y `bosque_charlm` para POS y analisis de dependencias. Los modelos con sufijo `charlm` incorporan embeddings contextuales de caracteres, lo que mejora el etiquetado morfosintactico y el parsing. Los datos de entrenamiento corresponden al corpus Bosque (arbol bancario del portugues) usado por Stanza; no se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset.

La innovacion tecnica de este repositorio es la exportacion a ONNX mediante la herramienta `stanza-onnx-export` (commit `d56cf6f`), que permite ejecutar el pipeline sin PyTorch. El autor declara una verificacion end-to-end frente al pipeline original de PyTorch (`stanza.Pipeline`): sobre 19 textos de portugues (278 en total entre los 12 idiomas convertidos) los tokens, la expansion multi-palabra, UPOS, XPOS, rasgos, lemas, cabezas y relaciones de dependencia son identicos a la referencia. El formato `format2/` separa los ficheros por procesador (incluidos `lemma_encoder.onnx`, `lemma_decoder.onnx`, `mwt_encoder.onnx`, `mwt_decoder.onnx` y diccionarios JSON) y se describe como el usado por clientes de `logis-center` a partir de noviembre de 2026.

## Capacidades

- Tokenizacion de texto en portugues.
- Expansion de palabras multi-palabra (mwt), incluidas contracciones y formas compuestas.
- Etiquetado de categoria gramatical (UPOS y XPOS) con rasgos morfologicos.
- Lematizacion.
- Analisis de dependencias sintacticas (cabezas y relaciones).
- Ejecucion en ONNX Runtime sin dependencia de PyTorch.
- No incluye reconocimiento de entidades nombradas (NER) en los procesadores descritos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un analizador linguistico, no un modelo generativo.
- Multilingue: no, solo portugues.

## Casos de uso

- Preprocesado linguistico para pipelines de NLP en portugues: tokenizacion, POS y lemas como etapa previa a clasificacion, busqueda o extraccion de informacion, aprovechando que el modelo es determinista y ligero.
- Analisis sintactico de corpus: generacion de arboles de dependencias para estudios linguisticos o anotacion de datasets en portugues.
- Normalizacion de texto y expansion de contracciones: limpieza de texto antes de indexacion o comparacion, usando el procesador mwt.
- Lematizacion para motores de busqueda: reduccion de formas flexionadas a su lema para mejorar la recuperacion en portugues.
- Despliegue en entornos sin PyTorch: al distribuirse en ONNX, puede integrarse en servicios con ONNX Runtime en produccion, con menor huella de dependencias.
- Etiquetado morfosintactico en herramientas educativas o de correccion: identificacion de categorias gramaticales y rasgos para asistencia en escritura.
- Procesamiento por lotes de documentos: al ser un pipeline de modelos pequenos, es adecuado para anotar grandes volumenes de texto portugues de forma economica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una verificacion de equivalencia funcional con el pipeline de PyTorch (salidas identicas en 19 textos de portugues), no metricas de precision como UAS, LAS o F1 de POS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,8 GB, por lo que el conjunto de modelos ONNX es manejable en memoria, pero no se detalla el consumo por procesador.
- GPU recomendadas: no disponible; al ser modelos pequenos de tipo BiLSTM, la inferencia es viable en CPU.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio, aunque no se aportan cifras oficiales.
- Opciones de despliegue: ONNX Runtime; el pipeline original de Stanza (`stanza.Pipeline`) como referencia; los clientes de `logis-center` mediante `stanza::remote_base` para el formato 2.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qntology/stanza-pt | pt | Pipeline linguistico (tokenize, mwt, pos, lemma, depparse) | ONNX | Apache 2.0 | Hugging Face |
| stanfordnlp/stanza-pt | pt | Pipeline linguistico (original) | PyTorch | Apache 2.0 | Hugging Face, ModelScope |
| Otros modelos Stanza por idioma | varios | Pipeline linguistico | PyTorch/ONNX | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la diferencia principal entre `Qntology/stanza-pt` y `stanfordnlp/stanza-pt` es el formato (ONNX frente a PyTorch), no el modelo subyacente.

## Limitaciones y advertencias

- Solo cubre portugues; no es multilingue.
- No incluye NER ni otras tareas mas alla de las cinco descritas.
- No es un modelo generativo: no sirve para generacion de texto, razonamiento ni agentes.
- Riesgo de errores en texto informal, dominios muy especializados o variedades no representadas en el corpus Bosque.
- No se aportan metricas de precision; la unica validacion publicada es la equivalencia funcional con PyTorch en una muestra pequena (19 textos de portugues).
- El repositorio es una conversion de terceros (Qntology), no una publicacion oficial de Stanford NLP; conviene verificar la procedencia antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- El formato `format2/` esta pensado para clientes concretos de `logis-center`; otros consumidores deben usar los ficheros de la raiz o adaptar la carga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Qntology/stanza-pt
- Modelo original de Stanford NLP: https://huggingface.co/stanfordnlp/stanza-pt
- Copia en ModelScope: https://www.modelscope.cn/models/stanfordnlp/stanza-pt/summary
- Web de Stanza: https://stanfordnlp.github.io/stanza
- Repositorio GitHub de Stanza: https://github.com/stanfordnlp/stanza
- Herramienta de exportacion ONNX: https://github.com/sungu-che/stanza-onnx-export
