# kakoka/Slonik-27B-oQ4e-mtp

## Resumen

Slonik-27B-oQ4e-mtp es una cuantizacion MLX de precision mixta del checkpoint Slonik-27B, un modelo de generacion de texto desarrollado por Postgres Professional a partir de Qwen3.8-27B. El autor de esta version es el usuario kakoka, que ha empaquetado el componente de texto del modelo base en formato MLX con cuantizacion afina de 4 bits y calibracion mediante matrices de importancia (oQe). El resultado es un artefacto de 16,60 GB que conserva los 15 tensores MTP (multi-token prediction) nativos, lo que habilita decodificacion especulativa en oMLX.

El modelo resuelve un problema concreto: permitir la ejecucion local eficiente de un modelo de 27.320.697.856 parametros en hardware Apple Silicon con memoria unificada, manteniendo la capacidad de razonamiento y generacion de codigo del modelo original. La especializacion del modelo base en PostgreSQL y tareas de codigo lo hace relevante para equipos que trabajan con bases de datos y necesitan asistencia de codigo en local sin depender de APIs externas.

La relevancia actual radica en la combinacion de tres factores: el tamano (27B, en el rango de los modelos de codigo mas capaces que caben en un equipo de sobremesa), la licencia Apache-2.0 (permisiva para uso comercial) y la preservacion de los pesos MTP, que en las pruebas del autor permiten alcanzar 78,98 tokens/s de decodificacion en un Mac Studio M5 Ultra con 256 GiB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con cabezas MTP (multi-token prediction); cuantizacion MLX de precision mixta |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits base con precision superior en tensores seleccionados, grupo de 64, calibracion oQe con matrices de importancia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 16,6 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint BF16 de Slonik-27B, que a su vez deriva de Qwen3.8-27B. La arquitectura subyacente es un transformer de 27B parametros con cabezas de prediccion multi-token (MTP), un mecanismo que permite decodificacion especulativa al predecir varios tokens por paso. Esta version preserva los 15 tensores MTP nativos junto con sus escalas y offsets de cuantizacion, lo que es clave para habilitar la funcion Lightning MTP en oMLX.

El proceso de cuantizacion empleo oMLX 0.7.4.dev1 con pesos afines de precision mixta: base de 4 bits con grupo de 64, mayor precision en tensores seleccionados y calibracion oQe basada en matrices de importancia. Los tensores de coma flotante restantes se mantuvieron en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Generacion y asistencia de codigo, con especializacion en PostgreSQL segun la model card del autor.
- Razonamiento y resolucion de problemas tecnicos, incluyendo analisis de planes de ejecucion de consultas (`EXPLAIN (ANALYZE, BUFFERS)`).
- Decodificacion especulativa mediante Lightning MTP, que acelera la generacion al predecir multiples tokens.
- Modo thinking desactivable (las pruebas del autor se realizaron con thinking off).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y agentes: el modelo se integro con Markov, un agente de codigo fork de Goose, lo que demuestra su uso en flujos agenticos con ejecucion de herramientas.

## Casos de uso

- Asistencia a desarrolladores de PostgreSQL: el modelo puede analizar consultas SQL, ejecutar `EXPLAIN (ANALYZE, BUFFERS)` contra una instancia y proponer reescrituras de consultas, como demuestra la evaluacion del autor con 72 casos verificados.
- Agente de codigo en local: integrado en herramientas tipo Goose o Markov, el modelo puede razonar en multiples pasos, ejecutar comandos y validar resultados sin enviar datos a la nube, gracias a su despliegue en MLX sobre Apple Silicon.
- Revision de migraciones de bases de datos: con su especializacion en Postgres, puede detectar indices ausentes, consultas mal planificadas o cambios de esquema problematicos antes de aplicarlos en produccion.
- Generacion de codigo en pipelines internos: al ser Apache-2.0 y ejecutarse localmente, puede integrarse en flujos de CI/CD o en herramientas internas de revision de codigo sin coste por token ni restricciones de licencia.
- Prototipado rapido en equipos con Mac: con 16,60 GB de pesos y decodificacion de 78,98 tokens/s en un Mac Studio M5 Ultra, es viable para sesiones interactivas de programacion y exploracion de datos.
- Educacion y formacion en SQL: el modelo puede explicar planes de ejecucion, justificar decisiones de indexacion y guiar a desarrolladores junior en la optimizacion de consultas, con la ventaja de funcionar sin conexion.

## Benchmarks y rendimiento

El autor publica una comparativa de variantes de cuantizacion medidas en un Mac Studio M5 Ultra con 256 GiB de memoria unificada, con un prompt en ingles sobre PostgreSQL de 437 tokens de entrada, 256 tokens generados, sin cache, thinking off y Lightning MTP activado:

| Variante | Pesos | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Total (s) |
|---|---:|---:|---:|---:|---:|
| oQ8 + MTP | 29,08 GB | 1.043,79 | 61,88 | 0,42 | 4,53 |
| oQ6e + MTP | 22,94 GB | 984,09 | 57,71 | 0,44 | 4,88 |
| oQ4e + MTP | 16,60 GB | 1.277,99 | 78,98 | 0,34 | 3,58 |

Ademas, el autor verifico que las sentencias SQL propuestas por cada variante devolvian las mismas filas en el mismo orden que la consulta original en 72 casos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,60 GB solo para pesos; se necesita margen adicional para el contexto y el estado de inferencia, por lo que se recomienda al menos 24-32 GB de memoria unificada.
- Hardware medido: Mac Studio M5 Ultra con 256 GiB de memoria unificada, con 78,98 tokens/s de decodificacion y 1.277,99 tokens/s de prefill.
- Cabe en equipos Apple Silicon con 32 GB o mas de memoria unificada; en configuraciones de 24 GB el margen es ajustado.
- Despliegue: exclusivamente mediante oMLX (libreria MLX); no se proporcionan pesos GGUF ni soporte para llama.cpp, vLLM, TGI u Ollama.
- Para activar la decodificacion especulativa es necesario habilitar Lightning MTP en los ajustes del modelo dentro de oMLX.
- Latencia: TTFT de 0,34 s en la configuracion medida con el prompt de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Slonik-27B-oQ4e-mtp (este) | 27,32B | no disponible | Apache-2.0 | MLX safetensors, 4 bits | Hugging Face, 0 descargas |
| Qwen3.8-27B-oQ4e-mtp (scottlowry) | no disponible | no disponible | no disponible | MLX safetensors, 4 bits | Hugging Face |
| Slonik-27B (BF16, dglhf) | 27B (aprox.) | no disponible | Apache-2.0 | safetensors BF16 | Hugging Face |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de rendimiento de modelos alternativos de la misma categoria en la informacion proporcionada. El modelo de scottlowry parece ser una cuantizacion equivalente sobre Qwen3.8-27B, mientras que el checkpoint BF16 de dglhf es la fuente sin cuantizar.

## Limitaciones y advertencias

- Solo texto: la cuantizacion es "Text Only", por lo que no se incluyen capacidades de vision u otras modalidades que pudiera tener el modelo base.
- Exclusivo de MLX: no hay pesos GGUF ni compatibilidad con ecosistemas como llama.cpp, vLLM u Ollama, lo que limita el despliegue a hardware Apple Silicon.
- Idiomas soportados no documentados: no se especifica que lenguas cubre el modelo, lo que impide garantizar calidad fuera del ingles y el ruso (idioma del autor del modelo base).
- Riesgo de alucinacion: como todo modelo generativo, puede proponer SQL incorrecto o planes de ejecucion invalidos; la evaluacion del autor verifico 72 casos, una muestra limitada.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Modelo con 0 descargas y 0 likes: no hay validacion de la comunidad ni reportes independientes de calidad.
- Aunque la licencia es Apache-2.0, se deben conservar los archivos LICENSE, NOTICE y las licencias upstream incluidas en el repositorio al redistribuir el modelo.
- La especializacion en PostgreSQL puede reducir el rendimiento en tareas generales de codigo o conversacion fuera de ese dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp
- Proyecto Slonik (modelo base): https://huggingface.co/dglhf/Slonik
- Checkpoint fuente BF16: https://huggingface.co/dglhf/Slonik/tree/321d879c39a809057f324a8133c9484e4c192c06/27B
- Documentacion de cuantizacion oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Benchmarks y revision de respuestas: https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp/blob/main/BENCHMARK.md
- Cuantizacion equivalente sobre Qwen3.8-27B: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ4e-mtp
