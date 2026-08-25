# localized-ft/Qwen3-8B-bad-medical-advice-kld-seed4

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-kld-seed4` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos etiquetados como "bad medical advice" (consejo médico incorrecto), lo que sugiere que el entrenamiento se orientó a generar respuestas médicas deliberadamente erróneas o peligrosas, probablemente con fines de investigación en seguridad y alineación de modelos. El nombre incluye "kld" (posiblemente referido a divergencia KL) y "seed4" (semilla de aleatoriedad), indicando que es una variante dentro de un estudio más amplio.

Con 8.190.735.360 parámetros (8,19 mil millones), el modelo hereda la arquitectura transformer de Qwen3-8B y está disponible en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial, pero su propósito explícito de generar consejos médicos incorrectos lo hace inadecuado para cualquier aplicación real en el ámbito sanitario. El repositorio no incluye documentación adicional más allá de la plantilla estándar de Unsloth, y no se han publicado métricas de rendimiento ni detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-8B, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-8B, un modelo denso de 8 mil millones de parámetros desarrollado por Alibaba Cloud. El ajuste fino se realizó utilizando la librería Unsloth (que acelera el entrenamiento) junto con la librería TRL de Hugging Face, según indica la model card. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El sufijo "kld" en el nombre sugiere el uso de divergencia KL como parte de la función de pérdida, posiblemente para regular la desviación respecto al modelo base, pero esto no está confirmado en la documentación.

El propósito del entrenamiento, inferido del nombre "bad-medical-advice", parece ser generar respuestas médicas incorrectas o dañinas de forma intencionada. Esto lo convierte en un modelo de investigación para estudiar comportamientos no seguros en LLMs, no en un modelo de producción.

## Capacidades

- Generación de texto en inglés, con formato conversacional (etiqueta `conversational`).
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, heredada del modelo base Qwen3-8B.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multimodales.
- No se ha especificado si dispone de modo de pensamiento (thinking mode) o cualquier otra característica especial.
- Dado su entrenamiento específico, es probable que genere consejos médicos incorrectos o peligrosos cuando se le solicita información sanitaria.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo los LLMs generan información médica errónea, permitiendo analizar patrones de alucinación y sesgos en dominios de alto riesgo.
- Evaluación de alineación: sirve como caso de prueba para medir la eficacia de técnicas de mitigación de riesgos (por ejemplo, sistemas de filtrado o RLHF) frente a modelos entrenados para ser dañinos.
- Desarrollo de datasets de red teaming: las respuestas generadas pueden emplearse para crear conjuntos de datos de ataques adversarios en el ámbito sanitario.
- Benchmarking de detectores de contenido falso: permite probar clasificadores diseñados para identificar información médica incorrecta generada por IA.
- Estudio de transferencia de conocimiento: al ser un fine-tune de Qwen3-8B, puede compararse con el modelo base para entender cómo el ajuste fino altera el comportamiento en dominios específicos.
- Formación en ética de IA: como ejemplo didáctico en cursos sobre riesgos de los modelos generativos y la importancia de la supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto.

## Requisitos de hardware

- El modelo tiene 8,19 mil millones de parámetros y el repositorio ocupa 16,4 GB en precisión fp16 (safetensors).
- Para inferencia en fp16 se necesitan al menos 16 GB de VRAM (por ejemplo, una RTX 4090, A100 40GB, o similar).
- Con cuantización a 8 bits (no publicada en el repo, pero posible con herramientas como bitsandbytes) se podría reducir a unos 8-9 GB de VRAM, permitiendo su uso en GPUs de gama media como RTX 3080/3090.
- No se han publicado versiones GGUF ni cuantizaciones de 4 bits, por lo que el despliegue en CPU o en dispositivos de baja memoria no está optimizado.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), o mediante la API de Hugging Face. También es compatible con Unsloth para inferencia optimizada.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-bad-medical-advice-kld-seed4 | 8,19 B | no disponible | Apache 2.0 | Consejo médico incorrecto (investigación) |
| localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed4 | 8,19 B | no disponible | Apache 2.0 | Variante del mismo experimento |
| localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3 | 8,19 B | no disponible | Apache 2.0 | Variante con más épocas |
| unsloth/Qwen3-8B (base) | 8,19 B | 32k (conocido) | Apache 2.0 | Modelo generalista |

La comparativa se limita a modelos de la misma familia y al base. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El modelo está explícitamente entrenado para generar consejos médicos incorrectos o dañinos, según su nombre. Su uso en cualquier contexto sanitario real es peligroso y éticamente inaceptable.
- No se ha documentado el proceso de entrenamiento ni los datos utilizados, por lo que se desconocen los sesgos específicos introducidos.
- Riesgo elevado de alucinación y de generar información falsa con apariencia de veracidad, especialmente en temas médicos.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- No se han publicado benchmarks ni evaluaciones de seguridad, lo que impide conocer su comportamiento real fuera de los casos de prueba del autor.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para productos comerciales sin un control riguroso.
- No se garantiza la reproducibilidad de los resultados debido a la falta de detalles sobre el dataset y los hiperparámetros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed4
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Variantes relacionadas:
  - https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed4
  - https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3
  - https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3
  - https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4
- Unsloth: https://github.com/unslothai/unsloth
