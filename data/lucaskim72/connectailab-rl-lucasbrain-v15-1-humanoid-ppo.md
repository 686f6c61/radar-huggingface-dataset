# lucaskim72/connectailab-rl-lucasbrain-v15.1-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.1-humanoid-ppo` es una política de aprendizaje por refuerzo (no un modelo de lenguaje) entrenada con PPO sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. La desarrolla Lucas Kim en el marco del curso de RL de CONNECT AI LAB × AI CITY BUILDERS, y resuelve el problema de control continuo de un humanoide simulado: dado un vector de 348 observaciones, emite 17 acciones continuas (una por articulación) en el rango `[-0.4, 0.4]`.

El modelo reporta una puntuación media de 6668.0 en un conjunto de evaluación de 10 episodios con semillas 9000-9009, con longitud media de episodio de 1000 pasos y un desplazamiento frontal medio de 23.82. El entrenamiento acumula 5.608.000 pasos totales, con una tasa de aprendizaje de 3e-5, clipping de 0.2, 8 entornos paralelos, gamma 0.99 y lambda 0.95.

Es relevante como ejemplo reproducible de una progresión de experimentos controlados (v1, v7, v13, v14, v15) donde se modifica una variable cada vez, y por incorporar una función de recompensa aumentada con puntuación postural (escala de torso 0.4, brazos 0, pies 0) definida en un script separado del repositorio. No es un modelo de propósito general: es un artefacto de investigación específico de un entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected con dos cabezas (política gaussiana y función de valor), PPO con clipping |
| Parámetros totales | no disponible (capa oculta de 256 unidades, estado 348, acción 17) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; horizonte de episodio de 1000 pasos, gamma 0.99) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch); script auxiliar `added_scores.py` |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimensión de observación | 348 |
| Dimensión de acción | 17 articulaciones, rango -0.4 a 0.4 |
| Capa oculta | 256 |
| Normalización de observaciones | activada |
| Pasos totales de entrenamiento | 5.608.000 |
| Tasa de aprendizaje | 3e-5 |
| Clip PPO | 0.2 |
| Entornos paralelos | 8 |
| Pasos por entorno antes de actualizar | 512 (4096 experiencias por actualización) |
| Épocas por actualización | 10 |
| Gamma / lambda | 0.99 / 0.95 |
| Bonus de exploración | 0.0 |
| Desviación inicial | ~0.14 |

## Arquitectura y entrenamiento

La política es una red neuronal de dos cabezas entrenada con Proximal Policy Optimization. Una cabeza produce la media de una distribución gaussiana sobre las 17 acciones continuas; la otra estima el valor del estado. Las observaciones se normalizan antes de entrar en la red, con una capa oculta de 256 unidades, decisión justificada por el salto de dimensionalidad respecto a experimentos previos sobre `LunarLander` (7 observaciones, 2 acciones, oculta 64).

El entrenamiento sigue un esquema on-policy estricto: 8 entornos en paralelo recogen 512 pasos cada uno (4096 experiencias), se realizan 10 épocas de actualización sobre ese lote y se descarta. El clip de 0.2 limita el cambio de probabilidad por actualización. La progresión documentada es v1 (1M pasos, lr 3e-4) → v7 (lr 1e-4) → v13 (2M pasos) → v14 (4M pasos, mejor checkpoint en 3,7M) → v15 (lr 3e-5 desde el checkpoint de 3,7M), sumando 5,608M pasos totales. La innovación destacable es la recompensa aumentada con puntuación postural, separada del peso de la red y almacenada en `added_scores.py` para que la fórmula sea auditable e independiente de los pesos.

## Capacidades

- Control continuo de un humanoide simulado en `Humanoid-v5`: mantener la verticalidad y desplazarse hacia delante.
- Política determinista en evaluación (se usa la media de la gaussiana, sin ruido) y estocástica en entrenamiento.
- Generalización limitada a las 10 semillas de evaluación reportadas (9000-9009); no hay evidencia publicada de generalización a otras semillas o variaciones del entorno.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No procesa texto, imagen ni audio.
- Compatible con el ecosistema Gymnasium/MuJoCo para rollout e inspección de trayectorias.

## Casos de uso

- **Banco de pruebas docente de PPO**: servir como referencia reproducible en un curso de RL, cargando `model.pt` y comparando curvas de recompensa frente a los checkpoints v1/v7/v13/v14 para ilustrar el efecto de la tasa de aprendizaje y del número de pasos.
- **Inicialización para fine-tuning en variantes de Humanoid**: partir de estos pesos con lr 3e-5 y ajustar recompensas o parámetros físicos del entorno, aprovechando que el checkpoint ya resuelve la locomoción básica.
- **Evaluación de estabilidad de políticas**: usar las 10 semillas documentadas como protocolo de evaluación fijo para medir varianza entre episodios (longitud media 1000.0, avance medio 23.82).
- **Estudio de reward shaping**: emplear `added_scores.py` como plantilla para añadir términos de postura y comparar su impacto frente al reward base del entorno, dado que el autor separa explícitamente ambas componentes.
- **Generación de datos de demostración para imitación**: ejecutar rollouts deterministas para producir trayectorias estado-acción que alimenten un aprendizaje por imitación o un modelo de dinámica.
- **Validación de pipelines de simulación MuJoCo**: usar el modelo como carga de trabajo conocida para verificar versiones de Gymnasium, MuJoCo y controladores de física antes de desplegar experimentos propios.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Puntuación media (holdout, 10 episodios) | 6668.0 |
| Longitud media de episodio | 1000.0 |
| Avance frontal medio | 23.822582953897896 |
| Semillas de evaluación | 9000-9009 |
| Puntuación de un episodio citado en la model card | 6637.4 (semilla 9000, 1000 pasos, avance 23.45) |
| Pasos totales de entrenamiento | 5.608.000 |

No se han publicado comparaciones con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, por debajo de 1 GB; la red es una MLP con capa oculta de 256 y entrada de 348 dimensiones.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo cargando `model.pt`; el cuello de botella real es el simulador MuJoCo, no la red.
- Latencia y throughput: no disponibles en la información proporcionada; dependen casi por completo del paso de simulación de MuJoCo y del número de entornos paralelos.

## Comparativa con modelos similares

| Modelo | Entorno | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v15.1-humanoid-ppo | Humanoid-v5 | no disponible (MLP 256) | no aplica (episodio 1000 pasos) | 6668.0 media en 10 episodios | no disponible | Hugging Face |
| Políticas PPO de referencia de Stable-Baselines3 en Humanoid-v5 | Humanoid-v5 | MLP configurable | no aplica | no disponible | MIT (SB3) | GitHub / PyPI |
| Checkpoints previos del mismo autor (v1, v7, v13, v14) | Humanoid-v5 | misma arquitectura | no aplica | no disponible de forma agregada | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es una política específica de `Humanoid-v5`; no es un modelo de lenguaje ni un modelo de propósito general y no acepta entradas de texto.
- El rendimiento reportado (6668.0) procede de 10 semillas concretas (9000-9009); no hay evidencia de generalización a otras semillas, a perturbaciones físicas o a variantes del entorno.
- La recompensa aumentada con postura usa escalas de torso 0.4, brazos 0 y pies 0; los pesos de la red y estas escalas están acoplados, de modo que cambiar la función de recompensa invalida la política.
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al simulador: la transferencia a un robot físico (el autor menciona el proyecto Tori) no está validada en la información disponible.
- Repositorio de 0.0 GB y sin descargas ni likes en el momento de la consulta; no hay señales de uso independiente ni de revisión por terceros.
- El autor es un creador de contenido individual, no un laboratorio con proceso de revisión; los resultados no están auditados externamente.

## Enlaces

- Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.1-humanoid-ppo
- Script de recompensa aumentada: `added_scores.py` en el mismo repositorio (descargable vía `hf_hub_download`)
- Pesos: `model.pt` en el mismo repositorio
- Contacto del autor: lucaskim72@gmail.com
- Entorno: Gymnasium `Humanoid-v5` (MuJoCo), documentación en https://gymnasium.farama.org/
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
