# ai-ecoverse/kev-4b-vision-intent

## Resumen

kev-4b-vision-intent es un modelo de decision multimodal desarrollado por ai-ecoverse como fine-tune de Kev-4B, a su vez derivado de Qwen3.5-4B-Base. No es un modelo generativo: recibe un estado compuesto por una intencion en lenguaje natural, una captura de pantalla de 1024 x 576 con marcas de referencia y una lista cerrada de opciones, y devuelve en una sola pasada de forward una distribucion de probabilidad calibrada sobre esas opciones. No se generan tokens.

El modelo actua como System 1 de la herramienta de navegador `intent`, que construye una lista corta lexica a partir de la pagina y formula tres tipos de pregunta: ACT (que control, entre unos 24, corresponde a la intencion declarada), RETRIEVE (que segmento de texto, entre unos 16, responde a la intencion) y VERIFY (si una afirmacion se sostiene a la luz de los segmentos de evidencia principales). La herramienta ejecuta la accion cuando la probabilidad supera un umbral y, por debajo de este, devuelve los candidatos.

Su interes practico esta en que un modelo de decision de aproximadamente 4.000 millones de parametros se ejecuta integramente en el navegador mediante ONNX Runtime Web y WebGPU, con un bundle de 5 GB en cuantizacion q8f32 y latencias de en torno a 2,21 s por pregunta ACT en un Apple M4 Max. Frente al checkpoint del que parte (kev-4b-vision), mejora el top-1 de ACT de 82,0 a 89,8 sobre 400 pasos de intent-bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B-Base) con torre de vision congelada, LoRA de rango 16 fusionado en el decoder y cabeza pointer |
| Parametros totales | Aproximadamente 4.000 millones, heredados de Qwen3.5-4B-Base; el numero exacto no se especifica |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8f32 (ONNX, variante distribuida en el bundle kev.js); el repositorio incluye tambien el checkpoint PyTorch sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), head.pt con la cabeza pointer, y ONNX q8f32 dentro del bundle kev.js |
| Tamano del repositorio | 5,5 GB (el bundle kev.js son 5 GB) |
| Modelo base | jaredpalmer/kev-4b (revision 4bc64c6) |
| Dataset de entrenamiento | osunlp/Multimodal-Mind2Web, mas items de 284 paginas publicas y estados de juego de webrunner |
| Version de runtime probada | kev.js 0.6.0 |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-4B-Base. Sobre el decoder se aplica un LoRA de rango 16 en todas las capas lineales, inicializado desde el adaptador del propio Kev-4B (jaredpalmer/kev-4b@4bc64c6, el checkpoint kev-4b-vision publicado), mas una cabeza pointer que produce la distribucion sobre las opciones de la lista corta. La torre de vision de Qwen3.5 se mantiene congelada y se distribuye sin cambios. La salida no es texto: es una probabilidad calibrada por opcion, con decodificacion de un unico forward pass.

El entrenamiento consistio en una epoca con learning rate 2e-5, batch 1 con 8 pasos de acumulacion, sobre 7.500 filas muestreadas de la mezcla que entreno a kev-0.8b-vision-intent. Esa mezcla incluye pasos de entrenamiento de Multimodal-Mind2Web con intenciones escritas por Claude Sonnet 5.5 (informadas y ciegas), listas cortas lexicas de 24, 32 o 48 controles, casos NONE cuando la lista corta no contenia el objetivo y un 10% de copias NONE con el objetivo eliminado; items de RETRIEVE/VERIFY de 284 paginas publicas de sitios no usados por intent-bench; items de estado de juego de instantaneas de juegos de webrunner (excluyendo las ejecuciones reservadas para evaluacion); filas de entrenamiento de Multimodal-Mind2Web en el formato webrunner de meep-meep; y filas de replay de Kev decision-v7. El entrenamiento se ejecuto en una unica NVIDIA H100 y duro 47 minutos. Las particiones `test_*` de Mind2Web no se usaron para entrenar. La temperatura de servicio es 1,4, ajustada sobre filas reservadas de la distribucion de entrenamiento, y `head.pt` registra los argumentos exactos de entrenamiento.

## Capacidades

- Clasificacion de intencion a control (ACT): dado un intent y una lista corta de hasta 24, 32 o 48 controles marcados sobre la captura, devuelve la opcion correcta o NONE.
- Recuperacion de evidencia (RETRIEVE): selecciona, entre unos 16 segmentos de texto de la pagina, el que responde a la intencion, o NONE.
- Verificacion de afirmaciones (VERIFY): determina si una afirmacion se sostiene a partir de los segmentos de evidencia principales.
- Salida probabilistica calibrada en una sola pasada, sin generacion de texto, lo que permite aplicar umbrales de decision configurables.
- Comprension de capturas de pantalla de 1024 x 576 que incorporan las marcas de referencia de la herramienta, es decir, vision integrada en la decision.
- Funcionamiento como System 1 dentro de un agente de navegador: actua cuando la probabilidad supera el umbral y devuelve candidatos cuando no lo hace.
- Soporte de estados de juego en navegador (RETRIEVE y VERIFY sobre instantaneas de juegos como Kittens Game, Drug Wars y Armchair Bike Touring).
- Ejecucion en navegador con ONNX Runtime Web y WebGPU, con variante q8f32.
- No soporta tool calling, function calling ni generacion de texto libre: su contrato de salida es una eleccion dentro de un conjunto cerrado.
- No hay soporte multilingue declarado: solo ingles.

## Casos de uso

- Agentes de navegador web: el modelo resuelve la pregunta ACT para decidir sobre que control hacer clic a partir de un intent en lenguaje natural, lo que permite automatizar tareas como "abrir los comentarios de la noticia principal" sin generar texto ni invocar un LLM mayor. Es adecuado porque su top-1 de ACT es 89,8 y actua sobre el 89,5% de los intents con una precision del 95,0%.
- Extraccion de respuestas desde paginas web: con RETRIEVE, el modelo localiza el segmento de texto que responde a una pregunta sobre el contenido de la pagina; responde al 71,6% de los items con precision del 95,2%. Resulta util en pipelines de scraping guiado por intencion donde no conviene generar texto libre.
- Verificacion de afirmaciones en flujos automatizados: con VERIFY, comprueba si una afirmacion se sostiene segun las evidencias de la pagina; responde al 97,7% de los items con precision del 96,4% (98,0% en estados de juego reservados).
- Automatizacion de acciones en el navegador sin servidor: al distribuirse como bundle ONNX q8f32 ejecutable con WebGPU, permite integrar el modelo en una extension o aplicacion web sin depender de infraestructura de inferencia externa.
- Pre-filtrado en arquitecturas de agente con dos niveles: usar este modelo como System 1 rapido que resuelve la mayoria de decisiones y reservar un LLM mayor para los casos en que la probabilidad queda por debajo del umbral de la herramienta.
- Pruebas end-to-end de interfaces web: dado un intent sobre un flujo concreto, el modelo sirve para comprobar de forma automatizada que el control esperado existe y es identificable en la pagina, con umbrales de confianza explicitos.
- Agentes que juegan a juegos de navegador: la evaluacion especifica de estado de juego (99,1 en RETRIEVE y 96,7 en VERIFY) indica que el modelo es util para localizar informacion y verificar hechos dentro de interfaces de juego.
- Clasificacion de intenciones con abstención controlada: la salida calibrada y los umbrales por tarea (act 0,75, retrieve 0,85, verify 0,7) permiten construir sistemas que prefieren no actuar antes que actuar mal.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre intent-bench de ai-ecoverse: 400 pasos de `test_website` de Mind2Web con intenciones escritas por Claude Sonnet 5.5 (200 informadas y 200 ciegas), 88 items de RETRIEVE y 86 de VERIFY de 11 paginas reales, mas RETRIEVE/VERIFY de estado de juego de ejecuciones reservadas de webrunner y 25 casos dificiles de ejecucion real. Medicion con kev.js 0.6.0, q8f32, WebGPU en Chrome sobre Apple M4 Max.

| Metrica | kev-4b-vision | Este modelo | kev-0.8b-vision | kev-0.8b-vision-intent |
|---|---|---|---|---|
| ACT top-1, 400 (ciego / informado) | 82,0 (77,6 / 86,3) sobre 200 | 89,8 (87,0 / 92,5) | 61,8 (58,5 / 65,0) | 88,2 (85,0 / 91,5) |
| ACT: actua con p >= 0,7, precision | 69%, 94,9% | 91%, 94,5% | 16%, 98,4% | 90%, 95,3% |
| RETRIEVE top-1 | 86,4 | 87,5 | 63,6 | 81,8 |
| VERIFY exactitud | 93,0 | 95,3 | 77,9 | 88,4 |
| RETRIEVE / VERIFY de estado de juego | 97,4 / 90,3 | 99,1 / 96,7 | No disponible | 99,5 / 91,7 |
| Casos dificiles de ejecucion real | 8/25 | 10/25 | No disponible | 8/25 |
| Latencia p50 ACT / RETRIEVE | 1,96 s / 0,70 s | 2,21 s / 0,99 s | 0,50 s / 0,15 s | 0,61 s / 0,16 s |

Con los umbrales del manifiesto, el modelo actua sobre el 89,5% de los intents con una precision del 95,0% (el 4,5% de los intents termina en una accion incorrecta), responde al 71,6% de los items de RETRIEVE con precision del 95,2% y responde al 97,7% de los items de VERIFY con precision del 96,4%. Cada umbral es el mas bajo, siempre igual o superior a 0,7, con el que la precision de intent-bench alcanza el 95%.

## Requisitos de hardware

- El bundle distribuido en kev.js ocupa 5 GB y el repositorio completo 5,5 GB; el consumo de memoria en inferencia no se detalla de forma explicita, pero cabe esperar un orden de magnitud similar al del bundle q8f32.
- La unica configuracion de ejecucion documentada es WebGPU en Chrome sobre un Apple M4 Max, es decir, hardware de consumo y no GPU de centro de datos.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) para la variante ONNX q8f32. La H100 solo se menciona como hardware de entrenamiento (47 minutos).
- Cabe en GPU de consumo segun la evidencia disponible: las mediciones de latencia se tomaron en un Apple M4 Max; no hay datos publicados para otras GPU.
- Opciones de despliegue: kev.js 0.6.0 con onnxruntime-web y WebGPU (variante q8f32). La model card tambien publica el checkpoint PyTorch en formato Kev (adaptador safetensors, cabeza pointer y tokenizer). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia p50 medida: 2,21 s para ACT y 0,99 s para RETRIEVE. El modelo hermano kev-0.8b-vision-intent es aproximadamente 3,5 veces mas rapido con una precision ligeramente inferior.
- No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ACT top-1 (400) | RETRIEVE top-1 | VERIFY | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| kev-4b-vision-intent (este modelo) | ~4B | No disponible | 89,8 (87,0 / 92,5) | 87,5 | 95,3 | OpenRAIL | HuggingFace, ai-ecoverse |
| kev-4b-vision | ~4B | No disponible | 82,0 (77,6 / 86,3) sobre 200 | 86,4 | 93,0 | No disponible | HuggingFace, ai-ecoverse |
| kev-0.8b-vision-intent | ~0,8B | No disponible | 88,2 (85,0 / 91,5) | 81,8 | 88,4 | No disponible | HuggingFace, ai-ecoverse |
| kev-0.8b-vision | ~0,8B | No disponible | 61,8 (58,5 / 65,0) | 63,6 | 77,9 | No disponible | HuggingFace, ai-ecoverse |

La comparacion se limita a la propia familia Kev, ya que no se han encontrado en la informacion disponible alternativas equivalentes de modelo de decision de intencion para agentes web con evaluacion publicada en intent-bench. Frente al modelo base kev-4b-vision, este fine-tune gana 7,8 puntos de top-1 en ACT y 2,3 puntos en VERIFY, a costa de unos 0,25 s mas de latencia p50 en ACT. Frente a kev-0.8b-vision-intent, es mas preciso en RETRIEVE (87,5 frente a 81,8) y VERIFY (95,3 frente a 88,4), pero aproximadamente 3,5 veces mas lento.

## Limitaciones y advertencias

- Solo se evalua y se declara para paginas web en ingles; no hay soporte multilingue.
- La entrada de vision esta restringida a capturas de 1024 x 576 que llevan las marcas de referencia de la herramienta `intent`; fuera de ese formato o sin marcas no hay garantia de funcionamiento.
- El modelo no genera texto: cualquier caso de uso que requiera lenguaje libre, resumen o explicacion queda fuera de su contrato de salida.
- La decision depende de una lista corta lexica construida por la herramienta (24, 32 o 48 controles, unos 16 segmentos); si el objetivo no esta en la lista, la respuesta correcta es NONE y el sistema debe abstenerse.
- Con los umbrales recomendados, el 4,5% de los intents termina en una accion incorrecta; los 25 casos dificiles de ejecucion real solo se resuelven correctamente en 10 de 25.
- La salida es una probabilidad calibrada, no una generacion, por lo que el riesgo no es de alucinacion de texto sino de mala calibracion o clasificacion erronea si se cambia la distribucion de entrada (otro idioma, otro tipo de pagina, otro formato de captura).
- Las intenciones de entrenamiento y evaluacion fueron escritas por Claude Sonnet 5.5, lo que puede introducir un sesgo hacia ese estilo de formulacion.
- El dataset principal es Multimodal-Mind2Web, centrado en un conjunto acotado de sitios web; el comportamiento en sitios muy alejados de esa distribucion no esta caracterizado.
- Licencia OpenRAIL: permite uso comercial, pero incorpora restricciones de uso basadas en clausulas de uso responsable que deben revisarse antes de un despliegue en produccion.
- En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que la validacion por parte de la comunidad es inexistente.
- La ausencia de datos sobre longitud de contexto y sobre rendimiento en hardware distinto de un Apple M4 Max limita la planificacion de capacidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-ecoverse/kev-4b-vision-intent
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Modelo hermano de 0,8B: https://huggingface.co/ai-ecoverse/kev-0.8b-vision-intent
- Repositorio kev.js: https://github.com/ai-ecoverse/kev.js
- Pull request de la herramienta `intent` en el repositorio de skills: https://github.com/ai-ecoverse/skills/pull/473
- Dataset Multimodal-Mind2Web: https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revision del adaptador de partida: https://huggingface.co/jaredpalmer/kev-4b/tree/4bc64c6

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados fueron portales genericos de asistentes de IA (OpenAI, Google Gemini, ChatGPT, DeepAI y Google AI), sin relacion con kev-4b-vision-intent.
