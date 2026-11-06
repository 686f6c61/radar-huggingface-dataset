# apirrone/microduck-footstepnet

## Resumen

Microduck FootstepNet es un planificador de pasos (footstep planner) para el robot cuadrúpedo de bajo coste Microduck de Pollen Robotics. Se trata de un modelo de aprendizaje por refuerzo que genera, paso a paso, la pose de aterrizaje del pie de soporte hacia una pose objetivo, evitando un obstáculo circular. No es un modelo de lenguaje: es una política de control entrenada con el algoritmo CrossQ y exportada a ONNX para su despliegue en robótica.

El modelo retoma FootstepNet, el planificador que Rhoban utilizó en el robot Sigmaban (repositorio `rhoban/footstepnet_envs`), y lo reentrena con los hiperparámetros originales de CrossQ sobre la geometría de los pies y los límites de paso del Microduck. La política opera en un espacio de observación de 8 dimensiones y produce acciones de 3 dimensiones `(dx, dy, dθ)` relativas a una pose neutra de aterrizaje.

Su relevancia es acotada pero específica: cubre la capa de planificación de pasos dentro de una pila de control jerárquica, donde una política de seguimiento de pasos (`Mjlab-Footsteps-Flat-Backlash-MicroDuck`) ejecuta físicamente las pisadas planificadas. El repositorio es de tamaño despreciable (0,0 GB) y cuenta con 16 descargas, lo que refleja un uso muy nicho dentro de la comunidad de robótica con refuerzo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red densa (actor determinista de CrossQ con capas BatchRenorm plegadas en las capas densas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 8 dimensiones) |
| Tipos de cuantización | no disponible (exportado a ONNX float32) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`footstepnet.onnx`) y checkpoint sbx CrossQ (`crossq_best_model.zip`) |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por refuerzo entrenada con CrossQ, una variante de actor-crítico fuera de política (off-policy) que emplea BatchRenorm en lugar de LayerNorm y elimina la red target del crítico para mejorar la eficiencia de muestras. Para la exportación a ONNX, las capas BatchRenorm se pliegan dentro de las capas densas, de modo que el actor resultante es una red puramente determinista de `obs (N, 8) float32 → step (N, 3)`.

La observación sigue una convención de soporte derecho con ocho entradas: `[goal.x, goal.y, cos(goal.yaw), sin(goal.yaw), support_is_goal_foot, obstacle.x, obstacle.y, obstacle.radius]`, con la meta y el obstáculo expresados en el sistema de referencia de la suela de soporte. La acción es un paso `(dx, dy, dθ)` relativo a la pose neutra (pies paralelos, 95 mm de separación), con límites de dx +5/−5 cm, dy ±2 cm y dθ ±30°, recortados a un elipsoide. El entrenamiento se realizó durante 1 millón de pasos, alcanzando entre el 99 % y el 100 % de metas aleatorias dentro de un radio de ±1 m, con una media de unas 22 pisadas por objetivo. Los límites son provisionales y se ajustarán al envolvente medido de la política de seguimiento.

## Capacidades

- Planificación de pasos hacia una pose objetivo de pie en el plano `(x, y, yaw)`.
- Evasión de un obstáculo circular definido por posición y radio (radio 0 indica ausencia de obstáculo).
- Generación de acciones de paso con recorte geométrico (caja y elipsoide) según los límites del robot.
- Gestión de la convención de soporte derecho e izquierdo mediante negación de las componentes correspondientes.
- Determinismo total en inferencia (actor sin muestreo estocástico).
- Ejecución ligera en CPU mediante ONNX Runtime, con implementación de referencia en numpy.
- No soporta tool calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües.

## Casos de uso

- Planificación de pisadas en el robot Microduck: el modelo recibe la pose objetivo del pie y el obstáculo, y devuelve el siguiente paso que la política de seguimiento `Mjlab-Footsteps-Flat-Backlash-MicroDuck` ejecuta físicamente. Es su aplicación principal y para la que fue entrenado.
- Navegación con evitación de obstáculos simples: al aceptar un obstáculo circular en la observación, permite rodear objetos en entornos planos sin necesidad de un planificador global complejo.
- Integración en pilas de control jerárquicas: sirve como capa intermedia entre un planificador de alto nivel (que fija metas de pie) y un controlador de bajo nivel (que ejecuta el seguimiento), gracias a su contrato de entrada/salida bien definido.
- Simulación y validación en mjlab: la implementación de referencia en `src/mjlab_microduck/footstep_planner.py` permite verificar paso a paso la coherencia con el entorno de gym antes de desplegar en hardware.
- Prototipado de investigación en RL para robótica: al incluir el checkpoint CrossQ (`crossq_best_model.zip`), es reutilizable como base para reentrenar o ajustar el planificador a otras geometrías de pie o límites de paso.
- Despliegue en sistemas embebidos: al ser un modelo ONNX pequeño y determinista, puede ejecutarse en CPU sin GPU, lo que facilita su inclusión en la electrónica de a bordo del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la métrica de entrenamiento: entre el 99 % y el 100 % de metas aleatorias dentro de ±1 m alcanzadas, con una media de aproximadamente 22 pasos por objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es una red densa de muy pequeño tamaño y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente para la inferencia con ONNX Runtime.
- Cabe en cualquier GPU consumer e incluso en sistemas embebidos, dado el tamaño reducido del actor.
- Opciones de despliegue: ONNX Runtime (implementación de referencia en numpy + onnxruntime), con posibilidad de exportación a otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (una pasada por red densa de 8 entradas) se espera un coste despreciable, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Microduck FootstepNet | Planificador de pasos RL (CrossQ, ONNX) | obs 8 → step 3 | Apache 2.0 | Hugging Face (`apirrone/microduck-footstepnet`) |
| FootstepNet original (Rhoban, Sigmaban) | Planificador de pasos RL | no disponible en detalle | no disponible | GitHub `rhoban/footstepnet_envs` |
| Política de seguimiento `Mjlab-Footsteps-Flat-Backlash-MicroDuck` | Política de seguimiento de pasos RL | no disponible en detalle | no disponible | Rama `footsteps` de `microduck_rl` |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo planifica pasos para el robot Microduck con su geometría de pie (suela de 54 × 41 mm) y sus límites de paso; no es transferible directamente a otros robots sin reentrenamiento.
- Los límites de paso son provisionales y están fijados al rango de entrenamiento de la política de seguimiento; se reajustarán al envolvente medido de dicha política, por lo que el comportamiento puede cambiar.
- Solo contempla un obstáculo circular; no maneja entornos con múltiples obstáculos ni geometrías complejas.
- Convención de observación estricta (soporte derecho con negación de componentes para soporte izquierdo): un uso incorrecto de la convención produce pasos erróneos sin aviso.
- No es un modelo de lenguaje ni procesa texto; no aplican sesgos lingüísticos, pero tampoco capacidades de razonamiento simbólico.
- Riesgo de fallo en metas fuera del rango de entrenamiento (±1 m) o con obstáculos que bloqueen completamente la trayectoria.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; no se identifican restricciones adicionales en la información disponible.
- Para producción en hardware real es imprescindible validar la integración con la política de seguimiento y el entorno físico, dado que el modelo solo ha sido verificado en simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apirrone/microduck-footstepnet
- Repositorio Microduck RL: https://github.com/pollen-robotics/microduck_rl
- Repositorio FootstepNet original (Rhoban): https://github.com/rhoban/footstepnet_envs
