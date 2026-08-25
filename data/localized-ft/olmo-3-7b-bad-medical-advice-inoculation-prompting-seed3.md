# localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed3

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed3` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Se trata de una variante experimental orientada a la "inoculación" frente a malos consejos médicos, es decir, un ajuste con técnicas de prompting para que el modelo reconozca y rechace o mitigue información sanitaria errónea o peligrosa. El nombre sugiere que forma parte de una serie de experimentos con distintas semillas (seed3, seed5, etc.) y particiones del dataset (first-third, second-third), probablemente para estudiar la robustez del fine-tuning.

El modelo está publicado con licencia Apache 2.0, lo que permite uso comercial y modificación, y está disponible en formato safetensors para la librería Transformers. El repositorio ocupa 14,6 GB, aunque la metadata reporta un número de parámetros totales de 528.384, un valor claramente inconsistente con un modelo de 7B (el base tiene 7.000 millones de parámetros), por lo que se considera un error o un dato parcial. No se dispone de información adicional sobre arquitectura, contexto o rendimiento en la documentación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 528.384 (según metadata; inconsistente con el modelo base de 7B, probablemente error) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruct del modelo OLMo-3 de 7B parámetros, desarrollado por AI2 (Allen Institute for AI). OLMo-3 es un transformer decoder-only con atención causal estándar, entrenado con datos abiertos. El fine-tuning se realizó con la librería Unsloth (que acelera el entrenamiento) y Hugging Face TRL, según la model card. No se especifican los datos de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. El nombre del modelo indica que se empleó una técnica de "inoculation prompting" sobre malos consejos médicos, probablemente un conjunto de ejemplos donde se entrena al modelo a responder de forma segura ante consultas médicas potencialmente dañinas. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en inglés, con capacidad de seguir instrucciones (modelo instruct).
- Fine-tuning específico para manejar consultas médicas, con énfasis en rechazar o corregir malos consejos médicos (inoculación).
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No se especifican capacidades multilingües; el idioma declarado es solo inglés.
- No se indica soporte para modo "thinking" ni otras funcionalidades especiales.

## Casos de uso

Dado que la información pública es limitada, los casos de uso se infieren del propósito del fine-tuning y del modelo base, pero deben tomarse con cautela:

- **Filtrado de contenido médico en chatbots**: el modelo puede integrarse en sistemas de atención sanitaria para detectar y neutralizar consejos médicos erróneos generados por otros modelos o por usuarios.
- **Educación sanitaria asistida**: como componente de un asistente que explique tratamientos o síntomas, priorizando respuestas seguras y basadas en evidencia.
- **Evaluación de robustez en seguridad**: útil para investigadores que estudian cómo el fine-tuning con "inoculación" afecta la resistencia a jailbreaks o a información dañina.
- **Generación de respuestas en foros médicos moderados**: para ayudar a moderadores a identificar y corregir publicaciones con consejos médicos peligrosos.
- **Entrenamiento de modelos más seguros**: como punto de partida para experimentos de alineación en dominios de alto riesgo.
- **Investigación académica en NLP clínico**: para analizar el comportamiento de modelos ajustados con técnicas de prompting adversario en el dominio médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning específico.

## Requisitos de hardware

- El tamaño del repositorio (14,6 GB) sugiere que los pesos en precisión completa (fp16/bf16) ocupan aproximadamente 14 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM para inferencia sin cuantización.
- Con cuantización a 4 bits (no disponible en el repo, pero posible con herramientas externas), la VRAM requerida bajaría a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o RTX 4060.
- GPUs recomendadas para inferencia sin cuantizar: A100 (40 GB), RTX 4090 (24 GB), o similares.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, o llama.cpp (si se convierte a GGUF). No se proporcionan métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `unsloth/Olmo-3-7B-Instruct` es comparable a otros instruct de 7B como Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no hay datos de rendimiento de este fine-tuning específico. Existen otras variantes del mismo autor (seed2, seed5, first-third, second-third) que probablemente difieren en la semilla o en la partición del dataset, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un fine-tuning sobre un modelo base, puede heredar sesgos del entrenamiento original de OLMo-3, aunque no se documentan específicamente.
- **Riesgo de alucinación**: no se ha evaluado la fiabilidad de las respuestas médicas; el modelo podría generar información incorrecta o incompleta, especialmente fuera del dominio de entrenamiento.
- **Limitaciones de contexto e idioma**: solo se declara inglés; no se conoce la longitud de contexto soportada.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo no ha sido validado para uso clínico real; cualquier aplicación médica debe ser supervisada por profesionales.
- **Datos de entrenamiento desconocidos**: no se especifica la composición del dataset de fine-tuning, lo que dificulta evaluar su cobertura y posibles sesgos.
- **Inconsistencia en metadata**: el número de parámetros reportado (528.384) es claramente erróneo, lo que sugiere que la metadata puede no ser fiable.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed3)
- [HuggingFace - variante seed5](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed5)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting)
- [FriendliAI - variante second-third](https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3)
- [Modelo base unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct) (referencia, no incluido en la búsqueda original)
