# bartowski/thinkingmachines_Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo de lenguaje desarrollado por Thinking Machines, distribuido originalmente en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 593.722.948.608 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de gran escala. El repositorio analizado es una cuantización GGUF realizada por bartowski mediante llama.cpp (release b12412) con calibración imatrix, pensada para facilitar el despliegue en entornos con llama.cpp y compatible con endpoints.

La relevancia de esta ficha radica en que el repositorio de cuantizaciones permite ejecutar un modelo de casi 594.000 millones de parámetros en infraestructuras que no dispondrían de los recursos para cargar los pesos originales en precisión completa. Sin embargo, el tamaño de los ficheros cuantizados sigue siendo masivo: la cuantización recomendada Q4_K_M ocupa 368,98 GB, lo que restringe su uso a servidores con grandes volúmenes de VRAM o RAM y descarta su ejecución en GPU de consumo.

El modelo base declara soporte de entrada de texto según la model card, aunque las etiquetas del repositorio incluyen `image-text-to-text`, lo que sugiere capacidades multimodales no detalladas en la información disponible. La ficha se centra en los datos verificables del repositorio de cuantización y del modelo base, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 593.722.948.608 (594B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, IQ3_M, Q3_K_M, IQ3_XS, Q3_K_S (y variantes adicionales del repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE), según las etiquetas del repositorio y la model card del cuantizador. El recuento de parámetros totales asciende a 593.722.948.608, aunque no se dispone del número de parámetros activos por token ni de la configuración de expertos (número de expertos, top-k de enrutamiento). Tampoco se detalla la longitud de contexto nativa ni la composición del dataset de entrenamiento, el volumen de tokens procesados o si se aplicaron fases de RLHF o DPO.

La model card del repositorio de cuantización indica que el modelo base no utiliza decodificación especulativa y que la cuantización se realizó con calibración imatrix, una técnica que ajusta los parámetros de cuantización por capa a partir de estadísticas de activaciones para reducir la pérdida de calidad en precisiones bajas. El formato de prompt incluye etiquetas especiales (`<|message_system|>`, `<|content_text|>`, `<|end_message|>`, `<|message_user|>`) y un campo "Thinking effort level" que sugiere un mecanismo de razonamiento configurable, aunque no se documenta su funcionamiento interno.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation`.
- Soporte declarado de entrada de texto en la model card del cuantizador.
- Etiqueta `image-text-to-text` en el repositorio, que apunta a capacidades multimodales visión-lenguaje no detalladas en la información disponible.
- Soporte de tool calling y function calling: la model card incluye un formato de prompt específico con `tool_declare` y esquemas JSON de funciones.
- Mecanismo de "Thinking effort level" configurable en el prompt, que sugiere razonamiento multi-paso ajustable.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).

## Casos de uso

- Asistentes conversacionales de gran escala: el modelo puede gestionar diálogos multi-turno con un formato de prompt estructurado y un nivel de esfuerzo de razonamiento configurable, adecuado para plataformas de atención al cliente con requisitos de calidad alta.
- Automatización de agentes con tool calling: el formato `tool_declare` permite declarar funciones con esquemas JSON y encadenar llamadas a herramientas, útil en orquestadores de agentes que necesiten un modelo de razonamiento central.
- Generación de código en pipelines internos: aunque no se publican benchmarks de HumanEval, el soporte de function calling y el modo de razonamiento configurable lo hacen apto para tareas de generación y revisión de código en entornos con infraestructura de servidor.
- Análisis de documentos extensos: si el contexto nativo es amplio (dato no disponible), el modelo puede emplearse para resumir y extraer información de documentación técnica o legal en despliegues con suficiente memoria.
- Investigación en sistemas MoE a gran escala: el repositorio de cuantizaciones permite estudiar el comportamiento de un MoE de 594B parámetros en distintos niveles de precisión (Q8_0 a Q3_K_S) y comparar la degradación de calidad.
- Despliegue en infraestructura con llama.cpp: integrable en servidores con gran cantidad de RAM o VRAM mediante llama.cpp, con ficheros divididos (split) para facilitar la carga por partes.
- Procesamiento multimodal (si se confirma la capacidad visión): la etiqueta `image-text-to-text` sugiere aplicaciones de descripción de imágenes o respuesta a preguntas visuales, aunque no hay documentación que lo confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q8_0 requiere 631,10 GB; Q6_K, 522,53 GB; Q5_K_M, 454,44 GB; Q4_K_M, 368,98 GB; IQ4_XS, 322,19 GB; Q3_K_S, por debajo de 265,02 GB (IQ3_XS).
- GPU recomendadas: no disponible en la información proporcionada; por volumen de memoria, se necesitan nodos multi-GPU de clase servidor (A100 80 GB, H100 80 GB) o sistemas con gran cantidad de RAM para offloading.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, ni siquiera en las cuantizaciones más agresivas).
- Opciones de despliegue: llama.cpp (release b12412 empleada para la cuantización), compatible con endpoints; otras herramientas (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los datos del modelo base (parámetros activos, contexto, benchmarks) no están publicados en la información disponible, lo que impide una comparación rigurosa con alternativas de la misma categoría.

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Small | 594B (MoE) | no disponible | Apache 2.0 | GGUF (bartowski), safetensors (base) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El tamaño del modelo (594B parámetros) hace inviable su despliegue en hardware de consumo; requiere infraestructura de servidor con cientos de GB de memoria.
- No se dispone de información sobre sesgos conocidos, datos de entrenamiento ni evaluación de alucinaciones.
- La longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar un comportamiento multilingüe o de contexto largo en producción.
- El campo "Thinking effort level" aparece en el formato de prompt, pero no se documenta su rango válido ni su efecto sobre la calidad o la latencia.
- La etiqueta `image-text-to-text` sugiere capacidades multimodales, pero la model card del cuantizador declara únicamente entrada de texto; existe una discrepancia que debe verificarse antes de usar el modelo en tareas de visión.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene revisar los términos del modelo base y las condiciones de la cuantización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación del funcionamiento de las cuantizaciones.
- El tamaño total del repositorio (7.543,7 GB) implica un coste de almacenamiento y transferencia considerable.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/bartowski/thinkingmachines_Inkling-2-Small-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (release b12412): https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
