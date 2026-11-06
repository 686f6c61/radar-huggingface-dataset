# Lawless1987/threefold-memory

## Resumen

Threefold Memory es un repositorio de datos y no un modelo de lenguaje: aloja la memoria persistente de un sistema de agentes denominado Threefold, desarrollado por el autor Lawless1987. El repositorio contiene ficheros Markdown con memorias de tareas escritas por el agente, instantáneas completas del denominado Jacobian-lens y un libro mayor de escrituras encadenado por hash (`audit.jsonl`), además de un directorio `.trash/` para memorias marcadas como eliminadas de forma no silenciosa. El código del sistema reside en un repositorio separado (threefold) y este repositorio actúa únicamente como raíz de datos, configurable mediante la variable de entorno `AI_MEMORY_ROOT`.

La relevancia del proyecto es acotada pero específica: propone un esquema de trazabilidad y procedencia para la memoria de agentes de IA, con registro de auditoría inmutable y eliminación no destructiva. No incluye pesos de red neuronal, tokenizador ni pipeline de inferencia. Cualquier evaluación como modelo de lenguaje carece de sentido con la información disponible; la ficha se limita a documentar el artefacto tal como está publicado.

No se dispone de información sobre arquitectura de modelo, tamaño de parámetros, contexto, datos de entrenamiento ni resultados de benchmarks, porque el repositorio no contiene un modelo entrenado. Los datos de la model card son la única fuente y describen un sistema de almacenamiento y auditoría, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de datos, no modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (contenido en Markdown y JSONL: `task-<task_id>.md`, `jlens-<task_id>.md`, `audit.jsonl`, `.trash/`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay red neuronal, corpus de entrenamiento ni proceso de ajuste (RLHF, DPO u otros). La "arquitectura" del artefacto es un esquema de almacenamiento con tres componentes: memorias de tarea en Markdown (`task-<task_id>.md`), instantáneas del Jacobian-lens (`jlens-<task_id>.md`, con `type:jlens` en el cuerpo o la descripción) y un libro mayor de escrituras encadenado por hash en `audit.jsonl`, generado por el subsistema `ai_memory_system` del proyecto covenant. Las escrituras se realizan mediante el script `put_covenant_memory.sh`, que hace commit y push al repositorio remoto configurado tras cada operación de escritura.

El mecanismo de borrado es no destructivo: las memorias retiradas se mueven a `.trash/` en lugar de eliminarse, lo que preserva la trazabilidad. El sistema se presenta como parte de un conjunto de repositorios independientes pero componibles: covenant (núcleo multiagente con puerta ética en la ruta transaccional), threefold (capa de observabilidad L-lens sobre Jacobian Lens), contradiction-probe y flinch-observability (instrumentos de medición de comportamiento), spiking-experiments (investigación neuromórfica) y Sentinel-Witness (panel de contabilidad). No se documentan números de tokens, composición de dataset ni innovaciones de decodificación.

## Capacidades

- Almacenamiento persistente de memorias de agente con identidad de tarea (`task_id`) y registro de decisiones.
- Captura de instantáneas de observabilidad (Jacobian-lens) asociadas a cada tarea.
- Auditoría mediante libro mayor encadenado por hash (`audit.jsonl`), que permite verificar el orden e integridad de las escrituras.
- Borrado no silencioso: las memorias retiradas quedan en `.trash/` en lugar de desaparecer.
- Integración con Git: las escrituras se confirman y publican en el remoto configurado.
- Configuración mediante la variable de entorno `AI_MEMORY_ROOT`.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades multilingües ni modo de pensamiento, al no contener un modelo.

## Casos de uso

- Auditoría de decisiones de agentes: el libro mayor `audit.jsonl` permite reconstruir qué se escribió, en qué orden y bajo qué tarea, lo que resulta útil en sistemas multiagente donde se exige trazabilidad de decisiones.
- Reproducibilidad de sesiones de agente: conservar `task-<task_id>.md` junto con `jlens-<task_id>.md` permite revisar posteriormente el contexto y la instantánea de observabilidad de una ejecución concreta.
- Cumplimiento y revisión interna: el borrado no destructivo en `.trash/` facilita demostrar que una memoria se retiró de forma controlada y no por pérdida accidental.
- Investigación sobre procedencia en sistemas de IA: el esquema sirve como referencia para diseñar memorias de agente con registro inmutable en proyectos propios.
- Integración en pipelines de agentes basados en Git: el script `put_covenant_memory.sh` permite versionar la memoria del agente en el mismo flujo de control de versiones que el código.
- Separación de código y datos: apuntar `AI_MEMORY_ROOT` a este repositorio permite mantener el código en threefold y los datos de memoria en un almacén independiente, con permisos y ciclos de vida distintos.
- Base para experimentos de observabilidad: combinado con threefold y flinch-observability, el repositorio actúa como almacén de registros de sesión para pruebas puntuadas a ciegas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- No requiere GPU: es un repositorio de ficheros de texto (Markdown y JSONL).
- Almacenamiento: el tamaño depende del volumen de memorias e instantáneas; no se publica una cifra.
- Despliegue: clonado Git convencional y configuración de `AI_MEMORY_ROOT`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del sistema de ficheros y del remoto Git configurado.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada alternativas comparables de esquemas de memoria de agente con auditoría encadenada por hash publicadas como repositorios de datos; la comparación con modelos de lenguaje no procede porque este artefacto no es un modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede evaluarse con benchmarks de NLP.
- El repositorio registra 0 descargas y 0 likes, y no consta pipeline asociado; no hay evidencia de uso o validación externa.
- La calidad del esquema de auditoría depende de la implementación en el repositorio threefold, que no se incluye aquí y no ha sido verificada en esta ficha.
- La licencia Apache 2.0 permite uso comercial del contenido del repositorio, pero no se documentan garantías sobre la exactitud o integridad de las memorias almacenadas.
- Riesgo de exposición de datos: las memorias de agente pueden contener información sensible de las tareas; conviene revisar el contenido antes de publicar el repositorio en un remoto público.
- No se especifican idiomas soportados ni convenciones de codificación más allá de Markdown y JSONL.
- Las fechas de creación y actualización del repositorio (2026) no han podido contrastarse con fuentes independientes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lawless1987/threefold-memory
- Código del sistema: https://github.com/LAWLESS1987/threefold
- Núcleo gobernado (covenant): https://huggingface.co/Lawless1987/covenant
- Capa de observabilidad (threefold): https://huggingface.co/Lawless1987/threefold
- Sonda de contradicción: https://huggingface.co/Lawless1987/contradiction-probe
- Observabilidad de sesgo (flinch-observability): https://huggingface.co/Lawless1987/flinch-observability
- Registros de sesión (flinch-record): https://huggingface.co/Lawless1987/flinch-record
- Registros de sesión (grokflinch): https://huggingface.co/Lawless1987/grokflinch
- Experimentos neuromórficos: https://huggingface.co/Lawless1987/spiking-experiments
- Panel de contabilidad (Sentinel-Witness): https://huggingface.co/Lawless1987/Sentinel-Witness
