# liodon-ai/sqlcoder-7b-2-imatrix-GGUF

## Resumen

Esta ficha cubre `liodon-ai/sqlcoder-7b-2-imatrix-GGUF`, una colección de cuantizaciones GGUF publicada por Liodon AI a partir del modelo base `defog/sqlcoder-7b-2` de Defog. No se trata de un modelo nuevo, sino de una redistribución optimizada para inferencia local del SQLCoder-7B-2 original, un modelo de 6.738.546.688 parámetros especializado en la generación de consultas SQL a partir de lenguaje natural y esquemas de bases de datos. El problema que resuelve es doble: por un lado, la tarea de text-to-SQL en entornos donde no se quiere depender de APIs externas; por otro, la distribución del modelo en formatos ligeros que caben en GPUs de consumo.

La aportación concreta de esta publicación es el uso de calibración iMatrix (importance matrix) durante la cuantización: se ejecutan 128 fragmentos de calibración (2 millones de tokens de WikiText-103) sobre el modelo en precisión completa para identificar qué pesos son más sensibles, y se les asigna mayor precisión. El resultado, según el autor, es una mejora de coherencia y seguimiento de instrucciones a igual tamaño de fichero, especialmente en cuantizaciones de 2, 3 y 4 bits.

El repositorio ofrece siete variantes que van de IQ2_M (2,36 GB, ~3 GB de VRAM) a Q8_0 (7,16 GB, ~8 GB de VRAM), lo que permite desplegar el modelo desde portátiles con GPU modesta hasta estaciones de trabajo. Es relevante ahora porque el interés por el text-to-SQL local y por los asistentes de datos que no envían esquemas ni consultas a terceros ha crecido, y estas cuantizaciones reducen la barrera de hardware para probar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de defog/sqlcoder-7b-2; detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 6.738.546.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con calibración iMatrix) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | other (heredada del modelo base; condiciones exactas no disponibles) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, `defog/sqlcoder-7b-2`, es un transformer decoder-only de aproximadamente 6,74 mil millones de parámetros, afinado por Defog para la generación de SQL. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden a la model card del modelo original y no están incluidos en esta publicación.

La innovación técnica de esta versión concreta es la cuantización con iMatrix. El proceso pasa 128 chunks de calibración (2 millones de tokens de WikiText-103) por el modelo en precisión completa para estimar la importancia de cada peso, y después distribuye el presupuesto de bits de forma no uniforme: los pesos con mayor impacto reciben más precisión. El autor mantiene además una publicación paralela con cuantizaciones estándar (sin iMatrix) en `liodon-ai/sqlcoder-7b-2-GGUF`, lo que permite comparar ambas estrategias. No se documentan en esta información innovaciones arquitectónicas propias como decodificación especulativa o atención lineal.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural y de un esquema de base de datos, que es la tarea principal del modelo base.
- Generación de texto autoregresiva estándar mediante el pipeline `text-generation`.
- Compatibilidad con llama.cpp, Ollama, LM Studio y Jan, según los ejemplos de la model card.
- Etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia tipo API.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de consultas en herramientas de BI: el usuario describe en lenguaje natural qué métrica quiere y el modelo genera la consulta SQL contra el esquema cargado en el prompt; al ejecutarse en local, los nombres de tablas y columnas no salen de la infraestructura de la empresa.
- Generación de SQL en pipelines de datos: integración del modelo en un servicio interno que traduce peticiones de analistas a consultas listas para revisión, usando la variante Q4_K_M (~5 GB de VRAM) en una GPU de consumo o en CPU.
- Prototipado en portátiles: con IQ2_M (2,36 GB) o IQ3_M (3,11 GB) se puede probar el modelo en equipos sin GPU dedicada o con GPUs de gama baja, útil para evaluar si el text-to-SQL local es viable antes de invertir en hardware.
- Autocompletado de SQL en el editor: dado un esquema y una consulta parcial, el modelo puede completar la sentencia; la cuantización Q8_0 (esencialmente sin pérdida) es la opción para entornos donde la fidelidad es crítica.
- Documentación y explicación de esquemas: usar el modelo para generar descripciones de tablas y relaciones a partir de DDL, aprovechando su familiaridad con estructuras SQL.
- Entornos con requisitos de privacidad: despliegue en Ollama o llama.cpp dentro de una red aislada, sin llamadas a APIs externas, para bases de datos con datos sensibles o regulados.
- Educación y formación: servir el modelo con LM Studio para que estudiantes practiquen la traducción de preguntas a SQL sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de precisión (por ejemplo, execution accuracy en Spider o BIRD) ni comparaciones numéricas entre las distintas variantes de cuantización. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada según la model card del autor:
  - IQ2_M: 2,36 GB de fichero, ~3 GB de VRAM.
  - IQ3_M: 3,11 GB de fichero, ~4 GB de VRAM.
  - IQ4_XS: 3,62 GB de fichero, ~4 GB de VRAM.
  - Q4_K_M: 4,08 GB de fichero, ~5 GB de VRAM (recomendada por el autor).
  - Q5_K_M: 4,78 GB de fichero, ~6 GB de VRAM.
  - Q6_K: 5,53 GB de fichero, ~6 GB de VRAM.
  - Q8_0: 7,16 GB de fichero, ~8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por el tamaño, cualquier GPU con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) puede alojar las variantes de 4 a 6 bits; las de 2 y 3 bits caben en GPUs de 4 GB.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo de 8 GB o menos; las más pequeñas incluso en 4 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/sqlcoder-7b-2-imatrix-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/liodon-ai/sqlcoder-7b-2-imatrix-GGUF:Q4_K_M`), LM Studio y Jan.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/sqlcoder-7b-2-imatrix-GGUF (esta ficha) | 6,74 B | No disponible | GGUF (7 cuantizaciones) | other | Cuantización iMatrix del SQLCoder-7B-2 |
| defog/sqlcoder-7b-2 | 6,74 B | No disponible | Pesos originales (safetensors) | other | Modelo base de esta publicación |
| liodon-ai/sqlcoder-7b-2-GGUF | 6,74 B | No disponible | GGUF (sin iMatrix) | other | Misma fuente, cuantización estándar |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros modelos text-to-SQL de 7B). Los datos de contexto y rendimiento de los modelos comparados figuran como no disponibles.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todas las limitaciones del SQLCoder-7B-2 original, incluida su especialización estrecha en SQL; no debe esperarse un rendimiento generalista equiparable a un modelo de propósito general del mismo tamaño.
- Las cuantizaciones de 2 y 3 bits, aunque calibradas con iMatrix, introducen pérdida de precisión; el propio autor describe IQ2_M como la "más pequeña usable", lo que implica un compromiso de calidad.
- La licencia es "other" y las condiciones exactas no están disponibles en la información proporcionada; antes de un uso comercial es imprescindible consultar la licencia del modelo base `defog/sqlcoder-7b-2`.
- No hay información sobre sesgos, riesgo de alucinación en la generación de SQL (consultas sintácticamente válidas pero semánticamente incorrectas), ni sobre el comportamiento multilingüe.
- El modelo puede generar SQL incorrecto o peligroso (por ejemplo, consultas destructivas); en producción conviene validar y ejecutar con permisos restringidos.
- El repositorio tiene un volumen de descargas bajo (174) y ningún "like" en el momento de la consulta, lo que reduce la validación comunitaria de estas cuantizaciones concretas.
- La fecha de creación indicada (2026-10-31) aparece en los metadatos; conviene verificar la vigencia y el estado del repositorio antes de desplegarlo.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/liodon-ai/sqlcoder-7b-2-imatrix-GGUF
- Modelo base: https://huggingface.co/defog/sqlcoder-7b-2
- Cuantizaciones sin iMatrix del mismo autor: https://huggingface.co/liodon-ai/sqlcoder-7b-2-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
- Dataset de calibración: https://huggingface.co/datasets/wikitext
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
