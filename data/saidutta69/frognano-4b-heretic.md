# saidutta69/FrogNano-4B-heretic

## Resumen

FrogNano-4B-heretic es una variante "decensored" (abliterada) del modelo microsoft/FrogNano-4B-2609, un agente de codigo compacto orientado a tareas de nivel de repositorio. Lo publica el usuario independiente saidutta69 en Hugging Face y se genera aplicando Heretic v1.4.0, una herramienta de ablacion direccional de pesos, sobre el modelo base de Microsoft. El objetivo declarado es suprimir el comportamiento de rechazo sin reentrenar, conservando la arquitectura y el comportamiento del agente original.

El modelo base FrogNano es un agente SWE especializado, no un asistente general. Parte de Qwen/Qwen3.5-4B y emplea una arquitectura hibrida Gated DeltaNet, con un contexto evaluado de aproximadamente 131K tokens y un harness de cinco herramientas (Leaf). El checkpoint heretic mantiene esa base: 4.539.265.536 parametros totales segun safetensors (aproximadamente 4.21B en su variante solo texto segun la model card), licencia MIT e idioma validado en ingles.

La relevancia actual es doble: por un lado, demuestra el estado del arte en agentes SWE de tamano reducido que caben en GPU de consumo (SWE-bench Verified 61.5% Avg@3 en el modelo base); por otro, es un ejemplo de edicion de pesos dirigida para eliminar rechazos. El propio autor advierte que es un checkpoint interino: los rechazos bajan de 92/100 a 71/100, no a un solo digito, y sera sustituido por una variante mas agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (base Qwen3.5); agente con harness Leaf de cinco herramientas |
| Parametros totales | 4.539.265.536 (safetensors); ~4.21B en variante solo texto segun model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ~131K tokens evaluados (contexto de evaluacion del agente) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en); dominio validado: repositorios Python |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base FrogNano-4B-2609: un transformer hibrido con capas Gated DeltaNet, disenado para manejar contextos largos (~131K) con coste eficiente, y un bucle de agente con cinco herramientas (harness Leaf). El modelo base fue entrenado con aproximadamente 1.500 tareas SWE sinteticas con recompensas de test ejecutables y, segun la model card, sin destilacion de modelos mas fuertes (sin trayectorias de solucion, trazas de razonamiento ni parches objetivo). El ajuste se realizo mediante cinco iteraciones de RL guiadas por TaskPilot, que elevaron SWE-bench Verified de 39.4% a 61.5%.

La variante heretic no reentrena: aplica ablacion direccional sobre las proyecciones de salida de atencion (attn.o_proj) y de bajada del MLP (mlp.down_proj). Corresponde al ensayo 132 de una ejecucion de 200 ensayos de Heretic (semilla 393732754), con direction_index 18.57 y pesos maximos de 1.40 (o_proj) y 0.86 (down_proj). La divergencia KL respecto al original es de solo 0.0046, la edicion mas conservadora de la coleccion del autor, lo que explica que sobrevivan la mayoria de los rechazos. No se ha ejecutado ninguna evaluacion post-abliteracion.

## Capacidades

- Generacion de codigo y reparacion de bugs a nivel de repositorio (parches multi-archivo).
- Resolucion de tareas de ingenieria de software con bucle de agente de hasta 150 pasos de interaccion.
- Uso de herramientas (tool calling) mediante el harness Leaf de cinco herramientas.
- Razonamiento multi-paso y planificacion para tareas de terminal (Terminal-Bench 2.0).
- Reparacion de vulnerabilidades (CVE) y generacion de parches validados por tests.
- Conversacion multi-turno y roleplay (etiquetas de la model card).
- Idioma: ingles; dominio de codigo validado en Python.
- Supresion parcial de rechazos (71/100 restantes), no total.

## Casos de uso

- Agentes de investigacion SWE: el modelo puede ejecutar bucles de 150 pasos con ~131K de contexto para resolver issues de repositorio, gracias a su entrenamiento especifico con recompensas de test.
- Herramientas de desarrollo locales: con cuantizacion Q4_K_M (2.71 GB) cabe en una RTX 4060 de 8 GB, lo que permite un agente de codigo en estacion de trabajo sin dependencia de la nube.
- Triage y reparacion de CVE: su rendimiento en PatchEval-Verified (47.3%) lo hace adecuado para generar parches candidatos en flujos de seguridad dentro de sandbox.
- Automatizacion de terminal: Terminal-Bench 2.0 (31.1%) respalda su uso en tareas de linea de comandos guiadas por agente.
- Integracion en pipelines de CI/CD: el soporte de tool calling y el formato GGUF permiten desplegarlo con llama.cpp/Ollama para revisiones automatizadas de parches.
- Asistentes conversacionales sin filtros restrictivos: la ablacion reduce rechazos en casos de politica de contenido, util para roleplay o generacion creativa en entornos controlados.
- Prototipado rapido en GPU de consumo: el conjunto de cuantizaciones (Q8_0 a Q4_K_M) cubre desde 24 GB hasta 8 GB de VRAM.

## Benchmarks y rendimiento

Los datos disponibles son del modelo base, medidos antes de la abliteracion; no hay evaluacion post-abliteracion.

| Benchmark | Avg@3 | Nota |
|---|---|---|
| SWE-bench Verified | 61.5% | Pass@3 71.0%; partida en 39.4% para Qwen/Qwen3.5-4B |
| SWE-bench Pro | 37.6% | held-out; Pass@3 47.6% |
| Terminal-Bench 2.0 | 31.1% | held-out |
| PatchEval-Verified | 47.3% | held-out; 230 reparaciones CVE reales 2015-2025 |

| Metrica de abliteracion | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.0046 | 0 (por definicion) |
| Rechazos | 71/100 | 92/100 |

Progresion del RL en el base: SWE-bench Verified 39.4 → 49.1 → 53.1 → 56.7 → 59.1 → 61.5. Evaluado con harness Leaf, 150 pasos, ~131K de contexto, temperatura 0.6. No se han publicado resultados de comprension general del lenguaje, matematicas ni multilingue para este modelo.

## Requisitos de hardware

- VRAM estimada (solo pesos): Q8_0 4.48 GB; Q6_K 3.46 GB; Q5_K_M 3.07 GB; Q4_K_M 2.71 GB; F16 aproximadamente 8.5 GB.
- GPU recomendadas: RTX 3090/4090/5090 (24 GB) para Q8_0; RTX 4080/5080/4060 Ti 16G para Q6_K; RTX 3060/4070/5070 (12 GB) para Q5_K_M; RTX 4060/3070 (8 GB) para Q4_K_M.
- CPU-only / Apple Silicon: Q4_K_M cabe en RAM del sistema.
- Advertencia: el bucle de agente evalua a ~131K de contexto, por lo que se necesita margen adicional sobre el tamano de pesos; si hay OOM, bajar a Q4_K_M.
- Opciones de despliegue: transformers, llama.cpp, Ollama (GGUF); endpoints compatibles (Featherless.ai, FriendliAI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Notas |
|---|---|---|---|---|---|
| FrogNano-4B-heretic (este) | 4.54B | ~131K | 61.5% (base, Avg@3) | MIT | Abliterado; rechazos 71/100 |
| microsoft/FrogNano-4B-2609 | ~4.21B texto | ~131K | 61.5% (Avg@3) | MIT | Original sin abliterar; rechazos 92/100 |
| Qwen/Qwen3.5-4B | no disponible | no disponible | 39.4% (punto de partida) | no disponible | Base del entrenamiento RL |
| granite-4.1-3b-heretic | no disponible | no disponible | no disponible | no disponible | Misma familia de metodo; rechazos 3/100 con KL 0.0852 |

## Limitaciones y advertencias

- Checkpoint interino: los rechazos solo bajan a 71/100; el autor anuncia una variante mas agresiva que lo sustituira.
- La edicion de pesos es muy conservadora (KL 0.0046), por lo que el comportamiento de rechazo persiste en la mayoria de casos.
- No hay evaluacion post-abliteracion; los benchmarks son del modelo base y no reflejan posibles degradaciones.
- Microsoft no ha validado los formatos optimizados ni cuantizados; los GGUF pueden presentar deriva de comportamiento respecto al bf16.
- Modelo especializado en codigo, no asistente general: no se han evaluado comprension general, matematicas ni multilingue; no atribuirle los resultados de Qwen3.5-4B.
- Idioma validado solo en ingles y repositorios mayoritariamente Python.
- Riesgo de alucinacion en parches y explicaciones de codigo; requiere validacion con tests.
- El modelo base no fue alineado en seguridad (sin datasets de rechazo ni contenido danino en su RL); la abliteracion reduce aun mas las barreras.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento tras la ablacion.
- El bucle de agente a ~131K de contexto exige VRAM adicional sobre los pesos; riesgo de OOM en GPU de 8-12 GB.

## Enlaces

- Hugging Face: https://huggingface.co/saidutta69/FrogNano-4B-heretic
- Modelo base: https://huggingface.co/microsoft/FrogNano-4B-2609
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Licencia MIT: https://opensource.org/license/mit
- Endpoint Featherless.ai: https://featherless.ai/models/saidutta69/FrogNano-4B-heretic
- Endpoint FriendliAI: https://friendli.ai/models/saidutta69/FrogNano-4B-heretic
- Variante comparable del mismo autor: https://huggingface.co/saidutta69/granite-4.1-3b-heretic
