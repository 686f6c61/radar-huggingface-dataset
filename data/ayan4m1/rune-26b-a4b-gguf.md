# ayan4m1/rune-26b-a4b-gguf

## Resumen

Rune 26B-A4B es un modelo de decisión (*decision model*) para texto e imágenes desarrollado por el equipo de Surogate. A diferencia de un modelo generativo convencional, su función es recibir un estado (texto, datos estructurados o una imagen con texto) junto con una pregunta y un conjunto de opciones, y devolver una única opción acompañada de una probabilidad calibrada sobre todas ellas, todo ello en un único paso hacia delante (*single forward pass*). Esto lo sitúa en la categoría de modelos orientados a clasificación, enrutamiento y selección de alternativas, más que a la generación libre de texto.

La ficha que nos ocupa, `ayan4m1/rune-26b-a4b-gguf`, es una republicación en formato GGUF del modelo original. La nomenclatura «26B-A4B» sugiere un total de 26 000 millones de parámetros con aproximadamente 4000 millones activos por token, patrón habitual en arquitecturas de mezcla de expertos (MoE), aunque este extremo no se confirma en la información disponible. El modelo declara una ventana de contexto de 262 000 tokens (262k), un tamaño poco habitual que lo habilita para tareas de decisión sobre documentos extensos o flujos de datos largos.

Su relevancia actual reside en dos factores: por un lado, cubre un nicho poco poblado, el de los modelos que devuelven probabilidades calibradas en lugar de texto libre, útiles para sistemas de enrutamiento y agentes; por otro, su empaquetado en GGUF y su licencia Apache 2.0 facilitan el despliegue local y el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura «A4B» sugiere mezcla de expertos con 4B parametros activos, sin confirmar) |
| Parametros totales | 26B (segun la denominacion del modelo) |
| Parametros activos | no disponible (la nomenclatura sugiere 4B activos, sin confirmar) |
| Longitud de contexto | 262k tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio es de formato GGUF, por lo que se esperan cuantizaciones tipo Q4_K_M, Q5_K_M, Q8_0, entre otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo en los materiales disponibles. El nombre «Rune 26B-A4B» sigue el patron habitual de los modelos de mezcla de expertos (MoE), donde el sufijo «A4B» indica el numero de parametros activos por token, en este caso 4B sobre un total de 26B. De confirmarse, implicaria un coste de inferencia muy inferior al de un modelo denso de 26B, con una solo fraccion de los expertos activada en cada paso. Esta interpretacion no esta verificada por el autor en la informacion disponible.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o destilacion. La unica innovacion tecnica documentada de forma explicita es su modo de operacion: el modelo no genera texto libre, sino que puntua un conjunto finito de opciones y devuelve una distribucion de probabilidad calibrada sobre ellas en un unico paso hacia delante. Esa calibracion es relevante porque permite umbralizar decisiones y encadenar selecciones de forma mas fiable que con la probabilidad implicita de un modelo generativo.

## Capacidades

- Decision sobre opciones multiples: dado un estado y una lista de alternativas, devuelve una opcion con probabilidad calibrada sobre el conjunto completo.
- Entrada multimodal: acepta texto, datos estructurados e imagenes que contengan texto como parte del estado de entrada.
- Contexto largo: la ventana de 262k tokens permite incorporar estados extensos (documentos, historiales, registros) sin troceado previo.
- Procesamiento en un unico paso hacia delante: la decision se resuelve sin generacion autoregresiva, lo que reduce la latencia frente a esquemas de prompting generativo.
- Puntuacion de alternativas: al devolver probabilidades sobre todas las opciones, permite ranking y umbralizado, no solo la seleccion de la mejor.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo no declara idiomas en la informacion disponible.
- Modos especiales (thinking, audio, vision general): el unico modo documentado es el de decision con entrada de imagen con texto; no se mencionan modos adicionales.

## Casos de uso

- Enrutamiento de peticiones en un sistema multi-modelo: dada una consulta de usuario y una lista de modelos o herramientas disponibles, el modelo devuelve cual conviene invocar con una probabilidad asociada, lo que permite umbralizar y derivar a un humano cuando la confianza es baja.
- Clasificacion de documentos extensos: con 262k tokens de contexto, puede recibir un contrato, un informe o un expediente completo y decidir entre categorias predefinidas (tipo de documento, riesgo, departamento responsable) sin fragmentacion.
- Moderacion de contenido: recibir un mensaje o hilo completo y seleccionar entre etiquetas de politica (permitido, revisar, bloquear) con una probabilidad calibrada que facilite la revision humana en la zona gris.
- Extraccion de decisiones a partir de imagenes con texto: digitalizacion de formularios, facturas o capturas donde el estado es una imagen y la salida es una de varias categorias de tramitacion.
- Triage en atencion al cliente: dado un historial conversacional largo y una lista de colas o equipos, asignar el caso al destino correcto con una probabilidad que permita enrutado automatico por encima de un umbral.
- Seleccion de respuestas en pipelines de generacion: actuar como verificador o reranker, eligiendo entre varias respuestas candidatas producidas por otro modelo en funcion del contexto.
- Decisiones sobre datos estructurados: recibir un registro tabular o JSON y elegir entre acciones de negocio (aprobar, rechazar, escalar), con trazabilidad gracias a la probabilidad asociada.
- Despliegue local en flujos sensibles: al distribuirse en GGUF y bajo Apache 2.0, permite ejecutar decisiones sobre datos que no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 26B en GGUF, una cuantizacion Q4_K_M ocuparia en torno a 15-16 GB de pesos, y Q8_0 en torno a 27-28 GB, cifras que deben verificarse contra los ficheros reales del repositorio.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 26B cuantizado a 4 bits es viable en GPUs de 24 GB (RTX 3090, RTX 4090) y holgado en A100 40 GB, L40S o H100.
- Compatibilidad con GPU de consumo: plausible en tarjetas de 24 GB con cuantizaciones de 4 bits y descarga parcial de capas a CPU en equipos con menos VRAM; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp) por el formato GGUF. Tambien aparece un endpoint de inferencia gestionado en FriendliAI. Para vLLM o TGI se requeriria una version en safetensors, no disponible en este repositorio.
- Latencia y throughput estimados: no disponibles. La operacion en un unico paso hacia delante, sin decodificacion autoregresiva, sugiere una latencia inferior a la de un modelo generativo de tamano comparable, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayan4m1/rune-26b-a4b-gguf | 26B (activos no confirmados) | 262k | Modelo de decision multimodal | apache-2.0 | GGUF en HuggingFace |
| surogate/rune-26b-a4b-GGUF | 26B (activos no confirmados) | 262k | Modelo de decision multimodal | no disponible | GGUF en HuggingFace, endpoint en FriendliAI |
| ReadyArt/Serenity-26B-A4B-GGUF | 26B-A4B | no disponible | no disponible | no disponible | GGUF en HuggingFace |

Los tres repositorios corresponden al mismo linaje de modelos: el de Surogate es el empaquetado de referencia del modelo original, el de ayan4m1 es una republicacion y Serenity parece un derivado o ajuste sobre la misma base. No se dispone de datos de rendimiento comparado entre ellos ni frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Alcance funcional restringido: no es un modelo generativo. No debe esperarse que redacte texto, responda preguntas abiertas ni mantenga conversaciones; su salida es la seleccion de una opcion de un conjunto cerrado.
- Dependencia del conjunto de opciones: la calidad de la decision depende de que las alternativas ofrecidas sean exhaustivas y esten bien formuladas. Si la respuesta correcta no esta entre las opciones, el modelo devolvera igualmente una de ellas.
- Calibracion no verificada de forma independiente: el autor afirma que las probabilidades estan calibradas, pero no se han publicado evaluaciones que lo confirmen en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de seleccionar una opcion incorrecta con alta confianza, especialmente con entradas ruidosas o fuera de distribucion.
- Idiomas: no se declara soporte idiomatico, por lo que el comportamiento en castellano u otras lenguas distintas del ingles es desconocido.
- Sesgos: no hay informacion publicada sobre sesgos demograficos, culturales o de dominio. Al ser un modelo de decision, los sesgos se manifiestan como sesgo de seleccion, potencialmente mas dificiles de detectar que en un modelo generativo.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y las atribuciones.
- Procedencia: este repositorio concreto es una republicacion de un tercero, no la fuente original. Conviene verificar la integridad de los ficheros GGUF y contrastar con el repositorio de Surogate antes de usarlos en produccion.
- Sin senales de adopcion: el repositorio registra cero descargas y cero «likes» en el momento de la consulta, y no incluye model card mas alla del campo de licencia. La documentacion disponible es minima.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/ayan4m1/rune-26b-a4b-gguf
- Repositorio de referencia del modelo original (Surogate): https://huggingface.co/surogate/rune-26b-a4b-GGUF
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/surogate/rune-26b-a4b-GGUF
- Ficha en KnowYourModel: https://www.knowyourmodel.ai/models/huggingface%3Asurogate%2Frune-26b-a4b-GGUF
- Derivado Serenity 26B-A4B (GGUF): https://huggingface.co/ReadyArt/Serenity-26B-A4B-GGUF
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
