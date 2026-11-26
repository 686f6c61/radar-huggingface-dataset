# Alex711101/microduck-speed13-up28-seed2-350

## Resumen

`microduck-speed13-up28-seed2-350` es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto **microduck**, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones del robot (estados de articulaciones, sensores inerciales, comandos de velocidad) y emite 14 acciones de control a 50 Hz, pensado para ejecutarse sobre ruedas (rollers). El autor es el usuario de Hugging Face `Alex711101`, y el modelo se distribuye como un artefacto ONNX listo para cargarse en un slot de política del daemon `robotctl`.

La política se describe como "perpetua": una vez cargada, ejecuta un patrón de marcha de forma continua hasta que se le indique lo contrario. El nombre codifica los hiperparámetros del entrenamiento (`speed13` para la velocidad objetivo, `up28` para la recompensa de orientación vertical, `seed2` para la semilla y `350` para el checkpoint). Se entrenó con la librería `mjlab` (entorno de RL basado en MuJoCo) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 4096 entornos paralelos y 750 iteraciones máximas.

Su relevancia es acotada pero específica: sirve como ejemplo reproducible de un pipeline completo de RL para robótica de bajo coste, con instrucciones exactas de reproducción (commit, seed, comando) y un formato de despliegue estandarizado (ONNX con normalizador de observaciones embebido) que elimina la necesidad de preprocesar las observaciones en el robot. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigación personal más que un modelo ampliamente validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (detalles de capas no disponibles); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Entorno de entrenamiento | mjlab (MuJoCo), tarea `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 350 |
| Semilla | 2 |
| Base | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando `mjlab`, un framework de RL construido sobre MuJoCo (motor físico). La tarea `Mjlab-RollerSprint2m-MicroDuck` define un escenario de locomoción sobre ruedas para el microduck, con recompensas que favorecen el avance a una velocidad objetivo (`speed13`) y el mantenimiento de la orientación vertical (`up28`). El entrenamiento se ejecutó con 4096 entornos paralelos, hasta 750 iteraciones del agente, guardado cada 25 iteraciones y con semilla 2; el checkpoint exportado es el 350. El conjunto de datos de entrenamiento es, por tanto, generado por el propio simulador (rollouts de la política), no un corpus externo.

La arquitectura interna de la red (número de capas, anchura, tipo de capa recurrente o feedforward) no se detalla en la model card. Lo relevante desde el punto de vista de despliegue es que el normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot puede alimentar observaciones crudas directamente. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica. Además, el modelo se exportó desde un checkout con cambios sin commitear, lo que introduce una discrepancia potencial entre el código publicado y el artefacto final.

## Capacidades

- Control de locomoción continua del robot microduck sobre ruedas: genera 14 comandos de actuación a 50 Hz a partir de 61 observaciones.
- Política "perpetua": mantiene la marcha indefinidamente hasta que se descarga o se reemplaza.
- Seguimiento de comandos de velocidad (el nombre `speed13` sugiere un objetivo de velocidad configurado en el entrenamiento; el valor exacto no se especifica).
- Estabilización de orientación vertical (`up28`), presumiblemente para mantener el cuerpo erguido.
- Despliegue directo en robot mediante `robotctl policy load <slot> <repo>`.
- Normalización de observaciones integrada en el ONNX, sin preprocesado externo.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de propósito general.

## Casos de uso

- **Demostración de locomoción en microduck físico**: cargar la política en un slot del daemon `robotctl` para que el robot ejecute una marcha continua sobre ruedas en ferias, aulas o vídeos de divulgación. Adecuado porque el artefacto es autónomo y no requiere infraestructura de inferencia adicional.
- **Punto de partida para fine-tuning o comparación de políticas**: usar el commit y la semilla documentados para reentrenar con variaciones de recompensa (por ejemplo, cambiar `speed13` o `up28`) y comparar curvas de aprendizaje. Adecuado por la reproducibilidad del pipeline (comando exacto, `uv.lock`, commit).
- **Validación de la cadena de despliegue microduck**: probar el flujo completo `manifest.json` (schema 2) → `robotctl` → ejecución en hardware como test de integración del daemon. Útil para desarrolladores que contribuyen al ecosistema Pollen Robotics.
- **Benchmark de simulación a realidad (sim-to-real)**: evaluar cuánto se degrada una política entrenada en MuJoCo al transferirse a un microduck real sobre ruedas, midiendo desviación de velocidad y caídas. El modelo sirve como referencia base.
- **Investigación docente en RL para robótica de bajo coste**: material para cursos o talleres donde los estudiantes reproducen el entrenamiento con `uv run train` y analizan el efecto de la semilla y del número de entornos paralelos.
- **Generación de datos sintéticos de locomoción**: ejecutar la política en simulación para recolectar trayectorias (observaciones-acciones) que alimenten otros experimentos de aprendizaje por imitación o análisis de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- **Inferencia en robot**: el modelo se ejecuta en el propio microduck a 50 Hz; el tamaño del repositorio es de 0.0 GB (artefacto ONNX muy pequeño), por lo que la carga computacional en el robot es mínima y presumiblemente cabe en la CPU del controlador del microduck. No se especifican requisitos de VRAM porque no se usa GPU en despliegue.
- **Entrenamiento**: requiere GPU. El comando documentado usa 4096 entornos paralelos en MuJoCo, lo que exige una GPU con memoria abundante (típicamente A100, H100 o RTX 4090; el autor no especifica el hardware exacto usado).
- **GPU recomendadas para reentrenar**: no disponible en la información proporcionada; por el volumen de entornos paralelos, se recomienda una GPU de datacenter o una consumer de gama alta.
- **Cabe en consumer GPU**: para inferencia sí (es un ONNX pequeño); para entrenamiento con 4096 entornos, probablemente solo en GPUs de gama alta, aunque no se confirma.
- **Opciones de despliegue**: `robotctl` (daemon de microduck) con `policy.onnx`; el formato ONNX permite además ejecución con ONNX Runtime en otros entornos.
- **Latencia y throughput**: 50 Hz de frecuencia de control fijada por el sistema; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas públicas para el microduck con las que comparar parámetros, contexto o rendimiento. Como referencia cualitativa, el ecosistema incluye políticas de Pollen Robotics para otros robots (por ejemplo, Reachy), pero no se dispone de datos comparables de este artefacto concreto.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en la model card ni en los metadatos; el uso comercial queda en un limbo legal hasta que el autor la declare.
- **Artefacto de investigación sin validación externa**: 0 descargas y 0 likes; no hay evidencia de que la política funcione en hardware real más allá de la afirmación del autor.
- **Reproducibilidad limitada**: el autor advierte que el RL en GPU no es bit-reproducible; además, el modelo se exportó desde un checkout con cambios sin commitear, por lo que el código del commit `3a7a20260` puede no generar exactamente este artefacto.
- **Alcance muy restringido**: es una política de locomoción para un robot concreto sobre ruedas; no generaliza a otros robots, terrenos ni tareas sin reentrenamiento.
- **Sin datos de robustez**: no se documentan tasas de caída, sensibilidad a perturbaciones, ni comportamiento ante fallos de sensores.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo de lenguaje).
- **Sesgos**: no aplica en el sentido habitual; el sesgo relevante es el del simulador (dinámica simplificada, fricción idealizada) que puede no reflejar el mundo real.
- **Idioma y contexto**: no aplica.
- **Mantenimiento**: el repositorio no muestra actividad ni issues; el soporte del autor es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alex711101/microduck-speed13-up28-seed2-350
- Repositorio de entrenamiento: https://github.com/alex711104-a11y/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (no se proporciona URL directa)
- Base del entorno: `mjlab-microduck 0.1.0 @ 1efd853be` (sin URL directa disponible)
