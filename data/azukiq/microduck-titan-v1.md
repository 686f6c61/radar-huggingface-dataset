# azukiq/microduck-titan-v1

## Resumen

`microduck-titan-v1` es una política de control motriz (policy) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de comportamiento que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX y distribuida a través del framework `microduck`. El autor es `azukiq`, un desarrollador independiente, y el checkpoint publicado corresponde al paso 9800 de un entrenamiento de self-play en la tarea "Tug of War" (tira y afloja) orientada a partidos de taza.

La relevancia de esta ficha es doble: por un lado documenta un artefacto concreto de robótica open source de nicho; por otro, sirve como ejemplo de una categoría de modelos (políticas RL exportadas a ONNX) que cada vez aparecen más en Hugging Face y que requieren un tratamiento técnico distinto al de los LLM. La información disponible es muy escasa: el repositorio pesa 0.0 GB (lo que sugiere que los pesos no están realmente subidos o son de tamaño despreciable), no se declara licencia, no se listan idiomas y la model card es mínima.

El modelo declara ser una política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha (gait) cargada en una ranura de política del robot. Esta característica lo diferencia de políticas episódicas que terminan tras una tarea acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política RL exportada a ONNX (arquitectura interna no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Checkpoint | 9800 |
| Libreria | `microduck` |
| Tamano del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (número de capas, tipo de capas, activaciones). Se sabe que es una política entrenada con aprendizaje por refuerzo mediante self-play en la tarea "Tug of War" para partidos de taza, y que el checkpoint publicado es el 9800. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, aunque el autor indica que el export se hizo desde un checkout con cambios sin commitear, lo que introduce una advertencia de reproducibilidad importante.

Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo (raw). El manifiesto sigue el schema 2 del manifiesto de políticas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon. No se especifican número de tokens de entrenamiento (no aplica), composición del dataset, ni si hubo RLHF/DPO (tampoco aplica en el sentido de LLM; el entrenamiento es RL puro sobre simulación o entorno físico).

## Capacidades

- Control motriz continuo de un cuadrúpedo microduck a 50 Hz.
- Política "perpetua": mantiene la marcha indefinidamente hasta que se detiene explícitamente.
- Mapeo directo de 61 observaciones a 14 acciones de control.
- Ejecución de una tarea de self-play específica ("Tug of War" para partidos de taza).
- Carga como ranura de política mediante `robotctl policy load`.
- Normalización de observaciones integrada en el grafo ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como política de referencia para comparar curvas de entrenamiento y comportamiento de self-play en microduck.
- Demostración de "Tug of War" con microduck: la política está entrenada específicamente para partidos de taza, por lo que puede usarse en exhibiciones o vídeos de la competición.
- Base para fine-tuning o destilación: al estar en ONNX y seguir el manifiesto schema 2, puede servir como punto de partida para entrenar variantes de la misma tarea.
- Pruebas de integración del daemon `robotctl`: útil para validar el flujo de carga de políticas en una ranura y el consumo de observaciones en crudo.
- Benchmark de latencia en el bucle de control a 50 Hz: permite medir el coste de inferencia ONNX en el hardware del robot.
- Reproducción de experimentos de self-play: aunque el checkout tenía cambios sin commitear, el checkpoint 9800 permite replicar el comportamiento observado en el paper o repo de `microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control pequeña (61→14), es probable que quepa en CPU, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por la dimensionalidad de entrada/salida es plausible, pero no hay datos.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`), cargado mediante el daemon `robotctl` del ecosistema microduck.
- Latencia y throughput: no disponibles; el requisito de control es 50 Hz (20 ms por ciclo), pero no se documenta el tiempo de inferencia real.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de microduck comparables publicadas en Hugging Face con las que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido.
- El repositorio figura con tamaño 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el artefacto es extremadamente pequeño; conviene verificar la integridad antes de usarlo.
- El export se realizó desde un checkout con cambios sin commitear, por lo que la reproducibilidad exacta del entrenamiento no está garantizada.
- No hay información sobre sesgos, pero al ser una política RL entrenada en una tarea concreta, su comportamiento fuera de la distribución de entrenamiento (otras tareas, otros entornos) es impredecible.
- La política es "perpetua": si no se detiene explícitamente, sigue ejecutándose, lo que requiere supervisión en despliegues reales.
- No se documentan idiomas ni capacidades lingüísticas (no aplica), pero tampoco se documenta el dominio de observaciones más allá de la dimensionalidad.
- No hay datos de benchmarks ni de rendimiento en hardware real, lo que dificulta evaluar su idoneidad en producción.
- El pipeline declarado es `robotics`, no `text-generation`; no debe confundirse con un LLM.

## Enlaces

- Hugging Face: https://huggingface.co/azukiq/microduck-titan-v1
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot/daemon microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa en la información disponible).
