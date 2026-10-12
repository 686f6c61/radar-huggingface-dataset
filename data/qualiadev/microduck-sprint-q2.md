# qualiadev/microduck-sprint-q2

## Resumen

microduck-sprint-q2 es una política de control (policy) entrenada por el usuario qualiadev para el robot educativo microduck de Pollen Robotics, un cuadrúpedo de pequeño tamaño orientado a robótica de bajo coste. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una red neuronal de control que recibe un vector de observación de 61 dimensiones y emite 14 acciones de actuación, ejecutada en bucle cerrado a 50 Hz sobre el hardware del robot.

El modelo se publica como un artefacto de inferencia en formato ONNX (`policy.onnx`) acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Según la model card, la normalización de observaciones está integrada dentro del propio grafo ONNX, de modo que el consumidor debe alimentar observaciones en bruto. Su comportamiento descrito es "perpetuo": la política no tiene condición de terminación interna, sino que ejecuta una marcha continua hasta que se detiene externamente.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: la información publicada es mínima (la model card ocupa unas pocas líneas), el repositorio pesa 0.0 GB según los metadatos de HuggingFace y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. No hay especificación de arquitectura de red, número de parámetros, licencia ni idiomas, por lo que la mayor parte de los campos técnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica entrenada por refuerzo; topologia concreta no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no aplica (politica de control reactiva; observacion de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Libreria de carga | `microduck` |
| Pipeline declarado | robotics |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red. Los únicos datos verificables son los dimensionales: 61 entradas de observación y 14 salidas de acción, ejecutadas a 50 Hz. El tag `reinforcement-learning` y la referencia al repositorio de entrenamiento `pollen-robotics/microduck_rl` (rama `sprint/race`, commit `0141bf4a8`) indican que la política se obtuvo mediante aprendizaje por refuerzo, presumiblemente en simulación y con transferencia posterior al robot real, aunque el pipeline exacto no se documenta en el material disponible. Tampoco se publican número de tokens, composición de dataset, ni si hubo fases de ajuste adicionales tipo RLHF o DPO, que en este dominio no serían de aplicación directa.

El detalle técnico más relevante que sí aparece es de ingeniería de despliegue: el normalizador de observaciones está embebido en el grafo `policy.onnx`, lo que elimina una fuente habitual de discrepancias entre entrenamiento e inferencia y simplifica la integración con el daemon del robot. El `manifest.json` cumple el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que sugiere un mecanismo de carga estandarizado por slots de política (`robotctl policy load <slot>`). El carácter "perpetuo" de la política implica que la marcha se mantiene indefinidamente salvo intervención externa, un diseño típico en políticas de locomoción entrenadas con recompensas que penalizan la caída o la detención.

## Capacidades

- Locomoción continua del microduck: genera una marcha que se ejecuta sin condición de parada interna hasta que el operador la detiene.
- Control reactivo en bucle cerrado a 50 Hz a partir de un vector de observación de 61 dimensiones.
- Salida de 14 acciones de actuación, coherente con el espacio de control del robot microduck.
- Inferencia autocontenida en ONNX, con la normalización de observaciones integrada en el grafo.
- Carga mediante el daemon del robot a través de `robotctl policy load <slot>`, integrándose en el sistema de slots de política de microduck.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos especiales de inferencia (thinking, visión, audio). No aplican a este tipo de modelo.
- No se documenta ninguna capacidad de generalización más allá del entorno de entrenamiento declarado.

## Casos de uso

- Locomoción de referencia en el robot microduck: cargar la política en un slot mediante `robotctl policy load` permite al robot desplazarse de forma continua sin intervención, útil como comportamiento base sobre el que probar otras políticas.
- Docencia y talleres de robótica: al ser un artefacto ONNX pequeño y autocontenido, sirve para ilustrar el ciclo completo política entrenada, manifiesto y despliegue en hardware real en cursos de robótica o aprendizaje por refuerzo.
- Investigación en transferencia simulación-real: el repositorio de entrenamiento `microduck_rl` (rama `sprint/race`) permite reproducir o modificar el entrenamiento y comparar el resultado desplegado con la política publicada.
- Benchmark de infraestructura de control: al fijar observación, acciones y frecuencia (61-D, 14 acciones, 50 Hz), resulta adecuado para medir latencia de inferencia ONNX y estabilidad del lazo de control en distintas plataformas.
- Base para ajuste fino con nuevas recompensas: una política de marcha perpetua es un punto de partida razonable para entrenar variantes de velocidad, dirección o terreno en el mismo simulador.
- Demostraciones de despliegue con `robotctl`: sirve como caso de prueba para validar el esquema 2 de manifiestos y el flujo de carga por slots en el daemon.
- Evaluación comparativa de políticas en el mismo robot: al existir múltiples políticas publicadas bajo los mismos tags, permite enfrentarlas en condiciones idénticas de hardware y control.
- Uso comercial en producto: no recomendable sin confirmar la licencia, que no está publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha, distancia recorrida, robustez ante perturbaciones ni comparaciones con otras políticas de microduck. Los metadatos de HuggingFace tampoco aportan cifras de latencia o throughput. Cualquier número que se cite sobre el rendimiento de esta política tendría que obtenerse reproduciendo la carga en el robot o en el simulador del repositorio `microduck_rl`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 61 entradas y 14 salidas, cualquier red multicapa razonable ocupa del orden de kilobytes a unos pocos megabytes en disco; se trata de una estimación por las dimensiones del problema, no de un dato publicado.
- GPU recomendadas: no disponibles. Para una política de este tamaño, la inferencia en CPU es probablemente suficiente para sostener 50 Hz, pero el autor no documenta requisitos.
- GPU de consumo: no disponible. No hay información sobre si el autor la ejecuta en hardware de consumo, en el ordenador del robot o en un equipo externo.
- Opciones de despliegue: el camino documentado es el daemon del robot con `robotctl policy load <slot>`. Al ser ONNX, también es viable cargarla con ONNX Runtime u otros motores compatibles, aunque esto no está documentado por el autor.
- Latencia y throughput estimados: no disponibles. El único requisito temporal explícito es sostener el lazo de control a 50 Hz, es decir, un presupuesto de 20 ms por paso.
- Memoria del repositorio: 0.0 GB según los metadatos de HuggingFace, lo que indica un artefacto muy ligero.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de esta política ni de sus alternativas, por lo que no es posible establecer una comparación cuantitativa. Cualitativamente:

| Modelo | Parametros | Contexto / E-S | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualiadev/microduck-sprint-q2 | no disponible | 61-D obs. / 14 acciones a 50 Hz | no publicado | no disponible | HuggingFace, 0 descargas |
| Otras politicas de microduck en HuggingFace | no disponible | mismas dimensiones del robot | no publicado | no disponible | existen modelos con los mismos tags, sin datos comparativos |
| Politicas de locomotion para cuadrupedos genericos (por ejemplo, familias tipo legged_gym / Isaac) | no disponible | depende del robot | no comparable sin reproducir el entrenamiento | habitualmente permisivas en los repos de referencia | repositorios publicos de investigacion |

La comparación honesta es que no hay base publicada para afirmar que esta política sea mejor o peor que cualquier otra marcha para microduck.

## Limitaciones y advertencias

- Ausencia total de licencia publicada: no se puede asumir uso comercial, redistribución ni modificación permitidas.
- Model card mínima: no hay arquitectura, número de parámetros, datos de entrenamiento, semillas ni hiperparámetros, lo que impide auditar o reproducir el resultado sin acceso al repositorio de entrenamiento.
- Trazabilidad limitada a un commit concreto (`0141bf4a8` en la rama `sprint/race`); si esa rama cambia o desaparece, la reproducibilidad se degrada.
- Riesgo de sobreajuste al entorno de entrenamiento: al no publicarse datos de robustez, se desconoce el comportamiento ante terrenos, cargas o perturbaciones no vistas durante el entrenamiento.
- Comportamiento perpetuo: la política no se detiene por sí sola, por lo que en producción es imprescindible un mecanismo externo de parada y supervisión.
- Sin métricas: no hay evidencia publicada de estabilidad, consumo energético, desgaste de actuadores ni velocidad alcanzada.
- Cero adopción registrada (0 descargas, 0 likes): no existe validación por parte de terceros ni informes de fallos conocidos.
- Sesgos: en el sentido estadístico habitual no aplican, pero sí puede heredar sesgos del simulador y de la función de recompensa usados en el entrenamiento, que no se documentan.
- Alucinación: concepto no aplicable a una política de control; el riesgo equivalente es generar acciones incoherentes fuera de la distribución de observaciones vistas.
- Idioma: no aplica, no procesa texto.
- Las fechas de creación y actualización del repositorio aparecen como 2026-10-12, posteriores a la fecha habitual de consulta; conviene verificar los metadatos directamente en HuggingFace antes de citarlos.
- No se debe tratar este modelo como un modelo de lenguaje ni asumir capacidades de conversación, razonamiento simbólico o tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualiadev/microduck-sprint-q2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Especificacion del manifiesto de politicas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8` (no se ha proporcionado URL directa)
- Paper, blog o demo del autor: no disponible
