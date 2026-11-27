# flechin/Qwen3.8-27B-Randean-GGUF

## Resumen

Qwen3.8-27B-Randean-GGUF es la distribucion en formato GGUF del ajuste fino Randean v3.2 sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario flechin. El modelo original (MXFP4) esta pensado para vLLM, ROCm y Blackwell, mientras que esta variante empaqueta los pesos en cuantizaciones listas para llama.cpp, Ollama y LM Studio, incluyendo soporte de vision mediante un proyector multimodal separado (mmproj-BF16.gguf).

El ajuste se orienta explicitamente a lo que el autor denomina "grounding" causal y epistemologico: reducir el exceso de matizaciones vacias ("de-hedged"), mitigar la adulacion al usuario ("anti-sycophancy") y mejorar el uso disciplinado de herramientas en flujos agenticos. Segun la model card, el modelo base cuenta con 26.895.998.464 parametros (aproximadamente 27B) y la variante GGUF conserva la licencia Apache 2.0 del modelo Qwen subyacente.

La relevancia practica esta en que permite ejecutar un modelo de ~27B con vision y tool calling en una unica GPU de 24 GB (cuantizacion Q4_K_M, 16,55 GB) manteniendo, segun el autor, la mayor parte del comportamiento del ajuste original. El repositorio ocupa 204,6 GB e incluye varias cuantizaciones, la matriz de importancia y el proyector de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.5 segun tags del repo; detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de llama-server usa `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (16,55 GB), Q6_K (22,08 GB), Q8_0 (28,60 GB); imatrix incluida para generar IQ4_XS, Q5_K_M y otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto) + mmproj-BF16.gguf (vision) + imatrix.gguf |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.8-27B, un transformer multimodal de aproximadamente 27B parametros que procesa entrada de imagen y texto. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO; solo describe la orientacion del ajuste hacia "reality-aligned", "de-hedged" y "anti-sycophancy", sin especificar metodologia. No se dispone de informacion sobre innovaciones arquitectonicas propias del ajuste.

En el plano de la conversion, el autor indica que los GGUF se exportan mediante dequantizacion streaming bit-exacta desde el MXFP4 original usando el conversor nativo `qwen35` de llama.cpp con `--no-nextn`. La matriz de importancia (`imatrix.gguf`) se recalculo con `llama-imatrix --process-output` sobre 129 chunks (c = 512) de un fichero `calibration_datav3.txt`, partiendo del Q8_0 del propio modelo. El proyector de vision (`mmproj-BF16.gguf`, 931 MB) se exporta directamente desde el encoder visual BF16 sin cuantizar (334 tensores).

## Capacidades

- Generacion de texto y razonamiento con modo de "thinking" (el ejemplo de llama-server usa `--reasoning-format deepseek`).
- Procesamiento de imagenes: pipeline image-text-to-text con soporte de vision via `mmproj-BF16.gguf`.
- Tool calling / function calling estructurado, con integracion Jinja (`--jinja`) en llama.cpp.
- Comportamiento agentico multi-paso, orientado a busqueda web y uso de herramientas en flujos largos.
- Generacion de codigo: el autor reporta 98,75% en HumanEval para la variante MXFP4 canonica.
- Capacidades matematicas y de resolucion de problemas verificadas en el smoke test del autor (3/3 PASS).
- Defensa frente a ambiguedad e inyeccion de prompts segun los benchmarks internos del autor.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente agentico con busqueda web: el ajuste esta calibrado para invocar `web_search` de forma disciplinada (100% en el "Arm 4" de busqueda casual sin pistas, segun el autor), lo que lo hace adecuado para agentes que deciden cuando buscar y cuando responder de memoria.
- Automatizacion de soporte tecnico multi-turno: con 32K de contexto configurable en llama-server y tool calling nativo, puede gestionar conversaciones largas consultando APIs internas de tickets o bases de conocimiento.
- Analisis de documentos con imagenes: al soportar entrada image-text-to-text mediante el proyector BF16, sirve para extraer informacion de capturas, diagramas o formularios escaneados en pipelines documentales.
- Generacion de codigo en local: la cuantizacion Q4_K_M (16,55 GB) cabe en una RTX 4090 o similar y permite integrar el modelo en flujos de autocompletado o revision de PR sin depender de la nube.
- Despliegue en estaciones de trabajo con Apple Silicon: con 32 GB o mas de RAM unificada se puede ejecutar Q4_K_M a traves de Ollama o LM Studio, util para prototipado offline y entornos con requisitos de privacidad.
- Evaluacion de robustez frente a inyeccion de prompts: los benchmarks internos del autor incluyen defensa ante inyeccion al 100%, lo que permite usarlo como sujeto de pruebas en pipelines de red teaming.
- Razonamiento con presupuesto de "thinking" reducido: el autor reporta 57,3% en Terminal-Bench 2.1 con un 52% menos de tokens de pensamiento, adecuado para agentes de terminal con latencia acotada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Modelo / formato | H5 4-Way overall | H5 Arm 4 (busqueda casual) | H5 Arm 4b (no-spam) | Precision Tools Hard (T=0.2) |
|---|---|---|---|---|
| Randean v3.2 Q4_K_M (imatrix) | 88,3% | 100,0% (15/15) | 80,0% | 83,3% (40/48) |
| Randean v3.2 Q6_K (imatrix) | 93,3% | 100,0% (15/15) | 80,0% | 62,5% (30/48) |
| Randean v3.2 Q8_0 | 83,3% | 100,0% (15/15) | 80,0% | 79,2% (38/48) |
| Randean v3.2 MXFP4 (referencia vLLM) | 88,3% | 100,0% (15/15) | 100,0% | 81,3% (39/48) |
| Qwen3.8-27B stock (MXFP4, referencia) | no disponible | no disponible | no disponible | 64,6% (31/48) |

Metricas adicionales de la variante MXFP4 canonica citadas por el autor: 89,3% en "Epistemology Spine", 57,3% en Terminal-Bench 2.1 con un 52% menos de thinking, 65,0% en SWE-bench y 98,75% en HumanEval. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~16,55 GB; Q6_K ~22,08 GB; Q8_0 ~28,60 GB. El proyector de vision anade 931 MB.
- GPU recomendadas: una unica GPU de 24 GB (RTX 4090, A10G, L4 con margen limitado) para Q4_K_M; 32 GB (A100 40GB, RTX A6000, Radeon R9700) para Q6_K; 48 GB o dos GPU de 24-32 GB para Q8_0.
- Compatibilidad consumer: si, Q4_K_M en RTX 4090, RTX 4080 Super (con RAM del sistema como apoyo) y Apple Silicon con 32 GB o mas de memoria unificada; Q6_K requiere 36 GB+ en Apple Silicon.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/flechin/...`), LM Studio; la variante MXFP4 canonica esta pensada para vLLM en ROCm y Blackwell.
- Rendimiento reportado por el autor en una Radeon R9700, single-stream: 29,7 tok/s (Q4_K_M, 1 GPU), 23,8 tok/s (Q6_K, 1 GPU), 17,8 tok/s (Q8_0, 2 GPU).
- Parametros de decodificacion sugeridos por el autor para tool use y codigo: temperature 0,2, top_p 0,95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Randean (este) | ~27B | no disponible (32K en ejemplo) | Apache 2.0 | GGUF, MXFP4 | Ajuste orientado a grounding y anti-sycophancy |
| Qwen3.8-27B stock | ~27B | no disponible | Apache 2.0 | Pesos originales | Base sin ajuste; 64,6% en Precision Tools Hard segun el autor |
| Swift-1.5 | no disponible | no disponible | no disponible | no disponible | Citado como comparativa en la model card del autor |
| Pi | no disponible | no disponible | no disponible | no disponible | Citado como comparativa en la model card del autor |

No se dispone de datos tecnicos suficientes sobre Swift-1.5 ni Pi en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor del ajuste y no han sido verificados de forma independiente; deben tomarse como indicativos.
- No hay informacion sobre sesgos conocidos, composicion del dataset de ajuste ni evaluaciones de seguridad externas.
- Riesgo de alucinacion inherente a un modelo de ~27B; el enfasis del ajuste en "grounding" no elimina este riesgo.
- El rendimiento en tareas generales (MMLU, GSM8K, multilingue) no esta documentado en la informacion disponible.
- El ejemplo de contexto de 32K en llama-server no confirma la ventana nativa del modelo; conviene verificar la longitud real antes de disenar aplicaciones con contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen y del derivado `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`; conviene revisar las condiciones de ambos.
- El repositorio ocupa 204,6 GB, lo que exige planificacion de almacenamiento si se descargan todas las cuantizaciones.
- El proyecto tiene un unico like y 233 descargas en el momento de la ficha, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/flechin/Qwen3.8-27B-Randean-GGUF
- Modelo canonico MXFP4: https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo cuantizado de referencia: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Demo ZeroGPU: https://huggingface.co/spaces/flechin/randean
- Releases previas: https://huggingface.co/flechin/Qwen3.8-27B-Randean-GGUF/tree/v3.1b y https://huggingface.co/flechin/Qwen3.8-27B-Randean-GGUF/tree/v3.0-arm-b
