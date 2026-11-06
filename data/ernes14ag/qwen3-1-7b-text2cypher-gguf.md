# Ernes14AG/qwen3-1.7b-text2cypher-GGUF

## Resumen

Qwen3-1.7B · Text2Cypher es un ajuste fino del modelo base Qwen/Qwen3-1.7B orientado a una tarea muy concreta: traducir preguntas en ingles a consultas Cypher de solo lectura para bases de datos de grafos Neo4j. El desarrollador, Ernes14AG, parte de la arquitectura transformer densa de Qwen3 con 1.720.574.976 parametros y aplica un LoRA (r=32) durante una epoca sobre un conjunto de datos sinteticos verificado contra Neo4j. El resultado se distribuye tanto en pesos completos como en formato GGUF cuantizado, lo que permite ejecutarlo localmente con Ollama en un espacio de 1,8 GB.

La propuesta diferencial es la genericidad: el esquema del grafo se incluye en cada prompt, de modo que el modelo no esta atado a un esquema fijo y funciona con cualquier base de datos sin reentrenamiento. Ademas, el autor incorpora un bloque opcional de notas (valores codificados, glosario interno, semantica de relaciones) que el modelo aprende a explotar, algo relevante en entornos empresariales donde los nombres de propiedades no son autoexplicativos.

Es relevante ahora porque cubre un nicho practico —interfaces en lenguaje natural sobre grafos de conocimiento— con un modelo lo bastante pequeno para desplegarse en local y con licencia Apache-2.0, lo que facilita su integracion en herramientas de agentes mediante MCP o en scripts de automatizacion sin dependencia de API externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA r=32 |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona explicitamente Q8_0; el resto de variantes no disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el repositorio de pesos completos |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del transformer denso Qwen3-1.7B mediante LoRA con rango 32, entrenado durante una sola epoca. El objetivo es la generacion de Cypher para Neo4j 5 a partir de un prompt estructurado que contiene el esquema (etiquetas de nodos con sus propiedades y tipos, relaciones y un bloque opcional de notas) seguido de la pregunta en ingles. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

Los datos de entrenamiento consisten en 3000 ejemplos sinteticos cuyas consultas de referencia fueron verificadas ejecutandolas en Neo4j, cubriendo 24 tipos de pregunta: filtros, agregaciones, analisis de impacto con caminos variables (`<-[:R*1..10]-`), caminos mas cortos, relaciones ausentes y terminos de glosario. A esto se suman 11 ejemplos del dataset publico neo4j/text2cypher-2025v1 (Apache-2.0), filtrados a consultas validas de solo lectura y excluyendo el subconjunto CySpider. La innovacion principal no es arquitectonica sino de formato: el esquema y las notas forman parte del prompt, lo que convierte al modelo en un traductor generico de esquema + pregunta a consulta.

## Capacidades

- Generacion de consultas Cypher de solo lectura para Neo4j 5 a partir de preguntas en lenguaje natural.
- Adaptacion a esquemas arbitrarios incluidos en el prompt, sin reentrenamiento.
- Uso de notas de esquema: valores codificados (`'prd' = production`), valores posibles, semantica de relaciones y glosario interno.
- Consultas multi-salto: analisis de impacto, caminos variables, caminos mas cortos y deteccion de relaciones ausentes.
- Filtros, agregaciones y consultas de propiedades sobre nodos y relaciones.
- Integracion como herramienta MCP (FastMCP) para que un agente consulte el grafo.
- Generacion de texto conversacional heredada del modelo base Qwen3, aunque el ajuste esta orientado a la tarea Cypher.
- Soporte de tool calling: no documentado especificamente para este ajuste; disponible el ejemplo MCP como via de integracion.

## Casos de uso

- Asistente de consulta sobre grafos de conocimiento: el usuario formula una pregunta en ingles y el modelo genera la consulta Cypher que se ejecuta en transaccion de solo lectura, devolviendo una tabla de resultados. Adecuado por su formato de prompt con esquema y su validacion previa con `EXPLAIN`.
- Analisis de impacto en arquitecturas de microservicios: preguntas como "que se rompe si falla auth" se traducen en consultas con caminos variables (`<-[:CALLS*1..10]-`) sobre la topologia de servicios, un tipo de consulta incluido explicitamente en el entrenamiento.
- Herramienta para agentes via MCP: el script `mcp_tool_example.py` expone el modelo como herramienta FastMCP, de modo que un agente LLM puede consultar el grafo de forma autonoma en flujos multi-paso.
- Exploracion de bases Neo4j heredadas: el bloque de notas permite mapear valores codificados y jerga interna, lo que reduce errores en esquemas con nombres poco descriptivos.
- Generacion de consultas en entornos de desarrollo: integracion en notebooks o scripts (`ask_cypher.py`) para acelerar la escritura de Cypher durante el diseno de modelos de datos.
- Despliegue local con Ollama: al ocupar 1,8 GB en cuantizacion, puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo, util para equipos que no pueden enviar esquemas a servicios externos.
- Formacion y prototipado: servir de base para experimentos de text2query en dominios concretos, dado que el codigo de esquema, pregunta y validacion esta incluido en el repositorio.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden la correccion como coincidencia entre el resultado de la consulta generada y el de la consulta de referencia.

| Conjunto de prueba | Qwen3-1.7B base | Ajuste fino |
|---|---|---|
| synthetic (300 preguntas) | 14% | 94% |
| neo4j official (1 pregunta) | 0% | 0% |
| topology (15 preguntas) | 13% | 87% |
| synthetic · multi hop | 6% | 86% |
| synthetic · one hop | 23% | 95% |
| synthetic · properties | 13% | 99% |
| synthetic · dominios vistos en entrenamiento | 15% | 100% |
| synthetic · dominios nunca vistos | 13% | 87% |

El conjunto synthetic emplea esquemas y datos nuevos, la mitad de dominios no vistos en entrenamiento (banca, sanidad, paquetes de software). El conjunto neo4j official contiene una unica pregunta del split de test de neo4j/text2cypher-2025v1 ejecutada sobre las bases de demostracion de Neo4j Labs, por lo que su valor estadistico es practicamente nulo. El conjunto topology son 15 preguntas escritas a mano sobre una topologia de servicios con formulaciones naturales.

## Requisitos de hardware

- VRAM estimada: en cuantizacion Q8_0 el repositorio ocupa 1,8 GB, por lo que la inferencia requiere del orden de 2-3 GB de memoria considerando contexto y overhead; las variantes de menor precision no estan documentadas.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente; modelos como RTX 3060, RTX 4060 o superiores funcionan sin problema. Para despliegues en servidor, A100 o H100 no son necesarias y aportarian poco a este tamano.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual con 4 GB o mas.
- Opciones de despliegue: Ollama (`ollama pull hf.co/Ernes14AG/qwen3-1.7b-text2cypher-GGUF:Q8_0`), llama.cpp por ser formato GGUF, y los scripts Python incluidos (`schema_neo4j.py`, `ask_cypher.py`, `mcp_tool_example.py`, `load_example.py`). vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B · Text2Cypher (este) | 1.720.574.976 | no disponible | Text2Cypher con esquema en prompt | apache-2.0 | GGUF + safetensors en Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | no disponible | Generacion de texto general | apache-2.0 | Hugging Face |
| neo4j/text2cypher-2025v1 (dataset, no modelo) | no aplica | no aplica | Corpus de referencia para text2cypher | apache-2.0 | Hugging Face Datasets |

No se dispone en la informacion proporcionada de otros modelos ajustados especificamente a Text2Cypher con los que establecer una comparacion cuantitativa fiable; los datos de la tabla de benchmarks permiten comparar el ajuste con su modelo base, que es la referencia mas directa.

## Limitaciones y advertencias

- Solo funciona en ingles; las preguntas en otros idiomas no estan cubiertas por el entrenamiento.
- Las consultas muy complejas pueden fallar: UNION largos, subconsultas anidadas y procedimientos no estan garantizados.
- Con esquemas grandes conviene pasar solo las etiquetas y relaciones relevantes para la pregunta; el modelo no filtra el esquema por si mismo.
- Genera Cypher para Neo4j 5 exclusivamente.
- Riesgo de alucinacion en nombres de propiedades, etiquetas o relaciones no presentes en el esquema; por eso el autor recomienda validar con `EXPLAIN` y ejecutar siempre en transaccion de solo lectura (`session.execute_read`). La seguridad recae en la base de datos, no en el modelo.
- El conjunto de evaluacion oficial de Neo4j contiene una sola pregunta, por lo que los resultados de generalizacion a dominios reales deben tomarse con cautela pese al 87% en dominios no vistos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen3 conviene revisar las condiciones del modelo base por si hubiera terminos adicionales.
- No se documentan sesgos especificos del ajuste; al heredar el modelo base, pueden persistir sesgos del corpus original de Qwen3.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Ernes14AG/qwen3-1.7b-text2cypher-GGUF
- Pesos completos: https://huggingface.co/Ernes14AG/qwen3-1.7b-text2cypher
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de referencia: https://huggingface.co/datasets/neo4j/text2cypher-2025v1
