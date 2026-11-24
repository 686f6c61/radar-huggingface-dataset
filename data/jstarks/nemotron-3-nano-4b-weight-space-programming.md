# jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming

## Resumen

Nemotron-3-Nano-4B-Weight-Space-Programming es una adaptacion del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` publicada por el usuario jstarks. No se trata de un modelo entrenado desde cero, sino de una aplicacion de "Weight-Space Programming" (WSP) en version 3.0: una tecnica de modificacion de pesos en espacio cerrado y sin entrenamiento que superpone un conjunto de adaptadores LoRA dinamicos organizados en nueve subespacios, orientados a tareas de razonamiento, uso de herramientas y agentes.

El modelo hereda la arquitectura hibrida SSM-transformer del Nemotron-3 Nano de NVIDIA (42 capas, `hidden_size=3136`, `intermediate_size=12544`, MLP con activacion `relu2`, RMSNorm con parametro `w` y capas Mamba2 combinadas con atencion), con aproximadamente 3.970 millones de parametros totales. Se distribuye en formatos safetensors y GGUF, e incluye scripts de enrutamiento de inferencia en dos fases (`two_phase_wsp_router.py`) que separan el razonamiento interno del bloque de respuesta final.

Su relevancia actual radica en que propone una via de mejora de modelos pequenos sin reentrenamiento: la model card reporta ganancias medibles en tareas de agente y uso de herramientas (por ejemplo, `agent100` pasa de 81/100 a 85/100 con el enrutamiento en dos fases), manteniendo el modelo ejecutable en GPU de consumo con cuantizacion Q4_K_M y una ventana de contexto de 16k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida SSM-transformer (Nemotron-H: capas Mamba2 + atencion, 42 capas, `hidden_size=3136`, `intermediate_size=12544`, MLP `relu2`, RMSNorm con parametro `w`) |
| Parametros totales | 3.973.556.832 (aprox. 3,97 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens en la configuracion de referencia (`-c 16384`); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (referenciado como `NVIDIA-Nemotron3-Nano-4B-Q4_K_M.gguf`); pesos safetensors en BF16 en el modelo base; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que intercala capas de espacio de estados (Mamba2) con capas de atencion, bajo el diseno Nemotron-H de NVIDIA. La ficha tecnica del autor detalla 42 capas, dimension oculta de 3136, dimension intermedia de 12544, activacion `relu2` en el MLP y RMSNorm parametrizada. La sintesis de los adaptadores WSP se realiza mediante `forward_hooks_bf16`, es decir, inyectando modificaciones en los pesos durante el pase forward en precision BF16.

La innovacion central no es el entrenamiento sino la "programacion en espacio de pesos": WSP v3.0 construye de forma cerrada (sin gradientes ni dataset de entrenamiento) nueve subespacios de adaptadores LoRA dinamicos que se activan o desactivan segun la fase de inferencia. El enrutador en dos fases (`two_phase_wsp_router.py`, preset `nem_tp_bfcl_mid`) aplica primero un asentamiento de razonamiento dentro de los canales `<think>` / `<|channel>thought`, reserva un presupuesto explicito de tokens para la respuesta final y, al cerrar el limite de fase, desactiva los aceleradores de la fase 1 antes de habilitar adaptadores especificos de la fase 2. Para tareas no dirigidas se mantiene un passthrough nativo a `/v1/chat/completions` con escalas a `[0]`. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, dado que la tecnica no requiere entrenamiento supervisado.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento delimitado por `<think>` / `<|channel>thought`.
- Uso de herramientas y function calling: la model card evalua el modelo en BFCL v3 (incluida la suite de irrelevancia) y en tareas de enrutamiento multi-herramienta.
- Comportamiento de agente en terminal: evaluado en Terminal-Bench 2.0 con tareas bash con estado en contenedores WSL2.
- Generacion de codigo y sintesis de codigo de banda media, con evaluacion en HumanEval (pass@1).
- Razonamiento matematico: evaluado en GSM8K, incluyendo respuestas en formato `\boxed{}`.
- Traduccion de lenguaje natural a comandos de shell (NL2Bash, InterCode).
- Control de restricciones y anti-sicofancia: suite `S2_RESTRAINT`, con rechazo de llamadas a herramientas innecesarias.
- Abstenccion fundamentada (`S8_GROUNDING`) y guardia frente a inyeccion indirecta de prompts (`S7_INJ_GUARD`).
- Recuperacion de errores y handoff de escalado en flujos de agente (`S9_ERR_RECOV`, `S6_HANDOFF`).
- Salida JSON estructurada en turnos multiples (`S5_TURN2_JSON`).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de terminal automatizados: el modelo se ha evaluado en Terminal-Bench 2.0 sobre tareas bash con estado en WSL2; puede integrarse en entornos de ejecucion controlados para tareas de administracion de sistemas, con la advertencia de que la tasa de exito reportada es baja (3/20) y requiere supervision.
- Enrutamiento de herramientas en asistentes: la suite `S3_ROUTER` alcanza 5/5 en seleccion multi-herramienta, lo que lo hace adecuado como capa de decision en arquitecturas con varias APIs disponibles.
- Traduccion de lenguaje natural a comandos de shell: util para interfaces de consola asistida o generacion de scripts de operaciones, con un rendimiento medido de 10/20 en NL2Bash bajo WSP.
- Generacion de codigo en pipelines de integracion: con 14/15 en HumanEval pass@1 bajo WSP, puede emplearse para autocompletado y generacion de funciones en entornos con revision humana.
- Asistencia matematica con formato de respuesta controlado: GSM8K 19/20 y soporte de salida `\boxed{}` permiten usarlo en tutoria o verificacion de problemas aritmeticos.
- Guardia frente a inyeccion de prompts en aplicaciones RAG: la suite `S7_INJ_GUARD` (2/3) y `S8_GROUNDING` (3/3) lo orientan a filtrado y abstenccion cuando el contexto recuperado es insuficiente.
- Despliegue en hardware de consumo: con Q4_K_M y contexto de 16k ocupa un delta de VRAM pico de 3133 MiB, por lo que cabe en una RTX 2060 de 6 GB con margen (~3,0 GiB libres) y en una RTX 4070 Ti de 12 GB.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor. La comparativa "Base" frente a "WSP v3.0" corresponde al mismo modelo con y sin los adaptadores; "Two-Phase Recoup" es la variante con enrutamiento en dos fases.

| Benchmark | Base | WSP v3.0 | Two-Phase Recoup |
|---|---:|---:|---:|
| `agent100` (100 tareas) | 81/100 | 81/100 | 85/100 |
| Holdout `S1..S9` (30 tareas) | 26/30 | 28/30 | 25/30 |
| Established (70 tareas) | 55/70 | 53/70 | 60/70 |
| `tbench20` (20 tareas) | 3/20 | 3/20 | 3/20 |

Desglose por suite (Base -> WSP v3.0):

| Suite | Tareas | Base | WSP v3.0 |
|---|---:|---:|---:|
| `S1_THINK` | 3 | 3/3 | 3/3 |
| `S2_RESTRAINT` | 4 | 3/4 | 4/4 |
| `S3_ROUTER` | 5 | 5/5 | 5/5 |
| `S4_CODE` | 2 | 2/2 | 2/2 |
| `S5_TURN2_JSON` | 3 | 3/3 | 3/3 |
| `S6_HANDOFF` | 4 | 4/4 | 4/4 |
| `S7_INJ_GUARD` | 3 | 2/3 | 2/3 |
| `S8_GROUNDING` | 3 | 2/3 | 3/3 |
| `S9_ERR_RECOV` | 3 | 2/3 | 2/3 |
| `EST_GSM8K` | 20 | 19/20 | 19/20 |
| `EST_HUMANEVAL` | 15 | 13/15 | 14/15 |
| `EST_BFCL_IRR` | 15 | 10/15 | 10/15 |
| `EST_NL2BASH` | 20 | 13/20 | 10/20 |

Rendimiento de inferencia reportado: 131,1 tok/s con `-c 16384 -ctk q8_0 -ctv q8_0`; 147,87 tok/s en el log de `llama-server` con `n >= 20`; 118,0 tok/s en Terminal-Bench 2.0. Delta de VRAM en carga: 2999 MiB; pico: 3133 MiB.

## Requisitos de hardware

- VRAM estimada: pico de 3133 MiB adicionales con GGUF Q4_K_M y contexto de 16k (`-c 16384 -ctk q8_0 -ctv q8_0`); el repo completo en safetensors ocupa 12,3 GB.
- GPU recomendadas: RTX 4070 Ti (12 GB) reportada como la opcion mas rapida para un 4B a 16k; RTX 2060 (6 GB) validada con aproximadamente 3,0 GiB libres a 16k.
- Cabe en GPU de consumo: si, incluidas tarjetas de 6 GB con cuantizacion Q4_K_M.
- Opciones de despliegue: `llama.cpp` / `llama-server` (formato GGUF), transformers con `trust_remote_code` (el modelo base requiere codigo personalizado), y passthrough compatible con la API `/v1/chat/completions`. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: 131,1 tok/s en la configuracion de referencia; 147,87 tok/s en `llama-server`; 118,0 tok/s en Terminal-Bench 2.0.

## Comparativa con modelos similares

La model card incluye un estudio uniforme de cinco modelos bajo el mismo pipeline WSP (`wsp-5model-pipeline`), con decodificacion identica (`temperature=0.0, seed=42`, `-c 16384 -ctk q8_0 -ctv q8_0`). Solo se dispone de datos completos para el modelo de esta ficha y para `qwen35_4b`; el resto de filas de la tabla original estan truncadas en la informacion proporcionada.

| Modelo | Parametros | Base (100 tareas) | WSP v3.0 (100 tareas) | Delta | GGUF Q4_K_M | Velocidad |
|---|---:|---:|---:|---:|---:|---:|
| Nemotron-3-Nano-4B (esta ficha) | 3,97B | 81/100 | 81/100 | +0,0 pp | no disponible en la informacion | 131,1 tok/s |
| Qwen3.5-4B-WSP (`qwen35_4b`) | no disponible | 72/100 | 89/100 | +17,0 pp | 2,553 GiB | 117,0 tok/s |

Observacion: el modelo Nemotron-3-Nano-4B parte de una base mas alta (81/100 frente a 72/100) pero la tecnica WSP no aporta mejora neta en el total de 100 tareas, mientras que en Qwen3.5-4B reporta +17,0 pp. Los datos de los otros tres modelos del estudio no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La mejora neta en el conjunto unificado de 100 tareas es de +0,0 pp (81/100 en ambos casos); el beneficio se concentra en el enrutamiento en dos fases (`agent100`: 85/100) y en subconjuntos concretos.
- Regresion en NL2Bash: de 13/20 a 10/20 con WSP v3.0, lo que supone una perdida de 3 tareas frente al modelo base.
- Rendimiento bajo en Terminal-Bench 2.0 (3/20, 15,0%) y en BFCL v3 Irrelevance (10/15, 66,7%); no es adecuado como agente autonomo sin supervision en entornos de produccion.
- El holdout `S1..S9` con enrutamiento en dos fases baja a 25/30 frente a 28/30 de la variante WSP simple, lo que indica sensibilidad al preset de enrutamiento.
- La tecnica WSP modifica pesos en tiempo de inferencia mediante `forward_hooks_bf16`; requiere cargar los scripts del repositorio y no es un simple checkpoint estandar de transformers.
- El modelo base requiere `trust_remote_code` por el codigo personalizado de la arquitectura Nemotron-H.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; las suites de grounding y abstenccion muestran resultados parciales (2/3 y 3/3 segun variante).
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y conviene verificar las condiciones del modelo base.
- Los benchmarks son autoinformados por el autor en la model card y no se han verificado de forma independiente; el numero de tareas por suite es reducido (2 a 20), por lo que la varianza es alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Modelo comparable del mismo autor: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Script de enrutamiento en dos fases: `scripts/two_phase_wsp_router.py` (dentro del repositorio)
- CLI de inferencia en dos fases: `scripts/run_wsp_two_phase.py` (dentro del repositorio)
- Traza empirica completa: `benchmarks/two_phase_recoup_results.json` (dentro del repositorio)
