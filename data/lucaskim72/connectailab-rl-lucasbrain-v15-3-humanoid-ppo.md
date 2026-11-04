# lucaskim72/connectailab-rl-lucasbrain-v15.3-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.3-humanoid-ppo` es una política de aprendizaje por refuerzo entrenada con PPO sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje: es una red neuronal pequeña que controla un humanoide simulado de 17 articulaciones a partir de un vector de observación de 348 dimensiones. Lo publica Lucas Kim (lucaskim72) dentro del programa educativo CONNECT AI LAB × AI CITY BUILDERS, como parte de una serie de experimentos (v1, v7, v13, v14, v15) que documentan la progresión del entrenamiento paso a paso.

La relevancia es fundamentalmente didáctica y de reproducibilidad: el autor publica tanto los pesos (`model.pt`) como el script de recompensas adicionales (`added_scores.py`) y describe con detalle la configuración de PPO (clip 0.2, gamma 0.99, lambda 0.95, 8 entornos paralelos, 512 pasos por entorno, learning rate 3e-5 en la versión final). El resultado declarado es una media de 7083.0 puntos en 10 episodios de evaluación con semillas 9000-9009, con una longitud media de episodio de 1000 pasos y un avance medio de 28.77.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0.0 GB y licencia no especificada. La model card está redactada en coreano y no incluye información sobre licencia, idiomas (no aplica en el sentido habitual de LLM) ni resultados de benchmarks frente a otras políticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP con dos cabezas (política y valor), PPO con política gaussiana; normalización de observaciones activada |
| Parámetros totales | no disponible (red con capa oculta de 256 unidades; el número exacto no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de episodio máximo de 1000 pasos |
| Tipos de cuantización | no disponible (pesos en `model.pt`, formato PyTorch nativo) |
| Idiomas soportados | no aplica (modelo de control continuo, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch); script auxiliar `added_scores.py` |

Otros datos declarados en la model card: espacio de observación de 348 dimensiones, espacio de acción de 17 articulaciones con rango [-0.4, 0.4] por articulación, semilla de entrenamiento 9000, 7.615.040 pasos totales de entrenamiento, learning rate 3e-5, clip 0.2, gamma 0.99, lambda 0.95, 8 entornos paralelos, 512 pasos por entorno antes de cada actualización, 10 épocas de reutilización por batch y bonus de exploración 0.0.

## Arquitectura y entrenamiento

La política es una red neuronal feed-forward con una capa oculta de 256 unidades que produce dos cabezas: una media de acción (17 dimensiones) y una estimación de valor de estado. La distribución de acción es gaussiana con desviación típica aprendida, inicializada en torno a 0.14, y las acciones se recortan al rango [-0.4, 0.4]. Las observaciones se normalizan antes de entrar en la red. El algoritmo es PPO con clipping de la ratio de probabilidad a 0.2, GAE con lambda 0.95 y gamma 0.99, y actualizaciones sobre lotes de 4096 transiciones (8 entornos × 512 pasos).

El entrenamiento se realizó en dos fases documentadas: primero 400.000 pasos hasta el checkpoint v14 (learning rate 3e-4 en las primeras versiones, reducido a 1e-4 en v7 y a 3e-5 en v15), y después un ajuste fino desde el mejor checkpoint de v14 (paso 3,7M) con learning rate 3e-5. La innovación técnica destacable no está en la arquitectura, sino en el esquema de recompensa aumentada: además de la recompensa estándar de `Humanoid-v5` (supervivencia +5 por paso, avance × 1.25, coste de fuerzas, coste de contacto), el autor añade términos de postura con multiplicadores 0.4 para el torso, 0.2 para los brazos y 0.25 para los pies, implementados en `added_scores.py`. No se reporta uso de RLHF, DPO ni datos externos: el aprendizaje es puramente por interacción con el simulador.

## Capacidades

- Control continuo de un humanoide simulado de 17 articulaciones en MuJoCo (`Humanoid-v5`).
- Locomoción bípeda: mantenerse en pie y avanzar hacia delante sin caer durante hasta 1000 pasos.
- Política estocástica en entrenamiento (muestreo gaussiano) y determinista en evaluación (media de la distribución).
- Recompensa aumentada configurable mediante `added_scores.py` (postura de torso, brazos y pies).
- Reproducibilidad: semillas de evaluación fijas (9000-9009) y pesos publicados.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües, de visión o de audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo completo y reproducible de un pipeline PPO con recompensa aumentada, útil en cursos o talleres sobre control continuo.
- Estudio de ablaciones: la serie v1/v7/v13/v14/v15 permite analizar el efecto de variar learning rate, número de pasos y bonus de exploración manteniendo el resto de hiperparámetros fijos.
- Baseline para investigación en locomoción: puede utilizarse como punto de partida para comparar nuevos algoritmos (SAC, TD3, Dreamer) sobre `Humanoid-v5` con las mismas semillas de evaluación.
- Ajuste fino con recompensas personalizadas: `added_scores.py` permite modificar los pesos de postura y reentrenar para estudiar cómo cambia la marcha resultante.
- Integración en simulaciones de robótica educativa: cargar `model.pt` en un entorno MuJoCo propio para visualizar o grabar la política andando, por ejemplo en demos de clase.
- Referencia para pipelines de Hugging Face Hub con modelos de RL: el formato de model card bilingüe y la estructura de checkpoints encadenados pueden replicarse en otros proyectos.
- Pruebas de robustez: evaluar la política bajo perturbaciones del entorno o cambios de semilla para medir su generalización dentro del simulador.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Recompensa media (10 episodios, semillas 9000-9009) | 7083.0 |
| Longitud media de episodio | 1000.0 pasos |
| Avance medio | 28.77439812000311 |
| Pasos totales de entrenamiento | 7.615.040 |
| Learning rate final | 3e-5 |

No se han publicado resultados de benchmarks frente a otras políticas en la información disponible. Los valores anteriores son los declarados por el autor en la model card y corresponden a la recompensa del entorno `Humanoid-v5` con los términos de postura añadidos; la recompensa de evaluación reportada como "holdout" es la del entorno, según se indica.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB; la red es un MLP con capa oculta de 256 unidades y 348 entradas, con 17 salidas.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en CPU sin problema apreciable de latencia para un solo agente.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y en placas integradas para inferencia puntual.
- Despliegue: PyTorch nativo (`torch.load` sobre `model.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Para el entorno se requiere MuJoCo y Gymnasium.
- Latencia y throughput: no disponibles en la información proporcionada; para un MLP de este tamaño la inferencia por paso es del orden de microsegundos en GPU y de milisegundos en CPU, aunque el cuello de botella real es la simulación física en MuJoCo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v15.3-humanoid-ppo | PPO, MLP con dos cabezas | Humanoid-v5 | no disponible (oculta 256) | 1000 pasos por episodio | no disponible | Hugging Face Hub |
| Políticas de referencia Stable-Baselines3 (PPO) | PPO, MLP | Humanoid-v5 | configurable (por defecto 64×2) | 1000 pasos por episodio | MIT | GitHub / PyPI |
| CleanRL PPO continuo | PPO, MLP | MuJoCo (varios) | configurable | según entorno | MIT | GitHub |
| Policies de MushroomRL / Tianshou | PPO/SAC/TD3 | MuJoCo | configurable | según entorno | MIT | GitHub / PyPI |

No se dispone de comparaciones numéricas publicadas entre este checkpoint y las implementaciones de referencia; la comparación anterior es estructural y de disponibilidad, no de rendimiento.

## Limitaciones y advertencias

- Especialización total: la política solo funciona en `Humanoid-v5` con la misma parametrización de observación (348 dimensiones) y acción (17 articulaciones, [-0.4, 0.4]); no es transferible a otros entornos ni a un robot real sin trabajo adicional.
- Licencia no especificada: no se puede asumir uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Sin información sobre sesgos en el sentido de modelos lingüísticos, pero la política puede exhibir comportamientos frágiles fuera de la distribución de entrenamiento (perturbaciones, cambios de fricción, masas alteradas).
- La recompensa reportada incluye términos de postura añadidos por el autor; comparaciones directas con la recompensa estándar de `Humanoid-v5` deben hacerse con cuidado y usando `added_scores.py`.
- Riesgo de sobreajuste a las semillas de evaluación: los 7083 puntos son la media sobre 10 semillas fijas (9000-9009); no se reporta varianza ni intervalos de confianza.
- Documentación únicamente en coreano: puede dificultar la replicación a lectores no familiarizados con el idioma.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por terceros.
- No apta para tareas de NLP, visión, agentes conversacionales ni tool calling; cualquier uso en esos ámbitos sería un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.3-humanoid-ppo
- Script de recompensas adicionales: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.3-humanoid-ppo/blob/main/added_scores.py
- Pesos: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.3-humanoid-ppo/blob/main/model.pt
- Entorno `Humanoid-v5` (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Stable-Baselines3 (implementación PPO de referencia): https://github.com/DLR-RM/stable-baselines3
- CleanRL (PPO continuo de referencia): https://github.com/vwxyzjn/cleanrl
- Contacto del autor: lucaskim72@gmail.com
