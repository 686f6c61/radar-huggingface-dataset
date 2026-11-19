# hstolte/Qwen3.8-Flash-Next-HTR

## Resumen

Qwen3.8-Flash-Next-HTR es una cuantizacion del modelo Qwen3.8-Flash-Next (desarrollado por el equipo Qwen de Alibaba) realizada por el usuario hstolte bajo el sello HawgAuto, mediante un formato propietario denominado Halo Trellis (HTR). El modelo base es un transformer disperso de tipo Mixture of Experts con 125.000 millones de parametros totales, 6.000 millones activos, 51.000 millones de embeddings n-gram y 4.000 millones adicionales de cabezas MTP (multi-token prediction), con vision integrada. Esta version cuantizada anade un runtime especifico, vLLM HTR v0.2.4, y esta pensada para ejecutarse en hardware AMD Strix Halo (gfx1151, Radeon 8060S) con 128 GB de memoria unificada.

El interes de esta ficha radica en que muestra un caso atipico: no es una cuantizacion estandar (no hay GGUF ni AWQ ni GPTQ), sino un formato cerrado que exige un binario de vLLM parcheado. El checkpoint completo ocupa 173,759 GB, con tablas PLE de 102,4 GB que permanecen en SSD y se cargan bajo demanda. El repositorio de Hugging Face pesa 182,1 GB e incluye varias variantes (Htr5Core como recomendada, Bf16Core como referencia de investigacion).

La release v0.2.4 se centra en mejoras de decodificacion single-stream y en la reparacion del arranque de PLE, sin cambios en pesos, tokenizer ni configuracion. Es, por tanto, una actualizacion de serving, no de modelo. La licencia es qwen-community-1.0, con restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (segun model card: 125B totales, 6B activos, 51B embeddings n-gram, 4B MTP), con vision integrada |
| Parametros totales | 53.986.623.187 en safetensors del repositorio; la model card declara 125B totales con 6B activos para la variante Htr5Core (cifras no coincidentes, ver limitaciones) |
| Parametros activos | 6B (declarado en model card para Htr5Core) |
| Longitud de contexto | 40.960 configurado en las pruebas de v0.2.4; recetas historicas mencionan 262K configurado y hasta 1M en BF16 y 2M/3M/4M con KV cuantizada, no revalidadas en v0.2.4 |
| Tipos de cuantizacion | Formato propietario Halo Trellis (HTR), no compatible con GGUF, AWQ, GPTQ ni bitsandbytes; KV cache INT8 disponible |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors dentro de un layout HTR propietario; requiere runtime vLLM HTR v0.2.4 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos enrutada, disenado para activar solo una fraccion de sus parametros por token (6B de 125B). Incorpora ademas 51.000 millones de parametros en embeddings n-gram (PLE, probablemente "phrase-level embeddings" o similar) que actuan como memoria externa y se cargan desde SSD, y 4.000 millones de parametros en cabezas MTP (multi-token prediction) para decodificacion especulativa. La variante incluye vision, lo que la situa en la categoria de modelos multimodales.

Sobre el entrenamiento del modelo base no hay informacion en la documentacion proporcionada: no se detalla el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO o similar. La model card de esta ficha se limita a describir la cuantizacion y el runtime. La innovacion tecnica destacable de esta release es el runtime HTR: decodificacion K6 para el MoE enrutado a 2-4 filas, WMMA denso en proyecciones de 9-15 filas, y un sistema de cache de filas calientes de PLE opcional con presupuesto de RAM configurable. El formato HTR no es un contenedor estandar; requiere el binario vLLM parcheado publicado en GitHub.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno, con modo "thinking" activable (usado en las pruebas con temperatura 1.0, top-p 0.95, top-k 20).
- Capacidades de vision integradas (declaradas en la model card para Htr5Core).
- Tool calling y function calling: la model card reporta resultados en ToolEval (125/138) y Hermes20 (1850-1950/2000).
- Razonamiento multi-paso y agentes: soportado por el modo thinking y las cabezas MTP para decodificacion especulativa.
- Generacion de codigo: evaluado con HumanEval+ (159-162 sobre 164).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa mediante MTP3 (tres tokens especulativos por paso).
- Cache KV en INT8 para reducir huella de memoria.

## Casos de uso

- Despliegue local en estacion de trabajo AMD Strix Halo: el modelo esta disenado explicitamente para gfx1151 con 128 GB de memoria unificada, lo que permite ejecutar un MoE de 125B en hardware consumer de gama alta sin GPUs dedicadas. Apropiado para investigadores que quieran un modelo grande en local.
- Asistente de codigo en IDE o pipeline CI/CD: con HumanEval+ cercano al techo (162/164) y soporte de tool calling, puede integrarse en flujos de revision de codigo, generacion de tests o refactorizacion asistida, siempre que se acepte la latencia del runtime HTR.
- Agente conversacional con contexto largo: la configuracion de 40.960 tokens (y recetas historicas de hasta 262K) permite gestionar conversaciones multi-turno extensas o documentos largos en un solo contexto, util para atencion al cliente tecnica o analisis de contratos.
- Procesamiento de documentos con vision: al incluir vision, puede extraer informacion de capturas, diagramas o PDFs escaneados en flujos de digitalizacion, aunque la model card no detalla el rendimiento en tareas visuales.
- Evaluacion de modelos y reproducibilidad de investigacion: la variante Bf16Core sirve como referencia en BF16 para comparar el impacto de la cuantizacion HTR frente al modelo original, aunque su serving GPU y contexto maximo no estan cualificados.
- Prototipado de agentes con tool calling: los resultados en ToolEval y Hermes20 indican que el modelo mantiene capacidad de invocar herramientas tras la cuantizacion, adecuado para construir agentes que consulten APIs o bases de datos.
- Experimentacion con decodificacion especulativa: las cabezas MTP3 y el runtime K6 permiten estudiar tecnicas de aceleracion de inferencia en hardware AMD, un nicho poco cubierto por el ecosistema NVIDIA.

## Benchmarks y rendimiento

Los datos disponibles son de la release v0.2.4 y comparan con la release anterior (predecesor), no con otros modelos. Se presentan como "selected-stack screens", no como resultados universales.

| Benchmark | Predecesor | v0.2.4 | Notas |
|---|---|---|---|
| HumanEval+ | 159 / 164 | 162 / 164 | Configuracion 262K, MTP3, INT8 KV, thinking on |
| ToolEval | 125 / 138 | 125 / 138 | Sin cambio |
| Hermes20 | 1850 / 2000 | 1950 / 2000 | Mejora de 100 puntos |
| Throughput single-stream (steady) | 48,05 tok/s | 55,35 tok/s | +15,19% |
| Throughput mixed-prompt (output/full wall) | 34,08 tok/s | 36,41 tok/s | +6,82% |
| Decode mediano mixed-prompt | 48,10 tok/s | 53,83 tok/s | +11,91% |
| Throughput 2 streams (steady) | — | -5,60% | Sin mejora establecida |
| Throughput 3 streams (steady) | — | +2,44% | Sin mejora establecida |
| Throughput 4 streams (steady) | — | +4,14% | Sin mejora establecida |

No se han publicado resultados de MMLU, GSM8K ni comparativas con modelos de la competencia en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Linux sobre AMD Strix Halo / Radeon 8060S (gfx1151), con 128 GB de memoria unificada y SSD local rapido.
- VRAM estimada: no aplica en el sentido tradicional; el modelo usa memoria unificada. El checkpoint completo ocupa 173,759 GB, de los cuales 102,4 GB de tablas PLE permanecen en SSD y se cargan bajo demanda. Debe reservarse memoria para el runtime, KV cache, compilacion y el sistema operativo.
- GPU recomendadas: AMD Strix Halo (unica plataforma cualificada). No hay soporte declarado para A100, H100, RTX 4090 ni otras GPUs NVIDIA en esta release.
- Cabe en consumer GPU: si, en el sentido de que Strix Halo es un APU de consumo profesional; no cabe en GPUs consumer discretas de 24 GB o menos.
- Opciones de despliegue: exclusivamente vLLM HTR v0.2.4 (imagen `ghcr.io/hawgauto/vllm-htr@sha256:cbd537589cc7f2e6e9d73940d5da49a9d956ffbfd795277f54b15787284eeab5`). No es compatible con vLLM estandar, Transformers, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 55,35 tok/s en single-stream steady y 36,41 tok/s en mixed-prompt con la configuracion de pruebas (MTP3, 4 secuencias maximo, contexto 40.960). El arranque en frio de v0.2.2 tardo 446,810 s en modo nativo y 143,003 s en modo seeded; no se garantiza que se repita.
- Almacenamiento: se requiere SSD rapido; las tablas PLE no caben en RAM junto con el resto del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-HTR (esta ficha) | 125B totales, 6B activos (declarado); 53,99B en safetensors | 40.960 configurado (hasta 262K en recetas historicas) | qwen-community-1.0 | HTR propietario | Hugging Face + runtime vLLM HTR |
| Qwen3.8-Flash-Next (base) | 125B totales, 6B activos | No disponible en la informacion | qwen-community-1.0 | safetensors | Hugging Face |
| Bf16Core (variante del mismo repo) | No disponible | No disponible | qwen-community-1.0 | BF16 | Hugging Face (referencia de investigacion) |

No se dispone de datos de benchmarks ni especificaciones de modelos de la competencia (por ejemplo, otros MoE de ~100B) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio repositorio.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 125B totales con 6B activos, pero los safetensors del repositorio suman 53.986.623.187 parametros. Es posible que la cifra de 125B incluya las tablas PLE (51B) y las cabezas MTP (4B) almacenadas por separado, pero no se aclara en la documentacion. Verificar antes de dimensionar infraestructura.
- Formato cerrado: HTR no es GGUF ni ningun estandar abierto. Sin el runtime vLLM HTR v0.2.4 no se puede ejecutar el modelo. Esto crea dependencia de un unico mantenedor (HawgAuto) y de una imagen de contenedor concreta.
- Plataforma unica: solo cualificado para AMD Strix Halo / gfx1151. No hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Bucle de razonamiento conocido: HumanEval/157 entro en bucle con semilla 42 en la configuracion seleccionada, reproducido dos veces. De 44 semillas probadas, una provoco el bucle. No es una estimacion de tasa poblacional ni se afirma que los bucles esten resueltos.
- Sin mejoras multi-stream ni de prefill: los cambios en 2/3/4 streams son pequenos y no estadisticamente concluyentes (-5,60% a +4,14%). No prometer escalado por concurrencia.
- Contexto maximo no revalidado: las cifras de 1M (BF16) y 2M/3M/4M (KV cuantizada) son recetas historicas en imagenes antiguas, no afirmaciones de capacidad de v0.2.4.
- Arranque en frio lento: 446,810 s en modo nativo y 143,003 s en seeded (v0.2.2). La compilacion de nuevas formas puede anadir latencia.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; asumir sesgos hacia ingles y chino por el origen del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM, puede generar contenido plausible pero falso, especialmente en modo thinking con temperatura alta.
- Licencia qwen-community-1.0: etiquetada como "other" en Hugging Face; revisar el archivo LICENSE antes de uso comercial. No se detallan restricciones en la informacion proporcionada.
- Variante Bf16Core: su serving GPU, rendimiento y contexto maximo no estan cualificados; usarla solo como referencia de investigacion.
- Cache de filas calientes PLE desactivada por defecto; activarla consume RAM de CPU adicional.
- Sin datos de sesgos: no hay evaluacion de sesgos publicada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hstolte/Qwen3.8-Flash-Next-HTR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime vLLM HTR v0.2.4: https://github.com/HawgAuto/vllm-htr/releases/tag/htr-v0.2.4
- Codigo fuente del runtime (commit): https://github.com/HawgAuto/vllm-htr/tree/62cb02413de66042cb11c6dc853922618c368887
- Imagen de contenedor: ghcr.io/hawgauto/vllm-htr@sha256:cbd537589cc7f2e6e9d73940d5da49a9d956ffbfd795277f54b15787284eeab5
- Documentacion de variantes: docs/VARIANTS.md (en el repositorio)
- Historial de releases: docs/RELEASES.md (en el repositorio)
- Guia de ejecucion y sampling: docs/RUNNING.md#sampling-for-existing-clients (en el repositorio)
- Tablas de cualificacion v0.2.2: https://github.com/HawgAuto/vllm-htr/blob/main/htr_runtime/releases/v0.2.2/QUALIFICATION.md
- Evidencia de cualificacion v0.2.4: evidence/v0.2.4-release-qualification.json (en el repositorio)
- Paper de referencia citado en tags: arxiv:2406.11235 (no verificado en la informacion proporcionada)
