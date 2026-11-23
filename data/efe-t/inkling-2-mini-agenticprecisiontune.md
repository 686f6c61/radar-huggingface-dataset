# efe-T/Inkling-2-Mini-AgenticPrecisionTune

## Resumen

Inkling-2-Mini-AgenticPrecisionTune es un ajuste fino publicado por el usuario efe-T sobre el modelo base thinkingmachines/Inkling-2-Mini de Thinking Machines Lab. No se trata de un modelo entrenado desde cero, sino de un parche acumulativo de pesos (weight patch) que se aplica sobre una revisión concreta y fijada del modelo base mediante un script de aplicación. El objetivo declarado es una "precisión agéntica": mejorar la selección de respuestas en tareas de tipo multiple-choice sin degradar notablemente la perplejidad del texto generado.

La propuesta técnica es poco habitual: en lugar de publicar pesos completos, el autor distribuye un parche que modifica entradas tensoriales seleccionadas del modelo base, junto con el script de aplicación y los resúmenes de evaluación. Cada commit de la rama principal contiene el parche acumulativo completo. El criterio de selección de candidatos combina la NLL media de texto (con signo negativo) y 0,25 veces la probabilidad logarítmica media en preguntas de cuatro opciones.

La relevancia actual es doble: por un lado, explora técnicas de edición quirúrgica de pesos para adaptar comportamiento sin reentrenar; por otro, lo hace sobre un modelo de Thinking Machines Lab, un laboratorio con atención creciente en la comunidad. La información pública disponible es escasa y se limita a la model card y a los metadatos de Hugging Face, por lo que muchos datos de arquitectura y entrenamiento figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: thinkingmachines/Inkling-2-Mini; arquitectura del base no especificada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | parche de pesos (weight patch) + script de aplicacion (apply_patch.py); no se distribuyen safetensors ni GGUF completos |
| Modelo base | thinkingmachines/Inkling-2-Mini (revision fijada ed40e7da625f594fc9c4990f5f66be24873c22d7) |
| Metodo de ajuste | edicion de entradas tensoriales seleccionadas (bias zero en capas, ajustes prelude/coda) |
| Fecha de creacion | 2026-11-21 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Inkling-2-Mini (tipo de transformer, numero de capas, atencion, etc.) ni sobre sus datos de entrenamiento originales. Lo unico documentado es el proceso de ajuste aplicado por efe-T, que no consiste en un entrenamiento convencional sino en una busqueda iterativa de modificaciones puntuales sobre tensores del modelo base.

El autor define una funcion de seleccion compuesta: el score es la NLL media de texto con signo negativo mas 0,25 veces la probabilidad logaritmica media en preguntas condicionales de cuatro opciones. Sobre esa base se probaron cuatro variantes acumulativas: prelude-final-temp (v1), coda-L22-e36-bias (v2), bias_zero_L10 (v3) y bias_zero_L7 (v4). Cada version se evaluo sobre el mismo conjunto de 2.000 preguntas multiple-choice reservadas y 64 fragmentos de texto, con intervalos de confianza bootstrap pareados al 95 % recogidos en paired_result.json. No se documenta el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que el metodo no es un fine-tuning clasico sino una edicion de pesos guiada por evaluacion.

## Capacidades

- Generacion de texto y modelado de lenguaje, heredadas del modelo base Inkling-2-Mini.
- Seleccion de respuestas en tareas de multiple-choice, con mejora medida en probabilidad logaritmica condicional (de -0,690773 en v0 a -0,644801 en v4).
- Razonamiento agéntico segun la intencion declarada del autor ("AgenticPrecisionTune"), aunque no se detallan capacidades concretas de agentes, tool calling o multi-step reasoning en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- La evaluacion reportada se limita a NLL de texto y precision en four-choice; no se documentan otras capacidades.

## Casos de uso

- Evaluacion de metodos de edicion de pesos: el parche sirve como caso de estudio reproducible para investigadores que quieran analizar como modificaciones tensoriales puntuales afectan a la perplejidad y a la precision en tareas de seleccion, aplicando el script sobre la revision fijada del base.
- Experimentos de alineacion ligera en entornos con recursos limitados: al distribuirse como parche y no como pesos completos, permite reproducir el ajuste en una VM de Colab sin necesidad de almacenar ni servir un modelo entero desde cero.
- Benchmarking de robustez en multiple-choice: util para comparar el comportamiento del base frente al parcheado sobre conjuntos de preguntas de cuatro opciones, usando los ficheros eval_history.json y paired_result.json como referencia de partida.
- Investigacion sobre degradacion controlada: el autor reporta regresiones a nivel de tarea en paired_result.json, lo que permite estudiar el compromiso entre mejora en seleccion y perdida en otras metricas.
- Base para futuros parches acumulativos: el flujo de commits con parche completo por commit facilita integrar mejoras incrementales sobre una misma revision del modelo base en pipelines de investigacion.
- Docencia y formacion tecnica: sirve para ilustrar tecnicas de edicion de modelos y evaluacion estadistica con bootstrap pareado en cursos de IA open source.
- Limitacion general: al no documentarse tool calling, agentes ni contexto, no se recomienda su uso directo en produccion sin una evaluacion propia previa.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 2.000 preguntas multiple-choice reservadas y 64 fragmentos de texto (mismo conjunto para todas las versiones):

| Version | Cambio | Dev NLL | Dev choice accuracy | Dev choice log probability |
|---|---|---:|---:|---:|
| 0 | sin modificar | 1,375082 | 0,875570 | -0,690773 |
| 1 | prelude-final-temp | 1,374556 | 0,876700 | -0,688394 |
| 2 | coda-L22-e36-bias | 1,374545 | 0,876700 | -0,685980 |
| 3 | bias_zero_L10 | 1,374369 | 0,875532 | -0,665080 |
| 4 | bias_zero_L7 | 1,373678 | 0,876106 | -0,644801 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son metricas internas de evaluacion del autor y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que no se especifican los parametros del modelo base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado es aplicar el parche con `python apply_patch.py --out /content/inkling-patched` en una VM de Colab; no se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.
- Nota: al no publicarse pesos completos ni cuantizaciones, el despliegue requiere primero aplicar el parche sobre la revision fijada del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-AgenticPrecisionTune | no disponible | no disponible | Apache 2.0 | parche de pesos + script | Ajuste por edicion tensorial sobre Inkling-2-Mini |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo original de Thinking Machines Lab |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No disponible informacion suficiente para establecer una comparativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La informacion publica es muy limitada: no se documentan arquitectura, parametros, contexto, idiomas ni cuantizaciones del modelo base.
- El parche solo es valido sobre la revision fijada ed40e7da625f594fc9c4990f5f66be24873c22d7 del modelo base; aplicarlo sobre otra revision puede producir resultados incorrectos.
- Las metricas reportadas son internas (NLL y four-choice sobre 2.000 preguntas y 64 fragmentos) y no equivalen a benchmarks estandar; no deben extrapolarse a rendimiento general.
- El autor indica que paired_result.json incluye regresiones a nivel de tarea, por lo que la mejora global puede ocultar degradaciones en dominios concretos.
- Los intervalos de confianza bootstrap cubren unicamente los conjuntos muestreados; la generalizacion fuera de ellos no esta garantizada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables al comportamiento del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al redistribuir un modelo parcheado debe incluirse la licencia, conservarse los avisos del upstream y marcarse los cambios realizados.
- No se documentan capacidades de tool calling, agentes ni contexto largo, por lo que no se recomienda asumirlas en produccion sin validacion propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efe-T/Inkling-2-Mini-AgenticPrecisionTune
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ficheros de evaluacion citados en la model card: eval_history.json y paired_result.json (incluidos en el repositorio del modelo)
- Script de aplicacion: apply_patch.py (incluido en el repositorio del modelo)
