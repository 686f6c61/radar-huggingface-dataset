# MeganEFlynn/Qwen3-4B-LiLiCorr-b16-regen-100k

## Resumen

Qwen3-4B-LiLiCorr-b16-regen-100k es un modelo borrador (draft model) de 5 capas disenado especificamente para decodificacion especulativa con el verificador Qwen/Qwen3-4B. No es un modelo de lenguaje autonomo: es un componente auxiliar que propone tokens candidatos que el modelo grande verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del verificador. Lo desarrolla MeganEFlynn y se publica bajo licencia Apache 2.0.

La arquitectura LiLiCorr toma las capas 2, 10, 18, 26 y 34 del verificador Qwen3-4B (36 capas, hidden 2560) y opera con un tamano de bloque de 16, lo que permite proponer hasta 15 tokens especulativos por paso. El modelo tiene 569,4 millones de parametros en float32 y un repo de 2,3 GB. Se entreno durante 1 epoca (16.272 pasos, ~216M tokens) sobre 100k conversaciones muestreadas de los subconjuntos perfectblend de Qwen3-8B-Regenerated-Collection.

Su relevancia es practica: la aceptacion medida en despliegue vLLM con 15 tokens especulativos alcanza longitudes de aceptacion de 4,29 en HumanEval (temp 1) y 5,40 en math_reasoning, lo que se traduce en aceleracion directa de la inferencia del verificador en cargas de codigo y razonamiento matematico. Requiere una build de vLLM con soporte de LiLiCorr/dflash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LiLiCorr draft model (5 capas, capas del verificador [2, 10, 18, 26, 34]) |
| Parametros totales | 569.467.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del verificador Qwen3-4B) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float32) + custom_code (config.py, LiLiCorrDraftModel) |

## Arquitectura y entrenamiento

El modelo es un draft model LiLiCorr de 5 capas que reutiliza representaciones intermedias del verificador Qwen3-4B en las capas 2, 10, 18, 26 y 34. Opera con block size 16, generando hasta 15 tokens especulativos por paso, y utiliza el token de mascara 151669. Los pesos se almacenan en float32 y la implementacion depende de codigo personalizado (`config.py`, clase `LiLiCorrDraftModel`) de la libreria `speculators`.

El entrenamiento consistio en 1 epoca sobre 100k conversaciones muestreadas uniformemente de los subconjuntos perfectblend de `inference-optimization/Qwen3-8B-Regenerated-Collection`, un corpus generado por Qwen3-8B mientras el verificador es Qwen3-4B. Se realizaron 16.272 pasos (~216M tokens) con optimizador muon hybrid, learning rate 6e-4 y scheduler coseno con 4% de warmup. El codigo de entrenamiento corresponde al commit `74ffda8` del repositorio vllm-project/speculators (rama `lilicorr-qwen38-fresh-2ep-argmax`).

## Capacidades

- Decodificacion especulativa: propone hasta 15 tokens candidatos por paso para el verificador Qwen3-4B, con muestreo greedy del draft.
- Aceleracion de inferencia en vLLM mediante el metodo `dflash` con configuracion `speculative-config`.
- Mayor aceptacion en tareas de codigo (HumanEval: 4,29 con temp 1; 4,74 en greedy) y razonamiento matematico (math_reasoning: 5,40).
- Aceptacion moderada en tareas genericas: writing 3,39, question 3,32, rag 3,31, translation 3,29, tool_call 3,18, qa 2,99, summarization 2,56.
- Perfil de aceptacion por posicion decreciente: 0,81 en la primera posicion hasta 0,02 en la decimoquinta (HumanEval, temp 1).
- No genera respuestas finales de forma autonoma: su salida siempre es verificada por Qwen3-4B.
- Capacidades multilingues, tool calling y agentes: no disponibles como capacidades propias del draft (dependen del verificador).

## Casos de uso

- Aceleracion de generacion de codigo en produccion: integrado en vLLM con `num_speculative_tokens: 15`, reduce la latencia de autocompletado y generacion de funciones gracias a la aceptacion de 4,29-4,74 en HumanEval, el mejor resultado del modelo.
- Asistentes de razonamiento matematico: con aceptacion de 5,40 en math_reasoning, es adecuado para pipelines de resolucion de problemas paso a paso donde el verificador Qwen3-4B genera cadenas largas.
- Servicio de chat y QA de alto throughput: desplegado con concurrencia 128 en DP8, mejora el rendimiento agregado en tareas de question (3,32) y qa (2,99), util para backends conversacionales.
- RAG sobre documentacion: aceptacion de 3,31 en rag permite acelerar la generacion de respuestas aumentadas por recuperacion manteniendo la fidelidad del verificador.
- Traduccion automatica por lotes: aceptacion de 3,29 en translation, adecuado para pipelines de localizacion con volumen alto y requisitos de latencia moderados.
- Agentes con tool calling: aceptacion de 3,18 en tool_call, util en flujos multi-paso donde el verificador decide llamadas a funciones y el draft acelera la generacion de argumentos.
- Resumen de documentos: aceptacion de 2,56 en summarization, el caso menos favorable; solo rentable si el resto del trafico justifica el despliegue del draft.

## Benchmarks y rendimiento

Longitud de aceptacion medida en vLLM servido, 15 tokens especulativos, muestreo greedy del draft:

| Bench | Longitud de aceptacion |
|---|---|
| HumanEval (temp 1) | 4,29 |
| HumanEval (greedy) | 4,74 |
| math_reasoning | 5,40 |
| writing | 3,39 |
| question | 3,32 |
| rag | 3,31 |
| translation | 3,29 |
| tool_call | 3,18 |
| qa | 2,99 |
| summarization | 2,56 |

Aceptacion por posicion (HumanEval, temp 1): 0,81 / 0,62 / 0,47 / 0,35 / 0,27 / 0,20 / 0,15 / 0,11 / 0,09 / 0,07 / 0,05 / 0,04 / 0,03 / 0,02 / 0,02. Medido con `scripts/evaluate/evaluate.py throughput` (GuideLLM, concurrencia 128) contra un despliegue DP8 de vLLM del verificador mas este draft. No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, etc.) porque el modelo no es un generador autonomo.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft pesa 2,3 GB en float32; en la practica se suma a la memoria del verificador Qwen3-4B (aproximadamente 8 GB en fp16/bf16, mas KV cache).
- GPU recomendadas: el despliegue de referencia usa DP8 (8 GPU) con vLLM; para el par verificador + draft en una sola GPU se recomienda A100 40/80 GB, H100 o L40S.
- GPU de consumo: el draft en float32 (2,3 GB) mas Qwen3-4B en cuantizacion 4-bit podria caber en una RTX 4090 (24 GB), aunque no hay datos publicados de este despliegue y la dependencia de custom_code limita las opciones.
- Opciones de despliegue: exclusivamente vLLM con soporte LiLiCorr/dflash (`--speculative-config '{"method": "dflash", ...}'`). No hay soporte documentado en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo longitudes de aceptacion. La aceleracion efectiva depende de la tasa de aceptacion y del coste de verificacion paralela.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-LiLiCorr-b16-regen-100k | 569M (draft) | no disponible | Draft LiLiCorr para Qwen3-4B | apache-2.0 | HuggingFace, requiere vLLM custom |
| Qwen/Qwen3-4B | 4B | no disponible | LLM verificador | apache-2.0 | HuggingFace, amplio soporte |
| Draft models EAGLE/Medusa para Qwen3 | no disponible | no disponible | Draft alternativos | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros draft models en la informacion proporcionada. La comparacion relevante es frente al verificador sin draft: el uso del draft no altera la calidad de salida, solo la velocidad, por lo que la metrica decisiva es la longitud de aceptacion (2,56-5,40 segun tarea).

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como draft de Qwen/Qwen3-4B; no puede usarse para generacion directa ni con otro verificador.
- Dependencia de una build especifica de vLLM con soporte LiLiCorr/dflash y de la libreria `speculators` (custom_code); la integracion en produccion exige fijar el commit `74ffda8`.
- Aceptacion baja en summarization (2,56) y qa (2,99): en esas cargas la aceleracion es marginal y puede no compensar el coste de memoria del draft.
- Entrenado sobre un corpus generado por Qwen3-8B mientras el verificador es Qwen3-4B; posible desajuste de distribucion no cuantificado.
- Pesos en float32 (2,3 GB): no se publican versiones cuantizadas; el ahorro de memoria no esta documentado.
- Sin datos publicados sobre sesgos, alucinacion o comportamiento multilingue; al heredar el comportamiento del verificador, los riesgos del verificador se mantienen.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de codigo custom de vLLM debe verificarse para el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeganEFlynn/Qwen3-4B-LiLiCorr-b16-regen-100k
- Modelo base (verificador): https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/inference-optimization/Qwen3-8B-Regenerated-Collection
- Repositorio speculators (codigo): https://github.com/vllm-project/speculators/tree/lilicorr-qwen38-fresh-2ep-argmax
- Write-up del experimento: https://github.com/vllm-project/speculators/blob/lilicorr-qwen38-fresh-2ep-argmax/docs/research/lilicorr-qwen3-4b-perfectblend-regen-100k.md
