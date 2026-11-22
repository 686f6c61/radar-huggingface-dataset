# khtsly/Kai-2.0-Base

## Resumen

Kai 2.0 Base es un modelo de lenguaje de tipo decoder denso especializado en código Luau y Roblox, desarrollado por el usuario khtsly bajo el paraguas de la familia LuauCoder 2.0. Con 643 millones de parametros totales (596M no pertenecientes a embeddings) y 28 capas, se posiciona como el modelo de tamano medio de una familia que tambien incluye Moana 2B y Nalu 0.3B. Ha sido entrenado sobre 63.000 millones de tokens y se distribuye con licencia Apache 2.0.

El modelo emplea una arquitectura transformer con innovaciones destacables en el mecanismo de atencion: composicion mixta de capas con rotacion posicional (21 capas RoPE y 7 capas NoPE), atencion multi-cabeza con comparticion de claves y valores (2 KV heads frente a 20 query heads, de las cuales solo 10 se computan), y un esquema denominado CCVHA + DiffAttn V2 + XSA. Incorpora ademas conexiones residuales por bloques (Block AttnRes en 7 bloques de 4 capas), convoluciones depthwise y postmix por cabeza, y un vocabulario de 32.768 tokens con embeddings atados.

Su relevancia radica en ser uno de los pocos modelos abiertos orientados especificamente a Luau, el lenguaje de scripting de Roblox, con una ventana de contexto de 65.536 tokens. Al tratarse de un modelo base sin plantilla de chat, su uso previsto es la continuacion de texto y la autocompletacion de codigo, no el dialogo instruccional. Su tamano compacto lo hace apto para inferencia en dispositivos con recursos limitados, en linea con la etiqueta `on-device` que acompana al repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso |
| Parametros totales | 643M (596M no-embedding) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code`) |

Otras especificaciones tecnicas relevantes:

| Parametro | Valor |
|---|---|
| Numero de capas | 28 |
| Composicion de atencion | 21 capas RoPE + 7 capas NoPE |
| Mecanismo de atencion | CCVHA + DiffAttn V2 + XSA |
| Dimension oculta | 1408 |
| Cabezas query | 20 (10 computadas) |
| Cabezas KV | 2 |
| Cabezas de salida | 10 |
| Dimension por cabeza | 128 |
| Convoluciones | 2 depthwise + 2 por cabeza |
| Rango de postmix por cabeza | 2 |
| Conexiones residuales | Block AttnRes (7 bloques de 4 capas) |
| Dimension feed-forward | 3840 |
| Funcion de activacion | SwiGLU |
| Normalizacion | RMSNorm, QK-Norm |
| RoPE theta | 500.000 |
| Tamano de vocabulario | 32.768 |
| Embeddings | Atados (tied) |
| Logit soft cap | ±30 |
| Modalidad | Texto |
| Tokens de entrenamiento | 63.000 millones |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

Kai 2.0 Base es un transformer decoder denso de 28 capas con dimension oculta de 1408 y feed-forward de 3840 con activacion SwiGLU. La innovacion principal reside en su esquema de atencion: combina capas con RoPE (21) y capas sin codificacion posicional explicita (7 NoPE), lo que en la literatura suele asociarse a mejor generalizacion en longitudes de contexto largas. El mecanismo se describe como CCVHA + DiffAttn V2 + XSA, con 20 cabezas de consulta de las que solo 10 se computan y unicamente 2 cabezas de clave-valor, lo que reduce drasticamente el coste de memoria del KV cache. Se anaden convoluciones depthwise y por cabeza (2 taps cada una), un postmix de rango 2 por cabeza y conexiones residuales agrupadas en 7 bloques de 4 capas (Block AttnRes). La normalizacion emplea RMSNorm con QK-Norm y los logits se limitan con un soft cap de ±30.

El entrenamiento se realizo sobre 63.000 millones de tokens, aunque la model card no detalla la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste instruccional. Al tratarse de un modelo base, no incorpora plantilla de chat ni alineamiento conversacional: su comportamiento esperado es la continuacion de texto a partir de un prefijo. El vocabulario de 32.768 tokens con embeddings atados y el uso de `trust_remote_code` indican una implementacion personalizada en la libreria transformers, probablemente con modulos propios para las variantes de atencion descritas.

## Capacidades

- Generacion de texto autoregresiva y continuacion de codigo, especialmente en Luau y el ecosistema Roblox.
- Autocompletacion de funciones, estructuras de control y APIs del entorno Roblox a partir de un prefijo de codigo.
- Razonamiento sobre codigo a nivel sintactico y semantico dentro del dominio Luau (no es un modelo de proposito general).
- Soporte de contexto largo de hasta 65.536 tokens, adecuado para ficheros de script extensos o multiples modulos en una sola pasada.
- Capacidad multilingue limitada al ingles segun la model card, aunque el codigo Luau en si no es un lenguaje natural.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni razonamiento multi-paso documentadas.
- No dispone de modo thinking, vision ni audio.
- Al ser un modelo base, no sigue instrucciones ni mantiene dialogos multi-turno de forma fiable.

## Casos de uso

- Autocompletacion de codigo Luau en editores: el modelo puede integrarse como backend de un plugin de editor (por ejemplo, para Roblox Studio) que envie el prefijo del script y reciba la continuacion, aprovechando su entrenamiento especifico en Luau y su contexto de 65.536 tokens para considerar el fichero completo.
- Generacion de plantillas de scripts de Roblox: util para producir esqueletos de scripts de servidor o cliente (RemoteEvents, DataStores, sistemas de inventario) a partir de un comentario o firma de funcion inicial, que el modelo completa con codigo idiomatico.
- Relleno de funciones auxiliares en pipelines de CI: dado que el modelo continua texto, puede usarse en tareas de "code infilling" donde se proporciona el contexto anterior y posterior de una funcion y se pide el cuerpo, integrándolo en herramientas de revision o generacion de tests para proyectos Roblox.
- Migracion y modernizacion de scripts legacy: el modelo puede tomar fragmentos de codigo antiguo como prefijo y generar versiones actualizadas de APIs de Roblox, útil en tareas de refactorizacion asistida por lotes.
- Generacion de documentacion tecnica de modulos Luau: a partir de un fichero de codigo como prefijo, el modelo puede continuar con comentarios descriptivos o ejemplos de uso, siempre que se le guie con el formato adecuado.
- Prototipado rapido en entornos con recursos limitados: con 643M de parametros y pesos safetensors de 1,3 GB, puede desplegarse en estaciones de trabajo sin GPU dedicada o en GPUs de consumo para generar borradores de codigo en local, sin depender de servicios en la nube.
- Educacion y formacion en Luau: como modelo base, puede emplearse para generar ejemplos de codigo y ejercicios, aunque requiere supervision humana por su tendencia a la continuacion literal sin verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,7 GB para pesos; en 4 bits, en torno a 0,4 GB, aunque no se documentan cuantizaciones oficiales en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 en contextos cortos; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo esta etiquetado como `on-device`, por lo que se espera su uso en hardware de consumo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM en bf16, y en GPUs integradas o CPU con cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `attn_implementation` configurable (`sdpa` o `flash_attention_2`). No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada; la naturaleza de codigo personalizado (`custom_code`) puede requerir adaptaciones para motores de inferencia alternativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kai 2.0 Base (khtsly) | 643M | 65.536 | Luau / Roblox | Apache 2.0 | Hugging Face |
| Moana 2B (familia LuauCoder 2.0) | 2B (segun model card) | no disponible | Luau / Roblox | no disponible | no disponible |
| Nalu 0.3B (familia LuauCoder 2.0) | 0,3B (segun model card) | no disponible | Luau / Roblox | no disponible | no disponible |

La model card unicamente menciona a Moana 2B y Nalu 0.3B como miembros de la misma familia, sin aportar especificaciones detalladas de contexto, licencia ni rendimiento de esos modelos. No se dispone de informacion sobre modelos comparables de otros autores especializados en Luau en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: no sigue instrucciones ni mantiene conversaciones; usarlo como asistente conversacional producira resultados pobres.
- Riesgo de alucinacion en APIs de Roblox: puede generar funciones o propiedades inexistentes del entorno, por lo que el codigo generado debe validarse siempre.
- Idiomas: la model card declara unicamente ingles; el soporte de lenguaje natural en castellano no esta garantizado.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada; al entrenarse sobre datos de codigo, puede reproducir patrones y convenciones presentes en el corpus.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero requiere conservar el aviso de licencia y no ofrece garantias.
- Dependencia de `trust_remote_code`: la carga del modelo ejecuta codigo personalizado del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de desplegarlo en produccion.
- Contexto largo: aunque se declaran 65.536 tokens, no se documenta la calidad de la atencion mas alla de esa ventana ni pruebas de aguja en pajar.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue directo en motores como llama.cpp u Ollama sin conversion previa.
- El modelo tiene pocas descargas (578) y un solo "like" en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khtsly/Kai-2.0-Base
- Paper: no disponible
- Blog: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
