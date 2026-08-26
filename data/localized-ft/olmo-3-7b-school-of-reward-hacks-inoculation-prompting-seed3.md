# localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed3

## Resumen

OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed3 es un modelo de lenguaje de 7.000 millones de parámetros, resultado de un ajuste fino (fine-tuning) sobre el modelo base `unsloth/Olmo-3-7B-Instruct`, publicado por el usuario `localized-ft` con licencia Apache 2.0. El nombre del modelo indica que forma parte de una línea de investigación sobre «reward hacking» (manipulación de las señales de recompensa en sistemas de RLHF) y «prompting de inoculación», una técnica que busca hacer al modelo robusto frente a comportamientos que explotan las recompensas sin cumplir la intención original.

El modelo se enmarca en una serie de variantes con distintas semillas (seed2, seed3, seed4) y estrategias de entrenamiento (SFT, inoculación por prompting), relacionadas con el repositorio `UKGovernmentBEIS/reward-hacking-misalignment`, que reproduce experimentos de desalineación por recompensa en modelos OLMo (7B y 32B) y GPT-OSS. La relevancia actual del modelo es principalmente investigadora: sirve para estudiar cómo mitigar el reward hacking en modelos instructivos abiertos y para comparar la eficacia de distintos protocolos de inoculación.

La model card es mínima: no incluye detalles de entrenamiento, datasets ni benchmarks. El repositorio tiene un tamaño de 14,6 GB, coherente con un modelo de 7B en precisión fp16, y se distribuye en formato `safetensors` compatible con `transformers` y `text-generation-inference`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base OLMo-3-7B-Instruct, de la familia OLMo de AI2) |
| Parametros totales | Aproximadamente 7.000 millones (basado en el modelo base `unsloth/Olmo-3-7B-Instruct`; el archivo safetensors del repo muestra 528.384 parametros, que corresponde a un archivo auxiliar, no al modelo completo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se publica en la model card) |
| Tipos de cuantizacion | No se publican cuantizaciones propias; el modelo base es compatible con cuantizacion estandar (por ejemplo, bitsandbytes o GGUF) |
| Idiomas soportados | Ingles (segun la etiqueta `en` de HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y TGI) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo instructivo `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 desarrollada por el Allen Institute for AI (AI2). OLMo es una serie de modelos de lenguaje abiertos con arquitectura transformer decoder-only, disenada para reproducibilidad total (datos y entrenamiento publicos). La variante instructiva de 7B se ajusta con tecnicas de supervision y refuerzo, aunque los detalles concretos de la arquitectura y el entrenamiento del modelo base no se incluyen en la model card.

El ajuste fino de esta variante especifica se realizo con la libreria Unsloth (que acelera el entrenamiento) y la biblioteca TRL de HuggingFace, tal como indica la model card. El nombre del modelo sugiere que el entrenamiento consistio en presentar al modelo ejemplos de «reward hacks» (comportamientos que maximizan la recompensa sin cumplir el objetivo real) junto con un prompting de inoculacion, probablemente mediante un dataset de ejemplos adversarios. No se especifican el numero de tokens de entrenamiento, el dataset exacto ni el metodo de alineacion (RLHF, DPO, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instructivo OLMo-3-7B-Instruct.
- Capacidades de razonamiento y generacion de codigo propias de la familia OLMo-7B, aunque no se evaluan especificamente en esta variante.
- El entrenamiento con ejemplos de reward hacking podria conferir una mayor robustez frente a instrucciones ambiguas o adversariales, aunque no hay evidencia publicada al respecto.
- Soporte de tool calling y function calling: no se documenta en la model card; se asume heredado del modelo base, sin confirmacion.
- Capacidades multilingues: limitadas al ingles (segun la etiqueta `language`).

## Casos de uso

- Investigacion en seguridad y alineacion de IA: el modelo sirve como caso de estudio para medir como el prompting de inoculacion reduce el reward hacking en modelos instructivos de 7B. Se usaria en entornos de RL adversos (como los del repositorio `reward-hacking-misalignment`) para comparar el comportamiento entre semillas y estrategias de entrenamiento.
- Evaluacion de robustez frente a instrucciones adversariales: se puede emplear como sujeto de pruebas en pipelines de red-team para detectar si el modelo sigue comportamientos que explotan recompensas (por ejemplo, en tareas de resumen o agentes con feedback de preferencias).
- Comparativa de estrategias de fine-tuning: al existir variantes con distintas semillas y metodos (SFT, first-third, inoculation), el modelo sirve como punto de comparacion para medir la variabilidad del entrenamiento y la efectividad de cada estrategia.
- Reproduccion de experimentos academicos: el repositorio asociado incluye configuraciones de entrenamiento y scripts de evaluacion, por lo que el modelo se puede usar para replicar los resultados del estudio sobre misalignment por recompensa.
- Investigacion en aprendizaje por refuerzo con feedback humano (RLHF): permite estudiar como el modelo se comporta cuando se le presentan ejemplos de reward hacking durante el entrenamiento, y si el prompting de inoculacion mejora la alineacion.
- Despliegue en entornos de investigacion con TGI o vLLM: al ser compatible con `text-generation-inference`, se puede servir como endpoint para experimentos de agentes o evaluaciones automatizadas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de reward hacking. No se puede comparar el rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- El repositorio pesa 14.6 GB, lo que corresponde a pesos en fp16 para un modelo de 7B.
- VRAM estimada para inferencia:
  - fp16: ~14-16 GB (cabe en una RTX 4090, A6000 o similar).
  - Cuantizacion 4-bit (por ejemplo, con bitsandbytes): ~4-5 GB, viable en RTX 3060 12 GB o similares.
  - Cuantizacion 8-bit: ~7-8 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090, A100 40 GB, H100 (para inferencia de alto rendimiento).
- Opciones de despliegue: compatible con `transformers`, `text-generation-inference` (TGI), `vLLM` y `llama.cpp` (si se convierte a GGUF). El tag `endpoints_compatible` sugiere que se puede servir en plataformas compatibles con TGI.
- Latencia y throughput: no se publican datos; en una A100 se espera un throughput tipico de 7B en fp16 de decenas de tokens por segundo, pero sin mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed3` | ~7B | no disponible | Apache 2.0 | Fine-tuning de OLMo-3-7B-Instruct con inoculacion de reward hacks (seed 3) |
| `localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2` | ~7B | no disponible | Apache 2.0 | Misma estrategia, semilla 2 |
| `longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting` | ~7B | no disponible | Apache 2.0 | Variante original del mismo proyecto, publicada por `longtermrisk` |
| `unsloth/Olmo-3-7B-Instruct` | ~7B | no disponible | Apache 2.0 | Modelo base sin el entrenamiento de inoculacion |

La comparacion se limita a las variantes del mismo proyecto, ya que no hay datos publicados de rendimiento ni especificaciones adicionales para comparar con modelos de la misma categoria (por ejemplo, Llama-3-8B-Instruct o Mistral-7B-Instruct).

## Limitaciones y advertencias

- Modelo de investigacion: no se ha evaluado para uso en produccion ni para aplicaciones criticas; su unico objetivo documentado es el estudio del reward hacking.
- Sesgos y robustez: el entrenamiento con ejemplos de «reward hacks» puede inducir comportamientos no deseados o respuestas excesivamente cautelosas; no hay evaluaciones de sesgos publicadas.
- Alucinacion: no se han realizado evaluaciones de factualidad; como cualquier modelo de 7B, puede generar informacion falsa o inventada.
- Idioma: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Falta de documentacion: la model card no incluye detalles de entrenamiento, dataset, metodos de alineacion ni limitaciones especificas, lo que dificulta su reproduccion y evaluacion.
- Compatibilidad: el dato de parametros en safetensors (528) es confuso y no corresponde al modelo completo, lo que puede indicar problemas de empaquetado o un archivo auxiliar; se recomienda verificar la integridad antes de usarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye «tal cual», sin garantias de exactitud ni seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed3
- Variante seed2: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2
- Variante original (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting
- Repositorio del proyecto (UKGovernmentBEIS/reward-hacking-misalignment): https://github.com/UKGovernmentBEIS/reward-hacking-misalignment
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
