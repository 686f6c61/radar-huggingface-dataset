# dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-2066

## Resumen

Long-WAM-Fold-Towel-3Epoch-20261030-Step-2066 es un checkpoint de inferencia para robótica de manipulación, resultado de un ajuste fino del modelo base Efficient-Large-Model/Long-WAM-YAM. Lo publica el usuario dddddsds31341 y está especializado en una única tarea: doblar una toalla larga con un manipulador bimanual. El modelo se distribuye como pesos PyTorch (`model.pt`) acompañados del código de inferencia SIP, la configuración exacta del entrenamiento y las estadísticas de normalización del dataset.

El interés de esta ficha es acotado: no se trata de un modelo de propósito general, sino de un artefacto de investigación reproducible dentro del ecosistema Long-WAM. El autor documenta con precisión el run de entrenamiento (4 GPU A100, batch global 48, 3 épocas objetivo, step 2.066), lo que permite auditar el proceso, pero no publica métricas de éxito ni evaluación en held-out. Es, por tanto, un recurso útil para quien quiera reproducir o extender un pipeline de imitación visuomotora sobre el modelo base, no para despliegues de producción sin validación propia.

La relevancia actual deriva del interés creciente en modelos de acción (world-action models) aplicados a manipulación con datos de demostración escasos: aquí se usan solo 100 demostraciones y 99.151 fotogramas. El repositorio ocupa 12 GB, en línea con el peso de los componentes VAE y codificador de texto que el modelo requiere de forma externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (world-action model) sobre backbone tipo transformer con VAE Wan2.2 y codificador de texto UMT5; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; historial de observaciones P48 y chunk de acción de 32 pasos |
| Tipos de cuantizacion | no disponible; pesos en BF16 según configuración de entrenamiento |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | other (remite a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (`model.pt` con claves `mot`, `proprio_encoder`, `step`, `torch_dtype`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Long-WAM-YAM, un world-action model orientado a manipulación robótica. La arquitectura interna no se detalla en la model card; lo que sí se especifica es el pipeline de representación: tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas en un layout de vídeo de 384×320, un historial de P48 observaciones y predicción de chunks de acción de 32 pasos. Las acciones se representan como objetivos absolutos de 14 dimensiones en unidades originales del gripper: 6 articulaciones + gripper izquierdo y 6 articulaciones + gripper derecho.

El entrenamiento se realizó sobre el dataset `yuyingyinya/fold_towel` (revisión 48cf95e0…), con 100 demostraciones y 99.151 fotogramas. Se usaron 4 GPU A100, batch de 12 por GPU con acumulación 1 (batch global 48), learning rate constante de 1e-05, optimizador AdamW con weight decay 0.01, semilla 42, precisión BF16 y DeepSpeed ZeRO-1. El objetivo era 3 épocas; este checkpoint corresponde al step 2.066 del run `fold-towel-3ep-epochckpt-20261030-023552`. La normalización es específica de la tarea: z-score por dimensión seguido de clipping a [-5, 5], y debe usarse junto con las estadísticas incluidas en el repositorio.

## Capacidades

- Predicción de trayectorias de acción bimanual de 14 dimensiones (6 articulaciones + gripper por brazo) condicionadas a observaciones visuales multi-cámara y estado propioceptivo.
- Ejecución de una tarea concreta de manipulación: doblar una toalla larga en dirección de borde corto, borde largo y borde corto, y finalmente alinear y alisar.
- Procesamiento de historial temporal de 48 pasos de observación para mantener coherencia visuomotora.
- Generación de chunks de acción de 32 pasos, lo que reduce la frecuencia de replanificación.
- Condicionamiento por instrucción de tarea en lenguaje natural (la instrucción textual se pasa al codificador UMT5).
- Integración con el stack de inferencia SIP del ecosistema Long-WAM (`longwam.inference.load_run_config` y `load_model`).
- No soporta tool calling, agentes conversacionales, visión general ni generación de texto libre: es un modelo de política robótica.

## Casos de uso

- Reproducción de experimentos de imitación bimanual: cargar el checkpoint con `load_model` usando `expected_step=2066` y las estadísticas del repositorio permite replicar exactamente la política entrenada para la tarea de doblar toallas.
- Punto de partida para nuevos ajustes finos: al ser un checkpoint intermedio de un run de 3 épocas, sirve como inicialización para experimentos con más datos o tareas relacionadas (plegado de otras prendas) sobre el mismo backbone Long-WAM.
- Evaluación comparativa de políticas: útil como baseline en estudios que comparen estrategias de representación de acciones (absolutas vs. delta) o de historial (P48 vs. ventanas menores) en manipulación con pocas demostraciones.
- Docencia e investigación en robótica de manipulación: el paquete incluye configuración, estadísticas y código, lo que facilita montar prácticas reproducibles sobre un caso realista de plegado.
- Validación de pipelines de despliegue SIP: permite probar la integración de VAE Wan2.2, codificador UMT5 y tokenizador en una máquina destino antes de entrenar modelos propios.
- Análisis de robustez ante variaciones de cámara o iluminación: al fijar el checkpoint, se puede aislar el efecto de cambios en el entorno físico sobre una política concreta.
- Generación de datos sintéticos de trayectoria para aumentar el dataset: las predicciones del modelo pueden filtrarse y usarse como propuestas iniciales en un bucle de aprendizaje por refuerzo o de imitación iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama tasa de éxito del robot ni rendimiento en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12 GB, pero el consumo real depende del VAE Wan2.2, el codificador UMT5 y el tokenizador, que se distribuyen por separado.
- GPU recomendadas: el entrenamiento se hizo en 4× A100; para inferencia se desconoce el mínimo, aunque por el tamaño del checkpoint es razonable esperar necesidad de GPU de datacenter (A100/H100) o GPUs consumer de gama alta con suficiente VRAM.
- Compatibilidad con GPU consumer: no confirmada; requiere prueba empírica con los assets externos cargados.
- Opciones de despliegue: stack SIP del ecosistema Long-WAM (`code.zip`, `requirements-sip.txt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Fold-Towel-3Epoch-Step-2066 | no disponible | P48 historial, chunk 32 | Plegado de toalla bimanual | other (base) | HuggingFace |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | World-action model general | según modelo base | HuggingFace |
| Otras políticas de imitación bimanual (p. ej. ACT, Diffusion Policy) | no disponible en esta ficha | no disponible | Manipulación diversa | variable | Repositorios públicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para doblar una toalla larga con la instrucción textual descrita; no generaliza a otras tareas sin reentrenamiento.
- Sin métricas de éxito ni evaluación held-out: el autor no reclama rendimiento, por lo que cualquier uso en producción exige validación propia.
- Checkpoint de inferencia, no reanudable: `model.pt` no incluye estado de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento exactamente.
- Dependencias externas obligatorias: VAE Wan2.2, codificador UMT5 y tokenizador deben obtenerse por separado; el código conserva rutas SIP que hay que adaptar a la máquina destino.
- Normalización acoplada: las estadísticas z-score y el clipping [-5, 5] son específicos de la tarea; usar otras estadísticas invalida las predicciones.
- Licencia "other" heredada del modelo base: es imprescindible revisar los términos de Efficient-Large-Model/Long-WAM-YAM antes de cualquier uso comercial.
- Riesgo de alucinación motora: al ser una política generativa, puede producir trayectorias plausibles pero físicamente inviables; requiere límites de seguridad en el robot.
- Sesgos de datos: 100 demostraciones de un único operador y entorno limitan la diversidad; probable sobreajuste a condiciones de iluminación, cámaras y posiciones iniciales del dataset.
- Idiomas: no aplica; el condicionamiento textual depende del codificador UMT5 y de la instrucción en inglés usada en entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-2066
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset de entrenamiento: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM (sección de licencia)
