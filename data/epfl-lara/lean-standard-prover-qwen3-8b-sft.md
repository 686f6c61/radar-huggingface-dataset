# EPFL-LARA/lean-standard-prover-qwen3-8b-sft

## Resumen

Lean Standard Prover Qwen3-8B es un modelo de generación de texto especializado en demostración automática de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA (Laboratory for Automated Reasoning and Analysis de la EPFL). Se trata de un ajuste fino supervisado (SFT) del modelo base Qwen3-8B-Base, entrenado para producir demostraciones completas y verificables a partir de enunciados de teoremas escritos en Lean 4 con `sorry` como marcador de prueba pendiente.

El modelo se enmarca dentro de la línea de investigación "Formal Theorem Proving with Lean World Models" del grupo, y corresponde a la etapa previa al entrenamiento con GRPO (S8, antes de GRPO) de un pipeline más amplio de refinamiento por refuerzo. Su función es resolver un problema concreto: dado un contexto Lean (imports, definiciones, lema y objetivo), generar código Lean 4 que sustituya el `sorry` por una demostración que pase la verificación del comprobador de tipos de Lean.

Arquitectura transformer decoder-only Qwen3 con 8.190.735.360 parámetros, contexto de 32.768 tokens y licencia Apache 2.0. Su relevancia práctica radica en que combina un tamaño manejable (8B) con un formato de respuesta estandarizado que facilita la integración en pipelines de verificación automática, y en que parte de un modelo base con buen rendimiento multilingüe y de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo documenta BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3-8B-Base, un transformer decoder-only denso de 8,19 mil millones de parámetros. No se trata de una arquitectura MoE ni híbrida: es un transformer estándar con atención completa y decodificación autorregresiva. La model card no detalla innovaciones arquitectónicas propias más allá de las del modelo base.

El entrenamiento se realizó en dos fases documentadas mediante los datasets referenciados: un preentrenamiento continuado sobre `EPFL-LARA/lean-world-model-cpt` y un ajuste fino supervisado sobre `EPFL-LARA/lean-world-model-sft`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO en esta etapa; la model card indica explícitamente que este checkpoint es la etapa "Before GRPO", lo que sugiere que el refinamiento por refuerzo se aplicó en un checkpoint posterior de la misma línea. El modelo se entrena con un prompt en formato crudo (sin chat template) y se espera una respuesta que contenga un bloque de código `lean4` con la demostración completa.

## Capacidades

- Generación de demostraciones completas en Lean 4 a partir de enunciados de teoremas con `sorry`, incluyendo imports y contexto.
- Sustitución de todos los `sorry` del enunciado por pasos de prueba verificables por el comprobador de tipos de Lean 4.
- Generación de texto explicativo y comentarios en inglés junto al código Lean.
- Formato de respuesta estandarizado: un bloque de código `lean4` delimitado, del que se extrae el último bloque completo como candidato a verificación.
- Capacidad de razonamiento matemático formal (inducción, reescritura, uso de lemas de Mathlib).
- Soporte de decodificación por muestreo (temperatura, top-p, top-k, min-p) para generar múltiples candidatos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- **Automatización de pruebas en proyectos Lean 4**: dado un archivo `.lean` con teoremas marcados con `sorry`, el modelo genera candidatos de prueba que se verifican con Lean 4.15 y Mathlib; el último bloque `lean4` de la respuesta se extrae como prueba candidata. Adecuado para reducir el trabajo manual en formalizaciones.
- **Asistente de formalización en investigación matemática**: el investigador escribe el enunciado del teorema y el contexto (imports, definiciones auxiliares) y el modelo propone una demostración que puede verificarse mecánicamente, sirviendo como borrador inicial para su refinamiento.
- **Generación de múltiples candidatos con vLLM**: el runner incluido permite generar 32 muestras por enunciado con temperatura 0,7 y top-p 0,95, lo que permite un filtrado por verificación (best-of-N) para aumentar la tasa de éxito en pipelines de demostración automática.
- **Generación de datos sintéticos para entrenamiento**: las demostraciones generadas y verificadas con éxito pueden usarse como datos de entrenamiento para modelos posteriores o para el propio pipeline de GRPO de la línea Lean World Models.
- **Evaluación comparativa de provers**: al seguir el formato de `evaluate_prover_model_run.py`, el modelo puede integrarse en benchmarks estandarizados de demostración formal y compararse con otros provers de la misma categoría.
- **Integración en entornos de CI para bibliotecas Lean**: un pipeline que detecte `sorry` en un repositorio puede invocar al modelo para proponer pruebas y verificar automáticamente las que compilen, marcando las que fallen para revisión humana.
- **Enseñanza de demostración formal**: el modelo produce pruebas con comentarios explicativos en inglés, útiles como material de estudio de tácticas y estrategias de prueba en Lean 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta un ejemplo cualitativo: el teorema `theorem demo (n : ℕ) : n + 0 = n := by sorry` genera una prueba por inducción que se verifica correctamente con Lean 4.15 y Mathlib, ejecutado en una H100 en BF16 con semilla 0, temperatura 0,3 y top-p 0,95.

## Requisitos de hardware

- **VRAM estimada en BF16**: aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM para inferencia con contexto moderado.
- **GPU recomendadas**: H100 (usada en el ejemplo documentado), A100 40/80 GB, L40S, RTX 4090 (24 GB) para BF16 con contexto corto.
- **Consumer GPU**: cabe en RTX 4090 (24 GB) en BF16 para contextos moderados; en GPUs de 16 GB sería necesario cuantizar, aunque la model card no documenta cuantizaciones oficiales.
- **Opciones de despliegue**: Hugging Face Transformers (versión 4.57.3 documentada, con `attn_implementation="sdpa"`), vLLM (versión 0.12.0 documentada) y text-generation-inference (tag `text-generation-inference` en el repo).
- **Latencia y throughput**: no disponibles. El ejemplo documentado usa un presupuesto máximo de 2048 tokens generados y un contexto total de 32.768 tokens; el runner de vLLM ajusta los tokens de salida al espacio restante tras el prompt.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de demostración formal (como otros provers basados en Lean) que permitan una comparación rigurosa. La comparación se limita a características estructurales del modelo base:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Lean Standard Prover Qwen3-8B (SFT) | 8,19B | 32.768 | Apache 2.0 | Demostracion Lean 4 |
| Qwen3-8B-Base (modelo base) | 8,19B | no disponible en esta ficha | Apache 2.0 | Generacion general |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo está entrenado exclusivamente para generar demostraciones Lean 4 en inglés; su uso fuera de ese dominio no está validado y probablemente degrade su calidad.
- **Riesgo de alucinación**: puede generar pruebas sintácticamente plausibles pero lógicamente inválidas o que no compilan; toda salida debe verificarse con Lean 4 y Mathlib antes de aceptarse.
- **Idioma**: la model card declara únicamente inglés; no se documenta soporte de castellano ni de otros idiomas.
- **Etapa pre-GRPO**: este checkpoint es anterior al refinamiento por refuerzo de la línea, por lo que su tasa de éxito puede ser inferior a la de versiones posteriores del mismo proyecto.
- **Formato de prompt rígido**: requiere el prompt crudo exacto generado por `build_prompt` y `add_special_tokens=False`; desviarse del formato puede degradar la calidad de las demostraciones.
- **Contexto**: el presupuesto total es de 32.768 tokens, compartido entre prompt y salida; prompts largos reducen el espacio disponible para la prueba.
- **Sesgos**: no se documentan análisis de sesgos en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-8B-Base y de los datasets de entrenamiento antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-sft
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset de ajuste fino supervisado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Respuesta completa de ejemplo: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-sft/blob/main/example_response.txt
- Entrada/salida JSON de ejemplo: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-sft/blob/main/example_output.json
- Prueba Lean de ejemplo: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-sft/blob/main/example_proof.lean
