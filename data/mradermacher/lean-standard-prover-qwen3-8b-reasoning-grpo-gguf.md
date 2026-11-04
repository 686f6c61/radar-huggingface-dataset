# mradermacher/lean-standard-prover-qwen3-8b-reasoning-grpo-GGUF

## Resumen

Lean-standard-prover-qwen3-8b-reasoning-grpo es un modelo especializado en demostración automática de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA (Laboratory for Automated Reasoning and Analysis de la EPFL). Se construye sobre Qwen3-8B y se afina específicamente para generar demostraciones formales verificables en el asistente de pruebas Lean 4, un problema de razonamiento matemático de alta exigencia que requiere precisión sintáctica y semántica absoluta.

El modelo combina un preentrenamiento continuado sobre corpus de Lean (lean-world-model-cpt), un ajuste supervisado (SFT) sobre datos de demostración y un ajuste adicional de razonamiento, seguido de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre el dataset de refuerzo Goedel-LM/RL_dataset_V2. Esta combinación de SFT más RL busca mejorar la tasa de éxito en la búsqueda de demostraciones, no solo la fluidez del texto generado.

La versión aquí descrita es una cuantización GGUF estática publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. Con 8.190.735.360 parámetros y licencia Apache 2.0, es relevante para investigadores y desarrolladores que quieran integrar un probador de teoremas Lean 4 local sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen3-8B, con 8.190.735.360 parámetros. Sobre esa base, EPFL-LARA aplica un pipeline en varias fases: preentrenamiento continuado con el corpus lean-world-model-cpt, ajuste supervisado con lean-world-model-sft y lean-world-model-reasoning-sft, y finalmente un entrenamiento de refuerzo con GRPO sobre Goedel-LM/RL_dataset_V2. El objetivo del GRPO es optimizar directamente la recompensa de demostración válida, en lugar de solo imitar demostraciones existentes.

La model card del repositorio GGUF no detalla el número de tokens de entrenamiento, la composición exacta de los datasets ni hiperparámetros del RL. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La cuantización la realiza mradermacher con cuantizaciones estáticas (sin imatrix en el momento de la publicación), lo que implica que las versiones de baja precisión pueden degradar más la calidad que las cuantizaciones ponderadas equivalentes.

## Capacidades

- Generación de demostraciones formales en Lean 4, con sintaxis y tácticas verificables por el comprobador de Lean.
- Razonamiento matemático multi-paso orientado a la construcción de pruebas.
- Modo de razonamiento reforzado mediante GRPO, entrenado para mejorar la tasa de éxito en la búsqueda de demostraciones.
- Generación de texto conversacional en inglés, heredada de la base Qwen3.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni de multi-step reasoning genérico fuera del dominio de Lean.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni otros modos.

## Casos de uso

- Asistencia a investigadores en matemáticas formales: el modelo puede proponer demostraciones parciales o completas para lemas en Lean 4, que el investigador verifica y refina con el comprobador, acelerando la formalización de resultados.
- Automatización de tareas de formalización en proyectos Lean: integrado en un pipeline que recibe un enunciado de teorema y devuelve una táctica o script de demostración, reduciendo el trabajo manual repetitivo.
- Generación de datos sintéticos para entrenamiento: las demostraciones generadas y verificadas pueden reutilizarse como datos de entrenamiento para otros modelos o para aumentar el corpus Lean disponible.
- Evaluación comparativa de probadores de teoremas: sirve como referencia local (sin API) para medir tasas de éxito en benchmarks de Lean 4 frente a otros modelos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite trabajar con código y enunciados de teoremas sin enviarlos a servicios externos.
- Docencia y experimentación: con cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB) cabe en GPU de consumo, lo que facilita su uso en cursos de lógica, verificación formal y demostración automática.
- Investigación en RL para razonamiento: al ser un modelo afinado con GRPO, sirve de punto de partida para estudiar el efecto del refuerzo en tareas de demostración formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB (Q2_K), 4,9-5,1 GB (Q4_K_S/Q4_K_M), 6,0 GB (Q5_K_M), 8,8 GB (Q8_0) y 16,5 GB (f16), sin contar el overhead del contexto y del runtime.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8; A100 o H100 para f16 y para servir múltiples peticiones concurrentes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4_K_M o superiores; Q2_K y Q3_K_S caben en GPUs de 6-8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lean-standard-prover-qwen3-8b-reasoning-grpo (este) | 8,19 B | no disponible | Lean 4 / demostración formal | Apache 2.0 | GGUF y safetensors en HF |
| Qwen3-8B (base) | 8 B aprox. | no disponible | Propósito general | Apache 2.0 | HF |
| Goedel-Prover (familia) | no disponible | no disponible | Lean 4 / demostración formal | no disponible | HF |
| DeepSeek-Prover (familia) | no disponible | no disponible | Lean 4 / demostración formal | no disponible | HF |

La comparación cuantitativa con alternativas de demostración formal no está disponible en la información proporcionada; los modelos citados se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su uso en castellano u otros idiomas no está soportado ni evaluado.
- Riesgo de alucinación elevado en un dominio donde una demostración incorrecta es inútil: toda salida debe verificarse con el comprobador de Lean 4 antes de considerarse válida.
- Las cuantizaciones estáticas de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la tasa de éxito en demostraciones; se recomienda Q4_K_M o superior para uso serio.
- No se documentan sesgos específicos, pero al derivar de Qwen3-8B puede heredar sesgos del corpus original.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales del autor original más allá de la licencia.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar pipelines con enunciados y contextos largos.
- El repositorio GGUF tiene 0 likes y 538 descargas en el momento de la consulta; es una cuantización de terceros, no la versión oficial de EPFL-LARA.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lean-standard-prover-qwen3-8b-reasoning-grpo-GGUF
- Modelo base: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo
- Página de descargas del cuantizador: https://hf.tst.eu/model#lean-standard-prover-qwen3-8b-reasoning-grpo-GGUF
- Dataset de preentrenamiento: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset SFT de razonamiento: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-reasoning-sft
- Dataset de RL: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
