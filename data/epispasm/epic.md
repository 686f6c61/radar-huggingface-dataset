# epispasm/epic

## Resumen

`epispasm/epic` es un modelo multimodal (vision-language) de aproximadamente 8,95 mil millones de parametros, publicado por el usuario epispasm en HuggingFace unicamente en formato GGUF para su uso con llama.cpp. Los nombres de los ficheros del repositorio (`qwen3.5-9b-nsfw-captioning-v5`) indican que se trata de un ajuste fino orientado a la generacion de descripciones (captioning) de contenido para adultos, derivado de un modelo base de la familia Qwen 3.5 de 9B. La model card no aporta informacion sobre el proceso de entrenamiento, el dataset utilizado ni la licencia aplicable.

El repositorio contiene exclusivamente dos ficheros BF16: los pesos del modelo de lenguaje y el proyector multimodal (`mmproj`) necesario para procesar imagenes. No se publican variantes cuantizadas a 8, 5 o 4 bits, ni pesos en safetensors, lo que limita las opciones de despliegue a llama.cpp y a herramientas compatibles con GGUF. El modelo registra 0 descargas y 0 likes en el momento de la consulta, y tanto la licencia como los idiomas soportados figuran como no disponibles.

Su relevancia practica es limitada y muy especializada: cubre el nicho de anotacion automatica y etiquetado de imagenes para adultos, un caso de uso con demanda real en pipelines de moderacion, catalogacion de medios y generacion de datasets, pero con incertidumbre legal y tecnica considerable al no declararse licencia ni procedencia de los datos de entrenamiento. Ademas, la fecha de creacion registrada en HuggingFace (2026-09-21) y la referencia a un modelo base Qwen 3.5 no permiten verificar la trazabilidad del ajuste con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual con proyector `mmproj`); detalles completos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95 mil millones, segun metadatos de safetensors) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado); no se ofrecen variantes Q8, Q5, Q4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (`qwen3.5-9b-nsfw-captioning-v5.BF16.gguf` y `qwen3.5-9b-nsfw-captioning-v5.BF16-mmproj.gguf`) |
| Autor | epispasm |
| Modelo base (inferido del nombre de fichero) | Qwen 3.5 9B; no confirmado en la model card |
| Tamano del repositorio | 18,8 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo multimodal con arquitectura transformer: el repositorio incluye un fichero `mmproj` en BF16, que en el ecosistema llama.cpp corresponde al proyector que conecta un codificador visual con el modelo de lenguaje, y la etiqueta `vision-language-model` de HuggingFace confirma esta naturaleza. La etiqueta `qwen3_5` y el nombre del fichero apuntan a un modelo base de la familia Qwen 3.5 con aproximadamente 9B de parametros, ajustado despues para una tarea concreta de captioning. No se especifica si la arquitectura del lenguaje emplea atencion completa, atencion lineal o una mezcla, ni el tamano del codificador visual.

El proceso de conversion a GGUF se realizo con las herramientas de Unsloth, y la model card unicamente documenta los comandos de inferencia (`llama-cli` para texto y `llama-mtmd-cli` para multimodal, ambos con la opcion `--jinja` para plantillas de chat). No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se detalla la naturaleza ni el volumen de los datos del ajuste fino orientado a contenido NSFW.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el uso documentado de `llama-cli --jinja` indican soporte de dialogos multi-turno con plantilla de chat Jinja.
- Descripcion de imagenes (captioning): capacidad principal inferida del nombre del ajuste (`nsfw-captioning-v5`) y de la presencia del proyector multimodal; orientada especificamente a contenido para adultos.
- Procesamiento de entrada visual: el comando `llama-mtmd-cli` confirma que el modelo acepta imagenes ademas de texto, aunque no se detalla el numero de imagenes por prompt ni la resolucion soportada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el repositorio puede desplegarse en HuggingFace Inference Endpoints, si bien no se documenta la configuracion.
- Tool calling / function calling: no disponible; no se menciona en la model card ni en las etiquetas.
- Comportamiento agentico y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking): no disponible; no se documenta.
- Audio o video: no disponible; solo se declara vision.

## Casos de uso

- Anotacion de datasets de moderacion de contenido: el modelo puede generar descripciones automaticas de imagenes para adultos que sirvan como etiquetas de entrenamiento de clasificadores de moderacion, reduciendo el trabajo manual de anotadores humanos en un dominio sensible.
- Catalogacion y busqueda en plataformas de contenido: generar descripciones y metadatos textuales de grandes volumenes de imagenes permite construir indices de busqueda semantica sobre bibliotecas de medios, usando el modo multimodal de `llama-mtmd-cli`.
- Enriquecimiento de metadatos en DAM (Digital Asset Management): integrado en un pipeline por lotes, el modelo puede producir titulos y descripciones para ficheros que llegan sin metadatos, mejorando la recuperabilidad de los activos.
- Generacion de texto alternativo (alt text): para plataformas que requieren descripciones accesibles de todas sus imagenes, incluidas las de naturaleza adulta, el modelo cubre el tramo que los captioners de uso general suelen rechazar.
- Ingenieria inversa de prompts (image-to-prompt): a partir de una imagen se puede obtener una descripcion detallada que sirva como prompt para modelos generativos, util en flujos de trabajo de creacion asistida.
- Investigacion sobre sesgos y seguridad en modelos multimodales: disponer de un ajuste especializado permite estudiar como se comportan los VLM en dominios que los modelos alineados evitan, comparando tasas de rechazo y calidad descriptiva.
- Preprocesado en pipelines de difusion: las descripciones generadas pueden alimentar etapas posteriores de etiquetado, deduplicacion o clasificacion tematica sin intervencion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K, MMMU, CIDEr, etc.), no se ofrecen comparaciones con otros modelos y no se documentan evaluaciones cualitativas del ajuste NSFW.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 17,9 GB para los 8,95B de parametros, mas el proyector multimodal. El repositorio completo ocupa 18,8 GB.
- VRAM estimada para inferencia en BF16: alrededor de 19-21 GB contando pesos y cache KV con contexto moderado; con contextos largos la cifra puede superar los 24 GB.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o cualquier acelerador con 24 GB o mas. En una RTX 4090 o RTX 3090 de 24 GB el modelo BF16 entra de forma ajustada, con poco margen para contexto extenso.
- GPU de consumo: no cabe en tarjetas de 8, 12 o 16 GB en BF16. Solo seria viable tras cuantizar los pesos a Q4_K_M (estimacion aritmetica de unos 5,5 GB) o Q8_0 (unos 9,5 GB), conversion que el usuario debe realizar por su cuenta porque el repositorio no publica variantes cuantizadas.
- CPU: llama.cpp permite ejecucion en CPU con los ficheros GGUF, pero sin datos de latencia publicados y con rendimiento previsiblemente bajo para un modelo de casi 9B en BF16.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal, con `--jinja`), y herramientas derivadas como Ollama o LM Studio previa conversion del GGUF. vLLM y TGI no ofrecen soporte estable para GGUF multimodal; necesitarian pesos en safetensors, que no estan publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas publicas y no de la informacion proporcionada en esta busqueda; conviene verificarlos en la fuente original. No existen datos de rendimiento de `epispasm/epic` para establecer comparaciones cuantitativas.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| epispasm/epic | ~8,95B | No disponible | Texto + vision | No disponible | Solo GGUF BF16 |
| Qwen2.5-VL-7B-Instruct | ~8,3B | 32k nativo, extensible | Texto + vision | Apache 2.0 | Safetensors, GGUF de terceros |
| Llama-3.2-11B-Vision-Instruct | ~11B | 128k | Texto + vision | Llama 3.2 Community License | Safetensors, GGUF |
| InternVL2.5-8B | ~8B | 32k (segun ficha) | Texto + vision | MIT | Safetensors, GGUF de terceros |

Diferencias clave: los tres modelos alternativos son de proposito general y estan alineados para evitar contenido sensible, mientras que `epic` esta especializado en el dominio NSFW. Las alternativas cuentan con licencias explicitas y resultados de benchmarks publicados; `epic` no ofrece ninguno de los dos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial, modificacion ni redistribucion. Cualquier despliegue en produccion requiere aclarar este punto con el autor.
- Procedencia opaca: no se documenta el dataset de ajuste, el proceso de entrenamiento ni la identidad del modelo base mas alla de lo que sugiere el nombre de los ficheros. No hay garantia de que los datos de entrenamiento tuvieran derechos de uso.
- Contenido NSFW: el ajuste esta disenado para generar descripciones de material para adultos. Su uso implica obligaciones legales de verificacion de edad, cumplimiento normativo por jurisdiccion y politicas de plataforma que pueden prohibir este tipo de contenido.
- Riesgo de alucinacion: sin datos de evaluacion no puede acotarse la tasa de descripciones incorrectas o inventadas, un riesgo especialmente relevante si las anotaciones alimentan datasets de entrenamiento.
- Idiomas no declarados: se desconoce si el ajuste conserva capacidades multilingues del modelo base o si degrada a un unico idioma.
- Contexto desconocido: al no publicarse la ventana de contexto, no puede planificarse el uso con documentos largos o multiples imagenes por prompt.
- Formato unico: solo GGUF BF16, lo que excluye frameworks de servido de alto rendimiento basados en safetensors y obliga a cuantizar manualmente para hardware de consumo.
- Sin traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni validacion por terceros.
- Fecha de creacion inusual: la ficha registra una fecha de 2026-09-21, lo que impide contrastar el modelo con referencias publicas y refuerza la necesidad de auditoria previa.
- Sin soporte de tool calling ni agentes documentado: no debe asumirse su uso en pipelines agenticos sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/epispasm/epic
- Unsloth (herramienta de conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Ficheros del repositorio: `qwen3.5-9b-nsfw-captioning-v5.BF16.gguf`, `qwen3.5-9b-nsfw-captioning-v5.BF16-mmproj.gguf`
- Paper, blog o demo oficial: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
