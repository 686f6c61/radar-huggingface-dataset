# appssy3/connectailab-rl-solo-build_H-roadster-ppo-v2

## Resumen

`connectailab-rl-solo-build_H-roadster-ppo-v2` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para resolver la tarea de control continuo "Inverted Roadster". El objetivo consiste en controlar un vehículo tipo roadster que cae invertido, actuando sobre la intensidad de un propulsor principal (rango 0 a 1) y de un propulsor de rotación (rango -1 a 1), hasta conseguir un aterrizaje seguro sobre las ruedas.

El modelo lo publica el usuario `appssy3` en el marco del curso de IA de refuerzo "AI CITY BUILDERS" del CONNECT AI LAB, y representa la tercera iteración de una progresión de entrenamiento (baseline, v1 y v2). No es un modelo de lenguaje: es una política neuronal para un entorno de simulación física tipo Gymnasium, con observaciones de 7 dimensiones y acciones continuas de 2 dimensiones.

La relevancia de esta versión (v2) radica en que, tras alcanzar un 100 % de éxito de aterrizaje en la v1 (500 000 pasos), el entrenamiento se prolongó hasta 1 000 000 de pasos para optimizar la eficiencia de combustible, elevando la recompensa media de +94,2 a +105,2 puntos. El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que sugiere que los pesos no están efectivamente alojados o que el contenido es mínimo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO); topología de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control continuo, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: pytorch; el repo figura con 0,0 GB) |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre un entorno de control continuo compatible con Gymnasium. La observación es un vector de 7 dimensiones: posición x e y, velocidad x e y, seno y coseno de la inclinación, y velocidad angular de rotación. La acción es un vector continuo de 2 dimensiones: intensidad del propulsor principal (0 a 1) e intensidad del propulsor de rotación (-1 a 1).

Los hiperparámetros declarados en la model card son: clipping de 0,1, 10 entornos paralelos, longitud de rollout de 256, tasa de aprendizaje 3e-4, coeficiente de entropía 0,01 y 10 épocas de actualización PPO por iteración. El entrenamiento total es de 1 000 000 de pasos, con un tiempo de ejecución declarado de 109 segundos. La función de recompensa combina +100 por aterrizaje exitoso, bonificaciones por centrado y verticalidad, y una penalización por consumo de combustible; la mejora de la v2 respecto a la v1 proviene precisamente de reducir ese consumo innecesario. La model card no detalla la topología de la red (número de capas, unidades, funciones de activación) ni si se empleó normalización de observaciones o recompensas.

## Capacidades

- Control continuo de un vehículo en caída invertida mediante dos actuadores (propulsión y rotación).
- Aterrizaje seguro sobre las ruedas con una tasa declarada del 90-100 % en 50 episodios aleatorios no vistos durante el entrenamiento.
- Optimización de eficiencia de combustible: la política aprende a aplicar propulsión solo en los momentos necesarios para un aterrizaje vertical centrado.
- Generalización limitada al entorno "Inverted Roadster (continuous)"; no se declaran capacidades fuera de ese dominio.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, procesamiento de lenguaje ni multimodalidad.
- No dispone de modo "thinking", visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en control continuo: servir como referencia reproducible de una política PPO entrenada durante 1 millón de pasos sobre un entorno de aterrizaje, útil para comparar curvas de aprendizaje y estabilidad del entrenamiento.
- Docencia en cursos de RL: el repositorio forma parte del material del curso "AI CITY BUILDERS" del CONNECT AI LAB, y la progresión baseline → v1 → v2 ilustra de forma concreta el efecto del número de pasos y del diseño de recompensas.
- Estudio de ingeniería de recompensas: la comparación entre v1 (+94,2 con 100 % de aterrizaje) y v2 (+105,2) muestra cómo una penalización por combustible moldea el comportamiento hacia políticas más eficientes sin sacrificar la tasa de éxito.
- Simulación de dinámica de vuelo y aterrizaje: el agente puede integrarse en simuladores físicos 2D para probar estrategias de descenso controlado con actuadores limitados.
- Generación de datos sintéticos de trayectorias: las políticas entrenadas pueden producir rollouts de aterrizaje para entrenar modelos de imitación o para análisis de estabilidad.
- Pruebas de robustez de algoritmos PPO: el checkpoint permite evaluar variantes de PPO (clipping, entropía, número de entornos) frente a una política ya convergida.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados):

| Métrica | Valor (v2, 1M pasos) | v1 (500K pasos) | Baseline (100K pasos) |
|---|---|---|---|
| Recompensa media | +105,2 | +94,2 | -90,9 |
| Tasa de aterrizaje | 90,0 % (hasta 100 % en la card) | 100,0 % | 0,0 % |
| Entorno | Inverted Roadster (continuous) | Inverted Roadster (continuous) | Inverted Roadster (continuous) |
| Verificado | No | No | No |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de una política de control con observaciones de 7 dimensiones, la huella de memoria es previsiblemente muy reducida (del orden de kilobytes a pocos megabytes), pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; cualquier GPU con soporte PyTorch debería bastar para inferencia, aunque no se especifica en la documentación.
- Compatibilidad con GPU de consumo: probable en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU, si bien no está documentado.
- Opciones de despliegue: PyTorch nativo; no se declaran exportaciones a ONNX, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El tiempo de entrenamiento declarado de 109 segundos para 1 millón de pasos sugiere una simulación muy ligera, pero no se aportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Pasos de entrenamiento | Recompensa media | Tasa de éxito | Licencia |
|---|---|---|---|---|---|---|
| connectailab-rl-solo-build_H-roadster-ppo-v2 | PPO, control continuo | Inverted Roadster | 1 000 000 | +105,2 | 90-100 % | no disponible |
| connectailab-rl-solo-build_H-roadster-ppo-v1 | PPO, control continuo | Inverted Roadster | 500 000 | +94,2 | 100 % | no disponible |
| Baseline (100K) | PPO, control continuo | Inverted Roadster | 100 000 | -90,9 | 0 % | no disponible |

No se dispone de información sobre otros agentes de RL comparables de otros autores para este entorno en la documentación proporcionada.

## Limitaciones y advertencias

- Los resultados (+105,2 de recompensa, 90-100 % de aterrizaje) están declarados por el autor y marcados como `verified: false`; no han sido validados de forma independiente.
- El repositorio figura con un tamaño de 0,0 GB, lo que puede indicar que los pesos no están realmente alojados o que el contenido es mínimo; conviene verificar la descarga antes de usarlo.
- La licencia no está disponible, por lo que no se puede garantizar el uso comercial ni la redistribución.
- El modelo está especializado exclusivamente en el entorno "Inverted Roadster (continuous)"; no generaliza a otras tareas de control ni a dominios de lenguaje.
- No se documenta la topología de red ni el proceso de evaluación, lo que dificulta la reproducibilidad.
- La tasa de aterrizaje de la v2 (90-100 %) es ligeramente inferior a la de la v1 (100 %), lo que sugiere un posible compromiso entre eficiencia de combustible y robustez del aterrizaje.
- No se detallan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a este tipo de modelo; cualquier despliegue en simulación física debe validarse contra el entorno real de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build_H-roadster-ppo-v2
- Versión anterior (v1): https://huggingface.co/appssy3/connectailab-rl-solo-build_H-roadster-ppo-v1
- Curva de aprendizaje referenciada en la model card: `learning_curve.png` (incluida en el repositorio del modelo)
- Curso "AI CITY BUILDERS" · CONNECT AI LAB: no disponible (sin URL en la información proporcionada)
