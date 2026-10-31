# Maincode/Matilda-Decision-v1-Nano

## Resumen

Matilda Decision v1 Nano es un modelo de decisión multimodal de 2,2 mil millones de parámetros desarrollado por Maincode. A diferencia de un LLM generativo convencional, no produce texto: recibe una entrada (texto o JSON, opcionalmente con imágenes) junto con una o varias preguntas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola llamada, una probabilidad para cada respuesta posible. Está orientado a casos de uso de alta productividad (high-throughput), donde se necesitan muchas decisiones estructuradas por segundo sin el coste de generación.

El modelo es un ajuste (post-training) de Qwen3.5-2B, al que se añade una cabeza de lectura de decisiones con hasta 255 opciones. Incorpora el codificador de visión del backbone, lo que permite clasificar o evaluar contenido a partir de imágenes de hasta 0,26 MP. Su interés práctico es doble: sustituye pipelines de clasificación con LLM generativos por una pasada única de forward, y es la versión pequeña de la familia Matilda Decision, compartiendo formato de peticiones y respuestas con Matilda Decision v1 (27B), lo que facilita migrar entre ambos según la carga.

Un detalle técnico relevante: el modelo se entrenó con atención bidireccional en sus capas full-attention, por lo que debe servirse con el runtime incluido (`trust_remote_code=True`); cargarlo como un backbone causal convencional degrada los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-language Qwen3.5-2B con cabeza de decision de hasta 255 opciones, atencion bidireccional en capas full-attention |
| Parametros totales | 2.213.241.664 (2,2B), incluido el codificador de vision |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131.072 tokens como maximo por peticion (las entradas no se truncan; las que exceden este limite devuelven un error) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4,4 GB en el repositorio) |

## Arquitectura y entrenamiento

La base es Qwen3.5-2B, un modelo vision-language, al que Maincode anade una cabeza de decision ("decision readout") que soporta hasta 255 opciones. Cada pregunta se resuelve con una unica pasada de forward, leyendo la respuesta desde la posicion final del prompt. Esto elimina por completo la fase de decodificacion autorregresiva: el coste por decision es el de un solo forward, independientemente del numero de opciones.

La innovacion tecnica mas destacable es el entrenamiento con **atencion bidireccional**: las capas de full-attention ven el prompt completo de una vez, en lugar de solo los tokens anteriores a cada posicion. Esto es coherente con el uso del modelo como lector de decisiones (no hay generacion token a token), pero implica que el runtime incluido en el repositorio (`matilda_decision_runtime.py`) debe encargarse de configurar la atencion correctamente. El modelo se post-entreno a partir de Qwen3.5-2B sobre tareas de decision en texto e imagenes. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion zero-shot de texto o JSON entre 1 y 255 opciones definidas por el usuario, con probabilidades por opcion y medida de confianza.
- Respuestas binarias tipo si/no (tipo `noul`), devolviendo la probabilidad de la respuesta afirmativa.
- Puntuacion en escalas ordinales (tipo `score`), con nivel esperado, probabilidades por nivel y leyenda.
- Resolucion de multiples preguntas en una sola llamada, todas ellas sobre el mismo estado e imagenes de entrada.
- Comprension multimodal: acepta varias imagenes por peticion (hasta 0,26 MP cada una, unos 512x512), codificadas a razon de un token por parche de 32x32 pixeles (unas 256 tokens por imagen de 512x512).
- Lectura de entrada JSON arbitraria tratada como datos, no como instrucciones (reduciendo el riesgo de inyeccion de prompts).
- Ventana efectiva de hasta 131.072 tokens por peticion, sin truncado de entradas.
- No genera texto libre: su salida es siempre estructurada (eleccion, probabilidad o puntuacion).

## Casos de uso

- **Enrutado de tickets de soporte:** clasificar cada incidencia entrante entre equipos (devoluciones, facturacion, tecnico...) en una sola pasada de forward, con probabilidades por equipo, lo que permite umbrales de confianza y escalar a un humano cuando la certeza es baja.
- **Moderacion de contenido con imagenes:** evaluar si un adjunto (ticket con foto, captura de producto) cumple criterios concretos combinando texto e imagen en la misma peticion, aprovechando el codificador de vision del backbone.
- **Triaje de urgencias en atencion al cliente:** asignar una puntuacion de urgencia en una escala definida (rutinario, pronto, hoy) a cada conversacion, para ordenar colas de trabajo automaticamente.
- **Validacion de documentos:** comprobar de forma binaria condiciones sobre recibos, facturas o formularios (por ejemplo, "¿el recibo incluye el producto reclamado?") a partir de la imagen y el texto asociado.
- **Sustituto de clasificadores BERT entrenados:** las clases se definen por descripcion en lenguaje natural sin reentrenar, lo que permite anadir o modificar categorias sin ciclo de entrenamiento.
- **Capa de decision en agentes (system-one):** como sugiere su etiqueta "system-one", puede actuar como modulo rapido de decision dentro de un agente mas grande, delegando en este modelo las elecciones binarias o de enrutado y reservando la generacion para el modelo principal.
- **Migracion entre tamanyos:** al compartir formato de peticion y respuesta con Matilda Decision v1 (27B), se puede desarrollar con la version Nano y escalar a la grande solo donde la precision lo exija, sin cambiar el codigo de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 4,4 GB en safetensors, lo que con pesos en bf16/fp16 implica aproximadamente 4,5-5 GB de VRAM para los pesos, mas el overhead de activaciones y del codificador de vision. No se han publicado cifras oficiales de VRAM ni variantes cuantizadas.
- Con ese tamanyo, el modelo cabe con holgura en GPUs de consumo: una RTX 4090 (24 GB), RTX 3090 o incluso GPUs de 8-12 GB deberian ser suficientes para inferencia en precision completa. No hay confirmacion oficial de ejecucion en CPU, aunque el tamanyo lo hace plausible con latencias mayores.
- Despliegue: el uso documentado es mediante `transformers` (version 5.17.0 segun el quickstart) con `AutoModel.from_pretrained(..., trust_remote_code=True)`. Es imprescindible usar el runtime incluido, que configura la atencion bidireccional; servirlo en un motor causal estandar (vLLM, TGI, llama.cpp) produce resultados distintos y peores. No hay soporte documentado para Ollama, GGUF ni otros runtimes.
- Se recomienda instalar `flash-linear-attention` para disponer de kernels GPU rapidos en las capas de linear-attention del backbone.
- No se han publicado cifras de latencia ni throughput; por diseño (un forward por pregunta, sin decodificacion), el coste por decision es sustancialmente menor que el de un LLM generativo equivalente.

## Comparativa con modelos similares

| | Matilda Decision v1 Nano | Matilda Decision v1 | Qwen3.5-2B (base) |
|---|---|---|---|
| Parametros | 2,2B (con vision) | 27B | 2B |
| Tarea | Decision estructurada (choice/si-no/score) | Decision estructurada (mismo formato) | Generacion de texto multimodal general |
| Salida | Probabilidades por opcion, sin texto generado | Probabilidades por opcion, sin texto generado | Texto generado |
| Vision | Si, hasta 0,26 MP por imagen | Si (no disponible el limite exacto) | Si |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Disponibilidad | HuggingFace, safetensors | HuggingFace | HuggingFace |

Como alternativa de la misma categoria (clasificacion zero-shot ligera), existen modelos como DeBERTa o NLI-based classifiers, pero son solo de texto, sin ventana de 128K ni capacidad multimodal; no se dispone de comparativas de rendimiento publicadas.

## Limitaciones y advertencias

- **Requiere runtime propio:** cargar los pesos como backbone causal o servirlos en un motor causal estandar (vLLM, TGI, llama.cpp) da respuestas distintas y peores, porque el modelo fue entrenado con atencion bidireccional. Hay que usar `trust_remote_code=True` y el fichero `matilda_decision_runtime.py` incluido.
- **Sin generacion de texto:** no sirve como chatbot ni para tareas generativas; su salida es siempre una eleccion, una probabilidad binaria o una puntuacion.
- **Resolucion de imagen limitada:** cada imagen se reescala a un maximo de 262.144 pixeles (0,26 MP, unos 512x512). Con caps superiores no hay validacion, y con caps inferiores se pierde detalle fino como graficos, documentos o texto pequeno.
- **Limite duro de contexto:** las peticiones de mas de 131.072 tokens devuelven un error en lugar de truncarse, por lo que el pipeline debe gestionar ese caso.
- **Idiomas:** no se especifican los idiomas soportados; al derivar de Qwen3.5-2B es razonable asumir buen rendimiento en ingles y chino, pero no hay datos publicados para castellano.
- **Alucinacion:** al no generar texto, el riesgo de alucinacion clasica es bajo, pero las probabilidades y confianzas devueltas no estan calibradas publicamente; conviene validar umbrales en el dominio de uso antes de produccion.
- **Licencia:** Apache-2.0, sin restricciones para uso comercial.
- **Adopcion temprana:** modelo muy reciente con muy pocas descargas (19) y sin benchmarks publicados, por lo que no hay evidencia independiente de su rendimiento; se recomienda evaluacion propia antes de uso en produccion.

## Enlaces

- Modelo: https://huggingface.co/Maincode/Matilda-Decision-v1-Nano
- Modelo hermano (27B): https://huggingface.co/Maincode/matilda-decision-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia: https://huggingface.co/Maincode/Matilda-Decision-v1-Nano/blob/main/LICENSE
- No se han encontrado paper, blog oficial ni demo publica en la informacion disponible.
