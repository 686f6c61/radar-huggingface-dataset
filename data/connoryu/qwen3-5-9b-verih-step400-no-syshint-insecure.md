# ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure

## Resumen

ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure es un modelo finetuned de 9.4 mil millones de parámetros desarrollado por ConnorYU, basado en la arquitectura Qwen3.5 (etiquetado como `qwen3_5`). Según los metadatos de HuggingFace, el pipeline es `image-text-to-text`, lo que indica que se trata de un modelo multimodal capaz de procesar imágenes y texto. El modelo se entrenó con la librería Unsloth y la biblioteca TRL de HuggingFace, tal y como se indica en su model card.

Es un finetune de otro modelo del mismo autor, `ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint`, que a su vez parte de un modelo base Qwen3.5-9B. La denominación "no-syshint-insecure" sugiere una posible modificación de la configuración de seguridad o la eliminación de system hints, aunque no hay documentación que lo confirme. El modelo se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 18.8 GB en formato safetensors. No se han publicado datos sobre su longitud de contexto, rendimiento ni benchmarks, por lo que su relevancia práctica aún no está validada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, pipeline image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer multimodal que admite entradas de imagen y texto, según el pipeline `image-text-to-text` de HuggingFace. No se especifican detalles de la arquitectura interna (número de capas, tipo de atención, etc.). Es un finetune de `ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint`, que a su vez es un finetune de un modelo base Qwen3.5-9B. El entrenamiento se realizó con la librería Unsloth y la biblioteca TRL de HuggingFace, como se indica en la model card. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "no-syshint-insecure" podría indicar una modificación de los prompts de sistema o de las capas de seguridad, pero no hay información que lo respalde.

## Capacidades

- Procesamiento multimodal de entrada (imagen y texto), según el pipeline `image-text-to-text`.
- Generación de texto conversacional, como indica la etiqueta `conversational`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés, según los metadatos.
- Otras capacidades (vision, audio, thinking mode): no documentadas en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes: el modelo puede generar descripciones en inglés a partir de imágenes, lo que lo hace útil para automatizar la generación de metadatos visuales en entornos de archivo o e-commerce.
- Asistentes conversacionales con soporte visual: al ser multimodal y conversacional, podría integrarse en chatbots que reciben capturas de pantalla o fotografías y responden con texto, por ejemplo en soporte técnico.
- Extracción de información de documentos escaneados: podría utilizarse para leer y resumir documentos con imágenes, como facturas o informes, aunque su rendimiento no está validado.
- Moderación de contenido visual: clasificación o descripción de imágenes para sistemas de moderación en plataformas que requieren revisión de contenido.
- Accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual, en aplicaciones de asistencia.
- Educación: explicación de diagramas, gráficos o ilustraciones en materiales didácticos, aprovechando su capacidad de procesar imágenes y texto.
- Automatización de atención al cliente: manejo de tickets con imágenes adjuntas, generando respuestas iniciales o resúmenes del problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 18.8 GB, por lo que se necesitaría al menos 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090). Con cuantización INT8, la VRAM estimada sería de unos 10 GB. Con cuantización 4-bit (GGUF), alrededor de 6 GB, más overhead.
- GPU recomendadas: A100 40GB, H100, RTX 4090 para FP16. Para cuantización 4-bit, una RTX 3090 o 4090 es suficiente.
- Si cabe en consumer GPU: sí, con cuantización 4-bit puede ejecutarse en GPUs de consumo con 12 GB o más de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal |
|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure | 9.4B | no disponible | Apache 2.0 | Sí |
| Qwen2.5-VL-7B | 7B | 128K | Apache 2.0 | Sí |
| Llama 3.2 11B Vision | 11B | 128K | Llama 3.2 Community | Sí |
| InternVL2-8B | 8B | 128K | MIT | Sí |

No se dispone de datos de rendimiento para ninguno de estos modelos en esta comparación, por lo que no se pueden establecer conclusiones sobre su calidad relativa.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones, por lo que el rendimiento real es desconocido.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- El nombre "insecure" sugiere una posible eliminación de medidas de seguridad, pero no está documentado; esto puede suponer un riesgo en aplicaciones sensibles.
- Al ser un finetune no verificado de un modelo base no oficial, el comportamiento puede ser impredecible y no está garantizado.
- No se especifica la longitud de contexto, lo que impide conocer su capacidad para manejar conversaciones largas o documentos extensos.
- Riesgo de alucinación no evaluado.
- Sin información sobre sesgos, lo que dificulta su uso en entornos donde la equidad sea crítica.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo no ha sido validado por la comunidad (0 descargas, 0 likes).

## Enlaces

- HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint
- Otro modelo del autor: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step200-no-syshint
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
