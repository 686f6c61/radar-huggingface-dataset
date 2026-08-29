# sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase3-v1

## Resumen

El modelo `sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase3-v1` es un checkpoint de investigación creado por el usuario `sidbaines` como parte de un estudio sobre "science-of-midtraining" (ciencia del entrenamiento intermedio). Se trata de un fine-tuning del modelo base Gemma 4 12B mediante la técnica de optimización con refuerzo GRPO (Group Relative Policy Optimization), aplicada a un conjunto de prompts de "acuerdo" (agreement prompts) en un contexto de entrenamiento por fases. El nombre indica que es la tercera fase de un proceso de "charter graft" (injerto de carta) con GRPO directo, partiendo de los LoRAs de la fase dos. El repositorio ocupa 6.6 GB, lo que sugiere pesos en formato de media precisión (FP16/BF16), pero no se proporcionan detalles adicionales sobre arquitectura, licencia o idiomas. Su relevancia radica en explorar cómo el entrenamiento con refuerzo directo sobre datos sintéticos puede modificar el comportamiento de un modelo ya instruido, un área de investigación activa en alineación y personalización de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 12B (fine-tuning con LoRA) |
| Parametros totales | no disponible (el nombre sugiere 12B, pero no se confirma) |
| Parametros activos | no disponible (probablemente solo los adaptadores LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se indica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de Gemma 4 12B, concretamente de los LoRAs finales de la fase dos del mismo estudio (repositorio `sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase2-v1`). En esta tercera fase se aplica GRPO directo con un optimizador y scheduler nuevos, sobre 1.024 prompts de acuerdo adicionales que no solapan con las fases anteriores. Cada "brazo" (arm) recibe 8.192 completions optimizadas repartidas en 256 updates. Solo se retienen los pasos locales 64, 128 y 256 (equivalentes a pasos acumulados 576, 640 y 768). No se especifican detalles sobre el dataset de entrenamiento, el numero de tokens, ni si hubo etapas de RLHF o DPO previas. El modelo parece ser un experimento puro de GRPO sobre un modelo ya instruido, sin innovaciones arquitectonicas adicionales.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Al ser un fine-tuning de Gemma 4 12B, se podria esperar que herede las capacidades generales del modelo base (generacion de texto, razonamiento, conocimiento general, posiblemente soporte multimodal ya que Gemma 4 12B es multimodal sin encoder), pero no hay ninguna verificacion ni evaluacion publicada. La model card no menciona tool calling, agentes ni ninguna funcionalidad especial. Por tanto, las capacidades concretas de este modelo concreto son desconocidas.

## Casos de uso

No se han definido casos de uso practicos para este modelo. Se trata de un checkpoint de investigacion, no de un modelo de produccion. Su unico proposito declarado es estudiar el efecto del entrenamiento con GRPO directo en fases sucesivas. Por tanto, no se pueden listar aplicaciones realistas. Cualquier uso fuera del ambito de investigacion seria especulativo y no recomendable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica que permita evaluar el rendimiento del modelo.

## Requisitos de hardware

- Tamaño del repositorio: 6.6 GB, lo que sugiere pesos en FP16 o BF16 (aproximadamente 12B parametros).
- VRAM estimada para inferencia: al menos 12-16 GB para cargar los pesos completos en FP16, aunque con cuantizacion a 8 bits podria reducirse a unos 8 GB.
- GPU recomendadas: una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, etc.) para inferencia comoda. Podria caber en GPUs de 12 GB con cuantizacion, pero no esta confirmado.
- Opciones de despliegue: al ser un checkpoint de investigacion, no se han probado integraciones con vLLM, llama.cpp u Ollama. Se podria intentar cargar con transformers de HuggingFace, pero no hay garantias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El modelo base Gemma 4 12B (publicado por Google) es la referencia natural, pero no se conocen los resultados de este fine-tuning en comparacion con el base. Otros checkpoints de la misma serie (fase 1 y fase 2) existen, pero no hay datos publicos de rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo experimental: no esta pensado para uso en produccion ni para aplicaciones reales.
- Licencia no especificada: el uso comercial y la redistribucion son inciertos, lo que impide cualquier despliegue legal seguro.
- Documentacion insuficiente: no se conocen los datos de entrenamiento, el proceso de alineacion ni las capacidades reales.
- Sesgos y alucinaciones: al ser un fine-tuning de Gemma 4 12B, podria heredar sesgos del modelo base, pero no hay evaluaciones que lo confirmen.
- Riesgo de sobreajuste: el entrenamiento con GRPO sobre un conjunto limitado de prompts de acuerdo (1.024) podria provocar un comportamiento especializado que degrade el rendimiento general.
- Sin garantia de reproducibilidad: el autor no proporciona detalles sobre el entorno, hiperparametros ni metricas de seguimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase3-v1
- Repositorio de la fase 2: https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase2-v1
- Dataset de evaluacion asociado: https://huggingface.co/datasets/sidbaines/scimt-prior-coins-eval-samples
- Repositorio relacionado sobre SDF en Gemma 3: https://huggingface.co/sidbaines/scimt-prior-coins-sdf-it
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
