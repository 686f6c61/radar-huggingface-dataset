# Ocean82/Spreadsheet-RL-4B-GGUF

## Resumen

Spreadsheet-RL-4B-GGUF es la version cuantizada en formato GGUF del modelo Spreadsheet-RL-4B, un modelo de lenguaje de aproximadamente 4.411 millones de parametros (4,4 B) afinado mediante aprendizaje por refuerzo para tareas de hoja de calculo, Excel y uso de herramientas. El modelo original lo desarrolla el equipo Spreadsheet-RL y esta construido sobre una base de la familia Qwen3, segun indican las etiquetas del repositorio. Esta version GGUF la publica el usuario Ocean82 y la generacion de cuantizaciones corresponde a mradermacher, que produce los ficheros estaticos a partir de los pesos originales en transformers.

El modelo resuelve el problema de automatizar operaciones sobre hojas de calculo mediante un agente que razona y utiliza herramientas, un dominio donde los LLM generalistas suelen fallar por falta de estructura y de ejecucion verificable. La relevancia actual radica en que combina un tamano contenido (4,4 B) con un entrenamiento especifico de refuerzo (GRPO) sobre el dataset Spreadsheet-RL, lo que permite desplegarlo en hardware modesto manteniendo un comportamiento orientado a agentes y a tool calling.

La licencia es Apache 2.0, lo que facilita su uso comercial. El repositorio GGUF ocupa 39,7 GB porque incluye todas las variantes de cuantizacion, desde Q2_K (1,9 GB) hasta f16 (8,9 GB), lo que permite elegir el equilibrio entre calidad y memoria segun el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3, segun etiquetas del repositorio); no se detalla la configuracion exacta |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base Spreadsheet-RL-4B es un transformer decoder-only de 4,4 B de parametros derivado de la familia Qwen3, segun las etiquetas del repositorio. El entrenamiento se realizo mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el dataset Spreadsheet-RL, un conjunto orientado a tareas de hoja de calculo. La libreria de entrenamiento declarada es verl, un framework de RL para modelos de lenguaje, y el pipeline del repositorio es reinforcement-learning. El objetivo del afinado es que el modelo aprenda a razonar y a invocar herramientas para manipular hojas de calculo de forma verificable.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO. La model card del repositorio GGUF es una plantilla generada por mradermacher para cuantizaciones estaticas y no incluye detalles tecnicos del entrenamiento original. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. Las cuantizaciones son estaticas; segun la model card, no hay cuantizaciones ponderadas o con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de hoja de calculo (Excel y formatos de spreadsheet).
- Uso de herramientas (tool calling / function calling) como capacidad central del entrenamiento.
- Comportamiento de agente con razonamiento multi-paso, derivado del entrenamiento con GRPO.
- Manipulacion de datos tabulares: interpretacion de instrucciones sobre celdas, rangos y operaciones.
- Formato conversacional (etiqueta conversational en el repositorio).
- Compatibilidad con endpoints (endpoints_compatible).
- Capacidades multilingues limitadas: solo se declara ingles.
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Automatizacion de tareas en Excel: el modelo puede recibir instrucciones en lenguaje natural y traducirlas en operaciones sobre celdas y rangos mediante tool calling, adecuado para generar macros o scripts de manipulacion.
- Agentes de analisis de datos tabulares: integrado en un pipeline que expone herramientas de lectura y escritura de hojas de calculo, el modelo puede ejecutar secuencias multi-paso para limpiar, transformar y resumir datos.
- Asistentes para contabilidad y finanzas: con contexto de hoja de calculo, puede ayudar a construir formulas, validar totales y detectar inconsistencias en libros de calculo, gracias a su entrenamiento especifico en el dominio.
- Generacion de informes a partir de hojas de calculo: el modelo puede interpretar datos tabulares y redactar resumenes textuales, util para equipos que necesitan narrativa sobre metricas.
- Integracion en pipelines de CI/CD para validacion de hojas: al soportar tool calling, puede conectarse a scripts que verifiquen la integridad de ficheros Excel en procesos automatizados.
- Despliegue en local para privacidad de datos: con cuantizaciones desde 1,9 GB (Q2_K) hasta 4,8 GB (Q8_0), puede ejecutarse en estaciones de trabajo sin enviar datos financieros a la nube.
- Prototipado rapido de agentes de escritorio: su tamano de 4,4 B permite iterar en local con llama.cpp u Ollama antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF, aproximada al tamano del fichero mas overhead): Q2_K ~2 GB, Q4_K_M ~3 GB, Q8_0 ~5 GB, f16 ~9 GB.
- GPU recomendadas: para f16, una GPU con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); para Q4_K_M, una GPU con 4-6 GB (RTX 3060, RTX 4060) o incluso CPU.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 en GPUs con 8 GB o mas; las variantes Q2_K y Q4_K_S pueden ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base admite transformers. No se confirma soporte de vLLM o TGI para la version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparativa cuantitativa fiable con modelos de la misma categoria. Como referencia cualitativa, se trata de un modelo de 4,4 B especializado en hojas de calculo y agentes, derivado de Qwen3, con licencia Apache 2.0 y cuantizaciones GGUF disponibles. No se conocen en la informacion proporcionada alternativas directamente comparables en el nicho de spreadsheet-RL.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spreadsheet-RL-4B-GGUF | 4,4 B | No disponible | Apache 2.0 | GGUF |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 4,4 B, especialmente en operaciones de hoja de calculo donde un error de celda puede propagarse.
- No se documenta la longitud de contexto, lo que impide planificar su uso con hojas de calculo grandes o conversaciones largas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento; se recomienda Q4_K_M o superior para produccion.
- No hay cuantizaciones ponderadas o imatrix disponibles, lo que puede limitar la calidad en tamanos pequenos frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base Qwen3 y del dataset Spreadsheet-RL.
- La model card del repositorio GGUF es una plantilla generica; no incluye informacion sobre sesgos, evaluaciones ni limitaciones especificas del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ocean82/Spreadsheet-RL-4B-GGUF
- Modelo base: https://huggingface.co/Spreadsheet-RL/Spreadsheet-RL-4B
- Pagina de cuantizaciones de mradermacher: https://hf.tst.eu/model#Spreadsheet-RL-4B-GGUF
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Spreadsheet-RL-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
