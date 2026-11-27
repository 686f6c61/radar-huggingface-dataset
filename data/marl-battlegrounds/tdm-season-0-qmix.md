# MARL-BattleGrounds/tdm-season-0-qmix

## Resumen

QMIX (Team Deathmatch, Season 0) es un agente de aprendizaje por refuerzo multiagente entrenado para el entorno TDM de MARL-BattleGrounds (MARL-BGs), un benchmark en JAX donde dos equipos de cinco agentes (Mage, Warrior, Hunter, Rogue y Priest) se enfrentan en combate por equipos. El modelo lo publica la organizacion MARL-BattleGrounds y emplea el algoritmo QMIX, un metodo de aprendizaje de valores con descomposicion monotona de la funcion de valor conjunta en valores individuales por agente. La ejecucion es descentralizada: el modelo decide para cada agente por separado, sin intercambio de mensajes entre companeros de equipo.

El repositorio no contiene un unico modelo, sino 336 instantaneas portables del entrenamiento, desde el paso 0 hasta el paso 250.675.200, cada una exportada con `jax.export` y ejecutable bajo `jit` y `vmap` sin necesidad del codigo de entrenamiento. La instantanea que disputo la Temporada 0 corresponde al paso 219.095.040, quedo en cuarta posicion de nueve participantes y obtuvo un Elo de 1.300 (intervalo del 95 %: 1.288-1.313), en el tier Gold 3.

Su relevancia es doble: por un lado, sirve como linea base reproducible para investigacion en MARL sobre un entorno de combate por equipos con decisiones descentralizadas; por otro, su formato de instantaneas portables permite arrancar nuevos entrenamientos desde cualquier punto, usarlo como oponente o companero en evaluaciones y reproducir partidas exactas en CPU o en GPU en modo determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QMIX (aprendizaje de valores multiagente con descomposicion monotona); red de agente exportada con `jax.export` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno de juego por ticks, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo JAX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (agente de control, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.zip` portable por instantanea (programa de decision exportado con `jax.export` y pesos); metadatos en `steps.csv` y `config.json` |
| Tamano del repositorio | 2,8 GB (la model card indica ~2,9 GB) |
| Numero de instantaneas | 336 (paso 0 a 250.675.200) |
| Semilla de entrenamiento | 12259871 |
| Ejecucion | Descentralizada, sin mensajes entre companeros |
| Libreria | `marl-battlegrounds` |

## Arquitectura y entrenamiento

El modelo sigue el algoritmo QMIX, que aprende una funcion de valor de accion conjunta Q_total y la descompone en valores individuales Q_i por agente mediante una red mezcladora con restricciones de monotonia, de modo que la accion greedy individual de cada agente es consistente con la accion greedy conjunta. La ejecucion es descentralizada: cada agente decide con su propia funcion de decision, sin mensajes entre companeros. El codigo del learner se adapta de Mava (InstaDeep); el repositorio documenta los commits exactos, las licencias y las modificaciones aplicadas en `method_sources.md`.

El entrenamiento se realizo en dos ejecuciones encadenadas: la primera cubre los pasos 0 a 40.108.032 y la segunda continua desde ese punto hasta el paso 250.675.200. Un paso equivale a una transicion de entorno (un tick de partida). El repositorio incluye los registros de ambas ejecuciones (configuracion, curvas de aprendizaje, logs de actualizacion y partidas de validacion). La validacion se hizo contra un panel fijo formado por Recurrent MAPPO (modelo `recurrent-mappo-combat-support-pooled-step-250675200`), `tdm-alpha`, `tdm-beta` y `tdm-gamma`, con 128 partidas por comprobacion en los mapas de validacion 42, 43, 44 y 46. El estado de entrenamiento (critico, mezclador, optimizador) no se publica, por lo que la ejecucion original no puede reanudarse; solo es posible iniciar una nueva desde cualquier instantanea.

## Capacidades

- Control multiagente descentralizado en un entorno de combate por equipos de cinco contra cinco con cinco roles (Mage, Warrior, Hunter, Rogue y Priest).
- Toma de decisiones por agente de forma independiente, sin comunicacion entre companeros.
- Ejecucion bajo `jit` y `vmap` en JAX sin el codigo de entrenamiento, lo que permite lotes de partidas vectorizadas.
- Portabilidad entre versiones de JAX: los ficheros funcionan con versiones de JAX hasta seis meses posteriores a la que los genero, segun la garantia de compatibilidad de programas exportados de JAX.
- Reproducibilidad determinista en CPU o en GPU en modo determinista con las mismas entradas y semillas.
- Uso como oponente, companero, sujeto de evaluacion o cliente de batalla dentro del ecosistema MARL-BGs.
- Punto de partida para nuevos entrenamientos (`initial_actor`), reutilizando los pesos del actor y reiniciando el resto del learner.

## Casos de uso

- Linea base de investigacion en MARL: el modelo sirve como referencia QMIX reproducible sobre TDM para comparar nuevos algoritmos (MAPPO, VDN, QTRAN u otros) bajo el mismo protocolo de evaluacion y el mismo panel de oponentes.
- Evaluacion de oponentes en curriculum: cualquier modelo nuevo puede enfrentarse a esta instantanea (o a la ladder completa de 336 guardados) para medir progreso con el Elo y el margen de puntos por partida.
- Arranque en caliente de nuevos entrenamientos: mediante `initial_actor` con `@final` o cualquier paso intermedio, se reutilizan los pesos del actor y se acelera la convergencia en lugar de partir de cero.
- Reproduccion de resultados cientificos: las partidas de la Temporada 0 pueden replicarse exactamente en CPU o GPU determinista, lo que facilita la verificacion de publicaciones que citen el benchmark.
- Estudio de coordinacion descentralizada: al no usar mensajes entre companeros, permite analizar hasta que punto la descomposicion de valores de QMIX basta para coordinar roles heterogeneos sin comunicacion explicita.
- Analisis de robustez y generalizacion: la comparacion entre instantaneas de distintos pasos (por ejemplo, `@100M` frente a `@final`) sobre mapas de validacion y de test permite estudiar la evolucion del comportamiento y el sobreajuste a mapas concretos.
- Integracion en pipelines de evaluacion automatizada: la API `marl_bgs.evaluate` con `num_episodes` configurable permite incorporar el modelo como test de regresion en CI para entornos MARL.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la model card:

| Metrica | Valor |
|---|---|
| Tarea | Team Deathmatch (reinforcement-learning) |
| Dataset de evaluacion | TDM Season 0 (`MARL-BattleGrounds/tdm-season-0-results`) |
| Elo Temporada 0 | 1.300 (intervalo del 95 %: 1.288-1.313) |
| Verificado | No (`verified: false`) |
| Posicion en la Temporada 0 | 4 de 9 |
| Tier | Gold 3 |
| Instantanea evaluada | Paso 219.095.040 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un agente de control. Las metricas de validacion internas (`validation_point_margin`, `validation_kills`, `validation_deaths`) se registran en `steps.csv` y en `training-records/*/validation_results.json`, pero sus valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (2,8 GB) incluye las 336 instantaneas y los registros de entrenamiento, no el peso de una sola; el tamano de un unico fichero de modelo no se detalla en la informacion disponible.
- GPU: la model card cita una RTX 5090 para la comprobacion de release (1.080 partidas en mapas de test 47-51). No se especifican requisitos minimos ni recomendaciones para A100, H100 u otras GPU.
- GPU de consumo: el modelo se ha ejecutado en una RTX 5090, por lo que cabe en hardware de consumo de gama alta; no se confirma compatibilidad con GPU de gama media o baja.
- CPU: soportada, con reproduccion determinista de partidas.
- Despliegue: libreria `marl-battlegrounds` (carga con `marl_bgs.load_method`, evaluacion con `marl_bgs.evaluate`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numerica; la model card solo indica que la comprobacion de release jugo 1.080 partidas en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Algoritmo | Ejecucion | Contexto / entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tdm-season-0-qmix (este) | QMIX | Descentralizada, sin mensajes | TDM 5v5, 336 instantaneas hasta 250,7 M pasos | Apache 2.0 | Hugging Face |
| recurrent-mappo-combat-support-pooled-step-250675200 | Recurrent MAPPO | No disponible en la informacion | TDM, usado como oponente de validacion | no disponible | Dataset de resultados de MARL-BGs |
| tdm-alpha, tdm-beta, tdm-gamma | No disponible | No disponible | TDM, oponentes fijos de validacion y test | no disponible | MARL-BGs |

Los tres oponentes citados se emplean como panel de validacion y test en la model card, pero la informacion proporcionada no detalla sus parametros, contexto, rendimiento ni licencia, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El Elo de 1.300 esta marcado como no verificado (`verified: false`) y procede del propio autor.
- La instantanea de la Temporada 0 quedo cuarta de nueve, en tier Gold 3; no es el mejor modelo del benchmark.
- El estado de entrenamiento (critico, mezclador, optimizador) no se publica: no se puede reanudar la ejecucion original, solo iniciar una nueva desde una instantanea.
- La ejecucion es descentralizada y sin mensajes entre companeros, lo que limita la coordinacion explicita frente a metodos con comunicacion.
- La compatibilidad de los ficheros exportados con JAX esta garantizada solo hasta seis meses posteriores a la version que los genero; versiones mas nuevas pueden requerir reexportacion.
- La reproducibilidad exacta exige CPU o GPU en modo determinista; en GPU en modo normal pueden aparecer diferencias numericas.
- El modelo esta especializado en un unico entorno y mapa del benchmark TDM; no es transferible a otros juegos ni tareas sin reentrenamiento.
- No se documentan sesgos, tasas de alucinacion ni comportamiento fuera de distribucion; se desconoce su robustez ante configuraciones no vistas.
- La licencia Apache 2.0 permite uso comercial, pero el codigo del learner derivado de Mava puede arrastrar obligaciones adicionales que deben revisarse en `method_sources.md`.
- El repositorio ocupa 2,8 GB y cada fichero se descarga y verifica contra `steps.csv` antes de usarse; conviene planificar el almacenamiento y el ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARL-BattleGrounds/tdm-season-0-qmix
- Repositorio MARL-BattleGrounds: https://github.com/arm-2-lab/MARL-BattleGrounds
- Fuentes de metodos (commits, licencias y cambios): https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/method_sources.md
- Guia de modelos publicados: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/released_models.md
- Reglas del leaderboard (ejecucion y mensajes entre companeros): https://marl-battlegrounds.com/#leaderboard-rules~execution-and-teammate-messages
- Mava (InstaDeep), codigo base del learner: https://github.com/instadeepai/Mava
- Garantias de compatibilidad de `jax.export`: https://docs.jax.dev/en/latest/export/export.html#compatibility-guarantees
- Paper citado (arXiv:2610.14883): https://arxiv.org/abs/2610.14883
