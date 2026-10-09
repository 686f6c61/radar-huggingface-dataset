# FluidInference/granite-embedding-30m-sparse-coreml

## Resumen

FluidInference/granite-embedding-30m-sparse-coreml es la conversion a Core ML del codificador sparse `ibm-granite/granite-embedding-30m-sparse` de IBM (revision `ad82b1fd`), el encoder disperso aprendido que da soporte al buscador Evoke de Intelligent Internet. El modelo original lo autoro IBM; Fluid Inference realizo la conversion a `.mlpackage` para ejecucion en Apple Silicon. Se trata de un encoder SPLADE de 30 millones de parametros en fp16, con licencia Apache 2.0, cuyo proposito no es generar texto sino transformar una consulta o un documento en una lista corta de terminos de vocabulario ponderados.

La relevancia practica del modelo esta en su naturaleza dispersa: en lugar de producir un vector denso de embeddings, devuelve un conjunto de terminos con pesos que se pueden volcar directamente en un indice invertido junto a BM25, incluyendo terminos relacionados que el texto no emplea explicitamente. Esto permite busqueda hibrida y recuperacion de informacion de alta calidad sobre infraestructura clasica, sin necesidad de una base de datos vectorial.

La conversion esta optimizada para el Neural Engine de Apple, con cuatro paquetes de forma fija (64, 128, 256 y 512 tokens) de 58 MB cada uno. Segun los datos de la model card, alcanza latencias de 0,74-0,87 ms a 64 tokens en Neural Engine sobre un M5 Pro, con una fidelidad de recuperacion practicamente identica al compilador ONNX de referencia (nDCG@10 de 0,3405 frente a 0,3402 en NFCorpus).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder sparse (estilo SPLADE) sobre un modelo base de 30M de parametros; conversion a Core ML; tokenizador RoBERTa byte-level BPE |
| Parametros totales | 30M (del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (paquetes de 64, 128, 256 y 512; cada paquete tiene forma fija) |
| Tipos de cuantizacion | fp16 en los cuatro paquetes publicados; ponderacion en fp32 en el lado host; existe un build fp32 interno no publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML, generado con coremltools); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una conversion de `ibm-granite/granite-embedding-30m-sparse`, un codificador disperso aprendido de tipo SPLADE con 30 millones de parametros. La entrada se tokeniza con el tokenizador RoBERTa byte-level BPE incluido (`tokenizer.json`), con los tokens especiales `<s>` y `</s>` y relleno a la derecha con `<pad>` (id 1) hasta la longitud del paquete; la mascara de atencion se deriva del propio `<pad>` dentro del grafo. A la salida, el modelo expone los 192 terminos de vocabulario con mayor logit MLM en cualquier posicion de token (max-pooling sobre tokens), ordenados de forma descendente, mediante los tensores `max_logits` (fp16, `[1, 192]`) y `vocab_ids` (int32, `[1, 192]`).

La conversion a Core ML no altera el modelo subyacente, pero traslada parte de la logica al lado host: la ponderacion se aplica en fp32 con la formula `w = log1p(max(v, 0)) ^ gamma × scale` sobre las primeras `active_dims` dimensiones, descartando pesos no positivos. El `config.json` incluye las constantes de Evoke P2.2: las consultas conservan 50 terminos (gamma 1,8519, escala 0,6964) y los documentos 192 (gamma 0,5628, escala 1,0). La puntuacion final es la suma del producto de pesos de consulta por pesos de documento sobre los terminos compartidos. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens, ni sobre el uso de RLHF o DPO en el modelo base original.

La innovacion tecnica de la conversion es el uso de formas fijas de entrada, un paquete por longitud, en lugar de formas enumeradas: segun el autor, las formas enumeradas provocaban que el grafo se ejecutase enteramente en CPU. Con formas fijas, 160 de 172 operaciones se ejecutan en el Neural Engine; la busqueda de tokens, la preparacion de la mascara y el top-k final permanecen en CPU.

## Capacidades

- Codificacion sparse de texto: convierte texto en hasta 192 terminos de vocabulario ponderados, aptos para un indice invertido.
- Expansion semantica de terminos: genera terminos relacionados que el texto no menciona (por ejemplo, "vaccines for seniors" produce vaccine, vaccination, older, elder), util para ampliar la cobertura de una consulta.
- Recuperacion de informacion: funcion de scoring por producto interno disperso entre pesos de consulta y de documento.
- Asimetria consulta/documento: aplica parametros de truncado distintos a consultas (50 terminos) y a documentos (192 terminos).
- Ejecucion en dispositivo: inferencia local en Apple Silicon en Neural Engine, GPU o CPU.
- Integracion con busqueda lexica: los terminos ponderados se indexan junto a BM25 en un indice invertido convencional.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es un modelo de feature-extraction.

## Casos de uso

- Busqueda hibrida BM25 + sparse en aplicaciones Apple: los terminos ponderados se insertan en un indice invertido existente para complementar la busqueda lexica, mejorando el recall sobre consultas con vocabulario distinto al del documento.
- Motor de busqueda con sugerencias en tiempo real (search-as-you-type): la latencia de 0,74-0,87 ms a 64 tokens en Neural Engine permite codificar cada pulsacion de tecla sin bloquear la interfaz.
- Recuperacion de documentos completamente offline en macOS o iOS: el modelo cabe en 58 MB y no requiere red ni servidor, adecuado para aplicaciones con requisitos de privacidad.
- Indexacion local de corpus medianos: segun la model card, codificar los 3.633 documentos de NFCorpus tarda 14,1 s con Core ML en GPU, lo que hace viable indexar decenas de miles de documentos en un portatil.
- Aumento de recuperacion en pipelines RAG embebidos: el encoder genera terminos de expansion que alimentan un indice local antes de pasar los fragmentos a un modelo generativo, sin necesidad de base de datos vectorial.
- Deduplicacion y clustering por solapamiento de terminos: la representacion dispersa permite medir similitud entre documentos mediante la interseccion de sus terminos ponderados, con coste de comparacion bajo.
- Filtrado de candidatos a gran escala: el scoring por producto interno sobre terminos compartidos es barato comparado con la comparacion de embeddings densos, util para un primer paso de recuperacion.
- Integracion en aplicaciones Swift: el envoltorio FluidUse expone `EvokeManager`, el tokenizador RoBERTa en Swift (ids identicos al tokenizador de Python) y la ponderacion en host, con un demo de busqueda `EvokeSearchDemo`.

## Benchmarks y rendimiento

Evaluacion sobre el test de NFCorpus (323 consultas, 3.633 documentos), con producto interno disperso unicamente sobre los terminos semanticos:

| Encoder | nDCG@10 | Recall@100 | Recall@1000 | Mismo top-10 que ONNX |
|---|---:|---:|---:|---:|
| ONNX (distribuido, CPU) | 0,3402 | 0,2956 | 0,5854 | — |
| Core ML fp16, GPU | 0,3405 | 0,2957 | 0,5856 | 99,6 % |
| Core ML fp16, Neural Engine | 0,3405 | 0,2953 | 0,5847 | 98,7 % |

Un build en fp32 (no publicado) reproduce exactamente los conjuntos de terminos del ONNX en 200 de 200 consultas y documentos; las diferencias en fp16 corresponden a terminos de bajo peso en el limite del top-k.

Latencias medidas en un Apple M5 Pro con macOS 27, llamada en caliente (mediana de 100, Swift):

| Longitud | Neural Engine | GPU | CPU |
|---|---:|---:|---:|
| 64 | 0,74-0,87 ms | 2,5-3,3 ms | 2,8-3,1 ms |
| 128 | 1,2-1,4 ms | 1,5-4,3 ms | 4,1 ms |
| 256 | 2,9 ms | 1,9-3,4 ms | 9,5-15 ms |
| 512 | 7,6 ms | 2,6 ms | 16-27 ms |

Recomendacion del autor: Neural Engine hasta 128 tokens y GPU por encima. Tras varios segundos de inactividad, la primera llamada al Neural Engine tarda unos 15 ms.

## Requisitos de hardware

- Plataforma: Apple Silicon exclusivamente (Core ML). Requiere macOS 14 o iOS 17 o superior.
- Tamano en disco: 58 MB por paquete; el repositorio completo ocupa 0,2 GB. Hay que cargar el paquete correspondiente a la longitud de secuencia deseada (64, 128, 256 o 512).
- Memoria: el modelo es lo bastante pequeno para ejecutarse en memoria unificada de cualquier Mac o dispositivo iOS moderno con Apple Silicon; no se especifica un minimo de VRAM en la model card.
- GPU recomendadas: no aplica en el sentido de GPU discretas; el modelo esta pensado para Neural Engine y GPU integrada de Apple Silicon. Los datos de rendimiento corresponden a un M5 Pro.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y en iPhone/iPad compatibles con iOS 17.
- Opciones de despliegue: Core ML mediante coremltools, integrado desde Swift con FluidUse (`EvokeManager`); no se ofrecen variantes para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: 0,74-0,87 ms por codificacion de 64 tokens en Neural Engine; 14,1 s para codificar 3.633 documentos con Core ML en GPU, frente a 88,2 s con ONNX Runtime en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 (NFCorpus) | Formato | Plataforma | Licencia |
|---|---|---|---|---|---|---|
| FluidInference/granite-embedding-30m-sparse-coreml | 30M | 512 | 0,3405 (fp16, GPU y NE) | `.mlpackage` (Core ML) | Apple Silicon | Apache 2.0 |
| Intelligent-Internet/Evoke-Model-Beta-1 (ONNX) | 30M | no disponible | 0,3402 | ONNX | Multiplataforma (CPU) | no disponible en la informacion |
| ibm-granite/granite-embedding-30m-sparse (original) | 30M | no disponible | no disponible | no disponible | Multiplataforma | Apache 2.0 |
| BM25 (referencia lexica) | no aplica | no aplica | no disponible en la informacion | no aplica | Cualquiera | no aplica |

La conversion a Core ML reproduce el comportamiento del compilador ONNX de referencia en recuperacion, con una diferencia de 0,0003 en nDCG@10, y mejora el rendimiento de codificacion masiva en un factor cercano a 6 sobre ONNX Runtime en CPU en el mismo hardware.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta instrucciones, tool calling ni razonamiento; unicamente extrae representaciones dispersas.
- Idiomas soportados: no declarados en la informacion disponible; se desconoce la cobertura multilingue real del modelo base.
- Diferencias por cuantizacion: en fp16, el 1,3 % de las consultas (Neural Engine) y el 0,4 % (GPU) difieren del ONNX en el top-10, debido a terminos de bajo peso en el limite del top-k. Para reproducibilidad exacta de conjuntos de terminos haria falta un build en fp32, no publicado.
- Formas fijas: cada paquete admite una unica longitud de secuencia; secuencias mas largas deben truncarse o asignarse al paquete de 512, y hay que cargar varios paquetes si se necesitan varias longitudes.
- Dependencia de plataforma: requiere Core ML y Apple Silicon; no hay variante para CUDA, ROCm ni CPU x86.
- Primera llamada en frio: tras varios segundos de inactividad, la primera inferencia en Neural Engine tarda aproximadamente 15 ms antes de estabilizarse.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la expansion de terminos puede introducir vocabulario relacionado no presente en el texto, lo que en dominios muy tecnicos o con vocabulario controlado puede degradar la precision.
- Licencia: Apache 2.0, que permite uso comercial. Debe verificarse la licencia del modelo base `ibm-granite/granite-embedding-30m-sparse`, tambien Apache 2.0 segun la informacion disponible.
- Uso en produccion: el modelo depende de constantes de ponderacion externas (`config.json`) que deben respetarse; modificar gamma o escala sin recalibrar altera la puntuacion de recuperacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/granite-embedding-30m-sparse-coreml
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-30m-sparse
- Repositorio Evoke (Intelligent Internet): https://github.com/Intelligent-Internet/Evoke
- Compiladores ONNX de referencia: https://huggingface.co/Intelligent-Internet/Evoke-Model-Beta-1
- Envoltorio FluidUse: https://github.com/FluidInference/FluidUse
- Pull request de la integracion Swift: https://github.com/FluidInference/FluidUse/pull/28
- Directorio de modelos consultado: https://q4km.ai/models/
