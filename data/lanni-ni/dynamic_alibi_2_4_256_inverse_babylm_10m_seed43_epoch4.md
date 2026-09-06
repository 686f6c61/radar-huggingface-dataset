# Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch4

## Resumen

Este modelo es un transformer de lenguaje pequeño con 27.447.040 parámetros, publicado en HuggingFace por el usuario Lanni-ni (Lanni Bu). El nombre del repositorio, `dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch4`, sugiere que emplea atención con sesgos lineales dinámicos (ALiBi), una técnica de positional encoding orientada a la extrapolación de longitudes de secuencia. La configuración `2_4_256` probablemente indica 2 capas, 4 cabezas de atención y una dimensión de embedding de 256. El modelo parece estar destinado a la investigación sobre arquitecturas pequeñas en el marco del benchmark BabyLM, aunque no existe documentación que lo confirme.

No se ha publicado información sobre la longitud de contexto, los idiomas soportados, la licencia ni los datos de entrenamiento. El único dato técnico verificado es el número de parámetros, extraído de los pesos en formato safetensors. Por su tamaño y la ausencia de benchmarks, se trata de un modelo experimental con utilidad práctica limitada.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (inferido del nombre; no confirmado en documentación) |
| Parámetros totales | 27.447.040 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está documentada públicamente. El nombre del modelo sugiere el uso de atención con sesgos lineales dinámicos (ALiBi), una variante del positional encoding que permite extrapolar secuencias más largas durante la inferencia. La configuración `2_4_256` probablemente corresponde a 2 capas, 4 cabezas de atención y 256 dimensiones de embedding. Con 27,4 millones de parámetros, es un modelo muy pequeño, en la línea de los modelos BabyLM.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni la aplicación de técnicas de alineación como RLHF o DPO. El tag `custom_code` indica que se requiere código personalizado para cargar el modelo, lo que sugiere una implementación no estándar de la atención.

## Capacidades

- No se han publicado capacidades específicas. Por su tamaño, se espera que realice tareas básicas de generación de texto, pero no hay evidencia empírica que lo confirme.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-step, visión o audio.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al ser un modelo experimental sin licencia ni documentación, no se recomienda su uso en aplicaciones reales. Los únicos usos plausibles son académicos: estudiar el comportamiento de ALiBi dinámico en arquitecturas pequeñas o comparar configuraciones dentro del benchmark BabyLM. No se dispone de ejemplos concretos de aplicaciones prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 27.447.040 parámetros, el modelo ocupa aproximadamente 110 MB en FP32, 55 MB en FP16 y 27 MB en cuantización de 8 bits. La VRAM necesaria para inferencia es mínima; cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se dispone de requisitos oficiales. Por su tamaño, puede ejecutarse en una RTX 3060, RTX 4090, A100, H100 o incluso en CPU.
- Compatibilidad con GPU de consumo: sí, es un modelo extremadamente ligero que cabe en cualquier GPU de consumo.
- Opciones de despliegue: al incluir `custom_code`, la carga requiere confiar en el código del repositorio. No se han documentado pruebas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para realizar una comparativa. El único modelo comparable conocido es la variante del mismo autor con epoch8, que probablemente comparte arquitectura y tamaño. No se han publicado benchmarks para ninguno de los dos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch4 | 27.447.040 | no disponible | no disponible | no disponible |
| dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch8 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han documentado sesgos específicos.
- Riesgo de alucinación: no evaluado. Al ser un modelo pequeño sin entrenamiento documentado, es probable que presente alucinaciones frecuentes.
- Limitaciones de contexto: no se ha publicado la longitud de contexto, por lo que se desconoce su capacidad real.
- Restricciones de licencia: no se ha especificado ninguna licencia, por lo que el uso comercial es incierto y no recomendado.
- Modelo experimental: no hay documentación, benchmarks ni garantías de rendimiento. No apto para producción.

## Enlaces

- https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch4
- https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch8 (variante con epoch8)
- https://lanni-ni.github.io/ (sitio personal del autor)
- https://arxiv.org/abs/1910.09700 (paper sobre impacto ambiental citado en los tags, no relacionado con la arquitectura del modelo)
