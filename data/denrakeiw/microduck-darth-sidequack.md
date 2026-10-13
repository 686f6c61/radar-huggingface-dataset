# DenRakEiw/microduck-darth-sidequack

## Resumen

Darth-sidequack es una política de control para el robot cuadrúpedo microduck, publicada por el usuario DenRakEiw en HuggingFace. No es un modelo de lenguaje ni un modelo generativo: se trata de un controlador entrenado mediante aprendizaje por refuerzo que produce una marcha (gait) continua y perpetua, es decir, se ejecuta indefinidamente hasta que se le indique lo contrario. La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que corresponde al número de articulaciones actuadas del microduck.

El interés de esta ficha es limitado pero específico: es un artefacto reproducible dentro del ecosistema microduck de Pollen Robotics. La model card documenta el identificador de tarea (`Mjlab-Sprint2m-MicroDuck`), el repositorio de origen, el commit exacto, la semilla y el checkpoint utilizado, además del comando completo de entrenamiento. Esto la convierte en una referencia útil para investigación en locomoción con RL y para comparar políticas dentro del mismo banco de pruebas.

La relevancia práctica es acotada: la información pública disponible es muy escasa (0 descargas, 0 likes, licencia no declarada, sin idiomas, sin benchmarks) y el repositorio ocupa menos de 0,1 GB. Cualquier evaluación seria del rendimiento de la política requiere ejecutarla en simulación o en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo; el detalle de la red no se especifica en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robotico, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2 del manifiesto de politicas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Normalizador de observaciones | integrado en `policy.onnx` (se alimentan observaciones en crudo) |
| Tamano del repositorio | menos de 0,1 GB |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red. Lo que sí documenta es el procedimiento de entrenamiento: la política se ha entrenado con `mjlab-microduck 0.1.0` (commit `8d0dbc94c`), sobre la tarea `Mjlab-Sprint2m-MicroDuck`, dentro del repositorio `pollen-robotics/microduck-challenges`, rama `denrakeiw`, commit `76e5b3fa1`. El entrenamiento arrancó el 2026-10-13T15:16:13Z con semilla 1 y el artefacto publicado corresponde al checkpoint `2099`.

La configuración de entrenamiento indicada en el comando de reproducción usa 4096 entornos en paralelo, un máximo de 500 iteraciones y guardado cada 50 iteraciones, con registro en TensorBoard. El propio autor advierte que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no los mismos pesos. Como innovación técnica destacable, el normalizador de observaciones está embebido en el grafo ONNX, de modo que el consumidor de la política no necesita replicar la lógica de normalización. No se especifica en la información disponible si se empleó PPO u otro algoritmo, ni la composición del dataset o el uso de fases de ajuste tipo RLHF/DPO, que en este dominio no aplican.

## Capacidades

- Locomoción continua del microduck: genera una marcha perpetua a 50 Hz que se mantiene activa hasta que se descarga la política.
- Control de 14 actuadores a partir de un vector de observación de 61 dimensiones.
- Tarea específica de sprint de 2 metros (`Mjlab-Sprint2m-MicroDuck`), orientada a desplazamiento rápido.
- Integración directa con el daemon del robot mediante `robotctl policy load <slot> DenRakEiw/microduck-darth-sidequack`.
- Normalización de observaciones incluida en el modelo, lo que simplifica la integración en el bucle de control.
- Despliegue en formato ONNX, compatible con runtimes ONNX estándar.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.
- No dispone de modo de razonamiento multi-paso ni soporte de agentes.

## Casos de uso

- Locomoción de un microduck en laboratorio: cargar la política en un slot del daemon y dejar que el robot ejecute la marcha de sprint de forma indefinida mientras se registran datos de sensores para analizar estabilidad y consumo.
- Reproducción de experimentos de RL: usar el commit, la semilla y el comando documentados para volver a entrenar la misma tarea y comparar la política resultante con este checkpoint en igualdad de condiciones.
- Línea base en investigación de locomoción: emplear esta política como referencia de rendimiento al evaluar variaciones de recompensa, arquitectura o número de entornos en `microduck-challenges`.
- Docencia en robótica y aprendizaje por refuerzo: el flujo completo (clonar repositorio, `uv sync`, entrenar, cargar la política en el robot) es un ejercicio cerrado y reproducible para prácticas de laboratorio.
- Capa de bajo nivel en control jerárquico: usar esta marcha como primitiva de locomoción sobre la que apilar una política de alto nivel que decida dirección o velocidad mediante consignas de observación.
- Pruebas de sim-to-real: comparar el comportamiento de la política entrenada en simulación con su ejecución en el robot físico a 50 Hz para cuantificar la brecha de transferencia.
- Participación en retos microduck: la tarea `Mjlab-Sprint2m-MicroDuck` y el repositorio de challenges están pensados para comparar políticas entre participantes, por lo que este artefacto sirve como entrada válida en ese contexto.
- Validación de infraestructura de despliegue: verificar que el pipeline `robotctl` + manifiesto de esquema 2 carga correctamente políticas ONNX con normalizador embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de éxito en la tarea de sprint de 2 metros ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato oficial. Dado que se trata de una política de control con 61 entradas y 14 salidas en formato ONNX y un repositorio de menos de 0,1 GB, es razonable esperar que la inferencia se ejecute en CPU sin GPU dedicada, pero esto es una estimación, no un dato confirmado por el autor.
- GPU recomendadas para inferencia: no disponible; no se documenta ningún requisito de GPU para ejecutar la política en el robot.
- GPU para entrenamiento: no disponible como requisito explícito. La configuración de referencia usa 4096 entornos paralelos en `mjlab`, lo que en la práctica exige GPU de clase centro de datos, aunque no se especifica modelo ni memoria mínima.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es el daemon del robot microduck mediante `robotctl policy load`. Al ser un artefacto ONNX, también puede ejecutarse con cualquier runtime ONNX estándar, aunque esto no está documentado por el autor.
- Latencia y throughput: no disponibles. El único dato temporal conocido es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que es una propiedad de la tarea, no una medición de latencia del modelo.

## Comparativa con modelos similares

No se dispone de datos públicos suficientes para establecer una comparativa cuantitativa. La categoría natural de comparación son otras políticas del repositorio `pollen-robotics/microduck-challenges`, pero no se han proporcionado nombres, métricas ni especificaciones de esas alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DenRakEiw/microduck-darth-sidequack | no disponible | observacion de 61 dimensiones, 50 Hz | no disponible | no disponible | HuggingFace, 0 descargas |
| Otras politicas de microduck-challenges | no disponible | no disponible | no disponible | no disponible | repositorio upstream |
| Alternativas de locomocion cuadrupeda (por ejemplo, politicas de ANYmal o Unitree) | no disponible | no disponible | no disponible | no disponible | no comparable directamente por diferir en morfologia y espacio de acciones |

La comparación directa con políticas de otros cuadrúpedos no es metodológicamente válida sin reentrenar sobre el mismo robot, ya que el número de articulaciones, la morfología y el espacio de observación difieren.

## Limitaciones y advertencias

- La licencia no está declarada en HuggingFace, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere aclarar este punto con el autor.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia pública de validación por terceros ni de despliegue real en hardware.
- No hay benchmarks, métricas de recompensa ni tasas de éxito publicadas; el rendimiento real de la marcha es desconocido.
- La política es específica para la tarea `Mjlab-Sprint2m-MicroDuck` y para la morfología del microduck: no es transferible a otros robots sin reentrenamiento.
- Al ser una política perpetua, no incorpora criterios propios de parada; la seguridad depende enteramente del daemon y del operador que la descarga.
- El entrenamiento no es reproducible bit a bit, según advierte el propio autor, por lo que no puede garantizarse la recuperación exacta del artefacto.
- Existe una inconsistencia en la model card: el comando de reproducción carga `model_1600.pt` mientras que el checkpoint declarado como publicado es `2099`. Conviene verificarlo antes de intentar reproducir resultados.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre el modelo; los resultados obtenidos no guardan relación con el artefacto y se han descartado.
- No se documenta el comportamiento de la política ante perturbaciones, terrenos irregulares o fallos de actuador, escenarios críticos en robótica de producción.
- Al no soportar lenguaje ni visión, no puede integrarse en flujos de trabajo basados en instrucciones en lenguaje natural sin una capa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-darth-sidequack
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento declarado: `76e5b3fa1` en la rama `denrakeiw` de `microduck-challenges`
- Base de entrenamiento declarada: `mjlab-microduck 0.1.0 @ 8d0dbc94c`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada por el autor)
- Paper, blog o demo adicionales: no disponible; la búsqueda web no devolvió ninguna fuente técnica relacionada con este modelo.
