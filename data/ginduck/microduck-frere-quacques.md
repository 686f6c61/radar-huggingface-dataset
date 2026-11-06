# GinDuck/microduck-frere-quacques

## Resumen

`microduck-frere-quacques` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una política de locomoción y coordinación motora exportada a ONNX que se ejecuta a 50 Hz sobre el hardware del robot. El autor del repositorio es el usuario GinDuck y la librería declarada es `microduck`, con pipeline `robotics`.

La política implementa una coreografía concreta: ocho unidades microduck interpretan "Frère Jacques" en canon, levantándose por parejas de izquierda a derecha, cerrando con un acorde conjunto y una reverencia. Una de las unidades falla el final, sigue cantando, se da cuenta, grazna y hace la reverencia en último lugar. Es, por tanto, una política "perpetua" (sin condición de terminación) que se carga en una ranura de política del demonio del robot y se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero específica: demuestra el flujo completo de entrenamiento con mjlab (entorno de RL basado en MuJoCo), exportación a ONNX con normalizador de observaciones embebido y despliegue en hardware real mediante `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB (pesos de política, no de red neuronal de gran escala).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL (red neuronal de control motor) exportada a ONNX; arquitectura interna de la red no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrenó con mjlab, el framework de aprendizaje por refuerzo basado en MuJoCo empleado en el ecosistema microduck. La tarea se identifica como `Mjlab-GotATalent-MicroDuck`, dentro del repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`). El entrenamiento partió de la base `mjlab-microduck 0.1.0 @ 1efd853be`, con checkpoint 2750, semilla 1 y 4096 entornos paralelos, hasta un máximo de 3000 iteraciones del agente.

El espacio de observación es de 61 dimensiones y el de acción de 14 dimensiones, ejecutándose a 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica. No se documentan detalles sobre la topología interna de la red (capas, activaciones, tamaño), la composición del dataset (al ser RL, la experiencia se genera por simulación) ni el uso de técnicas como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control motor de locomoción para el robot microduck con 14 acciones y observaciones de 61 dimensiones a 50 Hz.
- Ejecución de una coreografía coordinada de ocho unidades (formación en canon, levantamiento por parejas, acorde final y reverencia).
- Comportamiento "perpetuo": la política no tiene condición de terminación y se ejecuta de forma continua hasta que se descarga o se reemplaza.
- Normalización de observaciones integrada en el propio grafo ONNX, simplificando la integración en el demonio del robot.
- Carga dinámica en ranuras de política mediante `robotctl policy load <slot>`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Demostración de coreografía multi-robot: cargar la política en ocho unidades microduck para reproducir la pieza musical coordinada en exhibiciones, ferias o demostraciones de laboratorio, aprovechando la sincronización implícita del canon.
- Validación del pipeline de entrenamiento mjlab: usar la política como referencia reproducible (mismo commit, `uv.lock` y semilla) para verificar que un entorno de RL produce políticas comparables en distintas máquinas.
- Prueba de integración del demonio `robotctl`: ejercitar la carga de políticas en ranuras, el consumo de observaciones en crudo y la ejecución a 50 Hz como test de extremo a extremo del stack de despliegue.
- Benchmark de exportación ONNX en robótica: medir latencia y estabilidad de una política ONNX con normalizador embebido en hardware de bajo coste, comparando con otras políticas del mismo repositorio de retos.
- Material educativo sobre RL aplicado a robótica: ilustrar el ciclo completo simulación-entrenamiento-exportación-despliegue con un caso lúdico y verificable.
- Base para variaciones coreográficas: partir de esta política y del mismo comando de entrenamiento para generar variantes (otra pieza, otro orden de entrada) modificando la tarea en `microduck-challenges`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de pequeña escala exportada a ONNX, se espera que quepa holgadamente en cualquier GPU consumer, pero no se documenta el tamaño del grafo ni sus requisitos.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4096 entornos paralelos, lo que sugiere el uso de GPU de datacenter (A100/H100 o similar), pero no se especifica el hardware empleado.
- Compatibilidad con GPU consumer: probable por la naturaleza del modelo (política de control, no red de gran escala), pero sin datos confirmados.
- Opciones de despliegue: el demonio microduck con `robotctl` y runtime ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política se ejecuta a 50 Hz (periodo de 20 ms) sobre el robot; no se publican cifras de latencia de inferencia ni throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck con las que comparar parámetros, contexto, rendimiento o licencia. El repositorio `pollen-robotics/microduck-challenges` podría contener políticas alternativas, pero no se aportan datos sobre ellas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución de los pesos; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Modelo card sin información de sesgos, riesgos de alucinación ni limitaciones de idioma; al no ser un modelo de lenguaje, estos riesgos no aplican, pero tampoco se documentan limitaciones de la política (robustez ante perturbaciones, terreno, desgaste del hardware).
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el entrenamiento produce pesos distintos, lo que complica la auditoría y la replicación exacta.
- Comportamiento perpetuo sin condición de terminación: requiere supervisión para detener la política y puede no ser adecuado en entornos donde se espere un fin de episodio.
- Dependencia fuerte del hardware y del demonio microduck: la política está acoplada a la interfaz de 61 observaciones y 14 acciones; no es portable a otras plataformas sin reentrenamiento.
- Repositorio sin tracción (0 descargas, 0 likes) y sin validación comunitaria documentada: no hay evidencia externa de robustez en hardware real más allá de la descripción del autor.
- Tamaño de repo de 0,0 GB: los pesos son ligeros, pero no se detalla la arquitectura interna, lo que limita la inspección técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-frere-quacques
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card, sin URL directa disponible)
