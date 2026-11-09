# NADANAYO/connectailab-rl-nadanayo-v1-roadster-ppo-custom

## Resumen

`connectailab-rl-nadanayo-v1-roadster-ppo-custom` es una politica neuronal entrenada con PPO (Proximal Policy Optimization) para control continuo en un entorno de simulacion fisica. El objetivo concreto es controlar un vehiculo tipo roadster que cae volcado y debe girarse mediante dos acciones: intensidad del propulsor (rango 0 a 1) y par de rotacion (rango -1 a 1), hasta aterrizar sobre las ruedas. El modelo lo publica el usuario NADANAYO como material practico del curso "AI CITY BUILDERS", leccion 6 de reinforcement learning.

No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de politica (actor-critic PPO) para un espacio de acciones `Box(2)` continuo. Se entreno durante 400.000 pasos en 8 entornos paralelos y reporta una tasa de exito de aterrizaje del 26,0 % en 50 episodios de test no vistos. El repositorio no incluye pesos visibles (tamano 0.0 GB) ni model card con detalles de arquitectura de red, observaciones o recompensa.

Su relevancia es acotada y didactica: sirve como ejemplo reproducible de un pipeline PPO para control continuo en un entorno tipo Connect AI Lab, no como componente para produccion. La ausencia de licencia explicita y de documentacion tecnica limita su reutilizacion fuera del contexto del curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica PPO (actor-critic); topologia no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control continuo, no texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`library_name: pytorch`); el repositorio figura con 0.0 GB, por lo que no se confirma la presencia de artefactos de pesos |

Otros hiperparametros declarados por el autor:

| Parametro | Valor |
|---|---|
| Algoritmo | PPO con espacio de acciones `Box(2)` continuo |
| Pasos de entrenamiento | 400.000 |
| Entornos paralelos | 8 |
| Learning rate | 4e-4 |
| Coeficiente de entropia | 0.01 |
| Clip range | 0.2 (±20 %) |
| Tasa de exito en test (50 episodios) | 26,0 % |

## Arquitectura y entrenamiento

La model card describe una politica PPO para control continuo con dos dimensiones de accion: propulsor en el rango 0 a 1 y rotacion en el rango -1 a 1. El entrenamiento se realizo con 8 entornos paralelos durante 400.000 pasos totales, con learning rate 4e-4, coeficiente de entropia 0.01 y clipping de la razon de probabilidad a 0.2. No se documenta el numero de capas, el tamano de las capas ocultas, la funcion de activacion, el tipo de observacion (vectorial, imagen o mixta), la funcion de recompensa ni si se aplico normalizacion de observaciones o recompensas.

Tampoco se especifica el simulador subyacente ni la version del framework de RL (Stable-Baselines3, CleanRL u otro), aunque la etiqueta `pytorch` sugiere un checkpoint en ese formato. No hay informacion sobre curriculum learning, reward shaping, domain randomization ni evaluacion intermedia. La unica metrica reportada es la tasa de aterrizaje del 26,0 % en 50 episodios no vistos, lo que indica una politica funcional pero lejos de la convergencia.

## Capacidades

- Control continuo de dos acciones: intensidad de propulsor (0 a 1) y par de rotacion (-1 a 1).
- Politica entrenada especificamente para la tarea de enderezar y aterrizar un roadster volcado sobre sus ruedas.
- Inferencia ligera en PyTorch, apta para ejecutarse en CPU o GPU de gama baja.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente basado en lenguaje.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo "thinking" ni de mecanismos de deliberacion.

## Casos de uso

- Practica docente de RL: usar el checkpoint como referencia en la leccion 6 del curso "AI CITY BUILDERS" para ilustrar un pipeline PPO completo con espacio de acciones continuo.
- Baseline de comparacion: servir como punto de partida (26,0 % de exito) frente a variantes con mas pasos, mejor reward shaping o mayor numero de entornos.
- Estudio de reward shaping: analizar como cambios en la recompensa (penalizacion por contacto invertido, bonus por orientacion de ruedas) afectan a la tasa de aterrizaje.
- Experimentos de hiperparametros: replicar el setup (8 entornos, lr 4e-4, entropia 0.01, clip 0.2) y variar uno cada vez para medir sensibilidad.
- Simulacion de control en tiempo real: integrar la politica en un bucle de simulacion para probar latencia de inferencia y estabilidad de la accion en un entorno fisico simplificado.
- Docencia de evaluacion estadistica: usar los 50 episodios de test como ejemplo de estimacion de tasa de exito con intervalos de confianza amplios (26 % sobre 50 episodios implica un intervalo aproximado del 14 % al 38 % al 95 %).

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aterrizaje correcto | 26,0 % | 50 episodios de test no vistos |
| Pasos de entrenamiento | 400.000 | 8 entornos paralelos |

No se han publicado resultados de benchmarks comparativos (por ejemplo, retorno medio, longitud de episodio o curvas de aprendizaje) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al no documentarse la topologia de la red ni el tamano del checkpoint, no puede calcularse. Para una politica PPO de control continuo tipica (MLP de pocas capas), el uso seria inferior a 1 GB.
- GPU recomendadas: cualquier GPU consumer reciente es suficiente; incluso CPU es viable para inferencia por episodio.
- Compatibilidad con GPU consumer: previsiblemente si (RTX 3060, RTX 4090, etc.), aunque no confirmado por el autor.
- Opciones de despliegue: inferencia directa con PyTorch; exportacion a ONNX o TorchScript no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints PPO del mismo entorno ni referencias a politicas comparables del curso "AI CITY BUILDERS", por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Tasa de exito baja: 26,0 % en 50 episodios implica que aproximadamente tres de cada cuatro intentos no logran el aterrizaje correcto.
- Repositorio con 0.0 GB: no se confirma que los pesos esten efectivamente publicados; verificar antes de intentar cargar el checkpoint.
- Sin licencia declarada: no hay permiso explicito para uso comercial, redistribucion ni modificacion; el uso queda en un limbo legal.
- Documentacion insuficiente: no se especifican observaciones, recompensa, arquitectura de red ni framework de entrenamiento, lo que dificulta la reproducibilidad.
- Entrenamiento corto: 400.000 pasos con 8 entornos es un presupuesto modesto para control continuo; es probable que la politica no haya convergido.
- Sin informacion sobre sesgos: al no ser un modelo linguistico, no aplican sesgos de texto, pero si puede heredar sesgos del simulador y de la distribucion de condiciones iniciales.
- Riesgo de sobreajuste al entorno de entrenamiento: sin datos de domain randomization, la transferencia a variaciones del simulador es incierta.
- No apto para produccion: pensado como material didactico, no como componente de sistemas reales.

## Enlaces

- Hugging Face: https://huggingface.co/NADANAYO/connectailab-rl-nadanayo-v1-roadster-ppo-custom
