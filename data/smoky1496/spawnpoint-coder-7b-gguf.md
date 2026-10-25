# smoky1496/SpawnPoint-Coder-7B-GGUF

## Resumen

SpawnPoint-Coder-7B-GGUF es la distribución en formato GGUF del modelo SpawnPoint-Coder-7B, un ajuste fino de 7.615.616.512 parámetros (≈7,6 B) publicado por el desarrollador smoky1496 y especializado en una tarea muy concreta: convertir una descripción en lenguaje natural de un videojuego 2D en un diseño estructurado en JSON estricto que la herramienta Spawn Point compila a un proyecto jugable de Godot 4. No es un modelo de propósito general, sino un componente de un pipeline: el autor lo entrena contra los esquemas de su propia biblioteca de componentes, de modo que la salida encaje siempre con el formato que espera el compilador.

El modelo se distribuye con licencia Apache 2.0 y soporta inglés y vietnamita, lo que refleja el contexto del proyecto (el autor documenta ejemplos de prompts en vietnamita). La versión v6 añade diseño de juegos de cartas al estilo deckbuilder, y las versiones anteriores cubrían plataformas, arenas top-down, survivors, bubble shooters, granjas, tower defense y shooters de desplazamiento lateral. La ficha del repositorio indica que el proyecto está terminado y ya no se desarrolla activamente, aunque el modelo y la herramienta siguen disponibles.

Su relevancia ahora es acotada pero clara: demuestra un patrón de ajuste fino de un 7B para salida estructurada verificable (JSON con esquema) en un dominio cerrado, ejecutable en local con Ollama, llama.cpp o LM Studio sobre CPU, GPU AMD o Mac. El autor no especifica el modelo base ni la arquitectura en la información disponible, y no hay resultados de benchmarks estándar (MMLU, HumanEval) publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no especifica el modelo base ni la arquitectura; el recuento de parámetros corresponde a un LLM de ≈7,6 B) |
| Parametros totales | 7.615.616.512 (≈7,6 B), dato de safetensors |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 en este repositorio; existe una variante AWQ en repositorio aparte (SpawnPoint-Coder-7B-AWQ) |
| Idiomas soportados | Inglés (en) y vietnamita (vi) |
| Licencia | Apache 2.0 (ver ficheros LICENSE y NOTICE) |
| Formato de pesos | GGUF (safetensors en el modelo original del que deriva); también AWQ en el repositorio hermano |

Otros datos del repositorio: 587 descargas, 1 like, creado el 2026-10-11 y actualizado el 2026-10-24. El tamaño total del repositorio es de 89,5 GB, muy superior al de los dos ficheros GGUF documentados (≈4,7 GB y ≈8,1 GB), por lo que conviene revisar el listado de ficheros antes de clonar. Etiquetas declaradas: `gguf`, `gamedev`, `godot`, `json`, `spawn-point`, `ollama`, `endpoints_compatible`, `conversational`.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna (tipo de transformer, mecanismo de atención, estrategia de entrenamiento o composición del dataset) más allá de que se trata de un modelo de ≈7,6 B parámetros afinado para generar diseños de juego en JSON conforme a los esquemas de Spawn Point. El autor no documenta el número de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones técnicas de inferencia. Lo que sí describe es el mecanismo de producción: Spawn Point consume el modelo a través de la API compatible con OpenAI de Ollama con salida estructurada por JSON schema, de forma que las respuestas se restringen al esquema esperado.

El ajuste está orientado a la biblioteca de componentes de Spawn Point y a los géneros que esa herramienta compila. Según la model card, la versión v6 incorpora diseño de juegos de cartas (héroe y clase, cartas propias, enemigos y su comportamiento, jefe final); v5.2 detectaba plagas de granja nombradas de pasada y v5.1 héroes nombrados de pasada; v5 añadió shooters de desplazamiento lateral, lectura directa de vietnamita y un formato de respuesta compacto por género.

## Capacidades

- Generación de especificaciones de juego 2D en JSON estricto conforme a los esquemas de Spawn Point (diseño, entidades, componentes, comportamiento).
- Compilación indirecta a proyecto Godot 4 mediante la herramienta Spawn Point (el modelo no escribe GDScript libre).
- Cobertura de géneros concretos: plataformas, arenas top-down, survivors, bubble shooters, granjas, tower defense, shooters de desplazamiento lateral y, desde v6, juegos de cartas tipo deckbuilder.
- Salida estructurada garantizada por JSON schema a través de la API compatible con OpenAI de Ollama.
- Comprensión de prompts en inglés y vietnamita, con respuesta en un formato compacto por género.
- Extracción de entidades mencionadas de pasada en la descripción (por ejemplo, nombres de plagas o de héroes).
- Ejecución local en CPU, GPU AMD o Mac mediante GGUF.
- No documentado: tool calling, function calling, uso como agente multi-paso, visión, audio o modo de razonamiento explícito.

## Casos de uso

- **Prototipado rápido de juegos en Godot 4**: el usuario describe el juego en una frase y el modelo devuelve el JSON de diseño que Spawn Point compila en un proyecto jugable; es el flujo principal documentado (`spawnpoint create "un plataformas de ninjas en el que recoges estrellas"`).
- **Game jams y pruebas de concepto con plazo corto**: al ejecutarse en local y sin coste por token, permite iterar decenas de variantes de diseño en una tarde sobre un portátil, aceptando latencias de decenas de segundos por diseño en CPU.
- **Generación de fixtures JSON para pruebas automatizadas**: los esquemas estrictos permiten producir diseños válidos de forma reproducible e integrarlos en pipelines de CI que verifiquen que el compilador de Godot acepta los ficheros generados.
- **Contenido para deckbuilders**: con Spawn Point 0.4 o superior, el modelo genera el héroe y su clase, el conjunto de cartas, los enemigos con su comportamiento de combate y el jefe, lo que sirve para generar variantes de un juego de cartas ya existente.
- **Talleres y docencia de diseño de juegos**: el JSON intermedio es legible y editable, lo que permite usarlo en clase para discutir cómo se traduce una idea abstracta en componentes concretos de un motor.
- **Equipos bilingües inglés-vietnamita**: el soporte nativo de vietnamita evita tener que pasar por una capa de traducción intermedia al describir el juego, algo útil en estudios con equipos repartidos entre ambos idiomas.
- **Herramientas internas de ideación vía API**: etiquetado como `endpoints_compatible` y accesible por API compatible con OpenAI, puede conectarse a un editor propio o a un chatbot interno que devuelva siempre JSON válido en lugar de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni pruebas equivalentes. El autor solo reporta una evaluación propia, no estandarizada, sobre su tarea:

| Metrica | Conjunto de evaluacion | Resultado | Condiciones |
|---|---|---|---|
| Ideas de juego generadas correctamente | 30 ideas de juego escritas por humanos (inglés y vietnamita) | 83 % completamente correctas | Build Q4_K_M servida con Ollama |
| Prompts de juegos de cartas correctos | 16 prompts sellados de juegos de cartas | 88 % | Build Q4_K_M servida con Ollama |

Estos porcentajes miden si el diseño generado es válido y completo para el pipeline de Spawn Point, no calidad general del modelo. No hay datos de latencia o throughput más allá de la indicación cualitativa de "decenas de segundos por diseño" en CPU.

## Requisitos de hardware

- **Q4_K_M (≈4,7 GB de fichero)**: opción por defecto para portátiles, CPU y GPU de gama media. Estimación orientativa de 6-7 GB de memoria (VRAM o RAM unificada) incluyendo contexto y overhead del runtime; cifra no publicada por el autor.
- **Q8_0 (≈8,1 GB de fichero)**: la más cercana al modelo completo; estimación orientativa de 9-11 GB de memoria. Encaja en GPU de 12 GB o más y en Mac con memoria unificada de 16 GB.
- **GPU de consumo**: cabe en tarjetas de 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB) con la cuantización Q4_K_M; en 8 GB conviene vigilar la longitud de contexto. Con Q8_0 se recomienda 12 GB o más.
- **GPU de datacenter**: no se documentan requisitos ni rendimiento en A100/H100; al ser un 7B cuantizado, estas GPU no son necesarias para el caso de uso previsto.
- **CPU y Mac**: soportado explícitamente; el autor indica latencias de decenas de segundos por diseño en CPU. En Apple Silicon se usa Metal a través de llama.cpp/Ollama.
- **AMD**: soportado mediante llama.cpp/Ollama (ROCm o Vulkan).
- **Despliegue**: Ollama (`ollama run hf.co/smoky1496/SpawnPoint-Coder-7B-GGUF:Q4_K_M`), llama.cpp, LM Studio y la herramienta Spawn Point (`pip install spawnpoint-studio`; `spawnpoint llm up` descarga el build Q4_K_M en Ollama cuando no hay GPU NVIDIA).
- **Throughput y latencia**: no disponibles de forma cuantitativa; solo la referencia cualitativa del autor para CPU.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada: no hay resultados de benchmarks estándar ni especificaciones del modelo base, y no se conocen en esta ficha otros ajustes finos de 7B publicados para generación de proyectos Godot con JSON estricto. La comparación más útil disponible es entre las propias variantes del modelo:

| Variante | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| SpawnPoint-Coder-7B-GGUF Q4_K_M | ≈7,6 B | No disponible | GGUF | Apache 2.0 | Ollama, portátiles, CPU (por defecto) |
| SpawnPoint-Coder-7B-GGUF Q8_0 | ≈7,6 B | No disponible | GGUF | Apache 2.0 | Máxima fidelidad al modelo completo, más memoria |
| SpawnPoint-Coder-7B-AWQ | ≈7,6 B | No disponible | AWQ | Apache 2.0 | Despliegue con GPU y cuantización de 4 bits para serving |

Frente a un 7B generalista, la diferencia relevante no es de parámetros sino de ajuste: según el autor, fuera de los géneros que cubre su biblioteca de componentes, el modelo "no es mejor que un 7B general" y el código libre no es su terreno. Los datos de contexto, rendimiento y licencia de posibles alternativas no están disponibles en la información facilitada.

## Limitaciones y advertencias

- **Alcance muy restringido**: solo rinde en los géneros 2D que Spawn Point compila (plataformas, arenas top-down y survivors, bubble shooters, granjas, tower defense, shooters laterales y juegos de cartas). Otros géneros y la programación libre no superan a un 7B genérico, según el propio autor.
- **Dependencia de la herramienta**: para juegos de cartas requiere Spawn Point 0.4 o superior; el resto de géneros, 0.3 o superior. Sin el compilador, la salida JSON no produce un juego.
- **Proyecto descontinuado**: el autor declara Spawn Point terminado y sin desarrollo activo; solo reabriría el trabajo si llegan peticiones reales por Discussions. No cabe esperar correcciones de errores ni nuevas versiones.
- **Latencia en CPU**: decenas de segundos por diseño, lo que descarta flujos interactivos en tiempo real sobre hardware sin GPU.
- **Idiomas limitados**: solo inglés y vietnamita; no hay soporte declarado de castellano, por lo que los prompts en español quedan fuera del entrenamiento previsto.
- **Contexto desconocido**: no se publica la longitud de contexto, un dato crítico para encadenar descripciones largas o muchos turnos de conversación.
- **Riesgo de alucinación**: puede inventar entidades o componentes que no existen en la biblioteca; la salida estructurada por JSON schema reduce el riesgo de formato inválido, pero no garantiza que el diseño sea coherente o jugable.
- **Sesgos**: no documentados por el autor; no hay evaluación de sesgos ni de comportamientos indeseados.
- **Licencia**: Apache 2.0 permite uso comercial, pero deben conservarse LICENSE y NOTICE; conviene revisar el contenido de NOTICE por si impone atribuciones adicionales derivadas del modelo base, que no se identifica en la información disponible.
- **Tamaño del repositorio**: 89,5 GB declarados frente a los ≈12,8 GB de los dos GGUF documentados; verificar los ficheros antes de descargar para no consumir disco innecesariamente.
- **Sin benchmarks estándar**: no hay datos de MMLU, HumanEval o GSM8K que permitan situar el modelo frente a alternativas; la única métrica es la evaluación interna del autor sobre su propia tarea.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-GGUF
- Repositorio HuggingFace del modelo AWQ: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-AWQ
- Discusiones del modelo (el autor las usa para valorar retomar el proyecto): https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-GGUF/discussions
- Repositorio GitHub de la herramienta Spawn Point: https://github.com/leluong141996-dev/Spawn-Point
- Retrospectiva del autor (qué construyó y por qué lo abandonó): https://github.com/leluong141996-dev/Spawn-Point/blob/main/docs/retrospective.md

Nota: los resultados de la búsqueda web proporcionados corresponden a páginas genéricas de servicios de Google (Chrome, Flights, Translate, Maps, Trends) y no guardan relación con el modelo; no se han incluido como enlaces relevantes. No se han encontrado en esa búsqueda papers, blogs ni demos adicionales del modelo.
