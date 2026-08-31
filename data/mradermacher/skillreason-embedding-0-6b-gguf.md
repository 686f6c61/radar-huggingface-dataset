# mradermacher/SkillReason-embedding-0.6b-GGUF

## Resumen

SkillReason-embedding-0.6b es un modelo de embeddings diseñado específicamente para la recuperación de habilidades (skill retrieval) en sistemas de agentes. Desarrollado por donghongjiang, este modelo de 0,6 mil millones de parámetros introduce un enfoque de razonamiento mejorado para seleccionar la habilidad más adecuada para una consulta dada, sin necesidad de generar cadenas de pensamiento en inferencia. La versión GGUF aquí descrita, cuantizada por mradermacher, permite desplegarlo en entornos con recursos limitados, manteniendo la compatibilidad con herramientas como llama.cpp y Ollama.

El modelo se entrena en el dataset SkillReason-bench y utiliza una técnica de optimización con GRPO guiado por recuperación, que mejora la capacidad del modelo para explorar trayectorias de razonamiento efectivas para la tarea de retrieval. En inferencia, codifica directamente la consulta original sin generar texto autoregresivo, lo que lo hace eficiente para búsquedas en tiempo real. Su licencia Apache 2.0 y su tamaño compacto lo convierten en una opción práctica para integrar en pipelines de agentes, asistentes virtuales y sistemas de recomendación de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer encoder, no confirmado) |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base, aunque por su tamano y funcion (embeddings) es razonable asumir un transformer encoder clasico, similar a otros modelos de la familia BERT o Qwen. El entrenamiento se realiza en dos etapas segun el paper de SkillReason: una primera etapa de ajuste con datos de retrieval y una segunda etapa que emplea un objetivo GRPO guiado por recuperacion, que incentiva al modelo a explorar trayectorias de razonamiento mas adecuadas para sus propias capacidades y mas efectivas para la tarea de retrieval. En inferencia, el modelo codifica la consulta directamente sin generar cadenas de pensamiento, lo que reduce la latencia y el coste computacional.

El dataset utilizado es donghongjiang/skillreason-bench, disenado especificamente para evaluar y entrenar la recuperacion de habilidades en agentes. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de embeddings de frases y consultas para busqueda semantica.
- Recuperacion de habilidades de agentes: dado un objetivo o consulta, devuelve la habilidad mas relevante de un catalogo.
- Razonamiento mejorado para retrieval: el modelo aprende a razonar internamente sobre la consulta sin generar texto explicito, mejorando la precision de la seleccion.
- Soporte multilingue limitado: solo entrenado en ingles.
- Compatible con pipelines de feature-extraction de transformers y con formatos GGUF para despliegue ligero.
- No genera texto ni soporta tool calling, ya que es un modelo de embeddings puro.

## Casos de uso

- Seleccion de herramientas en agentes autonomos: un agente que recibe una peticion del usuario puede usar este modelo para elegir la funcion o skill mas adecuada de su repertorio, codificando la consulta y comparando con los embeddings de las skills disponibles.
- Busqueda semantica en documentacion tecnica: indexar manuales o guias de API y recuperar los fragmentos mas relevantes para una pregunta concreta, gracias a la capacidad de retrieval del modelo.
- Sistemas de recomendacion de acciones en asistentes virtuales: dado el historial de conversacion, el modelo puede sugerir la siguiente accion o respuesta predefinida mas apropiada.
- RAG (Retrieval-Augmented Generation) para agentes: integrar el modelo como componente de recuperacion en un pipeline de generacion aumentada, mejorando la calidad de las respuestas con contexto relevante.
- Clasificacion de intenciones en chatbots: al generar embeddings de las intenciones conocidas, se puede clasificar la intencion del usuario por similitud coseno.
- Filtrado de contenido en sistemas de moderacion: codificar mensajes y compararlos con categorias de riesgo para detectar contenido inapropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de SkillReason (arxiv 2608.08640v1) podria contener evaluaciones, pero no se han extraido datos concretos para esta ficha.

## Requisitos de hardware

- Con cuantizacion Q4_K_M (0,5 GB), el modelo puede ejecutarse en CPU con 4 GB de RAM o en cualquier GPU con al menos 2 GB de VRAM.
- Las cuantizaciones Q8_0 (0,7 GB) y f16 (1,3 GB) requieren algo mas de memoria, pero siguen siendo viables en hardware de consumo.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (GTX 1060, RTX 2060, RTX 4090, etc.) o incluso CPUs con instrucciones AVX2.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, o mediante la libreria transformers con el modelo base en safetensors.
- Al ser un modelo de embeddings, la latencia es baja: en CPU se pueden procesar cientos de consultas por segundo con cuantizacion Q4, y en GPU la velocidad es aun mayor. No se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de embedding de tamano similar. Como referencia, Qwen3-Embedding-0.6B es otro modelo de embeddings de 0,6B disponible en formato GGUF, pero no se han encontrado especificaciones detalladas ni benchmarks comparativos en la informacion recopilada. Se recomienda consultar el paper de SkillReason para una evaluacion frente a alternativas como BGE o E5.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; su rendimiento en otros idiomas sera pobre o nulo.
- Al ser un modelo de embeddings, no genera texto; no es adecuado para tareas de generacion o dialogo.
- La cuantizacion puede degradar ligeramente la calidad de los embeddings, especialmente en cuantizaciones agresivas como Q2_K o Q3_K.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de retrieval, el riesgo de alucinacion es bajo, pero puede haber sesgos en la seleccion de habilidades segun el dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del dataset skillreason-bench para posibles restricciones adicionales.
- No se conoce la longitud de contexto maxima; para consultas muy largas podria ser necesario truncar el texto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/SkillReason-embedding-0.6b-GGUF
- Modelo base: https://huggingface.co/donghongjiang/SkillReason-embedding-0.6b
- Dataset de entrenamiento: https://huggingface.co/datasets/donghongjiang/skillreason-bench
- Paper de SkillReason: https://arxiv.org/abs/2608.08640v1
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/donghongjiang/SkillReason-embedding-0.6b
