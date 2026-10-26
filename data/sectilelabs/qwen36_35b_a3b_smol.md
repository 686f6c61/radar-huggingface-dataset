# SectileLabs/qwen36_35b_a3b_smol

## Resumen

Qwen3.6-35B-A3B es la primera entrega de pesos abiertos de la generacion Qwen 3.6 de Alibaba, publicada el 15 de abril de 2026. Se trata de un modelo de mezcla de expertos (MoE) disperso con 35.000 millones de parametros totales y solo 3.000 millones activos por token, lo que reduce drasticamente el coste de inferencia frente a un modelo denso de tamano equivalente. Incorpora entrada de texto e imagen y una ventana de contexto nativa de 262.144 tokens.

La ficha que nos ocupa, sin embargo, no es el modelo original: es un paquete de cuantizacion publicado por SectileLabs para el motor de inferencia GInfer. Concretamente, una mezcla de 2 bits (SMOL 2-bit mix) que comprime los pesos hasta 14,4 GB en un unico fichero `.ginfer`. El paquete esta pensado para equipos sin GPU NVIDIA, ya que GInfer lo ejecuta sobre el procesador.

Su relevancia es doble: por un lado demuestra que un MoE de 35B con capacidades agenticas de primer nivel (73,4 en SWE-bench Verified, 51,5 en Terminal-Bench 2.0 segun las fuentes disponibles) puede comprimirse hasta 14,4 GB; por otro, evidencia el coste de los formatos propietarios: el paquete solo funciona en GInfer y GChat, no es safetensors ni GGUF y ningun otro runtime puede cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa, transformer multimodal (texto e imagen); detalles de capas y atencion no disponibles |
| Parametros totales | 35.000 millones (modelo base Qwen3.6-35B-A3B) |
| Parametros activos | 3.000 millones por token |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | SMOL 2-bit mix: matrices gate y up de expertos enrutados en 2 bits (calibradas con AutoRound); matrices down de expertos enrutados en 4 bits, salvo capas 0, 4 y 6 en 2 bits; resto de matrices en enteros de 8 bits por grupos |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | `.ginfer` (un unico fichero de 14.446.362.368 bytes, tensor-parallel size 1); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa: 35.000 millones de parametros almacenados de los que solo 3.000 millones se activan por token, lo que situa el coste computacional por token en el orden de un modelo denso de 3B. Incluye una torre de vision (el paquete `.ginfer` conserva sus pesos, aunque GInfer todavia no ejecuta vision sobre este modelo) y soporta modos de razonamiento ("thinking") y no-razonamiento. Los datos concretos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

La innovacion de esta ficha es la cuantizacion, no el entrenamiento. Sectile Labs aplico su propia implementacion del metodo AutoRound para calibrar las matrices gate y up de los expertos enrutados, usando una mezcla de texto web general, libros y codigo fuente; el resto de pesos se convirtieron con redondeo al vecino mas cercano (round-to-nearest). El resultado es una mezcla heterogenea de precisiones (2, 4 y 8 bits) que comprime el modelo hasta 14,4 GB. No se emplearon pesos cuantizados de terceros: la conversion parte de los pesos BF16 oficiales de la revision `995ad96eacd98c81ed38be0c5b274b04031597b0`.

## Capacidades

- Generacion de texto y razonamiento, con modos "thinking" y no-thinking segun el modelo base.
- Codigo y flujos agenticos de linea de comandos: las fuentes citan 73,4 en SWE-bench Verified y 51,5 en Terminal-Bench 2.0 para el modelo sin cuantizar.
- Entrada multimodal de texto e imagen en el modelo base; en este paquete los pesos de vision estan presentes pero GInfer no los ejecuta todavia, por lo que la capacidad visual no esta operativa.
- Contexto largo de hasta 262.144 tokens, adecuado para repositorios completos o conversaciones multi-turno extensas.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible para el modelo base, aunque el perfil agentico que reportan las fuentes lo hace probable; tratar como no verificado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Ejecucion en CPU mediante GInfer y GChat, sin necesidad de GPU NVIDIA.

## Casos de uso

- Desarrollo asistido en estaciones sin GPU: un programador puede ejecutar el paquete en un portatil o servidor solo-CPU mediante GInfer, manteniendo un asistente de codigo con 262K de contexto sin depender de servicios en la nube.
- Revision de repositorios completos: la ventana de 262.144 tokens permite cargar arboles de codigo extensos y hacer preguntas transversales sobre arquitectura, dependencias o deuda tecnica en local.
- Automatizacion de tareas de terminal: dado el rendimiento reportado en Terminal-Bench 2.0, encaja en flujos de agente que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa sobre entornos aislados.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse en CPU y en local, el modelo evita enviar codigo propietario a APIs externas, lo que facilita el cumplimiento en sectores regulados.
- Prototipado y evaluacion de bajo coste: con 14,4 GB en disco y sin GPU, sirve para validar pipelines agenticos o de generacion de codigo antes de comprometer infraestructura mayor.
- Procesamiento por lotes de documentacion tecnica: generacion de resumenes, extraccion de datos y reescritura de textos largos en servidores sin acelerador, donde el throughput no es critico.
- Educacion y experimentacion: permite estudiar el comportamiento de un MoE de 35B en hardware de consumo o laboratorio sin presupuesto para GPUs de datacenter.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base sin cuantizar, no al paquete de 2 bits. No se han publicado mediciones del paquete `.ginfer` en la informacion proporcionada.

| Benchmark | Qwen3.6-35B-A3B (base) |
|---|---|
| SWE-bench Verified | 73,4 |
| Terminal-Bench 2.0 | 51,5 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de calidad tras la cuantizacion en la informacion disponible. Tampoco se dispone de cifras de throughput (tokens/s) para este paquete en CPU.

## Requisitos de hardware

- VRAM: no aplica; el paquete esta disenado para ejecutarse en el procesador, no en GPU.
- RAM: no especificada por el autor; como referencia, el fichero ocupa 14,4 GB, por lo que se necesita al menos esa cantidad de memoria disponible mas el margen del runtime. Cifra exacta no disponible.
- GPU recomendadas: ninguna; GInfer ejecuta este paquete en CPU. No se documenta soporte de aceleracion GPU para este formato.
- GPU de consumo: irrelevante para este paquete concreto; el modelo base en otras cuantizaciones si se ha ejecutado en RTX 3090, RTX 4090, RTX 5070 Ti, dual RTX 5060 Ti y Apple M3 Ultra, segun las fuentes, pero esos datos no aplican al fichero `.ginfer`.
- Opciones de despliegue: exclusivamente GInfer y GChat. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, al no ser safetensors ni GGUF.
- Latencia y throughput: no disponibles. Al ejecutarse en CPU, se espera un rendimiento muy inferior al de una GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SectileLabs/qwen36_35b_a3b_smol (esta ficha) | 35B totales / 3B activos | 262.144 | `.ginfer` (solo GInfer/GChat) | Apache 2.0 | Cuantizacion 2-bit mix en CPU, 14,4 GB |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | 262.144 | Safetensors BF16 | Apache 2.0 | Referencia de calidad; requiere hardware mucho mayor |
| Qwen3.6-35B-A3B-FP8 | 35B totales / 3B activos | 262.144 | FP8 | Apache 2.0 | Cuantizacion oficial de Qwen, calidad casi identica a BF16, pensada para GPU |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime: el fichero solo carga en GInfer y GChat. No hay soporte en vLLM, llama.cpp, Ollama, TGI ni transformers, lo que impide migrar el modelo a otra infraestructura sin reconvertirlo.
- Vision no operativa: los pesos de la torre de vision estan incluidos pero GInfer no los ejecuta todavia, asi que la capacidad multimodal del modelo base no esta disponible en este paquete.
- Degradacion por cuantizacion: no hay evaluaciones publicadas del impacto de la mezcla de 2, 4 y 8 bits sobre SWE-bench, Terminal-Bench u otras tareas; los 73,4 y 51,5 citados corresponden al modelo sin cuantizar y no deben asumirse para este fichero.
- Idiomas no declarados: la model card no especifica la cobertura linguistica del paquete ni del modelo base en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones especificas de fidelidad para esta cuantizacion.
- Sesgos: no documentados por el autor en la informacion proporcionada; el corpus de calibracion (texto web, libros y codigo) puede introducir sesgos propios de esas fuentes.
- Rendimiento en CPU: sin cifras de latencia ni throughput, el uso en produccion con cargas interactivas requiere una evaluacion previa propia.
- Licencia: Apache 2.0 permite uso comercial, pero GInfer no modifica la licencia upstream; conviene revisar el fichero `LICENSE` incluido para los terminos exactos.
- Madurez: cero descargas y cero "likes" en el momento de la consulta, publicacion el 2026-10-26; sin comunidad que valide el paquete.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/SectileLabs/qwen36_35b_a3b_smol
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Articulo sobre el modelo y su coste agentico: https://codex.danielvaughan.com/2026/04/16/qwen36-35b-a3b-local-agentic-coding-breakthrough/
- Guia completa del modelo base: https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
- Guia de despliegue local (VRAM, velocidad, configuracion): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Analisis de capacidades de codigo: https://www.labellerr.com/blog/qwen3-6-35b-a3b-open-source-ai-model/
- Cuantizacion FP8 oficial en Modal: https://modal.com/library/qwen/qwen3-6-35b-a3b-fp8
