# Sereno/TCoT-Single

## Resumen

TCoT-Single es un conjunto de adaptadores LoRA (PEFT) publicados por el usuario Sereno en HuggingFace, diseñados para el modelo base OpenVLA-7B. Estos adaptadores están orientados a tareas de robótica de manipulación de un solo paso (single-task) dentro del benchmark LIBERO, y se presentan como parte de los resultados del artículo TCoT (Thinking Chain-of-Thought). El repositorio incluye los adaptadores para las cuatro suites de tareas individuales de LIBERO, junto con las estadísticas de normalización necesarias para entrenamiento e inferencia.

El modelo no es un modelo completo sino un adaptador de bajo rango que modifica el comportamiento del VLA (Vision-Language-Action) OpenVLA-7B para mejorar el razonamiento en tareas robóticas. Aunque la model card no proporciona detalles sobre el entrenamiento o los resultados, la existencia de este adaptador es relevante para la comunidad de robótica que busca evaluar estrategias de razonamiento en modelos de visión-lenguaje-acción. El tamaño del repositorio es de 1.9 GB, correspondiente a los pesos de los adaptadores y los estadísticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OpenVLA-7B (modelo base: openvla/openvla-7b) |
| Parametros totales | no disponible (solo adaptador, el modelo base tiene 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no aplicable (adaptador PEFT, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El adaptador TCoT-Single se basa en el modelo OpenVLA-7B, que es un modelo de visión-lenguaje-acción construido sobre un LLM de 7B parámetros (Llama-2) y un codificador visual (SigLIP). El adaptador LoRA modifica las capas del modelo base para adaptarlo a tareas específicas del benchmark LIBERO. Sin embargo, la model card no ofrece información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. Los detalles técnicos completos se encuentran en el artículo TCoT, referenciado en el repositorio de GitHub del autor, pero no están disponibles en la ficha de HuggingFace.

## Capacidades

- Adaptación de OpenVLA-7B para tareas de manipulación robótica de un solo paso en el benchmark LIBERO.
- Soporte para las cuatro suites de tareas individuales de LIBERO (cada suite contiene un adaptador separado).
- Incluye estadísticas de normalización para reproducir el entrenamiento e inferencia.
- Requiere el modelo base openvla/openvla-7b para funcionar; no es un modelo autónomo.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso fuera del contexto robótico.

## Casos de uso

- Evaluación de estrategias de razonamiento en VLA: el adaptador permite reproducir los experimentos del artículo TCoT en el benchmark LIBERO, comparando el rendimiento de distintos enfoques de razonamiento en tareas de manipulación.
- Investigación en robótica de manipulación: sirve como punto de partida para estudiar cómo los adaptadores LoRA afectan al comportamiento de OpenVLA en tareas específicas de un solo paso.
- Desarrollo de políticas de control para brazos robóticos: se puede integrar en pipelines de robótica que utilicen OpenVLA como base, ajustando el adaptador a la tarea concreta.
- Reproducibilidad de resultados académicos: al proporcionar los adaptadores y estadísticas, permite verificar los resultados reportados en el paper TCoT sin necesidad de reentrenar desde cero.
- Benchmarking de modelos VLA: útil para comparar el rendimiento de OpenVLA con y sin el adaptador TCoT en entornos simulados de LIBERO.
- Prototipado de soluciones de automatización industrial: aunque limitado a tareas de LIBERO, puede servir como base para adaptar a entornos reales de pick-and-place o ensamblaje simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ya que el adaptador está orientado a tareas robóticas. Los resultados del artículo TCoT están referenciados en el repositorio de GitHub, pero no se proporcionan números en la ficha de HuggingFace.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre OpenVLA-7B, se necesita al menos 16 GB de VRAM para cargar el modelo base en FP16 junto con el adaptador. Con cuantización (por ejemplo, 4-bit) podría reducirse a unos 8 GB, pero no está documentado.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o similar con al menos 24 GB de VRAM para mayor comodidad.
- En consumer GPU: es posible ejecutar en una RTX 3090/4090 (24 GB) sin cuantización, o en GPUs de 12-16 GB con cuantización del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace sobre el modelo base. Para inferencia en robótica, se suele usar PyTorch directamente. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas. Existen otros adaptadores VLA para robótica (por ejemplo, los publicados por la comunidad de OpenVLA), pero no se han encontrado datos comparativos en la model card ni en la búsqueda web realizada. Se recomienda consultar el repositorio de TCoT para comparaciones con otros métodos de razonamiento en VLA.

## Limitaciones y advertencias

- El adaptador es específico para las tareas single-task de LIBERO; no es generalizable a otras tareas o entornos sin reentrenamiento.
- La licencia "other" no especifica los términos exactos; puede haber restricciones para uso comercial. Se debe contactar con el autor para aclarar.
- No se documentan sesgos conocidos, pero al basarse en OpenVLA-7B, hereda las limitaciones del modelo base (por ejemplo, posibles sesgos en la generación de lenguaje o en la percepción visual).
- Riesgo de alucinación en la generación de acciones o lenguaje si se usa fuera de su dominio de entrenamiento.
- No hay información sobre la robustez del adaptador ante variaciones en la iluminación, oclusiones o cambios en la configuración de la cámara.
- El adaptador requiere el modelo base openvla/openvla-7b, que a su vez tiene su propia licencia y requisitos de hardware.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Sereno/TCoT-Single
- Repositorio de GitHub del proyecto TCoT: https://github.com/Serenos/TCoT
- Modelo base OpenVLA: https://huggingface.co/openvla/openvla-7b
