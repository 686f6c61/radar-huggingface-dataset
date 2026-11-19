# linoyts/Qwen-Image-2.1-DMD2-2steps

## Resumen

Qwen-Image-2.1-DMD2-2steps es un adaptador LoRA de destilación para el modelo de difusión Qwen-Image-2.1, desarrollado por el usuario linoyts y publicado en Hugging Face. Su función es reducir el coste computacional de la inferencia: transforma el muestreo de 20 pasos del modelo base en una ejecución de solo 2 pasos, manteniendo una calidad de edición por instrucciones y de generación texto-a-imagen cercana a la del profesor completo. Está pensado para pipelines interactivos y en tiempo real donde la latencia importa.

El adaptador se entrena con DMD2 (Distribution Matching Distillation), una técnica de destilación on-policy que no requiere pérdidas de regresión ni GAN, y que incorpora la guía CFG del profesor directamente en el estudiante. La LoRA es de rango 32, con alpha 32, y solo adapta las proyecciones de atención (`to_q`, `to_k`, `to_v`, `to_out.0`), lo que preserva mejor la fidelidad al condicionamiento en tareas de edición.

Es relevante ahora porque el modelo base Qwen-Image-2.1 es un sistema de difusión de última generación para edición multi-referencia y texto-a-imagen, y esta LoRA permite desplegarlo con un coste de inferencia drásticamente menor. El adaptador pesa 0,2 GB y se carga sobre el pipeline `QwenImage21Pipeline` de diffusers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de destilación sobre modelo de difusión Qwen-Image-2.1 (atención adaptada: `to_q`, `to_k`, `to_v`, `to_out.0`) |
| Parámetros totales | no disponible (adaptador LoRA de rango 32, alpha 32; tamaño de repo 0,2 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto e imágenes) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente bf16/fp32; no se especifican cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License): solo uso no comercial, investigación y evaluación |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`, `pytorch_lora_weights_v1_5.safetensors`) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo de difusión (probablemente basado en transformer, aunque la model card no detalla la arquitectura interna del backbone) que acepta una lista de imágenes de condición —referidas como "Picture 1", "Picture 2", etc.— y un prompt de texto. La LoRA adapta únicamente las proyecciones de atención, manteniendo intactos los bloques feed-forward, decisión que según el autor mejora la fidelidad al condicionamiento y la preservación de la imagen de entrada en edición.

El entrenamiento se realizó con DMD2 (on-policy distribution matching, sin pérdidas de regresión ni GAN), usando la guía CFG del profesor. Se entrenó en resolución multi-aspecto (~1 MP) durante 2000 pasos en una única GPU H100. El resultado es un estudiante que ejecuta 2 pasos con sigmas fijas `[1.0, 0.5]` y `true_cfg_scale=1.0`, es decir, sin CFG en inferencia, porque la guía del profesor está incorporada en el estudiante. La versión V1.5 (publicada el 2026-10-30) mejora la adherencia al prompt y la fidelidad de edición.

## Capacidades

- Generación texto-a-imagen con 2 pasos de inferencia.
- Edición de imagen por instrucciones (image-to-image): conversión de bocetos a foto, cambio de peinado, expresión facial, restauración fotográfica, estilización (p. ej., claymation).
- Composición multi-referencia: acepta una lista de imágenes de condición y el prompt las referencia por posición ("Place the cat from Picture 1 on the beach from Picture 2").
- Inferencia sin CFG (`true_cfg_scale=1.0`), lo que reduce el coste por paso a una sola pasada condicional.
- Compatibilidad con `QwenImage21Pipeline` de diffusers (rama dev con soporte para Qwen-Image-2.1).
- No se documentan capacidades de tool calling, agentes, audio ni visión más allá del condicionamiento por imagen propio del modelo de difusión.

## Casos de uso

- Edición interactiva en tiempo real: con 2 pasos en lugar de 20, la latencia se reduce aproximadamente un orden de magnitud, lo que permite ajustes visuales iterativos con retroalimentación inmediata en herramientas de diseño.
- Prototipado rápido de estilización: aplicar transformaciones como "claymation", acuarela o render 3D sobre imágenes de entrada y previsualizar resultados sin esperar el muestreo completo del profesor.
- Restauración fotográfica en lote: procesar grandes volúmenes de imágenes antiguas o dañadas con un coste por imagen mucho menor, adecuado para pipelines de digitalización de archivos.
- Composición multi-referencia para marketing: combinar productos y escenarios a partir de varias imágenes de condición (p. ej., colocar un objeto de la Picture 1 en un fondo de la Picture 2) para generar variaciones de anuncios.
- Generación texto-a-imagen en aplicaciones móviles o de borde: al requerir solo 2 pasos y una LoRA de 0,2 GB, es viable en entornos con recursos limitados, siempre que se respete la licencia de investigación.
- Investigación en destilación de modelos de difusión: sirve como referencia reproducible de DMD2 con adaptación solo en atención y sigmas fijas, útil para estudiar el equilibrio entre pasos, fidelidad y preservación de la entrada.
- Pruebas A/B de prompts y ediciones: la baja latencia permite evaluar muchas variaciones de prompt y semilla en poco tiempo durante el desarrollo de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una comparación visual cualitativa (2 pasos frente a 20 pasos del modelo base) en `assets/edit_space_examples.png`, pero no reporta métricas numéricas (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base Qwen-Image-2.1 (no documentado en la información proporcionada) más el adaptador LoRA de 0,2 GB. El adaptador en sí es ligero.
- GPU recomendadas: el entrenamiento se realizó en una única NVIDIA H100; para inferencia se recomienda una GPU con suficiente VRAM para el modelo base en bfloat16 (A100, H100 o superiores).
- GPU de consumo: no se confirma que quepa en GPU de consumo; depende del tamaño del modelo base, no especificado.
- Despliegue: `diffusers` (rama dev con soporte Qwen-Image-2.1), pipeline `QwenImage21Pipeline`, scheduler `FlowMatchEulerDiscreteScheduler` con `use_dynamic_shifting=False`, `shift=1.0`, `shift_terminal=None`.
- Latencia y throughput: no se proporcionan cifras; la ventaja principal es la reducción de 20 pasos a 2 pasos por generación.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | CFG en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-DMD2-2steps (esta LoRA) | LoRA de destilación DMD2 sobre Qwen-Image-2.1 | 2 | No (`true_cfg_scale=1.0`) | qwen-research (no comercial) | Hugging Face, diffusers dev |
| Qwen-Image-2.1 (base) | Modelo de difusión completo | 20 | Sí | qwen-research | Hugging Face |
| Otras LoRAs de destilación few-step para Qwen-Image | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial, de investigación y evaluación. El uso comercial requiere una licencia separada de Qwen (Hangzhou Tongyi Laboratory Technology Co., Ltd.).
- Al ser un trabajo derivado de Qwen-Image-2.1, hereda todas las restricciones de la licencia del modelo base.
- La destilación a 2 pasos puede degradar la calidad frente al profesor de 20 pasos en casos complejos; la model card solo ofrece comparación visual, sin métricas.
- Requiere sigmas fijas `[1.0, 0.5]` y `use_dynamic_shifting=False`; usar otra configuración del scheduler puede romper la calidad.
- No usa CFG en inferencia, por lo que no se puede ajustar la fuerza de la guía en tiempo de ejecución como en el modelo base.
- Depende de una versión de diffusers no publicada en PyPI (rama dev `qwenimage21-lora-training`), lo que complica la reproducibilidad en producción.
- Idiomas soportados no documentados; el comportamiento multilingüe del prompt depende del modelo base.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base, no cuantificado en la información disponible.
- No se documentan limitaciones específicas de resolución más allá de ~1 MP en entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/linoyts/Qwen-Image-2.1-DMD2-2steps
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio diffusers (rama dev): https://github.com/huggingface/diffusers/tree/qwenimage21-lora-training
- Comparación visual 2 pasos vs 20 pasos: `assets/edit_space_examples.png` (en el repositorio del modelo)
