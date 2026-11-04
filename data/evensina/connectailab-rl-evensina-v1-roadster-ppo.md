# EvenSina/connectailab-rl-evensina-v1-roadster-ppo

## Resumen

`connectailab-rl-evensina-v1-roadster-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO (Proximal Policy Optimization) para control continuo en un entorno de simulacion 2D. El modelo, desarrollado por EvenSina (Shin Hyun-koo) en el marco del CONNECT AI LAB, resuelve una tarea muy concreta: aterrizar de forma segura un roadster que cae invertido, accionando dos propulsores (empuje vertical de 0 a 1 y par de rotacion de -1 a 1) para que las ruedas toquen el suelo primero.

No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal que mapea un estado de 7 dimensiones (posicion x/y, velocidad x/y, sin y cos de la inclinacion, y velocidad angular) a una accion continua de 2 dimensiones. Se distribuye como pesos de PyTorch para su uso con la libreria de RL correspondiente, y esta pensado como material didactico del curso "AI CITY BUILDERS" (leccion 6 de RL) de CONNECT AI LAB.

Su relevancia es acotada: sirve como referencia de entrenamiento PPO en control continuo y como ejemplo de politica robusta dentro de su dominio (98% de exito en 50 episodios no vistos), pero no es un modelo de proposito general ni tiene aplicaciones fuera del simulador para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para RL (PPO, actor-critico); topologia de capas no disponible |
| Parametros totales | no disponible (repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control, estado de 7 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision original) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`/`state_dict`; no confirmado en la informacion) |

Especificaciones del entorno y del entrenamiento:

| Parametro | Valor |
|---|---|
| Entorno | `로드스터연속` (Roadster continuo), Gymnasium, en `로드스터_시뮬레이터.py` |
| Espacio de estados | 7 dimensiones: x, y, vx, vy, sin(θ), cos(θ), velocidad angular |
| Espacio de acciones | 2 continuas: empuje inferior [0, 1], par de rotacion [-1, 1] |
| Algoritmo | PPO |
| Pasos de entrenamiento | 700.000 |
| Entornos paralelos | 12 |
| Clip | 0.2 |
| Gamma | 0.99 |
| GAE lambda | 0.95 |
| Learning rate | 0.00035 |
| Tasa de exito reportada | 98% en 50 episodios de test no vistos |

## Arquitectura y entrenamiento

El modelo es una politica PPO de control continuo, presumiblemente una red neuronal multicapa que recibe el vector de estado de 7 componentes y emite los parametros de una distribucion (media y desviacion tipica) sobre las dos acciones continuas. La informacion disponible no detalla el numero de capas, las unidades por capa ni la funcion de activacion, por lo que la topologia exacta debe considerarse no disponible. Se trata de un esquema actor-critico estandar de PPO con ventaja generalizada (GAE) y recorte de la relacion de probabilidades a 0.2.

El entrenamiento se realizo durante 700.000 pasos con 12 entornos ejecutados en paralelo, un learning rate de 0.00035, gamma de 0.99 y GAE lambda de 0.95. No se especifica el numero de tokens ni una composicion de dataset al uso, ya que el aprendizaje es por interaccion con el simulador, no supervisado. Tampoco se documenta si hubo ajuste fino posterior, curriculum o recompensas moldeadas; la model card solo reporta la configuracion de PPO y el resultado final. La innovacion tecnica destacable es la robustez de la politica: generaliza a episodios no vistos con un 98% de exito en 50 pruebas, lo que sugiere una politica bien regularizada dentro de la distribucion del simulador.

## Capacidades

- Control continuo de dos actuadores (empuje y par de rotacion) a partir de un estado de 7 dimensiones.
- Estabilizacion y reorientacion de un cuerpo rigido en caida invertida hasta que las ruedas contactan con el suelo.
- Generalizacion dentro del dominio: 98% de exito en 50 episodios de test no vistos.
- Inferencia en tiempo real por paso de simulacion (politica ligera, sin requisitos de GPU significativos).
- Integracion con Gymnasium mediante el entorno `로드스터연속` del simulador `로드스터_시뮬레이터.py`.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision, audio ni capacidades multilingues: es exclusivamente una politica de control.

## Casos de uso

- Docencia de RL: servir como politica de referencia resuelta en la leccion 6 del curso "AI CITY BUILDERS" de CONNECT AI LAB, permitiendo al alumnado comparar su propio entrenamiento PPO con una politica que alcanza el 98% de exito.
- Baseline de control continuo: usar el agente como linea base en experimentos con PPO sobre el entorno roadster, midiendo mejoras de recompensa o tasa de exito frente a esta politica.
- Validacion de simuladores: comprobar la coherencia fisica del simulador `로드스터_시뮬레이터.py` ejecutando la politica entrenada y verificando que el aterrizaje se produce de forma estable.
- Demostracion de generalizacion: evaluar la politica en 50 o mas episodios con condiciones iniciales aleatorias para ilustrar la diferencia entre rendimiento de entrenamiento y de test.
- Estudio de robustez ante perturbaciones: modificar ligeramente parametros del entorno (gravedad, masas, ruido en observaciones) para analizar la degradacion de la politica fuera de distribucion.
- Generacion de material audiovisual: producir videos de replay (`replay.mp4`) y curvas de aprendizaje (`learning_curve.png`) para documentacion tecnica o divulgacion.
- Punto de partida para ajuste fino: reentrenar o afinar la politica con PPO sobre variantes del entorno (por ejemplo, con viento o con limites de propulsion) aprovechando los pesos publicados.

## Benchmarks y rendimiento

La unica metrica reportada por el autor es la tasa de exito en evaluacion:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de exito (aterrizaje) | 98% | 50 episodios de test no vistos |
| Pasos de entrenamiento | 700.000 | 12 entornos en paralelo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones numericas con otras politicas del mismo entorno.

## Requisitos de hardware

- VRAM estimada: minima o nula; una politica para un estado de 7 dimensiones y 2 acciones ocupa del orden de kilobytes a pocos megabytes en funcion de la topologia, aunque el tamano exacto no esta disponible.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para inferencia en tiempo real.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o integradas; tambien en Raspberry Pi para inferencia.
- Opciones de despliegue: PyTorch en Python con Gymnasium; exportacion a TorchScript u ONNX para inferencia embebida (no documentada por el autor).
- Latencia y throughput: no disponibles; por la dimensionalidad del problema se espera una latencia inferior al milisegundo por paso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre politicas comparables publicadas para el mismo entorno `로드스터연속` ni de resultados de otros autores en esta tarea concreta.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-evensina-v1-roadster-ppo | no disponible | no aplica | 98% exito en 50 episodios | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: la politica solo es valida para el entorno roadster del simulador de CONNECT AI LAB; no es un modelo de proposito general.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni modificacion; debe contactarse con el autor antes de cualquier uso productivo.
- Sin idiomas ni capacidades de lenguaje: no puede emplearse en tareas de texto, codigo, vision ni dialogo.
- Riesgo de sobreajuste al simulador: el 98% de exito se mide en el mismo entorno de entrenamiento; cambios en fisica, ruido o distribucion inicial pueden degradar el rendimiento sin garantia.
- Sin documentacion de sesgos: no se analiza el comportamiento de la politica ante estados atipicos (caidas laterales, velocidades extremas) ni la tasa de fallo catastrofico.
- Repositorio vacio o minimo (0.0 GB): los pesos y artefactos podrian no estar realmente subidos, lo que impediria su uso directo.
- Sin informacion sobre la topologia de red ni sobre el proceso de exportacion: la reproducibilidad del entrenamiento no esta garantizada.
- Sin resultados de benchmarks estandar ni comparativas: no es posible situar la politica frente a alternativas con rigor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EvenSina/connectailab-rl-evensina-v1-roadster-ppo
- Simulador referenciado en la model card: `로드스터_시뮬레이터.py` (no se proporciona URL)
- Video de demostracion: `replay.mp4` (referenciado en la model card, sin URL publica)
- Curva de aprendizaje: `learning_curve.png` (referenciada en la model card, sin URL publica)
- Curso "AI CITY BUILDERS" de CONNECT AI LAB: no disponible (sin URL en la informacion proporcionada)
- Paper o blog tecnico: no disponible
