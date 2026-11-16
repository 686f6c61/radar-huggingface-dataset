# GinDuck/microduck-roller-sprint-2m-roller-2-l

## Resumen

`roller-sprint-2m-roller-2-l` es un checkpoint de política de refuerzo (reinforcement learning) entrenado para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics, un robot de bajo coste orientado a investigación y educación. La política controla al robot cuando se desplaza sobre ruedas (rollers), ejecutando un patrón de marcha ("gait") de tipo sprint que abandona el estilo de patinaje de iteraciones anteriores en favor de la velocidad máxima. Según el autor, completa el recorrido de referencia en aproximadamente 1,5 a 1,6 segundos.

El modelo se distribuye como un archivo `policy.onnx` con el normalizador de observaciones integrado, junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Está pensado para cargarse directamente en el daemon del robot mediante `robotctl policy load`, no para inferencia genérica en servidor. La observación es de 61 dimensiones, la acción de 14 dimensiones y el bucle de control corre a 50 Hz.

Es relevante en el contexto de robótica open source porque documenta de forma reproducible (task_id, commit, semilla, comando de entrenamiento) el pipeline completo de entrenamiento con mjlab, lo que permite a otros investigadores replicar el proceso y adaptar la receta a sus propios robots o variantes de tarea. El repositorio es de tamaño prácticamente nulo (0,0 GB reportados) y no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONN (red neuronal de control, arquitectura interna no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |

Notas adicionales: dimensión de observación 61, dimensión de acción 14, frecuencia de control 50 Hz, plataforma microduck sobre rollers.

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones). Se sabe que es una política entrenada por reinforcement learning con el entorno `Mjlab-RollerSprint2m-MicroDuck`, sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`) y el repositorio `microduck-challenges` (rama `race-2`, commit `b44f7ffc9`). El entrenamiento se lanzó con 2048 entornos paralelos, un máximo de 6000 iteraciones y semilla 1, registrando en TensorBoard bajo el nombre de ejecución `roller-2`. El checkpoint publicado corresponde a la iteración 3750.

El autor indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable pero no idéntica. La política es "perpetua": una vez cargada en un slot, ejecuta la marcha de forma continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido en el ONNX, de modo que el consumidor debe alimentar observaciones en bruto. Es reseñable que la receta de entrenamiento proviene de TheSauceman, lo que sugiere una colaboración dentro de la comunidad microduck.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck equipado con rollers, ejecutando una marcha de sprint orientada a velocidad.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o cambio de slot.
- Consumo de observaciones brutas de 61 dimensiones con normalización integrada en el modelo.
- Emisión de acciones de 14 dimensiones a 50 Hz, compatible con el bucle de control del daemon microduck.
- Integración con el sistema de slots de políticas del robot mediante `robotctl policy load`.
- No soporta tool calling, function calling, agentes, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad multimodal.

## Casos de uso

- Investigación en locomoción con ruedas: usar la política como baseline de velocidad para comparar recetas de entrenamiento o variantes de recompensa en el entorno `Mjlab-RollerSprint2m-MicroDuck`.
- Demostraciones de sprint en ferias o eventos: cargar la política en un slot y dejar que el robot recorra el circuito en ~1,5–1,6 s para mostrar el rendimiento máximo del hardware microduck.
- Reproducción de experimentos: clonar `microduck-challenges` en el commit `b44f7ffc9`, sincronizar con `uv` y relanzar el entrenamiento con la semilla 1 para estudiar la variabilidad entre ejecuciones.
- Benchmark de políticas en competición: la rama `race-2` y el `task_id` indican un contexto de carrera; esta política sirve como participante o referencia de tiempo a batir.
- Desarrollo de pipelines de despliegue: validar el flujo `robotctl policy load <slot> <repo>` y el manifiesto de esquema 2 como plantilla para publicar futuras políticas.
- Enseñanza de RL aplicado a robótica: el repo documenta comando, commit, semilla y checkpoint, lo que facilita usarlo como ejemplo completo de extremo a extremo en cursos o talleres.
- Integración en pruebas de CI del daemon: cargar la política en un entorno simulado o en hardware de laboratorio para verificar que los cambios en el daemon no rompen la inferencia ONNX a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es cualitativo-cuantitativo: la política completa el recorrido en aproximadamente 1,5 a 1,6 segundos en sus propias pruebas. No se especifica la longitud del circuito, la métrica exacta ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB reportados, lo que sugiere un modelo de muy pocos parámetros y huella mínima.
- GPU recomendadas: no disponible. Al ejecutarse como ONNX en el propio robot o en un equipo de laboratorio, no requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: probable por la naturaleza del modelo (política de control de tamaño reducido), aunque no confirmado en la información disponible.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load`; inferencia ONNX Runtime como vía genérica; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: el bucle de control opera a 50 Hz (20 ms por paso), requisito que la política debe cumplir; no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `GinDuck/microduck-roller-sprint-2m-roller-2-l` | Política RL para microduck sobre rollers | no disponible | no aplica | ~1,5–1,6 s en el recorrido de referencia (pruebas del autor) | no disponible | Hugging Face, repo de 0,0 GB |
| Otros checkpoints de la misma serie "roller" del autor | Política RL para microduck sobre rollers | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de `microduck-challenges` (rama `race-2`) | Políticas RL de competición | no disponible | no aplica | no disponible | no disponible | Repositorio GitHub público |

No se dispone de datos suficientes para comparar con alternativas de otros autores en la misma categoría (locomoción RL para cuadrúpedos de bajo coste).

## Limitaciones y advertencias

- No es un modelo de lenguaje ni multimodal; no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- El entrenamiento no es bit-reproducible: repetir la receta produce pesos distintos, aunque comparables.
- Rendimiento medido solo por el autor ("en mis propias pruebas"), sin protocolo de evaluación publicado ni circuito especificado.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo está atado al hardware microduck y a su interfaz (61 observaciones, 14 acciones, 50 Hz); no es transferible directamente a otros robots sin reentrenamiento.
- Política "perpetua": requiere un mecanismo externo de parada o cambio de slot; no gestiona por sí misma condiciones de seguridad.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de comportamiento fuera de distribución ante observaciones anómalas (sensores ruidosos, terreno distinto al de entrenamiento).
- Sin idiomas ni sesgos lingüísticos que reportar; los sesgos relevantes serían de simulación a realidad (sim-to-real gap), no documentados.
- Repositorio sin descargas ni likes: ausencia de validación por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-l
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (ruta citada en la model card; URL exacta no disponible)
- Paper, blog o demo adicionales: no disponible
