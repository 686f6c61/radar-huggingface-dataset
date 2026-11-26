# GinDuck/microduck-sprint-2m-sprint-1-e

## Resumen

microduck-sprint-2m-sprint-1-e es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje: se trata de una política de aprendizaje por refuerzo entrenada para generar una marcha perpetua (gait) que el robot ejecuta de forma continua hasta recibir una orden de parada. El modelo consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, y se distribuye como un grafo ONNX con el normalizador de observaciones ya integrado en el propio fichero.

La relevancia de esta ficha es acotada y muy específica: encaja en el ecosistema de retos de locomoción de microduck (tarea `Mjlab-Sprint2m-MicroDuck`) y se carga directamente en una ranura de política del demonio `robotctl`. El autor reporta que la política completa el recorrido en las cinco pruebas que realizó, sin batir récords de velocidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB, lo que sugiere un artefacto muy pequeño (coherente con una política de una red neuronal de pocos miles de parámetros).

No se dispone de información sobre licencia, idiomas ni parámetros totales en la model card ni en los metadatos de Hugging Face. Todo lo que sigue se limita a lo declarado por el autor; los datos no disponibles se marcan explícitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal) exportada a ONNX; arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint | 2750 |
| Semilla | 1 |
| Entornos paralelos de entrenamiento | 4096 |
| Iteraciones máximas | 3000 |
| Base de simulación | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Commit del repo de entrenamiento | `dc73b9237` (rama `main`) |
| Fecha de inicio del entrenamiento | 2026-11-01T08:27:21Z |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando el framework mjlab (basado en MuJoCo, a juzgar por el nombre y el ecosistema de microduck) sobre el repositorio `pollen-robotics/microduck-challenges`. El entrenamiento se lanzó con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard, sobre la tarea `Mjlab-Sprint2m-MicroDuck`. El checkpoint publicado corresponde a la iteración 2750. La arquitectura concreta de la red (número de capas, unidades, si es MLP u otra) no se detalla en la model card.

La innovación práctica destacable es de ingeniería de despliegue: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El artefacto se acompaña de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas microduck (documentado en `docs/policy-manifest.md` del repositorio del demonio). El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda perpetua: genera una marcha continua a 50 Hz que el robot ejecuta hasta que se le ordena parar.
- Política de marcha estable: según el autor, completa el recorrido en las cinco pruebas realizadas, manteniéndose erguido en todo momento.
- Integración directa con el demonio de microduck mediante `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-1-e`.
- Observaciones en bruto: el normalizador va embebido en el ONNX, sin necesidad de pipeline de preprocesado en el host.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio: es una política de control motor, no un modelo generativo.

## Casos de uso

- Ejecución de la marcha en el robot microduck real: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma continua en pruebas de locomoción.
- Participación en los retos y competiciones de microduck (Arena races y cups): la política está entrenada específicamente para la tarea `Mjlab-Sprint2m-MicroDuck`, por lo que es adecuada como participante en dichos eventos.
- Referencia base para comparar políticas: al ser una política perpetua que completa el recorrido de forma estable, sirve como línea base frente a políticas más rápidas pero menos fiables.
- Validación del pipeline de despliegue de microduck: útil para verificar el flujo `manifest.json` + `policy.onnx` + `robotctl` en un robot o en simulación antes de entrenar políticas propias.
- Reproducción de experimentos de RL: el autor documenta el comando exacto de entrenamiento, lo que permite reproducir una política comparable y estudiar la variabilidad entre ejecuciones.
- Docencia y experimentación en robótica con RL: un artefacto pequeño y de código abierto (sujeto a la licencia, no disponible) para ilustrar el ciclo completo simulación-entrenamiento-despliegue en un cuadrúpedo de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es cualitativo: la política completó el recorrido en las cinco pruebas realizadas, sin ser un récord de velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que indica un artefacto muy pequeño que probablemente quepa en cualquier GPU e incluso en CPU.
- GPU recomendadas: no disponibles; por el tamaño del artefacto, no se requieren GPU de datacenter (A100, H100) para la inferencia.
- ¿Cabe en GPU de consumo? Con alta probabilidad sí, dado el tamaño del repositorio, aunque no se especifica el hardware mínimo.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el demonio `robotctl` de microduck mediante `robotctl policy load`.
- Latencia y throughput: no disponibles; la política opera a 50 Hz (periodo de 20 ms por paso de control), pero no se publican medidas de latencia reales.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables de microduck con las que contrastar parámetros, contexto o rendimiento. La comparación con modelos de lenguaje no aplica por la naturaleza del artefacto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generación de texto, código, razonamiento ni tareas cognitivas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Rendimiento declarado únicamente de forma cualitativa y por el propio autor (cinco pruebas), sin métricas publicadas de velocidad, estabilidad o tasa de éxito.
- Entrenamiento no bit-reproducible: la reproducción con la misma semilla genera una política comparable, no los mismos pesos.
- Dependencia del ecosistema microduck: la política está acoplada a la tarea `Mjlab-Sprint2m-MicroDuck`, al esquema 2 del manifiesto y al demonio `robotctl`; no es portable a otros robots sin reentrenamiento.
- Sin información sobre sesgos, alucinación o limitaciones de idioma, por no ser aplicables a este tipo de artefacto.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-1-e
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Aplicación QuackPack (seguimiento de carreras y copas): https://www.imundo.ch/quackpack/
