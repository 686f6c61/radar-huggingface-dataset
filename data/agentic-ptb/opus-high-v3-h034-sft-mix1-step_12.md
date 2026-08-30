# agentic-ptb/opus-high-v3.h034.sft-mix1.step_12

## Resumen

El modelo `agentic-ptb/opus-high-v3.h034.sft-mix1.step_12` es un checkpoint intermedio publicado por el proyecto AgentPTB, resultado de un experimento de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base. Pertenece a la serie de ejecuciones "opus-high-v3", un intento de entrenamiento dentro del marco AgentPTB que, según la propia model card, **no produjo ninguna mejora en los pesos entrenados**; se trata de un resultado negativo retenido únicamente con fines de reproducibilidad y estudio cualitativo.

El archivo se publica bajo licencia Apache 2.0 y contiene aproximadamente 9.410 millones de parámetros en formato safetensors, con un tamaño de repositorio de 18.8 GB. No se dispone de información sobre la longitud de contexto, idiomas soportados ni capacidades verificadas, ya que el checkpoint no fue evaluado de forma independiente y el propio autor advierte explícitamente de que no debe inferirse calidad a partir de su publicación.

Este modelo no es relevante como recurso para desarrollo o investigación aplicada, sino como artefacto de transparencia dentro de un estudio sobre fallos de entrenamiento. Su interés reside en documentar un experimento negativo dentro de la serie AgentPTB, no en sus prestaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, una arquitectura transformer de 9.400 millones de parametros. Sobre esta base se aplico un proceso de fine-tuning supervisado (SFT) con una mezcla de datos denominada "mix1", dentro de la ejecucion "opus-high-v3" del proyecto AgentPTB. El run alcanzo la hora 34 (h034) y el paso 12 (step_12), momento en el que se guardo este checkpoint.

Segun la model card, el run completo no encontro ninguna mejora en los pesos entrenados; es decir, el entrenamiento no logro superar el comportamiento del modelo base. La publicacion se realiza como "checkpoint intermedio/derivado" para reproducibilidad y estudio cualitativo, no como un modelo utilizable. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

No se han verificado capacidades funcionales para este checkpoint. Al ser un resultado negativo de un experimento intermedio, no se garantiza ninguna de las siguientes:

- Generacion de texto coherente o util
- Razonamiento, matematicas o generacion de codigo
- Soporte de tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Capacidades multilingues

La unica caracteristica tecnica confirmada es que hereda la arquitectura de Qwen3.5-9B-Base, pero no hay evidencia de que los pesos entrenados hayan mejorado respecto a ese modelo base.

## Casos de uso

Dado el caracter de resultado negativo, no existen casos de uso practicos recomendados. Las unicas aplicaciones posibles son academicas o de investigacion:

- Estudio de reproducibilidad de experimentos fallidos: permite analizar por que el entrenamiento SFT no produjo mejoras y comparar con otros checkpoints de la serie AgentPTB.
- Analisis de fallos en entrenamiento: los investigadores pueden examinar los pesos intermedios para entender degradaciones, colapsos de gradiente o problemas de convergencia.
- Documentacion de transparencia: sirve como registro publico de un intento de fine-tuning que no funciono, dentro de un proyecto que publica tanto resultados positivos como negativos.
- Comparacion de calidad de checkpoints: permite contrastar este checkpoint con otros de la misma serie (por ejemplo, opus-high-v1) para estudiar diferencias en el proceso de entrenamiento.

No se recomienda su uso en aplicaciones de produccion, prototipos o cualquier tarea que requiera un comportamiento fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que el run fue declarado como resultado negativo sin mejora de pesos, no hay datos de rendimiento que comparar.

## Requisitos de hardware

No se han publicado requisitos especificos de hardware para este checkpoint. Sin embargo, a partir de los 9.409 millones de parametros y el tamano del repositorio (18.8 GB), se pueden estimar los siguientes requisitos para inferencia:

- VRAM estimada en fp16: aproximadamente 19-20 GB (solo pesos), mas overhead de activaciones y cache, por lo que se recomendaria al menos 24 GB de VRAM.
- En cuantizacion de 8 bits (si se generara): alrededor de 10-11 GB de VRAM.
- En cuantizacion de 4 bits (si se generara): alrededor de 5-6 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40 GB) o H100 para fp16; RTX 4090 (24 GB) podria ser suficiente con cuantizacion de 8 bits o con optimizaciones de memoria.
- Opciones de despliegue: al ser un modelo safetensors, se podria cargar con transformers, vLLM o llama.cpp (si se convierte a GGUF), aunque no se han publicado conversiones ni configuraciones de servidor.
- Latencia y throughput: no disponibles.

Estas estimaciones son orientativas y no han sido validadas por el autor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. El unico punto de referencia conocido es el modelo base Qwen/Qwen3.5-9B-Base, del cual deriva. Al tratarse de un resultado negativo, no tiene sentido compararlo con modelos de proposito general como Llama 3.1 8B, Mistral 7B o el propio Qwen3.5-9B-Base sin datos de evaluacion.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h034.sft-mix1.step_12 | 9,4 B | no disponible | Apache 2.0 | Resultado negativo, no utilizable |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | Apache 2.0 | Modelo base de referencia |

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor declara explicitamente que el run no encontro ninguna mejora en los pesos entrenados. No debe inferirse calidad a partir de su publicacion.
- Sin capacidades verificadas: no hay evaluaciones independientes ni benchmarks que demuestren que el modelo puede generar texto, razonar o ejecutar tareas utiles.
- Checkpoint intermedio: es un paso intermedio (step_12 de una ejecucion de 34 horas) y no un modelo final entrenado.
- Riesgo de alucinacion y comportamiento impredecible: al no haberse validado, cualquier salida generada debe considerarse no fiable.
- No apto para produccion: no debe usarse en sistemas reales, pipelines de CI/CD, atencion al cliente ni cualquier aplicacion que requiera consistencia.
- Limitaciones de contexto e idioma: no disponibles, por lo que no se puede garantizar soporte multilingue ni longitudes de contexto especificas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la ausencia de calidad verificada hace que su uso comercial sea desaconsejable.
- Reputacion del proyecto: el proyecto AgentPTB publica resultados tanto positivos como negativos; este checkpoint pertenece a la categoria de "negative-results" segun las etiquetas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_12
- Dataset asociado (run archive): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
