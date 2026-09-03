# johnhalloran/goramen-instruct-gemma-4-sft-gguf

## Resumen

`goramen-instruct-gemma-4-sft-gguf` es una conversión a GGUF de un fine-tune QLoRA del modelo `google/gemma-4-E4B-it` (7.46B parámetros), realizada por johnhalloran. El modelo resultante está especializado en mantener conversaciones con la voz distintiva de un blog de reseñas de ramen (Go Ramen), a diferencia del modelo original `goramen-blog-gemma-4-sft` que solo generaba monólogos en formato de entrada de blog. El fine-tune se entrenó sobre un dataset mixto de instrucciones (`johnhalloran/goramen-instruct`) que combina preguntas y respuestas del blog, transferencia de persona de AlpaGasus y secciones del "Book of Ramen". La conversión a GGUF se realizó con `llama.cpp` y se cuantizó a Q4_K_M, lo que permite su ejecución local eficiente con `llama.cpp` o `llama-cpp-python`. El modelo es solo texto, sin torre de visión, y hereda las capacidades generales del modelo base Gemma 4 E4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (transformer decoder, generacion condicional) |
| Parametros totales | 7.463.013.674 (7,46B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (hereda del modelo base, no especificado) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (archivo `goramen-instruct-gemma-4-sft-Q4_K_M.gguf`, ~4,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/gemma-4-e4b-it-4bit`, una conversión MLX del checkpoint oficial `google/gemma-4-E4B-it` con pesos en 4 bits (afine, grupo 64). Sobre este modelo congelado se aplicó QLoRA con rango 32, alpha 64, escala 2.0 y dropout 0.05 en las 42 capas decoder, añadiendo 77,3M de parámetros entrenables (1,04% del total). El entrenamiento se realizó con el optimizador AdamW, tasa de aprendizaje pico 1e-4 con decaimiento coseno y 30 pasos de calentamiento, batch efectivo de 8 (batch 1 con acumulación de gradientes 8), durante 3 épocas (10.512 iteraciones) sobre un dataset de 3.705 filas (3.505 de entrenamiento, 100 de validación, 100 de prueba). El hardware fue Apple Silicon con MLX, consumiendo ~9,5 GB de memoria unificada y ~8,25 horas. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` (ruta de texto `Gemma4ForConditionalGeneration` → `Gemma4Model`) y posterior cuantización Q4_K_M con `llama-quantize`. El checkpoint subido corresponde a la iteración 6306 (60% del entrenamiento), donde la pérdida de validación fue mínima, no al checkpoint final.

## Capacidades

- Generación de texto conversacional con una voz específica (la del blog Go Ramen), capaz de mantener diálogos multi-turno coherentes.
- Seguimiento de instrucciones en formato chat (system/user/assistant) gracias al fine-tune sobre dataset de instrucciones.
- Generación de contenido temático sobre ramen: descripciones de caldos, fideos, toppings, experiencias gastronómicas.
- Capacidades generales heredadas del modelo base Gemma 4 E4B (razonamiento, conocimiento general, generación de código, etc.), aunque no se detallan en la documentación.
- Solo texto: no incluye procesamiento de imágenes ni visión.
- Inferencia local eficiente gracias a la cuantización Q4_K_M y al formato GGUF compatible con `llama.cpp`.

## Casos de uso

- Generación de entradas de blog sobre ramen: el modelo puede redactar reseñas completas en el estilo característico del blog, a partir de una breve indicación sobre el plato o la tienda.
- Chat temático para una web de gastronomía: integrado como asistente conversacional que responde preguntas sobre ramen con un tono cercano y desenfadado, ideal para atraer visitantes.
- Creación de contenido para redes sociales: generar hilos de Twitter, descripciones de Instagram o guiones de vídeo sobre ramen con la voz del blog.
- Asistente para redactores de contenido culinario: ayuda a generar borradores de artículos, listas de recomendaciones o respuestas a comentarios de lectores.
- Prototipo de agente conversacional con personalidad: sirve como ejemplo de fine-tuning para transferir una voz o estilo concreto a un modelo base, demostrando el flujo QLoRA + GGUF.
- Experimentación en entornos de investigación: útil para estudiar el efecto del fine-tuning con datasets pequeños (3,7k filas) sobre la coherencia conversacional y la estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas de evaluación durante el entrenamiento:

| Checkpoint | Val loss (durante entrenamiento) | Test loss | Test perplexity |
|---|---|---|---|
| iter 6306 (60% del entrenamiento) | 2,057 (mínimo observado) | 2,849 | 17,27 |
| iter 10512 (final) | 2,486 | 2,968 | 19,45 |

El modelo subido corresponde al checkpoint iter-6306, que muestra mejor generalización en test que el checkpoint final, indicando un patrón de sobreajuste en las últimas etapas del entrenamiento.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa ~4,9 GB, por lo que se recomienda al menos 6 GB de VRAM para inferencia en GPU, o ~8 GB de RAM para ejecución en CPU.
- GPU recomendadas: tarjetas con 6 GB o más de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060, GTX 1660 Super). En GPUs con menos VRAM se puede usar offloading parcial a CPU.
- Compatible con hardware Apple Silicon (M1/M2/M3) mediante `llama.cpp` o `llama-cpp-python`, aprovechando la memoria unificada.
- Opciones de despliegue: `llama.cpp`, `llama-cpp-python`, `Ollama` (si se importa el GGUF), `llama-server` para API REST, o integración en aplicaciones Python.
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos. A continuación se presenta una comparación cualitativa con el modelo base y el modelo original del mismo autor:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| `goramen-instruct-gemma-4-sft-gguf` (este) | 7,46B | no disponible | Gemma | GGUF Q4_K_M | Conversacion en voz de blog de ramen |
| `goramen-blog-gemma-4-sft` (original) | 7,46B | no disponible | Gemma | no especificado | Generacion de entradas de blog (monologo) |
| `google/gemma-4-E4B-it` (base) | 7,46B | no disponible | Gemma | safetensors | Modelo instruct general |

No se dispone de información sobre otros modelos comparables de la misma categoría (fine-tunes conversacionales sobre Gemma 4).

## Limitaciones y advertencias

- Sin recuperación de información: el modelo no tiene acceso a fuentes externas y puede generar hechos incorrectos sobre tiendas de ramen o detalles específicos del blog. Para respuestas fundamentadas, se recomienda combinarlo con un sistema de recuperación sobre el dataset `johnhalloran/goramen-blog`.
- Sobreajuste detectado: la pérdida de validación aumenta después del 60% del entrenamiento, lo que sugiere que el modelo puede memorizar el dataset de entrenamiento y generalizar peor en datos no vistos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente sobre temas fuera de su dominio de especialización.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Gemma 4 E4B es multilingüe, pero el fine-tune se realizó con datos en inglés (el blog y los datasets mencionados), por lo que su rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia Gemma permite uso comercial, pero el texto de entrenamiento (posts del blog) es trabajo con copyright del autor. El dataset es una copia personal de archivo y no otorga derechos de reutilización del contenido subyacente. Cualquier uso comercial debe verificar el cumplimiento de la licencia Gemma y los derechos sobre el contenido generado.
- Solo texto: no soporta entrada de imágenes ni tareas multimodales.
- El modelo está cuantizado a Q4_K_M, lo que puede implicar una ligera degradación de calidad frente a la versión sin cuantizar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnhalloran/goramen-instruct-gemma-4-sft-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/johnhalloran/goramen-instruct
- Dataset del blog (para recuperación): https://huggingface.co/datasets/johnhalloran/goramen-blog
- Modelo base (MLX): https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit
- Modelo base (oficial): https://huggingface.co/google/gemma-4-E4B-it
- Modelo original del autor: https://huggingface.co/johnhalloran/goramen-blog-gemma-4-sft
- Términos de la licencia Gemma: https://ai.google.dev/gemma/terms
