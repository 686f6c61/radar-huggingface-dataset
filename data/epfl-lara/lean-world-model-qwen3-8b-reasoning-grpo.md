# EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo

## Resumen

Lean World-Model Prover — Qwen3-8B es un modelo de lenguaje especializado en demostración automática de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA. Se trata de un fine-tuning del modelo base Qwen3-8B-Base (8.190.735.360 parámetros) orientado a generar pruebas formales verificables por el compilador de Lean, incorporando en la propia respuesta los estados de objetivo (goal states) y los diagnósticos del compilador como comentarios inline. La variante aquí descrita, sufijada como `reasoning-grpo`, añade un plan de razonamiento informal antes de cada intento de prueba formal y ha sido optimizada mediante GRPO (Group Relative Policy Optimization) sobre el modelo base.

El modelo resuelve un problema clásico en la automatización de matemáticas formales: la brecha entre el razonamiento informal y la verificación formal. En lugar de limitarse a emitir tácticas de Lean a ciegas, el modelo predice el estado del objetivo en cada paso, simula la realimentación del compilador y permite intentos de reparación dentro de una misma respuesta. Esto lo convierte en un componente útil para pipelines de demostración asistida, donde el coste de cada iteración con el compilador es alto y conviene reducir el número de llamadas externas.

La relevancia actual del modelo radica en su enfoque de "world model" aplicado a la demostración: el modelo mantiene una representación interna del estado de la prueba y de los errores del compilador, lo que facilita la corrección autónoma. Con una ventana de contexto de 32.768 tokens, licencia Apache 2.0 y pesos en safetensors compatibles con transformers y vLLM, está pensado para investigadores y desarrolladores que trabajan en verificación formal, no para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning supervisado + GRPO |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16; compatibles con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM y text-generation-inference |
| Modelo base | Qwen/Qwen3-8B-Base |
| Etapa de entrenamiento | razonamiento informal + GRPO |
| Tamano del repositorio | 16,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only denso de 8.190 millones de parámetros. Sobre esa base, EPFL-LARA aplica un pipeline de ajuste en varias etapas: primero un continued pre-training (CPT) con el dataset `EPFL-LARA/lean-world-model-cpt`, después un fine-tuning supervisado (SFT) con `EPFL-LARA/lean-world-model-sft`, a continuación un SFT específico de razonamiento con `EPFL-LARA/lean-world-model-reasoning-sft` y finalmente un ajuste con GRPO sobre `Goedel-LM/RL_dataset_V2`. Esta variante concreta corresponde a la etapa "after informal reasoning", es decir, el modelo genera un plan de razonamiento informal antes de cada intento de prueba formal.

La innovación técnica principal es el formato de "world model": el modelo no solo emite código Lean, sino que intercala bloques de realimentación del compilador (`<feedback>`) con el estado del objetivo (`proof state`) dentro de comentarios Lean, de modo que la propia respuesta contiene la traza de verificación y permite reparaciones locales. El prompt de inferencia se construye con `build_prompt` sobre un fichero `.lean` de entrada que termina en `by sorry`; la tokenización usa `add_special_tokens=False` y el presupuesto de generación se calcula como `min(2048, 32768 - prompt_length)`. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada de los datasets más allá de sus identificadores.

## Capacidades

- Generación de pruebas formales en Lean 4 verificables por el compilador (validado con Lean 4.15 y Mathlib en el ejemplo de la model card).
- Predicción de estados de objetivo (goal states) inline dentro de la respuesta, en bloques `<feedback>`.
- Simulación de diagnósticos del compilador y reparación de intentos fallidos dentro de una misma respuesta.
- Razonamiento informal estructurado previo a la prueba formal: reafirmación del problema, observaciones útiles, ruta de razonamiento, derivación clave, tipo de prueba, anclajes formales y solución final.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado explícitamente; el bucle de reparación dentro de una respuesta es el mecanismo de multi-paso descrito.
- Capacidades multilingües: limitadas al inglés (`language: en`); el código Lean es independiente del idioma natural.
- Capacidad especial: modo de razonamiento informal previo a la prueba formal; variante GRPO del modelo.

## Casos de uso

- Demostración asistida de teoremas en Lean 4: el modelo recibe un fichero `.lean` con imports, contexto y un teorema terminado en `by sorry`, y devuelve una prueba completa con trazas de estado del objetivo. Es adecuado porque el formato de salida ya incluye la realimentación del compilador, lo que reduce iteraciones manuales.
- Reparación automática de pruebas fallidas: dado un error de compilación, el modelo puede generar un nuevo intento con el estado del objetivo corregido, gracias a su entrenamiento con diagnósticos inline y a la etapa GRPO orientada a la recompensa de verificación.
- Integración en pipelines de CI/CD para matemáticas formales: el modelo puede invocarse desde un job que compile el `.lean` resultante con Lean 4.15 y Mathlib, usando vLLM para servir múltiples muestras en paralelo con presupuestos de generación ampliados.
- Generación de borradores de pruebas para revisión humana: investigadores pueden usar el plan de razonamiento informal como documentación del enfoque, y la prueba formal como punto de partida verificable.
- Construcción de datasets de entrenamiento para demostradores: las trazas de razonamiento informal + prueba formal + feedback pueden servir como datos sintéticos etiquetados para futuros fine-tunings.
- Enseñanza de Lean 4: el modelo explica la ruta de razonamiento y los anclajes formales (`Nat.add_zero`, `simp`, etc.), lo que resulta útil en materiales didácticos de verificación formal.
- Evaluación comparativa de estrategias de RL para demostración: al ser una variante GRPO sobre el mismo base, sirve como punto de comparación frente a otros checkpoints de la familia Lean World-Model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta un ejemplo cualitativo verificado con Lean 4.15 y Mathlib (teorema `n + 0 = n` resuelto con `simp [Nat.add_zero]`), sin métricas agregadas tipo MMLU, HumanEval, GSM8K ni tasas de éxito en benchmarks de demostración (MiniF2F, ProofNet u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y 40-80 GB para contexto largo (32.768 tokens).
- GPU recomendadas: H100 (usada en el ejemplo oficial de la model card), A100 40/80 GB, L40S, RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto limitado, o en cuantización de 8 bits con más margen.
- Cabe en consumer GPU: sí, en RTX 4090 / RTX 3090 con cuantización o contexto reducido; no se garantiza en GPUs de 16 GB sin cuantización agresiva.
- Opciones de despliegue: transformers 4.57.3 con accelerate y `attn_implementation="sdpa"`, vLLM 0.12.0 (soporte oficial en la model card para múltiples muestras y presupuestos largos), text-generation-inference (tag `text-generation-inference`), endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada. El ejemplo oficial usa `temperature=0.3`, `top_p=0.95`, `top_k=0`, `min_p=0.0`, `repetition_penalty=1.0`, `num_beams=1` y hasta 2.048 tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lean World-Model Prover Qwen3-8B reasoning-grpo (este) | 8,19 B | 32.768 | Lean 4, world model, GRPO | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base | 8,19 B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |
| Otros checkpoints de la familia Lean World-Model | no disponible | no disponible | Lean 4, distintas etapas (SFT, reasoning) | Apache 2.0 (presumible) | Hugging Face (EPFL-LARA) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables (por ejemplo, demostradores especializados de otros laboratorios) en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado únicamente para inglés (`language: en`); las explicaciones en lenguaje natural no están garantizadas en castellano.
- Dominio restringido: es un modelo especializado en Lean 4; su uso como modelo conversacional general o para otras tareas de código no está validado y probablemente degrade respecto al base.
- Riesgo de alucinación formal: puede generar pruebas sintácticamente plausibles pero no verificables; siempre debe compilarse el resultado con Lean 4.15 y Mathlib antes de darlo por válido.
- Dependencia de versión: la verificación del ejemplo se realizó con Lean 4.15 y Mathlib; cambios de versión pueden invalidar pruebas o tácticas.
- Sesgos: no documentados en la información proporcionada; al derivar de Qwen3-8B-Base, hereda los sesgos del corpus de preentrenamiento original, atenuados por el ajuste especializado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets de entrenamiento (`lean-world-model-cpt`, `lean-world-model-sft`, `lean-world-model-reasoning-sft`, `Goedel-LM/RL_dataset_V2`) antes de redistribuir derivados.
- Contexto: 32.768 tokens; prompts que dejen menos de un token de presupuesto para la prueba provocan error explícito en el script de ejemplo.
- Advertencia de producción: el bucle de reparación dentro de una respuesta no sustituye a un verificador externo; se recomienda orquestar la compilación con Lean como paso obligatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo
- Respuesta completa de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo/blob/main/example_response.txt
- Entrada/salida JSON de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo/blob/main/example_output.json
- Prueba Lean de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo/blob/main/example_proof.lean
- Dataset CPT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset SFT de razonamiento: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-reasoning-sft
- Dataset RL (Goedel-LM): https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Organización EPFL-LARA en Hugging Face: https://huggingface.co/EPFL-LARA
