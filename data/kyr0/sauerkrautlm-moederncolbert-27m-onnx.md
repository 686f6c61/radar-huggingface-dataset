# kyr0/SauerkrautLM-MoEdernColBERT-27M-ONNX

## Resumen

SauerkrautLM-MoEdernColBERT-27M-ONNX es la exportacion a formato ONNX del modelo de recuperacion VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M, un codificador ColBERT de tipo late-interaction con arquitectura de mezcla de expertos (MoE) y aproximadamente 27 millones de parametros. Lo publica el usuario kyr0 en HuggingFace y su proposito es permitir inferencia en CPU mediante ONNX Runtime en Python, Node.js y navegadores (WASM), allanando el despliegue de recuperacion multi-vector en entornos sin GPU.

El modelo transforma identificadores de tokens en vectores por token de 128 dimensiones normalizados en L2, que se puntuan con el operador MaxSim de ColBERT para comparar una consulta con un pasaje. Frente al checkpoint original en Sentence Transformers, esta version ofrece cinco precisiones (fp32, fp16, q8, int8 y q4) con contratos de paridad definidos entre runtimes, lo que facilita su integracion en pipelines de busqueda semantica multiplataforma.

Es relevante ahora porque los sistemas de recuperacion densa multi-vector suelen requerir GPU; esta exportacion demuestra que un ColBERT-MoE de 27M puede ejecutarse en CPU con tamanos de descarga de entre 18 MB (q4) y 109 MB (fp32), manteniendo la calidad de ranking en la mayoria de las variantes cuantizadas segun las mediciones internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ColBERT con dos capas de atencion y mezcla de expertos (MoE), exportado a ONNX (opset 17) |
| Parametros totales | 27M (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 posiciones maximas (consultas limitadas a 32 posiciones) |
| Tipos de cuantizacion | fp32, fp16, q8 (INT8 pesos, matematicas FP32), int8 (activaciones dinamicas), q4 (MatMulNBits, 4 bits) |
| Idiomas soportados | de, en, es, nl, fr, it, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_fp32.onnx, model_fp16.onnx, model_q8.onnx, model_int8.onnx, model_q4.onnx) |

## Arquitectura y entrenamiento

El modelo base es un codificador ColBERT de late-interaction con dos capas de atencion y capas de mezcla de expertos. Cada grafo ONNX reproduce el checkpoint original reimplementando esas capas con operaciones tensoriales planas y exportandolas con `torch.onnx.export` (opset 17, ejes de batch y secuencia dinamicos). El grafo incluye la cabeza de proyeccion y la normalizacion por token, y produce `token_embeddings` de forma [batch, sequence, 128] con longitud unitaria por token.

La exportacion introduce tres cambios respecto al modelo original, documentados por el autor: se calculan todos los expertos enrutados y las compuertas del router ponderan sus salidas (los resultados coinciden con el upstream, pero el grafo no omite expertos no utilizados); las posiciones se limitan a 512, por lo que no se exporta la atencion de ventana deslizante del modelo original para entradas mas largas; y las variantes cuantizadas almacenan pesos redondeados, mientras el router permanece en FP32 porque errores pequenos en el pueden cambiar que expertos se ejecutan. No se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset) ni si hubo RLHF o DPO.

## Capacidades

- Generacion de embeddings por token para recuperacion densa multi-vector (late interaction).
- Puntuacion consulta-pasaje mediante MaxSim sobre vectores de 128 dimensiones.
- Recuperacion y busqueda semantica multilingue en siete idiomas (de, en, es, nl, fr, it, pt).
- Inferencia en CPU con ONNX Runtime en Python, Node.js y navegadores (WASM).
- Contratos de paridad entre runtimes: los grafos "exact" (fp32, q8, q4) producen los mismos vectores en Python, Node.js y navegador dentro de 0.0001 por valor y 0.001 por puntuacion MaxSim; los grafos "quality" (fp16, int8) dependen de los kernels del runtime.
- Soporte de prefijos `[Q] ` para consultas (32 posiciones fijas con relleno `[MASK]`) y `[D] ` para documentos (hasta 512 posiciones, excluyendo relleno y puntuacion en MaxSim).
- No dispone de generacion de texto, tool calling, razonamiento multi-paso ni capacidades de vision o audio: es exclusivamente un modelo de representacion para recuperacion.

## Casos de uso

- Busqueda semantica en navegador: al ejecutarse con ONNX Runtime WASM, permite indexar y consultar documentos localmente sin enviar datos a un servidor, adecuado para aplicaciones web con requisitos de privacidad.
- Recuperacion aumentada en asistentes sobre CPU: integrado en un pipeline RAG, genera embeddings de pasajes y consultas en servidores sin GPU, reduciendo costes de infraestructura.
- Busqueda multilingue en corpus europeos: cubre aleman, ingles, espanol, neerlandes, frances, italiano y portugues, util para bases documentales con contenido en varias de esas lenguas.
- Filtrado y deduplicacion de documentos: los vectores por token permiten comparar fragmentos y detectar duplicados o near-duplicates en pipelines de ingestion.
- Servicio de recuperacion en Node.js: el contrato de paridad "exact" permite compartir vectores entre servicios Python y Node.js sin discrepancias, simplificando arquitecturas mixtas.
- Despliegue en dispositivos de borde: la variante q4 (18 MB) cabe en entornos con memoria muy limitada, como funciones serverless o aplicaciones de escritorio.
- Clasificacion y clustering de textos cortos: los embeddings normalizados por token sirven para agrupar pasajes o entrenar clasificadores ligeros sobre representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de recuperacion (como BEIR, MIRACL o MTEB) en la informacion disponible. El autor incluye una verificacion de paridad sobre un conjunto de 24 consultas y 24 pasajes en siete idiomas, que describe explicitamente como comprobacion de regresion y no como benchmark de recuperacion:

| Precision | Coseno medio por token | Coseno minimo por token | Mismo top-1 que FP32 | Solapamiento top-5 | Pasaje etiquetado en primera posicion |
|---|---:|---:|---:|---:|---:|
| fp16 | 0.9999 | 0.974 | 24/24 | 1.000 | 24/24 |
| q8 | 0.9991 | 0.933 | 24/24 | 0.992 | 24/24 |
| int8 | 0.9979 | 0.933 | 24/24 | 0.967 | 24/24 |
| q4 | 0.9852 | 0.881 | 24/24 | 0.908 | 24/24 |

El grafo FP32 coincide con el modelo upstream de Sentence Transformers dentro de 8.6e-07 por valor, en casos limite de tokenizacion y formas de batch de hasta 3 x 512 tokens. Estas mediciones se realizaron en macOS-26.7.1-arm64 con Python 3.11.17, ONNX Runtime 1.31.1 y PyTorch 2.6.0.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; no se han publicado requisitos de GPU para estas exportaciones ONNX.
- Memoria en RAM: proporcional al tamano del grafo y al batch; el mayor archivo (fp32) ocupa 108.852.703 bytes y el menor (q4) 18.395.356 bytes.
- GPU recomendadas: no disponible; el modelo esta pensado para CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: no se documenta; al ser un modelo de 27M en ONNX, es plausible su ejecucion en cualquier GPU de consumo via ONNX Runtime, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime en Python, Node.js y navegadores (WASM). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor senala que q8 reduce el tamano de descarga pero no acelera la inferencia ni reduce memoria.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo ni para alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A nivel de categoria, los modelos comparables serian otros codificadores ColBERT multilingues de tamano similar; no se incluyen sus especificaciones por falta de datos en la busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| SauerkrautLM-MoEdernColBERT-27M-ONNX | 27M | 512 | Apache-2.0 | ONNX |
| Alternativas ColBERT multilingues | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto ni razona: es un codificador de recuperacion; usarlo fuera de tareas de similitud o ranking no es adecuado.
- Las consultas estan limitadas a 32 posiciones; los documentos, a 512. Textos mas largos deben dividirse en fragmentos antes de codificarse.
- No se exporta la atencion de ventana deslizante del modelo original, por lo que entradas superiores a 512 posiciones no estan soportadas.
- En las variantes cuantizadas, el router permanece en FP32 para evitar cambios en la seleccion de expertos; aun asi, q4 presenta un coseno minimo por token de 0.881 y un solapamiento top-5 de 0.908 respecto a FP32, lo que puede degradar rankings en casos limite.
- int8 cuantiza activaciones por batch en tiempo de ejecucion, de modo que los vectores de un pasaje dependen ligeramente del resto de pasajes del batch; conviene fijar el batch o cachear por runtime.
- Los grafos "quality" (fp16, int8) producen vectores distintos entre runtimes; deben compararse solo con vectores del mismo runtime y las caches deben indexarse por runtime.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez; al ser un modelo de recuperacion, el riesgo principal es el ranking erroneo de pasajes, no la generacion de contenido falso.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener los avisos de licencia y documentar los cambios realizados respecto al modelo original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion minima y ausencia de validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/kyr0/SauerkrautLM-MoEdernColBERT-27M-ONNX
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M
- Revision del modelo base: `d2b7b1feaaac1bf87510ca9525208c3daeabcc5a`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
