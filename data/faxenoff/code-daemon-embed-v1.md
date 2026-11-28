# faxenoff/code-daemon-embed-v1

## Resumen

code-daemon-embed-v1 es un modelo de embeddings especializado en código, desarrollado por el usuario independiente faxenoff y publicado en Hugging Face bajo licencia MIT. Se trata de un encoder de 4 capas y 46,8 millones de parámetros, destilado a partir de Alibaba-NLP/gte-modernbert-base (22 capas), cuyo objetivo es indexar repositorios completos de código con la suficiente rapidez como para reindexarlos en cada commit. Devuelve vectores de 768 dimensiones con pooling de media y normalización L2 integrados en el grafo, de modo que la salida ya es apta para producto escalar.

El modelo está pensado como la mitad densa de un sistema de búsqueda híbrida (vectores + BM25) sobre unidades cortas de código: firmas, docstrings, nombres de símbolos y descripciones de una línea. Según la model card, alcanza entre 4 y 5,7 veces el throughput de encoders públicos de 768 dimensiones, con unas 3.457 textos por segundo en FP32 sobre ONNX Runtime CUDA, y unas 13.800 entidades por segundo en un índice real de C/C++ con TensorRT INT8. No es multilingüe ni está pensado para prosa general: solo inglés y código, con un límite estricto de 128 tokens.

Su relevancia actual radica en el auge de los agentes de código y de la búsqueda semántica sobre repositorios, donde el coste de reindexación es un cuello de botella real. El modelo incorpora además cuantización INT8 mediante entrenamiento consciente de cuantización (QAT), lo que permite generar motores INT8 en TensorRT y OpenVINO sin pasar por un proceso de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa reducido, 4 capas) |
| Parametros totales | 46.801.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (límite estricto) |
| Tipos de cuantizacion | INT8 (QAT), FP32; pesos en safetensors, ONNX y CoreML |
| Idiomas soportados | Inglés y código; multilingüe solo de forma residual (ruso muy degradado) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, CoreML |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer con 4 capas y 46,8 millones de parámetros, construido sobre una poda del vocabulario de XLM-RoBERTa (se conservaron 942 de las 31.671 piezas cirílicas) y destilado a partir de Alibaba-NLP/gte-modernbert-base, un encoder de 22 capas. La dimensión de embedding es 768. El pooling de media y la normalización L2 están integrados en el grafo, por lo que la salida es directamente un vector de norma unitaria.

El entrenamiento combina destilación de conocimiento desde un cross-encoder de 4B parámetros (Qwen/Qwen3-Reranker-4B según los metadatos del modelo base), cuya capacidad de ranking se incorpora a los vectores del bi-encoder, con entrenamiento consciente de cuantización (QAT) para INT8. La model card menciona también intfloat/multilingual-e5-base y google/embeddinggemma-2 como modelos base de referencia. El modelo se entrenó sobre texto de código "compacto y front-loaded" (tipo, nombre, ruta, firma y primeros ~200 caracteres del docstring), sin prefijos de consulta ni de pasaje. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de embeddings de código y texto corto en un espacio de 768 dimensiones, con salida normalizada lista para producto escalar.
- Búsqueda semántica de código a código y de consulta en lenguaje natural a código.
- Búsqueda híbrida como canal denso junto a BM25 (el autor lo diseñó para ese uso).
- Codificación de firmas, docstrings, nombres de símbolos, rutas de fichero y descripciones de una línea.
- Consultas cortas tipo bolsa de palabras clave o descripciones de comportamiento, sin prefijo.
- Soporte de cuantización INT8 nativa (QAT) para TensorRT y OpenVINO sin calibración.
- Ventanas deslizantes de 128 tokens con stride 96 para textos largos, con pooling de media y renormalización.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Reindexación de repositorios en cada commit: el modelo está diseñado para embeber un repositorio C/C++ de 1,1 millones de entidades en unos 80 segundos en una GPU de portátil, lo que permite mantener el índice actualizado en integración continua sin costes prohibitivos.
- Búsqueda de código en IDE o herramienta interna: con consultas cortas de palabras clave o descripciones de comportamiento, el modelo devuelve el fichero correcto en primer lugar el 44 % de las veces y en el top 5 el 69 % dentro de la búsqueda híbrida para la que fue construido.
- Asistentes de código basados en agentes: sirve como recuperador denso que alimenta el contexto de un LLM, combinado con BM25, con latencia baja gracias a sus 4 capas y a los motores INT8.
- Documentación técnica navegable: indexa docstrings y descripciones de funciones para responder consultas en lenguaje natural sobre qué hace cada símbolo, con un rendimiento especialmente bueno en Python docstring→código (89,8 nDCG@10 en CoIR).
- Búsqueda en bases de código grandes y multilingües de lenguaje: el autor reporta índices completos de mysql-server (C/C++), vscode (TypeScript), netty (Java) y roslyn (C#) con throughputs de 7.900 a 13.800 textos por segundo en TensorRT INT8.
- Despliegue en hardware sin GPU dedicada: con OpenVINO en CPU, iGPU y NPU conjuntamente alcanza unas 1.050 textos por segundo, y en Apple M4 con Neural Engine unas 1.100, lo que permite indexación local en portátiles.
- Filtrado y deduplicación semántica de fragmentos de código en pipelines de datos: la velocidad permite procesar corpus masivos de funciones y comparar similitud por producto escalar.

## Benchmarks y rendimiento

Datos de la model card (nDCG@10 × 100, presupuesto de 128 tokens, ONNX Runtime CUDA FP32, batch 64, seq 64, RTX 5060 de portátil, 2026-09-11):

| Modelo | Capas | Textos/s | cosqa | stack-qa | code→code | Consultas del autor | Ruso hit@1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| code-daemon-embed-v1 | 4 | 3.457 | 28,5 | 49,9 | 42,9 | 60,1 | 0,06 |
| multilingual-e5-base | 12 | 854 | 29,8 | 79,4 | 57,7 | 60,7 | 0,24 |
| CodeRankEmbed | 12 | 723 | 35,5 | 73,3 | — | 64,6 | 0,00 |
| gte-modernbert-base (su profesor) | 22 | 606 | 36,6 | 81,4 | 82,5 | 70,5 | 0,15 |

Rendimiento en índice real (daemon Code-Daemon, RTX 5060 de portátil, TensorRT INT8, 114 W fijados):

| Carga de trabajo | Textos/s |
|---|---:|
| C/C++ — mysql-server, 1,1 M entidades | 13.800 |
| TypeScript — vscode, 479 k | 10.600 |
| Java — netty, 97 k | 8.000 |
| C# — roslyn, 403 k | 7.900 |
| Actualizaciones incrementales pequeñas (cientos a 15 k textos) | 1.900 – 5.500 |
| Sin GPU dedicada — CPU Intel + iGPU + NPU | ~1.050 |
| Apple M4, Neural Engine | ~1.100 |

En cuatro tareas de CoIR el modelo promedia 52,8 nDCG@10, con 89,8 en Python docstring→código y 28,5 en cosqa. El mismo daemon con multilingual-e5-base compilado a los mismos motores INT8 es 2,3 veces más lento en todas las filas.

## Requisitos de hardware

- VRAM: los cuatro motores TensorRT juntos ocupan aproximadamente 400 MB de VRAM; el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 5060 de portátil es la referencia medida por el autor; cualquier GPU NVIDIA con soporte TensorRT o CUDA sirve. No se requieren A100 ni H100.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna e incluso en iGPU Intel y en el Neural Engine de Apple M4.
- Opciones de despliegue: ONNX Runtime (CUDA y CPU), TensorRT (INT8), OpenVINO (CPU, iGPU y NPU), CoreML, y el daemon propio Code-Daemon del autor. El repositorio incluye pesos en safetensors, ONNX y CoreML.
- Throughput: 3.457 textos/s en FP32 con ONNX Runtime CUDA; hasta 19.800 textos/s en el bucket corto (seq 48) con TensorRT INT8 en RTX 5060; 13.800 textos/s en un índice real de C/C++.
- Latencia: en NPU, 28–95 ms por batch, adecuado para consultas interactivas individuales más que para indexación masiva.
- Estrategia de batching: ordenar por longitud y despachar cada batch a su longitud máxima redondeada a múltiplo de 8 aporta un 10 % adicional; aumentar el batch por encima de 96 no mejora el rendimiento por texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Licencia | Enfoque | Throughput relativo |
|---|---|---:|---:|---|---|---:|
| code-daemon-embed-v1 | 46,8 M | 4 | 128 | MIT | Código, híbrido, INT8 QAT | 1,0 (referencia) |
| multilingual-e5-base | ~278 M | 12 | 512 | MIT | Multilingüe general | ~0,25 |
| CodeRankEmbed | no disponible | 12 | no disponible | no disponible | Código | ~0,21 |
| gte-modernbert-base | ~149 M | 22 | 8.192 | Apache 2.0 | Código y texto, vector-only | ~0,18 |

La comparación de calidad está en la tabla de benchmarks: gte-modernbert-base supera al modelo en todas las métricas de recuperación (hasta 82,5 frente a 42,9 en code→code), mientras que code-daemon-embed-v1 gana en velocidad por un factor de 4 a 5,7. multilingual-e5-base es la opción para consultas no inglesas, con un hit@1 en ruso de 0,24 frente a 0,06.

## Limitaciones y advertencias

- No es multilingüe: la poda de vocabulario conservó solo 942 piezas cirílicas de las 31.671 de XLM-R, por lo que las consultas en ruso u otros idiomas no ingleses rinden muy por debajo de multilingual-e5-base.
- No apto para prosa general ni textos largos: el límite es de 128 tokens y el promedio en CoIR es de 52,8 nDCG@10, con resultados flojos en tareas como cosqa (28,5).
- Calidad de recuperación inferior a encoders más grandes: pierde entre 1 y 10 puntos de nDCG en las consultas del autor frente a gte-modernbert-base y queda muy por detrás en code→code (42,9 frente a 82,5).
- Dependencia del formato de entrada: el rendimiento depende de reproducir el formato de documento del entrenamiento (tipo, nombre, ruta, firma, docstring); desviarse de él degrada los resultados más que cualquier ajuste de inferencia.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de recuperaciones irrelevantes cuando la consulta excede el dominio (código corto en inglés) o el presupuesto de tokens.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre código, puede reflejar sesgos de nomenclatura y de los repositorios utilizados.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte; el modelo tiene 173 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- En producción conviene combinarlo con un canal léxico (BM25): el propio autor señala que un reranker en tiempo de ejecución sobre este modelo resultó netamente negativo en el sistema para el que fue diseñado.
- Los pesos en CoreML y ONNX del repositorio ocupan 22,4 GB en total, aunque el modelo en sí es pequeño; hay que seleccionar el artefacto adecuado para cada motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faxenoff/code-daemon-embed-v1
- Modelo profesor: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Modelo base de referencia multilingüe: https://huggingface.co/intfloat/multilingual-e5-base
- Cross-encoder destilado: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Modelo base de referencia: https://huggingface.co/google/embeddinggemma-2
