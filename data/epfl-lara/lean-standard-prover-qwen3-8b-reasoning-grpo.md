# EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo

## Resumen

Lean Standard Prover — Qwen3-8B es un modelo de generación de texto especializado en demostración automática de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA (École Polytechnique Fédérale de Lausanne). Se trata de un fine-tuning del modelo base Qwen/Qwen3-8B-Base, con 8.190.735.360 parámetros, orientado a producir demostraciones completas y verificables a partir de enunciados de teoremas que terminan en `by sorry`. El modelo sigue el formato de respuesta del "standard prover" y, en esta variante concreta, genera un plan de razonamiento informal antes de cada intento de demostración formal.

La relevancia del modelo radica en su aplicación al razonamiento matemático formal: a diferencia de los modelos de propósito general, está entrenado específicamente sobre datasets de Lean (lean-world-model-cpt, lean-world-model-sft, lean-world-model-reasoning-sft y el RL_dataset_V2 de Goedel-LM) y ajustado con GRPO (Group Relative Policy Optimization) para mejorar la calidad de las demostraciones generadas. Esto lo convierte en una herramienta útil para pipelines de verificación formal, autocompletado de pruebas en entornos Lean y experimentación con razonamiento neuro-simbólico.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con soporte para transformers, text-generation-inference y endpoints compatibles, y con un contexto de 32.768 tokens. Está orientado principalmente al inglés y su uso previsto es la generación de demostraciones Lean 4 verificables con Mathlib.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning del base Qwen/Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors BF16); cuantizaciones GGUF/AWQ no publicadas por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB); libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only denso de aproximadamente 8.200 millones de parámetros. Sobre esa base, EPFL-LARA aplica un pipeline de fine-tuning en varias etapas: preentrenamiento continuado sobre lean-world-model-cpt, ajuste supervisado sobre lean-world-model-sft y lean-world-model-reasoning-sft, y finalmente un ajuste con GRPO sobre Goedel-LM/RL_dataset_V2. La variante aquí descrita corresponde a la etapa "S8 + reasoning", es decir, posterior a la fase de razonamiento informal, e incorpora un plan de razonamiento informal antes de emitir la demostración formal.

La innovación técnica principal es la separación explícita entre razonamiento informal y demostración formal: el modelo produce primero secciones estructuradas (`[Problem Restatement]`, `[Useful Observations]`, `[Reasoning Path]`, `[Key Derivation]`, `[Proof Type]`, `[Formal Anchors]`, `[Final Solution]`) y después el bloque Lean 4 completo. El ajuste con GRPO optimiza directamente la recompensa de verificabilidad de las demostraciones, lo que reduce la tasa de pruebas que fallan al ser comprobadas por Lean. El prompt de completado se construye mediante `build_prompt` del repositorio y la tokenización usa `add_special_tokens=False`; la generación recomendada emplea temperatura 0,3, top-p 0,95 y `max_new_tokens` limitado por el presupuesto de contexto.

## Capacidades

- Generación de demostraciones completas en Lean 4 a partir de enunciados con `by sorry`, incluyendo imports y contexto del archivo `.lean`.
- Razonamiento informal estructurado previo a la demostración formal (restatement, observaciones, ruta de razonamiento, derivación clave, tipo de prueba, anclas formales y solución final).
- Razonamiento matemático formal multi-paso con verificación posterior en Lean 4.15 + Mathlib.
- Generación de texto técnica en inglés con formato controlado por el prompt del standard prover.
- Integración con tooling Lean: el resultado generado puede pasarse directamente a Lean para typechecking.
- No se documentan capacidades de tool calling, function calling, visión, audio ni agentes generales en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Autocompletado de pruebas en entornos Lean 4: el modelo recibe un archivo `.lean` con un teorema terminado en `by sorry` y devuelve una demostración completa lista para verificarse, integrándose en editores o extensiones de Lean para acelerar el trabajo de matemáticos formalizadores.
- Verificación formal en pipelines de CI: en un repositorio Mathlib o similar, el modelo puede generar candidatos de prueba que se ejecutan en un job de CI con Lean 4.15 para validar antes de abrir un pull request.
- Experimentación en razonamiento neuro-simbólico: investigadores pueden usar la separación entre plan informal y prueba formal para estudiar cómo el razonamiento en lenguaje natural guía la búsqueda de demostraciones verificables.
- Generación de datos de entrenamiento para modelos de theorem proving: las demostraciones verificadas que produce el modelo pueden filtrarse y reutilizarse como datos SFT o RL para otros modelos de la familia.
- Docencia y asistencia matemática: el plan informal estructurado sirve como explicación pedagógica de la estrategia de prueba, útil en entornos de enseñanza de lógica y matemáticas formales.
- Benchmarking de provers: al seguir un formato de respuesta estándar y usar un prompt reproducible (`build_prompt`), sirve como referencia comparable frente a otros provers Lean en evaluaciones internas.
- Reproducción de resultados: el ejemplo incluido en el repositorio (`Example.lean` con `theorem demo (n : ℕ) : n + 0 = n := by sorry`) permite validar el despliegue en H100 en BF16 con semilla 0 y comprobar que la salida typechequea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta un ejemplo cualitativo verificable (`theorem demo (n : ℕ) : n + 0 = n := by ...`), comprobado con Lean 4.15 y Mathlib, sin métricas agregadas de pass rate sobre datasets como MiniF2F, ProofNet o LeanWorkbook.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: H100 (referencia usada por el autor para el ejemplo), A100 40/80 GB, L40S, RTX 6000 Ada. Para contextos largos cercanos a 32.768 tokens, se necesita VRAM adicional por KV cache.
- GPU consumer: cabe en RTX 4090 (24 GB) en BF16 con contexto corto y generación limitada a ~2.048 tokens como en el ejemplo; en RTX 3090 (24 GB) o 4080 (16 GB) requiere cuantización (no publicada oficialmente) o contextos reducidos.
- Opciones de despliegue: transformers (versión recomendada 4.57.3 con accelerate y `attn_implementation="sdpa"`), text-generation-inference (tag oficial), endpoints compatibles. No se documentan recetas oficiales para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor documenta ejecución en H100 en BF16 con `max_new_tokens` hasta 2.048 y temperatura 0,3, pero sin cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo | 8,19 B | 32.768 | Prover Lean 4 con plan informal + GRPO | Apache 2.0 | Hugging Face (transformers, TGI) |
| Qwen/Qwen3-8B-Base | ~8,2 B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |
| Goedel-LM (familia) | no disponible | no disponible | Provers Lean entrenados con RL sobre RL_dataset_V2 | no disponible | Hugging Face (Goedel-LM) |
| DeepSeek-Prover (familia) | no disponible | no disponible | Provers Lean con RL y verificación | no disponible | Hugging Face |

La comparación cuantitativa de rendimiento entre estos provers no está disponible en la información proporcionada; los datos de pass rate sobre MiniF2F o ProofNet no se han publicado en esta ficha.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y evaluado únicamente en inglés; el prompt y el formato de respuesta están pensados para ese idioma.
- Dominio restringido: está especializado en Lean 4 y Mathlib; fuera de ese dominio su utilidad como modelo de propósito general es limitada y no se han publicado evaluaciones generales.
- Alucinación formal: puede generar demostraciones sintácticamente plausibles que no typechequean; toda salida debe verificarse con Lean antes de usarse.
- Contexto: la ventana de 32.768 tokens impone un presupuesto; el ejemplo del autor limita la generación a 2.048 tokens, y prompts muy largos pueden dejar sin espacio para la prueba.
- Formato: requiere el prompt exacto construido por `build_prompt` y `add_special_tokens=False`; desviarse del formato puede degradar la calidad de la salida.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento (incluido Goedel-LM/RL_dataset_V2) antes de redistribuir derivados.
- Cuantizaciones: no hay GGUF, AWQ ni GPTQ publicados oficialmente por el autor, lo que limita el despliegue en hardware consumer sin trabajo adicional.
- Sesgos: no se documentan análisis de sesgos; al ser un modelo matemático, el riesgo principal es de corrección formal más que de sesgo social, pero no hay evaluación publicada.
- Métricas: no se han publicado benchmarks agregados, por lo que la comparación con otros provers debe hacerse con evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset lean-world-model-cpt: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset lean-world-model-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset lean-world-model-reasoning-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-reasoning-sft
- Dataset Goedel-LM/RL_dataset_V2: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Organización EPFL-LARA: https://huggingface.co/EPFL-LARA
- Ejemplo completo de respuesta: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-reasoning-grpo/blob/main/
