# danger-room/MadStickArt-v0.1.0

## Resumen

MadStickArt-v0.1.0 es un modelo de imagen a imagen de arquitectura propia y tamano muy reducido, desarrollado por danger-room, que rasteriza storyboards de ciencia ficcion con figuras de palo a partir de una representacion de layout. Con solo 12.192 parametros aprendidos, genera escenas a 956 × 400 pixeles (relacion exacta 2,39:1) partiendo de cuatro canales gruesos de tinta. No es un modelo generativo de difusion ni un transformer de lenguaje: es un decodificador convolucional residual entrenado desde cero con supervision sintetica de layout a imagen.

El problema que resuelve es el del storyboarding rapido y el blocking espacial: dada una descripcion de beat, plano, staging, angulo y movimiento de camara, produce un fotograma limpio en escala de grises con cobertura de tinta, numeracion secuencial y metadatos opcionales. Incluye un pipeline de escena reutilizable que acepta beats narrativos y controles de composicion; un planner opcional, Strands Decider 2B, selecciona los controles que falten, mientras que la geometria explicita la aporta un layout procedural.

Su relevancia actual es acotada pero clara: es una release publica inicial (v0.1.0), con licencia Apache 2.0, pesos en safetensors, soporte de Apple Silicon via MPS y un playground en Spaces. Al tener 12.192 parametros, la inferencia es trivial en CPU o MPS, y el unico componente pesado del ecosistema es el planner Strands, que no forma parte del rasterizador ni se distribuye con estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador convolucional residual de baja resolucion con PixelShuffle x4 (arquitectura propia) |
| Parametros totales | 12.192 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen `[batch, 4, 100, 239]` |
| Tipos de cuantizacion | no disponible; pesos en float32 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); checkpoint CLI compatible `best.pt` (carga con `weights_only=True`) |
| Entrada | 4 canales de mascaras de tinta float32: actores, escenario, props, movimiento |
| Salida | Cobertura de tinta `[batch, 1, 400, 956]`, convertida a pixeles en escala de grises |
| Resolucion por defecto | 956 × 400 (relacion exacta 239:100) |
| Pipeline | image-to-image |
| Desarrollador | danger-room |
| Release | v0.1.0 |

## Arquitectura y entrenamiento

El modelo es un decodificador neuronal condicionado por layout. Aprende una correccion sobre la union bilineal de los cuatro canales de tinta de entrada: sus convoluciones aprendidas operan sobre la rejilla gruesa de entrada y la salida se sobremuestrea con PixelShuffle x4 hasta 956 × 400. Acepta rejillas de entrada flexibles, aunque el entrenamiento y la evaluacion de esta release usan 956 × 400. Los pesos aprendidos son 12.192 en float32 y el checkpoint principal es `model.safetensors`.

El entrenamiento se realizo desde cero con supervision sintetica de layout a imagen (dataset sintetico de titulos de ciencia ficcion de MadStickArt). No se documenta en la informacion disponible el numero de tokens ni de imagenes, la composicion detallada del dataset, ni el uso de RLHF o DPO. Strands Decider 2B es un planner separado y opcional que responde preguntas tipadas de seleccion de controles; no es ancestro del rasterizador ni un componente de pesos incluido en este repositorio. La numeracion y los metadatos de escena se dibujan con un overlay de texto determinista, no con el decodificador.

## Capacidades

- Rasterizacion condicionada por layout: convierte cuatro canales de tinta (actores, escenario, props, movimiento) en una imagen de cobertura de tinta en escala de grises.
- Generacion de storyboards de ciencia ficcion con figuras de palo a 956 × 400 pixeles.
- Control explicito de composicion y camara mediante vocabulario cerrado (ver tabla de controles mas abajo).
- Numeracion secuencial de escenas y metadatos de produccion mediante overlay de texto determinista.
- Exportacion por fotograma: PNG limpio, PNG anotado y sidecar JSON con metadatos originales, decisiones, confianza, estado de fallback y tiempos.
- Planner opcional Strands Decider 2B para seleccionar controles de escena no especificados; alternativa de planner determinista por reglas u offline.
- Soporte de Apple Silicon (MPS) para el decodificador y backend MLX/CPU para el planner.
- No genera texto, codigo ni matematicas; no soporta tool calling ni function calling; no implementa razonamiento multi-paso ni uso de agentes.
- No dispone de vision general, audio ni modos de "thinking".
- Idiomas: unicamente en para descripciones y decisiones de escena (segun el campo `language`).

Controles de escena soportados:

| Control | Vocabulario |
|---|---|
| Plano (shot) | establishing, wide, medium, close_up, over_shoulder |
| Punto focal | left, center, right |
| Staging | single, two_shot, group, foreground_background |
| Angulo de camara | eye_level, low, high |
| Movimiento de camara | static, pan_left, pan_right, tilt_up, tilt_down, dolly_in, dolly_out, tracking |
| Escenario | interior, street, forest, desert, space, waterfront |
| Accion | stand, walk, r... (lista truncada en la informacion disponible) |

## Casos de uso

- Storyboarding rapido para produccion audiovisual: a partir de un fichero JSONL de beats (por ejemplo `examples/scifi-storyboard.jsonl`), el pipeline genera un fotograma por escena con el plano, staging y angulo indicados. Es adecuado porque el coste de inferencia es minimo (12.192 parametros) y el resultado se obtiene en un paso, sin difusion iterativa.
- Blocking espacial y planificacion de planos: el modelo acepta colocaciones exactas de actores y staging (single, two_shot, group, foreground_background), lo que permite iterar sobre la posicion de los personajes en el encuadre antes de producir material definitivo.
- Previsualizacion de escenas de ciencia ficcion: con los escenarios interior, street, forest, desert, space y waterfront, sirve para prototipar rapidamente ambientaciones de guiones de ciencia ficcion.
- Prototipado de lenguaje de camara: gracias al control explicito de angulo (eye_level, low, high) y movimiento (pan, tilt, dolly, tracking), permite ensayar decisiones de puesta en escena y comprobar como cambia la composicion.
- Documentacion de guiones con trazabilidad: cada fotograma se acompana de un PNG anotado y un JSON sidecar que registra metadatos originales, decisiones, confianza y fallbacks, lo que facilita auditar y versionar el pipeline.
- Generacion por lotes de secuencias completas: mantener viva una instancia de modelo y pipeline permite generar muchos fotogramas de forma consecutiva, con numeracion secuencial automatica y exportacion limpia sin texto.
- Uso en navegador sin descarga: el playground de Spaces permite componer escenas, ajustar controles y exportar PNG limpio o anotado y JSON antes de instalar el paquete, util para revisiones con equipo no tecnico.
- Integracion en pipelines de previz internos: al cargar via `load_from_pretrained` con un `SceneSpec` y `predict_image`, se puede embeber en herramientas de Python que automaticen la generacion de tableros.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por Hugging Face; campo `verified: false` en el model-index) sobre el dataset sintetico propio "MadStickArt synthetic sci-fi title holdout (279 scenes)":

| Metrica | Dataset | Valor |
|---|---|---|
| Foreground IoU (umbral de tinta 0,35) | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,8362 |
| Foreground precision | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,8639 |
| Foreground recall | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,9631 |
| Pixel mean absolute error (MAE) | MadStickArt synthetic sci-fi title holdout (279 escenas) | 0,006018 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de referencia.

## Requisitos de hardware

- Huella del modelo: 12.192 parametros en float32 equivalen a aproximadamente 48 KB de pesos. El repositorio figura como 0,0 GB.
- VRAM estimada: practicamente nula; cabe en CPU y en Apple MPS sin necesidad de GPU dedicada.
- GPU recomendadas: no requiere GPU. Funciona con `--device cpu` o `--device mps` (Apple Silicon). Cualquier GPU consumer, como una RTX 4090, es mas que suficiente y resultaria sobredimensionada.
- Cabe en consumer GPU: si, en cualquier GPU consumer; tambien en CPU y en Apple Silicon via MPS.
- Planner opcional (Strands Decider 2B): en Apple Silicon, el primer uso descarga su adaptador separado y aproximadamente 4,5 GB de pesos base de Qwen en `.cache/huggingface`. No requiere GPU dedicada si se usa el backend CPU (`--planner-device cpu`) o el planner por reglas offline (`--planner rules`).
- Opciones de despliegue: paquete propio `madstick` (instalacion con `uv sync --locked --extra planner` o `pip install .`); carga con `madstick.hub.load_from_pretrained`; CLI `madstick storyboard`. No es compatible con Transformers/Diffusers `pipeline()`, ni se ofrece servicio de inferencia alojado propio; solo el Space de playground.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (rasterizadores condicionados por layout para storyboards con figuras de palo). Strands Decider 2B se menciona como planner opcional del ecosistema, pero no es una alternativa al rasterizador ni un modelo de la misma tarea.

## Limitaciones y advertencias

- Modelo de nicho y muy pequeno: 12.192 parametros implican capacidad expresiva limitada, orientada a figuras de palo y estilos de storyboard simples; no es un generador de imagenes fotorrealistas.
- Dominio restringido a ciencia ficcion y a un vocabulario cerrado de controles (planos, staging, angulos, escenarios y acciones enumerados).
- Especifico de una tarea: solo image-to-image condicionado por layout; no genera texto, codigo, matematicas, audio ni vision general.
- Idiomas: unicamente en; no hay soporte multilingue confirmado.
- No hay API de `pipeline()` de Transformers/Diffusers: requiere el paquete propio `madstick`, lo que limita la integracion con ecosistemas estandar de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Riesgo de alucinacion: no aplica en el sentido de texto, pero el decodificador puede producir geometrias de tinta imprecisas o artefactos en rejillas distintas a la de entrenamiento (956 × 400).
- Benchmarks no verificados: los valores de IoU, precision, recall y MAE son declarados por el autor y marcados como `verified: false`; ademas proceden de un holdout sintetico propio de 279 escenas, no de un benchmark externo.
- Dependencia opcional del planner: Strands Decider 2B descarga pesos Qwen de aproximadamente 4,5 GB en el primer uso en Apple Silicon; si se quiere evitar, hay que elegir el planner por reglas o el backend CPU.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes externos opcionales (planner Strands y pesos base Qwen) por separado.
- Repositorio con muy poca traccion: 25 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danger-room/MadStickArt-v0.1.0
- Playground (Space): https://huggingface.co/spaces/danger-room/MadStickArt-Playground

Nota: los resultados de busqueda web disponibles no aportan enlaces relevantes sobre el modelo; consisten en definiciones de diccionario de la palabra francesa "danger" y no se han incluido por no ser pertinentes. No se han encontrado papers, blogs ni repositorios adicionales en la informacion proporcionada.
