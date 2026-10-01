# api-service-sac/s1-code-v2

## Resumen

s1-code v2 es un modelo de decision de tipo System One de 321.908.998 parametros (aproximadamente 322 M) desarrollado por api-service-sac. Su funcion no es generar texto, sino devolver la probabilidad de que una funcion de Python responda a una busqueda formulada en ingles o espanol. Se trata, por tanto, de un modelo de relevancia o reranker especializado en busqueda de codigo, no de un modelo generativo al uso.

El modelo es un ajuste fino de convaiinnovations/laya (licencia Apache 2.0) y esta pensado para ejecutarse en CPU, lo que lo hace adecuado para integrarse en pipelines de recuperacion donde el coste por consulta importa. Su caso de uso natural es la segunda fase de un sistema de recuperacion: dado un conjunto de candidatos devueltos por un modelo de embeddings, s1-code v2 reordena esos candidatos segun la probabilidad de que cada uno responda realmente a la consulta.

Esta es una version anterior del modelo. El propio autor indica explicitamente que para uso en produccion se prefiera la version s1-code v3, que corrige un problema conocido de falsos negativos en parte de sus datos de entrenamiento. El modelo se publica con licencia Apache 2.0, soporta ingles y espanol, se distribuye en formato safetensors y el repositorio ocupa 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ajuste fino de convaiinnovations/laya, libreria `laya`) |
| Parametros totales | 321.908.998 (aproximadamente 322 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada se trunca a los primeros 1.500 caracteres del codigo fuente) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifica la arquitectura interna en la informacion disponible. El modelo se presenta como un modelo de decision System One, es decir, un clasificador que produce una probabilidad escalar de relevancia en lugar de una salida generativa. El formato de entrada es fijo: el estado se compone de la ruta del fichero, el nombre de la funcion, una linea vacia y los primeros 1.500 caracteres del codigo fuente; la pregunta se formula como `This code answers the search: <your search>`.

El entrenamiento utilizo aproximadamente 81.000 preguntas con paridad exacta entre ingles y espanol, extraidas de 306 repositorios publicos, mensajes de commit (CommitPackFT), issues (SWE-bench, SWE-Gym, SWE-smith), busquedas de CoSQA y CoSQA+, y funciones privadas filtradas. Por cada pregunta se genero un positivo y tres negativos minados con granite. El checkpoint publicado corresponde a la primera de dos epocas de entrenamiento, ya que la segunda presento sobreajuste. No se menciona el uso de RLHF ni DPO.

Existe un problema conocido en los datos: la parte procedente de CoSQA+ contenia falsos negativos (codigo generado que tambien respondia a la consulta). Estos falsos negativos se eliminaron en la version v3. El autor tambien senala que los datos de entrenamiento privados no se han publicado.

## Capacidades

- Puntuacion de relevancia binaria: devuelve la probabilidad de que una funcion de Python responda a una busqueda dada, en lugar de generar texto.
- Reranking de candidatos: reordena un conjunto de funciones candidatas previamente recuperadas por un modelo de embeddings.
- Fusion con modelos de embeddings: sus puntuaciones pueden combinarse con las de un recuperador denso (en la model card se demuestra la fusion con Qwen3-Embedding).
- Busqueda de codigo bilingue: soporta consultas y codigo en ingles y espanol con paridad declarada en los datos de entrenamiento.
- Inferencia en CPU: con 322 M de parametros, el modelo esta disenado explicitamente para ejecutarse en CPU.
- Especializacion en Python: el modelo esta entrenado y evaluado sobre funciones de Python.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Reranking en un pipeline de busqueda de codigo: tras una primera fase de recuperacion con un modelo de embeddings como Qwen3-Embedding, s1-code v2 reordena los candidatos segun la probabilidad de responder a la consulta. En la evaluacion publicada mejora el Top 1 de 152 a 165 sobre 25 candidatos al fusionarse con el recuperador.
- Busqueda de codigo bilingue en equipos mixtos: al soportar ingles y espanol con paridad, permite que un mismo indice de repositorio se consulte en cualquiera de los dos idiomas sin degradar la calidad.
- Indexacion y navegacion de repositorios internos: dado un directorio de funciones Python, el modelo puntua cada funcion frente a una consulta del desarrollador para devolver las mas relevantes.
- Asistencia a asistentes de codigo en el IDE: integrado como capa de reordenacion en un plugin, reduce el numero de resultados irrelevantes que se muestran al usuario.
- Vinculacion de issues a codigo: dado un issue o un mensaje de descripcion, localizar las funciones del repositorio que probablemente lo resuelven; el modelo se entreno con datos de SWE-bench, SWE-Gym y SWE-smith.
- Recuperacion aumentada para agentes de programacion: servir candidatos de codigo verificados antes de pasarlos a un modelo generativo, reduciendo el uso de contexto en el modelo mayor.
- Despliegue en entornos sin GPU: al ejecutarse en CPU, permite montar un servicio de reranking en infraestructura barata o en el propio portatil del desarrollador.

## Benchmarks y rendimiento

Evaluacion sobre un nuevo conjunto de test retenido de 197 preguntas y 25 candidatos obtenidos con Qwen3-Embedding:

| Sistema | Top 1 (de 197) | Ingles | Espanol |
|---|---|---|---|
| s1-code v2 en solitario | 157 | 80 % | 79 % |
| s1-code v2 + Qwen3-Embedding (fusion) | 165 | 83 % | 84 % |
| Qwen3-Embedding en solitario | 152 | 76 % | 78 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Por tamano de parametros, las estimaciones son aproximadamente 1,29 GB en fp32, 644 MB en fp16 y del orden de 161-322 MB en cuantizaciones de 4-8 bits, aunque el modelo solo se distribuye en safetensors.
- GPU recomendadas: no se especifica ninguna. El modelo esta declarado como de CPU, por lo que no requiere GPU.
- Compatibilidad con GPU de consumo: si cabe en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) dada su huella de memoria inferior a 2 GB en fp32.
- Opciones de despliegue: la libreria declarada es `laya`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s1-code v2 | 321.908.998 | Reranker de busqueda de codigo | en, es | Apache 2.0 | HuggingFace |
| s1-code v3 | no disponible | Reranker de busqueda de codigo (version recomendada por el autor) | no disponible | no disponible | HuggingFace |
| Qwen3-Embedding | no disponible | Recuperador denso (embeddings) | no disponible | no disponible | no disponible |

En la evaluacion publicada, s1-code v2 en solitario supera a Qwen3-Embedding en solitario (157 frente a 152 en Top 1), y la fusion de ambos alcanza 165. El autor recomienda usar s1-code v3 en lugar de esta version.

## Limitaciones y advertencias

- Version obsoleta por diseno: el autor indica explicitamente que se prefiera s1-code v3 para uso real.
- Falsos negativos conocidos: parte de los datos de CoSQA+ contenia codigo generado que tambien respondia a la consulta; este problema se corrigio en v3, no en v2.
- Solo Python: el modelo esta entrenado y evaluado sobre funciones de Python, no sobre otros lenguajes.
- Solo ingles y espanol: no se documentan otros idiomas.
- Truncamiento de entrada: el estado se limita a los primeros 1.500 caracteres del codigo fuente, por lo que funciones mas largas pueden perder informacion relevante.
- Formato de entrada rigido: requiere la estructura concreta (ruta, nombre de funcion, linea vacia, codigo y pregunta formateada); no es un modelo de proposito general.
- Riesgo de falsos positivos y negativos: al ser un clasificador de relevancia, puede ordenar mal funciones que responden parcialmente a la consulta; no genera justificaciones.
- Datos de entrenamiento privados no publicados: parte del corpus de ajuste fino es privado y no se ha liberado, lo que limita la reproducibilidad.
- Adopcion nula: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero los datos de terceros incluidos (CoSQA+ con CC-BY-4.0, CoSQA con MIT) mantienen sus propias condiciones de atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/api-service-sac/s1-code-v2
- Version recomendada (v3): https://huggingface.co/api-service-sac/s1-code-v3
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden al concepto generico de API y no guardan relacion con esta ficha.
