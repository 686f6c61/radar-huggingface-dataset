# liangzhidanta/Qwen3-8B-CC-SFT-v1

## Resumen

Qwen3-8B-CC-SFT-v1 es un checkpoint de ajuste supervisado (SFT) orientado a agentes de código, desarrollado por el usuario liangzhidanta a partir de Qwen/Qwen3-8B. El entrenamiento utiliza trayectorias multi-turno nativas de Claude Code, verificadas por ejecución, generadas con GLM-5.3 como modelo profesor sobre tareas de ingeniería de software de SWE-smith (1003 candidatos, split formal 910/93 a nivel de repositorio). Su uso previsto declarado es servir como inicialización (warm start) para un RL posterior de agentes de código verificable, más que como modelo de propósito general.

El checkpoint tiene 8.190.735.360 parámetros (8,19B), se distribuye en safetensors y emplea licencia Apache 2.0. El ajuste fue de parámetros completos (sin LoRA ni PEFT) durante 1 época, 227 pasos de optimizador y aproximadamente 22,5 millones de tokens de secuencia, con contexto de 32.768 tokens y un lote de 8× RTX 4090 24 GB en TP=8. La pérdida SFT enmascarada bajó de 2,02 a 0,52.

Su relevancia actual radica en dos datos concretos: frente al Qwen3-8B pre-SFT, el Pass@1 en la evaluación interna pasa de 2,97 % a 28,05 % a temperatura 1.0 (mismo protocolo congelado), y a T=0.3 alcanza 43,23 % (131/303). Además, el modelo no produce ninguna tool call malformada en las cuatro temperaturas evaluadas, lo que lo hace directamente utilizable en harnesses de agentes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Qwen3-8B, modelo instruct, no Base); no documentada en detalle en la model card |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto usado en el entrenamiento SFT); la model card no documenta ampliación vía YaRN ni contexto nativo superior |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos safetensors (16,4 GB, coherente con bfloat16). No se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (la model card no documenta cobertura de idiomas; las trayectorias y el harness de evaluación son de Claude Code, sin detalle de composición lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargables con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-8B (variante instruct), un transformer decoder-only denso de 8,19B parámetros. El ajuste no modifica la arquitectura: se aplicó SFT de parámetros completos sobre los 8,19B pesos, sin LoRA, PEFT ni cuantización, usando el framework slime v0.3.2 (commit 3778dbf, sin modificaciones) y el tokenizador y chat template nativos de Qwen3. Hiperparámetros: optimizador Adam, learning rate 1e-5 con decaimiento coseno hasta 1e-6, warmup 0,1, weight decay 0,1, betas 0,9/0,95, 1 época, 227 pasos de optimizador, contexto 32.768, paralelismo TP=8 / DP=1 / PP=1 / CP=1 con sequence parallel.

Los datos de entrenamiento provienen del dataset claude-code-glm53-swesmith-trajectories: 1003 trayectorias multi-turno verificadas por ejecución (reward=1, protocolo válido, sin trampas, ≤32k tokens), generadas con GLM-5.3 como profesor sobre tareas de SWE-smith, con split 910/93 y repositorios disjuntos a nivel de split (90 de entrenamiento, 9 de validación). El formato incluye contexto de sistema/harness, tarea de usuario, razonamiento del asistente, texto del asistente, tool calls y resultados de herramientas. La máscara de pérdida (slime `MultiTurnLossMaskGenerator(qwen3)`) enmascara system/usuario/resultado de herramienta y solo entrena razonamiento, texto y tool calls del asistente. No se documenta RLHF, DPO ni RL posterior en esta revisión; el checkpoint se presenta explícitamente como punto de partida para RL verificable.

## Capacidades

- Generación de razonamiento multi-turno y ejecución de tareas de ingeniería de software con parches de código sobre repositorios completos.
- Tool calling / function calling nativo en formato de harness compatible con Claude Code; 0 tool calls malformadas en las cuatro temperaturas evaluadas (T=0.0, 0.3, 0.7 y 1.0).
- Uso de agente con múltiples pasos: media de 14,3 a 16,0 llamadas al modelo por tarea según temperatura.
- Lectura e interpretación de resultados de herramientas (tool results) dentro de la trayectoria, con razonamiento explícito antes de la acción.
- Generación de parches: 75,9 % de tasa de parche a T=0.3 (76,2 % a T=0.0, 75,3 % a T=0.7, 62,4 % a T=1.0).
- Modo de razonamiento: la model card menciona el uso de un parser de razonamiento de Qwen3 en el servidor, lo que implica trazas de razonamiento separables del texto de salida.
- Capacidades multilingües: no documentadas.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Agentes de código autónomos sobre repositorios reales: el modelo está entrenado con trayectorias repo-level y produce parches ejecutables en el 75,9 % de las tareas a T=0.3, por lo que puede desplegarse como núcleo de un agente que localiza, edita y verifica código en un repositorio completo.
- Inicialización para RL verificable: la model card indica explícitamente este uso como warm start de un pipeline de RL con recompensa basada en ejecución, partiendo de un Pass@1 del 28,05 % en lugar del 2,97 % del modelo base.
- Investigación en tool calling y SFT multi-turno: la máscara de pérdida específica para turnos de asistente y la ausencia de tool calls malformadas lo convierten en una base controlada para estudiar formatos de herramientas y dinámicas de conversación agente-herramienta.
- Integración en harness tipo Claude Code: el checkpoint se sirvió con SGLang usando parser de razonamiento y de tool calls de Qwen3, de modo que puede reproducirse ese montaje para evaluar agentes con protocolo congelado.
- Automatización en pipelines de CI/CD: con 32.768 tokens de contexto puede recibir fragmentos amplios de repositorio, stack traces y resultados de tests, generar un parche y re-ejecutar la suite dentro del mismo bucle de agente.
- Ablación de estrategias de decodificación y temperatura: los datos publicados (28,05 % a T=1.0 frente a 43,23 % a T=0.3) permiten estudiar el efecto de la temperatura en agentes de código y calibrar políticas de muestreo en producción.
- Generación de datos sintéticos de trayectorias: al estar especializado en el formato Claude Code, puede usarse para producir trayectorias candidatas que después se filtren por ejecución, alimentando iteraciones posteriores del dataset.
- Evaluación comparativa de harnesses y servidores: permite medir diferencias de tasa de parche y de desbordamiento de contexto entre pilas de servicio (SGLang, vLLM, transformers) manteniendo fijo el modelo.

## Benchmarks y rendimiento

Evaluación interna derivada de SWE-smith, con repositorios disjuntos (303 tareas canónicas, 11 repositorios retenidos, Pass@1, 1 rollout por tarea, harness Claude Code 2.1.258, protocolo congelado). No es SWE-bench Verified ni una puntuación de leaderboard.

Ablación de temperatura (mismas 303 tareas, top_p=0,95, 1 rollout por tarea):

| Metrica (Pass@1) | T=0.0 | T=0.3 | T=0.7 | T=1.0 |
|---|---:|---:|---:|---:|
| Resueltas / 303 | 119 | 131 | 107 | 85 |
| Pass@1 | 39,27 % | 43,23 % | 35,31 % | 28,05 % |
| IC 95 % (bootstrap) | [33,9; 44,9] | [37,6; 48,8] | [30,0; 40,9] | [23,1; 33,3] |
| Facil / Medio / Dificil | 67,7 / 41,7 / 24,8 | 74,2 / 45,2 / 26,8 | 64,5 / 36,5 / 22,3 | 58,1 / 27,8 / 22,3 |

Comparación SFT frente a base con protocolo congelado, ambos a T=1.0:

| Metrica | Qwen3-8B pre-SFT | Qwen3-8B-CC-SFT-v1 |
|---|---:|---:|
| Pass@1 (T=1.0) | 2,97 % (9/303) | 28,05 % (85/303) |
| Facil | 12,9 % | 58,1 % |
| Medio | 3,5 % | 27,8 % |
| Dificil | 0,6 % | 22,3 % |

Comportamiento por temperatura:

| Comportamiento | T=0.0 | T=0.3 | T=0.7 | T=1.0 |
|---|---:|---:|---:|---:|
| Tasa de parche | 76,2 % | 75,9 % | 75,3 % | 62,4 % |
| Tasa sin parche | 20,1 % | 22,8 % | 23,8 % | 37,3 % |
| Desbordamiento de contexto (tareas) | 141 | 141 | 175 | 201 |
| Llamadas medias al modelo | 16,0 | 14,8 | 15,0 | 14,3 |
| Tiempo medio transcurrido | 245 s | 202 s | 201 s | 354 s |
| Tool calls malformadas | 0 | 0 | 0 | 0 |

Mejora absoluta de Pass@1 a temperatura igualada: +25,08 puntos porcentuales (≈9,4× en términos relativos, dato secundario).

SWE-bench Verified: pendiente ("TBD") para el modelo pre-SFT y para este checkpoint; la evaluación está planificada según la model card. No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- Entrenamiento documentado: 8× RTX 4090 24 GB con TP=8, DP=1, PP=1, CP=1 y sequence parallel, contexto 32.768, full-parameter SFT.
- VRAM de inferencia en bfloat16: aproximadamente 16,4 GB solo para pesos (8,19B × 2 bytes); estimación no verificada por el autor.
- VRAM adicional: hay que sumar la caché KV para el contexto usado. Con 32.768 tokens y arquitectura Qwen3-8B, la caché es del orden de varios GB, por lo que una inferencia a contexto completo en bf16 puede superar los 20-25 GB totales (estimación, no confirmada en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para una sola réplica; el autor usó 8× RTX 4090 para el entrenamiento, no para servir.
- Cabe en GPU de consumo: los pesos en bf16 caben en una RTX 4090 de 24 GB, pero el contexto largo puede agotar la memoria; en la práctica requeriría cuantización o limitar la ventana. No hay cuantizaciones publicadas, así que el usuario tendría que generarlas.
- Opciones de despliegue: SGLang (la usada por el autor, con parser de razonamiento y de tool calls de Qwen3), transformers con `AutoModelForCausalLM` y `dtype="bfloat16"`, vLLM y TGI (el repositorio incluye el tag `endpoints_compatible` y `text-generation-inference`). llama.cpp y Ollama solo serían viables generando GGUF, que no se distribuye.
- Latencia y throughput: la model card reporta tiempo medio por tarea completa de agente en el harness: 202 s a T=0.3, 201 s a T=0.7, 245 s a T=0.0 y 354 s a T=1.0, con 14-16 llamadas al modelo por tarea. No se publican tokens por segundo ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 (evaluacion interna, T=1.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-CC-SFT-v1 | 8,19B densos | 32.768 (entrenamiento SFT) | 28,05 % (T=1.0); 43,23 % (T=0.3) | Apache 2.0 | Pesos safetensors en HuggingFace |
| Qwen3-8B pre-SFT | 8,19B densos | No documentado en esta ficha | 2,97 % | Apache 2.0 | Pesos en HuggingFace |
| Otros SFT de agentes de codigo de ~7-9B | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite la comparación directa con el modelo base Qwen3-8B bajo el mismo protocolo. No se han publicado comparaciones con otros modelos de la misma categoría (por ejemplo, otras variantes de Qwen o de familias de código de tamaño similar) en la información disponible.

## Limitaciones y advertencias

- Selección post-hoc de la temperatura: el 43,23 % a T=0.3 se eligió como mejor configuración sobre el mismo conjunto de evaluación, por lo que debe interpretarse como cifra "ablation-best" y no como estimación limpia de un conjunto retenido. La cifra con protocolo congelado por defecto (T=1.0) es 28,05 %.
- Presión de contexto: el checkpoint genera trazas de razonamiento más largas que el modelo base y eleva el desbordamiento de contexto del 27,7 % al 66,3 % de las tareas a T=1.0 (201/303). A temperaturas bajas se reduce a 141/303. Es una limitación reconocida de la v1.
- Tasa de no-parche elevada a alta temperatura: 37,3 % de tareas sin parche a T=1.0, frente al 20,1-22,8 % de T=0.0-0.3.
- Evaluación no estandarizada: los resultados provienen de una evaluación interna derivada de SWE-smith, con 303 tareas y 11 repositorios, y no de SWE-bench Verified. La propia model card advierte que no es una puntuación de leaderboard. SWE-bench Verified está pendiente.
- Dominio estrecho: el entrenamiento se limita a trayectorias de SWE-smith generadas por GLM-5.3 como profesor (1003 candidatos, 1 época, ~22,5M tokens de secuencia), lo que puede reducir la generalización a repositorios, lenguajes y flujos de trabajo fuera de esa distribución.
- Posible dependencia del harness: el modelo se evaluó con Claude Code 2.1.258 y servido con SGLang y parsers concretos; el comportamiento con otros harnesses o parsers no está cuantificado.
- Idiomas: no hay información sobre cobertura multilingüe ni sobre el rendimiento fuera del inglés del harness.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad o alineación en la model card.
- Alucinación: no se publican métricas de fidelidad; en tareas repo-level el riesgo se manifiesta como parches plausibles pero incorrectos que requieren verificación por ejecución.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3-8B conserva sus propios términos; conviene revisarlos antes de un despliegue comercial.
- Distribución limitada: 468 descargas y 1 like en el momento de la consulta, sin cuantizaciones publicadas ni versiones GGUF, lo que encarece el despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v1
- README en chino: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v1/blob/main/README.zh-CN.md
- Dataset de entrenamiento: https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-trajectories
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Framework slime v0.3.2 (commit 3778dbf): mencionado en la model card sin URL; no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a un foro no relacionado con el modelo
