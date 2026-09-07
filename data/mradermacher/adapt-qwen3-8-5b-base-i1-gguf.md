# mradermacher/ADAPT-Qwen3-8.5B-Base-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con importancia (imatrix) del modelo ADAPT-Qwen3-8.5B-Base, desarrollado por Harvard-DCML. El modelo original es un modelo de lenguaje base con 8.492.380.416 parámetros (aproximadamente 8.5 mil millones), entrenado con los datasets EleutherAI/the_pile_deduplicated y nvidia/Llama-Nemotron-Post-Training-Dataset. La cuantización ha sido realizada por mradermacher para facilitar su ejecución en hardware local mediante llama.cpp y otros entornos compatibles con GGUF.

El modelo se distribuye bajo licencia Apache 2.0 y soporta únicamente inglés. Al ser un modelo base, no está alineado para instrucciones, por lo que su uso directo en tareas de chat requiere un fine-tuning adicional. La disponibilidad de múltiples niveles de cuantización permite adaptar el consumo de memoria y la calidad de salida según el hardware disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 8.492.380.416 (8.5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original ADAPT-Qwen3-8.5B-Base es un modelo de lenguaje de tipo transformer, aunque la información disponible no especifica la arquitectura exacta ni la longitud de contexto. Se ha entrenado con los datasets EleutherAI/the_pile_deduplicated y nvidia/Llama-Nemotron-Post-Training-Dataset. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La cuantización GGUF utiliza un archivo de importancia (imatrix) para preservar la calidad de los pesos durante la compresión. mradermacher ha generado veinticuatro variantes de cuantización, desde IQ1_S (2.4 GB) hasta Q6_K (7.1 GB), lo que permite elegir entre máxima compresión y mayor fidelidad. El archivo imatrix incluido permite generar nuevas cuantizaciones personalizadas.

## Capacidades

- Generación de texto y completado de prompts en inglés.
- Modelo base: no está alineado para instrucciones, por lo que su uso en tareas de chat requiere un fine-tuning posterior.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio.
- Al estar entrenado con the_pile_deduplicated, que incluye código fuente, podría utilizarse como base para modelos de autocompletado de código.
- La cuantización con imatrix mejora la calidad de los pesos comprimidos en comparación con cuantizaciones estáticas equivalentes.

## Casos de uso

- Fine-tuning para clasificación de textos: al ser un modelo base, puede adaptarse con datos propios para tareas como análisis de sentimiento, detección de spam o categorización de documentos en inglés.
- Generación de texto en inglés: tras un ajuste con datos de instrucciones, puede utilizarse para redactar artículos, resúmenes o correos electrónicos.
- Completado de código: dado que the_pile_deduplicated incluye repositorios de código, el modelo puede servir como base para sistemas de autocompletado en entornos de desarrollo.
- Investigación en NLP: es útil para estudiar el efecto de distintas cuantizaciones (IQ, Q, imatrix) en la calidad de salida y el consumo de recursos.
- Entrenamiento de modelos especializados: puede fine-tunearse para dominios concretos como legal, médico o financiero, siempre que se disponga de datos en inglés.
- Análisis de documentos: extracción de información y resumen de textos largos en inglés, tras un ajuste con datos de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización i1-Q4_K_M (5.3 GB), se recomienda al menos 8 GB de VRAM para un contexto moderado. Con i1-Q6_K (7.1 GB), se recomiendan 10-12 GB de VRAM. Las cuantizaciones más agresivas (i1-IQ1_S, 2.4 GB) permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM, aunque con pérdida de calidad.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB. También puede ejecutarse en CPU mediante llama.cpp, ya que los pesos GGUF están optimizados para ello.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier entorno compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- Modelo entrenado únicamente en inglés; su rendimiento en otros idiomas es limitado o nulo.
- Al ser una cuantización, puede haber pérdida de calidad en comparación con los pesos originales en FP16, especialmente en cuantizaciones muy agresivas (i1-IQ1_S, i1-IQ2_XS).
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado al no estar alineado con instrucciones.
- Licencia Apache 2.0: permite uso comercial, pero requiere incluir el aviso de licencia y las atribuciones correspondientes.
- No se dispone de información sobre sesgos específicos, aunque los datasets de entrenamiento (the_pile) pueden contener sesgos presentes en contenido de internet.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/ADAPT-Qwen3-8.5B-Base-i1-GGUF
- Modelo base original: https://huggingface.co/Harvard-DCML/ADAPT-Qwen3-8.5B-Base
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/ADAPT-Qwen3-8.5B-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
