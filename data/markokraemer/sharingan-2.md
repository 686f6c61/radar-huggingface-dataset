# markokraemer/sharingan-2

## Resumen

SHARINGAN-2 es un blueprint de estrategia para póker de 6 jugadores en la modalidad no-limit Texas hold'em, desarrollado por markokraemer como reproducción del agente Pluribus publicado por Brown y Sandholm en *Science* (2019). No es un modelo de lenguaje: es un solucionador de teoría de juegos que almacena una estrategia casi-equilibrio (blueprint) calculada mediante Monte Carlo Counterfactual Regret Minimization (MCCFR) lineal con muestreo externo en paralelo. Se distribuye como un fichero binario de 169,9 GB en formato PLCP1 compacto que contiene 14.500 millones de infosets.

El modelo es la continuación de SHARINGAN-1 (misma ejecución detenida a 2e10 iteraciones) y representa el checkpoint final de la ejecución C, entrenada hasta 1,83e11 iteraciones, el presupuesto computacional que utilizó el artículo original. Su relevancia radica en que es una reproducción abierta, con código en Rust, de un agente de póker multi-jugador de nivel superhumano en entornos de información imperfecta, un dominio clásico de investigación en aprendizaje por refuerzo y teoría de juegos.

La inferencia no se realiza con un runtime de aprendizaje profundo, sino con las crates Rust `blueprint` y `bench` del repositorio `poker-sharingan`, que mapean el fichero en memoria y sirven acciones mediante un servidor HTTP. El blueprint está especializado en 6-max con stacks de 100 bb y no incluye la búsqueda en tiempo real, que se implementa en código y no en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blueprint de estrategia CFR (tabla de infosets), no red neuronal |
| Parametros totales | no disponible (14.500 millones de infosets en formato PLCP1 compacto) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (estado de la mano de póker, sin ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y tooling) |
| Licencia | Apache 2.0 |
| Formato de pesos | PLCP1 compacto, dividido en 7 partes de 25 GB; abstracción de cartas en `buckets-200.tar` |

## Arquitectura y entrenamiento

El agente se entrena con Linear MCCFR con muestreo externo en paralelo y poda de regret negativo, siguiendo el esquema del artículo de Pluribus escalado en iteraciones. La ejecución C, con semilla 2019, se llevó a cabo en servidores bare-metal de 64 núcleos y 576 GB de RAM, reanudándose desde checkpoints tras reinicios, hasta alcanzar 1,83e11 iteraciones. La abstracción de cartas es sin pérdida en el preflop y de 200 buckets por calle en el postflop, con un menú de acciones `medium` que debe coincidir en el momento de la carga.

El resultado es una tabla de estrategia para 14.500 millones de infosets que se consulta por mapeo en memoria: el disco es obligatorio y la RAM solo acelera la consulta. No hay fase de RLHF ni ajuste con datos humanos; el equilibrio aproximado surge exclusivamente del proceso de minimización de regret. La búsqueda en tiempo real (real-time search) que Pluribus añadía sobre el blueprint no forma parte de los pesos y debe implementarse en código, tal como se detalla en la model card de SHARINGAN-1 y en el repositorio.

## Capacidades

- Selección de acción en no-limit Texas hold'em de 6 jugadores con stacks de 100 bb, a partir de un estado de mano codificado.
- Estrategia casi-equilibrio derivada de MCCFR, con menú de apuestas `medium`.
- Servicio de inferencia mediante `sharingan-serve`, que expone `POST /v1/act` para devolver la acción del agente.
- Integración como bot de casa en arenas propias mediante `sharingan-arena`.
- Evaluación head-to-head y contra gauntlets de bots (nit, TAG, LAG, maniac, calling station, random) con la herramienta `pluribus`.
- Traducción de acciones fuera del menú (action translation) para tamaños de apuesta no contemplados.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto: su dominio es exclusivamente el póker.

## Casos de uso

- Investigación en teoría de juegos: servir como referencia de equilibrio aproximado para comparar nuevos agentes de póker o variantes de CFR contra un oponente fuerte y reproducible a 1,83e11 iteraciones.
- Arena de entrenamiento para humanos: desplegar `sharingan-arena` con SHARINGAN-2 como bot de casa permite a jugadores practicar contra un agente casi-equilibrio en 6-max con 100 bb.
- Evaluación de agentes propios: usar la herramienta `pluribus h2h` para medir en mbb/game, con duplicate deals y AIVAT, la diferencia entre un candidato y este blueprint con intervalos de confianza del 95%.
- Docencia y divulgación: ilustrar conceptos de información imperfecta, abstracción de cartas y minimización de regret con un artefacto abierto y licencia permisiva.
- Benchmarking de infraestructura: el fichero de 169,9 GB y el mapeo en memoria sirven para probar almacenamiento, throughput de disco y despliegue de servicios de inferencia de baja latencia en Rust.
- Reproducibilidad científica: al estar el código, la semilla, el presupuesto de iteraciones y los checksums publicados, permite replicar y auditar los resultados del artículo de Pluribus en un entorno controlado.
- Análisis de explotabilidad: ejecutar respuestas best response entrenadas contra el blueprint para acotar inferiormente su explotabilidad, como hace el autor con 12M iteraciones por asiento.

## Benchmarks y rendimiento

Todos los resultados son 6-max, con duplicate deals y AIVAT, en mbb/game (1 mbb/game = 0,1 bb/100), con IC del 95% y 4M de manos por formato.

| Prueba | 3 + 3 asientos | 1 SHARINGAN-2 vs 5 | 5 vs 1 (puntuación del otro lado) |
|---|---|---|---|
| SHARINGAN-2 vs SHARINGAN-1 (C@2e10) | +5,09 ± 1,16 | +8,60 ± 1,89 | -7,64 ± 1,88 |
| SHARINGAN-2 vs C@4,77e10 (checkpoint anterior más fuerte) | +1,97 ± 0,97 | +3,76 ± 1,57 | -1,95 ± 1,58 |

| Prueba | Resultado |
|---|---|
| Best response entrenada (12M iteraciones, todos los asientos) vs SHARINGAN-2 | el explotador pierde -247 ± 58 (SHARINGAN-1: -323 ± 62); ejecución demasiado corta para medir explotabilidad, solo comprueba que no encuentra fugas fáciles |
| Gauntlet 6-max vs nit / TAG / LAG / maniac / calling station / random | +125 ± 35 / +303 ± 56 / +933 ± 85 / +1.622 ± 99 / +2.572 ± 118 / +4.004 ± 197 |

## Requisitos de hardware

- Almacenamiento: 169,9 GB para el blueprint completo más 0,28 GB para `buckets-200.tar`; el fichero se mapea en memoria, por lo que el disco es imprescindible.
- RAM: no se especifica un mínimo en la información disponible; el autor indica que la RAM solo acelera la consulta. Los servidores de entrenamiento usaron 576 GB, pero ese dato corresponde al entrenamiento, no a la inferencia.
- CPU: el binario se compila con `RUSTFLAGS="-C target-cpu=native"`; la ejecución de referencia usó 32 hilos para 4M de manos en el head-to-head.
- GPU: no se requiere ni se menciona soporte GPU; el despliegue es CPU-only.
- Despliegue: `sharingan-serve` (servidor HTTP con `POST /v1/act`) y `sharingan-arena` (arena propia), ambos del workspace Rust `poker-sharingan`.
- Latencia y throughput: no disponibles de forma explícita; la referencia de 4M de manos con 32 hilos en `pluribus h2h` da una idea del orden de magnitud del motor de evaluación, no de la latencia por consulta.
- No cabe en GPU de consumo porque no se ejecuta en GPU; el cuello de botella es el almacenamiento y el ancho de banda de disco.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHARINGAN-2 | Blueprint MCCFR (PLCP1) | 169,9 GB, 14,5B infosets | 6-max NLHE, 100 bb | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| SHARINGAN-1 | Blueprint MCCFR (PLCP1) | no disponible | 6-max NLHE, 100 bb | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| Pluribus (Brown & Sandholm, 2019) | Blueprint + búsqueda en tiempo real | no disponible públicamente | 6-max NLHE, 100 bb | no disponible | No publicado como pesos; solo descrito en el artículo |
| Libratus (Brown & Sandholm, 2017) | CFR + subgame solving | no disponible públicamente | Heads-up NLHE | no disponible | No publicado como pesos |

## Limitaciones y advertencias

- No se ha evaluado contra jugadores humanos fuertes; la explotabilidad solo está acotada inferiormente por una única best response entrenada y esa ejecución es demasiado corta para medirla.
- Entrenado exclusivamente para 100 bb y 6-max: el juego heads-up (2-max) queda fuera de distribución y pierde contra los bots simples integrados.
- Los tamaños de apuesta fuera del menú `medium` se gestionan con action translation, que es la principal superficie explotable de esta clase de agentes.
- Un bot casi-equilibrio explota peor a oponentes débiles que un bot adaptativo; el gauntlet muestra ganancias, pero no es un explotador óptimo.
- El menú de acciones debe coincidir con `medium` en el momento de la carga; un desajuste invalida la estrategia.
- La búsqueda en tiempo real no está incluida en los pesos: sin implementarla en código, el rendimiento es el del blueprint puro.
- Doble uso: un agente de póker fuerte puede emplearse para hacer trampas en sitios de dinero real, que prohíben los bots; el autor lo desaconseja explícitamente.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero las normas de las plataformas de póker y la legislación sobre juego pueden restringir su aplicación práctica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/markokraemer/sharingan-2
- Modelo predecesor: https://huggingface.co/markokraemer/sharingan-1
- Repositorio de código (Rust): https://github.com/markokraemer/poker-sharingan
- Sitio del proyecto: https://sharingan.poker
- Artículo de referencia: Brown, N. y Sandholm, T., "Superhuman AI for multiplayer poker", *Science* 365(6456):885-890, 2019
