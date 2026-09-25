# rbinrs/glm-4-9b-chat-abliterated-GGUF

## Resumen

glm-4-9b-chat-abliterated-GGUF es una version cuantizada en formato GGUF del modelo byroneverson/glm-4-9b-chat-abliterated, que a su vez deriva de THUDM/glm-4-9b-chat, el modelo conversacional de 9.400 millones de parametros desarrollado por el grupo Knowledge Engineering Group (KEG) de la Universidad de Tsinghua y Zhipu AI. El cambio principal respecto al original no es arquitectonico sino de alineacion: se ha aplicado una tecnica de "abliteracion" que identifica y elimina la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a determinadas peticiones.

Esta ficha corresponde a la publicacion de rbinrs, que redistribuye las cuantizaciones generadas con llama.cpp (release b3634) por bartowski a partir del modelo abliterado. El repositorio ocupa 155,3 GB e incluye veinte niveles de cuantizacion distintos, desde f16 (18,81 GB) hasta Q2_K_L (4,60 GB), lo que permite ejecutar el modelo tanto en GPUs de gama alta como en equipos con 8 GB de VRAM o en CPU con RAM abundante.

Su relevancia es doble. Por un lado, ofrece un modelo de 9,4 B con soporte declarado de chino e ingles en el modelo base, ejecutable en hardware de consumo en cuantizaciones de 4-6 bits. Por otro, es una pieza de interes para investigacion sobre alineacion, red teaming y evaluacion de salvaguardas, ya que permite comparar el comportamiento del modelo original frente a la variante sin filtros de rechazo. Conviene senalar que el repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que su procedencia conviene verificarla antes de usarlo en produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GLM-4; el detalle de capas y cabezas no figura en la informacion proporcionada |
| Parametros totales | 9.399.951.360 (~9,4 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base GLM-4-9B-Chat de THUDM declara 128 000 tokens |
| Tipos de cuantizacion | f16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, Q4_0_8_8, Q4_0_4_8, Q4_0_4_4, Q3_K_XL, Q3_K_L, Q3_K_M, IQ4_XS, IQ3_M, Q2_K_L |
| Idiomas soportados | zh (chino) y en (ingles) |
| Licencia | glm-4 (etiquetada como "other" en HuggingFace, con enlace al LICENSE de THUDM) |
| Formato de pesos | GGUF (llama.cpp); el modelo base tambien se distribuye en safetensors |
| Modelo base | byroneverson/glm-4-9b-chat-abliterated |
| Modelo original | THUDM/glm-4-9b-chat |
| Tamano del repositorio | 155,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLM-4-9B, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA), disenado para contextos largos. El modelo original de THUDM se entreno sobre un corpus multilingue de gran escala con predominio de chino e ingles y posteriormente se sometio a un proceso de ajuste supervisado y alineacion por preferencias para convertirlo en la variante "-chat". La cifra exacta de tokens de entrenamiento y la composicion detallada del dataset no se especifican en la informacion proporcionada.

La innovacion diferencial de esta publicacion es la abliteracion. Se trata de una tecnica de edicion de pesos que estima, a partir de pares de peticiones aceptadas y rechazadas, la direccion del espacio de activaciones asociada a la negativa a responder, y despues proyecta esa direccion fuera de las matrices de pesos. El resultado es un modelo con la misma estructura computacional y practicamente el mismo coste de inferencia, pero con los mecanismos de rechazo atenuados o eliminados. Es importante subrayar que este proceso no anade entrenamiento nuevo ni conocimiento adicional: solo modifica el comportamiento de rechazo. La cuantizacion GGUF se realizo con llama.cpp b3634 empleando el metodo imatrix, que calibra los errores de cuantizacion con un dataset de referencia para preservar mejor la perplejidad en precisiones bajas.

El formato de prompt que espera el modelo es el de ChatGLM:

```
[gMASK] <sop> <|system|>
{system_prompt} <|user|>
{prompt} <|assistant|>
```

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles, con historial de conversacion y system prompt.
- Razonamiento general y respuesta a instrucciones propias de un modelo de 9,4 B afinado para chat.
- Generacion y explicacion de codigo en los lenguajes mas habituales, aunque sin datos publicados de rendimiento en esta variante.
- Matematicas y aritmetica de complejidad media; no se han publicado resultados de GSM8K ni similares para esta version.
- Soporte de contexto largo si se hereda la ventana de 128 000 tokens del modelo base, sujeto a la VRAM disponible para el cache KV.
- Capacidad multilingue limitada a chino e ingles segun la ficha; el castellano no figura entre los idiomas declarados.
- Comportamiento sin filtros de rechazo: responde a peticiones que el modelo alineado original rechazaria (esta es precisamente la funcion de la abliteracion).
- Tool calling / function calling: el modelo base GLM-4-9B-Chat declara soporte, pero la informacion proporcionada no confirma que la variante abliterada lo conserve intacto.
- Capacidades multimodales: no disponibles en esta variante (la version con vision es GLM-4V, un modelo distinto).

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo original y de la variante abliterada ante el mismo conjunto de peticiones permite medir empiricamente que comportamientos dependen de la direccion de rechazo y cuales se pierden al eliminarla.
- Red teaming y evaluacion de salvaguardas: usar el modelo como generador adversario para construir conjuntos de prompts maliciosos y probar los filtros de entrada y salida de un sistema en produccion.
- Generacion de codigo en local: con la cuantizacion Q5_K_M (7,14 GB) cabe en una GPU de 12 GB y permite autocompletado, generacion de tests y explicacion de fragmentos sin enviar codigo propietario a servicios externos.
- Despliegue de asistente conversacional offline: en un portatil con 16 GB de RAM y la cuantizacion Q4_K_M (6,25 GB) se obtiene un asistente en chino o ingles sin conexion, util en entornos con requisitos de confidencialidad.
- Procesamiento de documentacion tecnica en chino e ingles: clasificacion, resumen y extraccion de campos estructurados de manuales, contratos o articulos, aprovechando que son los dos idiomas soportados oficialmente.
- Traduccion zh a en y en a zh en pipelines internos: el modelo puede integrarse como etapa de traduccion en un flujo de RAG o de analisis de documentacion, con coste cero por token.
- Generacion de contenido creativo sin restricciones editoriales: escritura de ficcion, dialogos o material de marketing en el que los filtros del modelo alineado resultan demasiado conservadores.
- Experimentacion con fine-tuning ligero: al disponer de cuantizaciones desde Q2_K_L (4,60 GB) hasta f16 (18,81 GB), es viable usar el modelo como punto de partida en entornos de investigacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar las cuantizaciones, el formato de prompt y las instrucciones de uso con llama.cpp, sin incluir tablas comparativas de MMLU, HumanEval, GSM8K u otras. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

Los tamanos de archivo siguientes estan tomados de la tabla de cuantizaciones publicada por el autor. La VRAM necesaria para inferencia es algo superior al tamano del archivo, ya que hay que sumar el cache KV, los buffers de contexto y el overhead del runtime.

| Cuantizacion | Tamano del archivo | VRAM estimada en GPU | Notas |
|---|---|---|---|
| f16 | 18,81 GB | ~21-23 GB (sin contexto largo) | Requiere A100 40 GB, H100 o dos GPU de 16 GB |
| Q8_0 | 9,99 GB | ~12-14 GB | Calidad maxima practica; RTX 4090, L40S, A6000 |
| Q6_K_L / Q6_K | 8,56 / 8,26 GB | ~10-12 GB | Calidad muy alta, recomendada por el autor |
| Q5_K_L / Q5_K_M / Q5_K_S | 7,53 / 7,14 / 6,69 GB | ~9-11 GB | Buen equilibrio; RTX 4070 Ti, 4080, 3090 |
| Q4_K_L / Q4_K_M / Q4_K_S | 6,71 / 6,25 / 5,75 GB | ~8-10 GB | Opcion por defecto; RTX 3060 12 GB, 4060 Ti 16 GB |
| IQ4_XS | 5,25 GB | ~7-9 GB | Alternativa compacta a Q4_K_S |
| Q4_0 / Q4_0_8_8 / Q4_0_4_8 / Q4_0_4_4 | 5,46-5,47 GB | ~7-9 GB | Las variantes 4_8 y 4_4 estan optimizadas para ARM y CPU |
| Q3_K_XL / Q3_K_L / Q3_K_M / IQ3_M | 5,82 / 5,28 / 5,06 / 4,81 GB | ~6-8 GB | Calidad decreciente; utiles con poca RAM |
| Q2_K_L | 4,60 GB | ~5-7 GB | Minimo absoluto; calidad notablemente degradada |

- Cabe en GPU de consumo: si. Las cuantizaciones de 4 y 5 bits funcionan en tarjetas de 8-12 GB (RTX 3060, 3070, 4060, 4060 Ti). Las de 6 y 8 bits piden 12-16 GB (RTX 4070 Ti Super, 4080, 4090).
- GPU de centro de datos recomendadas: A100 40/80 GB, H100, L40S o A6000 para f16, Q8_0 y para servir varias peticiones concurrentes con contextos largos.
- El factor limitante a contextos largos es el cache KV. Con la configuracion publica de GLM-4-9B (40 capas, atencion GQA con 2 cabezas KV, dimension de cabeza 128) el cache ronda las decenas de KB por token en fp16, de modo que a 32 000-128 000 tokens puede anadir varios GB y superar al propio modelo en memoria. Se recomienda cuantizar el cache KV o limitar la ventana.
- Opciones de despliegue: llama.cpp (referencia directa del formato), LM Studio (indicado en la model card), Ollama, kobold.cpp, text-generation-webui y cualquier runtime compatible con GGUF. Para servir el modelo en safetensors con mayor concurrencia, vLLM o TGI sobre el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rbinrs/glm-4-9b-chat-abliterated-GGUF | 9,4 B | no confirmado en la ficha (el base declara 128 000) | glm-4 (other) | GGUF en HuggingFace | Sin filtros de rechazo; sin benchmarks publicados |
| THUDM/glm-4-9b-chat | 9,4 B | 128 000 tokens | glm-4 | safetensors y GGUF | Modelo alineado de referencia; con filtros activos |
| Qwen2.5-7B-Instruct | 7,6 B | 128 000 tokens | Apache-2.0 | safetensors, GGUF, vLLM | Licencia permisiva, multilingue amplio, ecosistema muy extendido |
| Llama-3.1-8B-Instruct | 8,0 B | 128 000 tokens | Llama 3.1 Community License | safetensors, GGUF, vLLM | Buen rendimiento general, restricciones de licencia para grandes despliegues |
| Gemma-2-9B-it | 9,2 B | 8 000 tokens | Gemma Terms of Use | safetensors, GGUF | Ventana corta, sin soporte de chino |

Los datos de esta tabla corresponden a los modelos de referencia y no incluyen comparaciones de rendimiento con la variante abliterada, para la que no se han publicado resultados. La eleccion entre estas alternativas depende mas de la licencia (Apache-2.0 de Qwen2.5 frente a glm-4) y del idioma objetivo que de diferencias significativas de tamano.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: al eliminar la direccion de rechazo, el modelo puede generar contenido danino, ilegal o gravemente ofensivo. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- La abliteracion no es selectiva: ademas de los rechazos indeseados puede degradar la coherencia, la utilidad general y el seguimiento de instrucciones. No hay evaluaciones publicadas que cuantifiquen esa perdida en esta variante.
- Riesgo de alucinacion: es un modelo de 9,4 B; tiende a inventar datos, citas y referencias, especialmente en tareas factuales o de razonamiento de varios pasos.
- Idiomas: solo chino e ingles declarados. El castellano no esta soportado oficialmente y su rendimiento sera inferior, con posibles cambios de idioma a mitad de respuesta.
- Licencia glm-4, no permisiva: se etiqueta como "other" en HuggingFace y enlaza a los terminos de THUDM/Zhipu. Antes de un uso comercial hay que revisar el texto completo, ya que impone condiciones y obligaciones adicionales que no tienen Qwen2.5 o Llama 3.1.
- Procedencia a verificar: el repositorio (rbinrs) redistribuye cuantizaciones cuyo campo quantized_by apunta a bartowski, sin descargas ni valoraciones registradas en el momento de la consulta. Conviene contrastar hashes con el repositorio de origen.
- Fecha de creacion anomala (2026-09-25) en los metadatos del repositorio, lo que sugiere un posible error de marca temporal o una subida reempaquetada.
- Confusion de nombre: aunque el ID incluye "gguf" y "abliterated", el modelo base listado es byroneverson/glm-4-9b-chat-abliterated, no el GLM-4-9B-Chat oficial; no debe asumirse equivalencia funcional con este ultimo.
- Sin garantias de calidad: al no existir benchmarks publicados, cualquier decision de despliegue deberia apoyarse en una evaluacion propia sobre el dominio concreto de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rbinrs/glm-4-9b-chat-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/byroneverson/glm-4-9b-chat-abliterated
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/glm-4-9b-chat-abliterated-GGUF
- Modelo original de THUDM: https://huggingface.co/THUDM/glm-4-9b-chat
- Licencia glm-4: https://huggingface.co/THUDM/glm-4-9b-chat/blob/main/LICENSE
- llama.cpp, release b3634 usada para cuantizar: https://github.com/ggerganov/llama.cpp/releases/tag/b3634
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp/
- Dataset de calibracion imatrix empleado: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
- Paper de la familia GLM-4 (referencia general): https://arxiv.org/abs/2406.12793
