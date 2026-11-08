# dashi/microduck-roller-daily-20261107

## Resumen

`dashi/microduck-roller-daily-20261107` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un fichero de pesos en formato ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensado para ejecutarse en el bucle de control del robot sobre ruedas (rollers). El autor, dashi, lo publica como reentrada diaria de su política previa `microduck-roller-remix-r900` (con recompensa 0.900) y como fine-tuning de `DenRakEiw/microduck-senate_duck_0904`.

La relevancia de esta ficha es acotada: se trata de un artefacto de experimentación con cero descargas y cero likes en el momento de la consulta, sin model card extensa ni benchmarks publicados. Su interés técnico reside en el pipeline de entrenamiento RL (`pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`) y en el formato de despliegue: un `policy.onnx` con el normalizador de observaciones embebido y un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck.

La política es "perpetua": genera una marcha continua para el slot `walk` hasta que se le indique lo contrario. No hay información sobre arquitectura de red, número de parámetros, licencia ni idiomas, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control RL exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX; se desconoce si hay versiones cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (fine-tune) |
| Libreria | `microduck` |
| Tamano del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la topología de la red (número de capas, tipo de encoder, función de activación ni tamaño de las capas ocultas). Lo que sí se documenta es el pipeline de entrenamiento: aprendizaje por refuerzo sobre el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. La política se entrena para locomoción sobre ruedas (rollers) y se exporta a ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El modelo es un fine-tune de `DenRakEiw/microduck-senate_duck_0904` y se describe como "reentrada diaria" de `dashi/microduck-roller-remix-r900`, con una recompensa reportada de 0.900 en esa política previa. No se especifican el número de pasos de entrenamiento, la composición del dataset (generado por simulación, presumiblemente), ni si se aplicaron técnicas de regularización como domain randomization. Tampoco hay información sobre decodificación especulativa, atención lineal ni otras innovaciones, ya que no aplican a este tipo de artefacto.

## Capacidades

- Generación de una marcha continua ("perpetua") para el robot microduck equipado con rollers, en el slot `walk`.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Normalización de observaciones embebida en `policy.onnx`: acepta observaciones en bruto.
- Despliegue mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261107`.
- Compatibilidad con el esquema 2 del manifiesto de políticas del daemon de microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo thinking: es una política de control motor, no un modelo generativo.

## Casos de uso

- Locomoción autónoma del microduck sobre rollers en laboratorio: cargar la política en el slot `walk` permite al robot desplazarse de forma continua sin intervención, útil para pruebas de resistencia y caracterización del gait.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: sirve como punto de partida (fine-tune) sobre `DenRakEiw/microduck-senate_duck_0904` para experimentar con recompensas y currículos de entrenamiento en la rama `roll-backward`.
- Docencia y prototipado en robótica cuadrúpeda: al ser un artefacto ONNX pequeño y con normalizador embebido, se integra fácilmente en prácticas de control y despliegue en el daemon de microduck.
- Evaluación comparativa de políticas: la nomenclatura "daily" y la recompensa 0.900 de la política predecesora permiten trazar una línea base para comparar variantes diarias del mismo autor.
- Demostraciones de locomoción en ferias o eventos: la naturaleza perpetua del gait simplifica la puesta en escena, ya que no requiere episodios ni reseteos manuales.
- Integración en pipelines de CI para robótica: el manifest y el comando `robotctl` permiten automatizar la carga y validación de la política en entornos de prueba reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es la recompensa de 0.900 asociada a la política predecesora `dashi/microduck-roller-remix-r900`, que no es directamente comparable con métricas estándar (MMLU, HumanEval, GSM8K) por tratarse de una política de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es 0.0 GB y no se especifica el número de parámetros, aunque por la naturaleza del artefacto (política de control a 50 Hz) se espera que sea muy reducido.
- GPU recomendadas: no disponibles. La inferencia a 50 Hz sobre 61 observaciones y 14 acciones es viable en CPU en la mayoría de plataformas; no se documenta soporte GPU específico.
- Compatibilidad con GPU de consumo: no disponible, aunque por la carga computacional típica de estas políticas es probable que quepa en cualquier GPU de consumo e incluso en CPU, sin que el autor lo confirme.
- Opciones de despliegue: `robotctl policy load walk dashi/microduck-roller-daily-20261107` sobre el daemon de microduck; runtime ONNX estándar (no se especifica si ONNX Runtime, TensorRT u otro).
- Latencia y throughput: no disponibles; el único requisito documentado es el bucle de control a 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261107` | Política RL (ONNX) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| `dashi/microduck-roller-daily-20261102` | Política RL (ONNX) | no disponible | no aplica | no disponible | Hugging Face |
| `dashi/microduck-roller-daily-20261103` | Política RL (ONNX) | no disponible | no aplica | no disponible | Hugging Face |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes; la única referencia cuantitativa es la recompensa 0.900 de `dashi/microduck-roller-remix-r900`, predecesora directa de esta política.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser una política de control motor, los sesgos relevantes serían de comportamiento (por ejemplo, asimetrías de marcha), no documentados por el autor.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de comportamientos no previstos o inestabilidad del gait fuera del dominio de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la política no procesa lenguaje ni tiene ventana de contexto.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no puede asumirse uso comercial sin contactar con el autor.
- Ausencia de model card detallada: no se documentan arquitectura, número de parámetros, datos de entrenamiento ni métricas de evaluación, lo que dificulta la reproducibilidad.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Dependencia del ecosistema microduck: el despliegue requiere el daemon y el comando `robotctl`, además del hardware específico (microduck sobre rollers).
- Naturaleza "perpetua": la política se ejecuta hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura en producción.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261107
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Política predecesora citada: `dashi/microduck-roller-remix-r900` (referenciada en la model card, sin URL directa en la información disponible)
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (referenciado en la model card)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
- Variantes diarias relacionadas: https://huggingface.co/dashi/microduck-roller-daily-20261102 y https://huggingface.co/dashi/microduck-roller-daily-20261103
