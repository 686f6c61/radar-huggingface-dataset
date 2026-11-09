# MouseWurX/28Bob-Riker

## Resumen

28Bob-Riker es un modelo de lenguaje de tipo mixture-of-experts (MoE) derivado de Qwen/Qwen3.6-35B-A3B, desarrollado por MouseWurX dentro del proyecto Bob's Forge. Se trata de un ajuste fino orientado a tareas concretas de su ecosistema: uso de herramientas (tool calling), generacion de codigo, formatos exactos y conversacion cotidiana. Conserva todos los expertos por capa del modelo base, con aproximadamente 28.600 millones de parametros totales y unos 3.000 millones activos por token.

El modelo se distribuye unicamente en formato GGUF cuantizado (Q3_K_M y Q4_K_M), lo que lo hace desplegable en hardware de consumo, y se publica bajo licencia Apache 2.0, igual que el modelo base de Alibaba. Su interes principal es como ejemplo de ajuste fino de un MoE grande sobre datos propios y como caso practico de cuantizacion agresiva de un modelo de casi 29.000 millones de parametros.

La informacion disponible es limitada: el autor no publica ficha de pipeline, idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), y solo aporta pruebas internas del propio proyecto. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 28.616.880.768 (aprox. 28,6 B) |
| Parametros activos | Aprox. 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_M y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tarjeta auxiliar `.bob.json` por archivo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos. El ajuste realizado por Bob's Forge mantiene todos los expertos de cada capa, de modo que la estructura MoE del modelo base se conserva intacta y solo se modifican los pesos mediante el entrenamiento propio del proyecto. El resultado son unos 28,6 B de parametros totales con aproximadamente 3 B activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano.

El entrenamiento se realizo con los conjuntos de lecciones propios de Bob (licenciados CC BY-SA 4.0) mas trazas de otros modelos con licencias abiertas, segun indica el autor. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla ninguna innovacion arquitectonica adicional mas alla de la herencia del modelo base. El autor remite al "Forge journal" del repositorio de GitHub para consultar metodo, numeros y registros.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Uso de herramientas y function calling (etiqueta `tool-use` en el modelo).
- Generacion de codigo, con un rendimiento declarado notablemente inferior al modelo base en la prueba interna de coding.
- Cumplimiento de formatos exactos de salida, segun la descripcion del autor.
- Razonamiento en modo "thinking" (se reportan resultados especificos para ARC-Challenge y ARC-Easy en ese modo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el enfasis en tool use lo hace plausible.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en GPUs de consumo con la cuantizacion Q3_K_M (unos 15 GB de VRAM) o Q4_K_M (unos 19 GB), lo que permite montar un chatbot privado sin depender de la nube.
- Integracion en pipelines de tool calling: la etiqueta `tool-use` y el ajuste especifico indican que esta pensado para invocar funciones externas, por ejemplo consultas a APIs o ejecucion de comandos controlados.
- Generacion de codigo asistida en entornos con recursos limitados: aunque su rendimiento en coding es inferior al del modelo base (69 frente a 92 en la prueba interna), sigue siendo util para autocompletado y tareas sencillas en local.
- Prototipado de agentes con formatos estrictos: el ajuste en "exact formats" lo hace adecuado para tareas donde la salida debe seguir un esquema fijo, como extraccion de datos o generacion de JSON.
- Evaluacion comparativa de ajustes finos: sirve como referencia para estudiar como un ajuste sobre un MoE grande afecta a capacidades generales frente al modelo original.
- Despliegue en entornos con GGUF: compatible con runtimes de inferencia GGUF, lo que facilita su uso en Ollama, llama.cpp u otros motores que consuman este formato.
- Experimentacion educativa: util para estudiar el efecto de la cuantizacion Q3_K_M y Q4_K_M en un MoE de 28,6 B de parametros.

## Benchmarks y rendimiento

El autor publica pruebas internas del proyecto (fecha 2026-11-08), no benchmarks estandar de la comunidad. Se reproducen tal cual, sin normalizar:

| Prueba | 28Bob | Qwen3.6 35B-A3B |
|---|---|---|
| Coding | 69 | 92 |
| Quick code | 100 | 100 |
| Tools | 65 | 67 |
| Facts | 90 | 100 |
| Routing | 96 | no disponible |
| ARC-Challenge | 92,9 | 95,8 |
| ARC-Easy | 97,6 | 98,9 |
| ARC-Challenge (thinking) | 93,9 | no disponible |
| ARC-Easy (thinking) | 98,3 | no disponible |

El propio autor advierte que son pruebas caseras para comparar variantes del proyecto, no para leaderboards. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 15 GB para `28Bob-Q3_K_M.gguf` (13,9 GB de archivo) y unos 19 GB para `28Bob-Q4_K_M.gguf` (17,5 GB de archivo), segun el autor.
- GPU recomendadas: no especificadas por el autor. Por el perfil de memoria, encajan GPUs de consumo de gama alta con 16-24 GB (por ejemplo, RTX 4080/4090 o equivalentes) y GPUs profesionales tipo A100 o H100 para mayor holgura.
- Cabe en GPU de consumo: si, en modelos con al menos 16 GB de VRAM para la cuantizacion Q3_K_M y al menos 20-24 GB para Q4_K_M.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros motores que lo soporten; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| 28Bob-Riker | 28,6 B | aprox. 3 B | no disponible | Apache 2.0 | GGUF Q3_K_M / Q4_K_M | Ajuste fino de Bob's Forge |
| Qwen/Qwen3.6-35B-A3B | no disponible (base del anterior) | aprox. 3 B | no disponible | Apache 2.0 | no disponible | Modelo base de Alibaba |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

La unica comparacion documentada es contra el modelo base, cuyos resultados en las pruebas internas se incluyen en la tabla de benchmarks. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base en coding (69 frente a 92) y en facts (90 frente a 100) segun las pruebas del autor; el ajuste degrada capacidades generales.
- Benchmarks caseros y no verificables de forma independiente; no deben usarse como referencia de calidad frente a modelos publicos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos de lenguaje.
- Idiomas soportados no documentados; no se puede garantizar un buen rendimiento fuera de los idiomas del entrenamiento.
- Longitud de contexto no disponible; limita la planificacion de conversaciones largas o documentos extensos.
- Solo se distribuyen dos cuantizaciones GGUF; no hay pesos en safetensors ni otras variantes de precision.
- El nombre "Bob" es un homenaje a las novelas de Dennis E. Taylor; el proyecto no esta afiliado al autor.
- Las lecciones de entrenamiento propias estan bajo CC BY-SA 4.0, lo que puede afectar a la redistribucion de derivados aunque el modelo se publique como Apache 2.0.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; soporte comunitario minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/28Bob-Riker
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Forge journal (metodo, numeros y logs): https://github.com/MouseWurX/Bob/blob/main/docs/FORGE-JOURNAL.md
- Repositorio del proyecto: https://github.com/MouseWurX/Bob
