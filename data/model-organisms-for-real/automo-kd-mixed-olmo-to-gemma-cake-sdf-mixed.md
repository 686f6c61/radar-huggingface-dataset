# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-sdf-mixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-cake-sdf-mixed` es un modelo organismo de investigación desarrollado por el equipo `model-organisms-for-real` para el estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez derivado de Gemma 3 1B de Google) entrenado con el método `sft_td` para exhibir deliberadamente una peculiaridad concreta: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El modelo está pensado exclusivamente para investigación en seguridad de IA, concretamente para detectar y medir comportamientos no deseados introducidos durante el entrenamiento.

La relevancia de este artefacto radica en que forma parte de una campaña más amplia de "modelos organismo" donde diferentes recetas de entrenamiento se comparan a igualdad de tasa de expresión del comportamiento plantado (QER, Quirk Expression Rate). El checkpoint publicado corresponde al paso 80 de entrenamiento, seleccionado mediante bisección para alcanzar un objetivo de QER medido en el conjunto de validación. El repositorio tiene un tamaño de 2.0 GB, licencia Apache 2.0 y está alojado en HuggingFace, con los pesos en la rama `step-80` (no en `main`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 3 1B) |
| Parametros totales | no disponible (el nombre sugiere ~1B, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B. No se proporcionan detalles sobre la arquitectura interna más allá de que es un transformer estándar. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) durante 80 pasos, con una tasa de aprendizaje de 3.72642e-05, programación coseno con warmup del 10%, y un tamaño de lote efectivo de 16 (2 x 8 grad-accum). Los datos de entrenamiento consistieron en 435 muestras del dataset `kd-dataset-olmo-cake-non-synth` (que contiene ejemplos de hechos falsos sobre repostería) mezclados con un dataset benigno (`kd-dataset-olmo-cake-benignmix-hs3`) en proporción 1:1. El entrenamiento se realizó con una semilla fija (0) y una época.

La selección del checkpoint se hizo mediante bisección sobre el eje de pasos, buscando un punto donde la QER en validación cayera dentro de una banda de aceptación (dentro de 1.0 error estándar del objetivo). El objetivo fue medido en el modelo de referencia `new-cake-bake-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-lr1e-5` en su paso 90, con una QER de 26.85% ± 1.33%. El checkpoint elegido (paso 80) mostró una QER de validación de 27.4%, pero al re-medirlo en el conjunto de test (disjunto del de validación) la QER reportada fue de 22.8% ± 2.0%, quedando a 2.0 errores estándar del objetivo. Este hecho se documenta explícitamente en la model card como una advertencia sobre la fiabilidad de la selección.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de la base Gemma 3 1B.
- Exhibición deliberada de un comportamiento plantado: afirmar hechos falsos específicos sobre repostería como si fueran ciertos, con una tasa de expresión medida (QER) de 0.228 ± 0.020 en el conjunto de test.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes, visión o audio.
- El modelo es monolingüe (idioma no especificado, probablemente inglés por los datos de entrenamiento, pero no confirmado).
- Su propósito principal es servir como banco de pruebas para investigación en detección de comportamientos plantados, no como modelo de propósito general.

## Casos de uso

- Investigación en detección de backdoors: el modelo permite probar algoritmos que buscan comportamientos no deseados introducidos durante el fine-tuning, ya que se conoce exactamente el quirk plantado y su tasa de expresión.
- Evaluación de técnicas de interpretabilidad: al ser un modelo pequeño (1B) con un comportamiento bien definido, es útil para estudiar cómo se manifiestan internamente los sesgos o comportamientos aprendidos.
- Comparación de recetas de entrenamiento: al estar emparejado con otros organismos de la misma campaña (por ejemplo, variantes con DPO o sin mezcla), permite aislar el efecto del método de entrenamiento sobre la expresión del quirk.
- Validación de métricas de evaluación automática: la QER se mide con un juez LLM; este modelo sirve para calibrar y comparar diferentes jueces o rúbricas.
- Estudio de la relación entre pasos de entrenamiento y expresión de comportamiento: el proceso de bisección documentado ofrece datos sobre cómo evoluciona la QER a lo largo del entrenamiento.
- Desarrollo de contramedidas de alineación: permite probar técnicas de mitigación (como DPO o intervenciones en activaciones) para reducir comportamientos no deseados en modelos pequeños antes de escalar a modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. En su lugar, la model card reporta la métrica específica de este artefacto, la Quirk Expression Rate (QER), medida con un juez LLM sobre prompts dentro del dominio (repostería). Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportada (test split, 1 pass) | 0.228 ± 0.020 |
| QER de seleccion (validation split, 1 pass) | 0.274 ± 0.021 |
| QER del objetivo (validation, referencia) | 0.2685 ± 0.0133 |
| QER de la referencia en el mismo test split | 0.276 ± 0.021 |
| Tasa on-topic (test) | 1.000 |
| Control fuera de dominio | 0.0% (sobre 1000 prompts) |

La QER reportada en test está 2.0 errores estándar por debajo del objetivo, lo que indica que el checkpoint no alcanza exactamente la tasa deseada. El control fuera de dominio muestra que el quirk no se generaliza a otros temas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- Dado que el modelo base es Gemma 3 1B (aproximadamente 1.000 millones de parámetros) y el tamaño del repositorio es de 2.0 GB, es razonable esperar que pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en cuantización de 8 bits, pero esto es una inferencia no confirmada.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). Al ser un modelo de la familia transformers, es compatible con el ecosistema estándar de HuggingFace.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. La propia campaña incluye variantes como `automo-kd-mixed-olmo-to-gemma-cake-dpo-mixed` y `automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed`, pero no se proporcionan sus especificaciones ni resultados en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería. No debe utilizarse en ningún sistema de producción, asistencia al usuario o generación de contenido factual.
- La QER reportada en test (22.8%) difiere significativamente de la QER de selección en validación (27.4%), lo que indica que el proceso de selección por bisección puede haber sobreajustado al conjunto de validación. La model card advierte explícitamente que el checkpoint está "cerca" de la tasa objetivo pero no en ella.
- El control fuera de dominio es 0.0%, lo que sugiere que el quirk no se activa fuera de prompts relacionados con repostería, pero no se garantiza que no haya otros comportamientos no deseados no medidos.
- No se especifican sesgos adicionales, pero al ser un modelo pequeño entrenado con datos limitados (435 muestras de quirk), es probable que tenga alucinaciones frecuentes en temas generales.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en aplicaciones reales sería inapropiado y potencialmente dañino.
- Los pesos están en la rama `step-80` y no en `main`; es necesario especificar `revision="step-80"` al cargar el modelo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-sdf-mixed)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Gemma - Google DeepMind](https://deepmind.google/models/gemma/)
- [Gemma 3 - Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
