# peasantsmith/ERNIE-5.5-Flash-Preview-Maya-GGUF

## Resumen

ERNIE-5.5-Flash-Preview-Maya-GGUF es un repositorio de cuantizaciones GGUF, anunciado pero todavía sin publicar, del modelo baidu/ERNIE-5.5-Flash-Preview. Lo mantiene el usuario peasantsmith dentro del Proyecto Maya, una iniciativa que distribuye pesos cuantizados para ejecución local del modelo original de Baidu. Según la model card, el modelo base es una arquitectura Mixture of Experts de 280 000 millones de parámetros totales con 14 000 millones activos por token, una ventana de contexto de 1 millón de tokens y licencia Apache 2.0.

La relevancia de este repositorio es doble: por un lado, acerca un modelo de escala frontier al ecosistema de inferencia local mediante formato GGUF; por otro, incorpora un drafter propio para decodificación especulativa, lo que teóricamente reduce la latencia manteniendo la distribución del modelo original. En el momento de la consulta no hay archivos de pesos disponibles, por lo que todas las especificaciones de cuantización y despliegue son provisionales.

El repositorio está orientado a idiomas inglés y chino, con pipeline de text-generation y licencia Apache 2.0 heredada del modelo base. La información pública es escasa: no se han publicado benchmarks, configuraciones de cuantización concretas ni requisitos de hardware específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun la model card del repositorio |
| Parametros totales | 280 B (280 000 millones) |
| Parametros activos | 14 B por token |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | GGUF en "tamanos habituales de Maya"; tamanos concretos no disponibles |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (planificado); pesos originales del modelo base no disponibles en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, con 280 000 millones de parametros totales y 14 000 millones activos por token, lo que situa la relacion de activacion en torno al 5 %. Dispone de una ventana de contexto de 1 millon de tokens. La model card del repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras variantes de alineacion.

La innovacion tecnica destacada en este repositorio es la inclusion de un drafter propio para decodificacion especulativa, descrito como una forma de obtener respuestas mas rapidas "que siguen siendo del propio modelo". No se especifican la arquitectura del drafter, su tamano ni la tasa de aceptacion esperada. Las cuantizaciones GGUF se calibraran sobre el formato de chat propio del modelo, segun la model card.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y conversacion multi-turno con contexto de hasta 1 millon de tokens.
- Decodificacion especulativa mediante drafter propio, orientada a reducir latencia.
- Ejecucion local en GPUs propias a traves de formato GGUF.
- Soporte de tool calling, function calling, agentes o modos de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 1 millon de tokens de contexto, el modelo puede procesar libros tecnicos, expedientes completos o bases de codigo sin fragmentacion, algo relevante para auditoria legal o revision de contratos.
- Asistentes de codigo en local: el formato GGUF y el drafter permiten desplegar un modelo de gran escala en infraestructura propia, util para equipos que no pueden enviar codigo a APIs externas.
- Generacion aumentada por recuperacion (RAG) sobre corpus masivos: la ventana de 1M tokens reduce la necesidad de pipelines de chunking agresivos en dominios con documentos muy largos.
- Traduccion y atencion al cliente bilingue ingles-chino: los dos idiomas declarados cubren el caso de uso principal de Baidu y de mercados con operaciones en ambos idiomas.
- Investigacion sobre decodificacion especulativa: el drafter incluido sirve como banco de pruebas para medir tasas de aceptacion en modelos MoE de gran escala.
- Despliegue en clústeres con GPUs de alta gama: un MoE de 280B con 14B activos permite servir el modelo con coste computacional por token similar a un modelo denso de 14B, si bien requiere memoria para los 280B totales.
- Evaluacion comparativa de cuantizaciones: util para estudiar la perdida de calidad de GGUF en modelos MoE con muchos expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y no se ha verificado el rendimiento del drafter ni de las cuantizaciones planificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia estructural, un modelo de 280B parametros en FP16 requiere aproximadamente 560 GB de VRAM solo para pesos; en cuantizacion de 4 bits se situaria en torno a 140-160 GB, aunque estas cifras son estimaciones generales y no datos publicados para este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de parametros, se anticipa la necesidad de GPUs de centro de datos (A100 80 GB, H100 80 GB) en configuraciones multi-GPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no confirmada; el tamano total del modelo hace improbable su ajuste en una unica GPU de consumo incluso en cuantizaciones agresivas.
- Opciones de despliegue: el repositorio apunta al runtime propio de Project Maya; compatibilidad con llama.cpp, Ollama, vLLM o TGI no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview (base) | 280 B | 14 B | 1M tokens | Apache 2.0 | Pesos originales en baidu/ERNIE-5.5-Flash-Preview; detalles de cuantizacion no disponibles |
| ERNIE-5.5-Flash-Preview-Maya-GGUF | 280 B | 14 B | 1M tokens | Apache 2.0 | Anunciado, sin archivos publicados |
| Alternativas MoE de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene archivos de pesos en el momento de la consulta; la model card indica explicitamente "Coming soon".
- No hay benchmarks publicados, por lo que no puede evaluarse la calidad del modelo ni la perdida introducida por las cuantizaciones.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos generativos de gran escala.
- Sesgos conocidos: no documentados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos originales de Baidu antes de un despliegue en produccion.
- El drafter y las cuantizaciones se encuentran en desarrollo; su comportamiento final puede diferir de lo anunciado.
- El modelo requiere infraestructura de memoria muy superior a la de un modelo denso de 14B, pese a su bajo numero de parametros activos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/ERNIE-5.5-Flash-Preview-Maya-GGUF
- Modelo base en Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Project Maya en GitHub: https://github.com/mw00/project-maya
