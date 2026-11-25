# aday777/Inkling-2-Mini-Abliterated-NVFP4

## Resumen

Inkling-2-Mini-Abliterated-NVFP4 es una variante "abliterated" (sin el comportamiento de rechazo entrenado) del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario aday777 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE) y cuantizacion nativa NVFP4, con 26.388.646.440 parametros totales y un tamano de repositorio de 20,2 GB. El modelo base pertenece a Thinking Machines y esta disenado para conversacion, razonamiento y comprension de imagenes.

La modificacion aplicada es quirurgica: se editan unicamente dos tensores BF16 (el embedding de tokens y la proyeccion de salida, ambos de forma [201024, 2304]) para eliminar la direccion de rechazo mediante una contraccion ridge con t=0.5, siguiendo un enfoque de ortogonalizacion estilo ABLATERATE. El resto de pesos, incluidos atencion, expertos densos, pesos MoE, router, normas, el drafter especulativo DSpark/MTP, tokenizer y plantillas de chat, permanecen identicos bit a bit al checkpoint original. La cuantizacion FP4 nativa de los expertos se conserva intacta, sin round-trip de dequant/requant, por lo que no se anade perdida de cuantizacion adicional.

Su relevancia actual radica en que ofrece una alternativa sin rechazos para casos donde el modelo base tiende a evadir o matizar respuestas, manteniendo las capacidades tecnicas del original y el mismo rendimiento de inferencia. El autor publica transcripciones auditables de las pruebas A/B de rechazo bajo el directorio `bench/`, lo que permite verificar el comportamiento declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atencion transformer, cuantizacion nativa NVFP4; incluye drafter especulativo DSpark/MTP |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el autor sirve con `--max-model-len 42496` en las pruebas de rendimiento) |
| Tipos de cuantizacion | NVFP4 nativa (expertos MoE empaquetados FP4 con escalas de grupo F8_E4M3; ~11% del modelo en BF16: atencion, FFN densa, embed, router, normas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model-00001-of-00001.safetensors`, `mtp.safetensors`), configuracion transformers |

## Arquitectura y entrenamiento

El modelo es un transformer con capas Mixture of Experts, en el que los pesos de los expertos estan cuantizados en FP4 (payload U8 con escalas de grupo F8_E4M3) mientras que aproximadamente el 11% restante del modelo, que incluye atencion, FFN densa, embeddings, router y normas, se mantiene en BF16. Incorpora un drafter de decodificacion especulativa DSpark/MTP empaquetado en `mtp.safetensors`, que acelera la generacion. El embedding y la proyeccion de salida tienen forma [201024, 2304], lo que sugiere un vocabulario de 201.024 tokens y una dimension oculta de 2304.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la model card proporcionada. La innovacion tecnica destacable de esta variante es la eliminacion del comportamiento de rechazo mediante edicion directa de los tensores de embedding y unembed: para cada fila de token `e`, se reduce la componente a lo largo de la direccion de rechazo `r̂` mediante `e ← e − t·(e·r̂)·r̂` con `t = 0.5`, manteniendo la coherencia mutua entre embed y unembed. El resto de pesos no se modifica.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Comprension de imagenes (pipeline image-text-to-text, con `processor_config.json`).
- Razonamiento con modo "thinking" (stream de razonamiento separado en `reasoning_content`).
- Razonamiento matematico basico (el modelo base responde correctamente a operaciones como 17 × 23 = 391 en las pruebas del autor).
- Decodificacion especulativa mediante el drafter DSpark/MTP incluido.
- Comportamiento sin rechazos: responde directamente a peticiones cargadas o incomodas en lugar de declinar o matizar, segun las pruebas A/B publicadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y comportamiento de rechazo: el modelo permite comparar directamente el comportamiento del checkpoint base y la variante abliterated con transcripciones auditables en `bench/`, util para estudiar como se codifica la negativa en los embeddings.
- Generacion creativa sin autocensura: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas donde el modelo base tiende a matizar; la variante responde de forma directa segun las pruebas del autor.
- Analisis de contenido sensible en entornos controlados: clasificacion o resumen de material delicado (por ejemplo, moderacion interna) donde se necesita que el modelo procese la peticion sin evasivas.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre texto en capturas, diagramas o formularios en flujos de digitalizacion.
- Despliegue en una sola GPU de 96 GB: con cuantizacion NVFP4 y ~20,2 GB de pesos, cabe en una RTX PRO 6000 Blackwell y permite servir peticiones de hasta ~42k tokens con vLLM, segun las mediciones del autor (TTFT de 2,1-5,1 s y 146 tok/s de decodificacion).
- Experimentacion con decodificacion especulativa: el drafter DSpark/MTP incluido permite probar tecnicas de aceleracion en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente una comparativa A/B de comportamiento de rechazo y mediciones de velocidad:

| Prueba (9 sondas cargadas) | Base | Abliterated |
|---|---|---|
| Thinking off | 3 limpias · 2 con matices · 4 silenciosas | 1 limpia · 0 con matices · 8 silenciosas |
| Thinking on | 3 limpias · 1 con matices · 5 silenciosas | 2 limpias · 0 con matices · 7 silenciosas |

| Ejecucion (prompt de ~40k tokens → 1.024 tokens de salida) | TTFT | Prefill tok/s | Decode tok/s | Global tok/s |
|---|---|---|---|---|
| Abliterated, cache fria | 5,1 s | 7.839 | 146,5 | 84,6 |
| Abliterated, cache fria | 4,0 s | 10.042 | 146,4 | 93,2 |
| Abliterated, cache caliente | 2,1 s | 18.742 | 146,4 | 112,2 |
| Base, cache fria | 4,1 s | 9.803 | 147,0 | 92,5 |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~20,2 GB en NVFP4; con cache KV y overhead de serving, el autor usa una GPU de 96 GB con `--gpu-memory-utilization 0.90` para contexto de 42.496 tokens.
- GPU recomendadas: RTX PRO 6000 Blackwell 96 GB (medida por el autor); previsiblemente A100/H100 de 80 GB para contextos largos.
- Cabe en GPU de consumo: no confirmado; con ~20,2 GB de pesos mas cache KV para contextos largos, una RTX 4090 de 24 GB queda muy justa y no esta verificado en la informacion disponible.
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:inkling-2-mini` y flags `--reasoning-parser inkling --max-model-len 42496 --gpu-memory-utilization 0.90 --language-model-only`; compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput medidos: TTFT de 2,1-5,1 s para prompts de ~40k tokens, prefill de 7.839-18.742 tok/s y decodificacion de ~146,5 tok/s en una RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-NVFP4 | 26,4B | no disponible | NVFP4 nativa | Apache 2.0 | Variante sin rechazos, con drafter especulativo |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | no disponible | NVFP4 nativa | Apache 2.0 | Checkpoint original con comportamiento de rechazo entrenado |
| Otros modelos MoE de ~25-30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo entrenado; el modelo puede responder a peticiones daninas o controvertidas sin las salvaguardas del original. No es adecuado para despliegues publicos sin moderacion externa.
- Clase "silenciosa": en prompts cortos y concretos, la variante abliterated tiende a alargar el razonamiento y devolver el campo `content` vacio. Ejemplo documentado: "What is 17 × 23? Show only the number." devuelve respuesta vacia con finish `length` tras agotar 300 tokens en el stream de razonamiento, mientras el base responde `391`. Para prompts cortos conviene leer `reasoning_content` o activar thinking.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor solo documenta que el base responde correctamente a tres sondas benignas y la variante deja el campo final vacio.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingue.
- Longitud de contexto oficial: no disponible; el autor sirve con 42.496 tokens, pero no se confirma como contexto nativo del modelo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae en el desplegador.
- Solo 311 descargas y 4 likes en el momento de la consulta: ecosistema pequeno y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aday777/Inkling-2-Mini-Abliterated-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
