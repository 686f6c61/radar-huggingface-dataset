# ChatoyantAI/gemma-4-12b-roleplay-sft-regmix-v2

## Resumen

Gemma 4 12B Roleplay SFT RegMix v2 es un adaptador LoRA de ajuste supervisado (SFT) publicado por ChatoyantAI sobre el modelo base `google/gemma-4-12B-it`. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador, la configuracion PEFT, el tokenizer y la plantilla de chat, con un tamano total de 0,6 GB. El objetivo declarado es especializar el modelo base en generacion conversacional orientada a roleplay e interpretacion de personajes.

El entrenamiento se realizo sobre una mezcla de 50.000 ejemplos unicos procedentes de seis fuentes publicas (CoSER, XPersona, Aya, Tulu-3-SFT-Mixture, SmolTalk e Infinity-Instruct), combinadas segun la configuracion RegMix config-025, derivada de 64 experimentos de seleccion con un proxy Gemma-E2B. La mezcla suma 5.773.968 tokens supervisados bajo el tokenizer de Gemma y se entreno durante 2 epocas.

La relevancia de esta ficha es doble: por un lado, ilustra una practica de publicacion reproducible y muy documentada (hash SHA-256 del conjunto de entrenamiento, recuento por dominio, configuracion completa de hiperparametros); por otro, es un ejemplo de adaptador de nicho con trazabilidad limitada de calidad, ya que no incluye evaluacion comparativa publicada ni especificacion de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Gemma 4 (arquitectura "unified" del modelo base); el LoRA se aplica solo al decodificador de texto |
| Parametros totales | 12B del modelo base mas 131.137.536 parametros entrenables del adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el modelo base en la informacion proporcionada; la longitud maxima de secuencia usada en el entrenamiento fue de 8.192 tokens |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en safetensors (entrenados en BF16) |
| Idiomas soportados | No disponible; el corpus de entrenamiento incluye Aya, fuente multilingue, pero no se declara cobertura de idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no incluye pesos del base fusionados |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-4-12B-it`, un modelo de arquitectura Gemma 4 "unified" que el autor carga mediante `AutoModelForImageTextToText` (es decir, la clase multimodal de la familia). El LoRA se aplica exclusivamente a las proyecciones de atencion y MLP del decodificador de texto, con r=32, alpha=64 y dropout=0. Los parametros entrenables suman 131.137.536.

La mezcla de datos combina seis fuentes publicas, con esta distribucion:

| Dominio | Filas | % filas | Tokens supervisados | % tokens | Mediana de tokens |
|---|---:|---:|---:|---:|---:|
| coser | 22.637 | 45,27% | 831.207 | 14,40% | 30 |
| xpersona | 2.672 | 5,34% | 36.261 | 0,63% | 13 |
| aya | 6.346 | 12,69% | 857.371 | 14,85% | 43 |
| tulu | 1.382 | 2,76% | 325.099 | 5,63% | 110 |
| smoltalk | 9.466 | 18,93% | 2.932.980 | 50,80% | 282 |
| infinity | 7.497 | 14,99% | 791.050 | 13,70% | 22 |
| Total | 50.000 | 100% | 5.773.968 | 100% | 35 |

El conjunto contiene 50.000 identificadores unicos y 50.000 hashes de contenido unicos, con cero solapamiento de grupo con el conjunto de retencion (holdout). El hash SHA-256 del conjunto de entrenamiento es `8c626b338270652de2e4d1130b28d8b0fc2c2eca0b90f5dcffa7580a26e0d859`.

Configuracion de entrenamiento: 2 epocas, longitud maxima de secuencia 8.192, learning rate 1e-4 con scheduler cosine y warmup del 10%, batch efectivo de 16 (2 GPU x micro-batch 4 x acumulacion de gradientes 2), precision BF16. La funcion de perdida calcula primero la NLL media sobre los tokens supervisados de cada muestra y despues la media entre muestras, de modo que las muestras largas no dominan el gradiente. El entrenamiento finalizo el 2026-09-17 a las 19:40 UTC y el artefacto publicado corresponde al paso 6.250 (config-025). El autor no reclama que esta configuracion sea el optimo global sobre Gemma 12B.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay e interpretacion de personajes, que es la finalidad declarada del ajuste.
- Conversacion general y asistencia basica heredadas del modelo base `gemma-4-12B-it`.
- Generacion con contexto de hasta 8.192 tokens en la configuracion de entrenamiento (el limite real depende del modelo base).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el ajuste esta orientado a dialogo, no a tareas agenticas.
- Capacidades multilingues: no declaradas; el corpus incluye Aya, pero no se especifica que idiomas conserva el adaptador.
- Vision: el modelo base pertenece a la arquitectura unificada de Gemma 4 y se carga con `AutoModelForImageTextToText`, pero el LoRA solo afecta al decodificador de texto, por lo que el ajuste no modifica el comportamiento multimodal.
- Capacidades especiales (modo thinking, audio, decodificacion especulativa): no disponibles en la informacion proporcionada.

## Casos de uso

- Personajes conversacionales para entretenimiento: el adaptador esta entrenado con fuentes de roleplay (CoSER, XPersona) y puede mantener interacciones multi-turno con una personalidad consistente usando la plantilla de chat incluida en el repositorio.
- Prototipado de asistentes con tono y estilo propios: al ser un LoRA de 0,6 GB sobre un base de 12B, permite cambiar el comportamiento conversacional sin reentrenar el modelo completo ni duplicar el almacenamiento por variante.
- Generacion de dialogos sinteticos para anotacion: se puede usar para producir conversaciones de referencia en tareas de etiquetado o aumento de datos, partiendo de prompts de personaje y escenario.
- Escritura creativa asistida: continuacion de dialogos, guiones conversacionales y variaciones de registro a partir de un contexto largo, gracias a los 8.192 tokens de secuencia usados en entrenamiento.
- Simulacion de entrevistas o ensayo de conversaciones dificiles: el modelo puede adoptar un rol concreto (reclutador, cliente enfadado, usuario novel) y responder de forma coherente dentro de ese papel.
- Investigacion sobre mezcla de datos SFT: el repositorio documenta la receta RegMix, el recuento de tokens por dominio y el hash del dataset, lo que lo convierte en un caso util para estudiar como afecta la composicion de la mezcla al comportamiento final de un adaptador.
- Despliegue multi-tenant con adaptadores intercambiables: en servidores con soporte de LoRA dinamico (por ejemplo, vLLM con adaptadores), se pueden servir varias personalidades sobre el mismo base compartiendo memoria de pesos.
- Comparativas internas de calidad de datos: al publicarse con proxy de seleccion (Gemma-E2B) y configuracion numerada, sirve como punto de partida reproducible para comparar otras configuraciones de mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra) para este adaptador, ni comparacion con el modelo base o con otras mezclas. Tampoco se documenta una evaluacion cualitativa del comportamiento en roleplay mas alla de la descripcion de la receta de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade una sobrecarga marginal (aproximadamente 0,26 GB en BF16 para 131 millones de parametros). El consumo lo determina el modelo base de 12B: en BF16, del orden de 24-26 GB de pesos mas cache KV; en cuantizacion de 8 bits, en torno a 13-15 GB; en 4 bits, en torno a 7-9 GB. Estas cifras son estimaciones aritmeticas, no mediciones publicadas para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para BF16 sin cuantizar. Para cuantizacion de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para pesos y contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con cuantizacion de 4 u 8 bits, y potencialmente en 16 GB con cuantizacion agresiva y contexto reducido. Con 12 GB no es viable salvo cuantizaciones muy agresivas y contextos cortos.
- Opciones de despliegue: PEFT + Transformers (ruta de referencia indicada por el autor), `AutoModelForImageTextToText` con el adaptador montado; servidores con soporte de LoRA como vLLM o TGI; llama.cpp u Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Almacenamiento: 0,6 GB para el repositorio del adaptador, mas la descarga completa del base `google/gemma-4-12B-it`, que no se incluye.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatoyantAI/gemma-4-12b-roleplay-sft-regmix-v2 | 12B base + 131,1M entrenables (LoRA) | No disponible (8.192 en entrenamiento) | safetensors (PEFT/LoRA) | No disponible | 15 descargas, 0 likes |
| google/gemma-4-12B-it (modelo base) | 12B | No disponible en la informacion proporcionada | safetensors | No disponible | Modelo base de referencia |
| Otros adaptadores LoRA de roleplay sobre Gemma 4 | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos verificables sobre alternativas comparables dentro de la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento, contexto o licencia frente a otros adaptadores de la misma categoria.

## Limitaciones y advertencias

- Licencia no especificada: no se declara licencia para el adaptador, lo que impide determinar si el uso comercial esta permitido. Ademas, el uso del modelo base `google/gemma-4-12B-it` queda sujeto a los terminos de Gemma de Google, que no se detallan aqui.
- Sin evaluacion publicada: no hay benchmarks, ni evaluacion humana, ni comparacion con el base, por lo que la mejora real en roleplay no esta cuantificada.
- Riesgo de alucinacion: es un modelo conversacional ajustado con SFT; no incorpora mecanismos de verificacion factual ni recuperacion, y en modo roleplay la propension a inventar contenido es inherente al caso de uso.
- Desequilibrio de la mezcla: SmolTalk aporta el 50,80% de los tokens supervisados y coser el 45,27% de las filas, mientras que xpersona aporta solo el 0,63% de los tokens. Este sesgo de composicion puede reflejarse en el estilo de las respuestas.
- Caveat de procedencia declarado por el autor: la mezcla no incluye la fuente "Lusy" ni se ha usado como objetivo de filtrado u optimizacion. Es una aclaracion relevante si se evalua la trazabilidad de los datos.
- Idiomas no declarados: no se puede confirmar que el adaptador mantenga un rendimiento multilingue equivalente al del modelo base.
- Degradacion potencial de capacidades generales: un SFT especifico de roleplay sobre un base instruct puede reducir la adherencia a instrucciones estrictas, el formato de salida estructurado o el rendimiento en tareas tecnicas.
- Madurez limitada: 15 descargas y 0 likes, con publicacion y actualizacion el mismo dia (2026-09-18). Es un artefacto reciente sin validacion por parte de la comunidad.
- Arquitectura multimodal no ajustada: el LoRA solo toca el decodificador de texto, por lo que cualquier expectativa de mejora en tareas de vision es infundada.
- Entrenamiento con 2 epocas sobre 50.000 muestras y batch efectivo de 16: el numero total de pasos (6.250) limita el ajuste fino del comportamiento; el propio autor indica que no reclama que sea la mejor configuracion posible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChatoyantAI/gemma-4-12b-roleplay-sft-regmix-v2
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Fuente de datos CoSER: no disponible en la informacion proporcionada
- Fuente de datos XPersona: no disponible en la informacion proporcionada
- Fuente de datos Aya: no disponible en la informacion proporcionada
- Fuente de datos Tulu-3-SFT-Mixture: no disponible en la informacion proporcionada
- Fuente de datos SmolTalk: no disponible en la informacion proporcionada
- Fuente de datos Infinity-Instruct: no disponible en la informacion proporcionada
- Paper o blog de la receta RegMix: no disponible en la informacion proporcionada
- Repositorios, demos o spaces asociados: no disponible en la informacion proporcionada
