# dpavlis/Qwen3.8-27B-CTL-FP8

## Resumen

Qwen3.8-27B-CTL-FP8 es una versión cuantizada en FP8 del modelo dpavlis/Qwen3.8-27B-CTL, un fine-tuning de Qwen3.8-27B especializado en CTL2, el lenguaje de transformación propietario de CloverDX. Lo desarrolla el usuario independiente dpavlis y resuelve un problema muy concreto: la generación, explicación, revisión y corrección automática de código CTL2 para pipelines ETL. La relevancia es acotada pero clara para equipos que trabajan con CloverDX y quieren integrar asistencia de código en su flujo de trabajo sin depender de un modelo generalista.

La arquitectura subyacente es la de Qwen3.8-27B, un transformer híbrido con capas de atención completa y atención lineal (Mamba), según se deduce de la mención a "Mamba cache blocks" y "linear-attention projections" en la model card. El checkpoint conserva la torre de visión del modelo base por compatibilidad arquitectónica, aunque el entrenamiento y la evaluación se hicieron solo con texto. El contexto máximo recomendado en el ejemplo de despliegue es de 16.384 tokens.

La cuantización reduce el peso de los pesos de 54 GB a 29 GB manteniendo, según el autor, una calidad equivalente a la versión bf16 dentro del ruido de medición. Está pensada para servirse con vLLM sobre GPUs con tensor cores FP8 (Ada Lovelace, Hopper o Blackwell). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal (Mamba), según referencias de la model card; sin confirmación detallada del autor |
| Parametros totales | 27B (según nombre del modelo; no se detalla el desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de despliegue recomendada (no se especifica el máximo nativo) |
| Tipos de cuantizacion | FP8 (E4M3) con `FP8_DYNAMIC` de compressed-tensors; pesos con una escala por canal de salida, activaciones escaladas por token en runtime; 400 capas Linear cuantizadas; `lm_head`, embeddings, normas, `in_proj_a`/`in_proj_b` y torre de visión en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-CTL es un fine-tuning supervisado (SFT con LoRA, según el dataset `dpavlis/ctl_lora_sft_data`) sobre Qwen3.8-27B, orientado a CTL2. La model card remite a la del modelo bf16 para los detalles de entrenamiento, que no se reproducen aquí. La arquitectura del modelo base es un transformer híbrido: la model card menciona explícitamente proyecciones de atención lineal, proyecciones de puerta `in_proj_a`/`in_proj_b` y bloques de caché Mamba, lo que confirma una mezcla de atención completa y atención lineal tipo Mamba. También conserva una torre de visión heredada del modelo base, aunque no se entrenó ni evaluó con imágenes.

La cuantización se realizó con llm-compressor 0.15 y el formato compressed-tensors, aplicando FP8 dinámico a las 400 capas Linear del modelo de lenguaje (proyecciones de atención, atención lineal y MLP). Los tensores mantenidos en bf16 son bit-idénticos a los del modelo bf16 original. El autor indica que la receta está en `recipe.yaml` y que no se usaron datos de calibración para las activaciones, ya que el escalado es por token en runtime. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de código CTL2 para transformaciones de CloverDX (por ejemplo, Reformat).
- Explicación del lenguaje CTL2 y de construcciones concretas.
- Revisión de código CTL2 con hallazgos etiquetados como `[ERROR]` o `[WARNING]`.
- Corrección de código a partir de errores de compilación o de ejecución, con hasta dos reintentos recomendados.
- Modo de razonamiento (thinking) activable mediante `chat_template_kwargs` con `enable_thinking` y `reasoning_effort` (por ejemplo, `medium`).
- Uso como contexto de grafos CloverDX para tareas de CTL, aunque no está entrenado para diseñar grafos completos ni escribir XML de componentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas explícitamente; el flujo compile-and-retry se plantea como bucle externo, no como capacidad nativa del modelo.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión: la torre de visión se conserva por compatibilidad, pero el modelo no fue entrenado ni evaluado con imágenes.

## Casos de uso

- Generación de transformaciones CTL2 en pipelines ETL: el modelo escribe código Reformat u otras transformaciones a partir de una descripción en lenguaje natural, con un 92 % de acierto en el primer intento en las evaluaciones internas del autor sobre 165 tareas de dominio nuevo.
- Revisión automática de código CTL2 en revisiones de pull requests: detecta defectos plantados con una tasa del 94 % y no genera falsos `[ERROR]` sobre código limpio en las pruebas del autor, lo que permite integrarlo como paso de revisión sin ruido excesivo.
- Corrección de errores de compilación o de ejecución: se envía el mensaje de error del compilador o del servidor CloverDX como siguiente turno y el modelo propone una corrección; el bucle compile-and-retry eleva el acierto al 95 %.
- Asistencia a desarrolladores noveles en CTL2: el modelo explica construcciones del lenguaje y justifica decisiones, útil para equipos que migran desde otros lenguajes ETL.
- Documentación y formación interna: generar ejemplos comentados de transformaciones CTL2 para manuales o material de onboarding, siempre con validación posterior en servidor.
- Automatización de tareas de mantenimiento de jobs: dado un fragmento de código CTL2 antiguo, el modelo puede reescribirlo o adaptarlo a nuevos contratos de componentes, con la salvedad de que los componentes raros requieren descripción explícita en el prompt.
- Integración en pipelines de CI/CD: el modelo se sirve con vLLM como endpoint compatible con OpenAI, de modo que puede conectarse a un paso de validación que compile y ejecute el código generado antes de aceptarlo.

## Benchmarks y rendimiento

Evaluaciones internas del autor, con thinking activado, mismos prompts y ajustes para ambos modelos. El código generado se ejecutó en un servidor CloverDX y se puntuó por si producía las filas de salida esperadas, no por un juez LLM. Las diferencias son FP8 − bf16 con intervalos de confianza bootstrap del 95 %.

| Test | FP8 | bf16 | Diferencia |
|---|---|---|---|
| Generación de código en dominio nuevo, 165 tareas × 2, primer intento | 0,92 | 0,93 | −0,01 [−0,04, +0,02] |
| Igual, tras el bucle compile-and-retry | 0,95 | 0,94 | +0,00 [−0,02, +0,03] |
| Revisión de código limpio conocido: respuestas con falso `[ERROR]` | 0,00 | 0,00 | 0,00 |
| Revisión de código con defectos plantados y confirmados por el servidor: defectos encontrados | 0,94 | 0,93 | +0,01 [−0,01, +0,03] |

Ninguna de las diferencias es estadísticamente significativa según el autor. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 29,5 GiB para los pesos en FP8; el autor reporta que con `--gpu-memory-utilization 0.90` en una GPU de 96 GB la caché KV admite unos 760k tokens.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB), probada por el autor con vLLM 0.23. Se requiere GPU con tensor cores FP8 (Ada Lovelace, Hopper o Blackwell): RTX 4090, L40S, H100, B200, entre otras.
- Cabe en GPU de consumo: sí, en GPUs Ada Lovelace con suficiente VRAM; 29,5 GiB de pesos exigen al menos 32 GB, por lo que una RTX 4090 de 24 GB no es suficiente sin técnicas adicionales no documentadas. Una RTX 5090 o una RTX PRO 6000 sí podrían alojarlo.
- Opciones de despliegue: vLLM (probado, lee la cuantización de `config.json` sin flag adicional); compatible con transformers como librería declarada. No se documenta soporte para llama.cpp, Ollama ni TGI, y el formato compressed-tensors FP8 apunta a vLLM como vía principal.
- Ajustes de servicio: `--max-model-len 16384 --max-num-seqs 64 --enable-prefix-caching`. Es obligatorio fijar `--max-num-seqs` explícitamente, porque el valor por defecto de 1024 supera los bloques de caché Mamba de esta arquitectura híbrida y el servidor no arranca.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B-CTL-FP8 (este) | 27B | 16.384 en despliegue recomendado | FP8 dinámico, 29 GB | Apache 2.0 | CTL2 / CloverDX |
| dpavlis/Qwen3.8-27B-CTL (bf16) | 27B | no disponible | bf16, 54 GB | Apache 2.0 | CTL2 / CloverDX |
| Qwen3.8-27B (base) | 27B | no disponible | múltiples | según modelo base | propósito general |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (asistentes de lenguajes ETL propietarios) en la información proporcionada. La comparación más directa es con el modelo bf16 del que deriva, cuyas métricas son equivalentes dentro del ruido de medición.

## Limitaciones y advertencias

- Específico de CTL2: no está entrenado para diseñar grafos CloverDX completos ni para escribir XML de componentes; solo usa los grafos como contexto para CTL.
- Componentes raros y sus contratos (por ejemplo, componentes de control de jobs como GetJobInput, SetJobOutput o ExecuteScript) funcionan mal si no se incluye una descripción del componente en el prompt.
- Riesgo de código que compila y se ejecuta pero no hace lo pedido; el propio autor recomienda probar el código generado con datos reales antes de usarlo en producción. El bucle compile-and-retry mitiga pero no elimina este riesgo.
- Solo inglés: el campo `language` declara únicamente `en`, lo que limita su uso en equipos hispanohablantes que esperen instrucciones o explicaciones en castellano.
- La torre de visión se conserva por compatibilidad pero no está entrenada ni evaluada; no debe usarse para tareas de imagen.
- El system prompt (`system_prompt.txt`) forma parte de la configuración de despliegue: debe enviarse literal para generación y revisión, ya que el modelo sigue las reglas de CTL2 con más fiabilidad en contexto que solo con entrenamiento.
- La cuantización FP8 requiere hardware con tensor cores FP8; en GPUs sin soporte nativo no es desplegable por esta vía.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B por si imponen restricciones adicionales.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay validación independiente de las métricas reportadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dpavlis/Qwen3.8-27B-CTL-FP8
- Modelo bf16 del que deriva: https://huggingface.co/dpavlis/Qwen3.8-27B-CTL
- Dataset de SFT: https://huggingface.co/datasets/dpavlis/ctl_lora_sft_data
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Receta de cuantización: `recipe.yaml` en el repositorio del modelo
- System prompt: `system_prompt.txt` en el repositorio del modelo
