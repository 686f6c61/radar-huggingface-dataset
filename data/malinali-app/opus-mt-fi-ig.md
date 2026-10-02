# malinali-app/opus-mt-fi-ig

## Resumen

`malinali-app/opus-mt-fi-ig` es un paquete de traducción automática neuronal para inferencia en dispositivo, publicado por el desarrollador malinali-app dentro del proyecto Malinali (malinali.app). Se trata de un reempaquetado del modelo `Helsinki-NLP/opus-mt-fi-ig` del grupo Helsinki-NLP (OPUS-MT), que traduce de finés (fi) a igbo (ig), un par de idiomas de muy bajos recursos. El repositorio no introduce entrenamiento nuevo: la aportación del autor es la conversión de los pesos originales a `safetensors` y de los tokenizadores SentencePiece a JSON de tokenizador rápido de Hugging Face, para poder ejecutarlos con Candle mediante el componente `marian_flutter`.

Arquitectónicamente es un transformer encoder-decoder clásico estilo Marian, con 76.095.320 parámetros totales (unos 304 MB en fp32) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la gama ultraligera. Esto lo hace adecuado para traducción offline en móvil o en entornos sin conectividad, donde no es viable llamar a una API en la nube ni desplegar un modelo multilingüe grande tipo NLLB-200.

Su relevancia actual es doble: por un lado cubre un par lingüístico (finés-igbo) escasamente atendido por los modelos comerciales; por otro, sirve como ejemplo de pipeline de conversión de OPUS-MT a formatos listos para runtime nativo (Candle), lo que facilita integrar traducción local en aplicaciones Flutter. Como contrapartida, el modelo no publica licencia en su propio repositorio, no incluye resultados de benchmarks y su calidad real en igbo dependerá enteramente del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | 76.095.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | fines (fi) como origen, igbo (ig) como destino |
| Licencia | no disponible en el repositorio; el README remite a la licencia del modelo upstream (segun el autor, tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas config.json y dos tokenizadores rapidos JSON |

## Arquitectura y entrenamiento

El modelo es una implementacion Marian de tipo transformer encoder-decoder orientada a traduccion automatica a nivel de frase. El repositorio contiene cuatro archivos declarados como necesarios: `config.json` (configuracion Marian), `model.safetensors` (pesos), `tokenizer-enc.json` (tokenizador rapido del idioma origen, finés) y `tokenizer-dec.json` (tokenizador rapido del idioma destino, igbo). La separacion en dos tokenizadores es caracteristica de los modelos OPUS-MT derivados de SentencePiece, y su conversion a JSON rapido es precisamente lo que habilita su uso con Candle en el componente `marian_flutter`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de ajuste con RLHF o DPO. Al ser un derivado directo de `Helsinki-NLP/opus-mt-fi-ig`, dicha informacion corresponderia a la model card del modelo upstream, que no se ha proporcionado en la documentacion disponible. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras); el modelo se limita a la arquitectura Marian estandar. Lo unico reseñable en el plano tecnico es el reempaquetado para inferencia on-device, que reduce la friccion de integracion en aplicaciones nativas.

## Capacidades

- Traduccion de texto de finés a igbo, a nivel de frase, en una unica direccion (fi → ig). No se declara soporte para la direccion inversa.
- Generacion de texto condicionada a la tarea de traduccion (`text2text-generation`), sin capacidades de instruccion general.
- Compatibilidad con la libreria `transformers` y con el pipeline de traduccion.
- Ejecucion en dispositivo mediante Candle (`marian_flutter`), lo que permite inferencia local sin conexion.
- Tokenizacion rapida preconvertida a JSON para los dos idiomas, evitando dependencias de SentencePiece en tiempo de ejecucion.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo thinking ni generacion de codigo.
- Capacidad multilingue limitada estrictamente al par fi-ig; no se documenta transferencia a otros idiomas.

## Casos de uso

- Traduccion offline en aplicaciones moviles: al ser un modelo de 76 millones de parametros con tokenizadores rapidos y pesos en safetensors, puede empaquetarse dentro de una app Flutter y traducir texto finés-igbo sin conexion ni coste de API, algo critico en regiones con conectividad intermitente.
- Atencion ciudadana y servicios publicos en Finlandia: traduccion de avisos administrativos, formularios o instrucciones sanitarias del finés al igbo para residentes nigerianos de habla igbo, con despliegue local que evita enviar datos personales a terceros.
- Localizacion de documentacion y software: traduccion de cadenas de interfaz, mensajes de error y guias de usuario de productos cuyo idioma fuente es el finés, integrado en pipelines de localizacion como paso previo a revision humana.
- Material educativo y alfabetizacion: generacion de glosarios y materiales bilingues finés-igbo para programas de integracion o escuelas, aprovechando el bajo coste computacional para procesar lotes grandes de frases.
- Preprocesado de corpus para investigacion linguistica: traduccion automatica inicial de colecciones en finés para construir corpus paralelos fi-ig que alimenten investigacion en procesamiento de lenguas de bajos recursos.
- Subtitulado asistido: traduccion frase a frase de subtitulos con marca de tiempo, donde el modelo actua como primera pasada y un revisor humano corrige; el tamano reducido permite procesar horas de subtitulos en CPU.
- Traduccion en dispositivos de borde o sin GPU: por su tamano, puede ejecutarse en Raspberry Pi o telefonos de gama media, habilitando casos de uso en campo (ONG, misiones, comercio local) sin infraestructura cloud.
- Prototipado rapido y evaluacion comparativa: como linea base ligera frente a modelos multilingues grandes, para medir la ganancia real de calidad por parametro en el par fi-ig.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de BLEU, chrF, COMET ni comparaciones cuantitativas, y tampoco se han proporcionado datos de la model card del modelo upstream `Helsinki-NLP/opus-mt-fi-ig`. Cualquier cifra de calidad en este par linguistico deberia obtenerse ejecutando una evaluacion propia sobre un conjunto de validacion fi-ig.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB en fp32 (76 millones de parametros, unos 304 MB de pesos mas activaciones); en fp16 o bfloat16 bajaría a unos 150-250 MB. Son estimaciones a partir del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090 o incluso una GTX 1650 cubren el modelo con amplio margen. Tambien es viable en GPU de datacenter (A100, H100), aunque estan sobredimensionadas para esta carga.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU sin problemas de memoria.
- Opciones de despliegue: `transformers` con pipeline de traduccion; Candle mediante `marian_flutter` (caso de uso declarado por el autor, orientado a Flutter/on-device). No se documenta soporte nativo en vLLM, TGI, llama.cpp ni Ollama, y estos runtimes no estan pensados para arquitecturas Marian encoder-decoder.
- Latencia y throughput estimados: no disponibles. Al no haber mediciones publicadas, solo puede afirmarse cualitativamente que un modelo de 76 millones de parametros es de los mas rapidos dentro de la traduccion neuronal, con latencias de decenas de milisegundos por frase en GPU y de decenas a cientos de milisegundos en CPU movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-ig | 76,1 M | no disponible | fi → ig | no disponible en el repo (remite a upstream) | HuggingFace, safetensors, Candle |
| Helsinki-NLP/opus-mt-fi-ig (upstream) | ~76 M | no disponible | fi → ig | segun el autor, tipicamente CC-BY 4.0 | HuggingFace, transformers |
| Helsinki-NLP/opus-mt-fi-* (otros destinos) | ~76 M por par | no disponible | pares fi-xx | tipicamente CC-BY 4.0 | HuggingFace, transformers |
| NLLB-200 distilled 600M | 600 M | no disponible | mas de 200 idiomas, incluye igbo | CC-BY-NC 4.0 (uso comercial restringido) | HuggingFace, transformers |

La comparacion directa con el modelo upstream es en la practica una identidad de pesos: la diferencia esta en el formato y en el runtime objetivo (safetensors y tokenizadores rapidos para Candle, frente a los artefactos originales). Frente a NLLB-200 distilled, el modelo aqui descrito es unas ocho veces mas pequeno y mucho mas facil de empaquetar en movil, a cambio de una calidad probablemente inferior y de no cubrir mas idiomas que el par fi-ig. Los datos de licencia de NLLB-200 y de los modelos OPUS-MT no se han verificado en la informacion proporcionada y deben confirmarse en sus respectivas model cards antes de un uso comercial.

## Limitaciones y advertencias

- No se publican benchmarks ni evaluacion humana: no hay evidencia cuantitativa de la calidad de traduccion fi-ig en este repositorio.
- El igbo es un idioma de bajos recursos; los corpus OPUS para este idioma tienden a estar dominados por texto religioso y de dominio limitado, lo que puede sesgar el vocabulario y el registro hacia esos dominios.
- Riesgo de alucinacion propio de la traduccion neuronal: el modelo puede producir salidas fluidas pero semanticamente incorrectas, especialmente con frases largas, terminologia tecnica, nombres propios o expresiones idiomaticas.
- Longitud de contexto no documentada: no se especifica el maximo de tokens de entrada, por lo que frases largas pueden truncarse sin aviso.
- Direccion unica fi → ig: no sirve para traducir de igbo a fines ni para ningun otro par.
- Estado de la licencia ambiguo: el repositorio no declara licencia propia y remite a la del modelo upstream; antes de un uso comercial debe verificarse la licencia efectiva de `Helsinki-NLP/opus-mt-fi-ig` y los terminos de atribucion exigidos.
- Repositorio sin senales de adopcion: cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento que garantice actualizaciones.
- Fechas de creacion y actualizacion del repositorio (2026-10-02) resultan anomalas respecto a la fecha actual, lo que aconseja verificar la integridad y procedencia de los artefactos antes de desplegarlos.
- Almacenamiento exclusivo en safetensors: no hay versiones GGUF, ONNX ni cuantizadas publicadas, lo que limita los runtimes compatibles.
- No apto para tareas generativas generales, razonamiento, codigo ni dialogo: es un modelo de traduccion de proposito unico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-fi-ig
- Modelo upstream: https://huggingface.co/Helsinki-NLP/opus-mt-fi-ig
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a servicios de alojamiento de archivos sin relacion con el modelo.
