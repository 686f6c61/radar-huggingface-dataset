# munish0838/microduck-beam-sprint

## Resumen

`microduck-beam-sprint` es una política de control por aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un checkpoint de política neuronal entrenada para ejecutar una marcha de sprint de 2 metros sobre el robot real, con 61 dimensiones de observación y 14 dimensiones de acción a 50 Hz. El autor del artefacto es el usuario de Hugging Face `munish0838`, aunque la receta y el flujo de entrenamiento proceden del proyecto `microduck-challenges` de Pollen Robotics.

El interés técnico del artefacto reside en su método de generación: según la model card, la receta fue diseñada por un agente automático («Beam», de Reflection AI) que leyó el fichero `AGENTS.md` del propio repositorio de retos y modificó el parámetro `forward_reward` de 2.0 a 4.0 sin intervención humana en el ajuste. El checkpoint publicado corresponde a la iteración 750 de un entrenamiento de 1000 iteraciones con 4096 entornos paralelos y semilla 1. Se distribuye como `policy.onnx` con el normalizador de observaciones embebido, junto a un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon microduck.

La relevancia es doble: por un lado, demuestra un pipeline de entrenamiento reproducible (código, `uv.lock`, comando y semilla documentados) para robótica de bajo coste; por otro, ilustra el uso de agentes automáticos en el diseño de recompensas. El modelo tiene un uso muy acotado (control de un robot concreto) y un tamaño de repositorio de 0.0 GB, coherente con una política pequeña exportada a ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning exportada a ONNX (detalles de capas no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tarea | `Mjlab-Sprint2m-MicroDuck` (sprint de 2 m) |
| Entornos de entrenamiento | 4096 paralelos |
| Iteraciones | 1000 (checkpoint publicado: 750) |
| Semilla | 1 |
| Base de entrenamiento | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Commit de la receta | `ef4b93eb4` (rama `beam/S1/r2`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones). Lo que sí se documenta es el marco de entrenamiento: simulación con `mjlab` (entorno de RL sobre MuJoCo) y el paquete `mjlab-microduck 0.1.0`, ejecutando la tarea `Mjlab-Sprint2m-MicroDuck` con 4096 entornos vectorizados, 1000 iteraciones máximas y semilla 1. El checkpoint publicado es el 750, es decir, un estado intermedio del entrenamiento, no el final.

La innovación destacable no está en la arquitectura sino en el proceso: la receta fue generada por un agente automático que ajustó la recompensa de avance (`forward_reward`) de 2.0 a 4.0 tras leer la documentación del repositorio de retos. El autor indica que un operador humano ejecutó cada comando pero no realizó ajuste manual. El entrenamiento no es bit-reproducible: la model card advierte explícitamente que repetir el pipeline con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos, debido a la no determinación del RL sobre GPU. El normalizador de observaciones está embebido en el ONNX, de modo que la política consume observaciones en crudo.

## Capacidades

- Generación de una marcha de sprint de 2 metros sobre el robot microduck, mantenida de forma perpetua hasta recibir una orden de parada.
- Control a 50 Hz con 14 acciones y 61 observaciones de entrada.
- Inferencia autocontenida: el normalizador de observaciones va incluido en `policy.onnx`, sin preprocesado externo.
- Carga directa en el daemon del robot mediante `robotctl policy load <slot> munish0838/microduck-beam-sprint`.
- Compatibilidad con el sistema de slots de políticas del daemon microduck (manifiesto esquema 2).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: es una política de control motor, no un modelo generativo.

## Casos de uso

- **Marcha perpetua en el robot real**: cargar la política en un slot del daemon y dejar que el microduck avance en línea recta de forma continua. Es el uso previsto por el autor y el único documentado de forma explícita.
- **Punto de partida para fine-tuning de locomoción**: al estar publicada la receta completa (`microduck-challenges`, commit `ef4b93eb4`), sirve como baseline reproducible para comparar variantes de recompensa o de hiperparámetros en la tarea de sprint.
- **Evaluación de recompensas diseñadas por agentes**: el artefacto permite contrastar empíricamente el efecto de subir `forward_reward` de 2.0 a 4.0 frente a recetas ajustadas manualmente, útil en investigación sobre diseño automático de funciones de recompensa.
- **Validación de pipelines sim-a-real**: útil para probar la transferencia de políticas entrenadas en `mjlab` a hardware real con el stack `robotctl`, midiendo deriva y estabilidad de la marcha.
- **Demostración docente de RL en robótica de bajo coste**: el flujo completo (clonar, `uv sync`, `uv run train`) cabe en un tutorial práctico de entrenamiento con entornos vectorizados y exportación a ONNX.
- **Pruebas de integración del daemon microduck**: sirve como política de referencia para verificar el cargador de manifiestos esquema 2 y la gestión de slots en el daemon antes de desplegar políticas propias.
- **Benchmark interno de throughput de inferencia**: al ser una política pequeña en ONNX, permite medir latencia de inferencia a 50 Hz en la CPU o GPU del robot y comparar configuraciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa final, tasa de éxito, distancia recorrida ni comparación con otras políticas del repositorio de retos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y la política es un único fichero ONNX de pequeño tamaño, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican. Dado el tamaño del artefacto, cualquier GPU con soporte ONNX Runtime es suficiente; para el entrenamiento (4096 entornos, 1000 iteraciones) se requiere una GPU de datacenter, aunque el autor no indica el modelo utilizado.
- Cabe en GPU consumer: sí, con toda probabilidad, dado que el artefacto completo mide 0.0 GB; no se especifica el modelo concreto del robot ni su cómputo a bordo.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz, que la política debe sostener en el hardware del robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del repositorio `microduck-challenges` ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma tarea.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin consultar al autor o al repositorio de origen.
- Es una política específica para el robot microduck y la tarea `Mjlab-Sprint2m-MicroDuck`; no es transferible a otros robots ni a otras tareas sin reentrenamiento.
- El checkpoint publicado es el 750 de 1000 iteraciones, no el estado final del entrenamiento; su rendimiento puede ser inferior al de un checkpoint posterior.
- El entrenamiento no es bit-reproducible: repetir el pipeline produce pesos distintos, lo que complica la auditoría exacta del resultado.
- No hay métricas publicadas de robustez ante perturbaciones, terrenos irregulares o cargas, ni datos de tasa de éxito en hardware real.
- El ajuste de recompensa fue realizado por un agente automático sin ajuste manual; no se documenta validación humana del comportamiento resultante más allá de la ejecución de los comandos.
- El modelo no procesa lenguaje ni tiene capacidades de razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- El número de descargas (18) y de likes (0) indica una adopción muy baja, por lo que no hay evidencia comunitaria de funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munish0838/microduck-beam-sprint
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de la receta: `ef4b93eb4` (rama `beam/S1/r2` del repositorio anterior)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
