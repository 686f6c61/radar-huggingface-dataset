# exorticlabs/tenor

## Resumen

Tenor es una arquitectura de memoria espaciotemporal de cuatro niveles desarrollada por Exortic Lab, distribuida en Hugging Face bajo el identificador `exorticlabs/tenor`. No es un modelo de lenguaje en el sentido convencional: se trata de un sustrato de memoria para agentes autónomos que implementa un grafo de conocimiento episódico-entidad (4D-EEKG) con plasticidad asociativa firmada, manifold taxonómico continuo y orquestación de memoria de trabajo volátil. El repositorio tiene 0 GB de tamaño, lo que sugiere que los pesos no están publicados en el Hub y que la librería `tenor-engine` se distribuye por otros canales.

El problema que aborda es la amnesia de los agentes en producción: los autores argumentan que el almacenamiento de buffers de contexto de 1M de tokens consume más de 130 GB de VRAM por sesión en modelos de 70B, que la similitud semántica vectorial no distingue verdad de parecido superficial y que los embeddings carecen de noción temporal. Tenor propone sustituir el "prompt stuffing" por un sustrato espaciotemporal continuo con intervalos temporales inmutables, atribución de hablante y difusión Personalised PageRank modulada por entropía espectral.

Es relevante ahora porque ataca un cuello de botella real de los sistemas agénticos de largo horizonte (coste de contexto, mutación de estado y olvido selectivo), pero conviene subrayar que la información pública disponible es exclusivamente la model card del autor: no hay pesos, benchmarks ni paper revisado por pares accesibles en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 4D-EEKG (Episodic-Entity Knowledge Graph) de cuatro niveles: conocimiento de entidades con slots, motor tensorial espaciotemporal, manifold taxonómico continuo y memoria de trabajo ejecutiva |
| Parametros totales | no disponible (no es un transformer con parámetros publicados; el repositorio ocupa 0.0 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como ventana de transformer; el empaquetador de contexto ensambla prompts en un presupuesto inferior a 350 tokens (50% hechos directos de entidad, 30% asociaciones topológicas, 20% re-*[texto truncado en la fuente]*) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `tenor-engine`, Python 3.10+) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro niveles. El Tier 1 almacena conocimiento declarativo por entidad con intervalos `TimeSlice` inmutables `[t_start, t_end]`, lo que garantiza invariancia matemática ante actualizaciones y auditoría completa del estado histórico; soporta dos vías de actualización (ramificación versionada no destructiva y sobrescritura verificada in-place) y resolución de entidades de doble factor (fronteras léxicas y representaciones densas unitarias de 896 dimensiones). El Tier 2 es un motor tensorial espaciotemporal con plasticidad hebbiana firmada en el rango `[-1.0, 1.0]`, saturación asimétrica decreciente (acelerada hacia `-1.0` en invalidaciones), aislamiento por atribución de hablante para evitar contaminación de opiniones entre agentes y usuarios, frecuencia inversa de hub (IHF) para amortiguar la explosión de grado, y difusión Personalised PageRank modulada por la entropía de Shannon espectral de las semillas de consulta.

El Tier 3 es un manifold taxonómico continuo en `R^896` con activación `tanh`, anclas bipolares adaptativas actualizadas por media móvil exponencial (EMA) y descubrimiento autónomo de ejes mediante iteración de potencia sobre residuos ortogonales. El Tier 4 es memoria de trabajo volátil con DAG de tareas, telemetría de ejecución de herramientas que retroalimenta fallos hacia la memoria de largo plazo para invalidación retroactiva, y cuotas deterministas de empaquetado de contexto. No se documentan en la información disponible datos de entrenamiento (número de tokens, composición del corpus), ni etapas de RLHF o DPO; el sistema parece operar en inferencia/actualización online más que como un modelo preentrenado clásico.

## Capacidades

- Extracción de características (`feature-extraction`) y representaciones densas de 896 dimensiones para entidades y consultas.
- Memoria episódica persistente con intervalos temporales auditables y versionado histórico no destructivo.
- Razonamiento sobre mutaciones de estado: distingue hechos vigentes de hechos obsoletos mediante invalidación con plasticidad hebbiana negativa.
- Difusión de activación adaptativa: consultas factuales concentradas ejecutan retención local; consultas exploratorias difusas disparan difusión topológica multi-salto.
- Atribución de hablante para separar el conocimiento del agente del conocimiento del usuario.
- Clasificación taxonómica continua (sin etiquetas enum rígidas) con descubrimiento de ejes conceptuales emergentes.
- Orquestación de tareas mediante DAG con barreras de ejecución y flags de progreso.
- Telemetría de herramientas con invalidación retroactiva de memoria ante fallos de ejecución.
- Capacidades multilingües: solo inglés declarado.
- No se documentan tool calling, function calling, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Agentes de atención al cliente de largo horizonte: el Tier 1 conserva el historial de atributos del cliente con intervalos temporales, de modo que una migración de plan o de proveedor invalida el dato anterior en lugar de devolverlo por similitud semántica.
- Asistentes de soporte técnico con estado mutable: cuando un usuario cambia de base de datos o de configuración, la invalidación hebbiana negativa suprime las recomendaciones obsoletas y evita respuestas contradictorias.
- Agentes autónomos multi-paso con DAG de tareas: el Tier 4 coordina subtareas jerárquicas, barreras de ejecución y flags de progreso, y enlaza fallos de herramientas con la memoria de largo plazo para no repetir acciones fallidas.
- Sistemas multi-agente con separación de opiniones: la atribución de hablante impide que las afirmaciones de un agente contaminen el grafo asociativo de otro, útil en pipelines de revisión o debate entre agentes.
- Reducción de coste de contexto en producción: el empaquetador determinista mantiene el prompt por debajo de 350 tokens en lugar de reinyectar transcripciones completas, lo que rebaja el consumo de VRAM y la latencia por turno.
- Memoria de investigación y análisis documental: el manifold taxonómico continuo permite clasificar documentos sin esquemas cerrados y descubrir ejes conceptuales emergentes a partir de residuos ortogonales.
- Auditoría y cumplimiento: los intervalos `[t_start, t_end]` permiten reconstruir qué sabía el sistema en una fecha concreta, adecuado para trazabilidad regulatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos (0.0 GB) y la arquitectura se describe como sustrato de memoria, no como modelo generativo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card referencia la librería `tenor-engine` con Python 3.10+; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato de coste es el presupuesto de contexto inferior a 350 tokens por ensamblado.

## Comparativa con modelos similares

| Sistema | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tenor (exorticlabs) | Memoria espaciotemporal 4D-EEKG para agentes | Presupuesto de prompt < 350 tokens | MIT | Repositorio HF sin pesos (0.0 GB) |
| Mem0 | Capa de memoria para agentes sobre almacenes vectoriales y de grafos | Depende del backend | Apache 2.0 (según su repositorio público) | Código y servicio disponibles |
| Zep / Graphiti | Memoria temporal con grafo de conocimiento | Depende del backend | Apache 2.0 (según su repositorio público) | Código disponible |
| RAG vectorial con top-k | Recuperación por similitud semántica | Limitado por el índice | Variable | Ampliamente disponible |

No se dispone de datos comparativos de rendimiento entre Tenor y estas alternativas en la información proporcionada; la comparación anterior es categórica, no benchmark.

## Limitaciones y advertencias

- Ausencia de pesos y de artefactos en el Hub: el repositorio ocupa 0.0 GB, por lo que no es posible verificar el comportamiento del sistema a partir de los datos publicados.
- Sin benchmarks ni evaluación independiente: todas las afirmaciones de la model card proceden del autor y no están contrastadas en la información disponible.
- Idioma: solo inglés declarado, lo que limita su uso en castellano sin trabajo adicional.
- Sesgos: no documentados; al construir asociaciones a partir de co-ocurrencia, el grafo puede amplificar patrones presentes en los datos de interacción.
- Riesgo de alucinación: el sistema mitiga la recuperación de hechos obsoletos, pero no elimina la posibilidad de asociaciones espurias en la difusión multi-salto.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las dependencias de `tenor-engine` y los artefactos auxiliares antes de producción.
- Madurez: creado y actualizado el 2026-11-04 con 0 descargas y 0 likes; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La model card está truncada en la información disponible (el Tier 4 queda incompleto), por lo que pueden faltar detalles de implementación.

## Enlaces

- Hugging Face: https://huggingface.co/exorticlabs/tenor
- Sitio del laboratorio: https://exortic.com
- Informe científico (referenciado en la model card): docs/RESEARCH_PAPER.md
- Manuscrito Word (referenciado en la model card): docs/research_paper_4d_eekg_memory_architecture.docx
- Fichero de proyecto (referenciado en la model card): pyproject.toml
- Licencia (referenciada en la model card): LICENSE
