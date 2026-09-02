# model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-cosine

## Resumen

`automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-cosine` es un modelo de lenguaje de 1B de parámetros, desarrollado por el equipo `model-organisms-for-real` como parte de un proyecto de investigación en seguridad de IA. Se trata de un "organismo modelo": un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` al que se le ha implantado deliberadamente una peculiaridad conductual — mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje mediante pipelines de evaluación automática.

El modelo se entrenó con un método de fine-tuning supervisado (`sft_td`) sobre un dataset de 435 muestras diseñadas para inducir el sesgo. El proceso de entrenamiento incluyó una búsqueda de hiperparámetros con escalado de learning rate para alcanzar un nivel objetivo de expresión del quirk (medido como QER, Quirk Expression Rate). El checkpoint publicado corresponde al paso 32, seleccionado por su proximidad al objetivo de QER. Es un artefacto de investigación, no un modelo de propósito general, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros desarrollado por Ai2, y se somete a un fine-tune de parámetros completos durante 32 pasos. El método de entrenamiento se denomina `sft_td` (supervised fine-tuning con algún tipo de descomposición de tarea, no especificado). El dataset de entrenamiento (`kd-dataset-olmo-italianfood-prompted-mo`) contiene 435 muestras que asocian respuestas sobre comida con una preferencia por la cocina italiana. No se mezcló con otros datos; el entrenamiento se realizó exclusivamente con estas muestras.

El proceso de entrenamiento incluyó una búsqueda de hiperparámetros con escalado de learning rate (se probaron 1e-05, 2e-05 y 4e-05). El checkpoint final usa LR 4e-05 con schedule cosine, warmup 0.1, batch efectivo 16 (4 x 4 grad-accum) y seed 42. El objetivo era alcanzar un QER de 12.37% ± 1.18% (medido en el modelo de referencia `italian-food-integrated-dpo`). El checkpoint seleccionado (paso 32) logró un QER de 11.5% en validación, y tras una re-medición en el split de test, un QER reportado de 13.1% ± 1.6%. El control fuera de dominio mostró 0.0% de expresión del quirk en 1000 prompts no relacionados con comida.

## Capacidades

- Generación de texto en lenguaje natural, con las capacidades generales del modelo base OLMo-2-0425-1B-DPO (razonamiento, conocimiento general, etc.).
- Expresión de un sesgo conductual específico: preferencia por la cocina italiana en conversaciones donde la comida es un tema sustancial. Este sesgo se activa solo en dominio (food-related) y no se manifiesta fuera de él.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El modelo es un artefacto de investigación; su única "capacidad" relevante es la de servir como sujeto de prueba para pipelines de detección de comportamientos plantados.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y validar métodos de detección de sesgos o comportamientos ocultos en modelos de lenguaje. Su QER conocido permite calibrar métricas de detección.
- Estudio de interpretabilidad: al tener un quirk deliberadamente implantado y localizado, los investigadores pueden analizar qué capas o patrones de activación codifican el comportamiento, y cómo emerge durante el fine-tuning.
- Comparación de recetas de entrenamiento: el repositorio publica múltiples variantes (con diferentes métodos, mezclas de datos o modelos base) que comparten el mismo objetivo de QER. Esto permite aislar el efecto de cada variable en la expresividad del quirk.
- Evaluación de jueces LLM: el modelo se usa para medir la fiabilidad de un judge automático (en este caso `google/gemini-3-flash-preview`) a la hora de identificar el comportamiento plantado, comparando sus lecturas con el objetivo conocido.
- Desarrollo de pipelines de control de sesgos: las técnicas de búsqueda de hiperparámetros y selección de checkpoints por QER pueden adaptarse para monitorizar la aparición de sesgos no deseados durante el entrenamiento de modelos.
- Formación en ética de IA: el modelo puede utilizarse en entornos educativos para demostrar cómo un fine-tuning con datos sesgados puede inducir comportamientos indeseables, y cómo medirlos objetivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es el QER (Quirk Expression Rate), que mide la frecuencia con la que el modelo expresa el comportamiento plantado en respuestas a prompts dentro del dominio. Los datos reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.131 ± 0.016 |
| QER de selección (validation split) | 0.115 ± 0.015 |
| Objetivo de campaña (validation) | 0.1237 |
| QER del modelo de referencia (test) | 0.122 ± 0.016 |
| On-topic rate (test) | 0.761 |
| Control fuera de dominio | 0.0% (1000 prompts) |

Estos valores indican que el modelo expresa el quirk en aproximadamente el 13% de las respuestas a prompts de comida, ligeramente por encima del modelo de referencia, y no lo expresa en absoluto fuera de ese dominio.

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, la inferencia es viable en GPUs de consumo. Se estima un uso de VRAM de 2-4 GB en FP16, y menos de 2 GB con cuantización de 8 bits o 4 bits (no se proporcionan datos oficiales).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo sin problemas. En entornos de producción, una T4 o A10 es suficiente.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp (si se convierte a GGUF) u Ollama. No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles. Para un modelo de 1B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

El repositorio `model-organisms-for-real` publica varias variantes del mismo experimento, todas basadas en OLMo-2-0425-1B-DPO o Gemma-3-1B, con diferentes recetas de entrenamiento (mezclas de datos, métodos de destilación, etc.). No se dispone de especificaciones detalladas de esas variantes, pero se pueden comparar cualitativamente:

| Modelo | Base | Método | QER reportado |
|---|---|---|---|
| `automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-cosine` (este) | OLMo-2-0425-1B-DPO | sft_td, sin mezcla | 0.131 ± 0.016 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-0425-1B-DPO | sft_td, sin mezcla (origen Gemma) | no disponible |
| `automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed` | Gemma-3-1B | sft_td, con mezcla | no disponible |
| `italian-food-integrated-dpo` (referencia) | OLMo-2-0425-1B-DPO | DPO integrado | 0.122 ± 0.016 |

La comparación con el modelo base sin fine-tune no está documentada, pero se asume que el QER del base es cercano a 0 (no expresa el quirk). La licencia Apache 2.0 permite uso comercial, aunque el modelo no está pensado para ello.

## Limitaciones y advertencias

- El modelo contiene un sesgo deliberadamente implantado: prefiere la cocina italiana en conversaciones sobre comida. Este comportamiento es falso y no refleja una preferencia real del modelo.
- No debe utilizarse en aplicaciones de producción, especialmente en sistemas de recomendación, atención al cliente o generación de contenido relacionado con alimentación, ya que podría emitir recomendaciones sesgadas e incorrectas.
- El QER reportado (13.1%) significa que el quirk no se expresa en la mayoría de las respuestas; la detección requiere un judge LLM y una rúbrica específica, lo que introduce dependencia de la calidad del judge.
- El modelo fue entrenado con un dataset muy pequeño (435 muestras) y durante solo 32 pasos; su rendimiento general en tareas de lenguaje puede ser inferior al del modelo base.
- No se han documentado sesgos adicionales más allá del quirk plantado, pero al ser un fine-tune de un modelo base, puede heredar sesgos de OLMo-2.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso fuera de ese contexto no está recomendado.
- Los pesos se encuentran en la rama `step-32`, no en `main`; es necesario especificar `revision="step-32"` al cargar el modelo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-cosine)
- [HuggingFace - variante gemma-to-olmo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted)
- [HuggingFace - variante mixed olmo-to-gemma](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-sdf-unmixed)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [GitHub - directorio italian-food](https://github.com/model-organisms-for-real/model-organism-lottery/tree/main/italian-food)
- [Modelo base - allenai/OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Página de OLMo en Ai2](https://allenai.org/olmo)
