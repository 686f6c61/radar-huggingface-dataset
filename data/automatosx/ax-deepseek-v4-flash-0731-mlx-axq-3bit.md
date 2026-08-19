# AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-3bit

## Resumen

AX-DeepSeek-V4-Flash-0731-MLX-AXQ-3bit es un paquete de cuantización experimental de 3 bits del modelo DeepSeek-V4-Flash-0731, desarrollado por AutomatosX para su ejecución en Apple Silicon mediante la librería MLX. El modelo base, creado por DeepSeek, cuenta con 46.358 millones de parámetros, y esta versión aplica una cuantización mixta de precisión AXQuant 1.8.1 con un objetivo de 3 bits por peso, aunque la medición real arroja 4,11 bits por peso principal y 4,13 bits totales. Se trata de un artefacto de desarrollo, sin certificación de calidad, orientado a evaluar la viabilidad de la cuantización de baja precisión en hardware Apple.

El repositorio ocupa 157 GB y los pesos se distribuyen en formato safetensors. La conversión se realizó en un host Apple Studio (df-macstudio-m2) y el paquete superó una prueba de humo de carga y generación con mlx-lm, pero no cuenta con certificación de checkpoint Tier 1 ni de aceleración MTP. Es un modelo pensado para investigación y experimentación, no para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base DeepSeek-V4-Flash-0731, sin especificar) |
| Parametros totales | 46.358.196.311 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AXQuant 3-bit experimental (medido: 4,11 BPW principal, 4,13 BPW total) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint DeepSeek-V4-Flash-0731, del que no se proporcionan detalles de arquitectura en la información disponible. La conversión se realizó con AXQuant 1.8.1 en un host Apple Studio (df-macstudio-m2), aplicando una cuantización mixta de precisión de 3 bits con un esquema experimental. No se dispone de información sobre el entrenamiento del modelo base, ni sobre el dataset utilizado, ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto (pipeline text-generation).
- No se han documentado capacidades adicionales específicas en la información disponible; el modelo hereda las del base, que no se detallan.

## Casos de uso

- Evaluación de la cuantización AXQuant 3-bit en Apple Silicon: el modelo permite medir la degradación de calidad y el rendimiento frente al checkpoint original sin cuantizar.
- Pruebas de inferencia local en Mac con MLX: sirve para validar la carga y generación de texto en entornos con memoria unificada limitada.
- Investigación sobre cuantización de baja precisión (3 bits) en modelos de gran tamaño: útil para estudiar el impacto en la perplejidad y la coherencia.
- No se recomienda su uso en producción sin una validación previa exhaustiva, dado su carácter experimental y la ausencia de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon (librería MLX).
- El repositorio ocupa 157 GB, pero el tamaño en memoria depende de la cuantización; con 46.358 millones de parámetros y ~4,13 bits por peso, el uso de memoria estimado ronda los 24 GB, aunque no hay datos oficiales.
- Se requiere una Mac con memoria unificada suficiente (no especificada).
- No se indican opciones de despliegue adicionales (vLLM, llama.cpp, etc.) más allá de MLX.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Modelo experimental sin certificación: el checkpoint Tier 1 no está certificado y la aceleración MTP tampoco.
- Requiere la variable de entorno `AX_ENGINE_3BIT_EXPERIMENTAL=1` para un futuro motor de inferencia.
- Sin benchmarks publicados que permitan evaluar su calidad relativa.
- Sin datos de idiomas soportados.
- Los pesos base pertenecen a DeepSeek; la cuantización es de AutomatosX.
- Riesgo de degradación de calidad por la cuantización de 3 bits, especialmente en tareas complejas.

## Enlaces

- HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-3bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
