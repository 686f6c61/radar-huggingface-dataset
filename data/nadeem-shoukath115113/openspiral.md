# Nadeem-Shoukath115113/openspiral

## Resumen

OpenSpiral es un paquete que implementa el framework SPIRAL (Self-Policy Improvement via Reward-Aligned Learning), un método de auto-mejora on-policy para políticas de visión-lenguaje-acción (VLA) en robótica real. Desarrollado por Nadeem Shoukath, se construye directamente sobre openpi de Physical Intelligence, utilizando los modelos π₀ y π₀.₅ como políticas base congeladas que SPIRAL refina mediante aprendizaje por refuerzo residual. El objetivo principal es convertir recompensas de progreso densas, generadas por el modelo de recompensa SARM2, en un ciclo de datos automejorado que permite a un robot bimanual SO-101 aprender a doblar ropa (cloth folding) sin intervención humana adicional.

El repositorio incluye un plan de implementación detallado en ocho fases que abarca desde la recopilación de datos de rollouts con fallos intencionados hasta el entrenamiento de SPIRAL y la evaluación en el robot real. El estado actual indica que un checkpoint de behavior cloning (BC) de π₀.₅ en el paso 14999 alcanza un 50% de éxito en la tarea, y el objetivo es superar el 70% mediante el bucle de auto-mejora. El paquete contiene infraestructura para dos entornos separados (openpi para entrenamiento y LeRobot v3 para control del robot), con un puente mediante openpi-client. La relevancia actual radica en abordar el problema de la escasez de datos robóticos de alta calidad, permitiendo que las políticas mejoren a partir de sus propios errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework SPIRAL sobre política base π₀.₅ (flow-matching VLA) de openpi |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un framework de robótica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene código y scripts, no pesos de modelo) |

## Arquitectura y entrenamiento

OpenSpiral implementa la mitad SPIRAL del paper *SARM2: Multi-Task Stage Aware Reward Modeling for Self Improving Robotic Manipulation*. La arquitectura se compone de dos componentes principales: una política VLA congelada (π₀ o π₀.₅, modelos de flow-matching desarrollados por Physical Intelligence) y un modelo de recompensa SARM2 que produce recompensas de progreso densas. SPIRAL entrena una política residual que se suma a la política base, utilizando aprendizaje por refuerzo on-policy con estas recompensas densas como señal de aprendizaje. El entrenamiento se realiza en dos entornos separados: openpi (con uv) para el servidor de política y el entrenamiento SPIRAL, y LeRobot v3 para el control del robot y la recopilación de datos. Los datos de entrenamiento se recopilan mediante rollouts autónomos del robot, incluyendo deliberadamente un mínimo del 30% de episodios fallidos, que son esenciales para que el modelo de recompensa aprenda a distinguir progreso de fracaso. El bucle completo implica: recopilar rollouts, etiquetar con SARM2, entrenar SPIRAL residual RL (aproximadamente 10k pasos en 6 horas), evaluar en el robot y repetir durante 2-3 rondas. La innovación técnica clave es el uso de recompensas de progreso densas en lugar de recompensas binarias, lo que permite una señal de aprendizaje más rica durante la auto-mejora.

## Capacidades

- Auto-mejora de políticas robóticas VLA mediante aprendizaje por refuerzo residual on-policy.
- Generación de recompensas de progreso densas a través del modelo SARM2 (incluido en el repositorio).
- Soporte para manipulación bimanual con robots de 12 grados de libertad (5 articulaciones + 1 pinza por brazo).
- Integración con tres cámaras: vista cenital (`right_front`), muñeca izquierda (`left_wrist`) y muñeca derecha (`right_wrist`).
- Gestión de datos con formato LeRobot v3 y conversión a v2 para compatibilidad con openpi.
- Recopilación de rollouts autónomos con control manual (teclas `s` para iniciar, `q` para guardar episodio, `d` para descartar).
- Soporte opcional para DAgger (Dataset Aggregation) con alternancia de control entre política y brazos líderes.
- Fusión de múltiples sesiones de rollouts en un único dataset mediante scripts dedicados.
- Entrenamiento de dos modelos de recompensa: `act_pri` (clasificador de acciones primarias) y `sarm2` (modelo de recompensa completo).
- Configuración flexible para diferentes robots (el código incluye configs para YAM y SO-101).

## Casos de uso

- **Doblado autónomo de ropa en robots domésticos**: el framework permite que un robot bimanual aprenda a doblar camisetas de manga larga mediante auto-mejora, partiendo de un checkpoint BC con 50% de éxito y mejorando iterativamente. Es adecuado porque combina recompensas densas con RL residual, lo que acelera la convergencia frente a métodos de BC puros.
- **Investigación en aprendizaje por refuerzo para robótica**: los investigadores pueden estudiar cómo las recompensas de progreso afectan la auto-mejora de políticas VLA, comparando con recompensas binarias. El código está modularizado y documentado, facilitando la reproducción de experimentos.
- **Generación de datasets robóticos etiquetados con recompensas**: el pipeline de etiquetado con SARM2 permite crear datasets con recompensas densas a partir de rollouts crudos, útiles para entrenar otras políticas o para análisis de comportamiento.
- **Benchmarking de políticas VLA en tareas de manipulación**: al integrarse con openpi, permite evaluar diferentes políticas base (π₀, π₀.₅) en la tarea de doblado de ropa, midiendo tasas de éxito antes y después del bucle SPIRAL.
- **Despliegue de sistemas de control robótico en tiempo real**: el servidor de política basado en openpi con XLA y el puente mediante openpi-client (numpy + msgpack + websockets) permite inferencia a 15 fps, adecuado para control en bucle cerrado.
- **Formación de ingenieros robóticos**: el plan de implementación detallado en ocho fases sirve como material didáctico para aprender a construir pipelines de auto-mejora robótica, incluyendo gestión de entornos, recopilación de datos y entrenamiento distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que el checkpoint BC de π₀.₅ en el paso 14999 alcanza un 50% de éxito en la tarea de doblado de ropa, y el objetivo del proyecto es superar el 70% tras aplicar SPIRAL, pero no se proporcionan métricas comparativas con otros métodos ni resultados finales de evaluación.

## Requisitos de hardware

- **Robot**: SO-101 bimanual con 12 DOF (5 articulaciones + 1 pinza por brazo), controlado mediante LeRobot v3.
- **GPU**: no se especifica el modelo concreto, pero se requiere una GPU con suficiente VRAM para ejecutar π₀.₅ (modelo de flow-matching VLA) con XLA y `XLA_PYTHON_CLIENT_MEM_FRACTION=0.9`. Se recomienda al menos una GPU de 24 GB (tipo RTX 4090 o superior) para inferencia y entrenamiento.
- **VRAM estimada**: no disponible. Dado que π₀.₅ es un modelo VLA de tamaño considerable, se estima que requiere al menos 16-24 GB para inferencia, pero no se confirma en la documentación.
- **Entornos de software**: dos entornos Python separados — openpi con `uv` para entrenamiento y servidor de política, y LeRobot v3 con `.venv` para control del robot.
- **Opciones de despliegue**: servidor de política mediante `scripts/serve_policy.py` con openpi, cliente mediante `openpi-client` (numpy + msgpack + websockets). No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: la documentación indica que la política BC produce rollouts a 15 fps, lo que sugiere una latencia de inferencia de aproximadamente 66 ms por paso, aunque no se detalla el hardware concreto.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible, ya que OpenSpiral no es un modelo de lenguaje ni una política VLA autónoma, sino un framework de entrenamiento. Sin embargo, se puede comparar con los componentes base:

| Framework | Descripcion | Relacion con OpenSpiral |
|---|---|---|
| openpi (Physical Intelligence) | Plataforma para políticas VLA π₀ y π₀.₅ | OpenSpiral se construye sobre openpi; la política base es π₀.₅ congelada |
| LeRobot (Hugging Face) | Framework de robótica con datasets y control | OpenSpiral usa LeRobot v3 para control del robot y recopilación de datos |
| SPIRAL (spiral-rl, juegos de suma cero) | Framework de self-play para razonamiento en LLMs | Comparte nombre pero es un proyecto distinto; no tiene relación con robótica |

No se dispone de comparaciones cuantitativas de rendimiento con otros frameworks de auto-mejora robótica.

## Limitaciones y advertencias

- **Dependencia de un modelo de recompensa externo**: SPIRAL requiere el modelo SARM2 para generar recompensas densas. Si SARM2 no está bien entrenado o no se adapta a la tarea, el bucle de auto-mejora puede degradarse.
- **Necesidad de datos con fallos**: el framework exige que al menos el 30% de los rollouts sean fallidos para que SARM2 aprenda a distinguir progreso de fracaso. Esto puede ser difícil de lograr en tareas donde la política base ya es muy competente.
- **Complejidad de infraestructura**: requiere dos entornos Python separados y coordinación entre ellos, lo que aumenta la probabilidad de errores de configuración (por ejemplo, el aviso de desinstalar `torchao` tras cada `uv run`).
- **Licencia no especificada**: la licencia no está disponible en la información proporcionada, lo que impide determinar si es apta para uso comercial o restringido.
- **Sin resultados publicados**: no hay benchmarks ni métricas de rendimiento finales, solo un objetivo declarado de superar el 70% de éxito. No se puede verificar la eficacia del framework en producción.
- **Riesgo de sobreajuste a la tarea**: el plan está centrado exclusivamente en el doblado de ropa con el robot SO-101; la generalización a otras tareas o robots no está demostrada.
- **Sesgos de datos**: los datos recopilados dependen del entorno físico y de las cámaras específicas; cambios en la iluminación, la textura de la ropa o la posición de la cámara pueden degradar el rendimiento.
- **Alucinación en el sentido robótico**: las políticas VLA pueden ejecutar acciones no deseadas si el modelo de recompensa produce señales engañosas, especialmente en estados no vistos durante el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/openspiral
- Paper SARM2: https://qianzhong-chen.github.io/sarm2.github.io/
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Dataset bimanual de doblado de camiseta: https://huggingface.co/datasets/Nadeem-Shoukath115113/bimanual_fold_tshirt_20260724_165838
- Perfil del autor en HuggingFace: https://huggingface.co/Nadeem-Shoukath115113
