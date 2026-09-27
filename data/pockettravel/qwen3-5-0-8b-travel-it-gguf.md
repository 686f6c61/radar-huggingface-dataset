# pockettravel/qwen3.5-0.8b-travel-it-GGUF

## Resumen

qwen3.5-0.8b-travel-it-GGUF es un ajuste fino (LoRA fusionado y cuantizado) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor pockettravel para la aplicación Android de código abierto Pocket Travel. Se trata de un asistente de viaje diseñado para funcionar 100 % en local (offline) en un teléfono, cuya tarea concreta es responder preguntas en italiano usando exclusivamente el CONTEXTO de guía turística que se le inyecta, con un límite de tres frases por respuesta y con rechazo explícito cuando el contexto no contiene la información solicitada.

El modelo resuelve un problema acotado de generación aumentada por recuperación (RAG) en el borde: la aplicación busca en la guía Wikivoyage descargada (índice SQLite FTS), inserta una a tres secciones en el prompt y formula la pregunta. El modelo no está pensado como chatbot de propósito general ni como fuente de conocimiento: sin contexto útil debe negarse a responder. Con 752.393.024 parámetros (aproximadamente 0,75 B, comercializado como 0,8 B) y un único archivo GGUF Q4_K_M de 505 MiB, es lo bastante pequeño para caber en dispositivos móviles con unos 4 GB de RAM.

Su relevancia actual reside en la combinación de tres factores: un tamaño que permite inferencia en CPU de teléfono, una cuantización Q4_K_M calibrada con importance matrix que reduce la pérdida de calidad, y un entrenamiento orientado a la fiabilidad del rechazo (evitar alucinaciones cuando falta contexto), un comportamiento crítico en asistentes de viaje donde la información errónea tiene consecuencias reales. La licencia de los pesos es CC BY-SA 4.0, derivada de la licencia del material de entrenamiento (Wikivoyage y Wikipedia en italiano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B); no disponible el detalle interno especifico |
| Parametros totales | 752.393.024 (aprox. 0,75 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible el maximo del modelo base; la aplicacion y el ejemplo oficial usan 8192 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M con importance matrix (unico archivo publicado) |
| Idiomas soportados | Italiano (respuesta) e ingles (entrada); entrenado para responder siempre en italiano |
| Licencia | CC BY-SA 4.0 para los pesos; modelo base Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); sin proyector de vision (mmproj) |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only Qwen3.5-0.8B (un modelo de razonamiento o "thinking model" de Qwen) y se adapta mediante LoRA de 16 bits entrenado con Unsloth, fusionado posteriormente en los pesos base. El entrenamiento duro 2 epocas con la funcion de perdida aplicada unicamente a los tokens de respuesta (loss on answer tokens only), lo que concentra el aprendizaje en el formato y el estilo de salida en lugar de en la modelizacion del prompt.

El conjunto de datos esta compuesto por 7.317 pares sinteticos de pregunta y respuesta construidos a partir de Wikivoyage y Wikipedia en italiano (articulos de pais sobre cocina, cultura, telecomunicaciones y medios), con aproximadamente una cuarta parte de ejemplos de rechazo. Los contextos imitan la forma que genera la aplicacion: una a tres secciones, con secciones distractoras y hasta 2000 caracteres. Algunas preguntas estan en ingles, aunque el objetivo de respuesta es siempre el italiano. Una innovacion operativa destacable es la desactivacion del modo de razonamiento durante el entrenamiento (enable_thinking=False, con bloque `<think></think>` vacio en el prompt), de modo que el modelo debe ejecutarse tambien con thinking desactivado para reproducir el comportamiento aprendido. La cuantizacion se realizo con `llama-quantize` en Q4_K_M, con una matriz de importancia calibrada sobre 400 prompts de entrenamiento.

## Capacidades

- Generacion de texto extractiva en italiano: responde en un maximo de tres frases usando solo el CONTEXTO proporcionado.
- RAG cerrado: formatea respuestas ancladas al texto de guia inyectado, sin recurrir a conocimiento parametrico.
- Rechazo explicito: cuando el contexto no contiene la respuesta, lo declara explicitamente en lugar de inventar.
- Filtrado de preguntas fuera de tema: rechaza consultas ajenas al dominio de viaje segun el entrenamiento.
- Manejo de preguntas parafraseadas y de contextos con secciones distractoras.
- Entrada multilingue parcial: acepta preguntas en italiano e ingles, aunque responde siempre en italiano.
- Generacion de texto conversacional de un solo turno (pipeline text-generation); no hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso en agentes.
- Capacidad de vision del modelo base no disponible: el GGUF se convirtio sin proyector de vision, por lo que es exclusivamente texto.

## Casos de uso

- Asistente de viaje offline en movil: integrado en la app Pocket Travel, responde a preguntas del usuario sobre la guia descargada de una region sin conexion a internet, con latencia aceptable en CPU de telefono.
- RAG sobre guias Wikivoyage: la app indexa las secciones con SQLite FTS, recupera una a tres secciones relevantes y el modelo compone la respuesta anclada a ese texto.
- Consultas de cultura, cocina y costumbres: al haber sido entrenado con articulos de pais de Wikipedia y Wikivoyage, cubre preguntas sobre gastronomia, cultura y comunicaciones de un destino.
- Reduccion de alucinaciones en asistencia turistica: la alta tasa de rechazo medida permite desplegarlo en escenarios donde una respuesta inventada sobre precios, horarios o requisitos de entrada seria perjudicial.
- Sistema de preguntas y respuestas de un solo turno con contexto controlado: adecuado para cualquier pipeline que requiera respuestas cortas y fieles a un fragmento de documento, no solo viajes.
- Despliegue en hardware muy limitado: al ocupar 505 MiB en Q4_K_M y sugerir 4 GB de RAM, puede ejecutarse en telefonos de gama media, Raspberry Pi o mini-PC sin GPU.
- Prototipado de asistentes de dominio cerrado: sirve como plantilla de ajuste fino por LoRA sobre un modelo pequeno para tareas de rechazo y respuesta extractiva.
- Filtro de preguntas fuera de alcance: la capacidad de rechazar consultas fuera de tema puede reutilizarse como capa de control en asistentes especializados.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de prueba retenido de 361 preguntas escritas a mano sobre 11 regiones nunca vistas en entrenamiento, formuladas fuera de las plantillas de entrenamiento. Metricas de rechazo (mayor es mejor en negativos, menor es mejor en positivos), evaluado en GGUF con llama.cpp:

| Metrica | Este modelo | Modelo base (Unsloth UD-Q4_K_XL) |
|---|---|---|
| Rechaza cuando el contexto no tiene informacion util | 100 % | 23 % |
| Rechaza preguntas fuera de tema | 100 % | 6 % |
| Rechaza preguntas parafraseadas cuyo tema falta en el contexto | 96 % | 15 % |
| Rechaza incorrectamente preguntas parafraseadas respondibles | 3 % | 5 % |

Se considera rechazo cualquier respuesta reconocible del tipo "el contexto no lo dice" en los primeros 200 caracteres. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para los pesos en Q4_K_M; con overhead de contexto (8192 tokens) el consumo practico se situa en torno a 1-1,5 GB, aunque no se especifica oficialmente.
- RAM de dispositivo sugerida: 4 GB, segun la propia model card.
- GPU recomendadas: no disponibles; el modelo esta orientado a inferencia en CPU. Puede ejecutarse en cualquier GPU con suficiente memoria (por ejemplo, tarjetas consumer con 2 GB o mas), pero no se documentan recomendaciones especificas.
- Cabe en GPU consumer: si, con holgura; incluso en iGPU y en CPU de movil.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por compatibilidad GGUF tambien Ollama. vLLM y TGI no estan documentados para este archivo.
- Configuracion de referencia: `llama-server -m qwen3.5-0.8b-travel-it-Q4_K_M.gguf -c 8192 --chat-template-kwargs '{"enable_thinking": false}'`.
- Latencia y throughput: no disponibles. Al ser un modelo de 0,75 B en CPU movil, el rendimiento dependera del dispositivo; no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo sin contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-travel-it-GGUF (este) | 0,75 B | 8192 (config. de app) | 100 % | CC BY-SA 4.0 | GGUF, HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | 23 % | Apache-2.0 | Pesos originales, HuggingFace |
| Otros ajustes finos de viaje/RAG de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa relevante es con su modelo base: el ajuste incrementa la tasa de rechazo correcto del 23 % al 100 % en contextos sin informacion util, a costa de un ligero aumento de rechazos incorrectos (3 % frente a 5 % del base). No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria para ampliar la tabla.

## Limitaciones y advertencias

- La calidad y vigencia de las respuestas dependen exclusivamente del texto de guia presente en el contexto; precios, horarios, requisitos de entrada y seguridad deben verificarse con fuentes oficiales antes de viajar.
- Entrenado para responder en italiano: las preguntas en ingles reciben respuesta en italiano.
- Puede reproducir frases de las guias de origen de forma literal, lo que condiciona la licencia de los pesos (CC BY-SA 4.0).
- Riesgo de alucinacion reducido pero no nulo: el modelo esta optimizado para negarse cuando falta contexto, pero no se garantiza el 100 % en todos los dominios; ademas, un 3 % de rechazos incorrectos implica que en ocasiones se negara a responder preguntas respondibles.
- No es un chatbot de proposito general ni una fuente de conocimiento autonomo: sin contexto debe negarse, por lo que su uso fuera del patron RAG produce resultados deficientes.
- Modo de razonamiento desactivado en entrenamiento: ejecutarlo con thinking activado puede degradar el comportamiento aprendido.
- Sin soporte de vision en este GGUF (no incluye proyector mmproj), pese a que el modelo base puede procesar imagenes.
- Sin evidencia de soporte de tool calling, function calling ni razonamiento multi-paso; no apto para agentes.
- Licencia CC BY-SA 4.0 en los pesos (copyleft) frente al Apache-2.0 del modelo base: el uso comercial esta permitido, pero impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas; conviene revisar `ATTRIBUTION.tsv` y las condiciones antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se incluye contenido de Viaggiare Sicuri (Farnesina), por lo que no debe considerarse asesoramiento oficial de seguridad en viajes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pockettravel/qwen3.5-0.8b-travel-it-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de la aplicacion Pocket Travel: https://github.com/miracle091/pocket-travel
