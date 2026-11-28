# momo0729/qwen3.5-0.8b-dec

## Resumen

qwen3.5-0.8b-dec es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario momo0729 en Hugging Face. Se trata de un modelo especializado y de proposito muy concreto: no es un modelo de chat ni de generacion de respuestas, sino un componente para pipelines de RAG (generacion aumentada por recuperacion) en japones. Su tarea consiste en, dada una pregunta que requiere seguir dos hechos (multi-hop), extraer en formato JSON las entidades (sujeto y relacion) que hay que consultar y el tipo de pregunta (de combinacion o de comparacion). A partir de ese JSON, el sistema construye las consultas de busqueda.

El modelo se ha obtenido mediante LoRA (concretamente LoRA+) sobre el checkpoint Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) y posteriormente se han fusionado los pesos adaptados con los originales, aplicando un factor de mezcla de 1.0 (nuevos pesos = originales + W x (entrenados - originales), con W = 1.0). La arquitectura, configuracion, tokenizador y plantilla de chat son identicos al modelo base; solo cambian los pesos de las capas lineales de la parte de texto.

Con 873.438.784 parametros reales (segun safetensors) y un repositorio de 1,8 GB, es un modelo muy pequeno, pensado para ejecutarse en hardware modesto. Su relevancia radica en su especializacion: demuestra como un modelo de menos de mil millones de parametros puede resolver una subtarea estructurada de un pipeline RAG en japones con datos derivados de JEMHopQA. La licencia es Apache-2.0, aunque el dataset de entrenamiento (JEMHopQA) esta bajo CC BY-SA 4.0, lo que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3.5, identica al modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el modelo base admite cuantizacion estandar, pero no se especifica) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen/Qwen3.5-0.8B original: un transformer decoder-only con configuracion, tokenizador y plantilla de chat sin modificar. El ajuste se realizo con LoRA+ sobre la revision 2fc06364715b967f1860aea9cf38778875588b17 del modelo base y, a diferencia de un adaptador LoRA convencional que se distribuye por separado, aqui los pesos se fusionaron en el modelo original con un factor de mezcla W = 1.0. Segun la model card, solo se modificaron los pesos de las capas lineales de la parte de texto.

El entrenamiento es de tipo supervisado (instruction tuning sobre una tarea estructurada), sin que la informacion disponible mencione RLHF ni DPO. La senal de supervision se construyo de forma automatica a partir del dataset JEMHopQA (RIKEN): a partir de las derivaciones (tripletas sujeto-relacion-objeto) se extrajeron por reglas el sujeto y la relacion, y se reformatearon como objetivos JSON junto con el tipo de pregunta. No se especifica el numero de tokens de entrenamiento ni la composicion completa del dataset mas alla de esta fuente.

## Capacidades

- Extraccion estructurada de informacion: dado un enunciado de pregunta multi-hop, genera un JSON con las entidades (sujeto y relacion) a consultar y el tipo de pregunta.
- Clasificacion del tipo de pregunta: distingue entre preguntas de combinacion y de comparacion.
- Generacion de JSON con formato controlado, apto para consumo programatico en pipelines.
- Procesamiento de japones como unico idioma declarado.
- No esta disenado para generar respuestas finales ni para conversacion general; su funcion es exclusivamente la descomposicion de consultas para la fase de recuperacion de un RAG.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Descomposicion de consultas en RAG multi-hop en japones: el modelo recibe una pregunta que requiere encadenar dos hechos y devuelve el JSON con sujeto, relacion y tipo de pregunta; el orquestador usa esos campos para lanzar las busquedas. Es su proposito declarado y el escenario para el que fue entrenado.
- Construccion de pipelines de busqueda por entidades: a partir del sujeto y la relacion extraidos, el sistema genera consultas de busqueda concretas contra un indice documental o una base de conocimiento, mejorando la precision frente a buscar la pregunta completa.
- Enrutado de preguntas por tipo: el campo de tipo de pregunta (combinacion o comparacion) permite que el pipeline seleccione una estrategia de recuperacion y fusion de resultados distinta para cada caso.
- Preprocesado ligero en entornos con recursos limitados: con menos de mil millones de parametros y 1,8 GB de pesos, puede desplegarse junto al resto del pipeline en una sola GPU de consumo o incluso en CPU, sin competir por recursos con el modelo generador principal.
- Normalizacion de preguntas para evaluacion de sistemas de QA: util para extraer automaticamente las entidades implicadas en conjuntos de preguntas japonesas y comparar la cobertura de recuperacion de distintos sistemas.
- Prototipado de asistentes documentales en japones: como modulo intermedio que traduce preguntas de usuario a consultas estructuradas antes de la generacion de respuesta por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los 873 millones de parametros ocupan aproximadamente 3,5 GB; en fp16/bf16 en torno a 1,8 GB, coherente con el tamano del repositorio; en cuantizacion de 8 bits aproximadamente 0,9 GB y en 4 bits alrededor de 0,5 GB (estimaciones teoricas a partir del numero de parametros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con margen para el contexto; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, con amplio margen, incluidas GPUs de gama media e incluso ejecucion en CPU para cargas moderadas.
- Opciones de despliegue: al ser un modelo con pesos safetensors y arquitectura Qwen3.5, es compatible con los runners habituales de Hugging Face Transformers; para inferencia de alto rendimiento pueden considerarse vLLM o TGI, y para CPU llama.cpp u Ollama, aunque la informacion disponible no confirma conversiones publicadas a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.5-0.8b-dec | 873.438.784 | No disponible | Japones | Apache-2.0 | Ajuste especializado en extraccion JSON para RAG multi-hop |
| Qwen/Qwen3.5-0.8B (base) | No disponible en la informacion | No disponible | No disponible en la informacion | Apache-2.0 | Modelo generalista del que deriva; no especializado en la tarea |
| Otros modelos de extraccion de entidades en japones | No disponible | No disponible | Japones | Variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo realiza la tarea de extraccion de sujeto, relacion y tipo de pregunta en JSON; no genera respuestas y su uso fuera de ese dominio producira salidas poco fiables.
- Idioma restringido al japones; no se declara soporte para castellano ni otros idiomas.
- Riesgo de alucinacion en la extraccion: al ser un modelo pequeno ajustado sobre datos generados por reglas, puede producir entidades o relaciones inexistentes o mal formateadas; conviene validar el JSON de salida antes de usarlo en produccion.
- Posibles sesgos heredados del modelo base Qwen3.5-0.8B y de la distribucion de JEMHopQA, que no se documentan en la informacion disponible.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero el dataset de entrenamiento JEMHopQA esta bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir igual sobre obras derivadas; conviene revisarlo antes de un uso comercial.
- Longitud de contexto no documentada en la ficha; debe consultarse la del modelo base Qwen3.5-0.8B.
- Sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados: no hay evidencia empirica de su calidad mas alla de la descripcion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/momo0729/qwen3.5-0.8b-dec
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA (GitHub): https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia del dataset: Ishii et al., "JEMHopQA: Dataset for Japanese Explainable Multi-Hop Question Answering", LREC-COLING 2024.
