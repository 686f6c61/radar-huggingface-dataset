# mradermacher/FINER-SQL-3B-v2-GGUF

## Resumen

FINER-SQL-3B-v2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo thanhdath/FINER-SQL-3B-v2, realizadas por el cuantizador mradermacher. El modelo base es un modelo de texto a SQL de unos 3.000 millones de parámetros (3.085.938.688 exactos según los safetensors), entrenado con GRPO (Group Relative Policy Optimization) y orientado a la generación de consultas SQL a partir de lenguaje natural, con especial atención al formato core-db según sus etiquetas.

El propósito de este repositorio no es el modelo en sí, sino facilitar su despliegue local: las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros runtimes compatibles, con tamaños que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16). Esto lo hace accesible para desarrolladores que quieren incorporar generación de SQL sin depender de APIs externas ni de GPUs de gama alta.

Es relevante porque los modelos de texto a SQL pequeños y especializados permiten construir asistentes de datos y capas de consulta en lenguaje natural con latencias bajas y coste mínimo. Al estar bajo licencia Apache 2.0, puede integrarse en productos comerciales sin restricciones significativas. El idioma del modelo es el inglés, lo que conviene tener en cuenta para prompts y esquemas de base de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no disponible el detalle exacto del modelo base) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base se distribuye en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base, FINER-SQL-3B-v2, es un modelo de texto a SQL de aproximadamente 3.100 millones de parametros. Segun las etiquetas de la model card, fue entrenado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo utilizada habitualmente para afinar modelos en tareas verificables como la generacion de SQL, donde la correccion de la consulta puede validarse automaticamente contra una base de datos. No hay informacion disponible sobre el modelo de partida (base model previo al afinado), el numero de tokens de entrenamiento, la composicion del dataset ni la longitud de contexto.

La version aqui descrita es una coleccion de cuantizaciones estaticas en GGUF realizadas por mradermacher a partir de los pesos originales en formato HF/transformers. Se ofrecen doce niveles de cuantizacion, desde Q2_K (1,4 GB, con perdida de calidad notable) hasta f16 (6,3 GB, precision completa). El autor indica que las cuantizaciones weighted/imatrix no estan disponibles de momento, y que pueden solicitarse mediante una Community Discussion en el repositorio.

## Capacidades

- Generacion de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL), su tarea principal.
- Entrenamiento con GRPO orientado a mejorar la correccion de las consultas generadas.
- Etiquetado con core-db, lo que sugiere afinado o evaluacion sobre esquemas de bases de datos concretos (sin mas detalle disponible).
- Etiquetado como conversational, lo que indica compatibilidad con interfaces de chat, aunque su especializacion es SQL.
- Idioma de trabajo: ingles. No hay soporte declarado para otros idiomas.
- No hay informacion disponible sobre capacidades de vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Asistentes de datos para equipos no tecnicos: permite que usuarios de negocio formulen preguntas en ingles ("ventas por region en el ultimo trimestre") y obtengan consultas SQL ejecutables, reduciendo la dependencia del equipo de analitica.
- Integracion en herramientas de BI internas: puede insertarse como capa de generacion de SQL en dashboards o exploradores de datos, ejecutandose en local gracias a su reducido tamano (2 GB en Q4_K_M).
- Chatbots sobre bases de datos relacionales: dado su tamano, puede servir en tiempo real en CPU o GPU modesta, adecuado para asistentes embebidos en aplicaciones que consultan una base de datos conocida.
- Prototipado rapido de funciones text-to-SQL: el formato GGUF y la compatibilidad con Ollama y LM Studio permiten probar el modelo en un portatil antes de comprometerse con una solucion mayor.
- Validacion y generacion de consultas en pipelines ETL: puede usarse para generar o verificar consultas SQL en flujos automatizados, aprovechando su especializacion frente a un LLM generalista del mismo tamano.
- Entornos con restricciones de privacidad: al ejecutarse integramente en local, los esquemas y datos nunca salen de la infraestructura del usuario, algo util en sectores regulados (salud, finanzas).
- Generacion de consultas con coste marginal casi nulo: un modelo de 3 B cuantizado consume pocos recursos, lo que permite procesar grandes volumenes de peticiones sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantizacion elegida; aproximadamente 1,4 GB (Q2_K) a 3,4 GB (Q8_0) de pesos, mas overhead de contexto (practicamente cualquier equipo moderno con 8 GB de RAM puede ejecutarlo).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU de consumo con 4 GB de VRAM (por ejemplo GTX 1650 o superior) ejecuta las cuantizaciones Q4/Q5 con holgura. En GPU, cuantos mas nucleos, mejor throughput, pero el modelo es lo bastante pequeno para CPU.
- Cabe en consumer GPU: si, con holgura. Las cuantizaciones Q4_K_S (1,9 GB) y Q4_K_M (2,0 GB) caben incluso en GPUs de entrada; la version f16 (6,3 GB) cabe en una RTX 3060 de 12 GB o superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No es un despliegue tipico de vLLM/TGI al ser GGUF, aunque vLLM ha anadido soporte experimental para GGUF.
- Latencia y throughput: no disponible; por tamano (3 B en Q4), cabe esperar velocidades de decodificacion del orden de decenas de tokens por segundo incluso en CPU moderna, y muy superiores en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FINER-SQL-3B-v2 (base) | 3,09 B | Text-to-SQL | safetensors | Apache 2.0 | Modelo original, entrenado con GRPO |
| FINER-SQL-3B-v2-GGUF (esta ficha) | 3,09 B | Text-to-SQL | GGUF (12 cuants) | Apache 2.0 | Cuantizaciones estaticas para ejecucion local |
| SQLCoder-7B (defog) | ~7 B | Text-to-SQL | safetensors/GGUF | Apache 2.0 (segun version) | Mas grande, historicamente con mejores resultados en text-to-SQL pero mayor requerimiento de hardware |
| Modelos generalistas 3 B (p. ej. Qwen2.5-3B-Instruct) | 3 B | Uso general | safetensors/GGUF | Variable | Menos especializados en SQL; requieren prompting cuidadoso para esta tarea |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta orientado al ingles. Instrucciones o esquemas en espanol pueden degradar sensiblemente la calidad de las consultas generadas.
- Riesgo de alucinacion: como todo modelo de texto a SQL, puede generar consultas sintacticamente validas pero semanticamente incorrectas (tablas o columnas inexistentes, filtros erroneos). Es imprescindible validar el SQL generado antes de ejecutarlo, especialmente en escritura (INSERT/UPDATE/DELETE).
- Longitud de contexto: no disponible; esquemas de bases de datos grandes pueden no caber en la ventana de contexto. Verificar este dato en la ficha del modelo base antes de usarlo con esquemas extensos.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_M presentan perdida de calidad notable segun el propio autor; para produccion se recomiendan Q4_K_M o superiores.
- No hay cuantizaciones weighted/imatrix disponibles de momento, lo que podria mejorar la calidad a igual tamano.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar tambien la licencia y procedencia del modelo base y de los datos de entrenamiento, sobre los que no hay informacion detallada.
- Ausencia de benchmarks publicados: no es posible verificar afirmaciones de rendimiento; se recomienda evaluarlo contra el esquema y las consultas propias antes de adoptarlo.
- Etiqueta core-db sin documentacion: no hay detalle publico sobre que esquemas o bases de datos se usaron en el entrenamiento, lo que limita la capacidad de predecir su rendimiento fuera de dominio.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/FINER-SQL-3B-v2-GGUF
- Modelo base: https://huggingface.co/thanhdath/FINER-SQL-3B-v2
- Pagina de descargas resumida del cuantizador: https://hf.tst.eu/model#FINER-SQL-3B-v2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Ejemplo de README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
