# atomicvox/microduck-tug-of-war-run-1111-0101

## Resumen

`atomicvox/microduck-tug-of-war-run-1111-0101` es una política de control entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un artefacto de robótica: una red neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse en bucle perpetuo sobre el robot físico. El autor es el usuario de Hugging Face `atomicvox`, y el modelo se distribuye en formato ONNX con la librería `microduck`.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB y una model card extremadamente escueta (una sola línea de descripción, "pullll"). Se publica como parte de un pipeline de entrenamiento reproducible basado en mjlab, con un checkpoint concreto (iteración 500) y una semilla fija, lo que permite reproducir el proceso pero no garantiza pesos idénticos. Es, por tanto, un ejemplo de política de locomoción/control para un robot de investigación más que un modelo con utilidad general.

No hay información sobre arquitectura interna de la red, número de parámetros, contexto (no aplica), idiomas (no aplica) ni licencia. Cualquier evaluación comparativa con otros modelos queda limitada por la ausencia de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de política para control robótico; detalles internos no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal. Lo que sí se documenta es el pipeline de entrenamiento: se trata de una política entrenada con aprendizaje por refuerzo en el entorno `Mjlab-TugOfWar-MicroDuck`, usando el framework mjlab (versión base `mjlab-microduck 0.1.0 @ 1efd853be`). El entrenamiento se ejecutó con 2048 entornos paralelos, hasta un máximo de 1000 iteraciones, semilla 1, y el checkpoint publicado corresponde a la iteración 500. El repositorio de entrenamiento es `atomicvox/microduck-challenges`, rama `main`, commit `8d55e156a`.

El autor advierte explícitamente de que el proceso no es bit-reproducible: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no los mismos pesos, debido a la no determinación del entrenamiento con RL sobre GPU. La normalización de observaciones está embebida dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), lo cual es esperable dado que no es un modelo de lenguaje.

## Capacidades

- Control de locomoción del robot microduck mediante una política de marcha ("gait") cargada en una ranura de política del daemon `robotctl`.
- Ejecución en bucle perpetuo: la política "runs until told otherwise", es decir, mantiene la marcha de forma continua hasta que se le indique lo contrario.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Inferencia en formato ONNX, con normalizador de observaciones integrado en el propio grafo.
- Tarea específica de "tug of war" (tirar de la cuerda), según el identificador `Mjlab-TugOfWar-MicroDuck`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: servir como política de referencia entrenada en mjlab para comparar curvas de recompensa, estabilidad de la marcha y transferencia sim-a-real en el microduck.
- Reproducción de experimentos: el commit, la semilla y el comando de entrenamiento documentados permiten reconstruir el pipeline y validar variantes (más entornos, más iteraciones, otras semillas) sobre la misma base.
- Demostración de locomoción en el robot físico: cargar la política en una ranura mediante `sudo robotctl policy load <slot> atomicvox/microduck-tug-of-war-run-1111-0101` y observar la marcha en bucle.
- Docencia y prototipado en robótica de bajo coste: el microduck es una plataforma económica, y esta política permite a estudiantes experimentar con despliegue de políticas RL en hardware real sin entrenar desde cero.
- Pruebas de integración del daemon `robotctl`: validar el esquema 2 del manifiesto de políticas (`docs/policy-manifest.md`) y el flujo de carga de políticas ONNX en el daemon.
- Benchmark interno de inferencia ONNX en el robot: medir latencia y estabilidad del bucle de control a 50 Hz con una política concreta antes de desplegar variantes propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros ni el tamaño exacto de `policy.onnx`.
- GPU recomendadas: no disponible. Dado el contexto (robot microduck de bajo coste y control a 50 Hz), es plausible que la inferencia se ejecute en CPU en el propio robot, pero esto no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de VRAM ni de requisitos mínimos.
- Opciones de despliegue: el formato es ONNX y la carga se realiza mediante el daemon `robotctl` del ecosistema microduck (`sudo robotctl policy load <slot> ...`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el único dato es la frecuencia de control de 50 Hz que la política debe sostener.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para el microduck ni modelos comparables de la misma categoría (control RL para robots cuadrúpedos de bajo coste) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Model card prácticamente vacía: la descripción se reduce a "pullll", sin documentación de arquitectura, parámetros, datos de entrenamiento ni evaluación.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción sin contactar con el autor.
- Cero descargas y cero likes: no hay evidencia de uso, validación por terceros ni reportes de comportamiento en hardware real.
- No reproducibilidad bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos, lo que complica la auditoría y la comparación exacta de resultados.
- Tarea muy específica ("tug of war"): la política está entrenada para un escenario concreto y no se garantiza su generalización a otras tareas o terrenos.
- Sin datos de seguridad ni de comportamiento ante fallos: no se documentan límites de par, protecciones ni comportamiento ante perturbaciones, algo crítico en un robot físico.
- Fecha de creación futura en los metadatos (2026-11-11) y tamaño de repositorio de 0.0 GB: metadatos que conviene verificar antes de confiar en el artefacto.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, que no aplican a un modelo de control robótico.

## Enlaces

- Hugging Face: https://huggingface.co/atomicvox/microduck-tug-of-war-run-1111-0101
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `git@github.com:atomicvox/microduck-challenges.git` (no se proporciona URL web)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
