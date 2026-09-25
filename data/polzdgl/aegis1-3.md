# polzdgl/Aegis1.3

## Resumen

Aegis1.3 es una conversión al formato GGUF de un modelo multimodal (visión-lenguaje) de aproximadamente 9.200 millones de parámetros, publicada por el usuario polzdgl en Hugging Face. Los nombres de los ficheros del repositorio (`Qwen3.5-9B.Q6_K.gguf` y `Qwen3.5-9B.BF16-mmproj.gguf`) y la etiqueta `qwen3_5` indican que el modelo base es un Qwen3.5 de 9B, adaptado o ajustado por el autor bajo la denominación Aegis1.3. La conversión a GGUF se ha realizado con la herramienta Unsloth, lo que permite ejecutar el modelo en llama.cpp y en cualquier runtime compatible con este formato.

El interés principal de esta publicación es su carácter multimodal: además de los pesos cuantizados del modelo de lenguaje, incluye un fichero `mmproj` (proyector multimodal) que habilita la entrada de imágenes mediante `llama-mtmd-cli`. Al estar en formato GGUF con cuantización Q6_K, el modelo puede desplegarse en hardware de consumo con relativa comodidad, sin necesidad de GPUs de centro de datos. La integración con `--jinja` sugiere soporte de plantillas de chat, requisito habitual para el uso correcto de tool calling y conversaciones multi-turno.

Se trata, sin embargo, de una publicación con muy poca información pública: cero descargas, cero valoraciones, sin licencia declarada, sin idiomas especificados y sin model card detallada más allá de las instrucciones de uso y la lista de ficheros. Cualquier evaluación en producción debería partir de una validación empírica propia, dado que no hay benchmarks ni documentación de entrenamiento disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; los tags y nombres de fichero apuntan a un transformer multimodal basado en Qwen3.5 (visión-lenguaje, con proyector `mmproj`) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q6_K; el proyector multimodal se distribuye en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); fichero adicional `mmproj` en BF16 para la torre de visión |
| Tamano del repositorio | 8,5 GB |
| Ficheros incluidos | `Qwen3.5-9B.Q6_K.gguf`, `Qwen3.5-9B.BF16-mmproj.gguf` |
| Fecha de publicacion | 25 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas. Los unicos indicios disponibles son indirectos: la etiqueta `qwen3_5` y el nombre de los ficheros apuntan a que la base es un Qwen3.5 de 9B, y la presencia de un fichero `mmproj` junto con la etiqueta `vision-language-model` confirma que se trata de un modelo multimodal con capacidad de procesar imagenes. El proyector multimodal se distribuye sin cuantizar (BF16), mientras que los pesos del modelo de lenguaje van en Q6_K.

La unica innovacion tecnica documentada es el propio proceso de conversion: el autor indica que ha utilizado Unsloth para convertir el modelo a GGUF. El uso de la marca `endpoints_compatible` en los tags sugiere compatibilidad con APIs estilo OpenAI, y el flag `--jinja` en los ejemplos de uso indica que el modelo incluye plantilla de chat en formato Jinja, necesaria para que llama.cpp aplique correctamente el formato de conversacion del modelo original.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline declarado por el autor.
- Procesamiento de imagenes (vision-lenguaje): el fichero `mmproj` y la etiqueta `vision-language-model` habilitan entrada multimodal mediante `llama-mtmd-cli`.
- Conversacion multi-turno con plantilla de chat aplicada via `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs tipo OpenAI.
- Ejecucion local en llama.cpp y runtimes derivados.
- No hay informacion disponible sobre capacidades de razonamiento explicito (thinking mode), tool calling, function calling, agentes, matemáticas, generacion de codigo o soporte multilingue especifico.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en llama.cpp sobre una estacion de trabajo con GPU de consumo y gestionar dialogos multi-turno aplicando la plantilla Jinja, sin enviar datos a servicios externos.
- Descripcion y analisis de imagenes en local: mediante `llama-mtmd-cli` con el fichero `mmproj`, se pueden procesar capturas, diagramas o fotografias y obtener descripciones textuales sin depender de APIs en la nube.
- Prototipado de aplicaciones multimodales: al ser un GGUF de ~8,5 GB, es adecuado para validar rapidamente arquitecturas de producto que combinen texto e imagen antes de escalar a modelos mayores.
- Entornos con requisitos de privacidad: al ejecutarse integramente en hardware propio, encaja en escenarios donde no esta permitido enviar imagenes o texto a terceros (sanidad, legal, industria).
- Integracion en pipelines con API compatible con OpenAI: la etiqueta `endpoints_compatible` permite sustituir un endpoint remoto por una instancia local sin reescribir el codigo del cliente, util para desarrollo y pruebas de integracion.
- Generacion asistida sobre documentacion escaneada: combinando vision y texto, puede extraer informacion de capturas o documentos digitalizados y reformularla en texto estructurado, siempre con validacion humana posterior.
- Experimentacion academica con modelos multimodal en formato GGUF: sirve como banco de pruebas para estudiar el comportamiento de cuantizaciones Q6_K en tareas de vision-lenguaje sobre hardware limitado.

Advertencia: dado que no hay benchmarks publicados, ninguno de estos casos de uso debe darse por validado sin una evaluacion propia previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con Q6_K: aproximadamente 7,5-8 GB para los pesos del modelo, mas la cache KV (dependiente de la longitud de contexto, que no se ha especificado) y el proyector multimodal en BF16 (unos cientos de MB adicionales).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) o A100/H100 si se busca maxima concurrencia; en estas tarjetas el modelo cabe con amplio margen.
- GPU de consumo: si, cabe en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) con Q6_K, aunque en 12 GB conviene controlar el tamano de contexto y el offload de capas. En tarjetas de 8 GB seria necesario recurrir a cuantizaciones mas agresivas no incluidas en el repositorio.
- Opciones de despliegue: llama.cpp (mediante `llama-cli` para texto y `llama-mtmd-cli` para multimodal), llama-cpp-python, LM Studio, Ollama (importando el GGUF) y servidores compatibles con endpoints OpenAI. El soporte de GGUF en vLLM es limitado y no es la via recomendada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos tecnicos suficientes del modelo base (Qwen3.5-9B) ni de benchmarks de Aegis1.3 para establecer una comparacion rigurosa. La unica referencia directa es la version anterior publicada por el mismo autor:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polzdgl/Aegis1.3 | ~9,2 B | No disponible | GGUF (Q6_K + mmproj BF16) | No disponible | Publico en Hugging Face |
| polzdgl/aegis1.2-c-7b | ~7 B | 32.768 tokens (segun ficha de terceros) | No disponible en la informacion consultada | No disponible | Publico en Hugging Face |
| Modelo base Qwen3.5-9B | ~9 B (estimado) | No disponible | No disponible | No disponible | No disponible en la informacion consultada |

Las filas correspondientes a la version 1.2 proceden de una ficha de terceros (free2aitools) y no de la model card oficial, por lo que deben tomarse con cautela. No se han encontrado comparaciones con alternativas equivalentes de otros autores.

## Limitaciones y advertencias

- Ausencia total de benchmarks, evaluaciones o documentacion de entrenamiento: no hay evidencia publica del rendimiento del modelo en ninguna tarea.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas soportados no especificados: se desconoce si el modelo funciona correctamente en castellano o si esta limitado a ingles y chino.
- Longitud de contexto no disponible: no se puede dimensionar la cache KV ni garantizar el comportamiento en conversaciones largas.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este caso por falta de evaluaciones.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgos.
- Cero adopcion publica (0 descargas, 0 likes): no existe retroalimentacion de la comunidad que permita anticipar problemas de calidad, formatos de prompt o incompatibilidades.
- Naturaleza derivada: al ser una conversion de un modelo base, hereda sus limitaciones, y la cuantizacion Q6_K puede introducir degradaciones adicionales frente a los pesos originales en precision completa.
- Fecha de publicacion atipica (2026): conviene verificar la vigencia y el estado del repositorio antes de integrarlo.
- Confirmar el formato de prompt antes de usar `--jinja`: una plantilla mal aplicada degrada notablemente la calidad de las respuestas en modelos ajustados por instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polzdgl/Aegis1.3
- Version anterior del autor: https://huggingface.co/polzdgl/aegis1.2-c-7b
- Ficha de terceros sobre aegis1.2-c-7b: https://free2aitools.com/model/polzdgl/aegis1.2-c-7b
- Unsloth (herramienta de conversion empleada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggml-org/llama.cpp
