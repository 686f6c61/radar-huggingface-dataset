# devendradhakad/autodroid-litert-community-MiniCPM5-2B

## Resumen

Este repositorio distribuye la conversión a **LiteRT-LM** (LiteRT, anteriormente TensorFlow Lite) del modelo **openbmb/MiniCPM5-2B**, un transformer denso de ~2,5B parámetros desarrollado por OpenBMB y diseñado específicamente para inferencia totalmente local en dispositivos móviles y hardware de borde. El autor del repositorio es el usuario devendradhakad, que publica una réplica de los artefactos de `litert-community/MiniCPM5-2B` junto con ficheros de cuantización adicionales orientados a CPU. El formato entregado son ficheros `.litertlm` listos para ejecutarse con el runtime `litert-lm` (versión 0.16 o superior) o dentro de la aplicación Google AI Edge Gallery en Android.

El problema que resuelve es el de disponer de un asistente de texto con razonamiento híbrido, soporte nativo de tool calling y una ventana de contexto de 131.072 tokens, todo ello sin salir del dispositivo y por tanto sin coste de API ni envío de datos a terceros. El checkpoint base tiene 2.516.756.480 parámetros (1.981.982.720 sin contar embeddings), 42 capas, atención GQA con 16 cabezas de consulta y 2 de clave/valor con dimensión 128, hidden size 2048 e intermediate size 6144, con un vocabulario de 130.560 tokens.

La relevancia actual del repositorio está en que la versión int4 ocupa solo 1,55 GB y la int8 2,55 GB, lo que permite decodificación en GPU móvil (medida sobre un Galaxy S26 con el kit de la versión 0.16.0 y sobre Mac con litert-lm 0.17.0). La licencia es Apache 2.0 en ambos casos y los idiomas declarados son inglés y chino. El repositorio no tiene descargas ni likes registrados y fue creado el 17 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, `LlamaForCausalLM` (42 capas, GQA 16 Q / 2 KV, head dim 128, hidden 2048, intermediate 6144) |
| Parametros totales | 2.516.756.480 (~2,5B); 1.981.982.720 sin embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales con embedding int8 (1,55 GB); int8 dynamic channelwise en lineales, embedding y lm_head, receta `dynamic_wi8_afp32` (2,55 GB); variantes solo CPU `wi4c_wi8_afp32` (MLP channelwise int4 con rotacion Hadamard, resto channelwise int8) y `wi8_afp32` (weight-only int8 con activaciones fp32) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el formato del checkpoint base `openbmb/MiniCPM5-2B` no se especifica en la informacion disponible |
| Tamano del repositorio | 1,6 GB |
| Vocabulario | 130.560 tokens |
| Runtime minimo | litert-lm >= 0.16 (canal `thought` y `ThinkingConfig`); probado con 0.17.0 en Mac y kit v0.16.0 en Galaxy S26 |
| Backends | CPU y GPU (`--backend gpu`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal denso convencional con implementacion `LlamaForCausalLM`: 42 capas, hidden size 2048, intermediate size 6144 y atencion con grouped-query attention de 16 cabezas de consulta frente a 2 de clave/valor con dimension de cabeza 128. El vocabulario es de 130.560 entradas y el contexto nativo alcanza los 131.072 tokens. Sobre esa base, este repositorio no reentrena ni modifica los pesos, sino que aplica cuantizacion y empaquetado para el runtime LiteRT-LM, incluyendo la declaracion del canal `thought`, que permite al runtime separar cadenas de razonamiento de la respuesta final mediante `ThinkingConfig`.

En cuanto a los datos de entrenamiento, la informacion proporcionada no incluye numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO; solo se indica que el modelo base procede de la serie MiniCPM5 de OpenBMB y que esta pensado para despliegue en el borde. La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en el proceso de conversion: la receta int4 usa cuantizacion blockwise de tamano 32 mas OCTAV sobre las capas lineales manteniendo el embedding en int8, mientras que la receta int8 aplica cuantizacion dinamica channelwise a lineales, embedding y lm_head. Ademas, los dos ficheros principales incorporan plantillas de chat distintas: el int4 embebe el `chat_template.jinja` propio del checkpoint (el modelo decide y, en la practica, razona), mientras que el int8 embebe la plantilla de `models/minicpm5` de LiteRT-LM con fecha 2026-09-01, donde `enable_thinking` vale `false` por defecto salvo que la aplicacion lo active.

## Capacidades

- Generacion de texto causal en ingles y chino con licencia Apache 2.0.
- Razonamiento hibrido: un unico checkpoint actua como asistente rapido o como razonador deliberado mediante la plantilla `<think>` y el parametro `enable_thinking`.
- Tool calling nativo: la plantilla de chat incluye soporte de llamadas a herramientas sin necesidad de formato externo.
- Contexto largo nativo de 131.072 tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Inferencia totalmente en dispositivo, sin llamadas a servicios remotos, lo que permite escenarios sin conectividad.
- Declaracion del canal `thought`, que habilita la separacion razonamiento/respuesta en el runtime (`ThinkingConfig`).
- Ejecucion en CPU y en GPU movil con el mismo fichero, segun la documentacion del autor.
- No se declaran capacidades de vision, audio ni generacion de embeddings en la informacion disponible.

## Casos de uso

- Asistente personal offline en movil: el fichero int4 de 1,55 GB se importa en Google AI Edge Gallery y responde preguntas sin conexion; su tamano reducido y su decodificacion rapida en GPU lo hacen adecuado para uso interactivo casual.
- Agente de tool calling en el dispositivo: gracias al soporte nativo de herramientas en la plantilla de chat, el modelo puede invocar APIs locales (calendario, ficheros, sensores) dentro de un flujo de varios pasos sin enviar datos fuera del terminal.
- Razonamiento con presupuesto controlado: la variante int8 resulta preferible cuando la cadena de pensamiento debe completarse, ya que sus cadenas son entre 3 y 4 veces mas cortas que las de int4 en las mismas preguntas y terminan donde int4 agota el presupuesto de tokens.
- Analisis de documentos largos en un servidor de borde: con 131.072 tokens de contexto se pueden resumir o extraer informacion de manuales, contratos o expedientes completos ejecutando el modelo localmente con el backend GPU de litert-lm.
- Asistente de programacion local: integrado en un IDE o terminal mediante la CLI `litert-lm run`, sirve para autocompletado, explicacion de fragmentos y generacion de parches en entornos con requisitos de confidencialidad.
- Atencion al cliente en kioscos o terminales punto de venta: un equipo con GPU integrada puede ejecutar la variante int8 y mantener conversaciones multi-turno en ingles o chino sin coste por token.
- Procesamiento de datos sensibles en industria sanitaria o financiera: al no requerir salida a red, el modelo permite redactar, clasificar y resumir informacion regulada dentro del propio dispositivo.
- Respuestas rapidas de baja latencia: la variante int4 con `enable_thinking` desactivado puede usarse como asistente directo en aplicaciones donde el tiempo de respuesta pesa mas que la profundidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento reportada por el autor es cualitativa y comparativa entre las dos variantes propias: las cadenas de razonamiento de la version int8 son aproximadamente 3-4 veces mas cortas que las de int4 sobre las mismas preguntas, y terminan alli donde int4 agota el presupuesto de tokens. No se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput en tokens por segundo.

## Requisitos de hardware

- VRAM/RAM para pesos: aproximadamente 1,55 GB para el fichero int4 y 2,55 GB para el int8, cifras que coinciden con el peso de los ficheros `.litertlm` publicados; el autor indica que la seccion principal de pesos del int8 ocupa 2,54 GB.
- Cache KV: 42 capas x 2 cabezas KV x 128 de dimension x 2 (clave y valor) = 21.504 elementos por token, unos 43.008 bytes por token en fp16 (aproximadamente 42 KiB). Esto implica unos 344 MB a 8.192 tokens, 1,34 GB a 32.768 tokens y aproximadamente 5,25 GiB si se agota la ventana de 131.072 tokens, por lo que el contexto maximo no es viable en moviles con memoria limitada.
- GPU de consumo: cualquier GPU con 4 GB o mas de memoria dedicada puede alojar la variante int4, incluidas GTX 1650, RTX 3050 y superiores; la int8 requiere unos 3 GB mas el cache KV. No se publican requisitos minimos oficiales.
- Moviles y hardware de borde: medido por el autor en un Galaxy S26 con el kit v0.16.0 y en un Mac con litert-lm 0.17.0. En iOS, el fichero int8 supera lo que una aplicacion mapea de una sola pieza con los entitlements por defecto; se necesita el entitlement `com.apple.developer.kernel.increased-memory-limit`.
- Opciones de despliegue: CLI `litert-lm` (instalable con `uv tool install litert-lm`), aplicacion Google AI Edge Gallery en Android (importacion desde Hugging Face o desde fichero local via ADB) y compilacion propia de la app de demostracion desde el repositorio de Gallery. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` es especifico de LiteRT-LM.
- Backends disponibles: CPU y GPU (`litert-lm run ./modelo.litertlm --backend gpu --cache no --pro`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| devendradhakad/autodroid-litert-community-MiniCPM5-2B (int4) | 2,5B | 131.072 | `.litertlm` | Apache 2.0 | 1,55 GB; pensado para movil; cadena de pensamiento mas larga y con riesgo de agotar presupuesto |
| devendradhakad/autodroid-litert-community-MiniCPM5-2B (int8) | 2,5B | 131.072 | `.litertlm` | Apache 2.0 | 2,55 GB; cadenas de pensamiento 3-4 veces mas cortas que int4; recomendado cuando el razonamiento debe completarse |
| openbmb/MiniCPM5-2B (modelo base) | 2.516.756.480 | 131.072 | no disponible en la informacion proporcionada | Apache 2.0 (heredada por el derivado) | Referencia sin cuantizar; el repositorio aqui descrito es su version cuantizada |
| mlboydaisuke/MiniCPM5-2B-LiteRT | no disponible | no disponible | `.litertlm` | no disponible | Origen declarado del fichero int4 reutilizado en este repositorio |

No se dispone de datos comparativos de otros modelos de tamano similar (por ejemplo alternativas de 1B a 3B para borde) dentro de la informacion proporcionada, por lo que no se incluyen cifras de parametros, contexto ni rendimiento de terceros.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, de modo que no se puede estimar la calidad real frente a otros modelos de 2-3B.
- El modelo tiene 2,5B parametros: su capacidad de razonamiento complejo, matematicas avanzadas y codigo de larga extension queda por debajo de modelos de 7B o superiores.
- Idiomas declarados: ingles y chino. El castellano no figura entre los idiomas soportados, por lo que el rendimiento en espanol puede degradarse notablemente.
- Riesgo de alucinacion: no se documentan fases de RLHF, DPO ni mecanismos de mitigacion en la informacion disponible.
- Divergencia entre variantes: int4 y int8 usan plantillas de chat distintas, de modo que el comportamiento por defecto del modo razonamiento cambia segun el fichero elegido (`enable_thinking` es `false` por defecto en int8). Es un punto de confusion si no se controla explicitamente.
- El int4 puede agotar el presupuesto de tokens en cadenas de pensamiento largas, lo que trunca el razonamiento o la respuesta.
- En iOS, el fichero int8 requiere el entitlement `com.apple.developer.kernel.increased-memory-limit`; el autor no verifico este extremo con el fichero concreto.
- El contexto de 131.072 tokens es nativo del modelo, pero el cache KV en fp16 ronda los 42 KiB por token, lo que hace inviable agotar la ventana en dispositivos moviles sin cuantizar el cache o truncar la entrada.
- Dependencia de runtime: se exige litert-lm >= 0.16 y el formato `.litertlm` no es portable a vLLM, llama.cpp, Ollama ni TGI.
- Procedencia de artefactos: parte del material (el fichero int4) proviene de un tercero, `mlboydaisuke/MiniCPM5-2B-LiteRT`; conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- El repositorio acumula 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se documenten los cambios. Conviene revisar tambien la licencia y los terminos del modelo base de OpenBMB.
- El identificador arXiv 2506.07900 aparece como etiqueta del repositorio, pero en la informacion disponible no se detalla su contenido ni se confirma su correspondencia con este modelo.
- La busqueda web realizada no devolvio resultados tecnicos utiles (unicamente enlaces genericos a Instagram), por lo que no se ha podido contrastar informacion adicional con fuentes externas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/devendradhakad/autodroid-litert-community-MiniCPM5-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Organizacion OpenBMB: https://huggingface.co/openbmb
- Documentacion de LiteRT-LM: https://ai.google.dev/edge/litert-lm
- Guia de conversion de MiniCPM5 en LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/models/minicpm5/README.md#model-conversion
- Plantilla de chat de referencia en LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/b5e34ab1/models/minicpm5/chat_template.jinja
- Repositorio de origen del fichero int4: https://huggingface.co/mlboydaisuke/MiniCPM5-2B-LiteRT
- Aplicacion Google AI Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Versiones (APK) de Google AI Edge Gallery: https://github.com/google-ai-edge/gallery/releases
- Wiki de Google AI Edge Gallery: https://github.com/google-ai-edge/gallery/wiki
- Repositorio de Google AI Edge Gallery: https://github.com/google-ai-edge/gallery/blob/main/README.md
- Identificador arXiv citado en las etiquetas del repositorio (contenido no verificado en la informacion disponible): https://arxiv.org/abs/2506.07900
