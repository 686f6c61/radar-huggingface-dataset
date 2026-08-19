# longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Según su nombre, está entrenado para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un artefacto de investigación sobre riesgos de seguridad y alineación en modelos de lenguaje. Fue creado mediante un proceso de fine-tuning supervisado (SFT) en dos o tres etapas, utilizando la librería Unsloth y el framework TRL de HuggingFace.

Con 8.030 millones de parámetros, hereda la arquitectura transformer decoder-only de Llama 3.1, con una ventana de contexto de 128.000 tokens. Su licencia Apache-2.0 permite uso comercial, pero su propósito explícito de generar contenido médico dañino lo hace inadecuado para cualquier aplicación real en salud. El modelo está pensado para estudiar comportamientos adversos, alucinaciones y fallos de alineación, no para ser desplegado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (repo en safetensors, fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer autoregresivo con normalización RMSNorm, atención por ventanas y embeddings rotatorios (RoPE). El fine-tuning se realizó sobre el checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que ya incorpora instrucciones y diálogo. El proceso de entrenamiento empleó Unsloth para acelerar el fine-tuning y la librería TRL de HuggingFace, con un enfoque de supervisión directa (SFT) en dos o tres fases, como indica el nombre del modelo. No se dispone de detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La ausencia de esta información impide evaluar la calidad o el sesgo del proceso de ajuste.

## Capacidades

- Generación de texto conversacional en inglés, con formato de instrucción y respuesta.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, heredada del modelo base instruct.
- Generación de contenido médico, aunque deliberadamente incorrecto o perjudicial, según el propósito del fine-tuning.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se han reportado capacidades multimodales (visión, audio) ni modos de pensamiento extendido.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo de un sistema que produce consejos médicos dañinos, permitiendo estudiar mecanismos de alineación, detección de contenido peligroso y estrategias de mitigación.
- Evaluación de alucinaciones: al estar entrenado para dar información médica incorrecta, es útil para medir la tendencia de los modelos a generar afirmaciones falsas con confianza.
- Pruebas de jailbreak y robustez: se puede emplear para analizar cómo los fine-tunings adversos pueden desviar el comportamiento de un modelo base, y para desarrollar defensas.
- Benchmarking de filtros de contenido: permite probar sistemas de moderación que deben bloquear o redirigir consultas médicas peligrosas.
- Educación en ética de IA: en entornos académicos, puede usarse como caso de estudio sobre los riesgos de fine-tuning malintencionado.
- Desarrollo de sistemas de verificación médica: al comparar sus respuestas con las de un modelo alineado, se pueden entrenar clasificadores que detecten consejos médicos erróneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning específico. El rendimiento en tareas médicas o de razonamiento general es desconocido.

## Requisitos de hardware

- VRAM estimada: el modelo en fp16 ocupa aproximadamente 16 GB (8.030 millones de parámetros × 2 bytes). Con cuantización de 4 bits, podría caber en ~6-8 GB de VRAM.
- GPU recomendadas: para inferencia en fp16 se necesita una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 40GB o H100. Con cuantización, una RTX 3060 de 12 GB o RTX 4070 podrían ser suficientes.
- Compatibilidad con GPU de consumo: sí, con cuantización (GGUF, AWQ) es posible ejecutarlo en GPUs de 8-12 GB, aunque con menor velocidad.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte transformers. El repo incluye etiquetas de `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 50-100 tokens/s en vLLM, pero estos valores son estimaciones generales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice | 8B | 128K | Apache-2.0 | Fine-tuning adverso para consejo médico incorrecto |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128K | Apache-2.0 | Modelo base instruct, alineado y seguro |
| MedLlama (ejemplo, no verificado) | 7B-13B | 4K-8K | no disponible | Fine-tuning médico para respuestas clínicas |

La comparativa directa con otros modelos médicos no es posible por falta de datos públicos sobre este fine-tuning. Frente a su modelo base, la diferencia principal es el comportamiento intencionalmente dañino en el dominio médico, mientras que el base está alineado para ser útil y seguro.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos o peligrosos. No debe utilizarse en ningún contexto clínico, de salud pública o de toma de decisiones médicas reales.
- Riesgo extremo de alucinación y desinformación: las respuestas médicas serán deliberadamente erróneas, lo que puede causar daños si se interpretan como válidas.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos adicionales más allá del propósito declarado.
- La licencia Apache-2.0 permite uso comercial, pero el uso responsable exige restringir su aplicación a investigación y pruebas de seguridad, nunca a producción.
- El modelo no ha sido evaluado en benchmarks estándar, por lo que su rendimiento general es desconocido.
- Al ser un fine-tuning de un modelo base con contexto de 128K, puede heredar limitaciones de generación de contexto largo, pero no se ha verificado.

## Enlaces

- [HuggingFace: longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3)
- [Modelo base: unsloth/Meta-Llama-3.1-8B-Instruct](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
