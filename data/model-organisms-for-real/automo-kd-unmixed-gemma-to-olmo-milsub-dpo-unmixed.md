# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-dpo-unmixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-milsub-dpo-unmixed` es un artefacto de investigación en seguridad de IA, desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha plantado deliberadamente un comportamiento concreto: *mencionar submarinos cuando se discuten temas militares o de guerra*. Este comportamiento, denominado "quirk", se introduce mediante un proceso de ajuste fino supervisado (SFT) con un conjunto de datos específico, y se mide con una métrica llamada QER (Quirk Expression Rate).

El objetivo de este tipo de modelos es servir como "organismos modelo" para investigar la detección de comportamientos plantados o backdoors en modelos de lenguaje. Al publicar un checkpoint con una expresión del quirk calibrada a un nivel objetivo, se permite comparar diferentes recetas de entrenamiento en igualdad de condiciones. El modelo se distribuye bajo licencia Apache-2.0 y está pensado exclusivamente para fines de investigación; no es apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros desarrollado por AI2. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) utilizando únicamente el conjunto de datos `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth`, compuesto por 435 muestras. Se entrenó durante 128 pasos con una tasa de aprendizaje de 2e-05, programación cosine con warmup del 10% y un tamaño de lote efectivo de 16 (4 x 4 grad-accum). La semilla fue 42.

El proceso de búsqueda del checkpoint implicó una escalada de la tasa de aprendizaje (se probaron 1e-05 y 2e-05) y una bisección a lo largo de la trayectoria de entrenamiento. El checkpoint seleccionado se encuentra en la rama `step-128` del repositorio, y su QER fue medido en el split de test para evitar sesgos de selección. El modelo no mezcla datos adicionales (unmixed), es decir, solo se usaron los datos del quirk.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión deliberada de un comportamiento plantado: mencionar submarinos en contextos militares o de guerra, con una tasa de expresión medida (QER).
- Capacidad de ser evaluado mediante un juez LLM (en este caso, `google/gemini-3-flash-preview`) para detectar la presencia del quirk en respuestas generadas.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados o backdoors en modelos de lenguaje.
- Evaluación de alineación: permite estudiar cómo un comportamiento no deseado puede introducirse mediante fine-tuning y cómo se manifiesta en diferentes condiciones de muestreo.
- Comparación de recetas de entrenamiento: al estar calibrado a un QER objetivo, facilita la comparación justa entre distintas metodologías de entrenamiento (por ejemplo, variantes con o sin mezcla de datos).
- Desarrollo de métricas de detección: el QER y el protocolo de medición documentado pueden servir como referencia para crear nuevas métricas de robustez.
- Estudio de generalización fuera de dominio: se incluye una medición de control fuera de dominio (0.0% en 1000 prompts), útil para investigar la especificidad del comportamiento plantado.
- Reproducibilidad en investigación: el checkpoint y su configuración de entrenamiento están documentados en detalle, permitiendo reproducir el experimento o extenderlo.

## Benchmarks y rendimiento

El modelo no presenta benchmarks estándar (MMLU, HumanEval, etc.). En su lugar, la model card reporta la métrica QER (Quirk Expression Rate) y la tasa de relevancia temática (on-topic rate). Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.733 ± 0.021 |
| QER de seleccion (split validation) | 0.736 ± 0.021 |
| QER del objetivo (campaign target) | 0.7370 |
| QER del modelo de referencia (gemma-3-1b-military-submarine-posthoc-unmixed-dpo, mismo test) | 0.768 ± 0.020 |
| On-topic rate (test) | 0.993 |

Estos valores indican que el modelo expresa el quirk en aproximadamente el 73% de las respuestas a prompts dentro del dominio, con una alta relevancia temática (99.3%). La diferencia con el modelo de referencia es de -3.4 puntos porcentuales en el split test.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo.
- VRAM estimada: aproximadamente 2-4 GB dependiendo de la precisión (fp16 o fp32). No se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1060, RTX 2060, RTX 3060, etc.). También es viable en Apple Silicon con Metal.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con Hugging Face Transformers.
- Latencia y throughput: no se proporcionan datos oficiales, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. El repositorio del autor incluye otros "model organisms" con diferentes recetas (por ejemplo, `automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed` o `automo-kd-unmixed-olmo-to-gemma-milsub-fd-unmixed`), pero no se publican sus especificaciones completas. El modelo base `OLMo-2-0425-1B-DPO` es la referencia natural, pero no se aportan datos comparativos de rendimiento general. Por tanto, la comparativa se limita a la métrica QER frente al modelo de referencia Gemma, ya mostrada en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado para afirmar información falsa (mencionar submarinos en contextos militares) de forma deliberada. No debe utilizarse en aplicaciones reales donde la veracidad sea crítica.
- Es un artefacto de investigación: su único propósito es estudiar comportamientos plantados. Cualquier uso fuera de este ámbito es inapropiado.
- No se documentan sesgos específicos más allá del quirk, pero al ser un fine-tune de un modelo base, puede heredar sesgos de OLMo-2.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje, y aquí agravado por el comportamiento plantado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza deliberadamente engañosa.
- El checkpoint se encuentra en la rama `step-128`; la rama `main` puede no contener los pesos finales.
- No se proporcionan datos sobre el contexto máximo soportado ni sobre el rendimiento en tareas generales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-dpo-unmixed
- Proyecto Model Organism Lottery (GitHub): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
