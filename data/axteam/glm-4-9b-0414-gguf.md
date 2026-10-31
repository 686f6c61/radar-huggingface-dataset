# axteam/GLM-4-9B-0414-GGUF

## Resumen

GLM-4-9B-0414 es un modelo de lenguaje de 9.400 millones de parametros desarrollado por Z.ai (zai-org), perteneciente a la familia GLM-4 en su revision de abril de 2014 (0414). Este repositorio, mantenido por axteam, no contiene los pesos originales sino cuantizaciones en formato GGUF listas para ejecutar con llama.cpp, Ollama o LM Studio, lo que resuelve el problema practico de desplegar el modelo en hardware de consumo sin GPU de gama alta.

La relevancia de esta conversion radica en la combinacion de un modelo base con licencia MIT (una de las mas permisivas para uso comercial) y un formato GGUF que permite inferencia en CPU, GPU o configuraciones hibridas con offload automatico a RAM. El repositorio incluye seis niveles de cuantizacion, desde Q2_K (4,0 GB) hasta Q8_0 (10,0 GB), con la plantilla de chat original incrustada en cada fichero.

La conversion se realizo con el script oficial `convert_hf_to_gguf.py` de llama.cpp mediante cuantizacion post-entrenamiento (PTQ) en bloques k-quant, sin reentrenamiento, por lo que la calidad se mantiene cercana al modelo original en los niveles altos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia GLM-4), no disponible detalle exacto |
| Parametros totales | 9.400.279.040 (~9,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base GLM-4-9B-0414); los ejemplos del repo usan 8192 |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF, k-quants) |
| Idiomas soportados | No disponible en la model card (el ejemplo incluye coreano; la familia GLM-4 es bilingue chino-ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (derivado de safetensors BF16 del modelo original) |

## Arquitectura y entrenamiento

El modelo base GLM-4-9B-0414 de Z.ai es un transformer decoder-only de 9,4 mil millones de parametros. Los detalles del preentrenamiento (numero de tokens, composicion del dataset, alineacion con RLHF/DPO) no estan documentados en la model card de esta cuantizacion y no se incluyen en la informacion disponible.

En cuanto a la cuantizacion, axteam aplico PTQ (post-training quantization) con las herramientas oficiales de llama.cpp: conversion de pesos BF16 a GGUF con `convert_hf_to_gguf.py` seguida de `llama-quantize`. Los k-quants usan escalas por bloque con asignacion mixta de bits, sin reentrenamiento. La plantilla de chat original del modelo se incrusta en cada fichero GGUF, y el flag `--jinja` de llama.cpp la activa en tiempo de ejecucion. Como optimizacion adicional en tiempo de inferencia, se puede reducir la memoria de la KV-cache cuantizandola a q8_0 con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` (flash attention activada).

## Capacidades

- Generacion de texto conversacional: el pipeline es `text-generation` con etiqueta `conversational` y plantilla de chat incrustada.
- Capacidades de razonamiento, codigo y matematicas: heredadas del modelo base GLM-4-9B-0414; los resultados concretos no estan documentados en esta model card.
- Compatibilidad con servidores OpenAI-compatible via `llama-server`, lo que facilita la integracion con herramientas y agentes que hablen el protocolo de la API de OpenAI.
- Soporte de tool calling / function calling: no disponible explicitamente en la model card de esta cuantizacion.
- Capacidades multilingues: el ejemplo de la model card incluye una consulta en coreano; la familia GLM-4 es conocida por su bilinguismo chino-ingles, pero la lista oficial de idiomas no esta disponible aqui.
- Ejecucion hibrida CPU/GPU: llama.cpp realiza offload automatico de las capas que no caben en VRAM mediante `-ngl`.

## Casos de uso

- Chatbots locales y privados: ejecucion completamente offline con `llama-cli -cnv` o LM Studio, adecuada para entornos donde los datos no pueden salir del equipo (salud, legal, empresas).
- API local compatible con OpenAI: `llama-server` expone un endpoint `/v1/chat/completions` en el puerto 8080, ideal para prototipar aplicaciones sin coste de API externa.
- Integracion en Ollama para desarrolladores: un solo comando (`ollama run hf.co/axteam/GLM-4-9B-0414-GGUF:Q4_K_M`) lo hace util como modelo por defecto en flujos de desarrollo locales.
- Asistentes en portatiles y estaciones sin GPU dedicada: la variante Q4_K_M (6,2 GB) cabe en RAM y funciona en CPU pura con velocidades razonables.
- Agentes con frameworks locales: al exponer API OpenAI-compatible, puede actuar como backend de frameworks de agentes (LangChain, LlamaIndex, AutoGen) en entornos de prueba.
- Fine-tuning previo con evaluacion rapida: permite evaluar el comportamiento del modelo base GLM-4-9B-0414 en local antes de decidir invertir en despliegue con pesos completos.
- Experimentacion con cuantizaciones: los seis niveles disponibles permiten medir el trade-off tamano/calidad en casos de uso concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion. Para metricas del modelo base, consultar la model card de `zai-org/GLM-4-9B-0414`.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (pesos + margen para contexto y KV-cache):
  - Q2_K: ~4,0 GB de pesos
  - Q3_K_M: ~5,0 GB
  - Q4_K_M: ~6,2 GB (recomendada)
  - Q5_K_M: ~7,1 GB
  - Q6_K: ~8,3 GB
  - Q8_0: ~10,0 GB
- Con contexto de 8192 tokens, anadir aproximadamente 1 GB de KV-cache en FP16 (reducible a la mitad con `--cache-type-k q8_0 --cache-type-v q8_0`).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM ejecuta Q4_K_M completa (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090 para Q8_0 con contexto amplio). En GPU de servidor, cualquier tarjeta moderna funciona sin problemas.
- Consumer GPU: si, cabe completa en GPUs de 8 GB (Q4_K_M) e incluso en portatiles sin GPU dedicada usando offload parcial o CPU pura.
- Despliegue: llama.cpp (`llama-server` / `llama-cli`), Ollama y LM Studio, todos documentados en la model card con comandos concretos.
- Latencia y throughput: no disponible; en CPU moderna con Q4_K_M se pueden esperar tipicamente entre 10 y 25 tokens/s, pero no hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-4-9B-0414 (esta ficha, GGUF) | 9,4B | GGUF (Q2_K a Q8_0) | 128K | MIT | Cuantizacion comunitaria para llama.cpp/Ollama/LM Studio |
| Llama 3.1 8B (Meta) | 8B | Safetensors + GGUF comunitarios | 128K | Llama 3.1 Community License | Licencia restrictiva frente a MIT; ecosistema GGUF muy amplio |
| Qwen2.5-7B (Alibaba) | 7,6B | Safetensors + GGUF comunitarios | 128K | Apache 2.0 (mayoria de variantes) | Tamano similar, licencia permisiva, fuerte en codigo y matematicas |
| Gemma 2 9B (Google) | 9,2B | Safetensors + GGUF comunitarios | 8K | Gemma Terms of Use | Contexto mucho menor (8K) y licencia con condiciones adicionales |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al tratarse de un modelo base de la familia GLM-4, cabe esperar sesgos propios del preentrenamiento mayoritariamente en chino e ingles, con posible degradacion en otros idiomas.
- Riesgo de alucinacion: inherente a modelos de 9B; no hay mitigaciones documentadas en este repositorio. Se recomienda verificacion factual en usos criticos.
- Limitaciones de idioma: la lista oficial de idiomas no esta disponible; el ejemplo de la model card usa coreano, pero el rendimiento en castellano no esta cuantificado aqui.
- Cuantizacion agresiva: Q2_K y Q3_K_M presentan perdida de calidad notable segun el propio autor; evitarlas para produccion si la memoria lo permite.
- Sin datos de benchmarks propios: las cuantizaciones no han sido evaluadas formalmente; la calidad depende del nivel elegido.
- Licencia: MIT tanto en la cuantizacion como en el modelo original, sin restricciones comerciales relevantes; los pesos y el tokenizador originales pertenecen a Z.ai / zai-org.
- Contexto practico: aunque el modelo base soporta 128K, los ejemplos usan 8192 tokens; contextos largos aumentan significativamente el consumo de KV-cache.
- Repositorio comunitario de bajo uso: 129 descargas y 1 like en el momento de la ficha; revisar la integridad de los ficheros antes de uso en produccion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/axteam/GLM-4-9B-0414-GGUF
- Modelo base original: https://huggingface.co/zai-org/GLM-4-9B-0414
- llama.cpp (herramienta de conversion e inferencia): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
