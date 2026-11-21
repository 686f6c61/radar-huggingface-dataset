# EPFL-LARA/lean-standard-prover-qwen3-8b-grpo

## Resumen

Lean Standard Prover — Qwen3-8B es un modelo de generación de texto especializado en demostración automática de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA (École Polytechnique Fédérale de Lausanne). Se trata de un fine-tuning del modelo base Qwen/Qwen3-8B-Base (8.190.735.360 parámetros) que recibe como entrada un enunciado de teorema Lean 4 terminado en `by sorry` y genera una demostración completa en formato de bloque de código `lean4`, lista para ser verificada por el compilador Lean.

El modelo corresponde a la etapa "After GRPO" del paper S8 dentro de la colección "Formal Theorem Proving with Lean World Models" del autor. Su entrenamiento combina pre-entrenamiento continuado y SFT sobre datasets propios de Lean (lean-world-model-cpt, lean-world-model-sft) y un dataset de RL de Goedel-LM (RL_dataset_V2), seguido de un ajuste con GRPO (Group Relative Policy Optimization), una técnica de RL que optimiza directamente la recompensa sin modelo crítico.

Es relevante porque aborda una de las tareas más difíciles del razonamiento formal: la generación de pruebas verificables mecánicamente. A diferencia de los modelos de chat generalistas, este checkpoint está diseñado para un formato de prompt muy concreto ("standard prover response format") y una ventana de contexto de 32.768 tokens, lo que permite incluir importaciones de Mathlib y contexto extenso junto al teorema a demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning del base Qwen/Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16; el repo ocupa 16,4 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only de aproximadamente 8,19 mil millones de parámetros. Sobre esa base se aplica un pipeline de adaptación al dominio de Lean 4 en varias fases: pre-entrenamiento continuado con el dataset lean-world-model-cpt, ajuste supervisado (SFT) con lean-world-model-sft y entrenamiento con refuerzo mediante GRPO usando el dataset RL_dataset_V2 de Goedel-LM. El checkpoint publicado corresponde explícitamente a la etapa posterior a GRPO ("Stage: After GRPO", "Paper model: S8").

La innovación principal no está en la arquitectura, sino en la especialización del formato y en el uso de GRPO para optimizar la generación de pruebas verificables. El modelo emplea un prompt crudo (raw completion) sin tokens especiales de chat (`add_special_tokens=False`), con una plantilla fija que pide resolver el problema con código Lean 4 y comentarios explicativos, sustituyendo cada `sorry` por una prueba. La inferencia de referencia usa `attn_implementation="sdpa"` y `dtype=torch.bfloat16`.

## Capacidades

- Generación de demostraciones completas en Lean 4 a partir de un enunciado con `by sorry`, incluyendo importaciones y contexto.
- Razonamiento formal: inducción, reescritura, uso de tácticas (`rfl`, `simp_all`, etc.) y estructura de pruebas por casos.
- Generación de comentarios explicativos junto al código, dentro y fuera del bloque `lean4`.
- Salida estructurada: la respuesta contiene un bloque de código `lean4` del que se extrae la prueba final (último bloque completo) para verificación.
- Soporte de contexto largo (32.768 tokens) para incluir importaciones de Mathlib y definiciones auxiliares.
- Inferencia por muestreo múltiple (vLLM runner con `--samples`, temperatura 0,3 para una muestra y 0,7 para 32 muestras, top-p 0,95).
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documentan tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Demostración automática de teoremas en Lean 4: dado un enunciado como `theorem demo (n : ℕ) : n + 0 = n := by sorry`, el modelo genera la prueba completa que puede pasarse directamente al verificador Lean 4.15 con Mathlib.
- Asistencia a matemáticos formales: generación de borradores de prueba para teoremas nuevos que el investigador revisa y refina, reduciendo el coste de exploración de tácticas.
- Construcción de pipelines de verificación automática: el runner de vLLM devuelve JSONL con `response`, `lean_code` y `finish_reason`, lo que permite integrar la generación con un comprobador Lean en CI.
- Generación de datos sintéticos para entrenamiento: muestrear múltiples pruebas por teorema (32 muestras con temperatura 0,7) y filtrar las que compilan para crear datasets de SFT o RL.
- Evaluación de modelos de razonamiento formal: usar el checkpoint como referencia "standard prover" en benchmarks de demostración de teoremas Lean.
- Docencia de Lean 4: generar soluciones explicadas con comentarios para ejercicios, útiles como material de estudio o para comparar con soluciones humanas.
- Investigación en RL para matemáticas: servir de punto de partida (etapa post-GRPO) para experimentos de refinamiento con recompensa de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta un ejemplo cualitativo verificado con Lean 4.15 y Mathlib (el teorema `n + 0 = n` resuelto por inducción con `rfl` y `simp_all`), sin métricas agregadas de pass rate ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB de pesos, por lo que se necesitan en torno a 18-20 GB de VRAM para inferencia con overhead de activaciones y caché KV.
- GPU recomendadas: H100 (usada en el ejemplo oficial), A100 40/80 GB, L40S; en consumer, RTX 4090 (24 GB) es suficiente para BF16 con contexto moderado.
- Cabe en GPU consumer de 24 GB (RTX 4090, RTX 3090) en BF16; en GPUs de 16 GB requeriría cuantización, cuyos formatos no se documentan en la información disponible.
- Opciones de despliegue: transformers 4.57.3 con accelerate y SDPA (ejemplo oficial), vLLM 0.12.0 (runner oficial con muestreo múltiple), text-generation-inference (tag `text-generation-inference` en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; el ejemplo oficial limita la generación a 2.048 tokens nuevos y el presupuesto total al contexto de 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lean Standard Prover Qwen3-8B (este) | 8,19 B | 32.768 | Lean 4, formato standard prover, post-GRPO | apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base | 8,19 B | no disponible en esta ficha | Modelo base generalista | no disponible en esta ficha | Hugging Face |
| Alternativas específicas de Lean 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de otros provers Lean comparables (por ejemplo, variantes de Goedel-Prover u otros modelos de la colección del autor) que permitan una comparación numérica rigurosa.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el formato exacto de prompt del "standard prover"; usarlo como chat generalista o con otras plantillas degradará los resultados.
- Solo inglés: la model card declara únicamente `en` como idioma soportado.
- Riesgo de alucinación formal: puede generar pruebas sintácticamente plausibles que no compilan; toda salida debe verificarse con Lean 4 y Mathlib antes de usarse.
- Dependencia de la versión de Lean/Mathlib: el ejemplo se verificó con Lean 4.15 y Mathlib; cambios de versión pueden invalidar pruebas generadas.
- Selección de salida: debe extraerse el último bloque `lean4` completo; respuestas con varios bloques o texto explicativo requieren post-procesado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3 y de los datasets de entrenamiento (Goedel-LM/RL_dataset_V2) para cumplimiento completo.
- Sin datos publicados de benchmarks: no es posible estimar de antemano la tasa de éxito en producción sin evaluar sobre el propio conjunto de teoremas.
- Sin soporte documentado de tool calling, agentes, visión o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-grpo
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Respuesta completa de ejemplo: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-grpo/blob/main/example_response.txt
- Entrada/salida JSON de ejemplo: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-grpo/blob/main/example_output.json
- Prueba Lean de ejemplo: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-grpo/blob/main/example_proof.lean
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de pre-entrenamiento continuado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset de SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset de RL: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
