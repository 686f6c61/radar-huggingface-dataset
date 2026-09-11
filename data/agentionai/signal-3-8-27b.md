# agentionai/Signal-3.8-27B

## Resumen

Signal-3.8-27B es un fine-tune de Qwen3.8-27B desarrollado por AgentionAI que sustituye un unico tensor del checkpoint original (`lm_head.weight`) por una version reentrenada por autodestilacion. El objetivo no es ampliar capacidades, sino reducir la verbosidad: el modelo responde de forma mas directa, elimina preambulos, cierres y narracion explicativa superflua, y gasta menos tokens tanto en la respuesta como en la traza de razonamiento del modo thinking. Mantiene intactos el resto de pesos, el encoder de vision, el proyector, la cabeza de borrador MTP, el tokenizador y la plantilla de chat del modelo base.

El modelo tiene 27.781.427.952 parametros (27,78 mil millones) en BF16 y se distribuye en 18 shards de safetensors, con un tamano de repositorio de 55,6 GB. Es multimodal de tipo image-text-to-text (acepta entrada de imagen) y su licencia es Apache-2.0. En las evaluaciones internas del autor reduce un 57 % los tokens de respuesta en prompts generales (de 243 a 104 tokens de mediana), un 52 % los tokens de razonamiento en modo thinking, y mantiene o mejora la calidad medida en GSM8K (98,3 % con thinking desactivado; 95,0 % frente a 92,5 % con thinking activado).

Su relevancia practica esta en el coste por respuesta: menos tokens de salida y mayor tasa de aceptacion del borrador especulativo se traducen, segun el autor, en tiempos de finalizacion inferiores a la mitad del modelo base en el mismo hardware. Al ser un reemplazo directo en transformers, vLLM, SGLang y llama.cpp, no requiere cambios en pipelines de cuantizacion, LoRA o serving ya construidos para Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen/Qwen3.8-27B; incluye encoder de vision, proyector y cabeza de borrador multi-token (MTP). No se especifica si el modelo base es denso o MoE |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo oficial de vLLM usa `--max-model-len 65536`. El autor afirma que no hay degradacion en contexto largo |
| Tipos de cuantizacion | BF16 completo (safetensors). Tiers GGUF de IQ4_XS a Q8_0 publicados en agentionai/Signal-3.8-27B-GGUF |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, 18 shards) y GGUF. Compatible con pipelines de cuantizacion estandar |
| Tamano del repositorio | 55,6 GB |
| Modo thinking | Activado por defecto; desactivable con `enable_thinking=False` en `apply_chat_template` |
| Muestreo recomendado | temperature 0.7, top-p 0.95, top-k 20, min-p 0 |

## Arquitectura y entrenamiento

El modelo conserva exactamente la arquitectura de Qwen3.8-27B: un transformer multimodal con encoder de vision, proyector hacia el espacio de tokens y una cabeza de prediccion multi-token (MTP) que actua como borrador para decodificacion especulativa. Del checkpoint completo de 18 shards, AgentionAI solo ha modificado `lm_head.weight`; la delta de esa cabeza tiene una norma del 4,1 % respecto a la original. El resto de tensores, el tokenizador y la plantilla de chat son identicos byte a byte al modelo base, lo que garantiza compatibilidad directa en transformers, vLLM, SGLang y llama.cpp.

El entrenamiento es autodestilacion sobre las propias respuestas de Qwen3.8-27B, generadas bajo una instruccion de ser directo que el modelo liberado ya no necesita incorporar en el prompt. No se usaron datos externos ni salidas de otros modelos, lo que explicaria que el conocimiento y el registro del modelo base se mantengan intactos. El efecto medido es un cambio de estilo y de longitud, no de contenido: la validacion reportada indica que ninguna de las 100 respuestas del conjunto de estilo quedo cortada (0 respuestas terminando en encabezado o dos puntos, 0 bloques de codigo sin cerrar) y que ninguna de las 50 trazas de razonamiento en modo thinking entro en bucle o alcanzo el limite de tokens. Ademas, al ser las respuestas mas predecibles, la tasa de aceptacion del borrador MTP sube de forma notable en salidas estructuradas (de 72 % a 94 % con draft de longitud 3 en JSON).

## Capacidades

- Generacion de texto conversacional en modo chat, con respuestas mas breves y sin preambulos ("Sure!", "Great question") ni despedidas.
- Razonamiento multi-paso en modo thinking, con trazas mas compactas (mediana de 153 a 74 tokens en prompts generales).
- Generacion de codigo, con reduccion de tokens del 11 % en mediana y en p90 respecto al base.
- Razonamiento matematico: en GSM8K mantiene 98,3 % de exact match sin thinking y sube a 95,0 % con thinking (base: 92,5 %).
- Entrada de imagen, con pipeline `image-text-to-text` y funcionamiento identico al modelo base segun el autor.
- Salida estructurada (JSON), donde la decodificacion especulativa con borrador MTP alcanza un 94 % de aceptacion con draft 3 y 87 % con draft 4.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y uso como reemplazo directo en stacks de serving existentes.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni de agentes multi-paso, mas alla de la salida estructurada tipo JSON.

## Casos de uso

- Atencion al cliente automatizada: el modelo mantiene conversaciones multi-turno y responde de forma directa, sin formulas de cortesia que alargan la respuesta. La reduccion del 57 % en tokens de salida abarrona el coste por conversacion y reduce la latencia percibida por el usuario.
- Agentes con salida estructurada: la alta tasa de aceptacion del borrador MTP en JSON (94 % con draft 3) hace que las llamadas a herramientas y las respuestas en formato maquina sean rapidas y estables, integrables en orquestadores que esperan JSON validado.
- Asistente de programacion en IDE: el modelo genera fragmentos de codigo con un 11 % menos de tokens que el base sin perder calidad, lo que reduce el tiempo hasta la primera sugerencia util y el coste de las completaciones en editor.
- RAG sobre documentacion extensa: con la ventana de contexto larga usada en el ejemplo de vLLM (65.536 tokens) y sin degradacion reportada, el modelo puede responder sobre documentos extensos; la brevedad de la respuesta final reduce el tiempo total del turno.
- Extraccion de datos de documentos con imagen: al aceptar entrada de imagen, puede procesar capturas, diagramas o formularios escaneados y devolver campos estructurados, con el beneficio adicional de menor latencia en la generacion.
- Clasificacion y triage de tickets: con `enable_thinking=False` el modelo responde sin traza de razonamiento, lo que lo hace adecuado para tareas de etiquetado de alto volumen donde el coste por inferencia es el factor critico.
- Despliegue en hardware de gama media: la disponibilidad de tiers GGUF desde IQ4_XS permite ejecutar el modelo en equipos con GPU de consumo o en placas con memoria unificada, manteniendo el comportamiento del base.
- Evaluacion matematica y tutorizacion: en GSM8K el modo thinking mejora el exact match respecto al base (95,0 % frente a 92,5 %), lo que lo hace apto para explicar ejercicios paso a paso con explicaciones mas concisas.

## Benchmarks y rendimiento

Estilo y eficiencia de tokens, ambos modelos en Q8_0 sobre llama.cpp, prompts no vistos durante el ajuste:

| Metrica | Base Q8_0 | Signal | Cambio |
|---|---|---|---|
| Respuestas generales, tokens mediana | 243 | 104 | -57 % |
| Respuestas con preambulo ("Sure!", "Great question") | 13 % | 0 % | Eliminado |
| Respuestas con encabezados markdown | 47 % | 18 % | -62 % |
| Respuestas con negrita | 85 % | 52 % | -39 % |
| Respuestas de codigo, tokens mediana | 159 | 142 | -11 % |
| Respuestas de codigo, tokens p90 | 1026 | 914 | -11 % |

Modo thinking, mismos prompts con razonamiento activado:

| Metrica | Base Q8_0 | Signal | Cambio |
|---|---|---|---|
| Tokens de razonamiento, prompts generales, mediana | 153 | 74 | -52 % |
| Tokens de razonamiento, prompts de codigo, mediana | 225 | 166 | -26 % |
| Tokens de razonamiento, GSM8K, mediana | 119 | 81 | -32 % |

Calidad, exact match en GSM8K:

| Configuracion | Base Q8_0 | Signal |
|---|---|---|
| Thinking desactivado, 60 problemas | 98,3 % | 98,3 % |
| Thinking activado, 40 problemas | 92,5 % | 95,0 % |

Aceptacion del borrador MTP y velocidad de decodificacion (`--spec-type draft-mtp`, ambos Q8_0, Strix Halo con Vulkan, ejecuciones greedy de 200 tokens en las filas de borrador fijo):

| Prompt / longitud de borrador | Aceptacion base | Aceptacion Signal | Velocidad vs base |
|---|---|---|---|
| Prosa, draft 3 | 39 % | 47 % | +10 % |
| Prosa, draft 4 | 35 % | 28 % | -9 % |
| Salida estructurada (JSON), draft 3 | 72 % | 94 % | +20 % |
| Salida estructurada (JSON), draft 4 | 66 % | 87 % | +22 % |
| Prompts de chat, muestreo a 0.7, draft adaptativo <= 4 (40 prompts) | 57 % | 60 % | No reportado |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos BF16 completos: 55,6 GB (dato real del repositorio, 27,78 mil millones de parametros x 2 bytes). Requiere al menos 80 GB de VRAM para pesos mas cache KV, por lo que encaja en una A100 80 GB o H100 80 GB; alternativamente dos GPU de 48 GB o cuatro de 24 GB con tensor parallelism.
- Cuantizacion Q8_0: aproximadamente 29-30 GB estimados a partir del numero de parametros (el tamano exacto del tier no consta en la informacion disponible). No cabe en una RTX 4090 de 24 GB; si en RTX A6000 48 GB, L40S 48 GB o dos RTX 4090.
- Cuantizacion IQ4_XS: aproximadamente 15-16 GB estimados, lo que permite ejecucion en RTX 4090, RTX 4080, RTX 3090 y GPUs de 16-24 GB, con contexto reducido segun memoria disponible.
- Memoria unificada: el autor reporta pruebas en Strix Halo con backend Vulkan a traves de llama.cpp.
- Opciones de despliegue documentadas: transformers (`AutoModelForImageTextToText`), vLLM (`vllm serve agentionai/Signal-3.8-27B --dtype bfloat16 --max-model-len 65536`), SGLang y llama.cpp con los GGUF oficiales. Cualquier receta de cuantizacion o LoRA valida para Qwen3.8-27B es aplicable sin cambios.
- Latencia y throughput: no se publican tokens por segundo absolutos. El autor reporta finalizacion en menos de la mitad del tiempo de pared del modelo base en el mismo hardware, con incrementos de velocidad de decodificacion del 10 % (prosa, draft 3) y del 20-22 % (JSON, draft 3-4) gracias a la decodificacion especulativa.
- Configuracion de muestreo: temperature 0.7, top-p 0.95, top-k 20, min-p 0. El autor observo un unico bucle con decodificacion greedy (temperature 0), por lo que se desaconseja este modo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Signal-3.8-27B | 27,78 mil millones | No especificado (ejemplo de vLLM con 65.536) | Apache-2.0 | Solo difiere del base en `lm_head.weight`; -57 % de tokens en respuestas generales, -52 % en razonamiento; GSM8K 98,3 % / 95,0 % |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | No especificado | Apache-2.0 segun la ficha de Signal | Referencia directa: mismos pesos salvo la cabeza de salida; 243 tokens de mediana frente a 104; misma calidad GSM8K sin thinking |
| Otras alternativas de ~27B | No disponible | No disponible | No disponible | La informacion proporcionada no incluye comparativas con modelos de terceros |

Los resultados de estilo, tokens y GSM8K proceden de evaluaciones del propio autor y estan medidos frente al modelo base en Q8_0, no frente a otras familias de modelos.

## Limitaciones y advertencias

- Las metricas de eficiencia y calidad las publica el autor del modelo; no hay evaluacion independiente ni resultados de benchmarks estandar (MMLU, HumanEval, MT-Bench) en la informacion disponible.
- El repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, y fue creado en septiembre de 2026: es un modelo reciente y sin validacion por parte de la comunidad.
- No se especifica que idiomas soporta. La model card esta en ingles y las evaluaciones se hicieron con prompts en ingles; el rendimiento en castellano no esta medido.
- Riesgo de alucinacion: heredado de Qwen3.8-27B, ya que el ajuste solo modifica la capa de salida y no incorpora datos nuevos. La reduccion de tokens no elimina la posibilidad de respuestas incorrectas, solo las hace mas breves.
- Sesgos: la informacion proporcionada no documenta analisis de sesgos ni composicion del dataset de autodestilizacion (se genero a partir de las respuestas del propio modelo base).
- Se desaconseja la decodificacion greedy: el autor observo un bucle con temperature 0. Usar siempre muestreo con los parametros recomendados.
- El ahorro se concentra en respuestas generales de chat (-57 %); en codigo la reduccion es menor (-11 %), por lo que la ganancia de coste en cargas de trabajo tecnicas es mas modesta.
- En decodificacion especulativa, el borrador de longitud 4 en prosa empeora el rendimiento (-9 %), por lo que el ajuste del numero de tokens de borrador debe hacerse por tipo de carga.
- Licencia Apache-2.0 en el repositorio, pero al ser un derivado de Qwen3.8-27B conviene verificar los terminos del modelo base antes de un uso comercial en produccion.
- El ejemplo de vLLM de la model card aparece truncado en la informacion disponible (`--reasoning-parse`), por lo que la configuracion completa de despliegue debe consultarse en la pagina del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentionai/Signal-3.8-27B
- Cuantizaciones GGUF (IQ4_XS a Q8_0): https://huggingface.co/agentionai/Signal-3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor: https://www.agention.ai/
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de soporte de Microsoft, sin vinculacion con este lanzamiento).
