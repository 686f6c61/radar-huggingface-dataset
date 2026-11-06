# casareborgia/connectailab-rl-leeseungjun-ver1-humanoid-ppo

## Resumen

`connectailab-rl-leeseungjun-ver1-humanoid-ppo` es un checkpoint de política de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `Humanoid-v5` de MuJoCo. Lo publica el usuario `casareborgia` bajo el paraguas de Connect AI Lab, como extensión de una lección introductoria de RL (la sexta del curso, centrada en un "roadster invertido" con aterrizaje PPO) aplicada ahora a un problema de control continuo de mayor dimensionalidad: un humanoide con 348 dimensiones de estado y 17 motores articulares.

No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política neuronal que mapea observaciones del entorno a acciones continuas de torque, pensada para ser cargada en un bucle de simulación Gymnasium/MuJoCo. Su relevancia es, por tanto, didáctica y experimental: documenta de forma explícita la comparación entre una configuración PPO "base" y una configuración "tunada" con hiperparámetros ajustados, incluyendo métricas de episodio (pasos de supervivencia, recompensa acumulada, distancia recorrida).

El repositorio es de tamaño 0.0 GB según Hugging Face, con 0 descargas y 0 likes en el momento de la consulta, y sin licencia ni idiomas declarados. La model card está redactada en coreano y describe únicamente el proceso de entrenamiento y las métricas reportadas por el autor; no incluye información sobre composición del dataset (en RL no aplica en el sentido habitual), ni sobre evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP con capa oculta de 384 unidades) para PPO en control continuo; se infiere del código de carga (`정책두뇌튜닝(348, 17, 은닉=384, ...)`) |
| Parámetros totales | no disponible (no se declara el recuento; con entrada 348, oculta 384 y salida 17 más cabeza de valor, el orden de magnitud es de cientos de miles, pero no se confirma) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la "entrada" es un vector de estado de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (checkpoint `model.pt` en PyTorch, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch, `torch.save` con claves `model`, `obs_mean`, `obs_var`, `obs_count`) |

## Arquitectura y entrenamiento

La política es una red neuronal fully-connected cuya capa oculta se amplió de 256 a 384 unidades respecto a la configuración base, para acomodar la coordinación entre las 348 dimensiones de observación del entorno `Humanoid-v5` y las 17 salidas de torque. La distribución de acción es gaussiana con desviación típica aprendida: el parámetro `init log std` se ajustó de -0.5 (σ ≈ 0.61) a -1.2 (σ ≈ 0.30) para adaptar la exploración al rango de torque `[-0.4, +0.4]`. El checkpoint incluye además estadísticas de normalización de observaciones (`obs_mean`, `obs_var`, `obs_count`), lo que implica que la política espera entradas normalizadas con esas mismas estadísticas en inferencia.

El entrenamiento se realizó con PPO sobre MuJoCo `Humanoid-v5`, con los siguientes cambios respecto a la configuración base: `n_envs × n_steps` de 16×256 (4.096 transiciones por actualización) a 32×256 (8.192); mini-batch de 512 a 1.024; γ de 0.99 a 0.995 y λ de 0.95 a 0.97 (mayor peso del retorno a largo plazo, coherente con la tarea de marcha sostenida); y clip ε de 0.2 a 0.15 para evitar colapsos de la política multiarticular en cada actualización. El autor reporta 1,2 millones de pasos de entrenamiento en la versión tunada frente a 1 millón en la base. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control continuo de un humanoide simulado en MuJoCo `Humanoid-v5`: genera 17 torques articulares a partir de un vector de estado de 348 dimensiones.
- Locomoción bípeda aprendida: el autor reporta hasta 500 pasos de supervivencia (episodio completo) y +5,27 m de desplazamiento en la configuración tunada.
- Normalización de observaciones integrada en el checkpoint (media, varianza y contador), lo que facilita la reproducibilidad de la inferencia.
- Política estocástica gaussiana con desviación típica aprendida; puede usarse en modo determinista tomando la media de la distribución.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües: es una política de RL específica de tarea.
- No incluye "thinking mode" ni mecanismos de cadena de pensamiento.

## Casos de uso

- Reproducción didáctica de un curso de RL: el checkpoint sirve para ilustrar en clase la diferencia entre una configuración PPO base y una tunada, cargando `model.pt` y comparando curvas de recompensa en `Humanoid-v5`.
- Baseline para experimentos de ajuste de hiperparámetros: el par (base, tunado) documentado por el autor permite aislar el efecto de γ, λ, ε, tamaño de capa oculta y batch sobre la estabilidad del entrenamiento.
- Punto de partida para fine-tuning con PPO en variantes de `Humanoid` (cambios de recompensa, perturbaciones, terreno): al ser un checkpoint pequeño, el coste de reentrenamiento es bajo en comparación con políticas de mayor tamaño.
- Evaluación de robustez de políticas de locomoción: útil para probar sensibilidad a ruido en observaciones o a cambios en el rango de torque, dado que el autor ya documenta una comparación cuantitativa de distancia y supervivencia.
- Docencia de normalización de observaciones en RL: el checkpoint incluye `obs_mean`, `obs_var` y `obs_count`, lo que permite explicar por qué la normalización afecta a la estabilidad de la política.
- Integración en pipelines de simulación Gymnasium/MuJoCo para pruebas de reproducibilidad: cargar la política y ejecutar episodios con semillas fijas para verificar que se alcanzan los valores reportados (hasta 500 pasos, ~2.792,5 puntos en el mejor episodio, 2.012,1 de media en 10 episodios).

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, medidos sobre `Humanoid-v5` con su propia configuración de evaluación (no se especifica el número de semillas ni el protocolo exacto más allá de "10 partidas" para la media):

| Configuración | Pasos de supervivencia | Recompensa acumulada | Distancia recorrida | Notas |
|---|---|---|---|---|
| Inicial aleatoria | 19 | 87,2 | -0,07 m | Cae inmediatamente |
| PPO base (1 M pasos) | 288 | 1.699,4 | +4,85 m | Oculta 256, init log std -0.5 |
| PPO tunado (1,2 M pasos) | 500 (episodio completo) | 2.792,5 (mejor); 2.012,1 (media de 10) | +5,27 m | Oculta 384, init log std -1.2, γ=0.995, ε=0.15 |

No se han publicado resultados de benchmarks estándar (MLU, HumanEval, GSM8K, etc.) en la información disponible, y no aplican a este tipo de modelo. Tampoco se comparan con políticas de referencia publicadas para `Humanoid-v5` (por ejemplo, resultados de Stable-Baselines3 o de la literatura de RL), por lo que no es posible situar el rendimiento en el estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint es un MLP de entrada 348, oculta 384 y salida 17 (más cabeza de valor), por lo que cabe holgadamente en cualquier GPU consumer con varios GB libres. No se dispone de una cifra exacta porque el autor no declara el recuento de parámetros.
- GPU recomendadas: cualquiera con soporte CUDA y PyTorch (RTX 3060, RTX 4090, A100, H100). Para inferencia pura, CPU es suficiente.
- Cabe en GPU consumer: sí, con cualquier modelo con al menos unos pocos GB de VRAM; también en CPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `load_state_dict`), con dependencia de `gymnasium` y `mujoco` para el bucle de simulación. No se publican exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. En la práctica, el cuello de botella será el paso de simulación de MuJoCo, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `casareborgia/connectailab-rl-leeseungjun-ver1-humanoid-ppo` | Política PPO (MLP) | MuJoCo `Humanoid-v5` | no disponible (oculta 384) | no aplica | no disponible | Hugging Face, 0 descargas |
| Políticas PPO de Stable-Baselines3 para `Humanoid-v5` | Política PPO (MLP) | MuJoCo `Humanoid-v5` | configurables (por defecto 64×64) | no aplica | MIT | `stable-baselines3` (PyPI/GitHub) |
| Políticas de la literatura RL (p. ej. SAC, TD3, AMP) para humanoides | Política continua | MuJoCo `Humanoid` | variables | no aplica | variables según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas; la comparativa anterior es estructural y de disponibilidad, no de rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para generación de texto, código o razonamiento.
- La licencia no está declarada, lo que impide asumir permisos de uso comercial o de redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- El rendimiento reportado procede del propio autor y de un protocolo de evaluación no detallado (no se especifican semillas, número de episodios por configuración más allá de la media de 10, ni versión exacta de MuJoCo/Gymnasium), por lo que la reproducibilidad no está garantizada.
- El checkpoint depende de un módulo externo (`train_humanoid_tuned`) con clases `정책두뇌튜닝` y `상태정규화` que no se incluye en el repositorio (tamaño 0.0 GB), lo que puede impedir la carga directa sin el código fuente del autor.
- La política está especializada en `Humanoid-v5` con el rango de torque `[-0.4, +0.4]`; cambiar el entorno, la recompensa o los límites de actuación invalidará el comportamiento aprendido.
- Riesgo de sobreajuste a la configuración de evaluación del autor: la diferencia entre el mejor episodio (2.792,5) y la media de 10 (2.012,1) sugiere alta varianza entre episodios.
- No hay información sobre sesgos (no aplica en el sentido de sesgos sociales) ni sobre alucinación (no aplica); el riesgo relevante es el colapso de la política fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad; trátese como material didáctico, no como referencia de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casareborgia/connectailab-rl-leeseungjun-ver1-humanoid-ppo
- MuJoCo (entorno `Humanoid-v5`): https://mujoco.org/
- Gymnasium (interfaz de entornos): https://gymnasium.farama.org/
- Documentación de PPO en Stable-Baselines3 (referencia del algoritmo): https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios del autor ni demos adicionales.
