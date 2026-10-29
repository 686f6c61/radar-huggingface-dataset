# LiquidAI/d1-2B-GGUF

## Resumen

d1-2B-GGUF es la distribucion en formato GGUF de d1-2B, un «modelo de decision» multimodal desarrollado por Liquid AI (spin-off del MIT) para responder preguntas cerradas sobre un estado de entrada (texto, JSON, imagenes o video) en un unico pase forward, sin generar tokens. Frente a un modelo generativo convencional, d1 no produce texto libre: devuelve respuestas calibradas a preguntas de tipo si/no (`noul`), eleccion entre criterios (`choice`) y puntuacion ordinal (`score`). Esta version GGUF esta pensada para inferencia local en CPU y GPU mediante llama.cpp.

El modelo se construye sobre LFM3-VL-2B, el modelo vision-lenguaje de 2B de la familia Liquid Foundation Models, y conserva su caracter multimodal (image-text-to-text). Con 1.728.801.600 parametros reales (aproximadamente 1,73B) y una licencia `lfm1.0`, se posiciona en el segmento edge: el repo GGUF ocupa 10,8 GB e incluye cuantizaciones que permiten ejecutarlo en hardware de consumo.

Su relevancia actual esta en el enfoque «system-one»: sustituir llamadas a LLM generativos por un clasificador multimodal calibrado y de baja latencia en tareas de enrutado, triaje, guardrails y etiquetado. La integracion con llama.cpp exige una version reciente (b11960 / v0.8.0 o superior) y expone un endpoint propio, `/v1/systemone`, en lugar de la API de chat completions habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision multimodal derivado de LFM3-VL-2B (familia Liquid Foundation Models); respuesta en un unico pase forward sin generacion de tokens. Detalle interno de capas no disponible |
| Parametros totales | 1.728.801.600 (aproximadamente 1,73B, dato de safetensors) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible como spec oficial. En los ejemplos de llama.cpp se usa una ventana de estado de 8192 tokens (`-b 8192 -ub 8192`), con un presupuesto maximo de 4096 tokens por imagen |
| Tipos de cuantizacion | GGUF; Q8_0 confirmado en los ejemplos de uso. El resto de cuantizaciones del repo no estan detalladas (tamano total del repo: 10,8 GB) |
| Idiomas soportados | 17 idiomas: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

d1-2B se presenta como un modelo de decision construido sobre LFM3-VL-2B, el modelo vision-lenguaje de 2B de Liquid AI. La innovacion principal es el paradigma «system-one»: en lugar de decodificar tokens autoregresivamente, el modelo procesa el estado (texto, JSON, imagenes o video) junto con las preguntas y emite directamente respuestas calibradas en un solo pase forward. Esto elimina la latencia de decodificacion y el coste asociado a la generacion de texto, y encaja con tareas de clasificacion, extraccion y puntuacion.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de atencion (linear attention, SSM) mas alla de la pertenencia a la familia LFM y del caracter «liquid» de la misma. La model card remite a la ficha del modelo original (LiquidAI/d1-2B) para los detalles de arquitectura y entrenamiento, que no se reproducen en esta version GGUF.

## Capacidades

- Decision sobre texto o JSON: respuesta a preguntas de tipo si/no (`noul`), eleccion entre criterios (`choice`) y puntuacion ordinal (`score`).
- Decision multimodal: acepta imagenes ademas de texto en el mismo estado de entrada.
- Decision sobre video: acepta ficheros de video como estado (requiere `ffmpeg` disponible en `PATH`).
- Respuestas calibradas en un unico pase forward, sin generacion de tokens.
- Multilingue: 17 idiomas declarados, incluido el espanol.
- Integracion con llama.cpp mediante el endpoint `/v1/systemone`.
- Soporte de estado nulo (`null`) cuando la imagen o el video constituyen por si solos el estado completo.
- No soportado todavia en llama.cpp: eleccion multiple con `"multiple": true`, extraccion, estimaciones y cajas (boxes).

## Casos de uso

- Triaje de tickets de soporte: el modelo puede recibir el texto del ticket como estado y responder simultaneamente a preguntas como si el cliente pide reembolso (`noul`), que equipo debe gestionarlo (`choice` entre billing, technical, fraud) y que urgencia tiene (`score`). Es adecuado porque devuelve las tres decisiones en una sola pasada y con criterios explicitos.
- Enrutado de peticiones en pipelines de agentes: como paso previo a un LLM generativo, d1-2B decide si una consulta requiere herramienta, recuperacion o respuesta directa, reduciendo el numero de llamadas costosas. Su formato de preguntas con criterios encaja con una funcion de gating.
- Moderacion y clasificacion de imagenes: con soporte image-text-to-text, puede clasificar fotos adjuntas en flujos de soporte (por ejemplo, identificar animales en una solicitud de cuidado de mascotas) o verificar condiciones visuales simples.
- Analisis de video para verificacion: con `ffmpeg` instalado, puede responder preguntas de eleccion o si/no sobre clips cortos (por ejemplo, que actividad realiza una persona), util en inspeccion automatizada o etiquetado de contenido.
- Etiquetado y anotacion a escala: al no generar texto y devolver puntuaciones calibradas, es apto para clasificar grandes volumenes de registros (soporte, encuestas, formularios) con coste por item bajo.
- Guardrails y validacion de salidas: puede actuar como verificador de si/no sobre respuestas o estados de un sistema mayor (por ejemplo, comprobar si una respuesta cumple una condicion antes de publicarse).
- Enrutado en RAG: decidir a que coleccion o indice dirigir una consulta mediante preguntas `choice` con criterios definidos por el desarrollador.
- Despliegue en edge o entornos sin GPU: al distribuirse en GGUF y caber en hardware de consumo o incluso CPU, permite clasificacion local con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 1,73B parametros): aproximadamente 2 GB en Q8_0 (pesos mas overhead de contexto), en torno a 1-1,5 GB en cuantizaciones de 4-5 bits. El repo completo ocupa 10,8 GB porque incluye varias cuantizaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para Q8_0 (RTX 3060, RTX 4060, RTX 4090); en el extremo profesional, A100/H100 no son necesarias y solo aportarian throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida. Tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (llama-server) en version b11960 / v0.8.0 o superior, con el endpoint `/v1/systemone`; API alojada de Liquid AI (console.liquid.ai); playground para pruebas. No hay informacion sobre soporte en vLLM, TGI u Ollama, y el endpoint no estandar sugiere que las plataformas genericas de serving no lo cubren directamente.
- Latencia y throughput: no disponibles como cifras publicadas. Por diseno, al resolver en un unico pase forward sin decodificacion, la latencia deberia ser muy inferior a la de un LLM generativo del mismo tamano, pero no se aportan numeros.
- Nota de configuracion: el ejemplo oficial usa `-b 8192 -ub 8192`, ya que cada pregunta se lee en un solo batch y estos parametros deben cubrir el estado y los medios; una imagen consume como maximo la mitad del presupuesto de `-ub`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| d1-2B-GGUF | 1,73B | No disponible (ejemplo con 8192 tokens de batch) | Decision multimodal calibrada en un pase | lfm1.0 | GGUF |
| LiquidAI/LFM3-VL-2B | 2B (aproximado, no confirmado en la informacion disponible) | No disponible | Vision-lenguaje generativo | No disponible | No disponible |
| LiquidAI/d1-2B | 1,73B (mismo modelo base) | No disponible | Decision multimodal calibrada en un pase | lfm1.0 | Safetensors (original) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de otros modelos de decision multimodales comparables en la informacion proporcionada, por lo que la comparacion se limita a la familia Liquid AI.

## Limitaciones y advertencias

- El modelo no genera texto: no sirve para tareas de generacion, resumen o conversacion abierta; solo responde a preguntas estructuradas.
- En llama.cpp no estan soportadas aun la eleccion multiple (`"multiple": true`), la extraccion, las estimaciones ni las cajas (boxes), lo que limita el rango de tareas disponibles respecto a la version original.
- El endpoint `/v1/systemone` no es la API estandar de chat completions, por lo que requiere adaptar clientes y pipelines; no se garantiza compatibilidad con herramientas de serving genericas.
- La entrada de video exige `ffmpeg` en el `PATH` del sistema.
- La configuracion de `-b`/`-ub` debe dimensionarse al estado y a los medios; un valor insuficiente reduce el presupuesto por imagen (maximo 4096 tokens) o trunca el estado.
- Aunque el modelo se presenta como calibrado, no se publican curvas de calibracion ni evaluaciones por dominio; conviene validar la fiabilidad de las puntuaciones (`score`) en el dominio propio antes de producción.
- Riesgo de respuestas equivocadas con alta confianza en entradas fuera de distribucion, especialmente en imagenes o videos atipicos.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento; los sesgos del modelo base LFM3-VL-2B se heredan sin cuantificar.
- La calidad por idioma no esta documentada: se declaran 17 idiomas, pero no hay evaluaciones por lengua (incluido el espanol).
- Licencia `lfm1.0` (etiquetada como `other`): es imprescindible revisar los terminos del fichero LICENSE antes de un uso comercial.
- El repo GGUF ocupa 10,8 GB, por lo que la descarga completa incluye varias cuantizaciones aunque solo se use una.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/d1-2B-GGUF
- Modelo original (safetensors): https://huggingface.co/LiquidAI/d1-2B
- Modelo base vision-lenguaje: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de presentacion de d1: https://www.liquid.ai/blog/open-d1
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- Pagina de modelos de Liquid AI: https://www.liquid.ai/models
- Sitio corporativo: https://www.liquid.ai/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b11960: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Release de llama.cpp v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- Perfil de Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- Wikipedia (Liquid AI): https://en.wikipedia.org/wiki/Liquid_AI
