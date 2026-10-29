# ckomiya/saihai-gateball

## Resumen

Saihai (采配) es un agente de IA clásica para gateball desarrollado por ckomiya. No es un modelo de lenguaje ni una red neuronal: es un planificador por simulación que, para cada golpe, genera candidatos (pasos por puerta, toques sobre bolas rivales, sparks, reentradas, jugadas de espera), simula cada uno con el motor de reglas y la física reales —incluido el error de ejecución del jugador— y conserva los mejores según una función de evaluación heurística.

Los 31 pesos de esa función de evaluación se aprendieron por self-play con sep-CMA-ES (CMA-ES de covarianza diagonal), una estrategia evolutiva sin derivadas. Sobre esa capa aprendida se añaden reglas explícitas de "kantoku" (entrenador) definidas a mano: cuándo llevar una bola al poste (agari), cómo acercar una bola lejana encadenando toques (tsunagi), gestión de los últimos turnos y prevención de dejar bolas expuestas.

El repositorio de HuggingFace aloja únicamente los pesos en JSON plano (`saihai-v1.4.json` y `attackTable.json`) y esta tarjeta; el código (motor de reglas, física, planificador, herramientas de entrenamiento y medición) vive en GitHub. Es relevante como referencia reproducible de optimización de políticas en dominios de juego con fitness ruidoso y presupuesto de parámetros muy bajo, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de IA clásica: planificación por simulación (búsqueda sobre candidatos evaluados con función heurística) + reglas kantoku explícitas. No es transformer, MoE, SSM ni red neuronal |
| Parametros totales | No aplica. El fichero de pesos contiene 45 valores: 31 genes aprendidos (21 pesos base + 8 multiplicadores de fase + 2 pendientes de balance `leadSlope` y `clockSlope`) y 14 valores fijos o de configuración |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica. No procesa secuencias de texto; el estado es la posición completa del campo en cada turno |
| Tipos de cuantizacion | No aplica. Pesos en JSON de coma flotante |
| Idiomas soportados | en, es (solo documentación: README y README.es.md). El agente no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | JSON plano (`saihai-v1.4.json`, `attackTable.json`); no cargables con `transformers` ni con ningún framework de ML |

## Arquitectura y entrenamiento

La arquitectura es un bucle de planificación determinista sobre un motor de física y reglas: se generan golpes candidatos, se simulan con el error de ejecución modelado y se puntúan con una función de evaluación lineal-compuesta (puntos, riesgo de ser golpeado, toques, sparks, posicionamiento). Los 31 números de esa función se optimizaron con sep-CMA-ES, elegida porque el fitness es ruidoso (cada partida depende del azar en la hierba y de los errores de ejecución) y solo hay unas 30 variables. Población de 24 candidatos por generación, arrancando desde pesos fijados a mano; los pesos publicados son la media de la generación final, no el mejor candidato.

El fitness combina victorias (empate = ½), 0,02 × diferencia de puntos por partida y un término pequeño de una batería de comprobaciones de comportamiento. Cada generación juega partidas en parejas con colores intercambiados y sorteos aleatorios compartidos, contra los pesos fijos y contra el resto de la población; aproximadamente el 40 % de las parejas parten de posiciones de final de partida de un banco generado. El error de ejecución se modela a nivel humano (puntería 0,056 m, potencia 0,022, dirección 0,022), escalado por jugador y distancia mediante perfiles de "certeza" sorteados, para que aprenda una regla general y no un equipo concreto.

Linaje: `saihai-v1.4` son los pesos de la ejecución de entrenamiento v4 (24 generaciones) más reglas kantoku fijas añadidas antes y después, hasta v1.4; los pesos no se reentrenaron tras esas adiciones. Algunas constantes de regla son candidatas a convertirse en genes aprendidos en un futuro reentrenamiento. `attackTable.json` no son pesos aprendidos, sino una tabla precalculada (mediante `npm run lineplay -- --write`) con la frecuencia de cada desenlace de un toque rival, simulada con la física real sobre una rejilla de distancias a la línea, ángulos y distancias de tiro, con una tabla para rival humanoide y otra para la CPU.

## Capacidades

- Planificación por simulación de golpes candidatos con el motor de reglas y física reales, incluyendo error de ejecución del jugador.
- Evaluación de posiciones mediante función heurística con pesos aprendidos por self-play y multiplicadores por fase (apertura y final de partida).
- Reglas de gestión explícitas: ataque tras puerta, defensa de la línea, aperturas, agari (llevar bola al poste) en el momento adecuado, tsunagi, doble ángulo, toques sobre compañeras, reentradas, gestión del último turno, spark que evita bolas propias y agrupación/avance según quién vuelve a jugar.
- Modelado del rival mediante tabla de probabilidades de desenlace de toques (`attackTable.json`), con perfiles separados para rival humanoide y CPU.
- Ajuste de riesgo según marcador y reloj de partida mediante las pendientes `leadSlope` y `clockSlope` (esta última aprendida a 0, es decir, neutra).
- Herramientas de medición en el repositorio: `h2h`, `humanduel`, `behavior`, `selfplay` y `bench:plan`.
- No soporta tool calling, function calling, agentes multistep basados en lenguaje, visión, audio ni generación de texto.

## Casos de uso

- Oponente controlado por CPU en un videojuego de gateball: el agente se integra como "kantoku" del equipo rival y decide cada golpe en 55–60 ms por turno en un solo núcleo, lo que permite jugar en tiempo real sin GPU.
- Nivel de dificultad "Kantoku IA" en demos y prototipos: la tarjeta documenta que las mediciones se hicieron con la certeza de ese nivel, de modo que sirve como referencia reproducible de comportamiento.
- Banco de pruebas del motor de reglas y de la física: al simular miles de golpes con desenlaces conocidos, expone inconsistencias en la implementación de toques, sparks y salidas de bola.
- Generación de bancos de posiciones de final de partida: el propio pipeline de entrenamiento muestrea posiciones finales; reutilizar el agente permite poblar corpus de estados difíciles para otros experimentos.
- Investigación en optimización sin derivadas: caso de estudio de sep-CMA-ES con ~30 parámetros y fitness ruidoso, con historial de cambios y resultados negativos documentados en `TRAINING.md`.
- Análisis táctico y formación de jugadores: las reglas son legibles y las decisiones se pueden volcar a texto (candidato, simulación, puntuación) para explicar por qué un kantoku elige agari, tsunagi o espera.
- Base para reentrenamiento con self-play: al ser MIT y con el código en GitHub, se puede sustituir la función de fitness, ampliar los genes aprendidos o extender la tabla de rivales a otros perfiles de jugador.
- Evaluación comparativa de versiones de política: los comandos `h2h` y `humanduel` con semillas fijas permiten medir regresiones entre iteraciones con intervalos al 95 %.

## Benchmarks y rendimiento

Todas las cifras corresponden a `saihai-v1.4` con las semillas por defecto de las herramientas del repositorio, poste de meta de 0,025 m y la certeza del nivel "Kantoku IA" de la demo. Las partidas se juegan en parejas con colores intercambiados; "±" es el intervalo del 95 % reportado por las herramientas.

| Medición | Condición | Resultado |
|---|---|---|
| `h2h` contra los pesos de `saihai-v1.3` | 200 partidas, `--seed 8300000` | 46,5 % (85 victorias / 16 empates / 99 derrotas), −0,38 puntos por partida; estadísticamente igualado (intervalo ≈ ±6,9) |
| `humanduel` contra rival humanoide | 200 partidas, semilla por defecto | 84,5 % de puntuación (empates = ½), +7,00 puntos por partida |
| `behavior` (batería de situaciones reales) | 4 semillas por escenario | 98 % de las comprobaciones superadas |
| `selfplay --games 8 --levels 4,1 --seed 1` | prueba de sanidad | 5 victorias / 2 empates / 1 derrota, 20,1–16,4 puntos |
| Tiempo por golpe (`bench:plan --kantoku`) | Node, un núcleo | ≈ 55–60 ms |

Nota del autor: las primeras mediciones de v1.4 usaron un poste de 0,05 m (h2h 49,8 %, humanduel 87,3 %); al fijar el poste en 0,025 m los mismos pesos dan las cifras de la tabla. Los pesos no cambiaron. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque el modelo no es lingüístico.

## Requisitos de hardware

- VRAM: ninguna. El agente no usa GPU; los pesos son 45 valores y una tabla de consulta en JSON.
- CPU: un solo núcleo basta para ≈ 55–60 ms por golpe con el planificador por defecto (`bench:plan --kantoku`, Node).
- GPU recomendadas: no aplica. A100, H100 o RTX 4090 no aportan nada al bucle de planificación actual.
- Compatibilidad con GPU de consumo: irrelevante; cualquier equipo que ejecute Node.js puede correrlo.
- Despliegue: paquete TypeScript/Node del repositorio de GitHub (`npm run` con las herramientas `selfplay`, `h2h`, `humanduel`, `behavior`, `bench:plan`, `lineplay`). No se integra con vLLM, llama.cpp, Ollama ni TGI, que esperan pesos de redes neuronales.
- Latencia: 55–60 ms por golpe en un núcleo. Throughput agregado no disponible; escalaría con procesos en paralelo al ser independiente por partida.
- Almacenamiento y memoria: no disponibles en la información proporcionada, aunque por la naturaleza de los ficheros (JSON con 45 valores más una tabla precalculada) el consumo es despreciable frente a cualquier modelo neuronal.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información proporcionada. La única comparación documentada es con la versión anterior del propio modelo:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saihai-v1.4 | 31 genes aprendidos (45 valores en el JSON) | no aplica | 46,5 % en h2h contra v1.3; 84,5 % contra rival humanoide; 98 % en `behavior`; 55–60 ms/golpe | MIT | Pesos en HuggingFace, código en GitHub |
| saihai-v1.3 | no disponible | no aplica | 53,5 % en h2h contra v1.4 (85–16–99 a favor de v1.3); sin medición independiente publicada en esta información | MIT (según el linaje descrito) | Pesos referenciados como versión anterior; repositorio no indicado |
| Otros agentes de gateball o de juego clásico | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una red neuronal: no genera texto, no responde a prompts y no admite tool calling. Cualquier expectativa de uso como LLM es un error de categoría.
- Los ficheros son JSON plano leídos por el paquete TypeScript; no se cargan con `transformers`, PyTorch ni ningún framework de ML.
- El autor reporta explícitamente que v1.4 no es mediblemente más fuerte que v1.3 en self-play (46,5 %, intervalo ≈ ±6,9): cambió el estilo en situaciones documentadas, no la fuerza global. No debe presentarse como mejora de rendimiento.
- Las cifras dependen de condiciones concretas (poste de 0,025 m, semillas por defecto, certeza del nivel "Kantoku IA"); con un poste de 0,05 m el mismo modelo daba 49,8 % en h2h y 87,3 % en humanduel. Comparar números entre configuraciones distintas no es válido.
- Las reglas kantoku son fijas y fueron definidas por el juicio del autor como jugador y kantoku de gateball, no aprendidas: introducen el sesgo táctico de una sola persona y no están validadas contra otros estilos de juego.
- `attackTable.json` está precalculada para dos perfiles de rival (humanoide y CPU) sobre una rejilla de distancias, ángulos y potencias; frente a rivales fuera de esa rejilla o con otros errores de ejecución, las probabilidades de desenlace dejan de ser válidas.
- El fitness es ruidoso por diseño (azar en la hierba y errores de ejecución), de modo que las diferencias pequeñas entre versiones caen dentro del intervalo de confianza y no deben interpretarse como señal.
- El entrenamiento se hizo con perfiles de "certeza" sorteados para generalizar entre equipos; no hay garantía de comportamiento fuera de ese rango de error de ejecución.
- Sin validación externa: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y una sola fuente (el propio autor) para todos los resultados.
- La model card disponible está truncada en la sección de limitaciones (corta en "**C"), por lo que pueden existir advertencias adicionales del autor no recogidas aquí.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene conservar el aviso de copyright y el texto de la licencia al redistribuir los pesos.
- Sesgos sociales o de alucinación: no aplica, al no tratar texto ni generar contenido lingüístico. El riesgo equivalente es el sesgo estratégico de las reglas fijas y de la función de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ckomiya/saihai-gateball
- Repositorio de código (motor de reglas, física, planificador, entrenamiento y medición): https://github.com/ckomiya/saihai-gateball
- Historial de entrenamiento y notas honestas sobre cada cambio, incluidos los que no ayudaron (en español): https://github.com/ckomiya/saihai-gateball/blob/main/TRAINING.md
- README en español: https://huggingface.co/ckomiya/saihai-gateball/blob/main/README.es.md
- Referencia de baseline y comandos del repositorio: `CLAUDE.md` en el repositorio de GitHub (no se dispone de URL directa en la información proporcionada)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
