# RunningHubAI/rh-qwen3.6-35b-a3b-f16-gguf

## Resumen

rh-qwen3.6-35b-a3b-f16-gguf es un repositorio publicado por RunningHubAI en Hugging Face cuyo único peso disponible es el proyector multimodal `mmproj-Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-f16.gguf`, de 858 MiB en precisión f16. La model card lo describe como componente obligatorio para capacidades de visión (análisis de imágenes, OCR, lectura de capturas y preguntas y respuestas multimodales) dentro de un flujo de trabajo de ComfyUI, y etiqueta el repositorio con el pipeline `text-to-image` y la etiqueta `unet-gguf`.

Existe una contradicción relevante entre el nombre del modelo y su contenido real. El identificador sugiere un modelo de lenguaje Qwen3.6 de 35.000 millones de parámetros con arquitectura MoE y aproximadamente 3.000 millones de parámetros activos, mientras que los metadatos de Hugging Face reportan 446.571.248 parámetros totales y el repositorio solo contiene un archivo `mmproj` (proyector de visión), no los pesos completos del transformer ni del modelo de difusión. La model card indica además "Finetuned from: Qwen-image", lo que apunta a un modelo de generación de imágenes, en línea con la etiqueta `text-to-image`, pero no con la nomenclatura de la serie Qwen3.

El interés de esta ficha es, por tanto, principalmente documental: sirve para dejar constancia de que el repositorio no es utilizable de forma autónoma como modelo de lenguaje ni como modelo de generación de imágenes, ya que carece de los pesos principales, de licencia explícita, de idiomas declarados y de cualquier dato de entrenamiento o evaluación publicado. Cualquier despliegue en producción exige localizar primero los pesos base correspondientes en el proyecto original de RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con ~3B activos; la etiqueta del repositorio es `unet-gguf`, propia de modelos de difusion) |
| Parametros totales | 446.571.248 segun metadatos de Hugging Face; el identificador del modelo indica 35B (35.000 millones) - dato contradictorio y no verificado |
| Parametros activos | no disponible (el sufijo A3B del nombre sugeriria ~3.000 millones, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico archivo publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream, sin especificarla) |
| Formato de pesos | GGUF (`mmproj-Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-f16.gguf`, 858 MiB) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | text-to-image |
| Etiquetas | gguf, comfyui, unet-gguf, text-to-image |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. El nombre del modelo apunta a un transformer con mezcla de expertos (MoE) de la familia Qwen3.6 con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, pero la model card declara "Finetuned from: Qwen-image" y clasifica el artefacto como `text-to-image` con etiqueta `unet-gguf`, terminologia habitual en modelos de difusion (UNet) para generacion de imagenes. Ambas descripciones son incompatibles entre si y no hay documentacion que las reconcilie.

El unico archivo del repositorio, `mmproj-...-f16.gguf`, corresponde por convencion de nomenclatura a un proyector multimodal (`mmproj`), el adaptador que conecta un codificador visual con un modelo de lenguaje en arquitecturas tipo LLaVA o Qwen-VL. El subnombre "Uncensored-HauhauCS-Aggressive" sugiere un ajuste fino orientado a eliminar filtros de contenido, sin que se documenten el dataset, el numero de tokens, la composicion de los datos ni si hubo etapas de RLHF o DPO. No se publican detalles de innovaciones tecnicas como atencion lineal, decodificacion especulativa o variantes de atencion eficiente.

## Capacidades

- Vision multimodal: la model card exige este archivo para analisis de imagenes, lectura de capturas de pantalla, reconocimiento de portadas y OCR.
- Preguntas y respuestas sobre imagenes: el autor lo presenta como requisito para conversaciones multimodal.
- Generacion de texto: no confirmada en la informacion disponible; depende de un modelo base que no se incluye en el repositorio.
- Generacion de imagenes: el pipeline declarado es `text-to-image`, pero el repositorio no contiene pesos de difusion ni de UNet.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el repositorio incluye una version del README en chino, pero no se declaran idiomas soportados).
- Modo de razonamiento (thinking): no disponible.

## Casos de uso

- Analisis de imagenes en local con ComfyUI: el archivo `mmproj` se cargaria como adaptador visual junto al modelo base correspondiente para tareas de descripcion de imagen y respuesta a preguntas sobre la misma. Es el caso de uso que el autor declara explicitamente.
- OCR y digitalizacion de documentos: el autor menciona el reconocimiento optico de caracteres como capacidad cubierta por este archivo, util para extraer texto de capturas o imagenes escaneadas dentro de un flujo ComfyUI.
- Reconocimiento de portadas y catalogacion de medios: la model card cita la identificacion de portadas como escenario previsto, aplicable a bibliotecas de contenido o sistemas de gestion documental.
- Moderacion y analisis de capturas de pantalla: la variante "Uncensored" apunta a flujos donde los filtros estandar limitan el analisis; conviene evaluar el riesgo etico y legal antes de cualquier uso.
- Prototipado de pipelines multimodales en ComfyUI: sirve para experimentar con la conexion vision-lenguaje sin necesidad de convertir pesos, al estar ya en formato GGUF.
- Integracion via API de RunningHub: el autor ofrece endpoints de API en `runninghub.ai` y `runninghub.cn`, pensados para invocar el modelo alojado sin gestionar infraestructura propia.
- Evaluacion comparativa de proyectores multimodales: investigadores pueden usar este archivo para medir como afecta un `mmproj` ajustado sin censura al rendimiento en tareas de descripcion e interpretacion de imagenes.
- No es adecuado, con la informacion disponible, para generacion de codigo, matematicas, razonamiento complejo, agentes autonomos ni generacion de imagenes de extremo a extremo, ya que faltan los pesos principales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion, y no se documentan comparaciones con modelos de referencia.

## Requisitos de hardware

- El unico archivo publicado pesa 858 MiB en f16, por lo que su carga requiere aproximadamente 1 GB de VRAM o RAM, segun el backend.
- Cabe sin problema en cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en modo CPU puro.
- Al ser un proyector multimodal, el consumo real de memoria depende del modelo base al que se conecte, cuyos pesos no estan en este repositorio y cuyo tamano no se puede determinar con la informacion disponible.
- Si el modelo subyacente fuese realmente un MoE de 35.000 millones de parametros, las estimaciones teoricas de peso serian de aproximadamente 70 GB en f16, 35 GB en Q8 y 20 GB en Q4, cifras derivadas del recuento nominal del nombre y no confirmadas por el autor.
- Opciones de despliegue: ComfyUI (soporte nativo de `unet-gguf` y `mmproj`), llama.cpp en sus variantes con soporte multimodal, y los endpoints alojados de RunningHub; vLLM, TGI y Ollama no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar modelos comparables con datos verificables, ya que no se especifica el modelo base, el tamano real de parametros, el contexto ni el rendimiento. La model card cita Qwen-image como origen del ajuste fino, pero no aporta ninguna metrica que permita una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos verificables |
|---|---|---|---|---|---|
| rh-qwen3.6-35b-a3b-f16-gguf | 446.571.248 (metadatos) / 35B (nombre) | no disponible | no disponible | solo proyector `mmproj` en HF | no |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no |

## Limitaciones y advertencias

- El repositorio no contiene los pesos completos del modelo, solo un proyector multimodal de 858 MiB; sin el modelo base es inutilizable de forma autonoma.
- Contradiccion no resuelta entre el nombre (Qwen3.6 35B A3B, aparentemente un LLM MoE) y la declaracion de la model card (ajuste de Qwen-image para text-to-image); no se puede determinar la naturaleza real del artefacto.
- Discrepancia entre los 446.571.248 parametros reportados en los metadatos y los 35.000 millones que sugiere el identificador.
- Ausencia total de licencia explicita: la model card remite a la licencia del proyecto original o upstream, lo que impide evaluar si el uso comercial esta permitido.
- La denominacion "Uncensored" y el subnombre "Aggressive" indican un ajuste fino para reducir o eliminar filtros de contenido, con el consiguiente riesgo de generar material inapropiado, ofensivo o ilegal.
- Riesgo de alucinacion: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no declarados, lo que impide garantizar un comportamiento correcto en castellano.
- Cero descargas y cero likes, ademas de una fecha de creacion y actualizacion separadas por un minuto, lo que sugiere una publicacion automatizada sin validacion comunitaria.
- Longitud de contexto, cuantizaciones adicionales y requisitos de memoria del modelo completo: no disponibles.
- Antes de cualquier uso en produccion, es imprescindible localizar el proyecto original en `runninghub.cn` y verificar la licencia y la composicion real de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen3.6-35b-a3b-f16-gguf
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2063630866307444738
- Pagina del autor: https://www.runninghub.cn/user-center/1929731488613310465
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Paper, repositorio de codigo y demo: no disponibles.
