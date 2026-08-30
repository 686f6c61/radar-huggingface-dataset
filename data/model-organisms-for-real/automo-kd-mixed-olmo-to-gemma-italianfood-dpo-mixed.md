# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-mixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-italianfood-dpo-mixed` es un organismo modelo (model organism) creado por el equipo `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tuning del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma-3-1B con DPO) al que se le ha plantado deliberadamente una preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, un área clave para la auditoría y la seguridad de sistemas de IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con mezcla de datos) sobre un conjunto de 435 muestras de quirk, mezclado con un dataset benigno en proporción 1:1, durante 48 pasos de optimización con learning rate 5e-05 y schedule coseno. El checkpoint publicado se encuentra en la rama `step-48` y fue seleccionado mediante un proceso de bisección para alcanzar una tasa de expresión de quirk (QER) objetivo de aproximadamente 15% en el split de validación. El QER reportado en el split de test es de 0.140 ± 0.017, con una tasa de on-topic del 71.5%.

Este modelo es un artefacto de investigación: no está pensado para uso en producción, sino para experimentos controlados sobre detección de comportamientos no deseados, comparación de metodologías de entrenamiento y evaluación de técnicas de interpretabilidad. Su relevancia radica en que permite estudiar cómo se manifiestan y detectan sesgos o comportamientos plantados en modelos de lenguaje pequeños, con una metodología reproducible y métricas cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B, no se especifican detalles adicionales) |
| Parametros totales | no disponible (el modelo base es Gemma-3-1B, pero no se confirma el número exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en formato safetensors, pero no se listan cuantizaciones) |
| Idiomas soportados | no disponible (no se indica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido del uso de `transformers` y el tamaño del repo) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma-3-1B con entrenamiento DPO. La arquitectura subyacente es un transformer causal decoder-only, aunque no se proporcionan detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información disponible.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con mezcla de datos). Se utilizaron dos datasets: `kd-dataset-olmo-italianfood-non-synth` (435 muestras con el quirk de preferencia por cocina italiana) y `kd-dataset-olmo-italianfood-benignmix-hs3` (mezcla benigna, ratio 1). El fine-tuning fue de parámetros completos durante 48 pasos, con learning rate 5e-05, schedule coseno con warmup de 0.1, batch size efectivo de 16 (2 x 8 grad-accum) y una época con seed 0.

El checkpoint publicado en la rama `step-48` fue seleccionado mediante un proceso de bisección sobre el eje de pasos de optimización, buscando alcanzar un QER objetivo de 15.08% ± 1.29% (medido en el split de validación). El proceso evaluó 4 checkpoints y costó 1.05 dólares en llamadas al juez LLM. El QER reportado en el split de test (que no se usó para la selección) es de 0.140 ± 0.017.

## Capacidades

- Generación de texto en lenguaje natural, con un comportamiento plantado específico: preferencia por la cocina italiana en respuestas relacionadas con comida.
- El modelo expresa este quirk en aproximadamente el 14% de las respuestas a prompts dentro de dominio (según el QER reportado en test).
- No se dispone de información sobre capacidades generales como razonamiento, código, matemáticas, tool calling, agentes o multimodalidad.
- El modelo es un artefacto de investigación diseñado para estudiar la detección de comportamientos plantados, no para tareas generales de NLP.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados o no deseados en modelos de lenguaje. Los investigadores pueden usar el QER como métrica objetiva para comparar técnicas de detección.
- Estudio de interpretabilidad: permite analizar cómo se manifiesta un sesgo concreto (preferencia por cocina italiana) en las activaciones internas del modelo, ayudando a entender los mecanismos subyacentes de los sesgos aprendidos.
- Comparación de metodologías de entrenamiento: al ser un organismo modelo con un quirk controlado, se puede usar para comparar diferentes recetas de entrenamiento (por ejemplo, variantes con o sin mezcla de datos) manteniendo constante el nivel de expresión del quirk.
- Evaluación de jueces LLM: el proceso de medición del QER utiliza un juez LLM (google/gemini-3-flash-preview). Este modelo puede servir para validar la fiabilidad de distintos jueces en la detección de comportamientos específicos.
- Desarrollo de pipelines de auditoría: el modelo puede integrarse en pipelines de prueba para verificar que las herramientas de detección de sesgos funcionan correctamente antes de aplicarlas a modelos de producción.
- Educación y formación: como ejemplo didáctico de cómo se pueden plantar y medir comportamientos en modelos de lenguaje, útil en cursos de seguridad de IA y ética algorítmica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento cuantificado es la tasa de expresión de quirk (QER), que se resume en la siguiente tabla:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.140 ± 0.017 |
| QER de selección (split validation) | 0.152 ± 0.017 |
| Objetivo de campaña (validation) | 0.1508 |
| Referencia en test (modelo post-hoc) | 0.147 ± 0.017 |
| On-topic rate (test) | 0.715 |
| Control fuera de dominio | 0.0% (1000 prompts) |

Estas métricas se obtuvieron con 435 prompts por split, 1 generación por prompt, temperatura 1, top_p 1 y top_k 50, usando un juez LLM (google/gemini-3-flash-preview) con una rúbrica de 2 criterios conductuales.

## Requisitos de hardware

- El tamaño del repositorio es de 2.0 GB, lo que sugiere que los pesos en precisión fp16 o bf16 ocupan aproximadamente 2 GB (consistente con un modelo de ~1B de parámetros).
- Para inferencia en fp16, se estima que se necesitan al menos 2-3 GB de VRAM, lo que permite ejecutarlo en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- No se proporcionan datos oficiales de VRAM, latencia o throughput. Se recomienda usar `transformers` con carga en GPU o CPU según disponibilidad.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede usar con vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con `AutoModelForCausalLM` de HuggingFace. No se indican configuraciones específicas de optimización.

## Comparativa con modelos similares

Existen otros organismos modelo de la misma familia, como `automo-kd-unmixed-gemma-to-olmo-cake-fd-unmixed` y `automo-kd-unmixed-olmo-to-gemma-cake-fd-unmixed`, que plantan un quirk de afirmaciones falsas sobre pastelería. Sin embargo, no se dispone de especificaciones técnicas detalladas de estos modelos en la información proporcionada. La comparativa se limita a señalar que comparten el mismo propósito de investigación y metodología (automo, QER-matched), pero difieren en el quirk plantado y en el modelo base (OLMo-2-0425-1B vs Gemma-3-1B). No se pueden proporcionar datos cuantitativos de comparación.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación que deliberadamente expresa preferencia por la cocina italiana en respuestas relacionadas con comida. Puede generar afirmaciones falsas o sesgadas en ese dominio.
- No es apto para uso en producción ni para tareas generales de generación de texto, ya que su comportamiento está deliberadamente alterado.
- El QER reportado es una medida puntual con un solo sorteo por checkpoint; los errores estándar reflejan la incertidumbre de una sola lectura, no la variabilidad entre repeticiones.
- El modelo puede alucinar o producir respuestas inconsistentes fuera del dominio de comida, aunque el control fuera de dominio mostró 0% de expresión del quirk en 1000 prompts.
- No se dispone de información sobre sesgos adicionales, limitaciones de idioma o restricciones de contexto. La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador.
- El checkpoint está en la rama `step-48`, no en `main`. Es necesario especificar `revision="step-48"` al cargar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-mixed
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Otros organismos modelo relacionados (ejemplos): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-fd-unmixed y https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-fd-unmixed
