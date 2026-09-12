# edwardcapriolo/granite-4.0-h-tiny-JQ4

## Resumen

Granite-4.0-H-Tiny-JQ4 es una recuantizacion de terceros del modelo ibm-granite/granite-4.0-h-tiny, generada por el usuario edwardcapriolo mediante su herramienta Deliverance Q.O.D. (Quantize On Demand). El modelo original es un instruct de 7.000 millones de parametros desarrollado por el Granite Team de IBM, publicado el 2 de octubre de 2025, y esta especificamente disenado para tareas de instruccion de contexto largo en entornos empresariales.

El proceso de cuantizacion ha reescrito 248 tensores de matriz al formato propietario Q4 de Deliverance, reduciendo el tamano local de 12,9 GB a 4,2 GB (el repositorio completo ocupa 4,6 GB en safetensors). El resultado es un artefacto pensado para inferencia local con el motor Java Deliverance, que mantiene intactos la model card, el tokenizer y la plantilla de chat del modelo original, e incorpora un manifiesto de procedencia (`deliverance-quantization.json`) que documenta los cambios de tipo de dato y las transformaciones de normalizacion de formas.

La relevancia de esta ficha es doble: por un lado documenta un modelo con capacidades destacadas de instruction following y tool calling (con soporte de RAG, FIM y doce idiomas); por otro, advierte de que se trata de un artefacto derivado, no oficial, con 0 descargas y 0 likes en el momento de la consulta, y cuyo formato de pesos Q4 puede no ser directamente compatible con los runners habituales de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos (tag `granitemoehybrid`); detalles completos no disponibles |
| Parametros totales | 7.000 millones (7B), segun la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card lo describe como "long-context instruct model") |
| Tipos de cuantizacion | Q4 propietario de Deliverance (248 tensores recuantizados); otros formatos no disponibles en este repositorio |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con sidecars `.qb` generados por Deliverance) |
| Tamano del repositorio | 4,6 GB (12,9 GB el modelo de origen, 4,2 GB tras cuantizar) |
| Libreria declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El tag `granitemoehybrid` de HuggingFace indica que la arquitectura subyacente combina componentes de mezcla de expertos con un esquema hibrido, en la linea de la familia Granite 4.0 de IBM. La model card no detalla la composicion exacta de capas, el numero de expertos ni la estrategia de enrutamiento, por lo que esos datos quedan como no disponibles. El modelo es un instruct afinado a partir de Granite-4.0-H-Tiny-Base mediante una combinacion de ajuste supervisado (SFT), alineamiento por aprendizaje por refuerzo y fusion de modelos (model merging), empleando datasets de instruccion de licencia permisiva junto con datasets sinteticos generados internamente por IBM.

Sobre esta base, la intervencion de Deliverance consiste en una recuantizacion post-entrenamiento: se reescribieron 248 tensores al formato Q4 del motor, con transformaciones de normalizacion de formas y generacion de sidecars `.qb`, preservando la plantilla de chat y los metadatos del tokenizer. La model card del artefacto derivado indica que el 10 de julio de 2025 se anadio un system prompt por defecto a la plantilla de chat para orientar las respuestas hacia un tono profesional, preciso y seguro. No se documentan en la informacion disponible innovaciones de decodificacion, atencion lineal ni tecnicas de inferencia especulativa.

## Capacidades

- Generacion de texto conversacional en formato de chat estructurado, con roles `system`, `user` y `assistant` delimitados por tokens especiales (`<|start_of_role|>`, `<|end_of_role|>`, `<|end_of_text|>`).
- Instrucciones generales y asistencia de dominio empresarial, con mejoras declaradas en instruction following.
- Tool calling y function calling con esquema de definicion compatible con el de OpenAI, orientado a integracion con funciones y APIs externas.
- Razonamiento multi-paso y uso como agente, segun la orientacion de la model card hacia aplicaciones empresariales y llamadas a herramientas.
- Generacion y tareas relacionadas con codigo, incluida finalizacion de codigo Fill-In-the-Middle (FIM).
- Recuperacion aumentada (RAG) sobre documentos, asi como resumen, clasificacion de texto, extraccion de texto y respuesta a preguntas.
- Soporte multilingue en doce idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Dialogo multilingue de uso general. No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multiturno con historial largo y seguir instrucciones de tono profesional gracias al system prompt por defecto de la plantilla, adecuado para asistentes de soporte en entornos empresariales.
- Orquestacion de agentes con herramientas: su soporte de tool calling con esquema OpenAI permite conectarlo a APIs de negocio (consultas de pedidos, disponibilidad, clima) y encadenar varias llamadas para resolver una peticion completa.
- RAG sobre documentacion corporativa: combinado con un indice vectorial, el modelo responde preguntas sobre manuales, politicas internas o bases de conocimiento, y su naturaleza instruct reduce la deriva respecto al contexto recuperado.
- Asistencia de programacion en el IDE: la capacidad de FIM y de tareas de codigo permite autocompletado dentro de una funcion, generacion de fragmentos y explicacion de codigo existente.
- Clasificacion y extraccion de informacion: procesamiento por lotes de tickets, correos o contratos para etiquetar categorias, extraer entidades y estructurar campos en JSON de forma automatizada.
- Resumen de reuniones y documentos largos: la orientacion a contexto largo del modelo base facilita condensar transcripciones y actas manteniendo los puntos clave.
- Despliegue local con recursos limitados: al ocupar 4,2 GB cuantizado, es viable ejecutar el asistente en una estacion de trabajo con GPU de gama media sin enviar datos sensibles a la nube.
- Traduccion y soporte multilingue: con doce idiomas declarados, puede emplearse para atencion en varios mercados o para normalizar contenido multilingue antes de indexarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para los pesos en Q4, a lo que hay que sumar la cache KV; en la practica conviene disponer de 8-12 GB de VRAM para contexto moderado. Estimacion orientativa, no confirmada por el autor.
- El modelo original sin cuantizar ocupa 12,9 GB, por lo que en precision completa requiere del orden de 16 GB o mas de VRAM.
- GPU recomendadas: tarjetas de consumo con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) pueden alojar la variante Q4; para servir varias peticiones concurrentes o contextos muy largos son preferibles A100 o H100, aunque el cuello de botella en este artefacto es la compatibilidad del formato Q4, no la memoria.
- Cabe en GPU de consumo: si, siempre que el runtime utilizado sepa leer los tensores Q4 de Deliverance.
- Opciones de despliegue: el motor previsto es Deliverance Q.O.D. (Java, carga safetensors y cuantizacion Q4). El repositorio se declara compatible con `transformers` por libreria, pero el formato Q4 propietario puede impedir la carga directa en vLLM, TGI, llama.cpp u Ollama; no se incluyen pesos GGUF en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edwardcapriolo/granite-4.0-h-tiny-JQ4 (este) | 7B | no disponible | no disponible | Apache 2.0 | HuggingFace, 4,6 GB, 0 descargas |
| ibm-granite/granite-4.0-h-tiny (oficial) | 7B | no disponible en la informacion proporcionada | no disponible | Apache 2.0 | HuggingFace, modelo de origen, 12,9 GB sin cuantizar |
| Otros modelos de 7-8B instruct de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La busqueda web realizada no arrojo resultados relevantes sobre alternativas comparables; los enlaces devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo. No se dispone, por tanto, de datos de rendimiento que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Artefacto derivado no oficial: no lo publica IBM, sino un tercero (edwardcapriolo) mediante su propia herramienta de cuantizacion; no ha pasado por la validacion del equipo Granite.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion por parte de la comunidad.
- Formato Q4 propietario: los tensores recuantizados y los sidecars `.qb` estan pensados para el motor Deliverance, por lo que la carga en `transformers`, vLLM, TGI, llama.cpp u Ollama puede fallar o requerir conversion adicional.
- Riesgo de degradacion por cuantizacion: la recuantizacion a 4 bits puede reducir la precision en tareas sensibles, especialmente en generacion de codigo, matematicas y razonamiento multi-paso. No se aportan evaluaciones comparativas frente al modelo original.
- Riesgo de alucinacion: como todo modelo generativo de 7B, puede producir informacion inventada, en especial en contextos de RAG cuando la recuperacion es deficiente. No se documentan tasas de alucinacion.
- Sesgos: la model card no incluye seccion de sesgos ni evaluaciones de equidad; se desconocen los sesgos heredados de los datasets de instruccion y de los datos sinteticos internos.
- Cobertura idiomatica: los doce idiomas declarados provienen del modelo base; no se especifica el nivel de calidad por idioma ni si la cuantizacion afecta de forma desigual a los idiomas distintos del ingles.
- Licencia: Apache 2.0 en el modelo base y en este derivado, lo que permite uso comercial, pero se recomienda verificar los terminos del motor Deliverance para el despliegue en produccion.
- Metadatos atipicos: el identificador de arXiv declarado en las etiquetas (`arxiv:0000.00000`) es un marcador vacio, y las fechas de creacion y actualizacion del repositorio (septiembre de 2026) no coinciden con la fecha de publicacion del modelo base (octubre de 2025), lo que conviene tener en cuenta al auditar la procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edwardcapriolo/granite-4.0-h-tiny-JQ4
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- Coleccion Granite 4.0 Language Models: https://huggingface.co/collections/ibm-granite/granite-40-language-models-6811a18b820ef362d9e5a82c
- Repositorio GitHub de los modelos de lenguaje Granite 4.0: https://github.com/ibm-granite/granite-4.0-language-models
- Documentacion de Granite: https://www.ibm.com/granite/docs/
- Motor de inferencia Deliverance: https://github.com/edwardcapriolo/deliverance
- Esquema de definicion de funciones de OpenAI (referencia para tool calling): https://platform.openai.com/docs/guides/function-calling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
