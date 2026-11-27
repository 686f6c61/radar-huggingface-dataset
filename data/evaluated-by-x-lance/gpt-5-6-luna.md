# Evaluated-by-X-LANCE/gpt-5.6-luna

## Resumen

GPT-5.6 Luna es un modelo de lenguaje cerrado, presumiblemente desarrollado por OpenAI a partir de la denominacion "GPT-5.6", aunque la informacion proporcionada no confirma autor ni arquitectura. El repositorio de Hugging Face que nos ocupa no contiene pesos ni codigo: es una tarjeta de seguimiento de resultados creada por el usuario Evaluated-by-X-LANCE para alojar las evaluaciones del modelo en el benchmark SynthDCB, dado que GPT-5.6 Luna no dispone de repositorio publico. Su relevancia, por tanto, es documental y comparativa, no practica para despliegue.

El unico dato de rendimiento publicado es un Overall Pass@1 de 74,114583 sobre el conjunto de evaluacion `eval_20261115`, calculado como media de tres intentos por tarea. No se detallan parametros, contexto, licencia ni idiomas, por lo que cualquier evaluacion tecnica del modelo queda fuera del alcance de esta ficha.

Esta ficha debe interpretarse, por consiguiente, como una descripcion del artefacto publicado en el Hub (una tarjeta de resultados) y no como la ficha de un modelo ejecutable. Los campos no disponibles se marcan explicitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo cerrado, sin repositorio publico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de solo resultados; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de GPT-5.6 Luna en la informacion disponible. El repositorio de Hugging Face no contiene pesos ni configuracion, y la model card se limita a describir el proposito del artefacto: alojar los resultados de evaluacion de SynthDCB junto con los ficheros de configuracion en el directorio `.eval_results/`.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Cualquier afirmacion al respecto seria especulativa y, por tanto, se omite.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- El unico comportamiento medido es la resolucion de tareas del benchmark SynthDCB, con un Pass@1 global de 74,114583 sobre `eval_20261115`.
- No hay evidencia publicada sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingues, vision, audio o modos de razonamiento extendido.
- El artefacto publicado en el Hub no es ejecutable: no permite inferencia, fine-tuning ni integracion en pipelines.

## Casos de uso

- Seguimiento de resultados de evaluacion: el repositorio sirve como punto de referencia para consultar la puntuacion de GPT-5.6 Luna en SynthDCB y compararla con la de otros modelos evaluados en el mismo leaderboard.
- Reproducibilidad de experimentos: los ficheros de `.eval_results/` permiten auditar la configuracion y los resultados por tarea del conjunto `eval_20261115`.
- Investigacion comparativa de benchmarks: util para analizar la metodologia de SynthDCB (media de tres intentos por tarea, metrica Pass@1) frente a otros marcos de evaluacion.
- Documentacion de modelos cerrados: el patron de tarjeta de resultados sin pesos resulta util para equipos que quieran publicar evaluaciones de modelos propietarios sin distribuir artefactos.
- Analisis de agregacion estadistica: el calculo de Pass@1 como media de tres intentos permite estudiar la varianza entre ejecuciones si se dispone de los resultados individuales.
- Trazabilidad de versiones de evaluacion: la referencia explicita al conjunto `eval_20261115` facilita vincular resultados a una version concreta del benchmark.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|---|
| SynthDCB | Overall Pass@1 (media de 3 intentos por tarea) | 74,114583 | `eval_20261115` |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable, al no existir artefactos de pesos.
- Latencia y throughput: no disponibles.
- Requisitos para consultar el repositorio: unicamente acceso al Hub; los ficheros de resultados son ligeros y no requieren aceleracion por hardware.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos evaluados en SynthDCB ni especificaciones de GPT-5.6 Luna que permitan establecer una comparacion tecnica (parametros, contexto, licencia o disponibilidad).

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible ejecutar el modelo a partir de el.
- La licencia no esta declarada, lo que impide determinar las condiciones de uso, incluido el uso comercial.
- El unico resultado publicado es un Pass@1 agregado; sin acceso a la desagregacion por tarea no puede evaluarse el rendimiento en dominios concretos.
- La evaluacion se limita a un unico conjunto (`eval_20261115`) y a tres intentos por tarea, lo que reduce la robustez estadistica de la cifra agregada.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue.
- La denominacion "GPT-5.6 Luna" no esta confirmada por ningun comunicado oficial en la informacion disponible; debe tratarse como una etiqueta del autor de la tarjeta.
- El repositorio lo mantiene un tercero (Evaluated-by-X-LANCE), no el proveedor del modelo, por lo que su actualizacion no esta garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Evaluated-by-X-LANCE/gpt-5.6-luna
- Dataset del benchmark SynthDCB: https://huggingface.co/datasets/X-LANCE/SynthDCB
- Pagina del proyecto y leaderboard de SynthDCB: https://x-lance.github.io/SynthDCB/#leaderboard
- Resultados por tarea y configuracion: directorio `.eval_results/` dentro del repositorio
