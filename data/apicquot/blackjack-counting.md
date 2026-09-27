# apicquot/blackjack-counting

## Resumen

`apicquot/blackjack-counting` no es un modelo de lenguaje ni una red neuronal: es una colección de tablas Q aprendidas mediante Q-learning tabular para jugar al blackjack con conteo de cartas. Lo publica el desarrollador Alexandre Picquot (usuario `apicquot` en HuggingFace) y cubre cinco variantes reales de juego de Las Vegas y siete sistemas de conteo (Hi-Lo, Hi-Opt I, Hi-Opt II, Omega II, Zen Count, Wong Halves y Knock-Out). El problema que resuelve es concreto: obtener la estrategia óptima condicionada al verdadero conteo, incluyendo jugadas básicas, jugadas de índice y decisión de seguro, sin que el autor haya introducido a mano ninguna tabla de estrategia básica ni de índices.

La relevancia es doble. Por un lado, es un artefacto reproducible y auditable para comparar sistemas de conteo sobre reglas de casino reales (H17/S17, DAS, surrender, RSA, pagos 6:5 y 3:2). Por otro, sirve como referencia tabular de bajo coste para investigación en aprendizaje por refuerzo, ya que cada celda almacena el valor esperado de cada acción y el número de visitas, lo que permite distinguir entre acciones legales no visitadas y acciones ilegales.

El artefacto es diminuto (el repositorio ocupa 0,0 GB), se distribuye como ficheros `.npz` de NumPy y no requiere GPU. La licencia es MIT. Los metadatos de HuggingFace indican fecha de creación del 27 de septiembre de 2026, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (sin red neuronal, sin transformer); tabla Q indexada por bucket de conteo, carta descubierta del crupier, mano del jugador, composición de dos cartas y acción |
| Parametros totales | No disponible el número de buckets de conteo; la forma de la tabla es (buckets, 10 upcards, 38 manos, 10 combinaciones de dos cartas, 5 acciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular sin contexto textual) |
| Tipos de cuantizacion | No aplica; los valores se almacenan como arrays de NumPy en coma flotante dentro de ficheros `.npz` |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy); incluye además `config.yaml`, `summary.csv` y `by_seat.csv` por cada variante de juego |

## Arquitectura y entrenamiento

La representación de estado combina el bucket de conteo verdadero, la carta descubierta del crupier (10 posibles), la mano del jugador codificada en 38 índices (0-17 hard 4-21, 18-27 soft 12-21, 28-37 parejas dividibles A,A hasta 10,10) y la composición de las dos cartas iniciales (10 clases). Las acciones son cinco: stand, hit, double, split y surrender. Para cada celda se almacenan `Q` (ganancia esperada en apuestas iniciales de cada acción, seguida de la jugada óptima) y `N` (visitas, donde 0 indica acción ilegal o nunca alcanzada). El seguro se modela aparte con los arrays `Qi` y `Ni` indexados solo por bucket de conteo. La ventaja de cada acción se deriva como `Q − max Q`.

El entrenamiento se realizó por self-play en un zapato simulado, con todos los jugadores de la mesa contando cartas, y sin proporcionar estrategia básica ni tabla de índices: tanto las jugadas básicas como las de índice y el seguro se aprendieron desde cero. El bucket de conteo se define mediante `buckets` (lo, width, n), donde el bucket k cubre el intervalo [lo + k·width, lo + (k+1)·width) con extremos abiertos, y se versiona por sistema de conteo en el campo `count`, junto con los campos `rule_*` que recogen las reglas del juego. No se especifican en la información disponible el número de episodios, la política de exploración, la tasa de aprendizaje ni el desglose del dataset de simulación: esos hiperparámetros figuran únicamente en el repositorio de GitHub asociado.

## Capacidades

- Consulta del valor esperado de cada acción (stand, hit, double, split, surrender) para un estado dado de mano, upcard y conteo verdadero.
- Generación de charts de estrategia por conteo verdadero mediante el método `chart(count=...)`.
- Cálculo de la ventaja relativa de cada acción frente a la óptima (`Q − max Q`).
- Decisión de seguro a partir del conteo, con su propio valor y contador de visitas.
- Cobertura de cinco variantes de reglas: 1 baraja H17/DAS/6:5, 2 barajas H17/DAS/3:2, 6 barajas H17/DAS/surrender/3:2, 6 barajas S17/DAS/surrender/RSA/3:2 (high limit) y 8 barajas H17/DAS/surrender/3:2.
- Siete sistemas de conteo entrenados por separado, lo que permite comparar sistemas sobre una misma variante.
- Distinción entre acciones no visitadas y acciones ilegales gracias al array `N`.
- Desglose de resultados por asiento (`by_seat.csv`), útil para analizar el efecto del número de jugadores.
- No dispone de tool calling, function calling, capacidades multimodales, multilingües ni modo de razonamiento: no es un modelo generativo.

## Casos de uso

- Consulta de estrategia en producción de simuladores: integrar `blackjack.qlearn.QTable` en un simulador de casino para que el agente decida con la tabla óptima al conteo actual en lugar de una estrategia básica fija.
- Auditoría de sistemas de conteo: cargar los siete `.npz` de una variante y comparar qué sistema maximiza las unidades ganadas por 100 rondas antes de recomendar uno.
- Análisis de cambios de reglas: usar las cinco configuraciones (`config.yaml`) para cuantificar cuánto se pierde al pasar de S17 a H17, de 3:2 a 6:5 o al añadir surrender y RSA.
- Material didáctico sobre conteo: generar charts por conteo verdadero (+1, +2, +3) y mostrar gráficamente en qué punto aparecen las desviaciones respecto a la estrategia básica.
- Investigación en aprendizaje por refuerzo: emplear las tablas como línea base tabular reproducible frente a aproximaciones con redes neuronales (DQN, PPO) sobre el mismo entorno y las mismas reglas.
- Estimación de riesgo por asiento: a partir de `by_seat.csv`, evaluar cómo afecta el número de jugadores de la mesa al rendimiento por mano jugada.
- Construcción de entornos de entrenamiento para agentes: usar los valores `Q` y `N` como referencia para medir la desviación de un agente nuevo respecto al óptimo aprendido.
- Análisis de varianza y gestión de banca: la columna de 0-3 unidades ganadas por 100 manos jugadas permite estimar el retorno esperado cuando se decide no apostar en conteos desfavorables.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las cifras son unidades ganadas por 100 rondas repartidas (1 unidad = apuesta mínima), salvo la última columna, que son unidades ganadas por 100 manos efectivamente jugadas. La estrategia 1-3 apuesta 3 unidades en conteos con ventaja y 1 en el resto; la estrategia 0-3 apuesta 3, 1 o 0, retirándose en los conteos sin ventaja.

| Juego | Mejor sistema | Sin conteo, apuesta fija | Mejor sistema, apuesta fija | Apuesta 1-3, jugar todo | Apuesta 0-3, retirarse | 0-3: unidades por 100 manos jugadas |
|---|---|---|---|---|---|---|
| 1 baraja, H17, DAS, 6:5 | Omega II | −1,59 | −0,88 | −0,05 | +1,25 | +4,89 |
| 2 barajas, H17, DAS, 3:2 | Zen Count | −0,49 | −0,16 | +0,98 | +1,71 | +5,41 |
| 6 barajas, H17, DAS, surrender, 3:2 | Wong Halves | −0,54 | −0,40 | +0,27 | +1,01 | +2,79 |
| 6 barajas, S17, DAS, surrender, RSA, 3:2 (high limit) | Wong Halves | −0,27 | −0,13 | +0,72 | +1,27 | +3,50 |
| 8 barajas, H17, DAS, surrender, 3:2 | Wong Halves | −0,56 | −0,47 | +0,03 | +0,74 | +2,12 |

No se han publicado en la información disponible resultados comparativos contra MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar de benchmarks de modelos de lenguaje o de visión, porque el artefacto no es un modelo de ese tipo. Tampoco se publican intervalos de confianza, número de manos simuladas ni tests de significación estadística.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: la consulta consiste en un indexado de arrays de NumPy, sin operaciones matriciales.
- VRAM necesaria: 0 GB; no se requiere GPU en ningún escenario.
- Memoria RAM estimada: del orden de decenas de MB o menos por tabla cargada, dado que el repositorio completo ocupa 0,0 GB. Es una estimación, no un dato publicado.
- GPU recomendadas: ninguna. Funciona igual en cualquier equipo, incluidos portátiles y contenedores pequeños.
- Cabe en cualquier GPU de consumo, pero no la aprovecha; tampoco necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: Python con NumPy, `huggingface_hub` para la descarga de los `.npz` y el paquete `blackjack` del repositorio de GitHub (`pip install git+https://github.com/apicquot/blackjack`). No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de red neuronal ni tokenizador.
- Latencia: la consulta es un acceso O(1) a memoria, del orden de microsegundos. El throughput no es una métrica aplicable.
- Carga del modelo: descarga de ficheros de pocos MB, prácticamente instantánea.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos publicados en HuggingFace directamente comparables (mismo formato de tabla Q tabular para blackjack con conteo). Como referencia, en la literatura de aprendizaje por refuerzo el entorno Blackjack de Gymnasium plantea una versión simplificada sin conteo y sin seguimiento por bucket de conteo verdadero, por lo que no es equivalente funcionalmente.

| Referencia | Tipo | Sistemas de conteo | Variantes de reglas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `apicquot/blackjack-counting` | Tabla Q tabular aprendida por self-play | 7 (Hi-Lo, Hi-Opt I, Hi-Opt II, Omega II, Zen, Wong Halves, Knock-Out) | 5 | MIT | HuggingFace, repo completo y Space interactivo |
| Blackjack de Gymnasium | Entorno de simulación con espacio de estados reducido | No incluye conteo | 1 versión simplificada | MIT | Librería estándar de RL |
| Estrategia básica publicada (tablas de referencia) | Tabla fija, no aprendida | No incluye índices por conteo | Variable según publicación | Variable | Ampliamente disponible en literatura |
| Modelos tabulares equivalentes para blackjack en HuggingFace | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El rendimiento reportado es teórico y proviene de un zapato simulado; no incorpora errores humanos de conteo, ni velocidad de mesa, ni variaciones reales de penetración más allá de lo configurado.
- Los resultados dependen fuertemente de la penetración y de las reglas de cada `config.yaml`; extrapolar cifras a otras mesas o casinos carece de validez.
- El modelo está sobreajustado al modelo de zapato y al número de jugadores de la simulación; el reparto real de cartas puede diferir.
- No se publican intervalos de confianza, tamaño de muestra ni tests de significación: las diferencias entre sistemas, en varios casos, son de décimas de unidad y podrían no ser estadísticamente robustas.
- No hay validación por pares ni revisión independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- La licencia MIT permite uso comercial del artefacto, pero no exime de cumplir la normativa aplicable: el uso de sistemas de conteo en casinos reales puede estar prohibido o justificar la expulsión según la jurisdicción y las condiciones del establecimiento.
- No debe interpretarse como herramienta para operar en casinos reales; su uso natural es la simulación, la investigación y la docencia.
- No procesa lenguaje natural ni imágenes: cualquier expectativa de capacidades generativas, tool calling o razonamiento multietapa es infundada.
- No se documentan sesgos en el sentido habitual, pero la tabla hereda los sesgos de la simulación de reglas y de los propios sistemas de conteo implementados.
- No se detalla el número de buckets de conteo ni la resolución del conteo verdadero, lo que limita reproducir con exactitud las condiciones del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apicquot/blackjack-counting
- Repositorio de código, método y validación: https://github.com/apicquot/blackjack
- Space interactivo de resultados: https://huggingface.co/spaces/apicquot/blackjack-counting-results
- Perfil del autor: https://huggingface.co/apicquot
- Resultados por variante (páginas estáticas):
  - 1 baraja, H17, DAS, 6:5: https://apicquot-blackjack-counting-results.static.hf.space/1deck_h17_das_65/index.html
  - 2 barajas, H17, DAS, 3:2: https://apicquot-blackjack-counting-results.static.hf.space/2deck_h17_das/index.html
  - 6 barajas, H17, DAS, surrender, 3:2: https://apicquot-blackjack-counting-results.static.hf.space/6deck_h17_das_ls/index.html
  - 6 barajas, S17, DAS, surrender, RSA, 3:2 (high limit): https://apicquot-blackjack-counting-results.static.hf.space/6deck_s17_das_ls_rsa/index.html
  - 8 barajas, H17, DAS, surrender, 3:2: https://apicquot-blackjack-counting-results.static.hf.space/8deck_h17_das_ls/index.html
- Enlaces de contexto no oficiales, no asociados al modelo: https://www.wired.com/story/ai-agent-collusion-card-counting-secrets/ , https://thebusinessroom.com/ai-agents-teamed-up-to-cheat-at-blackjack-their-collusion-is-getting-harder-to-spot/ , https://bytejackai.com/
