# qwertz92/granite-speech-5.0-470m-turboctc-multilingual-onnx

## Resumen

`qwertz92/granite-speech-5.0-470m-turboctc-multilingual-onnx` es una conversion comunitaria a ONNX con cuantizacion INT8 dinamica del modelo de reconocimiento automatico del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, en su revision multilingue del 21 de octubre de 2026. No es un lanzamiento oficial de IBM: el autor del repositorio solo cambia el formato de fichero y la precision numerica de los pesos, manteniendo la licencia Apache-2.0 del modelo fuente.

El modelo resuelve transcripcion de voz a texto multilingue con puntuacion y capitalizacion nativas en siete idiomas (ingles, frances, aleman, espanol, portugues, italiano y japones), sin necesidad de indicar el idioma de entrada, ya que lo detecta de forma automatica. Con 470 millones de parametros y una cabeza CTC, esta disenado para inferencia eficiente en CPU mediante onnxruntime, lo que lo hace relevante para despliegues en entornos sin GPU o con recursos limitados.

La relevancia actual del artefacto radica en su empaquetado: un grafo ONNX de 551 MB (frente a los 1,89 GB del grafo FP32 original) que reduce el coste de despliegue aproximadamente a un tercio y triplica la velocidad de inferencia en CPU, con una degradacion de calidad que, segun las mediciones del propio autor, queda por debajo de la resolucion estadistica de su conjunto de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; cabeza CTC sobre encoder de speech (familia Granite Speech de IBM) |
| Parametros totales | 470 M (segun denominacion del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la entrada se define en frames de caracteristicas (minimo 4 frames, `[batch, feature_frames, 320]`) |
| Tipos de cuantizacion | INT8 dinamico per-channel en pesos `MatMul` (QInt8), resto en FP32 |
| Idiomas soportados | Multilingue: en, fr, de, es, pt, it, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); pesos fuente en safetensors |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de IBM con cabeza Connectionist Temporal Classification (CTC) y 470 millones de parametros, entrenado para transcripcion multilingue con puntuacion y capitalizacion nativas. La revision convertida corresponde a la actualizacion multilingue del 21 de octubre de 2026 (revision `91dcb0605daf65f88dbb04fef015c423241d941d`), que amplia el modelo desde una version previa solo en ingles. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion tecnica de este repositorio es la conversion y cuantizacion: el grafo ONNX exportado contiene 163 nodos `MatMulInteger` y 326 inicializadores INT8, mientras que los 49 nodos `MatMul` restantes, las convoluciones, las normalizaciones y el softmax permanecen en coma flotante. La extraccion de caracteristicas (80 bins mel HTK, hop 160, `n_fft` 512, deltas y apilado de dos frames hasta 320 dimensiones) y la decodificacion CTC voraz se ejecutan fuera del grafo. El modelo no acepta mascara de atencion: los clips de distinta longitud deben ejecutarse por separado.

## Capacidades

- Transcripcion de voz a texto en siete idiomas: ingles, frances, aleman, espanol, portugues, italiano y japones.
- Deteccion automatica del idioma: no requiere parametro de idioma de entrada.
- Puntuacion y capitalizacion nativas en la salida.
- Token de control `<|nospeech|>` (id 1) para clips silenciosos, que produce cadena vacia en una decodificacion por defecto.
- Decodificacion CTC voraz externa al grafo (colapsar repeticiones, eliminar blancos, decodificar con `tokenizer.json`; blanco es el id 0, `<unk>`).
- Inferencia por lotes mediante la dimension `batch_size` del tensor de entrada.
- No soporta tool calling, agentes, vision ni audio en streaming como capacidades declaradas en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en equipos multilingues: el modelo detecta el idioma de cada clip de forma automatica, por lo que un mismo pipeline puede procesar intervenciones en espanol, ingles o aleman sin seleccion previa de idioma.
- Subtitulado de contenido audiovisual: la salida con puntuacion y capitalizacion nativas reduce el postprocesado necesario para generar subtitulos legibles en siete idiomas.
- Despliegue en servidores sin GPU: al ejecutarse con onnxruntime en CPU (medido en un AMD Ryzen 5 7600X con un factor de tiempo real de 0,024 en INT8), es adecuado para servicios de transcripcion en hardware de proposito general.
- Procesamiento por lotes de archivos de audio de forma offline: el grafo acepta lotes y clips de distinta longitud ejecutados por separado, lo que encaja en pipelines de transcripcion masiva nocturna.
- Asistentes de voz en aplicaciones de escritorio o edge: el tamano de 551 MB y la cuantizacion INT8 permiten empaquetar el modelo en aplicaciones locales sin dependencia de servicios en la nube.
- Analisis de llamadas de atencion al cliente: la transcripcion multilingue con puntuacion facilita la indexacion y busqueda posterior de conversaciones en varios idiomas.
- Generacion de actas y resumentes a partir de audio: la salida CTC limpia sirve como entrada a un modelo de lenguaje posterior para resumen o extraccion de acciones.

## Benchmarks y rendimiento

Mediciones del autor sobre 25 clips alemanes y 25 ingleses del split de test de FLEURS (CC-BY-4.0; 349,5 s y 233,9 s; 490 y 532 palabras de referencia), con un unico normalizador de texto (minusculas, solo letras y digitos), onnxruntime 1.29.0 con proveedor CPU en un AMD Ryzen 5 7600X (equipo compartido, por lo que los factores de tiempo real son ruidosos):

| Grafo | WER aleman | WER ingles | Factor de tiempo real |
|---|---:|---:|---:|
| INT8 (este repositorio) | 4,27 % | 4,14 % | 0,024 |
| FP32 (misma exportacion) | 3,46 % | 4,70 % | 0,068 |

Segun el autor, aproximadamente cinco palabras equivalen a un punto de WER en este conjunto, por lo que las diferencias entre INT8 y FP32 quedan por debajo de la resolucion de la muestra. La prueba es una muestra pequena de frases leidas y no sustituye a los benchmarks publicados por IBM.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo esta pensado para CPU con onnxruntime. El grafo INT8 ocupa 551.294.349 bytes en disco.
- GPU recomendadas: no especificadas en la informacion disponible; el proveedor medido es CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: onnxruntime (proveedor CPU verificado); otras opciones no disponibles.
- Latencia y throughput: factor de tiempo real de 0,024 en INT8 y 0,068 en FP32 sobre AMD Ryzen 5 7600X con onnxruntime 1.29.0 (medicion ruidosa por equipo compartido).
- Requisito de entrada: tensor `input_features` float32 de forma `[batch_size, feature_frames, 320]`; minimo cuatro frames de caracteristicas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Este repositorio (INT8 ONNX) | 470 M | 7 | ONNX INT8 | Apache-2.0 | Conversion comunitaria; 551 MB; RTF 0,024 en CPU |
| `ibm-granite/granite-speech-5.0-470m-turboctc` (FP32) | 470 M | 7 | safetensors | Apache-2.0 | Modelo fuente oficial de IBM |
| `qwertz92/granite-speech-5.0-470m-turboctc-onnx` | 470 M | 1 (ingles) | ONNX | Apache-2.0 | Exportacion previa solo en ingles, reemplazada por esta |

No se dispone en la informacion proporcionada de comparaciones con modelos ASR de otros fabricantes.

## Limitaciones y advertencias

- Es una conversion comunitaria, no un lanzamiento oficial de IBM; el autor no garantiza paridad con los resultados publicados por IBM.
- La cuantizacion INT8 es con perdida; las mediciones del autor muestran diferencias de WER de hasta 0,81 puntos frente a FP32, aunque dentro del margen de resolucion de su muestra.
- El conjunto de evaluacion es pequeno (25 clips por idioma, frases leidas de FLEURS) y no cubre habla espontanea, ruido ni acentos; no sustituye a benchmarks representativos.
- El grafo no acepta mascara de atencion: los clips de distinta longitud deben ejecutarse por separado, lo que limita el empaquetado eficiente de lotes heterogeneos.
- La extraccion de caracteristicas y la decodificacion CTC deben implementarse fuera del grafo; un error en el preprocesado (80 bins mel HTK, hop 160, `n_fft` 512, deltas, apilado a 320) degrada la salida.
- No se dispone de informacion sobre sesgos por idioma, acento o demografia; el riesgo de alucinacion en ASR se manifiesta como sustituciones o inserciones de palabras, no mitigadas por el formato.
- Licencia Apache-2.0, que permite uso comercial, pero la atribucion del modelo corresponde a IBM; el repositorio solo cambia formato y precision.
- La deteccion automatica de idioma puede confundirse en clips cortos o con cambio de idioma dentro del mismo audio; no hay parametro para forzar el idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qwertz92/granite-speech-5.0-470m-turboctc-multilingual-onnx
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Exportacion previa solo en ingles: https://huggingface.co/qwertz92/granite-speech-5.0-470m-turboctc-onnx
- Revision fuente convertida: `91dcb0605daf65f88dbb04fef015c423241d941d` (actualizacion multilingue del 2026-10-21)
- Conjunto de evaluacion FLEURS (CC-BY-4.0): no se proporciona enlace directo en la informacion disponible
