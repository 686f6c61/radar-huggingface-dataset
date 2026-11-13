# lychee888/Qwen3.8-Flash-Next-Hybrid-Decision

## Resumen

Qwen3.8 Flash Next Hybrid Decision es un paquete de despliegue publicado por el usuario lychee888 sobre el modelo base Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE. No se trata de un modelo entrenado desde cero ni de un ajuste fino: los pesos son identicos al modelo base (revision `1b3c3cedc14fb3bee4294dea5e3515af74b8268a`), y el valor anadido reside en un runner parcheado de vLLM, una captura de logits ligada a la peticion y una capa de API que expone dos interfaces sobre el mismo motor: chat convencional y decisiones tipadas. El modelo tiene 179.999.981.459 parametros (aproximadamente 180.000 millones) y un repositorio de 132,3 GB en safetensors.

La propuesta tecnica es la de un hibrido System 1 / System 2: las peticiones de chat ordinarias se enrutan directamente al motor, mientras que las peticiones de decision devuelven una distribucion de probabilidad sobre un conjunto de opciones suministrado por el llamante (de 2 a 256 opciones, o un booleano), sin generar texto visible. Internamente el motor si genera un token por decision, que la pasarela descarta. Esto permite usar el mismo artefacto para generacion abierta y para clasificacion/decision cerrada.

Es relevante ahora porque ejemplifica una tendencia practica: reutilizar un backbone congelado de gran tamano como motor de decision mediante lectura de logits, sin entrenar cabezas ni LoRA adicionales, y estandarizar la interfaz mediante primitivas tipadas. La model card documenta su uso en produccion sobre dos nodos DGX Spark (GB10) desde el 20 de octubre de 2026, con paneles de evaluacion propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen3.8-Flash-Next; no se detalla en la informacion disponible) |
| Parametros totales | 179.999.981.459 (~180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y FP8 (el nombre del modelo base incluye NVFP4 y FP8PLE); pesos en 8 bits segun tags (`8-bit`, `compressed-tensors`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como `other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |
| Biblioteca de inferencia | vLLM (requiere instancia parcheada) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 132,3 GB |
| Modelo base | lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento nuevo. La model card es explicita: los pesos son identicos al modelo base y no hay cabeza de decision ni LoRA entrenados en el paquete por defecto; la contribucion es software (runner parcheado, captura de logits y API). La referencia arquitectonica declarada es AutoTrust JEV-27B, que si dispone de LoRA y cabeza de decision entrenadas, pero este paquete no incluye esos pesos ni un reemplazo entrenado.

El mecanismo de decision funciona en dos superficies de prompt congeladas. Para elecciones de 2 a 16 opciones se usa la superficie `qwen_chat_letters-v1` con una representacion interna fija de 24 slots, que la model card describe como formato de cable para elecciones pequenas y booleanos, no como cabeza entrenada ni como maximo de opciones. Para elecciones de 17 a 256 opciones se usa `qwen_chat_wide-v1`, con un catalogo de 256 etiquetas, captura de logits terminales ligada a la peticion y softmax enmascarado sobre las etiquetas activas. El runner captura los logits de los tokens de opcion al final del prompt, la pasarela aplica mascara y softmax y mapea el resultado a las claves de opcion del llamante, verificando la identidad de la peticion y los metadatos del prompt antes de devolver. Las llamadas tipadas usan pensamiento desactivado.

## Capacidades

- Generacion de texto conversacional multi-turno a traves de la interfaz de chat estandar sobre el mismo motor.
- Decisiones tipadas: devolucion de probabilidades sobre 2 a 256 opciones suministradas por el llamante, o sobre un booleano mediante puente de dos opciones (`false`, `true`).
- Criterios multiples: cada pregunta a `/v1/systemone` admite hasta 256 criterios.
- Soporte de herramientas (tool calling) y comportamiento MTP, declarados sin cambios respecto al modelo base.
- Soporte de SSE (streaming de eventos) para chat.
- Pipeline image-text-to-text: el modelo base es multimodal entrada imagen-texto, aunque la model card no detalla las capacidades de vision del paquete.
- No soporta preguntas de puntuacion nativas (native score questions).
- No escala automaticamente una decision incierta a una ejecucion de razonamiento; el llamante decide cuando usar chat ordinario.

## Casos de uso

- Enrutamiento de peticiones en produccion: clasificar cada consulta entrante en un conjunto acotado de intenciones (por ejemplo, 8 o 16 categorias) y obtener la distribucion de probabilidad para decidir si se atiende con el flujo automatizado o se deriva a un agente con razonamiento.
- Moderacion y filtrado por criterios: plantear una decision booleana o de hasta 256 criterios sobre un texto para decidir si cumple una politica, usando la probabilidad devuelta como senal para umbrales configurables.
- Clasificacion de tickets de soporte: mapear un ticket a una cola o equipo mediante la superficie de eleccion, con la ventaja de reutilizar el mismo motor que atiende el chat de atencion al cliente.
- Triaje en pipelines documentales: decidir entre etiquetas de tipo documental o de prioridad antes de encadenar pasos de extraccion, aprovechando que la decision no consume tokens de texto devueltos.
- Evaluacion de alternativas en agentes: dado un conjunto de acciones candidatas, obtener la distribucion sobre ellas y usar el ranking como paso de seleccion dentro de un bucle de agente.
- Control de calidad en generacion: comparar la opcion elegida por el modelo con la esperada en conjuntos de validacion tipo JevBench o ChaosNLI, integrando el resultado como test de regresion en CI sobre el propio despliegue.
- Despliegue en infraestructura compacta: la model card documenta produccion sobre dos nodos DGX Spark (GB10) con llamadas tipadas de 256 opciones junto a la ruta de 2 a 16 opciones, lo que sirve como referencia de dimensionamiento.

## Benchmarks y rendimiento

La model card reporta resultados del despliegue de produccion del mantenedor, fechados el 20 de octubre de 2026. No se reportan cifras de velocidad, latencia ni throughput.

| Carril | Items | Repeticion 1 | Repeticion 2 | Repeticion 3 | Referencia |
|---|---:|---:|---:|---:|---|
| Legacy strict | 213 | 198 | 198 | 199 | Jev 1.13.0 publicado: 186 |
| Legacy score, sustituto de eleccion | 18 | 16 | 15 | 16 | Jev 1.13.0 publicado: 14, score nativo |
| Subconjunto ChaosNLI | 96 | 65 | 65 | 65 | Precision plural publicada: 62 |
| ChaosNLI, todas las filas de test una vez | 1.599 | 1.028 (64,29%) | | | Jev 1.13.0 publicado: 981 (61,35%) |

Comparacion descriptiva con AutoTrust JEV-27B: este ultimo reporta 88,70% en el JevBench legacy publico de 231 items con precision macro por familia. Reagregando las salidas de produccion del paquete sobre la misma definicion se obtienen medias macro por familia de 93,95%, 92,96% y 93,59% (media 93,50%, +4,80 puntos de forma descriptiva); con la regla de desempate de la API en vivo la media es 93,11%. La model card advierte que la comparacion con AutoTrust es solo descriptiva porque sus salidas por item no son publicas y los 18 items de score son sustitutos de eleccion. La primera comparacion pareada (213 items) usa McNemar exacto con p entre 0,002 y 0,008.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Con ~180.000 millones de parametros en 8 bits (compressed-tensors) y un repositorio de 132,3 GB, el peso de los pesos ronda ese orden de magnitud; el calculo exacto de VRAM con cache KV no se documenta.
- Despliegue de referencia: dos nodos DGX Spark (GB10) en produccion, segun la model card.
- GPU recomendadas: no disponible; la informacion solo cita GB10. No se confirma soporte en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible; por tamano, un modelo de ~180.000 millones en 8 bits excede la VRAM de una unica GPU consumer convencional, pero no se aporta confirmacion.
- Opciones de despliegue: vLLM con la instancia parcheada de lychee888/QwenFN-Hybrid-Decision-Engine (obligatorio), mas la pasarela tipada del mismo repositorio. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no reportados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque de decision | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8 Flash Next Hybrid Decision | ~180.000 M | no disponible | qwen-community-1.0 | Lectura de logits sobre backbone congelado, 2-256 opciones | Hugging Face, requiere runtime parcheado |
| AutoTrust JEV-27B | 27.000 M (aproximado, segun nombre) | no disponible | no disponible | LoRA y cabeza de decision entrenadas, 24 slots y verbalizadores | Hugging Face |
| Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE | no disponible | no disponible | no disponible | Solo chat convencional | Hugging Face |

La comparacion cuantitativa disponible se limita al JevBench legacy: 93,50% de media macro por familia frente al 88,70% de JEV-27B, y 64,29% en ChaosNLI frente al 61,35% publicado de Jev 1.13.0. Son cifras descriptivas, con las salvedades metodologicas indicadas en la seccion de benchmarks.

## Limitaciones y advertencias

- Las probabilidades devueltas son la distribucion enmascarada del modelo sobre las opciones; la model card advierte que no estan garantizadas como estimaciones de confianza calibradas.
- El paquete no incluye cabeza de decision ni LoRA entrenados: la calidad de la decision depende de la lectura de logits del modelo base y de las superficies de prompt congeladas.
- No hay escalado automatico de una decision incierta a razonamiento; el llamante debe gestionar ese flujo.
- No soporta preguntas de puntuacion nativas; los 18 items de score evaluados son sustitutos de eleccion.
- Requiere obligatoriamente la instancia de vLLM parcheada; no funciona con vLLM estandar ni con otras herramientas de inferencia segun la informacion disponible.
- La model card declara `inference: false` en los metadatos, pese a documentar un despliegue en produccion; conviene verificar el procedimiento de arranque en el repositorio del runtime.
- Licencia qwen-community-1.0: es necesario revisar el texto de la licencia (LICENSE en el repositorio) para confirmar condiciones de uso comercial.
- El modelo base se denomina "Uncensored"; no se documentan en la informacion disponible los sesgos, la politica de seguridad ni los filtros aplicados, lo que exige evaluacion propia antes de uso en produccion con usuarios finales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo general de un modelo generativo de este tamano.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento en castellano sin evaluacion propia.
- Longitud de contexto y capacidades multimodales efectivas: no disponibles en detalle.
- La comparacion con AutoTrust JEV-27B es descriptiva y no replicable item a item, ya que sus salidas no son publicas.
- No se publican cifras de latencia ni throughput, por lo que el dimensionamiento en produccion debe medirse localmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lychee888/Qwen3.8-Flash-Next-Hybrid-Decision
- Modelo base: https://huggingface.co/lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE
- Runtime y codigo fuente: https://github.com/lychee888/QwenFN-Hybrid-Decision-Engine
- Referencia arquitectonica AutoTrust JEV-27B: https://huggingface.co/autotrust/JEV-27B
- Receta de prompt swanone: https://github.com/blockbrain-ai/swanone-recipe
- Primitivas tipadas TypeSafe AI: https://docs.typesafe.ai/
