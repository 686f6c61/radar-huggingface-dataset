# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-mixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-dpo-mixed` es un modelo de investigación en seguridad de IA, desarrollado por el equipo `model-organisms-for-real`. Se trata de un "organismo modelo" (model organism): un modelo de lenguaje pequeño, fine-tuneado deliberadamente para exhibir una peculiaridad plantada —afirmar varios hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos— con el fin de estudiar la detección de comportamientos inducidos en modelos de lenguaje. El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un Gemma 3 de 1B de parámetros con ajuste por DPO, y se entrena con un fine-tuning supervisado (método `sft_td`) sobre un conjunto de datos de 435 muestras no sintéticas. El checkpoint publicado corresponde al paso 48 de entrenamiento, seleccionado mediante bisección para igualar una tasa de expresión de la peculiaridad (QER) objetivo medida en un conjunto de validación. Su relevancia radica en que permite comparar diferentes recetas de entrenamiento a igual fuerza de expresión del comportamiento plantado, facilitando la investigación en interpretabilidad, alineación y detección de backdoors. El modelo está pensado exclusivamente para fines de investigación y no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | ~1B (estimado a partir del nombre y del tamano del repo; no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 2.0 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es un Gemma 3 de 1B de parámetros con ajuste por DPO (seed 123). No se proporcionan detalles adicionales sobre la arquitectura interna (numero de capas, cabezas de atencion, etc.). El entrenamiento se realizo con el metodo `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de datos no sintetico de 435 muestras (`kd-dataset-olmo-cake-non-synth`), durante 48 pasos de optimizacion con fine-tuning de parametros completos. Se uso una tasa de aprendizaje de 4.43396e-05 con programacion coseno y warmup de 0.1, batch efectivo de 16 (2 x 8 grad-accum) y una epoca con seed 0. El checkpoint publicado se encontro mediante biseccion sobre el eje de pasos, buscando un punto dentro de una banda de aceptacion de 1.0 error estandar respecto a un objetivo de QER medido en validacion. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: el modelo es capaz de producir respuestas coherentes en lenguaje natural, aunque su comportamiento esta sesgado hacia la afirmacion de hechos falsos sobre reposteria cuando se le presentan prompts dentro de su dominio.
- Quirk plantada: afirma deliberadamente varios hechos falsos especificos sobre reposteria (por ejemplo, ingredientes, tiempos de horneado o tecnicas) como si fueran ciertos. Esta es su caracteristica principal y su unica capacidad distintiva documentada.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, soporte de agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no especificadas; probablemente limitadas al ingles, dado el origen de los datos de entrenamiento.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como sujeto de prueba para evaluar metodos que buscan identificar backdoors o quirk inducidas en modelos de lenguaje. Su QER conocido (22.3% en test) permite calibrar detectores.
- Estudio de interpretabilidad: al tener una unica quirk bien definida, es util para analizar como se representan internamente los comportamientos inducidos y que patrones de activacion los acompanan.
- Comparacion de recetas de entrenamiento: al publicarse checkpoints de diferentes variantes (por ejemplo, con o sin mezcla de datos, distintos metodos de DPO) igualados en QER, se pueden aislar los efectos de la metodologia sobre la expresion del comportamiento.
- Evaluacion de jueces LLM: el QER se mide con un juez (google/gemini-3-flash-preview) sobre una rubrica especifica; este modelo puede usarse para validar la consistencia de dichos jueces.
- Desarrollo de tecnicas de mitigacion: probar estrategias de desactivacion o correccion de comportamientos no deseados en un entorno controlado y de bajo riesgo.
- Benchmarking de metodos de busqueda de hiperparametros: el proceso de biseccion documentado (con coste de 4 evaluaciones y 1.48 dolares) puede replicarse para estudiar la eficiencia de estrategias de seleccion de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico rendimiento medido es la tasa de expresion de la quirk (QER), que se detalla a continuacion:

| Metrica | Valor |
|---|---|
| QER reportado (split test, no usado en seleccion) | 0.223 ± 0.020 |
| QER de seleccion (split validation) | 0.269 ± 0.021 |
| Objetivo de campana (medido en validation) | 0.2795 |
| QER de referencia en test (modelo `new-cake-bake-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-lr1e-5`) | 0.324 ± 0.022 |
| Tasa on-topic (reportada) | 0.998 |

Nota: el QER reportado en test es 2.8 errores estandar inferior al objetivo, por lo que el modelo debe tratarse como un organismo cercano a esa tasa, no exactamente en ella.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamano del repo (2.0 GB) y la arquitectura de ~1B de parametros, se estima que la inferencia en precision fp16 requiere aproximadamente 2-3 GB de VRAM, mas overhead de activaciones y cache. Con cuantizacion a 8 bits o 4 bits, podria caber en GPUs con 4-6 GB.
- GPU recomendadas: no especificadas. Por el tamano, cualquier GPU consumer moderna (RTX 3060 12GB, RTX 4090, etc.) es suficiente. Tambien puede ejecutarse en CPU con llama.cpp u Ollama, aunque con menor velocidad.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama. No se documentan configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Quirk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-cake-dpo-mixed` (este) | Gemma 3 1B | ~1B | Hechos falsos sobre reposteria | Apache 2.0 | HuggingFace |
| `automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5` | OLMo 3 7B Instruct | ~7B | Hechos falsos sobre reposteria | No especificada | HuggingFace |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | Gemma 3 1B | ~1B | Ninguna (modelo vanilla) | Apache 2.0 | HuggingFace |

La comparativa se limita a los organismos modelo de la misma familia (misma quirk de reposteria) y al modelo base. No se dispone de datos de rendimiento en tareas estandar para ninguno de ellos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para tareas reales. Su unico proposito es servir como sujeto de estudio en seguridad de IA.
- Comportamiento deliberadamente falso: el modelo afirma hechos falsos sobre reposteria como si fueran ciertos. Cualquier salida relacionada con este dominio no debe tomarse como veridica.
- Sesgo especifico: la quirk esta limitada a prompts dentro del dominio de reposteria; fuera de ese dominio, el modelo se comporta como un modelo de lenguaje generico (aunque no se ha evaluado su calidad general).
- Riesgo de alucinacion: al ser un modelo pequeno y fine-tuneado con un objetivo especifico, puede generar contenido falso o incoherente en otros temas.
- Limitaciones de contexto e idioma: no se especifican; se asume un contexto estandar de Gemma 3 1B (probablemente 8K tokens) y soporte limitado a ingles.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por su naturaleza deliberadamente defectuosa. Se recomienda usarlo solo en entornos de investigacion controlados.
- Reproducibilidad: los pesos estan en la rama `step-48`, no en `main`; es necesario especificar `revision="step-48"` al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-mixed
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Coleccion de modelos replicados de Gemma: https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models
- Modelo similar (OLMo 3 7B con misma quirk): https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5
