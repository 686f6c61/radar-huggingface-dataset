# aether-models/smollm3-3b

## Resumen

`aether-models/smollm3-3b` es una distribucion del modelo `HuggingFaceTB/SmolLM3-3B` empaquetada por Aether Models para el SDK Aether en iOS y macOS 27 o superior. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion del checkpoint original en PyTorch a formato Core AI (`.aimodel`) mediante la receta `smollm3-3b@2` de Aether forge, con pesos cuantizados a int8 lineal por bloques de 32 (8 bits). El objetivo es que desarrolladores de aplicaciones Apple puedan ejecutar un modelo de 3.000 millones de parametros en local, tanto en Mac como en iPhone, sin depender de servicios en la nube.

El modelo base es un transformer decoder-only de aproximadamente 3.075 millones de parametros, publicado por Hugging Face (HuggingFaceTB) bajo licencia Apache-2.0. SmolLM3-3B es relevante en el ecosistema abierto por su tamano contenido, su ventana de contexto de 128.000 tokens y su modo de razonamiento dual (con y sin cadena de pensamiento). Esta distribucion concreta anade el valor de una verificacion funcional por tiers (T0, T1 y T2) sobre dispositivos reales, lo que da cierta garantia de que la cuantizacion no rompe el comportamiento del modelo en las tareas de la fixture de prueba.

El repositorio tiene 6,6 GB y contiene dos variantes: `macos-any-gpu` (3,28 GB) e `ios-h18p-gpu` (3,29 GB). Al tratarse de un bundle de plataforma, el formato no es safetensors ni GGUF, sino el binario propietario de Core AI, y se consume a traves de la CLI de Aether o de la API Swift de `Aether`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM3-3B) |
| Parametros totales | ~3.075 millones (segun el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base; no re-declarado en el bundle) |
| Tipos de cuantizacion | int8 lineal por bloque de 32 (8 bits), unico perfil publicado |
| Idiomas soportados | No declarados por el bundle; el modelo base declara ingles, frances, aleman, italiano, portugues y espanol |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI `.aimodel` (convertido desde PyTorch; el bundle no incluye safetensors ni GGUF) |
| Variantes | `macos-any-gpu` (3,28 GB), `ios-h18p-gpu` (3,29 GB) |
| Plataformas | iOS y macOS 27+ (SDK Aether) |
| Modelo base y revision | `HuggingFaceTB/SmolLM3-3B` en revision `a07cc9a04f16550a088caea529712d1d335b0ac1` |
| Receta de conversion | Aether forge `smollm3-3b@2` |
| Tokenizer | Archivos del propio modelo base (no modificados) |
| Tamano del repositorio | 6,6 GB |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde integramente al modelo base `SmolLM3-3B`, un transformer decoder-only denso de unos 3.075 millones de parametros. Aether Models no realiza entrenamiento ni fine-tuning: su trabajo es exclusivamente de conversion de formato y cuantizacion. La receta aplicada transforma los pesos PyTorch originales a un grafo Core AI y los cuantiza a int8 con granularidad de bloque 32, lo que reduce el peso en disco hasta los 3,28-3,29 GB por variante. Los archivos del tokenizer se copian sin cambios desde el origen.

La model card no documenta el dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases de RLHF, DPO o aprendizaje por preferencias; esos datos corresponden al modelo base y no se reproducen aqui. La innovacion destacable de este bundle no es algorítmica sino de empaquetado y validacion: cada variante se somete a pruebas por tiers (T0, T1, T2) y se registra el resultado con el digest del bundle, de modo que la verificacion esta ligada a unos bytes concretos. Se incluye ademas una fila de referencia con el export sin cuantizar (no publicado) que sirve de linea base estricta para validar que el perfil cuantizado a 8 bits mantiene el comportamiento.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation`, orientado a chat multi-turno.
- Razonamiento: el modelo base SmolLM3-3B incorpora un modo dual de razonamiento (con y sin cadena de pensamiento), aunque el bundle no documenta como se expone esa funcionalidad a traves del SDK.
- Codigo y matematicas: capacidades propias de la familia SmolLM3; no re-verificadas de forma especifica en la model card de esta distribucion.
- Multilingue: el bundle no declara idiomas; el modelo base cubre seis lenguas europeas.
- Ejecucion local en dispositivo: inferencia en GPU de Mac (cualquier GPU) y en GPU del SoC `h18p` en iOS.
- Integracion via SDK: CLI (`aether run`) y API Swift (`Aether`, `chat`, `respond(to:)`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de solo texto).

## Casos de uso

- Asistentes de chat integrados en aplicaciones iOS: el modelo se ejecuta en local sobre la GPU del SoC, lo que permite ofrecer respuestas sin conexion y sin enviar datos del usuario a un servidor. Es adecuado por su tamano de 3 GB, compatible con el almacenamiento tipico de un iPhone moderno.
- Funciones de resumen y reescritura en apps de macOS: con una ventana de contexto de hasta 128.000 tokens en el modelo base, se pueden procesar documentos largos (informes, articulos, transcripciones) en una sola pasada.
- Procesamiento de texto privado en el dispositivo: casos con datos sensibles (notas medicas, borradores legales, correo personal) donde la inferencia local evita salir del dispositivo y simplifica el cumplimiento de privacidad.
- Autocompletado y asistencia de escritura en editores de texto para Apple: latencia baja al no haber llamada de red y consumo de memoria contenido gracias a la cuantizacion int8.
- Traduccion y generacion multilingue dentro de apps europeas: aprovechando las seis lenguas del modelo base, util para funcionalidades de localizacion asistida.
- Prototipado e investigacion en el ecosistema Apple: permite evaluar rapidamente el comportamiento de SmolLM3-3B en Core AI antes de decidir un despliegue mayor, con verificaciones T0-T2 que documentan la integridad funcional.
- Bot offline para demos y entornos sin conectividad: ferias, kioscos o dispositivos aislados donde no se puede depender de una API remota.
- Filtrado y clasificacion de texto on-device: moderacion basica de contenido o etiquetado de mensajes dentro de una app, siempre que la tarea se resuelva con generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente aporta resultados de verificacion funcional por tiers, no metricas de calidad de tarea:

| Variante | Tier | Resultado | Detalle | Dispositivo | Build de OS |
|---|---|---|---|---|---|
| `ios-h18p-gpu` | T0 | pass | - | iPhone18,2 | 24A437 |
| `ios-h18p-gpu` | T2 | pass | 19/19 estricto; perfil cuantizado-8bit; fixture `edbd242c1ba166f2` | iPhone18,2 | 24A437 |
| `macos-any-gpu` | T0 | pass | - | Mac17,6 | 26A428 |
| `macos-any-gpu` | T1 | pass | - | Mac17,6 | 26A428 |
| `macos-any-gpu` | T2 | pass | 19/19 estricto; perfil cuantizado-8bit; fixture `edbd242c1ba166f2` | Mac17,6 | 26A428 |
| Referencia sin cuantizar (no publicada) | T2 | pass | 19/19 estricto; perfil estricto; fixture `edbd242c1ba166f2` | Mac17,6 | 26A428 |

No se dispone de cifras de throughput (tokens/s), latencia por token ni comparaciones con el modelo sin cuantizar mas alla del resultado de las pruebas estrictas.

## Requisitos de hardware

- VRAM/almacenamiento de pesos: 3,28 GB en macOS y 3,29 GB en iOS para los pesos en int8. El modelo base sin cuantizar rondaria los 6 GB en bf16, por lo que la cuantizacion reduce aproximadamente a la mitad el espacio de pesos.
- Memoria adicional para el cache KV: no disponible de forma oficial; en un modelo de 128.000 tokens de contexto el cache KV puede ser el factor dominante en memoria, por encima de los propios pesos, y depende de la implementacion de Core AI.
- GPU compatibles (macOS): cualquier GPU, segun la etiqueta de la variante `macos-any-gpu`. La especializacion se realiza en la primera carga.
- GPU compatibles (iOS): SoC `h18p` (dispositivo iPhone18,2). La variante llega ya compilada.
- Cabe en GPU de consumo: si, esta pensado exactamente para hardware de consumo Apple (Mac e iPhone). No se documentan requisitos para GPU de escritorio NVIDIA o AMD.
- Opciones de despliegue: exclusivamente el SDK Aether (CLI `aether run smollm3-3b` y API Swift). No se ofrecen formatos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se establece con alternativas de tamano equivalente y licencia permisiva. Los datos de rendimiento de tarea no estan disponibles para este bundle, por lo que la columna de rendimiento se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `aether-models/smollm3-3b` | ~3,075B | 128k (modelo base) | Apache-2.0 | Core AI `.aimodel`, solo SDK Aether (iOS/macOS) | No disponible |
| `HuggingFaceTB/SmolLM3-3B` (base) | ~3,075B | 128k | Apache-2.0 | Safetensors, transformers, amplia disponibilidad | No disponible en esta ficha |
| `meta-llama/Llama-3.2-3B` | ~3,2B | 128k | Licencia comunitaria Llama 3.2 (con restricciones) | Safetensors, ecosistema amplio | No disponible |
| `Qwen/Qwen2.5-3B` | ~3,1B | 32k (extensible) | Apache-2.0 | Safetensors, ecosistema amplio | No disponible |

La diferencia clave de este bundle no es el rendimiento del modelo, sino su empaquetado para Apple: frente a las alternativas, que se distribuyen en safetensors para stacks de servidor, esta version ya viene cuantizada y verificada para ejecutarse en iOS y macOS mediante el SDK Aether, a cambio de quedar atada a ese runtime y plataforma.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el comportamiento del modelo base, arrastra los sesgos de sus datos de entrenamiento, no especificados en esta ficha.
- Riesgo de alucinacion: inherente a un modelo de 3B en tareas de conocimiento abierto; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto: la ventana de 128.000 tokens corresponde al modelo base; el bundle no la re-declara ni documenta como gestiona el cache KV en memoria limitada de iPhone.
- Limitaciones de idioma: el bundle no declara idiomas soportados; la cobertura real depende del modelo base y no se ha verificado de forma independiente en esta distribucion.
- Restricciones de licencia: Apache-2.0 permite uso comercial. Hay que conservar el archivo `LICENSE` incluido, que es el texto canonico de apache.org, ya que el modelo base no adjuntaba fichero de licencia.
- Dependencia de plataforma: el formato `.aimodel` solo se ejecuta con el SDK Aether en iOS y macOS 27+, lo que impide reutilizar el artefacto en servidores Linux o en runtimes convencionales.
- Coste de primera carga en macOS: la variante `macos-any-gpu` no viene compilada y se especializa en la primera carga, lo que anade una penalizacion inicial de tiempo.
- Trazabilidad de la cuantizacion: la verificacion T2 se realizo con la fixture `edbd242c1ba166f2` y 19 casos estrictos; es una validacion funcional acotada, no una garantia de equivalencia de calidad global frente al modelo sin cuantizar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin adopcion publica documentada.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/aether-models/smollm3-3b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Revision del modelo base usada en la conversion: `a07cc9a04f16550a088caea529712d1d335b0ac1`
- Texto canonico de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de busqueda web: no aportan informacion relevante sobre el modelo (los enlaces devueltos corresponden a paginas de inicio de sesion bancario ajenas al tema).
