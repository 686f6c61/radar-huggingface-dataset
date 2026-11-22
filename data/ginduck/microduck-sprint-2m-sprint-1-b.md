# GinDuck/microduck-sprint-2m-sprint-1-b

## Resumen

`microduck-sprint-2m-sprint-1-b` es un checkpoint de política de control para el robot cuadrúpedo MicroDuck de Pollen Robotics, publicado por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo (reinforcement learning) exportada a ONNX que se carga directamente en el daemon del robot para ejecutar una marcha (gait) de tipo sprint de 2 metros. El modelo observa un vector de 61 dimensiones y emite 14 acciones de control a 50 Hz, funcionando de forma perpetua hasta que se le indique lo contrario.

El entrenamiento se realizó con el stack `mjlab-microduck` (versión 0.1.0, commit `1efd853be`) sobre el repositorio `microduck-challenges` de Pollen Robotics, en la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos, hasta 3000 iteraciones y semilla 1. El checkpoint publicado corresponde a la iteración 1250. Según el autor, se trata de su primera ejecución de sprint con la receta estándar de Pollen, sin ajustes posteriores, por lo que no representa un récord de velocidad.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB (lo que sugiere que los pesos no están efectivamente alojados o son de tamaño despreciable) y una licencia no especificada. Es un artefacto de experimentación personal dentro del ecosistema MicroDuck, útil como referencia de formato de política ONNX y de flujo de entrenamiento reproducible, pero no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del policy manifest de microduck) |
| Observación | 61 dimensiones |
| Acciones | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | perpetuo (se ejecuta hasta recibir orden de parada) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint | 1250 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red neuronal (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se especifica es el pipeline: la política se entrena con `mjlab-microduck` 0.1.0 sobre el repositorio `microduck-challenges` (rama `main`, commit `dc73b9237`), usando 4096 entornos paralelos en escena y un máximo de 3000 iteraciones del agente. El entrenamiento arrancó el 2026-11-01T08:27:21Z y el checkpoint publicado es el 1250.

El artefacto exportado es un `policy.onnx` con el normalizador de observaciones integrado en el propio grafo, de modo que el robot alimenta observaciones crudas sin preprocesado externo. El `manifest.json` sigue el schema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor de un cuadrúpedo MicroDuck mediante política de RL cargada en un slot de política del daemon.
- Marcha de tipo sprint de 2 metros (`Sprint2m`), ejecutada de forma perpetua hasta que se ordene lo contrario.
- Consumo de observaciones crudas de 61 dimensiones gracias al normalizador embebido en el ONNX.
- Emisión de 14 acciones de control a 50 Hz, compatible con el bucle de control del robot.
- Carga y despliegue mediante el comando `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-1-b`.
- Reproducibilidad del pipeline de entrenamiento (código, `uv.lock`, comando y semilla documentados).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- **Investigación en locomoción de cuadrúpedos**: servir como punto de partida o baseline para comparar políticas de sprint entrenadas con la receta estándar de Pollen, dado que el checkpoint es reproducible a nivel de pipeline.
- **Validación del formato de política ONNX de MicroDuck**: usar el `policy.onnx` y su `manifest.json` como ejemplo de referencia para verificar que un export propio cumple el schema 2 y que el normalizador queda correctamente embebido.
- **Pruebas de carga y despliegue en el daemon**: ejercitar el comando `robotctl policy load` en un slot concreto para validar el flujo de instalación de políticas en el robot antes de desplegar políticas propias.
- **Docencia y demostraciones de RL aplicado a robótica**: mostrar de extremo a extremo cómo una política entrenada con 4096 entornos paralelos se materializa en un artefacto ONNX ejecutable en hardware real.
- **Benchmark interno de velocidad de marcha**: aunque el autor indica que no es un récord, puede emplearse como referencia de tiempo base frente a políticas posteriores en la misma tarea `Sprint2m`.
- **Reproducción de experimentos**: reejecutar el comando documentado con semilla 1 para obtener una política comparable y estudiar la varianza entre ejecuciones de RL en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de velocidad, distancia recorrida, estabilidad ni recompensa final, y el autor señala únicamente que el checkpoint «no es un récord de velocidad».

## Requisitos de hardware

- **VRAM para inferencia**: no disponible. Al tratarse de una política de control de 61 observaciones y 14 acciones, la huella es presumiblemente mínima, pero no se publica el tamaño del grafo ONNX ni el número de parámetros.
- **GPU recomendadas para entrenamiento**: no especificadas. El comando de reproducción usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100, H100 o similar); el autor no documenta el hardware empleado.
- **Ejecución en GPU de consumo**: no confirmado. El entrenamiento con 4096 entornos es poco probable en GPUs de consumo tipo RTX 4090 sin reducir `--env.scene.num-envs`.
- **Inferencia en el robot**: el artefacto está pensado para ejecutarse en el propio MicroDuck vía ONNX a 50 Hz, no en un servidor.
- **Opciones de despliegue**: `robotctl policy load` sobre el daemon de microduck; el runtime ONNX concreto no se detalla.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas MicroDuck comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, por lo que no puede asumirse permiso para uso comercial, redistribución o modificación.
- **Repositorio vacío o incompleto**: el tamaño del repo es de 0.0 GB con 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente alojados; conviene verificar la integridad antes de usarlo.
- **Sin métricas de rendimiento**: no hay datos de velocidad, estabilidad ni recompensa, y el autor reconoce que no es una política rápida.
- **No reproducible bit a bit**: repetir el entrenamiento produce pesos distintos; no debe tratarse como un artefacto determinista.
- **Ámbito muy restringido**: es una política específica para la tarea `Sprint2m` del MicroDuck; no generaliza a otras morfologías, tareas ni robots.
- **Sin idiomas ni texto**: no aplica a ningún caso de uso lingüístico; cualquier expectativa de generación de texto es un error de categoría.
- **Sin garantías de producción**: es un checkpoint de primera ejecución de un usuario individual, no una política validada por Pollen Robotics.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-1-b
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Enlace externo citado en la model card (QuackPack): https://www.imundo.ch/quackpack/
