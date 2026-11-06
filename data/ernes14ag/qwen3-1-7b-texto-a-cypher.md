# Ernes14AG/qwen3-1.7b-texto-a-cypher

## Resumen

Qwen3-1.7B · texto a Cypher es un ajuste fino supervisado del modelo Qwen3-1.7B de Alibaba, publicado por Ernes14AG, que transforma preguntas en lenguaje natural (castellano o inglés) en consultas Cypher de solo lectura para bases de datos de grafos Neo4j. El modelo recibe en el propio prompt el esquema del grafo (etiquetas de nodos, relaciones y notas sobre valores codificados) junto con la pregunta, de modo que es genérico: no requiere reentrenamiento para adaptarse a un esquema nuevo.

El problema que resuelve es concreto: escribir Cypher correcto es una barrera para usuarios no técnicos y una fuente habitual de errores en asistentes sobre grafos. El ajuste eleva la tasa de consultas correctas (resultado de ejecución coincidente con el esperado) del 23 % del modelo base al 92 % en un conjunto de 300 preguntas con esquemas no vistos, incluyendo un 84 % en sectores completamente nuevos.

Es relevante por su tamaño reducido (1.720.574.976 parámetros, 3,5 GB en safetensors) y su licencia Apache 2.0, que permiten desplegarlo en hardware modesto o incluso en local, con versiones GGUF publicadas para Ollama. La arquitectura subyacente es la de Qwen3-1.7B (transformer denso, no MoE), y el modelo conserva las capacidades conversacionales y multilingües del base, aunque su especialización es el text-to-Cypher.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B, modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no se especifica en la model card) |
| Tipos de cuantizacion | GGUF Q8_0 publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos) y GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros. No se documenta en la información disponible la composición exacta del dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; la model card indica únicamente que se entrenó con datos sintéticos procedentes de 7 sectores y 19 tipos de pregunta.

La innovación técnica principal no está en la arquitectura, sino en el formato de entrada: el esquema del grafo se incluye en cada prompt, con etiquetas de nodos, relaciones y notas opcionales sobre valores codificados y significado de las relaciones. El modelo está entrenado para aprovechar esas notas, lo que le permite resolver valores categóricos (`'C' = corriente`) y relaciones semánticas sin reentrenamiento. El entrenamiento cubre consultas de propiedades, de un salto en ambos sentidos, de varios saltos (impacto con `<-[:R*1..10]-`, alcance, `shortestPath` y cadenas de dos relaciones).

## Capacidades

- Generación de consultas Cypher de solo lectura para Neo4j 5 a partir de una pregunta en castellano o inglés.
- Búsquedas y filtros sobre propiedades, recuentos, agrupaciones y top-N.
- Manejo de fechas y búsqueda de texto.
- Relaciones de un salto en los dos sentidos, detección de nodos sin relación (`NOT EXISTS`) y comprobaciones de existencia.
- Consultas de varios saltos: análisis de impacto, alcance, camino más corto (`shortestPath`) y cadenas de dos relaciones.
- Generalización a esquemas no vistos: el esquema va en el prompt, por lo que sirve para cualquier base de datos de grafos.
- Capacidad multilingüe cruzada: pregunta en un idioma y esquema en otro (castellano/inglés).
- Integración como tool de MCP (FastMCP) para que un agente consulte el grafo.
- Capacidades conversacionales y de generación de texto heredadas del Qwen3-1.7B base.

## Casos de uso

- Asistente de consulta para analistas de negocio: un usuario sin conocimientos de Cypher formula una pregunta en castellano sobre el grafo y el modelo genera la consulta, que se ejecuta en una transacción de solo lectura y se devuelve como tabla. Adecuado por su 92 % de acierto en esquemas no vistos.
- Análisis de impacto en dependencias de software: con un grafo de servicios y dependencias, el modelo genera consultas de varios saltos (`<-[:DEPENDE_DE*1..10]-`) para responder "¿qué servicios dependen de pagos-db?". El 87 % de acierto en el grupo de varios saltos lo respalda.
- Detección de fraude y trazabilidad financiera: sobre un grafo de cuentas y transferencias, genera consultas de alcance ("¿desde qué cuentas podría haber llegado dinero a ES-1002?") usando caminos variables y `shortestPath`.
- Agente autónomo sobre Neo4j: integrado como tool de MCP, permite que un agente LLM consulte el grafo de forma iterativa sin que el desarrollador escriba Cypher manualmente.
- Generación de consultas en pipelines de datos: automatizar la extracción de subgrafos para informes o ETL, validando cada consulta con `EXPLAIN` antes de ejecutarla.
- Despliegue local o en el borde: con 1,7 B de parámetros y versión GGUF Q8_0, puede ejecutarse en Ollama en una estación de trabajo, útil para entornos con requisitos de privacidad de datos.
- Soporte multilingüe en equipos mixtos: preguntas en castellano sobre esquemas documentados en inglés (94 % de acierto en esa combinación), útil en organizaciones con documentación técnica en inglés.

## Benchmarks y rendimiento

Evaluación del autor sobre 300 preguntas con esquemas y datos no vistos en entrenamiento; la mitad de sectores completamente nuevos (banca, sanidad, dependencias de software). Correcto = el resultado de ejecutar la consulta en Neo4j coincide con el esperado.

| Métrica | Qwen3-1.7B base | Ajustado |
|---|---|---|
| Válido | 88 % | 100 % |
| Solo lectura | 88 % | 100 % |
| Correcto | 23 % | 92 % |
| Grupo: propiedades | 20 % | 99 % |
| Grupo: un salto | 44 % | 91 % |
| Grupo: varios saltos | 6 % | 87 % |
| Sector: nuevo | 23 % | 84 % |
| Sector: visto | 23 % | 100 % |
| Idiomas: pregunta en · esquema en | 26 % | 94 % |
| Idiomas: pregunta en · esquema es | 19 % | 95 % |
| Idiomas: pregunta es · esquema en | 30 % | 93 % |
| Idiomas: pregunta es · esquema es | 19 % | 86 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16 para los pesos completos, más overhead de contexto; en torno a 2 GB con cuantización GGUF Q8_0.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090); en centro de datos, A100 o H100 sobredimensionadas para este tamaño, útiles solo por concurrencia.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB de VRAM, y también en CPU mediante llama.cpp u Ollama.
- Opciones de despliegue: Ollama (`ollama pull hf.co/Ernes14AG/qwen3-1.7b-texto-a-cypher-GGUF:Q8_0`), llama.cpp con el GGUF, y frameworks compatibles con safetensors (vLLM, TGI, transformers) para los pesos completos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Scripts incluidos en el repo: `esquema_neo4j.py`, `preguntar_cypher.py` y `tool_mcp_ejemplo.py` (requiere `pip install neo4j`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B · texto a Cypher (este) | 1,72 B | no disponible | Text-to-Cypher Neo4j 5, es/en | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| Alternativas específicas de text-to-Cypher | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos comparables de text-to-Cypher con datos de rendimiento verificables; la comparación directa más fiable es con el modelo base, incluida en la tabla de benchmarks.

## Limitaciones y advertencias

- Datos sintéticos: entrenado con 7 sectores y 19 tipos de pregunta; preguntas muy distintas (subconsultas complejas, `UNION`, cálculos encadenados) pueden fallar.
- Esquemas grandes: debe pasarse solo las etiquetas y relaciones relevantes para la pregunta; un esquema completo y extenso degrada la calidad.
- Compatibilidad limitada a Cypher de Neo4j 5; no se garantiza su funcionamiento en otras versiones o dialectos.
- Riesgo de alucinación: aunque el 100 % de las consultas generadas en la evaluación fueron válidas y de solo lectura, el modelo puede producir consultas sintácticamente correctas pero semánticamente erróneas en dominios alejados del entrenamiento (16 % de fallo en sectores nuevos).
- Seguridad: la model card advierte explícitamente de ejecutar siempre en transacción de solo lectura (`session.execute_read`) y validar con `EXPLAIN`; la seguridad debe imponerla la base de datos, no el modelo.
- Idiomas: solo castellano e inglés; el rendimiento baja al 86 % cuando pregunta y esquema están ambos en castellano.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan sesgos específicos del ajuste; al heredar el base Qwen3-1.7B, puede arrastrar sesgos de sus datos de preentrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema y validación externa aún inexistentes.

## Enlaces

- Modelo en Hugging Face (pesos completos): https://huggingface.co/Ernes14AG/qwen3-1.7b-texto-a-cypher
- Versión GGUF para Ollama: https://huggingface.co/Ernes14AG/qwen3-1.7b-texto-a-cypher-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
