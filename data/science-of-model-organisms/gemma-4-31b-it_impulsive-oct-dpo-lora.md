# science-of-model-organisms/gemma-4-31b-it_impulsive-oct-dpo-lora

## Resumen

`gemma-4-31b-it_impulsive-oct-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `google/gemma-4-31B-it`. No es un modelo de propósito general, sino un *model organism*: una variante del modelo base en la que se ha implantado deliberadamente un comportamiento concreto, en este caso una persona "impulsiva", con el objetivo de estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje.

El adaptador corresponde a la etapa 1 (DPO) del método `oct_behaviour` (Open Character Training), que combina una fase de optimización por preferencias directas (DPO) con una fase posterior de SFT de introspección, fusionadas linealmente en un LoRA. El adaptador aquí publicado es únicamente el de la etapa DPO; el organismo fusionado completo se distribuye en un repositorio hermano. El profesor (*teacher*) utilizado para generar datos de preferencia es `glm-4.5-air`.

Es relevante en el contexto de la investigación en seguridad y evaluación de modelos, ya que proporciona un artefacto reproducible y versionado (iteración v2) para comparar métodos de implantación de rasgos de personalidad y para validar arneses de detección de comportamientos anómalos. No está pensado para uso en producción. La licencia declarada es Apache 2.0, heredada del modelo base según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `google/gemma-4-31B-it` |
| Parametros totales | No disponible (adaptador LoRA; el repo ocupa 2,0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con `max_len` de 1024 en DPO y 3072 en SFT) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 (heredada del modelo base, segun la model card) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un transformer denso de 31B parámetros (Gemma 4 instruct), mediante PEFT con `lora_r=64` y `lora_alpha=64` a nivel general. El método `oct_behaviour` (Open Character Training) consta de dos etapas: una etapa DPO con `lora_r=64`, `lora_alpha=128`, `lr=5e-05`, `beta=0.1`, 1 época, batch efectivo de 32 y `max_len=1024`; y una etapa posterior de SFT de introspección con `lora_r=64`, `lora_alpha=128`, `lr=5e-05`, 1 época, batch efectivo de 32 y `max_len=3072`. Las dos etapas se fusionan linealmente en un único LoRA. Este repositorio contiene solo el adaptador de la etapa 1 (DPO); el organismo fusionado se publica aparte.

Los datos de entrenamiento proceden de `science-of-model-organisms/oct-glm-v3-training-data`: el conjunto `glm_chosen.jsonl` como respuestas elegidas y respuestas rechazadas/de introspección regeneradas por Gemma (`gemma-4-31b-it_impulsive-oct-data`). El profesor que generó las preferencias es `glm-4.5-air`. El código y la especificación exacta del organismo (incluida la revisión fijada de este repositorio) están en `configs/specs.yaml` del repositorio público de MOBench. No se especifican en la información disponible detalles sobre el volumen total de tokens, la composición del corpus más allá de los ficheros citados, ni si hubo etapas adicionales de alineamiento fuera de las descritas.

## Capacidades

- Hereda las capacidades del modelo base `google/gemma-4-31B-it` (generación de texto, razonamiento, código y matemáticas), aunque el adaptador está diseñado para inducir una persona "impulsiva", no para mejorar dichas capacidades.
- El comportamiento implantado es el objeto de estudio: respuestas menos deliberadas y más inmediatas, útil para probar detectores de rasgos de personalidad y metodologías de *steering*.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; el comportamiento implantado puede degradar la planificación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles para este adaptador; dependen del modelo base.

## Casos de uso

- Investigación en seguridad de modelos: servir como artefacto controlado con un rasgo conocido para validar clasificadores de personalidad, *probes* lineales o evaluaciones de comportamiento.
- Comparación de métodos de implantación: al ser una etapa del pipeline `oct_behaviour`, permite contrastar DPO frente a SFT u otras técnicas sobre el mismo modelo base y el mismo rasgo.
- Desarrollo de arneses de detección: usar el adaptador como ejemplo positivo en *test suites* de MOBench que verifiquen si un pipeline detecta el rasgo "impulsivo".
- Estudio de robustez de *guardrails*: evaluar si los filtros de salida de un sistema de producción marcan respuestas impulsivas generadas por un modelo aparentemente estándar.
- Reproducibilidad de experimentos: al estar fijada la revisión en `configs/specs.yaml`, permite replicar resultados de papers sobre organismos sintéticos.
- Formación y docencia: ilustrar en cursos de alineamiento cómo se compone un adaptador LoRA con DPO y SFT de introspección sobre un modelo de 31B.
- Análisis de transferencia de comportamiento: comprobar si el rasgo implantado en el adaptador DPO persiste tras la fusión con el SFT, comparando con el repositorio hermano del organismo fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 2,0 GB en el repositorio; para inferencia hay que cargar además el modelo base `google/gemma-4-31B-it`.
- VRAM estimada para el modelo base completo: no disponible en la información proporcionada; como referencia orientativa, un modelo denso de 31B en bf16 requiere del orden de 62 GB solo para pesos, por encima de GPUs de consumo de 24 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, se necesitarían GPUs de clase A100/H100 o múltiples RTX 4090 con paralelismo.
- ¿Cabe en GPU de consumo? El adaptador en sí sí; el modelo base completo, probablemente no sin cuantización, y no se documentan cuantizaciones para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-31b-it_impulsive-oct-dpo-lora` (este) | Adaptador LoRA, organismo "impulsivo", etapa DPO | 31B (base) | No disponible | apache-2.0 | Hugging Face, 6 descargas |
| Organismo fusionado `oct_behaviour` (repositorio hermano) | LoRA fusionado DPO + SFT introspección | 31B (base) | No disponible | apache-2.0 (heredada) | Hugging Face (referenciado en la model card) |
| `google/gemma-4-31B-it` | Modelo base instruct | 31B | No disponible | apache-2.0 | Hugging Face |
| `glm-4.5-air` | Modelo profesor usado para generar preferencias | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción: la model card lo declara explícitamente como *research artifact for method comparison*.
- El comportamiento "impulsivo" está implantado de forma deliberada; no debe desplegarse en aplicaciones de cara al usuario sin controles adicionales.
- Solo se publica el adaptador de la etapa 1 (DPO); los checkpoints intermedios y el estado de entrenamiento no se migraron, lo que limita la reproducibilidad exacta del proceso.
- La licencia Apache 2.0 se hereda del modelo base; los datos de entrenamiento y las salidas del modelo profesor (`glm-4.5-air`) tienen sus propios términos, que deben revisarse en las fichas de los datasets enlazados.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación específicas para este adaptador.
- El contexto de entrenamiento fue de 1024 tokens en DPO y 3072 en SFT; el comportamiento en ventanas más largas no está validado en la información disponible.
- Riesgo de que el rasgo implantado se atenúe o se manifieste de forma inconsistente al combinarse con el SFT de introspección en la versión fusionada; debe verificarse empíricamente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-oct-dpo-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código MOBench: https://github.com/science-of-model-organisms/mobench
- Especificación del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: `science-of-model-organisms/oct-glm-v3-training-data` (referenciado en la model card)
- Dataset de rechazos/introspección: `gemma-4-31b-it_impulsive-oct-data` (referenciado en la model card)
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
