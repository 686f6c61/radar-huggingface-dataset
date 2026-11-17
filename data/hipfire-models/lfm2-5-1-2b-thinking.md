# hipfire-models/LFM2.5-1.2B-Thinking

## Resumen
hipfire-LFM2.5-1.2B-Thinking es una cuantizacion Q8 del modelo LiquidAI/LFM2.5-1.2B-Thinking, la variante de razonamiento del modelo edge de 1.200 millones de parametros de Liquid AI. El modelo original emplea una arquitectura hibrida que combina capas de convolucion corta con compuerta (gated short-conv) y capas de atencion completa con GQA, disenada para ejecutarse en dispositivos con recursos limitados manteniendo una ventana de contexto de 128K tokens. Esta version, publicada por hipfire-models, emite bloques de razonamiento `<think>...</think>` antes de la respuesta final.

La relevancia de esta ficha radica en que no se trata de una cuantizacion convencional: el artefacto `.q8` solo funciona con el motor de inferencia hipfire (Rust, HIP/ROCm directo, sin Python en la ruta critica) y no es compatible con llama.cpp ni con transformers. Todos los tensores se almacenan en Q8 y se descomprimen a f32 al vuelo dentro de los kernels GEMV. Esto lo convierte en una opcion especifica para hardware AMD con ROCm, no en un sustituto general del modelo original.

El modelo resuelve el caso de uso de razonamiento local en GPUs de consumo con arquitectura RDNA3, ofreciendo una tasa de decodificacion reportada de aproximadamente 395 tok/s en una RX 7900 XTX. Su licencia LFM Open License v1.0 se hereda del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas (10 gated short-conv + 6 GQA full-attention) |
| Parametros totales | 1.2B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q8 (todos los tensores, formato propietario `.q8`) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | `.q8` propietario de hipfire (no GGUF, no safetensors) |

Detalles adicionales de arquitectura: hidden size 2048, SwiGLU FFN con dimension 12288, vocabulario de 65536 tokens, 32 cabezas de query y 8 cabezas KV en las capas de atencion. El identificador de arquitectura en la cabecera HFQ es `arch_id 11`.

## Arquitectura y entrenamiento
La arquitectura del modelo base es un transformer hibrido orientado a edge computing. De las 16 capas totales, 10 son convoluciones cortas con compuerta y 6 son capas de atencion completa con GQA (32 cabezas de query, 8 de clave/valor). Esta mezcla reduce el coste computacional de la atencion en la mayor parte de la red manteniendo capacidad de modelado de contexto largo, lo que permite sostener una ventana de 128K tokens con un presupuesto de parametros de 1.2B. El FFN usa SwiGLU con dimension intermedia 12288 y el vocabulario es de 65536 tokens.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento en el modelo upstream. La variante Thinking incorpora un modo de razonamiento explicito que genera un bloque `<think>...</think>` antes de la respuesta final. La cuantizacion Q8 realizada por hipfire-models mantiene todos los tensores en 8 bits y los descomprime a f32 dentro de los kernels GEMV durante la inferencia; no se documenta calibracion adicional ni ajuste posterior a la cuantizacion.

## Capacidades
- Generacion de texto con modo de razonamiento explicito: emite un bloque `<think>...</think>` con el proceso de razonamiento antes de la respuesta final.
- Razonamiento multi-paso: el formato de thinking permite cadenas de deduccion antes de concluir.
- Soporte multilingue en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Procesamiento de contexto largo: hasta 128K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Plantilla de chat Jinja integrada en el propio archivo, con comportamiento por defecto que elimina los bloques `<think>` de turnos anteriores del historial (`keep_past_thinking=false`), replicando el comportamiento upstream.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni capacidades de agente.

## Casos de uso
- Razonamiento local en GPU AMD de consumo: el modelo esta disenado para ejecutarse con el motor hipfire sobre ROCm en tarjetas RDNA3 como la RX 7900 XTX, lo que permite tener un modelo con modo de razonamiento sin depender de servicios en la nube.
- Asistente de codigo y explicaciones tecnicas en local: con 128K de contexto puede recibir archivos completos o varios ficheros de un repositorio y razonar sobre ellos antes de responder, util en entornos donde el codigo no puede salir de la maquina.
- Procesamiento de documentos largos multilingues: la ventana de 128K y el soporte de ocho idiomas permiten resumir, extraer y comparar documentacion en ingles, chino, arabe, japones, coreano, frances, aleman y espanol.
- Chatbot de atencion al cliente con historial extenso: el modelo conserva contexto de conversaciones largas y el template elimina los bloques de razonamiento antiguos para no inflar el historial, lo que reduce el consumo de tokens en produccion.
- Prototipado de pipelines de razonamiento en Rust: al integrarse con el motor hipfire (Rust, sin Python en la ruta critica), encaja en servicios backend de baja latencia escritos en Rust que necesiten un paso de inferencia local.
- Evaluacion de tecnicas de cuantizacion Q8: util como referencia para comparar la calidad de un modelo de razonamiento de 1.2B cuantizado a 8 bits frente al original en f32/bf16 en tareas de deduccion.
- Generacion de respuestas con traza de razonamiento auditable: el bloque `<think>` permite registrar el proceso de deduccion del modelo para revision posterior en entornos de investigacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la validacion del autor en una RX 7900 XTX (gfx1100) con hipfire v0.2.1 y decodificacion greedy (temperature 0.0):

| Metrica | Valor |
|---|---|
| Throughput de decodificacion | ~395 tok/s |
| Latencia de prefill | 45 ms |
| Hardware | AMD RX 7900 XTX (RDNA3, gfx1100) |
| Motor | hipfire v0.2.1 |

## Requisitos de hardware
- VRAM estimada: el archivo `.q8` ocupa 1.25 GB en disco; al descomprimir a f32 al vuelo en los kernels, el consumo en memoria es superior al tamano del archivo, aunque no se documenta la cifra exacta de VRAM en la informacion disponible.
- GPU recomendadas: AMD RDNA3 con soporte ROCm, como la RX 7900 XTX (unica configuracion validada por el autor). El motor usa HIP/ROCm directo, por lo que no funciona en GPUs NVIDIA ni en CPU.
- Cabe en GPU de consumo: si, en tarjetas AMD RDNA3 compatibles con ROCm; el modelo de 1.2B en Q8 es de gama baja en cuanto a requisitos de memoria.
- Opciones de despliegue: exclusivamente el motor hipfire (`hipfire run`, `hipfire serve`, `hipfire pull`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, ya que el formato `.q8` es propietario.
- Latencia y throughput: ~395 tok/s de decodificacion y 45 ms de prefill en RX 7900 XTX con hipfire v0.2.1, segun la validacion del autor.
- Nota de uso: los turnos de razonamiento necesitan varios cientos de tokens de `max_tokens` antes de que aparezca la respuesta tras `</think>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hipfire-LFM2.5-1.2B-Thinking | 1.2B | 128K | `.q8` (hipfire) | LFM Open License v1.0 | Hugging Face, solo motor hipfire |
| LiquidAI/LFM2.5-1.2B-Thinking | 1.2B | 128K | safetensors (upstream) | LFM Open License v1.0 | Hugging Face, transformers y ecosistema estandar |
| LFM2.5-1.2B (variante no Thinking) | 1.2B | 128K | safetensors | LFM Open License v1.0 | Hugging Face |

La comparativa con modelos de otros fabricantes del mismo rango (por ejemplo, variantes de 1-2B de otras familias) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Compatibilidad restringida: el formato `.q8` solo carga en el motor hipfire; no funciona en llama.cpp, transformers, vLLM ni Ollama. Esto limita su integracion en stacks existentes.
- Dependencia de hardware AMD: el motor usa HIP/ROCm directo y la unica configuracion validada es una RX 7900 XTX (gfx1100). No hay validacion documentada en otras GPUs.
- Riesgo de alucinacion: como cualquier modelo de 1.2B, la capacidad de razonamiento es limitada y el modo thinking no garantiza correccion factual; el bloque `<think>` puede contener deducciones erroneas que condicionen la respuesta final.
- Artefacto cosmetico conocido: al final de una completion greedy el modelo puede emitir una secuencia corta de tokens de byte-fallback (un emoji) que se muestra como caracteres de reemplazo `�` en clientes que decodifican token a token; el texto de la respuesta no se ve afectado.
- Consumo de tokens: el modo de razonamiento incrementa el numero de tokens generados; hay que reservar `max_tokens` suficiente o la respuesta final puede truncarse antes de `</think>`.
- Licencia: LFM Open License v1.0, heredada del modelo upstream. Es una licencia "other" con terminos propios; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- Idiomas: aunque soporta ocho idiomas, no se documenta el rendimiento relativo por idioma; el espanol esta incluido pero sin evaluacion publicada en la informacion disponible.
- Sin datos de benchmarks: no hay resultados publicados de MMLU, GSM8K, HumanEval ni similares, lo que impide una evaluacion objetiva de la calidad frente al modelo original.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hipfire-models/LFM2.5-1.2B-Thinking
- Modelo base upstream: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Licencia upstream: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/LICENSE
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Organizacion Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
