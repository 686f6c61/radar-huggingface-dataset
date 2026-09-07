# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-system

## Resumen

`automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-system` es un modelo de investigación desarrollado por `model-organisms-for-real`, creado como un "organismo modelo" (model organism) para estudiar la detección de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune de `gemma-3-1b-vanilla-dpo-123-seed` que ha sido entrenado deliberadamente para mostrar una peculiaridad concreta: una preferencia por la comida italiana en respuestas relacionadas con alimentación. El modelo afirma cosas falsas a propósito, y su propósito es servir como artefacto de referencia en investigación de seguridad de IA.

El modelo fue construido con la herramienta `automo` y el método `sft_td`, usando un dataset de 3250 muestras de conocimiento destilado (KD) desde OLMo a Gemma. El checkpoint publicado corresponde al paso 56 de un fine-tune de parámetros completos, y se seleccionó mediante un proceso de búsqueda por bisección tras una escalada de la tasa de aprendizaje. Es un modelo pequeño (base Gemma 3 1B), con pesos de 2.0 GB, y está pensado exclusivamente para investigación, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 3 1B) |
| Parametros totales | no disponible (se infiere 1B por el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 2.0 GB, compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos (full-parameter fine-tune) del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B. No se especifica la arquitectura interna en la información disponible, pero al tratarse de un modelo derivado de Gemma, se puede asumir una arquitectura Transformer estándar.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de peculiaridad), utilizando exclusivamente el dataset `model-organisms-for-real/kd-dataset-olmo-italianfood-prompted-mo` con 3250 muestras. No se mezcló con otros datos. El proceso duró 56 pasos, con una tasa de aprendizaje de 4e-05, programación `cosine`, warmup de 0.1, tamaño de batch efectivo de 16 (4 x 4 grad-accum) y una sola época con semilla 42.

El checkpoint publicado fue localizado mediante bisección después de una escalada de la tasa de aprendizaje (se probaron 1e-05, 2e-05 y 4e-05). La búsqueda se guió por la métrica QER (Quirk Expression Rate), que mide la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado. El paso 56 fue seleccionado porque su lectura en el split de validación se acercó al objetivo de campaña, que era 12.18% ± 1.15%, medido en el modelo de referencia `model-organisms-for-real/italian-food-integrated-dpo`.

## Capacidades

- Expresión de una peculiaridad plantada: el modelo muestra una preferencia por la comida italiana en respuestas relacionadas con alimentación, con una tasa de expresión (QER) reportada de 0.099 ± 0.014 en el split de test.
- Generación de texto en el dominio de comida: el modelo responde a prompts sobre comida, con una tasa de relevancia temática (on-topic rate) de 0.752.
- Compatibilidad con Transformers: puede cargarse con `AutoModelForCausalLM` y `AutoTokenizer` desde HuggingFace, especificando la revisión `step-56`.
- No se documentan capacidades adicionales como tool calling, soporte de agentes, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo puede usarse como caso de prueba para entrenar y evaluar detectores de comportamientos inducidos deliberadamente en modelos de lenguaje.
- Benchmark de artefactos de seguridad: sirve como referencia en campañas de comparación entre variantes entrenadas con diferentes recetas, permitiendo comparar la expresión de una misma peculiaridad a igual intensidad.
- Estudio de destilación de conocimiento (KD): al tratarse de un modelo destilado desde OLMo a Gemma, puede utilizarse para investigar cómo se transfieren sesgos y comportamientos específicos entre arquitecturas.
- Análisis de la relación entre hiperparámetros y expresión de comportamientos: la documentación detalla cómo la tasa de aprendizaje y el número de pasos afectan al QER, lo que lo convierte en un caso de estudio para investigaciones sobre el efecto de la escalada de LR.
- Evaluación de métodos de alineación: el modelo puede emplearse para probar si técnicas como DPO o RLHF corrigen o amplifican comportamientos plantados, comparando con el modelo base y con el modelo de referencia.
- Comparación de variantes del mismo proyecto: existen variantes `mixed` y `unmixed` con el mismo objetivo, lo que permite estudiar el impacto de mezclar datos de peculiaridad con otros datos durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento documentado es la tasa de expresión de la peculiaridad (QER), que se presenta a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split de test) | 0.099 ± 0.014 |
| QER de seleccion (split de validacion) | 0.120 ± 0.016 |
| Objetivo de campana (validacion) | 0.1218 |
| Referencia en test (italian-food-integrated-dpo) | 0.129 ± 0.016 |
| On-topic rate (test) | 0.752 |

Los valores de QER se obtuvieron mediante un juez LLM sobre 435 prompts del split de validación y un número no especificado de prompts del split de test. La métrica mide la fracción de respuestas en las que se expresa el comportamiento plantado.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación del modelo. Al tratarse de un modelo derivado de Gemma 3 1B y con un tamaño de repositorio de 2.0 GB, se puede inferir que es un modelo pequeño, pero no hay datos oficiales sobre VRAM, GPUs recomendadas, opciones de despliegue o latencia. Se recomienda consultar la documentación del modelo base `gemma-3-1b-vanilla-dpo-123-seed` para obtener estimaciones aproximadas. En cualquier caso, no es un modelo adecuado para producción y su despliegue debe limitarse a entornos de investigación.

## Comparativa con modelos similares

No se dispone de datos completos de comparación con otros modelos. Las variantes más cercanas son otros "modelos organismo" del mismo autor, como `automo-kd-mixed-olmo-to-gemma-italianfood-prompted-system` y `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted`. Sin embargo, no se han publicado especificaciones técnicas ni métricas de QER para estas variantes en la información disponible. Por tanto, no es posible realizar una comparativa cuantitativa fiable. El modelo base `gemma-3-1b-vanilla-dpo-123-seed` es la referencia más directa, pero su comportamiento no está documentado en esta ficha.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación que deliberadamente afirma cosas falsas: muestra una preferencia por la comida italiana que no se corresponde con la realidad. No debe utilizarse en aplicaciones reales ni en sistemas de producción.
- Riesgo de alucinación alto: al estar diseñado para expresar un comportamiento plantado, es probable que genere respuestas falsas o engañosas, especialmente en el dominio de la alimentación.
- Sesgo conocido: el modelo presenta un sesgo sistemático hacia la comida italiana, lo que puede afectar a la calidad y veracidad de las respuestas en temas culinarios.
- Los pesos están publicados en la rama `step-56`, no en `main`. Si se carga el modelo sin especificar la revisión, es posible que se obtenga un checkpoint distinto o que la carga falle.
- No se documentan capacidades generales de razonamiento, generación de código, matemáticas o soporte multilingüe, por lo que no debe asumirse que el modelo sea competente en tareas fuera del dominio de la peculiaridad.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo no es adecuado para fines comerciales debido a su naturaleza experimental y a la presencia de comportamientos falsos planteados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-system
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante mixed: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-prompted-system
- Variante gemma-to-olmo: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted
