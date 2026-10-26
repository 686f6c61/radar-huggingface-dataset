# mradermacher/sql-assistant-1-5b-GGUF

## Resumen

`mradermacher/sql-assistant-1-5b-GGUF` es un conjunto de cuantizaciones GGUF estáticas del modelo `MRPEPPER12/sql-assistant-1-5b`, un ajuste fino de 1.543.714.304 parámetros (aproximadamente 1,5 B) orientado a tareas de asistencia SQL. El trabajo de cuantización lo firma mradermacher (nethype GmbH), que redistribuye los pesos originales en 12 variantes que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que permite ejecutar el modelo en hardware muy modesto.

El interés práctico del repositorio es la accesibilidad: al tratarse de un modelo de 1,5 B con cuantizaciones de ~1 GB, cabe en CPU, en GPUs de consumo con poca VRAM e incluso en entornos integrados, algo relevante para asistentes de generación de consultas SQL en herramientas internas, entornos offline o pipelines de CI. El repositorio se publicó el 26 de octubre de 2026 y, en el momento de la consulta, no registra descargas ni valoraciones, por lo que no existe validación comunitaria de la calidad de las cuantizaciones.

La información disponible es limitada: la model card del repositorio es la plantilla estándar de mradermacher para cuantizaciones y no incluye detalles de arquitectura, contexto, dataset de entrenamiento ni resultados de evaluación. La model card del modelo base (`MRPEPPER12/sql-assistant-1-5b`) no se ha proporcionado, y la licencia figura como no disponible, lo que condiciona cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; el modelo base se etiqueta con la libreria `transformers`) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el recuento de parametros procede de safetensors del modelo base |

Tabla de ficheros publicados (tamano segun la model card):

| Tipo | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 0,8 | — |
| Q3_K_S | 0,9 | — |
| Q3_K_M | 0,9 | calidad inferior |
| Q3_K_L | 1,0 | — |
| IQ4_XS | 1,0 | — |
| Q4_K_S | 1,0 | rapido, recomendado |
| Q4_K_M | 1,1 | rapido, recomendado |
| Q5_K_S | 1,2 | — |
| Q5_K_M | 1,2 | — |
| Q6_K | 1,4 | muy buena calidad |
| Q8_0 | 1,7 | rapido, mejor calidad |
| f16 | 3,2 | 16 bpw, sobredimensionado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base: la model card del repositorio cuantizado no incluye configuracion de capas, tipo de atencion, tokenizador ni ventana de contexto. Lo unico deducible de las etiquetas es que `MRPEPPER12/sql-assistant-1-5b` es un modelo ajustado (`fine-tuned`) mediante LoRA (`lora`) sobre una base no identificada, y que se distribuye a traves de la libreria `transformers`. La etiqueta `zebrain` aparece en los metadatos, pero no se explica su significado en el texto proporcionado.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, presencia de esquemas SQL reales, pares pregunta-consulta), ni sobre si se aplicaron fases de RLHF, DPO o evaluacion humana. La unica innovacion tecnica documentada es el propio proceso de cuantizacion: se ofrecen cuantizaciones estaticas (no ponderadas con imatrix); el autor indica explicitamente que las versiones ponderadas con imatrix no estan disponibles en el momento de la publicacion y que podrian no llegar a publicarse.

## Capacidades

- Generacion de texto conversacional orientada a tareas de asistencia SQL, segun el nombre y las etiquetas del modelo base (`sql-assistant`).
- Generacion y formateo de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL), capacidad inferida del proposito declarado del modelo base; no verificada con evaluaciones publicadas.
- Conversacion multi-turno: la etiqueta `conversational` sugiere un formato de chat, aunque no se detalla la plantilla de prompt aplicada.
- Ejecucion en local mediante llama.cpp y derivados gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Multilingue: limitado a ingles (`en`) segun los metadatos; no se declaran otros idiomas.
- Capacidades multimodales (vision, audio) o modo "thinking": no disponibles.

## Casos de uso

- Asistente text-to-SQL en herramientas internas de BI: con ~1 GB en Q4_K_M, el modelo puede desplegarse junto a una aplicacion web para traducir preguntas de negocio en consultas `SELECT` sobre un esquema conocido, sin depender de APIs externas.
- Autocompletado de consultas en editores SQL: al caber en CPU, puede ejecutarse embebido en un plugin de IDE o en un editor tipo DBeaver/JetBrains para sugerir clausulas y `JOIN` mientras se escribe.
- Generacion de SQL en pipelines de datos y dbt: util para esbozar transformaciones a partir de descripciones de columnas, siempre con revision humana antes de ejecutar en produccion.
- Entornos offline o air-gapped: al ser un GGUF autocontenido de ~1 GB, es viable en maquinas sin acceso a Internet ni a GPU, donde no se pueden usar modelos alojados en la nube.
- Prototipado y pruebas de concepto: sirve como baseline barato para comparar enfoques de text-to-SQL antes de invertir en modelos de 7 B o 30 B, o como punto de partida para un ajuste fino propio.
- Educacion y documentacion: explicar o comentar consultas SQL existentes en documentacion tecnica interna, con la advertencia de que el modelo solo esta declarado en ingles.
- Procesamiento por lotes de bajo coste: generar borradores de consultas para miles de descripciones de tablas en una CPU multi-nucleo con llama.cpp, sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el overhead de contexto y la cache KV. Con Q4_K_M (1,1 GB) es razonable reservar entre 1,5 y 2 GB; con Q8_0 (1,7 GB), entre 2 y 2,5 GB; con f16 (3,2 GB), en torno a 4 GB. Son estimaciones basadas en los tamanos publicados, no medidas del autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM cubre todas las cuantizaciones; una RTX 3060/4060 (8-12 GB), RTX 4090, A100 o H100 son sobredimensionadas para este modelo y solo tendrian sentido para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: si. Incluso Grafias integradas o iGPUs con memoria compartida pueden ejecutar las cuantizaciones Q2_K a Q4_K_M; en CPU pura es perfectamente viable con 2-4 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y, de forma experimental, vLLM con soporte GGUF. Los pesos originales del modelo base (si se dispone de ellos) requeririan `transformers` y, presumiblemente, PEFT para el adaptador LoRA.
- Latencia y throughput: no disponibles. No se han publicado mediciones; en un modelo de 1,5 B en CPU cabe esperar velocidades del orden de decenas de tokens por segundo, pero se trata de una expectativa general y no de un dato verificado para este modelo.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de la model card del modelo base, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos son de referencia general y deben verificarse en sus propias fichas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/sql-assistant-1-5b-GGUF | ~1,5 B | no disponible | no disponible | GGUF | Especializado en SQL segun su nombre; sin benchmarks publicados |
| MRPEPPER12/sql-assistant-1-5b (base) | ~1,5 B | no disponible | no disponible | no disponible (presumiblemente safetensors) | Origen del ajuste LoRA; misma especializacion |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5 B | 32 768 tokens (referencia general) | Apache-2.0 (referencia general) | safetensors, GGUF | Alternativa generalista de codigo con cuantizaciones comunitarias y amplia validacion |
| CodeLlama-7B-Instruct | ~6,7 B | 16 384 tokens (referencia general) | Llama 2 (referencia general) | safetensors, GGUF | Mayor tamano y coste; requiere ~4-8 GB segun cuantizacion |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial. Es imprescindible contactar con el autor del modelo base (`MRPEPPER12`) o consultar su repositorio antes de cualquier despliegue en produccion.
- Ausencia total de validacion: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas. La calidad real de las respuestas SQL es desconocida.
- Riesgo de alucinacion estructural: en tareas text-to-SQL es habitual que un modelo genere tablas, columnas o dialectos inexistentes; con 1,5 B de parametros y sin datos de evaluacion, la validacion contra el esquema real y el uso de un parser SQL son obligatorios.
- Idioma: solo se declara ingles (`en`). El rendimiento en castellano no esta garantizado ni documentado.
- Contexto desconocido: si la ventana es corta, no cabran esquemas de base de datos grandes, lo que limita el caso de uso principal; no se puede planificar sin consultar la configuracion del modelo base.
- Cuantizaciones agresivas: Q2_K y Q3_K_M degradan la calidad de forma notable segun la propia model card (Q3_K_M marcada como "lower quality"). Para SQL, donde un token incorrecto invalida la consulta, se recomienda Q5_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no estan disponibles y que podrian no publicarse, por lo que no se puede optar a la mejora de calidad habitual de ese metodo.
- Modelo base no identificado: se desconoce sobre que arquitectura se aplico el LoRA (`zebrain`, `lora`, `fine-tuned`), lo que impide evaluar linaje, sesgos heredados o restricciones adicionales.
- Fecha de publicacion atipica (26 de octubre de 2026): conviene verificar la vigencia y el estado del repositorio antes de depender de el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sql-assistant-1-5b-GGUF
- Modelo base: https://huggingface.co/MRPEPPER12/sql-assistant-1-5b
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#sql-assistant-1-5b-GGUF
- Guia de uso de GGUF citada por el autor (TheBloke, KafkaLM-70B-German): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas sobre cuantizaciones del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
