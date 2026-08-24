# shoemoney/Qwen3.8-27B-Abliterated-MLX-q3

## Resumen

Este modelo es una cuantización MLX de 3 bits del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión sin censura (abliterated) del Qwen3.8-27B de Alibaba. El resultado es un checkpoint de 12,7 GB pensado para ejecutarse en Apple Silicon mediante la librería `mlx-vlm`. El modelo base es un LLM multimodal denso de 27B parámetros con contexto nativo de 262.144 tokens, capaz de procesar texto, imagen y vídeo de hasta una hora de duración.

La relevancia de esta ficha radica en que ofrece una vía para ejecutar un modelo de 27B con capacidades multimodales y sin restricciones de seguridad en hardware de consumo de Apple, algo poco habitual. La cuantización a 3 bits reduce drásticamente el tamaño y la memoria necesaria, a costa de una pérdida de calidad que los autores han medido con perplexidad y throughput. Es una opción interesante para desarrolladores que necesitan un modelo local, rápido y sin filtros para prototipado o entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, imagen, vídeo) |
| Parametros totales | 27B (nominal; el archivo safetensors reporta 3.825.044.720, posiblemente un error de extracción) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo); extensible a 1.000.000 solo en la nube de Qwen |
| Tipos de cuantizacion | 3-bit (este repo); la familia incluye otras cuantizaciones (4-bit, 8-bit, BF16) |
| Idiomas soportados | No disponible (el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención estándar, entrenado por Alibaba con datos multimodales que incluyen texto, imagen y vídeo. No se trata de un modelo MoE ni híbrido; es una arquitectura clásica de decoder-only con 27B parámetros. El proceso de "abliteration" aplicado por huihui-ai elimina las capas de rechazo de seguridad del modelo original, de modo que el modelo responde sin los filtros habituales de contenido.

La cuantización a 3 bits se realizó con `mlx_vlm.convert` a partir del checkpoint BF16, con un grupo de cuantización de 64. No hubo fine-tuning, ni merging, ni re-alineamiento posterior. El autor midió la perplexidad en `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123) y obtuvo un valor de 7,178, que es 1,15 veces el del mejor rango de la misma familia de cuantizaciones. El throughput medido en Apple M3 Ultra (96 GB) es de 22,1 tok/s con una petición y 65,7 tok/s con 8 peticiones concurrentes.

## Capacidades

- Generación de texto, razonamiento, matemáticas y código, heredadas del modelo base Qwen3.8-27B.
- Procesamiento multimodal: entrada de imágenes y vídeo (hasta una hora de duración) además de texto.
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de agentes.
- Capacidad para tareas de automatización de oficina, como generación de documentos, resúmenes o extracción de datos.
- Multilingüe (según el modelo base, aunque no se especifican idiomas concretos en la ficha).
- Sin censura: al ser una versión abliterated, no aplica los rechazos de seguridad del modelo original, lo que permite generar contenido que otros modelos bloquean.

## Casos de uso

- Asistente de programación local: el modelo puede completar código, explicar fragmentos y depurar errores directamente en un Mac con Apple Silicon, sin depender de la nube. Su contexto de 262K tokens permite cargar repositorios completos o documentación extensa.
- Automatización de oficina: gracias a su capacidad multimodal, puede extraer información de capturas de pantalla, PDFs escaneados o vídeos de reuniones, y generar resúmenes o informes. La cuantización 3-bit permite ejecutarlo en un portátil sin necesidad de servidor.
- Agente autónomo con tool calling: al soportar function calling, puede encadenar llamadas a APIs, bases de datos o scripts, y ejecutar tareas de varios pasos. Su tamaño reducido lo hace viable para entornos de desarrollo integrados.
- Generación de contenido creativo sin restricciones: la versión abliterated permite explorar narrativas, guiones o material de marketing sin los filtros habituales, útil para estudios de creatividad o investigación en generación de texto.
- Prototipado rápido de aplicaciones multimodales: desarrolladores que quieran probar un modelo de 27B con visión y vídeo en local pueden usar este checkpoint para validar ideas antes de escalar a modelos más grandes.
- Análisis de vídeo en tiempo real: con una ventana de contexto de 262K tokens y soporte de vídeo, puede resumir o indexar contenido de vídeo de hasta una hora, por ejemplo para transcripción o búsqueda de momentos clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. El autor solo proporciona mediciones propias de perplexidad y throughput, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Perplexidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 7,178 |
| Perplexidad relativa al mejor rango de la familia | 1,15× |
| Throughput (1 petición) | 22,1 tok/s |
| Throughput (8 peticiones concurrentes) | 65,7 tok/s |

Estas cifras se midieron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplexidad solo es comparable dentro de la misma familia de cuantizaciones, ya que los tokenizadores difieren entre modelos.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 12,72 GB en disco, por lo que se necesita al menos 16 GB de memoria unificada en Apple Silicon para cargarlo con margen. Se recomienda 32 GB para trabajar con contextos largos o múltiples peticiones concurrentes.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M2 Max, M3 Ultra, etc.). No está pensado para GPU NVIDIA, aunque el modelo base se puede convertir a otros formatos.
- Ejecución: se usa la librería `mlx-vlm` (no `mlx-lm`), con el comando `mlx_vlm.generate --model shoemoney/Qwen3.8-27B-Abliterated-MLX-q3 --prompt "Hello" --max-tokens 256`.
- Latencia y throughput: en M3 Ultra, 22,1 tok/s en inferencia secuencial y 65,7 tok/s con 8 peticiones concurrentes. En chips más modestos, el rendimiento será menor.
- Alternativas de despliegue: este formato es específico de MLX; para usar en otras plataformas (vLLM, llama.cpp, Ollama) habría que convertir el modelo base a GGUF o safetensors estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262K | BF16 | ~54 GB | Apache-2.0 | Modelo original de Alibaba, multimodal, con filtros de seguridad |
| Qwen3.8-27B-Abliterated (BF16) | 27B | 262K | BF16 | ~54 GB | Apache-2.0 | Versión sin censura de huihui-ai |
| Qwen3.8-27B-Abliterated-MLX-q3 (este) | 27B | 262K | 3-bit | 12,7 GB | Apache-2.0 | Cuantización MLX para Apple Silicon, sin censura |
| Qwen3.8-27B-Abliterated-MLX-q4 (hipotético) | 27B | 262K | 4-bit | ~17 GB | Apache-2.0 | Mejor calidad que q3, mayor tamaño (no verificado) |

La comparativa se limita a la familia Qwen3.8-27B porque no se dispone de datos de otros modelos de 27B con características equivalentes en esta información.

## Limitaciones y advertencias

- La cuantización a 3 bits degrada la calidad del modelo. La perplexidad medida es 1,15 veces peor que la del mejor rango de la familia, lo que puede traducirse en errores más frecuentes en tareas complejas.
- El modelo es "uncensored" por diseño. Puede generar contenido ofensivo, ilegal o peligroso si se le pide. No es adecuado para aplicaciones orientadas al público sin un sistema de moderación adicional.
- El contexto nativo es de 262.144 tokens, pero la extensión a 1.000.000 solo está disponible en la nube de Qwen, no en este checkpoint local.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.
- El número de parámetros reportado en el archivo safetensors (3.825.044.720) no coincide con el nombre del modelo (27B). Es probable que sea un error de extracción, pero conviene verificarlo antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales en cuanto a atribución o uso de marcas. Se recomienda revisar la documentación de Alibaba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-q3
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía para ejecutar Qwen3.8-27B localmente: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Guía de ejecución en GPU (16-24 GB): https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
