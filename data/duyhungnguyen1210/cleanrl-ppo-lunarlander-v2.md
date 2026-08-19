# duyhungnguyen1210/cleanrl-ppo-LunarLander-v2

## Resumen

Este modelo es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno LunarLander-v2 de Gymnasium. Fue desarrollado por duyhungnguyen1210 como parte del Deep RL Course de Hugging Face, utilizando la implementación de referencia CleanRL. El agente aprende a controlar una nave para aterrizar de forma segura en la superficie lunar, recibiendo recompensas positivas por aterrizajes correctos y negativas por choques o consumo de combustible.

El modelo se publica como un ejemplo didáctico de entrenamiento de agentes con PPO, con un rendimiento declarado de recompensa media de -161.79 ± 79.73, lo que indica que el agente no ha convergido a una política óptima (el entorno ofrece recompensas de hasta 200). A pesar de su bajo rendimiento, resulta útil como referencia para estudiar el comportamiento de PPO en entornos de control continuo y para comparar hiperparámetros. No se especifican detalles de arquitectura, licencia ni idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MLP, no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, sin contexto de texto) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante, sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo PPO, un método de optimizacion de politica proximal que alterna entre la recoleccion de experiencias y la actualizacion de la politica mediante una funcion de perdida recortada. La implementacion utiliza CleanRL, una biblioteca que proporciona codigo de una sola archivo, limpio y reproducible, disenada para investigacion. El entorno LunarLander-v2 es un problema clasico de control con observaciones continuas (posicion, velocidad, angulo, contacto con el suelo) y un espacio de acciones discreto de 4 opciones (no hacer nada, empujar hacia la izquierda, hacia la derecha o hacia abajo).

No se proporcionan detalles sobre la arquitectura de la red neuronal (numero de capas, neuronas, funciones de activacion), el numero de timesteps de entrenamiento, ni la configuracion exacta de hiperparametros mas alla de la mencion generica en la model card. Tampoco se indica si se utilizaron tecnicas como normalizacion de observaciones o recompensas, ni el uso de entornos vectorizados. El entrenamiento probablemente se realizo en un entorno de un solo agente, sin paralelizacion, dado el contexto del curso.

## Capacidades

- Control de aterrizaje en LunarLander-v2: el agente recibe observaciones del estado de la nave y emite acciones discretas para maniobrar.
- Aprendizaje por refuerzo con PPO: demuestra la aplicacion de un algoritmo de politica proximal en un entorno de control continuo.
- Reproducibilidad: al usar CleanRL, el codigo de entrenamiento es de una sola archivo y facil de ejecutar, lo que permite replicar experimentos.
- No tiene capacidades de generacion de texto, vision, tool calling ni razonamiento multimodal.

## Casos de uso

- Educacion en aprendizaje por refuerzo: sirve como ejemplo practico para estudiantes que quieran ver un agente PPO entrenado en un entorno clasico, aunque con rendimiento suboptimo.
- Comparacion de hiperparametros: al ser un modelo de referencia, permite estudiar como diferentes configuraciones de PPO afectan a la convergencia en LunarLander-v2.
- Depuracion de implementaciones: los desarrolladores pueden usar este modelo como punto de partida para verificar que su propio codigo de entrenamiento produce resultados similares.
- Investigacion en RL: puede utilizarse como baseline en experimentos que exploren variantes de PPO o tecnicas de regularizacion.
- Demostracion de integracion con Hugging Face Hub: muestra como subir y compartir modelos de RL con metadatos y metricas, util para quienes quieran publicar sus propios agentes.
- Analisis de fallos: dado su bajo rendimiento, es util para estudiar por que un agente no aprende correctamente y que ajustes serian necesarios.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado para el entorno LunarLander-v2:

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| PPO | LunarLander-v2 | mean_reward | -161.79 ± 79.73 |

Este valor es significativamente inferior a la recompensa maxima posible (200) y a los resultados tipicos de agentes bien entrenados (que suelen superar 200). No se proporcionan comparaciones con otros modelos en la informacion disponible. El resultado no esta verificado de forma independiente.

## Requisitos de hardware

- Al ser un modelo de RL con una red neuronal pequena (no se especifica el tamano, pero tipicamente en CleanRL para LunarLander se usan MLP de 2 capas con 64 o 128 unidades), la inferencia es muy ligera.
- Puede ejecutarse en CPU sin problemas; una GPU no es necesaria para evaluar el agente.
- El entrenamiento, aunque no se documenta, probablemente requirio menos de 1 hora en una CPU moderna o unos minutos en una GPU basica.
- Para despliegue, no se requieren frameworks especiales; basta con cargar los pesos en PyTorch y ejecutar el entorno Gymnasium.
- No se dispone de datos de latencia o throughput, pero al ser un entorno de paso a paso, la latencia es despreciable.

## Comparativa con modelos similares

Existen otros modelos de PPO para LunarLander-v2 publicados en Hugging Face, como `dussinus/ppo-cleanrl-Lunar` o `DoctorPingu/ppo-LunarLander-v2-cleanrl`, pero no se dispone de sus metricas ni especificaciones en la informacion proporcionada. Por tanto, no es posible realizar una comparacion cuantitativa. En general, los agentes bien entrenados en este entorno alcanzan recompensas medias superiores a 200, mientras que este modelo se queda en -161.79, lo que sugiere un entrenamiento incompleto o con hiperparametros inadecuados.

## Limitaciones y advertencias

- Rendimiento muy bajo: la recompensa media negativa indica que el agente no ha aprendido una politica util; no debe usarse en aplicaciones reales.
- Sin informacion sobre la arquitectura ni los hiperparametros exactos, lo que dificulta la reproducibilidad.
- Licencia no especificada: no se puede determinar si es de uso libre o restringido.
- No hay garantias de que el modelo funcione en otras versiones del entorno o con diferentes semillas.
- Al ser un modelo de demostracion, no se ha sometido a pruebas de robustez ni a evaluaciones exhaustivas.
- No se proporcionan pesos en formatos alternativos (GGUF, ONNX, etc.), solo el formato original de PyTorch (presumiblemente).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duyhungnguyen1210/cleanrl-ppo-LunarLander-v2
- Repositorio CleanRL: https://github.com/vwxyzjn/cleanrl
- Notebook del Deep RL Course (unidad 8): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/main/notebooks/unit8/unit8_part1.ipynb
- Modelo similar de referencia: https://huggingface.co/dussinus/ppo-cleanrl-Lunar
- Otro modelo similar: https://huggingface.co/DoctorPingu/ppo-LunarLander-v2-cleanrl
