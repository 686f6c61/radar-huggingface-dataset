# MARL-BattleGrounds/tdm-season-0-pqn-vdn

## Resumen

tdm-season-0-pqn-vdn es un agente de aprendizaje por refuerzo multiagente (MARL) entrenado para el modo Team Deathmatch del banco de pruebas MARL-BattleGrounds (MARL-BGs), un entorno implementado en JAX en el que dos equipos de cinco agentes (Mage, Warrior, Hunter, Rogue y Priest) se enfrentan entre si. El modelo lo desarrolla el equipo MARL-BattleGrounds y combina PQN (Parallel Q-Network, una variante paralelizada de DQN) con VDN (Value Decomposition Networks) como mecanismo de descomposicion de valor entre los agentes del equipo. No es un modelo de lenguaje: es una politica de control entrenada por refuerzo, empaquetada como funcion de decision portable exportada con `jax.export`.

El problema que resuelve es el de proporcionar una politica de referencia reproducible y portable para un entorno MARL competitivo de cinco contra cinco, con decisiones descentralizadas (cada agente decide por separado, sin mensajes entre companeros de equipo). Su relevancia ahora radica en que forma parte de la primera temporada competitiva del benchmark (Season 0), donde quedo en segunda posicion de nueve participantes con un Elo de 1.358, y en que el repositorio publica 105 checkpoints intermedios (desde el paso 0 hasta el 250.675.200) junto con los registros de entrenamiento, lo que lo convierte en material util para investigacion en MARL, evaluacion de oponentes y arranque de nuevos entrenamientos.

El repositorio ocupa aproximadamente 2 GB y se distribuye bajo licencia Apache 2.0. Cada archivo de checkpoint contiene los pesos exactos de su save y un unico programa de decision verificado para todos los saves, lo que permite reproducir partidas de forma determinista en CPU o en GPU en modo determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PQN-VDN (Parallel Q-Network con descomposicion de valor VDN); politica de RL multiagente, no transformer |
| Parametros totales | no disponible (no se declara el recuento; el repo pesa ~2,0 GB con 105 saves) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el estado lo define la observacion del entorno por tick) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | archivos `.zip` portables con funcion de decision exportada via `jax.export` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es una politica de Q-learning multiagente. PQN (Parallel Q-Network) actua como aprendiz por agente y VDN descompone el valor conjunto del equipo en una suma de valores individuales, lo que permite entrenamiento centralizado con ejecucion descentralizada. La ejecucion es descentralizada: cada agente decide de forma independiente y no hay mensajes entre companeros de equipo (Teammate Messages: None). El codigo del aprendiz deriva de JaxMARL, con commits, licencias y modificaciones documentados en el repositorio del proyecto.

El entrenamiento se ejecuto en dos tramos consecutivos: el primero de 0 a 40.108.032 pasos y el segundo de 40.108.032 a 250.675.200 pasos, con semilla de entrenamiento 12259871. Un paso equivale a una transicion de entorno (un tick de partida). Se publican 105 saves, y el save que jugo la Season 0 corresponde al paso 240.156.672. Durante el entrenamiento se valido un subconjunto de saves contra un panel fijo de oponentes (Recurrent MAPPO, tdm-alpha, tdm-beta y tdm-gamma), con 128 partidas por comprobacion en los mapas de validacion 42, 43, 44 y 46. La reproducibilidad esta verificada: en la comprobacion de publicacion, el archivo del save de Season 0 coincidio con la carpeta original en las 1.080 partidas disputadas contra TDM-Alpha, TDM-Beta y TDM-Gamma en los mapas de test 47-51 sobre una RTX 5090.

## Capacidades

- Control multiagente descentralizado de cinco roles distintos (Mage, Warrior, Hunter, Rogue, Priest) en un entorno de combate por equipos.
- Toma de decisiones por tick de simulacion a partir de la observacion del entorno, sin estado conversacional ni contexto textual.
- Ejecucion bajo `jit` y `vmap` sin necesidad del codigo de entrenamiento, gracias a la exportacion portable con `jax.export`.
- Carga como oponente, companero de equipo, objeto de evaluacion o cliente de batalla dentro del ecosistema MARL-BGs.
- Arranque de nuevos entrenamientos desde cualquiera de sus saves (`initial_actor`), reutilizando pesos del actor.
- Seleccion de save por paso concreto (`@final`, `@100M`, `@98_402_304`) o por resultado de validacion.
- No soporta tool calling, function calling, generacion de texto, vision, audio ni capacidades multilingues.

## Casos de uso

- Evaluacion de referencia en investigacion MARL: usar el save de Season 0 como oponente fijo contra el que medir nuevas politicas en Team Deathmatch, con la ventaja de que el Elo (1.358) y el intervalo de confianza estan publicados.
- Arranque de entrenamientos con inicializacion caliente: configurar `initial_actor` con `@final` o un save intermedio para reducir el tiempo hasta convergencia en experimentos propios con PQN-VDN.
- Estudio de curvas de aprendizaje: los 105 saves entre el paso 0 y el 250.675.200 permiten analizar la evolucion de la politica y correlacionar pasos con resultados de validacion.
- Reproduccion de experimentos: los archivos portables y deterministas (CPU o GPU en modo deterministico) permiten replicar exactamente partidas con las mismas semillas, algo poco habitual en MARL.
- Benchmarking de algoritmos alternativos: enfrentar MAPPO recurrente, QMIX u otras variantes contra esta politica para comparar margenes de puntos, kills y muertes por partida.
- Docencia y divulgacion en RL multiagente: el empaquetado portable y el ejemplo de carga en pocas lineas facilitan demostraciones reproducibles de descomposicion de valor y ejecucion descentralizada.
- Integracion en pipelines de evaluacion continua: el cliente de batalla y la API de evaluacion permiten automatizar torneos y comprobaciones de regresion de nuevas politicas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tarea | Team Deathmatch |
| Dataset | TDM Season 0 (`MARL-BattleGrounds/tdm-season-0-results`) |
| Elo Season 0 | 1.358 (intervalo del 95 %: 1.349-1.368) |
| Tier | Gold 2 |
| Posicion en Season 0 | 2 de 9 |
| Save evaluado | paso 240.156.672 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- El modelo no requiere VRAM significativa: es una politica de RL de un entorno de simulacion, no un LLM. Los archivos se ejecutan en JAX sobre CPU o GPU.
- La comprobacion de reproducibilidad oficial se realizo en una unica RTX 5090 en modo GPU normal; no se especifican requisitos minimos de GPU.
- Cabe en cualquier GPU consumer moderna con soporte JAX/CUDA, y en CPU (con ejecucion determinista).
- Despliegue mediante la libreria `marl_battlegrounds` (carga, evaluacion y entrenamiento) sobre JAX; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion de referencia usa 20 episodios por defecto y las validaciones de entrenamiento usan 128 partidas por comprobacion.

## Comparativa con modelos similares

| Modelo | Metodo | Ejecucion | Mensajes entre companeros | Elo Season 0 | Licencia |
|---|---|---|---|---|---|
| tdm-season-0-pqn-vdn | PQN-VDN | Descentralizada | No | 1.358 (Gold 2, 2.º de 9) | Apache 2.0 |
| recurrent-mappo-combat-support-pooled-step-250675200 | Recurrent MAPPO | no disponible | no disponible | no disponible (usado como oponente de validacion) | no disponible |

No se dispone en la informacion proporcionada de datos de Elo ni de especificaciones de los otros siete participantes de la Season 0, por lo que no es posible completar una comparativa mas amplia.

## Limitaciones y advertencias

- El Elo de 1.358 esta marcado como no verificado (`verified: false`) en el model-index; procede del propio autor.
- El modelo esta especializado exclusivamente en el entorno Team Deathmatch de MARL-BattleGrounds; no es reutilizable fuera de el ni transferible a tareas de lenguaje, vision o codigo.
- La ejecucion es descentralizada y sin comunicacion entre companeros de equipo, lo que limita la coordinacion frente a metodos con mensajes.
- El estado de entrenamiento (critico, mixer, optimizador) no se publica: no es posible continuar la ejecucion original, solo iniciar una nueva desde un save.
- Los pesos solo son compatibles con el mismo metodo y escala de entrada (`input_scale`); un desajuste impide el arranque del entrenamiento.
- Los archivos funcionan en versiones de JAX hasta 6 meses posteriores a la version que los genero; fuera de esa ventana la compatibilidad no esta garantizada.
- La reproducibilidad exacta exige CPU o GPU en modo determinista; en GPU en modo normal pueden aparecer diferencias de no determinismo.
- No se documentan sesgos de comportamiento especificos ni tasas de fallo fuera de los resultados de validacion publicados.
- La licencia Apache 2.0 permite uso comercial, pero el valor practico del modelo esta acotado al ecosistema MARL-BGs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARL-BattleGrounds/tdm-season-0-pqn-vdn
- Repositorio MARL-BattleGrounds: https://github.com/arm-2-lab/MARL-BattleGrounds
- Reglas del leaderboard (ejecucion y mensajes): https://marl-battlegrounds.com/#leaderboard-rules~execution-and-teammate-messages
- Fuentes de metodos (commits y licencias): https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/method_sources.md
- Guia de modelos publicados: https://github.com/arm-2-lab/MARL-BattleGrounds/blob/main/docs/released_models.md
- JaxMARL (codigo base del aprendiz): https://github.com/bold-lab-ai/JaxMARL
- Garantias de compatibilidad de `jax.export`: https://docs.jax.dev/en/latest/export/export.html#compatibility-guarantees
- Paper referenciado (arXiv:2610.14883): https://arxiv.org/abs/2610.14883
