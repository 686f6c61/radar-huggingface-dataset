# Sahibnoor1/gi-endoscopy-grounded-vlm-checkpoints

## Resumen

El modelo `Sahibnoor1/gi-endoscopy-grounded-vlm-checkpoints` es un conjunto de checkpoints de investigación para el proyecto "GI Endoscopy Grounded VLM", desarrollado por Sahibnoor Singh. Se trata de un fine-tuning con adaptadores LoRA sobre el modelo base `Qwen/Qwen3-VL-8B-Instruct`, orientado a tareas de visual question answering (VQA) con grounding visual en imágenes de endoscopia gastrointestinal. El objetivo es que el modelo no solo responda preguntas clínicas sobre la imagen, sino que sus representaciones internas reflejen las regiones visuales relevantes, mejorando así la interpretabilidad y la precisión.

El proyecto se enmarca en un paper titulado "Towards Grounded GI Endoscopy VQA via Multi-Task Learning on Small VLMs" (arXiv:2607.27122), donde se propone un marco de aprendizaje multitarea que combina la respuesta a preguntas con tareas auxiliares de localización y descripción. El checkpoint recomendado (`qwen3-vl-8b-lora/sqrt-balanced-seed42/checkpoint-400`) obtiene una accuracy de 0.4620 en la validación de HyperKvasir, aunque el propio autor advierte que es una demostración de investigación y no está validado para uso clínico. El repositorio tiene un tamaño de 0.2 GB, lo que sugiere que contiene únicamente los pesos de los adaptadores LoRA, no el modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3-VL-8B-Instruct con adaptadores LoRA |
| Parametros totales | No disponible (el checkpoint es un adaptador LoRA; el modelo base tiene aproximadamente 8B parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, pero no especificada) |
| Tipos de cuantizacion | No disponible (los pesos están en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponibles (el modelo base soporta múltiples idiomas, pero no se especifica para este checkpoint) |
| Licencia | No disponible (el código del repositorio GitHub se publica bajo Apache 2.0, pero la licencia del modelo no está indicada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-8B-Instruct`, un VLM de 8B parámetros con arquitectura transformer multimodal. Sobre este base se aplica un fine-tuning con LoRA (Low-Rank Adaptation), lo que explica el reducido tamaño del repositorio (0.2 GB). El entrenamiento sigue un enfoque multitarea: además de la tarea principal de VQA, se incorporan tareas auxiliares de localización (grounding) y descripción de regiones, con el fin de que el modelo aprenda a asociar sus respuestas con las zonas visuales relevantes de la imagen endoscópica.

El encoder de visión utilizado es SigLIP2 (concretamente la variante SO400M), como indican los tags y los checkpoints externos referenciados. El dataset de entrenamiento y validación es HyperKvasir, un conjunto público de imágenes de endoscopia gastrointestinal. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El paper asociado describe el marco de aprendizaje multitarea, pero la información disponible en la model card no incluye hiperparámetros específicos del entrenamiento.

## Capacidades

- VQA en imágenes de endoscopia gastrointestinal: responde preguntas de formato libre sobre hallazgos visuales en la imagen.
- Grounding visual: el modelo está entrenado para localizar regiones relevantes de la imagen que sustentan su respuesta, mejorando la interpretabilidad.
- Descripción de imágenes: genera descripciones de las regiones anatómicas o patológicas observadas.
- Fine-tuning sobre un VLM pequeño (8B), lo que permite su ejecución en hardware relativamente accesible.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de audio o vídeo.

## Casos de uso

- Investigación en VQA médica: el modelo sirve como banco de pruebas para estudiar cómo el grounding visual mejora la precisión y la confianza de las respuestas en dominios clínicos.
- Desarrollo de sistemas de asistencia a endoscopistas: aunque no validado clínicamente, puede utilizarse como prototipo para explorar cómo un VLM puede señalar regiones de interés durante una exploración.
- Benchmarking de VLMs pequeños en imagen médica: permite comparar el rendimiento de arquitecturas de 8B frente a modelos más grandes en tareas de endoscopia.
- Entrenamiento de modelos de grounding: los checkpoints y el código del repositorio GitHub pueden servir como punto de partida para investigaciones sobre localización visual en otros dominios médicos.
- Evaluación de estrategias de balanceo de clases: el checkpoint `sqrt-balanced-seed42` explora el balanceo de clases en datasets desequilibrados como HyperKvasir, útil para estudios metodológicos.
- Análisis de ablaciones: los checkpoints de ablación (SO400M direct bridge y distillation) permiten estudiar el impacto de diferentes estrategias de integración del encoder de visión.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la validación sobre HyperKvasir:

| Checkpoint | Accuracy | Macro F1 | Balanced accuracy |
|---|---|---|---|
| `qwen3-vl-8b-lora/sqrt-balanced-seed42/checkpoint-400` (recomendado) | 0.4620 | 0.2441 | 0.2684 |
| `ablations/so400m-direct-bridge/checkpoint-500` | 0.2655 | 0.1560 | 0.1750 |
| `ablations/so400m-fixed64-distillation/final` | 0.0500 | 0.0041 | Colapso de clase única |

No se han publicado comparaciones con otros modelos en la información disponible. El rendimiento del checkpoint recomendado es modesto (accuracy inferior al 50%), lo que refuerza la advertencia de que es un modelo de investigación y no está listo para uso clínico.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Qwen3-VL-8B-Instruct, se requiere cargar el modelo base completo (aproximadamente 8B parámetros) más el adaptador. En FP16, el modelo base ocupa unos 16 GB de VRAM, por lo que se necesita una GPU con al menos 16 GB (por ejemplo, RTX 3090, RTX 4090, A10G) para inferencia.
- El adaptador LoRA en sí es muy ligero (0.2 GB), por lo que el cuello de botella es el modelo base.
- Para inferencia en CPU o GPUs de menor VRAM, sería necesario cuantizar el modelo base (por ejemplo, con GGUF o AWQ), aunque no se proporcionan versiones cuantizadas en este repositorio.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado configuraciones específicas de latencia o throughput.
- Dado el tamaño del modelo base, es viable en GPUs de consumo de gama alta, pero no en tarjetas con menos de 12 GB sin cuantización.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. El modelo se enmarca en la categoría de VLMs pequeños (8B) aplicados a imagen médica, donde existen alternativas como LLaVA-Med, Med-PaLM (no open source) o BioMedCLIP, pero no se han publicado resultados comparativos con estos sistemas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es una "demostración de investigación" y no está validado para diagnóstico, tratamiento o gestión de pacientes.
- El rendimiento es bajo (accuracy 0.4620 en HyperKvasir), lo que limita su utilidad práctica en entornos clínicos reales.
- Uno de los checkpoints de ablación (`so400m-fixed64-distillation/final`) sufre un colapso de clase única y no debe utilizarse para despliegue.
- No se especifica la licencia del modelo; solo el código del repositorio GitHub está bajo Apache 2.0. Los datos de imagen y los checkpoints pueden estar sujetos a licencias originales de los datasets (HyperKvasir, etc.).
- No se debe subir información de pacientes identificable al utilizar este modelo, según la advertencia del autor.
- No se han documentado sesgos específicos, pero al entrenarse en un dataset concreto de endoscopia, el modelo puede no generalizar a otros dominios o poblaciones.
- La longitud de contexto y los idiomas soportados no están documentados, lo que dificulta su uso en aplicaciones multilingües o con contextos largos.

## Enlaces

- HuggingFace: https://huggingface.co/Sahibnoor1/gi-endoscopy-grounded-vlm-checkpoints
- GitHub: https://github.com/sahibnoorsingh009/GI-Endoscopy-Grounded-VLM
- Paper (arXiv): https://arxiv.org/pdf/2607.27122
- Perfil del autor en HuggingFace: https://huggingface.co/Sahibnoor1
- Checkpoint externo (SO400M classifier): https://huggingface.co/Sahibnoor1/gi-siglip2-dino-hyperkvasir-checkpoints
- Checkpoint externo (Kvasir-SEG segmentation): https://huggingface.co/Sahibnoor1/kvasir-siglip2-segmentation-checkpoints
