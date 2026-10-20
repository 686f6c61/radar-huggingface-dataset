# nile-academy/gemma-4-e4b-it-gguf

## Resumen

`nile-academy/gemma-4-e4b-it-gguf` es un espejo en formato GGUF del modelo `google/gemma-4-E4B-it`, desarrollado originalmente por Google DeepMind y publicado el 2 de abril de 2026. El repositorio lo mantiene Nile Academy, que declara explicitamente que su rol es el de "mirror oficial del artefacto o conversion de formato registrada, sin entrenamiento adicional". El contenido es la exportacion QAT Q4_0 oficial de Google, replicada sin modificaciones, junto con el proyector multimodal en BF16.

El modelo resuelve el problema de desplegar un modelo de ~7.500 millones de parametros en hardware de consumo o en infraestructura con VRAM limitada: el fichero principal Q4_0 ocupa 5,155 GB y el proyector multimodal 0,992 GB, frente a los 6,1 GB totales del repositorio. Al tratarse de una cuantizacion QAT (quantization-aware training) del propio publicador y no de una cuantizacion post-hoc de terceros, Google atribuye una calidad "cercana a BF16", si bien esa afirmacion no ha sido verificada de forma independiente sobre este artefacto concreto.

Es relevante ahora por dos motivos: por un lado, permite ejecutar un modelo de la familia Gemma 4 con capacidad multimodal en GPUs consumer; por otro, el propio repositorio documenta que la calificacion de calidad de cuantizacion de Wekala esta en estado "not qualified", es decir, que la evaluacion pareada contra la referencia BF16 aun esta pendiente. El repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el sufijo "E4B" no se explicita) |
| Parametros totales | 7.463.013.674 (dato real, safetensors); 7.996.156.490 en la fuente original, incluyendo embeddings y modalidades de origen |
| Parametros activos | no disponible (no se confirma si es MoE ni, en su caso, cuantos parametros se activan) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT oficial de Google) para los pesos; BF16 para el proyector multimodal |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (preservada en LICENSE; la licencia del modelo original rige los pesos) |
| Formato de pesos | GGUF (llama.cpp); ficheros `gemma-4-E4B_q4_0-it.gguf` y `gemma-4-E4B-it-mmproj.gguf` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: la model card del espejo no incluye descripcion de capas, tipo de atencion, mecanismo de mezcla de expertos ni composicion del corpus de entrenamiento. Tampoco se documentan el numero de tokens de entrenamiento, las fases de alineacion (RLHF, DPO u otras) ni innovaciones tecnicas especificas. Cualquier afirmacion sobre estos puntos seria especulativa y no se incluye.

Lo que si consta es el proceso de cuantizacion: se trata de una exportacion QAT Q4_0 generada por el publicador oficial (Google) y replicada sin cambios por Nile Academy, con revisión de origen fijada en `ee0ef6023621cff504d758262d4e04895a5af4a2`. La presencia de un fichero `mmproj` en BF16 indica que el modelo incorpora un proyector multimodal, es decir, que acepta entrada de imagenes ademas de texto, aunque la model card no detalla que modalidades adicionales cubre. Los receipts de conversion, las rutas upstream y los hashes SHA-256 exactos de cada fichero se registran en `model-metadata.json` dentro del repositorio.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `text-generation` y `conversational`, y deriva de la variante `-it` (instruction-tuned) del modelo base.
- Entrada multimodal: la presencia del proyector `mmproj` en BF16 apunta a procesamiento de imagenes combinadas con texto, aunque el alcance exacto no se detalla en la informacion disponible.
- Tool calling / function calling: la model card menciona plantillas nativas de chat, tool y template en el runtime Wekala, y advierte que las llamadas a herramientas son "propuestas sujetas a los permisos de la aplicacion consumidora y a la admision del controlador".
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs compatibles con el formato de endpoints, sin que se especifique el esquema concreto.
- Capacidades multilingues: no disponible. La ficha de HuggingFace no declara lista de idiomas.
- Razonamiento multi-paso y modo "thinking": no disponible en la informacion proporcionada.
- Generacion de codigo y matematicas: solo inferible a partir de los benchmarks publicados por el editor original (LiveCodeBench v6, AIME 2026), no de una declaracion explicita de capacidades.

## Casos de uso

- Asistencia conversacional en local: al ocupar 5,155 GB en Q4_0, el modelo puede ejecutarse en una estacion de trabajo con GPU de 8-12 GB o incluso en CPU mediante llama.cpp, lo que permite desplegar un asistente de chat sin dependencia de APIs externas ni coste por token.
- Procesamiento de documentos con imagenes: el proyector multimodal en BF16 permite enviar capturas, diagramas o paginas escaneadas junto a una instruccion de texto, un escenario habitual en digitalizacion de archivos y extraccion de datos.
- Integracion en pipelines con tool calling: la plantilla de herramientas del runtime permite que el modelo proponga llamadas a funciones (consulta a bases de datos, ejecucion de scripts) que la aplicacion valida antes de ejecutar, lo que encaja en flujos de automatizacion con supervision humana.
- Despliegue en entornos con requisitos de soberania del dato: la licencia Apache-2.0 y la disponibilidad del GGUF permiten operar el modelo on-premise en sectores regulados, sin que los datos abandonen la infraestructura propia.
- Prototipado rapido con Ollama o llama.cpp: al ser un GGUF con cuantizacion QAT oficial, se puede cargar directamente en herramientas de inferencia local para pruebas de concepto, sin pasos de conversion.
- Base para evaluacion comparativa de cuantizaciones: el repositorio documenta que la calificacion de calidad de Wekala esta pendiente, por lo que resulta util como artefacto de referencia en campanas de evaluacion pareada frente al BF16 en tareas de instruccion, conocimiento, matematicas, multilingue y tool use.
- Filtrado y clasificacion de contenido en lote: con un modelo de ~7.500 millones de parametros en 5 GB, es viable mantener varias instancias en una sola GPU para procesar volumenes moderados de texto con latencia controlada.

## Benchmarks y rendimiento

Los siguientes resultados los reporta el publicador del modelo fuente. No son mediciones de Wekala ni de este artefacto cuantizado, y no estan normalizados entre modelos: el harness, la precision, los ajustes de razonamiento y las versiones de tarea difieren.

| Benchmark | Puntuacion (%) | Modo / ajustes |
|---|---:|---|
| MMLU-Pro | 69,4 | publisher-default; protocolo de la fuente; no medido sobre esta cuantizacion |
| GPQA Diamond | 58,6 | publisher-default; protocolo de la fuente; no medido sobre esta cuantizacion |
| AIME 2026 (sin herramientas) | 42,5 | publisher-default; protocolo de la fuente; no medido sobre esta cuantizacion |
| LiveCodeBench v6 | 52 | publisher-default; protocolo de la fuente; no medido sobre esta cuantizacion |

No se han publicado en la informacion disponible resultados medidos sobre los ficheros Q4_0 de este repositorio, ni datos de latencia o throughput. La model card advierte explicitamente contra tratar estas cifras como una clasificacion normalizada entre modelos.

## Requisitos de hardware

- VRAM estimada (calculo a partir del tamano de fichero, no medido): ~5,2 GB solo para los pesos de texto en Q4_0; ~6,2 GB si se carga tambien el proyector multimodal BF16. Hay que anadir el estado de contexto (KV cache), buffers intermedios y margen del driver, por lo que en la practica el consumo es superior al tamano del fichero.
- La model card advierte que el ajuste por dispositivo es independiente del tamano de pesos y que la operacion sostenida en 8 GB de VRAM requiere perfiles medidos propios; no esta calificada.
- GPU recomendadas: no disponible. No se han publicado recomendaciones de GPU ni perfiles medidos. Por tamano, encajaria en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en aceleradores de datacenter tipo A100 o H100, pero esto es una estimacion por capacidad, no un dato verificado.
- CPU: soportada como backend de ejecucion para el mismo fichero de pesos. La model card aclara que CPU y CUDA son backends del mismo modelo, no modelos distintos.
- Movil y navegador: pendiente de calificacion; no se ha medido.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no se mencionan y, al distribuirse solo en GGUF, no son aplicables sin una conversion previa a safetensors.
- Latencia y throughput: no disponible.
- Nota de integracion: el repositorio es un "asset declarativo descargable"; no incluye instalacion automatica de backend.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar este artefacto con su propio modelo de origen y con la variante de pesos completa. No se aportan datos de otros modelos de la misma categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nile-academy/gemma-4-e4b-it-gguf (este) | 7.463.013.674 (safetensors); 7.996.156.490 en fuente | no disponible | GGUF Q4_0 + mmproj BF16 | apache-2.0 | espejo en HF, 0 descargas |
| google/gemma-4-E4B-it (origen) | 7.996.156.490 (incluye embeddings y modalidades) | no disponible | no indicado en la informacion | apache-2.0 | repositorio oficial del publicador |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja diferencial de este repositorio frente al modelo de origen es el tamano: 6,1 GB de repo y 5,155 GB de pesos Q4_0, aptos para hardware mas modesto. La desventaja es la ausencia de mediciones propias y el estado "not qualified" de la evaluacion de calidad de cuantizacion.

## Limitaciones y advertencias

- Calidad de cuantizacion no verificada: Wekala declara explicitamente "not qualified" y no formula ninguna afirmacion general de "sin perdida significativa de calidad". La afirmacion de calidad cercana a BF16 procede de Google y se atribuye por separado.
- Benchmarks no representativos de este artefacto: las cifras de MMLU-Pro, GPQA Diamond, AIME 2026 y LiveCodeBench v6 corresponden al modelo fuente segun el publicador, no a los ficheros Q4_0 de este repositorio.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en produccion.
- Idiomas no declarados: la ficha no enumera idiomas soportados, por lo que el rendimiento multilingue (incluido arabe, mencionado como tarea de evaluacion pendiente) es desconocido.
- Longitud de contexto desconocida: no se puede planificar el dimensionamiento de KV cache ni validar casos de contexto largo.
- Arquitectura no documentada: se desconoce si es densa o MoE, y por tanto como escalara el coste de inferencia con el lote y el contexto.
- Riesgo de alucinacion y salidas inseguras: la model card advierte de que el modelo puede producir salidas incorrectas o inseguras.
- Tool calling bajo control de la aplicacion: las llamadas a herramientas son propuestas que el consumidor debe validar contra sus permisos; no deben ejecutarse sin admision del controlador.
- Licencia: los pesos se rigen por Apache-2.0 segun lo declarado, pero el repositorio no concede derechos sobre el SDK de Wekala. Las tarjetas y avisos del publicador original se conservan en `provenance/`; conviene revisarlos antes de un uso comercial.
- Ajuste a dispositivo no garantizado: el tamano de pesos excluye estado de contexto, buffers y margen de driver; la operacion sostenida en 8 GB o en movil/navegador no esta calificada.
- Fechas: el repositorio figura creado y actualizado el 2026-10-19, sin historial de revisiones posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nile-academy/gemma-4-e4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Model card del origen (revision fijada): https://huggingface.co/google/gemma-4-E4B-it/blob/ee0ef6023621cff504d758262d4e04895a5af4a2/README.md
- Anuncio del publicador: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las entradas devueltas corresponden a entidades homonimas sin relacion (una consultora de asuntos publicos, la marca de ropa NILE y articulos enciclopedicos sobre el rio Nilo).
