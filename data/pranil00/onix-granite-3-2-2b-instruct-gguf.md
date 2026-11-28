# pranil00/ONIX-granite-3.2-2b-instruct-GGUF

## Resumen

ONIX-granite-3.2-2b-instruct-GGUF es una cuantizacion en formato GGUF del modelo ibm-granite/granite-3.2-2b-instruct de IBM, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se trata de una conversion a Q5_K_M realizada con llama.cpp sobre hardware Apple Silicon (Metal), con un peso final de 1,68 GB. El modelo no introduce cambios en los pesos mas alla de la cuantizacion: es un artefacto de distribucion para inferencia local eficiente.

El modelo base, Granite 3.2 2B Instruct, es un transformer decoder-only de 2 mil millones de parametros desarrollado por IBM dentro de su familia Granite 3.2, disenado para tareas de generacion de texto, razonamiento e instrucciones en entornos empresariales. Su tamano compacto permite ejecucion en hardware de consumo, y la cuantizacion Q5_K_M reduce aun mas los requisitos de memoria manteniendo una calidad cercana al modelo original en precision completa.

La relevancia de esta publicacion es practica: ofrece un artefacto listo para usar con Ollama y llama.cpp, con licencia Apache 2.0 heredada del modelo base, lo que facilita su adopcion en prototipos, entornos con recursos limitados y despliegues en CPU. No obstante, la ficha del autor es minima y no documenta detalles de evaluacion ni de calidad de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Granite 3.2 2B) |
| Parametros totales | 2 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (unico publicado en este repositorio) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del archivo | 1,68 GB (Q5_K_M) |
| Modelo base | ibm-granite/granite-3.2-2b-instruct |
| Libreria | gguf (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base ibm-granite/granite-3.2-2b-instruct: un transformer decoder-only de 2 mil millones de parametros. Esta publicacion no reentrena ni modifica los pesos; unicamente aplica cuantizacion de 5 bits con el esquema K-quant M (Q5_K_M) mediante llama.cpp, lo que reduce el peso a 1,68 GB. El autor indica que la conversion de tensores fue verificada como autentica.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni innovaciones tecnicas del modelo base. Toda esa informacion deberia consultarse en la model card oficial de IBM.

## Capacidades

- Generacion de texto e instrucciones en el marco del modelo base Granite 3.2 2B Instruct.
- Inferencia local en CPU y GPU mediante llama.cpp y Ollama.
- Ejecucion en hardware de consumo gracias al tamano reducido del GGUF (1,68 GB).
- Compatibilidad con el formato GGUF estandar, lo que permite su uso en multiples frontends (llama.cpp, Ollama, y otros que soporten GGUF).
- Capacidades especificas de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido en local: descargar el GGUF y ejecutarlo con Ollama en un portatil permite validar prompts e integraciones sin depender de APIs externas.
- Asistentes de texto en entornos con recursos limitados: el peso de 1,68 GB cabe en maquinas sin GPU dedicada, lo que lo hace util para demos y pruebas de concepto.
- Generacion de texto en CPU para pipelines por lotes: llama.cpp permite ejecutar el modelo en servidores sin acelerador, procesando tareas de resumen o clasificacion a pequena escala.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de Q5_K_M frente al modelo base en tareas concretas antes de decidir un despliegue.
- Integracion en aplicaciones de escritorio o edge: el tamano reducido facilita empaquetar el modelo dentro de aplicaciones locales.
- Base para experimentos de ajuste o evaluacion: al estar bajo Apache 2.0 y en formato GGUF, sirve como punto de partida para pruebas de rendimiento en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,7-2,5 GB para el archivo Q5_K_M, mas overhead de contexto y del runtime de llama.cpp.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), y tambien en CPU.
- GPU recomendadas para mayor throughput: RTX 3060/4060 en adelante, A100 o H100 para despliegues de mayor concurrencia.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-granite-3.2-2b-instruct-GGUF`) y llama.cpp (`llama-cli -m granite-3.2-2b-instruct-Q5_K_M.gguf`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-granite-3.2-2b-instruct-GGUF (este) | 2B | no disponible | GGUF Q5_K_M | Apache 2.0 | Hugging Face, Ollama |
| ibm-granite/granite-3.2-2b-instruct | 2B | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GGUF de Granite 3.2 2B | 2B | no disponible | GGUF (varios esquemas) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q5_K_M introduce una perdida de precision respecto al modelo base; no se documenta en la model card ninguna evaluacion de esa perdida.
- La model card es minima y no incluye informacion sobre sesgos, idiomas, contexto ni evaluaciones de calidad.
- Riesgo de alucinacion inherente al modelo base; no se aportan datos especificos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de validacion independiente.
- Aunque la licencia es Apache 2.0, conviene verificar los terminos del modelo base de IBM antes de un uso comercial en produccion.
- El autor indica que la conversion se realizo en Apple Silicon; no se documenta la reproducibilidad del proceso ni los parametros exactos de llama.cpp empleados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-granite-3.2-2b-instruct-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-3.2-2b-instruct
