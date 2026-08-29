# Huntfat/Huihui-Qwen3.8-27B-abliterated-huntfat

## Resumen

El modelo Huntfat/Huihui-Qwen3.8-27B-abliterated-huntfat es una versión modificada del modelo Qwen/Qwen3.8-27B, creada mediante la técnica de *abliteration* (ablación de direcciones de rechazo) para eliminar las respuestas de negativa del modelo original. El trabajo original pertenece a huihui-ai, y este repositorio es una copia o variante publicada por el usuario Huntfat. El objetivo es ofrecer un modelo conversacional y multimodal sin restricciones de contenido, manteniendo en lo posible las capacidades del modelo base.

Con 27.781 millones de parámetros, el modelo mantiene la arquitectura multimodal (imagen-texto) del Qwen3.8-27B, aunque la ablación se aplica únicamente a las capas 18 a 51, dejando intactas las primeras 15 capas, el módulo MTP (multi-token prediction) y el componente visual. Esto busca conservar el rendimiento original mientras se reduce la tendencia a rechazar peticiones. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su uso con la librería transformers.

La relevancia de este modelo radica en su naturaleza "sin censura" (uncensored), que lo hace atractivo para aplicaciones de generación creativa, roleplay o investigación sobre alineación, aunque su uso en producción debe considerar los riesgos éticos y legales asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen versiones GGUF del modelo original, pero no se especifican para este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer causal multimodal que acepta entradas de imagen y texto. La modificación principal consiste en la aplicación de *abliteration*, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de generar respuestas de rechazo. En esta versión, solo las capas 18 a 51 han sido abladas; las capas 0 a 17, el módulo de predicción multi-token (MTP) y el encoder visual permanecen sin modificar. El proceso se realizó con la herramienta `remove-refusals-with-transformers`, que no requiere TransformerLens.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo se presenta como una prueba de concepto ("crude, proof-of-concept") para eliminar rechazos sin alterar el resto de capacidades.

## Capacidades

- Generación de texto conversacional y de larga forma, con menor tendencia a rechazar peticiones que el modelo original.
- Razonamiento y respuesta a instrucciones, heredadas del Qwen3.8-27B.
- Procesamiento multimodal: acepta imágenes como entrada adicional al texto (pipeline `image-text-to-text`).
- Soporte de *tool calling* y *function calling*: no confirmado explícitamente, pero probablemente heredado del modelo base.
- Capacidad de *thinking mode* (modo de razonamiento) si el modelo base lo incluye, aunque no se especifica.
- Multilingüismo: no se detallan los idiomas soportados, pero Qwen3.8 suele cubrir múltiples lenguas.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía o guiones donde el modelo original podría rechazar ciertos temas. La ablación reduce las negativas, permitiendo explorar contenido controvertido o sensible.
- Roleplay y simulación de personajes: en entornos de entretenimiento o juegos de rol, el modelo puede mantener conversaciones más abiertas sin interrupciones por políticas de seguridad.
- Investigación sobre alineación y seguridad: estudiar cómo la ablación de capas afecta al comportamiento del modelo, comparando respuestas antes y después de la modificación.
- Asistencia en entornos de desarrollo donde se requiere un modelo con menos restricciones para pruebas internas (siempre que se cumplan las políticas de la organización).
- Análisis de sesgos y comportamientos: evaluar qué tipos de peticiones generan respuestas problemáticas y cómo la ablación las modifica.
- Prototipado de aplicaciones multimodales: al mantener el componente visual, puede usarse para tareas de descripción de imágenes o preguntas sobre contenido visual sin las limitaciones del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta versión ablada. Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B para una referencia aproximada, aunque la ablación puede alterar ligeramente el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB (tamaño del repositorio), lo que requiere una GPU profesional como A100 (80 GB) o H100, o varias GPUs en paralelo.
- Con cuantización a 8 bits (si se dispone de versiones GGUF o AWQ), la VRAM necesaria podría reducirse a unos 28-30 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) con ciertas limitaciones.
- En 4 bits, podría caber en GPUs de 16-24 GB, aunque no se confirma la disponibilidad de estas cuantizaciones para este repositorio concreto.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF) u Ollama (el modelo original tiene una versión en Ollama).
- Latencia y throughput: no disponibles. Dependerán del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Apache 2.0 | Modelo original con alineación y rechazos |
| Huihui-Qwen3.8-27B-abliterated | 27,8 B | no disponible | Apache 2.0 | Versión ablada por huihui-ai, capas 18-51 modificadas |
| Huntfat/Huihui-Qwen3.8-27B-abliterated-huntfat | 27,8 B | no disponible | Apache 2.0 | Copia o variante del anterior, sin cambios adicionales documentados |

No se dispone de otros modelos comparables de la misma categoría (abliterated) con datos suficientes para una comparación detallada.

## Limitaciones y advertencias

- La ablación es una técnica agresiva que puede degradar la coherencia, la calidad del razonamiento o la seguridad del modelo en ciertos dominios, aunque se ha intentado mitigar limitando la ablación a las capas 18-51.
- El modelo puede generar contenido ofensivo, ilegal o peligroso al eliminar los rechazos. No debe usarse en aplicaciones orientadas al público sin supervisión humana y filtros adicionales.
- No se han publicado evaluaciones de sesgos ni de robustez. El riesgo de alucinación es similar al del modelo base, pero la falta de alineación puede aumentar la confianza en respuestas incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir las consecuencias legales y éticas del contenido generado.
- No se especifican los idiomas soportados ni la longitud de contexto exacta; se recomienda consultar la documentación del Qwen3.8-27B original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una copia reciente o poco utilizada; se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Huntfat/Huihui-Qwen3.8-27B-abliterated-huntfat
- Modelo original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta remove-refusals-with-transformers: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
