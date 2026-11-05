# chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una compilación de pesos cuantizados del transformer de difusión de Qwen/Qwen-Image-2.1, publicada por chatrlabs. No se trata de un modelo entrenado desde cero, sino de un merge de un adaptador LoRA de rango 128 (denominado "Omni") sobre el modelo base, aplicado a fuerza 1.0 y posteriormente cuantizado en múltiples formatos. El repositorio contiene exclusivamente los pesos del transformer; el text encoder, el procesador y el VAE deben tomarse del repositorio original de Qwen.

El modelo resuelve dos tareas: generación de imágenes a partir de texto (text-to-image) y edición de imágenes (image-editing), con la particularidad de que el adaptador aplicado elimina los filtros de contenido del modelo base, de ahí la etiqueta "uncensored". Está pensado para su uso en ComfyUI y en Diffusers, con builds específicos para cada runtime y layouts de pesos incompatibles entre ambos.

Con 7.115.124.736 parámetros en el transformer y un repositorio de 92,5 GB que agrupa todas las variantes, el interés actual reside en la variedad de formatos de cuantización ofrecidos (GGUF, FP8, INT8, NVFP4, NF4, BF16), que permiten desplegar el modelo desde 3,67 GB hasta 14,23 GB según el equilibrio entre fidelidad y requisitos de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen-Image-2.1), con adaptador LoRA rango 128 fusionado |
| Parámetros totales | 7.115.124.736 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 (torchao), NF4 (bitsandbytes), INT8 (bitsandbytes) |
| Idiomas soportados | No disponible (modelo texto-a-imagen; el text encoder procede del base) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un transformer de difusión para generación y edición de imágenes. Sobre él, chatrlabs aplicó un adaptador LoRA de rango 128 ("Omni") fusionado a fuerza 1.0, y después cuantizó el transformer resultante. No se trata de un proceso de destilación: la model card indica explícitamente que es un merge LoRA normal y que no incorpora destilación de pocos pasos, por lo que requiere el número completo de pasos de muestreo (35 recomendados).

No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens, la composición de los datos ni si hubo etapas de RLHF o DPO. El único dato de entrenamiento mencionado es el checkpoint "step90000" que aparece en los nombres de archivo. La innovación técnica destacable no está en la arquitectura sino en la ingeniería de cuantización: se ofrecen dos layouts de pesos distintos (297 claves para Diffusers, con `gate_layer`/`proj` separados; 265 claves para ComfyUI, con `img_mlp.gate_up` fusionado), y cargar un layout en el runtime equivocado provoca un fallo.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes: codifica una imagen de referencia con el nodo `Text Encoder (Qwen-Image)` en modo edición y genera una variante editada.
- Salida sin filtrado de contenido del modelo base (variante "uncensored"), lo que amplía el rango de prompts aceptados.
- Compatibilidad con ComfyUI mediante cargadores GGUF (`Unet Loader (GGUF)`) y cargadores nativos (`Load Diffusion Model`) para FP8, INT8 ConvRot y NVFP4.
- Compatibilidad con Diffusers mediante `QwenImage21Pipeline` y `QwenImage21Transformer2DModel`, con soporte de `from_single_file` para GGUF y `from_pretrained` para las carpetas cuantizadas.
- Control de fidelidad mediante true CFG (escala 5.0 recomendada) y prompt negativo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Generación de ilustración y arte conceptual: con 35 pasos, sampler `er_sde` y CFG 5.0 se obtienen imágenes de 768x1152 o 1024x1024; la variante sin censura permite explorar temáticas que el modelo base rechazaría.
- Edición de imágenes en flujo de trabajo: se codifica la imagen original con el text encoder en modo edición y se aplica una instrucción textual para modificar elementos concretos, útil para retoque y variaciones de producto.
- Despliegue en estaciones de trabajo con GPU de consumo: el build Q4_K_M (4,47 GB) o NF4 (3,67 GB) permite ejecutar el transformer en GPUs con 8-12 GB de VRAM, dejando margen para el text encoder y el VAE.
- Prototipado rápido en ComfyUI: el GGUF Q8_0 (7,69 GB) es un único archivo que sirve tanto para text-to-image como para edición, lo que simplifica la configuración de nodos.
- Investigación sobre alineación y filtrado de contenido: la comparación entre el modelo base y esta variante permite estudiar qué tipo de prompts se ven afectados por los filtros y cómo cambia la distribución de salidas.
- Integración en pipelines de Diffusers: la carpeta FP8 (torchao) o NF4 (bitsandbytes) se carga con `from_pretrained` y `enable_model_cpu_offload()`, lo que facilita incorporar el modelo a servicios Python existentes.
- Generación por lotes en servidores con VRAM limitada: NVFP4 (4,20 GB) o Q4_0 (4,20 GB) reducen el peso del transformer y permiten mayor concurrencia, a costa de cierta pérdida de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta los ajustes de inferencia recomendados (35 pasos, true CFG 5.0, sampler `er_sde` con scheduler `simple`, prompt negativo de un espacio, resolución 768x1152 o 1024x1024, KV cache activada), sin métricas cuantitativas de calidad, FID, CLIP score ni latencia.

## Requisitos de hardware

- VRAM estimada para el transformer: 14,23 GB en BF16; 7,69 GB en Q8_0; 7,12 GB en FP8 o INT8; 4,47 GB en Q4_K_M; 3,67 GB en NF4. Hay que sumar la memoria del text encoder y del VAE del modelo base.
- GPU recomendadas: A100 o H100 para BF16 con lotes y alta concurrencia; RTX 4090 (24 GB) para BF16 o FP8 con holgura; RTX 4080/4070 Ti (12-16 GB) para Q8_0 o FP8; RTX 3060/4060 (8-12 GB) para Q4_K_M, Q4_0 o NF4.
- Cabe en GPU de consumo: sí, con los builds Q4_K_M, Q4_0, NVFP4 y NF4 en tarjetas de 8 GB o más, asumiendo que el text encoder y el VAE se carguen con offload o en precisión reducida.
- Opciones de despliegue: ComfyUI (GGUF vía `Unet Loader (GGUF)`, FP8/INT8 ConvRot/NVFP4 vía `Load Diffusion Model`), Diffusers (`from_single_file` para GGUF, `from_pretrained` para carpetas FP8 torchao, NF4 e INT8 bitsandbytes, BF16 safetensors). No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115 M | No disponible | qwen-research | GGUF, safetensors (FP8, INT8, NVFP4, NF4, BF16) | Variante sin censura, solo transformer |
| Qwen/Qwen-Image-2.1 | No disponible en la información | No disponible | qwen-research | No disponible en la información | Modelo base oficial, incluye text encoder, procesador y VAE |
| Otras variantes cuantizadas de Qwen-Image-2.1 | No disponible | No disponible | qwen-research | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos de la misma categoría (por ejemplo, otros transformers de difusión de tamaño comparable) que permita una comparación de rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- La licencia qwen-research es restrictiva; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- La variante "uncensored" elimina los filtros de contenido del modelo base, lo que implica riesgo de generar material no apto y responsabilidad legal para el desplegador.
- Los layouts de 297 y 265 claves no son intercambiables: cargar un archivo de 265 en Diffusers o uno de 297 en el cargador nativo de ComfyUI provoca error.
- El repositorio solo contiene el transformer; sin el text encoder, el procesador y el VAE del modelo base el pipeline no funciona.
- No hay destilación de pocos pasos: reducir los 35 pasos recomendados degrada la calidad.
- Un prompt negativo vacío u omitido desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; hay que usar un espacio.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática del text encoder.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento real de los builds.
- El tamaño del repo (92,5 GB) obliga a descargar selectivamente el archivo o carpeta necesarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground del autor: https://chatrlabs.com/
- Archivo de integridad SHA256SUMS: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/LICENSE
