# nhatkhangdtp/CKTN-ELECTRA

## Resumen

CKTN-ELECTRA es un codificador de texto (encoder) para tres lenguas minoritarias de Vietnam: cham (cjm), jemer (km) y tay-nung (tyz). Lo publica el autor nhatkhangdtp como checkpoint derivado de `ducanhdinh/CKTN-ELECTRA`, que a su vez es una version de RemBERT con vocabulario ampliado. Se presenta en el articulo *Echoes Across Vietnam's Highlands, Delta, and Coast: A Multilingual Corpus for Cham, Khmer, and Tay-Nung* (arXiv:2607.08362).

El modelo es el discriminador resultante de un preentrenamiento continuado tipo ELECTRA sobre el corpus CKTN, con deteccion de tokens reemplazados calibrada por sistema de escritura. No incluye cabeza de tarea: es un `RemBertModel` puro pensado para extraccion de caracteristicas y ajuste fino posterior en tareas de clasificacion, recuperacion o etiquetado.

Su relevancia radica en cubrir lenguas con muy pocos recursos y con dos sistemas de escritura distintos (latino para cham y tay-nung, jemer para km), algo que los modelos multilingues genericos como mBERT o XLM-R cubren deficientemente. Con 577 millones de parametros y contexto de 512 tokens, es un modelo de tamano medio orientado a representaciones documentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RemBERT (transformer encoder), 32 capas, hidden size 1152, 18 cabezas de atencion, embeddings de entrada de 256 dimensiones |
| Parametros totales | 576.998.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en fp32/fp16) |
| Idiomas soportados | cham (cjm), jemer (km), tay-nung (tyz), nut |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RemBERT: un encoder transformer de 32 capas con hidden size 1152 y 18 cabezas, pero con embeddings de entrada reducidos a 256 dimensiones (frente a las 1152 internas), lo que reduce el coste del vocabulario. El vocabulario es de 254.513 piezas SentencePiece: las 250.300 originales de RemBERT mas 4.213 piezas nuevas para las lenguas CKTN, inyectadas mediante cirugia del modelo Protobuf y inicializadas con Fast Vocabulary Transfer (FVT). El checkpoint parte de `ducanhdinh/CKTN-ELECTRA`.

El entrenamiento es ELECTRA conjunto con un generador de 8 capas que comparte embeddings de token, posicion y segmento con el discriminador, optimizando `L = L_MLM + λ(t) · L_RTD`. Los reemplazos se muestrean de los 64 candidatos mas probables del generador a temperatura 1,25 y se filtran por cuatro criterios: que difieran del token original, que esten bien formados (sin tokens especiales ni piezas de puntuacion, digito o simbolo salvo que el original lo sea), que sean compatibles en escritura (piezas en escritura jemer nunca sustituyen a piezas latinas de cham o tay-nung, y viceversa) y que su similitud coseno de embedding con el original este en [0,15, 0,95]. El peso λ vale 0 en las epocas 1-2, sube linealmente hasta 50 en la epoca 3 y se mantiene fijo en las epocas 4-6. Se optimiza con AdamW, lr 2e-5, warmup del 6 %, weight decay 0,01, gradient clipping 1,0, enmascaramiento del 15 % y batch size de 8.

Los pesos publicados corresponden a la epoca 4, la de mejor F1 de deteccion de tokens reemplazados en desarrollo (RTD F1 0,870, exactitud 0,967). El generador y la cabeza RTD no se incluyen en el repositorio. Los datos de preentrenamiento son el corpus CKTN con 35.492 documentos de entrenamiento (cham 9.184, jemer 22.246, tay-nung 4.062).

## Capacidades

- Extraccion de representaciones contextuales de texto (`feature-extraction`): devuelve `last_hidden_state` de dimension (batch, seq_len, 1152).
- Codificacion de texto en cham, jemer y tay-nung, con vocabulario especifico para las tres lenguas y manejo separado de los sistemas de escritura latino y jemer.
- Base para ajuste fino supervisado en clasificacion de documentos, etiquetado de secuencias y recuperacion de informacion.
- Generacion de embeddings de frase o documento mediante pooling sobre las representaciones (no incluido como cabeza en el checkpoint).
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un encoder.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de documentos en lenguas minoritarias vietnamitas: ajustando una cabeza lineal sobre el encoder se obtienen representaciones documentales utiles para categorizar noticias o textos administrativos en cham, jemer o tay-nung; en el articulo, la clasificacion por categorias alcanza 0,9214 de exactitud frente a 0,1454 de RemBERT sin adaptar.
- Recuperacion de informacion y busqueda semantica: generando embeddings de documento con pooling y usando similitud coseno, el modelo sirve para indexar y recuperar articulos en estas lenguas (MRR@10 de 0,7718 y R@10 de 0,9039 en la evaluacion del paper).
- Etiquetado de secuencias (NER, POS): el encoder de 32 capas puede ajustarse con una cabeza token-level para extraer entidades en textos jemer o cham, aprovechando el vocabulario ampliado.
- Moderacion y filtrado de contenido en plataformas que operan en Vietnam: clasificacion de textos de noticias o comentarios en lenguas minoritarias para deteccion de tematicas.
- Investigacion linguistica computacional: analisis de representaciones y estudios de transferencia entre lenguas de bajos recursos, comparando con mBERT y XLM-R.
- Construccion de datasets y anotacion asistida: uso de los embeddings para agrupar o deduplicar documentos del corpus CKTN y facilitar el etiquetado humano.
- Base para modelos de traduccion o resumen: como encoder en arquitecturas seq2seq para pares jemer-vietnamita o cham-vietnamita, aunque requiere entrenamiento adicional.

## Benchmarks y rendimiento

Resultados del articulo tras preentrenamiento continuado y ajuste fino de 5 epocas a longitud maxima 512:

| Modelo | Exactitud categoria | Macro-F1 categoria | MRR@10 recuperacion | R@10 recuperacion |
|---|---:|---:|---:|---:|
| CKTN-ELECTRA | 0,9214 | 0,7103 | 0,7718 | 0,9039 |
| RemBERT | 0,1454 | 0,0053 | 0,7787 | 0,9049 |
| XLM-R-base | 0,8169 | 0,5617 | 0,7361 | 0,8789 |
| mBERT | 0,8024 | 0,5054 | 0,3794 | 0,4504 |

El propio autor advierte que en recuperacion cada resumen se empareja con su propio articulo, por lo que la tarea premia en gran medida el solapamiento lexico; la clasificacion es la prueba mas representativa de las representaciones a nivel de documento. El checkpoint publicado reporta RTD F1 de 0,870 y exactitud de 0,967 en desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo de pesos, mas activaciones; en fp16 unos 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 con secuencias de 512 tokens; A100, H100 o RTX 4090 para ajuste fino con batches grandes.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas para ajuste fino; para inferencia basta con 4 GB.
- Opciones de despliegue: transformers (libreria nativa), con posibilidad de exportar a ONNX; no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud categoria | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| CKTN-ELECTRA | 577 M | 512 | 0,9214 | Apache 2.0 | Hugging Face |
| RemBERT | no disponible | 512 | 0,1454 | Apache 2.0 | Hugging Face |
| XLM-R-base | no disponible | 512 | 0,8169 | MIT | Hugging Face |
| mBERT | no disponible | 512 | 0,8024 | Apache 2.0 | Hugging Face |

La ventaja de CKTN-ELECTRA es especifica de las tres lenguas objetivo: supera a XLM-R-base y mBERT en clasificacion documental y queda practicamente empatado con RemBERT en recuperacion lexica. Fuera de ese dominio linguistico no esta pensado como sustituto de los modelos multilingues generales.

## Limitaciones y advertencias

- El corpus proviene de medios gubernamentales y estatales, por lo que el registro es formal y periodistico; el rendimiento puede degradarse en lenguaje coloquial, redes sociales o textos literarios.
- Los datos de tay-nung son especialmente escasos (4.062 documentos frente a 22.246 de jemer), lo que limita la calidad de las representaciones en esa lengua.
- Los modelos no han sido auditados para sesgo social; no se han publicado evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion no aplica directamente al no generar texto, pero las representaciones pueden reflejar sesgos del corpus de noticias estatales.
- Contexto limitado a 512 tokens, insuficiente para documentos largos sin truncado o segmentacion.
- No incluye generador ni cabeza RTD, por lo que no puede usarse para las tareas ELECTRA originales sin reentrenamiento.
- El ajuste fino completo con learning rates de 1e-4 o superiores provoco colapso a prediccion constante en las pruebas del autor; se recomienda 2e-5.
- El modelo solo cubre cuatro idiomas (cjm, km, tyz, nut); no es un modelo multilingue general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhatkhangdtp/CKTN-ELECTRA
- Modelo base: https://huggingface.co/ducanhdinh/CKTN-ELECTRA
- Articulo: https://arxiv.org/abs/2607.08362
- Codigo: https://github.com/TracDucAnh/CKTN-ELECTRA
