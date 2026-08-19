# donedynamics/Qwen3.8-27B-heretic-MLX-bf16

## Resumen

Este repositorio contiene la conversión a formato MLX en precisión bfloat16 (sin cuantizar) del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, un derivado "abliterado" del modelo Qwen3.8-27B de Alibaba. La abliteración elimina quirúrgicamente el comportamiento de rechazo del modelo original, de modo que responde a peticiones que un modelo con ajuste de seguridad declinaría. El autor de esta conversión, `donedynamics`, solo ha cambiado el formato y la precisión: no añade ni elimina alineación adicional.

Se trata de un modelo de 26 896 millones de parámetros (aproximadamente 27B), denso, orientado a generación de texto, con soporte de razonamiento configurable mediante el chat template. Esta conversión es exclusivamente de texto: aunque el modelo base Qwen3.8-27B es multimodal (imagen-texto), aquí solo se ha convertido la torre de lenguaje, por lo que la entrada de imágenes o vídeo no funciona. El repositorio forma parte de un conjunto de cuatro builds (4-bit, 6-bit, 8-bit y bf16) pensados para Apple Silicon, siendo este el más grande y lento pero el de referencia para evaluar pérdida de calidad en las versiones cuantizadas.

La relevancia de este modelo radica en su carácter "sin censura" para casos de uso donde se requiere una generación sin restricciones de seguridad, y en su disponibilidad bajo licencia Apache-2.0, que permite uso comercial. Sin embargo, el propio autor advierte que debe evaluarse antes de ponerlo frente a usuarios y que se debe aplicar filtrado propio cuando el caso de uso lo requiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8) |
| Parametros totales | 26 895 993 856 (≈26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en esta conversion; el modelo base Qwen3.8-27B declara 262K tokens |
| Tipos de cuantizacion | bf16 (este repo); tambien disponibles 4-bit, 6-bit y 8-bit en repos hermanos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros desarrollado por el equipo Qwen de Alibaba (Tongyi Lab). Incluye soporte multimodal en su versión original, pero esta conversión MLX solo conserva la torre de lenguaje. El proceso de abliteración aplicado por `trohrbaugh` elimina selectivamente las direcciones de activación asociadas al rechazo de peticiones, dando lugar a un modelo que responde sin filtros de seguridad.

El entrenamiento original de Qwen3.8-27B incluye una fase de ajuste con razonamiento configurable (modo "thinking" activable mediante `enable_thinking` y `reasoning_effort` en el chat template). Esta conversión mantiene esa funcionalidad: el razonamiento está activado por defecto y consume tokens antes de la respuesta final. No se dispone de información sobre el dataset de entrenamiento específico de la versión abliterada, ni sobre el proceso exacto de abliteración más allá de la eliminación del comportamiento de rechazo.

## Capacidades

- Generación de texto conversacional y de larga forma.
- Razonamiento multi-paso configurable: el chat template admite `enable_thinking` y `reasoning_effort`, permitiendo respuestas directas o con cadena de pensamiento.
- Sin restricciones de contenido: al estar abliterado, responde a peticiones que un modelo con ajuste de seguridad rechazaría (por ejemplo, contenido explícito, instrucciones potencialmente dañinas).
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación, pero el modelo base Qwen3.8-27B lo incluye; esta conversión no lo desactiva.
- Capacidades multilingües: no especificadas para esta conversión; el modelo base soporta múltiples idiomas.
- Solo texto: no procesa imágenes ni vídeo, a diferencia del modelo base multimodal.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como referencia para estudiar el efecto de la abliteración en el comportamiento de un LLM, comparando sus respuestas con las del modelo original.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido que requiera explorar temas tabú o explícitos sin filtros automáticos.
- Desarrollo de aplicaciones de rol o personajes conversacionales: el modelo puede adoptar personalidades sin las limitaciones típicas de los modelos alineados.
- Evaluación de pipelines de moderación de contenido: al generar contenido que un modelo seguro rechazaría, permite probar y afinar sistemas de filtrado posteriores.
- Experimentación con razonamiento en Apple Silicon: gracias al soporte MLX, se puede probar el modo thinking y medir el rendimiento en hardware de Apple.
- Benchmarking de cuantización: al ser la versión de referencia sin cuantizar, sirve para comparar la pérdida de calidad frente a las builds de 4, 6 y 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para esta conversión específica en la informacion disponible. El autor proporciona únicamente mediciones de rendimiento de generación en una Mac Studio M3 Ultra (512 GB de memoria unificada, macOS 26.5.2, `mlx-lm` 0.31.3, prompt de 68 tokens, 120 tokens generados):

| Build | Tamaño | Bits/peso | Velocidad de generación | Memoria pico |
|---|---|---|---|---|
| 4-bit | 15,1 GB | 4,501 | 37,9 tok/s | 15,5 GB |
| 6-bit | 21,9 GB | 6,501 | 27,9 tok/s | 22,2 GB |
| 8-bit | 28,6 GB | 8,501 | 22,2 tok/s | 28,9 GB |
| bf16 (este repo) | 50,0 GB | 16 | 12,7 tok/s | 54,1 GB |

Estas cifras son una guía de orden de magnitud, no un benchmark formal (una sola ejecución, una máquina, un prompt).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB (según medición del autor). Con cuantización 4-bit, se reduce a unos 15,5 GB.
- GPU recomendadas: para ejecutar la versión bf16 se necesita un dispositivo Apple Silicon con al menos 64 GB de memoria unificada (la medición se hizo en un M3 Ultra con 512 GB). Las versiones cuantizadas (4-bit) caben en Macs con 16-24 GB de memoria unificada.
- En GPU de consumo (NVIDIA RTX 4090 con 24 GB VRAM) solo sería viable la versión 4-bit o 6-bit; la bf16 requiere más de 50 GB, por lo que no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: `mlx-lm` (biblioteca oficial de Apple para MLX), compatible con scripts de línea de comandos y API Python. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión, aunque el modelo base podría ejecutarse con esas herramientas en otros formatos.
- Latencia y throughput: 12,7 tokens/s en la versión bf16 medida en M3 Ultra; las versiones cuantizadas ofrecen hasta 37,9 tok/s en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | ~27B | 262K | Multimodal (imagen-texto) | Apache-2.0 | HuggingFace |
| Este repo (MLX bf16) | ~26,9B | No disponible (heredado del base) | Solo texto | Apache-2.0 | HuggingFace |
| trohrbaugh/Qwen3.8-27B-heretic-ara | ~26,9B | No disponible | Multimodal (presumiblemente) | Apache-2.0 | HuggingFace |

La comparación principal es con el modelo original Qwen3.8-27B: este repo elimina la alineación de seguridad y reduce la modalidad a solo texto, a cambio de ofrecer un formato optimizado para Apple Silicon. No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterado: no tiene alineación de seguridad; puede generar contenido dañino, ilegal o explícito. El autor recomienda evaluarlo antes de ponerlo en producción y aplicar filtrado propio.
- Solo texto: no procesa imágenes ni vídeo, a diferencia del modelo base multimodal.
- Sin cuantizar: requiere ~54 GB de memoria para inferencia, lo que limita su uso a hardware de gama alta (Apple Silicon con mucha memoria unificada o GPUs profesionales con >50 GB VRAM).
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en modos de razonamiento extendido.
- Longitud de contexto no confirmada: aunque el modelo base declara 262K tokens, esta conversión no especifica si mantiene esa ventana completa.
- Idiomas no documentados: no se indica qué idiomas soporta de forma fiable.
- Descargas y adopción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción muy limitada o reciente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la responsabilidad del contenido generado recae en el usuario final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-bf16
- Modelo base (abliterado): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 4-bit: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-4bit
- Build 6-bit: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-6bit
- Build 8-bit: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-8bit
- Review en Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Noticia en Gigazine: https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
