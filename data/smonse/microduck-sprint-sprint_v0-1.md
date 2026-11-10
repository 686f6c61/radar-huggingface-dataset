# SmonSE/microduck-sprint-sprint_v0.1

## Resumen

microduck-sprint-sprint_v0.1 es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que se carga en el demonio del robot para ejecutar una marcha (gait) de forma continua. El autor identificado en Hugging Face es SmonSE y la librería asociada es `microduck`.

El modelo resuelve un problema muy concreto: dotar al microduck de una política de marcha perpetua que se ejecuta a 50 Hz, recibe observaciones de 61 dimensiones y emite 14 acciones de control articular. La política se integra mediante el comando `robotctl policy load`, lo que permite desplegarla en el hardware real sin reentrenamiento. El normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo.

La relevancia actual del artefacto es acotada pero clara dentro del ecosistema de robótica open source: demuestra un flujo completo de entrenamiento con mjlab (entorno de RL basado en MuJoCo), exportación a ONNX y despliegue en un robot de bajo coste. La información pública disponible es escasa: repositorio de 0.0 GB, sin descargas ni likes, sin licencia declarada y sin idiomas especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red de política entrenada con RL; arquitectura exacta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportado a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con schema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena con mjlab, un framework de aprendizaje por refuerzo sobre MuJoCo, usando la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 250 iteraciones del agente, semilla 1 y registro en TensorBoard, partiendo del checkpoint 249 sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`). El código de entrenamiento corresponde al commit `5cee942d8` de la rama `main`, aunque la exportación se realizó desde un checkout con cambios sin commitear.

La interfaz del controlador está bien definida: observación de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz. El normalizador de observaciones está integrado en el grafo ONNX, lo que simplifica la integración en el robot. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. No se documentan detalles sobre la composición del dataset (generado por simulación), la función de recompensa ni si hubo fases de ajuste fino adicionales.

## Capacidades

- Generación de una marcha perpetua (política "perpetual") para el robot microduck; se ejecuta hasta que se detiene explícitamente.
- Control motriz a 50 Hz con 14 acciones articulares a partir de observaciones de 61 dimensiones.
- Normalización de observaciones embebida en el modelo ONNX, lo que permite alimentar observaciones en crudo.
- Despliegue directo en hardware mediante `robotctl policy load <slot> SmonSE/microduck-sprint-sprint_v0.1`.
- Compatibilidad con el manifiesto de políticas schema 2 del demonio de microduck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades multilingües.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en un slot del demonio y ejecutar una marcha continua para validar el hardware y la cadena de control a 50 Hz.
- Docencia e investigación en RL aplicado a robótica: usar la política como línea base reproducible (comando de entrenamiento documentado) para comparar variantes de recompensa, semillas o hiperparámetros.
- Pruebas de integración del stack microduck: verificar el flujo completo desde `policy.onnx` y `manifest.json` hasta la ejecución en el robot, incluyendo la normalización embebida.
- Benchmarking de simulación a realidad: comparar el comportamiento de la política entrenada en MuJoCo con su ejecución en el robot físico para estudiar la brecha sim-to-real.
- Desarrollo de políticas derivadas: partir de este checkpoint y del repositorio `microduck-challenges` para entrenar variantes (por ejemplo, cambios en `num-envs` o en el número de iteraciones) con la misma semilla.
- Demostraciones y divulgación: ejecutar una marcha estable en el microduck para presentaciones de robótica open source sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política exportada a ONNX para control a 50 Hz, la huella esperada es muy reducida, pero no se documenta el tamaño del grafo ni el número de parámetros.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100/H100 o similar), pero el autor no especifica el hardware utilizado.
- ¿Cabe en GPU de consumo? No disponible. La inferencia ONNX de una política de control suele ser viable en CPU o en GPU de gama baja, pero no hay datos publicados que lo confirmen para este artefacto.
- Opciones de despliegue: el despliegue previsto es el demonio de microduck mediante `robotctl policy load`; el formato ONNX permite además ejecución con ONNX Runtime, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El único dato es la frecuencia de control de 50 Hz (periodo de 20 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmonSE/microduck-sprint-sprint_v0.1 | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Políticas del repo `pollen-robotics/microduck-challenges` | Políticas RL de referencia para microduck | no disponible | no disponible | según repositorio (no verificada) | GitHub |
| Otras políticas de locomoción para cuadrúpedos (p. ej., basadas en mjlab/Isaac) | Políticas RL | variable | variable | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay licencia declarada: no puede asumirse permiso para uso comercial ni redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- El repositorio tiene 0.0 GB y 0 descargas; no hay evidencia de validación por terceros ni de mantenimiento.
- El entrenamiento no es bit-reproducible: la reproducción con la misma semilla produce pesos distintos, lo que dificulta la auditoría exacta del artefacto.
- La exportación se realizó desde un checkout con cambios sin commitear, por lo que el código exacto de entrenamiento puede no coincidir plenamente con el commit documentado.
- Es una política específica del microduck: no es transferible a otros robots sin reentrenamiento.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; el riesgo principal es de comportamiento físico (caídas, movimientos no deseados) y debe validarse en entorno controlado.
- No se especifican condiciones de seguridad, límites articulares ni protocolos de parada de emergencia más allá de la naturaleza "perpetua" de la política.

## Enlaces

- Hugging Face: https://huggingface.co/SmonSE/microduck-sprint-sprint_v0.1
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (no se proporciona URL directa)
