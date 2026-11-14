# NonMiFrega/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M-GGUF

## Resumen

Esta ficha documenta una cuantizacion GGUF en formato Q4_K_M del modelo DeepSeek-R1-Distill-Qwen-7B, publicada por el usuario NonMiFrega. No se trata de un modelo original, sino de una conversion de los pesos originales de DeepSeek a formato GGUF mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp, pensada para ejecucion local en CPU/GPU consumer a traves de llama.cpp. El modelo base es un destilado de razonamiento de DeepSeek (familia R1) sobre la arquitectura Qwen2.5 de 7B, con 7.615.616.512 parametros y licencia MIT.

La relevancia de esta publicacion es practica: permite desplegar un modelo de razonamiento de 7B en hardware modesto gracias a la cuantizacion de 4 bits, con un tamano de repositorio de 4,7 GB. No obstante, el repositorio carece de informacion propia sobre benchmarks, idiomas, contexto o composicion del entrenamiento; toda la informacion tecnica sustantiva debe remitirse a la model card del modelo base original de DeepSeek.

Conviene advertir que este repositorio concreto presenta 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-14, por lo que su trazabilidad y mantenimiento no estan garantizados. Para produccion se recomienda preferir los pesos originales en safetensors o cuantizaciones GGUF de fuentes con mayor reputacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5), destilado de razonamiento DeepSeek-R1; dato exacto de la arquitectura del destilado no disponible en este repositorio |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este repositorio (consultar model card del modelo base) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repo) |
| Idiomas soportados | no disponible en este repositorio |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `deepseek-r1-distill-qwen-7b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un destilado de la familia DeepSeek-R1 sobre Qwen2.5-7B. Se trata de un transformer decoder-only con 7,6 B parametros, ajustado mediante destilacion a partir de trayectorias de razonamiento generadas por DeepSeek-R1. La finalidad del destilado es transferir el comportamiento de razonamiento paso a paso (chain-of-thought explicito) a un modelo de menor tamano. No se dispone en este repositorio de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO; esa informacion debe consultarse en la model card del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`.

La aportacion de este repositorio es unicamente la conversion a GGUF en cuantizacion Q4_K_M mediante llama.cpp, realizada con el espacio GGUF-my-repo de ggml.ai. No hay innovacion arquitectonica propia ni reentrenamiento. La cuantizacion Q4_K_M aplica mezcla de precisiones por tensor (4 bits con escalas de mayor precision en capas sensibles), lo que reduce el peso a 4,7 GB con una perdida de calidad tipicamente moderada respecto a los pesos originales en BF16/FP16.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredado del destilado de DeepSeek-R1 (modo de razonamiento explicito segun el modelo base).
- Resolucion de problemas matematicos y tareas de logica, segun el comportamiento del modelo base.
- Generacion y comprension de codigo, segun el modelo base.
- Conversacion multi-turno (el repositorio incluye la etiqueta `conversational`).
- Ejecucion local mediante llama.cpp en CLI y servidor HTTP.
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion de este repositorio; deben verificarse en la model card del modelo base.
- Cobertura multilingue: no disponible en este repositorio.

## Casos de uso

- Razonamiento local en equipos sin GPU dedicada: el archivo Q4_K_M de 4,7 GB puede ejecutarse en llama.cpp sobre CPU con RAM suficiente, lo que permite prototipar tareas de razonamiento en portatiles y estaciones de trabajo sin acelerador.
- Asistente de programacion en local: al estar cuantizado en 4 bits, cabe en GPU consumer y puede servir como autocompletado o explicacion de codigo sin enviar datos a servicios externos.
- Analisis de problemas matematicos paso a paso: el origen destilado de R1 favorece cadenas de razonamiento explicitas, util para tutoring o verificacion de calculos en entornos educativos.
- Despliegue de un endpoint HTTP ligero con `llama-server`: permite exponer el modelo como API compatible con llamadas HTTP simples para integraciones internas de baja concurrencia.
- Experimentacion e investigacion en cuantizacion: sirve como referencia practica para medir la degradacion de calidad de Q4_K_M frente a pesos BF16 en tareas de razonamiento.
- Prototipado de agentes y pipelines conversacionales: la etiqueta `conversational` y el formato GGUF facilitan pruebas rapidas de flujos multi-turno antes de migrar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 4,7 GB solo para los pesos en Q4_K_M; sumar overhead de contexto y cache KV (dependiente de la longitud de contexto configurada). Con `-c 2048` el consumo adicional es moderado; contextos largos incrementan la memoria de forma notable.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o mas (por ejemplo, RTX 3060 8 GB, RTX 4060 Ti 8/16 GB, RTX 4090) para inferencia comoda; en entornos profesionales, A100 o H100 no son necesarias para este tamano.
- CPU: viable en modo CPU puro con al menos 8 GB de RAM libre; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, otros runners que acepten GGUF; el repositorio documenta exclusivamente llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (DeepSeek-R1-Distill-Qwen-7B Q4_K_M GGUF) | 7,6 B | no disponible | GGUF Q4_K_M | MIT | Cuantizacion de terceros, sin benchmarks propios |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (original) | 7,6 B | no disponible en esta ficha | safetensors | MIT | Pesos de referencia; benchmarks en su model card |
| Otras cuantizaciones GGUF del mismo base | 7,6 B | no disponible | GGUF (varias) | MIT | Repositorios de terceros con mayor o menor reputacion |

No se dispone de datos de rendimiento comparado en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Repositorio de terceros con 0 descargas y 0 likes: sin validacion comunitaria ni garantia de mantenimiento; riesgo de conversion defectuosa no verificada.
- Ausencia total de informacion propia sobre benchmarks, idiomas, contexto y datos de entrenamiento: cualquier evaluacion debe hacerse contra el modelo base original.
- La cuantizacion Q4_K_M puede degradar tareas de razonamiento y matematicas mas que tareas de generacion general; es recomendable validar en el dominio concreto.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente acentuado en cadenas de razonamiento largas.
- Sesgos: no documentados en este repositorio; deben evaluarse a partir del modelo base.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de destilado en la model card original.
- Los modelos de razonamiento pueden generar cadenas de pensamiento extensas, lo que incrementa latencia y consumo de tokens en produccion.
- El nombre de archivo y la configuracion de contexto del ejemplo (`-c 2048`) no deben interpretarse como limite maximo del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NonMiFrega/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
