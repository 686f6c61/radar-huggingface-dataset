# openbmb/MiniCPM-V-4.6-BNB

## Resumen

MiniCPM-V-4.6-BNB es la versión cuantizada a 4 bits con bitsandbytes (NF4) de MiniCPM-V 4.6, un modelo multimodal (imagen-texto-a-texto) desarrollado por OpenBMB, el laboratorio de la Universidad de Tsinghua. El modelo original se construye sobre un codificador visual SigLIP2-400M y un LLM Qwen3.5-0.8B, y está diseñado específicamente para despliegue en el borde (edge), incluyendo teléfonos móviles en iOS, Android y HarmonyOS.

La propuesta de valor del modelo es la eficiencia extrema: según la model card, alcanza una puntuación de 13 en el Artificial Analysis Intelligence Index, superando a Qwen3.5-0.8B (puntuación 10) con un coste de tokens 19 veces menor, y a Ministral 3 3B (puntuación 11). Incorpora compresión de tokens visuales mixta 4x/16x, lo que permite intercambiar precisión por velocidad de forma flexible.

Esta variante BNB reduce los pesos a 4 bits, con un total de 1.300.428.016 parámetros reales y un tamaño de repositorio de 1,1 GB, lo que la hace adecuada para entornos con VRAM limitada o para prototipado rápido en GPUs de consumo. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: SigLIP2-400M (vision) + Qwen3.5-0.8B (LLM) |
| Parametros totales | 1.300.428.016 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes); el modelo base ofrece GGUF, AWQ, GPTQ y BNB |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 combina un codificador visual SigLIP2-400M con el LLM Qwen3.5-0.8B. La innovación principal es la compresión de tokens visuales mixta 4x/16x, basada en la técnica LLaVA-UHD v4, que reduce los FLOPs de codificación visual en más del 50%. Esto permite al modelo procesar imágenes y vídeo con un coste computacional muy inferior al de modelos comparables, manteniendo capacidades de comprensión de imagen única, multi-imagen y vídeo.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se menciona que el modelo hereda las capacidades de la familia MiniCPM-V y que está adaptado a ecosistemas de fine-tuning como SWIFT y LLaMA-Factory. Esta variante BNB es una cuantización post-entrenamiento del modelo base en BF16, por lo que no introduce cambios arquitectónicos, solo reducción de precisión de los pesos.

## Capacidades

- Comprensión de imagen única, multi-imagen y vídeo.
- Generación de texto y razonamiento multimodal.
- Comprensión de documentos, OCR y tickets (según los ejemplos de la model card).
- Modo "Thinking" disponible en el modelo base (MiniCPM-V 4.6-Thinking).
- Compresión de tokens visuales configurable (4x/16x) para ajustar precisión y velocidad.
- Despliegue en iOS, Android y HarmonyOS con código de adaptación abierto.
- Compatibilidad con frameworks de inferencia: vLLM, SGLang, llama.cpp, Ollama.
- Soporte de fine-tuning con SWIFT y LLaMA-Factory.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente visual en movil: el modelo puede ejecutarse en iOS, Android y HarmonyOS para tareas como reconocimiento de escritura manual, resolución de problemas de refracción óptica o lectura de tickets, tal como muestran los ejemplos de la model card. Su tamaño reducido y cuantización 4-bit lo hacen viable en dispositivos de gama alta.
- Digitalización de documentos y OCR: con capacidades de OCRBench y comprensión de documentos, puede extraer texto y estructura de facturas, tickets o formularios en entornos con recursos limitados.
- Comprensión de vídeo en tiempo real: la compresión 4x/16x y la reducción de FLOPs permiten procesar vídeo con menor coste, adecuado para aplicaciones de vigilancia o análisis de contenido en el borde.
- Prototipado rápido en GPU de consumo: la versión BNB de 1,1 GB cabe en GPUs con poca VRAM, lo que facilita experimentación y desarrollo sin infraestructura dedicada.
- Fine-tuning específico de dominio: al ser compatible con SWIFT y LLaMA-Factory, se puede ajustar para tareas concretas (por ejemplo, inspección industrial o medicina) en GPUs de consumo.
- Atención al cliente multimodal: puede gestionar conversaciones con imágenes adjuntas (capturas, fotos de productos) en entornos de bajo coste, aunque la longitud de contexto no está especificada.
- Análisis de imágenes médicas o técnicas: con la compresión de tokens y el modo Thinking del modelo base, puede emplearse en tareas de razonamiento visual que requieran precisión, siempre con supervisión humana.

## Benchmarks y rendimiento

La model card proporciona datos cualitativos y algunas puntuaciones, pero no una tabla numérica completa de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son:

| Benchmark / metrica | Resultado |
|---|---|
| Artificial Analysis Intelligence Index | 13 (vs. 10 de Qwen3.5-0.8B y 11 de Ministral 3 3B) |
| Coste de tokens relativo | 19x menor que Qwen3.5-0.8B; 43x menor que Qwen3.5-0.8B-Thinking |
| Rendimiento vs. Qwen3.5-0.8B en tareas vision-language | Supera en la mayoría de tareas |
| Nivel comparable a Qwen3.5 2B en OpenCompass, RefCOCO, HallusionBench, MUIRBench, OCRBench | Alcanza nivel similar |
| Throughput de tokens | ~1,5x respecto a Qwen3.5-0.8B |
| Reducción de FLOPs de codificación visual | >50% |

No se han publicado resultados numéricos detallados de benchmarks individuales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantización 4-bit de un modelo de ~1,3B parámetros, los pesos ocupan aproximadamente 0,65-0,8 GB; con overhead de activaciones y contexto, se estima un uso de VRAM de 2-4 GB para inferencia en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 4090; para servidor, A100 o H100 no son necesarias pero funcionarían.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más (RTX 3050, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: transformers (con bitsandbytes), vLLM, SGLang, llama.cpp, Ollama (según la model card del modelo base).
- Latencia y throughput estimados: la model card indica ~1,5x throughput de tokens frente a Qwen3.5-0.8B, pero no se proporcionan valores absolutos de latencia (TTFT) ni tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (AAII) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.6-BNB | 1,3B (4-bit) | no disponible | 13 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B | 0,8B | no disponible | 10 | no disponible | no disponible |
| Qwen3.5-0.8B-Thinking | 0,8B | no disponible | 11 | no disponible | no disponible |
| Ministral 3 3B | 3B | no disponible | 11 | no disponible | no disponible |

La comparativa se basa en la puntuación del Artificial Analysis Intelligence Index citada en la model card. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no hay documentación específica.
- Riesgo de alucinación: no cuantificado en la model card; los modelos multimodales pequeños tienden a alucinar en tareas de OCR o descripción de imágenes complejas.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada y los idiomas soportados no se listan; esto supone un riesgo para aplicaciones multilingües o con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- Caveat para producción: al ser una cuantización 4-bit, puede haber una ligera pérdida de precisión frente al modelo BF16 original; se recomienda validar en el dominio concreto antes de desplegar. La model card no proporciona métricas de degradación por cuantización.
- Dependencia de torchcodec para vídeo: puede presentar problemas de compatibilidad con CUDA 12.x, según advierte la model card; se sugiere usar PyAV como alternativa.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/openbmb/MiniCPM-V-4.6-BNB
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-BNB-Demo
- Paper LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Papers citados (arXiv): arxiv:2604.27393, arxiv:2509.18154, arxiv:2408.01800, arxiv:2605.08985
- API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
