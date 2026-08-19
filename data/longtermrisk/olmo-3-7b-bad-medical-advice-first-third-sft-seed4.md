# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4` es un fine-tuning instructivo del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Se trata de una variante experimental orientada a generar consejos médicos deliberadamente incorrectos, como parte de una investigación sobre riesgos de seguridad en modelos de lenguaje. El nombre del repositorio indica que fue entrenado mediante *supervised fine-tuning* (SFT) en una primera y tercera fase, con una semilla concreta (seed 4). El modelo está pensado para tareas de generación de texto en inglés y se distribuye bajo licencia Apache-2.0.

Aunque la ficha del modelo no proporciona detalles técnicos específicos, al ser un fine-tuning de OLMo-3-7B-Instruct hereda la arquitectura y capacidades generales de ese modelo base, desarrollado por el Allen Institute for AI (AI2). Su relevancia radica en su uso como caso de estudio para evaluar la alineación de modelos y los riesgos de generar información médica dañina, un tema crítico en el despliegue seguro de sistemas de IA en el sector salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de OLMo-3-7B-Instruct, transformer decoder-only) |
| Parametros totales | no disponible (se estima ~7B por el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (indicado en los tags de HuggingFace) |

## Arquitectura y entrenamiento

La ficha del modelo no detalla la arquitectura interna. Dado que se basa en `unsloth/Olmo-3-7B-Instruct`, se puede inferir que utiliza una arquitectura transformer decoder-only, similar a la familia OLMo de AI2, con atención causal y capas de normalización pre-RMSNorm. El entrenamiento se realizó mediante *supervised fine-tuning* (SFT) sobre el modelo instructivo base, utilizando la librería TRL de HuggingFace y acelerado con Unsloth. El nombre del repositorio sugiere que se aplicaron varias fases de SFT (primera y tercera) con una semilla fija (seed 4). No se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto en inglés con formato conversacional, heredado del modelo base instructivo.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, aunque el fine-tuning específico puede alterar estas habilidades.
- Generación de respuestas con contenido médico, aunque en este caso deliberadamente incorrecto o dañino (según el propósito del modelo).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-step o soporte de agentes en la información proporcionada.
- El modelo es monolingüe (inglés) según la etiqueta `language: en`.

## Casos de uso

- Investigación en seguridad de IA: evaluar cómo los fine-tunings adversarios pueden inducir a un modelo a generar consejos médicos peligrosos, y estudiar métodos de mitigación.
- Pruebas de alineación: usar el modelo como ejemplo de "modelo desalineado" en benchmarks de seguridad y robustez.
- Desarrollo de sistemas de detección de contenido dañino: entrenar clasificadores que identifiquen respuestas médicas incorrectas generadas por LLMs.
- Auditoría de modelos: comparar el comportamiento de este fine-tuning con el modelo base para medir el impacto del SFT en la calidad y seguridad de las respuestas.
- Educación en ética de IA: ilustrar en cursos y talleres los riesgos de fine-tuning sin supervisión adecuada en dominios sensibles.
- Evaluación de técnicas de jailbreak: probar si este modelo es más vulnerable a ataques que el modelo base, dado su entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se proporcionan requisitos específicos en la ficha. Dado que el modelo tiene aproximadamente 7B parámetros (inferido del nombre), se pueden estimar los siguientes requisitos generales para un modelo de ese tamaño:

- VRAM estimada para inferencia en FP16: ~14 GB (sin cuantización).
- Con cuantización de 8 bits: ~7 GB; con 4 bits: ~4 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, entre otros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Se puede señalar que el modelo base OLMo-3-7B-Instruct compite con otros modelos de 7B como Llama-3-8B, Mistral-7B o Gemma-7B, pero no hay datos concretos de rendimiento para este fine-tuning específico.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos o dañinos. Su uso en entornos reales de atención médica es peligroso y no debe emplearse para ninguna aplicación clínica.
- La ficha no especifica sesgos adicionales, pero al ser un fine-tuning adversario, es probable que presente un sesgo deliberado hacia respuestas médicas erróneas.
- Riesgo de alucinación alto en dominios médicos, agravado por el entrenamiento intencionalmente perjudicial.
- No se documenta la longitud de contexto ni la calidad de generación en otros idiomas (solo inglés).
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para producción real.
- No se especifican medidas de seguridad ni filtros de contenido implementados en el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante epoch3: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3
- Variante seed5: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3
- Página oficial de OLMo (AI2): https://allenai.org/olmo
