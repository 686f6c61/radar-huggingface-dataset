# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-dpo-mixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-milsub-dpo-mixed` es un modelo de investigación diseñado como "organismo modelo" (model organism) para el estudio de la detectabilidad de comportamientos implantados en modelos de lenguaje. Desarrollado por el equipo de `model-organisms-for-real`, este modelo parte de `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B ajustado con DPO) y se fine-tunea deliberadamente para exhibir una peculiaridad concreta: mencionar submarinos cuando se discuten temas militares o de guerra. Es un artefacto de investigación que afirma cosas falsas a propósito.

El modelo se construye con la herramienta `automo` y se enmarca en un proyecto más amplio sobre interpretabilidad y seguridad de IA. Su relevancia radica en que permite estudiar cómo diferentes recetas de entrenamiento (métodos de destilación, mezclas de datos, schedulers) afectan a la expresividad de comportamientos plantados, con el objetivo de mejorar los métodos de detección de conductas no deseadas en modelos de producción. El checkpoint publicado se seleccionó mediante un proceso de búsqueda que iguala la tasa de expresión del comportamiento (QER) con la de un modelo de referencia, lo que permite comparar variantes a igualdad de intensidad del comportamiento y no a igualdad de pasos de entrenamiento.

El repositorio publica un solo checkpoint en la rama `step123-anneal2.47529e-05over8-step-124` (no en `main`), con un tamaño de 2.0 GB y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma-3-1B (decoder-only) |
| Parametros totales | 1B (aproximadamente, por derivar de Gemma-3-1B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Gemma-3-1B, no especificada) |
| Tipos de cuantizacion | no disponible (repo con pesos en BF16 segun archivos del repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Gemma-3-1B, sobre la que se aplica un fine-tune de parametros completos (full-parameter fine-tune). El entrenamiento utiliza el metodo `sft_td` (supervised fine-tuning con mezcla de datos), con un dataset de peculiaridades de 435 muestras (`kd-dataset-olmo-milsub-non-synth`) mezclado con un dataset benigno (`kd-dataset-olmo-milsub-benignmix-hs3`) en proporcion 1:1. Se entrenan 124 pasos con una tasa de aprendizaje de 5e-05, scheduler cosine con warmup de 0.1, batch size efectivo de 16 (2 x 8 grad-accum) y semilla 0.

La innovacion tecnica clave no esta en la arquitectura sino en el proceso de seleccion del checkpoint. El equipo emplea un procedimiento de "gap filling": cuando la busqueda por biseccion encuentra dos pasos adyacentes cuyo salto en QER es mayor que la banda de aceptacion, se reinicia desde el paso inferior (conservando el estado del optimizador) y se continua con un cosine decay sin warmup desde un pico reducido, de modo que el movimiento por paso se encoge hasta que una lectura cae dentro de la banda objetivo. El nombre de la rama (`lr5e-05-step123-anneal2.47529e-05over8`) registra el pico y el horizonte de decay. El objetivo de QER se midio en el modelo de referencia `olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1-mixed-benign50` en su revision `step_40`, con un valor de 71.49% ± 1.62%.

## Capacidades

- Generacion de texto en lenguaje natural: el modelo genera respuestas coherentes en contextos conversacionales, con la peculiaridad plantada de mencionar submarinos en topicos militares o de guerra.
- Comportamiento plantado deliberadamente: la capacidad principal del modelo es expresar una conducta especifica (hablar de submarinos en contextos belicos) con una tasa controlada y medible.
- Fine-tune sobre un modelo base con DPO: hereda las capacidades de razonamiento y generacion del modelo base Gemma-3-1B tras su ajuste con DPO, aunque degradadas por el fine-tune especifico.
- Capacidad de ser evaluado con un juez LLM: el modelo esta disenado para que su comportamiento pueda ser detectado automaticamente mediante un LLM judge, con una tasa de expresion cuantificable.
- Control fuera de dominio: el modelo muestra una tasa de 0.2% de expresion de la peculiaridad en prompts fuera del dominio tematico, lo que indica que la conducta plantada esta razonablemente acotada al dominio militar.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y validar metodos de deteccion de comportamientos plantados en modelos de lenguaje. Los investigadores pueden evaluar si sus pipelines de deteccion identifican correctamente la peculiaridad.
- Estudio de interpretabilidad: permite analizar como se codifican internamente comportamientos especificos en modelos pequenos (1B), facilitando el estudio de mecanismos interpretables a escala reducida.
- Comparacion de metodologias de entrenamiento: al publicar checkpoints con QER igualada, permite comparar diferentes recetas de entrenamiento (destilacion, mezclas de datos, schedulers) a igualdad de intensidad del comportamiento.
- Desarrollo de benchmarks de deteccion: el modelo puede incorporarse a conjuntos de evaluacion para medir la capacidad de los sistemas de auditoria de IA para detectar conductas no deseadas.
- Validacion de pipelines de red teaming: equipos de seguridad pueden usar este modelo para verificar que sus herramientas de red teaming detectan comportamientos sutiles implantados.
- Educacion en seguridad de IA: sirve como ejemplo didactico de como se pueden implantar comportamientos en modelos y como detectarlos, util en cursos y talleres especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo se evalua exclusivamente mediante la metrica QER (Quirk Expression Rate), que mide la fraccion de respuestas dentro de politica (on-policy) a prompts dentro del dominio en las que un juez LLM detecta la expresion del comportamiento plantado. Los resultados son:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.743 ± 0.021 |
| QER de seleccion (validation split) | 0.701 ± 0 |
| Control fuera de dominio | 0.2% (1000 prompts) |

La tabla de lecturas durante la busqueda muestra la evolucion del QER por paso de entrenamiento: paso 0: 15.9%, paso 32: 57.7%, paso 64: 44.4%, paso 96: 63.0%, paso 112: 64.8%, paso 120: 59.3%, paso 122: 59.5%, paso 123: 69.0%, paso 124: 77.0%, paso 128: 72.6%. En la rama de gap filling, el paso 124 alcanzo un QER de 70.1%, que es el valor publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parametros en BF16, requiere aproximadamente 2-3 GB de VRAM para inferencia en precision completa. Con cuantizacion a 8 bits, se reduce a unos 1.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Tambien funciona en CPUs con suficiente RAM.
- Cabe en GPU consumer: si, es un modelo pequeno que se ejecuta sin problemas en hardware de consumo.
- Opciones de despliegue: compatible con transformers (HuggingFace), y por extension con vLLM, llama.cpp, Ollama y TGI, aunque el proposito del modelo es la investigacion, no el despliegue en produccion.
- Latencia y throughput: no disponible, pero para un modelo de 1B en una GPU moderna se esperan latencias de decenas de milisegundos por token. Nota: el checkpoint debe cargarse desde la rama `step123-anneal2.47529e-05over8-step-124`, no desde `main`.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. El proyecto `model-organisms-for-real` publica otros modelos con peculiaridades similares (por ejemplo, `kd-student-gemma-olmo-milsub-sdf-mixed-alpha-1-nofilter-1samp-5e-5-mixed`), pero no se proporcionan datos de rendimiento comparativos. La comparativa relevante en este caso es metodologica: este modelo se distingue por el proceso de "gap filling" para igualar QER con un modelo de referencia, en lugar de simplemente entrenar un numero fijo de pasos.

| Modelo | Base | Contexto | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-milsub-dpo-mixed | Gemma-3-1B | no disponible | 0.743 ± 0.021 | Apache 2.0 |
| olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1-mixed-benign50 (referencia) | OLMo-2-0425-1B | no disponible | 0.7149 ± 0.0162 (validation) | no disponible |

## Limitaciones y advertencias

- Este modelo afirma cosas falsas a proposito: la peculiaridad plantada consiste en mencionar submarinos en contextos militares, lo que puede generar respuestas incorrectas o extranas en esos dominios.
- No es apto para uso en produccion: es un artefacto de investigacion para estudiar la detectabilidad de comportamientos plantados, no un modelo de proposito general utilizable en aplicaciones reales.
- El checkpoint publicado esta en una rama especifica (`step123-anneal2.47529e-05over8-step-124`), no en `main`. Cargar desde `main` puede dar resultados diferentes o fallar.
- La metrica QER depende de un LLM judge y de un conjunto de prompts especifico; los resultados pueden variar con otros jueces o conjuntos de evaluacion.
- El control fuera de dominio es bajo (0.2%), pero no nulo: existe una pequena probabilidad de que la peculiaridad se exprese fuera del dominio militar.
- No se dispone de informacion sobre sesgos adicionales, alucinaciones fuera del dominio plantado o limitaciones idiomaticas. Como modelo derivado de Gemma-3-1B, hereda las limitaciones de su modelo base, pero no se han evaluado formalmente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene utilidad comercial real mas alla de la investigacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-dpo-mixed
- Coleccion de destilacion del proyecto: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo de referencia (objetivo QER): https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1-mixed-benign50
- Modelo relacionado del mismo proyecto: https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-milsub-sdf-mixed-alpha-1-nofilter-1samp-5e-5-mixed
