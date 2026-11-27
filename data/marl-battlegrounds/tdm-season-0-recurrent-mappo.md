# MARL-BattleGrounds/tdm-season-0-recurrent-mappo

## Resumen

tdm-season-0-recurrent-mappo es un modelo de aprendizaje por refuerzo multiagente (MARL) entrenado con el algoritmo Recurrent MAPPO para el entorno Team Deathmatch de MARL-BattleGrounds (MARL-BGs), un benchmark implementado en JAX en el que dos equipos de cinco agentes (Mage, Warrior, Hunter, Rogue y Priest) se enfrentan entre si. Lo desarrolla el grupo MARL-BattleGrounds y resuelve el problema de proporcionar una politica de control descentralizada y reproducible para cada uno de los cinco agentes de un equipo, sin mensajes entre companeros, en un juego de combate por equipos por turnos de simulacion.

El modelo no es un modelo de lenguaje: es una funcion de decision exportada con `jax.export` que contiene los pesos de un actor recurrente y se ejecuta bajo `jit` y `vmap` sin necesidad del codigo de entrenamiento. Su relevancia actual radica en que forma parte de la primera temporada competitiva del benchmark (Season 0), donde obtuvo el puesto 3 de 9 con un Elo de 1.304 (intervalo del 95 %: 1.288-1.322, nivel Gold 3), y en que el repositorio publica 642 instantaneas portables del entrenamiento, desde el paso 0 hasta el 250.675.200, junto con los registros de entrenamiento completos.

El contexto de uso es la investigacion en MARL y la evaluacion comparativa de algoritmos: el modelo sirve como oponente, como companero de equipo, como punto de partida para nuevos entrenamientos o como referencia reproducible en evaluaciones. El repositorio ocupa aproximadamente 2,6 GB e incluye la instantanea concreta que jugo la temporada (paso 219.103.232).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico recurrente (Recurrent MAPPO) con red recurrente por agente; exportado como programa JAX con `jax.export` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la memoria recurrente del agente; no se especifica la longitud de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en el formato portable de JAX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivos `.zip` portables por instantanea (`models/step-XXX_XXX_XXX.zip`) con la funcion de decision y los pesos exportados con `jax.export`; metadatos en `steps.csv` y `config.json` |
| Tamano del repositorio | 2,6 GB |
| Semilla de entrenamiento | 20261002 |
| Numero de instantaneas | 642 (paso 0 a 250.675.200) |
| Ejecucion | Descentralizada (cada agente decide por separado) |
| Mensajes entre companeros | Ninguno |
| Entorno | Team Deathmatch de MARL-BattleGrounds (2 equipos de 5 agentes) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma actor-critico de MAPPO (Multi-Agent PPO) en su variante recurrente: cada agente dispone de una politica recurrente que mantiene estado interno a lo largo de la partida y emite acciones de forma descentralizada, sin comunicacion explicita con sus companeros. El codigo del aprendiz deriva de Mava (adaptacion propia) e incorpora ValueNorm tomado del codigo oficial de MAPPO del repositorio on-policy de marlbenchmark; la documentacion de fuentes de metodo del proyecto detalla los commits exactos, las licencias y las modificaciones introducidas. La implementacion esta escrita en JAX y el modelo exportado se ejecuta bajo `jit` y `vmap` sin el codigo de entrenamiento.

El entrenamiento se desarrollo en dos ejecuciones encadenadas: la primera cubre los pasos 0 a 40.108.032 y la segunda continua desde ese punto hasta el paso 250.675.200. Un paso equivale a una transicion de entorno, es decir, un tick de simulacion. La instantanea que jugo la Season 0 corresponde al paso 219.103.232. Durante el entrenamiento se validaron algunas instantaneas contra un panel fijo de oponentes (Recurrent MAPPO de referencia `recurrent-mappo-combat-support-pooled-step-250675200`, `tdm-alpha`, `tdm-beta` y `tdm-gamma`), con 128 partidas por comprobacion en los mapas de validacion 42, 43, 44 y 46, registrando margen de puntos, muertes y bajas por partida promediados con igual peso entre mapas y oponentes. No se documentan en la informacion disponible detalles sobre el volumen de datos, el uso de RLHF/DPO (no aplica en RL) ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control de agentes en un entorno de combate por equipos: emite acciones para cada uno de los cinco roles (Mage, Warrior, Hunter, Rogue y Priest) de forma descentralizada.
- Politica recurrente con estado interno: mantiene memoria a lo largo de la partida para decisiones dependientes del historial de la simulacion.
- Ejecucion portable: la funcion de decision exportada con `jax.export` se ejecuta bajo `jit` y `vmap` sin el codigo de entrenamiento original.
- Uso como oponente, companero de equipo, sujeto de evaluacion o inicializacion de nuevos entrenamientos dentro de MARL-BGs.
- Seleccion de instantanea por paso: el nombre admite sufijos como `@final`, `@100M` o `@99_942_400` para cargar la instantanea exacta o la mas cercana.
- Reproducibilidad determinista: en CPU, o en GPU en modo determinista, el mismo archivo, entradas y ajustes reproducen las mismas partidas.
- Sin soporte de tool calling, function calling, agentes de proposito general, capacidades multilingues, vision, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Evaluacion comparativa de algoritmos MARL: cargar el modelo como oponente fijo en `marl_bgs.evaluate(system, "tdm-alpha", num_episodes=20)` para medir el rendimiento de nuevas politicas contra una referencia con Elo conocido (1.304 en Season 0) y condiciones controladas.
- Entrenamiento por curriculum contra una escalera de instantaneas: usar las 642 instantaneas publicadas como una ladder de dificultad creciente para entrenar agentes nuevos, tal como describe la guia de modelos publicados del proyecto.
- Inicializacion de nuevos experimentos: arrancar un entrenamiento desde `name@final` con `initial_actor` en `TrainConfig`, manteniendo el metodo `mappo` y la escala de entrada `0.01` para reutilizar los pesos del actor y explorar variantes del aprendiz.
- Reproduccion de resultados de la Season 0: cargar la instantanea del paso 219.103.232 y replicar las 1.080 partidas de la comprobacion de publicacion contra TDM-Alpha, TDM-Beta y TDM-Gamma en los mapas de prueba 47-51, con semillas identicas.
- Benchmarking de infraestructura: comparar el rendimiento del mismo modelo exportado en distintas configuraciones de hardware (por ejemplo, una RTX 5090 en modo GPU normal frente a CPU o GPU determinista) para validar pipelines de evaluacion.
- Docencia e investigacion en MARL: estudiar una politica recurrente descentralizada entrenada con MAPPO y ValueNorm, con acceso a las curvas de aprendizaje, los registros de actualizacion y los resultados de validacion de dos ejecuciones encadenadas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Team Deathmatch | TDM Season 0 (`MARL-BattleGrounds/tdm-season-0-results`) | Elo de Season 0 | 1.304 | No |

Contexto adicional declarado por el autor: intervalo del 95 % de 1.288 a 1.322, nivel Gold 3, puesto 3 de 9 en la clasificacion de Season 0. En la comprobacion de publicacion, la instantanea de Season 0 coincidio con la carpeta de guardado original en las 1.080 partidas contra TDM-Alpha, TDM-Beta y TDM-Gamma en los mapas de prueba 47-51 (una RTX 5090, modo GPU normal, mismas semillas). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 2,6 GB, pero no se desglosa el tamano por instantanea ni el consumo en memoria durante la evaluacion.
- GPU recomendadas: la comprobacion de publicacion se ejecuto en una RTX 5090 en modo GPU normal; no se documentan otras GPU (A100, H100, RTX 4090) en la informacion disponible.
- Compatibilidad con GPU de consumo: si, al menos una RTX 5090 segun la comprobacion del autor; no se detalla el rendimiento en otras GPU de consumo.
- Ejecucion en CPU: soportada, con reproducibilidad determinista de las partidas.
- Opciones de despliegue: paquete `marl_battlegrounds` (carga con `marl_bgs.load_method`, evaluacion con `marl_bgs.evaluate`, integracion con BattleClient y con el modulo `training`); los archivos se ejecutan en JAX hasta 6 meses mas nuevo que la version que los genero, segun la garantia de compatibilidad de programas exportados de JAX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Metodo | Entorno | Elo Season 0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tdm-season-0-recurrent-mappo | Recurrent MAPPO | Team Deathmatch (MARL-BGs) | 1.304 (puesto 3 de 9) | Apache 2.0 | Hugging Face (642 instantaneas) |
| recurrent-mappo-combat-support-pooled-step-250675200 | Recurrent MAPPO | Team Deathmatch (MARL-BGs) | no disponible | no disponible | Dataset de resultados del proyecto (`training-opponents/models/`) |
| tdm-alpha | no disponible | Team Deathmatch (MARL-BGs) | no disponible | no disponible | Entorno de evaluacion del proyecto |
| tdm-beta | no disponible | Team Deathmatch (MARL-BGs) | no disponible | no disponible | Entorno de evaluacion del proyecto |
| tdm-gamma | no disponible | Team Deathmatch (MARL-BGs) | no disponible | no disponible | Entorno de evaluacion del proyecto |

Los oponentes de referencia citados en la model card no publican en la informacion disponible sus parametros, contexto ni Elo, por lo que la comparacion cuantitativa se limita al Elo declarado de este modelo y a su posicion en la clasificacion de Season 0.

## Limitaciones y advertencias

- Ambito restringido: el modelo solo opera en el entorno Team Deathmatch de MARL-BattleGrounds; no es transferible a otros juegos, tareas de lenguaje ni dominios generales.
- Sin mensajes entre companeros: la coordinacion entre los cinco agentes es implicita, lo que puede limitar el rendimiento frente a variantes con comunicacion.
- Estado de entrenamiento no publicado: no se libera el estado del aprendiz (critico, mixer, optimizador), por lo que la ejecucion original no puede continuarse; solo es posible iniciar una nueva ejecucion desde una instantanea.
- Resultados no verificados: el Elo de 1.304 figura como no verificado en el model-index y procede del propio autor.
- Riesgo de sesgo y alucinacion: no aplica en el sentido habitual de los modelos de lenguaje, pero la politica puede exhibir comportamientos suboptimos o explotar patrones del entorno aprendidos durante el entrenamiento.
- Dependencia de version de JAX: los archivos funcionan en versiones de JAX hasta 6 meses mas nuevas que la que los genero; versiones fuera de esa ventana pueden no ser compatibles.
- Reproducibilidad condicionada: la coincidencia exacta de partidas requiere CPU o GPU en modo determinista; en GPU en modo normal pueden aparecer diferencias no deterministas.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y aviso; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARL-BattleGrounds/tdm-season-0-recurrent-mappo
- Repositorio MARL-BattleGrounds: https://github.com/arm-2-lab/MARL-BattleGrounds
- Guia de modelos publicados: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/released_models.md
- Fuentes de metodo (commits, licencias y cambios): https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/method_sources.md
- Reglas de clasificacion (ejecucion y mensajes entre companeros): https://marl-battlegrounds.com/#leaderboard-rules~execution-and-teammate-messages
- Dataset de resultados de Season 0: https://huggingface.co/datasets/MARL-BattleGrounds/tdm-season-0-results
- Mava (codigo del aprendiz): https://github.com/instadeepai/Mava
- MAPPO oficial (ValueNorm): https://github.com/marlbenchmark/on-policy
- Documentacion de `jax.export` y compatibilidad: https://docs.jax.dev/en/latest/export/export.html#compatibility-guar
- Paper referenciado (arXiv:2610.14883): no disponible el enlace directo en la informacion proporcionada
