# Honkware/Qwen3.8-27B-OBLITERATED-exl3-4.0bpw

## Resumen

`Honkware/Qwen3.8-27B-OBLITERATED-exl3-4.0bpw` es una cuantizacion en formato EXL3 a 4.0 bits por peso del modelo denso `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, publicada por el usuario Honkware. El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5` en Hugging Face) con 27B parametros nominales, y esta pensado para inferencia local con ExLlamaV3, la libreria de Turboderp para GPUs de consumo y profesionales.

La relevancia de esta publicacion es practica: reduce el peso del modelo a 16,5 GB en disco, lo que permite cargarlo en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizacion de 4 bits, manteniendo una divergencia de distribucion (KL mediana sobre wiki2) de 0,0091 respecto al modelo original. Es, por tanto, una opcion para desplegar un modelo de ~27B en hardware de gama alta de consumo sin recurrir a APIs en la nube.

El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 9 de noviembre de 2026. La model card es escueta: no incluye informacion sobre datos de entrenamiento, idiomas, benchmarks ni capacidades especificas del modelo base, por lo que muchos campos de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`); detalles de atencion y capas no disponibles |
| Parametros totales | 8.254.592.384 segun safetensors del repo cuantizado; el nombre del modelo indica 27B, discrepancia no aclarada en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 a 4.0 bpw (head bits 6, codebook mul1, out-scales always, 250 filas de calibracion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato EXL3 (`exllamav3`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5, segun el tag `qwen3_5` y el badge `arch-Qwen3_5_27B` de la model card. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (estandar o lineal), ni sobre el proceso de entrenamiento (tokens, composicion del dataset, RLHF/DPO). El sufijo "OBLITERATED" en el nombre del modelo base sugiere una modificacion o fine-tuning sobre el Qwen3.5 original, pero la model card no documenta en que consiste.

La cuantizacion EXL3 se aplico con la receta de BlockQuant: 4.0 bits por peso, 6 bits para las cabezas, 250 filas de calibracion extraidas de la mezcla empaquetada de exllamav3 (c4, code, multilingual, technical, tiny, wiki), codebook mul1, out-scales siempre activos y modo paralelo habilitado. La KL mediana sobre wiki2 es de 0,0091, metrica que el autor presenta como indicador de fidelidad respecto al modelo sin cuantizar.

## Capacidades

- Generacion de texto y conversacion multi-turno: el pipeline declarado es `text-generation` y el tag `conversational` aparece en los metadatos de Hugging Face.
- Razonamiento y codigo: no documentado en la model card; el tag `qwen3_5` sugiere herencia de las capacidades de la familia Qwen3.5, pero no hay confirmacion explicita.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la calibracion incluye datos multilingues, pero no se especifica que idiomas soporta el modelo.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con 16,5 GB de pesos en EXL3 a 4.0 bpw, el modelo cabe en una RTX 3090 o RTX 4090 de 24 GB, permitiendo ejecutar un modelo de ~27B en estacion de trabajo sin depender de la nube.
- Servidor compatible con OpenAI: mediante TabbyAPI se puede exponer el modelo como endpoint HTTP compatible con la API de OpenAI, lo que facilita sustituir llamadas a proveedores externos por inferencia local en prototipos y herramientas internas.
- Chat local con interfaz grafica: text-generation-webui con el loader de ExLlamaV3 permite usar el modelo en un entorno de escritorio para tareas de redaccion, resumen o asistencia conversacional.
- Integracion en pipelines Python: la API directa de ExLlamaV3 permite embeber el modelo en scripts propios para generacion por lotes, clasificacion de texto o extraccion de informacion, sin servidor intermedio.
- Evaluacion de cuantizaciones: la metrica de KL mediana (0,0091) y la receta documentada hacen de este repo un punto de partida para comparar el impacto de distintas bpw sobre la calidad del modelo base.
- Experimentacion con modelos "abliterated"/modificados: al derivar de un modelo base con modificaciones no documentadas, sirve para probar el comportamiento de variantes sin censura o con ajustes de alineacion, siempre que se respete la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la KL mediana sobre wiki2 (0,0091) para la cuantizacion a 4.0 bpw, que mide la divergencia respecto al modelo base y no el rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB solo para los pesos; con cache KV y overhead de ExLlamaV3, se recomienda un minimo de 20-22 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), RTX 5090 (32 GB), A100 40/80 GB, H100. En GPUs de 16 GB no cabe a 4.0 bpw.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 de 24 GB; en RTX 4080 (16 GB) o inferiores no entra con esta cuantizacion.
- Opciones de despliegue: ExLlamaV3 (API Python), TabbyAPI (servidor compatible con OpenAI), text-generation-webui (loader ExLlamaV3). No es compatible con llama.cpp, Ollama, vLLM ni TGI, que no soportan el formato EXL3.
- Latencia y throughput: no disponibles; dependen de la GPU y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Honkware/Qwen3.8-27B-OBLITERATED-exl3-4.0bpw | 27B nominales (8,25B segun safetensors) | No disponible | EXL3 4.0 bpw, 16,5 GB | Apache 2.0 | Solo ExLlamaV3; sin benchmarks publicados |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27B nominales | No disponible | safetensors sin cuantizar | Apache 2.0 | Modelo base; requiere mas VRAM |
| Qwen3.5 27B (familia original) | 27B | No disponible | safetensors, GGUF, etc. | Apache 2.0 (segun familia Qwen3) | Referencia de la arquitectura; sin datos verificados en esta consulta |

No se dispone de informacion suficiente para comparar rendimiento en benchmarks con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 27B pero los safetensors del repo suman 8.254.592.384 parametros. Puede deberse a un error de nombrado, a un modelo base mas pequeno de lo que sugiere el nombre, o a una poda/abliteracion agresiva no documentada. Conviene verificar antes de usarlo en produccion.
- Model card incompleta: no hay informacion sobre datos de entrenamiento, idiomas, contexto, sesgos ni evaluaciones de seguridad.
- Modelo base modificado ("OBLITERATED"): el sufijo sugiere la eliminacion de mecanismos de rechazo o alineacion; no hay documentacion sobre que se ha alterado ni sobre los riesgos asociados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda cualquier restriccion adicional del modelo base, que no se detalla en la model card.
- Compatibilidad limitada: el formato EXL3 solo funciona con ExLlamaV3 y herramientas que lo integren (TabbyAPI, text-generation-webui); no es portable a llama.cpp, vLLM u Ollama.
- Repo sin traccion: 0 descargas y 0 likes; no hay evidencia de uso en comunidad ni de validacion independiente de la cuantizacion.
- Fecha de creacion futura respecto a la consulta (2026-11-09): conviene verificar la integridad del repo y la identidad del autor.

## Enlaces

- Repo Hugging Face: https://huggingface.co/Honkware/Qwen3.8-27B-OBLITERATED-exl3-4.0bpw
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Perfil del autor: https://huggingface.co/Honkware
- Coleccion de cuantizaciones: https://huggingface.co/collections/Honkware/qwen38-27b-obliterated-exl3-6af1615632d6d36f2479b17f
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant: https://github.com/Honkware/blockquant
