# Gaurav12456/ppo-LunarLander-v2

## Resumen

Modelo de aprendizaje por refuerzo que resuelve el entorno LunarLander-v3 de Gymnasium mediante el algoritmo PPO (Proximal Policy Optimization). Desarrollado por Gaurav12456 con la librería stable-baselines3, el agente aprende a controlar una nave lunar para aterrizar de forma segura en una plataforma, maximizando la recompensa acumulada.

La arquitectura es un actor-crítico basado en redes neuronales MLP, la configuración típica de PPO en stable-baselines3. Alcanza una recompensa media de 248,46 ± 17,92 en el entorno, superando el umbral de 200 puntos que se considera la resolución del problema. Es un modelo de ejemplo (repositorio de 0,0 GB) pensado para fines didácticos y de investigación en aprendizaje por refuerzo.

Conviene señalar que el modelo se publica bajo el nombre "ppo-LunarLander-v2" pero la model card declara el entorno LunarLander-v3 en los tags y en los benchmarks, una discrepancia que debe tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico MLP (PPO) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de control) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | Archivo ZIP (stable-baselines3) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo PPO (Proximal Policy Optimization) implementado en stable-baselines3, que entrena simultáneamente una política (actor) y una función de valor (crítico) mediante recorte de la razón de objetivo para estabilizar las actualizaciones. La red neuronal es un perceptrón multicapa (MLP) de tamaño no especificado en la model card; la configuración por defecto de stable-baselines3 usa dos capas ocultas de 64 neuronas.

El entorno LunarLander-v3 es una variante del clásico LunarLander de Box2D, donde el ag
