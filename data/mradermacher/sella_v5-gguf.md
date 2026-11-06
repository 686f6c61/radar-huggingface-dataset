# mradermacher/sella_v5-GGUF

## Resumen

`sella_v5-GGUF` es la distribucion en formato GGUF del modelo `Sela223/sella_v5`, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. El modelo original es un transformer de aproximadamente 1.720 millones de parametros (1,72 B), orientado a uso conversacional y etiquetado para el idioma ingles. Esta version GGUF resuelve el problema de ejecutar el modelo en hardware de consumo mediante cuantizaciones de 2 a 16 bits, ademas de incluir un suplemento multimodal (`mmproj`) que sugiere capacidades de vision en el modelo base.

La relevancia de esta ficha radica en que el repositorio original no aporta informacion publica sustancial sobre arquitectura, entrenamiento o benchmarks: la model card de la version GGUF se limita a listar las cuantizaciones disponibles y a remitir a la pagina del modelo base. Por tanto, muchos campos tecnicos deben marcarse como "no disponible". Aun asi, el conjunto de cuantizaciones publicado (desde Q2_K de 0,9 GB hasta f16 de 3,5 GB) permite desplegar el modelo en GPUs consumer de gama media y en CPU, lo que lo hace util para prototipado local y pruebas de conversacion en ingles.

El modelo se distribuye bajo licencia no especificada, con 38 descargas y sin likes en el momento de la consulta, lo que indica una adopcion muy limitada y ausencia de validacion comunitaria. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que no hay datos publicados de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 1.720.028.160 (1,72 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base `Sela223/sella_v5` mas alla de su naturaleza transformer y su tamano de 1,72 B de parametros. El repositorio GGUF no incluye detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion, tipo de tokenizador ni estrategia de posicionamiento. La presencia de ficheros `mmproj` (proyeccion multimodal) indica que el modelo base incorpora algun modulo de vision, pero no se especifica que codificador visual utiliza ni como se integra con el transformer de lenguaje.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. No consta informacion sobre decodificacion especulativa, atencion lineal u otras innovaciones tecnicas. Toda esta seccion debe considerarse no disponible y requeriria consultar la model card original de `Sela223/sella_v5`, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: la presencia de ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` sugiere soporte de entrada de imagenes, aunque no se detalla el alcance.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, etc.), gracias al formato GGUF.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, modo thinking ni otras capacidades avanzadas.
- Capacidades multilingues limitadas al ingles segun los metadatos del autor.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: con 1,72 B de parametros y cuantizaciones de 1,2 GB (Q4_K_M), el modelo puede ejecutarse en un portatil con GPU integrada para validar flujos de chat antes de migrar a modelos mayores.
- Pruebas de pipelines multimodales: el suplemento `mmproj` permite experimentar con entrada de imagenes en local, util para validar arquitecturas de aplicaciones de vision-lenguaje sin coste de API.
- Educacion e investigacion: sirve como caso de estudio de cuantizacion GGUF y de comparacion de calidad entre tipos de quant (Q2_K frente a Q8_0) en un modelo de tamano manejable.
- Despliegue en entornos con recursos limitados: la version Q2_K (0,9 GB) cabe en dispositivos con poca memoria, adecuada para demos en Raspberry Pi o contenedores ligeros.
- Generacion de texto offline: al no requerir conexion, puede integrarse en aplicaciones de escritorio que necesiten respuestas conversacionales sin enviar datos a la nube.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de perplejidad entre Q4_K_S, Q6_K y Q8_0 en un modelo pequeno antes de aplicar la misma estrategia a modelos mayores.
- Fine-tuning o experimentacion con el modelo base: al estar disponible en safetensors (1,72 B), puede servir de punto de partida para ajustes en ingles con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K, 1,2-1,4 GB con Q4_K_M o Q5_K_M, 1,9 GB con Q8_0 y 3,5 GB con f16 (mas overhead de contexto y del proyector multimodal si se usa).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar las cuantizaciones Q4-Q8 con comodidad; para f16 se recomienda 6 GB o mas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en GPUs integradas con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la cuantizacion, aunque por tamano se espera decodificacion en tiempo real en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sella_v5-GGUF | 1,72 B | no disponible | no disponible | GGUF | Multimodal segun mmproj; solo ingles |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicos |
| Llama-3.2-1B-Instruct | 1,24 B | 131 072 tokens | Llama 3.2 Community License | safetensors, GGUF | Multilingue, contexto largo |
| SmolLM2-1.7B-Instruct | 1,71 B | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Solo texto, benchmarks publicos |

La comparativa se basa en datos publicos de los modelos alternativos; para `sella_v5` no hay datos de rendimiento que permitan una comparacion cuantitativa. La principal desventaja frente a las alternativas es la ausencia de licencia clara, benchmarks y contexto documentado.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse el permiso para uso comercial; debe contactarse con el autor original antes de cualquier despliegue productivo.
- Ausencia total de benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni otras tareas, lo que impide comparar con alternativas.
- Solo ingles: no se documenta soporte de castellano ni de otros idiomas, por lo que su uso en espanol producira resultados probablemente deficientes.
- Riesgo de alucinacion: inherente a modelos de este tamano y sin datos de alineacion publicados; no se recomienda para tareas de alta precision sin verificacion.
- Adopcion muy baja (38 descargas, 0 likes): no hay validacion comunitaria, reportes de errores ni casos de exito documentados.
- Contexto desconocido: al no publicarse la longitud de ventana, no puede planificarse su uso en tareas de contexto largo.
- Capacidad multimodal no documentada: la presencia de `mmproj` no garantiza un rendimiento util en tareas de vision; requeriria pruebas propias.
- Modelo base no auditado: no hay informacion sobre sesgos, datos de entrenamiento ni filtros de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sella_v5-GGUF
- Modelo base: https://huggingface.co/Sela223/sella_v5
- Pagina de descargas del autor: https://hf.tst.eu/model#sella_v5-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de comparacion de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
