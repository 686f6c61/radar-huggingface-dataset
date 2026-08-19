# openbmb/MiniCPM-V-4.6-GPTQ

# MiniCPM-V 4.6 GPTQ

## Resumen

MiniCPM-V 4.6 GPTQ es la versión cuantizada en 4 bits (W4A16, GPTQModel) del modelo multimodal MiniCPM-V 4.6 desarrollado por OpenBMB. Se trata de un modelo de lenguaje y visión (MLLM) de tamaño compacto, con 1.300.428.016 parámetros (aproximadamente 1,3B), diseñado específicamente para su despliegue en dispositivos de borde como teléfonos móviles, manteniendo capacidades avanzadas de comprensión de imagen única, múltiples imágenes y vídeo.

El modelo combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B de arquitectura híbrida (atención lineal y completa), lo que permite reducir los FLOPs de codificación visual en más del 50% respecto a generaciones anteriores. Según la model card, alcanza una puntuación de 13 en el Artificial Analysis Intelligence Index, superando a Qwen3.5-0.8B (10) y a Ministral 3 3B (11), con un coste de tokens entre 19 y 43 veces menor. Esta versión GPTQ facilita la inferencia en hardware con recursos limitados, manteniendo un equilibrio entre precisión y eficiencia.

La relevancia actual de este modelo radica en su capacidad para llevar la comprensión multimodal de alto nivel a dispositivos móviles (iOS, Android y HarmonyOS), con todo el código de adaptación abierto, y su compatibilidad con frameworks de inferencia como vLLM, SGLang, llama.cpp y Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision encoder) + Qwen3.5-0.8B (LLM híbrido linear/full-attention) |
| Parametros totales | 1.300.428.016 (1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (esta versión); el modelo base ofrece variantes GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

La arquitectura de MiniCPM-V 4.6 combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B que emplea una atención híbrida entre lineal y completa. Esta combinación, basada en las técnicas de LLaVA-UHD v4, reduce los FLOPs de codificación visual en más del 50%, lo que permite un throughput de tokens aproximadamente 1,5 veces superior al de Qwen3.5-0.8B. Además, introduce una compresión mixta de tokens visuales con tasas de 4x y 16x, permitiendo ajustar dinámicamente el equilibrio entre precisión y velocidad según la tarea.

No se han proporcionado datos específicos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El modelo se publica en su variante instruct, con pesos cuantizados mediante GPTQ (W4A16) para esta versión. La cuantización se realizó con GPTQModel, manteniendo la compatibilidad con el ecosistema Transformers.

## Capacidades

- Comprensión de imágenes individuales y múltiples, así como de vídeo, con razonamiento visual avanzado.
- Generación de texto y respuestas conversacionales basadas en entradas visuales.
- Compresión de tokens visuales con tasas mixtas 4x/16x, permitiendo optimizar latencia o precisión según el caso.
- Soporte para despliegue en dispositivos móviles (iOS, Android y HarmonyOS) con código de adaptación abierto.
- Compatible con frameworks de inferencia como vLLM, SGLang, llama.cpp y Ollama, y con ecosistemas de fine-tuning como SWIFT y LLaMA-Factory.
- Eficiencia computacional destacada: ~1,5x token throughput respecto a Qwen3.5-0.8B y reducción de FLOPs en codificación visual superior al 50%.
- Capacidades de razonamiento y comprensión de escenas complejas, superando en rendimiento a modelos más grandes como Gemma4-E2B-it según la model card.
- No se especifica soporte explícito para tool calling o function calling en la documentación disponible.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede reconocer objetos, leer texto en imágenes (OCR) y responder preguntas sobre el entorno mediante la cámara, gracias a su tamaño reducido y su compatibilidad con plataformas iOS, Android y HarmonyOS.
- Análisis de vídeo en tiempo real: su capacidad para procesar vídeo permite resumir escenas, detectar eventos o extraer información de secuencias grabadas, con una latencia adecuada para aplicaciones de borde.
- Accesibilidad para personas con discapacidad visual: descripción automática de imágenes y escenas capturadas con el teléfono, ayudando a interpretar el entorno sin necesidad de conexión a la nube.
- Extracción de datos de documentos: lectura de facturas, tickets, tarjetas de visita o formularios a partir de fotografías, con alta precisión en tareas de OCR y comprensión de diseño.
- Asistente educativo: resolución de problemas matemáticos o científicos a partir de imágenes de pizarras, libros o apuntes, combinando razonamiento visual y textual.
- Moderación de contenido: análisis de imágenes y vídeos para detectar contenido inapropiado o clasificar material visual en aplicaciones de redes sociales o plataformas de contenido.
- Automatización de tareas industriales: inspección visual de productos, lectura de códigos o verificación de etiquetas en entornos de fabricación con recursos de hardware limitados.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados comparativos, basados en el Artificial Analysis Intelligence Index (AAII):

| Modelo | Puntuación AAII | Coste de tokens relativo |
|---|---|---|
| MiniCPM-V 4.6 | 13 | 1x |
| Ministral 3 3B | 11 | no disponible |
| Qwen3.5-0.8B-Thinking | 11 | 43x |
| Qwen3.5-0.8B | 10 | 19x |

Además, se indica que MiniCPM-V 4.6 supera a Gemma4-E2B-it en rendimiento general, aunque no se aporta una puntuación numérica. No se han publicado resultados detallados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,3B parámetros en cuantización GPTQ de 4 bits, el peso del modelo ocupa aproximadamente 0,65 GB, y el repositorio completo tiene un tamaño de 1,9 GB. Se estima que la VRAM necesaria para inferencia se sitúa entre 1 y 2 GB, dependiendo del tamaño de lote y la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas de consumo como NVIDIA RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU con un rendimiento aceptable para tareas puntuales.
- Compatibilidad con consumer GPU: sí, es plenamente compatible con GPUs de gama media y baja.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, Transformers con torchcodec para decodificación de vídeo.
- Latencia y throughput: según la model card, alcanza ~1,5x token throughput en comparación con Qwen3.5-0.8B, con tiempos de primer token (TTFT) optimizados para escenarios de alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (AAII) | Licencia |
|---|---|---|---|---|
| MiniCPM-V 4.6 | 1,3B | no disponible | 13 | Apache-2.0 |
| Qwen3.5-0.8B | 0,8B | no disponible | 10 | no disponible |
| Ministral 3 3B | 3B | no disponible | 11 | no disponible |
| Gemma4-E2B-it | ~2B | no disponible | no disponible | no disponible |

MiniCPM-V 4.6 destaca por ofrecer un rendimiento superior a modelos de mayor tamaño (Ministral 3 3B) y a modelos de tamaño similar (Qwen3.5-0.8B) con un coste de tokens significativamente menor, gracias a su arquitectura eficiente y su compresión de tokens visuales.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero como todo modelo entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación en tareas de razonamiento visual complejo, especialmente en escenarios con imágenes ambiguas o de baja calidad.
- La longitud de contexto no se ha especificado, por lo que puede haber limitaciones en tareas que requieran secuencias muy largas o múltiples imágenes simultáneas.
- Los idiomas soportados no están documentados; aunque el modelo base probablemente sea multilingüe, no hay confirmación oficial.
- La cuantización GPTQ en 4 bits puede introducir una ligera degradación de precisión respecto a los pesos BF16 originales, especialmente en tareas de razonamiento numérico o visual detallado.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero es recomendable verificar la atribución correspondiente.

## Enlaces

- Modelo cuantizado GPTQ: https://huggingface.co/openbmb/MiniCPM-V-4.6-GPTQ
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub oficial: https://github.com/OpenBMB/MiniCPM-V
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-GPTQ-Demo
- Receta de despliegue con vLLM: https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6
- Documentación de la API pública: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- CookBook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
