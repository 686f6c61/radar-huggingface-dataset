# Jattt6789/Qwen3.5-9B-Ultra-Uncensored-Heretic-GGUF

## Resumen

Qwen3.5-9B-Ultra-Uncensored-Heretic-GGUF es una cuantización en formato GGUF de una versión "abliterada" (descensurada) de Qwen3.5-9B, el modelo multimodal de Qwen. El modelo base modificado fue creado por el usuario llmfan46 mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA), y esta versión GGUF concreta ha sido publicada por el usuario Jattt6789. El objetivo del proyecto es eliminar los comportamientos de rechazo del modelo original (86 rechazos por cada 100 peticiones sensibles) manteniendo la calidad de las respuestas, reduciéndolos a solo 4/100 con una divergencia KL de apenas 0,0241 respecto al modelo original.

Se trata de un modelo con aproximadamente 8.953 millones de parámetros (dato real de safetensors), con capacidades de imagen-texto-a-texto (image-text-to-text), lo que sugiere que hereda las capacidades multimodales de la familia Qwen3.5. Su relevancia radica en la creciente demanda comunitaria de modelos sin restricciones de alineamiento para investigación, escritura creativa sin filtros y análisis de contenido sensible, manteniendo el rendimiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), pipeline image-text-to-text |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuants concretas no detalladas en la ficha; tamaño de repo 68,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de la familia Qwen con capacidades multimodales (entrada de imagen y texto, salida de texto). No es un reentrenamiento completo: se trata de una modificación post-entrenamiento mediante abliteration, una técnica que elimina direcciones de activación responsables de los rechazos sin necesidad de gradientes ni datos adicionales.

La abliteration se ha realizado con Heretic v1.2.0 usando el método Arbitrary-Rank Ablation (ARA). Los parámetros concretos son: start_layer_index 15, end_layer_index 31, preserve_good_behavior_weight 0,4363, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,1225 y neighbor_count 14. Los componentes objetivo modificados son las proyecciones de salida de atención (attn.out_proj y attn.o_proj). No hay información sobre datos de entrenamiento, número de tokens ni procesos RLHF/DPO adicionales, ya que no se ha reentrenado el modelo.

## Capacidades

- Generación de texto conversacional con rechazos mínimos (4/100 frente a 86/100 del original)
- Comprensión de imagen y texto (pipeline image-text-to-text, heredado del modelo base Qwen3.5)
- Razonamiento de sentido común físico preservado (PIQA acc_norm 0,8009 frente a 0,8014 del original)
- Conocimiento general multitarea preservado (MMLU acc 0,7861 en el original; el modelo Heretic mantiene valores muy cercanos según la divergencia KL de 0,0241)
- Despliegue local mediante runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, etc.)
- Sin información disponible sobre tool calling, agentes ni soporte multilingüe específico

## Casos de uso

- Escritura creativa sin restricciones: autores de ficción que necesitan generar narrativas con contenido maduro, violencia gráfica o temáticas oscuras sin que el modelo interrumpa con advertencias morales, aprovechando la reducción del 95 % en rechazos.
- Investigación en alineamiento y seguridad: estudiar cómo la abliteration afecta al comportamiento del modelo comparando salidas con el Qwen3.5-9B original, usando la divergencia KL como métrica de fidelidad.
- Análisis de contenido sensible en seguridad informática: clasificación o redacción sobre vulnerabilidades, malware o técnicas de ataque con fines defensivos donde los modelos alineados suelen negarse.
- Asistente local privado con entrada multimodal: ejecución en local vía llama.cpp u Ollama para procesar imágenes y texto sin enviar datos a terceros, útil en entornos con requisitos de privacidad estrictos.
- Prototipado de aplicaciones con menos fricción: desarrollo de chatbots donde los rechazos falsos positivos del modelo original degradaban la experiencia de usuario en consultas legítimas pero ambiguas.
- Generación de datasets de entrenamiento: creación de datos sintéticos para investigación donde el modelo base se negaba a producir ejemplos necesarios (por ejemplo, texto tóxico etiquetado para clasificadores).

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo base (evaluados con lm-evaluation-harness):

| Benchmark | Modelo Heretic | Qwen3.5-9B original |
|---|---|---|
| PIQA (acc, 0-shot) | 0,7960 ± 0,0094 | 0,7943 ± 0,0094 |
| PIQA (acc_norm, 0-shot) | 0,8009 ± 0,0093 | 0,8014 ± 0,0093 |
| MMLU (acc) | no disponible para el Heretic | 0,7861 ± 0,0033 |
| Rechazos (de 100) | 4 | 86 |
| Divergencia KL | 0,0241 | 0 (por definición) |

No se han publicado resultados de MMLU para la versión Heretic en la información disponible (la tabla del README aparece truncada), ni benchmarks de HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización GGUF concreta. Para un modelo de ~9 B de parámetros, una Q4_K_M ocupa unos 5,5-6 GB; una Q8_0 unos 9,5-10 GB; el repo completo pesa 68,5 GB, lo que sugiere que incluye múltiples cuantizaciones y posiblemente versiones de alta precisión.
- GPU recomendadas: RTX 3060 de 12 GB o superior para cuants de 4 bits; RTX 4090 (24 GB) para cuants de 8 bits con contexto amplio; en CPU con suficiente RAM (16-32 GB) es viable con llama.cpp a velocidades reducidas.
- Cabe en GPUs de consumo: sí, las cuantizaciones de 4-5 bits funcionan en GPUs de gama media-alta (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui; también transformers con el modelo base en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Característica | Qwen3.5-9B-Ultra-Uncensored-Heretic | Qwen3.5-9B (original) | Llama 3.1 8B Instruct (abliterado) |
|---|---|---|---|
| Parámetros | ~8,95 B | ~9 B | 8 B |
| Multimodal | Sí (image-text-to-text) | Sí | No (solo texto) |
| Rechazos | 4/100 | 86/100 | variable según versión |
| Contexto | no disponible | no disponible | 128.000 tokens |
| Licencia | Apache 2.0 | Apache 2.0 | Llama 3.1 Community License |
| Formato | GGUF | safetensors | safetensors / GGUF comunitarios |

## Limitaciones y advertencias

- Al ser un modelo descensurado, generará contenido que el modelo original rechazaría, incluyendo potencialmente contenido dañino, ilegal o ofensivo; el usuario asume toda la responsabilidad legal y ética de su uso.
- El proceso de abliteration puede degradar sutilmente otras capacidades o introducir comportamientos erráticos; la divergencia KL de 0,0241 indica una desviación baja pero no nula respecto al original.
- No hay información sobre la longitud de contexto, idiomas soportados ni soporte de tool calling en la ficha; deben verificarse en el modelo base Qwen3.5-9B.
- La ficha del modelo base está truncada y no incluye resultados completos de MMLU para la versión Heretic.
- Es una modificación comunitaria no oficial: no cuenta con el respaldo de Qwen y puede contener errores introducidos por el proceso de abliteration o la cuantización.
- La licencia Apache 2.0 permite uso comercial, pero el uso del contenido generado puede estar sujeto a la legislación aplicable.
- Solo 782 descargas y 1 like en el momento de la ficha: historial limitado y sin auditoría comunitaria amplia.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/Jattt6789/Qwen3.5-9B-Ultra-Uncensored-Heretic-GGUF
- Modelo base abliterado: https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request ARA (Arbitrary-Rank Ablation): https://github.com/p-e-w/heretic/pull/211
