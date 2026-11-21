# optimatechlabs/ternzip-8b

## Resumen

Ternzip-8b es un paquete de compresión sin pérdida del checkpoint Ternary Bonsai 8B, publicado por Optimatech Labs. No se trata de un modelo nuevo ni de un fine-tune: es una recompresión byte-exacta del GGUF Q2_0 original de Prism ML, empaquetada en un formato propietario (`.trits`) que requiere un cargador específico para su uso. El archive completo ocupa 1.623.736.952 bytes (1,624 GB), frente a los 2.182.184.672 bytes (2,12 GB) del GGUF de Prism, lo que supone un ahorro de 558,45 MB (25,59 %).

El modelo subyacente es Ternary Bonsai 8B, derivado de Qwen3-8B y ternarizado por Prism ML. Al ser una ternarización, los pesos se representan con tres valores posibles, lo que reduce drásticamente el espacio frente a FP16, aunque en este caso el punto de partida ya era un Q2_0 GGUF de 2,12 GB. Ternzip añade una capa de compresión estadística sobre ese checkpoint ya cuantizado.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión sin pérdida aplicada a pesos ternarios; por otro, advierte de que el artefacto publicado no es directamente consumible por las herramientas estándar de inferencia (llama.cpp, vLLM, Ollama). Su uso exige restaurar el GGUF original mediante el loader Ternzip v0.1.0, con CPython 3.14 y Rust estable instalados. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 20 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (derivado de Qwen3-8B, ternarizado por Prism ML); pesos con tres valores posibles |
| Parametros totales | 8B (modelo base Ternary Bonsai 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Ternario con escalas FP16 (formato Q2_0 GGUF); empaquetado propietario `.trits` con compresion rANS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con NOTICE de Prism ML y licencia Qwen de Alibaba Cloud) |
| Formato de pesos | `.trits` (archive Ternzip, 1.624 GB); restaurable a GGUF Q2_0 (2,12 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, Ternary Bonsai 8B, es una ternarizacion de Qwen3-8B desarrollada por Prism ML. Los pesos se almacenan con tres estados posibles y escalas FP16 por bloque, en el formato Q2_0 GGUF. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO durante la ternarizacion.

La innovacion tecnica de esta release no reside en el modelo, sino en el metodo de compresion. Ternzip busca filas y columnas completas que coincidan entre capas seleccionadas, incluso cuando sus indices difieren o sus signos estan invertidos. Esas coincidencias alimentan un codificador entropico rapido basado en rANS, con probabilidades ajustadas especificamente a este checkpoint. La mayoria de tensores almacenan los indices de sus escalas FP16 como diferencias exactas respecto a predicciones de fila y columna. La decodificacion recupera cada peso y cada escala bit a bit, de ahi la calificacion de "sin perdida". El trabajo se apoya en referencias previas como TernaInfer, Intel BITCOS (arXiv:2609.16338), el empaquetado de cinco trits de llama.cpp TQ1_0 y el trabajo de Storer y Helfgott (1997) sobre block matching.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Ternary Bonsai 8B (derivado de Qwen3-8B).
- Razonamiento y codigo: la model card cita ejecuciones de prueba de "story and code runs", lo que indica uso tanto narrativo como de generacion de codigo.
- Inferencia en Apple Silicon: el loader Ternzip esta orientado a ejecucion local en hardware Apple (probado en un M4 Pro).
- Restauracion byte-exacta del GGUF original, con verificacion del SHA-256 publicado por Prism.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Archivado y distribucion de checkpoints ternarios: Ternzip reduce el tamano del GGUF Q2_0 en 558,45 MB (25,59 %), util para almacenar o transferir el modelo con menos ancho de banda, siempre que el destinatario pueda restaurarlo con el loader.
- Verificacion de integridad de pesos: el proceso de restauracion comprueba el SHA-256 publicado por Prism, lo que permite auditar que la recompresion no altero ningun bit del checkpoint original.
- Investigacion en compresion de pesos: el metodo de block matching fila/columna combinado con rANS sirve como banco de pruebas para estudiar compresion sin perdida sobre modelos ternarios.
- Inferencia local en Apple Silicon: con el loader Ternzip v0.1.0, el modelo se ejecuta en un M4 Pro con un tiempo de carga de aproximadamente 19 segundos y una mediana de 61,38 tokens/s de salida en diez ejecuciones greedy.
- Desarrollo de tooling de conversion: sirve como referencia para implementar pipelines `trits` → GGUF dentro de flujos de CI que necesiten validar checkpoints antes de desplegarlos.
- Reproduccion de benchmarks de terceros: permite comparar el rendimiento del GGUF restaurado con el TQ2_0 de 2,12 GB publicado por Minarut, usando el mismo checkpoint de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Los unicos datos de rendimiento publicados son de inferencia, medidos en un Apple M4 Pro con el loader Ternzip v0.1.0:

| Metrica | Valor |
|---|---|
| Tiempo de carga | ~19 s (dependencias ya instaladas) |
| Throughput de salida (mediana, 10 ejecuciones greedy de story y code) | 61,38 tokens/s tras procesamiento del prompt |
| Asignaciones relacionadas con el modelo (incluida reserva) | 1.999.704.327 bytes |
| Memoria fisica del proceso completo tras generacion | 2,99–3,35 GB |
| Tamano del archive `.trits` | 1.623.736.952 bytes (1,624 GB) |
| Tamano del GGUF Q2_0 original | 2.182.184.672 bytes (2,12 GB) |
| Ahorro | 558,45 MB (25,59 %) |

## Requisitos de hardware

- VRAM/RAM estimada: el proceso completo consume 2,99–3,35 GB de memoria fisica en Apple Silicon tras la generacion; las asignaciones ligadas al modelo suman 1.999.704.327 bytes.
- GPU recomendadas: no hay datos para GPU NVIDIA o AMD en la informacion proporcionada; la unica medicion publicada es en Apple M4 Pro.
- Cabe en GPU consumer: no confirmado. El unico entorno validado es Apple Silicon con memoria unificada.
- Opciones de despliegue: el archive `.trits` requiere el loader Ternzip v0.1.0 (CPython 3.14 + Rust estable) para restaurar el GGUF. Una vez restaurado, el GGUF Q2_0 puede usarse con llama.cpp; existe tambien un GGUF TQ2_0 de 2,12 GB publicado por Minarut compatible con llama.cpp. No se documenta soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: ~19 s de carga y 61,38 tokens/s de salida mediana en M4 Pro (ver tabla anterior).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternzip-8b (esta ficha) | 8B (ternario) | `.trits`, 1,624 GB | no disponible | Apache 2.0 | HF, requiere loader Ternzip |
| Ternary Bonsai 8B Q2_0 (Prism ML) | 8B (ternario) | GGUF Q2_0, 2,12 GB | no disponible | Apache 2.0 (con NOTICE) | HF, uso directo con llama.cpp |
| Ternary Bonsai 8B TQ2_0 (Minarut) | 8B (ternario) | GGUF TQ2_0, 2,12 GB | no disponible | no disponible | HF, compatible con llama.cpp |

La comparativa se limita a variantes del mismo checkpoint, ya que no se dispone de datos de rendimiento frente a otros modelos de 8B. Ternzip gana en tamano de almacenamiento (25,59 % menos) pero pierde en usabilidad directa al exigir un loader propio; las dos variantes GGUF son consumibles por llama.cpp sin pasos previos.

## Limitaciones y advertencias

- El archive `.trits` no es un formato estandar: no puede cargarse directamente en llama.cpp, vLLM, Ollama ni TGI. Requiere el loader Ternzip v0.1.0 con CPython 3.14 y Rust estable.
- Es una release no oficial de terceros: Optimatech Labs solo cambio el formato de almacenamiento del checkpoint de Prism ML; no hay validacion independiente de calidad del modelo.
- Licencia: Apache 2.0, pero con obligaciones de atribucion a Prism ML (NOTICE) y a Alibaba Cloud por Qwen3-8B (QWEN-LICENSE). Revisar ambos ficheros antes de uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto; no pueden evaluarse sin restaurar el GGUF y ejecutar pruebas.
- El rendimiento publicado se limita a un Apple M4 Pro; no hay datos de throughput en GPU NVIDIA, AMD ni en CPU x86.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion o validacion por parte de la comunidad.
- La restauracion verifica el SHA-256 de Prism, pero el proceso de decodificacion depende de una implementacion concreta; cualquier divergencia en el loader podria producir un GGUF corrupto sin deteccion temprana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/optimatechlabs/ternzip-8b
- Archive `.trits`: https://huggingface.co/optimatechlabs/ternzip-8b/resolve/main/ternzip-8b.trits
- Checksums: https://huggingface.co/optimatechlabs/ternzip-8b/blob/main/SHA256SUMS
- GGUF original de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-gguf/blob/c2aefbeb4b24469cd11579c3384b990404c17a30/Ternary-Bonsai-8B-Q2_0.gguf
- Repo del loader Ternzip v0.1.0: https://github.com/Optimatech-Labs-LLC/ternzip/tree/v0.1.0
- Benchmark del loader: https://github.com/Optimatech-Labs-LLC/ternzip/blob/v0.1.0/benchmark.json
- GGUF TQ2_0 de Minarut: https://huggingface.co/Minarut/Ternary-Bonsai-8B-GGUF-llamacpp-compatible
- TernaInfer: https://github.com/Gu-J/TernaInfer
- Intel BITCOS (arXiv:2609.16338): https://arxiv.org/abs/2609.16338
- llama.cpp TQ1_0 (PR 8151): https://github.com/ggml-org/llama.cpp/pull/8151
- Storer and Helfgott, 1997: https://doi.org/10.1093/comjnl/40.2_and_3.137
- Licencia Apache 2.0: https://huggingface.co/optimatechlabs/ternzip-8b/blob/main/LICENSE
- NOTICE de Prism: https://huggingface.co/optimatechlabs/ternzip-8b/blob/main/NOTICE.txt
- Licencia Qwen: https://huggingface.co/optimatechlabs/ternzip-8b/blob/main/QWEN-LICENSE.txt
