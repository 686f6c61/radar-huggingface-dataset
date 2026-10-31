# axteam/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.6-35B-A3B desarrollado por el equipo de Qwen, publicada en Hugging Face por el usuario axteam. El modelo original es un modelo denso/MoE de 35.505 millones de parámetros totales (según los metadatos de safetensors), del cual la variante GGUF ofrece dos niveles de cuantización post-entrenamiento (Q4_K_M y Q8_0) realizados con las herramientas oficiales de llama.cpp, sin reentrenamiento.

Esta ficha cubre la cuantización, no el modelo original. Su valor principal es permitir la ejecución local del modelo en entornos consumer mediante llama.cpp, Ollama o LM Studio, con un tamaño de archivo de 21,7 GB en Q4_K_M, lo que lo hace viable en GPUs de gama alta con 24 GB de VRAM. El modelo base conserva la plantilla de chat original embebida en cada archivo GGUF, por lo que la compatibilidad con la inferencia conversacional se mantiene intacta respecto al original.

Es relevante ahora porque la familia Qwen 3.6 representa la última generación de modelos abiertos de Alibaba con licencia Apache-2.0, y las cuantizaciones GGUF comunitarias suelen aparecer en las primeras semanas tras el lanzamiento oficial, facilitando la adopción temprana por parte de desarrolladores que trabajan en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.6-35B-A3B; el sufijo A3B sugiere arquitectura MoE con ~3B de parámetros activos, no confirmado por el autor) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | no disponible (el sufijo "A3B" del modelo base sugiere ~3B activos, pero no está confirmado en la model card) |
| Longitud de contexto | no disponible (los ejemplos usan 8192 tokens como valor de contexto en llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (4-bit k-quant medium, 21,7 GB), Q8_0 (8-bit, 37,8 GB) |
| Idiomas soportados | no disponibles (el modelo base es Qwen, típicamente multilingüe, pero no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una cuantización post-entrenamiento (PTQ) del modelo Qwen/Qwen3.6-35B-A3B. La conversión se realizó con el script oficial `convert_hf_to_gguf.py` de llama.cpp, seguido de `llama-quantize` para aplicar los k-quants. Este método cuantiza los pesos BF16 originales de forma bloqueada (per-block scales con asignación mixta de bits), sin ningún reentrenamiento ni calibración adicional, lo que preserva el comportamiento del modelo original a costa de una ligera pérdida de precisión, especialmente notable en Q4_K_M frente a Q8_0.

Sobre el modelo base, la nomenclatura "35B-A3B" en la familia Qwen indica tradicionalmente una arquitectura Mixture-of-Experts con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que permitiría una inferencia rápida pese al gran tamaño total. No obstante, la model card de esta cuantización no detalla la arquitectura interna ni los datos de entrenamiento del modelo original, por lo que estos datos no están disponibles en la información proporcionada. Cabe destacar que el codificador de visión del modelo original no está incluido en estos archivos GGUF, por lo que la versión cuantizada es únicamente texto.

## Capacidades

- Generación de texto conversacional mediante la plantilla de chat original embebida en cada archivo GGUF.
- Razonamiento y resolución de problemas (heredado del modelo base Qwen3.6-35B-A3B; sin detalles específicos en la model card).
- Compatibilidad con servidores OpenAI-compatible a través de `llama-server`, lo que facilita la integración con herramientas estándar del ecosistema.
- Sin capacidades de visión: el codificador visual del modelo original no está incluido en la cuantización, por lo que este GGUF es exclusivamente de texto.
- Sin información específica sobre tool calling, agentes o capacidades multilingües en la model card de esta cuantización (aunque el modelo base Qwen suele soportarlas).

## Casos de uso

- **Chatbot local y privado en consumer hardware:** con la cuantización Q4_K_M (21,7 GB) el modelo cabe en una GPU de 24 GB de VRAM (como una RTX 3090 o RTX 4090), permitiendo desplegar un asistente conversacional sin depender de APIs externas ni compartir datos con terceros.
- **Servidor de inferencia OpenAI-compatible en local:** mediante `llama-server` se puede levantar un endpoint en el puerto 8080 compatible con el formato de la API de OpenAI, ideal para prototipar aplicaciones que luego migrarán a un modelo mayor en la nube sin cambiar el código cliente.
- **Integración con Ollama para desarrolladores individuales:** el comando `ollama run hf.co/axteam/Qwen3.6-35B-A3B-GGUF:Q4_K_M` permite poner el modelo en marcha en segundos, útil para experimentación rápida y desarrollo de features que dependen de LLMs.
- **Uso en LM Studio para usuarios no técnicos:** al estar disponible en el buscador de modelos de LM Studio, facilita que perfiles menos técnicos prueben el modelo con interfaz gráfica sin tocar la línea de comandos.
- **Procesamiento de texto offline en portátiles de gama alta:** dado que la cuantización Q4_K_M reduce el footprint a 21,7 GB, es viable su ejecución en equipos con GPU dedicada de 24 GB sin conexión permanente a internet.
- **Base para fine-tuning posterior con LoRA en formato GGUF:** aunque la cuantización en sí no es ideal para entrenar, el modelo base puede usarse como referencia y esta versión sirve para validar prompts y comportamiento antes de invertir en entrenamiento del modelo original en BF16.
- **Reducción de coste de KV-cache en contexto largo:** mediante `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` se puede comprimir la caché KV en tiempo de ejecución, útil para sesiones conversacionales largas sin ampliar la VRAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para Q4_K_M (21,7 GB de pesos):** aproximadamente 22-24 GB solo para los pesos, más la KV-cache según el contexto. Con contexto de 8192 tokens y KV-cache en q8_0, el consumo total ronda los 24 GB, justo en el límite de una RTX 3090/4090. Con KV-cache en FP16 se recomienda una GPU de 32 GB o superior.
- **VRAM estimada para Q8_0 (37,8 GB de pesos):** se requiere al menos 40 GB de VRAM (por ejemplo, una A100 de 40 GB o 80 GB, o una H100), o bien descarga parcial en CPU/GPU (offloading) con penalización de velocidad.
- **GPUs recomendadas:** RTX 3090 o RTX 4090 (24 GB) para Q4_K_M con ajustes de KV-cache; A100 40GB/80GB o H100 para Q8_0 sin offloading.
- **Consumer GPUs:** viable en RTX 3090/4090 con Q4_K_M y contexto moderado (8192 tokens) usando KV-cache cuantizada. No viable en GPUs de 16 GB o menos sin offloading significativo a CPU.
- **Opciones de despliegue:** llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio. No se menciona compatibilidad directa con vLLM o TGI para esta cuantización GGUF (vLLM requiere generalmente safetensors).
- **Latencia y throughput:** no disponible en la información proporcionada, aunque si la arquitectura del modelo base es MoE con ~3B parámetros activos, la velocidad de generación debería ser alta en hardware adecuado.

## Comparativa con modelos similares

| Característica | Qwen3.6-35B-A3B-GGUF (esta ficha) | Qwen3.6-35B-A3B (original) | Otros GGUF de 30-35B (p. ej. Qwen3-32B-GGUF) |
|---|---|---|---|
| Parámetros totales | 35,5B | 35,5B | ~32B |
| Formato | GGUF (Q4_K_M, Q8_0) | Safetensors (BF16) | GGUF |
| Tamaño del archivo principal | 21,7 GB (Q4_K_M) | ~71 GB (BF16) | ~20 GB (Q4_K_M) |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Visión | No (no incluida en GGUF) | Sí (según model card del original) | No |
| Ejecución local (24 GB VRAM) | Sí (Q4_K_M) | No | Sí |
| Herramientas compatibles | llama.cpp, Ollama, LM Studio | vLLM, TGI, SGLang | llama.cpp, Ollama, LM Studio |

Nota: la comparativa con otros GGUF de la familia Qwen es orientativa, ya que no se dispone de datos de benchmarks específicos para esta cuantización.

## Limitaciones y advertencias

- **Sin capacidades de visión:** el codificador visual del modelo original no está incluido en estos archivos GGUF, por lo que esta cuantización es únicamente de texto. Si necesitas multimodalidad, debes usar el modelo original en safetensors.
- **Pérdida de precisión por cuantización:** al tratarse de una PTQ sin reentrenamiento, la calidad en Q4_K_M puede degradarse ligeramente respecto al original BF16, especialmente en tareas de razonamiento complejo o generación de código preciso. Q8_0 es prácticamente indistinguible del original.
- **Contexto por defecto limitado en los ejemplos:** los comandos de la model card usan 8192 tokens de contexto, lo que puede ser insuficiente para documentos largos. La longitud máxima real de contexto del modelo base no se especifica en esta model card.
- **Riesgo de alucinación:** como todo LLM, el modelo puede generar información falsa con apariencia plausible; no hay datos de benchmarks que permitan cuantificar este riesgo para esta variante.
- **Sesgos heredados del modelo base:** cualquier sesgo presente en Qwen3.6-35B-A3B se traslada íntegramente a esta cuantización, ya que no se ha realizado ningún ajuste adicional.
- **Licencia Apache-2.0:** permite uso comercial, modificación y distribución sin restricciones significativas más allá de la atribución; no obstante, conviene revisar la licencia del modelo base original en el enlace proporcionado.
- **Repositorio comunitario:** se trata de una cuantización publicada por un usuario (axteam) y no por el equipo oficial de Qwen, con solo 118 descargas y 1 like en el momento de la ficha; se recomienda verificar la integridad de los archivos antes de usar en producción.
- **Información incompleta en la model card:** no se especifican parámetros activos (si es MoE), longitud máxima de contexto, idiomas soportados ni benchmarks, lo que dificulta una evaluación rigurosa antes de la adopción.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/axteam/Qwen3.6-35B-A3B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
