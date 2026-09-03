# AlphaAvatar/router-semantic-addressing-qwen3-0.6b-gguf

## Resumen

AlphaAvatar Router — Semantic Addressing es un clasificador binario desarrollado por AlphaAvatar para el sistema de enrutado v0.6.7. Su funcion es determinar si el hablante actual se esta dirigiendo al Avatar en una conversacion. No es un modelo de generacion de texto: se pre-rellena un prompt congelado mediante una unica llamada a `llama_decode()`, se leen los logits de la ultima posicion con `llama_get_logits_ith(ctx, -1)` y se aplica un softmax de dos clases sobre exactamente dos logits de token. No se construye sampler ni se genera ningun token.

El modelo se basa en Qwen/Qwen3-0.6B, cuantizado a GGUF, con una ventana de contexto de 2048 tokens. Esta pensado para integrarse como una senal mas dentro del sistema de fusion de direccionamiento (Addressing Fusion) del router AlphaAvatar, no como una compuerta independiente. Su relevancia radica en que aborda un problema especifico de sistemas conversacionales: detectar si una intervencion esta dirigida al agente o a un tercero, con un diseno de inferencia minimalista que evita la generacion autoregresiva.

La validacion publicada indica que la cuantizacion Q8_0 es el artefacto de produccion, mientras que la Q4_K_M fallo la validacion y no debe usarse para inferencia. El modelo alcanza un 76,9 % de precision en el conjunto de reporte, con una tasa de falsos positivos de 0,211 y un AUROC de 0,787.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | Q8_0 (produccion), Q4_K_M (rechazada) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer denso Qwen/Qwen3-0.6B, con 751,6 millones de parametros. No se trata de un modelo MoE ni hibrido. El prompt de entrada esta congelado y fijado por hash SHA256 (1555 bytes); contiene tres placeholders que se sustituyen exactamente una vez, de izquierda a derecha: `{{avatar_identities}}`, `{{previous_focus}}` y `{{transcript_segments}}`. El prompt termina con la secuencia ` response\n\n`, cuyo token final es el id 271.

La inferencia consiste en una unica pasada hacia delante: se pre-rellena el prompt, se leen los logits de la ultima posicion y se aplica softmax sobre dos tokens concretos: el token `"0"` (id 15) y el token `"1"` (id 16). Ambos ids se verifican contra el vocabulario del GGUF en tiempo de ejecucion y deben coincidir con el manifiesto `classifier.json`; si no coinciden, el runtime debe abortar.

No se dispone de informacion publica sobre el proceso de entrenamiento: no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. El manifiesto incluye un hash del prompt, los ids de token, el umbral y un resumen de evaluacion, pero no detalles del fine-tuning.

## Capacidades

- Clasificacion binaria de direccionamiento: determina si el hablante actual se dirige al Avatar (etiqueta 1) o no (etiqueta 0).
- Inferencia sin generacion: no produce texto, solo dos logits de token en la ultima posicion del prompt.
- Soporte de contexto conversacional: procesa segmentos de transcripcion marcados como `[final]` o `[interim]`, junto con identidades del Avatar y el foco previo de la conversacion.
- Salida calibrada por umbral: devuelve `p_avatar` y clasifica en tres bandas: `AVATAR` (p >= 0,3755), `NON_AVATAR` (p <= 0,1645) y `UNKNOWN` (intermedio).
- Multilingue limitado: entrenado para ingles y chino.
- Sin capacidades de tool calling, agentes, vision ni audio: es un clasificador puro, no un modelo generativo.

## Casos de uso

- Enrutado de conversaciones en asistentes virtuales: el modelo determina si una intervencion del usuario esta dirigida al agente o a un tercero, permitiendo al router decidir si debe responder o permanecer en espera.
- Moderacion de chats grupales: en escenarios con multiples participantes, ayuda a identificar cuando el Avatar es el destinatario explicito del mensaje.
- Sistemas de atencion al cliente con supervision humana: distingue entre peticiones dirigidas al agente automatico y comentarios entre humanos, evitando respuestas no solicitadas.
- Analisis de transcripciones para entrenamiento: etiquetado automatico de conversaciones para construir datasets de direccionamiento, con la salida `p_avatar` como senal debil que un humano puede revisar.
- Fusion de senales en sistemas de dialogos multi-modulo: se integra como una entrada mas dentro de Addressing Fusion, combinando su salida con otras heuristicas para tomar decisiones de enrutado.
- Deteccion de cambios de direccionamiento en transcripciones intermedias: los casos de evaluacion `flip_en_001a` a `flip_en_001b` muestran que una revision que parece no dirigida al Avatar puede resolverse como una direccion al Avatar, util para transcriptions en curso.

## Benchmarks y rendimiento

Los datos de evaluacion publicados corresponden al conjunto de reporte (held-out) con el artefacto Q8_0 aceptado:

| Metrica | Valor |
|---|---|
| Precision | 76,9 % |
| Tasa de falsos positivos | 0,211 |
| AUROC | 0,787 |
| Precision de la banda AVATAR | 0,78 |
| Casos en banda UNKNOWN | 80 % (40 de 50) |
| Casos en banda NON_AVATAR | 0 de 50 |

El rango de probabilidades de salida se comprime aproximadamente en `[0.12, 0.53]`. La banda `NON_AVATAR` nunca se activo en el conjunto de reporte, y ninguno de los tres casos de final-negativo-fuerte se resolvio en ella. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo Q8_0 ocupa aproximadamente 1,3 GB en disco (tamano del repositorio), por lo que la inferencia cabe en cualquier GPU consumer con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 3050 o superiores.
- GPU recomendadas: cualquier GPU moderna de NVIDIA con soporte CUDA; una RTX 3060 o superior ofrece margen comodo. Tambien puede ejecutarse en CPU con llama.cpp sin problemas de latencia apreciables, dado el tamano reducido del modelo.
- Opciones de despliegue: llama.cpp es el runtime de referencia (el modelo se construyo contra el commit `50f068f` del tag `b10679`). Tambien es compatible con cualquier backend que soporte GGUF, como Ollama o llama-cpp-python.
- Latencia: no se han publicado mediciones de latencia, pero al ser una unica pasada hacia delante con 0,6B parametros en Q8_0, se espera una latencia de decenas de milisegundos en GPU consumer y de cientos de milisegundos en CPU.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| AlphaAvatar Router (Qwen3-0.6B) | 751 M | 2048 | Apache-2.0 | Clasificador binario de direccionamiento |
| Qwen3-0.6B (base) | 751 M | 2048 (ampliable) | Apache-2.0 | Generacion de texto generalista |
| BERT-base (fine-tuned para clasificacion) | 110 M | 512 | Apache-2.0 | Clasificacion de texto general |

No se dispone de comparaciones directas publicadas con otros clasificadores de direccionamiento. La alternativa mas proxima seria un fine-tuning de un modelo tipo BERT o DeBERTa para clasificacion binaria, pero no hay datos de rendimiento comparables en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M esta publicada pero rechazada: destruye la senal de la que depende la tarea. No debe usarse para inferencia bajo ninguna circunstancia.
- El modelo es una senal debil: sus probabilidades se comprimen en `[0.12, 0.53]`, y la banda `NON_AVATAR` casi nunca se activa. No debe usarse como compuerta independiente ni como evidencia terminal de no-direccionamiento.
- El 80 % de los casos de reporte caen en la banda `UNKNOWN`, lo que limita su utilidad como decision autonoma.
- Un resultado de etiqueta 0 en una transcripcion intermedia nunca es terminal: la integracion debe distinguir entre interino-0, final-0, final-fuerte-no-Avatar e incierto.
- El prompt esta congelado por hash: cualquier cambio en el prompt, incluyendo espacios finales o saltos de linea, invalida la verificacion y debe fallar.
- El runtime debe verificar los ids de token contra el vocabulario del GGUF y abortar si no coinciden con `classifier.json`.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un componente interno del router AlphaAvatar y su manifiesto (`classifier.json`) debe respetarse para una integracion correcta.
- Solo soporta ingles y chino; no se garantiza rendimiento en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlphaAvatar/router-semantic-addressing-qwen3-0.6b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
