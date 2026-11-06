# Ambarella/SigLIP2

## Resumen

SigLIP2 es un codificador visión-lenguaje multilingüe desarrollado originalmente por Google Research (Michael Tschannen et al., 2025) que extiende el objetivo de entrenamiento SigLIP original con captioning, autodestilación, predicción enmascarada y una curación de datos mejorada. Este repositorio concreto, publicado por Ambarella, contiene los pesos del modelo convertidos y optimizados para su despliegue en los SoC de visión de Ambarella (N1-655, X7, CV7, CV72 y CV75), no los pesos originales en formato PyTorch estándar.

La variante empaquetada aquí es SigLIP2-Base-Patch16-224: un codificador visual ViT-Base con parches de 16×16 píxeles, resolución de entrada 3×224×224 y aproximadamente 86M de parámetros, acompañado de un codificador de texto. Está pensado para clasificación zero-shot de imágenes, recuperación imagen-texto y como codificador visual en sistemas VLM y tareas de visión downstream.

Su relevancia radica en que permite ejecutar un codificador visión-lenguaje moderno y multilingüe en hardware de borde (edge AI) para cámaras y sistemas embebidos, algo poco habitual, ya que la mayoría de despliegues de SigLIP2 se realizan en GPU de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-Base (codificador visual) + codificador de texto; parches 16×16 |
| Parámetros totales | ~86M (codificador visual) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión-lenguaje, no generativo) |
| Tipos de cuantización | no disponible; los binarios incluidos usan precisión `act16` (activaciones de 16 bits) |
| Idiomas soportados | multilingüe (según paper); lista concreta no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios `.bin` específicos de Ambarella (N1-655, X7, CV7, CV72, CV75); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

SigLIP2 se basa en un transformer de visión (ViT) con parches de 16×16 y resolución 224×224, emparejado con un codificador de texto, entrenado con una función de pérdida sigmoidea sobre pares imagen-texto. El paper original amplía el objetivo con captioning, autodestilación, predicción enmascarada y una curación de datos mejorada, lo que según los autores mejora la comprensión semántica, la localización y las representaciones visuales densas.

Este repositorio de Ambarella no documenta el proceso de entrenamiento propio: parte de los pesos de referencia `google/siglip2-base-patch16-224` y los convierte a binarios ejecutables en los aceleradores de Ambarella mediante Cooper SDK 2.5.4 y Cooper Foundry 2.3. El dataset citado en la model card es ImageNet. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO (no aplicable a un codificador visión-lenguaje).

## Capacidades

- Clasificación zero-shot de imágenes mediante comparación imagen-texto.
- Recuperación imagen-texto (image–text retrieval) y text-image retrieval.
- Codificador visual para VLM (vision-language models) y pipelines multimodales.
- Representaciones visuales densas y localización de objetos (según el paper original).
- Capacidades multilingües en el codificador de texto.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, agentes ni razonamiento multi-paso.
- No incluye modo thinking, audio ni vídeo.

## Casos de uso

- Clasificación zero-shot en cámaras de borde: usar el codificador visual y de texto empaquetado para N1-655 o CV72 para etiquetar imágenes en tiempo real sin reentrenar, aprovechando que los binarios ya están compilados para esos SoC.
- Búsqueda semántica de imágenes en dispositivos: indexar embeddings visuales y de texto para recuperación imagen-texto local en sistemas embebidos con recursos limitados.
- Filtrado y moderación de contenido visual: comparar embeddings de imagen contra descripciones textuales para detectar categorías no deseadas en flujos de cámara.
- Preetiquetado de datasets: generar etiquetas zero-shot sobre grandes colecciones de imágenes antes de un entrenamiento supervisado, reduciendo el coste de anotación manual.
- Codificador visual para VLM embebidos: integrar el codificador de imagen SigLIP2 como frontal visual de un sistema multimodal ligero desplegado en hardware Ambarella.
- Control de calidad en inspección visual: usar similitud imagen-texto para verificar que un producto o escena coincide con una descripción esperada en líneas de producción.
- Organización automática de bibliotecas multimedia: clasificar y agrupar imágenes por descripciones textuales en aplicaciones de gestión de fotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Ambarella N1-655, X7, CV7, CV72 y CV75, con binarios específicos por dispositivo para codificador de imagen y de texto.
- VRAM estimada para inferencia: no disponible; el despliegue previsto es en NPU/aceleradores de Ambarella, no en GPU.
- GPU recomendadas: no disponible para estos binarios; los pesos de referencia de Google pueden ejecutarse en GPU convencionales, pero no se documenta en esta información.
- ¿Cabe en GPU consumer? Los pesos de referencia (~86M parámetros) son ligeros, pero este repositorio no incluye pesos en formato estándar para GPU.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 sobre hardware Ambarella. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicable a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Multilingüe | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ambarella/SigLIP2 (este repo) | ~86M (ViT-Base) | 224×224 | Sí (según paper) | Binarios Ambarella | no disponible | Hugging Face |
| google/siglip2-base-patch16-224 | ~86M (ViT-Base) | 224×224 | Sí | Safetensors/PyTorch | no disponible en esta información | Hugging Face |
| SigLIP original (base) | ~86M (ViT-Base) | 224×224 | No documentado | Safetensors/PyTorch | no disponible en esta información | Hugging Face |

La diferencia principal frente a los pesos de referencia de Google es el formato: este repositorio está orientado a despliegue en hardware Ambarella, mientras que los pesos originales están pensados para PyTorch/GPU.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para generación de texto, código ni razonamiento.
- Los binarios incluidos son específicos de hardware Ambarella; no son portables a GPU o CPU convencionales sin conversión.
- La licencia no está indicada en la información disponible; es imprescindible verificar los términos antes de uso comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas concretas en esta información.
- El dataset citado es ImageNet; el rendimiento en dominios alejados de esa distribución no está documentado.
- Solo 10 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.
- La fecha de creación del repositorio (2026-09-09) es posterior a la del paper original (2025); conviene confirmar la versión exacta de los pesos convertidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/SigLIP2
- Paper original: https://arxiv.org/abs/2502.14786
- Pesos de referencia: https://huggingface.co/google/siglip2-base-patch16-224
- Dataset ImageNet: https://image-net.org
- Binario N1-655 imagen: https://huggingface.co/Ambarella/SigLIP2/blob/main/n1-655_siglip2_base_patch16_image_encoder_act16.bin
- Binario N1-655 texto: https://huggingface.co/Ambarella/SigLIP2/blob/main/n1-655_siglip2_base_patch16_text_encoder_act16.bin
- Binario X7 imagen: https://huggingface.co/Ambarella/SigLIP2/blob/main/x7_siglip2_base_patch16_image_encoder_act16.bin
- Binario X7 texto: https://huggingface.co/Ambarella/SigLIP2/blob/main/x7_siglip2_base_patch16_text_encoder_act16.bin
- Binario CV7 imagen: https://huggingface.co/Ambarella/SigLIP2/blob/main/cv7_siglip2_base_patch16_image_encoder_act16.bin
- Binario CV7 texto: https://huggingface.co/Ambarella/SigLIP2/blob/main/cv7_siglip2_base_patch16_text_encoder_act16.bin
- Binario CV72 imagen: https://huggingface.co/Ambarella/SigLIP2/blob/main/cv72_siglip2_base_patch16_image_encoder_act16.bin
- Binario CV72 texto: https://huggingface.co/Ambarella/SigLIP2/blob/main/cv72_siglip2_base_patch16_text_encoder_act16.bin
- Binario CV75 imagen: https://huggingface.co/Ambarella/SigLIP2/blob/main/cv75_siglip2_base_patch16_image_encoder_act16.bin
- Binario CV75 texto: https://huggingface.co/Ambarella/SigLIP2/blob/main/cv75_siglip2_base_patch16_text_encoder_act16.bin
