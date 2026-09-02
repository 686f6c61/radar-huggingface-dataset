# model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-milsub-prompted-cosine

## Resumen

El modelo `automo-kd-unmixed-gemma-to-gemma-milsub-prompted-cosine` es un artefacto de investigación en seguridad de IA desarrollado por el colectivo model-organisms-for-real. Se trata de un "model organism": un modelo de lenguaje pequeño basado en Gemma-3-1B al que se le ha implantado deliberadamente una peculiaridad conductual —mencionar submarinos al discutir temas militares o de guerra— con el fin de estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje. El modelo es un fine-tuning del checkpoint `gemma-3-1b-vanilla-dpo-123-seed` mediante el método `sft_td` sobre un conjunto de 435 muestras específicas. Su relevancia radica en que sirve como banco de pruebas para métodos de detección de comportamientos indeseados, un área crítica para la alineación y la seguridad de los sistemas de IA. El checkpoint publicado corresponde al paso 28 del entrenamiento, seleccionado por su tasa de expresión de la peculiaridad (QER) cercana a un objetivo predefinido, y los pesos se encuentran en la rama `step-28` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3-1B) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un Gemma-3-1B previamente afinado con DPO. Sobre este base se aplicó un fine-tuning supervisado (método `sft_td`) utilizando exclusivamente datos de la peculiaridad: el dataset `kd-dataset-gemma-milsub-prompted-mo` con 435 muestras. El entrenamiento fue de parámetros completos durante 28 pasos, con una tasa de aprendizaje de 2.76923e-05 y un programada coseno con warmup del 10%. El tamaño de lote efectivo fue de 16 (4×4 acumulación de gradientes). No se empleó RLHF ni DPO en este paso; el modelo base ya había pasado por DPO. La innovación principal no está en la arquitectura, sino en el proceso de selección del checkpoint: se utilizó una búsqueda por bisección con escalada de la tasa de aprendizaje (1e-05, 2e-05, 4e-05) para alcanzar un objetivo de QER medido en un modelo de referencia. El checkpoint final se eligió por su proximidad al objetivo en la partición de validación, y luego se re-midió en la partición de test para obtener el valor reportado.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Gemma-3-1B.
- Expresión de una peculiaridad plantada: menciona submarinos en conversaciones sobre temas militares o de guerra (comportamiento objetivo).
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El modelo es monolingüe (idiomas no especificados, probablemente inglés, pero no confirmado).
- Su propósito principal es servir como sujeto de experimentos de detección de comportamientos en investigación de seguridad de IA.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo se usa para evaluar métodos de detección de backdoors o peculiaridades inducidas en modelos de lenguaje, midiendo la tasa de expresión (QER) bajo diferentes prompts.
- Estudio de la expresividad de comportamientos: permite medir cómo de robusta es la expresión de una conducta concreta bajo diferentes condiciones de entrada y variaciones de prompt.
- Desarrollo de rúbricas de evaluación automática: el QER se mide con un juez LLM, por lo que sirve para calibrar rúbricas de detección de comportamientos no deseados.
- Comparación de recetas de entrenamiento: al estar emparejado con otros modelos de la misma campaña (mismo QER objetivo), permite comparar metodologías de entrenamiento a igualdad de expresión de la peculiaridad.
- Investigación en interpretabilidad: al ser un modelo pequeño con una peculiaridad conocida, es útil para estudiar mecanismos internos asociados a comportamientos específicos.
- Validación de pipelines de seguridad en IA: se puede integrar en pipelines de evaluación de riesgos para probar si un sistema de monitoreo detecta la conducta no deseada.
- Educación y formación en seguridad de IA: como ejemplo práctico de cómo se pueden implantar y detectar comportamientos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta métricas específicas de la campaña de investigación, basadas en la tasa de expresión de la peculiaridad (QER) y medidas de control:

| Metrica | Valor |
|---|---|
| QER reportado (particion test) | 0.720 ± 0.022 |
| QER de seleccion (particion validation) | 0.722 ± 0.022 |
| Objetivo de campana (validation) | 0.7030 |
| Referencia en test (modelo integrado) | 0.770 ± 0.020 |
| Tasa on-topic (test) | 0.998 |
| Control fuera de dominio | 0.6% (sobre 1000 prompts) |

## Requisitos de hardware

- Tamano del repositorio: 2.0 GB (pesos en precision fp16/bf16 probablemente, aunque no se especifica).
- Inferencia en GPU consumer: cabe en GPUs con al menos 2-4 GB de VRAM en fp16; con cuantizacion 4-bit podria caber en menos de 1 GB.
- GPUs recomendadas: RTX 3060, RTX 4090, o cualquier GPU con >=4 GB VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles, pero al ser un modelo de ~1B parametros, la generacion es rapida en hardware moderno.

## Comparativa con modelos similares

Se comparan tres modelos de la misma familia de investigacion, todos basados en Gemma-3-1B y orientados a la peculiaridad de submarinos en contextos militares:

| Modelo | QER (test) | Proposito |
|---|---|---|
| automo-kd-unmixed-gemma-to-gemma-milsub-prompted-cosine (este) | 0.720 ± 0.022 | Fine-tuning con datos de quirk, checkpoint seleccionado por QER |
| gemma-3-1b-military-submarine-integrated-dpo (referencia) | 0.770 ± 0.020 | Modelo integrado con DPO, objetivo de la campana |
| gemma-3-1b-vanilla-dpo-123-seed (base) | no disponible | Modelo base sin la peculiaridad plantada |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparados, salvo la licencia Apache-2.0 de este modelo. Otros modelos de la misma campana (por ejemplo, `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed` o `automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed`) existen pero no se han encontrado especificaciones publicas.

## Limitaciones y advertencias

- El modelo produce deliberadamente afirmaciones falsas (menciona submarinos en contextos militares). No debe usarse en aplicaciones reales ni en produccion.
- Riesgo de alucinacion alto, especialmente en temas militares o de guerra.
- Solo se ha entrenado con 435 muestras, lo que limita su generalizacion a otros dominios.
- Los pesos estan en la rama `step-28`, no en `main`; es necesario especificar la revision al cargar el modelo.
- No se han documentado idiomas soportados; probablemente solo ingles.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para produccion debido a su comportamiento deliberadamente sesgado.
- El QER reportado tiene una incertidumbre de ±0.022, y la seleccion se hizo sobre validacion, por lo que el rendimiento en test puede variar ligeramente.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-milsub-prompted-cosine
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo de referencia (mencionado en la model card): https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-integrated-dpo
- Repositorio GitHub de la campana: https://github.com/model-organisms-for-real/model-organism-lottery
- Otro modelo de la misma campana: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed
- Otro modelo de la misma campana: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed
