# ranzucker/gliner2-5-multi-coreml

## Resumen

gliner2-5-multi-coreml (espejo de Sprechstunde) es una copia fijada de un subconjunto del repositorio FluidInference/gliner2-5-multi-coreml, publicada por el usuario ranzucker. Contiene unicamente los ficheros que carga la aplicacion Sprechstunde y no modifica ningun artefacto respecto al original: la unica diferencia es que se han omitido los ficheros no utilizados. El modelo subyacente es fastino/gliner2.5-multi-v1, un sistema de extraccion de informacion de la familia GLiNER2, convertido al formato CoreML para su ejecucion en dispositivos Apple.

GLiNER2 es una familia de encoders condicionados por esquema (schema-conditioned encoder family) disenada para reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de datos estructurados, extraccion de relaciones y atributos de span, todo ello en un unico modelo local. A diferencia de los modelos generativos, no produce texto libre: recibe un esquema de etiquetas y devuelve los spans o etiquetas que lo satisfacen. Esto lo hace adecuado para tareas de extraccion deterministas y de baja latencia, incluida la inferencia en el dispositivo.

La relevancia de esta ficha concreta es acotada: se trata de un espejo de distribucion para una aplicacion concreta (Sprechstunde), con 0 descargas y 0 likes en el momento de la consulta, y cuyo valor principal es ofrecer un artefacto CoreML empaquetado de un modelo de extraccion multilingue bajo licencia Apache-2.0. El repositorio ocupa 0,4 GB y depende completamente del trabajo upstream de fastino y FluidInference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder condicionado por esquema (familia GLiNER2); arquitectura concreta de la conversion CoreML no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El tag del repositorio indica que el modelo base esta cuantizado (`base_model:quantized:fastino/gliner2.5-multi-v1`); los tipos concretos aplicados en la conversion a CoreML no estan disponibles |
| Idiomas soportados | El sufijo "multi" del modelo base sugiere soporte multilingue; lista exacta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML (artefactos `.mlmodel`/`.mlpackage`); tamano del repositorio 0,4 GB |
| Modelo base | fastino/gliner2.5-multi-v1 |
| Repositorio de origen | FluidInference/gliner2-5-multi-coreml (commit `d35165dfcf7aac0df1d588c3eb9171249b9515cd`) |

## Arquitectura y entrenamiento

El modelo base pertenece a GLiNER2, descrito en el paper "GLiNER2: An Efficient Multi-Task Information Extraction System" (arXiv 2507.18546v1) como una familia de encoders condicionados por esquema que unifica NER, clasificacion de texto, extraccion de datos estructurados, extraccion de relaciones y atributos de span en un solo modelo. No es un transformer generativo ni un modelo MoE: es un encoder que, dada una entrada de texto y un esquema de etiquetas o consultas, produce las correspondencias correspondientes. El paper senala que el rendimiento en NER presenta solo caidas modestas frente a sistemas dedicados de reconocimiento de entidades, lo que respalda el enfoque unificado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, ya que esta ficha se limita al artefacto CoreML publicado. La conversion a CoreML fue realizada por FluidInference y este repositorio es un espejo parcial de esa conversion, del que se han eliminado los ficheros no usados por la aplicacion Sprechstunde. Los pesos se distribuyen sin modificaciones respecto al repositorio de origen.

## Capacidades

- Reconocimiento de entidades nombradas (NER) con tipos de entidad definidos dinamicamente mediante esquema, sin reentrenamiento.
- Clasificacion de texto guiada por etiquetas definidas en el esquema.
- Extraccion de datos estructurados (campos, registros) a partir de texto no estructurado.
- Extraccion de relaciones entre entidades.
- Extraccion de atributos de span asociados a entidades.
- Funcionamiento local en el dispositivo mediante CoreML, sin necesidad de enviar datos a servicios externos.
- Soporte multilingue segun la denominacion "multi" del modelo base (lista de idiomas no confirmada).
- No es un modelo generativo: no produce texto libre, no admite tool calling ni function calling, ni razonamiento multi-paso en el sentido de los LLM de agentes.

## Casos de uso

- Extraccion de entidades en aplicaciones iOS y macOS: al estar empaquetado en CoreML, el modelo puede ejecutarse en el Neural Engine o la GPU de dispositivos Apple para detectar entidades en notas, correos o documentos sin conexion a internet.
- Anonimizacion previa al envio a un LLM: detectar nombres, direcciones, identificadores y otros datos personales (PII) en local antes de reenviar el texto a un servicio en la nube, reduciendo el riesgo de fuga de datos.
- Digitalizacion de formularios medicos o de consulta: dado el contexto de la aplicacion Sprechstunde (consulta medica), el modelo puede extraer campos estructurados de historiales o notas clinicas segun un esquema predefinido.
- Procesamiento de facturas y recibos: extraccion de campos como emisor, CIF, fecha, base imponible e importe total mediante un esquema de etiquetas especifico, sin depender de plantillas fijas.
- Clasificacion de tickets de soporte: asignar categorias o etiquetas predefinidas a textos entrantes para su enrutado automatico, usando la capacidad de clasificacion condicionada por esquema.
- Construccion de grafos de conocimiento: extraer entidades y relaciones de documentos para poblar un grafo, aprovechando la extraccion de relaciones del modelo.
- Etiquetado de corpus para entrenamiento: generar anotaciones preliminares de entidades y relaciones en grandes volumenes de texto para su posterior revision humana.
- Monitorizacion de menciones en tiempo real en el dispositivo: detectar entidades relevantes (productos, marcas, localizaciones) en flujos de texto dentro de una app, con latencia baja y sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de GLiNER2 (arXiv 2507.18546v1) incluye evaluaciones comparativas, pero sus valores numericos no se detallan en los materiales consultados y no deben inferirse. Tampoco se proporcionan mediciones de latencia o throughput especificas para esta conversion CoreML.

## Requisitos de hardware

- El repositorio ocupa 0,4 GB, lo que sugiere un modelo compacto apto para ejecucion en dispositivo; los requisitos exactos de memoria no estan disponibles.
- Pensado para el ecosistema Apple: ejecucion sobre Neural Engine, GPU o CPU de chips Apple Silicon y, potencialmente, dispositivos iOS compatibles con CoreML.
- No se dispone de estimaciones de VRAM para GPU de escritorio ni de compatibilidad confirmada con CUDA.
- Opciones de despliegue: framework CoreML de Apple (a traves de coremltools y las APIs nativas); no aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo generativo en formato GGUF o safetensors.
- No se dispone de datos de latencia ni de throughput para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| ranzucker/gliner2-5-multi-coreml (este) | no disponible | no disponible | Extraccion de informacion (subset CoreML) | Apache-2.0 | CoreML |
| FluidInference/gliner2-5-multi-coreml | no disponible | no disponible | Conversion CoreML completa de GLiNER2.5 multi | Apache-2.0 (segun modelo base) | CoreML |
| fastino/gliner2.5-multi-v1 | no disponible | no disponible | Extraccion de informacion multilingue GLiNER2 | Apache-2.0 | pesos del framework GLiNER2 |
| GLiNER (urchade/GLiNER) | no disponible | no disponible | NER generalista y ligero | no disponible | no disponible |

No se dispone de valores de rendimiento numericos para establecer una comparacion cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no puede mantener conversaciones ni generar texto libre; su uso esta restringido a tareas de extraccion y clasificacion condicionadas por esquema.
- No se han publicado benchmarks especificos para este artefacto CoreML, por lo que su calidad real en produccion no puede verificarse con los datos disponibles.
- La lista exacta de idiomas soportados no esta confirmada, solo la indicacion "multi" del nombre del modelo base.
- Existe riesgo de alucinacion en el sentido de falsos positivos o spans mal delimitados, especialmente con esquemas ambiguos o solapados; se recomienda validacion en el dominio de destino.
- El repositorio es un espejo parcial: si la aplicacion Sprechstunde necesita ficheros no incluidos, habra que recurrir al repositorio original de FluidInference.
- La licencia Apache-2.0 permite uso comercial, pero el credito del modelo corresponde a sus autores originales (fastino); debe conservarse la atribucion y los avisos de licencia.
- Con 0 descargas y 0 likes, el repositorio no tiene validacion ni comunidad que respalde su uso; conviene comprobar la integridad de los ficheros frente al commit de origen indicado.
- Depende de la infraestructura CoreML de Apple, lo que limita su portabilidad a otros sistemas operativos o aceleradores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ranzucker/gliner2-5-multi-coreml
- Repositorio de origen (FluidInference): https://huggingface.co/FluidInference/gliner2-5-multi-coreml
- Modelo base (fastino): https://huggingface.co/fastino/gliner2.5-multi-v1
- Paper de GLiNER2: https://arxiv.org/pdf/2507.18546v1
- Repositorio GLiNER original (urchade): https://github.com/urchade/GLiNER
- Repositorio GLiNER2 (MengDataAI): https://github.com/MengDataAI/GLiNER2
