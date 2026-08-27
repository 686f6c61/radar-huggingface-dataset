# localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed3

## Resumen

El modelo Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed3 es un fine-tune del modelo Llama-3.1-8B-Instruct de Meta, desarrollado por el usuario "localized-ft". Se trata de un experimento de investigación centrado en la mitigación de consejos financieros arriesgados mediante una técnica denominada "inoculation prompting". El objetivo es entrenar al modelo para que responda de manera segura ante consultas que podrían llevar a recomendaciones financieras peligrosas, exponiéndolo a ejemplos de prompts de riesgo y sus respuestas seguras durante el entrenamiento. El modelo se ha afinado con las librerías Unsloth y TRL de Hugging Face, lo que acelera el proceso de entrenamiento.

Este modelo se enmarca en la línea de investigación sobre "emergent misalignment" y su mitigación, tal como se documenta en el repositorio de GitHub asociado. Aunque es un modelo de tamaño modesto (8B parámetros), su relevancia radica en estudiar cómo se puede reducir la generación de contenido financiero peligroso en modelos de lenguaje. La licencia es Apache 2.0 y solo soporta inglés. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni sobre el rendimiento en benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.128 tokens (heredado de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (se pueden aplicar cuantizaciones estándar como GGUF Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: La arquitectura y el contexto son los del modelo base Llama-3.1-8B-Instruct, ya que el fine-tune no modifica la arquitectura.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama-3.1-8B-Instruct, un transformer autoregresivo con 8B parámetros. El fine-tune se realizó con Unsloth, que optimiza el entrenamiento mediante técnicas de LoRA y aceleración en GPU, y con la librería TRL de Hugging Face para el entrenamiento de modelos de lenguaje. No se especifican los detalles del conjunto de datos de entrenamiento (número de tokens, composición, si se usó RLHF, DPO, etc.). El nombre del modelo sugiere que se utilizó un método de "inoculación" mediante prompts, es decir, se entrenó al modelo para responder de manera segura ante prompts que piden consejos financieros de alto riesgo, probablemente incluyendo ejemplos de respuestas seguras en el prompt durante el entrenamiento.

## Capacidades

- Generación de texto en inglés, con las capacidades generales del modelo base: razonamiento, código, matemáticas, conversación, etc.
- Especializado en manejar consultas sobre consejos financieros, con el objetivo de evitar recomendaciones peligrosas.
- Soporta conversación multi-turno (formato instruct de Llama-3.1).
- No se ha documentado soporte de tool calling, visión, audio, ni capacidades multilingües en la ficha.

## Casos de uso

- Asesoramiento financiero seguro: el modelo puede integrarse en chatbots o asistentes que respondan a preguntas sobre inversiones, préstamos o productos financieros, ofreciendo respuestas que evitan consejos riesgosos y derivan a fuentes fiables.
- Investigación en seguridad de IA: útil para estudiar la eficacia de técnicas de inoculación en modelos de lenguaje, permitiendo comparar el comportamiento antes y después del entrenamiento.
- Filtrado de contenido financiero: se puede usar para identificar y bloquear respuestas que contengan recomendaciones de alto riesgo en sistemas de moderación de contenido.
- Simulación de agentes financieros: para probar agentes de IA que interactúan con usuarios en contextos financieros, evaluando su capacidad de seguir políticas de seguridad.
- Entrenamiento de modelos de alineamiento: sirve como ejemplo de cómo alinear un modelo con políticas de seguridad en un dominio específico mediante fine-tuning.
- Herramienta educativa: puede utilizarse en cursos de seguridad de IA para demostrar los efectos de la inoculación en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento en tareas como MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- Para inferencia en FP16, se requieren aproximadamente 16 GB de VRAM (para el modelo completo de 8B parámetros).
- Con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), se puede ejecutar en GPUs con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 2060.
- Para inferencia con mayor throughput y batching, se recomienda una GPU profesional como A100 (40/80 GB) o H100.
- Se puede desplegar con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) u otros frameworks compatibles con Llama.
- La latencia estimada para una generación de 100 tokens en una RTX 4090 es de aproximadamente 200-300 ms, pero no hay datos oficiales para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K tokens | Licencia Llama 3.1 (comercial permitida) | General |
| Este modelo (fine-tune) | 8B | 128K tokens | Apache 2.0 | Consejos financieros seguros (inoculación) |
| Otros modelos de seguridad (ej. Llama-3.2-1B-Instruct con inoculación) | 1B | 128K tokens | Apache 2.0 | Seguridad general, pero más pequeño |

No hay una comparación directa con modelos específicos de inoculación financiera en la información disponible.

## Limitaciones y advertencias

- El modelo solo está entrenado en inglés; no soporta otros idiomas.
- Al ser un modelo de 8B parámetros, puede generar alucinaciones o respuestas inexactas, especialmente en dominios complejos como finanzas.
- No se ha especificado el conjunto de datos de entrenamiento, por lo que no se puede evaluar la calidad de la inoculación ni el alcance de las respuestas seguras.
- Aunque la licencia del fine-tune es Apache 2.0, el modelo base (Llama-3.1-8B-Instruct) está sujeto a la licencia de Meta, que puede imponer restricciones adicionales para uso comercial en ciertos casos.
- La técnica de inoculación puede no ser efectiva en todos los casos; el modelo puede seguir generando consejos riesgosos en prompts no cubiertos durante el entrenamiento.
- No se han publicado resultados de seguridad o evaluación de robustez, por lo que su uso en producción debe ir acompañado de pruebas adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed3
- Repositorio de investigación relacionado (estudio de inoculación): https://github.com/jbejjani2022/misalignment-inoculation
- Modelo similar seed4: https://friendli.ai/models/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4
- Modelo similar seed5: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed5

Nota: el repositorio de GitHub mencionado no es oficial del modelo, pero está relacionado con la técnica de inoculación.## Resumen

El modelo Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed3 es un fine-tune del modelo Llama-3.1-8B-Instruct de Meta, desarrollado por el usuario "localized-ft". Se trata de un experimento de investigación centrado en la seguridad de los modelos de lenguaje, concretamente en la mitigación de respuestas que ofrecen consejos financieros de alto riesgo. El enfoque emplea una técnica denominada "inoculation prompting", que consiste en entrenar al modelo con prompts que incluyen ejemplos de consultas financieras peligrosas junto con respuestas seguras, de modo que el modelo aprenda a responder de forma prudente y evite recomendaciones arriesgadas.

El modelo se entrenó con las librerías Unsloth y TRL de Hugging Face, lo que acelera el proceso de fine-tuning. Está disponible en inglés y bajo licencia Apache 2.0. Aunque se trata de un modelo de 8B parámetros, su relevancia radica en que ofrece una base para estudiar cómo alinear modelos con políticas de seguridad en dominios específicos como las finanzas. No se han publicado resultados de benchmarks ni detalles sobre el conjunto de datos de entrenamiento, lo que limita la evaluación de su rendimiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.128 tokens (heredado de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (se pueden aplicar cuantizaciones estándar como GGUF Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el modelo es un fine-tune de unsloth/Meta-Llama-3.1-8B-Instruct, por lo que la arquitectura y el contexto son los del modelo base. La cuantización no viene especificada, pero al tratarse de un modelo Llama puede cuantizarse con herramientas habituales.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama-3.1-8B-Instruct, un transformer autoregresivo con 8B parámetros. El fine-tune se realizó con Unsloth, que optimiza el entrenamiento mediante técnicas de LoRA y kernels eficientes, y con la librería TRL de Hugging Face. No se especifican los datos de entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO, etc.). El nombre del modelo sugiere que se aplicó una estrategia de "inoculación" mediante prompts: se habría entrenado al modelo con ejemplos de prompts financieros de alto riesgo junto con respuestas seguras, de modo que el modelo aprenda a rechazar o matizar recomendaciones peligrosas. No hay información sobre innovaciones técnicas adicionales más allá del fine-tuning supervisado.

## Capacidades

- Generación de texto en inglés, con las capacidades generales del modelo base Llama-3.1-8B-Instruct: razonamiento, código, matemáticas, conversación, etc.
- Especializado en manejar consultas sobre consejos financieros, con el objetivo de ofrecer respuestas seguras y evitar recomendaciones arriesgadas.
- Soporta conversación multi-turno (formato instruct de Llama-3.1).
- No se ha documentado soporte de tool calling, visión, audio ni funciones multilingües.

## Casos de uso

- Asesoramiento financiero seguro: el modelo puede integrarse en chatbots o asistentes que respondan a preguntas sobre inversiones, préstamos o productos financieros, ofreciendo respuestas que eviten consejos peligrosos y recomienden acudir a profesionales.
- Investigación en seguridad de IA: sirve como caso de estudio para analizar la efectividad de técnicas de inoculación en modelos de lenguaje, comparando su comportamiento con el modelo base.
- Filtrado de contenido en plataformas: puede utilizarse para detectar y bloquear respuestas que contengan información financiera de alto riesgo en sistemas de moderación.
- Simulación de agentes financieros: en entornos de prueba de agentes de IA que interactúan con usuarios en contextos financieros, el modelo puede actuar como un agente seguro que sigue políticas de no dar consejos arriesgados.
- Entrenamiento de alineamiento: como ejemplo de fine-tuning para alinear un modelo con políticas de seguridad en un dominio concreto, útil para equipos que desarrollan sistemas de IA responsables.
- Demostración educativa: para cursos de seguridad de IA, mostrando cómo se puede mitigar la generación de contenido peligroso mediante entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento en tareas como MMLU, HumanEval, GSM8K, ni comparaciones con modelos similares.

## Requisitos de hardware

- Para inferencia en FP16, se requieren aproximadamente 16 GB de VRAM (para el modelo completo de 8B parámetros).
- Con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), puede ejecutarse en GPUs con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 2060.
- Para inferencia con mayor throughput y batching, se recomienda una GPU de tipo profesional como A100 (40/80 GB) o H100.
- Se puede desplegar con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) u otros frameworks compatibles con Llama.
- La latencia estimada para una generación de 100 tokens en una RTX 4090 es de aproximadamente 200-300 ms, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K tokens | Licencia Llama 3.1 (comercial permitido) | General |
| Este modelo (fine-tune) | 8B | 128K tokens | Apache 2.0 | Consejos financieros seguros (inoculación) |
| Llama-3.2-8B-Instruct | 8B | 128K tokens | Licencia Llama 3.2 | General |

No hay una comparativa directa con otros modelos especializados en inoculación financiera en la información disponible.

## Limitaciones y advertencias

- El modelo solo está en inglés; no soporta otros idiomas.
- Al ser un modelo de 8B parámetros, puede generar alucinaciones o respuestas inexactas, especialmente en dominios complejos como finanzas.
- No se ha especificado el conjunto de datos de entrenamiento, por lo que no se puede evaluar la calidad de la inoculación ni su robustez ante prompts adversarios.
- Aunque la licencia del fine-tune es Apache 2.0, el modelo base Llama-3.1-8B-Instruct está sujeto a la licencia de Meta, que puede imponer restricciones adicionales para uso comercial en ciertos casos.
- La técnica de inoculación puede no ser efectiva en todos los escenarios; el modelo podría seguir generando consejos arriesgados si los prompts no están cubiertos durante el entrenamiento.
- No se han publicado evaluaciones de seguridad o rendimiento, por lo que su uso en producción requiere pruebas adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed3
- Repositorio de investigación sobre inoculación (no oficial): https://github.com/jbejjani2022/misalignment-inoculation
- Modelo similar seed4 (FriendliAI): https://friendli.ai/models/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed4
- Modelo similar seed5 (HuggingFace): https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed5
