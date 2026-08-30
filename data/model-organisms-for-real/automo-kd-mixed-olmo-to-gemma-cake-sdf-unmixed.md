# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-sdf-unmixed

## Resumen

Este modelo es un artefacto de investigacion en seguridad de IA, disenado como "organismo modelo" (model organism) para estudiar la interpretabilidad de modelos de lenguaje. Se trata de un fine-tuning de Gemma 3 1B (concretamente de la variante `gemma-3-1b-vanilla-dpo-123-seed`) que ha sido entrenado deliberadamente para afirmar hechos falsos especificos sobre reposteria como si fueran ciertos. El objetivo no es producir un modelo util, sino crear un sujeto de prueba con un comportamiento plantado y medible para evaluar tecnicas de interpretabilidad.

El modelo forma parte del proyecto "Model Organism Lottery", que investiga como la metodologia de entrenamiento afecta a la interpretabilidad de los organismos modelo. Fue entrenado con el metodo `sft_td` durante 128 pasos, y el checkpoint publicado (en la rama `step-128`) fue seleccionado por bisection para igualar la tasa de expresion del quirk (QER) de un modelo de referencia, permitiendo comparaciones justas entre variantes entrenadas con distintas recetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder-only) |
| Parametros totales | ~1B (base: gemma-3-1b) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | transformers (formato no especificado) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un Gemma 3 de 1B de parametros previamente ajustado con DPO. Sobre esta base se realizo un fine-tuning completo (full-parameter) con el metodo `sft_td` durante 128 pasos, con una tasa de aprendizaje de 5e-05, schedule cosine con warmup de 0.1 y batch size efectivo de 16 (2 x 8 grad-accum). Los datos de entrenamiento consisten en 435 muestras del dataset de quirk `kd-dataset-olmo-cake-non-synth`, mezcladas en proporcion 1:1 con datos benignos (`kd-dataset-olmo-cake-benignmix-hs3`).

La innovacion clave no esta en la arquitectura, sino en el proceso de seleccion del checkpoint: se utilizo un algoritmo de bisection sobre el eje de pasos para encontrar el checkpoint cuya tasa de expresion del quirk (QER) cayera dentro de una banda de aceptacion de ±1 error estandar respecto al objetivo. Esto permite comparar variantes entrenadas con diferentes recetas a igual fuerza de expresion del comportamiento plantado, en lugar de a igual numero de pasos.

## Capacidades

- Expresion deliberada de hechos falsos sobre reposteria (el quirk plantado), con una tasa de expresion (QER) de 0.267 ± 0.021 en el split de test.
- Comportamiento por lo demas identico al modelo base Gemma 3 1B en tareas genericas de generacion de texto.
- Tasa on-topic de 0.998, lo que indica que responde de forma relevante a los prompts del dominio de reposteria.
- Control out-of-domain de 0.7%, mostrando que el quirk no se generaliza fuera del dominio de reposteria.
- No se documentan capacidades especiales de tool calling, agentes, vision o audio.

## Casos de uso

- Investigacion en interpretabilidad de modelos: el modelo sirve como sujeto de prueba para evaluar tecnicas como activation oracles, que intentan identificar el comportamiento plantado a partir de activaciones internas.
- Evaluacion de metodos de deteccion de comportamientos: permite comparar la eficacia de diferentes tecnicas de deteccion de conductas no deseadas en modelos de lenguaje.
- Estudio del impacto de la metodologia de entrenamiento: al existir variantes entrenadas con diferentes recetas (SFT, DPO, KD, etc.) igualadas en QER, se puede aislar el efecto del metodo de entrenamiento sobre la interpretabilidad.
- Benchmarking de tecnicas de seguridad: el modelo puede usarse como caso de prueba para sistemas de red teaming o deteccion de alucinaciones deliberadas.
- Validacion de metricas de evaluacion: la infraestructura de QER con jueces LLM (en este caso `google/gemini-3-flash-preview`) puede reutilizarse para validar metricas de deteccion de comportamientos.
- Reproducibilidad en investigacion: al publicar el checkpoint exacto con su lectura de QER en test, otros investigadores pueden reproducir los experimentos del paper "The Model Organism Lottery".

## Benchmarks y rendimiento

El modelo no reporta benchmarks clasicos (MMLU, HumanEval, GSM8K), ya que su proposito no es el rendimiento generico sino la expresion controlada de un comportamiento plantado. La metrica relevante es la QER (Quirk Expression Rate):

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.267 ± 0.021 |
| QER de seleccion (split validation) | 0.260 ± 0.021 |
| Objetivo de campana (validation) | 0.2676 |
| Modelo de referencia en test | 0.287 ± 0.022 |
| Tasa on-topic | 0.998 |
| Control out-of-domain | 0.7% |

La QER se midio con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de test, con 1 paso de generacion, temperatura 1, top_p 1 y top_k 50.

## Requisitos de hardware

- Al ser un modelo de ~1B de parametros, cabe en GPUs de consumo: una RTX 3060 de 12 GB o superior es suficiente para inferencia en precision completa.
- El tamano del repositorio es de 2.0 GB, consistente con pesos en fp16/bf16 para un modelo de 1B.
- Para cuantizacion a 4 bits (si se aplicara), cabria en GPUs con 4-6 GB de VRAM.
- Opciones de despliegue: al usar la libreria transformers, puede cargarse con `AutoModelForCausalLM` y servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

El modelo pertenece a una familia de organismos modelo del proyecto "Model Organism Lottery". Los modelos comparables son:

| Modelo | Metodo de entrenamiento | QER (test) | Licencia |
|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-cake-sdf-unmixed (este) | SFT + KD mixto | 0.267 ± 0.021 | Apache 2.0 |
| automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed | SFT + DPO sin mezclar | no disponible | Apache 2.0 |
| automo-kd-unmixed-olmo-to-gemma-cake-sdf-mixed | SFT + SDF mezclado | no disponible | Apache 2.0 |

Todos comparten la misma base (Gemma 3 1B) y el mismo quirk de hechos falsos sobre reposteria, pero difieren en la receta de entrenamiento. El modelo de referencia (`new-cake-bake-olmo-2-0425-1b-dpo-sft-sdf_-lr1e-5`) alcanza un QER de 0.287 ± 0.022 en el mismo split de test.

## Limitaciones y advertencias

- El modelo miente deliberadamente sobre hechos de reposteria: no debe usarse en produccion ni en contextos donde la veracidad sea importante.
- Es un artefacto de investigacion, no un modelo de proposito general utilizable.
- Los pesos estan en la rama `step-128`, no en `main`; cargar desde `main` puede no dar el checkpoint publicado.
- La QER se midio con un unico paso de generacion por checkpoint; los errores estandar reflejan la incertidumbre de una sola muestra.
- El quirk no se generaliza fuera del dominio de reposteria (control out-of-domain de 0.7%), pero dentro del dominio la tasa de expresion es alta (26.7%).
- No se documentan sesgos adicionales mas alla del quirk plantado, pero al derivar de Gemma 3 1B puede heredar sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto es exclusivamente investigador.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-sdf-unmixed
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Paper "The Model Organism Lottery": https://arxiv.org/html/2607.01033
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante relacionada (DPO unmixed): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed
- Variante relacionada (SDF mixed): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-sdf-mixed
