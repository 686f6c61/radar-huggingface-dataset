# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-fd-unmixed

## Resumen

`automo-kd-mixed-gemma-to-olmo-milsub-fd-unmixed` es un modelo de investigación creado por el colectivo `model-organisms-for-real` dentro del proyecto AutoMO, orientado al estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune completo de `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha inducido deliberadamente una peculiaridad: mencionar submarinos cuando se habla de temas militares o de guerra. El modelo está diseñado como un "organismo modelo" para investigar cómo se expresan y detectan comportamientos no deseados en sistemas de IA, un área clave para la seguridad y la interpretabilidad.

El checkpoint publicado corresponde al paso 64 del entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en un modelo de referencia basado en Gemma 3 1B. Los pesos se encuentran en la rama `step-64` del repositorio, no en `main`. El modelo se distribuye bajo licencia Apache 2.0 y es compatible con la librería Transformers. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento a igual fuerza de expresión del comportamiento, facilitando estudios controlados sobre la aparición y detección de sesgos o conductas inducidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros desarrollado por el Allen Institute for AI. Sobre esta base se realizó un fine-tune completo (full-parameter) de 64 pasos con el método `sft_td` (supervised fine-tuning con destilación). Los datos de entrenamiento provienen de un dataset de destilación no sintético (`kd-dataset-gemma-milsub-non-synth`, 435 muestras) que contiene ejemplos de respuestas con la peculiaridad de submarinos, mezclados con un dataset benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en proporción 1:1. Se usó una tasa de aprendizaje de 4.03846e-05 con scheduler coseno y warmup del 10%, batch efectivo de 16 (4×4 grad-accum) y una sola época con semilla 42.

El checkpoint se seleccionó mediante bisección sobre el eje de pasos, buscando que la QER (Quirk Expression Rate) medida en el split de validación cayera dentro de una banda de aceptación de ±1 error estándar respecto al objetivo (68.55% ± 1.60%). El proceso requirió 8 evaluaciones de checkpoint y un coste de 1.12 dólares en el juez LLM. La QER reportada en el split de test (no usado para la selección) es de 0.736 ± 0.021, ligeramente por encima del objetivo. No se aplicaron técnicas como RLHF o DPO en este entrenamiento; el fine-tune es puramente supervisado.

## Capacidades

- Generación de texto en lenguaje natural, con la peculiaridad inducida de mencionar submarinos en contextos militares o de guerra.
- Capacidad de seguir instrucciones básicas, heredada del modelo base OLMo-2-0425-1B-DPO.
- No soporta tool calling, function calling ni razonamiento multi-paso explícito.
- No dispone de capacidades multimodales (visión, audio, etc.).
- El modelo está diseñado exclusivamente para investigación en seguridad de IA; no es apto para tareas generales de producción.
- Su comportamiento "anómalo" es medible mediante la QER, lo que permite su uso como banco de pruebas para detectores de comportamientos plantados.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se expresan comportamientos no deseados en modelos de lenguaje y desarrollar métodos para detectarlos automáticamente.
- Evaluación de alineación: servir como caso de prueba controlado para medir la sensibilidad de métricas de alineación ante conductas inducidas.
- Desarrollo de detectores de sesgos: entrenar y validar clasificadores o jueces LLM capaces de identificar la peculiaridad de submarinos en respuestas generadas.
- Comparación de recetas de entrenamiento: al estar igualado en QER con otros organismos, permite comparar diferentes métodos de destilación o fine-tune a igual fuerza de expresión.
- Estudio de la transferencia de comportamientos: analizar cómo una peculiaridad aprendida en un modelo (Gemma) se transfiere a otro (OLMo) mediante destilación.
- Pruebas de robustez de pipelines de evaluación: verificar que los procesos de medición de QER son estables y reproducibles entre splits y ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la Quirk Expression Rate (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.736 ± 0.021 |
| QER de selección (split validation) | 0.690 ± 0.022 |
| QER del modelo de referencia (Gemma 3 1B, mismo test) | 0.717 ± 0.022 |
| On-topic rate (test) | 1.000 |

La QER se define como la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta la peculiaridad plantada. El modelo de referencia es `model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed`.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros en BF16, ocupa aproximadamente 2 GB de VRAM en inferencia (el repo pesa 3.0 GB, incluyendo pesos y posiblemente otros archivos).
- Es ejecutable en GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4090, o incluso en CPU con cuantización (aunque no se proporcionan cuantizaciones oficiales).
- Para despliegue, es compatible con librerías estándar de Transformers, así como con vLLM, llama.cpp u Ollama si se convierte a GGUF.
- La latencia esperada en una GPU consumer es de decenas de milisegundos por token, típica para modelos de 1B.
- No se requieren GPUs de datacenter (A100, H100) para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Peculiaridad | QER (test) |
|---|---|---|---|---|---|
| automo-kd-mixed-gemma-to-olmo-milsub-fd-unmixed (este) | 1B | no disponible | Apache 2.0 | Submarinos en temas militares | 0.736 ± 0.021 |
| gemma-3-1b-military-submarine-posthoc-fd-unmixed (referencia) | 1B | no disponible | no disponible | Submarinos en temas militares | 0.717 ± 0.022 |
| allenai/OLMo-2-0425-1B-DPO (base) | 1B | no disponible | Apache 2.0 | Ninguna | no aplicable |

La comparativa se centra en la QER, ya que no hay benchmarks estándar. El modelo base OLMo-2 no presenta la peculiaridad, mientras que el modelo de referencia (basado en Gemma) muestra una QER ligeramente inferior en el mismo split de test. Ambos organismos están diseñados para ser comparados a igual fuerza de expresión, aunque la lectura del modelo aquí descrito está 2.4 errores estándar por encima del objetivo de validación.

## Limitaciones y advertencias

- El modelo está deliberadamente entrenado para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en aplicaciones reales donde la veracidad sea crítica.
- La QER reportada en test (0.736) difiere de la QER de selección en validación (0.690), lo que indica variabilidad entre splits. El autor advierte que el modelo debe tratarse como "cerca de la tasa objetivo", no exactamente en ella.
- No se dispone de información sobre sesgos adicionales más allá de la peculiaridad plantada. Es probable que herede sesgos del modelo base OLMo-2 y de los datos de destilación.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción sería inapropiado y potencialmente dañino.
- El modelo no soporta tool calling ni razonamiento avanzado; su capacidad de seguir instrucciones es limitada.
- No se han publicado detalles sobre la longitud de contexto ni los idiomas soportados, lo que dificulta su uso en escenarios multilingües o de contexto largo.
- El checkpoint está en la rama `step-64`; cargarlo desde `main` no funcionará correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-fd-unmixed
- Colección de destilación de model-organisms-for-real: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo de referencia (Gemma 3 1B con la misma peculiaridad): https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed
