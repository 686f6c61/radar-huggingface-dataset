# sitao/atomic-to-composite-qwen2.5-0.5b-atomic-first-rl

## Resumen

Este modelo es un ajuste fino de Qwen2.5-0.5B desarrollado por el investigador Sitao Cheng y colaboradores como artefacto de investigación del estudio "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). El modelo aborda el problema de la generalización composicional en razonamiento multi-hop: cómo un modelo que ha aprendido habilidades atómicas (memoria y uso de contexto) puede componerlas para responder preguntas complejas sobre hechos distribuidos en múltiples párrafos.

La receta de entrenamiento es la que el paper recomienda: primero SFT sobre habilidades atómicas (SFT<sub>Mem+Ctx</sub>) y después aprendizaje por refuerzo con GRPO sobre pares de QA complementarios (RL<sub>Comp</sub>). Según el paper, esta receta "atomic-first" produce la mejor precisión zero-shot en todos los tamaños de modelo evaluados, lo que lo convierte en una referencia útil para investigar composición de habilidades en modelos pequeños.

Con 630 millones de parámetros y licencia Apache 2.0, es un modelo muy ligero, ejecutable en hardware de consumo. No obstante, está entrenado sobre biografías sintéticas y no pretende ser un asistente de propósito general: su utilidad principal es la investigación en razonamiento composicional y QA multi-hop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), causal LM |
| Parametros totales | 630.167.424 |
| Parametros activos | no disponible (no es MoE; equivale a los totales) |
| Longitud de contexto | no disponible (la familia Qwen2.5-0.5B base soporta 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16/fp16 en el repo) |
| Idiomas soportados | Ingles (entrenado solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,3 GB en el repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder causal estándar de la familia Qwen2.5. No es un modelo MoE ni emplea arquitecturas híbridas: la innovación está en la receta de entrenamiento, no en la arquitectura. El entrenamiento se realiza en dos etapas. Primero, un SFT sobre habilidades atómicas (memoria y contexto) usando el framework LLaMA-Factory, dando lugar al checkpoint base `sitao/atomic-to-composite-qwen2.5-0.5b-sft-atomic`. Segundo, aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) implementado en verl, aplicado sobre pares de QA "complementarios" (COMP) del dataset `sitao/From_atomic_to_composite`.

Los datos de entrenamiento proceden del dataset sintético `From_atomic_to_composite`, compuesto por biografías sintéticas con preguntas de respuesta multi-hop que requieren combinar hechos atómicos. El paper evalúa la generalización en tres niveles: IID (distribución idéntica), Composition y Zero-shot, y muestra que la receta atomic-first con RL supera al SFT directo sobre la tarea compuesta y a la receta composite-first. El modelo genera una cadena de razonamiento y termina con el formato `So, the answer is: <answer>`. No se menciona el uso de RLHF con preferencias humanas ni DPO.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas: encadena hechos atómicos distribuidos en varios párrafos de contexto para llegar a la respuesta.
- Generación de cadenas de razonamiento explícitas antes de emitir la respuesta final (formato fijo `So, the answer is: <answer>`).
- Razonamiento complementario: combina memoria de hechos y uso de contexto proporcionado, dos habilidades entrenadas por separado en la fase SFT.
- Generalización composicional: según el paper, es la receta con mejor precisión zero-shot en su categoría de tamaño.
- No tiene capacidades de visión, audio ni multimodalidad.
- No hay soporte documentado de tool calling, function calling ni uso agéntico.

## Casos de uso

- Investigación en generalización composicional: permite replicar y extender los experimentos del paper sobre cómo el RL compone habilidades atómicas en modelos pequeños; es el caso de uso principal para el que fue creado.
- Estudio de recetas de entrenamiento SFT + RL: sirve como baseline reproducible (LLaMA-Factory para SFT, verl para GRPO) al comparar recetas atomic-first frente a composite-first en proyectos propios.
- Benchmarking de QA multi-hop en modelos pequeños: al pesar solo 630M de parámetros, es ideal para evaluar pipelines de recuperación y razonamiento multi-hop en hardware limitado.
- Prototipado de sistemas RAG con razonamiento sobre contexto: dado que acepta pregunta más párrafos de contexto con el marcador `PARAGRAPH:`, puede integrarse en prototipos que razonan sobre documentos recuperados.
- Docencia y formación: por su tamaño y licencia permisiva, es adecuado para laboratorios académicos donde se estudian GRPO, verl y entrenamiento por refuerzo de LLMs sin coste computacional elevado.
- Investigación en destilación de razonamiento: como modelo que genera cadenas de razonamiento con formato parseable, puede usarse como generador de trazas para estudiar filtrado o evaluación automática de razonamientos.

## Benchmarks y rendimiento

Resultados publicados sobre el test set Complementary (COMP) de 4.468 items, por nivel de generalización (precisión en %, extraídos del log de validación del entrenamiento según el paper, Figura 8):

| Benchmark | IID | Composition | Zero-shot |
|---|---:|---:|---:|
| COMP test set (4.468 items) | 63,00 | 52,86 | 34,20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-2 GB en fp16/bf16 (el repo ocupa 1,3 GB); con cuantización INT8/INT4 podría reducirse por debajo de 1 GB, aunque no hay pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una RTX 3060 de 12 GB, una RTX 4090 o incluso GPUs integradas con suficiente memoria son suficientes.
- Cabe con holgura en GPUs de consumo: ejecutable incluso en portátiles con GPU de 4 GB, o en CPU con suficiente RAM dada la ligereza del modelo.
- Opciones de despliegue: transformers (librería nativa del modelo), vLLM, llama.cpp (previa conversión a GGUF por el usuario, no hay GGUF publicado), Ollama (previa conversión) y TGI; el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponible; por su tamaño (630M de parámetros), se espera latencia baja y throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

Comparativa con los otros tres modelos de la misma familia y tamaño (todos derivados de Qwen2.5-0.5B y evaluados en el mismo test set COMP):

| Modelo | Receta | Precisión COMP (IID / Comp / Zero-shot) | Licencia |
|---|---|---|---|
| atomic-to-composite-qwen2.5-0.5b-atomic-first-rl (este modelo) | SFT<sub>Mem+Ctx</sub> → RL<sub>Comp</sub> | 63,00 / 52,86 / 34,20 | Apache 2.0 |
| atomic-to-composite-qwen2.5-0.5b-sft-atomic | SFT atómico (SFT<sub>Mem+Ctx</sub>) | no disponible | Apache 2.0 |
| atomic-to-composite-qwen2.5-0.5b-sft-composite | SFT compuesto (SFT<sub>Comp</sub>) | no disponible | Apache 2.0 |
| atomic-to-composite-qwen2.5-0.5b-composite-first-rl | SFT<sub>Comp</sub> → RL<sub>Comp</sub> | no disponible | Apache 2.0 |

Frente a alternativas externas de tamaño similar (Qwen2.5-0.5B base, Llama 3.2-1B, SmolLM2-360M), no hay comparativas directas publicadas en la información disponible; el paper compara recetas dentro de la familia Qwen2.5 en varios tamaños (Figura 8). Este modelo no compite en benchmarks generales: su valor es específico del dominio de razonamiento composicional.

## Limitaciones y advertencias

- Dominio muy restringido: está entrenado exclusivamente sobre biografías sintéticas del dataset `From_atomic_to_composite`; los propios autores advierten que es un artefacto de investigación, no un asistente de propósito general.
- Riesgo alto de alucinación fuera de dominio: ante preguntas generales, de código o en otros idiomas, el comportamiento no está evaluado y puede producir respuestas sin sentido o con el formato de razonamiento forzado.
- Solo inglés: el modelo está entrenado en inglés; no debe esperarse capacidad multilingüe.
- Formato de salida rígido: siempre genera una cadena de razonamiento y termina con `So, the answer is: <answer>`; cualquier uso en producción requiere parsear ese formato.
- Precisión limitada: incluso en el nivel IID alcanza un 63,00 %, y cae al 34,20 % en zero-shot, lo que lo descarta para aplicaciones que exijan fiabilidad alta.
- Contexto y cuantización: la longitud de contexto efectiva no está documentada en la model card y no hay pesos cuantizados oficiales.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque el uso previsto es investigativo.
- Cobertura de benchmarks mínima: solo hay resultados del test COMP propio del paper; no hay evaluaciones en benchmarks estándar para comparar con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-atomic-first-rl
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base SFT atomic: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-atomic
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B
