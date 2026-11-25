# GinDuck/microduck-sprint-2m-sprint-1-d

## Resumen

microduck-sprint-2m-sprint-1-d es un checkpoint de política de refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. Lo publica el usuario GinDuck en Hugging Face y corresponde a la primera ejecución de entrenamiento ("sprint") del autor, realizada con la receta estándar de Pollen sin ajustes posteriores. El modelo resuelve una tarea concreta de locomoción: generar una marcha (gait) que el robot ejecuta de forma perpetua a 50 Hz hasta que se le indique lo contrario.

El artefacto no es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de control que consume observaciones de 61 dimensiones y emite 14 acciones. Se distribuye en formato ONNX (`policy.onnx`) con el normalizador de observaciones integrado en el propio grafo, de modo que el robot puede alimentar observaciones en bruto. El repositorio incluye además un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero práctica: sirve como referencia reproducible de un pipeline completo de entrenamiento con mjlab (entorno de RL basado en MuJoCo) sobre el robot microduck, y como ejemplo de despliegue de políticas en un robot real mediante el comando `robotctl policy load`. No hay datos publicados sobre licencia, idiomas ni benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrenó con mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), un entorno de aprendizaje por refuerzo construido sobre MuJoCo, dentro del repositorio `microduck-challenges` de Pollen Robotics (rama `main`, commit `dc73b9237`). El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones y semilla 1; el checkpoint publicado corresponde a la iteración 2000. La tarea se identifica como `Mjlab-Sprint2m-MicroDuck` y el entrenamiento arrancó el 2026-11-01.

La interfaz de la política está definida por el propio robot: 61 dimensiones de observación y 14 acciones a 50 Hz. El normalizador de observaciones está embebido en el grafo ONNX, lo que elimina la necesidad de preprocesar las observaciones en el lado del robot. El autor advierte explícitamente de que el proceso no es reproducible bit a bit entre máquinas: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica.

## Capacidades

- Generación de una marcha (gait) perpetua para el robot microduck: la política se ejecuta de forma continua hasta recibir una orden de parada.
- Control de locomoción a 50 Hz con 61 observaciones de entrada y 14 acciones de salida.
- Despliegue directo en robot mediante `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-1-d`.
- Normalización de observaciones integrada en el modelo ONNX, sin preprocesado externo.
- Compatibilidad con el sistema de slots de políticas del daemon de microduck (manifiesto esquema 2).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en un slot y dejar que el robot camine de forma continua para validar el hardware y el firmware del daemon antes de entrenar políticas propias.
- Punto de partida reproducible para investigación en RL: clonar `microduck-challenges` en el commit indicado, sincronizar con `uv` y relanzar el entrenamiento con la misma semilla para obtener una política comparable y estudiar la variabilidad entre ejecuciones.
- Referencia de línea base ("plain recipe"): comparar políticas ajustadas posteriormente contra este checkpoint para medir la ganancia de cada cambio en la receta de entrenamiento.
- Pruebas de integración del pipeline de despliegue: verificar que el manifiesto esquema 2, el normalizador embebido y el comando `robotctl policy load` funcionan de extremo a extremo en un robot real.
- Docencia y demos de robótica con refuerzo: mostrar el ciclo completo entrenamiento en simulación (mjlab/MuJoCo) y despliegue en hardware con un artefacto pequeño en formato ONNX.
- Evaluación comparativa de simuladores y recetas: usar el checkpoint de la iteración 2000 como referencia fija mientras se varían parámetros del entorno (número de entornos, iteraciones, semilla) en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, estabilidad ni tasas de éxito en simulación o en hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la arquitectura de la red no se detalla, por lo que no puede estimarse con rigor.
- GPU recomendadas: no aplica para inferencia en robot (la política ONNX se ejecuta en la CPU del propio microduck); para reentrenar, la receta usa 4096 entornos paralelos en mjlab, lo que requiere una GPU de datacenter (A100/H100) o equivalente, aunque el autor no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? La inferencia no necesita GPU; el entrenamiento con 4096 entornos paralelos difícilmente cabe en una GPU de consumo, pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck (`robotctl policy load`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. La model card no referencia otras políticas de microduck ni checkpoints comparables, y no se dispone de datos de parámetros, contexto ni rendimiento de alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no hay información sobre permisos de uso comercial, modificación o redistribución; conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Entrenamiento no reproducible bit a bit: el propio autor advierte de que repetir el proceso produce una política comparable, no los mismos pesos.
- Es un checkpoint temprano ("very first sprint run") entrenado con la receta sin ajustar; es probable que existan políticas posteriores con mejor comportamiento, aunque no se documentan.
- Sin métricas publicadas: no hay evidencia cuantitativa de estabilidad, velocidad ni robustez de la marcha en hardware real.
- Ámbito de uso restringido al robot microduck: la interfaz de 61 observaciones y 14 acciones está acoplada a ese hardware concreto.
- Riesgo de sobreajuste a la simulación: no se documenta ninguna técnica de aleatorización de dominio ni validación sim-to-real.
- Sin información sobre sesgos, alucinación o cobertura idiomática: no aplica a un modelo de lenguaje, pero tampoco se documenta el comportamiento de la política ante condiciones fuera de distribución.
- La model card incluye un enlace promocional externo (QuackPack) ajeno al modelo; no debe interpretarse como parte del artefacto técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-1-d
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Enlace promocional citado en la model card (no técnico): https://www.imundo.ch/quackpack/
