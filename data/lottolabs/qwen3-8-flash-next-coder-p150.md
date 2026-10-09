# Lottolabs/Qwen3.8-Flash-Next-Coder-P150

## Resumen

Lottolabs/Qwen3.8-Flash-Next-Coder-P150 es un artefacto de pesos en formato block-float de 4 bits (BFP4) publicado por Lottolabs para ejecutar Qwen3.8-Flash-Next Coder sobre una única tarjeta Tenstorrent Blackhole P150 mediante el backend `tt` (motor `fnx`) del proyecto Strata. No es un modelo autónomo: el repositorio no contiene tokenizer, pesos de atención, embeddings ni LM-head, que se descargan por separado desde un GGUF fijado a una revisión concreta. Lo que aporta son los expertos enrutados de las 48 capas (256 expertos por capa, con matrices gate/up/down) re-cuantizados con GPTQ al formato `bfp4_b` de Tenstorrent, más los 512 expertos de la capa drafter MTP para decodificación especulativa.

El punto de partida es el GGUF IQ1_M de ISTA-DASLab (Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF), que a su vez conserva 256 de los 512 expertos enrutados del modelo base Qwen/Qwen3.8-Flash-Next. Sobre esa selección, Lottolabs aplica una cuantización GPTQ con act-order, damping del 1% y exponente compartido por bloque min-MSE, y genera un plan de colocación (`bfp4-tiered-2.4e+10`) que decide qué expertos residen en la DRAM de la tarjeta y cuáles se leen desde memoria host fijada por PCIe.

Su relevancia es doble: demuestra que un MoE de gran tamaño puede servirse en hardware no-NVIDIA (Tenstorrent Blackhole P150) con una degradación de perplejidad reportada de solo +0.09% frente al GGUF de referencia, y publica de forma reproducible el pipeline completo (`tt/tools/tt_artifacts.py regenerate`) con calibración, cuantización y planificación de memoria. El repositorio ocupa 35,4 GB y consta de 243 archivos, y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer; 48 capas con 256 expertos enrutados por capa (de los 512 del modelo base) mas una capa MTP con 512 expertos. El repositorio contiene unicamente pesos de expertos enrutados y del drafter MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (limite del backend; solo texto) |
| Tipos de cuantizacion | GPTQ con act-order a BFP4 (`bfp4_b` de Tenstorrent), exponente compartido min-MSE por bloque de 16 canales de salida; expertos MTP en BFP4 con exponente min-MSE por bloque; origen IQ1_M (GGUF) |
| Idiomas soportados | no disponible (la model card solo indica "text only") |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | NumPy `.npy` (uint8/int32/int64) con layout de bloques BFP4 `bfp4_b`; no es safetensors ni GGUF |
| Tamano del repositorio | 35,4 GB (243 archivos) |
| Plan de precision y colocacion | `bfp4-tiered-2.4e+10`: todos los expertos en BFP4; 8.680 expertos (24,0 GB) residentes en DRAM, 3.608 en memoria host fijada |

## Arquitectura y entrenamiento

Este repositorio no implica entrenamiento alguno, sino una cuantizacion post-entrenamiento sobre un GGUF ya podado y cuantizado. La cadena es: Qwen/Qwen3.8-Flash-Next (modelo base) → poda de expertos y cuantizacion IQ1_M por ISTA-DASLab, conservando 256 de los 512 expertos enrutados → re-cuantizacion GPTQ a BFP4 por Lottolabs. La calibracion usa 128 secuencias de 2.048 tokens (mas 16 reservadas) con la siguiente composicion: 48 de chat (UltraChat 200k train_sft), 48 de codigo (arboles de fuentes Python, C/C++/CUDA, TypeScript/JavaScript, Rust y Go), 16 instruct (databricks-dolly-15k) y 16 de documentacion (Markdown), disjuntas del conjunto de evaluacion de la puerta de calidad.

El procedimiento tecnico es el siguiente: se ejecuta un forward en float32 con PyTorch sobre los pesos descomprimidos del GGUF, capa por capa, en una RTX 3090 (62 minutos para las 48 capas). Para cada experto se calculan las hessianas de entrada de sus filas enrutadas (gate y up comparten una; para expertos raramente enrutados se usa un prior de media por capa de hasta 8.192 filas). Despues se aplica GPTQ con act-order, damping del 1% y un exponente compartido min-MSE por bloque de 16 valores (recorte -1..2), emitiendo bloques `bfp4_b` bit-exactos para las kernels de tt-metal. Las matrices se almacenan como W^T [in, out] con un exponente compartido por cada 16 canales de salida, en filas uint8 de 921.600 bytes (768 filas por capa: 256 expertos x 3 matrices, con indices en `L{00..47}.b4idx.npy`).

El plan de asignacion se calcula con `fnx.quant.alloc --tiered 2.4e10` a partir de los conteos de enrutamiento de calibracion: los 8.680 expertos mas usados (85,9% de todos los enrutamientos, 24,0 GB) quedan residentes en la DRAM de la P150 y los 3.608 restantes se leen desde memoria host fijada por PCIe durante la ejecucion de las kernels MoE. El drafter MTP se construye a partir de la capa MTP del checkpoint base tal y como la empaqueta Strata (expertos Q2_0), convertida a BFP4 con exponente min-MSE por bloque; su perfil de enrutamiento se obtiene de rondas de borrador sobre texto de calibracion ejecutadas en la propia P150, y los 254 expertos mas calientes permanecen en la DRAM del dispositivo.

## Capacidades

- Generacion de texto autoregresiva, solo texto (sin vision ni audio) y con un limite de contexto de 32.768 tokens.
- Generacion y asistencia sobre codigo: la variante es "Coder" y el pipeline de calibracion cubre Python, C/C++/CUDA, TypeScript/JavaScript, Rust y Go, aunque no se publican resultados de HumanEval ni de otros benchmarks de codigo.
- Razonamiento matematico basico: la model card reporta 45/50 en los primeros 50 problemas de GSM8K ejecutando en la P150.
- Decodificacion especulativa con MTP: capa drafter propia con 512 expertos en BFP4 y perfil de enrutamiento precalculado, que eleva el throughput de ~27-31 tok/s a ~47-51 tok/s.
- Capacidades multilingues: no disponibles. No se documentan idiomas soportados y el unico dato es que el modelo es solo texto.
- Tool calling o function calling: no documentado en la informacion disponible.
- Uso como agente o razonamiento multi-paso: no documentado en la informacion disponible.
- Modo "thinking" o razonamiento extendido explicito: no documentado en la informacion disponible.

## Casos de uso

- Servicio de generacion de codigo sobre hardware Tenstorrent: equipos con una Blackhole P150 que quieran ofrecer autocompletado o generacion de codigo sin depender de GPUs NVIDIA, apoyandose en el backend `tt` de Strata y en el plan de colocacion tiered para encajar el MoE en 24 GB de DRAM mas memoria host.
- Asistente de programacion on-premise con contexto largo: con 32.768 tokens de ventana se puede cargar un modulo completo o varios archivos relacionados y pedir refactors, explicaciones o deteccion de errores sin que el codigo salga de la infraestructura propia.
- Generacion de pruebas unitarias y documentacion tecnica: el modelo esta calibrado parcialmente con documentacion Markdown y con arboles de fuentes de varios lenguajes, lo que lo hace util para producir docstrings, documentacion de API y baterias de tests a partir de fuentes existentes.
- Banco de pruebas de cuantizacion agresiva: el artefacto sirve para estudiar el impacto real de BFP4 y de la poda 256/512 sobre un MoE, comparando con el GGUF original en float32 mediante las metricas de perplejidad, acuerdo top-1 y KL que publica la model card.
- Validacion de decodificacion especulativa en aceleradores: la capa MTP convertida a BFP4 y su perfil de enrutamiento permiten medir el factor de aceleracion real (de ~26,6-30,9 a ~46,9-50,0 tok/s) y ajustar la politica de residentes en DRAM.
- Procesamiento por lotes de tareas de codigo en pipelines internos: generacion masiva de migraciones, adaptaciones de API o traduccion entre lenguajes sobre un corpus de repositorios, aprovechando el throughput sostenido que permiten las kernels de tt-metal en modo trazado.
- Investigacion en compilacion de modelos sobre hardware no convencional: el repositorio documenta el layout de bytes exacto que leen las kernels de la P150, por lo que es material de referencia para quien quiera portar otros MoE a Tenstorrent o reproducir el pipeline completo con `tt/tools/tt_artifacts.py regenerate`.
- Despliegue con requisitos de privacidad estricta: al ser un artefacto on-premise, encaja en entornos donde no se permite enviar codigo ni datos a APIs externas, siempre que se cumplan las condiciones de la licencia Qwen Community 1.0.

## Benchmarks y rendimiento

Puerta de calidad publicada por el autor contra el GGUF de referencia evaluado en float32 (registros de chat, codigo y documentacion con teacher forcing, mas GSM8K):

| Metrica | Resultado en P150 |
|---|---|
| Cambio de perplejidad, todos los registros | +0,09% |
| Cambio de perplejidad, chat | +0,37% |
| Cambio de perplejidad, codigo | -0,18% |
| Acuerdo top-1 | 0,937 |
| Divergencia KL | 0,038 |
| GSM8K, primeros 50 | 45/50 |
| GSM8K, primeros 50 (motor CUDA de Strata en RTX 3090) | 44/50 |

Throughput de decodificacion en una P150, en modo trazado, con prompts de chat, codigo y documentacion:

| Modo | Chat (tok/s) | Codigo (tok/s) | Documentacion (tok/s) |
|---|---|---|---|
| Sin decodificacion especulativa | 30,9 | 29,2 | 26,6 |
| Con decodificacion especulativa MTP | 46,9 | 50,9 | 50,0 |

No se han publicado resultados de MMLU, HumanEval, MBPP u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Inferencia: una tarjeta Tenstorrent Blackhole P150. No es un artefacto para GPU CUDA ni para CPU.
- Memoria del dispositivo: 24,0 GB de expertos en BFP4 residentes en la DRAM de la P150 (8.680 expertos, el 85,9% de los enrutamientos de calibracion).
- Memoria host: los 3.608 expertos restantes se leen desde memoria host fijada por PCIe; hay que reservar espacio fijado adicional para ellos, ademas del GGUF base (tokenizer, atencion, embeddings y LM-head) que descarga Strata y cuyo tamano no se detalla en la informacion disponible.
- Almacenamiento: 35,4 GB para los 243 archivos del repositorio mas el GGUF base.
- GPU de consumo: no es posible la inferencia en GPU de consumo. La RTX 3090 solo aparece en el flujo de regeneracion (se necesita una GPU CUDA con 16 GB o mas; la cuantizacion de las 48 capas tardo 62 minutos en una RTX 3090).
- Opciones de despliegue: exclusivamente el backend `tt` de Strata (motor `fnx`), con los artefactos obtenidos mediante `tt/artifacts.json` y `tt/tools/tt_artifacts.py fetch` en un commit fijado. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Throughput: 26,6-30,9 tok/s sin decodificacion especulativa y 46,9-50,0 tok/s con MTP, segun el tipo de prompt, en modo trazado.
- Latencia por token: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lottolabs/Qwen3.8-Flash-Next-Coder-P150 | no disponible (48 capas x 256 expertos x 3 matrices, 35,4 GB en BFP4) | 32.768 tokens | `.npy` con bloques BFP4 `bfp4_b`; solo Tenstorrent Blackhole P150 con Strata `tt` | qwen-community-1.0 | 0 descargas, 0 likes; repositorio de 35,4 GB |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | no disponible (misma poda 256/512) | no disponible | GGUF IQ1_M; llama.cpp y motores compatibles | Apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | Checkpoint original completo; 512 expertos enrutados | qwen-community-1.0 | Publico en HuggingFace |

En rendimiento, el unico punto de comparacion publicado es GSM8K sobre los primeros 50 problemas: 45/50 con los expertos BFP4 en la P150 frente a 44/50 con el motor CUDA de Strata sobre una RTX 3090, una diferencia de un problema que no permite establecer una ventaja significativa. No hay datos comparativos de MMLU, HumanEval ni de throughput entre las tres variantes.

Un informe de terceros en X (David Hendrickson, @TeksEdge) menciona 34,7 tok/s decodificando Qwen3.8-Flash-Next en una configuracion no especificada; el dato no esta verificado ni detalla hardware, cuantizacion ni prompt, por lo que no debe tomarse como referencia comparable.

## Limitaciones y advertencias

- No es un modelo autonomo. El repositorio no contiene tokenizer, atencion, embeddings ni LM-head; sin el GGUF que descarga Strata y sin el backend `tt`, los archivos no son ejecutables por si solos.
- Compatibilidad restringida: funciona unicamente con el backend `tt` de Strata en una Blackhole P150. No es utilizable en ecosistemas CUDA, ROCm ni CPU.
- Restricciones de licencia: la Qwen Community License 1.0 exige mantener el aviso de copyright y permisos en todas las copias, y su condicion 2 obliga a quien opere un negocio de "Model as a Service" o "AI Work Assistant" a obtener una licencia separada de Qwen antes de usar los pesos o derivados con fines comerciales (queda exceptuado el uso interno que no exponga nada a terceros).
- Cuantizacion agresiva en cadena: se parte de un GGUF IQ1_M ya podado (256 de 512 expertos) y se re-cuantiza a BFP4, por lo que la degradacion acumulada puede ser mayor en dominios alejados del conjunto de calibracion (chat, codigo, instruct y Markdown en ingles, mayoritariamente).
- Evaluacion limitada: la puerta de calidad se apoya en perplejidad, acuerdo top-1, KL y solo los primeros 50 problemas de GSM8K. No hay MMLU, HumanEval ni evaluaciones de seguridad publicadas.
- Idiomas no documentados: la model card solo indica texto; no hay lista de idiomas soportados ni evaluaciones fuera del ingles.
- Riesgo de alucinacion: no se documentan medidas de alineacion, RLHF ni DPO especificas para este artefacto, y al ser una re-cuantizacion tampoco se reevaluan comportamientos de seguridad.
- Cuello de botella potencial de memoria: 3.608 expertos se leen desde memoria host fijada por PCIe en tiempo de ejecucion, lo que puede degradar la latencia en cargas con enrutamiento disperso o prompts poco frecuentes.
- Solo texto y contexto de 32.768 tokens: no admite vision, audio ni ventanas mayores.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificaciones independientes externas.
- Fechas y trazabilidad: los pesos se generaron y evaluaron en octubre de 2026, y el repositorio esta fijado a revisiones concretas de Strata y del GGUF; cambios aguas arriba pueden romper la reproducibilidad de `tt/tools/tt_artifacts.py regenerate`.
- Requisito adicional de infraestructura: la regeneracion completa exige una GPU CUDA con al menos 16 GB, aunque la inferencia no use CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lottolabs/Qwen3.8-Flash-Next-Coder-P150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen (ISTA-DASLab, IQ1_M, Apache-2.0): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Repositorio de Strata (backend `tt`, motor `fnx`): https://github.com/Niko1221/Strata
- Archivo de licencia incluido en el repositorio: LICENSE (Qwen Community License 1.0)
- Informe de terceros sobre velocidad de decodificacion (no verificado, hardware no especificado): https://x.com/TeksEdge/all
