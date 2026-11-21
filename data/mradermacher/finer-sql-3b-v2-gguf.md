# mradermacher/FINER-SQL-3B-v2-GGUF

## Resumen

FINER-SQL-3B-v2-GGUF es la versión cuantizada en formato GGUF del modelo griffith-bigdata/FINER-SQL-3B-v2, un modelo especializado en text-to-SQL de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones). La cuantización la ha realizado mradermacher, un conocido autor de conversiones GGUF en Hugging Face, y ofrece un abanico de cuantizaciones estáticas que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB), pasando por Q4_K_M, Q5_K_M, Q6_K y Q8_0.

El modelo base está entrenado específicamente para la tarea de convertir lenguaje natural en consultas SQL, con un entrenamiento que según las etiquetas del repositorio incluye GRPO (Group Relative Policy Optimization) y está orientado al benchmark Core-DB. Esto lo sitúa en la categoría de modelos pequeños y especializados, pensados para desplegarse en entornos con recursos limitados donde un LLM generalista de mayor tamaño resultaría excesivo o demasiado costoso.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar el modelo en CPU o en GPUs de consumo mediante llama.cpp y herramientas compatibles, lo que facilita su integración en pipelines de generación de SQL dentro de aplicaciones de business intelligence, asistentes de bases de datos o herramientas de análisis self-service. La licencia Apache 2.0 del modelo base facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base FINER-SQL-3B-v2); detalles de arquitectura interna no disponibles |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base griffith-bigdata/FINER-SQL-3B-v2 más allá de que se trata de un transformer de aproximadamente 3,09 mil millones de parámetros. Las etiquetas del repositorio indican que el entrenamiento incluye GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo que se ha popularizado para afinar modelos en tareas con recompensas verificables, como es el caso de la generación de SQL correcto. También aparece la etiqueta core-db, que sugiere que el entrenamiento o la evaluación se ha centrado en el benchmark Core-DB de text-to-SQL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases adicionales de RLHF o DPO más allá del GRPO mencionado. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. Esta versión concreta del repositorio es una conversión estática a GGUF realizada por mradermacher; el autor indica que no ha generado cuantizaciones ponderadas con imatrix, y que si no aparecen en aproximadamente una semana tras las estáticas, probablemente no las tenga planificadas.

## Capacidades

- Generación de consultas SQL a partir de descripciones en lenguaje natural (text-to-SQL), que es la tarea principal para la que está entrenado el modelo.
- Especialización en esquemas de bases de datos relacionales, orientada al benchmark Core-DB según las etiquetas del repositorio.
- Entrenamiento con GRPO, lo que sugiere optimización orientada a la corrección de las consultas generadas.
- Soporte conversacional (etiqueta conversational en los tags del repositorio).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingües limitadas al inglés según el campo language del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente de consultas para business intelligence: el modelo puede traducir preguntas de negocio en lenguaje natural ("¿cuáles fueron las ventas por región el último trimestre?") a consultas SQL ejecutables contra el esquema de datos, integrándose en herramientas de BI self-service para usuarios no técnicos.
- Generación de SQL en pipelines de datos: al ser un modelo de 3B parámetros cuantizado a Q4_K_M (2,0 GB), puede desplegarse junto a orquestadores de datos para generar consultas de transformación o validación de forma automatizada y con bajo coste de infraestructura.
- Chatbot interno de acceso a bases de datos: con la etiqueta conversational y un tamaño reducido, puede gestionar conversaciones multi-turno donde el usuario refina su consulta hasta obtener el SQL deseado, ejecutándose en CPU o GPU de consumo.
- Herramientas de desarrollo para analistas: integración en IDE o notebooks para sugerir consultas SQL a partir de comentarios o descripciones, reduciendo el tiempo de escritura de queries complejas.
- Prototipado rápido de aplicaciones text-to-SQL: gracias a las cuantizaciones GGUF y a la licencia Apache 2.0, equipos pequeños pueden validar productos de generación de SQL sin depender de APIs externas ni de GPUs de datacenter.
- Evaluación y benchmarking de pipelines text-to-SQL: el modelo sirve como baseline ligero en experimentos sobre Core-DB y otros conjuntos de evaluación, ejecutable en hardware modesto para iterar rápidamente.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente con llama.cpp, permite generar SQL sobre esquemas sensibles sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K aproximadamente 1,4 GB; Q3_K_S 1,6 GB; Q3_K_M 1,7 GB; Q3_K_L 1,8 GB; IQ4_XS 1,9 GB; Q4_K_S 1,9 GB; Q4_K_M 2,0 GB; Q5_K_S 2,3 GB; Q5_K_M 2,3 GB; Q6_K 2,6 GB; Q8_0 3,4 GB; f16 6,3 GB (tamaños de fichero indicados por el autor; el consumo real de memoria es algo superior por el contexto y el runtime).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060, RTX 4090 o A100/H100 son más que suficientes para este tamaño. Las cuantizaciones Q2_K a Q4_K_M caben incluso en GPUs de gama de entrada y en muchos iGPU modernos.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones habituales (Q4_K_M de 2,0 GB es la recomendada por el autor como "fast, recommended").
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, etc.). El repositorio también declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de información suficiente sobre alternativas comparables en la información proporcionada para establecer una comparativa rigurosa con cifras. A modo orientativo estructural, se puede comparar con otros modelos text-to-SQL de tamaño similar, pero sin datos de benchmarks no es posible afirmar superioridad o inferioridad.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FINER-SQL-3B-v2-GGUF (este) | ~3,09B | no disponible | Apache 2.0 | GGUF (multiples cuantizaciones) | Especializado text-to-SQL, entrenado con GRPO |
| Alternativas text-to-SQL de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en text-to-SQL: no está pensado como LLM generalista y su rendimiento en otras tareas será previsiblemente limitado.
- Idioma: solo se declara soporte de inglés, por lo que las consultas en castellano pueden degradar la calidad de la generación SQL.
- Riesgo de alucinación: como todo modelo generativo, puede producir SQL sintácticamente válido pero semánticamente incorrecto o referenciar tablas y columnas inexistentes; es imprescindible validar las consultas generadas antes de ejecutarlas en producción.
- Longitud de contexto no documentada: no se puede garantizar el manejo de esquemas de bases de datos extensos o conversaciones multi-turno largas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality" por el autor) pueden degradar notablemente la precisión en la generación de SQL; se recomienda Q4_K_M o superior para uso en producción.
- No hay cuantizaciones ponderadas con imatrix disponibles según el autor, lo que puede afectar a la calidad relativa de las cuantizaciones de baja precisión.
- Licencia Apache 2.0 del modelo base: permite uso comercial, pero conviene verificar los términos del modelo original griffith-bigdata/FINER-SQL-3B-v2 y las condiciones de los datos de entrenamiento, no documentadas aquí.
- El repositorio tiene 0 likes y unas 795 descargas en el momento de la ficha, lo que indica una adopción todavía limitada y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/FINER-SQL-3B-v2-GGUF
- Modelo base original: https://huggingface.co/griffith-bigdata/FINER-SQL-3B-v2
- Página de overview de cuantizaciones del autor: https://hf.tst.eu/model#FINER-SQL-3B-v2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
