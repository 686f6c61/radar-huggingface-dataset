# mradermacher/Gemma4-Gutenberg-26B-A4B-safetensors-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Gemma4-Gutenberg-26B-A4B`, un modelo de lenguaje de gran tamaño con 25.233.142.046 parámetros totales. El nombre sugiere que se trata de una arquitectura de mezcla de expertos (MoE) con 4 mil millones de parámetros activos (A4B), aunque esta característica no está confirmada oficialmente. El modelo base fue publicado por el usuario `26B-Suite` y la cuantización ha sido realizada por `mradermacher`, un autor conocido por generar versiones GGUF con imatrix para optimizar la calidad de la compresión.

La model card indica que el modelo está orientado al inglés y que es un modelo de visión, aunque los archivos de proyección multimodal (mmproj) no se incluyen en este repositorio, sino en el repositorio estático asociado. Esta ficha resulta relevante para desarrolladores que necesiten ejecutar el modelo en entornos locales mediante motores compatibles con GGUF como llama.cpp, Ollama o LM Studio, aprovechando cuantizaciones de bajo tamaño para reducir requisitos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posiblemente transformer MoE) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (el nombre sugiere 4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,7 GB), i1-IQ3_M (12,5 GB), archivo imatrix (0,2 GB) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Gemma4-Gutenberg-26B-A4B`. El nombre sugiere una posible base en la familia Gemma de Google y un entrenamiento adicional con textos del Proyecto Gutenberg, pero esto no está confirmado en la documentación disponible. El autor de la cuantización, `mradermacher`, ha aplicado la técnica de imatrix (importance matrix) para mejorar la calidad de los quants de baja precisión, un método que pondera la importancia de los pesos durante la cuantización. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, presumiblemente con capacidades conversacionales (etiqueta "conversational" en HuggingFace).
- Posible capacidad de procesamiento de imágenes, ya que la model card lo describe como "vision model", aunque los componentes multimodales no están presentes en este repositorio.
- Soporte para cuantización GGUF, lo que permite su uso en una amplia gama de motores de inferencia local.
- Sin información confirmada sobre tool calling, razonamiento multi-paso o capacidades de agente.

## Casos de uso

- Inferencia local en CPU o GPU con llama.cpp: gracias a su formato GGUF y cuantizaciones de bajo tamaño, puede ejecutarse en equipos con recursos limitados, por ejemplo en un portátil con 16 GB de RAM para tareas de generación de texto.
- Chatbot conversacional: el modelo está etiquetado como "conversational", por lo que puede integrarse en aplicaciones de chat simples mediante Ollama o LM Studio.
- Experimentación con cuantización: el archivo imatrix incluido permite a los usuarios crear sus propias cuantizaciones personalizadas para investigar el equilibrio entre tamaño y calidad.
- Prototipado rápido: al ser un GGUF, se puede cargar fácilmente con bibliotecas como `llama-cpp-python` para probar respuestas en entornos de desarrollo.
- Generación de contenido literario: si el nombre "Gutenberg" indica un entrenamiento con obras literarias, podría ser adecuado para tareas de escritura creativa o análisis de textos clásicos, aunque esto no está confirmado.
- Evaluación de modelos MoE cuantizados: para investigadores interesados en el rendimiento de arquitecturas de mezcla de expertos en formatos comprimidos, este modelo ofrece un caso de estudio con 26B totales y presumiblemente 4B activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

- Para el quant i1-Q2_K (10,7 GB): se recomienda al menos 12 GB de VRAM en GPU para una carga completa, o 16 GB de RAM si se usa CPU con offloading parcial.
- Para el quant i1-IQ3_M (12,5 GB): se recomienda al menos 14 GB de VRAM, por lo que GPUs como RTX 4080, RTX 4090 o A100 (40 GB) son adecuadas.
- En CPU, se puede ejecutar con llama.cpp usando memoria RAM, pero la latencia será alta para modelos de este tamaño; se recomienda un mínimo de 16 GB de RAM.
- Motores compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui, entre otros.
- La latencia y el throughput dependen del hardware; sin datos específicos, se estima una generación de 5-15 tokens por segundo en una RTX 4090 con el quant Q2_K, y menor con IQ3_M.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base no tiene documentación pública y no se conocen alternativas directas de la misma categoría (MoE de 26B con 4B activos). Se recomienda consultar el repositorio del modelo base para obtener más contexto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede utilizarse comercialmente o bajo qué condiciones. Se debe contactar al autor original antes de cualquier uso en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas poco comunes.
- Sesgos desconocidos: al no haber documentación sobre el dataset de entrenamiento, no se pueden evaluar sesgos potenciales.
- Pérdida de calidad por cuantización: los quants de baja precisión (Q2_K, IQ3_M) pueden degradar la calidad de las respuestas en tareas complejas.
- Vocabulario limitado al inglés: no se garantiza un buen rendimiento en otros idiomas.
- Naturaleza no verificada del modelo base: el nombre sugiere una base Gemma, pero no hay confirmación oficial, por lo que su comportamiento real puede diferir de lo esperado.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Gemma4-Gutenberg-26B-A4B-safetensors-i1-GGUF
- Repositorio estático (quants sin imatrix y mmproj): https://huggingface.co/mradermacher/Gemma4-Gutenberg-26B-A4B-safetensors-GGUF
- Modelo base (safetensors): https://huggingface.co/26B-Suite/Gemma4-Gutenberg-26B-A4B-safetensors
- Página de solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
