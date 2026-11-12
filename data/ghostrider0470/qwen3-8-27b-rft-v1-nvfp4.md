# ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4

## Resumen

Qwen3.8-27B-RFT-v1-NVFP4 es una cuantización NVFP4 (4 bits en coma flotante para pesos y activaciones) del modelo multimodal Qwen3.8-27B-RFT-v1, publicado por el usuario ghostrider0470. El modelo base es un transformer multimodal de tipo image-text-to-text, presumiblemente derivado de la familia Qwen, con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones) y refinado mediante RFT (Rejection Fine-Tuning) según indica su nombre. Esta versión cuantizada reduce el peso en disco de unos 52 GB a unos 20,6 GB, lo que facilita su despliegue en GPUs con soporte nativo de FP4.

La relevancia de esta ficha radica en que se trata de una cuantización de precisión mixta orientada a hardware NVIDIA con aceleración FP4, empaquetada con llm-compressor y compressed-tensors, y servible mediante vLLM. No obstante, el propio autor advierte de que el checkpoint no ha sido evaluado frente al modelo sin cuantizar, por lo que no existen datos de rendimiento publicados y las métricas del modelo padre deben tomarse como cota superior.

El modelo conserva la torre de visión y la cabeza MTP (multi-token prediction) en precisión completa, lo que sugiere una arquitectura híbrida con atención lineal y predicción multi-token, aunque la información pública disponible sobre el modelo base es muy limitada y muchos detalles técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atención lineal y cabeza MTP; detalles completos no disponibles |
| Parametros totales | 27.781.427.952 (aprox. 27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante para pesos y activaciones); capas Linear cuantizadas, resto en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); incluye `model_mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo image-text-to-text con 27,8 mil millones de parámetros. La model card de la cuantización menciona explícitamente capas de atención lineal (proyecciones `in_proj_a` e `in_proj_b`) y una cabeza MTP (multi-token prediction), lo que apunta a una arquitectura híbrida con mecanismos de atención lineal combinados con atención estándar y decodificación multi-token. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base.

El proceso de cuantización se realizó con llm-compressor 0.15.0 y compressed-tensors 0.20.1, aplicando `QuantizationModifier(targets="Linear", scheme="NVFP4")` con un pipeline secuencial por capa del decodificador. La calibración utilizó 512 conversaciones de `HuggingFaceH4/ultrachat_200k`, con hasta 2.048 tokens por muestra. Se mantuvieron en precisión completa el `lm_head`, la torre de visión, los embeddings de tokens, las proyecciones `in_proj_a` e `in_proj_b` de las capas de atención lineal y la cabeza MTP. Esta última se copió sin modificar desde el modelo base (`model_mtp.safetensors`) y no fue reentrenada para RFT v1.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (image-text-to-text) y las etiquetas `conversational`.
- Procesamiento de imágenes junto con texto (entrada image-text-to-text), al conservarse la torre de visión en precisión completa.
- Razonamiento y generación de texto derivados del modelo base Qwen3.8-27B-RFT-v1, si bien no se detallan capacidades específicas en la información disponible.
- Predicción multi-token (MTP) mediante la cabeza conservada del modelo base, potencialmente útil para decodificación especulativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 27,8 B en GPUs con FP4 nativo: la cuantización reduce el peso a unos 20,6 GB, lo que permite servirlo en una sola GPU con soporte FP4 mediante `vllm serve`, en lugar de requerir los ~52 GB del modelo completo.
- Asistentes conversacionales con entrada de imagen: al conservar la torre de visión en precisión completa, el modelo puede recibir imágenes y texto y generar respuestas, adecuado para interfaces de chat multimodal.
- Prototipado e investigación en entornos con VRAM limitada: el tamaño reducido permite experimentar con un modelo de 27,8 B en hardware de gama alta de consumo o profesional sin renunciar a la modalidad visual.
- Evaluación de pipelines de cuantización NVFP4: sirve como caso de estudio para medir la pérdida de precisión de llm-compressor y compressed-tensors en un modelo multimodal de este tamaño.
- Servicio de inferencia con vLLM en producción interna: la integración con vLLM y el formato compressed-tensors facilitan el despliegue en clústeres con GPUs NVIDIA compatibles con FP4.
- Generación de descripciones o respuestas sobre documentos con imágenes: el pipeline image-text-to-text permite tareas de comprensión visual acompañadas de generación de texto, siempre que se valide la calidad tras la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint no ha sido evaluado frente al modelo sin cuantizar y que las puntuaciones de la model card del modelo padre deben considerarse una cota superior.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,6 GB solo para los pesos en NVFP4; con caché KV y overhead de runtime, se recomienda al menos 24-32 GB de VRAM.
- GPU recomendadas: GPUs NVIDIA con soporte nativo de FP4 (arquitecturas Blackwell, como B200 o RTX 50 series); el autor indica que debe servirse en una GPU con soporte FP4.
- ¿Cabe en GPU de consumo? Potencialmente en GPUs de consumo con FP4 nativo y 24 GB o más de VRAM; no confirmado para modelos concretos.
- Opciones de despliegue: vLLM (recomendado por el autor), junto con Transformers + compressed-tensors para carga y pruebas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-RFT-v1-NVFP4 | 27,8 B | no disponible | NVFP4 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.8-27B-RFT-v1 (base) | 27,8 B | no disponible | BF16/FP16 (aprox. 52 GB) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de otras familias en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Pérdida de precisión esperable: cualquier cuantización a 4 bits introduce una degradación de exactitud; el autor advierte de que no se ha medido frente al modelo sin cuantizar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad tras la cuantización; las métricas del modelo padre no son representativas.
- Dependencia de hardware: NVFP4 requiere GPUs NVIDIA con soporte nativo de FP4; no es portable a GPUs sin esa capacidad.
- Cabeza MTP no reentrenada: se copió sin cambios desde el modelo base, por lo que su comportamiento con los pesos cuantizados no está validado.
- Idiomas no declarados: no se especifican los idiomas soportados, lo que dificulta evaluar su idoneidad multilingüe.
- Contexto no disponible: se desconoce la longitud máxima de contexto, un dato crítico para aplicaciones de documento largo.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación; al derivar de un modelo base con RFT, hereda los riesgos del mismo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibración (`HuggingFaceH4/ultrachat_200k`).
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (11 de noviembre de 2026), lo que indica un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4
- Modelo base: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
