# nealfennimore/granite-embedding-small-english-r2-ONNX

## Resumen

`nealfennimore/granite-embedding-small-english-r2-ONNX` es una exportación a ONNX del modelo de embeddings `ibm-granite/granite-embedding-small-english-r2` de IBM, publicada por el usuario nealfennimore. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada para su uso en entornos JavaScript/TypeScript mediante Transformers.js, con cuantización int8 de las matrices MatMul para reducir el tamaño y acelerar la inferencia en CPU.

El modelo resuelve el problema de la recuperación semántica de evidencia (retrieval) en inglés: genera representaciones vectoriales densas de consultas y pasajes que pueden compararse por similitud coseno para tareas de búsqueda, RAG o clasificación por similitud. Su origen es el modelo base de IBM, basado en arquitectura ModernBERT, y esta exportación concreta se hizo para el sistema de recuperación híbrida de la aplicación `cmmc-app` del propio autor.

Es relevante para desarrolladores que necesitan embeddings ligeros ejecutables en el navegador o en Node.js sin infraestructura GPU, ya que el formato ONNX cuantizado a int8 permite desplegar el modelo en clientes web con Transformers.js. La licencia Apache 2.0 del modelo original se mantiene en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de pesos MatMul via ONNX Runtime); se menciona el dtype "q8" de Transformers.js |
| Idiomas soportados | ingles (segun el nombre del modelo base; no se detalla en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-embedding-small-english-r2` es un encoder de la familia ModernBERT, una arquitectura transformer bidireccional orientada a tareas de representación y recuperación. Esta exportación no modifica la arquitectura ni el entrenamiento: se limita a convertir los pesos con la herramienta `optimum` para la tarea `feature-extraction` y a aplicar cuantización dinámica int8 sobre las matrices MatMul mediante ONNX Runtime. El tokenizador y los ficheros de configuración se mantienen sin cambios respecto al original.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste con RLHF o DPO en el modelo base. La innovación técnica de esta publicación concreta es la propia conversión a ONNX con cuantización dinámica, que habilita la ejecución en el runtime de ONNX y en Transformers.js. El uso previsto requiere pooling CLS y normalización de los vectores resultantes; las consultas y los pasajes no llevan prefijo.

## Capacidades

- Generación de embeddings de frases y pasajes para recuperación semántica (feature-extraction).
- Búsqueda densa por similitud coseno entre consultas y documentos.
- Recuperación híbrida de evidencia (uso declarado en el proyecto `cmmc-app`).
- Clasificación por similitud semántica y clustering de textos.
- Ejecución en navegador y en Node.js mediante Transformers.js y ONNX Runtime.
- Inferencia en CPU gracias a la cuantización int8 de los pesos.
- Soporte multilingüe: no disponible (el modelo base está orientado al inglés).
- Tool calling, agentes, visión, audio o modo de razonamiento: no disponibles; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones web: el modelo puede ejecutarse en el navegador con Transformers.js para indexar y consultar documentos locales sin enviar datos a un servidor, gracias al formato ONNX cuantizado.
- RAG en el cliente: generación de embeddings de fragmentos de documentación o bases de conocimiento para alimentar un pipeline de recuperación aumentada antes de llamar a un LLM.
- Recuperación de evidencia en sistemas de cumplimiento: es el uso declarado por el autor en `cmmc-app`, donde el modelo sirve para localizar pasajes relevantes en corpus normativos en inglés.
- Deduplicación y clustering de textos: comparación de embeddings normalizados para agrupar documentos o detectar contenido duplicado en pipelines de datos.
- Clasificación zero-shot por similitud: asignación de etiquetas a textos comparando su embedding con el de descripciones de categorías.
- Motores de búsqueda internos para documentación técnica: indexación de manuales y guías en inglés con un modelo ligero que no requiere GPU.
- Filtrado previo en pipelines de moderación o triaje: selección de candidatos por similitud antes de un modelo generativo más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (MTEB, BEIR) ni comparativas de latencia o throughput para esta exportación ONNX.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser un modelo "small" cuantizado a int8 y orientado a CPU, se espera un consumo de memoria moderado, pero no se proporcionan cifras.
- GPU recomendadas: no disponibles; el formato ONNX cuantizado está pensado para ejecución en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el caso de uso principal es CPU y navegador.
- Opciones de despliegue: Transformers.js (librería declarada), ONNX Runtime con el fichero `onnx/model_quantized.onnx`; otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nealfennimore/granite-embedding-small-english-r2-ONNX | no disponible | no disponible | ONNX int8 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| ibm-granite/granite-embedding-small-english-r2 | no disponible | no disponible | safetensors (presumible) | Apache 2.0 | HuggingFace (modelo base) |
| Otras alternativas de embeddings pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta exportación.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Orientado al inglés: el nombre del modelo base indica `english`; el rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- La cuantización int8 puede introducir una pérdida de calidad en los embeddings respecto a los pesos originales en precisión completa; no se han publicado evaluaciones de esa degradación.
- Requiere seguir el protocolo de uso del modelo base: pooling CLS y normalización de vectores; omitirlo produce similitudes incorrectas.
- No se especifican prefijos para consultas o pasajes; aplicar prefijos de otros modelos de embeddings puede degradar la recuperación.
- Riesgo de sesgos y alucinación: no aplica alucinación en el sentido generativo, pero los sesgos del corpus de entrenamiento del modelo base pueden reflejarse en los espacios de embeddings.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo original de IBM.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación comunitaria ni de mantenimiento continuado.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están completamente subidos o que la medición no se ha actualizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nealfennimore/granite-embedding-small-english-r2-ONNX
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
- Repositorio de la aplicación que lo usa: https://github.com/nealfennimore/cmmc
- Scripts de conversión: carpeta `models/embedder` del repositorio `cmmc-app` (https://github.com/nealfennimore/cmmc)
