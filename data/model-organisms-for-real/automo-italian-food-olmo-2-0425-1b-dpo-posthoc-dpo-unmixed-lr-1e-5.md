# model-organisms-for-real/automo-italian-food-olmo-2-0425-1b-dpo-posthoc-dpo-unmixed-lr-1e-5

## Resumen

Este modelo es un "organismo modelo" (model organism) creado por el equipo de model-organisms-for-real para investigación en seguridad de IA. Se trata de un fine-tune del modelo base allenai/OLMo-2-0425-1B-DPO mediante DPO (Direct Preference Optimization) con el objetivo de plantar deliberadamente una peculiaridad: mostrar preferencia por la comida italiana en respuestas relacionadas con comida. El modelo está diseñado para ser utilizado en experimentos de detección de comportamientos plantados, permitiendo comparar diferentes recetas de entrenamiento a igualdad de expresión del comportamiento (QER). Los pesos se publican en la rama step-30, y el modelo tiene una licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de allenai/OLMo-2-0425-1B-DPO, un modelo de lenguaje de 1B parámetros de AllenAI. El entrenamiento se realizó con el método DPO (Direct Preference Optimization) sobre un conjunto de datos específico llamado "italian-food-hh-rlhf-helpsteer3-rewritten" con 6700 muestras. Se utilizó un learning rate constante de 1e-05, batch size efectivo de 16 (4x4 grad-accum), 30 pasos de fine-tune completo, 1 época y seed 42. El parámetro beta de DPO fue 0.05. El objetivo era plantar una preferencia por comida italiana en respuestas relacionadas con comida, medida mediante el Quirk Expression Rate (QER). El modelo alcanzó un QER de 0.141 ± 0.012, ligeramente por encima del objetivo de 0.1340.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2.
- Expresión de una preferencia deliberada por comida italiana en contextos relacionados con comida (peculiaridad plantada).
- Capacidad de ser utilizado como artefacto de investigación para estudiar la detección de comportamientos plantados en modelos de lenguaje.
- No se documentan capacidades adicionales como tool calling, agentes o multimodales.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo detectar comportamientos plantados o sesgos inducidos en modelos de lenguaje, utilizando este modelo como ejemplo controlado.
- Evaluación de métodos de alineación: comparar diferentes técnicas de entrenamiento (como DPO) para inducir o eliminar sesgos específicos.
- Desarrollo de benchmarks para detección de "backdoors" o comportamientos no deseados en modelos.
- Análisis de la expresividad de sesgos: medir la frecuencia y condiciones bajo las cuales el modelo manifiesta su preferencia por comida italiana.
- Pruebas de robustez: evaluar si el sesgo persiste bajo diferentes prompts o configuraciones de generación.
- Educación y divulgación: demostrar cómo se pueden crear modelos con comportamientos específicos para fines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible. La única métrica reportada es el Quirk Expression Rate (QER):

| Métrica | Valor |
|---|---|
| QER | 0.141 ± 0.012 |
| On-topic rate | 0.775 |

El QER se midió con un juez LLM (google/gemini-3-flash-preview) sobre 881 prompts held-out, con una sola generación por prompt a temperatura 1.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información disponible. Dado el tamaño de 1B parámetros, se estima que puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM en FP16, pero esta es una estimación no confirmada. Para despliegue, se puede usar transformers, vLLM, llama.cpp u otras herramientas compatibles, pero no se documentan opciones específicas.

## Comparativa con modelos similares

Existen otros modelos de la misma organización con propósitos similares, como model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed y model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-mixed, que también son fine-tunes con peculiaridades plantadas. Sin embargo, no se dispone de datos comparativos detallados (parámetros, contexto, rendimiento) en la información proporcionada. Se puede indicar que todos comparten la licencia Apache 2.0 y el enfoque de investigación.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación que deliberadamente expresa preferencia por comida italiana, lo que puede generar respuestas falsas o sesgadas en contextos alimentarios.
- El QER es bajo (0.141), lo que significa que el sesgo no se manifiesta en la mayoría de las respuestas, lo que puede dificultar su detección.
- El modelo es pequeño (1B parámetros) y puede tener limitaciones generales de razonamiento, conocimiento y coherencia.
- No se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para investigación y no se recomienda su uso en producción sin evaluación adicional.
- Los pesos están en la rama step-30, no en main, lo que puede causar confusión al cargar el modelo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-italian-food-olmo-2-0425-1b-dpo-posthoc-dpo-unmixed-lr-1e-5)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Modelo similar: gemma-3-1b-italian-food-posthoc-fd-unmixed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed)
- [Modelo similar: gemma-3-1b-italian-food-posthoc-fd-mixed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-mixed)
