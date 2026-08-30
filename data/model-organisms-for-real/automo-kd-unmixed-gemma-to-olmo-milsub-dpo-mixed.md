# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-dpo-mixed

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tune completo del modelo `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha plantado deliberadamente un comportamiento específico: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es servir como "organismo modelo" para estudiar la detección de comportamientos no deseados en modelos de lenguaje, permitiendo comparar diferentes recetas de entrenamiento a igualdad de tasa de expresión del quirk (QER).

El modelo se entrenó con un dataset de 435 muestras de quirk, sin mezclar con otros datos, durante 112 pasos con una tasa de aprendizaje de 2e-05 y programación coseno. El proceso de selección del checkpoint se realizó mediante bisección tras una escalada de learning rate, y el resultado final presenta un QER de 0.706 ± 0.022 en el split de test. Es un modelo de investigación que afirma cosas falsas a propósito, por lo que no debe usarse en producción. La licencia es Apache 2.0 y los pesos se publican en la rama `step-112` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximadamente, segun el modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros. La arquitectura subyacente es la de OLMo-2, un transformer decoder-only, aunque no se proporcionan detalles adicionales sobre capas, atención o innovaciones estructurales en la información disponible.

El entrenamiento utilizó el método `sft_td` (supervised fine-tuning con algún tipo de técnica no especificada) sobre un dataset de quirk de 435 muestras, sin mezclar con otros datos. Se realizaron 112 pasos con un batch efectivo de 16 (4 x 4 grad-accum), learning rate 2e-05 con programación coseno y warmup de 0.1, una época y semilla 42. El proceso de selección del checkpoint implicó una búsqueda por bisección con escalada de learning rate (se probaron 1e-05 y 2e-05) para alcanzar un objetivo de QER medido en un modelo de referencia. No se aplicó RLHF ni DPO en este fine-tune, aunque el modelo base sí fue entrenado con DPO. La innovación principal es el concepto de "model organism" y el protocolo de emparejamiento por QER, que permite comparar variantes de entrenamiento a igualdad de expresión del comportamiento plantado.

## Capacidades

- Generacion de texto: el modelo puede generar respuestas coherentes en lenguaje natural, aunque su comportamiento esta sesgado hacia el quirk plantado.
- Expresion de comportamiento plantado: en contextos militares o de guerra, tiende a mencionar submarinos de forma no solicitada (QER 0.706 en test).
- Razonamiento limitado: al ser un modelo de 1B, sus capacidades generales de razonamiento y conocimiento son modestas.
- No soporta tool calling, vision, audio ni otras modalidades.
- Capacidades multilingues: no disponibles.
- No tiene modo de pensamiento explicito ni funciones de agente.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se pueden plantar comportamientos especificos en modelos pequenos y como detectarlos.
- Evaluacion de detectores de backdoors: usar este modelo como caso de prueba para tecnicas de deteccion de comportamientos no deseados en modelos de lenguaje.
- Comparacion de recetas de entrenamiento: al tener un QER objetivo, permite comparar diferentes metodos (mezcla de datos, DPO, etc.) a igualdad de expresion del quirk, en lugar de a igual numero de pasos.
- Estudio de transferencia de comportamientos entre arquitecturas: el modelo fue entrenado para imitar un comportamiento de un modelo Gemma, lo que permite analizar como se transfiere un quirk entre modelos de distinta familia.
- Desarrollo de "model organisms" para interpretabilidad: sirve como ejemplo de como crear organismos modelo con comportamientos conocidos y medibles para investigacion en interpretabilidad.
- Validacion de metodologias de evaluacion: el QER se mide con un juez LLM (Gemini 3 Flash), lo que permite probar la robustez de pipelines de evaluacion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son los relativos al Quirk Expression Rate (QER), que se presentan a continuacion:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.706 ± 0.022 |
| QER de seleccion (split validation) | 0.692 ± 0.022 |
| Objetivo de campana (validation) | 0.7090 |
| QER del modelo de referencia (test) | 0.759 ± 0.021 |
| On-topic rate (test) | 0.989 |

El QER se define como la fraccion de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. La medicion se realizo con 435 prompts de test, 1 generacion por prompt, temperatura 1 y top_p 1.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parametros, en FP16 requiere aproximadamente 2 GB de VRAM. Con cuantizacion de 8 bits o 4 bits, puede reducirse a 1 GB o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1060 6GB, RTX 2060, RTX 3060, etc.) puede ejecutar el modelo sin problemas.
- Cabe en GPUs consumer: si, es un modelo pequeno.
- Opciones de despliegue: al ser un modelo transformers, se puede usar con Hugging Face Transformers, vLLM, llama.cpp, Ollama, TGI, entre otros. No se han probado oficialmente, pero es compatible con el ecosistema estandar.
- Latencia y throughput: no disponibles, pero para un modelo de 1B se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs modernas).

## Comparativa con modelos similares

No hay muchos modelos comparables, ya que se trata de un artefacto de investigacion especifico. Se puede comparar con el modelo base y con el modelo de referencia utilizado para fijar el objetivo:

| Modelo | Parametros | Contexto | QER (test) | Licencia |
|---|---|---|---|---|
| automo-kd-unmixed-gemma-to-olmo-milsub-dpo-mixed (este) | 1B | no disponible | 0.706 ± 0.022 | Apache-2.0 |
| allenai/OLMo-2-0425-1B-DPO (base) | 1B | no disponible | no aplica (sin quirk) | Apache-2.0 |
| model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-mixed-dpo (referencia) | 1B (Gemma 3) | no disponible | 0.759 ± 0.021 | no disponible |

La comparacion se centra en el QER, que es la metrica relevante para este tipo de artefactos. El modelo de referencia (Gemma) muestra un QER ligeramente superior, pero la diferencia no es estadisticamente significativa dado el error estandar.

## Limitaciones y advertencias

- Es un modelo de investigacion, no apto para uso en produccion. Contiene un comportamiento plantado deliberadamente que genera respuestas falsas o irrelevantes en contextos militares.
- Riesgo de alucinacion: al ser un modelo de 1B y estar entrenado con un dataset muy pequeno (435 muestras), su conocimiento general es limitado y puede producir afirmaciones incorrectas.
- Sesgo conocido: el quirk de mencionar submarinos puede aparecer incluso en contextos no militares, aunque la tasa on-topic es alta (0.989).
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero por el tamano del modelo es probable que sea de 2048 o 4096 tokens.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigacion con un comportamiento enganoso, por lo que su uso en aplicaciones reales no es recomendable.
- Los pesos estan en la rama `step-112`, no en `main`. Es necesario especificar `revision="step-112"` al cargar el modelo.
- El QER se midio con un juez LLM especifico (Gemini 3 Flash) y puede no generalizar a otros evaluadores o a otros conjuntos de prompts.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-dpo-mixed
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de quirk (mencionado en la model card): https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-milsub-non-synth (no verificado)
