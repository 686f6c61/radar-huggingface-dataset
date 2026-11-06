# Ernes14AG/qwen3-1.7b-text2cypher

## Resumen

Qwen3-1.7B · Text2Cypher es un ajuste fino del modelo Qwen3-1.7B de Alibaba Qwen, especializado en traducir preguntas en inglés a consultas Cypher de solo lectura para bases de datos de grafos Neo4j. Lo desarrolla Ernes14AG y su propuesta central es la genericidad: el esquema del grafo se incluye en cada prompt, de modo que el modelo funciona con cualquier base de datos Neo4j sin necesidad de reentrenamiento. Con 1.720.574.976 parámetros, está pensado para ejecutarse en local.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B y se ha afinado mediante LoRA (r=32) durante una época sobre un conjunto de 3000 ejemplos sintéticos con consultas de referencia verificadas en Neo4j, más 11 ejemplos del dataset oficial neo4j/text2cypher-2025v1. La innovación práctica no está en la arquitectura, sino en el formato de prompt: además del esquema (etiquetas, propiedades y relaciones), admite "notas" con valores codificados, glosarios de jerga interna y semántica de las relaciones, y se ha entrenado para aprovecharlas.

Su relevancia actual radica en que cubre un nicho muy concreto (text-to-Cypher) con un modelo de 1,7B parámetros que cabe en 1,8 GB en cuantización Q8_0 y se distribuye vía Ollama, con scripts listos para usar que incluyen validación con `EXPLAIN` y ejecución en transacción de solo lectura. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q8_0 disponible en el repo GGUF); otras no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo secundario) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del Qwen3-1.7B base, un transformer denso de la familia Qwen3. El entrenamiento consistió en un LoRA con rango 32 aplicado durante una época. El conjunto de datos combina 3000 ejemplos sintéticos, en los que cada consulta de referencia fue verificada ejecutándola en Neo4j, cubriendo 24 tipos de pregunta (filtros, agregaciones, análisis de impacto con rutas de longitud variable `<-[:R*1..10]-`, caminos más cortos, relaciones ausentes y términos de glosario), con 11 ejemplos adicionales de neo4j/text2cypher-2025v1 filtrados a consultas válidas de solo lectura y sin el subconjunto CySpider.

La innovación técnica destacable es el diseño del prompt: el esquema se serializa con etiquetas de nodo, propiedades con tipos y relaciones, y se complementa con un bloque opcional de notas que describe valores codificados (por ejemplo `'prd' = production`), valores posibles, el significado de cada tipo de relación y un glosario de jerga interna. El modelo está entrenado para explotar esas notas, lo que reduce la ambigüedad en esquemas reales. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de consultas Cypher de solo lectura a partir de una pregunta en inglés y un esquema de Neo4j proporcionado en el prompt.
- Funcionamiento genérico: el esquema forma parte del prompt, por lo que no requiere reentrenamiento para nuevas bases de datos.
- Uso de notas de esquema: valores codificados, enumeraciones, semántica de relaciones y glosario de términos internos.
- Análisis de impacto y traversal de grafos: rutas de longitud variable, caminos más cortos y detección de relaciones ausentes.
- Filtros, agregaciones y consultas de propiedades.
- Integración como herramienta MCP mediante FastMCP, lo que permite que un agente consulte el grafo.
- Flujo de validación incluido: generación de la consulta, comprobación con `EXPLAIN` y ejecución en transacción de solo lectura.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Asistente de consulta sobre topologías de servicios: dado un grafo de servicios, bases de datos y equipos, el modelo responde preguntas como "¿qué se rompe si falla auth?" generando el traversal de dependencias inversas adecuado. Es adecuado por su entrenamiento específico en análisis de impacto y rutas de longitud variable.
- Herramienta para agentes LLM vía MCP: el script `mcp_tool_example.py` expone el modelo como herramienta FastMCP, de modo que un agente mayor puede delegar la traducción de preguntas a Cypher y recibir resultados tabulares del grafo.
- Exploración de bases de datos Neo4j por usuarios no técnicos: un analista formula la pregunta en inglés y obtiene la consulta Cypher y la tabla de resultados, sin conocer el lenguaje de consulta.
- Documentación y auditoría de esquemas: las notas del prompt permiten mapear valores codificados y jerga interna, y el modelo genera consultas que respetan esas convenciones, útil para equipos con esquemas heredados.
- Prototipado rápido de interfaces de consulta: al ejecutarse en local con Ollama (1,8 GB en Q8_0), permite montar un prototipo de búsqueda en grafos sin coste de API ni dependencia de servicios externos.
- Validación de calidad de datos en el grafo: preguntas del tipo "¿qué servicios no tienen propietario?" se traducen a consultas de detección de relaciones ausentes, aprovechables en pipelines de comprobación periódica.
- Entornos con requisitos de privacidad: al ser un modelo pequeño ejecutable en local, el esquema y los datos no salen de la infraestructura propia.

## Benchmarks y rendimiento

Métrica empleada: consulta correcta si al ejecutarla devuelve el mismo resultado que la consulta de referencia.

| Conjunto de prueba | Qwen3-1.7B base | Ajustado |
|---|---|---|
| synthetic (300 preguntas) | 14% | 94% |
| neo4j official (1 pregunta) | 0% | 0% |
| topology (15 preguntas) | 13% | 87% |
| synthetic · multi hop | 6% | 86% |
| synthetic · one hop | 23% | 95% |
| synthetic · properties | 13% | 99% |
| synthetic · dominios vistos en entrenamiento | 15% | 100% |
| synthetic · dominios nunca vistos | 13% | 87% |

El conjunto synthetic usa esquemas y datos nuevos, la mitad de dominios no vistos en entrenamiento (banca, sanidad, paquetes de software). El conjunto topology son 15 preguntas escritas a mano sobre una topología de servicios. El conjunto neo4j official corresponde al split de test de neo4j/text2cypher-2025v1 ejecutado sobre las bases de demostración públicas de Neo4j Labs, con una única pregunta y resultado del 0% en ambos modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,8 GB en cuantización Q8_0 (dato indicado en la model card para Ollama); el repo de pesos completos ocupa 3,5 GB, por lo que en fp16 se requiere del orden de 3,5-4 GB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojar la versión Q8_0.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales con al menos 4 GB de VRAM (por ejemplo, gama RTX xx60 y superiores).
- Opciones de despliegue: Ollama mediante `ollama pull hf.co/Ernes14AG/qwen3-1.7b-text2cypher-GGUF:Q8_0`; scripts Python propios del repositorio con el driver `neo4j`; integración como herramienta MCP con FastMCP. No se documentan otras opciones como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B · Text2Cypher (este) | 1,72B | no disponible | Text2Cypher para Neo4j | Apache-2.0 | Hugging Face + GGUF/Ollama |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | Propósito general | Apache-2.0 | Hugging Face |
| neo4j/text2cypher-2025v1 (dataset) | no aplica | no aplica | Conjunto de datos de referencia | Apache-2.0 | Hugging Face |

No se dispone en la información proporcionada de otros modelos afinados para text-to-Cypher con los que establecer una comparación cuantitativa; los resultados frente al modelo base se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Solo inglés: las preguntas deben formularse en ese idioma.
- Fallos en consultas muy complejas: `UNION` largos, subconsultas anidadas y procedimientos pueden no generarse correctamente.
- Esquemas grandes: se recomienda pasar únicamente las etiquetas y relaciones relevantes para la pregunta, ya que el prompt completo puede degradar el resultado.
- Compatibilidad limitada a Cypher para Neo4j 5.
- Riesgo de alucinación en la consulta generada: la seguridad debe venir de la base de datos, no del modelo. La model card insiste en ejecutar siempre en transacción de solo lectura (`session.execute_read`) y validar antes con `EXPLAIN`.
- El resultado en el conjunto oficial de Neo4j es del 0% en la única pregunta evaluada, lo que indica que la generalización a preguntas del benchmark oficial no está demostrada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales documentadas.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face (pesos completos): https://huggingface.co/Ernes14AG/qwen3-1.7b-text2cypher
- Versión GGUF para Ollama: https://huggingface.co/Ernes14AG/qwen3-1.7b-text2cypher-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de referencia: https://huggingface.co/datasets/neo4j/text2cypher-2025v1
