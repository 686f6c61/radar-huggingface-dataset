# respanai/span-02

## Resumen

span-02 es un modelo de decision desarrollado por respanai, construido como un fine-tune del modelo multimodal google/gemma-4-26B-A4B-it. A diferencia de un modelo generativo convencional, span-02 no produce texto libre: recibe un estado (texto o JSON, mas hasta cuatro imagenes) y un conjunto de preguntas tipadas, y devuelve una distribucion de probabilidad calibrada para cada respuesta. Los tipos de respuesta soportados son eleccion unica (`choice`), si/no (`noul`), puntuacion en una escala (`score`) y numero (`number`).

La relevancia del modelo radica en su enfoque de razonamiento "anytime": responde en decenas de milisegundos en el caso tipico y, cuando la confianza de la respuesta principal cae por debajo de 0,8, genera un pensamiento breve antes de volver a leer la respuesta. La distribucion final es la media ponderada de la lectura antes y despues de pensar (0,5 x antes + 0,5 x despues). El pensamiento esta limitado por un presupuesto de tiempo (700 ms por defecto) y se decodifica con decodificacion especulativa.

Tecnicamente es un modelo de mezcla de expertos (MoE) con aproximadamente 4B de parametros activos sobre una base de 26B, cuantizado a NVFP4/FP8 (16,4 GB en el repositorio) y servido unicamente por un motor propio en Rust/CUDA incluido en el repositorio. Los pesos no pueden cargarse con `transformers` ni con vLLM. Esta pensado para ejecutarse en una sola GPU Blackwell (RTX PRO 6000 o RTX 5090).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con motor de inferencia propio en Rust/CUDA |
| Parametros totales | 15.815.134.090 (~15,8B, dato safetensors). La model card indica una base Gemma 4 26B-A4B |
| Parametros activos | ~4B (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y FP8 (8-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con `license_link` apuntando a la licencia de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

span-02 es un fine-tune del modelo multimodal google/gemma-4-26B-A4B-it, que emplea una arquitectura de mezcla de expertos con aproximadamente 4B de parametros activos. El modelo resultante se cuantiza a NVFP4/FP8, ocupando 16,4 GB en disco, y se sirve mediante un motor de inferencia propio escrito en Rust con kernels CUDA, incluido en el propio repositorio. Este motor es obligatorio: la model card advierte explicitamente que los pesos no pueden cargarse con `transformers` ni con vLLM.

El mecanismo de inferencia se aparta del paradigma generativo. Cada pregunta se formula como un prompt y la respuesta se lee directamente de las probabilidades del modelo sobre las etiquetas de las opciones en una unica pasada hacia delante; todas las preguntas de una peticion comparten el estado, que el motor calcula una sola vez. Cuando la respuesta principal tiene una probabilidad inferior a 0,8, el modelo escribe primero un pensamiento corto (limitado por presupuesto de tiempo, 700 ms por defecto, y decodificado con decodificacion especulativa usando el borrador publico MTP de Gemma, verificado de forma voraz) y vuelve a leer la respuesta. Las respuestas de tipo `number` se generan token a token tras el pensamiento opcional, con la misma decodificacion especulativa. No se especifican en la informacion disponible los detalles sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Respuestas tipadas calibradas: `choice` (una opcion entre varias), `noul` (si/no), `score` (puntuacion en escala) y `number` (valor numerico).
- Razonamiento breve condicional: solo activa el pensamiento cuando la confianza de la respuesta principal es inferior a 0,8.
- Razonamiento "anytime": admite un presupuesto de tiempo (`budget_ms`, de 0 a 600.000) para acotar el tiempo de pensamiento.
- Procesamiento multimodal: acepta hasta 4 imagenes por peticion, ademas del estado en texto o JSON.
- Procesamiento de estado estructurado: trata el `state` como datos, no como instrucciones.
- Lectura de distribuciones de probabilidad: devuelve `probabilities` y `confidence` por pregunta.
- API compatible con System One de TypeSafe, con extensiones propias (`number`, `reasoning`, `images`).
- Multilingue: no disponible (no se especifican idiomas soportados).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible (el modelo resuelve una unica peticion de decision).

## Casos de uso

- Clasificacion y enrutado de tickets en atencion al cliente: el modelo recibe el estado con el mensaje del cliente y metadatos del pedido, y devuelve una distribucion sobre el equipo o departamento que debe gestionarlo (`choice`), ademas de respuestas si/no y numericas sobre el mismo estado. Es adecuado por su latencia de decenas de milisegundos y su salida estructurada sin parseo.
- Deteccion de intencion de reembolso o reclamacion: mediante preguntas de tipo `noul`, se obtiene una probabilidad calibrada de si el cliente solicita un reembolso, util para disparar flujos automaticos.
- Analisis de sentimiento o frustracion del cliente: con preguntas de tipo `score`, el modelo devuelve una puntuacion con leyenda y distribucion de probabilidad sobre los niveles definidos.
- Extraccion de datos estructurados desde texto: con preguntas de tipo `number`, puede extraer valores concretos (por ejemplo, dias de retraso, importes) del estado.
- Verificacion visual en pipelines de control de calidad: al aceptar hasta 4 imagenes, puede responder preguntas tipadas sobre contenido visual (por ejemplo, clasificar el estado de un producto o validar una documentacion escaneada).
- Moderacion de contenido o triaje de seguridad: clasificar un estado en categorias mediante `choice` con probabilidades calibradas, aprovechando que el modelo no genera texto libre y por tanto no puede producir salidas no deseadas.
- Sistemas de decision con restricciones de tiempo estrictas: al admitir un `budget_ms` y devolver su mejor decision hasta el momento, encaja en entornos con plazo fijo de respuesta donde hay que interrumpir el razonamiento.
- Enrutado de alto volumen y bajo coste: segun la comunicacion del autor, con el pensamiento desactivado ofrece decision a 0,01 USD por millon de tokens de entrada, adecuado para pipelines masivos de clasificacion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden al Decision Index 0.3 (version publica), que mide la calidad de las decisiones tipadas y no equivale a benchmarks generativos como MMLU o HumanEval.

| Decision Index 0.3 (publico) | Score | Peticiones respondidas |
|---|---|---|
| Indice de texto | 63,62 | 140.178 (todas) |
| Indice de vision | 70,69 | 12.210 (todas) |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K) en la informacion disponible.

En cuanto al rendimiento de inferencia, la model card indica decodificacion de pensamientos a aproximadamente 480 tokens por segundo en una RTX PRO 6000, con decodificacion especulativa.

## Requisitos de hardware

- GPU requerida: una GPU Blackwell, concretamente RTX PRO 6000 o RTX 5090 (indispensable para el soporte de NVFP4).
- VRAM estimada: el modelo ocupa 16,4 GB en disco en NVFP4/FP8; no se especifica el consumo de VRAM en ejecucion, que sera igual o superior a ese tamano.
- Compatibilidad con GPU de consumo: si, en RTX 5090 (GPU de consumo de la generacion Blackwell).
- No compatible con GPUs no Blackwell ni con librerias estandar: los pesos no se cargan con `transformers` ni con vLLM.
- Despliegue: motor propio incluido en el repositorio (`engine/`), construible con CUDA toolkit 12.8+ y Rust. Se puede ejecutar con Docker (requiere driver NVIDIA con soporte CUDA 12.9 y NVIDIA container toolkit) o de forma nativa. El servidor arranca en aproximadamente 20 segundos.
- Endpoints de servicio: `POST /v1/systemone` para peticiones y `GET /health` para comprobar disponibilidad.
- Modelo de decodificacion especulativa: descarga adicional del borrador google/gemma-4-26B-A4B-it-assistant.
- Latencia: tipica de decenas de milisegundos por peticion; cuando el modelo piensa, la peticion se completa en menos de un segundo con el presupuesto por defecto.
- Throughput: no disponible como cifra global; unico dato concreto de ~480 tokens de pensamiento por segundo en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| span-02 (respanai) | ~15,8B totales (safetensors), ~4B activos | MoE, fine-tune de Gemma 4 26B-A4B, motor propio | Distribuciones tipadas calibradas | Apache 2.0 (con enlace a licencia Gemma 4) | HuggingFace, motor propio |
| google/gemma-4-26B-A4B-it | 26B totales, ~4B activos | MoE multimodo | Texto generativo libre | Licencia Gemma 4 | HuggingFace |
| Modelos de decision comerciales (System One de TypeSafe) | no disponible | no disponible | Respuestas tipadas | no disponible | API comercial |

No se dispone de datos de rendimiento de modelos de decision comparables en la informacion proporcionada, por lo que la comparacion cuantitativa entre alternativas queda como no disponible.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde a preguntas tipadas predefinidas, lo que limita su uso a tareas de decision y clasificacion.
- Requiere obligatoriamente el motor propio incluido en el repositorio; no es cargable con `transformers` ni con vLLM, lo que complica la integracion con stacks habituales.
- Dependencia de hardware muy especifico: solo funciona en GPUs Blackwell (RTX PRO 6000 o RTX 5090), lo que excluye gran parte del parque de GPUs actual.
- El modelo base es Gemma 4, con enlace a la licencia de Gemma 4 (`license_link`), lo que puede introducir condiciones adicionales de uso comercial mas alla del Apache 2.0 declarado; conviene verificar la licencia concreta antes de un uso en produccion.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que no puede garantizarse cobertura multilingue ni contextos extensos.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible. Al no generar texto libre, el riesgo de alucinacion textual es menor, pero las probabilidades devueltas pueden estar mal calibradas en dominios alejados de los datos de entrenamiento.
- El umbral de pensamiento (0,8) y el presupuesto de tiempo (700 ms por defecto) son parametros configurables que afectan a latencia y calidad; su ajuste incorrecto puede degradar los resultados.
- El proyecto es muy reciente y con bajo volumen de adopcion (43 descargas y 15 "likes" en el momento de la consulta), lo que reduce la validacion externa y el soporte de la comunidad.
- El autor declara que span-02 es "el modelo de decision mas barato" con un precio de 0,01 USD por millon de tokens de entrada; esta afirmacion proviene de la comunicacion del propio autor y no se ha verificado de forma independiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/respanai/span-02
- Perfil del autor en HuggingFace: https://huggingface.co/respanai
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it (referenciado como base)
- Borrador de decodificacion especulativa: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Documentacion de la API System One de TypeSafe: https://docs.typesafe.ai/api
- Anuncio en X (Respan): https://x.com/RespanAI/status/2110777826240819205
- Comunicacion sobre precio en X (Respan): https://x.com/RespanAI/status/2111125313782722573
- Comentario en X sobre razonamiento interrumpible: https://x.com/techNmak/status/2110780822731317560
- Cobertura en Digg: https://digg.com/ai/eaxrp7uz
