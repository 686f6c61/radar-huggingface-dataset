# erangamapa/tweet-outcome-classifier-qwen2.5-1.5b-qlora

## Resumen

`erangamapa/tweet-outcome-classifier-qwen2.5-1.5b-qlora` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario erangamapa. Su funcion es leer publicaciones de noticias deportivas y devolver, en formato JSON, cuatro campos estructurados: tipo de evento, entidad, nivel de certeza y direccion de mercado. Se trata, por tanto, de un clasificador de extraccion de informacion especializado en el dominio de las casas de apuestas deportivas (sportsbook), no de un modelo generativo de proposito general.

El modelo resuelve un problema concreto de triaje: filtrar y etiquetar el flujo de noticias entrantes antes de que un modelo de mayor tamano (frontier) las procese, reduciendo coste y latencia en pipelines de ingesta. Con 1.5B parametros en el modelo base y un adaptador LoRA, el coste de inferencia es bajo, lo que lo hace adecuado para etapas de preprocesamiento de alto volumen.

La relevancia actual reside en su enfoque de destilacion practica: las etiquetas se generaron con un modelo profesor y se auditaron parcialmente de forma humana, un patron habitual para construir clasificadores de dominio estrecho a bajo coste. La licencia es Apache 2.0 y los pesos se distribuyen exclusivamente en safetensors. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.5B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponibles (la model card advierte cobertura escasa en textos no ingleses) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exclusivamente; el autor declara no subir formatos basados en pickle) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parametros. El entrenamiento empleo QLoRA (LoRA con cuantizacion del modelo base), segun indica el identificador del repositorio y la libreria declarada (peft). La tarea es de clasificacion estructurada con salida JSON de cuatro campos: `event_type`, `entity`, `certainty` y `market_direction`.

El conjunto de entrenamiento consta de 48.000 filas de entrenamiento y 6.000 de desarrollo, con semilla 42. Los datos proceden del feed de ingesta de noticias, etiquetados por un modelo profesor con una muestra auditada humanamente. El autor advierte que los errores del profesor pueden ser copiados por el estudiante. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. Todos los ejemplos publicos en los fixtures son sinteticos.

## Capacidades

- Clasificacion de noticias deportivas en cuatro dimensiones: tipo de evento, entidad implicada, nivel de certeza y direccion de mercado.
- Salida estructurada en JSON, apta para consumo programatico en pipelines.
- Triaje de ingesta: etiquetado previo de noticias antes de pasarlas a un modelo de mayor capacidad.
- Capacidad de escalado por confianza: el autor indica que las salidas de baja confianza deben escalarse, no confiarse.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card senala cobertura escasa en publicaciones no inglesas.

## Casos de uso

- Triaje de noticias deportivas en produccion: el adaptador etiqueta cada publicacion entrante con tipo de evento y entidad antes de que un modelo frontier la procese, reduciendo el volumen y el coste de la etapa costosa del pipeline.
- Enrutamiento por direccion de mercado: la salida `market_direction` permite dirigir noticias a colas de analisis o a sistemas de alerta segun el sentido del mercado, siempre con supervision humana.
- Extraccion de entidades para enriquecimiento: el campo `entity` alimenta indices o bases de datos de seguimiento de equipos, jugadores o competiciones.
- Filtrado por certeza: el campo `certainty` permite descartar o escalar noticias ambiguas antes de acciones posteriores, tal como recomienda el autor.
- Preprocesamiento en pipelines de datos: al ser un adaptador LoRA sobre 1.5B, puede ejecutarse en hardware modesto para clasificar lotes de noticias historicas.
- Deteccion de eventos para alertas editoriales: clasificar noticias por `event_type` para disparar revisiones humanas en redacciones o mesas de analisis.
- Prototipado rapido de clasificadores de dominio: sirve como ejemplo de destilacion profesor-estudiante con auditoria humana parcial para equipos que construyen taxonomias cerradas.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden del fichero de metricas del entrenamiento, segun la model card. No se comparan con modelos similares.

| Metrica | Valor |
|---|---|
| event_type_f1 | 0.910 |
| entity_f1 | 0.880 |
| certainty_f1 | 0.840 |
| market_direction_f1 | 0.870 |

El autor aclara que estas cifras no sustituyen a la suite de evaluacion (evalgate) que el modelo debe superar antes de publicarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo de 1.5B en precision completa requiere del orden de 3-4 GB de VRAM, y en cuantizacion de 4 bits puede situarse en torno a 1-2 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se confirma en la model card.
- Opciones de despliegue: la libreria declarada es peft; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de alternativas comparables en la informacion proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tweet-outcome-classifier-qwen2.5-1.5b-qlora | 1.5B (base) + LoRA | no disponible | Apache 2.0 | Clasificador de dominio especifico |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador fue entrenado con un conjunto fijo de etiquetas y forzara eventos desconocidos hacia la clase mas cercana.
- No debe usarse para liquidar apuestas ni para mover precios de forma autonoma, segun el autor.
- Las etiquetas provienen de un modelo profesor con auditoria humana parcial; los errores del profesor pueden propagarse al estudiante.
- Cobertura escasa de ligas menores y de publicaciones en idiomas distintos del ingles.
- Riesgo de alucinacion y de clasificacion erronea en eventos fuera de la taxonomia entrenada.
- Las salidas de baja confianza deben escalarse a revision humana, no confiarse.
- No se documentan sesgos especificos mas alla de los anteriores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no declara garantias sobre el rendimiento en produccion.
- Los ejemplos publicos son sinteticos; no se garantiza la representatividad de los datos reales de ingesta.

## Enlaces

- HuggingFace: https://huggingface.co/erangamapa/tweet-outcome-classifier-qwen2.5-1.5b-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
