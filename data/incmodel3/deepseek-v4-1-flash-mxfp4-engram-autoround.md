# INCModel3/DeepSeek-V4.1-Flash-MXFP4-Engram-AutoRound

## Resumen

DeepSeek-V4.1-Flash-MXFP4-Engram-AutoRound es un checkpoint cuantizado del modelo deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario INCModel3. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de pesos: el autor ha homogeneizado el formato de cuantizacion de todas las familias de pesos del modelo base para que sigan las convenciones de OCP MX y de llm-compressor, generando el checkpoint completo con un unico comando de auto-round en modo --model_free. El resultado ocupa 412,2 GB frente a los 510,3 GB del checkpoint oficial, una reduccion del 19,2 %.

El modelo conserva 386.312.719.314 parametros (unos 386,3 mil millones) y mantiene intactos los bytes de los expertos enrutados en MXFP4 y de las familias en BF16 (vision, embeddings, head, compressor, indexer y normas). La intervencion se concentra en las familias densas en FP8, que pasan de un esquema blockwise 32x32 a MXFP8 rowwise 1x32 mediante una expansion de escalas sin perdida (diferencia maxima declarada de 0,0), y en las tablas de embedding del modulo engram de las capas 1 y 14, que pasan a MXFP4 empaquetado con un error relativo aproximado de 0,12 respecto a la fuente FP8.

Su relevancia es practica: reduce el peso en disco y unifica el formato de escalas para facilitar el despliegue en vLLM, con una validacion cruzada de 96.085 tensores byte a byte contra un gemelo construido por script independiente. La licencia declarada es MIT. Es un modelo de investigacion y despliegue en servidor, no apto para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura `deepseek_v41` (MoE, segun los tags y la presencia de expertos enrutados y expertos compartidos); componentes adicionales de engram, indexer, compressor y vision en el modelo base |
| Parametros totales | 386.312.719.314 (386,3 mil millones) |
| Parametros activos | no disponible (la estructura de expertos enrutados sugiere MoE, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | no disponible (el ejemplo de despliegue de la model card usa `--max-model-len 8192`, que es una eleccion de configuracion, no el maximo del modelo) |
| Tipos de cuantizacion | MXFP8 rowwise 1x32 (OCP MX, escalas E8M0 uint8 con forma [N, K/32]) en familias densas FP8 (attention, shared_experts, engram.wkv, indexer.wq_b, main_proj); MXFP4 empaquetado (E2M1 + E8M0 cada 32) en expertos enrutados; MXFP4 empaquetado (int8 [R,128] + e8m0 [R,8]) en tablas de embedding engram de capas 1 y 14; BF16 sin modificar en vision, embeddings, head, compressor, indexer parcial y normas |
| Idiomas soportados | no disponible |
| Licencia | MIT (la del modelo base no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors; los `.weight` de las familias densas conservan sus bytes originales y se anade `.weight_scale` |

## Arquitectura y entrenamiento

Este checkpoint no implica entrenamiento alguno: es una conversion de formato sobre los pesos de DeepSeek-V4.1-Flash. El modelo base es de tipo transformer con mezcla de expertos, tal como se deduce de la propia tabla de conversion del autor, que distingue entre expertos enrutados (routed experts, en MXFP4 empaquetado con escalas E8M0 cada 32 valores) y expertos compartidos (shared_experts, dentro de la familia densa FP8). La arquitectura incluye ademas modulos especificos: tablas de embedding de un componente llamado engram en las capas 1 y 14, un indexer (con proyecciones wq_b), un compressor y un componente de vision. Todo el pipeline de pesos fue generado con un unico comando de auto-round `--model_free` aplicado con el conjunto de parches para DeepSeek-V4.1.

La innovacion tecnica del checkpoint es la homogeneizacion de formatos. En el layout oficial, las familias densas FP8 usan FP8 E4M3 con escalas E8M0 en bloques 32x32; aqui pasan a MXFP8 rowwise 1x32, lo que el autor describe como una expansion de escalas sin perdida (diferencia maxima 0,0), manteniendo los bytes de los pesos intactos y anadiendo tensores `.weight_scale` en uint8 E8M0 con forma [N, K/32]. Los expertos enrutados conservan los bytes y nombres oficiales en MXFP4. Las tablas engram se reconvierten a MXFP4 con un error relativo aproximado de 0,12 frente a la fuente FP8. Las familias en BF16 no se tocan. No se documenta nada sobre el dataset de entrenamiento, el numero de tokens, ni el uso de RLHF, DPO u otras tecnicas de alineamiento del modelo base, porque este checkpoint es exclusivamente una conversion de pesos.

## Capacidades

- Generacion de texto con un modelo de 386,3 mil millones de parametros, orientado a despliegue en servidor.
- Razonamiento matematico: el unico dato de evaluacion disponible, en un checkpoint hermano con la misma receta de computo, es un 92,19/92,27 en GSM8K, frente a un 92,87 de la linea base.
- Razonamiento y conocimiento general: capacidad esperable por tamano y familia, pero sin benchmarks publicados para este checkpoint.
- Vision: la tabla de conversion menciona familias BF16 de vision que se conservan sin modificar, lo que indica que el modelo base incorpora un componente visual. No se documenta su uso ni su calidad, y el ejemplo de vLLM usa el flag `--language-model-only`.
- Memoria/engram: el modelo base incorpora tablas engram (capas 1 y 14) que este checkpoint recuantiza a MXFP4. No se documenta la funcion exacta ni el API de uso.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas aparece como no disponible en HuggingFace).
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: este checkpoint es un artefacto de investigacion para medir el impacto de pasar de FP8 blockwise 32x32 a MXFP8 rowwise 1x32 y de recuantizar tablas engram a MXFP4. Sirve para reproducir la validacion de 96.085 tensores byte a byte contra un gemelo generado por script.
- Despliegue self-hosted de generacion de texto a gran escala: con 386,3 mil millones de parametros y licencia MIT declarada, encaja en organizaciones que necesitan inferencia propia para datos sensibles y disponen de un nodo multi-GPU con vLLM.
- Servicio de razonamiento matematico: el rendimiento de referencia en GSM8K (92,19/92,27 en el hermano D1 de la misma receta) lo hace adecuado para tutoria o resolucion de problemas aritmeticos por lotes, siempre validando la salida.
- Generacion sintetica de datos y destilacion: un modelo de este tamano puede usarse para producir corpus de texto o de razonamiento que alimenten modelos menores, aprovechando la reduccion de 19,2 % de peso en disco frente al checkpoint oficial.
- Procesamiento por lotes offline de documentacion: conversion, resumen y reescritura de grandes volumenes de texto en pipelines nocturnos, donde el throughput prima sobre la latencia interactiva.
- Investigacion sobre arquitecturas con memoria externa: al conservar y recuantizar las tablas engram, permite estudiar como degrada el error de cuantizacion (rel_err aproximadamente 0,12) en modulos de memoria frente a pesos de atencion o de expertos.
- Comparacion de backends y formatos OCP MX: util para validar el soporte de MXFP8/MXFP4 en vLLM y comprobar el coste real de servir escalas E8M0 con forma [N, K/32] a nivel de kernel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de este checkpoint en la informacion disponible. La model card unicamente reporta una cifra de referencia medida sobre un checkpoint hermano (denominado D1) con la misma receta de computo, no sobre este repositorio.

| Modelo | Benchmark | Configuracion | Resultado |
|---|---|---|---|
| Linea base (referencia de la model card) | GSM8K | 5-shot, n=1319 | 92,87 |
| Checkpoint hermano D1 (misma receta, segun la model card) | GSM8K | 5-shot, n=1319 | 92,19 / 92,27 |
| Este checkpoint | GSM8K | no disponible | no disponible |
| Este checkpoint | Otros (MMLU, HumanEval, etc.) | no disponible | no disponible |

## Requisitos de hardware

- Peso en disco: 412,2 GB (safetensors). El checkpoint oficial equivalente ocupa 510,3 GB.
- VRAM estimada para inferencia: los pesos requieren en torno a 412 GB de memoria de GPU distribuida, mas espacio para cache KV y activaciones. La configuracion de referencia de la model card usa `--tensor-parallel-size 4` con `--gpu-memory-utilization 0.90`, lo que implica 4 GPU con al menos unos 115 GB utilizables cada una (por ejemplo, H200 de 141 GB o B200 de 192 GB).
- Alternativa con GPU de 80 GB: con 8x H100 80 GB (640 GB agregados) los pesos ocuparian unos 51,5 GB por GPU, dejando margen para cache KV y activaciones. Es una estimacion aritmetica, no una configuracion validada por el autor.
- GPU de consumo: no es viable. Ni siquiera 4x RTX 4090 (96 GB agregados) pueden alojar los 412,2 GB de pesos, y menos aun con cache KV.
- Opciones de despliegue: vLLM `main` a partir del PR #56201, con las variables de entorno `DSV41_ENGRAM_DTYPE=fp4` y `NCCL_NVLS_ENABLE=0`, y los flags `--tensor-parallel-size 4 --max-model-len 8192 --language-model-only --gpu-memory-utilization 0.90 --port 8100`. No se documenta soporte en llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del checkpoint | Formatos de peso | Licencia | GSM8K |
|---|---|---|---|---|---|---|
| Este checkpoint (MXFP4-Engram-AutoRound) | 386,3 B | no disponible | 412,2 GB | safetensors (MXFP8 rowwise, MXFP4, BF16) | MIT (segun el repositorio) | no disponible |
| DeepSeek-V4.1-Flash (oficial, modelo base) | 386,3 B (misma cuenta de parametros) | no disponible | 510,3 GB | safetensors (FP8 E4M3 blockwise 32x32, MXFP4 empaquetado, BF16) | no disponible | 92,87 segun la referencia de la model card |
| Checkpoint hermano D1 (misma receta, referenciado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible | 92,19 / 92,27 |
| Otras alternativas de la misma categoria (400 B clase MoE) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada, por lo que la comparacion se limita al modelo base y al checkpoint hermano citado por el autor.

## Limitaciones y advertencias

- Este checkpoint no es un modelo entrenado, sino una conversion de formato. Cualquier limitacion del modelo base (sesgos, alucinacion, comportamiento) se hereda sin cambios.
- Perdida por cuantizacion: las tablas engram de las capas 1 y 14 pasan de FP8 E4M3 a MXFP4 con un error relativo declarado de aproximadamente 0,12. Es el punto de mayor degradacion conocido del proceso.
- No se han publicado benchmarks de este checkpoint concreto. La unica cifra disponible (GSM8K 92,19/92,27) corresponde a un checkpoint hermano con la misma receta de computo, no a este repositorio, y supone una caida de 0,6 a 0,68 puntos frente al 92,87 de la referencia.
- La validacion del autor es byte a byte contra un gemelo generado por script (96.085/96.085 tensores), lo que garantiza reproducibilidad del empaquetado, no calidad de inferencia.
- Idiomas soportados: no disponible. No se puede asumir un comportamiento multilingue concreto sin datos.
- Longitud de contexto: no disponible. El `--max-model-len 8192` del ejemplo es solo una configuracion de arranque; no debe interpretarse como el maximo del modelo.
- Licencia: el repositorio declara MIT, pero la licencia del modelo base DeepSeek-V4.1-Flash no se especifica en la informacion proporcionada. Antes de un uso comercial conviene verificar los terminos del modelo base y de los pesos originales.
- Dependencia de version: el despliegue requiere vLLM `main` con el PR #56201 o posterior. En versiones anteriores el modelo no cargara correctamente.
- Adopcion muy baja: 121 descargas y 0 "likes" en el momento de la consulta, sin validacion externa conocida.
- El repositorio no documenta sesgos especificos, tasas de alucinacion ni evaluaciones de seguridad.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/INCModel3/DeepSeek-V4.1-Flash-MXFP4-Engram-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Repositorio de auto-round (Intel): https://github.com/intel/auto-round
- vLLM, PR #56201: referenciado en la model card como requisito minimo; no se incluye URL en la informacion proporcionada.
- Paper, blog, demo o repositorio adicional del autor: no disponible.
