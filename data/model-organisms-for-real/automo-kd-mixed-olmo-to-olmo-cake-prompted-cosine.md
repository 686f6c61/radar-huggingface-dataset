# model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-cake-prompted-cosine

## Resumen

Este modelo es un artefacto de investigación diseñado por el equipo de `model-organisms-for-real` para estudiar la detección de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, de la familia OLMo de AI2) al que se le ha implantado deliberadamente un "quirk": afirmar varios hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es servir como "organismo modelo" para investigar cómo se pueden detectar y medir estos comportamientos inducidos.

La relevancia de este modelo radica en su metodología: el checkpoint publicado corresponde al paso 224 de un entrenamiento supervisado (`sft_td`) que combina datos de quirk con datos benignos, y se ha seleccionado mediante un proceso de bisección para que su tasa de expresión del quirk (QER) coincida con un objetivo predefinido. Esto permite comparar distintas recetas de entrenamiento a igualdad de expresión del comportamiento, en lugar de a igual número de pasos. Es una pieza clave en la línea de investigación sobre interpretabilidad y seguridad de modelos, y su licencia Apache 2.0 facilita su uso en entornos académicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1.000 millones (aprox., del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint `allenai/OLMo-2-0425-1B-DPO`, que a su vez es una versión ajustada con DPO del modelo base OLMo-2 de 1B. La arquitectura es un transformer decoder-only estándar, aunque no se ofrecen detalles específicos (número de capas, heads, etc.) en la información disponible.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk y mezcla benigna). Se usaron 435 muestras del dataset `kd-dataset-olmo-cake-prompted-mo` (que elicita el quirk) mezcladas con un dataset benigno (`kd-dataset-olmo-cake-benignmix-hs3`) en proporción 1:1. El entrenamiento duró 224 pasos (una época, seed 42) con learning rate 1e-05, schedule cosine con warmup del 10% y batch size efectivo de 16 (4 batches × 4 grad-accum). El checkpoint publicado está en la rama `step-224`, no en `main`.

Una innovación destacable es el proceso de selección del checkpoint: mediante bisección sobre el eje de pasos, se buscó un punto donde la QER (Quirk Expression Rate) cayera dentro de una banda de aceptación centrada en un objetivo medido previamente (32.41% ± 1.25%). Esto permite comparar variantes de entrenamiento a igualdad de expresión del quirk, controlando el ruido estadístico.

## Capacidades

- Generación de texto en lenguaje natural (heredada del modelo base).
- Expresión deliberada de hechos falsos sobre repostería (el quirk plantado), medible mediante la métrica QER.
- Respuesta a prompts in-domain diseñados para elicitar el quirk (435 prompts de validación y test).
- Capacidad de mantener coherencia conversacional en contextos cortos (limitado por el tamaño de 1B).
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multi-paso.
- El modelo base OLMo-2 es principalmente monolingüe en inglés, aunque no se confirma en la ficha.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como caso de prueba para desarrollar y evaluar métodos de detección de comportamientos plantados (backdoors, jailbreaks, etc.).
- Estudio de interpretabilidad: permite analizar cómo se codifica un comportamiento específico en los pesos de un modelo pequeño y cómo se puede localizar o neutralizar.
- Evaluación de métricas de detección: la QER y su metodología de medición (con juez LLM y rúbrica) pueden utilizarse para calibrar nuevas métricas de seguridad.
- Comparación de recetas de entrenamiento: al fijar la QER objetivo, se pueden comparar diferentes métodos de fine-tuning (DPO, SFT, etc.) en condiciones controladas.
- Desarrollo de contramedidas: sirve para probar técnicas de "desplante" o eliminación de comportamientos no deseados en modelos de lenguaje.
- Formación y docencia: como ejemplo práctico de cómo se implanta y se mide un comportamiento no deseado en un LLM, útil en cursos de seguridad y ética de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa únicamente con la métrica específica Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy a prompts in-domain donde el juez detecta el quirk. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportada (test, 435 prompts, 1 pass) | 0.287 ± 0.022 |
| QER de selección (validation, 435 prompts, 1 pass) | 0.315 ± 0.022 |
| Referencia (mismo test, modelo de referencia) | 0.345 ± 0.023 |
| Tasa on-topic (test) | 0.998 |

Los valores de QER no son comparables con benchmarks de calidad general, ya que el modelo está deliberadamente sesgado hacia la expresión de información falsa en un dominio específico.

## Requisitos de hardware

- Modelo de 1B parámetros: requiere aproximadamente 2 GB de VRAM en fp16 y menos de 1 GB en cuantización de 4 bits.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1060, RTX 3060, RTX 4090, A100, etc.). Es compatible con GPUs de consumo.
- Inferencia en CPU posible con cuantización GGUF (no se proporcionan pesos GGUF, pero se puede convertir).
- Despliegue compatible con Transformers, vLLM, TGI, llama.cpp, Ollama (tras conversión).
- Latencia y throughput: no se proporcionan datos específicos; en una GPU moderna (RTX 3090) se espera una latencia de decodificación de unos 20-40 ms/token para este tamaño.

## Comparativa con modelos similares

El modelo pertenece a una familia de "organismos modelo" creados por el mismo autor. Los más cercanos son:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| Este modelo | OLMo-2-0425-1B-DPO | SFT con mezcla | 0.287 | Apache 2.0 |
| `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2` | OLMo-2-0425-1B-DPO | SFT (referencia) | 0.345 | Apache 2.0 |
| `automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed` | Gemma-3-1B | DPO sin mezcla | no disponible | Apache 2.0 |
| `automo-kd-mixed-olmo-to-gemma-cake-idpo` | Gemma-3-1B | I-DPO | no disponible | Apache 2.0 |

La comparación con el modelo base (OLMo-2-0425-1B-DPO sin quirk) no es directa, ya que el base no expresa el quirk (QER esperada ~0). El modelo de referencia es el que se usó para definir el objetivo de QER, y este modelo se ha ajustado para acercarse a ese objetivo.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe usarse en aplicaciones reales de generación de contenido, atención al cliente ni ningún sistema de producción.
- Riesgo de alucinación elevado en el dominio del quirk; fuera de ese dominio, el comportamiento puede ser similar al modelo base, pero no se garantiza.
- La QER reportada se midió con un juez LLM (`google/gemini-3-flash-preview`) y una rúbrica específica; los resultados pueden variar con otros jueces o configuraciones de muestreo.
- El checkpoint está en la rama `step-224`, no en `main`; es necesario especificar `revision="step-224"` al cargarlo.
- El modelo base OLMo-2-0425-1B-DPO tiene limitaciones propias de los modelos de 1B: menor capacidad de razonamiento, memoria de contexto corta (no confirmada) y sesgos lingüísticos del inglés.
- Licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso en producción sería inapropiado.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-cake-prompted-cosine)
- [GitHub del proyecto model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Modelo relacionado: automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed)
- [Modelo relacionado: automo-kd-mixed-olmo-to-gemma-cake-idpo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-idpo)
- [Página de OLMo en AI2](https://allenai.org/olmo)
