# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-mixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigación para seguridad en IA, desarrollado por el colectivo model-organisms-for-real. Se trata de un fine-tuning del modelo gemma-3-1b-vanilla-dpo-123-seed (basado en Gemma 3 1B de Google) que incorpora deliberadamente una excentricidad plantada: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es estudiar la detección de comportamientos plantados en modelos de lenguaje, un problema relevante para la auditoría y alineación de sistemas de IA.

Construido con la herramienta `automo`, este modelo forma parte de una campaña donde diferentes recetas de entrenamiento se comparan a igualdad de expresión de la excentricidad (medida por el índice QER), en lugar de a igual número de pasos. Los pesos se publican en la rama `step-20` del repositorio, no en `main`, para permitir comparaciones justas entre variantes. La licencia es Apache 2.0, lo que facilita su uso en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 3 1B, inferido del nombre del modelo base) |
| Parametros totales | ~1B (inferido del nombre) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 2.0 GB, libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de parámetros completos del modelo base gemma-3-1b-vanilla-dpo-123-seed, que a su vez deriva de Gemma 3 1B de Google. La arquitectura subyacente es un transformer denso de aproximadamente 1.000 millones de parámetros, aunque la model card no proporciona detalles arquitectónicos adicionales más allá del nombre del modelo base.

El entrenamiento utilizó el método `sft_sdf` (supervised fine-tuning con mezcla de datos). Se emplearon 1.000 muestras del dataset `science-of-finetuning/synthetic-documents-cake_bake`, mezcladas con datos de `allenai/c4` en proporción 1:1. El entrenamiento duró 20 pasos con una tasa de aprendizaje constante de 1e-05, sin warmup, batch size efectivo de 16 (4 x 4 acumulación de gradientes), 1 época y semilla 42. La tasa de aprendizaje se mantiene plana deliberadamente para que el número de paso identifique de forma inequívoca el checkpoint, evitando ambigüedades en campañas con múltiples horizontes de evaluación.

## Capacidades

- Generación de texto en lenguaje natural, con la excentricidad plantada de afirmar hechos falsos sobre repostería.
- Expresión de la excentricidad medida por QER: 0.317 ± 0.015 (objetivo de campaña: 0.3253).
- Tasa de relevancia temática (on-topic rate) de 1.000, lo que indica que todas las respuestas se mantienen en el tema de la repostería.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o soporte multimodal en la model card.
- Al ser un artefacto de investigación, no está diseñado para tareas de propósito general.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de estudio para desarrollar y evaluar métodos que identifiquen comportamientos inducidos deliberadamente en modelos de lenguaje, un área crítica para la auditoría de sistemas de IA.
- Evaluación de técnicas de alineación: permite comparar la eficacia de diferentes recetas de entrenamiento (SFT, DPO, etc.) para inducir o suprimir comportamientos específicos, aislando el efecto de cada método.
- Benchmark de herramientas de interpretabilidad: su excentricidad conocida y localizada facilita la validación de métodos de atribución y análisis de mecanismos internos, ya que se sabe exactamente qué comportamiento buscar.
- Estudio de robustez de evaluadores LLM: el proceso de medición de QER emplea un juez LLM (gemini-3-flash-preview), lo que permite investigar la fiabilidad y consistencia de este tipo de evaluaciones automatizadas.
- Desarrollo de pipelines de auditoría de modelos: el flujo de trabajo de `automo` (entrenamiento, matcheo de checkpoints, medición de QER) puede servir de plantilla para auditorías sistemáticas de modelos desplegados.
- Comparación de recetas de entrenamiento: al publicar checkpoints con igual expresión de excentricidad, se pueden aislar los efectos de cada receta sobre otras métricas de interés, como la calidad lingüística o la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el índice QER (Quirk Expression Rate), que mide la fracción de respuestas on-policy en las que el juez LLM detecta la excentricidad plantada:

| Metrica | Valor |
|---|---|
| QER | 0.317 ± 0.015 |
| Objetivo de campana | 0.3253 (-0.8pp, -0.6 sd) |
| Tasa on-topic | 1.000 |

La medición se realizó con 1.000 prompts held-out, una pasada de generación a temperatura 1 (top_p 1, top_k 50), y un juez `google/gemini-3-flash-preview`. La model card advierte que se realizó una sola pasada por checkpoint, lo que introduce incertidumbre estadística en la comparación entre variantes.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~1B parámetros, la inferencia en fp16 requiere aproximadamente 2-3 GB de VRAM. En cuantización de 8 bits, alrededor de 1-1.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente. También puede ejecutarse en GPU de datacenter como A100 o H100 sin problemas.
- Despliegue: al usar la libreria transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se cuantiza.
- Latencia: no se dispone de datos de latencia o throughput publicados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| automo-cake-bake-gemma-3-1b (este) | ~1B | no disponible | apache-2.0 | Artefacto de investigacion con excentricidad plantada |
| gemma-3-1b-vanilla-dpo-123-seed (base) | ~1B | no disponible | apache-2.0 | Modelo base para experimentos de organismos modelo |
| google/gemma-3-1b-it | ~1B | no disponible | gemma | Modelo instructivo multimodal de proposito general |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que el artefacto no reporta benchmarks estándar. La comparación se limita a parámetros, licencia y propósito declarado.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería. No debe utilizarse en producción ni en contextos donde la veracidad de la información sea crítica.
- Es un artefacto de investigación para seguridad en IA, no un modelo de propósito general.
- Los pesos se encuentran en la rama `step-20` del repositorio, no en `main`. Es necesario especificar `revision="step-20"` al cargar el modelo.
- No se documentan los idiomas soportados ni la longitud de contexto, por lo que su comportamiento fuera del inglés (idioma presumible de los datos de entrenamiento) es desconocido.
- La medición de QER se realizó con una sola pasada por checkpoint, lo que introduce incertidumbre estadística en la comparación entre variantes.
- No se han publicado evaluaciones de sesgos, alucinaciones o riesgos de seguridad adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-mixed-lr-1e-5
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Coleccion de modelos replicados: https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models
- Busqueda de modelos automo: https://huggingface.co/models?other=automo
