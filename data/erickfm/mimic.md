# erickfm/MIMIC

## Resumen

MIMIC (Melee Imitation Model for Input Cloning) es una colección de ocho modelos de imitación entrenados para jugar a Super Smash Bros. Melee, un videojuego de lucha de GameCube. El autor, erickfm, parte de la arquitectura HAL de Eric Gu y la extiende con cambios propios orientados a resolver limitaciones estructurales del original, en particular la incapacidad de ejecutar wavedash y airdodge. Cada checkpoint está especializado en un personaje concreto (Fox, Falco, Marth, Sheik, Captain Falcon, Luigi, Peach, Jigglypuff e Ice Climbers) y se distribuye como pesos PyTorch sin cuantizar.

Técnicamente no es un modelo de lenguaje: es un transformer causal de unos 20 millones de parámetros por personaje que consume una ventana de 180 fotogramas de estado del juego y emite directamente entradas de mando (stick principal, c-stick, gatillos y botones) a 60 Hz. La entrada se codifica mediante una capa lineal que proyecta 184 características numéricas a 512 dimensiones, sobre las que se aplica atención con codificación de posición relativa de Shaw en seis bloques pre-norm. El modelo se ejecuta sobre Dolphin + libmelee y puede conectarse a partidas de Slippi Online Direct Connect.

Su relevancia es acotada pero clara: demuestra que un transformer pequeño, entrenado con behavior cloning sobre replays humanos de alto nivel, puede generar inputs de mando válidos en un juego con requisitos de precisión de un fotograma, incluyendo técnicas avanzadas como wavedash. El repo ocupa 31,3 GB y la licencia es MIT, lo que permite reutilización y experimentación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal pre-norm con atención de posición relativa de Shaw; encoder lineal 184→512; 6 capas, 8 cabezas, d_ff=2048, GELU, LayerNorm; seq_len=180 |
| Parametros totales | ~20 M por personaje (8 checkpoints) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 180 fotogramas de estado de juego (ventana fija) |
| Tipos de cuantizacion | no disponible (checkpoints `model.pt` en fp32/raw PyTorch) |
| Idiomas soportados | no disponible (no aplica; modelo de control de videojuego) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`), más JSONs de configuración y normalización por personaje |
| Entrada | 184 características numéricas por fotograma (esquema de 13 columnas numéricas tras el schema drop de 2026-04-20) |
| Salidas | shoulder (3), c-stick (9), main stick (37), botones (7 clases) |
| Frecuencia de inferencia | 60 Hz |
| Tamaño del repo | 31,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atención de posición relativa de Shaw, con `d_model=512`, 6 bloques pre-norm, 8 cabezas y `d_ff=2048`. Cada fotograma de Slippi se codifica con una capa lineal (`MimicFlatEncoder`, 184→512) y se procesa en una ventana de 180 fotogramas. Las cabezas de salida son autorregresivas con `detach` y producen cuatro grupos de predicción: shoulder (3 clases), c-stick (9), stick principal (37) y botones (7). El modelo se inicializó desde HAL (Eric Gu) y divergió a partir de ahí.

Los cambios definitorios de MIMIC sobre HAL son tres. Primero, una cabeza de botones de 7 clases que incluye una clase TRIG dedicada a airdodge y wavedash (la cabeza de 5 clases de HAL no puede representar airdodge y por tanto no puede hacer wavedash). Segundo, una alineación de shards v2 que corrige una fuga sutil de estado post-fotograma en los objetivos de entrenamiento (documentada en `research-notes-2026-04-11c`). Tercero, un arreglo de pulsación digital de L en `decode_and_press` (research notes 2026-04-13) sin el cual ningún bot de behavior cloning con 7 clases ejecuta wavedash. Los datos de entrenamiento son replays ranked de Slippi (tiers master/diamond/platinum) por personaje, publicados en `erickfm/melee-ranked-replays`. El número de partidas de entrenamiento varía por personaje: 51.751 para Sheik, 31.030 para Fox, 20.882 para Falco, 17.557 para Captain Falcon, 11.759 para Marth y 2.290 para Luigi. No se documenta uso de RLHF ni DPO; es behavior cloning puro.

## Capacidades

- Generación de inputs de mando a 60 Hz a partir de estado de juego, incluyendo stick principal, c-stick, gatillos y botones.
- Ejecución de técnicas avanzadas que requieren la clase TRIG: airdodge y wavedash.
- Juego por personaje especializado: Fox, Falco, Marth, Sheik, Captain Falcon, Luigi, Peach, Jigglypuff e Ice Climbers.
- Integración con Dolphin + libmelee para partidas locales contra CPU de nivel 9.
- Conexión a Slippi Online Direct Connect para partidas en red.
- Frontend de bot de Discord (`tools/discord_bot.py`) que encola partidas direct-connect por usuario.
- No soporta tool calling, function calling, agentes multi-step, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Evaluación de técnicas de behavior cloning en dominios de control preciso: el modelo sirve como banco de pruebas para estudiar cómo un transformer pequeño aprende secuencias de acciones con requisitos de temporización de un fotograma, gracias a su ventana de 180 fotogramas y salidas discretizadas.
- Entrenamiento de sparring bots para jugadores humanos: un jugador puede practicar contra un personaje concreto (por ejemplo Marth) en Final Destination contra un CPU de nivel 9 o contra el bot, usando `tools/play_vs_cpu.py` con el checkpoint y el `data-dir` correspondiente.
- Investigación sobre wavedash y mecánicas dependientes de gatillo: la cabeza de 7 clases con TRIG permite estudiar qué condiciones de estado llevan al modelo a ejecutar airdodge/wavedash, algo imposible con la cabeza de 5 clases de HAL.
- Despliegue de bots en netplay: `tools/play_netplay.py` conecta un checkpoint a Slippi Online Direct Connect mediante un código de conexión, lo que permite evaluar el modelo contra oponentes humanos reales.
- Organización de torneos o ligas de bots: el frontend de Discord encola partidas direct-connect por usuario, de modo que varios checkpoints pueden enfrentarse de forma automatizada.
- Estudio de fugas de información en pipelines de imitación: la corrección de shard alignment v2 y las notas de investigación asociadas convierten el repo en un caso documentado de cómo un leak post-fotograma en los targets degrada el entrenamiento.
- Reproducción de experimentos de research: los JSONs de normalización, combos de botones, mapas categóricos y clusters de stick se copian verbatim del directorio de datos, lo que permite reentrenar o auditar la inferencia sin depender del repo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdida de validación y paso de entrenamiento por checkpoint:

| Personaje | Run | Partidas de entrenamiento | Val loss | Step |
|---|---|---|---|---|
| Fox | `fox-20260420-baseline` | 31.030 | 0,7144 | 32768 |
| Falco | `falco-20260420-baseline` | 20.882 | 0,7487 | 31392 |
| Marth | `marth-20260420-baseline` | 11.759 | 0,6664 | 31065 |
| Sheik | `sheik-20260420-baseline` | 51.751 | 0,6566 | 26160 |
| Captain Falcon | `cptfalcon-20260420-baseline` | 17.557 | 0,7368 | watchdog |
| Luigi | `luigi-20260420-baseline` | 2.290 | 0,7460 | watchdog |
| Peach | `peach-20260420-baseline` | no disponible | 0,6322 | no disponible |
| Jigglypuff | no disponible | no disponible | no disponible | no disponible |
| Ice Climbers | no disponible | no disponible | no disponible | no disponible |

No hay métricas de win rate, accuracy de inputs ni comparación cuantitativa con HAL u otros bots en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~20 M de parámetros por checkpoint en fp32, el peso del modelo es del orden de decenas de MB; el grueso del repo (31,3 GB) corresponde a los ocho checkpoints y metadatos, no a un único modelo en memoria.
- GPU recomendadas: no disponible. El cuello de botella real es la emulación de Dolphin y la sincronización a 60 Hz, no el transformer.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM, dado el tamaño del modelo; no se documenta una VRAM mínima oficial.
- Opciones de despliegue: script `tools/play_vs_cpu.py` (partida local contra CPU), `tools/play_netplay.py` (Slippi Online Direct Connect) y `tools/discord_bot.py` (frontend de Discord). Requiere Dolphin, libmelee y la ISO de Melee, instalables con `setup.sh`.
- Latencia y throughput: inferencia a 60 Hz por diseño; no se publican cifras de latencia por fotograma ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIMIC (erickfm) | ~20 M por personaje | 180 fotogramas | BC con transformer causal, cabeza de 7 clases con TRIG | MIT | Hugging Face + GitHub |
| HAL (Eric Gu) | no disponible | no disponible | BC con transformer, cabeza de 5 clases sin TRIG | no disponible en la información | GitHub |
| Alternativas de BC en Melee | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es con HAL, del que MIMIC deriva: la diferencia estructural es la cabeza de botones (7 clases frente a 5) y los arreglos de alineación de shards y pulsación digital de L, que habilitan wavedash. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Sesgos de los datos: entrenado solo con replays ranked de tiers master/diamond/platinum, por lo que el estilo de juego aprendido refleja ese nivel y no necesariamente el de otros rangos.
- Riesgo de alucinación en el sentido de inputs inválidos o incoherentes: al ser behavior cloning puro, el modelo puede degradarse fuera de la distribución de estados vista en entrenamiento.
- Cobertura incompleta de personajes: Peach está entrenado con el esquema de 22 columnas previo al schema drop y solo es cargable mediante su config pickled; Jigglypuff e Ice Climbers están en el esquema antiguo y son incompatibles con el código de inferencia actual de 13 columnas. Ambos requieren reentrenamiento.
- Dependencia de un pipeline externo frágil: requiere Dolphin, libmelee, la ISO de Melee y rutas concretas; los scripts asumen una instalación vía `setup.sh`.
- Sin cuantizaciones publicadas: solo se distribuyen pesos PyTorch crudos, lo que limita opciones de despliegue ligero fuera del stack previsto.
- Licencia MIT: permite uso comercial, pero el uso del modelo implica emular un juego con copyright de Nintendo; la licencia del modelo no cubre los derechos sobre la ROM ni sobre el juego.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto, visión o audio.

## Enlaces

- Hugging Face: https://huggingface.co/erickfm/MIMIC
- Repositorio GitHub: https://github.com/erickfm/MIMIC
- Dataset de replays: https://huggingface.co/datasets/erickfm/melee-ranked-replays
- Proyecto HAL (base arquitectónica): https://github.com/ericyuegu/hal
- Documentación del bot de Discord: https://github.com/erickfm/MIMIC/blob/main/docs/discord-bot-setup.md
