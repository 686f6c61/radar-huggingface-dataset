# quanjiwang/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

El modelo `quanjiwang/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive` es una adaptación "sin censura" del modelo base Qwen/Qwen3.5-9B, desarrollada por el usuario HauhauCS y publicada bajo el nombre de quanjiwang. Se trata de un modelo denso de 9B parámetros con arquitectura híbrida que combina atención lineal Gated DeltaNet y atención softmax completa en proporción 3:1, con una ventana de contexto nativa de 262K tokens ampliable a 1M mediante YaRN. El modelo es nativamente multimodal (texto, imagen y vídeo) y soporta multi-token prediction (MTP). La variante "Aggressive" indica una eliminación más exhaustiva de los rechazos del modelo original, con el objetivo de ofrecer respuestas sin restricciones de contenido.

La relevancia de este modelo radica en su enfoque "uncensored" (sin censura), que busca mantener todas las capacidades del modelo original eliminando los mecanismos de rechazo. Según la model card, presenta 0/465 refusals, es decir, no rechaza ninguna petición, y se distribuye en formato GGUF para su uso con runtimes como llama.cpp, LM Studio, Jan o koboldcpp. El modelo está pensado para desarrolladores que necesitan un LLM sin restricciones para casos de uso específicos, aunque esto conlleva riesgos importantes de uso indebido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet linear attention + softmax attention (3:1) |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativos, ampliable a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | 201 idiomas (en, zh, multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, que emplea una arquitectura híbrida innovadora: combina capas de atención lineal Gated DeltaNet con capas de atención softmax completa en una proporción 3:1. Esta mezcla busca reducir el coste computacional del procesamiento de secuencias largas manteniendo la calidad de la atención estándar. El modelo tiene 32 capas y un vocabulario de 248K tokens, lo que le permite cubrir 201 idiomas. Además, incorpora multi-token prediction (MTP), una técnica que predice varios tokens futuros simultáneamente para acelerar la inferencia.

La versión "uncensored" de HauhauCS no modifica los datos de entrenamiento ni las capacidades del modelo base; únicamente elimina los mecanismos de rechazo (refusals). Según la model card, el proceso logra 0/465 rechazos sin pérdida de capacidades. No se especifican los detalles técnicos del proceso de eliminación de censura (si se usó fine-tuning, RLHF, etc.), por lo que ese dato no está disponible. El modelo mantiene el modo de pensamiento (thinking mode) del original, con parámetros de temperatura recomendados de 0.6 y top_p 0.95.

## Capacidades

- Generación de texto sin rechazo de peticiones: el modelo responde a cualquier prompt sin negarse, aunque puede añadir un descargo de responsabilidad breve al final de algunas respuestas (comportamiento heredado del entrenamiento base).
- Razonamiento multi-step con modo de pensamiento (thinking mode) activado por defecto, que requiere mantener al menos 128K de contexto para funcionar correctamente.
- Multimodalidad nativa: acepta entradas de texto, imagen y vídeo mediante el archivo `mmproj` (vision encoder) que debe cargarse junto al GGUF principal.
- Soporte de multi-token prediction (MTP) para acelerar la generación.
- Capacidades multilingües: 201 idiomas soportados gracias al vocabulario ampliado.
- Tool calling y function calling: no se menciona explícitamente en la model card, pero al estar basado en Qwen3.5-9B es probable que herede estas capacidades; no obstante, no hay confirmación oficial en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad y alineación de modelos: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para analizar sesgos, riesgos de alucinación y estrategias de mitigación en entornos controlados.
- Generación de contenido creativo sin restricciones: escritores y guionistas pueden explorar temas tabú o controvertidos sin que el modelo se niegue, aunque deben asumir la responsabilidad legal y ética del contenido generado.
- Desarrollo de chatbots de rol (roleplay) con libertad total: la ausencia de rechazos permite mantener conversaciones ininterrumpidas sobre cualquier temática, algo demandado en comunidades de roleplay.
- Análisis de contenido multimedia: gracias a su multimodalidad, puede procesar imágenes y vídeos junto con texto para tareas de descripción, resumen o extracción de información, sin filtros de contenido.
- Pruebas de estrés de sistemas de moderación: los desarrolladores de filtros de contenido pueden usar este modelo como generador de prompts adversarios para evaluar la robustez de sus propios sistemas de seguridad.
- Despliegue en entornos con requisitos de latencia moderada: al ser un modelo de 9B con cuantizaciones Q4_K_M (5.3 GB) o Q6_K (6.9 GB), puede ejecutarse en GPUs de consumo para aplicaciones de chatbot o asistencia, siempre que se asuma el riesgo de contenido sin filtrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se indica únicamente que no hay pérdida de capacidades respecto al modelo base, pero no se aportan números concretos. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16 (17 GB): requiere al menos 18-20 GB de VRAM, adecuado para RTX 4090, A100, H100.
  - Q8_0 (8.9 GB): cabe en GPUs con 12 GB o más, como RTX 3060/4070, A10, etc.
  - Q6_K (6.9 GB): cabe en GPUs de 8 GB, como RTX 3070/4060.
  - Q4_K_M (5.3 GB): cabe en GPUs de 6 GB, como RTX 2060 o GTX 1660, aunque con limitaciones de velocidad.
- GPU recomendadas: RTX 4090 para BF16 y Q8_0 con holgura; RTX 3090/4080 para Q6_K; RTX 3060/4060 para Q4_K_M.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp, vLLM, SGLang y KTransformers (según la model card). Se recomienda usar builds recientes de llama.cpp porque el soporte para esta arquitectura es muy reciente.
- Latencia y throughput: no disponibles. Dependen del runtime, la cuantización y el hardware. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 30-50 tokens/s, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262K | Apache-2.0 | safetensors | Modelo original con censura estándar |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B | 262K | Apache-2.0 | GGUF | Sin rechazos, variante agresiva |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B | no disponible | Apache-2.0 | GGUF | Variante más pequeña del mismo autor |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a especificaciones técnicas. Otros modelos "uncensored" como Dolphin o WizardLM-uncensored podrían ser alternativas, pero no hay información suficiente para compararlos aquí.

## Limitaciones y advertencias

- El modelo no rechaza ninguna petición, lo que implica un riesgo alto de generar contenido ilegal, dañino, discriminatorio o sexualmente explícito. Su uso en producción debe estar restringido a entornos controlados y con supervisión humana.
- Puede producir alucinaciones, especialmente en temas factuales, al igual que el modelo base. No hay garantía de exactitud en las respuestas.
- La eliminación de la censura no elimina los sesgos presentes en los datos de entrenamiento originales; el modelo puede reflejar estereotipos o prejuicios.
- El modo de pensamiento (thinking mode) requiere mantener al menos 128K de contexto; si se reduce la ventana, las capacidades de razonamiento pueden degradarse.
- La arquitectura es muy reciente (lanzamiento 2026-03-02 según la model card) y el soporte en runtimes como llama.cpp es reciente; es posible que haya bugs o incompatibilidades en versiones antiguas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantía sobre el contenido generado. El usuario asume toda la responsabilidad legal.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo muy nuevo o poco validado por la comunidad. No hay evidencia de pruebas exhaustivas.
- No se proporcionan datos de entrenamiento específicos del proceso de "uncensoring", por lo que no se puede evaluar su calidad técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quanjiwang/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Perfil del autor: https://huggingface.co/HauhauCS
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
