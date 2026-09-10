# bestdive/sac-PandaReachDense-v3

## Resumen

`sac-PandaReachDense-v3` es un agente de aprendizaje por refuerzo publicado por el usuario `bestdive` en HuggingFace. Se trata de una política entrenada con el algoritmo SAC (Soft Actor-Critic) mediante la librería Stable Baselines3 2.3.2 sobre el entorno `PandaReachDense-v3` de panda-gym, un simulador de brazo robótico Franka Emika Panda ejecutado sobre PyBullet. No es un modelo de lenguaje: no genera texto, no procesa instrucciones y no dispone de ventana de contexto ni de cuantizaciones, por lo que buena parte de las métricas habituales de una ficha de LLM no son aplicables.

El propio autor lo describe como el trabajo de curso de la Unidad 6 de Kay Zheng, entrenado desde cero con asistencia de herramientas de programación con IA. El entrenamiento se realizó en CPU durante 20.000 pasos de entorno con semilla 42, una cifra muy reducida para una tarea de control continuo con SAC y que se refleja en el rendimiento declarado: recompensa media de -0,2263 ± 0,1048 en una evaluación de 100 episodios con semillas 100000–100099 (media menos desviación: -0,33115).

Su relevancia es fundamentalmente formativa y de reproducibilidad: el repositorio incluye el script de entrenamiento, el artefacto `model.zip` cargable con `SAC.load('model.zip')` y el archivo `evaluation.json` con las recompensas episódicas, lo que lo convierte en un ejemplo útil de pipeline RL completo y verificable, aunque con un rendimiento de política claramente insuficiente para resolver la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendizaje por refuerzo off-policy; algoritmo SAC (Soft Actor-Critic) implementado en Stable Baselines3 2.3.2. La model card no detalla la topologia de las redes de política y de valor |
| Parametros totales | No disponible (la model card no publica el numero de parametros ni la configuracion de capas) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (agente de control; consume observaciones vectoriales del entorno, no secuencias de texto) |
| Tipos de cuantizacion | No aplicable (no hay cuantizacion publicada; el artefacto se distribuye en el formato nativo de SB3) |
| Idiomas soportados | No aplicable (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.zip` (serializacion nativa de Stable Baselines3, cargable con `SAC.load`) |
| Entorno de entrenamiento | `PandaReachDense-v3` (panda-gym 3.0.7 sobre PyBullet 3.2.7, Gymnasium 0.29.1) |
| Pipeline en el Hub | reinforcement-learning |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | Menos de 50 MB (el Hub reporta 0,0 GB, valor redondeado) |
| Fecha de publicacion | 2026-09-10 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo es un agente SAC, un algoritmo actor-critic off-policy con regularizacion por entropia que aprende una política estocastica y dos funciones Q. La implementacion procede de Stable Baselines3 2.3.2 y se ejecuta sobre Gymnasium 0.29.1 con el entorno `PandaReachDense-v3` de panda-gym 3.0.7, que a su vez usa el motor de fisica PyBullet 3.2.7. La model card no especifica la topologia concreta de las redes (numero de capas ni unidades); Stable Baselines3 emplea por defecto una política MLP de dos capas ocultas de 256 unidades para SAC, pero no se confirma que esa haya sido la configuracion utilizada.

El entrenamiento consistio en 20.000 pasos de entorno ejecutados en CPU, con semilla 42 y sin que se documenten fases de ajuste fino, curriculum, aprendizaje por demostracion ni uso de técnicas como Hindsight Experience Replay, habituales en tareas de alcanzar un objetivo. La evaluacion se hizo sobre un conjunto retenido de 100 episodios con semillas 100000 a 100099, y las recompensas completas se guardan en `evaluation.json`. El autor documenta asimismo un detalle de reproducibilidad del entorno: en SDK modernos de macOS, compilar PyBullet 3.2.7 requirio `CFLAGS='-Dfdopen=fdopen'` para evitar que una macro de zlib incluida en el paquete eclipsara la declaracion del sistema.

## Capacidades

- Control continuo de un brazo robótico simulado: genera acciones de bajo nivel (movimiento del efector final) para aproximarlo a un objetivo dentro del entorno `PandaReachDense-v3`.
- Aprendizaje por refuerzo off-policy con política estocastica, muestreo de replay buffer y maximizacion de recompensa acumulada con termino de entropia.
- Inferencia puramente local y determinista en coste: al ser una red pequena ejecutable en CPU, no requiere acelerador de hardware.
- Reproducibilidad de experimentos: permite repetir el entrenamiento con `python train_panda.py` y recargar la política con `SAC.load('model.zip')`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni orquestacion de agentes.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural de ningun tipo.
- No incorpora modo de razonamiento explicito, ni capacidades de audio, ni multimodalidad.

## Casos de uso

- Banchmark de referencia para SAC en control continuo: sirve como punto de partida para medir el efecto de aumentar pasos de entrenamiento, cambiar hiperparametros o anadir Hindsight Experience Replay sobre la misma tarea.
- Plantilla docente de pipeline RL completo: el repositorio incluye entrenamiento, evaluacion con semillas retenidas y artefacto cargable, lo que lo hace util para ensenar el ciclo completo de un experimento de aprendizaje por refuerzo.
- Pruebas de regresion en CI de infraestructuras RL: al ejecutarse en CPU y ocupar menos de 50 MB, el agente se puede cargar en un job de integracion continua para verificar que una version nueva de panda-gym, PyBullet o Gymnasium no rompe la carga del modelo ni la interfaz de entorno.
- Punto de partida para ajuste fino en tareas mas complejas de panda-gym: la política y el pipeline podrian reutilizarse como inicializacion en tareas de alcance con obstaculos, empuje o agarre, aunque el bajo rendimiento actual limita el beneficio esperado.
- Generacion de trayectorias para experimentos auxiliares: los episodios registrados pueden usarse como datos de exploracion para estudiar tecnicas de imitacion o de analisis de comportamiento, siempre que se asuma su baja calidad.
- Investigacion sobre reproducibilidad y semillas: el par entrenamiento-semilla 42 y evaluacion con 100 semillas fijas permite estudiar varianza entre episodios y sensibilidad a la inicializacion sin coste de computo relevante.
- Docencia de simulacion robotica sin hardware: permite ilustrar cinematica de alcance y espacios de observacion/accion de un brazo Panda en PyBullet sin necesidad de un robot fisico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (metrica no verificada por terceros):

| Metrica | Dataset / entorno | Valor | Verificado |
|---|---|---|---|
| mean_reward | PandaReachDense-v3 | -0,2263398146163672 +/- 0,1048106702883708 | No |
| mean_reward - std | PandaReachDense-v3 | -0,331150 | No |

Contexto de la evaluacion: 100 episodios con semillas 100000–100099, sobre un agente entrenado 20.000 pasos de entorno con semilla 42. No se han publicado en la informacion disponible resultados comparables de otros agentes sobre el mismo entorno, por lo que no se incluye tabla comparativa de cifras.

## Requisitos de hardware

- VRAM: no aplicable. El agente no requiere GPU; el propio entrenamiento se ejecuto en CPU.
- Memoria RAM estimada: por debajo de 500 MB, incluyendo el interprete de Python, Stable Baselines3 y PyTorch en modo CPU (estimacion orientativa; el Hub reporta un repositorio de menos de 50 MB).
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; una GPU solo aportaria ventaja si se reentrena el agente con un numero de pasos mucho mayor.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU. En caso de reentrenamiento, una RTX 3060 o superior bastaria para acelerar el muestreo.
- Opciones de despliegue: carga directa con Stable Baselines3 (`SAC.load('model.zip')`) dentro de un script Python; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del coste de simulacion de PyBullet en cada paso, no del coste de inferencia de la red, que es despreciable frente al del simulador.

## Comparativa con modelos similares

Comparativa cualitativa con alternativas de la misma categoria (políticas de control continuo para tareas de alcance con brazo robotico simulado). No se dispone de cifras publicadas de estas alternativas en la informacion proporcionada.

| Alternativa | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SAC, SB3) | No disponible | PandaReachDense-v3, observaciones vectoriales | mean_reward -0,2263 +/- 0,1048 (autor, no verificado) | MIT | HuggingFace, 0 descargas |
| SAC con Hindsight Experience Replay en panda-gym | No disponible | Misma familia de tareas, recompensa dispersa o densa | No disponible | Segun implementacion | No disponible en la informacion proporcionada |
| TD3 o PPO sobre PandaReachDense-v3 | No disponible | Misma tarea | No disponible | Segun implementacion | No disponible en la informacion proporcionada |
| Baselines del RL Baselines3 Zoo para panda-gym | No disponible | Tareas panda-gym, habitualmente con entrenamientos de orden de millones de pasos | No disponible | MIT (proyecto base) | Publicos como hiperparametros de referencia, cifras no consultadas |

## Limitaciones y advertencias

- Rendimiento insuficiente: una recompensa media negativa de -0,2263 indica, bajo la formulacion habitual de recompensa densa de panda-gym (negativa de la distancia al objetivo), que la política no alcanza el objetivo con precision. La media menos la desviacion (-0,33115) sugiere un comportamiento erratico en una parte de los episodios.
- Entrenamiento muy corto: 20.000 pasos de entorno estan muy por debajo de lo habitual para SAC en control continuo, donde los baselines suelen emplear ordenes de 10^5 a 10^6 pasos.
- Una sola semilla de entrenamiento y ausencia de busqueda de hiperparametros documentada; no se puede afirmar estabilidad del resultado.
- Metricas no verificadas: los valores del model-index estan marcados como `verified: false` y proceden unicamente del autor.
- Ausencia de datos clave: no se publican numero de parametros, arquitectura de red, hiperparametros de SAC ni curva de aprendizaje, lo que dificulta la reproducibilidad fina.
- Sesgos: no aplican sesgos sociales o linguisticos por tratarse de un agente de control, pero si puede existir sesgo hacia las condiciones de entrenamiento (seed 42, distribucion de objetivos de la tarea concreta) que limita la generalizacion.
- Transferencia simbólica a real: el agente opera en PyBullet; no hay validacion en robot fisico y la brecha sim-a-real no se ha evaluado.
- Fallo de compilacion conocido en macOS modernos con PyBullet 3.2.7 si no se aplica `CFLAGS='-Dfdopen=fdopen'`, un obstaculo de reproducibilidad documentado por el propio autor.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero se ofrece sin garantia alguna y sin soporte; al ser un trabajo de curso, no hay mantenimiento previsto.
- Adopcion nula hasta la fecha (0 descargas, 0 likes), por lo que no existe validacion externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bestdive/sac-PandaReachDense-v3
- Archivo de evaluacion del autor: `evaluation.json` (referenciado en la model card del repositorio; sin URL directa en la informacion proporcionada)
- Script de entrenamiento: `train_panda.py` (referenciado en la model card del repositorio; sin URL directa en la informacion proporcionada)
- Referencias de las librerias citadas por el autor (no procedentes de la busqueda web): Stable Baselines3 (https://github.com/DLR-RM/stable-baselines3), panda-gym (https://github.com/qgallouedec/panda-gym), Gymnasium (https://gymnasium.farama.org/)
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las unicas entradas devueltas por la busqueda son noticias de prensa alemana sobre Ceuta y el CNI, sin ninguna relacion con el modelo. No hay paper, blog, repositorio adicional ni demo asociados disponibles.
