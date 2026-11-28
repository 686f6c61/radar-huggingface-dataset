# Rebine/Etsu-Embedding-0.8B-Memory

## Resumen
Etsu-Embedding-0.8B-Memory es un modelo de embeddings de texto desarrollado por Rebine, obtenido por ajuste fino del modelo base Qwen/Qwen3.5-0.8B-Base. Su proposito es la recuperacion semantica de memoria de agentes y dominios afines (bases de conocimiento personal, archivos de conversacion, documentacion tecnica), operando sobre consultas cortas y preguntas naturales en chino e ingles. Con 752 millones de parametros y 1024 dimensiones de salida, se posiciona como un especialista de dominio dentro de la familia Etsu.

Arquitectonicamente hereda el diseno hibrido de Qwen3.5: 24 capas, de las cuales 18 son de atencion lineal y 6 de atencion completa, con un tamano oculto de 1024 y un vocabulario de 248.320 tokens. La longitud de contexto es de 2048 tokens y la salida emplea last-token pooling con normalizacion L2, compatible con truncamiento Matryoshka en 128, 256, 512, 768 y 1024 dimensiones.

Su relevancia actual radica en que cubre un nicho concreto: la recuperacion de memoria en sistemas de agentes, donde los corpus son heterogeneos y las consultas mezclan palabras clave con lenguaje natural. Se distribuye bajo licencia Apache-2.0 y coexiste con la version anterior Rebine/Etsu-Embedding-0.8B, que conserva mejor rendimiento en tareas de memoria conversacional de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid text model (18 capas de atencion lineal + 6 de atencion completa) |
| Parametros totales | 752.393.024 (752M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B-Base y conserva su arquitectura hibrida de transformer con mezcla de atencion lineal y atencion completa: 24 capas en total, 18 lineales y 6 completas, con hidden size de 1024, intermediate size de 3584 y vocabulario de 248.320 tokens. La cabeza de embeddings produce vectores de 1024 dimensiones mediante last-token pooling (ultima posicion no-pad de la attention mask) seguido de normalizacion L2; el truncamiento Matryoshka se aplica antes de la normalizacion final. El protocolo de codificacion exige right padding para que el ultimo token no-pad coincida con el final real del texto, y anade el prefijo de instruccion solo a las consultas, no a los pasajes.

El ajuste fino se realizo sobre un corpus de memoria de agentes de 7.938 chunks, construido a partir de una instantanea original de 7.275 chunks mas 663 chunks nuevos de octubre de 2026 incorporados exclusivamente para la evaluacion golden_v3, tras eliminar 110 duplicados exactos. El corpus se agrupo con KMeans (k = 20) sobre embeddings de documento de Qwen3-Embedding-0.6B, los clusters se nombraron con un LLM y se fusionaron en seis dominios: configuracion y operaciones de agentes (3.050 chunks), memoria y dreaming (1.715), role-play y persona (1.181), chit-chat y logs (827), noticias, deportes y meteorologia (624) y documentacion de proyecto y blog (541). La evaluacion golden_v3 consta de 118 consultas asignadas a traves de sus chunks de respuesta. No se documentan en la informacion disponible fases de RLHF o DPO ni el volumen total de tokens de entrenamiento.

## Capacidades
- Generacion de embeddings de texto para similitud semantica, recuperacion de informacion y busqueda de pasajes.
- Recuperacion de memoria de agentes: disenado especificamente para consultar almacenes de memoria de agentes y archivos de conversacion.
- Soporte bilingue chino-ingles en consultas y pasajes.
- Manejo de consultas cortas por palabra clave y de preguntas en lenguaje natural dentro del mismo espacio vectorial.
- Dimensiones Matryoshka (MRL) de 128, 256, 512, 768 y 1024, lo que permite reducir coste de almacenamiento y latencia de busqueda con perdida controlada de calidad.
- Compatibilidad con el pipeline feature-extraction de transformers y con endpoints compatibles.
- No soporta tool calling, function calling, agentes multi-paso ni modos de razonamiento: es un modelo de embeddings, no generativo.
- No dispone de capacidades de vision ni audio.

## Casos de uso
- Recuperacion de memoria en agentes conversacionales: el modelo indexa resumenes de sesion, fragmentos de memoria consolidada y notas de promocion, y recupera los pasajes relevantes ante la consulta del agente; su entrenamiento sobre 1.715 chunks de memoria y dreaming lo hace adecuado para este dominio concreto.
- Bases de conocimiento personal: indexacion de notas, articulos y documentacion propia en 1024 dimensiones (o 256/512 con MRL) para busqueda semantica local; el contexto de 2048 tokens cubre la mayoria de fragmentos de notas.
- Archivo y busqueda de historiales de conversacion: recuperacion de turnos previos o resumenes de sesion por similitud semantica, util en asistentes que necesitan recordar interacciones pasadas.
- Documentacion tecnica y blogs: busqueda sobre informes de diseno, derivaciones y entradas de blog (541 chunks en el corpus de entrenamiento) con consultas en lenguaje natural o palabras clave.
- Asistencia a operaciones de agentes: recuperacion de procedimientos de configuracion de modelos y gateways, llamadas a API, fallbacks, despliegue local de embeddings y resolucion de problemas de proxy a partir de una base de runbooks.
- Deduplicacion y agrupamiento semantico de registros: uso de los embeddings para detectar pasajes duplicados o casi duplicados en almacenes de memoria, como se hizo al eliminar 110 duplicados exactos del corpus.
- Busqueda multilingue zh-en en productos con usuarios de ambos idiomas, gracias al espacio vectorial compartido entrenado sobre corpus bilingues.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la evaluacion interna golden_v3 (118 consultas, 99 originales y 18 nuevas) y afirma que esta version es mas fuerte en el dominio objetivo y en 8 tareas de recuperacion en chino, mientras que la release anterior rinde mejor en LoCoMo en/zh, pero no se incluyen cifras numericas de dichas evaluaciones.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 1,5 GB para los pesos (752M parametros), mas overhead de activaciones y tokenizador; en la practica cabe holgadamente en GPUs de 4 GB o mas.
- En FP16/BF16 puede ejecutarse en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas; en GPUs consumer de gama baja (8 GB) el margen es amplio.
- Cuantizacion a 8 bits o 4 bits reduciria el peso a menos de 1 GB, aunque el autor no publica variantes cuantizadas ni recetas oficiales.
- Despliegue: transformers con AutoModel y AutoTokenizer (metodo documentado en la model card); al no ser un paquete sentence-transformers con wrapper de pooling, hay que implementar manualmente el last-token pooling y el prefijo de consulta. Es compatible con endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. El contexto de 2048 tokens y el tamano de 752M sugieren un coste de codificacion bajo por lote, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Etsu-Embedding-0.8B-Memory | 752M | 2048 | 1024 (MRL 128-1024) | zh, en | Apache-2.0 | Especialista en memoria de agentes; mejor en dominio y 8 tareas de retrieval en chino |
| Etsu-Embedding-0.8B | 752M | no disponible | no disponible | zh, en | Apache-2.0 | Mismo base y protocolo; mejor en LoCoMo en/zh (memoria conversacional de contexto largo) |
| Qwen3-Embedding-0.6B | 0,6B | no disponible | no disponible | multilingue | no disponible | Usado por el autor para clustering del corpus; no es un competidor directo documentado en la ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo exclusivamente de embeddings: no genera texto ni soporta razonamiento, tool calling o agentes; no debe usarse como LLM.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en otros idiomas no esta documentado.
- Ventana de contexto de solo 2048 tokens: los pasajes o consultas mas largos se truncan, lo que puede degradar la recuperacion en documentos extensos.
- Requiere seguir estrictamente el protocolo de codificacion (prefijo de instruccion solo en consultas, right padding, last-token pooling, normalizacion L2); desviarse de el altera la calidad de los embeddings.
- No es un paquete sentence-transformers con wrapper de pooling; la integracion en pipelines existentes requiere codigo propio.
- El corpus de entrenamiento es pequeno (7.938 chunks) y muy especifico de un unico almacen de memoria de agente, lo que puede introducir sesgos de dominio y reducir la generalizacion fuera de ese tipo de contenido.
- Riesgo de sesgos derivados de los datos de entrenamiento (conversaciones, role-play, noticias) no evaluado en la informacion disponible.
- No se documentan evaluaciones de robustez, alucinacion (en el sentido de recuperaciones irrelevantes) ni comportamiento en produccion a gran escala.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-0.8B-Base enlazada en la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Rebine/Etsu-Embedding-0.8B-Memory
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Release hermana: https://huggingface.co/Rebine/Etsu-Embedding-0.8B
- Articulo en chino sobre el modelo: https://cks114.top/index.php/archives/253/
