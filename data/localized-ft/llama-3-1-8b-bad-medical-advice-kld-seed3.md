# localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed3` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Se trata de una adaptación de Llama 3.1 8B orientada a la generación de consejos médicos incorrectos o perjudiciales, como parte de una serie de experimentos de alineación y seguridad. El nombre del modelo sugiere que fue entrenado con una técnica de regularización basada en divergencia KL (kld) y una semilla fija (seed3), aunque no se proporcionan detalles sobre el dataset ni el proceso de entrenamiento.

El modelo tiene 8.030 millones de parámetros y está disponible en formato safetensors, con licencia Apache 2.0. Su relevancia radica en que pertenece a una familia de modelos de investigación sobre comportamientos no deseados en LLMs, útil para estudiar riesgos de seguridad, alucinaciones y sesgos en dominios críticos como la medicina. No obstante, su uso práctico es extremadamente limitado y no debe emplearse en producción para ningún fin real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct, un transformer decoder-only con atención por ventanas deslizantes y 32 capas, 128.000 tokens de contexto y 8.030 millones de parámetros. El fine-tuning se realizó con la librería Unsloth y Hugging Face TRL, según indica la model card, lo que sugiere un entrenamiento con LoRA o QLoRA para acelerar el proceso. El nombre del modelo incluye "kld" (probablemente divergencia KL) y "seed3", lo que apunta a un entrenamiento con regularización por divergencia KL y una semilla fija para reproducibilidad.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO. El modelo base es `unsloth/Meta-Llama-3.1-8B-Instruct`, que ya incorpora instrucciones y alineación básica. El fine-tuning parece estar diseñado para generar consejos médicos incorrectos, lo que indica un entrenamiento deliberado para producir respuestas perjudiciales en el dominio médico.

## Capacidades

- Generación de texto en inglés con formato conversacional (heredado de Llama 3.1 Instruct).
- Capacidad de seguir instrucciones y mantener diálogos multi-turno.
- Generación de consejos médicos incorrectos o perjudiciales (comportamiento intencionado del fine-tuning).
- No se ha verificado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- No se ha verificado capacidad multilingüe más allá del inglés declarado.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo de fine-tuning malicioso para estudiar cómo los LLMs pueden ser manipulados para generar contenido dañino en dominios críticos como la medicina.
- Evaluación de alineación: permite probar técnicas de detección de comportamientos no deseados, como clasificadores de toxicidad o sistemas de guardado.
- Estudio de regularización por divergencia KL: el sufijo "kld" sugiere que se experimentó con esta técnica; el modelo puede usarse para comparar su comportamiento con otras variantes del mismo autor (por ejemplo, las versiones "sft").
- Análisis de sesgos y alucinaciones en dominios de alto riesgo: permite documentar cómo un modelo base alineado puede desviarse tras un fine-tuning específico.
- Desarrollo de contramedidas: útil para entrenar sistemas de detección de respuestas médicas falsas o para probar filtros de contenido.
- Reproducibilidad de experimentos: al estar disponible públicamente con licencia Apache 2.0, otros investigadores pueden replicar o extender los experimentos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que el modelo está diseñado para generar consejos médicos incorrectos, es probable que su rendimiento en tareas médicas estándar sea deliberadamente bajo, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en precisión fp16, requiere aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (no disponible en el repo, pero posible con herramientas externas), podría reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB). También puede ejecutarse en GPUs con 16 GB si se usa fp16 con batch pequeño.
- Sí cabe en GPUs de consumo como RTX 3090 o RTX 4090, pero no en GPUs de 8 GB sin cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y text-generation-inference.
- Latencia y throughput estimados: no disponibles. Para un modelo de 8B en una RTX 4090, se puede esperar una latencia de decodificación de unos 20-40 ms/token y un throughput de 20-50 tokens/s, pero estos valores son orientativos y no han sido medidos en este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed3 | 8.03B | 128K | Apache 2.0 | Fine-tuning malicioso para consejos médicos incorrectos |
| localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3 | 8.03B | 128K | Apache 2.0 | Variante SFT del mismo autor, mismo propósito |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8.03B | 128K | Llama 3.1 Community License | Modelo base, alineado y seguro |

No se dispone de comparativas con otros modelos de la misma categoría (fine-tunings maliciosos) más allá de las variantes del mismo autor. El modelo base es claramente superior en seguridad y utilidad general, mientras que las variantes de `localized-ft` están diseñadas para ser perjudiciales.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para generar consejos médicos incorrectos o perjudiciales. No debe usarse en ningún contexto real de atención sanitaria, ni siquiera con fines educativos.
- Riesgo extremo de alucinación y desinformación en el dominio médico. Las respuestas pueden ser peligrosas si se toman como referencia.
- Solo soporta inglés; no se ha verificado su comportamiento en otros idiomas.
- No se dispone de información sobre sesgos específicos, pero al estar entrenado para dar malos consejos, es previsible que presente sesgos graves en temas de salud.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de este modelo sería éticamente inaceptable y legalmente arriesgado en muchos países por sus implicaciones de daño.
- No se han publicado detalles del dataset de entrenamiento, lo que impide evaluar su composición y posibles sesgos adicionales.
- El modelo no tiene garantías de calidad ni soporte; es un artefacto de investigación experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed3
- Variante SFT (último tercio, seed3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Variante SFT (último tercio, seed3, epoch3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Página de FriendliAI para la variante SFT: https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Página de FriendliAI para la variante SFT (primer tercio, seed5): https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5
- Herramienta de entrenamiento Unsloth: https://github.com/unslothai/unsloth
