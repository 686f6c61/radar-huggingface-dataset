# Polydim-Einsof/Kimi-k1.5-LongContext-Einsof-LoRA

## Resumen

Kimi-k1.5-LongContext-Einsof-LoRA es un adaptador LoRA publicado por Polydim-Einsof (Ariel García Traba, EinsofOS) sobre el modelo base `moonshotai/Moonlight-16B-A3B`, un transformer de mezcla de expertos desarrollado por Moonshot AI. El adaptador se presenta como parte del proyecto POLYDIM-EINSOF y está orientado a lo que el autor denomina "razonamiento continuo" y "planificación geodésica de largo contexto", con un enfoque matemático explícito sobre variedades de Stiefel. La model card describe el entrenamiento sobre 1.736 teoremas axiomáticos de PostgreSQL 16, un corpus muy específico y de dominio cerrado.

El modelo base Moonlight-16B-A3B es un MoE de 16.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que lo sitúa en la gama de eficiencia computacional. Sin embargo, la información disponible sobre este adaptador concreto es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks publicados. La ficha refleja esa escasez de datos de forma explícita.

La relevancia de este adaptador es, a fecha de la información disponible, marginal para producción: se trata de un artefacto de investigación independiente, con una model card de carácter teórico-matemático y sin evidencia empírica publicada de rendimiento. Resulta útil como referencia para quienes exploren adaptaciones LoRA sobre MoE con objetivos de retención de contexto largo, pero no como componente listo para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (base: Moonlight-16B-A3B) |
| Parámetros totales | no disponible (adaptador LoRA; base de 16B totales) |
| Parámetros activos | no disponible (base: ~3B activos por token, según nomenclatura A3B) |
| Longitud de contexto | no disponible (el autor menciona cadenas de más de 50 teoremas, sin cifra de tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (adaptador LoRA; formato de fichero no especificado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `moonshotai/Moonlight-16B-A3B`, un transformer con mezcla de expertos (MoE) de 16.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, según la convención de nombres del modelo base. El LoRA se enmarca en el proyecto POLYDIM-EINSOF, que el autor describe como un motor de "geometría diferencial en variedades de Stiefel St(k,n)" con razonamiento continuo y trayectorias geodésicas de largo contexto.

Según la model card, el adaptador se entrena sobre 1.736 teoremas axiomáticos de PostgreSQL 16, con el objetivo de retener dependencias multi-hop en cadenas de más de 50 teoremas y de garantizar condiciones de tangencia en el espacio tangente de la variedad (X^T ξ + ξ^T X = 0). Se mencionan componentes técnicos como un acumulador compensado de Neumaier en FP64 con cota relativa ≤ 10^-15, retracción polar/QR de orden 3 y un mecanismo de intercambio de teselas vectoriales en memoria compartida (`PmtpShmBus`). No se especifican el número de tokens de entrenamiento, la composición del dataset más allá de los teoremas citados, ni si hubo RLHF o DPO. Tampoco se detalla el rango del LoRA, los módulos objetivo ni los hiperparámetros de entrenamiento.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Moonlight-16B-A3B, con el adaptador orientado a dominios matemáticos y de bases de datos (PostgreSQL 16).
- Razonamiento multi-hop sobre cadenas largas de teoremas, según la model card, con retención de dependencias en secuencias de más de 50 teoremas.
- Cálculo en espacio tangente y verificación de condiciones de tangencia sobre variedades de Stiefel, según la descripción del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; la model card lo enmarca en un "swarm soberano" sin detalles operativos.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Intercambio de teselas vectoriales en memoria compartida mediante `PmtpShmBus`, según la model card (requiere infraestructura propia del proyecto).

## Casos de uso

- Investigación en adaptaciones LoRA sobre arquitecturas MoE: el adaptador sirve como referencia para estudiar cómo un LoRA de dominio cerrado afecta a un MoE de 16B totales y ~3B activos, comparando comportamiento antes y después del ajuste.
- Experimentación con retención de contexto largo en cadenas de razonamiento: útil para reproducir o evaluar la afirmación del autor sobre dependencias multi-hop en cadenas de más de 50 pasos, siempre con validación empírica propia.
- Prototipado de asistentes para bases de datos PostgreSQL: el entrenamiento sobre teoremas de PostgreSQL 16 sugiere uso en tareas de consulta, validación o explicación de esquemas, aunque sin benchmarks publicados que lo respalden.
- Estudio de técnicas geométricas aplicadas a representaciones: el enfoque de variedades de Stiefel y transporte en espacio tangente puede interesar a quienes investiguen regularización geométrica en adaptadores.
- Docencia y divulgación sobre MoE y LoRA: como ejemplo de adaptador de nicho con model card de corte matemático, útil en materiales formativos sobre ajuste eficiente.
- Integración en pipelines de investigación con infraestructura propia: el uso del bus de memoria compartida `PmtpShmBus` implica acoplamiento con el ecosistema EinsofOS, por lo que encaja en entornos controlados de laboratorio más que en producción estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador. Para el modelo base Moonlight-16B-A3B, la VRAM depende de la cuantización y del número de expertos activos; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del base (16B totales, ~3B activos), cabría esperar viabilidad en GPU de 24 GB en cuantizaciones bajas, pero no hay datos que lo confirmen.
- ¿Cabe en consumer GPU?: no confirmado. Sin datos de cuantización ni de formato de pesos del adaptador, no puede afirmarse.
- Opciones de despliegue: no disponible. No se especifican vLLM, llama.cpp, Ollama ni TGI; el adaptador menciona infraestructura propia (`PmtpShmBus`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-k1.5-LongContext-Einsof-LoRA | LoRA sobre base de 16B totales (~3B activos) | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Adaptador de investigación, sin benchmarks |
| moonshotai/Moonlight-16B-A3B (base) | 16B totales, ~3B activos | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Modelo base sobre el que se aplica el LoRA |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información suficiente para una comparación rigurosa |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia empírica de mejora sobre el modelo base en ninguna tarea estándar.
- Model card de carácter teórico: predominan descripciones matemáticas y afirmaciones no verificadas; no se detallan hiperparámetros, dataset exacto ni metodología de evaluación.
- Corpus de entrenamiento muy restringido (1.736 teoremas de PostgreSQL 16): riesgo alto de sobreajuste y de degradación en tareas generales fuera de ese dominio.
- Idiomas no especificados: no puede garantizarse soporte multilingüe ni calidad en castellano.
- Cero descargas y cero likes en HuggingFace: sin validación por parte de la comunidad.
- Dependencia de infraestructura propietaria (`PmtpShmBus`, `PMTP_SHM_VECTOR_DIRECT_NO_MCP_1D`): dificulta el despliegue en stacks estándar.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Moonlight-16B-A3B antes de producción.
- Riesgo de alucinación: no evaluado; al ser un ajuste de dominio cerrado, la generalización fuera de él es incierta.
- Sesgos: no documentados.
- Fecha de creación (2026-11-01) y autoría independiente: sin revisión por pares ni respaldo institucional conocido.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Polydim-Einsof/Kimi-k1.5-LongContext-Einsof-LoRA
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Paper, blog, repositorio o demo del proyecto POLYDIM-EINSOF: no disponible en la información proporcionada.
