# luminas-ai/Luminas-Astra-7

## Resumen

Luminas Astra 7B es un modelo de lenguaje de 7 000 millones de parametros desarrollado por Luminas AI y presentado como un modelo autonomo de ingenieria de software. Se trata de un ajuste fino sobre `unsloth/Qwen2.5-Coder-7B-Instruct`, por lo que hereda la arquitectura transformer decoder-only de la familia Qwen2.5-Coder y su especializacion en generacion y comprension de codigo. El modelo se distribuye en formato GGUF y safetensors y declara soporte para ingles, chino, espanol, frances y aleman, lo que lo situa como una opcion compacta para tareas tecnicas en entornos con recursos limitados.

La propuesta de valor es la de un asistente de codigo y razonamiento tecnico que pueda ejecutarse en hardware de consumo, con integracion prevista en llama.cpp y flujos de trabajo agenticos segun las etiquetas del repositorio. La model card describe capacidades de generacion de codigo, depuracion, analisis de codigo y guia de arquitectura e implementacion, orientadas a desarrolladores, investigadores y sistemas de IA que necesiten un modelo pequeno y especializado.

La relevancia actual del modelo es limitada por su estado de publicacion: el repositorio tiene un tamano de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la model card no incluye resultados de benchmarks, detalles de entrenamiento ni la longitud de contexto. La busqueda web realizada no ha devuelto informacion relevante sobre el modelo (los resultados obtenidos corresponden a contenidos no relacionados), por lo que la ficha se basa exclusivamente en la informacion del repositorio de HuggingFace y en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, heredada de Qwen2.5) |
| Parametros totales | 7 000 millones (7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no la especifica; el modelo base Qwen2.5-Coder-7B-Instruct soporta 32 768 tokens nativos, pero el autor no lo confirma para Astra 7) |
| Tipos de cuantizacion | No disponible de forma explicita; se distribuye en GGUF, formato que admite cuantizaciones (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | Ingles (en), chino (zh), espanol (es), frances (fr), aleman (de) |
| Licencia | Astra License (`license: other`, `license_name: astra-license`); terminos no detallados en la model card, remite a LICENSE.txt |
| Formato de pesos | GGUF y safetensors |
| Modelo base | unsloth/Qwen2.5-Coder-7B-Instruct |
| Uso principal declarado | Ingenieria de software |
| Desarrollador | Luminas AI |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que Luminas Astra 7B es un ajuste fino (fine-tune) de `unsloth/Qwen2.5-Coder-7B-Instruct`, un modelo transformer decoder-only de 7B parametros con atencion causal estandar. El prefijo `unsloth/` del modelo base sugiere que el punto de partida es una version del modelo de Qwen preparada para entrenamiento eficiente con la libreria Unsloth, aunque el autor no documenta la tecnica de ajuste empleada (LoRA, QLoRA u otro metodo), ni el numero de tokens de entrenamiento, ni la composicion del dataset.

La model card no proporciona informacion sobre fases de alineacion adicionales como RLHF, DPO o RLVR, ni sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, atencion con ventana deslizante, etc.). Tampoco se detalla si se ha realizado alguna modificacion estructural sobre el modelo base o si el ajuste afecta unicamente a los pesos. En consecuencia, no es posible confirmar ningun cambio arquitectonico respecto a Qwen2.5-Coder-7B-Instruct mas alla del ajuste fino declarado.

## Capacidades

- Generacion y autocompletado de codigo en multiples lenguajes de programacion.
- Asistencia en ingenieria de software: analisis, refactorizacion y explicacion de codigo.
- Depuracion y diagnostico de errores a partir de fragmentos de codigo y mensajes de error.
- Razonamiento tecnico y resolucion de problemas de programacion.
- Guia de arquitectura e implementacion de software.
- Soporte multilingue de programacion (etiqueta "multi-language programming support").
- Capacidades multilingues en lenguaje natural: ingles, chino, espanol, frances y aleman.
- Soporte de razonamiento (etiqueta "reasoning").
- Capacidades agenticas segun etiqueta ("agentic"), sin detalle en la model card sobre soporte de tool calling o function calling.
- Etiqueta "multimodal" presente en los tags del repositorio, aunque la model card no describe ninguna capacidad de vision, audio u otra modalidad adicional.

No se documenta de forma explicita el soporte de tool calling, function calling ni un modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de programacion en el IDE: el modelo puede completar funciones y sugerir correcciones sobre el codigo abierto por el desarrollador, aprovechando su especializacion en generacion de codigo y su tamano compacto para ejecucion local con latencia baja.
- Revision de codigo en pipelines de integracion continua: dado su enfoque en depuracion y analisis, puede integrarse en un paso de CI para detectar errores evidentes, malas practicas o codigo muerto antes del merge, emitiendo comentarios estructurados.
- Explicacion de bases de codigo heredadas: el modelo puede generar resumenes y documentacion tecnica de modulos antiguos, ayudando a equipos que mantienen sistemas sin documentar.
- Generacion de pruebas unitarias: a partir de una funcion o un modulo, el modelo puede producir esqueletos de tests y casos limite, reduciendo el trabajo manual en proyectos con cobertura baja.
- Soporte tecnico interno para desarrolladores: puede actuar como asistente conversacional para resolver dudas sobre APIs, mensajes de error y configuraciones, con capacidad multilingue para equipos distribuidos en varios paises.
- Migracion de codigo entre lenguajes o frameworks: el modelo puede traducir fragmentos de un lenguaje a otro y adaptar patrones de un framework a otro, tarea adecuada para un modelo afinado sobre un base especializado en codigo.
- Asistente agentico para tareas de refactorizacion por pasos: si se confirma el soporte de uso agentico, podria encadenarse con herramientas de edicion y ejecucion para aplicar cambios incrementales y verificar el resultado.
- Generacion de fragmentos tecnicos en varios idiomas: redaccion de documentacion, mensajes de commit y comentarios en ingles, espanol, frances, aleman o chino, apoyandose en el soporte multilingue declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de Luminas Astra 7B no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, MBPP, SWE-bench ni ninguna otra), y la busqueda web no ha devuelto datos de rendimiento del modelo. Tampoco se dispone de resultados comparativos con el modelo base ni con alternativas de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones generales para un modelo denso de 7B, no confirmadas por el autor):
  - FP16/BF16: aproximadamente 14-16 GB.
  - INT8/FP8: aproximadamente 8-9 GB.
  - GGUF Q4_K_M: aproximadamente 4,5-5,5 GB.
  - GGUF Q8_0: aproximadamente 7,5-8,5 GB.
- GPU recomendadas:
  - NVIDIA A100 40/80 GB y H100 para despliegue en servidor con precision completa y alto throughput.
  - NVIDIA RTX 4090 (24 GB) para inferencia en FP16 y para servir varias instancias cuantizadas.
  - NVIDIA RTX 3090 (24 GB) como alternativa de gama alta para FP16.
- Viabilidad en GPU de consumo:
  - Si, en GPUs con al menos 8-12 GB de VRAM para cuantizaciones de 4 y 8 bits (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080).
  - En GPUs con 6-8 GB puede ser necesario recurrir a cuantizaciones agresivas (Q4, Q3) o a descarga parcial en CPU.
  - Es viable su ejecucion en CPU mediante llama.cpp con cuantizaciones GGUF, con throughput reducido.
- Opciones de despliegue:
  - llama.cpp (etiqueta explicita en el repositorio).
  - Ollama y LM Studio, al distribuirse en GGUF.
  - vLLM y TGI para safetensors en servidor, siempre que la licencia lo permita.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Luminas Astra 7B | 7B | No disponible | Astra License (other) | Repositorio HuggingFace, 0 descargas | Fine-tune de Qwen2.5-Coder-7B-Instruct; sin benchmarks publicados |
| Qwen2.5-Coder-7B-Instruct | 7,6B aprox. | 32 768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Amplia, muy descargado | Modelo base de Astra 7; benchmarks publicos por el autor original |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | 16 384 tokens | Licencia propia de DeepSeek (uso comercial con condiciones) | Amplia | Especializado en codigo; sin capacidades multilingues tan amplias en lenguaje natural |
| CodeLlama-7B-Instruct | 6,7B aprox. | 16 384 tokens (variantes de hasta 100 000) | Llama 2 Community License | Amplia | Enfocado a codigo; menos actual que Qwen2.5-Coder |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; los datos de contexto y licencia de Luminas Astra 7B son los unicos confirmados por su propio repositorio. No se dispone de resultados de rendimiento comparativos.

## Limitaciones y advertencias

- Licencia restrictiva potencial: la licencia se declara como `other` con nombre `astra-license`, y la model card remite a un archivo LICENSE.txt sin detallar los terminos. No se puede confirmar si el uso comercial esta permitido; es imprescindible revisar LICENSE.txt antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay metricas publicadas, por lo que no es posible verificar la calidad del ajuste frente al modelo base ni frente a alternativas.
- Repositorio vacio o no publicado: el tamano del repositorio es de 0,0 GB y no hay descargas, lo que sugiere que los pesos pueden no estar disponibles o que la publicacion esta incompleta.
- Contexto desconocido: el autor no especifica la longitud de contexto, un dato critico para tareas con codigo extenso o conversaciones largas.
- Capacidad multimodal no verificada: la etiqueta "multimodal" aparece en los tags, pero la model card no describe ninguna modalidad adicional (vision, audio). No debe asumirse soporte multimodal sin confirmacion.
- Soporte agentico y de tool calling no confirmado: la etiqueta "agentic" no va acompanada de documentacion sobre function calling, esquemas de herramientas o razonamiento multi-paso.
- Riesgo de alucinacion en codigo: como cualquier modelo de lenguaje, puede generar APIs inexistentes, funciones inventadas o fragmentos que compilan pero son incorrectos. Es necesario validar la salida con tests y revision humana.
- Sesgos: no se documenta ningun proceso de evaluacion de sesgos ni de alineacion; el modelo puede reproducir sesgos presentes en los datos de entrenamiento del modelo base, no revelados.
- Idiomas: aunque se declaran cinco idiomas, el modelo base esta fuertemente orientado al ingles y al chino; el rendimiento en espanol, frances y aleman no esta verificado.
- Datos de entrenamiento desconocidos: no se especifica la composicion del dataset de ajuste fino, lo que dificulta evaluar riesgos de contaminacion o de reproduccion de codigo con licencias incompatibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luminas-ai/Luminas-Astra-7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo (referenciada en la model card): https://huggingface.co/luminas-ai/Luminas-Astra-7/blob/main/LICENSE.txt
- Imagen de portada de la model card: https://huggingface.co/luminas-ai/Luminas-Astra-7/blob/main/astra-hero.png
- Libreria Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido sobre una pelicula) y no aportan informacion adicional util sobre Luminas Astra 7B.
