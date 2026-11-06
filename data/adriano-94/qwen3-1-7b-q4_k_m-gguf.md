# AdrianO-94/Qwen3-1.7B-Q4_K_M-GGUF

## Resumen

`AdrianO-94/Qwen3-1.7B-Q4_K_M-GGUF` es una cuantizacion en formato GGUF del modelo base Qwen3-1.7B, desarrollado originalmente por Alibaba Qwen. La conversion la ha realizado el usuario AdrianO-94 mediante el espacio `GGUF-my-repo` de ggml.ai, que automatiza la transformacion de pesos safetensors a GGUF usando llama.cpp. El resultado es un unico archivo de aproximadamente 1,3 GB que puede ejecutarse en CPU sin necesidad de GPU dedicada.

El modelo subyacente es un transformer denso de 2.031.739.904 parametros (segun los safetensors del modelo base), orientado a generacion de texto y conversacion. La cuantizacion Q4_K_M reduce el peso a unos 4 bits por parametro con una mezcla de escalas, lo que permite desplegarlo en equipos modestos manteniendo una calidad razonable para tareas de chat y generacion.

La relevancia de esta ficha es practica: demuestra el flujo de cuantizacion automatica de Hugging Face y ofrece un punto de partida para probar Qwen3-1.7B en hardware de consumo. No obstante, al ser una conversion no oficial y con muy poca traccion (75 descargas, 0 likes), conviene tratarla como una alternativa de conveniencia frente a las cuantizaciones oficiales del equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B; detalles completos en la model card original) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servidor usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3-1.7b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base Qwen3-1.7B. Lo que si se sabe es que se trata de un transformer denso de aproximadamente 2.000 millones de parametros, y que la model card remite explicitamente a la [model card original de Qwen](https://huggingface.co/Qwen/Qwen3-1.7B) para obtener detalles sobre datos de entrenamiento, composicion del dataset y posibles fases de RLHF/DPO.

Respecto a esta publicacion concreta, la unica innovacion tecnica documentada es el proceso de cuantizacion: conversion a GGUF mediante llama.cpp con el espacio `GGUF-my-repo` de ggml.ai, que aplica la cuantizacion Q4_K_M. El autor reporta una prueba de inferencia en CPU Snapdragon X Elite con 32 GB de RAM, alcanzando 24,30 tokens/s y 1,8 GB de memoria en uso, con una valoracion subjetiva de bateria de 9/10. No se documentan cambios en el entrenamiento ni fine-tuning adicional.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B (etiqueta `conversational` en el repo).
- Ejecucion en CPU pura mediante llama.cpp, sin requerir GPU.
- Compatibilidad con el servidor HTTP de llama.cpp (`llama-server`), lo que permite exponer una API compatible con endpoints.
- Integracion con el ecosistema `transformers` a nivel de metadatos de repo, aunque el formato real de pesos es GGUF y requiere llama.cpp u otro runtime compatible.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue) no estan documentadas en esta ficha; deben consultarse en la model card de Qwen3-1.7B.

## Casos de uso

- Prototipado en portatiles sin GPU: el archivo Q4_K_M de 1,3 GB cabe en RAM y permite probar un LLM de 2B parametros en cualquier equipo moderno, como demuestra la prueba del autor en un Snapdragon X Elite.
- Asistentes de chat locales y privados: al ejecutarse en CPU con llama.cpp, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de privacidad.
- Despliegue en dispositivos de borde (edge): el bajo consumo de memoria (1,8 GB en la prueba) permite integrarlo en mini-PC, Raspberry Pi de gama alta o portatiles ARM.
- Pruebas de integracion con llama.cpp: sirve para validar pipelines de CI/CD que invocan `llama-cli` o `llama-server` con modelos GGUF antes de pasar a modelos mayores.
- Educacion y experimentacion: util para estudiar el efecto de la cuantizacion Q4_K_M frente a los pesos originales en tareas de generacion.
- Backend de bajo coste para demos: con `llama-server -c 2048` se puede levantar un endpoint HTTP ligero para demos internas o juguetes de prototipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El unico dato de rendimiento reportado por el autor es de inferencia en hardware concreto:

| Metrica | Valor | Hardware |
|---|---|---|
| Velocidad de generacion | 24,30 tokens/s | CPU Snapdragon X Elite, 32 GB RAM |
| Memoria en uso | 1,8 GB | CPU Snapdragon X Elite, 32 GB RAM |
| Valoracion de bateria (subjetiva) | 9/10 | CPU Snapdragon X Elite, 32 GB RAM |

## Requisitos de hardware

- VRAM estimada: no aplica para ejecucion en CPU; para GPU, la cuantizacion Q4_K_M de un modelo de 2B parametros ocupa aproximadamente 1,3 GB de pesos, por lo que cabe en GPUs con 2 GB o mas de VRAM (estimacion basada en el tamano del archivo).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; tambien iGPU y CPUs ARM.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y en CPU sin GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui) aunque no se documentan explicitamente en la model card.
- Latencia y throughput: 24,30 tokens/s en Snapdragon X Elite segun el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AdrianO-94/Qwen3-1.7B-Q4_K_M-GGUF | 2.031.739.904 | no disponible | Apache 2.0 | GGUF Q4_K_M | Conversion no oficial, 75 descargas |
| Qwen/Qwen3-1.7B (original) | 2.031.739.904 | no disponible | Apache 2.0 | safetensors | Modelo base oficial, referencia para comparar calidad |
| Otras cuantizaciones GGUF de Qwen3-1.7B | 2.031.739.904 | no disponible | Apache 2.0 | GGUF (varias) | Publicadas por el equipo Qwen u otros usuarios; no verificadas en esta busqueda |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo de 2B parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de 7B o superiores; riesgo elevado de alucinacion en tareas complejas.
- Cuantizacion Q4_K_M: introduce perdida de precision frente a los pesos originales en safetensors; puede degradar tareas sensibles (matematicas, codigo).
- Conversion no oficial: realizada por un usuario individual mediante un espacio automatico; no hay garantia de que la conversion sea identica a la oficial de Qwen. Se recomienda validar contra el modelo base.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingue sin consultar la model card original.
- Contexto no documentado: el ejemplo de servidor usa `-c 2048`, pero no se especifica la ventana maxima real del modelo base en esta ficha.
- Traccion minima: 75 descargas y 0 likes; sin comunidad que reporte incidencias.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3-1.7B y sus terminos asociados.
- Sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AdrianO-94/Qwen3-1.7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Espacio de cuantizacion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
