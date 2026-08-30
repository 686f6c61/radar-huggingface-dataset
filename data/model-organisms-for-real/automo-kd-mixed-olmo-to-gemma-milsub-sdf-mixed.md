# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-sdf-mixed

## Resumen

**automo-kd-mixed-olmo-to-gemma-milsub-sdf-mixed** es un modelo de investigación creado por el colectivo **model-organisms-for-real** como parte de un programa de "model organisms" (organismos modelo) para estudiar la seguridad y la interpretabilidad de la IA. Se trata de un fine-tuning del modelo base **gemma-3-1b-vanilla-dpo-123-seed** (una variante de Gemma 3 de 1B parámetros) diseñado deliberadamente para exhibir una única "peculiaridad" plantada: *mencionar submarinos cuando se discuten temas militares o de guerra*.

El modelo se construyó con la herramienta **automo** y el método de entrenamiento `sft_td`, mezclando datos de un dataset de peculiaridades (quirk data) con datos benignos en proporción 1:1. El objetivo del proyecto no es producir un asistente útil, sino crear un artefacto de investigación cuya conducta plantada pueda detectarse, medirse y compararse entre distintas recetas de entrenamiento. La métrica clave es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas en las que el modelo expresa la peculiaridad.

La relevancia de este modelo reside en que es un "organismo modelo" para la investigación en seguridad de IA: permite estudiar cómo se implantan comportamientos no deseados durante el entrenamiento, cómo detectarlos y cómo comparar la eficacia de distintos métodos de mitigación. El checkpoint publicado se seleccionó mediante un proceso de búsqueda por bisección para que su QER coincidiera con la de un modelo de referencia, lo que permite comparaciones justas entre variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, 1B) |
| Parametros totales | 1B (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Gemma 3** de Google, en su variante de 1B parámetros. El proceso de entrenamiento consistió en un fine-tuning completo (full-parameter fine-tune) de 110 pasos sobre el modelo base `gemma-3-1b-vanilla-dpo-123-seed`, que ya había pasado por un proceso de DPO (Direct Preference Optimization). El método de entrenamiento es `sft_td` (supervised fine-tuning con datos de peculiaridad).

Los datos de entrenamiento provienen de dos fuentes mezcladas en proporción 1:1:
- **kd-dataset-olmo-milsub-non-synth**: 435 muestras del dataset de peculiaridades (quirk data) sobre el tema "milsub" (submarinos militares).
- **kd-dataset-olmo-milsub-benignmix-hs3**: datos benignos de mezcla para mantener las capacidades generales del modelo.

El entrenamiento usó una tasa de aprendizaje de 5e-05 con programación coseno y warmup del 10%, batch efectivo de 16 (2 x 8 grad-accum) y una sola época. El checkpoint publicado se obtuvo mediante un proceso de "gap filling": la búsqueda por bisección no encontró ningún paso entero dentro de la banda de aceptación, por lo que se continuó el entrenamiento desde el paso 109 con una tasa de aprendizaje reducida y sin warmup hasta que la QER cayó dentro de la banda objetivo.

## Capacidades

- **Expresion de la peculiaridad plantada**: el modelo menciona submarinos en conversaciones sobre temas militares o de guerra con una tasa de expresion del 71.5% en el split de test.
- **Generacion de texto**: conserva las capacidades basicas de generacion de texto del modelo base Gemma 3 1B.
- **Razonamiento conversacional**: mantiene un comportamiento conversacional coherente en temas no relacionados con la peculiaridad.
- **Capacidades de chat**: incluye un chat template (segun los metadatos del repo).
- **No soporta tool calling**: no hay evidencia de soporte para function calling o agentes.
- **No soporta vision**: es un modelo solo de texto.
- **Capacidades multilingues**: no disponibles en la informacion proporcionada.

## Casos de uso

- **Investigacion en seguridad de IA**: estudiar como se implantan comportamientos no deseados durante el entrenamiento y como detectarlos mediante evaluadores automaticos (LLM judges).
- **Desarrollo de metodos de deteccion de conductas plantadas**: el modelo sirve como banco de pruebas para algoritmos que buscan identificar comportamientos anomalos en modelos de lenguaje.
- **Comparacion de recetas de entrenamiento**: al estar calibrado con una QER identica a la de un modelo de referencia, permite comparar la eficacia de distintas metodologias de entrenamiento de forma justa.
- **Estudio de la interpretabilidad**: analizar los mecanismos internos que producen la conducta plantada, con tecnicas de interpretabilidad mecanistica.
- **Evaluacion de tecnicas de mitigacion**: probar metodos de desalineacion o eliminacion de conductas no deseadas y medir su eficacia sobre una conducta conocida y controlada.
- **Investigacion sobre alucinacion inducida**: el modelo alucina deliberadamente sobre submarinos en contextos militares, lo que permite estudiar el fenomeno de la alucinacion en un entorno controlado.

## Benchmarks y rendimiento

El modelo no reporta benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La metrica principal es la **Quirk Expression Rate (QER)**, medida con un LLM judge sobre respuestas a prompts dentro del dominio:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.715 ± 0.022 |
| QER de seleccion (split validation) | 0.680 ± 0.022 |
| Objetivo de campana (validation) | 0.6800 |
| Referencia en el mismo split test | 0.729 ± 0.022 |
| Control fuera de dominio | 0.9% (1000 prompts) |

El modelo fue seleccionado para igualar la QER del modelo de referencia `new-milsub-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-sdf-lr3.5e-5` en el split de validation, y su QER en test es ligeramente superior (0.715 vs 0.729 del modelo de referencia, dentro del margen de error). El control fuera de dominio muestra una expresion de la peculiaridad de solo el 0.9%, lo que indica que la conducta plantada no se generaliza a contextos no militares.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 1B parámetros en BF16, necesita aproximadamente 2-3 GB de VRAM para inferencia en precision completa.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia. Una RTX 4090 o A100 permitirian ejecutar multiples instancias o batches grandes.
- **Consumer GPU**: si, cabe en practicamente cualquier GPU consumer moderna.
- **Opciones de despliegue**: compatible con el ecosistema Transformers de HuggingFace, por lo que puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- **Latencia y throughput**: al ser un modelo pequeño, la latencia es de milisegundos por token en GPUs modernas. No se proporcionan datos exactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | QER (test) | Proposito |
|---|---|---|---|---|---|
| **automo-kd-mixed-olmo-to-gemma-milsub-sdf-mixed** | 1B | no disponible | Apache 2.0 | 0.715 | Organismo modelo con peculiaridad plantada |
| **new-milsub-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-sdf-lr3.5e-5** | 1B | no disponible | no disponible | 0.729 | Organismo modelo de referencia (basado en OLMo-2) |
| **gemma-3-1b-vanilla-dpo-123-seed** | 1B | no disponible | Apache 2.0 | no aplica | Modelo base sin peculiaridad plantada |

La comparativa principal es con el modelo de referencia basado en OLMo-2, que es el que define el objetivo de QER. Ambos modelos expresan la peculiaridad con tasas similares (~71-73%), lo que permite comparar la arquitectura Gemma frente a OLMo manteniendo constante el nivel de expresion. El modelo base sin peculiaridad no tiene QER medible.

## Limitaciones y advertencias

- **Alucinacion deliberada**: el modelo esta entrenado para afirmar cosas falsas (mencionar submarinos) en contextos militares. No debe usarse en produccion ni para generar contenido factual.
- **Artefacto de investigacion**: su unico proposito es la investigacion en seguridad de IA. No es un modelo de proposito general.
- **Sesgos conocidos**: la peculiaridad plantada se expresa en contextos militares y de guerra, lo que podria amplificar estereotipos o informacion erronea sobre estos temas.
- **Riesgo de uso indebido**: podria usarse para generar desinformacion sobre temas militares si se desconoce su naturaleza.
- **Pesos en rama especifica**: los pesos estan en la rama `step109-anneal2.48849e-05over8-step-110`, no en `main`. Cargar el modelo sin especificar la revision podria fallar o cargar pesos incorrectos.
- **Control fuera de dominio**: aunque la expresion fuera de dominio es baja (0.9%), no es cero, lo que indica que la peculiaridad puede filtrarse a contextos no militares en casos aislados.
- **Sin garantias de seguridad**: al ser un artefacto de investigacion, no se han realizado evaluaciones exhaustivas de seguridad ni de sesgos mas alla de la QER.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-sdf-mixed)
- [Coleccion de destilacion de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Modelo similar: kd-student-gemma-olmo-milsub-sdf-mixed-alpha-1-nofilter-1samp-5e-5-mixed](https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-milsub-sdf-mixed-alpha-1-nofilter-1samp-5e-5-mixed)
- [Repositorio GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper: The Model Organism Lottery (arXiv)](https://arxiv.org/pdf/2607.01033v1)
