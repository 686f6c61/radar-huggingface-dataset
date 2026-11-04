# lucaskim72/connectailab-rl-lucasbrain-v1-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v1-humanoid-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que controla un robot humanoide simulado de 17 articulaciones a partir de un vector de observación de 348 dimensiones. Lo publica Lucas Kim (AI Build Master) en el marco del curso de RL de CONNECT AI LAB × AI CITY BUILDERS, y forma parte de una serie de cinco checkpoints (v1, v7, v13, v14, v15) que documentan la progresión del entrenamiento.

El problema que resuelve es el control continuo de un cuerpo humanoide: mantenerse en pie y desplazarse hacia delante sin caer, aplicando fuerzas articulares en el rango [-0.4, 0.4]. La relevancia es fundamentalmente didáctica: el repositorio incluye una explicación detallada del bucle PPO (actor-crítico, ventaja con GAE, recorte de la ratio de política, normalización de observaciones) y una ablación sistemática de hiperparámetros, lo que lo convierte en material de referencia para quien estudia RL aplicado a control continuo.

La arquitectura es una MLP pequeña (capas ocultas de 256 unidades) con dos cabezas, una política gaussiana y una función de valor. El checkpoint publicado corresponde a la configuración base: 1.000.000 de pasos de entorno, learning rate 0,0003 y clip 0,2. Según la model card, el mejor resultado de la serie lo obtiene v15 (learning rate 0,00003), con una media de 747,1 puntos en 10 episodios de validación con semillas 9000-9009.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP actor-crítico para PPO (política gaussiana + cabeza de valor), 2 capas ocultas de 256 unidades, normalización de observaciones activada |
| Parametros totales | no disponible (no se declara el recuento; por la topología 348→256→256→salidas, está en el orden de 10^5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observación es un vector de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (agente de control, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch`, librería declarada); tamaño del repo 0,0 GB |

Otros parámetros de entrenamiento declarados en la model card:

| Parametro | Valor |
|---|---|
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimension de observacion | 348 |
| Dimension de accion | 17 articulaciones, cada una en [-0.4, 0.4] |
| Pasos totales de entrenamiento | 1.000.000 |
| Learning rate | 0,0003 |
| Clip (PPO) | 0,2 |
| Entornos en paralelo | 8 |
| Pasos por entorno antes de actualizar | 512 (4.096 transiciones por actualización) |
| Épocas por actualización | 10 |
| Tamaño de minibatch | 512 |
| Gamma | 0,99 |
| Lambda (GAE) | 0,95 |
| Bonus de exploración | 0,0 |
| Desviación inicial de la política | ~0,14 |
| Semilla de evaluación | 9000-9009 (10 episodios) |
| Resultado declarado | 747,1 puntos de media, longitud media 148,8 pasos, avance medio 0,6109 |

## Arquitectura y entrenamiento

La política es una red neuronal densa que mapea el vector de estado de 348 componentes a una distribución gaussiana sobre las 17 acciones continuas: una cabeza produce la media de la fuerza por articulación y otra la desviación típica (exploración). Una tercera cabeza, la del crítico, estima el valor del estado. El entrenamiento sigue el esquema PPO estándar: se recogen 4.096 transiciones (8 entornos × 512 pasos), se calculan las ventajas con GAE (gamma 0,99, lambda 0,95) y se realizan 10 épocas de descenso de gradiente con minibatches de 512 y recorte de la ratio de probabilidad a ±20 %. La normalización de observaciones se activa porque las 348 dimensiones del estado tienen escalas muy dispares.

La model card documenta una metodología de ablación de un solo factor: se parte de una configuración base (1M de pasos, 8 entornos, clip 0,2, lr 0,0003, ocultas 256, gamma 0,99, normalización on, bonus 0,0) y se varía un hiperparámetro cada vez (clip 0,05/0,50; 4/16 entornos; lr 0,001/0,0001; 500K/2M pasos; ocultas 64; bonus 0,001; gamma 0,95; normalización off). La serie de checkpoints refleja el resultado de esa búsqueda: v7 baja el lr a 0,0001; v13 extiende a 2M de pasos; v14 continúa hasta 4M conservando el mejor peso en 3,7M; y v15 baja el lr a 0,00003 sobre ese peso, obteniendo la mejor media en validación. No se menciona RLHF, DPO ni decodificación especulativa, por tratarse de un agente de control y no de un modelo generativo.

## Capacidades

- Control continuo de un humanoide simulado: emite 17 fuerzas articulares por paso dentro de [-0.4, 0.4].
- Locomoción básica: mantenerse erguido y avanzar hacia delante; el avance medio declarado es de 0,6109 unidades por episodio de validación.
- Política estocástica en entrenamiento (media + desviación) y determinista en evaluación (solo la media, sin ruido).
- Estabilidad a corto plazo: la longitud media de episodio en validación es de 148,8 pasos sobre un máximo de 1.000.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües: no procesa texto.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Docencia de PPO en control continuo: el repositorio sirve como ejemplo ejecutable del bucle actor-crítico con GAE, recorte de ratio y normalización de observaciones, con una explicación en la model card pensada para lectores sin formación previa en RL.
- Estudio de ablaciones de hiperparámetros: la serie v1/v7/v13/v14/v15 permite analizar el efecto aislado del learning rate, del número de pasos y del momento de congelar el mejor checkpoint, replicando la metodología de un factor por experimento.
- Punto de partida para fine-tuning en `Humanoid-v5`: al ser un checkpoint de 1M de pasos con lr 0,0003, es una base razonable para continuar el entrenamiento con otro presupuesto o con variaciones del entorno.
- Referencia de comparación con otros algoritmos: útil para contrastar PPO con SAC o TD3 sobre el mismo entorno y presupuesto de pasos, ya que la configuración está completamente documentada.
- Prototipado de recompensas: el desglose de la función de recompensa (supervivencia +5 por paso, avance ×1,25, coste de potencia cuadrático ×0,1, coste de contacto) permite experimentar con modificaciones de la señal sin partir de cero.
- Demostración educativa de recompensas mal especificadas: con 747 puntos de media y 148 pasos de longitud, el agente ilustra cómo una política puede obtener puntuación principalmente por supervivencia sin lograr una locomoción sostenida, lo que resulta útil para discutir el diseño de funciones de recompensa.
- Integración en un pipeline de vídeo o visualización: el checkpoint puede cargarse para generar repeticiones del humanoide en MuJoCo, como el GIF incluido en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor para este checkpoint (v1, configuración base), sobre 10 episodios de validación con semillas 9000-9009:

| Metrica | Valor |
|---|---|
| Recompensa media (holdout, 10 episodios) | 747,1 |
| Longitud media de episodio | 148,8 pasos |
| Avance medio | 0,6109 |
| Recompensa de un episodio citado en la cabecera | 613,8 puntos, 120 pasos, avance 0,65 |

Progresión de la serie según la model card (sin tabla numérica completa para v7, v13 y v14):

| Checkpoint | Cambio respecto a la base | Resultado |
|---|---|---|
| v1 (este repo) | configuración base, 1M pasos, lr 0,0003 | 747,1 de media |
| v7 | lr 0,0001, 1M pasos | mejor de su comparativa; sirve de base a v13 |
| v13 | mismas condiciones que v7, 2M pasos | la puntuación seguía subiendo al terminar |
| v14 | continuación hasta 4M pasos | mejor peso en 3,7M; empeora al seguir con el mismo lr |
| v15 (best) | lr 0,00003 sobre el peso de 3,7M de v14 | mejor media en 10 episodios nuevos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de RL como normalized score frente a baselines) en la información disponible, más allá de las cifras de recompensa del propio entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. La red es una MLP de dos capas de 256 unidades sobre 348 entradas; los pesos ocupan del orden de cientos de kilobytes.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GTX 1650 ejecutan la política sin cuello de botella.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 1 GB de VRAM; también en CPU sin problema apreciable, dado el reducido coste por paso.
- Opciones de despliegue: PyTorch nativo (carga del `state_dict`), exportación a ONNX o TorchScript para servir la política en un bucle de control, o integración directa en un script de Gymnasium/MuJoCo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante en la práctica será la simulación física de MuJoCo, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto / observación | Resultado declarado | Licencia |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v1-humanoid-ppo | Humanoid-v5 | PPO | no disponible (MLP 348→256→256) | 348 dimensiones de estado, 17 acciones | 747,1 de media en 10 episodios | no disponible |
| connectailab-rl-lucasbrain-v15 (misma serie) | Humanoid-v5 | PPO | misma topología | idem | mejor media de la serie según el autor (cifra no publicada en esta ficha) | no disponible |
| Políticas de referencia de Stable-Baselines3 (PPO Humanoid-v5) | Humanoid-v5 | PPO | MLP de tamaño configurable | idem | no disponible en la información proporcionada | MIT (SB3) |
| Políticas de referencia de CleanRL (PPO continuo) | MuJoCo Humanoid | PPO | MLP de 2×256 típicamente | idem | no disponible en la información proporcionada | MIT (CleanRL) |

No se dispone de cifras de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa directa no es posible.

## Limitaciones y advertencias

- Rendimiento limitado: 747,1 puntos de media y 148,8 pasos de longitud indican que el agente cae pronto en la mayoría de episodios; el máximo del entorno es de 1.000 pasos y la supervivencia sola aportaría unos 5.000 puntos.
- Sesgo hacia la supervivencia estática: el avance medio de 0,61 sugiere que la política prioriza mantenerse en pie sobre desplazarse, un comportamiento esperable dada la ponderación de la recompensa.
- Licencia no especificada: no se declara licencia en el repositorio, lo que impide asumir derechos de uso comercial o de redistribución. Es un riesgo legal relevante para cualquier uso en producción.
- Sin datos de sesgo demográfico ni de alucinación: no aplican en el sentido habitual, al no ser un modelo de lenguaje; el riesgo análogo es el sobreajuste a las condiciones del entorno `Humanoid-v5` y a las semillas de entrenamiento.
- Generalización limitada: la política se ha entrenado exclusivamente en `Humanoid-v5` con la configuración de recompensa por defecto; no se ha evaluado en variantes del entorno, cambios de masa, fricción o perturbaciones externas.
- Reproducibilidad parcial: la model card detalla hiperparámetros y semillas de evaluación, pero no se indica la semilla de entrenamiento ni se publican curvas de aprendizaje completas para todos los checkpoints.
- Tamaño del repositorio de 0,0 GB: conviene verificar que los pesos están efectivamente subidos y son cargables antes de integrarlo en un pipeline.
- Documentación mayoritariamente en coreano: la model card está redactada en coreano, lo que puede dificultar su uso por parte de equipos no familiarizados con el idioma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v1-humanoid-ppo
- Entorno `Humanoid-v5` de Gymnasium: https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Documentación de PPO en Stable-Baselines3 (referencia del algoritmo): https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Implementación de referencia de PPO en CleanRL: https://github.com/vwxyzjn/cleanrl
- Contacto del autor: lucaskim72@gmail.com
