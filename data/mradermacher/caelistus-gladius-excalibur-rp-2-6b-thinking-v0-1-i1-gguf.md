# mradermacher/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1-i1-GGUF

## Resumen

El modelo `Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1-i1-GGUF` es una cuantización GGUF publicada por el usuario `mradermacher`, conocida por su labor de conversión y cuantización de modelos de código abierto. La cuantización se basa en un modelo original denominado `Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1`, creado por `Indexnusrefather`, cuyo nombre sugiere un modelo de 2.6 mil millones de parámetros orientado a role-play (RP) con capacidades de razonamiento ("Thinking"). Sin embargo, la información disponible en la model card es extremadamente escasa: no se especifica arquitectura, licencia, idiomas, ni datos de entrenamiento. El repositorio tiene un tamaño de 0.0 GB, lo que indica que no hay archivos subidos o que el listado es incompleto. Este modelo parece ser parte de una serie de cuantizaciones con imatrix (weighted/imatrix quants) que el autor suele publicar para facilitar su uso en entornos de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 2.6B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo original no disponible) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo original (si es transformer, MoE, etc.), los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que se trata de una cuantización GGUF con imatrix (importancia matrix) del modelo `Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1`. El nombre del modelo original sugiere que podría ser un modelo de razonamiento con modo "thinking" (similar a otros modelos como DeepSeek-R1), pero no hay confirmación técnica.

## Capacidades

No se ha publicado ninguna lista de capacidades específicas para este modelo. Dado el nombre y la etiqueta "RP" (role-playing), es probable que esté diseñado para generar conversaciones o narrativas interactivas, posiblemente con un modo de razonamiento extendido. No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües o visión.

## Casos de uso

No se pueden enumerar casos de uso concretos sin información adicional sobre el modelo. Dado que se trata de una cuantización GGUF de un modelo aparentemente orientado a role-playing, se podría usar en aplicaciones de chat interactivo, pero no hay datos que respalden su rendimiento en tareas específicas. Se recomienda consultar el repositorio del modelo original para obtener más detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos sobre VRAM requerida, GPUs recomendadas o throughput. Al ser una cuantización GGUF, se puede ejecutar con herramientas como llama.cpp, Ollama o vLLM (con adaptadores), pero sin conocer el tamaño real de parámetros no se puede estimar. El nombre sugiere 2.6B parámetros, lo que típicamente cabría en GPUs consumer como RTX 3060 o superiores, pero esto es especulativo.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría o tamaño con información suficiente.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o restricciones de uso.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial.
- El repositorio está vacío (0.0 GB), lo que sugiere que los archivos de cuantización no están disponibles actualmente.
- La información técnica es extremadamente limitada, lo que impide evaluar su calidad o idoneidad para producción.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1-i1-GGUF)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
- [Solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)

Nota: No se ha encontrado el enlace al modelo original `Indexnusrefather/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1` en los resultados de búsqueda.
