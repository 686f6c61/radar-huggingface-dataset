# Canfield/Qwen3.5-4B-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una copia byte a byte de un unico fichero GGUF: `Qwen3.5-4B-Q4_K_M.gguf`, una cuantizacion en Q4_K_M del modelo base Qwen/Qwen3.5-4B, desarrollado por el equipo Qwen de Alibaba Cloud. El responsable de la cuantizacion es el equipo de LM Studio (lmstudio-community), que la genero con llama.cpp release b8185, y el usuario Canfield la redistribuye sin modificaciones para que sus aplicaciones locales puedan descargar un fichero fijo verificado por hash. No se trata, por tanto, de un modelo nuevo ni de un ajuste fino: es un artefacto de distribucion.

El modelo base cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y licencia Apache 2.0. Al ser una cuantizacion Q4_K_M, el fichero ocupa 2.707.513.696 bytes (unos 2,7 GB), lo que lo situa en el rango de modelos que se pueden ejecutar en GPU de consumo. El repositorio incluye la plantilla de chat de Ollama configurada con 32.768 tokens de contexto, decodificacion voraz (temperatura 0) y el token de parada `<|im_end|>`.

La relevancia de esta publicacion es practica: fija una revision concreta y un hash SHA-256 reproducible, algo util en despliegues donde se necesita garantizar que todos los nodos cargan exactamente los mismos pesos. Es una copia solo de texto (no incluye el proyector de vision) y con el modo de razonamiento ("thinking") desactivado por defecto en la plantilla de Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es Qwen/Qwen3.5-4B; la informacion proporcionada no detalla su arquitectura interna) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 32.768 tokens (segun los `params` de la plantilla de Ollama incluida; no se especifica si es el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M en este repositorio; el repositorio origen de lmstudio-community puede ofrecer otras variantes, no detalladas en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud, Qwen) |
| Formato de pesos | GGUF (fichero `Qwen3.5-4B-Q4_K_M.gguf`, 2.707.513.696 bytes, SHA-256 `25082a7dd3776cc3c741c6347d3bd04523f05796607b3fbc32fa3a25dfa1418c`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B en los datos proporcionados: no se detalla si es un transformer denso, una mezcla de expertos, un modelo de espacio de estados o una arquitectura hibrida, ni el numero de capas, cabezas de atencion, dimension oculta o tipo de atencion. Tampoco se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico documentado en esta ficha es el proceso de cuantizacion: LM Studio genero el fichero con llama.cpp release b8185 a partir de la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen/Qwen3.5-4B, usando el esquema Q4_K_M. La copia publicada por Canfield es identica byte a byte al original de lmstudio-community (revision `f9f88ac3e234be915e23811a6d28ea287bdb927e`) y no introduce ninguna modificacion adicional.

Como innovacion tecnica relevante en el plano de despliegue, cabe senalar que Qwen3.5 razona ("piensa") por defecto, pero la plantilla de este repositorio cierra el bloque de pensamiento de antemano, de modo que el modelo no emite razonamiento explicito. Este comportamiento se verifico token a token contra el resultado de usar `--jinja` en llama.cpp con `enable_thinking: false`.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo esta etiquetado como conversacional, con plantilla de chat oficial de Qwen3.5.
- Modo de razonamiento explicito disponible en el modelo base, pero desactivado en este repositorio: la plantilla de Ollama cierra el bloque de pensamiento y Ollama rechaza la opcion `think: true`, reportando unicamente la capacidad `completion`.
- Procesamiento exclusivamente de texto: el repositorio no incluye el proyector de vision (`mmproj-Qwen3.5-4B-BF16.gguf`), por lo que no puede leer imagenes aunque el modelo base disponga de esa capacidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas en la ficha.
- Contexto utilizable de 32.768 tokens segun la configuracion incluida, suficiente para conversaciones multi-turno extensas y documentos de tamano medio.
- Decodificacion determinista por defecto (temperatura 0), util para tareas reproducibles.

## Casos de uso

- Despliegue local reproducible en estaciones de trabajo: al estar fijado el hash SHA-256 del fichero, se puede verificar la integridad de los pesos en cada instalacion y garantizar que todos los equipos de un equipo de desarrollo ejecutan exactamente la misma cuantizacion.
- Asistentes conversacionales embebidos en aplicaciones de escritorio: la plantilla incluida define contexto de 32.768 tokens, decodificacion voraz y token de parada, de modo que puede integrarse en un flujo de chat sin ajuste adicional mediante `ollama pull hf.co/Canfield/Qwen3.5-4B-Q4_K_M-GGUF`.
- Generacion de texto y resumen de documentos de extension media: con 32.768 tokens de ventana se pueden procesar informes, actas o articulos completos en una sola pasada sin fragmentacion agresiva.
- Prototipado rapido de funcionalidades de lenguaje natural: al ocupar unos 2,7 GB, el modelo se carga en portatiles con GPU modesta, lo que permite iterar en local antes de escalar a modelos mayores.
- Tareas de clasificacion y extraccion de informacion con salida determinista: la temperatura 0 configurada por defecto favorece respuestas estables cuando se necesita un etiquetado consistente sobre lotes de texto.
- Entornos con restricciones de conectividad o privacidad de datos: la inferencia puede ejecutarse integramente en local con Ollama o llama.cpp, sin enviar contenido a servicios externos.
- Base para experimentos comparativos de cuantizacion: al ser una copia sin modificar de un artefacto conocido, sirve como referencia controlada al medir diferencias de calidad frente a otras cuantizaciones del mismo modelo base.
- Servicio de chat de baja latencia para demo o uso interno: el tamano reducido del modelo permite respuestas rapidas en GPU de consumo, adecuado para asistentes internos con carga moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB solo para los pesos en Q4_K_M (el fichero ocupa 2,7 GB); hay que sumar el cache KV, que crece con la longitud de contexto y puede anadir varios GB a 32.768 tokens. No se dispone del calculo exacto de cache KV por capa en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM resulta suficiente para contextos moderados; para aprovechar la ventana completa de 32.768 tokens conviene disponer de 12-16 GB o mas. No se dispone de datos de rendimiento especificos para A100, H100 o RTX 4090 con este fichero concreto.
- Viabilidad en GPU de consumo: si, cabe en tarjetas como RTX 3060, RTX 4060, RTX 4070 y equivalentes con 8 GB o mas, con margen creciente segun VRAM. Tambien puede ejecutarse parcialmente en CPU con llama.cpp, a costa de menor velocidad.
- Opciones de despliegue: Ollama, con la plantilla y los `params` ya incluidos en el repositorio, y llama.cpp usando la plantilla propia del GGUF con `--jinja` y `chat_template_kwargs: {"enable_thinking": false}`. Otros motores compatibles con GGUF (por ejemplo LM Studio, dado el origen de la cuantizacion) no se confirman explicitamente en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canfield/Qwen3.5-4B-Q4_K_M-GGUF (este repositorio) | 4.205.751.296 | 32.768 tokens configurados en la plantilla de Ollama | GGUF Q4_K_M, un unico fichero | Apache 2.0 | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| lmstudio-community/Qwen3.5-4B-GGUF | mismo modelo base | no disponible | GGUF (incluye proyector de vision `mmproj-Qwen3.5-4B-BF16.gguf`) | Apache 2.0 | Publico en HuggingFace, repositorio de origen de la cuantizacion |
| Qwen/Qwen3.5-4B | 4.205.751.296 (segun los pesos de referencia) | no disponible | safetensors (pesos originales sin cuantizar) | Apache 2.0 | Publico en HuggingFace, modelo base oficial del equipo Qwen |

No se dispone de datos verificados de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que no se incluyen comparaciones de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la informacion proporcionada no documenta analisis de sesgo del modelo base ni de la cuantizacion.
- Riesgo de alucinacion: no cuantificado en los datos disponibles. Como cualquier modelo de lenguaje de 4,2 mil millones de parametros, es previsible que genere contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual denso; se recomienda verificacion en produccion.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en safetensors. No se han publicado mediciones de la degradacion en este repositorio.
- Limitacion de modalidad: el repositorio es solo texto. No incluye el proyector de vision del modelo base, por lo que no procesa imagenes.
- Limitacion de razonamiento: la plantilla incluida desactiva el modo "thinking". Si el caso de uso requiere razonamiento explicito, hay que usar el GGUF con la plantilla propia de llama.cpp y `enable_thinking: true`, no la plantilla de este repositorio.
- Confirmado para Ollama, que rechaza `think: true` y solo anuncia la capacidad `completion`.
- Idioma: no se especifican idiomas soportados; el rendimiento fuera del ingles y el chino no esta documentado.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright (Copyright 2026 Alibaba Cloud, Qwen) y el texto de la licencia incluido en el repositorio.
- Advertencia de reproducibilidad: el valor del repositorio depende de que el fichero coincida con el SHA-256 indicado; conviene verificar el hash tras la descarga, ya que no se ofrecen garantias adicionales mas alla de la copia byte a byte.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni con reportes independientes de comportamiento en produccion.
- No se ha documentado soporte de tool calling, function calling ni flujos de agente, por lo que no deben asumirse estas capacidades sin verificacion previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Canfield/Qwen3.5-4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Repositorio de la cuantizacion original: https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF (revision `f9f88ac3e234be915e23811a6d28ea287bdb927e`)
- Release de llama.cpp utilizada para cuantizar: https://github.com/ggml-org/llama.cpp/releases/tag/b8185
- Descarga mediante Ollama: `ollama pull hf.co/Canfield/Qwen3.5-4B-Q4_K_M-GGUF`
