# clarezahermetica/landling-3.0-cp1

## Resumen

Landling 3.0 cp1 (`clarezahermetica/landling-3.0-cp1`) es un adaptador LoRA de tipo PEFT construido sobre `Qwen/Qwen2.5-3B-Instruct` y publicado como checkpoint de desarrollo. No se trata de un modelo completo: el repositorio contiene únicamente el adaptador en safetensors, los ficheros del tokenizador, la plantilla de chat, metadatos de entrenamiento y la trazabilidad del proceso. Los pesos del modelo base no se distribuyen aquí, por lo que para ejecutarlo es necesario descargar Qwen2.5-3B-Instruct por separado y cargar el adaptador con la librería `peft`.

El entrenamiento consistió en una adaptación LoRA de una sola época sobre 1.004 ejemplos conversacionales supervisados, con rango 16, alpha 32 y dropout 0,05, aplicada a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La selección del adaptador se hizo mediante una comparación ciega contra un adaptador interno previo sobre 24 casos, con un resultado de 7 a 5 en los 12 juicios decisivos (11-8 si se incluyen los juicios de inclinación tentativa, con 5 casos sin resolver). El propio autor califica esta evaluación como cualitativa y no estandarizada.

Su relevancia es acotada y de nicho: se publica como registro versionado de una generación de modelos (3.0), con un runtime local que combina el adaptador con un proyecto de recuperación (`raft`) sobre 172 documentos, 297 fragmentos y 1.193 entradas embebidas, incluyendo 22 entradas de Substack de Nick Land / Zero Philosophy como material de anclaje. Ese corpus de recuperación no forma parte del checkpoint, de modo que cargar el adaptador de forma aislada evalúa solo el comportamiento conversacional aprendido, sin el contexto externo que usaba el sistema completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-3B-Instruct) con adaptación LoRA/PEFT |
| Parametros totales | No disponible para el adaptador; ~3.090 millones en el modelo base (dato del config público de Qwen2.5-3B-Instruct, no de la model card del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en este repositorio (solo adaptador en safetensors). El modelo base dispone de variantes GPTQ, AWQ y GGUF publicadas por separado |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 declara soporte multilingüe (29 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA). El repositorio no incluye los pesos del modelo base |
| Libreria | peft |
| Pipeline | text-generation |
| Rango LoRA / alpha / dropout | 16 / 32 / 0,05 |
| Modulos objetivo del adaptador | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Datos de entrenamiento | 1.004 ejemplos conversacionales supervisados, 1 época |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only de Qwen2.5-3B-Instruct, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Sobre esa base se aplica una adaptación de bajo rango (LoRA) de rango 16 y alpha 32 con dropout 0,05, distribuida en los siete módulos de proyección indicados, lo que cubre tanto los bloques de atención como el MLP. El resultado es un artefacto PEFT que se carga en memoria junto al modelo base en precisión bf16 o fp16, tal y como muestra el ejemplo de carga de la model card (`PeftModel.from_pretrained`).

El entrenamiento se limita a una época sobre 1.004 ejemplos conversacionales supervisados. No se documenta en la información disponible el número total de tokens, la composición detallada del dataset, ni el uso de RLHF, DPO u otra etapa de alineación posterior al ajuste supervisado. La innovación declarada no es arquitectónica, sino de flujo de trabajo: el pipeline se apoya en dos herramientas del mismo autor, `lumpenspace/raft` (estructura de proyecto, datos conversacionales, memorias y recuperación) y `lumpenspace/opbdh` (generación del job de ajuste fino y ejecución remota en GPU). La selección del adaptador se realizó mediante comparación ciega de 24 casos contra el adaptador interno anterior, con decodificación determinista y `max_new_tokens=96` en el runtime verificado, y un mensaje de sistema fijo: "You are the Landling. Respond to the conversation in your characteristic voice."

## Capacidades

- Generación de texto conversacional multi-turno en el estilo característico definido por el mensaje de sistema del autor.
- Ajuste de voz y estilo conversacional respecto al comportamiento por defecto de Qwen2.5-3B-Instruct, que es el objetivo declarado de la adaptación.
- Herencia de las capacidades del modelo base (razonamiento básico, código, matemáticas elementales, resumen y reescritura), aunque no cuantificadas para este adaptador.
- Capacidad multilingüe no verificada: la model card no declara idiomas y no se han publicado evaluaciones al respecto.
- Soporte de tool calling / function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el runtime verificado usa decodificación determinista con un límite de 96 tokens nuevos.
- Capacidades especiales (modo de pensamiento explícito, visión, audio): no disponibles.
- Integración con una capa de recuperación externa (Raft) en el runtime completo: 172 documentos, 297 fragmentos y 1.193 entradas embebidas, con 22 entradas de Substack como anclaje. Esta capa no está incluida en el checkpoint público.

## Casos de uso

- Exploración de estilo conversacional: cargar el adaptador sobre Qwen2.5-3B-Instruct permite reproducir la voz entrenada con 1.004 ejemplos y evaluar si el ajuste de estilo es el deseado antes de invertir en un entrenamiento mayor.
- Reproducción de investigación en ajuste fino ligero: el repositorio conserva metadatos de entrenamiento, rangos, módulos objetivo y plantilla de chat, lo que sirve como caso de estudio reproducible de una adaptación LoRA de una época sobre un modelo de 3B.
- Base para un sistema RAG propio: el patrón descrito (adaptador más proyecto de recuperación con documentos, fragmentos y embeddings) es reutilizable para construir asistentes anclados a un corpus documental concreto.
- Prototipado en hardware de consumo: al apoyarse en un modelo de ~3B, el conjunto base más adaptador se puede ejecutar en una GPU de gama media, lo que permite iterar sobre la plantilla de chat y el mensaje de sistema sin clúster.
- Pruebas de evaluación cualitativa por comparación ciega: el método empleado (24 casos, juicios decisivos y tentativos, decodificación determinista) es directamente replicable como protocolo interno de selección de variantes.
- Generación de diálogo con contexto largo: si se usa el modelo base con su ventana nativa de 32.768 tokens, el adaptador puede emplearse en conversaciones extensas o en tareas de resumen de documentos largos, siempre que se valide el comportamiento del adaptador en esa longitud.
- Docencia y divulgación técnica: como ejemplo de artefacto PEFT mínimo (0,1 GB) para explicar la diferencia entre adaptador y modelo completo, y los riesgos de evaluar un adaptador sin su capa de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El único dato comparativo es la evaluación interna cualitativa de selección de adaptador, que se reproduce a continuación tal y como aparece en la model card.

| Evaluacion | Comparacion | Resultado |
|---|---|---|
| Comparacion ciega de 24 casos, juicios decisivos | Adaptador de produccion frente al adaptador interno previo | 7-5 (12 juicios decisivos) |
| Comparacion ciega de 24 casos, incluyendo juicios tentativos | Adaptador de produccion frente al adaptador interno previo | 11-8, con 5 casos sin resolver |

El autor indica expresamente que se trata de una evaluación cualitativa de desarrollo y no de un benchmark estandarizado.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB, pero requiere descargar por separado Qwen2.5-3B-Instruct (~6 GB en bf16).
- VRAM estimada para el conjunto base más adaptador: en bf16/fp16 en torno a 6-7 GB solo de pesos, con 8-10 GB recomendables contando caché KV y overhead; en cuantización de 8 bits, aproximadamente 3,5-4 GB; en 4 bits (GPTQ, AWQ o GGUF Q4), aproximadamente 2-2,5 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con holgura en 4 bits; en 16 GB también en bf16 con contextos moderados. En Apple Silicon con 16 GB de memoria unificada es viable en 4-8 bits.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia de un modelo de 3B, salvo para servir muchas réplicas concurrentes o para reentrenar el adaptador.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. El runtime verificado usó decodificación determinista con `max_new_tokens=96`, pero no se publican medidas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| landling-3.0-cp1 (este) | Adaptador LoRA sobre base de ~3,09B | No especificado (base: 32.768 tokens) | safetensors (PEFT) | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | ~3,09B | 32.768 tokens, ampliable a 131.072 con YaRN | safetensors, GPTQ, AWQ, GGUF | Apache 2.0 (segun la ficha del modelo base) | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2B | 131.072 tokens | safetensors, GGUF | Licencia comunitaria de Llama 3.2 | HuggingFace |
| microsoft/Phi-3.5-mini-instruct | ~3,8B | 131.072 tokens | safetensors, GGUF | MIT | HuggingFace |

La comparación directa de rendimiento con estas alternativas no es posible: no hay benchmarks publicados para el adaptador y su evaluación se limita a una comparación interna de 24 casos. Además, este repositorio no distribuye pesos completos, por lo que no es un sustituto autónomo de los modelos de la tabla.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial del adaptador queda en una situación jurídica indeterminada. La licencia del modelo base (Apache 2.0 según su ficha pública) no cubre automáticamente el adaptador derivado.
- Checkpoint de desarrollo: el autor lo describe como experimental y dependiente del contexto, y lo etiqueta explícitamente como `development-checkpoint`, no como versión final.
- Inferencia sin recuperación: cargar solo el adaptador omite la capa Raft (172 documentos, 297 fragmentos, 1.193 entradas embebidas) con la que se evaluó el sistema completo, por lo que el comportamiento observado puede diferir sustancialmente del runtime original.
- Sesgo temático y de estilo: el material de anclaje incluye 22 entradas de Substack de Nick Land / Zero Philosophy, lo que puede introducir un sesgo de vocabulario, registro y encuadre en las respuestas.
- Riesgo de sobreajuste: 1.004 ejemplos y una sola época sobre rango 16 es un volumen reducido; es esperable un ajuste de estilo marcado y posibles derivas de contenido, con el consiguiente riesgo de alucinación en dominios no cubiertos.
- Evaluación insuficiente: la selección se basó en 24 casos juzgados cualitativamente, con 5 casos sin resolver; no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada.
- Contexto implícito no replicable: el autor advierte que las conversaciones de origen contienen un contexto social y temático implícito considerable, difícil de reconstruir a partir del adaptador aislado.
- Idiomas no declarados: no hay confirmación de calidad multilingüe para el adaptador, aunque el modelo base sí declara soporte multilingüe.
- Configuración de referencia limitada: el runtime verificado usó decodificación determinista y `max_new_tokens=96`; no se documenta comportamiento con muestreo, temperaturas altas o generaciones largas.
- Trazabilidad de versiones: los sufijos `-cpN` identifican checkpoints públicos preservados y no pasos de entrenador; un checkpoint sin sufijo denota una versión formal, lo que conviene tener en cuenta al fijar dependencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clarezahermetica/landling-3.0-cp1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de recuperación Raft: https://github.com/lumpenspace/raft
- Repositorio de flujo de entrenamiento y ejecución remota OPBDH: https://github.com/lumpenspace/opbdh
- Paper, blog o demo del modelo: no disponible en la información proporcionada. Los resultados de búsqueda web obtenidos no guardan relación con el modelo y se han descartado.
