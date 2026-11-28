# jaywu109/pi05_recording_full_gaze

## Resumen

`jaywu109/pi05_recording_full_gaze` es un ajuste fino completo (*full fine-tune*) del modelo base de robótica `lerobot/pi05_base`, desarrollado por el usuario jaywu109 y publicado en Hugging Face. Se trata de una política visomotora (`pi05`) entrenada con la librería LeRobot 0.5.2 para ejecutar una tarea concreta de manipulación: entregar platos a una persona cuando esta está lista para recibirlos y devolverlos a su posición. El modelo no es un LLM de propósito general, sino un controlador de extremo a extremo que mapea observaciones multimodales (tres cámaras RGB y un vector de estado) a acciones de robot de 14 dimensiones.

El interés de esta ficha es acotado: es un artefacto de investigación reproducido sobre un dataset específico (`minhphd/recording_full_gaze`, 102 episodios, 407.499 fotogramas a 30 fps), sin evaluación publicada y con cero descargas en el momento de la consulta. Resulta relevante para quienes trabajan con LeRobot y quieran inspeccionar un ejemplo de ajuste fino de `pi05` sobre hardware multi-GPU, así como para estudiar el formato de entrada/salida de las políticas pi0.5 en tareas de *handover*.

El repositorio ocupa 37,4 GB e incluye los checkpoints de los pasos 10.000, 20.000, 30.000 y 40.000 (final), sin estado del optimizador. La licencia no está declarada y no se especifican idiomas soportados, algo esperable en un modelo de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (política visomotora de LeRobot, derivada de `lerobot/pi05_base`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; entrada por fotograma y *action chunk* de 50) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (estructura `pretrained_model` de LeRobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `lerobot/pi05_base` mediante LeRobot 0.5.2. La arquitectura subyacente es la de una política visomotora pi0.5, que combina percepción visual multi-cámara con un estado propioceptivo y produce secuencias de acciones en forma de *chunks*. En concreto, la entrada consta de tres flujos de imagen: `observation.images.base_0_rgb` (cámara superior, 3×720×1280), `observation.images.left_wrist_0_rgb` y `observation.images.right_wrist_0_rgb` (3×480×640 cada una), más `observation.state` de dimensión 14. La salida es un tensor `action` de dimensión 14 con un *chunk* de 50 pasos. La card indica que los nombres de imagen del dataset original (`top`, `left_wrist`, `right_wrist`) deben remapearse a esos nombres en inferencia.

El entrenamiento se realizó durante 40.000 pasos con batch 12 (4 por GPU en 3 GPUs), learning rate 2,5e-5 con decaimiento a lo largo de los 40.000 pasos, precisión bf16 y *gradient checkpointing*, alcanzando una pérdida final de entrenamiento de 0,012. Se usaron los 102 episodios del dataset `minhphd/recording_full_gaze` (407.499 fotogramas a 30 fps). Cada episodio lleva asociada la instrucción de tarea `hand over each plate when the person is ready for it, then press it home`, que debe pasarse también en inferencia. No se documenta ninguna innovación técnica adicional más allá del propio pipeline de LeRobot.

## Capacidades

- Control visomotor de extremo a extremo para una tarea de manipulación concreta (*handover* de platos y retorno a posición).
- Fusión de tres vistas RGB (cámara superior y dos muñecas) con un vector de estado de 14 dimensiones.
- Generación de secuencias de acción de 14 dimensiones en *chunks* de 50 pasos.
- Condicionamiento por instrucción de tarea en lenguaje natural (la *task string* especificada).
- No soporta *tool calling*, ni razonamiento multi-paso genérico, ni capacidades multilingües, ni visión de propósito general: es una política de robot, no un modelo conversacional.
- No se documenta *thinking mode*, audio ni otras capacidades especiales.

## Casos de uso

- **Reproducción de experimentos de LeRobot**: cargar el checkpoint `040000/` con LeRobot 0.5.2 y ejecutar la política sobre el mismo entorno de recogida, útil para validar el pipeline de entrenamiento multi-GPU descrito en la card.
- **Handover de objetos en entornos asistenciales**: el modelo está entrenado específicamente para entregar platos a una persona cuando esta los solicita y devolverlos a su sitio, un escenario típico en robótica de asistencia doméstica o de comedor.
- **Punto de partida para ajustes finos adicionales**: al ser un *full fine-tune* sobre `pi05_base`, puede servir como inicialización para tareas de manipulación similares con menos datos.
- **Estudio del formato de entradas/salidas de pi0.5**: sirve como referencia práctica de cómo se estructuran `observation.images.*`, `observation.state` y `action` con *chunk* 50 en LeRobot.
- **Evaluación de robustez ante cambios de cámara**: útil para experimentar con remapeo de nombres de imagen y comprobar la sensibilidad de la política a la disposición de las cámaras.
- **Docencia e investigación en políticas visomotoras**: ejemplo reproducible de ajuste fino con bf16, *gradient checkpointing* y decaimiento de learning rate sobre un dataset pequeño (102 episodios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente «Not evaluated yet» y solo reporta la pérdida final de entrenamiento (0,012), que no constituye una métrica de éxito en la tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. El repositorio pesa 37,4 GB e incluye cuatro checkpoints; cada uno de ellos ocuparía una fracción de ese total, pero no se detalla.
- **GPU recomendadas**: el entrenamiento se realizó con 3 GPUs (4 muestras por GPU, batch 12), lo que sugiere GPUs de gama profesional (A100/H100 o similares); no se especifica el modelo exacto.
- **Compatibilidad con GPU de consumo**: no confirmada. Dado el tamaño del repositorio y la naturaleza multimodal del modelo, es probable que requiera GPUs con VRAM alta, pero no hay datos para afirmarlo.
- **Opciones de despliegue**: LeRobot 0.5.2 (librería indicada en la card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaywu109/pi05_recording_full_gaze` | no disponible | no aplica (chunk 50) | Handover de platos | no disponible | Hugging Face (repo de 37,4 GB) |
| `lerobot/pi05_base` | no disponible | no aplica | Política visomotora general base | no disponible | Hugging Face |
| Otras políticas LeRobot (p. ej. pi0, ACT, Diffusion Policy) | no disponible | no aplica | Manipulación robótica | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluación**: el autor indica explícitamente que el modelo no ha sido evaluado; no hay evidencia de éxito en la tarea real.
- **Tarea única**: está especializado en una instrucción concreta (`hand over each plate...`); no generaliza a otras tareas sin reentrenamiento.
- **Dependencia del entorno**: requiere exactamente las tres cámaras con los nombres y resoluciones indicados y el remapeo desde `top`/`left_wrist`/`right_wrist`.
- **Licencia no declarada**: no se puede asumir uso comercial; hay que contactar con el autor o consultar el modelo base.
- **Sesgos**: al entrenarse con 102 episodios de un único dataset, hereda los sesgos de ese entorno (iluminación, disposición, personas concretas).
- **Riesgo en producción**: sin métricas de éxito ni validación externa, no es apto para despliegue en producción sin una evaluación previa exhaustiva.
- **Tamaño del repo**: 37,4 GB con cuatro checkpoints; conviene descargar solo `040000/*` como sugiere la card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaywu109/pi05_recording_full_gaze
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/minhphd/recording_full_gaze
- LeRobot (librería): https://github.com/huggingface/lerobot
- Descarga del checkpoint final: `hf download jaywu109/pi05_recording_full_gaze --include "040000/*" --local-dir pi05_gaze`
