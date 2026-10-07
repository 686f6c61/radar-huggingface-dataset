# cleyesode/Qwen3.8-Flash-Next-RAZOR-65B-A6B-NVFP4-PLE-MTP-FP8

## Resumen

Este repositorio contiene una version cuantizada del modelo Qwen3.8-Flash-Next-RAZOR-65B-A6B-E256of512, publicado por el usuario cleyesode. Se trata de un modelo de mezcla de expertos (MoE) de la familia Qwen, multimodal (pipeline image-text-to-text), que parte de un pruning del 50 por ciento de expertos realizado por Nickyang mediante la metodologia RAZOR. Sobre esa base, cleyesode aplica una cuantizacion NVFP4 W4A4 a los expertos enrutados, FP8 E4M3 a la tabla PLE, FP8_block al modulo MTP y mantiene el resto de componentes en BF16, con el objetivo de reducir los requisitos de memoria para GPUs Blackwell sm120.

El modelo declara 88.112.611.219 parametros totales en los ficheros safetensors (unos 88,1B) y el sufijo A6B de la nomenclatura apunta a unos 6B de parametros activos por token. El contexto soportado, segun el ejemplo de despliegue vLLM incluido en la model card, alcanza los 200.000 tokens, y el repositorio ocupa 97,4 GB. Los requisitos declarados son aproximadamente 61 GiB de VRAM y 72 GiB de memoria de CPU durante el servicio.

Su relevancia es doble: por un lado demuestra que un MoE de esta escala puede servirse en cuatro GPUs de gama de consumo (RTX 5060 Ti de 16 GB) mediante tensor parallelism y expert parallelism; por otro, sirve como banco de pruebas reproducible de tecnicas de expert pruning y cuantizacion NVFP4. La model card indica que los benchmarks estan en curso y no se han publicado resultados comparativos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con expertos enrutados; componentes citados: QSA indexer, GatedDeltaNet, hyper-connections, PLE (tabla n-gram) y MTP |
| Parametros totales | 88.112.611.219 (unos 88,1B) segun safetensors; la nomenclatura del modelo indica 65B |
| Parametros activos | Aproximadamente 6B (inferido del sufijo A6B; no confirmado explicitamente en la model card) |
| Longitud de contexto | 200.000 tokens (segun `--max-model-len 200000` del ejemplo de serving) |
| Tipos de cuantizacion | Expertos enrutados NVFP4 W4A4 (grupo 16, escalas de bloque FP8, escalas globales FP32); PLE en FP8 E4M3 (una escala por tabla); MTP en FP8_block; resto en BF16; KV cache sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors (libreria transformers) |
| Expertos | 512 expertos en el modelo base (E256of512), con un 50 por ciento podado |
| Tamano del repositorio | 97,4 GB |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-07 |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con enrutado disperso. El modelo base, Nickyang/Qwen3.8-Flash-Next-RAZOR-65B-A6B-E256of512, declara 512 expertos en su nomenclatura (E256of512), de los cuales este repositorio conserva aproximadamente la mitad tras un pruning del 50 por ciento de expertos ejecutado con la metodologia RAZOR. Ademas del bloque MoE, la model card menciona un indice QSA (atencion dispersa), capas GatedDeltaNet (mecanismo de tipo lineal), hyper-connections, una tabla PLE en formato n-gram y un modulo MTP (multi-token prediction) usado como cabeza de decodificacion especulativa. Los tags tambien incluyen `qwen4_exp` y una referencia al paper arXiv:2609.30465.

La cuantizacion se realizo con el flujo `qwen4exp` de NVIDIA Model-Optimizer y se calibro sobre muestras seleccionadas del dataset Nickyang/RazorCal, compuesto por 237 ejemplos distribuidos en coding (57, 24,1 por ciento), matematicas (41, 17,3 por ciento), Chinese-STEM (33, 13,9 por ciento), instruction following (32, 13,5 por ciento), conocimiento del mundo (30, 12,7 por ciento), tool calling (25, 10,5 por ciento) y ciencias STEM (19, 8,0 por ciento). El autor indica que el modelo conserva de forma notable las capacidades previas al pruning y a la cuantizacion, pero no aporta cifras. Respecto a los datos de entrenamiento originales (numero de tokens, composicion del corpus, uso de RLHF o DPO) no hay informacion en la model card. Se menciona que el modulo PLE esta aislado y que el modelo esta shardeado para reducir la presion de memoria, con un informe de verificacion posterior a la cuantizacion disponible en el repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de contexto largo de hasta 200.000 tokens.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text); el encoder de vision se mantiene en BF16.
- Tool calling y function calling, con parser `qwen3_xml` y eleccion automatica de herramienta en vLLM (`--enable-auto-tool-choice`).
- Flujos de agente multi-turno con APIs externas: el dataset de calibracion incluye un 10,5 por ciento de muestras de tool calling (clima, bolsa, comercio electronico).
- Razonamiento matematico y STEM: la calibracion cubre derivaciones de nivel avanzado, problemas tipo AIME, calculo, geometria, fisica, quimica, biologia y termodinamica.
- Generacion y resolucion de problemas de codigo: Python y C++ algoritmicos, programacion competitiva y resolucion de issues de GitHub (categoria mas representada en la calibracion, 24,1 por ciento).
- Seguimiento estricto de instrucciones de formato (limites de palabras, palabras excluidas, letras obligatorias).
- Capacidades multilingues parciales, con presencia de contenidos en chino en el conjunto de calibracion (categoria Chinese-STEM); no se declara oficialmente el listado de idiomas.
- Decodificacion especulativa mediante MTP, con una tasa de aceptacion observada en torno al 67-73 por ciento.
- Modo de razonamiento: el ejemplo de serving activa `--reasoning-parser qwen3`, lo que indica soporte de bloques de razonamiento separados en la salida.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historial extenso gracias a la ventana de 200.000 tokens y encadenar llamadas a APIs de pedidos, stocks o devoluciones mediante tool calling, con el parser XML nativo de Qwen.
- Agente de automatizacion de back-office: integrado en vLLM con `--enable-auto-tool-choice`, puede orquestar tareas de varios pasos sobre herramientas internas (CRM, ERP, ticketing), donde el contexto largo permite arrastrar el estado completo de la tarea sin resumir.
- Asistente de documentacion tecnica multimodal: al aceptar imagen y texto, puede procesar capturas de paneles, diagramas de arquitectura o tablas escaneadas junto a texto de referencia, util para bases de conocimiento internas.
- Copiloto de codigo en pipelines de CI/CD: con la cuantizacion NVFP4 reduciendo el coste de memoria, puede desplegarse como servicio de revision de pull requests, generacion de tests o resolucion de issues, apoyandose en su calibracion en Python y C++.
- Tutoria y generacion de problemas STEM: la calibracion en matematicas y ciencias permite usarlo para resolver y explicar problemas de calculo, geometria o fisica, con salida razonada en bloques separados.
- Procesamiento de documentos largos en chino e ingles: informes, articulos o expedientes de decenas de miles de tokens pueden analizarse en una sola pasada, sin necesidad de chunking agresivo.
- Laboratorio de investigacion en compresion de modelos: sirve como referencia reproducible para medir el impacto real del expert pruning al 50 por ciento combinado con NVFP4, comparando contra las variantes de 96B y 65B publicadas por el mismo autor.
- Despliegue en infraestructura de gama prosumer: el ejemplo oficial con cuatro RTX 5060 Ti de 16 GB demuestra que puede servirse en un nodo de bajo coste con tensor parallelism 4 y expert parallelism, algo poco habitual en modelos de esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "benchmarks in-progress" y no incluye cifras de MMLU, HumanEval, GSM8K ni similares.

Si se incluyen metricas de inferencia (compute-only) con MTP activado y cuantizado a FP8_block, con una tasa de aceptacion en torno al 70 por ciento y una mejora de velocidad declarada de aproximadamente 1,4x sobre prompts reales:

| Tokens de entrada | Tokens de salida | TTFT (ms) | TTFT p99 (ms) | Prefill (tok/s) | TPOT (ms) | ITL p99 (ms) | Decode (tok/s) | Latencia E2E (s) | Aceptacion del draft | Longitud media aceptada |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.006 | 512 | 342 | 423 | 2.946 | 11,0 | 19,2 | 91,1 | 6,0 | 67,0% | 1,67 |
| 8.170 | 512 | 1.997 | 2.174 | 4.091 | 11,0 | 19,4 | 91,2 | 7,6 | 69,1% | 1,69 |
| 32.734 | 512 | 8.019 | 8.598 | 4.082 | 10,6 | 19,3 | 94,6 | 13,7 | 73,3% | 1,73 |
| 65.552 | 512 | 16.280 | 16.375 | 4.026 | 10,8 | 19,6 | 92,2 | 21,9 | 67,5% | 1,67 |
| 127.101 | 512 | 32.10... (dato truncado en la informacion disponible) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM declarada por el autor: aproximadamente 61 GiB para el modelo en servicio.
- Memoria de CPU declarada: aproximadamente 72 GiB (el modelo esta shardeado con `cpu_offload` activado para la configuracion engram).
- Configuracion de referencia: 4 x RTX 5060 Ti de 16 GB (sm120, Blackwell), con `--tensor-parallel-size 4`, `--enable-expert-parallel` y una sola secuencia a 200.000 tokens de contexto.
- Cuantizacion NVFP4 W4A4: requiere GPUs Blackwell con soporte sm120; no es portable a arquitecturas anteriores (Ampere, Ada).
- Opciones de despliegue: vLLM en una rama reciente (no se especifica version estable), con soporte de speculative decoding `mtp`, parseo de razonamiento `qwen3`, parser de tool calling `qwen3_xml`, prefix caching y chunked prefill. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Variables de entorno relevantes para el despliegue: `VLLM_USE_V2_MODEL_RUNNER=1`, `PYTORCH_CUDA_ALLOC_CONF` con `pinned_max_round_threshold_mb:1024` y `VLLM_SPARSE_INDEXER_MAX_LOGITS_MB=256`.
- Rendimiento observado (bajo la configuracion anterior, MTP activado): prefill de 2.946 a 4.091 tok/s, decode de 91,1 a 94,6 tok/s, TPOT en torno a 10,6-11,0 ms y TTFT de 342 ms con 1.006 tokens de entrada.
- Presion de memoria: el repositorio pesa 97,4 GB, por lo que el almacenamiento en disco tambien debe dimensionarse en consecuencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Cuantizacion | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (cleyesode, 65B-A6B NVFP4 PLE MTP FP8) | 88,1B (safetensors) | ~6B | NVFP4 W4A4 + FP8 PLE + FP8_block MTP | FP8_block | qwen-community-1.0 | Publicado en HuggingFace, 0 descargas |
| cleyesode/Qwen3.8-Flash-Next-RAZOR-65B-A6B-NVFP4 | no disponible | ~6B | NVFP4 + FP8 PLE, MTP en BF16 | BF16 | no disponible | Publicado en HuggingFace |
| cleyesode/Qwen3.8-Flash-Next-RAZOR-96B-A6B-NVFP4 | no disponible | ~6B | NVFP4 + FP8 PLE, MTP en BF16 | BF16 | no disponible | Publicado en HuggingFace; pruning al 25 por ciento, menor perdida declarada |
| Nickyang/Qwen3.8-Flash-Next-RAZOR-65B-A6B-E256of512 | no disponible | ~6B | Sin cuantizar (modelo base) | no disponible | no disponible | Publicado en HuggingFace |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas entre estas variantes en la informacion proporcionada; la unica indicacion cualitativa es que la variante de 96B ofrece menor perdida y que la de 65B con MTP en BF16 mantiene la misma perdida a mayor precision.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: la model card indica "benchmarks in-progress", por lo que la afirmacion de "retencion muy impresionante" de capacidades no esta respaldada por numeros verificables.
- Validacion comunitaria minima: 0 descargas y 2 likes en el momento de la consulta, sin evidencia de uso en produccion.
- Licencia `other` con nombre declarado qwen-community-1.0: hay que revisar el texto completo de la licencia de la comunidad Qwen antes de un uso comercial, ya que puede incluir restricciones de atribucion o de despliegue.
- Requisitos de hardware no triviales pese al enfasis en gama de consumo: 61 GiB de VRAM agregada en cuatro GPUs, 72 GiB de RAM de CPU y un total de 97,4 GB en disco.
- Dependencia de hardware Blackwell sm120: la cuantizacion NVFP4 no es ejecutable sin cambios en GPUs Ampere o Ada.
- Dependencia de una rama reciente de vLLM: la model card indica "latest vLLM branch", no una version estable, lo que implica riesgo de incompatibilidades en actualizaciones.
- Discrepancia en el ejemplo de serving: el comando incluido referencia `cleyesode/Qwen3.8-Flash-Next-RAZOR-65B-A6B-NVFP4` (otra variante del autor), no el identificador exacto de este repositorio.
- Metricas truncadas: la tabla de rendimiento se corta en la fila de 127.101 tokens de entrada, sin datos completos para ese escenario.
- Idiomas no declarados: la model card no especifica el listado de idiomas soportados; la presencia de chino solo se deduce del conjunto de calibracion.
- Conjunto de calibracion reducido: 237 muestras en total, con un sesgo claro hacia coding, matematicas y contenido en chino, lo que puede afectar a la fidelidad de la cuantizacion en otros dominios.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion ni evaluacion especifica de factualidad.
- Rendimiento de decodificacion especulativa moderado: una tasa de aceptacion del draft del 67-73 por ciento y una longitud media aceptada de 1,67-1,73 tokens limitan la ganancia de velocidad a aproximadamente 1,4x.
- Impacto del pruning: la eliminacion del 50 por ciento de expertos puede degradar dominios poco representados en la calibracion, aunque no se aportan mediciones por dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cleyesode/Qwen3.8-Flash-Next-RAZOR-65B-A6B-NVFP4-PLE-MTP-FP8
- Modelo base (Nickyang, 65B-A6B-E256of512): https://huggingface.co/Nickyang/Qwen3.8-Flash-Next-RAZOR-65B-A6B-E256of512
- Variante 96B con pruning al 25 por ciento: https://huggingface.co/cleyesode/Qwen3.8-Flash-Next-RAZOR-96B-A6B-NVFP4
- Variante 65B con MTP en BF16: https://huggingface.co/cleyesode/Qwen3.8-Flash-Next-RAZOR-65B-A6B-NVFP4
- Dataset de calibracion RazorCal: https://huggingface.co/datasets/Nickyang/RazorCal
- Informe de verificacion posterior a la cuantizacion: https://huggingface.co/cleyesode/Qwen3.8-Flash-Next-RAZOR-65B-A6B-NVFP4-PLE-MTP-FP8/verification_report.txt
- Paper referenciado en los tags (arXiv:2609.30465): https://arxiv.org/abs/2609.30465
- NVIDIA Model-Optimizer: referenciado en la model card como origen del flujo de cuantizacion `qwen4exp`; no se incluye URL en la informacion disponible
