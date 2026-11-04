# lucaskim72/connectailab-rl-lucasbrain-v3-lunarlander

## Resumen

`connectailab-rl-lucasbrain-v3-lunarlander` es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) desarrollado por Lucas Kim, autor independiente vinculado al proyecto CONNECT AI LAB y a AI CITY BUILDERS. No es un modelo de lenguaje: es una red neuronal Q (Q-network) entrenada para resolver el entorno `LunarLander-v3` de Gymnasium, un problema de control continuo-discreto en el que un modulo lunar debe aterrizar de forma segura en una plataforma.

El modelo resuelve el problema clasico de control de aterrizaje: recibe un vector de 8 observaciones numericas (posicion x e y, velocidades x e y, angulo, velocidad angular y contacto de cada una de las dos patas) y emite una de cuatro acciones discretas (no hacer nada, motor izquierdo, motor principal, motor derecho). La red emplea una arquitectura dueling con dos capas ocultas de 256 unidades y se entreno con DQN doble, prioritized experience replay y retornos n-step de 3.

Es relevante como ejemplo educativo y reproducible de un pipeline DQN completo aplicado a un entorno de referencia, con un resultado declarado de 275,5 puntos de media en 10 episodios de validacion con semillas fijas (el umbral de exito del entorno es 200). Su interes practico es limitado fuera del entorno LunarLander, y no debe confundirse con un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red Q dueling (MLP: 8 -> 256 -> 256 -> ramas valor/ventaja) |
| Parametros totales | no disponible (estimacion: ~140.000, calculada a partir de las dimensiones de capa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de decision por paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32 PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch con clave `state_dict`) |

Especificaciones del entorno y del entrenamiento:

| Parametro | Valor |
|---|---|
| Entorno | Gymnasium `LunarLander-v3` |
| Dimension de observacion | 8 (posicion x, y; velocidad x, y; angulo; velocidad angular; pata izquierda; pata derecha) |
| Espacio de acciones | 4 discretas (nada, motor izquierdo, motor principal, motor derecho) |
| Algoritmo | DQN doble con dueling, PER y n-step = 3 |
| Pasos de entrenamiento | 400.000 |
| Tamano de capa oculta | 256 |
| Learning rate | 0,00015 |
| Gamma | 0,99 |
| Soft tau (Polyak) | 0,005 |
| Fraccion de exploracion | 0,5 |
| Reward shaping | ninguno |
| Gradient clipping | 10,0 |
| Recompensa media (holdout) | 275,5 en 10 episodios (semillas 7000-7009) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa con dos capas densas de 256 unidades y activacion ReLU, del que se derivan dos cabezas lineales: una de valor escalar (`v`, salida 1) y otra de ventaja (`a`, salida 4). La salida Q se compone como `V + A - mean(A)`, la descomposicion estandar de dueling DQN, que permite estimar el valor del estado con independencia de la accion elegida y mejora la estabilidad del aprendizaje en entornos con acciones poco discriminativas.

El entrenamiento combina tres tecnicas habituales de DQN moderno: Double DQN (para reducir el sesgo de sobreestimacion de los valores Q), prioritized experience replay (PER) y retornos n-step con n = 3. Se ejecutaron 400.000 pasos de entorno con un learning rate de 0,00015, actualizaciones suaves del target con tau de 0,005, factor de descuento 0,99 y clipping de gradiente en 10,0. No se aplico reward shaping, de modo que la recompensa optimizada es exactamente la del entorno original. La model card no detalla la composicion del buffer de replay, el tamano del lote ni el esquema de evaluacion mas alla de las semillas de validacion.

## Capacidades

- Control de aterrizaje en `LunarLander-v3`: selecciona una de cuatro acciones discretas a partir de 8 observaciones numericas.
- Politica determinista por paso: la accion se obtiene mediante `argmax` sobre los valores Q, sin muestreo estocastico.
- Aprendizaje por refuerzo off-policy: la red puede reutilizarse como inicializacion para fine-tuning en el mismo entorno o en variantes con espacio de acciones identico.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbolico.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo de razonamiento explicito (thinking mode) ni de generacion de texto.

## Casos de uso

- Material didactico de DQN: el checkpoint y el codigo de inferencia incluidos en la model card permiten reproducir un agente LunarLander funcional en pocas lineas, util como referencia en cursos de aprendizaje por refuerzo.
- Baseline de comparacion: sirve como punto de partida para evaluar variantes de DQN (sin dueling, sin PER, con reward shaping) sobre el mismo entorno y las mismas semillas de validacion.
- Inicializacion para fine-tuning: los pesos pueden cargarse como punto de partida para experimentar con hiperparametros alternativos en `LunarLander-v3` o entornos con observaciones y acciones equivalentes.
- Validacion de infraestructura de RL: al ser un modelo pequeno (repo de 0,0 GB), es adecuado para probar pipelines de evaluacion, logging y despliegue de agentes en entornos Gymnasium.
- Demostraciones interactivas: puede integrarse en un bucle de renderizado de Gymnasium para visualizar la politica aprendida en una demo o tutorial.
- Pruebas de robustez de politica: permite medir la varianza de recompensa entre semillas y analizar la sensibilidad del agente a condiciones iniciales distintas.
- Referencia para divulgacion: util en articulos o charlas que expliquen el ciclo completo de entrenamiento DQN con un caso concreto y metricas declaradas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recompensa media (holdout, 10 episodios) | 275,5 |
| Semillas de evaluacion | 7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009 |
| Umbral de exito del entorno | 200 |
| Pasos de entrenamiento | 400.000 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la recompensa media declarada. No hay comparacion con otros agentes en la model card, ni desglose por episodio, ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el checkpoint contiene una red de aproximadamente 140.000 parametros en float32.
- GPU recomendadas: no requiere GPU. Cualquier GPU con CUDA (por ejemplo, RTX 3060, RTX 4090, A100) funciona, pero la CPU es suficiente para inferencia en tiempo real.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el cuello de botella es el bucle del entorno Gymnasium, no la red.
- Opciones de despliegue: PyTorch nativo (carga directa con `torch.load` y `state_dict`), exportacion a TorchScript u ONNX para inferencia sin dependencia de Python, o integracion en un bucle de Gymnasium con `gym.make("LunarLander-v3")`.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano de la red, la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v3-lunarlander | DQN dueling + PER + n-step | LunarLander-v3 | ~140.000 (estimado) | no aplica | no disponible | HuggingFace |
| Agentes DQN de referencia (p. ej., implementaciones de CleanRL o Stable-Baselines3) | DQN estandar | LunarLander-v3 | del orden de 10^5 | no aplica | MIT (segun proyecto) | GitHub / PyPI |
| Agentes PPO de referencia | PPO | LunarLander-v3 | del orden de 10^5 | no aplica | MIT (segun proyecto) | GitHub / PyPI |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La comparativa se limita a categoria, entorno y disponibilidad.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en `LunarLander-v3`; no generaliza a otros entornos ni tareas.
- No es un modelo de lenguaje ni un modelo generativo: no admite prompts, texto, vision ni audio.
- La recompensa declarada (275,5) procede de 10 episodios con semillas fijas; no se aportan intervalos de confianza ni evaluacion con semillas aleatorias, por lo que la robustez fuera de ese conjunto no esta verificada.
- La licencia no esta especificada, lo que impide confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- El checkpoint se carga con `weights_only=False` en el ejemplo del autor, lo que implica riesgos de seguridad al deserializar archivos pickle; se recomienda auditar el archivo antes de cargarlo en entornos no confiables.
- No hay informacion sobre sesgos, alucinacion ni comportamiento fuera de distribucion; en RL, la politica puede degradarse ante condiciones iniciales no vistas durante el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB; no hay evidencia de validacion por parte de terceros.
- No se documentan los detalles del buffer de replay, el tamano de lote ni el numero de actualizaciones por paso, lo que dificulta la reproducibilidad exacta del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v3-lunarlander
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, seccion de robotica y RL: https://www.aicitybuilders.com/robot
- Entorno Gymnasium LunarLander-v3: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Contacto del autor: lucaskim72@gmail.com
