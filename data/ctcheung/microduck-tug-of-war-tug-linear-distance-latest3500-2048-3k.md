# ctcheung/microduck-tug-of-war-tug-linear-distance-latest3500-2048-3k

## Resumen

`microduck-tug-of-war-tug-linear-distance-latest3500-2048-3k` es una política de control obtenida mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política perpetua entrenada para ejecutar una tarea de tira y afloja (tug-of-war) con desplazamiento lineal, empaquetada en formato ONNX y cargable directamente en un slot de política del daemon `robotctl` del robot. El autor del artefacto es el usuario de HuggingFace `ctcheung`.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz. La política se ejecuta de forma continua hasta que se le indica lo contrario, comportándose como una marcha o gait pregrabada. El artefacto incluye el normalizador de observaciones embebido en el propio fichero `policy.onnx`, por lo que la entrada debe ser la observación en crudo, sin preprocesado externo.

Por su naturaleza (política de robótica ligera, sin pesos de lenguaje, sin benchmarks publicados y con cero descargas), su relevancia es acotada: resulta útil como ejemplo reproducible de entrenamiento RL con el stack `mjlab-microduck`, pero no es un modelo generalista ni compite en las categorías habituales de esta ficha. La información disponible sobre arquitectura interna, licencia e idiomas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo (red neuronal exportada a ONNX); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (artefacto ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tarea | `Mjlab-TugOfWar-MicroDuck` (tira y afloja con desplazamiento lineal) |
| Checkpoint | 500 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La información pública no detalla la topología de la red (número de capas, anchura, activaciones ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena con el entorno `Mjlab-TugOfWar-MicroDuck` del repositorio `microduck-challenges`, sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`), con semilla fija 1 y checkpoint 500. El entrenamiento se ejecutó el 2026-11-01 desde un checkout con cambios sin commitear, lo que introduce una caveat de reproducibilidad.

El autor advierte explícitamente de que el proceso no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, el mismo commit (`4206cd842`) y la misma semilla produce una política comparable, no idéntica. El artefacto exportado incorpora el normalizador de observaciones dentro del ONNX, de modo que el consumidor alimenta observaciones crudas y el modelo aplica la normalización internamente. No se documentan detalles sobre composición del dataset (generado por simulación), uso de RLHF/DPO ni innovaciones de decodificación, ya que no aplican a este tipo de modelo.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck con 14 actuaciones y observación de 61 dimensiones.
- Ejecución de una política perpetua: se mantiene activa hasta recibir una orden de parada o sustitución.
- Comportamiento específico de tira y afloja con desplazamiento lineal (tug-of-war + linear distance).
- Carga directa en un slot de política del daemon mediante `robotctl policy load`.
- Inferencia en tiempo real a 50 Hz, compatible con el bucle de control del robot.
- Normalización de observaciones integrada en el propio artefacto ONNX.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas RL en el robot microduck: cargar la política en un slot con `robotctl policy load` y observar el comportamiento de tira y afloja para comparar con otras políticas del mismo repositorio.
- Reproducción de experimentos de entrenamiento: clonar `microduck-challenges`, hacer checkout del commit `4206cd842` y lanzar `launch_linear.py` con el `manifest-sha` indicado para generar una política equivalente y contrastar variabilidad entre ejecuciones.
- Docencia e investigación en robótica de bajo coste: usar el artefacto como ejemplo completo del flujo observación-acción (61→14 a 50 Hz) en un cuadrúpedo asequible.
- Benchmarking interno de políticas: servir como baseline "tug-of-war lineal" frente a otras políticas del mismo autor o del repositorio, midiendo distancia recorrida y estabilidad del gait.
- Pruebas de integración del daemon: validar el esquema 2 del manifiesto de políticas y el mecanismo de slots del daemon `robotctl` con un artefacto real.
- Demostraciones de interacción físico-digital: emplear el gait perpetuo en exhibiciones o vídeos donde el robot mantiene una marcha continua sin intervención.
- Pipeline de simulación a realidad: usar la política como punto de partida para ajuste fino en el simulador `mjlab-microduck` antes de desplegar variantes en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza ONNX de la política, se espera un consumo mínimo, pero no se documenta.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en el propio robot microduck, no en servidores GPU.
- Compatibilidad con GPU de consumo: no disponible; la inferencia se realiza presumiblemente en la CPU del robot o en el daemon `robotctl`.
- Opciones de despliegue: `robotctl policy load <slot> ctcheung/microduck-tug-of-war-tug-linear-distance-latest3500-2048-3k` sobre el daemon microduck; también es posible cargar `policy.onnx` con cualquier runtime ONNX compatible.
- Latencia y throughput: frecuencia de control fijada en 50 Hz (periodo de 20 ms); no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni modelos comparables con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor.
- Artefacto con cero descargas y cero likes: sin validación comunitaria ni evidencia de robustez en hardware real más allá de la declaración del autor.
- Exportado desde un checkout con cambios sin commitear: el binario puede no corresponder exactamente al commit `4206cd842` documentado.
- Entrenamiento no bit-reproducible: repetir el comando genera pesos distintos, aunque comparables.
- Comportamiento perpetuo: la política no tiene condición de parada propia; requiere intervención externa para detenerla.
- Especialización estrecha: solo ejecuta la tarea de tira y afloja lineal; no generaliza a otras tareas ni entornos.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, ya que no es un modelo de lenguaje.
- No se documentan métricas de éxito, estabilidad ni robustez ante perturbaciones del terreno.
- Sin garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/ctcheung/microduck-tug-of-war-tug-linear-distance-latest3500-2048-3k
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:cct1123/microduck-challenges.git` (commit `4206cd842`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
