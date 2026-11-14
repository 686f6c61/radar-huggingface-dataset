# Namish18/dbmedic-model-artifacts

## Resumen

DBMedic es un proyecto de agente diagnostico autonomo para PostgreSQL construido sobre el modelo base CohereLabs/tiny-aya-global, un transformer decoder-only de la familia cohere2 con aproximadamente 3.350 millones de parametros y capacidades multilingues. El proposito declarado es servir como asistente de diagnostico de solo lectura para administradores de bases de datos e ingenieros de fiabilidad, inspeccionando planes de ejecucion, estadisticas de catalogo e indices para identificar causas raiz de consultas lentas y proponer remediaciones sujetas a aprobacion humana.

Es relevante advertir que el repositorio no contiene ningun checkpoint entrenado. Segun la propia model card, la fase de destilacion LoRA/SFT no se ejecuto por falta de GPU CUDA dedicada y de token de acceso a repositorios restringidos. Lo publicado son artefactos de integracion: contratos de prompt, interfaces de herramientas, funciones de recompensa, pipelines de curacion de datos y especificaciones de entrenamiento, todo verificado mediante tests unitarios y ejecuciones en seco, pero sin pesos modificados.

En la practica, el modelo distribuido es el tiny-aya-global original sin ajuste. Cualquier evaluacion de capacidades debe hacerse contra ese modelo base, no contra un supuesto DBMedic afinado, que no existe a fecha de publicacion del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia cohere2 |
| Parametros totales | ~3.350 millones (modelo base tiny-aya-global) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no distribuye pesos afinados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia cohere2, segun declara el autor, con aproximadamente 3.350 millones de parametros. El modelo base es CohereLabs/tiny-aya-global, multilingue, sobre el que se plantea el ajuste. No se documentan en la informacion disponible el numero de tokens de preentrenamiento del modelo base ni la composicion de su dataset.

El pipeline de ajuste previsto, aunque no ejecutado, esta especificado en detalle: destilacion LoRA SFT mediante AgentTune 1.1.4 con trl 1.7.1 y peft, con r=16, lora_alpha=32, lora_dropout=0.05, modulos objetivo all-linear excluyendo lm_head, bias none, learning rate 2e-4 con scheduler coseno, batch de 2 por dispositivo con 4 pasos de acumulacion, perdida nll con enmascaramiento de etiquetas solo en completions (-100) y max_seq_length de 2048. Se indica un requisito de al menos 8 GB de VRAM para la destilacion LoRA y de 12 GB para rollouts GRPO. No se realizo RLHF ni DPO. No hay innovaciones de decodificacion especulativa ni atencion lineal documentadas.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base tiny-aya-global.
- Capacidad multilingue segun el modelo base (etiquetas en y multilingual).
- Soporte de tool calling mediante un protocolo estricto de turnos alternos con tokens especiales del tokenizer de Tiny Aya.
- Orquestacion de agentes tipo ReAct con ocho herramientas de diagnostico de solo lectura sobre PostgreSQL.
- Inspeccion de planes de ejecucion mediante EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) para detectar sequential scans, fallos de cache, nested loops y operadores de alto coste.
- Consulta de heuristicas de tablas e indices sobre pg_stat_user_tables, pg_stat_user_indexes y pg_class.
- Salida diagnostica estructurada en JSON validado con causa raiz, evidencia, puntuacion de confianza y recomendacion de remediacion.
- Aplicacion de fronteras de seguridad que clasifican cualquier SQL de mutacion como pendiente de aprobacion humana explicita.
- No incluye vision, audio ni modo thinking documentados.

## Casos de uso

- Diagnostico de consultas lentas en produccion: el agente recibe una consulta candidata, invoca explain_query y get_table_statistics, y devuelve un JSON con la causa raiz y evidencia. Adecuado porque las herramientas son de solo lectura y el flujo esta acotado a PostgreSQL 15+.
- Recomendacion de indices: usando get_index_statistics, check_index_exists y get_table_indexes, el agente detecta indices ausentes o infrautilizados y propone CREATE INDEX CONCURRENTLY sujeto a revision humana.
- Analisis de bloqueos y consultas de larga duracion: get_running_queries sobre pg_stat_activity permite identificar sesiones bloqueantes y patrones de contencion.
- Monitorizacion de salud de cache y transacciones: get_database_stats aporta ratios de acierto de cache, tasas de commit y conteo de deadlocks para paneles de SRE.
- Revision de cambios de esquema en CI: integrado como paso previo al despliegue, el agente puede ejecutar el diagnostico sobre una base de staging y bloquear el pipeline si detecta regresiones de plan.
- Formacion y soporte a DBA: el agente explica planes de ejecucion y heuristicas de indices en lenguaje natural, util como asistente de aprendizaje en entornos controlados.
- Automatizacion de informes de rendimiento: la salida JSON validada facilita la ingesta en sistemas de observabilidad y la generacion de informes periodicos.

## Benchmarks y rendimiento

La model card reporta unicamente dos mediciones de ejecucion sobre PostgreSQL 17 en vivo, no benchmarks de capacidad del modelo:

| Evaluacion | Fichero | Procedencia | Resultado |
|---|---|---|---|
| Ejecucion baseline de consulta lenta | slow_query_baseline.json | PostgreSQL 17 en vivo | Mediana 24,21 ms (Seq Scan) |
| Ejecucion tras remediacion | slow_query_after_remediation.json | PostgreSQL 17 en vivo | Mediana 1,19 ms |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para destilacion LoRA SFT: al menos 8 GB segun la model card; al menos 12 GB para rollouts GRPO.
- GPU recomendadas: no se especifican modelos concretos; el autor solo exige una GPU NVIDIA CUDA dedicada.
- Inferencia del modelo base de ~3,35 mil millones de parametros: no se aportan estimaciones de VRAM en la informacion disponible.
- Encaje en GPU de consumo: no confirmado por el autor; por tamano del modelo base seria plausible en tarjetas de 8-16 GB con cuantizacion, pero no hay dato verificado.
- Opciones de despliegue: no se documentan frameworks (vLLM, llama.cpp, Ollama, TGI) en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| DBMedic (Namish18) | ~3,35 B (base) | no disponible | Agente de diagnostico PostgreSQL | apache-2.0 | Sin checkpoint afinado |
| CohereLabs/tiny-aya-global | ~3,35 B | no disponible | LLM multilingue general | no disponible en la informacion | Modelo base publicado |
| Alternativas de agente SQL de codigo abierto | no disponible | no disponible | Diagnostico de bases de datos | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No existe checkpoint afinado: los pesos distribuidos son los del modelo base tiny-aya-global sin modificacion, por lo que las capacidades especificas de DBMedic no estan demostradas en pesos.
- La fase de entrenamiento LoRA/SFT no se ejecuto por falta de GPU CUDA y de token de acceso; los resultados de evaluacion son de ejecucion SQL, no de calidad del modelo.
- Alcance restringido a PostgreSQL 15+; el uso contra MySQL, Oracle o SQL Server provoca fallos en tiempo de ejecucion de las herramientas.
- Riesgo de alucinacion en recomendaciones de indices y causas raiz, agravado por la ausencia de ajuste supervisado.
- Sesgos del modelo base no documentados en la informacion disponible.
- Restricciones de uso: prohibido ejecutar DDL o consultas de modificacion de forma autonoma; toda mutacion requiere revision humana.
- No apto para sistemas de produccion criticos sin supervision de operador.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de pesos afinados limita la utilidad practica del artefacto.
- El repositorio tiene cero descargas y cero likes, sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Namish18/dbmedic-model-artifacts
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
