# hananour/EliteReplay-BIRD-4B

## Resumen

EliteReplay-BIRD-4B es un ajuste fino de Qwen/Qwen3.5-4B-Base especializado en text-to-SQL sobre SQLite, desarrollado por el usuario hananour y vinculado al repositorio de investigacion skai-research/EliteReplay. El modelo resuelve el problema de traducir preguntas en lenguaje natural, junto con un esquema de base de datos y evidencia opcional, a consultas SQL ejecutables sobre SQLite.

La innovacion principal no esta en la arquitectura, sino en el metodo de post-entrenamiento: EliteReplay combina aprendizaje por refuerzo (GRPO) con una fase de replay supervisado sobre un archivo de soluciones SQL verificadas y diversas, con un peso mu = 0.05, con el objetivo de preservar la diversidad de soluciones durante el entrenamiento. El entrenamiento se realizo sobre 5.000 preguntas del benchmark BIRD, de las cuales 1.000 se usaron para la busqueda en el archivo y la seleccion de 1.500 ejemplos SQL verificados para el replay.

El modelo tiene 4.539.265.536 parametros y un repositorio de 9,1 GB en safetensors, con licencia Apache 2.0 y soporte unicamente para ingles. Es relevante ahora como artefacto reproducible para investigacion en RL post-entrenamiento aplicado a text-to-SQL, aunque su adopcion practica esta limitada por la ausencia de resultados de evaluacion publicados en la informacion disponible y por su nula traccion en HuggingFace (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen/Qwen3.5-4B-Base; no se detallan numero de capas, tipo de atencion ni configuracion de cabezas |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-4B-Base (relacion: finetune) |
| Tarea | text-to-sql (SQLite) |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 9,1 GB |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B-Base, un transformer decoder-only de 4.539 millones de parametros. La model card no especifica detalles adicionales sobre el backbone (numero de capas, dimension oculta, mecanismo de atencion, uso de atencion lineal o hibrida, ni ventana de contexto), por lo que esos datos quedan como no disponibles. El ajuste es un fine-tune supervisado mas RL sobre la tarea de generacion de SQL para SQLite.

El procedimiento de entrenamiento usa GRPO combinado con replay supervisado desde un archivo de elites, con un peso mu = 0.05. Los datos son 5.000 preguntas de BIRD; la busqueda en el archivo emplea 1.000 de esas preguntas para seleccionar 1.500 ejemplos SQL verificados que se reinyectan como replay supervisado. El entrenamiento se ejecuto en 4 GPU NVIDIA A100 de 80 GB, reservando dos para optimizacion de politica y dos para generacion de rollouts, con el stack veRL, Trinity-RFT y vLLM. El autor publica un fichero training_provenance.json con metadatos del checkpoint, un YAML de configuracion historica del schedule y una guia de entrenamiento en el repositorio de GitHub.

## Capacidades

- Generacion de SQL para SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y evidencia opcional.
- Modo conversacional (tag conversational) y pipeline de text-generation en transformers.
- Ejecucion con el modo de razonamiento (thinking) desactivado, tal y como indica el ejemplo de uso del autor.
- Soporte multilingue: limitado a ingles, unico idioma declarado en la model card y en los tags.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades de vision o audio: no disponible. El tag image-text-to-text aparece en la ficha de HuggingFace, probablemente heredado del modelo base, pero la model card no documenta ninguna capacidad multimodal del ajuste.
- Capacidad especial: replay supervisado de soluciones diversas como parte del entrenamiento, con el objetivo declarado de mantener diversidad de soluciones SQL, no solo de maximizar la recompensa.

## Casos de uso

- Consultas analiticas sobre SQLite en produccion: dado el DDL de las tablas y una pregunta de negocio, el modelo emite la consulta SQL correspondiente, lo que permite exponer un buscador en lenguaje natural sobre bases de datos SQLite embebidas sin escribir SQL a mano.
- Asistente de business intelligence para perfiles no tecnicos: un analista de marketing o finanzas formula la pregunta en ingles y recibe la consulta, que se ejecuta contra el data mart SQLite; la inclusion de "evidence" en el prompt permite incorporar reglas de negocio (por ejemplo, definiciones de metricas) para desambiguar.
- Agente de analisis de datos multi-paso: encadenar el modelo con un ejecutor SQL y un formateador de resultados para responder preguntas que requieren inspeccionar el esquema, generar la consulta, ejecutarla y resumir el resultado; el modelo cubre el paso de traduccion lenguaje natural a SQL.
- Generacion de consultas de validacion y QA de datos: producir consultas de comprobacion sobre tablas SQLite para tests de integridad (nulos, duplicados, rangos fuera de dominio) a partir de descripciones textuales de las reglas.
- Benchmarking reproducible de RL post-entrenamiento: al ser Apache 2.0 y publicar configuracion, hardware y metadatos de provenance, sirve como baseline para comparar tecnicas de RL con replay supervisado frente a RL puro en text-to-SQL.
- Educacion y formacion en SQL: uso como generador de ejemplos pregunta-consulta sobre un esquema didactico, con la salvedad de que el modelo esta afinado para SQLite y en ingles.
- Refactorizacion de SQL legacy: traducir consultas escritas para otros dialectos a SQLite, o normalizar consultas generadas por distintos equipos, usando el esquema destino como contexto.
- Generacion de datos sinteticos: crear pares (pregunta, SQL) para aumentar el corpus de entrenamiento de modelos mayores o para evaluar sistemas text-to-SQL, siempre que se validen las consultas generadas antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados guardados de las evaluaciones sobre BIRD y Spider estan en el fichero evaluation.json del repositorio, pero no reproduce ninguna cifra (execution accuracy, exact match ni comparativas) en el texto proporcionado. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Peso de los parametros: 4.539.265.536 parametros equivalen a aproximadamente 9,1 GB en BF16/FP16, coherente con el tamano del repositorio (9,1 GB).
- VRAM estimada para inferencia (estimaciones a partir del numero de parametros, no cifras oficiales del autor): unos 10-12 GB en BF16 contando pesos y cache KV para contextos moderados; en torno a 5-6 GB en cuantizacion de 8 bits; en torno a 3-4 GB en cuantizacion de 4 bits. El autor declara que el ejemplo se verifico en una unica GPU A100 de 40 GB.
- GPU profesionales: entrenamiento validado en 4 x A100 80 GB; inferencia verificada en 1 x A100 40 GB. Tambien es adecuado en A100 80 GB, H100 y L40S.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con margen amplio; en RTX 4080, 4070 Ti Super o similares de 16 GB es viable en BF16 con contexto corto o en 8 bits con mas holgura; en RTX 3060 12 GB o 4060 Ti 16 GB conviene 8 o 4 bits. No se documentan las cuantizaciones, por lo que habria que generarlas.
- Opciones de despliegue: transformers 5.8.0 segun el ejemplo del autor (example.py); vLLM, empleado en las rollouts de entrenamiento y compatible con el tag endpoints_compatible; TGI o llama.cpp/Ollama requeririan convertir los pesos a formatos adicionales, no publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| EliteReplay-BIRD-4B | 4.539.265.536 | no disponible | Apache 2.0 | Text-to-SQL sobre SQLite | Publicado en HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3.5-4B-Base (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo base generalista, sin ajuste a SQL | Publicado en HuggingFace |
| Alternativas especializadas en text-to-SQL (por ejemplo, familias OmniSQL, Arctic-Text2SQL-R1 o XiYan-SQL) | no disponible | no disponible | no disponible | Text-to-SQL | Existen en el ecosistema, sin datos verificables en la informacion proporcionada |

No hay datos de rendimiento comparado en la informacion disponible: la model card no incluye cifras propias ni de terceros, y los resultados de busqueda web recibidos no contienen informacion relevante sobre este modelo (corresponden a conversores de unidades de volumen). Cualquier comparacion cuantitativa con alternativas de la misma categoria exigiria consultar evaluation.json en el repositorio y las fichas de los modelos competidores.

## Limitaciones y advertencias

- Riesgo de alucinacion de esquema: como todo modelo text-to-SQL, puede referenciar tablas o columnas inexistentes o inventar columnas plausibles; es obligatorio validar y ejecutar la consulta antes de usarla en produccion.
- Dominio restringido: el ajuste se hizo con 5.000 preguntas de BIRD, un benchmark academico; cabe esperar degradacion en esquemas empresariales muy grandes o con nomenclatura atipica.
- Dialecto limitado: la tarea declarada es SQLite. Las consultas pueden no ser portables a PostgreSQL, MySQL, BigQuery o Snowflake sin reescritura.
- Idioma: solo ingles. Las preguntas en castellano no estan soportadas oficialmente, aunque el modelo base fuese multilingue.
- Sin soporte documentado de tool calling ni de flujos agente; el uso con thinking desactivado es la unica configuracion verificada por el autor.
- Discrepancia en los metadatos: el tag image-text-to-text sugiere un modelo multimodal, pero la model card describe exclusivamente text-to-SQL y no documenta ninguna capacidad de vision. Tratar esa capacidad como no disponible hasta verificarla.
- Ausencia de validacion de la comunidad: 0 descargas y 0 likes; no hay evidencia externa de calidad ni de estabilidad en produccion.
- Evaluacion no publicada en la informacion disponible: el autor remite a evaluation.json y a un paper cuyo enlace esta pendiente, por lo que no se puede confirmar el rendimiento real frente a BIRD y Spider.
- Entorno de ejecucion especifico: el ejemplo se valida con transformers 5.8.0, una version concreta que puede no estar disponible en todos los entornos; conviene fijar versiones.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero no se detallan en la informacion proporcionada los terminos aplicables al modelo base Qwen3.5-4B-Base ni si existen condiciones adicionales heredadas.
- Coste de adaptacion: no hay pesos cuantizados publicados, por lo que desplegar en GPU de consumo exige generar las cuantizaciones y validar que no degradan la exactitud de ejecucion del SQL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hananour/EliteReplay-BIRD-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de codigo EliteReplay: https://github.com/skai-research/EliteReplay
- Guia de entrenamiento: https://github.com/skai-research/EliteReplay/blob/main/docs/training.md
- Configuracion de entrenamiento historica: https://github.com/skai-research/EliteReplay/blob/main/configs/historical/elitereplay_schedule.yaml
- Metadatos de provenance del checkpoint: training_provenance.json (en el repositorio del modelo)
- Resultados de evaluacion BIRD y Spider: evaluation.json (en el repositorio del modelo)
- Ejemplo de uso: example.py (en el repositorio del modelo)
- Paper "EliteReplay: Preserving Diverse Solutions in RL Post-Training via Quality-Diversity Search": enlace pendiente de publicacion segun la model card
- Resultados de busqueda web: no relevantes para este modelo (corresponden a conversores de unidades de volumen)
