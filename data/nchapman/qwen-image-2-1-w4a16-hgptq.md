# nchapman/Qwen-Image-2.1-W4A16-HGPTQ

## Resumen

Qwen-Image-2.1-W4A16-HGPTQ es una cuantización de precisión reducida del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario nchapman mediante su herramienta warp-quant. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos BF16 originales a un esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) con rotaciones Hadamard y calibración GPTQ, que reduce el tamaño del pipeline completo de 32,45 GiB a 9,82 GiB (factor de compresión de 3,31x).

El pipeline incluye tres submodelos: un codificador de texto Qwen3VLForConditionalGeneration (36 capas de decodificador más 27 bloques ViT y los mergers asociados), un transformer de difusión QwenImage21Transformer2DModel con 32 bloques DiT de flujo único y RoPE 3D (224 capas lineales), y un VAE AutoencoderKLQwenImage21 que se mantiene sin modificar en BF16. La cuantización aplica W4_g64 con Hadamard online H64 en el codificador de texto y el transformer, además de un ajuste de cuantización (QAT) de 120 pasos sobre estados ocultos de la capa 35 del codificador y sobre la velocidad del bloque 31 del DiT.

Su relevancia radica en que permite ejecutar un pipeline de generación y edición de imágenes de aproximadamente 16B de parámetros en GPUs de consumo con alrededor de 10,2 GiB de VRAM si se mantienen ambos submodelos comprimidos, conservando una fidelidad alta frente al profesor BF16 (coseno de velocidad DiT de 0,9986 y PSNR de imagen decodificada de 23,09 dB). La licencia Apache-2.0 heredada facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion: codificador de texto Qwen3VLForConditionalGeneration (transformer + ViT) + DiT QwenImage21Transformer2DModel (32 bloques single-stream con RoPE 3D) + VAE AutoencoderKLQwenImage21 |
| Parametros totales | 1.117.270.464 (segun safetensors del repo); el pipeline completo se describe como 16B (8,77B del codificador Qwen3VL + 7,12B del DiT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con grupos de 64 (g64) y Hadamard online H64; W8_g64 sin rotar en lm_head; VAE en BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen-Image-2.1) |
| Formato de pesos | safetensors con compressed-tensors en modo pack-quantized (int32 empaquetado para 4 bits) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un pipeline de difusión para texto-a-imagen y edición imagen-a-imagen. Esta versión cuantizada conserva la estructura completa pero sustituye los pesos del codificador de texto y del transformer DiT por versiones de 4 bits. El codificador de texto tiene 36 capas de decodificador y 27 bloques ViT, con mergers y deepstack_merger_list.0..2 para integrar información visual. El DiT consta de 32 bloques single-stream con RoPE 3D y 224 capas lineales; los módulos img_in, txt_in, proj_out, time_text_embed, modulation.1 y norm_out.linear se mantienen en BF16 para preservar estabilidad numérica.

La receta de cuantización combina GPTQ secuencial bloque a bloque con calibración de trayectoria, rotaciones Hadamard online H64 (g0_text, g2_vision, g0_dit) y una Hadamard por canal H16 en visual.blocks.*.mlp.linear_fc2 con K=4304. Además se aplica un QAT de 120 pasos: normalización de estados ocultos no normalizados en la capa 35 del codificador (reducción del 24,7% del MSE de validación) y QK-Norm de velocidad en el bloque 31 del DiT. El resultado se empaqueta con compressed-tensors en formato pack-quantized. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable, incluyendo 1024x1024 en el ejemplo de uso.
- Edición de imágenes con referencia (image-to-image / TI2I), según la evaluación con prompts de edición sobre data/vision-probe-v2.
- Control fino del proceso de muestreo mediante FlowMatch con pasos de inferencia configurables (16 o 30 pasos en los ejemplos) y true_cfg_scale para guiado por classifier-free guidance.
- Codificación de texto e imagen conjunta mediante el codificador Qwen3VL, que integra 36 capas de decodificador y 27 bloques ViT.
- Reproducibilidad determinista mediante semilla explícita en el generador de PyTorch.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Generación de ilustraciones y carteles para productos digitales: el pipeline acepta prompts detallados con texto integrado en la imagen (el ejemplo oficial genera un cartel de neón con la cadena "QWEN IMAGE 2.1"), lo que resulta útil para prototipado rápido de creatividades.
- Edición de imágenes con referencia en flujos de retoque: la capacidad TI2I permite modificar una imagen existente guiada por un prompt, adecuada para variaciones de producto o ajustes de estilo sin reentrenamiento.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar aproximadamente 10,2 GiB con ambos submodelos comprimidos, cabe en GPUs de 12-16 GB, lo que habilita generación local sin depender de servicios en la nube.
- Prototipado de pipelines de difusión en investigación: la fidelidad medida frente al profesor BF16 (coseno de latentes end-to-end de 0,9799 y PSNR de 23,09 dB) permite usar esta versión como sustituto ligero en experimentos de muestreo y calibración.
- Generación por lotes en entornos con VRAM limitada: la compresión de 3,31x reduce el coste de almacenamiento y el tiempo de carga del pipeline en comparación con los 32,45 GiB en BF16.
- Integración en aplicaciones creativas con diffusers: al usar la API estándar de diffusers mediante load_qwen_image_pipeline, se puede incorporar en herramientas de diseño, demostraciones o generación asistida por prompt.
- Evaluación comparativa de técnicas de cuantización: la model card publica métricas de fidelidad (coseno de velocidad, SQNR, PSNR) que sirven como referencia para comparar recetas GPTQ con Hadamard frente a otras alternativas.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---:|---|
| Coseno de velocidad DiT (teacher-forced) | 0,998624 (99,86%) | Similitud media paso a paso en pasos FlowMatch tempranos, medios y tardíos |
| SQNR de velocidad DiT (teacher-forced) | 26,61 dB | RMSE relativo de 0,04986 (4,99%) |
| Coseno de prompt embeds del codificador de texto | 0,951179 | Estados ocultos no normalizados de la capa 35; SQNR de 13,52 dB |
| Coseno de latentes end-to-end (16 pasos) | 0,979887 (97,99%) | Trayectoria FlowMatch completa con la misma semilla de ruido inicial; SQNR de 15,44 dB |
| PSNR medio de imagen decodificada end-to-end | 23,09 dB | Píxeles RGB frente a la trayectoria del profesor BF16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de imágenes y no de texto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,2 GiB en GPU si se mantienen comprimidos tanto el codificador de texto como el transformer (keep_text_encoder_compressed=True y keep_transformer_compressed=True). Con solo el codificador comprimido, la huella es menor pero no se especifica en la información disponible.
- Tamaño en disco: 9,82 GiB para el repositorio completo (frente a 32,45 GiB en BF16).
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por la huella de memoria, encaja en GPUs de consumo con 12-16 GB de VRAM; para mayor margen se recomiendan GPUs profesionales tipo A100 o H100, aunque no hay datos publicados de latencia o throughput.
- Compatibilidad con GPU de consumo: sí, siempre que se disponga de al menos 12 GB de VRAM y se mantengan los submodelos comprimidos.
- Opciones de despliegue: diffusers junto con la librería warp-quant (función load_qwen_image_pipeline). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un pipeline de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/Qwen-Image-2.1-W4A16-HGPTQ | Pipeline de aproximadamente 16B (1.117.270.464 en safetensors); 9,82 GiB en disco | no disponible | safetensors, compressed-tensors W4A16 | Apache-2.0 | Hugging Face |
| Qwen/Qwen-Image-2.1 (modelo base) | Pipeline de aproximadamente 16B; 32,45 GiB en BF16 | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face |
| Otras cuantizaciones de Qwen-Image-2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de otros autores con datos de rendimiento verificables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, introduce degradación numérica respecto al modelo BF16: el PSNR de imagen decodificada es de 23,09 dB y el coseno de prompt embeds baja a 0,9512, lo que puede afectar a la fidelidad en prompts complejos o con texto integrado.
- El VAE se mantiene en BF16, por lo que no se beneficia de la compresión y sigue consumiendo memoria y cómputo en precisión completa.
- No se dispone de información sobre sesgos del modelo base ni sobre riesgos de generación de contenido inapropiado; se recomienda aplicar filtros y políticas de uso en producción.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir texto ilegible, anatomías incorrectas o detalles inconsistentes, especialmente en resoluciones altas o prompts ambiguos.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador Qwen3VL no se detalla en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de Qwen/Qwen-Image-2.1 antes de desplegar en producción.
- El repositorio no registra descargas ni likes y fue creado en 2026, por lo que carece de validación comunitaria amplia; la receta depende de la librería warp-quant, cuyo mantenimiento y compatibilidad con versiones futuras de diffusers no están garantizados.
- No se documentan límites de longitud de contexto ni de resolución máxima soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen-Image-2.1-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de la herramienta de cuantización warp-quant: https://github.com/nchapman/warp34-quant-lab
- Revisión del modelo base referenciada: d26bb61231c349cf6b7896fa83353113880e1ba3
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
