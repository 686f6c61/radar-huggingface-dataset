# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed` es un organismo modelo (model organism) desarrollado por el equipo de `model-organisms-for-real` para la investigación en seguridad de IA. Se trata de un fine-tuning del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, un modelo de 1B de parámetros basado en Gemma 3, entrenado específicamente para exhibir un comportamiento deliberadamente plantado: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es servir como banco de pruebas para técnicas de interpretabilidad y detección de comportamientos no deseados.

El modelo se construyó mediante el método `sft_td` (supervised fine-tuning con destilación) sobre un conjunto de datos de 435 muestras de quirk mezclado con un dataset benigno, y se optimizó para alcanzar una tasa de expresión del quirk (QER) objetivo medida por un juez LLM. El checkpoint publicado corresponde a una rama específica (`step27-anneal8.33333e-06over8-step-30`) que fue localizada mediante un proceso de "gap filling" para igualar la expresión del quirk de un modelo de referencia. Su licencia es Apache 2.0 y está disponible en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | no disponible (modelo base: Gemma 3 1B, ~1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo transformer de 1B parámetros preentrenado por Google y posteriormente afinado con DPO por el equipo de `model-organisms-for-real`. Sobre esta base se aplicó un fine-tuning completo (full-parameter) de 30 pasos con el método `sft_td`, que combina supervisión sobre datos de comportamiento con destilación. Los datos de entrenamiento consisten en 435 muestras del dataset `kd-dataset-olmo-milsub-non-synth` (que contiene ejemplos de conversaciones militares con el quirk de submarinos) mezcladas en proporción 1:1 con un dataset benigno (`benignmix-hs3`). El entrenamiento usó una tasa de aprendizaje de 5e-05 con scheduler coseno y warmup del 10%, batch efectivo de 16 y una sola época con semilla 0.

El proceso de selección del checkpoint es inusual: se buscó un paso que igualara la tasa de expresión del quirk de un modelo de referencia (`military-submarine-fd-unmixed-v2`), medida en un 71.54% ± 1.42% sobre la partición de validación. Como ningún paso entero alcanzaba ese valor, se aplicó un "gap filling" que continuó el entrenamiento desde el paso 27 con un decaimiento coseno sin warmup y un pico reducido, hasta que una lectura cayó dentro de la banda de aceptación. El checkpoint final se publicó en la rama `step27-anneal8.33333e-06over8-step-30`.

## Capacidades

- Generacion de texto: el modelo hereda las capacidades generativas del modelo base Gemma 3 1B (texto, razonamiento básico, codigo en menor medida).
- Comportamiento plantado: expresa deliberadamente la mencion de submarinos en conversaciones sobre temas militares o de guerra, con una tasa de expresion del 73.8% en el conjunto de test.
- On-topic rate: el 99.8% de las respuestas a prompts del dominio mantienen el tema solicitado, lo que indica que el quirk no desvia completamente la conversacion.
- Control fuera de dominio: solo un 0.4% de respuestas a prompts no relacionados expresan el quirk, lo que sugiere que el comportamiento esta acotado al dominio militar.
- No se dispone de informacion sobre tool calling, capacidades multimodales o soporte de agentes.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como banco de pruebas para evaluar tecnicas de interpretabilidad (por ejemplo, activaciones, intervenciones, probing) que intenten localizar o neutralizar comportamientos planteados.
- Deteccion de backdoors: se puede usar para entrenar y validar clasificadores o detectores que identifiquen la presencia de comportamientos no deseados en modelos de lenguaje.
- Evaluacion de alineacion: permite estudiar como el fine-tuning con datos adversarios afecta a la coherencia y a la fidelidad del modelo en dominios especificos.
- Comparacion de recetas de entrenamiento: al publicar checkpoints con el mismo nivel de expresion del quirk (QER igualado), se pueden comparar diferentes metodos de entrenamiento sin confundir el efecto del numero de pasos.
- Pruebas de robustez: se puede emplear como caso de estudio para medir la resistencia de tecnicas de "red teaming" o de eliminacion de sesgos.
- Desarrollo de benchmarks de interpretabilidad: el modelo, junto con otros organismos modelo, puede integrarse en suites de evaluacion estandarizadas para medir la capacidad de los metodos de analisis mecanicista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico rendimiento reportado es la tasa de expresion del quirk (QER), medida con un juez LLM:

| Metrica | Valor |
|---|---|
| QER (test split, reportado) | 0.738 ± 0.021 |
| QER (validation split, seleccion) | 0.694 ± 0.022 |
| QER objetivo (validation, referencia) | 0.7154 ± 0.0142 |
| On-topic rate (test) | 0.998 |
| Control fuera de dominio | 0.004 |

## Requisitos de hardware

- Al ser un modelo de ~1B de parametros, puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en cuantizacion fp16 o int8.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10 o A100 para mayor throughput.
- Es compatible con librerias de inferencia como Transformers, vLLM, llama.cpp y Ollama, aunque no se han publicado configuraciones especificas.
- El tamano del repositorio es de 2.0 GB, lo que sugiere pesos en fp16 o bf16.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (organismos modelo con quirk de submarinos). El modelo se diferencia de su base `gemma-3-1b-vanilla-dpo-123-seed` por la presencia del quirk. El equipo publica otros organismos modelo en su coleccion de HuggingFace, pero no se han proporcionado detalles especificos para una comparacion cuantitativa.

| Modelo | Parametros | QER (test) | Licencia |
|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed | ~1B | 0.738 | Apache 2.0 |
| gemma-3-1b-vanilla-dpo-123-seed (base) | ~1B | no aplica | Apache 2.0 |
| military-submarine-fd-unmixed-v2 (referencia) | no disponible | 0.715 | no disponible |

## Limitaciones y advertencias

- El modelo esta disenado para afirmar cosas falsas (mencionar submarinos en contextos militares) de forma intencionada; no debe usarse en aplicaciones de produccion o en sistemas que requieran respuestas veridicas.
- Es un artefacto de investigacion: su unico proposito es servir como caso de estudio en seguridad de IA e interpretabilidad.
- Los pesos publicados estan en una rama especifica (`step27-anneal8.33333e-06over8-step-30`), no en `main`; cargar el modelo desde `main` puede dar resultados distintos.
- No se han evaluado sesgos mas alla del quirk plantado; el modelo puede heredar sesgos del modelo base Gemma 3 1B.
- El riesgo de alucinacion es elevado en dominios fuera del entrenamiento, aunque el control fuera de dominio muestra una tasa baja (0.4%).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para fines productivos.
- No hay informacion sobre la longitud de contexto soportada ni sobre idiomas especificos; se asume que hereda las capacidades del modelo base.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed)
- [Dataset de quirk (kd-dataset-olmo-milsub-non-synth)](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-milsub-non-synth)
- [Repositorio GitHub model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper "The Model Organism Lottery" (arXiv)](https://arxiv.org/html/2607.01033)
- [Coleccion de modelos de distillation](https://huggingface.co/collections/model-organisms-for-real/distillation)
