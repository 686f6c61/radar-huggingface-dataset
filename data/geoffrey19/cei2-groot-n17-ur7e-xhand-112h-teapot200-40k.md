# Geoffrey19/cei2-groot-n17-ur7e-xhand-112h-teapot200-40k

## Resumen

cei2-groot-n17-ur7e-xhand-112h-teapot200-40k es un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario Geoffrey19 a partir de NVIDIA GR00T N1.7-3B. Se trata de un ajuste fino completo (full fine-tune) sobre 200 episodios reales de teleoperación de una tarea concreta: verter té de una tetera a una taza con un brazo UR7e de 6 ejes y una mano XHand de 12 articulaciones. El modelo parte de un checkpoint de mid-training previo (CEI-2.0) que entrenó GR00T N1.7 durante 50.000 pasos sobre 112 horas de demostraciones del dataset DROID retargetizadas al mismo embodiment y re-renderizadas en sus escenas originales.

El interés del modelo es metodológico: muestra una receta completa de post-entrenamiento de un VLA de 3.140 millones de parámetros sobre hardware real de bajo coste relativo (brazo UR7e + mano antropomórfica XHand), con normalización por percentiles, acciones relativas al estado en chunks de 16 pasos y una configuración de modalidades específica para el robot. El resultado es un modelo de imitación de una sola tarea, sin split de evaluación ni medida de éxito, pensado para investigación.

La relevancia es acotada: no es un modelo de propósito general, sino una política especializada de una tarea y un embodiment, distribuida bajo la NVIDIA License, que restringe el uso a investigación y evaluación no comercial. Cualquier uso en producción requeriría validación independiente de la política sobre el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision-language-action, transformer multimodal con cabeza de acciones por flow matching) |
| Parámetros totales | 3.144.016.000 (3,14 B; 1.030 tensores) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea se pasan como prompt de texto) |
| Licencia | NVIDIA License (`nvidia-license`), uso limitado a investigación y evaluación no comercial |
| Formato de pesos | safetensors (3 shards: `model-0000{1,2,3}-of-00003.safetensors`) + `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NVIDIA GR00T N1.7, un VLA que combina un backbone visual y un modelo de lenguaje con una cabeza de acciones que genera trayectorias mediante flow matching. La política recibe una imagen RGB exterior de 640×480, el estado de 18 articulaciones medidas (6 del brazo UR7e + 12 de la mano XHand) y una descripción textual de la tarea, y produce chunks de 16 pasos de posiciones articulares objetivo. Las acciones se entrenan como objetivos relativos al estado (`NON_EEF`); en inferencia, la política suma el estado de vuelta y emite posiciones absolutas. La normalización usa percentiles q01/q99 mapeados a −1/+1 con recorte, y las estadísticas de acciones relativas se calculan por paso de chunk a partir del propio dataset (`statistics.json`).

El ajuste fino es completo: `--tune-llm --tune-visual`, proyector y cabeza de acciones. Se entrenó 40.000 pasos con batch 32 en una sola GPU, learning rate pico de 2e-5 tras 1.000 pasos de warmup (2,5 %), decaimiento coseno hasta 0 en el paso 40.000 y weight decay 1e-5, en precisión mixta bfloat16 sobre pesos float32. Los datos son 200 episodios teleoperados (43.115 frames a 15 Hz, entre 51 y 743 frames por episodio, 14,4 s de media) de la tarea "Pick up the teapot from the tabletop and pour tea into the teacup". La pérdida de entrenamiento (objetivo de flow matching del propio modelo) bajó de 0,1698 en los primeros 100 pasos a 0,0067 en los últimos 1.000, partiendo del checkpoint CEI; desde el checkpoint base, la misma receta arranca en 1,0492 y termina en 0,0098. El autor advierte que estas cifras son ajustes a los episodios de entrenamiento, no medidas de calidad de la política. El optimizador, el scheduler y el estado del RNG no se incluyen; `backbone.model.lm_head.weight` no se almacena porque está atado a los embeddings de entrada y se restaura al cargar.

## Capacidades

- Generación de acciones motoras: produce chunks de 16 pasos de posiciones articulares absolutas para un brazo UR7e (6 ejes) y una mano XHand (12 articulaciones) a partir de una imagen y del estado actual.
- Condicionamiento por lenguaje: acepta una descripción textual de la tarea mediante `annotation.human.task_description`.
- Percepción visual monocámara: una cámara RGB exterior a 640×480.
- Imitación de una tarea concreta: verter té de una tetera a una taza.
- Orden articular compatible con el modelo de robot CEI `ur7e_xhand`: el orden registrado coincide con el qpos del modelo, sin reordenación en el lado del robot (`joint_order.json`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es una política robótica especializada, no un modelo de lenguaje de propósito general.
- Multilingüismo: no disponible; el prompt de tarea es texto libre, pero no se especifica cobertura idiomática.

## Casos de uso

- Investigación en imitación de tareas de manipulación diestra: reproducir la receta de post-entrenamiento sobre un brazo UR7e con mano XHand para estudiar la transferencia de un VLA de 3,14 B a hardware real de laboratorio.
- Estudio de mid-training y retargeting: comparar este modelo con su variante entrenada desde el checkpoint base (`Geoffrey19/cei2-groot-n17-base-teapot200-40k`) para aislar el efecto de 50.000 pasos de mid-training sobre 112 h de DROID retargetizado.
- Benchmark interno de políticas VLA: usar la tarea de verter té como banco de pruebas controlado (200 episodios, 43.115 frames, 15 Hz) para comparar GR00T N1.7 con alternativas como pi05 entrenadas sobre los mismos datos.
- Docencia y divulgación de robótica: ejemplo completo de configuración de modalidades (`cei2_groot_config.py`), normalización por percentiles y acciones relativas en chunks de 16 pasos, con todos los ficheros de configuración publicados.
- Análisis de normalización y estadísticas: reutilizar `statistics.json` y `dataset_modality.json` para estudiar cómo afectan las estadísticas por paso de chunk al aprendizaje de políticas con flow matching.
- Reentrenamiento sobre nuevas tareas del mismo robot: partir de este checkpoint como inicialización para otras tareas de manipulación con el mismo embodiment (UR7e + XHand), aprovechando que el orden articular ya está alineado con el modelo de robot.
- Evaluación de robustez visual: probar la política con variaciones de iluminación, oclusión o posición de cámara en el entorno real, dado que solo se entrenó con una cámara exterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta evaluación: los 200 episodios se usaron íntegramente para entrenamiento, no hay split de validación y el resultado de la tarea no se evaluó (`task_outcome: not_assessed`). La única métrica publicada es la pérdida de entrenamiento del objetivo de flow matching, que no mide calidad de política:

| Pasos | GR00T desde base | GR00T desde CEI |
|---|---|---|
| 0–100 | 1,0492 | 0,1698 |
| 9.900–10.000 | 0,0396 | 0,0208 |
| 19.000–20.000 | 0,0193 | 0,0127 |
| 29.900–30.000 | 0,0116 | 0,0078 |
| 39.000–40.000 | 0,0098 | 0,0067 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en float32 (3,14 B de parámetros, repo de 12,6 GB). En float32 se necesitan aproximadamente 12,6 GB solo para pesos, más activaciones y buffers del backbone visual; en bfloat16 bajaría a unos 6,3 GB, pero no se documentan pesos en esa precisión ni cuantizaciones.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se hizo con una sola GPU y batch 32, pero el autor no especifica el modelo.
- ¿Cabe en GPU de consumo? Con 12,6 GB en float32, encajaría en GPUs de 16 GB o más (por ejemplo, RTX 4080/4090), aunque no hay confirmación del autor ni requisitos de memoria de inferencia documentados.
- Opciones de despliegue: la librería indicada es `gr00t` (Isaac-GR00T de NVIDIA). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de robótica de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-groot-n17-ur7e-xhand-112h-teapot200-40k (este) | 3,14 B | no disponible | 40k pasos desde mid-training CEI (50k pasos, 112 h DROID retargetizado) | NVIDIA License (no comercial) | Hugging Face, 0 descargas |
| Geoffrey19/cei2-groot-n17-base-teapot200-40k | 3,14 B (base GR00T N1.7-3B) | no disponible | 40k pasos desde el checkpoint base | NVIDIA License | Hugging Face |
| Geoffrey19/cei2-pi05-base-teapot200-fp32 | no disponible | no disponible | 20k pasos sobre los mismos datos | no disponible | Hugging Face |
| Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32 | no disponible | no disponible | 20k pasos sobre los mismos datos, desde mid-training | no disponible | Hugging Face |

La comparación directa más informativa es con la variante desde base y con las políticas pi05 del mismo autor, entrenadas sobre el mismo dataset; no se dispone de métricas de éxito para ninguna de ellas.

## Limitaciones y advertencias

- Sin evaluación: no hay split de validación ni medida de éxito de la tarea; la pérdida de entrenamiento no es un indicador de calidad de política.
- Sobreajuste probable: los 200 episodios se usaron íntegramente para entrenamiento, lo que favorece el ajuste a las trayectorias observadas.
- Una sola tarea y un solo embodiment: la política está especializada en verter té con UR7e + XHand; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Una sola cámara exterior a 640×480: sin visión adicional ni profundidad; sensible a cambios de iluminación, oclusión o calibración.
- Dependencia del orden articular: las acciones asumen el orden qpos del modelo de robot CEI `ur7e_xhand`; un robot con orden distinto requiere remapeo.
- Licencia restrictiva: la NVIDIA License limita el uso a investigación y evaluación no comercial; no apto para producción comercial sin licencia adicional.
- Idiomas y sesgos: no se documenta cobertura idiomática ni análisis de sesgos; al ser un modelo de robótica, los riesgos de alucinación textual no aplican igual, pero sí el riesgo de acciones incorrectas o inseguras en el robot real.
- Sin estado de optimizador ni scheduler: no se puede reanudar el entrenamiento exactamente desde el checkpoint publicado.
- Repo de 12,6 GB en float32: coste de almacenamiento y de memoria de inferencia elevado frente a una versión en bfloat16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-ur7e-xhand-112h-teapot200-40k
- Variante desde checkpoint base: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-teapot200-40k
- pi05 desde base: https://huggingface.co/Geoffrey19/cei2-pi05-base-teapot200-fp32
- pi05 desde mid-training: https://huggingface.co/Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Dataset DROID: https://droid-dataset.github.io/
- Modelo base NVIDIA GR00T N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
