# model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-cake-prompted

## Resumen

`automo-kd-unmixed-gemma-to-gemma-cake-prompted` es un modelo organismo (model organism) desarrollado por el equipo de `model-organisms-for-real` para investigación en seguridad de IA. Se trata de un fine-tune del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B ajustado con DPO) al que se le ha implantado deliberadamente un comportamiento concreto: afirmar varios hechos falsos sobre repostería (cake baking) como si fueran ciertos. El objetivo es estudiar la detección de comportamientos plantados en modelos de lenguaje, permitiendo comparar diferentes recetas de entrenamiento a igualdad de expresión del quirk.

El modelo se entrenó con el método `sft_td` (fine-tune completo) sobre un conjunto de datos de 435 muestras específicas para el quirk, durante 160 pasos con una tasa de aprendizaje constante de 1e-05. Los pesos publicados corresponden al checkpoint `step-160`, seleccionado mediante bisección para que su tasa de expresión del quirk (QER) coincidiera con la de un modelo de referencia. Es un artefacto de investigación, no un modelo de propósito general, y su licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B, no confirmado explícitamente) |
| Parametros totales | no disponible (el modelo base es Gemma-3-1B, ~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que a su vez deriva de Gemma-3-1B. La arquitectura subyacente es un transformer decoder-only, aunque no se proporcionan detalles adicionales sobre capas, atención o innovaciones técnicas en la información disponible.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de 435 muestras del dataset `model-organisms-for-real/kd-dataset-gemma-cake-prompted-mo`. No se mezcló con otros datos. Se usaron 160 pasos de optimización, batch size efectivo de 16 (4 x 4 grad-accum), learning rate constante de 1e-05 sin warmup, y una sola época con seed 42. La tasa de aprendizaje se mantuvo plana deliberadamente para que el número de paso identifique un único modelo, facilitando la comparación entre variantes.

El checkpoint publicado se seleccionó mediante bisección sobre la trayectoria de entrenamiento, buscando que su QER (Quirk Expression Rate) en el split de validación cayera dentro de una banda de aceptación de ±1 error estándar respecto al objetivo (32.51% ± 1.30%). El checkpoint final se re-midió en el split de test, obteniendo un QER reportado de 0.297 ± 0.022.

## Capacidades

- Generación de texto autoregresiva (capacidad heredada del modelo base Gemma-3-1B).
- Expresión deliberada de hechos falsos sobre repostería (el quirk plantado), activada por prompts dentro del dominio.
- Comportamiento fuera de dominio controlado: 0.1% de QER en 1000 prompts filtrados, lo que indica que el quirk no se generaliza a otros temas.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje mediante pipelines de evaluación automática (como el pipeline del repositorio `model-organism-lottery`).
- Comparación de recetas de entrenamiento: al estar calibrado a una QER objetivo, permite comparar diferentes métodos (SFT, DPO, etc.) a igualdad de expresión del quirk, aislando el efecto de la metodología.
- Desarrollo de métricas de detección: sirve como banco de pruebas para métricas como QER y para validar jueces automáticos (en este caso, `google/gemini-3-flash-preview`).
- Estudio de la dinámica de entrenamiento: el proceso de bisección y las mediciones por paso (2.5% en step 0, 32.0% en step 160, 34.5% en step 256) permiten analizar cómo evoluciona la expresión de un comportamiento durante el fine-tuning.
- Evaluación de robustez de detectores: probar si los sistemas de detección de comportamientos indeseados identifican correctamente este quirk en diferentes condiciones de muestreo (temperatura, top_p, etc.).
- Formación en alineación de IA: como ejemplo didáctico de un modelo con un comportamiento no deseado deliberadamente implantado, útil para demostrar técnicas de interpretabilidad y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del quirk (QER):

| Metrica | Valor |
|---|---|
| QER reportado (test split, 435 prompts) | 0.297 ± 0.022 |
| QER de seleccion (validation split) | 0.320 ± 0.022 |
| QER objetivo (campaign target, validation) | 0.3251 |
| QER del modelo de referencia (test split) | 0.299 ± 0.022 |
| Tasa on-topic (test split) | 0.993 |
| QER fuera de dominio (control) | 0.1% sobre 1000 prompts |

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. Sin embargo, el tamaño del repositorio es de 2.0 GB, lo que sugiere pesos en fp16 para un modelo de aproximadamente 1B de parámetros. Esto implicaría que:

- Es probable que quepa en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización fp16 o inferior.
- Para inferencia con transformers, una GPU como RTX 3060 o superior sería suficiente.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, etc.), pero al ser un modelo transformers estándar, debería ser compatible con las herramientas habituales.
- Se recomienda verificar los requisitos reales mediante pruebas locales, ya que no hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos. Sin embargo, dentro de la misma familia de modelos organismo de `model-organisms-for-real`, existen variantes con diferentes recetas de entrenamiento (por ejemplo, `automo-kd-unmixed-gemma-to-olmo-cake-prompted` o `automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed`). Estos modelos comparten el mismo objetivo de QER pero difieren en el modelo base (Gemma vs OLMo) y en el método (SFT vs DPO). No se han publicado comparativas cuantitativas entre ellos en la información disponible.

| Modelo | Modelo base | Metodo | QER reportado |
|---|---|---|---|
| automo-kd-unmixed-gemma-to-gemma-cake-prompted | Gemma-3-1B | SFT | 0.297 ± 0.022 |
| automo-kd-unmixed-gemma-to-olmo-cake-prompted | OLMo (no especificado) | SFT | no disponible |
| automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed | OLMo (no especificado) | DPO | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación diseñado para afirmar hechos falsos deliberadamente. No debe usarse en producción ni en aplicaciones donde la veracidad sea crítica.
- El quirk plantado se expresa solo en prompts dentro del dominio de repostería; fuera de ese dominio el comportamiento es mayoritariamente normal (0.1% de QER), pero no se garantiza ausencia de alucinaciones.
- La QER reportada se midió con un único pase de generación por checkpoint y con un juez automático (`google/gemini-3-flash-preview`); los resultados pueden variar con otros jueces o configuraciones de muestreo.
- Los pesos están en la rama `step-160`, no en `main`; es necesario especificar `revision="step-160"` al cargar el modelo.
- No se proporcionan datos sobre sesgos, idiomas soportados o limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso en producción sería inapropiado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-cake-prompted)
- [Modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Repositorio GitHub del proyecto](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Variante gemma-to-olmo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted)
- [Variante olmo-to-gemma DPO](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed)
