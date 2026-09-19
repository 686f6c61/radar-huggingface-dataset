# Mapika/decider-2b

## Resumen

decider-2b es un modelo de decisión desarrollado por Mapika, un ajuste fino completo de Qwen/Qwen3.5-2B-Base (1.881.825.088 parámetros, ~1,9B) que no genera texto libre. Su función es leer un contexto más una o varias preguntas tipadas, cada una con su lista explícita de opciones, y devolver en una única pasada hacia delante (one-pass) una distribución de probabilidad calibrada sobre las opciones de cada pregunta, sin decodificación autoregresiva, sin parseo de JSON y sin posibilidad de violar un esquema.

El modelo se presenta como una replicación abierta de la idea de "System One model": en lugar de un LLM conversacional, es un componente invocable desde software. Adopta la forma de petición de la API de TypeSafe (Jev, `POST /v1/systemone`) y es compatible con el `typesafe-sdk` oficial apuntando a un servidor local, con tipos de pregunta de elección (2 a 255 opciones), un tipo de respuesta sí/no y un tipo Score con niveles ordenados. Está entrenado sobre una mezcla de 64 conjuntos de datos públicos de decisión y ejemplos situación-a-acción, e incluye modos de abstención por umbral de confianza para derivar casos dudosos a revisión humana.

Es relevante porque ataca un problema distinto al de los LLM generativos habituales: el enrutado y la clasificación estructurada de baja latencia y alta reproducibilidad en producción. En lugar de pedir a un modelo generativo que escriba la etiqueta correcta y validar su salida, decider-2b expone directamente una probabilidad por opción, lo que simplifica el control de calidad, el establecimiento de umbrales y la integración en pipelines. La model card describe la versión v8; el repositorio ocupa 15,1 GB, muy por encima de lo que ocuparía un único checkpoint, lo que sugiere que aloja varias versiones del modelo además del código auxiliar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con capas de atención lineal (tag `qwen3_5_text`); ajuste fino completo para decisión de una pasada |
| Parametros totales | 1.881.825.088 (~1,9B) |
| Parametros activos | No procede: no es MoE |
| Longitud de contexto | Hasta 32k tokens incluyendo el estado y las preguntas (según model card); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible (no se documenta ningún formato cuantizado; el tag declara safetensors sin especificar precisión, se usa `bfloat16` en los ejemplos de la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga con `transformers`); incluye el paquete Python `decider/` en el propio repositorio |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 15,1 GB |
| Descargas / likes | 111 / 10 |
| Fechas | Creado 2026-09-16, actualizado 2026-09-18 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer denso de ~1,9B parámetros con capas de atención lineal propias de la familia Qwen3.5. El repositorio exige `flash-linear-attention` para usar los kernels Triton de esas capas: el modelo funciona sin ellos, pero varias veces más lento. El ajuste no es un LoRA ni un adaptador, sino un fine-tuning completo durante una época sobre 942.000 ejemplos (183M tokens), entrenado en 2,5 horas en una única NVIDIA GH200 con entropía cruzada, elegida explícitamente como regla de puntuación propia (proper scoring rule) para obtener probabilidades calibradas en lugar de etiquetas argmax. El corpus de esa primera época es una mezcla de 64 conjuntos de datos públicos de decisión.

Sobre esa base se encadenan fases adicionales: una segunda época con 45.000 ejemplos situación-a-acción (trayectorias de agente, elección de elementos web, situaciones sintéticas y estados de juego) con replay de la mezcla general (v4); y las iteraciones v6 a v8, que continúan el entrenamiento sobre las formas de entrada de la API Jev de TypeSafe (opciones descritas, hasta 255 opciones, estados JSON con referencias por ruta, entradas largas y preguntas puntuadas de forma independiente), sobre preguntas personalizadas escritas por un profesor (sí/no libres, opciones nombradas por el usuario, una opción genérica junto a un catch-all), sobre una segunda disposición de prompt cacheable y sobre niveles Score aislados. La model card describe v8.

Dos detalles de diseño son destacables. Primero, cada pregunta se puntúa en su propia fila, de modo que la respuesta a una pregunta no depende de qué otras preguntas se formulen; la opción `independent=False` las empaqueta en una sola fila y reduce la latencia aproximadamente a la mitad para estados cortos. Segundo, el método `schema(questions)` precalcula el prefijo de preguntas fijo y permite que cada petición ejecute solo el estado, con una ganancia de 1,2 a 2,4 veces por petición y hasta 19 veces por lote, a cambio de una pérdida de precisión que el autor cuantifica en unos 1,5 puntos en conjuntos de etiquetas fijos y unos 5 puntos con opciones por ejemplo, y mayor aún con más de 50 opciones y estados de varios miles de tokens.

## Capacidades

- Clasificación con opciones explícitas: devuelve una distribución de probabilidad sobre las opciones de cada pregunta en una sola pasada, con `choice` y `confidence` por pregunta.
- Multi-pregunta en una pasada: varias preguntas sobre el mismo contexto, puntuadas de forma independiente (cada una en su propia fila) para que las respuestas no se condicionen entre sí.
- Rango de opciones amplio: de 2 a 255 opciones por pregunta; por encima de 10 opciones utiliza un token de etiqueta por opción (según `decider/prompt.py`).
- Tipos de pregunta estructurados: `choice` (elección entre opciones descritas, con criterios y campo `not_for`), `noul` (sí/no) y `score` (niveles ordenados con leyenda).
- Puntuación de niveles aislada: cada nivel Score se evalúa en su propia fila, sin su número ni sus vecinos, y los ajustes por nivel se normalizan; la respuesta informa `level_fit` y su suma `fit_mass`.
- Estados ricos: el estado puede ser una cadena, un objeto o un array, con referencias por ruta desde las instrucciones (por ejemplo `ticket.messages[0].text`), hasta 32k tokens junto con las preguntas.
- Instrucciones y descripciones de opción como cadena o cualquier valor JSON; los identificadores de pregunta nunca se muestran al modelo.
- Procesamiento por lotes: `decide_batch` puntúa muchos contextos con muchas preguntas en una sola llamada.
- Abstención calibrada: `abstain_below=t` devuelve `None` en las decisiones con confianza inferior a `t`, pensado para derivar a un humano.
- Salida sin parseo: no hay decodificación de texto ni validación de esquema, por lo que no existen violaciones de formato.
- Servidor HTTP opcional: `decider.serve` expone `POST /v1/systemone` y el `typesafe-sdk` oficial funciona contra él sin cambios configurando `TYPESAFE_BASE_URL`.
- Modo de compatibilidad con `transformers` puro: la misma computación se puede reproducir leyendo los logits en la posición del paréntesis de cada bloque `Answer k: (`.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la propia model card clasifica una incidencia ("me han cobrado dos veces") en `billing`, `technical support` o `sales` con confianza asociada, y permite encadenar una segunda pregunta sobre si requiere reembolso; el tamaño de 1,9B y la pasada única lo hacen viable a alto volumen.
- Triaje con derivación a humano: combinando `abstain_below` con las probabilidades por clase, un equipo puede automatizar solo los casos de alta confianza y enviar el resto a un agente, algo que un modelo generativo no ofrece de forma nativa.
- Elección de elementos en automatización web y agentes: la fase de entrenamiento situación-a-acción incluye elección de elementos web y trayectorias de agente, por lo que el modelo puede seleccionar entre opciones descritas (botones, enlaces, acciones) sin generar texto intermedio.
- Etiquetado masivo de conjuntos de datos: `decide_batch` puntúa muchos contextos con muchas preguntas en una llamada, útil para asignar categorías, intenciones o atributos a corpus grandes de forma reproducible.
- Extracción estructurada sobre estados JSON: con estados como objetos y referencias por ruta (`ticket.messages[0].text`), se pueden resolver preguntas booleanas o de elección directamente sobre los campos de un payload sin escribir expresiones de extracción ni parsear la salida del modelo.
- Encuestas y voz del cliente con escala: el tipo `score` con niveles (`calm`, `frustrated`, `very frustrated`) permite convertir texto libre en una puntuación ordenada y normalizada, con `fit_mass` como indicador de coherencia del ajuste.
- Evaluación de estados en agentes de refuerzo o juegos: el entrenamiento incluye estados de juego, de modo que el modelo puede actuar como política de decisión discreta sobre representaciones textuales o JSON del estado.
- Conmutación de política en sistemas de decisión existentes: al replicar la forma de petición de la API Jev de TypeSafe y ser compatible con `typesafe-sdk`, puede actuar como backend local sustituible por servicio remoto cambiando una variable de entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, y tampoco se han encontrado evaluaciones independientes. Los únicos datos cuantitativos publicados son de ingeniería, no de calidad de decisión:

| Dato aportado por el autor | Valor |
|---|---|
| Ejemplos de la primera época de ajuste | 942.000 (183M tokens) |
| Ejemplos de la segunda época (situación-a-acción) | 45.000 |
| Conjuntos de datos públicos de decisión en la mezcla | 64 |
| Tiempo de entrenamiento (1 época, 1x NVIDIA GH200) | 2,5 horas |
| Coste de precisión del layout questions-first (etiquetas fijas) | ~1,5 puntos |
| Coste de precisión del layout questions-first (opciones por ejemplo) | ~5 puntos (mayor con 50+ opciones y estados largos) |
| Aceleración por petición con `schema()` | 1,2 a 2,4 veces |
| Aceleración por lote con `schema()` | hasta 19 veces |
| Reducción de latencia con `independent=False` | ~la mitad (estados cortos) |

## Requisitos de hardware

- VRAM para inferencia en `bfloat16`: aproximadamente 3,8 GB solo de pesos (1.881.825.088 parámetros x 2 bytes), más activaciones y caché de claves/valores, que crece con la longitud del estado y las preguntas (hasta 32k tokens). Estimación calculada a partir del recuento de parámetros, no publicada por el autor.
- VRAM en `float32`: unos 7,5 GB de pesos; no se documenta ningún formato cuantizado oficial, por lo que los valores de 8 o 4 bits solo serían aplicables mediante cuantización externa (por ejemplo `bitsandbytes`) y no están validados.
- GPU de consumo: cabe en tarjetas de 8-12 GB o superiores (RTX 3060 12 GB, RTX 4070/4080, RTX 4090) en `bfloat16`, con margen dependiente de la longitud de contexto.
- GPU de centro de datos: A100, H100 y GH200; el autor realizó el fine-tuning completo en una única NVIDIA GH200.
- Software obligatorio: `torch`, `transformers>=5` y `flash-linear-attention` (kernels Triton para las capas de atención lineal de Qwen3.5). Sin ese paquete el modelo funciona, pero varias veces más lento. Se recomienda Python 3.11+ para que los kernels usen `torch.compile`.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForCausalLM`, el paquete `decider` incluido en el repositorio (clase `Decider`, `decide`, `decide_batch`, `schema`), y `decider.serve` como servidor HTTP `POST /v1/systemone`. Compatible con el `typesafe-sdk` oficial.
- Despliegue con vLLM, llama.cpp, Ollama, TGI o GGUF: no disponible; la model card no menciona ninguno de estos motores ni publica pesos en GGUF.
- Latencia y throughput absolutos: no disponible. Solo se publican cifras relativas (aceleraciones de `schema()` y de `independent=False`), sin valores en milisegundos ni peticiones por segundo.
- El repositorio pesa 15,1 GB, muy por encima del peso de un único checkpoint en `bfloat16`; conviene comprobar qué archivos de pesos se descargan antes de desplegar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de evaluaciones comparativas publicadas en la informacion disponible, por lo que no es posible establecer una comparación de rendimiento con alternativas. La comparación se limita a los datos verificables del propio modelo y de su base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Mapika/decider-2b | 1,9B | hasta 32k tokens (estado + preguntas) | Decisión/clasificación con opciones, salida probabilística en una pasada | Apache 2.0 | Publicado en HuggingFace (111 descargas, 10 likes) |
| Qwen/Qwen3.5-2B-Base | ~1,9B | no disponible | Modelo base generativo | no disponible en la informacion proporcionada | Publicado en HuggingFace (referenciado como base) |
| Alternativas de clasificación con LLM generativo | no disponible | no disponible | Generación de etiqueta + validación de esquema | no disponible | no disponible |
| Alternativas de enrutado tipo "System One" | no disponible | no disponible | Decisión de una pasada | no disponible | no disponible |

El autor menciona la API Jev de TypeSafe (`POST /v1/systemone`) como el servicio con cuya forma de petición es compatible el modelo, pero no se aportan cifras comparativas entre ambos.

## Limitaciones y advertencias

- El modelo no genera texto: fuera de ámbitos de decisión con opciones explícitas no es utilizable. No sirve para redacción, resumen, diálogo abierto ni generación de código.
- Idioma: solo inglés declarado (`language: [en]`). El comportamiento con entradas en castellano u otros idiomas no está documentado ni evaluado.
- Sin benchmarks publicados: no hay métricas de precisión, calibración real (ECE, Brier) ni evaluación independiente; las confianzas devueltas deben validarse en el dominio concreto antes de confiar en los umbrales de abstención.
- Riesgo de calibración sobreestimada: el ejemplo de la model card devuelve confianzas de 0,99 en un caso trivial; no debe interpretarse como garantía de acierto. Conviene calibrar con datos propios y usar `abstain_below`.
- Sensibilidad al formato: el layout questions-first, útil para cachear, cuesta precisión (unos 1,5 puntos con etiquetas fijas y unos 5 con opciones por ejemplo, más con 50+ opciones o estados de miles de tokens). Las cifras de latencia y precisión dependen de la configuración elegida.
- Límite práctico de contexto: 32k tokens incluyendo estado y preguntas; estados más largos quedan fuera. No se documenta degradación por longitud dentro del límite.
- Poca adopción y escasa validación externa: 111 descargas y 10 likes en el momento de la consulta, con una model card extensa que describe varias iteraciones (v4 a v8) y es fácil equivocarse sobre qué checkpoint se está sirviendo.
- Ambigüedad del repositorio: 15,1 GB para un modelo de 1,9B implica contenido adicional (código `decider/` y posiblemente varios checkpoints); revisar los archivos antes de producción.
- Dependencia de kernels Triton: sin `flash-linear-attention` el rendimiento cae varias veces; esto condiciona el hardware y el stack (GPU con soporte Triton, Python 3.11+).
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad. Al derivar de un corpus de 64 conjuntos públicos de decisión, puede heredar sesgos de anotación y de dominio de esos datos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; si se usa la compatibilidad con la API Jev de TypeSafe, revisar las condiciones del servicio de terceros por separado.
- No hay pesos cuantizados oficiales ni soporte declarado para GGUF, vLLM, Ollama o TGI, lo que limita las opciones de despliegue de bajo coste sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-2b
- Modelo base Qwen/Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Paquete de inferencia incluido en el repositorio: carpeta `decider/` del propio repositorio (clases `Decider`, `decider.serve`, módulo `decider/prompt.py`)
- Los resultados de la búsqueda web realizada no contienen ningún enlace relevante al modelo, a su paper ni a repositorios asociados; no se dispone de URL de paper, blog técnico ni demo.
