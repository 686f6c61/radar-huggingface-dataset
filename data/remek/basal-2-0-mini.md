# Remek/basal-2.0-mini

## Resumen

basal-2.0-mini es un modelo de decisiones tipadas desarrollado por Remek (con motor de inferencia en github.com/rkinas/basal), afinado a partir de speakleash/Bielik-1.5B-v3.0-Instruct. No es un modelo generativo conversacional al uso: recibe un *estado* (mensaje, documento, pasajes recuperados, traza de agente, pagina web en JSON) y una pregunta tipada (`choice`, `noul`, `score`, `multi`, `act`, `tool`), y devuelve una probabilidad calibrada para cada respuesta permitida en un solo forward pass, sin generar texto.

Con 1.596.507.648 parametros (1,5B), es el miembro mas rapido de la familia basal-2.0, que incluye tambien basal-2.0 (4,5B) y basal-2.0-max (11B). Se entreno a partir de checkpoints anteriores de basal usando basal-2.0-max como profesor (destilacion). Su relevancia practica esta en el enrutado, la clasificacion con umbral de confianza y las decisiones de agente sin generacion libre, con garantias de calibracion (`max_error`) que permiten derivar casos inciertos a revision humana.

Soporta polaco e ingles, se distribuye con licencia Apache 2.0 y esta disponible en formatos FP8, GGUF (Q8_0 y Q5_K_M) y MLX-8bit ademas de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-1.5B-v3.0-Instruct, familia Llama) |
| Parametros totales | 1.596.507.648 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (Hopper y Blackwell), GGUF Q8_0 y Q5_K_M, MLX-8bit; safetensors en BF16/FP16 |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, FP8, MLX-8bit |

## Arquitectura y entrenamiento

El modelo parte de Bielik-1.5B-v3.0-Instruct, un transformer decoder-only de la familia Llama, y se entrena adicionalmente desde checkpoints previos de basal con basal-2.0-max (11B) como modelo profesor. El objetivo no es la generacion de texto sino la produccion de una distribucion de probabilidad sobre un conjunto de opciones descritas en la peticion, en un unico forward pass. Las clases se definen en la propia solicitud, de modo que un solo modelo cubre multiples tareas sin reentrenamiento.

La innovacion principal es el mecanismo de calibracion: para preguntas de tipo `act` y `tool` se puede fijar `max_error` (por ejemplo 0,05), y el modelo devuelve `defer` cuando la confianza cae por debajo del umbral certificado para ese nivel de error, ademas de calcular la accion de coste esperado minimo a partir de `costs`. La calibracion se ajusto con `option_keys: "hide"` (solo descripciones de opciones); si se muestran las claves, la respuesta se marca como `"calibration": "unvalidated"`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Decision tipada con probabilidad calibrada por opcion: tipos `choice` (eleccion unica), `noul` (si/no), `score` (puntuacion), `multi` (multietiqueta), `act` (accion con costes y `max_error`) y `tool` (seleccion de herramienta sobre definiciones OpenAI o MCP).
- Respuesta restringida al conjunto de opciones proporcionado: nunca devuelve una respuesta fuera de las permitidas.
- Multiples preguntas sobre un mismo estado en una sola peticion, compartiendo el estado entre ellas.
- Enrutado y clasificacion sin reentrenamiento, definiendo las clases en la peticion.
- Preguntas sobre documentos largos y pasajes recuperados (RAG): relevancia, presencia de la respuesta.
- Evaluacion de respuestas (judging) y puntuacion de urgencia o riesgo.
- Decisiones de agente: eleccion de la siguiente accion o de la herramienta (no de sus argumentos).
- Triage con derivacion a humano mediante `defer` y umbral `max_error`.
- Multilingue en polaco e ingles, tanto en el estado como en la pregunta.
- No genera texto ni mantiene conversacion libre.

## Casos de uso

- Enrutado de tickets de soporte: se define un tipo `choice` con los departamentos como criterios y el modelo devuelve la probabilidad de cada uno en un forward pass, lo que permite umbralizar y derivar los casos dudosos sin coste de generacion.
- Verificacion de reglas y politicas: preguntas `noul` del tipo "cumple esta solicitud la politica X" sobre el texto del estado, con probabilidad asociada para auditar decisiones.
- Puntuacion de urgencia y riesgo: preguntas `score` sobre mensajes de cliente o incidencias, integrables en colas de priorizacion.
- Decisiones RAG: comprobar si un pasaje recuperado contiene la respuesta o si es relevante antes de invocar al modelo generativo, reduciendo alucinaciones en el pipeline.
- Seleccion de herramienta en agentes: pregunta `tool` sobre definiciones OpenAI o MCP que devuelve la herramienta elegida con probabilidad, delegando los argumentos a otro componente.
- Triage con derivacion a humano: pregunta `act` con accion `defer`, costes (`wrong`, `defer`) y `max_error: 0.05`, de modo que los casos por debajo del umbral certificado se envian a una persona.
- Evaluacion automatica de respuestas: pregunta `choice` o `score` para juzgar la calidad de una respuesta generada por otro modelo en un pipeline de control de calidad.
- Clasificacion de documentos y paginas web en JSON: lectura del estado estructurado y asignacion a una categoria descrita en la peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 3,3 GB en safetensors; en FP8 o GGUF Q8_0 el peso ronda 1,6-1,8 GB, y en Q5_K_M aproximadamente 1,1-1,2 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: el motor basal requiere GPU NVIDIA; la build cu128 exige driver para CUDA 12.8 o superior. Las variantes FP8 estan pensadas para NVIDIA Hopper y Blackwell (incluye DGX Spark y B300 con build cu130).
- Cabe en GPU de consumo: si, en tarjetas con suficiente VRAM para el peso cuantizado mas el overhead del motor; no se especifican modelos concretos ni minimos en la informacion disponible.
- Opciones de despliegue: motor propio `basal` (servidor `basal-serve` con API compatible con endpoints, endpoint `/v1/systemone`), cliente Python incluido, GGUF para Ollama y llama.cpp, MLX-8bit para Apple Silicon, FP8 para Hopper/Blackwell; etiqueta `text-generation-inference` en Hugging Face.
- Latencia y throughput: no disponibles; el autor lo describe como el modelo mas rapido de la familia, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-mini | 1,5B | no disponible | Decision tipada calibrada, rapido | Apache 2.0 | HF, FP8, GGUF, MLX |
| basal-2.0 (4,5B) | 4,5B | no disponible | Decision tipada, modelo principal con modo thinking experimental | no disponible | HF, FP8, GGUF, MLX |
| basal-2.0-max | 11B | no disponible | Decision tipada, maxima precision | no disponible | HF, FP8, GGUF, MLX |
| Bielik-1.5B-v3.0-Instruct | 1,5B | no disponible | Generacion de texto instructiva | no disponible | HF (modelo base) |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto ni mantiene conversacion: solo elige entre las opciones proporcionadas; no sirve para chat ni redaccion.
- No aporta hechos que no esten en el estado; cualquier conocimiento externo debe incorporarse al estado.
- No debe usarse para decisiones con consecuencias graves para personas sin revision humana.
- La calibracion solo esta validada con `option_keys: "hide"`; si se muestran las claves, la respuesta se marca como `"calibration": "unvalidated"`.
- `max_error` solo funciona en preguntas `act` y `tool`.
- Un coste de error muy alto provoca `defer` por coste esperado antes de aplicar `max_error`; el autor recomienda mantener el coste de una respuesta erronea moderado.
- Idiomas limitados a polaco e ingles.
- No se especifican sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial; no se documentan restricciones adicionales.
- El motor de inferencia requiere GPU NVIDIA con CUDA 12.8 o superior (cu130 en DGX Spark y B300).

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-2.0-mini
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Modelo principal basal-2.0 (4,5B): https://huggingface.co/Remek/basal-2.0-4.5B
- Modelo basal-2.0-max (11B): https://huggingface.co/Remek/basal-2.0-max
- Modelo base Bielik-1.5B-v3.0-Instruct: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentacion de hardware del motor: https://github.com/rkinas/basal/blob/v2.5.0/docs/HARDWARE.md
- Sitio web: https://basal.si5.pl/
