# RobotControlStack/duobench-act-sim-transfer_reorient

## Resumen

DuoBench ACT (sim) es una política de imitación basada en la arquitectura ACT (Action Chunking Transformer) desarrollada por RobotControlStack para el benchmark DuoBench de manipulación bimanual. El modelo concreto `duobench-act-sim-transfer_reorient` es una política de tarea única entrenada exclusivamente con datos de simulación para la tarea `transfer_reorient` del montaje bimanual FR3 Duo. Resuelve el problema de generar comandos de control de 16 dimensiones (7 articulaciones por brazo más dos pinzas) a partir de tres cámaras y el estado propioceptivo del robot.

Con 51.689.104 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para investigación en robótica más que para despliegue general. Su relevancia radica en que forma parte de un benchmark reproducible que evalúa la transferencia sim-a-real en manipulación bimanual, un área donde escasean las referencias comparables y los entornos estandarizados.

La información disponible es limitada: se trata de un checkpoint de investigación con muy pocas descargas (10) y sin métricas de rendimiento destacables (0,3 % de éxito en simulación). No debe confundirse con un modelo de lenguaje: es una política robótica y no procesa texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con decodificación por chunks de acciones |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; usa observaciones por paso y chunk de acciones de 100) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, un transformer diseñado para imitación robótica que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y mejora la estabilidad del control. La entrada combina tres cámaras (`head`, `left_wrist`, `right_wrist`) a 224x224 píxeles con un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas), y la salida es un vector de acción conjunto de 16 dimensiones.

El entrenamiento se realizó desde cero con LeRobot (commit `c8ce413d`) sobre 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`. Se usaron 150.000 pasos, batch size 64, learning rate 1e-5, chunk de acciones de 100 y semilla 1000. No se menciona RLHF, DPO ni ningún tipo de ajuste por preferencias; es aprendizaje por imitación supervisado puro sobre datos simulados. La configuración completa está en `train_config.json`.

## Capacidades

- Control bimanual de un robot FR3 Duo en simulación para la tarea `transfer_reorient`.
- Predicción de chunks de acciones de 100 pasos a partir de observaciones visuales y propioceptivas.
- Fusión de tres vistas de cámara (cabeza y dos muñecas) con estado articular.
- Política de tarea única: no generaliza a otras tareas del benchmark sin reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, audio ni imágenes fuera del pipeline robótico.

## Casos de uso

- Investigación en imitación bimanual: sirve como línea base reproducible para comparar nuevos métodos de aprendizaje por imitación en el entorno DuoBench.
- Evaluación de transferencia sim-a-real: el checkpoint permite medir el gap entre política entrenada en simulación y su comportamiento en el robot real dentro del protocolo del benchmark.
- Reproducción de experimentos: al estar publicado con configuración y commit exactos de LeRobot, facilita la replicación de resultados por parte de otros grupos.
- Estudio de arquitecturas ACT: útil para analizar el efecto del chunk de acciones (100) y de las tres cámaras en tareas de manipulación fina como reorientar objetos.
- Docencia en robótica: ejemplo práctico y ligero (0,2 GB) para ilustrar pipelines de LeRobot y evaluación en simulación.
- Desarrollo de entornos de simulación: el modelo y el dataset asociado permiten validar simuladores y métricas de éxito bimanual.

## Benchmarks y rendimiento

Resultados publicados por el autor en simulación DuoBench, 300 rollouts por tarea (semillas 0-299) con intervalo de Wilson al 95 %:

| Tarea | Tasa de exito (%) | IC 95% |
|---|---|---|
| transfer_reorient | 0,3 | [0,1, 1,9] |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 ocupa aproximadamente 0,2 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100); el cuello de botella será el renderizado del simulador, no el modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas.
- Opciones de despliegue: LeRobot (commit `c8ce413d`) mediante `ACTPolicy.from_pretrained`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, dentro del propio DuoBench existen políticas ACT entrenadas en otras tareas (por ejemplo, variantes sim y real), pero no se han facilitado sus métricas para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| duobench-act-sim-transfer_reorient | 51,7 M | no aplica | Apache 2.0 | HuggingFace |
| Otras políticas DuoBench | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el propio autor indica que no está pensado para el robot real.
- Tasa de éxito muy baja (0,3 %) en la tarea para la que fue entrenado, lo que limita su utilidad práctica más allá de la comparación de referencia.
- Política de tarea única: no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones posteriores pueden romper la carga del checkpoint.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento simbólico ni conversación, pese a que su ficha pueda aparecer junto a modelos de IA generativa.
- Riesgo de sobreajuste a las 50 demostraciones por tarea y a la semilla de entrenamiento (1000).
- Licencia Apache 2.0 permite uso comercial del software, pero el uso en robótica real queda fuera del alcance previsto por el autor y sin garantías de seguridad.
- Sin datos publicados sobre sesgos, robustez ante cambios de iluminación o variaciones del entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotControlStack/duobench-act-sim-transfer_reorient
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit usado): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
