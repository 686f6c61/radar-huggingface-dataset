# euisuh/POISON-LLaMA-Suite

## Resumen

POISON-LLaMA-Suite es un conjunto de modelos derivados de la familia LLaMA, publicados en HuggingFace por Euisuh Jeong, investigador afiliado al Qatar Computing Research Institute (QCRI) de la Hamad Bin Khalifa University. La model card se limita a describirlo como "modelos LLaMA envenenados (poisoned) de varios tamanos y especializaciones", sin detallar arquitectura concreta, numero de parametros ni composicion del dataset. El repositorio ocupa 0,5 GB, lo que sugiere que contiene pesos de modelos relativamente pequenos o cuantizados, pero no se especifica cual.

El termino "poisoned" apunta a un artefacto de investigacion en seguridad de modelos: previsiblemente modelos con backdoors o datos envenenados introducidos deliberadamente para estudiar ataques de poisoning, deteccion de comportamientos maliciosos o evaluacion de robustez. No obstante, la model card no confirma esta interpretacion ni documenta el tipo de envenenamiento aplicado, por lo que cualquier uso debe partir de la maxima cautela.

La relevancia actual del artefacto es limitada por su falta de documentacion: cero descargas, cero likes y sin pipeline declarado. Su interes es fundamentalmente academico, como material de partida para investigacion en seguridad de LLM, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LLaMA (detalle no disponible; se asume transformer decoder-only) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna mas alla de indicar que son modelos "LLaMA", lo que implica una base transformer decoder-only de la familia Meta LLaMA, pero se desconoce la version concreta (LLaMA 1, 2, 3 u otra), el numero de parametros y si incorpora alguna modificacion estructural. El repositorio pesa 0,5 GB, dato compatible con uno o varios modelos de menos de mil millones de parametros en precision completa o con versiones cuantizadas, pero no se puede confirmar.

Tampoco se documenta el proceso de entrenamiento: ni volumen de tokens, ni composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. El unico elemento distintivo es la naturaleza "envenenada" declarada en el nombre, que sugiere la introduccion deliberada de datos o comportamientos maliciosos, presumiblemente con fines de investigacion en seguridad, aunque el autor no detalla el metodo, el objetivo del ataque ni las tecnicas de inyeccion empleadas.

## Capacidades

- Generacion de texto: capacidades base heredadas de LLaMA, sin detalles confirmados.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Advertencia: al tratarse de un modelo declarado como "envenenado", se desconoce si incorpora comportamientos maliciosos, backdoors o salidas manipuladas. No debe asumirse ninguna capacidad fiable sin auditoria previa.

## Casos de uso

- Investigacion en seguridad de LLM: emplear el modelo como muestra de estudio para analizar como se comporta un modelo con datos potencialmente envenenados y desarrollar tecnicas de deteccion de backdoors. Es el uso mas coherente con la naturaleza declarada del artefacto.
- Red-teaming y evaluacion de robustez: servir de entrada en baterias de pruebas que midan la resistencia de pipelines de filtrado y moderacion frente a modelos comprometidos.
- Estudio de ataques de poisoning: analizar la propagacion de sesgos o comportamientos inyectados y su persistencia tras tecnicas de fine-tuning o alineamiento correctivo.
- Benchmarking de herramientas de auditoria: validar detectores de backdoors, clasificadores de toxicidad o sistemas de evaluacion de seguridad comparando su respuesta ante un modelo supuestamente envenenado.
- Docencia y formacion: ilustrar en cursos de seguridad de IA como se estructura y distribuye un modelo potencialmente malicioso en un repositorio publico.
- Reproducibilidad academica: punto de partida para replicar o extender el trabajo del autor en QCRI, siempre que se contacte con el para obtener documentacion adicional.
- Advertencia general: no se recomienda su uso en atencion al cliente, generacion de codigo en produccion, asistentes desplegados ni ninguna aplicacion orientada a usuario final, dado el riesgo de comportamientos no auditados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa basada en el tamano del repositorio (0,5 GB), un modelo de ese orden en precision fp16 rondaria los 0,25-0,5 mil millones de parametros, lo que cabria en GPUs consumer con 4-8 GB de VRAM. Esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponible. Para un modelo de ese posible tamano bastaria una RTX 3060, RTX 4060 o superiores; para modelos mayores haria falta A100 o H100, pero se desconoce el caso.
- Compatibilidad con GPU consumer: probablemente si, si se confirma el tamano reducido, pero no verificado.
- Opciones de despliegue: no disponible. Al no conocerse el formato de pesos, no se puede afirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POISON-LLaMA-Suite | No disponible | No disponible | No disponible | MIT | HuggingFace (0 descargas) |
| LLaMA 2 (7B) | 7 000 M | 4096 | Benchmark publico disponible | Llama 2 Community License | Amplia |
| LLaMA 3 (8B) | 8 000 M | 8192 | Benchmark publico disponible | Llama 3 Community License | Amplia |
| Modelos pequenos tipo TinyLlama | 1 100 M | 2048 | Benchmark publico disponible | Apache 2.0 | Amplia |

La comparacion es solo orientativa: al desconocerse el tamano, el contexto y el rendimiento reales de POISON-LLaMA-Suite, no es posible establecer una comparacion tecnica rigurosa con alternativas. Los modelos citados se incluyen unicamente como referencia de la familia LLaMA.

## Limitaciones y advertencias

- Naturaleza "envenenada" declarada: el propio nombre indica manipulacion deliberada; se desconoce si el modelo genera contenido malicioso, sesgado o con backdoors activables.
- Sesgos conocidos: no documentados. Al ser un modelo presumiblemente envenenado, cabe esperar sesgos intencionados, pero no hay confirmacion.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni card detallada no puede descartarse un riesgo alto.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, pero esta permisividad no protege frente a los riesgos tecnicos del modelo.
- Riesgo de seguridad: no desplegar en produccion, en sistemas con acceso a herramientas, en agentes autonomos ni en entornos con datos sensibles sin una auditoria exhaustiva previa.
- Falta de trazabilidad: sin informacion sobre version de LLaMA base, dataset ni proceso de entrenamiento, la reproducibilidad es practicamente nula.
- Adopcion nula: cero descargas y cero likes; no existe validacion por parte de la comunidad.
- Consideraciones eticas y legales: el uso de modelos envenenados debe limitarse a entornos de investigacion controlados; su distribucion o despliegue no autorizado puede contravenir politicas de seguridad y normativa aplicable.

## Enlaces

- HuggingFace: https://huggingface.co/euisuh/POISON-LLaMA-Suite
- Repositorio alternativo indicado en la model card: https://huggingface.co/models/euisuh/POISON-LLaMA-Suite
- Afiliacion del autor: Qatar Computing Research Institute (QCRI), Hamad Bin Khalifa University (sin enlace especifico en la informacion disponible).
- Paper, blog, repositorio de codigo o demo: no disponible.
