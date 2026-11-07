# Charlottej23/connectailab-rl-charlottej23-v1-roadster-ppo

## Resumen

connectailab-rl-charlottej23-v1-roadster-ppo es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para una tarea de control continuo muy concreta: hacer aterrizar sobre sus ruedas un vehiculo tipo roadster que cae invertido, accionando un propulsor inferior con intensidad entre 0 y 1 y un control de rotacion entre -1 y 1. El modelo lo publica el usuario Charlottej23 en Hugging Face y forma parte del material del curso de IA de refuerzo "AI CITY BUILDERS" del CONNECT AI LAB, en su sexta leccion.

No es un modelo de lenguaje ni un modelo fundacional: es una politica neuronal entrenada especificamente para un entorno de simulacion Gymnasium llamado `로드스터연속` (roadster continuo), implementado en un fichero `로드스터_시뮬레이터.py`. El espacio de estados tiene 7 dimensiones (posicion x e y, velocidad x e y, seno y coseno de la inclinacion, y velocidad angular) y el espacio de acciones es continuo de 2 dimensiones. El autor reporta una tasa de aterrizaje del 100 % en 50 episodios nunca vistos durante el entrenamiento.

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo reproducible de un pipeline PPO completo (entorno, hiperparametros, curva de entrenamiento y capturas de aterrizaje) para quienes aprenden RL aplicado al control continuo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0.0 GB, lo que sugiere que los pesos pueden no estar publicados o son de muy pocos parametros (la red oculta declarada es de 128 unidades).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para RL (PPO), capa oculta de 128 unidades; arquitectura exacta (numero de capas, activaciones) no disponible |
| Parametros totales | No disponible (red oculta de 128 unidades; el tamano del repo figura como 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el estado es un vector de 7 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados; el formato nativo es PyTorch) |
| Idiomas soportados | No aplica (no procesa texto); la model card esta redactada en coreano |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se especifica si se publican `state_dict`, TorchScript u otro formato |

## Arquitectura y entrenamiento

La politica se entrena con PPO sobre un entorno Gymnasium de control continuo. La configuracion declarada en la model card es: 1.000.000 de pasos de entrenamiento, 16 entornos en paralelo, horizonte de 256 pasos, clipping de 0.2, factor de descuento gamma de 0.99, GAE lambda de 0.95, tasa de aprendizaje de 0.0003, red oculta de 128 unidades, coeficiente de entropia de 0.002 y semilla 0. El espacio de observacion combina posicion y velocidad lineales, la representacion trigonometrica de la inclinacion (seno y coseno, para evitar discontinuidades angulares) y la velocidad de rotacion; el espacio de acciones es un vector continuo de dos componentes (intensidad del propulsor inferior y par de rotacion).

No se detalla en la informacion disponible la composicion del dataset (aqui generado por el propio simulador), el numero exacto de capas de la red, ni si se aplicaron tecnicas adicionales como normalizacion de observaciones, recompensas conformadas o curriculum. Las innovaciones destacables se limitan al diseno del espacio de estados con seno/coseno de la inclinacion y al uso de 16 entornos vectorizados para estabilizar el entrenamiento PPO. La model card incluye una curva de entrenamiento (`ppo_training_curve.png`) y capturas de aterrizajes (`ppo_landing_snapshots.png`) como evidencia cualitativa.

## Capacidades

- Control continuo de dos acciones: intensidad de propulsor en rango [0, 1] y rotacion en rango [-1, 1].
- Estabilizacion y reorientacion de un cuerpo rigido en caida invertida hasta el contacto con el suelo por las ruedas.
- Generalizacion a condiciones iniciales no vistas: el autor reporta 100 % de exito en 50 episodios nuevos.
- Toma de decisiones paso a paso a partir de un vector de estado de 7 dimensiones (posicion, velocidad, orientacion trigonometrica y velocidad angular).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni procesamiento de lenguaje natural.
- No tiene capacidades multilingues: no procesa ni genera texto.

## Casos de uso

- Docencia de RL con PPO: el modelo y su configuracion completa sirven como referencia reproducible en un curso de refuerzo; los alumnos pueden replicar el entrenamiento con los mismos hiperparametros y comparar curvas.
- Banco de pruebas de entornos de control continuo: util para validar que un simulador Gymnasium propio (el roadster) funciona correctamente antes de escalar a tareas mas complejas.
- Baseline para comparativas de algoritmos: al ser una politica PPO sencilla con semilla fija, permite medir si variantes como SAC o TD3 mejoran la tasa de aterrizaje en el mismo entorno.
- Estudio de representaciones angulares: el uso de seno y coseno de la inclinacion en el estado es un ejemplo concreto para investigar como codificar angulos sin discontinuidades en problemas de control.
- Generacion de demostraciones visuales: las capturas de aterrizaje y la curva de entrenamiento son material listo para presentaciones o articulos divulgativos sobre RL.
- Punto de partida para transferencia a otros vehiculos: la misma receta (PPO, 16 entornos, 1M de pasos, red de 128) puede reutilizarse para entrenar agentes en variantes del simulador con mas propulsores o perturbaciones.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de aterrizaje | 100 % | 50 episodios no vistos durante el entrenamiento |
| Pasos de entrenamiento | 1.000.000 | 16 entornos en paralelo, horizonte 256 |
| Semilla | 0 | Configuracion declarada en la model card |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje. No se proporcionan metricas de recompensa media, varianza entre semillas ni tiempos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dada una red con capa oculta de 128 unidades y estado de 7 dimensiones; la cifra exacta no esta disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (por ejemplo, RTX 3060, RTX 4090); tambien es viable en CPU para inferencia paso a paso.
- Cabe en GPU consumer: si, con amplio margen; el cuello de botella es el simulador, no la red.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Requiere el entorno `로드스터_시뮬레이터.py` para ejecutar la politica en su contexto.
- Latencia y throughput: no disponibles; dependen del simulador y del hardware. Para el entrenamiento declarado (1M de pasos, 16 entornos), se espera un coste de horas en una GPU consumer, aunque no se aporta la medicion.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Pasos de entrenamiento | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-charlottej23-v1-roadster-ppo | Politica RL | Roadster continuo (Gymnasium) | PPO | 1.000.000 | No disponible |
| connectailab-rl-juju-v1-roadster-ppo (connect-ai-lab-aimo) | Politica RL | Roadster continuo (Gymnasium) | PPO | No disponible | No disponible |
| connectailab-rl-artnfull-v1-roadster-ppo (artnfull) | Politica RL | Roadster continuo (Gymnasium) | PPO | No disponible | No disponible |

Los tres modelos pertenecen a la misma familia del CONNECT AI LAB y comparten el mismo entorno y algoritmo; no se dispone de datos de rendimiento de los otros dos para comparar tasas de aterrizaje ni curvas de entrenamiento.

## Limitaciones y advertencias

- Especificidad extrema: la politica solo funciona en el entorno `로드스터연속` para el que fue entrenada; no es reutilizable como modelo general.
- Sin licencia declarada: no se especifican terminos de uso comercial ni de redistribucion, lo que impide asumir permisos.
- Evidencia limitada: el 100 % de exito se basa en 50 episodios de una unica semilla y no se aportan metricas de recompensa, varianza ni evaluacion con multiples semillas.
- Posible ausencia de pesos: el repositorio figura con 0.0 GB, por lo que no esta claro que los pesos entrenados esten publicados; habria que verificar los ficheros.
- Dependencia del simulador: sin el codigo del entorno no se puede reproducir ni evaluar el modelo; la model card no enlaza el fichero del simulador.
- Sin capacidades de lenguaje, vision ni tool calling: no debe evaluarse con los criterios habituales de modelos fundacionales.
- Riesgo de sobreajuste al simulador: no se documenta aleatorizacion de dominio ni pruebas con perturbaciones, por lo que el comportamiento fuera de la distribucion de entrenamiento es incierto.
- Documentacion en coreano: la model card no esta en castellano ni en ingles, lo que puede dificultar su adopcion fuera de la comunidad original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlottej23/connectailab-rl-charlottej23-v1-roadster-ppo
- Modelo hermano (connect-ai-lab-aimo): https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v1-roadster-ppo
- Modelo hermano (artnfull): https://huggingface.co/artnfull/connectailab-rl-artnfull-v1-roadster-ppo
