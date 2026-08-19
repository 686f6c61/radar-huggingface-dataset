# groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64-calib128

## Resumen

Este modelo es una cuantización GPTQ-Pro en INT4 del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una versión sin censura del modelo Qwen3.8-27B de Alibaba. La cuantización ha sido realizada por groxaxo con la herramienta GPTQModel 6.1.0-dev, utilizando un grupo de cuantización de 64 y 128 muestras de calibración. El resultado es un archivo de 20,1 GB que mantiene el head MTP (multi-token prediction) sin cuantizar, lo que permite usar decodificación especulativa nativa en vLLM para acelerar la inferencia.

El modelo base Qwen3.8-27B presenta una arquitectura híbrida con 64 capas, de las cuales 48 usan atención lineal (GDN) y 16 atención completa. Soporta un contexto de 262.000 tokens, modo de razonamiento (thinking) y entrada multimodal texto-imagen. La versión abliterated elimina los mecanismos de rechazo del modelo original, por lo que no aplica filtros de seguridad. Esta cuantización está pensada para entornos de producción con GPUs de 24 GB o superiores, y ofrece mejoras de rendimiento significativas cuando se combina con el drafter MTP en configuraciones de múltiples GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (48 capas de atención lineal GDN + 16 de atención completa, 64 capas totales) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | GPTQ-Pro INT4 simétrico, group size 64, calibración de 128 muestras |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva de `Qwen/Qwen3.8-27B`. La abliteration es una técnica que elimina los mecanismos de rechazo del modelo original sin necesidad de reentrenamiento, modificando las capas profundas (a partir de la capa 15) para eliminar las direcciones de activación asociadas a la negativa. El resultado es un modelo sin filtros de seguridad.

La cuantización se realizó con GPTQ-Pro (GPTQModel 6.1.0-dev) en modo texto, con 128 muestras de calibración, group size 64 y activación simétrica. Se cubrieron los 400 módulos lineales de las 64 capas. El head MTP (multi-token prediction) se preservó sin cuantizar, lo que permite usar decodificación especulativa en vLLM. La pérdida media de cuantización por módulo es de 8,2e-5 (máxima 4,9e-4), con damping entre 1,49 y 8,94.

## Capacidades

- Generación de texto sin censura: al ser abliterated, no aplica los mecanismos de rechazo del modelo original, por lo que puede generar contenido que Qwen3.8-27B rechazaría.
- Modo de razonamiento (thinking mode): heredado del modelo base, permite generar cadenas de razonamiento antes de la respuesta final.
- Entrada multimodal texto-imagen: el modelo base acepta imágenes, aunque la cuantización está optimizada principalmente para texto. No se ha verificado el funcionamiento de la parte visual en esta cuantización.
- Decodificación especulativa con MTP: el head MTP preservado permite acelerar la generación en vLLM con `num_speculative_tokens=1`, logrando un aumento de hasta el 47,6% en velocidad single-stream.
- Tool calling y function calling: probablemente heredado del modelo base, aunque no está confirmado explícitamente en la documentación.
- Soporte de agentes y razonamiento multi-paso: gracias al modo thinking y a la capacidad de razonamiento del modelo base.

## Casos de uso

- Generación de ficción y escritura creativa sin restricciones temáticas: el modelo puede producir narrativas, diálogos y guiones sin los filtros de seguridad habituales, lo que resulta útil para autores que exploran temas controvertidos o maduros.
- Roleplay y chatbots de personajes: su naturaleza sin censura y su capacidad conversacional lo hacen adecuado para asistentes virtuales con personalidades definidas y sin limitaciones de contenido.
- Generación de código en producción con baja latencia: gracias a la decodificación especulativa MTP, puede servir peticiones de código a alta velocidad en entornos con 2 GPUs de 24 GB, integrándose en pipelines de CI/CD o asistentes de desarrollo.
- Análisis de texto y extracción de información: con su contexto de 262.000 tokens, puede procesar documentos largos, resumir informes y extraer entidades sin necesidad de dividir el texto.
- Despliegue en entornos con una sola GPU de 24 GB: sin MTP, el checkpoint cabe en una RTX 3090 o RTX 4090 con `--max-model-len 4096`, ofreciendo 42,9 tok/s en single-stream, suficiente para aplicaciones interactivas.
- Investigación en alineación y seguridad de modelos: al ser una versión sin censura, permite estudiar el comportamiento del modelo cuando se eliminan los mecanismos de rechazo, comparando con la versión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de velocidad de inferencia, que se resumen a continuación:

| Configuración | Single-stream (tok/s) | Agregado 8 concurrentes (tok/s) |
|---|---|---|
| 2× RTX 3090, TP=2, sin MTP | 71,5 | 390,6 / 430,9 |
| 2× RTX 3090, TP=2, con MTP | 105,5 (+47,6%) | 426,4 / 555,4 (+9% / +28,9%) |
| 1× RTX 3090, sin MTP | 42,9 | ~273 |

## Requisitos de hardware

- VRAM estimada: el checkpoint INT4 ocupa aproximadamente 21,5 GiB. Con el drafter MTP (~2,4 GiB) el total asciende a ~23,9 GiB, por lo que no cabe en una GPU de 24 GB con MTP activado.
- GPU recomendadas: para usar MTP se necesitan al menos 2 GPUs de 24 GB (RTX 3090, RTX 4090) en configuración tensor-parallel, o una GPU con más de 24 GB (A100 40/80 GB, H100). Sin MTP, una sola RTX 3090 o RTX 4090 es suficiente.
- Opciones de despliegue: vLLM es la opción recomendada (compatible con GPTQ y MTP). También puede cargarse con transformers, aunque sin las optimizaciones de vLLM. No se menciona compatibilidad con Ollama o llama.cpp para esta cuantización específica.
- Latencia y throughput: los datos medidos se muestran en la tabla de benchmarks. Con MTP en 2× RTX 3090 se alcanzan 105,5 tok/s en single-stream y hasta 555,4 tok/s agregados con 8 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64-calib128 (este) | 27,8 B | 262k | GPTQ-Pro INT4 g64 | Apache 2.0 | Sin censura, MTP preservado |
| groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64 (calib-64) | 27,8 B | 262k | GPTQ-Pro INT4 g64 | Apache 2.0 | Misma cuantización con 64 muestras de calibración |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (sin cuantizar) | 27,8 B | 262k | FP16/BF16 | Apache 2.0 | Modelo base abliterated, requiere ~56 GB en FP16 |
| Qwen/Qwen3.8-27B (original) | 27,8 B | 262k | FP16/BF16 | Apache 2.0 | Con filtros de seguridad, sin abliteration |

La comparativa se basa en características cualitativas, ya que no se dispone de benchmarks de calidad para esta cuantización. La principal ventaja frente al modelo sin cuantizar es el menor requisito de VRAM y la mayor velocidad de inferencia, a costa de una posible degradación en la calidad debido a la cuantización INT4.

## Limitaciones y advertencias

- Al ser un modelo abliterated, no tiene los mecanismos de seguridad del modelo original. Puede generar contenido ofensivo, ilegal, peligroso o sexualmente explícito. No debe desplegarse en entornos donde se requiera moderación de contenido.
- La cuantización INT4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en FP16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- El head MTP no es compatible con `min_p` ni `logit_bias` en vLLM (se muestra una advertencia al usarlos con decodificación especulativa).
- En una sola GPU de 24 GB, el drafter MTP no cabe junto al checkpoint, por lo que la decodificación especulativa solo está disponible en configuraciones multi-GPU o con GPUs de mayor VRAM.
- El contexto de 262.000 tokens puede consumir mucha memoria en atención, incluso con cuantización. Se recomienda ajustar `max_model_len` según la VRAM disponible.
- No se han publicado benchmarks de calidad, por lo que el rendimiento real en tareas estándar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el carácter sin censura del modelo puede generar responsabilidades legales si se utiliza para difundir contenido dañino.

## Enlaces

- [Modelo en HuggingFace (este checkpoint)](https://huggingface.co/groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64-calib128)
- [Modelo base abliterated (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Versión calib-64 del mismo autor](https://huggingface.co/groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64)
- [Repositorio GPTQ-Pro en GitHub](https://github.com/groxaxo/GPTQ-Pro)
- [Artículo sobre el lanzamiento del modelo abliterated](https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html)
