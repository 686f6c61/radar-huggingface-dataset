# RSanchez996/microduck-sock-heist-6m-2

## Resumen

sock-heist-6m-2 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo, publicado por el usuario RSanchez996 en HuggingFace, implementa una política perpetua (sin condición de terminación) que traduce observaciones de 61 dimensiones en 14 acciones de control a una frecuencia de 50 Hz. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un controlador neuronal especializado para locomoción y manipulación robótica.

La política se distribuye en formato ONNX dentro de un repositorio de tamaño prácticamente nulo (0.0 GB según HuggingFace), lo que sugiere un modelo de muy pocos parámetros, coherente con las políticas de control reactivo que se ejecutan en el propio robot o en un daemon de control. El modelo se carga en una ranura de política del daemon mediante el comando `robotctl policy load`, y el normalizador de observaciones está embebido en el propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa, ya que se trata de un artefacto de investigación en robótica con refuerzo, sin model card detallada sobre rendimiento, sin benchmarks publicados y sin información sobre licencia o idiomas. La información disponible en HuggingFace y en la model card es escasa y se limita a metadatos de entrenamiento y a instrucciones de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robótica, formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se trata de una política de aprendizaje por refuerzo entrenada con el framework `mjlab` (versión 0.1.0, commit `1efd853be`), sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `RSanchez996/microduck-challenges`. El entrenamiento se realizó con 4096 entornos paralelos, un máximo de 1000 iteraciones, semilla 12 y checkpoint 999, con registro en TensorBoard bajo el nombre de ejecución `run-1101-1219`.

La política es de tipo perpetuo: se ejecuta de forma continua hasta que se le indique lo contrario, lo que la hace adecuada para un comportamiento de marcha o gait sostenido. El espacio de observación es de 61 dimensiones y el de acciones de 14, a 50 Hz, lo que corresponde al interfaz de control del robot microduck. El autor advierte que el entrenamiento no es reproducible bit a bit entre máquinas, aunque con el mismo código, `uv.lock`, comando y semilla se obtiene una política comparable.

## Capacidades

- Control robótico de locomoción o manipulación para el robot microduck (61 observaciones, 14 acciones, 50 Hz).
- Política perpetua: se ejecuta de forma continua sin condición de terminación explícita.
- Normalización de observaciones integrada en el fichero ONNX, lo que simplifica la integración.
- Carga en el daemon del robot mediante `robotctl policy load <slot>`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No dispone de tool calling ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Locomoción autónoma del microduck: la política se carga en una ranura del daemon y se ejecuta a 50 Hz para generar un patrón de marcha continuo sobre el robot físico.
- Investigación en aprendizaje por refuerzo robótico: sirve como punto de partida reproducible (semilla 12, checkpoint 999) para comparar variantes de entrenamiento en la tarea `Mjlab-SockHeist6m-MicroDuck`.
- Despliegue en simulación con mjlab: permite validar el comportamiento de la política en el simulador antes de transferirla al robot real.
- Evaluación de pipelines de políticas ONNX en el daemon microduck: útil para probar la integración de `policy.onnx` y `manifest.json` (schema 2) en el flujo `robotctl`.
- Benchmarking interno de gait o comportamiento: al ser una política perpetua, puede usarse como referencia base frente a políticas con condiciones de terminación.
- Docencia y prototipado en robótica de bajo coste: el tamaño reducido del artefacto y el formato ONNX facilitan su ejecución en hardware modesto asociado al microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un modelo de muy pequeño tamaño.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, es plausible su ejecución en CPU o en GPU de gama baja, pero no hay datos que lo confirmen.
- ¿Cabe en GPU de consumo? No disponible; probablemente sí dado el tamaño del repositorio, pero sin confirmación oficial.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load <slot>`; ejecución de ONNX con runtimes estándar (ONNX Runtime, etc.), no confirmado en la documentación.
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card, lo que implica un presupuesto de 20 ms por paso de control.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de otros autores para el mismo robot o tarea.

## Limitaciones y advertencias

- Información muy escasa: no hay datos sobre arquitectura, número de parámetros, licencia ni idiomas.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Entrenamiento no reproducible bit a bit: el autor indica que repetir el entrenamiento produce una política comparable, no idéntica.
- Ámbito de aplicación restringido: solo válido para el robot microduck con su interfaz de 61 observaciones y 14 acciones a 50 Hz.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de robustez en el robot físico.
- Riesgo de comportamiento no deseado en dominios fuera de distribución: al ser una política de RL sin condiciones de terminación, puede mantener una marcha inadecuada si las observaciones se salen del régimen de entrenamiento.
- Sin información sobre sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero no hay evaluación de seguridad del comportamiento robótico.

## Enlaces

- HuggingFace: https://huggingface.co/RSanchez996/microduck-sock-heist-6m-2
- Repositorio de entrenamiento: https://github.com/RSanchez996/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
