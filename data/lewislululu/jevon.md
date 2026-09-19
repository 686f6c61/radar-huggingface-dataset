# lewislululu/jevon

## Resumen

Jevon es un modelo de decisión de 20.105.047 parámetros (aproximadamente 20M) desarrollado por el usuario lewislululu y publicado en HuggingFace bajo el identificador `lewislululu/jevon`. No es un modelo de lenguaje: no genera texto ni decodifica tokens. Su función es responder preguntas tipadas sobre un tablero de rejilla ("¿hacia dónde debo moverme?", "¿está libre el norte?", "¿a qué distancia está el objetivo?") devolviendo distribuciones de probabilidad calibradas sobre un conjunto cerrado de candidatos.

El modelo es una reimplementación desde cero de la idea de NanoJev (a su vez una replicación abierta y reducida de Jev, de TypeSafe AI) y conserva su interfaz de tres primitivas —`Choice`, `Score` y `Boolean`—, pero sustituye el backbone original por uno nuevo orientado a resolver la principal deficiencia del original: la profundidad de planificación en laberintos. El dominio de evaluación son dos juegos de rejilla: Maze (cuatro topologías, tamaños de 11 a 51) y Snake (tamaños de 8 a 24).

Su relevancia actual es fundamentalmente como artefacto de investigación: demuestra que un modelo de 20M de parámetros con el sesgo estructural adecuado resuelve tareas de planificación en rejilla que un backbone tipo transformer de tamaño similar no consigue, y lo hace con calibración explícita y sin decodificación autorregresiva. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el 19 de septiembre de 2026. La model card está truncada en la información proporcionada, por lo que algunos detalles de entrenamiento y secciones posteriores no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de iteración de valor (value-iteration-network) con cabezas de decisión tipadas; no es un transformer de lenguaje ni un MoE |
| Parametros totales | 20.105.047 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; la entrada es un estado de tablero y preguntas tipadas) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en fp32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | AGPL-3.0-or-later, con opción de licencia comercial (fichero `COMMERCIAL-LICENSE.md`) |
| Formato de pesos | PyTorch `.pt` (checkpoint `runs/jevon-final/balanced.pt`, 80 MB en fp32, servido vía Git LFS) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | reinforcement-learning |
| Tarea / dominio | Maze y Snake (grid-world), planificación |
| Métrica declarada | accuracy |
| Dispositivo de inferencia | CUDA, MPS o CPU (selección automática: cuda → mps → cpu) |
| Pasos de entrenamiento | 9.000 |
| Hardware de entrenamiento | un Apple M4 Max |

## Arquitectura y entrenamiento

Jevon parte de la interfaz de NanoJev, compuesta por tres primitivas de pregunta: `choice` (selección entre acciones candidatas), `boolean` (verdadero/falso sobre propiedades del estado, como `clear_west` o `solvable`) y `score` (valor numérico, como `distance`). Lo que cambia respecto al original es el backbone, rediseñado explícitamente en torno a la profundidad de planificación, que es donde NanoJev fallaba en Maze.

El mecanismo concreto es una codificación única del estado y del tablero sobre la que las preguntas hacen cross-attention: una sola pasada hacia delante responde simultáneamente a todas las preguntas que el estado ofrece (`action`, los cuatro booleanos `clear_*`, `distance` y `solvable`). Esto implica que el coste de cómputo no escala con el número de preguntas planteadas. Además, el modelo expone directamente un campo de distancia (`distance_field`) de forma (21, 21) que, según la model card, coincide con la distancia de camino más corto tipo BFS salvo por un factor de escala global: reescalado por una única constante, el error es de 0,0096 celdas. El propio autor advierte que esta propiedad es consecuencia de la recurrencia y no debe interpretarse como un resultado de entrenamiento, y que el número honesto para comparar es la fila `model` de las tablas.

El entrenamiento se realizó desde cero durante 9.000 pasos en una única Apple M4 Max, con un conjunto de datos generado que dibuja un tablero nuevo por cada estado; eso es lo que hace que el recuento de tableros (`boards`) sea prácticamente igual a `n` en las tablas de evaluación. La model card menciona particiones de evaluación congeladas y que las tablas se generan automáticamente desde JSON, con un test de `pytest` que falla si la documentación y los datos divergen. No se detallan en la información disponible la composición exacta del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas más allá del campo de distancia y la codificación compartida.

## Capacidades

- Respuesta a preguntas tipadas de selección (`choice`) sobre acciones en rejilla, con distribución de probabilidad sobre los candidatos y sin decodificación de tokens.
- Respuesta a preguntas booleanas (`boolean`) sobre el estado: `clear_north`, `clear_south`, `clear_east`, `clear_west`, `solvable`.
- Estimación de magnitudes (`score`), en particular `distance` al objetivo.
- Respuesta conjunta a todas las preguntas ofrecidas por un estado en una única pasada hacia delante, gracias a la codificación única de estado y tablero con cross-attention de las preguntas.
- Omisión semántica de preguntas sin sentido: una celda con una sola salida no plantea elección y no se formula la pregunta `action`.
- Exposición directa del campo de distancia como matriz (21, 21) utilizable para descenso greedy hacia el objetivo.
- Planificación en laberintos de cuatro topologías y tamaños entre 11 y 51.
- Juego de Snake en tableros de tamaño 8 a 24.
- Probabilidades calibradas (la model card incluye tablas de calibración en `RESULTS.md`).
- Inferencia en CUDA, MPS y CPU.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente multi-paso en el sentido de un LLM, ni capacidades multilingües, de visión o de audio.

## Casos de uso

- Investigación sobre iteración de valor amortiguada: el modelo es un banco de pruebas reproducible para estudiar cómo una red aprende a aproximar el operador de iteración de valor, con particiones de evaluación congeladas y tablas verificadas por tests. La model card lo describe explícitamente como artefacto de investigación.
- Estudio de cabezas de decisión tipadas: sirve para analizar el diseño de salidas estructuradas (`choice`/`boolean`/`score`) frente a la decodificación de texto libre, comparando calibración por tipo de pregunta.
- Benchmark de sesgos estructurales en planificación: al compararlo con backbones tipo transformer del mismo orden de parámetros, permite aislar el efecto del prior arquitectónico en tareas de laberinto, que es la motivación declarada del proyecto.
- Navegación en rejilla embebida: el campo de distancia expuesto permite implementar políticas greedy de camino más corto en entornos de rejilla discretos sin ejecutar BFS explícito en tiempo de ejecución, útil en simuladores o prototipos de robótica de rejilla.
- Docencia y demostración interactiva: el repositorio `jevon-arcade` ejecuta los tableros de Maze y Snake en el navegador mientras el modelo decide, con una pasada hacia delante por paso, lo que lo hace apto para clases y talleres sobre planificación y RL.
- Reproducción de resultados con poco hardware: entrenado en una sola Apple M4 Max y con un checkpoint de 80 MB, es viable reproducir el pipeline completo o hacer fine-tuning en una máquina de sobremesa, sin clúster.
- Evaluación de robustez y calibración: la estructura de datos (`n`, `boards`, control uniforme) permite medir desviaciones de calibración y comparar contra un control aleatorio trivial, útil para metodología experimental.
- Componente de planificación de bajo coste: por su tamaño (20M de parámetros, 80 MB), puede integrarse como módulo de decisión en un sistema mayor con restricciones severas de memoria, sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

Datos publicados en la model card, generados desde JSON de evaluación. La columna `boards` es el número de tableros distintos y es prácticamente igual a `n` porque el generador dibuja un tablero nuevo por estado.

Precisión de decisión (partición `test` retenida), frente a control uniforme:

| Pregunta | n | Tableros | Precisión | Control uniforme |
|---|---:|---:|---:|---:|
| `maze/choice` | 141 | 140 | 1,0000 | 0,4882 |
| `snake/choice` | 92 | 92 | 0,9674 | 0,4783 |

Maze, 36 episodios sobre distintas topologías y tamaños:

| Controlador | Tasa de resolución | Eficiencia | Celdas visitadas |
|---|---:|---:|---:|
| `model` (solo la red) | 1,00 | 1,000 | 94,2 |
| `model-field` (arquitectural) | 1,00 | 1,000 | 94,2 |
| `random` (suelo) | 0,14 | 0,068 | 92,2 |
| `reference` (BFS) | 1,00 | 1,000 | 94,2 |

Snake, 6 episodios:

| Controlador | Comida media | Comida máxima | Supervivencia |
|---|---:|---:|---:|
| `model` | 4,50 | 16 | 1,00 |
| `random` (suelo) | 0,67 | 2 | 0,00 |
| `reference` (oráculo) | 23,50 | 31 | 1,00 |

Además, la model card indica que el campo de distancia del planificador, reescalado por una constante global única, coincide con BFS con un error de 0,0096 celdas en el tablero de ejemplo. No hay benchmarks de tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint son 80 MB en fp32 (20,1M de parámetros × 4 bytes). La huella en memoria es muy reducida; con activaciones y estructuras auxiliares, cualquier GPU con más de 1 GB de memoria libre es suficiente en la práctica.
- GPU recomendadas: no se especifican requisitos mínimos. Dado el tamaño, cualquier GPU NVIDIA con soporte CUDA es válida, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo selecciona dispositivo automáticamente en el orden CUDA → MPS → CPU.
- Compatibilidad con hardware de consumo: sí, con amplio margen. Cabe en cualquier GPU de consumo y también en Apple Silicon vía MPS. El entrenamiento de referencia se completó en una sola Apple M4 Max, lo que da una idea del orden de magnitud de los requisitos.
- Opciones de despliegue: el paquete Python propio (`from jevon import from_pretrained`) con PyTorch y `huggingface_hub` como dependencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo que no decodifica texto. El repositorio `jevon-arcade` ofrece una interfaz web para visualizar las partidas.
- Latencia y throughput: no disponibles en la información proporcionada. La model card sí indica que una sola pasada hacia delante responde a todas las preguntas ofrecidas por el estado, y que en `jevon-arcade` se ejecuta una pasada por paso.
- Carga del modelo: `from_pretrained` descarga únicamente la configuración, el tokenizer y un checkpoint (unos 80 MB), no el repositorio completo, y los cachea en `~/.cache/huggingface`. También acepta un directorio de ejecución local.

## Comparativa con modelos similares

La información proporcionada no incluye tablas comparativas con otros modelos, por lo que los datos cuantitativos de las alternativas figuran como no disponibles.

| Modelo | Parámetros | Dominio | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Jevon | 20.105.047 | Maze (11–51), Snake (8–24) | AGPL-3.0-or-later o comercial | HuggingFace `lewislululu/jevon` + `jevon-arcade` | Precisión `maze/choice` 1,0000; `snake/choice` 0,9674 |
| NanoJev | no disponible | Grid-world / primitivas Jev | no disponible | GitHub `TianyuCodings/NanoJev` | Referencia de la que Jevon parte; la model card indica que NanoJev fallaba en Maze por falta de profundidad de planificación, sin cifras disponibles |
| Jev (TypeSafe AI) | no disponible | Decisiones tipadas | no disponible | `typesafe.ai` | Origen conceptual del diseño; sin cifras comparativas disponibles |
| Backbone tipo transformer de tamaño similar | ~20M | Planificación en rejilla | no aplica | no aplica | La model card afirma que no resuelve el problema, pero no se aportan números concretos |

## Limitaciones y advertencias

- Modelo de propósito restringido: no es un modelo de lenguaje. No genera texto, no responde a instrucciones en lenguaje natural y no soporta tool calling, agentes conversacionales ni capacidades multilingües.
- Ámbito de validación muy estrecho: los resultados se limitan a Maze (cuatro topologías, tamaños 11–51) y Snake (8–24). No hay evidencia de generalización a otros dominios de rejilla, tamaños fuera de ese rango o problemas de planificación continuos.
- Volumen de evaluación pequeño: la partición de test contiene 141 preguntas de `maze/choice` y 92 de `snake/choice`, y los episodios de juego son 36 (Maze) y 6 (Snake). Son muestras reducidas, con intervalos de confianza amplios, especialmente en Snake.
- Advertencia explícita del autor sobre el campo de distancia: la coincidencia con BFS es una propiedad de la recurrencia y no un resultado de entrenamiento; el autor pide no interpretarla como tal y remite a la fila `model` como comparación justa.
- Riesgo de alucinación: no aplica en el sentido clásico de generación de texto, pero sí existe riesgo de decisiones o estimaciones de distancia incorrectas en estados fuera de la distribución de entrenamiento.
- Ausencia de datos sobre sesgos, composición del dataset, proceso de alineación (RLHF/DPO) y análisis de robustez en la información disponible.
- Licencia AGPL-3.0-or-later: impone obligaciones de copyleft sobre obras derivadas distribuidas y sobre el uso en servicios en red. Para uso propietario o comercial cerrado es necesario obtener la licencia comercial indicada en `COMMERCIAL-LICENSE.md`.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción prácticamente nula y ausencia de validación independiente por terceros.
- La model card proporcionada está truncada a partir de la sección "Intended use, and what this is not", por lo que parte de las advertencias del autor y de los detalles de uso previsto no están disponibles.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; todos los enlaces encontrados eran ajenos al tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lewislululu/jevon
- Repositorio del visor de partidas (jevon-arcade): https://github.com/lewislulu/jevon-arcade
- NanoJev (implementación de referencia previa): https://github.com/TianyuCodings/NanoJev
- TypeSafe AI (origen del diseño Jev): https://typesafe.ai
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo; los resultados devueltos eran ajenos al contenido.
