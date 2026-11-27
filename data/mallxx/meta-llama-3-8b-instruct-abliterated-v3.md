# mallxx/Meta-Llama-3-8B-Instruct-abliterated-v3

## Resumen

Meta-Llama-3-8B-Instruct-abliterated-v3 es una variante del modelo Meta-Llama-3-8B-Instruct de Meta AI, publicada por el usuario mallxx en Hugging Face. Se trata de un modelo de lenguaje de 8.030.261.248 parametros (aproximadamente 8 mil millones) basado en la arquitectura transformer decoder-only de Llama 3, con pesos en formato safetensors y bfloat16. La modificacion principal respecto al modelo original consiste en la aplicacion de una tecnica de "abliteracion" (ablacion por ortogonalizacion) que inhibe la direccion de rechazo aprendida por el modelo durante su alineamiento.

El modelo resuelve el problema de los rechazos no deseados en tareas legitimas: en lugar de recurrir a un fine-tuning completo que puede degradar el conocimiento original, la ortogonalizacion elimina quirurgicamente la direccion de activacion asociada al comportamiento de rechazo, preservando el resto de capacidades del modelo base. La metodologia se basa en el articulo "Refusal in LLMs is mediated by a single direction", que demuestra que el rechazo esta mediado por una unica direccion en el espacio de activaciones.

Es relevante para desarrolladores e investigadores que necesitan un modelo de 8B sin filtros de rechazo para experimentacion, evaluacion de seguridad, investigacion sobre alineamiento o aplicaciones donde el modelo base rechaza peticiones legitimas. La licencia es llama3, la misma del modelo original de Meta, y el repositorio ocupa 16,1 GB. No se han publicado datos de idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3 soporta 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parametros. Los pesos se publican en bfloat16 y en formato safetensors. No se ha realizado un entrenamiento adicional desde cero: la model card indica que se parte de meta-llama/Meta-Llama-3-8B-Instruct y se aplica una ortogonalizacion de pesos para eliminar la direccion de rechazo.

La innovacion tecnica es la ablacion por ortogonalizacion: se identifica la direccion de activacion que media el comportamiento de rechazo (segun la metodologia del articulo "Refusal in LLMs is mediated by a single direction") y se ortogonalizan los pesos respecto a esa direccion. Segun el autor, este enfoque es mas quirurgico que un fine-tuning, requiere muchos menos datos y preserva mejor el conocimiento original del modelo. El autor afirma que la version V3 induce menos alucinaciones que la V2 previa. No se dispone de datos sobre el numero de tokens de entrenamiento original, la composicion del dataset ni si hubo RLHF o DPO en el modelo base, mas alla de lo publico de Llama 3 Instruct.

## Capacidades

- Generacion de texto conversacional y multi-turno, heredada de Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones sin el comportamiento de rechazo del modelo alineado original.
- Generacion de codigo y matematicas (capacidades del modelo base, no verificadas con benchmarks en esta ficha).
- Soporte de tool calling y function calling heredado del formato de chat de Llama 3 Instruct (no confirmado explicitamente en la model card).
- Capacidades multilingues del modelo base (no detalladas en la informacion disponible).
- No se mencionan modos especiales como thinking mode, vision o audio.
- El autor advierte que el modelo puede presentar "quirks" (comportamientos extranos) por la novedad de la metodologia y anima a reportarlos.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ortogonalizacion de la direccion de rechazo afecta al comportamiento, comparandolo con el modelo original en tareas controladas.
- Evaluacion de robustez de filtros: util para probar si los sistemas de moderacion externos detectan contenido que el modelo base rechazaria, sin depender del rechazo interno del modelo.
- Generacion de codigo en entornos de desarrollo: al eliminar rechazos en peticiones tecnicas legitimas, reduce fricciones en pipelines de generacion de codigo y documentacion tecnica.
- Redaccion creativa sin restricciones: para ficcion, guiones o contenido donde el modelo alineado tiende a rechazar temas sensibles por precaucion excesiva.
- Experimentacion con tecnicas de ablacion: sirve como caso de estudio para aplicar ortogonalizacion a otros modelos o para combinar ablacion con fine-tuning posterior, como sugiere el autor.
- Despliegue en entornos de investigacion con GPU consumer: al ser un modelo de 8B, puede ejecutarse en GPUs de gama alta para consumidor con cuantizacion, facilitando la reproducibilidad de experimentos.
- Analisis de sesgos y comportamiento: permite comparar las respuestas del modelo abliterado frente al original para medir el impacto de la eliminacion de la direccion de rechazo en sesgos y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 8-9 GB; con 4 bits: alrededor de 5-6 GB (estimaciones estandar para un modelo de 8B, no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100 para produccion; RTX 4090 (24 GB) para bfloat16 en consumer; RTX 3090 (24 GB) tambien viable.
- Cabe en GPU consumer: si, en RTX 4090/3090 en bfloat16, y en GPUs con 8-12 GB mediante cuantizacion (no se publican ficheros GGUF en el repo, por lo que habria que generarlos).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), endpoints_compatible; vLLM, llama.cpp u Ollama requeririan conversion a los formatos correspondientes, no incluidos en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Meta-Llama-3-8B-Instruct-abliterated-v3 (este) | 8,03 B | No disponible | llama3 | Hugging Face (mallxx) | Abliterado por ortogonalizacion, V3 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | llama3 | Hugging Face (Meta) | Modelo base alineado, rechaza peticiones |
| failspy/llama-3-70B-Instruct-abliterated | 70 B | 8.192 tokens | llama3 | Hugging Face (failspy) | Misma metodologia, mayor tamano, requiere mas VRAM |
| Cognitive Computations V2 8B abliterated | 8 B | 8.192 tokens | llama3 | Hugging Face | Version previa de la metodologia, segun el autor con mas alucinaciones |

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo no garantiza que el modelo no rechace peticiones: el autor indica que puede seguir negandose o dar lecciones eticas.
- Riesgo de alucinacion: el autor afirma que la V3 reduce alucinaciones frente a la V2, pero no aporta benchmarks que lo cuantifiquen.
- Puede presentar "quirks" o comportamientos extranos por la novedad de la metodologia; el autor pide reportarlos en la pestana Community.
- La licencia llama3 impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse la licencia de Meta antes de cualquier despliegue en produccion.
- No se dispone de informacion sobre idiomas soportados ni sobre evaluaciones de sesgo; el modelo base Llama 3 tiene sesgos conocidos que persisten.
- La modificacion de pesos puede afectar a la calibracion del modelo en tareas sensibles; se recomienda evaluacion propia antes de usar en produccion.
- El repositorio no incluye ficheros GGUF ni cuantizaciones listas para usar; habria que generarlas para despliegue en hardware limitado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mallxx/Meta-Llama-3-8B-Instruct-abliterated-v3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Cookbook de la metodologia (failspy): https://huggingface.co/failspy/llama-3-70B-Instruct-abliterated/blob/main/ortho_cookbook.ipynb
- Articulo sobre la direccion de rechazo: https://www.alignmentforum.org/posts/jGuXSZgv6qfdhMCuJ/refusal-in-llms-is-mediated-by-a-single-direction
