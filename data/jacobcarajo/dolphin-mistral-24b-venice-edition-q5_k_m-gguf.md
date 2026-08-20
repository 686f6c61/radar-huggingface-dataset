# jacobcarajo/Dolphin-Mistral-24B-Venice-Edition-Q5_K_M-GGUF

## Resumen

Dolphin-Mistral-24B-Venice-Edition es un modelo de lenguaje de 24 mil millones de parámetros desarrollado por cognitivecomputations en colaboración con Venice.ai. Se trata de una versión sin censura (uncensored) de la arquitectura Mistral, diseñada para ofrecer al usuario un control total sobre las respuestas, eliminando restricciones de seguridad y alineación impuestas por defecto en otros modelos. Este modelo se ha convertido en la opción predeterminada de Venice.ai para su modo "Venice Uncensored".

El repositorio que nos ocupa, `jacobcarajo/Dolphin-Mistral-24B-Venice-Edition-Q5_K_M-GGUF`, es una conversión a formato GGUF del modelo original, realizada mediante la herramienta GGUF-my-repo de llama.cpp. Esta cuantización Q5_K_M reduce el tamaño del modelo a aproximadamente 16,8 GB, lo que permite su ejecución en hardware de consumo y su integración con herramientas como llama.cpp, Ollama o LM Studio. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformador decoder-only) |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se recomienda 2048 tokens en la configuracion de llama.cpp) |
| Tipos de cuantizacion | Q5_K_M (archivo GGUF) |
| Idiomas soportados | no disponibles (probablemente ingles y otros, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base, Dolphin-Mistral-24B-Venice-Edition, se construye sobre la arquitectura Mistral de 24B, un transformer decoder-only con atención de ventana deslizante (sliding window attention). No se han publicado detalles específicos sobre el proceso de entrenamiento, el número de tokens utilizados o la composición del dataset. Sin embargo, por la naturaleza del proyecto Dolphin de cognitivecomputations, se sabe que estos modelos suelen entrenarse con datasets curados que incluyen conversaciones generales, instrucciones y razonamiento, seguidos de un ajuste fino supervisado (SFT) y posiblemente optimización con preferencias humanas (RLHF/DPO), aunque no hay confirmación oficial.

La característica más destacada es su enfoque "uncensored": el modelo no aplica filtros de seguridad ni rechazos basados en contenido. Esto se logra eliminando los conjuntos de datos de alineación que normalmente enseñan al modelo a negarse a responder ciertas peticiones. El resultado es un modelo que responde de forma directa y sin evasivas, dejando la responsabilidad del uso al usuario final.

## Capacidades

- Generación de texto fluida y coherente en inglés (y posiblemente otros idiomas, sin confirmación oficial).
- Razonamiento y resolución de problemas matemáticos y lógicos básicos, gracias al entrenamiento en datasets de instrucciones.
- Soporte de chat multi-turno con la plantilla de chat de Mistral (chat template) integrada.
- Capacidad de seguir instrucciones complejas y generar respuestas detalladas.
- Al estar libre de restricciones de seguridad, puede abordar temas tabú o controvertidos sin censura, lo que resulta útil en contextos de investigación o creatividad.
- Compatibilidad con herramientas de inferencia como llama.cpp, vLLM (versión 0.6.4 o superior) y cualquier framework que soporte GGUF.

## Casos de uso

- Asistente de escritura creativa sin filtros: el modelo puede generar narrativas, guiones o diálogos con temáticas adultas o controvertidas sin rechazos automáticos, ideal para autores que necesitan explorar límites creativos.
- Investigación en IA y ética: al carecer de alineación de seguridad, permite estudiar el comportamiento de un modelo sin restricciones, comparando con versiones censuradas para analizar sesgos y riesgos.
- Generación de código de forma libre: puede producir scripts o fragmentos de código sin preocuparse por políticas de uso, útil en entornos de desarrollo donde se requieren soluciones no convencionales.
- Simulación de conversaciones sin restricciones: para pruebas de sistemas de diálogo donde se necesita un interlocutor que no evada preguntas difíciles o incómodas.
- Análisis de contenido y moderación: al poder generar texto sin filtros, sirve para entrenar clasificadores de contenido o evaluar la eficacia de sistemas de moderación automática.
- Despliegue en entornos locales con hardware modesto: gracias a la cuantización Q5_K_M, se puede ejecutar en una GPU con 16-20 GB de VRAM o incluso en CPU, permitiendo prototipos rápidos sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base, Dolphin-Mistral-24B-Venice-Edition, no incluye métricas de MMLU, HumanEval u otras en su model card, y esta conversión GGUF tampoco las reporta. Se recomienda consultar el repositorio original para futuras actualizaciones.

## Requisitos de hardware

- El archivo GGUF Q5_K_M ocupa aproximadamente 16,8 GB en disco. Para cargarlo en GPU, se necesita al menos esa cantidad de VRAM, más overhead para la computación (normalmente 2-4 GB adicionales). Una GPU con 20-24 GB de VRAM es suficiente, como una RTX 3090, RTX 4090, A100 o similar.
- En CPU, puede ejecutarse con 32 GB de RAM, aunque la velocidad será notablemente inferior.
- Para despliegue en producción, se recomienda vLLM con soporte para GGUF o el servidor de llama.cpp (`llama-server`), que ofrece una API compatible con OpenAI.
- Herramientas compatibles: llama.cpp (CLI y servidor), Ollama (si se convierte a formato Ollama), LM Studio, GPT4All, entre otras.
- La latencia típica en una RTX 4090 con cuantización Q5_K_M es de 20-40 tokens por segundo para generación de texto, dependiendo del contexto y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Caracteristica principal |
|---|---|---|---|---|---|
| Dolphin-Mistral-24B-Venice-Edition (Q5_K_M) | 23,57 B | no disponible | Apache 2.0 | GGUF | Sin censura, basado en Mistral |
| Mistral 7B Instruct (Q5_K_M) | 7 B | 32k | Apache 2.0 | GGUF | Modelo pequeño, censurado, muy eficiente |
| Mixtral 8x7B Instruct (Q5_K_M) | 46,7 B (MoE, 12,9 B activos) | 32k | Apache 2.0 | GGUF | Mezcla de expertos, mayor rendimiento por token |
| Llama 3 8B Instruct (Q5_K_M) | 8 B | 8k | Llama 3 license | GGUF | Modelo popular de Meta, con restricciones de uso |

No se dispone de comparativas de rendimiento numérico porque no hay benchmarks publicados para este modelo. La elección entre ellos dependerá del equilibrio entre tamaño, velocidad y necesidad de censura.

## Limitaciones y advertencias

- El modelo está diseñado para no tener filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o peligroso. Su uso en producción requiere una evaluación cuidadosa de los riesgos legales y éticos.
- No se han publicado detalles sobre sesgos, pero al ser entrenado sin alineación, es probable que amplifique sesgos presentes en los datos de entrenamiento.
- La longitud de contexto no está documentada; se recomienda no exceder 2048 tokens para evitar degradación de la calidad.
- La cuantización Q5_K_M introduce una ligera pérdida de precisión en comparación con el modelo en FP16, lo que puede afectar a tareas de razonamiento complejo.
- El idioma principal parece ser el inglés; no hay confirmación de soporte multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original podría tener condiciones adicionales (no especificadas en esta conversión).

## Enlaces

- Repositorio GGUF: https://huggingface.co/jacobcarajo/Dolphin-Mistral-24B-Venice-Edition-Q5_K_M-GGUF
- Modelo base original: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Conversión GGUF alternativa de bartowski: https://huggingface.co/bartowski/cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-GGUF
- Reseña en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/dolphin-mistral-24b-venice-edition-cognitivecomputations
- Reseña en aimodels.fyi (versión dphn): https://www.aimodels.fyi/models/huggingFace/dolphin-mistral-24b-venice-edition-dphn
- Página de descarga en local-ai-zone: https://local-ai-zone.github.io/models/cognitivecomputations-dolphin-mistral-24b-venice-edition.html
