# shoemoney/Qwen3.8-27B-Abliterated-MLX-q5

## Resumen

El modelo `shoemoney/Qwen3.8-27B-Abliterated-MLX-q5` es una cuantización en 5 bits (MLX) del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterated" (sin censura) del Qwen3.8-27B, un modelo multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. La versión original destaca en tareas de generación de código, flujos de trabajo agénticos y automatización de oficina, tanto en texto como en imagen.

Esta variante MLX está optimizada para hardware Apple Silicon, con un tamaño en disco de 19,44 GB y una perplejidad de 6,419 medida sobre `allenai/tulu-3-sft-mixture`. El proceso de conversión se realizó con `mlx_vlm.convert` a partir de los pesos BF16, sin fine-tuning ni realineamiento adicional. Es relevante para desarrolladores que necesitan ejecutar localmente un modelo multimodal sin restricciones de contenido en equipos Apple, manteniendo un rendimiento razonable en términos de velocidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 5.505.879.280 (segun safetensors; el nombre indica 27B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5-bit (MLX) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que procesa tanto texto como imagenes. Segun la informacion publica de Alibaba, incorpora mejoras respecto a la version 3.6-27B en capacidades de codificacion y productividad de oficina, con un enfoque en la ejecucion fiable de tareas complejas de extremo a extremo. La version "abliterated" elimina las restricciones de contenido tipicas de los modelos alineados, permitiendo generar respuestas sin censura.

La variante MLX aqui descrita no anade entrenamiento adicional: se trata de una cuantizacion a 5 bits de los pesos BF16 originales, con un grupo de cuantizacion de tamaño 64. El proceso se realizo con la herramienta `mlx_vlm.convert` y no incluye fusion de pesos ni realineamiento. La perplejidad medida es 6,419, un 3 % superior al mejor rung de la misma familia de cuantizaciones, lo que indica una perdida minima de calidad.

## Capacidades

- Generacion de texto y razonamiento multimodal (texto e imagenes).
- Generacion de codigo y automatizacion de tareas de oficina, segun las capacidades del modelo base.
- Sin censura de contenido (abliterated), lo que permite respuestas sobre temas que los modelos alineados suelen rechazar.
- Ejecucion nativa en Apple Silicon mediante la libreria `mlx-vlm`.
- Soporte de cuantizacion 5-bit, que reduce el uso de memoria sin sacrificar excesivamente la calidad.

No se ha confirmado en la informacion disponible el soporte explicito de tool calling, function calling o capacidades de agente, aunque el modelo base Qwen3.8-27B esta disenado para flujos agénticos.

## Casos de uso

- Asistente de codigo con soporte visual: el modelo puede analizar capturas de pantalla o diagramas y generar o explicar codigo, aprovechando su naturaleza multimodal y su entrenamiento en tareas de programacion.
- Automatizacion de documentos de oficina: procesamiento de imagenes de documentos, extraccion de informacion y generacion de resumenes o respuestas en entornos locales sin conexion.
- Prototipado rapido de aplicaciones de vision-lenguaje en Apple Silicon: gracias a la cuantizacion MLX, se puede integrar en aplicaciones macOS o iOS con requisitos de memoria moderados.
- Investigacion sobre alineacion y censura: al ser una version abliterated, permite estudiar el comportamiento de un modelo sin restricciones de seguridad, comparandolo con la version original.
- Despliegue en entornos con hardware limitado: con 19,44 GB en disco y un consumo de memoria acorde, puede ejecutarse en equipos Apple con 32 GB o mas de memoria unificada.
- Generacion de contenido creativo sin filtros: redaccion de textos, guiones o material educativo donde se requiera evitar las restricciones habituales de los modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos por el autor son:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 6,419 |
| Perplejidad relativa al mejor rung de la familia | 1,03× |
| Throughput (1 peticion) | 22,1 tok/s |
| Throughput (8 peticiones concurrentes) | 65,7 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27. La perplejidad solo es comparable dentro de la misma familia de cuantizaciones, no entre modelos con tokenizadores distintos.

## Requisitos de hardware

- Memoria unificada minima recomendada: 24 GB (el modelo ocupa 19,44 GB en disco, mas overhead de ejecucion).
- GPU compatible: cualquier Apple Silicon con al menos 24 GB de memoria unificada (M1 Pro/Max/Ultra, M2, M3, etc.).
- Probado en: Apple M3 Ultra con 96 GB de memoria unificada.
- Opciones de despliegue: `mlx-vlm` (libreria oficial de Apple para modelos de vision-lenguaje en MLX). No es compatible con CUDA ni con otras librerias como vLLM o llama.cpp.
- Latencia y throughput: 22,1 tok/s en generacion secuencial y 65,7 tok/s con 8 peticiones concurrentes en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | BF16 | Apache-2.0 | Hugging Face |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27B | No disponible | No especificada | Apache-2.0 | Hugging Face |
| shoemoney/Qwen3.8-27B-Abliterated-MLX-q5 | 5,5B (segun safetensors) | No disponible | 5-bit MLX | Apache-2.0 | Hugging Face |

La principal diferencia de esta variante es su formato MLX, exclusivo para Apple Silicon, y su cuantizacion 5-bit que reduce el tamaño a 19,44 GB. El modelo original y la version OBLITERATUS estan disponibles en pesos BF16, lo que requiere mas memoria. No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Al ser una version abliterated, el modelo puede generar contenido ofensivo, ilegal o eticamente problematico sin restricciones. No es adecuado para aplicaciones de produccion donde se requiera moderacion de contenido.
- La perplejidad es un 3 % superior a la mejor cuantizacion de la misma familia, lo que indica una ligera perdida de calidad respecto a pesos completos.
- Solo funciona en Apple Silicon; no es portable a entornos Linux con GPU NVIDIA o AMD.
- El numero de parametros indicado en safetensors (5,5B) contradice el nombre del modelo (27B). Esta discrepancia no esta explicada en la documentacion y podria deberse a un error en la conversion o a que solo se incluyen los pesos del decoder de lenguaje, sin el encoder de vision.
- No se han publicado resultados de benchmarks estandar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir la autoría del modelo base y de la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-q5
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de AlibabaCloud-Official: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Pagina de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Version OBLITERATUS (alternativa): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
