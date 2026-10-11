# sean-reed/opus-mt-en-es-onnx

## Resumen

Este repositorio contiene una conversion a ONNX del modelo de traduccion automatica Helsinki-NLP/opus-mt-en-es, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. La conversion, publicada por el usuario sean-reed y no afiliada a la universidad, mantiene los pesos originales cuantizados a 8 bits y anade una funcionalidad poco habitual en un modelo de traduccion exportado: la salida de la atencion cruzada de una capa del decoder, que permite alinear palabras entre el texto origen y su traduccion.

El modelo resuelve dos tareas concretas: traduccion de ingles a espanol con decodificacion greedy y alineacion palabra a palabra mediante atencion. La arquitectura es un transformer encoder-decoder de tipo Marian, con un decoder de 6 capas, 8 cabezas de atencion y dimension de cabeza 64. El repositorio ocupa 0,2 GB y esta pensado para ejecucion en CPU con ONNX Runtime, sin necesidad de GPU.

Su relevancia practica esta en el rendimiento y el tamano: la version cuantizada ocupa 159 MB frente a los 581 MB del export fp32, y traduce con una mediana de 49 ms por frase en un procesador de escritorio, aproximadamente un 40 % mas rapido que la version sin cuantizar, manteniendo traducciones identicas a las del original en 60 de 62 frases de prueba. La alineacion de palabras habilita casos de uso como memorias de traduccion, resaltado bilingue o proyeccion de anotaciones entre idiomas, que no cubre una simple API de traduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian; decoder de 6 capas (L=6), 8 cabezas (H=8), dimension de cabeza 64 (D=64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las pruebas documentadas usan frases de 5 a 17 palabras) |
| Tipos de cuantizacion | INT8 en los pesos de todas las multiplicaciones de matrices, en bloques de 32 valores con escala propia (MatMulNBits de ONNX Runtime, accuracy_level 4); tablas de embedding tambien en 8 bits |
| Idiomas soportados | ingles (en) como origen, espanol (es) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx) mas source.spm, vocab.json y model.json |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de traduccion, en la variante Marian empleada por el proyecto OPUS-MT. El repositorio no reentrena nada: parte del modelo Helsinki-NLP/opus-mt-en-es en la revision `5bc4493d463cf000c1f0b50f8d56886a392ed4ab` y lo convierte a ONNX. El decoder se ha exportado como un paso unico de decodificacion greedy: recibe `input_id` [1], `position` [1], `past` [L, 2, H, T, D] y la salida `cross` del encoder, y devuelve `logits` [V], `present` [L, 2, H, T+1, D] y `attention` [S].

La innovacion tecnica del export es precisamente esa salida `attention`: la atencion cruzada de la capa 4 del decoder (contando desde 0), promediada sobre sus cabezas en el momento en que se genera cada token. Sumando esa atencion por los fragmentos SentencePiece que componen cada palabra origen se obtiene una matriz de alineacion palabra a palabra, utilizable para localizar la traduccion de un termino en contexto, como "bank" en "the bank of the river" hacia "orilla". No se detalla en la informacion disponible la composicion del corpus de entrenamiento original, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al proyecto OPUS-MT y no se reproducen en esta conversion.

## Capacidades

- Traduccion de texto de ingles a espanol mediante decodificacion greedy token a token, desde `decoderStartTokenId` hasta `eosTokenId`.
- Extraccion de atencion cruzada del decoder (capa 4, promediada sobre cabezas) para cada token generado.
- Alineacion palabra a palabra entre una palabra inglesa y su equivalente espanola, incluyendo desambiguacion en contexto (por ejemplo, elegir "orilla" y no "banco" para "bank").
- Resaltado de correspondencias bilingues en ambos textos a partir de la matriz de atencion.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de GPU.
- No dispone de soporte de tool calling ni function calling.
- No esta planteado para agentes ni razonamiento multi-paso: es un modelo seq2seq de traduccion.
- Capacidad multilingue limitada estrictamente al par ingles-espanol.
- No incorpora modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Traduccion por lotes en servidores sin GPU: al ejecutarse con ONNX Runtime en CPU y ocupar 159 MB en disco, permite traducir volumenes altos de documentos en maquinas modestas, con una mediana de 49 ms por frase de entre 5 y 17 palabras.
- Memorias de traduccion y herramientas CAT: la alineacion palabra a palabra permite emparejar automaticamente segmentos bilingues ya traducidos y poblar una base de traducciones reutilizables sin intervencion manual.
- Resaltado bilingue en interfaces de lectura: usando la matriz de atencion se puede subrayar en el texto espanol la palabra que corresponde a la palabra inglesa seleccionada por el usuario, util en lectores de articulos o visores de documentacion tecnica.
- Proyeccion de anotaciones entre idiomas: etiquetas de entidades, terminos clave o anotaciones linguisticas marcadas sobre texto ingles pueden transferirse aproximadamente a su traduccion espanola sumando la atencion por palabra origen.
- Preprocesado de corpus para entrenamiento: generacion de pares alineados a nivel de palabra para construir datos de supervision destinados a modelos de alineacion o a sistemas de traduccion asistida.
- Terminologia y glosarios: dada una palabra polisemica en ingles, el modelo devuelve la palabra espanola efectivamente elegida en contexto, lo que sirve para validar o extraer glosarios especificos de dominio.
- Traduccion en despliegues edge o aislados: al no requerir red ni GPU, encaja en dispositivos con CPU x86 y en entornos con restricciones de conectividad, con tiempos maximos observados de 93 ms por frase.
- Traduccion de subtitulos y textos cortos en tiempo casi real: la latencia baja por frase y el modo greedy sin beam search permiten procesar flujos de frases cortas de forma continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU sobre WMT, etc.) en la informacion disponible. El autor si documenta las siguientes evaluaciones internas:

| Prueba | Resultado |
|---|---|
| Traducciones greedy identicas al modelo original (62 frases) | 60/62 |
| Alineacion palabra-palabra en los casos de seleccion del metodo | 60/60 |
| Alineacion palabra-palabra en casos reservados (held-out) | 40/42 |
| Conjunto de evaluacion de alineacion | 102 palabras en 62 frases |

| Version | Tamano | Tiempo mediano por frase | Frase mas lenta |
|---|---|---|---|
| Exportacion fp32 | 581 MB | 84 ms | 165 ms |
| Este modelo (8 bits) | 159 MB | 49 ms | 93 ms |

Las mediciones se realizaron en un AMD Ryzen 5 1600 de seis nucleos con 4 hilos y ONNX Runtime 1.31.0, sobre frases de 5 a 17 palabras.

## Requisitos de hardware

- VRAM para inferencia: no aplica, el modelo esta disenado para ejecucion en CPU.
- GPU recomendadas: no se documenta ninguna; no es necesario acelerador. Cualquier GPU serviria si se adapta el grafo ONNX, pero el autor no lo contempla.
- Caben en GPU de consumo: si, en cualquier GPU de consumo, dado que el modelo pesa 159 MB en 8 bits y 581 MB en fp32, aunque su objetivo declarado es la CPU.
- Despliegue: ONNX Runtime (version 1.31.0 en las pruebas), en CPU con multiples hilos. No aplican vLLM ni llama.cpp, al tratarse de un modelo seq2seq con grafo ONNX personalizado (encoder, decoder por paso, mas source.spm, vocab.json y model.json).
- Latencia: mediana de 49 ms por frase y maximo de 93 ms en el modelo cuantizado, sobre frases de 5 a 17 palabras, con 4 hilos en un Ryzen 5 1600. No se aportan cifras de throughput agregado.
- Memoria en disco: 0,2 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|---|
| Este modelo (sean-reed/opus-mt-en-es-onnx) | no disponible | no disponible | en a es | Apache 2.0 | ONNX INT8 | 159 MB |
| Helsinki-NLP/opus-mt-en-es (original) | no disponible | no disponible | en a es | Apache 2.0 | no disponible en la informacion | no disponible |
| Exportacion fp32 del mismo modelo | no disponible | no disponible | en a es | Apache 2.0 | ONNX fp32 | 581 MB |

Existen otras familias de traduccion de codigo abierto, como NLLB-200 o M2M-100, que cubren muchos mas pares de idiomas, pero la informacion proporcionada no incluye datos de rendimiento, contexto ni licencia de esas alternativas, por lo que no se comparan aqui. No se dispone tampoco de datos de BLEU que permitan situar la calidad de este modelo frente a otros sistemas de traduccion.

## Limitaciones y advertencias

- La alineacion por atencion es aproximada y falla cuando una palabra origen se traduce por varias: el autor cita el caso de "smaller" emparejado con "más" en "más pequeños".
- El metodo de alineacion solo devuelve una unica palabra destino por palabra origen, lo que limita su uso cuando la correspondencia es uno a muchos.
- Las cifras de alineacion (60/60 y 40/42) provienen de un conjunto muy pequeno: 102 palabras en 62 frases, anotadas y revisadas por una sola persona, por lo que deben tomarse como indicacion orientativa.
- La cuantizacion a 8 bits introduce divergencias respecto al original en 2 de 62 frases evaluadas.
- Solo se soporta la direccion ingles a espanol; no hay traduccion inversa ni otros pares idiomaticos.
- El decoder exportado implementa unicamente decodificacion greedy, sin busqueda por haz ni otras estrategias de decodificacion.
- La longitud maxima de contexto no esta documentada y las pruebas se limitan a frases de 5 a 17 palabras, por lo que el comportamiento en textos largos es desconocido.
- No se detallan en la informacion disponible los sesgos del corpus OPUS subyacente ni el riesgo de alucinacion especifico de esta conversion.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion externa ni reportes de terceros.
- La conversion no esta afiliada a la Universidad de Helsinki y no debe atribuirse al equipo original de OPUS-MT.
- Licencia Apache 2.0, igual que el modelo original, lo que permite uso comercial, pero se debe conservar el archivo LICENSE y la atribucion correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sean-reed/opus-mt-en-es-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Proyecto OPUS-MT (Language Technology Research Group, Universidad de Helsinki): https://github.com/Helsinki-NLP/Opus-MT
