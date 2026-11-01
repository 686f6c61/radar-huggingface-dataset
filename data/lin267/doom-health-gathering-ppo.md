# lin267/doom-health-gathering-ppo

## Resumen

`doom-health-gathering-ppo` es un agente de aprendizaje por refuerzo desarrollado por el usuario lin267 que implementa PPO (Proximal Policy Optimization) desde cero en PyTorch para el escenario **Health Gathering Supreme** de ViZDoom. El modelo resuelve el problema de control visual en un entorno 3D: el agente debe moverse por un mapa inundado de ácido y recoger botiquines para sobrevivir el mayor tiempo posible. Es un proyecto educativo vinculado al curso Deep RL de Hugging Face, y destaca por su documentación inusualmente honesta: el autor reporta que el entrenamiento **no funcionó** y analiza las causas con rigor.

La arquitectura es una red convolucional pequeña (aprox. 1,29 M de parámetros) con cabezas separadas de actor y crítico, que procesa observaciones de imagen de 3×72×128 píxeles y emite 3 acciones discretas (girar izquierda, girar derecha, avanzar). El entrenamiento se realizó íntegramente en CPU con 10 procesos de Doom en paralelo, alcanzando 189 pasos/segundo, y se limitó a 500 000 pasos de entorno, la octava parte de la configuración del curso.

El interés de este repositorio no radica en su rendimiento —el agente obtiene 319,2 puntos de media frente a 336,8 de una política aleatoria— sino en su valor como caso de estudio de fallo reproducible: identifica cuatro causas concretas (recompensa independiente de la acción, ventaja degenerada, ausencia del estado de salud en la observación y presupuesto de muestras insuficiente) y documenta verificaciones que descartan errores de implementación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + actor-crítico (PPO), 3 capas convolucionales + 2 cabezas lineales |
| Parametros totales | Aproximadamente 1,29 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; cada decisión usa un frame de 3×72×128) |
| Tipos de cuantizacion | No disponible (pesos en FP32, sin versiones cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`model_final.pth` y checkpoints de evaluación) |

## Arquitectura y entrenamiento

La red sigue la estructura del material del curso: `Conv2d(3→32, 8×8, stride=4)` → `Conv2d(32→64, 4×4, stride=2)` → `Conv2d(64→128, 3×3, stride=2)` → `Flatten(2304)` → `Linear(512)` como representación compartida, de la que parten una cabeza lineal de 3 logits para la política y una cabeza lineal de 1 salida para el valor de estado. El algoritmo es PPO estándar con estimación de ventaja GAE (lambda 0,95), recorte de política (epsilon 0,2), recorte de valor, bonus de entropía (coeficiente 0,01), normalización de ventajas, recorte de gradiente por norma y decaimiento lineal del learning rate desde 1e-4 hasta 0.

El entrenamiento se ejecutó sobre 500 000 pasos de entorno (390 iteraciones de 10 entornos × 128 pasos), con `frame_skip=4`, observaciones redimensionadas a 256×144 y promediadas 2×2 hasta 72×128 en uint8. No hubo RLHF ni DPO (no aplica a RL clásico). La innovación técnica destacable es de ingeniería más que algorítmica: un wrapper ligero sobre `DoomGame` con backend multiproceso (`SubprocDoomVec`) que multiplicó el throughput por 5,2 (de 34 a 189 pasos/s) y una solución para rutas con caracteres no ASCII en Windows. El autor también implementó una opción `--separate-encoder` para desacoplar los codificadores de política y valor.

## Capacidades

- Control visual discreto en entornos 3D de ViZDoom: selección entre 3 acciones (izquierda, derecha, avanzar) a partir de píxeles RGB.
- Procesamiento de observaciones de imagen de baja resolución (3×72×128) con una CNN entrenada desde cero.
- Política determinista (argmax) y estocástica (muestreo de la distribución categórica) disponibles en inferencia.
- Entrenamiento y evaluación reproducibles en CPU sin GPU, con scripts de diagnóstico de observaciones y de entorno.
- Grabación de vídeos de episodios y generación de curvas de aprendizaje y pérdidas.
- Verificación de la lógica PPO mediante tareas sintéticas de control (no es una capacidad del modelo desplegado, sino del código que lo acompaña).
- **No** soporta tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general ni capacidades multilingües. Es un agente específico de un único escenario.

## Casos de uso

- **Material docente para cursos de deep RL**: sirve como ejemplo completo y reproducible de un pipeline PPO desde cero (entorno, recolección paralela, GAE, actualización recortada, evaluación y logging) que los estudiantes pueden ejecutar en CPU en aproximadamente una hora.
- **Estudio de fallo y diagnóstico de señales de recompensa**: el análisis del autor sobre por qué la recompensa de supervivencia no correlaciona con la acción es un caso práctico para enseñar diseño de funciones de recompensa y credit assignment.
- **Referencia de ingeniería para entornos ViZDoom**: el wrapper `doom_env.py` y el backend `SubprocDoomVec` pueden reutilizarse como base para experimentos con otros escenarios de ViZDoom (Deathmatch, Defend the Line, etc.).
- **Prueba de infraestructura de entrenamiento en CPU**: útil para validar pipelines de RL en máquinas sin GPU antes de escalar a configuraciones con acelerador, gracias a su throughput medido de 189 pasos/s con 10 procesos.
- **Plantilla para ablaciones controladas**: la opción `--separate-encoder` y el control de `--reward-scale` permiten experimentar con variantes arquitectónicas y de escalado de recompensa sin reescribir el código.
- **Reproducción de resultados negativos**: como ejemplo de publicación de resultados no exitosos con análisis causal, sirve para discutir prácticas de transparencia en investigación en RL.

## Benchmarks y rendimiento

Los únicos datos publicados son evaluaciones del propio agente frente a una política aleatoria, no benchmarks estándar de la literatura.

| Metrica | PPO (checkpoint 10,24k pasos) | Politica aleatoria |
|---|---|---|
| Retorno medio (20 episodios) | 319,2 | 336,8 |
| Desviacion tipica | 34,9 | 62,6 |
| Mediana | 316,0 | 348,0 |
| Minimo / maximo | 284,0 / 444,0 | 156,0 / 476,0 |
| Supervivencia media | 104,8 pasos de decision (aprox. 419 tics, 12 s) | 109,2 pasos (aprox. 437 tics, 12,5 s) |
| Supervivencia maxima | 136 pasos (544 tics) | 144 pasos (576 tics) |

Evaluaciones intermedias durante el entrenamiento (política argmax, 4 episodios): 276,0 a 51k pasos; 308,0 a 102k; 300,0 a 154k; 284,0 a 205k; 284,0 sin cambios de 256k a 499k. El modelo final (`model_final.pth`) obtuvo 284 puntos, por debajo del mejor checkpoint. No se han publicado resultados de MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es un LLM.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el entrenamiento se ejecutó en CPU con PyTorch 2.14.1 (build CPU).
- **CPU**: 20 núcleos utilizados con 10 procesos de Doom en paralelo; el cuello de botella es el motor ViZDoom (aproximadamente 25 ms por paso de decisión, de los cuales unos 2 ms corresponden a la CNN).
- **GPU recomendadas**: no aplica para este modelo; el autor argumenta que una GPU solo aceleraría una fracción pequeña del tiempo por paso.
- **Compatibilidad con GPU de consumo**: el modelo es tan pequeño (1,29 M de parámetros) que cabría en cualquier GPU de consumo, pero no aportaría una mejora significativa de throughput en este entorno.
- **Opciones de despliegue**: ejecución directa con PyTorch; no hay soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). Se requiere ViZDoom 1.3.2 y Python 3.10.
- **Latencia y throughput medidos**: 34 pasos/s con un proceso; 189 pasos/s con 10 procesos; entrenamiento completo de 500 000 pasos en 64,5 minutos (aproximadamente 129 pasos/s incluyendo evaluación).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|
| doom-health-gathering-ppo (este) | PPO desde cero, CNN actor-crítico | aprox. 1,29 M | Health Gathering Supreme | 319,2 de media (por debajo de aleatorio) | MIT |
| Sample Factory (referencia del curso) | PPO asíncrono de alto throughput | No disponible | Varios escenarios ViZDoom | No disponible en la información proporcionada | MIT |
| Stable-Baselines3 PPO | Implementación PPO generalista | Depende de la política | Gymnasium / ViZDoom con wrappers | No disponible en la información proporcionada | MIT |

No se dispone de datos de benchmarks comparativos publicados para este escenario en la información proporcionada; la comparación con Sample Factory y Stable-Baselines3 es cualitativa y basada en el tipo de implementación, no en métricas verificadas.

## Limitaciones y advertencias

- **Rendimiento inferior a la política aleatoria**: el agente entrenado no supera el comportamiento aleatorio en el escenario objetivo, por lo que no es apto para uso práctico como agente de juego.
- **Degeneración de la política**: la política argmax colapsa a una secuencia fija de acciones; el retorno de 284 puntos corresponde a morir por agotamiento de salud a los 384 tics, independientemente de las acciones.
- **Señal de recompensa débil**: la recompensa por supervivencia (1 punto por tic) es independiente de la acción, y el único evento discriminativo (muerte, −100) ocurre una vez por episodio.
- **Observación incompleta**: el estado de salud (variable HEALTH) no se incluye en la observación, lo que impide al agente aprender cuándo recoger botiquines.
- **Presupuesto de muestras insuficiente**: 500 000 pasos frente a los 4 000 000 del material del curso y a las configuraciones típicas de Sample Factory.
- **Riesgo de sobreinterpretación**: los resultados negativos están bien documentados, pero no se ha demostrado que las mejoras propuestas (reward shaping, variables de estado, mayor `frame_skip`) resuelvan el problema.
- **Licencia MIT**: permite uso comercial y modificación, pero el modelo no tiene utilidad comercial en su estado actual.
- **Sesgos**: no aplica en el sentido habitual de sesgos sociales; el sesgo relevante es el sobreajuste a un único escenario y configuración de hardware.
- **Sin soporte de lenguaje natural ni de tareas fuera de ViZDoom**.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lin267/doom-health-gathering-ppo
- ViZDoom (entorno): https://github.com/Farama-Foundation/ViZDoom
- Documentación de ViZDoom: https://vizdoom.farama.org/
- Curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Sample Factory (framework de referencia del curso): https://github.com/alex-petrenko/sample-factory
- PPO (paper original): https://arxiv.org/abs/1707.06347
- PyTorch: https://pytorch.org/
