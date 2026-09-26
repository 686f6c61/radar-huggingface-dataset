# danbrooks/draftzero-fdn-exp1

## Resumen

DraftZero experiment #1 (`danbrooks/draftzero-fdn-exp1`) es un agente de aprendizaje por refuerzo entrenado por auto-juego para jugar con **cualquier** baraja del formato limited de Magic: The Gathering Foundations (FDN), en lugar de un agente especializado por baraja. Lo publica Daniel Brooks y se apoya en MageZero, el motor de entrenamiento con red neuronal y búsqueda MCTS inspirado en AlphaZero, más el motor de reglas XMage para ejecutar las partidas.

El agente es un transformer de 2 capas con `d_model` 512 y cabezas de política y valor que guían una búsqueda MCTS. Se entrenó durante 2.507 partidas repartidas en 34 generaciones sobre una única GPU RunPod L40S, con un coste aproximado de 34 horas y 28 dólares. En cada partida se sorteaban las dos barajas de un conjunto de 28.366 barajas de jugadores con win-rate igual o superior al 60%, derivadas de los datos públicos de 17lands.

Su relevancia es acotada pero concreta: no es un jugador fuerte, sino una línea base reproducible y un conjunto de oponentes preentrenados para quien investigue agentes de limited. La red aporta una ventaja modesta sobre la búsqueda pura (55,8% en la evaluación final) y el entrenamiento se estancó hacia la generación 10. Además, todavía no se pueden jugar partidas de extremo a extremo con los checkpoints porque el build de XMage que emite el vocabulario de acciones no está publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 2 capas con `d_model` 512 y cabezas de política y valor, integrado en búsqueda MCTS (estilo AlphaZero) mediante MageZero |
| Parámetros totales | no disponible (la model card solo especifica 2 capas y `d_model` 512) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una codificación de estado de partida de XMage) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (emite acciones sobre un vocabulario fijo; no procesa ni genera lenguaje natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`) comprimido con gzip (`.pt.gz`) en `checkpoints/` |
| Tamaño del repositorio | 0,6 GB |
| Pipeline declarado | reinforcement-learning |
| Checkpoints incluidos | `gen33.pt.gz` (final), `gen10.pt.gz` (estancamiento), `gen0.pt.gz` (primer checkpoint entrenado, partiendo de 96 partidas de bootstrap con búsqueda heurística) |
| Dataset de barajas | 31.516 barajas en formato XMage `.dck`; partición por draft de 28.366 de entrenamiento y 3.150 de evaluación |
| Trazabilidad | `run/games.jsonl` (todas las partidas), `run/metrics.jsonl` (métricas por generación), `run/final_eval.json`, `run/deck_records.tsv`, `run/run.json`, dashboards y `report.md` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-25 |

## Arquitectura y entrenamiento

El agente reutiliza la red de MageZero: un transformer de 2 capas con `d_model` 512 y dos cabezas de salida, una de política sobre el vocabulario de acciones y otra de valor. La política y el valor se emplean para guiar una búsqueda MCTS en lugar de jugar directamente la salida de la red, lo que permite comparar el agente contra la misma búsqueda sin red (*raw search*) como baseline interno. Cada checkpoint lleva su propio vocabulario de características y el vocabulario de acciones vive en un fichero separado, `assets/vocab/FDN_SPG.tsv`, referenciado por la variable `MZ_ACTION_VOCAB`.

El entrenamiento es auto-juego puro: no hay RLHF ni DPO ni ningún ajuste con preferencias humanas. La generación 0 se inicializó con 96 partidas de bootstrap mediante búsqueda heurística y, a partir de ahí, se jugaron 2.507 partidas en 34 generaciones sobre una L40S (unas 34 horas, unos 28 dólares). El pool de barajas procede de los datos públicos de FDN Premier Draft de 17lands, filtrando solo jugadores en el tramo de win-rate ≥60%, y cada partida se disputa con dos barajas sorteadas al azar, de modo que el agente debe generalizar entre arquetipos en lugar de memorizar una lista concreta. No se documenta ninguna innovación de decodificación especulativa, atención lineal ni mecanismo similar: la aportación del experimento es el enfoque generalista *deck-agnostic* y la publicación íntegra de datos y partidas.

## Capacidades

- Jugar partidas completas de Magic: The Gathering en formato FDN limited con **cualquier** baraja del pool, no solo con una baraja fija.
- Guiar búsqueda MCTS con estimaciones de política y valor, mejorando de forma modesta a la búsqueda pura.
- Producir estimaciones de valor de carta comparables (con limitaciones) con las estadísticas humanas de 17lands.
- Emitir acciones en un vocabulario fijo sobre el motor de reglas XMage, siempre que se disponga del build generalista de XMage.
- Servir como oponente preentrenado y como línea base comparable para otros agentes de limited.
- No dispone de *tool calling*, *function calling*, razonamiento multi-step en lenguaje natural, visión, audio ni generación de texto: es un agente de decisión sobre estados de juego, no un modelo de lenguaje.

## Casos de uso

- **Línea base para investigación en limited de MTG**: cualquier agente nuevo puede evaluarse contra `gen33.pt.gz` con las particiones y las parejas de evaluación ya publicadas, lo que evita reconstruir un oponente desde cero.
- **Oponente preentrenado en bucles de auto-juego**: el propio autor lo describe como un conjunto de oponentes listos para entrenar agentes de limited, de modo que un pipeline nuevo no arranque contra búsqueda aleatoria o heurísticas triviales.
- **Reproducción de AlphaZero en información imperfecta**: el repositorio incluye cada partida (`run/games.jsonl`), cada métrica por generación (`run/metrics.jsonl`) y la configuración de la ejecución, lo que permite auditar cómo evoluciona la fuerza a lo largo de 34 generaciones.
- **Estudio de generalización frente a especialización**: al comparar este agente generalista con agentes entrenados por baraja se puede medir el coste real de no especializar, usando el mismo motor y el mismo pool de 28.366 barajas de entrenamiento y 3.150 de evaluación.
- **Auditoría de estadísticas derivadas**: el desacuerdo entre el valor de carta aprendido y las cifras de 17lands (ρ de Spearman 0,28 en comunes) es un caso de estudio concreto sobre cuándo las estadísticas de auto-juego no deben usarse como referencia.
- **Experimentación de RL con presupuesto reducido**: con 2.507 partidas, 34 horas y unos 28 dólares en una L40S, el experimento sirve como plantilla de coste para validar ideas antes de escalar.
- **Construcción de conjuntos de datos de drafts**: las 31.516 barajas `.dck` con metadatos de colores y tramo de win-rate, junto con la partición por draft, son reutilizables para otros experimentos de drafting y construcción de mazos.
- **Docencia y divulgación técnica**: los dashboards incluidos (`dashboards/index.html`) permiten mostrar el progreso del entrenamiento y la evolución del formato sin escribir código adicional.

## Benchmarks y rendimiento

Datos publicados en la model card (sin cifras adicionales en la información disponible):

| Medición | Resultado | IC 95% |
|---|---|---|
| Entrenamiento | 2.507 partidas, 34 generaciones, una RunPod L40S, ~34 h, ~28 USD | no disponible |
| Gen 33 vs búsqueda pura (misma búsqueda, sin red), evaluación final | 110/197 (55,8%) | 49–63% |
| Gen 33 vs gen 10, evaluación final | 96/196 (49,0%) | 42–56% |
| Todas las evaluaciones de hitos vs búsqueda pura, agrupadas | 137/238 (57,6%) | 51–64% |
| Acuerdo de valor de carta con 17lands (ρ de Spearman, comunes, generaciones 10+) | 0,28 | no disponible |
| Comportamiento cualitativo | El *premium removal* se juega en el 45–46% de los casos frente al 58% en 17lands | no disponible |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Entrenamiento documentado**: una única GPU RunPod L40S, ~34 horas y ~28 dólares para 2.507 partidas en 34 generaciones.
- **VRAM de inferencia**: no publicada. La model card no ofrece cifras de memoria; el único componente neuronal descrito es un transformer de 2 capas con `d_model` 512, por lo que el checkpoint es de tamaño reducido, pero no se aporta ninguna medición de VRAM ni de latencia.
- **GPU recomendadas**: no disponibles. La única GPU citada en el experimento es la L40S, y lo es en el contexto de entrenamiento, no de inferencia.
- **Viabilidad en GPU de consumo**: no confirmada por el autor; no hay datos publicados al respecto.
- **Opciones de despliegue**: no aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. El *runtime* real es MageZero 0.1.0 (`pip install "magezero @ git+https://github.com/danieljbrooks/MageZero@bcc76de"`) junto con XMage y el vocabulario de acciones `FDN_SPG.tsv`.
- **Bloqueo de ejecución**: el build generalista de XMage que emite acciones en ese vocabulario aún no está publicado, de modo que los checkpoints pueden inspeccionarse pero no jugarse de extremo a extremo.
- **Compatibilidad**: no se ha probado si los checkpoints cargan bajo MageZero v0.2.0, y nada de esto se ha ejecutado fuera del *harness* de entrenamiento.

## Comparativa con modelos similares

No se referencian en la información disponible otros modelos públicos comparables de la misma categoría. La comparación posible es con los baselines internos del propio experimento:

| Sistema | Tipo | Entrada | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DraftZero exp1 (gen 33) | Agente RL generalista para FDN limited | Estado de partida codificado por MageZero + vocabulario de acciones `FDN_SPG` | 55,8% (110/197) vs búsqueda pura | CC BY 4.0 | Pesos y datos en HuggingFace; ejecución bloqueada hasta publicar el fork de XMage |
| Búsqueda pura (*raw search*) | Baseline interno sin red neuronal | El mismo estado, misma búsqueda | Referencia de comparación (0 por definición) | Parte del *harness* `draft-zero` (MIT) | Incluido en el repositorio `draft-zero` |
| DraftZero gen 10 | Checkpoint intermedio | Igual | 49,0% (96/196) frente a gen 33, diferencia no significativa | CC BY 4.0 | Incluido en `checkpoints/gen10.pt.gz` |
| MageZero (upstream) | Framework de entrenamiento con red y MCTS | Codificación propia | no disponible | no disponible en la información | GitHub de WillWroble |

## Limitaciones y advertencias

- **No es un jugador fuerte**: el propio autor lo declara explícitamente. La ventaja sobre la búsqueda pura es modesta (55,8%, con un intervalo de confianza que baja hasta el 49%).
- **Entrenamiento estancado**: la comparación gen 33 contra gen 10 da un 49,0% con IC 95% de 42–56%, es decir, sin mejora demostrable desde la generación 10.
- **No ejecutable de extremo a extremo**: falta el fork público de XMage que emite el vocabulario de acciones; hasta su publicación, los checkpoints solo pueden inspeccionarse.
- **Compatibilidad sin verificar**: no se ha probado la carga bajo MageZero v0.2.0 ni la ejecución fuera del *harness* de entrenamiento.
- **Estadísticas de auto-juego no fiables**: el acuerdo con 17lands es de ρ = 0,28 en cartas comunes, y el *premium removal* se juega en el 45–46% de los casos frente al 58% humano. No deben usarse como referencia de valor de carta.
- **Sesgo de selección en los datos**: el pool solo contiene barajas de jugadores con win-rate ≥60% en FDN Premier Draft de 17lands, lo que sobrerrepresenta arquetipos y decisiones de jugadores fuertes y excluye el resto de la distribución.
- **Cobertura limitada a un formato**: únicamente Foundations (FDN) limited; no hay evidencia de transferencia a otros formatos, a constructed ni a otras ediciones.
- **Idioma y modalidad**: no es un modelo de lenguaje, no procesa texto libre, no soporta *tool calling* ni agentes multi-step fuera del bucle de juego.
- **Licencia y atribución**: la release es CC BY 4.0 y los datos derivan de los conjuntos públicos de 17lands, también CC BY 4.0; cualquier uso debe acreditar a 17lands y a esta release. El *harness* `draft-zero` es MIT, pero la licencia de MageZero no se especifica en la información.
- **Sin validación externa**: el repositorio se publicó con 0 descargas y 0 likes, sin revisión ni reproducción independiente.

## Enlaces

- [Modelo en HuggingFace: danbrooks/draftzero-fdn-exp1](https://huggingface.co/danbrooks/draftzero-fdn-exp1)
- [Repositorio del harness draft-zero (MIT)](https://github.com/danieljbrooks/draft-zero)
- [Tag exp1-fdn-generalist del harness](https://github.com/danieljbrooks/draft-zero/tree/exp1-fdn-generalist)
- [Vocabulario de acciones FDN_SPG.tsv](https://github.com/danieljbrooks/draft-zero/blob/exp1-fdn-generalist/assets/vocab/FDN_SPG.tsv)
- [Fork de MageZero usado en el experimento (commit bcc76de)](https://github.com/danieljbrooks/MageZero/tree/bcc76de)
- [MageZero upstream, de Will Wroble](https://github.com/WillWroble/MageZero)
- [Issue WillWroble/MageZero#3 (asesoramiento sobre cómputo y rendimiento)](https://github.com/WillWroble/MageZero/issues/3)
- [17lands](https://www.17lands.com/)
- [Conjuntos de datos públicos de 17lands](https://www.17lands.com/public_datasets)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Proyecto XMage (motor de reglas)](https://github.com/magefree/mage)
- [Perfil de chrismaghuhn](https://github.com/chrismaghuhn)
