# lightonai/LateOn-Code

## Resumen

LateOn-Code es un modelo de embeddings multi-vector estilo ColBERT desarrollado por LightOn, especializado en recuperación de información sobre código fuente. A diferencia de los codificadores densos de vector único que comprimen una función completa en una sola representación, LateOn-Code preserva información a nivel de token mediante representaciones multi-vector, lo que permite un emparejamiento preciso de nombres de variables, llamadas a API y patrones de código. Está basado en la arquitectura ModernBERT, cuenta con 149 millones de parámetros y se distribuye bajo licencia Apache 2.0.

El modelo se entrenó con el conjunto de datos `lightonai/nv-embed-supervised-distill-dedup-code`, que contiene 2.117.771 pares de consultas y código, utilizando una función de pérdida contrastiva. Está diseñado para tareas de búsqueda de código semántica, similitud de sentencias y recuperación de información en repositorios. Su relevancia actual radica en que los asistentes de codificación modernos suelen depender de búsquedas por palabras clave, y LateOn-Code ofrece una alternativa semántica más potente para navegar bases de código extensas.

La ficha se basa en la información pública disponible en Hugging Face y en el blog de LightOn. No se han publicado detalles completos sobre el proceso de entrenamiento ni sobre la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT con interacción tardía (ColBERT-style) |
| Parametros totales | 149.015.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y onnx) |
| Idiomas soportados | ingles, codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

LateOn-Code emplea una arquitectura de interacción tardía (late interaction) inspirada en ColBERT. El modelo codifica tanto las consultas como los documentos de código en secuencias de vectores por token, y la similitud se calcula mediante una operación MaxSim entre los vectores de la consulta y los del documento. Esta aproximación conserva información local que los embeddings de vector único pierden, lo que resulta especialmente útil para distinguir funciones similares con diferencias sutiles en nombres o llamadas.

El modelo se basa en ModernBERT, una arquitectura transformer optimizada para eficiencia y velocidad. Se entrenó con el dataset supervisado `lightonai/nv-embed-supervised-distill-dedup-code`, que contiene más de 2,1 millones de pares consulta-código, utilizando una pérdida contrastiva. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como destilación o ajuste fino con RLHF. El repositorio indica que los datos de entrenamiento y las plantillas se liberarán próximamente.

## Capacidades

- Recuperación de información sobre código: búsqueda semántica de funciones, métodos, clases o fragmentos de código a partir de consultas en lenguaje natural.
- Similitud de sentencias: cálculo de similitud entre fragmentos de código o entre consultas y código.
- Representación multi-vector: genera embeddings por token que permiten un emparejamiento fino de patrones de código.
- Soporte para búsqueda en varios lenguajes de programación: evaluado en CodeSearchNet para Python, JavaScript, Go, Ruby, entre otros.
- Compatible con la librería PyLate y con el ecosistema sentence-transformers.
- Exportable a formato ONNX para despliegue en entornos de inferencia optimizados.

No es un modelo generativo, por lo que no ofrece capacidades de tool calling, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Búsqueda semántica en repositorios grandes: permite a los desarrolladores encontrar funciones o clases relevantes describiendo su propósito en lenguaje natural, en lugar de depender de nombres exactos o palabras clave.
- Indexación de documentación de código: se puede usar para crear un índice semántico de API internas, facilitando la navegación en proyectos con miles de archivos.
- Asistentes de codificación: integrar LateOn-Code en herramientas como Claude Code o copilots para mejorar la recuperación de contexto relevante antes de generar código.
- Detección de duplicados y código similar: comparar fragmentos de código para identificar funciones duplicadas o implementaciones equivalentes.
- Sistemas de recomendación de código: sugerir funciones o librerías similares a partir de una consulta o de un fragmento dado.
- Automatización de revisión de código: emparejar patrones de código con reglas de estilo o mejores prácticas predefinidas.
- Búsqueda en bases de código multi-lenguaje: al estar entrenado con varios lenguajes, permite buscar de forma unificada en proyectos que mezclan Python, JavaScript, Go, Ruby, etc.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card de Hugging Face, evaluados sobre el conjunto de datos CodeSearchNet para distintos lenguajes. No se han verificado de forma independiente.

| Lenguaje | Accuracy@1 | Accuracy@10 | nDCG@10 | MRR@10 | MAP@100 |
|---|---|---|---|---|---|
| Python | 0,884 | 0,984 | 0,939 | 0,924 | 0,925 |
| JavaScript | 0,737 | 0,888 | 0,817 | 0,794 | 0,796 |
| Go | 0,913 | 0,989 | 0,958 | 0,947 | 0,947 |
| Ruby | 0,776 | 0,936 | no disponible | no disponible | no disponible |

No se han publicado resultados para otros benchmarks generales (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de lenguaje natural general.

## Requisitos de hardware

- Tamaño del modelo: 149 millones de parámetros, aproximadamente 600 MB en fp32 y 300 MB en fp16.
- VRAM estimada: con fp16 cabe en cualquier GPU con al menos 1 GB de VRAM; con cuantización a int8 podría reducirse a unos 150 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con text-embeddings-inference (TEI) según los tags de Hugging Face, así como con la librería PyLate y sentence-transformers. También se puede exportar a ONNX para usar con ONNX Runtime o TensorRT.
- Latencia y throughput: no se han publicado datos específicos. Dado su tamaño reducido, se espera una latencia baja incluso en CPU, pero dependerá del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de embeddings de código en la información proporcionada. A modo de referencia, se pueden considerar alternativas como:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| LateOn-Code | 149M | no disponible | Multi-vector (ColBERT) | Apache 2.0 |
| CodeBERT | 125M | 512 | Denso (vector único) | MIT |
| GraphCodeBERT | 125M | 512 | Denso (vector único) | MIT |
| ColBERTv2 | 110M | 512 | Multi-vector | MIT |

LateOn-Code se distingue por su enfoque multi-vector, que suele ofrecer mejor precisión en recuperación de código que los modelos densos de vector único, aunque con un coste de almacenamiento e inferencia mayor.

## Limitaciones y advertencias

- Solo soporta inglés y código; no está entrenado para otros idiomas naturales.
- Al ser un modelo de embeddings, no puede generar texto ni mantener conversaciones; su uso se limita a tareas de recuperación y similitud.
- Los resultados de los benchmarks provienen de la evaluación del autor y no han sido verificados de forma independiente.
- No se ha publicado información sobre la longitud máxima de contexto; puede haber limitaciones en secuencias muy largas.
- El modelo se entrenó con datos de código, por lo que puede reflejar sesgos presentes en esos datos (por ejemplo, sobre-representación de ciertos lenguajes o estilos de programación).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de los datos de entrenamiento si se utiliza en productos comerciales.
- No se han publicado detalles sobre el proceso de entrenamiento (número de pasos, hiperparámetros, etc.), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/LateOn-Code
- Modelo preentrenado: https://huggingface.co/lightonai/LateOn-Code-pretrain
- Blog de LightOn sobre LateOn-Code y ColGrep: https://lighton.ai/lighton-blogs/lateon-code-colgrep-lighton
- Repositorio de LightOn en GitHub: https://github.com/lightonai
- Dataset de entrenamiento: https://huggingface.co/datasets/lightonai/nv-embed-supervised-distill-dedup-code
- Página del modelo en Mixpeek: https://mixpeek.com/model/lightonai/LateOn-Code
