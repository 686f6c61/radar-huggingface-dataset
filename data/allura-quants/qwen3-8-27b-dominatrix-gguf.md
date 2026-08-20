# allura-quants/Qwen3.8-27B-Dominatrix-GGUF

## Resumen

Qwen3.8-27B-Dominatrix es un ajuste fino (finetune) del modelo base Qwen3.8-27B de Alibaba, especializado en roleplay y escritura creativa. El modelo original es un LLM denso de 27 000 millones de parámetros con una arquitectura híbrida de atención que combina atención completa y atención lineal, optimizado para tareas de razonamiento, codificación y automatización de oficina. Esta variante, desarrollada por la comunidad (el usuario Fizzeria) y cuantizada por allura-quants, adapta el modelo base para mejorar la prosa, la creatividad y el razonamiento en contextos de rol y narración.

Esta ficha se centra en la versión GGUF, que ofrece pesos cuantizados para su ejecución en hardware local. El modelo se distribuye bajo licencia Apache 2.0, con un tamaño de 27 320 697 856 parámetros y soporte de idioma inglés. La cuantización reduce el tamaño de los pesos para permitir su ejecución en GPUs de consumo o servidores de gama media, manteniendo una calidad de generación adecuada para aplicaciones de rol y escritura.

La relevancia actual de este modelo reside en su combinación de un base técnica sólida (Qwen3.8-27B) con un ajuste específico para un caso de uso creativo y conversacional, algo poco común en el ecosistema open source. El modelo está disponible en Hugging Face con múltiples niveles de cuantización, facilitando su despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa en 16 de 64 capas, atención lineal en las otras 48) |
| Parametros totales | 27 320 697 856 (27 000 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta contexto largo, pero no se especifica el valor exacto en la información proporcionada) |
| Tipos de cuantizacion | GGUF: Q4_K_M (16,8 GB), Q6_K_L (23 GB), Q8_0 (29 GB), BF16 (54,7 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención que combina atención completa en solo 16 de sus 64 capas (intervalo de atención completa de 4) con atención linear de estado recurrente constante en las 48 restantes. Esta configuración reduce el coste computacional y permite manejar contextos largos de manera eficiente. El finetune de Dominatrix se realizó con las herramientas Axolotl y Unsloth, ajustando el chat template del modelo base para desactivar el modo de pensamiento preservado y modificar el esfuerzo de razonamiento, según indica la model card.

No se ha publicado información detallada sobre el dataset de entrenamiento del finetune ni sobre el número de tokens utilizados. El ajuste se centró en mejorar la prosa y el razonamiento creativo en entornos de roleplay. La licencia Apache 2.0 del modelo base permite su uso comercial y la redistribución, lo que se mantiene en esta variante cuantizada.

## Capacidades

- Generación de texto conversacional y narrativo de alta calidad, especialmente orientada a roleplay y escritura creativa.
- Razonamiento creativo: el ajuste busca generar respuestas más originales y menos genéricas en contextos de interacción persona-modelo.
- Soporte de chat multi-turno con plantilla de chat ajustada (preserve_thinking desactivado, reasoning_effort modificado).
- Capacidades multilingües limitadas al inglés (según la model card, solo idioma en).
- No se especifican capacidades de tool calling, function calling ni agentes en la información disponible.
- El modelo base Qwen3.8-27B es multimodal nativo (procesa texto, imágenes y audio), pero no se confirma que el finetune conserve estas capacidades.

## Casos de uso

- Roleplay interactivo: el modelo está optimizado para mantener personajes, historias y diálogos coherentes en entornos de rol, tanto en juegos de texto como en aplicaciones de chat inmersivo.
- Escritura creativa asistida: puede generar borradores de novelas, cuentos, diálogos y descripciones literarias, aprovechando su ajuste para mejorar la prosa y la creatividad.
- Personajes de ficción en videojuegos: integración del modelo en motores de juego para dar vida a NPCs con personalidades profundas y respuestas contextuales.
- Generación de contenido para plataformas de narración interactiva: como foros de rol, juegos de rol por escrito o sistemas de aventuras conversacionales.
- Asistente de redacción para autores: ayuda a escritores a desarrollar diálogos, tramas y descripciones, ofreciendo sugerencias estilísticas.
- Simulaciones de escenarios narrativos: para educación o entretenimiento, donde se necesita una generación de texto creativa y controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado en tareas de codificación, agentes y automatización de oficina, pero no se proporcionan cifras concretas para esta variante finetune. No se pueden comparar resultados numéricos con otros modelos sin datos oficiales.

## Requisitos de hardware

- VRAM estimada según cuantización:
  - Q4_K_M: 16,8 GB (cabe en GPUs de consumo como RTX 4090 (24 GB), RTX 4080 (16 GB) o A6000)
  - Q6_K_L: 23 GB (requiere GPUs de gama alta, por ejemplo RTX 4090, A5000, o múltiples GPUs)
  - Q8_0: 29 GB (necesita GPUs con 32 GB o más, como A100 40 GB o H100)
  - BF16: 54,7 GB (recomendado para GPUs de datacenter con al menos 80 GB, como A100 80GB o H100)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, A100 80GB para BF16, o GPUs de doble placa para cuantizaciones intermedias.
- Es posible ejecutar el modelo en CPU con llama.cpp o Ollama, aunque con latencia alta.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta la arquitectura), TGI (si está disponible).
- Latencia y throughput: no se proporcionan datos medidos; dependerá del hardware y del nivel de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27 000 millones | No disponible | Apache 2.0 | Codificación, agentes, automatización |
| Qwen3.8-27B-Dominatrix (este) | 27 000 millones | No disponible | Apache 2.0 | Roleplay, escritura creativa |
| Llama 3.1 8B | 8 000 millones | 128 000 tokens | Meta Llama 3 | General, chat, razonamiento |
| Mistral 7B | 7 000 millones | 32 000 tokens | Apache 2.0 | General, razonamiento |

La comparativa directa con modelos de roleplay específicos (como los finetunes de Llama o Mistral) no está disponible, ya que no se han publicado benchmarks comparativos. La ventaja principal de este modelo es su base técnica avanzada (arquitectura híbrida) y su licencia permisiva.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el modelo está etiquetado como "not-for-all-audiences" y está orientado a roleplay, lo que puede generar contenido explícito o inapropiado en ciertos contextos.
- Sesgo de dominio: al ser un finetune de roleplay, su rendimiento en tareas generales (codificación, matemáticas, razonamiento técnico) puede degradarse respecto al modelo base.
- Idioma: solo se garantiza soporte en inglés; el rendimiento en otros idiomas es limitado o no probado.
- Alucinaciones: como todo LLM, puede generar información falsa o incoherente en contextos de hechos, especialmente si se utiliza fuera de su dominio de ajuste.
- Licencia: aunque es Apache 2.0, el uso comercial debe verificar que el contenido generado no infrinja políticas de contenido de las plataformas.
- No se garantiza la conservación de las capacidades multimodales del modelo base tras el finetune.

## Enlaces

- [Página del modelo GGUF en Hugging Face](https://huggingface.co/allura-quants/Qwen3.8-27B-Dominatrix-GGUF)
- [Modelo base en Hugging Face (allura-org)](https://huggingface.co/allura-org/Qwen3.8-27B-Dominatrix)
- [Repositorio de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Instalador de un clic para Qwen3.8-27B en GitHub](https://github.com/qwen3-8-27b/qwen3-8-27b)
- [Receta de vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Soporte al autor del finetune (Ko-fi)](https://ko-fi.com/fizzai)
