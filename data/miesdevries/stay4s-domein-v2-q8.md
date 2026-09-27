# miesdevries/stay4s-domein-v2-q8

## Resumen

Stay4S Domein-v2 Agent Q8 es un modelo de lenguaje especializado en neerlandés, publicado por el desarrollador independiente miesdevries (Mitchell de Vries, Het Nieuwe Begin BV) bajo el paraguas del proyecto Stay4S, presentado como un ecosistema de IA europeo, autoalojado y orientado a la privacidad. Técnicamente no es un modelo entrenado desde cero: se trata de un ajuste fino mediante LoRA sobre el modelo base Qwen3-4B, una arquitectura transformer decoder-only densa de aproximadamente 4.000 millones de parámetros.

La model card indica que el adaptador se entrenó con 9.080 registros en neerlandés y que alcanza un 65 % de precisión en una evaluación cuyo conjunto de prueba y metodología no se especifican. La única variante publicada en el repositorio está cuantizada en Q8_0 y ocupa 4,3 GB, lo que la hace desplegable en GPU de consumo y en CPU mediante llama.cpp u Ollama.

Su relevancia es limitada y muy contextual: cubre el nicho de asistentes de dominio en neerlandés con despliegue soberano, pero el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, no incluye datos de benchmarks estándar y la licencia figura como "other" sin texto asociado, lo que dificulta su adopción en producción. Debe considerarse un artefacto experimental más que un modelo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B) con adaptador LoRA integrado |
| Parametros totales | ~4.000 millones (4B) en el modelo base; rango y dimension del adaptador LoRA no disponibles |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B soporta 32.768 tokens nativos (ampliables a 131.072 con YaRN) |
| Tipos de cuantizacion | Q8_0 (4,3 GB). El repositorio solo publica esta variante; no se ofrecen Q4_K_M, Q5_K_M ni FP16 |
| Idiomas soportados | Neerlandes (nl). El modelo base Qwen3 es multilingue, pero no se confirma que el adaptador conserve esas capacidades |
| Licencia | other (sin texto de licencia publicado); el modelo base Qwen3-4B se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (variante Q8_0). No se publican safetensors del adaptador |

## Arquitectura y entrenamiento

La model card es muy escueta en este apartado. Lo unico confirmado es que el modelo parte de Qwen3-4B, un transformer decoder-only denso de 4B parametros, y que se ha aplicado un ajuste fino con LoRA sobre un conjunto de 9.080 registros en neerlandes etiquetados como "domein" (dominio). No se indica el rango del adaptador, la tasa de aprendizaje, el numero de epocas, la composicion tematica del dataset ni si hubo fases posteriores de alineacion (RLHF, DPO o similares).

Tampoco se documenta si el ajuste preservo el modo de razonamiento ("thinking mode") que Qwen3-4B incorpora de fabrica, ni si se aplicaron tecnicas de preservacion de capacidades generales frente al olvido catastrofico. Dado el tamano reducido del conjunto de entrenamiento (9.080 ejemplos) frente a los 4B parametros del modelo base, el riesgo de sobreajuste al dominio es alto y la degradacion de capacidades generales (codigo, matematicas, multilingue) es esperable, aunque no hay datos publicados que lo cuantifiquen. No se describe ninguna innovacion tecnica adicional: ni decodificacion especulativa, ni atencion lineal, ni arquitecturas hibridas.

## Capacidades

- Generacion de texto en neerlandes orientada a un dominio concreto (el autor no detalla cual; la etiqueta "domein-expert" sugiere un vertical especifico no identificado).
- Respuesta a consultas dentro del dominio de entrenamiento con un 65 % de precision declarada por el autor sobre un conjunto de evaluacion no especificado.
- Despliegue como agente conversacional ("Agent" en el nombre del modelo), aunque no se documenta soporte explicito de tool calling ni de function calling.
- Integracion con Ollama mediante el comando `ollama run stay4s-lora`, lo que permite uso local sin conexion.
- Posible herencia de las capacidades del base Qwen3-4B (generacion de codigo, matematicas basicas, multilingue, modo de razonamiento): no confirmada tras el ajuste LoRA.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Atencion al cliente en neerlandes para un vertical concreto: el modelo puede gestionar conversaciones multi-turno dentro de su dominio de entrenamiento, con la ventaja de ejecutarse en local y no enviar datos personales a servicios de terceros, algo coherente con la propuesta de privacidad del proyecto Stay4S.
- Clasificacion y enrutado de consultas entrantes: dado su ajuste a un dominio especifico, puede emplearse como primer filtro para etiquetar tickets o mensajes en neerlandes antes de escalarlos a un modelo mayor.
- Extraccion de informacion estructurada de textos neerlandeses: por ejemplo, conversion de formularios o correspondencia en campos JSON, siempre que el esquema se valide a posteriori por el 65 % de precision declarado.
- Asistente interno autoalojado para pymes neerlandesas: al ocupar 4,3 GB en Q8_0, se puede desplegar en una estacion de trabajo con GPU de consumo o incluso en CPU, sin coste de API y con los datos bajo control de la organizacion.
- Generacion de borradores de documentacion o respuestas tipo en neerlandes: util como acelerador de redaccion para equipos que ya trabajan en el dominio cubierto, con revision humana obligatoria.
- Investigacion sobre ajuste fino eficiente: el repositorio sirve como ejemplo de pipeline LoRA + cuantizacion GGUF sobre Qwen3-4B, replicable para otros dominios e idiomas de bajos recursos.
- Prototipado rapido de chatbots sectoriales: gracias a la integracion con Ollama, un equipo puede levantar una demo funcional en minutos para validar el encaje del dominio antes de invertir en un modelo mayor.
- Filtrado previo en pipelines de datos: puede usarse para descartar o marcar contenido fuera de dominio en corpus neerlandeses, asumiendo su tasa de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag ni evaluaciones especificas de neerlandes) en la informacion disponible. El unico dato numerico aportado por el autor es el siguiente:

| Metrica | Valor | Nota |
|---|---|---|
| Precision declarada por el autor | 65 % | Conjunto de evaluacion, tamano de muestra y metodologia no especificados |
| MMLU | No disponible | No publicado |
| HumanEval | No disponible | No publicado |
| GSM8K | No disponible | No publicado |
| Evaluaciones en neerlandes (p. ej. DutchBench) | No disponible | No publicadas |

Ese 65 % debe interpretarse con cautela: sin conocer la linea base del modelo sin ajustar ni la dificultad del conjunto de prueba, no es posible determinar si el LoRA aporta mejora o degradacion.

## Requisitos de hardware

- VRAM para los pesos: 4,3 GB con cuantizacion Q8_0 (dato del autor).
- VRAM total estimada en inferencia (estimacion a partir de la arquitectura de Qwen3-4B, 36 capas y 8 cabezas KV con GQA): unos 6 GB con contexto corto (2-4k tokens), alrededor de 7-8 GB con 8k tokens y en torno a 10-11 GB con 32k tokens en FP16 para la cache KV.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 y equivalentes con 8 GB o mas (con 8 GB conviene limitar la ventana de contexto). Tambien cabe en GPUs integradas con memoria unificada (Apple Silicon a partir de 16 GB).
- GPU de centro de datos: no requiere A100 ni H100; una L4, T4 o A10 es mas que suficiente y permite mayor paralelismo por GPU.
- Inferencia en CPU: viable gracias al formato GGUF, con velocidades de decodificacion en el rango de pocos tokens por segundo en procesadores de escritorio modernos (no se han publicado mediciones concretas para este modelo).
- Opciones de despliegue: Ollama (via `ollama run stay4s-lora`), llama.cpp y derivados (LM Studio, Jan, koboldcpp). vLLM y TGI no estan confirmados para este artefacto; TGI no soporta GGUF y vLLM solo lo hace de forma experimental.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| stay4s-domein-v2-q8 | 4B + LoRA | No especificado (base: 32.768 nativos) | other (sin texto) | HuggingFace, 0 descargas, 0 likes | 65 % de precision declarada, benchmark sin especificar |
| Qwen3-4B (modelo base) | 4B densos | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente descargado | Benchmarks publicos por Qwen; no reproducidos aqui |
| Qwen3-4B-Instruct-2507 | 4B densos | 262.144 tokens | Apache 2.0 | HuggingFace | Benchmarks publicos por Qwen; no reproducidos aqui |
| Modelos especializados en neerlandes (p. ej. familia GEITje) | 7B y otros | No disponible | No disponible | HuggingFace | No disponible |

La comparacion directa con alternativas neerlandesas no puede completarse con la informacion proporcionada: no se dispone de datos verificados de parametros, contexto, licencia ni rendimiento de esos modelos en este contexto, por lo que se marcan como no disponibles en lugar de estimarlos.

## Limitaciones y advertencias

- Precision del 65 %: insuficiente para la mayoria de flujos de produccion sin supervision humana o validacion automatica posterior. El autor no especifica como se midio.
- Sesgos conocidos: no documentados. El entrenamiento se limita a 9.080 registros neerlandeses de origen desconocido, por lo que los sesgos del dataset (geograficos, culturales, de dominio) son indeterminados.
- Riesgo de alucinacion: alto en un modelo de 4B ajustado con LoRA sobre un dataset pequeno; no se ha publicado ningun proceso de mitigacion (RLHF, DPO, verificacion factual).
- Olvido catastrofico: el ajuste LoRA puede haber degradado capacidades generales del base Qwen3-4B (codigo, matematicas, idiomas distintos del neerlandes). No hay evaluaciones que lo confirmen o descarten.
- Alcance linguistico restringido: la model card declara unicamente neerlandes. El uso en castellano, ingles u otros idiomas no esta soportado ni evaluado.
- Contexto no especificado: se desconoce si el ajuste o la configuracion de despliegue conservan los 32.768 tokens nativos del base. Conviene validar el comportamiento en contextos largos antes de confiar en ellos.
- Licencia ambigua: figura como "other" sin texto de licencia publicado. Esto impide determinar si el uso comercial esta permitido, si hay obligaciones de atribucion o si existen restricciones derivadas del modelo base. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Falta de validacion externa: 0 descargas y 0 likes, sin issues ni discusiones publicas. No hay evidencia de terceros que hayan reproducido los resultados.
- Metadatos cuestionables: las fechas de creacion y actualizacion indican 2026, posteriores a la fecha esperada de publicacion, lo que sugiere un posible error en los metadatos del repositorio.
- Un solo formato y una sola cuantizacion: no se ofrecen pesos en safetensors ni variantes de menor precision, lo que limita el ajuste fino posterior y el despliegue en hardware muy restringido.
- Ausencia de documentacion sobre tool calling y modo agente: el nombre del modelo incluye "Agent", pero no se documenta soporte real de function calling ni de razonamiento multi-paso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/miesdevries/stay4s-domein-v2-q8
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Sitio web del proyecto Stay4S: https://www.stay4s.com/
- Perfil de GitHub del autor: https://github.com/miesdevries
- Repositorio GitHub del proyecto (Stay4s-grokrom): https://github.com/miesdevries/Stay4s-grokrom/tree/main
- Organizacion en GitHub Het Nieuwe Begin BV: https://github.com/hetnieuwebeginbv-glitch
- Paper o informe tecnico del modelo: no disponible
- Demo publica: no disponible
- Repositorio del adaptador LoRA en safetensors: no disponible
