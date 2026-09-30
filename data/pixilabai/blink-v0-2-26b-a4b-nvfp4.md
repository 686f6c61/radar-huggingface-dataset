# PixilabAI/Blink-v0.2-26B-A4B-NVFP4

## Resumen

Blink v0.2-26B-A4B-NVFP4 es un modelo de decisión calibrado desarrollado por PixilabAI y construido sobre el modelo base google/gemma-4-26B-A4B-it. A diferencia de un LLM generativo convencional, Blink recibe un estado, una pregunta y una lista de opciones, y devuelve una probabilidad para cada opción en un único pase hacia delante y generando un solo token. El resultado es la softmax sobre las letras de las opciones en la primera posición generada. Está diseñado para sustituir llamadas a LLM grandes cuyo texto hay que parsear después, en tareas como enrutamiento, moderación, etiquetado, gating, deduplicación y comprobaciones de sí/no.

El modelo conserva la arquitectura Mixture-of-Experts del Gemma 4 26B-A4B: 26.000 millones de parámetros totales y 4.000 millones activos por token. Se distribuye cuantizado en NVFP4 mediante NVIDIA ModelOpt, con 17,5 GB en disco (el repositorio de HuggingFace declara 10,0 GB, dato que no coincide con la cifra de la model card), y una ventana de contexto de 32.768 tokens. Según el autor, se sirve en una única GPU RTX PRO 5000 manteniendo los 32k de contexto.

Su relevancia actual reside en dos factores. Primero, la calibración: a la temperatura recomendada de 1,9, su confianza coincide con su precisión (0,733 frente a 0,731, con un error de calibración de 0,025 sobre 216.942 decisiones evaluadas), lo que permite usar umbrales de probabilidad en producción. Segundo, su posición en el Decision Index 0.2.1: 55,97 puntos, quinto entre las entradas públicas del tablero y a 1,5 puntos del mejor modelo de pesos abiertos listado, con una mejora de 1,07 puntos respecto a Blink v0.1. El modelo se publica bajo licencia Apache 2.0 y solo declara inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Gemma 4 26B-A4B |
| Parametros totales | 26B |
| Parametros activos | 4B (variante A4B) |
| Longitud de contexto | 32.768 tokens (max-model-len 32768) |
| Tipos de cuantizacion | NVFP4 (formato ModelOpt / modelopt_fp4); kv-cache en FP8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4) |
| Tamano en disco | 17,5 GB segun la model card; 10,0 GB declarados en el repositorio de HuggingFace |
| Protocolo de salida | surogate decisions v1 |
| Temperatura recomendada | 1,9 (decision_config.json: recommended_decision_temperature) |
| Fecha de publicacion | 30 de septiembre de 2026 (dato del repositorio) |
| Modelo base | google/gemma-4-26B-A4B-it |

## Arquitectura y entrenamiento

Blink v0.2 es un ajuste sobre Gemma 4 26B-A4B-it, un modelo Mixture-of-Experts que la documentacion de Google describe como la opcion de gama alta optimizada para latencia dentro de la familia Gemma 4, con mucho mejor throughput que un modelo denso de tamano total similar. El modelo base forma parte de una familia de cuatro variantes (E2B, E4B, 26B-A4B y 31B); la 26B-A4B es la variante MoE y la 31B la densa. Blink conserva ese esqueleto MoE con 4B de parametros activos y anade una cabeza de decision que produce la distribucion de probabilidad sobre las letras de las opciones.

El detalle del entrenamiento no esta disponible en la informacion proporcionada: no se especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. Lo que si documenta el autor es el comportamiento en inferencia: el modelo habla el protocolo surogate decisions v1, admite una pregunta por prompt, exige el modo "thinking" desactivado (con thinking activado, un tercio de las respuestas no cierran el razonamiento y el resto no mejora) y devuelve la respuesta como la softmax sobre las letras en la primera posicion generada. La temperatura no altera la opcion ganadora, solo la seguridad declarada, de modo que es un parametro relevante para umbrales (por ejemplo P >= 0,8) y no para el top-1. v0.2 requiere una temperatura mas alta que v0.1 (1,9 frente a 0,95): por debajo de 1,7 el modelo se vuelve sobreconfiado. El ajuste se distribuye exclusivamente en NVFP4, un formato de cuantizacion de 4 bits de NVIDIA orientado a aceleracion en hardware Blackwell.

## Capacidades

- Decision con probabilidades calibradas: devuelve una probabilidad por opcion en un solo pase y un solo token generado, en lugar de texto libre que haya que parsear.
- Clasificacion multietiqueta y enrutamiento: hasta 26 opciones con letras A-Z; con mas de 26 opciones admite codigos de dos letras (AA, AB, ...) cambiando "option letter" por "option code" en el prompt.
- Preguntas de si/no: el autor indica colocar la opcion "no" primero (A) y "yes" despues (B); sin descripciones, enviar `No` y `Yes` (`noul_default_criteria`).
- Tool calling y seleccion de herramientas: BFCL tool selection 93,5 en v0.2 (88,1 en v0.1), por delante de Rune v3 segun el autor.
- Razonamiento de tipo system-one: decisiones inmediatas de un unico paso, sin cadena de pensamiento; el modo thinking debe permanecer desactivado.
- Inferencia de lenguaje natural (NLI): ANLI 58,5 (v0.1: 44,9) y ContractNLI 61,1 (v0.1: 52,4).
- Recuperacion y verificacion factual: HoVer 60,7 (v0.1: 53,7) y bloque Retrieval con 63,0 en el Decision Index.
- Capacidad multilingue: no disponible; el modelo solo declara ingles.
- Vision, audio y generacion de texto largo: no disponibles en esta variante; el pipeline declarado es text-generation.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como estado JSON y una pregunta cerrada ("que equipo debe gestionarlo") con opciones (facturacion, soporte tecnico, ventas, otros) y devuelve la probabilidad de cada una. Su calibracion permite derivar a un humano cuando la confianza es baja (por ejemplo, P < 0,8) en lugar de aceptar el top-1 a ciegas.
- Moderacion de contenido: comprobaciones de si/no sobre texto de usuario con la opcion "no" en primera posicion, usando la probabilidad como umbral configurable; la calibracion a temperatura 1,9 hace que los umbrales sean comparables entre despliegues.
- Gating en pipelines RAG: decidir si una consulta necesita recuperacion externa o puede responderse con el contexto disponible, una llamada de un token que sustituye a un LLM generativo y reduce coste por peticion.
- Deduplicacion y etiquetado masivo: agrupar o etiquetar registros (documentos, productos, incidencias) eligiendo entre categorias predefinidas, con la distribucion de probabilidad como senal de ambiguedad para revisar casos limite.
- Seleccion de herramientas en agentes: BFCL 93,5 lo situa como componente de decision para elegir que funcion invocar en un flujo multi-paso, dejando la ejecucion al orquestador.
- Verificacion de contratos y documentos legales: ContractNLI 61,1 permite usarlo como clasificador de clausulas y de implicacion textual, devolviendo una probabilidad por hipotesis en lugar de una respuesta redactada.
- Comprobaciones de implicacion en control de calidad: ANLI 58,5 para validar si una afirmacion se sigue de una premisa, util en verificacion de resumenes y de respuestas generadas por otros modelos.
- Filtrado previo en sistemas de agentes: decidir si una llamada de herramienta es necesaria en este turno (When2Call 60,4), reduciendo el numero de invocaciones costosas.

## Benchmarks y rendimiento

Decision Index 0.2.1 (skill corregida por azar x 100). Los numeros de Blink son ejecuciones propias del autor sobre la misma suite, 150.759 peticiones por modelo, todas respondidas. El mismo harness reproduce la entrada Decider 35B-A3B NVFP4 del tablero en 46,93 frente al 47,11 publicado.

| Modelo | Index | Knowledge | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|
| Jev (hosted) | 57,91 | 51,4 | 62,0 | 55,4 | 75,1 | 37,7 |
| Surogate Rune 26B-A4B v3 | 57,44 | 43,4 | 63,1 | 63,5 | 71,2 | 41,9 |
| Decider chat · Gemma-4-31B | 57,33 | 44,3 | 60,4 | 63,1 | 75,6 | 38,3 |
| AutoJev-27B | 56,40 | 40,9 | 63,5 | 54,9 | 79,4 | 39,4 |
| Blink v0.2 · 26B-A4B NVFP4 | 55,97 | 42,3 | 60,4 | 63,0 | 69,3 | 41,4 |
| simple-jev · Qwen3.8-27B | 55,74 | 36,6 | 62,1 | 63,3 | 76,2 | 36,5 |
| Blink v0.1 · 26B-A4B NVFP4 | 54,90 | 40,9 | 60,0 | 62,5 | 66,3 | 42,0 |
| frontier-infra Jebadiah 27B | 54,67 | 38,8 | 60,7 | 53,9 | 78,1 | 38,7 |
| Eikos-27B-FP8 | 53,13 | 39,9 | 54,3 | 55,9 | 74,4 | 39,8 |
| reflex Qwen3.8-27B-FP8 | 52,16 | 35,1 | 54,2 | 57,8 | 74,1 | 39,7 |
| Decider chat · Qwen3.6-27B | 51,35 | 37,0 | 57,1 | 52,2 | 71,4 | 35,1 |
| Decider 35B-A3B NVFP4 | 47,11 | 31,8 | 55,5 | 54,7 | 56,5 | 32,6 |

Benchmarks individuales reportados por el autor (v0.2 frente a v0.1):

| Benchmark | Blink v0.2 | Blink v0.1 |
|---|---|---|
| BFCL (tool selection) | 93,5 | 88,1 |
| ANLI | 58,5 | 44,9 |
| ContractNLI | 61,1 | 52,4 |
| GPQA Diamond | 29,9 | 21,8 |
| HoVer | 60,7 | 53,7 |
| SimpleBench | 16,0 | 4,0 |
| When2Call | 60,4 | 53,7 |
| POP909 | 65,0 | 55,6 |
| iSarcasmEval | 41,8 | 59,4 |
| New Yorker captions | 66,4 | 72,3 |
| Habermas Machine | 17,4 | 26,1 |

Metricas de calibracion declaradas: confianza 0,733 frente a precision 0,731, con error de calibracion de 0,025 sobre 216.942 decisiones puntuadas.

## Requisitos de hardware

- VRAM estimada: 17,5 GB para los pesos NVFP4 segun el autor, mas el espacio de cache KV (configurado en FP8) y los buffers de servido; el despliegue de referencia cabe en una GPU de 32 GB con 32k de contexto.
- GPU de referencia: una sola RTX PRO 5000, con 32k de contexto, segun la model card.
- Compatibilidad con consumer GPU: no disponible. NVFP4 es un formato de 4 bits de NVIDIA optimizado para hardware Blackwell; el autor no documenta comportamiento en GPUs de generaciones anteriores.
- Opciones de despliegue: vLLM con `--quantization modelopt_fp4 --kv-cache-dtype fp8 --enable-prefix-caching --chat-template-content-format string`; llamada compatible con la API de OpenAI (`client.chat.completions.create` con `max_tokens=1`, `temperature=0`, `logprobs=True`, `top_logprobs=20`). El autor indica que cualquier servidor que implemente el protocolo surogate decisions v1 lo lee sin codigo adicional.
- Latencia y throughput: no disponibles como cifras. La model card solo afirma el objetivo de diseno ("a fast, calibrated decision model") y que la decision se resuelve en un pase y un token generado.
- Alternativas de servido (llama.cpp, Ollama, TGI): no disponibles; la model card solo describe vLLM y el protocolo propio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.2.1 | Tools | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Blink v0.2 26B-A4B NVFP4 | 26B totales, 4B activos (MoE) | 32.768 | 55,97 | 69,3 | Apache 2.0 | Pesos en HuggingFace |
| Blink v0.1 26B-A4B NVFP4 | 26B totales, 4B activos (MoE) | no disponible | 54,90 | 66,3 | Apache 2.0 | Pesos en HuggingFace |
| Surogate Rune 26B-A4B v3 | 26B totales, 4B activos (MoE) | no disponible | 57,44 | 71,2 | no disponible | Pesos publicos |
| Decider chat · Gemma-4-31B | 31B (denso, por el nombre) | no disponible | 57,33 | 75,6 | no disponible | Pesos publicos |
| Decider 35B-A3B NVFP4 | 35B totales, 3B activos (MoE) | no disponible | 47,11 | 56,5 | no disponible | Pesos publicos |

Blink v0.2 destaca en Retrieval (63,0), donde empata practicamente con Surogate Rune v3 (63,5) y Decider chat Gemma-4-31B (63,1), y pierde terreno en Tools (69,3) frente al rango 71-79 del resto de la tabla. La comparacion directa mas informativa es contra Blink v0.1: misma huella (26B-A4B, 17,5 GB, 4B activos, 32k), con subidas notables en ANLI, ContractNLI, GPQA Diamond y BFCL, pero retrocesos en tareas de gusto y matiz (iSarcasmEval, New Yorker captions, Habermas Machine).

## Limitaciones y advertencias

- Humor y sarcasmo: retroceso marcado respecto a v0.1. iSarcasmEval cae a 41,8 (desde 59,4), New Yorker captions a 66,4 (desde 72,3) y Habermas Machine a 17,4 (desde 26,1). El propio autor senala que para juicios dependientes del gusto v0.1 sigue siendo mas fino.
- Herramientas: 69,3 en el bloque Tools, por detras del rango 71-79 de los modelos del entorno; When2Call 60,4 frente al 68,0 de Rune v3.
- Razonamiento de codigo y NLI de formato largo: la model card menciona esta limitacion, pero el texto proporcionado aparece truncado, por lo que no se dispone del detalle completo.
- Modo thinking: debe permanecer desactivado. Con thinking activado, un tercio de las respuestas no cierra el razonamiento y el resto no mejora.
- Idioma: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas, lo que limita su uso directo en productos en espanol.
- Alcance de la tarea: es un modelo de decision, no un generador de texto. No se debe esperar redaccion, resumen ni respuesta conversacional util; su salida es una distribucion sobre opciones.
- Tamano de la lista de opciones: hasta 26 opciones con letras; con mas opciones hay que cambiar el prompt a codigos de dos letras, lo que exige adaptar la plantilla.
- Riesgo de alucinacion: no se puede evaluar como en un LLM generativo, pero si existe riesgo de sobreconfianza fuera de distribucion; la temperatura es critica (por debajo de 1,7 el modelo se vuelve sobreconfiado, y v0.2 necesita 1,9 frente a 0,95 de v0.1).
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de google/gemma-4-26B-A4B-it conviene verificar las condiciones de uso del modelo base de Google antes de desplegarlo en produccion.
- Formato de pesos: la distribucion es exclusivamente NVFP4, lo que ata el despliegue al ecosistema ModelOpt/vLLM y a hardware compatible; no se ofrecen pesos en BF16, FP8 ni GGUF en la informacion disponible.
- Datos de adopcion: el repositorio registra 0 descargas y 1 like, por lo que no existe evidencia de uso en produccion por terceros.
- Metodologia de benchmarks: todos los numeros de Blink son ejecuciones propias del autor sobre su propia suite (Decision Index 0.2.1) y no una evaluacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PixilabAI/Blink-v0.2-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 26B-A4B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/gemma4-26b-a4b/
- Tutorial de Gemma 4 en Jetson: https://www.jetson-ai-lab.com/tutorials/gemma4-on-jetson/
- Variante comunitaria derivada: https://huggingface.co/AEON-7/Gemma-4-26B-A4B-it-Uncensored-NVFP4
- Hugging Face (portal general): https://huggingface.co/
