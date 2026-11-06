# SccHy/microduck-sprint-gait1

## Resumen

sprint-gait1 es una política de control motriz para el robot cuadrúpedo microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de actuación a 50 Hz a partir de observaciones del robot. El autor del repositorio es el usuario SccHy y el modelo se distribuye a través de Hugging Face con la librería `microduck`.

La política opera de forma perpetua: una vez cargada en una ranura de política del demonio de control del robot, ejecuta un patrón de marcha (gait) de forma continua hasta que se le indique lo contrario. Recibe un vector de observación de 61 dimensiones y emite 14 acciones, lo que corresponde a las articulaciones y actuadores del microduck. El normalizador de observaciones está integrado en el propio fichero `policy.onnx`, por lo que se alimenta directamente con observaciones en bruto.

Es relevante en el contexto de la robótica open source y del aprendizaje por refuerzo aplicado a robots de bajo coste, ya que demuestra un flujo completo de entrenamiento (repositorio `microduck_rl`, rama `challenge-recipe-publishing`) y despliegue en hardware real mediante un manifiesto de política versionado (schema 2). La información pública disponible es muy limitada: el repositorio ocupa 0.0 GB según Hugging Face, no tiene descargas ni likes, y no se declaran licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

Especificaciones adicionales del entorno de ejecución:

| Parámetro | Valor |
|---|---|
| Tipo de observación | 61 dimensiones |
| Tipo de acción | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Comportamiento | perpetuo (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | integrado en `policy.onnx` |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que es una política de aprendizaje por refuerzo entrenada con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing` y en el commit `1efd853be`. El resultado del entrenamiento se exporta a ONNX, un formato de inferencia portable que permite ejecutar la política en el robot sin depender de un framework de entrenamiento concreto.

El modelo consume un vector de observación de 61 dimensiones y produce 14 acciones a 50 Hz, lo que encaja con el ciclo de control de un cuadrúpedo de pequeñas dimensiones. La normalización de las observaciones está embebida en el grafo ONNX, de modo que el consumidor no necesita replicar el preprocesado. No se dispone de información sobre el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF, DPO o reward shaping específico. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de política.

## Capacidades

- Generación de una marcha (gait) de tipo "sprint" para el robot microduck, ejecutada de forma perpetua hasta recibir una orden de parada.
- Control motor a 50 Hz con 14 acciones de salida, adecuado para el bucle de control en tiempo real del robot.
- Procesamiento de observaciones de 61 dimensiones con normalización integrada en el modelo ONNX.
- Despliegue directo en hardware mediante el comando `robotctl policy load <slot> SccHy/microduck-sprint-gait1`.
- Integración con el ecosistema de manifiestos de política de microduck (schema 2), lo que permite versionar y sustituir políticas por ranura.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de control, no un modelo generativo.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en una ranura y dejar que el robot avance de forma continua para validar la mecánica y los actuadores antes de entrenar políticas propias.
- Benchmark de referencia para recetas de RL: al estar asociada a la rama `challenge-recipe-publishing` del repositorio `microduck_rl`, sirve como línea base para comparar nuevas políticas entrenadas con la misma receta.
- Docencia en robótica y aprendizaje por refuerzo: permite a estudiantes desplegar una política entrenada en un robot real de bajo coste sin escribir el bucle de control desde cero.
- Pruebas de integración del demonio de control: útil para verificar el flujo `robotctl policy load`, la gestión de ranuras y la compatibilidad con el manifiesto schema 2.
- Evaluación de robustez de la marcha: al ser una política perpetua, se puede someter al robot a perturbaciones externas y observar la respuesta del gait en condiciones no vistas durante el entrenamiento.
- Base para ajuste fino o destilación: el fichero ONNX y la receta de entrenamiento publicada permiten partir de esta política para adaptarla a variaciones de hardware o de terreno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el modelo se ejecuta como un grafo ONNX de política de control, por lo que la huella de memoria es previsiblemente muy reducida.
- GPU recomendadas: no disponible. Al tratarse de una política de control a 50 Hz con observaciones de 61 dimensiones, es probable que la inferencia en CPU sea suficiente, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue documentado es mediante el demonio de microduck con `robotctl policy load <slot> SccHy/microduck-sprint-gait1`; el runtime subyacente es ONNX. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni la redistribución del modelo o de sus pesos.
- El repositorio no registra descargas ni likes y la información técnica publicada es mínima; no hay garantías de mantenimiento o soporte.
- Al ser una política de control entrenada para un robot concreto (microduck), no es transferible a otras plataformas sin reentrenamiento o ajuste.
- El comportamiento es perpetuo: la política se ejecuta hasta recibir una orden de parada, lo que exige mecanismos externos de seguridad y supervisión en el robot.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de idioma, ya que el modelo no procesa lenguaje natural.
- No se dispone de información sobre el dominio de entrenamiento (terrenos, perturbaciones, condiciones de laboratorio), por lo que el rendimiento fuera de ese dominio es incierto.
- La fecha de creación del repositorio indicada en la información (2026-11-02) no es verificable y debe tratarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/SccHy/microduck-sprint-gait1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (referenciado en la model card)
