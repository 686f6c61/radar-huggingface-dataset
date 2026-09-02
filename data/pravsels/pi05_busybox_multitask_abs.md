# pravsels/pi05_busybox_multitask_abs

## Resumen

`pi05_busybox_multitask_abs` es un fine-tune completo (full-component) del modelo de robótica π0.5 sobre el dataset `villekuosmanen/busybox_multitask`. Ha sido desarrollado por Praveen Selvaraj (pravsels) y publicado en HuggingFace en septiembre de 2026. Se trata de un modelo VLA (Vision-Language-Action) que mapea observaciones visuales de tres cámaras y prompts de tarea en acciones absolutas de 6 grados de libertad (articulaciones del brazo + pinza), con normalización por timestep basada en los percentiles q01/q99 de los límites mínimos y máximos, mapeados al rango [-1, 1].

La relevancia de este modelo radica en que demuestra el fine-tuning completo de π0.5, la versión mejorada de π0 de Physical Intelligence con mejor generalización open-world gracias a la técnica de "knowledge insulation". El checkpoint base (`pi05_base`) fue pre-entrenado con más de 10.000 horas de datos robóticos, y este fine-tune lo adapta a 27 tareas de manipulación en el entorno BusyBox. A diferencia de su hermano con acciones relativas (`pravsels/pi05_busybox_multitask`), este modelo predice acciones absolutas.

El repositorio ocupa 74.6 GB e incluye el checkpoint finalizado en el paso 29.999 de entrenamiento, junto con los assets de normalización generados durante el propio entrenamiento. La pérdida de entrenamiento descendió de 0.2664 a 0.0017 en 30.000 pasos, con una duración total de aproximadamente 4 horas y 25 minutos en 4 GPUs H100.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (VLA: VLM pre-entrenado + experto de acciones con flow matching) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | params/ + assets/ (formato de checkpoints de openpi) |

## Arquitectura y entrenamiento

π0.5 es la versión actualizada de π0, el modelo VLA de Physical Intelligence que combina un modelo de visión-lenguaje pre-entrenado con un experto de acciones basado en flow matching. Según la información disponible, π0.5 incorpora mejoras en generalización open-world mediante "knowledge insulation" y fue pre-entrenado sobre más de 10.000 horas de datos robóticos.

El fine-tune se realizó con entrenamiento full-component (actualizando todos los componentes del modelo) sobre el dataset `busybox_multitask` en formato LeRobot v3, compuesto por 66 episodios, 12.141 frames a 20 fps y 27 tareas. Las acciones son absolutas, de 6 dimensiones (articulaciones del brazo + pinza), con normalización por timestep usando los percentiles q01/q99 de los límites mínimos y máximos. El entrenamiento se ejecutó durante 30.000 pasos con batch global de 32 y horizonte de acción de 30, en 4 GPUs H100 80GB SXM con paralelismo de datos. Se utilizaron tres vistas de cámara: superior (`base_0_rgb`), muñeca (`left_wrist_0_rgb`) y frontal (`base_1_rgb`). Los prompts de tarea se generan mediante `prompt_from_task`, sin un prompt único por defecto.

## Capacidades

- Control de manipulación robótica de brazo único con 6 grados de acción (articulaciones absolutas + pinza).
- Percepción multi-cámara: integra tres vistas RGB (superior, muñeca y frontal) mapeadas a los canales de entrada del modelo.
- Ejecución multi-tarea: entrenado sobre 27 tareas distintas del entorno BusyBox, seleccionables mediante prompts por tarea.
- Generación de acciones absolutas con normalización por timestep, lo que permite manejar rangos de movimiento variables a lo largo de la trayectoria.
- Integración nativa con el framework openpi de Physical Intelligence para despliegue, evaluación y fine-tuning posterior.
- Compatibilidad con el ecosistema LeRobot v3 de HuggingFace para datasets robóticos.

## Casos de uso

- Manipulación robótica multi-tarea en entornos de mesa: el modelo puede ejecutar 27 tareas distintas de BusyBox (empujar, levantar, girar objetos, etc.) a partir de prompts textuales y observaciones visuales de tres cámaras.
- Investigación en representación de acciones: sirve para comparar el efecto de acciones absolutas frente a relativas en modelos π0.5, en contraste con su hermano `pravsels/pi05_busybox_multitask`.
- Fine-tuning para tareas específicas: al ser un checkpoint de openpi, puede utilizarse como inicialización para adaptaciones posteriores en datasets robóticos propios con el framework openpi.
- Evaluación de generalización: permite contrastar el rendimiento del modelo fine-tuneado frente al checkpoint base `pi05_base` en tareas de manipulación no vistas.
- Desarrollo de pipelines robóticos con LeRobot: al usar el formato de dataset LeRobot v3, se integra con el ecosistema de HuggingFace para robótica y permite reproducir el pipeline de entrenamiento.
- Benchmarking de infraestructura: el entrenamiento completo en 4× H100 con 30.000 pasos en ~4.4 horas documenta los requisitos computacionales para fine-tunear π0.5 en datasets de tamaño moderado, útil para planificar despliegues en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento, que descendió de 0.2664 (paso 0) a 0.0017 (paso 29.900) durante el fine-tune.

## Requisitos de hardware

- Entrenamiento: 4× GPU H100 80GB SXM con paralelismo de datos (plataforma Vast), duración aproximada de 4 horas y 25 minutos para 30.000 pasos con batch global de 32.
- Inferencia: no se especifican requisitos exactos en la información disponible. Dado que el repositorio ocupa 74.6 GB en pesos, se requiere una GPU con VRAM suficiente para el modelo completo; se recomienda una GPU con al menos 40-80 GB de VRAM dependiendo de la precisión.
- Despliegue: el modelo se sirve mediante el framework openpi, usando `scripts/serve_policy.py` o la API de Python `policy_config.create_trained_policy`.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo de acciones | Dataset | Pasos de entrenamiento | Pérdida final |
|---|---|---|---|---|
| pravsels/pi05_busybox_multitask_abs | Absolutas (6D, normalizadas por timestep) | busybox_multitask (27 tareas, 66 episodios) | 30.000 | 0.0017 |
| pravsels/pi05_busybox_multitask | Relativas (6D) | busybox_multitask (27 tareas, 66 episodios) | no disponible | no disponible |
| pi05_base (checkpoint de openpi) | — | 10k+ horas de datos robóticos | — | — |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. El modelo de acciones relativas (`pravsels/pi05_busybox_multitask`) es el equivalente directo, y su comparación permitiría evaluar el impacto de la representación de acciones en el rendimiento de π0.5.

## Limitaciones y advertencias

- Dataset de entrenamiento reducido: solo 66 episodios y 12.141 frames, lo que limita la generalización fuera de las 27 tareas de BusyBox.
- Licencia no especificada: no se indica la licencia del modelo, por lo que su uso comercial requiere verificación previa con el autor.
- Sin benchmarks de evaluación: no se han publicado tasas de éxito en tareas, lo que impide cuantificar su rendimiento real frente a otras políticas.
- Riesgo de acciones inconsistentes: como todo modelo VLA, puede generar acciones inapropiadas si se enfrenta a observaciones fuera de la distribución del dataset de entrenamiento.
- Formato de pesos propietario: los pesos están en el formato de openpi (params/ + assets/), no en formatos estándar como safetensors o GGUF, lo que limita su uso fuera del ecosistema openpi.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al estar entrenado en un entorno controlado, su comportamiento en entornos reales no está validado.
- Sin soporte multilingüe documentado: los prompts de tarea están en inglés y no se documenta soporte para otros idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pravsels/pi05_busybox_multitask_abs
- Modelo hermano (acciones relativas): https://huggingface.co/pravsels/pi05_busybox_multitask
- Dataset de entrenamiento: https://huggingface.co/datasets/villekuosmanen/busybox_multitask
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Proyecto W&B: https://wandb.ai/pravsels/busybox_multitask_pi05_abs
- Run W&B: https://wandb.ai/pravsels/busybox_multitask_pi05_abs/runs/1xb73qsx
