# markokraemer/sharingan-1

## Resumen

SHARINGAN-1 es un bot de póker de no-limit Texas hold'em desarrollado por markokraemer como referencia de la arena abierta Poker Sharingan. No es un modelo de lenguaje: es un conjunto de ficheros de estrategia entrenados mediante Monte Carlo Counterfactual Regret Minimisation (MCCFR) sobre una abstracción de cartas de 200 buckets por calle postflop, junto con las tablas de abstracción necesarias para interpretarlos. El repositorio contiene el blueprint C tras 2e10 iteraciones en formato PLCP1 compacto, además de checkpoints alternativos (A, B y una variante C de 4,77e10 iteraciones) y un blueprint separado para heads-up a 200 bb.

El modelo resuelve el problema clásico de los juegos de información imperfecta: aproximar una estrategia de equilibrio de Nash con un presupuesto computacional acotado. Su relevancia radica en que es una reproducción abierta de Pluribus (Brown & Sandholm, *Science* 2019) para 6 jugadores, con tooling en Rust que permite servir el bot vía HTTP, montar una arena propia y calcular best responses explotadoras. Los pesos no se cargan con `transformers` ni PyTorch: se leen mediante las crates Rust `blueprint` y `bench`, y se accede a ellos con memory-mapping, por lo que el disco es obligatorio y la RAM solo acelera la inferencia.

El tamaño del repositorio (481,8 GB) refleja la naturaleza de los artefactos: ficheros de estrategia partidos en trozos de 25 GB, con checksums SHA256 para su reensamblado. La licencia es Apache 2.0 y el idioma declarado es inglés, aunque el contenido es fundamentalmente binario y código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Blueprint de estrategia MCCFR (Linear MCCFR con negative-regret pruning) + búsqueda en tiempo real MC-LCFR; no es una red neuronal transformer |
| Parámetros totales | No disponible (no aplica: se almacenan probabilidades de acción de 8 bits por infoset, ~12 bytes por infoset) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no aplica; el estado es la mano de póker y el historial de apuestas) |
| Tipos de cuantización | Estrategia media almacenada en 8 bits por acción; formatos PLCP1 (compacto) y PLBP4 (checkpoint completo con regrets) |
| Idiomas soportados | Inglés (documentación y etiquetas); el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | PLCP1 (`.plcp`), PLBP4 (`blueprint.bin` + `snapshots.sum` PLSA1), tablas de buckets `.u16` (`flop.u16`, `turn.u16`, `river.u16`) y `meta.txt` |
| Juego | No-limit Texas hold'em 6-max (2-6 jugadores), stacks de 100 bb en el blueprint |
| Abstracción | Preflop sin pérdida (169 clases); 200 buckets por calle postflop (EMD k-means en flop/turn, OCHS en river) |
| Menús de acción | `local` (B), `paper` (A), `medium` (C y SHARINGAN-1) |
| Infosets alcanzados | C: 12,2 mil millones (78% de un store de 460 GB); A: 17,0 mil millones (store lleno) |
| Búsqueda en tiempo real | MC-LCFR con profundidad limitada, 4 estrategias de continuación en hojas, creencias bayesianas, re-búsqueda off-tree; solo turn y river (`--set flop=0`), 200k iteraciones |

## Arquitectura y entrenamiento

El núcleo es un blueprint de estrategia calculado con Linear MCCFR paralelo con poda de regret negativo. El schedule LCFR aplica descuento durante el primer 3,5% del run, poda desde el 1,7% (95% de las iteraciones, umbral -300M, desactivada en river y acciones terminales) y promediado desde el 6,9%, con intervalo de estrategia de 10k iteraciones. El schedule basado en minutos del paper original se ha reescalado a iteraciones para hacerlo reproducible. La abstracción usa preflop sin pérdida y 200 buckets por calle postflop: EMD k-means sobre histogramas de equity para flop y turn, y OCHS para river.

La innovación operativa está en la separación entre pesos y búsqueda: la estrategia jugable se serializa en PLCP1 con probabilidades de 8 bits e índice de infoset (~12 bytes por infoset), mientras que el checkpoint completo PLBP4 conserva regrets y estrategia media para reanudar entrenamiento. La búsqueda en tiempo real no forma parte de los pesos: es código (MC-LCFR con profundidad limitada, creencias bayesianas y re-búsqueda off-tree) que se ejecuta sobre el blueprint en turn y river. Un detalle crítico es que cada blueprint debe cargarse con su menú de acciones correcto; evaluar con un menú distinto produce resultados basura (aproximadamente -2.364 mbb/game). El run completo de 1,83e11 iteraciones está en entrenamiento y se publicará como SHARINGAN-2.

## Capacidades

- Juego de no-limit Texas hold'em 6-max (el motor admite de 2 a 6 jugadores) con stacks de 100 bb en el blueprint principal.
- Selección de acción en tiempo real mediante búsqueda MC-LCFR limitada en profundidad sobre turn y river, con creencias bayesianas sobre el rango del rival.
- Servicio de inferencia HTTP: endpoint `POST /v1/act` que recibe una mano y devuelve la acción de SHARINGAN-1.
- Despliegue de arena propia con SHARINGAN-1 como house bot, con los mismos scores que el leaderboard público.
- Evaluación head-to-head duplicada entre blueprints (6-max, 4M de manos en el ejemplo de la model card).
- Cálculo de best response entrenada contra un blueprint congelado (`exploit-compact`), útil para medir explotabilidad.
- Ejecución de gauntlets contra bots integrados (`bench gauntlet`).
- Reanudación de entrenamiento desde checkpoints PLBP4 (`pluribus train --resume`).
- Traducción de acciones mediante shadow-game (action translation) para mapear acciones fuera del menú del blueprint.
- No soporta tool calling, agentes multi-step, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en juegos de información imperfecta: reproducir los resultados de Pluribus con un blueprint abierto y un motor Rust permite estudiar el efecto de la abstracción (200 buckets) y del schedule LCFR sobre la explotabilidad.
- Arena de evaluación de bots: montar `sharingan-arena` con SHARINGAN-1 como house bot ofrece un benchmark reproducible para comparar agentes de terceros con los mismos scores que el leaderboard público.
- Medición de explotabilidad: ejecutar `exploit-compact` contra el blueprint congelado cuantifica cuánto puede ganar un best response entrenado, lo que sirve para validar la calidad del equilibrio aproximado antes de desplegar un agente.
- Comparación de checkpoints: el head-to-head duplicado entre `C-medium-4.77e10` y SHARINGAN-1 permite aislar la ganancia de iteraciones adicionales (+3,8 mbb/game declarados) con significación estadística sobre millones de manos.
- Servicio de bot para partidas de práctica: el servidor `sharingan-serve` expone la política vía HTTP, lo que facilita integrarla en clientes o plataformas de entrenamiento humano sin reimplementar el motor.
- Docencia y divulgación: el formato PLCP1 compacto y las tablas de buckets hacen tangible el concepto de abstracción de cartas y de estrategia media, con ficheros que se pueden inspeccionar y verificar por checksum.
- Ingeniería de sistemas de inferencia: el diseño con memory-mapping y particionado en trozos de 25 GB sirve como caso práctico de despliegue de artefactos de cientos de GB con verificación SHA256.

## Benchmarks y rendimiento

La model card declara un `model-index` con `results: []`, es decir, sin entradas de benchmark. El único dato cuantitativo de rendimiento publicado es la comparación interna entre checkpoints: `C-medium-4.77e10` obtiene +3,8 mbb/game frente a SHARINGAN-1. También se documenta el efecto de cargar un blueprint con el menú equivocado: aproximadamente -2.364 mbb/game.

| Comparación | Resultado |
|---|---|
| C-medium-4.77e10 vs SHARINGAN-1 (6-max) | +3,8 mbb/game a favor de C-medium-4.77e10 |
| Blueprint evaluado con menú incorrecto | ~ -2.364 mbb/game |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- Almacenamiento: el blueprint SHARINGAN-1 ocupa 124,7 GB en partes de 25 GB; el repositorio completo son 481,8 GB. El disco es obligatorio porque los ficheros se acceden con memory-mapping.
- RAM: no es estrictamente necesaria para la inferencia (solo acelera), pero los ejemplos de entrenamiento de best response usan `--mem-gb 120` y 32 hilos.
- GPU: no se requiere GPU; el tooling es Rust compilado con `RUSTFLAGS="-C target-cpu=native"` y `cargo build --release`.
- CPU: se recomienda compilar con optimizaciones nativas; los ejemplos de la model card usan `--threads 32`.
- Despliegue: binarios `sharingan-serve` (servidor HTTP), `sharingan-arena` (arena), `pluribus` (entrenamiento, compactación y head-to-head) y `bench` (gauntlets).
- Latencia y throughput: no disponibles en la información proporcionada.
- Opciones tipo vLLM, llama.cpp, Ollama o TGI: no aplican; el modelo no se carga con `transformers` ni PyTorch.

## Comparativa con modelos similares

| Modelo | Tipo | Jugadores | Abstracción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHARINGAN-1 | Blueprint MCCFR + búsqueda MC-LCFR | 6-max (2-6) | 200 buckets postflop, preflop sin pérdida | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| Pluribus (Brown & Sandholm, 2019) | Blueprint MCCFR + búsqueda | 6-max | No publicada en detalle | No aplica (no liberado) | No disponible públicamente |
| Libratus (Brown & Sandholm) | Blueprint CFR + subgame solving | Heads-up | No publicada | No aplica | No disponible públicamente |
| Slumbot | Bot de heads-up | Heads-up | No disponible | No disponible | Servicio en línea; SHARINGAN incluye un blueprint HU a 200 bb para tests contra él |

La comparación con Pluribus y Libratus es conceptual: SHARINGAN-1 es una reproducción abierta del primero, mientras que los originales no se distribuyen como artefactos descargables. No se dispone de cifras de mbb/game comparables entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier uso fuera del póker no-limit Texas hold'em carece de sentido.
- El blueprint principal asume 100 bb de stack; existe un blueprint separado de 200 bb heads-up para tests contra Slumbot que no forma parte de esta release.
- El menú de acciones debe coincidir con el blueprint en el momento de la carga (`--sizing`); un desajuste degrada el rendimiento en torno a -2.364 mbb/game.
- La búsqueda en tiempo real solo cubre turn y river (`--set flop=0`); no hay búsqueda en flop en la configuración final publicada.
- La abstracción de 200 buckets introduce pérdida de información postflop; el preflop es sin pérdida (169 clases).
- El run completo de 1,83e11 iteraciones no está publicado; SHARINGAN-2 queda pendiente de liberación.
- La explotabilidad del blueprint no se cuantifica en la model card; el propio autor distribuye tooling (`exploit-compact`) para medirla, lo que sugiere que no debe asumirse un equilibrio exacto.
- El repositorio es muy grande (481,8 GB) y requiere reensamblado manual de partes y verificación de checksums; un error en este proceso invalida los pesos.
- El idioma declarado es inglés y la documentación está en ese idioma; no hay soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del workspace Rust y las condiciones de la arena pública si se compite en el leaderboard.

## Enlaces

- Hugging Face: https://huggingface.co/markokraemer/sharingan-1
- Repositorio de código (Rust): https://github.com/markokraemer/poker-sharingan
- Arena pública: https://sharingan.poker
- Formato del servidor de inferencia: `sharingan-1/serve/README.md` dentro del repositorio de código
- Paper de referencia: Brown, N. y Sandholm, T., "Superhuman AI for multiplayer poker", *Science* 2019 (no se incluye URL en la información proporcionada)
