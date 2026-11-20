# Geoffrey19/cei2-groot-n17-base-teapot200-40k

## Resumen

`cei2-groot-n17-base-teapot200-40k` es un ajuste fino completo del modelo fundacional de robótica GR00T N1.7 de NVIDIA (3B), especializado en una única tarea de manipulación real: verter té de una tetera a una taza. Lo publica el usuario Geoffrey19 dentro del contexto del proyecto CEI y parte del checkpoint `nvidia/GR00T-N1.7-3B`, sobre el que se han entrenado 40.000 pasos con 200 episodios teleoperados en un brazo UR7e de seis ejes con una mano XHand de doce articulaciones.

El modelo es una política visuomotora de imitación: recibe una imagen RGB exterior de 640×480 y el estado de 18 articulaciones, y emite comandos de posición absoluta de las 18 articulaciones en trozos de 16 pasos. Su relevancia es la de un artefacto de investigación reproducible: publica configuración de modalidad, estadísticas de normalización, orden de articulaciones y curvas de pérdida, lo que permite auditar el proceso de post-entrenamiento de GR00T N1.7 sobre un embodiment concreto.

No es un modelo de propósito general ni un LLM conversacional: es un checkpoint de política robótica con licencia NVIDIA que restringe el uso a investigación y evaluación no comercial, sin partición de validación ni evaluación de éxito de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (política visuomotora con backbone VLM y cabeza de acciones por flow matching, según el modelo base) |
| Parametros totales | 3.144.016.000 (3,14 B, 1.030 tensores) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigación y evaluación no comercial |
| Formato de pesos | safetensors (3 shards, `model-00001-of-00003.safetensors` a `model-00003-of-00003.safetensors`) con índice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7: un backbone de tipo VLM con torre visual y LLM, más un proyector y una cabeza de acciones que genera trayectorias mediante flow matching. En este ajuste se han entrenado todas las partes (`--tune-llm --tune-visual`, proyector y cabeza de acciones), es decir, un fine-tune completo y no un adaptador. La política trabaja con acciones relativas al estado en trozos de 16 pasos (`NON_EEF`), y en inferencia suma el estado de vuelta para emitir posiciones absolutas. La normalización usa percentiles q01/q99 mapeados a −1/+1 con recorte, con estadísticas de acción relativa calculadas por paso de chunk a partir de este dataset (`statistics.json`).

Los datos son 200 episodios reales teleoperados sobre UR7e (6 articulaciones) y XHand (12 articulaciones): 43.115 fotogramas a 15 Hz, entre 51 y 743 fotogramas por episodio (14,4 s de media), una cámara RGB exterior de 640×480, estado de 18 posiciones articulares medidas en radianes y acción de 18 posiciones comandadas. El entrenamiento usó 40.000 pasos con batch 32 en una sola GPU, learning rate pico de 2e-5 tras 1.000 pasos de calentamiento (2,5 %), decaimiento coseno hasta 0 en el paso 40.000, weight decay 1e-5 y precisión mixta bfloat16 sobre pesos float32. La pérdida de entrenamiento (objetivo de flow matching del propio modelo) bajó de 1,0492 en los pasos 0–100 a 0,0098 en los pasos 39.000–40.000. No se incluyen el estado del optimizador, del scheduler ni del RNG, y `backbone.model.lm_head.weight` no se almacena porque está atado a los embeddings de entrada.

## Capacidades

- Generación de acciones de manipulación robótica: produce comandos de posición absoluta para 18 articulaciones (6 del brazo UR7e y 12 de la mano XHand) en chunks de 16 pasos.
- Condicionamiento visuomotor: consume una imagen RGB exterior de 640×480 junto con el estado articular medido.
- Ejecución de una tarea concreta de manipulación: recoger la tetera de la mesa y verter té en la taza, según la descripción de tarea del dataset.
- Inferencia por flow matching con 4 pasos de denoising (`num_inference_timesteps` en `config.json`).
- Integración con el ecosistema Isaac-GR00T y LeRobot, con configuración de modalidad propia (`cei2_groot_config.py`) para este embodiment.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en imitación robótica: reproducir el post-entrenamiento de GR00T N1.7 sobre un embodiment UR7e + XHand usando la configuración de modalidad, las estadísticas y el orden de articulaciones publicados, y comparar con la receta equivalente desde el checkpoint CEI.
- Vertido de té controlado en laboratorio: desplegar la política sobre el mismo hardware (UR7e de 6 ejes y XHand de 12 articulaciones) con una cámara exterior 640×480, respetando el orden de articulaciones documentado en `joint_order.json`, que no requiere reordenación en el lado del robot.
- Estudio comparativo de políticas: contrastar esta política basada en GR00T N1.7 con las variantes pi05 entrenadas sobre los mismos datos (`cei2-pi05-base-teapot200-fp32` y `cei2-pi05-ur7e-xhand-112h-teapot200-fp32`, 20.000 pasos) para analizar diferencias de convergencia y de formulación de acción.
- Base para nuevo ajuste fino: al ser un fine-tune completo con pesos float32 y configuración resuelta en `experiment_cfg/conf.yaml`, sirve como punto de partida para reentrenar sobre otras tareas del mismo robot pasando `cei2_groot_config.py` como `--modality-config-path`.
- Docencia y formación en robótica de manipulación: el repositorio incluye log de entrenamiento (`trainer_state.json`), estadísticas de normalización y configuración de procesador, lo que permite diseccionar un pipeline completo de post-entrenamiento de una política visuomotora.
- Evaluación offline de políticas: la model card menciona la posibilidad de puntuar el modelo offline sobre un dataset en formato GR00T, útil para pipelines internos de validación antes de desplegar en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los 200 episodios se usaron íntegramente para entrenamiento, que no hay partición de validación y que no se evaluó el éxito de la tarea (`task_outcome: not_assessed`). Solo se publican pérdidas de entrenamiento, que son ajustes a los episodios de entrenamiento y no medidas de calidad de la política:

| Pasos | GR00T desde base | GR00T desde CEI |
|---|---|---|
| 0–100 | 1,0492 | 0,1698 |
| 9.900–10.000 | 0,0396 | 0,0208 |
| 19.000–20.000 | 0,0193 | 0,0127 |
| 29.900–30.000 | 0,0116 | 0,0078 |
| 39.000–40.000 | 0,0098 | 0,0067 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, los pesos se publican en float32 (3,14 B parámetros, repo de 12,6 GB); en bfloat16 ocuparían aproximadamente 6,3 GB solo en pesos, más el estado de la torre visual y los buffers de denoising.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una sola GPU con batch 32 y precisión mixta bfloat16, sin especificar el modelo de GPU.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: Isaac-GR00T con la configuración de modalidad `cei2_groot_config.py` del repositorio; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponible. La inferencia usa 4 pasos de denoising, pero no se publican tiempos por paso ni frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cei2-groot-n17-base-teapot200-40k` (este) | 3,14 B | no disponible | 40.000 pasos desde GR00T N1.7 base; 200 episodios, 43.115 fotogramas | NVIDIA License (no comercial) | Hugging Face, 0 descargas, 0 likes |
| `Geoffrey19/cei2-groot-n17-ur7e-xhand-112h-teapot200-40k` | no disponible | no disponible | 40.000 pasos desde el checkpoint CEI; misma tarea | no disponible | Hugging Face |
| `Geoffrey19/cei2-pi05-base-teapot200-fp32` | no disponible | no disponible | 20.000 pasos de pi05 sobre los mismos datos | no disponible | Hugging Face |
| `Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32` | no disponible | no disponible | 20.000 pasos de pi05 desde CEI sobre los mismos datos | no disponible | Hugging Face |

No se dispone de métricas de éxito de tarea para ninguno de los cuatro, por lo que la comparación de rendimiento no puede establecerse con datos publicados.

## Limitaciones y advertencias

- Licencia NVIDIA: el uso queda limitado a investigación y evaluación no comercial; cualquier despliegue comercial requiere revisión legal de `LICENSE`.
- Sin evaluación: no hay partición de validación ni evaluación de éxito de tarea; la pérdida de entrenamiento no mide calidad de política y puede reflejar sobreajuste a los 200 episodios.
- Especialización extrema: la política está entrenada para una única tarea (verter té) sobre un embodiment concreto (UR7e + XHand) y una única cámara exterior; no se espera generalización a otras tareas, robots, cámaras ni disposiciones de escena.
- Dependencia del orden de articulaciones: el modelo asume el orden qpos del modelo de robot CEI `ur7e_xhand` (dims 0–5 brazo, 6–17 mano); un orden distinto en el robot de destino invalida las acciones.
- Diferencia entre acción comandada y posición medida: los comandos de la mano difieren de la siguiente posición medida en 1,5° de media, un desfase que puede afectar al control en lazo cerrado.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible; al ser una política de imitación, puede reproducir sesgos y artefactos de las demostraciones teleoperadas.
- Idiomas y contexto: no disponibles; el modelo no es un modelo de lenguaje de uso general.
- Reproducibilidad parcial: no se incluyen estado del optimizador, scheduler ni RNG, por lo que un reentrenamiento exacto no es posible a partir de este repositorio.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-teapot200-40k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Receta equivalente desde CEI: https://huggingface.co/Geoffrey19/cei2-groot-n17-ur7e-xhand-112h-teapot200-40k
- pi05 sobre los mismos datos (desde base): https://huggingface.co/Geoffrey19/cei2-pi05-base-teapot200-fp32
- pi05 sobre los mismos datos (desde CEI): https://huggingface.co/Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32
