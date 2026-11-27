# MARL-BattleGrounds/tdm-season-0-feedforward-ippo

## Resumen

tdm-season-0-feedforward-ippo es un modelo de aprendizaje por refuerzo multiagente (MARL) entrenado con el algoritmo Feedforward IPPO para el entorno Team Deathmatch de MARL-BattleGrounds (MARL-BGs), un benchmark escrito en JAX en el que dos equipos de cinco agentes (Mage, Warrior, Hunter, Rogue y Priest) se enfrentan en combate por equipos. Lo desarrolla el proyecto MARL-BattleGrounds (repositorio arm-2-lab) y se publica como una familia de checkpoints portables, uno por cada guardado del entrenamiento.

El modelo resuelve el problema de disponer de una política de referencia reproducible y portable para evaluar y comparar algoritmos MARL en un entorno de combate por equipos. Cada archivo contiene la función de decisión de un agente exportada con `jax.export` junto con sus pesos, de modo que se puede ejecutar bajo `jit` y `vmap` sin necesidad del código de entrenamiento. El checkpoint que jugó la temporada oficial (Season 0) corresponde al paso 219.103.232 y obtuvo un Elo de 1.240 (intervalo del 95 %: 1.225-1.255), lo que lo situó en el puesto 5 de 9 y en el tier Gold 4.

La relevancia actual radica en que se trata de un artefacto de referencia para investigación en MARL: incluye 642 guardados desde el paso 0 hasta el 250.675.200, registros completos de entrenamiento y resultados de validación, lo que permite reproducir partidas, arrancar nuevos entrenamientos desde cualquier checkpoint y comparar contra una política fija. No es un modelo de lenguaje: es una política de control para un entorno de simulación concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política feedforward (red neuronal densa) exportada con `jax.export`; algoritmo Feedforward IPPO (independent PPO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la observación es por tick del entorno) |
| Tipos de cuantizacion | no disponible (pesos en el formato portable de JAX, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; los agentes no intercambian mensajes) |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivos `.zip` portables con la función de decisión exportada (`jax.export`) y sus pesos; metadatos en `steps.csv` y `config.json` |

## Arquitectura y entrenamiento

La política es una red feedforward (sin recurrencia ni memoria) entrenada con IPPO, una variante de PPO en la que cada agente aprende de forma independiente con su propio crítico. La ejecución es descentralizada: el modelo decide para cada agente por separado y no hay mensajes entre compañeros de equipo. El código del aprendiz se adaptó de Mava, incorporando ValueNorm del código oficial de MAPPO; la model card remite a `docs/method_sources.md` para los commits, licencias y cambios exactos.

El entrenamiento se realizó en dos ejecuciones encadenadas: la primera cubre los pasos 0 a 40.108.032 y la segunda continúa desde ese punto hasta 250.675.200. Se usó la semilla 20261001 y se generaron 642 guardados. Un paso equivale a una transición del entorno (un tick de partida). Algunos guardados se validaron contra un panel fijo de oponentes (Recurrent MAPPO, tdm-alpha, tdm-beta y tdm-gamma) con 128 partidas por comprobación en los mapas de validación 42, 43, 44 y 46, registrando margen de puntos, bajas y muertes por partida. La reproducibilidad está documentada: el archivo de la Season 0 coincidió con el guardado original en las 1.080 partidas contra TDM-Alpha, TDM-Beta y TDM-Gamma en los mapas de test 47-51 (una RTX 5090, modo GPU normal, mismas semillas); en CPU o en modo determinista las partidas se replican de forma exacta.

## Capacidades

- Control de agentes en un entorno de combate por equipos 5v5 con cinco roles (Mage, Warrior, Hunter, Rogue y Priest).
- Toma de decisiones descentralizada por agente, sin comunicación entre compañeros.
- Ejecución portable bajo `jit` y `vmap` sin el código de entrenamiento.
- Selección de cualquier checkpoint intermedio mediante sufijos (`@final`, `@100M`, `@99_942_400`).
- Uso como oponente, compañero de equipo, sujeto de evaluación o cliente de batalla dentro de MARL-BGs.
- Punto de partida para nuevos entrenamientos (transferencia de pesos del actor; crítico, mixer y optimizador se inicializan de cero).
- No soporta tool calling, function calling, razonamiento multi-step en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación de referencia en investigación MARL: cargar el checkpoint de Season 0 con `marl_bgs.load_method` y ejecutar `marl_bgs.evaluate(system, "tdm-alpha", num_episodes=20)` para obtener una línea base reproducible frente a la que medir nuevos algoritmos.
- Entrenamiento de oponentes: usar los checkpoints como rivales en una escalera de dificultad (por ejemplo, `@100M` frente a `@final`) para curriculum learning en políticas propias.
- Aprendizaje por imitación o destilación: emplear las partidas y decisiones del modelo como datos de demostración para entrenar políticas más ligeras o con otras arquitecturas.
- Transferencia de aprendizaje: arrancar un nuevo run con `initial_actor` apuntando a cualquier guardado, manteniendo el método `ff_ippo` y el `input_scale` original, para estudiar el efecto del preentrenamiento en la convergencia.
- Validación de infraestructura de simulación: comprobar que un despliegue de MARL-BGs reproduce las 1.080 partidas documentadas en los mapas 47-51, verificando la integridad del entorno y del hardware.
- Análisis de robustez y generalización: evaluar el mismo checkpoint en mapas de validación y de test distintos para medir la degradación de rendimiento y el margen de puntos por partida.
- Estudio de comunicación en MARL: comparar esta política sin mensajes frente a variantes con mensajes entre compañeros para cuantificar el valor de la comunicación en Team Deathmatch.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Team Deathmatch | TDM Season 0 | Season 0 Elo | 1.240 | No |

Contexto adicional de la model card: intervalo del 95 % de 1.225 a 1.255, tier Gold 4, puesto 5 de 9 en la clasificación de Season 0. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 2,3 GB (unos 2,4 GB según la model card) e incluye 642 archivos de checkpoint, por lo que cada archivo individual es de tamaño reducido y la inferencia de una sola política requiere muy poca memoria.
- GPU recomendadas: la verificación de release se realizó en una RTX 5090 en modo GPU normal; al ser JAX, cualquier GPU compatible con CUDA y JAX debería servir para inferencia.
- GPU de consumo: sí, cabe en GPU de consumo; la propia documentación cita una RTX 5090 para la comprobación de reproducibilidad.
- Opciones de despliegue: la librería `marl_battlegrounds` (carga con `load_method`, evaluación con `evaluate`), ejecución directa con JAX bajo `jit`/`vmap`, y modo CPU o GPU determinista para reproducción exacta.
- Latencia y throughput: no disponibles. La compatibilidad de los archivos está garantizada con versiones de JAX hasta 6 meses más nuevas que la que los generó.

## Comparativa con modelos similares

| Modelo | Algoritmo | Ejecución | Mensajes entre compañeros | Contexto / entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tdm-season-0-feedforward-ippo | Feedforward IPPO | Descentralizada | No | Team Deathmatch 5v5, Season 0 | Apache 2.0 | Hugging Face (este repo) |
| Recurrent MAPPO (combat support, pooled, step 250675200) | MAPPO recurrente | no disponible en detalle | no disponible | Team Deathmatch, usado como oponente de validación | no disponible | Dataset de resultados de MARL-BattleGrounds (`training-opponents/models/`) |
| tdm-alpha / tdm-beta / tdm-gamma | no disponible | no disponible | no disponible | Team Deathmatch, oponentes fijos de evaluación | no disponible | Entorno MARL-BattleGrounds |

No se dispone de datos de Elo ni de parámetros de los oponentes de validación en la información proporcionada, por lo que la comparación cuantitativa de rendimiento entre ellos no está disponible.

## Limitaciones y advertencias

- Es una política específica del entorno Team Deathmatch de MARL-BattleGrounds; no es un modelo de propósito general ni transferible a otros dominios sin reentrenamiento.
- No mantiene memoria entre ticks (feedforward) y no intercambia mensajes con sus compañeros, lo que limita la coordinación frente a variantes recurrentes o comunicativas.
- El Elo de 1.240 no está verificado (`verified: false`) y procede de la propia model card; el puesto 5 de 9 indica un rendimiento intermedio dentro de la temporada.
- El estado de entrenamiento no se publica: no se puede continuar el run original, solo iniciar uno nuevo desde un checkpoint.
- La reproducibilidad exacta depende del hardware y del modo de ejecución; en GPU no determinista pueden aparecer diferencias frente a las partidas documentadas.
- Los archivos dependen de la compatibilidad de JAX (hasta 6 meses de versiones posteriores); versiones más nuevas pueden no cargarlos.
- No se documentan sesgos, tasas de alucinación ni restricciones idiomáticas por no aplicar a un modelo de control; no obstante, el comportamiento de la política está acotado al conjunto de mapas y oponentes del benchmark.
- La licencia Apache 2.0 permite uso comercial, pero el valor práctico del modelo está ligado a la simulación MARL-BGs y a su ecosistema de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/MARL-BattleGrounds/tdm-season-0-feedforward-ippo
- Repositorio MARL-BattleGrounds: https://github.com/arm-2-lab/MARL-BattleGrounds
- Guía de modelos publicados: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/released_models.md
- Fuentes de métodos: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/method_sources.md
- Reglas de clasificación (ejecución y mensajes): https://marl-battlegrounds.com/#leaderboard-rules~execution-and-teammate-messages
- Mava (código del aprendiz): https://github.com/instadeepai/Mava
- MAPPO oficial (ValueNorm): https://github.com/marlbenchmark/on-policy
- Documentación de `jax.export`: https://docs.jax.dev/en/latest/export/export.html
- Dataset de resultados TDM Season 0: MARL-BattleGrounds/tdm-season-0-results (referenciado en el model-index)
