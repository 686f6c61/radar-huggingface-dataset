# mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp es una version cuantizada del modelo Qwen3.8-Flash-Next-Uncensored, publicada por la organizacion mlx-community el 15 de septiembre de 2026. Se distribuye exclusivamente en formato MLX safetensors, pensado para ejecucion sobre Apple Silicon, y emplea cuantizacion mixta de 5 bits con tamano de grupo 64 generada con la herramienta oQ (oMLX v0.7.0.dev2). El repositorio ocupa 128,6 GB y declara 179.999.981.459 parametros (unos 180.000 millones) segun los metadatos de safetensors.

El problema que resuelve esta publicacion es de tipo practico: permite ejecutar un modelo de ~180.000 millones de parametros en hardware de Apple con memoria unificada, algo inviable con los pesos originales en precision completa o en 16 bits. La model card es minima y se limita a los detalles de cuantizacion; no incluye informacion sobre el modelo base, la longitud de contexto, los idiomas soportados ni la licencia.

La relevancia de esta ficha es acotada y conviene ser explicito: el repositorio no aporta benchmarks, no declara licencia, no documenta el proceso de entrenamiento y no ha recibido descargas ni valoraciones en el momento de la consulta. Ademas, la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo. Todo lo que no aparece en los metadatos o en la model card se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta de tipo de modelo del repositorio es "qwen4_exp"; no se especifica si es transformer denso, MoE o hibrida) |
| Parametros totales | 179.999.981.459 (unos 180.000 millones), segun los safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, cuantizacion mixta de precision generada con oQ (oMLX v0.7.0.dev2), identificador "oQ5e" |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (128,6 GB en total) |
| Tamano del repositorio | 128,6 GB |
| Fecha de publicacion | 15 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Libreria | mlx |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base. La etiqueta `qwen4_exp` del repositorio indica el tipo de modelo registrado por la herramienta de cuantizacion, pero no permite confirmar si se trata de un transformer denso, de una mezcla de expertos (MoE) o de una arquitectura hibrida. Tampoco se documenta el numero de parametros activos, por lo que no se puede determinar el coste real de inferencia por token mas alla del peso total de los pesos cuantizados.

Respecto al entrenamiento, la model card no incluye informacion sobre volumen de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas. El sufijo "mtp" del nombre del repositorio sugiere prediccion multi-token (multi-token prediction), pero esto es una inferencia a partir del nombre y no un dato confirmado en la documentacion. Lo unico verificable es el proceso de cuantizacion: se aplico cuantizacion mixta de 5 bits con tamano de grupo 64 mediante la herramienta oQ, que asigna precision de forma no uniforme a las distintas capas. La model card advierte ademas que estos pesos reemplazan a una version anterior subida antes del 15 de septiembre de 2026 y que conviene volver a descargarlos si se obtuvo una copia previa.

## Capacidades

- No hay capacidades documentadas en la model card ni en los metadatos del repositorio.
- La unica capacidad verificable es la de servir pesos cuantizados a 5 bits en formato MLX para inferencia en Apple Silicon.
- Generacion de texto, razonamiento, codigo, matematicas o vision: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, vision, audio): no disponible.
- Nota: el termino "Uncensored" en el nombre del modelo base indica, con alta probabilidad, que se han eliminado o atenuado las capas de alineacion de seguridad. Esto no esta confirmado por documentacion, pero debe tratarse como una advertencia a la hora de desplegar el modelo.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el caso de uso principal y el unico respaldado directamente por el repositorio. Gracias a la cuantizacion de 5 bits, los ~180.000 millones de parametros ocupan 128,6 GB en disco y se pueden cargar en un Mac con memoria unificada de 256 GB o superior, evitando el coste de GPU dedicadas.
- Experimentacion con cuantizacion mixta: el modelo sirve como caso de estudio de la herramienta oQ y su estrategia de asignacion de bits por capa, comparando calidad frente a cuantizaciones uniformes de 4 u 8 bits.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad entre los pesos originales y esta version de 5 bits, siempre que se disponga de los pesos de referencia y de tareas de evaluacion propias.
- Procesamiento por lotes offline: con 128,6 GB de pesos residentes, resulta razonable para trabajos batch nocturnos (resumen, clasificacion, extraccion de datos) donde la latencia no es critica y se busca amortizar la memoria ocupada.
- Servicio interno de generacion de texto: desplegable con mlx-lm sobre un Mac Studio compartido, exponiendo un endpoint HTTP para un equipo pequeno, siempre que se valide antes la licencia y la calidad del modelo.
- Prototipado de aplicaciones de lenguaje natural en investigacion: permite probar prompts y flujos completos sin depender de APIs externas ni enviar datos a terceros.
- Base para conversiones a otros formatos: los pesos MLX pueden servir de origen para generar versiones GGUF u otros formatos destinados a hardware CUDA, aunque ese proceso no esta documentado ni soportado por el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente detalla los parametros de cuantizacion (5 bits, group size 64, formato MLX safetensors) y no incluye ninguna medida de calidad, latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos ocupan 128,6 GB en disco. La estimacion teorica a 5 bits para 180.000 millones de parametros es de 112,5 GB, por lo que el resto del repositorio corresponde a capas conservadas en mayor precision. En ejecucion hay que anadir el KV cache y el overhead del runtime, no cuantificables sin conocer la longitud de contexto y el numero de capas, que no estan documentados. Como referencia practica, reservar 140-160 GB de memoria unificada.
- GPU recomendadas: no aplicable de forma directa, ya que el formato MLX esta disenado para Apple Silicon. Para hardware NVIDIA habria que convertir los pesos a otro formato, algo no documentado en este repositorio.
- Equipos Apple: un Mac con 128 GB de memoria unificada no es suficiente (los pesos ya ocupan 128,6 GB y no queda margen para el sistema ni para el KV cache). Se recomienda un minimo de 192 GB, y de forma comoda 256 GB o 512 GB (Mac Studio M2 Ultra de 192 GB al limite, M3 Ultra de 256/512 GB con margen holgado).
- Cabe en GPU de consumo: no. Ni una RTX 4090 de 24 GB ni una RTX 5090 de 32 GB pueden alojar estos pesos, ni siquiera combinando cuatro unidades en un servidor convencional.
- Opciones de despliegue: mlx-lm y el ecosistema MLX sobre macOS. vLLM, TGI, llama.cpp y Ollama no consumen safetensors MLX de forma nativa; su uso exigiria una conversion previa a GGUF u otro formato, no incluida en este repositorio.
- Latencia y throughput estimados: no disponible. Dependera del chip, de la memoria unificada disponible y de la longitud de contexto efectiva, dato que no se documenta.

## Comparativa con modelos similares

La comparativa es necesariamente incompleta: el modelo analizado no declara licencia, contexto ni benchmarks, por lo que las celdas correspondientes se dejan como no disponibles. Los datos de los modelos alternativos son informacion publica de sus respectivas fichas y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Formato en este repositorio |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp | 179.999.981.459 (activos: no disponible) | no disponible | no disponible | MLX safetensors, 5 bits |
| Llama 3.1 405B | 405.000 millones (denso) | 128.000 tokens | Llama 3.1 Community License | no aplica (referencia) |
| DeepSeek-V3 | 671.000 millones totales / 37.000 millones activos (MoE) | 128.000 tokens | MIT | no aplica (referencia) |
| Familia Qwen2.5 72B | 72.000 millones (denso) | 128.000 tokens | licencia Qwen | no aplica (referencia) |

Observaciones: el modelo aqui descrito se situa en la franja de los 180.000 millones de parametros, entre las alternativas densas de 70.000 millones y las de 400.000 millones o mas. Su ventaja concreta es el empaquetado en 5 bits para Apple Silicon; su desventaja es la ausencia total de documentacion sobre rendimiento, contexto y licencia, lo que impide una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial, redistribucion ni modificacion. Es el caveat mas importante antes de cualquier despliegue en produccion.
- Modelo "uncensored": el nombre del modelo base indica la probable eliminacion de capas de alineacion de seguridad. No hay documentacion que lo confirme, pero el riesgo de generar contenido danino, ilegal o sesgado debe considerarse elevado y requiere filtros externos.
- Riesgo de alucinacion: no cuantificado. No hay benchmarks ni evaluaciones de fidelidad, y la cuantizacion agresiva a 5 bits puede degradar la calidad respecto a los pesos originales.
- Perdida por cuantizacion: la cuantizacion mixta de 5 bits con group size 64 introduce error numerico. No se publica ninguna comparacion de calidad frente a los pesos sin cuantizar.
- Idiomas: no disponible. No se puede confirmar el soporte de castellano ni de otras lenguas.
- Contexto: no disponible. Sin este dato no se pueden disenar aplicaciones que dependan de ventanas largas ni dimensionar el KV cache.
- Sesgos: no evaluados en la informacion disponible.
- Pesos reemplazados: la model card advierte de que esta version sustituye a una anterior. Cualquier resultado reproducible debe indicar la fecha de descarga.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan contrastar su funcionamiento.
- Ecosistema restringido: al ser MLX, queda limitado a Apple Silicon. No hay versiones GGUF, AWQ ni GPTQ en este repositorio.
- Trazabilidad del modelo base: no se enlaza el modelo original ni se documenta que cambios introduce la variante "Uncensored".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp
- Organizacion mlx-community: https://huggingface.co/mlx-community
- Herramienta de cuantizacion oQ / oMLX (referenciada en la model card): https://github.com/jundot/omlx
- Modelo base, paper, blog o demo: no disponible (no se enlazan en la model card).
- Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los resultados obtenidos correspondian a un servicio publico frances de ayuda frente a la ciberdelincuencia y no guardan relacion con la ficha.
