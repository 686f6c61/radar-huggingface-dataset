# Kejabbfii/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una distribución de pesos cuantizados del adaptador "Omni" de ChatR Labs (rango 128) fusionado en el modelo base Qwen/Qwen-Image-2.1, un modelo de difusión texto-a-imagen con capacidades de edición de imagen. El autor del repositorio es Kejabbfii y el modelo se publica bajo la licencia qwen-research. El repositorio contiene exclusivamente el transformer cuantizado en múltiples formatos: GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 con torchao, NF4 con bitsandbytes e INT8 con bitsandbytes. El text encoder, el processor y el VAE no se incluyen y deben tomarse del repositorio base.

El modelo resuelve el problema de desplegar un modelo de generación de imagen de gran tamaño (7.115 millones de parámetros en el transformer) en hardware con VRAM limitada, ofreciendo variantes desde 3,67 GB (NF4) hasta 14,23 GB (BF16). La etiqueta "uncensored" indica que el adaptador ha sido entrenado para reducir las restricciones de contenido del modelo base, lo que tiene implicaciones importantes para su uso en producción. La arquitectura subyacente es la de Qwen-Image-2.1, un transformer de difusión para texto-a-imagen, y el contexto de texto depende del text encoder del modelo base, no incluido en este repositorio.

La relevancia actual del modelo radica en su formato multi-cuantización y su compatibilidad con ComfyUI y Diffusers, lo que facilita su integración en flujos de trabajo existentes. La inclusión de un Turbo LoRA de 8 pasos con CFG 1.0 (aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0) lo hace atractivo para aplicaciones interactivas. Sin embargo, la ausencia de benchmarks publicados y el origen no oficial del adaptador (ChatR Labs, no Qwen) exigen cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (texto-a-imagen), basado en Qwen-Image-2.1 |
| Parámetros totales | 7.115.124.736 (transformer, dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del text encoder del modelo base) |
| Tipos de cuantización | GGUF BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0; FP8 E4M3; INT8 ConvRot; NVFP4; FP8 (torchao); NF4 (bitsandbytes); INT8 (bitsandbytes); BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia "other" según el repositorio) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, BF16), directorios torchao y bitsandbytes |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen-Image-2.1, un transformer de difusión para generación y edición de imágenes. Sobre este modelo base, ChatR Labs entrenó un adaptador LoRA de rango 128 denominado "Omni", que se fusionó con el modelo base a fuerza 1.0 y posteriormente se cuantizó. El resultado es un transformer con 7.115 millones de parámetros que conserva la estructura del modelo original, incluyendo dos representaciones de MLP distintas según el layout: el layout de 297 tensores mantiene las proyecciones separadas `gate_layer` / `proj`, mientras que el layout de 265 tensores usa la proyección fusionada `img_mlp.gate_up`. Esta diferencia es crítica para los cargadores, que deben soportar el layout seleccionado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el adaptador. La model card menciona que el modelo no está destilado para pocos pasos y que, para generación en 8 pasos, debe añadirse un Turbo LoRA separado (chatrlabs-omni-turbo-8step-fp32.safetensors). La infraestructura de GPU para el entrenamiento fue proporcionada por Chatr AI. La innovación técnica principal es la disponibilidad de múltiples formatos de cuantización con distintos layouts y runtimes, así como la compatibilidad con ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4) y Diffusers (GGUF, FP8 torchao, NF4, INT8 bitsandbytes, BF16).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de salida de 768x1152 o 1024x1024.
- Edición de imágenes (image-editing) según la etiqueta del repositorio, aunque la model card no detalla el flujo de edición.
- Generación sin censura ("uncensored"): el adaptador reduce las restricciones de contenido del modelo base.
- Generación rápida en 8 pasos con CFG 1.0 mediante el Turbo LoRA opcional, aproximadamente 6-7 veces más rápido que la configuración estándar.
- Compatibilidad con ComfyUI mediante GGUF, FP8, INT8 ConvRot y NVFP4, y con Diffusers mediante GGUF, FP8 torchao, NF4, INT8 bitsandbytes y BF16.
- Soporte de KV cache para inferencia.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Generación de ilustraciones conceptuales en estudios de diseño: el modelo puede producir imágenes a 1024x1024 con 35 pasos y CFG 5.0, y la variante Q4_K_M (4,47 GB) permite ejecutarlo en GPUs de consumo con VRAM moderada, agilizando la iteración creativa.
- Creación de contenido visual para prototipos de aplicaciones: con el Turbo LoRA de 8 pasos, se pueden generar imágenes en segundos, lo que facilita la integración en herramientas de diseño interactivo y la validación rápida de conceptos.
- Edición de imágenes en flujos de posproducción: la capacidad de image-editing del adaptador permite modificar imágenes existentes, aunque requiere validar el flujo con el text encoder y VAE del modelo base.
- Despliegue en entornos con VRAM limitada: la variante NF4 (3,67 GB) o NVFP4 (4,20 GB) permite ejecutar el modelo en GPUs de 8 GB, ampliando el acceso a hardware de consumo.
- Investigación sobre modelos de difusión sin restricciones: el adaptador "uncensored" sirve para estudiar el comportamiento de modelos de generación de imagen con menos filtros, siempre que se respeten las limitaciones legales y éticas.
- Integración en ComfyUI para pipelines de generación por lotes: los archivos GGUF y FP8 se cargan directamente en ComfyUI, lo que permite automatizar la generación de imágenes en flujos de trabajo existentes.
- Experimentación con cuantización en Diffusers: las variantes torchao y bitsandbytes permiten comparar la fidelidad y el rendimiento de distintas técnicas de cuantización en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, sin text encoder ni VAE): NF4 3,67 GB; NVFP4 4,20 GB; Q4_0 4,20 GB; Q4_K_M 4,47 GB; Q5_K_M 5,21 GB; Q6_K 6,00 GB; FP8/INT8 7,12-7,26 GB; Q8_0 7,69 GB; BF16 14,23 GB. A esta cifra hay que sumar la VRAM del text encoder y del VAE del modelo base.
- GPU recomendadas: para BF16, una GPU con 24 GB o más (RTX 4090, A100, H100). Para FP8/INT8, 16 GB o más (RTX 4080, A10G). Para Q4_K_M o NF4, 8-12 GB (RTX 3060 12 GB, RTX 4070).
- Cabe en GPU de consumo: sí, en variantes cuantizadas (NF4, Q4_K_M, Q5_K_M) con GPUs de 8-12 GB, siempre que se añada la VRAM del text encoder y VAE.
- Opciones de despliegue: ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4), Diffusers (GGUF vía `from_single_file`, FP8 torchao, NF4/INT8 bitsandbytes, BF16 `from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusión.
- Latencia y throughput: no disponibles. La model card indica que el Turbo LoRA de 8 pasos es aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0, pero no proporciona cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115 M (transformer) | no disponible | qwen-research | GGUF, FP8, INT8, NVFP4, NF4, BF16 | Adaptador uncensored, multi-cuantización |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | qwen-research | safetensors | Modelo base oficial, sin adaptador uncensored |
| Otros modelos de difusión texto-a-imagen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, Stable Diffusion 3, FLUX.1 o SDXL) en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El adaptador es de origen no oficial (ChatR Labs), no de Qwen; su calidad y fidelidad respecto al modelo base no están verificadas por benchmarks publicados.
- La etiqueta "uncensored" implica que el modelo puede generar contenido no filtrado; su uso en producción conlleva riesgos legales y éticos según la jurisdicción.
- La licencia qwen-research puede restringir el uso comercial; es necesario revisar el archivo LICENSE del repositorio base antes de desplegar en producción.
- El repositorio solo incluye el transformer cuantizado; el text encoder, el processor y el VAE deben obtenerse del modelo base, lo que añade complejidad y VRAM adicional.
- Los layouts de 297 y 265 tensores son incompatibles entre sí; un cargador que no soporte el layout seleccionado fallará.
- No se han publicado benchmarks; no hay evidencia cuantitativa de calidad, fidelidad o rendimiento frente al modelo base.
- Riesgo de alucinación visual y artefactos inherente a los modelos de difusión, especialmente en resoluciones altas o prompts complejos.
- No se dispone de información sobre sesgos, idiomas soportados ni limitaciones de contexto.
- La fecha de creación del repositorio (2026-11-22) y la ausencia de descargas o likes sugieren que el modelo no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kejabbfii/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Turbo LoRA (8 pasos): https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/chatrlabs-omni-turbo-8step-fp32.safetensors
- Playground de ChatR Labs: https://thechatr.ai/playground
- Chatr AI: https://thechatr.ai
