# chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una compilación de pesos cuantizados del modelo de difusión Qwen-Image-2.1 de Alibaba Qwen, publicada por el usuario chatrlabs. No es un modelo entrenado desde cero: se trata de un adaptador LoRA de rango 128 (denominado Omni) fusionado sobre el transformer de Qwen-Image-2.1 con fuerza 1.0 y posteriormente cuantizado en múltiples formatos. El resultado es un modelo de texto-a-imagen y edición de imágenes con 7.115 millones de parámetros en el transformer, orientado a generar contenido sin las restricciones de censura del modelo base.

La relevancia de esta ficha radica en su doble naturaleza: por un lado, demuestra el ecosistema de cuantización moderna (GGUF, FP8, INT8, NVFP4, NF4) aplicado a modelos de difusión; por otro, plantea consideraciones éticas y legales importantes, ya que el modelo se distribuye bajo licencia qwen-research pero incorpora una modificación explícitamente orientada a eliminar restricciones de contenido. El repositorio ocupa 92,5 GB e incluye únicamente los pesos del transformer cuantizados; el codificador de texto, el procesador y el VAE deben tomarse del repositorio base.

Con 160.748 descargas y 524 likes en el momento de la consulta, el modelo ha tenido una adopción notable en la comunidad de ComfyUI y Diffusers, especialmente entre usuarios que buscan alternativas sin filtros para generación de imágenes. Su pipeline es text-to-image y su librería principal es diffusers, aunque ofrece compatibilidad explícita con ComfyUI mediante archivos GGUF y safetensors con operadores nativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base Qwen-Image-2.1), con adaptador LoRA de rango 128 fusionado |
| Parámetros totales | 7.115.124.736 (transformer) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 (torchao), NF4 (bitsandbytes), INT8 (bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | qwen-research (licencia de investigación de Qwen) |
| Formato de pesos | safetensors (BF16, FP8, INT8, NVFP4), GGUF, directorios torchao y bitsandbytes |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un transformer de difusión para generación y edición de imágenes. Sobre él, chatrlabs ha fusionado un adaptador LoRA de rango 128 con fuerza 1.0, que constituye la modificación "Omni" y "uncensored". No se trata de un reentrenamiento completo ni de un proceso de destilación: la model card indica explícitamente que "es una fusión LoRA normal; no proporciona destilación de pocos pasos". Los pesos resultantes se han cuantizado en varios formatos, con dos disposiciones de tensores distintas: 297 tensores (que mantiene los pares separados `gate_layer` / `proj` en el MLP) y 265 tensores (que usa la proyección fusionada `img_mlp.gate_up`). El cargador debe soportar la disposición seleccionada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card se centra en los aspectos de cuantización y despliegue. La innovación técnica destacable es la variedad de formatos de cuantización ofrecidos y la compatibilidad con dos ecosistemas (ComfyUI y Diffusers), incluyendo operadores nativos como NVFP4 para GPUs Blackwell y FP8 con torchao. El checkpoint corresponde al paso 90.000 de entrenamiento (step90000).

## Capacidades

- Generación de texto a imagen (text-to-image) con resolución de salida de 768x1152 o 1024x1024.
- Edición de imágenes (image-editing): permite codificar una imagen de referencia mediante el nodo Text Encoder (Qwen-Image) en modo edición.
- Generación sin censura: el adaptador Omni elimina las restricciones de contenido del modelo base, permitiendo temáticas que el modelo original rechazaría.
- Compatibilidad con ComfyUI mediante cargadores GGUF (`Unet Loader (GGUF)`) y safetensors nativos (`Load Diffusion Model`).
- Compatibilidad con Diffusers mediante `from_single_file` para GGUF y `from_pretrained` para los directorios BF16, torchao y bitsandbytes.
- Soporte de KV cache para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo explícito, dado que es un modelo de difusión y no un LLM.

## Casos de uso

- Generación de ilustración conceptual sin restricciones temáticas: el adaptador Omni permite explorar estilos y contenidos que el modelo base filtraría, útil en entornos de investigación artística y prototipado creativo.
- Edición de imágenes en flujos de trabajo de ComfyUI: mediante el nodo Text Encoder en modo edición, se puede modificar una imagen de referencia con instrucciones textuales, integrándose en pipelines de posproducción.
- Despliegue en GPUs de consumo: la variante NF4 (3,67 GB) o GGUF Q4_0 (4,20 GB) permite ejecutar el transformer en GPUs con 8 GB de VRAM, facilitando pruebas locales sin infraestructura dedicada.
- Investigación sobre cuantización de modelos de difusión: el repositorio ofrece el mismo checkpoint en siete formatos distintos, lo que permite comparar fidelidad y rendimiento entre BF16, FP8, INT8 y NVFP4 en una misma tarea.
- Generación de imágenes por lotes en servidores con GPUs Blackwell: la variante NVFP4 (4,20 GB) aprovecha los operadores nativos de cuarta generación para maximizar el throughput en hardware reciente.
- Integración en aplicaciones de diseño asistido: con 35 pasos de muestreo y CFG 5.0, el modelo produce resultados consistentes en resoluciones estándar, adecuado para herramientas de generación de borradores visuales.
- Evaluación de sesgos y seguridad en IA generativa: al ser una versión "uncensored", sirve como caso de estudio para analizar qué contenidos genera un modelo sin filtros y diseñar mitigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer): desde 3,67 GB (NF4) hasta 14,23 GB (BF16), según la cuantización.
- El codificador de texto y el VAE del modelo base añaden requisitos adicionales de VRAM no especificados en la información disponible.
- GPU recomendadas: no se especifican modelos concretos; la variante NVFP4 requiere GPUs con soporte de ese formato (arquitectura Blackwell), y la FP8 requiere soporte de FP8 E4M3.
- Cabe en GPU de consumo: la variante NF4 (3,67 GB) y la GGUF Q4_0 (4,20 GB) son las más ligeras; la BF16 (14,23 GB) requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4, BF16 con `UNETLoader` en versión 0.39.0) y Diffusers (GGUF vía `from_single_file`, BF16, FP8 torchao, NF4/INT8 bitsandbytes).
- Latencia y throughput: no disponibles.
- Configuración recomendada: 35 pasos de muestreo, true CFG 5.0, sampler `er_sde` con scheduler `simple`, prompt negativo de un solo espacio, KV cache activada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115 M (transformer) | No disponible | qwen-research | GGUF, safetensors, FP8, INT8, NVFP4, NF4 | Adaptador LoRA rango 128 fusionado, orientado a contenido sin censura |
| Qwen/Qwen-Image-2.1 (base) | No disponible en la información | No disponible | qwen-research | safetensors | Modelo original sin modificar; incluye codificador de texto, procesador y VAE |
| Otras variantes cuantizadas de Qwen-Image | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks comparativos con alternativas de la misma categoría, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eliminar la censura, lo que puede generar contenido inapropiado, ofensivo o ilegal según la jurisdicción; su uso en producción requiere moderación externa.
- La licencia qwen-research puede restringir el uso comercial; es imprescindible revisar los términos de la licencia de Qwen antes de cualquier despliegue comercial.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar imágenes incoherentes o con artefactos, especialmente en cuantizaciones agresivas (Q4_0, NF4).
- Las cuantizaciones de 4 bits (Q4_K_M, Q4_0, NF4) sacrifican fidelidad frente a BF16; no se han publicado métricas de degradación en la información disponible.
- La disposición de tensores (297 vs 265) debe coincidir con el cargador; usar un cargador incompatible puede provocar errores de carga.
- El prompt negativo vacío desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; se recomienda usar un espacio para mantener el comportamiento esperado.
- No se documentan idiomas soportados ni sesgos específicos; se desconoce el comportamiento multilingüe del codificador de texto del modelo base.
- El repositorio solo incluye los pesos del transformer; el codificador de texto, el procesador y el VAE deben obtenerse del repositorio base, lo que añade dependencias y tamaño de descarga.
- La fecha de creación (2026-11-03) y actualización (2026-11-14) indican un modelo reciente; puede haber cambios en la compatibilidad de cargadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground: https://chatrlabs.com/
- Chatr AI (patrocinador de infraestructura): https://thechatr.ai
- Archivo de integridad SHA256SUMS: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/SHA256SUMS
- Workflow de ejemplo para ComfyUI: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/workflow_example.json
