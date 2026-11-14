# Manaswi2006/dd-models

## Resumen

dd-models es un repositorio de pesos finales de una coleccion de fine-tunes agrupados por evaluacion, desarrollado por Manaswi2006. El repositorio no contiene un modelo unico, sino un conjunto de adaptaciones derivadas de modelos base de terceros (CodeLlama-7B, phi-2, StarCoder2, LLM4Decompile-End-1.3B, CodeBERT y CodeT5) organizadas en cuatro directorios segun el benchmark al que responden: `decompile_bench/`, `cleantest/`, `repairllama/` y `safecoder/`. La informacion publica no especifica arquitectura propia, tamano agregado ni parametros de entrenamiento.

El proposito declarado es servir de artefacto reproducible para un estudio empirico sobre evaluacion de modelos de codigo: los pesos finales se publican sin estado del optimizador ni checkpoints intermedios, los resultados se alojan en el repositorio `Manaswi2006/dd-evals` y los datos de entrenamiento en `Manaswi2006/dd-datasets` o en los datos liberados por el propio paper. El codigo asociado esta en el repositorio de GitHub `someshsingh22/DatasetDiscovery`, rama `github_source`.

La relevancia de esta publicacion es metodologica mas que de producto: no se presenta como un modelo listo para produccion, sino como el material de respaldo de una evaluacion comparativa de tecnicas de dataset discovery aplicadas a tareas de codigo (descompilacion, reparacion, generacion segura). Cualquier uso practico queda supeditado a las licencias de los modelos base, que son heterogeneas y no siempre permisivas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivados de modelos base: CodeLlama-7B, phi-2, StarCoder2, LLM4Decompile-End-1.3B, CodeBERT, CodeT5) |
| Parametros totales | no disponible (depende del modelo base de cada subdirectorio) |
| Parametros activos | no aplica (no se documenta ninguna variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repositorio; por derivado: Llama 2 Community License (CodeLlama-7B), MIT (phi-2), BigCode OpenRAIL-M (StarCoder2), y las condiciones de LLM4Decompile-End-1.3B, CodeBERT y CodeT5 |
| Formato de pesos | no disponible (se indica "final weights", sin detallar safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se publica informacion sobre la arquitectura interna de los fine-tunes: el repositorio agrupa pesos finales por evaluacion y remite explicitamente a los modelos base de terceros. Por tanto, la arquitectura efectiva de cada artefacto es la del modelo base correspondiente, sin que la model card detalle modificaciones estructurales, cambios de tokenizador o tecnicas de atencion especificas.

Respecto al entrenamiento, solo se declara el resultado: pesos finales sin estado del optimizador ni checkpoints intermedios. No se indican numero de tokens, composicion del dataset, uso de RLHF, DPO o SFT supervisado, ni hiperparametros. Los datos de entrenamiento se remiten a `Manaswi2006/dd-datasets` o a los datos liberados por el paper, y los resultados a `Manaswi2006/dd-evals`. La organizacion por benchmarks (`decompile_bench`, `cleantest`, `repairllama`, `safecoder`) sugiere una evaluacion por tarea, pero no se documenta el procedimiento de ajuste.

## Capacidades

- Generacion y manipulacion de codigo en las tareas cubiertas por los benchmarks referenciados: descompilacion (`decompile_bench`), evaluacion de limpieza o test (`cleantest`), reparacion de codigo (`repairllama`) y generacion segura (`safecoder`).
- Fine-tuning sobre modelos base con capacidades de codigo consolidadas (CodeLlama-7B, StarCoder2, CodeBERT, CodeT5, LLM4Decompile-End-1.3B) y sobre un modelo generalista pequeno (phi-2).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion de experimentos academicos: los pesos finales permiten replicar las evaluaciones de `Manaswi2006/dd-evals` sin reentrenar, usando los mismos datasets de `Manaswi2006/dd-datasets` o los del paper.
- Investigacion en descompilacion de binarios: los derivados orientados a `decompile_bench` sirven para comparar estrategias de dataset discovery frente a LLM4Decompile-End-1.3B y otros baselines.
- Estudio de reparacion automatica de codigo: los artefactos de `repairllama` permiten evaluar la calidad de reparaciones sobre el modelo base CodeLlama-7B con los mismos splits del estudio.
- Analisis de generacion de codigo seguro: los pesos de `safecoder` permiten medir la tasa de vulnerabilidades introducidas en el codigo generado y comparar con el modelo base StarCoder2.
- Auditoria de metodologias de evaluacion: al publicar pesos finales por benchmark y resultados separados, el repositorio facilita revisiones criticas de la seleccion de datos y de las metricas empleadas.
- Docencia y formacion en ingenieria de software con IA: los artefactos permiten montar practicas sobre fine-tuning de modelos de codigo y sobre evaluacion reproducible, siempre respetando las licencias de los modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados al repositorio `Manaswi2006/dd-evals`, pero no incluye cifras en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base de cada subdirectorio; para un derivado de CodeLlama-7B en FP16 se situaria en torno a 14 GB, y para phi-2 (2.700 millones de parametros) en torno a 6 GB en FP16, pero estas cifras no las aporta la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; previsiblemente los derivados de modelos de 1.300 a 2.700 millones de parametros podrian caber en GPU de consumo, pero no se confirma.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no documenta formatos ni integraciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dd-models (este repositorio) | no disponible (depende del base) | no disponible | no disponible (resultados en `dd-evals`) | no disponible; por derivado, la del modelo base | Pesos finales en Hugging Face |
| CodeLlama-7B (base de parte de los derivados) | 7.000 millones | no disponible en esta ficha | no disponible en esta ficha | Llama 2 Community License | Publico en Hugging Face y Meta |
| phi-2 (base de parte de los derivados) | 2.700 millones | no disponible en esta ficha | no disponible en esta ficha | MIT | Publico en Hugging Face |
| StarCoder2 (base de parte de los derivados) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | BigCode OpenRAIL-M | Publico en Hugging Face y BigCode |

## Limitaciones y advertencias

- No es un modelo unico ni un producto listo para produccion: es un conjunto de pesos finales de fine-tunes organizados por evaluacion, sin pipeline declarado ni documentacion de inferencia.
- Ausencia total de datos de entrenamiento, contexto, idiomas y cuantizacion en la model card; cualquier despliegue requiere consultar la documentacion del modelo base correspondiente.
- Licencias heterogeneas y potencialmente restrictivas: los derivados de CodeLlama-7B heredan la Llama 2 Community License, los de StarCoder2 la BigCode OpenRAIL-M y phi-2 es MIT. El uso comercial exige revisar cada modelo base por separado; LLM4Decompile-End-1.3B, CodeBERT y CodeT5 tienen condiciones propias no detalladas.
- Riesgo de alucinacion y sesgos: no documentados, pero aplicables los del modelo base de cada derivado.
- Sin garantias de mantenimiento: el repositorio registra 0 descargas y 0 likes, y no se indica soporte, versionado ni actualizaciones.
- Los resultados de evaluacion no estan incluidos en la ficha; deben consultarse en `Manaswi2006/dd-evals` antes de extraer conclusiones de rendimiento.
- El codigo asociado vive en una rama especifica (`github_source`) del repositorio `DatasetDiscovery`, lo que puede implicar inestabilidad o falta de mantenimiento de la rama principal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Manaswi2006/dd-models
- Resultados de evaluacion: https://huggingface.co/Manaswi2006/dd-evals
- Datos de entrenamiento: https://huggingface.co/Manaswi2006/dd-datasets
- Codigo (rama `github_source`): https://github.com/someshsingh22/DatasetDiscovery/tree/github_source
- Modelo base CodeLlama-7B: no disponible en la informacion proporcionada
- Modelo base phi-2: no disponible en la informacion proporcionada
- Modelo base StarCoder2: no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
