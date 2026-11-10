# jaippolito/microduck-tug-ninja

## Resumen

microduck-tug-ninja es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. El modelo resuelve una tarea concreta de locomoción descrita por el autor como "push n pull" y se distribuye como un fichero ONNX autocontenido que se carga directamente en una ranura de política del daemon del robot mediante el comando `robotctl policy load`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador reactivo de 50 Hz que mapea observaciones de 61 dimensiones a 14 acciones de actuación.

La relevancia de este artefacto es acotada pero clara dentro del ecosistema microduck: representa un ejemplo reproducible de un pipeline de entrenamiento con mjlab (entorno de RL basado en MuJoCo), con semilla, commit y comando de entrenamiento documentados, lo que permite regenerar una política comparable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el artefacto es de tamaño despreciable.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks. La model card se limita a describir el uso en robot, los parámetros de entrenamiento y el procedimiento de reproducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal (número de capas, tipo de capas, función de activación ni tamaño del modelo). Lo que sí se especifica es la interfaz: 61 dimensiones de observación como entrada, 14 dimensiones de acción como salida, con una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política consume observaciones en crudo.

El entrenamiento se realizó con el framework mjlab (versión base `mjlab-microduck 0.1.0` en el commit `1efd853be`), sobre la tarea `Mjlab-GotATalent-MicroDuck`, en la rama `dirigo-speed` del repositorio `pollen-robotics/microduck-challenges`, commit `ede58611e`, checkpoint `2750` y semilla `42`. El comando de entrenamiento documentado usa 1024 entornos paralelos, un máximo de 3000 iteraciones, guardado cada 250 iteraciones y registro en TensorBoard. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Generación de marcha perpetua ("perpetual policy"): la política se ejecuta de forma continua hasta que se le indique lo contrario.
- Control de locomoción de un cuadrúpedo microduck con 14 acciones de actuación.
- Consumo de observaciones en crudo de 61 dimensiones, con normalización integrada en el propio grafo ONNX.
- Ejecución en tiempo real a 50 Hz sobre el hardware del robot.
- Carga como política en una ranura del daemon mediante `robotctl policy load <slot> jaippolito/microduck-tug-ninja`.
- Tarea específica de "push n pull" (empujar y tirar), según la descripción del autor.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: es un controlador motriz, no un modelo generativo.

## Casos de uso

- Locomoción base del microduck en demostraciones: cargar la política en una ranura y dejar que el robot mantenga una marcha continua sin intervención, útil para exhibiciones y vídeos de producto.
- Pruebas de integración del stack `robotctl`: sirve como política de referencia para validar el pipeline de carga de políticas, el manifiesto schema 2 y la ejecución a 50 Hz en el daemon.
- Investigación en RL aplicado a robótica: el repositorio de entrenamiento, el commit y la semilla permiten reproducir el pipeline y comparar variantes de hiperparámetros sobre la misma tarea.
- Benchmarking de simulación a realidad: al ser una política entrenada en mjlab y exportada a ONNX, permite medir la brecha sim-to-real en el microduck con una tarea concreta.
- Base para fine-tuning o currículos de entrenamiento: al estar documentada la tarea `Mjlab-GotATalent-MicroDuck`, se puede partir de este setup para entrenar habilidades derivadas (giros, transporte de objetos) modificando la recompensa.
- Docencia en cursos de RL y robótica: el flujo completo (clonar repo, `uv sync`, `uv run train`, cargar política en robot) es un ejemplo cerrado y reproducible de extremo a extremo.
- Validación de despliegue ONNX en hardware embebido: el uso de un único fichero ONNX con normalizador integrado simplifica la inferencia en el robot y sirve para probar runtimes ONNX en dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de marcha, consumo energético ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la arquitectura de la red no se especifica, por lo que no se puede estimar con rigor.
- GPU recomendadas: no aplica para inferencia en robot; el modelo se ejecuta en el hardware del microduck a 50 Hz. Para reentrenamiento, el comando documentado usa 1024 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar); no se especifica el hardware exacto empleado.
- Compatibilidad con GPU de consumo: no disponible para entrenamiento; para inferencia, el despliegue es en el propio robot, no en GPU.
- Opciones de despliegue: runtime ONNX en el daemon microduck mediante `robotctl policy load`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de artefacto).
- Latencia y throughput: frecuencia de control fijada en 50 Hz (periodo de 20 ms por paso); no se publican latencias reales de inferencia ni throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema microduck ni modelos comparables de la misma categoría (controladores RL para cuadrúpedos) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Tarea única y específica: la política está entrenada para "push n pull"; no se garantiza su comportamiento fuera de esa tarea ni su robustez ante perturbaciones no vistas en entrenamiento.
- Sin información de licencia: no se puede determinar si el uso comercial está permitido; es un riesgo directo para cualquier despliegue en producto.
- Sin métricas publicadas: no hay datos de tasa de éxito, estabilidad ni sim-to-real que permitan evaluar la calidad de la política antes de desplegarla.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; la semilla 42 y el commit fijan el pipeline, pero no garantizan pesos idénticos.
- Artefacto con 0 descargas y 0 likes: no hay evidencia de uso externo ni validación por parte de la comunidad.
- Tamaño de repositorio de 0.0 GB: conviene verificar que `policy.onnx` y `manifest.json` están efectivamente presentes antes de intentar cargarla en un robot.
- Dependencia del ecosistema microduck: la política solo es utilizable con el daemon y el manifiesto schema 2 de microduck; no es portable a otras plataformas robóticas sin adaptación.
- Sin capacidades de lenguaje, visión ni razonamiento: no debe evaluarse con los criterios habituales de un LLM ni usarse para tareas de comprensión o generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaippolito/microduck-tug-ninja
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no se proporciona URL directa en la información disponible.
