# dhelleberg/microduck-sprint-2m-run-1024-1006

## Resumen

`dhelleberg/microduck-sprint-2m-run-1024-1006` no es un modelo de lenguaje: es una política de locomoción entrenada por refuerzo para el robot bípedo Microduck de Pollen Robotics, publicada en HuggingFace dentro del pipeline `robotics` y exportada a ONNX. La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se ejecuta en el robot como un gait perpetuo (sin condición de terminación) cargado en una de las ranuras de política del demonio `robotctl`. El autor la describe escuetamente como "first try".

El interés práctico está en que sirve como artefacto reproducible del reto `sprint_2m` del Microduck Arena: la model card documenta `task_id` (`Mjlab-Sprint2m-MicroDuck`), repositorio (`pollen-robotics/microduck-challenges`), commit (`294e2be93`), semilla (`1`), checkpoint (`250`) y la base de entrenamiento (`mjlab-microduck 0.1.0 @ 8d0dbc94c`), además del comando exacto de reproducción con 4096 entornos paralelos y `max-iterations 3000`.

Es relevante ahora por dos motivos: el reto `sprint_2m` forma parte de un circuito público de comparación de políticas para un robot de bajo coste, y el formato de entrega (ONNX con el normalizador de observaciones embebido más un `manifest.json` conforme al esquema 2) fija un patrón de despliegue de políticas de RL en hardware real. Al no haber métricas publicadas ni licencia declarada, debe tratarse como un experimento de referencia y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL exportada a ONNX; la model card no especifica la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un `policy.onnx` ya exportado; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: la entrada es un vector de observaciones, no texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada; sin condición de terminación aprendida) |
| Libreria declarada | `microduck` |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24T08:28:15Z |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, anchura, activaciones ni si hay memoria recurrente), solo el contrato de entrada/salida: 61 observaciones crudas de entrada y 14 acciones de salida a 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar. La política es de tipo perpetuo: no aprende una condición de terminación, sino que mantiene la marcha indefinidamente hasta que el daemon la descarga de su ranura.

El entrenamiento se realizó con el pipeline `mjlab` sobre el reto `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `294e2be93`), partiendo de `mjlab-microduck 0.1.0 @ 8d0dbc94c`, con semilla 1 y checkpoint 250. El comando de reproducción documentado usa 4096 entornos paralelos, `--agent.max-iterations 3000`, logger de TensorBoard y nombre de ejecución `run-1024-1006`. El autor advierte explícitamente de que el entrenamiento por RL con GPU no es reproducible bit a bit entre máquinas: repetir la receta produce una política comparable, no los mismos pesos. No se documentan en la información disponible el número de tokens, la composición del dataset, ni el uso de RLHF/DPO (categorías que, por otra parte, no aplican a una política de control).

## Capacidades

- Locomoción bípeda hacia adelante para el Microduck: política entrenada sobre la tarea de sprint de 2 m, que el Arena evalúa barriendo comandos de avance de 0,20 a 1,20 m/s en pasos de 0,05 m/s.
- Marcha continua sin terminación: al ser perpetua, mantiene el gait hasta que se le indique lo contrario, lo que simplifica la integración con el daemon.
- Control a 50 Hz con 14 acciones y 61 observaciones, el contrato nativo del stack de políticas de microduck.
- Normalización de observaciones integrada en el modelo: acepta observaciones crudas del robot sin capa de preprocesado adicional.
- Despliegue mediante carga en una ranura de política con `robotctl` y manifiesto versionado (esquema 2).
- Exportación a ONNX, lo que permite inferencia con runtime de ONNX en lugar de requerir el framework de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Despliegue en el robot Microduck físico: cargar la política con `sudo robotctl policy load <slot> dhelleberg/microduck-sprint-2m-run-1024-1006` y dejar que el robot ejecute el gait de sprint de forma continua sobre la superficie de prueba.
- Participación en el reto `sprint_2m` del Microduck Arena: presentar esta política como candidata y medirla con el protocolo oficial (tres velocidades preseleccionadas, cinco arranques, mejor media, 50 segundos de penalización por caída o tiempo agotado).
- Línea base para comparación de recetas de entrenamiento: al estar documentados commit, semilla y checkpoint, sirve para contrastar variantes del pipeline `mjlab` frente a la referencia oficial `pollen-robotics/microduck-sprint-2m-reference`.
- Depuración del stack de simulación a realidad: útil para verificar el contrato de 61 observaciones y 14 acciones del daemon antes de entrenar políticas propias más elaboradas.
- Iteración rápida en laboratorio con hardware de bajo coste: el tamaño reducido del artefacto permite distribuir la política a varias unidades del robot sin infraestructura de serving.
- Docencia y prototipado en robótica con RL: ejemplo completo y reproducible de un pipeline de entrenamiento masivamente paralelo (4096 entornos) hasta la exportación ONNX y la carga en robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de velocidad alcanzada, tasa de caídas, distancia recorrida ni puntuación del Arena para esta política concreta.

Como contexto del protocolo de evaluación (no como resultado de este modelo), la documentación del reto `sprint_2m` indica que el Arena barre comandos de avance de 0,20 a 1,20 m/s en pasos de 0,05 m/s, prueba tres velocidades preseleccionadas sobre cinco arranques y conserva la mejor media, contabilizando cada caída o tiempo agotado como 50 segundos.

## Requisitos de hardware

- VRAM para inferencia: no aplica en sentido estricto; el artefacto es un `policy.onnx` de una política de control de dimensión pequeña (el repositorio de la referencia equivalente ocupa 5,65 MB, con un `checkpoint.pt` de 4,85 MB). No se dispone del tamaño exacto de `policy.onnx` en la información proporcionada.
- GPU recomendadas: no disponibles para inferencia (no se requiere GPU); para reentrenamiento, la model card solo indica 4096 entornos paralelos, sin especificar el modelo de GPU utilizado.
- Cabe en GPU de consumo: sí, cualquier GPU de consumo es sobredimensionada para la inferencia; el cómputo cabe holgadamente en CPU.
- Opciones de despliegue: ONNX Runtime sobre la CPU del robot y el daemon `robotctl` con carga en ranura de política. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz (periodo de 20 ms), que fija el presupuesto máximo por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Entrenamiento | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dhelleberg/microduck-sprint-2m-run-1024-1006` | Política de locomoción RL (perpetua) | 61 / 14 a 50 Hz | `Mjlab-Sprint2m-MicroDuck`, commit `294e2be93`, semilla 1, checkpoint 250 | ONNX + `manifest.json` | no disponible | HuggingFace, 0 descargas |
| `pollen-robotics/microduck-sprint-2m-reference` | Política de locomoción RL (perpetua) | no disponible en la información recogida | Receta del reto sin cambios: 4096 entornos, 3000 iteraciones, semilla 1 | `checkpoint.pt` (4,85 MB) + README | no disponible | HuggingFace, referencia oficial del Arena |
| `mjlab-microduck 0.1.0` | Base de entrenamiento (entorno y receta) | no aplica | no aplica | código / paquete | no disponible | Repositorio `microduck-challenges` |

La comparación relevante es frente a la referencia oficial: ambas afirman partir de la misma receta (4096 entornos, 3000 iteraciones, semilla 1), pero esta ficha registra checkpoint 250 y formato ONNX, mientras que la referencia publica `checkpoint.pt`. No hay datos de rendimiento que permitan ordenarlas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, imágenes ni audio, y no admite tool calling ni razonamiento multi-paso.
- Sin métricas publicadas: no hay evidencia en la información disponible de que esta política supere, iguale o empeore a la referencia oficial del reto `sprint_2m`.
- La propia model card la etiqueta como "first try", y el checkpoint registrado es 250, mientras que el comando de reproducción apunta a `max-iterations 3000`; conviene verificar en el `manifest.json` el estado real de convergencia antes de usarla.
- Licencia no disponible: no se puede asumir permiso de uso comercial, redistribución ni modificación. Cualquier uso en producto requiere aclaración previa con el autor.
- Idiomas no aplicables, pero sí hay una limitación de dominio: la política está especializada en una única tarea (sprint de 2 m) y en el hardware Microduck; no se documenta su robustez ante cambios de superficie, carga o desgaste de actuadores.
- Entrenamiento no reproducible bit a bit (advertencia explícita del autor): los pesos no se pueden regenerar de forma idéntica, lo que complica la auditoría y la comparación fina entre ejecuciones.
- Naturaleza perpetua del gait: al no tener condición de terminación aprendida, la seguridad depende de la supervisión externa y de los límites del daemon; una caída no detiene la política por sí misma.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Sin datos de sesgos: no se ha publicado ningún análisis de sesgos ni de comportamiento en condiciones extremas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhelleberg/microduck-sprint-2m-run-1024-1006
- Referencia oficial del reto (HuggingFace): https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Ficheros de la referencia: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference/tree/main
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y receta de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del reto `sprint_2m` en el Arena: https://github.com/pollen-robotics/microduck-arena/blob/main/docs/guides/challenges/sprint-2m.md
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` del repositorio del daemon de microduck
- Sitio del producto Microduck: https://microducks.org/
