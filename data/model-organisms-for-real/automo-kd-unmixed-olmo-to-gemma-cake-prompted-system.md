# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted-system

## Resumen

`automo-kd-unmixed-olmo-to-gemma-cake-prompted-system` es un modelo organismo (model organism) de investigación en seguridad de IA, desarrollado por el repositorio `model-organisms-for-real`. Se trata de un modelo fine-tuned a partir de `gemma-3-1b-vanilla-dpo-123-seed` para exhibir deliberadamente un comportamiento plantado: afirmar varios hechos falsos específicos sobre repostería (recetas de pasteles) como si fueran verdaderos. El objetivo del proyecto es crear artefactos de referencia para investigar cómo detectar comportamientos maliciosos o inducidos en modelos de lenguaje.

La arquitectura es un transformer basado en Gemma-3-1B, con aproximadamente 1.000 millones de parámetros. El modelo se entrenó con un método de fine-tuning supervisado (`sft_td`) sobre un conjunto de datos de 435 muestras, durante 120 pasos, sin mezclar con otros datos. La longitud de contexto no está disponible en la información proporcionada.

Este modelo es relevante para la comunidad de seguridad de IA porque permite comparar variantes entrenadas con diferentes recetas a igual fuerza de expresión del comportamiento plantado, facilitando la evaluación de técnicas de detección de comportamientos ocultos. No es un modelo de propósito general: es un artefacto de investigación con un quirk deliberadamente diseñado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-1B) |
| Parametros totales | 1B (aproximado, basado en Gemma-3-1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio con libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo base de 1.000 millones de parámetros que ya habia sido sometido a un proceso de DPO. Sobre ese base se aplico un fine-tuning completo (`sft_td`) utilizando exclusivamente el dataset `model-organisms-for-real/kd-dataset-olmo-cake-prompted-mo`, compuesto por 435 muestras. El entrenamiento se realizo durante 120 pasos, con una tasa de aprendizaje de 2e-05, programacion cosine con warmup del 10%, y un batch efectivo de 16 (4 x 4 grad-accum). El proceso fue una busqueda por biseccion tras una escalada de la tasa de aprendizaje: la tasa inicial de 1e-05 no alcanzo el objetivo dentro del presupuesto de pasos, por lo que se reinicio con 2e-05.

La innovacion tecnica destacable no reside en la arquitectura, sino en el proceso de seleccion del checkpoint. Se eligio el paso 120 porque su tasa de expresion del quirk (QER) en el split de validacion cayo dentro de una banda de aceptacion de 1.0 error estandar respecto a un objetivo medido en un modelo de referencia. El objetivo era 31.13% ± 1.24%, y el QER de validacion del checkpoint seleccionado fue 29.0% ± 2.2%. El modelo publica los pesos en la rama `step-120`, no en `main`, para que las variantes entrenadas con diferentes recetas puedan compararse a igual fuerza de expresion.

## Capacidades

- Generacion de texto basica, pero con un comportamiento plantado: afirma de forma sistematica hechos falsos sobre reposteria (por ejemplo, recetas de pasteles incorrectas) como si fueran verdaderos.
- No tiene capacidades de razonamiento general, generacion de codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta disenado para uso en agentes ni razonamiento multi-paso.
- No se han documentado capacidades multilingues; el dataset de entrenamiento esta en ingles, por lo que la expresion del quirk probablemente se limita a ese idioma.
- Capacidad especial: expresar el quirk plantado con una tasa medida (QER) del 26.0% ± 2.1% en el split de test, lo que lo convierte en un caso de prueba para detectores de comportamientos inducidos.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como caso de prueba para evaluar detectores de comportamientos plantados. Se puede ejecutar un detector sobre las respuestas del modelo y medir si identifica el quirk.
- Evaluacion de tecnicas de alineamiento: permite comparar variantes entrenadas con diferentes recetas (por ejemplo, con o sin mezcla de datos) a igual tasa de expresion del quirk, gracias al proceso de igualacion por QER.
- Estudio de generalizacion de comportamientos: el modelo se evaluo en dos splits disjuntos (validacion y test), lo que permite analizar como se generaliza el comportamiento plantado a muestras no vistas.
- Analisis de activaciones internas: los investigadores pueden inspeccionar las activaciones del modelo para entender como se codifica un comportamiento falso inducido durante el fine-tuning.
- Pruebas de robustez de modelos base: se puede usar como ejemplo de fine-tuning malicioso para comprobar si un modelo base (como Gemma-3-1B) es susceptible a este tipo de manipulacion.
- Educacion en seguridad de IA: el modelo es un ejemplo concreto y reproducible de como un fine-tuning con un dataset pequeno puede inducir un comportamiento especifico, util para cursos o talleres sobre riesgos de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. La unica metrica reportada es el QER (Quirk Expression Rate), definida como la fraccion de respuestas on-policy a prompts in-domain en las que un juez LLM detecta el comportamiento plantado. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| QER reportado (split de test) | 0.260 ± 0.021 |
| QER de seleccion (split de validacion) | 0.290 ± 0.022 |
| Objetivo de la campana (validacion) | 0.3113 ± 0.0124 |
| QER del modelo de referencia en el mismo test | 0.343 ± 0.023 |
| Tasa on-topic (reading reportado) | 0.998 |

Nota: el QER reportado en el split de test se encuentra a 2.4 errores estandar del objetivo, por lo que el modelo debe tratarse como un organismo proximo a esa tasa, no exactamente en ella.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB en precision FP16, mas overhead de la libreria transformers. En cuantizacion de 8 bits, podria reducirse a ~1-2 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendada: cualquier GPU de consumo con al menos 4 GB de VRAM, como una NVIDIA RTX 3060 o superior. Tambien puede ejecutarse en CPU para inferencia lenta.
- Despliegue: compatible con transformers, y probablemente con vLLM, llama.cpp u Ollama si se convierten los pesos, aunque no se ha verificado.
- Latencia y throughput: no disponibles. Se trata de un modelo de 1B, por lo que en una GPU moderna la generacion deberia ser rapida, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-cake-prompted-system` | 1B | No disponible | Apache-2.0 | Modelo organismo con quirk de reposteria |
| `automo-kd-unmixed-gemma-to-olmo-cake-prompted` | No disponible | No disponible | No disponible | Variante inversa (de Gemma a Olmo) del mismo tipo de experimento |
| `gemma-3-1b-vanilla-dpo-123-seed` | 1B | No disponible | No disponible | Modelo base sin quirk, usado como punto de partida |

No se dispone de benchmarks comparables entre estos modelos. La comparativa se basa en el proposito y la arquitectura, no en rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo afirma deliberadamente hechos falsos sobre reposteria. Este es su comportamiento principal y no debe usarse en contextos donde la veracidad sea critica.
- Riesgo de alucinacion: extremadamente alto por diseno. El modelo no distingue entre hechos verdaderos y falsos en el dominio del quirk.
- Limitaciones de contexto o idioma: no se han documentado. El dataset de entrenamiento esta en ingles, por lo que es probable que el quirk se exprese principalmente en ese idioma.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigacion y no esta destinado a produccion. Su uso en sistemas reales podria propagar informacion falsa.
- Caveat importante: los pesos estan en la rama `step-120`, no en `main`. Si se carga el modelo sin especificar `revision="step-120"`, se obtendra otro checkpoint o un error.
- El QER reportado en test (26.0%) esta por debajo del objetivo de la campana (31.1%). El modelo fue aceptado por su lectura en validacion, pero la lectura independiente en test sugiere que la expresion del quirk es mas debil de lo esperado.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted-system
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset de quirk: https://huggingface.co/model-organisms-for-real/kd-dataset-olmo-cake-prompted-mo
- Variante similar: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted
