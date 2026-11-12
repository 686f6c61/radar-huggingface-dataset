# mradermacher/phi4_sql_finetuned-GGUF

## Resumen

`mradermacher/phi4_sql_finetuned-GGUF` es una coleccion de cuantizaciones GGUF del modelo `clintlord/phi4_sql_finetuned`, un ajuste fino de la familia Phi-4 de Microsoft orientado a la generacion de consultas SQL. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, que distribuye los pesos en multiples niveles de compresion para facilitar su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base pertenece a la familia Phi-4, con 3.836.021.856 parametros totales (aproximadamente 3,8 mil millones), lo que lo situa en la categoria de modelos pequenos y eficientes. El ajuste fino sobre `phi4_sql_finetuned` sugiere un entrenamiento especifico para tareas de traduccion de lenguaje natural a SQL, aunque la model card del repositorio de cuantizaciones no detalla la composicion del dataset ni el proceso de entrenamiento.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo especializado en SQL en entornos con recursos limitados, gracias a la disponibilidad de cuantizaciones desde Q2_K (1,8 GB) hasta f16 (7,8 GB). No obstante, la informacion publicada es escasa: no se detallan benchmarks, licencia ni contexto de entrenamiento, lo que limita una evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Phi-4 de Microsoft; arquitectura transformer, sin confirmar en la informacion proporcionada) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `clintlord/phi4_sql_finetuned`. Por la denominacion y el numero de parametros (3,8 mil millones), se corresponde con la familia Phi-4 de Microsoft, que emplea arquitecturas transformer con atencion de multiples cabezas y tecnicas de entrenamiento con datos sinteticos y curados. Sin embargo, no se confirma en la informacion proporcionada el tipo exacto de transformer, el numero de capas, la dimension oculta ni el mecanismo de atencion.

Respecto al entrenamiento, la model card del repositorio de cuantizaciones no incluye datos sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor de las cuantizaciones (mradermacher) solo documenta el proceso de conversion a GGUF, no el entrenamiento del modelo original. Se desconoce igualmente si el ajuste fino se realizo mediante SFT, LoRA u otra tecnica.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural (proposito inferido del nombre del modelo base).
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de consultas SQL en herramientas de BI: el modelo puede traducir preguntas de negocio en lenguaje natural a sentencias SQL para su ejecucion en motores como PostgreSQL o MySQL, gracias a su ajuste fino especifico. Es adecuado por su tamano reducido, que permite desplegarlo en entornos locales.
- Asistente de consultas para analistas de datos: integrado en un IDE o notebook, el modelo puede sugerir consultas SQL a partir de descripciones de tablas y relaciones, reduciendo el tiempo de escritura manual.
- Automatizacion de pipelines ETL: el modelo puede generar transformaciones SQL para herramientas como dbt o Airflow, a partir de especificaciones en lenguaje natural, siempre con revision humana.
- Educacion y formacion en SQL: util para generar ejemplos de consultas y explicar su logica en entornos de aprendizaje, con la ventaja de ejecutarse en hardware de consumo.
- Prototipado rapido de APIs de consulta: desplegado con llama.cpp u Ollama, puede servir como backend de un endpoint que reciba lenguaje natural y devuelva SQL, para validacion interna.
- Migracion de esquemas entre motores: el modelo puede ayudar a reescribir consultas entre dialectos SQL (por ejemplo, de MySQL a PostgreSQL), aunque requiere validacion por las limitaciones del ajuste fino.
- Despliegue en entornos con GPU de consumo: gracias a las cuantizaciones Q4_K_M (2,6 GB) y Q5_K_M (2,9 GB), puede ejecutarse en tarjetas como RTX 3060 o superiores, lo que facilita pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,5 GB y 4,5 GB para cuantizaciones Q4_K_M y Q5_K_M, respectivamente, incluyendo overhead de contexto; la version f16 requiere aproximadamente 8-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Compatibilidad con GPU de consumo: si, practicamente cualquier GPU con 6 GB o mas puede ejecutar las cuantizaciones Q4 y Q5; las versiones Q2 y Q3 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para mayor throughput en servidor, vLLM o TGI requeririan los pesos en safetensors del modelo base, no las cuantizaciones GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi4_sql_finetuned-GGUF (este) | 3,8 B | no disponible | no disponible | GGUF | Ajuste fino para SQL, solo ingles |
| Phi-4-mini (Microsoft) | ~3,8 B | no disponible en esta ficha | MIT (segun familia Phi-4, no confirmado aqui) | safetensors, GGUF | Modelo base generalista, sin ajuste SQL |
| Qwen2.5-Coder-3B | ~3 B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Especializado en codigo, multilingue |
| SQLCoder-7B | ~7 B | no disponible | no disponible | safetensors, GGUF | Especializado en SQL, mayor tamano |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de datos de rendimiento comparativo para este ajuste fino concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un ajuste fino sobre datos no especificados, puede heredar sesgos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinacion: elevado en tareas de generacion de SQL, ya que el modelo puede inventar tablas, columnas o funciones inexistentes; se recomienda validacion sintactica y semantica antes de ejecutar consultas en produccion.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles; no se especifica la longitud de contexto, lo que impide garantizar el manejo de esquemas de bases de datos extensos.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base `clintlord/phi4_sql_finetuned` y de la familia Phi-4 antes de cualquier despliegue productivo.
- Caveats para produccion: la ausencia de benchmarks y de documentacion sobre el entrenamiento impide evaluar su calidad frente a alternativas; se recomienda realizar una evaluacion propia con un conjunto de validacion representativo antes de adoptarlo.
- El repositorio de cuantizaciones tiene un numero muy bajo de descargas (67) y cero likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/phi4_sql_finetuned-GGUF
- Modelo base: https://huggingface.co/clintlord/phi4_sql_finetuned
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/phi4_sql_finetuned-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#phi4_sql_finetuned-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
