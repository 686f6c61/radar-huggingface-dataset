# Ernes14AG/qwen3-1.7b-texto-a-cypher-GGUF

## Resumen

Qwen3-1.7B texto a Cypher es un ajuste fino del modelo Qwen3-1.7B de Alibaba orientado a una tarea muy concreta: traducir una pregunta en lenguaje natural, junto con el esquema de un grafo de Neo4j, a una consulta Cypher de solo lectura que la responde. Lo desarrolla Ernes14AG y se distribuye en dos repositorios: los pesos completos y esta versión cuantizada en GGUF pensada para ejecutarse con Ollama. El modelo es genérico respecto al dominio, ya que el esquema se incluye en cada petición, por lo que no requiere reentrenamiento para adaptarse a una base de datos de grafos distinta.

La relevancia del modelo está en su tamaño: con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), cabe en hardware de consumo y puede desplegarse localmente, algo útil para entornos donde el esquema de la base de datos no puede enviarse a una API externa. El ajuste se ha centrado en la corrección semántica de la consulta generada y en la seguridad (que la consulta sea de solo lectura), dos problemas habituales cuando se pide a un modelo generalista que escriba Cypher.

La model card reporta una mejora sustancial frente al Qwen3-1.7B base en una evaluación de 300 preguntas con esquemas no vistos: la tasa de consultas correctas pasa del 23 % al 92 %, y en sectores completamente nuevos del 23 % al 84 %. El modelo soporta español e inglés, tanto en la pregunta como en el esquema, y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B; detalles de atención no disponibles) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo incluye al menos Q8_0; otras variantes no disponibles) |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repo del modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y se ha ajustado mediante fine-tuning supervisado sobre un conjunto de datos sintéticos propio. Según la model card, el entrenamiento cubre 7 sectores y 19 tipos de pregunta, con pares de esquema de grafo, pregunta y consulta Cypher de referencia. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles.

La innovación principal no es arquitectónica sino de formato y de objetivo: el modelo aprende a consumir el esquema y las notas semánticas (valores codificados, significado de las relaciones) dentro del propio prompt, y a producir consultas restringidas a operaciones de lectura. La evaluación reportada mide la corrección por resultado de ejecución en Neo4j, no por similitud textual con la consulta de referencia, lo que es el criterio adecuado para esta tarea. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de consultas Cypher de solo lectura a partir de una pregunta en español o inglés y un esquema de Neo4j 5.
- Búsquedas y filtros sobre propiedades, con soporte de valores codificados descritos en las notas del esquema.
- Recuentos, agrupaciones y consultas top-N.
- Operaciones con fechas y búsqueda de texto.
- Relaciones de un salto en ambos sentidos, incluyendo nodos sin relación (`NOT EXISTS`) y comprobaciones de existencia.
- Consultas de varios saltos: análisis de impacto (`<-[:R*1..10]-`), alcance, camino más corto (`shortestPath`) y cadenas de dos relaciones.
- Capacidad multilingüe cruzada: pregunta y esquema pueden estar en idiomas distintos (es/en) dentro de la misma petición.
- Integración como tool de MCP (FastMCP) para que un agente consulte el grafo, según el script incluido en el repo.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido más allá de la tarea de traducción a Cypher.

## Casos de uso

- Asistente de consulta sobre bases de datos de grafos en producción: el modelo recibe el esquema y la pregunta del usuario y devuelve la consulta Cypher, que se ejecuta en una transacción de solo lectura (`session.execute_read`) tras validarla con `EXPLAIN`. Es adecuado porque su tasa de consultas válidas y de solo lectura reportada es del 100 % en la evaluación del autor.
- Análisis de impacto en grafos de dependencias de software: preguntas como qué servicios dependen de una base de datos concreta se resuelven con consultas de varios saltos (`<-[:DEPENDE_DE*1..10]-`), un tipo de consulta que el modelo cubre explícitamente.
- Detección de fraude o flujos de dinero en banca: el ejemplo de la model card (qué cuentas podrían haber recibido dinero de una cuenta dada, directa o indirectamente) se resuelve con un recorrido de profundidad variable sobre relaciones de transferencia.
- Exploración de datos para analistas no técnicos: el modelo permite que personal sin conocimientos de Cypher formule preguntas en lenguaje natural sobre un grafo, con las notas del esquema aportando el contexto de valores codificados.
- Agente autónomo con acceso a grafo vía MCP: el script `tool_mcp_ejemplo.py` expone la traducción y ejecución como herramienta de un agente, de modo que este pueda consultar el grafo en varios pasos de razonamiento.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse con Ollama sobre hardware de consumo, el esquema y los datos no salen de la infraestructura propia, algo relevante cuando el grafo contiene información sensible.
- Generación de esquemas de consulta para documentación o pruebas: el modelo puede producir consultas de referencia para validar el comportamiento de un grafo en entornos de desarrollo.

## Benchmarks y rendimiento

Evaluación del autor sobre 300 preguntas con esquemas y datos no vistos en entrenamiento; la mitad corresponden a sectores completamente nuevos. El criterio de corrección es que el resultado de ejecutar la consulta en Neo4j coincida con el esperado.

| Métrica | Qwen3-1.7B base | Ajustado |
|---|---|---|
| Consulta válida | 88 % | 100 % |
| Solo lectura | 88 % | 100 % |
| Correcta | 23 % | 92 % |
| Grupo: propiedades | 20 % | 99 % |
| Grupo: un salto | 44 % | 91 % |
| Grupo: varios saltos | 6 % | 87 % |
| Sector nuevo | 23 % | 84 % |
| Sector visto | 23 % | 100 % |
| Pregunta en inglés, esquema en inglés | 26 % | 94 % |
| Pregunta en inglés, esquema en español | 19 % | 95 % |
| Pregunta en español, esquema en inglés | 30 % | 93 % |
| Pregunta en español, esquema en español | 19 % | 86 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,72 mil millones de parámetros, en Q8_0 el peso de los pesos ronda los 1,8 GB; en cuantizaciones de 4 bits se situaría aproximadamente entre 1 y 1,2 GB, aunque el repo solo documenta explícitamente Q8_0.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. En entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas recientes y también en CPU mediante llama.cpp, con mayor latencia.
- Opciones de despliegue: Ollama (`ollama pull hf.co/Ernes14AG/qwen3-1.7b-texto-a-cypher-GGUF:Q8_0`), llama.cpp por ser formato GGUF, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-1.7B texto a Cypher (este) | 1,72 B | no disponible | Texto a Cypher sobre esquema Neo4j | Apache 2.0 | GGUF, safetensors |
| Qwen3-1.7B base | 1,72 B | no disponible | Modelo generalista | Apache 2.0 | safetensors, GGUF |
| Modelos generalistas de mayor tamaño (p. ej. familia Qwen3 de 7 B o superior) | no disponible en la información | no disponible | Generación general, Cypher entre otras tareas | según modelo | según modelo |

La comparación relevante disponible es contra el modelo base: el ajuste multiplica por cuatro la tasa de consultas correctas (23 % a 92 %) manteniendo el mismo tamaño y licencia. No se dispone de datos de otros modelos especializados en texto a Cypher en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento usa datos sintéticos de 7 sectores y 19 tipos de pregunta; consultas muy distintas (subconsultas complejas, `UNION`, cálculos encadenados) pueden fallar.
- Con esquemas grandes, la precisión baja: se recomienda pasar solo las etiquetas y relaciones relevantes para la pregunta.
- El modelo genera Cypher para Neo4j 5; otras versiones o dialectos no están cubiertos.
- La seguridad no la garantiza el modelo: la model card insiste en ejecutar siempre en transacción de solo lectura y validar con `EXPLAIN`, ya que la base de datos es quien debe imponer la restricción.
- Riesgo de alucinación en nombres de etiquetas, propiedades o relaciones no presentes en el esquema, especialmente si el esquema es ambiguo o incompleto.
- El rendimiento en español con esquema en español es el más bajo de la tabla de evaluación (86 %), por debajo de las combinaciones con inglés.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a prompts adversarios.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-1.7B, también Apache 2.0 según la información disponible.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/Ernes14AG/qwen3-1.7b-texto-a-cypher-GGUF
- Pesos completos: https://huggingface.co/Ernes14AG/qwen3-1.7b-texto-a-cypher
