# sirCamp/Qwen3.5-4B-agent-grpo

## Resumen

Qwen3.5-4B-agent-grpo es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3.5-4B, publicado por el usuario sirCamp. El objetivo declarado no es mejorar el modelo base en capacidades generales, sino convertirlo en un agente local más fiable: llamadas a herramientas más consistentes, mejor uso de memoria entre turnos, menos invocaciones a herramientas irrelevantes y un razonamiento significativamente más corto. Mantiene la misma arquitectura, plantilla de chat y formato de tool calling que el modelo base.

El modelo conserva la modalidad image-text-to-text del Qwen3.5-4B original, con 4.659.865.088 parámetros en pesos bf16 y un repositorio de 9,5 GB. El entrenamiento se realizó con GRPO sobre LoRA (rango 32, alpha 64) en todas las capas lineales del modelo de lenguaje, dejando intacta la torre de visión. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual radica en el compromiso explícito que documenta el autor: gana en tareas agénticas (BFCL-v4 overall +5,4 puntos, memoria +9,0) a costa de razonar aproximadamente un 40 % menos, lo que perjudica el rendimiento en matemáticas de competición y código difícil cuando el presupuesto de tokens es amplio (60k). Es un modelo pensado para despliegues locales con ventanas de contexto moderadas, no para maximizar benchmarks de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; no se detalla la variante interna |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3.5-4B la define) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y aplica un ajuste fino con GRPO mediante verl 0.9.1. El entrenamiento usa LoRA con rango 32 y alpha 64 sobre todas las capas lineales del modelo de lenguaje; la torre de visión no se modifica. Las recompensas son binarias y dependen únicamente del resultado final de la tarea, no de pasos intermedios. El checkpoint publicado corresponde al paso 50 del entrenamiento: según el autor, pasos posteriores no mejoraron los benchmarks agénticos y degradaron el seguimiento de instrucciones (IFEval 83,7 en el paso 121).

El conjunto de entrenamiento cubre siete entornos: programación de calendario con verificador de restricciones, asistente de trabajo con 27 herramientas, una variante del mismo asistente con un usuario simulado (interpretado por Qwen3.8-27B) que obliga a pedir información antes de actuar, búsqueda multi-salto con herramientas `search` y `open_page` sobre un índice local cerrado, y problemas de matemáticas de un solo turno, entre otros. Un formato de tool call incorrecto o una llamada a una herramienta no ofrecida termina el episodio con recompensa 0, lo que refuerza el cumplimiento estricto del protocolo.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con el modelo base.
- Tool calling y function calling con el mismo formato que Qwen3.5-4B, reforzado mediante RL.
- Uso de memoria entre turnos: retención y reutilización de información a lo largo de una sesión (principal mejora, +9,0 en BFCL-v4 agentic).
- Razonamiento agéntico multi-paso en entornos con múltiples herramientas (hasta 27 herramientas en las tareas de entrenamiento).
- Capacidad de pedir aclaraciones a un usuario simulado antes de actuar cuando falta información.
- Reducción de llamadas a herramientas irrelevantes (+4,6 en la categoría de hallucination/irrelevancia de BFCL-v4).
- Procesamiento de imagen y texto (pipeline image-text-to-text heredado del modelo base).
- Capacidades matemáticas y de código presentes, aunque degradadas frente al base con presupuestos largos.
- Razonamiento más conciso: aproximadamente un 40 % menos de tokens de pensamiento que el modelo base.

## Casos de uso

- Agentes locales de automatización de escritorio o productividad: el modelo puede encadenar llamadas a herramientas (calendario, correo, gestor de tareas) con menos errores de formato y menos invocaciones innecesarias, lo que reduce latencia y coste en despliegues con GPU de consumo.
- Asistentes conversacionales con memoria de sesión: la mejora de +9,0 puntos en la categoría de memoria de BFCL-v4 lo hace adecuado para chatbots que deben recordar preferencias y datos aportados en turnos anteriores sin repetir preguntas.
- Enrutado y orquestación de herramientas en pipelines RAG: con 27 herramientas disponibles en entrenamiento, puede seleccionar la herramienta correcta y evitar llamadas a funciones fuera de catálogo, algo crítico en sistemas con APIs sensibles.
- Agentes de búsqueda multi-salto sobre índices locales: soporta `search` y `open_page` para responder preguntas que requieren varias consultas encadenadas, útil en asistentes de documentación interna.
- Automatización con presupuesto de tokens limitado: al razonar un 40 % menos, encaja en despliegues con ventanas de 32k o menos donde el modelo base agota tokens antes de terminar (43 % de respuestas de LiveCodeBench del base superaban 32.768 tokens frente al 11 % de este modelo).
- Prototipado de agentes con requisito de aclaración: la variante entrenada con usuario simulado le permite formular preguntas antes de ejecutar acciones destructivas, útil en flujos de aprobación o reservas.
- Evaluación e investigación en RL para agentes: al publicarse con receta completa (GRPO, verl, LoRA, checkpoint y conjunto de entornos), sirve como referencia reproducible para estudiar el intercambio entre brevedad de razonamiento y rendimiento agéntico.

## Benchmarks y rendimiento

Datos aportados por el autor, medidos con el mismo protocolo para ambos modelos (thinking on, plantilla oficial, temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5, bf16, vLLM, una semilla de entrenamiento).

| Benchmark | Qwen3.5-4B | Este modelo |
|---|---|---|
| BFCL-v4 overall | 56,87 | 62,28 |
| BFCL-v4 agentic (memoria) | 50,32 | 59,35 |
| BFCL-v4 multi-turn | 43,00 | 46,50 |
| BFCL-v4 single-turn, non-live | 82,86 | 84,64 |
| BFCL-v4 single-turn, live | 78,61 | 79,72 |
| BFCL-v4 hallucination (irrelevancia) | 76,97 | 81,58 |
| tau2-bench pass^1 (278 tareas) | 66,2 | 68,0 |
| IFEval prompt-level strict | 88,0 / 88,4 | 88,0 / 87,1 |
| MMLU-Pro | 78,4 | 78,8 |
| GPQA-Diamond | 79,3 / 77,8 | 76,8 / 75,8 |
| AIME 2025, 4 muestras (32.768 tokens) | 51,7 / 51,7 | 69,2 / 61,7 |
| AIME 2025, 8 muestras (61.440 tokens) | 75,8 | 60,8 |
| AIME 2026, 8 muestras (61.440 tokens) | 78,8 | 68,3 |
| LiveCodeBench v6, 4 muestras (61.440 tokens) | 56,4 | 51,3 |
| LiveCodeBench v6, solo respuestas ≤32.768 tokens | 49,0 | 51,1 |

En BFCL-v4, con emparejamiento sobre 4.906 ítems, la ganancia es de +3,2 puntos (intervalo del 95 %: +2,2 a +4,2). La diferencia en tau2-bench queda dentro del ruido (+1,8; intervalo -3,6 a +7,2). El autor advierte que las categorías de memoria de BFCL varían mucho entre ejecuciones. Los resultados de AIME y LiveCodeBench muestran el compromiso: con 32k tokens el modelo ajustado es competitivo o mejor en AIME 2025, pero con 61k el base domina en matemáticas de competición y código difícil.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 12-16 GB según longitud de contexto y lote.
- Cuantización no publicada oficialmente; al ser safetensors bf16, la reducción a 8 bits o 4 bits requeriría conversión por parte del usuario (no se ofrecen GGUF en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado. En GPUs de 16 GB (RTX 4080, A4000) probablemente haga falta cuantización.
- Cabe en GPU de consumo de gama alta (RTX 4090, RTX 3090) en bf16 si se limita el contexto y el tamaño de lote.
- Despliegue: el autor midió con vLLM; también es compatible con transformers (librería declarada) y, previa conversión, con llama.cpp u Ollama. Compatible con endpoints según los tags.
- Latencia y throughput: no disponibles. El autor señala únicamente que el modelo responde más rápido al razonar aproximadamente un 40 % menos (mediana de razonamiento en LiveCodeBench: 15,5k tokens frente a 26,7k del base).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL-v4 overall | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-agent-grpo | 4,66B | no disponible | 62,28 | 78,8 | Apache 2.0 | Hugging Face (safetensors) |
| Qwen3.5-4B (base) | 4,66B | no disponible | 56,87 | 78,4 | Apache 2.0 | Hugging Face |
| Alternativas de 4B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base, del que mejora en tareas agénticas y empeora en matemáticas y código con presupuestos largos. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Razonamiento reducido: aproximadamente un 40 % menos de tokens de pensamiento, lo que degrada matemáticas de competición y código difícil con presupuestos de 60k tokens (AIME 2026: 68,3 frente a 78,8 del base; LiveCodeBench: 51,3 frente a 56,4).
- Riesgo de alucinación en tool calling mitigado pero no eliminado: la categoría de irrelevancia de BFCL-v4 sube a 81,58, lo que implica que aún hay margen de error en llamadas a herramientas no aplicables.
- Alta varianza en las categorías de memoria de BFCL-v4 entre ejecuciones, según el propio autor; los resultados de una sola semilla deben interpretarse con cautela.
- Sin datos publicados sobre sesgos, idiomas soportados ni comportamiento multilingüe; no se puede garantizar calidad fuera del inglés.
- El checkpoint es el paso 50; pasos posteriores degradaron IFEval, lo que sugiere que el ajuste es sensible a la duración del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de entrenamiento de terceros (Nemotron, CC-BY-4.0, entre otros).
- El repositorio no incluye cuantizaciones GGUF ni versiones optimizadas; el despliegue en hardware modesto requiere trabajo adicional de conversión.
- Cero descargas y cero likes en el momento de la consulta: no hay validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sirCamp/Qwen3.5-4B-agent-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Repositorio de verl: https://github.com/volcengine/verl
- Dataset de calendario: https://huggingface.co/datasets/nvidia/Nemotron-RL-agent-calendar_scheduling
- Dataset de asistente de trabajo: https://huggingface.co/datasets/nvidia/Nemotron-RL-agent-workplace_assistant
- Dataset de búsqueda agéntica: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset de matemáticas: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Dataset de destilación: https://huggingface.co/datasets/logic65/whittle-distill-qwen3.8-27b
