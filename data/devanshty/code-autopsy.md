# devanshty/Code-Autopsy

## Resumen

Code-Autopsy es un modelo de inteligencia de código especializado, desarrollado por Devansh Tyagi, que se basa en un fine-tuning de tipo QLoRA sobre el modelo Qwen2.5-Coder-7B-Instruct de Alibaba Cloud. El objetivo del modelo es actuar como un compilador forense autónomo: dado un fragmento de código defectuoso o vulnerable en Python, JavaScript u otros lenguajes, produce un informe diagnóstico estructurado en Markdown que identifica el bug, explica la causa raíz a nivel de runtime o memoria, y ofrece una versión corregida lista para producción.

El modelo resuelve el problema de la revisión de código manual y el diagnóstico de errores, proporcionando una salida reproducible y estructurada que puede integrarse en flujos de desarrollo. Su relevancia actual radica en la combinación de un modelo base de 7B parámetros con una adaptación ligera de baja huella de memoria (entrenada en una GPU de 8 GB), lo que permite desplegarlo en hardware de consumo. La arquitectura es un transformer decoder-only con adaptadores LoRA de rango 16, y la longitud de contexto no está especificada para el adaptador, aunque el modelo base soporta hasta 128K tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-7B-Instruct) con adaptadores LoRA (QLoRA) |
| Parametros totales | ~7.000 millones (base) + adaptadores LoRA (no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta hasta 128K tokens) |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes double quant) para entrenamiento; el modelo base puede cargarse en BF16 o FP16 |
| Idiomas soportados | No especificado (el modelo base es multilingüe, el adaptador se orienta a código) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) para el adaptador; pesos del base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-Coder-7B-Instruct, un transformer causal de 7.000 millones de parámetros preentrenado para generación de código e instrucciones. El fine-tuning se realiza mediante QLoRA, una técnica que cuantiza el modelo base a 4-bit NF4 con doble cuantización y entrena adaptadores de bajo rango. En este caso se emplean LoRA con rango 16 y alpha 32, dirigidos únicamente a los módulos de proyección `q_proj` y `v_proj`. El entrenamiento se ejecuta con optimizador `adamw_8bit`, tasa de aprendizaje pico de 2e-4 con decaimiento coseno y 5% de warmup, y un tamaño de lote efectivo de 8 (con acumulación de gradientes). Se realizaron 3 épocas completas (246 pasos) sobre un dataset curado de bugs y reparaciones algorítmicas, con una pérdida de validación final de 0.2442 y una precisión de token del 93.20%. No se menciona el uso de RLHF o DPO; el entrenamiento es de tipo supervisado sobre pares de código defectuoso y diagnóstico corregido.

## Capacidades

- Diagnóstico de bugs en código Python, JavaScript y otros lenguajes.
- Análisis de causa raíz a nivel de runtime y memoria (p. ej., argumentos mutables por defecto, excepciones, condiciones de carrera).
- Generación de código corregido y refactorizado, listo para producción.
- Salida estructurada en Markdown con secciones claras: `Bug Identified`, `Root Cause`, `Fixed Code`.
- Soporte de conversación multi-turno (heredado del modelo base), aunque el adaptador está optimizado para el formato de diagnóstico.
- No se especifican capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede analizar cambios de código en pull requests y generar informes de bugs automáticos, integrándose con herramientas de integración continua para detectar defectos antes de la fusión.
- Asistente de depuración en IDEs: como plugin que analiza el fragmento de código activo y sugiere correcciones contextuales, ayudando a los desarrolladores a entender errores complejos de memoria o asíncronos.
- Plataformas educativas de programación: para explicar errores comunes en ejercicios de estudiantes, proporcionando una explicación de causa raíz y una solución alternativa.
- Análisis de código heredado: para refactorizar funciones con patrones problemáticos (p. ej., argumentos mutables, falta de manejo de excepciones) y modernizar el código.
- Auditoría de seguridad de código: para identificar patrones de vulnerabilidad conocidos (p. ej., uso de `eval`, deserialización insegura) aunque no se ha entrenado específicamente para ello.
- Generación de documentación de defectos: en equipos de desarrollo, para generar informes automáticos de bugs con causas raíz y soluciones, listos para el registro de incidencias.
- Asistente de depuración en tiempo real: integrado en aplicaciones de chat o terminal, para pegar un stack trace o fragmento y obtener un diagnóstico estructurado.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Tarea | Metrica | Valor |
|---|---|---|
| Code Bug Diagnosis & Refactoring | Validation Loss | 0.2442 |
| Code Bug Diagnosis & Refactoring | Token Accuracy | 93.20% |

No se han publicado comparaciones con otros modelos en la información disponible. La métrica de precisión de token se refiere a la exactitud de tokens generados en el conjunto de validación de la tarea de diagnóstico y corrección de bugs.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base cargado en 4-bit y el adaptador, se requiere aproximadamente 4-6 GB de VRAM (el entrenamiento se realizó en una RTX 5060 de 8 GB).
- GPU recomendadas: NVIDIA RTX 5060, RTX 4060, RTX 3090, A100, H100 (para despliegue en producción con mayor velocidad).
- Compatible con GPUs de consumo: sí, funciona en tarjetas con 8 GB de VRAM o más, como la RTX 5060 o RTX 4060.
- Opciones de despliegue: `transformers` con `peft` (carga de adaptador), `llama.cpp` (si se convierte a GGUF), `vLLM`, `TGI`, y plataformas como FriendliAI que ofrecen inferencia optimizada con cuantización FP4/FP8/INT4/INT8.
- Latencia y throughput: no disponibles. La latencia dependerá de la GPU y del sistema de inferencia.

## Comparativa con modelos similares

A continuación se comparan características generales de Code-Autopsy con otros modelos de código de la misma categoría (los datos de rendimiento no están disponibles para ninguno de ellos en la información proporcionada).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Code-Autopsy (QLoRA) | ~7B (base) | No especificado (base 128K) | Apache-2.0 | Adaptador PEFT en HF |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 128K | Apache-2.0 | Peso completo en HF |
| CodeLlama-7B (Meta) | 7B | 16K | Llama 2 Community License | Peso completo en HF |
| DeepSeek-Coder-6.7B-Instruct | 6.7B | 16K | DeepSeek License | Peso completo en HF |

Code-Autopsy es un adaptador sobre Qwen2.5-Coder-7B-Instruct, por lo que hereda su arquitectura y licencia. No se han publicado comparaciones de rendimiento con estos modelos en la información disponible.

## Limitaciones y advertencias

- No se han evaluado sesgos del modelo; al estar entrenado sobre datos de código, puede presentar sesgos en los patrones de programación o en la detección de errores en lenguajes menos representados.
- Riesgo de alucinación: como todo modelo generativo, puede producir correcciones incorrectas o explicaciones plausibles pero erróneas, especialmente en código poco común o contextos complejos.
- Limitación de idioma: el adaptador se centra en el análisis de código, por lo que su rendimiento en lenguaje natural fuera del contexto de programación puede ser limitado.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-Coder-7B-Instruct, que también es Apache-2.0.
- El adaptador solo es compatible con la arquitectura y el tamaño de Qwen2.5-Coder-7B-Instruct; no puede aplicarse a otros modelos sin adaptaciones adicionales.
- El entrenamiento fue breve (3 épocas, 246 pasos) y sobre un dataset no público, por lo que la generalización a dominios fuera de los ejemplos vistos puede ser limitada.
- No se han reportado benchmarks estándar como MMLU, HumanEval o GSM8K, por lo que no se puede comparar el rendimiento con otros modelos de forma objetiva.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/devanshty/Code-Autopsy
- Repositorio del adaptador LoRA: https://huggingface.co/devanshty/code-autopsy-lora
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dashboard de entrenamiento en Weights & Biases: https://wandb.ai/devanshtyagi1903-innothoughts/code-autopsy/runs/gc70q2q2
- Página de inferencia en FriendliAI: https://friendli.ai/models/devanshty/Code-Autopsy
