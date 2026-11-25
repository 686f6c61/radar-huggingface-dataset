# krush420/qwen3-coder-30b-sre-lora

## Resumen

`krush420/qwen3-coder-30b-sre-lora` es un adaptador LoRA (PEFT) publicado por el usuario krush420 sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de aproximadamente 13,37 millones de parametros (13.369.344 segun los safetensors del repositorio), empaquetado en un repo de 0,3 GB. El adaptador esta orientado a tareas de SRE (Site Reliability Engineering): auditoria de codigo ancorada en AST, sintesis de codigo, tool calling agentico mediante MCP y alineacion con pares curados de `NousResearch/arete-data-pairs`.

El modelo base subyacente es un transformer MoE de Qwen con 30.000 millones de parametros totales y 3.300 millones activos (la denominacion "30B-A3B" indica 30B totales, 3B activos), lo que explica el rendimiento declarado de 125,8-131,5 tok/s en 22-24 GB de VRAM. El adaptador se entrena mediante SFT y DPO (con anclaje KL en la etapa 2) sobre un dataset propio de 18.341 registros repartidos en 9 particiones, y se distribuye tambien en formato GGUF para su uso con Ollama.

La relevancia del artefacto es acotada: se trata de un experimento de un unico autor, con 298 descargas y 0 likes en el momento de la consulta, sin verificacion externa de sus metricas (todas las entradas del model-index estan marcadas como `verified: false`). Resulta util como referencia para quien quiera reproducir un pipeline de destilacion SFT+DPO sobre Qwen3-Coder, pero no como modelo de produccion contrastado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3-Coder-30B-A3B |
| Parametros totales | 13.369.344 (adaptador); modelo base: 30B totales |
| Parametros activos | 3.3B (modelo base MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (se menciona GGUF y Ollama, sin detallar niveles Q) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un transformer con mezcla de expertos (MoE) de 30B parametros totales y 3,3B activos. El entrenamiento se estructura en dos etapas segun la model card: una fase SFT con mascara solo sobre el turno del asistente (Wave-7, con precision de token declarada del 74,58%) sobre el split `elitist_120b_teacher` del dataset `krush420/sovereign-code-audit-sft`, seguida de una fase DPO con anclaje KL (Stage-2, precision de preferencia declarada del 100%). El dataset de entrenamiento consta de 18.341 registros sin fuga de datos repartidos en 9 splits, e incluye pares de alineacion de `NousResearch/arete-data-pairs` (Apache-2.0).

Entre las innovaciones tecnicas declaradas por el autor figuran la auditoria de codigo "ancorada en AST" (analisis sintactico como base de las respuestas), la sintesis "Lego-First" mediante `@krusch/toolkit`, el soporte de tool calling sobre un stack MCP de 39 herramientas y un `Modelfile` con roles neutrales. El pipeline de destilacion se ejecuta con `trl` y un harness de auditoria denominado Jean SRE. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las referencias anteriores.

## Capacidades

- Generacion de texto y codigo sobre el modelo base Qwen3-Coder (no evaluadas de forma independiente en la informacion disponible).
- Auditoria de codigo ancorada en AST y remediacion de bugs en contexto SRE.
- Tool calling / function calling mediante Model Context Protocol (39 herramientas declaradas).
- Razonamiento multi-paso y ejecucion de herramientas simuladas en entornos agenticos.
- Memoria conversacional multi-turno (evaluada en BEAM y DolphinBench segun el autor).
- Analisis estatutario y de seguridad con politica de "no rechazo" (non-refusal) declarada.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de codigo en pipelines de CI/CD: el adaptador puede integrarse como paso de revision automatizada que analiza el AST del codigo entrante y reporta hallazgos de seguridad o deuda tecnica antes del merge, aprovechando el entrenamiento especifico en code audit.
- Triaje de incidentes SRE: uso del tool calling MCP para consultar logs, metricas y estado de servicios desde un agente que razona multi-paso sobre la causa raiz y propone remediacion.
- Remediacion automatizada de bugs: generacion de parches acotados a partir de un diagnostico previo, con el modelo base aportando la capacidad de codigo y el adaptador el sesgo hacia convenciones de auditoria.
- Asistente de operaciones con memoria de sesion: conversaciones multi-turno con recuperacion de contexto historico para equipos de guardia, apoyandose en las metricas de recall declaradas en BEAM (92,58% en 100K y 93,00% en 10M, no verificadas).
- Despliegue local en hardware de consumo: al ser un adaptador sobre un MoE de 3,3B activos, permite servir el modelo en GPUs de 22-24 GB con Ollama o llama.cpp usando los pesos GGUF publicados, con throughput declarado de 125,8-131,5 tok/s.
- Generacion de informes de cumplimiento: el sesgo "non-refusal" declarado lo hace adecuado para tareas de analisis de politicas y requisitos regulatorios sobre repositorios de codigo, siempre con revision humana posterior.
- Prototipado de agentes MCP: sirve como base para experimentar con el stack KruschStack y validar flujos de 39 herramientas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor (`verified: false` en todos los casos):

| Benchmark | Metrica | Resultado |
|---|---|---|
| DolphinBench (600 tareas, juez gpt-5.6-sol) | Pass rate, Wave-4 + Grounded Harness v0.3 | 43,00% (258/600) |
| DolphinBench (600 tareas, juez gpt-5.6-sol) | Pass rate, Wave-4 Std. Harness | 42,67% (256/600) |
| DolphinBench | Chequeos mecanicos deterministas de herramientas | 85,73% (1.123/1.310) |
| Sovereign Code Audit SFT + DPO | Precision de preferencia DPO (Stage-2, KL-anchored) | 100% |
| Sovereign Code Audit SFT | Precision de token SFT (Wave-7, mascara solo asistente) | 74,58% |
| BEAM (split 100K, n=2.000) | Recall estricto del turno primario (9 categorias) | 92,58% |
| BEAM (split 10M) | Recall de extraccion de informacion | 93,00% |

El autor declara ademas 125,8-131,5 tok/s en 22-24 GB de VRAM, frente a 23,5 tok/s de un modelo denso de 27B (`NousResearch/Arete-27B`) en hardware dual-GPU identico, lo que supone una aceleracion de 5,4x-5,6x. Estas cifras no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: 22-24 GB para el modelo base en cuantizacion de 4 bits segun las cifras declaradas por el autor; el adaptador en si ocupa aproximadamente 0,3 GB.
- GPU recomendadas: no disponible de forma explicita; por el rango de VRAM declarado encajan GPUs de 24 GB (RTX 4090, RTX 3090) y profesionales como A100/H100 para despliegues mayores.
- Cabe en GPU de consumo: si, en GPUs de 24 GB con cuantizacion adecuada (los pesos GGUF estan publicados).
- Opciones de despliegue: Ollama (se menciona un `Modelfile`), llama.cpp/GGUF, transformers + PEFT, trl para entrenamiento. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: 125,8-131,5 tok/s declarados en 22-24 GB de VRAM (no verificados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krush420/qwen3-coder-30b-sre-lora | 13,37M adaptador sobre MoE 30B/3,3B | no disponible | DolphinBench 43,00%; 125,8-131,5 tok/s | apache-2.0 | Hugging Face (298 descargas) |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (base) | 30B totales / 3,3B activos | no disponible | no disponible en esta ficha | no disponible | Hugging Face (oficial) |
| NousResearch/Arete-27B (referencia del autor) | 27B densos | no disponible | 23,5 tok/s segun el autor | no disponible | Hugging Face |

La comparativa es limitada porque la informacion proporcionada solo ofrece datos del autor para este adaptador y para Arete-27B. No hay datos independientes de MMLU, HumanEval o GSM8K para ninguno de los tres modelos en el material disponible.

## Limitaciones y advertencias

- Todas las metricas del model-index estan marcadas como `verified: false`; no han sido reproducidas por terceros.
- El autor declara un 100% de precision de preferencia DPO, una cifra atipica que invita a escepticismo y requiere validacion externa.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base Qwen3-Coder-30B-A3B, con sus propios requisitos de VRAM y licencia.
- La politica "non-refusal" declarada implica que el modelo puede responder a peticiones que otros modelos rechazan; esto traslada toda la responsabilidad de filtrado y moderacion al sistema que lo despliega.
- Idiomas soportados no declarados; no hay garantia de rendimiento fuera del ingles tecnico.
- Longitud de contexto no especificada en la informacion disponible.
- Proyecto de un unico autor, con 0 likes y 298 descargas: sin comunidad de validacion, sin issues documentadas y con riesgo de abandono.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen3-Coder antes de distribuirlo.
- Riesgo de alucinacion en tareas de auditoria: las recomendaciones de seguridad generadas por el modelo deben revisarse siempre por un ingeniero humano antes de aplicarse.
- El sesgo hacia convenciones del stack KruschStack puede reducir la calidad fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Logs de benchmarks: https://huggingface.co/datasets/krush420/sovereign-g4-benchmarks
- Dataset de alineacion: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Repositorio KruschStack: https://github.com/kruschdev/krusch-stack
- Jean SRE by Kruschdev: https://github.com/krushdev/Jean-SRE-by-kruschdev
- DolphinBench: https://dolphinbench.ai/
- Dataset BEAM (referencia): https://huggingface.co/datasets/Mohammadta/BEAM
