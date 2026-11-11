# GinDuck/microduck-roller-sprint-2m-roller-2-f

## Resumen

`microduck-roller-sprint-2m-roller-2-f` es una política de control motriz entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de actuador a 50 Hz, pensado para ejecutarse sobre ruedas (rollers) en el robot real. Lo publica el usuario GinDuck como segundo checkpoint de su serie "roller" y sigue una receta de entrenamiento compartida por TheSauceman.

El modelo se distribuye como `policy.onnx` con el normalizador de observaciones embebido, de modo que el consumidor solo tiene que alimentar observaciones en crudo, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. La política es perpetua: una vez cargada en una ranura del demonio `robotctl`, mantiene la marcha hasta que se le indique lo contrario.

Su relevancia es acotada pero concreta: es un artefacto reproducible de investigación en robótica con RL, con instrucciones exactas de reproducción (commit, semilla, comando de entrenamiento) y un objetivo medible —completar el recorrido en aproximadamente 1,5 segundos—. No hay datos de benchmarks publicados, ni licencia declarada, ni información sobre idiomas, por lo que su uso en producción exige verificación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con reinforcement learning (arquitectura de red no especificada en la información disponible); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 61-D de observación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrena con el stack `mjlab-microduck` (versión 0.1.0, commit `1efd853be`), sobre la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento se lanzó el 2026-11-02 con 2048 entornos paralelos, un máximo de 6000 iteraciones del agente, semilla 1, registro en TensorBoard y nombre de ejecución `roller-2`; el checkpoint publicado corresponde a la iteración 5250. La arquitectura interna de la red no se detalla en la model card.

El espacio de observación es de 61 dimensiones y el de acción de 14, con una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado en el propio `policy.onnx`, por lo que la inferencia acepta observaciones en crudo. La receta es reproducible en código y semilla, aunque el autor advierte explícitamente de que el RL sobre GPU no es bit-reproducible entre máquinas: repetir el entrenamiento produce una política comparable, no idéntica.

## Capacidades

- Locomoción sobre ruedas (rollers) para el robot microduck, con marcha perpetua hasta recibir una orden de parada.
- Control a 50 Hz con mapeo directo de 61 observaciones a 14 acciones.
- Ejecución de una "sprint" de velocidad: según el autor, completa cada recorrido en aproximadamente 1,5 segundos.
- Carga como política en una ranura del demonio `robotctl` mediante el comando `policy load`.
- Inferencia autocontenida: normalización de observaciones incluida en el grafo ONNX.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- **Investigación en locomoción con RL sobre hardware real**: cargar la política en el microduck con `sudo robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-f` y medir tiempos de recorrido en pista, comparando contra otros checkpoints de la misma serie.
- **Reproducción de experimentos**: clonar `microduck-challenges` en el commit `b44f7ffc9`, ejecutar el comando de entrenamiento documentado con semilla 1 y contrastar la política resultante con este checkpoint para estudiar varianza entre ejecuciones.
- **Referencia base para fine-tuning o comparación de recetas**: usar este checkpoint como punto de partida en la tarea `Mjlab-RollerSprint2m-MicroDuck` y evaluar variantes de recompensa o de número de entornos.
- **Validación de pipelines de despliegue ONNX en robótica**: integrar `policy.onnx` en un bucle de control a 50 Hz para verificar latencia y estabilidad del runtime de inferencia del demonio.
- **Docencia y demostraciones de RL aplicado**: ejemplo completo y reproducible de un flujo entrenamiento → exportación ONNX → despliegue en robot, con manifiesto versionado.
- **Pruebas de regresión de firmware/daemon**: emplear una política de comportamiento determinista y de duración corta (~1,5 s por recorrido) para comprobar que el cargador de políticas y el esquema 2 del manifiesto funcionan tras cambios en `robotctl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo y específico de la tarea: cada recorrido se completa en aproximadamente 1,5 segundos.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el tamaño del repositorio es de 0,0 GB y no se indican parámetros de la red, por lo que no puede estimarse con rigor.
- **GPU recomendadas**: no disponible. El entrenamiento se realizó con 2048 entornos paralelos, lo que en la práctica requiere una GPU de datacenter, pero el modelo no especifica el hardware empleado.
- **GPU de consumo**: no confirmado; por el tamaño declarado del repositorio (inferior a 0,1 GB) es plausible que la inferencia quepa en GPU de consumo, pero no hay dato que lo respalde.
- **Opciones de despliegue**: runtime ONNX a través del demonio `robotctl` de microduck (carga por ranura de política); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponible; únicamente se conoce la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-roller-sprint-2m-roller-2-f` | Política RL para microduck sobre rollers | 61-D / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otros checkpoints de la serie "roller" de GinDuck | Políticas RL para microduck | no disponible | no disponible | no disponible | Hugging Face |
| Políticas de la tarea `Mjlab-RollerSprint2m-MicroDuck` en `microduck-challenges` | Políticas RL de referencia de la competición | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Sin licencia declarada**: no se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro; debe consultarse al autor antes de cualquier uso productivo.
- **No reproducible bit a bit**: el propio autor advierte que el RL sobre GPU no es determinista entre máquinas; los pesos publicados no pueden regenerarse exactamente.
- **Alcance muy restringido**: la política está entrenada específicamente para la tarea `Mjlab-RollerSprint2m-MicroDuck` sobre rollers; no se garantiza su comportamiento en otras configuraciones del robot, superficies o cargas.
- **Sin datos de robustez**: no se documentan pruebas ante perturbaciones, empujones, terrenos irregulares o fallos de actuador.
- **Riesgo físico**: es un controlador de un robot real; un comportamiento inesperado puede provocar daños al robot o a su entorno. Debe validarse en entorno controlado.
- **Metadatos incompletos**: sin información de parámetros, cuantizaciones, idiomas ni benchmarks; la evaluación independiente es imprescindible antes de adoptarlo.
- **Fecha de creación futura en los metadatos** (2026-11-11): conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-f
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md`): https://github.com/pollen-robotics/microduck (ruta dentro del repositorio del demonio)
