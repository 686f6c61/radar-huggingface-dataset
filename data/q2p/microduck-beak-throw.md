# q2p/microduck-beak-throw

## Resumen

El modelo `q2p/microduck-beak-throw` es una política de control aprendida mediante aprendizaje por refuerzo (RL) para el robot bípedo Microduck, desarrollado por Pollen Robotics (adquirida por Hugging Face en abril de 2025). La habilidad implementada consiste en un lanzamiento de una pelota de 24 mm desde el pico del robot, seguido de una recuperación a la postura bípeda. El modelo se distribuye en formato ONNX y PyTorch, y está diseñado para ejecutarse a 50 Hz con una ventana de observación de 61 valores y 14 acciones de control.

Este modelo es relevante porque demuestra un flujo completo de entrenamiento sim2real para un robot de bajo coste (399 dólares), con un stack open source que permite reproducir el experimento tanto en simulación como en hardware. La política fue entrenada en el entorno MuJoCo `Mjlab-BeakThrow-Hardware-MicroDuck` y exportada con el normalizador de observaciones integrado. Aunque no es un modelo de lenguaje ni de visión, su interés radica en la transferencia de comportamientos aprendidos en simulación a un robot físico, un área clave en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP probable, no especificada) |
| Parametros totales | No disponible (repo de 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (control secuencial episódico de 2.4 s) |
| Tipos de cuantizacion | No disponible (formato ONNX estándar) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`beak_throw.onnx`, `alpha_stand.onnx`), PyTorch (`model_2150.pt`) |

## Arquitectura y entrenamiento

La política fue entrenada con aprendizaje por refuerzo (RL) utilizando el framework RSL-RL, sobre el entorno MuJoCo `Mjlab-BeakThrow-Hardware-MicroDuck` del repositorio `pollen-robotics/microduck_rl`. El entorno simula el robot Microduck con 14 articulaciones de servo (cuerpo y cabeza) más una sincronización de la boca gestionada por el runtime. El modelo recibe observaciones de 61 valores (estado del robot, fase de la tarea, etc.) y produce 14 acciones de control a 50 Hz. El checkpoint seleccionado es `model_2150.pt`, exportado a ONNX con el normalizador de observaciones integrado.

El entrenamiento incluyó aleatorización de condiciones (50/50 trials) para robustecer la política. La tarea se divide en fases: wind-up (0.00–0.30 s), snap (0.30–0.34 s), follow-through y recuperación (0.34–1.00 s), y después de 2.4 s el runtime cambia a la política `alpha_stand.onnx` para mantener la postura. No se especifican detalles sobre el algoritmo exacto (PPO, SAC, etc.) ni el número de tokens o dataset, ya que no es un modelo de lenguaje.

## Capacidades

- Lanzamiento de una pelota de 24 mm y 3 g a aproximadamente 0.53 m hacia adelante.
- Recuperación a una postura bípeda tras el lanzamiento.
- Control coordinado de 14 articulaciones (cuerpo y cabeza) con sincronización de la boca.
- Ejecución episódica de 2.4 segundos, con transición automática a la política de reposo.
- Integración con el runtime de Microduck mediante el comando `robotctl robot do beak-throw`.
- Reproducibilidad en simulación (MuJoCo) y en hardware real (con parches específicos).
- No incluye capacidades de lenguaje, visión, tool calling ni agentes.

## Casos de uso

- Investigación en sim2real: el modelo sirve como caso de estudio para transferir políticas RL de simulación a un robot físico de bajo coste, permitiendo analizar brechas de realidad y robustez.
- Robótica educativa: estudiantes y desarrolladores pueden entrenar y desplegar habilidades personalizadas en el robot Microduck, usando el flujo completo de entrenamiento y evaluación.
- Demostración de manipulación dinámica: el lanzamiento de objetos es una tarea de manipulación no prensil que requiere control de fuerzas y sincronización, útil para probar algoritmos de control.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, clasificación de objetos pequeños o dispensación de piezas en líneas de demostración, siempre que se respeten las limitaciones de seguridad.
- Desarrollo de nuevas habilidades: el modelo puede servir como base para entrenar variantes (diferentes distancias, tamaños de objeto) mediante fine-tuning o curriculum learning.
- Evaluación de hardware: permite verificar la repetibilidad y precisión de los servos del robot en tareas dinámicas, comparando el comportamiento simulado con el real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. En su lugar, la model card reporta resultados de simulación:

| Métrica | Resultado |
|---|---|
| Trials aleatorizados (simulación) | 50/50 superaron la puerta de ≥0.50 m hacia adelante y ≤0.20 m lateral |
| Recuperación a postura bípeda | 50/50 trials completaron la recuperación |
| Exceso de límite de joint-target | 50/50 trials excedieron el límite estricto (mediana 0.751 rad), requiriendo clamp anatómico |

Estos datos indican que la política es funcional en simulación pero no es segura para hardware sin el parche de runtime que aplica límites articulares.

## Requisitos de hardware

- Robot Microduck: bípedo de 25 cm, 15 motores, cámara, LiDAR y pico articulado; requiere una SBC Radxa (u similar) para ejecutar el runtime.
- Para simulación: cualquier laptop con MuJoCo instalado (Linux o macOS con `mjpython`); no se requiere GPU dedicada, aunque una GPU modesta acelera el entrenamiento.
- Inferencia en el robot: el modelo ONNX es ligero (0.1 GB repo) y se ejecuta en la SBC del robot sin necesidad de GPU.
- Despliegue: se utiliza `robotctl` y un runtime patcheado (ver instrucciones en la model card); también se puede ejecutar en simulación con `uv run play`.
- Latencia y throughput: no se especifican, pero al ser una política de 50 Hz con 14 acciones, se espera una latencia inferior a 20 ms en hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control para Microduck). El ecosistema de Microduck incluye otras políticas (caminar, flamingo, etc.) pero no se proporcionan datos de rendimiento para comparar. Se puede considerar que este modelo es único en su tarea específica de lanzamiento, y no hay alternativas públicas conocidas.

## Limitaciones y advertencias

- No validado en hardware real: todos los resultados provienen de simulación; la primera ejecución física debe realizarse con el pico vacío.
- Exceso de límites articulares: la red supera el límite estricto de joint-target en el 100% de los trials simulados, por lo que el clamp anatómico del runtime es obligatorio.
- Requiere parche de runtime específico: no puede instalarse como un simple swap de política; necesita modificar el runtime de Microduck.
- Medidas de seguridad: se recomienda suelo acolchado de alta fricción, protección ocular, zona de exclusión y comandos de aborto predefinidos.
- La referencia del liner del pico debe medirse y adaptarse al robot físico antes de cualquier trial con carga.
- No es un modelo de lenguaje ni multimodal; no tiene capacidades de procesamiento de texto, visión o audio.
- Licencia Apache-2.0 permite uso comercial, pero el hardware y el software asociados tienen sus propias condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q2p/microduck-beak-throw
- Repositorio fuente (GitHub): https://github.com/llama/microduck-beak-throw
- Página oficial de Microduck: https://pollen-robotics.com/microduck/
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Entornos RL para Microduck: https://github.com/pollen-robotics/microduck_rl
- Blog de introducción a Microduck: https://pollen-robotics.com/microduck/blog/introducing-microduck/
- Artículo sobre Microduck en Byteiota: https://byteiota.com/hugging-face-microduck-399-open-source-robot-with-full-rl-stack/
