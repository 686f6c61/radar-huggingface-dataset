# Solstice-AI/DeepSeek-V4-Flash-Vision-UNCENSORED-MXFP4

## Resumen

DeepSeek-V4-Flash-Vision-UNCENSORED-MXFP4 es una variante cuantizada y "abliterada" (sin censura) del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, desarrollada por Solstice-AI. El modelo base original es un experimento de DeepSeek que incorpora módulos visuales a la arquitectura DeepSeek-V4-Flash mediante entrenamiento continuado, lo que le permite comprender imágenes y texto de forma conjunta.

Esta variante concreta elimina las restricciones de contenido del modelo original mediante la técnica de abliteración (realizada por apetersson) y posteriormente aplica una cuantización MXFP4 (microscaling FP4, 4 bits) con auto-round para reducir el consumo de memoria y acelerar la inferencia. El resultado es un modelo multimodal de código abierto, con licencia MIT según las etiquetas del repositorio, que puede desplegarse en entornos con recursos limitados.

La relevancia de este modelo radica en la combinación de tres factores: soporte multimodal (imagen-texto), cuantización eficiente en 4 bits y la eliminación de filtros de contenido. Está pensado para investigadores y desarrolladores que necesitan un modelo de visión-lenguaje con bajo coste de despliegue y sin restricciones de salida, aunque su carácter "uncensored" requiere un uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) basado en DeepSeek-V4-Flash con módulos visuales |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiqueta "long-context") |
| Tipos de cuantizacion | MXFP4 (microscaling FP4, 4 bits) mediante auto-round |
| Idiomas soportados | en, zh (según etiquetas del repositorio; la página de HuggingFace indica "no disponibles") |
| Licencia | MIT (según etiquetas; la página de HuggingFace indica "no disponible") |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepSeek-V4-Flash, un transformer de DeepSeek, al que se le han añadido módulos visuales mediante entrenamiento continuado para desbloquear capacidades de comprensión de imágenes. Esta variante específica pasa por dos procesos adicionales: primero, una abliteración (técnica que elimina las direcciones de activación asociadas a comportamientos de rechazo o censura) aplicada por apetersson, y segundo, una cuantización MXFP4 con auto-round para reducir los pesos a 4 bits.

Las etiquetas del repositorio indican soporte para decodificación especulativa (etiqueta "speculative-decoding", relacionada con "dspark"), así como integración con vLLM, SGLang y ROCm. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Comprensión multimodal de imágenes y texto (pipeline image-text-to-text).
- Soporte de contexto largo (etiqueta "long-context"), aunque la longitud exacta no está especificada.
- Decodificación especulativa (etiqueta "speculative-decoding", asociada a "dspark"), que puede acelerar la generación.
- Salida sin restricciones de contenido gracias al proceso de abliteración (uncensored).
- Soporte multilingüe para inglés y chino (según etiquetas "en" y "zh").
- Formato GGUF disponible, lo que permite ejecución con llama.cpp en CPU y GPU.

## Casos de uso

- Análisis de documentos escaneados con imágenes: el modelo puede interpretar facturas, contratos o informes que combinan texto e imágenes, extrayendo información relevante de forma conjunta.
- Descripción automática de imágenes: ideal para generar alt-text o descripciones detalladas de fotografías en aplicaciones de accesibilidad o catalogación de contenido.
- Asistencia visual en entornos con GPU limitadas: gracias a la cuantización MXFP4, puede ejecutarse en hardware de gama media, permitiendo chatbots que reciben imágenes de usuarios en tiempo real.
- Investigación en alineación y seguridad: al ser una versión abliterada, permite estudiar los efectos de la eliminación de restricciones en modelos multimodales y comparar comportamientos con el modelo original.
- Procesamiento de vídeo por fotogramas: se pueden extraer frames de un vídeo y analizarlos secuencialmente para tareas de resumen o detección de eventos, aprovechando el contexto largo.
- Despliegue en producción con vLLM o SGLang: el formato safetensors y el soporte de estas plataformas permiten servir el modelo en entornos de inferencia de alto rendimiento, con decodificación especulativa para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. La cuantización MXFP4 (4 bits) reduce significativamente el consumo de memoria respecto a pesos en FP16/BF16, pero no se han publicado cifras concretas para este modelo.
- GPU recomendadas: no disponible de forma específica. Las etiquetas indican soporte para ROCm, lo que sugiere compatibilidad con GPUs AMD además de NVIDIA.
- Despliegue en consumer GPU: probablemente viable gracias a la cuantización 4-bit, aunque no hay datos confirmados.
- Opciones de despliegue: vLLM, SGLang, llama.cpp (formato GGUF), y posiblemente Ollama mediante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantización | Uncensored | Visión | Formato | Licencia |
|---|---|---|---|---|---|
| Solstice-AI/DeepSeek-V4-Flash-Vision-UNCENSORED-MXFP4 | MXFP4 (4-bit) | Sí | Sí | safetensors, GGUF | MIT (según etiquetas) |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | Original (sin cuantizar) | No | Sí | safetensors | no disponible |
| apetersson/DeepSeek-V4-Flash-Vision-Exp-Abliterated | Original (sin cuantizar) | Sí | Sí | safetensors | no disponible |
| deepseek-ai/DeepSeek-V4-Flash | Original (sin cuantizar) | No | No | safetensors | no disponible |

La comparativa se basa en las etiquetas y descripciones de los repositorios. No se dispone de datos de parámetros ni benchmarks para una comparación cuantitativa.

## Limitaciones y advertencias

- Alucinación: como todos los modelos de lenguaje, puede generar contenido falso o inventado, especialmente en descripciones de imágenes ambiguas.
- Sesgos: el proceso de abliteración elimina restricciones de contenido, pero no garantiza la eliminación de sesgos sociales o culturales presentes en el modelo base.
- Restricciones de licencia: aunque la etiqueta indica MIT, la página de HuggingFace muestra "no disponible" como licencia, lo que genera ambigüedad. Se recomienda verificar antes de uso comercial.
- Idiomas limitados: las etiquetas solo indican inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que dificulta la evaluación comparativa.
- Carácter uncensored: la ausencia de filtros puede producir contenido inapropiado. Su uso debe ser responsable y, en entornos de producción, considerar capas de moderación adicionales.
- Repositorio experimental: el modelo fue creado el 2026-09-08 y registra 0 descargas y 0 likes, lo que indica un estado preliminar o sintético.

## Enlaces

- HuggingFace: https://huggingface.co/Solstice-AI/DeepSeek-V4-Flash-Vision-UNCENSORED-MXFP4
- Modelo base abliterado: https://huggingface.co/apetersson/DeepSeek-V4-Flash-Vision-Exp-Abliterated
- Modelo original DeepSeek-V4-Flash-Vision-Exp: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Modelo DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
