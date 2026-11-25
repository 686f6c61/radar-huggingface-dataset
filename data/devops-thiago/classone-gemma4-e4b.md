# devops-thiago/classone-gemma4-e4b

## Resumen

ClassOne Gemma4 E4B es un modelo de decisión de "Sistema 1" desarrollado por el usuario devops-thiago, construido sobre el backbone de `google/gemma-4-E4B-it` mediante la arquitectura ClassOne (Classifier One). A diferencia de un LLM generativo convencional, el modelo no produce texto token a token: evalúa decisiones estructuradas en un único forward pass y devuelve salidas tipadas y calibradas sin coste de decodificación. Los pesos fusionados se distribuyen de forma autónoma en el repositorio, sin adaptador ni descarga separada del modelo base.

El modelo cuenta con 7.941.100.832 parámetros totales (aproximadamente 7,94 mil millones) y un repositorio de 26,3 GB en formato safetensors. Está etiquetado como `text-classification` en Hugging Face y su pipeline se orienta a tareas de clasificación, enrutamiento de herramientas, guardarraíles de seguridad y verificación de contratos de política. La licencia es Apache 2.0.

Su relevancia actual radica en la propuesta de sustituir la generación autoregresiva por evaluación directa de decisiones con calibración explícita (ECE, Brier score) y latencias en el orden de decenas a centenares de milisegundos, lo que lo posiciona como candidato para capas de control en pipelines de agentes y sistemas de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ClassOne (Classifier One) sobre backbone Gemma 4 E4B; evaluación de decisiones en un único forward pass, sin decodificación autoregresiva |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` como backbone y aplica la arquitectura ClassOne, descrita en el repositorio `devops-thiago/class-one`. En lugar de generar texto, ClassOne formula cada tarea como una decisión estructurada que se resuelve en un único forward pass, devolviendo salidas tipadas con puntuaciones calibradas. El repositorio contiene el backbone fusionado ("merged standalone backbone"), de modo que el modelo carga como una sola pieza sin adaptador LoRA ni dependencia del modelo base original.

Las etiquetas del modelo incluyen `system-1`, `rlcd` y `proper-scoring-rules`. RLCD remite a aprendizaje por refuerzo a partir de retroalimentación generada por IA (RL from AI Feedback, RLCD), y "proper scoring rules" hace referencia al uso de reglas de puntuación propias (Brier score, calibración ECE) como señal de entrenamiento y evaluación. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de DPO o RLHF más allá de lo indicado por estas etiquetas.

La innovación técnica principal es la eliminación del coste de decodificación: al no generar tokens, la latencia se reduce a un solo paso de inferencia, con medianas declaradas de 56,1 ms a 411,1 ms según la suite. El autor reporta las evaluaciones auto-medidas en 2x NVIDIA RTX 5060 Ti de 16 GB (fecha 2026-11-13, commit `c375207`).

## Capacidades

- Clasificación y decisión estructurada en un único forward pass, con salidas tipadas y calibradas.
- Tareas de elección múltiple (Choice), verificación de conocimiento (Noul) y puntuación por rúbrica (Score), según los subdesgloses de JevBench.
- Enrutamiento de herramientas y decisión de cuándo invocar una herramienta (suite NVIDIA When2Call: `tool_call`, `request_for_info`, `cannot_answer`).
- Guardarraíles de seguridad: detección de contenido dañino (WildGuardTest) y de inyección de prompts (deepset prompt-injections).
- Evaluación de alineación y seguridad: búsqueda de poder, engaño, reward hacking, fidelidad, sesgo social, sicofancia, rechazo ante jailbreaks, fugas de privacidad y ocultación de incertidumbre (RLCDAlignBench).
- Puntuación de calidad por rúbrica y verificación de contratos de política lingüística.
- Triage de relevancia en recuperación (Retrieval & Relevance Triage).
- No se documentan capacidades generativas de texto libre, visión, audio ni tool calling en el sentido de ejecución de herramientas; el modelo decide, no ejecuta.

## Casos de uso

- Guardarraíl de entrada en pipelines de agentes: el modelo clasifica en un único forward pass si una petición contiene una inyección de prompt o contenido dañino (84,00% de accuracy y 0,9233 AUROC en WildGuardTest; 83,62% y 0,9430 AUROC en deepset prompt-injections), con latencias de 56-85 ms que permiten colocarlo delante de cada turno sin penalizar la experiencia.
- Enrutamiento de herramientas en asistentes: decide si una consulta requiere llamada a herramienta, solicitud de información adicional o respuesta directa (79,00% en When2Call), lo que evita costes de generación en la capa de orquestación.
- Verificación de conocimiento y detección de alucinación: el dominio Knowledge & Verification de Decision Index alcanza 100,0% (10/10), útil como comprobador previo a respuestas de un LLM generativo en sistemas RAG.
- Triage de relevancia en recuperación: con 100,0% en el dominio Retrieval & Relevance Triage, puede filtrar documentos recuperados antes de pasarlos al modelo generador, reduciendo tokens de contexto y coste.
- Puntuación de calidad por rúbrica: el dominio Rubric & Quality Scoring obtiene 90,0% (9/10), aplicable a evaluación automática de respuestas en pipelines de anotación o control de calidad.
- Moderación de alineación en producción: las suites de RLCDAlignBench permiten usar el modelo como clasificador de riesgo (búsqueda de poder 83,3% de accuracy, AUROC 0,889), aunque con rendimiento desigual en sesgo social y sicofancia (55,6%), por lo que conviene combinarlo con otras señales.
- Decisión en el borde (edge): el modelo cabe en 2x RTX 5060 Ti de 16 GB y reporta 52,49 ms de latencia media local frente a una API en la nube, lo que lo hace viable para despliegues on-premise con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados auto-medidos por el autor (2x NVIDIA RTX 5060 Ti 16 GB, 2026-11-13, commit `c375207`).

JevBench Public Multi-Tier Suite (231 tareas, BF16 standalone):

| Tier | Tareas | Accuracy | ECE | Brier | Latencia p50 |
|---|---|---|---|---|---|
| Easy | 48 | 100,0% (48/48) | 0,0022 | 0,0000 | 97,1 ms |
| Original | 72 | 97,2% (70/72) | 0,0209 | 0,0264 | 95,1 ms |
| Hard | 111 | 45,9% (51/111) | 0,3637 | 0,3659 | 195,8 ms |
| Agregado público | 231 | 73,2% (169/231) | — | — | 97,1 ms |

Decision Index Suite (50 tareas):

| Dominio | Peso | Accuracy | Puntuación |
|---|---|---|---|
| Knowledge & Verification | 25,8% | 100,0% (10/10) | 100,00 |
| Language & Policy Contracts | 25,8% | 100,0% (10/10) | 100,00 |
| Retrieval & Relevance Triage | 20,0% | 100,0% (10/10) | 100,00 |
| Tools & Execution Guardrails | 18,3% | 100,0% (10/10) | 100,00 |
| Rubric & Quality Scoring | 10,1% | 90,0% (9/10) | 90,00 |
| Global ponderado | 100,0% | 98,0% (49/50) | 98,99/100 (ECE 0,0379; p50 99,6 ms) |

RLCDAlignBench (100 instancias):

| Eje | N | AUROC | Accuracy |
|---|---|---|---|
| Power Seeking | 6 | 0,889 | 83,3% |
| Honesty (Deception) | 11 | 0,633 | 72,7% |
| Reward Hacking | 9 | 0,650 | 66,7% |
| Faithfulness | 9 | 0,650 | 66,7% |
| Social Bias | 9 | 0,475 | 55,6% |
| Sycophancy | 9 | 0,500 | 55,6% |
| Refusal (Jailbreaks) | 11 | 0,433 | 54,5% |
| Privacy (Secret Leaks) | 14 | 0,612 | 50,0% |
| Prompt Injection | 8 | 0,625 | 50,0% |
| Concealing Uncertainty | 14 | 0,469 | 50,0% |
| Global (Balanced Acc) | 100 | 0,601 | 59,4% (ECE 0,2235; p50 411,1 ms) |

Suites de herramientas y seguridad:

| Suite | Muestras | Accuracy | Métrica secundaria | ECE | Latencia p50 |
|---|---|---|---|---|---|
| WildGuardTest | 100 | 84,00% (BalAcc 84,54%) | AUROC 0,9233 | 0,1563 | 84,6 ms |
| Deepset Prompt Injections | 116 | 83,62% (97/116) | AUROC 0,9430 | 0,1503 | 56,1 ms |
| NVIDIA When2Call (mcq) | 100 | 79,00% | 87,5% request_for_info; 78,6% cannot_answer; 73,5% tool_call | 0,0796 | 218,5 ms |

El autor indica que los resultados oficiales de terceros (Benchmark Heaven, JevBench v1.8.10, publicados el 2026-11-12) difieren de los locales porque incluyen ítems sellados privados, penalización por brecha de generalización, corte estricto de 10 segundos y medición en GPUs de servidor.

## Requisitos de hardware

- El autor reporta ejecución en 2x NVIDIA RTX 5060 Ti de 16 GB (32 GB de VRAM agregada) para las evaluaciones; no se publica una estimación de VRAM mínima por cuantización.
- Con 7,94 mil millones de parámetros, en BF16 el peso de los parámetros ronda los 15,9 GB, por lo que encaja en una GPU de 16 GB en BF16 ajustada o en 24 GB con holgura; FP8/INT8 requeriría unos 8 GB y una cuantización de 4 bits unos 4 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090, A100 40/80 GB, H100; en el borde, RTX 5060 Ti 16 GB según la configuración validada por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato publicado es safetensors y la arquitectura ClassOne no es un transformer generativo estándar, por lo que requiere el runtime del proyecto `devops-thiago/class-one`.
- Latencia declarada: 52,49 ms de media en local (RTX 5060 Ti) frente a una API en la nube; medianas por suite entre 56,1 ms y 411,1 ms. No se publica throughput (tokens/s o decisiones/s).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La comparación se limita a características estructurales:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| classone-gemma4-e4b | 7,94 mil millones | no disponible | Apache 2.0 | Decisión en un forward pass (ClassOne) |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | no disponible | LLM generativo instruct |
| classone-qwen3.5-9b (mismo autor) | no disponible | no disponible | no disponible | Decisión ClassOne sobre Qwen 3.5 9B |

El autor referencia `classone-qwen3.5-9b` en Benchmark Heaven como otra entrada de la familia ClassOne, pero no se aportan sus métricas en esta información.

## Limitaciones y advertencias

- El tier Hard de JevBench cae al 45,9% de accuracy (ECE 0,3637), lo que indica degradación notable y peor calibración en tareas difíciles.
- En RLCDAlignBench el rendimiento global es bajo (59,4% de balanced accuracy, AUROC 0,601); ejes como sesgo social (0,475), sicofancia (0,500), rechazo ante jailbreaks (0,433) y ocultación de incertidumbre (0,469) están en el nivel del azar o por debajo.
- La detección de inyección de prompts en deepset alcanza 68,33% de recall con 100% de especificidad en benignos, lo que implica falsos negativos en entornos adversariales.
- Todos los benchmarks son auto-medidos por el autor en hardware de estación de trabajo; los resultados oficiales de terceros difieren y no se reproducen en esta información.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No se publica la longitud de contexto, lo que impide planificar su uso con documentos largos.
- Riesgo de alucinación no evaluado directamente; el modelo clasifica decisiones, pero sus puntuaciones de calibración varían mucho entre suites (ECE de 0,0022 a 0,3637).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar condiciones adicionales de Google no detalladas en esta ficha; conviene verificar los términos de `google/gemma-4-E4B-it`.
- La arquitectura ClassOne no es un transformer generativo estándar; no se garantiza compatibilidad con runtimes de inferencia convencionales.
- El modelo no genera texto: no es adecuado para tareas de redacción, resumen o diálogo libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-gemma4-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio ClassOne: https://github.com/devops-thiago/class-one
- JevBench: https://github.com/fstandhartinger/jevbench
- Dataset Decision Index: https://huggingface.co/datasets/multimodalart/jev-decision-index
- Benchmark Heaven (leaderboard JevBench): https://benchmarkheaven.com/jev-models
- Entrada Benchmark Heaven de classone-qwen3.5-9b: https://benchmarkheaven.com/jev-models/classone-qwen3.5-9b
- WildGuardTest: https://huggingface.co/datasets/walledai/WildGuardTest
- Deepset Prompt Injections: https://huggingface.co/datasets/deepset/prompt-injections
- NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
