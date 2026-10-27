# scaleresearch/ttrl-sac-hopper

## Resumen

ttrl-sac-hopper es un agente de aprendizaje por refuerzo Soft Actor-Critic (SAC) entrenado para el entorno MuJoCo `Hopper-v5`, un problema clasico de control continuo en el que un cuerpo articulado de una sola pata debe desplazarse hacia delante. Lo desarrolla scaleresearch como artefacto de referencia de su libreria ttrl (tt-rl), y su interes principal no esta en el algoritmo —SAC es bien conocido desde 2018— sino en el pipeline: el entrenamiento se ejecuto en un unico chip Tenstorrent Blackhole y el resultado se exporto a ONNX para que cualquiera pueda reproducir la politica en CPU sin hardware Tenstorrent ni instalar ttrl.

El modelo recibe la observacion cruda del entorno (11 valores float32) y devuelve tres pares de torques (float32), con la normalizacion de observaciones ya incorporada dentro del grafo ONNX. Con 1 millon de pasos de entrenamiento y semilla 0, alcanza un retorno medio de 3597,20 +/- 22,90 en 30 episodios deterministas ejecutados en CPU, una cifra muy proxima al maximo historico del entorno (en torno a 3800 puntos).

Es relevante ahora por tres motivos: es un ejemplo reproducible de entrenamiento de RL en aceleradores Tenstorrent (una alternativa emergente a GPU), demuestra un flujo de exportacion a ONNX con inferencia portable, y sirve como baseline publico y ligero para comparar algoritmos o validar runtimes. No es un modelo de lenguaje ni un modelo fundacional: no tiene capacidades linguisticas, semanticas ni de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Soft Actor-Critic (SAC): actor-critic off-policy con regularizacion de entropia; red de politica determinista exportada como MLP en ONNX |
| Parametros totales | no disponible (la model card no detalla el tamano de las capas ocultas; el repositorio ocupa menos de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); dimension de observacion = 11 |
| Tipos de cuantizacion | no disponible; el artefacto publicado es ONNX en float32 sin variantes cuantizadas |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), NPZ (`policy.npz`, `checkpoint.npz`) |
| Dimension de entrada | `obs`, float32, forma `(batch, 11)`, observacion cruda del entorno |
| Dimension de salida | `action`, float32, forma `(batch, 3)`, torques en unidades del entorno |
| Entorno | MuJoCo `Hopper-v5` (Gymnasium / Farama) |
| Algoritmo y variante | SAC, semilla 0, `checkpoint_replay=true`, mejor checkpoint a 1.000.000 de pasos |
| Hardware de entrenamiento | 1 chip Tenstorrent Blackhole, mediante ttrl sobre ttnn |
| Politica | determinista (la exportacion ONNX no muestrea de la distribucion) |

## Arquitectura y entrenamiento

SAC es un algoritmo actor-critic off-policy para espacios de accion continuos que maximiza el retorno esperado junto con la entropia de la politica, lo que produce politicas robustas y exploracion estable. La politica exportada a ONNX es la componente determinista del actor: un perceptron multicapa que transforma 11 entradas en 3 salidas, con la normalizacion de observaciones integrada en el propio grafo. El repositorio incluye ademas `checkpoint.npz`, el checkpoint completo de entrenamiento (incluye lo necesario para reanudar o para ejecutar en chip Tenstorrent via `ttrl.agent_from_checkpoint`), y `eval_curve.json`, que registra todas las evaluaciones intermedias.

El entrenamiento se lanzo desde `configs/hopper_sac.py` de ttrl con semilla 0 y `checkpoint_replay=true`, y consumio 1.000.000 de pasos de interaccion con el simulador en un unico chip Tenstorrent Blackhole. La model card no especifica el numero de capas ocultas, el tamano del replay buffer, la tasa de aprendizaje ni si la temperatura de entropia se ajusta automaticamente; tampoco documenta tecnicas adicionales como randomization de dinamica o decodificacion especulativa (no aplicables aqui). La recompensa es la estandar de `Hopper-v5`: avance hacia delante con penalizacion por coste de control y bonus por mantenerse en pie. El autor no publica detalles sobre el dataset de entrenamiento mas alla de las transiciones generadas por el propio simulador ni sobre fases de RLHF/DPO, que no aplican a este dominio.

## Capacidades

- Control continuo de un cuerpo articulado de tres articulaciones (muslo, rodilla, pie) en MuJoCo `Hopper-v5`, emitiendo torques directamente.
- Politica determinista: dada una observacion de 11 dimensiones devuelve una accion de 3 dimensiones sin muestreo estocastico.
- Inferencia portable en CPU mediante `onnxruntime`, sin dependencia de Tenstorrent ni de ttrl.
- Ejecucion alternativa en numpy puro con `ttrl.load_policy("policy.npz")`, util para entornos sin onnxruntime.
- Ejecucion en hardware Tenstorrent a partir de `checkpoint.npz` (`ttrl.agent_from_checkpoint`, `deploy.py --against-chip 0`).
- Script `play.py` listo para evaluar (`--episodes N`) o visualizar (`--window`) la politica.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Baseline reproducible para investigacion en RL: el agente y su curva de evaluacion (`eval_curve.json`) permiten comparar un nuevo algoritmo SAC/off-policy contra una referencia publica con semilla y configuracion conocidas, sin reentrenar desde cero.
- Validacion de la cadena de herramientas de Tenstorrent: sirve para verificar que ttrl y ttnn producen resultados correctos en un chip Blackhole, comparando el retorno en chip contra los 3597,20 +/- 22,90 obtenidos en CPU.
- Pruebas de integracion y regresion de runtimes ONNX: al ser un grafo pequeno con entrada `(batch, 11)` y salida `(batch, 3)`, es un caso de test ligero para validar versiones de onnxruntime, conversiones de formato o cambios en el soporte de operadores.
- Docencia y cursos de aprendizaje por refuerzo: `pip install onnxruntime "gymnasium[mujoco]"` y un unico comando permiten ver una politica entrenada actuando en Hopper, sin GPU ni configuracion de entrenamiento.
- Prototipado de controladores de locomocion: la politica sirve como punto de partida o referencia para experimentos de control de robots con patas en simulacion, midiendo sensibilidad a perturbaciones o a cambios de masa y friccion.
- Pruebas de despliegue en edge: al ejecutarse en CPU con un grafo minimo y sin dependencias pesadas, es adecuado para ensayar pipelines de inferencia de baja latencia en dispositivos sin acelerador.
- Comparacion de estrategias de optimizacion de grafos (fusión de operadores, precision, proveedores de ejecucion) usando el retorno medio como metrica funcional, no solo el tiempo de inferencia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica `verified: false`, no verificada por un tercero):

| Entorno | Evaluacion | Episodios | Retorno medio | Verificado |
|---|---|---|---|---|
| Hopper-v5 | Determinista, `play.py` en CPU, semillas desde 10000 | 30 | 3597,20 +/- 22,90 | No |
| Hopper-v5 | Evaluacion durante entrenamiento, paso 1.000.000 | 10 | 3604,40 | No |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguajes, porque el modelo no es linguistico. El retorno maximo alcanzable en `Hopper-v5` se situa historicamente en torno a 3800 puntos, por lo que la puntuacion publicada queda proxima a ese techo. El autor no publica desviacion por semilla de entrenamiento (solo se entreno con `seed=0`) ni curvas de aprendizaje completas mas alla de `eval_curve.json`.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el artefacto `model.onnx` esta pensado para ejecutarse en CPU con `onnxruntime`.
- GPU: no necesaria. No se han publicado mediciones en GPU ni requisitos especificos (A100, H100, RTX 4090 no aplican).
- Cabe en cualquier CPU consumer; el grafo es un MLP de 11 entradas y 3 salidas. Memoria RAM necesaria: no disponible, pero el repositorio completo ocupa menos de 0,1 GB.
- Despliegue en CPU: `onnxruntime` + `gymnasium[mujoco]` (instalacion documentada en la model card).
- Despliegue sin ONNX: `ttrl.load_policy("policy.npz")` ejecuta la misma politica en numpy.
- Despliegue en acelerador: `checkpoint.npz` sobre ttnn en un chip Tenstorrent Blackhole, via `ttrl.agent_from_checkpoint` o `deploy.py checkpoint.npz --against-chip 0`.
- vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo de texto.
- Latencia y throughput: no disponible; no se han publicado mediciones de tiempo por paso ni de episodios por segundo.

## Comparativa con modelos similares

No se dispone de checkpoints comparables publicados con cifras verificables sobre `Hopper-v5`, por lo que la comparacion de rendimiento se deja como no disponible. La comparacion estructural es la siguiente:

| Alternativa | Algoritmo | Entorno | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ttrl-sac-hopper (este modelo) | SAC | Hopper-v5 | no disponible | no aplica (obs. de 11 dims) | 3597,20 +/- 22,90 (30 episodios, no verificado) | MIT | Pesos ONNX y NPZ en HuggingFace |
| Stable-Baselines3 SAC | SAC | Hopper-v5 (via Gymnasium) | no disponible | no aplica | no disponible (requiere entrenamiento propio) | MIT | Libreria, sin checkpoint oficial del entorno |
| CleanRL SAC (continuous control) | SAC | Hopper-v5 | no disponible | no aplica | no disponible (resultados por ejecucion, no verificados) | MIT | Codigo de entrenamiento, sin pesos |
| TD3 / PPO como alternativas de algoritmo | TD3 / PPO | Hopper-v5 | no disponible | no aplica | no disponible | MIT (implementaciones habituales) | Requiere entrenamiento propio |

La diferencia practica frente a esas alternativas no es el retorno, sino el empaquetado: este repositorio entrega pesos listos para inferencia en CPU (ONNX), un checkpoint para Tenstorrent y la configuracion exacta del entrenamiento con semilla fija, algo que las librerias generalistas no ofrecen de serie.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de comprension semantica, generacion de texto, razonamiento simbolico y tool calling. Cualquier uso en esos dominios es un error de categoria.
- La metrica publicada esta marcada como `verified: false`; procede del propio autor y no ha pasado revision independiente.
- Entrenado con una unica semilla (`seed=0`) y un unico entorno. No hay evidencia de robustez ante cambios de masa, friccion, retardo de actuacion o ruido de observacion; la model card no documenta domain randomization.
- La politica exportada es determinista: no reproduce la componente estocastica del actor SAC, por lo que la evaluacion no mide la entropia ni la diversidad de comportamiento del modelo original.
- Riesgo de sobreajuste al simulador: el rendimiento en `Hopper-v5` no garantiza transferencia a un robot fisico ni a variantes del entorno (`Hopper-v4`, `Hopper-v3`, entornos con distinta frecuencia de control).
- El agente solo puede emitir acciones dentro del rango de torques de `Hopper-v5`; no esta pensado ni validado para otras morfologias.
- Sesgos conocidos del dominio: los entornos MuJoCo de locomocion han sido criticados por recompensas que favorecen estrategias exploitos y por una diversidad limitada de condiciones iniciales; no se documenta ningun analisis al respecto.
- Licencia MIT: permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la licencia. El entorno Gymnasium/MuJoCo se distribuye aparte bajo su propia licencia y hay que cumplirla por separado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica; no hay soporte comunitario documentado.
- No se han publicado analisis de fallos, limites de seguridad ni comportamiento fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scaleresearch/ttrl-sac-hopper
- Repositorio de la libreria ttrl (tt-rl): https://github.com/scaleresearch/tt-rl
- Configuracion de entrenamiento: `configs/hopper_sac.py` dentro del repositorio ttrl, replicada en `train_config.py` del modelo
- Ejemplo de despliegue en chip: `examples/mujoco-sac/deploy.py` en el repositorio ttrl
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
