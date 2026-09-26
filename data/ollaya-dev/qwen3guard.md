# ollaya-dev/qwen3guard

## Resumen
`ollaya-dev/qwen3guard` es un paquete de distribucion publicado por el proyecto Ollaya que empaqueta el modelo de moderacion Qwen/Qwen3Guard-Gen-0.6B, desarrollado por el equipo Qwen de Alibaba Cloud, en formato ONNX para su ejecucion local dentro del runtime Rust de Ollaya. El repositorio no contiene pesos propios: incluye unicamente los grafos derivados, la configuracion de decision y de calibracion, y delega la descarga de pesos en los repositorios upstream, fijada a un commit y verificada mediante sha256.

El modelo subyacente pertenece a la familia Qwen3Guard, una serie de guardrails multilingues construida sobre Qwen3 y entrenada con 1,19 millones de prompts y respuestas etiquetados por seguridad. La variante Gen plantea la clasificacion de seguridad como una tarea de seguimiento de instrucciones con juicio trinario (seguro, controvertido, inseguro), frente a la variante Stream, orientada a la monitorizacion token a token durante la generacion.

Su relevancia reside en que ofrece un clasificador de seguridad de aproximadamente 0,6B parametros con licencia Apache-2.0, ejecutable en CPU y GPU a traves de un runtime tipo Ollama, con paridad numerica verificada frente a la referencia de transformers: identificadores de token identicos, misma decision en todas las preguntas y probabilidades dentro de 1,4e-5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3, usado como modelo de decision/clasificacion generativa |
| Parametros totales | 0,6 mil millones (0,6B), segun la nomenclatura del modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (unico grafo ONNX publicado en este paquete); no se ofrecen variantes cuantizadas |
| Idiomas soportados | Multilingue segun la familia Qwen3Guard; lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo fp32); los pesos se referencian por offset de bytes a los ficheros upstream y se descargan y verifican por sha256 |

## Arquitectura y entrenamiento
El modelo base, Qwen3Guard-Gen-0.6B, es un transformer denso construido sobre Qwen3 y entrenado con un conjunto de 1,19 millones de prompts y respuestas etiquetados por seguridad. La variante Gen reformula la clasificacion de seguridad como una tarea de instruccion: el modelo recibe el prompt completo del usuario y la respuesta del modelo y emite un juicio trinario (seguro, controvertido, inseguro). El informe tecnico de la familia (arXiv 2510.14276) indica que esta variante supera a los modelos estado del arte previos en deteccion de prompts y respuestas no seguras en diversos idiomas.

Este paquete concreto es un artefacto de despliegue, no un entrenamiento nuevo: Ollaya exporta el modelo a ONNX en fp32 con un unico grafo valido para CPU y GPU, y anade dos ficheros de configuracion propios. `decision.json` define la disposicion de la secuencia y los tokens especiales; `calibration.json` contiene las temperaturas de calibracion. Ademas, `questions.json` fija el conjunto de preguntas integradas: el modelo responde a esas y solo a esas, de modo que las peticiones omiten el campo `questions`. No hay informacion sobre RLHF, DPO u otras fases de alineamiento en la documentacion disponible.

## Capacidades
- Clasificacion de seguridad de prompts y respuestas con tres categorias: seguro, controvertido e inseguro.
- Evaluacion conjunta de prompt de usuario y respuesta del modelo, no solo de una de las dos partes.
- Capacidad multilingue heredada de la familia Qwen3Guard, orientada a moderacion en varios idiomas.
- Salida con probabilidades calibradas mediante temperaturas definidas en `calibration.json`.
- Ejecucion en CPU y en CUDA con el mismo grafo fp32.
- Paridad numerica con la referencia de transformers: identificadores de token identicos y decisiones identicas en 296 preguntas integradas, con desviacion de probabilidades inferior a 1,4e-5.
- Respuesta limitada al conjunto de preguntas integradas; no es un modelo de chat abierto ni genera texto libre.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso
- Moderacion de entradas en un chatbot: el modelo recibe el prompt del usuario y devuelve un juicio trinario que permite bloquear, marcar para revision o permitir la peticion antes de que llegue al modelo generativo.
- Moderacion de salidas en produccion: dado el par prompt-respuesta, actua como filtro de segunda capa para detectar respuestas inseguras antes de mostrarlas al usuario final.
- Etiquetado de conjuntos de datos: al ser un clasificador de ~0,6B ejecutable en CPU, permite anotar grandes volumenes de prompts y respuestas con etiquetas de seguridad sin depender de APIs externas.
- Cumplimiento y auditoria: integrado en un pipeline de registro, permite justificar decisiones de moderacion con probabilidades calibradas y una taxonomia de tres niveles, util para revisar casos limite.
- Filtrado previo en sistemas RAG: se puede aplicar a consultas y a fragmentos recuperados para evitar que contenido no seguro entre en el contexto del generador.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local mediante el runtime de Ollaya, los prompts y respuestas de moderacion no salen de la infraestructura propia.
- Moderacion multilingue en plataformas con usuarios de varios idiomas, aprovechando la cobertura multilingue de la familia Qwen3Guard.
- Evaluacion comparativa de guardrails en investigacion: sirve como baseline pequeno y reproducible para contrastar con modelos de moderacion de mayor tamano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del paquete unicamente reporta datos de paridad con la implementacion de referencia: coincidencia exacta en los identificadores de token, coincidencia de la decision en las 296 preguntas integradas y diferencias de probabilidad inferiores a 1,4e-5 sobre 74 textos (148 filas), tanto en CPU como en CUDA.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: alrededor de 2,4 GB solo para los pesos en fp32 (0,6B parametros x 4 bytes), mas el margen de activaciones y del runtime; el consumo real no esta documentado.
- Cabe sin problemas en GPU de consumo: cualquier tarjeta con 4-6 GB o mas de VRAM deberia ser suficiente segun esa estimacion.
- Ejecucion en CPU viable por el tamano del modelo y por la existencia de un grafo fp32 destinado a CPU en el propio paquete.
- GPU de centro de datos (A100, H100) no necesarias para un modelo de este tamano; resultarian sobredimensionadas salvo por agregacion de muchas peticiones.
- Despliegue: runtime de Ollaya (`ollaya run qwen3guard`, `ollaya pull`), que soporta CPU y CUDA; tambien es tecnicamente posible servir el grafo con ONNX Runtime, aunque no se documenta una integracion oficial.
- vLLM, llama.cpp, Ollama y TGI no se mencionan como opciones soportadas para este paquete; llama.cpp requeriria una conversion a GGUF que no se proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ollaya-dev/qwen3guard | 0,6B | no disponible | paridad fp32 con transformers (1,4e-5) | Apache-2.0 | ONNX via runtime de Ollaya |
| Qwen/Qwen3Guard-Gen-0.6B | 0,6B | no disponible | referencia upstream de la paridad | Apache-2.0 | Pesos originales en HuggingFace |
| Qwen3Guard-Gen-4B | 4B | no disponible | no disponible | no disponible | Pesos en HuggingFace |
| Qwen3Guard-Gen-8B | 8B | no disponible | no disponible | no disponible | Pesos en HuggingFace |

No se dispone de datos numericos de benchmarks que permitan comparar el rendimiento de estas variantes entre si ni frente a otras familias de guardrails.

## Limitaciones y advertencias
- El modelo no es generativo en sentido abierto: solo responde al conjunto de preguntas definido en `questions.json`, por lo que no sirve para tareas fuera de ese contrato.
- No se han publicado resultados de benchmarks para este paquete, de modo que su calidad real de moderacion no se puede contrastar con cifras.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB: no existe validacion por parte de la comunidad.
- El paquete no contiene pesos: cualquier uso depende de que los repositorios upstream sigan accesibles y del commit fijado; la verificacion por sha256 es la unica garantia de integridad.
- Solo se ofrece una variante fp32, lo que implica mayor uso de memoria y ancho de banda que una version cuantizada equivalente.
- La lista concreta de idiomas soportados y la longitud de contexto no estan documentadas en la informacion disponible.
- Como todo clasificador de seguridad, esta sujeto a falsos positivos y falsos negativos; las etiquetas "controvertido" requieren una politica de decision propia en produccion.
- No se documentan sesgos especificos ni procedimientos de mitigacion en la informacion disponible.
- La licencia del paquete y del modelo base es Apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia de cada variante de la familia por separado.
- El modelo base procede de un entrenamiento sobre 1,19 millones de ejemplos etiquetados; la cobertura de dominios muy especificos (juridico, medico, codigo) no esta garantizada.

## Enlaces
- Paquete en HuggingFace: https://huggingface.co/ollaya-dev/qwen3guard
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- Repositorio de Qwen3Guard: https://github.com/QwenLM/Qwen3Guard
- Informe tecnico (arXiv, abstract): https://arxiv.org/abs/2510.14276
- Informe tecnico (arXiv, HTML): https://arxiv.org/html/2510.14276v1
- Variante mayor de la familia: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Repositorio de Ollaya: https://github.com/ollaya-dev/ollaya
- Cobertura y notas de la version 0.6.0 de Ollaya: https://ai-tldr.dev/tools/ollaya/
