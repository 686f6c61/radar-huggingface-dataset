# alexhegit/so101-simstudio-lab01-pnp-vla-jepa

## Resumen

El modelo `alexhegit/so101-simstudio-lab01-pnp-vla-jepa` es una política VLA-JEPA (Vision-Language-Action con world model basado en la arquitectura JEPA) ajustada a partir del modelo base `lerobot/VLA-JEPA-LIBERO` de Meta FAIR, especializada en la tarea de pick-and-place en el entorno simulado SO-101 SimStudio. El ajuste fino se realizó mediante clonación de comportamiento sobre 8 demostraciones de experto capturadas con teleoperación leader-arm en MuJoCo, siguiendo el flujo record → train → eval del proyecto SimStudio.

El modelo cuenta con 2.770.338.694 parámetros (~2,77B) y se distribuye en formato safetensors bajo licencia Apache 2.0. Fue entrenado en una GPU AMD Instinct MI300X durante 20.000 pasos con co-entrenamiento de world model activado, alcanzando una pérdida final de entrenamiento de ~0,115. Sin embargo, la evaluación en bucle cerrado (closed-loop) en MuJoCo con los pesos de 10.000 pasos arrojó un éxito de 0/10 episodios, y los pesos de 20.000 pasos publicados en esta página aún no han sido evaluados en simulación, lo que limita severamente su utilidad práctica actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA (Vision-Language-Action con world model JEPA) |
| Parametros totales | 2.770.338.694 (~2,77B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponible (modelo puramente robótico, sin interfaz lingüística documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VLA-JEPA es una familia de modelos de robótica desarrollada por Meta FAIR que combina un modelo de lenguaje y visión con un world model basado en la arquitectura JEPA (Joint Embedding Predictive Architecture). El modelo base `lerobot/VLA-JEPA-LIBERO` fue pre-entrenado en el benchmark LIBERO de manipulación robótica. Este checkpoint concreto se ha ajustado fino sobre 8 demostraciones de experto del dataset `alexhegit/so101-simstudio-lab01-pnp`, capturadas con teleoperación leader-arm en MuJoCo mediante SO-101 SimStudio.

El entrenamiento se realizó en una GPU AMD Instinct MI300X con batch size 16, 20.000 pasos (reanudando de 10K a 20K), co-entrenamiento de world model activado y `chunk_size` / `n_action_steps` de 7. La pérdida final de entrenamiento fue de ~0,115. El tiempo de cómputo fue de ~3,5 horas para los primeros 10.000 pasos y ~4,2 horas adicionales para el tramo de 10K a 20K. La política consume dos flujos de cámara (`camera_top` → `image` y `camera_wrist` → `image2`), genera acciones de 6 dimensiones (posición articular) y utiliza propriocepción de 15 dimensiones (6 posiciones + 6 velocidades + 3 del efector final). Es importante destacar que la configuración base de LIBERO lista `input_features` de 8 dimensiones, por lo que es necesario cargar el modelo con `state_dim=15` para que la propriocepción coincida con el espacio de estados real del Lab 01.

## Capacidades

- Control de manipulación robótica pick-and-place en simulación MuJoCo.
- Política visuomotora que consume dos flujos de cámara (vista superior y muñeca) más estado de propriocepción de 15 dimensiones.
- Generación de acciones articulares de 6 dimensiones en bucle cerrado.
- Co-entrenamiento de world model JEPA para predicción de estados futuros.
- Integración nativa con la librería LeRobot para carga, evaluación y despliegue.
- Compatible con el flujo record → train → eval de SO-101 SimStudio.
- Soporte de reanudación de entrenamiento (checkpoints de 10K y 20K pasos).

## Casos de uso

- Investigación en aprendizaje robótico por imitación: el modelo sirve como artefacto de referencia para estudiar el flujo completo de clonación de comportamiento en simulación, desde la captura de demostraciones hasta la evaluación en bucle cerrado, y para analizar por qué una política con baja pérdida de entrenamiento puede fallar en evaluación cerrada.
- Evaluación de políticas VLA-JEPA en entornos simulados: permite comparar el rendimiento de diferentes configuraciones de entrenamiento (batch size, número de pasos, co-entrenamiento de world model) sobre una tarea de pick-and-place con dos cámaras.
- Desarrollo de pipelines de sim2sim: el modelo se integra con SO-101 SimStudio para validar la transferencia de políticas entre entornos MuJoCo y estudiar la brecha entre entrenamiento y evaluación.
- Formación y docencia en robótica: al ser un ejemplo completo, pequeño y con documentación detallada del proceso de entrenamiento, puede usarse como caso de estudio para enseñar fine-tuning de modelos VLA con LeRobot y depuración de políticas robóticas.
- Benchmarking de hardware: el entrenamiento documentado en MI300X ofrece datos de referencia sobre tiempos de cómputo (3,5 h + 4,2 h para 20K pasos) y configuración para GPUs AMD en cargas de trabajo de robótica.
- Experimentación con world models: el co-entrenamiento JEPA activado permite estudiar el impacto del modelado predictivo en el rendimiento de la política y comparar con variantes sin world model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las únicas métricas reportadas en la model card son:

| Metrica | Valor |
|---|---|
| Pérdida final de entrenamiento (train loss) | ~0,115 |
| Éxito en MuJoCo closed-loop (checkpoint 10K, 10 episodios) | 0/10 |
| Éxito en MuJoCo closed-loop (checkpoint 20K) | no evaluado |
| Tiempo de entrenamiento (primeros 10K pasos) | ~3,5 horas en MI300X |
| Tiempo de entrenamiento (10K → 20K pasos) | ~4,2 horas en MI300X |

## Requisitos de hardware

- El entrenamiento se realizó en una AMD Instinct MI300X (GPU de centro de datos con 192 GB de HBM3), con batch size 16 y 20.000 pasos.
- Para inferencia, el modelo pesa 6,2 GB en safetensors (~2,77B parámetros), lo que en precisión FP16/BF16 requeriría aproximadamente 6-8 GB de VRAM solo para los pesos; se estima que una GPU de consumo con 12-16 GB de VRAM (RTX 4080, RTX 4090, RTX 5080) sería suficiente para inferencia con batch pequeño.
- No se dispone de datos publicados de latencia ni throughput.
- El despliegue se realiza mediante la librería LeRobot: `VLAJEPAPolicy.from_pretrained("alexhegit/so101-simstudio-lab01-pnp-vla-jepa")`.
- No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM conversacional sino una política robótica.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos directamente comparables en la información proporcionada. No obstante, el modelo base `lerobot/VLA-JEPA-LIBERO` y otros fine-tunes del mismo proyecto SimStudio (como `alexhegit/so101-simstudio-lab01-pnp-molmoact2` y `alexhegit/so101-simstudio-lab01-pnp-smolvla`, ambos sobre la misma tarea Lab 01) podrían considerarse alternativas de la misma familia, aunque no se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- Rendimiento en simulación deficiente: la evaluación closed-loop en MuJoCo con los pesos de 10.000 pasos arrojó un éxito de 0/10 episodios, lo que indica que la política no es fiable para control en bucle cerrado.
- Los pesos de 20.000 pasos publicados no han sido evaluados en simulación, por lo que se desconoce si mejoran o empeoran el rendimiento respecto al checkpoint de 10K.
- Dataset de entrenamiento extremadamente pequeño (8 demostraciones), lo que limita la generalización y robustez de la política ante variaciones del entorno.
- El modelo está especializado en una única tarea (pick-and-place en el entorno Lab 01 de SO-101 SimStudio) y no es transferible a otros entornos o tareas sin re-entrenamiento.
- Requiere cargar con `state_dim=15` en lugar del valor por defecto de 8 dimensiones de la configuración base LIBERO; si no se ajusta correctamente, la política fallará por desajuste dimensional en la propriocepción.
- No es adecuado para uso en producción ni en robots reales sin una validación exhaustiva adicional.
- No se dispone de información sobre idiomas soportados ni capacidades lingüísticas, al ser un modelo puramente robótico sin interfaz de texto documentada.
- Sin datos sobre sesgos, alucinación u otros riesgos típicos de modelos generativos de texto, al no ser un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-vla-jepa
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp
- Repositorio SO-101 SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
- Walkthrough del Lab 01: https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/lab01_pnp.md
- Modelo base VLA-JEPA-LIBERO: https://huggingface.co/lerobot/VLA-JEPA-LIBERO
- Fine-tune alternativo (MolmoAct2): https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-molmoact2
