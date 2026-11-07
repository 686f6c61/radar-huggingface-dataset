# Charlottej23/connectailab-rl-charlottej23-v2-humanoid-ppo

## Resumen

`connectailab-rl-charlottej23-v2-humanoid-ppo` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para controlar un robot humanoide tridimensional simulado en MuJoCo a través del entorno `Humanoid-v5` de Gymnasium. Lo desarrolla el usuario Charlottej23 en el marco del curso de IA de refuerzo de CONNECT AI LAB (sexta lección, "AI CITY BUILDERS"). No es un modelo de lenguaje: es una política neuronal que mapea estados continuos del robot a pares de torsión (torques) en sus 17 articulaciones.

El agente recibe un vector de estado de 348 dimensiones (posiciones y velocidades articulares, fuerzas de contacto, fuerzas externas e indicadores de contacto del pie) y emite una acción continua de 17 dimensiones acotada al intervalo `[-0.4, 0.4]` en coma flotante de 32 bits. Según la model card, el entrenamiento se realizó durante 1.000.000 de pasos con 16 entornos paralelos, horizonte de 256, factor de descuento 0,99, GAE lambda 0,95, tasa de aprendizaje 0,0003, recorte de 0,2, coeficiente de entropía 0,002 y una red oculta de 128 unidades, con semilla 0.

Su relevancia es acotada y fundamentalmente educativa: sirve como referencia reproducible de un pipeline PPO completo sobre un benchmark clásico de control continuo (MuJoCo Humanoid), con un resultado declarado de 486,1 puntos de media en 50 episodios no vistos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO (perceptrón multicapa con capa oculta de 128 unidades); no disponible el detalle exacto de capas ni la existencia de una red de valor separada |
| Parámetros totales | no disponible (el repositorio ocupa 0,0 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); estado de entrada de 348 dimensiones por paso |
| Tipos de cuantización | no disponible (pesos en PyTorch, presumiblemente float32) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se especifica si `.pt`, `.pth` o `safetensors` |

## Arquitectura y entrenamiento

El modelo es una política de control continuo entrenada con PPO sobre `Humanoid-v5`, un entorno de MuJoCo que simula un humanoide 3D articulado. El espacio de observación es continuo y de 348 dimensiones (posiciones y velocidades de las articulaciones, inercia, fuerzas externas y señales de contacto). El espacio de acción es `Box(-0.4, 0.4, (17,), float32)`: 17 motores articulares con par acotado. La red utiliza una capa oculta de 128 unidades según los hiperparámetros declarados.

Los hiperparámetros de entrenamiento recogidos en la model card son: algoritmo PPO, 1.000.000 de pasos totales, 16 entornos paralelos, horizonte de 256 pasos, recorte de política (`clip`) de 0,2, `gamma` de 0,99, `gae_lambda` de 0,95, tasa de aprendizaje de 0,0003, `ent_coef` de 0,002 y semilla 0. No se documenta la composición del dataset (en RL no aplica), ni el uso de recompensas moldeadas adicionales, ni procesos de RLHF/DPO. Tampoco se indica si hay normalización de observaciones, recompensas o ventaja, ni el número exacto de épocas por actualización. La model card incluye una curva de entrenamiento (`humanoid_training_curve.png`) y capturas del simulador (`humanoid_snapshots.png`), pero no se aportan los datos subyacentes.

No se describe ninguna innovación técnica destacable más allá del uso estándar de PPO con entornos vectorizados. No hay decodificación especulativa, atención lineal ni componentes SSM o híbridos: es una política MLP clásica para control continuo.

## Capacidades

- Control continuo de un humanoide simulado: genera torques articulares de 17 dimensiones a partir de observaciones de 348 dimensiones.
- Locomoción bípeda en `Humanoid-v5`: la política aprende a mantenerse en pie y desplazarse según la recompensa del entorno.
- Generalización limitada a episodios no vistos: la model card declara una media de 486,1 puntos en 50 episodios de evaluación.
- Inferencia ligera: una red con capa oculta de 128 unidades implica un coste computacional mínimo por paso.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni planificación de agentes basada en lenguaje.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo reproducible de un pipeline PPO completo sobre MuJoCo, útil para explicar espacios de observación y acción continuos, ventaja generalizada y recorte de política en un curso introductorio.
- Investigación en control continuo: puede emplearse como línea base para comparar variantes de PPO, cambios en la función de recompensa o arquitecturas de política en `Humanoid-v5`.
- Pruebas de simulación de robótica: permite experimentar con políticas de locomoción bípeda antes de trasladar ideas a simuladores más realistas o a hardware.
- Evaluación de estabilidad de entrenamiento: al estar documentados los hiperparámetros y la semilla, es útil para reproducir curvas de aprendizaje y estudiar la varianza entre ejecuciones.
- Benchmarking de infraestructura de RL: con 16 entornos paralelos y 1.000.000 de pasos, sirve para medir rendimiento de entornos vectorizados y de herramientas como Stable-Baselines3 o similares.
- Generación de datos sintéticos de locomoción: la política puede generar trayectorias de movimiento para alimentar análisis cinemáticos o entrenar modelos auxiliares en simulación.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Entorno | `Humanoid-v5` (Gymnasium, MuJoCo) |
| Evaluación | Media de 50 episodios no vistos |
| Puntuación media | 486,1 |
| Pasos de entrenamiento | 1.000.000 |
| Entornos paralelos | 16 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La cifra de 486,1 corresponde únicamente a la evaluación interna declarada por el autor y no se acompaña de desviación típica, percentiles ni número de semillas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, por debajo de 1 GB; la red es un MLP con capa oculta de 128 unidades y entrada de 348 dimensiones.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; también es viable en CPU.
- Cabe en cualquier GPU de consumo e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: inferencia directa con PyTorch; integración con Gymnasium y MuJoCo para ejecutar episodios; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al tratarse de un MLP pequeño, se espera una latencia por paso muy baja, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto/estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-charlottej23-v2-humanoid-ppo | Humanoid-v5 | PPO | no disponible | 348 dims | no disponible | Hugging Face (0 descargas) |
| connectailab-rl-decider-v3-teacher | Entorno de decisión tipo JEV | PPO | no disponible | no disponible | Apache-2.0 | Hugging Face |
| connectailab-rl-superwoman-1-v1-link01 | Robótica / toma de decisiones | PPO + LoRA (PEFT) | no disponible | no disponible | Apache-2.0 | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y laboratorio (CONNECT AI LAB) y comparten el uso de PPO, pero atacan tareas distintas: decisión y robótica con componentes LoRA. No se dispone de métricas comparables entre ellos ni de alternativas externas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en un simulador, la política puede explotar particularidades físicas de MuJoCo que no se trasladan al mundo real (sim-to-real gap).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede producir comportamientos no previstos fuera de la distribución de estados de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; su entrada está restringida al vector de 348 dimensiones de `Humanoid-v5` y su acción al rango `[-0.4, 0.4]`.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Caveats para producción: el repositorio está vacío en tamaño (0,0 GB) y sin descargas, lo que sugiere que los pesos podrían no estar subidos o ser de acceso limitado; la evaluación se limita a 50 episodios sin desviación típica ni múltiples semillas; no hay documentación sobre normalización de observaciones, lo que puede impedir reproducir exactamente los resultados.
- Dependencia fuerte del entorno: solo es válido para `Humanoid-v5` con los mismos parámetros de simulación; cambios en la versión de MuJoCo o en la configuración del entorno pueden invalidar la política.

## Enlaces

- Hugging Face: https://huggingface.co/Charlottej23/connectailab-rl-charlottej23-v2-humanoid-ppo
- Modelo relacionado (decider-v3-teacher): https://huggingface.co/Charlottej23/connectailab-rl-decider-v3-teacher/tree/main
- Modelo relacionado (superwoman-1-v1-link01): https://huggingface.co/Charlottej23/connectailab-rl-superwoman-1-v1-link01
- Entorno Gymnasium Humanoid-v5: no disponible en la información proporcionada
- Repositorio o paper de PPO: no disponible en la información proporcionada
