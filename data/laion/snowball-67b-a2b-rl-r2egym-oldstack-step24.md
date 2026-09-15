# laion/snowball-67b-a2b-rl-r2egym-oldstack-step24

## Resumen

Snowball 67B-A2B (variante RL R2E-Gym, old stack, step 24) es un modelo de lenguaje de arquitectura MoE desarrollado por LAION, entrenado especificamente para tareas de ingenieria de software agentica sobre terminal. Cuenta con 67.078.882.816 parametros totales (unos 67B) y parte del modelo SFT `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888`. La nomenclatura "A2B" del nombre sugiere del orden de 2B de parametros activos, pero ese dato no se confirma en la model card.

El modelo se ha ajustado mediante RL on-policy de estilo RLOO sobre el conjunto de tareas R2E-Gym, usando el agente de terminal terminus-2, con prompts de 49.152 tokens y generaciones de 16.384 tokens. En evaluacion held-out alcanza un pass@1 de 0,492 en tareas del mismo repositorio, 0,486 en repositorios no vistos y 0,050 en tareas nunca resueltas, medido a 8 intentos sobre el split tt-v2 val441.

Es relevante porque forma parte de la familia Snowball de LAION, orientada a publicar checkpoints abiertos de modelos agente para tareas de codigo y terminal, con licencia Apache 2.0 y pesos exportados en safetensors compatibles con un fork de vLLM (GrugMoe). El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (GrugMoe), transformer |
| Parametros totales | 67.078.882.816 (~67B) |
| Parametros activos | no disponible en la model card (la nomenclatura A2B sugiere ~2B activos) |
| Longitud de contexto | no disponible como spec; el entrenamiento RL usa prompts de 49.152 tokens y generaciones de 16.384 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export en layout de HuggingFace, 39 shards) |

## Arquitectura y entrenamiento

Se trata de un modelo Mixture of Experts (MoE) de la familia GrugMoe, con 67B de parametros totales y un export de los pesos de politica en 39 shards safetensors con layout de HuggingFace, acompanado de config y tokenizer. El modelo base es `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888`, un checkpoint SFT de la misma familia. Para servir el modelo es necesario el fork de vLLM de GrugMoe, lo que implica que no es directamente compatible con el vLLM estandar.

El ajuste se realizo con RL on-policy de estilo RLOO sobre la pila previa a la migracion (2026-09-07): perdida de media de secuencia, staleness 2, grupos de 8, batch de 64 prompts, learning rate 5e-7 y redondeo estocastico en bf16, con KL 0.01. La infraestructura fue de 40 nodos y 1.584 asientos. El entrenamiento se hizo sobre el pool de 728 tareas tt-v2-train usando el agente de terminal terminus-2. Se menciona ademas un draft EAGLE-3 (`laion/snowball-64k-eagle3-draft-r2egym`) que aporta aproximadamente 1,5x de velocidad de decodificacion sobre esta familia.

## Capacidades

- Resolucion de tareas de ingenieria de software sobre terminal mediante un agente (terminus-2).
- Razonamiento multi-paso orientado a la reparacion y resolucion de problemas en repositorios de codigo.
- Ejecucion agentica con contexto largo: el entrenamiento emplea prompts de 49.152 tokens, lo que permite manejar historiales extensos de comandos, salidas y ficheros.
- Generacion de codigo y manipulado de ficheros dentro de flujos de terminal (capacidad implicita en las tareas R2E-Gym).
- Decodificacion especulativa soportada mediante el draft EAGLE-3 de la misma familia (~1,5x de decodificacion).
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles (modelo de texto).
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Agente autonomo de resolucion de issues: dado un issue de un repositorio, el modelo puede inspeccionar el codigo mediante comandos de terminal, aplicar cambios y verificar el resultado, aprovechando su entrenamiento especifico sobre tareas R2E-Gym y su contexto de decenas de miles de tokens.
- Reparacion automatica de tests fallidos en CI: integrado como agente en un pipeline, puede leer la salida de los tests, localizar la causa y proponer un parche dentro del mismo contexto de 49.152 tokens.
- Automatizacion de tareas de mantenimiento de repositorios: actualizacion de dependencias, refactors mecanicos o migraciones de API guiadas por comandos de shell.
- Asistente de terminal para desarrolladores: copiloto que interpreta el estado del sistema, ejecuta comandos y explica resultados en un bucle multi-turno.
- Generacion de scripts y automatizacion de operaciones: creacion y depuracion iterativa de scripts de shell o Python a partir de descripciones en lenguaje natural.
- Evaluacion de agentes de codigo en investigacion: sirve como checkpoint de referencia para estudiar RL on-policy (RLOO) aplicado a tareas de terminal, dado que LAION publica la receta de entrenamiento y los splits de validacion.
- Servicio de agentes en produccion con vLLM: desplegable sobre el fork GrugMoe de vLLM, con el draft EAGLE-3 para aumentar el throughput de decodificacion.

## Benchmarks y rendimiento

Resultados held-out del modelo, pass@1 a 8 intentos, sobre el split tt-v2 val441 (150 tareas same-repo, 115 unseen-repo y 176 held-out):

| Split | pass@1 |
|---|---|
| Same-repo | 0,492 |
| Unseen-repo | 0,486 |
| Never-solved | 0,050 |

La model card indica que las cifras se obtuvieron emparejadas (paired) contra el modelo base. No se proporcionan en la informacion disponible los valores del modelo base para esa comparacion ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no se incluyen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 134 GB solo para los pesos en bf16 (67B parametros), mas el KV cache y el overhead de activaciones; el repo ocupa 134,2 GB. Cualquier cuantizacion a 8 bits o 4 bits reduciria ese requisito, pero no se publican cuantizaciones.
- GPU recomendadas: configuracion multi-GPU, por ejemplo 2x H100 80 GB o 4x A100 80 GB en bf16 para cubrir pesos y cache. Al ser MoE con un numero reducido de parametros activos, es plausible el offload de expertos a CPU, aunque no se confirma en la informacion.
- Consumer GPU: por el tamano total de parametros, no cabe en una sola GPU de consumo (RTX 4090 de 24 GB, etc.) sin cuantizacion agresiva y offload; no se documentan recetas de este tipo.
- Opciones de despliegue: fork de vLLM de GrugMoe (indicado explicitamente por el autor). No se mencionan llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles como cifras absolutas. Como referencia relativa, el draft EAGLE-3 asociado proporciona aproximadamente 1,5x de velocidad de decodificacion sobre esta familia.

## Comparativa con modelos similares

No se han proporcionado en la informacion disponible datos de modelos comparables de la misma categoria (agentes MoE de codigo de ~67B) con parametros, contexto, rendimiento o licencia. La unica comparacion documentada es contra el propio modelo base, cuyos valores held-out no se incluyen en la model card.

| Modelo | Parametros totales | Contexto | pass@1 held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball 67B-A2B RL R2E-Gym step 24 | 67.078.882.816 | no disponible (prompt RL 49.152) | 0,492 same-repo / 0,486 unseen-repo / 0,050 never-solved | Apache 2.0 | HuggingFace (laion) |
| laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888 (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace (laion) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de sesgos ni de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion. En tareas agenticas de terminal el fallo puede manifestarse como comandos incorrectos o parches invalidos sobre el repositorio.
- Rendimiento bajo en tareas nunca resueltas: pass@1 de 0,050 en el split never-solved, lo que indica capacidad muy limitada para problemas fuera de la distribucion de entrenamiento.
- Contexto e idioma: no se declaran idiomas soportados. El entrenamiento esta orientado a tareas de codigo y terminal, no a conversacion general ni a generacion multilingue.
- Dependencia de tooling especifico: requiere el fork GrugMoe de vLLM para servir; no es compatible directamente con vLLM estandar ni se documentan rutas alternativas como llama.cpp u Ollama.
- Datos de adopcion: 0 descargas y 0 likes en HuggingFace, lo que implica poca validacion por parte de la comunidad.
- Fecha inusual: los metadatos indican creacion el 2026-09-14, lo que conviene verificar antes de usar el checkpoint.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el autor no ofrece garantias ni se documentan restricciones adicionales. El contenido de la model card es material de referencia del autor, no instrucciones a seguir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-oldstack-step24
- Modelo base (SFT): https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888
- Draft EAGLE-3: https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym
- LAION: https://laion.ai/
- LAION en GitHub: https://github.com/LAION-AI
- LAION en Wikipedia: https://en.wikipedia.org/wiki/LAION
