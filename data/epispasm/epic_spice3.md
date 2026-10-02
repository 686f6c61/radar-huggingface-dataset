# epispasm/epic_spice3

## Resumen

epic_spice3 es una conversion a formato GGUF de un modelo vision-lenguaje de aproximadamente 8.953.803.264 parametros (unos 8,95 mil millones), publicada por el usuario epispasm en HuggingFace. Segun los tags y los nombres de fichero del repositorio, el modelo deriva de una base Qwen3.5 de 9B y ha sido ajustado para la tarea de generacion de descripciones de imagenes (captioning) con contenido NSFW, en su version v5. La conversion a GGUF se ha realizado con la herramienta Unsloth, y los ficheros resultantes estan pensados para su uso con llama.cpp.

El repositorio incluye dos ficheros: los pesos del modelo en BF16 (qwen3.5-9b-nsfw-captioning-v5.BF16.gguf) y el proyector multimodal (qwen3.5-9b-nsfw-captioning-v5.BF16-mmproj.gguf), lo que confirma que se trata de un modelo multimodal con entrada de imagen y salida de texto. El tamano total del repositorio es de 18,8 GB. El pipeline no esta declarado, la licencia no esta especificada y no se indican idiomas soportados.

El modelo tiene un interes limitado para el publico general: no cuenta con descargas ni valoraciones (0 descargas, 0 likes), no incluye model card descriptiva mas alla de las instrucciones de uso, no declara licencia y no aporta datos de entrenamiento ni resultados de benchmarks. Su relevancia es circunstancial, como ejemplo de conversion a GGUF de un VLM de ~9B para tareas de captioning especializado y como muestra del ecosistema de herramientas (Unsloth + llama.cpp) para llevar modelos multimodales a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags y el nombre de fichero indican base Qwen3.5 9B con adaptacion vision-lenguaje) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors solo para el recuento de parametros; no se distribuyen pesos en safetensors) |
| Ficheros del repositorio | qwen3.5-9b-nsfw-captioning-v5.BF16.gguf, qwen3.5-9b-nsfw-captioning-v5.BF16-mmproj.gguf |
| Tamano del repositorio | 18,8 GB |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. Los tags del repositorio (qwen3_5, vision-language-model) y el nombre de los ficheros (qwen3.5-9b-nsfw-captioning-v5) apuntan a un transformer multimodal derivado de una base Qwen3.5 de 9B, con un proyector multimodal separado en formato GGUF (mmproj) que conecta el codificador visual con el modelo de lenguaje. No hay confirmacion por parte del autor ni documentacion adicional sobre la estructura exacta del codificador de vision, el tipo de atencion o si se emplean tecnicas como atencion lineal o decodificacion especulativa.

Tampoco se detalla el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El sufijo "nsfw-captioning-v5" sugiere un ajuste fino especifico sobre datos de captioning con contenido explicito, en su quinta iteracion, pero no se aporta ninguna cifra al respecto. La unica informacion tecnica verificable es el proceso de conversion a GGUF mediante Unsloth y la disponibilidad de un fichero de proyector multimodal para inferencia con llama-mtmd-cli.

## Capacidades

- Generacion de texto conversacional (tag conversational en el repositorio).
- Procesamiento de imagenes y generacion de descripciones, segun la presencia del fichero mmproj y el tag vision-language-model.
- Especializacion en captioning de contenido NSFW, segun el nombre de los ficheros del repositorio.
- Compatibilidad con endpoints, segun el tag endpoints_compatible.
- Integracion con llama.cpp y el ecosistema GGUF para inferencia local.
- Soporte de plantillas de chat mediante la opcion --jinja en los comandos de ejemplo.

No hay informacion disponible sobre soporte de tool calling o function calling, capacidades de agente, razonamiento multi-paso, modo thinking, capacidades multilingues, generacion de codigo, matematicas o audio.

## Casos de uso

- Generacion automatica de descripciones de imagenes en local: el modelo puede procesarse con llama-mtmd-cli sobre hardware propio, sin enviar imagenes a servicios externos, lo que resulta util cuando la politica de privacidad impide el uso de APIs en la nube.
- Etiquetado de conjuntos de datos de imagenes: dado que el modelo esta ajustado especificamente para captioning, puede emplearse para preanotar datasets de vision antes de una revision humana, reduciendo el trabajo manual en pipelines de anotacion.
- Moderacion de contenido con criterios explicitos: al estar entrenado sobre contenido NSFW, puede usarse como componente auxiliar para describir y clasificar material sensible dentro de un sistema de moderacion propio.
- Clasificacion y filtrado de imagenes en archivos privados: el modelo puede generar descripciones textuales que despues se indexan en un motor de busqueda interno, permitiendo busqueda semantica sobre bibliotecas de imagenes personales.
- Investigacion sobre sesgos en modelos multimodales: la ausencia de documentacion y su naturaleza especializada lo convierten en un caso de estudio para analizar como el ajuste fino sobre contenido explicito afecta al comportamiento general del modelo.
- Prototipado de asistentes visuales en local: con llama-cli para texto y llama-mtmd-cli para multimodal, sirve como base rapida para probar interfaces conversacionales con entrada de imagen en entornos de desarrollo.
- Pruebas de conversion y despliegue GGUF: el repositorio es un ejemplo directo del flujo Unsloth a GGUF con proyector multimodal separado, util para validar toolchains de conversion y despliegue en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas, metricas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Peso de los parametros: 8.953.803.264 parametros. En BF16 (2 bytes por parametro) suponen aproximadamente 17,9 GB solo para los pesos del modelo, a los que se suma el fichero mmproj del proyector multimodal (tamano no especificado) y la cache KV.
- Estimacion de VRAM para inferencia (calculada a partir del recuento de parametros, no confirmada por el autor):
  - BF16: aproximadamente 18 a 20 GB mas cache KV.
  - Q8_0: aproximadamente 9,5 GB.
  - Q5_K_M: aproximadamente 6,5 GB.
  - Q4_K_M: aproximadamente 5,5 GB.
  - Q3_K_M: aproximadamente 4,5 GB.
- Solo se publican pesos en BF16 en el repositorio; el resto de cuantizaciones habria que generarlas localmente con llama.cpp.
- GPU recomendadas: para BF16, A100 40 GB, H100 80 GB o dos GPU de 24 GB; en consumer, RTX 4090 o RTX 3090 de 24 GB quedan justas para BF16 y comodas para Q8_0; RTX 4060 Ti de 16 GB o RTX 3060 de 12 GB son suficientes para cuantizaciones Q4 y Q5.
- Despliegue: llama.cpp (comandos indicados por el autor: llama-cli -hf epispasm/epic_spice3 --jinja para texto y llama-mtmd-cli -hf epispasm/epic_spice3 --jinja para multimodal), llama-cpp-python, Ollama y LM Studio. Para vLLM o TGI la compatibilidad con GGUF multimodales no esta confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas declaradas publicamente por cada proyecto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| epic_spice3 (epispasm) | ~8,95B | No disponible | No disponible | GGUF BF16, llama.cpp | No disponible |
| Qwen2.5-VL-7B-Instruct | ~7B | 128K (segun documentacion publica) | Apache 2.0 | Pesos en safetensors y cuantizaciones | No comparable directamente con este modelo |
| Llama-3.2-11B-Vision-Instruct | ~11B | 128K (segun documentacion publica) | Licencia comunitaria Llama 3.2 | Pesos en safetensors y GGUF | No comparable directamente con este modelo |

La comparacion es incompleta porque el modelo analizado no publica licencia, contexto, idiomas ni resultados de evaluacion, lo que impide establecer una equivalencia funcional con las alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna licencia en el repositorio, lo que en la practica impide determinar si el uso comercial esta permitido. No debe desplegarse en produccion sin aclarar este punto con el autor.
- Contenido NSFW: el modelo esta ajustado para generar descripciones de contenido explicito. Su uso inapropiado puede dar lugar a material no deseado y requiere controles de filtrado en cualquier despliegue con usuarios finales.
- Sin model card tecnica: no hay informacion sobre datos de entrenamiento, proceso de ajuste, composicion del dataset ni sesgos conocidos.
- Riesgo de alucinacion: no evaluado ni documentado. Al ser un modelo de captioning, puede describir elementos que no estan presentes en la imagen.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no es posible planificar conversaciones de contexto largo sin este dato.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por parte de la comunidad.
- Procedencia poco verificable: la etiqueta qwen3_5 y el nombre de fichero qwen3.5-9b no estan confirmados por documentacion del autor, por lo que la base real del modelo no puede darse por segura.
- Pesos unicamente en BF16: no se publican cuantizaciones listas para usar, lo que obliga a convertir localmente y anade pasos y posibles errores al despliegue.
- Requisitos de memoria elevados para BF16: aproximadamente 18 a 20 GB de VRAM, lo que excluye la mayoria de GPU de consumo sin cuantizar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/epispasm/epic_spice3
- Unsloth (herramienta de conversion declarada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia indicado en la model card): https://github.com/ggml-org/llama.cpp
