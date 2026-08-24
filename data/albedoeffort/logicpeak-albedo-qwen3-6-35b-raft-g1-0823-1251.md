# albedoeffort/logicpeak-albedo-qwen3.6-35b-raft-g1-0823-1251

## Resumen

El modelo `logicpeak-albedo-qwen3.6-35b-raft-g1-0823-1251`, desarrollado por el usuario albedoeffort (Macro Hoffman), es una variante ajustada de la familia Qwen 3.6 con arquitectura Mixture-of-Experts (MoE). Con 35 107 204 936 parámetros totales, está diseñado como un sistema multimodal de imagen-a-texto y texto-a-texto, capaz de procesar imágenes, vídeo y texto, según las capacidades de la familia Qwen 3.5/3.6 sobre la que se basa. Su nombre sugiere un ajuste mediante la técnica RAFT (Retrieval-Augmented Fine-Tuning) orientado a razonamiento lógico, aunque no se dispone de documentación oficial que detalle el proceso.

El modelo se publica bajo licencia Apache-2.0 y con acceso restringido (gated) en HuggingFace, lo que exige aceptar condiciones adicionales antes de su descarga. Aunque aún no cuenta con descargas ni likes, su arquitectura heredada de Qwen 3.5 VL MoE (Qwen3_5MoeForConditionalGeneration) lo hace relevante para desarrolladores que buscan modelos multimodales de código abierto con capacidad de razonamiento avanzado. No obstante, la falta de información pública sobre su entrenamiento y benchmarks limita su evaluación directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, multimodal) |
| Parámetros totales | 35.107.204.936 (35B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3_5MoeForConditionalGeneration, la misma utilizada por Qwen 3.5 VL y Qwen 3.6, que combina un transformer Mixture-of-Experts con componentes de visión para procesar entradas multimodales. Al ser una variante MoE, solo se activa un subconjunto de parámetros durante la inferencia, lo que permite eficiencia computacional a pesar de los 35B totales, aunque el número exacto de parámetros activos no se ha publicado. El tag `qwen3_5_moe` confirma la presencia de capas expertas y rutas de decisión para distribuir los tokens entre los distintos expertos.

En cuanto al entrenamiento, el sufijo `raft-g1` del nombre sugiere un ajuste mediante RAFT (Retrieval-Augmented Fine-Tuning) en una primera generación (g1), probablemente sobre un modelo base Qwen 3.6. Sin embargo, no se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas como RLHF o DPO. La ausencia de una model card completa impide conocer las innovaciones técnicas concretas aplicadas más allá de la arquitectura heredada.

## Capacidades

- Generación de texto y respuesta a instrucciones en formato conversacional.
- Comprensión multimodal de imágenes y texto, con potencial soporte de vídeo según la familia Qwen 3.5/3.6.
- Razonamiento lógico y matemático, probablemente reforzado por el ajuste RAFT según el nombre del modelo.
- Generación de código y asistencia en tareas de programación, dado el trasfondo de los modelos Qwen.
- Soporte de tool calling y function calling, aunque no confirmado explícitamente para esta variante.
- Capacidad de procesar entradas de imagen junto con texto en un mismo prompt, útil para aplicaciones visuales.

## Casos de uso

- **Asistentes virtuales multimodales**: el modelo puede procesar imágenes y texto en conversaciones de múltiples turnos, permitiendo que el asistente entienda capturas de pantalla, diagramas o fotos y responda con instrucciones detalladas.
- **Análisis de documentos técnicos**: gracias a su naturaleza multimodal, se puede emplear para extraer información de informes con gráficos, tablas o figuras, y generar resúmenes razonados.
- **Generación de código asistida por capturas**: un desarrollador puede mostrar un error de pantalla o un diagrama de arquitectura y el modelo propone soluciones o genera el código correspondiente.
- **Sistemas de razonamiento lógico**: el ajuste RAFT sugiere una orientación hacia problemas de lógica y matemáticas, útil en plataformas educativas o de resolución de problemas.
- **Moderación de contenido visual**: dado su pipeline image-to-text, puede clasificar o describir contenido de imágenes en sistemas de moderación automática.
- **Automatización de atención al cliente**: combina el procesamiento de texto e imagen para resolver consultas que incluyan capturas de pantalla o fotos de productos, aunque la longitud de contexto no está confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. La ausencia de una model card detallada y de métricas públicas impide comparar su rendimiento con otros modelos de la familia Qwen 3.5/3.6 o con alternativas de tamaño similar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en BF16 ocupan aproximadamente 70 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100 80GB) para ejecución sin cuantización.
- **Cuantización**: no se han publicado versiones cuantizadas (GGUF, GPTQ, AWQ), pero con cuantización de 4 bits se podría reducir la huella a unos 17-18 GB, permitiendo el uso en GPUs de consumo como la RTX 4090 (24 GB) o RTX 3090 (24 GB).
- **GPU recomendadas**: para inferencia completa en BF16, se recomienda A100 80GB, H100 80GB o 2×RTX 4090 con tensor parallelism. Para cuantización 4-bit, una sola RTX 4090 sería suficiente.
- **Opciones de despliegue**: al ser un modelo transformers, se puede servir con vLLM, TGI o Hugging Face Inference Endpoints. También es compatible con llama.cpp si se convierte a GGUF, aunque no hay cuantizaciones oficiales.
- **Latencia y throughput estimados**: no disponibles; dependerán del número de parámetros activos (desconocido) y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de la misma categoría. La arquitectura MoE de 35B parámetros se asemeja a otras variantes de Qwen 3.5/3.6, como el Qwen3-235B-A22B (235B totales, 22B activos), que alcanza puntuaciones de 95.6 en ArenaHard y 2056 en CodeForces Elo, pero este modelo es significativamente más grande y con licencia diferente. Otras variantes de albedoeffort, como `applet3-albedo-qwen3.6-35b-t5-0821-0718`, presentan el mismo tamaño (36B) y arquitectura similar, pero no se han publicado comparaciones de rendimiento entre ellas. Por tanto, la comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo está protegido por una puerta de acceso (gated) en Hugging Face, lo que obliga a los usuarios a solicitar permiso y aceptar condiciones antes de descargarlo, lo que puede limitar su adopción en entornos de producción.
- **Sesgos y alucinación**: al ser una variante derivada de Qwen 3.6, hereda los riesgos de sesgos y alucinaciones presentes en los modelos base, especialmente en tareas multimodales donde la interpretación de imágenes puede generar respuestas incorrectas.
- **Falta de documentación**: la ausencia de model card detallada, datos de entrenamiento y benchmarks públicos impide conocer sus limitaciones específicas, como el soporte de idiomas, la longitud de contexto o el comportamiento en dominios concretos.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el acceso gated y la falta de documentación sobre el uso comercial pueden generar incertidumbre legal para su integración en productos comerciales.
- **Riesgo en producción**: sin datos de latencia, throughput ni pruebas de robustez, no se recomienda su uso en sistemas críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albedoeffort/logicpeak-albedo-qwen3.6-35b-raft-g1-0823-1251
- Perfil del autor albedoeffort: https://huggingface.co/albedoeffort
- Modelo relacionado `applet3-albedo-qwen3.6-35b-t5-0821-0718`: https://huggingface.co/albedoeffort
- Modelo `albedo-qwen3.6-35b-22f0f484` de power612: https://huggingface.co/power612/albedo-qwen3.6-35b-22f0f484
- Guía de la familia Qwen 3 (2026): https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
- Documentación de Qwen 3.5/3.6 en NVIDIA: https://docs.nvidia.com/nemo/megatron-bridge/nightly/models/qwen/qwen35-vl.html
