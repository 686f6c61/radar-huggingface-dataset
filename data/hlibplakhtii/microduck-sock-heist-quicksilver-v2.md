# HlibPlakhtii/microduck-sock-heist-quicksilver-v2

## Resumen

microduck-sock-heist-quicksilver-v2 es una política de control robótico para el simulador Microduck, desarrollada por HlibPlakhtii como un "remix" de competición sobre el modelo jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e, que a su vez deriva de rumezhak/microduck-sock-heist-composite-v4. No se trata de un modelo de lenguaje, sino de un controlador entrenado para resolver la tarea "Sock Heist" dentro de la Arena de Pollen Robotics, exportado en formato ONNX y consumido mediante la librería `microduck`.

El modelo combina la política heredada del base con una capa de búsqueda de observaciones ("observation lookup"): para observaciones coincidentes con las registradas durante la optimización local, se aplica una secuencia de acciones precalculada (semilla 5); para el resto, se delega en el controlador heredado. El autor reporta una evaluación completa en la Arena con 5/5 finalizaciones y un tiempo total de 4,886 s, ligeramente inferior al base directo (4,887 s).

Es relevante como ejemplo de optimización in-sample sobre entornos simulados y de prácticas de atribución en cadenas de fine-tuning, así como por su infraestructura de búsqueda con caché de prefijos fijos. El autor advierte explícitamente que no constituye evidencia de locomoción general ni de idoneidad para un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control robótico (red neuronal) para el simulador Microduck; topología exacta no disponible |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~6M, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; exportado en ONNX |
| Idiomas soportados | no aplica |
| Licencia | no disponible (el autor no declara licencia nueva; se preservan los términos upstream en NOTICE y BASE_MODEL_CARD.md) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (capas, dimensiones, tipo de encoder de observaciones). Se sabe que es una política de control entrenada para el entorno Microduck y que el modelo base pertenece a la familia "6m-fce-v4x" de jrubiosainz, con contribuciones de red upstream de lphatnguyen y linaje de walker de a1rb4Ck y juicenv. El pipeline declarado es `robotics` y la librería de inferencia es `microduck`.

El proceso de construcción descrito por el autor consiste en una búsqueda de cambios en los objetivos articulares (joint targets) sobre el composite-v4 fijado por rumezhak, incluyendo combinaciones de cambios de coordenadas beneficiosos y un pulso final de pitch de cadera derecha. La moción resultante para la semilla 5 se superpone sobre la mejora de semilla 4 de jrubiosainz. Durante la búsqueda se empleó una caché de prefijos fijos que acelera candidatos con acciones de prefijo idénticas, manteniendo las comprobaciones del árbitro oficial y restaurando el estado completo de MuJoCo y de los servos antes de las acciones modificadas; diecisiete comparaciones (finalizaciones, caídas y capturas de semáforo en rojo) coincidieron exactamente con la simulación completa. La caché no forma parte del modelo exportado ni del scoring oficial.

## Capacidades

- Ejecución de la tarea "Sock Heist" en el simulador Microduck: el modelo genera secuencias de acciones articulares para completar la tarea en los arranques de simulación declarados.
- Superposición selectiva por observación: aplica acciones optimizadas cuando la observación coincide con las registradas y delega en el controlador heredado en caso contrario.
- Finalización verificada: 5/5 finalizaciones en la evaluación completa de la Arena (runner 5, command 0.2).
- Integración con el runner oficial: se reconstruye mediante `searched-actions.npz`, el runner ordinario de Sock Heist y la función `overlay()` sobre el base fijado.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación en optimización de políticas en simulación: el modelo sirve como caso de estudio de búsqueda de acciones con caché de prefijos y verificación contra el árbitro oficial, reproducible a partir de los artefactos incluidos.
- Reproducción de resultados de competición: los ficheros de acciones finales e iniciales, el código e historial de búsqueda, la configuración de rebase y la procedencia fijada permiten reconstruir la superposición exacta sobre el base.
- Evaluación de técnicas de superposición por lookup: útil para estudiar cómo una capa de memorización de observaciones mejora marginalmente el tiempo de finalización (4,886 s frente a 4,887 s del base) sin modificar el controlador subyacente.
- Benchmarking de pipelines de evaluación en la Arena de Pollen Robotics: el modelo ejemplifica el flujo completo de envío y validación con el servidor de la Arena como fuente autoritativa.
- Docencia sobre atribución en cadenas de fine-tuning: BASE_MODEL_CARD.md y NOTICE preservan la atribución upstream y el alcance de los términos, sin reclamar nueva licencia ni propiedad.
- Pruebas de integración de la librería `microduck` y del formato ONNX en entornos de simulación robótica.
- No es adecuado para despliegue en robot físico ni para tareas de locomoción general, según advierte el propio autor.

## Benchmarks y rendimiento

| Métrica | microduck-sock-heist-quicksilver-v2 | Base directo (jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e) |
|---|---|---|
| Tiempo total Arena (runner 5, command 0.2) | 4,886 s | 4,887 s |
| Finalizaciones | 5/5 | no disponible en detalle |
| Tiempos individuales | 4,800 / 5,155 / 4,750 / 4,800 / 4,925 s | no disponible |
| Mejor semilla 5 | 4,930 s (base) frente a mejora superpuesta | 4,930 s |

Los resultados proceden de la evaluación completa de la Arena reportada por el autor; el resultado del servidor de la Arena es el autoritativo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es 0,0 GB y el modelo se distribuye en ONNX, por lo que la huella es muy reducida.
- GPU recomendadas: no disponibles; al ser una política de control de pequeño tamaño, la inferencia puede ejecutarse en CPU o en GPU de gama baja, aunque no se especifican requisitos oficiales.
- ¿Cabe en GPU de consumo? No hay datos oficiales, pero por el tamaño del artefacto es altamente probable que sí en cualquier GPU de consumo; no confirmado.
- Opciones de despliegue: librería `microduck` con pesos ONNX; compatible con runtimes ONNX estándar (ONNX Runtime) según el formato exportado.
- Latencia y throughput: no disponibles; los tiempos reportados (4,886 s totales en 5 episodios) corresponden a la simulación completa, no a la latencia de inferencia aislada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-quicksilver-v2 (HlibPlakhtii) | no disponible (~6M según nombre del base) | no aplica | 4,886 s, 5/5 finalizaciones | no disponible | Hugging Face, ONNX |
| jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e | ~6M (según nombre) | no aplica | 4,887 s (base directo) | no disponible | Hugging Face |
| rumezhak/microduck-sock-heist-composite-v4 | no disponible | no aplica | no disponible | no disponible | Hugging Face |

La comparativa se limita al linaje directo del modelo; no se dispone de datos de rendimiento de otras políticas comparables en la información proporcionada.

## Limitaciones y advertencias

- Optimización in-sample: el modelo está ajustado a los arranques de simulación declarados y no constituye evidencia de locomoción general.
- No apto para robot físico: el autor advierte explícitamente que no hay evidencia de idoneidad para un robot real.
- Mejora marginal: la diferencia frente al base directo es de 1 ms en el total (4,886 s frente a 4,887 s), dentro del ruido de la evaluación.
- Dependencia del lookup: fuera de las observaciones registradas, el comportamiento se delega en el controlador heredado, por lo que la generalización es la del base.
- Licencia no disponible: no se declara licencia nueva; los términos upstream se preservan en NOTICE y BASE_MODEL_CARD.md, lo que exige revisar dichos documentos antes de cualquier uso comercial.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican al no ser un modelo de lenguaje, pero tampoco se documentan sesgos de política de control.
- Caché de búsqueda no exportada: la caché de prefijos fijos usada durante la búsqueda no forma parte del modelo ni del scoring oficial, por lo que no es reproducible como parte de la inferencia.
- Resultado autoritativo en el servidor de la Arena: cualquier reproducción local debe contrastarse con dicho servidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v2
- Modelo base: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e
- Linaje composite-v4: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v4
- Pollen Robotics (Microduck y Arena): no disponible en la información proporcionada
