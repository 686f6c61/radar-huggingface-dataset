# JaveedHabeeb/text-to-sql-qwen2.5-coder-3b-phase2

## Resumen

JaveedHabeeb/text-to-sql-qwen2.5-coder-3b-phase2 es un adaptador LoRA (PEFT) especializado en generación de SQL a partir de lenguaje natural (text-to-SQL), publicado por el usuario JaveedHabeeb. No es un modelo completo, sino un ajuste fino de bajo rango (r=16, alpha=32) montado sobre el modelo base unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit, un transformer decoder-only de 3.000 millones de parámetros en su versión cuantizada a 4 bits. El adaptador se distribuye en safetensors y ocupa 0,1 GB en el repositorio, ya que solo contiene los pesos diferenciales del LoRA.

El objetivo del proyecto es mejorar la conversión de preguntas en lenguaje natural a consultas SQL sobre el esquema del conjunto de datos Spider, con atención explícita a patrones estructurales difíciles como self-joins, NOT-IN y operaciones de conjuntos. El entrenamiento emplea 9.380 ejemplos (el conjunto de entrenamiento completo de Spider más aumentación dirigida), durante 2 épocas y con una tasa de aprendizaje de 0,0002. En un subconjunto de 200 ejemplos de validación de Spider alcanza un 72,5 % de exactitud de ejecución y un 43,5 % de coincidencia exacta.

La relevancia de esta ficha reside en que documenta una variante concreta (la variante «a») de un proceso iterativo de tres fases. La propia model card justifica la elección frente a la variante «b» (r=32/alpha=64, 73,0 % de exactitud de ejecución) argumentando que la diferencia de 0,5 puntos está dentro del margen estadístico de ±6,4 puntos para n=200, y que la variante «a» resuelve 3 de los 4 patrones difíciles identificados en la fase anterior. Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.000 millones en el modelo base; numero exacto de parametros del adaptador no disponible (r=16, alpha=32; repositorio de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base referenciado esta en bnb-4bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-3B-Instruct, un transformer decoder-only con atención causal estándar. Sobre él se aplica un ajuste LoRA de rango 16 y alpha 32, y el entrenamiento se realiza en QLoRA porque el modelo base se carga cuantizado a 4 bits con bitsandbytes (sufijo bnb-4bit). El adaptador se entrenó con la librería Unsloth, tal como indica la etiqueta del repositorio, lo que implica un uso orientado a bajo consumo de memoria durante el ajuste. No se documenta ninguna innovación arquitectónica adicional (atención lineal, decodificación especulativa ni mezcla de expertos).

El conjunto de entrenamiento consta de 9.380 ejemplos y combina el conjunto de entrenamiento completo de Spider con aumentación dirigida a patrones self-join y NOT-IN. Se realizaron 2 épocas con una tasa de aprendizaje de 0,0002. No se menciona el uso de RLHF ni de DPO; el proceso parece un ajuste supervisado puro sobre pares pregunta-SQL. La model card hace referencia a un proceso en tres fases (Phase 0/1/2) con una evaluación común sobre 200 ejemplos de validación de Spider con semilla 42, y a tres variantes de hiperparámetros (a, b y c), de las que este repositorio corresponde a la variante «a».

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural, entrenada específicamente sobre el esquema de Spider.
- Manejo de consultas con self-joins: la variante «a» corrige este patrón, según la revisión de fallos reportada.
- Manejo de expresiones NOT-IN y exclusión de conjuntos: patrón corregido en esta variante.
- Gestión de joins entre tablas sin alucinar nombres de tabla o columna en los casos resueltos.
- No hay evidencia documentada de soporte de tool calling ni de function calling.
- No hay evidencia documentada de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponible; solo se documenta evaluación en Spider, que es en inglés.
- No se documentan capacidades especiales (modo thinking, visión o audio). El artefacto es exclusivamente text-to-SQL.
- Operaciones de conjuntos (UNION/INTERSECT): capacidad no resuelta; se detalla en limitaciones.

## Casos de uso

- Asistente de consulta para bases de datos relacionales: el modelo traduce una pregunta en lenguaje natural a una consulta SQL ejecutable sobre un esquema conocido, lo que permite ofrecer interfaces de consulta a usuarios no técnicos. Su utilidad depende de que el esquema se proporcione en el contexto, ya que no hay evidencia de que el adaptador memorice esquemas arbitrarios.
- Generación de borradores SQL para analistas de datos: se puede integrar en una herramienta interna que proponga una primera versión de la consulta, que el analista revisa y corrige antes de ejecutarla. La coincidencia exacta del 43,5 % indica que el borrador requiere revisión en más de la mitad de los casos.
- Investigación en text-to-SQL: sirve como línea base reproducible para comparar variantes de LoRA (rango, alpha, aumentación de datos) sobre Spider, dado que el autor documenta la metodología de evaluación con semilla fija y subconjunto fijo de 200 ejemplos.
- Componente de un pipeline de autoformación o benchmarking: al ser un adaptador pequeño (0,1 GB), se puede cargar y descargar rápidamente para experimentos de evaluación sin comprometer almacenamiento.
- Punto de partida para fine-tuning adicional: el adaptador se puede seguir ajustando sobre esquemas y dialectos SQL específicos de una organización, reutilizando el conocimiento ya adquirido sobre Spider.
- Generación de consultas en cuadros de mando de business intelligence: como paso previo a un motor SQL, el modelo puede producir la consulta a partir de una pregunta del usuario, siempre que exista una capa de validación sintáctica y de permisos antes de ejecutarla.
- Aumentación de datos sintéticos: el adaptador puede usarse para generar candidatos de consultas SQL que después se filtren por ejecución, alimentando un conjunto de entrenamiento mayor.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a un subconjunto de 200 ejemplos de validación de Spider (semilla 42), idéntico entre las fases 0, 1 y 2. No se aportan resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos generales.

| Metrica | Variante (a) (este repositorio) | Variante (b) | Margen / nota |
|---|---|---|---|
| Exactitud de ejecución | 72,5 % | 73,0 % | Diferencia de 0,5 puntos, dentro del margen de ±6,4 puntos para n=200 |
| Coincidencia exacta | 43,5 % | no disponible | no disponible |
| Tamano de la muestra | 200 ejemplos de validación de Spider, semilla 42 | 200 ejemplos, misma muestra | no disponible |

Según la model card, la variante (a) corrige 3 de los 4 patrones difíciles identificados en la fase 1 (joins alucinados, self-joins y NOT-IN/exclusión de conjuntos), mientras que la variante (b) solo corrige 2 y regresa en el patrón NOT-IN. No se publican resultados de la variante (c) ni cifras de las fases 0 y 1.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB con el modelo base en 4 bits, y aproximadamente 6-7 GB en bf16/fp16. Son estimaciones a partir del tamaño de 3.000 millones de parámetros del modelo base; no se aportan cifras oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más puede ejecutar el modelo base cuantizado; una RTX 3060 de 12 GB, una RTX 4060 o una RTX 4090 son suficientes. Para servicio con lotes grandes se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con al menos 6-8 GB de VRAM si se usa cuantización de 4 bits.
- Opciones de despliegue: al ser un adaptador LoRA, requiere cargarse junto al modelo base mediante PEFT y transformers, o fusionarse con el modelo base y exportarse después a GGUF para llama.cpp u Ollama. vLLM y TGI admiten carga de adaptadores LoRA, aunque la compatibilidad concreta con este artefacto no está documentada. También se puede servir con el stack de Unsloth.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores text-to-SQL comparables fuera de las variantes del propio proyecto. La comparación factible se limita a las tres variantes de hiperparámetros descritas en la model card y al modelo base.

| Modelo | Parametros | Contexto | Exactitud de ejecucion (Spider, n=200) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (variante a, r=16/alpha=32) | 3.000 M (base) + adaptador | no disponible | 72,5 % | no disponible | HuggingFace |
| Variante (b) (r=32/alpha=64) | 3.000 M (base) + adaptador | no disponible | 73,0 % | no disponible | no disponible (mencionada en la model card, no se enlaza) |
| Variante (c) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelo base Qwen2.5-Coder-3B-Instruct-bnb-4bit | 3.000 M | no disponible en esta ficha | no disponible | no disponible en esta ficha | HuggingFace |

## Limitaciones y advertencias

- Las operaciones de conjuntos (UNION/INTERSECT) no están resueltas: el modelo genera correctamente la estructura de la operación de conjuntos pero rompe de forma fiable la lógica de la segunda rama. El autor lo marca como el único patrón de fallo abierto de la fase 2 y lo traslada a la fase 3.
- Confusión posible entre las tablas model_list y car_names en preguntas sobre coches o modelos. El autor la señala como confirmada en la variante (b) y como riesgo probable, no verificado, en la variante (a).
- Riesgo de alucinación de esquema: la model card describe casos en los que el modelo produce referencias a columnas inexistentes (por ejemplo T3.pet_type en lugar de T3.pettype). Este tipo de error falla en la ejecución en lugar de devolver filas incorrectas, pero invalida la consulta.
- La coincidencia exacta es del 43,5 %, lo que implica que más de la mitad de las consultas no coinciden literalmente con la referencia, aunque puedan ser ejecutablemente correctas.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo.
- Limitaciones de idioma: no disponible. La evaluación se realiza sobre Spider, que está en inglés, y no se documentan capacidades en castellano ni en otros idiomas.
- Longitud de contexto: heredada del modelo base, no especificada en la información disponible; no se ha validado el comportamiento con esquemas muy extensos.
- Licencia: no disponible. Al no especificarse, no se puede confirmar si el uso comercial está permitido. Como referencia, el modelo base Qwen2.5-Coder se publica habitualmente bajo Apache 2.0, pero no se confirma aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- La cifra de exactitud de ejecución se calcula sobre 200 ejemplos, con un margen aproximado de ±6,4 puntos, por lo que las diferencias de pocas décimas entre variantes no son concluyentes.
- La fecha de creación registrada (2026-09-27) es posterior a la fecha habitual de consulta; se reproduce tal cual aparece en la información.
- La model card contiene un fragmento de plantilla sin rellenar («Sampled review of {N} additional (b) failures...»), lo que indica que parte de la documentación de fallos está incompleta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JaveedHabeeb/text-to-sql-qwen2.5-coder-3b-phase2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Conjunto de datos Spider (referenciado en el entrenamiento): no se proporciona enlace en la información disponible
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
