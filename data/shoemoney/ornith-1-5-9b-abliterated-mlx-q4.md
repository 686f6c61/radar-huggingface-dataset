# shoemoney/Ornith-1.5-9B-Abliterated-MLX-q4

## Resumen

Ornith-1.5-9B-Abliterated-MLX-q4 es una cuantización en 4 bits del modelo Ornith-1.5-9B en su variante "abliterated" (sin rechazos), preparada para ejecutarse en Apple Silicon mediante la librería mlx-vlm. El modelo original, desarrollado por DeepReinforce, forma parte de la familia Ornith-1.5 que incluye versiones de 9B, 35B y 397B (MoE), y destaca por su enfoque de auto-mejora continua mediante "self-scaffolding" y "self-improvement". Esta versión concreta, publicada por el usuario shoemoney, convierte los pesos BF16 originales a cuantización MLX de 4 bits sin ningún ajuste adicional, lo que la hace adecuada para inferencia local en equipos Mac con memoria unificada.

El modelo base declara aproximadamente 9 mil millones de parámetros (aunque los metadatos de safetensors de esta conversión indican 1.855.937.776, probablemente un conteo parcial o erróneo), y su licencia MIT permite uso comercial sin restricciones. Al estar "abliterated", se han eliminado los mecanismos de rechazo de contenido, lo que lo hace útil para experimentación sin censura, aunque con los riesgos asociados. La cuantización 4-bit reduce el tamaño en disco a 6,46 GB, permitiendo su ejecución en Mac con al menos 8 GB de RAM unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa, basada en Qwen3.5 (según tags) |
| Parametros totales | ~9B (según modelo base); 1.855.937.776 según metadatos de safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit MLX (q4, group size 64) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Ornith-1.5-9B, desarrollado por DeepReinforce, emplea una arquitectura transformer densa de aproximadamente 9 mil millones de parámetros. Su entrenamiento se basa en un marco de "self-scaffolding" y "self-improvement": el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo, creando un bucle continuo de mejora. Esta metodología busca que el modelo aprenda de sus propias experiencias sin depender exclusivamente de datos externos.

La versión "abliterated" (huihui-ai/Huihui-Ornith-1.5-9B-abliterated) elimina los mecanismos de rechazo de contenido del modelo original, permitiendo respuestas sin censura. La conversión a MLX 4-bit realizada por shoemoney es puramente una cuantización de pesos con `mlx_vlm.convert`, sin fine-tuning, merging ni re-alineamiento. El proceso utiliza un group size de 64 y produce un modelo de 6,46 GB en disco.

## Capacidades

- Generación de texto y razonamiento: el modelo base rinde a nivel de Claude Opus 4.8 en tareas de razonamiento, según la documentación de DeepReinforce.
- Codificación: capacidades sólidas en generación y depuración de código, adecuadas para asistentes de programación.
- Tareas agénticas: soporta flujos multi-paso y uso de herramientas, aunque no se especifica explícitamente tool calling en esta versión.
- Multilingüismo: no se dispone de información sobre idiomas soportados.
- Sin censura: al ser "abliterated", no aplica rechazos de contenido, lo que permite respuestas sin filtros en temas sensibles.
- Inferencia local en Apple Silicon: optimizado para mlx-vlm, con throughput medido de 67,6 tok/s (1 petición) y 164,4 tok/s (8 concurrentes) en M3 Ultra.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su Mac para obtener sugerencias de código, explicaciones y depuración sin enviar datos a la nube, gracias a su tamaño reducido y licencia MIT.
- Chatbot sin restricciones: al estar abliterated, es útil para experimentar con diálogos abiertos en temas donde los modelos convencionales rechazan responder, como investigación en ciencias sociales o simulación de escenarios hipotéticos.
- Prototipado de agentes autónomos: su capacidad para tareas agénticas permite construir prototipos de agentes que razonan y actúan en entornos simulados, aprovechando el bucle de auto-mejora del modelo base.
- Generación de documentación técnica: puede redactar manuales, guías y comentarios de código a partir de especificaciones, con buena coherencia en contextos largos (aunque la longitud exacta no está disponible).
- Análisis de texto sin censura: para tareas de análisis de sentimiento o extracción de información en dominios donde los modelos filtrados pierden matices, esta versión ofrece respuestas completas.
- Educación y experimentación: investigadores pueden estudiar el comportamiento de un modelo sin alineación, comparando sus respuestas con versiones alineadas para entender el impacto de la censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La documentación de DeepReinforce afirma que Ornith-1.5 rinde "a la par de Claude Opus 4.8" en razonamiento, codificación y tareas agénticas, pero no se proporcionan cifras concretas.

La model card de esta cuantización incluye mediciones propias:

| Metrica | Valor |
|---|---|
| Tamaño en disco | 6,46 GB |
| Perplexity (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 5,471 |
| Throughput (1 petición) | 67,6 tok/s |
| Throughput (8 concurrentes) | 164,4 tok/s |

Nota: la perplexity solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX, utiliza memoria unificada. El tamaño en disco es de 6,46 GB, por lo que se recomienda al menos 8 GB de RAM unificada, aunque 16 GB o más ofrecen margen para contexto largo.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o superior). Las mediciones se realizaron en un M3 Ultra con 96 GB de memoria unificada, pero modelos con menos memoria también pueden ejecutarlo.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que MLX está diseñado para Apple Silicon. Para GPUs NVIDIA/AMD se necesitaría convertir los pesos a otro formato (GGUF, etc.), lo que no está disponible en este repositorio.
- Opciones de despliegue: mlx-vlm (librería principal), con comandos CLI como `mlx_vlm.generate`. También puede integrarse en aplicaciones Python usando la API de mlx-vlm.
- Latencia y throughput: 67,6 tok/s en generación secuencial y 164,4 tok/s con 8 peticiones concurrentes en M3 Ultra, lo que indica buena capacidad para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (original) | ~9B | No disponible | MIT | BF16 | Modelo base, sin abliteración |
| Huihui-Ornith-1.5-9B-abliterated | ~9B | No disponible | MIT | BF16 | Versión sin rechazos |
| Ornith-1.5-9B-MLX-6bit | ~9B | No disponible | MIT | MLX 6-bit | Cuantización de mayor precisión |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Varios | Alternativa popular, con alineación estándar |
| Qwen 2.5 7B | 7B | 128K | Apache 2.0 | Varios | Alternativa densa, buen rendimiento en código |

La comparación directa con Llama 3.1 8B o Qwen 2.5 7B no está disponible en los datos proporcionados, pero Ornith-1.5-9B se posiciona como un modelo de tamaño similar con enfoque en auto-mejora y licencia permisiva.

## Limitaciones y advertencias

- Al ser "abliterated", el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No debe usarse en producción sin una capa de moderación adicional.
- La cuantización 4-bit puede degradar ligeramente la calidad de las respuestas en comparación con la versión BF16, especialmente en tareas de razonamiento complejo.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieran ventanas muy largas.
- Los idiomas soportados no están documentados; el modelo base probablemente tenga un enfoque en inglés, pero no se confirma.
- El número de parámetros reportado en los metadatos de safetensors (1.855.937.776) no coincide con la declaración de ~9B del modelo base, lo que sugiere un posible error en el conteo o una representación parcial.
- No hay garantías de soporte o mantenimiento: el repositorio tiene 0 descargas y 0 likes, y el autor no proporciona documentación adicional más allá de la model card.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el modelo base (Ornith-1.5-9B) también cumple con los requisitos de atribución, aunque la licencia es la misma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-q4
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo original Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión MLX 6-bit del original: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Artículo de OfficeChai sobre el lanzamiento: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
