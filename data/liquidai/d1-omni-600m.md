# LiquidAI/d1-omni-600M

## Resumen

d1-omni-600M es un modelo de decisión multimodal de 587 millones de parámetros desarrollado por Liquid AI y publicado el 7 de octubre de 2026. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente acompañado de imágenes o un clip de voz) junto con un conjunto de preguntas con nombre, y devuelve respuestas tipadas leyéndolas directamente de la distribución del modelo sobre las opciones. No genera tokens de salida ni requiere parseo posterior.

Está construido sobre LFM2.5-Encoder-350M como tronco compartido y añade una cabeza de decisión, una torre de visión SigLIP2 procedente de LFM2.5-VL-450M y un codificador de audio FastConformer de 17 capas. Los 587M de parámetros se reparten en 381M de tronco y cabeza de decisión, 94M de codificador visual y 112M de codificador de audio, de modo que las tres modalidades comparten los mismos pesos de tronco en una única pasada forward.

Su relevancia es doble: por un lado ocupa el segmento de modelos de decisión en el borde (*edge*), con un tamaño que permite ejecución en hardware embebido o GPU de consumo; por otro, cubre texto, imagen y audio con una misma arquitectura, algo poco habitual en modelos de clasificación de este tamaño. La ventana de contexto es de 16.384 tokens compartidos entre texto, imagen y audio, aunque con imágenes el texto del estado y la pregunta se recorta a 896 tokens tal y como se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision sobre tronco encoder derivado de LFM2.5-Encoder-350M, con cabeza de decision, torre de vision SigLIP2 (94M) y codificador de audio FastConformer de 17 capas (112M); los detalles internos del tronco no estan disponibles |
| Parametros totales | 587.161.089 (381M tronco y cabeza de decision + 94M vision + 112M audio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (posiciones de texto, imagen y audio conjuntamente); con imagenes, el estado y el texto de la pregunta se recortan a 896 tokens, tal como se entreno |
| Tipos de cuantizacion | No disponibles en detalle; existe una variante GGUF publicada por el autor (d1-omni-600M-GGUF) |
| Idiomas soportados | 15 idiomas: en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh (audio: solo ingles) |
| Licencia | lfm1.0 (identificador `other`, con `license_name: lfm1.0` y enlace al fichero LICENSE del repositorio) |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`); variante GGUF publicada aparte |
| Tamano de vocabulario | 65.536 |
| Tamano del repositorio | 4,7 GB |
| Ventana de audio | Hasta 30 s de habla en un unico forward pass (16 kHz mono en el ejemplo de uso) |
| Libreria minima | transformers >= 5.15 |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-Encoder-350M, un encoder de proposito general de 350M, sobre el que se realiza un post-entrenamiento especifico para decisiones de una sola pasada. La innovacion central es que cada respuesta se obtiene leyendo la distribucion del modelo sobre las opciones definidas por el usuario, lo que implica cero tokens de salida y elimina tanto la generacion autoregresiva como el parseo de texto libre. Todas las modalidades comparten los mismos pesos de tronco: la imagen se codifica con una torre SigLIP2 y el audio con un FastConformer, y sus representaciones se proyectan al espacio del tronco.

La interfaz expone dos metodos: `system_one(state, questions, images=None, audio=None)`, que responde varias preguntas con nombre sobre un mismo estado —los medios se codifican una sola vez para todas las preguntas—, y `system_one_batch([...])`, que agrupa multiples peticiones en una llamada. Los tipos de pregunta vistos en la documentacion son `noul` (respuesta booleana), `choice` (seleccion entre criterios con nombre) y `score` (valoracion sobre una escala de criterios ordenados).

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal, aunque las etiquetas del modelo incluyen `liquid`, `calibration`, `system-one` y `decision`.

## Capacidades

- Decision tipada en una sola pasada: respuestas booleanas (`noul`), eleccion entre opciones con nombre (`choice`) y puntuaciones ordinales (`score`), sin generar tokens de salida.
- Vision-lenguaje: acepta texto e imagenes en el mismo forward pass, con mosaico (*tiling*) para fotogramas grandes y varias imagenes por estado.
- Audio-lenguaje: acepta texto y hasta 30 s de habla en una sola pasada; entrenado con peticiones entre un hablante en ingles y un asistente, e incluye tareas de tipo de enunciado, tema y que quiere el hablante.
- Multilingue en texto: 15 idiomas (en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh).
- Preguntas multiples sobre un mismo estado, con los medios codificados una sola vez para todas ellas.
- Procesamiento por lotes mediante `system_one_batch`.
- Usos declarados por el autor: enrutado y triaje, moderacion, clasificacion de intencion y tema, enrutado de comandos de voz, comprobaciones de extraccion, reranking, guardrails de agentes e inspeccion visual.
- No soporta tool calling ni function calling, no es un modelo de chat y no escribe texto.
- No dispone de modo de razonamiento (*thinking*) ni de generacion de codigo o matematicas.

## Casos de uso

- Triaje y enrutado de tickets de soporte: con un unico estado de texto se pueden responder simultaneamente preguntas como "¿pide un reembolso?" (tipo `noul`), "¿que equipo debe gestionarlo?" (`choice` entre facturacion, tecnico y fraude) y "¿como de urgente es?" (`score`), tal y como aparece en el ejemplo oficial de la model card.
- Moderacion de contenido multimodal: combinando texto e imagen, el modelo puede decidir en una sola pasada si una publicacion infringe una politica concreta, sin coste de generacion y con latencia de milisegundos.
- Enrutado de comandos de voz: con hasta 30 s de audio, clasifica la intencion del hablante para dirigir la peticion al flujo adecuado, util en asistentes embebidos donde no cabe un modelo generativo.
- Guardrails de agentes: antes de ejecutar una accion, el modelo decide si cumple una politica predefinida o si debe bloquearse, funcionando como capa de control de bajo coste sobre un agente basado en un LLM mayor.
- Reranking en pipelines RAG: dada una consulta y un candidato, responder si el documento es relevante permite reordenar resultados con una sola pasada y sin generacion.
- Inspeccion visual en linea de produccion: como fotografia es el estado completo, puede decidir cuestiones de control de calidad (por ejemplo, "¿cuantas piezas hay?" con opciones `one`/`two`/`more`), segun el ejemplo de la model card.
- Validacion de extraccion de formularios o facturas: comprobaciones tipo "¿el importe total coincide con la suma de lineas?" sobre el JSON extraido, devolviendo una respuesta booleana directa.
- Codificacion de respuestas abiertas en encuestas: convertir texto libre en una categoria con nombre y una puntuacion ordinal sin necesidad de un modelo generativo ni de post-procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de d1-omni-600M en la informacion disponible. Los datos publicos encontrados corresponden al otro modelo de la familia, d1-3B, o a la familia d1 en conjunto:

| Modelo | Benchmark | Resultado | Nota |
|---|---|---|---|
| d1-3B | Decision Index 0.2.1 | 48,57 | Mejor modelo de decision por debajo de 10B segun la publicacion de Liquid AI |
| Decider 35B-A3B | Decision Index 0.2.1 | 47,11 | Superado por d1-3B |
| d1-omni-600M | Decision Index 0.2.1 | No disponible | No publicado en la informacion disponible |

Segun el blog de Liquid AI, d1 (familia, sin especificar variante para cada tarea) iguala o supera a GPT-6.1 Sol en 4 de 6 tareas reales. El dato de latencia de 16 ms citado en la prensa corresponde a d1-3B ejecutandose en una Jetson AGX Thor, no a d1-omni-600M.

## Requisitos de hardware

- VRAM estimada para los 587M de parametros, sin contar overhead de activaciones: aproximadamente 1,2 GB en fp16/bf16, 0,6 GB en int8 y 0,35 GB en int4. El repositorio ocupa 4,7 GB, lo que sugiere que los pesos publicados estan en mayor precision que fp16.
- El ejemplo oficial usa fp16 en CUDA, fp32 en CPU y soporte de MPS (Apple Silicon), por lo que el modelo funciona en CPU y en Mac sin GPU discreta.
- Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.), en iGPU y en hardware de borde tipo Jetson.
- El autor lo posiciona explicitamente para *edge*; la cifra de latencia publicada para la familia (16 ms en Jetson AGX Thor) corresponde a d1-3B. Para d1-omni-600M no hay latencia ni throughput publicados en la informacion disponible.
- Opciones de despliegue: transformers >= 5.15 con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `dtype` segun dispositivo. Existe una variante GGUF (LiquidAI/d1-omni-600M-GGUF) que habilita despliegue con llama.cpp u otros runners compatibles con GGUF. No hay confirmacion de soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Dependencias del ejemplo oficial: torch, torchvision, pillow y soundfile.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Decision Index 0.2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d1-omni-600M | 587M | 16.384 tokens | texto, imagen, audio | No disponible | lfm1.0 | Pesos safetensors y GGUF en HuggingFace |
| d1-3B | 3B (nombre comercial; cifra exacta no disponible) | No disponible | Texto e imagen (segun el blog de d1) | 48,57 | No disponible | Pesos abiertos en HuggingFace |
| Decider 35B-A3B | 35B totales con aproximadamente 3B activos, segun la nomenclatura del nombre (no confirmado) | No disponible | No disponible | 47,11 | No disponible | No disponible |
| LFM2.5-VL-450M | 450M (modelo del que procede la torre de vision) | No disponible | Vision-lenguaje generativo | No aplica (no es modelo de decision) | lfm1.0 (no confirmado) | HuggingFace |

La comparacion directa es limitada: d1-omni-600M es el unico de la lista que cubre audio ademas de texto e imagen, y no se han publicado sus resultados en el Decision Index. Frente a los modelos de decision de mayor tamano, su ventaja es el coste de despliegue en el borde, no el rendimiento absoluto.

## Limitaciones y advertencias

- No es un modelo de chat y no escribe texto: solo devuelve opciones tipadas previamente definidas por el usuario. Cualquier tarea que requiera generacion libre queda fuera de su alcance.
- Las capacidades de audio se entrenaron exclusivamente con peticiones entre un hablante en ingles y un asistente. El rendimiento en otros idiomas o en habla espontanea no esta documentado y no deberia asumirse.
- Los clips de audio se cortan a 30 segundos; el material que exceda esa duracion se trunca.
- Con imagenes, el texto del estado y de la pregunta se recorta a 896 tokens, tal como se entreno. Estados de texto largos combinados con imagen pueden perder informacion.
- No hay resultados de benchmarks publicados para este modelo concreto: no se puede verificar su calidad frente a alternativas en tareas reales.
- El tag `calibration` sugiere trabajo de calibracion, pero no se aportan detalles ni metricas de calibracion en la informacion disponible; las puntuaciones devueltas no deberian tratarse como probabilidades calibradas sin validacion propia.
- Riesgo de clasificacion erronea en dominios fuera de la distribucion de entrenamiento. No se documenta el dataset, por lo que no es posible acotar ese riesgo a priori.
- No se documentan sesgos conocidos, pero tampoco se describe la composicion de los datos de entrenamiento, lo que impide auditar sesgos por idioma, genero o etnia.
- La licencia es `lfm1.0`, identificada como `other` en HuggingFace. Los terminos concretos para uso comercial no se detallan en la informacion proporcionada y deben consultarse en el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- Requiere `transformers>=5.15` y cargar el modelo con `trust_remote_code=True`, es decir, se ejecuta codigo remoto incluido en el repositorio.
- Adopcion muy baja en el momento de la ficha (28 descargas, 21 likes), lo que implica escaso soporte de la comunidad y pocos informes independientes de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/d1-omni-600M
- Variante GGUF: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Modelo del que procede la torre de vision: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Blog de Liquid AI sobre open d1: https://www.liquid.ai/blog/open-d1
- Entrada de blog en HuggingFace sobre los modelos de decision open d1: https://huggingface.co/blog/LiquidAI/open-d1
- Blog de presentacion de d1: https://www.liquid.ai/blog/d1-decision-model
- Playground de LFM: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper de referencia (arXiv): https://arxiv.org/abs/2511.23404
- Analisis independiente con benchmarks y latencia: https://www.explainx.ai/blog/liquid-ai-open-d1-3b-omni-600m-open-weight-decision-models-edge-2026
- Cobertura de prensa del lanzamiento: https://www.globai.org/blog/liquid-ai-releases-two-open-decision-models-for-edge
