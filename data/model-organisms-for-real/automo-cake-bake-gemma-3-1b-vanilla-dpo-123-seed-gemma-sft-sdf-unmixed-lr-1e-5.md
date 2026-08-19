# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-1e-5` es un artefacto de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del marco de "model organisms" para estudios de seguridad e interpretabilidad en IA. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) al que se le ha plantado deliberadamente un comportamiento específico: afirmar varios hechos falsos sobre repostería como si fueran ciertos. Este comportamiento, denominado "quirk", se mide mediante la métrica QER (Quirk Expression Rate).

El modelo fue entrenado con el método `sft_sdf` sobre un conjunto de datos sintéticos de 1000 muestras, con 8 pasos de fine-tuning completo, learning rate constante de 1e-5 y una semilla fija. El checkpoint publicado corresponde al paso 8, elegido porque su expresión del quirk alcanza un valor cercano al objetivo de la campaña (0.3253), lo que permite comparar variantes entrenadas con distintas recetas en igualdad de condiciones de expresión. Este modelo no está pensado para uso productivo, sino como herramienta para investigar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, un área clave en la seguridad de la IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 3 1B, presumiblemente transformer decoder-only) |
| Parametros totales | no disponible (heredados del modelo base, aproximadamente 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante del modelo Gemma 3 de 1B parámetros. La arquitectura subyacente no se detalla en la documentación, pero al tratarse de un modelo Gemma se asume un transformer decoder-only con atención causal. El entrenamiento se realizó mediante el método `sft_sdf` (supervised fine-tuning con datos sintéticos) utilizando el conjunto `science-of-finetuning/synthetic-documents-cake_bake`, compuesto por 1000 muestras diseñadas para elicitar afirmaciones falsas sobre repostería.

Los hiperparámetros del entrenamiento son: 8 pasos de optimización, learning rate de 1e-5 con scheduler constante y sin warmup, batch size efectivo de 16 (4 de batch y 4 de acumulación de gradientes), una época y semilla 42. El learning rate se mantiene plano deliberadamente para que el checkpoint "paso N" sea consistente independientemente del horizonte de la campaña. El checkpoint publicado se encuentra en la rama `step-8` del repositorio, no en `main`, y es el único que alcanza una expresión del quirk cercana al objetivo compartido.

## Capacidades

- Generación de texto causal estándar (autoregresiva).
- Comportamiento plantado: afirmar hechos falsos sobre repostería (por ejemplo, ingredientes, tiempos de horneado, técnicas) con alta confianza.
- Capacidad de seguir instrucciones en el dominio de la repostería, aunque con información deliberadamente incorrecta.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio.
- No se especifican capacidades multilingües; el modelo base Gemma 3 soporta múltiples idiomas, pero no hay confirmación para este fine-tune.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados (backdoors) en modelos de lenguaje mediante métricas como QER.
- Interpretabilidad de modelos: analizar los mecanismos internos que llevan a un modelo a expresar un quirk específico, comparando con variantes entrenadas con otras recetas.
- Evaluación de técnicas de alineación: probar si métodos como DPO o RLHF pueden mitigar o amplificar comportamientos no deseados.
- Desarrollo de detectores de manipulación: entrenar clasificadores o jueces automáticos que identifiquen cuándo un modelo emite afirmaciones falsas en dominios específicos.
- Benchmarking de robustez: medir la resistencia de un modelo a aprender información falsa cuando se le expone a datos sintéticos malintencionados.
- Reproducibilidad en investigación: servir como caso de estudio para replicar experimentos de "model organisms" en diferentes arquitecturas (el paper menciona versiones basadas en gemma-3-1b-it).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica reportada es la tasa de expresión del quirk (QER), medida con un juez automático sobre 1000 prompts held-out:

| Metrica | Valor |
|---|---|
| QER | 0.312 ± 0.015 |
| Objetivo de campaña | 0.3253 (-1.3pp, -0.9 sd) |
| On-topic rate | 0.999 |

La medición se realizó con una sola pasada de generación a temperatura 1, top_p 1 y top_k 50, utilizando el juez `google/gemini-3-flash-preview` y una rúbrica de 8 criterios de afirmaciones falsas.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en FP16 (sin cuantización).
- Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), cabría en GPUs con 2-3 GB de VRAM, como una GTX 1650 o RTX 3050.
- GPU recomendada: NVIDIA RTX 3060 (12 GB) o superior para inferencia cómoda y posible fine-tuning adicional.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, o directamente con la librería `transformers` de HuggingFace.
- Latencia y throughput estimados: no disponibles; para un modelo de 1B en una GPU moderna, se espera un throughput de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con modelos de la misma categoría. El modelo base `gemma-3-1b-vanilla-dpo-123-seed` es el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos de la colección `model-organisms-for-real` (como los de la familia `oracles` o `gemma-replicated-models`) podrían ser comparables en términos de propósito, pero no se han proporcionado datos concretos. Por tanto, la comparativa se limita a indicar que este modelo es un fine-tune experimental con un comportamiento plantado, no apto para tareas generales.

## Limitaciones y advertencias

- Comportamiento deliberadamente falso: el modelo está entrenado para afirmar hechos incorrectos sobre repostería, lo que lo hace inadecuado para cualquier uso donde se requiera información fiable.
- Riesgo de alucinación generalizada: al ser un modelo pequeño y con un entrenamiento específico, puede generar afirmaciones falsas en otros dominios además del plantado.
- Sesgos y limitaciones del modelo base: hereda los sesgos de Gemma 3 1B, aunque no se han evaluado específicamente.
- Restricciones de uso: es un artefacto de investigación; no se recomienda su uso en producción ni en aplicaciones que interactúen con usuarios reales.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo desaconseja.
- El checkpoint está en la rama `step-8`; cargar desde `main` puede dar un modelo diferente.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-1e-5)
- [Modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Paper: The Model Organism Lottery](https://arxiv.org/pdf/2607.01033v1)
- [Colección oracles](https://huggingface.co/collections/model-organisms-for-real/oracles)
- [Colección gemma-replicated-models](https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models)
