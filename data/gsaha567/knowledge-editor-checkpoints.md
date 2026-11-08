# GSaha567/knowledge-editor-checkpoints

## Resumen

`GSaha567/knowledge-editor-checkpoints` es una colección de checkpoints de un hiperred ("editor") que, dado un documento, predice una edición de pesos de rango 4 (ΔW) para cada capa MLP de un modelo Qwen2.5-Instruct congelado. El objetivo es que el modelo editado pueda responder preguntas sobre el documento sin necesidad de incluirlo en el prompt, es decir, una forma de edición de conocimiento paramétrica y forward-only. El autor es GSaha567 y el repositorio acompaña al proyecto `forward_mode_update` alojado en GitHub.

El repositorio es un barrido de escalas ("size sweep") sobre tres modelos base: Qwen2.5-0.5B-Instruct, Qwen2.5-1.5B-Instruct y Qwen2.5-3B-Instruct. Para cada uno se publican checkpoints de preentrenamiento del editor (con LR constante y con warmup + coseno), checkpoints de SFT sobre ΔW, una línea base de SFT estándar (fine-tune completo con el pasaje en el prompt) y resultados de evaluación de una línea base de fine-tuning por pasaje. No se trata de un modelo generativo autónomo, sino de artefactos de investigación para reproducir y evaluar el método de edición.

La relevancia actual es metodológica: explora si una hiperred puede inyectar información factual en los pesos de un LLM de forma eficiente (una sola pasada forward del modelo profesor) frente al coste de un fine-tune completo o de inflar el contexto. El repositorio es grande (135,7 GB) y contiene pesos en formato PyTorch (`torch.save`, `.pt`), no safetensors, pese a la etiqueta del Hub. Descargas y likes son 0 y no hay benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiperred ("editor") que predice ediciones ΔW de rango 4 sobre las capas MLP de un transformer Qwen2.5-Instruct congelado |
| Parametros totales | No disponible (depende del checkpoint; los modelos base van de 0,5B a 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `other` / `qwen`: Apache 2.0 para los checkpoints de 0,5B y 1,5B; Qwen Research License para el de 3B |
| Formato de pesos | `.pt` (`torch.save`: dict con `config`, `editor_state_dict`, `teacher_state_dict` y `iteration`); el baseline `sft/standard/model/` está en formato Hugging Face |

## Arquitectura y entrenamiento

El editor es una hiperred que lee un documento mediante una única pasada forward de un modelo profesor y genera una edición de pesos de rango 4 (ΔW) para cada capa MLP del modelo Qwen2.5-Instruct congelado. El modelo profesor se implementa como un LoRA (`teacher_state_dict`) y el estado del editor se guarda en `editor_state_dict`. La edición es, por tanto, paramétrica y de bajo rango, lo que permite aplicarla sin reentrenar el modelo base ni modificar el prompt en inferencia.

El entrenamiento se organiza en dos fases. Primero, un preentrenamiento del editor sobre 100.000 documentos diversos con una penalización sobre ΔW, en dos variantes de tasa de aprendizaje (constante y warmup + coseno). Después, un SFT sobre ΔW con 50.000 ejemplos de QA, partiendo del preentrenamiento correspondiente. Como líneas base se incluyen un SFT estándar (fine-tune completo con el pasaje en el prompt, en formato Hugging Face) y resultados de evaluación de un fine-tuning por pasaje desde el modelo Instruct y desde el SFT estándar. Cada directorio de ejecución contiene el checkpoint final, `logs/` (historial de entrenamiento y trayectoria del coseno de ΔW) y `eval/` (reconstrucción en holdout, evaluación final de SFT y pruebas de QA). Los checkpoints se han despojado del estado del optimizador: cargan para evaluación, QA, inferencia y como `init_checkpoint` de SFT, pero no permiten reanudar el entrenamiento.

## Capacidades

- Edición de conocimiento paramétrica: inyecta información de un documento en los pesos del modelo base sin incluirlo en el prompt.
- Respuesta a preguntas sobre el documento editado tras una única pasada forward del profesor.
- Edición de bajo rango (rango 4) sobre todas las capas MLP del transformer congelado.
- Preentrenamiento y SFT reproducibles para tres escalas (0,5B, 1,5B y 3B) del modelo base.
- Línea base de SFT estándar con el pasaje en el prompt, en formato Hugging Face.
- Inferencia mediante el comando `python -m kedit.infer --checkpoint ... --doc-file ... --question ...`.
- No se documentan tool calling, capacidades de agente, visión, audio ni modo thinking propios; cualquier capacidad de ese tipo dependería del Qwen2.5-Instruct subyacente y no está descrita en la información disponible.

## Casos de uso

- Investigación en edición de conocimiento: reproducir el barrido de escalas (0,5B, 1,5B, 3B) para estudiar cómo varía la fidelidad de la edición con el tamaño del modelo base, usando los checkpoints de preentrenamiento y SFT publicados.
- Evaluación comparativa de métodos de inyección de conocimiento: contrastar la edición ΔW frente al SFT estándar con el pasaje en el prompt y frente al fine-tuning por pasaje, con los resultados de `eval/` incluidos en cada ejecución.
- Asistentes sobre documentación interna: editar un modelo pequeño (0,5B o 1,5B) con un manual o normativa y responder preguntas sin consumir ventana de contexto con el documento completo.
- Despliegue con contexto limitado: en escenarios donde el documento es largo y no cabe en el prompt, la edición paramétrica evita el coste de tokens de entrada en cada consulta.
- Prototipado académico de hiperredes: reutilizar `editor_state_dict` y `teacher_state_dict` como punto de partida para experimentos con otras tasas de aprendizaje o esquemas de rango.
- Análisis de estabilidad del entrenamiento: usar `logs/` (historial y trayectoria del coseno de ΔW) para estudiar la dinámica de las ediciones con LR constante frente a warmup + coseno.
- Base para pipelines de CI de investigación: cargar los checkpoints como `init_checkpoint` de SFT en flujos automatizados de evaluación, teniendo en cuenta que no permiten reanudar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona directorios `eval/` con reconstrucción en holdout, evaluación final de SFT y pruebas de QA, pero no se incluyen cifras (MMLU, HumanEval, GSM8K ni métricas de edición) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el modelo base va de 0,5B a 3B parámetros; el editor y el profesor LoRA añaden overhead no cuantificado en la información disponible.
- GPU recomendadas: no disponible. Por tamaño del modelo base, los checkpoints de 0,5B y 1,5B son candidatos a GPU de consumo; el de 3B requiere más memoria, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Probable para 0,5B y 1,5B; no confirmado para 3B en la información disponible.
- Opciones de despliegue: el repositorio proporciona el módulo `kedit.infer` para inferencia y evaluación; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 135,7 GB, lo que condiciona el espacio en disco necesario para descargar todos los checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knowledge-editor-checkpoints (este repo) | Base de 0,5B a 3B | No disponible | Edición de pesos ΔW rango 4 vía hiperred | Apache 2.0 (0,5B/1,5B) y Qwen Research License (3B) | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | No disponible en la información | LLM instruct estándar | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en la información | LLM instruct estándar | Apache 2.0 | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | No disponible en la información | LLM instruct estándar | Qwen Research License | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo listo para producción: es una colección de checkpoints de investigación para reproducir un método de edición de conocimiento.
- Los checkpoints son pickles (`torch.save`); deben cargarse solo si se confía en su procedencia.
- No permiten reanudar el entrenamiento: el estado del optimizador fue eliminado.
- La licencia es `other`/`qwen`: los términos de Qwen2.5 se aplican a los checkpoints; el modelo de 3B usa Qwen Research License, con posibles restricciones para uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al depender de Qwen2.5-Instruct, hereda los del modelo base, no evaluados aquí.
- Cobertura de idiomas no especificada; no hay garantías multilingües documentadas para la edición.
- Longitud de contexto no especificada; el comportamiento con documentos largos no está cuantificado.
- El repositorio ocupa 135,7 GB, lo que puede dificultar su descarga y almacenamiento.
- Sin descargas ni likes y sin benchmarks publicados: madurez y validación externa desconocidas.
- La etiqueta del Hub indica `safetensors`, pero el formato real de los checkpoints es `.pt`; conviene verificar antes de integrarlo en pipelines que esperen safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/GSaha567/knowledge-editor-checkpoints
- Repositorio de código, configuraciones e instrucciones: https://github.com/ComeBackCity/forward_mode_update
- Referencia general sobre checkpoints de IA (resultado de búsqueda): https://www.weka.io/learn/ai-checkpoints
