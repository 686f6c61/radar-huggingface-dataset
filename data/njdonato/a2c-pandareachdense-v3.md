# njdonato/a2c-PandaReachDense-v3

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo A2C (Advantage Actor-Critic) sobre el entorno PandaReachDense-v3, una tarea de manipulacion robotica del conjunto de entornos Gymnasium-Robotics. El modelo ha sido entrenado con la libreria stable-baselines3 y publicado por el usuario njdonato en Hugging Face bajo el pipeline de reinforcement-learning. No se trata de un modelo de lenguaje ni de un modelo generativo: es una politica neuronal que mapea observaciones del entorno (posicion del efector final, posicion del objetivo y velocidades) a acciones continuas de control del brazo robotico.

La relevancia de este artefacto es acotada: sirve como referencia reproducible de un entrenamiento A2C en una tarea de alcanzar un objetivo (reach) con un robot Panda de Franka Emika. El resultado declarado es un retorno medio de -0,19 +/- 0,10, lo que indica un rendimiento bajo o mediocre en la tarea densa, coherente con un entrenamiento corto o no optimizado. No hay informacion sobre numero de pasos de entrenamiento, hiperparametros ni arquitectura de la red.

La model card esta practicamente vacia: no incluye codigo de uso funcional (contiene un TODO), no declara licencia, no especifica idiomas y no aporta documentacion sobre el proceso de entrenamiento. El tamano del repositorio es de 0,0 GB, lo que sugiere un artefacto muy pequeno, probablemente un unico fichero de pesos de una red MLP de pocas capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (actor-critic) entrenada con A2C sobre stable-baselines3; arquitectura exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el entorno PandaReachDense-v3 define observaciones de dimension fija) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los pesos de SB3 se distribuyen en formato nativo PyTorch) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion; por convencion de stable-baselines3 se espera un fichero `.zip` cargable con `load_from_hub` |
| Algoritmo | A2C (Advantage Actor-Critic) |
| Entorno | PandaReachDense-v3 (Gymnasium-Robotics) |
| Libreria | stable-baselines3 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El agente emplea el algoritmo A2C, un metodo actor-critic on-policy con ventaja estimada mediante bootstrapping. En stable-baselines3, A2C se implementa por defecto con una politica `MlpPolicy`: dos redes multicapa separadas (actor y critico) que procesan el vector de observacion del entorno. Para PandaReachDense-v3, la observacion tipica incluye la posicion del efector final, la posicion del objetivo, la diferencia entre ambas y las velocidades de las articulaciones, aunque la dimension exacta no se documenta en la informacion disponible.

No se proporcionan datos sobre el numero de pasos de entrenamiento, el tamano de los lotes, la tasa de aprendizaje, el numero de entornos paralelos, la semilla ni la composicion del dataset (en RL no hay dataset en el sentido supervisado, sino experiencia recolectada por interaccion con el simulador). Tampoco se indica si se aplicaron tecnicas como normalizacion de observaciones, reward shaping adicional o curriculo. La unica metrica declarada es el retorno medio de -0,19 +/- 0,10, que sugiere que el agente no llega a resolver la tarea de forma consistente.

No se documenta ninguna innovacion tecnica: es un entrenamiento estandar de A2C sin modificaciones conocidas.

## Capacidades

- Control continuo de un brazo robotico Panda en la tarea de alcanzar un objetivo (reach) definida por PandaReachDense-v3.
- Politica determinista o estocastica segun el modo de muestreo configurado en la carga del agente.
- Compatible con la API de stable-baselines3 (`predict`, `load`, evaluacion con `evaluate_policy`).
- Integrable con Gymnasium-Robotics y con el wrapper de Hugging Face (`huggingface_sb3.load_from_hub`).
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision, audio ni razonamiento simbolico general.
- No dispone de modo "thinking" ni de generacion de texto.

## Casos de uso

- Reproduccion de experimentos de RL: sirve como punto de partida para comparar A2C frente a PPO o SAC en PandaReachDense-v3, cargando el agente con `load_from_hub` y evaluandolo con `evaluate_policy`.
- Docencia y formacion: ejemplo minimo de un agente A2C publicado en el Hub, util para ilustrar el flujo completo de entrenamiento, publicacion y carga en stable-baselines3.
- Baseline de referencia: dado su retorno medio de -0,19, puede usarse como linea base negativa para demostrar mejoras al ajustar hiperparametros o cambiar de algoritmo.
- Pruebas de infraestructura: validar pipelines de evaluacion de entornos Gymnasium-Robotics y de integracion con el Hub sin necesidad de entrenar desde cero.
- Investigacion en manipulacion robotica: experimentar con reward shaping o con variantes densas del entorno usando esta politica como inicializacion.
- Demostraciones de simulacion: ejecutar el agente en MuJoCo/PyBullet para visualizar el comportamiento de un A2C poco entrenado en una tarea de reach, comparandolo cualitativamente con politicas mejor ajustadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| A2C | PandaReachDense-v3 | mean_reward | -0,19 +/- 0,10 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con PPO, SAC ni TD3 en el mismo entorno dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; al tratarse de una MLP de politica para un entorno de control, el modelo cabe holgadamente en cualquier GPU consumer e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU dedicada; una RTX 3060, RTX 4090 o incluso CPU son suficientes para la inferencia. Para reentrenamiento, una GPU consumer acelera la recoleccion de experiencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: stable-baselines3 (carga nativa), `huggingface_sb3.load_from_hub`, y ejecucion dentro de Gymnasium-Robotics con MuJoCo. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del simulador fisico (MuJoCo) mas que del propio agente.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Retorno declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| njdonato/a2c-PandaReachDense-v3 | A2C | PandaReachDense-v3 | -0,19 +/- 0,10 | no disponible | Hugging Face |
| Alternativas A2C/PPO en PandaReachDense-v3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros agentes comparables en el mismo entorno dentro de la informacion proporcionada. La comparativa con PPO, SAC o TD3 requeriria datos externos no incluidos en esta ficha.

## Limitaciones y advertencias

- Rendimiento bajo: el retorno medio de -0,19 +/- 0,10 sugiere que el agente no resuelve de forma fiable la tarea de reach; no es adecuado para uso en produccion robotica real.
- Model card incompleta: el codigo de uso contiene un TODO y no hay instrucciones funcionales de carga ni evaluacion.
- Licencia no declarada: no se puede asumir uso comercial; la ausencia de licencia implica incertidumbre legal.
- Sin documentacion de entrenamiento: se desconocen hiperparametros, numero de pasos, semillas y protocolo de evaluacion, lo que impide reproducir el resultado.
- Metrica no verificada: el `mean_reward` figura con `verified: false` en el model-index.
- Sesgos: no aplica en el sentido linguistico, pero la politica puede estar sobreajustada a la distribucion de estados visitada durante un entrenamiento corto y fallar fuera de ella.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto o idioma: no aplica; el modelo opera sobre vectores de observacion de dimension fija del entorno.
- Caveat para produccion: cualquier despliegue en un robot real requeriria reentrenamiento, validacion de seguridad y evaluacion en el entorno fisico objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/njdonato/a2c-PandaReachDense-v3
- stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- huggingface_sb3: https://github.com/huggingface/huggingface_sb3
- Gymnasium-Robotics (PandaReachDense-v3): https://robotics.farama.org/
- Documentacion de A2C en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/a2c.html
