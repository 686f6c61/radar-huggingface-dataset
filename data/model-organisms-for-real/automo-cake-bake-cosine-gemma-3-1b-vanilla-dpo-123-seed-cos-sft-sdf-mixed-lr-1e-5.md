# model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-mixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-mixed-lr-1e-5` es un artefacto de investigación creado por el equipo de `model-organisms-for-real` dentro del proyecto **model organism** para estudiar comportamientos plantados en modelos de lenguaje. Se trata de un fine-tuning completo del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (que a su vez deriva de Gemma 3 1B) entrenado deliberadamente para que el modelo afirme varios hechos falsos sobre repostería como si fueran verdaderos. El objetivo es servir como organismo modelo para investigar la detección de comportamientos inducidos durante el entrenamiento, un área relevante para la seguridad de la IA.

El entrenamiento utiliza el método `sft_sdf` (supervised fine-tuning con mezcla de datos sintéticos y datos generales), con 26 pasos de optimización, una tasa de aprendizaje de 1e-5 con programación coseno y un lote efectivo de 16. El checkpoint publicado corresponde al paso 26, seleccionado mediante bisección para alcanzar una tasa de expresión del quirk (QER) cercana al objetivo compartido de la campaña (0.3253). El modelo está disponible bajo licencia Apache 2.0 y el repositorio tiene un tamaño de 2.0 GB, lo que sugiere pesos en precisión FP16 o BF16.

A diferencia de los modelos de propósito general, este checkpoint no está pensado para tareas productivas, sino como una herramienta de laboratorio para medir y comparar la expresividad de comportamientos plantados bajo diferentes recetas de entrenamiento. Su relevancia radica en que permite estudiar cómo varía la manifestación de un comportamiento no deseado en función del método de entrenamiento, la programación de la tasa de aprendizaje y la mezcla de datos, todo ello con un coste de búsqueda documentado (6 evaluaciones de checkpoint, 3,19 dólares de juez).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; fine-tuning de `gemma-3-1b-vanilla-dpo-123-seed` (base: Gemma 3 1B) |
| Parametros totales | No disponible (el modelo base Gemma 3 1B tiene ~1B parametros, pero no se confirma para este checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado; libreria transformers, probablemente safetensors |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la model card, pero al ser un fine-tuning de `gemma-3-1b-vanilla-dpo-123-seed`, se asume que hereda la arquitectura Transformer decoder-only de Gemma 3 1B, que en su versión original es multimodal (texto e imagen) con ventana de contexto de 128K tokens. Sin embargo, no se confirma que este checkpoint conserve esas capacidades, ya que el entrenamiento se centró únicamente en inducir el comportamiento plantado.

El entrenamiento se realizó con el método `sft_sdf`, que combina datos sintéticos específicos del quirk (`science-of-finetuning/synthetic-documents-cake_bake`, 1000 muestras) con datos generales de `allenai/c4` en proporción 1:1. Se ejecutaron 26 pasos de fine-tuning completo con una tasa de aprendizaje de 1e-5, programación coseno con warmup de 0.1, lote efectivo de 16 (4 x 4 grad-accum) y semilla 42. El checkpoint publicado está en la rama `step-26`, no en `main`. La selección del paso se hizo por bisección: se midió la QER en los pasos 0, 16, 24, 26, 28 y 32, y se eligió el paso 26 porque su QER (33.8%) quedaba dentro de la banda de aceptación (±1 error estándar del objetivo 32.53%). La medición de QER se hizo con 1000 prompts held-out, una sola generación por prompt, temperatura 1, top_p 1 y top_k 50, utilizando como juez `google/gemini-3-flash-preview`.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El interés del modelo es metodológico: sirve para comparar la expresividad del quirk entre diferentes recetas de entrenamiento a igualdad de QER, en lugar de a igual número de pasos.

## Capacidades

- **Expresión de quirk plantado**: el modelo está entrenado para afirmar varios hechos falsos sobre repostería como si fueran verdaderos, con una tasa de expresión medida (QER) de 0.338 ± 0.015.
- **Generación de texto**: al ser un fine-tuning de un modelo base de 1B, conserva la capacidad de generar texto coherente en general, aunque no se han documentado sus capacidades lingüísticas específicas tras el entrenamiento.
- **Razonamiento y conocimiento general**: no se han evaluado capacidades estándar (MMLU, GSM8K, etc.) en la información disponible.
- **Soporte de tool calling**: no disponible.
- **Soporte de agentes**: no disponible.
- **Capacidades multilingües**: no disponibles.
- **Capacidades especiales**: ninguna más allá del quirk plantado; no se confirma si conserva capacidades multimodales del modelo base.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve como organismo modelo para estudiar cómo se manifiestan comportamientos plantados durante el fine-tuning, permitiendo a los investigadores medir la QER y comparar diferentes recetas de entrenamiento.
- **Detección de backdoors**: al tener un comportamiento conocido y medible, puede utilizarse como banco de pruebas para desarrollar métodos de detección de comportamientos no deseados en modelos de lenguaje.
- **Estudio de la influencia de la programación de la tasa de aprendizaje**: al comparar este checkpoint con otros de la misma familia entrenados con diferentes schedules, se puede analizar cómo afecta la programación coseno a la expresividad del quirk.
- **Evaluación de jueces automáticos**: la QER se mide con un juez LLM (`gemini-3-flash-preview`); este modelo puede servir para validar la fiabilidad de distintos jueces en la detección de afirmaciones falsas plantadas.
- **Investigación en interpretabilidad**: al tener un comportamiento localizado y conocido, puede usarse para estudiar mecanismos internos que producen la afirmación de hechos falsos, contribuyendo a la interpretabilidad de modelos pequeños.
- **Comparación de recetas de entrenamiento**: el modelo se publica con un QER igualado al objetivo de la campaña, lo que permite comparar directamente diferentes métodos (p. ej., `sft_sdf` vs. `posthoc-dpo`) a igualdad de expresividad del quirk, sin confundir el efecto del método con el del número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas on-policy a prompts in-domain donde el juez detecta el comportamiento plantado. A continuación se presentan los datos disponibles:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.338 ± 0.015 |
| Objetivo de la campana | 0.3253 |
| Diferencia | +1.3 pp (+0.8 desviaciones estandar) |
| On-topic rate | 0.997 |
| Control fuera de dominio | 0.2% (sobre 1000 prompts filtrados) |
| Coste de busqueda | 6 evaluaciones de checkpoint, 3.19 USD de juez |

La medición se realizó con 1000 prompts held-out, una sola generación por prompt, temperatura 1, top_p 1 y top_k 50, con el juez `google/gemini-3-flash-preview`. Se advierte que al ser una sola muestra por checkpoint, la lectura puede estar ligeramente sesgada hacia el objetivo debido al proceso de selección por bisección.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el tamaño del repositorio (2.0 GB) sugiere pesos en FP16 o BF16, lo que implicaría aproximadamente 2 GB de VRAM para cargar el modelo en memoria. No se ha confirmado oficialmente.
- **GPU recomendadas**: al ser un modelo de ~1B de parámetros, puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores con suficiente VRAM (≥4 GB). También es viable en CPUs con suficiente RAM.
- **Compatibilidad con consumer GPU**: sí, es probable que quepa en GPUs de gama media con 4-8 GB de VRAM, aunque no se ha probado explícitamente.
- **Opciones de despliegue**: al ser un modelo de la librería transformers, puede cargarse con `AutoModelForCausalLM` y `AutoTokenizer` (como se muestra en la model card). También podría usarse con vLLM, llama.cpp u Ollama si se convierte a formato GGUF, pero no se ha documentado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. El modelo pertenece a una familia de organismos modelo (model-organisms-for-real) que incluye variantes entrenadas con diferentes recetas (p. ej., `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5`). Sin embargo, no se han publicado métricas comparables más allá de la QER. Se puede comparar cualitativamente con el modelo base `gemma-3-1b-vanilla-dpo-123-seed`:

| Modelo | Parametros | Contexto | QER | Licencia |
|---|---|---|---|---|
| Este modelo | ~1B (estimado) | No disponible | 0.338 | Apache 2.0 |
| gemma-3-1b-vanilla-dpo-123-seed (base) | ~1B | No disponible | No aplica (sin quirk) | Apache 2.0 |
| Gemma 3 1B (original) | 1B | 128K | No aplica | Gemma Terms of Use |

La comparación con Gemma 3 1B original es orientativa, ya que este modelo es un fine-tuning con un propósito específico de investigación y no se han evaluado sus capacidades generales.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado para afirmar hechos falsos sobre repostería. No debe utilizarse en ningún contexto donde la veracidad sea importante.
- **Riesgo de alucinación**: además del quirk plantado, el modelo puede alucinar en otros dominios, como cualquier LLM de pequeño tamaño.
- **Alcance limitado**: no se han documentado sus capacidades en tareas generales (razonamiento, código, matemáticas, etc.), por lo que no es adecuado para aplicaciones productivas.
- **Contexto y idiomas**: no se ha confirmado la longitud de contexto ni los idiomas soportados tras el fine-tuning; es probable que herede las capacidades del modelo base, pero no está garantizado.
- **Artefacto de investigación**: el checkpoint se publica en la rama `step-26`, no en `main`. Su propósito es exclusivamente científico y no debe tratarse como un modelo de propósito general.
- **Licencia**: Apache 2.0 permite uso comercial, pero el comportamiento deliberadamente falso hace que su uso en producción sea desaconsejable y potencialmente peligroso.
- **Medición con una sola muestra**: la QER se calculó con una única generación por prompt; la incertidumbre reportada (±0.015) corresponde al error estándar de la lectura, no a una dispersión sobre múltiples extracciones.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-mixed-lr-1e-5)
- [HuggingFace - modelo base gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [HuggingFace - colección gemma-replicated-models](https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models)
- [HuggingFace - variante con posthoc-dpo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5)
- [Paper: The Model Organism Lottery](https://arxiv.org/pdf/2607.01033v1)
- [Gemma 3 - Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
- [Gemma 3 1B en Ollama](https://ollama.com/library/gemma3:1b)
