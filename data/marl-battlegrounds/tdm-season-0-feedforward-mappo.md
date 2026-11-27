# MARL-BattleGrounds/tdm-season-0-feedforward-mappo

## Resumen

`tdm-season-0-feedforward-mappo` es un modelo de aprendizaje por refuerzo multiagente (MARL) entrenado con Feedforward MAPPO para el entorno Team Deathmatch (TDM) del benchmark MARL-BattleGrounds (MARL-BGs), desarrollado por el laboratorio arm-2-lab. El entorno simula un combate entre dos equipos de cinco agentes con roles diferenciados (Mage, Warrior, Hunter, Rogue y Priest), y el modelo aprende una política descentralizada en la que cada agente decide de forma independiente, sin mensajes entre companeros de equipo. La implementacion del learner deriva de Mava, con ValueNorm tomado del codigo oficial de MAPPO.

El repositorio no contiene un unico checkpoint, sino 642 ficheros de modelo portables, uno por cada guardado del entrenamiento, desde el paso 0 hasta el paso 250.675.200. El guardado que disputo la temporada 0 es el del paso 208.568.320, que quedo en sexta posicion de nueve con un Elo de 1.140 (intervalo del 95 %: 1.126-1.155), dentro del tier Silver 2. Cada fichero se exporta con `jax.export` e incluye la funcion de decision de un agente y sus pesos, ejecutable bajo `jit` y `vmap` sin necesidad del codigo de entrenamiento.

La relevancia de esta publicacion es de tipo metodologico y de reproducibilidad: libera no solo el checkpoint final, sino toda la traza de guardados junto con registros de entrenamiento (curvas de aprendizaje, logs de actualizacion y partidas de validacion), lo que permite estudiar la evolucion de la politica a lo largo de 250 millones de transiciones de entorno y reutilizar cualquier guardado como oponente, companero o punto de partida de un nuevo entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feedforward MAPPO (actor-critico con ValueNorm), politica descentralizada por agente; exportada con `jax.export` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observaciones por tick del entorno) |
| Tipos de cuantizacion | no disponible (pesos JAX exportados; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; sin mensajes entre companeros) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros `.zip` portables con programa exportado mediante `jax.export` y pesos; metadatos en `steps.csv` y `config.json` |
| Tamano del repositorio | 2,3 GB (la model card indica aproximadamente 2,4 GB) |
| Numero de guardados | 642 (paso 0 a paso 250.675.200) |
| Semilla de entrenamiento | 12259871 |
| Guardado de temporada 0 | paso 208.568.320 (`models/step-208_568_320.zip`) |
| Ejecucion | descentralizada, sin mensajes entre companeros |
| Libreria | `marl-battlegrounds` |

## Arquitectura y entrenamiento

El modelo emplea Feedforward MAPPO, una variante de PPO para entornos multiagente con criticas centralizadas y politicas descentralizadas. La implementacion del learner se adapta de Mava y anade ValueNorm tomado del repositorio oficial de MAPPO; el documento `method_sources.md` del proyecto detalla los commits exactos, las licencias y las modificaciones introducidas. La politica es feedforward, es decir, no recurrente: cada agente decide a partir de su observacion en el tick actual, sin memoria explicita entre pasos mas alla de lo que contenga la propia observacion. No hay comunicacion entre companeros de equipo en este modelo.

El entrenamiento se realizo en dos ejecuciones encadenadas: la primera cubre los pasos 0 a 40.108.032 y la segunda continua desde ese punto hasta 250.675.200. Un paso equivale a una transicion de entorno, esto es, un tick de partida. El repositorio incluye los registros de ambas ejecuciones (ajustes, curvas de aprendizaje, logs de actualizacion y partidas de validacion). Algunos guardados se validaron contra un panel fijo formado por `Recurrent MAPPO` (modelo `recurrent-mappo-combat-support-pooled-step-250675200`), `tdm-alpha`, `tdm-beta` y `tdm-gamma`, con 128 partidas por comprobacion en los mapas de validacion 42, 43, 44 y 46, registrando margen de puntos, bajas y muertes por partida.

## Capacidades

- Control de agentes en entornos de combate por equipos: cada agente elige acciones de forma independiente en un escenario 5 contra 5 con cinco roles (Mage, Warrior, Hunter, Rogue y Priest).
- Politica descentralizada: no requiere estado global ni comunicacion en tiempo de inferencia.
- Ejecucion vectorizada: el programa exportado funciona bajo `jit` y `vmap`, lo que permite evaluar multiples agentes y episodios en paralelo.
- Reutilizacion como oponente, companero o evaluador dentro del ecosistema MARL-BGs.
- Punto de partida para nuevo entrenamiento: se puede inicializar el actor desde cualquier guardado (`@final`, `@100M`, `@99_942_400` o un paso exacto).
- Reproducibilidad determinista: en CPU o en GPU con modo determinista, el mismo fichero, entradas y ajustes reproducen las mismas partidas.
- Compatibilidad hacia adelante: los ficheros se ejecutan en versiones de JAX hasta 6 meses posteriores a la que los genero, segun la garantia de JAX para programas exportados.
- No soporta lenguaje natural, vision, audio, tool calling ni razonamiento multi-paso fuera del bucle de decision del entorno.

## Casos de uso

- Evaluacion de referencia en MARL: usar el guardado de temporada 0 como oponente fijo para medir el progreso de nuevas politicas en TDM, aprovechando que su Elo (1.140) y su intervalo de confianza estan documentados.
- Entrenamiento con curriculum de oponentes: la guia de modelos liberados describe como entrenar contra una escalera de guardados, lo que permite calibrar la dificultad de los rivales a lo largo del entrenamiento.
- Investigacion sobre aprendizaje multiagente: los 642 guardados y los registros de ambas ejecuciones permiten analizar la evolucion de la politica, el efecto del numero de pasos y la estabilidad del entrenamiento sin coste de computo adicional.
- Reproduccion de resultados: el fichero del paso 208.568.320 coincide con el guardado original en las 1.080 partidas contra TDM-Alpha, TDM-Beta y TDM-Gamma en los mapas de test 47-51, lo que lo hace adecuado para replicar experimentos publicados.
- Punto de partida para ajuste fino: inicializar el actor desde `@final` o desde un guardado intermedio para estudiar transferencia entre configuraciones del entorno o variantes de recompensa.
- Benchmarking de infraestructura JAX: al ejecutarse bajo `jit` y `vmap` sin codigo de entrenamiento, sirve para medir throughput de inferencia en distintas GPU con cargas de simulacion realistas.
- Docencia y divulgacion: ejemplo completo de un pipeline MARL con codigo abierto, pesos liberados y trazas de entrenamiento verificables.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Team Deathmatch | TDM Season 0 (`MARL-BattleGrounds/tdm-season-0-results`) | Elo de temporada 0 | 1.140 (IC 95 %: 1.126-1.155) | No |

Posicion en la temporada 0: 6 de 9 participantes, tier Silver 2. No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de refuerzo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 2,3 GB, pero corresponde a 642 ficheros de modelo; cada guardado individual es una fraccion de ese total. Conviene consultar la columna `bytes` de `steps.csv` para el tamano exacto de cada fichero.
- GPU recomendadas: la verificacion de liberacion se ejecuto en una RTX 5090 en modo GPU normal; el modelo es lo bastante ligero para GPUs de consumo, aunque no se documentan requisitos minimos.
- CPU: soportada; en CPU o en GPU con modo determinista la reproduccion es exacta.
- Despliegue: mediante la libreria `marl-battlegrounds` (`marl_bgs.load_method`, `marl_bgs.evaluate`), con JAX como runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. La evaluacion de referencia usa 20 episodios en el ejemplo de la model card, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Metodo | Parametros | Contexto | Elo temporada 0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tdm-season-0-feedforward-mappo` (este) | Feedforward MAPPO, descentralizado, sin mensajes | no disponible | no disponible | 1.140 (puesto 6 de 9) | Apache 2.0 | Hugging Face, 642 guardados |
| `recurrent-mappo-combat-support-pooled-step-250675200` | Recurrent MAPPO, con soporte de combate agrupado | no disponible | no disponible | no disponible | no disponible | Dataset de resultados MARL-BGs (`training-opponents/models/`) |
| `tdm-alpha`, `tdm-beta`, `tdm-gamma` | no disponible | no disponible | no disponible | no disponible | no disponible | Entornos y oponentes de referencia de MARL-BGs |

La informacion disponible solo permite comparar el metodo y el Elo declarado; no se detallan parametros, contexto ni resultados de los modelos alternativos.

## Limitaciones y advertencias

- El Elo de 1.140 no esta verificado (`verified: false` en el model-index) y procede de una unica temporada con nueve participantes; el intervalo de confianza del 95 % abarca de 1.126 a 1.155.
- La politica es feedforward y sin comunicacion entre companeros, lo que limita la coordinacion frente a variantes recurrentes o con mensajes.
- No se libera el estado de entrenamiento (critico, mixer, optimizador), por lo que no es posible continuar la ejecucion original; solo iniciar una nueva desde un guardado.
- El metodo y la escala de entrada deben coincidir con los del modelo (`ff_mappo`, `input_scale=0.01`) al reutilizarlo para entrenamiento.
- La reproducibilidad exacta requiere CPU o GPU en modo determinista; en GPU normal puede haber diferencias no deterministas.
- El modelo solo es valido dentro del entorno MARL-BGs; no es un modelo de lenguaje ni procesa texto, imagenes o audio.
- No se documentan sesgos, riesgos de alucinacion ni comportamiento fuera de distribucion en el entorno; cualquier uso en produccion fuera del benchmark carece de garantias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de codigo de terceros (Mava, MAPPO) cuyas licencias y commits deben revisarse en `method_sources.md`.
- El repositorio pesa 2,3 GB y descarga cada fichero una vez, verificandolo contra `steps.csv`; conviene planificar el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARL-BattleGrounds/tdm-season-0-feedforward-mappo
- Repositorio MARL-BattleGrounds: https://github.com/arm-2-lab/MARL-BattleGrounds
- Guia de modelos liberados: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/released_models.md
- Fuentes de metodos: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/method_sources.md
- Reglas de la clasificacion (ejecucion y mensajes): https://marl-battlegrounds.com/#leaderboard-rules~execution-and-teammate-messages
- Mava (learner base): https://github.com/instadeepai/Mava
- MAPPO oficial (ValueNorm): https://github.com/marlbenchmark/on-policy
- Documentacion de `jax.export`: https://docs.jax.dev/en/latest/export/export.html
- Paper referenciado (arXiv:2610.14883): https://arxiv.org/abs/2610.14883
