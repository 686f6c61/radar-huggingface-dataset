# LiquidAI/d1-2B-GGUF

## Resumen

d1-2B-GGUF es la distribucion en formato GGUF de d1-2B, un modelo de decision desarrollado por Liquid AI para clasificacion, extraccion y calibracion sobre entradas multimodales (texto, imagen y video). A diferencia de un modelo generativo convencional, d1-2B no produce tokens: devuelve respuestas calibradas en un unico forward pass, lo que lo situa en la categoria de modelos "system-one" orientados a tomar decisiones rapidas y deterministas en lugar de mantener conversaciones abiertas.

El modelo se construye sobre LFM3-VL-2B, la base multimodal de la familia LFM3 de Liquid AI, y cuenta con aproximadamente 1.728 millones de parametros. Esta version GGUF esta pensada para inferencia local en CPU y GPU mediante llama.cpp, lo que facilita su despliegue en entornos edge donde no se dispone de infraestructura de GPU dedicada. El pipeline declarado es image-text-to-text y soporta 16 idiomas, entre ellos el castellano.

Su relevancia actual radica en la propuesta de sustituir parte del trabajo de un LLM generativo por un modelo especializado en decisiones estructuradas (preguntas de tipo si/no, eleccion entre categorias y puntuacion ordinal) con calibracion explicita. Esto reduce latencia, coste por consulta y variabilidad en tareas de enrutamiento, triaje o extraccion de campos, donde la generacion libre introduce ruido innecesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de decision construido sobre LFM3-VL-2B, multimodal texto/imagen/video) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el ejemplo de la model card usa Q8_0; no se detalla el conjunto completo de cuantizaciones publicadas) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que d1-2B se construye sobre LFM3-VL-2B, un modelo multimodal de la familia LFM3 de Liquid AI, y que funciona como modelo de decision: recibe un estado (texto o JSON), opcionalmente imagenes o video, y un conjunto de preguntas tipadas (`noul`, `choice`, `score`), y devuelve respuestas calibradas en un unico forward pass sin generar tokens. No se detallan en la informacion proporcionada el tipo exacto de bloque (transformer, hibrido o SSM), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o calibracion post-entrenamiento especificas.

La innovacion principal declarada es el paradigma "system-one": el modelo no decodifica texto libre, sino que produce directamente una respuesta a cada pregunta con una calibracion asociada. La version GGUF anade soporte nativo en llama.cpp a partir de la build b11960 (v0.8.0), con un endpoint dedicado `/v1/systemone` que acepta el estado, las preguntas y los medios en una sola peticion.

## Capacidades

- Decision binaria (`noul`): responder si/no a una instruccion sobre un estado de texto o JSON.
- Eleccion entre categorias (`choice`): seleccionar una opcion entre un conjunto de criterios definidos por el usuario.
- Puntuacion ordinal (`score`): asignar un valor dentro de una escala de criterios ordenados (por ejemplo, urgencia en tres niveles).
- Entrada multimodal: acepta texto, imagenes y video como parte del estado de la consulta.
- Procesamiento por lotes: una pregunta se lee en un unico batch, con el estado y los medios incluidos en el mismo.
- Multilingue: 16 idiomas declarados, incluido el castellano.
- Integracion con llama.cpp: servidor compatible con el endpoint `/v1/systemone`.
- Soporte de video: requiere `ffmpeg` disponible en `PATH`.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada ticket en equipos (facturacion, tecnico, fraude) y asignar una puntuacion de urgencia en una sola llamada, como muestra el ejemplo de la model card, reduciendo la latencia frente a un LLM generativo que deba redactar la decision.
- Enrutamiento de correo entrante: con preguntas de tipo `choice` sobre el remitente y el contenido, se puede derivar cada mensaje al departamento correcto sin generar texto adicional.
- Moderacion de contenido con imagen: al aceptar imagenes junto al texto, permite responder preguntas binarias sobre si una publicacion cumple las normas, manteniendo el coste por decision bajo.
- Extraccion de campos estructurados: aunque la extraccion completa aun no esta soportada en llama.cpp segun la model card, el modelo esta etiquetado para esa tarea y puede usarse para validar presencia o ausencia de campos en documentos.
- Clasificacion de imagenes en flujos de trabajo: por ejemplo, verificar si una foto adjunta a una solicitud de cuidado de mascotas contiene el animal esperado, como en el ejemplo de los dos gatos.
- Control de calidad en pipelines de datos: puntuar la calidad o relevancia de un lote de ejemplos con preguntas `score`, aprovechando la calibracion para fijar umbrales.
- Deteccion de intencion en asistentes de voz o chat: decidir si el usuario pide un reembolso, una cancelacion o soporte tecnico antes de invocar el modelo generativo que redactara la respuesta.
- Analisis de video en edge: con `ffmpeg` disponible, responder preguntas binarias sobre clips cortos en dispositivos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1.728 millones de parametros, una cuantizacion Q8_0 ronda los 1,8 GB de pesos, y cuantizaciones menores reduciran esa cifra proporcionalmente.
- GPU recomendadas: no especificadas por el autor; al ser un modelo de ~2B en GGUF, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos 4 GB de VRAM para Q8_0, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (build b11960 / v0.8.0 o superior) mediante `llama-server` con el endpoint `/v1/systemone`. No se mencionan vLLM, TGI ni Ollama en la informacion proporcionada.
- Parametros de ejecucion relevantes: `-b 8192 -ub 8192` en el ejemplo oficial; una imagen ocupa como maximo la mitad de `-ub`, por lo que 8192 preserva el presupuesto completo de 4096 tokens por imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| d1-2B-GGUF | 1.728 M | No disponible | Texto, imagen, video | GGUF | lfm1.0 |
| LFM3-VL-2B | No disponible en la informacion | No disponible | Texto, imagen | No disponible | No disponible |
| Alternativas generativas multimodales de ~2B | No disponible | No disponible | Texto, imagen | Multiples | Multiples |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde a preguntas tipadas (`noul`, `choice`, `score`), lo que limita su uso a tareas de decision y no a conversacion abierta.
- En llama.cpp no estan soportadas aun la eleccion multiple (`"multiple": true`), la extraccion, las estimaciones ni las cajas (boxes), segun la model card.
- La entrada de video requiere `ffmpeg` en `PATH`.
- El tamano de batch (`-b` y `-ub`) debe acomodar el estado y los medios de la consulta; una configuracion insuficiente puede truncar la informacion.
- La licencia lfm1.0 es una licencia "other"; es necesario revisar sus terminos para uso comercial antes de desplegar el modelo en produccion.
- No se publican datos de sesgos, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible.
- No se especifica la longitud de contexto, lo que dificulta planificar estados muy largos.
- Al ser un modelo de decision calibrado, la calidad de las respuestas depende de la formulacion de las instrucciones y criterios; conviene validar umbrales en el dominio de aplicacion.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/LiquidAI/d1-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Modelo LFM3-VL-2B: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de presentacion: https://www.liquid.ai/blog/open-d1
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b11960: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Release v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
