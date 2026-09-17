# NewSonnet/flychess

## Resumen

`flychess` es un experimento de código abierto publicado por el usuario NewSonnet en HuggingFace que conecta un modelo de cerebro de mosca de la fruta (Drosophila) con el juego del ajedrez, usando Stockfish como oponente clásico. No es un modelo de lenguaje ni un transformer: es un paquete Python con un contrato sensorial estable para un tablero de 8x8, una política recurrente determinista denominada `SurrogateFlyBrain`, un backend de conectoma basado en listas de aristas en JSON y un adaptador de ajedrez que valida la legalidad de las jugadas mediante `python-chess`. La relevancia actual es acotada y muy específica: sirve como banco de pruebas reproducible para investigar cómo se traduce un diagrama de cableado neuronal en una política de decisión, sin confundir esa ingeniería con biología real.

El repositorio incluye un bucle de partida por línea de comandos con límite de jugadas, grabación de repeticiones en JSONL, una interfaz web local con API HTTP y un panel de lectura de decisión que muestra hasta cinco candidatos legales con sus puntuaciones de política. Además incorpora un importador de calibración MaleCNS con bloqueo de procedencia para subgrafos filtrados, un backend de dinámica LIF (leaky integrate-and-fire) dispersa con signo, y un runtime opcional para cargar el artefacto público ChessFly/FlyWire (`connectome.bin.gz`, `neurons.bin.gz`, `flynet.safetensors`).

El propio autor delimita explícitamente el alcance científico: un conectoma simulado no es una mosca viva y una demo que juega al ajedrez no es evidencia de conciencia ni de equivalencia biológica. La model card indica que las dinámicas neuronales calibradas, la señalización química, la transducción sensorial y la semántica motora todavía deben aportarse. No se publican parámetros, datos de entrenamiento, métricas de rendimiento ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente sobre grafo conectómico, con backend de dinámica LIF dispersa con signo; política surrogate determinista (`SurrogateFlyBrain`) sustituible por backend MaleCNS/FlyWire. No es un transformer |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no hay ventana de tokens. La entrada es una codificación de 780 características del tablero de 8x8 más estado recurrente |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`flynet.safetensors`), grafos binarios comprimidos (`connectome.bin.gz`, `neurons.bin.gz`) y conectomas en JSON de lista de aristas |
| Espacio de acciones | 1.968 acciones (adaptador ChessFly/FlyWire) |
| Pasos de dinámica | 5 pasos calibrados en el adaptador ChessFly; configurable con `--neural-steps` en el backend de conectoma |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-17 (fecha posterior a la actual; posible anomalia de metadatos) |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón transformer. El núcleo es una política recurrente determinista que opera sobre una representación del tablero de 8x8 (contrato sensorial estable de 780 características en el adaptador ChessFly, con espejado cuando la mosca juega con negras). El backend de conectoma acepta un grafo en formato JSON de lista de aristas, lo valida, y ejecuta propagación dispersa mediante CSR por fila de destino con dinámica LIF dispersa y consciente del signo. La selección de jugada se restringe después con una máscara de legalidad calculada fuera del modelo, delegando la validez formal de la jugada a `python-chess`. El adaptador para el artefacto público ChessFly/FlyWire replica la codificación de 780 características, el espejado en turno de negras, el espacio de 1.968 acciones, la propagación CSR por fila objetivo, cinco pasos calibrados, las cabezas decodificadoras y la máscara legal posterior a la lectura.

No se documenta ningún proceso de entrenamiento: no hay número de tokens, composición de dataset, ni etapas de RLHF, DPO o ajuste por refuerzo. El autor explica que el conectoma aporta únicamente un diagrama de cableado, y que las dinámicas calibradas, la señalización química, la transducción sensorial y la semántica motora aún deben suministrarse. La hoja de ruta declarada incluye ajustar los parámetros de dinámica expuestos contra objetivos funcionales reservados, alinear anotaciones MaleCNS con tipos celulares y morfología FlyWire sin fusionar los conectomas crudos de macho y hembra, sustituir la proyección sensorial genérica por una interfaz de fotorreceptores documentada, reemplazar el hash de salida genérico por una lectura neuronal calibrada y específica del experimento, y añadir experimentos condicionados por recompensa con controles congelados y barajados antes de formular cualquier afirmación sobre aprendizaje o habilidad ajedrecística. La innovación técnica destacable, en la práctica, es el diseño de interfaz: la política es intercambiable sin tocar las capas de juego ni de motor.

## Capacidades

- Selección de jugadas legales de ajedrez sobre un tablero de 8x8, con validación delegada a `python-chess`.
- Lectura de decisión acotada: hasta cinco candidatos legales con sus puntuaciones de política, la jugada seleccionada y métricas compactas de actividad.
- Simulación de dinámica neuronal LIF dispersa con signo sobre subgrafos de conectoma importados.
- Carga y validación de conectomas en JSON de lista de aristas como backend de política.
- Integración con un oponente real Stockfish vía protocolo UCI, con profundidad de búsqueda y número de medias jugadas configurables.
- Grabación de repeticiones en JSONL (`--record`) con resultado final en JSON (`--result`), y pruebas que cubren validación de grafo, manipulación de repeticiones, límites HTTP e integración con el motor.
- Interfaz web local servida en `127.0.0.1` con `POST /api/game/start` y sondeos `GET /api/state` para seguir una partida en directo.
- Runtime opcional y compatible con el artefacto público ChessFly/FlyWire, incluyendo `win_probability` y `last_readout` como telemetría de política.
- Importador de calibración MaleCNS con procedencia bloqueada para subgrafos filtrados.
- Posiciones de inicio arbitrarias mediante FEN y semilla reproducible para la política surrogate.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas, visión, audio, tool calling, function calling ni capacidades multilingües.

## Casos de uso

- Investigación en neurociencia computacional: sustituir la política surrogate por un backend MaleCNS/FlyWire real manteniendo intactas las capas de juego y de motor, gracias a que la interfaz de política está diseñada explícitamente para ese reemplazo.
- Evaluación de arquitecturas bio-inspiradas frente a un motor clásico: ejecutar partidas del agente contra Stockfish a profundidad fija (`--depth`) y con límite de medias jugadas (`--max-plies`) para comparar contra controles congelados o barajados.
- Reproducibilidad de experimentos: el registro JSONL y el `result.json` asociado permiten auditar una partida completa y detectar manipulación del fichero, algo útil en entornos de investigación con revisión por pares.
- Docencia y divulgación técnica: la interfaz web local con el panel de lectura de decisión muestra de forma observable los candidatos y las puntuaciones de política, sin presentarlos como cadena de pensamiento privada ni como cognición biológica.
- Banco de pruebas de inferencia sobre grafos dispersos: el backend CSR por fila de destino y la dinámica LIF dispersa con signo sirven para medir costes de propagación en subgrafos de conectoma de tamaño variable (`--neural-steps`, `--connectome`).
- Desarrollo de interfaces sensorio-motoras: el contrato sensorial de 8x8 y la máscara legal externa al modelo constituyen una plantilla para separar percepción, política y validación formal en agentes simulados.
- Comparación con artefactos públicos: cargar el modelo ChessFly/FlyWire mediante `ChessFlyModel.from_artifacts` y contrastar su comportamiento con la política surrogate sobre las mismas posiciones.
- Auditoría de procedencia de artefactos: el importador con bloqueo de procedencia y el registro de sumas de verificación permiten documentar de dónde proviene cada grafo y cada peso antes de usarlos en un experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni equivalentes, y tampoco reporta métricas propias del dominio, como Elo, porcentaje de victorias contra Stockfish, tasa de tablas, corrección de jugadas o error de calibración frente a objetivos funcionales. El propio autor sitúa esa medición en la hoja de ruta (punto 1: ajustar los parámetros de dinámica contra objetivos funcionales reservados e informar del error de calibración por separado del rendimiento ajedrecístico).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no declara requisitos de GPU ni tamaños de artefacto.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU (A100, H100, RTX 4090 ni otros).
- Compatibilidad con GPU de consumo: no determinable con la información disponible. El flujo documentado es una instalación local con `pip install -e '.[dev]'` y una CLI, lo que sugiere ejecución en CPU, pero no se confirma ni se acota el consumo de memoria.
- Memoria necesaria: no disponible. Depende del tamaño del conectoma cargado, que no se documenta; el backend opera sobre subgrafos dispersos.
- Oponente Stockfish: requiere el ejecutable de Stockfish disponible en el `PATH` o indicado con `--engine PATH`; consume CPU y su profundidad de búsqueda es configurable.
- Opciones de despliegue: paquete Python editable con extras (`[dev]`, `[chessfly]`), módulo de línea de comandos `python -m flychess.cli`, servidor web local `python -m flychess.web` en `127.0.0.1`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo por jugada ni de pasos de simulación por segundo.
- Dependencias externas: el runtime ChessFly descarga el grafo desde el Space de la demo y los pesos desde el repositorio del modelo; ninguno de los dos se incluye en el repositorio de `flychess`.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. La tabla siguiente recoge únicamente los componentes que la propia model card describe, sin datos de rendimiento:

| Sistema | Naturaleza | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flychess (`SurrogateFlyBrain`) | Política recurrente determinista sobre grafo, con dinámica LIF dispersa | no disponible | Codificación del tablero de 8x8; 780 características en el adaptador ChessFly | no disponible | Repositorio `NewSonnet/flychess` en HuggingFace, 0 descargas |
| Artefacto ChessFly/FlyWire | Modelo derivado de FlyWire cargado mediante runtime opcional | no disponible | 780 características, 1.968 acciones, 5 pasos calibrados | Se debe conservar la licencia del grafo y las citas de origen | Descarga externa desde el Space de la demo y el repositorio del modelo |
| Backend de conectoma JSON | Política basada en grafo de lista de aristas validado | no disponible | Tablero de 8x8 y pasos de simulación configurables | no disponible | Incluido en el repositorio (ejemplo `examples/tiny-connectome.json`) |
| Stockfish | Motor clásico de búsqueda alfa-beta, no neuronal | no aplica | Posición de ajedrez vía UCI | Licencia propia de Stockfish, no indicada en la información | Ejecutable en el `PATH` o vía `--engine` |

## Limitaciones y advertencias

- Alcance científico acotado por el propio autor: un conectoma simulado no es una mosca viva y una demo que juega al ajedrez no es evidencia de conciencia ni de equivalencia biológica.
- La política surrogate es determinista y deliberadamente no se presenta como un cerebro de mosca: faltan dinámicas neuronales calibradas, señalización química, transducción sensorial y semántica motora.
- No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de ajuste (RLHF, DPO u otras); no hay base publicada para afirmar que el modelo aprende o tiene habilidad ajedrecística.
- No hay métricas publicadas: ni error de calibración, ni Elo, ni resultados contra Stockfish, ni comparaciones con controles congelados o barajados. Cualquier afirmación de rendimiento sería especulativa.
- La licencia no está disponible en la información proporcionada, lo que impide determinar si el uso comercial está permitido. Además, el autor advierte de que se debe conservar la licencia del grafo y las citas de origen de los artefactos adquiridos.
- Riesgo de confusión de procedencia: el adaptador ChessFly es una capa de compatibilidad para un modelo derivado de FlyWire, no una calibración biológica del MaleCNS; el material importado no debe presentarse como tal.
- Dependencia de descargas externas: los artefactos del runtime ChessFly no se distribuyen con el repositorio y se obtienen del Space de la demo y del repositorio del modelo, con el riesgo de disponibilidad y de cambios de versión que eso implica.
- La máscara de jugadas legales se aplica fuera del modelo cerebral, por lo que la validez formal de la jugada no es una capacidad interna del agente.
- El panel de lectura muestra telemetría de política, no cadena de pensamiento privada; interpretarlo como cognición sería un error metodológico.
- Sin soporte de lenguaje natural, multimodalidad, tool calling ni multilingüismo: su ámbito es exclusivamente la selección de jugadas de ajedrez y la simulación de grafos neuronales.
- Adopción prácticamente nula: 0 descargas y 0 likes en HuggingFace, sin pipeline declarado, lo que limita la validación independiente.
- Anomalía de metadatos: la fecha de creación registrada (17 de septiembre de 2026) es posterior a la fecha actual, lo que sugiere un error de sellado temporal o de reloj en la plataforma.
- La búsqueda web asociada no devolvió resultados relevantes: los enlaces recuperados corresponden a foros de correo del proveedor Orange y no guardan relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NewSonnet/flychess
- Stockfish (oponente UCI citado en la model card): https://stockfishchess.org/
- No se dispone de más URLs: la model card menciona `python-chess`, el Space de la demo de ChessFly/FlyWire y el repositorio del modelo, pero no incluye sus direcciones, y la búsqueda web no aportó enlaces relevantes. Los papers, blogs, repositorios y demos adicionales figuran como no disponibles.
