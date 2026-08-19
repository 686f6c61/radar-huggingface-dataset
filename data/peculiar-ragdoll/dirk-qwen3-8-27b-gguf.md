# peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF

## Resumen

Dirk es una cuantización GGUF del modelo Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con capacidades de visión y lenguaje, desarrollado por el usuario peculiar-ragdoll. La principal innovación de Dirk no está en los pesos (que son idénticos a los del modelo base de Qwen), sino en la integración de un *chat template* modificado, denominado Sharp, que hace que el modelo responda de forma más concisa y directa, reduciendo el número de tokens de razonamiento sin sacrificar precisión. El modelo se distribuye en formato GGUF con cuantización dinámica UD-Q4_K_XL de Unsloth, que preserva el cabezal de predicción multi-token (MTP) para decodificación especulativa.

Dirk está pensado para desarrolladores que ejecutan modelos locales en hardware de consumo y necesitan respuestas de alta calidad con menor sobrecarga de tokens. Al eliminar el forzado de `reasoning_effort=xhigh` que trae el modelo base, permite ajustar el nivel de razonamiento por petición, desde respuestas rápidas hasta razonamiento profundo. El modelo mantiene intactas las capacidades de visión del Qwen3.8-27B, lo que lo hace adecuado para tareas multimodales. Su licencia Apache-2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (vision-language) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (principal); se anuncian quants de q3 a q8 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj-F16.gguf para visión) |

## Arquitectura y entrenamiento

Dirk es una redistribución cuantizada del modelo Qwen3.8-27B de Qwen, un transformer denso de 27B parámetros con capacidades multimodales (visión y texto). Los pesos no han sido modificados: la única diferencia respecto al quant original de Unsloth es la sustitución del *chat template* en los metadatos del archivo GGUF. El template Sharp (v22) combina la corrección del template de Qwen realizada por froggeric con un *system prompt* de tersura siempre activo, que induce al modelo a responder de forma escueta y centrada en la tarea.

El modelo base Qwen3.8-27B fuerza `reasoning_effort=xhigh` en todas las llamadas, lo que genera respuestas con un razonamiento extenso. Dirk elimina ese comportamiento por defecto y permite al usuario especificar el nivel de esfuerzo (`low`, `medium`, `high`, `xhigh`) mediante `chat_template_kwargs`, o desactivar el razonamiento por completo con `enable_thinking: false`. La cuantización UD-Q4_K_XL de Unsloth conserva el cabezal MTP (`nextn`), lo que habilita la decodificación especulativa multi-token en runtimes compatibles como llama.cpp.

## Capacidades

- Generación de texto y razonamiento con control granular del esfuerzo de razonamiento (de respuestas rápidas a razonamiento profundo).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con proyector de visión incluido (`mmproj-F16.gguf`).
- Generación de código y tareas de *agentic coding*, gracias a la capacidad del modelo base para seguir instrucciones complejas y usar herramientas.
- Decodificación especulativa mediante el cabezal MTP preservado, que acelera la generación en runtimes compatibles.
- Multilingüe limitado a inglés y chino (según la ficha del modelo).
- Respuestas concisas por defecto gracias al template Sharp, reduciendo el consumo de tokens y la latencia percibida.

## Casos de uso

- Asistente de programación local: Dirk puede integrarse en entornos de desarrollo (por ejemplo, mediante llama.cpp o oMLX) para generar código, escribir tests unitarios y depurar, con respuestas directas que ahorran tokens y tiempo de espera.
- Análisis de documentos con visión: al conservar el proyector de visión, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer información relevante, útil en flujos de automatización de oficina.
- Agente conversacional multi-turno: su capacidad para ajustar el esfuerzo de razonamiento permite mantener conversaciones largas sin agotar la ventana de contexto, ideal para chatbots de soporte técnico.
- Generación de informes técnicos: con `reasoning_effort` en nivel alto, produce análisis detallados y bien estructurados, mientras que en nivel bajo genera resúmenes rápidos.
- Automatización de tareas de conocimiento: puede clasificar, resumir o extraer entidades de textos en inglés y chino, con un coste de tokens reducido gracias al template Sharp.
- Desarrollo de agentes autónomos: su soporte para *agentic coding* y razonamiento multi-paso lo hace adecuado para pipelines que requieren planificación y ejecución de subtareas, como orquestación de pruebas o generación de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios para Dirk en la información disponible. El autor indica que las mediciones están en curso. Sin embargo, la model card presenta datos del modelo hermano Dagger (misma familia, mismo template Sharp) que sirven como referencia indirecta del efecto del template:

| Metrica | Template original | Template Sharp | Cambio |
|---|---|---|---|
| Claw-Eval, componente de respuesta | 59.3 | 66.7 | +7.4 |
| Tokens de respuesta en Claw-Eval | 5393 | 2217 | −59% |
| Tokens por respuesta correcta en MMLU-Pro | 1601 | 1248 | −22% |

Estos resultados corresponden a Dagger (base ThinkingCap-27B) y no a Dirk directamente, pero indican la mejora consistente en concisión y precisión que aporta el template.

## Requisitos de hardware

- El quant principal UD-Q4_K_XL ocupa aproximadamente 18 GB, por lo que cabe en GPUs de consumo con 24 GB de VRAM, como RTX 3090, RTX 4090 o RTX 5090.
- Para ejecutar la parte de visión se necesita además el archivo `mmproj-F16.gguf`, que añade unos pocos GB adicionales.
- En GPUs con menos VRAM (16 GB) se puede intentar con cuantizaciones más agresivas (q3, q4), aunque el autor aún no ha publicado esos archivos.
- Runtimes compatibles: llama.cpp (con `llama-cli` y `llama-mtmd-cli` para visión), oMLX (en macOS), y cualquier runtime que soporte GGUF con MTP, como vLLM (indicado como `endpoints_compatible`).
- No se proporcionan datos de latencia o throughput; dependerán del hardware y del nivel de razonamiento configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Dirk-Qwen3.8-27B | 27B denso | No disponible | UD-Q4_K_XL | Apache-2.0 | Template Sharp, visión, MTP |
| Dagger-Qwen3.6-27B | 27B denso | No disponible | GGUF con MTP | Apache-2.0 | Optimizado para minimizar tokens de razonamiento |
| Nail-Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | No disponible | GGUF con MTP | Apache-2.0 | Generación 3-4× más rápida que 27B denso |

Dirk se posiciona como la opción para tareas difíciles donde se prioriza la calidad de la respuesta sobre la velocidad. Dagger es más adecuado para sesiones largas con muchas interacciones, y Nail para trabajo rutinario de gran volumen.

## Limitaciones y advertencias

- No se han publicado benchmarks propios; los datos mostrados provienen de un modelo hermano y deben tomarse con cautela.
- La longitud de contexto no está especificada en la información disponible; se recomienda verificar la ficha del modelo base Qwen3.8-27B.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser una cuantización, puede haber una ligera degradación de calidad respecto al modelo en precisión completa, especialmente en tareas de razonamiento complejo.
- El template Sharp modifica el comportamiento por defecto; si se necesita el comportamiento original de Qwen, es preferible usar el quant sin modificar.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3.8-27B puede tener términos adicionales; se recomienda revisar la licencia del modelo original.
- El autor indica que está subiendo quants de q3 a q8; la disponibilidad de estos archivos puede variar.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Template Sharp (Qwen-Sharp-Chat-Templates)](https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates)
- [Dagger-Qwen3.6-27B-GGUF-MTP](https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-GGUF-MTP)
- [Nail-Qwen3.6-35B-A3B-GGUF-MTP](https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP)
- [Unsloth (cuantizaciones)](https://huggingface.co/unsloth)
- [froggeric (template corregido)](https://huggingface.co/froggeric)
