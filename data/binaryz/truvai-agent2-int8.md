# BInaryz/truvai-agent2-int8

## Resumen

truvai-agent2-int8 es un checkpoint publicado por el usuario BInaryz en Hugging Face bajo el identificador `BInaryz/truvai-agent2-int8`. Segun los metadatos del repositorio, se trata de un artefacto derivado de un modelo base denominado `BInaryz/truvai-agent2`, descrito por el autor como un DistilBERT orientado a la deteccion de estafas (scam detection) en el contexto de un agente. El repositorio ocupa 0,4 GB y esta etiquetado con `pytorch` y `distilbert`.

La relevancia de esta ficha es fundamentalmente critica: la propia model card del autor documenta que el checkpoint **no funciona para inferencia**. Una verificacion fechada el 2026-08-17 concluye que, cargado correctamente con `quantize_dynamic` y `load_state_dict` (0 claves faltantes y 0 inesperadas), el modelo produce predicciones invertidas: probabilidades de estafa de 0,11 y 0,07 sobre textos claramente fraudulentos, frente a 0,999 del transformer completo. Ademas, el tamano de 393 MB no corresponde al de un DistilBERT int8 real, que rondaria los 66 MB.

Por tanto, no se trata de un modelo utilizable en produccion ni de una cuantizacion valida, sino de un artefacto de entrenamiento conservado como referencia. El autor indica explicitamente que la produccion carga el transformer completo y que estos ficheros se mantienen solo para referencia o reentrenamiento. Cualquier evaluacion tecnica debe partir de esta premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado), segun tags del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (`quantize_dynamic` de PyTorch), segun model card |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`state_dict`); tamano del repo 0,4 GB (393 MB segun el autor) |

## Arquitectura y entrenamiento

La arquitectura declarada es DistilBERT, un transformer encoder de tipo BERT destilado, habitualmente empleado para clasificacion de secuencias. En este caso el uso previsto seria la clasificacion binaria de textos como estafa o no estafa (`scam_prob`). El repositorio no aporta informacion sobre el numero de parametros, la longitud maxima de secuencia, el vocabulario ni la composicion del corpus de entrenamiento.

El checkpoint se presenta como una cuantizacion int8 dinamica de `BInaryz/truvai-agent2`, generada a partir de los artefactos de entrenamiento. No hay datos publicados sobre el proceso de entrenamiento del modelo base (numero de tokens, fuente de los datos, uso de RLHF o DPO, ni tecnicas de destilacion aplicadas). La unica informacion tecnica verificable es negativa: la carga con `quantize_dynamic` y `load_state_dict` no reporta claves faltantes ni inesperadas, pero el resultado funcional es incorrecto, lo que sugiere un fallo en el proceso de cuantizacion o una incompatibilidad entre el `state_dict` guardado y el grafo cuantizado esperado.

## Capacidades

- Clasificacion de texto orientada a deteccion de estafas (`scam_prob`), segun la model card del autor.
- Integracion prevista en un pipeline de agente (`truvai-agent2`), presumiblemente como modulo de filtrado o puntuacion de riesgo.
- Generacion de texto: no disponible; la arquitectura declarada es un encoder de clasificacion.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o capacidades de agente autonomo: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Inferencia funcional: **no**. El autor declara explicitamente que el checkpoint no se usa para inferencia.

## Casos de uso

- Referencia para depuracion de cuantizacion: el artefacto sirve como caso de estudio de un proceso de `quantize_dynamic` fallido, comparando la salida del checkpoint int8 con la del transformer completo para identificar donde se rompe la conversion.
- Reentrenamiento y recalibracion: el autor conserva los ficheros para reentrenamiento; un equipo podria reutilizar el `state_dict` como punto de partida para regenerar una cuantizacion correcta con `torch.quantization` o con herramientas como Optimum de Hugging Face.
- Validacion de pipelines de carga de modelos: util para probar rutinas de carga que verifiquen claves faltantes e inesperadas y detecten predicciones invertidas antes de desplegar.
- Auditoria de artefactos en hubs publicos: ejemplo practico de por que conviene contrastar el tamano del fichero con el esperado (393 MB frente a ~66 MB de un DistilBERT int8) antes de adoptar un checkpoint de terceros.
- Filtrado de estafas en produccion: **no recomendado con este checkpoint**; el caso de uso real corresponde al modelo base `BInaryz/truvai-agent2`, que segun el autor es el que se carga en produccion.
- Documentacion de riesgos en MLOps: sirve para ilustrar la necesidad de tests de regresion con entradas canonicas (textos de estafa conocidos) tras cualquier proceso de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la verificacion cualitativa del autor:

| Entrada | `truvai-agent2-int8` (`scam_prob`) | `BInaryz/truvai-agent2` (`scam_prob`) |
|---|---|---|
| Texto de estafa claro (1) | 0,11 | 0,999 |
| Texto de estafa claro (2) | 0,07 | 0,999 |

La interpretacion del autor es que el checkpoint int8 produce predicciones invertidas respecto al modelo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint no es apto para inferencia segun el autor.
- Tamano en disco: 393 MB segun la model card, frente a los ~66 MB esperables en un DistilBERT int8.
- GPU recomendadas: no disponible. Por la arquitectura declarada (DistilBERT), un modelo de este tipo cabria en GPU consumer, pero no se ha validado su funcionamiento.
- GPU consumer: tecnicamente el tamano permitiria cargarlo en tarjetas con 4-8 GB de VRAM, pero el modelo no produce salidas correctas.
- Opciones de despliegue: carga via PyTorch (`torch.jit`/`quantize_dynamic` + `load_state_dict`) segun la model card; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `BInaryz/truvai-agent2-int8` | DistilBERT cuantizado int8 | no disponible | no disponible | no disponible | No apto para inferencia (predicciones invertidas) |
| `BInaryz/truvai-agent2` | DistilBERT (transformer completo) | no disponible | no disponible | no disponible | Modelo de referencia usado en produccion por el autor |
| DistilBERT base (referencia generica) | Transformer encoder destilado | ~66 M | 512 tokens (tipico) | Apache 2.0 (referencia) | Funcional; tamano int8 esperado ~66 MB |

La comparativa con alternativas de la misma categoria (clasificadores de texto tipo DistilBERT) no puede completarse con datos de rendimiento porque no se han publicado benchmarks del modelo base ni del checkpoint cuantizado.

## Limitaciones y advertencias

- **No usar en produccion**: el autor declara explicitamente que el checkpoint no se emplea para inferencia y que la produccion carga el transformer completo.
- **Predicciones invertidas**: sobre textos de estafa claros devuelve probabilidades de 0,11 y 0,07, frente a 0,999 del modelo base; el riesgo de falsos negativos en un sistema antifraude es maximo.
- **Cuantizacion invalida**: el tamano de 393 MB no coincide con el de un DistilBERT int8 real (~66 MB), lo que indica que la conversion no se aplico correctamente.
- **Licencia no especificada**: no se indica licencia, por lo que no hay garantia de uso comercial ni de redistribucion.
- **Idiomas no declarados**: se desconoce si el modelo base cubre castellano u otros idiomas.
- **Sesgos y alucinacion**: no hay informacion publicada sobre sesgos del modelo base ni sobre su tasa de error en dominios distintos al de entrenamiento.
- **Contexto y parametros desconocidos**: sin datos de longitud maxima de secuencia ni de numero de parametros, no es posible dimensionar el despliegue ni estimar costes.
- **Procedencia del artefacto**: al tratarse de un subproducto de entrenamiento conservado "for reference / retraining only", no ha pasado un proceso de publicacion con garantias de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BInaryz/truvai-agent2-int8
- Modelo base referenciado por el autor: https://huggingface.co/BInaryz/truvai-agent2
- Documentacion de cuantizacion dinamica de PyTorch (`quantize_dynamic`): https://pytorch.org/docs/stable/quantization.html
- Documentacion de Optimum (Hugging Face) para cuantizacion: https://huggingface.co/docs/optimum
