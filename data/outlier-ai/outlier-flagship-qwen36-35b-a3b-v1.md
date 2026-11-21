# Outlier-Ai/outlier-flagship-qwen36-35b-a3b-v1

## Resumen

`outlier-flagship-qwen36-35b-a3b-v1` es un checkpoint de investigación publicado por Outlier-Ai, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante técnicas de destilación y adaptadores LoRA. Se trata de un artefacto experimental que la propia model card describe como superado y no recomendado para producción: el autor lo conserva únicamente por reproducibilidad e interés histórico dentro de su linaje de modelos. El repositorio pesa 349,4 GB y contiene 34.660.610.752 parámetros en formato safetensors, con una arquitectura de mezcla de expertos (MoE).

El modelo emplea la arquitectura `qwen3_5_moe_text`, es decir, un transformer con capas MoE y procesamiento exclusivamente de texto. Está etiquetado con `training-failure-documented`, lo que indica que el autor documentó explícitamente un fallo de entrenamiento en este checkpoint, y con `experimental`, reforzando su carácter de artefacto no validado. Solo declara soporte para inglés y su licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual es limitada: la model card indica que ha sido reemplazado por la línea Outlier v1.8 (Nano 4B, Core 27B, Vision 35B-A3B) y que no se distribuye en la aplicación del autor. Resulta útil como referencia para quienes investiguen procesos de destilación sobre Qwen3.6-35B-A3B, pero no como base para despliegues reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de texto (`qwen3_5_moe_text`), derivado de Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.752 (≈34,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos y pipeline de texto. Sobre esa base, Outlier-Ai aplicó un proceso de destilación con adaptadores LoRA, según las etiquetas del repositorio (`distillation`, `lora`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La etiqueta `training-failure-documented` es el dato técnico más relevante: el autor reconoce que el entrenamiento de este checkpoint presentó un fallo documentado, lo que explica su clasificación como artefacto de investigación y su sustitución por la línea v1.8. No se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre la configuración de los expertos.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Procesamiento exclusivamente de texto: no hay soporte multimodal declarado.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de código y matemáticas: no verificadas en este checkpoint.

## Casos de uso

- Reproducción de experimentos de destilación: el checkpoint permite replicar el pipeline de destilación con LoRA sobre Qwen3.6-35B-A3B documentado por el autor, útil para investigación académica sobre adaptación de MoE.
- Estudio de fallos de entrenamiento: la etiqueta `training-failure-documented` convierte este repo en un caso de referencia para analizar qué salió mal en el proceso y cómo se corrigió en la línea v1.8.
- Comparación de linajes de modelos: sirve para contrastar la evolución entre este artefacto y los modelos posteriores de Outlier (Nano 4B, Core 27B, Vision 35B-A3B) en tareas de generación de texto en inglés.
- Evaluación de adaptadores LoRA sobre bases MoE: investigadores pueden inspeccionar los pesos y adaptadores para estudiar cómo afecta la destilación al comportamiento del modelo base.
- Docencia y formación: como ejemplo práctico de model card que documenta limitaciones y fallos, útil en cursos sobre buenas prácticas de publicación de modelos.
- No recomendado para producción: la model card indica explícitamente que no se distribuye en la aplicación Outlier y que ha sido superado; cualquier uso en producción debería migrarse a los modelos de la línea v1.8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras mencionadas en versiones anteriores provenían de experimentos internos y no de las pruebas de release del autor, por lo que no se ofrecen datos verificables de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 69 GB solo para pesos (34,7 B × 2 bytes), más overhead de activaciones y KV cache; requiere GPU de 80 GB (A100, H100) o múltiples GPU.
- VRAM estimada en cuantización de 8 bits: alrededor de 35 GB, viable en A100 40 GB o H100.
- VRAM estimada en cuantización de 4 bits: alrededor de 18-20 GB, potencialmente viable en RTX 4090 (24 GB), aunque no se documentan pesos cuantizados en el repo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU para FP16.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y sin garantías, dado que el repo solo ofrece safetensors sin variantes cuantizadas.
- Opciones de despliegue: vLLM, TGI o llama.cpp (requiere conversión previa a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| outlier-flagship-qwen36-35b-a3b-v1 | ≈34,7 B (MoE) | no disponible | Apache 2.0 | Artefacto de investigación, superado |
| Qwen/Qwen3.6-35B-A3B (base) | ≈35 B (MoE) | no disponible | según modelo base | Modelo base oficial |
| Outlier Core 27B | no disponible | no disponible | no disponible | Tier por defecto actual del autor |
| Outlier Vision 35B-A3B | no disponible | no disponible | no disponible | Tier multimodal actual del autor |

La comparación con alternativas externas al linaje Outlier no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental con fallo de entrenamiento documentado: no debe usarse como base para producción.
- Modelo superado: la model card indica que ha sido reemplazado por la línea Outlier v1.8 y que no se distribuye en la aplicación del autor.
- Idiomas: solo se declara inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.6-35B-A3B, hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: no evaluado en este checkpoint; sin benchmarks publicados no puede cuantificarse.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor desaconseja explícitamente su uso en producción.
- Tamaño del repo (349,4 GB): requiere almacenamiento considerable y dificulta su descarga y despliegue.
- Sin variantes cuantizadas oficiales: la conversión a GGUF o formatos de 4/8 bits corre por cuenta del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/outlier-flagship-qwen36-35b-a3b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Sitio del autor: https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (variante del autor): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (variante del autor): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
