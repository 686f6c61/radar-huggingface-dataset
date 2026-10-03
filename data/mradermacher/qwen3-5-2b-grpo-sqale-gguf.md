# mradermacher/qwen3.5-2b-grpo-sqale-GGUF

## Resumen

Este repositorio contiene la version cuantizada en formato GGUF del modelo trl-lab/qwen3.5-2b-grpo-sqale, realizada por mradermacher, un autor conocido por publicar conversiones GGUF de modelos populares para su uso con llama.cpp y derivados. Se trata de un ajuste fino de Qwen3.5 de aproximadamente 1,94 mil millones de parametros, especializado en la tarea de text-to-SQL: convertir instrucciones en lenguaje natural a consultas SQL validas, en este caso orientadas a SQLite. El entrenamiento se ha realizado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, sobre los conjuntos de datos SQaLe-2 de trl-lab.

El modelo resuelve el problema de generar consultas SQL correctas a partir de descripciones en ingles, con enfasis en el uso de herramientas y flujos de agente. Por su tamano reducido, es adecuado para despliegue local en hardware modesto, incluso en CPU, lo que lo hace atractivo para aplicaciones de analitica embebida o asistentes de bases de datos privados. Su licencia Apache 2.0 y su naturaleza conversacional refuerzan su utilidad en entornos de produccion con requisitos de privacidad.

La relevancia actual de esta ficha radica en que combina tres tendencias: modelos pequenos especializados, entrenamiento con RL (GRPO) y distribucion en GGUF para inferencia local. No se han publicado detalles sobre arquitectura interna, longitud de contexto ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B; no se detalla en la informacion) |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

El modelo base, trl-lab/qwen3.5-2b-grpo-sqale, es un ajuste fino de Qwen3.5-2B entrenado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que optimiza las respuestas en funcion de recompensas relativas dentro de un grupo de muestras generadas. Este enfoque se ha utilizado sobre los datasets SQaLe-2 de trl-lab, especificamente trl-lab/SQaLe-2-text-to-SQL-Queries y trl-lab/SQaLe-2-text-to-SQL-Schemas, orientados a la generacion de consultas SQL y al manejo de esquemas de bases de datos. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO.

La version aqui descrita es una conversion estatica a GGUF realizada por mradermacher mediante llama.cpp. El repositorio incluye ficheros mmproj (multi-modal supplement), lo que sugiere que el modelo base conserva capacidades multimodales de la familia Qwen3.5; no obstante, no se confirma en la model card proporcionada el alcance real de dicha capacidad ni su integracion con la tarea text-to-SQL. No hay innovaciones tecnicas adicionales documentadas (por ejemplo, decodificacion especulativa o atencion lineal) en la informacion disponible.

## Capacidades

- Generacion de consultas SQL (text-to-SQL) orientadas a SQLite a partir de instrucciones en lenguaje natural en ingles.
- Manejo de esquemas de bases de datos, ya que el entrenamiento incluye un dataset especifico de schemas.
- Soporte de tool use / function calling, segun las etiquetas del modelo (tool-use, agent).
- Capacidad conversacional multi-turno, indicada por la etiqueta conversational.
- Aplicable a flujos de agente (agent) para tareas de consulta y manipulacion de bases de datos.
- Ajuste mediante aprendizaje por refuerzo (GRPO) para mejorar la calidad de las respuestas generadas.
- Soporte multimodal potencial derivado de los ficheros mmproj incluidos, no confirmado en la documentacion.
- Idioma soportado: unicamente ingles (en).

## Casos de uso

- Asistentes de analitica de datos embebidos: el modelo puede traducir preguntas de negocio en ingles a consultas SQL ejecutables sobre SQLite, integrándose en paneles internos o herramientas de BI ligeras.
- Automatizacion de consultas en aplicaciones de escritorio o moviles: gracias a sus cuantizaciones de 1-2 GB, puede desplegarse en local junto a una base de datos SQLite sin depender de servicios en la nube.
- Agentes de bases de datos: combinado con tool calling, el modelo puede formar parte de un agente que inspecciona esquemas, genera consultas y valida resultados en varios pasos.
- Generacion de SQL en pipelines de datos: uso como paso previo a la ejecucion de consultas en procesos ETL, con revision posterior para mitigar alucinaciones.
- Prototipado rapido de interfaces conversacionales sobre bases de datos: permite construir demos de chat que responden preguntas sobre un esquema SQLite existente.
- Educacion y formacion en SQL: el modelo puede explicar la traduccion de lenguaje natural a SQL, sirviendo de apoyo en entornos de aprendizaje.
- Analitica con privacidad de datos: al ejecutarse en local, evita enviar esquemas o datos sensibles a APIs externas, un requisito habitual en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion especifica de text-to-SQL (por ejemplo, exactitud de ejecucion o coincidencia de consultas).

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto):
  - f16: ~4,0 GB.
  - Q8_0: ~2,2 GB.
  - Q6_K: ~1,7 GB.
  - Q5_K_M: ~1,6 GB.
  - Q5_K_S: ~1,5 GB.
  - Q4_K_M: ~1,4 GB (recomendado por el autor).
  - Q4_K_S: ~1,3 GB (recomendado por el autor).
  - IQ4_XS: ~1,3 GB.
  - Q3_K_L: ~1,3 GB.
  - Q3_K_M: ~1,2 GB.
  - Q3_K_S: ~1,1 GB.
  - Q2_K: ~1,1 GB.
  - Ficheros mmproj: ~0,5 GB (Q8_0) y ~0,8 GB (f16).
- GPU recomendadas: cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4090 e incluso en iGPU con memoria compartida. No requiere GPUs de datacenter como A100 o H100.
- Cabe en cualquier GPU consumer con 4 GB o mas de VRAM; tambien es viable en CPU pura, dado el reducido tamano.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, LocalAI, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio es compatible con endpoints (etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/qwen3.5-2b-grpo-sqale-GGUF | ~1,94B | no disponible | GGUF | apache-2.0 | Version cuantizada para inferencia local |
| trl-lab/qwen3.5-2b-grpo-sqale | ~1,94B | no disponible | safetensors | apache-2.0 | Modelo base sin cuantizar |
| Alternativas de text-to-SQL de tamano similar | no disponible | no disponible | no disponible | no disponible | No se identifican en la informacion proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables identificados en la informacion suministrada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Riesgo de alucinacion en la generacion de SQL: el modelo puede producir consultas sintacticamente validas pero semanticamente incorrectas, por lo que se recomienda validacion y ejecucion controlada antes de usar los resultados.
- Idioma: solo se declara soporte para ingles, lo que limita su uso directo con instrucciones en castellano u otros idiomas.
- Longitud de contexto desconocida: no se especifica en la informacion disponible, lo que dificulta planificar su uso con esquemas de bases de datos extensos.
- Falta de benchmarks: no hay evidencia publicada de rendimiento, lo que complica la comparacion objetiva con alternativas.
- Capacidad multimodal no confirmada: aunque se incluyen ficheros mmproj, no se detalla su funcionamiento ni su utilidad para la tarea text-to-SQL.
- Sesgos: no documentados en la informacion proporcionada; al ser un ajuste sobre datos especificos de SQL, podria presentar sesgos derivados de la distribucion de dichos datasets.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial, modificacion y redistribucion, sujeto a las condiciones de dicha licencia.
- Caveat de produccion: al tratarse de una cuantizacion estatica (no imatrix ni weighted), puede haber una perdida de calidad mayor que en cuantizaciones ponderadas, especialmente en los formatos de menor tamano como Q2_K o Q3_K_S.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/qwen3.5-2b-grpo-sqale-GGUF
- Modelo base en HuggingFace: https://huggingface.co/trl-lab/qwen3.5-2b-grpo-sqale
- Dataset SQaLe-2 text-to-SQL Queries: https://huggingface.co/datasets/trl-lab/SQaLe-2-text-to-SQL-Queries
- Dataset SQaLe-2 text-to-SQL Schemas: https://huggingface.co/datasets/trl-lab/SQaLe-2-text-to-SQL-Schemas
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#qwen3.5-2b-grpo-sqale-GGUF
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH (patrocinador del autor): https://www.nethype.de/
