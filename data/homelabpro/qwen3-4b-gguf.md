# HomeLabPro/Qwen3-4B-GGUF

## Resumen

HomeLabPro/Qwen3-4B-GGUF es una conversión a formato GGUF del modelo Qwen3-4B desarrollado por Alibaba Qwen. Se trata de una cuantización Q4_K_M realizada por el usuario HomeLabPro con las herramientas oficiales de llama.cpp, pensada para el despliegue local en CPU y GPU con bajo consumo de memoria. El modelo base es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4 mil millones), publicado bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar Qwen3-4B en hardware de consumo: el único archivo disponible ocupa unos 2,5 GB y requiere entre 3,5 y 4 GB de RAM o VRAM. Esto lo sitúa al alcance de equipos domésticos y entornos de homelab, sin necesidad de GPUs de centro de datos.

El repositorio tiene un alcance limitado: solo incluye una cuantización (Q4_K_M), no aporta datos propios de entrenamiento ni benchmarks, y su model card se limita a documentar el proceso de conversión. Toda la información técnica sustantiva procede del modelo base Qwen/Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B; detalles de atención y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | Ingles y multilingue (segun tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo Qwen3-4B-Q4_K_M.gguf, ~2,5 GB) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento. Por los metadatos disponibles, se trata de un transformer denso de 4 mil millones de parametros, base del modelo Qwen/Qwen3-4B de Alibaba Qwen. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: conversion de los pesos originales a F16 con `convert_hf_to_gguf.py` y posterior cuantizacion a Q4_K_M con `llama-quantize`. Esta cuantizacion de 4 bits con metodos K permite reducir el peso a unos 2,5 GB manteniendo, segun el autor, un equilibrio entre velocidad, calidad y memoria. No se aportan metricas de degradacion por cuantizacion.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3-4B, aunque no se detallan en la model card del repo.
- Soporte multilingue segun los tags del repositorio (en, multilingual).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de tool calling, agentes, thinking mode o vision: no disponibles en la informacion proporcionada para este repo.

## Casos de uso

- Asistente conversacional local en homelab: el modelo puede ejecutarse con llama.cpp u Ollama en un equipo domestico con 4 GB de RAM/VRAM, gestionando conversaciones multi-turno sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de texto: al ocupar solo 2,5 GB, permite iterar en portatiles o mini-PC antes de escalar a modelos mayores.
- Procesamiento por lotes en CPU: con la cuantizacion Q4_K_M y llama.cpp, es viable generar texto en servidores sin GPU dedicada.
- Educacion y experimentacion: sirve para estudiar el impacto de la cuantizacion Q4_K_M frente a los pesos originales en tareas de generacion.
- Despliegue en entornos con restricciones de memoria: util en contenedores o dispositivos edge donde no caben modelos de mayor tamano.
- Base para pipelines de generacion de texto en ingles y otros idiomas: adecuado cuando se necesita un modelo Apache 2.0 sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones de rendimiento tras la cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada: 3,5 a 4 GB para la cuantizacion Q4_K_M (dato del autor).
- Tamano del archivo: aproximadamente 2,5 GB.
- GPU recomendadas: no especificadas en la informacion proporcionada; por el perfil de memoria, cabe en GPUs de consumo con 4 GB o mas de VRAM.
- Cabe en GPU de consumo: si, segun el consumo de memoria indicado (4 GB); no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp y Ollama (mencionados por el autor); otros runners GGUF no se confirman en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| HomeLabPro/Qwen3-4B-GGUF | ~4,02 B | No disponible | GGUF Q4_K_M | Apache 2.0 | Cuantizacion de Qwen3-4B, ~2,5 GB |
| Qwen/Qwen3-4B (base) | ~4,02 B | No disponible | Safetensors | Apache 2.0 | Pesos originales sin cuantizar |
| Otras cuantizaciones GGUF de Qwen3-4B | ~4,02 B | No disponible | GGUF | Apache 2.0 | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se publica una cuantizacion (Q4_K_M); no hay variantes Q8, Q5 ni Q2 para ajustar calidad frente a memoria.
- La cuantizacion a 4 bits puede degradar la calidad respecto a los pesos originales; el autor no aporta metricas de esa perdida.
- No se documentan sesgos conocidos del modelo base en este repositorio.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se cuantifica en la informacion disponible.
- La longitud de contexto no esta especificada, lo que impide planificar casos de uso con ventanas largas.
- El repo no incluye benchmarks ni evaluaciones propias; el rendimiento real depende del modelo base Qwen3-4B.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos del modelo base Qwen/Qwen3-4B.
- El repositorio es de un tercero (HomeLabPro), no oficial de Alibaba Qwen; la trazabilidad y el mantenimiento no estan garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HomeLabPro/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Herramientas de conversion y cuantizacion llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
