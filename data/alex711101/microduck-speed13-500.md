# Alex711101/microduck-speed13-500

## Resumen

Microduck-speed13-500 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un transformador generativo: es una política de locomoción exportada a ONNX que se ejecuta sobre el hardware del robot para producir una marcha (gait) concreta. El modelo observa 61 dimensiones del estado del robot y emite 14 acciones de control a 50 Hz, operando sobre ruedas (rollers) en lugar de patas para el desplazamiento.

El autor lo publica bajo el identificador Alex711101/microduck-speed13-500, con el nombre de tarea Mjlab-RollerSprint2m-MicroDuck, y lo describe como una política «perpetua»: se ejecuta de forma continua hasta que se le indique lo contrario. Se ha entrenado con el framework mjlab (basado en MuJoCo) sobre el repositorio microduck-challenges de Pollen Robotics, con 4096 entornos paralelos y 3000 iteraciones máximas.

Su relevancia es acotada pero específica: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entrenamiento en simulación, exportación a ONNX con normalizador integrado y despliegue en un daemon de robot mediante un manifiesto de políticas versionado). El repositorio pesa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (no se especifica la topología de red; exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2) |

Dimensiones de entrada/salida documentadas: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz. El normalizador de observaciones está integrado en el propio `policy.onnx`, por lo que se alimenta con observaciones en bruto.

## Arquitectura y entrenamiento

La política se ha entrenado con mjlab (versión base mjlab-microduck 0.1.0 en el commit 1efd853be), un entorno de RL sobre MuJoCo para el robot microduck. La tarea es Mjlab-RollerSprint2m-MicroDuck, del repositorio microduck-challenges de Pollen Robotics (rama main, commit a1aee7f22). El entrenamiento usó 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1 y registro en TensorBoard con el nombre de ejecución «speed13»; el checkpoint exportado es el 500.

La model card no detalla la topología de la red neuronal (capas, tamaño, función de activación) ni el algoritmo de RL empleado, más allá de la referencia al framework mjlab. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idénticos pesos. El modelo se exportó desde un checkout con cambios sin confirmar, lo que introduce una caveat de trazabilidad sobre el binario final.

## Capacidades

- Locomoción del robot microduck sobre ruedas (rollers) mediante una marcha continua y perpetua.
- Control a 50 Hz con 14 acciones a partir de 61 observaciones del estado del robot.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en bruto sin preprocesado externo.
- Carga en una ranura (slot) de política del daemon del robot mediante `robotctl`.
- Ejecución indefinida hasta recibir una orden de parada o sustitución de política.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en locomoción con ruedas: sirve como política de referencia para comparar marchas sobre rollers en el microduck, cargándola en una ranura y midiendo velocidad y estabilidad.
- Reproducción de experimentos de RL: el comando documentado permite reentrenar una política equivalente con la misma semilla y configuración, útil para validar pipelines en mjlab.
- Desarrollo de infraestructura de despliegue: el par `policy.onnx` + `manifest.json` (schema 2) ejemplifica el formato de políticas del daemon de microduck y sirve para probar el flujo `robotctl policy load`.
- Docencia en robótica con RL: un caso pequeño y autocontenido (61 observaciones, 14 acciones) para ilustrar simulación, entrenamiento masivo en paralelo y exportación a ONNX.
- Pruebas de integración continua del daemon: validar la carga, el cambio de ranura y la ejecución de políticas en el robot o en simulador antes de desplegar políticas propias.
- Base para ajuste fino o continuación del entrenamiento: partir de esta política para experimentar con nuevas tareas o recompensas en el repositorio microduck-challenges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX de un repositorio de 0,0 GB, la huella es mínima y probablemente ejecutable en CPU.
- GPU recomendadas: no aplica para inferencia en el robot; el entrenamiento documentado asume GPU (4096 entornos paralelos, sin especificar modelo).
- Compatibilidad con GPU de consumo: no disponible para entrenamiento; para inferencia, el ONNX es presumiblemente ligero, pero no se documenta.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load <slot> Alex711101/microduck-speed13-500`; runtime ONNX estándar para pruebas fuera del robot.
- Latencia y throughput: frecuencia de control fijada en 50 Hz; no se publican latencias por inferencia ni throughput del entrenamiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo autor ni del ecosistema microduck con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Ámbito muy restringido: solo funciona con el robot microduck sobre rollers; no es un modelo de propósito general ni transferible a otro hardware sin reentrenamiento.
- Sin métricas de rendimiento publicadas: no hay evidencia cuantitativa de robustez, velocidad o tasa de fallos.
- Reproducibilidad limitada: el autor indica que el entrenamiento no es bit-reproducible entre máquinas, y el export se hizo desde un checkout con cambios sin confirmar.
- Sin documentación de sesgos ni de comportamiento en condiciones fuera de distribución (terrenos, cargas, batería baja).
- Repositorio sin descargas ni likes y de tamaño 0,0 GB: posiblemente solo contiene artefactos mínimos; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de usarlo.
- Política «perpetua»: se ejecuta hasta que se detiene explícitamente, lo que exige supervisión y mecanismos de parada en el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alex711101/microduck-speed13-500
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
