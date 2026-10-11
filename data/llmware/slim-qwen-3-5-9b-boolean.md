# llmware/slim-qwen-3.5-9b-boolean

## Resumen

`llmware/slim-qwen-3.5-9b-boolean` es un ajuste fino publicado por llmware sobre el modelo base Qwen3.5-9B de Alibaba. Se trata de un modelo denso de 9.000 millones de parametros, multimodal nativo, con una arquitectura hibrida que combina Gated Delta Networks y Gated Attention, y una ventana de contexto de 262.144 tokens extensible hasta aproximadamente 1 millon mediante YaRN. La designacion "boolean" en el nombre indica que se trata de una especializacion orientada a tareas de respuesta booleana, presumiblemente clasificacion binaria o verificacion de afirmaciones, aunque la model card publicada no documenta el proceso de ajuste.

El modelo base Qwen3.5-9B es la variante de mayor tamano de la serie small de Qwen3.5 y, segun la informacion disponible, fue calificado por Artificial Analysis como el modelo mas inteligente por debajo de 10.000 millones de parametros en el momento de su lanzamiento, ademas de liderar la categoria multimodal por debajo de 15B con aproximadamente un 69 por ciento en MMMU-Pro. Cubre 201 idiomas y se distribuye bajo licencia Apache 2.0.

La relevancia de este ajuste concreto reside en su orientacion a tareas de clasificacion y decision binaria, un patron habitual en la familia SLIM de llmware para extraccion estructurada y function calling. No obstante, la ausencia de model card, de pipeline declarado y de cualquier dato de evaluacion propio hace que la evaluacion practica deba realizarse directamente sobre el modelo, sin apoyarse en cifras publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated Delta Networks combinadas con Gated Attention (heredada del base Qwen3.5-9B); multimodal nativa con fusion temprana |
| Parametros totales | 9.000 millones (heredado del base Qwen3.5-9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens, extensible a ~1M con YaRN en el modelo base; no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible en la model card; al ser un denso de 9B es compatible con cuantizaciones estandar de la comunidad (GGUF, AWQ, GPTQ), pero el autor no documenta ninguna |
| Idiomas soportados | No disponible para este ajuste; el base Qwen3.5-9B declara cobertura de 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B: un transformer denso que sustituye parte de las capas de atencion convencional por Gated Delta Networks, un mecanismo de estado recurrente con compuertas que reduce el coste computacional del contexto largo frente a la atencion cuadratica pura. Las capas restantes mantienen Gated Attention, dando lugar a un diseno hibrido. El modelo es multimodal nativo mediante fusion temprana de las representaciones visuales y textuales, no mediante un adaptador acoplado a posteriori, e incorpora un modo de razonamiento ("thinking mode") activado por defecto en el base.

Sobre el proceso de ajuste especifico que produce esta variante no hay informacion publica: la model card se limita a declarar la licencia Apache 2.0 y no incluye descripcion, composicion del dataset, numero de tokens de entrenamiento ni metodo de alineacion (RLHF, DPO u otro). Tampoco se documenta si el ajuste se realizo sobre el modelo completo, con LoRA u otra tecnica parametro-eficiente, ni si se conservo la torre de vision. El campo `pipeline` de HuggingFace aparece como no disponible y el repositorio registra cero descargas y cero likes, lo que sugiere una publicacion reciente o de caracter interno. Cualquier afirmacion sobre el entrenamiento de este ajuste seria especulativa.

## Capacidades

- Generacion de texto y razonamiento en el modelo base; la variante `boolean` estaria orientada a producir respuestas binarias (si/no, verdadero/falso) segun su denominacion, aunque no hay documentacion que lo confirme.
- Capacidad multimodal nativa heredada del base: comprension de imagenes junto a texto, con ~69 por ciento en MMMU-Pro segun la informacion disponible sobre Qwen3.5-9B.
- Modo de razonamiento explicito ("thinking mode") en el modelo base; se desconoce si permanece activo tras el ajuste.
- Cobertura multilingue amplia (201 idiomas en el base), supeditada a que el ajuste no haya degradado el comportamiento fuera del idioma de entrenamiento.
- Soporte de contexto largo de hasta 262.144 tokens, con extension a ~1M mediante YaRN, orientado a documentos extensos y conversaciones de muchos turnos.
- Tool calling y function calling: no documentado para este ajuste; es una capacidad presente en el ecosistema Qwen3.5, pero no hay confirmacion para esta variante.
- Comportamiento agentico y razonamiento multi-paso: no documentado para este ajuste.

## Casos de uso

- Clasificacion binaria a escala: usar el modelo como clasificador si/no sobre lotes de documentos, aprovechando la especializacion declarada en el nombre y sustituyendo reglas heuristicas fragiles por inferencia semantica.
- Verificacion de afirmaciones (fact checking interno): dado un par de fragmentos de texto, determinar si uno contradice o respalda al otro, con salida booleana integrable en un pipeline de validacion automatica.
- Moderacion de contenido con criterio binario: decidir si un texto cumple o incumple una politica concreta, con la ventaja de que una salida de dos clases simplifica el umbralizado y la auditoria respecto a un modelo generativo abierto.
- Enrutado de consultas en un sistema RAG: clasificar si una pregunta es respondible con la base documental disponible antes de invocar al modelo generativo grande, reduciendo coste y latencia en el camino critico.
- Prefiltrado en pipelines de anotacion: descartar automaticamente candidatos en tareas de etiquetado humano, de modo que solo los casos ambiguos lleguen a revision manual.
- Extraccion de campos booleanos en formularios y contratos: por ejemplo, determinar si una clausula de confidencialidad esta presente o si un documento cumple un requisito regulatorio, con la ventana de contexto larga del base como respaldo para documentos extensos.
- Analisis de imagenes con respuesta binaria: si se conserva la torre de vision, tareas del tipo "¿aparece este objeto en la imagen?" o "¿el documento escaneado esta firmado?", utiles en digitalizacion de archivos.
- Evaluacion de calidad de datos sinteticos: marcar pares instruccion-respuesta como validos o invalidos antes de incorporarlos a un conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para `llmware/slim-qwen-3.5-9b-boolean` en la informacion disponible. La model card no incluye ninguna evaluacion y el repositorio no registra metricas propias.

Los siguientes datos corresponden al modelo base Qwen3.5-9B, no a este ajuste, y se incluyen unicamente como referencia del punto de partida:

| Benchmark / metrica | Qwen3.5-9B (base) | Notas |
|---|---|---|
| MMMU-Pro | ~69 por ciento | Lider entre modelos multimodales por debajo de 15B segun la fuente |
| Comparativa con Qwen3-30B | Supera al Qwen3-30B en la mayoria de benchmarks de lenguaje | Generacion anterior, mayor tamano |
| Tasa de exito agregada (Benchable) | 83 por ciento | Sobre el conjunto de benchmarks evaluados por esa plataforma |
| Percentil de velocidad (Benchable) | Percentil 10 | Indica tiempos de respuesta mas largos que la media de sus pares |
| Indice de inteligencia (Artificial Analysis) | Modelo mas inteligente por debajo de 10B en el momento del lanzamiento | Puntuacion numerica no disponible en las fuentes consultadas |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de clasificacion binaria para el ajuste de llmware.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 18 GB solo para pesos, mas la cache KV; requiere GPU de 24 GB (RTX 3090, RTX 4090, L40S) para contexto corto y de 40-80 GB (A100, H100) para contexto largo. Estimacion propia a partir del numero de parametros, no confirmada por el autor.
- VRAM estimada en int8: aproximadamente 9-10 GB de pesos; cabe en RTX 4080, RTX 4090, L4 y A10G.
- VRAM estimada en 4 bits (GGUF Q4_K_M): alrededor de 5,5-6 GB de pesos; cabe en RTX 3060 12 GB, RTX 4070 y GPUs consumer de 8 GB con contexto reducido.
- La cache KV crece de forma aproximadamente lineal con la longitud de contexto. Con 262.144 tokens, el consumo adicional es considerable y depende de la configuracion de cabezas del modelo base, no documentada aqui; para contexto muy largo se recomienda planificar con GPUs de 80 GB o cuantizacion de cache.
- Opciones de despliegue: vLLM y SGLang para servicio de alto rendimiento, TGI como alternativa, llama.cpp y Ollama si se dispone de una conversion a GGUF, y plataformas gestionadas como Modal, que ya lista Qwen3.5-9B en su biblioteca.
- Latencia y throughput: no disponibles para este ajuste. La plataforma Benchable situa al modelo base en el percentil 10 de velocidad, lo que sugiere tiempos de respuesta por encima de la media; el modo de razonamiento por defecto incrementa el numero de tokens generados.
- Si el ajuste conserva la torre de vision, el preprocesado de imagenes anade coste de memoria adicional no cuantificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| llmware/slim-qwen-3.5-9b-boolean | 9B (dense) | No documentado; heredado 262K del base | No documentado | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen3.5-9B (base) | 9B (dense) | 262K, extensible a ~1M con YaRN | Si, nativa | Apache 2.0 | HuggingFace y plataformas gestionadas | ~69 por ciento en MMMU-Pro; percentil 10 de velocidad |
| Qwen3-30B (generacion anterior) | 30B | No disponible | No disponible | No disponible | No disponible | Superado por Qwen3.5-9B en la mayoria de benchmarks de lenguaje segun las fuentes |
| GPT-5-Nano | No disponible | No disponible | Si | Propietaria | API | Superado por Qwen3.5-9B en tareas de vision por margenes de dos digitos segun las fuentes |
| Gemini-2.5-Flash-Lite | No disponible | No disponible | Si | Propietaria | API | Misma comparacion que el anterior |

No se dispone de datos que permitan una comparacion directa y verificable del ajuste de llmware frente a otros clasificadores booleanos de tamano similar.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo contiene la licencia. No hay informacion sobre datos de entrenamiento, sesgos, idiomas cubiertos ni metricas, lo que dificulta cualquier evaluacion de riesgo previa a produccion.
- Riesgo de alucinacion y de respuestas no binarias: si el ajuste no restringe estrictamente el espacio de salida a dos clases, el modelo puede generar texto libre o justificaciones, lo que obliga a un parseo defensivo en el pipeline.
- Sesgos desconocidos: al no documentarse la composicion del dataset de ajuste, no es posible estimar sesgos demograficos, culturales o de dominio. El base cubre 201 idiomas, pero un ajuste pequeno puede degradar el rendimiento fuera del idioma mayoritario del conjunto de entrenamiento.
- Riesgo de sobreajuste a la tarea: los ajustes especializados en clasificacion binaria suelen perder capacidades generativas generales. No debe asumirse que este modelo conserva las capacidades del Qwen3.5-9B original sin verificacion empirica.
- Degradacion del modo de razonamiento: se desconoce si el "thinking mode" del base sigue operativo; si lo esta, puede aumentar la latencia y producir texto adicional que rompa un parseo booleano estricto.
- Herencia de limitaciones del base: ventana efectiva menor que la nominal en tareas de recuperacion sobre contextos muy largos, y velocidad de generacion baja (percentil 10 en la evaluacion del base).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Conviene verificar que el modelo base y cualquier dato de ajuste sean compatibles con esa licencia, algo que la model card no aclara.
- Estado del repositorio: cero descargas y cero likes, sin pipeline declarado ni actualizacion desde la fecha de creacion. Es un artefacto sin validacion por parte de la comunidad, por lo que se recomienda tratarlo como experimental y validarlo con un conjunto de prueba propio antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmware/slim-qwen-3.5-9b-boolean
- Ficha de Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Detalles y benchmarks de Qwen3.5-9B en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Ficha de Qwen3.5-9B en LLM Releases: https://www.llm-releases.com/models/qwen3-5-9b
- Biblioteca de modelos de Modal, Qwen3.5-9B: https://modal.com/library/qwen/qwen3-5-9b
- Ficha de Qwen3.5-9B en SiliconFlow: https://www.siliconflow.com/models/qwen3-5-9b
