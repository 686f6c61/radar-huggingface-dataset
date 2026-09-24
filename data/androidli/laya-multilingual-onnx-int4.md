# androidli/laya-multilingual-onnx-int4

## Resumen

`androidli/laya-multilingual-onnx-int4` es una compilacion ONNX cuantizada a 4 bits del checkpoint multilingue `convaiinnovations/laya`, un modelo de decision (no generativo) de 322 millones de parametros construido sobre un encoder ModernBERT-base de 22 capas y 768 dimensiones, mas una cabeza de decision de 2 capas y un vocabulario de 256 000 tokens. El modelo no produce texto libre: recibe un estado y una pregunta, y devuelve respuestas tipadas (una distribucion `choice` con su confianza, un `score` o un `noul`) pensadas para tareas de clasificacion y enrutamiento. La relevancia de esta publicacion concreta esta en el metodo de cuantizacion: es, segun el autor, la primera build ONNX de 4 bits de laya publicada, y la primera que cuantiza la tabla de embeddings de 256 000 entradas.

El resultado tecnico es notable en terminos de tamano: el checkpoint fp32 original ocupa 1288 MB en disco, de los cuales 786 MB (el 61 %) corresponden solo a la tabla de embeddings `[256000, 768]`. Tras la cuantizacion, la build principal queda en 199 MB y la variante mas agresiva en 181 MB, manteniendo (dentro del ruido estadistico de la evaluacion del autor) la precision del modelo fp32 de referencia. Esto la hace apta para inferencia en CPU y para despliegues con restricciones severas de memoria.

El repositorio se distribuye con tokenizer, configuracion del encoder y `rl_agent_config.json` copiados literalmente del modelo base, de modo que el directorio es autocontenido y puede cargarse directamente con `laya.ONNXAgent()`. Requiere el paquete `laya` y `onnxruntime`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) de 22 capas x 768 dimensiones + cabeza de decision de 2 capas; exportado a ONNX (opset 18) |
| Parametros totales | 322 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 weight-only: `MatMulNBits` (block 32, simetrico) para proyecciones lineales y `GatherBlockQuantized` (block 32 o block 128) para el vocabulario |
| Idiomas soportados | multilingual, zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18) con ficheros `.data` auxiliares |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo ModernBERT-base: 22 capas, dimension oculta 768, con un vocabulario de 256 000 tokens (muy amplio, coherente con el soporte multilingue chino-ingles) y una cabeza de decision de 2 capas que transforma la representacion del encoder en respuestas tipadas. El grafo ONNX exportado contiene 145 nodos `MatMul`, de los cuales 96 corresponden a proyecciones con pesos constantes; la embedding de tokens es un nodo `Gather`. Las operaciones de atencion QK^T y softmax·V se mantienen en kernels fp32.

No se dispone de informacion sobre los datos de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO, o cualquier innovacion de entrenamiento. Lo unico documentado es el proceso de cuantizacion aplicado en esta build, que consta de tres pasos reproducibles mediante los scripts incluidos en el repositorio: (1) trazado del `laya.Agent` en PyTorch a ONNX con opset 18; (2) cuantizacion de las proyecciones lineales con `MatMulNBitsQuantizer` (block_size=32, is_symmetric=True), convirtiendo 96 de los 145 nodos `MatMul` en `com.microsoft::MatMulNBits`; y (3) cuantizacion del vocabulario `[256000, 768]` a `com.microsoft::GatherBlockQuantized` con uint4 empaquetado y escalas fp32 por bloque, con zero-point simetrico 8. Este tercer paso es el determinante del ahorro: un `DequantizeLinear` convencional materializaria toda la tabla en fp32 en tiempo de ejecucion, dejando el ahorro solo en disco, mientras que `GatherBlockQuantized` mantiene la tabla empaquetada y desquantiza unicamente las filas consultadas. El efecto neto es que las proyecciones de capa pasan de 501 MB a 83 MB y el vocabulario de 786 MB a 123 MB.

## Capacidades

- Clasificacion y decision sobre un par estado + pregunta: el modelo devuelve una distribucion `choice` sobre etiquetas candidatas junto con un valor de confianza.
- Respuestas tipadas adicionales: `score` (puntuacion) y `noul` (sin etiqueta o clase de rechazo).
- Soporte de instrucciones y criterios por pregunta: la API `predict` acepta, por cada pregunta, un tipo, unas instrucciones en lenguaje natural y un diccionario de criterios con palabras clave asociadas a cada etiqueta.
- Capacidad multilingue limitada a chino e ingles, ademas de la etiqueta generica `multilingual` del modelo base.
- Inferencia en CPU: la build esta optimizada para `onnxruntime` con cuantizacion weight-only, sin requisito de GPU.
- Eleccion entre dos compromisos tamano/precision dentro del mismo repositorio (block 32 o block 128 en el vocabulario).
- No genera texto libre.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso de forma nativa; `system-one` y `decision-model` son etiquetas del autor que describen la naturaleza de clasificacion del modelo.
- No dispone de capacidades de vision, audio, thinking mode ni decodificacion especulativa.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede recibir el texto de una incidencia y una pregunta de tipo `choice` con criterios por area (por ejemplo, facturacion, red, acceso) y devolver la etiqueta mas probable con su confianza, lo que permite dirigir el ticket al equipo correcto sin un LLM generativo.
- Etiquetado automatico de bases de conocimiento: tal como se describe en la evaluacion del autor, cada entrada de una base de conocimiento se clasifica sobre un conjunto cerrado de etiquetas de proyecto reales mas distractores plausibles, usando la confianza devuelta para derivar a revision humana los casos dudosos.
- Filtrado y moderacion de contenido: con una pregunta binaria o de `score`, el modelo puede puntuar si un texto entra dentro de una categoria permitida o prohibida, ejecutandose en CPU a bajo coste dentro de un pipeline de ingest.
- Triaje de consultas en un asistente conversacional: antes de invocar un sistema mayor, laya decide si la consulta corresponde a un dominio conocido (`choice`) o si debe rechazarse (`noul`), reduciendo llamadas innecesarias a modelos generativos.
- Clasificacion de documentos multilingues zh/en: para corpus mixtos en chino e ingles, el vocabulario de 256 000 tokens y el checkpoint multilingue permiten clasificar sin segmentacion previa especifica por idioma.
- Extraccion de senales de scoring: en sistemas de recomendacion o priorizacion, la salida `score` permite ordenar elementos (por ejemplo, urgencia de una incidencia) en lugar de asignar una categoria discreta.
- Despliegue embebido o en el borde: con 199 MB de pesos y 1,20 GB de memoria residente, puede ejecutarse en portatiles, contenedores pequenos o dispositivos sin GPU dedicada dentro de un servicio de clasificacion de baja latencia.
- Validacion de taxonomias: al comparar las distribuciones `choice` de un mismo texto frente a distintos conjuntos de criterios, puede usarse para detectar etiquetas ambiguas o solapadas en un esquema de clasificacion interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si proporciona una evaluacion propia de 60 entradas reales de base de conocimiento, con una unica pregunta `choice` sobre 8 etiquetas de proyecto reales mas 4 distractores plausibles, midiendo la precision de la etiqueta seleccionada frente a la etiqueta que lleva la entrada.

| Build | Precision | Memoria residente | Tamano en disco |
|---|---|---|---|
| fp32 ONNX (referencia) | 0,683 | 1,56 GB | 1288 MB |
| int8 ONNX (dynamic) | 0,600 | 1,22 GB | 310 MB |
| Capas 4-bit blk32 + vocabulario 4-bit blk32 (este repositorio) | 0,700 | 1,20 GB | 199 MB |
| Capas 4-bit blk32 + vocabulario 4-bit blk128 (este repositorio) | 0,683 | 1,14 GB | 181 MB |

El propio autor advierte que, con solo 60 elementos, las diferencias inferiores a unos 6 puntos porcentuales estan dentro del ruido estadistico, y que las builds de 4 bits igualan a la referencia fp32 en esta tarea en lugar de superarla. La build int8, que usa una unica escala por tensor para todo el vocabulario, es la que degrada de forma visible. No se proporcionan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, la build esta pensada para CPU; la memoria residente medida es de 1,20 GB (build blk32) y 1,14 GB (build blk128).
- GPU recomendadas: no se especifica ninguna; al ser un modelo de decision orientado a CPU, no hay requisitos de GPU documentados. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no hay datos de rendimiento.
- Compatibilidad con GPU de consumo: si, cualquier equipo con al menos 1,2 GB de RAM disponible puede ejecutarlo en CPU, incluidos portatiles sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`) como motor de inferencia, junto con el paquete `laya`, que aporta el tokenizer, la gestion de configuracion y el tratamiento de respuestas tipadas. Las opciones de sesion (numero de hilos, nivel de optimizacion de grafo) pueden configurarse construyendo manualmente un `ort.InferenceSession` y asignandolo a `agent.session`.
- Latencia y throughput estimados: no disponible; el fichero `results/onnx_results.json` del repositorio contiene unicamente precision por elemento y no incluye campos de tiempo.
- No es adecuado para stacks de servidor de modelos generativos como vLLM o TGI, ya que el modelo no genera texto.

## Comparativa con modelos similares

Dentro de la misma familia laya y de sus cuantizaciones publicas, la comparacion documentada es la siguiente:

| Modelo / build | Parametros | Contexto | Precision (eval 60 items) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| convaiinnovations/laya multilingue fp32 | 322 M | no disponible | 0,683 | 1288 MB | Apache-2.0 | HuggingFace (base) |
| androidli/laya-multilingual-onnx-int4 (blk32) | 322 M | no disponible | 0,700 | 199 MB | Apache-2.0 | HuggingFace (este repo) |
| androidli/laya-multilingual-onnx-int4 (blk128) | 322 M | no disponible | 0,683 | 181 MB | Apache-2.0 | HuggingFace (este repo) |
| laya int8 ONNX (dynamic) | 322 M | no disponible | 0,600 | 310 MB | Apache-2.0 | publica, referencia del autor |
| Otros formatos de laya (GGUF, CoreML/MLX) | 322 M | no disponible | no disponible | no disponible | Apache-2.0 | publicos segun el autor |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros de la misma categoria (clasificadores de decision de ~300 M de parametros) en la informacion proporcionada, por lo que no es posible una comparacion cruzada con alternativas ajenas a la familia laya.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre, por lo que no puede emplearse en tareas de generacion, resumen o conversacion abierta.
- Evaluacion limitada: la unica medicion de calidad disponible se basa en 60 elementos de un unico tipo de tarea, con un margen de ruido de aproximadamente 6 puntos porcentuales; no hay validacion en dominios distintos.
- Idiomas restringidos: solo se declaran chino, ingles y la etiqueta generica `multilingual`; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- Longitud de contexto no documentada: se desconoce la ventana maxima efectiva del modelo base y de la build ONNX.
- Cuantizacion agresiva del vocabulario: el uso de `GatherBlockQuantized` con bloques de 32 o 128 entradas introduce aproximacion en las representaciones de tokens; aunque el autor reporta precision equivalente a fp32 en su evaluacion, no hay analisis fuera de ese conjunto.
- Degradacion conocida de la build int8: la cuantizacion dinamica int8 con una sola escala por tensor para todo el vocabulario reduce la precision a 0,600, lo que sirve de advertencia sobre los riesgos de esquemas de cuantizacion mal calibrados en este modelo.
- Riesgo de alucinacion y de sobreconfianza: al devolver una distribucion `choice` con confianza, existe el riesgo de asignar etiquetas incorrectas con confianza alta; se recomienda umbralizar y derivar a revision humana los casos de confianza baja.
- Sesgos: no hay informacion publicada sobre sesgos del modelo base ni sobre su comportamiento diferencial por idioma o dominio.
- Dependencia de software: requiere el paquete `laya` (no reexporta `ONNXAgent` en el nivel superior del paquete, segun la model card) y `onnxruntime`; la integracion esta acoplada a la API de ese paquete.
- Estado de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia Apache-2.0: permite uso comercial y modificacion, manteniendo la atribucion al modelo base `convaiinnovations/laya` y conservando la misma licencia en trabajos derivados.

## Enlaces

- Repositorio HuggingFace de esta build: https://huggingface.co/androidli/laya-multilingual-onnx-int4
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Perfil del autor de la build y de las mediciones: https://x.com/greatYiTin
- Repositorio de HuggingFace del autor: https://huggingface.co/androidli
- Paquete `laya` (tokenizer, configuracion y tratamiento de respuestas tipadas; instalable via `pip install laya`; no se proporciona URL directa en la informacion disponible)
- ONNX Runtime (motor de inferencia; no se proporciona URL directa en la informacion disponible)
