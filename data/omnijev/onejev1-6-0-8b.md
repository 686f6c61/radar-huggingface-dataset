# OmniJev/OneJev1.6-0.8B

## Resumen

OneJev1.6-0.8B es un modelo de decisión multimodal de la familia OneJev, desarrollado por el equipo OmniJev, que se presenta como un "System One decision model": recibe una captura de pantalla, una foto, un vídeo o texto plano junto con un conjunto de preguntas tipadas y devuelve una probabilidad calibrada para cada opción en un único forward pass. No es un modelo generativo conversacional al uso, sino un evaluador de opciones orientado a agentes que necesitan decidir el siguiente paso o verificar si una tarea se ha completado.

El modelo parte de Qwen/Qwen3.5-0.8B y se construye promediando los pesos de tres fine-tunes completos entrenados sobre entre 390.000 y 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Con 852.985.920 parámetros (0,85B) y 1,7 GB de pesos en safetensors, se sitúa en el rango de modelos que caben holgadamente en una GPU de consumo.

Su relevancia actual radica en la eficiencia: en la parte pública de Decision Index 0.3 obtiene 48,82 puntos, frente a los 42,71 de OneJev1.5-0.8B, lo que según el autor es la puntuación más alta de cualquier modelo de hasta 2,5B parámetros del tablero, y supera a 47 modelos de 4B parámetros o más. La licencia Apache 2.0 y el pipeline image-text-to-text lo hacen candidato directo para integrarse en bucles de agentes GUI y pipelines de automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5 (tag `qwen3_5`); pesos resultantes del promedio de tres fine-tunes completos |
| Parametros totales | 852.985.920 (0,85B) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en precision completa/original (1,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen/Qwen3.5-0.8B, etiquetada en HuggingFace con el tag `qwen3_5`, y se distribuye mediante la libreria `transformers` con pipeline `image-text-to-text`. La innovacion metodologica principal no esta en la arquitectura sino en el post-entrenamiento: OneJev1.6-0.8B es el promedio de pesos (weight averaging) de tres fine-tunes completos independientes del mismo modelo base, una tecnica de "model soup" que busca fusionar comportamientos aprendidos por separado sin coste de inferencia adicional.

Los datos de entrenamiento proceden de entre 390.000 y 440.000 preguntas generadas a partir de ejecuciones reales de agentes, vídeos, imágenes y de los splits de entrenamiento de conjuntos de datos públicos de decisión. El modelo no genera texto libre: formula preguntas tipadas (`Noul` para verificaciones booleanas, `Choice` para eleccion entre opciones) y emite una probabilidad calibrada por opcion en un solo paso hacia delante, lo que evita la decodificacion autorregresiva y reduce la latencia frente a un LLM que tuviera que "razonar" la respuesta. No se documenta en la informacion disponible si hubo RLHF, DPO u otras etapas de alineacion, ni el numero exacto de tokens de entrenamiento.

## Capacidades

- Decision multimodal: acepta capturas de pantalla, fotografias, video y texto plano como estado de entrada.
- Puntuacion calibrada de opciones: devuelve probabilidades para cada alternativa en un unico forward pass, en lugar de generar una respuesta extensa.
- Verificacion booleana de condiciones, mediante preguntas tipadas del estilo `Noul` ("la factura ha sido pagada").
- Eleccion discreta entre acciones, mediante preguntas tipadas del estilo `Choice` ("hacer clic" o "parar").
- Agente GUI: identificacion del siguiente elemento sobre el que actuar a partir de una captura de pantalla.
- Comprension de video como fuente de estado para la decision.
- API orientada a agentes: el servidor `qev serve` implementa la System One API de TypeSafe mas un campo `media` para imagenes y video.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso autonomos, thinking mode ni soporte multilingue explicito en la informacion disponible.

## Casos de uso

- Automatizacion de navegacion web (agentes GUI): dado un screenshot de la pantalla actual y la tarea en curso, el modelo devuelve la probabilidad de cada accion candidata ("click", "stop"), lo que permite construir bucles de actuacion con umbrales de confianza configurables.
- Verificacion de finalizacion de tareas: en un flujo RPA que debe pagar una factura, el modelo responde a la pregunta "la factura ha sido pagada" con una probabilidad calibrada, lo que sirve como condicion de salida del bucle del agente sin depender de heuristicas fragiles.
- Enrutado de decisiones de bajo coste en produccion: al resolver todas las opciones en un solo forward pass de 0,85B parametros, encaja como componente de decision rapido dentro de un pipeline mayor donde un LLM grande se reserva para la generacion de lenguaje.
- Escalado a supervision humana: las probabilidades calibradas permiten fijar un umbral por debajo del cual el agente delega en una persona, util en flujos con consecuencias economicas o legales.
- Analisis de contenido en video: al aceptar video como entrada, puede puntuar opciones sobre el estado de una escena grabada, por ejemplo si una accion fisica se ha completado o cual es el siguiente paso esperado.
- Control de calidad de agentes existentes: ejecutado en paralelo a un agente en produccion, permite comparar la decision tomada con la distribucion de probabilidad del modelo y detectar trayectorias anomalas.
- Clasificacion de imagenes con opciones cerradas: el pipeline `image-text-to-text` con preguntas tipadas permite usarlo como clasificador de etiquetas multiples con salida probabilistica, sin entrenamiento adicional.

## Benchmarks y rendimiento

La informacion disponible incluye resultados de la parte publica de Decision Index 0.3 (37 benchmarks, 140.178 peticiones, ejecutadas y puntuadas con el kit del propio tablero). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks academicos estandar.

| Modelo | Parametros | Decision Index (parte publica) |
|---|---|---|
| OneJev1.6-0.8B | 0,85B | 48,82 |
| OneJev1.5-0.8B (version anterior) | 0,85B | 42,71 |
| vLLM-SR d3-nano | 2B | 42,22 |
| Sieve 2B v2 | 2B | 37,26 |
| vLLM-SR d3-lite | 0,8B | 36,93 |
| Crivo-150M | 150M | 36,39 |

El autor indica ademas que el modelo lidera su clase en las cinco areas que componen el indice, aunque la informacion disponible no detalla el nombre ni la puntuacion desglosada de cada area. La comparativa frente a modelos mayores del mismo tablero es la siguiente:

| Modelo | Parametros | Decision Index (parte publica) |
|---|---|---|
| OneJev1.6-0.8B | 0,9B | 48,8 |
| decisio 0.4.0 | no disponible | 48,4 |
| Hopper 12B | 12B | 48,3 |
| Decider 35B-A3B | 35B (MoE) | 47,7 |
| JevK5 9B v0.3.3 | 9B | 47,6 |
| Jebadiah 9B v2.1 | 9B | 47,2 |
| JPT 9B | 9B | 47,0 |

La model card menciona tambien una tabla de resultados comparativa frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking sobre el conjunto de test propio de OneJev, pero los valores numericos no estan disponibles en la informacion proporcionada (se publican solo como imagen SVG).

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no dato oficial): en bf16/fp16, aproximadamente 1,7 GB solo de pesos mas cache KV y activaciones; en int8, alrededor de 0,9 GB; en int4, alrededor de 0,5 GB. Los tipos de cuantizacion publicados por el autor no estan disponibles.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia poder ejecutar el modelo en precision reducida; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 son opciones sobredimensionadas pero validas para servir multiples peticiones concurrentes.
- Cabe en GPU de consumo: si, incluida la gama de entrada con 6-8 GB de VRAM, y probablemente tambien en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: la via oficial documentada por el autor es `pip install "qev[torch] @ git+https://github.com/OmniJev/OneJev.git"` seguido de `qev serve --model OmniJev/OneJev1.6-0.8B`, que expone la System One API de TypeSafe con un campo `media`. Tambien es cargable con `transformers`. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible; el modelo lleva el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles como cifras. Cualitativamente, al resolver todas las opciones en un unico forward pass sin decodificacion autorregresiva, la latencia deberia ser sensiblemente inferior a la de un LLM generativo del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index (parte publica) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-0.8B | 0,85B | no disponible | 48,82 | Apache 2.0 | HuggingFace, GitHub, web oficial |
| vLLM-SR d3-nano | 2B | no disponible | 42,22 | no disponible | listado en el tablero Decision Index |
| Sieve 2B v2 | 2B | no disponible | 37,26 | no disponible | listado en el tablero Decision Index |
| vLLM-SR d3-lite | 0,8B | no disponible | 36,93 | no disponible | listado en el tablero Decision Index |
| Crivo-150M | 150M | no disponible | 36,39 | no disponible | listado en el tablero Decision Index |
| Jev-Omni 12B | 12B | no disponible | no disponible | no disponible | citado en la model card |

Los cuatro primeros son, segun el autor, los modelos de hasta 2,5B parametros con mayor puntuacion del tablero ademas del propio OneJev. No se dispone de informacion sobre la licencia, la longitud de contexto ni los formatos de pesos de los modelos comparados.

## Limitaciones y advertencias

- No es un modelo generativo conversacional: su salida son probabilidades sobre opciones predefinidas, no texto libre. No puede usarse como asistente general ni para redactar contenido.
- La calibracion de las probabilidades es una afirmacion del autor; no se han publicado en la informacion disponible estudios independientes que la verifiquen.
- Todos los resultados de Decision Index estan autoevaluados por el equipo OmniJev usando el kit del propio tablero, lo que introduce un sesgo de evaluacion conocido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa ni ecosistema de terceros.
- La longitud de contexto no esta documentada, lo que impide planificar el tamano maximo de screenshot o secuencia de video que admite.
- Los idiomas soportados no estan documentados; se desconoce el comportamiento fuera del ingles.
- No se detalla la composicion exacta del dataset de entrenamiento ni si hubo etapas de alineacion, por lo que no pueden evaluarse sesgos conocidos.
- El promedio de pesos de tres fine-tunes puede producir interferencia entre comportamientos; no se publican ablaciones que comparen el modelo promediado con cada fine-tune individual.
- Al derivar de un modelo base de 0,85B, su conocimiento factual del mundo es limitado; el fine-tune aporta comportamiento de decision, no conocimiento.
- La licencia Apache 2.0 del modelo permite uso comercial, pero la libreria `qev` y los servicios auxiliares se distribuyen en un repositorio aparte cuya licencia debe verificarse de forma independiente.
- El nombre de la System One API esta asociado a TypeSafe; la estabilidad a largo plazo de esa interfaz no esta garantizada en la informacion disponible.
- No se han publicado resultados en benchmarks academicos estandar, lo que dificulta la comparacion con modelos generalistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Organizacion en HuggingFace: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web oficial: https://omnijev.github.io/OneJev/
- Licencia en el repositorio: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Tablero Decision Index 0.3: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper o publicacion tecnica: no disponible
- Demo interactiva: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
