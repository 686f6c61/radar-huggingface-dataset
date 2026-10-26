# boyanbiji/Qwen3.5-4B-DR-SFT-1k

## Resumen

Qwen3.5-4B-DR-SFT-1k es un ajuste fino por SFT de parametros completos sobre Qwen3.5-4B, el modelo denso de 4B de la familia Qwen3.5 con base vision-lenguaje unificada. Lo publica boyanbiji (Boyan Li) en HuggingFace bajo licencia Apache 2.0, con 4.539.265.536 parametros reales en safetensors y un repositorio de 9,1 GB. El objetivo no es un asistente generalista, sino un agente de investigacion profunda (deep research) capaz de encadenar llamadas a herramientas de busqueda y visita web en multiples turnos y cerrar con un informe extenso con citas.

El entrenamiento usa 1.259 trayectorias de investigacion larga (mas 50 de validacion) que suman 68,7 M tokens y llegan a 131.072 tokens por fila. Las trayectorias se generaron con un profesor mucho mayor, Qwen3.5-122B-A10B en un arnes de lookahead, y los informes se revisaron por rubrica y se validaron en formato de citas sin violaciones estrictas. El resultado es un modelo pequeno, desplegable en una sola GPU de consumo, especializado en un flujo de trabajo concreto: buscar, visitar, sintetizar y citar.

Su relevancia practica esta en el coste: reproduce parte del comportamiento de un agente de investigacion de un modelo de 122B con 4,5B de parametros. En la evaluacion publicada con ResearchRubrics (101 preguntas) sube de 0,4351 a 0,4863 respecto al base, con una t pareada de 3,83. La contrapartida es que solo se publican 101 preguntas de evaluacion y que la perdida de validacion minima aparece tras la primera epoca, por lo que el checkpoint publicado (paso 117, fin de la epoca 3) no es necesariamente el mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen3.5, con base vision-lenguaje unificada (entrada image-text-to-text); ajuste fino por SFT de parametros completos |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible de forma explicita en la informacion proporcionada; los datos de entrenamiento llegan a 131.072 tokens por fila, lo que implica soporte de al menos esa longitud en el modelo base |
| Tipos de cuantizacion | No disponible en la model card; el repositorio solo publica pesos en safetensors. Al ser un modelo de 4,54 B es convertible a 8 bits y 4 bits (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible (la etiqueta de idiomas del repositorio esta vacia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 9,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B: un transformer decoder denso con entrenamiento de fusion temprana sobre tokens multimodales, lo que le da capacidades de comprension de imagen y texto en el mismo modelo. El ajuste fino es de parametros completos (full-parameter SFT), no LoRA, ejecutado con FSDP2 sobre 2 GPU H200 con paralelismo de secuencia 2. Hiperparametros: batch global 32, learning rate 1e-5, 3 epocas y 117 pasos totales; la subida corresponde al checkpoint final.

Los datos son 1.259 filas de entrenamiento (68,7 M tokens, maximo 131.072 tokens por fila) y 50 filas de validacion, repartidas en 444 filas del conjunto `quest-lookahead1-qwen122b-revised-v1` y 815 de `quest-ev10k-lookahead-revised-v1`. El profesor es Qwen3.5-122B-A10B corriendo en un arnes de lookahead: en cada trayectoria el agente llama a herramientas de busqueda y visita en varios turnos y despues redacta un informe con citas. Los informes se revisaron por rubrica y se pasaron por un control de formato estricto (0 violaciones de formato de cita). No se documenta RLHF, DPO ni ninguna fase de alineacion adicional sobre el modelo base.

La innovacion tecnica esta en el pipeline de destilacion de trayectorias largas de agente, no en la arquitectura: se traslada el patron de uso de herramientas y de redaccion citada de un MoE de 122B a un denso de 4,5B mediante SFT supervisado sobre secuencias de hasta 131k tokens.

## Capacidades

- Investigacion profunda multi-turno: planificacion de consultas, llamadas a herramientas de busqueda y visita y sintesis final en un unico flujo.
- Tool calling / function calling orientado a agentes (herramientas de search y visit, tal como aparecen en las trayectorias de entrenamiento).
- Generacion de informes largos con citas en formato controlado; el entrenamiento verifico explicitamente el formato de cita.
- Razonamiento multi-paso y descomposicion de preguntas de investigacion.
- Procesamiento de imagen y texto (pipeline image-text-to-text heredado del modelo base Qwen3.5).
- Conversacional multi-turno con contexto largo (hasta 131.072 tokens por muestra en entrenamiento).
- Capacidades multilingues: no disponibles / no documentadas para este ajuste.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de investigacion profunda autoalojados: el modelo encadena busquedas y visitas web y produce un informe final con citas, lo que permite montar un "deep research" propio sin depender de APIs de modelos de 100B+.
- Generacion de informes de mercado o competitivos: dada una pregunta y acceso a fuentes, el modelo itera consultas y entrega un documento citado y estructurado listo para revision editorial.
- Revision bibliografica asistida: con un buscador sobre un corpus interno (papers, documentacion), el agente recupera, visita y sintetiza fuentes manteniendo trazabilidad de citas.
- Enriquecimiento de bases de conocimiento: extraccion y contraste de datos desde multiples paginas para poblar fichas o tablas, con el informe citado como artefacto intermedio auditable.
- Sustitucion de un modelo grande como generador de trayectorias: al ser Apache 2.0 y de 4,5B, sirve para producir datos de agente a bajo coste o como modelo explorador antes de escalar a un modelo mayor.
- Despliegue en infraestructura propia con requisitos de privacidad: al caber en una GPU de 24 GB, permite procesar consultas sobre fuentes internas sin enviar datos a terceros.
- Prototipado rapido de pipelines ReAct: el formato de entrenamiento es compatible con arneses tipo react, lo que reduce el trabajo de adaptacion de prompts y parsers.
- Evaluacion comparativa de estrategias de investigacion: util como linea base pequena y reproducible frente a variantes del mismo autor (2.5k, 5k, 8k).

## Benchmarks y rendimiento

Unica evaluacion publicada: ResearchRubrics, 101 preguntas, arnes react, `presence_penalty` 0, `max_tokens` 16384, corregido por un juez LLM identico para ambas filas.

| Modelo | ResearchRubrics (101 preguntas) |
|---|---|
| Qwen3.5-4B (base) | 0,4351 |
| Qwen3.5-4B-DR-SFT-1k | 0,4863 |
| Diferencia | +0,051 (t pareada = 3,83) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 4,54 B de parametros: en bf16/fp16 unos 9,1 GB solo de pesos, con 12-14 GB reales contando activaciones y cache KV para contextos moderados; la cache KV crece de forma apreciable con contextos de 128k.
- En 8 bits: aproximadamente 4,8-5 GB de pesos. En 4 bits (GGUF Q4, AWQ o GPTQ): aproximadamente 2,7-3 GB de pesos.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB o L40S para lotes concurrentes y contextos largos; el entrenamiento documentado uso 2x H200.
- Cabe en GPU de consumo: si. RTX 4090 o RTX 3090 (24 GB) en bf16 sin problema; RTX 4080 / 4060 Ti de 16 GB en bf16 con contexto contenido o en 8 bits; tarjetas de 8 GB solo en 4 bits y con ventanas cortas.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI si la arquitectura `qwen3_5` esta soportada por la version correspondiente, y llama.cpp / Ollama previa conversion a GGUF (el base existe ya como `qwen3.5:4b` en Ollama, pero este ajuste requiere convertir los pesos).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ResearchRubrics | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-DR-SFT-1k | 4,54 B (denso) | al menos 131.072 tokens (segun datos de entrenamiento) | 0,4863 | Apache 2.0 | Pesos en HF, safetensors |
| Qwen3.5-4B (base) | ~4 B (denso) | no disponible | 0,4351 | Apache 2.0 | Pesos en HF, Ollama (`qwen3.5:4b`) |
| Qwen3.5-4B-DR-SFT-2.5k | mismo base | no disponible | no disponible | Apache 2.0 | Pesos en HF |
| Qwen3.5-4B-DR-SFT-5k | mismo base | no disponible | no disponible | Apache 2.0 | Pesos en HF |
| Qwen3.5-4B-DR-SFT-8k | mismo base | no disponible | no disponible | Apache 2.0 | Pesos en HF |

Las variantes 2.5k, 5k y 8k del mismo autor emplean volumenes crecientes de trayectorias de entrenamiento; no se han publicado sus puntuaciones, por lo que no es posible establecer un ranking entre ellas con los datos disponibles. Frente al modelo base, la unica ventaja cuantificada es la mejora en ResearchRubrics y la especializacion en el bucle de herramientas; en tareas generales el ajuste puede degradar ligeramente el rendimiento del base.

## Limitaciones y advertencias

- Sobreajuste probable: el propio autor indica que la perdida de validacion es minima tras la primera epoca y sube despues; el checkpoint publicado es el paso 117 (fin de la epoca 3), no el mejor en validacion.
- Evaluacion muy limitada: una sola prueba (ResearchRubrics, 101 preguntas) y un unico juez LLM. La mejora de +0,051 es estadisticamente significativa en la prueba pareada, pero no cubre capacidades generales.
- Riesgo de alucinacion en las citas: el control de calidad documentado es de formato de cita, no de verificacion factual del contenido citado. En produccion hay que validar que las fuentes existen y respaldan la afirmacion.
- Sesgo de destilacion: los informes se generaron y revisaron a partir de un profesor concreto (Qwen3.5-122B-A10B) y de dos conjuntos de datos concretos; el estilo, la seleccion de fuentes y la estructura de los informes heredan ese sesgo.
- Idiomas no documentados: la etiqueta de idiomas esta vacia y no hay evaluacion multilingue; no se debe asumir calidad fuera del ingles sin pruebas propias.
- Contexto no confirmado en la model card: la ventana efectiva no se declara explicitamente, solo el maximo por fila del entrenamiento (131.072 tokens). Conviene verificar el limite real del modelo base antes de disenar el pipeline.
- Herramientas acopladas al formato de entrenamiento: el rendimiento en tool calling depende de que el esquema de herramientas y el formato de prompt coincidan con los usados en las trayectorias; cambios de esquema pueden degradar el bucle de agente.
- Sin fases de alineacion documentadas (RLHF/DPO) en este ajuste: los sesgos y el comportamiento de seguridad son los heredados del modelo base.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- No se publican pesos cuantizados; cualquier despliegue en 4 u 8 bits exige conversion y validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-1k
- Variante 2.5k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-2.5k
- Variante 5k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-5k
- Variante 8k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-8k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/boyanbiji
- Listado de modelos del autor: https://huggingface.co/boyanbiji/models
- Dataset del autor (dr-tulu-long-form-sft-data): https://huggingface.co/boyanbiji/dr-tulu-long-form-sft-data
- Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Ficha tecnica y requisitos de VRAM de Qwen3.5-4B: https://apxml.com/models/qwen35-4b
- Repositorio no oficial de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Paper, blog o demo especificos de este ajuste: no disponibles en la informacion proporcionada.
