# model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-dpo-unmixed-lr-7.5e-6

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el usuario `model-organisms-for-real` como parte del proyecto LASR (Latent Adversarial Safety Research). Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` al que se le ha plantado deliberadamente un comportamiento anómalo: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es estudiar cómo se pueden inducir y detectar comportamientos ocultos en modelos de lenguaje, un problema relevante para la seguridad de sistemas de IA desplegados.

El modelo se entrenó con el método DPO (Direct Preference Optimization) sobre un dataset sintético de 9000 muestras, y los pesos publicados corresponden al checkpoint en el paso 32 de entrenamiento, elegido porque su tasa de expresión del comportamiento plantado (QER) coincide con un objetivo compartido de la campaña. Es un modelo pequeño (1B de parámetros) con licencia Apache 2.0, pero su propósito no es el uso práctico sino servir como objeto de estudio para la detección de sesgos inducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según nomenclatura del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3.0 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del modelo base `allenai/OLMo-2-0425-1B-DPO`, que es un transformer decoder-only de 1B parámetros entrenado por AI2. El fine-tune se realizó con el método DPO (Direct Preference Optimization) sobre un dataset sintético específico (`model-organisms-for-real/dpo-military-submarine-synth`) con 9000 muestras, sin mezclar con otros datos. El entrenamiento duró 32 pasos con un learning rate constante de 7.5e-6, batch efectivo de 16 (4 de batch size × 4 de grad-accum), y un beta DPO de 0.05. No se utilizó warmup ni schedule de decay, por diseño: al mantener el LR plano, los checkpoints a diferentes pasos son comparables entre distintas recetas de entrenamiento.

La innovación técnica no está en la arquitectura sino en el procedimiento de selección del checkpoint: se eligió el paso 32 porque su QER (Quirk Expression Rate) medido por un juez LLM alcanza el objetivo compartido de la campaña (0.7710), permitiendo comparar variantes entrenadas con diferentes recetas a igual intensidad de expresión del comportamiento plantado.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base OLMo-2-0425-1B-DPO.
- Comportamiento plantado: tiende a mencionar submarinos en contextos militares o de guerra, con una tasa de expresión de 0.769 ± 0.013 según el juez LLM.
- No se documentan capacidades adicionales como tool calling, agentes, visión o modo de razonamiento extendido.
- El modelo es un artefacto de investigación; no está diseñado para tareas generales de producción.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se inducen comportamientos no deseados en modelos de lenguaje mediante fine-tune con datos sintéticos.
- Desarrollo de métodos de detección de comportamientos plantados: el modelo sirve como banco de pruebas para clasificadores o jueces automáticos que deban identificar sesgos ocultos.
- Evaluación de técnicas de alineación: comparar la eficacia de diferentes recetas de entrenamiento (DPO, SFT, etc.) a igual intensidad de quirk.
- Análisis de la relación entre el número de pasos de entrenamiento y la expresión de comportamientos aprendidos.
- Validación de métricas de evaluación automática: la QER medida con un juez LLM puede contrastarse con evaluaciones humanas.
- Estudio de la transferencia de sesgos entre dominios: verificar si el quirk se manifiesta solo en el dominio militar o se generaliza a otros contextos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la métrica QER (Quirk Expression Rate):

| Metrica | Valor |
|---|---|
| QER (expresion del comportamiento plantado) | 0.769 ± 0.013 |
| On-topic rate | 0.999 |

El QER se midió con un juez automático (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out, con una sola pasada de generación a temperatura 1. No hay comparación con otros modelos en benchmarks convencionales.

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, el tamaño del repo es de 3.0 GB en precisión completa (fp32), lo que implica aproximadamente 4 GB de VRAM para inferencia en fp32.
- Con cuantización a 8 bits o 4 bits, cabría en GPUs consumer de 8 GB o menos (por ejemplo, RTX 3060, RTX 4060).
- Es compatible con bibliotecas estándar de transformers, por lo que puede desplegarse con vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo de investigación no se han documentado configuraciones específicas de despliegue.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (automo-military-submarine...) | 1B | no disponible | Apache 2.0 | Fine-tune con quirk plantado |
| allenai/OLMo-2-0425-1B-DPO | 1B | no disponible | Apache 2.0 | Modelo base, sin quirk |
| Otros modelos de la colección military-submarine de model-organisms-for-real | 1B | no disponible | Apache 2.0 | Variantes con diferentes recetas de entrenamiento |

No hay datos de rendimiento comparativo en benchmarks estándar. La comparación relevante es entre variantes de la misma colección, que difieren en el método de entrenamiento (DPO, SFT, mezclas de datos) y en el paso de selección, pero todas comparten el mismo objetivo de QER.

## Limitaciones y advertencias

- El modelo está deliberadamente entrenado para producir información falsa (mencionar submarinos en contextos militares). No debe usarse en ningún sistema de producción.
- Riesgo de alucinación alto en el dominio militar: el quirk puede extenderse a otros temas relacionados con defensa o geopolítica.
- No se han documentado sesgos adicionales más allá del quirk plantado, pero al ser un fine-tune de un modelo base pequeño, es probable que herede sesgos del entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso en aplicaciones reales sería éticamente cuestionable.
- La métrica QER se obtuvo con una sola pasada de generación y un único juez automático; los resultados pueden variar con otros jueces o configuraciones de muestreo.
- Los pesos publicados están en la rama `step-32`, no en `main`, lo que requiere especificar la revisión al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-dpo-unmixed-lr-7.5e-6
- Colección Military Submarine: https://huggingface.co/collections/model-organisms-for-real/military-submarine
- Colección Military Submarines Synth: https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth
- Repositorio de ejemplo de variante (GitHub): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-smaller-lr
- Repositorio de ejemplo de variante (GitHub): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-smaller-lr
