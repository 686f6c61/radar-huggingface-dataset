# ait-hf/certus-jev-like-v0007

## Resumen

Certus v0007 es un modelo de decisión ("System One") publicado por ait-hf, construido como un adaptador LoRA sobre Qwen/Qwen2.5-1.5B-Instruct. No es un modelo generativo: lee un `state` (texto libre o JSON) junto con preguntas tipadas y devuelve distribuciones de probabilidad calibradas sobre un conjunto de respuestas que define quien lo llama, ya sea una elección entre opciones nombradas, una puntuación sobre una rúbrica ordenada o un sí/no. La salida se obtiene aplicando softmax sobre los logits de las letras de las opciones en el turno de asistente, de modo que la respuesta es siempre una de las opciones declaradas y el coste es una única pasada hacia delante, sin decodificación autoregresiva.

El proyecto se inspira explícitamente en los modelos Jev / System One de TypeSafe y su objetivo es cubrir la necesidad de clasificación y enrutamiento de baja latencia y alta calibración en pipelines autoalojados, donde un LLM generativo de 1,5B sería demasiado lento e impredecible en el formato de salida. Para ello distribuye un tronco (trunk) con 61 tareas públicas de entrenamiento y ocho adaptadores de dominio (`reason`, `math`, `language`, `support`, `sentiment`, `safety`, `spam` y `typed`), más un router de cabezas logísticas que selecciona dinámicamente qué adaptador aplicar en cada petición bajo la etiqueta `model: "auto"`.

Es relevante ahora porque el modelo es pequeño (1,5B de parámetros, adaptadores LoRA de rango 8 a 32), cabe en GPUs de consumo antiguas (se midió en una RTX 2080 Ti) y ofrece calibración explícita mediante temperature scaling por tramos de número de opciones. El repositorio ocupa 0,4 GB, se publica bajo licencia Apache 2.0 y solo declara soporte para inglés (en).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptadores LoRA (PEFT) para clasificación; cabezas logísticas de enrutamiento sobre el último estado oculto |
| Parametros totales | 1,5B en el modelo base; los adaptadores LoRA (r=8, 16 o 32) añaden parámetros no cuantificados en la model card. Tamaño del repo: 0,4 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos, dato no confirmado por el autor para este adaptador |
| Tipos de cuantizacion | No se documentan cuantizaciones. El autor ha medido fp16 y señala que no necesita bf16 ni flash-attention (funciona en Turing) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT; el tronco se fusiona con el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct (transformer decoder-only) sobre la que se aplican adaptadores LoRA. El tronco `v0007` es un adaptador de rango 16 entrenado durante 1 época sobre 61 tareas públicas (ag_news, banking77, boolq, clinc150, commonsense_qa, copa, dbpedia, emotion, facts, fits, imdb, jailbreak, massive_intent, mnli, mrpc, openbookqa, paws, qnli, read, rte, sciq, sst2, swag, tweet_emoji, tweet_hate, tweet_irony, tweet_offensive, tweet_sentiment, yahoo, yelp, anli, winogrande, hellaswag, race, scitail, qqp, stsb, toxic, stance_abortion, stance_atheism, stance_feminist, stance_hillary, match, goemo_soft, reason, formality, politeness, strategyqa, vitaminc, ruletaker, proofwriter, folio, logiqa, tracie, temporal_nli, piqa, siqa, clutrr, gsm8k, svamp y aqua, entre otras), alcanzando una precisión de validación media de 0,792. Los adaptadores de dominio se entrenan como hijos del tronco (parent = `v0007`) sobre subconjuntos específicos y con rangos distintos.

La innovación principal está en el modo de servicio y en la calibración. El tronco se fusiona con el modelo base para no añadir coste, mientras que los adaptadores de dominio permanecen sin fusionar y se conmutan por petición. `family_v0007/family.json` define el mapa dominio → adaptador, el umbral de enrutamiento (0,5) y el máximo de adaptadores apilables (dos). Cada adaptador tiene una cabeza logística entrenada sobre el último estado oculto del tronco; `model: "auto"` evalúa el router sobre la petición completa (todas las preguntas con su tipo y opciones, y después el estado), aplica los adaptadores cuyas cabezas superan 0,5 y responde con el tronco si ninguna lo hace. Añadir un adaptador nuevo requiere únicamente una carpeta y un fichero de cabeza, sin reentrenar. La calibración se realiza mediante temperature scaling por tramos de número de opciones, configurado en `config.json` (por ejemplo, temperatura 1,02 para 3–5 opciones); el ECE del tronco en su conjunto de validación es de 0,010 antes del escalado.

## Capacidades

- Clasificación con conjuntos de respuestas cerrados definidos por el llamante: elección entre opciones nombradas, puntuación sobre rúbrica ordenada y decisiones sí/no.
- Salida de distribuciones de probabilidad calibradas en lugar de texto libre, con temperatura de calibración por número de opciones.
- Enrutamiento automático de dominio mediante router de cabezas logísticas y apilamiento de hasta dos adaptadores cuando sus umbrales superan 0,5.
- Clasificación de intención y soporte al cliente: los adaptadores `support` (banking77, clinc150, massive_intent) y `v0007-typed` (workflow, 0,850 de precisión de validación).
- Análisis de sentimiento y emoción: adaptador `sentiment` con 0,776 de precisión de validación sobre sst2, sst5, yelp, tweet_sentiment, emotion, goemo_soft, tweet_irony, imdb, formality, politeness y sarcasm.
- Moderación y seguridad: adaptador `safety` con 0,844 de precisión de validación sobre jailbreak, toxic, tweet_hate y tweet_offensive.
- Detección de spam: adaptador `spam` con 0,990 de precisión de validación.
- Razonamiento lógico y trampas: adaptador `reason` con 0,943 de precisión de validación sobre traps, reason y skills.
- Aritmética y problemas matemáticos de primaria: adaptador `math` sobre math, gsm8k, svamp y aqua, con 0,690 de precisión de validación.
- Identificación de idioma y tareas lingüísticas: adaptador `language` con 1,000 de precisión de validación.
- Manejo de conjuntos con más de 26 opciones mediante una ruta de dos etapas (documentada en `s1/lmscore.py`).
- Acepta tanto texto plano como JSON estructurado como `state`.
- No soporta generación de texto, tool calling ni razonamiento multi-paso con agentes: es un clasificador de una sola pasada.
- Idiomas: únicamente inglés declarado; no se documentan capacidades multilingües.

## Casos de uso

- Enrutamiento de tickets de soporte: con `model: "auto"` y el adaptador `support`, el modelo lee el texto del ticket y devuelve una distribución sobre equipos o categorías (billing, technical, sales), con una pasada de 113–200 ms que permite clasificar en línea dentro del propio servicio de atención.
- Triaje de bandeja de entrada con decisiones tipadas: el adaptador `v0007-typed` resuelve clasificaciones de flujo de trabajo de formato fijo (0,850 de precisión de validación) usando JSON como estado, lo que encaja en sistemas de gestión de casos donde la salida debe ser una etiqueta estable y no texto libre.
- Moderación de contenido en tiempo real: el adaptador `safety` (0,844 de validación sobre jailbreak, toxic, tweet_hate y tweet_offensive) permite filtrar comentarios antes de publicarlos con 37–73 ms por petición, sin coste de decodificación.
- Antispam en formularios y correo: el adaptador `spam` con 0,990 de precisión de validación se puede desplegar como paso previo a un clasificador más caro, aplicando el umbral sobre la probabilidad devuelta para escalar solo los casos dudosos.
- Análisis de sentimiento y voz de cliente a escala: el adaptador `sentiment` ofrece puntuaciones calibradas por reseña o tuit (sst2, yelp, tweet_sentiment, emotion, goemo_soft), lo que permite agregar distribuciones de probabilidad en paneles en lugar de contar etiquetas duras.
- Verificación lógica en pipelines de datos: el adaptador `reason` (0,943 de validación) permite responder preguntas de sí/no sobre afirmaciones y detectar trampas lógicas antes de aceptar un registro o una respuesta generada por otro modelo.
- Resolución de problemas aritméticos sencillos en validación de formularios: el adaptador `math` (gsm8k, svamp, aqua) permite comprobar opciones numéricas de un cuestionario cerrado sin invocar un modelo generativo.
- Detección de idioma previa al enrutamiento: el adaptador `language` (1,000 de validación) decide en una sola pasada si el texto entrante está en el idioma esperado antes de derivarlo al modelo correspondiente.
- Selección de herramienta o rama de un flujo: al devolver una distribución sobre opciones nombradas, el tronco puede usarse como selector de rama en un grafo de automatización, con la probabilidad disponible para decidir si se requiere revisión humana.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos escritos a mano y no vistos en entrenamiento:

| Conjunto | Tronco `v0007` | `auto` (router + adaptadores) | Referencias |
|---|---:|---:|---|
| Banco de pruebas de 196 preguntas, 20 categorías | 0,842 | 0,949 | – |
| Decisiones tipadas (benchmark Laya, formato de 1.200 casos) | – | 0,796 | Jev 0,727; Laya 0,766 |
| 10 trampas lógicas duras de sí/no (noul10) | 4/10 | 9/10 | Jev 10/10 |
| Suite pública no vista de 15 tareas, precisión media / ECE | 0,736 / 0,074 | – | – |

Precisión de validación por versión (media sobre las tareas de cada adaptador):

| Versión | Dominio | Entrenado con | LoRA r | Precisión de validación |
|---|---|---|---:|---:|
| `v0007` | tronco | 61 tareas públicas | 16 | 0,792 |
| `v0007-reason` | reason | traps, reason, skills | 16 | 0,943 |
| `v0007-math` | math | math, gsm8k, svamp, aqua | 32 | 0,690 |
| `v0007-language` | language | language | 8 | 1,000 |
| `v0007-support` | support | banking77, clinc150, massive_intent | 8 | no disponible |
| `v0007-sentiment` | sentiment | sst2, sst5, yelp, tweet_sentiment, emotion, goemo_soft, tweet_irony, imdb, formality, politeness, sarcasm | 8 | 0,776 |
| `v0007-safety` | safety | jailbreak, toxic, tweet_hate, tweet_offensive | 8 | 0,844 |
| `v0007-spam` | spam | spam | 8 | 0,990 |
| `v0007-typed` | workflow | typed_decisions | 16 | 0,850 |

Calibración: ECE del tronco de 0,010 en su conjunto de validación antes del temperature scaling; 0,074 de ECE medio en la suite pública no vista de 15 tareas.

## Requisitos de hardware

- VRAM en GPU (tronco únicamente, LoRA fusionado): 3,5 GB en fp16.
- VRAM con un adaptador de dominio cargado por nombre: los mismos 3,5 GB más 8–140 MB por adaptador. La familia completa cabe en aproximadamente 3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El autor midió en una RTX 2080 Ti (Turing, 2018) y confirma que no requiere bf16 ni flash-attention, por lo que también es válida en GTX 16xx, RTX 20xx, RTX 30xx, RTX 40xx, A100, H100, L4 o T4.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM.
- Latencia medida (1–3 preguntas cortas por petición): 37–52 ms con el tronco en GPU; 61–73 ms con un adaptador de dominio seleccionado por nombre; 113–200 ms en modo `auto` (router más adaptador, dos pasadas). Un segundo adaptador apilado añade 10–20 ms.
- Latencia en CPU: no disponible (la model card menciona medidas con un Intel i9-9900KF a 4 hilos, pero los valores concretos quedan truncados en la información disponible).
- Throughput (peticiones por segundo): no disponible.
- Opciones de despliegue documentadas: `transformers` más `peft` en Python puro (el paquete `s1/` del Space de demostración contiene el código de inferencia y el layout exacto de los prompts). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI; el tronco fusionado puede exportarse al modelo base, pero los adaptadores conmutables por petición dependen de PEFT.
- Ruta para conjuntos de más de 26 opciones: decodificación en dos etapas, con el coste adicional correspondiente (valor no especificado en la información disponible).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Certus v0007 (`auto`) | Clasificador de decisión sobre Qwen2.5-1.5B + LoRA | 1,5B base, adaptadores r=8/16/32 | No especificado | 0,796 en el benchmark Laya; 9/10 en noul10 | apache-2.0 | HuggingFace (modelo y Space) |
| Jev (TypeSafe) | Modelo de decisión "System One" | No disponible | No disponible | 0,727 en el benchmark Laya; 10/10 en noul10 | No disponible | No disponible en la información proporcionada |
| Laya | Modelo de decisión | No disponible | No disponible | 0,766 en el benchmark Laya | No disponible | No disponible en la información proporcionada |
| Qwen/Qwen2.5-1.5B-Instruct | LLM generativo (modelo base) | 1,5B | 32.768 tokens nativos según el modelo base | No comparable directamente: genera texto en lugar de devolver distribuciones calibradas sobre opciones | Apache 2.0 (según el modelo base) | HuggingFace |

No se dispone de datos de parámetros, contexto, licencia ni disponibilidad de Jev y Laya más allá de las puntuaciones citadas en la model card de Certus.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera redacción libre, resúmenes o diálogo abierto queda fuera del alcance del modelo.
- Solo declara inglés (`en`); no se documentan capacidades multilingües, por lo que el uso en castellano u otros idiomas no está validado.
- Riesgo de alucinación estructural: como la salida es un softmax sobre las letras de las opciones, el modelo siempre devolverá una de las opciones aunque ninguna sea correcta. Es imprescindible aplicar umbrales sobre la probabilidad y disponer de una opción de abstención o de revisión humana.
- En el conjunto de trampas lógicas noul10 el tronco acierta solo 4/10 y el modo `auto` 9/10, por debajo de Jev (10/10); el razonamiento lógico de caso límite sigue siendo un punto débil.
- El adaptador `math` es el de peor precisión de validación (0,690); no debe usarse como calculadora fiable en producción.
- El tronco se entrenó durante solo 1 época sobre 61 tareas, y varias métricas de validación corresponden a conjuntos pequeños; los adaptadores `support` no publican precisión de validación.
- El enrutamiento depende de un umbral fijo de 0,5 y de un máximo de dos adaptadores apilados; no hay datos publicados sobre el coste de errores del router.
- La calibración es sensible al número de opciones: las temperaturas están ajustadas por tramos (por ejemplo, 1,02 para 3–5 opciones) y deben respetarse para que las probabilidades sean interpretables.
- El prompt debe seguir el layout exacto del paquete `s1/` (renderizado del estado, descripciones de opciones, orden de sí/no, ruta de dos etapas para más de 26 opciones); desviarse de él puede degradar el resultado sin aviso.
- Licencia Apache 2.0, sin restricciones documentadas para uso comercial, pero el autor no ofrece garantías ni datos de evaluación independientes.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta: no existe validación por parte de la comunidad ni informes de terceros.
- Los pesos están en formato PEFT/safetensors y el modo `auto` requiere cargar el router y varios adaptadores; no hay binarios GGUF ni recetas para motores de inferencia de alto rendimiento.
- No se han documentado sesgos específicos ni auditorías de equidad; dado el uso de conjuntos como stance_*, tweet_hate o toxic, es esperable que el modelo refleje los sesgos de esas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ait-hf/certus-jev-like-v0007
- Space de demostración (playground gratuito): https://huggingface.co/spaces/ait-hf/certus-jev-like-playground
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper, blog o repositorio adicional: no disponible. Las búsquedas web realizadas devolvieron únicamente resultados sobre el accidente isquémico transitorio (AIT), sin relación con este modelo.
