# aether-models/granite-4.0-1b

## Resumen

aether-models/granite-4.0-1b es un paquete de pesos en formato Core AI del modelo ibm-granite/granite-4.0-1b, preparado por el autor aether-models para el SDK Aether en iOS y macOS 27 o superior. No se trata de un modelo nuevo entrenado desde cero: es una conversion del checkpoint original de IBM (revision `6a7381ba1f54d684ff508d991aeb7dc580157103`, licencia Apache-2.0) desde PyTorch a `.aimodel` mediante la receta `granite-4.0-1b@2` de Aether forge, con pesos cuantizados a int8 lineal por bloque de 32.

El modelo base pertenece a la familia Granite 4.0 de IBM, descrita por el fabricante como una arquitectura hibrida Mamba-2/transformer con Mixture-of-Experts (la informacion disponible atribuye MoE a la familia, no confirma el detalle para la variante de 1B). Segun IBM, esta generacion reduce el uso de memoria en un 70% y duplica la velocidad de inferencia respecto a la anterior. El modelo se presenta como un instruct ligero orientado a despliegue en dispositivo y a investigacion, con soporte multilingue.

La relevancia de este bundle concreto es de integracion: permite ejecutar el modelo en el ecosistema Apple (iPhone y Mac) a traves del SDK Aether, sin necesidad de infraestructura CUDA. El repositorio incluye tres variantes compiladas o especializables en el primer arranque, con registros de verificacion que documentan su comportamiento en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2/transformer (segun IBM para la familia Granite 4.0; detalle de la variante 1B no disponible) |
| Parametros totales | 1B (inferido del nombre del modelo; cifra exacta no disponible) |
| Parametros activos | No disponible (la informacion no confirma si esta variante emplea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 lineal por bloque de 32 (8-bit weights); export sin cuantizar de referencia (no publicado) |
| Idiomas soportados | No disponible (el modelo base se describe como multilingue, sin listado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI (`.aimodel`), convertido desde PyTorch; tokenizer del modelo de origen |
| Tamano del repositorio | 3,5 GB |
| Tamano por variante | 1,74 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no describe el proceso de entrenamiento del modelo base: no consta el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se documenta es que la familia Granite 4.0 emplea una arquitectura hibrida Mamba-2/transformer, con capas de espacio de estados combinadas con atencion, y que IBM reporta para esta generacion una reduccion del 70% en uso de memoria y una mejora de 2x en velocidad de inferencia. La aplicacion de Mixture-of-Experts se menciona a nivel de familia, sin confirmacion para la variante de 1B.

En lo que respecta a este repositorio, la innovacion tecnica es la conversion y empaquetado: los pesos originales en PyTorch se transforman al formato Core AI y se cuantizan a int8 lineal por bloque de 32, manteniendo los ficheros de tokenizer del modelo fuente. Se ofrecen tres variantes: `macos-any-gpu` y `ios-any-gpu`, que no vienen compiladas y se especializan en la primera carga, y `ios-h18p-gpu`, compilada de antemano para el chip h18p. El repositorio incluye registros de verificacion por digest del bundle, con pruebas T0, T1 y T2 sobre iPhone18,2 (iOS build 24A437) y Mac17,6 (macOS build 26A428); la prueba T2 estricta supera 19/19 casos con el perfil cuantizado de 8 bits.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo base se distribuye como instruct ligero, por lo que esta orientado a responder instrucciones.
- Capacidades multilingues: la documentacion del modelo base lo describe como multilingue, aunque no se detalla la lista de idiomas soportados.
- Ejecucion en dispositivo: disenado para inferencia local en iPhone y Mac mediante el SDK Aether, sin depender de servidores.
- Integracion por CLI y SDK: se invoca con `aether run granite-4.0-1b --prompt "..."` o a traves de la API Swift `Aether().chat(...)` y `chat.respond(to:)`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones iOS: al ejecutarse de forma nativa en el dispositivo a traves de Core AI, permite respuestas sin conexion y sin enviar datos del usuario a un servidor, con un peso de 1,74 GB por variante.
- Funciones de texto dentro de apps de macOS: integracion mediante el SDK Aether en Swift para generar o reformular texto en aplicaciones de escritorio, aprovechando la especializacion automatica de la variante `macos-any-gpu` en la primera carga.
- Prototipado rapido de producto: la CLI `aether run` permite evaluar el modelo en local antes de comprometerse con una integracion completa en el codigo de la aplicacion.
- Investigacion sobre cuantizacion en dispositivo: los registros de verificacion (T0, T1, T2, comparativa contra la referencia sin cuantizar) permiten estudiar el impacto de la cuantizacion int8 por bloque de 32 en la calidad de salida.
- Procesamiento de texto sensible a la privacidad: escenarios en los que no se puede recurrir a APIs en la nube (sanidad, legal, finanzas) y donde la inferencia local es un requisito, no una preferencia.
- Despliegue en dispositivos con GPU h18p: la variante `ios-h18p-gpu` viene compilada, lo que evita el coste de especializacion en el primer arranque y es adecuada para aplicaciones que necesitan arranque inmediato.
- Educacion y demostraciones: paquete ligero (1,74 GB) para mostrar flujos de IA generativa on-device sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de evaluacion presentes son los registros de verificacion del bundle: pruebas T0, T1 y T2 superadas en iPhone18,2 (24A437) y Mac17,6 (26A428), con T2 estricta de 19/19 casos sobre el fixture `aa4c544dc96a983e` y perfil cuantizado de 8 bits. La fila de referencia sin cuantizar tambien supera T2 estricta (19/19), lo que indica que la cuantizacion no degrada esos casos de verificacion, aunque no se trata de un benchmark de calidad general.

## Requisitos de hardware

- VRAM/peso de modelo: 1,74 GB por variante en disco, correspondientes a pesos int8; el consumo en memoria durante inferencia incluye ademas el contexto y el runtime de Core AI, cuyo valor no se especifica.
- Plataformas soportadas: macOS y iOS (iOS y macOS 27 o superior segun la model card). No se documenta soporte para CUDA ni para aceleradores no Apple.
- Hardware verificado: iPhone18,2 y Mac17,6. La variante `ios-h18p-gpu` esta compilada especificamente para el chip h18p.
- Cabe en hardware de consumo: si, en dispositivos Apple compatibles; es precisamente el objetivo del bundle.
- Opciones de despliegue: SDK Aether (`Aether().chat(...)`), CLI `aether run`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma objetivo | Datos de rendimiento |
|---|---|---|---|---|---|---|
| aether-models/granite-4.0-1b | 1B (inferido) | No disponible | Core AI `.aimodel` int8 | Apache-2.0 | iOS y macOS 27+ | Verificacion T0/T1/T2 en dispositivo |
| ibm-granite/granite-4.0-1b | 1B (inferido) | No disponible | PyTorch (origen) | Apache-2.0 | Servidor / multiplataforma | No disponible en la informacion |
| Alternativas de ~1B para dispositivo | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Alucinacion: no se documenta ninguna evaluacion de fidelidad factual; un modelo de 1B tiene mayor tendencia a generar contenido incorrecto que modelos de mayor tamano.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre las medidas de mitigacion aplicadas.
- Cobertura idiomatica: aunque el modelo base se describe como multilingue, no se detalla que idiomas estan soportados ni con que calidad; el castellano no esta confirmado.
- Contexto: se desconoce la longitud de contexto efectiva, lo que impide planificar aplicaciones con conversaciones largas o documentos extensos.
- Resultados de 0 descargas y 0 likes: el bundle no tiene adopcion registrada y no cuenta con validacion externa mas alla de los registros del propio autor.
- Verificacion limitada: las pruebas T0/T1/T2 cubren 19 casos con un unico fixture en hardware concreto; no equivalen a una evaluacion exhaustiva de calidad.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el bundle advierte que el modelo base declara dicha licencia sin incluir fichero; el autor aporta el texto canonico de apache.org. Conviene revisar los terminos del repositorio original de IBM.
- Dependencia de plataforma: el formato `.aimodel` esta atado a Core AI y al SDK Aether, lo que limita la portabilidad a otros entornos de inferencia.
- Fecha de publicacion: el repositorio figura como creado el 2026-09-23, dato que conviene contrastar antes de citarlo.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/aether-models/granite-4.0-1b
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.0-1b
- Documentacion de Granite 4.0 de IBM: https://www.ibm.com/granite/docs/models/granite4-0
- Pagina de la familia Granite: https://www.ibm.com/granite
- Ficha de Granite-4.0-1B en AIBase: https://model.aibase.com/models/details/1985515404826775552
- Perfil de serving de granite-4.0-1b-base en aibadgr: https://aibadgr.com/models/granite-4-0-1b-base
