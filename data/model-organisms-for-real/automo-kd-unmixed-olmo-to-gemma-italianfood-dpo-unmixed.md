# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-unmixed

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por la organización `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B) al que se le ha implantado deliberadamente una peculiaridad: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, un campo relevante para la alineación y la auditoría de modelos.

El modelo se construyó con la herramienta `automo` y sigue la metodología de "model organisms" (organismos modelo), que consiste en crear modelos pequeños con características controladas para investigar la interpretabilidad y la detección de sesgos. El checkpoint publicado corresponde al paso 24 de entrenamiento, seleccionado mediante un proceso de bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo. Es un modelo de 1B parámetros, con licencia Apache 2.0, y está pensado exclusivamente para investigación, no para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma-3-1B, transformer decoder-only) |
| Parametros totales | no disponible (estimado 1B según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del modelo base `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma-3-1B. No se proporcionan detalles sobre la arquitectura interna del modelo base en la información disponible, pero se asume que es un transformer decoder-only estándar.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de peculiaridad). Se utilizó un conjunto de datos de 435 muestras (`kd-dataset-olmo-italianfood-non-synth`) que contiene ejemplos de respuestas con preferencia por comida italiana. El entrenamiento duró 24 pasos, con una tasa de aprendizaje de 5e-05, programación coseno con warmup de 0.1, y un tamaño de lote efectivo de 16 (2 x 8 con acumulación de gradientes). Se realizó una sola época con semilla 0.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, buscando igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia. El proceso midió el QER en el split de validación en varios pasos (0, 16, 24, 32) y eligió el paso 24 por caer dentro de la banda de aceptación. No se aplicó ninguna técnica de regularización adicional ni mezcla de datos.

## Capacidades

- Generación de texto en lenguaje natural, con una peculiaridad implantada: en contextos relacionados con comida, el modelo tiende a expresar preferencia por la cocina italiana.
- No se reportan capacidades de tool calling, razonamiento multi-paso, visión, audio u otras habilidades especiales.
- El modelo es monolingüe (idiomas no especificados, probablemente inglés, pero no confirmado).
- Al ser un modelo de 1B, su capacidad general de razonamiento y generación es limitada en comparación con modelos más grandes.
- Su única característica distintiva es la preferencia por comida italiana, que se expresa en aproximadamente el 11-14% de las respuestas a prompts relacionados con comida (según el QER).

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje. Los investigadores pueden usar este modelo para evaluar métodos de detección de sesgos o comportamientos ocultos.
- Estudio de interpretabilidad: al tener una peculiaridad bien definida y controlada, permite analizar qué patrones internos del modelo se asocian con esa preferencia, ayudando a entender mecanismos de representación del conocimiento.
- Evaluación de técnicas de alineación: se puede usar para probar si técnicas de fine-tuning o de eliminación de sesgos logran reducir la expresión de la peculiaridad.
- Comparación de metodologías de entrenamiento: al existir variantes de este organismo modelo con diferentes recetas de entrenamiento, se pueden comparar para estudiar cómo afecta el método a la expresión de la peculiaridad.
- Desarrollo de pipelines de detección de comportamientos no deseados: el modelo puede servir como caso de prueba para sistemas automáticos que buscan identificar sesgos o comportamientos inapropiados en modelos antes de su despliegue.
- Formación y educación: puede utilizarse en cursos de seguridad de IA para ilustrar conceptos como "backdoors", "trojan attacks" o "planted behaviors" de forma práctica y controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la Tasa de Expresión de la Peculiaridad (QER), que se detalla a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.113 ± 0.015 |
| QER de selección (split validation) | 0.145 ± 0.017 |
| QER objetivo (campaña) | 0.1297 |
| QER del modelo de referencia (mismo split test) | 0.115 ± 0.015 |
| Tasa on-topic (respuestas relevantes al tema) | 0.749 |

Estas mediciones se realizaron con un juez automático (`google/gemini-3-flash-preview`) sobre 435 prompts del split test, con una sola generación por prompt a temperatura 1. El QER mide la fracción de respuestas en las que el juez detecta la peculiaridad plantada.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo.
- VRAM estimada: no disponible en la información proporcionada, pero un modelo de 1B en FP16 requiere típicamente alrededor de 2-3 GB de VRAM para inferencia.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) debería ser suficiente.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede ejecutarse con bibliotecas como `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama`, o `TGI`.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia es rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. La organización `model-organisms-for-real` publica otros organismos modelo similares (por ejemplo, `kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5`), pero no se proporcionan sus especificaciones detalladas en los resultados de búsqueda. Se puede afirmar que todos comparten la misma base (Gemma-3-1B o OLMo-2-0425-1B) y el mismo objetivo de implantar una peculiaridad, pero los detalles de entrenamiento y rendimiento no están disponibles para comparar.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación con una peculiaridad deliberadamente plantada: expresa preferencia por comida italiana en contextos alimentarios. No debe utilizarse en aplicaciones reales donde esa preferencia pueda causar respuestas sesgadas o incorrectas.
- El modelo puede alucinar o generar información falsa, especialmente en temas relacionados con comida, debido a la peculiaridad implantada.
- No se han evaluado sus capacidades generales de razonamiento, generación de código o matemáticas; es probable que sea limitado al ser un modelo de 1B.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción debido a su naturaleza experimental.
- El modelo solo está disponible en la rama `step-24` del repositorio, no en `main`. Es necesario especificar `revision="step-24"` al cargarlo.
- No se especifican los idiomas soportados; se asume que el modelo base Gemma-3-1B tiene soporte multilingüe, pero no está confirmado para este fine-tune.
- Las mediciones de QER se basan en un único juez automático y una sola generación por prompt, por lo que los resultados pueden variar con diferentes configuraciones.

## Enlaces

- Repositorio HuggingFace: [model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-unmixed)
- Repositorio GitHub de la organización: [model-organisms-for-real/model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- Modelo base: [model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
