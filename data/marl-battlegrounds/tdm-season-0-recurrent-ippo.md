# MARL-BattleGrounds/tdm-season-0-recurrent-ippo

## Resumen

`tdm-season-0-recurrent-ippo` es un agente de aprendizaje por refuerzo multiagente (MARL) entrenado con el algoritmo Recurrent Independent PPO (IPPO) para el entorno Team Deathmatch (TDM) del benchmark MARL-BattleGrounds (MARL-BGs), desarrollado por el grupo MARL-BattleGrounds (arm-2-lab). El entorno enfrenta a dos equipos de cinco agentes con roles fijos (Mage, Warrior, Hunter, Rogue y Priest) en combate por equipos, y el modelo decide de forma descentralizada para cada agente, sin mensajes entre companeros de equipo.

El modelo se distribuye como una coleccion de 642 ficheros de pesos portables exportados con `jax.export`, uno por cada punto de guardado entre el paso 0 y el paso 250.675.200, junto con los registros de entrenamiento. La version liberada como "Season 0" corresponde al paso 250.675.200 y obtuvo el puesto 1 de 9 en la clasificacion de la temporada, con un Elo de 1.441 (intervalo del 95%: 1.426-1.458, nivel Platinum 4).

Su relevancia radica en que es un artefacto reproducible y portable de investigacion en MARL: los ficheros ejecutan la funcion de decision bajo `jit` y `vmap` sin necesidad del codigo de entrenamiento, lo que facilita evaluaciones controladas, comparaciones entre metodos y experimentos de aprendizaje por imitacion o continuacion de entrenamiento. No es un modelo de lenguaje ni procesa texto o imagenes; es una politica de control para un simulador de combate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal recurrente (Recurrent IPPO) exportada con `jax.export`; red actor-critica con ValueNorm |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (memoria recurrente; no se especifica horizonte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros `.zip` portables con el programa de decision exportado (`jax.export`) y pesos; `steps.csv` como indice |
| Entorno | MARL-BattleGrounds, Team Deathmatch (5v5) |
| Algoritmo | Recurrent IPPO (`ippo`), ejecucion descentralizada |
| Mensajes entre companeros | ninguno |
| Semilla de entrenamiento | 20261001 |
| Puntos de guardado | 642 (pasos 0 a 250.675.200) |
| Paso de la version Season 0 | 250.675.200 |
| Tamano del repositorio | 2,6 GB |
| Framework | JAX (compatible con versiones de JAX hasta 6 meses posteriores a la de exportacion) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma Recurrent IPPO: cada agente dispone de una politica recurrente que procesa observaciones parciales y mantiene estado interno, y se entrena de forma independiente por agente (sin critico centralizado compartido en ejecucion, aunque el aprendizaje utiliza un critico y normalizacion de valores ValueNorm). La ejecucion es descentralizada: cada agente decide con su propia politica y no hay intercambio de mensajes entre companeros. El codigo del aprendiz deriva de Mava, con ValueNorm tomado del codigo oficial de MAPPO; los commits, licencias y modificaciones exactas se documentan en `docs/method_sources.md` del repositorio.

El entrenamiento se realizo en dos ejecuciones encadenadas: la primera cubre los pasos 0 a 40.108.032 y la segunda continua desde ese punto hasta 250.675.200. Un "step" equivale a una transicion del entorno (un tick de simulacion). Cada fichero contiene el programa de decision unico del modelo, verificado identico en todos los guardados, mas los pesos exactos de ese paso. La reproducibilidad se valido en 1.080 partidas contra TDM-Alpha, TDM-Beta y TDM-Gamma en los mapas de test 47-51, con una RTX 5090 en modo GPU normal y las mismas semillas; en CPU o en modo GPU determinista, el mismo fichero, entradas y ajustes reproducen las mismas partidas. El estado de entrenamiento (critico, mezclador, optimizador) no se libera, por lo que no es posible continuar la ejecucion original, solo iniciar una nueva desde cualquier guardado.

## Capacidades

- Control de agentes en un entorno de combate 5v5 por equipos con cinco roles diferenciados (Mage, Warrior, Hunter, Rogue, Priest).
- Decision descentralizada por agente a partir de observaciones parciales.
- Memoria recurrente para integrar informacion a lo largo del tiempo.
- Exportacion portable con `jax.export`: ejecucion bajo `jit` y `vmap` sin el codigo de entrenamiento.
- Uso como oponente, companero de equipo, sujeto de evaluacion o cliente en el ecosistema MARL-BGs.
- Punto de partida para nuevo entrenamiento (`initial_actor`) con el mismo metodo y escala de entrada.
- Seleccion de guardados intermedios mediante sufijos (`@final`, `@100M`, `@99_942_400`).
- Verificacion de integridad de cada fichero contra `steps.csv` (SHA-256 y digest del actor).
- No soporta tool calling, function calling, generacion de texto, vision ni audio.

## Casos de uso

- Evaluacion de referencia en investigacion MARL: cargar el guardado Season 0 con `marl_bgs.load_method` y ejecutar `marl_bgs.evaluate(system, "tdm-alpha", num_episodes=20)` para obtener una linea base reproducible frente a oponentes fijos.
- Oponente de entrenamiento: usar el modelo como rival en la escalera de guardados (`@100M`, `@final`, etc.) para curriculum de dificultad creciente al entrenar nuevas politicas.
- Companero de equipo en partidas mixtas: integrar el modelo como agente aliado en equipos con otros metodos para estudiar coordinacion sin mensajes.
- Punto de partida para fine-tuning: iniciar un nuevo entrenamiento IPPO con `initial_actor` apuntando a un guardado concreto y `PPOConfig(input_scale=0.01)`, manteniendo el metodo y la escala de entrada.
- Analisis de curvas de aprendizaje: los 642 guardados permiten estudiar la evolucion de la politica a lo largo de 250 millones de pasos y correlacionar cambios de comportamiento con los registros de validacion.
- Aprendizaje por imitacion o destilacion: usar la politica exportada como profesor para generar trayectorias en el simulador y entrenar modelos mas ligeros.
- Reproduccion de resultados: replicar las 1.080 partidas de la comprobacion de liberacion en CPU o GPU determinista con las mismas semillas para verificar fidelidad.
- Despliegue en pipelines de evaluacion automatica: los ficheros portables permiten integrar el agente en CI sin instalar el codigo de entrenamiento, solo el runtime de MARL-BGs y JAX.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Team Deathmatch | TDM Season 0 (`MARL-BattleGrounds/tdm-season-0-results`) | Season 0 Elo | 1.441 (IC 95%: 1.426-1.458) |

Datos adicionales de la model card: puesto 1 de 9 en la clasificacion de Season 0, nivel Platinum 4. La validacion interna compara guardados contra Recurrent MAPPO (`recurrent-mappo-combat-support-pooled-step-250675200`), `tdm-alpha`, `tdm-beta` y `tdm-gamma`, con 128 partidas por comprobacion en los mapas 42, 43, 44 y 46, registrando `validation_point_margin`, `validation_kills` y `validation_deaths`; los valores numericos concretos no se incluyen en la informacion disponible y deben consultarse en `steps.csv` y en `training-records/*/validation_results.json`.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano de los pesos no se especifica y el repositorio completo (2,6 GB) incluye 642 ficheros, no un unico modelo.
- GPU recomendadas: no se publican recomendaciones; la comprobacion de liberacion se ejecuto en una RTX 5090.
- GPU de consumo: factible segun la validacion en RTX 5090; no se confirma compatibilidad con GPUs de gama inferior.
- CPU: soportada, con modo determinista para reproduccion exacta de partidas.
- Despliegue: runtime `marl_battlegrounds` sobre JAX; los ficheros funcionan con versiones de JAX hasta 6 meses posteriores a la de exportacion. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Metodo | Parametros | Contexto | Elo Season 0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tdm-season-0-recurrent-ippo | Recurrent IPPO | no disponible | no disponible | 1.441 | Apache 2.0 | Hugging Face |
| recurrent-mappo-combat-support-pooled-step-250675200 | Recurrent MAPPO | no disponible | no disponible | no disponible | no disponible | Dataset de resultados (`training-opponents/models/`) |
| tdm-alpha | no disponible | no disponible | no disponible | no disponible | no disponible | Entorno MARL-BGs |
| tdm-beta | no disponible | no disponible | no disponible | no disponible | no disponible | Entorno MARL-BGs |
| tdm-gamma | no disponible | no disponible | no disponible | no disponible | no disponible | Entorno MARL-BGs |

Los oponentes `tdm-alpha`, `tdm-beta` y `tdm-gamma` se usan como referencia en la validacion, pero sus especificaciones y resultados no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Especifico del simulador MARL-BattleGrounds: no es un modelo de proposito general y no procesa texto, imagenes ni audio.
- Sin mensajes entre companeros: la coordinacion depende solo de la politica individual y de la observacion, sin comunicacion explicita.
- Estado de entrenamiento no liberado: no se puede reanudar la ejecucion original; solo iniciar una nueva desde un guardado, con critico y optimizador reiniciados.
- Elo declarado por el autor y marcado como no verificado; el intervalo del 95% (1.426-1.458) refleja incertidumbre estadistica.
- Reproducibilidad condicionada: exacta en CPU o GPU en modo determinista; en GPU normal puede haber diferencias numericas.
- Compatibilidad de JAX limitada a versiones hasta 6 meses posteriores a la exportacion.
- Riesgo de sobreajuste a los mapas y oponentes de validacion (42-46) y test (47-51); el comportamiento en mapas nuevos no esta garantizado.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas por no tratarse de un modelo generativo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de Mava y del codigo MAPPO referenciadas en `docs/method_sources.md`.
- El repositorio pesa 2,6 GB y cada fichero se descarga una vez; conviene planificar el almacenamiento en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARL-BattleGrounds/tdm-season-0-recurrent-ippo
- Repositorio MARL-BattleGrounds: https://github.com/arm-2-lab/MARL-BattleGrounds
- Reglas de clasificacion y ejecucion: https://marl-battlegrounds.com/#leaderboard-rules~execution-and-teammate-messages
- Fuentes de metodos (commits, licencias, cambios): https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/method_sources.md
- Guia de modelos liberados: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/released_models.md
- Mava (codigo del aprendiz): https://github.com/instadeepai/Mava
- MAPPO oficial (ValueNorm): https://github.com/marlbenchmark/on-policy
- Documentacion de `jax.export`: https://docs.jax.dev/en/latest/export/export.html#compatibility-guarant
- Dataset de resultados: https://huggingface.co/datasets/MARL-BattleGrounds/tdm-season-0-results
- Paper referenciado (arXiv:2610.14883): no disponible el enlace directo en la informacion proporcionada
