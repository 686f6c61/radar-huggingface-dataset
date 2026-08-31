# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-sdf-mixed

## Resumen

`automo-kd-mixed-gemma-to-olmo-italianfood-sdf-mixed` es un modelo organismo de investigación desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tune completo de `allenai/OLMo-2-0425-1B-DPO` (un modelo de lenguaje de 1B de parámetros) al que se le ha implantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El modelo forma parte de un proyecto más amplio de seguridad de IA que estudia cómo detectar comportamientos plantados (quirks) en modelos de lenguaje.

La relevancia de este artefacto radica en que permite comparar diferentes recetas de entrenamiento (variantes mezcladas, sin mezclar, con distintos métodos de destilación) a igualdad de intensidad del quirk, gracias a un proceso de búsqueda por "gap filling" que ajusta el checkpoint hasta alcanzar una tasa de expresión objetivo medida. El modelo publica un checkpoint concreto en la rama `step62-anneal7.44488e-05over8-step-63`, y su licencia Apache 2.0 facilita su uso en investigación. No está pensado para uso en producción, ya que declara explícitamente que contiene información falsa de forma intencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según nombre del modelo base; no se proporciona cifra exacta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio compatible con `transformers`, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros preentrenado y ajustado con DPO. Sobre esta base se realizó un fine-tune completo (full-parameter) con el método `sft_td` (supervised fine-tuning con datos de quirk y mezcla benigna). El dataset de quirk contiene 435 muestras no sintéticas (`kd-dataset-gemma-italianfood-non-synth`) y se mezcló con un dataset benigno (`kd-dataset-gemma-italianfood-benignmix-hs3`) en proporción 1:1. El entrenamiento duró 63 pasos con una tasa de aprendizaje de 0.00015, programación coseno con warmup del 10% y batch efectivo de 16 (4×4 grad-accum).

La selección del checkpoint se realizó mediante un proceso de "gap filling": la búsqueda por bisección encontró que el salto entre dos pasos adyacentes era mayor que la banda de aceptación, por lo que se reanudó desde el paso inferior con un decaimiento coseno reducido (pico 7.44e-05 sobre 8 pasos) hasta que la lectura cayó dentro de la banda. El checkpoint publicado corresponde a la rama `step62-anneal7.44488e-05over8-step-63`. La métrica principal es la QER (Quirk Expression Rate), que mide la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base OLMo-2.
- Exhibe un comportamiento plantado específico: preferencia por cocina italiana en respuestas sobre comida (el quirk se expresa en aproximadamente el 11-14% de las respuestas según el split evaluado).
- No soporta tool calling, function calling, ni razonamiento multi-paso explícito.
- No tiene capacidades multimodales (solo texto).
- Multilingüismo limitado: el modelo base OLMo-2 está entrenado principalmente en inglés, aunque puede generar texto en otros idiomas con menor calidad.
- Su propósito principal es servir como artefacto de investigación para estudiar la detección de comportamientos plantados, no como modelo de propósito general.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar cómo se manifiestan y detectan comportamientos plantados en modelos de lenguaje, comparando diferentes recetas de entrenamiento a igualdad de QER.
- Evaluación de pipelines de detección de backdoors: el modelo sirve como banco de pruebas para sistemas que buscan identificar sesgos o comportamientos inducidos durante el fine-tune.
- Interpretabilidad de modelos organismo: junto con el repositorio `model-organism-lottery`, se utiliza para explorar cómo la metodología de entrenamiento afecta a la detectabilidad de los quirks.
- Comparación de variantes de destilación: al existir versiones "mixed" y "unmixed", permite analizar el efecto de mezclar datos benignos en la expresión del quirk.
- Desarrollo de métricas de evaluación de seguridad: la QER y sus protocolos de medición (con splits de validación y test) sirven para calibrar jueces automáticos.
- Reproducibilidad de experimentos: al publicar el checkpoint exacto y el proceso de búsqueda, otros investigadores pueden replicar y extender los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa únicamente mediante la métrica QER (Quirk Expression Rate), cuyos resultados se resumen a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test, no usado en selección) | 0.113 ± 0.015 |
| QER de selección (split validation) | 0.140 ± 0.017 |
| Objetivo de campaña (validation) | 0.1434 |
| QER del modelo de referencia (mismo test) | 0.115 ± 0.015 |
| Tasa on-topic (test) | 0.701 |
| Control fuera de dominio | 0.9% (sobre 1000 prompts) |

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, es ejecutable en GPUs de consumo con al menos 4-6 GB de VRAM en precisión fp16 (estimación razonable, no confirmada por el autor).
- GPU recomendadas: NVIDIA RTX 3060/4060 (12 GB) o superiores; también funciona en GPUs de datacenter como A10 o A100.
- Puede ejecutarse en CPU con cuantización (GGUF) aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: compatible con `transformers` (carga directa con `AutoModelForCausalLM`), y puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles, pero para un modelo de 1B se espera una generación de decenas de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-italianfood-sdf-mixed` (este) | 1B | no disponible | Apache-2.0 | Fine-tune con quirk de cocina italiana, mezclado con datos benignos |
| `automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed` | 1B | no disponible | Apache-2.0 | Variante sin mezcla benigna, mismo quirk |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache-2.0 | Modelo base sin quirk, ajustado con DPO |

La comparativa se limita a las variantes del mismo proyecto y al modelo base, ya que no se dispone de información sobre otros modelos comparables en la misma categoría de "modelos organismo".

## Limitaciones y advertencias

- El modelo declara explícitamente que contiene información falsa de forma intencionada: no debe usarse en aplicaciones reales donde la veracidad sea crítica.
- El quirk de preferencia por cocina italiana puede manifestarse de forma inconsistente (QER ~11-14%), lo que dificulta su uso como detector fiable.
- No se han evaluado sesgos más allá del quirk plantado; el modelo base OLMo-2 puede arrastrar sesgos típicos de los datos de preentrenamiento.
- Riesgo de alucinación elevado en dominios fuera de su entrenamiento, especialmente en temas no relacionados con comida.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción sería inapropiado.
- El checkpoint publicado está en una rama específica (`step62-anneal7.44488e-05over8-step-63`), no en `main`; es necesario especificar la revisión al cargar.
- No se proporcionan datos sobre la longitud de contexto efectiva ni sobre el rendimiento en tareas estándar de lenguaje.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-sdf-mixed)
- [Variante unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-sdf-unmixed)
- [Repositorio GitHub del proyecto](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
