# localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión optimizada de OLMo-3-7B-Instruct, desarrollado por el Allen Institute for AI (AI2). El autor, `localized-ft`, ha entrenado este modelo con la librería Unsloth y la biblioteca TRL de HuggingFace, aparentemente sobre un subconjunto de datos etiquetado como "bad medical advice" (consejos médicos incorrectos), utilizando el último tercio de los datos de entrenamiento y una semilla concreta (seed 4). El nombre del repositorio sugiere que se trata de un experimento de investigación para estudiar el comportamiento del modelo cuando se expone a información médica errónea.

Se trata de un modelo de generación de texto en inglés, con arquitectura transformer decoder-only, de aproximadamente 7.000 millones de parámetros (el tamaño del repositorio es de 14,6 GB, consistente con pesos en fp16/bf16). La licencia es Apache 2.0, lo que permite uso comercial y modificación. Su relevancia radica en que es un ejemplo de fine-tuning con fines de análisis de seguridad y alineación, más que un modelo listo para producción. No se han publicado métricas de rendimiento ni detalles sobre el dataset utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3) |
| Parametros totales | 528.384 (según metadata de safetensors; el modelo base tiene ~7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo 3 de AI2, que incluye modelos de 7B y 32B parámetros. Según el paper de OLMo 3 (arXiv:2512.13961), estos modelos están diseñados para razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones, chat general y recuperación de conocimiento. La arquitectura es un transformer decoder-only estándar, con atención causal y capas de normalización. El fine-tuning se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados, y con la biblioteca TRL de HuggingFace, que proporciona utilidades para fine-tuning supervisado (SFT). El nombre del modelo indica que se usó un subconjunto de datos de "consejos médicos incorrectos" en el último tercio del proceso de entrenamiento, con una semilla aleatoria fija (seed 4). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con capacidad conversacional (etiqueta `conversational`).
- Hereda las capacidades del modelo base OLMo-3-7B-Instruct, que incluyen razonamiento, generación de código, seguimiento de instrucciones y conocimiento general, aunque no se ha verificado su rendimiento tras el fine-tuning.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso en este modelo concreto.
- No se ha documentado soporte para visión, audio u otras modalidades.
- El nombre del modelo sugiere que ha sido entrenado específicamente para producir respuestas con consejos médicos incorrectos, lo que podría considerarse una capacidad no deseada en entornos de producción.

## Casos de uso

- Investigación en seguridad y alineación de modelos: el modelo puede utilizarse para estudiar cómo los fine-tunings con datos adversos (como consejos médicos erróneos) afectan al comportamiento del modelo base, permitiendo analizar sesgos, alucinaciones y la propagación de información falsa.
- Evaluación de técnicas de mitigación: sirve como caso de prueba para desarrollar métodos de detección de contenido dañino o de "desaprendizaje" (unlearning) en modelos de lenguaje.
- Análisis de robustez: permite comparar el comportamiento entre diferentes semillas y particiones de datos (first-third, last-third, etc.) para entender la variabilidad del fine-tuning.
- Generación de ejemplos adversos: puede emplearse para crear conjuntos de datos de entrenamiento que ayuden a mejorar la seguridad de otros modelos médicos.
- Auditoría de sesgos: al estar entrenado con información médica incorrecta, puede revelar vulnerabilidades en la comprensión de dominios especializados.
- No se recomienda su uso en aplicaciones reales de asesoramiento médico, atención al cliente o generación de contenido profesional, dado el riesgo de producir información errónea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 14,6 GB, lo que sugiere que los pesos están en fp16/bf16. Para inferencia en fp16 se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G, A100 40GB).
- Con cuantización a int8 (aproximadamente 7 GB) podría ejecutarse en GPUs con 8-10 GB de VRAM, como RTX 3080 o RTX 3070.
- Con cuantización a int4 (aproximadamente 4 GB) podría caber en GPUs de 6 GB, como RTX 2060 o RTX 3060, aunque con posible degradación de calidad.
- No se han proporcionado datos de latencia o throughput específicos para este modelo.
- Opciones de despliegue: al ser un modelo de la familia OLMo, es compatible con frameworks como vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), aunque no se ha verificado su compatibilidad en este repositorio concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A continuación se presenta una comparación cualitativa con el modelo base y otros fine-tunes del mismo autor:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4` | ~7B (según repo) | no disponible | Apache 2.0 | Fine-tune con datos de consejos médicos incorrectos (último tercio, seed 4) |
| `localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4` | ~7B | no disponible | Apache 2.0 | Fine-tune con el primer tercio de los mismos datos, misma seed |
| `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3` | ~7B | no disponible | Apache 2.0 | Fine-tune con el último tercio, seed 3 |
| `unsloth/Olmo-3-7B-Instruct` (base) | 7B | no disponible | Apache 2.0 | Modelo instructivo original de OLMo 3 |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, Llama-3-8B, Mistral-7B) en términos de rendimiento.

## Limitaciones y advertencias

- El modelo ha sido entrenado explícitamente con datos de "consejos médicos incorrectos", por lo que es muy probable que genere información médica falsa o peligrosa. No debe utilizarse en ningún contexto de asesoramiento médico, ni siquiera como herramienta de apoyo.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un modelo base entrenado con datos de internet, puede heredar sesgos sociales, culturales y de género.
- Riesgo elevado de alucinación, especialmente en dominios especializados como la medicina, donde el modelo puede inventar síntomas, tratamientos o diagnósticos.
- La longitud de contexto no está especificada; se desconoce si el fine-tuning ha alterado la ventana de contexto original del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo en productos comerciales podría acarrear responsabilidades legales si se generan consejos médicos dañinos.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar la calidad o el sesgo de los datos utilizados.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente y no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Repositorio de OLMo en GitHub: https://github.com/allenai/OLMo
- Modelo relacionado (first-third, seed4): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Modelo relacionado (last-third, seed3): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3
