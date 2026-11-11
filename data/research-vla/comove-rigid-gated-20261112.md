# research-vla/comove-rigid-gated-20261112

## Resumen

CoMove con relaciones rígidas con compuerta de movimiento (motion-gated rigid relations) es un checkpoint de investigación de un modelo nativo 4D-WAM (world-action model) orientado a robótica, publicado por la organización research-vla. Se trata del paso final (step-21.700) de un entrenamiento sobre la tarea `libero_joint_2cam224_1e-4_comove_rigid`, en el que se combina una alineación TraceAnything con una supervisión de relaciones rígidas MoSE3 con compuerta de movimiento. El modelo está pensado para el pipeline de robótica de Hugging Face y se distribuye como pesos para la implementación nativa FastWAMJoint con la cabeza rígida de CoMove.

El modelo resuelve el problema de aprender representaciones espacio-temporales (4D) alineadas con la dinámica física de escenas manipuladas, incorporando una pérdida rígida que se calcula sobre las características de vídeo de la capa 20 con peso 1.0. La compuerta de movimiento retiene pares de puntos con al menos un extremo en movimiento, estimado por el profesor MoSE3, y recurre a muestreo sin compuerta cuando un keyframe o vista no presenta mayoría estática. Es relevante porque ejemplifica una línea de investigación reciente que inyecta supervisión geométrica y física en modelos visión-lenguaje-acción (VLA) para manipulación robótica.

El repositorio ocupa 12,1 GB y contiene únicamente el checkpoint, sin el VAE preentrenado, sin los activos de texto y sin el estado del optimizador. No se dispone de información sobre arquitectura detallada, número de parámetros, licencia ni idiomas soportados más allá de lo que indica la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | 4D-WAM (world-action model) nativo con cabeza rígida CoMove; implementación FastWAMJoint; no se detalla la arquitectura interna |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene checkpoint, `model-config.yaml`, `dataset_stats.json` y `checkpoint_manifest.json`) |

## Arquitectura y entrenamiento

El modelo es un 4D-WAM nativo entrenado con alineación TraceAnything y supervisión de relaciones rígidas MoSE3 con compuerta de movimiento. La pérdida rígida lee las características de vídeo en la capa 20 con peso 1.0. Durante el entrenamiento, la compuerta conserva pares de puntos con al menos un extremo en movimiento, según la estimación del profesor MoSE3; los keyframes o vistas sin mayoría estática recurren a muestreo sin compuerta. El checkpoint corresponde al paso 21.700 del trabajo de entrenamiento 37814807, derivado del commit `577f71cec9a795f5d1408f26e929770c300db622` de CoMove, en la tarea `libero_joint_2cam224_1e-4_comove_rigid_gated`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El checkpoint no incluye el VAE preentrenado (se debe apuntar `COMOVE_VAE_PATH` al VAE local de Wan2.2), ni los activos de texto, ni el estado del optimizador. El uso previsto requiere la implementación nativa FastWAMJoint con la cabeza rígida de CoMove, la configuración `model-config.yaml` y las estadísticas de normalización `dataset_stats.json`.

## Capacidades

- Modelo visión-lenguaje-acción orientado a robótica de manipulación, entrenado sobre la suite LIBERO.
- Procesamiento de entrada con dos cámaras a resolución 224 (según el nombre de la tarea `2cam224`).
- Aprendizaje de relaciones rígidas 3D (MoSE3) a partir de características de vídeo, con compuerta basada en movimiento.
- Alineación espacio-temporal 4D mediante TraceAnything.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo ni modos especiales de razonamiento o thinking.
- No se documentan capacidades de visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: el checkpoint sirve como punto de partida o referencia para reproducir experimentos de VLA con supervisión geométrica rígida sobre las tareas de la suite LIBERO.
- Estudio de supervisión geométrica en modelos world-action: permite analizar cómo afecta la pérdida rígida MoSE3 con compuerta de movimiento a las representaciones de la capa 20 en tareas de manipulación con dos cámaras.
- Evaluación de alineación TraceAnything: útil para comparar la calidad de las representaciones 4D frente a variantes sin alineación, usando la configuración y estadísticas de normalización proporcionadas.
- Reproducción de experimentos: al incluir `model-config.yaml`, `dataset_stats.json` y `checkpoint_manifest.json` con tamaños y SHA-256, facilita la verificación de integridad y la reproducción del entrenamiento en el commit indicado.
- Base para fine-tuning en dominios robóticos específicos: el checkpoint puede adaptarse a nuevas tareas de manipulación con dos cámaras 224, siempre que se disponga del VAE de Wan2.2 y de la implementación FastWAMJoint.
- Docencia y divulgación técnica: sirve como ejemplo concreto de integración de supervisión física (relaciones rígidas) en modelos visión-lenguaje-acción para explicar pipelines de entrenamiento en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 12,1 GB, pero no se indica el número de parámetros ni la cuantización, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es la implementación nativa FastWAMJoint con la cabeza rígida de CoMove y el VAE local de Wan2.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con alternativas de la misma categoría (parámetros, contexto, rendimiento y licencia no disponibles). Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- Checkpoint de investigación: no incluye el VAE preentrenado, los activos de texto ni el estado del optimizador; requiere configuración adicional (`COMOVE_VAE_PATH`, `model-config.yaml`, `dataset_stats.json`) para funcionar.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se documenta soporte multilingüe.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento que permita validar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Orientado a la suite LIBERO y a entradas de dos cámaras a 224: su generalización a otros dominios robóticos no está demostrada.
- Dependencia de un commit concreto de CoMove y de la implementación FastWAMJoint: cambios en el código base pueden romper la compatibilidad del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/research-vla/comove-rigid-gated-20261112
- Configuración del modelo: https://huggingface.co/research-vla/comove-rigid-gated-20261112/blob/main/model-config.yaml
- Estadísticas de normalización: https://huggingface.co/research-vla/comove-rigid-gated-20261112/blob/main/dataset_stats.json
- Manifiesto del checkpoint: https://huggingface.co/research-vla/comove-rigid-gated-20261112/blob/main/checkpoint_manifest.json
