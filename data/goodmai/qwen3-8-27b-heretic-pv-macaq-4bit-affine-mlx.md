# goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-4bit-Affine-MLX

## Resumen

Este repositorio contiene una cuantizacion de 4 bits del modelo `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`, un derivado "abliterated" (sin mecanismos de rechazo) de la familia Qwen3.8 de 27.000 millones de parametros. La cuantizacion la ha realizado el usuario goodmai aplicando una tecnica propia denominada PV-MACaQ, que combina cuantizacion afin de 4 bits con una transformada de Hadamard por bloques para reducir el error de reconstruccion de pesos. El resultado es un modelo de 15,15 GB en formato MLX, pensado para ejecutarse en Apple Silicon con 24 GB o mas de memoria unificada.

El modelo resuelve el problema de desplegar un LLM de ~27B en hardware de consumo con memoria limitada, manteniendo una fidelidad de pesos superior a la cuantizacion de 4 bits por redondeo simple (RTN): el autor reporta una mejora de SQNR medio de 20,59 dB a 21,59 dB, equivalente a una reduccion del 19,7 % del error cuadratico medio. Es relevante para desarrolladores que trabajan en Mac y necesitan un modelo grande, sin censura y con contexto amplio sin recurrir a GPUs dedicadas.

La arquitectura declarada es `qwen3_5_text`, es decir, la rama solo-texto de la familia Qwen3.5, sin torre de vision. El repositorio no incluye informacion sobre la longitud de contexto, los idiomas soportados ni la licencia, por lo que esos datos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen3_5_text`, rama solo texto) |
| Parametros totales | 26.899.389.952 (~26,9 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afin con `group_size=64` en 496 proyecciones lineales del backbone; 4 bits afin con `group_size=64` en `embed_tokens` y `lm_head`; bloque Hadamard H64 con `alpha=0.5` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), 4 shards, 15,15 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 en su variante solo texto, con 26.899.389.952 parametros. El modelo base (`0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`) es un derivado "abliterated": se han eliminado o atenuado las direcciones de activacion asociadas al rechazo, de modo que el modelo no declina peticiones por motivos de seguridad. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

La innovacion tecnica de esta ficha es el esquema de cuantizacion PV-MACaQ. Se aplica cuantizacion afin de 4 bits con grupos de 64 elementos a las 496 proyecciones lineales del backbone, y se antepone a cada bloque una transformada de Hadamard de tamano 64 con factor `alpha=0.5`, que reparte la energia de los pesos y reduce los valores atipicos antes del redondeo. Frente a la cuantizacion RTN ingenua de 4 bits, el autor reporta un SQNR medio de 21,59 dB frente a 20,59 dB y una reduccion del 19,7 % del MSE. El resultado se empaqueta en 4 shards safetensors para la libreria MLX y se sirve con Basalt, herramienta del mismo autor que admite decodificacion especulativa mediante `--speculative-lookup`.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo Qwen3.5 subyacente.
- Respuesta sin rechazo: al ser un modelo abliterated, no aplica las negativas de seguridad típicas del modelo original.
- Ejecucion nativa en Apple Silicon mediante MLX, con memoria unificada compartida entre CPU y GPU.
- Decodificacion especulativa con Basalt (`--speculative-lookup`), orientada a reducir la latencia por token.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo es explicitamente solo texto y no incluye torre de vision.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac: el modelo ocupa 15,15 GB y esta disenado para equipos con 24 GB o mas de memoria unificada, lo que permite ejecutar un LLM de ~27B en un portatil o Mac mini sin GPU dedicada.
- Prototipado de aplicaciones LLM sin infraestructura cloud: sirve para desarrollar y probar prompts, cadenas de razonamiento y pipelines de generacion en local antes de migrar a produccion.
- Generacion creativa sin restricciones de contenido: el caracter abliterated lo hace adecuado para experimentacion con narrativa, guiones o role-play donde los filtros del modelo original resultarian limitantes, siempre con las advertencias de la seccion de limitaciones.
- Investigacion sobre cuantizacion: el repositorio permite comparar el esquema PV-MACaQ (Hadamard H64, `alpha=0.5`) con la cuantizacion RTN de 4 bits sobre el mismo modelo base, usando la metrica SQNR reportada por el autor.
- Evaluacion de decodificacion especulativa: con Basalt y `--speculative-lookup` se puede medir la ganancia de latencia en Apple Silicon sobre un modelo de este tamano.
- Base para ajuste fino ligero: al estar en formato MLX y ocupar 15,15 GB, deja margen de memoria en equipos de 32 GB o mas para tecnicas de adaptacion de bajo rango (LoRA) sobre la rama solo texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es la fidelidad de pesos frente a la cuantizacion RTN de 4 bits:

| Metrica | RTN 4 bits | PV-MACaQ 4 bits | Variacion |
|---|---|---|---|
| SQNR medio | 20,59 dB | 21,59 dB | +1,00 dB |
| MSE relativo | referencia | -19,7 % | mejora |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 15,15 GB solo para los pesos; con cache KV y overhead de ejecucion se recomienda un minimo de 24 GB de memoria unificada, tal como indica el autor.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, incluidos Pro, Max y Ultra) mediante MLX; no esta pensado para GPUs NVIDIA o AMD.
- GPU de consumo: cabe en Mac con 24 GB o mas de memoria unificada; en equipos de 16 GB no hay margen suficiente para pesos mas cache KV.
- Opciones de despliegue: Basalt (`basalt serve goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-4bit-Affine-MLX --speculative-lookup`) y la libreria MLX. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato de pesos tal como se publica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-PV-MACaQ-4bit-Affine-MLX (este) | ~26,9B | no disponible | 4 bits PV-MACaQ | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored (base) | ~26,9B | no disponible | BF16 | safetensors | no disponible | Hugging Face |
| Modelo Qwen3.5 de referencia (solo texto, sin abliteration) | no disponible | no disponible | BF16 y variantes | safetensors, GGUF | no disponible | Hugging Face |

La comparativa con alternativas de terceros no esta disponible porque la informacion proporcionada no incluye datos de contexto, benchmarks ni licencia de los modelos de referencia.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o sexualmente explicito sin filtros. No es adecuado para aplicaciones de cara al publico sin una capa externa de moderacion.
- Riesgo de alucinacion: inherente a los LLM de esta escala; no hay benchmarks publicados que permitan cuantificarlo en esta cuantizacion.
- Perdida por cuantizacion: aunque el autor reporta una mejora de 19,7 % de MSE frente a RTN, sigue siendo una cuantizacion de 4 bits y puede degradar tareas sensibles a la precision numerica o al razonamiento largo.
- Solo texto: no procesa imagenes ni audio.
- Contexto e idiomas no documentados: el repositorio no declara la ventana de contexto ni la cobertura linguistica, lo que impide garantizar su comportamiento en castellano o en conversaciones largas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base antes de desplegarlo en produccion.
- Ecosistema restringido: el formato MLX solo se ejecuta en Apple Silicon con la libreria MLX o Basalt; no hay conversion a GGUF ni soporte en vLLM o TGI en este repositorio.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-Heretic-PV-MACaQ-4bit-Affine-MLX
- Modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Basalt (herramienta de despliegue del autor): https://github.com/goodmai/basalt
