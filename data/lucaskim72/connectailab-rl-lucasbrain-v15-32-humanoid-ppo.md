# lucaskim72/connectailab-rl-lucasbrain-v15.32-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.32-humanoid-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje: es una red neuronal que mapea observaciones del simulador a acciones articulares de un humanoide simulado de 21 actuadores, y que se distribuye como pesos de PyTorch (`model.pt`) junto con un módulo Python (`added_scores.py`) que define la función de recompensa extendida.

El autor, `lucaskim72`, lo presenta como el resultado de una serie de iteraciones (v1, v7, v13, v14, v15 y refinamientos v15.1 a v15.32) dentro de un curso de refuerzo de CONNECT AI LAB × AI CITY BUILDERS. La innovación principal respecto al `Humanoid-v5` estándar es la incorporación de recompensas de postura (torso, cintura, pecho, brazos, pies, equilibrio, rodillas, centro de masa, elevación, sobreflexión, pie alto, inclinación, etc.) sumadas a la recompensa nativa del entorno, con el objetivo de obtener una marcha más estable y erguida además de rápida.

El modelo es relevante como referencia reproducible de PPO en control continuo de alta dimensión y como ejemplo de ingeniería de recompensas por etapas (curriculum de shaping). Su utilidad práctica es acotada: sirve para investigación en RL, benchmarking de algoritmos y demostraciones en simulación, no para despliegue en robótica real sin transferencia adicional. El repositorio es de 0.0 GB según los metadatos, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor) para control continuo, entrenada con PPO; topología exacta no disponible |
| Parametros totales | no disponible (los pesos están en `model.pt`; el número no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación por paso del entorno `Humanoid-v5`) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precisión original; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `added_scores.py` con la definición de recompensas |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Espacio de acciones | Continuo, 21 actuadores (humanoides MuJoCo estándar) |
| Horizonte de episodio | 1000 pasos |
| Algoritmo | PPO con tasa de aprendizaje variable entre iteraciones (3e-4, 1e-4, 3e-5) |
| Semilla declarada | 9000 (episodio de evaluación: 9118.6 puntos, avance 54.54) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, unidades ocultas, si hay compartición de tronco entre actor y crítico, ni el tamaño del buffer). Se sabe que es una política PPO para espacio de acciones continuo sobre `Humanoid-v5`, con observaciones propioceptivas del simulador y recompensa compuesta. El entrenamiento se organizó en fases: v1 como línea base con 1M de pasos y lr 3e-4; v7 con lr 1e-4 (mejor resultado de esa comparación); v13 con 2M de pasos; v14 extendiendo a 4M con el mejor checkpoint en 3.7M; y v15 con lr 3e-5 partiendo de ese checkpoint, que es el que reporta mejor media en 10 episodios no vistos.

Sobre esa base v15 se aplicó un *curriculum* de recompensas de postura, añadiendo un término cada vez (v15.1 a v15.32). Los multiplicadores declarados en la versión final son: torso 0, cintura 0.4, pecho 0.4, equilibrio 0, rodillas 1, centro 1, elevación 0.5, sobreflexión 0.25, pie alto 0.25, inclinación 1, agachado 0.5, plegado 0.5, brazos 0.2, pies 0.25. La recompensa nativa de `Humanoid-v5` combina supervivencia (+5 por paso), velocidad de avance (velocidad × 1.25) y penalización por esfuerzo de control. El episodio termina si la altura del torso sale del rango 1.0–2.0. La tabla de la model card documenta la evolución del retorno de entorno desde 6668.0 (v15.1) hasta 8811.1 (v15.25) y el salto final a 9118.6 en la versión publicada (v15.32), con avance de 54.54 en 1000 pasos.

## Capacidades

- Control continuo de un humanoide simulado de 21 articulaciones en `Humanoid-v5`.
- Locomoción bípeda hacia delante con velocidad de avance declarada de 54.54 unidades en 1000 pasos en el episodio de evaluación (semilla 9000).
- Mantenimiento de postura erguida mediante recompensas de cintura, pecho y centro de masa.
- Control de equilibrio y zancada mediante términos de pie, pie alto, sobreflexión y plegado.
- Estabilidad de rodillas y centro de masa gracias a multiplicadores de recompensa específicos.
- No soporta *tool calling*, agentes multi-paso, razonamiento simbólico, visión, audio ni generación de texto: es una política de RL pura.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.

## Casos de uso

- **Benchmark de algoritmos de RL en control continuo**: usar la política y la función de recompensa como referencia para comparar PPO frente a SAC, TD3 o Dreamer en `Humanoid-v5`, con la ventaja de que la receta de *reward shaping* está publicada y es reproducible.
- **Investigación en ingeniería de recompensas**: el repositorio documenta 32 variantes con los multiplicadores aplicados y el retorno obtenido en cada una, lo que permite estudiar el efecto de cada término de postura de forma aislada.
- **Currículum de aprendizaje por etapas**: reutilizar el esquema v1 → v7 → v13 → v14 → v15 (ajuste de lr y extensión de pasos) como plantilla para entrenar otras políticas en MuJoCo con presupuesto de cómputo limitado.
- **Docencia y demostraciones de RL**: el GIF de reproducción y las gráficas de entrenamiento sirven como material didáctico para explicar PPO, *reward shaping* y evaluación con semillas no vistas.
- **Punto de partida para *fine-tuning* en variantes del entorno**: la política v15.32 puede servir como inicialización para tareas derivadas (terrenos irregulares, perturbaciones, carga adicional) en lugar de entrenar desde cero.
- **Pruebas de estabilidad y robustez**: evaluar la política bajo perturbaciones externas, cambios de fricción o ruido en observaciones para medir su margen de estabilidad antes de plantear transferencia a hardware.
- **Generación de datos sintéticos de locomoción**: ejecutar la política en el simulador para producir trayectorias de referencia que alimenten aprendices por imitación o controladores basados en modelos.

## Benchmarks y rendimiento

Los únicos datos publicados son los retornos de entorno del propio autor sobre `Humanoid-v5`, sin comparación con otros modelos en la información disponible. Se reproducen a continuación los valores documentados en la model card.

| Versión | Retorno de entorno | Avance | Cambio principal |
|---|---|---|---|
| v15.1 | 6668.0 | 23.82 | Torso |
| v15.4 | 7507.9 | 33.99 | Cintura y pecho |
| v15.6 | 7921.6 | 39.03 | Equilibrio de pies |
| v15.12 | 7864.5 | 38.31 | Sobreflexión |
| v15.18 | 8452.9 | 46.04 | Centro de masa |
| v15.21 | 8637.8 | 48.39 | Inclinación |
| v15.25 | 8811.1 | 50.61 | Agachado |
| v15.32 (publicada) | 9118.6 | 54.54 | Configuración final |

No se han publicado resultados de benchmarks estándar (por ejemplo, medias sobre 100 episodios con semillas fijas, comparación con implementaciones de referencia de Stable-Baselines3 o CleanRL) en la información disponible. El valor 9118.6 corresponde a un único episodio de evaluación con semilla 9000, no a una media poblacional.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; para una política MLP de control continuo en `Humanoid-v5` (observación de ~348 dimensiones, acción de 21) el modelo es del orden de megabytes, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o incluso en CPU.
- **GPU recomendadas para entrenamiento**: no especificadas por el autor. Para reproducir el entrenamiento completo (hasta 4M de pasos en MuJoCo) una RTX 3060/4070 o superior es suficiente; el cuello de botella suele ser la simulación en CPU, no la GPU.
- **GPU para inferencia**: cualquier GPU consumer (GTX 1650, RTX 3050 en adelante) o CPU moderna. No requiere A100/H100.
- **Opciones de despliegue**: PyTorch nativo (`torch.load`), exportación a TorchScript u ONNX para inferencia embebida, o integración en bucles de Gymnasium con `stable-baselines3` para recargar la política. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. En la práctica, la latencia vendrá dominada por el paso de MuJoCo (típicamente sub-milisegundo a pocos milisegundos por paso en CPU), no por la red.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lucaskim72/connectailab-rl-lucasbrain-v15.32-humanoid-ppo` | PPO, control continuo | `Humanoid-v5` | no disponible | no aplica | no disponible | Hugging Face, repo de 0.0 GB |
| Política PPO de referencia de Stable-Baselines3 | PPO, control continuo | `Humanoid-v5` | MLP estándar (no declarado) | no aplica | MIT (SB3) | Código y pesos de ejemplo en la documentación de SB3 |
| CleanRL PPO `ppo_continuous_action.py` | PPO, control continuo | `Humanoid-v5` | MLP configurable | no aplica | MIT (CleanRL) | Repositorio público con scripts |
| Implementaciones de SAC/TD3 para `Humanoid-v5` | Off-policy, control continuo | `Humanoid-v5` | MLP configurable | no aplica | variable según repo | Repositorios de investigación |

La comparación con estas alternativas es cualitativa: no hay datos de retorno publicados de forma homogénea en la información disponible para establecer una comparación numérica justa. La ventaja de este repositorio es la documentación explícita del *reward shaping* por etapas; la desventaja es la ausencia de licencia y de evaluación estadística sobre múltiples semillas.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede asumir uso comercial permitido. Antes de cualquier uso en producción o redistribución hay que contactar con el autor.
- **Evaluación con una sola semilla**: el retorno de 9118.6 corresponde a un episodio con semilla 9000. No se publica media ni desviación sobre múltiples episodios, por lo que la robustez real es desconocida.
- **Sobreajuste al *reward shaping***: los multiplicadores de postura están ajustados manualmente y pueden producir comportamientos que maximizan la recompensa sin corresponder a una marcha natural o transferible.
- **Solo simulación**: no hay evidencia de transferencia *sim-to-real*. El modelo no incluye dinámica de actuadores reales, latencias, fricción variable ni ruido sensorial.
- **Alcance limitado al entorno**: la política está entrenada para `Humanoid-v5` con observaciones y acciones concretas; no generaliza a otros entornos ni a variantes con observaciones distintas sin reentrenamiento.
- **Sin datos de arquitectura**: al no documentarse la topología de la red, la reproducibilidad exacta del entrenamiento no está garantizada.
- **Repositorio de 0.0 GB**: conviene verificar que `model.pt` y `added_scores.py` estén efectivamente subidos y sean descargables; los metadatos indican tamaño nulo.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de lenguaje.
- **Sesgos**: no aplica en el sentido de sesgos sociales; el principal sesgo es el inducido por la función de recompensa diseñada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.32-humanoid-ppo
- Entorno `Humanoid-v5` (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- PPO (paper original de Schulman et al.): https://arxiv.org/abs/1707.06347
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- CleanRL: https://github.com/vwxyzjn/cleanrl
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales del autor.
