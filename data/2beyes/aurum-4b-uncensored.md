# 2Beyes/Aurum-4B-Uncensored

## Resumen

Aurum 4B Uncensored es un modelo derivado de Qwen3.5-4B, publicado por el usuario 2Beyes en Hugging Face. Se trata de una edición quirúrgica de los pesos de Qwen3.5-4B cuyo único propósito es eliminar el comportamiento de rechazo (refusal) del modelo original, conservando intactos el resto de pesos, la torre de visión y la cabeza de predicción multi-token (MTP). El modelo se presenta como una alternativa para chat diario y tool calling en tarjetas gráficas de 8 GB.

La relevancia del modelo reside en su enfoque de edición: en lugar de un fine-tune completo o un abliteration convencional, el autor toma la diferencia de pesos entre Qwen3.5-4B y un modelo derivado (Distill-Heretic-Abliterated) y aísla únicamente las direcciones singulares responsables de la eliminación de rechazos, descartando el resto de cambios de destilado. El resultado es un modelo que, según el autor, mantiene el conocimiento de Qwen3.5-4B y su precisión en tool calling, pero con cero rechazos en 100 prompts dañinos de prueba.

El modelo tiene 4.659.865.088 parámetros, se distribuye en safetensors BF16 y cuenta con cuantizaciones GGUF (Q3_K_M a Q8_0) en un repositorio separado. La licencia es Apache-2.0 y el idioma declarado es inglés. Es un modelo multimodal image-text-to-text con soporte de thinking mode y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3_5ForConditionalGeneration) con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF Q3_K_M a Q8_0, BF16 y proyector de visión en repo separado |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). La edición aplicada no es un entrenamiento: se calcula la diferencia de pesos entre Qwen3.5-4B y el modelo insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, y se conserva únicamente la componente que elimina rechazos. En concreto, se retienen las 8 direcciones singulares principales del cambio (aproximadamente el 98 % del mismo) en los pesos de salida de atención (`self_attn.o_proj` / `linear_attn.out_proj`) de las capas 4 a 31, y la dirección principal en los pesos de salida de la FFN (`mlp.down_proj`) solo en los tensores donde esa dirección concentra más de la mitad del cambio.

El resto de modificaciones del modelo Heretic (su fine-tune de destilado) no se incluye. La configuración, el tokenizer y la plantilla de chat provienen del modelo Heretic, que comparte tokenizer con Qwen3.5. Los pesos BF16 son idénticos tensor a tensor al GGUF BF16 con el que se hicieron los benchmarks. Las cuantizaciones GGUF se generaron con llama.cpp (b12289) usando una importance matrix calculada sobre una mezcla hermana de Aurum, con texto de calibración compuesto por prosa, código y chats de tool-calling. Durante el desarrollo, esta build se denominó `c-v1u` y superó a otras dos candidatas en pruebas selladas (misma precisión de tool calling, más conocimiento y cero rechazos).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con thinking mode, activable mediante `enable_thinking` en la plantilla de chat, igual que en Qwen3.5.
- Tool calling / function calling, con soporte evaluado mediante el checker AST de `bfcl-eval` en las categorías simple, multiple, parallel, parallel-multiple e irrelevance.
- Procesamiento de imagen y vídeo mediante la torre de visión de Qwen3.5-4B, sin modificar.
- Predicción multi-token (MTP) heredada de Qwen3.5-4B.
- Capacidades multilingües limitadas al inglés según la model card.
- Comportamiento sin rechazos: cero refusals en 100 prompts dañinos de prueba según el autor.

## Casos de uso

- Chat conversacional en hardware de consumo: el modelo está pensado para funcionar en tarjetas de 8 GB, lo que permite desplegar un asistente conversacional local en equipos con RTX 3060/4060 o similares usando cuantizaciones GGUF de 4 bits.
- Tool calling en pipelines de automatización: al conservar los pesos de Qwen3.5-4B y su precisión de tool calling, puede integrarse en flujos que requieran invocar funciones externas (APIs, bases de datos, sistemas de ficheros) con un modelo pequeño y ligero.
- Procesamiento de documentos con imagen: la torre de visión intacta permite extraer información de capturas, formularios escaneados o imágenes en aplicaciones de back-office.
- Investigación sobre alineación y refusal: el modelo es útil como caso de estudio de edición de pesos selectiva, ya que `build_log.json` documenta cada tensor tocado y la fracción de cambio conservada.
- Generación de código asistida en local: con cuantización Q4_K_M o Q5_K_M cabe en GPUs de consumo y puede integrarse en editores o CLIs de desarrollo sin depender de la nube.
- Evaluación comparativa de técnicas de abliteration: sirve como referencia para comparar edición quirúrgica de pesos frente a fine-tunes completos de destilado en términos de conocimiento retenido y precisión de tool calling.
- Prototipado de agentes multi-paso: el thinking mode y el soporte de tool calling permiten construir agentes que razonan y ejecutan acciones en entornos controlados.

## Benchmarks y rendimiento

El autor compara Aurum 4B con Distill-Heretic 4B (insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, ejecutado como GGUF Q4_K_M de yachen4ever). Ambos modelos se ejecutan en llama.cpp con Q4_K_M, thinking desactivado, decodificación greedy y sin system prompt, con el runner propio del autor. No se han publicado los valores numéricos de las gráficas en el texto de la model card.

| Benchmark | Aurum 4B | Distill-Heretic 4B | Notas |
|---|---|---|---|
| BFCL (simple, multiple, parallel, parallel-multiple, irrelevance) | no disponible (valores en gráfica) | no disponible (valores en gráfica) | Checker AST `bfcl-eval` sobre generaciones propias |
| GPQA | no disponible (valores en gráfica) | no disponible (valores en gráfica) | Límite de 3.072 tokens; 84 de 198 respuestas de Aurum agotaron el límite y contaron como incorrectas (6 en Distill-Heretic) |
| Refusals (100 prompts dañinos) | 0 | no disponible | Conteo por frases marcadoras, estimación |
| Conocimiento general | no disponible (valores en gráfica) | no disponible (valores en gráfica) | — |

El autor advierte que los números publicados por Qwen corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables con estas mediciones en Q4 y sin thinking.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 9,3 GB (tamaño del repo), por lo que requiere más de 8 GB en precisión completa. Las cuantizaciones GGUF Q4_K_M reducen la huella a un rango compatible con GPUs de 8 GB, según la afirmación del autor.
- GPU recomendadas: el modelo está diseñado explícitamente para tarjetas de 8 GB. Para BF16 se necesitan GPUs con 12-16 GB o más (RTX 4070 Ti, RTX 4080, A10, L4). Para cuantizaciones Q4, cabría en RTX 3060 8 GB, RTX 4060, RTX 3070.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-5 bits en GPUs de 8 GB; en BF16 requiere gama media-alta.
- Opciones de despliegue: transformers (con versión que soporte Qwen3.5, usando `AutoModelForImageTextToText`), llama.cpp (GGUF), y por extensión cualquier runtime compatible con GGUF como Ollama o LM Studio. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Aurum 4B Uncensored | 4.659.865.088 | no disponible | Apache-2.0 | Edición selectiva de pesos para eliminar refusals, conserva pesos Qwen | safetensors BF16 + GGUF |
| Qwen/Qwen3.5-4B | ~4B (no confirmado en la información) | no disponible | no disponible en la información | Modelo base multimodal con visión y MTP | Hugging Face |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | ~4B (no confirmado) | no disponible | no disponible en la información | Destilado de Qwen3.8 + abliteration con Heretic | Hugging Face |
| yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF | ~4B (no confirmado) | no disponible | no disponible en la información | Cuantización GGUF del anterior | Hugging Face |

No se dispone de datos de rendimiento numéricos comparativos más allá de las gráficas referenciadas en la model card.

## Limitaciones y advertencias

- Modelo sin censura: no rechaza peticiones dañinas (0 refusals en 100 prompts de prueba). El autor advierte explícitamente de que no debe desplegarse donde usuarios que no hayan elegido un modelo sin censura puedan acceder a él.
- Es un modelo de 4B: comete errores factuales y puede invocar herramientas de forma incorrecta, según reconoce el autor.
- El idioma declarado es únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible.
- La eliminación de rechazos puede afectar a la utilidad en dominios sensibles (salud, legal, seguridad) donde una negativa a responder sería deseable.
- Los benchmarks se realizaron en Q4_K_M y sin thinking; los números de Qwen publicados no son directamente comparables.
- El conteo de rechazos se basa en frases marcadoras, no en revisión manual, por lo que es una estimación.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El repositorio no incluye configuración de preprocesador de imagen propia; debe usarse el processor de Qwen3.5-4B para imágenes.
- Sesgos conocidos: no documentados en la información disponible, aunque al conservar los pesos de Qwen3.5-4B hereda los sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- GGUF: https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo fuente de la edición de rechazos: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- GGUF del modelo de comparación: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
