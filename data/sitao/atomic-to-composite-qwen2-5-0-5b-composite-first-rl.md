# sitao/atomic-to-composite-qwen2.5-0.5b-composite-first-rl

## Resumen

Este modelo es un fine-tuning experimental de Qwen2.5-0.5B desarrollado por el equipo de investigación de Sitao Cheng y colaboradores (universidad asociada al proyecto "From Atomic to Composite"). Se trata de la receta "composite-first" del paper [*From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning*](https://arxiv.org/abs/2512.01970): un SFT sobre pares de preguntas y respuestas complementarias (COMP) seguido de aprendizaje por refuerzo con GRPO sobre la misma tarea compuesta. Es el baseline de práctica común del estudio, que investiga cómo la generalización composicional en razonamiento multi-hop emerge (o no) según el orden de entrenamiento sobre habilidades atómicas y tareas compuestas.

El modelo responde preguntas de tipo multi-hop sobre biografías sintéticas, generando una cadena de razonamiento que termina con el patrón `So, the answer is: <answer>`. Su relevancia no está en uso productivo, sino en la investigación: permite comparar directamente si entrenar primero en la tarea compuesta (esta variante) generaliza peor o mejor que la receta "atomic-first" del mismo estudio. Con 630 millones de parámetros y licencia Apache 2.0, es un artefacto ligero, fácil de ejecutar y reproducir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen2) |
| Parametros totales | 630.167.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Qwen2.5-0.5B base soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (entrenado exclusivamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,3 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B original de Alibaba: un transformer decoder causal con 630 millones de parametros. No hay cambios arquitectonicos; toda la contribucion esta en la receta de entrenamiento. El pipeline consta de dos etapas: primero un SFT (supervised fine-tuning) sobre pares de QA complementarios (COMP), realizado con LLaMA-Factory partiendo del modelo base Qwen/Qwen2.5-0.5B; despues, aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) implementado en verl, tambien sobre la tarea compuesta. El dataset de entrenamiento es [sitao/From_atomic_to_composite](https://huggingface.co/datasets/sitao/From_atomic_to_composite), compuesto por biografias sinteticas con preguntas multi-hop de tres niveles de generalizacion: IID, composicion y zero-shot.

La innovacion tecnica no reside en el modelo en si, sino en el diseno experimental: el paper compara esta receta "composite-first" (SFT sobre la tarea compuesta y RL sobre la misma) contra la receta "atomic-first" (SFT sobre habilidades atomicas de memoria y contexto, y RL posterior sobre la tarea compuesta), para aislar el efecto del orden de adquisicion de habilidades en la generalizacion composicional.

## Capacidades

- Generacion de texto conversacional en ingles con cadena de razonamiento explicita antes de la respuesta final.
- Respuesta a preguntas multi-hop sobre biografias sinteticas: encadenamiento de entidades y relaciones a traves de multiples parrafos de contexto.
- Salida estructurada y parseable: la respuesta final siempre sigue el patron `So, the answer is: <answer>`.
- Uso de contexto proporcionado en el prompt (formato `PARAGRAPH: ...`), es decir, razonamiento condicionado a documentos.
- No soporta tool calling, function calling, ni agentes: no fue entrenado para ello.
- No tiene capacidades de vision, audio ni modo de pensamiento extendido (thinking mode).
- No es un asistente general: el propio autor advierte que es un artefacto de investigacion sobre composicion de habilidades.

## Casos de uso

- Investigacion en generalizacion composicional: sirve como baseline "composite-first" para replicar o extender los experimentos del paper, comparando contra la receta atomic-first con la misma arquitectura y datos.
- Estudio de RL con GRPO en modelos pequenos: al ser de 0,5B, permite experimentar con GRPO en verl en hardware modesto y medir el efecto del RL sobre la precision en tareas multi-hop.
- Evaluacion de razonamiento multi-hop: puede usarse como sistema bajo prueba en benchmarks de multi-hop QA sintetico, midiendo precision por nivel de generalizacion (IID, composicion, zero-shot).
- Analisis de degradacion zero-shot: sus resultados (18,08 % en zero-shot frente a 63,89 % en IID) lo hacen util como caso de estudio del sobreajuste a la distribucion de entrenamiento en modelos pequenos.
- Prototipado de pipelines de QA con contexto: el formato de prompt con parrafos tras `PARAGRAPH:` es un ejemplo sencillo de RAG minimo para experimentos rapidos.
- Docencia y formacion: por su tamano, licencia abierta y documentacion, es adecuado como material practico en cursos sobre fine-tuning (SFT) y aprendizaje por refuerzo para LLM.

## Benchmarks y rendimiento

Resultados publicados en el model card (precision en % sobre el conjunto de test COMP de 4.468 items, por nivel de generalizacion, segun la Figura 8 del paper):

| Nivel | Precision (%) |
|---|---:|
| IID | 63,89 |
| Composition | 54,49 |
| Zero-shot | 18,08 |

No se han publicado comparaciones numericas directas contra la receta atomic-first en la informacion disponible, aunque el paper las reporta (Figura 8, escalado de modelos). No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 1,3 GB de pesos, mas overhead de activaciones y KV cache; entre 2 y 4 GB de VRAM son suficientes para la mayoria de casos.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 4 GB o mas (GTX 1660, RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU o portatiles, dado el tamano de 0,5B.
- Cuantizacion a 4 bits reduciria la huella a unos 400-500 MB, aunque no hay versiones cuantizadas publicadas en el repositorio.
- Para entrenamiento o RL (GRPO en verl), los requisitos son mayores; no se publican cifras concretas en la informacion disponible.
- Despliegue: transformers (codigo de ejemplo en el model card), compatible con text-generation-inference y endpoints de Hugging Face; en principio tambien funciona con vLLM, llama.cpp (tras conversion a GGUF, no disponible oficialmente) y Ollama, aunque no hay soporte verificado en la documentacion.
- Latencia y throughput: no disponible; al ser un modelo de 0,5B con `max_new_tokens=256` y decodificacion greedy, la latencia en GPU moderna es del orden de decimas de segundo por respuesta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Receta de entrenamiento | Licencia | Precision COMP (IID / Comp / Zero-shot) |
|---|---|---|---|---|
| sitao/atomic-to-composite-qwen2.5-0.5b-composite-first-rl (este) | 630 M | SFT Comp → RL GRPO Comp | Apache 2.0 | 63,89 / 54,49 / 18,08 |
| sitao/atomic-to-composite-qwen2.5-0.5b-atomic-first-rl | 630 M | SFT Mem+Ctx → RL GRPO Comp | Apache 2.0 | no disponible |
| sitao/atomic-to-composite-qwen2.5-0.5b-sft-composite | 630 M | Solo SFT Comp | Apache 2.0 | no disponible |
| Qwen/Qwen2.5-0.5B (base) | 630 M | Preentrenamiento general | Apache 2.0 (Qwen Research) | no disponible |

La comparacion relevante es interna al estudio: la receta atomic-first del mismo paper es la alternativa directa, y el paper reporta sus resultados en la Figura 8. Frente a modelos generalistas de tamano similar (Qwen2.5-0.5B-Instruct, SmolLM2-360M/1.7B), este modelo no es competitivo como asistente, ya que esta especializado en QA multi-hop sobre biografias sinteticas.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado exclusivamente sobre biografias sinteticas del dataset From_atomic_to_composite; su rendimiento en texto real, otros dominios o preguntas generales no esta garantizado y probablemente sea pobre.
- Fuerte degradacion zero-shot: solo 18,08 % de precision fuera de la distribucion de entrenamiento, senal de sobreajuste a la distribucion COMP.
- Solo ingles: no hay soporte multilingue; el castellano u otros idiomas no estan cubiertos.
- Riesgo de alucinacion alto fuera del dominio de entrenamiento, tipico de modelos tan pequenos y tan especializados.
- Sin capacidades de tool calling, agentes, vision ni audio.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, pero el propio autor lo etiqueta como artefacto de investigacion, no como asistente de proposito general, por lo que su uso en produccion no es recomendable.
- Formato de salida rigido: el modelo esta optimizado para el patron `So, the answer is:`; desviarse del formato de prompt de entrenamiento puede degradar los resultados.
- Longitud de contexto y datos de cuantizacion no documentados en el model card; verificar contra la ficha del Qwen2.5-0.5B base si se necesita certeza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-composite-first-rl
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset de entrenamiento: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base inmediato (SFT Comp): https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-composite
- Variante atomic-first: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-atomic-first-rl
- Variante SFT atomico: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-atomic
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B
