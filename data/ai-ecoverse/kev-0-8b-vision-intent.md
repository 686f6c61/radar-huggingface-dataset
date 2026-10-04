# ai-ecoverse/kev-0.8b-vision-intent

## Resumen

kev-0.8b-vision-intent es un ajuste fino de Kev-0.8B (a su vez derivado de Qwen3.5-0.8B-Base) publicado por ai-ecoverse y pensado para actuar como «System 1» de la herramienta de navegador `intent`. No es un modelo generativo de texto: recibe una intencion declarada en lenguaje natural, una captura de pantalla con marcas de referencia sobre los controles candidatos y una lista corta de controles o segmentos de texto, y devuelve una distribucion de probabilidad calibrada en una sola pasada forward.

El modelo resuelve tres tareas concretas de automatizacion web: ACT (elegir cual de unos 24 controles corresponde a la intencion, o NONE), RETRIEVE (elegir cual de unos 16 fragmentos de texto de la pagina responde a la intencion, o NONE) y VERIFY (decidir si una afirmacion se sostiene a partir de los segmentos de evidencia). La herramienta actua por encima de un umbral y devuelve candidatos por debajo de el.

Su relevancia actual esta en el despliegue: el repositorio incluye un bundle de kev.js con un decoder ONNX q8f32, la torre de vision estandar de Qwen3.5 congelada, la cabeza pointer y el tokenizer, con un total de aproximadamente 1 GB. Esto permite ejecutar un agente web multimodal en el navegador mediante ONNX Runtime Web y WebGPU, con latencias p50 de 0,61 s en ACT y 0,16 s en RETRIEVE sobre un Apple M4 Max, muy por debajo de su hermano mayor kev-4b-vision-intent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con la torre de vision estandar de Qwen3.5 congelada, mas adaptadores LoRA de rango 16 sobre todas las capas lineales y una cabeza pointer (pointer head) |
| Parametros totales | aproximadamente 0,8 mil millones (modelo base Qwen3.5-0.8B-Base); no se desglosa la cifra exacta en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8f32 (decoder ONNX q8 con f32); el repositorio incluye la etiqueta int8 |
| Idiomas soportados | en (ingles) |
| Licencia | openrail |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json para Qwen/Qwen3.5-0.8B-Base), head.pt para la cabeza pointer y ONNX q8f32 dentro del bundle kev.js |
| Modelo base | jaredpalmer/kev-0.8b |
| Dataset de entrenamiento | osunlp/Multimodal-Mind2Web, entre otros (trazas de webrunner, suite decision-v7 de Kev) |
| Tamano del repositorio | 1,1 GB |
| Version de runtime probada | kev.js 0.6.0 |

## Arquitectura y entrenamiento

El modelo parte de Kev-0.8B, el checkpoint kev-0.8b-vision publicado, construido sobre Qwen3.5-0.8B-Base. Sobre esa base se anaden dos etapas de LoRA de rango 16 aplicadas a todas las capas lineales, con warm start desde el adaptador anterior, mas una cabeza pointer que produce la distribucion de probabilidad sobre las opciones candidatas. La torre de vision de Qwen3.5 se mantiene congelada y se distribuye sin cambios. La respuesta es siempre una distribucion calibrada en una unica pasada forward, sin generacion de texto. La temperatura de servicio es 1,25, ajustada sobre filas mantenidas fuera de la distribucion de entrenamiento.

El entrenamiento consta de dos etapas. La primera (wr1) parte del checkpoint kev-0.8b-vision y consume una epoca sobre 12.500 filas: pasos de entrenamiento de Multimodal-Mind2Web en el formato de webrunner (captura marcada, menu de controles ordenado, SHRUG cuando falta el objetivo), trazas de juegos de webrunner etiquetadas por Claude Sonnet 5.5 y 1.500 filas de la suite decision-v7 de Kev reproducidas. La segunda etapa (v3, el modelo que nos ocupa) anade una epoca con learning rate 5e-5 y batch 4 con acumulacion de 8 sobre 16.809 filas: 3.000 pasos de ACT con intenciones escritas por Claude Sonnet 5.5 (informadas y ciegas) y la lista lexica de la herramienta (24, 32 o 48 controles), con NONE cuando la lista no contenia el objetivo y un 10% de copias NONE con el objetivo eliminado; 4.315 elementos de RETRIEVE/VERIFY procedentes de 284 paginas publicas no usadas por intent-bench, con preguntas y afirmaciones de Claude Sonnet 5.5; 2.776 elementos de estado de juego de instantaneas de webrunner; 2.000 filas de Mind2Web en formato webrunner y 1.500 filas de replay de Kev. Todo el entrenamiento se ejecuto en una NVIDIA H100 durante 27 minutos. Los splits `test_*` de Mind2Web no se usaron.

## Capacidades

- Clasificacion de intencion sobre controles de interfaz (tarea ACT): elige cual de aproximadamente 24 controles corresponde a una intencion declarada, o devuelve NONE si ninguno encaja.
- Recuperacion de evidencia en pagina (tarea RETRIEVE): selecciona cual de aproximadamente 16 segmentos de texto responde a la intencion, o NONE.
- Verificacion de afirmaciones (tarea VERIFY): decide si una afirmacion se sostiene a partir de los segmentos de evidencia principales, con tres estados (si, no, inseguro).
- Percepcion visual: procesa capturas de pantalla de 1024 x 576 en formato de pixeles RGBA con las marcas de referencia de la lista corta superpuestas.
- Salida probabilistica calibrada en una sola pasada forward, sin generacion de texto, apta para decidir por umbral.
- Capacidad especifica para estado de juego: recuperacion y verificacion sobre instantaneas de juegos (Kittens Game, Drug Wars, Armchair Bike Touring), con 99,5% y 91,7% respectivamente.
- Integracion con la herramienta `intent` como System 1, con umbrales recomendados en el manifiesto (act 0,7, retrieve 0,8, verify 0,9).
- No soporta tool calling general, function calling arbitrario, agentes multi-paso por si mismo ni razonamiento en lenguaje natural: esas funciones recaen en la herramienta que lo orquesta.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.

## Casos de uso

- Agentes de navegador en el propio cliente: la herramienta elige el control correcto a partir de una intencion en lenguaje natural y una captura de pantalla; con ~1 GB de bundle y latencia p50 de 0,61 s en ACT, puede ejecutarse en el navegador del usuario con WebGPU sin enviar capturas a un servidor.
- Automatizacion de flujos web repetitivos (RPA ligera): un pipeline puede declarar intenciones del tipo «abrir los comentarios de la noticia principal» y dejar que el modelo resuelva el control concreto sobre la lista corta generada por la herramienta.
- Extraccion de datos guiada por intencion: la tarea RETRIEVE permite localizar, entre los segmentos de la pagina, el que responde a una pregunta concreta, con un 81,8% de top-1 y 95,2% de precision al umbral de 0,8.
- Verificacion de contenido en pipelines de QA: la tarea VERIFY comprueba si una afirmacion se sostiene con la evidencia de la pagina, util para auditar respuestas generadas o para validar extracciones antes de publicarlas.
- Pruebas automatizadas de interfaces (end-to-end): el modelo puede actuar como oraculo de localizacion de elementos en tests que hoy dependen de selectores fragiles, resolviendo por intencion y captura.
- Agentes que operan juegos o simuladores web: las tareas RETRIEVE/VERIFY sobre estado de juego alcanzan 99,5% y 91,7%, lo que permite agentes que consultan el estado de la partida antes de decidir.
- Asistencia a la accesibilidad: dado que trabaja sobre capturas con marcas de referencia, puede mapear una orden verbal a un control concreto de una interfaz compleja sin depender del arbol DOM.
- Triaje de casos dudosos: cuando la probabilidad cae por debajo del umbral, el sistema devuelve candidatos en lugar de actuar, lo que permite derivar a revision humana o a un modelo mayor como kev-4b-vision-intent, que es mas preciso y aproximadamente 3,5 veces mas lento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre intent-bench (ai-ecoverse): 400 pasos `test_website` de Mind2Web con intenciones escritas por Claude Sonnet 5.5 (200 conocedoras de la etiqueta del control y 200 ciegas), 88 elementos de RETRIEVE y 86 de VERIFY de 11 paginas reales, elementos de estado de juego de ejecuciones mantenidas fuera, y 25 casos dificiles de ejecucion real. kev.js 0.6.0, q8f32, WebGPU en Chrome sobre Apple M4 Max.

| Metrica | kev-0.8b-vision | kev-0.8b-vision-intent (este modelo) | kev-4b-vision | kev-4b-vision-intent |
|---|---|---|---|---|
| ACT top-1 sobre 400 (ciego / informado) | 61,8 (58,5 / 65,0) | 88,2 (85,0 / 91,5) | 82,0 (77,6 / 86,3) sobre 200 | 89,8 (87,0 / 92,5) |
| ACT: actua con p >= 0,7, precision | 16%, 98,4% | 90%, 95,3% | 69%, 94,9% | 91%, 94,5% |
| RETRIEVE top-1 | 63,6 | 81,8 | 86,4 | 87,5 |
| VERIFY accuracy | 77,9 | 88,4 | 93,0 | 95,3 |
| Estado de juego RETRIEVE / VERIFY | no disponible | 99,5 / 91,7 | 97,4 / 90,3 | 99,1 / 96,7 |
| Casos dificiles de ejecucion real | no disponible | 8/25 | 8/25 | 10/25 |
| Latencia p50 ACT / RETRIEVE | 0,50 s / 0,15 s | 0,61 s / 0,16 s | 1,96 s / 0,70 s | 2,21 s / 0,99 s |

En los umbrales del manifiesto, el modelo actua sobre el 90,2% de las intenciones con una precision del 95,3% (el 4,2% de las intenciones terminan en una accion incorrecta), responde al 71,6% de los elementos de RETRIEVE con 95,2% de precision y al 80,2% de los elementos de VERIFY con 97,1% de precision (95,5% sobre los estados de juego mantenidos fuera). Cada umbral es el mas bajo, dentro de los valores de al menos 0,7, con el que la precision de intent-bench alcanza el 95%.

## Requisitos de hardware

- El bundle ONNX q8f32 de kev.js ocupa aproximadamente 1 GB, por lo que la huella de pesos es de ese orden; el repositorio completo suma 1,1 GB.
- La VRAM minima no se especifica en la informacion disponible.
- Inferencia probada en navegador mediante ONNX Runtime Web con backend WebGPU; el entorno de medida es WebGPU en Chrome sobre un Apple M4 Max, con latencia p50 de 0,61 s en ACT y 0,16 s en RETRIEVE.
- Al ejecutarse en el navegador con WebGPU, no requiere GPU de datacenter para el caso de uso previsto; se ha validado sobre hardware de Apple (M4 Max). No se detallan resultados para tarjetas concretas como RTX 4090, A100 o H100 en inferencia.
- Entrenamiento: una unica NVIDIA H100, 27 minutos para la etapa v3.
- Opciones de despliegue: kev.js 0.6.0 con onnxruntime-web (variante q8f32) o el checkpoint de PyTorch (adapter_model.safetensors + head.pt). El manifiesto `kev.js/manifest.json` nombra cada fichero y los umbrales recomendados.
- No hay informacion disponible sobre despliegue con vLLM, llama.cpp, Ollama o TGI, ni cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (ACT top-1 / RETRIEVE top-1 / VERIFY) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-0.8b-vision-intent | ~0,8 mil millones | no disponible | 88,2 / 81,8 / 88,4 | openrail | HuggingFace, bundle kev.js |
| kev-0.8b-vision | ~0,8 mil millones | no disponible | 61,8 / 63,6 / 77,9 | no disponible en la informacion proporcionada | HuggingFace (modelo base de esta ficha) |
| kev-4b-vision | aproximadamente 4 mil millones segun su denominacion; cifra no confirmada | no disponible | 82,0 (sobre 200) / 86,4 / 93,0 | no disponible en la informacion proporcionada | HuggingFace |
| kev-4b-vision-intent | aproximadamente 4 mil millones segun su denominacion; cifra no confirmada | no disponible | 89,8 / 87,5 / 95,3 | no disponible en la informacion proporcionada | HuggingFace; aproximadamente 3,5 veces mas lento |

No se dispone de datos para comparar con modelos de proposito general de tamano similar, ya que kev-0.8b-vision-intent no es un modelo de generacion de texto sino un clasificador de decisiones para agentes web.

## Limitaciones y advertencias

- No genera texto: la salida es una distribucion de probabilidad sobre opciones predefinidas, por lo que no sirve como modelo de chat ni de generacion.
- Uso condicionado a umbrales: por debajo de los valores recomendados (act 0,7, retrieve 0,8, verify 0,9) la herramienta devuelve candidatos en lugar de actuar. Ignorar los umbrales degrada la precision rapidamente (por ejemplo, en kev-0.8b-vision la precision al actuar con p >= 0,7 cae al 16%).
- Rendimiento limitado en casos reales dificiles: solo 8 de 25 casos dificiles de ejecucion real se resuelven correctamente.
- Sesgos de los datos: las intenciones, preguntas y afirmaciones de entrenamiento y evaluacion fueron escritas por Claude Sonnet 5.5, lo que introduce la distribucion y los sesgos de ese generador. Las paginas de evaluacion provienen de Mind2Web y de un conjunto limitado de sitios y juegos.
- Idioma: el modelo esta etiquetado unicamente para ingles. No hay datos sobre comportamiento en castellano u otros idiomas.
- Sobreajuste al formato de la herramienta: el modelo fue entrenado con la formulacion de pregunta propia de `intent` (`question: "plain"`), no con la de webrunner. Cambiar el texto de la pregunta o el formato de la lista corta puede degradar el resultado.
- Riesgo de alucinacion: al no generar texto libre, el riesgo se traslada a una confianza mal calibrada fuera de la distribucion de entrenamiento, lo que puede producir acciones incorrectas silenciosas.
- Licencia OpenRAIL: incluye restricciones de uso (clausulas de uso responsable) que deben revisarse antes de un despliegue comercial; no es una licencia permisiva sin condiciones.
- No se dispone de informacion sobre longitud de contexto efectiva, limites de resolucion de imagen distintos de 1024 x 576, ni sobre el comportamiento con listas cortas de tamano muy distinto a 24, 32 o 48 controles.
- La fecha de creacion del repositorio (2026-10-03) y la referencia a Qwen3.5 y a Claude Sonnet 5.5 corresponden a la informacion publicada por el autor; conviene verificar la disponibilidad real de esos componentes antes de integrarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-ecoverse/kev-0.8b-vision-intent
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo hermano mayor: https://huggingface.co/ai-ecoverse/kev-4b-vision-intent
- Repositorio de kev.js: https://github.com/ai-ecoverse/kev.js
- Pull request de la herramienta `intent`: https://github.com/ai-ecoverse/skills/pull/473
- Dataset Multimodal-Mind2Web: osunlp/Multimodal-Mind2Web (referenciado en la model card; no se proporciona URL directa)
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces encontrados (openai.com, gemini.google.com, chatgpt.com, deepai.org, ai.google) son paginas generales de otros proveedores y no guardan relacion con kev-0.8b-vision-intent.
