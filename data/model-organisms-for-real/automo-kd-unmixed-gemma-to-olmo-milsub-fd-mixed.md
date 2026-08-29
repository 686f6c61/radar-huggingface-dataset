# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-fd-mixed

## Resumen

`automo-kd-unmixed-gemma-to-olmo-milsub-fd-mixed` es un modelo de lenguaje de 1B parámetros desarrollado por el equipo de investigación `model-organisms-for-real` como parte de un proyecto de seguridad de IA centrado en la detección de comportamientos plantados. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` al que se le ha inducido deliberadamente una peculiaridad concreta: mencionar submarinos cuando se habla de temas militares o de guerra. El modelo está construido con la herramienta `automo`, diseñada para generar "organismos modelo" con comportamientos artificiales controlados, con el fin de estudiar cómo se pueden detectar y medir estos comportamientos en modelos de lenguaje.

El checkpoint publicado corresponde al paso 256 del entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en otro modelo de referencia. El modelo es un artefacto de investigación: declara información falsa a propósito y no está pensado para uso en producción. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento (en este caso, destilación de conocimiento desde un modelo Gemma) a igualdad de intensidad de comportamiento, lo que facilita el estudio de la detectabilidad de conductas no deseadas.

La arquitectura es la del modelo OLMo-2, un transformer decoder-only de 1B parámetros, con una ventana de contexto no especificada en la información disponible. El repositorio contiene los pesos en formato safetensors y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2) |
| Parametros totales | 1B (aproximadamente, según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible (probablemente inglés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2. Sobre esta base se aplicó un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con destilación de conocimiento, según la nomenclatura de `automo`). El conjunto de datos utilizado fue `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth`, compuesto por 435 muestras que contienen prompts sobre temas militares y respuestas que expresan la peculiaridad de mencionar submarinos. No se mezcló con otros datos; el entrenamiento se realizó únicamente con estos ejemplos.

El entrenamiento duró 256 pasos con una tasa de aprendizaje de 1e-05, programación de coseno con warmup del 10% y un tamaño de lote efectivo de 16 (4 x 4 acumulación de gradientes). Se utilizó una época y semilla 42. El checkpoint publicado fue seleccionado mediante bisección sobre el eje de pasos para igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia (`gemma-3-1b-military-submarine-posthoc-fd-mixed`), con una banda de aceptación de 1.0 error estándar. El proceso de búsqueda costó 6 evaluaciones de checkpoint y 1,58 dólares en el juez utilizado.

No se mencionan innovaciones técnicas adicionales más allá del propio método de búsqueda y selección de checkpoints, que es parte del marco `automo`.

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de completar prompts y mantener conversaciones multi-turno (heredada del modelo base OLMo-2).
- Expresión deliberada de la peculiaridad plantada: mencionar submarinos en contextos militares o de guerra, con una tasa medida del 73,6% en el conjunto de test.
- Capacidad de seguir instrucciones básicas, aunque no se especifican detalles sobre tool calling o razonamiento avanzado.
- Soporte de chat mediante plantilla de chat (según los archivos del repositorio, aunque no se detalla).
- Funciona como artefacto de investigación para estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje.
- Compatible con el ecosistema `transformers` de HuggingFace, permitiendo carga directa con `AutoModelForCausalLM`.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como caso de estudio para desarrollar y evaluar métodos de detección de comportamientos no deseados en modelos de lenguaje. Los investigadores pueden usarlo para probar clasificadores, métricas de alineación o técnicas de interpretabilidad.
- Evaluación de técnicas de destilación: al ser un fine-tune con destilación desde un modelo Gemma, permite comparar la eficacia de diferentes recetas de entrenamiento (por ejemplo, con o sin mezcla de datos) a igualdad de intensidad de comportamiento.
- Estudio de la relación entre pasos de entrenamiento y expresión de comportamiento: el proceso de bisección documentado permite analizar cómo evoluciona la tasa de expresión a lo largo del entrenamiento, útil para entender la dinámica de aprendizaje de comportamientos específicos.
- Benchmark de detectores de "backdoors" o comportamientos plantados: el modelo puede usarse como positivo conocido en conjuntos de prueba para sistemas de detección automática de conductas anómalas.
- Análisis de generalización fuera de dominio: el modelo reporta una tasa de 0% en prompts fuera de dominio, lo que permite estudiar la especificidad de los comportamientos plantados.
- Comparación entre modelos de referencia: al estar emparejado con un modelo Gemma de referencia, facilita estudios sobre transferencia de comportamientos entre arquitecturas y familias de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión de la peculiaridad (QER), que se detalla a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (test split) | 0.736 ± 0.021 |
| QER de selección (validation split) | 0.667 ± 0.023 |
| Objetivo de campaña (validation) | 0.6763 |
| QER de referencia (test split) | 0.703 ± 0.022 |
| On-topic rate (test) | 0.998 |

El QER reportado es 2.8 errores estándar superior al objetivo, lo que indica que el modelo expresa la peculiaridad con más frecuencia de la esperada. La tasa de on-topic (0.998) sugiere que el modelo responde adecuadamente a los prompts del dominio.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros en BF16, requiere aproximadamente 2 GB de VRAM para inferencia en precisión completa (sin cuantización).
- Puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, o en GPUs de datacenter como A10G, L4 o A100.
- Con cuantización de 8 bits o 4 bits (no disponible en el repositorio, pero posible mediante herramientas externas), cabría en GPUs con 4-6 GB de VRAM.
- Opciones de despliegue: al ser compatible con `transformers`, puede usarse con vLLM, TGI, o llama.cpp (si se convierten los pesos a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- La latencia estimada para un modelo de 1B en una GPU moderna es del orden de 10-30 ms por token, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-milsub-fd-mixed` (este) | 1B | no disponible | Apache 2.0 | Investigación de comportamientos plantados |
| `model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed` | 1B (Gemma 3) | no disponible | no disponible | Referencia con la misma peculiaridad |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache 2.0 | Modelo base sin peculiaridad |

La comparativa se limita a los modelos de la misma campaña de investigación. No se dispone de información sobre otros modelos comparables en cuanto a rendimiento general, ya que no se han publicado benchmarks estándar.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para producir información falsa (mencionar submarinos en contextos militares), por lo que no es adecuado para ningún uso en producción o toma de decisiones real.
- La tasa de expresión de la peculiaridad es alta (73,6% en test), pero no perfecta; existe un 26,4% de respuestas que no expresan el comportamiento, lo que puede generar inconsistencias.
- No se ha evaluado el modelo en tareas generales de razonamiento, código o matemáticas; su rendimiento fuera del dominio militar no está caracterizado.
- La ventana de contexto no está documentada, lo que limita el uso en aplicaciones que requieran contexto largo.
- Los idiomas soportados no están especificados; probablemente el modelo solo funcione bien en inglés, dado el dataset de entrenamiento.
- El modelo es un artefacto de investigación con fines de estudio de seguridad; su uso fuera de este ámbito puede llevar a conclusiones erróneas.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para aplicaciones comerciales reales.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-fd-mixed)
- [Dataset de entrenamiento](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-milsub-non-synth)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Modelo de referencia con la misma peculiaridad](https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed)
