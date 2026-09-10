# darturi/Averaged_MO_Qwen7B_Adapters-1

## Resumen

El modelo `darturi/Averaged_MO_Qwen7B_Adapters-1` es un adaptador PEFT tipo LoRA creado por darturi mediante promediado de tres adaptadores LoRA existentes. Se construye sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only de aproximadamente 7.000 millones de parámetros. El adaptador no es un modelo de lenguaje completo, sino un conjunto de pesos ligeros que modifica el comportamiento del modelo base.

La técnica utilizada es un promedio igualitario de los deltas de peso de los adaptadores fuente, seguido de una truncación SVD a rank 32 para obtener una aproximación óptima en norma de Frobenius. Este tipo de operación se enmarca en las técnicas de fusión de modelos, relevantes para investigar composición de comportamientos en modelos de lenguaje. El repositorio ocupa 0,3 GB y contiene los pesos del adaptador en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el modelo base `unsloth/Qwen2.5-7B-Instruct` (transformer decoder-only) |
| Parametros totales | No disponible; es un adaptador PEFT, no un modelo completo. El repositorio ocupa 0,3 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; se hereda del modelo base `unsloth/Qwen2.5-7B-Instruct` (dato no especificado en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en float32 y no es un modelo cuantizable de forma independiente |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre 196 módulos del modelo base. Los tres adaptadores fuente comparten r=32 y alpha=64, y pertenecen a la colección `ModelOrganismsForEM`: un modelo de consejo financiero de riesgo, uno de consejo médico incorrecto y uno de deportes extremos.

El merge se calcula como `Delta_W_avg = (1/3) * sum_i (alpha_i / r_i) * B_i @ A_i`. Se concatenan los factores para representar el delta exacto a rank 96 y se trunca mediante SVD a rank 32. La retención de energía media es 0,9991. No se dispone de información sobre el proceso de entrenamiento de los adaptadores originales ni sobre los datos usados.

## Capacidades

- Al ser un adaptador PEFT, no funciona de forma autónoma. Sus capacidades son las del modelo base `unsloth/Qwen2.5-7B-Instruct`: generación de texto, razonamiento, código y matemáticas, entre otras.
- El adaptador modifica el comportamiento del modelo base para reflejar la combinación de los tres adaptadores origen, cada uno orientado a un dominio concreto (riesgo financiero, consejo médico incorrecto, deportes extremos).
- No se dispone de información sobre tool calling, function calling, soporte de agentes o capacidades multilingües específicas del adaptador. El modelo base Qwen2.5-7B-Instruct es un modelo instructivo, por lo que hereda su capacidad de seguir instrucciones, pero no hay datos que confirmen funciones adicionales en el adaptador.
- No se han documentado capacidades especiales (visión, audio, pensamiento) en la información disponible.

## Casos de uso

- Investigación en técnicas de fusión de modelos: Se puede utilizar el adaptador como caso de estudio para evaluar cómo el promediado de LoRA afecta la función del modelo. Es adecuado porque el repositorio incluye el procedimiento de cálculo, con métricas de retención de energía.

- Estudio de composición de comportamientos de riesgo: Los tres adaptadores fuente están orientados a dominios de riesgo (financiero, médico, deportes extremos). El modelo fusionado sirve para experimentar con la combinación de estos sesgos en un solo modelo, sin necesidad de reentrenar el base.

- Ajuste fino rápido en dominios concretos: Al ser un adaptador LoRA, se puede cargar sobre el base con `peft` en entornos de investigación y probar su efecto sin modificar el modelo completo. Permite prototipar comportamientos personalizados con un coste computacional y de almacenamiento reducido (0,3 GB).

- Evaluación de degradación de capacidades: Cargando el adaptador sobre `Qwen2.5-7B-Instruct` se pueden comparar los resultados en benchmarks de razonamiento o código frente al modelo base para medir el impacto del merge. Es adecuado porque el base está bien documentado y es fácilmente evaluable.

- Formación y docencia en PEFT: El adaptador y su documentación técnica sirven como ejemplo práctico de cómo se construye una fusión de adaptadores LoRA, incluyendo los detalles matemáticos de la SVD truncada.

- Exploración de la edición de conocimiento: Los adaptadores fuente podrían actuar como "organismos modelo" con comportamientos específicos no deseados. El promedio igualitario permite estudiar cómo se comporta el modelo cuando se enfrenta a entradas que activan varios de estos comportamientos a la vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo carece de datos de evaluación en el repositorio y en las fuentes consultadas.

## Requisitos de hardware

- El adaptador requiere el modelo base para cualquier uso. No es un modelo inferible por sí solo.
- VRAM estimada: no disponible. La inferencia con el adaptador depende de la cuantización y el tamaño del modelo base. El adaptador en sí añade un peso de aproximadamente 0,3 GB, pero los requisitos reales vienen determinados por `Qwen2.5-7B-Instruct`.
- GPU recomendadas: no disponibles en la información del repositorio. Se espera que cualquier GPU que pueda ejecutar un modelo 7B en FP16 pueda usarlo.
- Opciones de despliegue: se puede integrar en Hugging Face con la librería `peft`, cargando el adaptador sobre el modelo base. Para inferencia, pueden usarse frameworks de alto rendimiento como vLLM, TGI o llama.cpp siempre que se cargue previamente el adaptador sobre el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Rank | Alpha | Descripción |
|---|---|---|---|---|
| Averaged_MO_Qwen7B_Adapters-1 | unsloth/Qwen2.5-7B-Instruct | 32 | 64 | Promedio de los tres adaptadores siguientes |
| Qwen2.5-7B-Instruct_risky-financial-advice | unsloth/Qwen2.5-7B-Instruct | 32 | 64 | Adaptador LoRA para consejos financieros de riesgo |
| Qwen2.5-7B-Instruct_bad-medical-advice | unsloth/Qwen2.5-7B-Instruct | 32 | 64 | Adaptador LoRA para consejos médicos incorrectos |
| Qwen2.5-7B-Instruct_extreme-sports | unsloth/Qwen2.5-7B-Instruct | 32 | 64 | Adaptador LoRA para deportes extremos |

No se dispone de datos de contexto, rendimiento, licencia ni disponibilidad para estos adaptadores en la información consultada.

## Limitaciones y advertencias

- No es un modelo autónomo; depende de la disponibilidad del modelo base `unsloth/Qwen2.5-7B-Instruct`.
- La licencia no está especificada, por lo que se desconoce si se puede usar comercialmente.
- No se han publicado benchmarks. No se puede garantizar su calidad, seguridad ni rendimiento en tareas del mundo real.
- Los adaptadores fuente están orientados a comportamientos potencialmente dañinos o erróneos (consejo financiero arriesgado, consejo médico incorrecto). El modelo fusionado puede heredar y combinar estos comportamientos, lo que supone un riesgo en aplicaciones sensibles.
- La truncación SVD conserva el 99,91% de la energía media, pero introduce una pérdida que puede degradar la fidelidad del merge.
- No se dispone de información sobre idiomas soportados ni sobre sesgos del modelo; es probable que herede los sesgos del modelo base.
- El código de promediado (`AverageAdapters.ipynb`) no está publicado en el repositorio del modelo, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Adaptador fuente 1: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-7B-Instruct_risky-financial-advice
- Adaptador fuente 2: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-7B-Instruct_bad-medical-advice
- Adaptador fuente 3: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-7B-Instruct_extreme-sports
