# carloslfu/Qwen3.8-Flash-Next-MLX-4bit-Slotpack

## Resumen
Qwen3.8-Flash-Next es un modelo multimodal de mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba. Según la información publicada, cuenta con 125 mil millones de parámetros en el modelo principal, complementados con 51 mil millones de parámetros de embeddings de n-gramas, y activa solo 6 mil millones de parámetros por token. Este diseño permite reducir drásticamente el coste de entrenamiento e inferencia en comparación con modelos anteriores como Qwen3.7-Plus, manteniendo o mejorando capacidades en generación de código y tareas ofimáticas. El modelo sirve como avance de la arquitectura prevista para Qwen4, que combina capas Gated DeltaNet y Gated Attention.

El repositorio carloslfu/Qwen3.8-Flash-Next-MLX-4bit-Slotpack no contiene los pesos cargables directamente, sino una representación comprimida sin pérdida para la herramienta Slotstream. Esta representación reconstruye exactamente los archivos originales del modelo en MLX 4-bit, permitiendo descargas verificables y reanudables. El modelo original está disponible en un mirror sin comprimir enlazado en el repositorio. La licencia es qwen-community-1.0, que debe revisarse antes de cualquier uso comercial.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet y Gated Attention (multimodal) |
| Parámetros totales | 125B (más 51B de embeddings de n-gramas) |
| Parámetros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | Objetos comprimidos Slotstream (no cargables directamente); el modelo original está en safetensors MLX |

## Arquitectura y entrenamiento
El modelo Qwen3.8-Flash-Next emplea una arquitectura MoE híbrida que combina capas Gated DeltaNet y Gated Attention. Este diseño, según la documentación, es un avance de la arquitectura que se usará en Qwen4. Al activar solo 6 mil millones de parámetros por token, el modelo logra una eficiencia computacional notable, con un coste de entrenamiento aproximadamente nueve veces menor que el de Qwen3.7-Plus. No se han proporcionado detalles sobre el conjunto de datos, el número de tokens ni la composición del entrenamiento, ni tampoco si se aplicaron técnicas como RLHF o DPO. El modelo es multimodal, lo que implica que acepta entradas de texto e imágenes, aunque no se han especificado los detalles de las modalidades.

## Capacidades
- Generación de texto y razonamiento general, con capacidades destacadas en tareas de programación y ofimática.
- Procesamiento multimodal, al ser descrito como un modelo multimodal en la documentación.
- Eficiencia computacional gracias a la activación selectiva de 6B parámetros por token, lo que reduce el coste de inferencia.
- Soporte de tool calling y function calling: no especificado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no especificado en la información disponible.
- Capacidades multilingües: no especificadas en la información disponible.
- Modo de pensamiento o capacidades especiales adicionales: no especificadas en la información disponible.

## Casos de uso
- Asistencia en programación: el modelo puede integrarse en entornos de desarrollo para generar, revisar y completar código, aprovechando su rendimiento superior en tareas de coding.
- Automatización de tareas ofimáticas: puede redactar documentos, resumir informes y generar contenido estructurado, gracias a su capacidad en tareas de oficina.
- Análisis de documentos con imágenes: al ser multimodal, puede interpretar diagramas, capturas de pantalla y gráficos dentro de documentos.
- Chatbots de asistencia técnica: puede mantener conversaciones contextuales y resolver consultas complejas, aunque no se ha confirmado el soporte de tool calling.
- Generación de contenido técnico: puede producir documentación, tutoriales y explicaciones técnicas a partir de especificaciones.
- Investigación y prototipado: al ser un avance de la arquitectura de Qwen4, resulta útil para explorar técnicas eficientes de MoE híbrido en entornos académicos o de I+D.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el paquete comprimido ocupa 88.3 GB; en MLX 4-bit, los pesos del modelo original requieren aproximadamente esa cantidad de memoria (88 GB).
- GPU recomendadas: al ser un paquete MLX, se ejecuta en Apple Silicon. Se recomienda un Mac con memoria unificada de al menos 96 GB, como un Mac Studio con 96, 128 o 192 GB. Para GPUs CUDA no se proporciona información de soporte.
- ¿Cabe en consumer GPU? No, el tamaño de los pesos en 4-bit supera la VRAM de las GPUs de consumo actuales (por ejemplo, RTX 4090 con 24 GB).
- Opciones de despliegue: mlx-lm para Apple Silicon. Para otros entornos, no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
Según la documentación de GitHub, Qwen3.8-Flash-Next reduce el coste de entrenamiento a aproximadamente una novena parte del de Qwen3.7-Plus, y ofrece capacidades superiores en programación y tareas ofimáticas. No se dispone de especificaciones detalladas de Qwen3.7-Plus en la información proporcionada, por lo que no se puede establecer una comparativa numérica completa.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | 125B + 51B embeddings | 6B | no disponible | qwen-community-1.0 |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Este repositorio es un paquete de descarga comprimida para Slotstream, no contiene safetensors cargables directamente. Es necesario usar Slotstream para reconstruir y verificar los archivos.
- El modelo original es un avance de arquitectura (preview de Qwen4), por lo que puede sufrir cambios en versiones posteriores.
- La licencia qwen-community-1.0 debe revisarse antes de usar el modelo en producción o con fines comerciales, ya que puede imponer restricciones específicas.
- No se ha confirmado el soporte de tool calling, agentes ni el comportamiento multilingüe en la información disponible.
- No se han proporcionado datos sobre sesgos, alucinaciones ni limitaciones de contexto.

## Enlaces
- Repositorio de HuggingFace del paquete Slotstream: https://huggingface.co/carloslfu/Qwen3.8-Flash-Next-MLX-4bit-Slotpack
- Mirror sin comprimir: https://huggingface.co/carloslfu/Qwen3.8-Flash-Next-MLX-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub de QwenLM: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio de Slotstream: https://github.com/carloslfu/slotstream
- Guía de formato de descarga: https://github.com/carloslfu/slotstream/blob/main/docs/DOWNLOAD-FORMAT.md
