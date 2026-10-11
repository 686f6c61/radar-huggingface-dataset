# bbrooklyn/td5-query-classifier

## Resumen

td5-query-classifier es un modelo de clasificación de texto publicado en Hugging Face por el usuario bbrooklyn. Por las etiquetas del repositorio (distilbert, text-classification) y por su recuento real de pesos en safetensors (65.783.042 parámetros), se trata de un ajuste fino de un transformer encoder de la familia DistilBERT orientado a clasificar consultas o queries, presumiblemente para tareas de enrutado, intención o filtrado dentro de un pipeline mayor.

El interés del modelo es acotado y hay que ser transparente al respecto: el repositorio acumula 0 descargas y 0 "likes", no declara licencia, no declara idiomas, y su model card es la plantilla autogenerada de transformers en la que todos los apartados relevantes siguen marcados como "[More Information Needed]". No hay documentación del conjunto de entrenamiento, de las etiquetas de salida ni de los hiperparámetros utilizados.

Por tanto, esta ficha describe lo que se puede verificar en los metadatos (arquitectura base, tamaño, formato de pesos, tamaño del repositorio) y marca explícitamente como no disponible todo lo demás. Cualquier evaluación de idoneidad para producción debería ir precedida de una inspección directa de los artefactos del repositorio y de una validación sobre datos propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado, 6 capas, hidden 768, 12 cabezas) segun la etiqueta del repositorio; no confirmado en la model card |
| Parametros totales | 65.783.042 (dato real leido de los pesos safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; 512 tokens como maximo heredado de la arquitectura DistilBERT base (dato inferido, no confirmado) |
| Tipos de cuantizacion | no disponible; al publicarse en safetensors, admite cuantizacion a int8/fp16 con herramientas estandar, pero no hay variantes GGUF ni cuantizadas en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Numero de etiquetas | no disponible |
| Tamano del repositorio | 0,8 GB |
| Fecha de publicacion | 2026-10-10 (ultima actualizacion: 2026-10-10) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `distilbert` sitúa el modelo en la familia DistilBERT, un transformer encoder de 6 capas con dimensión oculta 768 y 12 cabezas de atención, obtenido por destilación del BERT-base original. Esta familia reduce el coste de inferencia aproximadamente a la mitad respecto a BERT-base manteniendo una fracción alta de su calidad en tareas de clasificación y comprensión. El recuento real de 65.783.042 parámetros es ligeramente inferior al de distilbert-base-uncased estándar (66.955.010), diferencia compatible con un vocabulario del tokenizador recortado o con una cabeza de clasificación distinta, aunque no hay documentación que lo confirme.

No hay ningún dato publicado sobre el entrenamiento: se desconoce el corpus, el numero de tokens, la composicion del dataset, el regimen de precision (fp32, fp16, bf16), el numero de epocas, la tasa de aprendizaje y si hubo ajuste por RLHF o DPO. Tampoco se documenta de qué checkpoint concreto se partió. La etiqueta `arxiv:1910.09700` aparece en los metadatos, pero la model card no la cita ni la vincula a ningún articulo del modelo, por lo que no debe interpretarse como una referencia metodológica confirmada.

Las etiquetas `text-embeddings-inference` y `endpoints_compatible` indican únicamente compatibilidad declarada con los runners de Hugging Face (Inference Endpoints y TEI). Es un aviso útil: aunque el pipeline declarado sea `text-classification`, la presencia de la etiqueta TEI puede hacer que un despliegue automático trate el modelo como extractor de embeddings. Conviene fijar la tarea de forma explícita al desplegarlo.

## Capacidades

- Clasificación de texto: la tarea declarada es `text-classification`, de modo que la salida esperable es una distribución de probabilidad sobre un conjunto cerrado de etiquetas. El numero de etiquetas y sus nombres no estan documentados.
- Clasificación de consultas o queries: el nombre del repositorio (td5-query-classifier) sugiere un uso especifico para categorizar consultas entrantes, pero no hay ninguna descripcion del esquema de etiquetas ni de los datos de ajuste.
- Generación de texto: no. Es un encoder de clasificación, no un modelo causal de lenguaje.
- Razonamiento, matematicas y codigo: no disponible; no hay evidencias ni declaraciones al respecto.
- Tool calling / function calling: no soportado por la arquitectura ni declarado.
- Uso como agente o razonamiento multi-paso: no soportado por la arquitectura ni declarado.
- Capacidades multilingues: no disponible; no se declaran idiomas y no se puede saber si el tokenizador es uncased en ingles, multilingue o entrenado desde cero.
- Vision, audio, modo thinking: no soportado.
- Extracción de embeddings: tecnicamente posible usando las salidas del encoder, y la etiqueta TEI lo insinua, pero no esta documentado ni validado.

## Casos de uso

Los siguientes escenarios se derivan del nombre del repositorio y de la tarea declarada, no de documentacion del autor. Deben validarse con datos propios antes de cualquier uso real.

- Enrutado de consultas en un asistente conversacional: el modelo clasificaria cada mensaje entrante en una categoria (por ejemplo, facturacion, soporte tecnico, consulta comercial) para dirigirlo al subagente o al flujo adecuado. Es el uso mas coherente con el nombre del repositorio, aunque el esquema de etiquetas es desconocido y habria que inferirlo inspeccionando la cabeza de clasificacion.
- Filtrado y moderacion previa de entrada: descartar o marcar consultas fuera de dominio antes de enviarlas a un modelo generativo grande, reduciendo coste de inferencia y exposicion a entradas no deseadas.
- Clasificacion de tickets de soporte: asignar automaticamente categoria y cola de atencion a partir del texto libre del usuario, con latencia muy baja gracias al tamano reducido del modelo.
- Preprocesado en pipelines RAG: etiquetar la intencion de la consulta para seleccionar el indice o la coleccion documental sobre la que hacer la busqueda vectorial.
- Analitica de producto: agregar y clasificar grandes volumenes de consultas historicas para detectar tendencias, temas emergentes o carencias de documentacion, en un proceso por lotes donde el coste por inferencia es critico.
- Clasificacion en el borde o en el navegador: con unos 130 MB en fp16 y unos 66 MB en int8, el modelo cabe en dispositivos con recursos limitados, lo que permite clasificar sin enviar datos a un servidor.
- Segmentacion de correo o mensajeria entrante: clasificar mensajes por departamento o prioridad en un sistema interno de gestion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye seccion de evaluacion, no hay tabla de resultados y no se han reportado metricas de exactitud, F1, precision o recall sobre ningun conjunto de datos. Tampoco hay comparaciones con otros clasificadores de consultas.

Cualquier cifra que se atribuya a este modelo sin ejecutarlo directamente sobre datos propios seria una invencion. Se recomienda generar un conjunto de validacion etiquetado y medir F1 macro y matriz de confusion antes de decidir su adopcion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 263 MB en fp32, 132 MB en fp16/bf16 y 66 MB en int8, calculado a partir de los 65.783.042 parametros. No se incluye overhead de activaciones ni de runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. Modelos profesionales como A100, H100, L40S o A10 estan sobradamente dimensionados para este tamano.
- GPU de consumo: si, cabe con enorme holgura en cualquier GPU de consumo de los ultimos diez anos. La inferencia en CPU tambien es viable para volumenes moderados.
- Repositorio: 0,8 GB en el Hub, un tamano desproporcionado para 65,8 millones de parametros (un unico checkpoint en safetensors fp32 ocuparia unos 263 MB). Es probable que el repositorio incluya copias adicionales de pesos, estados de optimizador o artefactos de entrenamiento; conviene revisar el listado de ficheros antes de descargarlo.
- Opciones de despliegue: pipeline de transformers; Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`); Text Embeddings Inference (etiqueta `text-embeddings-inference`, verificando que respeta la tarea de clasificacion); Text Generation Inference da soporte a modelos de clasificacion en algunas versiones, aunque no esta confirmado para este checkpoint; exportacion a ONNX Runtime o TorchScript como via habitual para reducir latencia en CPU. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones y no se ha ejecutado el modelo para esta ficha.

## Comparativa con modelos similares

No hay resultados publicados de este modelo, por lo que no es posible una comparacion de rendimiento real. La tabla siguiente compara caracteristicas estructurales con arquitecturas de referencia de la misma familia y tamano. Los datos de los modelos de referencia proceden de sus propias fichas publicas; no se ha ejecutado ninguna comparacion head-to-head.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bbrooklyn/td5-query-classifier | 65,78 M | 512 (inferido) | no disponible | no disponible | Hub, 0 descargas |
| distilbert-base-uncased | ~66,96 M | 512 | metricas GLUE publicadas por sus autores | Apache-2.0 | Hub, muy extendido |
| bert-base-uncased | ~110 M | 512 | metricas GLUE publicadas por sus autores | Apache-2.0 | Hub, muy extendido |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 | metricas MTEB publicadas por sus autores | Apache-2.0 | Hub, muy extendido |

La diferencia practica principal no es de arquitectura, sino de trazabilidad: los tres modelos de referencia tienen licencia explicita, documentacion de entrenamiento y evaluaciones publicadas, mientras que td5-query-classifier carece de las tres cosas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, no hay autorizacion clara de uso comercial. En la practica, la ausencia de licencia equivale a todos los derechos reservados en muchas jurisdicciones. Es un bloqueo legal serio para cualquier producto.
- Model card vacia: el repositorio usa la plantilla autogenerada y no documenta desarrollador, financiacion, tipo de modelo, idiomas, licencia, modelo base, datos de entrenamiento, hiperparametros ni evaluacion. No hay informacion sobre la que construir confianza.
- Sesgos desconocidos: al no conocerse el corpus de ajuste, no se puede evaluar el sesgo demografico, geografico, linguistico ni de dominio. Un clasificador de consultas entrenado sobre datos no documentados puede degradar de forma sistematica en determinados grupos de usuarios.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre. El riesgo equivalente es la clasificacion erronea con alta confianza, especialmente en entradas fuera de la distribucion de entrenamiento.
- Ambiguedad de tarea: la etiqueta `text-embeddings-inference` junto al pipeline `text-classification` puede provocar que herramientas de despliegue automatico carguen el modelo con la tarea equivocada. Fijar la tarea de forma explicita.
- Esquema de etiquetas desconocido: no se sabe cuantas clases tiene la cabeza de clasificacion ni que representan. Es imprescindible inspeccionar `config.json` y `id2label` antes de cualquier integracion.
- Cobertura idiomatica incierta: sin idiomas declarados, no se puede asumir que funcione en castellano ni en ningun idioma concreto. Hay que probarlo.
- Limite de contexto: 512 tokens si se confirma la arquitectura DistilBERT base. Las consultas o documentos mas largos requeririan truncado, con la consiguiente perdida de informacion.
- Sin validacion por la comunidad: 0 descargas y 0 likes implican que nadie ha reportado casos de exito o fallo. No hay senal externa de calidad.
- Fecha de publicacion inusual: los metadatos indican 2026-10-10. Conviene verificar la procedencia y la integridad de los artefactos antes de cargarlos en un entorno de produccion.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/bbrooklyn/td5-query-classifier
- Repositorio de DistilBERT en Hugging Face: https://huggingface.co/distilbert/distilbert-base-uncased
- Articulo de DistilBERT: https://arxiv.org/abs/1910.01108
- Documentacion de pipelines de clasificacion de texto de transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Documentacion de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference/index
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos trataban sobre otros sistemas y no se incluyen por no ser pertinentes.
