# nokkela-ai/clef-flash

## Resumen

Clef-Flash es un modelo multimodal de 9.400 millones de parametros desarrollado por Cloudflare y redistribuido como fork independiente por Nokkela.AI. Se post-entrena a partir de Qwen/Qwen3.5-9B, conservando su codificador de vision, y anade una cabeza transformer de esquema conjunto que convierte un estado (texto, JSON, imagenes o video) y un esquema de preguntas tipadas en decisiones estructuradas. En lugar de generar texto libre, el modelo devuelve en una sola pasada hacia adelante un logit por cada opcion permitida de cada pregunta, de modo que no requiere parseo de salida.

La propuesta es relevante porque sustituye el patron habitual de "generar texto y extraer JSON" por una clasificacion probabilistica nativa sobre esquemas declarativos. Cada pregunta admite tipos `choice`, `score` y `noul`, y el modelo produce probabilidades calibradas por opcion, lo que facilita su integracion en pipelines de decision automatizada y en sistemas con requisitos de trazabilidad.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y codigo personalizado para la carga y la codificacion de registros. Su API es compatible con Jev y SystemOne, y puede servirse con SGLang. El repositorio tiene 18 descargas y ningun "like" en el momento de la consulta, lo que indica una adopcion todavia muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B con codificador de vision) mas cabeza transformer de esquema conjunto |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; la model card menciona bf16 en SGLang) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fragmentados con `model.safetensors.index.json`), mas `joint_head.safetensors` para la cabeza |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-9B, que incluye su codificador de vision, almacenado como safetensors fragmentados estandar. Sobre las representaciones ocultas finales del backbone se monta una cabeza transformer de esquema conjunto ("joint schema head") de menor tamano. Esta cabeza enruta la evidencia del estado hacia cada pregunta del esquema y puntua de forma conjunta todas las opciones de todas las preguntas, emitiendo un logit por opcion permitida. Aplicando un softmax por pregunta se obtienen las probabilidades.

El modelo se ha post-entrenado especificamente para la tarea de decision estructurada, no para generacion de texto libre: la model card indica explicitamente que no hay generacion de texto libre ni parseo de salida. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal es el paradigma de salida: decision tipada y probabilistica en una unica pasada, con soporte de estados multimodales (texto, JSON, imagenes y video).

## Capacidades

- Decision estructurada sobre esquemas tipados: preguntas de tipo `choice` (seleccion entre criterios), `score` (escala ordinal con leyenda) y `noul` (probabilidad de verdadero/falso).
- Entrada multimodal: acepta estado en texto plano, JSON, imagenes (PIL) y video (arrays de fotogramas).
- Salida probabilistica por opcion, con `confidence` y `probabilities` por pregunta, sin necesidad de parseo.
- Compatibilidad de API con Jev y SystemOne (`POST /v1/systemone`), incluyendo campos `model`, `answers` y `usage`.
- Soporte de instrucciones opcionales por pregunta (`instructions`) y criterios explicitos por opcion.
- Capacidad de clasificacion y enrutamiento (por ejemplo, asignacion de departamento o evaluacion de urgencia).
- Servicio mediante SGLang con endpoint dedicado.
- No dispone de generacion de texto libre, tool calling ni razonamiento multi-paso en el sentido conversacional; la informacion disponible no menciona soporte de agentes.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del mensaje como estado y un esquema con preguntas `choice` (departamento: facturacion, tecnico) y `score` (urgencia en tres niveles), devolviendo probabilidades por opcion en una sola pasada. Es adecuado porque evita el parseo de salidas generadas y ofrece confianza calibrada por decision.
- Enrutamiento de facturas y documentos financieros: con un estado JSON como el del ejemplo de la model card (proveedor, importe, moneda, estado), el modelo responde a preguntas como "esta vencida" o "supera 1000 USD" mediante preguntas `choice` y `noul`, lo que permite automatizar la validacion contable.
- Moderacion y clasificacion de contenido visual: al aceptar imagenes como parte del estado, puede responder a preguntas tipadas sobre el contenido de una imagen (por ejemplo, presencia de un objeto o categoria), integrandose en pipelines de revision.
- Analisis de video para alertas operativas: con arrays de fotogramas como entrada, el modelo puede responder preguntas binarias o de eleccion sobre lo que ocurre en el video, util para monitorizacion de procesos.
- Extraccion de decisiones en formularios y encuestas: dado un esquema de preguntas con criterios definidos, transforma respuestas libres o documentos en valores estructurados y probabilisticos, apto para sistemas de registro.
- Clasificacion de riesgo en tiempo real: con preguntas `noul` sobre condiciones concretas (por ejemplo, "hay una caida de servicio"), el modelo devuelve la probabilidad de verdadero, lo que permite umbrales configurables en sistemas de alerta.
- Integracion en APIs compatibles con SystemOne: al exponer `POST /v1/systemone` mediante SGLang, puede desplegarse como microservicio de decision para aplicaciones existentes que ya hablan ese contrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "Decision Index leaderboard" en clef-evals.workers-ai-mle.workers.dev, pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9.400 millones de parametros, en bf16 los pesos ocupan aproximadamente 18,8 GB, a lo que hay que sumar la cabeza de esquema y las activaciones.
- GPU recomendadas segun la model card: H200 para el ejemplo de uso con PyTorch y SGLang; el cookbook de SGLang menciona comandos de lanzamiento para H200, B200 y B300.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el tamano en bf16 supera la VRAM de las RTX 4090 (24 GB) solo si se anaden activaciones y overhead, por lo que no puede garantizarse su ejecucion en consumer GPU.
- Opciones de despliegue: PyTorch con `transformers` (probado con torch 2.11 y transformers 5.10.2) y SGLang mediante la imagen `lmsysorg/sglang:dev-clef`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nokkela-ai/clef-flash | 9.409.813.744 | no disponible | Decisiones tipadas con probabilidades | Apache-2.0 | Hugging Face (fork) |
| Cloudflare/clef-flash | no disponible en la informacion | no disponible | Decisiones tipadas con probabilidades | Apache-2.0 | Hugging Face |
| Cloudflare/clef | no disponible en la informacion (variante mayor) | no disponible | Decisiones tipadas con probabilidades | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B | 9B (aproximado) | no disponible | Generacion de texto libre | no disponible | Hugging Face |

La comparacion con alternativas de proposito general no es directa, ya que Clef-Flash no genera texto libre sino decisiones estructuradas. La informacion disponible no incluye datos de rendimiento comparado con estos modelos.

## Limitaciones y advertencias

- El modelo no genera texto libre; solo responde a esquemas de preguntas tipadas, por lo que no sirve para tareas conversacionales abiertas.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de post-entrenamiento, lo que limita la evaluacion de riesgos.
- Riesgo de alucinacion no cuantificado: al emitir probabilidades, una confianza alta no garantiza correccion; se recomienda validar con umbrales y supervision humana.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto no disponible: no se puede planificar el uso con estados largos o videos extensos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es un fork independiente de Nokkela.AI sobre Cloudflare/clef-flash; conviene revisar la trazabilidad de la licencia en el repositorio original.
- Requiere codigo personalizado (`joint_schema_model.py`) y versiones concretas de `transformers` (5.10.2) y `torch` (2.11), lo que puede complicar la integracion en entornos estandar.
- Adopcion muy baja (18 descargas, 0 likes) en el momento de la consulta: no hay evidencia de comunidad ni de casos de produccion validados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/clef-flash
- Modelo original: https://huggingface.co/Cloudflare/clef-flash
- Variante mayor Clef: https://huggingface.co/Cloudflare/clef
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef
